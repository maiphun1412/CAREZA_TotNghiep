import json
from datetime import datetime, timezone
import unittest
from django.test import Client
from django.db import transaction

from apps.authentication.models import Users
from apps.authentication.services.auth_service import generate_tokens_for_user
from apps.company.models import Companies, VerificationRequests
from apps.recruitment.models import Jobs
from apps.system.models import Industries, Skills, AuditLogs


class AdminModuleTests(unittest.TestCase):
    """
    Bộ kiểm tra chính thức cho toàn bộ luồng Admin (Quản trị hệ thống):
    1. Dashboard thống kê tổng quan
    2. Quản lý người dùng: tìm kiếm, lọc, khóa/mở khóa, đổi roles, reset password
    3. Quản lý & duyệt xác minh doanh nghiệp
    4. Kiểm duyệt tin tuyển dụng (Approve / Hide)
    5. Quản lý danh mục (Ngành nghề, Kỹ năng, Địa điểm)
    6. Quản lý Gói dịch vụ, Đơn hàng & Báo cáo vi phạm
    7. Cấu hình hệ thống, Audit logs, AI usage & Gửi thông báo hệ thống
    8. Bảo mật phân quyền: Candidate / Employer bị chặn 403 Forbidden
    """

    def setUp(self):
        self.client = Client(SERVER_NAME="localhost")

    def get_admin_token(self):
        admin_user = Users.objects.filter(account_type="admin", is_active=True).first()
        self.assertIsNotNone(admin_user)
        return generate_tokens_for_user(admin_user)["access_token"]

    def test_01_admin_dashboard(self):
        """Kiểm tra API dashboard thống kê tổng quan cho Admin."""
        token = self.get_admin_token()
        resp = self.client.get(
            "/api/admin/dashboard/",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()["data"]
        self.assertIn("summary", data)
        self.assertIn("total_users", data["summary"])
        self.assertIn("total_companies", data["summary"])
        self.assertIn("total_jobs", data["summary"])
        self.assertIn("monthly_growth", data)
        self.assertIn("industry_jobs", data)

    def test_02_admin_user_management(self):
        """Kiểm tra quản lý người dùng: danh sách, chi tiết, khóa/mở khóa, roles, reset password."""
        with transaction.atomic():
            token = self.get_admin_token()

            # 1. Danh sách người dùng
            list_resp = self.client.get(
                "/api/admin/users/?page=1&page_size=10",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(list_resp.status_code, 200)
            items = list_resp.json()["data"]["items"]
            self.assertTrue(len(items) >= 1)

            target_user = Users.objects.filter(account_type="candidate").first()
            user_id = target_user.id

            # 2. Chi tiết người dùng
            detail_resp = self.client.get(
                f"/api/admin/users/{user_id}/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(detail_resp.status_code, 200)
            self.assertEqual(detail_resp.json()["data"]["user"]["id"], user_id)

            # 3. Khóa tài khoản
            lock_resp = self.client.patch(
                f"/api/admin/users/{user_id}/status/",
                data=json.dumps({"is_active": False, "reason": "Vi phạm điều khoản cộng đồng"}),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(lock_resp.status_code, 200)
            self.assertFalse(lock_resp.json()["data"]["is_active"])

            # 4. Mở khóa tài khoản
            unlock_resp = self.client.patch(
                f"/api/admin/users/{user_id}/status/",
                data=json.dumps({"is_active": True, "reason": "Đã giải trình hợp lệ"}),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(unlock_resp.status_code, 200)
            self.assertTrue(unlock_resp.json()["data"]["is_active"])

            # 5. Cập nhật roles
            roles_resp = self.client.patch(
                f"/api/admin/users/{user_id}/roles/",
                data=json.dumps({"roles": ["candidate"]}),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(roles_resp.status_code, 200)

            # 6. Admin đặt lại mật khẩu
            pwd_resp = self.client.post(
                f"/api/admin/users/{user_id}/reset-password/",
                data=json.dumps({"password": "NewAdminPassword@123"}),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(pwd_resp.status_code, 200)

            transaction.set_rollback(True)

    def test_03_admin_company_verification_and_status(self):
        """Kiểm tra quản lý và duyệt xác minh doanh nghiệp."""
        with transaction.atomic():
            token = self.get_admin_token()

            # 1. Danh sách doanh nghiệp
            list_resp = self.client.get(
                "/api/admin/companies/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(list_resp.status_code, 200)
            companies = list_resp.json()["data"]["items"]
            self.assertTrue(len(companies) >= 1)

            company_id = companies[0]["id"]

            # 2. Chi tiết doanh nghiệp
            detail_resp = self.client.get(
                f"/api/admin/companies/{company_id}/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(detail_resp.status_code, 200)

            # 3. Phê duyệt xác minh doanh nghiệp
            verify_resp = self.client.post(
                f"/api/admin/companies/{company_id}/verify/",
                data=json.dumps({"action": "approve", "notes": "Hồ sơ pháp lý đầy đủ và hợp lệ."}),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(verify_resp.status_code, 200)
            self.assertEqual(verify_resp.json()["data"]["verification_status"], "verified")

            # 4. Khóa/Mở trạng thái hoạt động công ty
            status_resp = self.client.patch(
                f"/api/admin/companies/{company_id}/status/",
                data=json.dumps({"is_active": True}),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(status_resp.status_code, 200)

            transaction.set_rollback(True)

    def test_04_admin_job_moderation(self):
        """Kiểm duyệt tin tuyển dụng: xem danh sách, duyệt tin, ẩn tin vi phạm."""
        with transaction.atomic():
            token = self.get_admin_token()

            job = Jobs.objects.first()
            self.assertIsNotNone(job)

            # 1. Danh sách tin tuyển dụng
            list_resp = self.client.get(
                "/api/admin/jobs/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(list_resp.status_code, 200)

            # 2. Xem chi tiết tin tuyển dụng
            detail_resp = self.client.get(
                f"/api/admin/jobs/{job.id}/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(detail_resp.status_code, 200)
            self.assertEqual(detail_resp.json()["data"]["job"]["id"], job.id)

            # 3. Duyệt tin tuyển dụng
            approve_resp = self.client.post(
                f"/api/admin/jobs/{job.id}/moderate/",
                data=json.dumps({"action": "approve", "reason": "Nội dung phù hợp tiêu chuẩn"}),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(approve_resp.status_code, 200)
            self.assertEqual(approve_resp.json()["data"]["status"], "published")

            # 4. Ẩn tin vi phạm
            hide_resp = self.client.post(
                f"/api/admin/jobs/{job.id}/moderate/",
                data=json.dumps({"action": "hide", "reason": "Thông tin mức lương sai lệch"}),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(hide_resp.status_code, 200)
            self.assertEqual(hide_resp.json()["data"]["status"], "closed")

            transaction.set_rollback(True)


    def test_05_admin_categories(self):
        """Kiểm tra quản lý danh mục: ngành nghề, kỹ năng, địa điểm."""
        with transaction.atomic():
            token = self.get_admin_token()

            # 1. Thêm & xóa ngành nghề
            ind_resp = self.client.post(
                "/api/admin/categories/industries/",
                data=json.dumps({"name": "Trí tuệ nhân tạo (AI/ML)"}),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(ind_resp.status_code, 201)
            ind_id = ind_resp.json()["data"]["industry"]["id"]

            del_ind_resp = self.client.delete(
                f"/api/admin/categories/industries/{ind_id}/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(del_ind_resp.status_code, 200)

            # 2. Thêm & xóa kỹ năng
            skill_resp = self.client.post(
                "/api/admin/categories/skills/",
                data=json.dumps({"name": "PyTorch / TensorFlow", "category": "AI"}),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(skill_resp.status_code, 201)
            skill_id = skill_resp.json()["data"]["skill"]["id"]

            del_skill_resp = self.client.delete(
                f"/api/admin/categories/skills/{skill_id}/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(del_skill_resp.status_code, 200)

            # 3. Danh sách địa điểm
            loc_resp = self.client.get(
                "/api/admin/categories/locations/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(loc_resp.status_code, 200)

            transaction.set_rollback(True)

    def test_06_admin_billing_and_reports(self):
        """Kiểm tra quản lý gói dịch vụ, đơn hàng và báo cáo vi phạm."""
        with transaction.atomic():
            token = self.get_admin_token()

            # 1. Danh sách & tạo gói dịch vụ
            plan_resp = self.client.post(
                "/api/admin/billing/plans/",
                data=json.dumps({
                    "name": "Gói Doanh Nghiệp VIP Q4",
                    "price_vnd": 5000000,
                    "duration_days": 90,
                    "job_quota": 20,
                    "ai_interview_quota": 50,
                }),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(plan_resp.status_code, 201)
            plan_id = plan_resp.json()["data"]["plan"]["id"]

            # Cập nhật gói dịch vụ
            patch_plan_resp = self.client.patch(
                f"/api/admin/billing/plans/{plan_id}/",
                data=json.dumps({"price_vnd": 4500000}),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(patch_plan_resp.status_code, 200)

            # 2. Danh sách đơn hàng
            order_resp = self.client.get(
                "/api/admin/billing/orders/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(order_resp.status_code, 200)

            # 3. Tạo mã khuyến mãi
            coupon_resp = self.client.post(
                "/api/admin/billing/coupons/",
                data=json.dumps({"code": "CAREZA2026", "discount_percent": 25}),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(coupon_resp.status_code, 201)

            # 4. Danh sách thuê bao
            sub_resp = self.client.get(
                "/api/admin/billing/subscriptions/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(sub_resp.status_code, 200)

            # 5. Danh sách báo cáo vi phạm
            rep_resp = self.client.get(
                "/api/admin/reports/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(rep_resp.status_code, 200)

            # 6. Danh sách đánh giá doanh nghiệp
            rev_resp = self.client.get(
                "/api/admin/reviews/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(rev_resp.status_code, 200)

            # 7. Danh sách ca kiểm duyệt
            mod_resp = self.client.get(
                "/api/admin/moderation-cases/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(mod_resp.status_code, 200)

            transaction.set_rollback(True)


    def test_07_admin_system_and_broadcast(self):
        """Kiểm tra cấu hình hệ thống, audit logs, AI usage và broadcast thông báo."""
        with transaction.atomic():
            token = self.get_admin_token()

            # 1. Roles & Permissions
            rp_resp = self.client.get(
                "/api/admin/system/roles-permissions/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(rp_resp.status_code, 200)
            self.assertIn("roles", rp_resp.json()["data"])
            self.assertIn("permissions", rp_resp.json()["data"])

            # 2. Cập nhật cấu hình hệ thống
            cfg_resp = self.client.patch(
                "/api/admin/system/settings/",
                data=json.dumps({"key": "max_free_jobs", "value": 3}),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(cfg_resp.status_code, 200)

            # 3. Mẫu email hệ thống
            mail_resp = self.client.get(
                "/api/admin/system/email-templates/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(mail_resp.status_code, 200)

            # 4. Nhật ký hoạt động (Audit logs)
            audit_resp = self.client.get(
                "/api/admin/system/audit-logs/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(audit_resp.status_code, 200)

            # 5. Thống kê sử dụng AI
            ai_resp = self.client.get(
                "/api/admin/system/ai-usage/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(ai_resp.status_code, 200)

            # 6. Gửi thông báo hệ thống (Broadcast)
            broadcast_resp = self.client.post(
                "/api/admin/notifications/broadcast/",
                data=json.dumps({
                    "title": "Bảo trì nâng cấp hệ thống CAREZA",
                    "content": "Hệ thống sẽ bảo trì định kỳ vào 02:00 sáng Chủ nhật.",
                    "target_role": "all",
                }),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(broadcast_resp.status_code, 201)

            transaction.set_rollback(True)

    def test_08_admin_authorization_security(self):
        """Bảo mật: Candidate và Employer bị từ chối 403 khi gọi API Admin."""
        # 1. Candidate
        cand_user = Users.objects.filter(account_type="candidate").first()
        cand_token = generate_tokens_for_user(cand_user)["access_token"]
        resp_cand = self.client.get(
            "/api/admin/dashboard/",
            HTTP_AUTHORIZATION=f"Bearer {cand_token}",
        )
        self.assertEqual(resp_cand.status_code, 403)

        # 2. Employer
        emp_user = Users.objects.filter(account_type="employer").first()
        emp_token = generate_tokens_for_user(emp_user)["access_token"]
        resp_emp = self.client.get(
            "/api/admin/users/",
            HTTP_AUTHORIZATION=f"Bearer {emp_token}",
        )
        self.assertEqual(resp_emp.status_code, 403)
