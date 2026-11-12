import json
from datetime import datetime, timezone
from django.db import connection, transaction
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError

from apps.authentication.models import Users, Roles, UserRoles
from apps.company.models import Companies, Branding, Branches, Members, VerificationRequests
from apps.system.models import Industries, Locations


class CompanyService:
    @staticmethod
    def get_company_for_user(user_id: int) -> Companies:
        """Lấy công ty mà người dùng đang là thành viên active."""
        member = Members.objects.filter(user_id=user_id, status="active").first()
        if not member:
            raise PermissionDenied("Bạn chưa tham gia hoặc chưa được kích hoạt trong bất kỳ doanh nghiệp nào.")
        return member.company

    @staticmethod
    def check_is_owner_or_admin(user_id: int, company_id: int) -> bool:
        """Kiểm tra người dùng có quyền quản trị doanh nghiệp (owner, company_admin)."""
        member = Members.objects.filter(
            company_id=company_id, user_id=user_id, status="active"
        ).first()
        if not member:
            return False
        return member.member_role in ("owner", "company_admin", "1", "2")

    # ==========================================
    # 1. Quản lý thông tin doanh nghiệp & Branding
    # ==========================================
    @staticmethod
    def get_company_detail(user_id: int) -> dict:
        company = CompanyService.get_company_for_user(user_id)
        branding = Branding.objects.filter(company=company).first()
        branches = list(Branches.objects.filter(company=company).values("id", "name", "address", "location_id"))
        member_count = Members.objects.filter(company=company, status="active").count()

        return {
            "id": company.id,
            "name": company.name,
            "slug": company.slug,
            "industry_id": company.industry_id,
            "location_id": company.location_id,
            "website": company.website,
            "logo_url": company.logo_url,
            "description": company.description,
            "company_size": company.company_size,
            "verification_status": company.verification_status,
            "created_at": company.created_at,
            "branding": {
                "banner_url": branding.banner_url if branding else None,
                "slogan": branding.slogan if branding else None,
                "benefits": branding.benefits if branding else [],
                "social_links": branding.social_links if branding else {},
            } if branding else None,
            "branches": branches,
            "active_members_count": member_count,
        }

    @staticmethod
    def update_company_info(user_id: int, data: dict) -> dict:
        company = CompanyService.get_company_for_user(user_id)

        # Cập nhật thông tin cơ bản
        updatable = ["name", "industry_id", "location_id", "website", "logo_url", "description", "company_size"]
        for field in updatable:
            if field in data:
                setattr(company, field, data[field])
        company.save()

        # Cập nhật branding nếu có
        branding_data = data.get("branding") or {}
        for b_field in ["banner_url", "slogan", "benefits", "social_links"]:
            if b_field in data:
                branding_data[b_field] = data[b_field]

        if branding_data:
            branding, _ = Branding.objects.get_or_create(company=company)
            for b_field in ["banner_url", "slogan", "benefits", "social_links"]:
                if b_field in branding_data:
                    setattr(branding, b_field, branding_data[b_field])
            branding.save()

        return CompanyService.get_company_detail(user_id)

    # ==========================================
    # 2. Quản lý Chi nhánh (Branches)
    # ==========================================
    @staticmethod
    def get_branches(user_id: int) -> list:
        company = CompanyService.get_company_for_user(user_id)
        return list(Branches.objects.filter(company=company).values("id", "name", "address", "location_id"))

    @staticmethod
    def create_branch(user_id: int, data: dict) -> dict:
        company = CompanyService.get_company_for_user(user_id)
        name = data.get("name", "").strip()
        if not name:
            raise ValidationError({"name": "Tên chi nhánh không được để trống."})

        branch = Branches.objects.create(
            company=company,
            name=name,
            address=data.get("address", ""),
            location_id=data.get("location_id"),
        )
        return {"id": branch.id, "name": branch.name, "address": branch.address, "location_id": branch.location_id}

    @staticmethod
    def update_branch(user_id: int, branch_id: int, data: dict) -> dict:
        company = CompanyService.get_company_for_user(user_id)
        branch = Branches.objects.filter(id=branch_id, company=company).first()
        if not branch:
            raise NotFound("Không tìm thấy chi nhánh.")

        for f in ["name", "address", "location_id"]:
            if f in data:
                setattr(branch, f, data[f])
        branch.save()
        return {"id": branch.id, "name": branch.name, "address": branch.address, "location_id": branch.location_id}

    @staticmethod
    def delete_branch(user_id: int, branch_id: int) -> None:
        company = CompanyService.get_company_for_user(user_id)
        branch = Branches.objects.filter(id=branch_id, company=company).first()
        if not branch:
            raise NotFound("Không tìm thấy chi nhánh để xóa.")
        branch.delete()

    # ==========================================
    # 3. Quản lý Thành viên & Phân quyền (Members)
    # ==========================================
    @staticmethod
    def get_members(user_id: int) -> list:
        company = CompanyService.get_company_for_user(user_id)
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT m.id, m.user_id, u.full_name, u.email, u.phone, m.member_role, m.status, m.joined_at
                FROM company.members m
                JOIN auth.users u ON m.user_id = u.id
                WHERE m.company_id = %s
                ORDER BY m.joined_at ASC;
            """, [company.id])
            rows = cursor.fetchall()

        return [
            {
                "id": r[0],
                "user_id": r[1],
                "full_name": r[2],
                "email": r[3],
                "phone": r[4],
                "member_role": r[5],
                "status": r[6],
                "joined_at": r[7],
            }
            for r in rows
        ]

    @staticmethod
    def invite_or_add_member(user_id: int, data: dict) -> dict:
        company = CompanyService.get_company_for_user(user_id)
        if not CompanyService.check_is_owner_or_admin(user_id, company.id):
            raise PermissionDenied("Chỉ chủ doanh nghiệp hoặc quản trị viên mới có quyền mời thành viên mới.")

        email = data.get("email", "").strip().lower()
        member_role = data.get("member_role", "recruiter")

        target_user = Users.objects.filter(email__iexact=email).first()
        if not target_user:
            raise ValidationError({"email": "Không tìm thấy tài khoản với email này trong hệ thống CAREZA."})

        # Kiểm tra đã là thành viên của công ty này chưa
        existing = Members.objects.filter(company=company, user_id=target_user.id).first()
        if existing:
            if existing.status == "active":
                raise ValidationError({"email": "Người dùng này đã là thành viên hoạt động của doanh nghiệp."})
            else:
                existing.status = "active"
                existing.member_role = member_role
                existing.save()
                return {"id": existing.id, "email": email, "member_role": member_role, "status": "active"}

        now = datetime.now(timezone.utc)
        with transaction.atomic():
            member = Members.objects.create(
                company=company,
                user_id=target_user.id,
                member_role=member_role,
                status="active",
                joined_at=now,
            )
            # Gán thêm role employer cho user nếu chưa có
            role_emp = Roles.objects.filter(code="employer").first()
            if role_emp and not UserRoles.objects.filter(user=target_user, role=role_emp).exists():
                UserRoles.objects.create(user=target_user, role=role_emp)

        return {"id": member.id, "email": email, "member_role": member_role, "status": "active"}

    @staticmethod
    def update_member_role(user_id: int, member_id: int, data: dict) -> dict:
        company = CompanyService.get_company_for_user(user_id)
        if not CompanyService.check_is_owner_or_admin(user_id, company.id):
            raise PermissionDenied("Chỉ chủ doanh nghiệp hoặc quản trị viên mới có quyền thay đổi vai trò thành viên.")

        member = Members.objects.filter(id=member_id, company=company).first()
        if not member:
            raise NotFound("Không tìm thấy thành viên trong doanh nghiệp.")

        # Không cho phép tự đổi quyền của chính mình nếu là owner duy nhất
        if member.user_id == user_id and member.member_role == "owner" and data.get("member_role") != "owner":
            raise ValidationError({"member_role": "Chủ sở hữu không thể tự hạ quyền của chính mình."})

        if "member_role" in data:
            member.member_role = data["member_role"]
        if "status" in data:
            member.status = data["status"]

        member.save()
        return {"id": member.id, "user_id": member.user_id, "member_role": member.member_role, "status": member.status}

    @staticmethod
    def remove_member(user_id: int, member_id: int) -> None:
        company = CompanyService.get_company_for_user(user_id)
        if not CompanyService.check_is_owner_or_admin(user_id, company.id):
            raise PermissionDenied("Chỉ chủ doanh nghiệp hoặc quản trị viên mới có quyền xóa thành viên.")

        member = Members.objects.filter(id=member_id, company=company).first()
        if not member:
            raise NotFound("Không tìm thấy thành viên để xóa.")

        if member.user_id == user_id:
            raise ValidationError({"detail": "Bạn không thể tự xóa chính mình khỏi doanh nghiệp."})

        member.status = "inactive"
        member.save(update_fields=["status"])

    # ==========================================
    # 4. Yêu cầu xác minh doanh nghiệp (Verification)
    # ==========================================
    @staticmethod
    def get_verification_status(user_id: int) -> dict:
        company = CompanyService.get_company_for_user(user_id)
        request_obj = VerificationRequests.objects.filter(company=company).order_by("-created_at").first()

        return {
            "company_id": company.id,
            "verification_status": company.verification_status,
            "latest_request": {
                "id": request_obj.id,
                "legal_name": request_obj.legal_name,
                "tax_code": request_obj.tax_code,
                "document_url": request_obj.document_url,
                "status": request_obj.status,
                "notes": request_obj.notes,
                "created_at": request_obj.created_at,
                "reviewed_at": request_obj.reviewed_at,
            } if request_obj else None,
        }

    @staticmethod
    def submit_verification(user_id: int, data: dict) -> dict:
        company = CompanyService.get_company_for_user(user_id)
        legal_name = data.get("legal_name", "").strip() or company.name
        tax_code = data.get("tax_code", "").strip()
        document_url = data.get("document_url", "").strip()

        if not tax_code:
            raise ValidationError({"tax_code": "Mã số thuế doanh nghiệp không được để trống."})

        now = datetime.now(timezone.utc)
        req = VerificationRequests.objects.create(
            company=company,
            submitted_by=user_id,
            legal_name=legal_name,
            tax_code=tax_code,
            document_url=document_url,
            status="pending",
            created_at=now,
        )

        company.verification_status = "pending"
        company.save(update_fields=["verification_status"])

        return {
            "id": req.id,
            "status": req.status,
            "legal_name": req.legal_name,
            "tax_code": req.tax_code,
            "created_at": req.created_at,
        }

    # ==========================================
    # 5. Nhật ký hoạt động (Audit Logs)
    # ==========================================
    @staticmethod
    def get_company_activities(user_id: int) -> list:
        company = CompanyService.get_company_for_user(user_id)
        from apps.system.models import AuditLogs

        # Lấy danh sách user_id của thành viên công ty
        member_user_ids = list(Members.objects.filter(company=company).values_list("user_id", flat=True))

        logs = AuditLogs.objects.filter(
            actor_id__in=member_user_ids
        ).order_by("-created_at")[:50]

        results = []
        from apps.authentication.models import Users
        for l in logs:
            actor = Users.objects.filter(id=l.actor_id).first() if l.actor_id else None
            results.append({
                "id": l.id,
                "actor_id": l.actor_id,
                "actor_name": actor.full_name if actor else "Hệ thống",
                "actor_email": actor.email if actor else "",
                "actor_avatar": actor.avatar_url if actor else None,
                "action": l.action,
                "entity_type": l.entity_type,
                "entity_id": l.entity_id,
                "changes": l.changes,
                "created_at": l.created_at,
            })
        return results

    @staticmethod
    def record_activity(actor_id: int, action: str, entity_type: str, entity_id: int, changes: dict = None) -> None:
        from apps.system.models import AuditLogs
        AuditLogs.objects.create(
            actor_id=actor_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            changes=changes or {},
            created_at=datetime.now(timezone.utc),
        )

