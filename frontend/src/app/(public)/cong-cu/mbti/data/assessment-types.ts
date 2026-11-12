export type AssessmentType = "mbti" | "riasec" | "bigfive" | "disc";

export interface AssessmentMeta {
  id: AssessmentType;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  questionCount: number;
  estimatedMinutes: string;
  category: string;
  badge: string;
  color: string;
  borderColor: string;
  bgLight: string;
  icon: string;
  features: string[];
}

export const ASSESSMENTS_CATALOG: AssessmentMeta[] = [
  {
    id: "mbti",
    name: "Trắc nghiệm MBTI",
    shortName: "MBTI",
    tagline: "Khám phá 16 nhóm tính cách và phong cách làm việc.",
    description: "Khám phá 16 nhóm tính cách và phong cách làm việc.",
    questionCount: 20,
    estimatedMinutes: "6–8 phút",
    category: "Tính cách & Tư duy",
    badge: "Phổ biến nhất",
    color: "#2563eb",
    borderColor: "border-blue-200",
    bgLight: "bg-blue-50/70",
    icon: "Brain",
    features: ["Thấu hiểu điểm mạnh tự nhiên", "Gợi ý nghề nghiệp phù hợp"],
  },
  {
    id: "riasec",
    name: "Trắc nghiệm RIASEC",
    shortName: "Holland RIASEC",
    tagline: "Xác định sở thích và nhóm nghề nghiệp phù hợp.",
    description: "Xác định sở thích và nhóm nghề nghiệp phù hợp.",
    questionCount: 30,
    estimatedMinutes: "8–10 phút",
    category: "Định hướng nghề nghiệp",
    badge: "Chuẩn hướng nghiệp",
    color: "#059669",
    borderColor: "border-emerald-200",
    bgLight: "bg-emerald-50/70",
    icon: "Compass",
    features: ["Định vị thiên hướng nghề nghiệp", "Môi trường làm việc tối ưu"],
  },
  {
    id: "bigfive",
    name: "Trắc nghiệm Big Five",
    shortName: "Big Five OCEAN",
    tagline: "Đánh giá 5 đặc điểm tính cách nổi bật.",
    description: "Đánh giá 5 đặc điểm tính cách nổi bật.",
    questionCount: 30,
    estimatedMinutes: "8–10 phút",
    category: "Tâm lý & Hành vi",
    badge: "Chuẩn khoa học",
    color: "#7c3aed",
    borderColor: "border-purple-200",
    bgLight: "bg-purple-50/70",
    icon: "Layers",
    features: ["Đánh giá 5 đặc điểm cốt lõi", "Lời khuyên phát triển sự nghiệp"],
  },
  {
    id: "disc",
    name: "Trắc nghiệm DISC",
    shortName: "DISC",
    tagline: "Khám phá phong cách giao tiếp và hành vi.",
    description: "Khám phá phong cách giao tiếp và hành vi.",
    questionCount: 24,
    estimatedMinutes: "6–8 phút",
    category: "Giao tiếp & Làm việc nhóm",
    badge: "Ứng dụng doanh nghiệp",
    color: "#ea580c",
    borderColor: "border-orange-200",
    bgLight: "bg-orange-50/70",
    icon: "Users",
    features: ["Tối ưu kỹ năng giao tiếp", "Nâng cao hiệu quả làm việc nhóm"],
  },
];

