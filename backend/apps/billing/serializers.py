from rest_framework import serializers


class CouponApplySerializer(serializers.Serializer):
    coupon_code = serializers.CharField(max_length=50, required=True, error_messages={"blank": "Vui lòng nhập mã giảm giá."})
    plan_id = serializers.IntegerField(required=True, error_messages={"required": "Vui lòng chọn gói dịch vụ."})


class OrderCreateSerializer(serializers.Serializer):
    plan_id = serializers.IntegerField(required=True, error_messages={"required": "Vui lòng chọn gói dịch vụ."})
    coupon_code = serializers.CharField(max_length=50, required=False, allow_blank=True, default="")


class PaymentInitiateSerializer(serializers.Serializer):
    provider = serializers.ChoiceField(
        choices=["bank_transfer", "vnpay", "momo", "card"],
        required=False,
        default="bank_transfer",
    )
    payment_method = serializers.ChoiceField(
        choices=["bank_transfer", "vnpay", "momo", "card"],
        required=False,
    )

    def validate(self, attrs):
        if attrs.get("payment_method") and "provider" not in self.initial_data:
            attrs["provider"] = attrs["payment_method"]
        return attrs


class PaymentWebhookSerializer(serializers.Serializer):
    order_code = serializers.CharField(
        max_length=100,
        required=True,
        error_messages={"required": "Thiếu mã đơn hàng (order_code).", "blank": "Mã đơn hàng không được để trống."},
    )
    provider_reference = serializers.CharField(
        max_length=150,
        required=True,
        allow_blank=False,
        error_messages={
            "required": "Bắt buộc cung cấp mã giao dịch đối soát (provider_reference).",
            "blank": "Mã giao dịch đối soát (provider_reference) không được để trống.",
        },
    )
    amount_vnd = serializers.IntegerField(
        required=True,
        min_value=1,
        error_messages={
            "required": "Bắt buộc cung cấp số tiền đối soát thực tế (amount_vnd).",
            "min_value": "Số tiền đối soát phải lớn hơn 0.",
        },
    )
    currency = serializers.ChoiceField(
        choices=["VND"],
        required=False,
        default="VND",
    )
    status = serializers.ChoiceField(
        choices=["success", "failed"],
        required=True,
        error_messages={"required": "Bắt buộc cung cấp trạng thái đối soát (status)."},
    )
    provider = serializers.ChoiceField(
        choices=["bank_transfer"],
        required=False,
        default="bank_transfer",
        error_messages={"invalid_choice": "Phương thức thanh toán chưa được hỗ trợ đối soát."},
    )
