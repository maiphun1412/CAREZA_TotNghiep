import os
import secrets
import hashlib
import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from django.conf import settings
from django.db import connection, transaction
from rest_framework.exceptions import AuthenticationFailed, ValidationError

from apps.authentication.models import Users, Roles, UserRoles, AuthTokens, LoginEvents
from apps.company.models import Companies, Members
from apps.candidate.models import Profiles


def hash_password(raw_password: str) -> str:
    """Mã hóa mật khẩu bằng thuật toán bcrypt."""
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(raw_password.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def verify_password(raw_password: str, hashed_password: str) -> bool:
    """
    Xác thực mật khẩu với hash bcrypt trong database.
    Hỗ trợ cả tiền tố $2y$ (PHP/Laravel chuẩn) và $2b$ (Python bcrypt).
    """
    if not hashed_password or not raw_password:
        return False
    # Chuẩn hóa tiền tố $2y$ thành $2b$ để tương thích thư viện bcrypt của Python
    normalized_hash = hashed_password
    if normalized_hash.startswith('$2y$'):
        normalized_hash = '$2b$' + normalized_hash[4:]

    try:
        return bcrypt.checkpw(raw_password.encode('utf-8'), normalized_hash.encode('utf-8'))
    except Exception:
        return False


def get_token_hash(token: str) -> str:
    """Băm SHA-256 chuỗi token để lưu an toàn vào auth.auth_tokens."""
    return hashlib.sha256(token.encode('utf-8')).hexdigest()


def get_user_roles_list(user_id: int) -> list:
    """Lấy danh sách mã quyền (role codes) của người dùng."""
    return list(
        UserRoles.objects.filter(user_id=user_id)
        .select_related("role")
        .values_list("role__code", flat=True)
    )


def get_user_company_info(user_id: int) -> dict:
    """Lấy thông tin thành viên doanh nghiệp nếu có."""
    member = (
        Members.objects.select_related("company")
        .filter(user_id=user_id, status="active")
        .first()
    )
    if member and member.company:
        return {
            "company_id": member.company_id,
            "company_name": member.company.name,
            "member_role": member.member_role,
            "status": member.status,
        }
    return None


def generate_tokens_for_user(user: Users) -> dict:
    """Sinh cặp JWT Access Token và Refresh Token."""
    now = datetime.now(timezone.utc)
    roles = get_user_roles_list(user.id)
    company_info = get_user_company_info(user.id)

    # 1. Access Token (hiệu lực 24 giờ)
    access_exp = now + timedelta(days=1)
    access_payload = {
        "user_id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "account_type": user.account_type,
        "roles": roles,
        "company": company_info,
        "exp": int(access_exp.timestamp()),
        "iat": int(now.timestamp()),
        "type": "access",
    }
    access_token = jwt.encode(access_payload, settings.SECRET_KEY, algorithm="HS256")

    # 2. Refresh Token (hiệu lực 30 ngày)
    refresh_exp = now + timedelta(days=30)
    refresh_jti = secrets.token_hex(16)
    refresh_payload = {
        "user_id": user.id,
        "jti": refresh_jti,
        "exp": int(refresh_exp.timestamp()),
        "iat": int(now.timestamp()),
        "type": "refresh",
    }
    refresh_token = jwt.encode(refresh_payload, settings.SECRET_KEY, algorithm="HS256")

    # Lưu hash của refresh token vào auth.auth_tokens
    token_hash = get_token_hash(refresh_token)
    AuthTokens.objects.create(
        user=user,
        purpose="refresh",
        token_hash=token_hash,
        expires_at=refresh_exp,
        created_at=now,
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "Bearer",
        "expires_in": 86400,  # 24 hours in seconds
    }


def decode_jwt(token: str, expected_type: str = "access") -> dict:
    """Giải mã và xác thực JWT token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        if payload.get("type") != expected_type:
            raise AuthenticationFailed(f"Token loại '{expected_type}' không hợp lệ.")
        return payload
    except jwt.ExpiredSignatureError:
        raise AuthenticationFailed("Token đã hết hạn sử dụng.")
    except jwt.InvalidTokenError:
        raise AuthenticationFailed("Token không hợp lệ.")


class AuthService:
    @staticmethod
    def register(data: dict) -> dict:
        email = data.get("email", "").strip().lower()
        full_name = data.get("full_name", "").strip()
        password = data.get("password")
        account_type = data.get("account_type", "candidate").strip().lower()
        phone = data.get("phone", "")
        company_name = data.get("company_name", "")

        if Users.objects.filter(email__iexact=email).exists():
            raise ValidationError({"email": "Email này đã được đăng ký trong hệ thống."})

        now = datetime.now(timezone.utc)
        pwd_hash = hash_password(password)

        with transaction.atomic():
            user = Users.objects.create(
                full_name=full_name,
                email=email,
                password_hash=pwd_hash,
                account_type=account_type,
                phone=phone or None,
                is_active=True,
                created_at=now,
                updated_at=now,
            )

            # Gán role mặc định theo account_type
            role_code = "employer" if account_type in ("employer", "company") else "candidate"
            role = Roles.objects.filter(code=role_code).first()
            if role:
                UserRoles.objects.create(user=user, role=role)

            # Khởi tạo hồ sơ bổ sung tương ứng
            if account_type == "candidate":
                Profiles.objects.create(
                    user=user,
                    headline="Ứng viên mới",
                    created_at=now,
                )
            elif account_type in ("employer", "company") and company_name:
                slug = company_name.lower().replace(" ", "-") + f"-{user.id}"
                company = Companies.objects.create(
                    name=company_name,
                    slug=slug,
                    verification_status="unverified",
                    created_at=now,
                )
                Members.objects.create(
                    company=company,
                    user_id=user.id,
                    member_role="owner",
                    status="active",
                    joined_at=now,
                )

        tokens = generate_tokens_for_user(user)
        user_info = AuthService.get_user_info(user)
        return {
            "user": user_info,
            "tokens": tokens,
        }

    @staticmethod
    def login(data: dict, ip_address: str = None, user_agent: str = None) -> dict:
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")
        now = datetime.now(timezone.utc)

        user = Users.objects.filter(email__iexact=email).first()

        # Kiểm tra thông tin tài khoản và mật khẩu
        if not user or not verify_password(password, user.password_hash):
            LoginEvents.objects.create(
                user=user if user else None,
                email_attempt=email,
                success=False,
                ip_address=ip_address,
                user_agent=user_agent,
                created_at=now,
            )
            raise ValidationError({"detail": "Email hoặc mật khẩu không chính xác."})

        if not user.is_active:
            LoginEvents.objects.create(
                user=user,
                email_attempt=email,
                success=False,
                ip_address=ip_address,
                user_agent=user_agent,
                created_at=now,
            )
            raise ValidationError({"detail": "Tài khoản của bạn đã bị khóa hoặc chưa kích hoạt."})

        # Ghi sự kiện đăng nhập thành công
        LoginEvents.objects.create(
            user=user,
            email_attempt=email,
            success=True,
            ip_address=ip_address,
            user_agent=user_agent,
            created_at=now,
        )

        user.updated_at = now
        user.save(update_fields=["updated_at"])

        tokens = generate_tokens_for_user(user)
        user_info = AuthService.get_user_info(user)
        return {
            "user": user_info,
            "tokens": tokens,
        }

    @staticmethod
    def refresh_token(refresh_token_str: str) -> dict:
        payload = decode_jwt(refresh_token_str, expected_type="refresh")
        user_id = payload.get("user_id")

        token_hash = get_token_hash(refresh_token_str)
        now = datetime.now(timezone.utc)

        auth_token = AuthTokens.objects.filter(
            token_hash=token_hash,
            purpose="refresh",
            used_at__isnull=True,
            expires_at__gt=now,
        ).first()

        if not auth_token:
            raise AuthenticationFailed("Refresh token không tồn tại, đã được sử dụng hoặc hết hạn.")

        user = Users.objects.filter(id=user_id, is_active=True).first()
        if not user:
            raise AuthenticationFailed("Người dùng không tồn tại hoặc đã bị vô hiệu hóa.")

        # Thu hồi refresh token cũ và cấp cặp token mới (Token Rotation)
        auth_token.used_at = now
        auth_token.save(update_fields=["used_at"])

        return generate_tokens_for_user(user)

    @staticmethod
    def logout(refresh_token_str: str = None, user: Users = None) -> None:
        now = datetime.now(timezone.utc)
        if refresh_token_str:
            token_hash = get_token_hash(refresh_token_str)
            AuthTokens.objects.filter(token_hash=token_hash, purpose="refresh").update(used_at=now)
        elif user:
            AuthTokens.objects.filter(user=user, purpose="refresh", used_at__isnull=True).update(used_at=now)

    @staticmethod
    def change_password(user: Users, old_password: str, new_password: str) -> None:
        if not verify_password(old_password, user.password_hash):
            raise ValidationError({"old_password": "Mật khẩu hiện tại không chính xác."})

        if len(new_password) < 6:
            raise ValidationError({"new_password": "Mật khẩu mới phải có ít nhất 6 ký tự."})

        now = datetime.now(timezone.utc)
        user.password_hash = hash_password(new_password)
        user.updated_at = now
        user.save(update_fields=["password_hash", "updated_at"])

        # Hủy các refresh token cũ để buộc đăng nhập lại
        AuthTokens.objects.filter(user=user, purpose="refresh", used_at__isnull=True).update(used_at=now)

    @staticmethod
    def forgot_password(email: str) -> dict:
        user = Users.objects.filter(email__iexact=email.strip().lower()).first()
        # Để đảm bảo bảo mật, luôn trả về thông báo thành công dù email có tồn tại hay không
        if not user:
            return {"message": "Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi."}

        now = datetime.now(timezone.utc)
        reset_token = secrets.token_urlsafe(32)
        token_hash = get_token_hash(reset_token)
        expires_at = now + timedelta(hours=1)

        AuthTokens.objects.create(
            user=user,
            purpose="password_reset",
            token_hash=token_hash,
            expires_at=expires_at,
            created_at=now,
        )

        return {
            "message": "Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi.",
            "reset_token": reset_token,  # Trả về token phục vụ dev/test môi trường local
        }

    @staticmethod
    def reset_password(reset_token: str, new_password: str) -> None:
        if len(new_password) < 6:
            raise ValidationError({"new_password": "Mật khẩu mới phải có ít nhất 6 ký tự."})

        token_hash = get_token_hash(reset_token)
        now = datetime.now(timezone.utc)

        auth_token = AuthTokens.objects.filter(
            token_hash=token_hash,
            purpose="password_reset",
            used_at__isnull=True,
            expires_at__gt=now,
        ).first()

        if not auth_token:
            raise ValidationError({"token": "Mã xác thực đặt lại mật khẩu không hợp lệ hoặc đã hết hạn."})

        user = auth_token.user
        user.password_hash = hash_password(new_password)
        user.updated_at = now
        user.save(update_fields=["password_hash", "updated_at"])

        # Đánh dấu token đã sử dụng
        auth_token.used_at = now
        auth_token.save(update_fields=["used_at"])

    @staticmethod
    def get_user_info(user: Users) -> dict:
        roles = get_user_roles_list(user.id)
        company_info = get_user_company_info(user.id)
        return {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "phone": user.phone,
            "avatar_url": user.avatar_url,
            "account_type": user.account_type,
            "is_active": user.is_active,
            "email_verified_at": user.email_verified_at,
            "roles": roles,
            "company": company_info,
            "created_at": user.created_at,
        }
