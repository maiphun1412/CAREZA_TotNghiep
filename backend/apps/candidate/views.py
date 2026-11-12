from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.exceptions import ValidationError

from apps.authentication.authentication import JWTAuthentication
from apps.authentication.permissions import IsAuthenticatedCustom, IsCandidate
from apps.candidate.services.candidate_service import CandidateService
from apps.candidate.serializers import (
    CandidateProfileUpdateSerializer,
    EducationSerializer,
    ExperienceSerializer,
    SkillAddSerializer,
    CertificateSerializer,
    ProjectSerializer,
    JobPreferenceSerializer,
    CvCreateUpdateSerializer,
    CvVersionCreateSerializer,
    ApplicationCreateSerializer,
    WithdrawApplicationSerializer,
    JobAlertCreateSerializer,
)


# ==========================================
# 1. Hồ sơ ứng viên (Profile, Học vấn, Kinh nghiệm, Kỹ năng)
# ==========================================
class CandidateProfileMeView(APIView):
    """
    Xem và cập nhật thông tin hồ sơ cá nhân của ứng viên đang đăng nhập.
    GET/PATCH /api/candidates/me/
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsCandidate]

    def get(self, request):
        data = CandidateService.get_full_profile(request.user.id)
        return Response({
            "success": True,
            "message": "Lấy thông tin hồ sơ thành công.",
            "data": {
                "candidate": data,
            },
        }, status=status.HTTP_200_OK)

    def patch(self, request):
        serializer = CandidateProfileUpdateSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Dữ liệu cập nhật hồ sơ không hợp lệ.",
                "errors": serializer.errors,
            }, status=status.HTTP_400_BAD_REQUEST)

        updated_profile = CandidateService.update_profile(request.user.id, serializer.validated_data)
        return Response({
            "success": True,
            "message": "Cập nhật hồ sơ cá nhân thành công.",
            "data": {
                "candidate": updated_profile,
            },
        }, status=status.HTTP_200_OK)


class CandidateEducationView(APIView):
    """Quản lý học vấn của ứng viên."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsCandidate]

    def post(self, request):
        serializer = EducationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        result = CandidateService.add_education(request.user.id, serializer.validated_data)
        return Response({"success": True, "message": "Thêm học vấn thành công.", "data": {"education": result}}, status=status.HTTP_201_CREATED)

    def patch(self, request, pk):
        serializer = EducationSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        result = CandidateService.update_education(request.user.id, int(pk), serializer.validated_data)
        return Response({"success": True, "message": "Cập nhật học vấn thành công.", "data": {"education": result}}, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        CandidateService.delete_education(request.user.id, int(pk))
        return Response({"success": True, "message": "Xóa học vấn thành công.", "data": None}, status=status.HTTP_200_OK)


class CandidateExperienceView(APIView):
    """Quản lý kinh nghiệm làm việc."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsCandidate]

    def post(self, request):
        serializer = ExperienceSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        result = CandidateService.add_experience(request.user.id, serializer.validated_data)
        return Response({"success": True, "message": "Thêm kinh nghiệm thành công.", "data": {"experience": result}}, status=status.HTTP_201_CREATED)

    def patch(self, request, pk):
        serializer = ExperienceSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        result = CandidateService.update_experience(request.user.id, int(pk), serializer.validated_data)
        return Response({"success": True, "message": "Cập nhật kinh nghiệm thành công.", "data": {"experience": result}}, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        CandidateService.delete_experience(request.user.id, int(pk))
        return Response({"success": True, "message": "Xóa kinh nghiệm thành công.", "data": None}, status=status.HTTP_200_OK)


class CandidateSkillView(APIView):
    """Quản lý kỹ năng của ứng viên."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsCandidate]

    def post(self, request):
        serializer = SkillAddSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        result = CandidateService.add_skill(request.user.id, serializer.validated_data)
        return Response({"success": True, "message": "Thêm kỹ năng thành công.", "data": result}, status=status.HTTP_201_CREATED)

    def delete(self, request, pk):
        CandidateService.delete_skill(request.user.id, int(pk))
        return Response({"success": True, "message": "Xóa kỹ năng thành công.", "data": None}, status=status.HTTP_200_OK)


class CandidateCertificateView(APIView):
    """Quản lý chứng chỉ."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsCandidate]

    def post(self, request):
        serializer = CertificateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        result = CandidateService.add_certificate(request.user.id, serializer.validated_data)
        return Response({"success": True, "message": "Thêm chứng chỉ thành công.", "data": result}, status=status.HTTP_201_CREATED)

    def delete(self, request, pk):
        CandidateService.delete_certificate(request.user.id, int(pk))
        return Response({"success": True, "message": "Xóa chứng chỉ thành công.", "data": None}, status=status.HTTP_200_OK)


class CandidateProjectView(APIView):
    """Quản lý dự án cá nhân."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsCandidate]

    def post(self, request):
        serializer = ProjectSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        result = CandidateService.add_project(request.user.id, serializer.validated_data)
        return Response({"success": True, "message": "Thêm dự án thành công.", "data": result}, status=status.HTTP_201_CREATED)

    def delete(self, request, pk):
        CandidateService.delete_project(request.user.id, int(pk))
        return Response({"success": True, "message": "Xóa dự án thành công.", "data": None}, status=status.HTTP_200_OK)


class CandidatePreferenceView(APIView):
    """Nguyện vọng tìm việc."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsCandidate]

    def put(self, request):
        serializer = JobPreferenceSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        result = CandidateService.update_preferences(request.user.id, serializer.validated_data)
        return Response({"success": True, "message": "Lưu nguyện vọng thành công.", "data": result}, status=status.HTTP_200_OK)


# ==========================================
# 2. Quản lý CV & Tài liệu (CVs & Documents)
# ==========================================
class CandidateDocumentListView(APIView):
    """
    Danh sách và tạo mới CV / Tài liệu của ứng viên.
    GET/POST /api/candidate/documents/ hoặc /api/candidates/cvs/
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsCandidate]

    def get(self, request):
        cvs = CandidateService.get_cv_list(request.user.id)
        return Response({
            "success": True,
            "message": "Lấy danh sách CV thành công.",
            "data": {
                "documents": cvs,
                "cvs": cvs,
            },
        }, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = CvCreateUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        try:
            result = CandidateService.create_cv(request.user.id, serializer.validated_data)
            return Response({
                "success": True,
                "message": "Tạo mới CV thành công.",
                "data": {
                    "document": result,
                    "cv": result,
                },
            }, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            msg = e.detail if isinstance(e.detail, str) else (e.detail[0] if isinstance(e.detail, list) else str(e.detail))
            return Response({
                "success": False,
                "message": msg,
                "errors": {"limit": [msg]},
            }, status=status.HTTP_400_BAD_REQUEST)


class CandidateDocumentDetailView(APIView):
    """
    Xem chi tiết, cập nhật và xóa CV.
    GET/PATCH/DELETE /api/candidate/documents/<id>/
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsCandidate]

    def get(self, request, pk):
        result = CandidateService.get_cv_detail(request.user.id, int(pk))
        return Response({
            "success": True,
            "message": "Chi tiết CV.",
            "data": {"document": result, "cv": result},
        }, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        serializer = CvCreateUpdateSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        result = CandidateService.update_cv(request.user.id, int(pk), serializer.validated_data)
        return Response({
            "success": True,
            "message": "Cập nhật CV thành công.",
            "data": {"document": result, "cv": result},
        }, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        CandidateService.delete_cv(request.user.id, int(pk))
        return Response({
            "success": True,
            "message": "Đã xóa CV thành công.",
            "data": None,
        }, status=status.HTTP_200_OK)


class CandidateDocumentDefaultView(APIView):
    """
    Đặt làm CV mặc định.
    PATCH /api/candidate/documents/<id>/default/
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsCandidate]

    def patch(self, request, pk):
        result = CandidateService.set_default_cv(request.user.id, int(pk))
        return Response({
            "success": True,
            "message": "Đã đặt làm CV mặc định.",
            "data": {"document": result, "cv": result},
        }, status=status.HTTP_200_OK)


class CandidateDocumentVersionView(APIView):
    """
    Tạo phiên bản mới cho CV.
    POST /api/candidate/documents/<id>/versions/
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsCandidate]

    def post(self, request, pk):
        serializer = CvVersionCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        result = CandidateService.create_cv_version(request.user.id, int(pk), serializer.validated_data)
        return Response({
            "success": True,
            "message": "Tạo phiên bản mới thành công.",
            "data": {"version": result},
        }, status=status.HTTP_201_CREATED)


# ==========================================
# 3. Tìm kiếm việc làm, Lưu việc & Theo dõi công ty
# ==========================================
class JobsPublicListView(APIView):
    """
    Tìm kiếm, lọc và phân trang tin tuyển dụng.
    GET /api/jobs/
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [AllowAny]

    def get(self, request):
        user_id = request.user.id if request.user and request.user.is_authenticated else None
        result = CandidateService.search_jobs(request.query_params, user_id=user_id)
        return Response({
            "success": True,
            "message": "Danh sách tin tuyển dụng.",
            "data": result,
        }, status=status.HTTP_200_OK)


class JobPublicDetailView(APIView):
    """
    Xem chi tiết tin tuyển dụng.
    GET /api/jobs/<id>/
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [AllowAny]

    def get(self, request, pk):
        user_id = request.user.id if request.user and request.user.is_authenticated else None
        result = CandidateService.get_job_detail(int(pk), user_id=user_id)
        return Response({
            "success": True,
            "message": "Chi tiết tin tuyển dụng.",
            "data": {"job": result},
        }, status=status.HTTP_200_OK)


class JobBookmarkListView(APIView):
    """
    Danh sách công việc đã lưu của ứng viên.
    GET /api/candidate/bookmarked-jobs/
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsCandidate]

    def get(self, request):
        result = CandidateService.get_bookmarked_jobs(request.user.id, request.query_params)
        return Response({
            "success": True,
            "message": "Danh sách việc làm đã lưu.",
            "data": result,
        }, status=status.HTTP_200_OK)


