"use client";

import React, { useState, useMemo } from "react";
import {
  Modal,
  Select,
  Input,
  Dropdown,
  Tooltip,
  App,
  Radio,
  Checkbox,
  Tag,
  Space,
} from "antd";
import type { MenuProps } from "antd";
import {
  Users,
  UserCheck,
  UserPlus,
  Crown,
  ShieldCheck,
  Search,
  Filter,
  Download,
  Plus,
  MoreHorizontal,
  ChevronDown,
  CheckCircle2,
  Clock,
  Ban,
  FileText,
  Mail,
  Building,
  Calendar,
  Briefcase,
  GitPullRequest,
  Sparkles,
  Layers,
  Edit3,
  Trash2,
  RefreshCw,
  X,
  History,
  FileSpreadsheet,
  Settings,
  HelpCircle,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

// =====================================================================
// DATA TYPES & INTERFACES
// =====================================================================

export type MemberRole = "owner" | "admin" | "recruiter" | "viewer";
export type MemberStatus = "active" | "pending" | "disabled";

export interface CompanyMemberItem {
  id: string;
  fullName: string;
  email: string;
  avatar: string;
  role: MemberRole;
  department: string;
  status: MemberStatus;
  joinedAt: string;
  isOwner?: boolean;
}

export interface PermissionGroupItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  defaultLevel: "full" | "edit" | "view" | "none";
}

// =====================================================================
// INITIAL DATA DEFINITIONS
// =====================================================================

const INITIAL_MEMBERS: CompanyMemberItem[] = [
  {
    id: "mem-1",
    fullName: "Mai Phương",
    email: "maiphuong@gmail.com",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80",
    role: "owner",
    department: "Ban Giám đốc",
    status: "active",
    joinedAt: "12/12/2023",
    isOwner: true,
  },
  {
    id: "mem-2",
    fullName: "Trần Minh Quân",
    email: "admin.tran@gmail.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80",
    role: "admin",
    department: "Nhân sự",
    status: "active",
    joinedAt: "10/01/2024",
  },
  {
    id: "mem-3",
    fullName: "Nguyễn Thị Thanh Hương",
    email: "huong.nguyen@gmail.com",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80",
    role: "admin",
    department: "Tuyển dụng",
    status: "active",
    joinedAt: "15/02/2024",
  },
  {
    id: "mem-4",
    fullName: "Lê Hoàng Nam",
    email: "nam.le@gmail.com",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
    role: "recruiter",
    department: "Tuyển dụng",
    status: "active",
    joinedAt: "20/03/2024",
  },
  {
    id: "mem-5",
    fullName: "Phạm Anh Dương",
    email: "duong.pham@gmail.com",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=160&q=80",
    role: "recruiter",
    department: "Tuyển dụng",
    status: "active",
    joinedAt: "05/04/2024",
  },
  {
    id: "mem-6",
    fullName: "Vũ Quốc Bảo",
    email: "bao.vu@gmail.com",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=160&q=80",
    role: "viewer",
    department: "Marketing",
    status: "active",
    joinedAt: "18/04/2024",
  },
  {
    id: "mem-7",
    fullName: "Trần Thu Hà",
    email: "ha.tran@gmail.com",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80",
    role: "viewer",
    department: "Marketing",
    status: "disabled",
    joinedAt: "22/05/2024",
  },
  {
    id: "mem-8",
    fullName: "Đặng Minh Anh",
    email: "minhanh.dang@gmail.com",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80",
    role: "recruiter",
    department: "Nhân sự",
    status: "pending",
    joinedAt: "28/05/2024",
  },
];

