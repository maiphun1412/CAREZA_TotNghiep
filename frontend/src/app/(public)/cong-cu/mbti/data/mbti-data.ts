export interface MbtiQuestion {
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

export const MBTI_QUESTIONS: MbtiQuestion[] = [
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
      { label: "B", text: "Tích cực tương tác, lắng nghe và chia sẻ suy nghĩ khi có thời cơ phù hợp", trait: "E", weight: 1 },
      { label: "C", text: "Lắng nghe cẩn trọng, chỉ lên tiếng khi có ý kiến quan trọng thực sự cần thiết", trait: "I", weight: 1 },
      { label: "D", text: "Thích nhận phần việc độc lập để tập trung hoàn thiện với chất lượng tốt nhất", trait: "I", weight: 2 },
    ],
  },
  {
    id: 4,
    dimension: "EI",
    q: "Khi gặp một vấn đề khó khăn cần giải quyết, bạn có xu hướng:",
    options: [
      { label: "A", text: "Nói to suy nghĩ và trao đổi ngay với đồng nghiệp để tìm hướng giải quyết", trait: "E", weight: 2 },
      { label: "B", text: "Thảo luận nhanh với người có kinh nghiệm để kiểm tra lại nhận định của mình", trait: "E", weight: 1 },
      { label: "C", text: "Tự mình suy nghĩ và phân tích cẩn thận trước khi chia sẻ với người khác", trait: "I", weight: 1 },
      { label: "D", text: "Đóng kín cửa, tự nghiên cứu tài liệu và tìm giải pháp triệt để một mình", trait: "I", weight: 2 },
    ],
  },
  {
    id: 5,
    dimension: "EI",
    q: "Phong cách làm việc hàng ngày giúp bạn đạt năng suất cao nhất:",
    options: [
      { label: "A", text: "Không gian làm việc mở, tương tác liên tục và nhịp độ sôi động", trait: "E", weight: 2 },
      { label: "B", text: "Linh hoạt giữa làm việc nhóm và các khoảng thời gian riêng tư", trait: "E", weight: 1 },
      { label: "C", text: "Góc làm việc yên tĩnh, ít tiếng ồn và ít người qua lại làm phân tâm", trait: "I", weight: 1 },
      { label: "D", text: "Không gian hoàn toàn độc lập, cho phép tập trung cao độ sâu sắc", trait: "I", weight: 2 },
    ],
  },

  // --- TRỤC 2: S (Thực tế) vs N (Trực giác) ---
  {
    id: 6,
    dimension: "SN",
    q: "Khi tiếp nhận một dự án hoặc nhiệm vụ mới, bạn chú ý nhiều hơn đến:",
    options: [
      { label: "A", text: "Các số liệu thực tế, chi tiết cụ thể và các bước thực thi rõ ràng", trait: "S", weight: 2 },
      { label: "B", text: "Các quy trình đã được kiểm chứng thành công và cách làm hiện tại", trait: "S", weight: 1 },
      { label: "C", text: "Ý nghĩa chiến lược tổng thể và tiềm năng phát triển trong tương lai", trait: "N", weight: 1 },
      { label: "D", text: "Tầm nhìn lớn, các ý tưởng đột phá và những khả năng chưa từng thử nghiệm", trait: "N", weight: 2 },
    ],
  },
  {
    id: 7,
    dimension: "SN",
    q: "Khi lắng nghe một bài thuyết trình hoặc báo cáo, bạn bị thuyết phục bởi:",
    options: [
      { label: "A", text: "Bằng chứng rõ ràng, dữ liệu định lượng và kết quả đo đếm được", trait: "S", weight: 2 },
      { label: "B", text: "Các ví dụ thực tế cụ thể và câu chuyện kinh nghiệm đã diễn ra", trait: "S", weight: 1 },
      { label: "C", text: "Mô hình tư duy mới mẻ và sự liên kết logic giữa các xu hướng", trait: "N", weight: 1 },
      { label: "D", text: "Tầm nhìn truyền cảm hứng, tính mới lạ và tiềm năng mở rộng không giới hạn", trait: "N", weight: 2 },
    ],
  },
  {
    id: 8,
    dimension: "SN",
    q: "Trong quá trình học một kỹ năng hoặc kiến thức mới, bạn thích:",
    options: [
      { label: "A", text: "Thực hành từng bước cụ thể theo hướng dẫn chi tiết từ dễ đến khó", trait: "S", weight: 2 },
      { label: "B", text: "Quan sát người làm mẫu thành thạo rồi áp dụng lại vào thực tế", trait: "S", weight: 1 },
      { label: "C", text: "Nắm vững nguyên lý cốt lõi và bức tranh tổng quan trước khi đi vào chi tiết", trait: "N", weight: 1 },
      { label: "D", text: "Tự khám phá các giả thuyết và tự sáng tạo phương pháp học của riêng mình", trait: "N", weight: 2 },
    ],
  },
  {
    id: 9,
    dimension: "SN",
    q: "Bạn đánh giá cao điều gì hơn ở một người lãnh đạo:",
    options: [
      { label: "A", text: "Sự thực tế, năng lực thực thi vững chắc và tính ổn định cao", trait: "S", weight: 2 },
      { label: "B", text: "Sự thấu hiểu chi tiết công việc hàng ngày và chỉ đạo rõ ràng", trait: "S", weight: 1 },
      { label: "C", text: "Khả năng truyền cảm hứng và dự báo chính xác các xu hướng tương lai", trait: "N", weight: 1 },
      { label: "D", text: "Tầm nhìn chiến lược đột phá và tinh thần dám dấn thân vào những điều mới", trait: "N", weight: 2 },
    ],
  },
  {
    id: 10,
    dimension: "SN",
    q: "Khi miêu tả về một sự kiện đã trải qua, bạn thường:",
    options: [
      { label: "A", text: "Kể chính xác những gì đã diễn ra theo trình tự thời gian và chi tiết cụ thể", trait: "S", weight: 2 },
      { label: "B", text: "Tập trung vào những bài học và hành động thực tế có thể rút ra", trait: "S", weight: 1 },
      { label: "C", text: "Nhấn mạnh cảm nhận, ý nghĩa sâu xa và bài học đúc kết được", trait: "N", weight: 1 },
      { label: "D", text: "Liên tưởng đến những khả năng khác và ẩn dụ sáng tạo về sự việc", trait: "N", weight: 2 },
    ],
  },

  // --- TRỤC 3: T (Lý trí) vs F (Cảm xúc) ---
  {
    id: 11,
    dimension: "TF",
    q: "Khi đưa ra một quyết định quan trọng trong công việc, ưu tiên số một của bạn là:",
    options: [
      { label: "A", text: "Tính logic, sự công bằng khách quan và hiệu quả tối ưu", trait: "T", weight: 2 },
      { label: "B", text: "Phân tích thiệt hơn dựa trên chi phí, lợi nhuận và dữ liệu", trait: "T", weight: 1 },
      { label: "C", text: "Tác động đến tâm lý, cảm xúc và sự hòa thuận của các bên liên quan", trait: "F", weight: 1 },
      { label: "D", text: "Giá trị nhân văn, đạo đức và sự thấu cảm vì hạnh phúc của con người", trait: "F", weight: 2 },
    ],
  },
  {
    id: 12,
    dimension: "TF",
    q: "Khi một đồng nghiệp mắc lỗi ảnh hưởng đến dự án, phản ứng đầu tiên của bạn là:",
    options: [
      { label: "A", text: "Thẳng thắn chỉ ra nguyên nhân gốc rễ và yêu cầu khắc phục đúng chuẩn", trait: "T", weight: 2 },
      { label: "B", text: "Tập trung tìm kiếm phương án sửa chữa kỹ thuật một cách khách quan", trait: "T", weight: 1 },
      { label: "C", text: "Động viên tinh thần đồng nghiệp trước, sau đó cùng nhau tháo gỡ khó khăn", trait: "F", weight: 1 },
      { label: "D", text: "Cảm thông sâu sắc với áp lực họ đang chịu và nhẹ nhàng góp ý riêng", trait: "F", weight: 2 },
    ],
  },
  {
    id: 13,
    dimension: "TF",
    q: "Khi nhận xét hoặc phản hồi (feedback) công việc cho người khác, bạn thường:",
    options: [
      { label: "A", text: "Nói thẳng vào vấn đề cần cải thiện, không vòng vo để tiết kiệm thời gian", trait: "T", weight: 2 },
      { label: "B", text: "Đưa ra các tiêu chí đánh giá rõ ràng dựa trên kết quả đầu ra thực tế", trait: "T", weight: 1 },
      { label: "C", text: "Khen ngợi nỗ lực trước, sau đó khéo léo đề xuất cách cải thiện", trait: "F", weight: 1 },
      { label: "D", text: "Chú ý lựa chọn từ ngữ ấm áp để giữ gìn mối quan hệ và sự tự tin của đối phương", trait: "F", weight: 2 },
    ],
  },
  {
    id: 14,
    dimension: "TF",
    q: "Bạn cảm thấy được ghi nhận và đánh giá cao nhất khi:",
    options: [
      { label: "A", text: "Được công nhận về năng lực trí tuệ, sự nhạy bén và hiệu quả vượt trội", trait: "T", weight: 2 },
      { label: "B", text: "Hoàn thành xuất sắc mục tiêu công việc khó khăn mà ít người làm được", trait: "T", weight: 1 },
      { label: "C", text: "Được đồng nghiệp cảm ơn chân thành vì sự giúp đỡ và gắn kết tập thể", trait: "F", weight: 1 },
      { label: "D", text: "Cảm nhận được sự trân trọng đối với tấm lòng và sự tận tâm của mình", trait: "F", weight: 2 },
    ],
  },
  {
    id: 15,
    dimension: "TF",
    q: "Trong một cuộc tranh luận có ý kiến trái chiều gay gắt, điều quan trọng nhất là:",
    options: [
      { label: "A", text: "Tìm ra chân lý đúng đắn nhất dựa trên lập luận logic và chứng cứ xác thực", trait: "T", weight: 2 },
      { label: "B", text: "Làm rõ tính khả thi và giải pháp tối ưu cho mục tiêu chung", trait: "T", weight: 1 },
      { label: "C", text: "Đảm bảo mọi người đều cảm thấy ý kiến của mình được lắng nghe tôn trọng", trait: "F", weight: 1 },
      { label: "D", text: "Duy trì sự đoàn kết, tránh làm tổn thương tình cảm của các thành viên", trait: "F", weight: 2 },
    ],
  },

  // --- TRỤC 4: J (Nguyên tắc) vs P (Linh hoạt) ---
  {
    id: 16,
    dimension: "JP",
    q: "Cách bạn bắt đầu một ngày làm việc điển hình:",
    options: [
      { label: "A", text: "Bám sát danh sách việc cần làm (To-do list) và lịch trình đã lên từ trước", trait: "J", weight: 2 },
      { label: "B", text: "Xác định rõ các ưu tiên hàng đầu và hoàn thành tuần tự từng việc", trait: "J", weight: 1 },
      { label: "C", text: "Linh hoạt giải quyết công việc theo cảm hứng và mức độ khẩn cấp phát sinh", trait: "P", weight: 1 },
      { label: "D", text: "Thích nghi tự nhiên với nhịp điệu trong ngày, không gò bó theo khuôn mẫu cứng", trait: "P", weight: 2 },
    ],
  },
  {
    id: 17,
    dimension: "JP",
    q: "Trước một chuyến đi du lịch hoặc kỳ nghỉ, bạn thường:",
    options: [
      { label: "A", text: "Lên lịch trình chi tiết từng ngày, đặt trước vé và khách sạn hoàn chỉnh", trait: "J", weight: 2 },
      { label: "B", text: "Chuẩn bị các điểm đến chính và thông tin cần thiết cơ bản", trait: "J", weight: 1 },
      { label: "C", text: "Chỉ đặt vé chiều đi, còn lại sẽ tùy hứng khám phá khi đến nơi", trait: "P", weight: 1 },
      { label: "D", text: "Xách ba lô lên và đi mà không cần chuẩn bị bất kỳ kế hoạch cố định nào", trait: "P", weight: 2 },
    ],
  },
  {
    id: 18,
    dimension: "JP",
    q: "Khi deadline của dự án đang đến gần, trạng thái của bạn là:",
    options: [
      { label: "A", text: "Đã hoàn thành sớm trước hạn và chỉ cần kiểm tra lại lần cuối", trait: "J", weight: 2 },
      { label: "B", text: "Đang tiến hành theo đúng tiến độ kế hoạch đã phân bổ từ trước", trait: "J", weight: 1 },
      { label: "C", text: "Làm việc hiệu quả và tập trung năng lượng cao độ nhất ở giai đoạn chót", trait: "P", weight: 1 },
      { label: "D", text: "Áp lực deadline mang lại cảm hứng sáng tạo và bứt phá mạnh mẽ", trait: "P", weight: 2 },
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

export interface MbtiProfile {
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

export const MBTI_PROFILES: { [key: string]: MbtiProfile } = {
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

export function calculateMbtiScore(answers: { [questionId: number]: { trait: string; weight: number } }) {
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
}

export type MbtiScoreResult = ReturnType<typeof calculateMbtiScore>;