class JobBookmarkIdsView(APIView):
    """Lấy danh sách các ID tin tuyển dụng đã lưu."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsCandidate]

    def get(self, request):
        ids = CandidateService.get_bookmarked_job_ids(request.user.id)
        return Response({
            "success": True,
            "data": {"ids": ids},
        }, status=status.HTTP_200_OK)


class JobBookmarkActionView(APIView):
    """
    Lưu hoặc bỏ lưu một tin tuyển dụng.
    POST/DELETE /api/candidate/jobs/<id>/bookmark/
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsCandidate]

    def post(self, request, pk):
        CandidateService.save_job_bookmark(request.user.id, int(pk))
        return Response({
            "success": True,
            "message": "Đã lưu tin tuyển dụng.",
            "data": {"saved": True},
        }, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        CandidateService.remove_job_bookmark(request.user.id, int(pk))
        return Response({
            "success": True,
            "message": "Đã bỏ lưu tin tuyển dụng.",
            "data": {"removed": True},
        }, status=status.HTTP_200_OK)


class CompanyFollowActionView(APIView):
    """
    Theo dõi hoặc bỏ theo dõi doanh nghiệp.
    POST/DELETE /api/companies/<id>/follow/
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsCandidate]

    def post(self, request, pk):
        CandidateService.follow_company(request.user.id, int(pk))
        return Response({
            "success": True,
            "message": "Đã theo dõi doanh nghiệp.",
            "data": {"following": True},
        }, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        CandidateService.unfollow_company(request.user.id, int(pk))
        return Response({
            "success": True,
            "message": "Đã bỏ theo dõi doanh nghiệp.",
            "data": {"following": False},
        }, status=status.HTTP_200_OK)


class CompanyFollowingListView(APIView):
    """Danh sách các doanh nghiệp ứng viên đang theo dõi."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsCandidate]

    def get(self, request):
        companies = CandidateService.get_following_companies(request.user.id)
        return Response({
            "success": True,
            "data": {"companies": companies},
        }, status=status.HTTP_200_OK)


# ==========================================
# 4. Ứng tuyển & Quản lý đơn ứng tuyển
# ==========================================
class ApplicationCandidateView(APIView):
    """
    Nộp hồ sơ ứng tuyển bằng CV.
    POST /api/applications/
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsCandidate]

    def post(self, request):
        serializer = ApplicationCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        result = CandidateService.apply_job(request.user.id, serializer.validated_data)
        return Response({
            "success": True,
            "message": "Nộp đơn ứng tuyển thành công!",
            "data": {"application": result},
        }, status=status.HTTP_201_CREATED)


class ApplicationMyListView(APIView):
    """
    Xem danh sách tất cả các đơn ứng tuyển của tôi.
    GET /api/applications/me/
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsCandidate]

    def get(self, request):
        apps = CandidateService.get_my_applications(request.user.id)
        return Response({
            "success": True,
            "message": "Danh sách đơn ứng tuyển.",
            "data": {"applications": apps},
        }, status=status.HTTP_200_OK)