const PERMISSION_GROUPS: PermissionGroupItem[] = [
  {
    id: "perm-1",
    title: "Quản lý tin tuyển dụng",
    description: "Tạo, chỉnh sửa, xóa tin tuyển dụng",
    icon: FileText,
    defaultLevel: "full",
  },
  {
    id: "perm-2",
    title: "Quản lý ứng viên",
    description: "Xem, đánh giá và thao tác với ứng viên",
    icon: Users,
    defaultLevel: "full",
  },
  {
    id: "perm-3",
    title: "Pipeline tuyển dụng",
    description: "Quản lý các giai đoạn tuyển dụng",
    icon: GitPullRequest,
    defaultLevel: "full",
  },
  {
    id: "perm-4",
    title: "Lịch phỏng vấn",
    description: "Xem, tạo và quản lý lịch phỏng vấn",
    icon: Calendar,
    defaultLevel: "full",
  },
  {
    id: "perm-5",
    title: "Offer & Onboarding",
    description: "Quản lý offer và quy trình onboarding",
    icon: Briefcase,
    defaultLevel: "full",
  },
];

const RECENT_MEMBER_ACTIVITIES = [
  {
    id: "act-1",
    text: "Mai Phương đã cập nhật quyền cho Trần Minh Quân",
    time: "2 giờ trước",
  },
  {
    id: "act-2",
    text: "Nguyễn Thị Thanh Hương được thêm vào vai trò Admin",
    time: "1 ngày trước",
  },
  {
    id: "act-3",
    text: "Đặng Minh Anh đã gửi yêu cầu tham gia công ty",
    time: "3 ngày trước",
  },
];

// =====================================================================
// MAIN COMPONENT: QUẢN LÝ THÀNH VIÊN & PHÂN QUYỀN
// =====================================================================

