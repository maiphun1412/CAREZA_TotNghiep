# CAREZA RAG Retrieval Holdout Dataset (v1)

## 1. Giới thiệu
Bộ dữ liệu kiểm thử độc lập (Holdout Test Set) được xây dựng nhằm đánh giá khả năng tổng quát hóa (Generalization) của các thuật toán RAG Retrieval (Baseline TF-IDF vs Hybrid Lexical Search). Bộ dữ liệu hoàn toàn tách biệt, sử dụng tài liệu và câu hỏi mới, không trùng lặp với bộ 90 câu của giai đoạn phát triển.

## 2. Quy mô
- **Số tài liệu**: 14 tài liệu (14 documents mới)
- **Số chunk**: 25 chunks (chia bằng `TextChunker` chuẩn)
- **Số câu hỏi**: 55 câu hỏi (48 câu có đáp án, 7 câu unanswerable)
- **Đặc trưng kiểm thử**: Bổ sung nhiều tình huống thực tế, câu hỏi gián tiếp hội thoại, thuật ngữ tiếng Anh và các câu hỏi ngoài phạm vi có chứa từ khóa bẫy gần gũi với tuyển dụng/hệ thống (bảo hiểm thất nghiệp, công chức, máy chấm công, work permit...).

## 3. Tuyên bố từ chối trách nhiệm (Disclaimer)
Dữ liệu tổng hợp phục vụ mục đích benchmark và kiểm thử độc lập RAG Retrieval, nhãn tham chiếu chưa được chuyên gia độc lập xác nhận.
