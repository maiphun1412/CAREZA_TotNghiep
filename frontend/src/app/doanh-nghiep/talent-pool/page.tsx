"use client";

import { useState, useMemo, useEffect, useCallback, Suspense, Fragment } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { employerService } from "@/services/employer.service";
import {
  Dropdown,
  Tooltip,
  Modal,
  App,
  Input,
  Select,
  Avatar,
  Checkbox,
  Pagination,
  Spin,
  Alert,
  Empty,
} from "antd";
import {
  Plus,
  Users,
  UserCheck,
  UserPlus,
  Star,
  Calendar,
  Search,
  SlidersHorizontal,
  MessageSquare,
  FileText,
  MoreHorizontal,
  ExternalLink,
  ChevronDown,
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
  Sparkles,
  ArrowRight,
  TrendingUp,
  Globe,
  Send,
  FileSpreadsheet,
  RefreshCw,
  FolderPlus,
  LayoutGrid,
  ListFilter,
  CheckCheck,
  Building,
  GraduationCap,
  DollarSign,
  Share2,
  Upload,
  Edit3,
  Bookmark,
  Layers,
  Zap,
  Tag as TagIcon,
  X,
} from "lucide-react";

// =====================================================================
// DATA TYPES
// =====================================================================
export type TalentPoolStatus =
  | "POTENTIAL"    // Tiềm năng cao (purple/pink)
  | "TRACKING"     // Đang theo dõi (blue)
  | "CONTACTED"    // Đã liên hệ (green)
  | "UNCONTACTED"  // Chưa liên hệ (gray)
  | "ARCHIVED";    // Đã lưu trữ (gray)

export interface TalentCandidate {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  desiredPosition: string;
  experienceYears: number;
  expectedSalary?: string;
  workingMode?: string;
  location?: string;
  bio?: string;
  notes?: string;
  notesUpdatedBy?: string;
  notesUpdatedAt?: string;
  skills: string[];
  source: "LinkedIn" | "Referral" | "TopCV" | "VietnamWorks" | "Website" | "Facebook";
  status: TalentPoolStatus;
  group: string;
  tags: string[];
  isFavorite: boolean;
  addedDate: string;
  addedTimeAgo: string;
  cvName: string;
  cvSize: string;
  linkedInUrl?: string;
}

