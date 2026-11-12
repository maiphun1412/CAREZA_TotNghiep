from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from apps.authentication.authentication import JWTAuthentication
from apps.authentication.permissions import IsAuthenticatedCustom
from apps.interaction.services.interaction_service import (
    ConversationService,
    NotificationService,
    SavedJobService,
    CompanyFollowService,
    CompanyReviewService,
    ReportService,
    SearchAndComparisonService,
    JobAlertService,
)
from apps.interaction.serializers import (
    ConversationCreateSerializer,
    NotificationReadSerializer,
    SavedJobActionSerializer,
    CompanyReviewCreateSerializer,
    CompanyReviewUpdateSerializer,
    ReportCreateSerializer,
    SearchHistoryCreateSerializer,
    JobAlertCreateSerializer,
    JobAlertUpdateSerializer,
)


# ==============================================================================
# 1. Nhắn tin (Conversations)
# ==============================================================================

class ConversationListView(APIView):
    """Danh sách các cuộc trò chuyện & tạo cuộc trò chuyện mới."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def get(self, request):
        keyword = request.query_params.get("keyword", "")
        conversations = ConversationService.get_user_conversations(request.user.id, keyword=keyword)
        return Response({"success": True, "data": {"conversations": conversations}}, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ConversationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        res = ConversationService.get_or_create_conversation(
            user_id=request.user.id,
            partner_id=serializer.validated_data["partner_id"],
            partner_type=serializer.validated_data.get("partner_type", "company"),
        )
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)


class ConversationDetailView(APIView):
    """Chi tiết cuộc trò chuyện và thông tin đối tác."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def get(self, request, pk):
        res = ConversationService.get_conversation_detail(request.user.id, int(pk))
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)


class ConversationTouchView(APIView):
    """Cập nhật thời gian tương tác mới nhất của cuộc trò chuyện."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def post(self, request, pk):
        res = ConversationService.touch_conversation(request.user.id, int(pk))
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)


# ==============================================================================
# 2. Thông báo (Notifications)
# ==============================================================================

class NotificationListView(APIView):
    """Danh sách thông báo của người dùng."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def get(self, request):
        n_type = request.query_params.get("type")
        is_read = request.query_params.get("is_read")
        page = int(request.query_params.get("page", 1))
        page_size = int(request.query_params.get("page_size", 20))

        res = NotificationService.get_notifications(
            user_id=request.user.id,
            n_type=n_type,
            is_read=is_read,
            page=page,
            page_size=page_size,
        )
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)


class NotificationDetailView(APIView):
    """Chi tiết và xóa thông báo."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def get(self, request, pk):
        res = NotificationService.get_notification_detail(request.user.id, int(pk))
        return Response({"success": True, "data": {"notification": res}}, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        NotificationService.delete_notification(request.user.id, int(pk))
        return Response({"success": True, "message": "Xóa thông báo thành công."}, status=status.HTTP_200_OK)


class NotificationReadView(APIView):
    """Đánh dấu thông báo đã đọc / chưa đọc."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def patch(self, request, pk):
        serializer = NotificationReadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        res = NotificationService.mark_as_read(
            user_id=request.user.id,
            notification_id=int(pk),
            is_read=serializer.validated_data.get("is_read", True),
        )
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)


class NotificationReadAllView(APIView):
    """Đánh dấu tất cả thông báo là đã đọc."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def post(self, request):
        count = NotificationService.mark_all_as_read(request.user.id)
        return Response({"success": True, "message": f"Đã đánh dấu {count} thông báo là đã đọc."}, status=status.HTTP_200_OK)


# ==============================================================================
# 3. Việc làm đã lưu (Saved Jobs)
# ==============================================================================

class SavedJobListView(APIView):
    """Danh sách việc làm đã lưu và lưu việc làm mới."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def get(self, request):
        page = int(request.query_params.get("page", 1))
        page_size = int(request.query_params.get("page_size", 10))
        res = SavedJobService.get_saved_jobs(request.user.id, page=page, page_size=page_size)
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = SavedJobActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        res = SavedJobService.save_job(request.user.id, serializer.validated_data["job_id"])
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)


