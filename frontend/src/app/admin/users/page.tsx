"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { adminService } from "@/services/admin.service";

import {
  Dropdown,
  Modal,
  Form,
  Input,
  Select,
  Checkbox,
  App,
  Drawer,
  Radio,
  DatePicker,
} from "antd";
import {
  Users,
  User,
  Building2,
  ShieldCheck,
  Search,
  SlidersHorizontal,
  Download,
  Plus,
  MoreHorizontal,
  X,
  Edit2,
  Mail,
  Lock,
  Unlock,
  KeyRound,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Clock,
  Phone,
  Calendar,
  MapPin,
  FileText,
  Activity,
  StickyNote,
  Send,
  RefreshCw,
  Eye,
} from "lucide-react";

// Dữ liệu người dùng mẫu
const INITIAL_USERS = [
  {
    id: "USR_000123",
    name: "Nguyễn Thị Phương Mai",
    email: "phuongmai@gmail.com",
    role: "CANDIDATE",
    phone: "0901 234 567",
    createdAt: "15/09/2026 14:32",
    lastLoginAt: "15/09/2026 20:15",
    status: "ACTIVE",
    birthday: "15/03/2004",
    gender: "Nữ",
    address: "Quận 1, TP. Hồ Chí Minh",
    emailVerified: true,
    phoneVerified: true,
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&h=600&q=85",
    companyName: null,
  },
  {
    id: "USR_000124",
    name: "Hoàng Minh Tuấn",
    email: "tuan.hoang@fpt.com",
    role: "RECRUITER",
    phone: "028 1234 5678",
    createdAt: "14/09/2026 10:21",
    lastLoginAt: "15/09/2026 09:30",
    status: "ACTIVE",
    birthday: "18/06/1990",
    gender: "Nam",
    address: "Cầu Giấy, Hà Nội",
    emailVerified: true,
    phoneVerified: true,
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&h=600&q=85",
    companyName: "FPT Software",
    companyId: "CMP_FPT",
    position: "Trưởng phòng Tuyển dụng IT (Talent Acquisition Lead)",
    companyRole: "Quản trị viên tuyển dụng (HR Manager)",
    branch: "Chi nhánh Hà Nội (FPT Tower, Cầu Giấy)",
    permissions: [
      "Đăng tin tuyển dụng",
      "Xem hồ sơ ứng viên",
      "Mời phỏng vấn",
      "Quản trị nhóm tuyển dụng",
    ],
    memberStatus: "Đang hoạt động",
    companyJoinedAt: "15/03/2023",
  },
  {
    id: "USR_000125",
    name: "Trần Văn An",
    email: "an.tran@gmail.com",
    role: "CANDIDATE",
    phone: "0933 456 789",
    createdAt: "14/09/2026 09:18",
    lastLoginAt: "14/09/2026 16:45",
    status: "ACTIVE",
    birthday: "20/08/1998",
    gender: "Nam",
    address: "Bình Thạnh, TP. Hồ Chí Minh",
    emailVerified: true,
    phoneVerified: true,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&h=600&q=85",
    companyName: null,
  },
  {
    id: "USR_000126",
    name: "Đặng Thị Thảo My",
    email: "my.dang@vng.com.vn",
    role: "RECRUITER",
    phone: "024 9876 5432",
    createdAt: "13/09/2026 16:45",
    lastLoginAt: "13/09/2026 17:00",
    status: "PENDING",
    birthday: "14/09/1996",
    gender: "Nữ",
    address: "Quận 7, TP. Hồ Chí Minh",
    emailVerified: true,
    phoneVerified: false,
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&h=600&q=85",
    companyName: "Tập đoàn VNG",
    companyId: "CMP_VNG",
    position: "Chuyên viên Tuyển dụng (Recruiter)",
    companyRole: "Nhân viên tuyển dụng",
    branch: "VNG Campus, Quận 7, TP.HCM",
    permissions: [
      "Đăng tin tuyển dụng",
      "Xem hồ sơ ứng viên",
      "Mời phỏng vấn",
    ],
    memberStatus: "Chờ phê duyệt",
    companyJoinedAt: "10/01/2024",
  },
  {
    id: "USR_000127",
    name: "Lê Thị Thu Hà",
    email: "hathu98@gmail.com",
    role: "CANDIDATE",
    phone: "0388 992 233",
    createdAt: "13/09/2026 11:12",
    lastLoginAt: "14/09/2026 21:00",
    status: "ACTIVE",
    birthday: "12/04/1998",
    gender: "Nữ",
    address: "Hải Châu, Đà Nẵng",
    emailVerified: true,
    phoneVerified: true,
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&h=600&q=85",
    companyName: null,
  },
  {
    id: "USR_000128",
    name: "Phạm Minh Quân",
    email: "quanpm@gmail.com",
    role: "CANDIDATE",
    phone: "0909 221 118",
    createdAt: "12/09/2026 20:03",
    lastLoginAt: "13/09/2026 08:10",
    status: "LOCKED",
    birthday: "05/11/1995",
    gender: "Nam",
    address: "Hai Bà Trưng, Hà Nội",
    emailVerified: true,
    phoneVerified: false,
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&h=600&q=85",
    companyName: null,
  },
  {
    id: "USR_000129",
    name: "Lê Quốc Bảo",
    email: "bao.le@anphat.vn",
    role: "RECRUITER",
    phone: "028 6688 9900",
    createdAt: "12/09/2026 14:22",
    lastLoginAt: "14/09/2026 10:12",
    status: "ACTIVE",
    birthday: "25/12/1988",
    gender: "Nam",
    address: "Quận 7, TP. Hồ Chí Minh",
    emailVerified: true,
    phoneVerified: true,
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&h=600&q=85",
    companyName: "Công ty Cổ phần An Phát",
    companyId: "CMP_ANPHAT",
    position: "Giám đốc Tuyển dụng & Đào tạo",
    companyRole: "Chủ quản lý tài khoản (Owner)",
    branch: "Văn phòng Quận 7, TP.HCM",
    permissions: [
      "Toàn quyền quản trị tuyển dụng",
      "Quản lý ngân sách tin",
      "Quản trị thành viên",
    ],
    memberStatus: "Đang hoạt động",
    companyJoinedAt: "05/06/2022",
  },
  {
    id: "USR_000130",
    name: "Admin System",
    email: "admin@careza.vn",
    role: "ADMIN",
    phone: "0912 345 678",
    createdAt: "10/09/2026 08:00",
    lastLoginAt: "15/09/2026 22:30",
    status: "ACTIVE",
    birthday: "—",
    gender: "Hệ thống",
    address: "Trụ sở Careza, TP. Hồ Chí Minh",
    emailVerified: true,
    phoneVerified: true,
    avatar:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&h=600&q=85",
    companyName: null,
  },
  {
    id: "USR_000131",
    name: "Hoàng Thị Kim Ngân",
    email: "ngan.hoang@gmail.com",
    role: "CANDIDATE",
    phone: "0937 445 566",
    createdAt: "10/09/2026 21:15",
    lastLoginAt: "15/09/2026 19:40",
    status: "ACTIVE",
    birthday: "28/09/2001",
    gender: "Nữ",
    address: "Ninh Kiều, Cần Thơ",
    emailVerified: true,
    phoneVerified: true,
    avatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&h=600&q=85",
    companyName: null,
  },
  {
    id: "USR_000132",
    name: "Vũ Phương Linh",
    email: "linh.vu@techsol.vn",
    role: "RECRUITER",
    phone: "024 7788 1122",
    createdAt: "09/09/2026 17:30",
    lastLoginAt: "10/09/2026 09:00",
    status: "DISABLED",
    birthday: "10/10/1994",
    gender: "Nữ",
    address: "Khu Công Nghệ Cao, TP. Thủ Đức",
    emailVerified: false,
    phoneVerified: false,
    avatar:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&h=600&q=85",
    companyName: "Tech Solutions",
    companyId: "CMP_TECHSOL",
    position: "Chuyên viên Nhân sự & Tuyển dụng",
    companyRole: "Nhân viên tuyển dụng",
    branch: "Chi nhánh TP. Thủ Đức",
    permissions: ["Xem hồ sơ ứng viên"],
    memberStatus: "Bị vô hiệu hóa",
    companyJoinedAt: "12/08/2024",
  },
];

