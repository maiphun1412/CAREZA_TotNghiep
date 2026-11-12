from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from apps.authentication.authentication import JWTAuthentication
from apps.authentication.permissions import IsAuthenticatedCustom, IsEmployer, HasCompanyAccess, IsAdmin
from apps.billing.services.billing_service import BillingService
from apps.billing.serializers import (
    CouponApplySerializer,
    OrderCreateSerializer,
    PaymentInitiateSerializer,
    PaymentWebhookSerializer,
)


# ==========================================
# 1. Gói dịch vụ (Plans) - Public & Employer
# ==========================================
class PlanListView(APIView):
    """Danh sách các gói dịch vụ tuyển dụng."""
    permission_classes = [AllowAny]

    def get(self, request):
        audience = request.query_params.get("audience", "employer")
        plans = BillingService.get_plans(audience=audience)
        return Response({"success": True, "data": {"plans": plans}}, status=status.HTTP_200_OK)


class PlanDetailView(APIView):
    """Chi tiết 1 gói dịch vụ."""
    permission_classes = [AllowAny]

    def get(self, request, pk):
        plan = BillingService.get_plan_detail(int(pk))
        return Response({"success": True, "data": {"plan": plan}}, status=status.HTTP_200_OK)


class PlanCompareView(APIView):
    """Bảng so sánh tính năng và quyền lợi các gói dịch vụ."""
    permission_classes = [AllowAny]

    def get(self, request):
        res = BillingService.get_plans_comparison()
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)


# ==========================================
# 2. Áp dụng Mã giảm giá (Coupons)
# ==========================================
class CouponApplyView(APIView):
    """Kiểm tra và tính số tiền giảm giá của mã Coupon."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsEmployer]

    def post(self, request):
        serializer = CouponApplySerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        plan = BillingService.get_plan_detail(serializer.validated_data["plan_id"])
        res = BillingService.validate_and_apply_coupon(serializer.validated_data["coupon_code"], plan["price_vnd"])
        return Response({"success": True, "message": "Áp dụng mã giảm giá thành công.", "data": res}, status=status.HTTP_200_OK)


# ==========================================
# 3. Đơn hàng (Orders)
# ==========================================
class OrderListView(APIView):
    """Danh sách đơn hàng của doanh nghiệp và tạo đơn hàng mới."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsEmployer, HasCompanyAccess]

    def get(self, request):
        res = BillingService.get_company_orders(request.user.id, request.query_params)
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = OrderCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        res = BillingService.create_order(
            request.user.id,
            serializer.validated_data["plan_id"],
            serializer.validated_data.get("coupon_code", ""),
        )
        return Response({"success": True, "message": "Tạo đơn hàng thành công.", "data": {"order": res}}, status=status.HTTP_201_CREATED)


class OrderDetailView(APIView):
    """Xem chi tiết đơn hàng."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsEmployer, HasCompanyAccess]

    def get(self, request, pk):
        order = BillingService.get_order_detail(request.user.id, int(pk))
        return Response({"success": True, "data": {"order": order}}, status=status.HTTP_200_OK)


class OrderCancelView(APIView):
    """Hủy đơn hàng chưa thanh toán."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsEmployer, HasCompanyAccess]

    def post(self, request, pk):
        res = BillingService.cancel_order(request.user.id, int(pk))
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)


# ==========================================
# 4. Thanh toán & Webhook (Payments)
# ==========================================
class PaymentInitiateView(APIView):
    """Khởi tạo thanh toán cho đơn hàng (lấy thông tin chuyển khoản / cổng thanh toán)."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsEmployer, HasCompanyAccess]

    def post(self, request, pk):
        serializer = PaymentInitiateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        res = BillingService.initiate_payment(
            request.user.id,
            int(pk),
            serializer.validated_data.get("provider", "bank_transfer"),
        )
        return Response({"success": True, "message": "Khởi tạo thanh toán thành công.", "data": res}, status=status.HTTP_200_OK)


class PaymentWebhookView(APIView):
    """
    Webhook dành riêng cho nhà cung cấp thanh toán bên ngoài (khi có xác thực chữ ký hợp lệ).
    Hiện dự án chưa tích hợp cổng thanh toán bên thứ ba nên chặn hoàn toàn kích hoạt thanh toán qua webhook.
    Việc đối soát và xác nhận chuyển khoản thủ công phải thực hiện qua API Admin (/api/admin/billing/orders/<pk>/confirm/).
    """
    permission_classes = [AllowAny]

    def post(self, request):
        return Response(
            {
                "success": False,
                "message": (
                    "Webhook cổng thanh toán bên ngoài chưa được tích hợp và đang bị khóa. "
                    "Không được sử dụng endpoint webhook để xác nhận thanh toán."
                ),
            },
            status=status.HTTP_403_FORBIDDEN,
        )


# ==========================================
# 5. Thuê bao & Hạn mức Quota
# ==========================================
class SubscriptionCurrentView(APIView):
    """Xem gói dịch vụ hiện tại và hạn mức Quota còn lại của doanh nghiệp."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsEmployer, HasCompanyAccess]

    def get(self, request):
        res = BillingService.get_current_subscription_and_quota(request.user.id)
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)


class QuotaLedgerListView(APIView):
    """Lịch sử biến động hạn mức Quota của doanh nghiệp."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsEmployer, HasCompanyAccess]

    def get(self, request):
        res = BillingService.get_quota_ledger_history(request.user.id, request.query_params)
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)


# ==========================================
# 6. Lịch sử giao dịch (Transactions)
# ==========================================
class TransactionListView(APIView):
    """Lịch sử giao dịch thanh toán của doanh nghiệp."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsEmployer, HasCompanyAccess]

    def get(self, request):
        res = BillingService.get_company_transactions(request.user.id, request.query_params)
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)
