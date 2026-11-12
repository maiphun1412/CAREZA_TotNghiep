from rest_framework import serializers


class UserStatusUpdateSerializer(serializers.Serializer):
    is_active = serializers.BooleanField(required=True)
    reason = serializers.CharField(required=False, allow_blank=True, default="")


class UserRolesUpdateSerializer(serializers.Serializer):
    roles = serializers.ListField(child=serializers.CharField(), required=True)


class AdminResetPasswordSerializer(serializers.Serializer):
    password = serializers.CharField(min_length=6, required=True, error_messages={"blank": "Vui lòng nhập mật khẩu mới."})


class CompanyVerifyActionSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=["approve", "reject"], required=True)
    notes = serializers.CharField(required=False, allow_blank=True, default="")


class CompanyStatusUpdateSerializer(serializers.Serializer):
    is_active = serializers.BooleanField(required=True)


class JobModerateSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=["approve", "reject", "hide"], required=True)
    reason = serializers.CharField(required=False, allow_blank=True, default="")


class IndustryCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150, required=True, error_messages={"blank": "Tên ngành nghề không được để trống."})


class SkillCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=120, required=True, error_messages={"blank": "Tên kỹ năng không được để trống."})
    category = serializers.CharField(max_length=100, required=False, allow_blank=True, default="")


class PlanCreateUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=160, required=False)
    code = serializers.CharField(max_length=60, required=False)
    audience = serializers.CharField(max_length=30, required=False)
    target_role = serializers.CharField(max_length=30, required=False)
    price_vnd = serializers.IntegerField(required=False)
    price = serializers.FloatField(required=False)
    duration_days = serializers.IntegerField(required=False)
    job_quota = serializers.IntegerField(required=False)
    ai_interview_quota = serializers.IntegerField(required=False)
    features = serializers.JSONField(required=False)
    is_active = serializers.BooleanField(required=False)


class CouponCreateSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=50, required=True)
    discount_percent = serializers.IntegerField(min_value=1, max_value=100, required=True)
    valid_until = serializers.DateTimeField(required=False, allow_null=True)
    max_uses = serializers.IntegerField(required=False, default=100)


class AdminOrderConfirmSerializer(serializers.Serializer):
    provider_reference = serializers.CharField(
        max_length=150,
        required=True,
        allow_blank=False,
        error_messages={
            "required": "Vui lòng nhập mã giao dịch ngân hàng thực tế.",
            "blank": "Mã giao dịch ngân hàng không được để trống.",
        },
    )
    amount_vnd = serializers.IntegerField(
        min_value=1,
        required=True,
        error_messages={
            "required": "Vui lòng nhập số tiền thực nhận (VNĐ).",
            "min_value": "Số tiền thực nhận phải lớn hơn 0.",
        },
    )
    currency = serializers.ChoiceField(
        choices=["VND"],
        required=False,
        default="VND",
    )
    paid_at = serializers.DateTimeField(
        required=True,
        error_messages={
            "required": "Vui lòng nhập thời điểm giao dịch thực tế.",
            "invalid": "Thời điểm giao dịch không đúng định dạng ngày giờ.",
        },
    )
    note = serializers.CharField(
        max_length=1000,
        required=True,
        allow_blank=False,
        error_messages={
            "required": "Vui lòng nhập ghi chú / bằng chứng đối soát thanh toán.",
            "blank": "Ghi chú / bằng chứng đối soát không được để trống.",
        },
    )
    evidence = serializers.CharField(
        max_length=1000,
        required=False,
        allow_blank=True,
        default="",
    )


class ReportResolveSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=["resolve", "dismiss"], required=True)
    note = serializers.CharField(required=False, allow_blank=True, default="")


class ReviewModerateSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=["approve", "hide"], required=True)


class SettingUpdateSerializer(serializers.Serializer):
    key = serializers.CharField(max_length=100, required=False)
    value = serializers.JSONField(required=False)
    description = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    settings = serializers.DictField(required=False)


class BroadcastNotificationSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200, required=True, error_messages={"blank": "Tiêu đề thông báo không được để trống."})
    content = serializers.CharField(required=False, allow_blank=True, default="")
    target_role = serializers.ChoiceField(choices=["all", "candidate", "employer"], required=False, default="all")
    user_id = serializers.IntegerField(required=False, allow_null=True)
