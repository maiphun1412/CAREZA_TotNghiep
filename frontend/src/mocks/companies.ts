export interface MockCompany {
  id: string;
  name: string;
  logoUrl: string;
  bannerUrl: string;
  industry: string;
  scale: string;
  foundedYear: string;
  address: string;
  website: string;
  about: string;
  openJobsCount: number;
  rating: number;
  reviewsCount: number;
  techStack: string[];
  benefits: string[];
  branches: {
    name: string;
    address: string;
    isHeadquarter?: boolean;
  }[];
}

export const mockCompanies: MockCompany[] = [
  {
    id: "comp-1",
    name: "FPT Software",
    logoUrl: "https://commons.wikimedia.org/wiki/Special:Redirect/file/FPT_Software_logo.svg",
    bannerUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&h=400&q=80",
    industry: "Công nghệ thông tin & Dịch vụ phần mềm",
    scale: "30.000+ nhân viên",
    foundedYear: "1999",
    address: "F-Town 3, Khu Công Nghệ Cao, TP. Thủ Đức, TP. Hồ Chí Minh",
    website: "https://fptsoftware.com",
    about: "FPT Software là công ty công nghệ và chuyển đổi số toàn cầu hàng đầu Việt Nam, hiện diện tại gần 30 quốc gia trên thế giới với đội ngũ chuyên gia công nghệ xuất sắc.",
    openJobsCount: 48,
    rating: 4.8,
    reviewsCount: 1250,
    techStack: ["React", "Next.js", "Java", "Python", ".NET", "AWS", "Azure"],
    benefits: [
      "FPT Care - Bảo hiểm sức khỏe toàn diện",
      "Làm việc Hybrid linh hoạt",
      "Chương trình onsite nước ngoài thường xuyên",
      "Cơ sở vật chất hiện đại chuẩn Campus quốc tế",
    ],
    branches: [
      { name: "F-Ville 1 & 2", address: "Khu CNC Hòa Lạc, Thạch Thất, Hà Nội", isHeadquarter: true },
      { name: "F-Town 1, 2 & 3", address: "Khu Công Nghệ Cao, TP. Thủ Đức, TP. HCM" },
      { name: "FPT Complex", address: "Đường Nam Kỳ Khởi Nghĩa, Ngũ Hành Sơn, Đà Nẵng" },
    ],
  },
  {
    id: "comp-2",
    name: "Viettel AI & Digital",
    logoUrl: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Viettel_logo_2021.svg",
    bannerUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&h=400&q=80",
    industry: "Viễn thông & Trí tuệ nhân tạo (AI)",
    scale: "50.000+ nhân viên",
    foundedYear: "1989",
    address: "Tòa nhà Viettel, Số 1 Trần Hữu Dực, Cầu Giấy, Hà Nội",
    website: "https://viettel.com.vn",
    about: "Tập đoàn Công nghiệp - Viễn thông Quân đội Viettel là doanh nghiệp viễn thông và công nghệ thông tin lớn nhất Việt Nam.",
    openJobsCount: 35,
    rating: 4.9,
    reviewsCount: 980,
    techStack: ["Python", "PyTorch", "Golang", "Kubernetes", "Hadoop", "Kafka"],
    benefits: [
      "Thu nhập hấp dẫn hàng đầu ngành",
      "Thưởng dự án và sáng kiến công nghệ",
      "Chế độ nghỉ dưỡng và chăm sóc sức khỏe cao cấp",
    ],
    branches: [
      { name: "Trụ sở chính Viettel", address: "Số 1 Trần Hữu Dực, Cầu Giấy, Hà Nội", isHeadquarter: true },
      { name: "Viettel Complex", address: "285 Cách Mạng Tháng Tám, Quận 10, TP. HCM" },
    ],
  },
  {
    id: "comp-3",
    name: "Shopee Vietnam",
    logoUrl: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Shopee.svg",
    bannerUrl: "https://images.unsplash.com/photo-1556742049-0a67e557b3f3?auto=format&fit=crop&w=1200&h=400&q=80",
    industry: "Thương mại điện tử & Fintech",
    scale: "5.000+ nhân viên",
    foundedYear: "2015",
    address: "Saigon Centre, 67 Lê Lợi, Bến Nghé, Quận 1, TP. Hồ Chí Minh",
    website: "https://shopee.vn",
    about: "Shopee là nền tảng thương mại điện tử hàng đầu tại Đông Nam Á và Đài Loan, đem lại trải nghiệm mua sắm trực tuyến dễ dàng, an toàn và nhanh chóng.",
    openJobsCount: 22,
    rating: 4.7,
    reviewsCount: 640,
    techStack: ["React", "Python", "Go", "MySQL", "Redis", "Elasticsearch"],
    benefits: [
      "Văn phòng hiện đại trung tâm Quận 1",
      "Voucher mua sắm nội bộ hằng tháng",
      "Môi trường đa văn hóa, làm việc với đồng nghiệp quốc tế",
    ],
    branches: [
      { name: "Văn phòng Saigon Centre", address: "67 Lê Lợi, Quận 1, TP. HCM", isHeadquarter: true },
      { name: "Văn phòng Lotte Center", address: "54 Liễu Giai, Ba Đình, Hà Nội" },
    ],
  },
  {
    id: "comp-4",
    name: "Techcombank",
    logoUrl: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Techcombank_logo.png",
    bannerUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&h=400&q=80",
    industry: "Tài chính - Ngân hàng số",
    scale: "12.000+ nhân viên",
    foundedYear: "1993",
    address: "Techcombank Tower, 6 Quang Trung, Hoàn Kiếm, Hà Nội",
    website: "https://techcombank.com",
    about: "Techcombank là một trong những ngân hàng cổ phần hàng đầu tại Việt Nam, tiên phong chuyển đổi số toàn diện và ngân hàng số thế hệ mới.",
    openJobsCount: 19,
    rating: 4.6,
    reviewsCount: 820,
    techStack: ["Java Spring", "React", "Kafka", "PostgreSQL", "Docker", "AWS"],
    benefits: [
      "Gói đãi ngộ tài chính vượt trội",
      "Lãi suất vay ưu đãi cán bộ nhân viên",
      "Chương trình đào tạo kỹ năng lãnh đạo",
    ],
    branches: [
      { name: "Techcombank Tower Hà Nội", address: "6 Quang Trung, Hoàn Kiếm, Hà Nội", isHeadquarter: true },
      { name: "Techcombank Tower Sài Gòn", address: "23 Lê Duẩn, Quận 1, TP. HCM" },
    ],
  },
];
