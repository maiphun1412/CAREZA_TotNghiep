"use client";

import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import {
  Dropdown,
  Tooltip,
  Modal,
  App,
  Rate,
  Input,
  Select,
  Tag,
  Avatar,
  Checkbox,
  Radio,
} from "antd";
import {
  Plus,
  Users,
  UserCheck,
  Star,
  Calendar,
  Award,
  Search,
  Filter,
  SlidersHorizontal,
  MessageSquare,
  FileText,
  MoreHorizontal,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  MapPin,
  Clock,
  Briefcase,
  Mail,
  Phone,
  Eye,
  Download,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Globe,
  UserPlus,
  Send,
  FileSpreadsheet,
  RefreshCw,
  FolderPlus,
  LayoutGrid,
  ListFilter,
  Kanban,
  CheckCheck,
  HelpCircle,
  Paperclip,
  Building,
  GraduationCap,
  ShieldCheck,
  X,
} from "lucide-react";

// =====================================================================
// DATA TYPES
// =====================================================================
export type PipelineStage = "NEW" | "SCREENING" | "MATCHED" | "INTERVIEW" | "OFFER" | "HIRED" | "REJECTED";

export type PipelineActionType =
  | "profile"
  | "cv"
  | "move-stage"
  | "interview"
  | "talent-pool"
  | "message"
  | "reject"
  | null;

export interface PipelineCandidate {
  id: string;
  name: string;
  avatar: string;
  jobTitle: string;
  jobCode: string;
  stage: PipelineStage;
  source: "Website" | "LinkedIn" | "Referral" | "VietnamWorks" | "TopCV";
  timeAgo: string;
  appliedDate: string;
  rating: number;
  email: string;
  phone: string;
  location?: string;
  experienceYears: number;
  education?: string;
  skills: string[];
  notes?: string;
  cvName: string;
}

// Stage visual configurations (matching pastel colors from reference screenshot)
export const STAGE_COLUMNS: {
  key: PipelineStage;
  label: string;
  count: number;
  colBg: string;
  colBorder: string;
  headerColor: string;
  pillBg: string;
  btnBorder: string;
  btnText: string;
  tagColor: string;
}[] = [
  {
    key: "NEW",
    label: "Mới",
    count: 312,
    colBg: "bg-[#F4F8FD]",
    colBorder: "border-blue-200/90",
    headerColor: "text-[#0062ff]",
    pillBg: "bg-[#E5F0FF] text-[#0062ff]",
    btnBorder: "border-blue-200",
    btnText: "text-[#0062ff]",
    tagColor: "bg-[#EFF6FF] text-[#0062ff] border-blue-200",
  },
  {
    key: "SCREENING",
    label: "Sàng lọc",
    count: 226,
    colBg: "bg-[#F2F7FC]",
    colBorder: "border-sky-200/90",
    headerColor: "text-[#0284c7]",
    pillBg: "bg-[#E0F2FE] text-[#0284c7]",
    btnBorder: "border-sky-200",
    btnText: "text-[#0284c7]",
    tagColor: "bg-[#F0F9FF] text-[#0284c7] border-sky-200",
  },
  {
    key: "MATCHED",
    label: "Phù hợp",
    count: 328,
    colBg: "bg-[#FAF7FD]",
    colBorder: "border-purple-200/90",
    headerColor: "text-[#9333ea]",
    pillBg: "bg-[#F3E8FF] text-[#9333ea]",
    btnBorder: "border-purple-200",
    btnText: "text-[#9333ea]",
    tagColor: "bg-[#FAF5FF] text-[#9333ea] border-purple-200",
  },
  {
    key: "INTERVIEW",
    label: "Phỏng vấn",
    count: 192,
    colBg: "bg-[#FEF9F2]",
    colBorder: "border-amber-200/90",
    headerColor: "text-[#d97706]",
    pillBg: "bg-[#FEF3C7] text-[#d97706]",
    btnBorder: "border-amber-200",
    btnText: "text-[#d97706]",
    tagColor: "bg-[#FFFBEB] text-[#d97706] border-amber-200",
  },
  {
    key: "OFFER",
    label: "Offer",
    count: 48,
    colBg: "bg-[#FDF5F5]",
    colBorder: "border-rose-200/90",
    headerColor: "text-[#e11d48]",
    pillBg: "bg-[#FFE4E6] text-[#e11d48]",
    btnBorder: "border-rose-200",
    btnText: "text-[#e11d48]",
    tagColor: "bg-[#FFF1F2] text-[#e11d48] border-rose-200",
  },
  {
    key: "HIRED",
    label: "Đã nhận việc",
    count: 24,
    colBg: "bg-[#F2FAF6]",
    colBorder: "border-emerald-200/90",
    headerColor: "text-[#059669]",
    pillBg: "bg-[#D1FAE5] text-[#059669]",
    btnBorder: "border-emerald-200",
    btnText: "text-[#059669]",
    tagColor: "bg-[#ECFDF5] text-[#059669] border-emerald-200",
  },
  {
    key: "REJECTED",
    label: "Đã từ chối",
    count: 118,
    colBg: "bg-[#FDF5F5]",
    colBorder: "border-rose-200/90",
    headerColor: "text-[#e11d48]",
    pillBg: "bg-[#FFE4E6] text-[#e11d48]",
    btnBorder: "border-rose-200",
    btnText: "text-[#e11d48]",
    tagColor: "bg-[#FFF1F2] text-[#e11d48] border-rose-200",
  },
];

