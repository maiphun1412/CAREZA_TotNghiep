import json
from datetime import datetime, timezone
from django.test import TestCase, Client
from django.db import transaction
from apps.authentication.models import Users
from apps.authentication.services.auth_service import AuthService, generate_tokens_for_user
from apps.candidate.models import Profiles, Cvs, Educations, Experiences
from apps.recruitment.models import Jobs, Applications
from apps.interaction.models import SavedJobs, Notifications


class CandidateModuleTests(TestCase):
    """
    Bộ kiểm tra chính thức cho toàn bộ luồng Candidate:
    - Hồ sơ ứng viên (Profile, Học vấn, Kinh nghiệm, Kỹ năng)
    - Quản lý CV và phiên bản CV (CV versions, is_primary)
    - Tìm kiếm tin tuyển dụng & lưu việc làm (Saved jobs)
    - Nộp đơn ứng tuyển, theo dõi trạng thái và rút đơn (Applications)
    - Thông báo (Notifications, Mark as read)
    - Đảm bảo phân quyền và cách ly dữ liệu giữa các ứng viên
    """

    def setUp(self):
        self.client = Client(SERVER_NAME="localhost")

    def test_01_candidate_profile_management(self):
        """Kiểm tra xem và cập nhật hồ sơ ứng viên cá nhân."""
        with transaction.atomic():
            user = Users.objects.filter(account_type="candidate").first()
            self.assertIsNotNone(user)
            tokens = generate_tokens_for_user(user)
            token = tokens["access_token"]

            # 1. Lấy thông tin profile
            resp = self.client.get(
                "/api/candidates/me/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(resp.status_code, 200)
            res_data = resp.json()["data"]["candidate"]
            self.assertEqual(res_data["profile"]["email"], user.email)

            # 2. Cập nhật headline và bio
            patch_resp = self.client.patch(
                "/api/candidates/me/",
                data=json.dumps({
                    "headline": "Kỹ sư phần mềm cao cấp",
                    "bio": "Mô tả kinh nghiệm lập trình chuyên sâu.",
                    "work_mode": "hybrid",
                }),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(patch_resp.status_code, 200)
            self.assertEqual(patch_resp.json()["data"]["candidate"]["profile"]["headline"], "Kỹ sư phần mềm cao cấp")

            # 3. Thêm và xóa học vấn
            edu_resp = self.client.post(
                "/api/candidates/educations/",
                data=json.dumps({
                    "institution": "Đại học Bách Khoa",
                    "major": "Công nghệ thông tin",
                    "degree": "Kỹ sư",
                    "start_year": 2018,
                    "end_year": 2022,
                }),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(edu_resp.status_code, 201)
            edu_id = edu_resp.json()["data"]["education"]["id"]

            del_resp = self.client.delete(
                f"/api/candidates/educations/{edu_id}/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(del_resp.status_code, 200)

            transaction.set_rollback(True)

    def test_02_cv_management_and_versions(self):
        """Kiểm tra tạo CV mới, đặt mặc định và tạo phiên bản."""
        with transaction.atomic():
            user = Users.objects.filter(account_type="candidate").first()
            tokens = generate_tokens_for_user(user)
            token = tokens["access_token"]

            # 1. Danh sách CV hiện có
            list_resp = self.client.get(
                "/api/candidate/documents/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(list_resp.status_code, 200)

            # 2. Tạo CV mới
            create_resp = self.client.post(
                "/api/candidate/documents/",
                data=json.dumps({
                    "title": "CV Fullstack Developer 2026",
                    "parsed_data": {"summary": "Lập trình viên nhiệt huyết", "skills": ["Python", "Django", "React"]},
                    "is_primary": True,
                }),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(create_resp.status_code, 201)
            cv_id = create_resp.json()["data"]["document"]["id"]
            self.assertTrue(create_resp.json()["data"]["document"]["is_primary"])

            # 3. Tạo phiên bản mới (v2) cho CV này
            ver_resp = self.client.post(
                f"/api/candidate/documents/{cv_id}/versions/",
                data=json.dumps({
                    "content": {"summary": "Lập trình viên nhiệt huyết - v2 cập nhật"},
                }),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(ver_resp.status_code, 201)
            self.assertEqual(ver_resp.json()["data"]["version"]["version_number"], 2)

            transaction.set_rollback(True)

    def test_03_jobs_search_and_bookmark(self):
        """Kiểm tra tìm kiếm tin tuyển dụng, lưu và bỏ lưu việc làm."""
        with transaction.atomic():
            user = Users.objects.filter(account_type="candidate").first()
            tokens = generate_tokens_for_user(user)
            token = tokens["access_token"]

            # 1. Tìm kiếm công việc công khai
            jobs_resp = self.client.get(
                "/api/jobs/?page=1&page_size=5",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(jobs_resp.status_code, 200)
            items = jobs_resp.json()["data"]["items"]
            self.assertGreater(len(items), 0)
            first_job_id = items[0]["id"]

            # 2. Xem chi tiết tin tuyển dụng
            detail_resp = self.client.get(
                f"/api/jobs/{first_job_id}/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(detail_resp.status_code, 200)

            # 3. Lưu việc làm (Bookmark)
            save_resp = self.client.post(
                f"/api/candidate/jobs/{first_job_id}/bookmark/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(save_resp.status_code, 200)

            # 4. Kiểm tra danh sách việc đã lưu
            bookmarked_resp = self.client.get(
                "/api/candidate/bookmarked-jobs/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(bookmarked_resp.status_code, 200)
            ids_resp = self.client.get(
                "/api/candidate/bookmarked-jobs/ids/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertIn(first_job_id, ids_resp.json()["data"]["ids"])

            # 5. Bỏ lưu việc làm
            del_save_resp = self.client.delete(
                f"/api/candidate/jobs/{first_job_id}/bookmark/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(del_save_resp.status_code, 200)

            transaction.set_rollback(True)

    def test_04_application_lifecycle_and_withdrawal(self):
        """Kiểm tra luồng nộp đơn ứng tuyển, theo dõi lịch sử và rút đơn."""
        with transaction.atomic():
            # Tạo ứng viên độc lập trong transaction
            now = datetime.now(timezone.utc)
            user_cand = Users.objects.create(
                full_name="Ứng Viên Ứng Tuyển Mới",
                email="candidate_applicant@careza.vn",
                account_type="candidate",
                is_active=True,
                created_at=now,
                updated_at=now,
            )
            profile = Profiles.objects.create(user=user_cand, headline="Developer")
            cv = Cvs.objects.create(profile=profile, title="CV Kiểm Thử Ứng Tuyển", is_primary=True)

            job = Jobs.objects.first()
            self.assertIsNotNone(job)

            tokens = generate_tokens_for_user(user_cand)
            token = tokens["access_token"]

            # 1. Nộp hồ sơ ứng tuyển
            apply_resp = self.client.post(
                "/api/applications/",
                data=json.dumps({
                    "job_id": job.id,
                    "cv_id": cv.id,
                    "cover_letter": "Tôi rất quan tâm và mong muốn cống hiến cho vị trí này.",
                }),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(apply_resp.status_code, 201)
            app_id = apply_resp.json()["data"]["application"]["application_id"]

            # 2. Xem danh sách đơn ứng tuyển của tôi
            my_apps_resp = self.client.get(
                "/api/applications/me/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(my_apps_resp.status_code, 200)
            self.assertEqual(len(my_apps_resp.json()["data"]["applications"]), 1)

            # 3. Xem lịch sử thay đổi trạng thái
            history_resp = self.client.get(
                f"/api/applications/{app_id}/history/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(history_resp.status_code, 200)
            self.assertGreater(len(history_resp.json()["data"]["histories"]), 0)

            # 4. Rút đơn ứng tuyển
            withdraw_resp = self.client.post(
                f"/api/applications/{app_id}/withdraw/",
                data=json.dumps({"reason": "Đã tìm được công việc khác phù hợp hơn."}),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(withdraw_resp.status_code, 200)
            self.assertEqual(withdraw_resp.json()["data"]["status"], "withdrawn")

            transaction.set_rollback(True)

    def test_05_notifications_and_read_status(self):
        """Kiểm tra xem danh sách thông báo và đánh dấu đã đọc."""
        with transaction.atomic():
            user = Users.objects.filter(account_type="candidate").first()
            tokens = generate_tokens_for_user(user)
            token = tokens["access_token"]

            # Tạo thông báo test tạm thời cho user này
            notif = Notifications.objects.create(
                user_id=user.id,
                type="system",
                title="Chào mừng bạn đến với CAREZA",
                content="Hồ sơ của bạn đã sẵn sàng ứng tuyển việc làm.",
            )

            # Lấy thông báo
            resp = self.client.get(
                "/api/notifications/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(resp.status_code, 200)
            self.assertGreater(len(resp.json()["data"]["items"]), 0)

            # Đánh dấu đã đọc
            read_resp = self.client.patch(
                f"/api/notifications/{notif.id}/read/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(read_resp.status_code, 200)

            transaction.set_rollback(True)

    def test_06_data_isolation_between_candidates(self):
        """Kiểm tra ứng viên chỉ có quyền thao tác với CV và đơn của chính mình."""
        with transaction.atomic():
            now = datetime.now(timezone.utc)
            user_a = Users.objects.create(full_name="User A", email="cand_a@careza.vn", account_type="candidate", is_active=True, created_at=now, updated_at=now)
            user_b = Users.objects.create(full_name="User B", email="cand_b@careza.vn", account_type="candidate", is_active=True, created_at=now, updated_at=now)

            prof_a = Profiles.objects.create(user=user_a, headline="Profile A")
            prof_b = Profiles.objects.create(user=user_b, headline="Profile B")

            cv_b = Cvs.objects.create(profile=prof_b, title="CV của User B", is_primary=True)

            token_a = generate_tokens_for_user(user_a)["access_token"]

            # User A cố truy cập CV của User B -> 404 Not Found (hoặc 403)
            get_b_cv_resp = self.client.get(
                f"/api/candidate/documents/{cv_b.id}/",
                HTTP_AUTHORIZATION=f"Bearer {token_a}",
            )
            self.assertEqual(get_b_cv_resp.status_code, 404)

            # User A cố xóa CV của User B -> 404 Not Found
            del_b_cv_resp = self.client.delete(
                f"/api/candidate/documents/{cv_b.id}/",
                HTTP_AUTHORIZATION=f"Bearer {token_a}",
            )
            self.assertEqual(del_b_cv_resp.status_code, 404)

            transaction.set_rollback(True)

