"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import {
  candidateService,
  type CandidateProfileData,
  type CandidateSkill,
} from "@/services/candidate.service";
import { authService } from "@/services/auth.service";
import {
  message,
  Switch,
  Select,
  Modal,
  Tag,
  Avatar,
  Tooltip,
  Progress,
  Button,
  Input,
  Radio,
  Divider,
  Alert,
  Popconfirm,
  Spin,
} from "antd";
import {
  User,
  Lock,
  Bell,
  Shield,
  Globe,
  Palette,
  Link2,
  Database,
  Trash2,
  Camera,
  Edit3,
  Save,
  X,
  Plus,
  ArrowRight,
  Headphones,
  Mail,
  Check,
  KeyRound,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Heart,
  ShieldCheck,
  Compass,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  Smartphone,
  Info,
  RefreshCw,
  LogOut,
} from "lucide-react";

// =========================================================================
// TAB TYPES
// =========================================================================
export type SettingsTab =
  | "account"
  | "security"
  | "notifications"
  | "privacy"
  | "language"
  | "appearance"
  | "integrations"
  | "data"
  | "delete";

export default function CandidateSettingsWorkspacePage() {
  const router = useRouter();
  const { user, setAuth, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // =========================================================================
  // 1. TÀI KHOẢN (ACCOUNT) STATE
  // =========================================================================
  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "Ứng viên Careza",
    email: user?.email || "candidate@careza.vn",
    phone: user?.phoneNumber || "0901234567",
    dob: "15/08/2000",
    gender: "Nam",
    address: "TP. Hồ Chí Minh, Việt Nam",
    bio: "Lập trình viên đam mê công nghệ, luôn mong muốn học hỏi và phát triển bản thân.",
    careerGoal: "Tìm kiếm cơ hội việc làm phù hợp và nâng cao năng lực chuyên môn",
  });

  const [skills, setSkills] = useState<string[]>([
    "React",
    "JavaScript",
    "TypeScript",
    "UI/UX",
    "Problem Solving",
  ]);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  // =========================================================================
  // 2. BẢO MẬT & ĐĂNG NHẬP (SECURITY) STATE
  // =========================================================================
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [isLogoutOtherSessionsOpen, setIsLogoutOtherSessionsOpen] = useState(false);

  // =========================================================================
  // 3. THÔNG BÁO (NOTIFICATIONS) STATE
  // =========================================================================
  const [notifSettings, setNotifSettings] = useState({
    jobAlerts: true,
    interviewAlerts: true,
    companyAlerts: true,
    systemAlerts: true,
    marketingEmails: false,
    inAppNotif: true,
    emailNotif: true,
  });

  // =========================================================================
  // 4. QUYỀN RIÊNG TƯ (PRIVACY) STATE
  // =========================================================================
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 1, // 1: Công khai, 0: Ẩn
    openToWork: true,
    hidePhoneUntilInterview: false,
    hideEmailPublicly: true,
    aiPersonalization: true,
  });
  const [isSavingPrivacy, setIsSavingPrivacy] = useState(false);

  // =========================================================================
  // 5. NGÔN NGỮ & KHU VỰC (LANGUAGE & REGION) STATE
  // =========================================================================
  const [localeSettings, setLocaleSettings] = useState({
    language: "vi",
    timezone: "Asia/Ho_Chi_Minh",
    dateFormat: "DD/MM/YYYY",
    currency: "VND",
  });

  // =========================================================================
  // 6. GIAO DIỆN (APPEARANCE) STATE
  // =========================================================================
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: "light", // 'light' | 'dark' | 'system'
    fontSize: "medium", // 'small' | 'medium' | 'large'
    reducedMotion: false,
  });

  // =========================================================================
  // 7. LIÊN KẾT TÀI KHOẢN (INTEGRATIONS) STATE
  // =========================================================================
  const [linkedAccounts, setLinkedAccounts] = useState({
    google: true,
    linkedin: false,
    github: false,
    facebook: false,
  });

  // =========================================================================
  // 8. QUẢN LÝ DỮ LIỆU & NEWSLETTER STATE
  // =========================================================================
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isExportingData, setIsExportingData] = useState(false);

  // =========================================================================
  // 9. XÓA TÀI KHOẢN (DELETE ACCOUNT) STATE
  // =========================================================================
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // =========================================================================
  // INITIAL LOAD: Load real data from Candidate Service & Local Storage
  // =========================================================================
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const res = await candidateService.getProfile();
        if (res?.data?.candidate) {
          const { profile: p, skills: sks } = res.data.candidate;
          setFormData((prev) => ({
            ...prev,
            fullName: user?.fullName || prev.fullName,
            email: user?.email || prev.email,
            phone: user?.phoneNumber || prev.phone,
            dob: p?.dateOfBirth ? p.dateOfBirth : prev.dob,
            gender: p?.gender === 1 ? "Nam" : p?.gender === 2 ? "Nữ" : "Khác",
            address: p?.address || prev.address,
            bio: p?.summary || prev.bio,
            careerGoal: p?.headline || prev.careerGoal,
          }));

          if (sks && sks.length > 0) {
            setSkills(sks.map((s: CandidateSkill) => s.skillName));
          }

          if (p) {
            setPrivacySettings((prev) => ({
              ...prev,
              profileVisibility: typeof p.profileVisibility === "number" ? p.profileVisibility : 1,
              openToWork: typeof p.openToWork === "boolean" ? p.openToWork : true,
            }));
          }
        }
      } catch {
        // Mock fallback if network error
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();

    // Load persisted settings from localStorage
    try {
      const savedNotifs = localStorage.getItem("careza_notif_settings");
      if (savedNotifs) setNotifSettings(JSON.parse(savedNotifs));

      const savedLocale = localStorage.getItem("careza_locale_settings");
      if (savedLocale) setLocaleSettings(JSON.parse(savedLocale));

      const savedAppearance = localStorage.getItem("careza_appearance_settings");
      if (savedAppearance) setAppearanceSettings(JSON.parse(savedAppearance));

      const savedLinks = localStorage.getItem("careza_linked_accounts");
      if (savedLinks) setLinkedAccounts(JSON.parse(savedLinks));
    } catch {
      // ignore storage errors
    }
  }, [user]);

  // =========================================================================
  // HANDLERS: TAB 1 - TÀI KHOẢN (ACCOUNT)
  // =========================================================================
  const handleSaveBasic = async () => {
    if (!formData.fullName.trim()) {
      message.error("Họ và tên không được để trống!");
      return;
    }
    setIsSavingAccount(true);
    try {
      // 1. Cập nhật profile qua candidateService
      await candidateService.updateProfile({
        address: formData.address,
        gender: formData.gender === "Nam" ? 1 : formData.gender === "Nữ" ? 2 : 0,
        dateOfBirth: formData.dob,
      });

      // 2. Đồng bộ Auth store
      if (user) {
        setAuth({
          ...user,
          fullName: formData.fullName,
          phoneNumber: formData.phone,
        });
      }

      setIsEditingBasic(false);
      message.success("Đã cập nhật thông tin cơ bản thành công!");
    } catch {
      message.error("Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại!");
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handleSaveBio = async () => {
    setIsSavingAccount(true);
    try {
      await candidateService.updateProfile({
        summary: formData.bio,
      });
      setIsEditingBio(false);
      message.success("Đã lưu giới thiệu bản thân thành công!");
    } catch {
      message.error("Không thể lưu giới thiệu bản thân!");
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handleSaveGoal = async () => {
    setIsSavingAccount(true);
    try {
      await candidateService.updateProfile({
        headline: formData.careerGoal,
      });
      setIsEditingGoal(false);
      message.success("Đã lưu mục tiêu nghề nghiệp thành công!");
    } catch {
      message.error("Không thể lưu mục tiêu nghề nghiệp!");
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handleAddSkill = async () => {
    const trimmed = newSkillInput.trim();
    if (!trimmed) return;
    if (skills.includes(trimmed)) {
      message.warning("Kỹ năng này đã tồn tại trong danh sách!");
      return;
    }

    try {
      await candidateService.addSkill({
        skillId: Date.now() % 10000,
        skillLevel: 3,
        yearsOfExperience: 1,
      });
      setSkills((prev) => [...prev, trimmed]);
      setNewSkillInput("");
      setIsAddingSkill(false);
      message.success(`Đã thêm kỹ năng "${trimmed}"!`);
    } catch {
      message.error("Không thể thêm kỹ năng lúc này!");
    }
  };

  const handleRemoveSkill = async (skillToRemove: string) => {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
    message.success(`Đã xóa kỹ năng "${skillToRemove}"`);
  };

  const handleSaveAllAccountSettings = async () => {
    setIsSavingAccount(true);
    try {
      await candidateService.updateProfile({
        headline: formData.careerGoal,
        summary: formData.bio,
        address: formData.address,
      });
      if (user) {
        setAuth({
          ...user,
          fullName: formData.fullName,
          phoneNumber: formData.phone,
        });
      }
      message.success("Đã lưu toàn bộ cài đặt tài khoản thành công!");
    } catch {
      message.error("Lỗi khi lưu dữ liệu!");
    } finally {
      setIsSavingAccount(false);
    }
  };

  // =========================================================================
  // HANDLERS: TAB 2 - BẢO MẬT (SECURITY)
  // =========================================================================
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.currentPassword) {
      message.error("Vui lòng nhập mật khẩu hiện tại!");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      message.error("Mật khẩu mới phải có tối thiểu 6 ký tự!");
      return;
    }
    if (passwordForm.newPassword === passwordForm.currentPassword) {
      message.error("Mật khẩu mới không được trùng với mật khẩu hiện tại!");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      message.error("Mật khẩu xác nhận không trùng khớp!");
      return;
    }

    setIsSubmittingPassword(true);
    try {
      await authService.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      message.success("Cập nhật mật khẩu thành công!");
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.errors?.old_password?.[0] ||
        err.response?.data?.errors?.new_password?.[0] ||
        err.response?.data?.message ||
        "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại.";
      message.error(errorMsg);
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleLogoutOtherSessions = () => {
    setIsLogoutOtherSessionsOpen(false);
    message.success("Đã đăng xuất khỏi tất cả các thiết bị khác thành công!");
  };

  // =========================================================================
  // HANDLERS: TAB 3 - THÔNG BÁO (NOTIFICATIONS)
  // =========================================================================
  const handleToggleNotif = (key: keyof typeof notifSettings, value: boolean) => {
    const updated = { ...notifSettings, [key]: value };
    setNotifSettings(updated);
    try {
      localStorage.setItem("careza_notif_settings", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleSaveNotifSettings = () => {
    try {
      localStorage.setItem("careza_notif_settings", JSON.stringify(notifSettings));
      message.success("Đã lưu cấu hình thông báo thành công!");
    } catch {
      message.error("Lỗi khi lưu cấu hình thông báo!");
    }
  };

  // =========================================================================
  // HANDLERS: TAB 4 - QUYỀN RIÊNG TƯ (PRIVACY)
  // =========================================================================
  const handleTogglePrivacy = async (key: keyof typeof privacySettings, val: any) => {
    const updated = { ...privacySettings, [key]: val };
    setPrivacySettings(updated);
    setIsSavingPrivacy(true);

    try {
      // Đồng bộ trực tiếp vào candidateService profile nếu là profileVisibility hoặc openToWork
      if (key === "profileVisibility" || key === "openToWork") {
        await candidateService.updateProfile({
          profileVisibility: key === "profileVisibility" ? (val ? 1 : 0) : updated.profileVisibility,
          openToWork: key === "openToWork" ? val : updated.openToWork,
        });
      }
      localStorage.setItem("careza_privacy_settings", JSON.stringify(updated));
      message.success("Đã cập nhật quyền riêng tư!");
    } catch {
      message.error("Không thể lưu cấu hình quyền riêng tư!");
    } finally {
      setIsSavingPrivacy(false);
    }
  };

  // =========================================================================
  // HANDLERS: TAB 5 - NGÔN NGỮ & KHU VỰC
  // =========================================================================
  const handleSaveLocale = (newSettings: typeof localeSettings) => {
    setLocaleSettings(newSettings);
    try {
      localStorage.setItem("careza_locale_settings", JSON.stringify(newSettings));
      message.success("Đã cập nhật ngôn ngữ & khu vực thành công!");
    } catch {
      message.error("Lỗi khi lưu cài đặt ngôn ngữ!");
    }
  };

  // =========================================================================
  // HANDLERS: TAB 6 - GIAO DIỆN (APPEARANCE)
  // =========================================================================
  const handleSaveAppearance = (newSettings: typeof appearanceSettings) => {
    setAppearanceSettings(newSettings);
    try {
      localStorage.setItem("careza_appearance_settings", JSON.stringify(newSettings));
      message.success("Đã áp dụng tùy chỉnh giao diện!");
    } catch {
      message.error("Lỗi khi lưu cài đặt giao diện!");
    }
  };

  // =========================================================================
  // HANDLERS: TAB 7 - LIÊN KẾT TÀI KHOẢN (INTEGRATIONS)
  // =========================================================================
  const handleToggleSocialLink = (provider: keyof typeof linkedAccounts) => {
    const isCurrentlyLinked = linkedAccounts[provider];

    if (isCurrentlyLinked) {
      Modal.confirm({
        title: "Hủy liên kết tài khoản?",
        content: `Bạn có chắc chắn muốn ngắt kết nối với tài khoản ${provider.toUpperCase()} không? Bạn sẽ không thể sử dụng tài khoản này để đăng nhập nhanh.`,
        okText: "Hủy liên kết",
        cancelText: "Giữ lại",
        okButtonProps: { danger: true },
        onOk: () => {
          const updated = { ...linkedAccounts, [provider]: false };
          setLinkedAccounts(updated);
          localStorage.setItem("careza_linked_accounts", JSON.stringify(updated));
          message.success(`Đã hủy liên kết với ${provider.toUpperCase()}`);
        },
      });
    } else {
      const updated = { ...linkedAccounts, [provider]: true };
      setLinkedAccounts(updated);
      localStorage.setItem("careza_linked_accounts", JSON.stringify(updated));
      message.success(`Đã liên kết thành công với tài khoản ${provider.toUpperCase()}!`);
    }
  };

  // =========================================================================
  // HANDLERS: TAB 8 - QUẢN LÝ DỮ LIỆU (DATA MANAGEMENT)
  // =========================================================================
  const handleExportData = () => {
    setIsExportingData(true);
    setTimeout(() => {
      try {
        const exportPayload = {
          exportDate: new Date().toISOString(),
          user: user || { fullName: formData.fullName, email: formData.email },
          profile: formData,
          skills: skills,
          privacySettings: privacySettings,
          notificationSettings: notifSettings,
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `careza-profile-data-${Date.now()}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();

        message.success("Đã xuất dữ liệu hồ sơ cá nhân (.JSON) thành công!");
      } catch {
        message.error("Có lỗi xảy ra khi xuất dữ liệu!");
      } finally {
        setIsExportingData(false);
      }
    }, 800);
  };

  const handleClearCache = () => {
    try {
      localStorage.removeItem("careza_search_history");
      localStorage.removeItem("careza_recent_job_views");
      message.success("Đã xóa lịch sử tìm kiếm và bộ nhớ đệm thành công!");
    } catch {
      message.error("Không thể dọn dẹp bộ nhớ đệm!");
    }
  };

  // =========================================================================
  // HANDLERS: TAB 9 - XÓA TÀI KHOẢN (DELETE ACCOUNT)
  // =========================================================================
  const handleConfirmDeleteAccount = () => {
    const requiredConfirmation = "XÓA TÀI KHOẢN";
    if (deleteConfirmText.trim() !== requiredConfirmation && deleteConfirmText.trim() !== formData.email) {
      message.error(`Vui lòng nhập chính xác cụm từ "${requiredConfirmation}" hoặc email của bạn để xác nhận!`);
      return;
    }
    if (!deletePassword) {
      message.error("Vui lòng nhập mật khẩu xác nhận!");
      return;
    }

    setIsDeletingAccount(true);
    setTimeout(() => {
      setIsDeletingAccount(false);
      setIsDeleteModalOpen(false);
      logout();
      message.success("Tài khoản của bạn đã được xóa thành công. Tạm biệt bạn!");
      router.push("/");
    }, 1200);
  };

  const handleSubscribeNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) {
      message.error("Vui lòng nhập địa chỉ email!");
      return;
    }
    message.success("Đăng ký nhận bản tin Careza thành công!");
    setNewsletterEmail("");
  };

  // =========================================================================
  // NAV ITEMS CONFIGURATION
  // =========================================================================
  const NAV_ITEMS: { key: SettingsTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { key: "account", label: "Tài khoản", icon: <User className="w-4 h-4" /> },
    { key: "security", label: "Bảo mật & đăng nhập", icon: <Lock className="w-4 h-4" /> },
    { key: "notifications", label: "Thông báo", icon: <Bell className="w-4 h-4" /> },
    { key: "privacy", label: "Quyền riêng tư", icon: <Shield className="w-4 h-4" /> },
    { key: "language", label: "Ngôn ngữ & khu vực", icon: <Globe className="w-4 h-4" /> },
    { key: "appearance", label: "Giao diện", icon: <Palette className="w-4 h-4" /> },
    { key: "integrations", label: "Liên kết tài khoản", icon: <Link2 className="w-4 h-4" /> },
    { key: "data", label: "Quản lý dữ liệu", icon: <Database className="w-4 h-4" /> },
    { key: "delete", label: "Xóa tài khoản", icon: <Trash2 className="w-4 h-4 text-rose-500" /> },
  ];

  return (
    <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-5 md:px-6 pt-2 pb-3 flex-1 flex flex-col h-full overflow-hidden bg-[#F7FAFF]">
      {/* Scrollbar styling kín đáo cho 3 cột cuộn độc lập */}
      <style jsx global>{`
        .cai-dat-scroll {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }
        .cai-dat-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .cai-dat-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .cai-dat-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 9999px;
        }
        .cai-dat-scroll::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>

      {/* ======================================================== */}
      {/* 1. BREADCRUMB NỀN TRANG NGOÀI KHUNG                       */}
      {/* ======================================================== */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium py-1 shrink-0 mb-1.5">
        <Link href="/" className="hover:text-[#0062ff] transition-colors">
          Trang chủ
        </Link>
        <span className="text-slate-300">/</span>
        <Link href="/ung-vien/ho-so" className="hover:text-[#0062ff] transition-colors">
          Ứng viên
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-800 font-semibold">Cài đặt tài khoản</span>
      </div>

      {/* ======================================================== */}
      {/* 2. MAIN LAYOUT 3 CỘT (CUỘN ĐỘC LẬP RIÊNG BIỆT)            */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 flex-1 min-h-0 h-full overflow-hidden">
        {/* ==================== CỘT TRÁI: LEFT SETTINGS NAV ==================== */}
        <div className="lg:col-span-3 h-full overflow-y-auto cai-dat-scroll space-y-2.5 pr-1 pb-4">
          <div className="px-1 pb-1">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 m-0 tracking-tight">
              Cài đặt tài khoản
            </h1>
          </div>

          <div className="bg-white rounded-2xl p-1.5 border border-[#E5ECF6] shadow-2xs space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveTab(item.key)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-[13px] font-semibold text-left transition-all cursor-pointer relative ${isActive
                    ? "bg-blue-50/90 text-[#0062ff] font-bold border border-blue-200/80 shadow-2xs"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Indicator bar xanh bên trái khi active */}
                    {isActive && (
                      <span className="absolute left-1 top-2.5 bottom-2.5 w-1 bg-[#0062ff] rounded-full" />
                    )}
                    <span className={isActive ? "text-[#0062ff]" : "text-slate-400"}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.key === "delete" && (
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                      Nguy hiểm
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Card trang trí: Cùng Careza phát triển sự nghiệp */}
          <div className="bg-gradient-to-br from-[#ebf3ff] to-[#f5f9ff] rounded-2xl p-3.5 border border-[#d6e6fe] shadow-2xs space-y-2 relative overflow-hidden">
            <div className="space-y-0.5 relative z-10">
              <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 m-0 leading-snug">
                Cùng Careza phát triển sự nghiệp
              </h4>

            </div>

            <Link href="/viec-lam" className="block pt-0.5 relative z-10">
              <button
                type="button"
                className="w-full py-1.5 px-3 rounded-xl bg-white hover:bg-slate-50 text-[#0062ff] font-bold text-xs border border-blue-200 shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <span>Khám phá cơ hội</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </Link>
          </div>
        </div>

        {/* ==================== CỘT GIỮA: MAIN SETTINGS CONTENT ==================== */}
        <div className="lg:col-span-6 h-full overflow-y-auto cai-dat-scroll space-y-3.5 pr-1 pb-6">
          {/* ========================================================================= */}
          {/* TAB 1: TÀI KHOẢN (ACCOUNT) */}
          {/* ========================================================================= */}
          {activeTab === "account" && (
            <div className="space-y-3.5">
              {/* Header Profile Overview Card: Nền xanh nhạt #EAF3FF, viền #C9DEFF, chữ navy đậm, gọn chiều cao */}
              <div className="bg-[#EAF3FF] rounded-2xl p-3 sm:p-3.5 border border-[#C9DEFF] shadow-2xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-white text-[#0062ff] border border-[#C9DEFF] flex items-center justify-center shrink-0 shadow-2xs">
                    <User className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm sm:text-base font-bold text-[#0A2540] m-0 truncate">
                        Thông tin cá nhân
                      </h2>
                      <span className="bg-white/90 text-[#0062ff] text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#C9DEFF] shadow-2xs shrink-0">
                        Tài khoản
                      </span>
                    </div>
                    <span className="text-[11px] text-[#334E68] block truncate mt-0.5 font-medium">
                      Quản lý thông tin định danh và hồ sơ cá nhân của bạn
                    </span>
                  </div>
                </div>

                {/* Profile Summary: Avatar + Thông tin trên cùng 1 hàng */}
                <div className="flex items-center gap-2.5 shrink-0 pl-2.5 border-l border-[#C9DEFF]">
                  <Avatar
                    size={40}
                    className="bg-[#0062ff] text-white font-bold text-sm shadow-2xs shrink-0 ring-2 ring-white"
                    src={user?.avatarUrl || undefined}
                  >
                    {formData.fullName ? formData.fullName.charAt(0) : "U"}
                  </Avatar>
                  <div className="text-left hidden sm:block">
                    <h3 className="text-xs font-bold text-[#0A2540] m-0 truncate max-w-[130px]">
                      {formData.fullName}
                    </h3>
                    <span className="text-[10.5px] text-[#0062ff] font-semibold block leading-tight">
                      Ứng viên Careza
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => message.info("Đã mở trình chọn ảnh đại diện từ thiết bị")}
                    className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-blue-50 text-[#0062ff] text-xs font-semibold border border-[#C9DEFF] shadow-2xs flex items-center gap-1 cursor-pointer transition-colors"
                    title="Tối đa 5MB"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#0062ff]" />
                    <span className="hidden md:inline">Đổi ảnh</span>
                  </button>
                </div>
              </div>

              {/* Section Thông tin cơ bản */}
              <div className="bg-white rounded-2xl p-5 border border-[#E5ECF6] shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#0062ff]" />
                    <h3 className="text-sm sm:text-[15px] font-black text-slate-900 m-0">
                      Thông tin cơ bản
                    </h3>
                  </div>

                  {!isEditingBasic ? (
                    <button
                      type="button"
                      onClick={() => setIsEditingBasic(true)}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:text-[#0062ff] hover:border-blue-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Chỉnh sửa</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingBasic(false)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        disabled={isSavingAccount}
                        onClick={handleSaveBasic}
                        className="px-3.5 py-1.5 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{isSavingAccount ? "Đang lưu..." : "Lưu"}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Grid Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Họ và tên */}
                  <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                      Họ và tên
                    </span>
                    {isEditingBasic ? (
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-[#0062ff]"
                      />
                    ) : (
                      <span className="text-xs sm:text-[13px] font-bold text-slate-800 block truncate">
                        {formData.fullName}
                      </span>
                    )}
                  </div>

                  {/* Email */}
                  <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                        Email
                      </span>
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-1.5 py-0.2 rounded-md border border-emerald-200">
                        Đã xác thực
                      </span>
                    </div>
                    {isEditingBasic ? (
                      <input
                        type="email"
                        disabled
                        value={formData.email}
                        className="w-full bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-500 cursor-not-allowed"
                        title="Email đăng nhập không thể thay đổi trực tiếp"
                      />
                    ) : (
                      <span className="text-xs sm:text-[13px] font-bold text-slate-800 block truncate">
                        {formData.email}
                      </span>
                    )}
                  </div>

                  {/* Số điện thoại */}
                  <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                        Số điện thoại
                      </span>
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-1.5 py-0.2 rounded-md border border-emerald-200">
                        Đã kích hoạt
                      </span>
                    </div>
                    {isEditingBasic ? (
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-[#0062ff]"
                      />
                    ) : (
                      <span className="text-xs sm:text-[13px] font-bold text-slate-800 block truncate">
                        {formData.phone}
                      </span>
                    )}
                  </div>

                  {/* Ngày sinh & Giới tính */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                        Ngày sinh
                      </span>
                      {isEditingBasic ? (
                        <input
                          type="text"
                          value={formData.dob}
                          placeholder="DD/MM/YYYY"
                          onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-[#0062ff]"
                        />
                      ) : (
                        <span className="text-xs sm:text-[13px] font-bold text-slate-800 block truncate">
                          {formData.dob}
                        </span>
                      )}
                    </div>

                    <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                        Giới tính
                      </span>
                      {isEditingBasic ? (
                        <select
                          value={formData.gender}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-[#0062ff]"
                        >
                          <option value="Nam">Nam</option>
                          <option value="Nữ">Nữ</option>
                          <option value="Khác">Khác</option>
                        </select>
                      ) : (
                        <span className="text-xs sm:text-[13px] font-bold text-slate-800 block truncate">
                          {formData.gender}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Địa chỉ full width */}
                  <div className="sm:col-span-2 p-3 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                      Địa chỉ
                    </span>
                    {isEditingBasic ? (
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-[#0062ff]"
                      />
                    ) : (
                      <span className="text-xs sm:text-[13px] font-bold text-slate-800 block truncate">
                        {formData.address}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Section Giới thiệu bản thân */}
              <div className="bg-white rounded-2xl p-5 border border-[#E5ECF6] shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-[#0062ff]" />
                    <h3 className="text-sm sm:text-[15px] font-black text-slate-900 m-0">
                      Giới thiệu bản thân
                    </h3>
                  </div>

                  {!isEditingBio ? (
                    <button
                      type="button"
                      onClick={() => setIsEditingBio(true)}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:text-[#0062ff] hover:border-blue-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Chỉnh sửa</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingBio(false)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        disabled={isSavingAccount}
                        onClick={handleSaveBio}
                        className="px-3.5 py-1.5 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{isSavingAccount ? "Đang lưu..." : "Lưu"}</span>
                      </button>
                    </div>
                  )}
                </div>

                {isEditingBio ? (
                  <div className="space-y-1.5">
                    <textarea
                      rows={3}
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-[13px] text-slate-800 leading-relaxed focus:outline-hidden focus:border-[#0062ff]"
                      placeholder="Viết một vài dòng giới thiệu về bản thân..."
                    />
                    <div className="text-right text-[11px] text-slate-400">
                      {formData.bio.length}/500
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-normal m-0 bg-slate-50/60 p-3.5 rounded-xl border border-slate-100">
                      {formData.bio}
                    </p>
                  </div>
                )}
              </div>

              {/* Section Mục tiêu nghề nghiệp */}
              <div className="bg-white rounded-2xl p-5 border border-[#E5ECF6] shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#0062ff]" />
                    <h3 className="text-sm sm:text-[15px] font-black text-slate-900 m-0">
                      Mục tiêu nghề nghiệp
                    </h3>
                  </div>

                  {!isEditingGoal ? (
                    <button
                      type="button"
                      onClick={() => setIsEditingGoal(true)}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:text-[#0062ff] hover:border-blue-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Chỉnh sửa</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingGoal(false)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        disabled={isSavingAccount}
                        onClick={handleSaveGoal}
                        className="px-3.5 py-1.5 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{isSavingAccount ? "Đang lưu..." : "Lưu"}</span>
                      </button>
                    </div>
                  )}
                </div>

                {isEditingGoal ? (
                  <input
                    type="text"
                    value={formData.careerGoal}
                    onChange={(e) => setFormData({ ...formData, careerGoal: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-[13px] font-bold text-slate-800 focus:outline-hidden focus:border-[#0062ff]"
                  />
                ) : (
                  <div className="space-y-1.5">
                    <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 flex items-center justify-between">
                      <span className="text-xs sm:text-[13px] font-bold text-slate-800">
                        {formData.careerGoal}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block">
                      Giúp chúng tôi gợi ý việc làm và nội dung phù hợp với bạn hơn.
                    </span>
                  </div>
                )}
              </div>

              {/* Kỹ năng nổi bật */}
              <div className="bg-white rounded-2xl p-5 border border-[#E5ECF6] shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#0062ff]" />
                    <h3 className="text-sm sm:text-[14.5px] font-black text-slate-900 m-0">
                      Kỹ năng nổi bật
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAddingSkill(true)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:text-[#0062ff] text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Thêm</span>
                  </button>
                </div>

                {/* Skill Chips */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="bg-[#f0f4fc] text-slate-800 font-semibold text-xs px-3 py-1.5 rounded-xl border border-slate-200/80 inline-flex items-center gap-1.5"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {isAddingSkill && (
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddSkill();
                      }}
                      placeholder="Nhập tên kỹ năng mới (ví dụ: React, UI Design)..."
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-[#0062ff]"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-3 py-1.5 bg-[#0062ff] text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Lưu
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingSkill(false)}
                      className="px-3 py-1.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Hủy
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={isSavingAccount}
                  onClick={handleSaveAllAccountSettings}
                  className="px-6 py-2.5 bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs sm:text-[13px] rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {isSavingAccount ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
                <button
                  type="button"
                  onClick={() => message.info("Đã hoàn tác thay đổi chưa lưu.")}
                  className="px-6 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-[13px] rounded-xl border border-slate-200 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: BẢO MẬT & ĐĂNG NHẬP (SECURITY) */}
          {/* ========================================================================= */}
          {activeTab === "security" && (
            <div className="space-y-4.5">
              <div className="bg-white rounded-2xl p-5 border border-[#E5ECF6] shadow-2xs space-y-4">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 m-0">
                    Đổi mật khẩu
                  </h2>
                  <p className="text-xs text-slate-500 m-0 mt-0.5">
                    Để bảo vệ tài khoản, hãy sử dụng mật khẩu mạnh với ít nhất 6 ký tự.
                  </p>
                </div>

                {/* Form Đổi mật khẩu */}
                <form onSubmit={handleUpdatePassword} className="space-y-3.5 pt-1 max-w-md">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      Mật khẩu hiện tại <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                      }
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-[#0062ff]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      Mật khẩu mới <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                      }
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-[#0062ff]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      Xác nhận mật khẩu mới <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                      }
                      placeholder="Nhập lại mật khẩu mới"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-[#0062ff]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingPassword}
                    className="px-5 py-2.5 bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    {isSubmittingPassword ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                  </button>
                </form>
              </div>

              {/* Phiên đăng nhập */}
              <div className="bg-white rounded-2xl p-5 border border-[#E5ECF6] shadow-2xs space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 m-0">
                      Thiết bị & Phiên đăng nhập
                    </h3>
                    <p className="text-xs text-slate-500 m-0 mt-0.5">
                      Danh sách các thiết bị hiện đang đăng nhập vào tài khoản của bạn.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsLogoutOtherSessionsOpen(true)}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                  >
                    Đăng xuất phiên khác
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#0062ff] flex items-center justify-center">
                        <Laptop className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">
                          Chrome trên Windows (Thiết bị hiện tại)
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          Việt Nam • Đang hoạt động ngay bây giờ
                        </span>
                      </div>
                    </div>
                    <span className="text-[10.5px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Phiên này
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50/60 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-700 block">
                          Safari trên iPhone (iOS)
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          Hà Nội, Việt Nam • 2 ngày trước
                        </span>
                      </div>
                    </div>
                    <span className="text-[10.5px] font-semibold text-slate-500">
                      Đã lưu
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Đăng xuất phiên khác */}
              <Modal
                title="Đăng xuất khỏi các thiết bị khác?"
                open={isLogoutOtherSessionsOpen}
                onOk={handleLogoutOtherSessions}
                onCancel={() => setIsLogoutOtherSessionsOpen(false)}
                okText="Đăng xuất ngay"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
              >
                <p className="text-xs text-slate-600">
                  Thao tác này sẽ chấm dứt mọi phiên làm việc trên các thiết bị hoặc trình duyệt khác. Bạn sẽ phải đăng nhập lại trên các thiết bị đó.
                </p>
              </Modal>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: THÔNG BÁO (NOTIFICATIONS) */}
          {/* ========================================================================= */}
          {activeTab === "notifications" && (
            <div className="space-y-4.5">
              <div className="bg-white rounded-2xl p-5 border border-[#E5ECF6] shadow-2xs space-y-4">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 m-0">
                    Cài đặt thông báo
                  </h2>
                  <p className="text-xs text-slate-500 m-0 mt-0.5">
                    Tùy chỉnh các loại thông báo bạn muốn nhận trên ứng dụng và qua email.
                  </p>
                </div>

                <div className="divide-y divide-slate-100">
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <span className="text-xs sm:text-[13px] font-bold text-slate-800 block">
                        Thông báo việc làm phù hợp
                      </span>
                      <span className="text-xs text-slate-500 block mt-0.5">
                        Nhận thông báo khi có công việc mới khớp với hồ sơ và tiêu chí của bạn.
                      </span>
                    </div>
                    <Switch
                      checked={notifSettings.jobAlerts}
                      onChange={(checked) => handleToggleNotif("jobAlerts", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <span className="text-xs sm:text-[13px] font-bold text-slate-800 block">
                        Thông báo lịch phỏng vấn & nhắc nhở
                      </span>
                      <span className="text-xs text-slate-500 block mt-0.5">
                        Nhắc nhở trước 24h và 1h khi có lịch phỏng vấn hoặc lời mời từ NTD.
                      </span>
                    </div>
                    <Switch
                      checked={notifSettings.interviewAlerts}
                      onChange={(checked) => handleToggleNotif("interviewAlerts", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <span className="text-xs sm:text-[13px] font-bold text-slate-800 block">
                        Thông báo công ty đang theo dõi
                      </span>
                      <span className="text-xs text-slate-500 block mt-0.5">
                        Cập nhật khi các doanh nghiệp bạn quan tâm đăng tải tin tuyển dụng mới.
                      </span>
                    </div>
                    <Switch
                      checked={notifSettings.companyAlerts}
                      onChange={(checked) => handleToggleNotif("companyAlerts", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <span className="text-xs sm:text-[13px] font-bold text-slate-800 block">
                        Thông báo hệ thống & bảo mật
                      </span>
                      <span className="text-xs text-slate-500 block mt-0.5">
                        Cảnh báo bảo mật tài khoản, thông báo bảo trì và chính sách mới.
                      </span>
                    </div>
                    <Switch
                      checked={notifSettings.systemAlerts}
                      onChange={(checked) => handleToggleNotif("systemAlerts", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <span className="text-xs sm:text-[13px] font-bold text-slate-800 block">
                        Bản tin nghề nghiệp & Bí quyết phỏng vấn
                      </span>
                      <span className="text-xs text-slate-500 block mt-0.5">
                        Gửi email định kỳ về xu hướng mức lương và kinh nghiệm ứng tuyển.
                      </span>
                    </div>
                    <Switch
                      checked={notifSettings.marketingEmails}
                      onChange={(checked) => handleToggleNotif("marketingEmails", checked)}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSaveNotifSettings}
                    className="px-5 py-2.5 bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Lưu cấu hình thông báo
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: QUYỀN RIÊNG TƯ (PRIVACY) */}
          {/* ========================================================================= */}
          {activeTab === "privacy" && (
            <div className="space-y-4.5">
              <div className="bg-white rounded-2xl p-5 border border-[#E5ECF6] shadow-2xs space-y-4">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 m-0">
                    Quyền riêng tư & Tìm kiếm
                  </h2>
                  <p className="text-xs text-slate-500 m-0 mt-0.5">
                    Kiểm soát cách nhà tuyển dụng và hệ thống tương tác với hồ sơ của bạn.
                  </p>
                </div>

                <div className="divide-y divide-slate-100">
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <span className="text-xs sm:text-[13px] font-bold text-slate-800 block">
                        Cho phép nhà tuyển dụng tìm thấy hồ sơ của bạn
                      </span>
                      <span className="text-xs text-slate-500 block mt-0.5">
                        Hồ sơ của bạn sẽ xuất hiện trên danh bạ ứng viên chất lượng cao của Careza.
                      </span>
                    </div>
                    <Switch
                      checked={privacySettings.profileVisibility === 1}
                      onChange={(checked) => handleTogglePrivacy("profileVisibility", checked ? 1 : 0)}
                    />
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <span className="text-xs sm:text-[13px] font-bold text-slate-800 block">
                        Bật trạng thái “Sẵn sàng tìm việc” (Open to Work)
                      </span>
                      <span className="text-xs text-slate-500 block mt-0.5">
                        Gắn huy hiệu ưu tiên để nhà tuyển dụng chủ động gửi thư mời làm việc.
                      </span>
                    </div>
                    <Switch
                      checked={privacySettings.openToWork}
                      onChange={(checked) => handleTogglePrivacy("openToWork", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <span className="text-xs sm:text-[13px] font-bold text-slate-800 block">
                        Ẩn số điện thoại với NTD chưa gửi lời mời
                      </span>
                      <span className="text-xs text-slate-500 block mt-0.5">
                        Chỉ hiển thị số điện thoại khi bạn đồng ý ứng tuyển hoặc phản hồi phỏng vấn.
                      </span>
                    </div>
                    <Switch
                      checked={privacySettings.hidePhoneUntilInterview}
                      onChange={(checked) => handleTogglePrivacy("hidePhoneUntilInterview", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <span className="text-xs sm:text-[13px] font-bold text-slate-800 block">
                        Cá nhân hóa việc làm bằng AI Careza
                      </span>
                      <span className="text-xs text-slate-500 block mt-0.5">
                        Cho phép thuật toán AI phân tích kỹ năng và hành vi tìm việc để gợi ý công việc chính xác nhất.
                      </span>
                    </div>
                    <Switch
                      checked={privacySettings.aiPersonalization}
                      onChange={(checked) => handleTogglePrivacy("aiPersonalization", checked)}
                    />
                  </div>
                </div>

                <Alert
                  type="info"
                  showIcon
                  className="rounded-xl text-xs"
                  title="Dữ liệu của bạn được bảo vệ nghiêm ngặt theo chính sách bảo mật thông tin người dùng Careza."
                />
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: NGÔN NGỮ & KHU VỰC (LANGUAGE & REGION) */}
          {/* ========================================================================= */}
          {activeTab === "language" && (
            <div className="bg-white rounded-2xl p-5 border border-[#E5ECF6] shadow-2xs space-y-4">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 m-0">
                  Ngôn ngữ & Khu vực
                </h2>
                <p className="text-xs text-slate-500 m-0 mt-0.5">
                  Tùy chỉnh ngôn ngữ hiển thị, múi giờ và định dạng thời gian.
                </p>
              </div>

              <div className="space-y-4 pt-1 max-w-lg">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Ngôn ngữ hiển thị (Language)
                  </label>
                  <Select
                    value={localeSettings.language}
                    onChange={(val) => handleSaveLocale({ ...localeSettings, language: val })}
                    className="w-full"
                    options={[
                      { value: "vi", label: "Tiếng Việt (Mặc định)" },
                      { value: "en", label: "English (United States)" },
                    ]}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Múi giờ (Timezone)
                  </label>
                  <Select
                    value={localeSettings.timezone}
                    onChange={(val) => handleSaveLocale({ ...localeSettings, timezone: val })}
                    className="w-full"
                    options={[
                      { value: "Asia/Ho_Chi_Minh", label: "(GMT+07:00) Hà Nội, TP.HCM, Bangkok" },
                      { value: "Asia/Singapore", label: "(GMT+08:00) Singapore, Kuala Lumpur" },
                      { value: "Asia/Tokyo", label: "(GMT+09:00) Tokyo, Seoul" },
                      { value: "UTC", label: "(GMT+00:00) Universal Coordinated Time (UTC)" },
                    ]}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Định dạng ngày tháng
                  </label>
                  <Select
                    value={localeSettings.dateFormat}
                    onChange={(val) => handleSaveLocale({ ...localeSettings, dateFormat: val })}
                    className="w-full"
                    options={[
                      { value: "DD/MM/YYYY", label: "DD/MM/YYYY (ví dụ: 01/09/2026)" },
                      { value: "MM/DD/YYYY", label: "MM/DD/YYYY (ví dụ: 09/01/2026)" },
                      { value: "YYYY-MM-DD", label: "YYYY-MM-DD (ví dụ: 2026-09-01)" },
                    ]}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Đơn vị tiền tệ mặc định
                  </label>
                  <Select
                    value={localeSettings.currency}
                    onChange={(val) => handleSaveLocale({ ...localeSettings, currency: val })}
                    className="w-full"
                    options={[
                      { value: "VND", label: "Việt Nam Đồng (VND - ₫)" },
                      { value: "USD", label: "Đô la Mỹ (USD - $)" },
                    ]}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: GIAO DIỆN (APPEARANCE) */}
          {/* ========================================================================= */}
          {activeTab === "appearance" && (
            <div className="bg-white rounded-2xl p-5 border border-[#E5ECF6] shadow-2xs space-y-4">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 m-0">
                  Giao diện & Trải nghiệm
                </h2>
                <p className="text-xs text-slate-500 m-0 mt-0.5">
                  Tùy chỉnh chủ đề sáng/tối và mức độ tương phản cho giao diện Careza.
                </p>
              </div>

              <div className="space-y-4 pt-1">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">
                    Chủ đề giao diện (Theme)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => handleSaveAppearance({ ...appearanceSettings, theme: "light" })}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between h-24 cursor-pointer transition-all ${appearanceSettings.theme === "light"
                        ? "border-[#0062ff] bg-blue-50/50 shadow-2xs"
                        : "border-slate-200 hover:bg-slate-50"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">Giao diện Sáng</span>
                        {appearanceSettings.theme === "light" && (
                          <CheckCircle2 className="w-4 h-4 text-[#0062ff]" />
                        )}
                      </div>
                      <div className="h-6 w-full bg-white rounded border border-slate-200 shadow-2xs flex items-center px-2">
                        <div className="h-2 w-12 bg-blue-500 rounded-full" />
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSaveAppearance({ ...appearanceSettings, theme: "dark" })}
                      className={`p - 3 rounded - xl border text - left flex flex - col justify - between h - 24 cursor - pointer transition - all ${appearanceSettings.theme === "dark"
                        ? "border-[#0062ff] bg-blue-50/50 shadow-2xs"
                        : "border-slate-200 hover:bg-slate-50"
                        } `}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">Giao diện Tối</span>
                        {appearanceSettings.theme === "dark" && (
                          <CheckCircle2 className="w-4 h-4 text-[#0062ff]" />
                        )}
                      </div>
                      <div className="h-6 w-full bg-slate-900 rounded border border-slate-800 flex items-center px-2">
                        <div className="h-2 w-12 bg-blue-400 rounded-full" />
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSaveAppearance({ ...appearanceSettings, theme: "system" })}
                      className={`p - 3 rounded - xl border text - left flex flex - col justify - between h - 24 cursor - pointer transition - all ${appearanceSettings.theme === "system"
                        ? "border-[#0062ff] bg-blue-50/50 shadow-2xs"
                        : "border-slate-200 hover:bg-slate-50"
                        } `}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">Theo hệ thống</span>
                        {appearanceSettings.theme === "system" && (
                          <CheckCircle2 className="w-4 h-4 text-[#0062ff]" />
                        )}
                      </div>
                      <div className="h-6 w-full bg-gradient-to-r from-white to-slate-900 rounded border border-slate-300 flex items-center px-2">
                        <div className="h-2 w-6 bg-blue-500 rounded-full" />
                      </div>
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs sm:text-[13px] font-bold text-slate-800 block">
                        Giảm hiệu ứng chuyển động (Reduce Motion)
                      </span>
                      <span className="text-xs text-slate-500 block mt-0.5">
                        Tối ưu cho thiết bị cấu hình yếu hoặc khi muốn trải nghiệm mượt mà hơn.
                      </span>
                    </div>
                    <Switch
                      checked={appearanceSettings.reducedMotion}
                      onChange={(checked) =>
                        handleSaveAppearance({ ...appearanceSettings, reducedMotion: checked })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 7: LIÊN KẾT TÀI KHOẢN (INTEGRATIONS) */}
          {/* ========================================================================= */}
          {activeTab === "integrations" && (
            <div className="bg-white rounded-2xl p-5 border border-[#E5ECF6] shadow-2xs space-y-4">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 m-0">
                  Liên kết tài khoản
                </h2>
                <p className="text-xs text-slate-500 m-0 mt-0.5">
                  Kết nối với các nền tảng xã hội và nghề nghiệp để đăng nhập nhanh chóng, an toàn.
                </p>
              </div>

              <div className="divide-y divide-slate-100">
                {/* Google */}
                <div className="flex items-center justify-between py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center font-black text-base border border-red-100">
                      G
                    </div>
                    <div>
                      <span className="text-xs sm:text-[13px] font-bold text-slate-800 block">
                        Google
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        {linkedAccounts.google ? formData.email : "Chưa kết nối"}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleSocialLink("google")}
                    className={`px - 3.5 py - 1.5 rounded - xl text - xs font - bold cursor - pointer transition - colors ${linkedAccounts.google
                      ? "bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-600 border border-slate-200"
                      : "bg-[#0062ff] text-white hover:bg-blue-700"
                      } `}
                  >
                    {linkedAccounts.google ? "Hủy liên kết" : "Liên kết"}
                  </button>
                </div>

                {/* LinkedIn */}
                <div className="flex items-center justify-between py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0077b5] flex items-center justify-center font-black text-base border border-blue-100">
                      in
                    </div>
                    <div>
                      <span className="text-xs sm:text-[13px] font-bold text-slate-800 block">
                        LinkedIn
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        {linkedAccounts.linkedin ? "Đã liên kết hồ sơ LinkedIn" : "Chưa kết nối"}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleSocialLink("linkedin")}
                    className={`px - 3.5 py - 1.5 rounded - xl text - xs font - bold cursor - pointer transition - colors ${linkedAccounts.linkedin
                      ? "bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-600 border border-slate-200"
                      : "bg-[#0062ff] text-white hover:bg-blue-700"
                      } `}
                  >
                    {linkedAccounts.linkedin ? "Hủy liên kết" : "Liên kết"}
                  </button>
                </div>

                {/* GitHub */}
                <div className="flex items-center justify-between py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center font-black text-base border border-slate-200">
                      GH
                    </div>
                    <div>
                      <span className="text-xs sm:text-[13px] font-bold text-slate-800 block">
                        GitHub
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        {linkedAccounts.github ? "Đã liên kết tài khoản GitHub" : "Chưa kết nối"}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleSocialLink("github")}
                    className={`px - 3.5 py - 1.5 rounded - xl text - xs font - bold cursor - pointer transition - colors ${linkedAccounts.github
                      ? "bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-600 border border-slate-200"
                      : "bg-[#0062ff] text-white hover:bg-blue-700"
                      } `}
                  >
                    {linkedAccounts.github ? "Hủy liên kết" : "Liên kết"}
                  </button>
                </div>

                {/* Facebook */}
                <div className="flex items-center justify-between py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-base border border-blue-100">
                      f
                    </div>
                    <div>
                      <span className="text-xs sm:text-[13px] font-bold text-slate-800 block">
                        Facebook
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        {linkedAccounts.facebook ? "Đã liên kết" : "Chưa kết nối"}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleSocialLink("facebook")}
                    className={`px - 3.5 py - 1.5 rounded - xl text - xs font - bold cursor - pointer transition - colors ${linkedAccounts.facebook
                      ? "bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-600 border border-slate-200"
                      : "bg-[#0062ff] text-white hover:bg-blue-700"
                      } `}
                  >
                    {linkedAccounts.facebook ? "Hủy liên kết" : "Liên kết"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 8: QUẢN LÝ DỮ LIỆU (DATA MANAGEMENT) */}
          {/* ========================================================================= */}
          {activeTab === "data" && (
            <div className="bg-white rounded-2xl p-5 border border-[#E5ECF6] shadow-2xs space-y-4">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 m-0">
                  Quản lý dữ liệu cá nhân
                </h2>
                <p className="text-xs text-slate-500 m-0 mt-0.5">
                  Bạn có toàn quyền kiểm soát, sao lưu và dọn dẹp dữ liệu của mình trên Careza.
                </p>
              </div>

              <div className="space-y-3.5 pt-1">
                {/* Export Data */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-[#0062ff]" />
                      <span className="text-xs sm:text-[13.5px] font-bold text-slate-800">
                        Xuất dữ liệu hồ sơ (.JSON)
                      </span>
                    </div>
                    <p className="text-[11.5px] text-slate-500 m-0">
                      Tải về bản sao lưu toàn bộ thông tin cá nhân, kỹ năng và lịch sử hoạt động.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isExportingData}
                    onClick={handleExportData}
                    className="px-4 py-2 bg-white hover:bg-blue-50 text-[#0062ff] font-bold text-xs rounded-xl border border-blue-200 shadow-2xs shrink-0 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isExportingData ? "Đang xuất..." : "Tải xuống dữ liệu"}</span>
                  </button>
                </div>

                {/* Clear Cache */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-slate-700" />
                      <span className="text-xs sm:text-[13.5px] font-bold text-slate-800">
                        Xóa lịch sử tìm kiếm & Cache tạm
                      </span>
                    </div>
                    <p className="text-[11.5px] text-slate-500 m-0">
                      Xóa lịch sử các từ khóa tìm việc và dữ liệu tạm thời trên trình duyệt này.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleClearCache}
                    className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-2xs shrink-0 cursor-pointer transition-colors"
                  >
                    Dọn dẹp bộ nhớ
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 9: XÓA TÀI KHOẢN (DELETE ACCOUNT) */}
          {/* ========================================================================= */}
          {activeTab === "delete" && (
            <div className="bg-white rounded-2xl p-5 border border-rose-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-rose-100">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-rose-600 m-0">
                    Vùng nguy hiểm: Xóa tài khoản
                  </h2>
                  <p className="text-xs text-slate-500 m-0 mt-0.5">
                    Thao tác này sẽ xóa vĩnh viễn tài khoản và toàn bộ dữ liệu của bạn trên Careza.
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-700 leading-relaxed bg-rose-50/50 p-4 rounded-xl border border-rose-100">
                <p className="font-bold text-rose-800 m-0">
                  Khi thực hiện xóa tài khoản:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 m-0">
                  <li>Hồ sơ cá nhân và tất cả các CV đính kèm sẽ bị xóa hoàn toàn.</li>
                  <li>Lịch sử ứng tuyển, tin nhắn và lịch hẹn phỏng vấn sẽ bị hủy bỏ.</li>
                  <li>Bạn sẽ không thể khôi phục lại tài khoản này sau khi xóa.</li>
                </ul>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-[13px] rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Tiến hành yêu cầu xóa tài khoản</span>
                </button>
              </div>

              {/* Modal Xác nhận xóa 2 lớp */}
              <Modal
                title={
                  <div className="flex items-center gap-2 text-rose-600 font-black text-base">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Xác nhận xóa tài khoản vĩnh viễn</span>
                  </div>
                }
                open={isDeleteModalOpen}
                onCancel={() => setIsDeleteModalOpen(false)}
                footer={null}
              >
                <div className="space-y-4 py-2">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Để đảm bảo an toàn, vui lòng gõ đúng cụm từ <strong className="text-rose-600">XÓA TÀI KHOẢN</strong> hoặc địa chỉ email của bạn (<strong className="text-slate-800">{formData.email}</strong>) và nhập mật khẩu đăng nhập.
                  </p>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      Nhập xác nhận:
                    </label>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder='Gõ "XÓA TÀI KHOẢN" hoặc email của bạn'
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-rose-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      Mật khẩu của bạn:
                    </label>
                    <input
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="Nhập mật khẩu hiện tại"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-rose-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="button"
                      disabled={isDeletingAccount}
                      onClick={handleConfirmDeleteAccount}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer shadow-2xs"
                    >
                      {isDeletingAccount ? "Đang xóa..." : "Xác nhận xóa vĩnh viễn"}
                    </button>
                  </div>
                </div>
              </Modal>
            </div>
          )}

          {/* Dải thông tin bổ trợ đặt ở đáy cột giữa */}
          <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-[#E5ECF6] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
            <div className="space-y-0.5">
              <h4 className="text-xs sm:text-[13px] font-black text-slate-900 m-0">
                Tài khoản của bạn, nhiều cơ hội hơn
              </h4>
              <p className="text-[11px] text-slate-500 font-normal m-0">
                Quản lý thông tin dễ dàng – Trải nghiệm an toàn và bảo mật mỗi ngày
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-600">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0062ff]" />
                <span>An toàn</span>
              </span>
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-[#0062ff]" />
                <span>Cá nhân hóa</span>
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-[#0062ff]" />
                <span>Đồng hành</span>
              </span>
            </div>
          </div>
        </div>

        {/* ==================== CỘT PHẢI: RIGHT SUPPORT PANEL ==================== */}
        <div className="lg:col-span-3 h-full overflow-y-auto cai-dat-scroll space-y-3 pr-1 pb-4">
          {/* Card 1: Hồ sơ của bạn (Clean White Card) */}
          <div className="bg-white rounded-2xl p-4 sm:p-4.5 border border-[#E5ECF6] shadow-2xs space-y-3">
            <h3 className="text-sm font-black text-slate-900 m-0 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Hồ sơ của bạn</span>
              <span className="text-xs font-bold text-[#0062ff]">75%</span>
            </h3>

            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <Progress
                  type="circle"
                  percent={75}
                  size={50}
                  strokeColor="#0062ff"
                  railColor="#e2e8f0"
                  strokeWidth={7}
                  format={(percent) => (
                    <span className="text-xs font-bold text-slate-800">{percent}%</span>
                  )}
                />
              </div>

              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Hồ sơ khá đầy đủ
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5 leading-tight">
                  Hoàn thiện thêm để nhận nhiều cơ hội việc làm hơn!
                </span>
              </div>
            </div>

            <Link href="/ung-vien/ho-so" className="block pt-1">
              <button
                type="button"
                className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0062ff] font-bold text-xs border border-blue-200/80 shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Xem chi tiết hồ sơ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>

          {/* Card 2: Gợi ý cho bạn */}
          <div className="bg-white rounded-2xl p-4 sm:p-4.5 border border-[#E5ECF6] shadow-2xs space-y-2.5">
            <h3 className="text-sm font-black text-slate-900 m-0 pb-2 border-b border-slate-100 flex items-center gap-1.5">
              <span>💡</span>
              <span>Gợi ý hoàn thiện</span>
            </h3>

            <ul className="space-y-2 text-xs text-slate-600 pl-0 list-none m-0 leading-relaxed font-medium">
              <li className="flex items-start gap-2">
                <span className="text-[#0062ff] font-bold">✓</span>
                <span>Cập nhật ảnh đại diện chuyên nghiệp</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#0062ff] font-bold">✓</span>
                <span>Bổ sung kỹ năng và chứng chỉ mới</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#0062ff] font-bold">✓</span>
                <span>Viết thêm giới thiệu bản thân ngắn gọn</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#0062ff] font-bold">✓</span>
                <span>Bật thông báo việc làm mới định kỳ</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Bạn cần hỗ trợ? */}
          <div className="bg-white rounded-2xl p-4 sm:p-4.5 border border-[#E5ECF6] shadow-2xs space-y-3">
            <div>
              <h4 className="text-sm font-black text-slate-900 m-0">Bạn cần hỗ trợ?</h4>
              <p className="text-xs text-slate-500 font-normal m-0 mt-0.5 leading-relaxed">
                Đội ngũ Careza luôn sẵn sàng hỗ trợ bạn.
              </p>
            </div>
            <div className="flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => message.info("Tổng đài hỗ trợ Careza: 1900 6868")}
                className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Liên hệ hỗ trợ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0">
                <Headphones className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Card 4: Đăng ký nhận bản tin */}
          <div className="bg-white rounded-2xl p-4 sm:p-4.5 border border-[#E5ECF6] shadow-2xs space-y-2.5">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 m-0">
                Nhận bản tin tuyển dụng
              </h4>
            </div>



            <form onSubmit={handleSubscribeNewsletter} className="flex items-center gap-2 pt-0.5">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Nhập email của bạn"
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-[#0062ff]"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#0062ff] text-white font-bold text-xs rounded-xl hover:bg-blue-700 cursor-pointer shadow-2xs shrink-0 border-none"
              >
                Đăng ký
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
