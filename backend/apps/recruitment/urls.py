from django.urls import path
from apps.recruitment.views import (
    CompanyJobListView,
    CompanyJobDetailView,
    CompanyApplicationListView,
    CompanyApplicationDetailView,
    CompanyApplicationStageView,
    CompanyApplicationRejectView,
    CompanyApplicationHireView,
    CompanyInterviewListView,
    CompanyInterviewDetailView,
    CompanyScorecardView,
    CompanyOfferView,
    CompanyOfferDetailView,
    CompanyOfferSendView,
    CompanyOfferCancelView,
    CompanyTestListView,
    CompanyTestDetailView,
    CompanyTestAssignView,
    CompanyTestAttemptListView,
    CompanyTestAttemptGradeView,
    CompanyTalentPoolView,
    CompanyTalentPoolCandidateView,
    CompanyDashboardView,
)

app_name = "recruitment"

urlpatterns = [
    # Dashboard & Thống kê
    path("me/dashboard/", CompanyDashboardView.as_view(), name="company-dashboard"),

    # Tin tuyển dụng
    path("me/jobs/", CompanyJobListView.as_view(), name="company-jobs-list"),
    path("me/jobs/<int:pk>/", CompanyJobDetailView.as_view(), name="company-jobs-detail"),

    # Hồ sơ ứng tuyển (Applications)
    path("me/applications/", CompanyApplicationListView.as_view(), name="company-applications-list"),
    path("me/applications/<int:pk>/", CompanyApplicationDetailView.as_view(), name="company-applications-detail"),
    path("me/applications/<int:pk>/stage/", CompanyApplicationStageView.as_view(), name="company-applications-stage"),
    path("me/applications/<int:pk>/reject/", CompanyApplicationRejectView.as_view(), name="company-applications-reject"),
    path("me/applications/<int:pk>/hire/", CompanyApplicationHireView.as_view(), name="company-applications-hire"),

    # Phỏng vấn, Đánh giá, Thư mời nhận việc
    path("me/interviews/", CompanyInterviewListView.as_view(), name="company-interviews"),
    path("me/interviews/<int:pk>/", CompanyInterviewDetailView.as_view(), name="company-interviews-detail"),
    path("me/scorecards/", CompanyScorecardView.as_view(), name="company-scorecards"),
    path("me/offers/", CompanyOfferView.as_view(), name="company-offers"),
    path("me/offers/<int:pk>/", CompanyOfferDetailView.as_view(), name="company-offer-detail"),
    path("me/offers/<int:pk>/send/", CompanyOfferSendView.as_view(), name="company-offer-send"),
    path("me/offers/<int:pk>/cancel/", CompanyOfferCancelView.as_view(), name="company-offer-cancel"),

    # Bài test năng lực (Assessment & Tests)
    path("me/tests/", CompanyTestListView.as_view(), name="company-tests"),
    path("me/tests/<int:pk>/", CompanyTestDetailView.as_view(), name="company-tests-detail"),
    path("me/tests/<int:pk>/assign/", CompanyTestAssignView.as_view(), name="company-tests-assign"),
    path("me/tests/<int:pk>/attempts/", CompanyTestAttemptListView.as_view(), name="company-tests-attempts"),
    path("me/test-attempts/<int:pk>/grade/", CompanyTestAttemptGradeView.as_view(), name="company-test-attempts-grade"),

    # Talent Pool (Nhóm ứng viên tiềm năng)
    path("me/talent-pools/", CompanyTalentPoolView.as_view(), name="company-talent-pools"),
    path("me/talent-pools/<int:pool_id>/candidates/", CompanyTalentPoolCandidateView.as_view(), name="company-talent-pool-add"),
    path("me/talent-pools/<int:pool_id>/candidates/<int:candidate_id>/", CompanyTalentPoolCandidateView.as_view(), name="company-talent-pool-remove"),
]
