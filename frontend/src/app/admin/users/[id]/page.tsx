"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { adminService } from "@/services/admin.service";
import {
  Dropdown,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  App,
  Radio,
  Tooltip,
} from "antd";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Activity,
  Mail,
  KeyRound,
  Lock,
  Unlock,
  MoreHorizontal,
  Camera,
  CheckCircle2,
  Calendar,
  MapPin,
  Edit2,
  FileText,
  Bookmark,
  Eye,
  MessageSquare,
  Star,
  Sparkles,
  Download,
  AlertCircle,
  Clock,
  Shield,
  Briefcase,
  History,
  AlertTriangle,
  FileClock,
  StickyNote,
  Send,
  Plus,
  X,
  ExternalLink,
  GraduationCap,
  Building2,
  Smartphone,
  Laptop,
  Check,
  Award,
  Layers,
  Info,
} from "lucide-react";

// Dữ liệu mẫu người dùng chi tiết
const USERS_DB: Record<string, any> = {
  USR_000123: {
    id: "USR_000123",
    name: "Nguyễn Thị Phương Mai",
    role: "CANDIDATE",
    status: "ACTIVE",
    joinedAt: "12/05/2024",
    email: "phuongmai@gmail.com",
    emailVerified: true,
    phone: "0901 234 567",
    phoneVerified: true,
    idCardVerified: false,
    birthday: "15/03/2004",
    age: 22,
    gender: "Nữ",
    address: "Quận 1, TP. Hồ Chí Minh",
    registeredFrom: "Website",
    lastLoginAt: "14/09/2026 21:15",
    lastLoginIp: "118.70.12.34",
    device: "Windows · Chrome",
    activeSessions: 2,
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&h=800&q=90",
    quote:
      "Luôn nỗ lực phát triển bản thân để mang lại giá trị thực tế cho dự án và cộng đồng.",
    stats: {
      appliedJobs: 12,
      savedJobs: 28,
      profileViews: 156,
      interviewInvites: 5,
      rating: 4.8,
      ratingCount: 12,
    },
    skills: [
      "React",
      "JavaScript",
      "TypeScript",
      "UI/UX",
      "Figma",
      "Next.js",
      "HTML/CSS",
      "Git",
      "TailwindCSS",
    ],
    experience: [
      {
        id: "exp-1",
        position: "Frontend Developer",
        company: "Công ty TNHH TechViet",
        period: "01/2025 – Hiện tại (8 tháng)",
        isCurrent: true,
        description:
          "Phát triển giao diện ứng dụng web Next.js/React, tối ưu hiệu năng và trải nghiệm người dùng.",
      },
      {
        id: "exp-2",
        position: "UI/UX Designer",
        company: "Tech Solutions",
        period: "06/2023 – 12/2024 (1 năm 6 tháng)",
        isCurrent: false,
        description:
          "Thiết kế Design System, prototype wireframe trên Figma cho các sản phẩm thương mại điện tử.",
      },
    ],
    education: [
      {
        id: "edu-1",
        school: "Đại học Công nghệ Thông tin",
        university: "Đại học Quốc gia TP.HCM",
        period: "2022 – 2026",
        major: "Công nghệ phần mềm",
        degree: "Cử nhân CNTT",
      },
    ],
    documents: [
      {
        id: "doc-1",
        name: "CV_NguyenThiPhuongMai.pdf",
        updatedAt: "10/09/2026",
        size: "2.4 MB",
      },
      {
        id: "doc-2",
        name: "Portfolio_Mai.pdf",
        updatedAt: "10/09/2026",
        size: "5.1 MB",
      },
      {
        id: "doc-3",
        name: "Chung_chi_IELTS.pdf",
        updatedAt: "01/09/2026",
        size: "1.2 MB",
      },
    ],
    recentActivities: [
      {
        id: "act-1",
        time: "14/09/2026 21:15",
        action: "Đăng nhập",
        content: "Đăng nhập vào hệ thống",
        ip: "118.70.12.34",
      },
      {
        id: "act-2",
        time: "12/09/2026 10:32",
        action: "Ứng tuyển",
        content: "Ứng tuyển vị trí Frontend Developer tại Công ty ABC",
        ip: "118.70.12.34",
      },
      {
        id: "act-3",
        time: "10/09/2026 15:20",
        action: "Cập nhật hồ sơ",
        content: "Cập nhật thông tin cá nhân và kỹ năng",
        ip: "118.70.12.34",
      },
      {
        id: "act-4",
        time: "08/09/2026 09:18",
        action: "Lưu việc làm",
        content: 'Lưu việc làm "UI/UX Designer"',
        ip: "118.70.12.34",
      },
      {
        id: "act-5",
        time: "05/09/2026 14:05",
        action: "Xem tin tuyển dụng",
        content: 'Xem chi tiết tin tuyển dụng "React Developer"',
        ip: "118.70.12.34",
      },
    ],
    complaints: [
      {
        id: "cmp-1",
        date: "01/08/2026",
        type: "Spam",
        content: "Gửi hồ sơ không phù hợp",
        status: "RESOLVED",
      },
      {
        id: "cmp-2",
        date: "12/06/2026",
        type: "Báo cáo",
        content: "Thông tin CV chưa khớp yêu cầu",
        status: "PENDING",
      },
    ],
    auditLogs: [
      {
        id: "log-1",
        time: "12/08/2026 14:20",
        admin: "Admin Nguyễn Văn Hùng",
        action: "Mở khóa tài khoản",
        detail: "Mở khóa sau khi xác minh danh tính",
      },
      {
        id: "log-2",
        time: "20/07/2026 09:15",
        admin: "Admin Trần Thị Lan",
        action: "Cập nhật thông tin",
        detail: "Hỗ trợ chỉnh sửa số điện thoại",
      },
      {
        id: "log-3",
        time: "10/05/2026 16:30",
        admin: "Admin Lê Minh Đức",
        action: "Xác minh email",
        detail: "Kích hoạt xác minh email người dùng",
      },
    ],
    notes: [
      {
        id: "note-1",
        admin: "Nguyễn Văn Hùng",
        time: "12/08/2026 14:25",
        content:
          "Ứng viên tiềm năng mảng Frontend, hồ sơ rõ ràng, đã hoàn tất xác thực thông tin liên hệ.",
      },
    ],
  },
  USR_000124: {
    id: "USR_000124",
    name: "Hoàng Minh Tuấn",
    role: "RECRUITER",
    status: "ACTIVE",
    joinedAt: "10/04/2024",
    email: "tuan.hm@fpt.com",
    emailVerified: true,
    phone: "0988 776 655",
    phoneVerified: true,
    idCardVerified: true,
    birthday: "14/08/1990",
    age: 36,
    gender: "Nam",
    address: "Cầu Giấy, Hà Nội",
    registeredFrom: "Website",
    lastLoginAt: "15/09/2026 09:30",
    lastLoginIp: "113.161.72.10",
    device: "macOS · Safari",
    activeSessions: 3,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&h=800&q=90",
    quote: "Đồng hành cùng nhân tài công nghệ kiến tạo giá trị đột phá tại FPT Software.",
    // Nghiệp vụ Nhà tuyển dụng
    companyName: "FPT Software",
    companyId: "CPN_000001",
    jobTitle: "Trưởng phòng Tuyển dụng IT",
    companyRole: "Quản trị viên tuyển dụng (HR Manager)",
    branch: "Chi nhánh Hà Nội (F-Ville Hòa Lạc)",
    permissions: [
      "Đăng tin tuyển dụng",
      "Xem & Tải CV ứng viên",
      "Mời phỏng vấn & Gửi thư mời nhận việc",
      "Quản lý thành viên nhóm tuyển dụng",
      "Xem báo cáo hiệu quả tuyển dụng",
    ],
    memberStatus: "Đang hoạt động",
    joinedCompanyAt: "15/03/2023",
    stats: {
      appliedJobs: 24, // Tin đang tuyển
      savedJobs: 6, // Tin đã đóng
      profileViews: 12400, // Lượt xem tin
      interviewInvites: 86, // Lượt ứng tuyển nhận
      rating: 4.9,
      ratingCount: 38,
    },
    skills: ["Tuyển dụng IT", "HR Management", "Phỏng vấn nhân sự", "Sourcing Talent", "Employer Branding"],
    experience: [
      {
        id: "exp-c1",
        position: "Trưởng phòng Tuyển dụng IT",
        company: "FPT Software",
        period: "03/2023 – Hiện tại",
        isCurrent: true,
        description: "Phụ trách chiến lược tuyển dụng đội ngũ kỹ sư phần mềm, quản lý thành viên nhóm và phân phối ngân sách.",
      },
      {
        id: "exp-c2",
        position: "Senior IT Recruiter",
        company: "VNG Corporation",
        period: "2019 – 2023",
        isCurrent: false,
        description: "Tuyển dụng nhân sự công nghệ chất lượng cao cho các sản phẩm Zalo và Zing.",
      },
    ],
    education: [
      {
        id: "edu-c1",
        school: "Đại học Ngoại thương Hà Nội",
        university: "FTU",
        period: "2008 – 2012",
        major: "Quản trị Kinh doanh Quốc tế",
        degree: "Cử nhân",
      },
    ],
    documents: [
      {
        id: "doc-c1",
        name: "Giay_gioi_thieu_cong_tac_FPT.pdf",
        updatedAt: "10/04/2024",
        size: "1.5 MB",
      },
      {
        id: "doc-c2",
        name: "Quy_dinh_tuyen_dung_noi_bo.pdf",
        updatedAt: "15/05/2026",
        size: "3.2 MB",
      },
    ],
    recentActivities: [
      {
        id: "act-c1",
        time: "15/09/2026 09:30",
        action: "Đăng nhập",
        content: "Đăng nhập cổng nhà tuyển dụng FPT Software",
        ip: "113.161.72.10",
      },
      {
        id: "act-c2",
        time: "14/09/2026 16:40",
        action: "Đăng tin",
        content: 'Đăng tin tuyển dụng mới "Senior React Engineer"',
        ip: "113.161.72.10",
      },
      {
        id: "act-c3",
        time: "14/09/2026 11:20",
        action: "Xem CV",
        content: "Duyệt hồ sơ ứng viên Trần Văn An",
        ip: "113.161.72.10",
      },
    ],
    complaints: [],
    auditLogs: [
      {
        id: "log-c1",
        time: "10/04/2024 14:00",
        admin: "Admin Nguyễn Văn Hùng",
        action: "Phê duyệt tài khoản",
        detail: "Xác thực tài khoản Nhà tuyển dụng thuộc FPT Software",
      },
    ],
    notes: [
      {
        id: "note-c1",
        admin: "Nguyễn Văn Hùng",
        time: "10/04/2024 14:05",
        content: "Nhà tuyển dụng chính thức từ FPT Software, tài khoản hoạt động tích cực.",
      },
    ],
  },
  USR_000125: {
    id: "USR_000125",
    name: "Trần Văn An",
    role: "CANDIDATE",
    status: "ACTIVE",
    joinedAt: "14/09/2026",
    email: "an.tran@gmail.com",
    emailVerified: true,
    phone: "0933 456 789",
    phoneVerified: true,
    idCardVerified: false,
    birthday: "20/08/1998",
    age: 28,
    gender: "Nam",
    address: "Bình Thạnh, TP. Hồ Chí Minh",
    registeredFrom: "Website",
    lastLoginAt: "14/09/2026 16:45",
    lastLoginIp: "14.161.12.89",
    device: "Windows · Edge",
    activeSessions: 1,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&h=800&q=90",
    quote: "Đam mê kiến tạo sản phẩm công nghệ có ích và tối ưu trải nghiệm người dùng.",
    stats: {
      appliedJobs: 8,
      savedJobs: 15,
      profileViews: 92,
      interviewInvites: 3,
      rating: 4.7,
      ratingCount: 8,
    },
    skills: ["Node.js", "Java", "Spring Boot", "PostgreSQL", "Docker"],
    experience: [
      {
        id: "exp-3",
        position: "Backend Developer",
        company: "GreenTech Solutions",
        period: "2023 – Hiện tại",
        isCurrent: true,
        description: "Xây dựng hệ thống microservices REST API và message queue RabbitMQ.",
      },
    ],
    education: [
      {
        id: "edu-2",
        school: "Đại học Bách Khoa TP.HCM",
        university: "ĐHQG-HCM",
        period: "2016 – 2021",
        major: "Khoa học Máy tính",
        degree: "Kỹ sư",
      },
    ],
    documents: [
      {
        id: "doc-4",
        name: "CV_TranVanAn_Backend.pdf",
        updatedAt: "14/09/2026",
        size: "1.8 MB",
      },
    ],
    recentActivities: [
      {
        id: "act-6",
        time: "14/09/2026 16:45",
        action: "Đăng nhập",
        content: "Đăng nhập hệ thống",
        ip: "14.161.12.89",
      },
    ],
    complaints: [],
    auditLogs: [],
    notes: [],
  },
};

