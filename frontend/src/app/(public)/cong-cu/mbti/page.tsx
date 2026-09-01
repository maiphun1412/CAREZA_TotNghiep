"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Modal, message, Tooltip, Progress } from "antd";
import {
  Brain,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  Shield,
  BookOpen,
  Briefcase,
  Layers,
  Users,
  Compass,
  Headphones,
  Calculator,
  ShieldCheck,
  Bot,
  Lightbulb,
  Check,
  ChevronRight,
  TrendingUp,
  Award,
} from "lucide-react";

// =========================================================================
// 1. DATASET 20 CÂU HỎI TRẮC NGHIỆM MBTI CHUẨN (4 TRỤC: E-I, S-N, T-F, J-P)
// =========================================================================
interface MbtiQuestion {
  id: number;
  dimension: "EI" | "SN" | "TF" | "JP";
  q: string;
  options: {
    label: string;
    text: string;
    trait: "E" | "I" | "S" | "N" | "T" | "F" | "J" | "P";
    weight: number;
  }[];
}

const MBTI_QUESTIONS: MbtiQuestion[] = [
  // --- TRỤC 1: E (Hướng ngoại) vs I (Hướng nội) ---
  {
    id: 1,
    dimension: "EI",
    q: "Sau một tuần làm việc căng thẳng, cách bạn nạp lại năng lượng tốt nhất là:",
    options: [
      { label: "A", text: "Gặp gỡ bạn bè, tham gia các buổi tiệc hoặc hoạt động sôi nổi ngoài trời", trait: "E", weight: 2 },
      { label: "B", text: "Trò chuyện thân mật với một vài người bạn thân thiết trong không gian ấm cúng", trait: "E", weight: 1 },
      { label: "C", text: "Dành thời gian một mình nghe nhạc, đọc sách hoặc làm việc yêu thích", trait: "I", weight: 1 },
      { label: "D", text: "Hoàn toàn yên tĩnh ở nhà để tái tạo năng lượng từ bên trong", trait: "I", weight: 2 },
    ],
  },
  {
    id: 2,
    dimension: "EI",
    q: "Khi bước vào một sự kiện networking hoặc môi trường mới, bạn thường:",
    options: [
      { label: "A", text: "Chủ động bắt chuyện và nhanh chóng làm quen với nhiều người xung quanh", trait: "E", weight: 2 },
      { label: "B", text: "Vui vẻ kết nối nếu có người giới thiệu hoặc bắt đầu cuộc trò chuyện trước", trait: "E", weight: 1 },
      { label: "C", text: "Chỉ tìm kiếm những người quen hoặc đứng quan sát tình hình chung", trait: "I", weight: 1 },
      { label: "D", text: "Cảm thấy tiêu hao năng lượng và thích ở trong nhóm nhỏ ít người", trait: "I", weight: 2 },
    ],
  },
  {
    id: 3,
    dimension: "EI",
    q: "Khi tham gia một dự án nhóm, phong cách đóng góp của bạn là:",
    options: [
      { label: "A", text: "Chủ động đưa ra ý tưởng và dẫn dắt thảo luận sôi nổi cùng mọi người", trait: "E", weight: 2 },
      { label: "B", text: "Đóng góp ý kiến khi được hỏi và nhiệt tình hỗ trợ các thành viên", trait: "E", weight: 1 },
      { label: "C", text: "Tập trung hoàn thành phần việc được giao một cách độc lập và chất lượng", trait: "I", weight: 1 },
      { label: "D", text: "Quan sát, lắng nghe sâu và chỉ đưa ra nhận xét then chốt khi cần thiết", trait: "I", weight: 2 },
    ],
  },
  {
    id: 4,
    dimension: "EI",
    q: "Khi gặp một vấn đề khó khăn cần giải quyết, bạn có xu hướng:",
    options: [
      { label: "A", text: "Nói to suy nghĩ và trao đổi ngay với đồng nghiệp để tìm hướng giải quyết", trait: "E", weight: 2 },
      { label: "B", text: "Thảo luận nhanh với người có chuyên môn sau khi đã lướt qua vấn đề", trait: "E", weight: 1 },
      { label: "C", text: "Tự nghiên cứu, tra cứu tài liệu trước khi thảo luận với người khác", trait: "I", weight: 1 },
      { label: "D", text: "Suy ngẫm cẩn thận một mình cho đến khi tự hình thành giải pháp rõ ràng", trait: "I", weight: 2 },
    ],
  },
  {
    id: 5,
    dimension: "EI",
    q: "Phong cách làm việc hàng ngày giúp bạn đạt năng suất cao nhất:",
    options: [
      { label: "A", text: "Không gian làm việc mở, tương tác liên tục và nhịp độ sôi động", trait: "E", weight: 2 },
      { label: "B", text: "Môi trường có sự phối hợp linh hoạt giữa làm việc nhóm và cá nhân", trait: "E", weight: 1 },
      { label: "C", text: "Góc làm việc riêng tư, ít bị gián đoạn để tập trung chuyên môn", trait: "I", weight: 1 },
      { label: "D", text: "Môi trường yên tĩnh tuyệt đối, tự do điều phối công việc độc lập", trait: "I", weight: 2 },
    ],
  },

  // --- TRỤC 2: S (Cảm nhận) vs N (Trực giác) ---
  {
    id: 6,
    dimension: "SN",
    q: "Khi tiếp nhận một dự án hoặc nhiệm vụ mới, bạn chú ý nhiều hơn đến:",
    options: [
      { label: "A", text: "Các số liệu thực tế, chi tiết cụ thể và các bước thực thi rõ ràng", trait: "S", weight: 2 },
      { label: "B", text: "Quy trình đã được chứng minh hiệu quả qua các bài học thực tế trước đây", trait: "S", weight: 1 },
      { label: "C", text: "Bức tranh toàn cảnh và tiềm năng phát triển trong tương lai", trait: "N", weight: 1 },
      { label: "D", text: "Ý tưởng đột phá, các giả thuyết sáng tạo và khả năng mở rộng mới mẻ", trait: "N", weight: 2 },
    ],
  },
  {
    id: 7,
    dimension: "SN",
    q: "Khi lắng nghe một bài thuyết trình hoặc báo cáo, bạn bị thuyết phục bởi:",
    options: [
      { label: "A", text: "Bằng chứng rõ ràng, dữ liệu định lượng và kết quả đo đếm được", trait: "S", weight: 2 },
      { label: "B", text: "Ví dụ thực tiễn sinh động gắn liền với công việc hàng ngày", trait: "S", weight: 1 },
      { label: "C", text: "Tầm nhìn chiến lược, các xu hướng lớn và sự liên kết ý tưởng", trait: "N", weight: 1 },
      { label: "D", text: "Các khái niệm triết lý sâu sắc, ý nghĩa đổi mới và tiềm năng dài hạn", trait: "N", weight: 2 },
    ],
  },
  {
    id: 8,
    dimension: "SN",
    q: "Trong quá trình học một kỹ năng hoặc kiến thức mới, bạn thích:",
    options: [
      { label: "A", text: "Thực hành từng bước cụ thể theo hướng dẫn chi tiết từ dễ đến khó", trait: "S", weight: 2 },
      { label: "B", text: "Quan sát người khác làm mẫu rồi làm theo theo chuẩn mực có sẵn", trait: "S", weight: 1 },
      { label: "C", text: "Hiểu nguyên lý cốt lõi trước rồi tự mày mò thử nghiệm các cách khác nhau", trait: "N", weight: 1 },
      { label: "D", text: "Tự do sáng tạo, liên hệ với nhiều lĩnh vực khác và phát triển cách làm mới", trait: "N", weight: 2 },
    ],
  },
  {
    id: 9,
    dimension: "SN",
    q: "Bạn đánh giá cao điều gì hơn ở một người lãnh đạo:",
    options: [
      { label: "A", text: "Sự thực tế, năng lực thực thi vững chắc và tính ổn định cao", trait: "S", weight: 2 },
      { label: "B", text: "Khả năng quản lý tài nguyên và giải quyết các bài toán cụ thể", trait: "S", weight: 1 },
      { label: "C", text: "Khả năng truyền cảm hứng và định hướng tương lai cho đội ngũ", trait: "N", weight: 1 },
      { label: "D", text: "Tầm nhìn đổi mới, dám nghĩ lớn và khả năng nhìn trước cơ hội", trait: "N", weight: 2 },
    ],
  },
  {
    id: 10,
    dimension: "SN",
    q: "Khi miêu tả về một sự kiện đã trải qua, bạn thường:",
    options: [
      { label: "A", text: "Kể chính xác những gì đã diễn ra theo trình tự thời gian và chi tiết cụ thể", trait: "S", weight: 2 },
      { label: "B", text: "Nhấn mạnh vào kết quả thực tế và những gì mọi người đã làm", trait: "S", weight: 1 },
      { label: "C", text: "Tóm lược cảm nhận chung và ý nghĩa quan trọng nhất của sự kiện", trait: "N", weight: 1 },
      { label: "D", text: "Liên tưởng đến các ý tưởng mới và bài học sâu sắc rút ra được", trait: "N", weight: 2 },
    ],
  },

  // --- TRỤC 3: T (Lý trí) vs F (Cảm xúc) ---
  {
    id: 11,
    dimension: "TF",
    q: "Khi đưa ra một quyết định quan trọng trong công việc, ưu tiên số một của bạn là:",
    options: [
      { label: "A", text: "Tính logic, sự công bằng khách quan và hiệu quả tối ưu", trait: "T", weight: 2 },
      { label: "B", text: "Phân tích số liệu và tuân thủ các nguyên tắc đã đặt ra", trait: "T", weight: 1 },
      { label: "C", text: "Cân nhắc sự hòa hợp của đội ngũ và cảm xúc của những người liên quan", trait: "F", weight: 1 },
      { label: "D", text: "Giá trị nhân văn, sự đồng cảm và tác động tích cực đến con người", trait: "F", weight: 2 },
    ],
  },
  {
    id: 12,
    dimension: "TF",
    q: "Khi một đồng nghiệp mắc lỗi ảnh hưởng đến dự án, phản ứng đầu tiên của bạn là:",
    options: [
      { label: "A", text: "Thẳng thắn chỉ ra nguyên nhân gốc rễ và yêu cầu khắc phục lỗi ngay", trait: "T", weight: 2 },
      { label: "B", text: "Tập trung phân tích lỗi sai dựa trên quy trình để tránh lặp lại", trait: "T", weight: 1 },
      { label: "C", text: "Hỏi thăm lý do, nhẹ nhàng góp ý để không làm người đó cảm thấy tự ti", trait: "F", weight: 1 },
      { label: "D", text: "Động viên tinh thần, hỗ trợ họ vượt qua áp lực và cùng sửa chữa", trait: "F", weight: 2 },
    ],
  },
  {
    id: 13,
    dimension: "TF",
    q: "Bạn cảm thấy hài lòng nhất khi được người khác nhận xét là một người:",
    options: [
      { label: "A", text: "Sắc bén, tư duy logic vững vàng và có năng lực chuyên môn vượt trội", trait: "T", weight: 2 },
      { label: "B", text: "Công bằng, đáng tin cậy và luôn giữ vững các nguyên tắc rõ ràng", trait: "T", weight: 1 },
      { label: "C", text: "Thấu hiểu, biết lắng nghe và luôn tạo bầu không khí ấm áp", trait: "F", weight: 1 },
      { label: "D", text: "Tận tâm, có lòng trắc ẩn và luôn sẵn lòng giúp đỡ mọi người", trait: "F", weight: 2 },
    ],
  },
  {
    id: 14,
    dimension: "TF",
    q: "Trong một cuộc tranh luận có sự bất đồng ý kiến sâu sắc, bạn sẽ:",
    options: [
      { label: "A", text: "Bảo vệ quan điểm đúng đắn dựa trên luận cứ và sự thật không thể chối cãi", trait: "T", weight: 2 },
      { label: "B", text: "Tập trung vào tính logic của các lập luận để tìm ra giải pháp tối ưu", trait: "T", weight: 1 },
      { label: "C", text: "Tìm kiếm điểm chung để dung hòa mối quan hệ giữa các bên", trait: "F", weight: 1 },
      { label: "D", text: "Ưu tiên giữ gìn hòa khí và sự tôn trọng lẫn nhau hơn là thắng thua", trait: "F", weight: 2 },
    ],
  },
  {
    id: 15,
    dimension: "TF",
    q: "Khi đưa ra lời khen hoặc phản hồi cho người khác, bạn thường:",
    options: [
      { label: "A", text: "Đánh giá chính xác hiệu suất và thành tích đo lường được", trait: "T", weight: 2 },
      { label: "B", text: "Khen ngợi giải pháp thông minh và sự nỗ lực hợp lý trong công việc", trait: "T", weight: 1 },
      { label: "C", text: "Ghi nhận sự cố gắng và tinh thần đóng góp của họ cho tập thể", trait: "F", weight: 1 },
      { label: "D", text: "Bày tỏ sự trân trọng chân thành đối với con người và tâm huyết của họ", trait: "F", weight: 2 },
    ],
  },

  // --- TRỤC 4: J (Nguyên tắc) vs P (Linh hoạt) ---
  {
    id: 16,
    dimension: "JP",
    q: "Cách bạn sắp xếp lịch trình làm việc và cuộc sống hàng ngày:",
    options: [
      { label: "A", text: "Lên kế hoạch chi tiết từ trước, có danh sách to-do list và hoàn thành đúng hạn", trait: "J", weight: 2 },
      { label: "B", text: "Xác định các mốc thời gian rõ ràng và bám sát tiến độ cơ bản", trait: "J", weight: 1 },
      { label: "C", text: "Giữ khung thời gian mở để linh hoạt ứng biến theo tình huống phát sinh", trait: "P", weight: 1 },
      { label: "D", text: "Thích sự tự do, tùy hứng và làm việc hiệu quả nhất khi có cảm hứng", trait: "P", weight: 2 },
    ],
  },
  {
    id: 17,
    dimension: "JP",
    q: "Trước khi bắt đầu một chuyến đi du lịch hoặc kỳ nghỉ, bạn thường:",
    options: [
      { label: "A", text: "Lên lịch trình chi tiết từng ngày, đặt trước vé và khách sạn hoàn chỉnh", trait: "J", weight: 2 },
      { label: "B", text: "Lên danh sách các địa điểm chính cần đến và chuẩn bị đồ đạc cẩn thận", trait: "J", weight: 1 },
      { label: "C", text: "Chỉ đặt vé/phòng cơ bản, còn lại tới nơi sẽ quyết định theo sở thích", trait: "P", weight: 1 },
      { label: "D", text: "Hoàn toàn ngẫu hứng, sẵn sàng đón nhận những trải nghiệm bất ngờ", trait: "P", weight: 2 },
    ],
  },
  {
    id: 18,
    dimension: "JP",
    q: "Khi deadline của dự án đang đến gần, trạng thái của bạn là:",
    options: [
      { label: "A", text: "Đã hoàn thành sớm trước hạn và chỉ cần kiểm tra lại lần cuối", trait: "J", weight: 2 },
      { label: "B", text: "Kiểm soát tốt tiến độ và hoàn thành đúng như kế hoạch đã định", trait: "J", weight: 1 },
      { label: "C", text: "Tập trung bứt phá vào những ngày cuối để đạt hiệu suất cao", trait: "P", weight: 1 },
      { label: "D", text: "Áp lực sát nút giúp bạn bùng nổ ý tưởng sáng tạo và hoàn thành ngoạn mục", trait: "P", weight: 2 },
    ],
  },
  {
    id: 19,
    dimension: "JP",
    q: "Bàn làm việc hoặc không gian sống của bạn thường có trạng thái:",
    options: [
      { label: "A", text: "Ngăn nắp, gọn gàng, mọi thứ đều có vị trí cố định rõ ràng", trait: "J", weight: 2 },
      { label: "B", text: "Tương đối có trật tự và được dọn dẹp định kỳ thường xuyên", trait: "J", weight: 1 },
      { label: "C", text: "Có sự 'bừa bộn có kiểm soát', bạn vẫn tìm được thứ mình cần", trait: "P", weight: 1 },
      { label: "D", text: "Tự do, thoải mái và không đặt nặng việc sắp xếp quá khuôn khổ", trait: "P", weight: 2 },
    ],
  },
  {
    id: 20,
    dimension: "JP",
    q: "Khi một kế hoạch đã định bất ngờ bị thay đổi vào phút chót, bạn cảm thấy:",
    options: [
      { label: "A", text: "Khá khó chịu và ngay lập tức tìm cách lập lại kế hoạch thay thế", trait: "J", weight: 2 },
      { label: "B", text: "Hơi bất tiện nhưng vẫn cố gắng điều chỉnh để kiểm soát tình hình", trait: "J", weight: 1 },
      { label: "C", text: "Bình thường, dễ dàng thích ứng với hoàn cảnh mới", trait: "P", weight: 1 },
      { label: "D", text: "Hào hứng vì có cơ hội trải nghiệm một phương án mới mẻ hơn", trait: "P", weight: 2 },
    ],
  },
];

