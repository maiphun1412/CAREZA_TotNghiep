from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

from apps.authentication.authentication import JWTAuthentication
from apps.authentication.permissions import IsAuthenticatedCustom, IsEmployer, HasCompanyAccess
from apps.recruitment.services.employer_recruitment_service import EmployerRecruitmentService
from apps.recruitment.serializers import (
    JobCreateUpdateSerializer,
    ApplicationStageUpdateSerializer,
    ApplicationRejectSerializer,
    InterviewScheduleSerializer,
    ScorecardCreateSerializer,
    OfferCreateSerializer,
    TestCreateSerializer,
    TalentPoolCreateSerializer,
    TalentPoolAddCandidateSerializer,
    CompanyManualCandidateSerializer,
)


# ==========================================
# 1. Quản lý Tin tuyển dụng (Jobs)
# ==========================================
class CompanyJobListView(APIView):
    """Danh sách & tạo tin tuyển dụng của doanh nghiệp."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsEmployer, HasCompanyAccess]

    def get(self, request):
        res = EmployerRecruitmentService.get_company_jobs(request.user.id, request.query_params)
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = JobCreateUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        job = EmployerRecruitmentService.create_job(request.user.id, serializer.validated_data)
        return Response({
            "success": True,
            "message": "Tạo tin tuyển dụng thành công.",
            "data": {"job": job},
        }, status=status.HTTP_201_CREATED)


class CompanyJobDetailView(APIView):
    """Chi tiết & cập nhật tin tuyển dụng."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsEmployer, HasCompanyAccess]

    def get(self, request, pk):
        job = EmployerRecruitmentService.get_job_detail(request.user.id, int(pk))
        return Response({"success": True, "data": {"job": job}}, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        serializer = JobCreateUpdateSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        job = EmployerRecruitmentService.update_job(request.user.id, int(pk), serializer.validated_data)
        return Response({
            "success": True,
            "message": "Cập nhật tin tuyển dụng thành công.",
            "data": {"job": job},
        }, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        res = EmployerRecruitmentService.delete_job(request.user.id, int(pk))
        return Response({
            "success": True,
            "message": res.get("message", "Đã xóa tin tuyển dụng thành công."),
            "data": res,
        }, status=status.HTTP_200_OK)


# ==========================================
# 2. Quản lý Đơn ứng tuyển (Applications)
# ==========================================
class CompanyApplicationListView(APIView):
    """Danh sách & tạo mới hồ sơ ứng tuyển của doanh nghiệp."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsEmployer, HasCompanyAccess]

    def get(self, request):
        res = EmployerRecruitmentService.get_company_applications(request.user.id, request.query_params)
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = CompanyManualCandidateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        file_obj = request.FILES.get("file") or request.FILES.get("cv_file")
        res = EmployerRecruitmentService.add_manual_candidate(
            request.user.id,
            serializer.validated_data,
            file_obj=file_obj
        )
        return Response({
            "success": True,
            "message": "Thêm ứng viên thành công.",
            "data": res
        }, status=status.HTTP_201_CREATED)


class CompanyApplicationDetailView(APIView):
    """Chi tiết một hồ sơ ứng tuyển."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsEmployer, HasCompanyAccess]

    def get(self, request, pk):
        app_data = EmployerRecruitmentService.get_application_detail(request.user.id, int(pk))
        return Response({"success": True, "data": {"application": app_data}}, status=status.HTTP_200_OK)


class CompanyApplicationStageView(APIView):
    """Chuyển trạng thái / vòng tuyển dụng cho hồ sơ."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsEmployer, HasCompanyAccess]

    def post(self, request, pk):
        serializer = ApplicationStageUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        res = EmployerRecruitmentService.update_application_stage(
            request.user.id,
            int(pk),
            serializer.validated_data["final_status"],
            serializer.validated_data.get("note", ""),
        )
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        return self.post(request, pk)


class CompanyApplicationRejectView(APIView):
    """Từ chối hồ sơ ứng tuyển."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsEmployer, HasCompanyAccess]

    def post(self, request, pk):
        serializer = ApplicationRejectSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        res = EmployerRecruitmentService.update_application_stage(
            request.user.id,
            int(pk),
            "rejected",
            serializer.validated_data.get("reason", "Hồ sơ chưa phù hợp."),
        )
        return Response({"success": True, "message": "Đã từ chối ứng viên.", "data": res}, status=status.HTTP_200_OK)


class CompanyApplicationHireView(APIView):
    """Chấp thuận tiếp nhận ứng viên."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsEmployer, HasCompanyAccess]

    def post(self, request, pk):
        res = EmployerRecruitmentService.update_application_stage(
            request.user.id,
            int(pk),
            "hired",
            "Đã đồng ý tiếp nhận ứng viên.",
        )
        return Response({"success": True, "message": "Đã tiếp nhận ứng viên vào vị trí.", "data": res}, status=status.HTTP_200_OK)


# ==========================================
# 3. Phỏng vấn, Đánh giá & Offer
# ==========================================
class CompanyInterviewListView(APIView):
    """Danh sách & lên lịch phỏng vấn."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsEmployer, HasCompanyAccess]

    def get(self, request):
        interviews = EmployerRecruitmentService.get_company_interviews(request.user.id)
        return Response({"success": True, "data": {"interviews": interviews}}, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = InterviewScheduleSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        res = EmployerRecruitmentService.schedule_interview(request.user.id, serializer.validated_data)
        return Response({
            "success": True,
            "message": "Lên lịch phỏng vấn thành công.",
            "data": {"interview": res},
        }, status=status.HTTP_201_CREATED)


class CompanyInterviewDetailView(APIView):
    """Cập nhật / đổi lịch hoặc hủy lịch phỏng vấn."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsEmployer, HasCompanyAccess]

    def patch(self, request, pk):
        res = EmployerRecruitmentService.update_interview(request.user.id, int(pk), request.data)
        return Response({
            "success": True,
            "message": res.get("message", "Cập nhật lịch phỏng vấn thành công."),
            "data": {"interview": res},
        }, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        reason = request.data.get("reason", "") if isinstance(request.data, dict) else ""
        res = EmployerRecruitmentService.cancel_interview(request.user.id, int(pk), reason)
        return Response({
            "success": True,
            "message": res.get("message", "Đã hủy lịch phỏng vấn thành công."),
            "data": res,
        }, status=status.HTTP_200_OK)


class CompanyScorecardView(APIView):
    """Ghi nhận đánh giá / chấm điểm hồ sơ ứng tuyển."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsEmployer, HasCompanyAccess]

    def post(self, request):
        serializer = ScorecardCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        res = EmployerRecruitmentService.add_scorecard(request.user.id, serializer.validated_data)
        return Response({
            "success": True,
            "message": "Lưu phiếu đánh giá ứng viên thành công.",
            "data": {"scorecard": res},
        }, status=status.HTTP_201_CREATED)


class CompanyOfferView(APIView):
    """
    Quản lý Thư mời nhận việc (Offer) phía Doanh nghiệp.
    GET /api/v1/companies/me/offers/ : Danh sách Offer
    POST /api/v1/companies/me/offers/ : Tạo mới hoặc lưu nháp Offer
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsEmployer, HasCompanyAccess]

    def get(self, request):
        result = EmployerRecruitmentService.get_company_offers(request.user.id, request.query_params)
        return Response({"success": True, "data": result}, status=status.HTTP_200_OK)

    def post(self, request):
        res = EmployerRecruitmentService.create_or_update_offer(request.user.id, request.data)
        return Response({
            "success": True,
            "message": res.get("message", "Tạo thư mời nhận việc thành công."),
            "data": {"offer": res},
        }, status=status.HTTP_201_CREATED)


# ==========================================
# 4. Bài kiểm tra năng lực (Tests)
# ==========================================
class CompanyTestListView(APIView):
    """Danh sách & tạo bài test năng lực."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsEmployer, HasCompanyAccess]

    def get(self, request):
        tests = EmployerRecruitmentService.get_company_tests(request.user.id)
        return Response({"success": True, "data": {"tests": tests}}, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = TestCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        res = EmployerRecruitmentService.create_test(request.user.id, serializer.validated_data)
        return Response({
            "success": True,
            "message": "Tạo bài test năng lực thành công.",
            "data": {"test": res},
        }, status=status.HTTP_201_CREATED)


# ==========================================
# 5. Talent Pool (Hồ sơ tiềm năng)
# ==========================================
class CompanyTalentPoolView(APIView):
    """Danh sách & tạo nhóm ứng viên tiềm năng."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsEmployer, HasCompanyAccess]

    def get(self, request):
        pools = EmployerRecruitmentService.get_talent_pools(request.user.id)
        return Response({"success": True, "data": {"talent_pools": pools}}, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = TalentPoolCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        res = EmployerRecruitmentService.create_talent_pool(request.user.id, serializer.validated_data)
        return Response({
            "success": True,
            "message": "Tạo nhóm tài năng thành công.",
            "data": {"talent_pool": res},
        }, status=status.HTTP_201_CREATED)


class CompanyTalentPoolCandidateView(APIView):
    """Thêm hoặc gỡ ứng viên khỏi nhóm tài năng."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsEmployer, HasCompanyAccess]

    def post(self, request, pool_id):
        serializer = TalentPoolAddCandidateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        res = EmployerRecruitmentService.add_candidate_to_pool(
            request.user.id,
            int(pool_id),
            serializer.validated_data["candidate_id"],
            serializer.validated_data.get("notes", ""),
        )
        return Response({
            "success": True,
            "message": "Đã thêm ứng viên vào nhóm tài năng.",
            "data": res,
        }, status=status.HTTP_201_CREATED)

    def delete(self, request, pool_id, candidate_id):
        EmployerRecruitmentService.remove_candidate_from_pool(request.user.id, int(pool_id), int(candidate_id))
        return Response({
            "success": True,
            "message": "Đã gỡ ứng viên khỏi nhóm tài năng.",
            "data": None,
        }, status=status.HTTP_200_OK)


# ==========================================
# 6. Dashboard & Thống kê
# ==========================================
class CompanyDashboardView(APIView):
    """Tổng quan dashboard doanh nghiệp."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsEmployer, HasCompanyAccess]

    def get(self, request):
        data = EmployerRecruitmentService.get_dashboard_summary(request.user.id)
        return Response({"success": True, "data": {"dashboard": data}}, status=status.HTTP_200_OK)


# ==========================================
# 7. Quản lý Bài test năng lực nâng cao (Assessment & Tests)
# ==========================================
from apps.recruitment.services.assessment_service import AssessmentService
from apps.recruitment.serializers import (
    TestUpdateSerializer,
    TestAssignSerializer,
    TestSaveAnswersSerializer,
    TestSubmitAnswersSerializer,
    TestGradeAttemptSerializer,
)


class CompanyTestDetailView(APIView):
    """Xem chi tiết, cập nhật và xóa bài test của công ty."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsEmployer, HasCompanyAccess]

    def get(self, request, pk):
        test_data = AssessmentService.get_company_test_detail(request.user.id, int(pk))
        return Response({"success": True, "data": {"test": test_data}}, status=status.HTTP_200_OK)

    def put(self, request, pk):
        serializer = TestUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        res = AssessmentService.update_company_test(request.user.id, int(pk), serializer.validated_data)
        return Response({"success": True, "message": "Cập nhật bài test thành công.", "data": {"test": res}}, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        return self.put(request, pk)

    def delete(self, request, pk):
        AssessmentService.delete_company_test(request.user.id, int(pk))
        return Response({"success": True, "message": "Xóa bài test thành công."}, status=status.HTTP_200_OK)


class CompanyTestAssignView(APIView):
    """Doanh nghiệp giao bài kiểm tra cho ứng viên hoặc toàn bộ ứng viên của tin tuyển dụng."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsEmployer, HasCompanyAccess]

    def post(self, request, pk):
        serializer = TestAssignSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        res = AssessmentService.assign_test_to_candidates(request.user.id, int(pk), serializer.validated_data)
        return Response({"success": True, "message": res.get("message", "Giao bài kiểm tra thành công."), "data": res}, status=status.HTTP_200_OK)


class CompanyTestAttemptListView(APIView):
    """Doanh nghiệp xem danh sách bài làm của ứng viên nộp cho bài test."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsEmployer, HasCompanyAccess]

    def get(self, request, pk):
        attempts = AssessmentService.get_company_test_attempts(request.user.id, test_id=int(pk))
        return Response({"success": True, "data": {"attempts": attempts}}, status=status.HTTP_200_OK)


class CompanyTestAttemptGradeView(APIView):
    """Doanh nghiệp chấm điểm tự luận hoặc điều chỉnh điểm cho bài làm của ứng viên."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsEmployer, HasCompanyAccess]

    def post(self, request, pk):
        serializer = TestGradeAttemptSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        res = AssessmentService.grade_test_attempt(request.user.id, int(pk), serializer.validated_data)
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        return self.post(request, pk)


# ==========================================
# 8. Ứng viên làm bài kiểm tra năng lực (Candidate Assessment)
# ==========================================
class CandidateTestListView(APIView):
    """Ứng viên xem danh sách bài test được giao hoặc bài test mở."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def get(self, request):
        tests = AssessmentService.get_candidate_tests(request.user.id)
        return Response({"success": True, "data": {"tests": tests}}, status=status.HTTP_200_OK)


class CandidateTestDetailView(APIView):
    """Ứng viên xem chi tiết đề thi bài test (đáp án đúng được bảo mật)."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def get(self, request, pk):
        test_data = AssessmentService.get_candidate_test_detail(request.user.id, int(pk))
        return Response({"success": True, "data": {"test": test_data}}, status=status.HTTP_200_OK)


class CandidateTestStartView(APIView):
    """Ứng viên bắt đầu làm bài test."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def post(self, request, pk):
        app_id = request.data.get("application_id")
        app_id_int = int(app_id) if app_id else None
        res = AssessmentService.start_test_attempt(request.user.id, int(pk), application_id=app_id_int)
        return Response({"success": True, "message": "Bắt đầu làm bài test.", "data": res}, status=status.HTTP_201_CREATED)


class CandidateTestSaveView(APIView):
    """Ứng viên lưu nháp câu trả lời trong quá trình làm bài."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def post(self, request, pk):
        serializer = TestSaveAnswersSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        res = AssessmentService.save_test_attempt_answers(
            request.user.id, int(pk), serializer.validated_data["answers"]
        )
        return Response({"success": True, "message": "Đã lưu câu trả lời.", "data": res}, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        return self.post(request, pk)


class CandidateTestSubmitView(APIView):
    """Ứng viên nộp bài làm và chấm điểm tự động."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def post(self, request, pk):
        serializer = TestSubmitAnswersSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        res = AssessmentService.submit_test_attempt(
            request.user.id,
            int(pk),
            serializer.validated_data.get("answers", []),
            auto_submitted=serializer.validated_data.get("auto_submitted", False),
        )
        return Response({"success": True, "message": "Nộp bài thành công.", "data": res}, status=status.HTTP_200_OK)


class CandidateTestAttemptListView(APIView):
    """Ứng viên xem lịch sử các lần làm bài test."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def get(self, request):
        attempts = AssessmentService.get_candidate_attempts(request.user.id)
        return Response({"success": True, "data": {"attempts": attempts}}, status=status.HTTP_200_OK)


class CandidateTestAttemptDetailView(APIView):
    """Ứng viên xem chi tiết kết quả một lần làm bài test."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def get(self, request, pk):
        attempt_data = AssessmentService.get_attempt_detail(request.user.id, int(pk))
        return Response({"success": True, "data": {"attempt": attempt_data}}, status=status.HTTP_200_OK)


# ==========================================
# 7. Quản lý Thư mời nhận việc (Offers) phía Doanh nghiệp
# ==========================================
class CompanyOfferDetailView(APIView):
    """
    Xem chi tiết và cập nhật Offer.
    GET /api/v1/companies/me/offers/<id>/
    PATCH /api/v1/companies/me/offers/<id>/
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsEmployer]

    def get(self, request, pk):
        result = EmployerRecruitmentService.get_offer_detail(request.user.id, int(pk))
        return Response({"success": True, "data": {"offer": result}}, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        data = {**request.data, "offer_id": int(pk)}
        # Nếu không truyền application_id thì lấy từ offer hiện tại
        if "application_id" not in data:
            off = EmployerRecruitmentService.get_offer_detail(request.user.id, int(pk))
            data["application_id"] = off.get("application_id")
        result = EmployerRecruitmentService.create_or_update_offer(request.user.id, data)
        return Response({
            "success": True,
            "message": result.get("message", "Cập nhật Offer thành công."),
            "data": {"offer": result},
        }, status=status.HTTP_200_OK)


class CompanyOfferSendView(APIView):
    """
    Gửi Offer đang ở trạng thái bản nháp (draft) tới ứng viên.
    POST /api/v1/companies/me/offers/<id>/send/
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsEmployer]

    def post(self, request, pk):
        result = EmployerRecruitmentService.send_draft_offer(request.user.id, int(pk))
        return Response({"success": True, "message": result.get("message"), "data": result}, status=status.HTTP_200_OK)


class CompanyOfferCancelView(APIView):
    """
    Thu hồi Offer đã tạo hoặc đã gửi.
    POST /api/v1/companies/me/offers/<id>/cancel/
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsEmployer]

    def post(self, request, pk):
        reason = request.data.get("reason", "")
        result = EmployerRecruitmentService.cancel_offer(request.user.id, int(pk), reason=reason)
        return Response({"success": True, "message": result.get("message"), "data": result}, status=status.HTTP_200_OK)