class ApplicationDetailCandidateView(APIView):
    """
    Xem chi tiết trạng thái đơn ứng tuyển.
    GET /api/applications/<id>/
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsCandidate]

    def get(self, request, pk):
        result = CandidateService.get_application_detail(request.user.id, int(pk))
        return Response({
            "success": True,
            "data": {"application": result},
        }, status=status.HTTP_200_OK)


class ApplicationHistoryCandidateView(APIView):
    """
    Xem dòng thời gian / lịch sử trạng thái của đơn ứng tuyển.
    GET /api/applications/<id>/history/
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsCandidate]

    def get(self, request, pk):
        result = CandidateService.get_application_detail(request.user.id, int(pk))
        return Response({
            "success": True,
            "data": {"histories": result.get("histories", [])},
        }, status=status.HTTP_200_OK)


class ApplicationWithdrawView(APIView):
    """
    Rút đơn ứng tuyển.
    POST /api/applications/<id>/withdraw/
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsCandidate]

    def post(self, request, pk):
        serializer = WithdrawApplicationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        result = CandidateService.withdraw_application(
            request.user.id, int(pk), reason=serializer.validated_data.get("reason", "")
        )
        return Response({
            "success": True,
            "message": result["message"],
            "data": result,
        }, status=status.HTTP_200_OK)


# ==========================================
# 5. Thông báo & Quản lý Job Alerts
# ==========================================
class NotificationListView(APIView):
    """
    Danh sách thông báo của người dùng.
    GET /api/notifications/
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def get(self, request):
        result = CandidateService.get_notifications(request.user.id, request.query_params)
        return Response({
            "success": True,
            "data": result,
        }, status=status.HTTP_200_OK)


