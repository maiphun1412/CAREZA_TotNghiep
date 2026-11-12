import {
  FileText,
  MessageSquare,
  Compass,
  Zap,
  TrendingUp,
  Coins,
  Bot,
  Calculator,
  BrainCircuit,
  FileCheck,
} from "lucide-react";

export interface HandbookCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: any;
  iconColor: string;
  iconBg: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
}

export interface HandbookArticle {
  id: string;
  slug: string;
  categorySlug: string;
  categoryName: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  author: string;
  authorRole: string;
  authorAvatar?: string;
  image: string;
  isFeatured?: boolean;
  isHeroMain?: boolean;
  isSideFeatured?: boolean;
  isLatest?: boolean;
  topicGroup: "cv-interview" | "skills-career" | "market-salary";
  views?: number;
  content: string;
}

export interface CareerTool {
  id: string;
  title: string;
  description: string;
  icon: any;
  iconColor: string;
  iconBg: string;
  href: string;
  tag: string;
  badgeColor: string;
}

// 6 Danh mục cẩm nang chuẩn theo yêu cầu
export const HANDBOOK_CATEGORIES: HandbookCategory[] = [
  {
    id: "viet-cv",
    name: "Viết CV",
    slug: "viet-cv",
    description: "Mẹo viết CV chuẩn ATS, portfolio và thư ứng tuyển nổi bật",
    icon: FileText,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50 border-blue-200/80",
    badgeBg: "bg-blue-50",
    badgeBorder: "border-blue-200",
    badgeText: "text-blue-700",
  },
  {
    id: "phong-van",
    name: "Phỏng vấn",
    slug: "phong-van",
    description: "Bí quyết trả lời phỏng vấn, câu hỏi tình huống và ứng xử khéo léo",
    icon: MessageSquare,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50 border-emerald-200/80",
    badgeBg: "bg-emerald-50",
    badgeBorder: "border-emerald-200",
    badgeText: "text-emerald-700",
  },
  {
    id: "dinh-huong-nghe-nghiep",
    name: "Định hướng",
    slug: "dinh-huong-nghe-nghiep",
    description: "Lộ trình thăng tiến, chuyển ngành và tìm kiếm mục tiêu sự nghiệp",
    icon: Compass,
    iconColor: "text-purple-600",
    iconBg: "bg-purple-50 border-purple-200/80",
    badgeBg: "bg-purple-50",
    badgeBorder: "border-purple-200",
    badgeText: "text-purple-700",
  },
  {
    id: "ky-nang-nghe-nghiep",
    name: "Kỹ năng ",
    slug: "ky-nang-nghe-nghiep",
    description: "Kỹ năng mềm, kỹ năng số, quản lý thời gian và giải quyết vấn đề",
    icon: Zap,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50 border-amber-200/80",
    badgeBg: "bg-amber-50",
    badgeBorder: "border-amber-200",
    badgeText: "text-amber-700",
  },
  {
    id: "thi-truong-lao-dong",
    name: "Thị trường ",
    slug: "thi-truong-lao-dong",
    description: "Báo cáo tuyển dụng, xu hướng công nghệ AI và dịch chuyển nhân lực",
    icon: TrendingUp,
    iconColor: "text-rose-600",
    iconBg: "bg-rose-50 border-rose-200/80",
    badgeBg: "bg-rose-50",
    badgeBorder: "border-rose-200",
    badgeText: "text-rose-700",
  },
  {
    id: "luong-phuc-loi",
    name: "Lương & Phúc lợi",
    slug: "luong-phuc-loi",
    description: "Bí quyết đàm phán lương, hiểu về Gross - Net, bảo hiểm và đãi ngộ",
    icon: Coins,
    iconColor: "text-teal-600",
    iconBg: "bg-teal-50 border-teal-200/80",
    badgeBg: "bg-teal-50",
    badgeBorder: "border-teal-200",
    badgeText: "text-teal-700",
  },
];

