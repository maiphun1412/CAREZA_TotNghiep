from rest_framework import serializers


class CompanyUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=250, required=False)
    industry_id = serializers.IntegerField(required=False, allow_null=True)
    location_id = serializers.IntegerField(required=False, allow_null=True)
    website = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    logo_url = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    description = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    company_size = serializers.CharField(max_length=60, required=False, allow_blank=True, allow_null=True)
    slogan = serializers.CharField(max_length=250, required=False, allow_blank=True, allow_null=True)
    banner_url = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    benefits = serializers.JSONField(required=False)
    social_links = serializers.JSONField(required=False)
    branding = serializers.DictField(required=False)


class BranchCreateUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=200, required=True, error_messages={"blank": "Tên chi nhánh không được để trống."})
    address = serializers.CharField(required=False, allow_blank=True, default="")
    location_id = serializers.IntegerField(required=False, allow_null=True)


VALID_MEMBER_ROLES = ["owner", "admin", "recruiter", "viewer"]


class MemberInviteSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True, error_messages={"blank": "Vui lòng nhập email thành viên."})
    member_role = serializers.ChoiceField(choices=VALID_MEMBER_ROLES, required=False, default="recruiter")


class MemberRoleUpdateSerializer(serializers.Serializer):
    member_role = serializers.ChoiceField(choices=VALID_MEMBER_ROLES, required=False)
    status = serializers.ChoiceField(choices=["active", "inactive"], required=False)



class VerificationSubmitSerializer(serializers.Serializer):
    legal_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    tax_code = serializers.CharField(max_length=50, required=True, error_messages={"blank": "Mã số thuế không được để trống."})
    document_url = serializers.CharField(required=False, allow_blank=True, default="")
