from rest_framework import serializers


class JobCreateUpdateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=220, required=True, error_messages={"blank": "Tiêu đề không được để trống."})
    description = serializers.CharField(required=True, error_messages={"blank": "Mô tả công việc không được để trống."})
    requirements = serializers.CharField(required=True, error_messages={"blank": "Yêu cầu công việc không được để trống."})
    benefits = serializers.CharField(required=False, allow_blank=True, default="")
    salary_min = serializers.IntegerField(required=False, allow_null=True)
    salary_max = serializers.IntegerField(required=False, allow_null=True)
    currency = serializers.CharField(max_length=3, required=False, default="VND")
    experience_min = serializers.DecimalField(max_digits=4, decimal_places=1, required=False, allow_null=True)
    work_mode = serializers.CharField(max_length=30, required=False, default="onsite")
    employment_type = serializers.CharField(max_length=40, required=False, default="full_time")
    openings = serializers.IntegerField(required=False, default=1)
    industry_id = serializers.IntegerField(required=False, allow_null=True)
    location_id = serializers.IntegerField(required=False, allow_null=True)
    expires_at = serializers.DateTimeField(required=False, allow_null=True)
    status = serializers.CharField(max_length=30, required=False, default="draft")
    skill_ids = serializers.ListField(child=serializers.IntegerField(), required=False, default=list)


class ApplicationStageUpdateSerializer(serializers.Serializer):
    stage = serializers.CharField(required=False)
    status = serializers.CharField(required=False)
    note = serializers.CharField(required=False, allow_blank=True, default="")

    def validate(self, attrs):
        stage_val = attrs.get("status") or attrs.get("stage")
        if not stage_val:
            raise serializers.ValidationError({"status": "Vui lòng chọn trạng thái mới cho hồ sơ."})
        # Map số hoặc chữ khớp đúng constraint PostgreSQL:
        # ['submitted', 'screening', 'shortlisted', 'test', 'interview', 'offered', 'hired', 'rejected', 'withdrawn']
        stage_map = {
            "1": "submitted",
            "2": "screening",
            "3": "interview",
            "4": "offered",
            "5": "hired",
            "6": "rejected",
            "reviewing": "screening",
            "screening": "screening",
            "shortlist": "shortlisted",
            "shortlisted": "shortlisted",
            "test": "test",
            "interview": "interview",
            "offer": "offered",
            "offered": "offered",
            "hired": "hired",
            "rejected": "rejected",
            "withdrawn": "withdrawn",
        }
        val_str = str(stage_val).lower().strip()
        attrs["final_status"] = stage_map.get(val_str, val_str)
        return attrs



class ApplicationRejectSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True, default="")


class InterviewScheduleSerializer(serializers.Serializer):
    application_id = serializers.IntegerField(required=True, error_messages={"required": "Vui lòng chọn đơn ứng tuyển."})
    scheduled_at = serializers.DateTimeField(required=True, error_messages={"required": "Thời gian phỏng vấn không được để trống."})
    duration_minutes = serializers.IntegerField(required=False, default=45)
    meeting_url = serializers.CharField(required=False, allow_blank=True, default="")
    mode = serializers.CharField(max_length=30, required=False, default="online")
    notes = serializers.CharField(required=False, allow_blank=True, default="")


class ScorecardCreateSerializer(serializers.Serializer):
    application_id = serializers.IntegerField(required=True)
    technical_score = serializers.DecimalField(max_digits=4, decimal_places=1, required=False, allow_null=True)
    communication_score = serializers.DecimalField(max_digits=4, decimal_places=1, required=False, allow_null=True)
    culture_score = serializers.DecimalField(max_digits=4, decimal_places=1, required=False, allow_null=True)
    notes = serializers.CharField(required=False, allow_blank=True, default="")


class OfferCreateSerializer(serializers.Serializer):
    application_id = serializers.IntegerField(required=True)
    salary = serializers.IntegerField(required=False, allow_null=True)
    start_date = serializers.DateField(required=False, allow_null=True)
    letter_url = serializers.CharField(required=False, allow_blank=True, default="")
    status = serializers.CharField(max_length=30, required=False, default="pending")


class TestCreateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=220, required=True, error_messages={"blank": "Tiêu đề bài kiểm tra không được để trống."})
    description = serializers.CharField(required=False, allow_blank=True, default="")
    duration_minutes = serializers.IntegerField(required=False, default=30, min_value=1, max_value=360)
    passing_score = serializers.FloatField(required=False, default=70.0, min_value=0.0, max_value=100.0)
    job_id = serializers.IntegerField(required=False, allow_null=True, default=None)
    status = serializers.CharField(max_length=30, required=False, default="active")
    questions = serializers.ListField(required=False, default=list)


class TalentPoolCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=200, required=True, error_messages={"blank": "Tên nhóm không được để trống."})
    description = serializers.CharField(required=False, allow_blank=True, default="")


class TalentPoolAddCandidateSerializer(serializers.Serializer):
    candidate_id = serializers.IntegerField(required=True)
    notes = serializers.CharField(required=False, allow_blank=True, default="")


class TestUpdateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=220, required=False)
    description = serializers.CharField(required=False, allow_blank=True)
    duration_minutes = serializers.IntegerField(required=False, min_value=1, max_value=360)
    passing_score = serializers.FloatField(required=False, min_value=0.0, max_value=100.0)
    job_id = serializers.IntegerField(required=False, allow_null=True)
    questions = serializers.ListField(required=False)
    status = serializers.CharField(max_length=30, required=False)


class TestAssignSerializer(serializers.Serializer):
    application_ids = serializers.ListField(child=serializers.IntegerField(), required=False, default=list)
    application_id = serializers.IntegerField(required=False, allow_null=True)
    job_id = serializers.IntegerField(required=False, allow_null=True)
    deadline = serializers.CharField(required=False, allow_blank=True, allow_null=True, default=None)


class TestSaveAnswersSerializer(serializers.Serializer):
    answers = serializers.ListField(child=serializers.DictField(), required=True)


class TestSubmitAnswersSerializer(serializers.Serializer):
    answers = serializers.ListField(child=serializers.DictField(), required=False, default=list)
    auto_submitted = serializers.BooleanField(required=False, default=False)


class TestGradeAttemptSerializer(serializers.Serializer):
    score = serializers.FloatField(required=True, min_value=0.0, max_value=100.0)
    feedback = serializers.CharField(required=False, allow_blank=True, default="")


class CompanyManualCandidateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=160, required=True, error_messages={"blank": "Họ và tên ứng viên không được để trống."})
    email = serializers.EmailField(required=True, error_messages={"blank": "Email không được để trống.", "invalid": "Email không đúng định dạng."})
    phone = serializers.CharField(max_length=30, required=False, allow_blank=True, default="")
    job_id = serializers.IntegerField(required=True, error_messages={"null": "Vui lòng chọn vị trí tuyển dụng."})
    notes = serializers.CharField(required=False, allow_blank=True, default="")
    cv_title = serializers.CharField(max_length=200, required=False, allow_blank=True, default="")
    cv_file_url = serializers.CharField(required=False, allow_blank=True, allow_null=True, default="")


