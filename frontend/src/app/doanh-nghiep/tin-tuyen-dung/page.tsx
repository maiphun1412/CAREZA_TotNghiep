"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import {
  Dropdown,
  Tooltip,
  App,
  Popconfirm,
  Select,
  Input,
  Modal,
} from "antd";
import {
  Plus,
  Download,
  Search,
  ChevronDown,
  Filter,
  BarChart3,
  Edit,
  MoreHorizontal,
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Calendar,
  AlertCircle,
  FileEdit,
  TrendingUp,
  ArrowRight,
  Eye,
  Users,
  Sparkles,
  MessageSquare,
  FileText,
  Copy,
  PauseCircle,
  PlayCircle,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
} from "lucide-react";

interface JobPosting {
  id: string;
  code: string;
  title: string;
  workType: string;
  skills: string[];
  status: "ACTIVE" | "EXPIRING" | "EXPIRED" | "DRAFT" | "PENDING";
  location: string;
  salaryText: string;
  experience: string;
  appliedTotal: number;
  appliedNew: number;
  views: number;
  publishedAt: string;
  expiredAt: string;
  daysRemaining: number | null; // null if draft or pending
}

const INITIAL_JOBS: JobPosting[] = [
  {
    id: "job-1",
    code: "PM-2408",
    title: "Product Manager",
    workType: "Toàn thời gian",
    skills: ["Product", "Strategy", "Leadership"],
    status: "ACTIVE",
    location: "Hà Nội",
    salaryText: "25 - 40 triệu VND",
    experience: "3 - 5 năm",
    appliedTotal: 28,
    appliedNew: 5,
    views: 620,
    publishedAt: "16/08/2026",
    expiredAt: "16/09/2026",
    daysRemaining: 21,
  },
  {
    id: "job-2",
    code: "UX-2408",
    title: "Senior UX/UI Designer",
    workType: "Toàn thời gian",
    skills: ["Figma", "UI/UX", "Design System"],
    status: "ACTIVE",
    location: "TP. Hồ Chí Minh",
    salaryText: "18 - 30 triệu VND",
    experience: "2 - 4 năm",
    appliedTotal: 16,
    appliedNew: 3,
    views: 458,
    publishedAt: "14/08/2026",
    expiredAt: "14/09/2026",
    daysRemaining: 19,
  },
  {
    id: "job-3",
    code: "FE-2407",
    title: "Frontend Developer",
    workType: "Toàn thời gian",
    skills: ["React", "TypeScript", "Next.js"],
    status: "EXPIRING",
    location: "Đà Nẵng",
    salaryText: "18 - 28 triệu VND",
    experience: "2 - 4 năm",
    appliedTotal: 24,
    appliedNew: 2,
    views: 398,
    publishedAt: "01/08/2026",
    expiredAt: "22/08/2026",
    daysRemaining: 2,
  },
  {
    id: "job-4",
    code: "DA-2406",
    title: "Data Analyst",
    workType: "Toàn thời gian",
    skills: ["SQL", "Python", "Analytics"],
    status: "EXPIRED",
    location: "Hà Nội",
    salaryText: "12 - 20 triệu VND",
    experience: "1 - 3 năm",
    appliedTotal: 12,
    appliedNew: 0,
    views: 210,
    publishedAt: "01/07/2026",
    expiredAt: "31/07/2026",
    daysRemaining: -1,
  },
  {
    id: "job-5",
    code: "HR-2408",
    title: "HR Generalist",
    workType: "Toàn thời gian",
    skills: ["HR", "Recruitment", "C&B"],
    status: "DRAFT",
    location: "TP. Hồ Chí Minh",
    salaryText: "15 - 22 triệu VND",
    experience: "2 - 3 năm",
    appliedTotal: 0,
    appliedNew: 0,
    views: 0,
    publishedAt: "18/08/2026",
    expiredAt: "-",
    daysRemaining: null,
  },
  {
    id: "job-6",
    code: "DEVOPS-2408",
    title: "DevOps Engineer",
    workType: "Toàn thời gian",
    skills: ["DevOps", "AWS", "Docker"],
    status: "PENDING",
    location: "Hà Nội",
    salaryText: "25 - 35 triệu VND",
    experience: "3 - 5 năm",
    appliedTotal: 0,
    appliedNew: 0,
    views: 0,
    publishedAt: "19/08/2026",
    expiredAt: "-",
    daysRemaining: null,
  },
];

