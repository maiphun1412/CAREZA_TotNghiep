import uuid
from datetime import datetime, timezone, timedelta
from django.db import connection, transaction
from rest_framework.exceptions import NotFound, ValidationError, PermissionDenied

from apps.authentication.models import Users
from apps.company.models import Companies, Members
from apps.company.services.company_service import CompanyService
from apps.billing.models import (
    Plans,
    Coupons,
    Orders,
    Payments,
    Subscriptions,
    QuotaLedger,
)
from apps.recruitment.models import Jobs
from apps.interaction.models import Notifications
from apps.system.models import AuditLogs


class BillingService:
    @staticmethod
    def get_company(user_id: int) -> Companies:
        return CompanyService.get_company_for_user(user_id)

    # ==========================================
    # 1. Gói dịch vụ (Plans)
    # ==========================================
    @staticmethod
    def get_plans(audience: str = "employer") -> list:
        qs = Plans.objects.filter(is_active=True)
        if audience:
            qs = qs.filter(audience=audience)
        plans = qs.order_by("price_vnd")
        results = []
        for p in plans:
            results.append({
                "id": p.id,
                "code": p.code,
                "name": p.name,
                "audience": p.audience,
                "price_vnd": p.price_vnd,
                "duration_days": p.duration_days,
                "job_quota": p.job_quota,
                "ai_interview_quota": p.ai_interview_quota,
                "features": p.features or {},
                "is_active": p.is_active,
            })
        return results

    @staticmethod
    def get_plan_detail(plan_id: int) -> dict:
        p = Plans.objects.filter(id=plan_id, is_active=True).first()
        if not p:
            raise NotFound("Không tìm thấy gói dịch vụ.")
        return {
            "id": p.id,
            "code": p.code,
            "name": p.name,
            "audience": p.audience,
            "price_vnd": p.price_vnd,
            "duration_days": p.duration_days,
            "job_quota": p.job_quota,
            "ai_interview_quota": p.ai_interview_quota,
            "features": p.features or {},
        }

    @staticmethod
    def get_plans_comparison() -> dict:
        plans = BillingService.get_plans(audience="employer")
        comparison_matrix = [
            {"feature": "Số lượng tin tuyển dụng", "key": "job_quota"},
            {"feature": "Số lượt phỏng vấn AI", "key": "ai_interview_quota"},
            {"feature": "Thời hạn sử dụng (ngày)", "key": "duration_days"},
            {"feature": "Giá gói dịch vụ (VND)", "key": "price_vnd"},
        ]
        return {
            "plans": plans,
            "comparison_matrix": comparison_matrix,
        }

    # ==========================================
    # 2. Mã giảm giá (Coupons)
    # ==========================================
    @staticmethod
    def validate_and_apply_coupon(code: str, plan_price_vnd: int) -> dict:
        coupon = Coupons.objects.filter(code__iexact=code.strip()).first()
        if not coupon:
            raise ValidationError({"coupon_code": "Mã giảm giá không tồn tại."})

        now = datetime.now(timezone.utc)
        if coupon.valid_until and coupon.valid_until < now:
            raise ValidationError({"coupon_code": "Mã giảm giá đã hết hạn sử dụng."})

        if coupon.max_uses and (coupon.used_count or 0) >= coupon.max_uses:
            raise ValidationError({"coupon_code": "Mã giảm giá đã hết lượt sử dụng."})

        discount_percent = coupon.discount_percent or 0
        discount_amount = int(plan_price_vnd * discount_percent / 100)
        final_price = max(0, plan_price_vnd - discount_amount)

        return {
            "coupon_id": coupon.id,
            "coupon_code": coupon.code,
            "discount_percent": discount_percent,
            "discount_amount": discount_amount,
            "original_price": plan_price_vnd,
            "final_price": final_price,
        }

    # ==========================================
    # 3. Đăng ký & Tạo đơn hàng (Orders)
    # ==========================================
    @staticmethod
    def create_order(user_id: int, plan_id: int, coupon_code: str = "") -> dict:
        company = BillingService.get_company(user_id)
        plan = Plans.objects.filter(id=plan_id, is_active=True).first()
        if not plan:
            raise NotFound("Không tìm thấy gói dịch vụ cần đăng ký.")

        total_vnd = plan.price_vnd
        coupon_obj = None

        if coupon_code:
            coupon_res = BillingService.validate_and_apply_coupon(coupon_code, total_vnd)
            total_vnd = coupon_res["final_price"]
            coupon_obj = Coupons.objects.filter(id=coupon_res["coupon_id"]).first()

        now = datetime.now(timezone.utc)
        order_code = f"CRZ-{int(now.timestamp())}-{uuid.uuid4().hex[:6].upper()}"

        with transaction.atomic():
            order = Orders.objects.create(
                order_code=order_code,
                user_id=user_id,
                company_id=company.id,
                plan=plan,
                coupon=coupon_obj,
                total_vnd=total_vnd,
                status="pending",
                created_at=now,
            )

        return {
            "id": order.id,
            "order_code": order.order_code,
            "plan": {
                "id": plan.id,
                "name": plan.name,
                "code": plan.code,
            },
            "original_price": plan.price_vnd,
            "discount_amount": plan.price_vnd - total_vnd,
            "total_vnd": order.total_vnd,
            "status": order.status,
            "created_at": order.created_at,
        }

    @staticmethod
    def get_company_orders(user_id: int, params: dict) -> dict:
        company = BillingService.get_company(user_id)
        page = max(1, int(params.get("page", 1)))
        page_size = max(1, min(100, int(params.get("page_size", 10))))
        offset = (page - 1) * page_size

        qs = Orders.objects.select_related("plan", "coupon").filter(company_id=company.id)
        status_val = params.get("status")
        if status_val:
            qs = qs.filter(status=status_val)

        total = qs.count()
        orders = qs.order_by("-created_at")[offset:offset + page_size]

        items = []
        for o in orders:
            items.append({
                "id": o.id,
                "order_code": o.order_code,
                "plan_name": o.plan.name if o.plan else "",
                "plan_code": o.plan.code if o.plan else "",
                "total_vnd": o.total_vnd,
                "coupon_code": o.coupon.code if o.coupon else None,
                "status": o.status,
                "created_at": o.created_at,
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
    def get_order_detail(user_id: int, order_id: int) -> dict:
        company = BillingService.get_company(user_id)
        order = Orders.objects.select_related("plan", "coupon").filter(id=order_id, company_id=company.id).first()
        if not order:
            raise NotFound("Không tìm thấy đơn hàng của doanh nghiệp.")

        payment = Payments.objects.filter(order=order).order_by("-paid_at").first()

        return {
            "id": order.id,
            "order_code": order.order_code,
            "plan": {
                "id": order.plan.id if order.plan else None,
                "name": order.plan.name if order.plan else "",
                "duration_days": order.plan.duration_days if order.plan else 30,
                "job_quota": order.plan.job_quota if order.plan else 0,
                "ai_interview_quota": order.plan.ai_interview_quota if order.plan else 0,
            },
            "coupon": {
                "code": order.coupon.code,
                "discount_percent": order.coupon.discount_percent,
            } if order.coupon else None,
            "total_vnd": order.total_vnd,
            "status": order.status,
            "created_at": order.created_at,
            "payment": {
                "id": payment.id,
                "provider": payment.provider,
                "status": payment.status,
                "paid_at": payment.paid_at,
            } if payment else None,
        }

    @staticmethod
    def cancel_order(user_id: int, order_id: int) -> dict:
        company = BillingService.get_company(user_id)
        order = Orders.objects.filter(id=order_id, company_id=company.id).first()
        if not order:
            raise NotFound("Không tìm thấy đơn hàng.")

        if order.status != "pending":
            raise ValidationError({"detail": f"Không thể hủy đơn hàng ở trạng thái '{order.status}'."})

        order.status = "cancelled"
        order.save(update_fields=["status"])
        return {"id": order.id, "status": order.status, "message": "Đã hủy đơn hàng."}

    # ==========================================
    # 4. Thanh toán & Webhook (Payments)
    # ==========================================
    @staticmethod
    def initiate_payment(user_id: int, order_id: int, provider: str = "bank_transfer") -> dict:
        company = BillingService.get_company(user_id)
        order = Orders.objects.select_related("plan").filter(id=order_id, company_id=company.id).first()
        if not order:
            raise NotFound("Không tìm thấy đơn hàng cần thanh toán.")

        if order.status == "paid":
            raise ValidationError({"detail": "Đơn hàng này đã được thanh toán thành công."})

        if order.status == "cancelled":
            raise ValidationError({"detail": "Đơn hàng này đã bị hủy."})

        if order.status != "pending":
            raise ValidationError({"detail": f"Đơn hàng không ở trạng thái chờ thanh toán (hiện tại: {order.status})."})

        provider_norm = (provider or "bank_transfer").strip().lower()
        if provider_norm != "bank_transfer":
            raise ValidationError({
                "provider": (
                    f"Phương thức thanh toán '{provider_norm}' chưa được tích hợp. "
                    "Hiện hệ thống chỉ ghi nhận đơn hàng chờ đối soát chuyển khoản."
                )
            })

        # Tạo hoặc lấy bản ghi Payment ở trạng thái pending (chưa có giao dịch thực tế)
        payment, created = Payments.objects.get_or_create(
            order=order,
            status="pending",
            defaults={
                "provider": provider_norm,
                "provider_reference": "",
                "amount_vnd": order.total_vnd,
                "metadata": {"initiated_by_user": user_id, "provider": provider_norm},
            }
        )
        if not created and payment.provider != provider_norm:
            payment.provider = provider_norm
            payment.save(update_fields=["provider"])

        # Không trả về thông tin ngân hàng mẫu hoặc URL cổng thanh toán giả
        payment_instructions = {
            "payment_mode": "manual_verification",
            "bank_transfer_configured": False,
            "amount": order.total_vnd,
            "currency": "VND",
            "transfer_content": order.order_code,
            "notice": (
                "Hệ thống thanh toán trực tuyến và tài khoản ngân hàng thụ hưởng tự động chưa được cấu hình. "
                "Đơn hàng đã được ghi nhận ở trạng thái chờ xác nhận (pending). "
                "Bộ phận Quản trị CAREZA sẽ liên hệ đối soát và chỉ kích hoạt gói sau khi xác minh giao dịch thực tế."
            ),
        }

        return {
            "payment_id": payment.id,
            "order_code": order.order_code,
            "amount_vnd": order.total_vnd,
            "provider": provider_norm,
            "status": payment.status,
            "payment_instructions": payment_instructions,
        }

    @staticmethod
    def process_payment_webhook(data: dict, actor_id: int | None = None) -> dict:
        """
        Webhook dành riêng cho nhà cung cấp thanh toán bên ngoài.
        Hiện chưa tích hợp cổng thanh toán bên thứ ba có cơ chế xác thực chữ ký hợp lệ nên chặn hoàn toàn.
        Không sử dụng hàm này cho đối soát thủ công của Admin.
        """
        raise PermissionDenied(
            "Webhook cổng thanh toán bên ngoài chưa được tích hợp và đang bị khóa. "
            "Vui lòng sử dụng quy trình Admin đối soát thủ công."
        )

    @staticmethod
    def confirm_manual_payment(order_id: int, data: dict, admin_id: int) -> dict:
        """
        Admin đối soát và xác nhận chuyển khoản thủ công cho đơn hàng:
        - Kiểm tra quyền Admin hợp lệ.
        - Bắt buộc nhập mã giao dịch thực tế (provider_reference), số tiền đã nhận (amount_vnd),
          thời điểm giao dịch (paid_at) và ghi chú/bằng chứng đối soát (note).
        - Chỉ xác nhận đơn pending, khớp số tiền & loại tiền VND, mã giao dịch duy nhất.
        - Cập nhật Orders, Payments, Subscriptions, QuotaLedger và AuditLogs trong cùng transaction.atomic()
          với select_for_update() và kiểm tra idempotency.
        """
        if not admin_id:
            raise PermissionDenied("Bắt buộc xác thực tài khoản Admin thực hiện đối soát.")

        admin_user = Users.objects.filter(id=admin_id, is_active=True).first()
        if not admin_user:
            raise PermissionDenied("Tài khoản thực hiện đối soát không tồn tại hoặc đã bị khóa.")

        from apps.authentication.models import UserRoles
        is_admin_user = (
            admin_user.account_type == "admin"
            or UserRoles.objects.filter(user_id=admin_user.id, role__code="admin").exists()
        )
        if not is_admin_user:
            raise PermissionDenied("Chỉ Quản trị viên (Admin) mới có quyền xác nhận đối soát thanh toán.")

        provider_ref = (data.get("provider_reference") or data.get("transaction_code") or "").strip()
        raw_amount = data.get("amount_vnd")
        currency = (data.get("currency") or "VND").strip().upper()
        raw_paid_at = data.get("paid_at")
        note = (data.get("note") or data.get("reconciliation_note") or "").strip()
        evidence = (data.get("evidence") or "").strip()

        if not provider_ref:
            raise ValidationError({"provider_reference": "Bắt buộc nhập mã giao dịch ngân hàng thực tế."})

        if len(provider_ref) < 3 or len(provider_ref) > 150:
            raise ValidationError({"provider_reference": "Mã giao dịch phải có độ dài từ 3 đến 150 ký tự."})

        try:
            amount_vnd = int(raw_amount)
        except (TypeError, ValueError):
            raise ValidationError({"amount_vnd": "Bắt buộc nhập số tiền thực nhận hợp lệ (amount_vnd)."})

        if amount_vnd <= 0:
            raise ValidationError({"amount_vnd": "Số tiền thực nhận phải lớn hơn 0."})

        if currency != "VND":
            raise ValidationError({"currency": "Loại tiền tệ đối soát không hợp lệ (chỉ hỗ trợ VND)."})

        if not raw_paid_at:
            raise ValidationError({"paid_at": "Bắt buộc nhập thời điểm giao dịch thực tế (paid_at)."})

        if isinstance(raw_paid_at, datetime):
            parsed_paid_at = raw_paid_at if raw_paid_at.tzinfo else raw_paid_at.replace(tzinfo=timezone.utc)
        elif isinstance(raw_paid_at, str):
            clean_ts = raw_paid_at.strip()
            if clean_ts.endswith("Z"):
                clean_ts = clean_ts[:-1] + "+00:00"
            try:
                parsed_paid_at = datetime.fromisoformat(clean_ts)
                if parsed_paid_at.tzinfo is None:
                    parsed_paid_at = parsed_paid_at.replace(tzinfo=timezone.utc)
            except ValueError:
                raise ValidationError({"paid_at": "Thời điểm giao dịch (paid_at) không đúng định dạng ISO 8601."})
        else:
            raise ValidationError({"paid_at": "Thời điểm giao dịch (paid_at) không hợp lệ."})

        if not note:
            raise ValidationError({"note": "Bắt buộc nhập ghi chú / bằng chứng đối soát thanh toán."})

        now = datetime.now(timezone.utc)

        with transaction.atomic():
            order = (
                Orders.objects.select_for_update()
                .select_related("plan", "coupon")
                .filter(id=order_id)
                .first()
            )
            if not order:
                raise NotFound(f"Không tìm thấy đơn hàng #{order_id}.")

            # Kiểm tra số tiền khớp với đơn hàng
            if order.total_vnd <= 0 or amount_vnd != order.total_vnd:
                raise ValidationError({
                    "amount_vnd": f"Số tiền đối soát ({amount_vnd} VND) không khớp với tổng tiền đơn hàng ({order.total_vnd} VND)."
                })

            # Idempotency check: nếu đơn hàng đã paid trước đó
            if order.status == "paid":
                existing_pay = (
                    Payments.objects.select_for_update()
                    .filter(order=order, status="success")
                    .first()
                )
                if existing_pay and existing_pay.provider_reference and existing_pay.provider_reference != provider_ref:
                    raise ValidationError({
                        "provider_reference": (
                            f"Đơn hàng {order.order_code} đã được đối soát trước đó với mã giao dịch "
                            f"'{existing_pay.provider_reference}', không thể ghi đè bằng mã giao dịch khác."
                        )
                    })
                return {
                    "order_id": order.id,
                    "order_code": order.order_code,
                    "status": "already_paid",
                    "provider_reference": existing_pay.provider_reference if existing_pay else provider_ref,
                    "amount_vnd": order.total_vnd,
                    "message": "Đơn hàng đã được đối soát và kích hoạt trước đó.",
                }

            # Chỉ cho phép xác nhận đơn hàng đang ở trạng thái pending
            if order.status != "pending":
                raise ValidationError({
                    "detail": (
                        f"Chỉ cho phép đối soát đơn hàng đang chờ thanh toán (pending). "
                        f"Không thể xác nhận đơn hàng ở trạng thái '{order.status}'."
                    )
                })

            # Kiểm tra mã giao dịch không trùng với bất kỳ đơn hàng nào khác đã thanh toán
            duplicate_ref = (
                Payments.objects.select_for_update()
                .filter(provider_reference=provider_ref, status="success")
                .exclude(order=order)
                .exists()
            )
            if duplicate_ref:
                raise ValidationError({
                    "provider_reference": "Mã giao dịch này đã được sử dụng để đối soát cho một đơn hàng khác."
                })

            # 1. Cập nhật Orders -> paid
            order.status = "paid"
            order.save(update_fields=["status"])

            reconciliation_meta = {
                "reconciliation_note": note,
                "evidence": evidence,
                "verified_by_admin_id": admin_id,
                "verified_at": now.isoformat(),
                "paid_at": parsed_paid_at.isoformat(),
            }

            # 2. Cập nhật / tạo bản ghi Payments -> success
            payment = (
                Payments.objects.select_for_update()
                .filter(order=order)
                .order_by("-id")
                .first()
            )
            if payment:
                payment.provider = "bank_transfer"
                payment.provider_reference = provider_ref
                payment.amount_vnd = order.total_vnd
                payment.status = "success"
                payment.paid_at = parsed_paid_at
                payment.metadata = {**(payment.metadata or {}), **reconciliation_meta}
                payment.save(update_fields=["provider", "provider_reference", "amount_vnd", "status", "paid_at", "metadata"])
            else:
                payment = Payments.objects.create(
                    order=order,
                    provider="bank_transfer",
                    provider_reference=provider_ref,
                    amount_vnd=order.total_vnd,
                    status="success",
                    paid_at=parsed_paid_at,
                    metadata=reconciliation_meta,
                )

            # 3. Kiểm tra idempotency trên QuotaLedger để đảm bảo không cộng quota trùng
            already_credited = QuotaLedger.objects.filter(
                company_id=order.company_id,
                reference_type="order",
                reference_id=order.id,
            ).exists()

            sub_id = None
            plan = order.plan
            if not already_credited:
                # Tăng số lượt dùng của Coupon nếu có
                if order.coupon:
                    Coupons.objects.filter(id=order.coupon.id).update(used_count=(order.coupon.used_count or 0) + 1)

                # Kích hoạt / Gia hạn Subscription cho doanh nghiệp
                duration = plan.duration_days if plan and plan.duration_days else 30
                ends_at = now + timedelta(days=duration)

                existing_sub = (
                    Subscriptions.objects.select_for_update()
                    .filter(
                        company_id=order.company_id,
                        status="active",
                        ends_at__gt=now,
                    )
                    .order_by("-ends_at")
                    .first()
                )

                if existing_sub:
                    ends_at = existing_sub.ends_at + timedelta(days=duration)
                    existing_sub.plan = plan
                    existing_sub.ends_at = ends_at
                    existing_sub.save(update_fields=["plan", "ends_at"])
                    sub_id = existing_sub.id
                else:
                    new_sub = Subscriptions.objects.create(
                        plan=plan,
                        company_id=order.company_id,
                        user_id=order.user_id,
                        starts_at=now,
                        ends_at=ends_at,
                        status="active",
                    )
                    sub_id = new_sub.id

                # Nạp Quota vào QuotaLedger
                if plan:
                    if plan.job_quota and plan.job_quota > 0:
                        QuotaLedger.objects.create(
                            company_id=order.company_id,
                            user_id=order.user_id,
                            quota_type="job_post",
                            delta=plan.job_quota,
                            reference_type="order",
                            reference_id=order.id,
                            created_at=now,
                        )
                    if plan.ai_interview_quota and plan.ai_interview_quota > 0:
                        QuotaLedger.objects.create(
                            company_id=order.company_id,
                            user_id=order.user_id,
                            quota_type="ai_interview",
                            delta=plan.ai_interview_quota,
                            reference_type="order",
                            reference_id=order.id,
                            created_at=now,
                        )

                # Gửi thông báo đến Doanh nghiệp
                Notifications.objects.create(
                    user_id=order.user_id,
                    type="billing_success",
                    title="Thanh toán gói dịch vụ đã được xác nhận",
                    content=(
                        f"Đơn hàng {order.order_code} đã được Quản trị viên đối soát thanh toán thành công "
                        f"(Mã GD: {provider_ref}). Gói {plan.name if plan else ''} đã được kích hoạt."
                    ),
                    payload={"order_id": order.id, "subscription_id": sub_id, "provider_reference": provider_ref},
                    created_at=now,
                )

            # 4. Ghi AuditLogs đầy đủ thông tin đối soát (không lưu dữ liệu nhạy cảm thừa)
            AuditLogs.objects.create(
                actor_id=admin_id,
                action="admin_confirm_order_payment",
                entity_type="orders",
                entity_id=order.id,
                changes={
                    "order_id": order.id,
                    "order_code": order.order_code,
                    "company_id": order.company_id,
                    "plan_id": plan.id if plan else None,
                    "amount_vnd": order.total_vnd,
                    "currency": "VND",
                    "provider_reference": provider_ref,
                    "paid_at": parsed_paid_at.isoformat(),
                    "note": note,
                    "result": "paid",
                },
                created_at=now,
            )

        return {
            "order_id": order.id,
            "order_code": order.order_code,
            "status": order.status,
            "payment_id": payment.id,
            "provider_reference": provider_ref,
            "amount_vnd": order.total_vnd,
            "paid_at": parsed_paid_at.isoformat(),
            "subscription_id": sub_id,
            "message": "Đã xác nhận đối soát thanh toán và kích hoạt gói dịch vụ thành công.",
        }

    # ==========================================
    # 5. Quản lý Thuê bao & Hạn mức (Subscriptions & Quota)
    # ==========================================
    @staticmethod
    def get_current_subscription_and_quota(user_id: int) -> dict:
        company = BillingService.get_company(user_id)
        now = datetime.now(timezone.utc)

        # Lấy subscription active
        sub = Subscriptions.objects.select_related("plan").filter(
            company_id=company.id,
            status="active",
        ).order_by("-ends_at").first()

        # Tính toán Quota từ QuotaLedger bằng ORM (tách rõ tổng cấp phát dương và tổng đã tiêu thụ âm)
        from django.db.models import Sum, Q
        quota_granted = {}
        quota_consumed = {}
        agg_rows = (
            QuotaLedger.objects.filter(company_id=company.id)
            .values("quota_type")
            .annotate(
                granted=Sum("delta", filter=Q(delta__gt=0)),
                consumed=Sum("delta", filter=Q(delta__lt=0)),
            )
        )
        for row in agg_rows:
            q_type = row.get("quota_type")
            if q_type:
                quota_granted[q_type] = int(row.get("granted") or 0)
                quota_consumed[q_type] = abs(int(row.get("consumed") or 0))

        total_job_quota = quota_granted.get("job_post", 0)
        ledger_used_jobs = quota_consumed.get("job_post", 0)

        total_ai_quota = quota_granted.get("ai_interview", 0)
        used_ai_quota = quota_consumed.get("ai_interview", 0)
        remaining_ai_quota = max(0, total_ai_quota - used_ai_quota)

        # Số tin tuyển dụng đã xuất bản nhưng chưa có bút toán trừ trong QuotaLedger (tương thích dữ liệu cũ)
        recorded_job_ids = list(
            QuotaLedger.objects.filter(
                company_id=company.id,
                quota_type="job_post",
                reference_type="job_publish",
                delta__lt=0,
                reference_id__gt=0,
            ).values_list("reference_id", flat=True)
        )
        legacy_published_jobs_count = (
            Jobs.objects.filter(company=company)
            .exclude(status="draft")
            .exclude(id__in=recorded_job_ids)
            .count()
        )
        used_jobs = ledger_used_jobs + legacy_published_jobs_count
        remaining_jobs = max(0, total_job_quota - used_jobs) if total_job_quota > 0 else 0

        subscription_info = None
        if sub and sub.ends_at:
            days_left = max(0, (sub.ends_at - now).days)
            subscription_info = {
                "id": sub.id,
                "plan_name": sub.plan.name if sub.plan else "Gói tiêu chuẩn",
                "plan_code": sub.plan.code if sub.plan else "standard",
                "starts_at": sub.starts_at,
                "ends_at": sub.ends_at,
                "days_left": days_left,
                "is_expired": sub.ends_at < now,
                "status": "expired" if sub.ends_at < now else sub.status,
            }

        return {
            "subscription": subscription_info,
            "quota": {
                "job_posts": {
                    "total_granted": total_job_quota,
                    "used": used_jobs,
                    "remaining": remaining_jobs,
                },
                "ai_interviews": {
                    "total_granted": total_ai_quota,
                    "used": used_ai_quota,
                    "remaining": remaining_ai_quota,
                },
            },
        }

    @staticmethod
    def get_quota_ledger_history(user_id: int, params: dict) -> dict:
        company = BillingService.get_company(user_id)
        page = max(1, int(params.get("page", 1)))
        page_size = max(1, min(100, int(params.get("page_size", 20))))
        offset = (page - 1) * page_size

        qs = QuotaLedger.objects.filter(company_id=company.id)
        quota_type = params.get("quota_type")
        if quota_type:
            qs = qs.filter(quota_type=quota_type)

        total = qs.count()
        ledgers = qs.order_by("-created_at")[offset:offset + page_size]

        items = []
        for l in ledgers:
            items.append({
                "id": l.id,
                "quota_type": l.quota_type,
                "delta": l.delta,
                "reference_type": l.reference_type,
                "reference_id": l.reference_id,
                "created_at": l.created_at,
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
    def check_and_consume_job_quota(user_id: int, job_id: int | None = None) -> bool:
        """
        Kiểm tra và trừ quota khi xuất bản tin tuyển dụng lần đầu.
        - Sử dụng transaction.atomic() kết hợp select_for_update() trên dòng Companies (và Subscriptions)
          để tuần tự hóa các request xuất bản đồng thời của cùng một doanh nghiệp, chống race condition vượt hạn mức.
        - Tin nháp (draft) không gọi hàm này và không tiêu thụ quota.
        - Nếu job_id đã từng được ghi nhận xuất bản trong QuotaLedger -> idempotent, không trừ lặp.
        - Nếu doanh nghiệp có gói hạn mức (total_granted > 0) và đã hết remaining -> Ném ValidationError.
        - Nếu còn hạn mức -> Ghi 1 bút toán âm (-1) vào QuotaLedger gắn với reference_id=job_id.
        """
        company = BillingService.get_company(user_id)

        with transaction.atomic():
            # Khóa dòng doanh nghiệp và thuê bao đang hoạt động để tuần tự hóa kiểm tra & trừ quota
            Companies.objects.select_for_update().filter(id=company.id).first()
            list(Subscriptions.objects.select_for_update().filter(company_id=company.id, status="active"))

            if job_id and QuotaLedger.objects.filter(
                company_id=company.id,
                quota_type="job_post",
                reference_type="job_publish",
                reference_id=job_id,
                delta__lt=0,
            ).exists():
                return True

            data = BillingService.get_current_subscription_and_quota(user_id)
            total_granted = data["quota"]["job_posts"]["total_granted"]
            remaining = data["quota"]["job_posts"]["remaining"]

            if total_granted > 0 and remaining <= 0:
                raise ValidationError({
                    "quota": "Doanh nghiệp của bạn đã sử dụng hết hạn mức đăng tin. Vui lòng nâng cấp gói dịch vụ để tiếp tục."
                })

            if total_granted > 0:
                now = datetime.now(timezone.utc)
                QuotaLedger.objects.create(
                    company_id=company.id,
                    user_id=user_id,
                    quota_type="job_post",
                    delta=-1,
                    reference_type="job_publish",
                    reference_id=job_id or 0,
                    created_at=now,
                )
        return True

    # ==========================================
    # 6. Lịch sử giao dịch thanh toán (Transactions)
    # ==========================================
    @staticmethod
    def get_company_transactions(user_id: int, params: dict) -> dict:
        company = BillingService.get_company(user_id)
        page = max(1, int(params.get("page", 1)))
        page_size = max(1, min(100, int(params.get("page_size", 10))))
        offset = (page - 1) * page_size

        qs = Payments.objects.select_related("order", "order__plan").filter(order__company_id=company.id)
        total = qs.count()
        payments = qs.order_by("-id")[offset:offset + page_size]

        items = []
        for p in payments:
            items.append({
                "id": p.id,
                "transaction_code": p.provider_reference or f"TXN-{p.id}",
                "order_code": p.order.order_code if p.order else "",
                "plan_name": p.order.plan.name if p.order and p.order.plan else "",
                "amount_vnd": p.amount_vnd,
                "provider": p.provider,
                "status": p.status,
                "paid_at": p.paid_at,
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
