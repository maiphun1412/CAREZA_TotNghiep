import uuid
from datetime import datetime, timezone
from django.db import transaction
from django.db.models import Q
from rest_framework.exceptions import NotFound, ValidationError, PermissionDenied

from apps.authentication.models import Users
from apps.company.models import Companies, Members
from apps.candidate.models import Profiles
from apps.recruitment.models import Jobs, Applications
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


# ==============================================================================
# 1. Nhắn tin (Conversations & Messaging Stream)
# ==============================================================================

class ConversationService:
    @staticmethod
    def get_user_conversations(user_id: int, keyword: str = "") -> list[dict]:
        """
        Lấy danh sách các cuộc hội thoại của người dùng:
        - Nếu user là candidate: lấy các cuộc trò chuyện với các công ty.
        - Nếu user là employer: lấy các cuộc trò chuyện của công ty mà user thuộc về.
        """
        user = Users.objects.filter(id=user_id).first()
        if not user:
            raise NotFound("Không tìm thấy người dùng.")

        member = Members.objects.filter(user_id=user_id).first()
        company_id = member.company_id if member else None

        if company_id:
            # User là Employer
            qs = Conversations.objects.filter(company_id=company_id)
        else:
            # User là Candidate
            qs = Conversations.objects.filter(candidate_user_id=user_id)

        conversations = list(qs.order_by("-last_message_at", "-created_at")[:50])
        if not conversations:
            return []

        # Lấy thông tin mapping
        candidate_ids = [c.candidate_user_id for c in conversations if c.candidate_user_id]
        comp_ids = [c.company_id for c in conversations if c.company_id]

        candidates_map = {u.id: u for u in Users.objects.filter(id__in=candidate_ids)}
        companies_map = {cmp.id: cmp for cmp in Companies.objects.filter(id__in=comp_ids)}

        results = []
        for c in conversations:
            cand_user = candidates_map.get(c.candidate_user_id)
            comp_obj = companies_map.get(c.company_id)

            partner_name = comp_obj.name if (not company_id and comp_obj) else (cand_user.full_name if cand_user else "Người dùng")
            partner_email = comp_obj.website if (not company_id and comp_obj) else (cand_user.email if cand_user else "")
            partner_avatar = comp_obj.logo_url if (not company_id and comp_obj) else (cand_user.avatar_url if cand_user else "")

            # Lọc theo từ khóa nếu có
            if keyword and keyword.lower() not in partner_name.lower():
                continue

            results.append({
                "id": c.id,
                "firebase_thread_id": c.firebase_thread_id,
                "partner": {
                    "id": c.company_id if not company_id else c.candidate_user_id,
                    "type": "company" if not company_id else "candidate",
                    "name": partner_name,
                    "email": partner_email,
                    "avatar": partner_avatar,
                },
                "last_message_at": c.last_message_at,
                "created_at": c.created_at,
            })

        return results

    @staticmethod
    def get_or_create_conversation(user_id: int, partner_id: int, partner_type: str = "company") -> dict:
        """
        Tạo mới hoặc lấy cuộc hội thoại hiện có giữa ứng viên và doanh nghiệp.
        Tránh tạo trùng cuộc hội thoại.
        """
        member = Members.objects.filter(user_id=user_id).first()
        if member:
            # User hiện tại là Employer -> partner_id là candidate_user_id
            company_id = member.company_id
            candidate_id = partner_id
        else:
            # User hiện tại là Candidate -> partner_id là company_id
            company_id = partner_id
            candidate_id = user_id

        # Kiểm tra doanh nghiệp và ứng viên tồn tại
        company = Companies.objects.filter(id=company_id).first()
        if not company:
            raise NotFound("Không tìm thấy doanh nghiệp đối tác.")

        candidate = Users.objects.filter(id=candidate_id).first()
        if not candidate:
            raise NotFound("Không tìm thấy ứng viên đối tác.")

        # Tìm cuộc trò chuyện sẵn có
        conv = Conversations.objects.filter(candidate_user_id=candidate_id, company_id=company_id).first()
        now = datetime.now(timezone.utc)
        created = False
        if not conv:
            thread_id = f"thread_cand{candidate_id}_comp{company_id}_{uuid.uuid4().hex[:8]}"
            conv = Conversations.objects.create(
                candidate_user_id=candidate_id,
                company_id=company_id,
                firebase_thread_id=thread_id,
                last_message_at=now,
                created_at=now,
            )
            created = True

        return {
            "id": conv.id,
            "firebase_thread_id": conv.firebase_thread_id,
            "candidate_user_id": conv.candidate_user_id,
            "company_id": conv.company_id,
            "company_name": company.name,
            "candidate_name": candidate.full_name,
            "last_message_at": conv.last_message_at,
            "is_new": created,
        }

    @staticmethod
    def get_conversation_detail(user_id: int, conversation_id: int) -> dict:
        conv = Conversations.objects.filter(id=conversation_id).first()
        if not conv:
            raise NotFound("Không tìm thấy cuộc hội thoại.")

        # Kiểm tra quyền truy cập (candidate hoặc member của company)
        member = Members.objects.filter(user_id=user_id, company_id=conv.company_id).first()
        if conv.candidate_user_id != user_id and not member:
            raise PermissionDenied("Bạn không có quyền truy cập cuộc hội thoại này.")

        company = Companies.objects.filter(id=conv.company_id).first()
        candidate = Users.objects.filter(id=conv.candidate_user_id).first()

        return {
            "id": conv.id,
            "firebase_thread_id": conv.firebase_thread_id,
            "company": {
                "id": company.id if company else None,
                "name": company.name if company else "",
                "logo": company.logo_url if company else "",
            },
            "candidate": {
                "id": candidate.id if candidate else None,
                "name": candidate.full_name if candidate else "",
                "avatar": candidate.avatar_url if candidate else "",
            },
            "last_message_at": conv.last_message_at,
            "created_at": conv.created_at,
        }

    @staticmethod
    def touch_conversation(user_id: int, conversation_id: int) -> dict:
        """Cập nhật thời gian tin nhắn mới nhất trong cuộc hội thoại."""
        conv = Conversations.objects.filter(id=conversation_id).first()
        if not conv:
            raise NotFound("Không tìm thấy cuộc hội thoại.")

        member = Members.objects.filter(user_id=user_id, company_id=conv.company_id).first()
        if conv.candidate_user_id != user_id and not member:
            raise PermissionDenied("Bạn không có quyền thực hiện thao tác này.")

        now = datetime.now(timezone.utc)
        conv.last_message_at = now
        conv.save(update_fields=["last_message_at"])
        return {
            "id": conv.id,
            "last_message_at": conv.last_message_at,
            "message": "Cập nhật cuộc trò chuyện thành công.",
        }