export default function EmployerMembersAndRolesPage() {
  const { message } = App.useApp();
  const { user } = useAuthStore();

  // State Management
  const [members, setMembers] = useState<CompanyMemberItem[]>(INITIAL_MEMBERS);
  const [selectedMember, setSelectedMember] = useState<CompanyMemberItem>(INITIAL_MEMBERS[0]);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "disabled">("all");
  const [rightPanelTab, setRightPanelTab] = useState<"info" | "permissions">("permissions");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modals
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
  const [editingTargetMember, setEditingTargetMember] = useState<CompanyMemberItem | null>(null);
  const [selectedNewRole, setSelectedNewRole] = useState<MemberRole>("recruiter");

  // Invite Form State
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<MemberRole>("recruiter");
  const [inviteDepartment, setInviteDepartment] = useState("Tuyển dụng");
  const [sendEmailInvite, setSendEmailInvite] = useState(true);

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      // Tab filter
      if (activeTab === "pending" && m.status !== "pending") return false;
      if (activeTab === "disabled" && m.status !== "disabled") return false;

      // Role filter
      if (roleFilter !== "all" && m.role !== roleFilter) return false;

      // Status filter
      if (statusFilter !== "all" && m.status !== statusFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          m.fullName.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.department.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [members, activeTab, roleFilter, statusFilter, searchQuery]);

  // KPI Calculations
  const totalCount = members.length;
  const activeCount = members.filter((m) => m.status === "active").length;
  const activePercent = Math.round((activeCount / totalCount) * 100);
  const pendingCount = members.filter((m) => m.status === "pending").length;

  // Handler: Invite Member
  const handleSendInvitation = () => {
    if (!inviteEmail || !inviteEmail.includes("@")) {
      message.error("Vui lòng nhập địa chỉ email hợp lệ!");
      return;
    }

    const newMember: CompanyMemberItem = {
      id: `mem-${Date.now()}`,
      fullName: inviteName.trim() || inviteEmail.split("@")[0],
      email: inviteEmail.trim(),
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80",
      role: inviteRole,
      department: inviteDepartment,
      status: "pending",
      joinedAt: new Date().toLocaleDateString("vi-VN"),
    };

    setMembers((prev) => [newMember, ...prev]);
    setIsInviteModalOpen(false);
    setInviteEmail("");
    setInviteName("");
    message.success("Đã gửi lời mời tham gia thành công!");
  };

  // Handler: Change Role
  const handleSaveRoleChange = () => {
    if (!editingTargetMember) return;
    setMembers((prev) =>
      prev.map((m) =>
        m.id === editingTargetMember.id ? { ...m, role: selectedNewRole } : m
      )
    );
    if (selectedMember.id === editingTargetMember.id) {
      setSelectedMember((prev) => ({ ...prev, role: selectedNewRole }));
    }
    setIsEditRoleModalOpen(false);
    message.success(`Đã cập nhật vai trò thành ${selectedNewRole.toUpperCase()}!`);
  };

  // Handler: Disable / Activate Member
  const handleToggleMemberStatus = (member: CompanyMemberItem) => {
    if (member.isOwner) {
      message.warning("Không thể vô hiệu hóa tài khoản Owner!");
      return;
    }
    const newStatus: MemberStatus = member.status === "disabled" ? "active" : "disabled";
    setMembers((prev) =>
      prev.map((m) => (m.id === member.id ? { ...m, status: newStatus } : m))
    );
    if (selectedMember.id === member.id) {
      setSelectedMember((prev) => ({ ...prev, status: newStatus }));
    }
    message.success(
      newStatus === "active"
        ? "Đã kích hoạt lại tài khoản thành viên!"
        : "Đã vô hiệu hóa tài khoản thành viên!"
    );
  };

  // Handler: Delete Member
  const handleDeleteMember = (member: CompanyMemberItem) => {
    if (member.isOwner) {
      message.warning("Không thể xóa tài khoản Owner khỏi doanh nghiệp!");
      return;
    }
    setMembers((prev) => prev.filter((m) => m.id !== member.id));
    if (selectedMember.id === member.id) {
      setSelectedMember(members[0]);
    }
    message.success("Đã xóa thành viên khỏi công ty!");
  };

  // Helper: Role Badge
  const renderRoleBadge = (role: MemberRole) => {
    switch (role) {
      case "owner":
        return (
          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold text-[11px] border border-purple-100/80">
            Owner
          </span>
        );
      case "admin":
        return (
          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-100/80">
            Admin
          </span>
        );
      case "recruiter":
        return (
          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-100/80">
            Recruiter
          </span>
        );
      case "viewer":
      default:
        return (
          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[11px] border border-slate-200/80">
            Viewer
          </span>
        );
    }
  };

  // Helper: Status Badge
  const renderStatusBadge = (status: MemberStatus) => {
    switch (status) {
      case "active":
        return (
          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[11px]">
            Hoạt động
          </span>
        );
      case "pending":
        return (
          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold text-[11px]">
            Mời chờ
          </span>
        );
      case "disabled":
        return (
          <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-bold text-[11px]">
            Đã vô hiệu hóa
          </span>
        );
    }
  };

  // Action Menu generator for a member
  const getActionMenuItems = (member: CompanyMemberItem): MenuProps["items"] => {
    return [
      {
        key: "view",
        label: "Xem chi tiết quyền hạn",
        icon: <ShieldCheck className="w-3.5 h-3.5" />,
        onClick: () => setSelectedMember(member),
      },
      {
        key: "role",
        label: "Chỉnh sửa vai trò",
        icon: <Edit3 className="w-3.5 h-3.5 text-blue-600" />,
        disabled: member.isOwner,
        onClick: () => {
          setEditingTargetMember(member);
          setSelectedNewRole(member.role);
          setIsEditRoleModalOpen(true);
        },
      },
      {
        key: "resend",
        label: "Gửi lại lời mời",
        icon: <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />,
        disabled: member.status !== "pending",
        onClick: () => message.success(`Đã gửi lại lời mời tới ${member.email}`),
      },
      {
        type: "divider",
      },
      {
        key: "toggle-status",
        label: member.status === "disabled" ? "Kích hoạt lại tài khoản" : "Vô hiệu hóa tài khoản",
        icon: <Ban className="w-3.5 h-3.5 text-amber-600" />,
        disabled: member.isOwner,
        onClick: () => handleToggleMemberStatus(member),
      },
      {
        key: "delete",
        label: "Xóa khỏi công ty",
        icon: <Trash2 className="w-3.5 h-3.5 text-rose-600" />,
        danger: true,
        disabled: member.isOwner,
        onClick: () => handleDeleteMember(member),
      },
    ];
  };

  return (
    <div className="space-y-4 w-full font-sans pb-16 bg-[#F7F9FC] -m-3 sm:-m-4 lg:-m-5 p-3 sm:p-4 lg:p-5">
      {/* ======================================================== */}
      {/* 1. TOP HEADER                                            */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-transparent">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 m-0 tracking-tight leading-tight">
              Quản lý thành viên &amp; Phân quyền
            </h1>
            <span className="w-4 h-4 rounded-full bg-[#0062ff] text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-3 h-3 fill-white text-[#0062ff]" />
            </span>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsInviteModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Mời thành viên</span>
            <ChevronDown className="w-3 h-3 ml-0.5 opacity-80" />
          </button>

          <button
            type="button"
            onClick={() => message.info("Đang xuất danh sách thành viên ra file Excel...")}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200/90 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Xuất dữ liệu</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. 4 KPI CARDS (ONE ROW)                                 */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:border-blue-300 transition-all flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 shadow-2xs">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex-1 text-center space-y-0.5 min-w-0">
            <span className="text-[11px] font-bold text-slate-500 block">Tổng thành viên</span>
            <span className="text-xl font-black text-slate-900 block leading-tight">
              {totalCount}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block">+3 trong tháng này</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:border-emerald-300 transition-all flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
            <UserCheck className="w-5 h-5" />
          </div>
          <div className="flex-1 text-center space-y-0.5 min-w-0">
            <span className="text-[11px] font-bold text-slate-500 block">Đang hoạt động</span>
            <span className="text-xl font-black text-slate-900 block leading-tight">
              {activeCount}
            </span>
            <span className="text-[10px] text-emerald-600 font-bold block">{activePercent}% thành viên</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:border-amber-300 transition-all flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-2xs">
            <Crown className="w-5 h-5" />
          </div>
          <div className="flex-1 text-center space-y-0.5 min-w-0">
            <span className="text-[11px] font-bold text-slate-500 block">Vai trò</span>
            <span className="text-xl font-black text-slate-900 block leading-tight">
              4
            </span>
            <span className="text-[10px] text-slate-400 font-medium block truncate">
              Owner, Admin, Recruiter, Viewer
            </span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:border-cyan-300 transition-all flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0 shadow-2xs">
            <UserPlus className="w-5 h-5" />
          </div>
          <div className="flex-1 text-center space-y-0.5 min-w-0">
            <span className="text-[11px] font-bold text-slate-500 block">Mời chờ</span>
            <span className="text-xl font-black text-[#0062ff] block leading-tight">
              {pendingCount}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block">Chờ xác nhận tham gia</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. TABS + TOOLBAR (TẤT CẢ / MỜI CHỜ / ĐÃ VÔ HIỆU HÓA)    */}
      {/* ======================================================== */}
      <div className="space-y-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-6 border-b border-slate-200/80 text-xs font-bold text-slate-500">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`pb-2.5 transition-colors cursor-pointer relative ${
              activeTab === "all" ? "text-[#0062ff] font-black" : "hover:text-slate-800"
            }`}
          >
            <span>Tất cả thành viên</span>
            {activeTab === "all" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0062ff] rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pending")}
            className={`pb-2.5 transition-colors cursor-pointer relative ${
              activeTab === "pending" ? "text-[#0062ff] font-black" : "hover:text-slate-800"
            }`}
          >
            <span>Mời chờ ({pendingCount})</span>
            {activeTab === "pending" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0062ff] rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("disabled")}
            className={`pb-2.5 transition-colors cursor-pointer relative ${
              activeTab === "disabled" ? "text-[#0062ff] font-black" : "hover:text-slate-800"
            }`}
          >
            <span>Đã vô hiệu hóa</span>
            {activeTab === "disabled" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0062ff] rounded-full" />
            )}
          </button>
        </div>

        {/* Toolbar: Search, Role Select, Status Select, Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
          {/* Left Search */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên, email hoặc vai trò..."
              className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Right Select Filters */}
          <div className="flex items-center gap-2">
            <Select
              value={roleFilter}
              onChange={setRoleFilter}
              className="w-36 text-xs"
              size="small"
              options={[
                { value: "all", label: "Tất cả vai trò" },
                { value: "owner", label: "Owner" },
                { value: "admin", label: "Admin" },
                { value: "recruiter", label: "Recruiter" },
                { value: "viewer", label: "Viewer" },
              ]}
            />

            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-36 text-xs"
              size="small"
              options={[
                { value: "all", label: "Tất cả trạng thái" },
                { value: "active", label: "Hoạt động" },
                { value: "pending", label: "Mời chờ" },
                { value: "disabled", label: "Đã vô hiệu hóa" },
              ]}
            />

            <button
              type="button"
              onClick={() => {
                setRoleFilter("all");
                setStatusFilter("all");
                setSearchQuery("");
                message.info("Đã đặt lại bộ lọc");
              }}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Filter className="w-3 h-3" />
              <span>Bộ lọc</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. MAIN WORKSPACE: 2 COLUMNS (LEFT TABLE 75% | RIGHT 25%)*/}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* ====================================================== */}
        {/* LEFT COLUMN: MEMBER TABLE & PAGINATION (col-span-9)    */}
        {/* ====================================================== */}
        <div className="xl:col-span-8 2xl:col-span-9 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[10.5px] font-bold text-slate-400 uppercase">
                  <th className="py-3 px-2">THÀNH VIÊN</th>
                  <th className="py-3 px-2">VAI TRÒ</th>
                  <th className="py-3 px-2">BỘ PHẬN</th>
                  <th className="py-3 px-2">TRẠNG THÁI</th>
                  <th className="py-3 px-2">THAM GIA</th>
                  <th className="py-3 px-2 text-right">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Không tìm thấy thành viên nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => {
                    const isSelected = selectedMember?.id === member.id;
                    return (
                      <tr
                        key={member.id}
                        onClick={() => setSelectedMember(member)}
                        className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                          isSelected ? "bg-blue-50/40" : ""
                        }`}
                      >
                        {/* 1. Member Profile */}
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-3">
                            <img
                              src={member.avatar}
                              alt={member.fullName}
                              className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900 text-xs">
                                  {member.fullName}
                                </span>
                                {member.isOwner && (
                                  <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 font-black text-[9.5px]">
                                    Owner
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400 block truncate">
                                {member.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 2. Role */}
                        <td className="py-3 px-2">{renderRoleBadge(member.role)}</td>

                        {/* 3. Department */}
                        <td className="py-3 px-2 text-slate-800 font-medium">
                          {member.department || "—"}
                        </td>

                        {/* 4. Status */}
                        <td className="py-3 px-2">{renderStatusBadge(member.status)}</td>

                        {/* 5. Joined Date */}
                        <td className="py-3 px-2 text-slate-500 font-medium">
                          {member.joinedAt}
                        </td>

                        {/* 6. Actions */}
                        <td className="py-3 px-2 text-right" onClick={(e) => e.stopPropagation()}>
                          {member.status === "pending" ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => message.success(`Đã gửi lại lời mời tới ${member.email}`)}
                                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#0062ff] font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
                              >
                                Gửi lại
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteMember(member)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
                              >
                                Hủy
                              </button>
                            </div>
                          ) : (
                            <Dropdown menu={{ items: getActionMenuItems(member) }} trigger={["click"]}>
                              <button
                                type="button"
                                className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer ml-auto"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </Dropdown>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Hiển thị 1 – {filteredMembers.length} trong tổng {members.length} thành viên
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 cursor-pointer"
              >
                ‹
              </button>
              <button
                type="button"
                className="w-7 h-7 rounded-lg bg-[#0062ff] text-white font-bold flex items-center justify-center cursor-pointer"
              >
                1
              </button>
              <button
                type="button"
                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 cursor-pointer"
              >
                2
              </button>
              <button
                type="button"
                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 cursor-pointer"
              >
                3
              </button>
              <span className="px-1 text-slate-400">...</span>
              <button
                type="button"
                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 cursor-pointer"
              >
                4
              </button>
              <button
                type="button"
                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 cursor-pointer"
              >
                ›
              </button>

              <Select
                defaultValue="8"
                size="small"
                className="ml-2 w-24 text-xs"
                options={[
                  { value: "8", label: "8 / trang" },
                  { value: "15", label: "15 / trang" },
                  { value: "30", label: "30 / trang" },
                ]}
              />
            </div>
          </div>
        </div>

        {/* ====================================================== */}
        {/* RIGHT COLUMN: PERMISSION DETAIL & ACTIONS (col-span-3) */}
        {/* ====================================================== */}
        <div className="xl:col-span-4 2xl:col-span-3 space-y-4 sticky top-4 max-h-[calc(100vh-80px)] overflow-y-auto pr-0.5">
          {/* ---------------- 1. CHI TIẾT QUYỀN HẠN --------------- */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                CHI TIẾT QUYỀN HẠN
              </span>
            </div>

            {/* Selected Member Profile Header */}
            {selectedMember && (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <img
                    src={selectedMember.avatar}
                    alt={selectedMember.fullName}
                    className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-slate-900 text-xs truncate">
                        {selectedMember.fullName}
                      </span>
                      {renderRoleBadge(selectedMember.role)}
                    </div>
                    <span className="text-[11px] text-slate-400 block truncate">
                      {selectedMember.email}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Tham gia: {selectedMember.joinedAt} •{" "}
                      <span className="text-emerald-600 font-bold">Hoạt động</span>
                    </span>
                  </div>
                </div>

                {/* Tabs inside Panel: Thông tin | Quyền hạn */}
                <div className="flex items-center gap-4 border-b border-slate-100 text-xs font-bold text-slate-500 pt-1">
                  <button
                    type="button"
                    onClick={() => setRightPanelTab("info")}
                    className={`pb-1.5 cursor-pointer ${
                      rightPanelTab === "info" ? "text-[#0062ff] border-b-2 border-[#0062ff]" : ""
                    }`}
                  >
                    Thông tin
                  </button>
                  <button
                    type="button"
                    onClick={() => setRightPanelTab("permissions")}
                    className={`pb-1.5 cursor-pointer ${
                      rightPanelTab === "permissions" ? "text-[#0062ff] border-b-2 border-[#0062ff]" : ""
                    }`}
                  >
                    Quyền hạn
                  </button>
                </div>

                {/* Role Card Banner */}
                <div className="p-3 bg-purple-50/70 border border-purple-100/90 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-purple-700 font-bold text-xs">
                    <Crown className="w-3.5 h-3.5" />
                    <span>
                      {selectedMember.role === "owner"
                        ? "Owner"
                        : selectedMember.role === "admin"
                        ? "Admin"
                        : selectedMember.role === "recruiter"
                        ? "Recruiter"
                        : "Viewer"}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-600 font-medium m-0 leading-tight">
                    {selectedMember.role === "owner"
                      ? "Toàn quyền quản lý công ty và hệ thống"
                      : selectedMember.role === "admin"
                      ? "Quản trị tuyển dụng, ứng viên và thành viên"
                      : selectedMember.role === "recruiter"
                      ? "Đăng tin, quản lý ứng viên và lịch phỏng vấn"
                      : "Chỉ xem thông tin và báo cáo tuyển dụng"}
                  </p>
                </div>

                {/* Permission Group List */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-800 uppercase">
                      QUYỀN HẠN
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600">
                      (24/24)
                    </span>
                  </div>

                  <div className="space-y-2">
                    {PERMISSION_GROUPS.map((p) => {
                      const IconComp = p.icon;
                      return (
                        <div
                          key={p.id}
                          className="p-2.5 bg-slate-50/90 border border-slate-100 rounded-xl space-y-1.5"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <div className="w-5 h-5 rounded-md bg-blue-100 text-[#0062ff] flex items-center justify-center shrink-0">
                                <IconComp className="w-3 h-3" />
                              </div>
                              <span className="text-xs font-bold text-slate-900 truncate">
                                {p.title}
                              </span>
                            </div>

                            <Select
                              defaultValue="full"
                              size="small"
                              className="w-24 text-[10px]"
                              options={[
                                { value: "full", label: "Toàn quyền" },
                                { value: "edit", label: "Chỉnh sửa" },
                                { value: "view", label: "Chỉ xem" },
                                { value: "none", label: "Không quyền" },
                              ]}
                            />
                          </div>

                          <p className="text-[10px] text-slate-400 font-medium m-0 leading-tight pl-6">
                            {p.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => message.info("Đang tải danh sách đầy đủ 24 quyền hạn...")}
                    className="w-full py-1.5 text-center text-[#0062ff] hover:underline font-bold text-xs cursor-pointer block mt-1"
                  >
                    Xem tất cả quyền (24)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ---------------- 2. THAO TÁC NHANH ------------------- */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
            <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider block pb-1 border-b border-slate-100">
              THAO TÁC NHANH
            </span>

            <div className="grid grid-cols-2 gap-2">
              <Tooltip title="Phân quyền hàng loạt cho nhiều thành viên">
                <button
                  type="button"
                  onClick={() => message.info("Chức năng phân quyền hàng loạt sắp ra mắt")}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-100 text-center space-y-1 transition-all flex flex-col items-center justify-center cursor-pointer group"
                >
                  <Users className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                  <span className="text-[9.5px] font-bold text-slate-700 block leading-tight">
                    Phân quyền hàng loạt
                  </span>
                </button>
              </Tooltip>

              <Tooltip title="Nhập danh sách từ Excel">
                <button
                  type="button"
                  onClick={() => message.info("Chức năng nhập từ Excel sắp ra mắt")}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-100 text-center space-y-1 transition-all flex flex-col items-center justify-center cursor-pointer group"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span className="text-[9.5px] font-bold text-slate-700 block leading-tight">
                    Nhập từ Excel
                  </span>
                </button>
              </Tooltip>

              <Tooltip title="Xem lịch sử phân quyền và hoạt động">
                <button
                  type="button"
                  onClick={() => message.info("Đang mở lịch sử thay đổi quyền...")}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-100 text-center space-y-1 transition-all flex flex-col items-center justify-center cursor-pointer group"
                >
                  <History className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
                  <span className="text-[9.5px] font-bold text-slate-700 block leading-tight">
                    Lịch sử thay đổi
                  </span>
                </button>
              </Tooltip>

              <Tooltip title="Cài đặt cấu hình vai trò & quyền hạn">
                <button
                  type="button"
                  onClick={() => message.info("Đang mở cấu hình vai trò & quyền hạn...")}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 hover:border-amber-200 border border-slate-100 text-center space-y-1 transition-all flex flex-col items-center justify-center cursor-pointer group"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
                  <span className="text-[9.5px] font-bold text-slate-700 block leading-tight">
                    Vai trò &amp; quyền hạn
                  </span>
                </button>
              </Tooltip>
            </div>
          </div>

          {/* ---------------- 3. HOẠT ĐỘNG GẦN ĐÂY ---------------- */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                HOẠT ĐỘNG GẦN ĐÂY
              </span>
              <button
                type="button"
                onClick={() => message.info("Xem toàn bộ nhật ký phân quyền")}
                className="text-[#0062ff] hover:underline text-[11px] font-bold cursor-pointer"
              >
                Xem tất cả
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {RECENT_MEMBER_ACTIVITIES.map((act) => (
                <div key={act.id} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0 mt-0.5">
                    <Users className="w-3 h-3" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-slate-800 block text-xs leading-snug">
                      {act.text}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                      {act.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. MODAL: MỜI THÀNH VIÊN VÀO CÔNG TY                     */}
      {/* ======================================================== */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <UserPlus className="w-5 h-5 text-[#0062ff]" />
            <span>Mời thành viên vào công ty</span>
          </div>
        }
        open={isInviteModalOpen}
        onCancel={() => setIsInviteModalOpen(false)}
        footer={null}
        width={480}
        centered
      >
        <div className="space-y-3.5 pt-2 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Địa chỉ Email <span className="text-rose-500">*</span>
            </label>
            <Input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="VD: hr.candidate@gmail.com"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Họ và tên</label>
            <Input
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="VD: Nguyễn Văn A"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Vai trò <span className="text-rose-500">*</span>
            </label>
            <Select
              value={inviteRole}
              onChange={setInviteRole}
              className="w-full text-xs"
              options={[
                { value: "admin", label: "Admin (Quản trị viên)" },
                { value: "recruiter", label: "Recruiter (Chuyên viên tuyển dụng)" },
                { value: "viewer", label: "Viewer (Chỉ xem)" },
              ]}
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Bộ phận</label>
            <Select
              value={inviteDepartment}
              onChange={setInviteDepartment}
              className="w-full text-xs"
              options={[
                { value: "Ban Giám đốc", label: "Ban Giám đốc" },
                { value: "Nhân sự", label: "Nhân sự" },
                { value: "Tuyển dụng", label: "Tuyển dụng" },
                { value: "Marketing", label: "Marketing" },
                { value: "IT - Kỹ thuật", label: "IT - Kỹ thuật" },
              ]}
            />
          </div>

          <div className="pt-1">
            <Checkbox
              checked={sendEmailInvite}
              onChange={(e) => setSendEmailInvite(e.target.checked)}
              className="text-xs text-slate-700 font-medium"
            >
              Gửi email mời tham gia Careza kèm liên kết thiết lập mật khẩu
            </Checkbox>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSendInvitation}
              className="px-4 py-2 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold shadow-sm cursor-pointer"
            >
              Gửi lời mời
            </button>
          </div>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* 6. MODAL: CHỈNH SỬA VAI TRÒ                              */}
      {/* ======================================================== */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Edit3 className="w-5 h-5 text-blue-600" />
            <span>Chỉnh sửa vai trò thành viên</span>
          </div>
        }
        open={isEditRoleModalOpen}
        onCancel={() => setIsEditRoleModalOpen(false)}
        footer={null}
        width={440}
        centered
      >
        {editingTargetMember && (
          <div className="space-y-4 pt-2 text-xs">
            {/* Target Member Info */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <img
                src={editingTargetMember.avatar}
                alt={editingTargetMember.fullName}
                className="w-9 h-9 rounded-full object-cover border border-slate-200"
              />
              <div>
                <span className="font-bold text-slate-900 block text-xs">
                  {editingTargetMember.fullName}
                </span>
                <span className="text-[11px] text-slate-400 block">
                  {editingTargetMember.email}
                </span>
              </div>
            </div>

            {/* Role Options */}
            <div className="space-y-2.5">
              <label className="font-bold text-slate-700 block">Chọn vai trò mới:</label>
              <Radio.Group
                value={selectedNewRole}
                onChange={(e) => setSelectedNewRole(e.target.value)}
                className="w-full space-y-2"
              >
                <div className="p-3 border rounded-xl hover:border-blue-300 transition-colors block">
                  <Radio value="admin" className="font-bold text-xs text-slate-900">
                    Admin
                  </Radio>
                  <p className="text-[10.5px] text-slate-500 font-medium m-0 pl-6 mt-0.5">
                    Quản trị toàn bộ tin tuyển dụng, ứng viên, thành viên và cài đặt chung.
                  </p>
                </div>

                <div className="p-3 border rounded-xl hover:border-blue-300 transition-colors block">
                  <Radio value="recruiter" className="font-bold text-xs text-slate-900">
                    Recruiter
                  </Radio>
                  <p className="text-[10.5px] text-slate-500 font-medium m-0 pl-6 mt-0.5">
                    Đăng tin tuyển dụng, sàng lọc ứng viên, sắp lịch phỏng vấn và gửi offer.
                  </p>
                </div>

                <div className="p-3 border rounded-xl hover:border-blue-300 transition-colors block">
                  <Radio value="viewer" className="font-bold text-xs text-slate-900">
                    Viewer
                  </Radio>
                  <p className="text-[10.5px] text-slate-500 font-medium m-0 pl-6 mt-0.5">
                    Chỉ có quyền xem thông tin hồ sơ ứng viên và báo cáo thống kê.
                  </p>
                </div>
              </Radio.Group>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditRoleModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveRoleChange}
                className="px-4 py-2 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold shadow-sm cursor-pointer"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
