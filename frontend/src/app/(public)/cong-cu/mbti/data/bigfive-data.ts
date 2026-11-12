export type OceanDimension = "O" | "C" | "E" | "A" | "N";

export interface BigFiveQuestion {
  id: number;
  dimension: OceanDimension;
  q: string;
  isReversed?: boolean;
}

export interface OceanDimensionInfo {
  code: OceanDimension;
  name: string;
  vietnameseName: string;
  color: string;
  description: string;
  highTrait: string;
  lowTrait: string;
  workImpact: string;
  suggestedRoles: string[];
}

export const OCEAN_DIMENSIONS: Record<OceanDimension, OceanDimensionInfo> = {
  O: {
    code: "O",
    name: "Openness to Experience",
    vietnameseName: "Cởi mở với trải nghiệm",
    color: "#7c3aed",
    description: "Đo lường mức độ tò mò trí tuệ, khả năng sáng tạo nghệ thuật và sự sẵn sàng đón nhận những ý tưởng, phương pháp mới mẻ.",
    highTrait: "Trí tưởng tượng phong phú, thích đổi mới, tư duy trừu tượng, cởi mở với văn hóa đa dạng.",
    lowTrait: "Thực tế, coi trọng phương pháp truyền thống đã kiểm chứng, thích sự ổn định và quy trình quen thuộc.",
    workImpact: "Thúc đẩy các sáng kiến đổi mới, giải pháp khác biệt và khả năng thích nghi nhanh trước biến động thị trường.",
    suggestedRoles: ["Product Designer", "R&D Specialist", "Creative Director", "Data Scientist", "Chiến lược gia"],
  },
  C: {
    code: "C",
    name: "Conscientiousness",
    vietnameseName: "Tận tâm & Chu đáo",
    color: "#059669",
    description: "Đo lường tính kỷ luật tự giác, sự ngăn nắp, tinh thần trách nhiệm và khả năng kiên trì theo đuổi mục tiêu dài hạn.",
    highTrait: "Kỷ luật cao, tỉ mỉ, có tổ chức, luôn hoàn thành cam kết đúng hạn và chuẩn mực chất lượng cao.",
    lowTrait: "Linh hoạt tùy hứng, làm việc theo cảm xúc, dễ thay đổi mục tiêu nhưng có thể ứng biến nhanh trong môi trường hỗn loạn.",
    workImpact: "Là nhân tố dự báo hàng đầu về hiệu suất công việc, độ tin cậy và sự chính xác trong vận hành tổ chức.",
    suggestedRoles: ["Project Manager", "Kiểm toán viên", "Kỹ sư QA/QC", "Operations Lead", "Chuyên viên Quản trị rủi ro"],
  },
  E: {
    code: "E",
    name: "Extraversion",
    vietnameseName: "Hướng ngoại",
    color: "#0062ff",
    description: "Đo lường mức độ nhiệt tình, năng lượng trong giao tiếp xã hội, tính quyết đoán và xu hướng tìm kiếm kích thích từ môi trường ngoài.",
    highTrait: "Năng động, nhiệt thành, hòa đồng, tự tin bày tỏ quan điểm và thích làm việc cùng nhiều người.",
    lowTrait: "Điềm tĩnh, độc lập, nạp năng lượng từ sự yên tĩnh, thích làm việc sâu một mình và thận trọng khi phát biểu.",
    workImpact: "Thúc đẩy sự kết nối trong tổ chức, mở rộng mối quan hệ đối tác, tạo ảnh hưởng và khuấy động không khí làm việc.",
    suggestedRoles: ["Business Development", "Giám đốc Kinh doanh", "PR Specialist", "Chuyên viên Tuyển dụng", "Tổ chức sự kiện"],
  },
  A: {
    code: "A",
    name: "Agreeableness",
    vietnameseName: "Hòa đồng & Dễ chịu",
    color: "#ea580c",
    description: "Đo lường mức độ thấu cảm, lòng vị tha, sự tin cậy và xu hướng hợp tác thay vì cạnh tranh đối đầu với người khác.",
    highTrait: "Ấm áp, biết lắng nghe, luôn sẵn lòng hỗ trợ, trân trọng sự hòa hợp và tìm kiếm giải pháp đôi bên cùng thắng.",
    lowTrait: "Thẳng thắn, hoài nghi có cơ sở, tính cạnh tranh cao, sẵn sàng phản biện trực diện để bảo vệ nguyên tắc công việc.",
    workImpact: "Xây dựng sự tin cậy nội bộ, hóa giải xung đột nhóm và củng cố văn hóa gắn kết lâu dài giữa các thành viên.",
    suggestedRoles: ["HR Manager", "Customer Success Lead", "Tư vấn viên", "Điều phối viên dự án", "Chăm sóc khách hàng"],
  },
  N: {
    code: "N",
    name: "Emotional Stability",
    vietnameseName: "Ổn định cảm xúc (Cân bằng tâm lý)",
    color: "#0284c7",
    description: "Đo lường mức độ điềm tĩnh, khả năng kiểm soát căng thẳng và phục hồi tâm lý nhanh chóng sau các sự cố bất ngờ.",
    highTrait: "Điềm đạm, vững vàng dưới áp lực lớn, ít bị lo âu chi phối và tự tin giải quyết tình huống khủng hoảng.",
    lowTrait: "Nhạy cảm với rủi ro, cảnh giác cao với mối đe dọa, dễ căng thẳng nhưng có khả năng phát hiện sớm các nguy cơ tiềm ẩn.",
    workImpact: "Giúp duy trì năng suất bền vững, ra quyết định sáng suốt trong giai đoạn khủng hoảng và giữ vững sĩ khí tập thể.",
    suggestedRoles: ["Crisis Management Lead", "SRE / DevOps Engineer", "Bác sĩ / Cứu hộ", "Trader tài chính", "Nhà đàm phán"],
  },
};

