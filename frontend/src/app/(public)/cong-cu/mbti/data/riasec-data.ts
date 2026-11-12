export type RiasecGroup = "R" | "I" | "A" | "S" | "E" | "C";

export interface RiasecQuestion {
  id: number;
  group: RiasecGroup;
  q: string;
  options: {
    label: string;
    text: string;
    score: number;
  }[];
}

export interface RiasecGroupInfo {
  code: RiasecGroup;
  name: string;
  vietnameseName: string;
  color: string;
  tagline: string;
  description: string;
  traits: string[];
  workEnvironment: string;
  suggestedCareers: { title: string; field: string }[];
}

export const RIASEC_GROUPS: Record<RiasecGroup, RiasecGroupInfo> = {
  R: {
    code: "R",
    name: "Realistic",
    vietnameseName: "Người thực tế & Kỹ thuật",
    color: "#0284c7",
    tagline: "Khéo léo – Thao tác cụ thể – Yêu thích máy móc, công cụ",
    description: "Bạn thích làm việc với những sự vật cụ thể, hữu hình như máy móc, thiết bị kỹ thuật, vật liệu hoặc cây cối. Bạn giải quyết vấn đề bằng hành động thực tế hơn là tranh luận lý thuyết.",
    traits: ["Khéo léo và sức bền tốt", "Tư duy logic thực tiễn", "Thích sản phẩm hữu hình", "Độc lập và kiên trì"],
    workEnvironment: "Nhà xưởng, phòng thí nghiệm kỹ thuật, công trường, môi trường ngoài trời hoặc vận hành hệ thống phần cứng.",
    suggestedCareers: [
      { title: "Kỹ sư Cơ khí / Điện tử", field: "Kỹ thuật & Công nghệ" },
      { title: "Kỹ sư Phần cứng / Nhúng", field: "Công nghệ thông tin" },
      { title: "Chuyên viên Vận hành Hệ thống", field: "Sản xuất & Vận hành" },
      { title: "Kiến trúc sư Xây dựng", field: "Kiến trúc & Xây dựng" },
      { title: "Kỹ thuật viên Tự động hóa", field: "Tự động hóa - Robot" },
      { title: "Chuyên gia Logistics Hiện trường", field: "Chuỗi cung ứng" },
    ],
  },
  I: {
    code: "I",
    name: "Investigative",
    vietnameseName: "Người nghiên cứu & Khám phá",
    color: "#059669",
    tagline: "Tư duy phân tích – Tò mò khoa học – Thấu suốt nguyên lý",
    description: "Bạn có niềm say mê khám phá tri thức, tìm kiếm nguyên nhân gốc rễ và cơ chế hoạt động của vạn vật. Bạn xuất sắc trong việc phân tích dữ liệu, giải mã vấn đề phức tạp và phát triển các giải pháp khoa học.",
    traits: ["Tư duy phản biện sắc bén", "Ham học hỏi và nghiên cứu sâu", "Khách quan và dựa trên bằng chứng", "Độc lập trong suy nghĩ"],
    workEnvironment: "Viện nghiên cứu, trung tâm dữ liệu, bộ phận R&D doanh nghiệp công nghệ, hoặc môi trường học thuật sáng tạo.",
    suggestedCareers: [
      { title: "Data Scientist / Data Analyst", field: "Phân tích dữ liệu" },
      { title: "Kỹ sư Trí tuệ nhân tạo (AI/ML)", field: "Trí tuệ nhân tạo" },
      { title: "Chuyên gia Nghiên cứu Thị trường", field: "Phân tích thị trường" },
      { title: "Kỹ sư An toàn thông tin", field: "An ninh mạng" },
      { title: "Chuyên gia Kinh tế / Tài chính lượng tử", field: "Kinh tế & Tài chính" },
      { title: "Nghiên cứu viên Y sinh / Dược phẩm", field: "Y sinh & Công nghệ sinh học" },
    ],
  },
  A: {
    code: "A",
    name: "Artistic",
    vietnameseName: "Người nghệ thuật & Sáng tạo",
    color: "#d97706",
    tagline: "Trực giác phong phú – Thẩm mỹ độc bản – Bứt phá khuôn mẫu",
    description: "Bạn là người giàu cảm xúc, có gu thẩm mỹ cao và nhu cầu tự do thể hiện bản thân qua ngôn từ, hình ảnh, âm nhạc hoặc ý tưởng. Bạn không thích bị bó buộc vào quy trình khô cứng lặp đi lặp lại.",
    traits: ["Tư duy sáng tạo đột phá", "Cảm nhận thẩm mỹ tinh tế", "Linh hoạt và cởi mở", "Trực giác phong phú"],
    workEnvironment: "Studio sáng tạo, agency quảng cáo, phòng thiết kế sản phẩm, truyền thông đa phương tiện hoặc làm việc tự do (Freelance).",
    suggestedCareers: [
      { title: "UI/UX Designer", field: "Thiết kế trải nghiệm" },
      { title: "Creative Director", field: "Chỉ đạo sáng tạo" },
      { title: "Content Strategist / Copywriter", field: "Nội dung & Truyền thông" },
      { title: "Brand Identity Designer", field: "Nhận diện thương hiệu" },
      { title: "Motion Graphic / Video Producer", field: "Sản xuất video & Đồ họa" },
      { title: "Kiến trúc sư Nội thất / Cảnh quan", field: "Thiết kế không gian" },
    ],
  },
  S: {
    code: "S",
    name: "Social",
    vietnameseName: "Người xã hội & Giúp đỡ",
    color: "#e11d48",
    tagline: "Thấu cảm lắng nghe – Gắn kết cộng đồng – Nâng đỡ con người",
    description: "Bạn tìm thấy niềm vui và ý nghĩa lớn nhất khi được giúp đỡ, đào tạo, tư vấn và chăm sóc người khác. Bạn có khả năng lắng nghe tuyệt vời, nhạy cảm với nhu cầu của con người và giỏi hòa giải mâu thuẫn.",
    traits: ["Thấu cảm và ấm áp", "Giao tiếp gắn kết xuất sắc", "Kiên nhẫn và bao dung", "Tận tâm vì cộng đồng"],
    workEnvironment: "Bộ phận nhân sự, tổ chức giáo dục, chăm sóc khách hàng, y tế cộng đồng hoặc các tổ chức phi chính phủ phát triển xã hội.",
    suggestedCareers: [
      { title: "HR Business Partner / Talent Acquisition", field: "Quản trị nhân lực" },
      { title: "Chuyên gia Đào tạo & Huấn luyện (L&D)", field: "Đào tạo doanh nghiệp" },
      { title: "Customer Success Manager", field: "Thành công khách hàng" },
      { title: "Chuyên viên Tư vấn Hướng nghiệp", field: "Tư vấn & Giáo dục" },
      { title: "Điều phối viên Dự án Cộng đồng", field: "Phát triển xã hội" },
      { title: "Chuyên gia Quan hệ Công chúng (PR)", field: "Truyền thông xã hội" },
    ],
  },
  E: {
    code: "E",
    name: "Enterprising",
    vietnameseName: "Người quản trị & Kinh doanh",
    color: "#7c3aed",
    tagline: "Quyết đoán dẫn dắt – Thuyết phục đàm phán – Chinh phục mục tiêu",
    description: "Bạn là người tràn đầy năng lượng, có tham vọng, thích dẫn dắt và tạo ảnh hưởng lên người khác để đạt được mục tiêu chung. Bạn nhạy bén với cơ hội thị trường và không ngại chấp nhận rủi ro có tính toán.",
    traits: ["Kỹ năng lãnh đạo và điều phối", "Khả năng thuyết phục và thương lượng", "Tự tin và năng động", "Hướng tới kết quả và tăng trưởng"],
    workEnvironment: "Doanh nghiệp khởi nghiệp tăng trưởng nhanh, bộ phận kinh doanh, phát triển sản phẩm, quản trị chiến lược hoặc điều hành dự án.",
    suggestedCareers: [
      { title: "Product Manager (PM)", field: "Quản lý sản phẩm" },
      { title: "Business Development Manager", field: "Phát triển kinh doanh" },
      { title: "Giám đốc Kinh doanh (Sales Director)", field: "Thương mại & Bán hàng" },
      { title: "Startup Founder / Entrepreneur", field: "Khởi nghiệp & Điều hành" },
      { title: "Marketing Director", field: "Chiến lược tiếp thị" },
      { title: "Quản lý Dự án Doanh nghiệp", field: "Quản lý dự án" },
    ],
  },
  C: {
    code: "C",
    name: "Conventional",
    vietnameseName: "Người quy chuẩn & Chi tiết",
    color: "#2563eb",
    tagline: "Cẩn trọng tỉ mỉ – Kỷ luật chuẩn xác – Tối ưu hóa quy trình",
    description: "Bạn đề cao tính trật tự, ngăn nắp, chính xác và rõ ràng. Bạn làm việc hiệu quả nhất với các số liệu, tài liệu, bảng biểu và quy trình được thiết lập bài bản. Bạn là người bảo đảm chất lượng và tính ổn định cho tổ chức.",
    traits: ["Tỉ mỉ và độ chính xác cao", "Tôn trọng kỷ luật và quy tắc", "Quản lý dữ liệu ngăn nắp", "Đáng tin cậy và có tổ chức"],
    workEnvironment: "Văn phòng tài chính, bộ phận kiểm toán, ngân hàng, quản trị hành chính, quản lý chất lượng (QA/QC) hoặc pháp chế doanh nghiệp.",
    suggestedCareers: [
      { title: "Kiểm toán viên / Kế toán trưởng", field: "Tài chính - Kiểm toán" },
      { title: "Chuyên viên Phân tích Rủi ro", field: "Ngân hàng & Bảo hiểm" },
      { title: "Database Administrator / Data Steward", field: "Quản trị dữ liệu" },
      { title: "Quality Assurance (QA) Specialist", field: "Đảm bảo chất lượng" },
      { title: "Chuyên viên Pháp chế Doanh nghiệp", field: "Pháp lý & Tuân thủ" },
      { title: "Vận hành Quy trình Nghiệp vụ (BPO)", field: "Vận hành kinh doanh" },
    ],
  },
};

