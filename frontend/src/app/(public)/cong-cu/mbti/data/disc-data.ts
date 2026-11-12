export type DiscDimension = "D" | "I" | "S" | "C";

export interface DiscQuestion {
  id: number;
  dimension: DiscDimension;
  q: string;
}

export interface DiscDimensionInfo {
  code: DiscDimension;
  name: string;
  vietnameseName: string;
  color: string;
  tagline: string;
  description: string;
  strengths: string[];
  growthAreas: string[];
  communicationStyle: string;
  teamworkRole: string;
  idealEnvironment: string;
  suggestedCareers: { title: string; field: string }[];
}

export const DISC_DIMENSIONS: Record<DiscDimension, DiscDimensionInfo> = {
  D: {
    code: "D",
    name: "Dominance",
    vietnameseName: "Thống trị & Quyết đoán",
    color: "#e11d48",
    tagline: "Quyết đoán – Trực diện – Hướng tới kết quả vượt trội",
    description: "Bạn là người mạnh mẽ, tự tin, hành động nhanh và luôn tập trung vào kết quả cuối cùng. Bạn thích vượt qua các thách thức cam go và nắm quyền kiểm soát tình hình.",
    strengths: ["Ra quyết định nhanh chóng", "Dám chịu trách nhiệm và chấp nhận rủi ro", "Tập trung cao độ vào mục tiêu", "Thúc đẩy tiến độ quyết liệt"],
    growthAreas: ["Cần kiên nhẫn lắng nghe ý kiến người khác", "Tránh áp đặt quan điểm cá nhân", "Quan tâm hơn đến cảm xúc đồng đội"],
    communicationStyle: "Ngắn gọn, súc tích, đi thẳng vào vấn đề chính, không thích vòng vo hoa mỹ.",
    teamworkRole: "Người tiên phong mở đường, đặt ra tiêu chuẩn cao và thúc đẩy cả nhóm vượt qua khó khăn.",
    idealEnvironment: "Môi trường cạnh tranh, tốc độ cao, có quyền tự chủ và đánh giá minh bạch theo thành tích.",
    suggestedCareers: [
      { title: "Giám đốc Điều hành (CEO/COO)", field: "Quản trị cấp cao" },
      { title: "Trưởng phòng Kinh doanh (Head of Sales)", field: "Phát triển kinh doanh" },
      { title: "Giám đốc Dự án (Project Director)", field: "Quản lý dự án" },
      { title: "Luật sư Tranh tụng", field: "Pháp lý" },
      { title: "Quản lý Khủng hoảng", field: "Chiến lược doanh nghiệp" },
    ],
  },
  I: {
    code: "I",
    name: "Influence",
    vietnameseName: "Ảnh hưởng & Thuyết phục",
    color: "#d97706",
    tagline: "Nhiệt huyết – Lan tỏa cảm hứng – Xây dựng quan hệ",
    description: "Bạn là người cởi mở, giàu năng lượng tích cực, có tài thuyết phục và tạo dựng các mối quan hệ gắn kết. Bạn truyền cảm hứng và tinh thần lạc quan cho mọi người xung quanh.",
    strengths: ["Giao tiếp và kết nối tự nhiên", "Truyền cảm hứng và động lực", "Sáng tạo và nhiều ý tưởng mới", "Lạc quan và giải tỏa căng thẳng"],
    growthAreas: ["Cần tập trung vào các chi tiết và dữ liệu cụ thể", "Quản lý thời gian có kỷ luật hơn", "Theo dõi công việc đến khi hoàn tất"],
    communicationStyle: "Thân thiện, ấm áp, giàu cảm xúc, sử dụng câu chuyện và ngôn từ truyền cảm hứng.",
    teamworkRole: "Người khuấy động không khí, gắn kết các thành viên và đại diện truyền thông cho nhóm.",
    idealEnvironment: "Môi trường tương tác cao, giàu tính sáng tạo, không gò bó khuôn phép và được công nhận thành tích.",
    suggestedCareers: [
      { title: "Giám đốc Tiếp thị (CMO)", field: "Marketing & Thương hiệu" },
      { title: "Chuyên viên Quan hệ Công chúng (PR)", field: "Truyền thông" },
      { title: "Giám đốc Quan hệ Khách hàng (CRM)", field: "Dịch vụ khách hàng" },
      { title: "Huấn luyện viên / Diễn giả", field: "Đào tạo & Phát triển" },
      { title: "Nhà sáng tạo Nội dung (Creator)", field: "Truyền thông số" },
    ],
  },
  S: {
    code: "S",
    name: "Steadiness",
    vietnameseName: "Kiên định & Hòa nhã",
    color: "#059669",
    tagline: "Đáng tin cậy – Lắng nghe thấu cảm – Hậu phương vững chắc",
    description: "Bạn là người điềm tĩnh, trung thành, kiên nhẫn và luôn sẵn sàng hỗ trợ đồng đội. Bạn trân trọng sự hòa hợp, ổn định và xây dựng mối quan hệ làm việc chân thành lâu dài.",
    strengths: ["Lắng nghe và thấu hiểu xuất sắc", "Đáng tin cậy và hoàn thành việc đều đặn", "Tạo dựng sự an tâm cho tập thể", "Bền bỉ và trung thành"],
    growthAreas: ["Cần chủ động đón nhận sự thay đổi nhanh", "Mạnh dạn bày tỏ quan điểm và bất đồng", "Tăng tốc độ ra quyết định khi khẩn cấp"],
    communicationStyle: "Nhẹ nhàng, từ tốn, lắng nghe nhiều hơn nói, tôn trọng và tạo cảm giác an toàn cho người đối diện.",
    teamworkRole: "Hậu phương vững chãi, người hòa giải mâu thuẫn và giữ cho cả đội ngũ đoàn kết bền chặt.",
    idealEnvironment: "Môi trường ổn định, ít biến động đột ngột, có văn hóa nhân văn và tôn trọng sự đóng góp thầm lặng.",
    suggestedCareers: [
      { title: "Trưởng phòng Nhân sự (HR Manager)", field: "Quản trị nhân lực" },
      { title: "Customer Success Lead", field: "Chăm sóc khách hàng" },
      { title: "Chuyên viên Tư vấn Tâm lý / Hướng nghiệp", field: "Tư vấn & Giáo dục" },
      { title: "Điều phối viên Vận hành (Operations)", field: "Vận hành doanh nghiệp" },
      { title: "Chuyên viên Quản lý Chất lượng", field: "Kiểm soát quy trình" },
    ],
  },
  C: {
    code: "C",
    name: "Conscientiousness",
    vietnameseName: "Tuân thủ & Chuẩn xác",
    color: "#0284c7",
    tagline: "Logic chặt chẽ – Tỉ mỉ chính xác – Đề cao chuẩn mực",
    description: "Bạn là người có tư duy phân tích sâu sắc, coi trọng sự thật, độ chính xác và các tiêu chuẩn chất lượng cao. Bạn làm việc có phương pháp khoa học và không chấp nhận sự cẩu thả.",
    strengths: ["Phân tích logic và dữ liệu xuất sắc", "Tỉ mỉ, cẩn trọng đến từng chi tiết", "Đảm bảo chất lượng theo chuẩn mực", "Làm việc có hệ thống rõ ràng"],
    growthAreas: ["Tránh quá cầu toàn làm chậm tiến độ", "Chấp nhận các giải pháp 'đủ tốt' trong thời gian gấp", "Cởi mở hơn với các ý kiến linh hoạt"],
    communicationStyle: "Khách quan, dựa trên dữ liệu, con số và luận cứ xác thực; rõ ràng, khúc chiết.",
    teamworkRole: "Người kiểm định chất lượng, phát hiện lỗ hổng rủi ro và thiết lập cấu trúc thực thi vững chắc.",
    idealEnvironment: "Môi trường chuyên nghiệp, đề cao chuyên môn sâu, có thời gian phân tích và tiêu chuẩn rõ ràng.",
    suggestedCareers: [
      { title: "Kiến trúc sư Hệ thống (Software Architect)", field: "Công nghệ thông tin" },
      { title: "Chuyên gia Phân tích Dữ liệu (Data Analyst)", field: "Dữ liệu & Thống kê" },
      { title: "Kiểm toán viên / Kế toán trưởng", field: "Tài chính - Kế toán" },
      { title: "Kỹ sư Đảm bảo Chất lượng (QA/QC)", field: "Công nghệ & Sản xuất" },
      { title: "Chuyên viên Quản trị Rủi ro & Pháp chế", field: "Pháp lý & Tuân thủ" },
    ],
  },
};

