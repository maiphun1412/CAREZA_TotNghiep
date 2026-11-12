from django.urls import path
from apps.system.views import (
    AdminDashboardView,
    AdminUserListView,
    AdminUserDetailView,
    AdminUserStatusView,
    AdminUserRoleView,
    AdminUserResetPasswordView,
    AdminCompanyListView,
    AdminCompanyDetailView,
    AdminCompanyVerifyView,
    AdminCompanyStatusView,
    AdminJobListView,
    AdminJobDetailView,
    AdminJobModerateView,
    AdminIndustryListView,
    AdminIndustryDetailView,
    AdminSkillListView,
    AdminSkillDetailView,
    AdminLocationListView,
    AdminBillingPlanListView,
    AdminBillingPlanDetailView,
    AdminBillingOrderListView,
    AdminBillingOrderConfirmView,
    AdminBillingSubscriptionListView,
    AdminBillingCouponView,
    AdminReportListView,
    AdminReportResolveView,
    AdminReviewListView,
    AdminReviewModerateView,
    AdminModerationCaseListView,
    AdminSystemRolePermissionView,
    AdminSystemSettingsView,
    AdminSystemEmailTemplateView,
    AdminAuditLogView,
    AdminAiUsageView,
    AdminBroadcastNotificationView,
)

app_name = "system-admin"

urlpatterns = [
    # 1. Dashboard
    path("dashboard/", AdminDashboardView.as_view(), name="admin-dashboard"),

    # 2. Quản lý Người dùng
    path("users/", AdminUserListView.as_view(), name="admin-users-list"),
    path("users/<int:pk>/", AdminUserDetailView.as_view(), name="admin-users-detail"),
    path("users/<int:pk>/status/", AdminUserStatusView.as_view(), name="admin-users-status"),
    path("users/<int:pk>/roles/", AdminUserRoleView.as_view(), name="admin-users-roles"),
    path("users/<int:pk>/reset-password/", AdminUserResetPasswordView.as_view(), name="admin-users-reset-password"),

    # 3. Quản lý & Xác minh Doanh nghiệp
    path("companies/", AdminCompanyListView.as_view(), name="admin-companies-list"),
    path("companies/<int:pk>/", AdminCompanyDetailView.as_view(), name="admin-companies-detail"),
    path("companies/<int:pk>/verify/", AdminCompanyVerifyView.as_view(), name="admin-companies-verify"),
    path("companies/<int:pk>/status/", AdminCompanyStatusView.as_view(), name="admin-companies-status"),

    # 4. Kiểm duyệt Tin tuyển dụng
    path("jobs/", AdminJobListView.as_view(), name="admin-jobs-list"),
    path("jobs/<int:pk>/", AdminJobDetailView.as_view(), name="admin-jobs-detail"),
    path("jobs/<int:pk>/moderate/", AdminJobModerateView.as_view(), name="admin-jobs-moderate"),

    # 5. Quản lý Danh mục
    path("categories/industries/", AdminIndustryListView.as_view(), name="admin-industries-list"),
    path("categories/industries/<int:pk>/", AdminIndustryDetailView.as_view(), name="admin-industries-detail"),
    path("categories/skills/", AdminSkillListView.as_view(), name="admin-skills-list"),
    path("categories/skills/<int:pk>/", AdminSkillDetailView.as_view(), name="admin-skills-detail"),
    path("categories/locations/", AdminLocationListView.as_view(), name="admin-locations-list"),

    # 6. Quản lý Gói dịch vụ & Giao dịch
    path("billing/plans/", AdminBillingPlanListView.as_view(), name="admin-billing-plans"),
    path("billing/plans/<int:pk>/", AdminBillingPlanDetailView.as_view(), name="admin-billing-plans-detail"),
    path("billing/orders/", AdminBillingOrderListView.as_view(), name="admin-billing-orders"),
    path("billing/orders/<int:pk>/confirm/", AdminBillingOrderConfirmView.as_view(), name="admin-billing-orders-confirm"),
    path("billing/subscriptions/", AdminBillingSubscriptionListView.as_view(), name="admin-billing-subscriptions"),
    path("billing/coupons/", AdminBillingCouponView.as_view(), name="admin-billing-coupons"),

    # 7. Quản lý Báo cáo vi phạm, Đánh giá & Kiểm duyệt
    path("reports/", AdminReportListView.as_view(), name="admin-reports-list"),
    path("reports/<int:pk>/resolve/", AdminReportResolveView.as_view(), name="admin-reports-resolve"),
    path("reviews/", AdminReviewListView.as_view(), name="admin-reviews-list"),
    path("reviews/<int:pk>/moderate/", AdminReviewModerateView.as_view(), name="admin-reviews-moderate"),
    path("moderation-cases/", AdminModerationCaseListView.as_view(), name="admin-moderation-cases-list"),

    # 8. Quản lý Hệ thống
    path("system/roles-permissions/", AdminSystemRolePermissionView.as_view(), name="admin-roles-permissions"),
    path("system/settings/", AdminSystemSettingsView.as_view(), name="admin-settings"),
    path("system/email-templates/", AdminSystemEmailTemplateView.as_view(), name="admin-email-templates"),
    path("system/audit-logs/", AdminAuditLogView.as_view(), name="admin-audit-logs"),
    path("system/ai-usage/", AdminAiUsageView.as_view(), name="admin-ai-usage"),

    # 9. Thông báo Hệ thống
    path("notifications/broadcast/", AdminBroadcastNotificationView.as_view(), name="admin-notifications-broadcast"),
]