class SavedJobIdsView(APIView):
    """Danh sách các job_id đã lưu."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def get(self, request):
        ids = SavedJobService.get_saved_job_ids(request.user.id)
        return Response({"success": True, "data": {"saved_job_ids": ids}}, status=status.HTTP_200_OK)


class SavedJobDetailView(APIView):
    """Bỏ lưu việc làm."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def delete(self, request, job_id):
        res = SavedJobService.unsave_job(request.user.id, int(job_id))
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)


class SavedJobCheckView(APIView):
    """Kiểm tra trạng thái đã lưu việc làm hay chưa."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def get(self, request, job_id):
        res = SavedJobService.check_saved(request.user.id, int(job_id))
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)


# ==============================================================================
# 4. Theo dõi Doanh nghiệp (Company Follows)
# ==============================================================================

class CompanyFollowListView(APIView):
    """Danh sách các doanh nghiệp đang theo dõi."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def get(self, request):
        page = int(request.query_params.get("page", 1))
        page_size = int(request.query_params.get("page_size", 10))
        res = CompanyFollowService.get_followed_companies(request.user.id, page=page, page_size=page_size)
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)


class CompanyFollowActionView(APIView):
    """Theo dõi / bỏ theo dõi doanh nghiệp."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def post(self, request, company_id):
        res = CompanyFollowService.follow_company(request.user.id, int(company_id))
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)

    def delete(self, request, company_id):
        res = CompanyFollowService.unfollow_company(request.user.id, int(company_id))
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)


class CompanyFollowCheckView(APIView):
    """Kiểm tra trạng thái theo dõi doanh nghiệp."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def get(self, request, company_id):
        res = CompanyFollowService.check_following(request.user.id, int(company_id))
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)


# ==============================================================================
# 5. Đánh giá Doanh nghiệp (Company Reviews)
# ==============================================================================

class CompanyReviewListView(APIView):
    """Xem đánh giá công khai của công ty hoặc tạo đánh giá mới."""
    authentication_classes = [JWTAuthentication]

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAuthenticatedCustom()]

    def get(self, request):
        company_id = request.query_params.get("company_id")
        if not company_id or not company_id.isdigit():
            return Response({"success": False, "error": "Vui lòng cung cấp company_id hợp lệ."}, status=status.HTTP_400_BAD_REQUEST)
        page = int(request.query_params.get("page", 1))
        page_size = int(request.query_params.get("page_size", 10))
        res = CompanyReviewService.get_company_reviews(int(company_id), page=page, page_size=page_size)
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = CompanyReviewCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        res = CompanyReviewService.create_review(request.user.id, serializer.validated_data)
        return Response({"success": True, "data": res}, status=status.HTTP_201_CREATED)


class CompanyReviewMyListView(APIView):
    """Danh sách các đánh giá do chính người dùng viết."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def get(self, request):
        page = int(request.query_params.get("page", 1))
        page_size = int(request.query_params.get("page_size", 10))
        res = CompanyReviewService.get_my_reviews(request.user.id, page=page, page_size=page_size)
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)


class CompanyReviewDetailView(APIView):
    """Sửa hoặc xóa đánh giá của chính mình."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def put(self, request, pk):
        serializer = CompanyReviewUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        res = CompanyReviewService.update_review(request.user.id, int(pk), serializer.validated_data)
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        return self.put(request, pk)

    def delete(self, request, pk):
        CompanyReviewService.delete_review(request.user.id, int(pk))
        return Response({"success": True, "message": "Xóa đánh giá thành công."}, status=status.HTTP_200_OK)


# ==============================================================================
# 6. Báo cáo Vi phạm (Reports)
# ==============================================================================

class ReportListView(APIView):
    """Gửi báo cáo vi phạm & xem danh sách báo cáo của mình."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def get(self, request):
        page = int(request.query_params.get("page", 1))
        page_size = int(request.query_params.get("page_size", 10))
        res = ReportService.get_my_reports(request.user.id, page=page, page_size=page_size)
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ReportCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        res = ReportService.create_report(request.user.id, serializer.validated_data)
        return Response({"success": True, "data": res}, status=status.HTTP_201_CREATED)


class ReportDetailView(APIView):
    """Xem chi tiết 1 báo cáo của mình."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def get(self, request, pk):
        res = ReportService.get_report_detail(request.user.id, int(pk))
        return Response({"success": True, "data": {"report": res}}, status=status.HTTP_200_OK)


