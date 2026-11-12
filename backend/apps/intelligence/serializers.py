from rest_framework import serializers


class CvParseRequestSerializer(serializers.Serializer):
    cv_id = serializers.IntegerField(required=False, allow_null=True)
    raw_text = serializers.CharField(required=False, allow_blank=True, default="")
    save_version = serializers.BooleanField(required=False, default=True)


class CvEvaluateRequestSerializer(serializers.Serializer):
    cv_id = serializers.IntegerField(required=False, allow_null=True)
    cv_data = serializers.DictField(required=False, allow_null=True)
    rubric_version = serializers.CharField(required=False, default="standard_v1.0")

    def validate(self, attrs):
        if not attrs.get("cv_id") and not attrs.get("cv_data"):
            raise serializers.ValidationError("Cần cung cấp cv_id hoặc cv_data để đánh giá.")
        return attrs


class CvJdMatchRequestSerializer(serializers.Serializer):
    cv_id = serializers.IntegerField(required=False, allow_null=True)
    cv_data = serializers.DictField(required=False, allow_null=True)
    job_id = serializers.IntegerField(required=False, allow_null=True)
    jd_text = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        if not attrs.get("cv_id") and not attrs.get("cv_data"):
            raise serializers.ValidationError("Cần cung cấp cv_id hoặc cv_data của CV.")
        if not attrs.get("job_id") and not attrs.get("jd_text"):
            raise serializers.ValidationError("Cần cung cấp job_id hoặc jd_text của tin tuyển dụng.")
        return attrs


class JobRecommendationRequestSerializer(serializers.Serializer):
    cv_id = serializers.IntegerField(required=False, allow_null=True)
    top_k = serializers.IntegerField(required=False, default=10, min_value=1, max_value=50)


class CandidateRecommendationRequestSerializer(serializers.Serializer):
    job_id = serializers.IntegerField(required=True)
    top_k = serializers.IntegerField(required=False, default=10, min_value=1, max_value=50)


class RagQueryRequestSerializer(serializers.Serializer):
    question = serializers.CharField(required=True)
    session_id = serializers.IntegerField(required=False, allow_null=True)
    top_k = serializers.IntegerField(required=False, default=3, min_value=1, max_value=10)
    algorithm = serializers.CharField(required=False, default="hybrid_v2")


class BenchmarkRunRequestSerializer(serializers.Serializer):
    dataset_id = serializers.IntegerField(required=False, allow_null=True)
    config_code = serializers.CharField(required=False, default="hybrid_v1")
    k_list = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        required=False,
        default=[1, 3, 5],
    )


class MockInterviewStartSerializer(serializers.Serializer):
    job_id = serializers.IntegerField(required=False, allow_null=True)
    job_title = serializers.CharField(required=False, allow_blank=True, default="")
    target_role = serializers.CharField(required=False, allow_blank=True, default="")
    level = serializers.CharField(required=False, default="junior")
    years_of_experience = serializers.IntegerField(required=False, default=1)
    skills = serializers.ListField(child=serializers.CharField(), required=False, default=list)


class MockInterviewAnswerSerializer(serializers.Serializer):
    question_id = serializers.IntegerField(required=True)
    answer = serializers.CharField(required=False, allow_blank=True, default="")
    answer_text = serializers.CharField(required=False, allow_blank=True, default="")
    duration_seconds = serializers.IntegerField(required=False, default=0)

    def validate(self, attrs):
        answer = attrs.get("answer") or attrs.get("answer_text")
        if not answer or not answer.strip():
            raise serializers.ValidationError({"answer": "Vui lòng nhập nội dung câu trả lời."})
        attrs["answer"] = answer.strip()
        attrs["answer_text"] = answer.strip()
        return attrs


class KnowledgeDocumentCreateSerializer(serializers.Serializer):
    title = serializers.CharField(required=True, max_length=250)
    content = serializers.CharField(required=True)
    doc_type = serializers.CharField(required=False, default="general", max_length=60)
    source_url = serializers.CharField(required=False, allow_blank=True, default="")
    status = serializers.ChoiceField(choices=["draft", "published", "active", "archived"], required=False, default="draft")
    chunk_size = serializers.IntegerField(required=False, default=600, min_value=100, max_value=2000)
    chunk_overlap = serializers.IntegerField(required=False, default=100, min_value=0, max_value=500)


class KnowledgeDocumentUpdateSerializer(serializers.Serializer):
    title = serializers.CharField(required=False, max_length=250)
    content = serializers.CharField(required=False)
    doc_type = serializers.CharField(required=False, max_length=60)
    source_url = serializers.CharField(required=False, allow_blank=True)
    status = serializers.ChoiceField(choices=["draft", "published", "active", "archived"], required=False)
    chunk_size = serializers.IntegerField(required=False, default=600, min_value=100, max_value=2000)
    chunk_overlap = serializers.IntegerField(required=False, default=100, min_value=0, max_value=500)


