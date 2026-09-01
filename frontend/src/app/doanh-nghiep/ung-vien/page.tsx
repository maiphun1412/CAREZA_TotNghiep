"use client";

import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import {
  Dropdown,
  Tooltip,
  Popconfirm,
  Modal,
  Drawer,
  App,
  Rate,
  Input,
  Select,
  Tag,
  Avatar,
  Checkbox,
  Pagination,
} from "antd";
import {
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
  Share2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Globe,
  Linkedin,
  UserPlus,
  Send,
  FileSpreadsheet,
  FileCheck,
  RefreshCw,
  FolderPlus,
} from "lucide-react";

// =====================================================================
// DATA TYPES
// =====================================================================
export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  isNew: boolean;
  jobTitle: string;
  jobCode: string;
  source: "Website" | "LinkedIn" | "Referral" | "VietnamWorks" | "TopCV";
  status: "NEW" | "REVIEWING" | "MATCHED" | "INTERVIEW" | "OFFER" | "REJECTED" | "ARCHIVED";
  rating: number;
  appliedAt: string;
  appliedTimeAgo: string;
  cvName: string;
  experienceYears: number;
  skills: string[];
  notes?: string;
}

// =====================================================================
// MOCK CANDIDATE DATASET (MATCHING REFERENCE EXACTLY)
// =====================================================================
const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: "cand-1",
    name: "Nguyễn Minh Anh",
    email: "minhanh@gmail.com",
    phone: "0345 678 901",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    isNew: true,
    jobTitle: "Product Manager",
    jobCode: "PM-2408",
    source: "Website",
    status: "NEW",
    rating: 5,
    appliedAt: "16/08/2026",
    appliedTimeAgo: "2 giờ trước",
    cvName: "Nguyen_Minh_Anh_CV_Product_Manager.pdf",
    experienceYears: 4,
    skills: ["Product Strategy", "Roadmap", "Scrum", "User Research"],
    notes: "Ứng viên có kinh nghiệm quản lý sản phẩm SaaS B2B, giao tiếp tiếng Anh lưu loát.",
  },
  {
    id: "cand-2",
    name: "Trần Hoàng Nam",
    email: "namth@outlook.com",
    phone: "0389 123 456",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    isNew: false,
    jobTitle: "Senior UX/UI Designer",
    jobCode: "UX-2408",
    source: "LinkedIn",
    status: "REVIEWING",
    rating: 4,
    appliedAt: "16/08/2026",
    appliedTimeAgo: "4 giờ trước",
    cvName: "Tran_Hoang_Nam_Portfolio_Design.pdf",
    experienceYears: 5,
    skills: ["Figma", "Design System", "Mobile App UI", "Prototyping"],
    notes: "Portfolio thực tế ấn tượng, từng xây dựng Design System cho app tài chính.",
  },
  {
    id: "cand-3",
    name: "Lê Quang Huy",
    email: "lequanghuy@gmail.com",
    phone: "0378 456 789",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    isNew: false,
    jobTitle: "Frontend Developer",
    jobCode: "FE-2407",
    source: "Referral",
    status: "INTERVIEW",
    rating: 4,
    appliedAt: "15/08/2026",
    appliedTimeAgo: "1 ngày trước",
    cvName: "Le_Quang_Huy_Frontend_CV.pdf",
    experienceYears: 3,
    skills: ["React", "TypeScript", "Next.js", "TailwindCSS"],
    notes: "Được nhân viên Tech lead giới thiệu, nắm vững Next.js và performance tuning.",
  },
  {
    id: "cand-4",
    name: "Phạm Thu Hằng",
    email: "hangpt@gmail.com",
    phone: "0367 890 123",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    isNew: false,
    jobTitle: "Data Analyst",
    jobCode: "DA-2406",
    source: "VietnamWorks",
    status: "INTERVIEW",
    rating: 5,
    appliedAt: "15/08/2026",
    appliedTimeAgo: "1 ngày trước",
    cvName: "Pham_Thu_Hang_Data_Analyst.pdf",
    experienceYears: 3,
    skills: ["SQL", "Python", "PowerBI", "Tableau", "Data Modeling"],
    notes: "Tư duy phân tích số liệu sắc bén, kinh nghiệm tối ưu funnel tuyển dụng.",
  },
  {
    id: "cand-5",
    name: "Đỗ Thanh Tùng",
    email: "thanhtung@gmail.com",
    phone: "0334 567 890",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    isNew: false,
    jobTitle: "DevOps Engineer",
    jobCode: "DEVOPS-2408",
    source: "TopCV",
    status: "OFFER",
    rating: 4,
    appliedAt: "14/08/2026",
    appliedTimeAgo: "2 ngày trước",
    cvName: "Do_Thanh_Tung_DevOps_CV.pdf",
    experienceYears: 4,
    skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform"],
    notes: "Vòng phỏng vấn chuyên môn đạt điểm tối đa, đã gửi Offer chính thức.",
  },
  {
    id: "cand-6",
    name: "Vũ Ngọc Mai",
    email: "ngocmai@gmail.com",
    phone: "0356 123 789",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    isNew: false,
    jobTitle: "HR Generalist",
    jobCode: "HR-2408",
    source: "Website",
    status: "REJECTED",
    rating: 3,
    appliedAt: "14/08/2026",
    appliedTimeAgo: "2 ngày trước",
    cvName: "Vu_Ngoc_Mai_HR_CV.pdf",
    experienceYears: 1,
    skills: ["Recruitment", "C&B", "Onboarding", "Labor Law"],
    notes: "Chưa đủ số năm kinh nghiệm yêu cầu đối với vị trí Senior HR.",
  },
  {
    id: "cand-7",
    name: "Nguyễn Đức Anh",
    email: "ducanh@gmail.com",
    phone: "0399 888 777",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    isNew: false,
    jobTitle: "Backend Developer",
    jobCode: "BE-2407",
    source: "LinkedIn",
    status: "MATCHED",
    rating: 4,
    appliedAt: "14/08/2026",
    appliedTimeAgo: "2 ngày trước",
    cvName: "Nguyen_Duc_Anh_Backend_Golang.pdf",
    experienceYears: 3,
    skills: ["Golang", "NestJS", "PostgreSQL", "Redis", "Microservices"],
    notes: "Hồ sơ độ khớp cao (94%), am hiểu kiến trúc Microservices và Cache.",
  },
];

