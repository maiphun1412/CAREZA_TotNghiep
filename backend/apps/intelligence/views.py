from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.exceptions import ValidationError
import zipfile
import xml.etree.ElementTree as ET

from apps.authentication.authentication import JWTAuthentication
from apps.authentication.permissions import IsAuthenticatedCustom, IsCandidate, IsEmployer, IsAdmin
from apps.intelligence.services.ai_intelligence_service import (
    CvParserService,
    CvEvaluatorService,
    CvJdMatchingService,
    RecommendationService,
    RagService,
    AiTaskService,
    BenchmarkService,
    KnowledgeBaseService,
)
from apps.intelligence.serializers import (
    CvParseRequestSerializer,
    CvEvaluateRequestSerializer,
    CvJdMatchRequestSerializer,
    JobRecommendationRequestSerializer,
    CandidateRecommendationRequestSerializer,
    RagQueryRequestSerializer,
    BenchmarkRunRequestSerializer,
    KnowledgeDocumentCreateSerializer,
    KnowledgeDocumentUpdateSerializer,
)


class CvParseView(APIView):
    """
    1. Phân tích CV: Tiếp nhận CV từ văn bản, tệp tải lên (PDF, DOCX, TXT) hoặc ID trong candidate.cvs,
    trích xuất học vấn, kinh nghiệm, kỹ năng, dự án, chứng chỉ;
    chuẩn hóa và lưu vào candidate.cvs, candidate.cv_versions.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    @staticmethod
    def extract_text_from_file_object(file_obj, file_name: str) -> str:
        """Trích xuất văn bản từ tệp upload, bảo toàn dòng và cấu trúc văn bản."""
        file_name_lower = file_name.lower()
        if file_name_lower.endswith(".docx"):
            paragraphs = []
            try:
                with zipfile.ZipFile(file_obj) as z:
                    if "word/document.xml" in z.namelist():
                        xml_content = z.read("word/document.xml")
                        tree = ET.fromstring(xml_content)
                        # Duyệt tuần tự các paragraph <w:p> bao gồm cả các ô bảng <w:tc>
                        for node in tree.iter():
                            if node.tag.endswith("p"):
                                p_text = "".join(t for t in node.itertext() if t).strip()
                                if p_text:
                                    paragraphs.append(p_text)
                return "\n".join(paragraphs)
            except Exception as err:
                raise ValidationError({"file": f"Không thể đọc nội dung tệp DOCX: {str(err)}"})

        elif file_name_lower.endswith(".pdf"):
            import pypdf
            try:
                reader = pypdf.PdfReader(file_obj)
                extracted_pages = []
                for page in reader.pages:
                    text = page.extract_text() or ""
                    if text.strip():
                        extracted_pages.append(text.strip())
                if extracted_pages:
                    return "\n\n".join(extracted_pages)
                elif len(reader.pages) > 0:
                    raise ValidationError({
                        "file": "Tệp PDF dạng ảnh quét (scanned) hiện chưa hỗ trợ nhận diện ký tự quang học (OCR). Vui lòng tải lên tệp PDF có văn bản hoặc tệp DOCX."
                    })
                return ""
            except ValidationError:
                raise
            except Exception as err:
                raise ValidationError({"file": f"Không thể đọc nội dung tệp PDF: {str(err)}"})

        elif file_name_lower.endswith((".txt", ".rtf")):
            try:
                content = file_obj.read()
                try:
                    return content.decode("utf-8")
                except UnicodeDecodeError:
                    return content.decode("latin-1", errors="ignore")
            except Exception as err:
                raise ValidationError({"file": f"Không thể đọc tệp văn bản: {str(err)}"})

        return ""

    def post(self, request):
        serializer = CvParseRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        raw_text = data.get("raw_text", "")
        file_obj = request.FILES.get("file")
        if file_obj:
            if file_obj.size > 10 * 1024 * 1024:
                raise ValidationError({"file": "Kích thước tệp vượt quá giới hạn tối đa 10MB."})
            extracted = self.extract_text_from_file_object(file_obj, file_obj.name)
            if extracted:
                raw_text = extracted

        result = CvParserService.execute_cv_parsing(
            user_id=request.user.id,
            cv_id=data.get("cv_id"),
            raw_text=raw_text,
            save_version=data.get("save_version", True),
        )
        return Response({"success": True, "data": result}, status=status.HTTP_200_OK)


class CvEvaluateView(APIView):
    """
    2. Đánh giá CV: Phân tích chất lượng CV, điểm mạnh, điểm yếu,
    kỹ năng còn thiếu và đề xuất cải thiện. Lưu vào intelligence.cv_evaluations (nếu có cv_id).
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def post(self, request):
        serializer = CvEvaluateRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        result = CvEvaluatorService.evaluate_cv(
            user_id=request.user.id,
            cv_id=data.get("cv_id"),
            cv_data=data.get("cv_data"),
            rubric_version=data.get("rubric_version", "standard_v1.0"),
        )
        return Response({"success": True, "data": result}, status=status.HTTP_200_OK)