function EmployerJobsContent() {
  const { message } = App.useApp();
  const { user } = useAuthStore();
  const recruiterName = user?.fullName || "Mai Phương";

  const [jobs, setJobs] = useState<JobPosting[]>(INITIAL_JOBS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPosition, setSelectedPosition] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedSort, setSelectedSort] = useState<string>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [analyticsJob, setAnalyticsJob] = useState<JobPosting | null>(null);
  const [renewJob, setRenewJob] = useState<JobPosting | null>(null);
  const [renewalDays, setRenewalDays] = useState<number>(30);
  const [previewJob, setPreviewJob] = useState<JobPosting | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const pageSize = 6;

  // Action Handlers
  const handleDeleteJob = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setJobs((prev) => prev.filter((j) => j.id !== id));
    message.success("Đã xóa tin tuyển dụng thành công!");
  };

  const handleDuplicateJob = (job: JobPosting, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newJob: JobPosting = {
      ...job,
      id: `job-${Date.now()}`,
      code: `${job.code}-COPY`,
      title: `${job.title} (Bản sao)`,
      status: "DRAFT",
      appliedTotal: 0,
      appliedNew: 0,
      views: 0,
      publishedAt: new Date().toLocaleDateString("vi-VN"),
      daysRemaining: null,
    };
    setJobs((prev) => [newJob, ...prev]);
    message.success(`Đã nhân bản tin "${job.title}" thành bản nháp mới!`);
  };

  const handlePublishDraft = (job: JobPosting, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActionLoading(job.id);
    setTimeout(() => {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === job.id
            ? {
                ...j,
                status: "ACTIVE",
                publishedAt: new Date().toLocaleDateString("vi-VN"),
                expiredAt: "30 ngày sau",
                daysRemaining: 30,
              }
            : j
        )
      );
      setActionLoading(null);
      message.success(`Đã xuất bản tin tuyển dụng "${job.title}" thành công!`);
    }, 400);
  };

  const handleCloseJob = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setJobs((prev) =>
      prev.map((j) =>
        j.id === id ? { ...j, status: "EXPIRED", daysRemaining: -1 } : j
      )
    );
    message.success("Đã đóng tin tuyển dụng thành công!");
  };

  const handleToggleStatus = (
    id: string,
    newStatus: JobPosting["status"],
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status: newStatus } : j))
    );
    message.success("Đã cập nhật trạng thái tin tuyển dụng!");
  };

  const handleConfirmRenewal = () => {
    if (!renewJob) return;
    setJobs((prev) =>
      prev.map((j) =>
        j.id === renewJob.id
          ? {
              ...j,
              status: "ACTIVE",
              daysRemaining: renewalDays,
              expiredAt: `${renewalDays} ngày tới`,
            }
          : j
      )
    );
    message.success(`Đã gia hạn tin "${renewJob.title}" thêm ${renewalDays} ngày thành công!`);
    setRenewJob(null);
  };

  // KPI Calculations
  const totalCount = jobs.length;
  const activeCount = jobs.filter((j) => j.status === "ACTIVE").length;
  const expiringCount = jobs.filter((j) => j.status === "EXPIRING").length;
  const expiredCount = jobs.filter((j) => j.status === "EXPIRED").length;
  const draftCount = jobs.filter((j) => j.status === "DRAFT").length;

  // Filtered dataset
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          job.title.toLowerCase().includes(q) ||
          job.code.toLowerCase().includes(q) ||
          job.skills.some((s) => s.toLowerCase().includes(q)) ||
          job.location.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }
      // Status
      if (selectedStatus !== "all" && job.status !== selectedStatus) {
        return false;
      }
      // Location
      if (selectedLocation !== "all" && !job.location.includes(selectedLocation)) {
        return false;
      }
      // Position
      if (selectedPosition !== "all" && !job.title.includes(selectedPosition)) {
        return false;
      }
      return true;
    });
  }, [jobs, searchQuery, selectedStatus, selectedLocation, selectedPosition]);

  // Pagination slice
  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredJobs.slice(start, start + pageSize);
  }, [filteredJobs, currentPage]);

  const totalPages = Math.ceil(filteredJobs.length / pageSize) || 1;

  // Status Badge Renderer
  const renderStatusBadge = (status: JobPosting["status"]) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-[#f0fdf4] text-emerald-700 font-black text-[10.5px] border border-emerald-200 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Đang hoạt động</span>
          </span>
        );
      case "EXPIRING":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-[#fffbeb] text-amber-700 font-black text-[10.5px] border border-amber-200 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Sắp hết hạn</span>
          </span>
        );
      case "EXPIRED":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-[#fff1f2] text-rose-700 font-black text-[10.5px] border border-rose-200 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Hết hạn</span>
          </span>
        );
      case "DRAFT":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-[#faf5ff] text-purple-700 font-black text-[10.5px] border border-purple-200 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <span>Nháp</span>
          </span>
        );
      case "PENDING":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-[#eff6ff] text-blue-700 font-black text-[10.5px] border border-blue-200 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>Chờ duyệt</span>
          </span>
        );
    }
  };

  // Build dynamic context menu items based on job status
  const getJobMenuItems = (job: JobPosting) => {
    const items: any[] = [];

    // 1. Xem chi tiết / Xem trước
    items.push({
      key: "view-details",
      label: (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setPreviewJob(job);
          }}
          className="flex items-center gap-2 py-0.5"
        >
          <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
          <span>Xem chi tiết tin</span>
        </div>
      ),
    });

    // 2. Xem ứng viên (cho tin ACTIVE / EXPIRING / EXPIRED)
    if (job.status !== "DRAFT" && job.status !== "PENDING") {
      items.push({
        key: "view-applicants",
        label: (
          <Link
            href={`/doanh-nghiep/ung-vien?jobId=${job.id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 py-0.5 text-slate-700 hover:text-emerald-600"
          >
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span>Xem ứng viên ({job.appliedTotal})</span>
          </Link>
        ),
      });
    }

    // 3. Chỉnh sửa
    items.push({
      key: "edit-job",
      label: (
        <Link
          href={`/doanh-nghiep/tin-tuyen-dung/sua/${job.id}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-2 py-0.5 text-slate-700 hover:text-amber-600"
        >
          <Edit className="w-3.5 h-3.5 text-amber-600" />
          <span>Chỉnh sửa tin</span>
        </Link>
      ),
    });

    // 4. Action đặc thù theo status
    if (job.status === "DRAFT") {
      items.push({
        key: "publish-now",
        label: (
          <div
            onClick={(e) => handlePublishDraft(job, e)}
            className="flex items-center gap-2 py-0.5 text-emerald-600 font-bold cursor-pointer"
          >
            <PlayCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Đăng tin ngay</span>
          </div>
        ),
      });
    }

    if (job.status === "EXPIRING" || job.status === "EXPIRED") {
      items.push({
        key: "renew-job",
        label: (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setRenewJob(job);
            }}
            className="flex items-center gap-2 py-0.5 text-[#0062ff] font-bold cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-[#0062ff]" />
            <span>Gia hạn tin tuyển dụng</span>
          </div>
        ),
      });
    }

    if (job.status === "ACTIVE") {
      items.push({
        key: "pause-job",
        label: (
          <Popconfirm
            title="Tạm dừng tin tuyển dụng"
            description="Bạn có chắc muốn tạm dừng nhận hồ sơ cho vị trí này?"
            onConfirm={(e) => handleToggleStatus(job.id, "EXPIRED", e as any)}
            okText="Tạm dừng"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 py-0.5 text-slate-600 hover:text-rose-600 cursor-pointer"
            >
              <PauseCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>Tạm dừng nhận hồ sơ</span>
            </div>
          </Popconfirm>
        ),
      });
    }

    // 5. Nhân bản tin (cho hầu hết các status)
    items.push({
      key: "duplicate-job",
      label: (
        <div
          onClick={(e) => handleDuplicateJob(job, e)}
          className="flex items-center gap-2 py-0.5 text-slate-700 hover:text-purple-600 cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5 text-purple-600" />
          <span>Nhân bản tin này</span>
        </div>
      ),
    });

    items.push({ type: "divider" as const });

    // 6. Đóng tin / Xóa tin
    if (job.status === "ACTIVE" || job.status === "EXPIRING") {
      items.push({
        key: "close-job",
        danger: true,
        label: (
          <Popconfirm
            title="Đóng tin tuyển dụng"
            description="Tin tuyển dụng sẽ được chuyển sang trạng thái đã hết hạn."
            onConfirm={(e) => handleCloseJob(job.id, e as any)}
            okText="Đóng tin"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 py-0.5 text-rose-600 cursor-pointer"
            >
              <PauseCircle className="w-3.5 h-3.5" />
              <span>Đóng tin tuyển dụng</span>
            </div>
          </Popconfirm>
        ),
      });
    }

    if (job.status === "DRAFT" || job.status === "EXPIRED") {
      items.push({
        key: "delete-job",
        danger: true,
        label: (
          <Popconfirm
            title="Xóa tin tuyển dụng"
            description="Bạn có chắc chắn muốn xóa tin này vĩnh viễn khỏi hệ thống?"
            onConfirm={(e) => handleDeleteJob(job.id, e as any)}
            okText="Xóa vĩnh viễn"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 py-0.5 text-rose-600 cursor-pointer font-bold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa tin</span>
            </div>
          </Popconfirm>
        ),
      });
    }

    return items;
  };

  return (
    <div className="space-y-5 max-w-[1680px] mx-auto w-full pb-10">
      {/* ======================================================== */}
      {/* 1. PAGE HEADER (TITLE & ACTION BUTTONS)                  */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 m-0 tracking-tight leading-snug">
            Quản lý tin tuyển dụng
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => message.success("Đang chuẩn bị dữ liệu xuất báo cáo Excel...")}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Xuất báo cáo</span>
          </button>

          <Link href="/doanh-nghiep/tin-tuyen-dung/them-moi">
            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Đăng tin tuyển dụng mới</span>
            </button>
          </Link>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. 5 KPI CARDS                                           */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
        {/* KPI 1: Tất cả tin */}
        <div
          onClick={() => setSelectedStatus("all")}
          className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer shadow-2xs flex items-center justify-between gap-2 ${
            selectedStatus === "all" ? "border-blue-500 ring-2 ring-blue-100" : "border-[#E2E8F0] hover:border-blue-300"
          }`}
        >
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-1 min-w-0">
            <span className="text-[11px] font-bold text-slate-500 block leading-tight truncate w-full">
              Tất cả tin tuyển dụng
            </span>
            <span className="text-2xl font-black text-slate-900 block leading-tight">
              {totalCount}
            </span>
            <span className="text-[10.5px] font-bold text-slate-400 block">
              Tất cả tin
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0 shadow-xs">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2: Đang hoạt động */}
        <div
          onClick={() => setSelectedStatus("ACTIVE")}
          className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer shadow-2xs flex items-center justify-between gap-2 ${
            selectedStatus === "ACTIVE" ? "border-emerald-500 ring-2 ring-emerald-100" : "border-[#E2E8F0] hover:border-emerald-300"
          }`}
        >
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-1 min-w-0">
            <span className="text-[11px] font-bold text-slate-500 block leading-tight truncate w-full">
              Đang hoạt động
            </span>
            <span className="text-2xl font-black text-slate-900 block leading-tight">
              {activeCount}
            </span>
            <span className="text-[10.5px] font-bold text-emerald-600 flex items-center justify-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>+12% so với tháng trước</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3: Sắp hết hạn */}
        <div
          onClick={() => setSelectedStatus("EXPIRING")}
          className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer shadow-2xs flex items-center justify-between gap-2 ${
            selectedStatus === "EXPIRING" ? "border-amber-500 ring-2 ring-amber-100" : "border-[#E2E8F0] hover:border-amber-300"
          }`}
        >
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-1 min-w-0">
            <span className="text-[11px] font-bold text-slate-500 block leading-tight truncate w-full">
              Sắp hết hạn
            </span>
            <span className="text-2xl font-black text-slate-900 block leading-tight">
              {expiringCount}
            </span>
            <span className="text-[10.5px] font-bold text-amber-600 block">
              Hết hạn trong 7 ngày
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4: Hết hạn */}
        <div
          onClick={() => setSelectedStatus("EXPIRED")}
          className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer shadow-2xs flex items-center justify-between gap-2 ${
            selectedStatus === "EXPIRED" ? "border-rose-500 ring-2 ring-rose-100" : "border-[#E2E8F0] hover:border-rose-300"
          }`}
        >
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-1 min-w-0">
            <span className="text-[11px] font-bold text-slate-500 block leading-tight truncate w-full">
              Hết hạn
            </span>
            <span className="text-2xl font-black text-slate-900 block leading-tight">
              {expiredCount}
            </span>
            <span className="text-[10.5px] font-bold text-rose-600 block">
              Đã hết hạn
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 5: Nháp */}
        <div
          onClick={() => setSelectedStatus("DRAFT")}
          className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer shadow-2xs flex items-center justify-between gap-2 col-span-2 sm:col-span-1 ${
            selectedStatus === "DRAFT" ? "border-purple-500 ring-2 ring-purple-100" : "border-[#E2E8F0] hover:border-purple-300"
          }`}
        >
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-1 min-w-0">
            <span className="text-[11px] font-bold text-slate-500 block leading-tight truncate w-full">
              Nháp
            </span>
            <span className="text-2xl font-black text-slate-900 block leading-tight">
              {draftCount}
            </span>
            <span className="text-[10.5px] font-bold text-purple-600 block">
              Chưa đăng
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 shadow-xs">
            <FileEdit className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. MAIN CONTENT: TABLE (~76%) | RIGHT SIDEBAR (~24%)     */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start xl:h-[calc(100vh-270px)] min-h-0">
        {/* ====================================================== */}
        {/* CỘT TRÁI: TABLE CARD (xl:col-span-8 2xl:col-span-9)   */}
        {/* ====================================================== */}
        <div className="xl:col-span-8 2xl:col-span-9 bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs overflow-hidden flex flex-col xl:h-full min-h-0">
          {/* ---------------- 3.1 FILTER TOOLBAR (STICKY ON TOP) ---------------- */}
          <div className="p-3.5 sm:p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white/95 backdrop-blur-xs shrink-0 sticky top-0 z-20 shadow-2xs">
            {/* Search Bar */}
            <div className="relative min-w-[220px] flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Tìm kiếm tin tuyển dụng..."
                className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#0062ff] transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Vị trí */}
              <Select
                value={selectedPosition}
                onChange={(val) => {
                  setSelectedPosition(val);
                  setCurrentPage(1);
                }}
                className="min-w-[130px]"
                size="middle"
                options={[
                  { value: "all", label: "Tất cả vị trí" },
                  { value: "Product Manager", label: "Product Manager" },
                  { value: "UX/UI Designer", label: "UX/UI Designer" },
                  { value: "Frontend Developer", label: "Frontend Developer" },
                  { value: "Data Analyst", label: "Data Analyst" },
                  { value: "HR Generalist", label: "HR Generalist" },
                  { value: "DevOps Engineer", label: "DevOps Engineer" },
                ]}
              />

              {/* Trạng thái */}
              <Select
                value={selectedStatus}
                onChange={(val) => {
                  setSelectedStatus(val);
                  setCurrentPage(1);
                }}
                className="min-w-[140px]"
                size="middle"
                options={[
                  { value: "all", label: "Tất cả trạng thái" },
                  { value: "ACTIVE", label: "Đang hoạt động" },
                  { value: "EXPIRING", label: "Sắp hết hạn" },
                  { value: "EXPIRED", label: "Hết hạn" },
                  { value: "DRAFT", label: "Nháp" },
                  { value: "PENDING", label: "Chờ duyệt" },
                ]}
              />

              {/* Địa điểm */}
              <Select
                value={selectedLocation}
                onChange={(val) => {
                  setSelectedLocation(val);
                  setCurrentPage(1);
                }}
                className="min-w-[140px]"
                size="middle"
                options={[
                  { value: "all", label: "Tất cả địa điểm" },
                  { value: "Hà Nội", label: "Hà Nội" },
                  { value: "TP. Hồ Chí Minh", label: "TP. Hồ Chí Minh" },
                  { value: "Đà Nẵng", label: "Đà Nẵng" },
                ]}
              />

              {/* Sắp xếp */}
              <Select
                value={selectedSort}
                onChange={(val) => setSelectedSort(val)}
                className="min-w-[155px]"
                size="middle"
                options={[
                  { value: "newest", label: "Ngày tạo (Mới nhất)" },
                  { value: "oldest", label: "Ngày tạo (Cũ nhất)" },
                  { value: "applicants", label: "Nhiều ứng viên nhất" },
                  { value: "views", label: "Nhiều lượt xem nhất" },
                ]}
              />
            </div>
          </div>

          {/* ---------------- 3.2 JOB TABLE (SCROLLS INDEPENDENTLY) ---------------- */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-100 shadow-2xs">
                <tr className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 min-w-[260px] bg-slate-50">Vị trí tuyển dụng</th>
                  <th className="py-3 px-3 min-w-[130px] bg-slate-50">Trạng thái</th>
                  <th className="py-3 px-3 min-w-[110px] bg-slate-50">Địa điểm</th>
                  <th className="py-3 px-3 min-w-[90px] bg-slate-50">Ứng viên</th>
                  <th className="py-3 px-3 min-w-[80px] bg-slate-50">Lượt xem</th>
                  <th className="py-3 px-3 min-w-[90px] bg-slate-50">Ngày đăng</th>
                  <th className="py-3 px-3 min-w-[110px] bg-slate-50">Hết hạn</th>
                  <th className="py-3 px-3 text-right min-w-[100px] bg-slate-50">Thao tác</th>
                </tr>
              </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {paginatedJobs.length > 0 ? (
                    paginatedJobs.map((job) => {
                      const menuItems = getJobMenuItems(job);

                      return (
                        <tr
                          key={job.id}
                          onClick={() => setPreviewJob(job)}
                          className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                        >
                          {/* 1. Vị trí tuyển dụng */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-start gap-3">
                              {/* Logo */}
                              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 p-1.5 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                                </svg>
                              </div>

                              {/* Details */}
                              <div className="min-w-0 space-y-1">
                                <Link
                                  href={`/doanh-nghiep/tin-tuyen-dung/sua/${job.id}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="font-black text-slate-900 text-xs hover:text-[#0062ff] transition-colors block leading-tight truncate"
                                >
                                  {job.title}
                                </Link>
                                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                                  <span>Mã: {job.code}</span>
                                  <span>•</span>
                                  <span>{job.workType}</span>
                                </div>
                                {/* Skill Tags */}
                                <div className="flex items-center gap-1 flex-wrap pt-0.5">
                                  {job.skills.map((skill, sIdx) => (
                                    <span
                                      key={sIdx}
                                      className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[9.5px] font-semibold border border-slate-200/60"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 2. Trạng thái */}
                          <td className="py-3.5 px-3">
                            {renderStatusBadge(job.status)}
                          </td>

                          {/* 3. Địa điểm */}
                          <td className="py-3.5 px-3">
                            <span className="flex items-center gap-1 text-slate-600 font-semibold text-[11px]">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{job.location}</span>
                            </span>
                          </td>

                          {/* 4. Ứng viên */}
                          <td className="py-3.5 px-3">
                            {job.appliedTotal > 0 ? (
                              <Link
                                href={`/doanh-nghiep/ung-vien?jobId=${job.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-block group-hover:scale-105 transition-transform"
                              >
                                <div className="font-black text-slate-900 text-xs">
                                  {job.appliedTotal}
                                </div>
                                {job.appliedNew > 0 && (
                                  <div className="text-[10px] font-bold text-emerald-600">
                                    +{job.appliedNew} mới
                                  </div>
                                )}
                              </Link>
                            ) : (
                              <span className="text-slate-400 font-medium">0</span>
                            )}
                          </td>

                          {/* 5. Lượt xem */}
                          <td className="py-3.5 px-3 font-semibold text-slate-700 text-xs">
                            {job.views > 0 ? job.views.toLocaleString() : "0"}
                          </td>

                          {/* 6. Ngày đăng */}
                          <td className="py-3.5 px-3 text-[11px] text-slate-500 font-medium">
                            {job.publishedAt}
                          </td>

                          {/* 7. Hết hạn */}
                          <td className="py-3.5 px-3">
                            {job.daysRemaining !== null ? (
                              <div>
                                <div className="text-[11px] text-slate-700 font-semibold">
                                  {job.expiredAt}
                                </div>
                                {job.daysRemaining > 5 && (
                                  <div className="text-[10px] font-bold text-emerald-600">
                                    Còn {job.daysRemaining} ngày
                                  </div>
                                )}
                                {job.daysRemaining <= 5 && job.daysRemaining >= 0 && (
                                  <div className="text-[10px] font-bold text-amber-600">
                                    Còn {job.daysRemaining} ngày
                                  </div>
                                )}
                                {job.daysRemaining < 0 && (
                                  <div className="text-[10px] font-bold text-rose-600">
                                    Đã hết hạn
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>

                          {/* 8. Thao tác */}
                          <td className="py-3.5 px-3 text-right">
                            <div
                              className="flex items-center justify-end gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {/* 1. Analytics Button */}
                              <Tooltip title="Xem hiệu quả tin tuyển dụng">
                                <button
                                  type="button"
                                  aria-label="Xem hiệu quả tin tuyển dụng"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setAnalyticsJob(job);
                                  }}
                                  className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0062ff] flex items-center justify-center transition-colors cursor-pointer border border-blue-100 active:scale-95"
                                >
                                  <BarChart3 className="w-3.5 h-3.5" />
                                </button>
                              </Tooltip>

                              {/* 2. Edit Button */}
                              <Tooltip title="Chỉnh sửa tin tuyển dụng">
                                <Link
                                  href={`/doanh-nghiep/tin-tuyen-dung/sua/${job.id}`}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    type="button"
                                    aria-label="Chỉnh sửa tin tuyển dụng"
                                    className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer border border-slate-200/80 active:scale-95"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                </Link>
                              </Tooltip>

                              {/* 3. More Dropdown */}
                              <Tooltip title="Thao tác khác">
                                <Dropdown
                                  menu={{ items: menuItems }}
                                  trigger={["click"]}
                                  placement="bottomRight"
                                  arrow
                                >
                                  <button
                                    type="button"
                                    aria-label="Mở menu thao tác"
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
                          <div className="space-y-1">
                            <div className="font-bold text-slate-800 text-sm">
                              Không tìm thấy tin tuyển dụng phù hợp
                            </div>
                            <p className="text-xs text-slate-400">
                              Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSearchQuery("");
                              setSelectedStatus("all");
                              setSelectedLocation("all");
                              setSelectedPosition("all");
                            }}
                            className="px-3 py-1.5 rounded-xl bg-blue-50 text-[#0062ff] font-bold text-xs hover:bg-blue-100 transition-colors"
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

          {/* ---------------- 3.3 PAGINATION FOOTER ---------------- */}
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium bg-slate-50/30">
            <div>
              Hiển thị{" "}
              <strong className="text-slate-800 font-black">
                {filteredJobs.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} -{" "}
                {Math.min(currentPage * pageSize, filteredJobs.length)}
              </strong>{" "}
              trong tổng số{" "}
              <strong className="text-slate-800 font-black">{filteredJobs.length}</strong> tin
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="w-8 h-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shadow-2xs transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-xl font-bold transition-all ${
                    currentPage === page
                      ? "bg-[#0062ff] text-white shadow-xs font-black"
                      : "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="w-8 h-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shadow-2xs transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="ml-2 pl-2 border-l border-slate-200">
                <span className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
                  {pageSize} / trang
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ====================================================== */}
        {/* CỘT PHẢI: RIGHT SIDEBAR STACK (xl:col-span-4 2xl:col-span-3) */}
        {/* ====================================================== */}
        <div className="xl:col-span-4 2xl:col-span-3 xl:h-full min-h-0 xl:overflow-y-auto space-y-4 pr-0.5 xl:pb-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300">
          {/* ---------------- 1. HIỆU QUẢ TUYỂN DỤNG (DONUT CHART) ---------------- */}
          <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h3 className="text-xs sm:text-[13.5px] font-black text-slate-900 m-0">
                Hiệu quả tuyển dụng
              </h3>
              <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10.5px] font-bold">
                30 ngày ▾
              </span>
            </div>

            {/* Donut Chart Ring */}
            <div className="flex flex-col items-center justify-center pt-2">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  {/* Background Track */}
                  <circle cx="60" cy="60" r="48" fill="none" stroke="#f1f5f9" strokeWidth="13" />

                  {/* Segment 1: Ứng viên mới (49.7% = 150) -> Blue */}
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    fill="none"
                    stroke="#0062ff"
                    strokeWidth="13"
                    strokeDasharray="150 301.5"
                    strokeDashoffset="0"
                    strokeLinecap="round"
                  />

                  {/* Segment 2: Ứng viên phù hợp (26.3% = 79) -> Emerald */}
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="13"
                    strokeDasharray="79 301.5"
                    strokeDashoffset="-155"
                    strokeLinecap="round"
                  />

                  {/* Segment 3: Đang phỏng vấn (15.4% = 46) -> Amber */}
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="13"
                    strokeDasharray="46 301.5"
                    strokeDashoffset="-238"
                    strokeLinecap="round"
                  />

                  {/* Segment 4: Đã từ chối (8.6% = 26) -> Purple */}
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    fill="none"
                    stroke="#9333ea"
                    strokeWidth="13"
                    strokeDasharray="26 301.5"
                    strokeDashoffset="-288"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Donut Center */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-black text-slate-900 leading-none">
                    1,248
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                    Tổng ứng viên
                  </span>
                </div>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="space-y-2 pt-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600 font-medium text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0062ff]" />
                  <span>Ứng viên mới</span>
                </span>
                <span className="font-bold text-slate-800 text-[11px]">
                  620 <span className="text-slate-400 text-[10px] font-normal">(49.7%)</span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600 font-medium text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Ứng viên phù hợp</span>
                </span>
                <span className="font-bold text-slate-800 text-[11px]">
                  328 <span className="text-slate-400 text-[10px] font-normal">(26.3%)</span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600 font-medium text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>Đang phỏng vấn</span>
                </span>
                <span className="font-bold text-slate-800 text-[11px]">
                  192 <span className="text-slate-400 text-[10px] font-normal">(15.4%)</span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600 font-medium text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                  <span>Đã từ chối</span>
                </span>
                <span className="font-bold text-slate-800 text-[11px]">
                  108 <span className="text-slate-400 text-[10px] font-normal">(8.6%)</span>
                </span>
              </div>
            </div>
          </div>

          {/* ---------------- 2. TIN TUYỂN DỤNG NỔI BẬT ---------------- */}
          <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h3 className="text-xs sm:text-[13.5px] font-black text-slate-900 m-0">
                Tin tuyển dụng nổi bật
              </h3>
              <Link
                href="/doanh-nghiep/tin-tuyen-dung"
                className="text-[11px] font-bold text-[#0062ff] hover:underline"
              >
                Xem tất cả
              </Link>
            </div>

            <div className="space-y-3">
              {/* Item 1 */}
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-black text-slate-900 truncate block">
                      Product Manager
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold block">
                      Ứng viên phù hợp cao
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-black text-[10px] border border-emerald-200 shrink-0">
                  95%
                </span>
              </div>

              {/* Item 2 */}
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-black text-slate-900 truncate block">
                      Senior UX/UI Designer
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold block">
                      Ứng viên phù hợp cao
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-black text-[10px] border border-emerald-200 shrink-0">
                  92%
                </span>
              </div>

              {/* Item 3 */}
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-black text-slate-900 truncate block">
                      Frontend Developer
                    </span>
                    <span className="text-[10px] text-purple-600 font-bold block flex items-center gap-1">
                      <span>⚡ Lượt xem cao nhất</span>
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-black text-[10px] border border-purple-200 shrink-0">
                  1.2K
                </span>
              </div>

              {/* Item 4 */}
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-black text-slate-900 truncate block">
                      Data Analyst
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold block flex items-center gap-1">
                      <span>⚡ Ứng viên mới nhiều</span>
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-black text-[10px] border border-emerald-200 shrink-0">
                  +12
                </span>
              </div>
            </div>
          </div>

          {/* ---------------- 3. THAO TÁC NHANH (2x3 GRID) ---------------- */}
          <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-2xs space-y-3">
            <h3 className="text-xs sm:text-[13.5px] font-black text-slate-900 m-0">
              Thao tác nhanh
            </h3>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {/* Action 1 */}
              <Link href="/doanh-nghiep/tin-tuyen-dung/them-moi" className="block group">
                <div className="p-3 bg-blue-50/70 hover:bg-blue-100 rounded-xl border border-blue-100 text-center space-y-1.5 transition-all h-full flex flex-col items-center justify-center cursor-pointer">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-2xs">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-blue-900 block leading-tight">
                    Đăng tin
                  </span>
                </div>
              </Link>

              {/* Action 2 */}
              <Link href="/doanh-nghiep/ung-vien" className="block group">
                <div className="p-3 bg-emerald-50/70 hover:bg-emerald-100 rounded-xl border border-emerald-100 text-center space-y-1.5 transition-all h-full flex flex-col items-center justify-center cursor-pointer">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                    <Search className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-900 block leading-tight">
                    Tìm ứng viên
                  </span>
                </div>
              </Link>

              {/* Action 3 */}
              <Link href="/doanh-nghiep/ung-vien" className="block group">
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
              <Link href="/doanh-nghiep/tin-tuyen-dung/them-moi" className="block group">
                <div className="p-3 bg-amber-50/70 hover:bg-amber-100 rounded-xl border border-amber-100 text-center space-y-1.5 transition-all h-full flex flex-col items-center justify-center cursor-pointer">
                  <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-2xs">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-bold text-amber-900 block leading-tight">
                    Mẫu JD
                  </span>
                </div>
              </Link>

              {/* Action 5 */}
              <Link href="/doanh-nghiep/dashboard" className="block group">
                <div className="p-3 bg-cyan-50/70 hover:bg-cyan-100 rounded-xl border border-cyan-100 text-center space-y-1.5 transition-all h-full flex flex-col items-center justify-center cursor-pointer">
                  <div className="w-7 h-7 rounded-lg bg-cyan-600 text-white flex items-center justify-center shadow-2xs">
                    <BarChart3 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-bold text-cyan-900 block leading-tight">
                    Báo cáo
                  </span>
                </div>
              </Link>

              {/* Action 6 */}
              <div
                onClick={() => message.info("Tính năng Chat với ứng viên đang được tích hợp")}
                className="p-3 bg-rose-50/70 hover:bg-rose-100 rounded-xl border border-rose-100 text-center space-y-1.5 transition-all h-full flex flex-col items-center justify-center cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-2xs">
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-bold text-rose-900 block leading-tight">
                  Chat
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. MODAL: HIỆU QUẢ TIN TUYỂN DỤNG CHI TIẾT (ANALYTICS)   */}
      {/* ======================================================== */}
      <Modal
        open={!!analyticsJob}
        onCancel={() => setAnalyticsJob(null)}
        footer={null}
        width={840}
        centered
        destroyOnHidden
        title={null}
      >
        {analyticsJob && (
          <div className="space-y-6 p-2">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-[#0062ff] text-[11px] font-black border border-blue-100">
                    Mã: {analyticsJob.code}
                  </span>
                  {renderStatusBadge(analyticsJob.status)}
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 m-0 leading-tight">
                  {analyticsJob.title}
                </h2>
                <div className="flex items-center gap-4 text-xs text-slate-500 font-medium flex-wrap pt-0.5">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{analyticsJob.location}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>{analyticsJob.workType}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{analyticsJob.salaryText}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* 4 Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-100/90 text-center space-y-1 shadow-2xs">
                <span className="text-xs font-bold text-purple-700 block">Lượt xem tin</span>
                <span className="text-2xl sm:text-3xl font-black text-purple-900 block leading-tight">
                  {analyticsJob.views.toLocaleString()}
                </span>
                <span className="text-[10px] text-purple-600 font-bold block pt-0.5">+15% so với tuần trước</span>
              </div>

              <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-100/90 text-center space-y-1 shadow-2xs">
                <span className="text-xs font-bold text-blue-700 block">Tổng ứng viên</span>
                <span className="text-2xl sm:text-3xl font-black text-blue-900 block leading-tight">
                  {analyticsJob.appliedTotal}
                </span>
                <span className="text-[10px] text-blue-600 font-bold block pt-0.5">+{analyticsJob.appliedNew} mới tuần này</span>
              </div>

              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100/90 text-center space-y-1 shadow-2xs">
                <span className="text-xs font-bold text-emerald-700 block">Tỷ lệ ứng tuyển</span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-900 block leading-tight">
                  {((analyticsJob.appliedTotal / Math.max(analyticsJob.views, 1)) * 100).toFixed(1)}%
                </span>
                <span className="text-[10px] text-emerald-600 font-bold block pt-0.5">Cao hơn mức TB ngành</span>
              </div>

              <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-100/90 text-center space-y-1 shadow-2xs">
                <span className="text-xs font-bold text-amber-700 block">Thời hạn còn lại</span>
                <span className="text-2xl sm:text-3xl font-black text-amber-900 block leading-tight">
                  {analyticsJob.daysRemaining !== null && analyticsJob.daysRemaining >= 0
                    ? `${analyticsJob.daysRemaining} ngày`
                    : "Hết hạn"}
                </span>
                <span className="text-[10px] text-slate-500 font-medium block pt-0.5">{analyticsJob.expiredAt}</span>
              </div>
            </div>

            {/* Phễu chuyển đổi tuyển dụng (Application Funnel) */}
            <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-[13px] font-black text-slate-900 m-0 uppercase tracking-wider">
                  Phễu xử lý hồ sơ ứng viên
                </h4>
                <span className="text-[11px] text-slate-400 font-medium">Tỷ lệ chuyển đổi qua các vòng</span>
              </div>

              <div className="space-y-3.5 text-xs">
                {/* Stage 1 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold text-slate-700 text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#0062ff]" />
                      <span>1. Nộp hồ sơ (Ứng tuyển)</span>
                    </span>
                    <span className="text-[#0062ff] font-black">{analyticsJob.appliedTotal} ứng viên (100%)</span>
                  </div>
                  <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-[#0062ff] h-full rounded-full w-full transition-all duration-500" />
                  </div>
                </div>

                {/* Stage 2 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold text-slate-700 text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>2. Sàng lọc hồ sơ (Phù hợp)</span>
                    </span>
                    <span className="text-emerald-600 font-black">
                      {Math.round(analyticsJob.appliedTotal * 0.65)} ứng viên ({analyticsJob.appliedTotal > 0 ? "65%" : "0%"})
                    </span>
                  </div>
                  <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: analyticsJob.appliedTotal > 0 ? "65%" : "0%" }}
                    />
                  </div>
                </div>

                {/* Stage 3 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold text-slate-700 text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>3. Phỏng vấn chuyên sâu</span>
                    </span>
                    <span className="text-amber-600 font-black">
                      {Math.round(analyticsJob.appliedTotal * 0.3)} ứng viên ({analyticsJob.appliedTotal > 0 ? "30%" : "0%"})
                    </span>
                  </div>
                  <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: analyticsJob.appliedTotal > 0 ? "30%" : "0%" }}
                    />
                  </div>
                </div>

                {/* Stage 4 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold text-slate-700 text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-600" />
                      <span>4. Gửi Offer & Tuyển dụng thành công</span>
                    </span>
                    <span className="text-purple-600 font-black">
                      {Math.round(analyticsJob.appliedTotal * 0.12)} ứng viên ({analyticsJob.appliedTotal > 0 ? "12%" : "0%"})
                    </span>
                  </div>
                  <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-600 h-full rounded-full transition-all duration-500"
                      style={{ width: analyticsJob.appliedTotal > 0 ? "12%" : "0%" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAnalyticsJob(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-all cursor-pointer"
              >
                Đóng
              </button>

              <div className="flex items-center gap-3">
                <Link href={`/doanh-nghiep/tin-tuyen-dung/sua/${analyticsJob.id}`}>
                  <button
                    type="button"
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5 text-slate-600" />
                    <span>Chỉnh sửa tin</span>
                  </button>
                </Link>

                <Link href={`/doanh-nghiep/ung-vien?jobId=${analyticsJob.id}`}>
                  <button
                    type="button"
                    className="px-5 py-2.5 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-98"
                  >
                    <Users className="w-4 h-4" />
                    <span>Xem {analyticsJob.appliedTotal} ứng viên</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ======================================================== */}
      {/* 5. MODAL: GIA HẠN TIN TUYỂN DỤNG (RENEWAL MODAL)         */}
      {/* ======================================================== */}
      <Modal
        open={!!renewJob}
        onCancel={() => setRenewJob(null)}
        footer={null}
        width={480}
        centered
        destroyOnHidden
        title={null}
      >
        {renewJob && (
          <div className="space-y-4 p-1">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0062ff] flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 m-0">Gia hạn tin tuyển dụng</h3>
                <span className="text-xs text-slate-500 font-medium">{renewJob.title} ({renewJob.code})</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Chọn thời gian gia hạn:</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { days: 15, label: "15 ngày", sub: "Gia hạn ngắn" },
                  { days: 30, label: "30 ngày", sub: "Phổ biến nhất" },
                  { days: 60, label: "60 ngày", sub: "Tiết kiệm 20%" },
                ].map((item) => (
                  <div
                    key={item.days}
                    onClick={() => setRenewalDays(item.days)}
                    className={`p-3 rounded-2xl border text-center cursor-pointer transition-all ${
                      renewalDays === item.days
                        ? "bg-blue-50/80 border-[#0062ff] ring-2 ring-blue-100"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-sm font-black text-slate-900 block leading-tight">{item.label}</span>
                    <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{item.sub}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs text-slate-600 space-y-1 font-medium">
              <div className="flex justify-between">
                <span>Trạng thái sau gia hạn:</span>
                <strong className="text-emerald-600 font-black">Đang hoạt động</strong>
              </div>
              <div className="flex justify-between">
                <span>Số ngày hiệu lực mới:</span>
                <strong className="text-slate-800 font-black">+{renewalDays} ngày</strong>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRenewJob(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                onClick={handleConfirmRenewal}
                className="px-5 py-2 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-black text-xs shadow-md transition-all cursor-pointer active:scale-98"
              >
                Xác nhận gia hạn
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ======================================================== */}
      {/* 6. MODAL: XEM TRƯỚC CHI TIẾT TIN (QUICK PREVIEW)        */}
      {/* ======================================================== */}
      <Modal
        open={!!previewJob}
        onCancel={() => setPreviewJob(null)}
        footer={null}
        width={640}
        centered
        destroyOnHidden
        title={null}
      >
        {previewJob && (
          <div className="space-y-4 p-1">
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-[#0062ff] text-[10px] font-bold">
                    Mã: {previewJob.code}
                  </span>
                  {renderStatusBadge(previewJob.status)}
                </div>
                <h3 className="text-lg font-black text-slate-900 m-0">{previewJob.title}</h3>
                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                  <span>📍 {previewJob.location}</span>
                  <span>•</span>
                  <span>🕒 {previewJob.workType}</span>
                  <span>•</span>
                  <span>💼 {previewJob.experience}</span>
                  <span>•</span>
                  <span>💵 {previewJob.salaryText}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div>
                <span className="font-bold text-slate-900 block pb-1">Kỹ năng yêu cầu:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {previewJob.skills.map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[10.5px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1.5">
                <div className="flex justify-between text-[11.5px]">
                  <span className="text-slate-500">Ngày đăng tin:</span>
                  <strong className="text-slate-800">{previewJob.publishedAt}</strong>
                </div>
                <div className="flex justify-between text-[11.5px]">
                  <span className="text-slate-500">Hạn nộp hồ sơ:</span>
                  <strong className="text-slate-800">{previewJob.expiredAt}</strong>
                </div>
                <div className="flex justify-between text-[11.5px]">
                  <span className="text-slate-500">Hồ sơ đã nhận:</span>
                  <strong className="text-[#0062ff]">{previewJob.appliedTotal} ứng viên</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setPreviewJob(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-all cursor-pointer"
              >
                Đóng
              </button>

              <div className="flex items-center gap-2">
                <Link href={`/doanh-nghiep/tin-tuyen-dung/sua/${previewJob.id}`}>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Chỉnh sửa</span>
                  </button>
                </Link>

                <Link href={`/viec-lam/${previewJob.id}`} target="_blank">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Xem bài đăng công khai</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function EmployerJobsPage() {
  return (
    <App>
      <EmployerJobsContent />
    </App>
  );
}
