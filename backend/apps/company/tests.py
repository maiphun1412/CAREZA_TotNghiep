import json
from datetime import datetime, timezone
import unittest
from django.test import Client
from django.db import transaction

from apps.authentication.models import Users, Roles, UserRoles
from apps.authentication.services.auth_service import generate_tokens_for_user
from apps.company.models import Companies, Members, Branches
from apps.recruitment.models import Jobs, Applications


class EmployerModuleTests(unittest.TestCase):
    """
    Bộ kiểm tra chính thức cho toàn bộ luồng Employer (Doanh nghiệp / Nhà tuyển dụng):
    1. Quản lý doanh nghiệp & chi nhánh
    2. Quản lý thành viên & phân quyền
    3. Vòng đời tin tuyển dụng (Job lifecycle & skills)
    4. Quản lý hồ sơ ứng tuyển, phỏng vấn, đánh giá & offer
    5. Bài test năng lực & Talent Pool
    6. Dashboard & Thống kê
    7. Phân quyền và cách ly dữ liệu giữa các doanh nghiệp
    """

    def setUp(self):
        self.client = Client(SERVER_NAME="localhost")

    def test_01_company_profile_and_branches(self):
        """Kiểm tra xem, cập nhật thông tin doanh nghiệp và quản lý chi nhánh."""
        with transaction.atomic():
            user = Users.objects.filter(id=11).first()
            self.assertIsNotNone(user)
            tokens = generate_tokens_for_user(user)
            token = tokens["access_token"]

            # 1. Lấy thông tin công ty hiện tại
            resp = self.client.get(
                "/api/companies/me/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(resp.status_code, 200)
            res_data = resp.json()["data"]["company"]
            self.assertEqual(res_data["id"], 1)

            # 2. Cập nhật thông tin công ty
            patch_resp = self.client.patch(
                "/api/companies/me/",
                data=json.dumps({
                    "slogan": "Tiên phong công nghệ tuyển dụng AI",
                    "company_size": "100-499",
                    "website": "https://example.com/careza",
                }),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(patch_resp.status_code, 200)
            company_data = patch_resp.json()["data"]["company"]
            self.assertEqual(company_data["branding"]["slogan"], "Tiên phong công nghệ tuyển dụng AI")
            self.assertEqual(company_data["company_size"], "100-499")

            # 3. Tạo chi nhánh mới
            branch_resp = self.client.post(
                "/api/companies/me/branches/",
                data=json.dumps({
                    "name": "Chi nhánh Hà Nội",
                    "address": "Tầng 5, Tòa nhà Keangnam, Cầu Giấy",
                    "is_headquarter": False,
                }),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(branch_resp.status_code, 201)
            branch_id = branch_resp.json()["data"]["branch"]["id"]

            # 4. Lấy danh sách chi nhánh
            list_branch = self.client.get(
                "/api/companies/me/branches/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(list_branch.status_code, 200)
            self.assertTrue(len(list_branch.json()["data"]["branches"]) >= 1)

            # 5. Xóa chi nhánh
            del_resp = self.client.delete(
                f"/api/companies/me/branches/{branch_id}/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(del_resp.status_code, 200)

            transaction.set_rollback(True)

    def test_02_members_and_permissions(self):
        """Kiểm tra quản lý thành viên: danh sách, mời thành viên, đổi quyền, xóa."""
        with transaction.atomic():
            user = Users.objects.filter(id=11).first()
            tokens = generate_tokens_for_user(user)
            token = tokens["access_token"]

            # 1. Xem danh sách thành viên
            resp = self.client.get(
                "/api/companies/me/members/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(resp.status_code, 200)
            self.assertTrue(len(resp.json()["data"]["members"]) >= 1)

            # 2. Tạo một user mới để mời làm thành viên
            now = datetime.now(timezone.utc)
            invite_email = "new_member_test@careza.vn"
            new_user = Users.objects.create(
                email=invite_email,
                full_name="Nguyễn Văn Tuyển Dụng",
                account_type="employer",
                is_active=True,
                created_at=now,
                updated_at=now,
            )

            invite_resp = self.client.post(
                "/api/companies/me/members/",
                data=json.dumps({
                    "email": invite_email,
                    "member_role": "recruiter",
                }),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(invite_resp.status_code, 201)
            member_id = invite_resp.json()["data"]["member"]["id"]

            # 3. Cập nhật vai trò thành viên sang admin
            update_role_resp = self.client.patch(
                f"/api/companies/me/members/{member_id}/",
                data=json.dumps({"member_role": "admin"}),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(update_role_resp.status_code, 200)
            self.assertEqual(update_role_resp.json()["data"]["member"]["member_role"], "admin")


            # 4. Vô hiệu hóa thành viên
            del_member_resp = self.client.delete(
                f"/api/companies/me/members/{member_id}/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(del_member_resp.status_code, 200)

            transaction.set_rollback(True)

    def test_03_job_post_lifecycle(self):
        """Kiểm tra tạo, sửa, xem chi tiết và danh sách tin tuyển dụng."""
        with transaction.atomic():
            user = Users.objects.filter(id=11).first()
            tokens = generate_tokens_for_user(user)
            token = tokens["access_token"]

            # 1. Tạo tin tuyển dụng mới ở trạng thái draft
            create_resp = self.client.post(
                "/api/companies/me/jobs/",
                data=json.dumps({
                    "title": "Senior Python Backend Engineer (Django/DRF)",
                    "description": "Tham gia phát triển hệ thống lõi CAREZA.",
                    "requirements": "Thành thạo Python, Django, PostgreSQL, Docker.",
                    "benefits": "Lương tháng 13, bảo hiểm sức khỏe cao cấp.",
                    "salary_min": 25000000,
                    "salary_max": 45000000,
                    "work_mode": "hybrid",
                    "employment_type": "full_time",
                    "openings": 2,
                    "status": "draft",
                    "skill_ids": [1, 2],
                }),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(create_resp.status_code, 201)
            job_data = create_resp.json()["data"]["job"]
            job_id = job_data["id"]
            self.assertEqual(job_data["status"], "draft")

            # 2. Cập nhật tin tuyển dụng và xuất bản (published)
            patch_resp = self.client.patch(
                f"/api/companies/me/jobs/{job_id}/",
                data=json.dumps({
                    "title": "Senior Python Backend Engineer (Team Lead)",
                    "status": "published",
                }),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(patch_resp.status_code, 200)
            self.assertEqual(patch_resp.json()["data"]["job"]["status"], "published")
            self.assertEqual(patch_resp.json()["data"]["job"]["title"], "Senior Python Backend Engineer (Team Lead)")

            # 3. Lấy danh sách tin tuyển dụng của công ty
            list_resp = self.client.get(
                "/api/companies/me/jobs/?status=published",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(list_resp.status_code, 200)
            self.assertTrue(list_resp.json()["data"]["pagination"]["total"] >= 1)

            # 4. Xem chi tiết tin tuyển dụng
            detail_resp = self.client.get(
                f"/api/companies/me/jobs/{job_id}/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(detail_resp.status_code, 200)
            self.assertEqual(detail_resp.json()["data"]["job"]["id"], job_id)

            transaction.set_rollback(True)

    def test_04_application_workflow_and_hiring(self):
        """Kiểm tra toàn bộ luồng xử lý ứng viên: danh sách, chuyển stage, phỏng vấn, đánh giá, offer, hire."""
        with transaction.atomic():
            user = Users.objects.filter(id=11).first()
            tokens = generate_tokens_for_user(user)
            token = tokens["access_token"]

            # Lấy 1 đơn ứng tuyển thuộc công ty 1
            app = Applications.objects.filter(job__company_id=1).first()
            if not app:
                # Nếu chưa có, tạo 1 job và 1 application để test
                now = datetime.now(timezone.utc)
                job = Jobs.objects.create(
                    company_id=1,
                    title="Dev Test App",
                    slug="dev-test-app-1",
                    status="published",
                    created_at=now,
                )
                app = Applications.objects.create(
                    job=job,
                    candidate_id=1,
                    status="submitted",
                    applied_at=now,
                )

            app_id = app.id

            # 1. Danh sách hồ sơ ứng tuyển
            list_resp = self.client.get(
                "/api/companies/me/applications/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(list_resp.status_code, 200)

            # 2. Chi tiết hồ sơ ứng tuyển
            detail_resp = self.client.get(
                f"/api/companies/me/applications/{app_id}/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(detail_resp.status_code, 200)

            # 3. Chuyển trạng thái sang "screening"
            stage_resp = self.client.post(
                f"/api/companies/me/applications/{app_id}/stage/",
                data=json.dumps({"stage": "reviewing", "note": "Hồ sơ đạt yêu cầu cơ bản."}),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(stage_resp.status_code, 200)
            self.assertEqual(stage_resp.json()["data"]["status"], "screening")

            # 4. Lên lịch phỏng vấn
            interview_resp = self.client.post(
                "/api/companies/me/interviews/",
                data=json.dumps({
                    "application_id": app_id,
                    "scheduled_at": "2026-10-25T14:00:00Z",
                    "duration_minutes": 60,
                    "meeting_url": "https://meet.google.com/xyz-careza",
                    "mode": "online",
                    "notes": "Phỏng vấn kỹ thuật vòng 1",
                }),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(interview_resp.status_code, 201)

            # 5. Ghi điểm đánh giá (Scorecard)
            score_resp = self.client.post(
                "/api/companies/me/scorecards/",
                data=json.dumps({
                    "application_id": app_id,
                    "technical_score": 8.5,
                    "communication_score": 9.0,
                    "culture_score": 9.0,
                    "notes": "Ứng viên có kiến thức tốt, giao tiếp lưu loát.",
                }),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(score_resp.status_code, 201)

            # 6. Gửi thư mời nhận việc (Offer)
            offer_resp = self.client.post(
                "/api/companies/me/offers/",
                data=json.dumps({
                    "application_id": app_id,
                    "salary": 35000000,
                    "start_date": "2026-11-01",
                    "letter_url": "https://careza.vn/offers/offer_123.pdf",
                }),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(offer_resp.status_code, 201)

            # 7. Tiếp nhận tuyển dụng (Hire)
            hire_resp = self.client.post(
                f"/api/companies/me/applications/{app_id}/hire/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(hire_resp.status_code, 200)
            self.assertEqual(hire_resp.json()["data"]["status"], "hired")

            transaction.set_rollback(True)

    def test_05_talent_pool_and_tests(self):
        """Kiểm tra quản lý Talent Pool và bài kiểm tra năng lực."""
        with transaction.atomic():
            user = Users.objects.filter(id=11).first()
            tokens = generate_tokens_for_user(user)
            token = tokens["access_token"]

            # 1. Tạo bài test năng lực
            test_resp = self.client.post(
                "/api/companies/me/tests/",
                data=json.dumps({
                    "title": "Kiểm tra kiến thức Django & System Design",
                    "duration_minutes": 45,
                    "questions": [
                        {"id": 1, "question": "Explain Django ORM select_related vs prefetch_related"},
                    ],
                }),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(test_resp.status_code, 201)

            # 2. Tạo nhóm tài năng (Talent Pool)
            pool_resp = self.client.post(
                "/api/companies/me/talent-pools/",
                data=json.dumps({
                    "name": "Backend Engineers Tiềm Năng Q4",
                    "description": "Nhóm ứng viên backend điểm phỏng vấn cao",
                }),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(pool_resp.status_code, 201)
            pool_id = pool_resp.json()["data"]["talent_pool"]["id"]

            # 3. Thêm ứng viên vào nhóm tài năng
            add_resp = self.client.post(
                f"/api/companies/me/talent-pools/{pool_id}/candidates/",
                data=json.dumps({
                    "candidate_id": 1,
                    "notes": "Ứng viên rất tiềm năng, có thể cân nhắc cho đợt tuyển Q1 năm tới",
                }),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(add_resp.status_code, 201)

            # 4. Gỡ ứng viên khỏi nhóm tài năng
            del_resp = self.client.delete(
                f"/api/companies/me/talent-pools/{pool_id}/candidates/1/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(del_resp.status_code, 200)

            transaction.set_rollback(True)

    def test_06_dashboard_and_activity_logs(self):
        """Kiểm tra API dashboard tổng quan và nhật ký hoạt động."""
        with transaction.atomic():
            user = Users.objects.filter(id=11).first()
            tokens = generate_tokens_for_user(user)
            token = tokens["access_token"]

            # 1. Lấy dashboard doanh nghiệp
            dash_resp = self.client.get(
                "/api/companies/me/dashboard/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(dash_resp.status_code, 200)
            dash_data = dash_resp.json()["data"]["dashboard"]
            self.assertIn("company_name", dash_data)
            self.assertIn("total_jobs", dash_data)
            self.assertIn("applications_by_status", dash_data)

            # 2. Lấy nhật ký hoạt động
            act_resp = self.client.get(
                "/api/companies/me/activities/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(act_resp.status_code, 200)
            self.assertIn("activities", act_resp.json()["data"])

            transaction.set_rollback(True)

    def test_07_employer_data_isolation(self):
        """Kiểm tra cách ly dữ liệu: Employer Công ty 1 không thể xem/sửa dữ liệu của Công ty 2."""
        with transaction.atomic():
            # User 11 thuộc Công ty 1
            user_11 = Users.objects.filter(id=11).first()
            token_11 = generate_tokens_for_user(user_11)["access_token"]

            # User 12 thuộc Công ty 2
            user_12 = Users.objects.filter(id=12).first()
            token_12 = generate_tokens_for_user(user_12)["access_token"]

            # Tạo job thuộc công ty 2
            now = datetime.now(timezone.utc)
            job_co2 = Jobs.objects.create(
                company_id=2,
                title="Bảo mật Nội bộ Công ty 2",
                slug="job-co2-secret",
                status="published",
                created_at=now,
            )

            # User 11 (Công ty 1) cố gắng xem tin tuyển dụng của Công ty 2 qua API quản trị
            resp = self.client.get(
                f"/api/companies/me/jobs/{job_co2.id}/",
                HTTP_AUTHORIZATION=f"Bearer {token_11}",
            )
            # Phải bị chặn với 404 (Không tìm thấy trong doanh nghiệp của bạn)
            self.assertEqual(resp.status_code, 404)

            # Cố gắng sửa tin tuyển dụng của công ty 2
            patch_resp = self.client.patch(
                f"/api/companies/me/jobs/{job_co2.id}/",
                data=json.dumps({"title": "Hack title"}),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token_11}",
            )
            self.assertEqual(patch_resp.status_code, 404)

            # Nhưng User 12 (Công ty 2) xem được bình thường
            resp_co2 = self.client.get(
                f"/api/companies/me/jobs/{job_co2.id}/",
                HTTP_AUTHORIZATION=f"Bearer {token_12}",
            )
            self.assertEqual(resp_co2.status_code, 200)
            self.assertEqual(resp_co2.json()["data"]["job"]["id"], job_co2.id)

            transaction.set_rollback(True)
