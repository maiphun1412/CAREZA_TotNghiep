"use client";

import React, { useState, useMemo, Fragment } from "react";
import {
  Send,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  Flag,
  Search,
  Filter,
  Plus,
  FileText,
  Download,
  Eye,
  Edit3,
  MoreHorizontal,
  Calendar,
  AlertTriangle,
  ChevronDown,
  CheckSquare,
  Square,
  Building,
  DollarSign,
  Briefcase,
  FileCheck,
  Award,
  ChevronRight,
  ChevronLeft,
  X,
  Mail,
  UserCheck,
  Layers,
  Sparkles,
  FileSpreadsheet,
  Trash2,
  ExternalLink,
  RefreshCw,
  Copy,
} from "lucide-react";
import {
  Avatar,
  Dropdown,
  Tooltip,
  Checkbox,
  Modal,
  Input,
  Select,
  DatePicker,
  Progress,
  App,
  Tabs,
} from "antd";
import { useAuthStore } from "@/store/auth-store";

// =====================================================================
// INTERFACES & TYPES
// =====================================================================

export type OfferStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED"
  | "CANCELLED"
  | "DRAFT";

export type OnboardingStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "NONE";

export interface DocumentItem {
  id: string;
  name: string;
  type: string;
  status: "SUBMITTED" | "PENDING" | "PENDING_SIGN" | "SIGNED";
  expiryDate?: string;
  expiryDaysRemaining?: number;
  uploadedDate?: string;
}

export interface ChecklistItem {
  id: string;
  category: "BEFORE_START" | "FIRST_DAY" | "FIRST_WEEK";
  label: string;
  done: boolean;
}

export interface OfferCandidate {
  id: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  avatar: string;
  jobTitle: string;
  department: string;
  salary: number;
  salaryFormatted: string;
  salaryType: string;
  currency: string;
  sentDate: string;
  sentTime: string;
  deadline: string;
  deadlineDaysRemaining: number | null;
  deadlineStatus: "ACTIVE" | "EXPIRED" | "RESPONDED";
  status: OfferStatus;
  onboardingStatus: OnboardingStatus;
  onboardingProgress: number; // 0 - 100
  startDate: string;
  contractType: string;
  probationPeriod: string;
  hrAssigned: string;
  templateName: string;
  notes?: string;
  documents: DocumentItem[];
  checklist: ChecklistItem[];
}

// =====================================================================
// INITIAL DATASET (MATCHING 100% REFERENCE SCREENSHOT)
// =====================================================================

