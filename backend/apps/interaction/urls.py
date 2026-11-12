from django.urls import path
from apps.interaction.views import (
    ConversationListView,
    ConversationDetailView,
    ConversationTouchView,
    NotificationListView,
    NotificationDetailView,
    NotificationReadView,
    NotificationReadAllView,
    SavedJobListView,
    SavedJobIdsView,
    SavedJobDetailView,
    SavedJobCheckView,
    CompanyFollowListView,
    CompanyFollowActionView,
    CompanyFollowCheckView,
    CompanyReviewListView,
    CompanyReviewMyListView,
    CompanyReviewDetailView,
    ReportListView,
    ReportDetailView,
    SearchHistoryListView,
    SearchHistoryDetailView,
    SearchHistoryClearView,
    JobComparisonListView,
    JobComparisonActionView,
    JobComparisonClearView,
    JobAlertListView,
    JobAlertDetailView,
    JobAlertTriggerView,
)

app_name = "interaction"

urlpatterns = [
    # 1. Nhắn tin (Conversations)
    path("conversations/", ConversationListView.as_view(), name="conversation-list"),
    path("conversations/<int:pk>/", ConversationDetailView.as_view(), name="conversation-detail"),
    path("conversations/<int:pk>/touch/", ConversationTouchView.as_view(), name="conversation-touch"),

    # 2. Thông báo (Notifications)
    path("notifications/", NotificationListView.as_view(), name="notification-list"),
    path("notifications/read-all/", NotificationReadAllView.as_view(), name="notification-read-all"),
    path("notifications/<int:pk>/", NotificationDetailView.as_view(), name="notification-detail"),
    path("notifications/<int:pk>/read/", NotificationReadView.as_view(), name="notification-read"),

    # 3. Việc làm đã lưu (Saved Jobs)
    path("saved-jobs/", SavedJobListView.as_view(), name="saved-job-list"),
    path("saved-jobs/ids/", SavedJobIdsView.as_view(), name="saved-job-ids"),
    path("saved-jobs/<int:job_id>/", SavedJobDetailView.as_view(), name="saved-job-detail"),
    path("saved-jobs/<int:job_id>/check/", SavedJobCheckView.as_view(), name="saved-job-check"),

    # 4. Theo dõi Doanh nghiệp (Company Follows)
    path("company-follows/", CompanyFollowListView.as_view(), name="company-follow-list"),
    path("company-follows/<int:company_id>/", CompanyFollowActionView.as_view(), name="company-follow-action"),
    path("company-follows/<int:company_id>/check/", CompanyFollowCheckView.as_view(), name="company-follow-check"),

    # 5. Đánh giá Doanh nghiệp (Company Reviews)
    path("company-reviews/", CompanyReviewListView.as_view(), name="company-review-list"),
    path("company-reviews/my-reviews/", CompanyReviewMyListView.as_view(), name="company-review-my-list"),
    path("company-reviews/<int:pk>/", CompanyReviewDetailView.as_view(), name="company-review-detail"),

    # 6. Báo cáo Vi phạm (Reports)
    path("reports/", ReportListView.as_view(), name="report-list"),
    path("reports/my-reports/", ReportListView.as_view(), name="report-my-list"),
    path("reports/<int:pk>/", ReportDetailView.as_view(), name="report-detail"),

    # 7. Lịch sử Tìm kiếm (Search History)
    path("search-history/", SearchHistoryListView.as_view(), name="search-history-list"),
    path("search-history/clear/", SearchHistoryClearView.as_view(), name="search-history-clear"),
    path("search-history/<int:pk>/", SearchHistoryDetailView.as_view(), name="search-history-detail"),

    # 8. So sánh Việc làm (Job Comparisons)
    path("job-comparisons/", JobComparisonListView.as_view(), name="job-comparison-list"),
    path("job-comparisons/clear/", JobComparisonClearView.as_view(), name="job-comparison-clear"),
    path("job-comparisons/<int:job_id>/", JobComparisonActionView.as_view(), name="job-comparison-action"),

    # 9. Job Alerts (Thông báo việc làm phù hợp)
    path("job-alerts/", JobAlertListView.as_view(), name="job-alert-list"),
    path("job-alerts/<int:pk>/", JobAlertDetailView.as_view(), name="job-alert-detail"),
    path("job-alerts/<int:pk>/trigger/", JobAlertTriggerView.as_view(), name="job-alert-trigger"),
]