// =====================================================================
// INITIAL PIPELINE CANDIDATES (MATCHING REFERENCE EXACTLY)
// =====================================================================
const INITIAL_PIPELINE_CANDIDATES: PipelineCandidate[] = [
  // 1. Column MỚI
  {
    id: "p-cand-1",
    name: "Nguyễn Minh Anh",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    jobTitle: "Product Manager",
    jobCode: "PM-2408",
    stage: "NEW",
    source: "Website",
    timeAgo: "2 giờ trước",
    appliedDate: "16/08/2026",
    rating: 5,
    email: "minhanh@gmail.com",
    phone: "0345 678 901",
    location: "Hồ Chí Minh, Việt Nam",
    experienceYears: 4,
    education: "Cử nhân Quản trị Kinh doanh - ĐH Ngoại Thương",
    skills: ["Product Strategy", "Roadmap", "Scrum", "User Research", "Agile"],
    cvName: "Nguyen_Minh_Anh_CV.pdf",
    notes: "Kinh nghiệm tốt về quản trị sản phẩm B2B SaaS, tư duy logic số liệu xuất sắc.",
  },
  {
    id: "p-cand-2",
    name: "Trần Hoàng Nam",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    jobTitle: "Senior UX/UI Designer",
    jobCode: "UX-2408",
    stage: "NEW",
    source: "LinkedIn",
    timeAgo: "4 giờ trước",
    appliedDate: "16/08/2026",
    rating: 4,
    email: "namth@outlook.com",
    phone: "0389 123 456",
    location: "Hà Nội, Việt Nam",
    experienceYears: 5,
    education: "Cử nhân Thiết kế Đồ họa - ĐH Mỹ thuật Công nghiệp",
    skills: ["Figma", "Design System", "Prototyping", "UX Audit", "Mobile App UI"],
    cvName: "Tran_Hoang_Nam_Portfolio.pdf",
    notes: "Portfolio thực tế ấn tượng, từng làm việc ở Agency lớn và dự án Fintech.",
  },
  {
    id: "p-cand-3",
    name: "Lê Quang Huy",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    jobTitle: "Frontend Developer",
    jobCode: "FE-2407",
    stage: "NEW",
    source: "Referral",
    timeAgo: "1 ngày trước",
    appliedDate: "15/08/2026",
    rating: 4,
    email: "lequanghuy@gmail.com",
    phone: "0378 456 789",
    location: "Hồ Chí Minh, Việt Nam",
    experienceYears: 3,
    education: "Kỹ sư CNTT - ĐH Bách Khoa TP.HCM",
    skills: ["React", "TypeScript", "Next.js", "TailwindCSS", "Redux"],
    cvName: "Le_Quang_Huy_CV.pdf",
    notes: "Được Tech lead giới thiệu, nắm vững Next.js và TailwindCSS.",
  },
  {
    id: "p-cand-4",
    name: "Phạm Thu Hằng",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    jobTitle: "Data Analyst",
    jobCode: "DA-2406",
    stage: "NEW",
    source: "VietnamWorks",
    timeAgo: "1 ngày trước",
    appliedDate: "15/08/2026",
    rating: 5,
    email: "hangpt@gmail.com",
    phone: "0367 890 123",
    location: "Đà Nẵng, Việt Nam",
    experienceYears: 3,
    education: "Cử nhân Thống kê Kinh tế - ĐH Kinh tế Quốc dân",
    skills: ["SQL", "Python", "PowerBI", "Tableau", "Data Modeling"],
    cvName: "Pham_Thu_Hang_Data_CV.pdf",
    notes: "Tư duy logic số liệu sắc bén, có chứng chỉ Google Data Analytics Certified.",
  },
  {
    id: "p-cand-5",
    name: "Vũ Ngọc Mai",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    jobTitle: "HR Generalist",
    jobCode: "HR-2408",
    stage: "NEW",
    source: "Website",
    timeAgo: "2 ngày trước",
    appliedDate: "14/08/2026",
    rating: 3,
    email: "ngocmai@gmail.com",
    phone: "0356 123 789",
    location: "Hà Nội, Việt Nam",
    experienceYears: 2,
    education: "Cử nhân Quản trị Nhân lực - ĐH Thương mại",
    skills: ["Recruitment", "C&B", "Labor Law", "Onboarding"],
    cvName: "Vu_Ngoc_Mai_HR_CV.pdf",
    notes: "Có kinh nghiệm tổng hợp nhân sự tại công ty quy mô 100 người.",
  },

  // 2. Column SÀNG LỌC
  {
    id: "p-cand-6",
    name: "Hoàng Tuấn Anh",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    jobTitle: "Product Manager",
    jobCode: "PM-2408",
    stage: "SCREENING",
    source: "Website",
    timeAgo: "1 ngày trước",
    appliedDate: "15/08/2026",
    rating: 4,
    email: "tuananh@gmail.com",
    phone: "0333 444 555",
    location: "Hồ Chí Minh, Việt Nam",
    experienceYears: 4,
    education: "Kỹ sư Phần mềm - ĐH FPT",
    skills: ["Product Strategy", "Agile", "SQL", "User Story Mapping"],
    cvName: "Hoang_Tuan_Anh_CV.pdf",
    notes: "Đã qua vòng kiểm tra CV, đang chờ xếp lịch gọi sàng lọc sơ bộ.",
  },
  {
    id: "p-cand-7",
    name: "Nguyễn Thị Phương",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    jobTitle: "UI/UX Designer",
    jobCode: "UX-2408",
    stage: "SCREENING",
    source: "LinkedIn",
    timeAgo: "2 ngày trước",
    appliedDate: "14/08/2026",
    rating: 4,
    email: "phuongnt@gmail.com",
    phone: "0344 555 666",
    location: "Hồ Chí Minh, Việt Nam",
    experienceYears: 3,
    skills: ["Figma", "UI Design", "Wireframing"],
    cvName: "Nguyen_Thi_Phuong_Portfolio.pdf",
  },
  {
    id: "p-cand-8",
    name: "Đỗ Mạnh Cường",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    jobTitle: "Frontend Developer",
    jobCode: "FE-2407",
    stage: "SCREENING",
    source: "TopCV",
    timeAgo: "2 ngày trước",
    appliedDate: "14/08/2026",
    rating: 4,
    email: "cuongdm@gmail.com",
    phone: "0355 666 777",
    location: "Hà Nội, Việt Nam",
    experienceYears: 3,
    skills: ["React", "VueJS", "TailwindCSS"],
    cvName: "Do_Manh_Cuong_CV.pdf",
  },
  {
    id: "p-cand-9",
    name: "Trần Thị Bảo Châu",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    jobTitle: "Data Analyst",
    jobCode: "DA-2406",
    stage: "SCREENING",
    source: "Referral",
    timeAgo: "3 ngày trước",
    appliedDate: "13/08/2026",
    rating: 5,
    email: "chautb@gmail.com",
    phone: "0366 777 888",
    location: "Hồ Chí Minh, Việt Nam",
    experienceYears: 3,
    skills: ["SQL", "Tableau", "Statistics"],
    cvName: "Tran_Thi_Bao_Chau_CV.pdf",
  },

  // 3. Column PHÙ HỢP
  {
    id: "p-cand-10",
    name: "Nguyễn Đức Anh",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    jobTitle: "DevOps Engineer",
    jobCode: "DEVOPS-2408",
    stage: "MATCHED",
    source: "TopCV",
    timeAgo: "2 ngày trước",
    appliedDate: "14/08/2026",
    rating: 5,
    email: "ducanh.dev@gmail.com",
    phone: "0377 888 999",
    location: "Hà Nội, Việt Nam",
    experienceYears: 4,
    skills: ["AWS", "Docker", "Kubernetes", "CI/CD"],
    cvName: "Nguyen_Duc_Anh_DevOps.pdf",
  },
  {
    id: "p-cand-11",
    name: "Lê Thị Ngọc Ánh",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    jobTitle: "Product Manager",
    jobCode: "PM-2408",
    stage: "MATCHED",
    source: "Website",
    timeAgo: "3 ngày trước",
    appliedDate: "13/08/2026",
    rating: 5,
    email: "ngocanh@gmail.com",
    phone: "0388 999 000",
    location: "Hồ Chí Minh, Việt Nam",
    experienceYears: 5,
    skills: ["Product Roadmap", "Growth", "A/B Testing"],
    cvName: "Le_Thi_Ngoc_Anh_PM.pdf",
  },
  {
    id: "p-cand-12",
    name: "Phan Văn Dũng",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    jobTitle: "Backend Developer",
    jobCode: "BE-2407",
    stage: "MATCHED",
    source: "LinkedIn",
    timeAgo: "3 ngày trước",
    appliedDate: "13/08/2026",
    rating: 4,
    email: "dungpv@gmail.com",
    phone: "0399 000 111",
    location: "Hồ Chí Minh, Việt Nam",
    experienceYears: 3,
    skills: ["Golang", "NestJS", "PostgreSQL"],
    cvName: "Phan_Van_Dung_Backend.pdf",
  },
  {
    id: "p-cand-13",
    name: "Võ Minh Tâm",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    jobTitle: "Data Engineer",
    jobCode: "DA-2406",
    stage: "MATCHED",
    source: "VietnamWorks",
    timeAgo: "4 ngày trước",
    appliedDate: "12/08/2026",
    rating: 4,
    email: "tamvm@gmail.com",
    phone: "0311 222 333",
    location: "Hà Nội, Việt Nam",
    experienceYears: 4,
    skills: ["Python", "Spark", "Airflow", "ETL"],
    cvName: "Vo_Minh_Tam_DataEngineer.pdf",
  },

  // 4. Column PHỎNG VẤN
  {
    id: "p-cand-14",
    name: "Bùi Quốc Khánh",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    jobTitle: "Product Manager",
    jobCode: "PM-2408",
    stage: "INTERVIEW",
    source: "Website",
    timeAgo: "4 ngày trước",
    appliedDate: "12/08/2026",
    rating: 5,
    email: "khanhbq@gmail.com",
    phone: "0322 333 444",
    location: "Hồ Chí Minh, Việt Nam",
    experienceYears: 4,
    skills: ["Product Strategy", "Leadership"],
    cvName: "Bui_Quoc_Khanh_PM.pdf",
  },
  {
    id: "p-cand-15",
    name: "Nguyễn Thùy Linh",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    jobTitle: "UX/UI Designer",
    jobCode: "UX-2408",
    stage: "INTERVIEW",
    source: "LinkedIn",
    timeAgo: "5 ngày trước",
    appliedDate: "11/08/2026",
    rating: 4,
    email: "linhnt@gmail.com",
    phone: "0333 444 555",
    location: "Hà Nội, Việt Nam",
    experienceYears: 3,
    skills: ["Figma", "Design System"],
    cvName: "Nguyen_Thuy_Linh_Design.pdf",
  },
  {
    id: "p-cand-16",
    name: "Trần Bảo Long",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    jobTitle: "Frontend Developer",
    jobCode: "FE-2407",
    stage: "INTERVIEW",
    source: "Referral",
    timeAgo: "5 ngày trước",
    appliedDate: "11/08/2026",
    rating: 4,
    email: "longtb@gmail.com",
    phone: "0344 555 666",
    location: "Hồ Chí Minh, Việt Nam",
    experienceYears: 3,
    skills: ["React", "Next.js", "TypeScript"],
    cvName: "Tran_Bao_Long_Frontend.pdf",
  },
  {
    id: "p-cand-17",
    name: "Đặng Hải Yến",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    jobTitle: "Data Analyst",
    jobCode: "DA-2406",
    stage: "INTERVIEW",
    source: "TopCV",
    timeAgo: "6 ngày trước",
    appliedDate: "10/08/2026",
    rating: 4,
    email: "yendh@gmail.com",
    phone: "0355 666 777",
    location: "Đà Nẵng, Việt Nam",
    experienceYears: 3,
    skills: ["SQL", "PowerBI", "Python"],
    cvName: "Dang_Hai_Yen_Data.pdf",
  },

  // 5. Column OFFER
  {
    id: "p-cand-18",
    name: "Lưu Quang Minh",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    jobTitle: "Product Manager",
    jobCode: "PM-2408",
    stage: "OFFER",
    source: "Website",
    timeAgo: "7 ngày trước",
    appliedDate: "09/08/2026",
    rating: 5,
    email: "minhlq@gmail.com",
    phone: "0366 777 888",
    location: "Hồ Chí Minh, Việt Nam",
    experienceYears: 5,
    skills: ["Leadership", "Product Strategy", "SaaS"],
    cvName: "Luu_Quang_Minh_Offer.pdf",
  },
  {
    id: "p-cand-19",
    name: "Nguyễn Ngọc Trâm",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    jobTitle: "UX Researcher",
    jobCode: "UX-2408",
    stage: "OFFER",
    source: "LinkedIn",
    timeAgo: "7 ngày trước",
    appliedDate: "09/08/2026",
    rating: 5,
    email: "tramnn@gmail.com",
    phone: "0377 888 999",
    location: "Hà Nội, Việt Nam",
    experienceYears: 4,
    skills: ["User Research", "Usability Testing"],
    cvName: "Nguyen_Ngoc_Tram_Offer.pdf",
  },
  {
    id: "p-cand-20",
    name: "Phạm Khánh Duy",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    jobTitle: "Frontend Developer",
    jobCode: "FE-2407",
    stage: "OFFER",
    source: "Referral",
    timeAgo: "8 ngày trước",
    appliedDate: "08/08/2026",
    rating: 5,
    email: "duypk@gmail.com",
    phone: "0388 999 000",
    location: "Hồ Chí Minh, Việt Nam",
    experienceYears: 4,
    skills: ["React", "TypeScript", "Performance Tuning"],
    cvName: "Pham_Khanh_Duy_Offer.pdf",
  },

  // 6. Column ĐÃ NHẬN VIỆC
  {
    id: "p-cand-21",
    name: "Mai Anh Tuấn",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    jobTitle: "Product Manager",
    jobCode: "PM-2408",
    stage: "HIRED",
    source: "Website",
    timeAgo: "10 ngày trước",
    appliedDate: "06/08/2026",
    rating: 5,
    email: "tuanma@gmail.com",
    phone: "0399 000 111",
    location: "Hồ Chí Minh, Việt Nam",
    experienceYears: 5,
    skills: ["Product Growth", "Fintech", "Scrum Master"],
    cvName: "Mai_Anh_Tuan_Hired.pdf",
  },
  {
    id: "p-cand-22",
    name: "Vũ Thị Huyền",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    jobTitle: "Data Analyst",
    jobCode: "DA-2406",
    stage: "HIRED",
    source: "LinkedIn",
    timeAgo: "12 ngày trước",
    appliedDate: "04/08/2026",
    rating: 5,
    email: "huyenvt@gmail.com",
    phone: "0311 222 333",
    location: "Hà Nội, Việt Nam",
    experienceYears: 4,
    skills: ["BigQuery", "Looker", "Machine Learning"],
    cvName: "Vu_Thi_Huyen_Hired.pdf",
  },

  // 7. Column ĐÃ TỪ CHỐI
  {
    id: "p-cand-23",
    name: "Đinh Văn Hòa",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    jobTitle: "Senior UX/UI Designer",
    jobCode: "UX-2408",
    stage: "REJECTED",
    source: "LinkedIn",
    timeAgo: "14 ngày trước",
    appliedDate: "02/08/2026",
    rating: 3,
    email: "hoadv@gmail.com",
    phone: "0322 111 444",
    location: "Hồ Chí Minh, Việt Nam",
    experienceYears: 4,
    skills: ["Figma", "UI Design"],
    cvName: "Dinh_Van_Hoa_CV.pdf",
  },
];