export const DISC_OPTIONS = [
  { label: "1", text: "Rất hiếm khi đúng với tôi", score: 1 },
  { label: "2", text: "Thỉnh thoảng đúng với tôi", score: 2 },
  { label: "3", text: "Thường xuyên đúng với tôi", score: 3 },
  { label: "4", text: "Rất chính xác với phong cách của tôi", score: 4 },
];

export const STANDARD_DISC_OPTIONS = [
  { label: "1", text: "Rất hiếm khi đúng với tôi", score: 1 },
  { label: "2", text: "Thỉnh thoảng đúng", score: 2 },
  { label: "3", text: "Thường xuyên đúng", score: 3 },
  { label: "4", text: "Rất chính xác với con người tôi", score: 4 },
];

export const DISC_QUESTIONS: DiscQuestion[] = [
  // --- NHÓM D: DOMINANCE (1–6) ---
  { id: 1, dimension: "D", q: "Khi đối mặt với thử thách khó khăn, tôi có xu hướng trực tiếp xông pha và quyết tâm vượt qua." },
  { id: 2, dimension: "D", q: "Tôi coi trọng kết quả công việc cuối cùng hơn là các thủ tục hành chính rườm rà xung quanh." },
  { id: 3, dimension: "D", q: "Tôi dám đưa ra quyết định nhanh chóng trong những tình huống khẩn cấp và chấp nhận rủi ro có tính toán." },
  { id: 4, dimension: "D", q: "Tôi thẳng thắn, trực diện khi phản hồi ý kiến mà không ngần ngại va chạm vì hiệu quả chung." },
  { id: 5, dimension: "D", q: "Tôi thích nắm quyền chủ động và dẫn dắt người khác hành động theo các mục tiêu lớn." },
  { id: 6, dimension: "D", q: "Áp lực công việc cao kích thích tinh thần cạnh tranh và ý chí giành chiến thắng trong tôi." },

  // --- NHÓM I: INFLUENCE (7–12) ---
  { id: 7, dimension: "I", q: "Tôi có khả năng truyền cảm hứng, sự nhiệt huyết và tinh thần lạc quan cho đồng đội." },
  { id: 8, dimension: "I", q: "Tôi dễ dàng xây dựng mối quan hệ tin cậy và tạo ấn tượng tốt ngay từ lần đầu gặp mặt." },
  { id: 9, dimension: "I", q: "Tôi thích được giao lưu, mở rộng mạng lưới quan hệ và chia sẻ những ý tưởng sáng tạo." },
  { id: 10, dimension: "I", q: "Tôi thuyết phục người khác bằng cảm xúc chân thành, năng lượng tích cực và tầm nhìn hấp dẫn." },
  { id: 11, dimension: "I", q: "Tôi coi trọng sự công nhận, ghi nhận thành tích từ tập thể và đồng nghiệp." },
  { id: 12, dimension: "I", q: "Tôi yêu thích sự đổi mới, ghét sự đơn điệu và luôn tìm kiếm cách làm việc thú vị hơn." },

  // --- NHÓM S: STEADINESS (13–18) ---
  { id: 13, dimension: "S", q: "Tôi là người kiên nhẫn, đáng tin cậy và luôn hoàn thành nhiệm vụ với sự nhất quán cao." },
  { id: 14, dimension: "S", q: "Tôi trân trọng sự ổn định, hòa thuận trong tập thể và cố gắng tránh các xung đột gay gắt." },
  { id: 15, dimension: "S", q: "Tôi là người lắng nghe xuất sắc, luôn thấu hiểu và hỗ trợ đồng đội một cách thầm lặng." },
  { id: 16, dimension: "S", q: "Tôi thích môi trường làm việc có nhịp độ đều đặn, dự đoán được và ít biến động đột ngột." },
  { id: 17, dimension: "S", q: "Khi có sự thay đổi lớn, tôi cần thời gian để thích nghi và chuẩn bị kỹ lưỡng." },
  { id: 18, dimension: "S", q: "Tôi trung thành, gắn bó lâu dài và coi trọng mối quan hệ chân thành trong công việc." },

  // --- NHÓM C: CONSCIENTIOUSNESS (19–24) ---
  { id: 19, dimension: "C", q: "Tôi luôn hướng tới sự chính xác tuyệt đối, đề cao tính logic và các tiêu chuẩn chất lượng cao." },
  { id: 20, dimension: "C", q: "Tôi kiểm tra kỹ lưỡng các chi tiết và số liệu trước khi đưa ra kết luận hoặc báo cáo." },
  { id: 21, dimension: "C", q: "Tôi thích làm việc theo quy trình khoa học, có căn cứ rõ ràng và phương pháp đo lường được." },
  { id: 22, dimension: "C", q: "Tôi luôn cân nhắc thận trọng mọi rủi ro có thể phát sinh trước khi bắt tay thực hiện." },
  { id: 23, dimension: "C", q: "Tôi thích tìm kiếm giải pháp có tính hệ thống thay vì các biện pháp tạm bợ ngắn hạn." },
  { id: 24, dimension: "C", q: "Tôi đề cao tính khách quan, sự công bằng và sự tôn trọng các nguyên tắc đã thống nhất." },
];

