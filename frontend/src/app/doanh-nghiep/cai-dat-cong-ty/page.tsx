"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Modal,
  Select,
  Input,
  Progress,
  Tag,
  Switch,
  Upload,
  Tooltip,
  App,
  Space,
  Empty,
  Popconfirm,
} from "antd";
import {
  Building,
  Image as ImageIcon,
  FileText,
  Heart,
  Gift,
  Briefcase,
  Video,
  Award,
  Eye,
  Search,
  Zap,
  Phone,
  Globe,
  Share2,
  Sliders,
  Trash2,
  Camera,
  Edit3,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Mail,
  Plus,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  Download,
  AlertCircle,
  HelpCircle,
  UploadCloud,
  Play,
  Linkedin,
  Facebook,
  Youtube,
  Trash,
  AlertTriangle,
  Layers,
  Laptop,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

// =====================================================================
// MENU SECTIONS DEFINITION
// =====================================================================

export type SettingSection =
  | "basic_info"
  | "brand_images"
  | "about"
  | "culture_values"
  | "benefits"
  | "workplace"
  | "video"
  | "awards"
  | "visibility"
  | "seo"
  | "quick_contact"
  | "contact_info"
  | "socials"
  | "integrations"
  | "danger_zone";

// =====================================================================
// INITIAL COMPANY DATA
// =====================================================================

const INITIAL_COMPANY_DATA = {
  name: "Google Vietnam",
  displayName: "Google Vietnam",
  logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png",
  banner: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1800&q=80",
  slogan: "Building products that help billions of people",
  website: "https://careers.google.com",
  industry: ["Công nghệ thông tin"],
  size: "5.000 - 10.000 nhân viên",
  foundedYear: "1997",
  companyType: "Công ty TNHH",
  taxCode: "0101234567",
  address: "Hà Nội, Việt Nam",
  workDays: "Thứ 2 - Thứ 6",
  workHoursStart: "08:30",
  workHoursEnd: "17:30",
  languages: ["Tiếng Việt", "Tiếng Anh"],
  
  // About
  shortIntro: "Google Vietnam là công ty công nghệ tiên phong toàn cầu, mang đến các giải pháp hữu ích cho hàng tỷ người dùng trên thế giới.",
  detailedIntro: "Được thành lập từ năm 1997, Google đã không ngừng phát triển và mở rộng mạng lưới sản phẩm từ tìm kiếm trực tuyến, điện toán đám mây, trí tuệ nhân tạo (AI) đến hệ điều hành Android. Tại Việt Nam, chúng tôi tập trung phát triển hệ sinh thái số và đồng hành cùng các doanh nghiệp địa phương.",
  mission: "Tổ chức thông tin thế giới và làm cho nó hữu ích, dễ tiếp cận.",
  vision: "Kiến tạo công nghệ cho một tương lai tốt đẹp hơn cho nhân loại.",
  highlights: [
    "Môi trường làm việc linh hoạt số 1 thế giới",
    "Cơ hội phát triển với các chuyên gia quốc tế hàng đầu",
    "Gói đãi ngộ và chăm sóc sức khỏe toàn diện cho gia đình",
  ],

  // Culture & Values
  values: [
    { id: "val-1", title: "Đổi mới sáng tạo", desc: "Không ngừng thử nghiệm các giải pháp công nghệ mới và học hỏi từ thất bại." },
    { id: "val-2", title: "Tập trung vào người dùng", desc: "Tất cả mọi sản phẩm đều bắt đầu từ trải nghiệm và giá trị thực cho người dùng." },
    { id: "val-3", title: "Tôn trọng & Hòa nhập", desc: "Tôn trọng sự đa dạng, bình đẳng và tạo cơ hội công bằng cho mọi thành viên." },
  ],

  // Benefits
  benefits: [
    { id: "ben-1", title: "Thưởng hiệu quả & Cổ phiếu", desc: "Thưởng tháng 13, thưởng hiệu suất hàng quý và chương trình cổ phiếu ESOP hấp dẫn.", category: "Lương thưởng" },
    { id: "ben-2", title: "Bảo hiểm sức khỏe cao cấp", desc: "Gói bảo hiểm quốc tế toàn diện cho nhân viên và người thân trong gia đình.", category: "Bảo hiểm" },
    { id: "ben-3", title: "20 ngày phép năm", desc: "Chính sách nghỉ phép linh hoạt cùng chế độ nghỉ chăm sóc gia đình.", category: "Nghỉ phép" },
    { id: "ben-4", title: "Trang bị Macbook Pro & Màn hình 4K", desc: "Cấp phát máy tính cao cấp phục vụ tối đa hiệu suất làm việc.", category: "Thiết bị" },
  ],

  // Workplace
  workplace: {
    model: "Hybrid (Linh hoạt)",
    description: "Không gian làm việc mở với đầy đủ tiện ích: pantry miễn phí, khu vực thư giãn, phòng gym và góc sáng tạo.",
    gallery: [
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80",
    ],
  },

  // Video
  video: {
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    title: "Khám phá môi trường làm việc tại Google",
    desc: "Video giới thiệu không gian sáng tạo và cuộc sống thường nhật của Googler.",
  },

  // Awards
  awards: [
    { id: "aw-1", title: "Nơi làm việc tốt nhất Việt Nam 2024", issuer: "Anphabe", year: "2024", desc: "Xếp hạng #1 trong ngành Công nghệ Thông tin & Phần mềm." },
    { id: "aw-2", title: "Top 10 Doanh nghiệp Công nghệ Tiên phong", issuer: "Vietnam Report", year: "2023", desc: "Vinh danh doanh nghiệp có đóng góp lớn cho chuyển đổi số quốc gia." },
  ],

  // Visibility & Permissions
  visibility: {
    showCompanyPage: true,
    allowFollow: true,
    showReviews: true,
    showEmployeeCount: true,
    showContactInfo: true,
  },

  // SEO
  seo: {
    title: "Tuyển dụng Google Vietnam - Cơ hội nghề nghiệp công nghệ hàng đầu",
    description: "Khám phá các vị trí tuyển dụng mới nhất tại Google Vietnam. Môi trường sáng tạo, chế độ đãi ngộ hàng đầu.",
    slug: "google-vietnam",
    keywords: "tuyển dụng google, việc làm it, software engineer, google careers",
  },

  // Quick CTA Buttons
  quickActions: {
    showJobs: true,
    showFollow: true,
    showWebsite: true,
    showEmail: true,
    showHotline: true,
  },

  // Socials
  socials: {
    linkedin: "https://linkedin.com/company/google",
    facebook: "https://facebook.com/GoogleVietnam",
    youtube: "https://youtube.com/google",
    tiktok: "https://tiktok.com/@google",
  },

  // Contact
  contact: {
    email: "tuyendung@google.com",
    hotline: "(024) 7300 7300",
    website: "careers.google.com",
    managerName: "Mai Phương - Trưởng phòng Nhân sự",
  },
};

const COMPANY_DOCUMENTS = [
  { id: "doc-1", name: "Company Profile.pdf", size: "2.4 MB", date: "12/12/2023" },
  { id: "doc-2", name: "Brochure_2024.pdf", size: "3.1 MB", date: "12/12/2023" },
  { id: "doc-3", name: "Recruitment Policy.pdf", size: "1.8 MB", date: "12/12/2023" },
];

const RECENT_ACTIVITIES = [
  { id: "act-1", text: "Mai Phương đã cập nhật thông tin công ty", time: "2 giờ trước" },
  { id: "act-2", text: "Mai Phương đã thay đổi ảnh bìa", time: "hôm qua" },
  { id: "act-3", text: "Mai Phương đã cập nhật thông tin liên hệ", time: "2 ngày trước" },
];

// =====================================================================
// MAIN COMPONENT
// =====================================================================

export default function EmployerCompanySettingsPage() {
  const { message } = App.useApp();
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();

  const recruiterName = user?.fullName || "Mai Phương";

  // Section State from Query or default
  const [activeSection, setActiveSection] = useState<SettingSection>("basic_info");
  const [formData, setFormData] = useState(INITIAL_COMPANY_DATA);
  const [isSaving, setIsSaving] = useState(false);

  // Modals for CRUD operations
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [isValueModalOpen, setIsValueModalOpen] = useState(false);
  const [isBenefitModalOpen, setIsBenefitModalOpen] = useState(false);
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // New Item Temporary State
  const [newValue, setNewValue] = useState({ title: "", desc: "" });
  const [newBenefit, setNewBenefit] = useState({ title: "", desc: "", category: "Lương thưởng" });
  const [newAward, setNewAward] = useState({ title: "", issuer: "", year: "2024", desc: "" });

  // Sync with URL search params on mount or change
  useEffect(() => {
    const sectionParam = searchParams.get("section") as SettingSection;
    if (sectionParam) {
      setActiveSection(sectionParam);
    }
  }, [searchParams]);

  const handleSelectSection = (sec: SettingSection) => {
    setActiveSection(sec);
    router.replace(`/doanh-nghiep/cai-dat-cong-ty?section=${sec}`, { scroll: false });
  };

  const handleSaveAll = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      message.success("Đã lưu tất cả thay đổi cài đặt công ty thành công!");
    }, 600);
  };

  // Add Handlers
  const handleAddValue = () => {
    if (!newValue.title.trim()) {
      message.warning("Vui lòng nhập tên giá trị");
      return;
    }
    setFormData({
      ...formData,
      values: [...formData.values, { id: `val-${Date.now()}`, ...newValue }],
    });
    setNewValue({ title: "", desc: "" });
    setIsValueModalOpen(false);
    message.success("Đã thêm giá trị văn hóa mới!");
  };

  const handleDeleteValue = (id: string) => {
    setFormData({
      ...formData,
      values: formData.values.filter((v) => v.id !== id),
    });
    message.success("Đã xóa giá trị văn hóa");
  };

  const handleAddBenefit = () => {
    if (!newBenefit.title.trim()) {
      message.warning("Vui lòng nhập tên phúc lợi");
      return;
    }
    setFormData({
      ...formData,
      benefits: [...formData.benefits, { id: `ben-${Date.now()}`, ...newBenefit }],
    });
    setNewBenefit({ title: "", desc: "", category: "Lương thưởng" });
    setIsBenefitModalOpen(false);
    message.success("Đã thêm phúc lợi mới!");
  };

  const handleDeleteBenefit = (id: string) => {
    setFormData({
      ...formData,
      benefits: formData.benefits.filter((b) => b.id !== id),
    });
    message.success("Đã xóa phúc lợi");
  };

  const handleAddAward = () => {
    if (!newAward.title.trim()) {
      message.warning("Vui lòng nhập tên giải thưởng");
      return;
    }
    setFormData({
      ...formData,
      awards: [...formData.awards, { id: `aw-${Date.now()}`, ...newAward }],
    });
    setNewAward({ title: "", issuer: "", year: "2024", desc: "" });
    setIsAwardModalOpen(false);
    message.success("Đã thêm giải thưởng mới!");
  };

  const handleDeleteAward = (id: string) => {
    setFormData({
      ...formData,
      awards: formData.awards.filter((a) => a.id !== id),
    });
    message.success("Đã xóa giải thưởng");
  };

  return (
    <div className="w-full font-sans bg-[#F7F9FC] -m-3 sm:-m-4 lg:-m-5 p-3 sm:p-4 lg:p-5 flex flex-col h-[calc(100vh-80px)] overflow-hidden space-y-3">
      {/* ======================================================== */}
      {/* 1. TOP FIXED AREA: HEADER & COMPLETION CARD              */}
      {/* ======================================================== */}
      <div className="shrink-0 space-y-3">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-transparent">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 m-0 tracking-tight leading-tight">
              Cài đặt công ty
            </h1>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/cong-ty/fpt"
              target="_blank"
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200/90 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-[#0062ff]" />
              <span>Xem trang công ty (Ứng viên)</span>
            </Link>

            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {isSaving ? (
                <span>Đang lưu...</span>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Lưu tất cả thay đổi</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Profile Completion Card */}
        <div className="bg-gradient-to-r from-blue-50/90 via-purple-50/50 to-pink-50/40 border border-blue-100/90 rounded-2xl p-3.5 sm:p-4 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
          {/* Left Circular Progress & Subtitle */}
          <div className="flex items-center gap-3.5">
            <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
              <Progress
                type="circle"
                percent={85}
                size={48}
                strokeColor="#0062ff"
                format={(percent) => (
                  <span className="font-black text-[11px] text-slate-900">{percent}%</span>
                )}
              />
            </div>

            <div className="space-y-0.5">
              <h3 className="text-xs sm:text-sm font-black text-slate-900 m-0">
                Hoàn thiện hồ sơ công ty
              </h3>
              <p className="text-[11.5px] text-slate-600 font-medium m-0">
                Bạn đã hoàn thiện <strong className="text-slate-900">17/20</strong> mục thông tin.
              </p>
              <span className="text-[10px] text-slate-400 block">
                Hoàn thiện hồ sơ để tăng độ tin cậy và thu hút ứng viên hơn.
              </span>
            </div>
          </div>

          {/* Center Completion Pills */}
          <div className="flex items-center gap-2 flex-nowrap overflow-x-auto py-1 text-xs scrollbar-none">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 text-emerald-700 font-bold text-[11px] border border-emerald-100 shadow-2xs whitespace-nowrap shrink-0">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Thông tin cơ bản</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 text-emerald-700 font-bold text-[11px] border border-emerald-100 shadow-2xs whitespace-nowrap shrink-0">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Logo công ty</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 text-emerald-700 font-bold text-[11px] border border-emerald-100 shadow-2xs whitespace-nowrap shrink-0">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Ảnh bìa</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 text-emerald-700 font-bold text-[11px] border border-emerald-100 shadow-2xs whitespace-nowrap shrink-0">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Giới thiệu</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 text-emerald-700 font-bold text-[11px] border border-emerald-100 shadow-2xs whitespace-nowrap shrink-0">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Ngành nghề</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 text-emerald-700 font-bold text-[11px] border border-emerald-100 shadow-2xs whitespace-nowrap shrink-0">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Quy mô</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 text-emerald-700 font-bold text-[11px] border border-emerald-100 shadow-2xs whitespace-nowrap shrink-0">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Địa chỉ</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 text-emerald-700 font-bold text-[11px] border border-emerald-100 shadow-2xs whitespace-nowrap shrink-0">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Liên hệ</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/80 text-slate-500 font-semibold text-[11px] border border-slate-200 whitespace-nowrap shrink-0">
              <span className="w-2.5 h-2.5 rounded-full border border-slate-300 inline-block" />
              <span>Văn hóa</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/80 text-slate-500 font-semibold text-[11px] border border-slate-200 whitespace-nowrap shrink-0">
              <span className="w-2.5 h-2.5 rounded-full border border-slate-300 inline-block" />
              <span>Môi trường</span>
            </span>
          </div>

          {/* Right Action Button */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => handleSelectSection("culture_values")}
              className="px-3.5 py-2 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs shadow-xs flex items-center gap-1.5 shrink-0 whitespace-nowrap transition-colors cursor-pointer"
            >
              <span>Hoàn thiện ngay</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. MAIN WORKSPACE: 3 INDEPENDENT SCROLLING COLUMNS       */}
      {/* ======================================================== */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)_300px] gap-3.5 items-stretch overflow-hidden">
        {/* ====================================================== */}
        {/* COLUMN 1: LEFT SETTINGS NAV (SCROLLS INDEPENDENTLY)    */}
        {/* ====================================================== */}
        <aside className="h-full min-h-0 overflow-y-auto overscroll-contain bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          {/* Group 1 */}
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block px-2.5 py-1">
              THÔNG TIN CÔNG TY
            </span>

            <button
              type="button"
              onClick={() => handleSelectSection("basic_info")}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeSection === "basic_info"
                  ? "bg-blue-50 text-[#0062ff] font-black border border-blue-100"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Thông tin cơ bản</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectSection("brand_images")}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeSection === "brand_images"
                  ? "bg-blue-50 text-[#0062ff] font-black border border-blue-100"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Thương hiệu &amp; Hình ảnh</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectSection("about")}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeSection === "about"
                  ? "bg-blue-50 text-[#0062ff] font-black border border-blue-100"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Giới thiệu công ty</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectSection("culture_values")}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeSection === "culture_values"
                  ? "bg-blue-50 text-[#0062ff] font-black border border-blue-100"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Văn hóa &amp; Giá trị</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectSection("benefits")}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeSection === "benefits"
                  ? "bg-blue-50 text-[#0062ff] font-black border border-blue-100"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Phúc lợi</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectSection("workplace")}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeSection === "workplace"
                  ? "bg-blue-50 text-[#0062ff] font-black border border-blue-100"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Môi trường làm việc</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectSection("video")}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeSection === "video"
                  ? "bg-blue-50 text-[#0062ff] font-black border border-blue-100"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Video giới thiệu</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectSection("awards")}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeSection === "awards"
                  ? "bg-blue-50 text-[#0062ff] font-black border border-blue-100"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Chứng nhận &amp; Giải thưởng</span>
            </button>
          </div>

          {/* Group 2 */}
          <div className="space-y-1 pt-1 border-t border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block px-2.5 py-1">
              HIỂN THỊ TRANG CÔNG TY
            </span>

            <button
              type="button"
              onClick={() => handleSelectSection("visibility")}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeSection === "visibility"
                  ? "bg-blue-50 text-[#0062ff] font-black border border-blue-100"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Hiển thị &amp; Quyền truy cập</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectSection("seo")}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeSection === "seo"
                  ? "bg-blue-50 text-[#0062ff] font-black border border-blue-100"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>SEO &amp; Từ khóa</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectSection("quick_contact")}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeSection === "quick_contact"
                  ? "bg-blue-50 text-[#0062ff] font-black border border-blue-100"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Nút liên hệ nhanh</span>
            </button>
          </div>

          {/* Group 3 */}
          <div className="space-y-1 pt-1 border-t border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block px-2.5 py-1">
              LIÊN HỆ &amp; MẠNG XÃ HỘI
            </span>

            <button
              type="button"
              onClick={() => handleSelectSection("contact_info")}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeSection === "contact_info"
                  ? "bg-blue-50 text-[#0062ff] font-black border border-blue-100"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Thông tin liên hệ</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectSection("socials")}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeSection === "socials"
                  ? "bg-blue-50 text-[#0062ff] font-black border border-blue-100"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Mạng xã hội</span>
            </button>
          </div>

          {/* Group 4 */}
          <div className="space-y-1 pt-1 border-t border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block px-2.5 py-1">
              CÀI ĐẶT KHÁC
            </span>

            <button
              type="button"
              onClick={() => handleSelectSection("integrations")}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeSection === "integrations"
                  ? "bg-blue-50 text-[#0062ff] font-black border border-blue-100"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Tích hợp</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectSection("danger_zone")}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeSection === "danger_zone"
                  ? "bg-rose-50 text-rose-600 font-black border border-rose-100"
                  : "text-rose-500 hover:bg-rose-50/50"
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa công ty</span>
            </button>
          </div>
        </aside>

        {/* ====================================================== */}
        {/* COLUMN 2: CENTER FORM CONTENT (SCROLLS INDEPENDENTLY)  */}
        {/* ====================================================== */}
        <main className="h-full min-h-0 overflow-y-auto overscroll-contain bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-5">
          {/* ---------------------------------------------------- */}
          {/* SECTION 1: THÔNG TIN CƠ BẢN                          */}
          {/* ---------------------------------------------------- */}
          {activeSection === "basic_info" && (
            <div className="space-y-5">
              <div className="pb-2 border-b border-slate-100">
                <h2 className="text-base sm:text-lg font-black text-slate-900 m-0">
                  Thông tin cơ bản
                </h2>
                <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
                  Cập nhật thông tin chung của công ty. Thông tin này sẽ hiển thị trên trang công ty của bạn.
                </p>
              </div>

              {/* Logo & Banner Row */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                {/* Logo Box (4 cols / ~32%) */}
                <div className="md:col-span-4 space-y-1.5">
                  <label className="text-xs font-black text-slate-900 block">
                    Logo công ty
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium block leading-tight">
                    Kích thước đề xuất: 400x400px. Định dạng: PNG, JPG (tối đa 2MB).
                  </span>

                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-white border border-slate-200 shadow-2xs p-3 flex items-center justify-center mx-auto mt-2">
                    <img
                      src={formData.logo}
                      alt={formData.name}
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => setIsLogoModalOpen(true)}
                      className="absolute bottom-2 right-2 w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0062ff] border border-blue-200 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                      title="Thay đổi logo"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Banner Box (8 cols / ~68%) */}
                <div className="md:col-span-8 space-y-1.5">
                  <label className="text-xs font-black text-slate-900 block">
                    Ảnh bìa (Banner)
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium block leading-tight">
                    Kích thước đề xuất: 1920x600px. Định dạng: JPG, PNG (tối đa 5MB).
                  </span>

                  <div className="relative rounded-2xl overflow-hidden aspect-21/9 bg-slate-900 shadow-2xs mt-2 border border-slate-200">
                    <img
                      src={formData.banner}
                      alt="Company Banner"
                      className="w-full h-full object-cover opacity-90"
                    />
                    <button
                      type="button"
                      onClick={() => setIsBannerModalOpen(true)}
                      className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-white font-bold text-xs backdrop-blur-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Thay ảnh</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Fields: 2 Columns Grid */}
              <div className="space-y-4 pt-2 border-t border-slate-100 text-xs">
                {/* Row 1 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Tên công ty <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nhập tên công ty..."
                      className="rounded-xl py-1.5 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Tên hiển thị trên Careza <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      placeholder="Nhập tên hiển thị..."
                      className="rounded-xl py-1.5 text-xs font-bold"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Tên này sẽ hiển thị với ứng viên trên Careza.
                    </span>
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Slogan
                    </label>
                    <Input
                      value={formData.slogan}
                      onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                      placeholder="Nhập câu khẩu hiệu của doanh nghiệp..."
                      className="rounded-xl py-1.5 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Website
                    </label>
                    <Input
                      prefix={<Globe className="w-3.5 h-3.5 text-slate-400 mr-1" />}
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://..."
                      className="rounded-xl py-1.5 text-xs"
                    />
                  </div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Ngành nghề chính <span className="text-rose-500">*</span>
                    </label>
                    <Select
                      mode="multiple"
                      value={formData.industry}
                      onChange={(val) => setFormData({ ...formData, industry: val })}
                      className="w-full text-xs"
                      options={[
                        { value: "Công nghệ thông tin", label: "Công nghệ thông tin" },
                        { value: "Tài chính - Ngân hàng", label: "Tài chính - Ngân hàng" },
                        { value: "Thương mại điện tử", label: "Thương mại điện tử" },
                        { value: "Marketing - Quảng cáo", label: "Marketing - Quảng cáo" },
                        { value: "Giáo dục - Đào tạo", label: "Giáo dục - Đào tạo" },
                      ]}
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Quy mô công ty <span className="text-rose-500">*</span>
                    </label>
                    <Select
                      value={formData.size}
                      onChange={(val) => setFormData({ ...formData, size: val })}
                      className="w-full text-xs"
                      options={[
                        { value: "1 - 50 nhân viên", label: "1 - 50 nhân viên" },
                        { value: "50 - 200 nhân viên", label: "50 - 200 nhân viên" },
                        { value: "200 - 1.000 nhân viên", label: "200 - 1.000 nhân viên" },
                        { value: "1.000 - 5.000 nhân viên", label: "1.000 - 5.000 nhân viên" },
                        { value: "5.000 - 10.000 nhân viên", label: "5.000 - 10.000 nhân viên" },
                        { value: "10.000+ nhân viên", label: "10.000+ nhân viên" },
                      ]}
                    />
                  </div>
                </div>

                {/* Row 4 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Năm thành lập
                    </label>
                    <Input
                      prefix={<Calendar className="w-3.5 h-3.5 text-slate-400 mr-1" />}
                      value={formData.foundedYear}
                      onChange={(e) => setFormData({ ...formData, foundedYear: e.target.value })}
                      placeholder="1997"
                      className="rounded-xl py-1.5 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Loại hình công ty
                    </label>
                    <Select
                      value={formData.companyType}
                      onChange={(val) => setFormData({ ...formData, companyType: val })}
                      className="w-full text-xs"
                      options={[
                        { value: "Công ty TNHH", label: "Công ty TNHH" },
                        { value: "Công ty Cổ phần", label: "Công ty Cổ phần" },
                        { value: "Doanh nghiệp tư nhân", label: "Doanh nghiệp tư nhân" },
                        { value: "Tập đoàn đa quốc gia", label: "Tập đoàn đa quốc gia" },
                      ]}
                    />
                  </div>
                </div>

                {/* Row 5 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Mã số thuế
                    </label>
                    <Input
                      value={formData.taxCode}
                      onChange={(e) => setFormData({ ...formData, taxCode: e.target.value })}
                      placeholder="0101234567"
                      className="rounded-xl py-1.5 text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Địa chỉ trụ sở chính
                    </label>
                    <Input
                      prefix={<MapPin className="w-3.5 h-3.5 text-slate-400 mr-1" />}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Hà Nội, Việt Nam"
                      className="rounded-xl py-1.5 text-xs font-bold"
                    />
                  </div>
                </div>

                {/* Row 6 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Thời gian làm việc
                    </label>
                    <div className="flex items-center gap-2">
                      <Select
                        value={formData.workDays}
                        onChange={(val) => setFormData({ ...formData, workDays: val })}
                        className="w-36 text-xs"
                        options={[
                          { value: "Thứ 2 - Thứ 6", label: "Thứ 2 - Thứ 6" },
                          { value: "Thứ 2 - Thứ 7", label: "Thứ 2 - Thứ 7" },
                          { value: "Linh hoạt", label: "Linh hoạt" },
                        ]}
                      />
                      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-mono font-bold">
                        <span>{formData.workHoursStart}</span>
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>-</span>
                        <span>{formData.workHoursEnd}</span>
                        <Clock className="w-3 h-3 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Ngôn ngữ làm việc chính
                    </label>
                    <Select
                      mode="multiple"
                      value={formData.languages}
                      onChange={(val) => setFormData({ ...formData, languages: val })}
                      className="w-full text-xs"
                      options={[
                        { value: "Tiếng Việt", label: "Tiếng Việt" },
                        { value: "Tiếng Anh", label: "Tiếng Anh" },
                        { value: "Tiếng Nhật", label: "Tiếng Nhật" },
                        { value: "Tiếng Hàn", label: "Tiếng Hàn" },
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* SECTION 2: THƯƠNG HIỆU & HÌNH ẢNH                    */}
          {/* ---------------------------------------------------- */}
          {activeSection === "brand_images" && (
            <div className="space-y-4">
              <div className="pb-2 border-b border-slate-100">
                <h2 className="text-base sm:text-lg font-black text-slate-900 m-0">
                  Thương hiệu &amp; Hình ảnh
                </h2>
                <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
                  Quản lý logo, ảnh bìa và bộ sưu tập hình ảnh văn phòng, sự kiện của công ty.
                </p>
              </div>

              {/* Gallery List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Bộ sưu tập hình ảnh văn phòng (3 ảnh)</span>
                  <button
                    type="button"
                    onClick={() => message.info("Đang mở bộ tải ảnh...")}
                    className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-[#0062ff] font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm ảnh mới</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {formData.workplace.gallery.map((img, idx) => (
                    <div key={idx} className="relative rounded-xl overflow-hidden aspect-video border border-slate-200 shadow-2xs group">
                      <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const newGal = formData.workplace.gallery.filter((_, i) => i !== idx);
                            setFormData({ ...formData, workplace: { ...formData.workplace, gallery: newGal } });
                            message.success("Đã xóa ảnh khỏi gallery");
                          }}
                          className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center cursor-pointer shadow-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* SECTION 3: GIỚI THIỆU CÔNG TY                        */}
          {/* ---------------------------------------------------- */}
          {activeSection === "about" && (
            <div className="space-y-4 text-xs">
              <div className="pb-2 border-b border-slate-100">
                <h2 className="text-base sm:text-lg font-black text-slate-900 m-0">
                  Giới thiệu công ty
                </h2>
                <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
                  Viết câu chuyện thương hiệu, sứ mệnh và tầm nhìn để truyền cảm hứng cho ứng viên.
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Giới thiệu ngắn (Mô tả tóm tắt)</label>
                <Input.TextArea
                  rows={2}
                  value={formData.shortIntro}
                  onChange={(e) => setFormData({ ...formData, shortIntro: e.target.value })}
                  placeholder="Giới thiệu tóm tắt 1-2 câu về doanh nghiệp..."
                  className="rounded-xl p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Giới thiệu chi tiết (Câu chuyện doanh nghiệp)</label>
                <Input.TextArea
                  rows={4}
                  value={formData.detailedIntro}
                  onChange={(e) => setFormData({ ...formData, detailedIntro: e.target.value })}
                  placeholder="Mô tả chi tiết về lịch sử hình thành, quy mô và văn hóa..."
                  className="rounded-xl p-2.5 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Sứ mệnh</label>
                  <Input.TextArea
                    rows={2}
                    value={formData.mission}
                    onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                    className="rounded-xl p-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tầm nhìn</label>
                  <Input.TextArea
                    rows={2}
                    value={formData.vision}
                    onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                    className="rounded-xl p-2.5 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* SECTION 4: VĂN HÓA & GIÁ TRỊ                         */}
          {/* ---------------------------------------------------- */}
          {activeSection === "culture_values" && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 m-0">
                    Văn hóa &amp; Giá trị cốt lõi
                  </h2>
                  <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
                    Định hình bản sắc văn hóa làm việc và nguyên tắc hoạt động của tổ chức.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsValueModalOpen(true)}
                  className="px-3 py-1.5 bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm giá trị</span>
                </button>
              </div>

              <div className="space-y-3">
                {formData.values.map((v) => (
                  <div key={v.id} className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-black text-slate-900 text-xs block">{v.title}</span>
                        <span className="text-slate-600 text-[11px] block mt-0.5 leading-relaxed">{v.desc}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteValue(v.id)}
                      className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* SECTION 5: PHÚC LỢI                                  */}
          {/* ---------------------------------------------------- */}
          {activeSection === "benefits" && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 m-0">
                    Chính sách đãi ngộ &amp; Phúc lợi
                  </h2>
                  <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
                    Thu hút nhân tài với các chế độ phúc lợi cạnh tranh và hấp dẫn.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBenefitModalOpen(true)}
                  className="px-3 py-1.5 bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm phúc lợi</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {formData.benefits.map((b) => (
                  <div key={b.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <Gift className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="font-black text-slate-900 text-xs block">{b.title}</span>
                          <span className="text-[10px] text-emerald-600 font-bold block">{b.category}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteBenefit(b.id)}
                        className="text-rose-400 hover:text-rose-600 cursor-pointer p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-slate-600 text-[11px] m-0 leading-relaxed">
                      {b.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* SECTION 6: MÔI TRƯỜNG LÀM VIỆC                       */}
          {/* ---------------------------------------------------- */}
          {activeSection === "workplace" && (
            <div className="space-y-4 text-xs">
              <div className="pb-2 border-b border-slate-100">
                <h2 className="text-base sm:text-lg font-black text-slate-900 m-0">
                  Môi trường làm việc
                </h2>
                <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
                  Mô tả không gian làm việc và phương thức cộng tác trong công ty.
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mô hình làm việc chính</label>
                <Select
                  value={formData.workplace.model}
                  onChange={(val) => setFormData({ ...formData, workplace: { ...formData.workplace, model: val } })}
                  className="w-full text-xs"
                  options={[
                    { value: "Hybrid (Linh hoạt)", label: "Hybrid (Linh hoạt kết hợp văn phòng & tại nhà)" },
                    { value: "On-site (Tại văn phòng)", label: "On-site (100% tại văn phòng)" },
                    { value: "Remote (Từ xa hoàn toàn)", label: "Remote (Làm việc từ xa 100%)" },
                  ]}
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mô tả chi tiết môi trường</label>
                <Input.TextArea
                  rows={3}
                  value={formData.workplace.description}
                  onChange={(e) => setFormData({ ...formData, workplace: { ...formData.workplace, description: e.target.value } })}
                  className="rounded-xl p-2.5 text-xs"
                />
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* SECTION 7: VIDEO GIỚI THIỆU                          */}
          {/* ---------------------------------------------------- */}
          {activeSection === "video" && (
            <div className="space-y-4 text-xs">
              <div className="pb-2 border-b border-slate-100">
                <h2 className="text-base sm:text-lg font-black text-slate-900 m-0">
                  Video giới thiệu doanh nghiệp
                </h2>
                <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
                  Thêm video clip trực quan để ứng viên có cái nhìn chân thực nhất về công ty.
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Đường dẫn Video (YouTube / Vimeo / MP4)</label>
                <Input
                  prefix={<Video className="w-3.5 h-3.5 text-slate-400 mr-1" />}
                  value={formData.video.url}
                  onChange={(e) => setFormData({ ...formData, video: { ...formData.video, url: e.target.value } })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="rounded-xl py-1.5 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tiêu đề video</label>
                  <Input
                    value={formData.video.title}
                    onChange={(e) => setFormData({ ...formData, video: { ...formData.video, title: e.target.value } })}
                    className="rounded-xl py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mô tả video</label>
                  <Input
                    value={formData.video.desc}
                    onChange={(e) => setFormData({ ...formData, video: { ...formData.video, desc: e.target.value } })}
                    className="rounded-xl py-1.5 text-xs"
                  />
                </div>
              </div>

              {/* Video Preview Box */}
              <div className="p-4 bg-slate-900 rounded-2xl text-white flex items-center justify-center aspect-16/7 shadow-sm">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center mx-auto cursor-pointer transition-colors">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                  <span className="text-xs font-bold block">{formData.video.title}</span>
                </div>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* SECTION 8: CHỨNG NHẬN & GIẢI THƯỞNG                  */}
          {/* ---------------------------------------------------- */}
          {activeSection === "awards" && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 m-0">
                    Chứng nhận &amp; Giải thưởng
                  </h2>
                  <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
                    Khẳng định uy tín thương hiệu tuyển dụng thông qua các giải thưởng danh giá.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAwardModalOpen(true)}
                  className="px-3 py-1.5 bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm giải thưởng</span>
                </button>
              </div>

              <div className="space-y-3">
                {formData.awards.map((a) => (
                  <div key={a.id} className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-100 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-black text-slate-900 text-xs block">{a.title}</span>
                        <span className="text-[10px] text-amber-700 font-bold block">{a.issuer} • Năm {a.year}</span>
                        <span className="text-slate-600 text-[11px] block mt-0.5">{a.desc}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteAward(a.id)}
                      className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* SECTION 9: HIỂN THỊ & QUYỀN TRUY CẬP                 */}
          {/* ---------------------------------------------------- */}
          {activeSection === "visibility" && (
            <div className="space-y-4 text-xs">
              <div className="pb-2 border-b border-slate-100">
                <h2 className="text-base sm:text-lg font-black text-slate-900 m-0">
                  Hiển thị &amp; Quyền truy cập
                </h2>
                <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
                  Tùy chỉnh các khối nội dung công khai hoặc ẩn đi trên trang công ty.
                </p>
              </div>

              <div className="space-y-3 divide-y divide-slate-100">
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="font-bold text-slate-900 block">Hiển thị trang công ty công khai</span>
                    <span className="text-slate-400 text-[11px]">Cho phép ứng viên tìm kiếm và xem trang công ty.</span>
                  </div>
                  <Switch
                    checked={formData.visibility.showCompanyPage}
                    onChange={(checked) => setFormData({ ...formData, visibility: { ...formData.visibility, showCompanyPage: checked } })}
                  />
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div>
                    <span className="font-bold text-slate-900 block">Cho phép ứng viên theo dõi công ty</span>
                    <span className="text-slate-400 text-[11px]">Ứng viên có thể bấm "Theo dõi" để nhận tin tuyển dụng mới.</span>
                  </div>
                  <Switch
                    checked={formData.visibility.allowFollow}
                    onChange={(checked) => setFormData({ ...formData, visibility: { ...formData.visibility, allowFollow: checked } })}
                  />
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div>
                    <span className="font-bold text-slate-900 block">Hiển thị đánh giá từ nhân viên</span>
                    <span className="text-slate-400 text-[11px]">Hiển thị số sao đánh giá văn hóa môi trường làm việc.</span>
                  </div>
                  <Switch
                    checked={formData.visibility.showReviews}
                    onChange={(checked) => setFormData({ ...formData, visibility: { ...formData.visibility, showReviews: checked } })}
                  />
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div>
                    <span className="font-bold text-slate-900 block">Hiển thị quy mô nhân viên</span>
                    <span className="text-slate-400 text-[11px]">Hiển thị số lượng nhân sự trên hồ sơ công ty.</span>
                  </div>
                  <Switch
                    checked={formData.visibility.showEmployeeCount}
                    onChange={(checked) => setFormData({ ...formData, visibility: { ...formData.visibility, showEmployeeCount: checked } })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* SECTION 10: SEO & TỪ KHÓA                            */}
          {/* ---------------------------------------------------- */}
          {activeSection === "seo" && (
            <div className="space-y-4 text-xs">
              <div className="pb-2 border-b border-slate-100">
                <h2 className="text-base sm:text-lg font-black text-slate-900 m-0">
                  SEO &amp; Tối ưu tìm kiếm
                </h2>
                <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
                  Tối ưu hóa khả năng xuất hiện của trang công ty trên Google và công cụ tìm kiếm.
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">SEO Title (Tiêu đề tìm kiếm)</label>
                <Input
                  value={formData.seo.title}
                  onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, title: e.target.value } })}
                  className="rounded-xl py-1.5 text-xs font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Meta Description (Mô tả tìm kiếm)</label>
                <Input.TextArea
                  rows={2}
                  value={formData.seo.description}
                  onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, description: e.target.value } })}
                  className="rounded-xl p-2 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Đường dẫn trang công ty (Slug)</label>
                <Input
                  prefix={<span className="text-slate-400 font-mono text-[11px]">careza.vn/cong-ty/</span>}
                  value={formData.seo.slug}
                  onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, slug: e.target.value } })}
                  className="rounded-xl py-1.5 text-xs font-mono font-bold"
                />
              </div>

              {/* Google Search Live Preview */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  XEM TRƯỚC TRÊN GOOGLE SEARCH
                </span>
                <span className="text-[11px] text-emerald-700 font-mono block">
                  https://careza.vn/cong-ty/{formData.seo.slug}
                </span>
                <h4 className="text-sm font-bold text-[#1a0dab] hover:underline cursor-pointer m-0">
                  {formData.seo.title}
                </h4>
                <p className="text-xs text-slate-600 m-0 leading-relaxed">
                  {formData.seo.description}
                </p>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* SECTION 11: NÚT LIÊN HỆ NHANH                        */}
          {/* ---------------------------------------------------- */}
          {activeSection === "quick_contact" && (
            <div className="space-y-4 text-xs">
              <div className="pb-2 border-b border-slate-100">
                <h2 className="text-base sm:text-lg font-black text-slate-900 m-0">
                  Nút liên hệ nhanh (CTA)
                </h2>
                <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
                  Cấu hình các nút hành động nhanh xuất hiện trên trang công ty của bạn.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <span className="font-bold text-slate-800">Nút "Xem việc đang tuyển"</span>
                  <Switch
                    checked={formData.quickActions.showJobs}
                    onChange={(c) => setFormData({ ...formData, quickActions: { ...formData.quickActions, showJobs: c } })}
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <span className="font-bold text-slate-800">Nút "Theo dõi công ty"</span>
                  <Switch
                    checked={formData.quickActions.showFollow}
                    onChange={(c) => setFormData({ ...formData, quickActions: { ...formData.quickActions, showFollow: c } })}
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <span className="font-bold text-slate-800">Nút "Website tuyển dụng"</span>
                  <Switch
                    checked={formData.quickActions.showWebsite}
                    onChange={(c) => setFormData({ ...formData, quickActions: { ...formData.quickActions, showWebsite: c } })}
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <span className="font-bold text-slate-800">Nút "Gửi Email tuyển dụng"</span>
                  <Switch
                    checked={formData.quickActions.showEmail}
                    onChange={(c) => setFormData({ ...formData, quickActions: { ...formData.quickActions, showEmail: c } })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* SECTION 12: THÔNG TIN LIÊN HỆ                       */}
          {/* ---------------------------------------------------- */}
          {activeSection === "contact_info" && (
            <div className="space-y-4 text-xs">
              <div className="pb-2 border-b border-slate-100">
                <h2 className="text-base sm:text-lg font-black text-slate-900 m-0">
                  Thông tin liên hệ tuyển dụng
                </h2>
                <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
                  Cập nhật các kênh liên lạc trực tiếp cho ứng viên khi có thắc mắc.
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email tuyển dụng chính <span className="text-rose-500">*</span></label>
                <Input
                  prefix={<Mail className="w-3.5 h-3.5 text-slate-400 mr-1" />}
                  value={formData.contact.email}
                  onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, email: e.target.value } })}
                  className="rounded-xl py-1.5 text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hotline tuyển dụng</label>
                  <Input
                    prefix={<Phone className="w-3.5 h-3.5 text-slate-400 mr-1" />}
                    value={formData.contact.hotline}
                    onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, hotline: e.target.value } })}
                    className="rounded-xl py-1.5 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Website tuyển dụng</label>
                  <Input
                    prefix={<Globe className="w-3.5 h-3.5 text-slate-400 mr-1" />}
                    value={formData.contact.website}
                    onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, website: e.target.value } })}
                    className="rounded-xl py-1.5 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Người phụ trách nhân sự</label>
                <Input
                  value={formData.contact.managerName}
                  onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, managerName: e.target.value } })}
                  className="rounded-xl py-1.5 text-xs"
                />
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* SECTION 13: MẠNG XÃ HỘI                              */}
          {/* ---------------------------------------------------- */}
          {activeSection === "socials" && (
            <div className="space-y-4 text-xs">
              <div className="pb-2 border-b border-slate-100">
                <h2 className="text-base sm:text-lg font-black text-slate-900 m-0">
                  Mạng xã hội
                </h2>
                <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
                  Liên kết các tài khoản mạng xã hội chính thức của doanh nghiệp.
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">LinkedIn</label>
                <Input
                  prefix={<Linkedin className="w-3.5 h-3.5 text-blue-600 mr-1" />}
                  value={formData.socials.linkedin}
                  onChange={(e) => setFormData({ ...formData, socials: { ...formData.socials, linkedin: e.target.value } })}
                  className="rounded-xl py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Facebook</label>
                <Input
                  prefix={<Facebook className="w-3.5 h-3.5 text-blue-700 mr-1" />}
                  value={formData.socials.facebook}
                  onChange={(e) => setFormData({ ...formData, socials: { ...formData.socials, facebook: e.target.value } })}
                  className="rounded-xl py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">YouTube</label>
                <Input
                  prefix={<Youtube className="w-3.5 h-3.5 text-red-600 mr-1" />}
                  value={formData.socials.youtube}
                  onChange={(e) => setFormData({ ...formData, socials: { ...formData.socials, youtube: e.target.value } })}
                  className="rounded-xl py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">TikTok</label>
                <Input
                  value={formData.socials.tiktok}
                  onChange={(e) => setFormData({ ...formData, socials: { ...formData.socials, tiktok: e.target.value } })}
                  className="rounded-xl py-1.5 text-xs"
                />
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* SECTION 14: TÍCH HỢP                                 */}
          {/* ---------------------------------------------------- */}
          {activeSection === "integrations" && (
            <div className="space-y-4 text-xs">
              <div className="pb-2 border-b border-slate-100">
                <h2 className="text-base sm:text-lg font-black text-slate-900 m-0">
                  Tích hợp hệ thống
                </h2>
                <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
                  Kết nối Careza với các nền tảng lịch biểu, email và công cụ tuyển dụng.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      G
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">Google Calendar</span>
                      <span className="text-[10px] text-emerald-600 font-bold">Đã kết nối</span>
                    </div>
                  </div>
                  <Tag color="success">Hoạt động</Tag>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                      M
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">Microsoft Teams</span>
                      <span className="text-[10px] text-slate-400">Chưa liên kết</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => message.info("Đang mở liên kết Microsoft Teams...")}
                    className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-lg cursor-pointer"
                  >
                    Kết nối
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* SECTION 15: XÓA CÔNG TY - DANGER ZONE                */}
          {/* ---------------------------------------------------- */}
          {activeSection === "danger_zone" && (
            <div className="space-y-4 text-xs">
              <div className="pb-2 border-b border-rose-100">
                <h2 className="text-base sm:text-lg font-black text-rose-600 m-0">
                  Vùng nguy hiểm
                </h2>
                <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
                  Các hành động tại đây có thể ảnh hưởng vĩnh viễn tới dữ liệu tài khoản doanh nghiệp.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-rose-900 text-sm m-0">Xóa tài khoản công ty</h3>
                    <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                      Khi xóa công ty, toàn bộ tin tuyển dụng, danh sách ứng viên, lịch sử phỏng vấn và dữ liệu liên quan sẽ bị vô hiệu hóa vĩnh viễn và không thể khôi phục.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-colors"
                  >
                    Xác nhận xóa công ty
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* ====================================================== */}
        {/* COLUMN 3: RIGHT INFO SIDEBAR (SCROLLS INDEPENDENTLY)   */}
        {/* ====================================================== */}
        <aside className="h-full min-h-0 overflow-y-auto overscroll-contain space-y-3.5 pr-0.5">
          {/* ---------------- 1. THÔNG TIN LIÊN HỆ ---------------- */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                THÔNG TIN LIÊN HỆ
              </span>
              <button
                type="button"
                onClick={() => handleSelectSection("contact_info")}
                className="text-[#0062ff] hover:underline font-bold text-[11px] flex items-center gap-0.5 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>Chỉnh sửa</span>
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="space-y-0.5">
                <span className="text-[10.5px] font-bold text-slate-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>Email tuyển dụng chính</span>
                </span>
                <span className="font-bold text-slate-900 block truncate pl-5">
                  {formData.contact.email}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10.5px] font-bold text-slate-400 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Hotline tuyển dụng</span>
                </span>
                <span className="font-bold text-slate-900 block pl-5">
                  {formData.contact.hotline}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10.5px] font-bold text-slate-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-purple-600" />
                  <span>Website tuyển dụng</span>
                </span>
                <a
                  href={`https://${formData.contact.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-[#0062ff] hover:underline block truncate pl-5"
                >
                  {formData.contact.website}
                </a>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSelectSection("contact_info")}
              className="w-full text-center text-[#0062ff] hover:underline font-bold text-xs pt-1 cursor-pointer block"
            >
              Xem tất cả liên hệ →
            </button>
          </div>

          {/* ---------------- 2. MẠNG XÃ HỘI ---------------------- */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                MẠNG XÃ HỘI
              </span>
              <button
                type="button"
                onClick={() => handleSelectSection("socials")}
                className="text-[#0062ff] hover:underline font-bold text-[11px] flex items-center gap-0.5 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>Chỉnh sửa</span>
              </button>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-1 justify-between">
              <a
                href={formData.socials.linkedin}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs hover:bg-blue-600 hover:text-white transition-colors shadow-2xs"
                title="LinkedIn"
              >
                in
              </a>
              <a
                href={formData.socials.facebook}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-black text-xs hover:bg-blue-700 hover:text-white transition-colors shadow-2xs"
                title="Facebook"
              >
                f
              </a>
              <a
                href={formData.socials.youtube}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-black text-xs hover:bg-red-600 hover:text-white transition-colors shadow-2xs"
                title="YouTube"
              >
                ▶
              </a>
              <a
                href={formData.socials.tiktok}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-slate-100 text-slate-900 flex items-center justify-center font-black text-xs hover:bg-slate-900 hover:text-white transition-colors shadow-2xs"
                title="TikTok"
              >
                d
              </a>
            </div>

            <button
              type="button"
              onClick={() => handleSelectSection("socials")}
              className="w-full text-center text-[#0062ff] hover:underline font-bold text-xs pt-1 cursor-pointer block"
            >
              Xem tất cả →
            </button>
          </div>

          {/* ---------------- 3. TÀI LIỆU CÔNG TY ----------------- */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                TÀI LIỆU CÔNG TY
              </span>
              <button
                type="button"
                onClick={() => message.info("Mở quản lý tài liệu doanh nghiệp")}
                className="text-[#0062ff] hover:underline font-bold text-[11px] cursor-pointer"
              >
                Quản lý
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {COMPANY_DOCUMENTS.map((doc) => (
                <div
                  key={doc.id}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-md bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-slate-800 block truncate text-[11px]">
                      {doc.name}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {doc.size} • {doc.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => message.info("Xem toàn bộ danh sách tài liệu công ty")}
              className="w-full text-center text-[#0062ff] hover:underline font-bold text-xs pt-1 cursor-pointer block"
            >
              Xem tất cả tài liệu →
            </button>
          </div>

          {/* ---------------- 4. HOẠT ĐỘNG GẦN ĐÂY ---------------- */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                HOẠT ĐỘNG GẦN ĐÂY
              </span>
              <button
                type="button"
                onClick={() => message.info("Xem toàn bộ nhật ký cài đặt công ty")}
                className="text-[#0062ff] hover:underline font-bold text-[11px] cursor-pointer"
              >
                Xem tất cả
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {RECENT_ACTIVITIES.map((act) => (
                <div key={act.id} className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-md bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-3 h-3" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-slate-800 block text-[11px] leading-snug">
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
        </aside>
      </div>

      {/* ======================================================== */}
      {/* 4. MODALS (LOGO, BANNER, VALUE, BENEFIT, AWARD, DELETE)  */}
      {/* ======================================================== */}
      {/* 4.1 Logo Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Edit3 className="w-5 h-5 text-[#0062ff]" />
            <span>Cập nhật Logo công ty</span>
          </div>
        }
        open={isLogoModalOpen}
        onCancel={() => setIsLogoModalOpen(false)}
        footer={null}
        width={440}
        centered
      >
        <div className="space-y-4 pt-2 text-xs">
          <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-2 bg-slate-50 hover:bg-blue-50/30 transition-colors cursor-pointer">
            <Camera className="w-8 h-8 text-[#0062ff] mx-auto" />
            <div>
              <span className="font-bold text-slate-900 block">Chọn file ảnh từ máy tính</span>
              <span className="text-[10.5px] text-slate-400 block">Kích thước chuẩn: 400x400px (PNG, JPG tối đa 2MB)</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsLogoModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogoModalOpen(false);
                message.success("Đã cập nhật logo công ty thành công!");
              }}
              className="px-4 py-2 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold shadow-sm cursor-pointer"
            >
              Lưu logo
            </button>
          </div>
        </div>
      </Modal>

      {/* 4.2 Banner Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Camera className="w-5 h-5 text-[#0062ff]" />
            <span>Cập nhật Ảnh bìa (Banner)</span>
          </div>
        }
        open={isBannerModalOpen}
        onCancel={() => setIsBannerModalOpen(false)}
        footer={null}
        width={500}
        centered
      >
        <div className="space-y-4 pt-2 text-xs">
          <div className="p-5 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-2 bg-slate-50 hover:bg-blue-50/30 transition-colors cursor-pointer">
            <ImageIcon className="w-8 h-8 text-[#0062ff] mx-auto" />
            <div>
              <span className="font-bold text-slate-900 block">Chọn ảnh bìa ngang từ máy tính</span>
              <span className="text-[10.5px] text-slate-400 block">Kích thước chuẩn: 1920x600px (JPG, PNG tối đa 5MB)</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsBannerModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => {
                setIsBannerModalOpen(false);
                message.success("Đã cập nhật ảnh bìa công ty thành công!");
              }}
              className="px-4 py-2 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold shadow-sm cursor-pointer"
            >
              Lưu ảnh bìa
            </button>
          </div>
        </div>
      </Modal>

      {/* 4.3 Value Modal */}
      <Modal
        title="Thêm giá trị văn hóa cốt lõi"
        open={isValueModalOpen}
        onCancel={() => setIsValueModalOpen(false)}
        footer={null}
        width={440}
        centered
      >
        <div className="space-y-3 pt-2 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Tên giá trị</label>
            <Input
              value={newValue.title}
              onChange={(e) => setNewValue({ ...newValue, title: e.target.value })}
              placeholder="VD: Đổi mới sáng tạo"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Mô tả ý nghĩa</label>
            <Input.TextArea
              rows={3}
              value={newValue.desc}
              onChange={(e) => setNewValue({ ...newValue, desc: e.target.value })}
              placeholder="Mô tả ngắn gọn về giá trị này..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsValueModalOpen(false)}
              className="px-3.5 py-1.5 bg-slate-100 text-slate-700 font-bold rounded-xl"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleAddValue}
              className="px-3.5 py-1.5 bg-[#0062ff] text-white font-bold rounded-xl"
            >
              Thêm
            </button>
          </div>
        </div>
      </Modal>

      {/* 4.4 Benefit Modal */}
      <Modal
        title="Thêm chính sách phúc lợi"
        open={isBenefitModalOpen}
        onCancel={() => setIsBenefitModalOpen(false)}
        footer={null}
        width={440}
        centered
      >
        <div className="space-y-3 pt-2 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Danh mục phúc lợi</label>
            <Select
              value={newBenefit.category}
              onChange={(val) => setNewBenefit({ ...newBenefit, category: val })}
              className="w-full"
              options={[
                { value: "Lương thưởng", label: "Lương thưởng" },
                { value: "Bảo hiểm", label: "Bảo hiểm" },
                { value: "Nghỉ phép", label: "Nghỉ phép" },
                { value: "Đào tạo", label: "Đào tạo & Phát triển" },
                { value: "Thiết bị", label: "Trang thiết bị làm việc" },
                { value: "Sự kiện", label: "Du lịch & Team building" },
              ]}
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Tên phúc lợi</label>
            <Input
              value={newBenefit.title}
              onChange={(e) => setNewBenefit({ ...newBenefit, title: e.target.value })}
              placeholder="VD: Thưởng tháng 13 & ESOP"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Mô tả chi tiết</label>
            <Input.TextArea
              rows={3}
              value={newBenefit.desc}
              onChange={(e) => setNewBenefit({ ...newBenefit, desc: e.target.value })}
              placeholder="Mô tả quyền lợi nhân viên được hưởng..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsBenefitModalOpen(false)}
              className="px-3.5 py-1.5 bg-slate-100 text-slate-700 font-bold rounded-xl"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleAddBenefit}
              className="px-3.5 py-1.5 bg-[#0062ff] text-white font-bold rounded-xl"
            >
              Thêm phúc lợi
            </button>
          </div>
        </div>
      </Modal>

      {/* 4.5 Award Modal */}
      <Modal
        title="Thêm giải thưởng / chứng nhận"
        open={isAwardModalOpen}
        onCancel={() => setIsAwardModalOpen(false)}
        footer={null}
        width={440}
        centered
      >
        <div className="space-y-3 pt-2 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Tên giải thưởng / Chứng nhận</label>
            <Input
              value={newAward.title}
              onChange={(e) => setNewAward({ ...newAward, title: e.target.value })}
              placeholder="VD: Top 10 nơi làm việc tốt nhất"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Tổ chức cấp</label>
              <Input
                value={newAward.issuer}
                onChange={(e) => setNewAward({ ...newAward, issuer: e.target.value })}
                placeholder="VD: Anphabe"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Năm đạt giải</label>
              <Input
                value={newAward.year}
                onChange={(e) => setNewAward({ ...newAward, year: e.target.value })}
                placeholder="2024"
              />
            </div>
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Mô tả</label>
            <Input.TextArea
              rows={2}
              value={newAward.desc}
              onChange={(e) => setNewAward({ ...newAward, desc: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAwardModalOpen(false)}
              className="px-3.5 py-1.5 bg-slate-100 text-slate-700 font-bold rounded-xl"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleAddAward}
              className="px-3.5 py-1.5 bg-[#0062ff] text-white font-bold rounded-xl"
            >
              Lưu giải thưởng
            </button>
          </div>
        </div>
      </Modal>

      {/* 4.6 Delete Company Confirm Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
            <AlertTriangle className="w-5 h-5" />
            <span>Xác nhận xóa tài khoản công ty</span>
          </div>
        }
        open={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        footer={null}
        width={460}
        centered
      >
        <div className="space-y-4 pt-2 text-xs">
          <p className="text-slate-700 leading-relaxed m-0">
            Hành động này <strong className="text-rose-600">KHÔNG THỂ HOÀN TÁC</strong>. Để xác nhận, vui lòng liên hệ trực tiếp với bộ phận Quản trị hệ thống Careza để hoàn tất quy trình thanh lý và đối soát dữ liệu.
          </p>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={() => {
                setIsDeleteModalOpen(false);
                message.info("Đã gửi yêu cầu hỗ trợ hủy dịch vụ tới Admin Careza.");
              }}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-sm cursor-pointer"
            >
              Gửi yêu cầu xóa
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
