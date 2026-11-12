from django.urls import path
from apps.recruitment.views import CompanyDashboardView
from apps.company.views import (
    CompanyMeDetailView,
    CompanyBranchListView,
    CompanyBranchDetailView,
    CompanyMemberListView,
    CompanyMemberDetailView,
    CompanyVerificationView,
    CompanyActivityListView,
    CompanyPublicListView,
    CompanyPublicDetailView,
)

app_name = "company"

urlpatterns = [
    path("me/", CompanyMeDetailView.as_view(), name="company-me"),
    path("me/dashboard/", CompanyDashboardView.as_view(), name="company-dashboard"),
    path("me/branches/", CompanyBranchListView.as_view(), name="branches-list"),
    path("me/branches/<int:pk>/", CompanyBranchDetailView.as_view(), name="branches-detail"),
    path("me/members/", CompanyMemberListView.as_view(), name="members-list"),
    path("me/members/<int:pk>/", CompanyMemberDetailView.as_view(), name="members-detail"),
    path("me/verification/", CompanyVerificationView.as_view(), name="verification"),
    path("me/activities/", CompanyActivityListView.as_view(), name="activities-list"),
    path("", CompanyPublicListView.as_view(), name="public-company-list"),
    path("<str:pk>/", CompanyPublicDetailView.as_view(), name="public-company-detail"),
]