export function calculateDiscScore(answers: { [questionId: number]: { label: string; score: number } }) {
  const scores: Record<DiscDimension, number> = {
    D: 0,
    I: 0,
    S: 0,
    C: 0,
  };

  DISC_QUESTIONS.forEach((q) => {
    const ans = answers[q.id];
    if (ans) {
      scores[q.dimension] += ans.score;
    }
  });

  const total = scores.D + scores.I + scores.S + scores.C || 1;

  const percentages: Record<DiscDimension, number> = {
    D: Math.round((scores.D / total) * 100),
    I: Math.round((scores.I / total) * 100),
    S: Math.round((scores.S / total) * 100),
    C: Math.round((scores.C / total) * 100),
  };

  // Xác định nhóm nổi bật
  const sorted = (Object.keys(scores) as DiscDimension[]).sort((a, b) => scores[b] - scores[a]);
  const primary = sorted[0];
  const secondary = sorted[1];

  const discProfile = DISC_DIMENSIONS[primary];

  return {
    scores,
    percentages,
    primary,
    secondary,
    discProfile,
    code: `${primary}${secondary}`,
    answeredCount: Object.keys(answers).length,
  };
}

export type DiscResult = ReturnType<typeof calculateDiscScore>;
export const DISC_TRAITS_INFO = DISC_DIMENSIONS;

