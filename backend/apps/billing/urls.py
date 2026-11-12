from django.urls import path
from apps.billing.views import (
    PlanListView,
    PlanDetailView,
    PlanCompareView,
    CouponApplyView,
    OrderListView,
    OrderDetailView,
    OrderCancelView,
    PaymentInitiateView,
    PaymentWebhookView,
    SubscriptionCurrentView,
    QuotaLedgerListView,
    TransactionListView,
)

app_name = "billing"

urlpatterns = [
    # 1. Gói dịch vụ
    path("plans/", PlanListView.as_view(), name="plans-list"),
    path("plans/compare/", PlanCompareView.as_view(), name="plans-compare"),
    path("plans/<int:pk>/", PlanDetailView.as_view(), name="plans-detail"),

    # 2. Mã giảm giá
    path("coupons/apply/", CouponApplyView.as_view(), name="coupons-apply"),

    # 3. Đơn hàng
    path("orders/", OrderListView.as_view(), name="orders-list"),
    path("orders/<int:pk>/", OrderDetailView.as_view(), name="orders-detail"),
    path("orders/<int:pk>/cancel/", OrderCancelView.as_view(), name="orders-cancel"),

    # 4. Thanh toán & Webhook
    path("orders/<int:pk>/pay/", PaymentInitiateView.as_view(), name="orders-pay"),
    path("payments/webhook/", PaymentWebhookView.as_view(), name="payments-webhook"),

    # 5. Thuê bao & Hạn mức Quota
    path("subscription/current/", SubscriptionCurrentView.as_view(), name="subscription-current"),
    path("quota/ledger/", QuotaLedgerListView.as_view(), name="quota-ledger"),

    # 6. Lịch sử giao dịch
    path("transactions/", TransactionListView.as_view(), name="transactions-list"),
]
