from datetime import datetime, timezone, timedelta
from django.db import models, transaction
from django.db.models import Sum, Count, Avg, Q
from rest_framework.exceptions import NotFound, ValidationError

from apps.authentication.models import Users, Roles, Permissions, RolePermissions, UserRoles, AuthTokens
from apps.authentication.services.auth_service import hash_password
from apps.company.models import Companies, VerificationRequests, Members, Branches, Branding
from apps.recruitment.models import Jobs, Applications
from apps.billing.models import Plans, Orders, Subscriptions, Coupons
from apps.interaction.models import Reports, CompanyReviews, Notifications, SavedJobs
from apps.candidate.models import Profiles, Experiences, Educations, Cvs, ProfileSkills
from apps.system.models import (
    AuditLogs,
    Industries,
    Skills,
    Locations,
    Settings,
    EmailTemplates,
    ModerationCases,
)
from apps.intelligence.models import AiTasks


class AdminService:
    # ==========================================
    # Helper: Ghi Audit Log cho Admin
    # ==========================================
    @staticmethod
    def log_action(actor_id: int, action: str, entity_type: str, entity_id: int, changes: dict = None) -> None:
        try:
            AuditLogs.objects.create(
                actor_id=actor_id,
                action=action,
                entity_type=entity_type,
                entity_id=entity_id,
                changes=changes or {},
                created_at=datetime.now(timezone.utc),
            )
        except Exception:
            pass

    @staticmethod
    def _resolve_target_label(target_type: str, target_id: int) -> str:
        if not target_id:
            return "—"
        t = (target_type or "").lower()
        if t in ("job", "jobs"):
            j = Jobs.objects.select_related("company").filter(id=target_id).first()
            if j:
                return f"{j.title} ({j.company.name})" if j.company else j.title
            return f"Tin tuyển dụng #{target_id}"
        if t in ("company", "companies"):
            c = Companies.objects.filter(id=target_id).first()
            return c.name if c else f"Doanh nghiệp #{target_id}"
        if t in ("user", "users"):
            u = Users.objects.filter(id=target_id).first()
            return (u.full_name or u.email) if u else f"Người dùng #{target_id}"
        if t in ("review", "company_reviews", "reviews"):
            rv = CompanyReviews.objects.filter(id=target_id).first()
            return (rv.title or f"Đánh giá #{target_id}") if rv else f"Đánh giá #{target_id}"
        return f"{target_type} #{target_id}"

    # ==========================================
    # 1. Dashboard Thống kê tổng quan
    # ==========================================
    @staticmethod
    def get_dashboard_overview() -> dict:
        now = datetime.now(timezone.utc)
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        total_users = Users.objects.count()
        new_users_month = Users.objects.filter(created_at__gte=start_of_month).count()
        users_by_type = {
            "candidates": Users.objects.filter(account_type="candidate").count(),
            "employers": Users.objects.filter(account_type="employer").count(),
            "admins": Users.objects.filter(account_type="admin").count(),
        }

        total_companies = Companies.objects.count()
        verified_companies = Companies.objects.filter(verification_status="verified").count()
        pending_companies = Companies.objects.filter(verification_status="pending").count()
        rejected_companies = Companies.objects.filter(verification_status="rejected").count()

        total_jobs = Jobs.objects.count()
        active_jobs = Jobs.objects.filter(status="published").count()
        pending_jobs = Jobs.objects.filter(status="draft").count()
        closed_jobs = Jobs.objects.filter(status="closed").count()

        total_applications = Applications.objects.count()
        applications_month = Applications.objects.filter(applied_at__gte=start_of_month).count()

        # Doanh thu từ Orders (tương thích cả PostgreSQL và SQLite)
        paid_agg = Orders.objects.filter(status="paid").aggregate(total=Sum("total_vnd"), cnt=Count("id"))
        pending_agg = Orders.objects.filter(status="pending").aggregate(total=Sum("total_vnd"), cnt=Count("id"))
        total_revenue = int(paid_agg["total"] or 0)
        pending_revenue = int(pending_agg["total"] or 0)
        paid_orders_count = int(paid_agg["cnt"] or 0)
        pending_orders_count = int(pending_agg["cnt"] or 0)

        # Tăng trưởng 12 tháng qua từ database thực tế
        monthly_growth = []
        for i in range(11, -1, -1):
            m_date = now - timedelta(days=i * 30)
            m_label = f"Tháng {m_date.month}"
            m_start = m_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            next_m = (m_start + timedelta(days=32)).replace(day=1)
            u_count = Users.objects.filter(created_at__gte=m_start, created_at__lt=next_m).count()
            a_count = Applications.objects.filter(applied_at__gte=m_start, applied_at__lt=next_m).count()
            monthly_growth.append({
                "month": m_label,
                "users": u_count,
                "applications": a_count,
            })

        # Phân bố tin tuyển dụng theo ngành nghề
        industry_jobs = []
        industries = Industries.objects.all()[:8]
        for ind in industries:
            cnt = Jobs.objects.filter(industry_id=ind.id).count()
            industry_jobs.append({"id": ind.id, "name": ind.name, "count": cnt})

        # Yêu cầu xác minh công ty chờ duyệt gần nhất (hoặc công ty có verification_status='pending')
        pending_verifications = []
        reqs = VerificationRequests.objects.select_related("company").filter(status="pending").order_by("-created_at")[:5]
        seen_company_ids = set()
        for r in reqs:
            comp_id = r.company.id if r.company else None
            if comp_id:
                seen_company_ids.add(comp_id)
            pending_verifications.append({
                "id": r.id,
                "company_id": comp_id,
                "company_name": r.company.name if r.company else (r.legal_name or "Doanh nghiệp"),
                "tax_code": r.tax_code or "—",
                "document_url": r.document_url,
                "submitted_at": r.created_at,
            })
        if len(pending_verifications) < 5:
            extra_comps = Companies.objects.filter(verification_status="pending").exclude(id__in=seen_company_ids).order_by("-id")[: 5 - len(pending_verifications)]
            for c in extra_comps:
                pending_verifications.append({
                    "id": c.id,
                    "company_id": c.id,
                    "company_name": c.name,
                    "tax_code": "—",
                    "document_url": None,
                    "submitted_at": c.created_at,
                })

        # Báo cáo vi phạm chờ xử lý
        pending_reports = []
        reports = Reports.objects.filter(status="pending").order_by("-created_at")[:5]
        for rp in reports:
            pending_reports.append({
                "id": rp.id,
                "target_type": rp.target_type,
                "target_id": rp.target_id,
                "target_name": AdminService._resolve_target_label(rp.target_type, rp.target_id),
                "reason": rp.reason,
                "details": rp.details,
                "created_at": rp.created_at,
            })

        # Thống kê báo cáo theo nhóm
        reports_by_type = {
            "job": Reports.objects.filter(target_type__in=["job", "jobs"]).count(),
            "company": Reports.objects.filter(target_type__in=["company", "companies"]).count(),
            "review": Reports.objects.filter(target_type__in=["review", "reviews", "company_reviews"]).count(),
            "user": Reports.objects.filter(target_type__in=["user", "users"]).count(),
        }
        total_reports_all = Reports.objects.count()
        reports_by_type["other"] = max(0, total_reports_all - sum(reports_by_type.values()))

        reports_summary = {
            "total": total_reports_all,
            "pending": Reports.objects.filter(status="pending").count(),
            "resolved": Reports.objects.filter(status="resolved").count(),
            "dismissed": Reports.objects.filter(status="dismissed").count(),
            "by_target_type": reports_by_type,
            "moderation_cases_total": ModerationCases.objects.count(),
        }

        # Hoạt động gần đây từ AuditLogs
        raw_logs = list(AuditLogs.objects.order_by("-created_at")[:6])
        actor_ids = [l.actor_id for l in raw_logs if l.actor_id]
        actor_map = {u.id: u for u in Users.objects.filter(id__in=actor_ids)}
        recent_activities = []
        for l in raw_logs:
            actor = actor_map.get(l.actor_id)
            recent_activities.append({
                "id": l.id,
                "actor_id": l.actor_id,
                "actor_email": actor.email if actor else "system@careza.vn",
                "actor_name": (actor.full_name or actor.email) if actor else "Hệ thống",
                "action": l.action,
                "entity_type": l.entity_type,
                "entity_id": l.entity_id,
                "changes": l.changes,
                "created_at": l.created_at,
            })

        return {
            "summary": {
                "total_users": total_users,
                "new_users_this_month": new_users_month,
                "users_by_type": users_by_type,
                "total_companies": total_companies,
                "verified_companies": verified_companies,
                "pending_verification_companies": pending_companies,
                "rejected_companies": rejected_companies,
                "total_jobs": total_jobs,
                "active_jobs": active_jobs,
                "pending_jobs": pending_jobs,
                "closed_jobs": closed_jobs,
                "total_applications": total_applications,
                "applications_this_month": applications_month,
                "total_revenue_vnd": total_revenue,
                "pending_revenue_vnd": pending_revenue,
                "paid_orders_count": paid_orders_count,
                "pending_orders_count": pending_orders_count,
                "total_ai_tasks": AiTasks.objects.count(),
            },
            "monthly_growth": monthly_growth,
            "industry_jobs": industry_jobs,
            "pending_verifications": pending_verifications,
            "pending_reports": pending_reports,
            "reports_summary": reports_summary,
            "recent_activities": recent_activities,
        }

    # ==========================================
    # 2. Quản lý Người dùng (Users Management)
    # ==========================================
    @staticmethod
    def get_users_list(params: dict) -> dict:
        q = (params.get("q") or params.get("search") or "").strip()
        raw_role = (params.get("account_type") or params.get("role") or "").strip().lower()
        status_val = (params.get("status") or "").strip().lower()
        page = max(1, int(params.get("page", 1)))
        page_size = max(1, min(100, int(params.get("page_size", 20))))
        offset = (page - 1) * page_size

        qs = Users.objects.all()
        if q:
            qs = qs.filter(
                Q(email__icontains=q) | Q(full_name__icontains=q) | Q(phone__icontains=q)
            )
        if raw_role and raw_role != "all":
            if raw_role in ("recruiter", "company", "employer"):
                qs = qs.filter(account_type="employer")
            elif raw_role in ("candidate",):
                qs = qs.filter(account_type="candidate")
            elif raw_role in ("admin",):
                qs = qs.filter(account_type="admin")
            else:
                qs = qs.filter(account_type=raw_role)

        if status_val and status_val != "all":
            if status_val in ("active", "true", "1"):
                qs = qs.filter(is_active=True)
            elif status_val in ("locked", "disabled", "inactive", "false", "0"):
                qs = qs.filter(is_active=False)
            elif status_val == "pending":
                qs = qs.filter(email_verified_at__isnull=True, is_active=True)

        total = qs.count()
        users = list(qs.order_by("-id")[offset:offset + page_size])
        user_ids = [u.id for u in users]

        # Batch load roles, companies, profiles
        user_roles_map = {}
        for ur in UserRoles.objects.select_related("role").filter(user_id__in=user_ids):
            user_roles_map.setdefault(ur.user_id, []).append(ur.role.code)

        member_map = {}
        for m in Members.objects.select_related("company").filter(user_id__in=user_ids, status="active"):
            if m.company and m.user_id not in member_map:
                member_map[m.user_id] = {
                    "company_id": m.company.id,
                    "company_name": m.company.name,
                    "member_role": m.member_role,
                }

        profile_map = {p.user_id: p for p in Profiles.objects.filter(user_id__in=user_ids)}
        loc_ids = [p.location_id for p in profile_map.values() if p.location_id]
        loc_map = {l.id: l.province for l in Locations.objects.filter(id__in=loc_ids)}

        items = []
        for u in users:
            roles = user_roles_map.get(u.id, [])
            comp_info = member_map.get(u.id)
            prof = profile_map.get(u.id)
            loc_name = loc_map.get(prof.location_id, "") if prof and prof.location_id else ""

            items.append({
                "id": u.id,
                "email": u.email,
                "full_name": u.full_name or u.email.split("@")[0],
                "phone": u.phone or "",
                "account_type": u.account_type,
                "roles": roles,
                "avatar_url": u.avatar_url,
                "is_active": bool(u.is_active),
                "company_id": comp_info["company_id"] if comp_info else None,
                "company_name": comp_info["company_name"] if comp_info else None,
                "member_role": comp_info["member_role"] if comp_info else None,
                "headline": prof.headline if prof else "",
                "location": loc_name,
                "email_verified_at": u.email_verified_at,
                "created_at": u.created_at,
                "updated_at": u.updated_at,
            })

        summary = {
            "total_users": Users.objects.count(),
            "candidates_count": Users.objects.filter(account_type="candidate").count(),
            "employers_count": Users.objects.filter(account_type="employer").count(),
            "admins_count": Users.objects.filter(account_type="admin").count(),
            "active_count": Users.objects.filter(is_active=True).count(),
            "locked_count": Users.objects.filter(is_active=False).count(),
        }

        return {
            "items": items,
            "results": items,
            "total": total,
            "summary": summary,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "total_pages": (total + page_size - 1) // page_size if total > 0 else 1,
            },
        }

    @staticmethod
    def get_user_detail(user_id: int) -> dict:
        u = Users.objects.filter(id=user_id).first()
        if not u:
            raise NotFound("Không tìm thấy người dùng.")

        roles = list(UserRoles.objects.filter(user=u).values_list("role__code", flat=True))

        company_info = None
        employer_jobs = []
        if u.account_type == "employer":
            member = Members.objects.select_related("company").filter(user_id=u.id).first()
            if member and member.company:
                c = member.company
                company_info = {
                    "company_id": c.id,
                    "company_name": c.name,
                    "member_role": member.member_role,
                    "verification_status": c.verification_status,
                    "company_size": c.company_size,
                    "website": c.website,
                }
                for j in Jobs.objects.filter(company=c).order_by("-created_at")[:10]:
                    app_cnt = Applications.objects.filter(job=j).count()
                    employer_jobs.append({
                        "id": j.id,
                        "title": j.title,
                        "status": j.status,
                        "salary_min": j.salary_min,
                        "salary_max": j.salary_max,
                        "applications_count": app_cnt,
                        "created_at": j.created_at,
                    })

        # Candidate profile & career data
        prof = Profiles.objects.filter(user_id=u.id).first()
        location_name = ""
        skills_list = []
        experiences_list = []
        educations_list = []
        cvs_list = []
        if prof:
            if prof.location_id:
                loc = Locations.objects.filter(id=prof.location_id).first()
                if loc:
                    location_name = f"{loc.district}, {loc.province}" if loc.district else loc.province
            skill_ids = list(ProfileSkills.objects.filter(profile=prof).values_list("skill_id", flat=True))
            if skill_ids:
                skills_list = list(Skills.objects.filter(id__in=skill_ids).values_list("name", flat=True))
            for exp in Experiences.objects.filter(profile=prof).order_by("-start_date"):
                experiences_list.append({
                    "id": exp.id,
                    "position": exp.job_title,
                    "company": exp.employer_name,
                    "start_date": exp.start_date,
                    "end_date": exp.end_date,
                    "is_current": exp.end_date is None,
                    "description": exp.description or "",
                })
            for edu in Educations.objects.filter(profile=prof).order_by("-start_year"):
                educations_list.append({
                    "id": edu.id,
                    "school": edu.institution,
                    "major": edu.major or "",
                    "degree": edu.degree or "",
                    "start_year": edu.start_year,
                    "end_year": edu.end_year,
                    "description": edu.description or "",
                })
            for cv in Cvs.objects.filter(profile=prof).order_by("-created_at"):
                cvs_list.append({
                    "id": cv.id,
                    "title": cv.title,
                    "file_url": cv.file_url,
                    "is_primary": bool(cv.is_primary),
                    "status": cv.status or "active",
                    "created_at": cv.created_at,
                })

        # Applications of candidate
        applications_list = []
        for app in Applications.objects.select_related("job", "job__company").filter(candidate_id=u.id).order_by("-applied_at")[:15]:
            ai_sc = getattr(app, "ai_score", None)
            applications_list.append({
                "id": app.id,
                "job_id": app.job.id if app.job else None,
                "job_title": app.job.title if app.job else "",
                "company_name": app.job.company.name if (app.job and app.job.company) else "",
                "status": app.status,
                "ai_score": float(ai_sc) if ai_sc is not None else None,
                "applied_at": app.applied_at,
            })

        saved_jobs_count = SavedJobs.objects.filter(user_id=u.id).count()

        # Reports involving this user
        user_reports = list(
            Reports.objects.filter(
                Q(reporter_id=u.id) | Q(target_type__in=["user", "users"], target_id=u.id)
            ).order_by("-created_at")[:10].values(
                "id", "reporter_id", "target_type", "target_id", "reason", "details", "status", "created_at"
            )
        )

        # Audit logs
        raw_logs = list(
            AuditLogs.objects.filter(
                Q(actor_id=u.id) | Q(entity_type="users", entity_id=u.id)
            ).order_by("-created_at")[:15]
        )
        actor_ids = [l.actor_id for l in raw_logs if l.actor_id]
        actor_map = {usr.id: usr for usr in Users.objects.filter(id__in=actor_ids)}
        audit_logs = []
        for l in raw_logs:
            actor = actor_map.get(l.actor_id)
            audit_logs.append({
                "id": l.id,
                "actor_id": l.actor_id,
                "actor_name": (actor.full_name or actor.email) if actor else "Hệ thống",
                "action": l.action,
                "entity_type": l.entity_type,
                "entity_id": l.entity_id,
                "changes": l.changes,
                "created_at": l.created_at,
            })

        return {
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name or u.email.split("@")[0],
            "phone": u.phone or "",
            "account_type": u.account_type,
            "roles": roles,
            "avatar_url": u.avatar_url,
            "is_active": bool(u.is_active),
            "company": company_info,
            "employer_jobs": employer_jobs,
            "profile": {
                "headline": prof.headline if prof else "",
                "bio": prof.bio if prof else "",
                "birth_date": prof.birth_date if prof else None,
                "location": location_name,
                "experience_years": float(prof.experience_years) if (prof and prof.experience_years is not None) else 0,
                "work_mode": prof.work_mode if prof else "",
                "visibility": prof.visibility if prof else "public",
            },
            "skills": skills_list,
            "experiences": experiences_list,
            "educations": educations_list,
            "cvs": cvs_list,
            "applications": applications_list,
            "stats": {
                "applied_jobs_count": len(applications_list),
                "saved_jobs_count": saved_jobs_count,
                "cvs_count": len(cvs_list),
                "employer_jobs_count": len(employer_jobs),
                "reports_count": len(user_reports),
            },
            "reports": user_reports,
            "email_verified_at": u.email_verified_at,
            "created_at": u.created_at,
            "updated_at": u.updated_at,
            "recent_activities": audit_logs,
            "audit_logs": audit_logs,
        }

    @staticmethod
    def update_user_status(user_id: int, is_active: bool, reason: str, admin_id: int) -> dict:
        u = Users.objects.filter(id=user_id).first()
        if not u:
            raise NotFound("Không tìm thấy người dùng.")
        if u.id == admin_id and not is_active:
            raise ValidationError({"detail": "Quản trị viên không thể tự khóa tài khoản của chính mình."})

        now = datetime.now(timezone.utc)
        prev_status = u.is_active
        u.is_active = is_active
        u.updated_at = now
        u.save(update_fields=["is_active", "updated_at"])

        revoked_tokens = 0
        if not is_active:
            revoked_tokens = AuthTokens.objects.filter(
                user=u, purpose="refresh", used_at__isnull=True
            ).update(used_at=now)

        Notifications.objects.create(
            user_id=u.id,
            type="account_status",
            title="Tài khoản đã được mở khóa" if is_active else "Tài khoản đã bị tạm khóa",
            content=(
                "Tài khoản của bạn đã được Quản trị viên mở khóa."
                if is_active
                else f"Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Lý do: {reason or 'Vi phạm quy định hệ thống'}."
            ),
            payload={"is_active": is_active, "reason": reason or ""},
            created_at=now,
        )

        action_name = "unlock_user" if is_active else "lock_user"
        AdminService.log_action(
            actor_id=admin_id,
            action=action_name,
            entity_type="users",
            entity_id=u.id,
            changes={
                "prev_is_active": prev_status,
                "new_is_active": is_active,
                "reason": reason,
                "revoked_refresh_tokens": revoked_tokens,
            },
        )

        return {
            "id": u.id,
            "is_active": u.is_active,
            "revoked_refresh_tokens": revoked_tokens,
            "message": "Mở khóa tài khoản thành công." if is_active else "Đã khóa tài khoản thành công.",
        }

    @staticmethod
    def update_user_roles(user_id: int, role_codes: list, admin_id: int) -> dict:
        u = Users.objects.filter(id=user_id).first()
        if not u:
            raise NotFound("Không tìm thấy người dùng.")

        roles_to_assign = list(Roles.objects.filter(code__in=role_codes))
        assigned_codes = [r.code for r in roles_to_assign]
        if u.id == admin_id and "admin" not in assigned_codes and "super_admin" not in assigned_codes:
            raise ValidationError({"detail": "Quản trị viên không thể tự gỡ quyền Admin của chính mình."})

        prev_roles = list(UserRoles.objects.filter(user=u).values_list("role__code", flat=True))
        with transaction.atomic():
            UserRoles.objects.filter(user=u).delete()
            for r in roles_to_assign:
                UserRoles.objects.create(user=u, role=r)
            if "admin" in assigned_codes or "super_admin" in assigned_codes:
                u.account_type = "admin"
                u.save(update_fields=["account_type"])
            elif "employer" in assigned_codes and u.account_type != "employer":
                u.account_type = "employer"
                u.save(update_fields=["account_type"])
            elif "candidate" in assigned_codes:
                u.account_type = "candidate"
                u.save(update_fields=["account_type"])

        Notifications.objects.create(
            user_id=u.id,
            type="role_updated",
            title="Cập nhật phân quyền tài khoản",
            content=f"Quản trị viên đã cập nhật vai trò tài khoản của bạn thành: {', '.join(assigned_codes)}.",
            payload={"roles": assigned_codes},
            created_at=datetime.now(timezone.utc),
        )

        AdminService.log_action(
            actor_id=admin_id,
            action="update_user_roles",
            entity_type="users",
            entity_id=u.id,
            changes={"prev_roles": prev_roles, "assigned_roles": assigned_codes},
        )
        return {"id": u.id, "roles": assigned_codes, "account_type": u.account_type}

    @staticmethod
    def admin_reset_password(user_id: int, new_password: str, admin_id: int) -> dict:
        u = Users.objects.filter(id=user_id).first()
        if not u:
            raise NotFound("Không tìm thấy người dùng.")
        if not new_password or len(new_password) < 6:
            raise ValidationError({"password": "Mật khẩu mới tối thiểu 6 ký tự."})

        now = datetime.now(timezone.utc)
        u.password_hash = hash_password(new_password)
        u.updated_at = now
        u.save(update_fields=["password_hash", "updated_at"])

        # Thu hồi toàn bộ Refresh Token cũ của tài khoản để bắt buộc đăng nhập lại
        revoked_tokens = AuthTokens.objects.filter(
            user=u, purpose="refresh", used_at__isnull=True
        ).update(used_at=now)

        # Gửi thông báo bảo mật trong hệ thống (không chứa mật khẩu)
        Notifications.objects.create(
            user_id=u.id,
            type="security_alert",
            title="Mật khẩu tài khoản đã được đặt lại",
            content="Mật khẩu tài khoản của bạn vừa được Quản trị viên hệ thống đặt lại. Toàn bộ phiên đăng nhập cũ đã được thu hồi để bảo mật.",
            payload={"action": "admin_reset_password", "by_admin_id": admin_id},
            created_at=now,
        )

        AdminService.log_action(
            actor_id=admin_id,
            action="admin_reset_password",
            entity_type="users",
            entity_id=u.id,
            changes={"password_reset": True, "revoked_refresh_tokens": revoked_tokens},
        )
        return {
            "id": u.id,
            "revoked_refresh_tokens": revoked_tokens,
            "message": "Đặt lại mật khẩu cho tài khoản thành công.",
        }

    # ==========================================
    # 3. Quản lý & Xác minh Doanh nghiệp
    # ==========================================
    @staticmethod
    def get_companies_list(params: dict) -> dict:
        q = (params.get("q") or params.get("search") or "").strip()
        status_val = (params.get("verification_status") or params.get("status") or "").strip().lower()
        page = max(1, int(params.get("page", 1)))
        page_size = max(1, min(100, int(params.get("page_size", 20))))
        offset = (page - 1) * page_size

        qs = Companies.objects.all()
        if q:
            matching_comp_ids = list(
                VerificationRequests.objects.filter(tax_code__icontains=q).values_list("company_id", flat=True)
            )
            qs = qs.filter(Q(name__icontains=q) | Q(slug__icontains=q) | Q(id__in=matching_comp_ids))
        if status_val and status_val != "all":
            qs = qs.filter(verification_status=status_val)

        total = qs.count()
        companies = list(qs.order_by("-id")[offset:offset + page_size])
        comp_ids = [c.id for c in companies]

        ind_ids = [c.industry_id for c in companies if c.industry_id]
        ind_map = {ind.id: ind.name for ind in Industries.objects.filter(id__in=ind_ids)}

        loc_ids = [c.location_id for c in companies if c.location_id]
        loc_map = {loc.id: loc.province for loc in Locations.objects.filter(id__in=loc_ids)}

        ver_map = {}
        for vr in VerificationRequests.objects.filter(company_id__in=comp_ids).order_by("-created_at"):
            if vr.company_id not in ver_map:
                ver_map[vr.company_id] = vr

        branch_map = {}
        for br in Branches.objects.filter(company_id__in=comp_ids):
            branch_map.setdefault(br.company_id, []).append({
                "id": br.id,
                "name": br.name,
                "address": br.address or "",
            })

        rep_map = {}
        members_qs = Members.objects.filter(company_id__in=comp_ids, status="active").order_by("id")
        member_user_ids = [m.user_id for m in members_qs]
        user_map = {u.id: u for u in Users.objects.filter(id__in=member_user_ids)}
        for m in members_qs:
            if m.company_id not in rep_map and m.user_id in user_map:
                u_obj = user_map[m.user_id]
                rep_map[m.company_id] = {
                    "user_id": u_obj.id,
                    "name": u_obj.full_name or u_obj.email,
                    "email": u_obj.email,
                    "phone": u_obj.phone or "",
                    "role": m.member_role,
                }

        items = []
        for c in companies:
            job_count = Jobs.objects.filter(company=c).count()
            active_job_count = Jobs.objects.filter(company=c, status="published").count()
            member_count = Members.objects.filter(company=c, status="active").count()
            vr = ver_map.get(c.id)
            rep = rep_map.get(c.id)
            branches = branch_map.get(c.id, [])

            items.append({
                "id": c.id,
                "name": c.name,
                "slug": c.slug,
                "logo_url": c.logo_url,
                "website": c.website or "",
                "description": c.description or "",
                "company_size": c.company_size or "50 - 100",
                "industry_id": c.industry_id,
                "industry_name": ind_map.get(c.industry_id, "Đa ngành"),
                "location_id": c.location_id,
                "city": loc_map.get(c.location_id, "Toàn quốc"),
                "address": branches[0]["address"] if branches else loc_map.get(c.location_id, "Việt Nam"),
                "tax_code": vr.tax_code if (vr and vr.tax_code) else "—",
                "legal_name": vr.legal_name if (vr and vr.legal_name) else c.name,
                "document_url": vr.document_url if vr else None,
                "verification_notes": vr.notes if vr else "",
                "verification_status": c.verification_status,
                "representative": rep,
                "email": rep["email"] if rep else "",
                "phone": rep["phone"] if rep else "",
                "branches": branches,
                "jobs_count": job_count,
                "active_jobs_count": active_job_count,
                "members_count": member_count,
                "created_at": c.created_at,
            })

        summary = {
            "total_companies": Companies.objects.count(),
            "verified_count": Companies.objects.filter(verification_status="verified").count(),
            "pending_count": Companies.objects.filter(verification_status="pending").count(),
            "rejected_count": Companies.objects.filter(verification_status="rejected").count(),
        }

        return {
            "items": items,
            "results": items,
            "total": total,
            "summary": summary,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "total_pages": (total + page_size - 1) // page_size if total > 0 else 1,
            },
        }

    @staticmethod
    def get_company_detail(company_id: int) -> dict:
        c = Companies.objects.filter(id=company_id).first()
        if not c:
            raise NotFound("Không tìm thấy doanh nghiệp.")

        industry_name = "Đa ngành"
        if c.industry_id:
            ind = Industries.objects.filter(id=c.industry_id).first()
            if ind:
                industry_name = ind.name

        city_name = "Toàn quốc"
        if c.location_id:
            loc = Locations.objects.filter(id=c.location_id).first()
            if loc:
                city_name = loc.province

        branding_obj = Branding.objects.filter(company=c).first()
        branches = list(Branches.objects.filter(company=c).values("id", "name", "address", "location_id"))

        ver_requests = list(VerificationRequests.objects.filter(company=c).order_by("-created_at").values(
            "id", "submitted_by", "legal_name", "tax_code", "document_url", "status", "notes", "created_at", "reviewed_at"
        ))
        latest_vr = ver_requests[0] if ver_requests else None

        raw_members = list(Members.objects.filter(company=c).values(
            "id", "user_id", "member_role", "status", "joined_at"
        ))
        user_ids = [m["user_id"] for m in raw_members]
        user_map = {u.id: u for u in Users.objects.filter(id__in=user_ids)}
        members = []
        for m in raw_members:
            u_obj = user_map.get(m["user_id"])
            members.append({
                "id": m["id"],
                "user_id": m["user_id"],
                "email": u_obj.email if u_obj else "",
                "full_name": (u_obj.full_name or u_obj.email) if u_obj else "",
                "phone": u_obj.phone if u_obj else "",
                "avatar_url": u_obj.avatar_url if u_obj else None,
                "member_role": m["member_role"],
                "status": m["status"],
                "joined_at": m["joined_at"],
            })

        all_jobs_qs = Jobs.objects.filter(company=c).order_by("-created_at")
        active_jobs_cnt = all_jobs_qs.filter(status="published").count()
        draft_jobs_cnt = all_jobs_qs.filter(status="draft").count()
        closed_jobs_cnt = all_jobs_qs.filter(status="closed").count()

        jobs = []
        for j in all_jobs_qs[:20]:
            app_cnt = Applications.objects.filter(job=j).count()
            jobs.append({
                "id": j.id,
                "title": j.title,
                "status": j.status,
                "salary_min": j.salary_min,
                "salary_max": j.salary_max,
                "work_mode": j.work_mode,
                "employment_type": j.employment_type,
                "applications_count": app_cnt,
                "published_at": j.published_at,
                "created_at": j.created_at,
            })

        # Applications for this company's jobs
        comp_apps_qs = Applications.objects.select_related("job", "candidate", "candidate__user").filter(job__company=c).order_by("-applied_at")
        total_apps_cnt = comp_apps_qs.count()
        pipeline_apps_cnt = comp_apps_qs.exclude(status__in=["rejected", "withdrawn"]).count()
        recent_applications = []
        for a in comp_apps_qs[:15]:
            cand = a.candidate.user if a.candidate else None
            recent_applications.append({
                "id": a.id,
                "candidate_id": a.candidate_id,
                "candidate_name": (cand.full_name or cand.email) if cand else f"Ứng viên #{a.candidate_id}",
                "candidate_email": cand.email if cand else "",
                "job_id": a.job.id if a.job else None,
                "job_title": a.job.title if a.job else "",
                "status": a.status,
                "ai_score": None,
                "applied_at": a.applied_at,
            })

        # Subscriptions & Orders
        subscriptions = []
        for s in Subscriptions.objects.select_related("plan").filter(company_id=c.id).order_by("-id"):
            subscriptions.append({
                "id": s.id,
                "plan_id": s.plan.id if s.plan else None,
                "plan_name": s.plan.name if s.plan else "",
                "price_vnd": s.plan.price_vnd if s.plan else 0,
                "job_quota": s.plan.job_quota if s.plan else 0,
                "ai_interview_quota": s.plan.ai_interview_quota if s.plan else 0,
                "starts_at": s.starts_at,
                "ends_at": s.ends_at,
                "status": s.status,
            })

        orders = []
        for o in Orders.objects.select_related("plan").filter(company_id=c.id).order_by("-created_at")[:15]:
            orders.append({
                "id": o.id,
                "order_code": o.order_code,
                "plan_name": o.plan.name if o.plan else "",
                "total_vnd": o.total_vnd,
                "status": o.status,
                "created_at": o.created_at,
            })

        rev_agg = Orders.objects.filter(company_id=c.id, status="paid").aggregate(total=Sum("total_vnd"))
        company_revenue = int(rev_agg["total"] or 0)

        # Reviews & Rating
        reviews_qs = CompanyReviews.objects.filter(company_id=c.id).order_by("-created_at")
        rating_agg = reviews_qs.filter(status="approved").aggregate(avg=Avg("rating"), cnt=Count("id"))
        avg_rating = round(float(rating_agg["avg"] or 0), 1)
        reviews_count = int(rating_agg["cnt"] or 0)
        reviews_list = list(reviews_qs[:10].values("id", "user_id", "rating", "title", "content", "status", "created_at"))

        # Reports against company
        reports_list = list(
            Reports.objects.filter(target_type__in=["company", "companies"], target_id=c.id)
            .order_by("-created_at")
            .values("id", "reporter_id", "reason", "details", "status", "created_at")
        )

        # Audit logs
        raw_logs = list(AuditLogs.objects.filter(entity_type="companies", entity_id=c.id).order_by("-created_at")[:15])
        actor_ids = [l.actor_id for l in raw_logs if l.actor_id]
        actor_map = {u.id: u for u in Users.objects.filter(id__in=actor_ids)}
        audit_logs = []
        for l in raw_logs:
            actor = actor_map.get(l.actor_id)
            audit_logs.append({
                "id": l.id,
                "actor_id": l.actor_id,
                "actor_name": (actor.full_name or actor.email) if actor else "Hệ thống",
                "action": l.action,
                "changes": l.changes,
                "created_at": l.created_at,
            })

        return {
            "id": c.id,
            "name": c.name,
            "slug": c.slug,
            "logo_url": c.logo_url,
            "banner_url": branding_obj.banner_url if branding_obj else None,
            "slogan": branding_obj.slogan if branding_obj else "",
            "benefits": branding_obj.benefits if branding_obj else [],
            "website": c.website or "",
            "description": c.description or "",
            "company_size": c.company_size or "50 - 100",
            "industry_id": c.industry_id,
            "industry_name": industry_name,
            "location_id": c.location_id,
            "city": city_name,
            "address": branches[0]["address"] if branches else city_name,
            "tax_code": latest_vr["tax_code"] if (latest_vr and latest_vr.get("tax_code")) else "—",
            "legal_name": latest_vr["legal_name"] if (latest_vr and latest_vr.get("legal_name")) else c.name,
            "document_url": latest_vr["document_url"] if latest_vr else None,
            "verification_status": c.verification_status,
            "created_at": c.created_at,
            "kpis": {
                "active_jobs": active_jobs_cnt,
                "draft_jobs": draft_jobs_cnt,
                "closed_jobs": closed_jobs_cnt,
                "total_jobs": all_jobs_qs.count(),
                "total_applications": total_apps_cnt,
                "pipeline_candidates": pipeline_apps_cnt,
                "members_count": len(members),
                "total_revenue_vnd": company_revenue,
                "avg_rating": avg_rating,
                "reviews_count": reviews_count,
            },
            "branches": branches,
            "verification_requests": ver_requests,
            "members": members,
            "recent_jobs": jobs,
            "recent_applications": recent_applications,
            "subscriptions": subscriptions,
            "orders": orders,
            "reviews": reviews_list,
            "reports": reports_list,
            "audit_logs": audit_logs,
        }

    @staticmethod
    def verify_company(company_id: int, action: str, notes: str, admin_id: int) -> dict:
        c = Companies.objects.filter(id=company_id).first()
        if not c:
            raise NotFound("Không tìm thấy doanh nghiệp.")

        now = datetime.now(timezone.utc)
        req = VerificationRequests.objects.filter(company=c).order_by("-created_at").first()

        new_status = "verified" if action == "approve" else "rejected"
        with transaction.atomic():
            c.verification_status = new_status
            c.save(update_fields=["verification_status"])

            if req:
                req.status = "approved" if action == "approve" else "rejected"
                req.notes = notes
                req.reviewed_by = admin_id
                req.reviewed_at = now
                req.save()

        AdminService.log_action(
            actor_id=admin_id,
            action=f"company_verification_{new_status}",
            entity_type="companies",
            entity_id=c.id,
            changes={"action": action, "notes": notes},
        )
        return {
            "company_id": c.id,
            "verification_status": c.verification_status,
            "message": "Đã duyệt xác minh doanh nghiệp." if action == "approve" else "Đã từ chối xác minh doanh nghiệp.",
        }

    @staticmethod
    def update_company_status(company_id: int, is_active: bool, admin_id: int) -> dict:
        c = Companies.objects.filter(id=company_id).first()
        if not c:
            raise NotFound("Không tìm thấy doanh nghiệp.")

        new_status = "verified" if is_active else "rejected"
        c.verification_status = new_status
        c.save(update_fields=["verification_status"])

        AdminService.log_action(
            actor_id=admin_id,
            action="update_company_status",
            entity_type="companies",
            entity_id=c.id,
            changes={"is_active": is_active, "verification_status": new_status},
        )
        return {"company_id": c.id, "verification_status": c.verification_status, "is_active": is_active}

    # ==========================================
    # 4. Kiểm duyệt Tin tuyển dụng (Job Moderation)
    # ==========================================
    @staticmethod
    def get_admin_jobs(params: dict) -> dict:
        q = (params.get("q") or params.get("search") or "").strip()
        status_val = (params.get("status") or "").strip().lower()
        company_id = params.get("company_id")
        page = max(1, int(params.get("page", 1)))
        page_size = max(1, min(100, int(params.get("page_size", 20))))
        offset = (page - 1) * page_size

        qs = Jobs.objects.select_related("company").all()
        if q:
            qs = qs.filter(Q(title__icontains=q) | Q(company__name__icontains=q))
        if status_val and status_val != "all":
            qs = qs.filter(status=status_val)
        if company_id:
            qs = qs.filter(company_id=company_id)

        total = qs.count()
        jobs = list(qs.order_by("-id")[offset:offset + page_size])
        job_ids = [j.id for j in jobs]

        ind_ids = [j.industry_id for j in jobs if j.industry_id]
        ind_map = {ind.id: ind.name for ind in Industries.objects.filter(id__in=ind_ids)}

        loc_ids = [j.location_id for j in jobs if j.location_id]
        loc_map = {loc.id: loc.province for loc in Locations.objects.filter(id__in=loc_ids)}

        report_counts = {}
        for r in Reports.objects.filter(target_type__in=["job", "jobs"], target_id__in=job_ids).values("target_id").annotate(cnt=Count("id")):
            report_counts[r["target_id"]] = r["cnt"]

        app_counts = {}
        for a in Applications.objects.filter(job_id__in=job_ids).values("job_id").annotate(cnt=Count("id")):
            app_counts[a["job_id"]] = a["cnt"]

        items = []
        for j in jobs:
            items.append({
                "id": j.id,
                "title": j.title,
                "slug": j.slug,
                "company": {
                    "id": j.company.id if j.company else None,
                    "name": j.company.name if j.company else "",
                    "logo_url": j.company.logo_url if j.company else None,
                },
                "industry_name": ind_map.get(j.industry_id, "Đa ngành"),
                "location_name": loc_map.get(j.location_id, "Toàn quốc"),
                "work_mode": j.work_mode,
                "employment_type": j.employment_type,
                "salary_min": j.salary_min,
                "salary_max": j.salary_max,
                "status": j.status,
                "applications_count": app_counts.get(j.id, 0),
                "reports_count": report_counts.get(j.id, 0),
                "published_at": j.published_at,
                "created_at": j.created_at,
            })

        summary = {
            "total_jobs": Jobs.objects.count(),
            "published_count": Jobs.objects.filter(status="published").count(),
            "draft_count": Jobs.objects.filter(status="draft").count(),
            "closed_count": Jobs.objects.filter(status="closed").count(),
        }

        return {
            "items": items,
            "results": items,
            "total": total,
            "summary": summary,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "total_pages": (total + page_size - 1) // page_size if total > 0 else 1,
            },
        }

    @staticmethod
    def get_job_detail(job_id: int) -> dict:
        j = Jobs.objects.select_related("company").filter(id=job_id).first()
        if not j:
            raise NotFound("Không tìm thấy tin tuyển dụng.")
        cases = list(ModerationCases.objects.filter(target_type="job", target_id=j.id).order_by("-created_at").values(
            "id", "reviewer_id", "status", "reason", "reviewed_at"
        ))
        reports = list(Reports.objects.filter(target_type__in=["job", "jobs"], target_id=j.id).order_by("-created_at").values(
            "id", "reporter_id", "reason", "details", "status", "created_at"
        ))
        return {
            "id": j.id,
            "title": j.title,
            "slug": j.slug,
            "company": {
                "id": j.company.id if j.company else None,
                "name": j.company.name if j.company else "",
            },
            "description": j.description,
            "requirements": j.requirements,
            "benefits": j.benefits,
            "salary_min": j.salary_min,
            "salary_max": j.salary_max,
            "work_mode": j.work_mode,
            "employment_type": j.employment_type,
            "status": j.status,
            "applications_count": Applications.objects.filter(job=j).count(),
            "published_at": j.published_at,
            "created_at": j.created_at,
            "moderation_history": cases,
            "reports": reports,
        }

    @staticmethod
    def moderate_job(job_id: int, action: str, reason: str, admin_id: int) -> dict:
        job = Jobs.objects.filter(id=job_id).first()
        if not job:
            raise NotFound("Không tìm thấy tin tuyển dụng.")

        now = datetime.now(timezone.utc)
        prev_status = job.status

        status_map = {
            "approve": "published",
            "reject": "closed",
            "hide": "closed",
        }
        new_status = status_map.get(action, "closed")

        with transaction.atomic():
            job.status = new_status
            if action == "approve" and not job.published_at:
                job.published_at = now
            job.save(update_fields=["status", "published_at"])

            ModerationCases.objects.create(
                reviewer_id=admin_id,
                target_type="job",
                target_id=job.id,
                status=action,
                reason=reason or f"Admin thao tác {action}",
                reviewed_at=now,
                created_at=now,
            )

        AdminService.log_action(
            actor_id=admin_id,
            action=f"moderate_job_{action}",
            entity_type="jobs",
            entity_id=job.id,
            changes={"prev_status": prev_status, "new_status": new_status, "reason": reason},
        )

        return {"id": job.id, "status": job.status, "new_status": job.status, "message": f"Đã thực hiện {action} đối với tin tuyển dụng."}

    # ==========================================
    # 5. Quản lý Danh mục (Categories: Industries, Skills, Locations)
    # ==========================================
    @staticmethod
    def get_industries() -> list:
        items = list(Industries.objects.all().order_by("name").values("id", "name", "slug"))
        job_counts = {
            r["industry_id"]: r["cnt"]
            for r in Jobs.objects.values("industry_id").annotate(cnt=Count("id"))
            if r["industry_id"]
        }
        comp_counts = {
            r["industry_id"]: r["cnt"]
            for r in Companies.objects.values("industry_id").annotate(cnt=Count("id"))
            if r["industry_id"]
        }
        for item in items:
            item["jobs_count"] = job_counts.get(item["id"], 0)
            item["companies_count"] = comp_counts.get(item["id"], 0)
        return items

    @staticmethod
    def create_industry(name: str, admin_id: int = None) -> dict:
        clean_name = name.strip()
        slug = clean_name.lower().replace(" ", "-")
        existing = Industries.objects.filter(Q(name__iexact=clean_name) | Q(slug=slug)).first()
        if existing:
            return {"id": existing.id, "name": existing.name, "slug": existing.slug}
        ind = Industries.objects.create(name=clean_name, slug=slug)
        if admin_id:
            AdminService.log_action(admin_id, "create_industry", "industries", ind.id, {"name": ind.name})
        return {"id": ind.id, "name": ind.name, "slug": ind.slug}

    @staticmethod
    def delete_industry(ind_id: int, admin_id: int = None) -> None:
        Industries.objects.filter(id=ind_id).delete()
        if admin_id:
            AdminService.log_action(admin_id, "delete_industry", "industries", ind_id)

    @staticmethod
    def get_skills() -> list:
        return list(Skills.objects.all().order_by("name").values("id", "name", "category"))

    @staticmethod
    def create_skill(name: str, category: str = "", admin_id: int = None) -> dict:
        clean_name = name.strip()
        existing = Skills.objects.filter(name__iexact=clean_name).first()
        if existing:
            return {"id": existing.id, "name": existing.name, "category": existing.category}
        s = Skills.objects.create(name=clean_name, category=category)
        if admin_id:
            AdminService.log_action(admin_id, "create_skill", "skills", s.id, {"name": s.name, "category": category})
        return {"id": s.id, "name": s.name, "category": s.category}

    @staticmethod
    def delete_skill(skill_id: int, admin_id: int = None) -> None:
        Skills.objects.filter(id=skill_id).delete()
        if admin_id:
            AdminService.log_action(admin_id, "delete_skill", "skills", skill_id)

    @staticmethod
    def get_locations() -> list:
        return list(Locations.objects.all().order_by("province")[:100].values(
            "id", "province", "district", "ward"
        ))

    # ==========================================
    # 6. Quản lý Gói dịch vụ & Giao dịch (Billing)
    # ==========================================
    @staticmethod
    def get_plans() -> list:
        plans = list(Plans.objects.all().order_by("id").values(
            "id", "code", "name", "audience", "price_vnd", "duration_days", "job_quota", "ai_interview_quota", "features", "is_active"
        ))
        sub_counts = {
            r["plan_id"]: r["cnt"]
            for r in Subscriptions.objects.filter(status="active").values("plan_id").annotate(cnt=Count("id"))
        }
        order_counts = {
            r["plan_id"]: r["cnt"]
            for r in Orders.objects.filter(status="paid").values("plan_id").annotate(cnt=Count("id"))
        }
        for p in plans:
            p["active_subscribers_count"] = sub_counts.get(p["id"], 0)
            p["paid_orders_count"] = order_counts.get(p["id"], 0)
        return plans

    @staticmethod
    def create_or_update_plan(data: dict, plan_id: int = None, admin_id: int = None) -> dict:
        if plan_id:
            plan = Plans.objects.filter(id=plan_id).first()
            if not plan:
                raise NotFound("Không tìm thấy gói dịch vụ.")
            if "price" in data and data["price"] is not None and "price_vnd" not in data:
                data["price_vnd"] = int(data["price"])
            if "target_role" in data and data["target_role"] is not None and "audience" not in data:
                data["audience"] = data["target_role"]
            for f in ["name", "code", "audience", "price_vnd", "duration_days", "job_quota", "ai_interview_quota", "features", "is_active"]:
                if f in data and data[f] is not None:
                    setattr(plan, f, data[f])
            plan.save()
            if admin_id:
                AdminService.log_action(admin_id, "update_billing_plan", "plans", plan.id, {"code": plan.code, "price_vnd": plan.price_vnd})
        else:
            code_val = (data.get("code") or f"PLAN_{int(datetime.now().timestamp())}").strip().upper()
            price_val = data.get("price_vnd") if data.get("price_vnd") is not None else int(data.get("price") or 0)
            aud_val = data.get("audience") or data.get("target_role") or "employer"
            plan = Plans.objects.create(
                code=code_val,
                name=data.get("name", "Gói dịch vụ"),
                audience=aud_val,
                price_vnd=price_val,
                duration_days=data.get("duration_days", 30),
                job_quota=data.get("job_quota", 5),
                ai_interview_quota=data.get("ai_interview_quota", 10),
                features=data.get("features", {}),
                is_active=data.get("is_active", True),
            )
            if admin_id:
                AdminService.log_action(admin_id, "create_billing_plan", "plans", plan.id, {"code": plan.code, "price_vnd": plan.price_vnd})
        return {
            "id": plan.id,
            "code": plan.code,
            "name": plan.name,
            "audience": plan.audience,
            "target_role": plan.audience,
            "price_vnd": plan.price_vnd,
            "price": float(plan.price_vnd or 0),
            "duration_days": plan.duration_days,
            "job_quota": plan.job_quota,
            "ai_interview_quota": plan.ai_interview_quota,
            "features": plan.features,
            "is_active": plan.is_active,
        }

    @staticmethod
    def get_orders(params: dict) -> dict:
        from apps.billing.models import Payments

        page = max(1, int(params.get("page", 1)))
        page_size = max(1, min(100, int(params.get("page_size", 20))))
        offset = (page - 1) * page_size
        q = (params.get("q") or params.get("search") or "").strip()
        status_val = (params.get("status") or "").strip().lower()

        qs = Orders.objects.select_related("plan", "coupon").all()
        if status_val and status_val != "all":
            qs = qs.filter(status=status_val)
        if q:
            matching_comp_ids = list(Companies.objects.filter(name__icontains=q).values_list("id", flat=True))
            matching_user_ids = list(Users.objects.filter(Q(email__icontains=q) | Q(full_name__icontains=q)).values_list("id", flat=True))
            matching_order_ids_by_ref = list(
                Payments.objects.filter(provider_reference__icontains=q).values_list("order_id", flat=True)
            )
            qs = qs.filter(
                Q(order_code__icontains=q)
                | Q(plan__name__icontains=q)
                | Q(company_id__in=matching_comp_ids)
                | Q(user_id__in=matching_user_ids)
                | Q(id__in=matching_order_ids_by_ref)
            )

        total = qs.count()
        orders = list(qs.order_by("-id")[offset:offset + page_size])

        comp_ids = [o.company_id for o in orders if o.company_id]
        comp_map = {c.id: c.name for c in Companies.objects.filter(id__in=comp_ids)}
        user_ids = [o.user_id for o in orders if o.user_id]
        user_map = {u.id: u for u in Users.objects.filter(id__in=user_ids)}

        order_ids = [o.id for o in orders]
        payment_map = {}
        for p in Payments.objects.filter(order_id__in=order_ids).order_by("id"):
            payment_map[p.order_id] = p

        items = []
        for o in orders:
            usr = user_map.get(o.user_id)
            comp_name = comp_map.get(o.company_id) or ((usr.full_name or usr.email) if usr else f"User #{o.user_id}")
            pay = payment_map.get(o.id)
            meta = (pay.metadata or {}) if pay and isinstance(pay.metadata, dict) else {}
            payment_info = None
            if pay:
                payment_info = {
                    "id": pay.id,
                    "provider": pay.provider or "bank_transfer",
                    "provider_reference": pay.provider_reference or "",
                    "amount_vnd": pay.amount_vnd,
                    "status": pay.status,
                    "paid_at": pay.paid_at,
                    "reconciliation_note": meta.get("reconciliation_note") or meta.get("note") or "",
                    "evidence": meta.get("evidence") or "",
                    "verified_by_admin_id": meta.get("verified_by_admin_id"),
                    "verified_at": meta.get("verified_at"),
                }

            items.append({
                "id": o.id,
                "order_code": o.order_code,
                "user_id": o.user_id,
                "user_email": usr.email if usr else "",
                "user_name": (usr.full_name or usr.email) if usr else "",
                "company_id": o.company_id,
                "company_name": comp_name,
                "plan_id": o.plan.id if o.plan else None,
                "plan_name": o.plan.name if o.plan else "",
                "job_quota": o.plan.job_quota if o.plan else 0,
                "ai_interview_quota": o.plan.ai_interview_quota if o.plan else 0,
                "duration_days": o.plan.duration_days if o.plan else 30,
                "coupon_code": o.coupon.code if o.coupon else None,
                "total_vnd": o.total_vnd,
                "currency": "VND",
                "status": o.status,
                "payment": payment_info,
                "created_at": o.created_at,
            })

        paid_agg = Orders.objects.filter(status="paid").aggregate(total=Sum("total_vnd"), cnt=Count("id"))
        pending_agg = Orders.objects.filter(status="pending").aggregate(total=Sum("total_vnd"), cnt=Count("id"))
        failed_cnt = Orders.objects.filter(status__in=["failed", "cancelled", "refunded"]).count()

        summary = {
            "total_orders": Orders.objects.count(),
            "paid_revenue_vnd": int(paid_agg["total"] or 0),
            "total_revenue": int(paid_agg["total"] or 0),
            "pending_revenue_vnd": int(pending_agg["total"] or 0),
            "paid_count": int(paid_agg["cnt"] or 0),
            "pending_count": int(pending_agg["cnt"] or 0),
            "failed_count": failed_cnt,
        }

        return {
            "items": items,
            "results": items,
            "total": total,
            "summary": summary,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "total_pages": (total + page_size - 1) // page_size if total > 0 else 1,
            },
        }

    @staticmethod
    def confirm_order_payment(order_id: int, data: dict, admin_id: int) -> dict:
        from apps.billing.services.billing_service import BillingService
        return BillingService.confirm_manual_payment(order_id=order_id, data=data, admin_id=admin_id)

    @staticmethod
    def get_subscriptions(params: dict) -> dict:
        page = max(1, int(params.get("page", 1)))
        page_size = max(1, min(100, int(params.get("page_size", 20))))
        offset = (page - 1) * page_size

        qs = Subscriptions.objects.select_related("plan").all()
        status_val = (params.get("status") or "").strip().lower()
        if status_val and status_val != "all":
            qs = qs.filter(status=status_val)

        total = qs.count()
        subs = list(qs.order_by("-id")[offset:offset + page_size])

        comp_ids = [s.company_id for s in subs if s.company_id]
        comp_map = {c.id: c.name for c in Companies.objects.filter(id__in=comp_ids)}
        user_ids = [s.user_id for s in subs if s.user_id]
        user_map = {u.id: u for u in Users.objects.filter(id__in=user_ids)}

        items = []
        for s in subs:
            usr = user_map.get(s.user_id)
            items.append({
                "id": s.id,
                "plan_name": s.plan.name if s.plan else "",
                "price_vnd": s.plan.price_vnd if s.plan else 0,
                "company_id": s.company_id,
                "company_name": comp_map.get(s.company_id, ""),
                "user_id": s.user_id,
                "user_email": usr.email if usr else "",
                "starts_at": s.starts_at,
                "ends_at": s.ends_at,
                "status": s.status,
            })
        return {
            "items": items,
            "results": items,
            "total": total,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "total_pages": (total + page_size - 1) // page_size if total > 0 else 1,
            },
        }

    @staticmethod
    def get_coupons() -> list:
        return list(Coupons.objects.all().order_by("-id").values(
            "id", "code", "discount_percent", "valid_until", "max_uses", "used_count"
        ))

    @staticmethod
    def create_coupon(data: dict, admin_id: int = None) -> dict:
        code = data.get("code", "").strip().upper()
        if not code:
            raise ValidationError({"code": "Mã khuyến mãi không được để trống."})
        c = Coupons.objects.create(
            code=code,
            discount_percent=data.get("discount_percent", 10),
            valid_until=data.get("valid_until"),
            max_uses=data.get("max_uses", 100),
            used_count=0,
        )
        if admin_id:
            AdminService.log_action(admin_id, "create_coupon", "coupons", c.id, {"code": c.code, "discount_percent": c.discount_percent})
        return {"id": c.id, "code": c.code, "discount_percent": c.discount_percent}

    # ==========================================
    # 7. Quản lý Báo cáo vi phạm & Đánh giá (Reports & Reviews)
    # ==========================================
    @staticmethod
    def get_reports(params: dict) -> dict:
        page = max(1, int(params.get("page", 1)))
        page_size = max(1, min(100, int(params.get("page_size", 20))))
        offset = (page - 1) * page_size
        q = (params.get("q") or params.get("search") or "").strip()
        status_val = (params.get("status") or "").strip().lower()
        target_type = (params.get("target_type") or "").strip().lower()

        qs = Reports.objects.all()
        if status_val and status_val != "all":
            qs = qs.filter(status=status_val)
        if target_type and target_type != "all":
            qs = qs.filter(target_type__icontains=target_type)
        if q:
            qs = qs.filter(Q(reason__icontains=q) | Q(details__icontains=q) | Q(target_type__icontains=q))

        total = qs.count()
        reports = list(qs.order_by("-created_at")[offset:offset + page_size])
        reporter_ids = [r.reporter_id for r in reports if r.reporter_id]
        user_map = {u.id: u for u in Users.objects.filter(id__in=reporter_ids)}

        items = []
        for r in reports:
            rep_user = user_map.get(r.reporter_id)
            items.append({
                "id": r.id,
                "reporter_id": r.reporter_id,
                "reporter_email": rep_user.email if rep_user else f"user#{r.reporter_id}",
                "reporter_name": (rep_user.full_name or rep_user.email) if rep_user else f"Người dùng #{r.reporter_id}",
                "reporter_type": rep_user.account_type if rep_user else "candidate",
                "target_type": r.target_type,
                "target_id": r.target_id,
                "target_name": AdminService._resolve_target_label(r.target_type, r.target_id),
                "reason": r.reason,
                "details": r.details or "",
                "status": r.status or "pending",
                "created_at": r.created_at,
            })

        summary = {
            "total": Reports.objects.count(),
            "pending": Reports.objects.filter(status="pending").count(),
            "resolved": Reports.objects.filter(status="resolved").count(),
            "dismissed": Reports.objects.filter(status="dismissed").count(),
        }

        return {
            "items": items,
            "results": items,
            "total": total,
            "summary": summary,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "total_pages": (total + page_size - 1) // page_size if total > 0 else 1,
            },
        }

    @staticmethod
    def resolve_report(report_id: int, action: str, note: str, admin_id: int) -> dict:
        report = Reports.objects.filter(id=report_id).first()
        if not report:
            raise NotFound("Không tìm thấy báo cáo vi phạm.")

        now = datetime.now(timezone.utc)
        new_status = "resolved" if action == "resolve" else "dismissed"
        with transaction.atomic():
            report.status = new_status
            report.save(update_fields=["status"])

            ModerationCases.objects.create(
                reviewer_id=admin_id,
                target_type=report.target_type or "report",
                target_id=report.target_id or report.id,
                status=new_status,
                reason=note or f"Xử lý báo cáo #{report.id}: {action}",
                reviewed_at=now,
                created_at=now,
            )

        AdminService.log_action(
            actor_id=admin_id,
            action=f"report_{report.status}",
            entity_type="reports",
            entity_id=report.id,
            changes={"action": action, "note": note},
        )
        return {"id": report.id, "status": report.status, "new_status": report.status, "message": "Xử lý báo cáo thành công."}

    @staticmethod
    def get_reviews(params: dict) -> dict:
        page = max(1, int(params.get("page", 1)))
        page_size = max(1, min(100, int(params.get("page_size", 20))))
        offset = (page - 1) * page_size
        q = (params.get("q") or params.get("search") or "").strip()

        qs = CompanyReviews.objects.all()
        status_val = (params.get("status") or "").strip().lower()
        if status_val and status_val != "all":
            qs = qs.filter(status=status_val)
        if q:
            qs = qs.filter(Q(title__icontains=q) | Q(content__icontains=q))

        total = qs.count()
        revs = list(qs.order_by("-created_at")[offset:offset + page_size])
        comp_ids = [r.company_id for r in revs if r.company_id]
        comp_map = {c.id: c.name for c in Companies.objects.filter(id__in=comp_ids)}
        user_ids = [r.user_id for r in revs if r.user_id]
        user_map = {u.id: u for u in Users.objects.filter(id__in=user_ids)}

        items = []
        for r in revs:
            usr = user_map.get(r.user_id)
            items.append({
                "id": r.id,
                "user_id": r.user_id,
                "user_email": usr.email if usr else f"user#{r.user_id}",
                "user_name": (usr.full_name or usr.email) if usr else f"Ứng viên #{r.user_id}",
                "company_id": r.company_id,
                "company_name": comp_map.get(r.company_id, f"Doanh nghiệp #{r.company_id}"),
                "rating": r.rating,
                "title": r.title or "",
                "content": r.content or "",
                "status": r.status or "pending",
                "created_at": r.created_at,
            })
        return {
            "items": items,
            "results": items,
            "total": total,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "total_pages": (total + page_size - 1) // page_size if total > 0 else 1,
            },
        }

    @staticmethod
    def moderate_review(review_id: int, action: str, admin_id: int) -> dict:
        review = CompanyReviews.objects.filter(id=review_id).first()
        if not review:
            raise NotFound("Không tìm thấy đánh giá.")

        new_status = "approved" if action == "approve" else "hidden"
        review.status = new_status
        review.save(update_fields=["status"])

        AdminService.log_action(
            actor_id=admin_id,
            action=f"review_{new_status}",
            entity_type="company_reviews",
            entity_id=review.id,
            changes={"status": new_status},
        )
        return {"id": review.id, "status": review.status, "new_status": review.status, "message": f"Đã {action} đánh giá."}

    @staticmethod
    def get_moderation_cases(params: dict) -> dict:
        page = max(1, int(params.get("page", 1)))
        page_size = max(1, min(100, int(params.get("page_size", 20))))
        offset = (page - 1) * page_size

        qs = ModerationCases.objects.all()
        target_type = (params.get("target_type") or "").strip().lower()
        if target_type and target_type != "all":
            qs = qs.filter(target_type=target_type)

        total = qs.count()
        cases = list(qs.order_by("-created_at")[offset:offset + page_size])
        reviewer_ids = [c.reviewer_id for c in cases if c.reviewer_id]
        user_map = {u.id: u for u in Users.objects.filter(id__in=reviewer_ids)}

        items = []
        for c in cases:
            rev = user_map.get(c.reviewer_id)
            items.append({
                "id": c.id,
                "reviewer_id": c.reviewer_id,
                "reviewer_name": (rev.full_name or rev.email) if rev else "Admin",
                "target_type": c.target_type,
                "target_id": c.target_id,
                "target_name": AdminService._resolve_target_label(c.target_type, c.target_id),
                "status": c.status,
                "reason": c.reason or "",
                "reviewed_at": c.reviewed_at,
                "created_at": c.created_at,
            })
        return {
            "items": items,
            "results": items,
            "total": total,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "total_pages": (total + page_size - 1) // page_size if total > 0 else 1,
            },
        }

    # ==========================================
    # 8. Quản lý Hệ thống & Hoạt động
    # ==========================================
    @staticmethod
    def get_roles_permissions() -> dict:
        roles = list(Roles.objects.all().values("id", "code", "name", "scope"))
        perms = list(Permissions.objects.all().values("id", "code", "description"))
        role_perms_map = {}
        try:
            for rp in RolePermissions.objects.select_related("permission").all():
                role_perms_map.setdefault(rp.role_id, []).append(rp.permission.code)
        except Exception:
            pass
        role_user_counts = {
            r["role_id"]: r["cnt"]
            for r in UserRoles.objects.values("role_id").annotate(cnt=Count("user_id"))
        }
        account_type_counts = {
            "candidate": Users.objects.filter(account_type="candidate").count(),
            "employer": Users.objects.filter(account_type="employer").count(),
            "admin": Users.objects.filter(account_type="admin").count(),
        }
        for r in roles:
            code_low = (r["code"] or "").lower()
            cnt = role_user_counts.get(r["id"], 0)
            if cnt == 0 and code_low in account_type_counts:
                cnt = account_type_counts[code_low]
            r["users_count"] = cnt
            r["permissions"] = role_perms_map.get(r["id"], [])
        return {
            "roles": roles,
            "permissions": perms,
            "account_type_counts": account_type_counts,
        }

    @staticmethod
    def get_settings() -> list:
        return list(Settings.objects.all().values("key", "value", "description"))

    @staticmethod
    def update_setting(key: str, value: any, admin_id: int, description: str = None) -> dict:
        defaults = {"value": value}
        if description is not None:
            defaults["description"] = description
        setting, _ = Settings.objects.get_or_create(key=key, defaults=defaults)
        setting.value = value
        if description is not None:
            setting.description = description
        setting.save()

        AdminService.log_action(
            actor_id=admin_id,
            action="update_setting",
            entity_type="settings",
            entity_id=0,
            changes={"key": key, "value": value},
        )
        return {"key": setting.key, "value": setting.value, "description": setting.description}

    @staticmethod
    def get_email_templates() -> list:
        return list(EmailTemplates.objects.all().values("id", "code", "subject", "body", "is_active"))

    @staticmethod
    def get_audit_logs(params: dict) -> dict:
        page = max(1, int(params.get("page", 1)))
        page_size = max(1, min(100, int(params.get("page_size", 20))))
        offset = (page - 1) * page_size
        q = (params.get("q") or params.get("search") or "").strip()

        qs = AuditLogs.objects.all()
        actor_id = params.get("actor_id")
        action = (params.get("action") or "").strip()
        entity_type = (params.get("entity_type") or "").strip()
        if actor_id:
            qs = qs.filter(actor_id=actor_id)
        if action:
            qs = qs.filter(action__icontains=action)
        if entity_type and entity_type != "all":
            qs = qs.filter(entity_type__icontains=entity_type)
        if q:
            matching_user_ids = list(
                Users.objects.filter(Q(email__icontains=q) | Q(full_name__icontains=q)).values_list("id", flat=True)
            )
            qs = qs.filter(
                Q(action__icontains=q)
                | Q(entity_type__icontains=q)
                | Q(actor_id__in=matching_user_ids)
            )

        total = qs.count()
        logs = list(qs.order_by("-created_at")[offset:offset + page_size])
        actor_ids = [l.actor_id for l in logs if l.actor_id]
        actor_map = {u.id: u for u in Users.objects.filter(id__in=actor_ids)}

        items = []
        for l in logs:
            actor = actor_map.get(l.actor_id)
            items.append({
                "id": l.id,
                "actor_id": l.actor_id,
                "actor_email": actor.email if actor else "system@careza.vn",
                "actor_name": (actor.full_name or actor.email) if actor else "Hệ thống",
                "actor_role": actor.account_type if actor else "system",
                "action": l.action,
                "entity_type": l.entity_type,
                "entity_id": l.entity_id,
                "changes": l.changes,
                "created_at": l.created_at,
            })

        return {
            "items": items,
            "results": items,
            "total": total,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "total_pages": (total + page_size - 1) // page_size if total > 0 else 1,
            },
        }

    @staticmethod
    def get_ai_usage_stats() -> dict:
        total_tasks = AiTasks.objects.count()
        tasks_by_type = {}
        for row in AiTasks.objects.values("task_type").annotate(cnt=Count("id")):
            if row["task_type"]:
                tasks_by_type[row["task_type"]] = row["cnt"]

        tasks_by_status = {}
        for row in AiTasks.objects.values("status").annotate(cnt=Count("id")):
            if row["status"]:
                tasks_by_status[row["status"]] = row["cnt"]

        recent_tasks = list(
            AiTasks.objects.order_by("-created_at")[:15].values(
                "id", "task_type", "status", "model_name", "created_at", "finished_at"
            )
        )

        return {
            "total_ai_tasks": total_tasks,
            "total_tasks": total_tasks,
            "tasks_by_type": tasks_by_type,
            "tasks_by_status": tasks_by_status,
            "recent_tasks": recent_tasks,
            "categories_summary": {
                "industries_count": Industries.objects.count(),
                "skills_count": Skills.objects.count(),
                "locations_count": Locations.objects.count(),
            },
        }

    # ==========================================
    # 9. Thông báo Hệ thống (Broadcast Notification)
    # ==========================================
    @staticmethod
    def broadcast_notification(admin_id: int, data: dict) -> dict:
        target_role = data.get("target_role", "all")
        user_id = data.get("user_id")
        title = data.get("title", "").strip()
        content = data.get("content", "").strip()

        if not title:
            raise ValidationError({"title": "Tiêu đề thông báo không được để trống."})

        users_qs = Users.objects.filter(is_active=True)
        if user_id:
            users_qs = users_qs.filter(id=user_id)
        elif target_role in ("candidate", "employer"):
            users_qs = users_qs.filter(account_type=target_role)

        recipient_ids = list(users_qs.values_list("id", flat=True)[:500])
        now = datetime.now(timezone.utc)

        notifs = [
            Notifications(
                user_id=u_id,
                type="system_announcement",
                title=title,
                content=content,
                payload={"sent_by_admin": admin_id},
                created_at=now,
            )
            for u_id in recipient_ids
        ]
        if notifs:
            Notifications.objects.bulk_create(notifs)

        AdminService.log_action(
            actor_id=admin_id,
            action="broadcast_notification",
            entity_type="notifications",
            entity_id=int(user_id) if user_id else 0,
            changes={"recipients_count": len(recipient_ids), "target_role": target_role, "title": title},
        )

        return {
            "sent_count": len(recipient_ids),
            "notifications_sent": len(recipient_ids),
            "target_role": target_role,
            "title": title,
            "message": f"Đã gửi thông báo hệ thống đến {len(recipient_ids)} người dùng.",
        }
