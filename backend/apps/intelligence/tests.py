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
from apps.candidate.models import Profiles, Cvs, CvVersions
from apps.recruitment.models import Jobs, JobSkills, Tests, TestAttempts, Applications
from apps.knowledge.models import Documents, Chunks, RagSessions, RagMessages
from apps.research.models import Datasets, AlgorithmConfigs, ExperimentRuns, ExperimentMetrics, CvJdPairs
from apps.intelligence.models import AiTasks, CvEvaluations, MatchResults, Recommendations, MockInterviews, Rubrics
from apps.intelligence.services.ai_intelligence_service import (
    CvParserService,
    CvEvaluatorService,
    CvJdMatchingService,
    RecommendationService,
    RagService,
    AiTaskService,
    BenchmarkService,
)


class AiIntelligenceModuleTests(unittest.TestCase):
    """
    Bộ kiểm tra chính thức cho toàn bộ Module AI Intelligence của CAREZA:
    1. Phân tích CV (CV Parsing)
    2. Đánh giá CV (CV Evaluation)
    3. CV-JD Matching (Độ phù hợp CV và tin tuyển dụng)
    4. Gợi ý việc làm cho ứng viên (Job Recommendations - TOPSIS)
    5. Gợi ý ứng viên cho doanh nghiệp (Candidate Recommendations - TOPSIS)
    6. RAG (Hỏi đáp kiến thức nghề nghiệp có căn cứ thực tế)
    7. Quản lý tác vụ AI & Kiểm soát Quota (AI Tasks & Quota)
    8. Đánh giá thuật toán & Benchmark thực tế (Research & Benchmarking)
    """

    def setUp(self):
        self.client = Client(SERVER_NAME="localhost")

    def test_01_cv_parsing(self):
        """1. Kiểm tra phân tích CV từ dữ liệu văn bản và cập nhật cấu trúc dữ liệu."""
        with transaction.atomic():
            user = Users.objects.filter(account_type="candidate").first()
            self.assertIsNotNone(user, "Cần ít nhất 1 tài khoản candidate để kiểm tra.")
            token = generate_tokens_for_user(user)["access_token"]

            cv = Cvs.objects.first()
            self.assertIsNotNone(cv, "Cần ít nhất 1 CV trong cơ sở dữ liệu.")

            sample_cv_text = """
            Nguyễn Văn Nam
            Email: nam.nguyen@example.com
            Số điện thoại: 0912345678
            Học vấn:
            Đại học Bách Khoa Hà Nội - Kỹ sư Công nghệ thông tin (2018 - 2022)
            Kinh nghiệm làm việc:
            Công ty Cổ phần Công nghệ ABC - Lập trình viên Backend (2022 - 2024)
            - Phát triển hệ thống REST API bằng Python, Django, DRF và PostgreSQL.
            - Triển khai dịch vụ bằng Docker, CI/CD trên máy chủ Linux.
            Kỹ năng:
            Python, Django, PostgreSQL, Docker, Git, REST API, Redis, Linux
            Dự án:
            Hệ thống sàn thương mại điện tử tuyển dụng CAREZA
            """

            resp = self.client.post(
                "/api/ai/cv-parse/",
                data=json.dumps({
                    "cv_id": cv.id,
                    "raw_text": sample_cv_text,
                    "save_version": True,
                }),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertTrue(data["success"])
            parsed = data["data"]["parsed_data"]

            # Kiểm tra trích xuất thông tin
            self.assertIn("nam.nguyen@example.com", parsed["candidate_info"]["email"])
            self.assertIn("0912345678", parsed["candidate_info"]["phone"])
            self.assertTrue(any("python" in s.lower() for s in parsed["skills"]))
            self.assertTrue(any("django" in s.lower() for s in parsed["skills"]))
            self.assertTrue(any("docker" in s.lower() for s in parsed["skills"]))

            # Kiểm tra lưu vào database
            cv.refresh_from_db()
            self.assertIsNotNone(cv.parsed_data)
            self.assertIn("candidate_info", cv.parsed_data)

            # Kiểm tra tạo AiTask tương ứng
            task = AiTasks.objects.filter(id=data["data"]["task_id"]).first()
            self.assertIsNotNone(task)
            self.assertEqual(task.task_type, "cv_parsing")
            self.assertEqual(task.status, "completed")

            transaction.set_rollback(True)

    def test_02_cv_evaluation(self):
        """2. Kiểm tra đánh giá CV, điểm mạnh/yếu và đề xuất cải thiện."""
        with transaction.atomic():
            user = Users.objects.filter(account_type="candidate").first()
            token = generate_tokens_for_user(user)["access_token"]

            cv = Cvs.objects.first()
            # Đảm bảo cv có parsed_text
            cv.parsed_text = "Lập trình viên Python Django PostgreSQL Docker. Kinh nghiệm 2 năm tại công ty ABC."
            cv.save(update_fields=["parsed_text"])

            resp = self.client.post(
                "/api/ai/cv-evaluate/",
                data=json.dumps({"cv_id": cv.id, "rubric_version": "standard_v1.0"}),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(resp.status_code, 200)
            data = resp.json()["data"]

            self.assertIn("score", data)
            self.assertGreaterEqual(data["score"], 0.0)
            self.assertLessEqual(data["score"], 100.0)

            feedback = data["feedback"]
            self.assertIn("strengths", feedback)
            self.assertIn("weaknesses", feedback)
            self.assertIn("missing_skills", feedback)
            self.assertIn("recommendations", feedback)

            # Kiểm tra lưu vào cv_evaluations
            eval_record = CvEvaluations.objects.filter(cv_id=cv.id).first()
            self.assertIsNotNone(eval_record)
            self.assertEqual(eval_record.rubric_version, "standard_v1.0")

            transaction.set_rollback(True)

    def test_03_cv_jd_matching(self):
        """3. Kiểm tra thuật toán CV-JD Matching (TF-IDF + Skill Overlap + Experience Score)."""
        with transaction.atomic():
            user = Users.objects.filter(account_type="candidate").first()
            token = generate_tokens_for_user(user)["access_token"]

            cv = Cvs.objects.first()
            cv.parsed_text = "Lập trình viên chuyên về Python, Django, DRF, PostgreSQL, Docker, Git. 3 năm kinh nghiệm."
            cv.save(update_fields=["parsed_text"])

            job = Jobs.objects.first()
            job.title = "Kỹ sư Backend Python / Django"
            job.description = "Tuyển dụng kỹ sư phát triển backend hệ thống với Python và Django."
            job.requirements = "Thành thạo Python, Django, PostgreSQL, Docker. Tối thiểu 2 năm kinh nghiệm."
            job.experience_min = 2
            job.save(update_fields=["title", "description", "requirements", "experience_min"])

            resp = self.client.post(
                "/api/ai/match/",
                data=json.dumps({"cv_id": cv.id, "job_id": job.id}),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(resp.status_code, 200)
            data = resp.json()["data"]

            self.assertIn("hybrid_score", data)
            self.assertIn("tfidf_cosine", data)
            self.assertIn("skill_score", data)
            self.assertIn("experience_score", data)
            self.assertIn("explanation", data)

            # Điểm matching phải hợp lệ trong khoảng [0, 1]
            self.assertGreater(data["hybrid_score"], 0.0)
            self.assertLessEqual(data["hybrid_score"], 1.0)

            # Kiểm tra lưu vào match_results
            match_obj = MatchResults.objects.filter(cv_id=cv.id, job_id=job.id).first()
            self.assertIsNotNone(match_obj)
            self.assertEqual(match_obj.algorithm_version, CvJdMatchingService.ALGORITHM_VERSION)

            transaction.set_rollback(True)

    def test_04_job_recommendations(self):
        """4. Kiểm tra gợi ý việc làm cho ứng viên với thuật toán xếp hạng TOPSIS."""
        with transaction.atomic():
            user = Users.objects.filter(account_type="candidate").first()
            token = generate_tokens_for_user(user)["access_token"]

            profile = Profiles.objects.filter(user_id=user.id).first()
            if not profile:
                profile = Profiles.objects.create(user_id=user.id, full_name="Test Candidate")

            cv = Cvs.objects.filter(profile=profile).first()
            if not cv:
                cv = Cvs.objects.create(
                    profile=profile,
                    title="CV Python Backend",
                    parsed_text="Kỹ năng: Python, Django, PostgreSQL, Git. 2 năm kinh nghiệm.",
                    is_primary=True,
                )

            resp = self.client.get(
                f"/api/ai/recommendations/jobs/?cv_id={cv.id}&top_k=5",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(resp.status_code, 200)
            data = resp.json()["data"]
            recs = data["recommendations"]

            self.assertIsInstance(recs, list)
            if recs:
                top_item = recs[0]
                self.assertIn("rank_position", top_item)
                self.assertIn("topsis_score", top_item)
                self.assertIn("job", top_item)
                self.assertEqual(top_item["rank_position"], 1)

                # Kiểm tra lưu vào recommendations table
                rec_record = Recommendations.objects.filter(candidate_id=user.id).first()
                self.assertIsNotNone(rec_record)

            transaction.set_rollback(True)

    def test_05_candidate_recommendations(self):
        """5. Kiểm tra gợi ý ứng viên cho doanh nghiệp theo tin tuyển dụng cụ thể."""
        with transaction.atomic():
            user = Users.objects.filter(account_type="employer").first()
            self.assertIsNotNone(user, "Cần tài khoản employer để kiểm tra.")
            token = generate_tokens_for_user(user)["access_token"]

            member = Members.objects.filter(user_id=user.id).first()
            self.assertIsNotNone(member, "Employer cần thuộc một doanh nghiệp.")

            job = Jobs.objects.filter(company_id=member.company_id).first()
            if not job:
                # Nếu chưa có job thì liên kết job đầu tiên với company này để test
                job = Jobs.objects.first()
                job.company_id = member.company_id
                job.save(update_fields=["company_id"])

            resp = self.client.get(
                f"/api/ai/recommendations/candidates/?job_id={job.id}&top_k=5",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(resp.status_code, 200)
            data = resp.json()["data"]
            candidates = data["candidates"]

            self.assertIsInstance(candidates, list)
            if candidates:
                top_cand = candidates[0]
                self.assertIn("candidate", top_cand)
                self.assertIn("topsis_score", top_cand)
                self.assertIn("rank_position", top_cand)

            transaction.set_rollback(True)

    def test_06_rag_chat_and_session(self):
        """6. Kiểm tra luồng RAG: truy xuất tài liệu thực tế và sinh phản hồi có căn cứ."""
        with transaction.atomic():
            user = Users.objects.filter(account_type="candidate").first()
            token = generate_tokens_for_user(user)["access_token"]

            doc = Documents.objects.first()
            chunk = Chunks.objects.filter(document=doc).first()
            self.assertIsNotNone(chunk, "Cần ít nhất 1 chunk tài liệu để kiểm tra RAG.")

            # Trích xuất từ khóa thực tế trong chunk để hỏi
            tokens = chunk.content.split()[:4]
            test_question = " ".join(tokens) + " được quy định như thế nào?"

            resp = self.client.post(
                "/api/ai/rag/chat/",
                data=json.dumps({"question": test_question, "top_k": 3}),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(resp.status_code, 200)
            data = resp.json()["data"]

            self.assertIn("content", data)
            self.assertIn("session_id", data)
            self.assertIn("retrieved_chunk_ids", data)

            # Kiểm tra xem lịch sử phiên hội thoại RAG
            session_id = data["session_id"]
            hist_resp = self.client.get(
                f"/api/ai/rag/sessions/{session_id}/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(hist_resp.status_code, 200)
            hist_data = hist_resp.json()["data"]
            self.assertGreaterEqual(len(hist_data["messages"]), 2)  # Cả user message và assistant message

            transaction.set_rollback(True)

    def test_07_ai_tasks_management_and_quota(self):
        """7. Kiểm tra quản lý tác vụ AI và phân trang lịch sử tác vụ."""
        with transaction.atomic():
            user = Users.objects.filter(account_type="candidate").first()
            token = generate_tokens_for_user(user)["access_token"]

            # Tạo 1 tác vụ AI mẫu
            task = AiTasks.objects.create(
                requested_by=user.id,
                task_type="cv_parsing",
                model_name="test-parser",
                status="completed",
                created_at=datetime.now(timezone.utc),
            )

            resp = self.client.get(
                "/api/ai/tasks/?task_type=cv_parsing",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(resp.status_code, 200)
            data = resp.json()["data"]

            self.assertIn("items", data)
            self.assertIn("pagination", data)
            self.assertTrue(any(t["id"] == task.id for t in data["items"]))

            transaction.set_rollback(True)

    def test_08_algorithm_benchmark_research(self):
        """8. Kiểm tra đánh giá thuật toán và tính toán metric thực nghiệm trên schema research."""
        with transaction.atomic():
            user = Users.objects.filter(account_type="candidate").first()
            token = generate_tokens_for_user(user)["access_token"]

            dataset = Datasets.objects.first()
            self.assertIsNotNone(dataset, "Cần dataset trong research để benchmark.")

            resp = self.client.post(
                "/api/ai/benchmark/run/",
                data=json.dumps({
                    "dataset_id": dataset.id,
                    "config_code": "test_hybrid_v1",
                    "k_list": [1, 3],
                }),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(resp.status_code, 200)
            data = resp.json()["data"]

            self.assertIn("run_id", data)
            self.assertIn("metrics", data)
            metrics = data["metrics"]
            self.assertIn("P@1", metrics)
            self.assertIn("R@1", metrics)
            self.assertIn("MRR", metrics)

            # Kiểm tra lưu vào experiment_runs và experiment_metrics
            run_obj = ExperimentRuns.objects.filter(id=data["run_id"]).first()
            self.assertIsNotNone(run_obj)
            self.assertEqual(run_obj.status, "completed")

            metrics_count = ExperimentMetrics.objects.filter(run=run_obj).count()
            self.assertGreater(metrics_count, 0)

            transaction.set_rollback(True)


class AiMockInterviewAndAssessmentTests(unittest.TestCase):
    """
    Bộ kiểm tra chính thức cho AI Mock Interview & Assessment:
    1. Bắt đầu phiên phỏng vấn AI (Mock Interview Start)
    2. Trả lời từng câu hỏi & Chấm điểm tức thì (Submit Answer)
    3. Hoàn tất phỏng vấn & Đánh giá toàn diện (Complete Evaluation)
    4. Lịch sử & Chi tiết phiên phỏng vấn (History & Detail)
    5. Ứng viên xem và bắt đầu làm bài kiểm tra năng lực (Tests Start)
    6. Ứng viên nộp bài & Chấm tự động trắc nghiệm (Submit & Auto Grading)
    7. Doanh nghiệp quản lý bài test (Create, Update, Delete Tests)
    8. Doanh nghiệp xem bài làm & Chấm điểm tự luận (Grade Attempts)
    """

    def setUp(self):
        self.client = Client(SERVER_NAME="localhost")

    def test_01_start_mock_interview(self):
        """1. Kiểm tra tạo phiên phỏng vấn thử AI, sinh câu hỏi bám sát JD/CV/level."""
        with transaction.atomic():
            user = Users.objects.filter(account_type="candidate").first()
            self.assertIsNotNone(user)
            token = generate_tokens_for_user(user)["access_token"]

            job = Jobs.objects.first()

            resp = self.client.post(
                "/api/ai/interviews/",
                data=json.dumps({
                    "job_id": job.id if job else None,
                    "level": "middle",
                    "skills": ["Python", "Django", "PostgreSQL", "Docker"],
                }),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(resp.status_code, 201)
            data = resp.json()["data"]

            self.assertIn("interview_id", data)
            self.assertEqual(data["status"], "in_progress")
            self.assertGreaterEqual(data["total_questions"], 4)
            self.assertIn("current_question", data)

            # Kiểm tra lưu vào bảng intelligence.mock_interviews
            mock_obj = MockInterviews.objects.filter(id=data["interview_id"]).first()
            self.assertIsNotNone(mock_obj)
            self.assertEqual(mock_obj.status, "in_progress")
            self.assertEqual(mock_obj.user_id, user.id)

            transaction.set_rollback(True)

    def test_02_answer_mock_interview(self):
        """2. Kiểm tra trả lời câu hỏi phỏng vấn và nhận chấm điểm tức thì."""
        with transaction.atomic():
            user = Users.objects.filter(account_type="candidate").first()
            token = generate_tokens_for_user(user)["access_token"]

            # Tạo phiên phỏng vấn
            start_resp = self.client.post(
                "/api/ai/interviews/",
                data=json.dumps({"level": "junior", "skills": ["Python", "Django"]}),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            interview_id = start_resp.json()["data"]["interview_id"]

            # Gửi câu trả lời cho câu hỏi 1
            answer_text = (
                "Tôi đã có 2 năm kinh nghiệm lập trình Backend với Python và Django. "
                "Trong dự án gần nhất, tôi thiết kế hệ thống REST API, tối ưu truy vấn PostgreSQL "
                "và triển khai hệ thống thông qua Docker container trên server Linux."
            )
            ans_resp = self.client.post(
                f"/api/ai/interviews/{interview_id}/answer/",
                data=json.dumps({
                    "question_id": 1,
                    "answer": answer_text,
                    "duration_seconds": 45,
                }),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(ans_resp.status_code, 200)
            ans_data = ans_resp.json()["data"]

            self.assertEqual(ans_data["answered_question_id"], 1)
            self.assertGreater(ans_data["score"], 0.0)
            self.assertIn("feedback", ans_data)
            self.assertIn("strengths", ans_data["feedback"])

            # Kiểm tra transcript được lưu vào database
            mock_obj = MockInterviews.objects.get(id=interview_id)
            self.assertEqual(len(mock_obj.transcript), 1)
            self.assertEqual(mock_obj.transcript[0]["question_id"], 1)

            transaction.set_rollback(True)

    def test_03_complete_mock_interview(self):
        """3. Kiểm tra kết thúc phỏng vấn và nhận đánh giá toàn diện."""
        with transaction.atomic():
            user = Users.objects.filter(account_type="candidate").first()
            token = generate_tokens_for_user(user)["access_token"]

            start_resp = self.client.post(
                "/api/ai/interviews/",
                data=json.dumps({"level": "junior", "skills": ["React", "JavaScript"]}),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            interview_id = start_resp.json()["data"]["interview_id"]

            # Trả lời câu hỏi
            self.client.post(
                f"/api/ai/interviews/{interview_id}/answer/",
                data=json.dumps({
                    "question_id": 1,
                    "answer": "Tôi là kỹ sư Frontend chuyên sâu về ReactJS, TypeScript và xây dựng SPA hiệu năng cao.",
                }),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )

            # Hoàn tất phỏng vấn
            complete_resp = self.client.post(
                f"/api/ai/interviews/{interview_id}/complete/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(complete_resp.status_code, 200)
            eval_data = complete_resp.json()["data"]

            self.assertEqual(eval_data["status"], "completed")
            self.assertGreater(eval_data["final_score"], 0.0)
            self.assertIn("dialogue_metrics", eval_data)
            self.assertIn("speech_metrics", eval_data)
            self.assertIn("positives", eval_data)
            self.assertIn("advice", eval_data)

            # Kiểm tra cập nhật trạng thái trong database
            mock_obj = MockInterviews.objects.get(id=interview_id)
            self.assertEqual(mock_obj.status, "completed")
            self.assertIsNotNone(mock_obj.content_score)
            self.assertIsNotNone(mock_obj.finished_at)

            transaction.set_rollback(True)

    def test_04_interview_history_and_detail(self):
        """4. Kiểm tra xem lịch sử phỏng vấn và chi tiết phiên."""
        with transaction.atomic():
            user = Users.objects.filter(account_type="candidate").first()
            token = generate_tokens_for_user(user)["access_token"]

            # 1. Danh sách lịch sử
            list_resp = self.client.get(
                "/api/ai/interviews/?page=1&page_size=5",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(list_resp.status_code, 200)
            self.assertIn("items", list_resp.json()["data"])

            # 2. Xem chi tiết phiên
            mock = MockInterviews.objects.first()
            if mock:
                # Đảm bảo phiên thuộc user này để test quyền truy cập
                mock.user_id = user.id
                mock.save(update_fields=["user_id"])

                detail_resp = self.client.get(
                    f"/api/ai/interviews/{mock.id}/",
                    HTTP_AUTHORIZATION=f"Bearer {token}",
                )
                self.assertEqual(detail_resp.status_code, 200)
                detail_data = detail_resp.json()["data"]
                self.assertEqual(detail_data["id"], mock.id)
                self.assertIn("questions", detail_data)

            transaction.set_rollback(True)

    def test_05_candidate_view_and_start_test(self):
        """5. Kiểm tra ứng viên xem danh sách bài test, xem đề thi (ẩn đáp án) và bắt đầu làm bài."""
        with transaction.atomic():
            user = Users.objects.filter(account_type="candidate").first()
            token = generate_tokens_for_user(user)["access_token"]

            # 1. Danh sách bài test
            list_resp = self.client.get(
                "/api/candidate/tests/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(list_resp.status_code, 200)
            tests = list_resp.json()["data"]["tests"]
            self.assertIsInstance(tests, list)

            test_obj = Tests.objects.first()
            self.assertIsNotNone(test_obj)

            # Cấu hình câu hỏi mẫu có cả trắc nghiệm và đáp án đúng
            test_obj.questions = [
                {
                    "id": 1,
                    "type": "multiple_choice",
                    "question": "Trong Django, ORM viết tắt của từ gì?",
                    "options": ["Object Relational Mapping", "Object Resource Model", "Online Request Manager"],
                    "correct_answer": "Object Relational Mapping",
                },
                {
                    "id": 2,
                    "type": "essay",
                    "question": "Nêu sự khác biệt giữa function-based view và class-based view trong Django.",
                }
            ]
            test_obj.save(update_fields=["questions"])

            # 2. Xem chi tiết bài test (Ứng viên không được thấy correct_answer)
            detail_resp = self.client.get(
                f"/api/candidate/tests/{test_obj.id}/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(detail_resp.status_code, 200)
            q_list = detail_resp.json()["data"]["test"]["questions"]
            self.assertEqual(len(q_list), 2)
            # Khẳng định bảo mật đề thi: không chứa correct_answer
            self.assertNotIn("correct_answer", q_list[0])

            # 3. Bắt đầu làm bài test
            start_resp = self.client.post(
                f"/api/candidate/tests/{test_obj.id}/start/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(start_resp.status_code, 201)
            attempt_id = start_resp.json()["data"]["attempt_id"]

            att_obj = TestAttempts.objects.filter(id=attempt_id).first()
            self.assertIsNotNone(att_obj)
            self.assertIsNone(att_obj.completed_at)

            transaction.set_rollback(True)

    def test_06_candidate_submit_test_auto_grading(self):
        """6. Kiểm tra nộp bài làm: Chấm tự động trắc nghiệm và chuyển câu tự luận sang chấm thủ công."""
        with transaction.atomic():
            user = Users.objects.filter(account_type="candidate").first()
            token = generate_tokens_for_user(user)["access_token"]

            test_obj = Tests.objects.first()
            test_obj.questions = [
                {
                    "id": 1,
                    "type": "multiple_choice",
                    "question": "Phương thức HTTP nào dùng để cập nhật một phần tài nguyên?",
                    "options": ["GET", "POST", "PATCH", "DELETE"],
                    "correct_answer": "PATCH",
                },
                {
                    "id": 2,
                    "type": "essay",
                    "question": "Giải thích cơ chế Indexing trong PostgreSQL giúp tăng tốc độ truy vấn thế nào.",
                }
            ]
            test_obj.save(update_fields=["questions"])

            # Bắt đầu làm bài
            start_resp = self.client.post(
                f"/api/candidate/tests/{test_obj.id}/start/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            attempt_id = start_resp.json()["data"]["attempt_id"]

            # Nộp bài: Câu 1 trả lời đúng ("PATCH"), Câu 2 tự luận
            submit_resp = self.client.post(
                f"/api/candidate/test-attempts/{attempt_id}/submit/",
                data=json.dumps({
                    "answers": [
                        {"question_id": 1, "answer": "PATCH"},
                        {"question_id": 2, "answer": "Index sử dụng cây B-Tree để giảm chi phí quét toàn bảng O(N) xuống O(log N)."},
                    ]
                }),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(submit_resp.status_code, 200)
            res = submit_resp.json()["data"]

            # Trắc nghiệm đúng 1/1 câu -> 100 điểm trắc nghiệm
            self.assertEqual(res["mcq_correct"], 1)
            self.assertEqual(res["score"], 100.0)
            self.assertTrue(res["has_pending_essay"])
            self.assertEqual(res["status"], "pending_manual_grading")

            # Kiểm tra lưu vào database
            att = TestAttempts.objects.get(id=attempt_id)
            self.assertIsNotNone(att.completed_at)
            self.assertEqual(float(att.score), 100.0)

            # Ứng viên xem lịch sử bài làm
            history_resp = self.client.get(
                "/api/candidate/test-attempts/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(history_resp.status_code, 200)

            transaction.set_rollback(True)

    def test_07_employer_manage_tests(self):
        """7. Kiểm tra doanh nghiệp quản lý bài test: Tạo, Xem, Sửa, Xóa bài test."""
        with transaction.atomic():
            employer_user = Users.objects.filter(account_type="employer").first()
            self.assertIsNotNone(employer_user)
            token = generate_tokens_for_user(employer_user)["access_token"]

            member = Members.objects.filter(user_id=employer_user.id).first()
            self.assertIsNotNone(member)

            # 1. Tạo bài test mới
            create_resp = self.client.post(
                "/api/companies/me/tests/",
                data=json.dumps({
                    "title": "Bài test lập trình Python Backend nâng cao",
                    "duration_minutes": 45,
                    "questions": [
                        {
                            "id": 1,
                            "type": "multiple_choice",
                            "question": "Gil trong Python viết tắt của gì?",
                            "options": ["Global Interpreter Lock", "General Interface Language"],
                            "correct_answer": "Global Interpreter Lock",
                        }
                    ],
                }),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(create_resp.status_code, 201)
            test_id = create_resp.json()["data"]["test"]["id"]

            # 2. Xem chi tiết bài test (Doanh nghiệp thấy đầy đủ cả correct_answer)
            detail_resp = self.client.get(
                f"/api/companies/me/tests/{test_id}/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(detail_resp.status_code, 200)
            t_detail = detail_resp.json()["data"]["test"]
            self.assertIn("correct_answer", t_detail["questions"][0])

            # 3. Cập nhật bài test
            update_resp = self.client.put(
                f"/api/companies/me/tests/{test_id}/",
                data=json.dumps({"title": "Bài test Python & System Design Cập Nhật", "duration_minutes": 60}),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(update_resp.status_code, 200)
            self.assertEqual(update_resp.json()["data"]["test"]["title"], "Bài test Python & System Design Cập Nhật")

            # 4. Xóa bài test
            del_resp = self.client.delete(
                f"/api/companies/me/tests/{test_id}/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(del_resp.status_code, 200)

            transaction.set_rollback(True)

    def test_08_employer_view_and_grade_attempt(self):
        """8. Kiểm tra doanh nghiệp xem bài làm của ứng viên và chấm điểm tự luận."""
        with transaction.atomic():
            employer_user = Users.objects.filter(account_type="employer").first()
            token = generate_tokens_for_user(employer_user)["access_token"]

            member = Members.objects.filter(user_id=employer_user.id).first()

            # Chuẩn bị bài test thuộc công ty
            test_obj = Tests.objects.filter(company_id=member.company_id).first()
            if not test_obj:
                test_obj = Tests.objects.create(
                    company_id=member.company_id,
                    title="Bài test đánh giá chuyên môn",
                    duration_minutes=30,
                    status="active",
                )

            # Tạo bài làm mẫu
            app = Applications.objects.filter(job__company_id=member.company_id).first()
            if not app:
                app = Applications.objects.first()

            attempt = TestAttempts.objects.create(
                test=test_obj,
                application=app,
                answers=[{"question_id": 1, "answer": "Nội dung tự luận của ứng viên..."}],
                score=70.0,
                started_at=datetime.now(timezone.utc),
                completed_at=datetime.now(timezone.utc),
            )

            # 1. Doanh nghiệp xem danh sách bài làm
            attempts_resp = self.client.get(
                f"/api/companies/me/tests/{test_obj.id}/attempts/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(attempts_resp.status_code, 200)
            attempts_list = attempts_resp.json()["data"]["attempts"]
            self.assertTrue(any(a["id"] == attempt.id for a in attempts_list))

            # 2. Doanh nghiệp chấm điểm tự luận / điều chỉnh điểm bài làm
            grade_resp = self.client.post(
                f"/api/companies/me/test-attempts/{attempt.id}/grade/",
                data=json.dumps({
                    "score": 88.5,
                    "feedback": "Phần tự luận phân tích rất sắc bén và đúng trọng tâm kiến trúc.",
                }),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(grade_resp.status_code, 200)
            self.assertEqual(grade_resp.json()["data"]["score"], 88.5)

            # Kiểm tra cập nhật trong database
            attempt.refresh_from_db()
            self.assertEqual(float(attempt.score), 88.5)

            transaction.set_rollback(True)