const STANDARD_OPTIONS = [
  { label: "A", text: "Rất không phù hợp / Hoàn toàn không thích", score: 1 },
  { label: "B", text: "Ít phù hợp / Hơi không thích", score: 2 },
  { label: "C", text: "Tương đối phù hợp / Khá thích", score: 3 },
  { label: "D", text: "Rất phù hợp / Cực kỳ yêu thích", score: 4 },
];

export const RIASEC_QUESTIONS: RiasecQuestion[] = [
  // --- NHÓM R: REALISTIC (1–5) ---
  {
    id: 1,
    group: "R",
    q: "Thích tự tay sửa chữa, lắp ráp máy móc, đồ gia dụng hoặc các thiết bị kỹ thuật điện tử.",
    options: STANDARD_OPTIONS,
  },
  {
    id: 2,
    group: "R",
    q: "Thích làm việc với công cụ, vật liệu thực tế và môi trường ngoài trời hơn là chỉ ngồi bàn giấy đọc tài liệu.",
    options: STANDARD_OPTIONS,
  },
  {
    id: 3,
    group: "R",
    q: "Cảm thấy hào hứng khi hoàn thiện một sản phẩm hữu hình cụ thể có tính ứng dụng cao.",
    options: STANDARD_OPTIONS,
  },
  {
    id: 4,
    group: "R",
    q: "Thích các công việc đòi hỏi sự khéo léo, thao tác thể chất và độ chính xác của tay chân.",
    options: STANDARD_OPTIONS,
  },
  {
    id: 5,
    group: "R",
    q: "Khi giải quyết sự cố, ưu tiên bắt tay vào thử nghiệm trực tiếp hơn là tranh luận lý thuyết suông.",
    options: STANDARD_OPTIONS,
  },

  // --- NHÓM I: INVESTIGATIVE (6–10) ---
  {
    id: 6,
    group: "I",
    q: "Thích phân tích dữ liệu, nghiên cứu nguyên nhân gốc rễ và cơ chế vận hành của các vấn đề phức tạp.",
    options: STANDARD_OPTIONS,
  },
  {
    id: 7,
    group: "I",
    q: "Say mê giải các bài toán logic, câu đố hóc búa hoặc đọc tài liệu khoa học chuyên sâu.",
    options: STANDARD_OPTIONS,
  },
  {
    id: 8,
    group: "I",
    q: "Luôn đặt câu hỏi 'Tại sao?' và tìm kiếm bằng chứng xác thực trước khi tin vào một kết luận.",
    options: STANDARD_OPTIONS,
  },
  {
    id: 9,
    group: "I",
    q: "Thích quan sát, thử nghiệm và ghi chép có phương pháp để tìm ra quy luật mới.",
    options: STANDARD_OPTIONS,
  },
  {
    id: 10,
    group: "I",
    q: "Cảm thấy thỏa mãn khi tự mình tìm ra lời giải cho một khúc mắc tri thức hóc búa.",
    options: STANDARD_OPTIONS,
  },

  // --- NHÓM A: ARTISTIC (11–15) ---
  {
    id: 11,
    group: "A",
    q: "Thích thể hiện ý tưởng độc đáo thông qua thiết kế, ngôn từ, hình ảnh, âm nhạc hoặc sản phẩm sáng tạo.",
    options: STANDARD_OPTIONS,
  },
  {
    id: 12,
    group: "A",
    q: "Cảm thấy gò bó và khó chịu nếu phải làm theo những quy trình lặp đi lặp lại thiếu sự đổi mới.",
    options: STANDARD_OPTIONS,
  },
  {
    id: 13,
    group: "A",
    q: "Nhạy cảm với cái đẹp, bố cục, màu sắc và phong cách bài trí trong đời sống cũng như công việc.",
    options: STANDARD_OPTIONS,
  },
  {
    id: 14,
    group: "A",
    q: "Thích thử nghiệm những cách tiếp cận phá cách, độc bản và khác biệt với số đông.",
    options: STANDARD_OPTIONS,
  },
  {
    id: 15,
    group: "A",
    q: "Tin tưởng vào trực giác và thích các môi trường làm việc cho phép tự do thể hiện cá tính riêng.",
    options: STANDARD_OPTIONS,
  },

  // --- NHÓM S: SOCIAL (16–20) ---
  {
    id: 16,
    group: "S",
    q: "Thích hướng dẫn, giảng dạy hoặc chia sẻ kinh nghiệm giúp người khác cùng phát triển.",
    options: STANDARD_OPTIONS,
  },
  {
    id: 17,
    group: "S",
    q: "Có khả năng lắng nghe thấu hiểu, cảm nhận được tâm tư và sẵn sàng đồng hành khi đồng nghiệp gặp khó khăn.",
    options: STANDARD_OPTIONS,
  },
  {
    id: 18,
    group: "S",
    q: "Hào hứng tham gia các hoạt động cộng đồng, xây dựng văn hóa tập thể và dự án nhân văn.",
    options: STANDARD_OPTIONS,
  },
  {
    id: 19,
    group: "S",
    q: "Ưu tiên giải quyết xung đột bằng sự ôn hòa, lắng nghe đa chiều và thấu tình đạt lý.",
    options: STANDARD_OPTIONS,
  },
  {
    id: 20,
    group: "S",
    q: "Cảm thấy công việc thực sự có ý nghĩa khi mang lại giá trị thiết thực và niềm vui cho con người.",
    options: STANDARD_OPTIONS,
  },

  // --- NHÓM E: ENTERPRISING (21–25) ---
  {
    id: 21,
    group: "E",
    q: "Tự tin thuyết phục, đàm phán và truyền cảm hứng cho người khác tin tưởng vào giải pháp của mình.",
    options: STANDARD_OPTIONS,
  },
  {
    id: 22,
    group: "E",
    q: "Thích đảm nhận vai trò trưởng nhóm, điều phối mục tiêu và chịu trách nhiệm về kết quả chung.",
    options: STANDARD_OPTIONS,
  },
  {
    id: 23,
    group: "E",
    q: "Hào hứng với cơ hội kinh doanh mới, đặt mục tiêu cao và dám chấp nhận rủi ro để bứt phá.",
    options: STANDARD_OPTIONS,
  },
  {
    id: 24,
    group: "E",
    q: "Thích môi trường làm việc năng động, có sự cạnh tranh lành mạnh và ghi nhận xứng đáng theo thành tích.",
    options: STANDARD_OPTIONS,
  },
  {
    id: 25,
    group: "E",
    q: "Nhạy bén trong việc nhận diện cơ hội thị trường và kết nối các nguồn lực để tạo ra giá trị kinh tế.",
    options: STANDARD_OPTIONS,
  },

  // --- NHÓM C: CONVENTIONAL (26–30) ---
  {
    id: 26,
    group: "C",
    q: "Thích làm việc theo kế hoạch chi tiết, có quy chuẩn chất lượng rõ ràng và lộ trình mạch lạc.",
    options: STANDARD_OPTIONS,
  },
  {
    id: 27,
    group: "C",
    q: "Cẩn thận, tỉ mỉ trong việc quản lý dữ liệu, kiểm tra số liệu chính xác và hạn chế tối đa sai sót.",
    options: STANDARD_OPTIONS,
  },
  {
    id: 28,
    group: "C",
    q: "Làm việc hiệu quả và an tâm nhất khi các nguyên tắc, chính sách và tiêu chuẩn được tuân thủ nghiêm túc.",
    options: STANDARD_OPTIONS,
  },
  {
    id: 29,
    group: "C",
    q: "Thích sắp xếp, tổ chức hồ sơ tài liệu một cách ngăn nắp, khoa học và dễ dàng tra cứu.",
    options: STANDARD_OPTIONS,
  },
  {
    id: 30,
    group: "C",
    q: "Đề cao tính đúng giờ, sự cam kết trách nhiệm và tính nhất quán lâu dài trong công việc.",
    options: STANDARD_OPTIONS,
  },
];

