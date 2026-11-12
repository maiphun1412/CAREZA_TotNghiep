"use client";

import { useState, useMemo, useEffect, useCallback, Suspense, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { employerService } from "@/services/employer.service";
import { MoreOutlined } from "@ant-design/icons";
import { CarezaExportReport } from "@/components/common/CarezaExportReport";

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
  X,
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
  Upload,
} from "lucide-react";

// =====================================================================
// DATA TYPES
// =====================================================================
export interface Candidate {
  id: string;
  jobId?: string | number;
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
  appliedAtRaw?: number;
  appliedTimeAgo: string;
  cvName: string;
  cvFileUrl?: string | null;
  matchScore?: number | null;
  coverLetter?: string;
  experienceYears: number;
  skills: string[];
  notes?: string;
}

// =====================================================================
// MOCK CANDIDATE DATASET (MATCHING REFERENCE EXACTLY)
// =====================================================================
const INITIAL_CANDIDATES: Candidate[] = [];

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
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobsList, setJobsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Modal Thêm ứng viên thủ công
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    phone: "",
    jobId: undefined as string | number | undefined,
    notes: "",
  });
  const [addFile, setAddFile] = useState<File | null>(null);
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load danh sách tin tuyển dụng thật của doanh nghiệp
  useEffect(() => {
    employerService
      .getJobs({ page_size: 100 })
      .then((res) => {
        const items = res?.data?.items || [];
        setJobsList(items);
      })
      .catch(() => setJobsList([]));
  }, []);

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await employerService.getApplications({
        jobId: selectedJob !== "all" ? selectedJob : undefined,
        search: searchQuery.trim() || undefined,
      });
      const list = res?.data?.applications || [];
      const mapped = list.map((app: any) => {
        const s = String(app.status || "").toLowerCase();
        const mappedStatus =
          s === "submitted"
            ? "NEW"
            : s === "screening"
              ? "REVIEWING"
              : s === "shortlisted" || s === "test"
                ? "MATCHED"
                : s === "interview"
                  ? "INTERVIEW"
                  : s === "offered" || s === "hired"
                    ? "OFFER"
                    : s === "rejected"
                      ? "REJECTED"
                      : "NEW";

        return {
          id: String(app.id),
          jobId: app.job?.id,
          name: app.candidate?.full_name || app.candidate?.name || "Ứng viên",
          email: app.candidate?.email || "",
          phone: app.candidate?.phone || "",
          avatar:
            app.candidate?.avatar_url ||
            app.candidate?.avatar ||
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          isNew: s === "submitted",
          jobTitle: app.job?.title || "Vị trí tuyển dụng",
          jobCode: app.job?.slug || `JD-${app.job?.id || ""}`,
          source: app.source || "CAREZA Portal",
          status: mappedStatus as Candidate["status"],
          rating: app.rating || 4,
          appliedAt: app.applied_at
            ? new Date(app.applied_at).toLocaleDateString("vi-VN")
            : "Hôm nay",
          appliedAtRaw: app.applied_at ? new Date(app.applied_at).getTime() : 0,
          appliedTimeAgo: "Gần đây",
          cvName: app.cv?.title || "CV_Ung_Vien.pdf",
          cvFileUrl: app.cv?.file_url || null,
          matchScore: typeof app.match_score === "number" ? app.match_score : null,
          coverLetter: app.cover_letter || "",
          experienceYears: app.candidate?.experience_years || 2,
          skills: app.candidate?.skills || [],
          notes: app.note || "",
        };
      });
      setCandidates(mapped);
    } catch {
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }, [selectedJob, searchQuery]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  // KPI Calculations từ danh sách thực tế
  const totalCount = candidates.length;
  const newCount = candidates.filter((c) => c.status === "NEW").length;
  const matchedCount = candidates.filter((c) => c.status === "MATCHED").length;
  const interviewCount = candidates.filter((c) => c.status === "INTERVIEW").length;
  const offerCount = candidates.filter((c) => c.status === "OFFER").length;
  const reviewingCount = candidates.filter((c) => c.status === "REVIEWING").length;
  const rejectedCount = candidates.filter((c) => c.status === "REJECTED").length;
  const archivedCount = candidates.filter((c) => c.status === "ARCHIVED").length;

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

  const handleChangeStatus = async (id: string, newStatus: Candidate["status"]) => {
    const stageMap: Record<string, string> = {
      NEW: "submitted",
      REVIEWING: "screening",
      MATCHED: "shortlisted",
      INTERVIEW: "interview",
      OFFER: "offered",
      REJECTED: "rejected",
      ARCHIVED: "withdrawn",
    };
    try {
      await employerService.changeStage(id, stageMap[newStatus] || "submitted");
      setCandidates((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );
      message.success("Đã cập nhật trạng thái ứng viên!");
    } catch {
      message.error("Lỗi cập nhật trạng thái trên hệ thống.");
    }
  };

  const handleBulkMoveStage = async (targetStatus: Candidate["status"]) => {
    const stageMap: Record<string, string> = {
      NEW: "submitted",
      REVIEWING: "screening",
      MATCHED: "shortlisted",
      INTERVIEW: "interview",
      OFFER: "offered",
      REJECTED: "rejected",
      ARCHIVED: "withdrawn",
    };
    try {
      await Promise.all(
        selectedIds.map((id) => employerService.changeStage(id, stageMap[targetStatus] || "submitted"))
      );
      setCandidates((prev) =>
        prev.map((c) => (selectedIds.includes(c.id) ? { ...c, status: targetStatus } : c))
      );
      message.success(`Đã chuyển trạng thái cho ${selectedIds.length} ứng viên!`);
      setSelectedIds([]);
    } catch {
      message.error("Lỗi cập nhật hàng loạt trạng thái.");
    }
  };

  const handleBulkAddToTalentPool = () => {
    message.success(`Đã lưu ${selectedIds.length} ứng viên vào Talent Pool!`);
    setSelectedIds([]);
  };

  const handleScheduleInterviewConfirm = async () => {
    if (!interviewCandidate) return;
    try {
      await employerService.createInterview({
        application_id: Number(interviewCandidate.id),
        interview_type: interviewType,
        scheduled_at: interviewDate || new Date().toISOString(),
      });
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === interviewCandidate.id ? { ...c, status: "INTERVIEW" } : c
        )
      );
      message.success(`Đã lên lịch phỏng vấn cho ứng viên "${interviewCandidate.name}" thành công!`);
      setInterviewCandidate(null);
    } catch {
      message.error("Lên lịch phỏng vấn thất bại.");
    }
  };

  // Handlers cho Thêm ứng viên thủ công
  const handleOpenAddModal = () => {
    const defaultJobId =
      selectedJob && selectedJob !== "all"
        ? (isNaN(Number(selectedJob)) ? undefined : Number(selectedJob))
        : jobsList.length > 0
          ? jobsList[0].id
          : undefined;

    setAddForm({
      name: "",
      email: "",
      phone: "",
      jobId: defaultJobId,
      notes: "",
    });
    setAddFile(null);
    setAddErrors({});
    setIsAddModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Giới hạn 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setAddErrors((prev) => ({
        ...prev,
        file: "Dung lượng file CV không được vượt quá 10MB.",
      }));
      return;
    }

    // Kiểm tra đuôi file: pdf, doc, docx
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !["pdf", "doc", "docx"].includes(ext)) {
      setAddErrors((prev) => ({
        ...prev,
        file: "Định dạng file không hợp lệ. Vui lòng chọn file PDF, DOC hoặc DOCX.",
      }));
      return;
    }

    setAddErrors((prev) => {
      const next = { ...prev };
      delete next.file;
      return next;
    });
    setAddFile(file);
  };

  const handleRemoveFile = () => {
    setAddFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setAddErrors((prev) => {
      const next = { ...prev };
      delete next.file;
      return next;
    });
  };

  const handleSubmitAddCandidate = async () => {
    const errors: Record<string, string> = {};

    if (!addForm.name.trim()) {
      errors.name = "Vui lòng nhập họ và tên ứng viên.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!addForm.email.trim()) {
      errors.email = "Vui lòng nhập địa chỉ email.";
    } else if (!emailRegex.test(addForm.email.trim())) {
      errors.email = "Email không đúng định dạng.";
    }

    if (!addForm.phone.trim()) {
      errors.phone = "Vui lòng nhập số điện thoại.";
    }

    if (!addForm.jobId) {
      errors.jobId = "Vui lòng chọn vị trí tuyển dụng.";
    }

    if (Object.keys(errors).length > 0) {
      setAddErrors(errors);
      return;
    }

    setIsSubmittingAdd(true);
    try {
      const formData = new FormData();
      formData.append("name", addForm.name.trim());
      formData.append("email", addForm.email.trim());
      formData.append("phone", addForm.phone.trim());
      formData.append("job_id", String(addForm.jobId));
      if (addForm.notes.trim()) {
        formData.append("notes", addForm.notes.trim());
      }
      if (addFile) {
        formData.append("file", addFile);
      }

      const res = await employerService.createManualApplication(formData);
      if (res?.success) {
        message.success(res?.message || "Thêm ứng viên thành công!");
        setIsAddModalOpen(false);
        setAddForm({
          name: "",
          email: "",
          phone: "",
          jobId: undefined,
          notes: "",
        });
        setAddFile(null);
        setAddErrors({});
        await fetchCandidates();
      } else {
        message.error(res?.message || "Không thể thêm ứng viên. Vui lòng kiểm tra lại.");
      }
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Có lỗi xảy ra khi thêm ứng viên. Vui lòng thử lại.";
      message.error(errMsg);
    } finally {
      setIsSubmittingAdd(false);
    }
  };


  // Filtered dataset
  const filteredCandidates = useMemo(() => {
    const list = candidates.filter((c) => {
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

      // Job Code or Job ID
      if (selectedJob !== "all" && String(c.jobId) !== selectedJob && c.jobCode !== selectedJob) return false;

      // Position
      if (selectedPosition !== "all" && !c.jobTitle.includes(selectedPosition)) return false;

      // Source
      if (selectedSource !== "all" && c.source !== selectedSource) return false;

      // Status dropdown
      if (selectedStatus !== "all" && c.status !== selectedStatus) return false;

      return true;
    });

    const sorted = [...list];
    if (selectedSort === "rating-high") {
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (selectedSort === "match-score") {
      sorted.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    } else if (selectedSort === "name-az") {
      sorted.sort((a, b) => a.name.localeCompare(b.name, "vi"));
    } else {
      sorted.sort((a, b) => (b.appliedAtRaw || 0) - (a.appliedAtRaw || 0));
    }
    return sorted;
  }, [
    candidates,
    activeTab,
    searchQuery,
    selectedJob,
    selectedPosition,
    selectedSource,
    selectedStatus,
    selectedSort,
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
            className="flex items-center gap-2.5 w-full text-slate-700 hover:text-blue-600 font-medium cursor-pointer"
          >
            <Eye className="w-4 h-4 text-blue-600 shrink-0" />
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
            className="flex items-center gap-2.5 w-full text-slate-700 hover:text-emerald-600 font-medium cursor-pointer"
          >
            <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
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
            className="flex items-center gap-2.5 w-full text-slate-700 hover:text-amber-600 font-medium cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
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
            className="flex items-center gap-2.5 w-full text-slate-700 hover:text-purple-600 font-medium cursor-pointer"
          >
            <FolderPlus className="w-4 h-4 text-purple-600 shrink-0" />
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
            className="flex items-center gap-2.5 w-full text-blue-600 font-medium cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span>Gửi tin nhắn</span>
          </div>
        ),
      },
      { type: "divider" as const, style: { margin: "4px 0" } },
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
              className="flex items-center gap-2.5 w-full text-rose-600 cursor-pointer font-medium"
            >
              <XCircle className="w-4 h-4 shrink-0" />
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
            className="flex items-center gap-2.5 w-full text-emerald-600 font-medium cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 shrink-0" />
            <span>Khôi phục xem xét lại</span>
          </div>
        ),
      });
    }

    return items;
  };

  return (
    <div className="space-y-4 max-w-[1680px] mx-auto w-full pb-8">
      {/* ======================================================== */}
      {/* 1. PAGE HEADER (TITLE & ACTION BUTTONS)                  */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h1 className="text-[20px] font-bold text-[#17233B] m-0 tracking-tight leading-snug">
            Quản lý ứng viên
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <CarezaExportReport
            buttonText="Xuất báo cáo"
            reportTitle="BÁO CÁO QUẢN LÝ ỨNG VIÊN"
            companyName={(user as any)?.companyName || "Google Vietnam"}
            recruiterName={recruiterName}
            data={filteredCandidates}
            filenamePrefix="careza_ung_vien"
            columns={[
              { header: "STT", render: (_, i) => i + 1 },
              { header: "Họ và tên", key: "name" },
              { header: "Email", key: "email" },
              { header: "Số điện thoại", key: "phone" },
              { header: "Vị trí ứng tuyển", key: "jobTitle" },
              { header: "Mã tin", key: "jobCode" },
              { header: "Nguồn", key: "source" },
              {
                header: "Trạng thái",
                render: (c) =>
                  c.status === "NEW"
                    ? "Mới"
                    : c.status === "REVIEWING"
                      ? "Đánh giá"
                      : c.status === "MATCHED"
                        ? "Phù hợp"
                        : c.status === "INTERVIEW"
                          ? "Phỏng vấn"
                          : c.status === "OFFER"
                            ? "Offer"
                            : c.status === "REJECTED"
                              ? "Đã từ chối"
                              : "Lưu trữ",
              },
              { header: "Điểm AI (%)", render: (c) => c.matchScore ?? "-" },
              { header: "Đánh giá", render: (c) => `${c.rating}/5 sao` },
              { header: "Kinh nghiệm", render: (c) => `${c.experienceYears} năm` },
              { header: "Ngày nộp", key: "appliedAt" },
            ]}
            extraStats={[
              { label: "Tổng ứng viên", value: totalCount },
              { label: "Ứng viên mới", value: newCount },
              { label: "Phù hợp", value: matchedCount },
              { label: "Đang phỏng vấn", value: interviewCount },
              { label: "Đã nhận offer", value: offerCount },
            ]}
          />

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="h-[34px] px-3.5 rounded-lg bg-[#155EEF] hover:bg-[#1047B8] text-white font-medium text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
          >
            <UserPlus className="w-4 h-4" />
            <span>Thêm ứng viên</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. 5 KPI CARDS                                           */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {/* Card 1: Tổng ứng viên */}
        <div
          onClick={() => setActiveTab("all")}
          className={`bg-white rounded-xl px-3.5 py-3 border transition-all cursor-pointer shadow-2xs flex items-center gap-3 h-[86px] ${activeTab === "all" ? "border-[#155EEF] bg-[#F8FAFC]" : "border-[#CBD5E1] hover:border-[#155EEF]/50"
            }`}
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#155EEF] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center items-center text-center">
            <span className="text-[12px] font-semibold text-[#475569] block leading-tight truncate w-full">
              Tổng ứng viên
            </span>
            <span className="text-[22px] font-bold text-[#17233B] block leading-none my-1">
              {totalCount.toLocaleString()}
            </span>
            <span className="text-[11px] text-[#64748B] font-normal block leading-tight truncate w-full">
              Toàn bộ hồ sơ
            </span>
          </div>
        </div>

        {/* Card 2: Ứng viên mới */}
        <div
          onClick={() => setActiveTab("NEW")}
          className={`bg-white rounded-xl px-3.5 py-3 border transition-all cursor-pointer shadow-2xs flex items-center gap-3 h-[86px] ${activeTab === "NEW" ? "border-[#155EEF] bg-[#F8FAFC]" : "border-[#CBD5E1] hover:border-[#155EEF]/50"
            }`}
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center items-center text-center">
            <span className="text-[12px] font-semibold text-[#475569] block leading-tight truncate w-full">
              Ứng viên mới
            </span>
            <span className="text-[22px] font-bold text-[#17233B] block leading-none my-1">
              {newCount}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center justify-center gap-0.5 leading-tight truncate w-full">
              <TrendingUp className="w-3 h-3 shrink-0" />
              <span>Chưa xử lý</span>
            </span>
          </div>
        </div>

        {/* Card 3: Phù hợp */}
        <div
          onClick={() => setActiveTab("MATCHED")}
          className={`bg-white rounded-xl px-3.5 py-3 border transition-all cursor-pointer shadow-2xs flex items-center gap-3 h-[86px] ${activeTab === "MATCHED" ? "border-[#155EEF] bg-[#F8FAFC]" : "border-[#CBD5E1] hover:border-[#155EEF]/50"
            }`}
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 fill-purple-600" />
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center items-center text-center">
            <span className="text-[12px] font-semibold text-[#475569] block leading-tight truncate w-full">
              Phù hợp
            </span>
            <span className="text-[22px] font-bold text-[#17233B] block leading-none my-1">
              {matchedCount}
            </span>
            <span className="text-[11px] text-purple-600 font-medium block leading-tight truncate w-full">
              Điểm AI cao
            </span>
          </div>
        </div>

        {/* Card 4: Đang phỏng vấn */}
        <div
          onClick={() => setActiveTab("INTERVIEW")}
          className={`bg-white rounded-xl px-3.5 py-3 border transition-all cursor-pointer shadow-2xs flex items-center gap-3 h-[86px] ${activeTab === "INTERVIEW" ? "border-[#155EEF] bg-[#F8FAFC]" : "border-[#CBD5E1] hover:border-[#155EEF]/50"
            }`}
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center items-center text-center">
            <span className="text-[12px] font-semibold text-[#475569] block leading-tight truncate w-full">
              Đang phỏng vấn
            </span>
            <span className="text-[22px] font-bold text-[#17233B] block leading-none my-1">
              {interviewCount}
            </span>
            <span className="text-[11px] text-amber-600 font-medium block leading-tight truncate w-full">
              Lịch phỏng vấn
            </span>
          </div>
        </div>

        {/* Card 5: Đã nhận offer */}
        <div
          onClick={() => setActiveTab("OFFER")}
          className={`bg-white rounded-xl px-3.5 py-3 border transition-all cursor-pointer shadow-2xs flex items-center gap-3 h-[86px] ${activeTab === "OFFER" ? "border-[#155EEF] bg-[#F8FAFC]" : "border-[#CBD5E1] hover:border-[#155EEF]/50"
            }`}
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center items-center text-center">
            <span className="text-[12px] font-semibold text-[#475569] block leading-tight truncate w-full">
              Đã nhận offer
            </span>
            <span className="text-[22px] font-bold text-[#17233B] block leading-none my-1">
              {offerCount}
            </span>
            <span className="text-[11px] text-rose-600 font-medium block leading-tight truncate w-full">
              Đạt kết quả
            </span>
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
        <div className="xl:col-span-8 2xl:col-span-9 bg-white rounded-2xl border border-[#CBD5E1] shadow-2xs overflow-hidden flex flex-col xl:h-full min-h-0">
          {/* Top Sticky Toolbar: Filters & Search (Gộp thành 1 hàng duy nhất) */}
          <div className="p-2.5 sm:p-3 border-b border-[#CBD5E1] bg-white/95 backdrop-blur-xs shrink-0 sticky top-0 z-20 shadow-2xs overflow-x-auto [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
            <div className="flex items-center gap-2 text-xs min-w-max">
              {/* 1. Tìm kiếm ứng viên */}
              <div className="relative w-[160px] xl:w-[175px] shrink-0">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm ứng viên..."
                  className="w-full h-[34px] pl-7.5 pr-7 py-1 bg-white border border-[#CBD5E1] rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#155EEF] transition-all shadow-2xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* 2. Tin tuyển dụng */}
              <Select
                value={selectedJob}
                onChange={setSelectedJob}
                className="w-[145px] xl:w-[155px] shrink-0 [&_.ant-select-selector]:!h-[34px] [&_.ant-select-selector]:!items-center [&_.ant-select-selection-item]:!text-xs [&_.ant-select-selector]:!border-[#CBD5E1] [&_.ant-select-selector]:!rounded-lg"
                style={{ height: 34 }}
                popupMatchSelectWidth={false}
                options={[
                  { value: "all", label: "Tất cả tin tuyển dụng" },
                  ...jobsList.map((j) => ({
                    value: String(j.id),
                    label: `${j.title} (${j.slug || 'JD-' + j.id})`,
                  })),
                ]}
              />

              {/* 3. Vị trí */}
              <Select
                value={selectedPosition}
                onChange={setSelectedPosition}
                className="w-[110px] xl:w-[115px] shrink-0 [&_.ant-select-selector]:!h-[34px] [&_.ant-select-selector]:!items-center [&_.ant-select-selection-item]:!text-xs [&_.ant-select-selector]:!border-[#CBD5E1] [&_.ant-select-selector]:!rounded-lg"
                style={{ height: 34 }}
                popupMatchSelectWidth={false}
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

              {/* 4. Nguồn */}
              <Select
                value={selectedSource}
                onChange={setSelectedSource}
                className="w-[105px] xl:w-[115px] shrink-0 [&_.ant-select-selector]:!h-[34px] [&_.ant-select-selector]:!items-center [&_.ant-select-selection-item]:!text-xs [&_.ant-select-selector]:!border-[#CBD5E1] [&_.ant-select-selector]:!rounded-lg"
                style={{ height: 34 }}
                popupMatchSelectWidth={false}
                options={[
                  { value: "all", label: "Tất cả nguồn" },
                  { value: "Website", label: "Website Careza" },
                  { value: "LinkedIn", label: "LinkedIn" },
                  { value: "Referral", label: "Referral (Giới thiệu)" },
                  { value: "VietnamWorks", label: "VietnamWorks" },
                  { value: "TopCV", label: "TopCV" },
                ]}
              />

              {/* 5. Trạng thái */}
              <Select
                value={selectedStatus}
                onChange={setSelectedStatus}
                className="w-[115px] xl:w-[125px] shrink-0 [&_.ant-select-selector]:!h-[34px] [&_.ant-select-selector]:!items-center [&_.ant-select-selection-item]:!text-xs [&_.ant-select-selector]:!border-[#CBD5E1] [&_.ant-select-selector]:!rounded-lg"
                style={{ height: 34 }}
                popupMatchSelectWidth={false}
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

              {/* 6. Sắp xếp */}
              <Select
                value={selectedSort}
                onChange={setSelectedSort}
                className="w-[115px] xl:w-[125px] shrink-0 [&_.ant-select-selector]:!h-[34px] [&_.ant-select-selector]:!items-center [&_.ant-select-selection-item]:!text-xs [&_.ant-select-selector]:!border-[#CBD5E1] [&_.ant-select-selector]:!rounded-lg"
                style={{ height: 34 }}
                popupMatchSelectWidth={false}
                suffixIcon={<ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                options={[
                  { value: "newest", label: "Mới nhất" },
                  { value: "match-score", label: "Điểm AI Matching" },
                  { value: "rating-high", label: "Đánh giá cao nhất" },
                  { value: "name-az", label: "Tên A - Z" },
                ]}
              />
            </div>
          </div>

          {/* Bulk Action Bar (When >= 1 candidate selected) */}
          {selectedIds.length > 0 && (
            <div className="bg-blue-50/90 border-b border-blue-200 px-4 py-2.5 flex items-center justify-between shrink-0 animate-fadeIn">
              <div className="flex items-center gap-2 text-xs font-bold text-[#155EEF]">
                <CheckCircle className="w-4 h-4" />
                <span>Đã chọn {selectedIds.length} ứng viên</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleBulkMoveStage("INTERVIEW")}
                  className="px-3 py-1 bg-[#155EEF] hover:bg-[#1047B8] text-white rounded-lg text-xs font-bold shadow-2xs transition-all cursor-pointer"
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
              <thead className="sticky top-0 z-10 bg-[#EAF2FF] border-b border-[#CBD5E1] shadow-2xs">
                <tr className="text-[#174EA6] font-semibold text-[12.5px]">
                  <th className="py-2.5 px-3 w-10 text-center bg-[#EAF2FF]">
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
                  <th className="py-2.5 px-3 min-w-[200px] text-left bg-[#EAF2FF]">Ứng viên</th>
                  <th className="py-2.5 px-3 min-w-[140px] text-center bg-[#EAF2FF]">Vị trí ứng tuyển</th>
                  <th className="py-2.5 px-3 min-w-[130px] text-center bg-[#EAF2FF]">CV đính kèm</th>
                  <th className="py-2.5 px-3 min-w-[110px] text-center bg-[#EAF2FF]">Điểm phù hợp</th>
                  <th className="py-2.5 px-3 min-w-[110px] text-center bg-[#EAF2FF]">Trạng thái</th>
                  <th className="py-2.5 px-3 min-w-[105px] text-center bg-[#EAF2FF]">Đánh giá</th>
                  <th className="py-2.5 px-3 min-w-[100px] text-center bg-[#EAF2FF]">Ngày nộp</th>
                  <th className="py-2.5 px-3 min-w-[80px] text-center bg-[#EAF2FF]">Thao tác</th>
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
                        className={`hover:bg-slate-50/70 transition-colors group cursor-pointer ${isSelected ? "bg-blue-50/40" : ""
                          }`}
                      >
                        {/* 1. Checkbox */}
                        <td
                          className="py-3 px-3 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={isSelected}
                            onChange={(e) => handleSelectOne(candidate.id, e.target.checked)}
                          />
                        </td>

                        {/* 2. Ứng viên (Avatar, Name, Badge, Email, Phone) */}
                        <td className="py-3 px-3 text-left">
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={candidate.avatar}
                              size={40}
                              className="border border-slate-200 shrink-0 shadow-2xs"
                            />
                            <div className="min-w-0 space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <Link
                                  href={`/doanh-nghiep/ung-vien/${candidate.id}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="font-bold text-slate-900 text-xs hover:text-[#155EEF] transition-colors truncate block"
                                >
                                  {candidate.name}
                                </Link>
                                {candidate.isNew && (
                                  <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-600 text-[9px] font-bold border border-emerald-200">
                                    Mới
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 leading-tight truncate">
                                {candidate.email}
                              </div>
                              <div className="text-[10.5px] text-slate-400 font-mono leading-tight">
                                {candidate.phone}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 3. Vị trí ứng tuyển */}
                        <td className="py-3 px-3 text-center">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-800 text-xs block leading-tight truncate">
                              {candidate.jobTitle}
                            </span>
                            <span className="text-[10.5px] font-mono text-slate-400 font-medium block">
                              {candidate.jobCode}
                            </span>
                          </div>
                        </td>

                        {/* 4. CV đã nộp */}
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-[#155EEF] shrink-0" />
                            <span className="text-xs font-semibold text-slate-800 truncate max-w-[120px]" title={candidate.cvName}>
                              {candidate.cvName}
                            </span>
                            {candidate.cvFileUrl && (
                              <button
                                type="button"
                                title="Xem file CV"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(candidate.cvFileUrl!, "_blank");
                                }}
                                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-[#155EEF] transition-colors cursor-pointer"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </td>

                        {/* 5. Điểm AI Matching */}
                        <td className="py-3 px-3 text-center">
                          {typeof candidate.matchScore === "number" ? (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold border ${candidate.matchScore >= 80
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : candidate.matchScore >= 60
                                ? "bg-blue-50 text-[#155EEF] border-blue-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}>
                              <Sparkles className="w-3 h-3" />
                              <span>{candidate.matchScore}%</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </td>

                        {/* 6. Trạng thái */}
                        <td className="py-3 px-3 text-center">
                          <div className="flex justify-center">
                            {renderStatusBadge(candidate.status)}
                          </div>
                        </td>

                        {/* 7. Đánh giá (Star Rating - Strictly 1 Line) */}
                        <td
                          className="py-3 px-3 min-w-[105px] whitespace-nowrap text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((starVal) => (
                              <button
                                key={starVal}
                                type="button"
                                aria-label={`Đánh giá ${starVal} sao`}
                                onClick={() => handleRateCandidate(candidate.id, starVal)}
                                className="p-0.5 hover:scale-125 transition-transform cursor-pointer"
                              >
                                <Star
                                  className={`w-3.5 h-3.5 ${starVal <= candidate.rating
                                    ? "text-amber-400 fill-amber-400"
                                    : "text-slate-200 fill-slate-100"
                                    }`}
                                />
                              </button>
                            ))}
                          </div>
                        </td>

                        {/* 8. Ngày ứng tuyển */}
                        <td className="py-3 px-3 text-center">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-700 text-xs block">
                              {candidate.appliedAt}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium block">
                              {candidate.appliedTimeAgo}
                            </span>
                          </div>
                        </td>

                        {/* 9. Thao tác (Single MoreOutlined Dropdown Button) */}
                        <td className="py-3 px-3 text-center">
                          <div
                            className="flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Dropdown
                              menu={{
                                items: menuItems,
                                className: "[&_.ant-dropdown-menu-item]:!min-h-[38px] [&_.ant-dropdown-menu-item]:!h-[38px] [&_.ant-dropdown-menu-item]:!py-2 [&_.ant-dropdown-menu-item]:!px-3.5 [&_.ant-dropdown-menu-item-divider]:!my-1 min-w-[190px]",
                              }}
                              trigger={["click"]}
                              placement="bottomRight"
                              arrow={{ pointAtCenter: true }}
                            >
                              <button
                                type="button"
                                aria-label="Thao tác"
                                onClick={(e) => e.stopPropagation()}
                                className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-[#155EEF] flex items-center justify-center transition-colors cursor-pointer border border-slate-200/80 active:scale-95 mx-auto"
                              >
                                <MoreOutlined className="text-base" />
                              </button>
                            </Dropdown>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500">
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
                          className="px-4 py-1.5 rounded-xl bg-blue-50 text-[#155EEF] hover:bg-blue-100 text-xs font-bold transition-all cursor-pointer"
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
          <div className="p-3.5 border-t border-[#CBD5E1] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 bg-slate-50/60 text-xs">
            <span className="text-slate-500 font-medium text-[11.5px]">
              Hiển thị 1 - {paginatedCandidates.length} trong tổng số{" "}
              <strong className="text-slate-800 font-bold">{totalCount.toLocaleString()}</strong> ứng viên
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
                className="text-xs [&_.ant-select-selector]:!border-[#CBD5E1] [&_.ant-select-selector]:!rounded-lg"
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
          <div className="bg-white rounded-2xl border border-[#CBD5E1] shadow-2xs p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 m-0">Nguồn ứng viên</h3>
              <Select
                defaultValue="30days"
                size="small"
                className="text-[11px] [&_.ant-select-selector]:!border-[#CBD5E1] [&_.ant-select-selector]:!rounded-lg"
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
                    stroke="#155EEF"
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
                  <span className="text-base font-bold text-[#17233B] leading-none">1,248</span>
                  <span className="text-[9px] text-slate-500 font-medium mt-0.5">Tổng ứng viên</span>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-1.5 text-[11px] flex-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-[#155EEF]" />
                    <span>Website</span>
                  </span>
                  <span className="font-bold text-slate-800">620 <span className="text-[10px] font-normal text-slate-400">(49.7%)</span></span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>LinkedIn</span>
                  </span>
                  <span className="font-bold text-slate-800">328 <span className="text-[10px] font-normal text-slate-400">(26.3%)</span></span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Referral</span>
                  </span>
                  <span className="font-bold text-slate-800">192 <span className="text-[10px] font-normal text-slate-400">(15.4%)</span></span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-purple-600" />
                    <span>TopCV</span>
                  </span>
                  <span className="font-bold text-slate-800">108 <span className="text-[10px] font-normal text-slate-400">(8.6%)</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Ứng viên theo giai đoạn */}
          <div className="bg-white rounded-2xl border border-[#CBD5E1] shadow-2xs p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 m-0">Ứng viên theo giai đoạn</h3>
              <Link
                href="/doanh-nghiep/pipeline"
                className="text-[11px] font-medium text-[#155EEF] hover:underline"
              >
                Xem tất cả
              </Link>
            </div>

            <div className="space-y-2.5 text-xs">
              {/* Mới */}
              <div>
                <div className="flex justify-between font-medium text-slate-700 pb-1 text-[11px]">
                  <span>Mới</span>
                  <span className="font-bold text-slate-900">312</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full w-[45%]" />
                </div>
              </div>

              {/* Đánh giá */}
              <div>
                <div className="flex justify-between font-medium text-slate-700 pb-1 text-[11px]">
                  <span>Đánh giá</span>
                  <span className="font-bold text-slate-900">226</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#155EEF] h-full rounded-full w-[35%]" />
                </div>
              </div>

              {/* Phỏng vấn */}
              <div>
                <div className="flex justify-between font-medium text-slate-700 pb-1 text-[11px]">
                  <span>Phỏng vấn</span>
                  <span className="font-bold text-slate-900">192</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full w-[28%]" />
                </div>
              </div>

              {/* Offer */}
              <div>
                <div className="flex justify-between font-medium text-slate-700 pb-1 text-[11px]">
                  <span>Offer</span>
                  <span className="font-bold text-slate-900">48</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-full rounded-full w-[12%]" />
                </div>
              </div>

              {/* Đã từ chối */}
              <div>
                <div className="flex justify-between font-medium text-slate-700 pb-1 text-[11px]">
                  <span>Đã từ chối</span>
                  <span className="font-bold text-slate-900">142</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full w-[20%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Thao tác nhanh (2x3 Grid) */}
          <div className="bg-white rounded-2xl border border-[#CBD5E1] shadow-2xs p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 m-0">Thao tác nhanh</h3>

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
                onClick={handleOpenAddModal}
                className="p-3 bg-blue-50/70 hover:bg-blue-100 rounded-xl border border-blue-100 text-center space-y-1.5 transition-all h-full flex flex-col items-center justify-center cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-[#155EEF] text-white flex items-center justify-center shadow-2xs">
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
      {/* 7. MODAL: THÊM ỨNG VIÊN THỦ CÔNG                         */}
      {/* ======================================================== */}
      <Modal
        open={isAddModalOpen}
        onCancel={() => {
          if (!isSubmittingAdd) {
            setIsAddModalOpen(false);
            setAddErrors({});
          }
        }}
        footer={null}
        width={580}
        centered
        destroyOnHidden
        title={null}
        className="careza-add-candidate-modal"
      >
        <div className="space-y-4 p-1">
          {/* Header */}
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#155EEF] flex items-center justify-center shrink-0 shadow-2xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-[#17233B] m-0">
                Thêm hồ sơ ứng viên
              </h3>

            </div>
          </div>

          {/* Form Content */}
          <div className="space-y-3.5 text-xs">
            {/* Row: Họ và tên */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Họ và tên ứng viên <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="Ví dụ: Nguyễn Văn An"
                value={addForm.name}
                onChange={(e) => {
                  setAddForm({ ...addForm, name: e.target.value });
                  if (addErrors.name) setAddErrors((prev) => ({ ...prev, name: "" }));
                }}
                status={addErrors.name ? "error" : ""}
                className="rounded-lg text-xs h-9"
              />
              {addErrors.name && (
                <span className="text-[11px] text-rose-500 mt-1 block">
                  {addErrors.name}
                </span>
              )}
            </div>

            {/* Row: Email & Số điện thoại */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Địa chỉ email <span className="text-rose-500">*</span>
                </label>
                <Input
                  placeholder="ungvien@gmail.com"
                  value={addForm.email}
                  onChange={(e) => {
                    setAddForm({ ...addForm, email: e.target.value });
                    if (addErrors.email) setAddErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  status={addErrors.email ? "error" : ""}
                  className="rounded-lg text-xs h-9"
                />
                {addErrors.email && (
                  <span className="text-[11px] text-rose-500 mt-1 block">
                    {addErrors.email}
                  </span>
                )}
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Số điện thoại <span className="text-rose-500">*</span>
                </label>
                <Input
                  placeholder="0912 345 678"
                  value={addForm.phone}
                  onChange={(e) => {
                    setAddForm({ ...addForm, phone: e.target.value });
                    if (addErrors.phone) setAddErrors((prev) => ({ ...prev, phone: "" }));
                  }}
                  status={addErrors.phone ? "error" : ""}
                  className="rounded-lg text-xs h-9"
                />
                {addErrors.phone && (
                  <span className="text-[11px] text-rose-500 mt-1 block">
                    {addErrors.phone}
                  </span>
                )}
              </div>
            </div>

            {/* Row: Vị trí tuyển dụng */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Vị trí ứng tuyển <span className="text-rose-500">*</span>
              </label>
              <Select
                placeholder="Chọn tin tuyển dụng..."
                value={addForm.jobId}
                onChange={(val) => {
                  setAddForm({ ...addForm, jobId: val });
                  if (addErrors.jobId) setAddErrors((prev) => ({ ...prev, jobId: "" }));
                }}
                status={addErrors.jobId ? "error" : ""}
                className="w-full text-xs"
                options={jobsList.map((j) => ({
                  value: j.id,
                  label: `${j.title} ${j.slug ? `(${j.slug})` : `(JD-${j.id})`}`,
                }))}
              />
              {addErrors.jobId && (
                <span className="text-[11px] text-rose-500 mt-1 block">
                  {addErrors.jobId}
                </span>
              )}
            </div>

            {/* Row: CV đính kèm */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Hồ sơ CV đính kèm (PDF, DOC, DOCX - Tối đa 10MB)
              </label>
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={handleFileChange}
              />

              {!addFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      const fakeEvent = { target: { files: [file] } } as any;
                      handleFileChange(fakeEvent);
                    }
                  }}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-1.5 ${addErrors.file
                    ? "border-rose-300 bg-rose-50/40"
                    : "border-slate-200 bg-slate-50/50 hover:bg-blue-50/30 hover:border-[#155EEF]/50"
                    }`}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-[#155EEF] flex items-center justify-center">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div className="text-xs text-slate-600">
                    <span className="font-semibold text-[#155EEF]">Nhấn để tải lên</span> hoặc kéo thả file vào đây
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Chấp nhận các định dạng PDF, DOC, DOCX (Dung lượng ≤ 10MB)
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold text-slate-800 block text-xs truncate max-w-[340px]">
                        {addFile.name}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {(addFile.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Xóa file đã chọn"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {addErrors.file && (
                <span className="text-[11px] text-rose-500 mt-1 block">
                  {addErrors.file}
                </span>
              )}
            </div>

            {/* Row: Ghi chú */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Ghi chú tuyển dụng (Không bắt buộc)
              </label>
              <Input.TextArea
                rows={3}
                placeholder="Ghi chú thêm về nguồn ứng viên, kinh nghiệm nổi bật hoặc thỏa thuận ban đầu..."
                value={addForm.notes}
                onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
                className="rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              disabled={isSubmittingAdd}
              onClick={() => {
                setIsAddModalOpen(false);
                setAddErrors({});
              }}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs transition-all cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>

            <button
              type="button"
              disabled={isSubmittingAdd}
              onClick={handleSubmitAddCandidate}
              className="px-4 py-2 rounded-lg bg-[#155EEF] hover:bg-[#1047B8] text-white font-medium text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmittingAdd ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Lưu hồ sơ</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* 8. DRAWER: BỘ LỌC NÂNG CAO (ADVANCED FILTERS)           */}
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
