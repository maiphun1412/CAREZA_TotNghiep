"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db import connection

from apps.authentication.models import Users
from apps.company.models import Companies
from apps.candidate.models import Cvs
from apps.recruitment.models import Jobs, Applications

@api_view(['GET'])
@permission_classes([AllowAny])
def api_root_view(request):
    """
    Careza Backend Root Status & Health Check API
    """
    db_connected = False
    try:
        connection.ensure_connection()
        db_connected = True
    except Exception:
        db_connected = False

    return Response({
        "status": "online",
        "service": "CAREZA Recruitment Backend API",
        "version": "1.0.0",
        "database": {
            "name": connection.settings_dict.get('NAME', 'CAREZA'),
            "status": "connected" if db_connected else "disconnected",
            "schemas_count": 10,
            "total_mapped_models": 70,
            "records": {
                "users": Users.objects.count(),
                "companies": Companies.objects.count(),
                "cvs": Cvs.objects.count(),
                "jobs": Jobs.objects.count(),
                "applications": Applications.objects.count(),
            }
        },
        "cors_origins": request.META.get('HTTP_ORIGIN', 'direct'),
    })

from apps.candidate.views import (
    JobsPublicListView,
    JobPublicDetailView,
    ApplicationCandidateView,
    ApplicationMyListView,
    ApplicationDetailCandidateView,
    ApplicationHistoryCandidateView,
    ApplicationWithdrawView,
    NotificationListView,
    NotificationReadActionView,
    NotificationReadAllActionView,
    CompanyFollowActionView,
    CompanyFollowingListView,
    PublicLandingView,
)

urlpatterns = [
    path('', api_root_view, name='api-root'),
    path('api/', api_root_view, name='api-status'),
    path('api/public/landing/', PublicLandingView.as_view(), name='public-landing'),
    path('api/auth/', include('apps.authentication.urls', namespace='authentication')),

    # Candidate Module URLs
    path('api/candidate/', include('apps.candidate.urls', namespace='candidate')),
    path('api/candidates/', include('apps.candidate.urls', namespace='candidates')),

    # Jobs Public & Search URLs
    path('api/jobs/', JobsPublicListView.as_view(), name='jobs-list'),
    path('api/jobs/<int:pk>/', JobPublicDetailView.as_view(), name='jobs-detail'),

    # Applications Candidate URLs
    path('api/applications/', ApplicationCandidateView.as_view(), name='applications-create'),
    path('api/applications/me/', ApplicationMyListView.as_view(), name='applications-me'),
    path('api/applications/<int:pk>/', ApplicationDetailCandidateView.as_view(), name='applications-detail'),
    path('api/applications/<int:pk>/history/', ApplicationHistoryCandidateView.as_view(), name='applications-history'),
    path('api/applications/<int:pk>/withdraw/', ApplicationWithdrawView.as_view(), name='applications-withdraw'),

    # Notifications URLs
    path('api/notifications/', NotificationListView.as_view(), name='notifications-list'),
    path('api/notifications/<int:pk>/read/', NotificationReadActionView.as_view(), name='notifications-read'),
    path('api/notifications/read-all/', NotificationReadAllActionView.as_view(), name='notifications-read-all'),

    # Company Following URLs
    path('api/companies/<int:pk>/follow/', CompanyFollowActionView.as_view(), name='companies-follow'),
    path('api/companies/following/', CompanyFollowingListView.as_view(), name='companies-following'),

    # Employer Module (Company & Recruitment) URLs
    path('api/companies/', include('apps.company.urls', namespace='company')),
    path('api/companies/', include('apps.recruitment.urls', namespace='recruitment-company')),

    # Admin Portal URLs
    path('api/admin/', include('apps.system.urls', namespace='system-admin')),

    # Billing & Payment URLs
    path('api/billing/', include('apps.billing.urls', namespace='billing')),

    # AI Intelligence URLs
    path('api/ai/', include('apps.intelligence.urls', namespace='intelligence')),

    # Interaction, Messaging & Notifications URLs
    path('api/interaction/', include('apps.interaction.urls', namespace='interaction')),

    path('admin/', admin.site.urls),
]






