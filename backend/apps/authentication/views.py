from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from apps.authentication.authentication import JWTAuthentication
from apps.authentication.permissions import IsAuthenticatedCustom
from apps.authentication.services.auth_service import AuthService
from apps.authentication.serializers import (
    RegisterSerializer,
    LoginSerializer,
    RefreshTokenSerializer,
    ChangePasswordSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
)


def get_client_ip(request):
    """Lấy địa chỉ IP thật của client."""
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


class RegisterView(APIView):
    """
    API Đăng ký tài khoản người dùng mới (Candidate hoặc Employer).
    POST /api/auth/register/
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Dữ liệu đăng ký không hợp lệ.",
                "errors": serializer.errors,
            }, status=status.HTTP_400_BAD_REQUEST)

        result = AuthService.register(serializer.validated_data)
        return Response({
            "success": True,
            "message": "Đăng ký tài khoản thành công.",
            "data": result,
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """
    API Đăng nhập hệ thống, trả về cặp JWT Access Token và Refresh Token.
    POST /api/auth/login/
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Dữ liệu đăng nhập không hợp lệ.",
                "errors": serializer.errors,
            }, status=status.HTTP_400_BAD_REQUEST)

        ip_address = get_client_ip(request)
        user_agent = request.META.get("HTTP_USER_AGENT", "")

        result = AuthService.login(
            serializer.validated_data,
            ip_address=ip_address,
            user_agent=user_agent,
        )

        return Response({
            "success": True,
            "message": "Đăng nhập thành công.",
            "data": result,
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """
    API Đăng xuất và thu hồi Refresh Token.
    POST /api/auth/logout/
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.data.get("refresh_token")
        user = request.user if getattr(request.user, "is_authenticated", False) else None
        AuthService.logout(refresh_token_str=refresh_token, user=user)
        return Response({
            "success": True,
            "message": "Đăng xuất thành công.",
            "data": None,
        }, status=status.HTTP_200_OK)


class RefreshTokenView(APIView):
    """
    API Cấp mới Access Token bằng Refresh Token.
    POST /api/auth/refresh/
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RefreshTokenSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Dữ liệu yêu cầu không hợp lệ.",
                "errors": serializer.errors,
            }, status=status.HTTP_400_BAD_REQUEST)

        new_tokens = AuthService.refresh_token(serializer.validated_data["refresh_token"])
        return Response({
            "success": True,
            "message": "Cấp mới token thành công.",
            "data": new_tokens,
        }, status=status.HTTP_200_OK)


class UserProfileView(APIView):
    """
    API Lấy thông tin tài khoản hiện tại (Me).
    GET /api/auth/me/
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def get(self, request):
        user_info = AuthService.get_user_info(request.user)
        return Response({
            "success": True,
            "message": "Lấy thông tin tài khoản thành công.",
            "data": {"user": user_info},
        }, status=status.HTTP_200_OK)


class ChangePasswordView(APIView):
    """
    API Đổi mật khẩu cho người dùng đang đăng nhập.
    POST /api/auth/change-password/
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Dữ liệu đổi mật khẩu không hợp lệ.",
                "errors": serializer.errors,
            }, status=status.HTTP_400_BAD_REQUEST)

        AuthService.change_password(
            request.user,
            old_password=serializer.validated_data["old_password"],
            new_password=serializer.validated_data["new_password"],
        )

        return Response({
            "success": True,
            "message": "Đổi mật khẩu thành công. Vui lòng đăng nhập lại với mật khẩu mới.",
            "data": None,
        }, status=status.HTTP_200_OK)


class ForgotPasswordView(APIView):
    """
    API Yêu cầu đặt lại mật khẩu qua email.
    POST /api/auth/forgot-password/
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Email không hợp lệ.",
                "errors": serializer.errors,
            }, status=status.HTTP_400_BAD_REQUEST)

        result = AuthService.forgot_password(serializer.validated_data["email"])
        return Response({
            "success": True,
            "message": result["message"],
            "data": {"reset_token": result.get("reset_token")},
        }, status=status.HTTP_200_OK)


class ResetPasswordView(APIView):
    """
    API Đặt lại mật khẩu mới bằng mã token.
    POST /api/auth/reset-password/
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Dữ liệu đặt lại mật khẩu không hợp lệ.",
                "errors": serializer.errors,
            }, status=status.HTTP_400_BAD_REQUEST)

        AuthService.reset_password(
            reset_token=serializer.validated_data["token"],
            new_password=serializer.validated_data["password"],
        )

        return Response({
            "success": True,
            "message": "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.",
            "data": None,
        }, status=status.HTTP_200_OK)
