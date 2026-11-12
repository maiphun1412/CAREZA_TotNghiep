from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

from apps.authentication.authentication import JWTAuthentication
from apps.authentication.permissions import IsAuthenticatedCustom, IsAdmin
from apps.system.services.admin_service import AdminService
from apps.system.serializers import (
    UserStatusUpdateSerializer,
    UserRolesUpdateSerializer,
    AdminResetPasswordSerializer,
    CompanyVerifyActionSerializer,
    CompanyStatusUpdateSerializer,
    JobModerateSerializer,
    IndustryCreateSerializer,
    SkillCreateSerializer,
    PlanCreateUpdateSerializer,
    CouponCreateSerializer,
    AdminOrderConfirmSerializer,
    ReportResolveSerializer,
    ReviewModerateSerializer,
    SettingUpdateSerializer,
    BroadcastNotificationSerializer,
)


# ==========================================
# 1. Dashboard Thống kê
# ==========================================
class AdminDashboardView(APIView):
    """Thống kê tổng quan hệ thống cho Admin."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsAdmin]

    def get(self, request):
        data = AdminService.get_dashboard_overview()
        return Response({"success": True, "data": data}, status=status.HTTP_200_OK)


# ==========================================
# 2. Quản lý Người dùng
# ==========================================
class AdminUserListView(APIView):
    """Danh sách, tìm kiếm, lọc người dùng."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsAdmin]

    def get(self, request):
        res = AdminService.get_users_list(request.query_params)
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)


class AdminUserDetailView(APIView):
    """Xem chi tiết một người dùng."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsAdmin]

    def get(self, request, pk):
        user_data = AdminService.get_user_detail(int(pk))
        return Response({"success": True, "data": {"user": user_data}}, status=status.HTTP_200_OK)


class AdminUserStatusView(APIView):
    """Khóa / Mở khóa tài khoản."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsAdmin]

    def patch(self, request, pk):
        serializer = UserStatusUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        res = AdminService.update_user_status(
            int(pk),
            serializer.validated_data["is_active"],
            serializer.validated_data.get("reason", ""),
            request.user.id,
        )
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)


class AdminUserRoleView(APIView):
    """Cập nhật vai trò (roles) người dùng."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsAdmin]

    def patch(self, request, pk):
        serializer = UserRolesUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        res = AdminService.update_user_roles(int(pk), serializer.validated_data["roles"], request.user.id)
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)

    def post(self, request, pk):
        return self.patch(request, pk)


class AdminUserResetPasswordView(APIView):
    """Admin đặt lại mật khẩu người dùng."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsAdmin]

    def post(self, request, pk):
        serializer = AdminResetPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        res = AdminService.admin_reset_password(int(pk), serializer.validated_data["password"], request.user.id)
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)


# ==========================================
# 3. Quản lý & Xác minh Doanh nghiệp
# ==========================================
class AdminCompanyListView(APIView):
    """Danh sách doanh nghiệp toàn hệ thống."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsAdmin]

    def get(self, request):
        res = AdminService.get_companies_list(request.query_params)
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)


class AdminCompanyDetailView(APIView):
    """Xem chi tiết doanh nghiệp và hồ sơ xác minh."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsAdmin]

    def get(self, request, pk):
        res = AdminService.get_company_detail(int(pk))
        return Response({"success": True, "data": {"company": res}}, status=status.HTTP_200_OK)


class AdminCompanyVerifyView(APIView):
    """Duyệt hoặc từ chối yêu cầu xác minh doanh nghiệp."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsAdmin]

    def post(self, request, pk):
        serializer = CompanyVerifyActionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        res = AdminService.verify_company(
            int(pk),
            serializer.validated_data["action"],
            serializer.validated_data.get("notes", ""),
            request.user.id,
        )
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)


class AdminCompanyStatusView(APIView):
    """Khóa / mở hoạt động của doanh nghiệp."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsAdmin]

    def patch(self, request, pk):
        serializer = CompanyStatusUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        res = AdminService.update_company_status(int(pk), serializer.validated_data["is_active"], request.user.id)
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)


# ==========================================
# 4. Kiểm duyệt Tin tuyển dụng
# ==========================================
class AdminJobListView(APIView):
    """Danh sách tin tuyển dụng toàn hệ thống."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsAdmin]

    def get(self, request):
        res = AdminService.get_admin_jobs(request.query_params)
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)


class AdminJobModerateView(APIView):
    """Duyệt, ẩn hoặc từ chối tin tuyển dụng vi phạm."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsAdmin]

    def post(self, request, pk):
        serializer = JobModerateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        res = AdminService.moderate_job(
            int(pk),
            serializer.validated_data["action"],
            serializer.validated_data.get("reason", ""),
            request.user.id,
        )
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)