class NotificationReadActionView(APIView):
    """
    Đánh dấu thông báo đã đọc.
    PATCH /api/notifications/<id>/read/
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def patch(self, request, pk):
        CandidateService.mark_notification_read(request.user.id, int(pk))
        return Response({"success": True, "message": "Đã đánh dấu thông báo.", "data": None}, status=status.HTTP_200_OK)


class NotificationReadAllActionView(APIView):
    """
    Đánh dấu tất cả thông báo đã đọc.
    POST /api/notifications/read-all/
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def post(self, request):
        count = CandidateService.mark_all_notifications_read(request.user.id)
        return Response({"success": True, "message": f"Đã đánh dấu {count} thông báo.", "data": {"count": count}}, status=status.HTTP_200_OK)


class JobAlertListView(APIView):
    """Quản lý thông báo việc làm (Job Alerts)."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsCandidate]

    def get(self, request):
        alerts = CandidateService.get_job_alerts(request.user.id)
        return Response({"success": True, "data": {"alerts": alerts}}, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = JobAlertCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        result = CandidateService.create_job_alert(request.user.id, serializer.validated_data)
        return Response({"success": True, "message": "Đã lưu cài đặt thông báo việc làm.", "data": result}, status=status.HTTP_201_CREATED)

    def delete(self, request, pk):
        CandidateService.delete_job_alert(request.user.id, int(pk))
        return Response({"success": True, "message": "Đã xóa thông báo việc làm.", "data": None}, status=status.HTTP_200_OK)


class PublicLandingView(APIView):
    """
    Thống kê tổng quan, top doanh nghiệp, danh mục ngành nghề cho trang chủ công khai.
    GET /api/public/landing/
    """
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        from apps.company.models import Companies
        from apps.system.models import Industries
        from apps.recruitment.models import Jobs, Applications
        from apps.authentication.models import Users

        total_jobs = Jobs.objects.filter(status="published").count()
        total_companies = Companies.objects.count()
        total_candidates = Users.objects.filter(account_type="candidate").count()
        total_applications = Applications.objects.count()

        # Top đối tác doanh nghiệp thực tế có logo hoặc tên
        companies_qs = Companies.objects.all().order_by("-id")[:12]
        partners = []
        for c in companies_qs:
            partners.append({
                "id": c.id,
                "name": c.name,
                "slug": c.slug,
                "logo": c.logo_url or "https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=120&h=120&q=80",
            })

        # Danh mục ngành nghề kèm số lượng việc làm thật
        industries_qs = Industries.objects.all()[:8]
        categories = []
        for ind in industries_qs:
            cnt = Jobs.objects.filter(industry_id=ind.id).count()
            categories.append({
                "id": ind.id,
                "name": ind.name,
                "slug": ind.slug,
                "jobs_count": cnt,
            })

        return Response({
            "success": True,
            "data": {
                "stats": {
                    "total_jobs": total_jobs,
                    "total_companies": total_companies,
                    "total_candidates": total_candidates,
                    "total_applications": total_applications,
                },
                "partners": partners,
                "categories": categories,
            }
        }, status=status.HTTP_200_OK)


class CandidateDashboardView(APIView):
    """
    Thống kê KPI, tiến trình ứng tuyển, CVs, phỏng vấn và gợi ý của ứng viên hiện tại.
    GET /api/candidate/dashboard/
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsCandidate]

    def get(self, request):
        user_id = request.user.id
        from django.utils import timezone
        from apps.candidate.models import Cvs, Profiles, Experiences, Educations
        from apps.interaction.models import SavedJobs
        from apps.recruitment.models import Applications, Interviews, Jobs

        profile = Profiles.objects.filter(user_id=user_id).first()
        cv_qs = Cvs.objects.filter(profile=profile) if profile else Cvs.objects.none()
        cv_count = cv_qs.count()
        saved_jobs_qs = SavedJobs.objects.filter(user_id=user_id)
        saved_jobs_count = saved_jobs_qs.count()

        applied_qs = Applications.objects.filter(candidate=profile) if profile else Applications.objects.none()
        total_applied = applied_qs.count()

        # Số cuộc phỏng vấn
        interview_qs = Interviews.objects.filter(application__candidate=profile) if profile else Interviews.objects.none()
        interview_count = interview_qs.count()

        # Tiến trình hoàn thiện hồ sơ thực tế
        completion = 20
        if profile:
            if request.user.full_name and request.user.phone:
                completion += 20
            if profile.bio:
                completion += 10
            if Educations.objects.filter(profile=profile).exists():
                completion += 25
            if Experiences.objects.filter(profile=profile).exists():
                completion += 25
        completion = min(100, completion)

        # 5 ứng tuyển gần nhất
        recent_apps = []
        if profile:
            for app in applied_qs.select_related("job", "job__company").order_by("-applied_at")[:5]:
                recent_apps.append({
                    "id": app.id,
                    "job_id": app.job.id,
                    "job_title": app.job.title,
                    "company_name": app.job.company.name if app.job.company else "Doanh nghiệp",
                    "company_logo": app.job.company.logo_url if app.job.company else None,
                    "status": app.status,
                    "applied_at": app.applied_at,
                })

        # Danh sách CV thực tế (lấy 3 CV mới nhất)
        recent_cvs = []
        if profile:
            for cv in cv_qs.order_by("-id")[:3]:
                recent_cvs.append({
                    "id": cv.id,
                    "title": cv.title or "Bản CV ứng tuyển",
                    "file_url": cv.file_url,
                    "is_primary": bool(cv.is_primary),
                    "created_at": cv.created_at,
                })

        # Lịch phỏng vấn sắp tới
        upcoming_interviews = []
        if profile:
            for iv in interview_qs.select_related("application__job", "application__job__company").order_by("scheduled_at")[:3]:
                upcoming_interviews.append({
                    "id": iv.id,
                    "job_title": iv.application.job.title if iv.application and iv.application.job else "Phỏng vấn ứng tuyển",
                    "company_name": iv.application.job.company.name if iv.application and iv.application.job and iv.application.job.company else "Nhà tuyển dụng",
                    "company_logo": iv.application.job.company.logo_url if iv.application and iv.application.job and iv.application.job.company else None,
                    "scheduled_at": iv.scheduled_at,
                    "mode": iv.mode or "Online",
                    "meeting_url": iv.meeting_url,
                    "status": iv.status or "scheduled",
                })

        # Việc làm phù hợp (lấy 3 jobs mới nhất thực tế từ DB)
        matching_jobs = []
        for j in Jobs.objects.filter(status="published").select_related("company").order_by("-created_at")[:3]:
            # Định dạng lương
            salary_str = "Thoả thuận"
            if j.salary_min and j.salary_max:
                salary_str = f"{int(j.salary_min / 1_000_000)} - {int(j.salary_max / 1_000_000)} triệu"
            elif j.salary_min:
                salary_str = f"Từ {int(j.salary_min / 1_000_000)} triệu"
            elif j.salary_max:
                salary_str = f"Đến {int(j.salary_max / 1_000_000)} triệu"

            from apps.system.models import Locations
            loc_name = "Toàn quốc"
            if j.location_id:
                loc_obj = Locations.objects.filter(id=j.location_id).first()
                if loc_obj and loc_obj.city:
                    loc_name = loc_obj.city

            tags = [t for t in [j.employment_type, j.work_mode] if t]
            matching_jobs.append({
                "id": j.id,
                "title": j.title,
                "company_name": j.company.name if j.company else "Doanh nghiệp",
                "company_logo": j.company.logo_url if j.company else None,
                "location": loc_name,
                "salary": salary_str,
                "tags": tags,
                "created_at": j.created_at,
            })

        # Tổng hợp hoạt động gần đây
        recent_activities = []
        for app in recent_apps[:3]:
            recent_activities.append({
                "type": "applied",
                "title": f"Đã ứng tuyển vào {app['job_title']} - {app['company_name']}",
                "timestamp": app["applied_at"],
            })
        for sj in saved_jobs_qs.order_by("-created_at")[:2]:
            sj_job = Jobs.objects.filter(id=sj.job_id).select_related("company").first()
            if sj_job:
                cname = sj_job.company.name if sj_job.company else ""
                recent_activities.append({
                    "type": "saved",
                    "title": f"Đã lưu việc {sj_job.title} - {cname}",
                    "timestamp": sj.created_at,
                })
        for cv in recent_cvs[:2]:
            recent_activities.append({
                "type": "cv",
                "title": f"Đã tạo/cập nhật CV: {cv['title']}",
                "timestamp": cv["created_at"],
            })
        # Sort activities theo thời gian
        recent_activities.sort(key=lambda x: str(x.get("timestamp") or ""), reverse=True)

        return Response({
            "success": True,
            "data": {
                "stats": {
                    "cv_count": cv_count,
                    "applied_count": total_applied,
                    "saved_jobs_count": saved_jobs_count,
                    "interview_count": interview_count,
                    "profile_completion": completion,
                },
                "recent_applications": recent_apps,
                "recent_cvs": recent_cvs,
                "upcoming_interviews": upcoming_interviews,
                "matching_jobs": matching_jobs,
                "recent_activities": recent_activities[:5],
            }
        }, status=status.HTTP_200_OK)