const INITIAL_OFFER_CANDIDATES: OfferCandidate[] = [
  {
    id: "off-01",
    candidateName: "Nguyễn Minh Anh",
    candidateEmail: "minhanh@email.com",
    candidatePhone: "0345 678 901",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    jobTitle: "Product Manager",
    department: "Phòng Sản phẩm",
    salary: 25000000,
    salaryFormatted: "25,000,000 VNĐ",
    salaryType: "Lương gross / tháng",
    currency: "VNĐ",
    sentDate: "20/08/2026",
    sentTime: "10:30",
    deadline: "27/08/2026",
    deadlineDaysRemaining: 5,
    deadlineStatus: "ACTIVE",
    status: "PENDING",
    onboardingStatus: "NOT_STARTED",
    onboardingProgress: 0,
    startDate: "01/09/2026",
    contractType: "Hợp đồng không xác định thời hạn",
    probationPeriod: "2 tháng (85% lương cơ bản)",
    hrAssigned: "Trần Thu Hà",
    templateName: "Mẫu Offer Product & Management 2026",
    notes: "Ứng viên có kinh nghiệm 4 năm lead product B2B SaaS, tư duy logic và kỹ năng roadmap rất xuất sắc.",
    documents: [
      { id: "d1", name: "Hợp đồng lao động", type: "DOC", status: "PENDING_SIGN", expiryDate: "28/08/2026", expiryDaysRemaining: 5 },
      { id: "d2", name: "CCCD / Hộ chiếu", type: "PDF", status: "SUBMITTED", uploadedDate: "20/08/2026" },
      { id: "d3", name: "Bằng cấp đại học", type: "PDF", status: "PENDING" },
    ],
    checklist: [
      { id: "c1", category: "BEFORE_START", label: "Gửi thư mời nhận việc và nhận phản hồi", done: true },
      { id: "c2", category: "BEFORE_START", label: "Thu thập thông tin cá nhân & tài khoản", done: false },
      { id: "c3", category: "FIRST_DAY", label: "Ký kết hợp đồng lao động bản cứng/điện tử", done: false },
      { id: "c4", category: "FIRST_DAY", label: "Bàn giao laptop & thẻ ra vào", done: false },
      { id: "c5", category: "FIRST_WEEK", label: "Buổi Orientation văn hóa doanh nghiệp", done: false },
    ],
  },
  {
    id: "off-02",
    candidateName: "Trần Hoàng Nam",
    candidateEmail: "namth@outlook.com",
    candidatePhone: "0912 345 678",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    jobTitle: "UX/UI Designer",
    department: "Phòng Thiết kế",
    salary: 20000000,
    salaryFormatted: "20,000,000 VNĐ",
    salaryType: "Lương gross / tháng",
    currency: "VNĐ",
    sentDate: "18/08/2026",
    sentTime: "14:20",
    deadline: "25/08/2026",
    deadlineDaysRemaining: 3,
    deadlineStatus: "ACTIVE",
    status: "PENDING",
    onboardingStatus: "NOT_STARTED",
    onboardingProgress: 0,
    startDate: "05/09/2026",
    contractType: "Toàn thời gian chính thức",
    probationPeriod: "2 tháng",
    hrAssigned: "Mai Phương",
    templateName: "Mẫu Offer Design & Creative 2026",
    notes: "Portfolio Figma xuất sắc, từng đạt giải thiết kế UI/UX.",
    documents: [
      { id: "d4", name: "Bằng cấp & Chứng chỉ", type: "PDF", status: "PENDING", expiryDate: "31/08/2026", expiryDaysRemaining: 8 },
      { id: "d5", name: "CCCD", type: "PDF", status: "SUBMITTED" },
    ],
    checklist: [
      { id: "c1", category: "BEFORE_START", label: "Xác nhận Offer", done: true },
      { id: "c2", category: "BEFORE_START", label: "Chuẩn bị tài khoản Figma Enterprise", done: false },
    ],
  },
  {
    id: "off-03",
    candidateName: "Lê Quang Huy",
    candidateEmail: "lequanghuy@gmail.com",
    candidatePhone: "0988 776 655",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    jobTitle: "Frontend Developer",
    department: "Phòng Kỹ thuật",
    salary: 18000000,
    salaryFormatted: "18,000,000 VNĐ",
    salaryType: "Lương gross / tháng",
    currency: "VNĐ",
    sentDate: "15/08/2026",
    sentTime: "09:15",
    deadline: "22/08/2026",
    deadlineDaysRemaining: 0,
    deadlineStatus: "EXPIRED",
    status: "EXPIRED",
    onboardingStatus: "NOT_STARTED",
    onboardingProgress: 0,
    startDate: "01/09/2026",
    contractType: "Toàn thời gian chính thức",
    probationPeriod: "2 tháng",
    hrAssigned: "Trần Thu Hà",
    templateName: "Mẫu Offer Kỹ Thuật (Tech & Dev)",
    notes: "Đã quá hạn phản hồi offer 1 ngày. Cần liên hệ lại hoặc gia hạn.",
    documents: [
      { id: "d6", name: "CCCD", type: "PDF", status: "PENDING", expiryDate: "30/08/2026", expiryDaysRemaining: 7 },
    ],
    checklist: [],
  },
  {
    id: "off-04",
    candidateName: "Phạm Thu Hằng",
    candidateEmail: "hangpt@gmail.com",
    candidatePhone: "0934 567 890",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    jobTitle: "Marketing Specialist",
    department: "Phòng Marketing",
    salary: 16500000,
    salaryFormatted: "16,500,000 VNĐ",
    salaryType: "Lương gross / tháng",
    currency: "VNĐ",
    sentDate: "14/08/2026",
    sentTime: "16:45",
    deadline: "21/08/2026",
    deadlineDaysRemaining: 0,
    deadlineStatus: "EXPIRED",
    status: "REJECTED",
    onboardingStatus: "NONE",
    onboardingProgress: 0,
    startDate: "01/09/2026",
    contractType: "Toàn thời gian chính thức",
    probationPeriod: "2 tháng",
    hrAssigned: "Mai Phương",
    templateName: "Mẫu Offer Marketing & Truyền thông",
    notes: "Ứng viên từ chối do nhận được cơ hội làm việc Remote 100% từ công ty nước ngoài.",
    documents: [],
    checklist: [],
  },
  {
    id: "off-05",
    candidateName: "Đỗ Thành Tùng",
    candidateEmail: "thanhtung@gmail.com",
    candidatePhone: "0977 123 456",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    jobTitle: "DevOps Engineer",
    department: "Phòng Kỹ thuật",
    salary: 22000000,
    salaryFormatted: "22,000,000 VNĐ",
    salaryType: "Lương gross / tháng",
    currency: "VNĐ",
    sentDate: "12/08/2026",
    sentTime: "11:00",
    deadline: "19/08/2026",
    deadlineDaysRemaining: null,
    deadlineStatus: "RESPONDED",
    status: "ACCEPTED",
    onboardingStatus: "IN_PROGRESS",
    onboardingProgress: 45,
    startDate: "25/08/2026",
    contractType: "Toàn thời gian chính thức",
    probationPeriod: "2 tháng",
    hrAssigned: "Trần Thu Hà",
    templateName: "Mẫu Offer Kỹ Thuật (Tech & Dev)",
    notes: "Đã nộp CCCD và thông tin ngân hàng. Đang chuẩn bị cấp tài khoản AWS & Kubernetes.",
    documents: [
      { id: "d7", name: "CCCD", type: "PDF", status: "SUBMITTED", uploadedDate: "15/08/2026" },
      { id: "d8", name: "Thông tin tài khoản ngân hàng", type: "PDF", status: "SUBMITTED" },
      { id: "d9", name: "Hợp đồng lao động", type: "DOC", status: "PENDING_SIGN" },
    ],
    checklist: [
      { id: "c1", category: "BEFORE_START", label: "Xác nhận Offer", done: true },
      { id: "c2", category: "BEFORE_START", label: "Thu thập CCCD & Tài khoản", done: true },
      { id: "c3", category: "BEFORE_START", label: "Cấp quyền server & VPN", done: false },
      { id: "c4", category: "FIRST_DAY", label: "Ký hợp đồng lao động", done: false },
    ],
  },
  {
    id: "off-06",
    candidateName: "Vũ Ngọc Mai",
    candidateEmail: "ngocma@gmail.com",
    candidatePhone: "0945 678 123",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    jobTitle: "Data Analyst",
    department: "Phòng Dữ liệu",
    salary: 17000000,
    salaryFormatted: "17,000,000 VNĐ",
    salaryType: "Lương gross / tháng",
    currency: "VNĐ",
    sentDate: "10/08/2026",
    sentTime: "13:30",
    deadline: "17/08/2026",
    deadlineDaysRemaining: null,
    deadlineStatus: "RESPONDED",
    status: "ACCEPTED",
    onboardingStatus: "IN_PROGRESS",
    onboardingProgress: 75,
    startDate: "22/08/2026",
    contractType: "Toàn thời gian chính thức",
    probationPeriod: "2 tháng",
    hrAssigned: "Mai Phương",
    templateName: "Mẫu Offer Data & Analytics",
    notes: "Đã hoàn thành 3/4 tài liệu và tham gia buổi giới thiệu đội nhóm.",
    documents: [
      { id: "d10", name: "CCCD", type: "PDF", status: "SUBMITTED" },
      { id: "d11", name: "Bằng cấp đại học", type: "PDF", status: "SUBMITTED" },
      { id: "d12", name: "Hợp đồng lao động", type: "DOC", status: "SIGNED" },
    ],
    checklist: [
      { id: "c1", category: "BEFORE_START", label: "Xác nhận Offer", done: true },
      { id: "c2", category: "BEFORE_START", label: "Thu thập hồ sơ", done: true },
      { id: "c3", category: "FIRST_DAY", label: "Ký hợp đồng", done: true },
      { id: "c4", category: "FIRST_WEEK", label: "Orientation data pipeline", done: false },
    ],
  },
  {
    id: "off-07",
    candidateName: "Nguyễn Đức Anh",
    candidateEmail: "ducanh@gmail.com",
    candidatePhone: "0909 888 777",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    jobTitle: "Backend Developer",
    department: "Phòng Kỹ thuật",
    salary: 20000000,
    salaryFormatted: "20,000,000 VNĐ",
    salaryType: "Lương gross / tháng",
    currency: "VNĐ",
    sentDate: "08/08/2026",
    sentTime: "09:45",
    deadline: "15/08/2026",
    deadlineDaysRemaining: null,
    deadlineStatus: "RESPONDED",
    status: "ACCEPTED",
    onboardingStatus: "COMPLETED",
    onboardingProgress: 100,
    startDate: "18/08/2026",
    contractType: "Toàn thời gian chính thức",
    probationPeriod: "2 tháng",
    hrAssigned: "Trần Thu Hà",
    templateName: "Mẫu Offer Kỹ Thuật (Tech & Dev)",
    notes: "Đã hoàn thành xuất sắc toàn bộ quy trình Onboarding tuần đầu tiên.",
    documents: [
      { id: "d13", name: "Hợp đồng lao động", type: "DOC", status: "SIGNED" },
      { id: "d14", name: "CCCD", type: "PDF", status: "SUBMITTED" },
      { id: "d15", name: "Bằng cấp & Chứng chỉ", type: "PDF", status: "SUBMITTED" },
    ],
    checklist: [
      { id: "c1", category: "BEFORE_START", label: "Xác nhận Offer", done: true },
      { id: "c2", category: "BEFORE_START", label: "Thu thập hồ sơ", done: true },
      { id: "c3", category: "FIRST_DAY", label: "Ký hợp đồng", done: true },
      { id: "c4", category: "FIRST_DAY", label: "Bàn giao thiết bị", done: true },
      { id: "c5", category: "FIRST_WEEK", label: "Hoàn tất đào tạo nội bộ", done: true },
    ],
  },
  {
    id: "off-08",
    candidateName: "Bùi Khánh Linh",
    candidateEmail: "linhbk@gmail.com",
    candidatePhone: "0966 554 433",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    jobTitle: "HR Generalist",
    department: "Phòng Nhân sự",
    salary: 15000000,
    salaryFormatted: "15,000,000 VNĐ",
    salaryType: "Lương gross / tháng",
    currency: "VNĐ",
    sentDate: "05/08/2026",
    sentTime: "15:20",
    deadline: "12/08/2026",
    deadlineDaysRemaining: null,
    deadlineStatus: "RESPONDED",
    status: "ACCEPTED",
    onboardingStatus: "COMPLETED",
    onboardingProgress: 100,
    startDate: "15/08/2026",
    contractType: "Toàn thời gian chính thức",
    probationPeriod: "2 tháng",
    hrAssigned: "Mai Phương",
    templateName: "Mẫu Offer Khối Văn Phòng & HR",
    notes: "Đã hoàn tất onboarding và nhận bàn giao các nghiệp vụ tuyển dụng.",
    documents: [
      { id: "d16", name: "Hợp đồng lao động", type: "DOC", status: "SIGNED" },
      { id: "d17", name: "CCCD", type: "PDF", status: "SUBMITTED" },
    ],
    checklist: [
      { id: "c1", category: "BEFORE_START", label: "Xác nhận Offer", done: true },
      { id: "c2", category: "BEFORE_START", label: "Thu thập hồ sơ", done: true },
      { id: "c3", category: "FIRST_DAY", label: "Ký hợp đồng", done: true },
      { id: "c4", category: "FIRST_WEEK", label: "Orientation", done: true },
    ],
  },
];

