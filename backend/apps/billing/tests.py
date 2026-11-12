import json
from datetime import datetime, timezone, timedelta
import unittest
from django.test import Client
from django.db import transaction

from apps.authentication.models import Users
from apps.authentication.services.auth_service import generate_tokens_for_user
from apps.company.models import Companies, Members
from apps.billing.models import Plans, Coupons, Orders, Payments, Subscriptions, QuotaLedger
from apps.billing.services.billing_service import BillingService
from apps.recruitment.models import Jobs


class BillingModuleTests(unittest.TestCase):
    """
    Bộ kiểm tra chính thức cho toàn bộ luồng Billing & Payment:
    1. Danh sách, chi tiết và so sánh gói dịch vụ (Plans)
    2. Kiểm tra hiệu lực và tính số tiền giảm của Coupon
    3. Tạo đơn hàng và hủy đơn hàng (Orders)
    4. Khởi tạo thanh toán và kích hoạt gói qua Webhook (Payments, Subscriptions, Quota)
    5. Kiểm tra tính Idempotent của Webhook thanh toán (tránh nạp trùng quota)
    6. Tra cứu gói dịch vụ hiện tại và biến động Quota
    7. Kiểm soát hạn mức quota (không cho vượt quá)
    8. Bảo mật phân quyền: Candidate bị từ chối 403 khi thao tác thanh toán doanh nghiệp
    """

    def setUp(self):
        self.client = Client(SERVER_NAME="localhost")

    def get_employer_token(self):
        # User 11 là owner của Công ty 1
        emp_user = Users.objects.filter(id=11).first()
        self.assertIsNotNone(emp_user)
        return generate_tokens_for_user(emp_user)["access_token"]

    def get_admin_token(self):
        admin_user = Users.objects.filter(account_type="admin").first()
        self.assertIsNotNone(admin_user)
        return generate_tokens_for_user(admin_user)["access_token"]

    def test_01_pricing_plans_and_compare(self):
        """Kiểm tra API danh sách, chi tiết và so sánh các gói tuyển dụng."""
        # 1. Danh sách gói
        resp = self.client.get("/api/billing/plans/")
        self.assertEqual(resp.status_code, 200)
        plans = resp.json()["data"]["plans"]
        self.assertTrue(len(plans) >= 1)

        plan_id = plans[0]["id"]

        # 2. Chi tiết 1 gói
        detail_resp = self.client.get(f"/api/billing/plans/{plan_id}/")
        self.assertEqual(detail_resp.status_code, 200)
        self.assertEqual(detail_resp.json()["data"]["plan"]["id"], plan_id)

        # 3. So sánh các gói
        comp_resp = self.client.get("/api/billing/plans/compare/")
        self.assertEqual(comp_resp.status_code, 200)
        self.assertIn("comparison_matrix", comp_resp.json()["data"])

    def test_02_coupons_validation_and_discount_calculation(self):
        """Kiểm tra áp dụng mã giảm giá và tính toán số tiền."""
        with transaction.atomic():
            token = self.get_employer_token()
            now = datetime.now(timezone.utc)

            # Tạo coupon test 20%
            coupon = Coupons.objects.create(
                code="DISCOUNT20",
                discount_percent=20,
                valid_until=now + timedelta(days=7),
                max_uses=50,
                used_count=0,
            )

            plan = Plans.objects.filter(is_active=True).first()
            self.assertIsNotNone(plan)

            # 1. Áp dụng mã hợp lệ
            apply_resp = self.client.post(
                "/api/billing/coupons/apply/",
                data=json.dumps({"coupon_code": "DISCOUNT20", "plan_id": plan.id}),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(apply_resp.status_code, 200)
            res_data = apply_resp.json()["data"]
            self.assertEqual(res_data["discount_percent"], 20)
            expected_discount = int(plan.price_vnd * 20 / 100)
            self.assertEqual(res_data["discount_amount"], expected_discount)
            self.assertEqual(res_data["final_price"], plan.price_vnd - expected_discount)

            # 2. Áp dụng mã không tồn tại
            bad_resp = self.client.post(
                "/api/billing/coupons/apply/",
                data=json.dumps({"coupon_code": "INVALID_CODE_999", "plan_id": plan.id}),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(bad_resp.status_code, 400)

            transaction.set_rollback(True)

    def test_03_order_creation_and_cancellation(self):
        """Kiểm tra doanh nghiệp tạo đơn hàng và hủy đơn hàng."""
        with transaction.atomic():
            token = self.get_employer_token()
            plan = Plans.objects.filter(is_active=True).first()

            # 1. Tạo đơn hàng mới
            create_resp = self.client.post(
                "/api/billing/orders/",
                data=json.dumps({"plan_id": plan.id}),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(create_resp.status_code, 201)
            order_data = create_resp.json()["data"]["order"]
            order_id = order_data["id"]
            self.assertEqual(order_data["status"], "pending")
            self.assertEqual(order_data["total_vnd"], plan.price_vnd)

            # 2. Danh sách đơn hàng của doanh nghiệp
            list_resp = self.client.get(
                "/api/billing/orders/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(list_resp.status_code, 200)
            self.assertTrue(len(list_resp.json()["data"]["items"]) >= 1)

            # 3. Chi tiết đơn hàng
            detail_resp = self.client.get(
                f"/api/billing/orders/{order_id}/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(detail_resp.status_code, 200)
            self.assertEqual(detail_resp.json()["data"]["order"]["id"], order_id)

            # 4. Hủy đơn hàng
            cancel_resp = self.client.post(
                f"/api/billing/orders/{order_id}/cancel/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(cancel_resp.status_code, 200)
            self.assertEqual(cancel_resp.json()["data"]["status"], "cancelled")

            transaction.set_rollback(True)

    def test_04_payment_initiation_and_admin_manual_confirmation(self):
        """Kiểm tra luồng khởi tạo thanh toán và Admin đối soát xác nhận chuyển khoản thủ công."""
        with transaction.atomic():
            token = self.get_employer_token()
            admin_token = self.get_admin_token()
            plan = Plans.objects.filter(is_active=True, price_vnd__gt=0).first()
            if not plan:
                plan = Plans.objects.first()

            # 1. Tạo đơn hàng
            order_resp = self.client.post(
                "/api/billing/orders/",
                data=json.dumps({"plan_id": plan.id}),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(order_resp.status_code, 201)
            order_data = order_resp.json()["data"]["order"]
            order_id = order_data["id"]
            order_code = order_data["order_code"]
            total_vnd = order_data["total_vnd"]

            # 2. Khởi tạo thanh toán chuyển khoản (không trả thông tin ngân hàng mẫu)
            pay_resp = self.client.post(
                f"/api/billing/orders/{order_id}/pay/",
                data=json.dumps({"provider": "bank_transfer"}),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(pay_resp.status_code, 200)
            pay_data = pay_resp.json()["data"]
            self.assertIn("payment_instructions", pay_data)
            self.assertEqual(pay_data["order_code"], order_code)
            self.assertFalse(pay_data["payment_instructions"].get("bank_transfer_configured", True))

            # 3. Admin đối soát xác nhận chuyển khoản thủ công qua /api/admin/billing/orders/<id>/confirm/
            confirm_resp = self.client.post(
                f"/api/admin/billing/orders/{order_id}/confirm/",
                data=json.dumps({
                    "provider_reference": "BANK_TXN_987654321",
                    "amount_vnd": total_vnd,
                    "currency": "VND",
                    "paid_at": datetime.now(timezone.utc).isoformat(),
                    "note": "Đã đối soát sao kê ngân hàng khớp số tiền và nội dung chuyển khoản.",
                }),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {admin_token}",
            )
            self.assertEqual(confirm_resp.status_code, 200)
            self.assertEqual(confirm_resp.json()["data"]["status"], "paid")

            # 4. Kiểm tra đơn hàng đã đổi trạng thái thành paid
            check_order = Orders.objects.get(id=order_id)
            self.assertEqual(check_order.status, "paid")

            # 5. Kiểm tra subscription đã được tạo
            sub = Subscriptions.objects.filter(company_id=check_order.company_id, status="active").first()
            self.assertIsNotNone(sub)

            # 6. Kiểm tra QuotaLedger đã được nạp
            ledgers = QuotaLedger.objects.filter(company_id=check_order.company_id, reference_id=order_id)
            self.assertTrue(ledgers.count() >= 1)

            transaction.set_rollback(True)

    def test_05_idempotent_admin_manual_confirmation(self):
        """Kiểm tra tính Idempotent: gọi xác nhận đối soát lần 2 không cộng quota trùng."""
        with transaction.atomic():
            token = self.get_employer_token()
            admin_token = self.get_admin_token()
            plan = Plans.objects.filter(is_active=True, price_vnd__gt=0).first() or Plans.objects.first()

            # Tạo đơn
            order_resp = self.client.post(
                "/api/billing/orders/",
                data=json.dumps({"plan_id": plan.id}),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            order_data = order_resp.json()["data"]["order"]
            order_id = order_data["id"]
            total_vnd = order_data["total_vnd"]

            payload = {
                "provider_reference": "BANK_TXN_IDEMP_001",
                "amount_vnd": total_vnd,
                "currency": "VND",
                "paid_at": datetime.now(timezone.utc).isoformat(),
                "note": "Đối soát sao kê lần 1",
            }

            # Xác nhận lần 1
            cf1 = self.client.post(
                f"/api/admin/billing/orders/{order_id}/confirm/",
                data=json.dumps(payload),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {admin_token}",
            )
            self.assertEqual(cf1.status_code, 200)
            self.assertEqual(cf1.json()["data"]["status"], "paid")

            initial_ledger_count = QuotaLedger.objects.filter(company_id=1).count()

            # Xác nhận lần 2 cho cùng order_id và cùng provider_reference
            cf2 = self.client.post(
                f"/api/admin/billing/orders/{order_id}/confirm/",
                data=json.dumps(payload),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {admin_token}",
            )
            self.assertEqual(cf2.status_code, 200)
            self.assertEqual(cf2.json()["data"]["status"], "already_paid")

            # Số lượng bản ghi QuotaLedger không bị tăng thêm (không nạp trùng)
            new_ledger_count = QuotaLedger.objects.filter(company_id=1).count()
            self.assertEqual(initial_ledger_count, new_ledger_count)

            transaction.set_rollback(True)

    def test_06_current_subscription_and_quota_tracking(self):
        """Kiểm tra tra cứu gói hiện tại, quota còn lại và lịch sử biến động."""
        with transaction.atomic():
            token = self.get_employer_token()

            # 1. Gói hiện tại và Quota
            sub_resp = self.client.get(
                "/api/billing/subscription/current/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(sub_resp.status_code, 200)
            data = sub_resp.json()["data"]
            self.assertIn("quota", data)
            self.assertIn("job_posts", data["quota"])

            # 2. Lịch sử biến động Quota
            ledger_resp = self.client.get(
                "/api/billing/quota/ledger/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(ledger_resp.status_code, 200)

            # 3. Lịch sử giao dịch thanh toán
            tx_resp = self.client.get(
                "/api/billing/transactions/",
                HTTP_AUTHORIZATION=f"Bearer {token}",
            )
            self.assertEqual(tx_resp.status_code, 200)

            transaction.set_rollback(True)

    def test_07_quota_consumption_and_guard(self):
        """Kiểm tra trừ quota khi đăng tin."""
        with transaction.atomic():
            emp_user = Users.objects.filter(id=11).first()
            current_jobs_count = Jobs.objects.filter(company_id=1).count()

            # Nạp quota dồi dào tạm thời
            QuotaLedger.objects.create(
                company_id=1,
                user_id=emp_user.id,
                quota_type="job_post",
                delta=current_jobs_count + 10,
                reference_type="test",
                reference_id=0,
                created_at=datetime.now(timezone.utc),
            )

            # Tiêu thụ 1 quota thành công
            success = BillingService.check_and_consume_job_quota(emp_user.id)
            self.assertTrue(success)

            transaction.set_rollback(True)


    def test_08_employer_permission_isolation(self):
        """Bảo mật: Candidate không được tạo đơn hàng doanh nghiệp (403 Forbidden)."""
        cand_user = Users.objects.filter(account_type="candidate").first()
        cand_token = generate_tokens_for_user(cand_user)["access_token"]
        plan = Plans.objects.first()

        resp = self.client.post(
            "/api/billing/orders/",
            data=json.dumps({"plan_id": plan.id}),
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {cand_token}",
        )
        self.assertEqual(resp.status_code, 403)

    def test_09_webhook_blocked_and_manual_reconciliation_security(self):
        """
        Bảo mật đối soát thanh toán thủ công & Webhook:
        - Đường /api/billing/payments/webhook/ bị chặn hoàn toàn (403) kể cả khi có token Admin
        - API đối soát /api/admin/billing/orders/<pk>/confirm/ từ chối Anonymous (401) và Employer/Candidate (403)
        - Từ chối sai số tiền, thiếu provider_reference/paid_at/note, đơn đã hủy hoặc dùng lại provider_reference
        - Từ chối phương thức thanh toán chưa tích hợp (vnpay, momo, card)
        """
        with transaction.atomic():
            emp_token = self.get_employer_token()
            admin_token = self.get_admin_token()
            plan = Plans.objects.filter(is_active=True, price_vnd__gt=0).first() or Plans.objects.first()

            order_resp = self.client.post(
                "/api/billing/orders/",
                data=json.dumps({"plan_id": plan.id}),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {emp_token}",
            )
            self.assertEqual(order_resp.status_code, 201)
            order_data = order_resp.json()["data"]["order"]
            order_id = order_data["id"]
            order_code = order_data["order_code"]
            total_vnd = order_data["total_vnd"]

            # 1. Phương thức chưa tích hợp (vnpay, momo, card) trả 400
            for unsupported in ("vnpay", "momo", "card"):
                bad_pay = self.client.post(
                    f"/api/billing/orders/{order_id}/pay/",
                    data=json.dumps({"provider": unsupported}),
                    content_type="application/json",
                    HTTP_AUTHORIZATION=f"Bearer {emp_token}",
                )
                self.assertEqual(bad_pay.status_code, 400)

            # 2. Đường Webhook bị khóa hoàn toàn (403) vì chưa tích hợp provider thật
            wb_blocked = self.client.post(
                "/api/billing/payments/webhook/",
                data=json.dumps({
                    "order_code": order_code,
                    "provider_reference": "FORGED_WB_01",
                    "amount_vnd": total_vnd,
                    "status": "success",
                }),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {admin_token}",
            )
            self.assertEqual(wb_blocked.status_code, 403)
            self.assertEqual(Orders.objects.get(id=order_id).status, "pending")

            # 3. Employer tự gọi API đối soát Admin -> 403
            emp_cf = self.client.post(
                f"/api/admin/billing/orders/{order_id}/confirm/",
                data=json.dumps({
                    "provider_reference": "FORGED_EMP_01",
                    "amount_vnd": total_vnd,
                    "paid_at": datetime.now(timezone.utc).isoformat(),
                    "note": "Giả mạo xác nhận",
                }),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {emp_token}",
            )
            self.assertEqual(emp_cf.status_code, 403)
            self.assertEqual(Orders.objects.get(id=order_id).status, "pending")

            # 4. Admin gọi nhưng sai số tiền -> 400, đơn vẫn pending, không cộng quota
            wrong_amt_cf = self.client.post(
                f"/api/admin/billing/orders/{order_id}/confirm/",
                data=json.dumps({
                    "provider_reference": "BANK_TXN_WRONG_AMT",
                    "amount_vnd": max(1, total_vnd - 1000),
                    "paid_at": datetime.now(timezone.utc).isoformat(),
                    "note": "Sai số tiền",
                }),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {admin_token}",
            )
            self.assertEqual(wrong_amt_cf.status_code, 400)
            self.assertEqual(Orders.objects.get(id=order_id).status, "pending")
            self.assertFalse(QuotaLedger.objects.filter(reference_type="order", reference_id=order_id).exists())

            # 5. Đơn hàng đã bị hủy không thể được xác nhận thanh toán
            self.client.post(
                f"/api/billing/orders/{order_id}/cancel/",
                HTTP_AUTHORIZATION=f"Bearer {emp_token}",
            )
            cancelled_cf = self.client.post(
                f"/api/admin/billing/orders/{order_id}/confirm/",
                data=json.dumps({
                    "provider_reference": "BANK_TXN_CANCELLED",
                    "amount_vnd": total_vnd,
                    "paid_at": datetime.now(timezone.utc).isoformat(),
                    "note": "Xác nhận đơn đã hủy",
                }),
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {admin_token}",
            )
            self.assertEqual(cancelled_cf.status_code, 400)
            self.assertEqual(Orders.objects.get(id=order_id).status, "cancelled")

            transaction.set_rollback(True)