class CandidateInterviewListView(APIView):
    """Lấy danh sách các cuộc phỏng vấn của ứng viên."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsCandidate]

    def get(self, request):
        interviews = CandidateService.get_candidate_interviews(request.user.id)
        return Response({
            "success": True,
            "data": {"interviews": interviews}
        }, status=status.HTTP_200_OK)


class CandidateInterviewCancelView(APIView):
    """Hủy lịch phỏng vấn của ứng viên."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsCandidate]

    def post(self, request, pk):
        reason = request.data.get("reason", "") if isinstance(request.data, dict) else ""
        result = CandidateService.cancel_candidate_interview(request.user.id, int(pk), reason)
        return Response({
            "success": True,
            "message": "Đã hủy lịch phỏng vấn thành công.",
            "data": result
        }, status=status.HTTP_200_OK)


class CandidateInterviewConfirmView(APIView):
    """Ứng viên xác nhận tham gia buổi phỏng vấn."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsCandidate]

    def post(self, request, pk):
        result = CandidateService.confirm_candidate_interview(request.user.id, int(pk))
        return Response({
            "success": True,
            "message": "Đã xác nhận tham gia phỏng vấn thành công.",
            "data": result
        }, status=status.HTTP_200_OK)


# ==========================================
# 7. Quản lý Thư mời nhận việc (Offers) phía Ứng viên
# ==========================================
class CandidateOffersView(APIView):
    """Lấy danh sách các Thư mời nhận việc gửi tới ứng viên."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsCandidate]

    def get(self, request):
        offers = CandidateService.get_candidate_offers(request.user.id)
        return Response({
            "success": True,
            "data": {"offers": offers}
        }, status=status.HTTP_200_OK)


