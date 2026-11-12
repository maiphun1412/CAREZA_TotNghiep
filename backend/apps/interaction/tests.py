import os
import json
from datetime import datetime, timezone
import unittest

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
import django
django.setup()

from django.test import Client
from django.db import transaction

from apps.authentication.models import Users
from apps.authentication.services.auth_service import generate_tokens_for_user
from apps.company.models import Companies, Members
from apps.recruitment.models import Jobs
from apps.interaction.models import (
    CompanyFollows,
    CompanyReviews,
    Conversations,
    JobAlerts,
    JobComparisons,
    Notifications,
    Reports,
    SavedJobs,
    SearchHistory,
)


class InteractionModuleTests(unittest.TestCase):
    """
    Bộ kiểm tra chính thức cho Module Messaging, Notifications & Interaction:
    1. Nhắn tin (Conversations & Messaging Stream)
    2. Thông báo (Notifications - Đọc, Đánh dấu tất cả, Xóa)
    3. Việc làm đã lưu (Saved Jobs)
    4. Theo dõi doanh nghiệp (Company Follows)
    5. Đánh giá doanh nghiệp (Company Reviews - Thêm, Sửa, Xóa)
    6. Báo cáo vi phạm (Reports)
    7. Lịch sử tìm kiếm & So sánh việc làm (Search History & Job Comparisons)
    8. Job Alerts (Thông báo việc làm phù hợp & Kích hoạt quét tự động)
    """

    def setUp(self):
        self.client = Client(SERVER_NAME="localhost")

    def test_01_conversations_flow(self):
        """1. Kiểm tra luồng hội thoại nhắn tin giữa ứng viên và doanh nghiệp."""
        with transaction.atomic():
            cand_user = Users.objects.filter(account_type="candidate").first()
            self.assertIsNotNone(cand_user)
            cand_token = generate_tokens_for_user(cand_user)["access_token"]

            comp = Companies.objects.first()
            self.assertIsNotNone(comp)

            # 1. Tạo hoặc lấy cuộc trò chuyện
            create_resp = self.client.post(
                "/api/interaction/conversations/",
                data=json.dumps({"partner_id": comp.id, "partner_type": "company"}),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {cand_token}",
            )
            self.assertEqual(create_resp.status_code, 200)
            conv_data = create_resp.json()["data"]
            conv_id = conv_data["id"]
            self.assertIn("firebase_thread_id", conv_data)

            # 2. Danh sách cuộc trò chuyện của ứng viên
            list_resp = self.client.get(
                "/api/interaction/conversations/",
                HTTP_AUTHORIZATION=f"Bearer {cand_token}",
            )
            self.assertEqual(list_resp.status_code, 200)
            convs = list_resp.json()["data"]["conversations"]
            self.assertTrue(any(c["id"] == conv_id for c in convs))

            # 3. Xem chi tiết cuộc trò chuyện
            detail_resp = self.client.get(
                f"/api/interaction/conversations/{conv_id}/",
                HTTP_AUTHORIZATION=f"Bearer {cand_token}",
            )
            self.assertEqual(detail_resp.status_code, 200)
            self.assertEqual(detail_resp.json()["data"]["id"], conv_id)

            # 4. Cập nhật thời gian tương tác (touch)
            touch_resp = self.client.post(
                f"/api/interaction/conversations/{conv_id}/touch/",
                HTTP_AUTHORIZATION=f"Bearer {cand_token}",
            )
            self.assertEqual(touch_resp.status_code, 200)

            # 5. Kiểm tra bảo vệ quyền riêng tư: Người dùng khác không được truy cập chéo
            other_user = Users.objects.filter(account_type="candidate").exclude(id=cand_user.id).first()
            if other_user:
                other_token = generate_tokens_for_user(other_user)["access_token"]
                forbidden_resp = self.client.get(
                    f"/api/interaction/conversations/{conv_id}/",
                    HTTP_AUTHORIZATION=f"Bearer {other_token}",
                )
                self.assertEqual(forbidden_resp.status_code, 403)

            transaction.set_rollback(True)

    def test_02_notifications_flow(self):
        """2. Kiểm tra quản lý thông báo: xem danh sách, chi tiết, đánh dấu đã đọc và xóa."""
        with transaction.atomic():
            user = Users.objects.filter(account_type="candidate").first()
            token = generate_tokens_for_user(user)["access_token"]

            now = datetime.now(timezone.utc)
            noti = Notifications.objects.create(
                user_id=user.id,
                type="application_status",
                title="Hồ sơ của bạn đã được duyệt",
                content="Nhà tuyển dụng đã xem hồ sơ của bạn.",
                created_at=now,
            )

            # 1. Danh sách thông báo
            list_resp = self.client.get(
                "/api/interaction/notifications/?is_read=false",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(list_resp.status_code, 200)
            self.assertGreaterEqual(list_resp.json()["data"]["unread_count"], 1)

            # 2. Xem chi tiết thông báo (tự động đánh dấu đã đọc)
            detail_resp = self.client.get(
                f"/api/interaction/notifications/{noti.id}/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(detail_resp.status_code, 200)
            self.assertTrue(detail_resp.json()["data"]["notification"]["is_read"])

            # 3. Đánh dấu chưa đọc
            patch_resp = self.client.patch(
                f"/api/interaction/notifications/{noti.id}/read/",
                data=json.dumps({"is_read": False}),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(patch_resp.status_code, 200)
            self.assertFalse(patch_resp.json()["data"]["is_read"])

            # 4. Đánh dấu tất cả đã đọc
            read_all_resp = self.client.post(
                "/api/interaction/notifications/read-all/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(read_all_resp.status_code, 200)

            # 5. Xóa thông báo
            del_resp = self.client.delete(
                f"/api/interaction/notifications/{noti.id}/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(del_resp.status_code, 200)

            transaction.set_rollback(True)

    def test_03_saved_jobs_flow(self):
        """3. Kiểm tra lưu việc làm, xem danh sách, kiểm tra và bỏ lưu."""
        with transaction.atomic():
            user = Users.objects.filter(account_type="candidate").first()
            token = generate_tokens_for_user(user)["access_token"]

            job = Jobs.objects.first()
            self.assertIsNotNone(job)

            # 1. Lưu việc làm
            save_resp = self.client.post(
                "/api/interaction/saved-jobs/",
                data=json.dumps({"job_id": job.id}),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(save_resp.status_code, 200)
            self.assertTrue(save_resp.json()["data"]["is_saved"])

            # 2. Kiểm tra trạng thái đã lưu
            check_resp = self.client.get(
                f"/api/interaction/saved-jobs/{job.id}/check/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(check_resp.status_code, 200)
            self.assertTrue(check_resp.json()["data"]["is_saved"])

            # 3. Lấy danh sách job_id đã lưu
            ids_resp = self.client.get(
                "/api/interaction/saved-jobs/ids/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(ids_resp.status_code, 200)
            self.assertIn(job.id, ids_resp.json()["data"]["saved_job_ids"])

            # 4. Lấy danh sách việc làm đã lưu kèm thông tin job
            list_resp = self.client.get(
                "/api/interaction/saved-jobs/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(list_resp.status_code, 200)
            items = list_resp.json()["data"]["items"]
            self.assertTrue(any(i["job_id"] == job.id for i in items))

            # 5. Bỏ lưu việc làm
            unsave_resp = self.client.delete(
                f"/api/interaction/saved-jobs/{job.id}/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(unsave_resp.status_code, 200)
            self.assertFalse(unsave_resp.json()["data"]["is_saved"])

            transaction.set_rollback(True)

    def test_04_company_follows_flow(self):
        """4. Kiểm tra theo dõi doanh nghiệp, kiểm tra trạng thái và hủy theo dõi."""
        with transaction.atomic():
            user = Users.objects.filter(account_type="candidate").first()
            token = generate_tokens_for_user(user)["access_token"]

            comp = Companies.objects.first()
            self.assertIsNotNone(comp)

            # 1. Theo dõi doanh nghiệp
            follow_resp = self.client.post(
                f"/api/interaction/company-follows/{comp.id}/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(follow_resp.status_code, 200)
            self.assertTrue(follow_resp.json()["data"]["is_following"])

            # 2. Kiểm tra trạng thái theo dõi
            check_resp = self.client.get(
                f"/api/interaction/company-follows/{comp.id}/check/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(check_resp.status_code, 200)
            self.assertTrue(check_resp.json()["data"]["is_following"])

            # 3. Danh sách doanh nghiệp đang theo dõi
            list_resp = self.client.get(
                "/api/interaction/company-follows/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(list_resp.status_code, 200)
            items = list_resp.json()["data"]["items"]
            self.assertTrue(any(i["company_id"] == comp.id for i in items))

            # 4. Hủy theo dõi
            unfollow_resp = self.client.delete(
                f"/api/interaction/company-follows/{comp.id}/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(unfollow_resp.status_code, 200)
            self.assertFalse(unfollow_resp.json()["data"]["is_following"])

            transaction.set_rollback(True)

    def test_05_company_reviews_flow(self):
        """5. Kiểm tra tạo đánh giá công ty, xem danh sách cá nhân, sửa và xóa đánh giá."""
        with transaction.atomic():
            user = Users.objects.filter(account_type="candidate").first()
            token = generate_tokens_for_user(user)["access_token"]

            comp = Companies.objects.first()

            # 1. Tạo đánh giá mới (pending kiểm duyệt)
            create_resp = self.client.post(
                "/api/interaction/company-reviews/",
                data=json.dumps({
                    "company_id": comp.id,
                    "rating": 5,
                    "title": "Môi trường làm việc năng động và chuyên nghiệp",
                    "content": "Công ty có chế độ đãi ngộ tốt, đồng nghiệp thân thiện và lộ trình thăng tiến rõ ràng.",
                }),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(create_resp.status_code, 201)
            review_id = create_resp.json()["data"]["id"]
            self.assertEqual(create_resp.json()["data"]["status"], "pending")

            # 2. Xem danh sách đánh giá của chính mình
            my_reviews_resp = self.client.get(
                "/api/interaction/company-reviews/my-reviews/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(my_reviews_resp.status_code, 200)
            items = my_reviews_resp.json()["data"]["items"]
            self.assertTrue(any(r["id"] == review_id for r in items))

            # 3. Sửa đánh giá của mình
            update_resp = self.client.put(
                f"/api/interaction/company-reviews/{review_id}/",
                data=json.dumps({
                    "rating": 4,
                    "title": "Môi trường làm việc tốt và văn phòng hiện đại",
                    "content": "Nội dung cập nhật đánh giá thực tế.",
                }),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(update_resp.status_code, 200)
            self.assertEqual(update_resp.json()["data"]["rating"], 4)

            # 4. Xóa đánh giá của mình
            del_resp = self.client.delete(
                f"/api/interaction/company-reviews/{review_id}/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(del_resp.status_code, 200)

            transaction.set_rollback(True)

    def test_06_reports_flow(self):
        """6. Kiểm tra gửi báo cáo vi phạm và theo dõi trạng thái xử lý."""
        with transaction.atomic():
            user = Users.objects.filter(account_type="candidate").first()
            token = generate_tokens_for_user(user)["access_token"]

            job = Jobs.objects.first()

            # 1. Gửi báo cáo tin tuyển dụng có dấu hiệu vi phạm
            create_resp = self.client.post(
                "/api/interaction/reports/",
                data=json.dumps({
                    "target_type": "job",
                    "target_id": job.id,
                    "reason": "Tin tuyển dụng có dấu hiệu thu phí ứng viên",
                    "details": "Mô tả công việc yêu cầu đóng tiền cọc trước khi phỏng vấn.",
                }),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(create_resp.status_code, 201)
            report_id = create_resp.json()["data"]["id"]
            self.assertEqual(create_resp.json()["data"]["status"], "pending")

            # 2. Xem danh sách báo cáo của mình
            my_reports_resp = self.client.get(
                "/api/interaction/reports/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(my_reports_resp.status_code, 200)
            items = my_reports_resp.json()["data"]["items"]
            self.assertTrue(any(r["id"] == report_id for r in items))

            # 3. Xem chi tiết báo cáo
            detail_resp = self.client.get(
                f"/api/interaction/reports/{report_id}/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(detail_resp.status_code, 200)
            self.assertEqual(detail_resp.json()["data"]["report"]["id"], report_id)

            transaction.set_rollback(True)

    def test_07_search_history_and_job_comparisons(self):
        """7. Kiểm tra lưu lịch sử tìm kiếm và bảng so sánh việc làm."""
        with transaction.atomic():
            user = Users.objects.filter(account_type="candidate").first()
            token = generate_tokens_for_user(user)["access_token"]

            # --- A. Lịch sử tìm kiếm ---
            add_search_resp = self.client.post(
                "/api/interaction/search-history/",
                data=json.dumps({"keyword": "Python Django Developer", "filters": {"location": "Hà Nội"}}),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(add_search_resp.status_code, 201)
            search_id = add_search_resp.json()["data"]["id"]

            list_search_resp = self.client.get(
                "/api/interaction/search-history/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(list_search_resp.status_code, 200)
            self.assertTrue(any(s["id"] == search_id for s in list_search_resp.json()["data"]["history"]))

            # Xóa 1 mục tìm kiếm
            del_search_resp = self.client.delete(
                f"/api/interaction/search-history/{search_id}/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(del_search_resp.status_code, 200)

            # --- B. So sánh việc làm ---
            jobs = list(Jobs.objects.all()[:2])
            self.assertGreaterEqual(len(jobs), 1)

            # Thêm công việc vào bảng so sánh
            add_comp_resp = self.client.post(
                f"/api/interaction/job-comparisons/{jobs[0].id}/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(add_comp_resp.status_code, 200)

            # Lấy danh sách các việc làm so sánh
            list_comp_resp = self.client.get(
                "/api/interaction/job-comparisons/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(list_comp_resp.status_code, 200)
            comp_items = list_comp_resp.json()["data"]["comparisons"]
            self.assertTrue(any(c["job_id"] == jobs[0].id for c in comp_items))

            # Gỡ khỏi bảng so sánh
            remove_comp_resp = self.client.delete(
                f"/api/interaction/job-comparisons/{jobs[0].id}/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(remove_comp_resp.status_code, 200)

            transaction.set_rollback(True)

    def test_08_job_alerts_and_matches(self):
        """8. Kiểm tra tạo Job Alert, cập nhật và kích hoạt quét việc làm phù hợp thực tế."""
        with transaction.atomic():
            user = Users.objects.filter(account_type="candidate").first()
            token = generate_tokens_for_user(user)["access_token"]

            # 1. Tạo Job Alert mới
            create_resp = self.client.post(
                "/api/interaction/job-alerts/",
                data=json.dumps({
                    "keyword": "Developer",
                    "frequency": "weekly",
                    "is_active": True,
                }),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(create_resp.status_code, 201)
            alert_id = create_resp.json()["data"]["id"]

            # 2. Xem danh sách Job Alerts
            list_resp = self.client.get(
                "/api/interaction/job-alerts/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(list_resp.status_code, 200)
            self.assertTrue(any(a["id"] == alert_id for a in list_resp.json()["data"]["job_alerts"]))

            # 3. Cập nhật Job Alert
            update_resp = self.client.put(
                f"/api/interaction/job-alerts/{alert_id}/",
                data=json.dumps({"keyword": "Backend Developer", "frequency": "daily", "is_active": True}),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(update_resp.status_code, 200)
            self.assertEqual(update_resp.json()["data"]["keyword"], "Backend Developer")

            # 4. Kích hoạt quét việc làm phù hợp và tạo thông báo
            trigger_resp = self.client.post(
                f"/api/interaction/job-alerts/{alert_id}/trigger/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(trigger_resp.status_code, 200)
            self.assertIn("matched_count", trigger_resp.json()["data"])

            # 5. Xóa Job Alert
            del_resp = self.client.delete(
                f"/api/interaction/job-alerts/{alert_id}/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(del_resp.status_code, 200)

            transaction.set_rollback(True)