export function calculateRiasecScore(answers: { [questionId: number]: { label: string; score: number } }) {
  const scores: Record<RiasecGroup, number> = {
    R: 0,
    I: 0,
    A: 0,
    S: 0,
    E: 0,
    C: 0,
  };

  RIASEC_QUESTIONS.forEach((q) => {
    const ans = answers[q.id];
    if (ans) {
      scores[q.group] += ans.score;
    }
  });

  // Điểm tối đa mỗi nhóm là 5 câu x 4 điểm = 20 điểm
  const percentages: Record<RiasecGroup, number> = {
    R: Math.round((scores.R / 20) * 100),
    I: Math.round((scores.I / 20) * 100),
    A: Math.round((scores.A / 20) * 100),
    S: Math.round((scores.S / 20) * 100),
    E: Math.round((scores.E / 20) * 100),
    C: Math.round((scores.C / 20) * 100),
  };

  // Xác định Top 3 nhóm cao điểm nhất
  const sortedGroups = (Object.keys(scores) as RiasecGroup[]).sort((a, b) => scores[b] - scores[a]);
  const top3 = sortedGroups.slice(0, 3);
  const hollandCode = top3.join("");

  return {
    scores,
    percentages,
    top3,
    hollandCode,
    primaryGroup: RIASEC_GROUPS[top3[0]],
    secondaryGroup: RIASEC_GROUPS[top3[1]],
    tertiaryGroup: RIASEC_GROUPS[top3[2]],
    answeredCount: Object.keys(answers).length,
  };
}

export type RiasecResult = ReturnType<typeof calculateRiasecScore>;
export const RIASEC_TRAITS_INFO = RIASEC_GROUPS;