class AdminJobDetailView(APIView):
    """Xem chi tiết tin tuyển dụng cho Admin."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsAdmin]

    def get(self, request, pk):
        job = AdminService.get_job_detail(int(pk))
        return Response({"success": True, "data": {"job": job}}, status=status.HTTP_200_OK)


# ==========================================
# 5. Quản lý Danh mục (Industries, Skills, Locations)
# ==========================================
class AdminIndustryListView(APIView):
    """Danh sách và thêm mới ngành nghề."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsAdmin]

    def get(self, request):
        items = AdminService.get_industries()
        return Response({"success": True, "data": {"industries": items}}, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = IndustryCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        res = AdminService.create_industry(serializer.validated_data["name"], admin_id=request.user.id)
        return Response({"success": True, "message": "Thêm ngành nghề thành công.", "data": {"industry": res}}, status=status.HTTP_201_CREATED)


class AdminIndustryDetailView(APIView):
    """Xóa ngành nghề."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsAdmin]

    def delete(self, request, pk):
        AdminService.delete_industry(int(pk), admin_id=request.user.id)
        return Response({"success": True, "message": "Đã xóa ngành nghề.", "data": None}, status=status.HTTP_200_OK)


class AdminSkillListView(APIView):
    """Danh sách và thêm mới kỹ năng."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsAdmin]

    def get(self, request):
        items = AdminService.get_skills()
        return Response({"success": True, "data": {"skills": items}}, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = SkillCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        res = AdminService.create_skill(serializer.validated_data["name"], serializer.validated_data.get("category", ""), admin_id=request.user.id)
        return Response({"success": True, "message": "Thêm kỹ năng thành công.", "data": {"skill": res}}, status=status.HTTP_201_CREATED)


class AdminSkillDetailView(APIView):
    """Xóa kỹ năng."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsAdmin]

    def delete(self, request, pk):
        AdminService.delete_skill(int(pk), admin_id=request.user.id)
        return Response({"success": True, "message": "Đã xóa kỹ năng.", "data": None}, status=status.HTTP_200_OK)


class AdminLocationListView(APIView):
    """Danh sách địa điểm hệ thống."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsAdmin]

    def get(self, request):
        items = AdminService.get_locations()
        return Response({"success": True, "data": {"locations": items}}, status=status.HTTP_200_OK)


# ==========================================
# 6. Quản lý Gói dịch vụ & Giao dịch (Billing)
# ==========================================
class AdminBillingPlanListView(APIView):
    """Danh sách & tạo gói dịch vụ."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsAdmin]

    def get(self, request):
        plans = AdminService.get_plans()
        return Response({"success": True, "data": {"plans": plans}}, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = PlanCreateUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        res = AdminService.create_or_update_plan(serializer.validated_data, admin_id=request.user.id)
        return Response({"success": True, "message": "Tạo gói dịch vụ thành công.", "data": {"plan": res}}, status=status.HTTP_201_CREATED)


class AdminBillingPlanDetailView(APIView):
    """Cập nhật gói dịch vụ."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsAdmin]

    def patch(self, request, pk):
        serializer = PlanCreateUpdateSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        res = AdminService.create_or_update_plan(serializer.validated_data, plan_id=int(pk), admin_id=request.user.id)
        return Response({"success": True, "message": "Cập nhật gói dịch vụ thành công.", "data": {"plan": res}}, status=status.HTTP_200_OK)


class AdminBillingOrderListView(APIView):
    """Danh sách đơn hàng và giao dịch."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsAdmin]

    def get(self, request):
        res = AdminService.get_orders(request.query_params)
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)


class AdminBillingOrderConfirmView(APIView):
    """Admin đối soát và xác nhận chuyển khoản thủ công cho đơn hàng pending."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsAdmin]

    def post(self, request, pk):
        serializer = AdminOrderConfirmSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        res = AdminService.confirm_order_payment(
            order_id=int(pk),
            data=serializer.validated_data,
            admin_id=request.user.id,
        )
        return Response(
            {
                "success": True,
                "message": res.get("message", "Đã xác nhận đối soát thanh toán đơn hàng."),
                "data": res,
            },
            status=status.HTTP_200_OK,
        )


class AdminBillingSubscriptionListView(APIView):
    """Danh sách thuê bao gói dịch vụ."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsAdmin]

    def get(self, request):
        res = AdminService.get_subscriptions(request.query_params)
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)


class AdminBillingCouponView(APIView):
    """Danh sách & tạo mã giảm giá."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsAdmin]

    def get(self, request):
        coupons = AdminService.get_coupons()
        return Response({"success": True, "data": {"coupons": coupons}}, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = CouponCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        res = AdminService.create_coupon(serializer.validated_data, admin_id=request.user.id)
        return Response({"success": True, "message": "Tạo mã khuyến mãi thành công.", "data": {"coupon": res}}, status=status.HTTP_201_CREATED)


# ==========================================
# 7. Quản lý Báo cáo vi phạm (Reports)
# ==========================================
class AdminReportListView(APIView):
    """Danh sách báo cáo vi phạm."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsAdmin]

    def get(self, request):
        res = AdminService.get_reports(request.query_params)
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)


class AdminReportResolveView(APIView):
    """Xử lý báo cáo vi phạm."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsAdmin]

    def post(self, request, pk):
        serializer = ReportResolveSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        res = AdminService.resolve_report(
            int(pk),
            serializer.validated_data["action"],
            serializer.validated_data.get("note", ""),
            request.user.id,
        )
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)


class AdminReviewListView(APIView):
    """Danh sách đánh giá doanh nghiệp."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsAdmin]

    def get(self, request):
        res = AdminService.get_reviews(request.query_params)
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)


class AdminReviewModerateView(APIView):
    """Duyệt hoặc ẩn đánh giá doanh nghiệp."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsAdmin]

    def post(self, request, pk):
        serializer = ReviewModerateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        res = AdminService.moderate_review(int(pk), serializer.validated_data["action"], request.user.id)
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)


class AdminModerationCaseListView(APIView):
    """Danh sách các trường hợp kiểm duyệt hệ thống."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsAdmin]

    def get(self, request):
        res = AdminService.get_moderation_cases(request.query_params)
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)


# ==========================================
# 8. Quản lý Hệ thống & Hoạt động
# ==========================================
class AdminSystemRolePermissionView(APIView):
    """Danh sách Roles và Permissions của hệ thống."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsAdmin]

    def get(self, request):
        res = AdminService.get_roles_permissions()
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)


