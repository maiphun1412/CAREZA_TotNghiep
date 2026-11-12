import json
from datetime import datetime, timezone
from django.db import connection, transaction
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError

from apps.authentication.models import Users
from apps.candidate.models import (
    Profiles,
    Cvs,
    CvVersions,
    Educations,
    Experiences,
    Certificates,
    ProfileSkills,
    Projects,
    JobPreferences,
)
from apps.company.models import Companies
from apps.recruitment.models import Jobs, JobSkills, Applications, ApplicationHistory, Interviews, Offers
from apps.interaction.models import SavedJobs, CompanyFollows, Notifications, JobAlerts
from apps.system.models import Skills, Locations, Industries


class CandidateService:
    @staticmethod
    def get_or_create_profile(user_id: int) -> Profiles:
        """Lấy hoặc tạo hồ sơ ứng viên nếu chưa có."""
        user = Users.objects.filter(id=user_id, is_active=True).first()
        if not user:
            raise NotFound("Không tìm thấy thông tin tài khoản người dùng.")

        profile, created = Profiles.objects.get_or_create(
            user=user,
            defaults={
                "headline": "Ứng viên",
                "created_at": datetime.now(timezone.utc),
            }
        )
        return profile

    # ==========================================
    # 1. Quản lý Hồ sơ cá nhân (Candidate Profile)
    # ==========================================
    @staticmethod
    def get_full_profile(user_id: int) -> dict:
        profile = CandidateService.get_or_create_profile(user_id)
        user = profile.user

        # Lấy kỹ năng kèm tên từ system.skills
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT ps.skill_id, s.name, ps.proficiency
                FROM candidate.profile_skills ps
                LEFT JOIN system.skills s ON ps.skill_id = s.id
                WHERE ps.profile_id = %s;
            """, [profile.id])
            skills_data = [
                {
                    "skill_id": row[0],
                    "skill_name": row[1] or f"Kỹ năng #{row[0]}",
                    "proficiency": row[2] or "Intermediate",
                }
                for row in cursor.fetchall()
            ]

        educations = list(Educations.objects.filter(profile=profile).values(
            "id", "institution", "major", "degree", "start_year", "end_year", "description"
        ))

        experiences = list(Experiences.objects.filter(profile=profile).values(
            "id", "employer_name", "job_title", "start_date", "end_date", "description"
        ))

        certificates = list(Certificates.objects.filter(profile=profile).values(
            "id", "name", "issuer", "issued_on", "credential_url"
        ))

        projects = list(Projects.objects.filter(profile=profile).values(
            "id", "name", "description", "project_url"
        ))

        preferences = JobPreferences.objects.filter(profile=profile).first()
        pref_data = None
        if preferences:
            pref_data = {
                "id": preferences.id,
                "desired_titles": preferences.desired_titles,
                "industry_id": preferences.industry_id,
                "location_id": preferences.location_id,
                "work_modes": preferences.work_modes,
                "salary_min": preferences.salary_min,
            }

        return {
            "profile": {
                "id": profile.id,
                "user_id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "phone": user.phone,
                "avatar_url": user.avatar_url,
                "headline": profile.headline,
                "bio": profile.bio,
                "birth_date": profile.birth_date,
                "location_id": profile.location_id,
                "desired_salary_min": profile.desired_salary_min,
                "desired_salary_max": profile.desired_salary_max,
                "experience_years": float(profile.experience_years or 0),
                "work_mode": profile.work_mode,
                "visibility": profile.visibility,
                "created_at": profile.created_at,
            },
            "educations": educations,
            "experiences": experiences,
            "skills": skills_data,
            "certificates": certificates,
            "projects": projects,
            "job_preferences": pref_data,
        }

    @staticmethod
    def update_profile(user_id: int, data: dict) -> dict:
        profile = CandidateService.get_or_create_profile(user_id)
        user = profile.user

        # Cập nhật thông tin tài khoản cơ bản nếu có
        user_updated = False
        if "full_name" in data and data["full_name"]:
            user.full_name = data["full_name"].strip()
            user_updated = True
        if "phone" in data:
            user.phone = data["phone"].strip() if data["phone"] else None
            user_updated = True
        if "avatar_url" in data:
            user.avatar_url = data["avatar_url"]
            user_updated = True

        if user_updated:
            user.updated_at = datetime.now(timezone.utc)
            user.save()

        # Cập nhật thông tin profile
        updatable_fields = [
            "headline", "bio", "birth_date", "location_id",
            "desired_salary_min", "desired_salary_max",
            "experience_years", "work_mode", "visibility"
        ]
        for field in updatable_fields:
            if field in data:
                setattr(profile, field, data[field])

        profile.save()
        return CandidateService.get_full_profile(user_id)

    # Học vấn (Educations)
    @staticmethod
    def add_education(user_id: int, data: dict) -> dict:
        profile = CandidateService.get_or_create_profile(user_id)
        edu = Educations.objects.create(
            profile=profile,
            institution=data.get("institution", ""),
            major=data.get("major", ""),
            degree=data.get("degree", ""),
            start_year=data.get("start_year"),
            end_year=data.get("end_year"),
            description=data.get("description", ""),
        )
        return {"id": edu.id, "institution": edu.institution, "major": edu.major}

    @staticmethod
    def update_education(user_id: int, edu_id: int, data: dict) -> dict:
        profile = CandidateService.get_or_create_profile(user_id)
        edu = Educations.objects.filter(id=edu_id, profile=profile).first()
        if not edu:
            raise NotFound("Không tìm thấy bản ghi học vấn cần cập nhật.")
        for field in ["institution", "major", "degree", "start_year", "end_year", "description"]:
            if field in data:
                setattr(edu, field, data[field])
        edu.save()
        return {"id": edu.id, "institution": edu.institution, "major": edu.major}

    @staticmethod
    def delete_education(user_id: int, edu_id: int) -> None:
        profile = CandidateService.get_or_create_profile(user_id)
        edu = Educations.objects.filter(id=edu_id, profile=profile).first()
        if not edu:
            raise NotFound("Không tìm thấy bản ghi học vấn cần xóa.")
        edu.delete()

    # Kinh nghiệm làm việc (Experiences)
    @staticmethod
    def add_experience(user_id: int, data: dict) -> dict:
        profile = CandidateService.get_or_create_profile(user_id)
        exp = Experiences.objects.create(
            profile=profile,
            employer_name=data.get("employer_name", ""),
            job_title=data.get("job_title", ""),
            start_date=data.get("start_date"),
            end_date=data.get("end_date"),
            description=data.get("description", ""),
        )
        return {"id": exp.id, "employer_name": exp.employer_name, "job_title": exp.job_title}

    @staticmethod
    def update_experience(user_id: int, exp_id: int, data: dict) -> dict:
        profile = CandidateService.get_or_create_profile(user_id)
        exp = Experiences.objects.filter(id=exp_id, profile=profile).first()
        if not exp:
            raise NotFound("Không tìm thấy bản ghi kinh nghiệm cần cập nhật.")
        for field in ["employer_name", "job_title", "start_date", "end_date", "description"]:
            if field in data:
                setattr(exp, field, data[field])
        exp.save()
        return {"id": exp.id, "employer_name": exp.employer_name, "job_title": exp.job_title}

    @staticmethod
    def delete_experience(user_id: int, exp_id: int) -> None:
        profile = CandidateService.get_or_create_profile(user_id)
        exp = Experiences.objects.filter(id=exp_id, profile=profile).first()
        if not exp:
            raise NotFound("Không tìm thấy bản ghi kinh nghiệm cần xóa.")
        exp.delete()

    # Kỹ năng (Profile Skills)
    @staticmethod
    def add_skill(user_id: int, data: dict) -> dict:
        profile = CandidateService.get_or_create_profile(user_id)
        skill_id = data.get("skill_id")
        proficiency = data.get("proficiency", "Intermediate")

        if not Skills.objects.filter(id=skill_id).exists():
            raise ValidationError({"skill_id": "Kỹ năng không tồn tại trong hệ thống."})

        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO candidate.profile_skills (profile_id, skill_id, proficiency)
                VALUES (%s, %s, %s)
                ON CONFLICT (profile_id, skill_id) 
                DO UPDATE SET proficiency = EXCLUDED.proficiency;
            """, [profile.id, skill_id, proficiency])

        skill_obj = Skills.objects.filter(id=skill_id).first()
        return {
            "skill_id": skill_id,
            "skill_name": skill_obj.name if skill_obj else "",
            "proficiency": proficiency,
        }

    @staticmethod
    def delete_skill(user_id: int, skill_id: int) -> None:
        profile = CandidateService.get_or_create_profile(user_id)
        with connection.cursor() as cursor:
            cursor.execute("""
                DELETE FROM candidate.profile_skills
                WHERE profile_id = %s AND skill_id = %s;
            """, [profile.id, skill_id])

    # Chứng chỉ (Certificates) & Dự án (Projects)
    @staticmethod
    def add_certificate(user_id: int, data: dict) -> dict:
        profile = CandidateService.get_or_create_profile(user_id)
        cert = Certificates.objects.create(
            profile=profile,
            name=data.get("name", ""),
            issuer=data.get("issuer", ""),
            issued_on=data.get("issued_on"),
            credential_url=data.get("credential_url"),
        )
        return {"id": cert.id, "name": cert.name, "issuer": cert.issuer}

    @staticmethod
    def delete_certificate(user_id: int, cert_id: int) -> None:
        profile = CandidateService.get_or_create_profile(user_id)
        cert = Certificates.objects.filter(id=cert_id, profile=profile).first()
        if not cert:
            raise NotFound("Không tìm thấy chứng chỉ cần xóa.")
        cert.delete()

    @staticmethod
    def add_project(user_id: int, data: dict) -> dict:
        profile = CandidateService.get_or_create_profile(user_id)
        proj = Projects.objects.create(
            profile=profile,
            name=data.get("name", ""),
            description=data.get("description", ""),
            project_url=data.get("project_url"),
        )
        return {"id": proj.id, "name": proj.name}

    @staticmethod
    def delete_project(user_id: int, proj_id: int) -> None:
        profile = CandidateService.get_or_create_profile(user_id)
        proj = Projects.objects.filter(id=proj_id, profile=profile).first()
        if not proj:
            raise NotFound("Không tìm thấy dự án cần xóa.")
        proj.delete()

    # Nguyện vọng nghề nghiệp (Job Preferences)
    @staticmethod
    def update_preferences(user_id: int, data: dict) -> dict:
        profile = CandidateService.get_or_create_profile(user_id)
        pref, _ = JobPreferences.objects.get_or_create(profile=profile)
        for field in ["desired_titles", "industry_id", "location_id", "work_modes", "salary_min"]:
            if field in data:
                setattr(pref, field, data[field])
        pref.save()
        return {
            "id": pref.id,
            "desired_titles": pref.desired_titles,
            "industry_id": pref.industry_id,
            "location_id": pref.location_id,
            "work_modes": pref.work_modes,
            "salary_min": pref.salary_min,
        }

    # ==========================================
    # 2. Quản lý CV & Tài liệu (CVs & Documents)
    # ==========================================
    @staticmethod
    def get_cv_list(user_id: int) -> list:
        profile = CandidateService.get_or_create_profile(user_id)
        cvs = Cvs.objects.filter(profile=profile).exclude(status="archived").order_by("-is_primary", "-created_at")
        results = []
        for cv in cvs:
            versions_count = CvVersions.objects.filter(cv=cv).count()
            results.append({
                "id": cv.id,
                "title": cv.title,
                "file_url": cv.file_url,
                "is_primary": cv.is_primary,
                "status": cv.status,
                "parsed_data": cv.parsed_data,
                "created_at": cv.created_at,
                "versions_count": versions_count,
            })
        return results

    @staticmethod
    def get_cv_detail(user_id: int, cv_id: int) -> dict:
        profile = CandidateService.get_or_create_profile(user_id)
        cv = Cvs.objects.filter(id=cv_id, profile=profile).exclude(status="archived").first()
        if not cv:
            raise NotFound("Không tìm thấy CV hoặc tài liệu được yêu cầu.")

        versions = list(CvVersions.objects.filter(cv=cv).order_by("-version_number").values(
            "id", "version_number", "content", "file_url", "created_at"
        ))

        return {
            "id": cv.id,
            "title": cv.title,
            "file_url": cv.file_url,
            "is_primary": cv.is_primary,
            "status": cv.status,
            "parsed_text": cv.parsed_text,
            "parsed_data": cv.parsed_data,
            "created_at": cv.created_at,
            "versions": versions,
        }

    @staticmethod
    def create_cv(user_id: int, data: dict) -> dict:
        profile = CandidateService.get_or_create_profile(user_id)
        title = data.get("title", "").strip() or "CV mới"
        file_url = data.get("file_url")
        parsed_data = data.get("parsed_data") or {}
        is_primary = data.get("is_primary", False)
        now = datetime.now(timezone.utc)

        with transaction.atomic():
            # Khóa hồ sơ ứng viên để kiểm soát đồng thời (tránh race condition vượt quá 5 CV)
            locked_profile = Profiles.objects.select_for_update().get(id=profile.id)
            current_cv_count = Cvs.objects.filter(profile=locked_profile).exclude(status="archived").count()

            # Giới hạn tối đa 5 CV cho mỗi ứng viên
            if current_cv_count >= 5:
                raise ValidationError("Bạn đã lưu tối đa 5 CV. Vui lòng xóa một CV không còn sử dụng để lưu CV mới.")

            # Nếu chưa có CV nào, tự động đặt làm mặc định
            if current_cv_count == 0:
                is_primary = True

            if is_primary:
                Cvs.objects.filter(profile=locked_profile).update(is_primary=False)

            cv = Cvs.objects.create(
                profile=locked_profile,
                title=title,
                file_url=file_url,
                parsed_data=parsed_data,
                is_primary=is_primary,
                status=data.get("status", "draft"),
                created_at=now,
            )

            # Tự động tạo bản ghi phiên bản 1 (v1)
            CvVersions.objects.create(
                cv=cv,
                version_number=1,
                content=parsed_data,
                file_url=file_url,
                created_at=now,
            )

        return CandidateService.get_cv_detail(user_id, cv.id)

    @staticmethod
    def update_cv(user_id: int, cv_id: int, data: dict) -> dict:
        profile = CandidateService.get_or_create_profile(user_id)
        cv = Cvs.objects.filter(id=cv_id, profile=profile).exclude(status="archived").first()
        if not cv:
            raise NotFound("Không tìm thấy CV cần cập nhật.")

        if "title" in data:
            cv.title = data["title"].strip()
        if "file_url" in data:
            cv.file_url = data["file_url"]
        if "parsed_data" in data:
            cv.parsed_data = data["parsed_data"]
        if "status" in data:
            cv.status = data["status"]

        if data.get("is_primary"):
            Cvs.objects.filter(profile=profile).exclude(id=cv.id).update(is_primary=False)
            cv.is_primary = True

        cv.save()
        return CandidateService.get_cv_detail(user_id, cv.id)

    @staticmethod
    def set_default_cv(user_id: int, cv_id: int) -> dict:
        profile = CandidateService.get_or_create_profile(user_id)
        cv = Cvs.objects.filter(id=cv_id, profile=profile).exclude(status="archived").first()
        if not cv:
            raise NotFound("Không tìm thấy CV để đặt làm mặc định.")

        with transaction.atomic():
            Cvs.objects.filter(profile=profile).update(is_primary=False)
            cv.is_primary = True
            cv.save(update_fields=["is_primary"])

        return CandidateService.get_cv_detail(user_id, cv.id)

    @staticmethod
    def delete_cv(user_id: int, cv_id: int) -> None:
        profile = CandidateService.get_or_create_profile(user_id)
        cv = Cvs.objects.filter(id=cv_id, profile=profile).exclude(status="archived").first()
        if not cv:
            raise NotFound("Không tìm thấy CV cần xóa.")

        # Nếu CV đã được dùng để nộp đơn ứng tuyển, lưu trữ (archived) để nhà tuyển dụng vẫn xem lại được hồ sơ
        has_applications = Applications.objects.filter(cv=cv).exists()
        if has_applications:
            cv.status = "archived"
            cv.is_primary = False
            cv.save(update_fields=["status", "is_primary"])
        else:
            # Nếu chưa từng nộp đơn, có thể xóa hoàn toàn
            CvVersions.objects.filter(cv=cv).delete()
            cv.delete()

    @staticmethod
    def create_cv_version(user_id: int, cv_id: int, data: dict) -> dict:
        profile = CandidateService.get_or_create_profile(user_id)
        cv = Cvs.objects.filter(id=cv_id, profile=profile).exclude(status="archived").first()
        if not cv:
            raise NotFound("Không tìm thấy CV để tạo phiên bản mới.")

        latest = CvVersions.objects.filter(cv=cv).order_by("-version_number").first()
        next_ver = (latest.version_number + 1) if latest else 1
        now = datetime.now(timezone.utc)

        content = data.get("content") or cv.parsed_data or {}
        file_url = data.get("file_url") or cv.file_url

        ver = CvVersions.objects.create(
            cv=cv,
            version_number=next_ver,
            content=content,
            file_url=file_url,
            created_at=now,
        )

        return {
            "id": ver.id,
            "version_number": ver.version_number,
            "content": ver.content,
            "file_url": ver.file_url,
            "created_at": ver.created_at,
        }

    # ==========================================
    # 3. Tìm kiếm việc làm, Lưu tin & Theo dõi công ty
    # ==========================================
    @staticmethod
    def search_jobs(params: dict, user_id: int = None) -> dict:
        """Tìm kiếm, lọc, sắp xếp và phân trang tin tuyển dụng."""
        from django.db.models import Q
        keyword = params.get("q", "").strip() or params.get("keyword", "").strip()
        location_id = params.get("location_id")
        location_param = params.get("location", "").strip()
        industry_id = params.get("industry_id")
        work_mode = params.get("work_mode") or params.get("workMode")
        employment_type = params.get("employment_type") or params.get("jobType")
        salary_min = params.get("salary_min") or params.get("salaryMin")
        sort_by = params.get("sort_by") or params.get("sortBy", "newest")
        page = max(1, int(params.get("page", 1)))
        page_size = max(1, min(100, int(params.get("page_size", 10))))
        offset = (page - 1) * page_size

        qs = Jobs.objects.select_related("company").filter(status="published")

        if keyword:
            qs = qs.filter(Q(title__icontains=keyword) | Q(company__name__icontains=keyword))
        if location_id:
            qs = qs.filter(location_id=location_id)
        elif location_param and location_param != "Toàn quốc":
            matched_loc_ids = Locations.objects.filter(province__icontains=location_param).values_list("id", flat=True)
            if matched_loc_ids:
                qs = qs.filter(location_id__in=matched_loc_ids)
        if industry_id:
            qs = qs.filter(industry_id=industry_id)
        if work_mode and work_mode != "Tất cả":
            wm_lower = work_mode.lower()
            if "remote" in wm_lower or "xa" in wm_lower:
                qs = qs.filter(work_mode__iexact="remote")
            elif "hybrid" in wm_lower or "linh hoạt" in wm_lower:
                qs = qs.filter(work_mode__iexact="hybrid")
            elif "văn phòng" in wm_lower or "onsite" in wm_lower:
                qs = qs.filter(Q(work_mode__iexact="onsite") | Q(work_mode__iexact="office"))
            else:
                qs = qs.filter(work_mode__iexact=work_mode)
        if employment_type and employment_type != "Tất cả":
            et_lower = employment_type.lower()
            if "bán thời gian" in et_lower or "part" in et_lower:
                qs = qs.filter(employment_type__iexact="part_time")
            elif "thực tập" in et_lower or "intern" in et_lower:
                qs = qs.filter(employment_type__iexact="internship")
            elif "hợp đồng" in et_lower or "contract" in et_lower:
                qs = qs.filter(employment_type__iexact="contract")
            elif "freelance" in et_lower:
                qs = qs.filter(employment_type__iexact="freelance")
            elif "toàn thời gian" in et_lower or "full" in et_lower:
                qs = qs.filter(employment_type__iexact="full_time")
            else:
                qs = qs.filter(employment_type__iexact=employment_type)
        if salary_min and str(salary_min).isdigit():
            qs = qs.filter(salary_max__gte=int(salary_min))

        if sort_by == "salary_desc":
            qs = qs.order_by("-salary_max", "-created_at")
        elif sort_by == "salary_asc":
            qs = qs.order_by("salary_min", "-created_at")
        else:
            qs = qs.order_by("-created_at")

        total = qs.count()
        jobs = qs[offset:offset + page_size]

        saved_job_ids = set()
        applied_job_ids = set()
        if user_id:
            saved_job_ids = set(SavedJobs.objects.filter(user_id=user_id).values_list("job_id", flat=True))
            profile = Profiles.objects.filter(user_id=user_id).first()
            if profile:
                applied_job_ids = set(Applications.objects.filter(candidate=profile).values_list("job_id", flat=True))

        # Cache location names
        loc_cache = {loc.id: loc.province for loc in Locations.objects.all()}

        items = []
        for j in jobs:
            loc_str = loc_cache.get(j.location_id, "Toàn quốc") if j.location_id else "Toàn quốc"
            
            # Extract skills from job_skills table via ORM
            job_skill_ids = list(
                JobSkills.objects.filter(job_id=j.id).values_list("skill_id", flat=True)[:5]
            )
            skills_list = (
                list(Skills.objects.filter(id__in=job_skill_ids).values_list("name", flat=True))
                if job_skill_ids
                else []
            )

            if not skills_list:
                skills_list = ["Chuyên môn", "Giao tiếp"]

            items.append({
                "id": j.id,
                "title": j.title,
                "slug": j.slug,
                "status": j.status,
                "salary_min": j.salary_min,
                "salary_max": j.salary_max,
                "currency": j.currency.strip() if j.currency else "VND",
                "work_mode": j.work_mode,
                "employment_type": j.employment_type,
                "experience_min": float(j.experience_min) if j.experience_min else None,
                "openings": j.openings,
                "location": loc_str,
                "skills": skills_list,
                "created_at": j.created_at,
                "expires_at": j.expires_at,
                "company": {
                    "id": j.company.id,
                    "name": j.company.name,
                    "slug": j.company.slug,
                    "logo_url": j.company.logo_url,
                    "is_verified": j.company.verification_status == "verified",
                } if j.company else None,
                "is_saved": j.id in saved_job_ids,
                "is_applied": j.id in applied_job_ids,
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
    def get_job_detail(job_id: int, user_id: int = None) -> dict:
        job = Jobs.objects.select_related("company").filter(id=job_id).first()
        if not job:
            raise NotFound("Không tìm thấy tin tuyển dụng.")

        is_saved = False
        is_applied = False
        if user_id:
            is_saved = SavedJobs.objects.filter(user_id=user_id, job_id=job.id).exists()
            profile = Profiles.objects.filter(user_id=user_id).first()
            if profile:
                is_applied = Applications.objects.filter(candidate=profile, job=job).exists()

        loc_str = "Toàn quốc"
        if job.location_id:
            loc_obj = Locations.objects.filter(id=job.location_id).first()
            if loc_obj:
                loc_str = loc_obj.province

        # Lấy kỹ năng từ DB qua ORM
        job_skill_ids = list(
            JobSkills.objects.filter(job_id=job.id).values_list("skill_id", flat=True)
        )
        skills_list = (
            list(Skills.objects.filter(id__in=job_skill_ids).values_list("name", flat=True))
            if job_skill_ids
            else []
        )

        # Việc làm khác cùng công ty từ DB
        other_company_jobs = []
        if job.company:
            other_qs = Jobs.objects.filter(company=job.company, status="published").exclude(id=job.id)[:4]
            for oj in other_qs:
                sal_str = "Thỏa thuận"
                if oj.salary_min and oj.salary_max:
                    sal_str = f"{oj.salary_min // 1_000_000} - {oj.salary_max // 1_000_000} triệu"
                elif oj.salary_min:
                    sal_str = f"Từ {oj.salary_min // 1_000_000} triệu"
                other_company_jobs.append({
                    "id": str(oj.id),
                    "title": oj.title,
                    "salary": sal_str,
                    "workMode": oj.work_mode or "Tại văn phòng",
                    "type": oj.employment_type or "Toàn thời gian",
                    "location": loc_str,
                })

        # Việc làm tương tự từ DB
        similar_qs = Jobs.objects.select_related("company").filter(status="published").exclude(id=job.id)
        if job.industry_id:
            similar_qs = similar_qs.filter(industry_id=job.industry_id)
        similar_jobs = []
        for sj in similar_qs.order_by("-created_at")[:4]:
            sal_str = "Thỏa thuận"
            if sj.salary_min and sj.salary_max:
                sal_str = f"{sj.salary_min // 1_000_000} - {sj.salary_max // 1_000_000} triệu"
            elif sj.salary_min:
                sal_str = f"Từ {sj.salary_min // 1_000_000} triệu"
            similar_jobs.append({
                "id": str(sj.id),
                "title": sj.title,
                "company": sj.company.name if sj.company else "Doanh nghiệp",
                "logo": sj.company.logo_url if sj.company else None,
                "salary": sal_str,
                "location": loc_str,
                "type": sj.employment_type or "Toàn thời gian",
                "workMode": sj.work_mode or "Tại văn phòng",
            })

        company_data = None
        if job.company:
            from django.db.models import Avg
            from apps.interaction.models import CompanyReviews
            rev_qs = CompanyReviews.objects.filter(company_id=job.company.id, status="approved")
            rev_count = rev_qs.count()
            avg_rating = rev_qs.aggregate(avg=Avg("rating")).get("avg")
            company_data = {
                "id": job.company.id,
                "name": job.company.name,
                "slug": job.company.slug,
                "logo_url": job.company.logo_url,
                "website": job.company.website,
                "description": job.company.description,
                "company_size": job.company.company_size,
                "is_verified": job.company.verification_status == "verified",
                "rating": round(float(avg_rating), 1) if avg_rating is not None else 0,
                "reviews_count": rev_count,
            }

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
            "status": job.status,
            "location": loc_str,
            "skills": skills_list,
            "created_at": job.created_at,
            "expires_at": job.expires_at,
            "company": company_data,
            "other_company_jobs": other_company_jobs,
            "similar_jobs": similar_jobs,
            "is_saved": is_saved,
            "is_applied": is_applied,
        }

    # Bookmark việc làm (Saved Jobs)
    @staticmethod
    def get_bookmarked_jobs(user_id: int, params: dict) -> dict:
        page = max(1, int(params.get("page", 1)))
        page_size = max(1, min(100, int(params.get("page_size", 10))))
        offset = (page - 1) * page_size

        saved_list = SavedJobs.objects.filter(user_id=user_id).order_by("-created_at")
        total = saved_list.count()
        page_items = saved_list[offset:offset + page_size]

        job_ids = [s.job_id for s in page_items]
        jobs_dict = {j.id: j for j in Jobs.objects.select_related("company").filter(id__in=job_ids)}
        loc_ids = [j.location_id for j in jobs_dict.values() if j.location_id]
        loc_dict = {l.id: l.province for l in Locations.objects.filter(id__in=loc_ids)} if loc_ids else {}

        items = []
        for s in page_items:
            j = jobs_dict.get(s.job_id)
            if j:
                items.append({
                    "id": str(s.job_id),
                    "saved_at": s.created_at,
                    "job": {
                        "id": str(j.id),
                        "title": j.title,
                        "slug": j.slug,
                        "status": j.status,
                        "salary_min": j.salary_min,
                        "salary_max": j.salary_max,
                        "work_mode": j.work_mode,
                        "employment_type": j.employment_type,
                        "location": loc_dict.get(j.location_id, "Toàn quốc"),
                        "expires_at": j.expires_at,
                        "is_available": j.status == "published",
                    },
                    "company": {
                        "id": j.company.id if j.company else None,
                        "name": j.company.name if j.company else None,
                        "logo_url": j.company.logo_url if j.company else None,
                        "slug": j.company.slug if j.company else None,
                    },
                })

        return {
            "items": items,
            "total": total,
            "pagination": {
                "page": page,
                "pageSize": page_size,
                "page_size": page_size,
                "total": total,
                "totalPages": (total + page_size - 1) // page_size if total > 0 else 1,
                "total_pages": (total + page_size - 1) // page_size if total > 0 else 1,
            },
        }

    @staticmethod
    def get_bookmarked_job_ids(user_id: int) -> list:
        return list(SavedJobs.objects.filter(user_id=user_id).values_list("job_id", flat=True))

    @staticmethod
    def save_job_bookmark(user_id: int, job_id: int) -> bool:
        if not Jobs.objects.filter(id=job_id).exists():
            raise NotFound("Không tìm thấy tin tuyển dụng cần lưu.")

        if not SavedJobs.objects.filter(user_id=user_id, job_id=job_id).exists():
            SavedJobs.objects.create(
                user_id=user_id,
                job_id=job_id,
                created_at=datetime.now(timezone.utc),
            )
        return True

    @staticmethod
    def remove_job_bookmark(user_id: int, job_id: int) -> bool:
        SavedJobs.objects.filter(user_id=user_id, job_id=job_id).delete()
        return True

    # Theo dõi doanh nghiệp (Company Follows)
    @staticmethod
    def follow_company(user_id: int, company_id: int) -> bool:
        if not Companies.objects.filter(id=company_id).exists():
            raise NotFound("Không tìm thấy doanh nghiệp cần theo dõi.")

        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO interaction.company_follows (user_id, company_id, created_at)
                VALUES (%s, %s, %s)
                ON CONFLICT (user_id, company_id) DO NOTHING;
            """, [user_id, company_id, datetime.now(timezone.utc)])
        return True

    @staticmethod
    def unfollow_company(user_id: int, company_id: int) -> bool:
        with connection.cursor() as cursor:
            cursor.execute("""
                DELETE FROM interaction.company_follows
                WHERE user_id = %s AND company_id = %s;
            """, [user_id, company_id])
        return True

    @staticmethod
    def get_following_companies(user_id: int) -> list:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT c.id, c.name, c.slug, c.logo_url, c.industry_id, cf.created_at
                FROM interaction.company_follows cf
                JOIN company.companies c ON cf.company_id = c.id
                WHERE cf.user_id = %s
                ORDER BY cf.created_at DESC;
            """, [user_id])
            return [
                {
                    "company_id": r[0],
                    "name": r[1],
                    "slug": r[2],
                    "logo_url": r[3],
                    "industry_id": r[4],
                    "followed_at": r[5],
                }
                for r in cursor.fetchall()
            ]

    # ==========================================
    # 4. Ứng tuyển & Quản lý Đơn ứng tuyển
    # ==========================================
    @staticmethod
    def apply_job(user_id: int, data: dict) -> dict:
        profile = CandidateService.get_or_create_profile(user_id)
        job_id = data.get("job_id") or data.get("jobPostId")
        cv_id = data.get("cv_id") or data.get("candidateDocumentId")
        cover_letter = data.get("cover_letter", "")

        job = Jobs.objects.filter(id=job_id).first()
        if not job:
            raise NotFound("Tin tuyển dụng không tồn tại.")

        now = datetime.now(timezone.utc)

        # 1. Kiểm tra trạng thái tin tuyển dụng và thời hạn
        if job.status != "published":
            raise ValidationError({"detail": "Tin tuyển dụng này hiện không nhận hồ sơ ứng tuyển."})
        if job.expires_at and job.expires_at < now:
            raise ValidationError({"detail": "Tin tuyển dụng này đã hết hạn nộp hồ sơ ứng tuyển."})

        # 2. Lấy CV chỉ định hoặc CV mặc định hợp lệ của ứng viên
        cv = None
        if cv_id:
            cv = Cvs.objects.filter(id=cv_id, profile=profile).exclude(status="archived").first()
            if not cv:
                raise ValidationError({"cv_id": "CV không tồn tại hoặc không thuộc quyền sở hữu của bạn."})
        else:
            cv = Cvs.objects.filter(profile=profile, is_primary=True).exclude(status="archived").first()
            if not cv:
                cv = Cvs.objects.filter(profile=profile).exclude(status="archived").order_by("-created_at").first()
            if not cv:
                raise ValidationError({"cv": "Bạn chưa có CV nào trong hệ thống. Vui lòng tải lên hoặc tạo CV trước khi ứng tuyển."})

        # 3. Kiểm tra ngăn ứng tuyển trùng lặp
        if Applications.objects.filter(job=job, candidate=profile).exists():
            raise ValidationError({"detail": "Bạn đã nộp đơn ứng tuyển cho vị trí này rồi."})

        with transaction.atomic():
            app = Applications.objects.create(
                job=job,
                candidate=profile,
                cv=cv,
                cover_letter=cover_letter,
                status="submitted",
                applied_at=now,
            )

            # Đảm bảo CV có bản ghi phiên bản lưu vết (snapshot) chính xác tại thời điểm nộp đơn
            latest_version = CvVersions.objects.filter(cv=cv).order_by("-version_number").first()
            target_version = None
            if not latest_version:
                target_version = CvVersions.objects.create(
                    cv=cv,
                    version_number=1,
                    content=cv.parsed_data or {},
                    file_url=cv.file_url,
                    created_at=now,
                )
            elif latest_version.content != cv.parsed_data or latest_version.file_url != cv.file_url:
                target_version = CvVersions.objects.create(
                    cv=cv,
                    version_number=latest_version.version_number + 1,
                    content=cv.parsed_data or {},
                    file_url=cv.file_url,
                    created_at=now,
                )
            else:
                target_version = latest_version

            # Ghi lịch sử ứng tuyển ban đầu kèm snapshot id chính xác tuyệt đối
            ApplicationHistory.objects.create(
                application=app,
                from_status=None,
                to_status="submitted",
                changed_by=user_id,
                note=f"Ứng viên nộp hồ sơ trực tuyến. [cv_version_id:{target_version.id}]",
                created_at=now,
            )

        return {
            "application_id": app.id,
            "job_id": job.id,
            "job_title": job.title,
            "company_name": job.company.name if job.company else "",
            "cv_title": cv.title,
            "status": app.status,
            "applied_at": app.applied_at,
        }

    @staticmethod
    def get_my_applications(user_id: int) -> list:
        profile = CandidateService.get_or_create_profile(user_id)
        apps = Applications.objects.select_related("job", "job__company", "cv").filter(
            candidate=profile
        ).order_by("-applied_at")

        results = []
        for a in apps:
            results.append({
                "id": a.id,
                "job": {
                    "id": a.job.id,
                    "title": a.job.title,
                    "slug": a.job.slug,
                    "company_name": a.job.company.name if a.job.company else "",
                    "logo_url": a.job.company.logo_url if a.job.company else None,
                    "salary_min": a.job.salary_min,
                    "salary_max": a.job.salary_max,
                    "work_mode": a.job.work_mode,
                },
                "cv": {
                    "id": a.cv.id,
                    "title": a.cv.title,
                    "file_url": a.cv.file_url,
                },
                "cover_letter": a.cover_letter,
                "status": a.status,
                "applied_at": a.applied_at,
            })
        return results

    @staticmethod
    def get_application_detail(user_id: int, app_id: int) -> dict:
        profile = CandidateService.get_or_create_profile(user_id)
        app = Applications.objects.select_related("job", "job__company", "cv").filter(
            id=app_id, candidate=profile
        ).first()

        if not app:
            raise NotFound("Không tìm thấy đơn ứng tuyển.")

        histories = list(ApplicationHistory.objects.filter(application=app).order_by("created_at").values(
            "id", "from_status", "to_status", "note", "created_at"
        ))

        return {
            "id": app.id,
            "job": {
                "id": app.job.id,
                "title": app.job.title,
                "slug": app.job.slug,
                "company_name": app.job.company.name if app.job.company else "",
                "description": app.job.description,
            },
            "cv": {
                "id": app.cv.id,
                "title": app.cv.title,
                "file_url": app.cv.file_url,
            },
            "cover_letter": app.cover_letter,
            "status": app.status,
            "applied_at": app.applied_at,
            "histories": histories,
        }

    @staticmethod
    def withdraw_application(user_id: int, app_id: int, reason: str = "") -> dict:
        profile = CandidateService.get_or_create_profile(user_id)
        app = Applications.objects.filter(id=app_id, candidate=profile).first()
        if not app:
            raise NotFound("Không tìm thấy đơn ứng tuyển.")

        # Chỉ cho phép rút đơn khi ở các trạng thái ban đầu
        if app.status in ("hired", "rejected", "withdrawn"):
            raise ValidationError({"detail": f"Không thể rút hồ sơ ở trạng thái hiện tại ('{app.status}')."})

        now = datetime.now(timezone.utc)
        prev_status = app.status

        with transaction.atomic():
            app.status = "withdrawn"
            app.save(update_fields=["status"])

            ApplicationHistory.objects.create(
                application=app,
                from_status=prev_status,
                to_status="withdrawn",
                changed_by=user_id,
                note=f"Ứng viên chủ động rút đơn. Lý do: {reason}" if reason else "Ứng viên chủ động rút đơn.",
                created_at=now,
            )

        return {
            "id": app.id,
            "status": "withdrawn",
            "message": "Đã rút hồ sơ ứng tuyển thành công.",
        }

    # ==========================================
    # 5. Thông báo & Quản lý Job Alerts
    # ==========================================
    @staticmethod
    def get_notifications(user_id: int, params: dict) -> dict:
        page = max(1, int(params.get("page", 1)))
        page_size = max(1, min(100, int(params.get("page_size", 20))))
        offset = (page - 1) * page_size

        qs = Notifications.objects.filter(user_id=user_id).order_by("-created_at")
        total = qs.count()
        unread_count = qs.filter(read_at__isnull=True).count()
        items = list(qs[offset:offset + page_size].values(
            "id", "type", "title", "content", "payload", "read_at", "created_at"
        ))

        return {
            "items": items,
            "unread_count": unread_count,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "total_pages": (total + page_size - 1) // page_size if total > 0 else 1,
            },
        }

    @staticmethod
    def mark_notification_read(user_id: int, notif_id: int) -> bool:
        notif = Notifications.objects.filter(id=notif_id, user_id=user_id).first()
        if not notif:
            raise NotFound("Không tìm thấy thông báo.")
        if not notif.read_at:
            notif.read_at = datetime.now(timezone.utc)
            notif.save(update_fields=["read_at"])
        return True

    @staticmethod
    def mark_all_notifications_read(user_id: int) -> int:
        return Notifications.objects.filter(user_id=user_id, read_at__isnull=True).update(
            read_at=datetime.now(timezone.utc)
        )

    @staticmethod
    def get_job_alerts(user_id: int) -> list:
        return list(JobAlerts.objects.filter(user_id=user_id).values(
            "id", "keyword", "location_id", "frequency", "is_active"
        ))

    @staticmethod
    def create_job_alert(user_id: int, data: dict) -> dict:
        alert = JobAlerts.objects.create(
            user_id=user_id,
            keyword=data.get("keyword", ""),
            location_id=data.get("location_id"),
            frequency=data.get("frequency", "daily"),
            is_active=data.get("is_active", True),
        )
        return {
            "id": alert.id,
            "keyword": alert.keyword,
            "frequency": alert.frequency,
            "is_active": alert.is_active,
        }

    @staticmethod
    def delete_job_alert(user_id: int, alert_id: int) -> None:
        alert = JobAlerts.objects.filter(id=alert_id, user_id=user_id).first()
        if not alert:
            raise NotFound("Không tìm thấy thông báo việc làm cần xóa.")
        alert.delete()

    # ==========================================
    # 7. Quản lý Lịch phỏng vấn (Interviews)
    # ==========================================
    @staticmethod
    def get_candidate_interviews(user_id: int) -> list:
        from datetime import timedelta
        profile = CandidateService.get_or_create_profile(user_id)
        interviews = Interviews.objects.select_related(
            "application",
            "application__job",
            "application__job__company"
        ).filter(application__candidate=profile).order_by("-scheduled_at")

        results = []
        day_map = {0: "THỨ 2", 1: "THỨ 3", 2: "THỨ 4", 3: "THỨ 5", 4: "THỨ 6", 5: "THỨ 7", 6: "CHỦ NHẬT"}

        for i in interviews:
            job = i.application.job if i.application else None
            company = job.company if job else None

            raw_mode = (i.mode or "ONLINE").upper()
            int_type = "ONLINE" if "ONLINE" in raw_mode else "OFFLINE"

            raw_status = (i.status or "UPCOMING").upper()
            if "CANCEL" in raw_status:
                stat = "CANCELLED"
            elif "CONFIRM" in raw_status:
                stat = "CONFIRMED"
            elif "COMPLETE" in raw_status or "FINISH" in raw_status or "PASS" in raw_status:
                stat = "COMPLETED"
            else:
                stat = "UPCOMING"

            scheduled_at = i.scheduled_at
            date_str = scheduled_at.strftime("%Y-%m-%d") if scheduled_at else ""
            time_start = scheduled_at.strftime("%H:%M") if scheduled_at else "09:00"
            duration = i.duration_minutes or 60
            try:
                end_time = (scheduled_at + timedelta(minutes=duration)).strftime("%H:%M") if scheduled_at else ""
                time_range = f"{time_start} - {end_time}"
            except Exception:
                time_range = f"{time_start} ({duration} phút)"

            day_of_week = day_map.get(scheduled_at.weekday(), "THỨ 2") if scheduled_at else ""

            results.append({
                "id": str(i.id),
                "application_id": i.application_id,
                "job_title": job.title if job else "Vị trí tuyển dụng",
                "company_name": company.name if company else "Doanh nghiệp",
                "company_logo": (company.logo_url if company else None) or "",
                "date": date_str,
                "day_of_week": day_of_week,
                "time_range": time_range,
                "type": int_type,
                "platform_or_location": i.meeting_url if int_type == "ONLINE" else (i.notes or "Văn phòng công ty"),
                "meeting_url": i.meeting_url or "",
                "interviewer": "Hội đồng tuyển dụng",
                "note": i.notes or "",
                "status": stat,
                "duration_minutes": duration,
                "scheduled_at": scheduled_at.isoformat() if scheduled_at else None,
            })
        return results

    @staticmethod
    def confirm_candidate_interview(user_id: int, interview_id: int) -> dict:
        from apps.interaction.models import Notifications
        profile = CandidateService.get_or_create_profile(user_id)
        interview = Interviews.objects.select_related(
            "application", "application__job", "application__job__company"
        ).filter(id=interview_id, application__candidate=profile).first()
        if not interview:
            raise NotFound("Không tìm thấy lịch phỏng vấn.")
        interview.status = "CONFIRMED"
        interview.save(update_fields=["status"])

        now = datetime.now(timezone.utc)
        # Ghi nhận vào lịch sử ứng tuyển
        ApplicationHistory.objects.create(
            application=interview.application,
            from_status=interview.application.status,
            to_status=interview.application.status,
            changed_by=user_id,
            note=f"Ứng viên đã xác nhận tham gia buổi phỏng vấn ngày {interview.scheduled_at}.",
            created_at=now,
        )

        try:
            target_user_id = interview.interviewer_id
            if target_user_id:
                cand_name = profile.full_name or "Ứng viên"
                Notifications.objects.create(
                    user_id=target_user_id,
                    type="interview_confirmed",
                    title=f"Ứng viên đã xác nhận phỏng vấn: {interview.application.job.title}",
                    content=f"Ứng viên {cand_name} đã xác nhận tham gia buổi phỏng vấn vị trí '{interview.application.job.title}'.",
                    payload={"interview_id": interview.id, "application_id": interview.application_id},
                    created_at=now,
                )
        except Exception:
            pass

        return {"id": str(interview.id), "status": "CONFIRMED", "message": "Đã xác nhận tham gia phỏng vấn thành công."}

    @staticmethod
    def cancel_candidate_interview(user_id: int, interview_id: int, reason: str = "") -> dict:
        from apps.interaction.models import Notifications
        profile = CandidateService.get_or_create_profile(user_id)
        interview = Interviews.objects.select_related(
            "application", "application__job", "application__job__company"
        ).filter(id=interview_id, application__candidate=profile).first()
        if not interview:
            raise NotFound("Không tìm thấy lịch phỏng vấn.")
        interview.status = "CANCELLED"
        if reason:
            interview.notes = f"{interview.notes or ''}\n[Ứng viên từ chối]: {reason}".strip()
        interview.save(update_fields=["status", "notes"])

        now = datetime.now(timezone.utc)
        ApplicationHistory.objects.create(
            application=interview.application,
            from_status=interview.application.status,
            to_status=interview.application.status,
            changed_by=user_id,
            note=f"Ứng viên từ chối / hủy lịch phỏng vấn ngày {interview.scheduled_at}. {f'Lý do: {reason}' if reason else ''}".strip(),
            created_at=now,
        )

        try:
            target_user_id = interview.interviewer_id
            if target_user_id:
                cand_name = profile.full_name or "Ứng viên"
                Notifications.objects.create(
                    user_id=target_user_id,
                    type="interview_cancelled",
                    title=f"Ứng viên từ chối phỏng vấn: {interview.application.job.title}",
                    content=f"Ứng viên {cand_name} đã từ chối/hủy lịch phỏng vấn vị trí '{interview.application.job.title}'. {f'Lý do: {reason}' if reason else ''}".strip(),
                    payload={"interview_id": interview.id, "application_id": interview.application_id},
                    created_at=now,
                )
        except Exception:
            pass

        return {"id": str(interview.id), "status": "CANCELLED", "message": "Đã hủy lịch phỏng vấn thành công."}

    # ==========================================
    # QUẢN LÝ THƯ MỜI NHẬN VIỆC (OFFERS) PHÍA ỨNG VIÊN
    # ==========================================
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
    def get_candidate_offers(user_id: int) -> list:
        profile = CandidateService.get_or_create_profile(user_id)
        # Ứng viên chỉ thấy các offer đã gửi (sent), đã chấp nhận (accepted), đã từ chối (rejected), đã hết hạn (expired), hoặc đã hủy (cancelled)
        # Tuyệt đối không lộ bản nháp (draft)
        offers_qs = Offers.objects.select_related(
            "application", "application__job", "application__job__company"
        ).filter(
            application__candidate=profile,
            status__in=["sent", "accepted", "rejected", "declined", "expired", "cancelled"]
        ).order_by("-sent_at", "-id")

        now = datetime.now(timezone.utc)
        results = []
        for off in offers_qs:
            app = off.application
            job = app.job if app else None
            company = job.company if job else None

            meta = CandidateService._decode_offer_payload(off.letter_url)

            # Tự động chuyển expired nếu quá hạn phản hồi
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

            results.append({
                "id": str(off.id),
                "application_id": app.id if app else None,
                "job_title": meta.get("position") or (job.title if job else "Vị trí tuyển dụng"),
                "company_name": company.name if company else "Doanh nghiệp",
                "company_logo": getattr(company, "logo_url", None) or "/images/congty.png",
                "salary": off.salary,
                "salary_formatted": f"{off.salary:,} VNĐ" if off.salary else "Thỏa thuận",
                "start_date": off.start_date.isoformat() if off.start_date else None,
                "contract_type": meta.get("contract_type", "full_time"),
                "work_location": meta.get("work_location", ""),
                "deadline": meta.get("deadline", ""),
                "notes": meta.get("notes", ""),
                "terms": meta.get("terms", ""),
                "status": cur_status.upper(), # SENT -> PENDING trên UI, ACCEPTED, REJECTED, EXPIRED, CANCELLED
                "sent_at": off.sent_at.isoformat() if off.sent_at else None,
            })

        return results

    @staticmethod
    def get_candidate_offer_detail(user_id: int, offer_id: int) -> dict:
        profile = CandidateService.get_or_create_profile(user_id)
        off = Offers.objects.select_related(
            "application", "application__job", "application__job__company"
        ).filter(
            id=offer_id,
            application__candidate=profile,
            status__in=["sent", "accepted", "rejected", "declined", "expired", "cancelled"]
        ).first()

        if not off:
            raise NotFound("Không tìm thấy thông tin thư mời nhận việc.")

        app = off.application
        job = app.job if app else None
        company = job.company if job else None
        meta = CandidateService._decode_offer_payload(off.letter_url)

        return {
            "id": str(off.id),
            "application_id": app.id if app else None,
            "job_title": meta.get("position") or (job.title if job else ""),
            "company_name": company.name if company else "",
            "company_logo": getattr(company, "logo_url", None) or "/images/congty.png",
            "salary": off.salary,
            "salary_formatted": f"{off.salary:,} VNĐ" if off.salary else "Thỏa thuận",
            "start_date": off.start_date.isoformat() if off.start_date else None,
            "contract_type": meta.get("contract_type", "full_time"),
            "work_location": meta.get("work_location", ""),
            "deadline": meta.get("deadline", ""),
            "notes": meta.get("notes", ""),
            "terms": meta.get("terms", ""),
            "status": str(off.status or "sent").upper(),
            "sent_at": off.sent_at.isoformat() if off.sent_at else None,
        }

    @staticmethod
    def accept_candidate_offer(user_id: int, offer_id: int, note: str = "") -> dict:
        from apps.interaction.models import Notifications
        profile = CandidateService.get_or_create_profile(user_id)
        off = Offers.objects.select_related(
            "application", "application__job", "application__job__company", "application__job__created_by"
        ).filter(id=offer_id, application__candidate=profile).first()

        if not off:
            raise NotFound("Không tìm thấy thư mời nhận việc.")

        cur_status = str(off.status or "").lower()
        if cur_status != "sent":
            raise ValidationError({"error": f"Không thể chấp nhận thư mời này vì trạng thái hiện tại là '{off.status}'."})

        # Kiểm tra deadline
        meta = CandidateService._decode_offer_payload(off.letter_url)
        deadline_str = meta.get("deadline", "")
        now = datetime.now(timezone.utc)
        if deadline_str:
            try:
                d_date = datetime.strptime(deadline_str[:10], "%Y-%m-%d").date()
                if d_date < now.date():
                    off.status = "expired"
                    off.save(update_fields=["status"])
                    raise ValidationError({"error": "Thư mời nhận việc đã hết hạn thời gian phản hồi."})
            except ValueError:
                pass

        off.status = "accepted"
        off.save(update_fields=["status"])

        # Phân biệt chấp nhận Offer với xác nhận đã nhận việc:
        # Giữ trạng thái hồ sơ là 'offered' (hoặc ghi nhận accepted), không tự động đóng hoặc chuyển sang 'hired'
        app = off.application
        ApplicationHistory.objects.create(
            application=app,
            from_status=app.status,
            to_status=app.status,
            changed_by=user_id,
            note=f"Ứng viên đã chấp nhận Thư mời nhận việc (Offer). {f'Ghi chú: {note}' if note else ''}".strip(),
            created_at=now,
        )

        # Gửi thông báo cho nhà tuyển dụng
        try:
            recruiter_user = app.job.created_by if (app.job and app.job.created_by) else None
            cand_name = profile.user.full_name if (profile and profile.user) else "Ứng viên"
            comp_name = app.job.company.name if (app.job and app.job.company) else "Doanh nghiệp"
            if recruiter_user:
                Notifications.objects.create(
                    user_id=recruiter_user.id,
                    type="offer_accepted",
                    title=f"Ứng viên đã đồng ý nhận việc: {app.job.title}",
                    content=f"Ứng viên {cand_name} đã chấp nhận Thư mời nhận việc cho vị trí '{app.job.title}'. Vui lòng tiến hành các bước Onboarding tiếp theo.",
                    payload={"offer_id": off.id, "application_id": app.id},
                    created_at=now,
                )
        except Exception:
            pass

        return {"id": str(off.id), "status": "ACCEPTED", "message": "Chúc mừng! Bạn đã chấp nhận Thư mời nhận việc thành công."}

    @staticmethod
    def decline_candidate_offer(user_id: int, offer_id: int, reason: str = "") -> dict:
        from apps.interaction.models import Notifications
        profile = CandidateService.get_or_create_profile(user_id)
        off = Offers.objects.select_related(
            "application", "application__job", "application__job__company", "application__job__created_by"
        ).filter(id=offer_id, application__candidate=profile).first()

        if not off:
            raise NotFound("Không tìm thấy thư mời nhận việc.")

        cur_status = str(off.status or "").lower()
        if cur_status != "sent":
            raise ValidationError({"error": f"Không thể từ chối thư mời này vì trạng thái hiện tại là '{off.status}'."})

        off.status = "rejected"
        off.save(update_fields=["status"])

        now = datetime.now(timezone.utc)
        app = off.application

        # Ghi lịch sử thao tác, TUYỆT ĐỐI không chuyển sang HIRED
        ApplicationHistory.objects.create(
            application=app,
            from_status=app.status,
            to_status=app.status,
            changed_by=user_id,
            note=f"Ứng viên từ chối Thư mời nhận việc (Offer). {f'Lý do: {reason}' if reason else ''}".strip(),
            created_at=now,
        )

        # Gửi thông báo cho nhà tuyển dụng
        try:
            recruiter_user = app.job.created_by if (app.job and app.job.created_by) else None
            cand_name = profile.user.full_name if (profile and profile.user) else "Ứng viên"
            if recruiter_user:
                Notifications.objects.create(
                    user_id=recruiter_user.id,
                    type="offer_declined",
                    title=f"Ứng viên từ chối Offer: {app.job.title}",
                    content=f"Ứng viên {cand_name} đã từ chối Thư mời nhận việc cho vị trí '{app.job.title}'. {f'Lý do: {reason}' if reason else ''}".strip(),
                    payload={"offer_id": off.id, "application_id": app.id},
                    created_at=now,
                )
        except Exception:
            pass

        return {"id": str(off.id), "status": "REJECTED", "message": "Đã ghi nhận từ chối Thư mời nhận việc."}