class CvJdMatchView(APIView):
    """
    3. CV-JD Matching: Đánh giá độ phù hợp giữa CV và tin tuyển dụng
    dựa trên kỹ năng, kinh nghiệm, học vấn và yêu cầu công việc.
    Trả về điểm số, tiêu chí, giải thích và lưu vào intelligence.match_results (nếu có cv_id và job_id).
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def post(self, request):
        serializer = CvJdMatchRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        result = CvJdMatchingService.match(
            user_id=request.user.id,
            cv_id=data.get("cv_id"),
            job_id=data.get("job_id"),
            cv_data=data.get("cv_data"),
            jd_text=data.get("jd_text"),
        )
        return Response({"success": True, "data": result}, status=status.HTTP_200_OK)


class JobRecommendationView(APIView):
    """
    4. Gợi ý việc làm: Đề xuất công việc phù hợp với hồ sơ, kỹ năng, kinh nghiệm của ứng viên.
    Chỉ sử dụng tin tuyển dụng thực tế đang hợp lệ trong database.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def get(self, request):
        cv_id = request.query_params.get("cv_id")
        top_k_param = request.query_params.get("top_k") or request.query_params.get("limit") or "10"
        top_k = int(top_k_param) if str(top_k_param).isdigit() else 10
        cv_id_int = int(cv_id) if cv_id and str(cv_id).isdigit() else None

        results = RecommendationService.recommend_jobs_for_candidate(
            user_id=request.user.id,
            cv_id=cv_id_int,
            top_k=top_k,
        )
        return Response({"success": True, "data": {"recommendations": results}}, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = JobRecommendationRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        results = RecommendationService.recommend_jobs_for_candidate(
            user_id=request.user.id,
            cv_id=data.get("cv_id"),
            top_k=data.get("top_k", 10),
        )
        return Response({"success": True, "data": {"recommendations": results}}, status=status.HTTP_200_OK)


class CandidateRecommendationView(APIView):
    """
    5. Gợi ý ứng viên: Hỗ trợ doanh nghiệp xếp hạng ứng viên phù hợp với từng tin tuyển dụng.
    Chỉ truy cập dữ liệu ứng viên trong phạm vi được phép.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsEmployer]

    def get(self, request):
        job_id = request.query_params.get("job_id")
        if not job_id or not str(job_id).isdigit():
            return Response(
                {"success": False, "error": "Vui lòng cung cấp job_id hợp lệ."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        top_k_param = request.query_params.get("top_k") or request.query_params.get("limit") or "10"
        top_k = int(top_k_param) if str(top_k_param).isdigit() else 10

        results = RecommendationService.recommend_candidates_for_job(
            user_id=request.user.id,
            job_id=int(job_id),
            top_k=top_k,
        )
        return Response({"success": True, "data": {"candidates": results, "recommendations": results}}, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = CandidateRecommendationRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        results = RecommendationService.recommend_candidates_for_job(
            user_id=request.user.id,
            job_id=data["job_id"],
            top_k=data.get("top_k", 10),
        )
        return Response({"success": True, "data": {"candidates": results, "recommendations": results}}, status=status.HTTP_200_OK)


from rest_framework.throttling import UserRateThrottle


class RagChatRateThrottle(UserRateThrottle):
    """Giới hạn tần suất gọi API RAG Chatbot: 30 câu hỏi / phút cho mỗi người dùng."""
    scope = "rag_chat"
    rate = "30/minute"


class RagChatView(APIView):
    """
    6. RAG (Hỏi đáp thông minh có căn cứ):
    Truy xuất từ knowledge.documents và knowledge.chunks,
    quản lý knowledge.rag_sessions và knowledge.rag_messages.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]
    throttle_classes = [RagChatRateThrottle]

    def post(self, request):
        serializer = RagQueryRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        result = RagService.query_rag(
            user_id=request.user.id,
            question=data["question"],
            session_id=data.get("session_id"),
            top_k=data.get("top_k", 3),
            algorithm=data.get("algorithm", "hybrid_v2"),
        )
        return Response({"success": True, "data": result}, status=status.HTTP_200_OK)