class CandidateOfferDetailView(APIView):
    """Xem chi tiết Thư mời nhận việc của ứng viên."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsCandidate]

    def get(self, request, pk):
        offer = CandidateService.get_candidate_offer_detail(request.user.id, int(pk))
        return Response({
            "success": True,
            "data": {"offer": offer}
        }, status=status.HTTP_200_OK)


class CandidateOfferAcceptView(APIView):
    """Ứng viên đồng ý / chấp nhận Thư mời nhận việc."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsCandidate]

    def post(self, request, pk):
        note = request.data.get("note", "") if isinstance(request.data, dict) else ""
        result = CandidateService.accept_candidate_offer(request.user.id, int(pk), note=note)
        return Response({
            "success": True,
            "message": result.get("message", "Đã chấp nhận thư mời nhận việc."),
            "data": result
        }, status=status.HTTP_200_OK)


class CandidateOfferDeclineView(APIView):
    """Ứng viên từ chối Thư mời nhận việc."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsCandidate]

    def post(self, request, pk):
        reason = request.data.get("reason", "") if isinstance(request.data, dict) else ""
        result = CandidateService.decline_candidate_offer(request.user.id, int(pk), reason=reason)
        return Response({
            "success": True,
            "message": result.get("message", "Đã từ chối thư mời nhận việc."),
            "data": result
        }, status=status.HTTP_200_OK)