# ==============================================================================
# 7. Lịch sử Tìm kiếm & So sánh Việc làm
# ==============================================================================

class SearchHistoryListView(APIView):
    """Lịch sử tìm kiếm của người dùng."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def get(self, request):
        limit = int(request.query_params.get("limit", 10))
        res = SearchAndComparisonService.get_search_history(request.user.id, limit=limit)
        return Response({"success": True, "data": {"history": res}}, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = SearchHistoryCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        res = SearchAndComparisonService.add_search_history(
            user_id=request.user.id,
            keyword=serializer.validated_data["keyword"],
            filters=serializer.validated_data.get("filters"),
        )
        return Response({"success": True, "data": res}, status=status.HTTP_201_CREATED)


class SearchHistoryDetailView(APIView):
    """Xóa một mục lịch sử tìm kiếm."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def delete(self, request, pk):
        SearchAndComparisonService.delete_search_history(request.user.id, int(pk))
        return Response({"success": True, "message": "Xóa mục tìm kiếm thành công."}, status=status.HTTP_200_OK)


class SearchHistoryClearView(APIView):
    """Xóa toàn bộ lịch sử tìm kiếm."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def delete(self, request):
        SearchAndComparisonService.clear_search_history(request.user.id)
        return Response({"success": True, "message": "Đã xóa toàn bộ lịch sử tìm kiếm."}, status=status.HTTP_200_OK)


class JobComparisonListView(APIView):
    """Danh sách các việc làm trong bảng so sánh."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def get(self, request):
        res = SearchAndComparisonService.get_job_comparisons(request.user.id)
        return Response({"success": True, "data": {"comparisons": res}}, status=status.HTTP_200_OK)


class JobComparisonActionView(APIView):
    """Thêm hoặc xóa việc làm khỏi bảng so sánh."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def post(self, request, job_id):
        res = SearchAndComparisonService.add_job_comparison(request.user.id, int(job_id))
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)

    def delete(self, request, job_id):
        SearchAndComparisonService.remove_job_comparison(request.user.id, int(job_id))
        return Response({"success": True, "message": "Đã gỡ công việc khỏi bảng so sánh."}, status=status.HTTP_200_OK)


class JobComparisonClearView(APIView):
    """Xóa toàn bộ bảng so sánh việc làm."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def delete(self, request):
        SearchAndComparisonService.clear_job_comparisons(request.user.id)
        return Response({"success": True, "message": "Đã xóa toàn bộ danh sách so sánh."}, status=status.HTTP_200_OK)


# ==============================================================================
# 8. Job Alerts (Thông báo việc làm phù hợp)
# ==============================================================================

class JobAlertListView(APIView):
    """Danh sách và tạo thông báo việc làm."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def get(self, request):
        res = JobAlertService.get_job_alerts(request.user.id)
        return Response({"success": True, "data": {"job_alerts": res}}, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = JobAlertCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        res = JobAlertService.create_job_alert(request.user.id, serializer.validated_data)
        return Response({"success": True, "data": res}, status=status.HTTP_201_CREATED)


class JobAlertDetailView(APIView):
    """Chi tiết, sửa hoặc xóa thông báo việc làm."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def put(self, request, pk):
        serializer = JobAlertUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        res = JobAlertService.update_job_alert(request.user.id, int(pk), serializer.validated_data)
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        return self.put(request, pk)

    def delete(self, request, pk):
        JobAlertService.delete_job_alert(request.user.id, int(pk))
        return Response({"success": True, "message": "Xóa thông báo việc làm thành công."}, status=status.HTTP_200_OK)


class JobAlertTriggerView(APIView):
    """Quét tìm các việc làm thực tế phù hợp và gửi thông báo."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def post(self, request, pk):
        res = JobAlertService.check_alert_matches(request.user.id, int(pk))
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)
