export interface MockJob {
  id: string;
  title: string;
  slug?: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  location: string;
  branchName?: string;
  salaryMin?: number;
  salaryMax?: number;
  salary: string;
  negotiableSalary?: boolean;
  employmentType: number; // 1: Toàn thời gian, 2: Bán thời gian, 3: Thực tập
  employmentTypeText: string;
  workMode: number; // 1: Tại văn phòng, 2: Hybrid, 3: Remote
  workModeText: string;
  level: string;
  experience: string;
  deadline: string;
  updatedTime: string;
  matchScore: string;
  badgeType: "premium" | "hot" | "new";
  description: string;
  requirements: string[];
  benefits: string[];
  skills: string[];
  isBookmarked?: boolean;
  isApplied?: boolean;
}

export const mockJobs: MockJob[] = [
  {
    id: "job-1",
    title: "Senior Frontend Engineer (React/Next.js)",
    companyId: "comp-1",
    companyName: "FPT Software",
    companyLogo: "https://commons.wikimedia.org/wiki/Special:Redirect/file/FPT_Software_logo.svg",
    location: "TP. Hồ Chí Minh",
    branchName: "F-Town 3, Khu Công Nghệ Cao, TP. Thủ Đức",
    salaryMin: 35000000,
    salaryMax: 60000000,
    salary: "35tr - 60tr",
    negotiableSalary: false,
    employmentType: 1,
    employmentTypeText: "Toàn thời gian",
    workMode: 2,
    workModeText: "Linh hoạt (Hybrid)",
    level: "Senior",
    experience: "3 - 5 năm kinh nghiệm",
    deadline: "30/09/2026",
    updatedTime: "Vừa đăng hôm nay",
    matchScore: "98% Phù hợp",
    badgeType: "premium",
    description: "Chúng tôi tìm kiếm Senior Frontend Engineer tài năng tham gia phát triển nền tảng SaaS quy mô lớn phục vụ hàng triệu người dùng toàn cầu.",
    requirements: [
      "Có từ 3+ năm kinh nghiệm vững chắc với React, Next.js (App Router) và TypeScript.",
      "Thành thạo tối ưu hiệu năng web, Core Web Vitals, SSR/SSG.",
      "Có tư duy thiết kế UI/UX tinh tế, am hiểu Ant Design hoặc Tailwind CSS.",
      "Kinh nghiệm làm việc với RESTful API, GraphQL và State Management (Zustand/Redux).",
    ],
    benefits: [
      "Mức lương cạnh tranh từ 35 - 60 triệu + Thưởng KPI năm (tháng 13, 14, 15).",
      "Gói bảo hiểm sức khỏe cao cấp FPT Care cho bản thân và gia đình.",
      "Làm việc Hybrid (2 ngày remote/tuần), giờ giấc linh hoạt.",
      "Cơ hội onsite tại Nhật Bản, Mỹ, Singapore.",
    ],
    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Ant Design"],
    isBookmarked: true,
  },
  {
    id: "job-2",
    title: "AI/ML Engineer Fresher (NLP & LLMs)",
    companyId: "comp-2",
    companyName: "Viettel AI",
    companyLogo: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Viettel_logo_2021.svg",
    location: "Hà Nội",
    branchName: "Tòa nhà Viettel, Cầu Giấy, Hà Nội",
    salaryMin: 18000000,
    salaryMax: 30000000,
    salary: "18tr - 30tr",
    negotiableSalary: false,
    employmentType: 1,
    employmentTypeText: "Toàn thời gian",
    workMode: 1,
    workModeText: "Tại văn phòng",
    level: "Fresher / Junior",
    experience: "Dưới 1 năm kinh nghiệm",
    deadline: "15/10/2026",
    updatedTime: "1 ngày trước",
    matchScore: "95% Phù hợp",
    badgeType: "hot",
    description: "Tham gia nghiên cứu và phát triển các mô hình ngôn ngữ lớn (LLMs), hệ thống RAG và trợ lý AI phục vụ chuyển đổi số quốc gia.",
    requirements: [
      "Tốt nghiệp đại học chuyên ngành CNTT, Khoa học dữ liệu hoặc Toán tin.",
      "Thành thạo lập trình Python, PyTorch, HuggingFace, LangChain.",
      "Có kiến thức nền tảng vững về Machine Learning, Deep Learning, Transformer.",
      "Đam mê nghiên cứu và giải quyết các bài toán AI thực tế.",
    ],
    benefits: [
      "Mức thu nhập hấp dẫn lên đến 30 triệu/tháng cho vị trí Fresher.",
      "Được hướng dẫn trực tiếp bởi các chuyên gia AI đầu ngành tại Việt Nam.",
      "Môi trường nghiên cứu hiện đại, hệ thống GPU Cluster mạnh mẽ.",
      "Chế độ đãi ngộ hàng đầu tập đoàn Viettel.",
    ],
    skills: ["Python", "PyTorch", "NLP", "LLMs", "LangChain"],
    isBookmarked: false,
  },
  {
    id: "job-3",
    title: "Product Manager Fresher / Associate",
    companyId: "comp-3",
    companyName: "Tiki Vietnam",
    companyLogo: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Shopee.svg",
    location: "TP. Hồ Chí Minh",
    branchName: "Viettel Complex, 285 Cách Mạng Tháng Tám, Quận 10",
    salaryMin: 15000000,
    salaryMax: 25000000,
    salary: "15tr - 25tr",
    negotiableSalary: false,
    employmentType: 1,
    employmentTypeText: "Toàn thời gian",
    workMode: 2,
    workModeText: "Linh hoạt (Hybrid)",
    level: "Fresher / Associate",
    experience: "Không yêu cầu kinh nghiệm",
    deadline: "20/10/2026",
    updatedTime: "2 ngày trước",
    matchScore: "92% Phù hợp",
    badgeType: "new",
    description: "Đồng hành xây dựng các tính năng thương mại điện tử đột phá, phân tích hành vi người dùng và tối ưu hóa trải nghiệm mua sắm.",
    requirements: [
      "Tư duy logic tốt, khả năng phân tích dữ liệu bằng SQL, Excel/PowerBI.",
      "Kỹ năng giao tiếp và làm việc nhóm xuất sắc.",
      "Đam mê sản phẩm công nghệ và hiểu biết về E-commerce.",
    ],
    benefits: [
      "Môi trường năng động, trẻ trung, văn hóa trao quyền.",
      "Chương trình đào tạo Product Management chuyên sâu.",
      "Voucher mua sắm hàng tháng trên sàn.",
    ],
    skills: ["Product Management", "Data Analytics", "SQL", "Agile/Scrum"],
    isBookmarked: false,
  },
  {
    id: "job-4",
    title: "Thực tập sinh Phân tích Dữ liệu (Data Analyst Intern)",
    companyId: "comp-4",
    companyName: "Shopee Vietnam",
    companyLogo: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Shopee.svg",
    location: "TP. Hồ Chí Minh",
    branchName: "Saigon Centre, Quận 1, TP. Hồ Chí Minh",
    salaryMin: 5000000,
    salaryMax: 8000000,
    salary: "5tr - 8tr/tháng",
    negotiableSalary: false,
    employmentType: 3,
    employmentTypeText: "Thực tập",
    workMode: 1,
    workModeText: "Tại văn phòng",
    level: "Internship",
    experience: "Sinh viên năm 3, năm 4",
    deadline: "31/10/2026",
    updatedTime: "3 ngày trước",
    matchScore: "96% Phù hợp",
    badgeType: "hot",
    description: "Hỗ trợ đội ngũ Business Intelligence xây dựng dashboard phân tích doanh số và hành vi tiêu dùng.",
    requirements: [
      "Sinh viên các ngành Hệ thống thông tin, Thống kê, Kinh tế hoặc liên quan.",
      "Sử dụng tốt SQL và các công cụ trực quan hóa dữ liệu (Tableau, PowerBI).",
      "Tiếng Anh giao tiếp tốt là một lợi thế.",
    ],
    benefits: [
      "Trợ cấp thực tập hấp dẫn 5 - 8 triệu/tháng.",
      "Cơ hội trở thành nhân viên chính thức sau kỳ thực tập.",
      "Miễn phí đồ ăn nhẹ, cà phê tại văn phòng cao cấp.",
    ],
    skills: ["SQL", "Power BI", "Excel", "Data Analysis"],
    isBookmarked: false,
  },
  {
    id: "job-5",
    title: "Chuyên viên Tuyển dụng & Đào tạo (HR Officer)",
    companyId: "comp-5",
    companyName: "Techcombank",
    companyLogo: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Techcombank_logo.png",
    location: "Hà Nội",
    branchName: "Techcombank Tower, 6 Quang Trung, Hoàn Kiếm",
    salaryMin: 18000000,
    salaryMax: 28000000,
    salary: "18tr - 28tr",
    negotiableSalary: false,
    employmentType: 1,
    employmentTypeText: "Toàn thời gian",
    workMode: 1,
    workModeText: "Tại văn phòng",
    level: "Junior / Middle",
    experience: "1 - 3 năm kinh nghiệm",
    deadline: "25/10/2026",
    updatedTime: "4 ngày trước",
    matchScore: "90% Phù hợp",
    badgeType: "premium",
    description: "Thực hiện quy trình tuyển dụng nhân sự khối công nghệ và ngân hàng số, xây dựng thương hiệu nhà tuyển dụng.",
    requirements: [
      "Tốt nghiệp Đại học chuyên ngành Quản trị nhân lực, Kinh tế hoặc Ngoại ngữ.",
      "Kinh nghiệm tuyển dụng IT/Tech là lợi thế lớn.",
      "Nhanh nhẹn, kỹ năng kết nối và xây dựng mạng lưới quan hệ tốt.",
    ],
    benefits: [
      "Thưởng hiệu quả công việc và tháng lương 13, 14, 15.",
      "Vay vốn ưu đãi dành cho cán bộ nhân viên Techcombank.",
      "Chương trình chăm sóc sức khỏe toàn diện.",
    ],
    skills: ["IT Recruitment", "Talent Acquisition", "Headhunting", "Interviewing"],
    isBookmarked: false,
  },
  {
    id: "job-6",
    title: "UX/UI Designer (Figma & Design System)",
    companyId: "comp-6",
    companyName: "VNG Corporation",
    companyLogo: "https://commons.wikimedia.org/wiki/Special:Redirect/file/VNG_Corp._logo.svg",
    location: "TP. Hồ Chí Minh",
    branchName: "VNG Campus, Khu chế xuất Tân Thuận, Quận 7",
    salaryMin: 22000000,
    salaryMax: 38000000,
    salary: "22tr - 38tr",
    negotiableSalary: false,
    employmentType: 1,
    employmentTypeText: "Toàn thời gian",
    workMode: 2,
    workModeText: "Linh hoạt (Hybrid)",
    level: "Middle",
    experience: "2 - 4 năm kinh nghiệm",
    deadline: "18/10/2026",
    updatedTime: "5 ngày trước",
    matchScore: "94% Phù hợp",
    badgeType: "premium",
    description: "Thiết kế trải nghiệm người dùng cho các ứng dụng giải trí và thanh toán số hàng đầu Việt Nam (ZaloPay, Game Publishing).",
    requirements: [
      "Có portfolio ấn tượng về sản phẩm Web & Mobile App.",
      "Thành thạo Figma, Auto-layout, Component variant và Design Tokens.",
      "Hiểu biết sâu sắc về User Research, Usability Testing và Wireframing.",
    ],
    benefits: [
      "Môi trường campus quốc tế với hồ bơi, gym, canteen phục vụ 3 bữa miễn phí.",
      "Chế độ chăm sóc sức khỏe cao cấp và nghỉ dưỡng hằng năm.",
      "Review lương 2 lần/năm.",
    ],
    skills: ["Figma", "UI/UX", "Design Systems", "Prototyping", "User Research"],
    isBookmarked: false,
  }
];
