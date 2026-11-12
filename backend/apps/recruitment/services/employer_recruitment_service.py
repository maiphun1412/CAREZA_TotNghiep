import json
from datetime import datetime, timezone
from django.db import connection, transaction
from django.db.models import Q
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError

from apps.authentication.models import Users
from apps.company.models import Companies, Members
from apps.company.services.company_service import CompanyService
from apps.candidate.models import Profiles, Cvs, CvVersions
from apps.recruitment.models import (
    Jobs,
    JobSkills,
    Applications,
    ApplicationHistory,
    Interviews,
    Scorecards,
    Offers,
    Tests,
    TestAttempts,
    TalentPools,
    TalentPoolMembers,
)
from apps.system.models import Skills


class EmployerRecruitmentService:
    @staticmethod
    def get_company(user_id: int) -> Companies:
        return CompanyService.get_company_for_user(user_id)

    # ==========================================
    # 1. Quản lý Tin tuyển dụng (Jobs Management)
    # ==========================================
    @staticmethod
    def get_company_jobs(user_id: int, params: dict) -> dict:
        company = EmployerRecruitmentService.get_company(user_id)
        status_filter = params.get("status")
        keyword = params.get("q", "").strip()
        page = max(1, int(params.get("page", 1)))
        page_size = max(1, min(100, int(params.get("page_size", 10))))
        offset = (page - 1) * page_size

        qs = Jobs.objects.filter(company=company)
        if status_filter:
            qs = qs.filter(status=status_filter)
        if keyword:
            qs = qs.filter(title__icontains=keyword)

        total = qs.count()
        jobs = qs.order_by("-created_at")[offset:offset + page_size]

        items = []
        for j in jobs:
            app_count = Applications.objects.filter(job=j).count()
            items.append({
                "id": j.id,
                "title": j.title,
                "slug": j.slug,
                "status": j.status,
                "salary_min": j.salary_min,
                "salary_max": j.salary_max,
                "currency": j.currency.strip() if j.currency else "VND",
                "openings": j.openings,
                "work_mode": j.work_mode,
                "employment_type": j.employment_type,
                "experience_min": float(j.experience_min) if j.experience_min else None,
                "published_at": j.published_at,
                "expires_at": j.expires_at,
                "created_at": j.created_at,
                "applications_count": app_count,
            })

        return {
            "items": items,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "total_pages": (total + page_size - 1) // page_size if total > 0 else 1,
            },
        }

    @staticmethod
    def get_job_detail(user_id: int, job_id: int) -> dict:
        company = EmployerRecruitmentService.get_company(user_id)
        job = Jobs.objects.filter(id=job_id, company=company).first()
        if not job:
            raise NotFound("Không tìm thấy tin tuyển dụng trong doanh nghiệp của bạn.")

        job_skill_rows = list(JobSkills.objects.filter(job_id=job.id).values("skill_id", "is_required"))
        skill_ids = [r["skill_id"] for r in job_skill_rows]
        skill_map = dict(Skills.objects.filter(id__in=skill_ids).values_list("id", "name")) if skill_ids else {}
        skills = [
            {
                "skill_id": r["skill_id"],
                "skill_name": skill_map.get(r["skill_id"]) or f"Skill #{r['skill_id']}",
                "is_required": r["is_required"],
            }
            for r in job_skill_rows
        ]

        applications_count = Applications.objects.filter(job=job).count()

        return {
            "id": job.id,
            "title": job.title,
            "slug": job.slug,
            "description": job.description,
            "requirements": job.requirements,
            "benefits": job.benefits,
            "salary_min": job.salary_min,
            "salary_max": job.salary_max,
            "currency": job.currency.strip() if job.currency else "VND",
            "work_mode": job.work_mode,
            "employment_type": job.employment_type,
            "experience_min": float(job.experience_min) if job.experience_min else None,
            "openings": job.openings,
            "industry_id": job.industry_id,
            "location_id": job.location_id,
            "status": job.status,
            "published_at": job.published_at,
            "expires_at": job.expires_at,
            "created_at": job.created_at,
            "skills": skills,
            "applications_count": applications_count,
        }

    @staticmethod
    def create_job(user_id: int, data: dict) -> dict:
        company = EmployerRecruitmentService.get_company(user_id)
        user = Users.objects.filter(id=user_id).first()

        title = data.get("title", "").strip()
        if not title:
            raise ValidationError({"title": "Tiêu đề tin tuyển dụng không được để trống."})

        now = datetime.now(timezone.utc)
        slug = title.lower().replace(" ", "-") + f"-{company.id}-{int(now.timestamp())}"
        status_val = data.get("status", "draft")
        published_at = now if status_val == "published" else None

        with transaction.atomic():
            job = Jobs.objects.create(
                company=company,
                created_by=user,
                industry_id=data.get("industry_id"),
                location_id=data.get("location_id"),
                title=title,
                slug=slug,
                description=data.get("description", ""),
                requirements=data.get("requirements", ""),
                benefits=data.get("benefits", ""),
                salary_min=data.get("salary_min"),
                salary_max=data.get("salary_max"),
                currency=data.get("currency", "VND"),
                experience_min=data.get("experience_min"),
                work_mode=data.get("work_mode", "onsite"),
                employment_type=data.get("employment_type", "full_time"),
                openings=data.get("openings", 1),
                status="draft" if status_val == "published" else status_val,
                published_at=None,
                expires_at=data.get("expires_at"),
                created_at=now,
            )

            if status_val == "published":
                from apps.billing.services.billing_service import BillingService
                BillingService.check_and_consume_job_quota(user_id, job_id=job.id)
                job.status = "published"
                job.published_at = published_at
                job.save(update_fields=["status", "published_at"])

            # Thêm kỹ năng yêu cầu nếu có
            skill_ids = data.get("skill_ids", [])
            for s_id in skill_ids:
                JobSkills.objects.get_or_create(
                    job_id=job.id,
                    skill_id=s_id,
                    defaults={"is_required": True},
                )

        return EmployerRecruitmentService.get_job_detail(user_id, job.id)

    @staticmethod
    def update_job(user_id: int, job_id: int, data: dict) -> dict:
        company = EmployerRecruitmentService.get_company(user_id)

        with transaction.atomic():
            job = Jobs.objects.select_for_update().filter(id=job_id, company=company).first()
            if not job:
                raise NotFound("Không tìm thấy tin tuyển dụng cần sửa.")

            was_never_published = (job.status == "draft" and job.published_at is None)

            if data.get("status") == "published" and was_never_published:
                from apps.billing.services.billing_service import BillingService
                BillingService.check_and_consume_job_quota(user_id, job_id=job.id)

            fields = [
                "title", "description", "requirements", "benefits", "salary_min", "salary_max",
                "currency", "experience_min", "work_mode", "employment_type", "openings",
                "industry_id", "location_id", "expires_at", "status"
            ]
            for f in fields:
                if f in data:
                    setattr(job, f, data[f])

            if data.get("status") == "published" and not job.published_at:
                job.published_at = datetime.now(timezone.utc)

            job.save()

            # Cập nhật skills nếu có truyền danh sách
            if "skill_ids" in data:
                JobSkills.objects.filter(job_id=job.id).delete()
                for s_id in data["skill_ids"]:
                    JobSkills.objects.get_or_create(
                        job_id=job.id,
                        skill_id=s_id,
                        defaults={"is_required": True},
                    )

        return EmployerRecruitmentService.get_job_detail(user_id, job.id)

    @staticmethod
    def delete_job(user_id: int, job_id: int) -> dict:
        company = EmployerRecruitmentService.get_company(user_id)

        with transaction.atomic():
            job = Jobs.objects.select_for_update().filter(id=job_id, company=company).first()
            if not job:
                raise NotFound("Không tìm thấy tin tuyển dụng cần xóa.")

            from apps.intelligence.models import Recommendations, MatchResults, MockInterviews
            from apps.interaction.models import SavedJobs, JobComparisons

            app_count = Applications.objects.filter(job_id=job.id).count()
            has_mock_interviews = MockInterviews.objects.filter(job_id=job.id).exists()

            # Nếu tin tuyển dụng đã có ứng viên, lịch sử ứng tuyển, phỏng vấn, bài kiểm tra hoặc Offer:
            # Tuyệt đối KHÔNG xóa dữ liệu tuyển dụng liên quan; chuyển trạng thái tin sang 'closed' (lưu trữ/ngừng tuyển).
            if app_count > 0 or has_mock_interviews:
                if job.status != "closed":
                    job.status = "closed"
                    job.save(update_fields=["status"])
                return {
                    "deleted_id": job_id,
                    "action": "archived_to_closed",
                    "status": "closed",
                    "preserved_applications": app_count,
                    "message": "Tin tuyển dụng đã có dữ liệu ứng tuyển/lịch sử tuyển dụng nên được chuyển sang trạng thái Đóng để bảo toàn hồ sơ ứng viên, phỏng vấn, bài kiểm tra và Offer.",
                }

            # Nếu tin chưa phát sinh bất kỳ dữ liệu ứng tuyển nào -> xóa các bản ghi phụ trợ và xóa tin
            JobSkills.objects.filter(job_id=job.id).delete()
            SavedJobs.objects.filter(job_id=job.id).delete()
            JobComparisons.objects.filter(job_id=job.id).delete()
            Recommendations.objects.filter(job_id=job.id).delete()
            MatchResults.objects.filter(job_id=job.id).delete()
            job.delete()

        return {
            "deleted_id": job_id,
            "action": "hard_deleted",
            "status": "deleted",
            "preserved_applications": 0,
            "message": "Đã xóa tin tuyển dụng thành công.",
        }

    # ==========================================
    # 2. Quản lý Ứng viên & Đơn ứng tuyển
    # ==========================================
    @staticmethod
    def get_company_applications(user_id: int, params: dict) -> dict:
        company = EmployerRecruitmentService.get_company(user_id)
        job_id = params.get("job_id") or params.get("jobPostId") or params.get("jobId")
        status_filter = params.get("status")
        search = (params.get("search") or params.get("q") or "").strip()
        page = max(1, int(params.get("page", 1)))
        page_size = max(1, min(100, int(params.get("page_size", 20))))
        offset = (page - 1) * page_size

        qs = Applications.objects.select_related(
            "job", "candidate", "candidate__user", "cv"
        ).filter(job__company=company)

        if job_id and str(job_id) != "all":
            qs = qs.filter(job_id=int(job_id))
        if status_filter and str(status_filter) != "all":
            qs = qs.filter(status=status_filter)
        if search:
            qs = qs.filter(
                Q(candidate__user__full_name__icontains=search)
                | Q(candidate__user__email__icontains=search)
                | Q(candidate__user__phone__icontains=search)
                | Q(job__title__icontains=search)
                | Q(cv__title__icontains=search)
            )

        total = qs.count()
        apps = qs.order_by("-applied_at")[offset:offset + page_size]

        # Tích hợp AI Matching Score từ MatchResults
        match_map = {}
        cv_ids = [a.cv_id for a in apps if a.cv_id]
        job_ids = [a.job_id for a in apps if a.job_id]
        if cv_ids and job_ids:
            try:
                from apps.intelligence.models import MatchResults
                matches = MatchResults.objects.filter(cv_id__in=cv_ids, job_id__in=job_ids)
                for m in matches:
                    score = round(float(m.hybrid_score or 0) * 100) if m.hybrid_score is not None else None
                    match_map[(m.cv_id, m.job_id)] = score
            except Exception:
                pass

        items = []
        for a in apps:
            cand_user = a.candidate.user if a.candidate else None
            match_score = match_map.get((a.cv_id, a.job_id)) if (a.cv_id and a.job_id) else None

            # Phân tích hồ sơ thủ công vs hồ sơ tự ứng tuyển
            manual_meta = None
            if a.cover_letter and a.cover_letter.strip().startswith('{"source": "manual"'):
                try:
                    manual_meta = json.loads(a.cover_letter)
                except Exception:
                    manual_meta = None

            if manual_meta:
                cand_info = manual_meta.get("candidate_info", {})
                full_name = cand_info.get("full_name") or (cand_user.full_name if cand_user else "Ứng viên")
                email = cand_info.get("email") or (cand_user.email if cand_user else "")
                phone = cand_info.get("phone") or (cand_user.phone if cand_user else "")
                source = "Thủ công (NTD)"
                cv_file_url = manual_meta.get("cv_file_url") or (a.cv.file_url if a.cv else None)
                cv_title = manual_meta.get("cv_title") or (a.cv.title if a.cv else "CV đính kèm")
                note_text = manual_meta.get("notes") or ""
            else:
                full_name = cand_user.full_name if cand_user else "Ứng viên"
                email = cand_user.email if cand_user else ""
                phone = cand_user.phone if cand_user else ""
                source = "CAREZA Portal"
                cv_file_url = a.cv.file_url if a.cv else None
                cv_title = a.cv.title if a.cv else ""
                note_text = a.cover_letter or ""

            items.append({
                "id": a.id,
                "job": {
                    "id": a.job.id,
                    "title": a.job.title,
                },
                "candidate": {
                    "id": a.candidate.id if a.candidate else None,
                    "user_id": cand_user.id if cand_user else None,
                    "full_name": full_name,
                    "email": email,
                    "phone": phone,
                    "avatar_url": cand_user.avatar_url if cand_user else None,
                    "headline": a.candidate.headline if a.candidate else "",
                },
                "cv": {
                    "id": a.cv.id if a.cv else None,
                    "title": cv_title,
                    "file_url": cv_file_url,
                },
                "source": source,
                "cover_letter": a.cover_letter or "",
                "note": note_text,
                "status": a.status,
                "match_score": match_score,
                "applied_at": a.applied_at,
            })

        return {
            "applications": items,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "total_pages": (total + page_size - 1) // page_size if total > 0 else 1,
            },
        }

    @staticmethod
    def get_application_detail(user_id: int, app_id: int) -> dict:
        company = EmployerRecruitmentService.get_company(user_id)
        app = Applications.objects.select_related(
            "job", "candidate", "candidate__user", "cv"
        ).filter(id=app_id, job__company=company).first()

        if not app:
            raise NotFound("Không tìm thấy hồ sơ ứng tuyển trong doanh nghiệp của bạn.")

        cand_user = app.candidate.user if app.candidate else None
        histories = list(ApplicationHistory.objects.filter(application=app).order_by("created_at").values(
            "id", "from_status", "to_status", "note", "created_at"
        ))
        interviews = list(Interviews.objects.filter(application=app).order_by("-scheduled_at").values(
            "id", "scheduled_at", "duration_minutes", "meeting_url", "mode", "status", "notes"
        ))
        scorecards_raw = list(Scorecards.objects.filter(application=app).order_by("-created_at").values(
            "id", "reviewer_id", "technical_score", "communication_score", "culture_score", "notes", "created_at"
        ))
        from apps.authentication.models import Users
        reviewer_ids = [s["reviewer_id"] for s in scorecards_raw if s.get("reviewer_id")]
        rev_map = {u.id: u.full_name for u in Users.objects.filter(id__in=reviewer_ids)}
        scorecards = []
        for s in scorecards_raw:
            scorecards.append({
                **s,
                "reviewer_name": rev_map.get(s.get("reviewer_id"), "Thành viên hội đồng"),
            })
        offer_obj = Offers.objects.filter(application=app).first()
        offer = None
        if offer_obj:
            meta = EmployerRecruitmentService._decode_offer_payload(offer_obj.letter_url)
            offer = {
                "id": offer_obj.id,
                "salary": offer_obj.salary,
                "start_date": offer_obj.start_date.isoformat() if offer_obj.start_date else None,
                "status": offer_obj.status,
                "sent_at": offer_obj.sent_at.isoformat() if offer_obj.sent_at else None,
                "letter_url": meta.get("letter_url", ""),
                "contract_type": meta.get("contract_type", "full_time"),
                "work_location": meta.get("work_location", ""),
                "deadline": meta.get("deadline", ""),
                "position": meta.get("position", ""),
                "notes": meta.get("notes", ""),
                "terms": meta.get("terms", ""),
            }

        # Làm sạch chuỗi ghi chú lịch sử để không lộ tag kỹ thuật trên UI
        import re
        clean_histories = []
        target_version_id = None
        for h in histories:
            note_text = h.get("note") or ""
            if not target_version_id:
                m = re.search(r"\[cv_version_id:(\d+)\]", note_text)
                if m:
                    target_version_id = int(m.group(1))
            cleaned_note = re.sub(r"\s*\[cv_version_id:\d+\]", "", note_text).strip()
            clean_histories.append({**h, "note": cleaned_note})
        histories = clean_histories

        cv_snapshot = None
        if app.cv:
            snap = None
            if target_version_id:
                snap = CvVersions.objects.filter(id=target_version_id).first()

            if not snap:
                snap = CvVersions.objects.filter(cv=app.cv, created_at__lte=app.applied_at).order_by("-version_number").first()
            if not snap:
                snap = CvVersions.objects.filter(cv=app.cv).order_by("-version_number").first()

            if snap:
                cv_snapshot = {
                    "version_number": snap.version_number,
                    "content": snap.content,
                    "file_url": snap.file_url,
                }

        # Phân tích hồ sơ thủ công vs hồ sơ tự ứng tuyển
        manual_meta = None
        if app.cover_letter and app.cover_letter.strip().startswith('{"source": "manual"'):
            try:
                manual_meta = json.loads(app.cover_letter)
            except Exception:
                manual_meta = None

        if manual_meta:
            cand_info = manual_meta.get("candidate_info", {})
            full_name = cand_info.get("full_name") or (cand_user.full_name if cand_user else "")
            email = cand_info.get("email") or (cand_user.email if cand_user else "")
            phone = cand_info.get("phone") or (cand_user.phone if cand_user else "")
            source = "Thủ công (NTD)"
            cv_file_url = manual_meta.get("cv_file_url") or (app.cv.file_url if app.cv else None)
            cv_title = manual_meta.get("cv_title") or (app.cv.title if app.cv else "CV đính kèm")
            note_text = manual_meta.get("notes") or ""
        else:
            full_name = cand_user.full_name if cand_user else ""
            email = cand_user.email if cand_user else ""
            phone = cand_user.phone if cand_user else ""
            source = "Tự ứng tuyển"
            cv_file_url = (cv_snapshot.get("file_url") if cv_snapshot and cv_snapshot.get("file_url") else app.cv.file_url) if app.cv else None
            cv_title = app.cv.title if app.cv else ""
            note_text = app.cover_letter or ""

        # Tích hợp điểm AI Matching giữa CV và JD (không chạy tự động cho hồ sơ thêm thủ công)
        match_info = None
        if not manual_meta and app.cv and app.job:
            try:
                from apps.intelligence.models import MatchResults
                match_obj = MatchResults.objects.filter(cv_id=app.cv.id, job_id=app.job.id).order_by("-computed_at").first()
                if not match_obj:
                    from apps.intelligence.services.ai_intelligence_service import CvJdMatchingService
                    cv_content = cv_snapshot.get("content") if cv_snapshot else (app.cv.parsed_data or {})
                    match_res = CvJdMatchingService.match(
                        user_id=user_id,
                        cv_id=app.cv.id,
                        job_id=app.job.id,
                        cv_data=cv_content,
                    )
                    match_info = match_res
                else:
                    match_info = {
                        "score": round(float(match_obj.hybrid_score or 0) * 100) if match_obj.hybrid_score is not None else None,
                        "skill_score": round(float(match_obj.skill_score or 0) * 100) if match_obj.skill_score is not None else None,
                        "experience_score": round(float(match_obj.experience_score or 0) * 100) if match_obj.experience_score is not None else None,
                        "explanation": match_obj.explanation or {},
                    }
            except Exception:
                match_info = None

        return {
            "id": app.id,
            "job": {
                "id": app.job.id,
                "title": app.job.title,
                "status": app.job.status,
            },
            "candidate": {
                "id": app.candidate.id if app.candidate else None,
                "full_name": full_name,
                "email": email,
                "phone": phone,
                "headline": app.candidate.headline if app.candidate else "",
                "bio": app.candidate.bio if app.candidate else "",
            },
            "cv": {
                "id": app.cv.id if app.cv else None,
                "title": cv_title,
                "file_url": cv_file_url,
                "parsed_data": (cv_snapshot.get("content") if cv_snapshot and cv_snapshot.get("content") else app.cv.parsed_data) if app.cv else {},
                "snapshot": cv_snapshot,
            },
            "source": source,
            "note": note_text,
            "cover_letter": app.cover_letter or "",
            "match_info": match_info,
            "match_score": match_info.get("score") if (match_info and isinstance(match_info, dict)) else None,
            "status": app.status,
            "applied_at": app.applied_at,
            "histories": histories,
            "interviews": interviews,
            "scorecards": scorecards,
            "offer": offer,
        }

    @staticmethod
    def add_manual_candidate(user_id: int, data: dict, file_obj=None) -> dict:
        """
        Thêm hồ sơ ứng viên thủ công từ phía Nhà tuyển dụng:
        - Kiểm tra quyền sở hữu vị trí tuyển dụng của doanh nghiệp
        - Kiểm tra tính hợp lệ & kích thước file CV (tối đa 10MB, .pdf, .doc, .docx)
        - Ngăn chặn trùng lặp hồ sơ cho cùng một tin tuyển dụng
        - Phân biệt rõ hồ sơ thêm thủ công với đơn ứng tuyển tự nộp
        - Tuyệt đối không tạo tài khoản đăng nhập hay kích hoạt AI tự động
        """
        import os
        import uuid
        from django.conf import settings

        company = EmployerRecruitmentService.get_company(user_id)
        job_id = data.get("job_id")
        job = Jobs.objects.filter(id=job_id, company=company).first()
        if not job:
            raise ValidationError({"job_id": "Vị trí tuyển dụng không tồn tại hoặc không thuộc quyền quản lý của doanh nghiệp bạn."})

        name = (data.get("name") or "").strip()
        email = (data.get("email") or "").strip().lower()
        phone = (data.get("phone") or "").strip()
        notes = (data.get("notes") or "").strip()
        cv_title = (data.get("cv_title") or "").strip()
        cv_file_url = data.get("cv_file_url") or ""

        if not name:
            raise ValidationError({"name": "Họ và tên ứng viên không được để trống."})
        if not email:
            raise ValidationError({"email": "Email không được để trống."})

        # Xử lý file CV đính kèm (PDF, DOC, DOCX tối đa 10MB)
        if file_obj:
            allowed_extensions = (".pdf", ".doc", ".docx")
            file_name = file_obj.name or ""
            file_ext = os.path.splitext(file_name)[1].lower()
            if file_ext not in allowed_extensions:
                raise ValidationError({"file": f"Định dạng tệp {file_ext} không được hỗ trợ. Vui lòng tải lên tệp PDF, DOC hoặc DOCX."})

            if file_obj.size > 10 * 1024 * 1024:
                raise ValidationError({"file": "Dung lượng tệp CV vượt quá giới hạn tối đa 10MB."})

            upload_dir = os.path.join(getattr(settings, "MEDIA_ROOT", "media"), "cvs")
            os.makedirs(upload_dir, exist_ok=True)
            unique_filename = f"manual_cv_{uuid.uuid4().hex[:12]}_{os.path.basename(file_name)}"
            target_path = os.path.join(upload_dir, unique_filename)
            try:
                with open(target_path, "wb+") as destination:
                    for chunk in file_obj.chunks():
                        destination.write(chunk)
                cv_file_url = f"/media/cvs/{unique_filename}"
                if not cv_title:
                    cv_title = file_name
            except Exception:
                if not cv_title:
                    cv_title = file_name

        if not cv_title:
            cv_title = "CV đính kèm"

        # Kiểm tra ngăn chặn hồ sơ trùng lặp cho cùng vị trí tuyển dụng
        # 1. Ứng viên đã có tài khoản trên hệ thống
        existing_cand_app = Applications.objects.filter(
            job=job,
            candidate__user__email__iexact=email
        ).exists()
        if existing_cand_app:
            raise ValidationError({"email": f"Ứng viên với email '{email}' đã có hồ sơ/đơn ứng tuyển cho vị trí này."})

        # 2. Hồ sơ đã được thêm thủ công trước đó cho vị trí này
        existing_manual_app = Applications.objects.filter(
            job=job,
            cover_letter__icontains=f'"{email}"'
        ).exists()
        if existing_manual_app:
            raise ValidationError({"email": f"Ứng viên với email '{email}' đã được thêm vào vị trí này rồi."})

        # Tìm profile nếu ứng viên đã đăng ký tài khoản tự do trên hệ thống
        cand_user = Users.objects.filter(email__iexact=email).first()
        cand_profile = Profiles.objects.filter(user=cand_user).first() if cand_user else None

        now = datetime.now(timezone.utc)
        payload = {
            "source": "manual",
            "added_by_user_id": user_id,
            "candidate_info": {
                "full_name": name,
                "email": email,
                "phone": phone,
            },
            "cv_title": cv_title,
            "cv_file_url": cv_file_url or None,
            "notes": notes,
            "created_at": now.isoformat(),
        }

        with transaction.atomic():
            app = Applications.objects.create(
                job=job,
                candidate=cand_profile,
                cv=None,
                cover_letter=json.dumps(payload, ensure_ascii=False),
                status="submitted",
                applied_at=now,
            )

            ApplicationHistory.objects.create(
                application=app,
                from_status=None,
                to_status="submitted",
                note="Hồ sơ do nhà tuyển dụng thêm thủ công.",
                created_at=now,
            )

        return {
            "id": app.id,
            "job": {
                "id": job.id,
                "title": job.title,
            },
            "candidate": {
                "id": cand_profile.id if cand_profile else None,
                "user_id": cand_user.id if cand_user else None,
                "full_name": name,
                "email": email,
                "phone": phone,
                "avatar_url": cand_user.avatar_url if cand_user else None,
                "headline": cand_profile.headline if cand_profile else "",
            },
            "cv": {
                "id": None,
                "title": cv_title,
                "file_url": cv_file_url or None,
            },
            "source": "Thủ công (NTD)",
            "cover_letter": app.cover_letter,
            "note": notes,
            "status": "submitted",
            "match_score": None,
            "applied_at": now.isoformat(),
        }

    @staticmethod
    def update_application_stage(user_id: int, app_id: int, new_status: str, note: str = "") -> dict:
        company = EmployerRecruitmentService.get_company(user_id)
        app = Applications.objects.filter(id=app_id, job__company=company).first()
        if not app:
            raise NotFound("Không tìm thấy hồ sơ ứng tuyển.")

        now = datetime.now(timezone.utc)
        prev_status = app.status

        with transaction.atomic():
            app.status = new_status
            app.save(update_fields=["status"])

            ApplicationHistory.objects.create(
                application=app,
                from_status=prev_status,
                to_status=new_status,
                changed_by=user_id,
                note=note or f"Chuyển trạng thái sang '{new_status}'",
                created_at=now,
            )

        return {"id": app.id, "status": app.status, "message": f"Đã chuyển hồ sơ sang trạng thái {new_status}."}

    # ==========================================
    # 3. Lịch phỏng vấn (Interviews) & Đánh giá (Scorecards) & Offer
    # ==========================================
    @staticmethod
    def schedule_interview(user_id: int, data: dict) -> dict:
        from apps.interaction.models import Notifications
        company = EmployerRecruitmentService.get_company(user_id)
        app_id = data.get("application_id")
        app = Applications.objects.select_related("job", "candidate", "candidate__user").filter(
            id=app_id, job__company=company
        ).first()
        if not app:
            raise NotFound("Không tìm thấy đơn ứng tuyển để lên lịch phỏng vấn.")

        if app.status in ["rejected", "withdrawn"]:
            raise ValidationError({"application_id": "Không thể lên lịch phỏng vấn cho hồ sơ đã từ chối hoặc ứng viên đã rút đơn."})

        scheduled_at = data.get("scheduled_at")
        if not scheduled_at:
            raise ValidationError({"scheduled_at": "Thời gian phỏng vấn không được để trống."})

        duration = int(data.get("duration_minutes", 45))
        mode = (data.get("mode") or "online").lower()
        meeting_url = data.get("meeting_url") or data.get("location") or ""
        notes = data.get("notes", "")

        # Kiểm tra trùng lịch của người phỏng vấn / công ty
        has_conflict = False
        conflict_msg = None
        try:
            start_dt = scheduled_at if isinstance(scheduled_at, datetime) else datetime.fromisoformat(str(scheduled_at).replace("Z", "+00:00"))
            end_dt = start_dt + timedelta(minutes=duration)
            existing_ivs = Interviews.objects.filter(
                application__job__company=company,
                status__in=["scheduled", "confirmed", "UPCOMING", "CONFIRMED"]
            )
            for iv in existing_ivs:
                if iv.scheduled_at:
                    iv_s = iv.scheduled_at
                    iv_e = iv_s + timedelta(minutes=(iv.duration_minutes or 45))
                    if start_dt < iv_e and iv_s < end_dt:
                        has_conflict = True
                        conflict_msg = f"Trùng lịch với cuộc phỏng vấn #{iv.id} lúc {iv_s.strftime('%H:%M %d/%m/%Y')}"
                        break
        except Exception:
            pass

        # Backend xử lý xung đột an toàn: nếu trùng lịch và không có cờ cho phép trùng thì chặn tạo
        allow_conflict = data.get("allow_conflict") or data.get("force")
        if has_conflict and not allow_conflict:
            raise ValidationError({
                "scheduled_at": conflict_msg,
                "has_conflict": True,
                "error": conflict_msg,
            })

        interview = Interviews.objects.create(
            application=app,
            interviewer_id=user_id,
            scheduled_at=scheduled_at,
            duration_minutes=duration,
            meeting_url=meeting_url,
            mode=mode,
            status="scheduled",
            notes=notes,
        )

        # Cập nhật trạng thái đơn ứng tuyển sang interview
        prev_status = app.status
        app.status = "interview"
        app.save(update_fields=["status"])

        now = datetime.now(timezone.utc)
        # Ghi lịch sử xử lý
        ApplicationHistory.objects.create(
            application=app,
            from_status=prev_status,
            to_status="interview",
            changed_by=user_id,
            note=f"Lên lịch phỏng vấn ({mode.upper()}) vào {scheduled_at} ({duration} phút).",
            created_at=now,
        )

        # Gửi thông báo hệ thống cho ứng viên
        try:
            cand_user = app.candidate.user if (app.candidate and hasattr(app.candidate, "user")) else None
            if cand_user:
                Notifications.objects.create(
                    user_id=cand_user.id,
                    type="interview_invite",
                    title=f"Lời mời phỏng vấn: {app.job.title}",
                    content=f"Công ty {company.name} đã lên lịch phỏng vấn bạn cho vị trí '{app.job.title}' vào lúc {scheduled_at}. Vui lòng kiểm tra và phản hồi.",
                    payload={"interview_id": interview.id, "application_id": app.id},
                    created_at=now,
                )
        except Exception:
            pass

        return {
            "id": interview.id,
            "application_id": app.id,
            "scheduled_at": interview.scheduled_at,
            "duration_minutes": interview.duration_minutes,
            "meeting_url": interview.meeting_url,
            "mode": interview.mode,
            "status": interview.status,
            "has_conflict": has_conflict,
            "conflict_message": conflict_msg,
        }

    @staticmethod
    def update_interview(user_id: int, interview_id: int, data: dict) -> dict:
        from apps.interaction.models import Notifications
        company = EmployerRecruitmentService.get_company(user_id)
        interview = Interviews.objects.select_related(
            "application", "application__job", "application__candidate", "application__candidate__user"
        ).filter(id=interview_id, application__job__company=company).first()
        if not interview:
            raise NotFound("Không tìm thấy lịch phỏng vấn.")

        changed_fields = []
        old_time = interview.scheduled_at

        if "scheduled_at" in data and data["scheduled_at"]:
            interview.scheduled_at = data["scheduled_at"]
            changed_fields.append(f"đổi thời gian sang {data['scheduled_at']}")
        if "duration_minutes" in data and data["duration_minutes"] is not None:
            interview.duration_minutes = int(data["duration_minutes"])
        if "mode" in data and data["mode"]:
            interview.mode = str(data["mode"]).lower()
        if "meeting_url" in data:
            interview.meeting_url = data["meeting_url"]
        if "notes" in data:
            interview.notes = data["notes"]
        if "status" in data and data["status"]:
            interview.status = str(data["status"]).lower()
            changed_fields.append(f"trạng thái: {interview.status}")

        interview.save()
        now = datetime.now(timezone.utc)

        # Ghi nhận lịch sử ứng tuyển
        if changed_fields:
            ApplicationHistory.objects.create(
                application=interview.application,
                from_status=interview.application.status,
                to_status=interview.application.status,
                changed_by=user_id,
                note=f"Cập nhật lịch phỏng vấn: {', '.join(changed_fields)}.",
                created_at=now,
            )

        # Gửi thông báo cho ứng viên nếu đổi lịch
        try:
            cand_user = interview.application.candidate.user if (interview.application and interview.application.candidate) else None
            if cand_user and "scheduled_at" in data:
                Notifications.objects.create(
                    user_id=cand_user.id,
                    type="interview_rescheduled",
                    title=f"Thay đổi lịch phỏng vấn: {interview.application.job.title}",
                    content=f"Lịch phỏng vấn của bạn đã được cập nhật sang thời gian mới: {interview.scheduled_at}.",
                    payload={"interview_id": interview.id, "application_id": interview.application_id},
                    created_at=now,
                )
        except Exception:
            pass

        return {
            "id": interview.id,
            "status": interview.status,
            "scheduled_at": interview.scheduled_at,
            "message": "Cập nhật lịch phỏng vấn thành công.",
        }

    @staticmethod
    def cancel_interview(user_id: int, interview_id: int, reason: str = "") -> dict:
        from apps.interaction.models import Notifications
        company = EmployerRecruitmentService.get_company(user_id)
        interview = Interviews.objects.select_related(
            "application", "application__job", "application__candidate", "application__candidate__user"
        ).filter(id=interview_id, application__job__company=company).first()
        if not interview:
            raise NotFound("Không tìm thấy lịch phỏng vấn.")

        interview.status = "cancelled"
        if reason:
            interview.notes = f"{interview.notes or ''}\n[Lý do hủy]: {reason}".strip()
        interview.save(update_fields=["status", "notes"])

        now = datetime.now(timezone.utc)
        ApplicationHistory.objects.create(
            application=interview.application,
            from_status=interview.application.status,
            to_status=interview.application.status,
            changed_by=user_id,
            note=f"Hủy lịch phỏng vấn lúc {interview.scheduled_at}. {f'Lý do: {reason}' if reason else ''}".strip(),
            created_at=now,
        )

        # Gửi thông báo cho ứng viên
        try:
            cand_user = interview.application.candidate.user if (interview.application and interview.application.candidate) else None
            if cand_user:
                Notifications.objects.create(
                    user_id=cand_user.id,
                    type="interview_cancelled",
                    title=f"Lịch phỏng vấn bị hủy: {interview.application.job.title}",
                    content=f"Lịch phỏng vấn cho vị trí {interview.application.job.title} lúc {interview.scheduled_at} đã được hủy bỏ. {f'Lý do: {reason}' if reason else ''}",
                    payload={"interview_id": interview.id, "application_id": interview.application_id},
                    created_at=now,
                )
        except Exception:
            pass

        return {"id": interview.id, "status": "cancelled", "message": "Đã hủy lịch phỏng vấn thành công."}

    @staticmethod
    def get_company_interviews(user_id: int) -> list:
        from apps.authentication.models import Users
        company = EmployerRecruitmentService.get_company(user_id)
        interviews = Interviews.objects.select_related(
            "application", "application__job", "application__candidate", "application__candidate__user"
        ).filter(application__job__company=company).order_by("-scheduled_at")

        interviewer_ids = [i.interviewer_id for i in interviews if i.interviewer_id]
        user_map = {u.id: u.full_name for u in Users.objects.filter(id__in=interviewer_ids)}

        results = []
        for i in interviews:
            cand_user = i.application.candidate.user if i.application.candidate else None
            cand_profile = i.application.candidate if i.application else None
            results.append({
                "id": i.id,
                "application_id": i.application.id,
                "job_id": i.application.job.id if i.application.job else None,
                "job_title": i.application.job.title if i.application.job else "Vị trí tuyển dụng",
                "candidate_id": cand_profile.id if cand_profile else None,
                "candidate_name": cand_user.full_name if cand_user else "Ứng viên",
                "candidate_email": cand_user.email if cand_user else "",
                "candidate_phone": cand_user.phone if cand_user else "",
                "candidate_avatar": cand_user.avatar_url if (cand_user and cand_user.avatar_url) else "",
                "scheduled_at": i.scheduled_at,
                "duration_minutes": i.duration_minutes or 45,
                "meeting_url": i.meeting_url or "",
                "mode": i.mode or "online",
                "status": i.status or "scheduled",
                "notes": i.notes or "",
                "interviewer_id": i.interviewer_id,
                "interviewer_name": user_map.get(i.interviewer_id, "Hội đồng tuyển dụng"),
            })
        return results

    @staticmethod
    def add_scorecard(user_id: int, data: dict) -> dict:
        company = EmployerRecruitmentService.get_company(user_id)
        app_id = data.get("application_id")
        app = Applications.objects.filter(id=app_id, job__company=company).first()
        if not app:
            raise NotFound("Không tìm thấy đơn ứng tuyển.")

        now = datetime.now(timezone.utc)
        tech_score = data.get("technical_score")
        comm_score = data.get("communication_score")
        cult_score = data.get("culture_score")
        notes = data.get("notes", "")

        scorecard = Scorecards.objects.create(
            application=app,
            reviewer_id=user_id,
            technical_score=tech_score,
            communication_score=comm_score,
            culture_score=cult_score,
            notes=notes,
            created_at=now,
        )

        # Ghi nhận lịch sử (không tự động đổi trạng thái sang Hired)
        ApplicationHistory.objects.create(
            application=app,
            from_status=app.status,
            to_status=app.status,
            changed_by=user_id,
            note=f"Hội đồng tuyển dụng đã ghi nhận phiếu đánh giá phỏng vấn (Điểm chuyên môn: {tech_score or '-'}, Giao tiếp: {comm_score or '-'}, Văn hóa: {cult_score or '-'}). Ghi chú: {notes[:60]}..." if notes else "Đã ghi nhận phiếu đánh giá phỏng vấn.",
            created_at=now,
        )

        return {
            "id": scorecard.id,
            "application_id": app.id,
            "technical_score": float(scorecard.technical_score) if scorecard.technical_score else None,
            "communication_score": float(scorecard.communication_score) if scorecard.communication_score else None,
            "culture_score": float(scorecard.culture_score) if scorecard.culture_score else None,
            "notes": scorecard.notes,
            "created_at": scorecard.created_at,
        }

    # ==========================================
    # QUẢN LÝ OFFER TUYỂN DỤNG
    # ==========================================
    @staticmethod
    def _encode_offer_payload(letter_url: str = "", contract_type: str = "", work_location: str = "", deadline: str = "", position: str = "", notes: str = "", terms: str = "") -> str:
        payload = {
            "letter_url": letter_url or "",
            "contract_type": contract_type or "full_time",
            "work_location": work_location or "",
            "deadline": deadline or "",
            "position": position or "",
            "notes": notes or "",
            "terms": terms or "",
        }
        return json.dumps(payload, ensure_ascii=False)

    @staticmethod
    def _decode_offer_payload(raw_letter_url: str) -> dict:
        if not raw_letter_url:
            return {"letter_url": "", "contract_type": "full_time", "work_location": "", "deadline": "", "position": "", "notes": "", "terms": ""}
        try:
            data = json.loads(raw_letter_url)
            if isinstance(data, dict):
                return {
                    "letter_url": data.get("letter_url", ""),
                    "contract_type": data.get("contract_type", "full_time"),
                    "work_location": data.get("work_location", ""),
                    "deadline": data.get("deadline", ""),
                    "position": data.get("position", ""),
                    "notes": data.get("notes", ""),
                    "terms": data.get("terms", ""),
                }
        except Exception:
            pass
        return {"letter_url": raw_letter_url, "contract_type": "full_time", "work_location": "", "deadline": "", "position": "", "notes": "", "terms": ""}

    @staticmethod
    def get_company_offers(user_id: int, params: dict = None) -> dict:
        company = EmployerRecruitmentService.get_company(user_id)
        params = params or {}
        status_filter = params.get("status", "all").strip().lower()
        search_query = params.get("search", "").strip().lower()

        offers_qs = Offers.objects.select_related(
            "application", "application__job", "application__candidate", "application__candidate__user"
        ).filter(application__job__company=company).order_by("-sent_at", "-id")

        now = datetime.now(timezone.utc)
        items = []
        for off in offers_qs:
            app = off.application
            job = app.job if app else None
            cand = app.candidate if app else None
            cand_user = cand.user if cand else None

            meta = EmployerRecruitmentService._decode_offer_payload(off.letter_url)

            # Kiểm tra tự động quá hạn: nếu đang sent và deadline đã qua
            cur_status = str(off.status or "sent").lower()
            deadline_str = meta.get("deadline", "")
            if cur_status == "sent" and deadline_str:
                try:
                    d_date = datetime.strptime(deadline_str[:10], "%Y-%m-%d").date()
                    if d_date < now.date():
                        cur_status = "expired"
                        off.status = "expired"
                        off.save(update_fields=["status"])
                except Exception:
                    pass

            if status_filter != "all" and cur_status != status_filter:
                continue

            cand_name = cand_user.full_name if cand_user else "Ứng viên"
            job_title = meta.get("position") or (job.title if job else "Vị trí tuyển dụng")

            if search_query:
                if (search_query not in cand_name.lower() and
                    search_query not in job_title.lower() and
                    search_query not in (cand_user.email.lower() if cand_user and cand_user.email else "")):
                    continue

            items.append({
                "id": off.id,
                "application_id": app.id if app else None,
                "candidate": {
                    "id": cand.id if cand else None,
                    "name": cand_name,
                    "email": cand_user.email if cand_user else "",
                    "phone": cand_user.phone if cand_user else "",
                    "avatar_url": cand_user.avatar_url if cand_user else None,
                },
                "job": {
                    "id": job.id if job else None,
                    "title": job_title,
                    "department": getattr(job, "department", "Bộ phận tuyển dụng"),
                },
                "salary": off.salary,
                "start_date": off.start_date.isoformat() if off.start_date else None,
                "status": cur_status,
                "sent_at": off.sent_at.isoformat() if off.sent_at else None,
                "letter_url": meta.get("letter_url", ""),
                "contract_type": meta.get("contract_type", "full_time"),
                "work_location": meta.get("work_location", ""),
                "deadline": meta.get("deadline", ""),
                "notes": meta.get("notes", ""),
                "terms": meta.get("terms", ""),
            })

        return {"offers": items, "total": len(items)}

    @staticmethod
    def get_offer_detail(user_id: int, offer_id: int) -> dict:
        company = EmployerRecruitmentService.get_company(user_id)
        off = Offers.objects.select_related(
            "application", "application__job", "application__candidate", "application__candidate__user"
        ).filter(id=offer_id, application__job__company=company).first()
        if not off:
            raise NotFound("Không tìm thấy thông tin thư mời nhận việc.")

        app = off.application
        job = app.job if app else None
        cand = app.candidate if app else None
        cand_user = cand.user if cand else None
        meta = EmployerRecruitmentService._decode_offer_payload(off.letter_url)

        return {
            "id": off.id,
            "application_id": app.id if app else None,
            "candidate": {
                "id": cand.id if cand else None,
                "name": cand_user.full_name if cand_user else "Ứng viên",
                "email": cand_user.email if cand_user else "",
                "phone": cand_user.phone if cand_user else "",
                "avatar_url": cand_user.avatar_url if cand_user else None,
            },
            "job": {
                "id": job.id if job else None,
                "title": meta.get("position") or (job.title if job else ""),
            },
            "salary": off.salary,
            "start_date": off.start_date.isoformat() if off.start_date else None,
            "status": off.status,
            "sent_at": off.sent_at.isoformat() if off.sent_at else None,
            "letter_url": meta.get("letter_url", ""),
            "contract_type": meta.get("contract_type", "full_time"),
            "work_location": meta.get("work_location", ""),
            "deadline": meta.get("deadline", ""),
            "notes": meta.get("notes", ""),
            "terms": meta.get("terms", ""),
        }

    @staticmethod
    def create_or_update_offer(user_id: int, data: dict) -> dict:
        from apps.interaction.models import Notifications
        company = EmployerRecruitmentService.get_company(user_id)
        app_id = data.get("application_id")
        app = Applications.objects.select_related("job", "candidate", "candidate__user").filter(
            id=app_id, job__company=company
        ).first()
        if not app:
            raise NotFound("Không tìm thấy đơn ứng tuyển để tạo offer.")

        if app.status in ["rejected", "withdrawn"]:
            raise ValidationError({"application_id": "Không thể tạo Offer cho hồ sơ đã từ chối hoặc ứng viên đã rút đơn."})

        # Ngăn tạo trùng lặp nếu ứng viên đã có offer sent hoặc accepted
        existing_offer = Offers.objects.filter(application=app).first()
        is_draft = bool(data.get("is_draft", False))
        now = datetime.now(timezone.utc)

        target_status = "draft" if is_draft else "sent"
        if existing_offer and existing_offer.status == "accepted" and target_status != "accepted":
            raise ValidationError({"error": "Ứng viên đã chấp nhận Offer trước đó, không thể ghi đè."})

        payload_str = EmployerRecruitmentService._encode_offer_payload(
            letter_url=data.get("letter_url", ""),
            contract_type=data.get("contract_type", "full_time"),
            work_location=data.get("work_location", ""),
            deadline=data.get("deadline", ""),
            position=data.get("position", app.job.title if app.job else ""),
            notes=data.get("notes", ""),
            terms=data.get("terms", ""),
        )

        salary_val = data.get("salary")
        if salary_val is not None:
            try:
                salary_val = int(str(salary_val).replace(",", "").replace(".", "").strip())
            except Exception:
                salary_val = None

        raw_start_date = data.get("start_date") or None
        start_date_val = None
        if raw_start_date:
            if hasattr(raw_start_date, "isoformat"):
                start_date_val = raw_start_date
            else:
                try:
                    start_date_val = datetime.strptime(str(raw_start_date)[:10], "%Y-%m-%d").date()
                except Exception:
                    start_date_val = None

        if existing_offer:
            offer = existing_offer
            offer.salary = salary_val
            offer.start_date = start_date_val
            offer.letter_url = payload_str
            offer.status = target_status
            if not is_draft and not offer.sent_at:
                offer.sent_at = now
            offer.save()
        else:
            offer = Offers.objects.create(
                application=app,
                salary=salary_val,
                start_date=start_date_val,
                letter_url=payload_str,
                status=target_status,
                sent_at=now if not is_draft else None,
            )

        if not is_draft:
            prev_status = app.status
            app.status = "offered"
            app.save(update_fields=["status"])

            ApplicationHistory.objects.create(
                application=app,
                from_status=prev_status,
                to_status="offered",
                changed_by=user_id,
                note=f"Gửi thư mời nhận việc (Offer): Lương {offer.salary:,} VNĐ, ngày bắt đầu {offer.start_date}." if offer.salary else "Gửi thư mời nhận việc (Offer).",
                created_at=now,
            )

            # Bắn thông báo cho ứng viên
            try:
                cand_user = app.candidate.user if (app.candidate and hasattr(app.candidate, "user")) else None
                if cand_user:
                    Notifications.objects.create(
                        user_id=cand_user.id,
                        type="offer_received",
                        title=f"Thư mời nhận việc từ {company.name}",
                        content=f"Chúc mừng bạn! {company.name} đã gửi Thư mời nhận việc (Offer) cho vị trí '{app.job.title}'. Vui lòng xem chi tiết và phản hồi.",
                        payload={"offer_id": offer.id, "application_id": app.id},
                        created_at=now,
                    )
            except Exception:
                pass
        else:
            ApplicationHistory.objects.create(
                application=app,
                from_status=app.status,
                to_status=app.status,
                changed_by=user_id,
                note="Lưu nháp thư mời nhận việc (Offer).",
                created_at=now,
            )

        meta = EmployerRecruitmentService._decode_offer_payload(offer.letter_url)
        return {
            "id": offer.id,
            "application_id": app.id,
            "salary": offer.salary,
            "start_date": offer.start_date.isoformat() if hasattr(offer.start_date, "isoformat") else (str(offer.start_date) if offer.start_date else None),
            "status": offer.status,
            "sent_at": offer.sent_at.isoformat() if hasattr(offer.sent_at, "isoformat") else (str(offer.sent_at) if offer.sent_at else None),
            "contract_type": meta.get("contract_type"),
            "work_location": meta.get("work_location"),
            "deadline": meta.get("deadline"),
            "message": "Đã lưu bản nháp Offer thành công." if is_draft else "Đã gửi Offer thành công tới ứng viên!",
        }

    @staticmethod
    def send_draft_offer(user_id: int, offer_id: int) -> dict:
        from apps.interaction.models import Notifications
        company = EmployerRecruitmentService.get_company(user_id)
        offer = Offers.objects.select_related(
            "application", "application__job", "application__candidate", "application__candidate__user"
        ).filter(id=offer_id, application__job__company=company).first()
        if not offer:
            raise NotFound("Không tìm thấy thư mời nhận việc.")

        if offer.status not in ["draft", "pending"]:
            raise ValidationError({"error": f"Offer đang ở trạng thái '{offer.status}', không thể gửi."})

        now = datetime.now(timezone.utc)
        offer.status = "sent"
        offer.sent_at = now
        offer.save(update_fields=["status", "sent_at"])

        app = offer.application
        prev_status = app.status
        app.status = "offered"
        app.save(update_fields=["status"])

        ApplicationHistory.objects.create(
            application=app,
            from_status=prev_status,
            to_status="offered",
            changed_by=user_id,
            note=f"Chính thức gửi Thư mời nhận việc (Offer) tới ứng viên.",
            created_at=now,
        )

        try:
            cand_user = app.candidate.user if (app.candidate and hasattr(app.candidate, "user")) else None
            if cand_user:
                Notifications.objects.create(
                    user_id=cand_user.id,
                    type="offer_received",
                    title=f"Thư mời nhận việc từ {company.name}",
                    content=f"Chúc mừng bạn! {company.name} đã gửi Thư mời nhận việc (Offer) cho vị trí '{app.job.title}'. Vui lòng xem chi tiết và phản hồi.",
                    payload={"offer_id": offer.id, "application_id": app.id},
                    created_at=now,
                )
        except Exception:
            pass

        return {"id": offer.id, "status": offer.status, "message": "Đã gửi Offer thành công tới ứng viên!"}

    @staticmethod
    def cancel_offer(user_id: int, offer_id: int, reason: str = "") -> dict:
        from apps.interaction.models import Notifications
        company = EmployerRecruitmentService.get_company(user_id)
        offer = Offers.objects.select_related(
            "application", "application__job", "application__candidate", "application__candidate__user"
        ).filter(id=offer_id, application__job__company=company).first()
        if not offer:
            raise NotFound("Không tìm thấy thư mời nhận việc.")

        prev_status = offer.status
        offer.status = "cancelled"
        offer.save(update_fields=["status"])

        now = datetime.now(timezone.utc)
        app = offer.application
        ApplicationHistory.objects.create(
            application=app,
            from_status=app.status,
            to_status=app.status,
            changed_by=user_id,
            note=f"Thu hồi Thư mời nhận việc (Offer). {f'Lý do: {reason}' if reason else ''}".strip(),
            created_at=now,
        )

        # Nếu offer trước đó đã gửi cho ứng viên, gửi thông báo thu hồi
        if prev_status == "sent":
            try:
                cand_user = app.candidate.user if (app.candidate and hasattr(app.candidate, "user")) else None
                if cand_user:
                    Notifications.objects.create(
                        user_id=cand_user.id,
                        type="offer_cancelled",
                        title=f"Thông báo thu hồi Thư mời nhận việc: {company.name}",
                        content=f"Thư mời nhận việc cho vị trí '{app.job.title}' đã được doanh nghiệp thu hồi.",
                        payload={"offer_id": offer.id, "application_id": app.id},
                        created_at=now,
                    )
            except Exception:
                pass

        return {"id": offer.id, "status": offer.status, "message": "Đã thu hồi Offer thành công."}

    # ==========================================
    # 4. Quản lý Bài kiểm tra năng lực (Tests)
    # ==========================================
    @staticmethod
    def get_company_tests(user_id: int) -> list:
        from apps.recruitment.services.assessment_service import AssessmentService
        return AssessmentService.get_company_tests(user_id)

    @staticmethod
    def create_test(user_id: int, data: dict) -> dict:
        from apps.recruitment.services.assessment_service import AssessmentService
        return AssessmentService.create_company_test(user_id, data)

    # ==========================================
    # 5. Talent Pool (Hồ sơ tiềm năng)
    # ==========================================
    @staticmethod
    def get_talent_pools(user_id: int) -> list:
        company = EmployerRecruitmentService.get_company(user_id)
        pools = TalentPools.objects.filter(company_id=company.id)
        results = []
        from apps.candidate.models import Profiles
        for p in pools:
            pool_members = TalentPoolMembers.objects.filter(pool_id=p.id)
            members = []
            for pm in pool_members:
                profile = Profiles.objects.select_related("user").filter(id=pm.candidate_id).first()
                cand_user = profile.user if profile else None
                members.append({
                    "candidate_id": pm.candidate_id,
                    "notes": pm.notes or "",
                    "candidate": {
                        "id": profile.id if profile else pm.candidate_id,
                        "full_name": cand_user.full_name if cand_user else f"Ứng viên #{pm.candidate_id}",
                        "email": cand_user.email if cand_user else "",
                        "phone": cand_user.phone if cand_user else "",
                        "avatar_url": cand_user.avatar_url if cand_user else None,
                        "headline": profile.headline if profile else "",
                    }
                })
            results.append({
                "id": p.id,
                "name": p.name,
                "description": p.description,
                "members_count": len(members),
                "members": members,
            })
        return results

    @staticmethod
    def create_talent_pool(user_id: int, data: dict) -> dict:
        company = EmployerRecruitmentService.get_company(user_id)
        name = data.get("name", "").strip()
        if not name:
            raise ValidationError({"name": "Tên nhóm ứng viên không được để trống."})

        p = TalentPools.objects.create(
            company_id=company.id,
            name=name,
            description=data.get("description", ""),
        )
        return {"id": p.id, "name": p.name, "description": p.description}

    @staticmethod
    def add_candidate_to_pool(user_id: int, pool_id: int, candidate_id: int, notes: str = "") -> dict:
        company = EmployerRecruitmentService.get_company(user_id)
        pool = TalentPools.objects.filter(id=pool_id, company_id=company.id).first()
        if not pool:
            raise NotFound("Không tìm thấy nhóm ứng viên tiềm năng.")

        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO recruitment.talent_pool_members (pool_id, candidate_id, added_by, notes)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (pool_id, candidate_id) DO UPDATE SET notes = EXCLUDED.notes;
            """, [pool.id, candidate_id, user_id, notes])

        return {"pool_id": pool.id, "candidate_id": candidate_id, "notes": notes}

    @staticmethod
    def remove_candidate_from_pool(user_id: int, pool_id: int, candidate_id: int) -> None:
        company = EmployerRecruitmentService.get_company(user_id)
        pool = TalentPools.objects.filter(id=pool_id, company_id=company.id).first()
        if not pool:
            raise NotFound("Không tìm thấy nhóm ứng viên.")

        with connection.cursor() as cursor:
            cursor.execute("""
                DELETE FROM recruitment.talent_pool_members
                WHERE pool_id = %s AND candidate_id = %s;
            """, [pool.id, candidate_id])

    # ==========================================
    # 6. Dashboard Doanh nghiệp & Thống kê
    # ==========================================
    @staticmethod
    def get_dashboard_summary(user_id: int) -> dict:
        company = EmployerRecruitmentService.get_company(user_id)

        company_jobs = Jobs.objects.filter(company=company)
        total_jobs = company_jobs.count()
        active_jobs = company_jobs.filter(status="published").count()
        total_applications = Applications.objects.filter(job__company=company).count()

        # Thống kê theo trạng thái ứng tuyển
        status_counts = {}
        for s in ["submitted", "screening", "shortlisted", "test", "interview", "offered", "hired", "rejected", "withdrawn"]:
            status_counts[s] = Applications.objects.filter(job__company=company, status=s).count()

        # Lịch phỏng vấn sắp tới
        now = datetime.now(timezone.utc)
        upcoming_interviews_qs = Interviews.objects.filter(
            application__job__company=company,
            scheduled_at__gte=now,
            status="scheduled",
        ).select_related("application__candidate", "application__candidate__user", "application__job").order_by("scheduled_at")
        upcoming_interviews_count = upcoming_interviews_qs.count()

        talent_pool_count = TalentPoolMembers.objects.filter(
            pool__company_id=company.id
        ).count() if hasattr(TalentPoolMembers, 'pool') else 0

        # 1. Pipeline ứng viên thực tế theo 5 cột
        pipeline = {}
        for st_key in ["submitted", "screening", "interview", "offered", "hired"]:
            apps_in_stage = Applications.objects.filter(
                job__company=company,
                status=st_key
            ).select_related("candidate", "candidate__user", "job").order_by("-applied_at")[:3]

            candidates_list = []
            for app in apps_in_stage:
                cand_u = app.candidate.user if app.candidate else None
                candidates_list.append({
                    "id": app.id,
                    "candidate_name": cand_u.full_name if (cand_u and cand_u.full_name) else "Ứng viên",
                    "job_title": app.job.title if app.job else "Vị trí tuyển dụng",
                    "applied_at": app.applied_at,
                })

            pipeline[st_key] = {
                "total": status_counts.get(st_key, 0),
                "items": candidates_list,
            }

        # 2. Tin tuyển dụng gần đây (4 jobs)
        recent_jobs = []
        for j in company_jobs.order_by("-created_at")[:4]:
            salary_str = "Thoả thuận"
            if j.salary_min and j.salary_max:
                salary_str = f"{int(j.salary_min / 1_000_000)} - {int(j.salary_max / 1_000_000)} triệu VND"
            elif j.salary_min:
                salary_str = f"Từ {int(j.salary_min / 1_000_000)} triệu VND"
            elif j.salary_max:
                salary_str = f"Đến {int(j.salary_max / 1_000_000)} triệu VND"

            app_count = Applications.objects.filter(job=j).count()
            recent_jobs.append({
                "id": j.id,
                "title": j.title,
                "status": j.status,
                "salary": salary_str,
                "employment_type": j.employment_type or "Toàn thời gian",
                "work_mode": j.work_mode or "Tại văn phòng",
                "applications_count": app_count,
                "created_at": j.created_at,
            })

        # 3. Lịch phỏng vấn sắp tới (4 interviews)
        upcoming_interviews = []
        for iv in upcoming_interviews_qs[:4]:
            iv_cand_u = iv.application.candidate.user if (iv.application and iv.application.candidate) else None
            upcoming_interviews.append({
                "id": iv.id,
                "candidate_name": iv_cand_u.full_name if (iv_cand_u and iv_cand_u.full_name) else "Ứng viên",
                "job_title": iv.application.job.title if iv.application and iv.application.job else "Vị trí ứng tuyển",
                "scheduled_at": iv.scheduled_at,
                "mode": iv.mode or "Online",
                "meeting_url": iv.meeting_url,
            })

        # 4. Biểu đồ tuyển dụng (tính số liệu thực tế qua 7 mốc ngày trong 30 ngày)
        from datetime import timedelta
        chart_data_list = []
        for i in range(6, -1, -1):
            date_point = now - timedelta(days=i * 4)
            date_str = date_point.strftime("%d/%m")
            # Đếm số đơn nộp trong khoảng
            day_start = date_point.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=4)
            period_apps = Applications.objects.filter(
                job__company=company,
                applied_at__gte=day_start,
                applied_at__lt=day_end,
            ).count()
            period_matches = Applications.objects.filter(
                job__company=company,
                applied_at__gte=day_start,
                applied_at__lt=day_end,
                status__in=["shortlisted", "interview", "offered", "hired"],
            ).count()
            chart_data_list.append({
                "date": date_str,
                "newCandidates": period_apps,
                "matchCandidates": period_matches,
                "views": period_apps * 3,  # ước lượng tỉ lệ tương tác nếu chưa có bảng log lượt xem
                "x": 60 + (6 - i) * 135,
            })

        # 5. Hiệu suất tuyển dụng tính từ dữ liệu thực
        processed_apps = total_applications - status_counts.get("submitted", 0)
        response_rate = round((processed_apps / total_applications * 100), 1) if total_applications > 0 else 0
        hired_count = status_counts.get("hired", 0)
        hire_rate = round((hired_count / total_applications * 100), 1) if total_applications > 0 else 0

        return {
            "company_name": company.name,
            "total_jobs": total_jobs,
            "active_jobs": active_jobs,
            "total_applications": total_applications,
            "applications_by_status": status_counts,
            "upcoming_interviews_count": upcoming_interviews_count,
            "talent_pool_count": talent_pool_count,
            "pipeline": pipeline,
            "recent_jobs": recent_jobs,
            "upcoming_interviews": upcoming_interviews,
            "chart_data": chart_data_list,
            "performance": {
                "response_rate": response_rate,
                "hire_rate": hire_rate,
            }
        }