export const LIKERT_OPTIONS = [
  { label: "1", text: "Hoàn toàn không đồng ý", value: 1 },
  { label: "2", text: "Không đồng ý", value: 2 },
  { label: "3", text: "Trung lập / Phân vân", value: 3 },
  { label: "4", text: "Đồng ý", value: 4 },
  { label: "5", text: "Hoàn toàn đồng ý", value: 5 },
];

export const BIGFIVE_QUESTIONS: BigFiveQuestion[] = [
  // --- O: OPENNESS (1–6) ---
  { id: 1, dimension: "O", q: "Tôi luôn tò mò muốn tìm hiểu những ý tưởng mới mẻ, công nghệ đột phá và các tri thức đa ngành." },
  { id: 2, dimension: "O", q: "Tôi hào hứng khi được trải nghiệm những điều mới lạ, văn hóa khác biệt và các cách tiếp cận độc đáo." },
  { id: 3, dimension: "O", q: "Tôi có trí tưởng tượng phong phú và thường hình dung ra các khả năng chưa từng có trong tương lai." },
  { id: 4, dimension: "O", q: "Tôi rất trân trọng vẻ đẹp nghệ thuật, thiết kế tinh tế và các giá trị thẩm mỹ trong đời sống." },
  { id: 5, dimension: "O", q: "Tôi thích thử nghiệm những giải pháp sáng tạo thay vì luôn đi theo lối mòn quy chuẩn cũ." },
  { id: 6, dimension: "O", q: "Tôi thường suy ngẫm sâu sắc về các khái niệm trừu tượng, triết học và các xu hướng biến chuyển xã hội." },

  // --- C: CONSCIENTIOUSNESS (7–12) ---
  { id: 7, dimension: "C", q: "Tôi luôn hoàn thành công việc đúng thời hạn cam kết với tinh thần trách nhiệm cao nhất." },
  { id: 8, dimension: "C", q: "Tôi thường lập kế hoạch rõ ràng trước khi hành động và bám sát các mục tiêu ưu tiên đã đề ra." },
  { id: 9, dimension: "C", q: "Tôi chú ý cẩn thận đến từng chi tiết để đảm bảo chất lượng sản phẩm đầu ra luôn hoàn thiện." },
  { id: 10, dimension: "C", q: "Tôi luôn giữ bàn làm việc và các dữ liệu tài liệu cá nhân ngăn nắp, khoa học." },
  { id: 11, dimension: "C", q: "Tôi có tính tự giác và kỷ luật nội tại cao, không dễ bị xao nhãng bởi các cám dỗ xung quanh." },
  { id: 12, dimension: "C", q: "Tôi luôn suy nghĩ thấu đáo về các hệ quả lâu dài trước khi đưa ra quyết định quan trọng." },

  // --- E: EXTRAVERSION (13–18) ---
  { id: 13, dimension: "E", q: "Tôi cảm thấy tràn đầy năng lượng khi được tham gia các sự kiện sôi động và môi trường đông người." },
  { id: 14, dimension: "E", q: "Tôi dễ dàng bắt chuyện và nhanh chóng hòa nhập tự nhiên với những đối tác hoặc đồng nghiệp mới." },
  { id: 15, dimension: "E", q: "Tôi thích chủ động bày tỏ quan điểm và tích cực đóng góp tiếng nói trong các buổi thảo luận chung." },
  { id: 16, dimension: "E", q: "Tôi thường mang lại nguồn năng lượng tích cực, sự hứng khởi và tiếng cười cho tập thể." },
  { id: 17, dimension: "E", q: "Tôi làm việc với tinh thần hứng khởi hơn khi được phối hợp tương tác liên tục cùng đồng đội." },
  { id: 18, dimension: "E", q: "Tôi có xu hướng phản ứng nhanh nhạy và tự tin thể hiện bản thân trước đám đông." },

  // --- A: AGREEABLENESS (19–24) ---
  { id: 19, dimension: "A", q: "Tôi luôn quan tâm chân thành đến cảm xúc, suy nghĩ và hoàn cảnh của những người xung quanh." },
  { id: 20, dimension: "A", q: "Tôi có xu hướng tin tưởng vào sự thiện chí và lòng trung thực của đồng nghiệp." },
  { id: 21, dimension: "A", q: "Tôi sẵn lòng giúp đỡ người khác khi họ gặp khó khăn mà không so đo tính toán thiệt hơn." },
  { id: 22, dimension: "A", q: "Tôi đề cao sự hòa thuận và luôn tìm kiếm tiếng nói chung khi tập thể xảy ra bất đồng." },
  { id: 23, dimension: "A", q: "Tôi kiên nhẫn lắng nghe ý kiến trái chiều mà không vội vàng phán xét hay bài xích." },
  { id: 24, dimension: "A", q: "Mọi người thường nhận xét tôi là người hòa nhã, ấm áp, đáng tin cậy và dễ gần." },

  // --- N: EMOTIONAL STABILITY (25–30 - Thiết kế đo mức độ ổn định cảm xúc) ---
  { id: 25, dimension: "N", q: "Tôi giữ được sự điềm tĩnh và đầu óc tỉnh táo ngay cả khi đối mặt với áp lực công việc khẩn cấp." },
  { id: 26, dimension: "N", q: "Tôi ít khi cảm thấy lo âu vô cớ hoặc để những chuyện nhỏ nhặt làm ảnh hưởng tiêu cực kéo dài." },
  { id: 27, dimension: "N", q: "Tôi nhanh chóng lấy lại sự cân bằng tinh thần sau khi trải qua thất bại hoặc nhận lời phê bình." },
  { id: 28, dimension: "N", q: "Tôi luôn cảm thấy vững vàng và tự tin vào năng lực ứng biến của bản thân trước nghịch cảnh." },
  { id: 29, dimension: "N", q: "Tôi hiếm khi để cảm xúc tiêu cực nhất thời chi phối các quyết định chuyên môn trong công việc." },
  { id: 30, dimension: "N", q: "Tôi đón nhận những thay đổi bất ngờ trong cuộc sống với tâm thế tích cực và chủ động thích nghi." },
];