// =========================================================================
// 2. TỪ ĐIỂN 16 NHÓM TÍNH CÁCH MBTI CHUẨN KHOA HỌC & GỢI Ý NGHỀ NGHIỆP
// =========================================================================
interface MbtiProfile {
  code: string;
  name: string;
  tagline: string;
  overview: string;
  strengths: string[];
  growthAreas: string[];
  workEnvironment: string;
  teamworkStyle: string;
  suggestedCareers: { title: string; field: string }[];
}

const MBTI_PROFILES: { [key: string]: MbtiProfile } = {
  INTJ: {
    code: "INTJ",
    name: "Nhà chiến lược",
    tagline: "Tư duy hệ thống – Tầm nhìn dài hạn – Độc lập quyết đoán",
    overview:
      "Bạn là người có tư duy chiến lược xuất sắc, luôn nhìn thấy bức tranh tổng thể và tìm kiếm giải pháp tối ưu cho những bài toán phức tạp. Bạn đề cao tri thức, tính logic và hiệu quả trong mọi việc.",
    strengths: ["Tư duy chiến lược và quy hoạch dài hạn", "Khả năng phân tích logic sắc bén", "Tự chủ và làm việc độc lập cao", "Luôn hướng tới chuẩn mực hoàn hảo"],
    growthAreas: ["Cần kiên nhẫn hơn với những ý kiến chưa tối ưu", "Lắng nghe và chia sẻ cảm xúc linh hoạt hơn trong nhóm", "Tránh quá khắt khe với bản thân"],
    workEnvironment: "Môi trường tự chủ, đề cao năng lực chuyên môn, ít thủ tục rườm rà và khuyến khích sáng tạo giải pháp mới.",
    teamworkStyle: "Đóng vai trò người định hướng chiến lược, phân tích rủi ro và thiết lập cấu trúc thực thi vững chắc cho nhóm.",
    suggestedCareers: [
      { title: "Software Architect", field: "Công nghệ thông tin" },
      { title: "Data Scientist", field: "Phân tích dữ liệu" },
      { title: "Business Strategist", field: "Chiến lược kinh doanh" },
      { title: "Product Manager", field: "Quản lý sản phẩm" },
      { title: "Financial Analyst", field: "Tài chính - Đầu tư" },
      { title: "System Engineer", field: "Kỹ thuật hệ thống" },
    ],
  },
  INTP: {
    code: "INTP",
    name: "Nhà tư duy logic",
    tagline: "Tò mò trí tuệ – Đổi mới sáng tạo – Phân tích lý thuyết",
    overview:
      "Bạn có niềm đam mê bất tận với các ý tưởng mới và nguyên lý vận hành của vạn vật. Bạn xuất sắc trong việc phát hiện quy luật và xây dựng mô hình tư duy độc đáo.",
    strengths: ["Tư duy phân tích trừu tượng", "Sáng tạo và đổi mới giải pháp", "Khách quan và cởi mở với góc nhìn mới", "Ham học hỏi và nghiên cứu sâu"],
    growthAreas: ["Cần tập trung đưa ý tưởng vào thực thi thực tế", "Chú ý hơn đến các chi tiết quy trình hàng ngày", "Giao tiếp kết quả một cách giản dị"],
    workEnvironment: "Môi trường nghiên cứu tự do, không gò bó thời gian, khuyến khích thử nghiệm và giải quyết vấn đề phức tạp.",
    teamworkStyle: "Người đóng góp ý tưởng đột phá, phát hiện lỗ hổng logic và tối ưu hóa phương pháp tiếp cận.",
    suggestedCareers: [
      { title: "AI/ML Engineer", field: "Trí tuệ nhân tạo" },
      { title: "Research Scientist", field: "Nghiên cứu & Phát triển" },
      { title: "Fullstack Developer", field: "Lập trình phần mềm" },
      { title: "Information Security Analyst", field: "An ninh mạng" },
      { title: "Economist", field: "Kinh tế học" },
      { title: "UX Researcher", field: "Nghiên cứu trải nghiệm" },
    ],
  },
  ENTJ: {
    code: "ENTJ",
    name: "Nhà lãnh đạo quyết đoán",
    tagline: "Tầm nhìn lớn – Quyết đoán mạnh mẽ – Tổ chức hiệu quả",
    overview:
      "Bạn sinh ra để dẫn dắt, luôn tràn đầy năng lượng và có khả năng biến tầm nhìn thành kế hoạch hành động cụ thể. Bạn xuất sắc trong việc tập hợp nguồn lực để đạt mục tiêu.",
    strengths: ["Kỹ năng lãnh đạo và truyền cảm hứng", "Quyết đoán và hành động nhanh chóng", "Tổ chức và quản trị nguồn lực hiệu quả", "Tự tin và kiên định với mục tiêu"],
    growthAreas: ["Lắng nghe cảm xúc và phản hồi của cấp dưới", "Tránh tạo áp lực quá mức lên tập thể", "Tạo không gian cho sự linh hoạt"],
    workEnvironment: "Môi trường tốc độ cao, thách thức lớn, rõ ràng về mục tiêu và cơ hội thăng tiến dựa trên kết quả.",
    teamworkStyle: "Thuyền trưởng định hướng, phân công nhiệm vụ rõ ràng và thúc đẩy cả đội ngũ tiến về phía trước.",
    suggestedCareers: [
      { title: "Chief Executive Officer / Director", field: "Quản trị cấp cao" },
      { title: "Management Consultant", field: "Tư vấn quản trị" },
      { title: "Project Director", field: "Quản lý dự án" },
      { title: "Investment Banker", field: "Đầu tư tài chính" },
      { title: "Tech Lead", field: "Lãnh đạo công nghệ" },
      { title: "Operations Manager", field: "Vận hành doanh nghiệp" },
    ],
  },
  ENTP: {
    code: "ENTP",
    name: "Nhà phát minh đổi mới",
    tagline: "Nhạy bén cơ hội – Hùng biện cuốn hút – Thích thử thách",
    overview:
      "Bạn là người có tư duy nhanh nhạy, thích thử thách những chuẩn mực cũ và luôn tìm thấy cơ hội mới ở bất kỳ đâu. Bạn là nguồn cảm hứng dồi dào cho sự đổi mới.",
    strengths: ["Tư duy phản biện và phản xạ nhạy bén", "Khả năng giao tiếp và thuyết phục xuất sắc", "Sáng tạo không giới hạn", "Thích ứng cao với sự thay đổi"],
    growthAreas: ["Rèn luyện tính kiên nhẫn để hoàn thành dự án đến cùng", "Tránh tranh luận không cần thiết", "Quản lý thời gian có cấu trúc hơn"],
    workEnvironment: "Môi trường năng động, khởi nghiệp sáng tạo, không gò bó nguyên tắc và khuyến khích đổi mới liên tục.",
    teamworkStyle: "Người khởi xướng ý tưởng, thúc đẩy động não (brainstorming) và tìm ra hướng đi bất ngờ cho nhóm.",
    suggestedCareers: [
      { title: "Product Strategist", field: "Chiến lược sản phẩm" },
      { title: "Startup Founder", field: "Khởi nghiệp" },
      { title: "Creative Director", field: "Giám đốc sáng tạo" },
      { title: "Growth Marketer", field: "Tiếp thị tăng trưởng" },
      { title: "Business Development Lead", field: "Phát triển kinh doanh" },
      { title: "Solutions Architect", field: "Kiến trúc giải pháp" },
    ],
  },
  INFJ: {
    code: "INFJ",
    name: "Nhà cố vấn thấu hiểu",
    tagline: "Trực giác sâu sắc – Hướng tới giá trị – Tận tâm vì con người",
    overview:
      "Bạn là mẫu người hiếm có kết hợp giữa tầm nhìn sâu sắc và sự thấu cảm ấm áp. Bạn làm việc với động lực tạo ra những thay đổi tích cực và có ý nghĩa cho cộng đồng.",
    strengths: ["Khả năng thấu hiểu tâm lý con người", "Tầm nhìn định hướng giàu ý nghĩa", "Giao tiếp bằng văn phong tinh tế", "Tận tâm và kiên định với giá trị nhân văn"],
    growthAreas: ["Học cách từ chối để tránh quá tải năng lượng", "Bảo vệ sức khỏe tinh thần", "Thực tế hóa các kỳ vọng lý tưởng"],
    workEnvironment: "Môi trường văn minh, tôn trọng con người, có mục tiêu sứ mệnh rõ ràng và đóng góp tích cực cho xã hội.",
    teamworkStyle: "Người cố vấn hòa giải, gắn kết tinh thần đồng đội và giữ cho dự án luôn đi đúng giá trị cốt lõi.",
    suggestedCareers: [
      { title: "UX/UI Designer", field: "Thiết kế trải nghiệm" },
      { title: "HR Business Partner / Talent Coach", field: "Phát triển nhân tài" },
      { title: "Content Strategist", field: "Chiến lược nội dung" },
      { title: "Career Counselor", field: "Tư vấn hướng nghiệp" },
      { title: "Product Designer", field: "Thiết kế sản phẩm" },
      { title: "Psychologist / Therapist", field: "Tâm lý học" },
    ],
  },
  INFP: {
    code: "INFP",
    name: "Nhà lý tưởng giàu cảm xúc",
    tagline: "Chân thành sâu sắc – Nghệ thuật sáng tạo – Trân trọng bản sắc",
    overview:
      "Bạn luôn sống đúng với những giá trị bên trong, sở hữu trí tưởng tượng phong phú và niềm khao khát tự do thể hiện bản thân. Bạn tìm kiếm công việc có ý nghĩa đích thực.",
    strengths: ["Khả năng sáng tạo nghệ thuật độc đáo", "Sự đồng cảm và chân thành tuyệt đối", "Tư duy cởi mở và linh hoạt", "Tận tụy khi tìm thấy đam mê"],
    growthAreas: ["Tránh quá nhạy cảm trước những lời phê bình khách quan", "Rèn luyện kỹ năng ra quyết định dứt khoát", "Lập kế hoạch thực thi thực tế"],
    workEnvironment: "Không gian làm việc linh hoạt, tôn trọng cá tính riêng, không áp đặt quy tắc cứng nhắc và có giá trị nhân văn.",
    teamworkStyle: "Người mang lại nguồn cảm hứng chân thành, đảm bảo mọi ý kiến đều được lắng nghe và tôn trọng.",
    suggestedCareers: [
      { title: "Copywriter / Creative Writer", field: "Sáng tạo nội dung" },
      { title: "Brand Identity Designer", field: "Thiết kế thương hiệu" },
      { title: "Community Manager", field: "Quản trị cộng đồng" },
      { title: "Instructional Designer", field: "Thiết kế học tập" },
      { title: "Media Producer", field: "Sản xuất truyền thông" },
      { title: "Social Impact Coordinator", field: "Dự án xã hội" },
    ],
  },
  ENFJ: {
    code: "ENFJ",
    name: "Người truyền lửa",
    tagline: "Lôi cuốn ấm áp – Kết nối cộng đồng – Nâng đỡ tiềm năng",
    overview:
      "Bạn là người lãnh đạo nhân văn, có khả năng nhìn thấy tiềm năng ở người khác và truyền cảm hứng để họ cùng phát triển. Bạn xây dựng những tập thể gắn kết phi thường.",
    strengths: ["Giao tiếp và diễn thuyết lôi cuốn", "Khả năng xây dựng mối quan hệ tuyệt vời", "Đồng cảm và nhạy bén với nhu cầu của người khác", "Tổ chức sự kiện và hoạt động nhóm xuất sắc"],
    growthAreas: ["Tránh ôm đồm quá nhiều việc của người khác", "Chấp nhận rằng không thể làm hài lòng tất cả mọi người", "Dành thời gian chăm sóc bản thân"],
    workEnvironment: "Môi trường cởi mở, hướng tới con người, đề cao sự hợp tác và có văn hóa tôn vinh đóng góp của từng thành viên.",
    teamworkStyle: "Người kết nối các thành viên, truyền lửa động lực và tạo môi trường làm việc tích cực, đầy năng lượng.",
    suggestedCareers: [
      { title: "HR Director / People Manager", field: "Quản trị nhân sự" },
      { title: "Marketing Director", field: "Tiếp thị & Truyền thông" },
      { title: "Public Relations Manager", field: "Quan hệ công chúng" },
      { title: "Corporate Trainer / Coach", field: "Đào tạo doanh nghiệp" },
      { title: "DevRel / Community Lead", field: "Phát triển cộng đồng" },
      { title: "Account Director", field: "Quản lý khách hàng" },
    ],
  },
  ENFP: {
    code: "ENFP",
    name: "Người truyền cảm hứng",
    tagline: "Tràn đầy nhiệt huyết – Tò mò sáng tạo – Thân thiện cởi mở",
    overview:
      "Bạn tràn đầy năng lượng tích cực, luôn nhìn thấy những khả năng vô tận trong cuộc sống và có khả năng lan tỏa niềm vui đến mọi người xung quanh.",
    strengths: ["Khả năng tạo dựng kết nối nhanh chóng", "Tư duy sáng tạo và không ngừng đổi mới", "Thích ứng cao và tràn đầy nhiệt huyết", "Tầm nhìn rộng mở và giàu ý tưởng"],
    growthAreas: ["Duy trì sự tập trung vào các chi tiết dài hạn", "Học cách quản lý tài chính và thời gian có kỷ luật", "Tránh phân tán quá nhiều mục tiêu"],
    workEnvironment: "Môi trường tự do, năng động, nhiều hoạt động tương tác, khuyến khích sáng tạo và không có sự lặp lại đơn điệu.",
    teamworkStyle: "Người khuấy động không khí, tạo ra những ý tưởng bất ngờ và kết nối các phòng ban hiệu quả.",
    suggestedCareers: [
      { title: "Creative Campaign Manager", field: "Chiến dịch sáng tạo" },
      { title: "Product Evangelist", field: "Đại sứ sản phẩm" },
      { title: "Content Creator / Media Lead", field: "Truyền thông số" },
      { title: "Event Director", field: "Tổ chức sự kiện" },
      { title: "Scrum Master", field: "Điều phối dự án linh hoạt" },
      { title: "Brand Strategist", field: "Chiến lược thương hiệu" },
    ],
  },
  ISTJ: {
    code: "ISTJ",
    name: "Người thực thi trách nhiệm",
    tagline: "Đáng tin cậy – Có cấu trúc – Chuẩn mực chính xác",
    overview:
      "Bạn là chỗ dựa vững chắc trong bất kỳ tổ chức nào. Bạn coi trọng sự thật, làm việc có phương pháp, giữ chữ tín và luôn đảm bảo mọi việc hoàn thành chuẩn xác.",
    strengths: ["Tính kỷ luật và trách nhiệm cao", "Làm việc có phương pháp và tỉ mỉ", "Đáng tin cậy và luôn giữ lời hứa", "Quản lý quy trình và dữ liệu xuất sắc"],
    growthAreas: ["Linh hoạt hơn trước các thay đổi bất ngờ", "Cởi mở hơn với những ý tưởng đột phá chưa có tiền lệ", "Bày tỏ sự công nhận về mặt cảm xúc"],
    workEnvironment: "Môi trường ổn định, quy trình rõ ràng, đề cao tính chuẩn xác, kỷ luật và sự cam kết lâu dài.",
    teamworkStyle: "Người giữ gìn kỷ luật, đảm bảo chất lượng kỹ thuật và theo dõi tiến độ chính xác đến từng chi tiết.",
    suggestedCareers: [
      { title: "Quality Assurance (QA/QC) Lead", field: "Kiểm định chất lượng" },
      { title: "Chief Accountant / Auditor", field: "Kế toán - Kiểm toán" },
      { title: "Database Administrator", field: "Quản trị cơ sở dữ liệu" },
      { title: "Supply Chain Manager", field: "Chuỗi cung ứng" },
      { title: "Compliance Officer", field: "Pháp chế tuân thủ" },
      { title: "DevOps Engineer", field: "Vận hành hệ thống" },
    ],
  },
  ISFJ: {
    code: "ISFJ",
    name: "Người bảo hộ tận tâm",
    tagline: "Ân cần chu đáo – Trách nhiệm thầm lặng – Trung thành tin cậy",
    overview:
      "Bạn là người luôn quan tâm chăm sóc người khác một cách thực tế và chu đáo. Bạn giữ gìn truyền thống, làm việc bền bỉ và tạo ra sự an tâm cho tập thể.",
    strengths: ["Sự tận tâm và tỉ mỉ đến từng chi tiết", "Kỹ năng tổ chức công việc thực tiễn", "Đáng tin cậy và luôn hỗ trợ đồng đội", "Khả năng ghi nhớ thông tin cụ thể xuất sắc"],
    growthAreas: ["Tự tin lên tiếng bảo vệ quyền lợi cá nhân", "Cởi mở với các phương pháp làm việc mới", "Tránh quá tải vì hy sinh cho người khác"],
    workEnvironment: "Môi trường hòa đồng, an toàn, tôn trọng sự cống hiến thực chất và có tính hợp tác tương trợ cao.",
    teamworkStyle: "Hậu phương vững chắc, chăm lo từng mắt xích vận hành để cả nhóm hoạt động trơn tru.",
    suggestedCareers: [
      { title: "Customer Success Lead", field: "Chăm sóc khách hàng" },
      { title: "Administrative Manager", field: "Quản trị hành chính" },
      { title: "HR Operations Specialist", field: "Vận hành nhân sự" },
      { title: "Medical / Healthcare Coordinator", field: "Y tế - Chăm sóc sức khỏe" },
      { title: "Technical Support Specialist", field: "Hỗ trợ kỹ thuật" },
      { title: "Accountant", field: "Kế toán tài chính" },
    ],
  },
  ESTJ: {
    code: "ESTJ",
    name: "Người quản lý thực thi",
    tagline: "Tổ chức bài bản – Trực tiếp rõ ràng – Hiệu suất cao",
    overview:
      "Bạn là chuyên gia tổ chức và thực thi xuất sắc. Bạn thích sự rõ ràng, cấu trúc mạch lạc và luôn biết cách sắp xếp công việc để đạt hiệu suất cao nhất.",
    strengths: ["Kỹ năng tổ chức và điều hành mạnh mẽ", "Trực tiếp, rõ ràng và trung thực", "Tận tụy và kiên định với mục tiêu", "Quản lý thời gian và ngân sách tối ưu"],
    growthAreas: ["Lắng nghe ý kiến trái chiều một cách kiên nhẫn", "Tôn trọng các phương pháp làm việc linh hoạt", "Chú ý đến cảm xúc của đồng nghiệp"],
    workEnvironment: "Môi trường có cấu trúc thứ bậc rõ ràng, chỉ tiêu cụ thể, đánh giá dựa trên thành tích thực tế và hiệu quả công việc.",
    teamworkStyle: "Người điều phối quy trình, thiết lập tiến độ và đảm bảo các thành viên hoàn thành đúng cam kết.",
    suggestedCareers: [
      { title: "Project Manager (PMP)", field: "Quản lý dự án" },
      { title: "Operations Director", field: "Giám đốc vận hành" },
      { title: "Factory / Plant Manager", field: "Quản lý sản xuất" },
      { title: "Financial Controller", field: "Kiểm soát tài chính" },
      { title: "Business Operations Lead", field: "Vận hành kinh doanh" },
      { title: "Legal & Compliance Manager", field: "Pháp chế doanh nghiệp" },
    ],
  },
  ESFJ: {
    code: "ESFJ",
    name: "Người chăm sóc chu toàn",
    tagline: "Nhiệt tình cởi mở – Gắn kết tập thể – Phục vụ tận tâm",
    overview:
      "Bạn là linh hồn của sự hòa hợp trong tập thể, luôn chu đáo, trách nhiệm và nhiệt tình giúp đỡ mọi người. Bạn tạo ra môi trường làm việc ấm cúng và hiệu quả.",
    strengths: ["Khả năng kết nối và hòa nhập tuyệt vời", "Trách nhiệm, chu đáo và thực tế", "Kỹ năng tổ chức sự kiện và chăm sóc khách hàng", "Nhạy bén với nhu cầu của tập thể"],
    growthAreas: ["Tránh quá bận tâm đến sự đánh giá của người khác", "Tự tin đối mặt với xung đột mang tính xây dựng", "Dành thời gian định hướng bản thân"],
    workEnvironment: "Môi trường thân thiện, hợp tác chặt chẽ, coi trọng sự đóng góp cá nhân và có các mối quan hệ đồng nghiệp gắn bó.",
    teamworkStyle: "Người duy trì tinh thần đồng đội, quan tâm đến từng cá nhân và đảm bảo sự hòa hợp trong suốt quá trình làm việc.",
    suggestedCareers: [
      { title: "HR Generalist / Employee Relations", field: "Quan hệ nhân viên" },
      { title: "Key Account Manager", field: "Quản trị khách hàng lớn" },
      { title: "Public Relations Specialist", field: "Quan hệ công chúng" },
      { title: "Event Coordinator", field: "Tổ chức sự kiện" },
      { title: "Customer Experience (CX) Manager", field: "Trải nghiệm khách hàng" },
      { title: "Hospitality Manager", field: "Dịch vụ - Khách sạn" },
    ],
  },
  ISTP: {
    code: "ISTP",
    name: "Nhà kỹ thuật thực tế",
    tagline: "Thực hành nhạy bén – Khắc phục sự cố – Điềm tĩnh linh hoạt",
    overview:
      "Bạn là bậc thầy giải quyết sự cố thực tế với đôi tay khéo léo và tư duy logic nhạy bén. Bạn điềm tĩnh trước áp lực và luôn tìm ra cách vận hành tối ưu nhất.",
    strengths: ["Khả năng xử lý khủng hoảng điềm tĩnh", "Kỹ năng kỹ thuật và giải quyết sự cố vượt trội", "Thực tế, linh hoạt và nhanh nhạy", "Làm việc hiệu quả không cần giám sát"],
    growthAreas: ["Cải thiện kỹ năng giao tiếp và chia sẻ thông tin", "Lập kế hoạch dài hạn hơn", "Tránh sự nhàm chán với công việc lặp lại"],
    workEnvironment: "Môi trường tự chủ cao, ít họp hành lý thuyết, được trực tiếp thao tác thực tế và giải quyết bài toán kỹ thuật.",
    teamworkStyle: "Chuyên gia kỹ thuật gỡ rối, phản ứng nhanh khi có sự cố phát sinh và đưa ra giải pháp thực dụng nhất.",
    suggestedCareers: [
      { title: "Site Reliability Engineer (SRE)", field: "Độ tin cậy hệ thống" },
      { title: "Hardware / Embedded Engineer", field: "Phần cứng & Nhúng" },
      { title: "Cybersecurity Incident Responder", field: "Ứng cứu sự cố an ninh" },
      { title: "Data Engineer", field: "Kỹ thuật dữ liệu" },
      { title: "Mechanical / Electrical Engineer", field: "Kỹ thuật cơ điện" },
      { title: "Forensic Analyst", field: "Phân tích điều tra" },
    ],
  },
  ISFP: {
    code: "ISFP",
    name: "Nghệ sĩ linh hoạt",
    tagline: "Thẩm mỹ tinh tế – Tự do trải nghiệm – Khiêm tốn ấm áp",
    overview:
      "Bạn cảm nhận thế giới qua lăng kính thẩm mỹ độc đáo, sống trọn vẹn với hiện tại và luôn tôn trọng sự tự do của bản thân cũng như những người xung quanh.",
    strengths: ["Gu thẩm mỹ và sự nhạy cảm nghệ thuật cao", "Khiêm tốn, dễ gần và biết lắng nghe", "Thích ứng linh hoạt và cởi mở", "Tận tâm khi làm công việc yêu thích"],
    growthAreas: ["Tự tin hơn trong việc bày tỏ quan điểm cá nhân", "Lập kế hoạch tài chính và sự nghiệp dài hạn", "Học cách tiếp nhận phản biện khách quan"],
    workEnvironment: "Môi trường sáng tạo, không gò bó thời gian, có không gian riêng tư và khuyến khích thể hiện phong cách cá nhân.",
    teamworkStyle: "Người mang đến các góc nhìn thẩm mỹ tinh tế, tạo sự thoải mái và đồng hành nhẹ nhàng cùng nhóm.",
    suggestedCareers: [
      { title: "Graphic / Visual Designer", field: "Thiết kế đồ họa" },
      { title: "Motion Designer / Video Editor", field: "Đồ họa chuyển động" },
      { title: "Fashion / Interior Designer", field: "Thiết kế thời trang - nội thất" },
      { title: "Front-end Developer", field: "Lập trình giao diện" },
      { title: "Product Photographer", field: "Nhiếp ảnh sản phẩm" },
      { title: "Botanist / Landscape Architect", field: "Kiến trúc cảnh quan" },
    ],
  },
  ESTP: {
    code: "ESTP",
    name: "Người tiên phong thực chiến",
    tagline: "Năng động quyết liệt – Nắm bắt thời cơ – Xử lý nhanh gọn",
    overview:
      "Bạn là người hành động thực chiến, thích nhịp sống nhanh, không ngại rủi ro và luôn biết cách nắm bắt cơ hội trước mắt một cách thông minh và hiệu quả.",
    strengths: ["Khả năng đàm phán và thuyết phục thực chiến", "Phản xạ nhanh nhạy trong tình huống khẩn cấp", "Thực tế, thẳng thắn và giàu năng lượng", "Tạo ra kết quả ngay tức thì"],
    growthAreas: ["Cân nhắc kỹ các rủi ro dài hạn trước khi quyết định", "Kiên nhẫn với các thủ tục và quy trình cần thiết", "Lắng nghe cảm xúc sâu hơn"],
    workEnvironment: "Môi trường cạnh tranh, thưởng phạt theo năng lực, tốc độ nhanh và có nhiều hoạt động giao thương thực tế.",
    teamworkStyle: "Người mở đường, đàm phán chốt giao dịch và đưa cả đội tiến thẳng vào hành động thực tế.",
    suggestedCareers: [
      { title: "Head of Sales / B2B Sales Lead", field: "Kinh doanh chiến lược" },
      { title: "Stock / Crypto Trader", field: "Giao dịch tài chính" },
      { title: "Real Estate Consultant", field: "Bất động sản" },
      { title: "Growth Hacker", field: "Tăng trưởng thị trường" },
      { title: "Crisis Management Specialist", field: "Quản lý khủng hoảng" },
      { title: "Field Operations Manager", field: "Vận hành hiện trường" },
    ],
  },
  ESFP: {
    code: "ESFP",
    name: "Người trình diễn nhiệt thành",
    tagline: "Cuốn hút sôi nổi – Lan tỏa năng lượng – Sống trọn hiện tại",
    overview:
      "Bạn là tâm điểm của niềm vui và sự lạc quan. Bạn yêu cuộc sống, giao tiếp tự nhiên và có tài năng bẩm sinh trong việc kết nối và làm bừng sáng mọi không gian.",
    strengths: ["Khả năng biểu đạt và lôi cuốn đám đông", "Thực tế, nhanh nhạy và thân thiện", "Lạc quan và truyền năng lượng tích cực", "Hào phóng và sẵn sàng hỗ trợ đồng đội"],
    growthAreas: ["Rèn luyện tính kỷ luật và hoàn thành các mục tiêu dài hạn", "Học cách đối diện với các tình huống khó khăn một cách bình tĩnh", "Quản lý chi tiêu hợp lý"],
    workEnvironment: "Môi trường tương tác cao, giàu tính giải trí hoặc dịch vụ, năng động và tôn vinh kỹ năng biểu diễn giao tiếp.",
    teamworkStyle: "Người tạo sự hứng khởi, xóa tan căng thẳng và biến công việc nhóm thành trải nghiệm thú vị.",
    suggestedCareers: [
      { title: "Brand Ambassador / Influencer Lead", field: "Đại sứ thương hiệu" },
      { title: "Event Host / MC Specialist", field: "Dẫn chương trình - Sự kiện" },
      { title: "PR & Event Executive", field: "Truyền thông sự kiện" },
      { title: "Flight Attendant / Hospitality Lead", field: "Dịch vụ hàng không" },
      { title: "Customer Engagement Manager", field: "Tương tác khách hàng" },
      { title: "Performing Artist / Designer", field: "Nghệ thuật trình diễn" },
    ],
  },
};