// Status config
const STATUS_CONFIG: Record<
  TalentPoolStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  POTENTIAL: {
    label: "Tiềm năng cao",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  TRACKING: {
    label: "Đang theo dõi",
    bg: "bg-blue-50",
    text: "text-[#0062ff]",
    border: "border-blue-200",
  },
  CONTACTED: {
    label: "Đã liên hệ",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  UNCONTACTED: {
    label: "Chưa liên hệ",
    bg: "bg-slate-100",
    text: "text-slate-600",
    border: "border-slate-200",
  },
  ARCHIVED: {
    label: "Đã lưu trữ",
    bg: "bg-slate-100",
    text: "text-slate-500",
    border: "border-slate-200",
  },
};

// Initial Talent Pool candidates dataset
const INITIAL_TALENT_CANDIDATES: TalentCandidate[] = [];

// Source icon helper
function renderSourceBadge(source: string) {
  switch (source) {
    case "LinkedIn":
      return (
        <span className="inline-flex items-center gap-1.5 text-[13px] text-slate-800 font-medium">
          <span className="w-4.5 h-4.5 rounded bg-[#0A66C2] text-white flex items-center justify-center font-bold text-[11px] shrink-0">
            in
          </span>
          <span>LinkedIn</span>
        </span>
      );
    case "TopCV":
      return (
        <span className="inline-flex items-center gap-1.5 text-[13px] text-slate-800 font-medium">
          <span className="w-4.5 h-4.5 rounded bg-[#00B14F] text-white flex items-center justify-center font-bold text-[11px] shrink-0">
            T
          </span>
          <span>TopCV</span>
        </span>
      );
    case "VietnamWorks":
      return (
        <span className="inline-flex items-center gap-1.5 text-[13px] text-slate-800 font-medium">
          <span className="w-4.5 h-4.5 rounded bg-[#0070BA] text-white flex items-center justify-center font-bold text-[11px] shrink-0">
            V
          </span>
          <span>VietnamWorks</span>
        </span>
      );
    case "Referral":
      return (
        <span className="inline-flex items-center gap-1.5 text-[13px] text-slate-800 font-medium">
          <Users className="w-4 h-4 text-purple-600 shrink-0" />
          <span>Referral</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 text-[13px] text-slate-800 font-medium">
          <Globe className="w-4 h-4 text-blue-500 shrink-0" />
          <span>Website</span>
        </span>
      );
  }
}

// =====================================================================
// COMPONENT MAIN
// =====================================================================
function EmployerTalentPoolContent() {
  const { message } = App.useApp();
  const { user } = useAuthStore();
  const recruiterName = user?.fullName || "Mai Phương";

  // State
  const [candidates, setCandidates] = useState<TalentCandidate[]>([]);
  const [talentPools, setTalentPools] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [selectedSkill, setSelectedSkill] = useState<string>("all");
  const [selectedPosition, setSelectedPosition] = useState<string>("all");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Selected candidates for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // EXPANDED ROW STATE (Only 1 candidate expanded at a time)
  const [expandedCandidateId, setExpandedCandidateId] = useState<string | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [viewCvCandidate, setViewCvCandidate] = useState<TalentCandidate | null>(null);

  // Form tạo nhóm mới
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  // Edit note state
  const [editingCandidate, setEditingCandidate] = useState<TalentCandidate | null>(null);
  const [editNoteContent, setEditNoteContent] = useState<string>("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [poolsRes, appsRes] = await Promise.all([
        employerService.getTalentPools().catch(() => ({ success: true, data: { pools: [] } })),
        employerService.getApplications({ page_size: 50 }).catch(() => ({ success: true, message: "", data: { applications: [] } })),
      ]);

      const pools = (poolsRes?.data as any)?.pools || (poolsRes?.data as any)?.talent_pools || [];
      setTalentPools(pools);

      const mappedList: TalentCandidate[] = [];
      const seenIds = new Set<string>();

      pools.forEach((p: any) => {
        if (Array.isArray(p.members)) {
          p.members.forEach((m: any) => {
            const cId = `pool-${p.id}-${m.candidate_id}`;
            if (!seenIds.has(cId)) {
              seenIds.add(cId);
              const cand = m.candidate || {};
              mappedList.push({
                id: cId,
                name: cand.full_name || `Ứng viên #${m.candidate_id}`,
                avatar: cand.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                email: cand.email || `candidate${m.candidate_id}@example.com`,
                phone: cand.phone || "0900 000 000",
                desiredPosition: cand.headline || "Chuyên viên",
                experienceYears: 3,
                expectedSalary: "Thỏa thuận",
                workingMode: "Toàn thời gian",
                location: "Việt Nam",
                bio: cand.headline || "Hồ sơ lưu trữ trong nhóm ứng viên tiềm năng.",
                notes: m.notes || "Lưu trữ từ Talent Pool",
                notesUpdatedBy: recruiterName,
                notesUpdatedAt: "Gần đây",
                skills: ["Chuyên môn"],
                source: "Website",
                status: "POTENTIAL",
                group: p.name,
                tags: [p.name],
                isFavorite: true,
                addedDate: "Hôm nay",
                addedTimeAgo: "Gần đây",
                cvName: "HoSo_UngVien.pdf",
                cvSize: "PDF • Đầy đủ",
              });
            }
          });
        }
      });

      const apps = appsRes?.data?.applications || [];
      apps.forEach((a: any) => {
        const cId = `app-${a.id}`;
        if (!seenIds.has(cId)) {
          seenIds.add(cId);
          const cand = a.candidate || {};
          let candStatus: TalentPoolStatus = "TRACKING";
          if (a.status === "hired") candStatus = "POTENTIAL";
          else if (a.status === "interview") candStatus = "CONTACTED";
          else if (a.status === "rejected") candStatus = "ARCHIVED";

          mappedList.push({
            id: cId,
            name: cand.full_name || "Ứng viên",
            avatar: cand.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
            email: cand.email || "",
            phone: cand.phone || "",
            desiredPosition: a.job?.title || cand.headline || "Vị trí tuyển dụng",
            experienceYears: 2,
            expectedSalary: "Thỏa thuận",
            workingMode: "Toàn thời gian",
            location: "Việt Nam",
            bio: a.cover_letter || cand.headline || "",
            notes: `Hồ sơ ứng tuyển vị trí ${a.job?.title || ""}`,
            notesUpdatedBy: recruiterName,
            notesUpdatedAt: a.applied_at ? new Date(a.applied_at).toLocaleDateString("vi-VN") : "Gần đây",
            skills: ["Chuyên môn"],
            source: "Website",
            status: candStatus,
            group: pools.length > 0 ? pools[0].name : "Chung",
            tags: [a.job?.title || "Tuyển dụng"],
            isFavorite: false,
            addedDate: a.applied_at ? new Date(a.applied_at).toLocaleDateString("vi-VN") : "Gần đây",
            addedTimeAgo: "Đã nộp",
            cvName: a.cv?.title || "CV_UngVien.pdf",
            cvSize: "PDF • Trực tuyến",
          });
        }
      });

      setCandidates(mappedList);
      if (mappedList.length > 0) {
        setExpandedCandidateId(mappedList[0].id);
      }
    } catch (err: any) {
      console.error("Lỗi nạp talent pools:", err);
      setError(err?.message || "Không thể tải danh sách Talent Pool từ máy chủ.");
    } finally {
      setLoading(false);
    }
  }, [recruiterName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      message.error("Vui lòng nhập tên nhóm Talent Pool!");
      return;
    }
    setIsCreatingGroup(true);
    try {
      await employerService.createTalentPool({
        name: newGroupName.trim(),
        description: newGroupDesc.trim(),
      });
      message.success(`Đã tạo nhóm "${newGroupName}" thành công!`);
      setNewGroupName("");
      setNewGroupDesc("");
      setIsCreateGroupModalOpen(false);
      fetchData();
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Không thể tạo nhóm mới.");
    } finally {
      setIsCreatingGroup(false);
    }
  };

  // Toggle Favorite
  const toggleFavorite = (candidateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === candidateId) {
          const nextFav = !c.isFavorite;
          message.success(
            nextFav
              ? `Đã thêm "${c.name}" vào danh sách yêu thích!`
              : `Đã bỏ yêu thích "${c.name}"!`
          );
          return { ...c, isFavorite: nextFav };
        }
        return c;
      })
    );
  };

  // Toggle Expand
  const toggleExpand = (candidateId: string) => {
    setExpandedCandidateId((prev) => (prev === candidateId ? null : candidateId));
  };

  // Toggle Select All
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredCandidates.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Toggle Select Single
  const handleSelectSingle = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  // Tab count calculations
  const tabCounts = useMemo(() => {
    return {
      all: candidates.length,
      potential: candidates.filter((c) => c.status === "POTENTIAL" || c.isFavorite).length,
      tracking: candidates.filter((c) => c.status === "TRACKING").length,
      contacted: candidates.filter((c) => c.status === "CONTACTED").length,
      uncontacted: candidates.filter((c) => c.status === "UNCONTACTED").length,
      archived: candidates.filter((c) => c.status === "ARCHIVED").length,
    };
  }, [candidates]);

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
          c.desiredPosition.toLowerCase().includes(q) ||
          c.skills.some((s) => s.toLowerCase().includes(q)) ||
          c.tags.some((t) => t.toLowerCase().includes(q));
        if (!matches) return false;
      }
      // Status Tab
      if (activeTab === "potential" && c.status !== "POTENTIAL" && !c.isFavorite) return false;
      if (activeTab === "tracking" && c.status !== "TRACKING") return false;
      if (activeTab === "contacted" && c.status !== "CONTACTED") return false;
      if (activeTab === "uncontacted" && c.status !== "UNCONTACTED") return false;
      if (activeTab === "archived" && c.status !== "ARCHIVED") return false;

      // Group
      if (selectedGroup !== "all" && c.group !== selectedGroup) return false;
      // Position
      if (selectedPosition !== "all" && !c.desiredPosition.includes(selectedPosition)) return false;
      // Source
      if (selectedSource !== "all" && c.source !== selectedSource) return false;
      // Status dropdown
      if (selectedStatus !== "all" && c.status !== selectedStatus) return false;
      return true;
    });
  }, [
    candidates,
    searchQuery,
    activeTab,
    selectedGroup,
    selectedPosition,
    selectedSource,
    selectedStatus,
  ]);

  // Context Menu Items for candidate row
  const getRowMenuItems = (candidate: TalentCandidate) => {
    return [
      {
        key: "view-cv",
        label: (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setViewCvCandidate(candidate);
            }}
            className="flex items-center gap-2 py-0.5 font-medium text-slate-800"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>Xem CV đính kèm</span>
          </div>
        ),
      },
      {
        key: "edit-note",
        label: (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setEditingCandidate(candidate);
              setEditNoteContent(candidate.notes || "");
            }}
            className="flex items-center gap-2 py-0.5 font-medium text-slate-800"
          >
            <Edit3 className="w-3.5 h-3.5 text-blue-600" />
            <span>Chỉnh sửa ghi chú</span>
          </div>
        ),
      },
      {
        key: "move-pipeline",
        label: (
          <Link
            href={`/doanh-nghiep/pipeline?candidate=${candidate.id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 py-0.5 font-medium text-purple-700"
          >
            <ArrowRight className="w-3.5 h-3.5 text-purple-600" />
            <span>Chuyển sang Pipeline</span>
          </Link>
        ),
      },
      {
        key: "add-group",
        label: (
          <div
            onClick={(e) => {
              e.stopPropagation();
              message.info(`Đang thêm "${candidate.name}" vào nhóm...`);
            }}
            className="flex items-center gap-2 py-0.5 font-medium text-slate-800"
          >
            <FolderPlus className="w-3.5 h-3.5 text-amber-600" />
            <span>Thêm vào nhóm</span>
          </div>
        ),
      },
      { type: "divider" as const },
      {
        key: "archive",
        danger: true,
        label: (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setCandidates((prev) =>
                prev.map((c) => (c.id === candidate.id ? { ...c, status: "ARCHIVED" } : c))
              );
              message.success(`Đã lưu trữ hồ sơ "${candidate.name}"!`);
            }}
            className="flex items-center gap-2 py-0.5 text-rose-600 font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa khỏi Talent Pool</span>
          </div>
        ),
      },
    ];
  };

  return (
    <div className="space-y-3.5 max-w-[1680px] mx-auto w-full pb-8">
      {/* ======================================================== */}
      {/* 1. PAGE HEADER                                           */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 m-0 tracking-tight leading-snug">
            Talent Pool
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            <span>Nhập ứng viên</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm ứng viên vào pool</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. KPI CARDS (5 HORIZONTAL CARDS)                        */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Card 1: Tổng ứng viên */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs flex items-center gap-3.5 hover:border-blue-300 transition-all">
          <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0 shadow-2xs">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex-1 text-center min-w-0 pr-2">
            <span className="text-xs font-semibold text-slate-500 block leading-none">
              Tổng ứng viên
            </span>
            <span className="text-xl font-black text-slate-900 block my-1 leading-tight">
              {tabCounts.all}
            </span>
            <span className="text-[10px] font-bold text-slate-400 block leading-none">
              Kho nhân tài
            </span>
          </div>
        </div>

        {/* Card 2: Chưa liên hệ */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs flex items-center gap-3.5 hover:border-emerald-300 transition-all">
          <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
            <UserPlus className="w-5 h-5" />
          </div>
          <div className="flex-1 text-center min-w-0 pr-2">
            <span className="text-xs font-semibold text-slate-500 block leading-none">
              Chưa liên hệ
            </span>
            <span className="text-xl font-black text-slate-900 block my-1 leading-tight">
              {tabCounts.uncontacted}
            </span>
            <span className="text-[10px] font-bold text-slate-400 block leading-none">
              Hồ sơ mới
            </span>
          </div>
        </div>

        {/* Card 3: Đang theo dõi */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs flex items-center gap-3.5 hover:border-purple-300 transition-all">
          <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0 shadow-2xs">
            <Eye className="w-5 h-5" />
          </div>
          <div className="flex-1 text-center min-w-0 pr-2">
            <span className="text-xs font-semibold text-slate-500 block leading-none">
              Đang theo dõi
            </span>
            <span className="text-xl font-black text-slate-900 block my-1 leading-tight">
              {tabCounts.tracking}
            </span>
            <span className="text-[10px] font-bold text-blue-600 block leading-none">
              Đang xem xét
            </span>
          </div>
        </div>

        {/* Card 4: Đã liên hệ */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs flex items-center gap-3.5 hover:border-amber-300 transition-all">
          <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0 shadow-2xs">
            <Mail className="w-5 h-5" />
          </div>
          <div className="flex-1 text-center min-w-0 pr-2">
            <span className="text-xs font-semibold text-slate-500 block leading-none">
              Đã liên hệ
            </span>
            <span className="text-xl font-black text-slate-900 block my-1 leading-tight">
              {tabCounts.contacted}
            </span>
            <span className="text-[10px] font-bold text-emerald-600 block leading-none">
              Đang trao đổi
            </span>
          </div>
        </div>

        {/* Card 5: Tiềm năng cao */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs flex items-center gap-3.5 hover:border-rose-300 transition-all">
          <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center shrink-0 shadow-2xs">
            <Star className="w-5 h-5 fill-rose-600" />
          </div>
          <div className="flex-1 text-center min-w-0 pr-2">
            <span className="text-xs font-semibold text-slate-500 block leading-none">
              Tiềm năng cao
            </span>
            <span className="text-xl font-black text-slate-900 block my-1 leading-tight">
              {tabCounts.potential}
            </span>
            <span className="text-[10px] font-bold text-rose-600 block leading-none">
              Ưu tiên tuyển
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. MAIN WORKSPACE: TABLE (LEFT) + INSIGHTS (RIGHT)       */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* ====================================================== */}
        {/* LEFT COLUMN: TABLE WORKSPACE (~80% = 9.5 Cols)         */}
        {/* ====================================================== */}
        <div className="xl:col-span-8 2xl:col-span-9 space-y-3">
          {/* Card Container for Table */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs p-3.5 space-y-3">
            {/* Filter Toolbar */}
            <div className="flex items-center gap-2.5 flex-wrap justify-between">
              <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                {/* Search */}
                <div className="relative min-w-[200px] flex-1 max-w-xs">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm ứng viên, kỹ năng..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white rounded-xl border border-slate-200/90 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0062ff] transition-all"
                  />
                </div>

                {/* Filter 1: Nhóm */}
                <Select
                  value={selectedGroup}
                  onChange={setSelectedGroup}
                  className="custom-filter-select text-xs min-w-[125px]"
                  size="small"
                  options={[
                    { value: "all", label: "Tất cả nhóm" },
                    ...(talentPools.map((p: any) => ({ value: p.name, label: p.name }))),
                  ]}
                />

                {/* Filter 2: Kỹ năng */}
                <Select
                  value={selectedSkill}
                  onChange={setSelectedSkill}
                  className="custom-filter-select text-xs min-w-[125px]"
                  size="small"
                  options={[
                    { value: "all", label: "Tất cả kỹ năng" },
                    { value: "React", label: "React" },
                    { value: "Figma", label: "Figma" },
                    { value: "Product", label: "Product Strategy" },
                    { value: "SQL", label: "SQL" },
                    { value: "AWS", label: "AWS Cloud" },
                  ]}
                />

                {/* Filter 3: Vị trí mong muốn */}
                <Select
                  value={selectedPosition}
                  onChange={setSelectedPosition}
                  className="custom-filter-select text-xs min-w-[135px]"
                  size="small"
                  options={[
                    { value: "all", label: "Vị trí mong muốn" },
                    { value: "Product Manager", label: "Product Manager" },
                    { value: "Designer", label: "UI/UX Designer" },
                    { value: "Frontend", label: "Frontend Developer" },
                    { value: "Data", label: "Data Analyst" },
                    { value: "DevOps", label: "DevOps Engineer" },
                  ]}
                />

                {/* Filter 4: Nguồn */}
                <Select
                  value={selectedSource}
                  onChange={setSelectedSource}
                  className="custom-filter-select text-xs min-w-[125px]"
                  size="small"
                  options={[
                    { value: "all", label: "Nguồn ứng viên" },
                    { value: "LinkedIn", label: "LinkedIn" },
                    { value: "Referral", label: "Referral" },
                    { value: "TopCV", label: "TopCV" },
                    { value: "VietnamWorks", label: "VietnamWorks" },
                    { value: "Website", label: "Website" },
                  ]}
                />

                {/* Filter 5: Trạng thái */}
                <Select
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  className="custom-filter-select text-xs min-w-[120px]"
                  size="small"
                  options={[
                    { value: "all", label: "Trạng thái" },
                    { value: "POTENTIAL", label: "Tiềm năng cao" },
                    { value: "TRACKING", label: "Đang theo dõi" },
                    { value: "CONTACTED", label: "Đã liên hệ" },
                    { value: "UNCONTACTED", label: "Chưa liên hệ" },
                  ]}
                />
              </div>

              {/* Advanced Filter Button */}
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(true)}
                className="px-3 py-1.5 rounded-xl border border-slate-200/90 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all shrink-0"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <span>Bộ lọc</span>
              </button>
            </div>

            {/* Status Tabs Bar */}
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-1.5 flex-wrap">
              {/* Tabs */}
              <div className="flex items-center gap-4 text-xs font-bold overflow-x-auto">
                {[
                  { key: "all", label: "Tất cả", count: tabCounts.all },
                  { key: "potential", label: "Tiềm năng cao", count: tabCounts.potential },
                  { key: "tracking", label: "Đang theo dõi", count: tabCounts.tracking },
                  { key: "contacted", label: "Đã liên hệ", count: tabCounts.contacted },
                  { key: "uncontacted", label: "Chưa liên hệ", count: tabCounts.uncontacted },
                  { key: "archived", label: "Đã lưu trữ", count: tabCounts.archived },
                ].map((t) => {
                  const isActive = activeTab === t.key;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setActiveTab(t.key)}
                      className={`py-1.5 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap relative ${
                        isActive
                          ? "text-[#0062ff]"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <span>{t.label}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                          isActive
                            ? "bg-[#0062ff] text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {t.count.toLocaleString()}
                      </span>
                      {isActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0062ff] rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Sắp xếp */}
              <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
                <span>Sắp xếp:</span>
                <Select
                  value={sortBy}
                  onChange={setSortBy}
                  size="small"
                  className="w-28 text-xs font-semibold"
                  options={[
                    { value: "newest", label: "Mới nhất" },
                    { value: "oldest", label: "Cũ nhất" },
                    { value: "name", label: "Theo tên A-Z" },
                    { value: "exp", label: "Kinh nghiệm" },
                  ]}
                />
              </div>
            </div>

            {/* Bulk Selection Floating Bar */}
            {selectedIds.length > 0 && (
              <div className="p-2.5 bg-blue-50/90 rounded-xl border border-blue-200 flex items-center justify-between gap-3 text-xs">
                <span className="font-bold text-blue-900">
                  Đã chọn <strong>{selectedIds.length}</strong> ứng viên
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => message.success(`Đã thêm ${selectedIds.length} ứng viên vào nhóm!`)}
                    className="px-3 py-1 bg-white hover:bg-slate-50 text-blue-700 font-bold rounded-lg border border-blue-200 cursor-pointer shadow-2xs"
                  >
                    Thêm vào nhóm
                  </button>

                  <button
                    type="button"
                    onClick={() => message.info("Gửi email hàng loạt đang phát triển...")}
                    className="px-3 py-1 bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold rounded-lg cursor-pointer shadow-2xs"
                  >
                    Gửi email
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedIds([])}
                    className="p-1 hover:bg-blue-100 rounded-md text-slate-500 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* TALENT POOL TABLE */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/90 shadow-xs bg-white">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[760px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-[11.5px] font-extrabold text-slate-700 uppercase tracking-wider">
                    <th className="py-3 px-3 w-8 text-center">
                      <Checkbox
                        checked={
                          selectedIds.length === filteredCandidates.length &&
                          filteredCandidates.length > 0
                        }
                        indeterminate={
                          selectedIds.length > 0 &&
                          selectedIds.length < filteredCandidates.length
                        }
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </th>
                    <th className="py-3 px-3 text-left">Ứng viên</th>
                    <th className="py-3 px-3 text-center">Vị trí mong muốn</th>
                    <th className="py-3 px-3 text-center">Kỹ năng nổi bật</th>
                    <th className="py-3 px-3 text-center">Nguồn</th>
                    <th className="py-3 px-3 text-center">Trạng thái</th>
                    <th className="py-3 px-3 text-center">Thêm vào pool</th>
                    <th className="py-3 px-3 text-center">Thao tác</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center">
                        <Spin tip="Đang tải danh sách hồ sơ Talent Pool..." />
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={8} className="p-6">
                        <Alert
                          type="error"
                          showIcon
                          message="Lỗi tải dữ liệu"
                          description={error}
                          action={
                            <button
                              type="button"
                              onClick={fetchData}
                              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                            >
                              Tải lại
                            </button>
                          }
                        />
                      </td>
                    </tr>
                  ) : filteredCandidates.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-14 text-center">
                        <Empty
                          description="Chưa có ứng viên nào trong Talent Pool"
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                      </td>
                    </tr>
                  ) : (
                    filteredCandidates.map((candidate) => {
                    const isExpanded = expandedCandidateId === candidate.id;
                    const isChecked = selectedIds.includes(candidate.id);
                    const statusInfo = STATUS_CONFIG[candidate.status] || STATUS_CONFIG.TRACKING;

                    return (
                      <Fragment key={candidate.id}>
                        {/* Candidate Row */}
                        <tr
                          onClick={() => toggleExpand(candidate.id)}
                          className={`hover:bg-blue-50/30 transition-colors cursor-pointer group ${
                            isExpanded ? "bg-[#F9FBFF]" : ""
                          }`}
                        >
                          {/* Checkbox & Favorite */}
                          <td
                            className="py-3.5 px-3 shrink-0 text-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-center gap-1.5">
                              <Checkbox
                                checked={isChecked}
                                onChange={(e) => handleSelectSingle(candidate.id, e.target.checked)}
                              />
                              <button
                                type="button"
                                onClick={(e) => toggleFavorite(candidate.id, e)}
                                className="p-0.5 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
                              >
                                <Star
                                  className={`w-4 h-4 ${
                                    candidate.isFavorite
                                      ? "text-amber-400 fill-amber-400"
                                      : ""
                                  }`}
                                />
                              </button>
                            </div>
                          </td>

                          {/* Candidate Cell */}
                          <td className="py-3.5 px-3 text-left">
                            <div className="flex items-center gap-2.5">
                              <Avatar
                                src={candidate.avatar}
                                size={40}
                                className="border border-slate-200 shrink-0 shadow-2xs"
                              />
                              <div className="min-w-0">
                                <span className="font-bold text-slate-900 text-[15px] block leading-tight group-hover:text-[#0062ff] transition-colors">
                                  {candidate.name}
                                </span>
                                <span className="text-[12px] text-slate-500 font-medium block truncate mt-0.5">
                                  {candidate.email}
                                </span>
                                <span className="text-[11.5px] text-slate-500 font-mono block">
                                  {candidate.phone}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Desired Position */}
                          <td className="py-3.5 px-3 text-center">
                            <span className="font-bold text-slate-900 text-[13.5px] block leading-snug">
                              {candidate.desiredPosition}
                            </span>
                            <span className="text-[12px] text-slate-500 font-medium block mt-0.5">
                              {candidate.experienceYears} năm kinh nghiệm
                            </span>
                          </td>

                          {/* Skills */}
                          <td className="py-3.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              {candidate.skills.slice(0, 3).map((skill, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-medium text-[11.5px] border border-slate-200/60"
                                >
                                  {skill}
                                </span>
                              ))}
                              {candidate.skills.length > 3 && (
                                <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 font-bold text-[11px]">
                                  +{candidate.skills.length - 3}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Source */}
                          <td className="py-3.5 px-3 text-center whitespace-nowrap">
                            <div className="flex justify-center">
                              {renderSourceBadge(candidate.source)}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-3 text-center whitespace-nowrap">
                            <span
                              className={`px-3 py-0.5 rounded-full font-bold text-[11px] border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                            >
                              {statusInfo.label}
                            </span>
                          </td>

                          {/* Added to Pool Date */}
                          <td className="py-3.5 px-3 text-center whitespace-nowrap">
                            <span className="font-semibold text-slate-900 text-[13px] block">
                              {candidate.addedDate}
                            </span>
                            <span className="text-[11.5px] text-slate-500 block mt-0.5">
                              {candidate.addedTimeAgo}
                            </span>
                          </td>

                          {/* Action Buttons */}
                          <td
                            className="py-3.5 px-3 text-center whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-center gap-1.5">
                              <Tooltip title="Gửi tin nhắn">
                                <button
                                  type="button"
                                  onClick={() => message.info(`Nhắn tin cho ${candidate.name}`)}
                                  className="w-8 h-8 rounded-lg hover:bg-blue-50 text-slate-500 hover:text-[#0062ff] flex items-center justify-center transition-colors cursor-pointer border border-transparent hover:border-blue-200"
                                >
                                  <MessageSquare className="w-4 h-4" />
                                </button>
                              </Tooltip>

                              <Tooltip title="Gửi email">
                                <button
                                  type="button"
                                  onClick={() => message.info(`Gửi email cho ${candidate.email}`)}
                                  className="w-8 h-8 rounded-lg hover:bg-blue-50 text-slate-500 hover:text-[#0062ff] flex items-center justify-center transition-colors cursor-pointer border border-transparent hover:border-blue-200"
                                >
                                  <Mail className="w-4 h-4" />
                                </button>
                              </Tooltip>

                              <Dropdown
                                menu={{ items: getRowMenuItems(candidate) }}
                                trigger={["click"]}
                                placement="bottomRight"
                                arrow
                              >
                                <button
                                  type="button"
                                  className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </button>
                              </Dropdown>
                            </div>
                          </td>
                        </tr>

                        {/* ====================================================== */}
                        {/* 15. EXPANDED ROW (INLINE UNDER CANDIDATE)              */}
                        {/* ====================================================== */}
                        {isExpanded && (
                          <tr className="bg-gradient-to-r from-blue-50/50 via-indigo-50/20 to-blue-50/50 border-t-2 border-b-2 border-blue-200/90 shadow-inner">
                            <td colSpan={8} className="p-4 sm:p-5">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                                {/* CỘT 1: THÔNG TIN CÁ NHÂN */}
                                <div className="p-3.5 bg-white rounded-2xl border border-blue-100 shadow-2xs space-y-3">
                                  <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2">
                                    <div className="w-5 h-5 rounded-md bg-blue-100 text-[#0062ff] flex items-center justify-center">
                                      <Users className="w-3 h-3" />
                                    </div>
                                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                                      Thông tin cá nhân
                                    </span>
                                  </div>

                                  <div className="space-y-2 text-slate-600">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0 border border-blue-100">
                                        <Mail className="w-3.5 h-3.5" />
                                      </div>
                                      <span className="font-medium text-slate-800 truncate">{candidate.email}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                                        <Phone className="w-3.5 h-3.5" />
                                      </div>
                                      <span className="font-mono text-slate-800 font-medium">{candidate.phone}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                                        <MapPin className="w-3.5 h-3.5" />
                                      </div>
                                      <span className="font-medium text-slate-700">{candidate.location || "Hồ Chí Minh, Việt Nam"}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                                        <Briefcase className="w-3.5 h-3.5" />
                                      </div>
                                      <span className="font-medium text-slate-700">{candidate.experienceYears} năm kinh nghiệm</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                                        <DollarSign className="w-3.5 h-3.5" />
                                      </div>
                                      <span>Lương kỳ vọng: <strong className="text-emerald-600 font-bold">{candidate.expectedSalary || "$1,500 – $2,000"}</strong></span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center shrink-0 border border-cyan-100">
                                        <Building className="w-3.5 h-3.5" />
                                      </div>
                                      <span className="font-medium text-slate-700">Hình thức: <strong>{candidate.workingMode || "Hybrid"}</strong></span>
                                    </div>
                                  </div>
                                </div>

                                {/* CỘT 2: GIỚI THIỆU NGẮN & GHI CHÚ */}
                                <div className="p-3.5 bg-white rounded-2xl border border-purple-100 shadow-2xs space-y-3 flex flex-col justify-between">
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2">
                                      <div className="w-5 h-5 rounded-md bg-purple-100 text-purple-600 flex items-center justify-center">
                                        <Sparkles className="w-3 h-3" />
                                      </div>
                                      <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                                        Giới thiệu ngắn
                                      </span>
                                    </div>
                                    <p className="text-slate-600 m-0 leading-relaxed font-medium line-clamp-3 bg-purple-50/30 p-2.5 rounded-xl border border-purple-100/60">
                                      {candidate.bio || "Ứng viên có năng lực chuyên môn vững vàng, khả năng giao tiếp và tư duy giải quyết vấn đề tốt."}
                                    </p>
                                  </div>

                                  <div className="p-3 bg-gradient-to-br from-amber-50 to-orange-50/40 rounded-xl border border-amber-200/90 space-y-1.5 shadow-2xs">
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-amber-900 text-[11.5px] flex items-center gap-1">
                                        <span>📝</span> Ghi chú nội bộ
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingCandidate(candidate);
                                          setEditNoteContent(candidate.notes || "");
                                        }}
                                        className="p-1 hover:bg-amber-100 rounded-md text-amber-700 hover:text-amber-900 transition-colors"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                    <p className="text-slate-700 text-[11px] m-0 font-medium italic">
                                      "{candidate.notes}"
                                    </p>
                                    <div className="pt-1 flex items-center justify-between">
                                      <span className="text-[10px] text-amber-800 font-bold bg-white/80 px-2 py-0.5 rounded-md border border-amber-200/70">
                                        Cập nhật bởi {candidate.notesUpdatedBy || "Mai Phương"} • {candidate.notesUpdatedAt || "18/08/2026"}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* CỘT 3: CV & TÀI LIỆU */}
                                <div className="p-3.5 bg-white rounded-2xl border border-emerald-100 shadow-2xs space-y-2.5">
                                  <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2">
                                    <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                      <FileText className="w-3 h-3" />
                                    </div>
                                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                                      CV & Tài liệu
                                    </span>
                                  </div>

                                  {/* PDF Card */}
                                  <div className="p-2.5 bg-gradient-to-r from-rose-50/80 to-white hover:from-rose-100/80 rounded-xl border border-rose-200 flex items-center justify-between transition-all shadow-2xs">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                                        <FileText className="w-5 h-5" />
                                      </div>
                                      <div className="min-w-0">
                                        <span className="font-bold text-slate-800 text-[11.5px] block truncate">
                                          {candidate.cvName}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-medium block">
                                          {candidate.cvSize}
                                        </span>
                                      </div>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => message.success("Đang tải xuống CV...")}
                                      className="p-1.5 bg-white hover:bg-rose-500 hover:text-white rounded-lg text-slate-600 border border-slate-200 transition-all cursor-pointer shrink-0 shadow-2xs"
                                    >
                                      <Download className="w-4 h-4" />
                                    </button>
                                  </div>

                                  {/* LinkedIn Link Card */}
                                  {candidate.linkedInUrl && (
                                    <div className="p-2.5 bg-gradient-to-r from-blue-50/80 to-white hover:from-blue-100/80 rounded-xl border border-blue-200 flex items-center justify-between transition-all shadow-2xs">
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-9 h-9 rounded-xl bg-[#0A66C2] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                                          in
                                        </div>
                                        <div className="min-w-0">
                                          <span className="font-bold text-slate-800 text-[11.5px] block">
                                            LinkedIn Profile
                                          </span>
                                          <span className="text-[10px] text-blue-600 font-medium block truncate">
                                            {candidate.linkedInUrl}
                                          </span>
                                        </div>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => message.info(`Mở ${candidate.linkedInUrl}`)}
                                        className="p-1.5 bg-white hover:bg-blue-600 hover:text-white rounded-lg text-slate-600 border border-slate-200 transition-all cursor-pointer shrink-0 shadow-2xs"
                                      >
                                        <ExternalLink className="w-4 h-4" />
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {/* CỘT 4: TAGS */}
                                <div className="p-3.5 bg-white rounded-2xl border border-amber-100 shadow-2xs space-y-2.5 flex flex-col justify-between">
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2">
                                      <div className="w-5 h-5 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center">
                                        <TagIcon className="w-3 h-3" />
                                      </div>
                                      <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                                        Tags phân loại
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      {candidate.tags.map((tag, tIdx) => {
                                        const tagTheme =
                                          tIdx % 4 === 0
                                            ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                                            : tIdx % 4 === 1
                                            ? "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                                            : tIdx % 4 === 2
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                            : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100";

                                        return (
                                          <span
                                            key={tIdx}
                                            className={`px-2.5 py-1 rounded-xl font-bold text-[11px] border transition-all cursor-pointer shadow-2xs ${tagTheme}`}
                                          >
                                            #{tag}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => message.info("Tính năng gắn Tag bổ sung...")}
                                    className="w-full py-2 rounded-xl border border-dashed border-blue-300 bg-blue-50/70 hover:bg-blue-100 text-[#0062ff] font-bold text-[11.5px] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Thêm tag phân loại</span>
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })
                )}
                </tbody>
              </table>
            </div>
          </div>

            {/* Pagination */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500 flex-wrap gap-3">
              <span>
                Hiển thị {filteredCandidates.length === 0 ? 0 : 1} –{" "}
                {Math.min(pageSize, filteredCandidates.length)} trong tổng số{" "}
                <strong>{filteredCandidates.length}</strong> ứng viên
              </span>

              <div className="flex items-center gap-2">
                <Pagination
                  current={currentPage}
                  onChange={(p) => setCurrentPage(p)}
                  total={filteredCandidates.length}
                  pageSize={pageSize}
                  showSizeChanger={false}
                  size="small"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ====================================================== */}
        {/* RIGHT COLUMN: TALENT INSIGHTS (~20% = 3.5 Cols)        */}
        {/* ====================================================== */}
        <div className="xl:col-span-4 2xl:col-span-3 space-y-3">
          {/* Card 1: Nguồn ứng viên (Donut Chart) */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 m-0">Nguồn ứng viên</h3>
              <Select
                defaultValue="30days"
                size="small"
                className="text-[11px]"
                options={[
                  { value: "30days", label: "30 ngày" },
                  { value: "90days", label: "3 tháng" },
                ]}
              />
            </div>

            {/* Donut Representation */}
            <div className="flex items-center justify-center py-2">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* LinkedIn ~33.3% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#0A66C2"
                    strokeWidth="11"
                    strokeDasharray="79.5 238.7"
                    strokeDashoffset="0"
                  />
                  {/* Website ~25.8% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="11"
                    strokeDasharray="61.6 238.7"
                    strokeDashoffset="-79.5"
                  />
                  {/* Referral ~17.2% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="11"
                    strokeDasharray="41 238.7"
                    strokeDashoffset="-141.1"
                  />
                  {/* TopCV ~11.8% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="11"
                    strokeDasharray="28.2 238.7"
                    strokeDashoffset="-182.1"
                  />
                  {/* VietnamWorks ~8.6% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="11"
                    strokeDasharray="20.5 238.7"
                    strokeDashoffset="-210.3"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-base font-black text-slate-900 block leading-tight">
                    1,860
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    Tổng ứng viên
                  </span>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-[#0A66C2]" />
                  <span>LinkedIn</span>
                </span>
                <span className="font-bold text-slate-900">620 <span className="text-[9.5px] font-normal text-slate-400">(33.3%)</span></span>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                  <span>Website</span>
                </span>
                <span className="font-bold text-slate-900">480 <span className="text-[9.5px] font-normal text-slate-400">(25.8%)</span></span>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
                  <span>Referral</span>
                </span>
                <span className="font-bold text-slate-900">320 <span className="text-[9.5px] font-normal text-slate-400">(17.2%)</span></span>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                  <span>TopCV</span>
                </span>
                <span className="font-bold text-slate-900">220 <span className="text-[9.5px] font-normal text-slate-400">(11.8%)</span></span>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                  <span>VietnamWorks</span>
                </span>
                <span className="font-bold text-slate-900">160 <span className="text-[9.5px] font-normal text-slate-400">(8.6%)</span></span>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                  <span>Khác</span>
                </span>
                <span className="font-bold text-slate-900">60 <span className="text-[9.5px] font-normal text-slate-400">(3.3%)</span></span>
              </div>
            </div>
          </div>

          {/* Card 2: Kỹ năng phổ biến */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 m-0">Kỹ năng phổ biến</h3>
              <span className="text-[11px] font-bold text-[#0062ff] cursor-pointer hover:underline">
                Xem tất cả
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-bold text-slate-800">JavaScript</span>
                  <span className="font-bold text-slate-900">780 <span className="font-normal text-slate-400">(41.9%)</span></span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-[#0062ff] h-full rounded-full" style={{ width: "41.9%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-bold text-slate-800">React</span>
                  <span className="font-bold text-slate-900">610 <span className="font-normal text-slate-400">(32.8%)</span></span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-[#0062ff] h-full rounded-full" style={{ width: "32.8%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-bold text-slate-800">Node.js</span>
                  <span className="font-bold text-slate-900">480 <span className="font-normal text-slate-400">(25.8%)</span></span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-[#0062ff] h-full rounded-full" style={{ width: "25.8%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-bold text-slate-800">Python</span>
                  <span className="font-bold text-slate-900">410 <span className="font-normal text-slate-400">(22.0%)</span></span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-[#0062ff] h-full rounded-full" style={{ width: "22.0%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-bold text-slate-800">SQL</span>
                  <span className="font-bold text-slate-900">390 <span className="font-normal text-slate-400">(21.0%)</span></span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-[#0062ff] h-full rounded-full" style={{ width: "21.0%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Tương tác gần đây */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 m-0">Tương tác gần đây</h3>
              <span className="text-[11px] font-bold text-[#0062ff] cursor-pointer hover:underline">
                Xem tất cả
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50/60 border border-slate-100">
                <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 text-[10px] font-bold">
                  ✉
                </div>
                <div className="min-w-0 flex-1">
                  <strong className="text-slate-900 text-xs block">Trần Hoàng Nam</strong>
                  <span className="text-[10.5px] text-slate-500 font-medium block">
                    Đã mở email của bạn
                  </span>
                  <span className="text-[9.5px] text-slate-400 block mt-0.5">1 giờ trước</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50/60 border border-slate-100">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 text-[10px] font-bold">
                  👁
                </div>
                <div className="min-w-0 flex-1">
                  <strong className="text-slate-900 text-xs block">Nguyễn Minh Anh</strong>
                  <span className="text-[10.5px] text-slate-500 font-medium block">
                    Đã xem tin tuyển dụng
                  </span>
                  <span className="text-[9.5px] text-slate-400 block mt-0.5">3 giờ trước</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50/60 border border-slate-100">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 text-[10px] font-bold">
                  💬
                </div>
                <div className="min-w-0 flex-1">
                  <strong className="text-slate-900 text-xs block">Phạm Thu Hằng</strong>
                  <span className="text-[10.5px] text-slate-500 font-medium block">
                    Đã phản hồi tin nhắn
                  </span>
                  <span className="text-[9.5px] text-slate-400 block mt-0.5">5 giờ trước</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Thao tác nhanh (3 x 2 Grid) */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs p-3.5 space-y-2.5">
            <h3 className="text-xs font-black text-slate-900 m-0">Thao tác nhanh</h3>

            <div className="grid grid-cols-3 gap-2">
              <div
                onClick={() => setIsAddModalOpen(true)}
                className="p-2.5 bg-blue-50/70 hover:bg-blue-100 rounded-xl border border-blue-100 text-center space-y-1 transition-all h-full flex flex-col items-center justify-center cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-[#0062ff] text-white flex items-center justify-center shadow-2xs">
                  <UserPlus className="w-3 h-3" />
                </div>
                <span className="text-[9.5px] font-bold text-blue-900 block leading-tight">
                  Thêm ứng viên
                </span>
              </div>

              <div
                onClick={() => setIsFilterModalOpen(true)}
                className="p-2.5 bg-emerald-50/70 hover:bg-emerald-100 rounded-xl border border-emerald-100 text-center space-y-1 transition-all h-full flex flex-col items-center justify-center cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                  <Search className="w-3 h-3" />
                </div>
                <span className="text-[9.5px] font-bold text-emerald-900 block leading-tight">
                  Tìm kiếm nâng cao
                </span>
              </div>

              <div
                onClick={() => setIsCreateGroupModalOpen(true)}
                className="p-2.5 bg-purple-50/70 hover:bg-purple-100 rounded-xl border border-purple-100 text-center space-y-1 transition-all h-full flex flex-col items-center justify-center cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-2xs">
                  <FolderPlus className="w-3 h-3" />
                </div>
                <span className="text-[9.5px] font-bold text-purple-900 block leading-tight">
                  Tạo nhóm mới
                </span>
              </div>

              <div
                onClick={() => message.info("Gửi email hàng loạt đang phát triển...")}
                className="p-2.5 bg-amber-50/70 hover:bg-amber-100 rounded-xl border border-amber-100 text-center space-y-1 transition-all h-full flex flex-col items-center justify-center cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-2xs">
                  <Mail className="w-3 h-3" />
                </div>
                <span className="text-[9.5px] font-bold text-amber-900 block leading-tight">
                  Gửi email hàng loạt
                </span>
              </div>

              <div
                onClick={() => message.info("Đang kết xuất báo cáo Talent Pool...")}
                className="p-2.5 bg-cyan-50/70 hover:bg-cyan-100 rounded-xl border border-cyan-100 text-center space-y-1 transition-all h-full flex flex-col items-center justify-center cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-cyan-600 text-white flex items-center justify-center shadow-2xs">
                  <FileSpreadsheet className="w-3 h-3" />
                </div>
                <span className="text-[9.5px] font-bold text-cyan-900 block leading-tight">
                  Xuất báo cáo
                </span>
              </div>

              <div
                onClick={() => message.info("Đang quét và xóa hồ sơ trùng lặp...")}
                className="p-2.5 bg-rose-50/70 hover:bg-rose-100 rounded-xl border border-rose-100 text-center space-y-1 transition-all h-full flex flex-col items-center justify-center cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-rose-500 text-white flex items-center justify-center shadow-2xs">
                  <Trash2 className="w-3 h-3" />
                </div>
                <span className="text-[9.5px] font-bold text-rose-900 block leading-tight">
                  Xóa trùng lặp
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 4. CENTER MODALS                                                      */}
      {/* ===================================================================== */}

      {/* Modal 1: Thêm ứng viên vào Pool */}
      <Modal
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        footer={null}
        width={560}
        centered
        destroyOnHidden
        title={null}
      >
        <div className="space-y-4 p-1">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0062ff] flex items-center justify-center shadow-2xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 m-0">Thêm ứng viên vào Talent Pool</h3>
              <span className="text-xs text-slate-500 font-medium">
                Lưu trữ hồ sơ ứng viên tiềm năng vào kho tài nguyên công ty
              </span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Họ và tên *</label>
                <Input placeholder="Nguyễn Văn A" className="rounded-xl text-xs" />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Email *</label>
                <Input placeholder="email@example.com" className="rounded-xl text-xs" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Số điện thoại</label>
                <Input placeholder="0901 234 567" className="rounded-xl text-xs" />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Vị trí mong muốn</label>
                <Input placeholder="Senior Frontend Developer" className="rounded-xl text-xs" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nhóm phân loại</label>
                <Select
                  defaultValue="Engineering"
                  className="w-full text-xs"
                  options={[
                    { value: "Engineering", label: "Engineering / Tech" },
                    { value: "Product", label: "Product Management" },
                    { value: "Design", label: "Design UI/UX" },
                    { value: "Data", label: "Data Analytics" },
                  ]}
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nguồn ứng viên</label>
                <Select
                  defaultValue="LinkedIn"
                  className="w-full text-xs"
                  options={[
                    { value: "LinkedIn", label: "LinkedIn" },
                    { value: "Referral", label: "Referral (Giới thiệu)" },
                    { value: "TopCV", label: "TopCV" },
                    { value: "Website", label: "Website Careza" },
                  ]}
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Kỹ năng chính (cách nhau bởi dấu phẩy)</label>
              <Input placeholder="React, TypeScript, Next.js" className="rounded-xl text-xs" />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Ghi chú ban đầu</label>
              <Input.TextArea
                rows={2}
                placeholder="Ghi chú đánh giá tiềm năng..."
                className="rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                message.success("Đã thêm ứng viên vào Talent Pool thành công!");
              }}
              className="px-5 py-2 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs shadow-md cursor-pointer"
            >
              Lưu ứng viên
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal 2: Nhập ứng viên (Import) */}
      <Modal
        open={isImportModalOpen}
        onCancel={() => setIsImportModalOpen(false)}
        footer={null}
        width={500}
        centered
        destroyOnHidden
        title={null}
      >
        <div className="space-y-4 p-1 text-xs">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 m-0">Nhập danh sách ứng viên</h3>
              <span className="text-xs text-slate-500 font-medium">
                Hỗ trợ tệp tin định dạng Excel (.xlsx, .csv) hoặc tệp ZIP chứa CV
              </span>
            </div>
          </div>

          <div className="p-8 border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl text-center space-y-2 cursor-pointer bg-slate-50/50 hover:bg-blue-50/20 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-white text-blue-600 flex items-center justify-center mx-auto shadow-2xs border border-slate-200">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-slate-800 text-xs block">
                Kéo & thả tệp tin vào đây hoặc <span className="text-[#0062ff]">Chọn từ máy tính</span>
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Dung lượng tối đa 25MB
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => message.info("Đang tải file Excel mẫu...")}
              className="text-xs text-[#0062ff] font-bold hover:underline"
            >
              📥 Tải file mẫu (.xlsx)
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsImportModalOpen(false);
                  message.success("Đang xử lý nhập dữ liệu...");
                }}
                className="px-5 py-2 rounded-xl bg-[#0062ff] text-white font-bold text-xs shadow-md"
              >
                Bắt đầu nhập
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal 3: Xem CV */}
      <Modal
        open={!!viewCvCandidate}
        onCancel={() => setViewCvCandidate(null)}
        footer={null}
        width={740}
        centered
        destroyOnHidden
        title={null}
      >
        {viewCvCandidate && (
          <div className="space-y-4 p-1">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 m-0">
                  CV của {viewCvCandidate.name}
                </h3>
                <span className="text-xs text-slate-500 font-medium">{viewCvCandidate.cvName}</span>
              </div>

              <button
                type="button"
                onClick={() => message.success("Đang tải xuống tệp PDF...")}
                className="px-3.5 py-1.5 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải xuống</span>
              </button>
            </div>

            <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200 min-h-[400px] flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-white text-rose-500 border border-slate-200 flex items-center justify-center shadow-md">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 m-0">{viewCvCandidate.cvName}</h4>
                <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
                  {viewCvCandidate.cvSize} • Đã quét an toàn bảo mật
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-left text-xs text-slate-700 max-w-md w-full space-y-1.5 shadow-2xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Ứng viên:</span>
                  <strong className="text-slate-800">{viewCvCandidate.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Vị trí:</span>
                  <strong className="text-[#0062ff]">{viewCvCandidate.desiredPosition}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Kỹ năng:</span>
                  <strong>{viewCvCandidate.skills.join(", ")}</strong>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setViewCvCandidate(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal 4: Chỉnh sửa ghi chú */}
      <Modal
        open={!!editingCandidate}
        onCancel={() => setEditingCandidate(null)}
        footer={null}
        width={500}
        centered
        destroyOnHidden
        title={null}
      >
        {editingCandidate && (
          <div className="space-y-4 p-1 text-xs">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0062ff] flex items-center justify-center shadow-2xs">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 m-0">
                  Ghi chú nội bộ: {editingCandidate.name}
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  {editingCandidate.desiredPosition}
                </span>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1.5">
                Nội dung đánh giá & ghi chú:
              </label>
              <Input.TextArea
                rows={4}
                value={editNoteContent}
                onChange={(e) => setEditNoteContent(e.target.value)}
                placeholder="Nhập ghi chú cho hội đồng tuyển dụng..."
                className="rounded-xl text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingCandidate(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  setCandidates((prev) =>
                    prev.map((c) =>
                      c.id === editingCandidate.id
                        ? {
                            ...c,
                            notes: editNoteContent,
                            notesUpdatedBy: recruiterName,
                            notesUpdatedAt: "Hôm nay",
                          }
                        : c
                    )
                  );
                  setEditingCandidate(null);
                  message.success("Đã cập nhật ghi chú thành công!");
                }}
                className="px-5 py-2 rounded-xl bg-[#0062ff] text-white font-bold text-xs shadow-md"
              >
                Lưu ghi chú
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal 5: Tạo nhóm mới */}
      <Modal
        open={isCreateGroupModalOpen}
        onCancel={() => setIsCreateGroupModalOpen(false)}
        footer={null}
        width={460}
        centered
        destroyOnHidden
        title={null}
      >
        <div className="space-y-4 p-1 text-xs">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-2xs">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 m-0">Tạo nhóm Talent Pool mới</h3>
              <span className="text-xs text-slate-500 font-medium">
                Phân loại ứng viên theo chuyên môn hoặc dự án
              </span>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Tên nhóm *</label>
            <Input
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Ví dụ: Senior Backend Engineers..."
              className="rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Mô tả nhóm</label>
            <Input.TextArea
              rows={2}
              value={newGroupDesc}
              onChange={(e) => setNewGroupDesc(e.target.value)}
              placeholder="Mô tả tiêu chí tuyển dụng của nhóm này..."
              className="rounded-xl text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateGroupModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={isCreatingGroup}
              onClick={handleCreateGroup}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isCreatingGroup ? "Đang tạo..." : "Tạo nhóm"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal 6: Bộ lọc nâng cao */}
      <Modal
        open={isFilterModalOpen}
        onCancel={() => setIsFilterModalOpen(false)}
        footer={null}
        width={440}
        centered
        destroyOnHidden
        closable={false}
        title={null}
      >
        <div className="space-y-4 p-1 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 m-0">Bộ lọc Talent Pool</h3>
            <button
              type="button"
              onClick={() => setIsFilterModalOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Nhóm chuyên môn:</label>
            <Select
              value={selectedGroup}
              onChange={setSelectedGroup}
              className="w-full"
              options={[
                { value: "all", label: "Tất cả nhóm" },
                { value: "Product", label: "Product Management" },
                { value: "Design", label: "UI/UX Design" },
                { value: "Engineering", label: "Engineering" },
                { value: "Data", label: "Data Analytics" },
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
                { value: "LinkedIn", label: "LinkedIn" },
                { value: "Referral", label: "Referral" },
                { value: "TopCV", label: "TopCV" },
                { value: "VietnamWorks", label: "VietnamWorks" },
                { value: "Website", label: "Website Careza" },
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
                setSelectedGroup("all");
                setSelectedSkill("all");
                setSelectedPosition("all");
                setSelectedSource("all");
                setSelectedStatus("all");
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

export default function EmployerTalentPoolPage() {
  return (
    <App>
      <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400 font-bold">Đang tải Talent Pool...</div>}>
        <EmployerTalentPoolContent />
      </Suspense>
    </App>
  );
}