// Helper chuẩn hóa category slug tương thích ngược
export const normalizeCategorySlug = (slug: string | null): string => {
  if (!slug || slug === "all") return "all";
  const map: Record<string, string> = {
    "tim-viec": "viet-cv",
    "viet-cv": "viet-cv",
    "phong-van": "phong-van",
    "ky-nang": "ky-nang-nghe-nghiep",
    "ky-nang-nghe-nghiep": "ky-nang-nghe-nghiep",
    "thi-truong": "thi-truong-lao-dong",
    "thi-truong-lao-dong": "thi-truong-lao-dong",
    "luong-phuc-loi": "luong-phuc-loi",
    "phat-trien-su-nghiep": "dinh-huong-nghe-nghiep",
    "dinh-huong-nghe-nghiep": "dinh-huong-nghe-nghiep",
    "tin-tuc-careza": "thi-truong-lao-dong",
  };
  return map[slug] || slug;
};

// Danh sách bài viết chuẩn chuyên sâu (có đầy đủ bài viết và nội dung chi tiết)
export const HANDBOOK_ARTICLES: HandbookArticle[] = [
  // 1. Hero Main (Featured lớn) - Viết CV
  {
    id: "art-1",
    slug: "huong-dan-viet-cv-an-tuong-chinh-phuc-nha-tuyen-dung",
    categorySlug: "viet-cv",
    categoryName: "Viết CV",
    title: "Hướng dẫn viết CV ấn tượng chuẩn ATS giúp bạn chinh phục nhà tuyển dụng",
    excerpt: "Từ bố cục, từ khóa tối ưu hóa hệ thống ATS đến cách trình bày thành tựu bằng mô hình STAR định vị năng lực vượt trội.",
    date: "12/08/2026",
    readTime: "5 phút đọc",
    author: "Ban Biên Tập Careza",
    authorRole: "Chuyên gia Hướng nghiệp & Tuyển dụng",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=1200&q=80",
    isFeatured: true,
    isHeroMain: true,
    topicGroup: "cv-interview",
    views: 3420,
    content: `
      <p class="lead">Trong thị trường tuyển dụng hiện đại, CV không đơn thuần là một bản tóm tắt quá trình học tập và làm việc. Đó chính là tài liệu marketing cá nhân định vị thương hiệu của bạn trước nhà tuyển dụng và hệ thống quét hồ sơ tự động (ATS).</p>
      
      <h2>1. Tối ưu hóa từ khóa chuẩn hệ thống ATS</h2>
      <p>Hơn 85% các doanh nghiệp lớn hiện nay áp dụng phần mềm ATS (Applicant Tracking System) để phân loại và lọc ứng viên trước khi chuyển đến tay nhà tuyển dụng. Để CV vượt qua vòng lọc này:</p>
      <ul>
        <li>Đọc kỹ mô tả công việc (Job Description) và trích xuất các kỹ năng trọng yếu.</li>
        <li>Sử dụng đúng thuật ngữ chuyên môn chuẩn xác (ví dụ: Next.js thay vì chỉ ghi Frontend, Agile/Scrum, CI/CD).</li>
        <li>Định dạng file PDF chuẩn, tránh sử dụng quá nhiều bảng biểu phức tạp che khuất text parser.</li>
      </ul>

      <h2>2. Đo lường thành tựu bằng con số cụ thể (Mô hình STAR / Google XYZ)</h2>
      <p>Thay vì chỉ liệt kê các đầu việc chung chung, hãy chứng minh giá trị thực tế bạn mang lại cho doanh nghiệp bằng công thức: <em>“Đã hoàn thành [X], được đo bằng [Y], thông qua việc thực hiện [Z]”</em>.</p>
      <blockquote>
        <strong>Ví dụ:</strong> “Tối ưu hóa thời gian tải trang của ứng dụng thương mại điện tử giảm 40% (từ 2.8s xuống 1.6s) nhờ việc áp dụng kỹ thuật Server Components và nén hình ảnh WebP tự động.”
      </blockquote>

      <h2>3. Bố cục tinh gọn và dễ quét mắt trong 6 giây</h2>
      <p>Nhà tuyển dụng trung bình chỉ dành từ 6 đến 10 giây cho lần đọc lướt đầu tiên. Hãy đảm bảo:</p>
      <ul>
        <li>Thông tin liên hệ, tiêu đề nghề nghiệp rõ ràng ở đầu trang.</li>
        <li>Kinh nghiệm làm việc được sắp xếp theo trình tự thời gian đảo ngược (mới nhất lên đầu).</li>
        <li>Độ dài tối ưu: 1 trang cho ứng viên dưới 3 năm kinh nghiệm, 2 trang cho ứng viên cấp Senior trở lên.</li>
      </ul>
    `,
  },

  // 2. Side Featured 1 - Phỏng vấn
  {
    id: "art-2",
    slug: "nhung-cau-hoi-phong-van-thuong-gap-va-cach-tra-loi-hieu-qua",
    categorySlug: "phong-van",
    categoryName: "Phỏng vấn",
    title: "Những câu hỏi phỏng vấn thường gặp và cách trả lời thuyết phục người phỏng vấn",
    excerpt: "Cách giải quyết trọn vẹn câu hỏi về điểm yếu, lý do chuyển việc và tình huống xung đột nội bộ bằng sự điềm tĩnh và chuyên nghiệp.",
    date: "10/08/2026",
    readTime: "7 phút đọc",
    author: "Thu Hà",
    authorRole: "Senior HR Manager tại FPT Software",
    authorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    image: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80",
    isFeatured: true,
    isSideFeatured: true,
    topicGroup: "cv-interview",
    views: 2890,
    content: `
      <p class="lead">Buổi phỏng vấn không phải là một bài kiểm tra vấn đáp một chiều, mà là cơ hội để hai bên tìm hiểu mức độ phù hợp về văn hóa và năng lực giải quyết vấn đề.</p>

      <h2>1. Câu hỏi “Hãy giới thiệu ngắn gọn về bản thân”</h2>
      <p>Áp dụng công thức <strong>Hiện tại – Quá khứ – Tương lai</strong> trong vòng 90 giây: Vị trí hiện tại của bạn là gì, thành tựu tiêu biểu trong quá khứ đã rèn luyện bạn thế nào, và vì sao cơ hội tại công ty này là bước đi tiếp theo lý tưởng.</p>

      <h2>2. Câu hỏi “Điểm yếu lớn nhất của bạn là gì?”</h2>
      <p>Không dùng các câu trả lời sáo rỗng như “tôi quá cầu toàn” hay “tôi tham công tiếc việc”. Hãy nêu một điểm yếu chuyên môn thực tế mà bạn đã nhận diện được và đang chủ động khắc phục bằng hành động cụ thể.</p>

      <h2>3. Kỹ thuật đặt câu hỏi ngược lại cho nhà tuyển dụng</h2>
      <p>Ở cuối buổi phỏng vấn, hãy thể hiện sự chủ động thông qua các câu hỏi thông minh:</p>
      <ul>
        <li>“Mục tiêu lớn nhất của bộ phận trong 6 tháng tới là gì?”</li>
        <li>“Thách thức khó nhất mà người ở vị trí này sẽ phải giải quyết trong 90 ngày đầu tiên là gì?”</li>
      </ul>
    `,
  },

  // 3. Side Featured 2 - Lương & Phúc lợi
  {
    id: "art-3",
    slug: "nghe-thuat-dam-phan-luong-khi-nhan-offer",
    categorySlug: "luong-phuc-loi",
    categoryName: "Lương & Phúc lợi",
    title: "Nghệ thuật đàm phán lương và phúc lợi khi nhận thư mời làm việc (Offer)",
    excerpt: "Nghiên cứu dải lương thị trường, phân tích tổng gói đãi ngộ (Total Compensation) và thương lượng tinh tế không gây áp lực.",
    date: "08/08/2026",
    readTime: "8 phút đọc",
    author: "Minh Trang",
    authorRole: "HR Consultant & Career Coach",
    authorAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80",
    isFeatured: true,
    isSideFeatured: true,
    topicGroup: "market-salary",
    views: 4120,
    content: `
      <p class="lead">Đàm phán lương là một bước quan trọng trong quá trình ứng tuyển. Một chiến lược đàm phán thông minh không chỉ giúp bạn nhận được mức đãi ngộ xứng đáng mà còn thể hiện năng lực tự tin và thấu hiểu giá trị bản thân.</p>
      
      <h2>1. Nghiên cứu kỹ mức lương thị trường (Salary Benchmark)</h2>
      <p>Trước khi đưa ra bất kỳ con số nào, bạn cần nắm rõ dải lương trung bình cho vị trí, số năm kinh nghiệm và khu vực địa lý tương ứng. Tìm hiểu qua các báo cáo lương uy tín và cộng đồng chuyên môn.</p>

      <h2>2. Nhìn vào tổng gói đãi ngộ (Total Compensation)</h2>
      <p>Lương cứng (Base Salary) chỉ là một phần. Hãy cân nhắc kỹ toàn bộ gói quyền lợi:</p>
      <ul>
        <li>Lương tháng 13 và thưởng hiệu suất (Performance Bonus).</li>
        <li>Bảo hiểm sức khỏe cao cấp cho bản thân và người phụ thuộc.</li>
        <li>Số ngày phép năm, chế độ làm việc linh hoạt (Hybrid / Remote).</li>
        <li>Ngân sách đào tạo, học tập nâng cao chuyên môn.</li>
      </ul>

      <h2>3. Thời điểm vàng để mở lời đàm phán</h2>
      <p>Chỉ đàm phán khi bạn đã chính thức nhận được đề nghị tuyển dụng từ công ty. Lúc này, doanh nghiệp đã khẳng định muốn bạn gia nhập, và vị thế thương lượng của bạn là cao nhất.</p>
    `,
  },

  // 4. Latest 1 - Kỹ năng nghề nghiệp
  {
    id: "art-4",
    slug: "10-ky-nang-mem-quan-trong-thanh-cong-moi-nganh-nghe",
    categorySlug: "ky-nang-nghe-nghiep",
    categoryName: "Kỹ năng nghề nghiệp",
    title: "10 kỹ năng mềm quan trọng giúp bạn thành công bền vững trong kỷ nguyên AI",
    excerpt: "Giao tiếp, tư duy phản biện, khả năng thích ứng linh hoạt và quản trị cảm xúc – những yếu tố máy móc không thể thay thế con người.",
    date: "15/08/2026",
    readTime: "6 phút đọc",
    author: "Ngọc Lan",
    authorRole: "Talent Development Lead",
    authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
    isLatest: true,
    topicGroup: "skills-career",
    views: 2150,
    content: `
      <p class="lead">Khi trí tuệ nhân tạo ngày càng tự động hóa các tác vụ lặp lại, năng lực cạnh tranh cốt lõi của người lao động chuyển dịch mạnh mẽ sang kỹ năng mềm và tư duy chiến lược.</p>

      <h2>1. Tư duy phản biện và khả năng đặt câu hỏi đúng</h2>
      <p>AI có thể đưa ra câu trả lời cho hầu hết vấn đề, nhưng chỉ con người mới biết đặt đúng câu hỏi và phân định dữ liệu đúng sai để đưa ra quyết định kinh doanh chuẩn xác.</p>

      <h2>2. Giao tiếp liên chức năng (Cross-functional Communication)</h2>
      <p>Khả năng kết nối giữa kỹ thuật và kinh doanh, giải thích vấn đề phức tạp bằng ngôn từ đơn giản là phẩm chất được các nhà tuyển dụng đánh giá cao nhất hiện nay.</p>

      <h2>3. Khả năng tự học và thích ứng nhanh (Agility)</h2>
      <p>Chu kỳ đào thải công nghệ ngày càng rút ngắn. Tinh thần chủ động tiếp thu kiến thức mới và dám thử nghiệm phương pháp mới chính là chìa khóa thăng tiến bền vững.</p>
    `,
  },

  // 5. Latest 2 - Định hướng nghề nghiệp
  {
    id: "art-5",
    slug: "lo-trinh-phat-trien-su-nghiep-danh-cho-nguoi-moi-di-lam",
    categorySlug: "dinh-huong-nghe-nghiep",
    categoryName: "Định hướng nghề nghiệp",
    title: "Lộ trình phát triển sự nghiệp trong 3 năm đầu tiên dành cho người mới đi làm",
    excerpt: "Các giai đoạn tích lũy kinh nghiệm, xây dựng uy tín cá nhân và định vị năng lực để bứt phá từ Junior lên Mid/Senior vững chắc.",
    date: "14/08/2026",
    readTime: "6 phút đọc",
    author: "Hoàng Long",
    authorRole: "Career Mentor tại TechX",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
    isLatest: true,
    topicGroup: "skills-career",
    views: 1980,
    content: `
      <p class="lead">Ba năm đầu tiên đi làm là giai đoạn bản lề quyết định quỹ đạo phát triển dài hạn của một người. Xây dựng nền tảng vững chắc trong giai đoạn này sẽ tạo đòn bẩy mạnh mẽ cho tương lai.</p>

      <h2>Năm 1: Học việc chuyên sâu và tạo dựng sự tin cậy</h2>
      <p>Tập trung hoàn thành tốt mọi nhiệm vụ được giao đúng hạn, học cách phối hợp trong đội ngũ và chủ động ghi chép quy trình làm việc chuẩn.</p>

      <h2>Năm 2: Làm chủ chuyên môn và đề xuất cải tiến</h2>
      <p>Bắt đầu chịu trách nhiệm độc lập cho các dự án quy mô vừa, tìm cách tối ưu hóa hiệu suất làm việc và mở rộng phạm vi đóng góp.</p>

      <h2>Năm 3: Định hình thế mạnh độc nhất và mở rộng quan hệ</h2>
      <p>Xác định rõ bạn muốn trở thành chuyên gia kỹ thuật sâu (Individual Contributor) hay chuyển hướng quản lý con người (People Manager).</p>
    `,
  },

  // 6. Latest 3 - Thị trường lao động
  {
    id: "art-6",
    slug: "top-nganh-nghe-tiem-nang-5-nam-toi-va-co-hoi-viec-lam",
    categorySlug: "thi-truong-lao-dong",
    categoryName: "Thị trường lao động",
    title: "Báo cáo thị trường lao động 2026: Top ngành nghề tiềm năng và cơ hội bứt phá",
    excerpt: "Dự báo chuyển dịch nhân lực, nhu cầu nhân tài ngành Công nghệ thông tin, Bán dẫn, Fintech và Năng lượng xanh.",
    date: "13/08/2026",
    readTime: "7 phút đọc",
    author: "Careza Research",
    authorRole: "Trung tâm Nghiên cứu Thị trường Lao động",
    authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    isLatest: true,
    topicGroup: "market-salary",
    views: 3870,
    content: `
      <p class="lead">Năm 2026 ghi nhận bước ngoặt lớn về cơ cấu việc làm tại Việt Nam với sự bùng nổ của chuyển đổi số và xu hướng phát triển bền vững (ESG).</p>

      <h2>1. Ngành Công nghệ AI và Dữ liệu lớn</h2>
      <p>Nhu cầu tuyển dụng kỹ sư Machine Learning, chuyên viên phân tích dữ liệu và kỹ sư tích hợp AI tăng trưởng trên 45% so với cùng kỳ năm trước.</p>

      <h2>2. Lĩnh vực Bán dẫn và Vi mạch điện tử</h2>
      <p>Với các hiệp định hợp tác quốc tế, ngành bán dẫn tại Việt Nam đang thiếu hụt nghiêm trọng nhân lực chất lượng cao, mở ra mức đãi ngộ hấp dẫn cho các kỹ sư trẻ.</p>

      <h2>3. Nhân sự ngành Năng lượng xanh & Phát triển bền vững</h2>
      <p>Các tiêu chuẩn cam kết Net Zero thúc đẩy doanh nghiệp săn đón các chuyên gia quản lý môi trường, năng lượng tái tạo và chuỗi cung ứng xanh.</p>
    `,
  },

  // 7. Latest 4 - Lương & Phúc lợi
  {
    id: "art-7",
    slug: "hieu-dung-ve-luong-thuong-va-cac-phuc-loi-doanh-nghiep",
    categorySlug: "luong-phuc-loi",
    categoryName: "Lương & Phúc lợi",
    title: "Phân biệt lương Gross và lương Net: Những lưu ý sống còn về BHXH và Thuế TNCN",
    excerpt: "Nắm rõ cách tính lương thực nhận, quyền lợi khi ốm đau, thai sản, thất nghiệp để bảo vệ trọn vẹn quyền lợi tài chính hợp pháp của bản thân.",
    date: "11/08/2026",
    readTime: "8 phút đọc",
    author: "Ban Pháp Chế Careza",
    authorRole: "Tư vấn Luật Lao động & Phúc lợi",
    authorAvatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&q=80",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    isLatest: true,
    topicGroup: "market-salary",
    views: 2650,
    content: `
      <p class="lead">Hiểu rõ sự khác biệt giữa lương Gross và lương Net là kiến thức căn bản giúp bạn không bị bỡ ngỡ khi ký kết hợp đồng lao động.</p>

      <h2>Lương Gross là gì?</h2>
      <p>Là tổng thu nhập trước khi trích nộp các khoản đóng bắt buộc (10.5% bảo hiểm bắt buộc gồm 8% BHXH, 1.5% BHYT, 1% BHTN) và Thuế thu nhập cá nhân.</p>

      <h2>Lương Net là gì?</h2>
      <p>Là số tiền thực tế đổ về tài khoản ngân hàng của bạn sau khi công ty đã trừ hết các khoản trích theo luật định.</p>

      <h2>Nên deal lương Gross hay lương Net?</h2>
      <p>Hầu hết chuyên gia nhân sự khuyên nên thỏa thuận trên mức lương Gross minh bạch để đảm bảo mức đóng bảo hiểm phản ánh đúng thu nhập thực tế, mang lại quyền lợi hưu trí và bảo hiểm cao hơn trong tương lai.</p>
    `,
  },

  // 8. Kỹ năng nghề nghiệp
  {
    id: "art-8",
    slug: "cach-ren-luyen-ky-nang-giao-tiep-hieu-qua-trong-cong-viec",
    categorySlug: "ky-nang-nghe-nghiep",
    categoryName: "Kỹ năng nghề nghiệp",
    title: "Cách rèn luyện kỹ năng lắng nghe chủ động và giao tiếp thấu cảm tại công sở",
    excerpt: "Giải quyết bất đồng quan điểm, truyền đạt ý tưởng mạch lạc và xây dựng mối quan hệ tin cậy với cấp trên cũng như đồng nghiệp.",
    date: "09/08/2026",
    readTime: "5 phút đọc",
    author: "Nguyễn Hoàng Minh",
    authorRole: "Communication Coach",
    authorAvatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80",
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80",
    topicGroup: "skills-career",
    views: 1820,
    content: `
      <p class="lead">Giao tiếp tốt không phải là nói nhiều hay dùng từ ngữ hoa mỹ, mà là khả năng lắng nghe để thấu hiểu và truyền đạt thông điệp chính xác, tôn trọng đối phương.</p>

      <h2>1. Kỹ thuật lắng nghe chủ động (Active Listening)</h2>
      <p>Không ngắt lời người khác khi họ đang trình bày. Gật đầu ghi nhận và nhắc lại các điểm chính bằng từ ngữ của mình để xác nhận đã hiểu đúng thông tin.</p>

      <h2>2. Tách biệt sự thật (Facts) và cảm xúc (Feelings)</h2>
      <p>Khi xảy ra tranh luận về dự án, hãy tập trung vào số liệu và kết quả công việc thay vì quy chụp cá nhân.</p>
    `,
  },

  // 9. Phỏng vấn
  {
    id: "art-9",
    slug: "phuong-phap-star-trong-phong-van-tuyen-dung",
    categorySlug: "phong-van",
    categoryName: "Phỏng vấn",
    title: "Ứng dụng mô hình STAR làm chủ mọi câu hỏi phỏng vấn hành vi (Behavioral Interview)",
    excerpt: "Cách kể câu chuyện kinh nghiệm theo 4 bước Situation – Task – Action – Result thuyết phục và đầy sức hút.",
    date: "07/08/2026",
    readTime: "6 phút đọc",
    author: "Đặng Thùy Dương",
    authorRole: "Headhunter & Career Advisor",
    authorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
    topicGroup: "cv-interview",
    views: 3100,
    content: `
      <p class="lead">Mô hình STAR là tiêu chuẩn vàng được các tập đoàn đa quốc gia áp dụng để đánh giá năng lực thực tế của ứng viên thông qua các trải nghiệm trong quá khứ.</p>

      <h2>S - Situation (Bối cảnh)</h2>
      <p>Mô tả ngắn gọn bối cảnh dự án, thử thách mà bạn hoặc nhóm của bạn đối mặt.</p>

      <h2>T - Task (Nhiệm vụ)</h2>
      <p>Nêu rõ vai trò cụ thể và trách nhiệm của bạn trong việc giải quyết thử thách đó.</p>

      <h2>A - Action (Hành động)</h2>
      <p>Đây là phần quan trọng nhất chiếm 60% thời gian: Chi tiết các bước bạn đã triển khai, công cụ áp dụng và cách bạn vượt qua trở ngại.</p>

      <h2>R - Result (Kết quả)</h2>
      <p>Đo lường thành công bằng các con số định lượng (tăng trưởng doanh thu, tiết kiệm thời gian, tối ưu quy trình) và bài học bạn đúc kết được.</p>
    `,
  },
];