# ==============================================================================
# 2. Thông báo (Notifications)
# ==============================================================================

class NotificationService:
    @staticmethod
    def get_notifications(user_id: int, n_type: str | None = None, is_read: str | None = None, page: int = 1, page_size: int = 20) -> dict:
        qs = Notifications.objects.filter(user_id=user_id)
        if n_type:
            qs = qs.filter(type=n_type)

        if is_read == "true":
            qs = qs.filter(read_at__isnull=False)
        elif is_read == "false":
            qs = qs.filter(read_at__isnull=True)

        total = qs.count()
        unread_count = Notifications.objects.filter(user_id=user_id, read_at__isnull=True).count()

        offset = (page - 1) * page_size
        items_db = qs.order_by("-created_at")[offset:offset + page_size]

        items = []
        for n in items_db:
            items.append({
                "id": n.id,
                "type": n.type,
                "title": n.title,
                "content": n.content,
                "payload": n.payload or {},
                "is_read": n.read_at is not None,
                "read_at": n.read_at,
                "created_at": n.created_at,
            })

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
    def get_notification_detail(user_id: int, notification_id: int) -> dict:
        n = Notifications.objects.filter(id=notification_id, user_id=user_id).first()
        if not n:
            raise NotFound("Không tìm thấy thông báo.")

        # Tự động đánh dấu đã đọc khi xem chi tiết nếu chưa đọc
        if not n.read_at:
            n.read_at = datetime.now(timezone.utc)
            n.save(update_fields=["read_at"])

        return {
            "id": n.id,
            "type": n.type,
            "title": n.title,
            "content": n.content,
            "payload": n.payload or {},
            "is_read": True,
            "read_at": n.read_at,
            "created_at": n.created_at,
        }

    @staticmethod
    def mark_as_read(user_id: int, notification_id: int, is_read: bool = True) -> dict:
        n = Notifications.objects.filter(id=notification_id, user_id=user_id).first()
        if not n:
            raise NotFound("Không tìm thấy thông báo.")

        n.read_at = datetime.now(timezone.utc) if is_read else None
        n.save(update_fields=["read_at"])
        return {
            "id": n.id,
            "is_read": n.read_at is not None,
            "read_at": n.read_at,
        }

    @staticmethod
    def mark_all_as_read(user_id: int) -> int:
        now = datetime.now(timezone.utc)
        count = Notifications.objects.filter(user_id=user_id, read_at__isnull=True).update(read_at=now)
        return count

    @staticmethod
    def delete_notification(user_id: int, notification_id: int) -> bool:
        n = Notifications.objects.filter(id=notification_id, user_id=user_id).first()
        if not n:
            raise NotFound("Không tìm thấy thông báo.")
        n.delete()
        return True

    @staticmethod
    def create_notification(user_id: int, n_type: str, title: str, content: str, payload: dict | None = None) -> Notifications:
        """Helper tự động tạo thông báo cho sự kiện tuyển dụng."""
        now = datetime.now(timezone.utc)
        return Notifications.objects.create(
            user_id=user_id,
            type=n_type,
            title=title,
            content=content,
            payload=payload or {},
            read_at=None,
            created_at=now,
        )