const ALL_USER_IDS = Object.keys(USERS_DB);

function UserDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { message, modal } = App.useApp();

  const rawId = typeof params?.id === "string" ? params.id : "1";

  // Lấy dữ liệu user theo id
  const [userData, setUserData] = useState<any>(() => ({
    id: rawId,
    name: "Đang tải...",
    role: "CANDIDATE",
    roles: ["candidate"],
    status: "ACTIVE",
    joinedAt: "—",
    email: "—",
    emailVerified: false,
    phone: "—",
    phoneVerified: false,
    idCardVerified: false,
    birthday: "—",
    age: undefined,
    gender: "—",
    address: "Việt Nam",
    registeredFrom: "Website",
    lastLoginAt: "—",
    lastLoginIp: "—",
    device: "Web Browser",
    activeSessions: 1,
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&h=800&q=90",
    quote: "",
    stats: {
      appliedJobs: 0,
      savedJobs: 0,
      profileViews: 0,
      interviewInvites: 0,
      rating: 0,
      ratingCount: 0,
    },
    skills: [],
    experience: [],
    education: [],
    documents: [],
    recentActivities: [],
    complaints: [],
    auditLogs: [],
    notes: [],
  }));

  const fetchUserDetail = useCallback(async () => {
    try {
      const res = await adminService.getUserDetail(rawId);
      const u = res?.data?.user || (res?.data as any);
      if (!u || !u.id) return;

      const roleStr =
        u.account_type === "employer"
          ? "RECRUITER"
          : u.account_type === "admin"
            ? "ADMIN"
            : "CANDIDATE";

      const mappedExp = (u.experiences || []).map((e: any) => ({
        id: String(e.id),
        position: e.position || "Chuyên viên",
        company: e.company || "Doanh nghiệp",
        period: `${e.start_date || ""} – ${e.end_date || "Hiện tại"}`,
        isCurrent: Boolean(e.is_current),
        description: e.description || "",
      }));

      const mappedEdu = (u.educations || []).map((ed: any) => ({
        id: String(ed.id),
        school: ed.school || "Trường Đại học",
        university: ed.school || "",
        period: `${ed.start_year || ""} – ${ed.end_year || "Hiện tại"}`,
        major: ed.major || "",
        degree: ed.degree || "Cử nhân",
      }));

      const mappedDocs = (u.cvs || []).map((cv: any) => ({
        id: String(cv.id),
        name: cv.title || `CV_${cv.id}.pdf`,
        fileUrl: cv.file_url || null,
        updatedAt: cv.created_at ? new Date(cv.created_at).toLocaleDateString("vi-VN") : "—",
        size: cv.is_primary ? "CV Chính" : "CV Phụ",
      }));

      const mappedLogs = (u.audit_logs || u.recent_activities || []).map((l: any) => ({
        id: String(l.id),
        time: l.created_at ? new Date(l.created_at).toLocaleString("vi-VN") : "—",
        admin: l.actor_name || "Hệ thống",
        action: l.action || "Thao tác",
        content: `${l.action} (${l.entity_type || "system"})`,
        detail: l.changes ? JSON.stringify(l.changes) : l.action,
        ip: "Hệ thống",
      }));

      const mappedComplaints = (u.reports || []).map((rp: any) => ({
        id: String(rp.id),
        title: rp.reason || "Báo cáo vi phạm",
        content: rp.details || rp.reason || "",
        status: rp.status || "pending",
        createdAt: rp.created_at ? new Date(rp.created_at).toLocaleString("vi-VN") : "—",
      }));

      setUserData({
        id: String(u.id),
        name: u.full_name || u.email,
        role: roleStr,
        roles: u.roles && u.roles.length > 0 ? u.roles : [u.account_type || "candidate"],
        status: u.is_active ? "ACTIVE" : "LOCKED",
        joinedAt: u.created_at ? new Date(u.created_at).toLocaleDateString("vi-VN") : "—",
        email: u.email,
        emailVerified: Boolean(u.email_verified_at),
        phone: u.phone || "—",
        phoneVerified: Boolean(u.phone),
        idCardVerified: Boolean(u.email_verified_at),
        birthday: u.profile?.birth_date
          ? new Date(u.profile.birth_date).toLocaleDateString("vi-VN")
          : "—",
        age: undefined,
        gender: "—",
        address: u.profile?.location || "Việt Nam",
        registeredFrom: "Website",
        lastLoginAt: u.updated_at ? new Date(u.updated_at).toLocaleString("vi-VN") : "—",
        lastLoginIp: "Hệ thống",
        device: "Web Browser",
        activeSessions: u.is_active ? 1 : 0,
        avatar:
          u.avatar_url ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&h=800&q=90",
        quote: u.profile?.headline || u.profile?.bio || "",
        companyName: u.company?.company_name || undefined,
        companyId: u.company?.company_id ? String(u.company.company_id) : undefined,
        jobTitle: u.company?.member_role || u.profile?.headline || undefined,
        stats: {
          appliedJobs:
            roleStr === "RECRUITER"
              ? u.stats?.employer_jobs_count || 0
              : u.stats?.applied_jobs_count || 0,
          savedJobs: u.stats?.saved_jobs_count || 0,
          profileViews: u.stats?.cvs_count || 0,
          interviewInvites: (u.applications || []).filter((a: any) => a.status === "interview").length,
          rating: 5.0,
          ratingCount: u.stats?.reports_count || 0,
        },
        skills: u.skills || [],
        experience: mappedExp,
        education: mappedEdu,
        documents: mappedDocs,
        applications: u.applications || [],
        employerJobs: u.employer_jobs || [],
        recentActivities: mappedLogs,
        complaints: mappedComplaints,
        auditLogs: mappedLogs,
        notes: [],
      });
    } catch (err) {
      console.error("Lỗi khi tải chi tiết người dùng:", err);
    }
  }, [rawId]);

  useEffect(() => {
    fetchUserDetail();
  }, [fetchUserDetail]);

  // Tab đang chọn
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "career"
    | "cv"
    | "jobs"
    | "activities"
    | "complaints"
    | "security"
    | "audit"
    | "notes"
  >("overview");

  // State các Modal
  const [isPreviewAvatarOpen, setIsPreviewAvatarOpen] = useState(false);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [notifyForm] = Form.useForm();

  const [isResetPwdModalOpen, setIsResetPwdModalOpen] = useState(false);
  const [resetPwdForm] = Form.useForm();

  const [isEditBasicInfoOpen, setIsEditBasicInfoOpen] = useState(false);
  const [editInfoForm] = Form.useForm();

  const [isEditQuoteOpen, setIsEditQuoteOpen] = useState(false);
  const [newQuoteText, setNewQuoteText] = useState(userData.quote || "");

  const [newNoteText, setNewNoteText] = useState("");

  // Tìm index người trước / người tiếp
  const numericId = Number(userData.id);
  const prevUserId = !Number.isNaN(numericId) && numericId > 1 ? String(numericId - 1) : null;
  const nextUserId = !Number.isNaN(numericId) ? String(numericId + 1) : null;

  // Chuyển sang user khác
  const handleNavigateUser = (targetId: string | null) => {
    if (!targetId) return;
    router.push(`/admin/users/${targetId}`);
  };

  // Khóa / Mở khóa tài khoản
  const handleToggleBlock = () => {
    const isLocked = userData.status === "LOCKED";
    modal.confirm({
      title: isLocked ? "Mở khóa tài khoản người dùng?" : "Xác nhận khóa tài khoản người dùng?",
      content: isLocked
        ? `Bạn có chắc chắn muốn mở khóa tài khoản "${userData.name}" (${userData.email})? Người dùng sẽ có thể đăng nhập lại.`
        : `Bạn có chắc chắn muốn khóa tài khoản "${userData.name}" (${userData.email})? Người dùng sẽ không thể truy cập hệ thống.`,
      okText: isLocked ? "Mở khóa tài khoản" : "Khóa tài khoản",
      okType: isLocked ? "primary" : "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await adminService.updateUserStatus(
            rawId,
            isLocked,
            isLocked ? "Mở khóa bởi Admin" : "Tạm khóa bởi Admin"
          );
          const nextStatus = isLocked ? "ACTIVE" : "LOCKED";
          setUserData((prev: any) => ({
            ...prev,
            status: nextStatus,
          }));
          message.success(
            isLocked
              ? `Đã mở khóa tài khoản "${userData.name}" thành công!`
              : `Đã khóa tài khoản "${userData.name}" thành công!`
          );
          fetchUserDetail();
        } catch {
          message.error("Không thể cập nhật trạng thái tài khoản.");
        }
      },
    });
  };

  // Đặt lại mật khẩu
  const handleConfirmResetPassword = async () => {
    try {
      const values = await resetPwdForm.validateFields();
      await adminService.resetUserPassword(rawId, values.newPassword);
      message.success(
        `Đã đặt lại mật khẩu cho "${userData.email}", thu hồi phiên đăng nhập cũ và gửi cảnh báo bảo mật!`
      );
      resetPwdForm.resetFields();
      setIsResetPwdModalOpen(false);
      fetchUserDetail();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(
        err?.response?.data?.errors?.password?.[0] ||
          err?.response?.data?.detail ||
          "Đặt lại mật khẩu thất bại."
      );
    }
  };

  // Gửi thông báo
  const handleSendNotification = async (values: any) => {
    try {
      await adminService.broadcastNotification({
        title: values.title,
        content: values.content || "",
        user_id: Number(rawId),
      });
      message.success(
        `Đã gửi thông báo "${values.title}" tới ${userData.name} thành công!`
      );
      setIsNotifyModalOpen(false);
    } catch {
      message.error("Không thể gửi thông báo.");
    }
  };

  // Lưu chỉnh sửa thông tin cơ bản & vai trò
  const handleSaveBasicInfo = async (values: any) => {
    try {
      if (values.roleCode) {
        await adminService.updateUserRoles(rawId, [values.roleCode]);
      }
      setUserData((prev: any) => ({
        ...prev,
        name: values.name || prev.name,
        email: values.email || prev.email,
        phone: values.phone || prev.phone,
        birthday: values.birthday || prev.birthday,
        gender: values.gender || prev.gender,
        address: values.address || prev.address,
      }));
      setIsEditBasicInfoOpen(false);
      message.success("Đã cập nhật thông tin & phân quyền người dùng thành công!");
      fetchUserDetail();
    } catch {
      message.error("Cập nhật thông tin thất bại.");
    }
  };

  // Lưu câu quote / ghi chú ngắn
  const handleSaveQuote = () => {
    setUserData((prev: any) => ({
      ...prev,
      quote: newQuoteText,
    }));
    setIsEditQuoteOpen(false);
    message.success("Đã cập nhật lời giới thiệu người dùng!");
  };

  // Thêm ghi chú nội bộ
  const handleAddNote = () => {
    if (!newNoteText.trim()) {
      message.warning("Vui lòng nhập nội dung ghi chú!");
      return;
    }
    const newNote = {
      id: `note-${Date.now()}`,
      admin: "Admin Quản trị viên",
      time: "Vừa xong",
      content: newNoteText.trim(),
    };
    setUserData((prev: any) => ({
      ...prev,
      notes: [newNote, ...(prev.notes || [])],
    }));
    setNewNoteText("");
    message.success("Đã thêm ghi chú nội bộ thành công!");
  };

  // Xác minh CMND/CCCD
  const handleVerifyIdCard = () => {
    modal.confirm({
      title: "Xác nhận phê duyệt CMND/CCCD?",
      content: `Phê duyệt xác minh căn cước công dân / CMND cho người dùng "${userData.name}"?`,
      okText: "Phê duyệt xác minh",
      cancelText: "Hủy",
      onOk: () => {
        setUserData((prev: any) => ({
          ...prev,
          idCardVerified: true,
          auditLogs: [
            {
              id: `log-${Date.now()}`,
              time: "Vừa xong",
              admin: "Admin Quản trị viên",
              action: "Xác minh CMND/CCCD",
              detail: "Phê duyệt xác minh giấy tờ định danh",
            },
            ...(prev.auditLogs || []),
          ],
        }));
        message.success("Đã xác minh CMND/CCCD thành công!");
      },
    });
  };

  const isRecruiter = userData.role === "RECRUITER" || userData.role === "COMPANY";

  return (
    <div className="space-y-4 select-none pb-12">
      {/* ========================================================= */}
      {/* 1. HEADER ROW: BREADCRUMB & NÚT ĐIỀU HƯỚNG */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-transparent">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link
            href="/admin/users"
            className="text-slate-500 hover:text-[#0062ff] transition-colors"
          >
            Quản lý người dùng
          </Link>
          <span>&gt;</span>
          <Link
            href="/admin/users"
            className="text-slate-500 hover:text-[#0062ff] transition-colors"
          >
            Danh sách người dùng
          </Link>
          <span>&gt;</span>
          <span className="font-extrabold text-slate-900">Chi tiết người dùng</span>
        </div>

        {/* Nút Quay lại / Người trước / Người tiếp */}
        <div className="flex items-center gap-2">
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 text-xs font-bold text-slate-700 hover:text-[#0062ff] hover:border-blue-300 shadow-2xs transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại</span>
          </Link>

          <button
            type="button"
            disabled={!prevUserId}
            onClick={() => handleNavigateUser(prevUserId)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              prevUserId
                ? "bg-white border-slate-200/90 text-slate-700 hover:text-[#0062ff] hover:border-blue-300 shadow-2xs cursor-pointer"
                : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Người trước</span>
          </button>

          <button
            type="button"
            disabled={!nextUserId}
            onClick={() => handleNavigateUser(nextUserId)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              nextUserId
                ? "bg-white border-slate-200/90 text-slate-700 hover:text-[#0062ff] hover:border-blue-300 shadow-2xs cursor-pointer"
                : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            <span>Người tiếp</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. PROFILE HERO CARD (ĐÚNG THEO MOCKUP) */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left: Avatar + Thông tin cơ bản */}
          <div className="flex items-start gap-4">
            {/* Avatar có badge Camera & click xem lớn */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setIsPreviewAvatarOpen(true)}
                className="border-none bg-transparent p-0 cursor-pointer rounded-full relative group block"
                title="Bấm để xem ảnh kích thước lớn"
              >
                <img
                  src={userData.avatar}
                  alt={userData.name}
                  className="w-20 h-20 sm:w-22 sm:h-22 rounded-full object-cover border-3 border-white shadow-md group-hover:ring-3 group-hover:ring-[#0062ff] transition-all"
                />
                <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-slate-900/80 hover:bg-[#0062ff] text-white flex items-center justify-center shadow-md transition-colors">
                  <Camera className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>

            {/* Thông tin tên, ID, vai trò, liên hệ */}
            <div className="space-y-1.5 min-w-0">
              {/* Tên & Trạng thái */}
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0">
                  {userData.name}
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    userData.status === "ACTIVE"
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200/70"
                      : userData.status === "LOCKED"
                      ? "bg-rose-50 text-rose-600 border border-rose-200/70"
                      : "bg-amber-50 text-amber-600 border border-amber-200/70"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      userData.status === "ACTIVE"
                        ? "bg-emerald-500"
                        : userData.status === "LOCKED"
                        ? "bg-rose-500"
                        : "bg-amber-500"
                    }`}
                  />
                  <span>
                    {userData.status === "ACTIVE"
                      ? "Hoạt động"
                      : userData.status === "LOCKED"
                      ? "Đã khóa"
                      : "Chờ xác minh"}
                  </span>
                </span>
              </div>

              {/* ID & Loại tài khoản & Doanh nghiệp & Ngày tham gia */}
              <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500">
                <span className="font-mono font-bold text-slate-600">
                  ID: {userData.id}
                </span>
                <span className="text-slate-300">•</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    isRecruiter
                      ? "bg-indigo-50 text-indigo-600 border border-indigo-200"
                      : userData.role === "ADMIN"
                      ? "bg-rose-50 text-rose-600 border border-rose-200"
                      : "bg-blue-50 text-[#0062ff] border border-blue-200"
                  }`}
                >
                  {isRecruiter
                    ? "Nhà tuyển dụng"
                    : userData.role === "ADMIN"
                    ? "Quản trị viên"
                    : "Ứng viên"}
                </span>

                {isRecruiter && userData.companyName && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="inline-flex items-center gap-1 font-bold text-slate-800">
                      <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{userData.companyName}</span>
                      {userData.jobTitle && (
                        <span className="text-slate-400 font-normal">({userData.jobTitle})</span>
                      )}
                    </span>
                    <Link
                      href="/admin/companies"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0062ff] hover:underline"
                    >
                      <span>Xem doanh nghiệp</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </>
                )}

                <span className="text-slate-300">•</span>
                <span>Tham gia: {userData.joinedAt}</span>
              </div>

              {/* Subline: Email, SĐT, Ngày sinh, Địa chỉ */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600 pt-1">
                {/* Email */}
                <div className="inline-flex items-center gap-1.5 font-medium">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{userData.email}</span>
                  {userData.emailVerified && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  )}
                </div>

                {/* SĐT */}
                <div className="inline-flex items-center gap-1.5 font-medium">
                  <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{userData.phone}</span>
                  {userData.phoneVerified && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  )}
                </div>

                {/* Ngày sinh */}
                <div className="inline-flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {userData.birthday}{" "}
                    {userData.age ? `(${userData.age} tuổi)` : ""}
                  </span>
                </div>

                {/* Địa chỉ */}
                <div className="inline-flex items-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{userData.address}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Các nút thao tác & Câu Quote */}
          <div className="flex flex-col lg:items-end justify-between gap-3 shrink-0">
            {/* Hàng nút thao tác */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Nút 1: Gửi thông báo */}
              <button
                type="button"
                onClick={() => {
                  notifyForm.resetFields();
                  notifyForm.setFieldsValue({
                    type: "IN_APP",
                    title: "Thông báo từ Ban quản trị CAREZA",
                    content: "",
                  });
                  setIsNotifyModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0062ff] hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer border-none"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Gửi thông báo</span>
              </button>

              {/* Nút 2: Đặt lại mật khẩu */}
              <button
                type="button"
                onClick={() => {
                  resetPwdForm.resetFields();
                  setIsResetPwdModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 hover:border-amber-300 hover:text-amber-600 text-slate-700 text-xs font-bold shadow-2xs transition-all cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                <span>Đặt lại mật khẩu</span>
              </button>

              {/* Nút 3: Khóa / Mở khóa tài khoản */}
              <button
                type="button"
                onClick={handleToggleBlock}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border text-xs font-bold shadow-2xs transition-all cursor-pointer ${
                  userData.status === "LOCKED"
                    ? "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                    : "border-rose-200 text-rose-600 hover:bg-rose-50"
                }`}
              >
                {userData.status === "LOCKED" ? (
                  <>
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Mở khóa tài khoản</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Khóa tài khoản</span>
                  </>
                )}
              </button>

              {/* Nút 4: Menu thao tác thêm ... */}
              <Dropdown
                menu={{
                  items: [
                    {
                      key: "edit-basic",
                      icon: <Edit2 className="w-3.5 h-3.5 text-blue-500" />,
                      label: "Chỉnh sửa thông tin",
                      onClick: () => {
                        editInfoForm.setFieldsValue({
                          name: userData.name,
                          email: userData.email,
                          phone: userData.phone,
                          birthday: userData.birthday,
                          gender: userData.gender,
                          address: userData.address,
                        });
                        setIsEditBasicInfoOpen(true);
                      },
                    },
                    {
                      key: "verify-id",
                      icon: <Shield className="w-3.5 h-3.5 text-emerald-500" />,
                      label: userData.idCardVerified
                        ? "Đã xác minh CMND/CCCD"
                        : "Xác minh CMND/CCCD",
                      disabled: userData.idCardVerified,
                      onClick: handleVerifyIdCard,
                    },
                    {
                      type: "divider",
                    },
                    {
                      key: "export-user",
                      icon: <Download className="w-3.5 h-3.5 text-slate-600" />,
                      label: "Xuất hồ sơ (PDF / Data)",
                      onClick: () => {
                        message.success("Đang chuẩn bị file hồ sơ người dùng...");
                      },
                    },
                  ],
                }}
                trigger={["click"]}
                placement="bottomRight"
              >
                <button
                  type="button"
                  className="w-8 h-8 rounded-xl bg-white border border-slate-200/90 text-slate-500 hover:text-slate-800 hover:border-slate-300 flex items-center justify-center cursor-pointer shadow-2xs transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </Dropdown>
            </div>

            {/* Câu Quote & Chỉnh sửa ghi chú ngắn */}
            <div className="flex items-center gap-2 text-xs text-slate-500 lg:text-right pt-0.5">
              <span className="italic line-clamp-1 max-w-[320px]">
                "{userData.quote || "Chưa có lời giới thiệu"}"
              </span>
              <button
                type="button"
                onClick={() => {
                  setNewQuoteText(userData.quote || "");
                  setIsEditQuoteOpen(true);
                }}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0062ff] hover:underline bg-transparent border-none cursor-pointer p-0 shrink-0"
              >
                <Edit2 className="w-3 h-3" />
                <span>Chỉnh sửa ghi chú</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. TABS NAVIGATION: 9 TABS CHUYỂN ĐỔI MƯỢT MÀ */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs px-3 sm:px-4 flex items-center gap-1 overflow-x-auto no-scrollbar">
        {[
          { key: "overview", label: "Tổng quan", icon: Layers },
          { key: "career", label: "Hồ sơ nghề nghiệp", icon: FileText },
          { key: "cv", label: "CV & Tài liệu", icon: Bookmark },
          { key: "jobs", label: isRecruiter ? "Tin tuyển dụng" : "Việc làm", icon: Briefcase },
          { key: "activities", label: "Lịch sử hoạt động", icon: History },
          { key: "complaints", label: "Khiếu nại & Vi phạm", icon: AlertTriangle },
          { key: "security", label: "Bảo mật & truy cập", icon: Shield },
          { key: "audit", label: "Nhật ký quản trị", icon: FileClock },
          { key: "notes", label: "Ghi chú nội bộ", icon: StickyNote },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`inline-flex items-center gap-2 py-3 px-3 text-xs font-bold border-none bg-transparent cursor-pointer whitespace-nowrap transition-all relative ${
                isActive ? "text-[#0062ff]" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#0062ff] rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* 4. TAB CONTENT: TỔNG QUAN (CHÍNH THEO MOCKUP) */}
      {/* ========================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          {/* 4.1 HÀNG 5 CARD THỐNG KÊ (OVERVIEW STATS) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5">
            {/* Card 1: Việc đã ứng tuyển / Tin đang tuyển */}
            <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/80 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <span className="text-xl sm:text-2xl font-black text-slate-900 block leading-none">
                  {userData.stats?.appliedJobs || 0}
                </span>
                <span className="text-[11px] font-bold text-slate-500 block mt-1 truncate">
                  {isRecruiter ? "Tin đang tuyển" : "Việc đã ứng tuyển"}
                </span>
              </div>
            </div>

            {/* Card 2: Việc đã lưu / Tin đã đóng */}
            <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/80 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Bookmark className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <span className="text-xl sm:text-2xl font-black text-slate-900 block leading-none">
                  {userData.stats?.savedJobs || 0}
                </span>
                <span className="text-[11px] font-bold text-slate-500 block mt-1 truncate">
                  {isRecruiter ? "Tin đã đóng" : "Việc đã lưu"}
                </span>
              </div>
            </div>

            {/* Card 3: Lượt xem hồ sơ / Lượt xem tin */}
            <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/80 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <Eye className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <span className="text-xl sm:text-2xl font-black text-slate-900 block leading-none">
                  {userData.stats?.profileViews?.toLocaleString() || 0}
                </span>
                <span className="text-[11px] font-bold text-slate-500 block mt-1 truncate">
                  {isRecruiter ? "Lượt xem tin tuyển" : "Lượt xem hồ sơ"}
                </span>
              </div>
            </div>

            {/* Card 4: Lời mời phỏng vấn / Ứng viên nhận được */}
            <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/80 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <span className="text-xl sm:text-2xl font-black text-slate-900 block leading-none">
                  {userData.stats?.interviewInvites || 0}
                </span>
                <span className="text-[11px] font-bold text-slate-500 block mt-1 truncate">
                  {isRecruiter ? "Ứng viên nhận được" : "Lời mời phỏng vấn"}
                </span>
              </div>
            </div>

            {/* Card 5: Đánh giá trung bình */}
            <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/80 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                <Star className="w-5 h-5 fill-amber-400 stroke-[1.5]" />
              </div>
              <div className="min-w-0">
                <span className="text-xl sm:text-2xl font-black text-slate-900 block leading-none">
                  {userData.stats?.rating || 5.0}
                </span>
                <span className="text-[10px] font-bold text-slate-500 block mt-1 truncate">
                  {isRecruiter ? "Đánh giá nhà tuyển dụng" : "Đánh giá trung bình"} ({userData.stats?.ratingCount || 0} đánh giá)
                </span>
              </div>
            </div>
          </div>

          {/* 4.2 HÀNG 3 CỘT THÔNG TIN CHÍNH */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* CỘT 1: THÔNG TIN CƠ BẢN (4 COLS) */}
            <div className="lg:col-span-4 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900 m-0">
                  Thông tin cơ bản
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    editInfoForm.setFieldsValue({
                      name: userData.name,
                      email: userData.email,
                      phone: userData.phone,
                      birthday: userData.birthday,
                      gender: userData.gender,
                      address: userData.address,
                    });
                    setIsEditBasicInfoOpen(true);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0062ff] font-bold text-[11px] border border-blue-200 cursor-pointer transition-colors"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Chỉnh sửa</span>
                </button>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-2 flex justify-between gap-2">
                  <span className="text-slate-400">Họ và tên</span>
                  <span className="font-bold text-slate-900 text-right">
                    {userData.name}
                  </span>
                </div>

                <div className="py-2 flex justify-between items-center gap-2">
                  <span className="text-slate-400">Email</span>
                  <div className="flex items-center gap-1.5 text-right">
                    <span className="font-semibold text-slate-900">{userData.email}</span>
                    {userData.emailVerified && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-md">
                        Đã xác minh
                      </span>
                    )}
                  </div>
                </div>

                <div className="py-2 flex justify-between items-center gap-2">
                  <span className="text-slate-400">Số điện thoại</span>
                  <div className="flex items-center gap-1.5 text-right">
                    <span className="font-semibold text-slate-900">{userData.phone}</span>
                    {userData.phoneVerified && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-md">
                        Đã xác minh
                      </span>
                    )}
                  </div>
                </div>

                <div className="py-2 flex justify-between gap-2">
                  <span className="text-slate-400">Ngày sinh</span>
                  <span className="font-semibold text-slate-800 text-right">
                    {userData.birthday}
                  </span>
                </div>

                <div className="py-2 flex justify-between gap-2">
                  <span className="text-slate-400">Giới tính</span>
                  <span className="font-semibold text-slate-800 text-right">
                    {userData.gender}
                  </span>
                </div>

                <div className="py-2 flex justify-between gap-2">
                  <span className="text-slate-400">Địa chỉ</span>
                  <span className="font-semibold text-slate-800 text-right">
                    {userData.address}
                  </span>
                </div>

                <div className="py-2 flex justify-between items-center gap-2">
                  <span className="text-slate-400">Loại tài khoản</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      isRecruiter
                        ? "bg-indigo-50 text-indigo-600 border border-indigo-200"
                        : userData.role === "ADMIN"
                        ? "bg-rose-50 text-rose-600 border border-rose-200"
                        : "bg-blue-50 text-[#0062ff] border border-blue-200"
                    }`}
                  >
                    {isRecruiter
                      ? "Nhà tuyển dụng"
                      : userData.role === "ADMIN"
                      ? "Quản trị viên"
                      : "Ứng viên"}
                  </span>
                </div>

                <div className="py-2 flex justify-between items-center gap-2">
                  <span className="text-slate-400">Trạng thái</span>
                  <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Hoạt động</span>
                  </span>
                </div>

                <div className="py-2 flex justify-between gap-2">
                  <span className="text-slate-400">Ngày tạo tài khoản</span>
                  <span className="font-semibold text-slate-800 text-right">
                    {userData.joinedAt} 10:24
                  </span>
                </div>

                <div className="py-2 flex justify-between gap-2">
                  <span className="text-slate-400">Lần đăng nhập cuối</span>
                  <span className="font-semibold text-slate-800 text-right">
                    {userData.lastLoginAt}
                  </span>
                </div>

                <div className="py-2 flex justify-between gap-2">
                  <span className="text-slate-400">Nguồn đăng ký</span>
                  <span className="font-semibold text-slate-800 text-right">
                    {userData.registeredFrom}
                  </span>
                </div>

                <div className="py-2 flex justify-between gap-2">
                  <span className="text-slate-400">Ghi chú</span>
                  <span className="font-semibold text-slate-400 text-right">—</span>
                </div>
              </div>
            </div>

            {/* CỘT 2: VỚI NHÀ TUYỂN DỤNG → DOANH NGHIỆP & VỊ TRÍ; VỚI ỨNG VIÊN → KỸ NĂNG & KINH NGHIỆM */}
            <div className="lg:col-span-4 space-y-4">
              {isRecruiter ? (
                /* Card Thông tin Doanh nghiệp & Vị trí công tác (Dành riêng cho Nhà tuyển dụng) */
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-indigo-600" />
                      <h3 className="text-sm font-black text-slate-900 m-0">
                        Doanh nghiệp & Vị trí công tác
                      </h3>
                    </div>
                    <Link
                      href="/admin/companies"
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#0062ff] hover:underline"
                    >
                      <span>Xem doanh nghiệp</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="divide-y divide-slate-100 text-xs">
                    {/* 1. Doanh nghiệp đang thuộc */}
                    <div className="py-2.5 flex justify-between items-center gap-2">
                      <span className="text-slate-500 font-medium">Doanh nghiệp đang thuộc</span>
                      <div className="flex items-center gap-1.5 text-right">
                        <span className="font-bold text-slate-900 text-sm">
                          {userData.companyName || "Chưa cập nhật"}
                        </span>
                      </div>
                    </div>

                    {/* 2. Chức vụ */}
                    <div className="py-2.5 flex justify-between items-center gap-2">
                      <span className="text-slate-500 font-medium">Chức vụ</span>
                      <span className="font-bold text-slate-800 text-right">
                        {userData.jobTitle || "Trưởng phòng Tuyển dụng IT"}
                      </span>
                    </div>

                    {/* 3. Vai trò trong doanh nghiệp */}
                    <div className="py-2.5 flex justify-between items-center gap-2">
                      <span className="text-slate-500 font-medium">Vai trò trong doanh nghiệp</span>
                      <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200/60 text-right">
                        {userData.companyRole || "Quản trị viên tuyển dụng (HR Manager)"}
                      </span>
                    </div>

                    {/* 4. Chi nhánh */}
                    <div className="py-2.5 flex justify-between items-center gap-2">
                      <span className="text-slate-500 font-medium">Chi nhánh</span>
                      <span className="font-semibold text-slate-800 text-right">
                        {userData.branch || "Chi nhánh Hà Nội"}
                      </span>
                    </div>

                    {/* 5. Quyền hạn */}
                    <div className="py-2.5 space-y-1.5">
                      <span className="text-slate-500 font-medium block">Quyền hạn trong hệ thống</span>
                      <div className="flex flex-wrap gap-1">
                        {(userData.permissions && userData.permissions.length > 0
                          ? userData.permissions
                          : [
                              "Đăng tin tuyển dụng",
                              "Xem & Tải CV ứng viên",
                              "Mời phỏng vấn",
                              "Quản lý nhóm",
                            ]
                        ).map((perm: string) => (
                          <span
                            key={perm}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10.5px] border border-slate-200"
                          >
                            ✓ {perm}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 6. Trạng thái thành viên */}
                    <div className="py-2.5 flex justify-between items-center gap-2">
                      <span className="text-slate-500 font-medium">Trạng thái thành viên</span>
                      <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70 text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>{userData.memberStatus || "Đang hoạt động"}</span>
                      </span>
                    </div>

                    {/* 7. Ngày tham gia doanh nghiệp */}
                    <div className="py-2.5 flex justify-between items-center gap-2">
                      <span className="text-slate-500 font-medium">Ngày tham gia DN</span>
                      <span className="font-semibold text-slate-800 text-right">
                        {userData.joinedCompanyAt || "15/03/2023"}
                      </span>
                    </div>
                  </div>

                  {/* Nút Xem doanh nghiệp */}
                  <div className="pt-2 border-t border-slate-100">
                    <Link
                      href="/admin/companies"
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200/80 transition-colors"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Xem chi tiết doanh nghiệp ({userData.companyName})</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  {/* Card 1: Kỹ năng chính (Ứng viên) */}
                  <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        <h3 className="text-sm font-black text-slate-900 m-0">
                          Kỹ năng chính
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab("career")}
                        className="text-xs font-bold text-[#0062ff] hover:underline bg-transparent border-none cursor-pointer p-0"
                      >
                        Xem chi tiết
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {userData.skills?.map((skill: string) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 rounded-lg bg-blue-50/80 border border-blue-200/70 text-[#0062ff] font-bold text-[11px]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card 2: Kinh nghiệm làm việc (Ứng viên) */}
                  <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-[#0062ff]" />
                        <h3 className="text-sm font-black text-slate-900 m-0">
                          Kinh nghiệm làm việc
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab("career")}
                        className="text-xs font-bold text-[#0062ff] hover:underline bg-transparent border-none cursor-pointer p-0"
                      >
                        Xem tất cả
                      </button>
                    </div>

                    <div className="space-y-3 pt-1 text-xs">
                      {userData.experience?.map((exp: any) => (
                        <div key={exp.id} className="flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0 mt-0.5">
                            <Building2 className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-slate-900 block truncate">
                                {exp.position}
                              </span>
                              {exp.isCurrent && (
                                <span className="text-[9.5px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-md border border-emerald-200">
                                  Hiện tại
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-medium text-slate-600 block">
                              {exp.company}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {exp.period}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card 3: Học vấn (Ứng viên) */}
                  <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-emerald-600" />
                        <h3 className="text-sm font-black text-slate-900 m-0">
                          Học vấn
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab("career")}
                        className="text-xs font-bold text-[#0062ff] hover:underline bg-transparent border-none cursor-pointer p-0"
                      >
                        Xem tất cả
                      </button>
                    </div>

                    <div className="space-y-2 pt-1 text-xs">
                      {userData.education?.map((edu: any) => (
                        <div key={edu.id} className="flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                            <GraduationCap className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-slate-900 block">
                              {edu.school}
                            </span>
                            <span className="text-[11px] text-slate-600 block">
                              {edu.university}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {edu.period} · {edu.major}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* CỘT 3: TÀI LIỆU NỔI BẬT + XÁC MINH + BẢO MẬT (4 COLS) */}
            <div className="lg:col-span-4 space-y-4">
              {/* Card 1: Tài liệu nổi bật */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-900 m-0">
                    Tài liệu nổi bật
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab("cv")}
                    className="text-xs font-bold text-[#0062ff] hover:underline bg-transparent border-none cursor-pointer p-0"
                  >
                    Xem tất cả
                  </button>
                </div>

                <div className="space-y-2 pt-1">
                  {userData.documents?.map((doc: any) => (
                    <div
                      key={doc.id}
                      className="p-2.5 rounded-xl border border-slate-100 hover:border-blue-200 bg-slate-50/50 hover:bg-blue-50/20 flex items-center justify-between gap-2 transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-800 block truncate">
                            {doc.name}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            Cập nhật {doc.updatedAt} · {doc.size}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => message.success(`Bắt đầu tải xuống: ${doc.name}`)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-300 text-[#0062ff] font-bold text-[11px] shrink-0 cursor-pointer shadow-2xs"
                      >
                        Tải xuống
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 2: Trạng thái xác minh */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-900 m-0">
                    Trạng thái xác minh
                  </h3>
                </div>

                <div className="space-y-2.5 pt-1 text-xs">
                  {/* Email */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-slate-600 font-medium">
                      <Mail className="w-3.5 h-3.5 text-blue-500" />
                      <span>Email</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-600 text-[11px]">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Đã xác minh</span>
                      </span>
                      <span className="text-[10px] text-slate-400">12/05/2024</span>
                    </div>
                  </div>

                  {/* SĐT */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-slate-600 font-medium">
                      <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Số điện thoại</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-600 text-[11px]">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Đã xác minh</span>
                      </span>
                      <span className="text-[10px] text-slate-400">12/05/2024</span>
                    </div>
                  </div>

                  {/* CMND/CCCD */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-slate-600 font-medium">
                      <Shield className="w-3.5 h-3.5 text-amber-500" />
                      <span>CMND/CCCD</span>
                    </span>
                    <div className="flex items-center gap-2">
                      {userData.idCardVerified ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-600 text-[11px]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Đã xác minh</span>
                        </span>
                      ) : (
                        <>
                          <span className="inline-flex items-center gap-1 font-bold text-rose-500 text-[11px]">
                            <AlertCircle className="w-3 h-3" />
                            <span>Chưa xác minh</span>
                          </span>
                          <button
                            type="button"
                            onClick={handleVerifyIdCard}
                            className="px-2 py-0.5 rounded-md bg-blue-50 text-[#0062ff] font-bold text-[10.5px] border border-blue-200 cursor-pointer"
                          >
                            Xác minh
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Bảo mật & truy cập */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-900 m-0">
                    Bảo mật & truy cập
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab("security")}
                    className="text-xs font-bold text-[#0062ff] hover:underline bg-transparent border-none cursor-pointer p-0"
                  >
                    Xem tất cả
                  </button>
                </div>

                <div className="space-y-2 pt-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Lần đăng nhập gần nhất</span>
                    <span className="font-bold text-slate-800">{userData.lastLoginAt}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">IP gần nhất</span>
                    <span className="font-mono text-slate-800">{userData.lastLoginIp}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Thiết bị</span>
                    <span className="font-medium text-slate-800">{userData.device}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Các phiên đang đăng nhập</span>
                    <span className="font-bold text-[#0062ff] bg-blue-50 px-2 py-0.2 rounded-md">
                      {userData.activeSessions} thiết bị
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                    <span className="text-slate-400">Lịch sử đổi mật khẩu</span>
                    <button
                      type="button"
                      onClick={() => setActiveTab("security")}
                      className="text-xs font-bold text-[#0062ff] hover:underline bg-transparent border-none cursor-pointer p-0"
                    >
                      Xem chi tiết &gt;
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4.3 HÀNG 3 CARD BÊN DƯỚI: HOẠT ĐỘNG, KHIẾU NẠI, NHẬT KÝ QUẢN TRỊ */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-start">
            {/* Cột 1: Hoạt động gần đây (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900 m-0">
                  Hoạt động gần đây
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab("activities")}
                  className="text-xs font-bold text-[#0062ff] hover:underline bg-transparent border-none cursor-pointer p-0"
                >
                  Xem tất cả
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-[10.5px] font-bold text-slate-400 border-b border-slate-100 uppercase pb-1">
                      <th className="pb-2 font-bold">Thời gian</th>
                      <th className="pb-2 font-bold">Hành động</th>
                      <th className="pb-2 font-bold">Nội dung</th>
                      <th className="pb-2 font-bold text-right">IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {userData.recentActivities?.map((act: any) => (
                      <tr key={act.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2 text-[10.5px] text-slate-500 whitespace-nowrap">
                          {act.time}
                        </td>
                        <td className="py-2 font-bold text-slate-800 whitespace-nowrap">
                          {act.action}
                        </td>
                        <td className="py-2 text-[11px] text-slate-600 truncate max-w-[150px]">
                          {act.content}
                        </td>
                        <td className="py-2 font-mono text-[10px] text-slate-400 text-right whitespace-nowrap">
                          {act.ip}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cột 2: Khiếu nại & vi phạm (3.5 cols -> 4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900 m-0">
                  Khiếu nại & vi phạm
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab("complaints")}
                  className="text-xs font-bold text-[#0062ff] hover:underline bg-transparent border-none cursor-pointer p-0"
                >
                  Xem tất cả
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-[10.5px] font-bold text-slate-400 border-b border-slate-100 uppercase pb-1">
                      <th className="pb-2 font-bold">Ngày</th>
                      <th className="pb-2 font-bold">Loại</th>
                      <th className="pb-2 font-bold">Nội dung</th>
                      <th className="pb-2 font-bold text-right">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {userData.complaints?.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400 text-xs">
                          Không có vi phạm hay khiếu nại nào.
                        </td>
                      </tr>
                    ) : (
                      userData.complaints?.map((cmp: any) => (
                        <tr key={cmp.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2 text-[10.5px] text-slate-500 whitespace-nowrap">
                            {cmp.date}
                          </td>
                          <td className="py-2 font-bold text-slate-800 whitespace-nowrap">
                            {cmp.type}
                          </td>
                          <td className="py-2 text-[11px] text-slate-600 truncate max-w-[120px]">
                            {cmp.content}
                          </td>
                          <td className="py-2 text-right whitespace-nowrap">
                            <span
                              className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded-md ${
                                cmp.status === "RESOLVED"
                                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                  : "bg-amber-50 text-amber-600 border border-amber-200"
                              }`}
                            >
                              {cmp.status === "RESOLVED" ? "Đã xử lý" : "Đang xử lý"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cột 3: Nhật ký quản trị (3 cols) */}
            <div className="lg:col-span-3 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900 m-0">
                  Nhật ký quản trị
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab("audit")}
                  className="text-xs font-bold text-[#0062ff] hover:underline bg-transparent border-none cursor-pointer p-0"
                >
                  Xem tất cả
                </button>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {userData.auditLogs?.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 text-xs">
                    Chưa có nhật ký ghi nhận.
                  </div>
                ) : (
                  userData.auditLogs?.map((log: any) => (
                    <div key={log.id} className="py-2 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {log.time}
                        </span>
                        <span className="font-bold text-[#0062ff] text-[11px]">
                          {log.action}
                        </span>
                      </div>
                      <span className="font-semibold text-slate-800 block text-[11px]">
                        {log.admin}
                      </span>
                      {log.detail && (
                        <span className="text-[10px] text-slate-500 block">
                          {log.detail}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. CÁC TABS PHỤ KHÁC HOẠT ĐỘNG THẬT */}
      {/* ========================================================= */}

      {/* 5.1 Tab Hồ sơ nghề nghiệp */}
      {activeTab === "career" && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-black text-slate-900 m-0">
              Chi tiết hồ sơ nghề nghiệp
            </h2>
            <span className="text-xs text-slate-400">
              Cập nhật lần cuối: {userData.joinedAt}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Kinh nghiệm làm việc chi tiết
              </h3>
              <div className="space-y-3">
                {userData.experience?.map((exp: any) => (
                  <div
                    key={exp.id}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-900 text-xs">
                        {exp.position}
                      </span>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        {exp.period}
                      </span>
                    </div>
                    <span className="font-semibold text-slate-700 text-xs block">
                      {exp.company}
                    </span>
                    <p className="text-[11.5px] text-slate-500 m-0 leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Kỹ năng chuyên môn
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {userData.skills?.map((s: string) => (
                    <span
                      key={s}
                      className="px-3 py-1 rounded-lg bg-blue-50 text-[#0062ff] font-bold text-xs border border-blue-200/60"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Trình độ học vấn & Bằng cấp
                </h3>
                {userData.education?.map((edu: any) => (
                  <div
                    key={edu.id}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1"
                  >
                    <span className="font-bold text-slate-900 text-xs block">
                      {edu.school}
                    </span>
                    <span className="text-xs text-slate-600 block">
                      {edu.university}
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Thời gian: {edu.period} · Ngành: {edu.major}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5.2 Tab CV & Tài liệu */}
      {activeTab === "cv" && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-black text-slate-900 m-0">
              Quản lý CV & Tài liệu đính kèm
            </h2>
            <button
              type="button"
              onClick={() => message.info("Chức năng tải lên tài liệu bổ sung cho user")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0062ff] text-white font-bold text-xs cursor-pointer border-none"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm tài liệu mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {userData.documents?.map((doc: any) => (
              <div
                key={doc.id}
                className="p-4 rounded-xl border border-slate-200/80 bg-white hover:border-blue-300 shadow-2xs space-y-3 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-slate-900 text-xs block truncate">
                      {doc.name}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {doc.size} · {doc.updatedAt}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => message.success(`Đang mở xem trước: ${doc.name}`)}
                    className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-[11px] border border-slate-200 cursor-pointer"
                  >
                    Xem trước
                  </button>
                  <button
                    type="button"
                    onClick={() => message.success(`Bắt đầu tải về: ${doc.name}`)}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0062ff] font-bold text-[11px] border border-blue-200 cursor-pointer"
                  >
                    Tải xuống
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5.3 Tab Việc làm */}
      {activeTab === "jobs" && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-black text-slate-900 m-0">
              {isRecruiter ? "Danh sách tin tuyển dụng đã đăng" : "Danh sách việc làm đã ứng tuyển"}
            </h2>
            <span className="text-xs font-bold text-slate-500">
              Tổng số: {userData.stats?.appliedJobs || 0} mục
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {[
              {
                title: "Frontend Developer (React / Next.js)",
                company: "Công ty TNHH TechViet",
                salary: "18 - 25 triệu",
                date: "12/09/2026",
                status: "Đã nộp hồ sơ",
              },
              {
                title: "UI/UX Designer (Figma, Design System)",
                company: "Công ty Cổ phần VNPAY",
                salary: "15 - 22 triệu",
                date: "05/09/2026",
                status: "Nhà tuyển dụng đã xem CV",
              },
              {
                title: "Chuyên viên thiết kế giao diện Web/App",
                company: "Tập đoàn Viettel",
                salary: "20 - 30 triệu",
                date: "28/08/2026",
                status: "Mời phỏng vấn",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/60 rounded-xl px-2 transition-colors"
              >
                <div>
                  <span className="font-bold text-slate-900 text-xs block">
                    {item.title}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    {item.company} · Mức lương: {item.salary}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-400 font-medium">
                    {item.date}
                  </span>
                  <span className="text-[11px] font-bold text-[#0062ff] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5.4 Tab Lịch sử hoạt động */}
      {activeTab === "activities" && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-black text-slate-900 m-0">
              Lịch sử hoạt động tài khoản
            </h2>
            <span className="text-xs text-slate-400">
              Lưu vết thời gian thực
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {userData.recentActivities?.map((act: any) => (
              <div key={act.id} className="py-3 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0 mt-0.5">
                  <Activity className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">
                      {act.action}
                    </span>
                    <span className="text-[10.5px] text-slate-400 font-mono">
                      IP: {act.ip}
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs m-0 mt-0.5">{act.content}</p>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Thời gian: {act.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5.5 Tab Khiếu nại & Vi phạm */}
      {activeTab === "complaints" && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-black text-slate-900 m-0">
              Lịch sử khiếu nại & vi phạm chính sách
            </h2>
            <button
              type="button"
              onClick={() => message.info("Tạo biên bản ghi nhận vi phạm mới")}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs border-none cursor-pointer"
            >
              + Ghi nhận vi phạm
            </button>
          </div>

          {userData.complaints?.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Tài khoản này chưa từng bị khiếu nại hoặc vi phạm chính sách.
            </div>
          ) : (
            <div className="space-y-3">
              {userData.complaints?.map((cmp: any) => (
                <div
                  key={cmp.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                        {cmp.type}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {cmp.content}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block">
                      Ngày ghi nhận: {cmp.date}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                        cmp.status === "RESOLVED"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                          : "bg-amber-50 text-amber-600 border border-amber-200"
                      }`}
                    >
                      {cmp.status === "RESOLVED" ? "Đã giải quyết" : "Đang chờ xử lý"}
                    </span>
                    <button
                      type="button"
                      onClick={() => message.success("Mở hồ sơ xử lý khiếu nại")}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-[#0062ff] cursor-pointer"
                    >
                      Chi tiết
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5.6 Tab Bảo mật & truy cập */}
      {activeTab === "security" && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-black text-slate-900 m-0">
              Quản lý bảo mật & quyền truy cập
            </h2>
            <button
              type="button"
              onClick={() => {
                modal.confirm({
                  title: "Buộc đăng xuất tất cả thiết bị?",
                  content: `Thao tác này sẽ hủy toàn bộ các phiên đăng nhập hiện tại của ${userData.name}.`,
                  okText: "Buộc đăng xuất",
                  okType: "danger",
                  onOk: () => {
                    setUserData((prev: any) => ({ ...prev, activeSessions: 0 }));
                    message.success("Đã đăng xuất toàn bộ phiên của người dùng!");
                  },
                });
              }}
              className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold cursor-pointer bg-white"
            >
              Đăng xuất tất cả thiết bị
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <h3 className="font-bold text-slate-800 m-0 text-xs">
                Cài đặt xác thực & Mật khẩu
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Mật khẩu:</span>
                  <span className="font-mono text-slate-800">••••••••••••</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Xác thực 2 bước (2FA):</span>
                  <span className="font-bold text-emerald-600">Đã bật (SMS/OTP)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Lần đổi mật khẩu gần nhất:</span>
                  <span className="font-medium text-slate-800">01/06/2026</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <h3 className="font-bold text-slate-800 m-0 text-xs">
                Phiên đăng nhập hiện hoạt
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <div>
                    <span className="font-bold text-slate-800 block">
                      Windows 11 · Chrome (Hiện tại)
                    </span>
                    <span className="text-[10.5px] text-slate-400">
                      IP: 118.70.12.34 · TP.HCM
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Đang hoạt động
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <div>
                    <span className="font-bold text-slate-800 block">
                      iPhone 15 · Safari Mobile
                    </span>
                    <span className="text-[10.5px] text-slate-400">
                      IP: 14.161.12.89 · Hà Nội
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">1 ngày trước</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5.7 Tab Nhật ký quản trị */}
      {activeTab === "audit" && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-black text-slate-900 m-0">
              Nhật ký thao tác của quản trị viên (Admin Audit Log)
            </h2>
            <span className="text-xs text-slate-400">
              Ghi nhận tất cả thay đổi trên hồ sơ người dùng
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {userData.auditLogs?.map((log: any) => (
              <div
                key={log.id}
                className="py-3 flex items-start justify-between gap-3 hover:bg-slate-50/50 rounded-xl px-2"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#0062ff] text-xs">
                      {log.action}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="font-semibold text-slate-700">
                      {log.admin}
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs m-0">{log.detail}</p>
                </div>
                <span className="text-[11px] text-slate-400 font-mono shrink-0">
                  {log.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5.8 Tab Ghi chú nội bộ */}
      {activeTab === "notes" && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-black text-slate-900 m-0">
                Ghi chú nội bộ dành cho Admin
              </h2>
              <span className="text-xs text-slate-400">
                Người dùng không thể nhìn thấy các ghi chú này
              </span>
            </div>
          </div>

          {/* Form thêm ghi chú mới */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2.5">
            <label className="font-bold text-slate-800 text-xs block">
              Thêm ghi chú mới:
            </label>
            <textarea
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Nhập nội dung lưu ý, lịch sử liên hệ hoặc cảnh báo nội bộ về người dùng này..."
              rows={3}
              className="w-full p-3 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-[#0062ff] bg-white font-medium"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAddNote}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0062ff] hover:bg-blue-700 text-white font-bold text-xs cursor-pointer border-none shadow-md shadow-blue-500/20 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Lưu ghi chú</span>
              </button>
            </div>
          </div>

          {/* Danh sách ghi chú */}
          <div className="space-y-3">
            {userData.notes?.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Chưa có ghi chú nội bộ nào cho tài khoản này.
              </div>
            ) : (
              userData.notes?.map((n: any) => (
                <div
                  key={n.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">
                      {n.admin}
                    </span>
                    <span className="text-[10.5px] text-slate-400 font-mono">
                      {n.time}
                    </span>
                  </div>
                  <p className="text-slate-700 text-xs m-0 leading-relaxed">
                    {n.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: PREVIEW ẢNH ĐẠI DIỆN LỚN */}
      {/* ========================================================= */}
      <Modal
        open={isPreviewAvatarOpen}
        onCancel={() => setIsPreviewAvatarOpen(false)}
        footer={null}
        destroyOnHidden
        centered
        width={440}
        styles={{ body: { padding: 0 } }}
      >
        <div className="relative bg-slate-900 rounded-2xl overflow-hidden flex flex-col items-center">
          <div className="w-full flex items-center justify-between p-3.5 bg-gradient-to-b from-black/70 to-transparent absolute top-0 left-0 right-0 z-10">
            <span className="text-white font-bold text-xs truncate max-w-[300px]">
              {userData.name}
            </span>
            <button
              type="button"
              onClick={() => setIsPreviewAvatarOpen(false)}
              className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 text-white border-none cursor-pointer flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="w-full aspect-square bg-slate-950 flex items-center justify-center overflow-hidden">
            <img
              src={userData.avatar}
              alt={userData.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="w-full p-2.5 text-center text-[11px] text-slate-300 bg-slate-900/90">
            Ảnh đại diện tài khoản {userData.id}
          </div>
        </div>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 2: GỬI THÔNG BÁO CHO USER */}
      {/* ========================================================= */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <Mail className="w-4 h-4 text-[#0062ff]" />
            <span className="font-black text-slate-900 text-sm">
              Gửi thông báo tới {userData.name}
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
          onFinish={handleSendNotification}
          className="pt-2 text-xs"
        >
          <Form.Item label={<span className="font-bold text-slate-700">Kênh gửi</span>} name="type">
            <Radio.Group className="flex gap-4">
              <Radio value="IN_APP" className="text-xs">
                Thông báo trong ứng dụng
              </Radio>
              <Radio value="EMAIL" className="text-xs">
                Gửi qua Email ({userData.email})
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
            rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Nhập nội dung cần truyền tải tới người dùng..."
              className="rounded-xl text-xs"
            />
          </Form.Item>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsNotifyModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer bg-white"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0062ff] hover:bg-blue-700 text-white text-xs font-bold cursor-pointer border-none shadow-md shadow-blue-500/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gửi thông báo</span>
            </button>
          </div>
        </Form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 3: ĐẶT LẠI MẬT KHẨU */}
      {/* ========================================================= */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <KeyRound className="w-4 h-4 text-amber-500" />
            <span className="font-black text-slate-900 text-sm">
              Đặt lại mật khẩu cho {userData.name}
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
            <strong className="text-slate-900">{userData.email}</strong>. Toàn bộ phiên đăng nhập cũ sẽ bị thu hồi và người dùng sẽ nhận được thông báo bảo mật.
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
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer bg-white"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer border-none shadow-md shadow-amber-500/20"
            >
              Xác nhận đặt lại mật khẩu
            </button>
          </div>
        </Form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 4: CHỈNH SỬA THÔNG TIN CƠ BẢN */}
      {/* ========================================================= */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <Edit2 className="w-4 h-4 text-[#0062ff]" />
            <span className="font-black text-slate-900 text-sm">
              Chỉnh sửa thông tin cơ bản
            </span>
          </div>
        }
        open={isEditBasicInfoOpen}
        onCancel={() => setIsEditBasicInfoOpen(false)}
        footer={null}
        destroyOnHidden
        width={500}
      >
        <Form
          form={editInfoForm}
          layout="vertical"
          onFinish={handleSaveBasicInfo}
          className="pt-2 text-xs space-y-3"
        >
          <Form.Item
            label={<span className="font-bold text-slate-700">Họ và tên</span>}
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
            className="mb-1"
          >
            <Input className="rounded-xl text-xs h-9" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              label={<span className="font-bold text-slate-700">Email</span>}
              name="email"
              rules={[{ required: true, type: "email", message: "Email không hợp lệ" }]}
              className="mb-1"
            >
              <Input className="rounded-xl text-xs h-9" />
            </Form.Item>

            <Form.Item
              label={<span className="font-bold text-slate-700">Số điện thoại</span>}
              name="phone"
              rules={[{ required: true, message: "Vui lòng nhập SĐT" }]}
              className="mb-1"
            >
              <Input className="rounded-xl text-xs h-9" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              label={<span className="font-bold text-slate-700">Ngày sinh</span>}
              name="birthday"
              className="mb-1"
            >
              <Input className="rounded-xl text-xs h-9" />
            </Form.Item>

            <Form.Item
              label={<span className="font-bold text-slate-700">Giới tính</span>}
              name="gender"
              className="mb-1"
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
          </div>

          <Form.Item
            label={<span className="font-bold text-slate-700">Địa chỉ</span>}
            name="address"
            className="mb-2"
          >
            <Input className="rounded-xl text-xs h-9" />
          </Form.Item>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditBasicInfoOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer bg-white"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0062ff] hover:bg-blue-700 text-white text-xs font-bold cursor-pointer border-none shadow-md shadow-blue-500/20"
            >
              Lưu thay đổi
            </button>
          </div>
        </Form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 5: CHỈNH SỬA GHI CHÚ / QUOTE PROFILE */}
      {/* ========================================================= */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <Edit2 className="w-4 h-4 text-[#0062ff]" />
            <span className="font-black text-slate-900 text-sm">
              Chỉnh sửa lời giới thiệu / Ghi chú hiển thị
            </span>
          </div>
        }
        open={isEditQuoteOpen}
        onCancel={() => setIsEditQuoteOpen(false)}
        footer={null}
        destroyOnHidden
        width={440}
      >
        <div className="pt-2 space-y-3 text-xs">
          <label className="font-bold text-slate-700 block">
            Lời giới thiệu / Châm ngôn hiển thị trên Profile:
          </label>
          <textarea
            value={newQuoteText}
            onChange={(e) => setNewQuoteText(e.target.value)}
            rows={3}
            placeholder="Nhập câu giới thiệu ngắn..."
            className="w-full p-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-[#0062ff]"
          />
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditQuoteOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer bg-white"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSaveQuote}
              className="px-5 py-2 rounded-xl bg-[#0062ff] hover:bg-blue-700 text-white text-xs font-bold cursor-pointer border-none shadow-md shadow-blue-500/20"
            >
              Lưu ghi chú
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function UserDetailPage() {
  return (
    <App>
      <UserDetailContent />
    </App>
  );
}
