from django.urls import path
from apps.intelligence.views import (
    CvParseView,
    CvEvaluateView,
    CvJdMatchView,
    JobRecommendationView,
    CandidateRecommendationView,
    RagChatView,
    RagSessionDetailView,
    KnowledgeDocumentListCreateView,
    KnowledgeDocumentDetailView,
    KnowledgeDocumentPublishView,
    KnowledgeDocumentUnpublishView,
    AiTaskListView,
    BenchmarkRunView,
    MockInterviewListView,
    MockInterviewDetailView,
    MockInterviewAnswerView,
    MockInterviewCompleteView,
)

app_name = "intelligence"

urlpatterns = [
    # 1. Phân tích CV
    path("cv-parse/", CvParseView.as_view(), name="ai-cv-parse"),

    # 2. Đánh giá CV
    path("cv-evaluate/", CvEvaluateView.as_view(), name="ai-cv-evaluate"),

    # 3. CV - JD Matching
    path("match/", CvJdMatchView.as_view(), name="ai-cv-jd-match"),

    # 4. Gợi ý việc làm (Candidate)
    path("recommendations/jobs/", JobRecommendationView.as_view(), name="ai-job-recommendations"),

    # 5. Gợi ý ứng viên (Employer)
    path("recommendations/candidates/", CandidateRecommendationView.as_view(), name="ai-candidate-recommendations"),

    # 6. RAG (Hỏi đáp kiến thức nghề nghiệp có căn cứ)
    path("rag/chat/", RagChatView.as_view(), name="ai-rag-chat"),
    path("rag/sessions/<int:session_id>/", RagSessionDetailView.as_view(), name="ai-rag-session-detail"),

    # Quản trị Knowledge Base (Documents & Chunks)
    path("knowledge/documents/", KnowledgeDocumentListCreateView.as_view(), name="knowledge-doc-list-create"),
    path("knowledge/documents/<int:pk>/", KnowledgeDocumentDetailView.as_view(), name="knowledge-doc-detail"),
    path("knowledge/documents/<int:pk>/publish/", KnowledgeDocumentPublishView.as_view(), name="knowledge-doc-publish"),
    path("knowledge/documents/<int:pk>/unpublish/", KnowledgeDocumentUnpublishView.as_view(), name="knowledge-doc-unpublish"),

    # 7. Quản lý tác vụ AI
    path("tasks/", AiTaskListView.as_view(), name="ai-task-list"),

    # 8. Đánh giá thuật toán & Benchmark
    path("benchmark/run/", BenchmarkRunView.as_view(), name="ai-benchmark-run"),

    # 9. AI Mock Interview (Phỏng vấn thử thông minh)
    path("interviews/", MockInterviewListView.as_view(), name="ai-interview-list"),
    path("interviews/<int:pk>/", MockInterviewDetailView.as_view(), name="ai-interview-detail"),
    path("interviews/<int:pk>/answer/", MockInterviewAnswerView.as_view(), name="ai-interview-answer"),
    path("interviews/<int:pk>/complete/", MockInterviewCompleteView.as_view(), name="ai-interview-complete"),
]
