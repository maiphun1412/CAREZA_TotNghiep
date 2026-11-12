# CAREZA RAG Retrieval Benchmark Dataset (v1)

## 1. Giới thiệu tổng quan
Bộ dữ liệu benchmark offline này được xây dựng nhằm đánh giá định lượng năng lực truy xuất (Retrieval) của hệ thống RAG Chatbot trên nền tảng CAREZA. Dữ liệu độc lập hoàn toàn với cơ sở dữ liệu PostgreSQL thực tế, không chứa thông tin giả mạo hoặc ghi đè dữ liệu production.

## 2. Quy mô bộ dữ liệu
- **Số lượng tài liệu gốc (Documents)**: 24 tài liệu
- **Số lượng đoạn tri thức (Chunks)**: 50 chunks (được sinh bằng `TextChunker` hiện hành với `chunk_size=600`, `chunk_overlap=100`)
- **Số lượng câu hỏi đánh giá (Queries)**: 90 câu hỏi
- **Trung bình số chunk/tài liệu**: 2.08 chunks

## 3. Phân bố câu hỏi theo loại hình (Query Types)
| Loại câu hỏi | Số lượng | Tỷ lệ | Mô tả |
| :--- | :--- | :--- | :--- |
| **Direct (Trực tiếp)** | 40 | 44.4% | Câu hỏi tiếng Việt trực tiếp, rõ ràng về nghiệp vụ và tính năng |
| **Synonym/Acronym (Từ đồng nghĩa, viết tắt)** | 18 | 20.0% | Câu hỏi chứa thuật ngữ, từ lóng, viết tắt (JD, CV, HR, ATS, 2FA...) |
| **Indirect (Gián tiếp, tình huống)** | 14 | 15.6% | Diễn đạt tự nhiên, đặt câu hỏi dưới dạng tình huống thực tế |
| **English (Tiếng Anh)** | 8 | 8.9% | Câu hỏi bằng tiếng Anh truy xuất tri thức tiếng Việt/song ngữ |
| **Unanswerable (Không có đáp án)** | 10 | 11.1% | Câu hỏi ngoài phạm vi tri thức (out-of-scope), danh sách nhãn rỗng |
| **Tổng cộng** | **90** | **100%** | |

## 4. Phương pháp tạo dữ liệu & Gán nhãn Relevance
- **Tài liệu nguồn**: Bao phủ toàn bộ các miền nghiệp vụ của CAREZA: tạo/chuẩn hóa CV, AI Đánh giá CV, quy trình ứng tuyển, hồ sơ cá nhân, AI Mock Interview, gợi ý việc làm, tìm kiếm việc làm, đăng tin tuyển dụng, Kanban pipeline, phân quyền RBAC doanh nghiệp, lịch phỏng vấn, Talent Pool, báo cáo phân tích tuyển dụng, xác minh doanh nghiệp, gói dịch vụ, sổ cái tín dụng, bảo mật và chính sách cộng đồng.
- **Tách Chunk**: Sử dụng trực tiếp class `TextChunker` trong source code CAREZA, đảm bảo bảo toàn ranh giới câu từ và ranh giới đoạn văn.
- **Nguyên tắc gán nhãn Ground Truth**:
  - Không sử dụng điểm số TF-IDF, Cosine Similarity hoặc bất kỳ kết quả Retrieval nào của hệ thống để gán nhãn (tránh data leakage và confirmation bias).
  - Nhãn relevance được ánh xạ thủ công và đối soát trực tiếp theo nội dung ngữ nghĩa thực tế của từng chunk.
  - Các câu hỏi ngoài phạm vi tri thức (`unanswerable`) được gắn nhãn danh sách liên quan rỗng `[]`.

## 5. Giới hạn của bộ dữ liệu
- Một số nội dung chính sách thanh toán, gói cước và quy định xử lý khiếu nại là dữ liệu tổng hợp phục vụ benchmark (`disclaimer: true`), không đại diện cho biểu phí pháp lý thương mại chính thức.
- Bộ benchmark v1 tập trung chủ yếu vào văn bản text thuần túy, chưa đánh giá định dạng hình ảnh hoặc bảng biểu phức tạp.
