from datetime import datetime, timezone, timedelta
from django.db.models import Q
from rest_framework.exceptions import NotFound, ValidationError, PermissionDenied

from apps.authentication.models import Users
from apps.company.models import Companies, Members
from apps.candidate.models import Profiles
from apps.recruitment.models import Tests, TestAttempts, Applications, ApplicationHistory, Jobs


class AssessmentService:
    """
    Dịch vụ quản lý Bài kiểm tra năng lực (Assessment & Tests):
    - Doanh nghiệp: Tạo/sửa/xóa bài kiểm tra, cấu hình câu hỏi/điểm/thời gian/điểm đạt,
      gắn với tin tuyển dụng, giao bài cho ứng viên, xem danh sách kết quả và chấm điểm.
    - Ứng viên: Xem danh sách bài kiểm tra được giao, xem hướng dẫn, bắt đầu làm bài,
      lưu nháp đáp án, tự động xử lý hết giờ, nộp bài chấm điểm trên Backend và xem kết quả.
    """

    @staticmethod
    def _get_company_for_user(user_id: int) -> Companies:
        member = (
            Members.objects.select_related("company").filter(user_id=user_id, status="active").first()
            or Members.objects.select_related("company").filter(user_id=user_id).first()
        )
        if not member or not member.company:
            raise PermissionDenied("Bạn chưa tham gia doanh nghiệp nào để thực hiện thao tác này.")
        return member.company

    @staticmethod
    def _ensure_utc(dt: datetime | None) -> datetime | None:
        if dt is None:
            return None
        if dt.tzinfo is None:
            return dt.replace(tzinfo=timezone.utc)
        return dt

    @classmethod
    def _unpack_test_data(cls, raw_questions) -> tuple[dict, list[dict]]:
        """
        Giải nén metadata và danh sách câu hỏi từ trường JSON `Tests.questions`.
        Tương thích ngược với cả định dạng list `[...]` và dict `{"meta": {...}, "items": [...]}`.
        """
        if isinstance(raw_questions, dict):
            raw_meta = raw_questions.get("meta") if isinstance(raw_questions.get("meta"), dict) else {}
            raw_items = raw_questions.get("items") if isinstance(raw_questions.get("items"), list) else []
        elif isinstance(raw_questions, list):
            raw_meta = {}
            raw_items = raw_questions
        else:
            raw_meta = {}
            raw_items = []

        try:
            passing_score = float(raw_meta.get("passing_score", 70.0))
        except (TypeError, ValueError):
            passing_score = 70.0

        job_id = raw_meta.get("job_id")
        try:
            job_id = int(job_id) if job_id is not None and str(job_id).strip() != "" else None
        except (TypeError, ValueError):
            job_id = None

        meta = {
            "description": str(raw_meta.get("description") or "").strip(),
            "passing_score": round(max(0.0, min(100.0, passing_score)), 2),
            "job_id": job_id,
        }

        normalized_questions = []
        for idx, q in enumerate(raw_items, start=1):
            if not isinstance(q, dict):
                continue
            q_id = q.get("id", idx)
            q_type = str(q.get("type") or "multiple_choice").strip().lower()
            if q_type not in ("multiple_choice", "essay"):
                q_type = "multiple_choice"

            try:
                pts = float(q.get("points", 10.0))
                if pts <= 0:
                    pts = 10.0
            except (TypeError, ValueError):
                pts = 10.0

            raw_opts = q.get("options")
            options = [str(opt) for opt in raw_opts if str(opt).strip() != ""] if isinstance(raw_opts, list) else []

            normalized_questions.append({
                "id": q_id,
                "type": q_type,
                "question": str(q.get("question") or "").strip(),
                "options": options,
                "correct_answer": str(q.get("correct_answer") or "").strip(),
                "points": round(pts, 2),
            })

        return meta, normalized_questions

    @classmethod
    def _pack_test_data(cls, meta: dict, questions: list[dict]) -> dict:
        _, normalized_questions = cls._unpack_test_data({"meta": meta, "items": questions or []})
        try:
            passing_score = float(meta.get("passing_score", 70.0))
        except (TypeError, ValueError):
            passing_score = 70.0
        job_id = meta.get("job_id")
        try:
            job_id = int(job_id) if job_id is not None and str(job_id).strip() != "" else None
        except (TypeError, ValueError):
            job_id = None

        return {
            "meta": {
                "description": str(meta.get("description") or "").strip(),
                "passing_score": round(max(0.0, min(100.0, passing_score)), 2),
                "job_id": job_id,
            },
            "items": normalized_questions,
        }

    @staticmethod
    def _unpack_attempt_answers(raw_answers) -> dict:
        """
        Chuẩn hóa dữ liệu JSON trong `TestAttempts.answers`.
        Hỗ trợ dữ liệu cũ `{}` hoặc `[...]` và dữ liệu chuẩn dict.
        """
        if isinstance(raw_answers, list):
            # Phân biệt list câu trả lời đã chấm vs list câu trả lời nháp
            has_eval = any(isinstance(x, dict) and ("is_correct" in x or "user_answer" in x) for x in raw_answers)
            if has_eval:
                return {
                    "draft_answers": [
                        {"question_id": x.get("question_id"), "answer": x.get("user_answer", "")}
                        for x in raw_answers if isinstance(x, dict)
                    ],
                    "items": raw_answers,
                    "deadline": None,
                    "assigned_by": None,
                    "assigned_at": None,
                    "auto_submitted": False,
                    "is_passed": None,
                    "earned_points": None,
                    "total_points": None,
                    "passing_score": None,
                    "has_pending_essay": False,
                    "grader_user_id": None,
                    "feedback": "",
                    "graded_at": None,
                    "questions_snapshot": None,
                    "duration_minutes": None,
                }
            return {
                "draft_answers": raw_answers,
                "items": [],
                "deadline": None,
                "assigned_by": None,
                "assigned_at": None,
                "auto_submitted": False,
                "is_passed": None,
                "earned_points": None,
                "total_points": None,
                "passing_score": None,
                "has_pending_essay": False,
                "grader_user_id": None,
                "feedback": "",
                "graded_at": None,
                "questions_snapshot": None,
                "duration_minutes": None,
            }

        if isinstance(raw_answers, dict):
            return {
                "draft_answers": raw_answers.get("draft_answers") if isinstance(raw_answers.get("draft_answers"), list) else [],
                "items": raw_answers.get("items") if isinstance(raw_answers.get("items"), list) else [],
                "deadline": raw_answers.get("deadline"),
                "assigned_by": raw_answers.get("assigned_by"),
                "assigned_at": raw_answers.get("assigned_at"),
                "auto_submitted": bool(raw_answers.get("auto_submitted", False)),
                "is_passed": raw_answers.get("is_passed"),
                "earned_points": raw_answers.get("earned_points"),
                "total_points": raw_answers.get("total_points"),
                "passing_score": raw_answers.get("passing_score"),
                "has_pending_essay": bool(raw_answers.get("has_pending_essay", False)),
                "grader_user_id": raw_answers.get("grader_user_id"),
                "feedback": str(raw_answers.get("feedback") or ""),
                "graded_at": raw_answers.get("graded_at"),
                "questions_snapshot": raw_answers.get("questions_snapshot") if isinstance(raw_answers.get("questions_snapshot"), list) else None,
                "duration_minutes": raw_answers.get("duration_minutes"),
            }

        return {
            "draft_answers": [],
            "items": [],
            "deadline": None,
            "assigned_by": None,
            "assigned_at": None,
            "auto_submitted": False,
            "is_passed": None,
            "earned_points": None,
            "total_points": None,
            "passing_score": None,
            "has_pending_essay": False,
            "grader_user_id": None,
            "feedback": "",
            "graded_at": None,
            "questions_snapshot": None,
            "duration_minutes": None,
        }

    @classmethod
    def _evaluate_and_complete_attempt(
        cls,
        attempt: TestAttempts,
        submitted_answers: list[dict] | None = None,
        auto_submitted: bool = False,
        completed_at: datetime | None = None,
    ) -> dict:
        """
        Chấm điểm bài làm trên Backend dựa vào đáp án chuẩn và điểm số từng câu hỏi.
        Không tin tưởng bất kỳ trường điểm nào do Frontend gửi lên.
        Ưu tiên chấm theo snapshot đề thi tại thời điểm ứng viên bắt đầu làm bài (nếu có)
        để việc doanh nghiệp sửa đề sau đó không làm sai lệch bài làm đang diễn ra.
        """
        test_obj = attempt.test
        meta, live_questions = cls._unpack_test_data(test_obj.questions if test_obj else [])
        att_meta = cls._unpack_attempt_answers(attempt.answers)
        snapshot_questions = att_meta.get("questions_snapshot")
        questions = (
            snapshot_questions
            if isinstance(snapshot_questions, list) and len(snapshot_questions) > 0
            else live_questions
        )
        passing_score = (
            float(att_meta["passing_score"])
            if att_meta.get("passing_score") is not None
            else float(meta.get("passing_score", 70.0))
        )

        # Gộp đáp án lưu nháp trước đó với đáp án nộp lên (ưu tiên đáp án nộp lên nếu có)
        answers_map: dict[str, str] = {}
        for d_ans in att_meta.get("draft_answers", []):
            if isinstance(d_ans, dict):
                qid = str(d_ans.get("question_id") if d_ans.get("question_id") is not None else d_ans.get("id", ""))
                if qid:
                    answers_map[qid] = str(d_ans.get("answer") if d_ans.get("answer") is not None else "")

        if isinstance(submitted_answers, list):
            for s_ans in submitted_answers:
                if isinstance(s_ans, dict):
                    qid = str(s_ans.get("question_id") if s_ans.get("question_id") is not None else s_ans.get("id", ""))
                    if qid:
                        answers_map[qid] = str(s_ans.get("answer") if s_ans.get("answer") is not None else "")

        total_points = 0.0
        earned_points = 0.0
        correct_count = 0
        mcq_count = 0
        essay_count = 0
        evaluated_answers = []

        for idx, q in enumerate(questions, start=1):
            q_id = str(q.get("id", idx))
            q_type = q.get("type", "multiple_choice")
            q_points = float(q.get("points", 10.0))
            total_points += q_points

            user_ans = str(answers_map.get(q_id, "")).strip()
            correct_ans = str(q.get("correct_answer") or "").strip()

            if q_type == "multiple_choice":
                mcq_count += 1
                is_correct = bool(correct_ans and user_ans and user_ans.lower() == correct_ans.lower())
                q_earned = q_points if is_correct else 0.0
                if is_correct:
                    correct_count += 1
                earned_points += q_earned
                evaluated_answers.append({
                    "question_id": q.get("id", idx),
                    "question": q.get("question", ""),
                    "type": q_type,
                    "user_answer": user_ans,
                    "is_correct": is_correct,
                    "points": round(q_points, 2),
                    "earned_points": round(q_earned, 2),
                    "score": round(q_earned, 2),
                })
            else:
                essay_count += 1
                evaluated_answers.append({
                    "question_id": q.get("id", idx),
                    "question": q.get("question", ""),
                    "type": q_type,
                    "user_answer": user_ans,
                    "is_correct": None,
                    "status": "pending_review",
                    "points": round(q_points, 2),
                    "earned_points": 0.0,
                    "score": None,
                })

        now = completed_at or datetime.now(timezone.utc)
        if total_points > 0:
            final_score = round((earned_points / total_points) * 100.0, 2)
        else:
            final_score = 0.0

        has_pending_essay = (essay_count > 0) and not bool(att_meta.get("graded_at"))
        is_passed = (final_score >= passing_score) if not has_pending_essay else None

        att_meta["draft_answers"] = [{"question_id": k, "answer": v} for k, v in answers_map.items()]
        att_meta["items"] = evaluated_answers
        att_meta["earned_points"] = round(earned_points, 2)
        att_meta["total_points"] = round(total_points, 2)
        att_meta["passing_score"] = round(passing_score, 2)
        att_meta["is_passed"] = is_passed
        att_meta["auto_submitted"] = bool(auto_submitted)
        att_meta["has_pending_essay"] = has_pending_essay
        if not att_meta.get("questions_snapshot"):
            att_meta["questions_snapshot"] = questions
        if att_meta.get("duration_minutes") is None and test_obj:
            att_meta["duration_minutes"] = int(test_obj.duration_minutes or 30)

        attempt.completed_at = now
        attempt.score = final_score
        attempt.answers = att_meta
        attempt.save(update_fields=["completed_at", "score", "answers"])

        started_dt = cls._ensure_utc(attempt.started_at)
        completed_dt = cls._ensure_utc(attempt.completed_at)
        duration_seconds = int(max(0, (completed_dt - started_dt).total_seconds())) if (started_dt and completed_dt) else 0

        return {
            "attempt_id": attempt.id,
            "test_id": test_obj.id if test_obj else attempt.test_id,
            "test_title": test_obj.title if test_obj else "",
            "score": float(final_score),
            "earned_points": round(earned_points, 2),
            "total_points": round(total_points, 2),
            "passing_score": round(passing_score, 2),
            "is_passed": is_passed,
            "mcq_total": mcq_count,
            "mcq_correct": correct_count,
            "essay_total": essay_count,
            "has_pending_essay": has_pending_essay,
            "auto_submitted": bool(auto_submitted),
            "duration_seconds": duration_seconds,
            "status": "pending_manual_grading" if has_pending_essay else "completed",
            "started_at": attempt.started_at,
            "completed_at": attempt.completed_at,
        }

    @classmethod
    def _check_and_enforce_timeout(cls, attempt: TestAttempts) -> bool:
        """
        Kiểm tra nếu lượt làm bài đang diễn ra (`started_at != None` và `completed_at == None`)
        nhưng đã vượt quá `duration_minutes` thì tự động khóa và chấm điểm theo đáp án đã lưu.
        """
        if not attempt or attempt.started_at is None or attempt.completed_at is not None:
            return False

        att_meta = cls._unpack_attempt_answers(attempt.answers)
        duration_minutes = int(
            att_meta.get("duration_minutes")
            or (attempt.test.duration_minutes if attempt.test and attempt.test.duration_minutes else 30)
        )
        started_dt = cls._ensure_utc(attempt.started_at)
        deadline_dt = started_dt + timedelta(minutes=duration_minutes)
        now = datetime.now(timezone.utc)

        if now >= deadline_dt:
            cls._evaluate_and_complete_attempt(
                attempt,
                submitted_answers=None,
                auto_submitted=True,
                completed_at=deadline_dt,
            )
            return True
        return False

    @classmethod
    def _compute_remaining_seconds(cls, attempt: TestAttempts | None, duration_minutes: int) -> int | None:
        if not attempt or attempt.started_at is None or attempt.completed_at is not None:
            return None
        started_dt = cls._ensure_utc(attempt.started_at)
        deadline_dt = started_dt + timedelta(minutes=duration_minutes or 30)
        now = datetime.now(timezone.utc)
        return max(0, int((deadline_dt - now).total_seconds()))

    @staticmethod
    def _is_deadline_expired(deadline_str: str | None) -> bool:
        if not deadline_str:
            return False
        try:
            d_str = str(deadline_str).strip()
            if len(d_str) == 10:
                d_date = datetime.strptime(d_str, "%Y-%m-%d").date()
                return d_date < datetime.now(timezone.utc).date()
            dt = datetime.fromisoformat(d_str.replace("Z", "+00:00"))
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt < datetime.now(timezone.utc)
        except Exception:
            return False

    # =========================================================================
    # 1. Nghiệp vụ dành cho Ứng viên (Candidate)
    # =========================================================================

    @classmethod
    def _find_candidate_application_for_test(cls, profile: Profiles, test_obj: Tests, application_id: int | None = None) -> Applications | None:
        meta, _ = cls._unpack_test_data(test_obj.questions)
        linked_job_id = meta.get("job_id")

        if application_id:
            app = Applications.objects.select_related("job").filter(
                id=application_id,
                candidate=profile,
                job__company_id=test_obj.company_id,
            ).first()
            if app:
                return app

        if linked_job_id:
            app = Applications.objects.select_related("job").filter(
                candidate=profile,
                job_id=linked_job_id,
            ).exclude(status__in=["rejected", "withdrawn"]).order_by("-applied_at", "-id").first()
            if app:
                return app

        return (
            Applications.objects.select_related("job")
            .filter(candidate=profile, job__company_id=test_obj.company_id)
            .exclude(status__in=["rejected", "withdrawn"])
            .order_by("-applied_at", "-id")
            .first()
        )

    @classmethod
    def _serialize_candidate_test_item(cls, test_obj: Tests, attempt: TestAttempts | None, company_map: dict, job_map: dict) -> dict:
        if attempt:
            cls._check_and_enforce_timeout(attempt)

        meta, live_questions = cls._unpack_test_data(test_obj.questions)
        att_meta = cls._unpack_attempt_answers(attempt.answers) if attempt else {}
        snapshot_questions = att_meta.get("questions_snapshot") if attempt else None
        questions = (
            snapshot_questions
            if isinstance(snapshot_questions, list) and len(snapshot_questions) > 0
            else live_questions
        )
        passing_score = (
            float(att_meta["passing_score"])
            if (attempt and att_meta.get("passing_score") is not None)
            else float(meta.get("passing_score", 70.0))
        )
        total_points = (
            float(att_meta["total_points"])
            if (attempt and att_meta.get("total_points") is not None)
            else round(sum(float(q.get("points", 10.0)) for q in questions), 2)
        )
        duration_minutes = (
            int(att_meta["duration_minutes"])
            if (attempt and att_meta.get("duration_minutes") is not None)
            else (test_obj.duration_minutes or 30)
        )
        deadline = att_meta.get("deadline")

        app_job = attempt.application.job if (attempt and attempt.application and attempt.application.job_id) else None
        linked_job_id = meta.get("job_id") or (app_job.id if app_job else None)
        job_title = app_job.title if app_job else job_map.get(linked_job_id, "Vị trí tuyển dụng")
        company_name = company_map.get(test_obj.company_id, "Doanh nghiệp")

        started_dt = cls._ensure_utc(attempt.started_at) if attempt else None
        completed_dt = cls._ensure_utc(attempt.completed_at) if attempt else None
        remaining_seconds = cls._compute_remaining_seconds(attempt, duration_minutes)
        duration_seconds = (
            int(max(0, (completed_dt - started_dt).total_seconds()))
            if (started_dt and completed_dt)
            else None
        )

        score_val = float(attempt.score) if (attempt and attempt.score is not None) else None

        if attempt and attempt.completed_at is not None:
            if att_meta.get("has_pending_essay") and not att_meta.get("graded_at"):
                attempt_status = "pending_manual_grading"
                is_passed = None
            else:
                attempt_status = "completed"
                is_passed = (
                    att_meta.get("is_passed")
                    if att_meta.get("is_passed") is not None
                    else ((score_val >= passing_score) if score_val is not None else None)
                )
        elif attempt and attempt.started_at is not None:
            attempt_status = "in_progress"
            is_passed = None
        else:
            is_passed = None
            if cls._is_deadline_expired(deadline) or test_obj.status == "closed":
                attempt_status = "expired"
            else:
                attempt_status = "not_started"

        return {
            "id": test_obj.id,
            "attempt_id": attempt.id if attempt else None,
            "application_id": attempt.application_id if attempt else None,
            "company_id": test_obj.company_id,
            "company_name": company_name,
            "job_id": linked_job_id,
            "job_title": job_title,
            "title": test_obj.title,
            "description": meta.get("description", ""),
            "duration_minutes": duration_minutes,
            "passing_score": passing_score,
            "total_questions": len(questions),
            "total_points": total_points,
            "status": test_obj.status or "active",
            "attempt_status": attempt_status,
            "deadline": deadline,
            "started_at": attempt.started_at if attempt else None,
            "completed_at": attempt.completed_at if attempt else None,
            "remaining_seconds": remaining_seconds,
            "duration_seconds": duration_seconds,
            "score": score_val,
            "earned_points": att_meta.get("earned_points"),
            "is_passed": is_passed,
            "auto_submitted": bool(att_meta.get("auto_submitted", False)),
            "feedback": att_meta.get("feedback", ""),
        }

    @classmethod
    def get_candidate_tests(cls, user_id: int) -> list[dict]:
        """
        Lấy danh sách các bài kiểm tra được giao cho ứng viên:
        1. Các bài kiểm tra đã được gắn trực tiếp trong `TestAttempts` của ứng viên.
        2. Các bài kiểm tra đang mở (`active`/`published`) của công ty/vị trí mà ứng viên đã nộp đơn ứng tuyển.
        """
        profile = Profiles.objects.filter(user_id=user_id).first()
        if not profile:
            return []

        attempts_qs = (
            TestAttempts.objects.filter(application__candidate=profile)
            .select_related("test", "application", "application__job")
            .order_by("-id")
        )
        attempt_by_test_id: dict[int, TestAttempts] = {}
        assigned_tests: dict[int, Tests] = {}
        for att in attempts_qs:
            if att.test_id not in attempt_by_test_id:
                attempt_by_test_id[att.test_id] = att
            if att.test:
                assigned_tests[att.test_id] = att.test

        cand_apps = list(
            Applications.objects.select_related("job")
            .filter(candidate=profile)
            .exclude(status__in=["rejected", "withdrawn"])
            .order_by("-applied_at", "-id")
        )
        app_company_ids = {a.job.company_id for a in cand_apps if a.job and a.job.company_id}
        app_job_ids = {a.job_id for a in cand_apps if a.job_id}

        if app_company_ids:
            open_tests = Tests.objects.filter(
                company_id__in=app_company_ids,
                status__in=["active", "published"],
            ).order_by("-id")
            for t in open_tests:
                if t.id in assigned_tests:
                    continue
                meta, _ = cls._unpack_test_data(t.questions)
                linked_job_id = meta.get("job_id")
                if linked_job_id is None or linked_job_id in app_job_ids:
                    assigned_tests[t.id] = t

        all_tests = sorted(assigned_tests.values(), key=lambda x: x.id, reverse=True)
        company_ids = {t.company_id for t in all_tests if t.company_id}
        company_map = {c.id: c.name for c in Companies.objects.filter(id__in=company_ids)}

        job_ids = set()
        for t in all_tests:
            m, _ = cls._unpack_test_data(t.questions)
            if m.get("job_id"):
                job_ids.add(m["job_id"])
        job_map = {j.id: j.title for j in Jobs.objects.filter(id__in=job_ids)} if job_ids else {}

        return [
            cls._serialize_candidate_test_item(t, attempt_by_test_id.get(t.id), company_map, job_map)
            for t in all_tests
        ]

    @classmethod
    def get_candidate_test_detail(cls, user_id: int, test_id: int) -> dict:
        """
        Xem chi tiết bài kiểm tra dành cho ứng viên:
        - Kiểm tra quyền được giao bài của ứng viên.
        - Tự động khóa & chấm điểm nếu đang làm dở nhưng đã hết giờ.
        - Tuyệt đối ẩn `correct_answer` trong danh sách câu hỏi đề thi.
        """
        test_obj = Tests.objects.filter(id=test_id).first()
        if not test_obj:
            raise NotFound("Không tìm thấy bài kiểm tra.")

        profile = Profiles.objects.filter(user_id=user_id).first()
        if not profile:
            raise PermissionDenied("Bạn cần có hồ sơ ứng viên để truy cập bài kiểm tra này.")

        attempt = (
            TestAttempts.objects.select_related("test", "application", "application__job")
            .filter(test_id=test_id, application__candidate=profile)
            .order_by("-id")
            .first()
        )

        # Kiểm tra quyền truy cập nếu chưa có bản ghi TestAttempts được giao trực tiếp
        if not attempt:
            cand_app = cls._find_candidate_application_for_test(profile, test_obj)
            if not cand_app or test_obj.status not in ("active", "published"):
                raise PermissionDenied("Bạn không nằm trong danh sách ứng viên được giao bài kiểm tra này.")

        company_map = (
            {test_obj.company_id: Companies.objects.filter(id=test_obj.company_id).values_list("name", flat=True).first() or "Doanh nghiệp"}
            if test_obj.company_id else {}
        )
        meta, raw_questions = cls._unpack_test_data(test_obj.questions)
        job_map = {}
        if meta.get("job_id"):
            j_title = Jobs.objects.filter(id=meta["job_id"]).values_list("title", flat=True).first()
            if j_title:
                job_map[meta["job_id"]] = j_title

        base_info = cls._serialize_candidate_test_item(test_obj, attempt, company_map, job_map)

        att_meta = cls._unpack_attempt_answers(attempt.answers) if attempt else {}
        snapshot_questions = att_meta.get("questions_snapshot") if attempt else None
        effective_questions = (
            snapshot_questions
            if isinstance(snapshot_questions, list) and len(snapshot_questions) > 0
            else raw_questions
        )

        sanitized_questions = []
        for idx, q in enumerate(effective_questions, start=1):
            sanitized_questions.append({
                "id": q.get("id", idx),
                "type": q.get("type", "multiple_choice"),
                "question": q.get("question", ""),
                "options": q.get("options", []),
                "points": q.get("points", 10.0),
                # Tuyệt đối KHÔNG trả về correct_answer trong đề thi của ứng viên
            })

        saved_answers = att_meta.get("draft_answers", []) if attempt else []
        evaluated_answers = att_meta.get("items", []) if (attempt and attempt.completed_at is not None) else []

        return {
            **base_info,
            "questions": sanitized_questions,
            "saved_answers": saved_answers,
            "evaluated_answers": evaluated_answers,
        }

    @classmethod
    def start_test_attempt(cls, user_id: int, test_id: int, application_id: int | None = None) -> dict:
        """
        Ứng viên bắt đầu hoặc tiếp tục làm bài kiểm tra:
        - Nếu đã hoàn thành trước đó -> Chặn làm lại.
        - Nếu đang làm dở (`in_progress`) và chưa hết giờ -> Trả về phiên làm bài hiện tại + thời gian còn lại + đáp án nháp.
        - Nếu đang làm dở nhưng đã hết giờ -> Tự động chấm điểm và chốt kết quả.
        - Nếu được giao (`started_at is None`) -> Ghi nhận `started_at = now` và lưu snapshot đề thi.
        """
        test_obj = Tests.objects.filter(id=test_id).first()
        if not test_obj:
            raise NotFound("Không tìm thấy bài kiểm tra.")

        profile = Profiles.objects.filter(user_id=user_id).first()
        if not profile:
            raise NotFound("Không tìm thấy hồ sơ ứng viên.")

        meta, live_questions = cls._unpack_test_data(test_obj.questions)
        live_passing_score = float(meta.get("passing_score", 70.0))
        live_total_points = round(sum(float(q.get("points", 10.0)) for q in live_questions), 2)
        live_duration_minutes = int(test_obj.duration_minutes or 30)

        existing_attempt = (
            TestAttempts.objects.select_related("test", "application", "application__job")
            .filter(test_id=test_id, application__candidate=profile)
            .order_by("-id")
            .first()
        )

        if existing_attempt:
            timed_out = cls._check_and_enforce_timeout(existing_attempt)
            if timed_out:
                raise ValidationError({
                    "attempt": "Thời gian làm bài của bạn đã kết thúc. Hệ thống đã tự động thu bài và chấm điểm.",
                    "auto_submitted": True,
                    "attempt_id": existing_attempt.id,
                })

            if existing_attempt.completed_at is not None:
                raise ValidationError({"attempt": "Bạn đã hoàn thành và nộp bài kiểm tra này trước đó, không thể làm lại."})

            att_meta = cls._unpack_attempt_answers(existing_attempt.answers)
            if existing_attempt.started_at is None:
                if test_obj.status == "closed":
                    raise ValidationError({"test": "Bài kiểm tra này đã đóng, không thể bắt đầu làm bài."})
                if cls._is_deadline_expired(att_meta.get("deadline")):
                    raise ValidationError({"deadline": "Bài kiểm tra này đã quá hạn làm bài."})

                now = datetime.now(timezone.utc)
                existing_attempt.started_at = now
                att_meta["questions_snapshot"] = live_questions
                att_meta["passing_score"] = live_passing_score
                att_meta["total_points"] = live_total_points
                att_meta["duration_minutes"] = live_duration_minutes
                existing_attempt.answers = att_meta
                existing_attempt.save(update_fields=["started_at", "answers"])

            duration_minutes = int(att_meta.get("duration_minutes") or live_duration_minutes)
            remaining_seconds = cls._compute_remaining_seconds(existing_attempt, duration_minutes)
            return {
                "attempt_id": existing_attempt.id,
                "test_id": test_obj.id,
                "test_title": test_obj.title,
                "duration_minutes": duration_minutes,
                "started_at": existing_attempt.started_at,
                "remaining_seconds": remaining_seconds,
                "saved_answers": att_meta.get("draft_answers", []),
                "status": "in_progress",
            }

        # Nếu chưa có bản ghi được giao sẵn, kiểm tra ứng viên có đơn ứng tuyển hợp lệ tại công ty không
        if test_obj.status not in ("active", "published"):
            raise PermissionDenied("Bài kiểm tra này hiện chưa mở cho ứng viên.")

        application = cls._find_candidate_application_for_test(profile, test_obj, application_id=application_id)
        if not application:
            raise PermissionDenied("Bạn không nằm trong danh sách ứng viên được giao bài kiểm tra này.")

        now = datetime.now(timezone.utc)
        init_answers = cls._unpack_attempt_answers({})
        init_answers["questions_snapshot"] = live_questions
        init_answers["passing_score"] = live_passing_score
        init_answers["total_points"] = live_total_points
        init_answers["duration_minutes"] = live_duration_minutes
        attempt = TestAttempts.objects.create(
            test=test_obj,
            application=application,
            answers=init_answers,
            score=None,
            started_at=now,
        )

        return {
            "attempt_id": attempt.id,
            "test_id": test_obj.id,
            "test_title": test_obj.title,
            "duration_minutes": live_duration_minutes,
            "started_at": attempt.started_at,
            "remaining_seconds": live_duration_minutes * 60,
            "saved_answers": [],
            "status": "in_progress",
        }

    @classmethod
    def save_test_attempt_answers(cls, user_id: int, attempt_id: int, answers: list[dict]) -> dict:
        """
        Lưu nháp câu trả lời của ứng viên trong quá trình làm bài (hỗ trợ mất kết nối / tải lại trang).
        """
        attempt = (
            TestAttempts.objects.select_related("test", "application", "application__candidate")
            .filter(id=attempt_id)
            .first()
        )
        if not attempt:
            raise NotFound("Không tìm thấy lượt làm bài kiểm tra.")

        if not attempt.application or not attempt.application.candidate or int(attempt.application.candidate.user_id) != int(user_id):
            raise PermissionDenied("Bạn không có quyền truy cập hoặc chỉnh sửa bài làm của ứng viên khác.")

        if attempt.completed_at is not None:
            raise ValidationError({"attempt": "Bài kiểm tra này đã được nộp trước đó, không thể chỉnh sửa đáp án."})

        if attempt.started_at is None:
            raise ValidationError({"attempt": "Bài kiểm tra chưa được bắt đầu."})

        if cls._check_and_enforce_timeout(attempt):
            return {
                "attempt_id": attempt.id,
                "status": "auto_submitted",
                "auto_submitted": True,
                "remaining_seconds": 0,
                "score": float(attempt.score or 0.0),
                "message": "Đã hết thời gian làm bài. Hệ thống đã tự động nộp bài.",
            }

        att_meta = cls._unpack_attempt_answers(attempt.answers)
        merged_map: dict[str, str] = {}
        for item in att_meta.get("draft_answers", []):
            if isinstance(item, dict):
                qid = str(item.get("question_id") if item.get("question_id") is not None else item.get("id", ""))
                if qid:
                    merged_map[qid] = str(item.get("answer") if item.get("answer") is not None else "")

        for item in (answers or []):
            if isinstance(item, dict):
                qid = str(item.get("question_id") if item.get("question_id") is not None else item.get("id", ""))
                if qid:
                    merged_map[qid] = str(item.get("answer") if item.get("answer") is not None else "")

        draft_list = [{"question_id": k, "answer": v} for k, v in merged_map.items()]
        att_meta["draft_answers"] = draft_list
        attempt.answers = att_meta
        attempt.save(update_fields=["answers"])

        duration_minutes = int(
            att_meta.get("duration_minutes")
            or (attempt.test.duration_minutes if (attempt.test and attempt.test.duration_minutes) else 30)
        )
        remaining_seconds = cls._compute_remaining_seconds(attempt, duration_minutes)
        return {
            "attempt_id": attempt.id,
            "status": "in_progress",
            "saved_count": len(draft_list),
            "remaining_seconds": remaining_seconds,
            "saved_answers": draft_list,
        }

    @classmethod
    def submit_test_attempt(
        cls,
        user_id: int,
        attempt_id: int,
        answers: list[dict],
        auto_submitted: bool = False,
    ) -> dict:
        """
        Nộp bài làm và chấm điểm trên Backend:
        - Kiểm tra quyền sở hữu lượt làm bài.
        - Ngăn nộp bài nhiều lần.
        - Kiểm tra thời gian làm bài thực tế trên Backend (nếu quá giờ sẽ tự động khóa theo mốc hết giờ).
        """
        attempt = (
            TestAttempts.objects.select_related("test", "application", "application__candidate", "application__job")
            .filter(id=attempt_id)
            .first()
        )
        if not attempt:
            raise NotFound("Không tìm thấy lượt làm bài kiểm tra.")

        if not attempt.application or not attempt.application.candidate or int(attempt.application.candidate.user_id) != int(user_id):
            raise PermissionDenied("Bạn không có quyền nộp bài kiểm tra của ứng viên khác.")

        if attempt.completed_at is not None:
            raise ValidationError({"attempt": "Bài kiểm tra này đã được nộp trước đó."})

        if attempt.started_at is None:
            raise ValidationError({"attempt": "Bạn cần bắt đầu làm bài trước khi nộp bài."})

        att_meta = cls._unpack_attempt_answers(attempt.answers)
        duration_minutes = int(
            att_meta.get("duration_minutes")
            or (attempt.test.duration_minutes if (attempt.test and attempt.test.duration_minutes) else 30)
        )
        started_dt = cls._ensure_utc(attempt.started_at)
        deadline_dt = started_dt + timedelta(minutes=duration_minutes)
        now = datetime.now(timezone.utc)

        # Cho phép độ trễ mạng 30 giây; nếu vượt quá hạn giờ làm bài thì đánh dấu auto_submitted theo thời điểm hết giờ
        grace_deadline = deadline_dt + timedelta(seconds=30)
        if now > grace_deadline:
            has_draft = len(att_meta.get("draft_answers", [])) > 0
            return cls._evaluate_and_complete_attempt(
                attempt,
                submitted_answers=None if has_draft else answers,
                auto_submitted=True,
                completed_at=deadline_dt,
            )

        effective_completed_at = min(now, deadline_dt) if auto_submitted else now
        return cls._evaluate_and_complete_attempt(
            attempt,
            submitted_answers=answers,
            auto_submitted=bool(auto_submitted or now >= deadline_dt),
            completed_at=effective_completed_at,
        )

    @classmethod
    def get_candidate_attempts(cls, user_id: int) -> list[dict]:
        """Xem lịch sử các lần làm bài kiểm tra của ứng viên."""
        profile = Profiles.objects.filter(user_id=user_id).first()
        if not profile:
            return []

        attempts = (
            TestAttempts.objects.filter(application__candidate=profile)
            .select_related("test", "application__job")
            .order_by("-started_at", "-id")[:50]
        )

        results = []
        for att in attempts:
            cls._check_and_enforce_timeout(att)
            meta, _ = cls._unpack_test_data(att.test.questions if att.test else [])
            att_meta = cls._unpack_attempt_answers(att.answers)
            passing_score = (
                float(att_meta["passing_score"])
                if att_meta.get("passing_score") is not None
                else float(meta.get("passing_score", 70.0))
            )
            score_val = float(att.score) if att.score is not None else None
            is_pending_essay = bool(
                att.completed_at and att_meta.get("has_pending_essay") and not att_meta.get("graded_at")
            )
            is_passed = (
                None
                if is_pending_essay
                else (
                    att_meta.get("is_passed")
                    if att_meta.get("is_passed") is not None
                    else ((score_val >= passing_score) if score_val is not None else None)
                )
            )
            started_dt = cls._ensure_utc(att.started_at)
            completed_dt = cls._ensure_utc(att.completed_at)
            duration_seconds = (
                int(max(0, (completed_dt - started_dt).total_seconds()))
                if (started_dt and completed_dt)
                else None
            )

            if att.completed_at:
                st = "pending_manual_grading" if is_pending_essay else "completed"
            elif att.started_at:
                st = "in_progress"
            else:
                st = "not_started"

            results.append({
                "id": att.id,
                "test_id": att.test_id,
                "test_title": att.test.title if att.test else "Bài kiểm tra năng lực",
                "job_title": att.application.job.title if att.application and att.application.job else "Ứng tuyển",
                "score": score_val,
                "passing_score": passing_score,
                "is_passed": is_passed,
                "earned_points": att_meta.get("earned_points"),
                "total_points": att_meta.get("total_points"),
                "duration_seconds": duration_seconds,
                "started_at": att.started_at,
                "completed_at": att.completed_at,
                "auto_submitted": bool(att_meta.get("auto_submitted", False)),
                "feedback": att_meta.get("feedback", ""),
                "status": st,
            })
        return results

    @classmethod
    def get_attempt_detail(cls, user_id: int, attempt_id: int) -> dict:
        """Xem chi tiết một lần làm bài của ứng viên (chỉ chính chủ mới được xem)."""
        profile = Profiles.objects.filter(user_id=user_id).first()
        if not profile:
            raise PermissionDenied("Không tìm thấy hồ sơ ứng viên.")

        attempt = (
            TestAttempts.objects.select_related("test", "application", "application__candidate", "application__job")
            .filter(id=attempt_id)
            .first()
        )
        if not attempt:
            raise NotFound("Không tìm thấy bài làm.")

        if not attempt.application or attempt.application.candidate_id != profile.id:
            raise PermissionDenied("Bạn không có quyền xem kết quả bài kiểm tra của ứng viên khác.")

        cls._check_and_enforce_timeout(attempt)
        meta, questions = cls._unpack_test_data(attempt.test.questions if attempt.test else [])
        att_meta = cls._unpack_attempt_answers(attempt.answers)
        passing_score = (
            float(att_meta["passing_score"])
            if att_meta.get("passing_score") is not None
            else float(meta.get("passing_score", 70.0))
        )
        score_val = float(attempt.score) if attempt.score is not None else None
        is_pending_essay = bool(
            attempt.completed_at and att_meta.get("has_pending_essay") and not att_meta.get("graded_at")
        )
        is_passed = (
            None
            if is_pending_essay
            else (
                att_meta.get("is_passed")
                if att_meta.get("is_passed") is not None
                else ((score_val >= passing_score) if score_val is not None else None)
            )
        )
        started_dt = cls._ensure_utc(attempt.started_at)
        completed_dt = cls._ensure_utc(attempt.completed_at)
        duration_seconds = (
            int(max(0, (completed_dt - started_dt).total_seconds()))
            if (started_dt and completed_dt)
            else None
        )

        return {
            "id": attempt.id,
            "test_id": attempt.test_id,
            "test_title": attempt.test.title if attempt.test else "",
            "job_title": attempt.application.job.title if (attempt.application and attempt.application.job) else "",
            "score": score_val,
            "passing_score": passing_score,
            "is_passed": is_passed,
            "earned_points": att_meta.get("earned_points"),
            "total_points": att_meta.get("total_points") or round(sum(float(q.get("points", 10.0)) for q in questions), 2),
            "answers": att_meta.get("items", []) if attempt.completed_at else [],
            "saved_answers": att_meta.get("draft_answers", []),
            "feedback": att_meta.get("feedback", ""),
            "auto_submitted": bool(att_meta.get("auto_submitted", False)),
            "duration_seconds": duration_seconds,
            "started_at": attempt.started_at,
            "completed_at": attempt.completed_at,
            "status": (
                ("pending_manual_grading" if is_pending_essay else "completed")
                if attempt.completed_at
                else ("in_progress" if attempt.started_at else "not_started")
            ),
        }

    # =========================================================================
    # 2. Nghiệp vụ dành cho Doanh nghiệp (Employer)
    # =========================================================================

    @classmethod
    def _serialize_company_test(cls, test_obj: Tests, job_map: dict, attempt_stats: dict) -> dict:
        meta, questions = cls._unpack_test_data(test_obj.questions)
        total_points = round(sum(float(q.get("points", 10.0)) for q in questions), 2)
        stats = attempt_stats.get(test_obj.id, {"assigned": 0, "completed": 0, "in_progress": 0, "passed": 0})
        linked_job_id = meta.get("job_id")
        return {
            "id": test_obj.id,
            "company_id": test_obj.company_id,
            "title": test_obj.title,
            "description": meta.get("description", ""),
            "duration_minutes": test_obj.duration_minutes or 30,
            "passing_score": meta.get("passing_score", 70.0),
            "job_id": linked_job_id,
            "job_title": job_map.get(linked_job_id) if linked_job_id else None,
            "status": test_obj.status or "active",
            "questions_count": len(questions),
            "total_points": total_points,
            "questions": questions,
            "assigned_count": stats["assigned"],
            "attempts_count": stats["completed"],
            "in_progress_count": stats["in_progress"],
            "passed_count": stats["passed"],
        }

    @classmethod
    def get_company_tests(cls, user_id: int) -> list[dict]:
        company = cls._get_company_for_user(user_id)
        tests_qs = list(Tests.objects.filter(company_id=company.id).order_by("-id"))
        if not tests_qs:
            return []

        test_ids = [t.id for t in tests_qs]
        job_map = {j.id: j.title for j in Jobs.objects.filter(company_id=company.id)}

        attempt_stats = {tid: {"assigned": 0, "completed": 0, "in_progress": 0, "passed": 0} for tid in test_ids}
        meta_by_test = {t.id: cls._unpack_test_data(t.questions)[0] for t in tests_qs}

        attempts = TestAttempts.objects.select_related("test").filter(test_id__in=test_ids)
        for att in attempts:
            cls._check_and_enforce_timeout(att)
            st = attempt_stats.setdefault(att.test_id, {"assigned": 0, "completed": 0, "in_progress": 0, "passed": 0})
            st["assigned"] += 1
            if att.completed_at is not None:
                st["completed"] += 1
                att_meta = cls._unpack_attempt_answers(att.answers)
                if att_meta.get("has_pending_essay") and not att_meta.get("graded_at"):
                    continue
                p_score = (
                    float(att_meta["passing_score"])
                    if att_meta.get("passing_score") is not None
                    else float(meta_by_test.get(att.test_id, {}).get("passing_score", 70.0))
                )
                att_passed = (
                    bool(att_meta.get("is_passed"))
                    if att_meta.get("is_passed") is not None
                    else (att.score is not None and float(att.score) >= p_score)
                )
                if att_passed:
                    st["passed"] += 1
            elif att.started_at is not None:
                st["in_progress"] += 1

        return [cls._serialize_company_test(t, job_map, attempt_stats) for t in tests_qs]

    @classmethod
    def create_company_test(cls, user_id: int, data: dict) -> dict:
        company = cls._get_company_for_user(user_id)
        title = str(data.get("title") or "").strip()
        if not title:
            raise ValidationError({"title": "Tiêu đề bài kiểm tra không được để trống."})

        job_id = data.get("job_id")
        if job_id is not None and str(job_id).strip() != "":
            job_obj = Jobs.objects.filter(id=int(job_id), company_id=company.id).first()
            if not job_obj:
                raise ValidationError({"job_id": "Tin tuyển dụng không tồn tại hoặc không thuộc doanh nghiệp của bạn."})
            job_id = job_obj.id
        else:
            job_id = None

        status_val = str(data.get("status") or "active").strip().lower()
        if status_val not in ("draft", "active", "published", "closed"):
            status_val = "active"

        meta = {
            "description": str(data.get("description") or "").strip(),
            "passing_score": data.get("passing_score", 70.0),
            "job_id": job_id,
        }
        packed_questions = cls._pack_test_data(meta, data.get("questions", []))

        test_obj = Tests.objects.create(
            company_id=company.id,
            title=title,
            duration_minutes=int(data.get("duration_minutes") or 30),
            questions=packed_questions,
            status=status_val,
        )

        job_map = {j.id: j.title for j in Jobs.objects.filter(company_id=company.id)}
        return cls._serialize_company_test(test_obj, job_map, {})

    @classmethod
    def get_company_test_detail(cls, user_id: int, test_id: int) -> dict:
        company = cls._get_company_for_user(user_id)
        test_obj = Tests.objects.filter(id=test_id, company_id=company.id).first()
        if not test_obj:
            raise NotFound("Không tìm thấy bài kiểm tra của doanh nghiệp.")

        job_map = {j.id: j.title for j in Jobs.objects.filter(company_id=company.id)}
        attempts = list(TestAttempts.objects.select_related("test").filter(test_id=test_obj.id))
        meta, _ = cls._unpack_test_data(test_obj.questions)
        p_score = float(meta.get("passing_score", 70.0))

        stats = {"assigned": len(attempts), "completed": 0, "in_progress": 0, "passed": 0}
        for att in attempts:
            cls._check_and_enforce_timeout(att)
            if att.completed_at is not None:
                stats["completed"] += 1
                att_meta = cls._unpack_attempt_answers(att.answers)
                if att_meta.get("has_pending_essay") and not att_meta.get("graded_at"):
                    continue
                eff_p_score = (
                    float(att_meta["passing_score"])
                    if att_meta.get("passing_score") is not None
                    else p_score
                )
                att_passed = (
                    bool(att_meta.get("is_passed"))
                    if att_meta.get("is_passed") is not None
                    else (att.score is not None and float(att.score) >= eff_p_score)
                )
                if att_passed:
                    stats["passed"] += 1
            elif att.started_at is not None:
                stats["in_progress"] += 1

        return cls._serialize_company_test(test_obj, job_map, {test_obj.id: stats})

    @classmethod
    def update_company_test(cls, user_id: int, test_id: int, data: dict) -> dict:
        company = cls._get_company_for_user(user_id)
        test_obj = Tests.objects.filter(id=test_id, company_id=company.id).first()
        if not test_obj:
            raise NotFound("Không tìm thấy bài kiểm tra của doanh nghiệp.")

        meta, current_questions = cls._unpack_test_data(test_obj.questions)

        if "title" in data and data["title"] is not None:
            new_title = str(data["title"]).strip()
            if not new_title:
                raise ValidationError({"title": "Tiêu đề bài kiểm tra không được để trống."})
            test_obj.title = new_title

        if "duration_minutes" in data and data["duration_minutes"] is not None:
            test_obj.duration_minutes = int(data["duration_minutes"])

        if "status" in data and data["status"] is not None:
            st_val = str(data["status"]).strip().lower()
            if st_val in ("draft", "active", "published", "closed"):
                test_obj.status = st_val

        if "description" in data:
            meta["description"] = str(data.get("description") or "").strip()

        if "passing_score" in data and data["passing_score"] is not None:
            meta["passing_score"] = float(data["passing_score"])

        if "job_id" in data:
            jid = data.get("job_id")
            if jid is not None and str(jid).strip() != "":
                job_obj = Jobs.objects.filter(id=int(jid), company_id=company.id).first()
                if not job_obj:
                    raise ValidationError({"job_id": "Tin tuyển dụng không thuộc doanh nghiệp của bạn."})
                meta["job_id"] = job_obj.id
            else:
                meta["job_id"] = None

        new_questions = data["questions"] if "questions" in data and data["questions"] is not None else current_questions
        test_obj.questions = cls._pack_test_data(meta, new_questions)
        test_obj.save()

        return cls.get_company_test_detail(user_id, test_obj.id)

    @classmethod
    def delete_company_test(cls, user_id: int, test_id: int) -> bool:
        company = cls._get_company_for_user(user_id)
        test_obj = Tests.objects.filter(id=test_id, company_id=company.id).first()
        if not test_obj:
            raise NotFound("Không tìm thấy bài kiểm tra của doanh nghiệp.")

        has_active_or_completed_attempts = (
            TestAttempts.objects.filter(test_id=test_obj.id)
            .filter(Q(started_at__isnull=False) | Q(completed_at__isnull=False))
            .exists()
        )
        if has_active_or_completed_attempts:
            raise ValidationError({
                "test": "Không thể xóa bài kiểm tra đã có ứng viên bắt đầu làm bài hoặc đã nộp kết quả. Vui lòng chuyển trạng thái sang 'Đã đóng' để bảo toàn kết quả lịch sử."
            })

        TestAttempts.objects.filter(test_id=test_obj.id).delete()
        test_obj.delete()
        return True

    @classmethod
    def assign_test_to_candidates(cls, user_id: int, test_id: int, data: dict) -> dict:
        """
        Giao bài kiểm tra cho ứng viên (theo danh sách `application_ids` hoặc theo `job_id` của doanh nghiệp).
        """
        from apps.interaction.models import Notifications

        company = cls._get_company_for_user(user_id)
        test_obj = Tests.objects.filter(id=test_id, company_id=company.id).first()
        if not test_obj:
            raise NotFound("Không tìm thấy bài kiểm tra của doanh nghiệp.")

        app_ids = list(data.get("application_ids") or [])
        if data.get("application_id"):
            app_ids.append(int(data["application_id"]))

        job_id = data.get("job_id")
        deadline = data.get("deadline")

        apps_qs = Applications.objects.select_related("job", "candidate", "candidate__user").filter(
            job__company_id=company.id
        ).exclude(status__in=["rejected", "withdrawn"])

        if app_ids:
            apps_qs = apps_qs.filter(id__in=app_ids)
        elif job_id:
            job_obj = Jobs.objects.filter(id=int(job_id), company_id=company.id).first()
            if not job_obj:
                raise ValidationError({"job_id": "Tin tuyển dụng không thuộc doanh nghiệp của bạn."})
            apps_qs = apps_qs.filter(job_id=job_obj.id)
        else:
            raise ValidationError({"application_ids": "Vui lòng chọn ứng viên hoặc vị trí tuyển dụng để giao bài kiểm tra."})

        target_apps = list(apps_qs)
        if not target_apps:
            raise ValidationError({"application_ids": "Không tìm thấy hồ sơ ứng viên hợp lệ để giao bài kiểm tra."})

        # Nếu bài kiểm tra đang ở trạng thái draft thì chuyển sang active khi giao cho ứng viên
        if test_obj.status == "draft":
            test_obj.status = "active"
            test_obj.save(update_fields=["status"])

        now = datetime.now(timezone.utc)
        assigned_count = 0
        already_assigned_count = 0

        for app in target_apps:
            existing = TestAttempts.objects.filter(test=test_obj, application=app).first()
            if existing:
                # Cập nhật hạn làm bài nếu bài chưa bắt đầu
                if existing.started_at is None and existing.completed_at is None and deadline:
                    att_meta = cls._unpack_attempt_answers(existing.answers)
                    att_meta["deadline"] = deadline
                    existing.answers = att_meta
                    existing.save(update_fields=["answers"])
                already_assigned_count += 1
                continue

            att_meta = cls._unpack_attempt_answers({})
            att_meta["assigned_by"] = user_id
            att_meta["assigned_at"] = now.isoformat()
            att_meta["deadline"] = deadline

            attempt = TestAttempts.objects.create(
                test=test_obj,
                application=app,
                answers=att_meta,
                score=None,
                started_at=None,
                completed_at=None,
            )
            assigned_count += 1

            if app.status in ("submitted", "screening", "shortlisted"):
                prev_status = app.status
                app.status = "test"
                app.save(update_fields=["status"])
                try:
                    ApplicationHistory.objects.create(
                        application=app,
                        from_status=prev_status,
                        to_status="test",
                        changed_by=user_id,
                        note=f"Giao bài kiểm tra năng lực: {test_obj.title}",
                        created_at=now,
                    )
                except Exception:
                    pass

            try:
                cand_user = app.candidate.user if (app.candidate and hasattr(app.candidate, "user")) else None
                if cand_user:
                    Notifications.objects.create(
                        user_id=cand_user.id,
                        type="test_assigned",
                        title=f"Bài kiểm tra năng lực mới: {test_obj.title}",
                        content=(
                            f"Doanh nghiệp {company.name} đã giao bài kiểm tra '{test_obj.title}' "
                            f"cho vị trí '{app.job.title if app.job else ''}'."
                        ),
                        payload={"test_id": test_obj.id, "attempt_id": attempt.id, "application_id": app.id},
                        created_at=now,
                    )
            except Exception:
                pass

        return {
            "test_id": test_obj.id,
            "assigned_count": assigned_count,
            "already_assigned_count": already_assigned_count,
            "total_targets": len(target_apps),
            "message": f"Đã giao bài kiểm tra cho {assigned_count} ứng viên mới."
            if assigned_count > 0
            else "Tất cả ứng viên được chọn đã có trong danh sách giao bài kiểm tra này.",
        }

    @classmethod
    def get_company_test_attempts(cls, user_id: int, test_id: int | None = None) -> list[dict]:
        company = cls._get_company_for_user(user_id)
        if test_id is not None:
            test_exists = Tests.objects.filter(id=test_id, company_id=company.id).exists()
            if not test_exists:
                raise NotFound("Không tìm thấy bài kiểm tra của doanh nghiệp.")

        qs = TestAttempts.objects.filter(test__company_id=company.id).select_related(
            "test", "application", "application__job", "application__candidate", "application__candidate__user"
        )
        if test_id:
            qs = qs.filter(test_id=test_id)

        attempts = list(qs.order_by("-completed_at", "-started_at", "-id")[:100])
        results = []
        for a in attempts:
            cls._check_and_enforce_timeout(a)
            meta, questions = cls._unpack_test_data(a.test.questions if a.test else [])
            att_meta = cls._unpack_attempt_answers(a.answers)
            passing_score = (
                float(att_meta["passing_score"])
                if att_meta.get("passing_score") is not None
                else float(meta.get("passing_score", 70.0))
            )

            candidate_profile = a.application.candidate if a.application else None
            cand_user = candidate_profile.user if candidate_profile else None
            job_obj = a.application.job if a.application else None

            score_val = float(a.score) if a.score is not None else None
            is_pending_essay = bool(
                a.completed_at is not None and att_meta.get("has_pending_essay") and not att_meta.get("graded_at")
            )
            is_passed = (
                None
                if is_pending_essay
                else (
                    att_meta.get("is_passed")
                    if att_meta.get("is_passed") is not None
                    else ((score_val >= passing_score) if score_val is not None else None)
                )
            )

            started_dt = cls._ensure_utc(a.started_at)
            completed_dt = cls._ensure_utc(a.completed_at)
            duration_seconds = (
                int(max(0, (completed_dt - started_dt).total_seconds()))
                if (started_dt and completed_dt)
                else None
            )

            deadline = att_meta.get("deadline")
            if a.completed_at is not None:
                if is_pending_essay:
                    st = "pending_manual_grading"
                else:
                    st = "completed"
            elif a.started_at is not None:
                st = "in_progress"
            else:
                st = "expired" if cls._is_deadline_expired(deadline) else "assigned"

            results.append({
                "id": a.id,
                "test_id": a.test_id,
                "test_title": a.test.title if a.test else "",
                "application_id": a.application_id,
                "job_id": job_obj.id if job_obj else None,
                "job_title": job_obj.title if job_obj else "Vị trí ứng tuyển",
                "candidate_id": candidate_profile.id if candidate_profile else None,
                "candidate_name": cand_user.full_name if cand_user and cand_user.full_name else "Ứng viên",
                "candidate_email": cand_user.email if cand_user else "",
                "score": score_val,
                "passing_score": passing_score,
                "is_passed": is_passed,
                "earned_points": att_meta.get("earned_points"),
                "total_points": att_meta.get("total_points") or round(sum(float(q.get("points", 10.0)) for q in questions), 2),
                "started_at": a.started_at,
                "completed_at": a.completed_at,
                "submitted_at": a.completed_at,
                "duration_seconds": duration_seconds,
                "deadline": deadline,
                "auto_submitted": bool(att_meta.get("auto_submitted", False)),
                "feedback": att_meta.get("feedback", ""),
                "answers": att_meta.get("items", []),
                "status": st,
            })
        return results

    @classmethod
    def grade_test_attempt(cls, user_id: int, attempt_id: int, data: dict) -> dict:
        """Doanh nghiệp chấm điểm thủ công (cho câu tự luận) hoặc điều chỉnh điểm tổng."""
        company = cls._get_company_for_user(user_id)
        attempt = (
            TestAttempts.objects.select_related("test")
            .filter(id=attempt_id, test__company_id=company.id)
            .first()
        )
        if not attempt:
            raise NotFound("Không tìm thấy bài làm của ứng viên thuộc doanh nghiệp.")

        manual_score = data.get("score")
        if manual_score is None:
            raise ValidationError({"score": "Vui lòng nhập điểm số cần chấm."})

        try:
            score_float = round(float(manual_score), 2)
            if not (0.0 <= score_float <= 100.0):
                raise ValueError()
        except ValueError:
            raise ValidationError({"score": "Điểm số phải là số thực trong khoảng từ 0 đến 100."})

        feedback = str(data.get("feedback") or "").strip()
        meta, _ = cls._unpack_test_data(attempt.test.questions if attempt.test else [])
        att_meta = cls._unpack_attempt_answers(attempt.answers)
        passing_score = (
            float(att_meta["passing_score"])
            if att_meta.get("passing_score") is not None
            else float(meta.get("passing_score", 70.0))
        )
        is_passed = score_float >= passing_score

        att_meta["grader_user_id"] = user_id
        att_meta["feedback"] = feedback
        att_meta["graded_at"] = datetime.now(timezone.utc).isoformat()
        att_meta["has_pending_essay"] = False
        att_meta["is_passed"] = is_passed
        att_meta["passing_score"] = passing_score

        attempt.score = score_float
        if attempt.completed_at is None:
            attempt.completed_at = datetime.now(timezone.utc)
        attempt.answers = att_meta
        attempt.save(update_fields=["score", "completed_at", "answers"])

        return {
            "attempt_id": attempt.id,
            "score": float(attempt.score),
            "passing_score": passing_score,
            "is_passed": is_passed,
            "feedback": feedback,
            "message": "Chấm điểm bài làm thành công.",
        }