# ==============================================================================
# 3. Việc làm đã lưu (Saved Jobs)
# ==============================================================================

class SavedJobService:
    @staticmethod
    def get_saved_jobs(user_id: int, page: int = 1, page_size: int = 10) -> dict:
        qs = SavedJobs.objects.filter(user_id=user_id).order_by("-created_at")
        total = qs.count()
        offset = (page - 1) * page_size
        saved_items = qs[offset:offset + page_size]

        job_ids = [s.job_id for s in saved_items]
        jobs_map = {j.id: j for j in Jobs.objects.filter(id__in=job_ids).select_related("company")}

        items = []
        for s in saved_items:
            j = jobs_map.get(s.job_id)
            if j:
                items.append({
                    "job_id": j.id,
                    "title": j.title,
                    "company_name": j.company.name if j.company else "",
                    "company_logo": j.company.logo_url if j.company else "",
                    "work_mode": j.work_mode,
                    "salary_min": j.salary_min,
                    "salary_max": j.salary_max,
                    "currency": j.currency,
                    "experience_min": float(j.experience_min or 0.0),
                    "saved_at": s.created_at,
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
    def get_saved_job_ids(user_id: int) -> list[int]:
        return list(SavedJobs.objects.filter(user_id=user_id).values_list("job_id", flat=True))

    @staticmethod
    def save_job(user_id: int, job_id: int) -> dict:
        job = Jobs.objects.filter(id=job_id).first()
        if not job:
            raise NotFound("Không tìm thấy tin tuyển dụng.")

        now = datetime.now(timezone.utc)
        record, created = SavedJobs.objects.get_or_create(
            user_id=user_id,
            job_id=job.id,
            defaults={"created_at": now},
        )
        return {
            "job_id": job.id,
            "is_saved": True,
            "message": "Lưu việc làm thành công." if created else "Việc làm này đã được lưu trước đó.",
        }

    @staticmethod
    def unsave_job(user_id: int, job_id: int) -> dict:
        SavedJobs.objects.filter(user_id=user_id, job_id=job_id).delete()
        return {
            "job_id": job_id,
            "is_saved": False,
            "message": "Đã bỏ lưu việc làm.",
        }

    @staticmethod
    def check_saved(user_id: int, job_id: int) -> dict:
        is_saved = SavedJobs.objects.filter(user_id=user_id, job_id=job_id).exists()
        return {"job_id": job_id, "is_saved": is_saved}


# ==============================================================================
# 4. Theo dõi Doanh nghiệp (Company Follows)
# ==============================================================================

class CompanyFollowService:
    @staticmethod
    def get_followed_companies(user_id: int, page: int = 1, page_size: int = 10) -> dict:
        from django.db import connection
        qs = CompanyFollows.objects.filter(user_id=user_id).order_by("-created_at")
        total = qs.count()
        offset = (page - 1) * page_size
        follows = list(qs[offset:offset + page_size])

        comp_ids = [f.company_id for f in follows]
        comps = {c.id: c for c in Companies.objects.filter(id__in=comp_ids)}

        items = []
        for f in follows:
            comp = comps.get(f.company_id)
            if comp:
                active_jobs_count = Jobs.objects.filter(company_id=comp.id, status="published").count()
                item_dict = {
                    "id": comp.id,
                    "company_id": comp.id,
                    "slug": comp.slug,
                    "name": comp.name,
                    "logo_url": comp.logo_url,
                    "industry_id": comp.industry_id,
                    "company_size": comp.company_size,
                    "active_jobs_count": active_jobs_count,
                    "followed_at": f.created_at,
                    "company": {
                        "id": comp.id,
                        "slug": comp.slug,
                        "name": comp.name,
                        "logo_url": comp.logo_url,
                        "company_size": comp.company_size,
                        "website": comp.website,
                        "description": comp.description,
                        "active_jobs_count": active_jobs_count,
                    },
                }
                items.append(item_dict)

        return {
            "items": items,
            "companies": items,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "total_pages": (total + page_size - 1) // page_size if total > 0 else 1,
            },
        }

    @staticmethod
    def follow_company(user_id: int, company_id: int) -> dict:
        from django.db import connection
        comp = Companies.objects.filter(id=company_id).first()
        if not comp:
            raise NotFound("Không tìm thấy doanh nghiệp.")

        now = datetime.now(timezone.utc)
        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO interaction.company_follows (user_id, company_id, created_at)
                VALUES (%s, %s, %s)
                ON CONFLICT (user_id, company_id) DO NOTHING;
            """, [user_id, comp.id, now])
        return {
            "company_id": comp.id,
            "is_following": True,
            "message": "Đã theo dõi doanh nghiệp.",
        }

    @staticmethod
    def unfollow_company(user_id: int, company_id: int) -> dict:
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("""
                DELETE FROM interaction.company_follows
                WHERE user_id = %s AND company_id = %s;
            """, [user_id, company_id])
        return {
            "company_id": company_id,
            "is_following": False,
            "message": "Đã hủy theo dõi doanh nghiệp.",
        }

    @staticmethod
    def check_following(user_id: int, company_id: int) -> dict:
        is_following = CompanyFollows.objects.filter(user_id=user_id, company_id=company_id).exists()
        return {"company_id": company_id, "is_following": is_following}


# ==============================================================================
# 5. Đánh giá Doanh nghiệp (Company Reviews)
# ==============================================================================

class CompanyReviewService:
    @staticmethod
    def get_company_reviews(company_id: int, page: int = 1, page_size: int = 10) -> dict:
        comp = Companies.objects.filter(id=company_id).first()
        if not comp:
            raise NotFound("Không tìm thấy doanh nghiệp.")

        # Chỉ hiển thị các đánh giá đã duyệt hoặc hợp lệ
        from django.db.models import Avg
        qs = CompanyReviews.objects.filter(
            company_id=comp.id,
            status__in=["approved", "published"]
        ).order_by("-created_at")

        total = qs.count()
        avg_val = qs.aggregate(avg_rating=Avg("rating")).get("avg_rating") if total > 0 else None
        average_rating = round(float(avg_val), 1) if avg_val is not None else None
        offset = (page - 1) * page_size
        reviews = qs[offset:offset + page_size]

        items = []
        for r in reviews:
            items.append({
                "id": r.id,
                "company_id": r.company_id,
                "rating": r.rating,
                "title": r.title,
                "content": r.content,
                "created_at": r.created_at,
            })

        return {
            "company_name": comp.name,
            "average_rating": average_rating,
            "review_count": total,
            "items": items,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "total_pages": (total + page_size - 1) // page_size if total > 0 else 1,
            },
        }

    @staticmethod
    def get_my_reviews(user_id: int, page: int = 1, page_size: int = 10) -> dict:
        qs = CompanyReviews.objects.filter(user_id=user_id).order_by("-created_at")
        total = qs.count()
        offset = (page - 1) * page_size
        reviews = qs[offset:offset + page_size]

        comp_ids = [r.company_id for r in reviews]
        comps = {c.id: c.name for c in Companies.objects.filter(id__in=comp_ids)}

        items = []
        for r in reviews:
            items.append({
                "id": r.id,
                "company_id": r.company_id,
                "company_name": comps.get(r.company_id, ""),
                "rating": r.rating,
                "title": r.title,
                "content": r.content,
                "status": r.status,
                "created_at": r.created_at,
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
    def create_review(user_id: int, data: dict) -> dict:
        company_id = data.get("company_id")
        comp = Companies.objects.filter(id=company_id).first()
        if not comp:
            raise NotFound("Không tìm thấy doanh nghiệp cần đánh giá.")

        rating = data.get("rating")
        if rating is None or not (1 <= int(rating) <= 5):
            raise ValidationError({"rating": "Số sao đánh giá phải từ 1 đến 5 sao."})

        title = (data.get("title") or "").strip()
        content = (data.get("content") or "").strip()
        if not content:
            raise ValidationError({"content": "Nội dung đánh giá không được để trống."})

        now = datetime.now(timezone.utc)
        review = CompanyReviews.objects.create(
            user_id=user_id,
            company_id=comp.id,
            rating=int(rating),
            title=title,
            content=content,
            status="pending",  # Đưa vào hàng chờ kiểm duyệt
            created_at=now,
        )

        return {
            "id": review.id,
            "company_id": review.company_id,
            "rating": review.rating,
            "title": review.title,
            "content": review.content,
            "status": review.status,
            "created_at": review.created_at,
            "message": "Gửi đánh giá thành công. Đánh giá của bạn đang chờ kiểm duyệt.",
        }

    @staticmethod
    def update_review(user_id: int, review_id: int, data: dict) -> dict:
        review = CompanyReviews.objects.filter(id=review_id, user_id=user_id).first()
        if not review:
            raise NotFound("Không tìm thấy đánh giá của bạn.")

        if "rating" in data:
            val = int(data["rating"])
            if not (1 <= val <= 5):
                raise ValidationError({"rating": "Số sao đánh giá phải từ 1 đến 5 sao."})
            review.rating = val

        if "title" in data:
            review.title = data["title"].strip()

        if "content" in data:
            c = data["content"].strip()
            if not c:
                raise ValidationError({"content": "Nội dung đánh giá không được để trống."})
            review.content = c

        # Khi sửa đổi, đưa về trạng thái pending kiểm duyệt lại
        review.status = "pending"
        review.save()

        return {
            "id": review.id,
            "rating": review.rating,
            "title": review.title,
            "content": review.content,
            "status": review.status,
            "message": "Cập nhật đánh giá thành công. Đang chờ kiểm duyệt lại.",
        }

    @staticmethod
    def delete_review(user_id: int, review_id: int) -> bool:
        review = CompanyReviews.objects.filter(id=review_id, user_id=user_id).first()
        if not review:
            raise NotFound("Không tìm thấy đánh giá của bạn.")
        review.delete()
        return True


# ==============================================================================
# 6. Báo cáo Vi phạm (Reports)
# ==============================================================================

class ReportService:
    @staticmethod
    def create_report(user_id: int, data: dict) -> dict:
        target_type = data.get("target_type")
        target_id = data.get("target_id")
        reason = (data.get("reason") or "").strip()
        details = (data.get("details") or "").strip()

        if target_type not in ["job", "company", "review", "user"]:
            raise ValidationError({"target_type": "Loại đối tượng báo cáo không hợp lệ (job, company, review, user)."})

        if not target_id:
            raise ValidationError({"target_id": "Vui lòng cung cấp ID đối tượng cần báo cáo."})

        if not reason:
            raise ValidationError({"reason": "Vui lòng chọn hoặc nhập lý do báo cáo."})

        now = datetime.now(timezone.utc)
        report = Reports.objects.create(
            reporter_id=user_id,
            target_type=target_type,
            target_id=int(target_id),
            reason=reason,
            details=details,
            status="pending",
            created_at=now,
        )

        return {
            "id": report.id,
            "target_type": report.target_type,
            "target_id": report.target_id,
            "reason": report.reason,
            "status": report.status,
            "created_at": report.created_at,
            "message": "Gửi báo cáo vi phạm thành công. Quản trị viên sẽ sớm kiểm tra.",
        }

    @staticmethod
    def get_my_reports(user_id: int, page: int = 1, page_size: int = 10) -> dict:
        qs = Reports.objects.filter(reporter_id=user_id).order_by("-created_at")
        total = qs.count()
        offset = (page - 1) * page_size
        items_db = qs[offset:offset + page_size]

        items = []
        for r in items_db:
            items.append({
                "id": r.id,
                "target_type": r.target_type,
                "target_id": r.target_id,
                "reason": r.reason,
                "details": r.details,
                "status": r.status,
                "created_at": r.created_at,
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
    def get_report_detail(user_id: int, report_id: int) -> dict:
        r = Reports.objects.filter(id=report_id, reporter_id=user_id).first()
        if not r:
            raise NotFound("Không tìm thấy báo cáo của bạn.")

        return {
            "id": r.id,
            "target_type": r.target_type,
            "target_id": r.target_id,
            "reason": r.reason,
            "details": r.details,
            "status": r.status,
            "created_at": r.created_at,
        }


# ==============================================================================
# 7. Lịch sử Tìm kiếm & So sánh Việc làm (Search History & Job Comparisons)
# ==============================================================================

class SearchAndComparisonService:
    @staticmethod
    def get_search_history(user_id: int, limit: int = 10) -> list[dict]:
        items = SearchHistory.objects.filter(user_id=user_id).order_by("-searched_at")[:limit]
        results = []
        for s in items:
            results.append({
                "id": s.id,
                "keyword": s.keyword,
                "filters": s.filters or {},
                "searched_at": s.searched_at,
            })
        return results

    @staticmethod
    def add_search_history(user_id: int, keyword: str, filters: dict | None = None) -> dict:
        now = datetime.now(timezone.utc)
        record = SearchHistory.objects.create(
            user_id=user_id,
            keyword=keyword.strip(),
            filters=filters or {},
            searched_at=now,
        )
        return {
            "id": record.id,
            "keyword": record.keyword,
            "searched_at": record.searched_at,
        }

    @staticmethod
    def delete_search_history(user_id: int, item_id: int) -> bool:
        SearchHistory.objects.filter(id=item_id, user_id=user_id).delete()
        return True

    @staticmethod
    def clear_search_history(user_id: int) -> bool:
        SearchHistory.objects.filter(user_id=user_id).delete()
        return True

    @staticmethod
    def get_job_comparisons(user_id: int) -> list[dict]:
        comp_records = JobComparisons.objects.filter(user_id=user_id).order_by("-created_at")[:4]
        job_ids = [c.job_id for c in comp_records]
        jobs_map = {j.id: j for j in Jobs.objects.filter(id__in=job_ids).select_related("company")}

        results = []
        for c in comp_records:
            j = jobs_map.get(c.job_id)
            if j:
                results.append({
                    "job_id": j.id,
                    "title": j.title,
                    "company_name": j.company.name if j.company else "",
                    "company_logo": j.company.logo_url if j.company else "",
                    "work_mode": j.work_mode,
                    "employment_type": j.employment_type,
                    "salary_min": j.salary_min,
                    "salary_max": j.salary_max,
                    "currency": j.currency,
                    "experience_min": float(j.experience_min or 0.0),
                    "openings": j.openings,
                    "compared_at": c.created_at,
                })
        return results

    @staticmethod
    def add_job_comparison(user_id: int, job_id: int) -> dict:
        job = Jobs.objects.filter(id=job_id).first()
        if not job:
            raise NotFound("Không tìm thấy tin tuyển dụng.")

        count = JobComparisons.objects.filter(user_id=user_id).count()
        if count >= 4 and not JobComparisons.objects.filter(user_id=user_id, job_id=job.id).exists():
            raise ValidationError({"comparison": "Bạn chỉ có thể so sánh tối đa 4 công việc cùng lúc. Vui lòng gỡ bớt công việc khác."})

        now = datetime.now(timezone.utc)
        record, created = JobComparisons.objects.get_or_create(
            user_id=user_id,
            job_id=job.id,
            defaults={"created_at": now},
        )
        return {
            "job_id": job.id,
            "message": "Đã thêm công việc vào danh sách so sánh.",
        }

    @staticmethod
    def remove_job_comparison(user_id: int, job_id: int) -> bool:
        JobComparisons.objects.filter(user_id=user_id, job_id=job_id).delete()
        return True

    @staticmethod
    def clear_job_comparisons(user_id: int) -> bool:
        JobComparisons.objects.filter(user_id=user_id).delete()
        return True


# ==============================================================================
# 8. Job Alerts (Thông báo việc làm phù hợp)
# ==============================================================================

class JobAlertService:
    @staticmethod
    def get_job_alerts(user_id: int) -> list[dict]:
        alerts = JobAlerts.objects.filter(user_id=user_id).order_by("-id")
        results = []
        for a in alerts:
            results.append({
                "id": a.id,
                "keyword": a.keyword,
                "location_id": a.location_id,
                "frequency": a.frequency,
                "is_active": a.is_active,
            })
        return results

    @staticmethod
    def create_job_alert(user_id: int, data: dict) -> dict:
        keyword = (data.get("keyword") or "").strip()
        location_id = data.get("location_id")
        frequency = data.get("frequency", "daily")
        is_active = data.get("is_active", True)

        alert = JobAlerts.objects.create(
            user_id=user_id,
            keyword=keyword,
            location_id=location_id,
            frequency=frequency,
            is_active=is_active,
        )

        return {
            "id": alert.id,
            "keyword": alert.keyword,
            "location_id": alert.location_id,
            "frequency": alert.frequency,
            "is_active": alert.is_active,
            "message": "Tạo thông báo việc làm thành công.",
        }

    @staticmethod
    def update_job_alert(user_id: int, alert_id: int, data: dict) -> dict:
        alert = JobAlerts.objects.filter(id=alert_id, user_id=user_id).first()
        if not alert:
            raise NotFound("Không tìm thấy thông báo việc làm.")

        if "keyword" in data:
            alert.keyword = data["keyword"].strip()
        if "location_id" in data:
            alert.location_id = data["location_id"]
        if "frequency" in data:
            alert.frequency = data["frequency"]
        if "is_active" in data:
            alert.is_active = data["is_active"]

        alert.save()
        return {
            "id": alert.id,
            "keyword": alert.keyword,
            "location_id": alert.location_id,
            "frequency": alert.frequency,
            "is_active": alert.is_active,
            "message": "Cập nhật thông báo việc làm thành công.",
        }

    @staticmethod
    def delete_job_alert(user_id: int, alert_id: int) -> bool:
        alert = JobAlerts.objects.filter(id=alert_id, user_id=user_id).first()
        if not alert:
            raise NotFound("Không tìm thấy thông báo việc làm.")
        alert.delete()
        return True

    @staticmethod
    def check_alert_matches(user_id: int, alert_id: int) -> dict:
        """
        Quét tìm các tin tuyển dụng thực tế phù hợp với điều kiện của alert và tạo thông báo nếu có tin mới.
        """
        alert = JobAlerts.objects.filter(id=alert_id, user_id=user_id).first()
        if not alert:
            raise NotFound("Không tìm thấy thông báo việc làm.")

        now = datetime.now(timezone.utc)
        jobs_qs = Jobs.objects.filter(status__in=["published", "active", "draft"])
        if alert.keyword:
            jobs_qs = jobs_qs.filter(
                Q(title__icontains=alert.keyword) |
                Q(description__icontains=alert.keyword) |
                Q(requirements__icontains=alert.keyword)
            )
        if alert.location_id:
            jobs_qs = jobs_qs.filter(location_id=alert.location_id)

        matched_jobs = list(jobs_qs[:5])
        if matched_jobs:
            # Tạo thông báo thực tế cho ứng viên
            first_job = matched_jobs[0]
            NotificationService.create_notification(
                user_id=user_id,
                n_type="job_alert",
                title=f"Việc làm mới phù hợp với từ khóa '{alert.keyword or 'tất cả'}': {first_job.title}",
                content=f"Có {len(matched_jobs)} công việc mới phù hợp với điều kiện bạn đang quan tâm.",
                payload={"alert_id": alert.id, "job_id": first_job.id},
            )

        return {
            "alert_id": alert.id,
            "matched_count": len(matched_jobs),
            "jobs": [{"id": j.id, "title": j.title} for j in matched_jobs],
        }
