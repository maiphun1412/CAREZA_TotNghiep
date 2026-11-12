from rest_framework import serializers


class CandidateProfileUpdateSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=160, required=False)
    phone = serializers.CharField(max_length=30, required=False, allow_blank=True, allow_null=True)
    avatar_url = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    headline = serializers.CharField(max_length=250, required=False, allow_blank=True, allow_null=True)
    bio = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    birth_date = serializers.DateField(required=False, allow_null=True)
    location_id = serializers.IntegerField(required=False, allow_null=True)
    desired_salary_min = serializers.IntegerField(required=False, allow_null=True)
    desired_salary_max = serializers.IntegerField(required=False, allow_null=True)
    experience_years = serializers.DecimalField(max_digits=4, decimal_places=1, required=False, allow_null=True)
    work_mode = serializers.CharField(max_length=30, required=False, allow_blank=True, allow_null=True)
    visibility = serializers.CharField(max_length=20, required=False, allow_blank=True, allow_null=True)


class EducationSerializer(serializers.Serializer):
    institution = serializers.CharField(max_length=200, required=True, error_messages={"blank": "Tên trường không được để trống."})
    major = serializers.CharField(max_length=200, required=False, allow_blank=True, default="")
    degree = serializers.CharField(max_length=100, required=False, allow_blank=True, default="")
    start_year = serializers.IntegerField(required=False, allow_null=True)
    end_year = serializers.IntegerField(required=False, allow_null=True)
    description = serializers.CharField(required=False, allow_blank=True, default="")


class ExperienceSerializer(serializers.Serializer):
    employer_name = serializers.CharField(max_length=200, required=True, error_messages={"blank": "Tên công ty không được để trống."})
    job_title = serializers.CharField(max_length=200, required=True, error_messages={"blank": "Chức danh không được để trống."})
    start_date = serializers.DateField(required=False, allow_null=True)
    end_date = serializers.DateField(required=False, allow_null=True)
    description = serializers.CharField(required=False, allow_blank=True, default="")


class SkillAddSerializer(serializers.Serializer):
    skill_id = serializers.IntegerField(required=True, error_messages={"required": "Vui lòng chọn kỹ năng."})
    proficiency = serializers.CharField(max_length=30, required=False, default="Intermediate")


class CertificateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=200, required=True)
    issuer = serializers.CharField(max_length=200, required=False, allow_blank=True, default="")
    issued_on = serializers.DateField(required=False, allow_null=True)
    credential_url = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class ProjectSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=200, required=True)
    description = serializers.CharField(required=False, allow_blank=True, default="")
    project_url = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class JobPreferenceSerializer(serializers.Serializer):
    desired_titles = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    industry_id = serializers.IntegerField(required=False, allow_null=True)
    location_id = serializers.IntegerField(required=False, allow_null=True)
    work_modes = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    salary_min = serializers.IntegerField(required=False, allow_null=True)


class CvCreateUpdateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200, required=True, error_messages={"blank": "Tiêu đề CV không được để trống."})
    file_url = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    parsed_data = serializers.DictField(required=False, default=dict)
    is_primary = serializers.BooleanField(required=False, default=False)
    status = serializers.CharField(max_length=30, required=False, default="draft")


class CvVersionCreateSerializer(serializers.Serializer):
    content = serializers.DictField(required=False, default=dict)
    file_url = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class ApplicationCreateSerializer(serializers.Serializer):
    job_id = serializers.IntegerField(required=False)
    jobPostId = serializers.IntegerField(required=False)
    cv_id = serializers.IntegerField(required=False, allow_null=True)
    candidateDocumentId = serializers.IntegerField(required=False, allow_null=True)
    cover_letter = serializers.CharField(required=False, allow_blank=True, default="")
    coverLetter = serializers.CharField(required=False, allow_blank=True, default="")

    def validate(self, attrs):
        job_id = attrs.get("job_id") or attrs.get("jobPostId")
        if not job_id:
            raise serializers.ValidationError({"job_id": "Vui lòng cung cấp ID tin tuyển dụng cần ứng tuyển."})
        attrs["job_id"] = job_id
        cv_id = attrs.get("cv_id") or attrs.get("candidateDocumentId")
        attrs["cv_id"] = cv_id
        attrs["cover_letter"] = attrs.get("cover_letter") or attrs.get("coverLetter") or ""
        return attrs


class WithdrawApplicationSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True, default="")


class JobAlertCreateSerializer(serializers.Serializer):
    keyword = serializers.CharField(max_length=200, required=False, allow_blank=True, default="")
    location_id = serializers.IntegerField(required=False, allow_null=True)
    frequency = serializers.CharField(max_length=30, required=False, default="daily")
    is_active = serializers.BooleanField(required=False, default=True)