function AdminUsersContent() {
  const router = useRouter();
  const { message, modal } = App.useApp();

  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userSummary, setUserSummary] = useState({
    total_users: 0,
    candidates_count: 0,
    employers_count: 0,
    admins_count: 0,
    active_count: 0,
    locked_count: 0,
  });
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Tabs bộ lọc vai trò trên bảng: Tất cả | Ứng viên | Nhà tuyển dụng | Quản trị viên
  const [activeTab, setActiveTab] = useState<"ALL" | "CANDIDATE" | "RECRUITER" | "ADMIN">("ALL");

  // Thanh lọc cơ bản
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");

  // Bộ lọc nâng cao state
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [advFilters, setAdvFilters] = useState({
    role: "ALL",
    status: "ALL",
    emailVerified: "ALL",
    phoneVerified: "ALL",
    createdAtFrom: "",
    createdAtTo: "",
    lastLoginFrom: "",
    lastLoginTo: "",
  });
  const [appliedAdvFilters, setAppliedAdvFilters] = useState({ ...advFilters });

  // Selected checkbox rows
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  // Tab con trong panel chi tiết bên phải
  const [detailTab, setDetailTab] = useState<"info" | "activity" | "docs" | "notes">("info");

  // Modal thêm người dùng mới
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm] = Form.useForm();

  // Modal xuất dữ liệu
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportScope, setExportScope] = useState<"all" | "filtered" | "selected">("filtered");
  const [exportFormat, setExportFormat] = useState<"xlsx" | "csv">("xlsx");
  const [exportRole, setExportRole] = useState("ALL");
  const [exportStatus, setExportStatus] = useState("ALL");
  const [exportDateFrom, setExportDateFrom] = useState("");
  const [exportDateTo, setExportDateTo] = useState("");

  // Modal gửi thông báo
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [notifyingUser, setNotifyingUser] = useState<any>(null);
  const [notifyForm] = Form.useForm();

  // Modal đặt lại mật khẩu
  const [isResetPwdModalOpen, setIsResetPwdModalOpen] = useState(false);
  const [resetPwdUser, setResetPwdUser] = useState<any>(null);
  const [resetPwdForm] = Form.useForm();

  // Modal xem ảnh đại diện kích thước lớn
  const [previewAvatar, setPreviewAvatar] = useState<{ url: string; name: string } | null>(null);

  // Map backend user sang UI object
  const mapBackendUser = (u: any) => ({
    id: String(u.id),
    name: u.full_name || u.email,
    email: u.email,
    role:
      u.account_type === "candidate"
        ? "CANDIDATE"
        : u.account_type === "employer"
          ? "RECRUITER"
          : "ADMIN",
    phone: u.phone || "—",
    createdAt: u.created_at ? new Date(u.created_at).toLocaleString("vi-VN") : "—",
    lastLoginAt: u.updated_at ? new Date(u.updated_at).toLocaleString("vi-VN") : "—",
    status: u.is_active ? "ACTIVE" : "LOCKED",
    birthday: "—",
    gender: "—",
    address: u.location || "Việt Nam",
    emailVerified: Boolean(u.email_verified_at),
    phoneVerified: Boolean(u.phone),
    avatar:
      u.avatar_url ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&h=600&q=85",
    companyName: u.company_name || null,
    companyId: u.company_id ? String(u.company_id) : undefined,
    position: u.headline || (u.account_type === "employer" ? "Nhà tuyển dụng" : "Ứng viên"),
    companyRole: u.member_role || (u.account_type === "employer" ? "Thành viên doanh nghiệp" : undefined),
    memberStatus: u.is_active ? "Đang hoạt động" : "Đã khóa",
    raw: u,
  });

  // Tải danh sách người dùng từ API thật
  const fetchUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const targetRole =
        roleFilter !== "ALL" ? roleFilter : activeTab !== "ALL" ? activeTab : undefined;
      const res = await adminService.getUsers({
        search: searchQuery || undefined,
        role: targetRole?.toLowerCase(),
        status: statusFilter !== "ALL" ? statusFilter.toLowerCase() : undefined,
        page_size: 100,
      });
      if (res?.data?.summary) {
        setUserSummary(res.data.summary);
      }
      if (res?.data?.items) {
        const mapped = res.data.items.map(mapBackendUser);
        setUsers(mapped);
        setSelectedUser((prev: any) => {
          if (mapped.length === 0) return null;
          if (!prev) return mapped[0];
          const found = mapped.find((m: any) => m.id === prev.id);
          return found || mapped[0];
        });
      }
    } catch (err) {
      console.warn("Lỗi nạp danh sách admin users từ API:", err);
    } finally {
      setIsLoadingUsers(false);
    }
  }, [searchQuery, roleFilter, activeTab, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Thao tác Khóa / Mở khóa với API thật
  const handleToggleBlock = (targetUser: any) => {
    const isLocked = targetUser.status === "LOCKED";
    modal.confirm({
      title: isLocked ? "Mở khóa tài khoản?" : "Xác nhận khóa tài khoản?",
      content: isLocked
        ? `Bạn có chắc chắn muốn mở khóa cho tài khoản "${targetUser.name}" (${targetUser.email})? Người dùng sẽ có thể đăng nhập lại bình thường.`
        : `Bạn có chắc chắn muốn tạm khóa tài khoản "${targetUser.name}" (${targetUser.email})? Người dùng này sẽ không thể đăng nhập vào hệ thống.`,
      okText: isLocked ? "Mở khóa tài khoản" : "Khóa tài khoản",
      okType: isLocked ? "primary" : "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          const nextActive = isLocked; // isLocked -> mở khóa (is_active = true)
          await adminService.updateUserStatus(targetUser.id, nextActive);
          const nextStatus = isLocked ? "ACTIVE" : "LOCKED";
          setUsers((prev) =>
            prev.map((u) => (u.id === targetUser.id ? { ...u, status: nextStatus } : u))
          );
          if (selectedUser?.id === targetUser.id) {
            setSelectedUser((prev: any) => ({ ...prev, status: nextStatus }));
          }
          message.success(
            isLocked
              ? `Đã mở khóa tài khoản "${targetUser.name}" thành công!`
              : `Đã khóa tài khoản "${targetUser.name}" thành công!`
          );
        } catch (err: any) {
          message.error(err?.response?.data?.errors?.is_active?.[0] || "Cập nhật trạng thái người dùng thất bại.");
        }
      },
    });
  };

  // Mở modal đặt lại mật khẩu
  const openResetPasswordModal = (user: any) => {
    setResetPwdUser(user);
    resetPwdForm.resetFields();
    setIsResetPwdModalOpen(true);
  };

  const handleConfirmResetPassword = async () => {
    if (!resetPwdUser) return;
    try {
      const values = await resetPwdForm.validateFields();
      await adminService.resetUserPassword(resetPwdUser.id, values.newPassword);
      message.success(
        `Đã đặt lại mật khẩu cho tài khoản "${resetPwdUser.email}", thu hồi các phiên đăng nhập cũ và gửi cảnh báo bảo mật!`
      );
      resetPwdForm.resetFields();
      setIsResetPwdModalOpen(false);
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(
        err?.response?.data?.errors?.password?.[0] ||
          err?.response?.data?.detail ||
          "Đặt lại mật khẩu thất bại."
      );
    }
  };

  // Mở modal gửi thông báo
  const openNotifyModal = (user: any) => {
    setNotifyingUser(user);
    notifyForm.resetFields();
    notifyForm.setFieldsValue({
      type: "IN_APP",
      title: "Thông báo từ Ban quản trị CAREZA",
      content: "",
    });
    setIsNotifyModalOpen(true);
  };

  const handleSendNotificationSubmit = async (values: any) => {
    try {
      await adminService.broadcastNotification({
        title: values.title,
        content: values.content || "",
        user_id: notifyingUser?.id ? Number(notifyingUser.id) : undefined,
      });
      message.success(
        `Đã gửi ${
          values.type === "EMAIL" ? "email" : "thông báo hệ thống"
        } tới "${notifyingUser?.name}" thành công!`
      );
      setIsNotifyModalOpen(false);
    } catch {
      message.error("Không thể gửi thông báo. Vui lòng thử lại.");
    }
  };

  // Thêm người dùng mới submit
  const handleAddUserSubmit = (values: any) => {
    const isRecruiter = values.role === "RECRUITER";
    const newUser = {
      id: `USR_${Math.floor(100000 + Math.random() * 900000)}`,
      name: values.name.trim(),
      email: values.email.trim(),
      role: values.role,
      phone: values.phone?.trim() || "—",
      createdAt: "Vừa xong",
      lastLoginAt: "Chưa đăng nhập",
      status: values.status || "ACTIVE",
      birthday: values.birthday || "—",
      gender: values.gender || "Chưa xác định",
      address: values.address?.trim() || "Việt Nam",
      emailVerified: true,
      phoneVerified: Boolean(values.phone),
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&h=600&q=85",
      companyName: isRecruiter ? (values.companyName?.trim() || "FPT Software") : null,
      companyId: isRecruiter ? "CMP_NEW" : undefined,
      position: isRecruiter ? (values.position?.trim() || "Chuyên viên tuyển dụng") : undefined,
      companyRole: isRecruiter ? "Nhân viên tuyển dụng" : undefined,
      branch: isRecruiter ? (values.branch?.trim() || "Trụ sở chính") : undefined,
      permissions: isRecruiter ? ["Đăng tin tuyển dụng", "Xem hồ sơ ứng viên"] : undefined,
      memberStatus: isRecruiter ? "Đang hoạt động" : undefined,
      companyJoinedAt: isRecruiter ? "Hôm nay" : undefined,
    };
    setUsers([newUser, ...users]);
    setSelectedUser(newUser);
    setIsAddModalOpen(false);
    addForm.resetFields();
    message.success(`Thêm người dùng mới "${newUser.name}" thành công!`);
  };

  // Lọc dữ liệu tổng hợp
  const filteredUsers = users.filter((u) => {
    // 1. Lọc theo Tab chính: Tất cả | Ứng viên | Nhà tuyển dụng | Quản trị viên
    if (activeTab === "CANDIDATE" && u.role !== "CANDIDATE") return false;
    if (activeTab === "RECRUITER" && u.role !== "RECRUITER" && u.role !== "COMPANY") return false;
    if (activeTab === "ADMIN" && u.role !== "ADMIN") return false;

    // 2. Lọc theo Quick Select
    if (roleFilter !== "ALL") {
      if (roleFilter === "RECRUITER") {
        if (u.role !== "RECRUITER" && u.role !== "COMPANY") return false;
      } else if (u.role !== roleFilter) {
        return false;
      }
    }
    if (statusFilter !== "ALL" && u.status !== statusFilter) return false;

    // 3. Lọc theo Search Query (Tên, Email, SĐT, ID, Tên Doanh nghiệp)
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchPhone = u.phone.toLowerCase().includes(q);
      const matchId = u.id.toLowerCase().includes(q);
      const matchCompany = Boolean(u.companyName && u.companyName.toLowerCase().includes(q));
      if (!matchName && !matchEmail && !matchPhone && !matchId && !matchCompany) return false;
    }

    // 4. Lọc theo Bộ lọc nâng cao
    if (appliedAdvFilters.role !== "ALL") {
      if (appliedAdvFilters.role === "RECRUITER") {
        if (u.role !== "RECRUITER" && u.role !== "COMPANY") return false;
      } else if (u.role !== appliedAdvFilters.role) {
        return false;
      }
    }
    if (appliedAdvFilters.status !== "ALL" && u.status !== appliedAdvFilters.status) return false;
    if (appliedAdvFilters.emailVerified !== "ALL") {
      const needVerified = appliedAdvFilters.emailVerified === "VERIFIED";
      if (u.emailVerified !== needVerified) return false;
    }
    if (appliedAdvFilters.phoneVerified !== "ALL") {
      const needVerified = appliedAdvFilters.phoneVerified === "VERIFIED";
      if (u.phoneVerified !== needVerified) return false;
    }

    return true;
  });

  const isAllSelected =
    filteredUsers.length > 0 && selectedRowKeys.length === filteredUsers.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRowKeys(filteredUsers.map((u) => u.id));
    } else {
      setSelectedRowKeys([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRowKeys([...selectedRowKeys, id]);
    } else {
      setSelectedRowKeys(selectedRowKeys.filter((k) => k !== id));
    }
  };

  // Xuất dữ liệu thật ra file CSV / Excel
  const handleExecuteExport = () => {
    let exportList = [...users];

    if (exportScope === "filtered") {
      exportList = [...filteredUsers];
    } else if (exportScope === "selected") {
      exportList = users.filter((u) => selectedRowKeys.includes(u.id));
      if (exportList.length === 0) {
        message.warning("Bạn chưa chọn dòng người dùng nào để xuất!");
        return;
      }
    }

    if (exportRole !== "ALL") {
      if (exportRole === "RECRUITER") {
        exportList = exportList.filter((u) => u.role === "RECRUITER" || u.role === "COMPANY");
      } else {
        exportList = exportList.filter((u) => u.role === exportRole);
      }
    }
    if (exportStatus !== "ALL") {
      exportList = exportList.filter((u) => u.status === exportStatus);
    }

    if (exportList.length === 0) {
      message.warning("Không có dữ liệu phù hợp với điều kiện xuất!");
      return;
    }

    // Tạo nội dung CSV có UTF-8 BOM để Excel không lỗi tiếng Việt
    const headers = [
      "Mã người dùng",
      "Họ và tên",
      "Email",
      "Loại tài khoản",
      "Doanh nghiệp",
      "Số điện thoại",
      "Trạng thái",
      "Ngày tạo",
      "Lần đăng nhập cuối",
      "Địa chỉ",
      "Xác minh Email",
      "Xác minh SĐT",
    ];

    const roleNameMap: Record<string, string> = {
      CANDIDATE: "Ứng viên",
      RECRUITER: "Nhà tuyển dụng",
      COMPANY: "Nhà tuyển dụng",
      ADMIN: "Quản trị viên",
    };

    const statusNameMap: Record<string, string> = {
      ACTIVE: "Hoạt động",
      PENDING: "Chờ xác minh",
      LOCKED: "Đã khóa",
      DISABLED: "Vô hiệu hóa",
    };

    const csvRows = exportList.map((u) => [
      `"${u.id}"`,
      `"${u.name.replace(/"/g, '""')}"`,
      `"${u.email}"`,
      `"${roleNameMap[u.role] || u.role}"`,
      `"${(u.role === "RECRUITER" || u.role === "COMPANY") && u.companyName ? u.companyName.replace(/"/g, '""') : "—"}"`,
      `"${u.phone}"`,
      `"${statusNameMap[u.status] || u.status}"`,
      `"${u.createdAt}"`,
      `"${u.lastLoginAt}"`,
      `"${u.address.replace(/"/g, '""')}"`,
      `"${u.emailVerified ? "Đã xác minh" : "Chưa xác minh"}"`,
      `"${u.phoneVerified ? "Đã xác minh" : "Chưa xác minh"}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...csvRows.map((r) => r.join(","))].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Careza_DanhSachNguoiDung_${dateStr}.${exportFormat === "xlsx" ? "csv" : "csv"}`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setIsExportModalOpen(false);
    message.success(`Đã xuất thành công ${exportList.length} bản ghi người dùng!`);
  };

  // Helper render badge vai trò / loại tài khoản
  const renderRoleBadge = (role: string) => {
    switch (role) {
      case "CANDIDATE":
        return (
          <span className="text-[11px] font-bold text-blue-600 bg-blue-50/90 border border-blue-200/70 px-2.5 py-0.5 rounded-full inline-flex items-center">
            Ứng viên
          </span>
        );
      case "RECRUITER":
      case "COMPANY":
        return (
          <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50/90 border border-indigo-200/80 px-2.5 py-0.5 rounded-full inline-flex items-center">
            Nhà tuyển dụng
          </span>
        );
      case "ADMIN":
        return (
          <span className="text-[11px] font-bold text-amber-600 bg-amber-50/90 border border-amber-200/70 px-2.5 py-0.5 rounded-full inline-flex items-center">
            Quản trị viên
          </span>
        );
      default:
        return null;
    }
  };

  // Helper render badge trạng thái
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Hoạt động</span>
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-600">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Chờ xác minh</span>
          </span>
        );
      case "LOCKED":
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-600">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Đã khóa</span>
          </span>
        );
      case "DISABLED":
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span>Bị vô hiệu hóa</span>
          </span>
        );
      default:
        return null;
    }
  };

  const activeAdvFilterCount = Object.entries(appliedAdvFilters).filter(
    ([k, v]) => v !== "ALL" && v !== ""
  ).length;

  return (
    <div className="space-y-4 select-none pb-8">
      {/* ========================================================= */}
      {/* 1. TIÊU ĐỀ TRANG & NÚT THÊM NGƯỜI DÙNG */}
      {/* ========================================================= */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0">
          Quản lý người dùng
        </h1>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0062ff] hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer border-none"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Thêm người dùng</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 2. 4 CARD TỔNG QUAN: TỔNG NGƯỜI DÙNG | ỨNG VIÊN | NHÀ TUYỂN DỤNG | QUẢN TRỊ VIÊN */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
        {/* Card 1: Tổng người dùng */}
        <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/80 shadow-2xs relative flex flex-col justify-between min-h-[96px] hover:border-blue-200 transition-all">
          <div className="absolute top-3 left-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0062ff] flex items-center justify-center">
              <Users className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="text-center w-full px-2 pt-0.5">
            <span className="text-[11px] font-bold text-slate-500 block leading-tight">
              Tổng người dùng
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 block my-0.5 tracking-tight leading-tight">
              {(userSummary.total_users || users.length).toLocaleString("vi-VN")}
            </span>
            <div className="flex items-center justify-center gap-1.5 text-[10.5px] leading-tight">
              <span className="font-bold text-emerald-600">
                {userSummary.active_count.toLocaleString("vi-VN")} hoạt động
              </span>
              <span className="font-normal text-slate-400 text-[10px]">
                ({userSummary.locked_count} đã khóa)
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Ứng viên */}
        <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/80 shadow-2xs relative flex flex-col justify-between min-h-[96px] hover:border-sky-200 transition-all">
          <div className="absolute top-3 left-3">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <User className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="text-center w-full px-2 pt-0.5">
            <span className="text-[11px] font-bold text-slate-500 block leading-tight">
              Ứng viên
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 block my-0.5 tracking-tight leading-tight">
              {userSummary.candidates_count.toLocaleString("vi-VN")}
            </span>
            <div className="flex items-center justify-center gap-1.5 text-[10.5px] leading-tight">
              <span className="font-normal text-slate-400 text-[10px]">
                Tài khoản tìm việc
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Nhà tuyển dụng */}
        <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/80 shadow-2xs relative flex flex-col justify-between min-h-[96px] hover:border-indigo-200 transition-all">
          <div className="absolute top-3 left-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Building2 className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="text-center w-full px-2 pt-0.5">
            <span className="text-[11px] font-bold text-slate-500 block leading-tight">
              Nhà tuyển dụng
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 block my-0.5 tracking-tight leading-tight">
              {userSummary.employers_count.toLocaleString("vi-VN")}
            </span>
            <div className="flex items-center justify-center gap-1.5 text-[10.5px] leading-tight">
              <span className="font-normal text-slate-400 text-[10px]">
                Tài khoản doanh nghiệp
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Quản trị viên */}
        <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/80 shadow-2xs relative flex flex-col justify-between min-h-[96px] hover:border-blue-200 transition-all">
          <div className="absolute top-3 left-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0062ff] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="text-center w-full px-2 pt-0.5">
            <span className="text-[11px] font-bold text-slate-500 block leading-tight">
              Quản trị viên
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 block my-0.5 tracking-tight leading-tight">
              {userSummary.admins_count.toLocaleString("vi-VN")}
            </span>
            <div className="flex items-center justify-center gap-1.5 text-[10.5px] leading-tight">
              <span className="font-normal text-slate-400 text-[10px]">
                Quản trị hệ thống
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. KHU VỰC BẢNG & PANEL CHI TIẾT */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* CỘT BẢNG */}
        <div
          className={`${isDetailPanelOpen ? "xl:col-span-8 2xl:col-span-8" : "xl:col-span-12 2xl:col-span-12"
            } bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col justify-between transition-all`}
        >
          {/* Header Bar: Tabs & Nút Xuất dữ liệu */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 pt-3.5 pb-2 border-b border-slate-100">
            {/* Tabs chọn loại tài khoản: Tất cả | Ứng viên | Nhà tuyển dụng | Quản trị viên */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveTab("ALL")}
                className={`pb-2 px-2 text-xs font-bold transition-all relative border-none bg-transparent cursor-pointer ${activeTab === "ALL"
                    ? "text-[#0062ff]"
                    : "text-slate-500 hover:text-slate-800"
                  }`}
              >
                <span>Tất cả ({userSummary.total_users.toLocaleString("vi-VN")})</span>
                {activeTab === "ALL" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0062ff] rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("CANDIDATE")}
                className={`pb-2 px-2 text-xs font-bold transition-all relative border-none bg-transparent cursor-pointer ${activeTab === "CANDIDATE"
                    ? "text-[#0062ff]"
                    : "text-slate-500 hover:text-slate-800"
                  }`}
              >
                <span>Ứng viên ({userSummary.candidates_count.toLocaleString("vi-VN")})</span>
                {activeTab === "CANDIDATE" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0062ff] rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("RECRUITER")}
                className={`pb-2 px-2 text-xs font-bold transition-all relative border-none bg-transparent cursor-pointer ${activeTab === "RECRUITER"
                    ? "text-[#0062ff]"
                    : "text-slate-500 hover:text-slate-800"
                  }`}
              >
                <span>Nhà tuyển dụng ({userSummary.employers_count.toLocaleString("vi-VN")})</span>
                {activeTab === "RECRUITER" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0062ff] rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("ADMIN")}
                className={`pb-2 px-2 text-xs font-bold transition-all relative border-none bg-transparent cursor-pointer ${activeTab === "ADMIN"
                    ? "text-[#0062ff]"
                    : "text-slate-500 hover:text-slate-800"
                  }`}
              >
                <span>Quản trị viên ({userSummary.admins_count.toLocaleString("vi-VN")})</span>
                {activeTab === "ADMIN" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0062ff] rounded-full" />
                )}
              </button>
            </div>

            {/* Nút Xuất dữ liệu */}
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/90 text-slate-700 hover:text-[#0062ff] hover:bg-slate-50 text-xs font-bold shadow-2xs transition-all cursor-pointer bg-white shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-[#0062ff]" />
              <span>Xuất dữ liệu</span>
            </button>
          </div>

          {/* Thanh lọc cơ bản: Cùng chiều cao 36px, luôn nằm gọn trên 1 dòng */}
          <div className="p-2.5 sm:p-3 bg-[#fafcff] border-b border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar flex-nowrap">
            {/* Search input */}
            <div className="relative flex-1 min-w-[150px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm theo tên, email, SĐT..."
                className="w-full h-9 bg-white border border-slate-200/90 rounded-xl pl-8.5 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-[#0062ff] focus:outline-hidden transition-all font-medium"
              />
            </div>

            {/* Select Loại tài khoản / Vai trò */}
            <div className="w-[125px] sm:w-[132px] shrink-0">
              <Select
                value={roleFilter}
                onChange={setRoleFilter}
                className="w-full h-9 text-xs"
                options={[
                  { value: "ALL", label: "Tất cả vai trò" },
                  { value: "CANDIDATE", label: "Ứng viên" },
                  { value: "RECRUITER", label: "Nhà tuyển dụng" },
                  { value: "ADMIN", label: "Quản trị viên" },
                ]}
              />
            </div>

            {/* Select Trạng thái */}
            <div className="w-[128px] sm:w-[135px] shrink-0">
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                className="w-full h-9 text-xs"
                options={[
                  { value: "ALL", label: "Tất cả trạng thái" },
                  { value: "ACTIVE", label: "Hoạt động" },
                  { value: "PENDING", label: "Chờ xác minh" },
                  { value: "LOCKED", label: "Đã khóa" },
                  { value: "DISABLED", label: "Bị vô hiệu hóa" },
                ]}
              />
            </div>

            {/* Select Ngày tạo */}
            <div className="w-[120px] sm:w-[126px] shrink-0">
              <Select
                value={dateFilter}
                onChange={setDateFilter}
                className="w-full h-9 text-xs"
                options={[
                  { value: "ALL", label: "Tất cả thời gian" },
                  { value: "TODAY", label: "Hôm nay" },
                  { value: "7DAYS", label: "7 ngày qua" },
                  { value: "30DAYS", label: "30 ngày qua" },
                ]}
              />
            </div>

            {/* Nút Bộ lọc nâng cao */}
            <button
              type="button"
              onClick={() => setIsAdvancedFilterOpen(true)}
              className={`inline-flex items-center gap-1.5 px-3 h-9 rounded-xl border text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${activeAdvFilterCount > 0
                  ? "bg-blue-50 border-[#0062ff] text-[#0062ff]"
                  : "bg-white border-slate-200/90 text-slate-700 hover:text-[#0062ff] hover:bg-slate-50"
                }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Bộ lọc nâng cao</span>
              {activeAdvFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#0062ff] text-white text-[10px] flex items-center justify-center font-bold">
                  {activeAdvFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Table Container: Người dùng | Loại tài khoản | Doanh nghiệp | Liên hệ | Ngày tạo | Trạng thái | Thao tác */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/90 bg-[#F5F7FA] text-[11px] font-black text-slate-900 tracking-wider">
                  <th className="py-3 px-3.5 w-10 text-center">
                    <Checkbox
                      checked={isAllSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th className="py-3 px-3 font-extrabold text-slate-900">NGƯỜI DÙNG</th>
                  <th className="py-3 px-3 font-extrabold text-slate-900">LOẠI TÀI KHOẢN</th>
                  <th className="py-3 px-3 font-extrabold text-slate-900">DOANH NGHIỆP</th>
                  <th className="py-3 px-3 font-extrabold text-slate-900">LIÊN HỆ</th>
                  <th className="py-3 px-3 font-extrabold text-slate-900">NGÀY TẠO</th>
                  <th className="py-3 px-3 font-extrabold text-slate-900">TRẠNG THÁI</th>
                  <th className="py-3 px-3.5 text-right font-extrabold text-slate-900">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      Không tìm thấy người dùng nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isSelected = selectedRowKeys.includes(u.id);
                    const isCurrentActive = selectedUser?.id === u.id;
                    const isRecruiter = u.role === "RECRUITER" || u.role === "COMPANY";

                    return (
                      <tr
                        key={u.id}
                        onClick={() => {
                          setSelectedUser(u);
                          setIsDetailPanelOpen(true);
                        }}
                        className={`cursor-pointer transition-colors ${isCurrentActive
                            ? "bg-blue-50/60"
                            : isSelected
                              ? "bg-slate-50"
                              : "hover:bg-blue-50/30"
                          }`}
                      >
                        {/* Checkbox: Ngăn không trigger mở panel */}
                        <td
                          className="py-3 px-3.5 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div onClick={(e) => e.stopPropagation()} className="inline-flex">
                            <Checkbox
                              checked={isSelected}
                              onChange={(e) => handleSelectRow(u.id, e.target.checked)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </td>

                        {/* 1. Người dùng: Avatar + Tên + Email */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            {/* Avatar có thể click mở preview lớn */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewAvatar({
                                  url: u.avatar || "",
                                  name: u.name,
                                });
                              }}
                              className="border-none bg-transparent p-0 cursor-pointer rounded-full relative group shrink-0"
                              title="Bấm để xem ảnh kích thước lớn"
                            >
                              <img
                                src={u.avatar}
                                alt={u.name}
                                className="w-8 h-8 rounded-full object-cover border border-slate-200/90 group-hover:ring-2 group-hover:ring-[#0062ff] transition-all"
                              />
                            </button>

                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 block truncate leading-tight">
                                {u.name}
                              </span>
                              <span className="text-[11px] text-slate-400 block truncate">
                                {u.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 2. Loại tài khoản */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {renderRoleBadge(u.role)}
                        </td>

                        {/* 3. Doanh nghiệp: Quy tắc hiển thị
                            - Ứng viên → —
                            - Nhà tuyển dụng → Tên công ty mà tài khoản thuộc
                            - Quản trị viên → —
                        */}
                        <td className="py-3 px-3">
                          {isRecruiter && u.companyName ? (
                            <div className="flex items-center gap-1.5 text-slate-800 font-semibold truncate max-w-[200px]">
                              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate" title={u.companyName}>
                                {u.companyName}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-medium">—</span>
                          )}
                        </td>

                        {/* 4. Liên hệ */}
                        <td className="py-3 px-3 font-medium text-slate-600 whitespace-nowrap">
                          {u.phone}
                        </td>

                        {/* Ngày tạo */}
                        <td className="py-3 px-3 whitespace-nowrap text-[11px] text-slate-500">
                          <span>{u.createdAt.split(" ")[0]}</span>
                          <span className="text-slate-400 block text-[10px]">
                            {u.createdAt.split(" ")[1]}
                          </span>
                        </td>

                        {/* Trạng thái */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {renderStatusBadge(u.status)}
                        </td>

                        {/* Thao tác More Dropdown: Ngăn không trigger mở panel */}
                        <td
                          className="py-3 px-3.5 text-right whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div onClick={(e) => e.stopPropagation()} className="inline-block">
                            <Dropdown
                              menu={{
                                items: [
                                  {
                                    key: "view-page",
                                    icon: <ExternalLink className="w-3.5 h-3.5 text-[#0062ff]" />,
                                    label: "Xem trang chi tiết",
                                    onClick: () => router.push(`/admin/users/${u.id}`),
                                  },
                                  {
                                    key: "notify",
                                    icon: <Mail className="w-3.5 h-3.5 text-slate-600" />,
                                    label: "Gửi thông báo",
                                    onClick: () => openNotifyModal(u),
                                  },
                                  {
                                    key: "report",
                                    icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />,
                                    label: "Xem báo cáo hoặc vi phạm",
                                    onClick: () => router.push(`/admin/users/${u.id}`),
                                  },
                                  {
                                    type: "divider",
                                  },
                                  {
                                    key: "block",
                                    icon:
                                      u.status === "LOCKED" ? (
                                        <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                                      ) : (
                                        <Lock className="w-3.5 h-3.5 text-rose-500" />
                                      ),
                                    danger: u.status !== "LOCKED",
                                    label:
                                      u.status === "LOCKED"
                                        ? "Mở khóa tài khoản"
                                        : "Khóa tài khoản",
                                    onClick: () => handleToggleBlock(u),
                                  },
                                ],
                              }}
                              trigger={["click"]}
                              placement="bottomRight"
                            >
                              <button
                                type="button"
                                onClick={(e) => e.stopPropagation()}
                                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 border-none bg-transparent cursor-pointer inline-flex items-center justify-center transition-colors"
                                title="Thao tác"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </Dropdown>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang chân bảng */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:p-4 border-t border-slate-100 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-2">
              <span>Hiển thị</span>
              <Select
                defaultValue={10}
                size="small"
                className="w-16"
                options={[
                  { value: 10, label: "10" },
                  { value: 20, label: "20" },
                  { value: 50, label: "50" },
                ]}
              />
              <span>trên {filteredUsers.length} kết quả</span>
            </div>

            <div className="flex items-center gap-1">
              <button className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 flex items-center justify-center cursor-pointer">
                ‹
              </button>
              <button className="w-7 h-7 rounded-lg border border-[#0062ff] bg-[#0062ff] text-white font-bold flex items-center justify-center">
                1
              </button>
              <button className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium flex items-center justify-center cursor-pointer">
                2
              </button>
              <button className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium flex items-center justify-center cursor-pointer">
                3
              </button>
              <span className="px-1 text-slate-400">...</span>
              <button className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 flex items-center justify-center cursor-pointer">
                ›
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CỘT PHẢI: PANEL THÔNG TIN CHI TIẾT NGƯỜI DÙNG */}
        {/* ========================================================= */}
        {isDetailPanelOpen && selectedUser && (
          <div className="xl:col-span-4 2xl:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 space-y-4 sticky top-20">
            {/* Header Panel */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-black text-slate-900 m-0">
                Thông tin người dùng
              </h2>
              <button
                type="button"
                onClick={() => setIsDetailPanelOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 border-none bg-transparent cursor-pointer flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Brief: Avatar + Tên + Vai trò + ID + Trạng thái */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {/* Click avatar để xem ảnh lớn */}
                <button
                  type="button"
                  onClick={() =>
                    setPreviewAvatar({
                      url: selectedUser.avatar || "",
                      name: selectedUser.name,
                    })
                  }
                  className="border-none bg-transparent p-0 cursor-pointer rounded-full relative group shrink-0"
                  title="Bấm để xem ảnh kích thước lớn"
                >
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.name}
                    className="w-13 h-13 rounded-full object-cover border-2 border-blue-100 group-hover:ring-2 group-hover:ring-[#0062ff] transition-all shadow-2xs"
                  />
                </button>

                <div className="min-w-0 space-y-0.5">
                  <h3 className="text-sm font-black text-slate-900 m-0 truncate">
                    {selectedUser.name}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    {renderRoleBadge(selectedUser.role)}
                  </div>
                  <span className="text-[10px] font-mono font-semibold text-slate-400 block">
                    ID: {selectedUser.id}
                  </span>
                </div>
              </div>

              {/* Trạng thái badge góc phải */}
              <div className="shrink-0">{renderStatusBadge(selectedUser.status)}</div>
            </div>

            {/* 4 Tabs con: Thông tin chung / Hoạt động / Tài liệu / Ghi chú */}
            <div className="flex items-center justify-between border-b border-slate-100 text-xs font-bold pt-1">
              <button
                type="button"
                onClick={() => setDetailTab("info")}
                className={`pb-2 border-none bg-transparent cursor-pointer transition-colors relative ${detailTab === "info"
                    ? "text-[#0062ff]"
                    : "text-slate-400 hover:text-slate-700"
                  }`}
              >
                <span>Thông tin chung</span>
                {detailTab === "info" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0062ff] rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setDetailTab("activity")}
                className={`pb-2 border-none bg-transparent cursor-pointer transition-colors relative ${detailTab === "activity"
                    ? "text-[#0062ff]"
                    : "text-slate-400 hover:text-slate-700"
                  }`}
              >
                <span>Hoạt động</span>
                {detailTab === "activity" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0062ff] rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setDetailTab("docs")}
                className={`pb-2 border-none bg-transparent cursor-pointer transition-colors relative ${detailTab === "docs"
                    ? "text-[#0062ff]"
                    : "text-slate-400 hover:text-slate-700"
                  }`}
              >
                <span>Tài liệu</span>
                {detailTab === "docs" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0062ff] rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setDetailTab("notes")}
                className={`pb-2 border-none bg-transparent cursor-pointer transition-colors relative ${detailTab === "notes"
                    ? "text-[#0062ff]"
                    : "text-slate-400 hover:text-slate-700"
                  }`}
              >
                <span>Ghi chú</span>
                {detailTab === "notes" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0062ff] rounded-full" />
                )}
              </button>
            </div>

            {/* TAB CONTENT: THÔNG TIN CHUNG */}
            {detailTab === "info" && (
              <div className="space-y-3.5 text-xs">
                {/* 1. Thông tin cá nhân */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-800 m-0 text-xs">
                      Thông tin cá nhân
                    </h4>
                    <button
                      type="button"
                      onClick={() => message.info(`Đang mở chỉnh sửa cho ${selectedUser.name}`)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0062ff] hover:underline bg-transparent border-none cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Chỉnh sửa</span>
                    </button>
                  </div>

                  <div className="space-y-1.5 text-[11.5px]">
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-400">Họ và tên</span>
                      <span className="font-semibold text-slate-800 text-right">
                        {selectedUser.name}
                      </span>
                    </div>

                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-400">Email</span>
                      <span className="font-semibold text-slate-800 text-right">
                        {selectedUser.email}
                      </span>
                    </div>

                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-400">Số điện thoại</span>
                      <span className="font-semibold text-slate-800 text-right">
                        {selectedUser.phone}
                      </span>
                    </div>

                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-400">Ngày sinh</span>
                      <span className="font-semibold text-slate-800 text-right">
                        {selectedUser.birthday}
                      </span>
                    </div>

                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-400">Giới tính</span>
                      <span className="font-semibold text-slate-800 text-right">
                        {selectedUser.gender}
                      </span>
                    </div>

                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-400">Địa chỉ</span>
                      <span className="font-semibold text-slate-800 text-right">
                        {selectedUser.address}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Thông tin doanh nghiệp & Vị trí (Dành riêng cho user loại Nhà tuyển dụng) */}
                {(selectedUser.role === "RECRUITER" || selectedUser.role === "COMPANY") && (
                  <div className="p-3 bg-blue-50/40 rounded-xl border border-blue-100/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[#0062ff] font-bold text-xs">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Doanh nghiệp & Vị trí công tác</span>
                      </div>
                      <Link
                        href="/admin/companies"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0062ff] hover:underline"
                      >
                        <span>Xem doanh nghiệp</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>

                    <div className="space-y-1.5 text-[11.5px]">
                      <div className="flex justify-between py-0.5">
                        <span className="text-slate-500">Doanh nghiệp đang thuộc</span>
                        <span className="font-bold text-slate-900 text-right">
                          {selectedUser.companyName || "FPT Software"}
                        </span>
                      </div>

                      <div className="flex justify-between py-0.5">
                        <span className="text-slate-500">Chức vụ</span>
                        <span className="font-semibold text-slate-800 text-right">
                          {selectedUser.position || "Trưởng nhóm Tuyển dụng IT"}
                        </span>
                      </div>

                      <div className="flex justify-between py-0.5">
                        <span className="text-slate-500">Vai trò trong doanh nghiệp</span>
                        <span className="font-semibold text-slate-800 text-right">
                          {selectedUser.companyRole || "Quản lý nhân sự (HR Manager)"}
                        </span>
                      </div>

                      <div className="flex justify-between py-0.5">
                        <span className="text-slate-500">Chi nhánh</span>
                        <span className="font-semibold text-slate-800 text-right">
                          {selectedUser.branch || "Chi nhánh TP. Hồ Chí Minh"}
                        </span>
                      </div>

                      <div className="py-0.5">
                        <span className="text-slate-500 block mb-1">Quyền hạn</span>
                        <div className="flex flex-wrap gap-1">
                          {(selectedUser.permissions || [
                            "Đăng tin tuyển dụng",
                            "Xem hồ sơ ứng viên",
                            "Mời phỏng vấn",
                          ]).map((perm: string) => (
                            <span
                              key={perm}
                              className="px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200 text-[10px] font-medium"
                            >
                              {perm}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-slate-500">Trạng thái thành viên</span>
                        <span className="font-bold text-emerald-600 text-[11px] inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{selectedUser.memberStatus || "Đang hoạt động"}</span>
                        </span>
                      </div>

                      <div className="flex justify-between py-0.5">
                        <span className="text-slate-500">Ngày tham gia doanh nghiệp</span>
                        <span className="font-semibold text-slate-800 text-right">
                          {selectedUser.companyJoinedAt || "15/03/2023"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Loại tài khoản & trạng thái */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h4 className="font-bold text-slate-800 m-0 text-xs">
                    Loại tài khoản & trạng thái
                  </h4>

                  <div className="space-y-1.5 text-[11.5px]">
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-400">Loại tài khoản</span>
                      <div>{renderRoleBadge(selectedUser.role)}</div>
                    </div>

                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-400">Trạng thái</span>
                      <div>{renderStatusBadge(selectedUser.status)}</div>
                    </div>

                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-400">Ngày tạo</span>
                      <span className="font-semibold text-slate-800 text-right">
                        {selectedUser.createdAt}
                      </span>
                    </div>

                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-400">Lần đăng nhập cuối</span>
                      <span className="font-semibold text-slate-800 text-right">
                        {selectedUser.lastLoginAt}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-400">Xác minh email</span>
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-600 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Đã xác minh</span>
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-400">Xác minh SĐT</span>
                      {selectedUser.phoneVerified ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-600 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Đã xác minh</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-amber-500 text-[11px]">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Chưa xác minh</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4. Thao tác nhanh (4 nút hoạt động thật) */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h4 className="font-bold text-slate-800 m-0 text-xs">
                    Thao tác nhanh
                  </h4>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Nút 1: Gửi thông báo */}
                    <button
                      type="button"
                      onClick={() => openNotifyModal(selectedUser)}
                      className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-slate-200/90 text-slate-700 hover:text-[#0062ff] hover:bg-slate-50 text-[11px] font-bold shadow-2xs transition-all cursor-pointer bg-white"
                    >
                      <Mail className="w-3.5 h-3.5 text-blue-500" />
                      <span>Gửi thông báo</span>
                    </button>

                    {/* Nút 2: Khóa / Mở khóa tài khoản */}
                    <button
                      type="button"
                      onClick={() => handleToggleBlock(selectedUser)}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-[11px] font-bold shadow-2xs transition-all cursor-pointer bg-white ${selectedUser.status === "LOCKED"
                          ? "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                          : "border-rose-200 text-rose-600 hover:bg-rose-50"
                        }`}
                    >
                      {selectedUser.status === "LOCKED" ? (
                        <>
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Mở khóa TK</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Khóa tài khoản</span>
                        </>
                      )}
                    </button>

                    {/* Nút 3: Đặt lại mật khẩu */}
                    <button
                      type="button"
                      onClick={() => openResetPasswordModal(selectedUser)}
                      className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-slate-200/90 text-slate-700 hover:text-amber-600 hover:bg-slate-50 text-[11px] font-bold shadow-2xs transition-all cursor-pointer bg-white"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                      <span>Đặt lại MK</span>
                    </button>

                    {/* Nút 4: Xem chi tiết profile */}
                    <Link
                      href={`/admin/users/${selectedUser.id}`}
                      className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-blue-200 text-[#0062ff] hover:bg-blue-50 text-[11px] font-bold shadow-2xs transition-all cursor-pointer bg-white"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Xem hồ sơ</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: HOẠT ĐỘNG */}
            {detailTab === "activity" && (
              <div className="space-y-3 py-2 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0 mt-0.5">
                    <Activity className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">
                      Đăng nhập từ trình duyệt
                    </span>
                    <span className="text-[10.5px] text-slate-400">
                      Chrome trên Windows · IP: 118.69.182.45
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {selectedUser.lastLoginAt}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">
                      Cập nhật hồ sơ tài khoản
                    </span>
                    <span className="text-[10.5px] text-slate-400">
                      Cập nhật thông tin liên hệ và chi nhánh
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {selectedUser.createdAt}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: TÀI LIỆU */}
            {detailTab === "docs" && (
              <div className="py-6 text-center text-slate-400 text-xs space-y-2">
                <FileText className="w-8 h-8 mx-auto text-slate-300" />
                <p className="font-medium m-0">
                  Người dùng có 2 tài liệu đính kèm (CV / Giấy tờ ủy quyền)
                </p>
                <button
                  type="button"
                  onClick={() => message.info("Đang tải danh sách tài liệu...")}
                  className="px-3 py-1 rounded-lg bg-blue-50 text-[#0062ff] font-bold text-[11px] border border-blue-200 cursor-pointer"
                >
                  Xem danh sách tài liệu
                </button>
              </div>
            )}

            {/* TAB CONTENT: GHI CHÚ */}
            {detailTab === "notes" && (
              <div className="space-y-2.5 py-1 text-xs">
                <textarea
                  placeholder="Thêm ghi chú nội bộ của admin về người dùng này..."
                  rows={3}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-[#0062ff]"
                />
                <button
                  type="button"
                  onClick={() => message.success("Đã lưu ghi chú quản trị thành công!")}
                  className="px-3.5 py-1.5 rounded-xl bg-[#0062ff] text-white font-bold text-xs border-none cursor-pointer hover:bg-blue-700 shadow-xs"
                >
                  Lưu ghi chú
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: THIẾT KẾ LẠI FORM THÊM NGƯỜI DÙNG */}
      {/* ========================================================= */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0062ff] flex items-center justify-center">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-black text-slate-900 text-base block leading-tight">
                Thêm người dùng mới
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                Điền thông tin để tạo tài khoản mới trên hệ thống CAREZA
              </span>
            </div>
          </div>
        }
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        footer={null}
        destroyOnHidden
        width={580}
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={handleAddUserSubmit}
          initialValues={{
            role: "CANDIDATE",
            status: "ACTIVE",
            gender: "Nam",
          }}
          className="pt-3 space-y-4"
        >
          {/* Nhóm 1: Thông tin cơ bản */}
          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 space-y-2.5">
            <span className="text-[11px] font-bold text-[#0062ff] uppercase tracking-wider block">
              1. Thông tin cơ bản
            </span>

            <Form.Item
              label={<span className="text-xs font-bold text-slate-700">Họ và tên</span>}
              name="name"
              rules={[
                { required: true, message: "Vui lòng nhập họ và tên người dùng" },
                { min: 3, message: "Tên phải có ít nhất 3 ký tự" },
              ]}
              className="mb-2"
            >
              <Input
                placeholder="Ví dụ: Nguyễn Văn An"
                className="rounded-xl text-xs h-9"
              />
            </Form.Item>

            <div className="grid grid-cols-2 gap-3">
              <Form.Item
                label={<span className="text-xs font-bold text-slate-700">Giới tính</span>}
                name="gender"
                className="mb-0"
              >
                <Select
                  className="text-xs h-9"
                  options={[
                    { value: "Nam", label: "Nam" },
                    { value: "Nữ", label: "Nữ" },
                    { value: "Khác", label: "Khác" },
                  ]}
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-xs font-bold text-slate-700">Ngày sinh</span>}
                name="birthday"
                className="mb-0"
              >
                <Input placeholder="DD/MM/YYYY" className="rounded-xl text-xs h-9" />
              </Form.Item>
            </div>
          </div>

          {/* Nhóm 2: Thông tin liên hệ */}
          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 space-y-2.5">
            <span className="text-[11px] font-bold text-[#0062ff] uppercase tracking-wider block">
              2. Thông tin liên hệ
            </span>

            <div className="grid grid-cols-2 gap-3">
              <Form.Item
                label={<span className="text-xs font-bold text-slate-700">Email đăng nhập</span>}
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập địa chỉ email" },
                  { type: "email", message: "Email không đúng định dạng" },
                ]}
                className="mb-0"
              >
                <Input placeholder="example@gmail.com" className="rounded-xl text-xs h-9" />
              </Form.Item>

              <Form.Item
                label={<span className="text-xs font-bold text-slate-700">Số điện thoại</span>}
                name="phone"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                  {
                    pattern: /^[0-9+() -]{9,15}$/,
                    message: "Số điện thoại không hợp lệ",
                  },
                ]}
                className="mb-0"
              >
                <Input placeholder="0901 234 567" className="rounded-xl text-xs h-9" />
              </Form.Item>
            </div>

            <Form.Item
              label={<span className="text-xs font-bold text-slate-700">Địa chỉ / Khu vực</span>}
              name="address"
              className="mb-0"
            >
              <Input
                placeholder="Ví dụ: Quận 1, TP. Hồ Chí Minh"
                className="rounded-xl text-xs h-9"
              />
            </Form.Item>
          </div>

          {/* Nhóm 3: Phân quyền & Loại tài khoản */}
          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 space-y-2.5">
            <span className="text-[11px] font-bold text-[#0062ff] uppercase tracking-wider block">
              3. Loại tài khoản & Doanh nghiệp
            </span>

            <div className="grid grid-cols-2 gap-3">
              <Form.Item
                label={<span className="text-xs font-bold text-slate-700">Loại tài khoản</span>}
                name="role"
                rules={[{ required: true, message: "Vui lòng chọn loại tài khoản" }]}
                className="mb-0"
              >
                <Select
                  className="text-xs h-9"
                  options={[
                    { value: "CANDIDATE", label: "Ứng viên (Tìm việc)" },
                    { value: "RECRUITER", label: "Nhà tuyển dụng (Thuộc DN)" },
                    { value: "ADMIN", label: "Quản trị viên (Hệ thống)" },
                  ]}
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-xs font-bold text-slate-700">Trạng thái tài khoản</span>}
                name="status"
                className="mb-0"
              >
                <Select
                  className="text-xs h-9"
                  options={[
                    { value: "ACTIVE", label: "Hoạt động ngay" },
                    { value: "PENDING", label: "Chờ xác minh" },
                    { value: "LOCKED", label: "Tạm khóa" },
                  ]}
                />
              </Form.Item>
            </div>

            {/* Thông tin doanh nghiệp bổ sung nếu chọn Nhà tuyển dụng */}
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => prevValues.role !== currentValues.role}
            >
              {({ getFieldValue }) =>
                getFieldValue("role") === "RECRUITER" ? (
                  <div className="pt-2 border-t border-slate-200/80 space-y-2.5">
                    <Form.Item
                      label={<span className="text-xs font-bold text-slate-700">Doanh nghiệp đang thuộc</span>}
                      name="companyName"
                      rules={[{ required: true, message: "Vui lòng nhập tên công ty" }]}
                      className="mb-2"
                    >
                      <Input
                        placeholder="Ví dụ: FPT Software, VNG Corporation..."
                        className="rounded-xl text-xs h-9"
                      />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-3">
                      <Form.Item
                        label={<span className="text-xs font-bold text-slate-700">Chức vụ</span>}
                        name="position"
                        className="mb-0"
                      >
                        <Input
                          placeholder="Ví dụ: HR Manager, Tuyển dụng IT"
                          className="rounded-xl text-xs h-9"
                        />
                      </Form.Item>

                      <Form.Item
                        label={<span className="text-xs font-bold text-slate-700">Chi nhánh</span>}
                        name="branch"
                        className="mb-0"
                      >
                        <Input
                          placeholder="Ví dụ: Chi nhánh TP.HCM"
                          className="rounded-xl text-xs h-9"
                        />
                      </Form.Item>
                    </div>
                  </div>
                ) : null
              }
            </Form.Item>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer bg-white"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0062ff] hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer border-none shadow-md shadow-blue-500/20"
            >
              Thêm người dùng
            </button>
          </div>
        </Form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 2: XUẤT DỮ LIỆU NGƯỜI DÙNG HOẠT ĐỘNG THẬT */}
      {/* ========================================================= */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Download className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-black text-slate-900 text-base block leading-tight">
                Xuất dữ liệu người dùng
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                Tải về danh sách người dùng theo các điều kiện lọc và phạm vi lựa chọn
              </span>
            </div>
          </div>
        }
        open={isExportModalOpen}
        onCancel={() => setIsExportModalOpen(false)}
        footer={null}
        destroyOnHidden
        width={500}
      >
        <div className="py-3 space-y-3.5 text-xs">
          {/* Phạm vi xuất */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">
              Phạm vi dữ liệu xuất:
            </label>
            <Radio.Group
              value={exportScope}
              onChange={(e) => setExportScope(e.target.value)}
              className="flex flex-col gap-2"
            >
              <Radio value="filtered" className="text-xs">
                <span>Dữ liệu đang lọc trên màn hình ({filteredUsers.length} người dùng)</span>
              </Radio>
              <Radio value="all" className="text-xs">
                <span>Toàn bộ người dùng trên hệ thống ({users.length} người dùng)</span>
              </Radio>
              <Radio
                value="selected"
                disabled={selectedRowKeys.length === 0}
                className="text-xs"
              >
                <span>
                  Chỉ các dòng đang chọn ({selectedRowKeys.length} người dùng)
                </span>
              </Radio>
            </Radio.Group>
          </div>

          {/* Điều kiện bổ sung */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Loại tài khoản:</label>
              <Select
                value={exportRole}
                onChange={setExportRole}
                className="w-full text-xs h-9"
                options={[
                  { value: "ALL", label: "Tất cả loại tài khoản" },
                  { value: "CANDIDATE", label: "Ứng viên" },
                  { value: "RECRUITER", label: "Nhà tuyển dụng" },
                  { value: "ADMIN", label: "Quản trị viên" },
                ]}
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Trạng thái:</label>
              <Select
                value={exportStatus}
                onChange={setExportStatus}
                className="w-full text-xs h-9"
                options={[
                  { value: "ALL", label: "Tất cả trạng thái" },
                  { value: "ACTIVE", label: "Hoạt động" },
                  { value: "PENDING", label: "Chờ xác minh" },
                  { value: "LOCKED", label: "Đã khóa" },
                ]}
              />
            </div>
          </div>

          {/* Định dạng file */}
          <div className="pt-2 border-t border-slate-100">
            <label className="font-bold text-slate-700 block mb-1.5">Định dạng file xuất:</label>
            <Radio.Group
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="flex gap-4"
            >
              <Radio value="xlsx" className="text-xs font-semibold">
                Excel (.xlsx / .csv UTF-8)
              </Radio>
              <Radio value="csv" className="text-xs font-semibold">
                CSV chuẩn (.csv)
              </Radio>
            </Radio.Group>
          </div>

          {/* Footer nút */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsExportModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer bg-white"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleExecuteExport}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer border-none shadow-md shadow-emerald-600/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất dữ liệu</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* ========================================================= */}
      {/* DRAWER 3: BỘ LỌC NÂNG CAO HOẠT ĐỘNG THẬT */}
      {/* ========================================================= */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#0062ff]" />
            <span className="font-black text-slate-900 text-sm">Bộ lọc nâng cao</span>
          </div>
        }
        open={isAdvancedFilterOpen}
        onClose={() => setIsAdvancedFilterOpen(false)}
        destroyOnHidden
        width={360}
        footer={
          <div className="flex items-center justify-between gap-2 py-1">
            <button
              type="button"
              onClick={() => {
                const reset = {
                  role: "ALL",
                  status: "ALL",
                  emailVerified: "ALL",
                  phoneVerified: "ALL",
                  createdAtFrom: "",
                  createdAtTo: "",
                  lastLoginFrom: "",
                  lastLoginTo: "",
                };
                setAdvFilters(reset);
                setAppliedAdvFilters(reset);
                message.info("Đã đặt lại tất cả bộ lọc nâng cao");
              }}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer bg-white"
            >
              Đặt lại
            </button>
            <button
              type="button"
              onClick={() => {
                setAppliedAdvFilters({ ...advFilters });
                setIsAdvancedFilterOpen(false);
                message.success("Đã áp dụng bộ lọc nâng cao!");
              }}
              className="px-5 py-1.5 rounded-xl bg-[#0062ff] hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer border-none shadow-md shadow-blue-500/20"
            >
              Áp dụng lọc
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          {/* Loại tài khoản */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Loại tài khoản:</label>
            <Select
              value={advFilters.role}
              onChange={(val) => setAdvFilters({ ...advFilters, role: val })}
              className="w-full text-xs h-9"
              options={[
                { value: "ALL", label: "Tất cả loại tài khoản" },
                { value: "CANDIDATE", label: "Ứng viên" },
                { value: "RECRUITER", label: "Nhà tuyển dụng" },
                { value: "ADMIN", label: "Quản trị viên" },
              ]}
            />
          </div>

          {/* Trạng thái */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Trạng thái tài khoản:</label>
            <Select
              value={advFilters.status}
              onChange={(val) => setAdvFilters({ ...advFilters, status: val })}
              className="w-full text-xs h-9"
              options={[
                { value: "ALL", label: "Tất cả trạng thái" },
                { value: "ACTIVE", label: "Hoạt động" },
                { value: "PENDING", label: "Chờ xác minh" },
                { value: "LOCKED", label: "Đã khóa" },
                { value: "DISABLED", label: "Bị vô hiệu hóa" },
              ]}
            />
          </div>

          {/* Trạng thái xác minh Email */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Xác minh Email:</label>
            <Select
              value={advFilters.emailVerified}
              onChange={(val) => setAdvFilters({ ...advFilters, emailVerified: val })}
              className="w-full text-xs h-9"
              options={[
                { value: "ALL", label: "Tất cả" },
                { value: "VERIFIED", label: "Đã xác minh" },
                { value: "UNVERIFIED", label: "Chưa xác minh" },
              ]}
            />
          </div>

          {/* Trạng thái xác minh SĐT */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Xác minh Số điện thoại:</label>
            <Select
              value={advFilters.phoneVerified}
              onChange={(val) => setAdvFilters({ ...advFilters, phoneVerified: val })}
              className="w-full text-xs h-9"
              options={[
                { value: "ALL", label: "Tất cả" },
                { value: "VERIFIED", label: "Đã xác minh" },
                { value: "UNVERIFIED", label: "Chưa xác minh" },
              ]}
            />
          </div>

          {/* Khoảng ngày tạo tài khoản */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Khoảng ngày tạo:</label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={advFilters.createdAtFrom}
                onChange={(e) => setAdvFilters({ ...advFilters, createdAtFrom: e.target.value })}
                className="text-xs h-9 rounded-xl"
              />
              <Input
                type="date"
                value={advFilters.createdAtTo}
                onChange={(e) => setAdvFilters({ ...advFilters, createdAtTo: e.target.value })}
                className="text-xs h-9 rounded-xl"
              />
            </div>
          </div>

          {/* Khoảng lần đăng nhập cuối */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Lần đăng nhập cuối:</label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={advFilters.lastLoginFrom}
                onChange={(e) => setAdvFilters({ ...advFilters, lastLoginFrom: e.target.value })}
                className="text-xs h-9 rounded-xl"
              />
              <Input
                type="date"
                value={advFilters.lastLoginTo}
                onChange={(e) => setAdvFilters({ ...advFilters, lastLoginTo: e.target.value })}
                className="text-xs h-9 rounded-xl"
              />
            </div>
          </div>
        </div>
      </Drawer>

      {/* ========================================================= */}
      {/* MODAL 4: GỬI THÔNG BÁO TỚI NGƯỜI DÙNG */}
      {/* ========================================================= */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <Mail className="w-4 h-4 text-[#0062ff]" />
            <span className="font-black text-slate-900 text-sm">
              Gửi thông báo tới {notifyingUser?.name}
            </span>
          </div>
        }
        open={isNotifyModalOpen}
        onCancel={() => setIsNotifyModalOpen(false)}
        footer={null}
        destroyOnHidden
        width={480}
      >
        <Form
          form={notifyForm}
          layout="vertical"
          onFinish={handleSendNotificationSubmit}
          className="pt-2 text-xs"
        >
          <Form.Item label={<span className="font-bold text-slate-700">Hình thức gửi</span>} name="type">
            <Radio.Group className="flex gap-4">
              <Radio value="IN_APP" className="text-xs">
                Thông báo trong hệ thống
              </Radio>
              <Radio value="EMAIL" className="text-xs">
                Gửi qua Email ({notifyingUser?.email})
              </Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label={<span className="font-bold text-slate-700">Tiêu đề thông báo</span>}
            name="title"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
          >
            <Input className="rounded-xl text-xs h-9" />
          </Form.Item>

          <Form.Item
            label={<span className="font-bold text-slate-700">Nội dung chi tiết</span>}
            name="content"
            rules={[{ required: true, message: "Vui lòng nhập nội dung thông báo" }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Nhập nội dung cần truyền đạt tới người dùng..."
              className="rounded-xl text-xs"
            />
          </Form.Item>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsNotifyModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer bg-white"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0062ff] hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer border-none shadow-md shadow-blue-500/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gửi thông báo</span>
            </button>
          </div>
        </Form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 5: ĐẶT LẠI MẬT KHẨU */}
      {/* ========================================================= */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <KeyRound className="w-4 h-4 text-amber-500" />
            <span className="font-black text-slate-900 text-sm">
              Đặt lại mật khẩu cho {resetPwdUser?.name}
            </span>
          </div>
        }
        open={isResetPwdModalOpen}
        onCancel={() => {
          resetPwdForm.resetFields();
          setIsResetPwdModalOpen(false);
        }}
        footer={null}
        destroyOnHidden
        width={460}
      >
        <Form
          form={resetPwdForm}
          layout="vertical"
          onFinish={handleConfirmResetPassword}
          className="py-2 text-xs"
        >
          <p className="text-slate-600 mb-3">
            Bạn đang đặt lại mật khẩu cho tài khoản:{" "}
            <strong className="text-slate-900">{resetPwdUser?.email}</strong>. Toàn bộ phiên đăng nhập cũ sẽ bị thu hồi và người dùng sẽ nhận được thông báo bảo mật.
          </p>

          <Form.Item
            label={<span className="font-bold text-slate-700 text-xs">Mật khẩu mới (tối thiểu 6 ký tự)</span>}
            name="newPassword"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới" },
              { min: 6, message: "Mật khẩu mới phải có ít nhất 6 ký tự" },
            ]}
          >
            <Input.Password
              placeholder="Nhập mật khẩu mới..."
              autoComplete="new-password"
              className="rounded-xl text-xs h-9"
            />
          </Form.Item>

          <Form.Item
            label={<span className="font-bold text-slate-700 text-xs">Xác nhận mật khẩu mới</span>}
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Mật khẩu xác nhận không khớp"));
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="Nhập lại mật khẩu mới..."
              autoComplete="new-password"
              className="rounded-xl text-xs h-9"
            />
          </Form.Item>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                resetPwdForm.resetFields();
                setIsResetPwdModalOpen(false);
              }}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer bg-white"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all cursor-pointer border-none shadow-md shadow-amber-500/20"
            >
              Xác nhận đặt lại mật khẩu
            </button>
          </div>
        </Form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 6: PREVIEW AVATAR KÍCH THƯỚC LỚN */}
      {/* ========================================================= */}
      <Modal
        open={Boolean(previewAvatar)}
        onCancel={() => setPreviewAvatar(null)}
        footer={null}
        destroyOnHidden
        centered
        width={420}
        styles={{ body: { padding: 0 } }}
      >
        {previewAvatar && (
          <div className="relative bg-slate-900 rounded-2xl overflow-hidden flex flex-col items-center">
            {/* Header overlay */}
            <div className="w-full flex items-center justify-between p-3.5 bg-gradient-to-b from-black/70 to-transparent absolute top-0 left-0 right-0 z-10">
              <span className="text-white font-bold text-xs truncate max-w-[300px]">
                {previewAvatar.name}
              </span>
              <button
                type="button"
                onClick={() => setPreviewAvatar(null)}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 text-white border-none cursor-pointer flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Large Image */}
            <div className="w-full aspect-square bg-slate-950 flex items-center justify-center overflow-hidden">
              <img
                src={previewAvatar.url}
                alt={previewAvatar.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Footer */}
            <div className="w-full p-2.5 text-center text-[11px] text-slate-300 bg-slate-900/90">
              Ảnh đại diện người dùng hệ thống CAREZA
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <App>
      <AdminUsersContent />
    </App>
  );
}