// =====================================================================
// COMPONENT MAIN
// =====================================================================
function EmployerPipelineContent() {
  const { message } = App.useApp();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const recruiterName = user?.fullName || "Mai Phương";

  const jobIdFromQuery = searchParams.get("jobId");

  // State
  const [candidates, setCandidates] = useState<PipelineCandidate[]>(INITIAL_PIPELINE_CANDIDATES);
  const [selectedJob, setSelectedJob] = useState<string>(jobIdFromQuery || "all");
  const [selectedPosition, setSelectedPosition] = useState<string>("all");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [selectedRecruiter, setSelectedRecruiter] = useState<string>("all");
  const [selectedSort, setSelectedSort] = useState<string>("newest");
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Drag & Drop State
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<PipelineStage | null>(null);

  // UNIFIED CENTER MODAL STATE
  const [activeCandidate, setActiveCandidate] = useState<PipelineCandidate | null>(null);
  const [activeAction, setActiveAction] = useState<PipelineActionType>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Profile Modal Tab State
  const [profileActiveTab, setProfileActiveTab] = useState<"overview" | "experience" | "skills" | "notes">("overview");

  // Move Stage Modal State
  const [targetStage, setTargetStage] = useState<PipelineStage>("NEW");
  const [moveStageNote, setMoveStageNote] = useState<string>("");

  // Interview Modal State
  const [interviewRound, setInterviewRound] = useState<string>("round-1");
  const [interviewDate, setInterviewDate] = useState<string>("2026-08-20T09:30");
  const [interviewFormat, setInterviewFormat] = useState<"online" | "offline">("online");
  const [interviewLocationOrLink, setInterviewLocationOrLink] = useState<string>("https://meet.google.com/xyz-careza-interview");
  const [interviewer, setInterviewer] = useState<string>("Mai Phương (HR Lead) & Quang Huy (Tech Lead)");
  const [interviewNote, setInterviewNote] = useState<string>("");

  // Talent Pool Modal State
  const [poolGroup, setPoolGroup] = useState<string>("potential");
  const [poolTags, setPoolTags] = useState<string>("Senior, Potential, High-Rating");
  const [poolNote, setPoolNote] = useState<string>("");

  // Message Modal State
  const [messageTemplate, setMessageTemplate] = useState<string>("interview-invite");
  const [messageContent, setMessageContent] = useState<string>(
    "Chào bạn, Careza Recruitment Team trân trọng mời bạn tham dự buổi trao đổi phỏng vấn trực tuyến..."
  );

  // Reject Modal State
  const [rejectionReason, setRejectionReason] = useState<string>("experience");
  const [rejectionNote, setRejectionNote] = useState<string>("");
  const [sendRejectionEmail, setSendRejectionEmail] = useState<boolean>(true);

  // Open specific modal helper
  const openModal = (candidate: PipelineCandidate, action: PipelineActionType) => {
    setActiveCandidate(candidate);
    setActiveAction(action);
    // Initialize modal state defaults
    if (action === "move-stage") {
      setTargetStage(candidate.stage);
      setMoveStageNote("");
    }
    if (action === "profile") {
      setProfileActiveTab("overview");
    }
  };

  const closeModal = () => {
    setActiveAction(null);
    setActiveCandidate(null);
    setActionLoading(false);
  };

  // Move Stage Handler
  const handleConfirmMoveStage = () => {
    if (!activeCandidate) return;
    setActionLoading(true);
    setTimeout(() => {
      setCandidates((prev) =>
        prev.map((c) => (c.id === activeCandidate.id ? { ...c, stage: targetStage } : c))
      );
      const stageName = STAGE_COLUMNS.find((s) => s.key === targetStage)?.label || targetStage;
      message.success(`Đã chuyển ứng viên "${activeCandidate.name}" sang giai đoạn "${stageName}" thành công!`);
      closeModal();
    }, 400);
  };

  // Schedule Interview Handler
  const handleConfirmScheduleInterview = () => {
    if (!activeCandidate) return;
    setActionLoading(true);
    setTimeout(() => {
      setCandidates((prev) =>
        prev.map((c) => (c.id === activeCandidate.id ? { ...c, stage: "INTERVIEW" } : c))
      );
      message.success(`Đã lên lịch phỏng vấn cho ứng viên "${activeCandidate.name}" thành công!`);
      closeModal();
    }, 450);
  };

  // Talent Pool Handler
  const handleConfirmSaveTalentPool = () => {
    if (!activeCandidate) return;
    setActionLoading(true);
    setTimeout(() => {
      message.success(`Đã lưu "${activeCandidate.name}" vào Talent Pool (${poolGroup})!`);
      closeModal();
    }, 400);
  };

  // Send Message Handler
  const handleConfirmSendMessage = () => {
    if (!activeCandidate) return;
    setActionLoading(true);
    setTimeout(() => {
      message.success(`Đã gửi tin nhắn đến ứng viên "${activeCandidate.name}" thành công!`);
      closeModal();
    }, 400);
  };

  // Reject Candidate Handler
  const handleConfirmReject = () => {
    if (!activeCandidate) return;
    setActionLoading(true);
    setTimeout(() => {
      setCandidates((prev) =>
        prev.map((c) => (c.id === activeCandidate.id ? { ...c, stage: "REJECTED" } : c))
      );
      message.success(`Đã chuyển ứng viên "${activeCandidate.name}" sang giai đoạn Đã từ chối!`);
      closeModal();
    }, 400);
  };

  // HTML5 Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, candidateId: string) => {
    e.dataTransfer.setData("text/plain", candidateId);
    setDraggingCardId(candidateId);
  };

  const handleDragOver = (e: React.DragEvent, stage: PipelineStage) => {
    e.preventDefault();
    if (dragOverStage !== stage) {
      setDragOverStage(stage);
    }
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, targetStageVal: PipelineStage) => {
    e.preventDefault();
    const candidateId = e.dataTransfer.getData("text/plain");
    if (candidateId) {
      setCandidates((prev) =>
        prev.map((c) => (c.id === candidateId ? { ...c, stage: targetStageVal } : c))
      );
      const stageName = STAGE_COLUMNS.find((s) => s.key === targetStageVal)?.label || targetStageVal;
      message.success(`Đã chuyển ứng viên sang giai đoạn "${stageName}"!`);
    }
    setDraggingCardId(null);
    setDragOverStage(null);
  };

  // Filtered dataset
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.jobTitle.toLowerCase().includes(q) ||
          c.jobCode.toLowerCase().includes(q) ||
          c.skills.some((s) => s.toLowerCase().includes(q));
        if (!matches) return false;
      }
      // Job
      if (selectedJob !== "all" && c.jobCode !== selectedJob) return false;
      // Position
      if (selectedPosition !== "all" && !c.jobTitle.includes(selectedPosition)) return false;
      // Source
      if (selectedSource !== "all" && c.source !== selectedSource) return false;
      return true;
    });
  }, [candidates, searchQuery, selectedJob, selectedPosition, selectedSource]);

  // Context Menu Items for Card (Click item closes menu & opens Center Modal)
  const getCardMenuItems = (candidate: PipelineCandidate) => {
    return [
      {
        key: "view-profile",
        label: (
          <div
            onClick={(e) => {
              e.stopPropagation();
              openModal(candidate, "profile");
            }}
            className="flex items-center gap-2 py-0.5 font-medium text-slate-800"
          >
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            <span>Xem hồ sơ chi tiết</span>
          </div>
        ),
      },
      {
        key: "view-cv",
        label: (
          <div
            onClick={(e) => {
              e.stopPropagation();
              openModal(candidate, "cv");
            }}
            className="flex items-center gap-2 py-0.5 font-medium text-slate-800"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>Xem CV đính kèm</span>
          </div>
        ),
      },
      {
        key: "move-stage",
        label: (
          <div
            onClick={(e) => {
              e.stopPropagation();
              openModal(candidate, "move-stage");
            }}
            className="flex items-center gap-2 py-0.5 font-medium text-purple-700"
          >
            <CheckCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>Chuyển giai đoạn</span>
          </div>
        ),
      },
      {
        key: "schedule-interview",
        label: (
          <div
            onClick={(e) => {
              e.stopPropagation();
              openModal(candidate, "interview");
            }}
            className="flex items-center gap-2 py-0.5 font-medium text-amber-700"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
            <span>Lên lịch phỏng vấn</span>
          </div>
        ),
      },
      {
        key: "add-talent-pool",
        label: (
          <div
            onClick={(e) => {
              e.stopPropagation();
              openModal(candidate, "talent-pool");
            }}
            className="flex items-center gap-2 py-0.5 font-medium text-purple-700"
          >
            <FolderPlus className="w-3.5 h-3.5 text-purple-600" />
            <span>Lưu vào Talent Pool</span>
          </div>
        ),
      },
      {
        key: "send-message",
        label: (
          <div
            onClick={(e) => {
              e.stopPropagation();
              openModal(candidate, "message");
            }}
            className="flex items-center gap-2 py-0.5 font-medium text-blue-600"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Gửi tin nhắn</span>
          </div>
        ),
      },
      { type: "divider" as const },
      {
        key: "reject",
        danger: true,
        label: (
          <div
            onClick={(e) => {
              e.stopPropagation();
              openModal(candidate, "reject");
            }}
            className="flex items-center gap-2 py-0.5 text-rose-600 cursor-pointer font-medium"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Từ chối ứng viên</span>
          </div>
        ),
      },
    ];
  };

  return (
    <div className="space-y-3 max-w-[1680px] mx-auto w-full pb-6">
      {/* ======================================================== */}
      {/* 1. PAGE HEADER                                           */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 m-0 tracking-tight leading-snug">
            Pipeline ứng viên
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => message.info("Đang kết xuất báo cáo Pipeline...")}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Xuất báo cáo</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFilterModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>Bộ lọc</span>
          </button>

          <button
            type="button"
            onClick={() => message.info("Tính năng thêm ứng viên thủ công đang phát triển")}
            className="px-3.5 py-1.5 rounded-lg bg-[#0062ff] hover:bg-[#0052cc] text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Thêm ứng viên</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. FILTER TOOLBAR + VIEW SWITCHER                        */}
      {/* ======================================================== */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xs p-2.5 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
          {/* Filter 1: Tin tuyển dụng */}
          <Select
            value={selectedJob}
            onChange={setSelectedJob}
            className="custom-filter-select text-xs min-w-[150px]"
            size="small"
            popupMatchSelectWidth={false}
            options={[
              { value: "all", label: "Tất cả tin tuyển dụng" },
              { value: "PM-2408", label: "Product Manager (PM-2408)" },
              { value: "UX-2408", label: "Senior UX/UI Designer (UX-2408)" },
              { value: "FE-2407", label: "Frontend Developer (FE-2407)" },
              { value: "DA-2406", label: "Data Analyst (DA-2406)" },
              { value: "HR-2408", label: "HR Generalist (HR-2408)" },
              { value: "DEVOPS-2408", label: "DevOps Engineer (DEVOPS-2408)" },
            ]}
          />

          {/* Filter 2: Vị trí */}
          <Select
            value={selectedPosition}
            onChange={setSelectedPosition}
            className="custom-filter-select text-xs min-w-[125px]"
            size="small"
            options={[
              { value: "all", label: "Tất cả vị trí" },
              { value: "Product Manager", label: "Product Manager" },
              { value: "Designer", label: "UI/UX Designer" },
              { value: "Frontend", label: "Frontend Developer" },
              { value: "Backend", label: "Backend Developer" },
              { value: "Data", label: "Data Analyst" },
              { value: "DevOps", label: "DevOps Engineer" },
            ]}
          />

          {/* Filter 3: Nguồn */}
          <Select
            value={selectedSource}
            onChange={setSelectedSource}
            className="custom-filter-select text-xs min-w-[130px]"
            size="small"
            options={[
              { value: "all", label: "Tất cả nguồn ứng viên" },
              { value: "Website", label: "Website Careza" },
              { value: "LinkedIn", label: "LinkedIn" },
              { value: "Referral", label: "Referral" },
              { value: "VietnamWorks", label: "VietnamWorks" },
              { value: "TopCV", label: "TopCV" },
            ]}
          />

          {/* Filter 4: Người phụ trách */}
          <Select
            value={selectedRecruiter}
            onChange={setSelectedRecruiter}
            className="custom-filter-select text-xs min-w-[135px]"
            size="small"
            options={[
              { value: "all", label: "Tất cả người phụ trách" },
              { value: "mai-phuong", label: "Mai Phương (Owner)" },
              { value: "quang-huy", label: "Quang Huy (Tech Lead)" },
            ]}
          />

          {/* Filter 5: Sắp xếp */}
          <Select
            value={selectedSort}
            onChange={setSelectedSort}
            className="custom-filter-select text-xs min-w-[140px]"
            size="small"
            suffixIcon={<Calendar className="w-3 h-3 text-slate-400" />}
            options={[
              { value: "newest", label: "Ngày tạo (Mới nhất)" },
              { value: "oldest", label: "Ngày tạo (Cũ nhất)" },
              { value: "rating", label: "Đánh giá cao nhất" },
            ]}
          />
        </div>

        {/* View mode switcher */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/70 shrink-0">
          <Tooltip title="Xem dạng bảng Kanban (Hiện tại)">
            <button
              type="button"
              className="p-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 cursor-pointer bg-white text-[#0062ff] shadow-2xs"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          <Tooltip title="Chuyển sang dạng danh sách ứng viên">
            <Link
              href="/doanh-nghiep/ung-vien"
              className="p-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 cursor-pointer text-slate-500 hover:text-[#0062ff] hover:bg-white/60"
            >
              <ListFilter className="w-3.5 h-3.5" />
            </Link>
          </Tooltip>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. TỔNG QUAN PIPELINE (8 KPI MINI CARDS - CENTERED)      */}
      {/* ======================================================== */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-slate-600 block">Tổng quan pipeline</span>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {/* Card 1: Tổng ứng viên */}
          <div className="p-2 px-2.5 rounded-xl bg-white border border-blue-200/90 shadow-2xs text-center flex flex-col items-center justify-center hover:border-blue-400 transition-all">
            <div className="flex items-center justify-center gap-1 text-[10.5px] font-medium text-slate-600 leading-tight">
              <Users className="w-3 h-3 text-blue-600 shrink-0" />
              <span>Tổng ứng viên</span>
            </div>
            <span className="text-base sm:text-lg font-bold text-slate-800 block my-0.5 leading-tight">
              1,248
            </span>
            <span className="text-[9.5px] font-medium text-emerald-600 block leading-none">
              ↑ 18% <span className="text-slate-400">tháng trước</span>
            </span>
          </div>

          {/* Card 2: Mới */}
          <div className="p-2 px-2.5 rounded-xl bg-[#F4F8FD] border border-[#BFDBFE] shadow-2xs text-center flex flex-col items-center justify-center hover:border-blue-400 transition-all">
            <div className="flex items-center justify-center gap-1 text-[10.5px] font-medium text-blue-700 leading-tight">
              <UserPlus className="w-3 h-3 text-[#0062ff] shrink-0" />
              <span>Mới</span>
            </div>
            <span className="text-base sm:text-lg font-bold text-slate-800 block my-0.5 leading-tight">
              312
            </span>
            <span className="text-[9.5px] font-medium text-slate-500 block leading-none">
              25.0%
            </span>
          </div>

          {/* Card 3: Sàng lọc */}
          <div className="p-2 px-2.5 rounded-xl bg-[#F2F7FC] border border-[#BAE6FD] shadow-2xs text-center flex flex-col items-center justify-center hover:border-sky-400 transition-all">
            <div className="flex items-center justify-center gap-1 text-[10.5px] font-medium text-sky-700 leading-tight">
              <Filter className="w-3 h-3 text-[#0284c7] shrink-0" />
              <span>Sàng lọc</span>
            </div>
            <span className="text-base sm:text-lg font-bold text-slate-800 block my-0.5 leading-tight">
              226
            </span>
            <span className="text-[9.5px] font-medium text-slate-500 block leading-none">
              18.1%
            </span>
          </div>

          {/* Card 4: Phù hợp */}
          <div className="p-2 px-2.5 rounded-xl bg-[#FAF7FD] border border-[#E9D5FF] shadow-2xs text-center flex flex-col items-center justify-center hover:border-purple-400 transition-all">
            <div className="flex items-center justify-center gap-1 text-[10.5px] font-medium text-purple-700 leading-tight">
              <Star className="w-3 h-3 text-[#9333ea] fill-[#9333ea] shrink-0" />
              <span>Phù hợp</span>
            </div>
            <span className="text-base sm:text-lg font-bold text-slate-800 block my-0.5 leading-tight">
              328
            </span>
            <span className="text-[9.5px] font-medium text-slate-500 block leading-none">
              26.3%
            </span>
          </div>

          {/* Card 5: Phỏng vấn */}
          <div className="p-2 px-2.5 rounded-xl bg-[#FEF9F2] border border-[#FDE68A] shadow-2xs text-center flex flex-col items-center justify-center hover:border-amber-400 transition-all">
            <div className="flex items-center justify-center gap-1 text-[10.5px] font-medium text-amber-700 leading-tight">
              <Calendar className="w-3 h-3 text-[#d97706] shrink-0" />
              <span>Phỏng vấn</span>
            </div>
            <span className="text-base sm:text-lg font-bold text-slate-800 block my-0.5 leading-tight">
              192
            </span>
            <span className="text-[9.5px] font-medium text-slate-500 block leading-none">
              15.4%
            </span>
          </div>

          {/* Card 6: Offer */}
          <div className="p-2 px-2.5 rounded-xl bg-[#FDF5F5] border border-[#FECDD3] shadow-2xs text-center flex flex-col items-center justify-center hover:border-rose-400 transition-all">
            <div className="flex items-center justify-center gap-1 text-[10.5px] font-medium text-rose-700 leading-tight">
              <Award className="w-3 h-3 text-[#e11d48] shrink-0" />
              <span>Offer</span>
            </div>
            <span className="text-base sm:text-lg font-bold text-slate-800 block my-0.5 leading-tight">
              48
            </span>
            <span className="text-[9.5px] font-medium text-slate-500 block leading-none">
              3.8%
            </span>
          </div>

          {/* Card 7: Đã nhận việc */}
          <div className="p-2 px-2.5 rounded-xl bg-[#F2FAF6] border border-[#A7F3D0] shadow-2xs text-center flex flex-col items-center justify-center hover:border-emerald-400 transition-all">
            <div className="flex items-center justify-center gap-1 text-[10.5px] font-medium text-emerald-700 leading-tight">
              <CheckCircle className="w-3 h-3 text-[#059669] shrink-0" />
              <span>Đã nhận việc</span>
            </div>
            <span className="text-base sm:text-lg font-bold text-slate-800 block my-0.5 leading-tight">
              24
            </span>
            <span className="text-[9.5px] font-medium text-slate-500 block leading-none">
              1.9%
            </span>
          </div>

          {/* Card 8: Đã từ chối */}
          <div className="p-2 px-2.5 rounded-xl bg-[#FDF5F5] border border-[#FECDD3] shadow-2xs text-center flex flex-col items-center justify-center hover:border-rose-400 transition-all">
            <div className="flex items-center justify-center gap-1 text-[10.5px] font-medium text-rose-700 leading-tight">
              <XCircle className="w-3 h-3 text-[#e11d48] shrink-0" />
              <span>Đã từ chối</span>
            </div>
            <span className="text-base sm:text-lg font-bold text-slate-800 block my-0.5 leading-tight">
              118
            </span>
            <span className="text-[9.5px] font-medium text-slate-500 block leading-none">
              9.5%
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. MAIN WORKSPACE: FULL-WIDTH KANBAN BOARD (7 COLUMNS)   */}
      {/* ======================================================== */}
      <div className="w-full xl:h-[calc(100vh-220px)] min-h-0 flex flex-col">
        <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden pb-1 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
          <div className="flex gap-3 min-w-max h-full items-stretch">
            {STAGE_COLUMNS.map((column) => {
              const stageCandidates = filteredCandidates.filter((c) => c.stage === column.key);
              const isOver = dragOverStage === column.key;

              return (
                <div
                  key={column.key}
                  onDragOver={(e) => handleDragOver(e, column.key)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, column.key)}
                  className={`w-[260px] 2xl:w-[280px] ${column.colBg} ${column.colBorder} rounded-2xl border transition-all flex flex-col min-h-0 ${
                    isOver
                      ? "border-[#0062ff] ring-2 ring-blue-100 shadow-md"
                      : "shadow-2xs"
                  }`}
                >
                  {/* Column Header with matching pastel colors */}
                  <div className="p-3 pb-2 flex items-center justify-between shrink-0">
                    <span className={`text-[13.5px] font-bold ${column.headerColor}`}>
                      {column.label}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${column.pillBg}`}>
                      {column.count}
                    </span>
                  </div>

                  {/* Dashed Add Candidate Button */}
                  <div className="px-2.5 pb-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => message.info(`Thêm ứng viên vào giai đoạn ${column.label}`)}
                      className={`w-full py-1.5 rounded-xl border border-dashed bg-white/80 hover:bg-white text-[12.5px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs ${column.btnBorder} ${column.btnText}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm ứng viên</span>
                    </button>
                  </div>

                  {/* Candidate Cards Scrollable Column */}
                  <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                    {stageCandidates.map((candidate) => {
                      const isDragging = draggingCardId === candidate.id;
                      const menuItems = getCardMenuItems(candidate);

                      return (
                        <div
                          key={candidate.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, candidate.id)}
                          onClick={() => openModal(candidate, "profile")}
                          className={`p-2.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all cursor-grab active:cursor-grabbing group ${
                            isDragging ? "opacity-40 scale-95 border-blue-400" : ""
                          }`}
                        >
                          {/* Top row: Avatar, Name, Job, Action */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Avatar
                                src={candidate.avatar}
                                size={34}
                                className="border border-slate-200 shrink-0 shadow-2xs"
                              />
                              <div className="min-w-0">
                                <span className="font-bold text-slate-900 text-[13.5px] block leading-tight truncate group-hover:text-[#0062ff] transition-colors">
                                  {candidate.name}
                                </span>
                                <span className="text-[11.5px] text-slate-500 font-medium block truncate mt-0.5">
                                  {candidate.jobTitle}
                                </span>
                              </div>
                            </div>

                            {/* Action button */}
                            <Dropdown
                              menu={{ items: menuItems }}
                              trigger={["click"]}
                              placement="bottomRight"
                              arrow
                            >
                              <button
                                type="button"
                                onClick={(e) => e.stopPropagation()}
                                className="w-5 h-5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </Dropdown>
                          </div>

                          {/* Second row: Time ago & Source */}
                          <div className="text-[11px] text-slate-400 font-medium pt-1.5 flex items-center justify-between border-t border-slate-100/70 mt-2">
                            <span>{candidate.timeAgo} • {candidate.source}</span>
                          </div>

                          {/* Third row: Status Badge */}
                          <div className="pt-1.5 flex items-center justify-between">
                            <span className={`px-2 py-0.2 rounded-full font-bold text-[9.5px] border ${column.tagColor}`}>
                              {column.label}
                            </span>

                            <div className="flex items-center gap-0.5 text-amber-400 text-xs">
                              <span>⭐</span>
                              <span className="font-bold text-slate-700 text-[11.5px]">{candidate.rating}.0</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* + X ứng viên khác */}
                    <div className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          message.info(`Xem toàn bộ ${column.count} ứng viên giai đoạn ${column.label}`);
                        }}
                        className="text-[11.5px] font-bold text-slate-500 hover:text-[#0062ff] transition-colors cursor-pointer block w-full py-1 rounded-lg hover:bg-white/80"
                      >
                        + {column.count - stageCandidates.length} ứng viên khác
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. BOTTOM TIP BAR                                        */}
      {/* ======================================================== */}
      <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
          <span className="text-amber-500 font-black">💡 Mẹo:</span>
          <span>Kéo & thả ứng viên giữa các giai đoạn để cập nhật trạng thái nhanh chóng.</span>
        </div>

        <button
          type="button"
          onClick={() => message.info("Hướng dẫn: Kéo thẻ ứng viên sang cột khác để đổi vòng tuyển dụng tức thì.")}
          className="px-3 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 font-bold text-xs transition-all cursor-pointer shrink-0"
        >
          Hướng dẫn sử dụng
        </button>
      </div>

      {/* ===================================================================== */}
      {/* 6. MODAL 1: XEM HỒ SƠ CHI TIẾT (LARGE CENTER MODAL - 860px)            */}
      {/* ===================================================================== */}
      <Modal
        open={activeAction === "profile" && !!activeCandidate}
        onCancel={closeModal}
        footer={null}
        width={860}
        centered
        destroyOnHidden
        title={null}
      >
        {activeCandidate && (
          <div className="space-y-5 p-1 max-h-[80vh] overflow-y-auto pr-1">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-start gap-4">
                <Avatar
                  src={activeCandidate.avatar}
                  size={60}
                  className="border-2 border-slate-200 shrink-0 shadow-md"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-bold text-slate-900 m-0">
                      {activeCandidate.name}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full font-bold text-[10.5px] bg-blue-50 text-[#0062ff] border border-blue-200">
                      {STAGE_COLUMNS.find((s) => s.key === activeCandidate.stage)?.label || activeCandidate.stage}
                    </span>
                  </div>
                  <p className="text-xs text-[#0062ff] font-bold m-0">
                    Ứng tuyển: {activeCandidate.jobTitle} ({activeCandidate.jobCode})
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium flex-wrap pt-0.5">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{activeCandidate.email}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{activeCandidate.phone}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{activeCandidate.location || "Hồ Chí Minh, VN"}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Star Rating */}
              <div className="text-right shrink-0">
                <span className="text-[11px] font-bold text-slate-400 block mb-1">Đánh giá</span>
                <Rate
                  value={activeCandidate.rating}
                  disabled
                  className="text-amber-400 text-sm"
                />
              </div>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              {[
                { key: "overview", label: "Tổng quan" },
                { key: "experience", label: "Kinh nghiệm & Học vấn" },
                { key: "skills", label: "Kỹ năng chuyên môn" },
                { key: "notes", label: "Ghi chú & Đánh giá" },
              ].map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setProfileActiveTab(t.key as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    profileActiveTab === t.key
                      ? "bg-[#0062ff] text-white shadow-2xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            {profileActiveTab === "overview" && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Kinh nghiệm:</span>
                    <strong className="text-slate-800 text-sm">{activeCandidate.experienceYears} năm</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Nguồn ứng tuyển:</span>
                    <strong className="text-slate-800 text-sm">{activeCandidate.source}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Ngày ứng tuyển:</span>
                    <strong className="text-slate-800 text-sm">{activeCandidate.appliedDate}</strong>
                  </div>
                </div>

                {/* CV File Box */}
                <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-2xs">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">
                        {activeCandidate.cvName}
                      </span>
                      <span className="text-[10.5px] text-slate-400 font-medium">
                        Tệp PDF đính kèm • Đã được bảo mật
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openModal(activeCandidate, "cv")}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-[#0062ff] font-bold text-xs border border-blue-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Xem CV</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => message.success("Đang tải xuống CV...")}
                      className="p-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 transition-all cursor-pointer shadow-2xs"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {profileActiveTab === "experience" && (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                  <span className="font-bold text-slate-900 block text-xs flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                    <span>Kinh nghiệm làm việc:</span>
                  </span>
                  <p className="text-slate-600 m-0 leading-relaxed font-medium">
                    Hơn {activeCandidate.experienceYears} năm kinh nghiệm thực chiến trong lĩnh vực {activeCandidate.jobTitle}, tham gia phát triển và vận hành các hệ thống quy mô lớn.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                  <span className="font-bold text-slate-900 block text-xs flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Học vấn & Bằng cấp:</span>
                  </span>
                  <p className="text-slate-600 m-0 leading-relaxed font-medium">
                    {activeCandidate.education || "Cử nhân Đại học chính quy • Chuyên ngành Công nghệ & Quản trị"}
                  </p>
                </div>
              </div>
            )}

            {profileActiveTab === "skills" && (
              <div className="space-y-3 text-xs">
                <span className="font-bold text-slate-900 block">Kỹ năng chuyên môn chính:</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {activeCandidate.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200/80 shadow-2xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profileActiveTab === "notes" && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                <span className="font-bold text-slate-900 block">
                  Đánh giá từ Hội đồng tuyển dụng:
                </span>
                <p className="text-slate-600 m-0 leading-relaxed font-medium">
                  {activeCandidate.notes || "Chưa có ghi chú đánh giá bổ sung cho ứng viên này."}
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-all cursor-pointer"
              >
                Đóng
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => openModal(activeCandidate, "move-stage")}
                  className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer border border-purple-200"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Chuyển giai đoạn</span>
                </button>

                <button
                  type="button"
                  onClick={() => openModal(activeCandidate, "interview")}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Lên lịch phỏng vấn</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ===================================================================== */}
      {/* 7. MODAL 2: XEM CV ĐÍNH KÈM (LARGE CENTER MODAL - 780px)               */}
      {/* ===================================================================== */}
      <Modal
        open={activeAction === "cv" && !!activeCandidate}
        onCancel={closeModal}
        footer={null}
        width={780}
        centered
        destroyOnHidden
        title={null}
      >
        {activeCandidate && (
          <div className="space-y-4 p-1">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 m-0">
                  CV của {activeCandidate.name}
                </h3>
                <span className="text-xs text-slate-500 font-medium">{activeCandidate.cvName}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => message.success("Đang tải xuống file PDF...")}
                  className="px-3.5 py-1.5 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải xuống</span>
                </button>

                <button
                  type="button"
                  onClick={() => message.info("Đang mở trong tab mới...")}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Mở tab mới</span>
                </button>
              </div>
            </div>

            {/* Clean CV Viewer Box */}
            <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200 min-h-[440px] flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-white text-rose-500 border border-slate-200 flex items-center justify-center shadow-md">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 m-0">{activeCandidate.cvName}</h4>
                <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
                  Dung lượng: 2.4 MB • Tải lên lúc {activeCandidate.appliedDate} • Đã quét bảo mật
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 text-left text-xs text-slate-700 max-w-md w-full space-y-2 shadow-2xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Ứng viên:</span>
                  <strong className="text-slate-800">{activeCandidate.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Vị trí:</span>
                  <strong className="text-[#0062ff]">{activeCandidate.jobTitle}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Kinh nghiệm:</span>
                  <strong>{activeCandidate.experienceYears} năm</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Kỹ năng:</span>
                  <strong>{activeCandidate.skills.join(", ")}</strong>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ===================================================================== */}
      {/* 8. MODAL 3: CHUYỂN GIAI ĐOẠN (MEDIUM CENTER MODAL - 540px)             */}
      {/* ===================================================================== */}
      <Modal
        open={activeAction === "move-stage" && !!activeCandidate}
        onCancel={closeModal}
        footer={null}
        width={540}
        centered
        destroyOnHidden
        title={null}
      >
        {activeCandidate && (
          <div className="space-y-4 p-1">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-2xs">
                <CheckCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 m-0">Chuyển giai đoạn ứng viên</h3>
                <span className="text-xs text-slate-500 font-medium">
                  {activeCandidate.name} • {activeCandidate.jobTitle}
                </span>
              </div>
            </div>

            {/* Current Stage */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600">Giai đoạn hiện tại:</span>
              <span className="px-2.5 py-0.5 rounded-full font-bold bg-blue-50 text-[#0062ff] border border-blue-200">
                {STAGE_COLUMNS.find((s) => s.key === activeCandidate.stage)?.label || activeCandidate.stage}
              </span>
            </div>

            {/* Stage Options */}
            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-700 block">Chọn giai đoạn chuyển đến:</label>
              <div className="grid grid-cols-2 gap-2">
                {STAGE_COLUMNS.map((col) => {
                  const isCurrent = activeCandidate.stage === col.key;
                  const isSelected = targetStage === col.key;

                  return (
                    <div
                      key={col.key}
                      onClick={() => !isCurrent && setTargetStage(col.key)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                        isCurrent
                          ? "bg-slate-100/70 border-slate-200 opacity-50 cursor-not-allowed"
                          : isSelected
                          ? `${col.colBg} border-[#0062ff] ring-2 ring-blue-100 cursor-pointer`
                          : "bg-white border-slate-200 hover:border-slate-300 cursor-pointer"
                      }`}
                    >
                      <span className={`font-bold text-xs ${col.headerColor}`}>
                        {col.label}
                      </span>
                      {isCurrent ? (
                        <span className="text-[10px] text-slate-400 font-medium">(Hiện tại)</span>
                      ) : (
                        <Radio checked={isSelected} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Note */}
            <div className="space-y-1 text-xs">
              <label className="font-semibold text-slate-700 block">Ghi chú (không bắt buộc):</label>
              <Input.TextArea
                rows={2}
                value={moveStageNote}
                onChange={(e) => setMoveStageNote(e.target.value)}
                placeholder="Nhập lý do chuyển giai đoạn hoặc ghi chú cho hội đồng tuyển dụng..."
                className="rounded-xl text-xs"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs cursor-pointer"
              >
                Hủy
              </button>

              <button
                type="button"
                disabled={actionLoading || targetStage === activeCandidate.stage}
                onClick={handleConfirmMoveStage}
                className="px-5 py-2 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? "Đang cập nhật..." : "Xác nhận chuyển"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ===================================================================== */}
      {/* 9. MODAL 4: LÊN LỊCH PHỎNG VẤN (MEDIUM/LARGE CENTER MODAL - 580px)     */}
      {/* ===================================================================== */}
      <Modal
        open={activeAction === "interview" && !!activeCandidate}
        onCancel={closeModal}
        footer={null}
        width={580}
        centered
        destroyOnHidden
        title={null}
      >
        {activeCandidate && (
          <div className="space-y-4 p-1">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-2xs">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 m-0">Lên lịch phỏng vấn</h3>
                <span className="text-xs text-slate-500 font-medium">
                  {activeCandidate.name} ({activeCandidate.jobTitle})
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Vòng phỏng vấn:</label>
                  <Select
                    value={interviewRound}
                    onChange={setInterviewRound}
                    className="w-full text-xs"
                    options={[
                      { value: "round-1", label: "Vòng 1 - Phỏng vấn Sơ bộ / HR" },
                      { value: "round-2", label: "Vòng 2 - Phỏng vấn Kỹ thuật / Tech Lead" },
                      { value: "round-3", label: "Vòng 3 - Phỏng vấn Văn hóa / BOD" },
                    ]}
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Hình thức:</label>
                  <Select
                    value={interviewFormat}
                    onChange={(val) => {
                      setInterviewFormat(val);
                      if (val === "online") {
                        setInterviewLocationOrLink("https://meet.google.com/xyz-careza-interview");
                      } else {
                        setInterviewLocationOrLink("Tầng 12, Tòa nhà Careza Tower, Quận 1, TP.HCM");
                      }
                    }}
                    className="w-full text-xs"
                    options={[
                      { value: "online", label: "Phỏng vấn Online (Google Meet / Zoom)" },
                      { value: "offline", label: "Phỏng vấn trực tiếp tại văn phòng" },
                    ]}
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Thời gian phỏng vấn:</label>
                <Input
                  type="datetime-local"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {interviewFormat === "online" ? "Meeting Link (Google Meet):" : "Địa điểm phỏng vấn:"}
                </label>
                <Input
                  value={interviewLocationOrLink}
                  onChange={(e) => setInterviewLocationOrLink(e.target.value)}
                  className="rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Người phỏng vấn (Interviewer):</label>
                <Input
                  value={interviewer}
                  onChange={(e) => setInterviewer(e.target.value)}
                  className="rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Ghi chú gửi ứng viên:</label>
                <Input.TextArea
                  rows={2}
                  value={interviewNote}
                  onChange={(e) => setInterviewNote(e.target.value)}
                  placeholder="Vui lòng chuẩn bị Portfolio và thiết bị có Camera ổn định..."
                  className="rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer shadow-2xs"
              >
                Hủy
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmScheduleInterview}
                className="px-5 py-2 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? "Đang tạo lịch..." : "Tạo lịch phỏng vấn"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ===================================================================== */}
      {/* 10. MODAL 5: LƯU VÀO TALENT POOL (SMALL/MEDIUM CENTER MODAL - 480px)   */}
      {/* ===================================================================== */}
      <Modal
        open={activeAction === "talent-pool" && !!activeCandidate}
        onCancel={closeModal}
        footer={null}
        width={480}
        centered
        destroyOnHidden
        title={null}
      >
        {activeCandidate && (
          <div className="space-y-4 p-1">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-2xs">
                <FolderPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 m-0">Lưu ứng viên vào Talent Pool</h3>
                <span className="text-xs text-slate-500 font-medium">
                  {activeCandidate.name} ({activeCandidate.jobTitle})
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Chọn nhóm Talent Pool:</label>
                <Select
                  value={poolGroup}
                  onChange={setPoolGroup}
                  className="w-full text-xs"
                  options={[
                    { value: "potential", label: "Ứng viên Tiềm năng (High Potential)" },
                    { value: "frontend", label: "Nhóm Frontend & UI Engineers" },
                    { value: "product", label: "Nhóm Product Managers & Business Analysts" },
                    { value: "design", label: "Nhóm Senior UX/UI Designers" },
                  ]}
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Gắn thẻ phân loại (Tags):</label>
                <Input
                  value={poolTags}
                  onChange={(e) => setPoolTags(e.target.value)}
                  placeholder="Senior, English, Fast-Learner..."
                  className="rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Ghi chú lưu trữ:</label>
                <Input.TextArea
                  rows={2}
                  value={poolNote}
                  onChange={(e) => setPoolNote(e.target.value)}
                  placeholder="Ứng viên rất tốt nhưng tạm thời vị trí hiện tại đã đủ headcount..."
                  className="rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer shadow-2xs"
              >
                Hủy
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmSaveTalentPool}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? "Đang lưu..." : "Lưu vào Talent Pool"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ===================================================================== */}
      {/* 11. MODAL 6: GỬI TIN NHẮN (MEDIUM CENTER MODAL - 520px)                */}
      {/* ===================================================================== */}
      <Modal
        open={activeAction === "message" && !!activeCandidate}
        onCancel={closeModal}
        footer={null}
        width={520}
        centered
        destroyOnHidden
        title={null}
      >
        {activeCandidate && (
          <div className="space-y-4 p-1">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <Avatar
                src={activeCandidate.avatar}
                size={38}
                className="border border-slate-200 shrink-0"
              />
              <div>
                <h3 className="text-base font-bold text-slate-900 m-0">
                  Gửi tin nhắn cho {activeCandidate.name}
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  {activeCandidate.jobTitle} • {activeCandidate.email}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mẫu tin nhắn nhanh:</label>
                <Select
                  value={messageTemplate}
                  onChange={(val) => {
                    setMessageTemplate(val);
                    if (val === "interview-invite") {
                      setMessageContent(
                        `Chào bạn ${activeCandidate.name},\nCareza Recruitment Team trân trọng mời bạn tham dự buổi trao đổi phỏng vấn trực tuyến về vị trí ${activeCandidate.jobTitle}.`
                      );
                    } else if (val === "request-info") {
                      setMessageContent(
                        `Chào bạn ${activeCandidate.name},\nChúng tôi đã nhận được hồ sơ của bạn. Vui lòng bổ sung thêm thông tin Portfolio hoặc chứng chỉ liên quan để chúng tôi hoàn tất đánh giá.`
                      );
                    } else {
                      setMessageContent(
                        `Chào bạn ${activeCandidate.name},\nCảm ơn bạn đã quan tâm đến cơ hội nghề nghiệp tại công ty. Chúng tôi rất vui được kết nối cùng bạn.`
                      );
                    }
                  }}
                  className="w-full text-xs"
                  options={[
                    { value: "interview-invite", label: "Mẫu 1: Thư mời phỏng vấn" },
                    { value: "request-info", label: "Mẫu 2: Yêu cầu bổ sung thông tin hồ sơ" },
                    { value: "general", label: "Mẫu 3: Lời chào và kết nối" },
                  ]}
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nội dung tin nhắn:</label>
                <Input.TextArea
                  rows={4}
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Nhập nội dung tin nhắn gửi đến ứng viên..."
                  className="rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => message.info("Đính kèm tệp tin...")}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-medium text-xs flex items-center gap-1.5 hover:bg-slate-50"
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>Đính kèm</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer shadow-2xs"
                >
                  Hủy
                </button>

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleConfirmSendMessage}
                  className="px-5 py-2 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{actionLoading ? "Đang gửi..." : "Gửi tin nhắn"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ===================================================================== */}
      {/* 12. MODAL 7: TỪ CHỐI ỨNG VIÊN (CONFIRM CENTER MODAL - 500px)           */}
      {/* ===================================================================== */}
      <Modal
        open={activeAction === "reject" && !!activeCandidate}
        onCancel={closeModal}
        footer={null}
        width={500}
        centered
        destroyOnHidden
        title={null}
      >
        {activeCandidate && (
          <div className="space-y-4 p-1">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-2xs">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 m-0">Từ chối ứng viên?</h3>
                <span className="text-xs text-slate-500 font-medium">
                  {activeCandidate.name} • {activeCandidate.jobTitle}
                </span>
              </div>
            </div>

            <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100 text-xs text-rose-800 font-medium">
              Bạn có chắc chắn muốn chuyển hồ sơ ứng viên này sang trạng thái <strong>Đã từ chối</strong>? Ứng viên sẽ được lưu trữ trong danh sách từ chối.
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Lý do từ chối:</label>
                <Select
                  value={rejectionReason}
                  onChange={setRejectionReason}
                  className="w-full text-xs"
                  options={[
                    { value: "experience", label: "Chưa phù hợp về số năm kinh nghiệm yêu cầu" },
                    { value: "skill", label: "Kỹ năng chuyên môn chưa đáp ứng tiêu chuẩn" },
                    { value: "salary", label: "Mức lương kỳ vọng vượt mức ngân sách" },
                    { value: "hired-other", label: "Đã tuyển đủ chỉ tiêu vị trí này" },
                    { value: "other", label: "Lý do khác" },
                  ]}
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Ghi chú nội bộ:</label>
                <Input.TextArea
                  rows={2}
                  value={rejectionNote}
                  onChange={(e) => setRejectionNote(e.target.value)}
                  placeholder="Nhập ghi chú lý do chi tiết để tham khảo trong tương lai..."
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="pt-1">
                <Checkbox
                  checked={sendRejectionEmail}
                  onChange={(e) => setSendRejectionEmail(e.target.checked)}
                  className="text-xs font-medium text-slate-700"
                >
                  Gửi email thông báo cảm ơn và kết quả cho ứng viên
                </Checkbox>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer shadow-2xs"
              >
                Hủy
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmReject}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? "Đang xử lý..." : "Xác nhận từ chối"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ===================================================================== */}
      {/* 13. DRAWER: BỘ LỌC PIPELINE NÂNG CAO                                  */}
      {/* ===================================================================== */}
      <Modal
        open={isFilterModalOpen}
        onCancel={() => setIsFilterModalOpen(false)}
        footer={null}
        width={440}
        centered
        destroyOnHidden
        title={null}
      >
        <div className="space-y-4 p-1 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 m-0">Bộ lọc Pipeline nâng cao</h3>
            <button
              type="button"
              onClick={() => setIsFilterModalOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Tin tuyển dụng:</label>
            <Select
              value={selectedJob}
              onChange={setSelectedJob}
              className="w-full"
              options={[
                { value: "all", label: "Tất cả tin tuyển dụng" },
                { value: "PM-2408", label: "Product Manager (PM-2408)" },
                { value: "UX-2408", label: "Senior UX/UI Designer (UX-2408)" },
                { value: "FE-2407", label: "Frontend Developer (FE-2407)" },
              ]}
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Nguồn ứng viên:</label>
            <Select
              value={selectedSource}
              onChange={setSelectedSource}
              className="w-full"
              options={[
                { value: "all", label: "Tất cả nguồn" },
                { value: "Website", label: "Website Careza" },
                { value: "LinkedIn", label: "LinkedIn" },
                { value: "Referral", label: "Referral" },
              ]}
            />
          </div>

          <div className="pt-3 flex items-center gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsFilterModalOpen(false)}
              className="flex-1 py-2 rounded-xl bg-[#0062ff] text-white font-bold text-xs shadow-md cursor-pointer"
            >
              Áp dụng
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedJob("all");
                setSelectedPosition("all");
                setSelectedSource("all");
                setSelectedRecruiter("all");
                setIsFilterModalOpen(false);
              }}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Đặt lại
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function EmployerPipelinePage() {
  return (
    <App>
      <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400 font-bold">Đang tải Pipeline...</div>}>
        <EmployerPipelineContent />
      </Suspense>
    </App>
  );
}
