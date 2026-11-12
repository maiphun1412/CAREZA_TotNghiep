import json
from django.test import TestCase, Client
from django.db import transaction
from apps.authentication.models import Users, Roles, AuthTokens, LoginEvents
from apps.authentication.services.auth_service import hash_password, verify_password, AuthService


class AuthenticationFlowTests(TestCase):
    """
    Bộ kiểm tra chính thức cho luồng Authentication & Authorization của CAREZA:
    - Đăng ký Candidate & Employer
    - Đăng nhập, xác thực hash bcrypt
    - Ghi nhận LoginEvents
    - Cấp JWT token và phân quyền
    - Refresh token (Token rotation)
    - Lấy thông tin tài khoản (/api/auth/me/)
    - Đổi mật khẩu
    - Quên và đặt lại mật khẩu qua auth.auth_tokens
    - Đăng xuất
    """

    def setUp(self):
        self.client = Client(SERVER_NAME="localhost")

    def test_01_password_hashing_and_verification(self):
        """Xác thực mã hóa bcrypt và kiểm tra tương thích hash $2y$ / $2b$."""
        raw = "SecurePassword@123"
        hashed = hash_password(raw)
        self.assertTrue(hashed.startswith("$2b$") or hashed.startswith("$2y$"))
        self.assertTrue(verify_password(raw, hashed))
        self.assertFalse(verify_password("WrongPassword", hashed))

        # Kiểm tra giả lập hash tiền tố $2y$ của Laravel/PHP
        fake_2y_hash = "$2y$" + hashed[4:]
        self.assertTrue(verify_password(raw, fake_2y_hash))

    def test_02_register_candidate_flow(self):
        """Kiểm tra API đăng ký ứng viên mới."""
        with transaction.atomic():
            payload = {
                "email": "test_candidate_new@careza.vn",
                "full_name": "Ứng Viên Kiểm Thử",
                "password": "PasswordCandidate@123",
                "confirm_password": "PasswordCandidate@123",
                "account_type": "candidate",
                "phone": "0912345678",
            }
            response = self.client.post(
                "/api/auth/register/",
                data=json.dumps(payload),
                content_type="application/json",
            )
            self.assertEqual(response.status_code, 201)
            res_json = response.json()
            self.assertTrue(res_json["success"])
            self.assertIn("access_token", res_json["data"]["tokens"])
            self.assertEqual(res_json["data"]["user"]["account_type"], "candidate")

            # Rollback để bảo toàn database
            transaction.set_rollback(True)

    def test_03_register_employer_flow(self):
        """Kiểm tra API đăng ký nhà tuyển dụng kèm thông tin doanh nghiệp."""
        with transaction.atomic():
            payload = {
                "email": "test_employer_new@careza.vn",
                "full_name": "Nhà Tuyển Dụng Kiểm Thử",
                "password": "PasswordEmployer@123",
                "confirm_password": "PasswordEmployer@123",
                "account_type": "employer",
                "company_name": "Công Ty Công Nghệ Thử Nghiệm",
            }
            response = self.client.post(
                "/api/auth/register/",
                data=json.dumps(payload),
                content_type="application/json",
            )
            self.assertEqual(response.status_code, 201)
            res_json = response.json()
            self.assertTrue(res_json["success"])
            self.assertEqual(res_json["data"]["user"]["account_type"], "employer")
            self.assertIsNotNone(res_json["data"]["user"]["company"])

            transaction.set_rollback(True)

    def test_04_login_and_jwt_authorization_flow(self):
        """Kiểm tra luồng đăng nhập, lấy access token và gọi API được bảo vệ."""
        with transaction.atomic():
            # Tạo user test tạm trong transaction
            email = "user_for_login_test@careza.vn"
            raw_pwd = "MySecretPassword@123"
            AuthService.register({
                "email": email,
                "full_name": "Người Dùng Đăng Nhập",
                "password": raw_pwd,
                "account_type": "candidate",
            })

            # 1. Đăng nhập sai mật khẩu -> thất bại 400
            failed_resp = self.client.post(
                "/api/auth/login/",
                data=json.dumps({"email": email, "password": "WrongPassword"}),
                content_type="application/json",
            )
            self.assertEqual(failed_resp.status_code, 400)

            # 2. Đăng nhập đúng mật khẩu -> thành công 200
            login_resp = self.client.post(
                "/api/auth/login/",
                data=json.dumps({"email": email, "password": raw_pwd}),
                content_type="application/json",
            )
            self.assertEqual(login_resp.status_code, 200)
            login_data = login_resp.json()["data"]
            access_token = login_data["tokens"]["access_token"]
            refresh_token = login_data["tokens"]["refresh_token"]

            # 3. Lấy thông tin tài khoản /api/auth/me/ với Bearer token
            me_resp = self.client.get(
                "/api/auth/me/",
                HTTP_AUTHORIZATION=f"Bearer {access_token}",
            )
            self.assertEqual(me_resp.status_code, 200)
            self.assertEqual(me_resp.json()["data"]["user"]["email"], email)

            # 4. Refresh token
            refresh_resp = self.client.post(
                "/api/auth/refresh/",
                data=json.dumps({"refresh_token": refresh_token}),
                content_type="application/json",
            )
            self.assertEqual(refresh_resp.status_code, 200)
            new_access_token = refresh_resp.json()["data"]["access_token"]
            self.assertIsNotNone(new_access_token)

            # 5. Đổi mật khẩu
            new_pwd = "BrandNewPassword@456"
            change_resp = self.client.post(
                "/api/auth/change-password/",
                data=json.dumps({
                    "old_password": raw_pwd,
                    "new_password": new_pwd,
                    "confirm_password": new_pwd,
                }),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {new_access_token}",
            )
            self.assertEqual(change_resp.status_code, 200)

            # 6. Đăng nhập lại với mật khẩu mới
            relogin_resp = self.client.post(
                "/api/auth/login/",
                data=json.dumps({"email": email, "password": new_pwd}),
                content_type="application/json",
            )
            self.assertEqual(relogin_resp.status_code, 200)

            # 7. Đăng xuất
            logout_resp = self.client.post(
                "/api/auth/logout/",
                data=json.dumps({"refresh_token": relogin_resp.json()["data"]["tokens"]["refresh_token"]}),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {relogin_resp.json()["data"]["tokens"]["access_token"]}",
            )
            self.assertEqual(logout_resp.status_code, 200)

            transaction.set_rollback(True)

    def test_05_forgot_and_reset_password_flow(self):
        """Kiểm tra quy trình quên mật khẩu và đặt lại mật khẩu qua token."""
        with transaction.atomic():
            email = "user_forgot_pwd@careza.vn"
            AuthService.register({
                "email": email,
                "full_name": "Người Dùng Quên Mật Khẩu",
                "password": "InitialPassword@123",
                "account_type": "candidate",
            })

            # Yêu cầu đặt lại mật khẩu
            forgot_resp = self.client.post(
                "/api/auth/forgot-password/",
                data=json.dumps({"email": email}),
                content_type="application/json",
            )
            self.assertEqual(forgot_resp.status_code, 200)
            reset_token = forgot_resp.json()["data"]["reset_token"]
            self.assertIsNotNone(reset_token)

            # Đặt lại mật khẩu mới
            new_password = "ResetSuccessful@999"
            reset_resp = self.client.post(
                "/api/auth/reset-password/",
                data=json.dumps({
                    "token": reset_token,
                    "password": new_password,
                    "confirm_password": new_password,
                }),
                content_type="application/json",
            )
            self.assertEqual(reset_resp.status_code, 200)

            # Đăng nhập bằng mật khẩu mới
            login_resp = self.client.post(
                "/api/auth/login/",
                data=json.dumps({"email": email, "password": new_password}),
                content_type="application/json",
            )
            self.assertEqual(login_resp.status_code, 200)

            transaction.set_rollback(True)

    def test_06_role_based_access_control(self):
        """Kiểm tra phân quyền Candidate, Employer, Admin qua Permissions."""
        from rest_framework.test import APIRequestFactory
        from apps.authentication.permissions import IsCandidate, IsEmployer, IsAdmin

        factory = APIRequestFactory()

        # Giả lập candidate user
        candidate_user = Users(id=991, email="cand@careza.vn", account_type="candidate", is_active=True)
        cand_req = factory.get("/api/test/")
        cand_req.user = candidate_user
        cand_req.auth = {"roles": ["candidate"]}

        self.assertTrue(IsCandidate().has_permission(cand_req, None))
        self.assertFalse(IsEmployer().has_permission(cand_req, None))
        self.assertFalse(IsAdmin().has_permission(cand_req, None))

        # Giả lập employer user
        employer_user = Users(id=992, email="emp@careza.vn", account_type="employer", is_active=True)
        emp_req = factory.get("/api/test/")
        emp_req.user = employer_user
        emp_req.auth = {"roles": ["employer", "recruiter"], "company": {"company_id": 1}}

        self.assertFalse(IsCandidate().has_permission(emp_req, None))
        self.assertTrue(IsEmployer().has_permission(emp_req, None))
        self.assertFalse(IsAdmin().has_permission(emp_req, None))

        # Giả lập admin user
        admin_user = Users(id=993, email="adm@careza.vn", account_type="admin", is_active=True)
        adm_req = factory.get("/api/test/")
        adm_req.user = admin_user
        adm_req.auth = {"roles": ["admin"]}

        self.assertFalse(IsCandidate().has_permission(adm_req, None))
        self.assertFalse(IsEmployer().has_permission(adm_req, None))
        self.assertTrue(IsAdmin().has_permission(adm_req, None))