// 4 Công cụ thiết thực trong hệ sinh thái CAREZA
export const CAREER_TOOLS: CareerTool[] = [
  {
    id: "cv-builder",
    title: "Tạo CV Chuẩn ATS",
    description: "Bộ công cụ khởi tạo CV hiện đại, gợi ý từ khóa phù hợp với hệ thống lọc tuyển dụng.",
    icon: FileCheck,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50 border-blue-200/80",
    href: "/ung-vien/cv/builder",
    tag: "Khuyên dùng",
    badgeColor: "bg-blue-100/80 text-blue-800",
  },
  {
    id: "salary-calculator",
    title: "Tính Lương Gross – Net",
    description: "Chuyển đổi chuẩn xác thu nhập thực nhận theo quy định BHXH và Thuế TNCN mới nhất 2026.",
    icon: Calculator,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50 border-emerald-200/80",
    href: "/cong-cu/tinh-luong-gross-net",
    tag: "Miễn phí",
    badgeColor: "bg-emerald-100/80 text-emerald-800",
  },
  {
    id: "mbti-test",
    title: "Trắc Nghiệm Tính Cách MBTI",
    description: "Khám phá 16 nhóm tính cách để định hình công việc và môi trường doanh nghiệp phù hợp.",
    icon: BrainCircuit,
    iconColor: "text-purple-600",
    iconBg: "bg-purple-50 border-purple-200/80",
    href: "/cong-cu/mbti",
    tag: "Khám phá",
    badgeColor: "bg-purple-100/80 text-purple-800",
  },
  {
    id: "ai-career-advisor",
    title: "Trợ Lý Hướng Nghiệp AI",
    description: "Phân tích hồ sơ năng lực, đối chiếu với yêu cầu thị trường và gợi ý lộ trình phát triển kỹ năng.",
    icon: Bot,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50 border-amber-200/80",
    href: "/ai-career",
    tag: "AI Thông minh",
    badgeColor: "bg-amber-100/80 text-amber-800",
  },
];