// =====================================================================
// COMPONENT MAIN
// =====================================================================
function EmployerCandidatesContent() {
  const { message } = App.useApp();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const recruiterName = user?.fullName || "Mai Phương";

  const jobIdFromQuery = searchParams.get("jobId");

  // State
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<string>(jobIdFromQuery || "all");
  const [selectedPosition, setSelectedPosition] = useState<string>("all");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedSort, setSelectedSort] = useState<string>("newest");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  // Modals & Drawers
  const [detailCandidate, setDetailCandidate] = useState<Candidate | null>(null);
  const [cvCandidate, setCvCandidate] = useState<Candidate | null>(null);
  const [interviewCandidate, setInterviewCandidate] = useState<Candidate | null>(null);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewType, setInterviewType] = useState("online");

  // KPI Calculations
  const totalCount = 1248; // Global pool count matching reference
  const newCount = 312;
  const matchedCount = 328;
  const interviewCount = 192;
  const offerCount = 48;
  const reviewingCount = 226;
  const rejectedCount = 142;
  const archivedCount = 0;

  // Handlers
  const handleSelectAll = (e: any) => {
    if (e.target.checked) {
      setSelectedIds(filteredCandidates.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const handleRateCandidate = (id: string, newRate: number) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, rating: newRate } : c))
    );
    message.success("Đã cập nhật đánh giá ứng viên!");
  };

  const handleChangeStatus = (id: string, newStatus: Candidate["status"]) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
    message.success("Đã cập nhật trạng thái ứng viên!");
  };

  const handleBulkMoveStage = (targetStatus: Candidate["status"]) => {
    setCandidates((prev) =>
      prev.map((c) => (selectedIds.includes(c.id) ? { ...c, status: targetStatus } : c))
    );
    message.success(`Đã chuyển trạng thái cho ${selectedIds.length} ứng viên!`);
    setSelectedIds([]);
  };

  const handleBulkAddToTalentPool = () => {
    message.success(`Đã lưu ${selectedIds.length} ứng viên vào Talent Pool!`);
    setSelectedIds([]);
  };

  const handleScheduleInterviewConfirm = () => {
    if (!interviewCandidate) return;
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === interviewCandidate.id ? { ...c, status: "INTERVIEW" } : c
      )
    );
    message.success(`Đã lên lịch phỏng vấn cho ứng viên "${interviewCandidate.name}" thành công!`);
    setInterviewCandidate(null);
  };

  // Filtered dataset
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      // Tab filter
      if (activeTab === "NEW" && c.status !== "NEW") return false;
      if (activeTab === "MATCHED" && c.status !== "MATCHED") return false;
      if (activeTab === "REVIEWING" && c.status !== "REVIEWING") return false;
      if (activeTab === "INTERVIEW" && c.status !== "INTERVIEW") return false;
      if (activeTab === "OFFER" && c.status !== "OFFER") return false;
      if (activeTab === "REJECTED" && c.status !== "REJECTED") return false;
      if (activeTab === "ARCHIVED" && c.status !== "ARCHIVED") return false;

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

      // Job Code
      if (selectedJob !== "all" && c.jobCode !== selectedJob) return false;

      // Position
      if (selectedPosition !== "all" && !c.jobTitle.includes(selectedPosition)) return false;

      // Source
      if (selectedSource !== "all" && c.source !== selectedSource) return false;

      // Status dropdown
      if (selectedStatus !== "all" && c.status !== selectedStatus) return false;

      return true;
    });
  }, [
    candidates,
    activeTab,
    searchQuery,
    selectedJob,
    selectedPosition,
    selectedSource,
    selectedStatus,
  ]);

  // Pagination slice
  const paginatedCandidates = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCandidates.slice(start, start + pageSize);
  }, [filteredCandidates, currentPage]);

  // Status Badge Renderer
  const renderStatusBadge = (status: Candidate["status"]) => {
    switch (status) {
      case "NEW":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-[#f0fdf4] text-emerald-700 font-bold text-[11px] border border-emerald-200 inline-flex items-center gap-1">
            <span>Mới</span>
          </span>
        );
      case "REVIEWING":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-[#eff6ff] text-blue-700 font-bold text-[11px] border border-blue-200 inline-flex items-center gap-1">
            <span>Đánh giá</span>
          </span>
        );
      case "MATCHED":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-[#ecfdf5] text-teal-700 font-bold text-[11px] border border-teal-200 inline-flex items-center gap-1">
            <span>Phù hợp</span>
          </span>
        );
      case "INTERVIEW":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-[#fffbeb] text-amber-700 font-bold text-[11px] border border-amber-200 inline-flex items-center gap-1">
            <span>Phỏng vấn</span>
          </span>
        );
      case "OFFER":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-[#faf5ff] text-purple-700 font-bold text-[11px] border border-purple-200 inline-flex items-center gap-1">
            <span>Offer</span>
          </span>
        );
      case "REJECTED":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-[#fff1f2] text-rose-700 font-bold text-[11px] border border-rose-200 inline-flex items-center gap-1">
            <span>Đã từ chối</span>
          </span>
        );
      case "ARCHIVED":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold text-[11px] border border-slate-200 inline-flex items-center gap-1">
            <span>Lưu trữ</span>
          </span>
        );
    }
  };

  // Source Logo Renderer
  const renderSourceIcon = (source: Candidate["source"]) => {
    switch (source) {
      case "Website":
        return (
          <span className="flex items-center gap-1.5 text-slate-700 font-semibold text-xs">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>Website</span>
          </span>
        );
      case "LinkedIn":
        return (
          <span className="flex items-center gap-1.5 text-slate-700 font-semibold text-xs">
            <span className="w-4 h-4 rounded bg-[#0077B5] text-white flex items-center justify-center text-[10px] font-black leading-none">
              in
            </span>
            <span>LinkedIn</span>
          </span>
        );
      case "Referral":
        return (
          <span className="flex items-center gap-1.5 text-slate-700 font-semibold text-xs">
            <Users className="w-3.5 h-3.5 text-purple-600" />
            <span>Referral</span>
          </span>
        );
      case "VietnamWorks":
        return (
          <span className="flex items-center gap-1.5 text-slate-700 font-semibold text-xs">
            <span className="w-4 h-4 rounded bg-[#0080ff] text-white flex items-center justify-center text-[10px] font-black leading-none">
              V
            </span>
            <span>VietnamWorks</span>
          </span>
        );
      case "TopCV":
        return (
          <span className="flex items-center gap-1.5 text-slate-700 font-semibold text-xs">
            <span className="w-4 h-4 rounded bg-[#00b14f] text-white flex items-center justify-center text-[10px] font-black leading-none">
              T
            </span>
            <span>TopCV</span>
          </span>
        );
    }
  };

  // Dynamic Context Menu for Candidate Row
  const getCandidateMenuItems = (candidate: Candidate) => {
    const items: any[] = [
      {
        key: "view-profile",
        label: (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setDetailCandidate(candidate);
            }}
            className="flex items-center gap-2 py-0.5 font-medium"
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
              setCvCandidate(candidate);
            }}
            className="flex items-center gap-2 py-0.5 font-medium text-slate-700"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>Xem CV đính kèm</span>
          </div>
        ),
      },
      {
        key: "schedule-interview",
        label: (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setInterviewCandidate(candidate);
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
              message.success(`Đã thêm ứng viên "${candidate.name}" vào Talent Pool!`);
            }}
            className="flex items-center gap-2 py-0.5 font-medium text-purple-700"
          >
            <FolderPlus className="w-3.5 h-3.5 text-purple-600" />
            <span>Lưu vào Talent Pool</span>
          </div>
        ),
      },
      {
        key: "chat-candidate",
        label: (
          <div
            onClick={(e) => {
              e.stopPropagation();
              message.info(`Đang mở hội thoại với ứng viên ${candidate.name}...`);
            }}
            className="flex items-center gap-2 py-0.5 font-medium text-blue-600"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Gửi tin nhắn</span>
          </div>
        ),
      },
      { type: "divider" as const },
    ];

    if (candidate.status !== "REJECTED") {
      items.push({
        key: "reject",
        danger: true,
        label: (
          <Popconfirm
            title="Từ chối ứng viên"
            description="Bạn có chắc muốn chuyển ứng viên này vào danh sách Đã từ chối?"
            onConfirm={(e) => {
              e?.stopPropagation();
              handleChangeStatus(candidate.id, "REJECTED");
            }}
            okText="Từ chối"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 py-0.5 text-rose-600 cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Từ chối hồ sơ</span>
            </div>
          </Popconfirm>
        ),
      });
    } else {
      items.push({
        key: "restore",
        label: (
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleChangeStatus(candidate.id, "REVIEWING");
            }}
            className="flex items-center gap-2 py-0.5 text-emerald-600 font-medium cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Khôi phục xem xét lại</span>
          </div>
        ),
      });
    }

    return items;
  };

  return (
    <div className="space-y-3 max-w-[1680px] mx-auto w-full pb-8">
      {/* ======================================================== */}
      {/* 1. PAGE HEADER (COMPACT)                                 */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 m-0 tracking-tight leading-snug">
            Ứng viên
          </h1>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5 m-0">
            Quản lý, tìm kiếm và theo dõi toàn bộ ứng viên của bạn.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => message.info("Xuất danh sách ứng viên (Excel) đang xử lý...")}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Xuất Excel</span>
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
      {/* 2. 5 KPI CARDS (SLEEK & COMPACT)                         */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {/* Card 1: Tổng ứng viên */}
        <div className="py-2.5 px-3 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs flex items-center justify-between hover:shadow-xs transition-all">
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <span className="text-[10.5px] font-bold text-slate-500 block leading-tight">
              Tổng ứng viên
            </span>
            <span className="text-lg sm:text-xl font-black text-slate-900 block my-0.5 tracking-tight leading-tight">
              {totalCount.toLocaleString()}
            </span>
            <span className="text-[9.5px] font-bold text-emerald-600 block leading-none">
              ↑ 18% <span className="text-slate-400 font-normal">so với tháng trước</span>
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0 shadow-2xs">
            <Users className="w-4 h-4" />
          </div>
        </div>

        {/* Card 2: Ứng viên mới */}
        <div className="py-2.5 px-3 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs flex items-center justify-between hover:shadow-xs transition-all">
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <span className="text-[10.5px] font-bold text-slate-500 block leading-tight">
              Ứng viên mới
            </span>
            <span className="text-lg sm:text-xl font-black text-slate-900 block my-0.5 tracking-tight leading-tight">
              {newCount}
            </span>
            <span className="text-[9.5px] font-bold text-emerald-600 block leading-none">
              ↑ 22% <span className="text-slate-400 font-normal">so với tháng trước</span>
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
            <UserCheck className="w-4 h-4" />
          </div>
        </div>

        {/* Card 3: Ứng viên phù hợp */}
        <div className="py-2.5 px-3 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs flex items-center justify-between hover:shadow-xs transition-all">
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <span className="text-[10.5px] font-bold text-slate-500 block leading-tight">
              Ứng viên phù hợp
            </span>
            <span className="text-lg sm:text-xl font-black text-slate-900 block my-0.5 tracking-tight leading-tight">
              {matchedCount}
            </span>
            <span className="text-[9.5px] font-bold text-emerald-600 block leading-none">
              ↑ 16% <span className="text-slate-400 font-normal">so với tháng trước</span>
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 shadow-2xs">
            <Star className="w-4 h-4 fill-purple-600" />
          </div>
        </div>

        {/* Card 4: Đang phỏng vấn */}
        <div className="py-2.5 px-3 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs flex items-center justify-between hover:shadow-xs transition-all">
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <span className="text-[10.5px] font-bold text-slate-500 block leading-tight">
              Đang phỏng vấn
            </span>
            <span className="text-lg sm:text-xl font-black text-slate-900 block my-0.5 tracking-tight leading-tight">
              {interviewCount}
            </span>
            <span className="text-[9.5px] font-bold text-emerald-600 block leading-none">
              ↑ 12% <span className="text-slate-400 font-normal">so với tháng trước</span>
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
            <Calendar className="w-4 h-4" />
          </div>
        </div>

        {/* Card 5: Đã nhận offer */}
        <div className="py-2.5 px-3 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs flex items-center justify-between hover:shadow-xs transition-all">
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <span className="text-[10.5px] font-bold text-slate-500 block leading-tight">
              Đã nhận offer
            </span>
            <span className="text-lg sm:text-xl font-black text-slate-900 block my-0.5 tracking-tight leading-tight">
              {offerCount}
            </span>
            <span className="text-[9.5px] font-bold text-emerald-600 block leading-none">
              ↑ 9% <span className="text-slate-400 font-normal">so với tháng trước</span>
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 shadow-2xs">
            <Award className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. MAIN WORKSPACE (DUAL INDEPENDENT SCROLL)               */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start xl:h-[calc(100vh-215px)] min-h-0">
        {/* ====================================================== */}
        {/* LEFT COLUMN: CANDIDATE TABLE (~78% = 9 Cols)           */}
        {/* ====================================================== */}
        <div className="xl:col-span-8 2xl:col-span-9 bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs overflow-hidden flex flex-col xl:h-full min-h-0">
          {/* Top Sticky Toolbar: Filters & Tabs */}
          <div className="p-4 border-b border-slate-100 space-y-3.5 shrink-0 bg-white/95 backdrop-blur-xs z-20">
            {/* Row 1: Search + 4 Filter Selects + Button */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search input */}
              <div className="relative flex-1 min-w-[200px] max-w-[260px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm ứng viên..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50/80 hover:bg-slate-100/80 focus:bg-white border border-slate-200/80 rounded-xl outline-none focus:border-[#0062ff] focus:ring-2 focus:ring-blue-50 transition-all font-medium"
                />
              </div>

              {/* Filter 1: Tin tuyển dụng */}
              <Select
                value={selectedJob}
                onChange={setSelectedJob}
                className="custom-filter-select text-xs min-w-[150px]"
                size="middle"
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
                className="custom-filter-select text-xs min-w-[130px]"
                size="middle"
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
                size="middle"
                options={[
                  { value: "all", label: "Tất cả nguồn ứng viên" },
                  { value: "Website", label: "Website Careza" },
                  { value: "LinkedIn", label: "LinkedIn" },
                  { value: "Referral", label: "Referral (Giới thiệu)" },
                  { value: "VietnamWorks", label: "VietnamWorks" },
                  { value: "TopCV", label: "TopCV" },
                ]}
              />

              {/* Filter 4: Trạng thái */}
              <Select
                value={selectedStatus}
                onChange={setSelectedStatus}
                className="custom-filter-select text-xs min-w-[125px]"
                size="middle"
                options={[
                  { value: "all", label: "Tất cả trạng thái" },
                  { value: "NEW", label: "Mới" },
                  { value: "REVIEWING", label: "Đánh giá" },
                  { value: "MATCHED", label: "Phù hợp" },
                  { value: "INTERVIEW", label: "Phỏng vấn" },
                  { value: "OFFER", label: "Offer" },
                  { value: "REJECTED", label: "Đã từ chối" },
                ]}
              />

              {/* Button: Bộ lọc nâng cao */}
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(true)}
                className="px-3 py-1.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ml-auto"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <span>Bộ lọc</span>
              </button>
            </div>

            {/* Row 2: Status Tabs + Sort (Strictly 1 Single Line) */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 w-full min-w-0">
              {/* Tabs List */}
              <div className="flex items-center gap-1 overflow-x-auto min-w-0 flex-1 [&::-webkit-scrollbar]:hidden py-0.5">
                {[
                  { key: "all", label: "Tất cả", count: totalCount },
                  { key: "NEW", label: "Mới", count: newCount },
                  { key: "MATCHED", label: "Phù hợp", count: matchedCount },
                  { key: "REVIEWING", label: "Đánh giá", count: reviewingCount },
                  { key: "INTERVIEW", label: "Phỏng vấn", count: interviewCount },
                  { key: "OFFER", label: "Offer", count: offerCount },
                  { key: "REJECTED", label: "Đã từ chối", count: rejectedCount },
                  { key: "ARCHIVED", label: "Lưu trữ", count: archivedCount },
                ].map((tab) => {
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-2.5 py-1 rounded-xl text-[11.5px] transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                        isActive
                          ? "bg-[#0062ff] text-white font-bold shadow-2xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold"
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-black ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Sort dropdown on right */}
              <div className="flex items-center gap-1.5 shrink-0 pl-2">
                <span className="text-[11px] text-slate-400 font-semibold whitespace-nowrap">
                  Sắp xếp:
                </span>
                <Select
                  value={selectedSort}
                  onChange={setSelectedSort}
                  size="small"
                  className="text-xs min-w-[110px]"
                  suffixIcon={<ChevronDown className="w-3 h-3 text-slate-400" />}
                  options={[
                    { value: "newest", label: "Mới nhất" },
                    { value: "rating-high", label: "Đánh giá cao nhất" },
                    { value: "name-az", label: "Tên A - Z" },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Bulk Action Bar (When >= 1 candidate selected) */}
          {selectedIds.length > 0 && (
            <div className="bg-blue-50/90 border-b border-blue-200 px-4 py-2.5 flex items-center justify-between shrink-0 animate-fadeIn">
              <div className="flex items-center gap-2 text-xs font-black text-[#0062ff]">
                <CheckCircle className="w-4 h-4" />
                <span>Đã chọn {selectedIds.length} ứng viên</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleBulkMoveStage("INTERVIEW")}
                  className="px-3 py-1 bg-[#0062ff] hover:bg-[#0052cc] text-white rounded-lg text-xs font-bold shadow-2xs transition-all cursor-pointer"
                >
                  Chuyển sang Phỏng vấn
                </button>
                <button
                  type="button"
                  onClick={handleBulkAddToTalentPool}
                  className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-purple-700 rounded-lg text-xs font-bold shadow-2xs transition-all cursor-pointer"
                >
                  Lưu Talent Pool
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkMoveStage("REJECTED")}
                  className="px-3 py-1 bg-white hover:bg-slate-50 border border-rose-200 text-rose-600 rounded-lg text-xs font-bold shadow-2xs transition-all cursor-pointer"
                >
                  Từ chối
                </button>
              </div>
            </div>
          )}

          {/* Scrollable Table Area */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
            <table className="w-full text-left text-xs border-collapse min-w-[950px]">
              <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-100 text-[11px] font-black text-slate-500 uppercase tracking-wider shadow-2xs">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">
                    <Checkbox
                      checked={
                        filteredCandidates.length > 0 &&
                        selectedIds.length === filteredCandidates.length
                      }
                      indeterminate={
                        selectedIds.length > 0 &&
                        selectedIds.length < filteredCandidates.length
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="py-3 px-3">ỨNG VIÊN</th>
                  <th className="py-3 px-3">VỊ TRÍ ỨNG TUYỂN ↕</th>
                  <th className="py-3 px-3">NGUỒN</th>
                  <th className="py-3 px-3">TRẠNG THÁI ↕</th>
                  <th className="py-3 px-3 min-w-[105px]">ĐÁNH GIÁ</th>
                  <th className="py-3 px-3">NGÀY ỨNG TUYỂN</th>
                  <th className="py-3 px-3 text-right">THAO TÁC</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {paginatedCandidates.length > 0 ? (
                  paginatedCandidates.map((candidate) => {
                    const isSelected = selectedIds.includes(candidate.id);
                    const menuItems = getCandidateMenuItems(candidate);

                    return (
                      <tr
                        key={candidate.id}
                        onClick={() => setDetailCandidate(candidate)}
                        className={`hover:bg-slate-50/70 transition-colors group cursor-pointer ${
                          isSelected ? "bg-blue-50/40" : ""
                        }`}
                      >
                        {/* 1. Checkbox */}
                        <td
                          className="py-3.5 px-3 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={isSelected}
                            onChange={(e) => handleSelectOne(candidate.id, e.target.checked)}
                          />
                        </td>

                        {/* 2. Ứng viên (Avatar, Name, Badge, Email, Phone) */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={candidate.avatar}
                              size={40}
                              className="border border-slate-200 shrink-0 shadow-2xs"
                            />
                            <div className="min-w-0 space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="font-black text-slate-900 text-xs hover:text-[#0062ff] transition-colors truncate">
                                  {candidate.name}
                                </span>
                                {candidate.isNew && (
                                  <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-600 text-[9px] font-black border border-emerald-200">
                                    Mới
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 leading-tight truncate">
                                {candidate.email}
                              </div>
                              <div className="text-[10.5px] text-slate-400 font-mono leading-tight">
                                {candidate.phone}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 3. Vị trí ứng tuyển */}
                        <td className="py-3.5 px-3">
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-800 text-xs block leading-tight truncate">
                              {candidate.jobTitle}
                            </span>
                            <span className="text-[10.5px] font-mono text-slate-400 font-bold block">
                              {candidate.jobCode}
                            </span>
                          </div>
                        </td>

                        {/* 4. Nguồn */}
                        <td className="py-3.5 px-3">
                          {renderSourceIcon(candidate.source)}
                        </td>

                        {/* 5. Trạng thái */}
                        <td className="py-3.5 px-3">
                          {renderStatusBadge(candidate.status)}
                        </td>

                        {/* 6. Đánh giá (Star Rating - Strictly 1 Line) */}
                        <td
                          className="py-3.5 px-3 min-w-[105px] whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((starVal) => (
                              <button
                                key={starVal}
                                type="button"
                                aria-label={`Đánh giá ${starVal} sao`}
                                onClick={() => handleRateCandidate(candidate.id, starVal)}
                                className="p-0.5 hover:scale-125 transition-transform cursor-pointer"
                              >
                                <Star
                                  className={`w-3.5 h-3.5 ${
                                    starVal <= candidate.rating
                                      ? "text-amber-400 fill-amber-400"
                                      : "text-slate-200 fill-slate-100"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </td>

                        {/* 7. Ngày ứng tuyển */}
                        <td className="py-3.5 px-3">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-700 text-xs block">
                              {candidate.appliedAt}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium block">
                              {candidate.appliedTimeAgo}
                            </span>
                          </div>
                        </td>

                        {/* 8. Thao tác (3 Icon Buttons) */}
                        <td className="py-3.5 px-3 text-right">
                          <div
                            className="flex items-center justify-end gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* 1. Chat button */}
                            <Tooltip title="Chat với ứng viên">
                              <button
                                type="button"
                                aria-label="Chat với ứng viên"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  message.info(`Đang mở cửa sổ chat với ${candidate.name}...`);
                                }}
                                className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-blue-600 flex items-center justify-center transition-colors cursor-pointer border border-slate-200/80 active:scale-95"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>
                            </Tooltip>

                            {/* 2. Xem hồ sơ button */}
                            <Tooltip title="Xem hồ sơ & CV">
                              <button
                                type="button"
                                aria-label="Xem hồ sơ"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDetailCandidate(candidate);
                                }}
                                className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-emerald-600 flex items-center justify-center transition-colors cursor-pointer border border-slate-200/80 active:scale-95"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                            </Tooltip>

                            {/* 3. More button (...) */}
                            <Tooltip title="Thao tác khác">
                              <Dropdown
                                menu={{ items: menuItems }}
                                trigger={["click"]}
                                placement="bottomRight"
                                arrow
                              >
                                <button
                                  type="button"
                                  aria-label="Thao tác khác"
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer border border-slate-200/80 active:scale-95"
                                >
                                  <MoreHorizontal className="w-3.5 h-3.5" />
                                </button>
                              </Dropdown>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      <div className="max-w-xs mx-auto space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                          <Search className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-xs m-0">
                            Không tìm thấy ứng viên phù hợp
                          </p>
                          <p className="text-[11px] text-slate-400 m-0 mt-0.5">
                            Thử điều chỉnh từ khóa tìm kiếm hoặc đặt lại các bộ lọc.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery("");
                            setSelectedJob("all");
                            setSelectedPosition("all");
                            setSelectedSource("all");
                            setSelectedStatus("all");
                            setActiveTab("all");
                          }}
                          className="px-4 py-1.5 rounded-xl bg-blue-50 text-[#0062ff] hover:bg-blue-100 text-xs font-bold transition-all cursor-pointer"
                        >
                          Đặt lại bộ lọc
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 bg-slate-50/60 text-xs">
            <span className="text-slate-500 font-medium text-[11.5px]">
              Hiển thị 1 - {paginatedCandidates.length} trong tổng số{" "}
              <strong className="text-slate-800 font-black">{totalCount.toLocaleString()}</strong> ứng viên
            </span>

            <div className="flex items-center gap-3">
              <Pagination
                size="small"
                current={currentPage}
                total={filteredCandidates.length}
                pageSize={pageSize}
                onChange={setCurrentPage}
                showSizeChanger={false}
              />
              <Select
                value={10}
                size="small"
                className="text-xs"
                options={[
                  { value: 10, label: "10 / trang" },
                  { value: 20, label: "20 / trang" },
                  { value: 50, label: "50 / trang" },
                ]}
              />
            </div>
          </div>
        </div>

        {/* ====================================================== */}
        {/* RIGHT COLUMN: INSIGHTS & ACTIONS (~22% = 3 Cols)        */}
        {/* ====================================================== */}
        <div className="xl:col-span-4 2xl:col-span-3 xl:h-full min-h-0 xl:overflow-y-auto space-y-4 pr-0.5 xl:pb-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
          {/* Card 1: Nguồn ứng viên (Donut Chart) */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 m-0">Nguồn ứng viên</h3>
              <Select
                defaultValue="30days"
                size="small"
                className="text-[11px]"
                options={[
                  { value: "7days", label: "7 ngày" },
                  { value: "30days", label: "30 ngày" },
                  { value: "90days", label: "3 tháng" },
                ]}
              />
            </div>

            {/* Donut Chart Simulation */}
            <div className="flex items-center gap-4">
              <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background Circle */}
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                  {/* Website (49.7% ~ strokeDasharray 119) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#0062ff"
                    strokeWidth="12"
                    strokeDasharray="119 239"
                    strokeDashoffset="0"
                    strokeLinecap="round"
                  />
                  {/* LinkedIn (26.3% ~ strokeDasharray 63) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="12"
                    strokeDasharray="63 239"
                    strokeDashoffset="-119"
                    strokeLinecap="round"
                  />
                  {/* Referral (15.4% ~ strokeDasharray 37) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="12"
                    strokeDasharray="37 239"
                    strokeDashoffset="-182"
                    strokeLinecap="round"
                  />
                  {/* TopCV (8.6% ~ strokeDasharray 20) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#9333ea"
                    strokeWidth="12"
                    strokeDasharray="20 239"
                    strokeDashoffset="-219"
                    strokeLinecap="round"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-base font-black text-slate-900 leading-none">1,248</span>
                  <span className="text-[9px] text-slate-400 font-semibold mt-0.5">Tổng ứng viên</span>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-1.5 text-[11px] flex-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-[#0062ff]" />
                    <span>Website</span>
                  </span>
                  <span className="font-black text-slate-900">620 <span className="text-[10px] font-normal text-slate-400">(49.7%)</span></span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>LinkedIn</span>
                  </span>
                  <span className="font-black text-slate-900">328 <span className="text-[10px] font-normal text-slate-400">(26.3%)</span></span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Referral</span>
                  </span>
                  <span className="font-black text-slate-900">192 <span className="text-[10px] font-normal text-slate-400">(15.4%)</span></span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-purple-600" />
                    <span>TopCV</span>
                  </span>
                  <span className="font-black text-slate-900">108 <span className="text-[10px] font-normal text-slate-400">(8.6%)</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Ứng viên theo giai đoạn */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 m-0">Ứng viên theo giai đoạn</h3>
              <Link
                href="/doanh-nghiep/pipeline"
                className="text-[11px] font-bold text-[#0062ff] hover:underline"
              >
                Xem tất cả
              </Link>
            </div>

            <div className="space-y-2.5 text-xs">
              {/* Mới */}
              <div>
                <div className="flex justify-between font-bold text-slate-700 pb-1 text-[11px]">
                  <span>Mới</span>
                  <span className="font-black text-slate-900">312</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full w-[45%]" />
                </div>
              </div>

              {/* Đánh giá */}
              <div>
                <div className="flex justify-between font-bold text-slate-700 pb-1 text-[11px]">
                  <span>Đánh giá</span>
                  <span className="font-black text-slate-900">226</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#0062ff] h-full rounded-full w-[35%]" />
                </div>
              </div>

              {/* Phỏng vấn */}
              <div>
                <div className="flex justify-between font-bold text-slate-700 pb-1 text-[11px]">
                  <span>Phỏng vấn</span>
                  <span className="font-black text-slate-900">192</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full w-[28%]" />
                </div>
              </div>

              {/* Offer */}
              <div>
                <div className="flex justify-between font-bold text-slate-700 pb-1 text-[11px]">
                  <span>Offer</span>
                  <span className="font-black text-slate-900">48</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-full rounded-full w-[12%]" />
                </div>
              </div>

              {/* Đã từ chối */}
              <div>
                <div className="flex justify-between font-bold text-slate-700 pb-1 text-[11px]">
                  <span>Đã từ chối</span>
                  <span className="font-black text-slate-900">142</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full w-[20%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Thao tác nhanh (2x3 Grid) */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs p-4 space-y-3">
            <h3 className="text-xs font-black text-slate-900 m-0">Thao tác nhanh</h3>

            <div className="grid grid-cols-3 gap-2">
              {/* Action 1 */}
              <div
                onClick={() => {
                  const input = document.querySelector('input[placeholder="Tìm kiếm ứng viên..."]') as HTMLInputElement;
                  if (input) input.focus();
                }}
                className="p-3 bg-emerald-50/70 hover:bg-emerald-100 rounded-xl border border-emerald-100 text-center space-y-1.5 transition-all h-full flex flex-col items-center justify-center cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                  <Search className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-bold text-emerald-900 block leading-tight">
                  Tìm kiếm ứng viên
                </span>
              </div>

              {/* Action 2 */}
              <div
                onClick={() => message.info("Tính năng Thêm ứng viên đang phát triển")}
                className="p-3 bg-blue-50/70 hover:bg-blue-100 rounded-xl border border-blue-100 text-center space-y-1.5 transition-all h-full flex flex-col items-center justify-center cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-[#0062ff] text-white flex items-center justify-center shadow-2xs">
                  <UserPlus className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-bold text-blue-900 block leading-tight">
                  Thêm ứng viên
                </span>
              </div>

              {/* Action 3 */}
              <Link href="/doanh-nghiep/talent-pool" className="block group">
                <div className="p-3 bg-purple-50/70 hover:bg-purple-100 rounded-xl border border-purple-100 text-center space-y-1.5 transition-all h-full flex flex-col items-center justify-center cursor-pointer">
                  <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-2xs">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-bold text-purple-900 block leading-tight">
                    Talent Pool
                  </span>
                </div>
              </Link>

              {/* Action 4 */}
              <div
                onClick={() => message.info("Tính năng Gửi email hàng loạt đang phát triển")}
                className="p-3 bg-amber-50/70 hover:bg-amber-100 rounded-xl border border-amber-100 text-center space-y-1.5 transition-all h-full flex flex-col items-center justify-center cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-2xs">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-bold text-amber-900 block leading-tight">
                  Gửi email
                </span>
              </div>

              {/* Action 5 */}
              <Link href="/doanh-nghiep/lich-phong-van" className="block group">
                <div className="p-3 bg-rose-50/70 hover:bg-rose-100 rounded-xl border border-rose-100 text-center space-y-1.5 transition-all h-full flex flex-col items-center justify-center cursor-pointer">
                  <div className="w-7 h-7 rounded-lg bg-rose-500 text-white flex items-center justify-center shadow-2xs">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-bold text-rose-900 block leading-tight">
                    Lịch phỏng vấn
                  </span>
                </div>
              </Link>

              {/* Action 6 */}
              <div
                onClick={() => message.info("Đang kết xuất báo cáo ứng viên...")}
                className="p-3 bg-cyan-50/70 hover:bg-cyan-100 rounded-xl border border-cyan-100 text-center space-y-1.5 transition-all h-full flex flex-col items-center justify-center cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-cyan-600 text-white flex items-center justify-center shadow-2xs">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-bold text-cyan-900 block leading-tight">
                  Xuất báo cáo
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Mẹo tuyển dụng */}
          <div className="bg-gradient-to-br from-amber-50/90 to-orange-50/60 rounded-2xl border border-amber-200/80 p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-amber-800 font-black text-xs">
              <span>💡</span>
              <span>Mẹo tuyển dụng</span>
            </div>
            <p className="text-[11px] text-slate-600 font-medium m-0 leading-relaxed">
              Hồ sơ có video giới thiệu nhận được nhiều lượt xem hơn 3 lần so với hồ sơ thông thường.
            </p>
            <Link
              href="/doanh-nghiep/jd-template"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0062ff] hover:underline pt-0.5"
            >
              <span>Tạo JD hấp dẫn hơn</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. MODAL: XEM CHI TIẾT HỒ SƠ ỨNG VIÊN                    */}
      {/* ======================================================== */}
      <Modal
        open={!!detailCandidate}
        onCancel={() => setDetailCandidate(null)}
        footer={null}
        width={760}
        centered
        destroyOnHidden
        title={null}
      >
        {detailCandidate && (
          <div className="space-y-6 p-2">
            {/* Candidate Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-start gap-4">
                <Avatar
                  src={detailCandidate.avatar}
                  size={64}
                  className="border-2 border-slate-200 shrink-0 shadow-md"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900 m-0">
                      {detailCandidate.name}
                    </h2>
                    {renderStatusBadge(detailCandidate.status)}
                  </div>
                  <p className="text-xs text-[#0062ff] font-bold m-0">
                    Ứng tuyển: {detailCandidate.jobTitle} ({detailCandidate.jobCode})
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium flex-wrap pt-0.5">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{detailCandidate.email}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{detailCandidate.phone}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      <span>{detailCandidate.experienceYears} năm kinh nghiệm</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="text-right shrink-0">
                <span className="text-[11px] font-bold text-slate-400 block mb-1">Đánh giá</span>
                <Rate
                  value={detailCandidate.rating}
                  onChange={(val) => handleRateCandidate(detailCandidate.id, val)}
                  className="text-amber-400 text-sm"
                />
              </div>
            </div>

            {/* Skills & Notes */}
            <div className="space-y-4 text-xs">
              <div>
                <span className="font-black text-slate-900 block pb-1.5 uppercase tracking-wider text-[11px]">
                  Kỹ năng chuyên môn
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {detailCandidate.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200/80"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <span className="font-black text-slate-900 block text-xs">
                  Ghi chú đánh giá từ Recruiter:
                </span>
                <p className="text-xs text-slate-600 m-0 leading-relaxed font-medium">
                  {detailCandidate.notes || "Chưa có ghi chú cho ứng viên này."}
                </p>
              </div>

              {/* CV Download Box */}
              <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-2xs">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-black text-slate-900 block text-xs">
                      {detailCandidate.cvName}
                    </span>
                    <span className="text-[10.5px] text-slate-400 font-medium">
                      Đã tải lên lúc {detailCandidate.appliedAt}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCvCandidate(detailCandidate);
                    }}
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

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDetailCandidate(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-all cursor-pointer"
              >
                Đóng
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setInterviewCandidate(detailCandidate);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Lên lịch phỏng vấn</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    message.success(`Đã lưu "${detailCandidate.name}" vào Talent Pool!`);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>Lưu Talent Pool</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ======================================================== */}
      {/* 5. MODAL: XEM CV (CV VIEWER)                             */}
      {/* ======================================================== */}
      <Modal
        open={!!cvCandidate}
        onCancel={() => setCvCandidate(null)}
        footer={null}
        width={780}
        centered
        destroyOnHidden
        title={null}
      >
        {cvCandidate && (
          <div className="space-y-4 p-2">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 m-0">
                  CV Ứng viên: {cvCandidate.name}
                </h3>
                <span className="text-xs text-slate-500 font-medium">{cvCandidate.cvName}</span>
              </div>

              <button
                type="button"
                onClick={() => message.success("Đang tải xuống file PDF...")}
                className="px-3.5 py-1.5 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải CV</span>
              </button>
            </div>

            {/* Simulated Clean CV Viewer */}
            <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200 min-h-[480px] flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-white text-rose-500 border border-slate-200 flex items-center justify-center shadow-md">
                <FileText className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-1">
                <h4 className="text-sm font-black text-slate-800 m-0">
                  {cvCandidate.cvName}
                </h4>
                <p className="text-xs text-slate-500 font-medium m-0">
                  Hồ sơ định dạng PDF • Đã được quét bảo mật bởi Careza ATS
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200/80 text-left text-xs text-slate-700 max-w-lg w-full space-y-2 shadow-2xs">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="font-bold text-slate-500">Họ và tên:</span>
                  <span className="font-black text-slate-900">{cvCandidate.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="font-bold text-slate-500">Vị trí:</span>
                  <span className="font-bold text-[#0062ff]">{cvCandidate.jobTitle}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="font-bold text-slate-500">Kinh nghiệm:</span>
                  <span className="font-semibold text-slate-800">{cvCandidate.experienceYears} năm</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-500">Kỹ năng:</span>
                  <span className="font-semibold text-slate-800">{cvCandidate.skills.join(", ")}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setCvCandidate(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ======================================================== */}
      {/* 6. MODAL: LÊN LỊCH PHỎNG VẤN                            */}
      {/* ======================================================== */}
      <Modal
        open={!!interviewCandidate}
        onCancel={() => setInterviewCandidate(null)}
        footer={null}
        width={520}
        centered
        destroyOnHidden
        title={null}
      >
        {interviewCandidate && (
          <div className="space-y-4 p-2">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-2xs">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 m-0">
                  Lên lịch phỏng vấn
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  Ứng viên: {interviewCandidate.name} ({interviewCandidate.jobTitle})
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Thời gian phỏng vấn:</label>
                <Input
                  type="datetime-local"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Hình thức phỏng vấn:</label>
                <Select
                  value={interviewType}
                  onChange={setInterviewType}
                  className="w-full text-xs"
                  options={[
                    { value: "online", label: "Phỏng vấn Online (Google Meet / Zoom)" },
                    { value: "offline", label: "Phỏng vấn trực tiếp tại văn phòng công ty" },
                  ]}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setInterviewCandidate(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs cursor-pointer"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                onClick={handleScheduleInterviewConfirm}
                className="px-5 py-2 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-black text-xs shadow-md transition-all cursor-pointer active:scale-98"
              >
                Xác nhận lên lịch
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ======================================================== */}
      {/* 7. DRAWER: BỘ LỌC NÂNG CAO (ADVANCED FILTERS)           */}
      {/* ======================================================== */}
      <Drawer
        title="Bộ lọc ứng viên nâng cao"
        placement="right"
        onClose={() => setIsFilterDrawerOpen(false)}
        open={isFilterDrawerOpen}
        styles={{ wrapper: { width: 360 } }}
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Số năm kinh nghiệm:</label>
            <Select
              defaultValue="all"
              className="w-full"
              options={[
                { value: "all", label: "Tất cả kinh nghiệm" },
                { value: "1", label: "Dưới 1 năm" },
                { value: "1-3", label: "1 - 3 năm" },
                { value: "3-5", label: "3 - 5 năm" },
                { value: "5+", label: "Trên 5 năm" },
              ]}
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Đánh giá tối thiểu:</label>
            <Select
              defaultValue="all"
              className="w-full"
              options={[
                { value: "all", label: "Tất cả mức đánh giá" },
                { value: "5", label: "⭐⭐⭐⭐⭐ (5 sao)" },
                { value: "4", label: "⭐⭐⭐⭐ (Từ 4 sao trở lên)" },
                { value: "3", label: "⭐⭐⭐ (Từ 3 sao trở lên)" },
              ]}
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Kỹ năng chuyên môn:</label>
            <Select
              mode="tags"
              placeholder="Nhập kỹ năng (React, Figma, Python...)"
              className="w-full"
            />
          </div>

          <div className="pt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFilterDrawerOpen(false)}
              className="flex-1 py-2 rounded-xl bg-[#0062ff] text-white font-bold text-xs shadow-md"
            >
              Áp dụng bộ lọc
            </button>
            <button
              type="button"
              onClick={() => setIsFilterDrawerOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
            >
              Đóng
            </button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}

export default function EmployerCandidatesPage() {
  return (
    <App>
      <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400 font-bold">Đang tải ứng viên...</div>}>
        <EmployerCandidatesContent />
      </Suspense>
    </App>
  );
}
