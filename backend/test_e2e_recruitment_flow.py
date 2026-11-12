"""
CAREZA - E2E Integrated Runtime Test Suite
Kiểm thử toàn diện 10 phạm vi nghiệp vụ tuyển dụng (CV, Pipeline, Phỏng vấn, Scorecard, Offer)
CHẾ ĐỘ MOCK ISOLATED RUNTIME: TUYỆT ĐỐI KHÔNG GHI VÀO POSTGRESQL CAREZA THẬT.
"""
import os
import sys
import json
import unittest
from unittest.mock import MagicMock, patch
from datetime import datetime, timezone, timedelta, date

# Thiết lập Django settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
import django
django.setup()

from rest_framework.exceptions import ValidationError, NotFound, PermissionDenied
from apps.recruitment.models import Applications, Offers, Jobs, Interviews
from apps.company.models import Companies
from apps.candidate.models import Profiles, Cvs
from apps.recruitment.services.employer_recruitment_service import EmployerRecruitmentService
from apps.candidate.services.candidate_service import CandidateService


class CarezaRecruitmentE2ETestCase(unittest.TestCase):

    # =========================================================================
    # Test 1: Doanh nghiệp đăng tin tuyển dụng -> Ứng viên xem JD
    # =========================================================================
    def test_01_job_detail_for_candidate(self):
        """Ứng viên xem chi tiết tin tuyển dụng (JD) với đầy đủ thông tin lương, công ty, địa điểm."""
        mock_job = Jobs(
            id=10,
            title="Senior React / Next.js Developer",
            slug="senior-react-nextjs-developer",
            description="Mô tả công việc chi tiết...",
            requirements="Yêu cầu từ 3 năm kinh nghiệm...",
            benefits="Bảo hiểm PVI, thưởng quý...",
            salary_min=25000000,
            salary_max=40000000,
            currency="VND",
            work_mode="hybrid",
            employment_type="full_time",
            location_id=None,
        )
        mock_company = Companies(
            id=5,
            name="Careza Tech",
            slug="careza-tech",
            logo_url="https://careza.vn/logo.png",
            verification_status="verified",
        )
        mock_job.company = mock_company

        with patch("apps.recruitment.models.Jobs.objects.select_related") as mock_sr, \
             patch("apps.interaction.models.SavedJobs.objects.filter") as mock_sj, \
             patch("apps.recruitment.models.Applications.objects.filter") as mock_app_f, \
             patch("apps.recruitment.models.Jobs.objects.filter") as mock_other_jobs, \
             patch("django.db.connection.cursor") as mock_cursor:
            
            mock_sr.return_value.filter.return_value.first.return_value = mock_job
            mock_sj.return_value.exists.return_value = False
            mock_app_f.return_value.exists.return_value = False
            mock_other_jobs.return_value.exclude.return_value = []
            
            cursor_ctx = MagicMock()
            cursor_ctx.fetchall.return_value = [("React",), ("TypeScript",), ("Next.js",)]
            mock_cursor.return_value.__enter__.return_value = cursor_ctx

            result = CandidateService.get_job_detail(job_id=10, user_id=1)
            self.assertEqual(result["id"], 10)
            self.assertEqual(result["title"], "Senior React / Next.js Developer")
            self.assertEqual(result["company"]["name"], "Careza Tech")
            self.assertTrue(result["company"]["is_verified"])
            self.assertIn("React", result["skills"])

    # =========================================================================
    # Test 2 & 3: Ứng viên nộp CV -> Doanh nghiệp xem CV Snapshot & Pipeline
    # =========================================================================
    def test_02_and_03_cv_snapshot_and_pipeline(self):
        """Đơn ứng tuyển truy xuất chính xác CV snapshot tại thời điểm nộp và hỗ trợ pipeline."""
        mock_job = Jobs(id=20, title="Product Designer")
        mock_cand = Profiles(id=88)
        mock_user = MagicMock()
        mock_user.full_name = "Lê Thị B"
        mock_user.email = "lethib@careza.vn"
        mock_user.phone = "0987654321"
        mock_user.avatar_url = None
        mock_cand.user = mock_user

        mock_cv = Cvs(id=12, title="CV Product Designer 2026", file_url="https://careza.vn/cvs/snapshot_v1.pdf")
        mock_cv.file_size = 512000
        mock_cv.updated_at = datetime.now(timezone.utc)

        mock_app = Applications(
            id=505,
            job=mock_job,
            candidate=mock_cand,
            cv=mock_cv,
            status="screening",
            applied_at=datetime.now(timezone.utc),
            cover_letter="Tôi muốn ứng tuyển vị trí này."
        )

        mock_company = Companies(id=5, name="Careza UI")

        with patch.object(EmployerRecruitmentService, "get_company", return_value=mock_company), \
             patch("apps.recruitment.models.Applications.objects.select_related") as mock_sr, \
             patch("apps.recruitment.models.ApplicationHistory.objects.filter") as mock_hist_f, \
             patch("apps.recruitment.models.Interviews.objects.filter") as mock_iv_f, \
             patch("apps.recruitment.models.Scorecards.objects.filter") as mock_sc_f, \
             patch("apps.recruitment.models.Offers.objects.filter") as mock_off_f:

            mock_sr.return_value.filter.return_value.first.return_value = mock_app
            mock_hist_f.return_value.order_by.return_value.values.return_value = []
            mock_iv_f.return_value.order_by.return_value.values.return_value = []
            mock_sc_f.return_value.order_by.return_value = []
            mock_off_f.return_value.first.return_value = None

            detail = EmployerRecruitmentService.get_application_detail(user_id=1, app_id=505)
            self.assertEqual(detail["id"], 505)
            self.assertEqual(detail["status"], "screening")
            self.assertIsNotNone(detail["cv"])
            self.assertEqual(detail["cv"]["id"], 12)
            self.assertEqual(detail["cv"]["file_url"], "https://careza.vn/cvs/snapshot_v1.pdf")

    # =========================================================================
    # Test 4: Lên lịch phỏng vấn & Kiểm tra xung đột lịch an toàn
    # =========================================================================
    def test_04_interview_conflict_safety_check(self):
        """Backend ném lỗi ValidationError nếu phát hiện trùng giờ phỏng vấn khi chưa chấp thuận."""
        mock_company = Companies(id=10, name="Careza AI")
        mock_job = Jobs(id=30, title="AI Engineer", company=mock_company)
        mock_cand = Profiles(id=99)
        mock_app = Applications(id=201, job=mock_job, candidate=mock_cand, status="shortlisted")

        now_dt = datetime(2026, 11, 10, 14, 0, 0, tzinfo=timezone.utc)

        class DummyInterview:
            def __init__(self, id, scheduled_at, duration_minutes):
                self.id = id
                self.scheduled_at = scheduled_at
                self.duration_minutes = duration_minutes

        existing_conflict = DummyInterview(99, now_dt, 60)

        with patch.object(EmployerRecruitmentService, "get_company", return_value=mock_company), \
             patch("apps.recruitment.models.Applications.objects.select_related") as mock_sr, \
             patch("apps.recruitment.models.Interviews.objects.filter") as mock_iv_filter:

            mock_sr.return_value.filter.return_value.first.return_value = mock_app
            mock_iv_filter.return_value = [existing_conflict]

            # Khi allow_conflict=False: Phải chặn bằng ValidationError
            with self.assertRaises(ValidationError) as ctx:
                EmployerRecruitmentService.schedule_interview(
                    user_id=10,
                    data={
                        "application_id": 201,
                        "scheduled_at": now_dt,
                        "duration_minutes": 60,
                        "allow_conflict": False,
                    }
                )
            self.assertIn("Trùng lịch", str(ctx.exception))

    # =========================================================================
    # Test 5: Tạo / Lưu nháp / Gửi Offer & Ứng viên chấp nhận/từ chối
    # =========================================================================
    def test_05_offer_acceptance_and_decline_pipeline_sync(self):
        """Ứng viên chấp nhận hoặc từ chối Offer: Trạng thái đồng bộ chính xác, không tự ý chuyển sang HIRED."""
        mock_profile = Profiles(id=101)
        mock_user = MagicMock(id=101, full_name="Nguyễn Văn A")
        mock_profile.user = mock_user

        mock_company = Companies(id=8, name="Careza Cloud")
        mock_recruiter = MagicMock(id=999)
        mock_job = Jobs(id=50, title="DevOps Engineer", company=mock_company, created_by=mock_recruiter)
        mock_app = Applications(id=801, job=mock_job, candidate=mock_profile, status="offered")

        # 1. Ứng viên chấp nhận Offer
        mock_offer = Offers(id=901, application=mock_app, status="sent")
        future_str = (date.today() + timedelta(days=10)).isoformat()
        mock_offer.letter_url = json.dumps({"deadline": future_str})

        with patch.object(CandidateService, "get_or_create_profile", return_value=mock_profile), \
             patch("apps.recruitment.models.Offers.objects.select_related") as mock_sr, \
             patch.object(mock_offer, "save") as mock_offer_save, \
             patch("apps.recruitment.models.ApplicationHistory.objects.create") as mock_hist_create, \
             patch("apps.interaction.models.Notifications.objects.create") as mock_noti_create:
            mock_sr.return_value.filter.return_value.first.return_value = mock_offer

            res = CandidateService.accept_candidate_offer(user_id=1, offer_id=901, note="Rất sẵn sàng!")
            self.assertEqual(res["status"], "ACCEPTED")
            self.assertEqual(mock_offer.status, "accepted")

            # Quan trọng: Trạng thái hồ sơ vẫn giữ là 'offered' (không tự ý nhảy sang hired)
            self.assertEqual(mock_app.status, "offered")
            mock_hist_create.assert_called_once()
            mock_noti_create.assert_called_once()

        # 2. Ứng viên từ chối Offer
        mock_offer_decline = Offers(id=902, application=mock_app, status="sent")

        with patch.object(CandidateService, "get_or_create_profile", return_value=mock_profile), \
             patch("apps.recruitment.models.Offers.objects.select_related") as mock_sr, \
             patch.object(mock_offer_decline, "save") as mock_decline_save, \
             patch("apps.recruitment.models.ApplicationHistory.objects.create") as mock_hist_create, \
             patch("apps.interaction.models.Notifications.objects.create") as mock_noti_create:
            mock_sr.return_value.filter.return_value.first.return_value = mock_offer_decline

            res_dec = CandidateService.decline_candidate_offer(user_id=1, offer_id=902, reason="Tìm được việc gần nhà hơn")
            self.assertEqual(res_dec["status"], "REJECTED")
            self.assertEqual(mock_offer_decline.status, "rejected")
            # Tuyệt đối không chuyển sang HIRED
            self.assertNotEqual(mock_app.status, "hired")
            mock_hist_create.assert_called_once()
            mock_noti_create.assert_called_once()

    # =========================================================================
    # Test 6: Kiểm tra thu hồi Offer, chặn trùng Offer, chặn hồ sơ không hợp lệ
    # =========================================================================
    def test_06_offer_validation_and_cancellation(self):
        """Doanh nghiệp không thể tạo Offer trùng lặp, không tạo cho hồ sơ đã từ chối/rút đơn."""
        mock_company = Companies(id=99, name="Careza Enterprise")
        mock_job = Jobs(id=60, title="Software Engineer", company=mock_company)
        mock_cand = Profiles(id=55)
        mock_cand.user = MagicMock(id=55)

        # Case 1: Hồ sơ đã bị từ chối (status = 'rejected')
        mock_app_rejected = Applications(id=301, job=mock_job, candidate=mock_cand, status="rejected")

        with patch.object(EmployerRecruitmentService, "get_company", return_value=mock_company), \
             patch("apps.recruitment.models.Applications.objects.select_related") as mock_sr:
            mock_sr.return_value.filter.return_value.first.return_value = mock_app_rejected

            with self.assertRaises(ValidationError) as ctx:
                EmployerRecruitmentService.create_or_update_offer(
                    user_id=10,
                    data={"application_id": 301, "salary": 25000000, "start_date": "2026-11-01"}
                )
            self.assertIn("đã từ chối hoặc ứng viên đã rút đơn", str(ctx.exception))

        # Case 2: Hồ sơ đã có Offer khác trước đó (chặn trùng lặp khi tạo mới)
        mock_app_valid = Applications(id=302, job=mock_job, candidate=mock_cand, status="interview")
        mock_existing_offer = Offers(id=701, application=mock_app_valid)

        with patch.object(EmployerRecruitmentService, "get_company", return_value=mock_company), \
             patch("apps.recruitment.models.Applications.objects.select_related") as mock_sr, \
             patch("apps.recruitment.models.Offers.objects.filter") as mock_offer_filter:
            mock_sr.return_value.filter.return_value.first.return_value = mock_app_valid
            mock_offer_filter.return_value.first.return_value = mock_existing_offer

            # Gửi request tạo mới (không có offer_id)
            with self.assertRaises(ValidationError) as ctx:
                EmployerRecruitmentService.create_or_update_offer(
                    user_id=10,
                    data={"application_id": 302, "salary": 30000000, "start_date": "2026-11-01"}
                )
            self.assertIn("đã có Thư mời nhận việc", str(ctx.exception))

        # Case 3: Thu hồi Offer thành công
        mock_offer_to_cancel = Offers(id=702, application=mock_app_valid, status="sent")

        with patch.object(EmployerRecruitmentService, "get_company", return_value=mock_company), \
             patch("apps.recruitment.models.Offers.objects.select_related") as mock_sr, \
             patch.object(mock_offer_to_cancel, "save") as mock_save, \
             patch("apps.recruitment.models.ApplicationHistory.objects.create") as mock_hist_create, \
             patch("apps.interaction.models.Notifications.objects.create") as mock_noti_create:
            mock_sr.return_value.filter.return_value.first.return_value = mock_offer_to_cancel

            res = EmployerRecruitmentService.cancel_offer(user_id=10, offer_id=702, reason="Điều chỉnh kế hoạch")
            self.assertEqual(res["status"], "cancelled")
            self.assertEqual(mock_offer_to_cancel.status, "cancelled")
            mock_hist_create.assert_called_once()
            mock_noti_create.assert_called_once()

    # =========================================================================
    # Test 7: Backend ngăn chặn chấp nhận Offer hết hạn, đã thu hồi, hoặc sai quyền
    # =========================================================================
    def test_07_prevent_accepting_invalid_offers(self):
        """Backend từ chối chấp nhận Offer đã thu hồi, hết hạn hoặc không ở trạng thái 'sent'."""
        mock_profile = Profiles(id=101)

        # Case 1: Offer đã bị thu hồi (status = 'cancelled')
        mock_offer_cancelled = Offers(id=881, status="cancelled")

        with patch.object(CandidateService, "get_or_create_profile", return_value=mock_profile), \
             patch("apps.recruitment.models.Offers.objects.select_related") as mock_sr:
            mock_sr.return_value.filter.return_value.first.return_value = mock_offer_cancelled

            with self.assertRaises(ValidationError) as ctx:
                CandidateService.accept_candidate_offer(user_id=1, offer_id=881)
            self.assertIn("trạng thái hiện tại là 'cancelled'", str(ctx.exception))

        # Case 2: Offer đã quá hạn phản hồi (deadline trong quá khứ)
        mock_offer_expired = Offers(id=882, status="sent")
        yesterday_str = (date.today() - timedelta(days=2)).isoformat()
        mock_offer_expired.letter_url = json.dumps({"deadline": yesterday_str})

        with patch.object(CandidateService, "get_or_create_profile", return_value=mock_profile), \
             patch("apps.recruitment.models.Offers.objects.select_related") as mock_sr, \
             patch.object(mock_offer_expired, "save"):
            mock_sr.return_value.filter.return_value.first.return_value = mock_offer_expired

            with self.assertRaises(ValidationError) as ctx:
                CandidateService.accept_candidate_offer(user_id=1, offer_id=882)
            self.assertIn("hết hạn", str(ctx.exception))
            # Xác nhận offer được cập nhật thành 'expired'
            self.assertEqual(mock_offer_expired.status, "expired")

        # Case 3: Offer không tồn tại hoặc không thuộc về ứng viên đang đăng nhập
        with patch.object(CandidateService, "get_or_create_profile", return_value=mock_profile), \
             patch("apps.recruitment.models.Offers.objects.select_related") as mock_sr:
            mock_sr.return_value.filter.return_value.first.return_value = None

            with self.assertRaises(NotFound):
                CandidateService.accept_candidate_offer(user_id=1, offer_id=999)

    # =========================================================================
    # Test 8: Khả năng tương thích ngược của letter_url (JSON vs Plain Legacy URL)
    # =========================================================================
    def test_08_letter_url_compatibility(self):
        """Xác nhận việc lưu JSON trong letter_url không ảnh hưởng khả năng đọc dữ liệu Offer cũ."""
        # 1. Dữ liệu cũ là URL văn bản thuần túy (legacy format)
        legacy_url = "https://storage.careza.vn/offers/2025/offer_letter_102.pdf"
        decoded_legacy = EmployerRecruitmentService._decode_offer_payload(legacy_url)
        self.assertEqual(decoded_legacy["letter_url"], legacy_url)
        self.assertEqual(decoded_legacy["contract_type"], "full_time")
        self.assertEqual(decoded_legacy["deadline"], "")

        # 2. Dữ liệu mới dạng JSON
        new_payload = EmployerRecruitmentService._encode_offer_payload(
            contract_type="Toàn thời gian chính thức",
            work_location="Landmark 81, TP. HCM",
            deadline="2026-11-15",
            position="Senior React Developer",
            notes="Chào đón bạn gia nhập team!",
            terms="Lương thử việc 100%, bảo hiểm PVI",
            letter_url="https://storage.careza.vn/offers/new_offer.pdf"
        )
        self.assertTrue(new_payload.startswith("{") and new_payload.endswith("}"))

        decoded_new = EmployerRecruitmentService._decode_offer_payload(new_payload)
        self.assertEqual(decoded_new["contract_type"], "Toàn thời gian chính thức")
        self.assertEqual(decoded_new["work_location"], "Landmark 81, TP. HCM")
        self.assertEqual(decoded_new["deadline"], "2026-11-15")
        self.assertEqual(decoded_new["position"], "Senior React Developer")
        self.assertEqual(decoded_new["terms"], "Lương thử việc 100%, bảo hiểm PVI")
        self.assertEqual(decoded_new["letter_url"], "https://storage.careza.vn/offers/new_offer.pdf")

        # 3. Dữ liệu None hoặc rỗng
        decoded_empty = EmployerRecruitmentService._decode_offer_payload("")
        self.assertEqual(decoded_empty["contract_type"], "full_time")
        self.assertEqual(decoded_empty["letter_url"], "")

        decoded_none = EmployerRecruitmentService._decode_offer_payload(None)
        self.assertEqual(decoded_none["contract_type"], "full_time")

    # =========================================================================
    # Test 9: Kiểm tra thông báo nội bộ và lịch sử thao tác (ApplicationHistory)
    # =========================================================================
    def test_09_audit_history_and_notification_triggers(self):
        """Xác nhận mọi bước gửi/chấp nhận/từ chối/thu hồi đều sinh ApplicationHistory và Notifications."""
        mock_company = Companies(id=1, name="CAREZA Group")
        mock_cand = Profiles(id=77)
        mock_cand.user = MagicMock(id=77)
        mock_job = Jobs(id=40, title="Data Engineer", company=mock_company)
        mock_app = Applications(id=404, status="interview", candidate=mock_cand, job=mock_job)

        with patch.object(EmployerRecruitmentService, "get_company", return_value=mock_company), \
             patch("apps.recruitment.models.Applications.objects.select_related") as mock_sr, \
             patch("apps.recruitment.models.Offers.objects.filter") as mock_off_filter, \
             patch("apps.recruitment.models.Offers.objects.create") as mock_off_create, \
             patch.object(mock_app, "save") as mock_app_save, \
             patch("apps.recruitment.models.ApplicationHistory.objects.create") as mock_hist_create, \
             patch("apps.interaction.models.Notifications.objects.create") as mock_noti_create:

            mock_sr.return_value.filter.return_value.first.return_value = mock_app
            mock_off_filter.return_value.first.return_value = None

            mock_offer_created = Offers(id=555, application=mock_app, salary=30000000, start_date=date(2026, 12, 1), status="sent")
            mock_off_create.return_value = mock_offer_created

            res = EmployerRecruitmentService.create_or_update_offer(
                user_id=1,
                data={
                    "application_id": 404,
                    "salary": 30000000,
                    "start_date": "2026-12-01",
                    "status": "sent"
                }
            )

            # Kiểm tra trạng thái hồ sơ chuyển sang offered
            self.assertEqual(mock_app.status, "offered")
            # Kiểm tra ApplicationHistory được ghi
            mock_hist_create.assert_called_once()
            hist_call = mock_hist_create.call_args[1]
            self.assertEqual(hist_call["from_status"], "interview")
            self.assertEqual(hist_call["to_status"], "offered")
            # Kiểm tra Notifications được gửi cho ứng viên
            mock_noti_create.assert_called_once()
            noti_call = mock_noti_create.call_args[1]
            self.assertEqual(noti_call["user_id"], 77)
            self.assertEqual(noti_call["type"], "offer_received")

    # =========================================================================
    # Test 10: Xác nhận API ứng viên không để lộ Scorecard hoặc nhận xét nội bộ
    # =========================================================================
    def test_10_candidate_api_never_exposes_scorecards(self):
        """Xác nhận get_application_detail của ứng viên không bao giờ trả về Scorecard hoặc nhận xét nội bộ."""
        mock_profile = Profiles(id=101)

        mock_company = Companies(id=3, name="Careza Tech Corp", logo_url=None)
        mock_job = Jobs(
            id=501,
            title="Backend Golang Engineer",
            company=mock_company,
            salary_min=20000000,
            salary_max=35000000,
            location_id=None,
        )
        mock_cv = Cvs(id=7, title="Golang CV")
        mock_app = Applications(
            id=501,
            job=mock_job,
            candidate=mock_profile,
            cv=mock_cv,
            status="interview",
            applied_at=datetime.now(timezone.utc),
            cover_letter="Em rất mong muốn được cống hiến..."
        )

        with patch.object(CandidateService, "get_or_create_profile", return_value=mock_profile), \
             patch("apps.recruitment.models.Applications.objects.select_related") as mock_sr, \
             patch("apps.recruitment.models.ApplicationHistory.objects.filter") as mock_hist_filter, \
             patch("apps.recruitment.models.Interviews.objects.filter") as mock_interview_filter:

            mock_sr.return_value.filter.return_value.first.return_value = mock_app
            mock_hist_filter.return_value.order_by.return_value.values.return_value = []
            mock_interview_filter.return_value.order_by.return_value = []

            # Gọi CandidateService.get_application_detail(user_id=1, app_id=501)
            result = CandidateService.get_application_detail(1, 501)

            # Khẳng định 100% không chứa trường đánh giá nội bộ
            self.assertNotIn("scorecards", result)
            self.assertNotIn("scorecard", result)
            self.assertNotIn("internal_notes", result)
            self.assertNotIn("interviewer_score", result)
            self.assertIn("job", result)
            self.assertIn("status", result)


if __name__ == "__main__":
    unittest.main()