class AdminSystemSettingsView(APIView):
    """Xem và cập nhật cấu hình hệ thống."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsAdmin]

    def get(self, request):
        items = AdminService.get_settings()
        return Response({"success": True, "data": {"settings": items}}, status=status.HTTP_200_OK)

    def patch(self, request):
        serializer = SettingUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        vdata = serializer.validated_data
        if "settings" in vdata and isinstance(vdata["settings"], dict):
            updated = []
            for k, val in vdata["settings"].items():
                updated.append(AdminService.update_setting(str(k), val, request.user.id))
            return Response({"success": True, "message": "Cập nhật cấu hình thành công.", "data": {"settings": updated}}, status=status.HTTP_200_OK)

        if "key" not in vdata:
            return Response({"success": False, "errors": {"key": ["Vui lòng cung cấp key hoặc settings."]}}, status=status.HTTP_400_BAD_REQUEST)

        res = AdminService.update_setting(
            vdata["key"],
            vdata.get("value"),
            request.user.id,
            description=vdata.get("description"),
        )
        return Response({"success": True, "message": "Cập nhật cấu hình thành công.", "data": res}, status=status.HTTP_200_OK)

    def post(self, request):
        return self.patch(request)


class AdminSystemEmailTemplateView(APIView):
    """Danh sách mẫu email hệ thống."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsAdmin]

    def get(self, request):
        items = AdminService.get_email_templates()
        return Response({"success": True, "data": {"email_templates": items}}, status=status.HTTP_200_OK)


class AdminAuditLogView(APIView):
    """Xem nhật ký hoạt động hệ thống (Audit Logs)."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsAdmin]

    def get(self, request):
        res = AdminService.get_audit_logs(request.query_params)
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)


class AdminAiUsageView(APIView):
    """Thống kê việc sử dụng AI trên hệ thống."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsAdmin]

    def get(self, request):
        res = AdminService.get_ai_usage_stats()
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)


# ==========================================
# 9. Gửi Thông báo Hệ thống (Broadcast)
# ==========================================
class AdminBroadcastNotificationView(APIView):
    """Gửi thông báo diện rộng tới người dùng."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsAdmin]

    def post(self, request):
        serializer = BroadcastNotificationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        res = AdminService.broadcast_notification(request.user.id, serializer.validated_data)
        return Response({"success": True, "data": res}, status=status.HTTP_201_CREATED)
