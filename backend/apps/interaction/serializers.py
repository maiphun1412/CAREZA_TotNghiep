from rest_framework import serializers


class ConversationCreateSerializer(serializers.Serializer):
    partner_id = serializers.IntegerField(required=True)
    partner_type = serializers.CharField(required=False, default="company")


class NotificationReadSerializer(serializers.Serializer):
    is_read = serializers.BooleanField(required=False, default=True)


class SavedJobActionSerializer(serializers.Serializer):
    job_id = serializers.IntegerField(required=True)


class CompanyReviewCreateSerializer(serializers.Serializer):
    company_id = serializers.IntegerField(required=True)
    rating = serializers.IntegerField(required=True, min_value=1, max_value=5)
    title = serializers.CharField(required=False, allow_blank=True, default="", max_length=180)
    content = serializers.CharField(required=True, error_messages={"blank": "Nội dung đánh giá không được để trống."})


class CompanyReviewUpdateSerializer(serializers.Serializer):
    rating = serializers.IntegerField(required=False, min_value=1, max_value=5)
    title = serializers.CharField(required=False, allow_blank=True, max_length=180)
    content = serializers.CharField(required=False, allow_blank=False)


class ReportCreateSerializer(serializers.Serializer):
    target_type = serializers.ChoiceField(choices=["job", "company", "review", "user"], required=True)
    target_id = serializers.IntegerField(required=True)
    reason = serializers.CharField(required=True, max_length=120)
    details = serializers.CharField(required=False, allow_blank=True, default="")


class SearchHistoryCreateSerializer(serializers.Serializer):
    keyword = serializers.CharField(required=True, allow_blank=False)
    filters = serializers.DictField(required=False, default=dict)


class JobAlertCreateSerializer(serializers.Serializer):
    keyword = serializers.CharField(required=False, allow_blank=True, default="")
    location_id = serializers.IntegerField(required=False, allow_null=True)
    frequency = serializers.CharField(required=False, default="daily")
    is_active = serializers.BooleanField(required=False, default=True)


class JobAlertUpdateSerializer(serializers.Serializer):
    keyword = serializers.CharField(required=False, allow_blank=True)
    location_id = serializers.IntegerField(required=False, allow_null=True)
    frequency = serializers.CharField(required=False)
    is_active = serializers.BooleanField(required=False)