// Status badge styling helper
const OFFER_STATUS_CONFIG: Record<
  OfferStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  PENDING: {
    label: "Chờ phản hồi",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  ACCEPTED: {
    label: "Đã chấp nhận",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  REJECTED: {
    label: "Đã từ chối",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
  },
  EXPIRED: {
    label: "Đã hết hạn",
    bg: "bg-rose-50",
    text: "text-rose-600",
    border: "border-rose-200",
  },
  CANCELLED: {
    label: "Đã hủy",
    bg: "bg-slate-100",
    text: "text-slate-600",
    border: "border-slate-200",
  },
  DRAFT: {
    label: "Bản nháp",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
};

// =====================================================================
// COMPONENT MAIN
// =====================================================================

export default function EmployerOfferOnboardingPage() {
  const { message } = App.useApp();
  const { user } = useAuthStore();
  const recruiterName = user?.fullName || "Mai Phương";

  // State
  const [candidates, setCandidates] = useState<OfferCandidate[]>(INITIAL_OFFER_CANDIDATES);
  const [activeMainTab, setActiveMainTab] = useState<"offer" | "onboarding">("offer");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedPosition, setSelectedPosition] = useState<string>("all");
  const [selectedStatusDropdown, setSelectedStatusDropdown] = useState<string>("all");
  const [selectedCreator, setSelectedCreator] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState<boolean>(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [selectedOfferDetail, setSelectedOfferDetail] = useState<OfferCandidate | null>(null);
  const [selectedOnboardingDetail, setSelectedOnboardingDetail] = useState<OfferCandidate | null>(null);

  // Form State for creating new offer
  const [formCandidateName, setFormCandidateName] = useState<string>("");
  const [formCandidateEmail, setFormCandidateEmail] = useState<string>("");
  const [formJobTitle, setFormJobTitle] = useState<string>("Product Manager");
  const [formDepartment, setFormDepartment] = useState<string>("Phòng Sản phẩm");
  const [formSalary, setFormSalary] = useState<string>("25,000,000");
  const [formStartDate, setFormStartDate] = useState<string>("2026-09-01");
  const [formDeadline, setFormDeadline] = useState<string>("2026-08-27");
  const [formTemplate, setFormTemplate] = useState<string>("Mẫu Offer Tiêu Chuẩn 2026");
  const [formNotes, setFormNotes] = useState<string>("");

  // =====================================================================
  // KPI CALCULATIONS (MATCHING REFERENCE DATA: 56, 18, 24, 6, 16, 12)
  // =====================================================================
  const kpiStats = useMemo(() => {
    return {
      total: 56,
      pending: 18,
      accepted: 24,
      rejected: 6,
      onboarding: 16,
      completed: 12,
    };
  }, []);

  // Filtered dataset
  const filteredOffers = useMemo(() => {
    return candidates.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          item.candidateName.toLowerCase().includes(q) ||
          item.candidateEmail.toLowerCase().includes(q) ||
          item.candidatePhone.includes(q) ||
          item.jobTitle.toLowerCase().includes(q) ||
          item.department.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Status chip tab
      if (statusFilter !== "all") {
        if (statusFilter === "PENDING" && item.status !== "PENDING") return false;
        if (statusFilter === "ACCEPTED" && item.status !== "ACCEPTED") return false;
        if (statusFilter === "REJECTED" && item.status !== "REJECTED") return false;
        if (statusFilter === "EXPIRED" && item.status !== "EXPIRED") return false;
        if (statusFilter === "CANCELLED" && item.status !== "CANCELLED") return false;
      }

      // Position filter
      if (selectedPosition !== "all" && item.jobTitle !== selectedPosition) return false;
      // Status dropdown
      if (selectedStatusDropdown !== "all" && item.status !== selectedStatusDropdown) return false;
      // Creator
      if (selectedCreator !== "all" && item.hrAssigned !== selectedCreator) return false;

      return true;
    });
  }, [
    candidates,
    searchQuery,
    statusFilter,
    selectedPosition,
    selectedStatusDropdown,
    selectedCreator,
  ]);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredOffers.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectSingle = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  // Funnel percentages
  const funnelStages = [
    { key: "sent", label: "Offer đã gửi", count: 56, percent: 100, color: "#0062ff", bg: "bg-blue-500" },
    { key: "pending", label: "Chờ phản hồi", count: 18, percent: 32.1, color: "#f59e0b", bg: "bg-amber-500" },
    { key: "accepted", label: "Đã chấp nhận", count: 24, percent: 42.9, color: "#10b981", bg: "bg-emerald-500" },
    { key: "onboarding", label: "Đang onboarding", count: 16, percent: 28.6, color: "#8b5cf6", bg: "bg-purple-500" },
    { key: "completed", label: "Hoàn thành", count: 12, percent: 21.4, color: "#06b6d4", bg: "bg-cyan-500" },
  ];

  // Actions menu for offer row
  const getOfferRowMenuItems = (offer: OfferCandidate) => {
    if (offer.status === "PENDING") {
      return [
        {
          key: "view",
          label: "Xem chi tiết Offer",
          icon: <Eye className="w-3.5 h-3.5" />,
          onClick: () => setSelectedOfferDetail(offer),
        },
        {
          key: "resend",
          label: "Gửi lại email Offer",
          icon: <Mail className="w-3.5 h-3.5 text-blue-600" />,
          onClick: () => message.success(`Đã gửi lại email thư mời nhận việc đến ${offer.candidateEmail}`),
        },
        {
          key: "extend",
          label: "Gia hạn thời gian phản hồi",
          icon: <Clock className="w-3.5 h-3.5 text-amber-600" />,
          onClick: () => message.info(`Gia hạn hạn phản hồi cho ${offer.candidateName}`),
        },
        {
          key: "edit",
          label: "Chỉnh sửa nội dung Offer",
          icon: <Edit3 className="w-3.5 h-3.5 text-slate-600" />,
          onClick: () => message.info(`Mở trình chỉnh sửa offer của ${offer.candidateName}`),
        },
        {
          key: "cancel",
          danger: true,
          label: "Hủy thư mời nhận việc",
          icon: <XCircle className="w-3.5 h-3.5" />,
          onClick: () => message.warning(`Đã thu hồi offer của ${offer.candidateName}`),
        },
      ];
    }
    if (offer.status === "ACCEPTED") {
      return [
        {
          key: "view",
          label: "Xem chi tiết Offer",
          icon: <Eye className="w-3.5 h-3.5" />,
          onClick: () => setSelectedOfferDetail(offer),
        },
        {
          key: "onboarding",
          label: "Quản lý tiến độ Onboarding",
          icon: <CheckSquare className="w-3.5 h-3.5 text-purple-600" />,
          onClick: () => setSelectedOnboardingDetail(offer),
        },
        {
          key: "contract",
          label: "Xem Hợp đồng lao động",
          icon: <FileText className="w-3.5 h-3.5 text-emerald-600" />,
          onClick: () => message.info(`Xem hợp đồng của ${offer.candidateName}`),
        },
      ];
    }
    return [
      {
        key: "view",
        label: "Xem chi tiết",
        icon: <Eye className="w-3.5 h-3.5" />,
        onClick: () => setSelectedOfferDetail(offer),
      },
      {
        key: "resend_new",
        label: "Tạo Offer mới",
        icon: <Plus className="w-3.5 h-3.5 text-blue-600" />,
        onClick: () => {
          setFormCandidateName(offer.candidateName);
          setIsCreateModalOpen(true);
        },
      },
    ];
  };

  return (
    <div className="space-y-4 w-full">
      {/* ======================================================== */}
      {/* 1. PAGE HEADER                                           */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-transparent">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight leading-tight m-0">
            Offer & Onboarding
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => message.info("Đang xuất file báo cáo Offer & Onboarding...")}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Xuất báo cáo</span>
          </button>

          <button
            type="button"
            onClick={() => setIsTemplateModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            <span>Mẫu offer</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo offer mới</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. KPI CARDS (6 COMPACT HORIZONTAL CARDS)                */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2.5">
        {/* Card 1: Tổng offer */}
        <div className="p-3 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs flex items-center gap-3 hover:border-purple-300 transition-all">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0 shadow-2xs">
            <Mail className="w-4.5 h-4.5" />
          </div>
          <div className="flex-1 text-center min-w-0 pr-1">
            <span className="text-[11.5px] font-semibold text-slate-500 block leading-none truncate">
              Tổng offer
            </span>
            <span className="text-xl font-black text-slate-900 block my-1 leading-tight">
              {kpiStats.total}
            </span>
            <span className="text-[10px] font-bold text-emerald-600 block leading-none">
              ↑ 18% <span className="text-slate-400 font-normal">so với tháng trước</span>
            </span>
          </div>
        </div>

        {/* Card 2: Chờ ứng viên phản hồi */}
        <div className="p-3 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs flex items-center gap-3 hover:border-amber-300 transition-all">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0 shadow-2xs">
            <Clock className="w-4.5 h-4.5" />
          </div>
          <div className="flex-1 text-center min-w-0 pr-1">
            <span className="text-[11.5px] font-semibold text-slate-500 block leading-none truncate">
              Chờ ứng viên phản hồi
            </span>
            <span className="text-xl font-black text-slate-900 block my-1 leading-tight">
              {kpiStats.pending}
            </span>
            <span className="text-[10px] font-bold text-emerald-600 block leading-none">
              ↑ 6% <span className="text-slate-400 font-normal">so với tháng trước</span>
            </span>
          </div>
        </div>

        {/* Card 3: Đã chấp nhận */}
        <div className="p-3 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs flex items-center gap-3 hover:border-emerald-300 transition-all">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0 shadow-2xs">
            <CheckCircle2 className="w-4.5 h-4.5" />
          </div>
          <div className="flex-1 text-center min-w-0 pr-1">
            <span className="text-[11.5px] font-semibold text-slate-500 block leading-none truncate">
              Đã chấp nhận
            </span>
            <span className="text-xl font-black text-slate-900 block my-1 leading-tight">
              {kpiStats.accepted}
            </span>
            <span className="text-[10px] font-bold text-emerald-600 block leading-none">
              ↑ 20% <span className="text-slate-400 font-normal">so với tháng trước</span>
            </span>
          </div>
        </div>

        {/* Card 4: Đã từ chối */}
        <div className="p-3 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs flex items-center gap-3 hover:border-rose-300 transition-all">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center shrink-0 shadow-2xs">
            <XCircle className="w-4.5 h-4.5" />
          </div>
          <div className="flex-1 text-center min-w-0 pr-1">
            <span className="text-[11.5px] font-semibold text-slate-500 block leading-none truncate">
              Đã từ chối
            </span>
            <span className="text-xl font-black text-slate-900 block my-1 leading-tight">
              {kpiStats.rejected}
            </span>
            <span className="text-[10px] font-bold text-rose-600 block leading-none">
              ↓ 25% <span className="text-slate-400 font-normal">so với tháng trước</span>
            </span>
          </div>
        </div>

        {/* Card 5: Đang onboarding */}
        <div className="p-3 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs flex items-center gap-3 hover:border-blue-300 transition-all">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0 shadow-2xs">
            <Users className="w-4.5 h-4.5" />
          </div>
          <div className="flex-1 text-center min-w-0 pr-1">
            <span className="text-[11.5px] font-semibold text-slate-500 block leading-none truncate">
              Đang onboarding
            </span>
            <span className="text-xl font-black text-slate-900 block my-1 leading-tight">
              {kpiStats.onboarding}
            </span>
            <span className="text-[10px] font-bold text-emerald-600 block leading-none">
              ↑ 12% <span className="text-slate-400 font-normal">so với tháng trước</span>
            </span>
          </div>
        </div>

        {/* Card 6: Hoàn thành onboarding */}
        <div className="p-3 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs flex items-center gap-3 hover:border-purple-300 transition-all">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0 shadow-2xs">
            <Flag className="w-4.5 h-4.5" />
          </div>
          <div className="flex-1 text-center min-w-0 pr-1">
            <span className="text-[11.5px] font-semibold text-slate-500 block leading-none truncate">
              Hoàn thành onboarding
            </span>
            <span className="text-xl font-black text-slate-900 block my-1 leading-tight">
              {kpiStats.completed}
            </span>
            <span className="text-[10px] font-bold text-emerald-600 block leading-none">
              ↑ 33% <span className="text-slate-400 font-normal">so với tháng trước</span>
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. MAIN WORKSPACE: LEFT CONTENT + RIGHT SIDEBAR (~80/20) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5 items-start">
        {/* ====================================================== */}
        {/* LEFT COLUMN: OFFER / ONBOARDING MANAGEMENT (~80%)      */}
        {/* ====================================================== */}
        <div className="xl:col-span-8 2xl:col-span-9 space-y-3">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs p-4 space-y-3.5">
            {/* Main Tabs (Quản lý Offer | Onboarding) */}
            <div className="flex items-center gap-6 border-b border-slate-200 text-sm font-bold pb-2">
              <button
                type="button"
                onClick={() => setActiveMainTab("offer")}
                className={`relative pb-2 cursor-pointer transition-colors ${
                  activeMainTab === "offer"
                    ? "text-[#0062ff] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#0062ff] after:rounded-full"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Quản lý Offer
              </button>

              <button
                type="button"
                onClick={() => setActiveMainTab("onboarding")}
                className={`relative pb-2 cursor-pointer transition-colors ${
                  activeMainTab === "onboarding"
                    ? "text-[#0062ff] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#0062ff] after:rounded-full"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Onboarding
              </button>
            </div>

            {/* Filters Toolbar */}
            <div className="flex items-center justify-between gap-2 flex-wrap xl:flex-nowrap">
              <div className="flex items-center gap-2 flex-wrap">
                <Select
                  value={selectedPosition}
                  onChange={setSelectedPosition}
                  className="w-32 text-xs"
                  options={[
                    { value: "all", label: "Tất cả vị trí" },
                    { value: "Product Manager", label: "Product Manager" },
                    { value: "UX/UI Designer", label: "UX/UI Designer" },
                    { value: "Frontend Developer", label: "Frontend Developer" },
                    { value: "Backend Developer", label: "Backend Developer" },
                    { value: "DevOps Engineer", label: "DevOps Engineer" },
                    { value: "Data Analyst", label: "Data Analyst" },
                    { value: "Marketing Specialist", label: "Marketing Specialist" },
                    { value: "HR Generalist", label: "HR Generalist" },
                  ]}
                />

                <Select
                  value={selectedStatusDropdown}
                  onChange={setSelectedStatusDropdown}
                  className="w-32 text-xs"
                  options={[
                    { value: "all", label: "Tất cả trạng thái" },
                    { value: "PENDING", label: "Chờ phản hồi" },
                    { value: "ACCEPTED", label: "Đã chấp nhận" },
                    { value: "REJECTED", label: "Đã từ chối" },
                    { value: "EXPIRED", label: "Đã hết hạn" },
                  ]}
                />

                <Select
                  value={selectedCreator}
                  onChange={setSelectedCreator}
                  className="w-32 text-xs"
                  options={[
                    { value: "all", label: "Tất cả người tạo" },
                    { value: "Mai Phương", label: "Mai Phương (Tôi)" },
                    { value: "Trần Thu Hà", label: "Trần Thu Hà" },
                  ]}
                />

                <div className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-xs flex items-center gap-1.5 shadow-2xs whitespace-nowrap">
                  <span>01/08/2026 - 31/08/2026</span>
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                </div>

                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Filter className="w-3.5 h-3.5 text-slate-500" />
                  <span>Bộ lọc</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
              </div>

              {/* Search input */}
              <div className="w-full sm:w-56 shrink-0">
                <Input
                  prefix={<Search className="w-3.5 h-3.5 text-slate-400 mr-1" />}
                  placeholder="Tìm kiếm offer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-xl text-xs"
                  allowClear
                />
              </div>
            </div>

            {/* Status Chips Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px]">
              {[
                { key: "all", label: "Tất cả", count: 56 },
                { key: "PENDING", label: "Chờ phản hồi", count: 18 },
                { key: "ACCEPTED", label: "Đã chấp nhận", count: 24 },
                { key: "REJECTED", label: "Đã từ chối", count: 6 },
                { key: "EXPIRED", label: "Đã hết hạn", count: 2 },
                { key: "CANCELLED", label: "Đã hủy", count: 6 },
              ].map((chip) => {
                const isActive = statusFilter === chip.key;
                return (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={() => setStatusFilter(chip.key)}
                    className={`px-2.5 py-1 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 text-[11px] ${
                      isActive
                        ? "bg-[#0062ff] text-white shadow-2xs"
                        : "bg-slate-100/90 text-slate-600 hover:bg-slate-200/80 border border-slate-200/60"
                    }`}
                  >
                    <span>{chip.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-md text-[9.5px] font-bold ${
                        isActive ? "bg-white/20 text-white" : "bg-slate-200/80 text-slate-700"
                      }`}
                    >
                      {chip.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Sticky Bulk Action Toolbar */}
            {selectedIds.length > 0 && (
              <div className="flex items-center justify-between p-2.5 bg-blue-50/90 border border-blue-200 rounded-xl text-xs text-[#0062ff] font-medium">
                <span className="font-bold">
                  Đã chọn {selectedIds.length} ứng viên / offer
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => message.info(`Gửi email hàng loạt cho ${selectedIds.length} ứng viên`)}
                    className="px-2.5 py-1 bg-white hover:bg-blue-100 text-[#0062ff] rounded-lg border border-blue-200 font-bold cursor-pointer"
                  >
                    Gửi email
                  </button>
                  <button
                    type="button"
                    onClick={() => message.info(`Gia hạn cho ${selectedIds.length} offer`)}
                    className="px-2.5 py-1 bg-white hover:bg-blue-100 text-[#0062ff] rounded-lg border border-blue-200 font-bold cursor-pointer"
                  >
                    Gia hạn
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedIds([])}
                    className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* OFFER TABLE (MATCHING REFERENCE DESIGN)                 */}
            {/* ======================================================== */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/90 shadow-xs bg-white">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[860px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-[10.5px] font-extrabold text-slate-700 uppercase tracking-wider">
                      <th className="py-2.5 px-3 w-8 text-center">
                        <Checkbox
                          checked={
                            selectedIds.length === filteredOffers.length &&
                            filteredOffers.length > 0
                          }
                          indeterminate={
                            selectedIds.length > 0 &&
                            selectedIds.length < filteredOffers.length
                          }
                          onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                      </th>
                      <th className="py-2.5 px-3 text-left">Ứng viên</th>
                      <th className="py-2.5 px-3 text-left">Vị trí</th>
                      <th className="py-2.5 px-3 text-left">Offer</th>
                      <th className="py-2.5 px-3 text-left">Ngày gửi</th>
                      <th className="py-2.5 px-3 text-left">Hạn phản hồi</th>
                      <th className="py-2.5 px-3 text-center">Trạng thái</th>
                      <th className="py-2.5 px-3 text-center">Onboarding</th>
                      <th className="py-2.5 px-3 text-center">Thao tác</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredOffers.map((offer) => {
                      const isChecked = selectedIds.includes(offer.id);
                      const statusInfo = OFFER_STATUS_CONFIG[offer.status];

                      return (
                        <tr
                          key={offer.id}
                          onClick={() => setSelectedOfferDetail(offer)}
                          className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                        >
                          {/* Checkbox */}
                          <td
                            className="py-3 px-3 shrink-0 text-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Checkbox
                              checked={isChecked}
                              onChange={(e) => handleSelectSingle(offer.id, e.target.checked)}
                            />
                          </td>

                          {/* Ứng viên */}
                          <td className="py-3 px-3 text-left">
                            <div className="flex items-center gap-2.5">
                              <Avatar
                                src={offer.avatar}
                                size={36}
                                className="border border-slate-200 shrink-0 shadow-2xs"
                              />
                              <div className="min-w-0">
                                <span className="font-semibold text-slate-900 text-[13px] block leading-tight group-hover:text-[#0062ff] transition-colors">
                                  {offer.candidateName}
                                </span>
                                <span className="text-[11px] text-slate-400 font-normal block truncate mt-0.5">
                                  {offer.candidateEmail}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Vị trí */}
                          <td className="py-3 px-3 text-left">
                            <span className="font-medium text-slate-800 text-xs block leading-snug">
                              {offer.jobTitle}
                            </span>
                            <span className="text-[10.5px] text-slate-400 font-normal block mt-0.5">
                              {offer.department}
                            </span>
                          </td>

                          {/* Offer */}
                          <td className="py-3 px-3 text-left whitespace-nowrap">
                            <span className="font-bold text-slate-900 text-xs block leading-snug">
                              {offer.salaryFormatted}
                            </span>
                            <span className="text-[10.5px] text-slate-400 font-normal block mt-0.5">
                              {offer.salaryType}
                            </span>
                          </td>

                          {/* Ngày gửi */}
                          <td className="py-3 px-3 text-left whitespace-nowrap">
                            <span className="font-normal text-slate-800 text-xs block">
                              {offer.sentDate}
                            </span>
                            <span className="text-[10.5px] text-slate-400 font-normal block mt-0.5">
                              {offer.sentTime}
                            </span>
                          </td>

                          {/* Hạn phản hồi */}
                          <td className="py-3 px-3 text-left whitespace-nowrap">
                            <span className="font-normal text-slate-800 text-xs block">
                              {offer.deadline}
                            </span>
                            {offer.deadlineStatus === "ACTIVE" && (
                              <span className="text-[10.5px] font-semibold text-amber-600 block mt-0.5">
                                Còn {offer.deadlineDaysRemaining} ngày
                              </span>
                            )}
                            {offer.deadlineStatus === "EXPIRED" && (
                              <span className="text-[10.5px] font-semibold text-rose-600 block mt-0.5">
                                Hết hạn
                              </span>
                            )}
                            {offer.deadlineStatus === "RESPONDED" && (
                              <span className="text-[10.5px] font-semibold text-emerald-600 block mt-0.5">
                                Đã phản hồi
                              </span>
                            )}
                          </td>

                          {/* Trạng thái */}
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <span
                              className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                            >
                              • {statusInfo.label}
                            </span>
                          </td>

                          {/* Onboarding Column */}
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            {offer.onboardingStatus === "NOT_STARTED" && (
                              <span className="text-slate-400 text-[11px] font-medium">
                                Chưa bắt đầu
                              </span>
                            )}
                            {offer.onboardingStatus === "NONE" && (
                              <span className="text-slate-300 text-xs font-bold">-</span>
                            )}
                            {offer.onboardingStatus === "IN_PROGRESS" && (
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOnboardingDetail(offer);
                                }}
                                className="w-28 mx-auto space-y-1 cursor-pointer hover:opacity-80"
                              >
                                <div className="flex items-center justify-between text-[9.5px]">
                                  <span className="font-bold text-slate-700">Onboarding</span>
                                  <span className="font-extrabold text-slate-800">{offer.onboardingProgress}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-emerald-500 rounded-full transition-all"
                                    style={{ width: `${offer.onboardingProgress}%` }}
                                  />
                                </div>
                              </div>
                            )}
                            {offer.onboardingStatus === "COMPLETED" && (
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOnboardingDetail(offer);
                                }}
                                className="w-28 mx-auto space-y-1 cursor-pointer hover:opacity-80"
                              >
                                <div className="flex items-center justify-between text-[9.5px]">
                                  <span className="font-bold text-purple-700">Hoàn thành</span>
                                  <span className="font-extrabold text-purple-700">100%</span>
                                </div>
                                <div className="w-full h-1.5 bg-purple-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-purple-600 rounded-full w-full" />
                                </div>
                              </div>
                            )}
                          </td>

                          {/* Action Buttons */}
                          <td
                            className="py-3 px-3 text-center whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-center gap-1.5">
                              <Tooltip title="Xem chi tiết Offer">
                                <button
                                  type="button"
                                  onClick={() => setSelectedOfferDetail(offer)}
                                  className="w-7 h-7 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-[#0062ff] flex items-center justify-center transition-colors cursor-pointer border border-transparent hover:border-blue-200"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              </Tooltip>

                              {offer.status === "PENDING" && (
                                <Tooltip title="Chỉnh sửa Offer">
                                  <button
                                    type="button"
                                    onClick={() => message.info(`Chỉnh sửa offer cho ${offer.candidateName}`)}
                                    className="w-7 h-7 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-[#0062ff] flex items-center justify-center transition-colors cursor-pointer border border-transparent hover:border-blue-200"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                </Tooltip>
                              )}

                              {(offer.status === "EXPIRED" || offer.status === "REJECTED") && (
                                <Tooltip title="Xem tài liệu / thư mời">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedOfferDetail(offer)}
                                    className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                  </button>
                                </Tooltip>
                              )}

                              {offer.status === "ACCEPTED" && (
                                <Tooltip title="Theo dõi Onboarding">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedOnboardingDetail(offer)}
                                    className="w-7 h-7 rounded-lg hover:bg-purple-50 text-slate-400 hover:text-purple-600 flex items-center justify-center transition-colors cursor-pointer border border-transparent hover:border-purple-200"
                                  >
                                    <Calendar className="w-3.5 h-3.5" />
                                  </button>
                                </Tooltip>
                              )}

                              <Dropdown
                                menu={{ items: getOfferRowMenuItems(offer) }}
                                trigger={["click"]}
                                placement="bottomRight"
                                arrow
                              >
                                <button
                                  type="button"
                                  className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                                >
                                  <MoreHorizontal className="w-3.5 h-3.5" />
                                </button>
                              </Dropdown>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500 flex-wrap gap-3">
              <span>Hiển thị 1 – 8 trong tổng số 56 offer</span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  className="w-7 h-7 rounded-lg bg-[#0062ff] text-white font-bold flex items-center justify-center shadow-xs cursor-pointer"
                >
                  1
                </button>
                <button
                  type="button"
                  className="w-7 h-7 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold flex items-center justify-center cursor-pointer"
                >
                  2
                </button>
                <button
                  type="button"
                  className="w-7 h-7 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold flex items-center justify-center cursor-pointer"
                >
                  3
                </button>
                <span className="px-1 text-slate-400">...</span>
                <button
                  type="button"
                  className="w-7 h-7 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold flex items-center justify-center cursor-pointer"
                >
                  7
                </button>
                <button
                  type="button"
                  className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Select
                  defaultValue="10"
                  size="small"
                  className="text-xs"
                  options={[
                    { value: "10", label: "10 / trang" },
                    { value: "25", label: "25 / trang" },
                    { value: "50", label: "50 / trang" },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ====================================================== */}
        {/* RIGHT SIDEBAR: PIPELINE FUNNEL, INTERVIEWS, TASKS      */}
        {/* ====================================================== */}
        <div className="xl:col-span-4 2xl:col-span-3 space-y-3">
          {/* ==================================================== */}
          {/* Card 1: Tổng quan pipeline offer (VERTICAL FUNNEL)   */}
          {/* ==================================================== */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 m-0">Tổng quan pipeline offer</h3>
              <Select
                defaultValue="30days"
                size="small"
                className="text-[11px]"
                options={[
                  { value: "30days", label: "30 ngày" },
                  { value: "90days", label: "3 tháng" },
                  { value: "year", label: "Năm 2026" },
                ]}
              />
            </div>

            {/* Vertical Funnel Chart Representation */}
            <div className="py-2 grid grid-cols-12 gap-3 items-center">
              {/* Funnel SVG on the Left */}
              <div className="col-span-5 flex justify-center items-center">
                <svg viewBox="0 0 100 130" className="w-full max-w-[95px] h-auto drop-shadow-xs">
                  {/* Stage 1: Offer đã gửi (Blue) */}
                  <polygon points="5,5 95,5 86,28 14,28" fill="#0062ff" rx="2" />
                  {/* Stage 2: Chờ phản hồi (Orange) */}
                  <polygon points="15,31 85,31 76,54 24,54" fill="#f59e0b" />
                  {/* Stage 3: Đã chấp nhận (Green) */}
                  <polygon points="25,57 75,57 66,80 34,80" fill="#10b981" />
                  {/* Stage 4: Đang onboarding (Purple) */}
                  <polygon points="35,83 65,83 58,106 42,106" fill="#8b5cf6" />
                  {/* Stage 5: Hoàn thành (Cyan/Teal) */}
                  <polygon points="43,109 57,109 53,125 47,125" fill="#06b6d4" />
                </svg>
              </div>

              {/* Funnel Legend on the Right */}
              <div className="col-span-7 space-y-2 text-[11px]">
                {funnelStages.map((stage) => (
                  <div key={stage.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
                      <span className="text-slate-600 font-medium truncate">{stage.label}</span>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0 text-right">
                      {stage.count} <span className="text-slate-400 font-normal text-[10px]">({stage.percent}%)</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ==================================================== */}
          {/* Card 2: Phỏng vấn sắp tới                            */}
          {/* ==================================================== */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 m-0">Phỏng vấn sắp tới</h3>
              <a
                href="/doanh-nghiep/lich-phong-van"
                className="text-[11px] font-bold text-[#0062ff] hover:underline"
              >
                Xem tất cả
              </a>
            </div>

            <div className="space-y-2.5 text-xs">
              {/* Item 1 */}
              <div className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10.5px] font-bold text-slate-400 block">Hôm nay, 09:00</span>
                  <strong className="text-slate-900 text-xs block truncate mt-0.5">Nguyễn Minh Anh</strong>
                  <span className="text-[11px] text-slate-500 font-medium block truncate">Phòng A • Tầng 5</span>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10.5px] font-bold text-slate-400 block">Hôm nay, 10:30</span>
                  <strong className="text-slate-900 text-xs block truncate mt-0.5">Trần Hoàng Nam</strong>
                  <span className="text-[11px] text-slate-500 font-medium block truncate">Google Meet</span>
                </div>
              </div>

              {/* Item 3 */}
              <div className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10.5px] font-bold text-slate-400 block">Hôm nay, 13:30</span>
                  <strong className="text-slate-900 text-xs block truncate mt-0.5">Lê Quang Huy</strong>
                  <span className="text-[11px] text-slate-500 font-medium block truncate">Phòng B • Tầng 3</span>
                </div>
              </div>
            </div>
          </div>

          {/* ==================================================== */}
          {/* Card 3: Tài liệu sắp hết hạn                         */}
          {/* ==================================================== */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 m-0">Tài liệu sắp hết hạn</h3>
              <button
                type="button"
                onClick={() => message.info("Xem toàn bộ danh mục tài liệu...")}
                className="text-[11px] font-bold text-[#0062ff] hover:underline cursor-pointer"
              >
                Xem tất cả
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 border border-slate-100">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <strong className="text-slate-900 text-[11.5px] block truncate">
                      Hợp đồng – Nguyễn Minh Anh
                    </strong>
                    <span className="text-[10px] text-slate-400 block">Hết hạn: 28/08/2026</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 font-bold text-[10px] border border-rose-200">
                  5 ngày
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 border border-slate-100">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <strong className="text-slate-900 text-[11.5px] block truncate">
                      CCCD – Lê Quang Huy
                    </strong>
                    <span className="text-[10px] text-slate-400 block">Hết hạn: 30/08/2026</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 font-bold text-[10px] border border-rose-200">
                  7 ngày
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 border border-slate-100">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <strong className="text-slate-900 text-[11.5px] block truncate">
                      Bằng cấp – Trần Hoàng Nam
                    </strong>
                    <span className="text-[10px] text-slate-400 block">Hết hạn: 31/08/2026</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 font-bold text-[10px] border border-rose-200">
                  8 ngày
                </span>
              </div>
            </div>
          </div>

          {/* ==================================================== */}
          {/* Card 4: Thao tác nhanh (3 x 2 grid)                  */}
          {/* ==================================================== */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs p-3.5 space-y-3">
            <h3 className="text-xs font-black text-slate-900 m-0">Thao tác nhanh</h3>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="p-2.5 rounded-xl bg-blue-50/70 hover:bg-blue-100 border border-blue-100 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Send className="w-4 h-4" />
                </div>
                <span className="text-[10.5px] font-bold text-slate-700 text-center leading-tight">
                  Tạo offer mới
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsTemplateModalOpen(true)}
                className="p-2.5 rounded-xl bg-emerald-50/70 hover:bg-emerald-100 border border-emerald-100 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-[10.5px] font-bold text-slate-700 text-center leading-tight">
                  Mẫu offer
                </span>
              </button>

              <button
                type="button"
                onClick={() => message.info("Gửi email hàng loạt...")}
                className="p-2.5 rounded-xl bg-amber-50/70 hover:bg-amber-100 border border-amber-100 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-[10.5px] font-bold text-slate-700 text-center leading-tight">
                  Gửi email hàng loạt
                </span>
              </button>

              <button
                type="button"
                onClick={() => message.info("Quản lý tài liệu hồ sơ...")}
                className="p-2.5 rounded-xl bg-purple-50/70 hover:bg-purple-100 border border-purple-100 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Briefcase className="w-4 h-4" />
                </div>
                <span className="text-[10.5px] font-bold text-slate-700 text-center leading-tight">
                  Quản lý tài liệu
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMainTab("onboarding")}
                className="p-2.5 rounded-xl bg-cyan-50/70 hover:bg-cyan-100 border border-cyan-100 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-cyan-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <span className="text-[10.5px] font-bold text-slate-700 text-center leading-tight">
                  Theo dõi onboarding
                </span>
              </button>

              <button
                type="button"
                onClick={() => message.info("Báo cáo phân tích tuyển dụng & offer...")}
                className="p-2.5 rounded-xl bg-rose-50/70 hover:bg-rose-100 border border-rose-100 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <span className="text-[10.5px] font-bold text-slate-700 text-center leading-tight">
                  Báo cáo offer
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 4. CENTER MODALS                                                      */}
      {/* ===================================================================== */}

      {/* Modal 1: Chi tiết Offer */}
      <Modal
        open={!!selectedOfferDetail}
        onCancel={() => setSelectedOfferDetail(null)}
        footer={null}
        width={620}
        centered
        destroyOnHidden
        closable={false}
        title={null}
      >
        {selectedOfferDetail && (
          <div className="space-y-4 p-1 text-xs">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar
                  src={selectedOfferDetail.avatar}
                  size={48}
                  className="border border-slate-200 shrink-0 shadow-md"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-slate-900 m-0">
                      {selectedOfferDetail.candidateName}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                        OFFER_STATUS_CONFIG[selectedOfferDetail.status].bg
                      } ${OFFER_STATUS_CONFIG[selectedOfferDetail.status].text} ${
                        OFFER_STATUS_CONFIG[selectedOfferDetail.status].border
                      }`}
                    >
                      • {OFFER_STATUS_CONFIG[selectedOfferDetail.status].label}
                    </span>
                  </div>
                  <span className="text-xs text-[#0062ff] font-bold block mt-0.5">
                    {selectedOfferDetail.jobTitle} • {selectedOfferDetail.department}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium block truncate">
                    {selectedOfferDetail.candidateEmail} • {selectedOfferDetail.candidatePhone}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOfferDetail(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Offer Information Summary */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <div>
                <span className="text-slate-400 block text-[11px]">Mức lương đề xuất:</span>
                <strong className="text-slate-900 text-sm font-black">
                  {selectedOfferDetail.salaryFormatted}
                </strong>
                <span className="text-[10.5px] text-slate-500 block">({selectedOfferDetail.salaryType})</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Ngày bắt đầu làm việc:</span>
                <strong className="text-slate-800 text-xs">
                  {selectedOfferDetail.startDate}
                </strong>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Hạn phản hồi thư mời:</span>
                <strong className="text-slate-800 text-xs">
                  {selectedOfferDetail.deadline}
                </strong>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Người phụ trách tuyển dụng:</span>
                <strong className="text-slate-800 text-xs">
                  {selectedOfferDetail.hrAssigned}
                </strong>
              </div>

              <div className="col-span-2">
                <span className="text-slate-400 block text-[11px]">Loại hợp đồng & Thử việc:</span>
                <span className="text-slate-700 font-semibold text-[11.5px] block">
                  {selectedOfferDetail.contractType} • Thử việc {selectedOfferDetail.probationPeriod}
                </span>
              </div>
            </div>

            {/* File Offer Letter Preview */}
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-white text-rose-500 border border-blue-200 flex items-center justify-center shrink-0 shadow-2xs font-bold text-xs">
                  PDF
                </div>
                <div className="min-w-0">
                  <strong className="text-slate-900 text-xs block truncate">
                    Thu_Moi_Nhan_Viec_{selectedOfferDetail.candidateName.replace(/\s+/g, "_")}.pdf
                  </strong>
                  <span className="text-[10.5px] text-slate-400 block">
                    Đã ký số • Dung lượng 420 KB
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => message.info("Đang mở bản xem trước Thư mời nhận việc...")}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-2xs cursor-pointer"
                >
                  Xem
                </button>
                <button
                  type="button"
                  onClick={() => message.success("Đang tải xuống file PDF...")}
                  className="px-3 py-1.5 rounded-lg bg-[#0062ff] text-white font-bold text-xs shadow-md cursor-pointer"
                >
                  Tải xuống
                </button>
              </div>
            </div>

            {selectedOfferDetail.notes && (
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-800 block mb-1">Ghi chú & Đánh giá:</span>
                <p className="m-0 italic text-[11.5px]">{selectedOfferDetail.notes}</p>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedOfferDetail(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Đóng
              </button>

              <div className="flex items-center gap-2">
                {selectedOfferDetail.status === "PENDING" && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        message.warning(`Đã hủy thư mời của ${selectedOfferDetail.candidateName}`);
                        setSelectedOfferDetail(null);
                      }}
                      className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs cursor-pointer"
                    >
                      Hủy Offer
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        message.success(`Đã gửi lại email thư mời đến ${selectedOfferDetail.candidateEmail}`);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs shadow-md cursor-pointer"
                    >
                      Gửi lại Email
                    </button>
                  </>
                )}

                {selectedOfferDetail.status === "ACCEPTED" && (
                  <button
                    type="button"
                    onClick={() => {
                      const c = selectedOfferDetail;
                      setSelectedOfferDetail(null);
                      setSelectedOnboardingDetail(c);
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Mở Onboarding checklist</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal 2: Tạo Offer mới */}
      <Modal
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        footer={null}
        width={600}
        centered
        destroyOnHidden
        closable={false}
        title={null}
      >
        <div className="space-y-4 p-1 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0062ff] flex items-center justify-center shadow-2xs">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 m-0">Tạo đề xuất Offer mới</h3>
                <span className="text-xs text-slate-500 font-medium">
                  Soạn thảo và gửi thư mời nhận việc chính thức đến ứng viên
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Section 1: Ứng viên */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Họ tên ứng viên *</label>
                <Input
                  value={formCandidateName}
                  onChange={(e) => setFormCandidateName(e.target.value)}
                  placeholder="Ví dụ: Hoàng Đức Minh"
                  className="rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Email ứng viên *</label>
                <Input
                  value={formCandidateEmail}
                  onChange={(e) => setFormCandidateEmail(e.target.value)}
                  placeholder="ducminh@gmail.com"
                  className="rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Section 2: Vị trí & Phòng ban */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Vị trí công việc *</label>
                <Select
                  value={formJobTitle}
                  onChange={setFormJobTitle}
                  className="w-full text-xs"
                  options={[
                    { value: "Product Manager", label: "Product Manager" },
                    { value: "UX/UI Designer", label: "UX/UI Designer" },
                    { value: "Frontend Developer", label: "Frontend Developer" },
                    { value: "Backend Developer", label: "Backend Developer" },
                    { value: "DevOps Engineer", label: "DevOps Engineer" },
                    { value: "Data Analyst", label: "Data Analyst" },
                  ]}
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Phòng ban *</label>
                <Select
                  value={formDepartment}
                  onChange={setFormDepartment}
                  className="w-full text-xs"
                  options={[
                    { value: "Phòng Sản phẩm", label: "Phòng Sản phẩm" },
                    { value: "Phòng Kỹ thuật", label: "Phòng Kỹ thuật" },
                    { value: "Phòng Thiết kế", label: "Phòng Thiết kế" },
                    { value: "Phòng Dữ liệu", label: "Phòng Dữ liệu" },
                    { value: "Phòng Marketing", label: "Phòng Marketing" },
                    { value: "Phòng Nhân sự", label: "Phòng Nhân sự" },
                  ]}
                />
              </div>
            </div>

            {/* Section 3: Lương & Ngày làm việc */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mức lương (VNĐ) *</label>
                <Input
                  value={formSalary}
                  onChange={(e) => setFormSalary(e.target.value)}
                  placeholder="25,000,000"
                  className="rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Ngày bắt đầu *</label>
                <Input
                  type="date"
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                  className="rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Hạn phản hồi *</label>
                <Input
                  type="date"
                  value={formDeadline}
                  onChange={(e) => setFormDeadline(e.target.value)}
                  className="rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Section 4: Mẫu offer */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Mẫu thư mời áp dụng</label>
              <Select
                value={formTemplate}
                onChange={setFormTemplate}
                className="w-full text-xs"
                options={[
                  { value: "Mẫu Offer Tiêu Chuẩn 2026", label: "Mẫu Offer Tiêu Chuẩn 2026 (Chính thức)" },
                  { value: "Mẫu Offer Kỹ Thuật (Tech & Dev)", label: "Mẫu Offer Kỹ Thuật (Tech & Dev)" },
                  { value: "Mẫu Offer Product & Management", label: "Mẫu Offer Product & Management" },
                ]}
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Ghi chú & Phúc lợi bổ sung</label>
              <Input.TextArea
                rows={2}
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Gói bảo hiểm sức khỏe VIP, thưởng KPI theo quý, 14 ngày phép năm..."
                className="rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => {
                message.info("Đã lưu bản nháp Offer!");
                setIsCreateModalOpen(false);
              }}
              className="px-4 py-2 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-[#0062ff] font-bold text-xs cursor-pointer"
            >
              Lưu nháp
            </button>
            <button
              type="button"
              onClick={() => {
                message.success("Đã gửi thư mời nhận việc (Offer) thành công!");
                setIsCreateModalOpen(false);
              }}
              className="px-5 py-2 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs shadow-md cursor-pointer"
            >
              Gửi Offer
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal 3: Danh sách Mẫu Offer (Templates) */}
      <Modal
        open={isTemplateModalOpen}
        onCancel={() => setIsTemplateModalOpen(false)}
        footer={null}
        width={560}
        centered
        destroyOnHidden
        closable={false}
        title={null}
      >
        <div className="space-y-4 p-1 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 m-0">Danh sách Mẫu Offer</h3>
                <span className="text-xs text-slate-500 font-medium">
                  Quản lý và chuẩn hóa các mẫu thư mời nhận việc của doanh nghiệp
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsTemplateModalOpen(false)}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2.5">
            {[
              { name: "Mẫu Offer Kỹ Thuật (Tech & Dev)", dept: "Phòng Kỹ thuật", date: "15/08/2026", author: "Mai Phương" },
              { name: "Mẫu Offer Product & Management 2026", dept: "Phòng Sản phẩm", date: "10/08/2026", author: "Trần Thu Hà" },
              { name: "Mẫu Offer Marketing & Truyền thông", dept: "Phòng Marketing", date: "01/08/2026", author: "Mai Phương" },
              { name: "Mẫu Offer Khối Văn Phòng & HR", dept: "Phòng Nhân sự", date: "20/07/2026", author: "Mai Phương" },
            ].map((tmpl, tIdx) => (
              <div
                key={tIdx}
                className="p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/20 transition-all flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <strong className="text-slate-900 text-xs block truncate">{tmpl.name}</strong>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    {tmpl.dept} • Cập nhật {tmpl.date} bởi {tmpl.author}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => message.info(`Xem trước ${tmpl.name}`)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-white text-slate-700 font-bold text-xs"
                  >
                    Xem
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormTemplate(tmpl.name);
                      setIsTemplateModalOpen(false);
                      setIsCreateModalOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#0062ff] text-white font-bold text-xs shadow-xs"
                  >
                    Sử dụng
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={() => message.info("Tạo mẫu thư mời nhận việc mới...")}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-md cursor-pointer"
            >
              + Tạo mẫu mới
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal 4: Chi tiết Onboarding & Checklist */}
      <Modal
        open={!!selectedOnboardingDetail}
        onCancel={() => setSelectedOnboardingDetail(null)}
        footer={null}
        width={620}
        centered
        destroyOnHidden
        closable={false}
        title={null}
      >
        {selectedOnboardingDetail && (
          <div className="space-y-4 p-1 text-xs">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar
                  src={selectedOnboardingDetail.avatar}
                  size={48}
                  className="border border-slate-200 shrink-0 shadow-md"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-slate-900 m-0">
                      Onboarding – {selectedOnboardingDetail.candidateName}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-purple-50 text-purple-700 border border-purple-200">
                      Tiến độ {selectedOnboardingDetail.onboardingProgress}%
                    </span>
                  </div>
                  <span className="text-xs text-[#0062ff] font-bold block mt-0.5">
                    {selectedOnboardingDetail.jobTitle} • Ngày nhận việc: {selectedOnboardingDetail.startDate}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium block">
                    HR Phụ trách: {selectedOnboardingDetail.hrAssigned}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOnboardingDetail(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Checklist Tasks */}
            <div className="space-y-3">
              <div>
                <span className="text-xs font-bold text-slate-900 block mb-1.5 uppercase tracking-wider">
                  1. Trước ngày nhận việc (Pre-onboarding)
                </span>
                <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="line-through text-slate-400">Xác nhận thư mời nhận việc (Offer Letter)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="line-through text-slate-400">Thu thập hồ sơ cá nhân (CCCD, Bằng cấp)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Square className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-slate-700 font-medium">Chuẩn bị trang thiết bị làm việc (Laptop, Màn hình)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Square className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-slate-700 font-medium">Tạo tài khoản Google Workspace & Slack</span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-900 block mb-1.5 uppercase tracking-wider">
                  2. Ngày đầu tiên nhận việc (Day 1)
                </span>
                <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                  <div className="flex items-center gap-2">
                    <Square className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-slate-700 font-medium">Ký hợp đồng lao động bản chính thức</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Square className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-slate-700 font-medium">Bàn giao tài sản & thẻ ra vào văn phòng</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Square className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-slate-700 font-medium">Giới thiệu nhân sự mới với toàn thể công ty</span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-900 block mb-1.5 uppercase tracking-wider">
                  3. Tuần đầu tiên & Hội nhập (Week 1)
                </span>
                <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                  <div className="flex items-center gap-2">
                    <Square className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-slate-700 font-medium">Đào tạo Orientation văn hóa và quy trình nội bộ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Square className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-slate-700 font-medium">Buổi 1-on-1 đầu tiên với Hiring Manager</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedOnboardingDetail(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  message.success("Đã cập nhật tiến độ Onboarding!");
                  setSelectedOnboardingDetail(null);
                }}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md"
              >
                Lưu tiến độ
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal 5: Bộ lọc nâng cao */}
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
            <h3 className="text-base font-bold text-slate-900 m-0">Bộ lọc Offer & Onboarding</h3>
            <button
              type="button"
              onClick={() => setIsFilterModalOpen(false)}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Vị trí tuyển dụng:</label>
            <Select
              defaultValue="all"
              className="w-full"
              options={[
                { value: "all", label: "Tất cả vị trí" },
                { value: "Product Manager", label: "Product Manager" },
                { value: "UX/UI Designer", label: "UX/UI Designer" },
                { value: "Frontend Developer", label: "Frontend Developer" },
                { value: "Backend Developer", label: "Backend Developer" },
                { value: "DevOps Engineer", label: "DevOps Engineer" },
              ]}
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Trạng thái phản hồi:</label>
            <Select
              defaultValue="all"
              className="w-full"
              options={[
                { value: "all", label: "Tất cả trạng thái" },
                { value: "PENDING", label: "Chờ phản hồi" },
                { value: "ACCEPTED", label: "Đã chấp nhận" },
                { value: "REJECTED", label: "Đã từ chối" },
                { value: "EXPIRED", label: "Đã hết hạn" },
              ]}
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Phòng ban:</label>
            <Select
              defaultValue="all"
              className="w-full"
              options={[
                { value: "all", label: "Tất cả phòng ban" },
                { value: "san_pham", label: "Phòng Sản phẩm" },
                { value: "ky_thuat", label: "Phòng Kỹ thuật" },
                { value: "thiet_ke", label: "Phòng Thiết kế" },
              ]}
            />
          </div>

          <div className="pt-3 flex items-center gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsFilterModalOpen(false)}
              className="flex-1 py-2 rounded-xl bg-[#0062ff] text-white font-bold text-xs shadow-md"
            >
              Áp dụng
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("all");
                setSelectedPosition("all");
                setSelectedStatusDropdown("all");
                setSelectedCreator("all");
                setIsFilterModalOpen(false);
              }}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
            >
              Đặt lại
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
