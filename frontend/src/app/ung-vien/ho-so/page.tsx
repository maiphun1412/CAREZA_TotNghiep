"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import {
  candidateService,
  type CandidateProfileData,
  type CandidateEducation,
  type CandidateExperience,
  type CandidateSkill,
} from "@/services/candidate.service";
import {
  Form,
  Input,
  Button,
  Select,
  Switch,
  DatePicker,
  Radio,
  Modal,
  Tag,
  App,
  Spin,
  Progress,
  Upload,
  Popconfirm,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  EditOutlined,
  CameraOutlined,
  CheckCircleFilled,
  SafetyCertificateFilled,
  GlobalOutlined,
  LinkedinOutlined,
  GithubOutlined,
  PlusOutlined,
  DeleteOutlined,
  BookOutlined,
  BankOutlined,
  TrophyOutlined,
  BulbFilled,
  ArrowRightOutlined,
  CompassOutlined,
  AimOutlined,
  CheckCircleOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { TextArea } = Input;

// Danh mục kỹ năng mẫu phổ biến
const POPULAR_SKILLS = [
  { id: 1, name: "ReactJS" },
  { id: 2, name: "Node.js" },
  { id: 3, name: "TypeScript" },
  { id: 4, name: "JavaScript" },
  { id: 5, name: "UI/UX Design" },
  { id: 6, name: "Figma" },
  { id: 7, name: "Python" },
  { id: 8, name: "SQL Server" },
  { id: 9, name: "Project Management" },
  { id: 10, name: "DevOps" },
];

export default function CandidateProfilePage() {
  const { message } = App.useApp();
  const { user, setAuth } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "general" | "bio" | "skills" | "education" | "experience" | "links"
  >("general");

  // Dữ liệu hồ sơ thật từ backend
  const [profile, setProfile] = useState<CandidateProfileData | null>(null);
  const [educations, setEducations] = useState<CandidateEducation[]>([]);
  const [experiences, setExperiences] = useState<CandidateExperience[]>([]);
  const [skills, setSkills] = useState<CandidateSkill[]>([]);

  // Modal edit Profile cơ bản
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editProfileForm] = Form.useForm();
  const [savingProfile, setSavingProfile] = useState(false);

  // Modal edit Mục tiêu nghề nghiệp
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalForm] = Form.useForm();

  // Modal Học vấn
  const [isEduModalOpen, setIsEduModalOpen] = useState(false);
  const [editingEdu, setEditingEdu] = useState<CandidateEducation | null>(null);
  const [eduForm] = Form.useForm();

  // Modal Kinh nghiệm
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<CandidateExperience | null>(null);
  const [expForm] = Form.useForm();

  // Modal Kỹ năng
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [skillForm] = Form.useForm();

  // Load thông tin hồ sơ từ backend
  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = await candidateService.getProfile();
      const data = response.data?.candidate;
      if (data) {
        setProfile(data.profile || null);
        setEducations(data.educations || []);
        setExperiences(data.experiences || []);
        setSkills(data.skills || []);
      }
    } catch (error) {
      console.error("Lỗi tải thông tin hồ sơ:", error);
      message.error("Không thể tải thông tin hồ sơ. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Tính toán phần trăm hoàn thiện hồ sơ
  const calculateCompletion = () => {
    let score = 30; // Có tài khoản cơ bản
    if (profile?.headline) score += 10;
    if (profile?.summary) score += 10;
    if (profile?.dateOfBirth) score += 10;
    if (profile?.address) score += 10;
    if (skills.length > 0) score += 10;
    if (educations.length > 0) score += 10;
    if (experiences.length > 0) score += 10;
    return Math.min(100, score);
  };

  const completionPercent = calculateCompletion();

  // 1. Xử lý cập nhật thông tin chung
  const handleSaveProfile = async (values: any) => {
    setSavingProfile(true);
    try {
      const payload: Partial<CandidateProfileData> = {
        headline: values.headline || null,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.toISOString() : null,
        gender: values.gender !== undefined ? Number(values.gender) : null,
        address: values.address || null,
      };

      await candidateService.updateProfile(payload);
      message.success("Cập nhật thông tin cá nhân thành công!");
      setIsEditProfileOpen(false);
      loadProfile();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Cập nhật thất bại.");
    } finally {
      setSavingProfile(false);
    }
  };

  // 2. Xử lý cập nhật Mục tiêu nghề nghiệp
  const handleSaveGoal = async (values: any) => {
    setSavingProfile(true);
    try {
      await candidateService.updateProfile({
        summary: values.summary || null,
      });
      message.success("Cập nhật mục tiêu nghề nghiệp thành công!");
      setIsGoalModalOpen(false);
      loadProfile();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Cập nhật thất bại.");
    } finally {
      setSavingProfile(false);
    }
  };

  // 3. Xử lý Học vấn
  const handleSaveEducation = async (values: any) => {
    try {
      const payload = {
        schoolName: values.schoolName,
        majorName: values.majorName,
        degreeName: values.degreeName || null,
        startDate: values.dateRange?.[0] ? values.dateRange[0].toISOString() : null,
        endDate: values.dateRange?.[1] ? values.dateRange[1].toISOString() : null,
        description: values.description || null,
      };

      if (editingEdu) {
        await candidateService.updateEducation(editingEdu.educationId, payload);
        message.success("Cập nhật học vấn thành công!");
      } else {
        await candidateService.addEducation(payload);
        message.success("Thêm học vấn thành công!");
      }
      setIsEduModalOpen(false);
      loadProfile();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Thao tác thất bại.");
    }
  };

  const handleDeleteEducation = async (id: string) => {
    try {
      await candidateService.deleteEducation(id);
      message.success("Đã xóa mục học vấn");
      loadProfile();
    } catch (error) {
      message.error("Không thể xóa học vấn");
    }
  };

  // 4. Xử lý Kinh nghiệm
  const handleSaveExperience = async (values: any) => {
    try {
      const payload = {
        companyName: values.companyName,
        positionName: values.positionName,
        startDate: values.dateRange?.[0] ? values.dateRange[0].toISOString() : new Date().toISOString(),
        endDate: values.isCurrentJob ? null : values.dateRange?.[1] ? values.dateRange[1].toISOString() : null,
        isCurrentJob: !!values.isCurrentJob,
        description: values.description || null,
      };

      if (editingExp) {
        await candidateService.updateExperience(editingExp.experienceId, payload);
        message.success("Cập nhật kinh nghiệm thành công!");
      } else {
        await candidateService.addExperience(payload);
        message.success("Thêm kinh nghiệm thành công!");
      }
      setIsExpModalOpen(false);
      loadProfile();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Thao tác thất bại.");
    }
  };

  const handleDeleteExperience = async (id: string) => {
    try {
      await candidateService.deleteExperience(id);
      message.success("Đã xóa kinh nghiệm làm việc");
      loadProfile();
    } catch (error) {
      message.error("Không thể xóa kinh nghiệm");
    }
  };

  // 5. Xử lý Kỹ năng
  const handleAddSkill = async (values: any) => {
    try {
      await candidateService.addSkill({
        skillId: Number(values.skillId),
        skillLevel: Number(values.skillLevel || 3),
        yearsOfExperience: values.yearsOfExperience ? Number(values.yearsOfExperience) : undefined,
      });
      message.success("Thêm kỹ năng thành công!");
      setIsSkillModalOpen(false);
      skillForm.resetFields();
      loadProfile();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Thao tác thất bại.");
    }
  };

  const handleDeleteSkill = async (id: number) => {
    try {
      await candidateService.deleteSkill(id);
      message.success("Đã xóa kỹ năng");
      loadProfile();
    } catch (error) {
      message.error("Không thể xóa kỹ năng");
    }
  };

  const genderLabel = (gender: number | null | undefined) => {
    if (gender === 1) return "Nam";
    if (gender === 2) return "Nữ";
    if (gender === 3) return "Khác";
    return "Chưa cập nhật";
  };

  const usernameDisplay = user?.email?.split("@")[0] || "ungvien";

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-800 relative overflow-hidden pb-16">
      {/* ================= SVG LƯỢN SÓNG 3 LỚP ĐA TẦNG (CHUẨN 100% ẢNH MẪU) ================= */}
      <div className="absolute top-0 left-0 right-0 h-44 sm:h-52 md:h-56 pointer-events-none z-0 overflow-hidden select-none">
        <svg
          viewBox="0 0 1440 220"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-fill preserve-3d"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Gradient lớp sóng xanh sáng ở giữa */}
            <linearGradient id="waveBlueLight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.95" />
            </linearGradient>

            {/* Gradient lớp sóng tím xanh đậm góc phải */}
            <linearGradient id="wavePurpleDeep" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="45%" stopColor="#3b82f6" />
              <stop offset="85%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>

            {/* Gradient nền tổng thể phía sau */}
            <linearGradient id="waveBgSky" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f0f7ff" stopOpacity="0.1" />
              <stop offset="60%" stopColor="#e0f2fe" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Lớp 1: Nền trời xanh nhạt lan toả từ phải */}
          <path
            d="M500 0 L1440 0 L1440 180 C1300 200 1150 140 1000 90 C850 40 680 60 500 0 Z"
            fill="url(#waveBgSky)"
          />

          {/* Lớp 2: Làn sóng xanh dương Careza uốn lượn mềm mại */}
          <path
            d="M750 0 L1440 0 L1440 220 C1320 220 1200 160 1120 100 C1040 40 920 60 750 0 Z"
            fill="url(#waveBlueLight)"
          />

          {/* Lớp 3: Đỉnh sóng tím xanh đậm ở góc phải trên cùng */}
          <path
            d="M1020 0 L1440 0 L1440 220 C1340 220 1250 140 1180 80 C1120 30 1070 10 1020 0 Z"
            fill="url(#wavePurpleDeep)"
          />
        </svg>

        {/* Khẩu hiệu 3 dòng bên trong sóng tím xanh */}
        <div className="absolute top-5 right-6 sm:right-10 md:right-14 lg:right-20 text-right z-10 hidden sm:block">
          <div className="text-white font-black tracking-wider text-[11px] sm:text-xs leading-[1.3] uppercase select-none drop-shadow-md">
            <span className="block text-blue-100 opacity-90 text-[10px] sm:text-[11px]">VÌ NHỮNG +</span>
            <span className="block text-white text-[12px] sm:text-[13.5px] font-black tracking-widest my-0.5">GIÁ TRỊ TỐT ĐẸP</span>
            <span className="block text-blue-100 opacity-90 text-[10px] sm:text-[11px]">HƠN MỖI NGÀY</span>
          </div>
        </div>
      </div>

      {/* SÓNG PASTEL Ở GÓC DƯỚI TRÁI */}
      <div className="absolute bottom-0 left-0 w-80 h-64 bg-gradient-to-tr from-blue-300/30 via-blue-200/15 to-transparent rounded-tr-[180px] pointer-events-none z-0" />

      {/* Import font nghệ thuật Caveat cho slogan */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        .font-handwriting { font-family: 'Caveat', cursive, sans-serif; }
      `}} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 relative z-10">
        {/* ================= TOP HEADER & BREADCRUMB ================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1.5">
              <Link href="/" className="hover:text-primary transition-colors">Tổng quan</Link>
              <span>›</span>
              <span className="text-slate-600">Thông tin cá nhân</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Thông tin cá nhân
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Quản lý thông tin cá nhân để nhà tuyển dụng hiểu bạn hơn
            </p>
          </div>

          {/* Slogan trang trí Careza */}
          <div className="hidden lg:flex items-center gap-2 mr-28 xl:mr-36 pt-1">
            <span className="font-handwriting text-3xl xl:text-4xl text-[#1d63ed] font-bold rotate-[-4deg] select-none flex items-center gap-1.5 drop-shadow-sm">
              <span>Good Jobs</span>
              <span className="text-amber-400 text-2xl">🌙</span>
              <span className="text-amber-400 text-2xl">✨</span>
              <span className="text-slate-400 text-xl font-normal">+</span>
              <span>Greater Stories</span>
            </span>
          </div>
        </div>

        {/* ================= 2-COLUMN MAIN CONTENT ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ================= CỘT TRÁI (70-75%) ================= */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. HERO PROFILE CARD */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100/90 shadow-xl shadow-blue-500/5 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Avatar lớn */}
                <div className="relative group shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-blue-50 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center text-blue-600 font-black text-3xl">
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserOutlined />
                    )}
                  </div>
                  <button
                    onClick={() => {
                      editProfileForm.setFieldsValue({
                        headline: profile?.headline,
                        gender: profile?.gender,
                        dateOfBirth: profile?.dateOfBirth ? dayjs(profile.dateOfBirth) : null,
                        address: profile?.address,
                      });
                      setIsEditProfileOpen(true);
                    }}
                    title="Đổi ảnh đại diện"
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:bg-blue-700 transition-transform hover:scale-110 cursor-pointer"
                  >
                    <CameraOutlined className="text-sm" />
                  </button>
                </div>

                {/* Thông tin chính */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                      {user?.fullName || "Ứng viên Careza"}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200/60">
                      Ứng viên
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-3.5">
                    <p className="italic text-slate-600 line-clamp-1">
                      {profile?.headline ? `"${profile.headline}"` : "“Không ngừng học hỏi, không ngừng phát triển”"}
                    </p>
                    <button
                      onClick={() => {
                        editProfileForm.setFieldsValue({
                          headline: profile?.headline,
                          gender: profile?.gender,
                          dateOfBirth: profile?.dateOfBirth ? dayjs(profile.dateOfBirth) : null,
                          address: profile?.address,
                        });
                        setIsEditProfileOpen(true);
                      }}
                      className="text-slate-400 hover:text-primary transition-colors cursor-pointer"
                      title="Chỉnh sửa châm ngôn"
                    >
                      <EditOutlined className="text-xs" />
                    </button>
                  </div>

                  {/* Chips liên hệ nhanh */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 font-medium">
                    <div className="flex items-center gap-2 truncate">
                      <MailOutlined className="text-slate-400" />
                      <span className="truncate">{user?.email || "Chưa cập nhật email"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <PhoneOutlined className="text-slate-400" />
                      <span>{user?.phoneNumber || "Chưa cập nhật SĐT"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarOutlined className="text-slate-400" />
                      <span>
                        {profile?.dateOfBirth
                          ? dayjs(profile.dateOfBirth).format("DD/MM/YYYY")
                          : "15/06/2000"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <EnvironmentOutlined className="text-slate-400" />
                      <span className="truncate">{profile?.address || "TP. Hồ Chí Minh"}</span>
                    </div>
                  </div>
                </div>

                {/* Nút Đổi ảnh đại diện */}
                <div className="sm:self-start shrink-0">
                  <Button
                    icon={<CameraOutlined />}
                    onClick={() => {
                      editProfileForm.setFieldsValue({
                        headline: profile?.headline,
                        gender: profile?.gender,
                        dateOfBirth: profile?.dateOfBirth ? dayjs(profile.dateOfBirth) : null,
                        address: profile?.address,
                      });
                      setIsEditProfileOpen(true);
                    }}
                    className="border-blue-200 text-blue-600 hover:bg-blue-50 font-semibold rounded-xl h-10 px-4"
                  >
                    Đổi ảnh đại diện
                  </Button>
                </div>
              </div>
            </div>

            {/* 2. HORIZONTAL TABS */}
            <div className="bg-white rounded-2xl p-2 border border-slate-100 shadow-sm flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { key: "general", label: "Thông tin chung" },
                { key: "bio", label: "Giới thiệu bản thân" },
                { key: "skills", label: `Kỹ năng (${skills.length})` },
                { key: "education", label: `Học vấn (${educations.length})` },
                { key: "experience", label: `Kinh nghiệm (${experiences.length})` },
                { key: "links", label: "Liên kết" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === tab.key
                      ? "bg-blue-50 text-primary shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 3. NỘI DUNG TỪNG TAB */}
            {loading ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
                <Spin size="large" />
                <p className="text-xs text-slate-400 mt-3">Đang tải dữ liệu hồ sơ...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* TAB 1: THÔNG TIN CHUNG */}
                {activeTab === "general" && (
                  <>
                    {/* Card Thông tin cơ bản */}
                    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-base font-bold text-slate-900">Thông tin cơ bản</h3>
                        <Button
                          type="link"
                          icon={<EditOutlined />}
                          onClick={() => {
                            editProfileForm.setFieldsValue({
                              headline: profile?.headline,
                              gender: profile?.gender ?? 2,
                              dateOfBirth: profile?.dateOfBirth ? dayjs(profile.dateOfBirth) : null,
                              address: profile?.address,
                            });
                            setIsEditProfileOpen(true);
                          }}
                          className="font-bold text-blue-600 hover:text-blue-700 p-0 flex items-center gap-1"
                        >
                          Chỉnh sửa
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100">
                          <label className="text-[11px] font-semibold text-slate-400 block mb-1 uppercase tracking-wider">Họ và tên</label>
                          <p className="text-sm font-bold text-slate-800">{user?.fullName || "Chưa cập nhật"}</p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center justify-between">
                          <div>
                            <label className="text-[11px] font-semibold text-slate-400 block mb-1 uppercase tracking-wider">Ngày sinh</label>
                            <p className="text-sm font-bold text-slate-800">
                              {profile?.dateOfBirth ? dayjs(profile.dateOfBirth).format("DD/MM/YYYY") : "15/06/2000"}
                            </p>
                          </div>
                          <CalendarOutlined className="text-slate-400 text-base" />
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100">
                          <label className="text-[11px] font-semibold text-slate-400 block mb-1 uppercase tracking-wider">Giới tính</label>
                          <p className="text-sm font-bold text-slate-800">{genderLabel(profile?.gender ?? 2)}</p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100">
                          <label className="text-[11px] font-semibold text-slate-400 block mb-1 uppercase tracking-wider">Số điện thoại</label>
                          <p className="text-sm font-bold text-slate-800">{user?.phoneNumber || "0901 234 567"}</p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100">
                          <label className="text-[11px] font-semibold text-slate-400 block mb-1 uppercase tracking-wider">Email</label>
                          <p className="text-sm font-bold text-slate-800 truncate">{user?.email}</p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center justify-between">
                          <div>
                            <label className="text-[11px] font-semibold text-slate-400 block mb-1 uppercase tracking-wider">Địa chỉ hiện tại</label>
                            <p className="text-sm font-bold text-slate-800">{profile?.address || "Quận 1, TP. Hồ Chí Minh"}</p>
                          </div>
                          <EnvironmentOutlined className="text-slate-400 text-base" />
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100">
                          <label className="text-[11px] font-semibold text-slate-400 block mb-1 uppercase tracking-wider">Địa chỉ thường trú</label>
                          <p className="text-sm font-bold text-slate-800">{profile?.address || "Quận 1, TP. Hồ Chí Minh"}</p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center justify-between">
                          <div>
                            <label className="text-[11px] font-semibold text-slate-400 block mb-1 uppercase tracking-wider">Website cá nhân / LinkedIn</label>
                            <a
                              href="https://linkedin.com"
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm font-bold text-blue-600 hover:underline truncate block max-w-[200px]"
                            >
                              https://linkedin.com/in/{usernameDisplay}
                            </a>
                          </div>
                          <LinkOutlined className="text-blue-500 text-base" />
                        </div>
                      </div>
                    </div>

                    {/* Card Mục tiêu nghề nghiệp */}
                    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                          <span>Mục tiêu nghề nghiệp</span>
                        </h3>
                        <Button
                          type="link"
                          icon={<EditOutlined />}
                          onClick={() => {
                            goalForm.setFieldsValue({
                              summary: profile?.summary || "Mong muốn được làm việc trong môi trường chuyên nghiệp, có cơ hội học hỏi và phát triển kỹ năng chuyên môn, đóng góp giá trị cho công ty và hướng tới vị trí cao hơn trong 3–5 năm tới.",
                            });
                            setIsGoalModalOpen(true);
                          }}
                          className="font-bold text-blue-600 hover:text-blue-700 p-0 flex items-center gap-1"
                        >
                          Chỉnh sửa
                        </Button>
                      </div>

                      <div className="flex items-start gap-4 p-4 rounded-2xl bg-blue-50/40 border border-blue-100/60">
                        <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-blue-600 flex items-center justify-center shrink-0">
                          <AimOutlined className="text-xl" />
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed pt-0.5">
                          {profile?.summary ||
                            "Mong muốn được làm việc trong môi trường chuyên nghiệp, có cơ hội học hỏi và phát triển kỹ năng chuyên môn, đóng góp giá trị cho công ty và hướng tới vị trí cao hơn trong 3–5 năm tới."}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* TAB 2: GIỚI THIỆU BẢN THÂN */}
                {activeTab === "bio" && (
                  <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-900">Giới thiệu tổng quan</h3>
                      <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => {
                          goalForm.setFieldsValue({ summary: profile?.summary });
                          setIsGoalModalOpen(true);
                        }}
                        className="bg-primary font-bold rounded-xl"
                      >
                        Chỉnh sửa Bio
                      </Button>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      {profile?.summary || "Chưa có thông tin giới thiệu bản thân. Bấm Chỉnh sửa Bio để cập nhật ngay!"}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60">
                        <span className="text-xs text-slate-400 block mb-1">Vị trí hiện tại</span>
                        <span className="text-sm font-bold text-slate-800">{profile?.currentPosition || "Chuyên viên phát triển"}</span>
                      </div>
                      <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60">
                        <span className="text-xs text-slate-400 block mb-1">Kinh nghiệm</span>
                        <span className="text-sm font-bold text-slate-800">{profile?.yearsOfExperience ? `${profile.yearsOfExperience} năm` : "2+ năm"}</span>
                      </div>
                      <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60">
                        <span className="text-xs text-slate-400 block mb-1">Trạng thái tìm việc</span>
                        <span className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircleFilled /> Sẵn sàng nhận việc
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: KỸ NĂNG */}
                {activeTab === "skills" && (
                  <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">Kỹ năng chuyên môn</h3>
                        <p className="text-xs text-slate-400">Thêm các kỹ năng bạn tự tin nhất để ghi điểm với nhà tuyển dụng</p>
                      </div>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsSkillModalOpen(true)}
                        className="bg-primary font-bold rounded-xl"
                      >
                        Thêm kỹ năng
                      </Button>
                    </div>

                    {skills.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {skills.map((skill) => (
                          <div
                            key={skill.skillId}
                            className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 flex items-center justify-between group hover:border-blue-200 transition-colors"
                          >
                            <div>
                              <span className="text-sm font-bold text-slate-800 block">{skill.skillName}</span>
                              <span className="text-xs text-blue-600 font-semibold">
                                {skill.skillLevel === 5
                                  ? "Chuyên gia"
                                  : skill.skillLevel === 4
                                  ? "Thành thạo"
                                  : skill.skillLevel === 3
                                  ? "Khá"
                                  : "Cơ bản"}
                                {skill.yearsOfExperience ? ` • ${skill.yearsOfExperience} năm kinh nghiệm` : ""}
                              </span>
                            </div>
                            <Popconfirm
                              title="Xóa kỹ năng này?"
                              onConfirm={() => handleDeleteSkill(skill.skillId)}
                              okText="Xóa"
                              cancelText="Hủy"
                            >
                              <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              />
                            </Popconfirm>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <TrophyOutlined className="text-3xl text-slate-300 mb-2" />
                        <p className="text-sm font-bold text-slate-600">Chưa có kỹ năng nào</p>
                        <p className="text-xs text-slate-400 mt-1 mb-4">Bổ sung kỹ năng để tăng 3x cơ hội nhận phỏng vấn</p>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsSkillModalOpen(true)} className="bg-primary">
                          Thêm kỹ năng đầu tiên
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 4: HỌC VẤN */}
                {activeTab === "education" && (
                  <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">Học vấn & Bằng cấp</h3>
                        <p className="text-xs text-slate-400">Trường đại học, cao đẳng hoặc chứng chỉ chuyên nghiệp</p>
                      </div>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                          setEditingEdu(null);
                          eduForm.resetFields();
                          setIsEduModalOpen(true);
                        }}
                        className="bg-primary font-bold rounded-xl"
                      >
                        Thêm học vấn
                      </Button>
                    </div>

                    {educations.length > 0 ? (
                      <div className="space-y-3.5">
                        {educations.map((edu) => (
                          <div
                            key={edu.educationId}
                            className="p-4 sm:p-5 rounded-2xl border border-slate-100 bg-slate-50/60 flex items-start justify-between group hover:border-blue-200 transition-colors"
                          >
                            <div className="flex items-start gap-3.5">
                              <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center shrink-0 font-bold">
                                <BookOutlined className="text-lg" />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-slate-800">{edu.schoolName}</h4>
                                <p className="text-xs text-slate-600 font-semibold mt-0.5">{edu.majorName} {edu.degreeName ? `• ${edu.degreeName}` : ""}</p>
                                <span className="text-[11px] text-slate-400 font-medium block mt-1">
                                  {edu.startDate ? dayjs(edu.startDate).format("MM/YYYY") : ""} - {edu.endDate ? dayjs(edu.endDate).format("MM/YYYY") : "Hiện tại"}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                type="text"
                                icon={<EditOutlined />}
                                onClick={() => {
                                  setEditingEdu(edu);
                                  eduForm.setFieldsValue({
                                    schoolName: edu.schoolName,
                                    majorName: edu.majorName,
                                    degreeName: edu.degreeName,
                                    dateRange: [
                                      edu.startDate ? dayjs(edu.startDate) : null,
                                      edu.endDate ? dayjs(edu.endDate) : null,
                                    ],
                                    description: edu.description,
                                  });
                                  setIsEduModalOpen(true);
                                }}
                              />
                              <Popconfirm
                                title="Xóa thông tin học vấn này?"
                                onConfirm={() => handleDeleteEducation(edu.educationId)}
                                okText="Xóa"
                                cancelText="Hủy"
                              >
                                <Button type="text" danger icon={<DeleteOutlined />} />
                              </Popconfirm>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <BookOutlined className="text-3xl text-slate-300 mb-2" />
                        <p className="text-sm font-bold text-slate-600">Chưa có thông tin học vấn</p>
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={() => {
                            setEditingEdu(null);
                            eduForm.resetFields();
                            setIsEduModalOpen(true);
                          }}
                          className="mt-3 bg-primary"
                        >
                          Thêm thông tin học vấn
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 5: KINH NGHIỆM */}
                {activeTab === "experience" && (
                  <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">Kinh nghiệm làm việc</h3>
                        <p className="text-xs text-slate-400">Các công ty và dự án bạn đã từng tham gia</p>
                      </div>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                          setEditingExp(null);
                          expForm.resetFields();
                          setIsExpModalOpen(true);
                        }}
                        className="bg-primary font-bold rounded-xl"
                      >
                        Thêm kinh nghiệm
                      </Button>
                    </div>

                    {experiences.length > 0 ? (
                      <div className="space-y-3.5">
                        {experiences.map((exp) => (
                          <div
                            key={exp.experienceId}
                            className="p-4 sm:p-5 rounded-2xl border border-slate-100 bg-slate-50/60 flex items-start justify-between group hover:border-blue-200 transition-colors"
                          >
                            <div className="flex items-start gap-3.5">
                              <div className="w-10 h-10 rounded-xl bg-indigo-100/70 text-indigo-600 flex items-center justify-center shrink-0 font-bold">
                                <BankOutlined className="text-lg" />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-slate-800">{exp.positionName}</h4>
                                <p className="text-xs text-blue-600 font-semibold mt-0.5">{exp.companyName}</p>
                                <span className="text-[11px] text-slate-400 font-medium block mt-1">
                                  {dayjs(exp.startDate).format("MM/YYYY")} - {exp.isCurrentJob ? "Hiện tại" : exp.endDate ? dayjs(exp.endDate).format("MM/YYYY") : "Hiện tại"}
                                </span>
                                {exp.description && (
                                  <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-line">{exp.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                type="text"
                                icon={<EditOutlined />}
                                onClick={() => {
                                  setEditingExp(exp);
                                  expForm.setFieldsValue({
                                    companyName: exp.companyName,
                                    positionName: exp.positionName,
                                    dateRange: [
                                      dayjs(exp.startDate),
                                      exp.endDate ? dayjs(exp.endDate) : null,
                                    ],
                                    isCurrentJob: exp.isCurrentJob,
                                    description: exp.description,
                                  });
                                  setIsExpModalOpen(true);
                                }}
                              />
                              <Popconfirm
                                title="Xóa kinh nghiệm này?"
                                onConfirm={() => handleDeleteExperience(exp.experienceId)}
                                okText="Xóa"
                                cancelText="Hủy"
                              >
                                <Button type="text" danger icon={<DeleteOutlined />} />
                              </Popconfirm>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <BankOutlined className="text-3xl text-slate-300 mb-2" />
                        <p className="text-sm font-bold text-slate-600">Chưa có kinh nghiệm làm việc</p>
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={() => {
                            setEditingExp(null);
                            expForm.resetFields();
                            setIsExpModalOpen(true);
                          }}
                          className="mt-3 bg-primary"
                        >
                          Thêm kinh nghiệm làm việc
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 6: LIÊN KẾT */}
                {activeTab === "links" && (
                  <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-sm space-y-4">
                    <h3 className="text-base font-bold text-slate-900 mb-4">Mạng xã hội & Liên kết cá nhân</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <a
                        href="https://linkedin.com"
                        target="_blank"
                        rel="noreferrer"
                        className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-200 transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <LinkedinOutlined className="text-2xl text-blue-600" />
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">LinkedIn</span>
                            <span className="text-[11px] text-slate-400">linkedin.com/in/{usernameDisplay}</span>
                          </div>
                        </div>
                        <ArrowRightOutlined className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                      </a>

                      <a
                        href="https://github.com"
                        target="_blank"
                        rel="noreferrer"
                        className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <GithubOutlined className="text-2xl text-slate-800" />
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">GitHub Portfolio</span>
                            <span className="text-[11px] text-slate-400">github.com/{usernameDisplay}</span>
                          </div>
                        </div>
                        <ArrowRightOutlined className="text-slate-300 group-hover:text-slate-800 transition-colors" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ================= CỘT PHẢI (25-30%) ================= */}
          <div className="lg:col-span-4 space-y-5">
            {/* 1. CARD MỨC ĐỘ HOÀN THIỆN HỒ SƠ */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Hồ sơ hoàn chỉnh</h3>
                  <p className="text-xs text-slate-400 mt-0.5 max-w-[180px]">
                    Hoàn thiện thêm để tăng cơ hội được nhà tuyển dụng chú ý
                  </p>
                </div>
                <span className="text-2xl font-black text-primary">{completionPercent}%</span>
              </div>

              <Progress
                percent={completionPercent}
                showInfo={false}
                strokeColor={{
                  "0%": "#2563eb",
                  "100%": "#38bdf8",
                }}
                railColor="#f1f5f9"
                className="mb-3"
              />

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Còn thiếu: Kỹ năng, CV</span>
                <button
                  onClick={() => setActiveTab("skills")}
                  className="font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Xem gợi ý →
                </button>
              </div>
            </div>

            {/* 2. CARD MẸO NHỎ TỪ CAREZA */}
            <div className="bg-amber-50/80 rounded-3xl p-5 border border-amber-200/60 shadow-sm relative group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                  <BulbFilled className="text-amber-500 text-sm" />
                  <span>Mẹo nhỏ từ Careza</span>
                </div>
                <ArrowRightOutlined className="text-xs text-amber-500 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-amber-900/90 leading-relaxed">
                Hoàn thiện đầy đủ hồ sơ, đặc biệt là kỹ năng và kinh nghiệm, để tăng đến <strong className="text-amber-900 font-bold">3x cơ hội</strong> được nhà tuyển dụng liên hệ!
              </p>
            </div>

            {/* 3. CARD THÔNG TIN TÀI KHOẢN */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800">Thông tin tài khoản</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center gap-1">
                  <SafetyCertificateFilled className="text-emerald-500" /> Đã xác thực
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <UserOutlined /> Tên đăng nhập
                  </span>
                  <span className="font-bold text-slate-800">{usernameDisplay}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <MailOutlined /> Email
                  </span>
                  <div className="flex items-center gap-1 font-bold text-slate-800 truncate max-w-[140px]">
                    <span className="truncate">{user?.email}</span>
                    <CheckCircleFilled className="text-emerald-500 text-xs shrink-0" />
                  </div>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <PhoneOutlined /> Số điện thoại
                  </span>
                  <div className="flex items-center gap-1 font-bold text-slate-800">
                    <span>{user?.phoneNumber || "0901 234 567"}</span>
                    <CheckCircleFilled className="text-emerald-500 text-xs shrink-0" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <CalendarOutlined /> Ngày tham gia
                  </span>
                  <span className="font-bold text-slate-800">
                    {user?.createdAt ? dayjs(user.createdAt).format("DD/MM/YYYY") : "12/08/2024"}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. CARD BANNER CTA: HỒ SƠ CHUYÊN NGHIỆP */}
            <div className="rounded-3xl p-6 bg-gradient-to-br from-blue-50 via-indigo-50/40 to-white border border-blue-100 shadow-sm relative overflow-hidden">
              <h3 className="text-base font-black text-slate-900 tracking-tight mb-1">
                Hồ sơ chuyên nghiệp
              </h3>
              <p className="text-xs text-blue-600 font-bold mb-4">Cơ hội rộng mở</p>

              <div className="space-y-2 mb-6 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircleFilled className="text-emerald-500" />
                  <span>Được nhà tuyển dụng chú ý</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleFilled className="text-emerald-500" />
                  <span>Đề xuất việc làm phù hợp</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleFilled className="text-emerald-500" />
                  <span>Tiến gần hơn tới công việc mơ ước</span>
                </div>
              </div>

              <Button
                type="primary"
                block
                icon={<ArrowRightOutlined />}
                onClick={() => {
                  editProfileForm.setFieldsValue({
                    headline: profile?.headline,
                    gender: profile?.gender ?? 2,
                    dateOfBirth: profile?.dateOfBirth ? dayjs(profile.dateOfBirth) : null,
                    address: profile?.address,
                  });
                  setIsEditProfileOpen(true);
                }}
                className="bg-primary hover:bg-blue-700 h-11 font-bold rounded-xl shadow-md shadow-blue-500/20"
              >
                Cập nhật hồ sơ ngay
              </Button>

              <div className="text-right mt-4">
                <span className="font-handwriting text-xl text-blue-500 font-bold rotate-[-4deg] inline-block">
                  Build Your Next Chapter ♡
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODAL CHỈNH SỬA THÔNG TIN CÁ NHÂN ================= */}
      <Modal
        title={<span className="text-base font-bold text-slate-900">Chỉnh sửa thông tin cá nhân</span>}
        open={isEditProfileOpen}
        onCancel={() => setIsEditProfileOpen(false)}
        footer={null}
        centered
        width={560}
      >
        <Form
          form={editProfileForm}
          layout="vertical"
          onFinish={handleSaveProfile}
          className="pt-3"
        >
          <Form.Item
            name="headline"
            label={<span className="text-xs font-bold text-slate-700">Châm ngôn / Tiêu đề nghề nghiệp</span>}
          >
            <Input placeholder="Ví dụ: Không ngừng học hỏi, không ngừng phát triển" maxLength={150} />
          </Form.Item>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              name="gender"
              label={<span className="text-xs font-bold text-slate-700">Giới tính</span>}
            >
              <Select
                options={[
                  { value: 1, label: "Nam" },
                  { value: 2, label: "Nữ" },
                  { value: 3, label: "Khác" },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="dateOfBirth"
              label={<span className="text-xs font-bold text-slate-700">Ngày sinh</span>}
            >
              <DatePicker format="DD/MM/YYYY" className="w-full" placeholder="Chọn ngày sinh" />
            </Form.Item>
          </div>

          <Form.Item
            name="address"
            label={<span className="text-xs font-bold text-slate-700">Địa chỉ / Khu vực hiện tại</span>}
          >
            <Input placeholder="Ví dụ: Quận 1, TP. Hồ Chí Minh" />
          </Form.Item>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button onClick={() => setIsEditProfileOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={savingProfile} className="bg-primary font-bold">
              Lưu thay đổi
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ================= MODAL CHỈNH SỬA MỤC TIÊU NGHỀ NGHIỆP ================= */}
      <Modal
        title={<span className="text-base font-bold text-slate-900">Mục tiêu nghề nghiệp</span>}
        open={isGoalModalOpen}
        onCancel={() => setIsGoalModalOpen(false)}
        footer={null}
        centered
        width={560}
      >
        <Form form={goalForm} layout="vertical" onFinish={handleSaveGoal} className="pt-3">
          <Form.Item
            name="summary"
            label={<span className="text-xs font-bold text-slate-700">Mô tả mục tiêu nghề nghiệp (Bio)</span>}
            rules={[{ required: true, message: "Vui lòng nhập mục tiêu nghề nghiệp" }]}
          >
            <TextArea
              rows={5}
              placeholder="Mô tả mục tiêu ngắn hạn, dài hạn và giá trị bạn mong muốn đóng góp cho doanh nghiệp..."
              maxLength={1000}
              showCount
            />
          </Form.Item>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button onClick={() => setIsGoalModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={savingProfile} className="bg-primary font-bold">
              Lưu mục tiêu
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ================= MODAL THÊM / SỬA HỌC VẤN ================= */}
      <Modal
        title={<span className="text-base font-bold text-slate-900">{editingEdu ? "Cập nhật học vấn" : "Thêm học vấn mới"}</span>}
        open={isEduModalOpen}
        onCancel={() => setIsEduModalOpen(false)}
        footer={null}
        centered
        width={560}
      >
        <Form form={eduForm} layout="vertical" onFinish={handleSaveEducation} className="pt-3">
          <Form.Item
            name="schoolName"
            label={<span className="text-xs font-bold text-slate-700">Tên trường</span>}
            rules={[{ required: true, message: "Vui lòng nhập tên trường" }]}
          >
            <Input placeholder="Ví dụ: Đại học Bách Khoa TP.HCM" />
          </Form.Item>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              name="majorName"
              label={<span className="text-xs font-bold text-slate-700">Ngành học</span>}
              rules={[{ required: true, message: "Vui lòng nhập ngành học" }]}
            >
              <Input placeholder="Ví dụ: Công nghệ thông tin" />
            </Form.Item>

            <Form.Item
              name="degreeName"
              label={<span className="text-xs font-bold text-slate-700">Bằng cấp</span>}
            >
              <Input placeholder="Ví dụ: Cử nhân / Kỹ sư" />
            </Form.Item>
          </div>

          <Form.Item
            name="dateRange"
            label={<span className="text-xs font-bold text-slate-700">Thời gian học</span>}
          >
            <DatePicker.RangePicker picker="month" format="MM/YYYY" className="w-full" />
          </Form.Item>

          <Form.Item
            name="description"
            label={<span className="text-xs font-bold text-slate-700">Mô tả thêm / Thành tích</span>}
          >
            <TextArea rows={3} placeholder="GPA, học bổng, đề tài tốt nghiệp..." />
          </Form.Item>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button onClick={() => setIsEduModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" className="bg-primary font-bold">
              {editingEdu ? "Lưu thay đổi" : "Thêm mới"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ================= MODAL THÊM / SỬA KINH NGHIỆM ================= */}
      <Modal
        title={<span className="text-base font-bold text-slate-900">{editingExp ? "Cập nhật kinh nghiệm" : "Thêm kinh nghiệm mới"}</span>}
        open={isExpModalOpen}
        onCancel={() => setIsExpModalOpen(false)}
        footer={null}
        centered
        width={560}
      >
        <Form form={expForm} layout="vertical" onFinish={handleSaveExperience} className="pt-3">
          <Form.Item
            name="companyName"
            label={<span className="text-xs font-bold text-slate-700">Tên công ty / Doanh nghiệp</span>}
            rules={[{ required: true, message: "Vui lòng nhập tên công ty" }]}
          >
            <Input placeholder="Ví dụ: Công ty Cổ phần Công nghệ ABC" />
          </Form.Item>

          <Form.Item
            name="positionName"
            label={<span className="text-xs font-bold text-slate-700">Vị trí / Chức danh</span>}
            rules={[{ required: true, message: "Vui lòng nhập vị trí" }]}
          >
            <Input placeholder="Ví dụ: Frontend Developer" />
          </Form.Item>

          <Form.Item
            name="dateRange"
            label={<span className="text-xs font-bold text-slate-700">Thời gian làm việc</span>}
          >
            <DatePicker.RangePicker picker="month" format="MM/YYYY" className="w-full" />
          </Form.Item>

          <Form.Item name="isCurrentJob" valuePropName="checked">
            <Radio.Group>
              <Radio value={true}>Tôi đang làm việc tại đây</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="description"
            label={<span className="text-xs font-bold text-slate-700">Mô tả công việc & Thành tựu đạt được</span>}
          >
            <TextArea rows={4} placeholder="Các công nghệ đã dùng, trách nhiệm chính, đóng góp cụ thể..." />
          </Form.Item>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button onClick={() => setIsExpModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" className="bg-primary font-bold">
              {editingExp ? "Lưu thay đổi" : "Thêm mới"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ================= MODAL THÊM KỸ NĂNG ================= */}
      <Modal
        title={<span className="text-base font-bold text-slate-900">Thêm kỹ năng chuyên môn</span>}
        open={isSkillModalOpen}
        onCancel={() => setIsSkillModalOpen(false)}
        footer={null}
        centered
        width={480}
      >
        <Form form={skillForm} layout="vertical" onFinish={handleAddSkill} className="pt-3">
          <Form.Item
            name="skillId"
            label={<span className="text-xs font-bold text-slate-700">Chọn kỹ năng</span>}
            rules={[{ required: true, message: "Vui lòng chọn kỹ năng" }]}
          >
            <Select
              placeholder="Chọn kỹ năng chuyên môn"
              options={POPULAR_SKILLS.map((s) => ({ value: s.id, label: s.name }))}
            />
          </Form.Item>

          <Form.Item
            name="skillLevel"
            label={<span className="text-xs font-bold text-slate-700">Trình độ</span>}
            initialValue={3}
          >
            <Select
              options={[
                { value: 1, label: "Cơ bản (Beginner)" },
                { value: 2, label: "Trung bình (Intermediate)" },
                { value: 3, label: "Khá (Good)" },
                { value: 4, label: "Thành thạo (Advanced)" },
                { value: 5, label: "Chuyên gia (Expert)" },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="yearsOfExperience"
            label={<span className="text-xs font-bold text-slate-700">Số năm kinh nghiệm</span>}
          >
            <Input type="number" min={0} max={40} placeholder="Ví dụ: 2" />
          </Form.Item>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button onClick={() => setIsSkillModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" className="bg-primary font-bold">
              Thêm kỹ năng
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