class RagSessionDetailView(APIView):
    """Lấy lịch sử hội thoại của 1 phiên RAG có xác thực quyền sở hữu."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def get(self, request, session_id):
        result = RagService.get_session_history(
            user_id=request.user.id,
            session_id=int(session_id),
        )
        return Response({"success": True, "data": result}, status=status.HTTP_200_OK)


# ==============================================================================
# Quản trị Knowledge Base (Documents & Chunks)
# ==============================================================================

class KnowledgeDocumentListCreateView(APIView):
    """
    Danh sách và tạo mới tài liệu Knowledge Base:
    - Chỉ tài khoản Quản trị viên (IsAdmin) mới có quyền tạo tài liệu.
    - Tự động chia nhỏ văn bản thành các chunks và lưu vào database.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsAdmin]

    def get(self, request):
        status_param = request.query_params.get("status")
        doc_type = request.query_params.get("doc_type")
        search = request.query_params.get("search")
        page = int(request.query_params.get("page", 1))
        page_size = int(request.query_params.get("page_size", 20))

        result = KnowledgeBaseService.list_documents(
            status=status_param,
            doc_type=doc_type,
            search=search,
            page=page,
            page_size=page_size,
        )
        return Response({"success": True, "data": result}, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = KnowledgeDocumentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        chunk_size = data.pop("chunk_size", 600)
        chunk_overlap = data.pop("chunk_overlap", 100)

        result = KnowledgeBaseService.create_document(
            data=data,
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
        )
        return Response(
            {"success": True, "message": "Tạo tài liệu và chia chunk thành công.", "data": result},
            status=status.HTTP_201_CREATED,
        )


class KnowledgeDocumentDetailView(APIView):
    """
    Xem chi tiết, cập nhật và xóa tài liệu Knowledge Base:
    - Khi cập nhật nội dung: Tự động chia lại các chunks liên quan trong transaction.
    - Khi xóa tài liệu: Tự động dọn sạch các chunks liên quan.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsAdmin]

    def get(self, request, pk):
        result = KnowledgeBaseService.get_document_detail(doc_id=int(pk))
        return Response({"success": True, "data": result}, status=status.HTTP_200_OK)

    def put(self, request, pk):
        serializer = KnowledgeDocumentUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        chunk_size = data.pop("chunk_size", 600)
        chunk_overlap = data.pop("chunk_overlap", 100)

        result = KnowledgeBaseService.update_document(
            doc_id=int(pk),
            data=data,
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
        )
        return Response(
            {"success": True, "message": "Cập nhật tài liệu và đồng bộ chunks thành công.", "data": result},
            status=status.HTTP_200_OK,
        )

    def patch(self, request, pk):
        return self.put(request, pk)

    def delete(self, request, pk):
        result = KnowledgeBaseService.delete_document(doc_id=int(pk))
        return Response({"success": True, "data": result}, status=status.HTTP_200_OK)


class KnowledgeDocumentPublishView(APIView):
    """Xuất bản tài liệu Knowledge Base để đưa vào phạm vi tìm kiếm công khai."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsAdmin]

    def patch(self, request, pk):
        result = KnowledgeBaseService.publish_document(doc_id=int(pk))
        return Response({"success": True, "data": result}, status=status.HTTP_200_OK)

    def post(self, request, pk):
        return self.patch(request, pk)


class KnowledgeDocumentUnpublishView(APIView):
    """Ngừng xuất bản tài liệu Knowledge Base (chuyển về draft để loại khỏi tìm kiếm công khai)."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsAdmin]

    def patch(self, request, pk):
        result = KnowledgeBaseService.unpublish_document(doc_id=int(pk))
        return Response({"success": True, "data": result}, status=status.HTTP_200_OK)

    def post(self, request, pk):
        return self.patch(request, pk)


class AiTaskListView(APIView):
    """
    7. Quản lý tác vụ AI: Xem danh sách trạng thái, kết quả, thời gian xử lý
    của các tác vụ trong intelligence.ai_tasks.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def get(self, request):
        task_type = request.query_params.get("task_type")
        page = int(request.query_params.get("page", 1))
        page_size = int(request.query_params.get("page_size", 20))

        result = AiTaskService.list_tasks(
            user_id=request.user.id,
            task_type=task_type,
            page=page,
            page_size=page_size,
        )
        return Response({"success": True, "data": result}, status=status.HTTP_200_OK)


class BenchmarkRunView(APIView):
    """
    8. Đánh giá thuật toán: Tận dụng schema research để đánh giá mô hình bằng dữ liệu và metric phù hợp.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def post(self, request):
        serializer = BenchmarkRunRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        result = BenchmarkService.run_benchmark(
            dataset_id=data.get("dataset_id"),
            config_code=data.get("config_code", "hybrid_v1"),
            k_list=data.get("k_list", [1, 3, 5]),
        )
        return Response({"success": True, "data": result}, status=status.HTTP_200_OK)


# ==========================================
# 9. AI Mock Interview & Assessment Views
# ==========================================

from apps.intelligence.services.mock_interview_service import MockInterviewService
from apps.intelligence.serializers import (
    MockInterviewStartSerializer,
    MockInterviewAnswerSerializer,
)


class MockInterviewListView(APIView):
    """
    Quản lý danh sách phiên phỏng vấn thử AI của ứng viên:
    - GET: Danh sách lịch sử phỏng vấn, phân trang.
    - POST: Tạo phiên phỏng vấn mới, sinh câu hỏi thông minh theo JD/CV/level.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def get(self, request):
        page = int(request.query_params.get("page", 1))
        page_size = int(request.query_params.get("page_size", 10))
        result = MockInterviewService.get_interview_history(
            user_id=request.user.id,
            page=page,
            page_size=page_size,
        )
        return Response({"success": True, "data": result}, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = MockInterviewStartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = MockInterviewService.start_interview(
            user_id=request.user.id,
            data=serializer.validated_data,
        )
        return Response({
            "success": True,
            "message": "Khởi tạo phiên phỏng vấn AI thành công.",
            "data": {
                **result,
                "interview": result,
            },
        }, status=status.HTTP_201_CREATED)


class MockInterviewDetailView(APIView):
    """Chi tiết và xóa phiên phỏng vấn thử AI."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def get(self, request, pk):
        result = MockInterviewService.get_interview_detail(
            user_id=request.user.id,
            interview_id=int(pk),
        )
        return Response({
            "success": True,
            "data": {
                **result,
                "interview": result,
            },
        }, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        MockInterviewService.delete_interview(
            user_id=request.user.id,
            interview_id=int(pk),
        )
        return Response({
            "success": True,
            "message": "Xóa phiên phỏng vấn thành công.",
        }, status=status.HTTP_200_OK)


class MockInterviewAnswerView(APIView):
    """Trả lời từng câu hỏi trong phiên phỏng vấn và nhận chấm điểm tức thì."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def post(self, request, pk):
        serializer = MockInterviewAnswerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = MockInterviewService.submit_answer(
            user_id=request.user.id,
            interview_id=int(pk),
            data=serializer.validated_data,
        )
        return Response({
            "success": True,
            "message": "Ghi nhận câu trả lời thành công.",
            "data": result,
        }, status=status.HTTP_200_OK)


class MockInterviewCompleteView(APIView):
    """Hoàn tất phiên phỏng vấn và nhận kết quả đánh giá toàn diện."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom]

    def post(self, request, pk):
        result = MockInterviewService.complete_interview(
            user_id=request.user.id,
            interview_id=int(pk),
        )
        return Response({
            "success": True,
            "message": "Đánh giá toàn diện phiên phỏng vấn thành công.",
            "data": {
                **result,
                "report": result,
            },
        }, status=status.HTTP_200_OK)

