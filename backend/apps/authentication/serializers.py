from rest_framework import serializers
from apps.authentication.models import Users


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True, error_messages={"invalid": "Địa chỉ email không đúng định dạng."})
    full_name = serializers.CharField(max_length=160, required=True, error_messages={"blank": "Họ và tên không được để trống."})
    password = serializers.CharField(min_length=6, write_only=True, required=True, error_messages={"min_length": "Mật khẩu phải có ít nhất 6 ký tự."})
    confirm_password = serializers.CharField(min_length=6, write_only=True, required=False)
    account_type = serializers.CharField(default="candidate", required=False)
    phone = serializers.CharField(max_length=30, required=False, allow_blank=True)
    company_name = serializers.CharField(max_length=200, required=False, allow_blank=True)

    def validate_account_type(self, value):
        val = value.lower().strip()
        if val in ("candidate", "c"):
            return "candidate"
        elif val in ("employer", "company"):
            return "employer"
        raise serializers.ValidationError("Loại tài khoản phải là 'candidate' hoặc 'employer'.")

    def validate(self, attrs):
        confirm = attrs.get("confirm_password")
        if confirm and attrs.get("password") != confirm:
            raise serializers.ValidationError({"confirm_password": "Xác nhận mật khẩu không trùng khớp."})
        return attrs


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True, error_messages={"blank": "Vui lòng nhập địa chỉ email."})
    password = serializers.CharField(required=True, write_only=True, error_messages={"blank": "Vui lòng nhập mật khẩu."})
    remember = serializers.BooleanField(default=True, required=False)


class RefreshTokenSerializer(serializers.Serializer):
    refresh_token = serializers.CharField(required=True, error_messages={"blank": "Vui lòng cung cấp refresh_token."})


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True, error_messages={"blank": "Vui lòng nhập mật khẩu hiện tại."})
    new_password = serializers.CharField(min_length=6, write_only=True, required=True, error_messages={"min_length": "Mật khẩu mới phải có ít nhất 6 ký tự."})
    confirm_password = serializers.CharField(min_length=6, write_only=True, required=False)

    def validate(self, attrs):
        confirm = attrs.get("confirm_password")
        if confirm and attrs.get("new_password") != confirm:
            raise serializers.ValidationError({"confirm_password": "Mật khẩu xác nhận không trùng khớp."})
        if attrs.get("old_password") == attrs.get("new_password"):
            raise serializers.ValidationError({"new_password": "Mật khẩu mới không được trùng với mật khẩu cũ."})
        return attrs


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True, error_messages={"blank": "Vui lòng nhập email tài khoản cần khôi phục."})


class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.CharField(required=True, error_messages={"blank": "Mã xác thực token không được để trống."})
    password = serializers.CharField(min_length=6, write_only=True, required=True, error_messages={"min_length": "Mật khẩu mới phải có ít nhất 6 ký tự."})
    confirm_password = serializers.CharField(min_length=6, write_only=True, required=False)

    def validate(self, attrs):
        confirm = attrs.get("confirm_password")
        if confirm and attrs.get("password") != confirm:
            raise serializers.ValidationError({"confirm_password": "Mật khẩu xác nhận không trùng khớp."})
        return attrs


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = [
            "id",
            "email",
            "full_name",
            "phone",
            "avatar_url",
            "account_type",
            "is_active",
            "email_verified_at",
            "created_at",
        ]
        read_only_fields = fields