export default function MbtiTestPage() {
  const [activeNavTab, setActiveNavTab] = useState<"intro" | "test" | "result" | "faq">("test");
  const [currentStep, setCurrentStep] = useState<number>(2); // 1: Giới thiệu, 2: Trả lời, 3: Xem kết quả, 4: Gợi ý
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<{ [questionId: number]: { trait: string; weight: number } }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [testCompleted, setTestCompleted] = useState<boolean>(false);
  const [activeResultTab, setActiveResultTab] = useState<"overview" | "strengths" | "growth" | "work">("overview");
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);

  // Câu hỏi hiện tại
  const currentQuestion = MBTI_QUESTIONS[currentQuestionIndex];
  const progressPercent = Math.round(((currentQuestionIndex + 1) / MBTI_QUESTIONS.length) * 100);

  // Xử lý chọn đáp án
  const handleSelectOption = (trait: string, weight: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: { trait, weight },
    }));
  };

  // Điều hướng câu hỏi
  const handleNextQuestion = () => {
    if (!answers[currentQuestion.id]) {
      message.warning("Vui lòng chọn một phương án phù hợp nhất để tiếp tục!");
      return;
    }
    if (currentQuestionIndex < MBTI_QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Câu cuối cùng -> Submit
      handleSubmitTest();
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // ==================== SCORING ENGINE CHUẨN KHOA HỌC ====================
  const scoreResult = useMemo(() => {
    let scoreE = 0, scoreI = 0;
    let scoreS = 0, scoreN = 0;
    let scoreT = 0, scoreF = 0;
    let scoreJ = 0, scoreP = 0;

    Object.values(answers).forEach((ans) => {
      if (ans.trait === "E") scoreE += ans.weight;
      if (ans.trait === "I") scoreI += ans.weight;
      if (ans.trait === "S") scoreS += ans.weight;
      if (ans.trait === "N") scoreN += ans.weight;
      if (ans.trait === "T") scoreT += ans.weight;
      if (ans.trait === "F") scoreF += ans.weight;
      if (ans.trait === "J") scoreJ += ans.weight;
      if (ans.trait === "P") scoreP += ans.weight;
    });

    const totalEI = scoreE + scoreI || 1;
    const totalSN = scoreS + scoreN || 1;
    const totalTF = scoreT + scoreF || 1;
    const totalJP = scoreJ + scoreP || 1;

    const percentE = Math.round((scoreE / totalEI) * 100);
    const percentI = 100 - percentE;

    const percentS = Math.round((scoreS / totalSN) * 100);
    const percentN = 100 - percentS;

    const percentT = Math.round((scoreT / totalTF) * 100);
    const percentF = 100 - percentT;

    const percentJ = Math.round((scoreJ / totalJP) * 100);
    const percentP = 100 - percentJ;

    const mbtiCode = `${percentI >= percentE ? "I" : "E"}${percentN >= percentS ? "N" : "S"}${percentT >= percentF ? "T" : "F"}${percentJ >= percentP ? "J" : "P"}`;

    const profile = MBTI_PROFILES[mbtiCode] || MBTI_PROFILES["INTJ"];

    return {
      mbtiCode,
      profile,
      percentE,
      percentI,
      percentS,
      percentN,
      percentT,
      percentF,
      percentJ,
      percentP,
      answeredCount: Object.keys(answers).length,
    };
  }, [answers]);

  const handleSubmitTest = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setTestCompleted(true);
      setActiveNavTab("result");
      setCurrentStep(3);
      message.success("Đã phân tích xong kết quả tính cách MBTI của bạn!");
    }, 600);
  };

  const handleResetTest = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setTestCompleted(false);
    setActiveNavTab("test");
    setCurrentStep(2);
    setIsResetModalOpen(false);
    message.info("Đã làm mới bài trắc nghiệm. Bạn có thể bắt đầu lại từ câu 1.");
  };

  return (
    <div className="w-full max-w-[1460px] mx-auto px-4 sm:px-6 md:px-8 xl:px-[38px] pb-12 pt-2 bg-[#f7faff] min-h-screen space-y-4">
      {/* ======================================================== */}
      {/* 1. HERO COMPACT: TRẮC NGHIỆM MBTI                         */}
      {/* ======================================================== */}
      <div className="relative w-full rounded-2xl overflow-hidden min-h-[135px] sm:min-h-[145px] lg:min-h-[150px] bg-gradient-to-r from-[#edf2ff] via-[#f4f7ff] to-[#e8eeff] border border-indigo-100 shadow-2xs p-4 sm:p-5 lg:p-6 flex flex-col justify-between">
        {/* Right Calligraphy & 3D Head Puzzle Assets */}
        <div className="absolute top-0 right-0 h-full w-[50%] md:w-[44%] pointer-events-none select-none overflow-hidden hidden sm:block">
          <div className="relative w-full h-full flex items-center justify-end pr-8">
            {/* Calligraphy Left */}
            <div className="absolute top-3.5 left-2 z-10 text-left -rotate-6 pointer-events-none">
              <span className="font-serif italic text-sm sm:text-base font-bold text-[#0062ff] block leading-tight drop-shadow-2xs">
                Hiểu mình
              </span>
              <span className="font-serif italic text-sm sm:text-base font-bold text-[#0062ff] block leading-tight drop-shadow-2xs">
                Sống đúng chất
              </span>
            </div>

            {/* Visual 3D Head & Dimension Pills */}
            <div className="flex items-center gap-3 relative z-0 pr-1">
              <div className="grid grid-cols-2 gap-1.5 -rotate-6">
                <div className="w-6 h-6 rounded-md bg-blue-500 text-white flex items-center justify-center font-black text-[10px] shadow-xs">
                  I
                </div>
                <div className="w-6 h-6 rounded-md bg-blue-400 text-white flex items-center justify-center font-black text-[10px] shadow-xs">
                  E
                </div>
                <div className="w-6 h-6 rounded-md bg-purple-500 text-white flex items-center justify-center font-black text-[10px] shadow-xs">
                  T
                </div>
                <div className="w-6 h-6 rounded-md bg-purple-400 text-white flex items-center justify-center font-black text-[10px] shadow-xs">
                  F
                </div>
              </div>

              {/* 3D Brain / Head Visual */}
              <div className="w-16 h-20 bg-gradient-to-br from-indigo-500 via-blue-600 to-purple-600 rounded-2xl shadow-lg border-2 border-indigo-200 p-2 flex flex-col items-center justify-center text-white rotate-6 relative overflow-hidden">
                <Brain className="w-9 h-9 text-white drop-shadow-xs" />
              </div>

              <div className="grid grid-cols-2 gap-1.5 rotate-6">
                <div className="w-6 h-6 rounded-md bg-emerald-500 text-white flex items-center justify-center font-black text-[10px] shadow-xs">
                  S
                </div>
                <div className="w-6 h-6 rounded-md bg-emerald-400 text-white flex items-center justify-center font-black text-[10px] shadow-xs">
                  N
                </div>
                <div className="w-6 h-6 rounded-md bg-amber-500 text-white flex items-center justify-center font-black text-[10px] shadow-xs">
                  J
                </div>
                <div className="w-6 h-6 rounded-md bg-amber-400 text-white flex items-center justify-center font-black text-[10px] shadow-xs">
                  P
                </div>
              </div>
            </div>

            {/* Calligraphy Right */}
            <div className="absolute bottom-2 right-2 text-right pointer-events-none hidden xl:block">
              <span className="font-serif italic text-xs font-bold text-indigo-700 block leading-tight">
                16 kiểu tính cách
              </span>
              <span className="font-serif italic text-[11px] font-semibold text-indigo-500 block leading-tight">
                Hàng nghìn cơ hội nghề nghiệp
              </span>
            </div>
          </div>
        </div>

        {/* Content Bên Trái */}
        <div className="relative z-10 max-w-2xl space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Link href="/" className="hover:text-[#0062ff] transition-colors">
              Trang chủ
            </Link>
            <span>›</span>
            <Link href="/cong-cu" className="hover:text-[#0062ff] transition-colors">
              Công cụ
            </Link>
            <span>›</span>
            <span className="text-[#0062ff] font-semibold">Trắc nghiệm MBTI</span>
          </div>

          <div className="flex items-center gap-3 pt-0.5">
            <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-200 text-purple-700 flex items-center justify-center shadow-xs shrink-0">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0 leading-tight">
                  Trắc nghiệm MBTI / Tính cách
                </h1>
                <span className="bg-blue-100/70 text-[#0062ff] text-[10.5px] font-bold px-2.5 py-0.5 rounded-full border border-blue-200/80 hidden sm:inline-block">
                  Hiểu bản thân – Định hướng tương lai
                </span>
              </div>
              <p className="text-xs text-slate-600 font-normal m-0 mt-0.5 leading-relaxed">
                Khám phá tính cách, thế mạnh và gợi ý nghề nghiệp phù hợp để phát triển sự nghiệp bền vững.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. NAVIGATION TABS TRONG TOOL                             */}
      {/* ======================================================== */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => {
            setActiveNavTab("intro");
            setCurrentStep(1);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeNavTab === "intro" || currentStep === 1
              ? "bg-[#0062ff] text-white shadow-xs"
              : "bg-white text-slate-700 hover:text-[#0062ff] hover:bg-blue-50/50 border border-slate-200"
          }`}
        >
          Giới thiệu
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveNavTab("test");
            setCurrentStep(2);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeNavTab === "test" || currentStep === 2
              ? "bg-[#0062ff] text-white shadow-xs"
              : "bg-white text-slate-700 hover:text-[#0062ff] hover:bg-blue-50/50 border border-slate-200"
          }`}
        >
          Làm bài trắc nghiệm
        </button>

        <button
          type="button"
          onClick={() => {
            if (!testCompleted && Object.keys(answers).length < 5) {
              message.info("Vui lòng hoàn thành bài trắc nghiệm để xem kết quả phân tích đầy đủ!");
            }
            setActiveNavTab("result");
            setCurrentStep(3);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeNavTab === "result" || currentStep === 3 || currentStep === 4
              ? "bg-[#0062ff] text-white shadow-xs"
              : "bg-white text-slate-700 hover:text-[#0062ff] hover:bg-blue-50/50 border border-slate-200"
          }`}
        >
          {testCompleted ? "Kết quả của tôi" : "Kết quả mẫu"}
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveNavTab("faq");
            message.info("MBTI không có câu trả lời đúng sai, hãy chọn phương án tự nhiên nhất với bạn.");
          }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeNavTab === "faq"
              ? "bg-[#0062ff] text-white shadow-xs"
              : "bg-white text-slate-700 hover:text-[#0062ff] hover:bg-blue-50/50 border border-slate-200"
          }`}
        >
          Câu hỏi thường gặp
        </button>
      </div>

      {/* ======================================================== */}
      {/* 3. SECTION 1: GIỚI THIỆU VỀ TRẮC NGHIỆM MBTI (4 CARDS)   */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5ECF6] shadow-2xs space-y-3.5">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-800 m-0">
            1. Giới thiệu về trắc nghiệm MBTI
          </h2>
          <p className="text-xs text-slate-600 font-normal m-0 mt-0.5 leading-relaxed max-w-4xl">
            MBTI (Myers-Briggs Type Indicator) là bài trắc nghiệm tính cách phổ biến trên toàn thế giới, giúp bạn hiểu rõ hơn về cách bạn suy nghĩ, ra quyết định và tương tác với thế giới xung quanh.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Card 1 */}
          <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 m-0">Hiểu rõ tính cách</h3>
              <p className="text-[11px] text-slate-500 m-0 mt-0.5 leading-tight">
                Nhận diện điểm mạnh, điểm cần phát triển
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 m-0">Định hướng nghề nghiệp</h3>
              <p className="text-[11px] text-slate-500 m-0 mt-0.5 leading-tight">
                Tìm công việc phù hợp với tính cách
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 m-0">Cải thiện giao tiếp</h3>
              <p className="text-[11px] text-slate-500 m-0 mt-0.5 leading-tight">
                Hiểu cách bạn và người khác tương tác
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0062ff] flex items-center justify-center shrink-0">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 m-0">Phát triển bản thân</h3>
              <p className="text-[11px] text-slate-500 m-0 mt-0.5 leading-tight">
                Ứng dụng tính cách vào học tập và cuộc sống
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. MAIN LAYOUT: TEST AREA (75%) | RIGHT SIDEBAR (25%)    */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4.5 items-start">
        {/* ==================== CỘT TRÁI: TEST CONTAINER (8/12 hoặc 9/12 cols) ==================== */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E5ECF6] shadow-2xs space-y-5">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-800 m-0">
                2. Làm bài trắc nghiệm
              </h2>
              <p className="text-xs text-slate-500 font-normal m-0 mt-0.5">
                Trả lời 20 câu hỏi, thời gian khoảng 8–10 phút. Hãy chọn phương án phù hợp nhất với bản thân, không có đáp án đúng hay sai.
              </p>
            </div>

            {/* 4 Steps Indicator (Cố định 100% khi chuyển tab) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {[
                { id: 1, title: "Giới thiệu" },
                { id: 2, title: "Trả lời câu hỏi" },
                { id: 3, title: "Xem kết quả" },
                { id: 4, title: "Gợi ý phát triển" },
              ].map((step) => {
                const isActive = currentStep === step.id;
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => {
                      setCurrentStep(step.id);
                      if (step.id === 1) setActiveNavTab("intro");
                      else if (step.id === 2) setActiveNavTab("test");
                      else if (step.id === 3 || step.id === 4) setActiveNavTab("result");
                    }}
                    className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#f0f6ff] border-[#bfdbfe] text-[#0062ff] shadow-xs"
                        : "bg-white hover:bg-slate-50 border-slate-200/90 text-slate-700"
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                        isActive
                          ? "bg-[#0062ff] text-white shadow-2xs"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {step.id}
                    </span>
                    <span
                      className={`text-xs sm:text-[12.5px] whitespace-nowrap ${
                        isActive ? "text-[#0062ff] font-bold" : "text-slate-700 font-semibold"
                      }`}
                    >
                      {step.title}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* STEP 1: GIỚI THIỆU & NGUYÊN TẮC */}
            {currentStep === 1 && (
              <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-4 animate-in fade-in">
                <div className="space-y-2">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800 m-0">
                    Nguyên tắc khi làm bài trắc nghiệm MBTI:
                  </h3>
                  <ul className="text-xs text-slate-600 space-y-2 pl-4 m-0 list-disc leading-relaxed">
                    <li>Hãy trả lời theo xu hướng tự nhiên của bạn, không nên chọn theo kỳ vọng của người khác hoặc công việc hiện tại.</li>
                    <li>Không có câu trả lời đúng hay sai, mỗi kiểu tính cách đều có những thế mạnh độc đáo riêng.</li>
                    <li>Bài trắc nghiệm gồm 20 câu hỏi, thời gian hoàn thành trung bình khoảng 8 - 10 phút.</li>
                  </ul>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(2);
                      setActiveNavTab("test");
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[#0062ff] hover:bg-[#0047ba] text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <span>Bắt đầu làm bài ngay</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: TRẢ LỜI CÂU HỎI */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-in fade-in">
                {/* Question Progress & Time Estimate */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Câu {currentQuestionIndex + 1}/{MBTI_QUESTIONS.length}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[#0062ff]">{progressPercent}%</span>
                      <span className="text-slate-400 font-normal hidden sm:inline">|</span>
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        <span>⏱</span> Thời gian ước tính: <strong>8-10 phút</strong>
                      </span>
                    </div>
                  </div>
                  <Progress
                    percent={progressPercent}
                    showInfo={false}
                    strokeColor="#0062ff"
                    railColor="#e2e8f0"
                    className="m-0"
                  />
                </div>

                {/* Question Box */}
                <div className="p-4 sm:p-5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-4">
                  <div className="flex items-start gap-2.5">
                    <span className="px-2.5 py-1 rounded-lg bg-[#0062ff] text-white font-black text-xs shrink-0">
                      Câu {currentQuestion.id}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-800 m-0 leading-relaxed pt-0.5">
                      {currentQuestion.q}
                    </h3>
                  </div>

                  {/* Options 2 Cột Desktop */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {currentQuestion.options.map((opt) => {
                      const isSelected = answers[currentQuestion.id]?.trait === opt.trait;
                      return (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() => handleSelectOption(opt.trait, opt.weight)}
                          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                            isSelected
                              ? "bg-blue-50/90 border-[#0062ff] ring-1 ring-[#0062ff] shadow-xs"
                              : "bg-white hover:bg-slate-50 border-slate-200"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 ${
                              isSelected
                                ? "bg-[#0062ff] border-[#0062ff] text-white"
                                : "border-slate-300 text-slate-600 bg-white"
                            }`}
                          >
                            {opt.label}
                          </div>
                          <span className="text-xs font-medium text-slate-700 leading-relaxed">
                            {opt.text}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    disabled={currentQuestionIndex === 0}
                    onClick={handlePrevQuestion}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Câu trước</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting || !answers[currentQuestion.id]}
                    onClick={handleNextQuestion}
                    className="px-6 py-2.5 rounded-xl bg-[#0062ff] hover:bg-[#0047ba] disabled:opacity-50 text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <span>
                      {currentQuestionIndex < MBTI_QUESTIONS.length - 1
                        ? "Câu tiếp theo"
                        : isSubmitting
                        ? "Đang phân tích..."
                        : "Xem kết quả MBTI"}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-center pt-1">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Kết quả sẽ được lưu tự động. Bạn có thể tạm dừng và tiếp tục bất cứ lúc nào.
                  </span>
                </div>
              </div>
            )}

            {/* STEP 3: XEM KẾT QUẢ MBTI */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-in fade-in">
                {/* Header Kết Quả Lớn */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gradient-to-br from-indigo-50/90 via-purple-50/70 to-blue-50/90 rounded-2xl border border-indigo-200">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl sm:text-3xl font-black text-indigo-700 tracking-tight">
                        {scoreResult.profile.code}
                      </span>
                      <span className="text-lg sm:text-xl font-bold text-slate-800">
                        – {scoreResult.profile.name}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-indigo-900 m-0">
                      {scoreResult.profile.tagline}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsResetModalOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                      <span>Làm lại trắc nghiệm</span>
                    </button>
                  </div>
                </div>

                {/* 4 Trục Tính Cách (Dimension Scores) */}
                <div className="space-y-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                  <h3 className="text-xs font-bold text-slate-800 m-0 uppercase tracking-wider">
                    Tỷ lệ 4 trục tính cách của bạn:
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                    {/* Trục E - I */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                      <div className="flex justify-between font-bold text-[11px]">
                        <span className={scoreResult.percentI >= 50 ? "text-indigo-600" : "text-slate-500"}>
                          Hướng nội (I): {scoreResult.percentI}%
                        </span>
                        <span className={scoreResult.percentE > 50 ? "text-indigo-600" : "text-slate-500"}>
                          Hướng ngoại (E): {scoreResult.percentE}%
                        </span>
                      </div>
                      <Progress
                        percent={scoreResult.percentI}
                        showInfo={false}
                        strokeColor="#4f46e5"
                        railColor="#e0e7ff"
                        className="m-0"
                      />
                    </div>

                    {/* Trục S - N */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                      <div className="flex justify-between font-bold text-[11px]">
                        <span className={scoreResult.percentN >= 50 ? "text-purple-600" : "text-slate-500"}>
                          Trực giác (N): {scoreResult.percentN}%
                        </span>
                        <span className={scoreResult.percentS > 50 ? "text-purple-600" : "text-slate-500"}>
                          Cảm nhận (S): {scoreResult.percentS}%
                        </span>
                      </div>
                      <Progress
                        percent={scoreResult.percentN}
                        showInfo={false}
                        strokeColor="#9333ea"
                        railColor="#f3e8ff"
                        className="m-0"
                      />
                    </div>

                    {/* Trục T - F */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                      <div className="flex justify-between font-bold text-[11px]">
                        <span className={scoreResult.percentT >= 50 ? "text-[#0062ff]" : "text-slate-500"}>
                          Lý trí (T): {scoreResult.percentT}%
                        </span>
                        <span className={scoreResult.percentF > 50 ? "text-[#0062ff]" : "text-slate-500"}>
                          Cảm xúc (F): {scoreResult.percentF}%
                        </span>
                      </div>
                      <Progress
                        percent={scoreResult.percentT}
                        showInfo={false}
                        strokeColor="#0062ff"
                        railColor="#dbeafe"
                        className="m-0"
                      />
                    </div>

                    {/* Trục J - P */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                      <div className="flex justify-between font-bold text-[11px]">
                        <span className={scoreResult.percentJ >= 50 ? "text-emerald-600" : "text-slate-500"}>
                          Nguyên tắc (J): {scoreResult.percentJ}%
                        </span>
                        <span className={scoreResult.percentP > 50 ? "text-emerald-600" : "text-slate-500"}>
                          Linh hoạt (P): {scoreResult.percentP}%
                        </span>
                      </div>
                      <Progress
                        percent={scoreResult.percentJ}
                        showInfo={false}
                        strokeColor="#059669"
                        railColor="#d1fae5"
                        className="m-0"
                      />
                    </div>
                  </div>
                </div>

                {/* Tabs Chi Tiết Kết Quả */}
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-2">
                    <button
                      type="button"
                      onClick={() => setActiveResultTab("overview")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeResultTab === "overview"
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      Tổng quan
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveResultTab("strengths")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeResultTab === "strengths"
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      Điểm mạnh
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveResultTab("growth")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeResultTab === "growth"
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      Điểm cần phát triển
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveResultTab("work")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeResultTab === "work"
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      Môi trường làm việc
                    </button>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {activeResultTab === "overview" && <p className="m-0">{scoreResult.profile.overview}</p>}
                    {activeResultTab === "strengths" && (
                      <ul className="space-y-2 pl-4 m-0 list-disc">
                        {scoreResult.profile.strengths.map((s, idx) => (
                          <li key={idx}><strong>{s}</strong></li>
                        ))}
                      </ul>
                    )}
                    {activeResultTab === "growth" && (
                      <ul className="space-y-2 pl-4 m-0 list-disc">
                        {scoreResult.profile.growthAreas.map((g, idx) => (
                          <li key={idx}>{g}</li>
                        ))}
                      </ul>
                    )}
                    {activeResultTab === "work" && (
                      <div className="space-y-2">
                        <p className="m-0"><strong>Môi trường lý tưởng:</strong> {scoreResult.profile.workEnvironment}</p>
                        <p className="m-0"><strong>Phong cách làm việc nhóm:</strong> {scoreResult.profile.teamworkStyle}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="px-5 py-2.5 rounded-xl bg-[#0062ff] hover:bg-[#0047ba] text-white font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <span>Xem gợi ý phát triển & nghề nghiệp</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: GỢI Ý PHÁT TRIỂN & NGHỀ NGHIỆP */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-in fade-in">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 m-0">
                    Gợi ý lĩnh vực nghề nghiệp tham khảo
                  </h3>
                  <p className="text-xs text-slate-500 m-0 mt-0.5">
                    Các vị trí công việc có thể phù hợp với xu hướng tư duy và năng lượng tự nhiên của bạn:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {scoreResult.profile.suggestedCareers.map((c, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-200 transition-all space-y-1 group">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase block">
                        {c.field}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 group-hover:text-indigo-700 m-0">
                        {c.title}
                      </h4>
                      <Link
                        href={`/viec-lam?keyword=${encodeURIComponent(c.title)}`}
                        className="text-[11px] font-semibold text-[#0062ff] hover:underline inline-flex items-center gap-1 pt-1"
                      >
                        <span>Tìm việc vị trí này</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  ))}
                </div>

                <div className="pt-3 flex flex-wrap items-center gap-3">
                  <Link href="/viec-lam">
                    <button
                      type="button"
                      className="px-5 py-2.5 rounded-xl bg-[#0062ff] hover:bg-[#0047ba] text-white font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer"
                    >
                      <span>Khám phá việc làm phù hợp trên Careza</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Quay lại kết quả MBTI</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section: Bảo mật thông tin & Nguồn tham khảo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-4 bg-white rounded-2xl border border-[#E5ECF6] shadow-2xs flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-800 m-0">Bảo mật thông tin</h4>
                <p className="text-[11px] text-slate-500 m-0 leading-relaxed">
                  Câu trả lời của bạn chỉ được sử dụng để hiển thị kết quả MBTI, không chia sẻ cho bên thứ ba và được bảo mật tuyệt đối.
                </p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#E5ECF6] shadow-2xs flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-800 m-0">Nguồn tham khảo</h4>
                <p className="text-[11px] text-slate-500 m-0 leading-relaxed">
                  Trắc nghiệm MBTI dựa trên lý thuyết của Katharine Cook Briggs và Isabel Briggs Myers.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== CỘT PHẢI: SIDEBAR (4/12 hoặc 3/12 cols) ==================== */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-3.5">
          {/* Card 1: 💡 Bạn có biết? */}
          <div className="bg-[#fffdf5] rounded-2xl p-4 border border-[#fde68a] shadow-2xs space-y-2.5">
            <h3 className="text-xs font-bold text-slate-800 m-0 flex items-center gap-1.5">
              <span>💡</span>
              <span>Bạn có biết?</span>
            </h3>
            <ul className="space-y-2 text-[11px] text-slate-700 pl-0 list-none m-0 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-amber-600 font-bold">✓</span>
                <span>MBTI không đánh giá đúng - sai, mà giúp bạn hiểu sự khác biệt về tính cách.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-600 font-bold">✓</span>
                <span>Kết quả MBTI có thể hỗ trợ định hướng nghề nghiệp, học tập và phát triển bản thân.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-600 font-bold">✓</span>
                <span>Mỗi người đều có những điểm mạnh riêng, không có kiểu tính cách nào tốt hơn kiểu nào.</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Công cụ liên quan */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5ECF6] shadow-2xs space-y-2.5">
            <h3 className="text-xs font-bold text-slate-800 m-0">
              Công cụ liên quan
            </h3>
            <div className="space-y-1.5">
              <Link
                href="/cong-cu"
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-blue-50/60 border border-transparent hover:border-blue-200 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0">
                    <Calculator className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11.5px] font-semibold text-slate-700 group-hover:text-[#0062ff] truncate">
                    Tính lương Gross - Net
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0062ff] group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>

              <Link
                href="/cong-cu/bao-hiem-that-nghiep"
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-emerald-50/60 border border-transparent hover:border-emerald-200 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11.5px] font-semibold text-slate-700 group-hover:text-emerald-700 truncate">
                    Tính bảo hiểm thất nghiệp
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>

              <Link
                href="/ai-career"
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-blue-50/60 border border-transparent hover:border-blue-200 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11.5px] font-semibold text-slate-700 group-hover:text-[#0062ff] truncate">
                    Trợ lý AI Career & Phỏng vấn
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0062ff] group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            </div>
          </div>

          {/* Card 3: Cần hỗ trợ? */}
          <div className="bg-[#f0f7ff] rounded-2xl p-4 border border-[#dbeafe] shadow-2xs space-y-2.5 relative overflow-hidden">
            <div>
              <h4 className="text-xs font-bold text-slate-800 m-0">Cần hỗ trợ?</h4>
              <p className="text-[10.5px] text-slate-600 font-normal m-0 mt-0.5 leading-tight">
                Đội ngũ Careza luôn sẵn sàng đồng hành cùng bạn.
              </p>
            </div>
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => message.info("Tổng đài Careza: 1900 6868")}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-[#0062ff] font-bold text-[11px] border border-blue-200 shadow-2xs flex items-center gap-1 transition-all cursor-pointer"
              >
                <span>Liên hệ hỗ trợ</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              <div className="w-10 h-10 rounded-full bg-blue-100 text-[#0062ff] flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. BOTTOM BANNER                                          */}
      {/* ======================================================== */}
      <div className="relative w-full rounded-2xl overflow-hidden min-h-[100px] sm:min-h-[115px] bg-gradient-to-r from-[#edf5ff] via-[#f4f8ff] to-[#e4efff] border border-blue-100 shadow-2xs p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
        <div className="space-y-1 max-w-lg z-10">
          <h3 className="text-sm sm:text-base font-bold text-slate-800 m-0 leading-tight">
            Hiểu bản thân hôm nay, mở ra nhiều cơ hội hơn ngày mai
          </h3>
          <p className="text-xs text-slate-600 font-normal m-0 leading-relaxed">
            Careza đồng hành cùng bạn trên hành trình phát triển sự nghiệp.
          </p>
        </div>

        {/* CTA Button & Right Visual */}
        <div className="flex items-center gap-5 z-10 shrink-0 pr-2">
          <button
            type="button"
            onClick={() => {
              setActiveNavTab("test");
              window.scrollTo({ top: 200, behavior: "smooth" });
            }}
            className="px-4 py-2 rounded-xl bg-[#0062ff] hover:bg-[#0047ba] text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Bắt đầu khám phá ngay</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <div className="text-right -rotate-3 pointer-events-none select-none hidden sm:block">
            <span className="font-serif italic text-xs sm:text-sm font-bold text-[#0062ff] block leading-tight">
              Better People
            </span>
            <span className="font-serif italic text-xs sm:text-sm font-bold text-[#0062ff] block leading-tight">
              Brighter Careers
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL XÁC NHẬN LÀM LẠI BÀI TRẮC NGHIỆM                    */}
      {/* ======================================================== */}
      <Modal
        title="Xác nhận làm lại bài trắc nghiệm"
        open={isResetModalOpen}
        onCancel={() => setIsResetModalOpen(false)}
        onOk={handleResetTest}
        okText="Tiếp tục làm lại"
        cancelText="Hủy bỏ"
        okButtonProps={{ className: "bg-[#0062ff]" }}
      >
        <p className="text-xs text-slate-600 m-0 py-2">
          Kết quả hiện tại sẽ được thay thế. Bạn có muốn tiếp tục làm lại bài trắc nghiệm từ đầu?
        </p>
      </Modal>
    </div>
  );
}
