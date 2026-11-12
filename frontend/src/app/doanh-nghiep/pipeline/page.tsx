"use client";

import { useState, useMemo, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { employerService } from "@/services/employer.service";

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
  jobId?: string | number;
  jobTitle: string;
  jobCode: string;
  stage: PipelineStage;
  source: "Website" | "LinkedIn" | "Referral" | "VietnamWorks" | "TopCV";
  timeAgo: string;
  appliedDate: string;
  appliedAtRaw?: number;
  rating: number;
  email: string;
  phone: string;
  location?: string;
  experienceYears: number;
  education?: string;
  skills: string[];
  notes?: string;
  cvName: string;
  cvFileUrl?: string | null;
  matchScore?: number | null;
  coverLetter?: string;
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
    label: "Mới nộp",
    count: 0,
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
    count: 0,
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
    label: "Danh sách phù hợp",
    count: 0,
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
    count: 0,
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
    label: "Đề nghị nhận việc",
    count: 0,
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
    label: "Trúng tuyển",
    count: 0,
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
    count: 0,
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
const INITIAL_PIPELINE_CANDIDATES: PipelineCandidate[] = [];

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
  const [candidates, setCandidates] = useState<PipelineCandidate[]>([]);
  const [jobsList, setJobsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<string>(jobIdFromQuery || "all");
  const [selectedPosition, setSelectedPosition] = useState<string>("all");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [selectedRecruiter, setSelectedRecruiter] = useState<string>("all");
  const [selectedSort, setSelectedSort] = useState<string>("newest");
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const stageMapToString: Record<PipelineStage, string> = {
    NEW: "submitted",
    SCREENING: "screening",
    MATCHED: "shortlisted",
    INTERVIEW: "interview",
    OFFER: "offered",
    HIRED: "hired",
    REJECTED: "rejected",
  };

  // Tải danh sách tin tuyển dụng thật của doanh nghiệp
  useEffect(() => {
    employerService
      .getJobs({ page_size: 100 })
      .then((res) => {
        setJobsList(res?.data?.items || []);
      })
      .catch(() => setJobsList([]));
  }, []);

  const fetchPipelineCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await employerService.getApplications({
        jobId: selectedJob !== "all" ? selectedJob : undefined,
      });
      const list = res?.data?.applications || [];
      const mapped = list.map((app: any) => {
        const s = String(app.status || "").toLowerCase();
        const stage: PipelineStage =
          s === "submitted"
            ? "NEW"
            : s === "screening"
            ? "SCREENING"
            : s === "shortlisted" || s === "test"
            ? "MATCHED"
            : s === "interview"
            ? "INTERVIEW"
            : s === "offered"
            ? "OFFER"
            : s === "hired"
            ? "HIRED"
            : s === "rejected"
            ? "REJECTED"
            : "NEW";

        return {
          id: String(app.id),
          jobId: app.job?.id,
          name: app.candidate?.full_name || app.candidate?.name || "Ứng viên",
          avatar:
            app.candidate?.avatar_url ||
            app.candidate?.avatar ||
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          jobTitle: app.job?.title || "Vị trí tuyển dụng",
          jobCode: app.job?.slug || `JD-${app.job?.id || ""}`,
          stage: stage,
          source: app.source || "CAREZA Portal",
          timeAgo: "Gần đây",
          appliedDate: app.applied_at
            ? new Date(app.applied_at).toLocaleDateString("vi-VN")
            : "Hôm nay",
          appliedAtRaw: app.applied_at ? new Date(app.applied_at).getTime() : 0,
          rating: app.rating || 4,
          email: app.candidate?.email || "",
          phone: app.candidate?.phone || "",
          location: app.candidate?.location || "Việt Nam",
          experienceYears: app.candidate?.experience_years || 2,
          education: app.candidate?.education || "Đại học",
          skills: app.candidate?.skills || [],
          cvName: app.cv?.title || "CV_Ung_Vien.pdf",
          cvFileUrl: app.cv?.file_url || null,
          matchScore: typeof app.match_score === "number" ? app.match_score : null,
          coverLetter: app.cover_letter || "",
          notes: app.note || "",
        };
      });
      setCandidates(mapped);
    } catch {
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }, [selectedJob]);

  useEffect(() => {
    fetchPipelineCandidates();
  }, [fetchPipelineCandidates]);


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
  const handleConfirmMoveStage = async () => {
    if (!activeCandidate) return;
    setActionLoading(true);
    const prevStage = activeCandidate.stage;
    try {
      if (targetStage === "HIRED") {
        await employerService.markAsHired(activeCandidate.id);
      } else if (targetStage === "REJECTED") {
        await employerService.rejectApplication(activeCandidate.id, moveStageNote || "Hồ sơ chưa phù hợp.");
      } else {
        await employerService.changeStage(activeCandidate.id, stageMapToString[targetStage] || "submitted", moveStageNote);
      }
      setCandidates((prev) =>
        prev.map((c) => (c.id === activeCandidate.id ? { ...c, stage: targetStage } : c))
      );
      const stageName = STAGE_COLUMNS.find((s) => s.key === targetStage)?.label || targetStage;
      message.success(`Đã chuyển ứng viên "${activeCandidate.name}" sang giai đoạn "${stageName}" thành công!`);
      closeModal();
    } catch (err: any) {
      setCandidates((prev) =>
        prev.map((c) => (c.id === activeCandidate.id ? { ...c, stage: prevStage } : c))
      );
      message.error(err?.response?.data?.message || "Lỗi khi chuyển giai đoạn ứng viên.");
    } finally {
      setActionLoading(false);
    }
  };

  // Schedule Interview Handler
  const handleConfirmScheduleInterview = async () => {
    if (!activeCandidate) return;
    if (!interviewDate) {
      message.warning("Vui lòng chọn ngày và giờ phỏng vấn.");
      return;
    }
    setActionLoading(true);
    try {
      const res = await employerService.createInterview({
        application_id: Number(activeCandidate.id),
        mode: interviewFormat,
        meeting_url: interviewLocationOrLink,
        scheduled_at: interviewDate,
        notes: interviewNote,
      });

      setCandidates((prev) =>
        prev.map((c) => (c.id === activeCandidate.id ? { ...c, stage: "INTERVIEW" } : c))
      );

      if ((res as any)?.has_conflict) {
        message.warning((res as any)?.conflict_message || "Đã tạo lịch nhưng có trùng giờ phỏng vấn!");
      } else {
        message.success(`Đã lên lịch phỏng vấn và chuyển ứng viên "${activeCandidate.name}" sang giai đoạn Phỏng vấn!`);
      }
      closeModal();
    } catch (err: any) {
      const errDetail = err?.response?.data?.error || "Lỗi khi tạo lịch phỏng vấn.";
      message.error(errDetail);
    } finally {
      setActionLoading(false);
    }
  };

  // Talent Pool Handler
  const handleConfirmSaveTalentPool = () => {
    if (!activeCandidate) return;
    message.success(`Đã lưu "${activeCandidate.name}" vào Talent Pool (${poolGroup})!`);
    closeModal();
  };

  // Send Message Handler
  const handleConfirmSendMessage = () => {
    if (!activeCandidate) return;
    message.success(`Đã gửi tin nhắn đến ứng viên "${activeCandidate.name}" thành công!`);
    closeModal();
  };

  // Reject Candidate Handler
  const handleConfirmReject = async () => {
    if (!activeCandidate) return;
    setActionLoading(true);
    const prevStage = activeCandidate.stage;
    try {
      await employerService.rejectApplication(activeCandidate.id, rejectionNote || "Hồ sơ chưa phù hợp.");
      setCandidates((prev) =>
        prev.map((c) => (c.id === activeCandidate.id ? { ...c, stage: "REJECTED" } : c))
      );
      message.success(`Đã chuyển ứng viên "${activeCandidate.name}" sang giai đoạn Đã từ chối!`);
      closeModal();
    } catch (err: any) {
      setCandidates((prev) =>
        prev.map((c) => (c.id === activeCandidate.id ? { ...c, stage: prevStage } : c))
      );
      message.error(err?.response?.data?.message || "Lỗi cập nhật từ chối hồ sơ.");
    } finally {
      setActionLoading(false);
    }
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

  const handleDrop = async (e: React.DragEvent, targetStageVal: PipelineStage) => {
    e.preventDefault();
    const candidateId = e.dataTransfer.getData("text/plain");
    if (!candidateId) return;

    const currentCandidate = candidates.find((c) => c.id === candidateId);
    if (!currentCandidate) return;

    if (currentCandidate.stage === targetStageVal) {
      setDraggingCardId(null);
      setDragOverStage(null);
      return;
    }

    // Chặn chuyển trạng thái không hợp lệ:
    if (currentCandidate.stage === "HIRED" || currentCandidate.stage === "REJECTED") {
      message.warning(`Hồ sơ đã ở giai đoạn "${currentCandidate.stage === "HIRED" ? "Trúng tuyển" : "Đã từ chối"}", không thể chuyển ngược vòng.`);
      setDraggingCardId(null);
      setDragOverStage(null);
      return;
    }

    const prevStage = currentCandidate.stage;
    // Optimistic update
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, stage: targetStageVal } : c))
    );

    try {
      if (targetStageVal === "HIRED") {
        await employerService.markAsHired(candidateId);
      } else if (targetStageVal === "REJECTED") {
        await employerService.rejectApplication(candidateId, "Từ chối trong Pipeline tuyển dụng.");
      } else {
        await employerService.changeStage(candidateId, stageMapToString[targetStageVal] || "submitted");
      }
      const stageName = STAGE_COLUMNS.find((s) => s.key === targetStageVal)?.label || targetStageVal;
      message.success(`Đã chuyển ứng viên "${currentCandidate.name}" sang "${stageName}" thành công!`);
    } catch (err: any) {
      // Khôi phục trạng thái ban đầu nếu thất bại
      setCandidates((prev) =>
        prev.map((c) => (c.id === candidateId ? { ...c, stage: prevStage } : c))
      );
      message.error(err?.response?.data?.message || "Lỗi khi cập nhật trạng thái. Đã khôi phục trạng thái ban đầu.");
    } finally {
      setDraggingCardId(null);
      setDragOverStage(null);
    }
  };


  // Filtered dataset
  const filteredCandidates = useMemo(() => {
    const list = candidates.filter((c) => {
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
      if (selectedJob !== "all" && String(c.jobId) !== selectedJob && c.jobCode !== selectedJob) return false;
      // Position
      if (selectedPosition !== "all" && !c.jobTitle.includes(selectedPosition)) return false;
      // Source
      if (selectedSource !== "all" && c.source !== selectedSource) return false;
      return true;
    });

    const sorted = [...list];
    if (selectedSort === "rating") {
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (selectedSort === "match-score") {
      sorted.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    } else if (selectedSort === "oldest") {
      sorted.sort((a, b) => (a.appliedAtRaw || 0) - (b.appliedAtRaw || 0));
    } else {
      // Sắp xếp mới nhất theo applied_at
      sorted.sort((a, b) => (b.appliedAtRaw || 0) - (a.appliedAtRaw || 0));
    }
    return sorted;
  }, [candidates, searchQuery, selectedJob, selectedPosition, selectedSource, selectedSort]);

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
              ...jobsList.map((job) => ({
                value: String(job.id),
                label: `${job.title} (${job.id})`,
              })),
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
            className="custom-filter-select text-xs min-w-[155px]"
            size="small"
            suffixIcon={<Calendar className="w-3 h-3 text-slate-400" />}
            options={[
              { value: "newest", label: "Thời gian nộp (Mới nhất)" },
              { value: "oldest", label: "Thời gian nộp (Cũ nhất)" },
              { value: "match-score", label: "Điểm CV–JD cao nhất" },
              { value: "rating", label: "Đánh giá sao cao nhất" },
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
      {/* 3. TỔNG QUAN PIPELINE (8 KPI MINI CARDS - DYNAMIC)      */}
      {/* ======================================================== */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-slate-600 block">Tổng quan pipeline</span>

        {(() => {
          const totalCount = filteredCandidates.length;
          const getStageStats = (stageKey: PipelineStage) => {
            const count = filteredCandidates.filter((c) => c.stage === stageKey).length;
            const pct = totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) : "0.0";
            return { count, pct };
          };
          const newStats = getStageStats("NEW");
          const screenStats = getStageStats("SCREENING");
          const matchStats = getStageStats("MATCHED");
          const interviewStats = getStageStats("INTERVIEW");
          const offerStats = getStageStats("OFFER");
          const hiredStats = getStageStats("HIRED");
          const rejectedStats = getStageStats("REJECTED");

          return (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {/* Card 1: Tổng ứng viên */}
              <div className="p-2 px-2.5 rounded-xl bg-white border border-blue-200/90 shadow-2xs text-center flex flex-col items-center justify-center hover:border-blue-400 transition-all">
                <div className="flex items-center justify-center gap-1 text-[10.5px] font-medium text-slate-600 leading-tight">
                  <Users className="w-3 h-3 text-blue-600 shrink-0" />
                  <span>Tổng ứng viên</span>
                </div>
                <span className="text-base sm:text-lg font-bold text-slate-800 block my-0.5 leading-tight">
                  {totalCount}
                </span>
                <span className="text-[9.5px] font-medium text-blue-600 block leading-none">
                  Trong bộ lọc
                </span>
              </div>

              {/* Card 2: Mới nộp */}
              <div className="p-2 px-2.5 rounded-xl bg-[#F4F8FD] border border-[#BFDBFE] shadow-2xs text-center flex flex-col items-center justify-center hover:border-blue-400 transition-all">
                <div className="flex items-center justify-center gap-1 text-[10.5px] font-medium text-blue-700 leading-tight">
                  <UserPlus className="w-3 h-3 text-[#0062ff] shrink-0" />
                  <span>Mới nộp</span>
                </div>
                <span className="text-base sm:text-lg font-bold text-slate-800 block my-0.5 leading-tight">
                  {newStats.count}
                </span>
                <span className="text-[9.5px] font-medium text-slate-500 block leading-none">
                  {newStats.pct}%
                </span>
              </div>

              {/* Card 3: Sàng lọc */}
              <div className="p-2 px-2.5 rounded-xl bg-[#F2F7FC] border border-[#BAE6FD] shadow-2xs text-center flex flex-col items-center justify-center hover:border-sky-400 transition-all">
                <div className="flex items-center justify-center gap-1 text-[10.5px] font-medium text-sky-700 leading-tight">
                  <Filter className="w-3 h-3 text-[#0284c7] shrink-0" />
                  <span>Sàng lọc</span>
                </div>
                <span className="text-base sm:text-lg font-bold text-slate-800 block my-0.5 leading-tight">
                  {screenStats.count}
                </span>
                <span className="text-[9.5px] font-medium text-slate-500 block leading-none">
                  {screenStats.pct}%
                </span>
              </div>

              {/* Card 4: Phù hợp */}
              <div className="p-2 px-2.5 rounded-xl bg-[#FAF7FD] border border-[#E9D5FF] shadow-2xs text-center flex flex-col items-center justify-center hover:border-purple-400 transition-all">
                <div className="flex items-center justify-center gap-1 text-[10.5px] font-medium text-purple-700 leading-tight">
                  <Star className="w-3 h-3 text-[#9333ea] fill-[#9333ea] shrink-0" />
                  <span>Phù hợp</span>
                </div>
                <span className="text-base sm:text-lg font-bold text-slate-800 block my-0.5 leading-tight">
                  {matchStats.count}
                </span>
                <span className="text-[9.5px] font-medium text-slate-500 block leading-none">
                  {matchStats.pct}%
                </span>
              </div>

              {/* Card 5: Phỏng vấn */}
              <div className="p-2 px-2.5 rounded-xl bg-[#FEF9F2] border border-[#FDE68A] shadow-2xs text-center flex flex-col items-center justify-center hover:border-amber-400 transition-all">
                <div className="flex items-center justify-center gap-1 text-[10.5px] font-medium text-amber-700 leading-tight">
                  <Calendar className="w-3 h-3 text-[#d97706] shrink-0" />
                  <span>Phỏng vấn</span>
                </div>
                <span className="text-base sm:text-lg font-bold text-slate-800 block my-0.5 leading-tight">
                  {interviewStats.count}
                </span>
                <span className="text-[9.5px] font-medium text-slate-500 block leading-none">
                  {interviewStats.pct}%
                </span>
              </div>

              {/* Card 6: Offer */}
              <div className="p-2 px-2.5 rounded-xl bg-[#FDF5F5] border border-[#FECDD3] shadow-2xs text-center flex flex-col items-center justify-center hover:border-rose-400 transition-all">
                <div className="flex items-center justify-center gap-1 text-[10.5px] font-medium text-rose-700 leading-tight">
                  <Award className="w-3 h-3 text-[#e11d48] shrink-0" />
                  <span>Offer</span>
                </div>
                <span className="text-base sm:text-lg font-bold text-slate-800 block my-0.5 leading-tight">
                  {offerStats.count}
                </span>
                <span className="text-[9.5px] font-medium text-slate-500 block leading-none">
                  {offerStats.pct}%
                </span>
              </div>

              {/* Card 7: Trúng tuyển */}
              <div className="p-2 px-2.5 rounded-xl bg-[#F2FAF6] border border-[#A7F3D0] shadow-2xs text-center flex flex-col items-center justify-center hover:border-emerald-400 transition-all">
                <div className="flex items-center justify-center gap-1 text-[10.5px] font-medium text-emerald-700 leading-tight">
                  <CheckCircle className="w-3 h-3 text-[#059669] shrink-0" />
                  <span>Trúng tuyển</span>
                </div>
                <span className="text-base sm:text-lg font-bold text-slate-800 block my-0.5 leading-tight">
                  {hiredStats.count}
                </span>
                <span className="text-[9.5px] font-medium text-slate-500 block leading-none">
                  {hiredStats.pct}%
                </span>
              </div>

              {/* Card 8: Đã từ chối */}
              <div className="p-2 px-2.5 rounded-xl bg-[#FDF5F5] border border-[#FECDD3] shadow-2xs text-center flex flex-col items-center justify-center hover:border-rose-400 transition-all">
                <div className="flex items-center justify-center gap-1 text-[10.5px] font-medium text-rose-700 leading-tight">
                  <XCircle className="w-3 h-3 text-[#e11d48] shrink-0" />
                  <span>Đã từ chối</span>
                </div>
                <span className="text-base sm:text-lg font-bold text-slate-800 block my-0.5 leading-tight">
                  {rejectedStats.count}
                </span>
                <span className="text-[9.5px] font-medium text-slate-500 block leading-none">
                  {rejectedStats.pct}%
                </span>
              </div>
            </div>
          );
        })()}
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
                      {stageCandidates.length}
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
                    {stageCandidates.length === 0 ? (
                      <div className="py-8 text-center px-3 border border-dashed border-slate-200/80 rounded-xl bg-white/40 my-2">
                        <span className="text-xs text-slate-400 font-medium block">
                          Chưa có ứng viên
                        </span>
                      </div>
                    ) : (
                      stageCandidates.map((candidate) => {
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

                            {/* Second row: Time ago & Source & Applied Date */}
                            <div className="text-[11px] text-slate-400 font-medium pt-1.5 flex items-center justify-between border-t border-slate-100/70 mt-2">
                              <span>{candidate.appliedDate || candidate.timeAgo} • {candidate.source}</span>
                              {candidate.matchScore != null && (
                                <span
                                  className={`px-1.5 py-0.2 rounded-md font-bold text-[10px] border ${
                                    candidate.matchScore >= 80
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : candidate.matchScore >= 60
                                      ? "bg-blue-50 text-blue-700 border-blue-200"
                                      : "bg-amber-50 text-amber-700 border-amber-200"
                                  }`}
                                >
                                  🎯 {candidate.matchScore}%
                                </span>
                              )}
                            </div>

                            {/* Third row: Status Badge & Rating */}
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
                      })
                    )}

                    {stageCandidates.length > 0 && (
                      <div className="pt-1 pb-1 text-center">
                        <span className="text-[11px] font-medium text-slate-400">
                          {stageCandidates.length} ứng viên
                        </span>
                      </div>
                    )}
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
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 flex-wrap gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-all cursor-pointer"
              >
                Đóng
              </button>

              <div className="flex items-center gap-2.5 flex-wrap">
                <Link
                  href={`/doanh-nghiep/ung-vien/${activeCandidate.id}`}
                  className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0062ff] font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer border border-blue-200"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Toàn bộ hồ sơ & Lịch sử</span>
                </Link>

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
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 m-0">
                  CV của {activeCandidate.name}
                </h3>
                <span className="text-xs text-slate-500 font-medium">{activeCandidate.cvName}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (activeCandidate.cvFileUrl) {
                      window.open(activeCandidate.cvFileUrl, "_blank");
                    } else {
                      message.info("Không có liên kết file trực tiếp, mở trang chi tiết ứng viên.");
                      window.open(`/doanh-nghiep/ung-vien/${activeCandidate.id}`, "_blank");
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải xuống CV</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (activeCandidate.cvFileUrl) {
                      window.open(activeCandidate.cvFileUrl, "_blank");
                    } else {
                      window.open(`/doanh-nghiep/ung-vien/${activeCandidate.id}`, "_blank");
                    }
                  }}
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
                  Thời điểm nộp: {activeCandidate.appliedDate} • Phiên bản snapshot lưu trữ an toàn
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
                {activeCandidate.coverLetter && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-slate-400 block mb-1">Thư ứng tuyển (Cover letter):</span>
                    <p className="m-0 text-slate-600 italic bg-slate-50 p-2 rounded-lg">
                      &quot;{activeCandidate.coverLetter}&quot;
                    </p>
                  </div>
                )}
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
