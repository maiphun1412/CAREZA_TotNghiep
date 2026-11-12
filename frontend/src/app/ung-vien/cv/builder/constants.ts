import { ResumeData, ResumeTheme, SectionConfig, TemplateMeta } from "./types";

export const CV_TEMPLATES: TemplateMeta[] = [
  {
    id: "modern-two-column",
    name: "Modern Two-Column",
    category: "Hiện đại & Đột phá",
    description: "Bố cục 2 cột bất đối xứng, sidebar màu nổi bật chứa avatar và kỹ năng, cột chính rộng rãi cho kinh nghiệm.",
    thumbnailColor: "#0284c7",
    layoutDescription: "Sidebar 35% + Main content 65%",
    features: ["Cột kỹ năng chuyên biệt", "Avatar nổi bật", "Định dạng gạch đầu dòng trực quan"],
  },
  {
    id: "classic-executive",
    name: "Classic Executive",
    category: "Trang trọng & Lãnh đạo",
    description: "Bố cục 1 cột truyền thống, tiêu đề căn giữa với đường kẻ tinh xảo, thích hợp cho vị trí chuyên gia và quản lý cấp cao.",
    thumbnailColor: "#1e293b",
    layoutDescription: "Cột đơn truyền thống (Centered Header)",
    features: ["Phong cách học thuật & quản lý", "Tiết kiệm diện tích", "Tối ưu hóa máy đọc ATS"],
  },
  {
    id: "minimalist-clean",
    name: "Minimalist Clean",
    category: "Tối giản Bắc Âu",
    description: "Bố cục tinh gọn, nhiều khoảng trắng thanh lịch, typography tinh tế, phong cách Thụy Sĩ hiện đại.",
    thumbnailColor: "#475569",
    layoutDescription: "Grid thoáng 25% Mốc thời gian - 75% Chi tiết",
    features: ["Không viền rối rắm", "Typography thanh lịch", "Dễ quét mắt người tuyển dụng"],
  },
  {
    id: "creative-timeline",
    name: "Creative Timeline",
    category: "Sáng tạo & Công nghệ",
    description: "Bố cục có trục thời gian chạy dọc kết nối từng mốc kinh nghiệm, điểm nhấn node màu sinh động.",
    thumbnailColor: "#7c3aed",
    layoutDescription: "Trục Timeline xuyên suốt kinh nghiệm & học vấn",
    features: ["Điểm nhấn thị giác mạnh", "Phù hợp Tech & Design", "Mốc thời gian rõ ràng"],
  },
  {
    id: "compact-dense",
    name: "Compact Dense",
    category: "Mật độ cao & Tối ưu A4",
    description: "Bố cục 2 cột nén chặt, tối đa hóa lượng thông tin hiển thị trên 1 trang giấy A4 mà không bị rối mắt.",
    thumbnailColor: "#059669",
    layoutDescription: "2 cột cân bằng 45% - 55% nén chặt",
    features: ["Chứa nhiều kinh nghiệm", "Tiết kiệm số trang", "Cấu trúc lưới khoa học"],
  },
  {
    id: "infographic-bold",
    name: "Infographic Bold",
    category: "Ấn tượng & Trực quan",
    description: "Header khối màu đậm bắt mắt, kỹ năng dạng visual level bars, các section đóng khối thẻ cards tương phản cao.",
    thumbnailColor: "#ea580c",
    layoutDescription: "Hero Header khối màu đậm + Thẻ cards nội dung",
    features: ["Khối màu thương hiệu lớn", "Thanh đo kỹ năng trực quan", "Phong cách năng động"],
  },
];

export const CV_FONTS = [
  { name: "Be Vietnam Pro (Chuẩn TV)", value: "var(--font-be-vietnam), sans-serif" },
  { name: "Inter (Hiện đại)", value: "'Inter', sans-serif" },
  { name: "Roboto (Tiêu chuẩn)", value: "'Roboto', sans-serif" },
  { name: "Merriweather (Cổ điển Serif)", value: "'Merriweather', serif" },
  { name: "Montserrat (Mạnh mẽ)", value: "'Montserrat', sans-serif" },
];

export const COLOR_PALETTES = [
  { name: "Careza Blue", primary: "#0062ff", secondary: "#e0edff" },
  { name: "Emerald Pro", primary: "#059669", secondary: "#ecfdf5" },
  { name: "Ocean Cyan", primary: "#0284c7", secondary: "#e0f2fe" },
  { name: "Violet Tech", primary: "#7c3aed", secondary: "#f3e8ff" },
  { name: "Ruby Crimson", primary: "#e11d48", secondary: "#ffe4e6" },
  { name: "Amber Gold", primary: "#d97706", secondary: "#fef3c7" },
  { name: "Slate Dark", primary: "#334155", secondary: "#f1f5f9" },
  { name: "Charcoal Black", primary: "#18181b", secondary: "#f4f4f5" },
];

export const DEFAULT_SECTIONS: SectionConfig[] = [
  { id: "info", title: "Thông tin cá nhân", type: "info", visible: true },
  { id: "summary", title: "Giới thiệu bản thân", type: "summary", visible: true },
  { id: "experience", title: "Kinh nghiệm làm việc", type: "experience", visible: true },
  { id: "education", title: "Học vấn", type: "education", visible: true },
  { id: "skills", title: "Kỹ năng chuyên môn", type: "skills", visible: true },
  { id: "projects", title: "Dự án tiêu biểu", type: "projects", visible: true },
  { id: "certificates", title: "Chứng chỉ & Bằng cấp", type: "certificates", visible: true },
];

export const DEFAULT_THEME: ResumeTheme = {
  templateId: "modern-two-column",
  primaryColor: "#0062ff",
  secondaryColor: "#e0edff",
  fontFamily: "var(--font-be-vietnam), sans-serif",
  fontSize: "normal",
  spacing: "normal",
  showAvatar: true,
  avatarStyle: "rounded",
  showDecorations: true,
  decorations: {
    dividerStyle: "solid",
    headerPattern: "accent-corner",
    cardBorder: "subtle",
    iconStyle: "filled",
  },
};

// Form trống khi khởi tạo (Tuân thủ: Không dùng mock dữ liệu ứng viên; form trống nếu không có dữ liệu hồ sơ thật)
export const EMPTY_RESUME_DATA: ResumeData = {
  title: "Bản CV chưa đặt tên",
  personalInfo: {
    fullName: "",
    jobTitle: "",
    email: "",
    phone: "",
    address: "",
    website: "",
    avatarUrl: "",
    summary: "",
  },
  experiences: [],
  educations: [],
  skills: [],
  projects: [],
  certificates: [],
  sections: DEFAULT_SECTIONS,
  theme: DEFAULT_THEME,
  updatedAt: new Date().toISOString(),
};
