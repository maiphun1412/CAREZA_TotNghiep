"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Modal,
  Select,
  Input,
  Tag,
  DatePicker,
  Dropdown,
  Tooltip,
  App,
  Pagination,
  Popover,
} from "antd";
import {
  History,
  Clock,
  Users,
  AlertTriangle,
  Activity,
  Search,
  Filter,
  MoreVertical,
  Download,
  Calendar,
  CheckCircle2,
  FileText,
  UserCheck,
  CreditCard,
  Mail,
  Shield,
  Trash2,
  Eye,
  Sliders,
  Laptop,
  Globe,
  Lock,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

// =====================================================================
// DATA TYPES
// =====================================================================

export type ActivityType =
  | "update"
  | "member"
  | "job"
  | "candidate"
  | "payment"
  | "email"
  | "report"
  | "security"
  | "other";

export interface LogItem {
  id: string;
  time: string;
  dateGroup: string; // e.g. "Hôm nay - 31/05/2024"
  dateKey: string;
  actor: {
    name: string;
    role: "Owner" | "Admin" | "Recruiter" | "Viewer";
    avatar: string;
    email: string;
  };
  action: string;
  target: string;
  type: ActivityType;
  ip: string;
  device: string;
  isImportant?: boolean;
  isMine?: boolean;
  diff?: {
    field: string;
    before: string;
    after: string;
  }[];
}

// =====================================================================
// INITIAL DATA
// =====================================================================

const INITIAL_LOGS: LogItem[] = [
  // Group: Hôm nay - 31/05/2024
  {
    id: "log-1",
    time: "10:30 AM",
    dateGroup: "Hôm nay - 31/05/2024",
    dateKey: "2024-05-31",
    actor: {
      name: "Mai Phương",
      role: "Owner",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
      email: "phuong.mai@google.com",
    },
    action: "Cập nhật thông tin công ty",
    target: "Google Vietnam",
    type: "update",
    ip: "203.113.45.67",
    device: "Chrome • MacOS",
    isMine: true,
    diff: [
      { field: "Slogan", before: "Connecting the world", after: "Building products that help billions of people" },
      { field: "Địa chỉ", before: "Cầu Giấy, Hà Nội", after: "Hà Nội, Việt Nam" },
    ],
  },
  {
    id: "log-2",
    time: "09:15 AM",
    dateGroup: "Hôm nay - 31/05/2024",
    dateKey: "2024-05-31",
    actor: {
      name: "Trần Minh Quân",
      role: "Admin",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
      email: "quan.tran@google.com",
    },
    action: "Thêm thành viên mới",
    target: "Nguyễn Thị Thanh Hương",
    type: "member",
    ip: "203.113.45.68",
    device: "Chrome • Windows",
    isImportant: true,
    diff: [
      { field: "Vai trò", before: "Chưa kích hoạt", after: "Admin (Phòng Tuyển dụng)" },
    ],
  },
  {
    id: "log-3",
    time: "08:45 AM",
    dateGroup: "Hôm nay - 31/05/2024",
    dateKey: "2024-05-31",
    actor: {
      name: "Nguyễn Thanh Hương",
      role: "Admin",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80",
      email: "huong.nguyen@google.com",
    },
    action: "Đăng tin tuyển dụng mới",
    target: "Senior Product Manager",
    type: "job",
    ip: "203.113.45.69",
    device: "Chrome • MacOS",
    diff: [
      { field: "Trạng thái", before: "Bản nháp", after: "Đang tuyển dụng (Công khai)" },
    ],
  },
  {
    id: "log-4",
    time: "08:20 AM",
    dateGroup: "Hôm nay - 31/05/2024",
    dateKey: "2024-05-31",
    actor: {
      name: "Lê Hoàng Nam",
      role: "Recruiter",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
      email: "nam.le@google.com",
    },
    action: "Cập nhật ứng viên",
    target: "Trần Văn A",
    type: "candidate",
    ip: "203.113.45.70",
    device: "Chrome • Windows",
    diff: [
      { field: "Vòng tuyển dụng", before: "Sàng lọc CV", after: "Phỏng vấn kỹ thuật" },
    ],
  },

  // Group: Hôm qua - 30/05/2024
  {
    id: "log-5",
    time: "04:30 PM",
    dateGroup: "Hôm qua - 30/05/2024",
    dateKey: "2024-05-30",
    actor: {
      name: "Phạm Anh Dương",
      role: "Recruiter",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
      email: "duong.pham@google.com",
    },
    action: "Gửi email cho ứng viên",
    target: "Nguyễn Văn B",
    type: "email",
    ip: "203.113.45.71",
    device: "Chrome • MacOS",
  },
  {
    id: "log-6",
    time: "02:15 PM",
    dateGroup: "Hôm qua - 30/05/2024",
    dateKey: "2024-05-30",
    actor: {
      name: "Vũ Quốc Bảo",
      role: "Viewer",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80",
      email: "bao.vu@google.com",
    },
    action: "Xem báo cáo tuyển dụng",
    target: "Báo cáo tháng 05/2024",
    type: "report",
    ip: "203.113.45.72",
    device: "Safari • MacOS",
  },
  {
    id: "log-7",
    time: "11:00 AM",
    dateGroup: "Hôm qua - 30/05/2024",
    dateKey: "2024-05-30",
    actor: {
      name: "Mai Phương",
      role: "Owner",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
      email: "phuong.mai@google.com",
    },
    action: "Thay đổi gói dịch vụ",
    target: "Premium",
    type: "payment",
    ip: "203.113.45.67",
    device: "Chrome • MacOS",
    isImportant: true,
    isMine: true,
    diff: [
      { field: "Gói dịch vụ", before: "Professional (3.490.000đ)", after: "Premium (6.990.000đ)" },
    ],
  },

  // Group: 29/05/2024
  {
    id: "log-8",
    time: "03:45 PM",
    dateGroup: "29/05/2024",
    dateKey: "2024-05-29",
    actor: {
      name: "Đặng Minh Anh",
      role: "Admin",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80",
      email: "anh.dang@google.com",
    },
    action: "Xóa tin tuyển dụng",
    target: "UI/UX Designer",
    type: "job",
    ip: "203.113.45.68",
    device: "Chrome • Windows",
    isImportant: true,
  },
  {
    id: "log-9",
    time: "10:30 AM",
    dateGroup: "29/05/2024",
    dateKey: "2024-05-29",
    actor: {
      name: "Nguyễn Thanh Hương",
      role: "Admin",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80",
      email: "huong.nguyen@google.com",
    },
    action: "Đánh giá ứng viên",
    target: "Lê Văn C",
    type: "candidate",
    ip: "203.113.45.69",
    device: "Chrome • MacOS",
  },
];

const TOP_MEMBERS = [
  { name: "Mai Phương", role: "Owner", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80", count: 245 },
  { name: "Nguyễn Thanh Hương", role: "Admin", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80", count: 189 },
  { name: "Trần Minh Quân", role: "Admin", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80", count: 156 },
  { name: "Phạm Anh Dương", role: "Recruiter", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80", count: 134 },
  { name: "Lê Hoàng Nam", role: "Recruiter", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80", count: 98 },
];

const IMPORTANT_EVENTS = [
  { title: "Thay đổi gói dịch vụ", actor: "Mai Phương", time: "31/05/2024 08:20", icon: CreditCard, color: "text-amber-600 bg-amber-50" },
  { title: "Thêm thành viên mới", actor: "Trần Minh Quân", time: "31/05/2024 09:15", icon: Users, color: "text-emerald-600 bg-emerald-50" },
  { title: "Xóa tin tuyển dụng", actor: "Đặng Minh Anh", time: "29/05/2024 15:45", icon: Trash2, color: "text-purple-600 bg-purple-50" },
];

// =====================================================================
// MAIN COMPONENT
// =====================================================================

export default function EmployerAuditLogPage() {
  const { message } = App.useApp();
  const { user } = useAuthStore();

  // State
  const [activeTab, setActiveTab] = useState<"all" | "mine" | "important">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Detail Modal State
  const [selectedLog, setSelectedLog] = useState<LogItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return INITIAL_LOGS.filter((log) => {
      // Tab filter
      if (activeTab === "mine" && !log.isMine) return false;
      if (activeTab === "important" && !log.isImportant) return false;

      // Member filter
      if (selectedMember !== "all" && log.actor.name !== selectedMember) return false;

      // Type filter
      if (selectedType !== "all" && log.type !== selectedType) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchActor = log.actor.name.toLowerCase().includes(q);
        const matchAction = log.action.toLowerCase().includes(q);
        const matchTarget = log.target.toLowerCase().includes(q);
        const matchIp = log.ip.includes(q);
        if (!matchActor && !matchAction && !matchTarget && !matchIp) return false;
      }

      return true;
    });
  }, [activeTab, selectedMember, selectedType, searchQuery]);

  // Group filtered logs by dateGroup
  const groupedLogs = useMemo(() => {
    const groups: { [key: string]: LogItem[] } = {};
    filteredLogs.forEach((item) => {
      if (!groups[item.dateGroup]) {
        groups[item.dateGroup] = [];
      }
      groups[item.dateGroup].push(item);
    });
    return groups;
  }, [filteredLogs]);

  // Helper Badge Color Mapping
  const getTypeBadge = (type: ActivityType) => {
    switch (type) {
      case "update":
        return <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#0062ff] font-bold text-[10.5px]">Cập nhật</span>;
      case "member":
        return <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10.5px]">Thành viên</span>;
      case "job":
        return <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold text-[10.5px]">Tin tuyển dụng</span>;
      case "candidate":
        return <span className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 font-bold text-[10.5px]">Ứng viên</span>;
      case "payment":
        return <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold text-[10.5px]">Thanh toán</span>;
      case "email":
        return <span className="px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-700 font-bold text-[10.5px]">Email</span>;
      case "report":
        return <span className="px-2 py-0.5 rounded-md bg-pink-50 text-pink-700 font-bold text-[10.5px]">Báo cáo</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10.5px]">Khác</span>;
    }
  };

  const getRoleTag = (role: string) => {
    switch (role) {
      case "Owner":
        return <span className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 text-[9.5px] font-bold">Owner</span>;
      case "Admin":
        return <span className="px-1.5 py-0.2 rounded bg-blue-50 text-[#0062ff] text-[9.5px] font-bold">Admin</span>;
      case "Recruiter":
        return <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 text-[9.5px] font-bold">Recruiter</span>;
      default:
        return <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[9.5px] font-bold">Viewer</span>;
    }
  };

  return (
    <div className="w-full font-sans bg-[#F7F9FC] -m-3 sm:-m-4 lg:-m-5 p-3 sm:p-4 lg:p-5 flex flex-col h-[calc(100vh-80px)] overflow-hidden space-y-3">
      {/* ======================================================== */}
      {/* 1. TOP FIXED AREA: HEADER, KPI, TABS & FILTERS           */}
      {/* ======================================================== */}
      <div className="shrink-0 space-y-3">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-transparent">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 m-0 tracking-tight leading-tight">
              Nhật ký hoạt động
            </h1>
          </div>

          <button
            type="button"
            onClick={() => message.info("Đang xuất toàn bộ lịch sử nhật ký hoạt động...")}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200/90 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5 text-[#0062ff]" />
            <span>Xuất nhật ký</span>
          </button>
        </div>

        {/* 5 KPI Cards (One Row) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* KPI 1 */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-2xs hover:border-blue-300 transition-all flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0 shadow-2xs">
            <History className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1 text-center">
            <span className="text-[11px] font-bold text-slate-500 block truncate">Tổng hoạt động</span>
            <span className="text-xl font-black text-slate-900 block leading-tight">1.248</span>
            <span className="text-[10px] text-emerald-600 font-bold block truncate">+18% so với tuần trước</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-2xs hover:border-emerald-300 transition-all flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
            <Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1 text-center">
            <span className="text-[11px] font-bold text-slate-500 block truncate">Hoạt động hôm nay</span>
            <span className="text-xl font-black text-slate-900 block leading-tight">42</span>
            <span className="text-[10px] text-emerald-600 font-bold block truncate">+12 so với hôm qua</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-2xs hover:border-purple-300 transition-all flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 shadow-2xs">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1 text-center">
            <span className="text-[11px] font-bold text-slate-500 block truncate">Thành viên hoạt động</span>
            <span className="text-xl font-black text-slate-900 block leading-tight">8</span>
            <span className="text-[10px] text-emerald-600 font-bold block truncate">+2 so với tuần trước</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-2xs hover:border-orange-300 transition-all flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 shadow-2xs">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1 text-center">
            <span className="text-[11px] font-bold text-slate-500 block truncate">Hoạt động quan trọng</span>
            <span className="text-xl font-black text-slate-900 block leading-tight">15</span>
            <span className="text-[10px] text-orange-600 font-bold block truncate">Cần bạn xem xét</span>
          </div>
        </div>

        {/* KPI 5 */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-2xs hover:border-cyan-300 transition-all flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0 shadow-2xs">
            <Activity className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1 text-center">
            <span className="text-[11px] font-bold text-slate-500 block truncate">Thời gian hoạt động</span>
            <span className="text-xl font-black text-slate-900 block leading-tight">98%</span>
            <span className="text-[10px] text-slate-400 font-medium block truncate">Trong 7 ngày qua</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. TABS + SEARCH & FILTER TOOLBAR                        */}
      {/* ======================================================== */}
      <div className="flex items-center gap-6 border-b border-slate-200 text-xs font-bold text-slate-500">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`pb-2.5 transition-colors cursor-pointer relative ${
            activeTab === "all" ? "text-[#0062ff] font-black" : "hover:text-slate-800"
          }`}
        >
          <span>Tất cả hoạt động</span>
          {activeTab === "all" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0062ff] rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("mine")}
          className={`pb-2.5 transition-colors cursor-pointer relative ${
            activeTab === "mine" ? "text-[#0062ff] font-black" : "hover:text-slate-800"
          }`}
        >
          <span>Hoạt động của tôi</span>
          {activeTab === "mine" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0062ff] rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("important")}
          className={`pb-2.5 transition-colors cursor-pointer relative ${
            activeTab === "important" ? "text-[#0062ff] font-black" : "hover:text-slate-800"
          }`}
        >
          <span>Hoạt động quan trọng</span>
          {activeTab === "important" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0062ff] rounded-full" />
          )}
        </button>
      </div>

      {/* Search and Filters row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm hoạt động, người dùng, nội dung..."
            className="pl-8 py-1.5 rounded-xl text-xs"
            allowClear
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={selectedMember}
            onChange={(val) => setSelectedMember(val)}
            className="w-40 text-xs"
            options={[
              { value: "all", label: "Tất cả thành viên" },
              { value: "Mai Phương", label: "Mai Phương (Owner)" },
              { value: "Trần Minh Quân", label: "Trần Minh Quân (Admin)" },
              { value: "Nguyễn Thanh Hương", label: "Nguyễn Thanh Hương (Admin)" },
              { value: "Lê Hoàng Nam", label: "Lê Hoàng Nam (Recruiter)" },
              { value: "Phạm Anh Dương", label: "Phạm Anh Dương (Recruiter)" },
            ]}
          />

          <Select
            value={selectedType}
            onChange={(val) => setSelectedType(val)}
            className="w-40 text-xs"
            options={[
              { value: "all", label: "Tất cả loại hoạt động" },
              { value: "update", label: "Cập nhật" },
              { value: "member", label: "Thành viên" },
              { value: "job", label: "Tin tuyển dụng" },
              { value: "candidate", label: "Ứng viên" },
              { value: "payment", label: "Thanh toán" },
              { value: "email", label: "Email" },
              { value: "report", label: "Báo cáo" },
            ]}
          />

          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold">01/05/2024 - 31/05/2024</span>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedMember("all");
              setSelectedType("all");
              setSearchQuery("");
              message.success("Đã đặt lại bộ lọc!");
            }}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-2xs flex items-center gap-1 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span>Bộ lọc</span>
          </button>
        </div>
      </div>
      </div>

      {/* ======================================================== */}
      {/* 2. MAIN 2 INDEPENDENT SCROLLING COLUMNS                  */}
      {/* ======================================================== */}
      <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-12 gap-3.5 items-stretch overflow-hidden">
        {/* ====================================================== */}
        {/* LEFT COLUMN: ACTIVITY TABLE (SCROLLS INDEPENDENTLY)    */}
        {/* ====================================================== */}
        <main className="xl:col-span-8 2xl:col-span-9 h-full min-h-0 overflow-y-auto overscroll-contain pr-1 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[10.5px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/50">
                    <th className="py-2.5 px-4">THỜI GIAN</th>
                    <th className="py-2.5 px-4">NGƯỜI THỰC HIỆN</th>
                    <th className="py-2.5 px-4">HOẠT ĐỘNG</th>
                    <th className="py-2.5 px-4">ĐỐI TƯỢNG</th>
                    <th className="py-2.5 px-4">LOẠI</th>
                    <th className="py-2.5 px-4">IP / THIẾT BỊ</th>
                    <th className="py-2.5 px-4 text-right">THAO TÁC</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {Object.keys(groupedLogs).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <div className="space-y-2">
                          <History className="w-8 h-8 text-slate-300 mx-auto" />
                          <span className="font-bold text-xs block">Không tìm thấy hoạt động nào phù hợp</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    Object.entries(groupedLogs).map(([groupName, items]) => (
                      <React.Fragment key={groupName}>
                        {/* Group Header Row */}
                        <tr className="bg-slate-50/80 border-y border-slate-100 text-[11px] font-black text-slate-700">
                          <td colSpan={7} className="py-1.5 px-4">
                            {groupName}
                          </td>
                        </tr>

                        {/* Items */}
                        {items.map((log) => (
                          <tr
                            key={log.id}
                            onClick={() => {
                              setSelectedLog(log);
                              setIsDetailModalOpen(true);
                            }}
                            className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                          >
                            {/* Thời gian */}
                            <td className="py-3 px-4 font-bold text-slate-500 text-[11px] whitespace-nowrap">
                              {log.time}
                            </td>

                            {/* Người thực hiện */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <img
                                  src={log.actor.avatar}
                                  alt={log.actor.name}
                                  className="w-6 h-6 rounded-full object-cover shrink-0"
                                />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1">
                                    <span className="font-black text-slate-900 text-xs block truncate">
                                      {log.actor.name}
                                    </span>
                                    {getRoleTag(log.actor.role)}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Hoạt động */}
                            <td className="py-3 px-4 font-bold text-slate-800 text-xs">
                              {log.action}
                            </td>

                            {/* Đối tượng */}
                            <td className="py-3 px-4 text-slate-600 text-xs font-medium">
                              {log.target}
                            </td>

                            {/* Loại */}
                            <td className="py-3 px-4">
                              {getTypeBadge(log.type)}
                            </td>

                            {/* IP / Thiết bị */}
                            <td className="py-3 px-4 text-xs font-mono">
                              <div className="space-y-0.5">
                                <span className="font-bold text-slate-700 block text-[11px]">{log.ip}</span>
                                <span className="text-[10px] text-slate-400 font-sans block">{log.device}</span>
                              </div>
                            </td>

                            {/* Thao tác */}
                            <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <Dropdown
                                menu={{
                                  items: [
                                    {
                                      key: "view",
                                      label: "Xem chi tiết hoạt động",
                                      icon: <Eye className="w-3.5 h-3.5" />,
                                      onClick: () => {
                                        setSelectedLog(log);
                                        setIsDetailModalOpen(true);
                                      },
                                    },
                                    {
                                      key: "copy",
                                      label: "Sao chép mã hoạt động",
                                      icon: <FileText className="w-3.5 h-3.5" />,
                                      onClick: () => {
                                        message.success(`Đã sao chép mã ${log.id}`);
                                      },
                                    },
                                  ],
                                }}
                                trigger={["click"]}
                              >
                                <button
                                  type="button"
                                  className="w-6 h-6 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer ml-auto"
                                >
                                  <MoreVertical className="w-3.5 h-3.5" />
                                </button>
                              </Dropdown>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="text-slate-500 font-medium">
                Hiển thị 1 - {filteredLogs.length} trong {INITIAL_LOGS.length * 138} hoạt động
              </span>

              <div className="flex items-center gap-2">
                <Pagination
                  current={currentPage}
                  onChange={(page) => setCurrentPage(page)}
                  total={1248}
                  pageSize={pageSize}
                  showSizeChanger={false}
                  size="small"
                />

                <Select
                  value={pageSize}
                  onChange={(val) => setPageSize(val)}
                  size="small"
                  className="w-24 text-xs"
                  options={[
                    { value: 10, label: "10 / trang" },
                    { value: 20, label: "20 / trang" },
                    { value: 50, label: "50 / trang" },
                  ]}
                />
              </div>
            </div>
          </div>
        </main>

        {/* ====================================================== */}
        {/* RIGHT COLUMN: INSIGHTS & WIDGETS (SCROLLS INDEPENDENT) */}
        {/* ====================================================== */}
        <aside className="xl:col-span-4 2xl:col-span-3 h-full min-h-0 overflow-y-auto overscroll-contain pr-0.5 space-y-3.5">
          {/* ---------------- 1. HOẠT ĐỘNG THEO LOẠI -------------- */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                HOẠT ĐỘNG THEO LOẠI
              </span>
            </div>

            {/* Donut Chart Visual Simulation */}
            <div className="flex items-center justify-center py-2">
              <div className="relative w-32 h-32 rounded-full border-[10px] border-blue-500 border-t-emerald-500 border-r-purple-500 border-b-orange-400 flex items-center justify-center shadow-xs">
                <div className="text-center">
                  <span className="text-lg font-black text-slate-900 block leading-tight">1.248</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Tổng</span>
                </div>
              </div>
            </div>

            {/* Chart Legend */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Cập nhật</span>
                </span>
                <span className="font-bold text-slate-900">42% (523)</span>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Thành viên</span>
                </span>
                <span className="font-bold text-slate-900">18% (224)</span>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>Tin tuyển dụng</span>
                </span>
                <span className="font-bold text-slate-900">15% (187)</span>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-orange-400" />
                  <span>Ứng viên</span>
                </span>
                <span className="font-bold text-slate-900">12% (150)</span>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Thanh toán</span>
                </span>
                <span className="font-bold text-slate-900">7% (87)</span>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>Email</span>
                </span>
                <span className="font-bold text-slate-900">4% (52)</span>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                  <span>Khác</span>
                </span>
                <span className="font-bold text-slate-900">2% (25)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => message.info("Đang tải toàn bộ phân tích loại hoạt động...")}
              className="w-full text-center text-[#0062ff] hover:underline font-bold text-xs pt-1 cursor-pointer block"
            >
              Xem chi tiết →
            </button>
          </div>

          {/* ---------------- 2. THÀNH VIÊN HOẠT ĐỘNG NHIỀU NHẤT -- */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                THÀNH VIÊN HOẠT ĐỘNG NHIỀU NHẤT
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {TOP_MEMBERS.map((m, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <img src={m.avatar} alt={m.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-slate-900 text-xs block truncate">{m.name}</span>
                        {getRoleTag(m.role)}
                      </div>
                    </div>
                  </div>

                  <span className="font-bold text-slate-500 text-[11px] shrink-0">
                    {m.count} hoạt động
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => message.info("Xem toàn bộ danh sách thành viên")}
              className="w-full text-center text-[#0062ff] hover:underline font-bold text-xs pt-1 cursor-pointer block"
            >
              Xem tất cả →
            </button>
          </div>

          {/* ---------------- 3. HOẠT ĐỘNG QUAN TRỌNG ------------ */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                HOẠT ĐỘNG QUAN TRỌNG
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {IMPORTANT_EVENTS.map((evt, idx) => {
                const IconComponent = evt.icon;
                return (
                  <div key={idx} className="flex items-start gap-2.5 p-2 bg-slate-50 hover:bg-blue-50/50 rounded-xl transition-colors cursor-pointer">
                    <div className={`w-7 h-7 rounded-lg ${evt.color} flex items-center justify-center shrink-0 mt-0.5`}>
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-slate-900 block text-xs truncate">
                        {evt.title}
                      </span>
                      <span className="text-[10.5px] text-slate-400 font-medium block mt-0.5">
                        {evt.actor} • {evt.time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveTab("important");
                message.info("Đang lọc các hoạt động quan trọng...");
              }}
              className="w-full text-center text-[#0062ff] hover:underline font-bold text-xs pt-1 cursor-pointer block"
            >
              Xem tất cả →
            </button>
          </div>
        </aside>
      </div>

      {/* ======================================================== */}
      {/* 5. MODAL: CHI TIẾT HOẠT ĐỘNG (DIFF VIEWER)               */}
      {/* ======================================================== */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <History className="w-5 h-5 text-[#0062ff]" />
            <span>Chi tiết hoạt động hệ thống</span>
          </div>
        }
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
        width={540}
        centered
      >
        {selectedLog && (
          <div className="space-y-4 pt-2 text-xs">
            {/* Header info */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={selectedLog.actor.avatar} alt={selectedLog.actor.name} className="w-7 h-7 rounded-full object-cover" />
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-black text-slate-900 text-xs">{selectedLog.actor.name}</span>
                      {getRoleTag(selectedLog.actor.role)}
                    </div>
                    <span className="text-[10px] text-slate-400 block">{selectedLog.actor.email}</span>
                  </div>
                </div>
                {getTypeBadge(selectedLog.type)}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Thời gian:</span>
                  <span className="font-bold text-slate-800">{selectedLog.dateGroup} ({selectedLog.time})</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Địa chỉ IP &amp; Thiết bị:</span>
                  <span className="font-bold text-slate-800">{selectedLog.ip} ({selectedLog.device})</span>
                </div>
              </div>
            </div>

            {/* Action & Target */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Hành động:</span>
                <span className="font-black text-slate-900">{selectedLog.action}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Đối tượng tác động:</span>
                <span className="font-bold text-[#0062ff]">{selectedLog.target}</span>
              </div>
            </div>

            {/* Before / After Change Diff */}
            {selectedLog.diff && selectedLog.diff.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="font-black text-slate-900 block text-xs">
                  Chi tiết thay đổi dữ liệu (Diff):
                </span>

                <div className="space-y-2">
                  {selectedLog.diff.map((d, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                      <span className="font-bold text-slate-800 text-[11px] block">{d.field}</span>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 rounded-lg bg-rose-50 border border-rose-100 text-rose-800">
                          <span className="text-[10px] font-bold text-rose-500 block uppercase">Trước:</span>
                          <span className="font-medium">{d.before}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-800">
                          <span className="text-[10px] font-bold text-emerald-500 block uppercase">Sau:</span>
                          <span className="font-medium">{d.after}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