export function calculateBigFiveScore(answers: { [questionId: number]: { value: number } }) {
  const rawScores: Record<OceanDimension, number> = {
    O: 0,
    C: 0,
    E: 0,
    A: 0,
    N: 0,
  };

  BIGFIVE_QUESTIONS.forEach((q) => {
    const ans = answers[q.id];
    if (ans) {
      const score = q.isReversed ? (6 - ans.value) : ans.value;
      rawScores[q.dimension] += score;
    }
  });

  // Mỗi chiều có 6 câu, điểm tối đa 6 x 5 = 30, điểm tối thiểu 6 x 1 = 6
  // Quy đổi sang phần trăm: (rawScore - 6) / (30 - 6) * 100
  const percentages: Record<OceanDimension, number> = {
    O: Math.round(((rawScores.O - 6) / 24) * 100),
    C: Math.round(((rawScores.C - 6) / 24) * 100),
    E: Math.round(((rawScores.E - 6) / 24) * 100),
    A: Math.round(((rawScores.A - 6) / 24) * 100),
    N: Math.round(((rawScores.N - 6) / 24) * 100),
  };

  // Đảm bảo trong khoảng 0 - 100%
  Object.keys(percentages).forEach((k) => {
    const key = k as OceanDimension;
    percentages[key] = Math.max(0, Math.min(100, percentages[key]));
  });

  const getLevel = (pct: number) => (pct >= 66 ? "Cao" : pct >= 34 ? "Trung bình" : "Thấp");

  const levels: Record<OceanDimension, "Thấp" | "Trung bình" | "Cao"> = {
    O: getLevel(percentages.O),
    C: getLevel(percentages.C),
    E: getLevel(percentages.E),
    A: getLevel(percentages.A),
    N: getLevel(percentages.N),
  };

  return {
    rawScores,
    percentages,
    levels,
    answeredCount: Object.keys(answers).length,
  };
}

export type BigFiveResult = ReturnType<typeof calculateBigFiveScore>;
export const BIGFIVE_DIMENSIONS_INFO = OCEAN_DIMENSIONS;

