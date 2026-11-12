from django.urls import path
from apps.candidate.views import (
    CandidateProfileMeView,
    CandidateEducationView,
    CandidateExperienceView,
    CandidateSkillView,
    CandidateCertificateView,
    CandidateProjectView,
    CandidatePreferenceView,
    CandidateDocumentListView,
    CandidateDocumentDetailView,
    CandidateDocumentDefaultView,
    CandidateDocumentVersionView,
    JobBookmarkListView,
    JobBookmarkIdsView,
    JobBookmarkActionView,
    JobAlertListView,
    ApplicationMyListView,
    CandidateDashboardView,
    PublicLandingView,
    CandidateInterviewListView,
    CandidateInterviewCancelView,
    CandidateInterviewConfirmView,
    CandidateOffersView,
    CandidateOfferDetailView,
    CandidateOfferAcceptView,
    CandidateOfferDeclineView,
)
from apps.recruitment.views import (
    CandidateTestListView,
    CandidateTestDetailView,
    CandidateTestStartView,
    CandidateTestSaveView,
    CandidateTestSubmitView,
    CandidateTestAttemptListView,
    CandidateTestAttemptDetailView,
)

app_name = "candidate"

urlpatterns = [
    # 0. Dashboard & Public Landing
    path("dashboard/", CandidateDashboardView.as_view(), name="candidate-dashboard"),
    path("public/landing/", PublicLandingView.as_view(), name="public-landing"),

    # 1. Hồ sơ cá nhân
    path("me/", CandidateProfileMeView.as_view(), name="profile-me"),
    path("educations/", CandidateEducationView.as_view(), name="educations-create"),
    path("educations/<int:pk>/", CandidateEducationView.as_view(), name="educations-detail"),
    path("experiences/", CandidateExperienceView.as_view(), name="experiences-create"),
    path("experiences/<int:pk>/", CandidateExperienceView.as_view(), name="experiences-detail"),
    path("skills/", CandidateSkillView.as_view(), name="skills-create"),
    path("skills/<int:pk>/", CandidateSkillView.as_view(), name="skills-detail"),
    path("certificates/", CandidateCertificateView.as_view(), name="certificates-create"),
    path("certificates/<int:pk>/", CandidateCertificateView.as_view(), name="certificates-detail"),
    path("projects/", CandidateProjectView.as_view(), name="projects-create"),
    path("projects/<int:pk>/", CandidateProjectView.as_view(), name="projects-detail"),
    path("preferences/", CandidatePreferenceView.as_view(), name="preferences"),

    # 2. Quản lý CV & Tài liệu (Hỗ trợ cả route /documents/ và /cvs/)
    path("documents/", CandidateDocumentListView.as_view(), name="documents-list"),
    path("documents/<int:pk>/", CandidateDocumentDetailView.as_view(), name="documents-detail"),
    path("documents/<int:pk>/default/", CandidateDocumentDefaultView.as_view(), name="documents-default"),
    path("documents/<int:pk>/versions/", CandidateDocumentVersionView.as_view(), name="documents-versions"),
    path("cvs/", CandidateDocumentListView.as_view(), name="cvs-list"),
    path("cvs/<int:pk>/", CandidateDocumentDetailView.as_view(), name="cvs-detail"),
    path("cvs/<int:pk>/default/", CandidateDocumentDefaultView.as_view(), name="cvs-default"),
    path("cvs/<int:pk>/versions/", CandidateDocumentVersionView.as_view(), name="cvs-versions"),

    # 3. Quản lý việc làm đã lưu
    path("bookmarked-jobs/", JobBookmarkListView.as_view(), name="bookmarked-jobs"),
    path("bookmarked-jobs/ids/", JobBookmarkIdsView.as_view(), name="bookmarked-job-ids"),
    path("jobs/<int:pk>/bookmark/", JobBookmarkActionView.as_view(), name="job-bookmark-action"),

    # 4. Ứng tuyển (Applications alias)
    path("applications/", ApplicationMyListView.as_view(), name="candidate-applications-alias"),

    # 5. Job Alerts
    path("job-alerts/", JobAlertListView.as_view(), name="job-alerts-list"),
    path("job-alerts/<int:pk>/", JobAlertListView.as_view(), name="job-alerts-detail"),

    # 6. Lịch phỏng vấn (Interviews)
    path("interviews/", CandidateInterviewListView.as_view(), name="candidate-interviews-list"),
    path("interviews/<int:pk>/cancel/", CandidateInterviewCancelView.as_view(), name="candidate-interviews-cancel"),
    path("interviews/<int:pk>/confirm/", CandidateInterviewConfirmView.as_view(), name="candidate-interviews-confirm"),

    # 7. Thư mời nhận việc (Offers)
    path("offers/", CandidateOffersView.as_view(), name="candidate-offers-list"),
    path("offers/<int:pk>/", CandidateOfferDetailView.as_view(), name="candidate-offers-detail"),
    path("offers/<int:pk>/accept/", CandidateOfferAcceptView.as_view(), name="candidate-offers-accept"),
    path("offers/<int:pk>/decline/", CandidateOfferDeclineView.as_view(), name="candidate-offers-decline"),

    # 8. Bài kiểm tra năng lực (Assessment & Tests)
    path("tests/", CandidateTestListView.as_view(), name="candidate-tests-list"),
    path("tests/<int:pk>/", CandidateTestDetailView.as_view(), name="candidate-tests-detail"),
    path("tests/<int:pk>/start/", CandidateTestStartView.as_view(), name="candidate-tests-start"),
    path("test-attempts/<int:pk>/save/", CandidateTestSaveView.as_view(), name="candidate-test-attempts-save"),
    path("test-attempts/<int:pk>/submit/", CandidateTestSubmitView.as_view(), name="candidate-test-attempts-submit"),
    path("test-attempts/", CandidateTestAttemptListView.as_view(), name="candidate-test-attempts-list"),
    path("test-attempts/<int:pk>/", CandidateTestAttemptDetailView.as_view(), name="candidate-test-attempts-detail"),
]
