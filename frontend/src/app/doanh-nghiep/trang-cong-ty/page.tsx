"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Modal,
  Progress,
  Spin,
  App,
  Empty,
} from "antd";
import {
  Building,
  MapPin,
  Users,
  Globe,
  Mail,
  Phone,
  ExternalLink,
  Edit3,
  CheckCircle2,
  Calendar,
  Briefcase,
  Star,
  Eye,
  Camera,
  Play,
  Share2,
  Bookmark,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Award,
  Zap,
  Target,
  Compass,
  Heart,
  Smile,
  Laptop,
  Coffee,
  Plane,
  FileText,
  DollarSign,
  Layers,
  BarChart3,
  Clock,
  Plus,
  HelpCircle,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { employerService } from "@/services/employer.service";
import { billingService } from "@/services/billing.service";

// Dynamically import Leaflet Map Component with SSR disabled
const CompanyLocationMap = dynamic(
  () => import("@/components/shared/CompanyLocationMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2 min-h-[190px]">
        <Spin size="small" />
        <span className="text-slate-400 text-xs">Đang tải bản đồ...</span>
      </div>
    ),
  }
);

// =====================================================================
// DATA TYPES & INTERFACES
// =====================================================================

export interface CompanyBranchItem {
  id: string;
  name: string;
  isHeadquarter: boolean;
  address: string;
  phone: string;
  email: string;
  lat: number;
  lng: number;
}

export interface DepartmentItem {
  id: string;
  name: string;
  memberCount: string;
  iconBg: string;
  iconColor: string;
}

export interface BenefitItem {
  id: string;
  title: string;
  description: string;
  iconColor: string;
  bgColor: string;
}

export interface CultureValueItem {
  id: string;
  title: string;
  description: string;
  bgColor: string;
  iconColor: string;
}

export interface CompanyJobItem {
  id: string;
  title: string;
  salary: string;
  location: string;
  type: string;
  matchScore: number;
}

// =====================================================================
// MOCK / INITIAL DATA DEFINITIONS
// =====================================================================

const DEFAULT_COMPANY_DATA = {
  name: "Google Vietnam",
  slug: "google-vietnam",
  logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png",
  coverImage: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1800&q=80",
  slogan: "Công ty công nghệ hàng đầu trong lĩnh vực tìm kiếm & quảng cáo trực tuyến...",
  industry: "Công nghệ thông tin",
  location: "Hà Nội, Việt Nam",
  website: "https://careers.google.com",
  foundedYear: 1999,
  isVerified: true,
  completionPercent: 85,
  stats: {
    experience: "27+ năm",
    size: "5.000+",
    activeJobsCount: 48,
    branchesCount: 4,
    followersCount: "12.5K",
    rating: "4.8/5",
    reviewsCount: "1.2K",
  },
  description:
    "Google Vietnam là một phần của Tập đoàn Google – công ty công nghệ hàng đầu thế giới. Chúng tôi cam kết xây dựng những sản phẩm và nền tảng hữu ích, giúp mọi người kết nối, trao quyền và tạo ra tác động tích cực cho xã hội.",
  mission: "Tổ chức thông tin thế giới và làm cho nó hữu ích...",
  vision: "Kiến tạo công nghệ cho một tương lai tốt đẹp hơn...",
  coreValueSummary: "Đổi mới – Minh bạch – Tôn trọng – Hợp tác",
  videoUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80",
  socials: {
    linkedin: "https://linkedin.com/company/google",
    facebook: "https://facebook.com/GoogleVietnam",
    youtube: "https://youtube.com/google",
    tiktok: "https://tiktok.com/@google",
    email: "recruiting@google.com",
    hotline: "(024) 7300 7300",
    careersSite: "https://careers.google.com",
  },
};

const CULTURE_VALUES: CultureValueItem[] = [
  {
    id: "v-1",
    title: "Đổi mới",
    description: "Luôn tiên phong trong việc tạo ra sản phẩm và giải pháp mới.",
    bgColor: "bg-blue-50 text-blue-600",
    iconColor: "text-[#0062ff]",
  },
  {
    id: "v-2",
    title: "Minh bạch",
    description: "Giao tiếp cởi mở, trung thực và xây dựng niềm tin.",
    bgColor: "bg-emerald-50 text-emerald-600",
    iconColor: "text-emerald-600",
  },
  {
    id: "v-3",
    title: "Tôn trọng",
    description: "Lắng nghe và tôn trọng sự đa dạng của mỗi cá nhân.",
    bgColor: "bg-purple-50 text-purple-600",
    iconColor: "text-purple-600",
  },
  {
    id: "v-4",
    title: "Khách hàng là trung tâm",
    description: "Đặt người dùng làm trung tâm trong mọi quyết định và hành động.",
    bgColor: "bg-orange-50 text-orange-600",
    iconColor: "text-orange-600",
  },
  {
    id: "v-5",
    title: "Học hỏi",
    description: "Không ngừng học hỏi để phát triển bản thân và tổ chức.",
    bgColor: "bg-pink-50 text-pink-600",
    iconColor: "text-pink-600",
  },
  {
    id: "v-6",
    title: "Hợp tác",
    description: "Sức mạnh của tập thể để tạo ra những điều phi thường.",
    bgColor: "bg-cyan-50 text-cyan-600",
    iconColor: "text-cyan-600",
  },
];

const GALLERY_IMAGES = [
  { id: "img-1", url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80", title: "Khu sảnh lễ tân" },
  { id: "img-2", url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80", title: "Thảo luận nhóm" },
  { id: "img-3", url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=600&q=80", title: "Không gian mở" },
  { id: "img-4", url: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=600&q=80", title: "Pantry & Giải trí" },
];

const BENEFITS: BenefitItem[] = [
  {
    id: "b-1",
    title: "Thu nhập cạnh tranh",
    description: "Lương thưởng hấp dẫn và bonus theo hiệu quả.",
    bgColor: "bg-emerald-50 text-emerald-600",
    iconColor: "text-emerald-600",
  },
  {
    id: "b-2",
    title: "Bảo hiểm cao cấp",
    description: "Bảo hiểm sức khỏe, tai nạn 24/7 cho nhân viên.",
    bgColor: "bg-blue-50 text-blue-600",
    iconColor: "text-blue-600",
  },
  {
    id: "b-3",
    title: "Đào tạo & phát triển",
    description: "Ngân sách đào tạo hàng năm, khóa học nội bộ & quốc tế.",
    bgColor: "bg-purple-50 text-purple-600",
    iconColor: "text-purple-600",
  },
  {
    id: "b-4",
    title: "Làm việc linh hoạt",
    description: "Hybrid/Remote linh hoạt, giờ làm việc linh hoạt.",
    bgColor: "bg-cyan-50 text-cyan-600",
    iconColor: "text-cyan-600",
  },
  {
    id: "b-5",
    title: "Thiết bị hiện đại",
    description: "Trang bị laptop, màn hình, phụ kiện cao cấp.",
    bgColor: "bg-slate-100 text-slate-700",
    iconColor: "text-slate-700",
  },
  {
    id: "b-6",
    title: "Team building",
    description: "Du lịch, sự kiện, hoạt động kết nối hàng năm.",
    bgColor: "bg-rose-50 text-rose-600",
    iconColor: "text-rose-600",
  },
];

const DEPARTMENTS: DepartmentItem[] = [
  { id: "d-1", name: "IT - Phát triển", memberCount: "1.256 nhân viên", iconBg: "bg-blue-50", iconColor: "text-[#0062ff]" },
  { id: "d-2", name: "Sản phẩm", memberCount: "842 nhân viên", iconBg: "bg-purple-50", iconColor: "text-purple-600" },
  { id: "d-3", name: "Marketing", memberCount: "456 nhân viên", iconBg: "bg-rose-50", iconColor: "text-rose-600" },
  { id: "d-4", name: "Nhân sự", memberCount: "328 nhân viên", iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
  { id: "d-5", name: "Tài chính", memberCount: "186 nhân viên", iconBg: "bg-amber-50", iconColor: "text-amber-600" },
  { id: "d-6", name: "Hỗ trợ khách hàng", memberCount: "156 nhân viên", iconBg: "bg-cyan-50", iconColor: "text-cyan-600" },
];

// =====================================================================
// MAIN COMPONENT: TRANG CÔNG TY (EXACT CLONE OF REFERENCE)
// =====================================================================

export default function EmployerCompanyPage() {
  const { message } = App.useApp();
  const { user, companyInfo } = useAuthStore();

  const [company, setCompany] = useState(DEFAULT_COMPANY_DATA);
  const [branches, setBranches] = useState<CompanyBranchItem[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<CompanyBranchItem | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync recruiter or company name from auth store if available
  useEffect(() => {
    async function loadAllCompanyData() {
      try {
        setLoading(true);
        const [profileRes, branchRes, jobsRes, actRes, subRes] = await Promise.allSettled([
          employerService.getCompanyProfile(),
          employerService.getBranches(),
          employerService.getJobs({ page: 1, status: "published" }),
          employerService.getActivities(),
          billingService.getCurrentSubscription(),
        ]);

        if (profileRes.status === "fulfilled" && profileRes.value.data?.company) {
          const c = profileRes.value.data.company;
          setCompany((prev) => ({
            ...prev,
            name: c.name || prev.name,
            slug: c.slug || prev.slug,
            logo: c.logo_url || prev.logo,
            coverImage: c.branding?.banner_url || prev.coverImage,
            slogan: c.branding?.slogan || prev.slogan,
            description: c.description || prev.description,
            website: c.website || prev.website,
            isVerified: c.verification_status === "verified",
            stats: {
              ...prev.stats,
              size: c.company_size || prev.stats.size,
              branchesCount: c.branches?.length ?? prev.stats.branchesCount,
            },
            socials: c.branding?.social_links ? { ...prev.socials, ...c.branding.social_links } : prev.socials,
          }));
        }

        if (branchRes.status === "fulfilled" && branchRes.value.data?.branches) {
          const bList = branchRes.value.data.branches.map((b: any, idx: number) => ({
            id: String(b.id),
            name: b.name,
            isHeadquarter: idx === 0,
            address: b.address || "",
            phone: b.phone || "",
            email: b.email || "",
            lat: b.latitude || 21.0285,
            lng: b.longitude || 105.7839,
          }));
          setBranches(bList);
          setSelectedBranch(bList.length > 0 ? bList[0] : null);
        }

        if (jobsRes.status === "fulfilled" && jobsRes.value.data?.items) {
          setJobs(jobsRes.value.data.items);
        }

        if (actRes.status === "fulfilled" && actRes.value.data?.activities) {
          setActivities(actRes.value.data.activities);
        }

        if (subRes.status === "fulfilled" && subRes.value.data?.subscription) {
          setCurrentPlan(subRes.value.data.subscription);
        }
      } catch {
        // Fallback gracefully
      } finally {
        setLoading(false);
      }
    }
    loadAllCompanyData();
  }, [companyInfo]);

  const recruiterName = user?.fullName || "Mai Phương";

  return (
    <div className="space-y-4 w-full font-sans pb-16 bg-[#F6F8FC] -m-3 sm:-m-4 lg:-m-5 p-3 sm:p-4 lg:p-5">
      {/* ======================================================== */}
      {/* 1. TOP HEADER                                            */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-transparent">
        <div>
          <span className="text-xs text-slate-500 font-medium block">
            Xin chào, {recruiterName}! 👋
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 m-0 tracking-tight leading-tight">
            Trang công ty
          </h1>
          <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
            Quản lý và giới thiệu thông tin công ty của bạn trên Careza.
          </p>
        </div>

        {/* Public Candidate Company View Button */}
        <div>
          <Link
            href="/cong-ty/fpt"
            target="_blank"
            className="px-4 py-2 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Xem trang công ty (Ứng viên)</span>
          </Link>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. COMPANY HERO (COVER BANNER + IDENTITY CARD)           */}
      {/* ======================================================== */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs bg-slate-900 min-h-[290px] sm:min-h-[310px] flex flex-col justify-between p-5 sm:p-6 text-white">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={company.coverImage}
            alt={company.name}
            className="w-full h-full object-cover opacity-80"
          />
          {/* Subtle Left Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent" />
        </div>

        {/* Top Content Row: Left Identity & Right Edit Button */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          {/* Left Brand Identity */}
          <div className="flex items-start gap-4">
            {/* Logo Card */}
            <div className="relative w-22 h-22 sm:w-24 sm:h-24 rounded-2xl bg-white p-2 shadow-lg flex items-center justify-center shrink-0">
              <img
                src={company.logo}
                alt={company.name}
                className="w-full h-full object-contain"
              />
              <button
                type="button"
                onClick={() => message.info("Chỉnh sửa logo công ty")}
                className="absolute bottom-1 right-1 w-6 h-6 rounded-lg bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Đổi logo"
              >
                <Camera className="w-3 h-3" />
              </button>
            </div>

            {/* Name, Slogan, Metadata */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white m-0">
                  {company.name}
                </h2>
                {company.isVerified && (
                  <span className="w-5 h-5 rounded-full bg-[#0062ff] text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 fill-white text-[#0062ff]" />
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 font-medium m-0 max-w-xl leading-relaxed">
                {company.slogan}
              </p>

              <div className="flex items-center gap-4 text-[11px] text-slate-300 font-medium pt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>{company.industry}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{company.location}</span>
                </span>
                <span>•</span>
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-blue-300 hover:text-white transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span>{company.website}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Action: Edit Button */}
          <Link
            href="/doanh-nghiep/cai-dat-cong-ty"
            className="px-3.5 py-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-800 font-bold text-xs shadow-md flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-600" />
            <span>Chỉnh sửa trang công ty</span>
          </Link>
        </div>

        {/* Bottom Left Floating Card: Profile Completion */}
        <div className="relative z-10 max-w-md bg-white/95 backdrop-blur-md rounded-xl p-3 text-slate-900 shadow-md border border-white/40 mt-6 sm:mt-4">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="text-slate-800">Mức độ hoàn thiện hồ sơ doanh nghiệp</span>
            <span className="text-[#0062ff] font-black">{company.completionPercent}%</span>
          </div>

          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-2">
            <div
              className="bg-[#0062ff] h-full rounded-full transition-all duration-500"
              style={{ width: `${company.completionPercent}%` }}
            />
          </div>

          <div className="flex justify-end">
            <Link
              href="/doanh-nghiep/cai-dat-cong-ty"
              className="text-[#0062ff] hover:underline font-bold text-[11px] flex items-center gap-0.5"
            >
              <span>Hoàn thiện ngay</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. 6 COMPANY KPI CARDS (ONE ROW)                         */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* KPI 1 */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-1.5 hover:border-blue-300 transition-all text-center flex flex-col items-center justify-between">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-0.5 shadow-2xs">
            <Briefcase className="w-4 h-4" />
          </div>
          <div className="w-full text-center space-y-0.5">
            <span className="text-[11px] font-bold text-slate-500 block">Năm hoạt động</span>
            <span className="text-lg font-black text-slate-900 block leading-tight">
              {company.stats.experience}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block">Từ {company.foundedYear}</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-1.5 hover:border-emerald-300 transition-all text-center flex flex-col items-center justify-between">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-0.5 shadow-2xs">
            <Users className="w-4 h-4" />
          </div>
          <div className="w-full text-center space-y-0.5">
            <span className="text-[11px] font-bold text-slate-500 block">Quy mô nhân sự</span>
            <span className="text-lg font-black text-slate-900 block leading-tight">
              {company.stats.size}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block">nhân viên</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-1.5 hover:border-cyan-300 transition-all text-center flex flex-col items-center justify-between">
          <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center mb-0.5 shadow-2xs">
            <Briefcase className="w-4 h-4" />
          </div>
          <div className="w-full text-center space-y-0.5">
            <span className="text-[11px] font-bold text-slate-500 block">Việc làm đang tuyển</span>
            <span className="text-lg font-black text-[#0062ff] block leading-tight">
              {company.stats.activeJobsCount}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block">vị trí</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-1.5 hover:border-orange-300 transition-all text-center flex flex-col items-center justify-between">
          <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center mb-0.5 shadow-2xs">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="w-full text-center space-y-0.5">
            <span className="text-[11px] font-bold text-slate-500 block">Chi nhánh</span>
            <span className="text-lg font-black text-slate-900 block leading-tight">
              {company.stats.branchesCount}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block">tỉnh/thành</span>
          </div>
        </div>

        {/* KPI 5 */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-1.5 hover:border-amber-300 transition-all text-center flex flex-col items-center justify-between">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-0.5 shadow-2xs">
            <Star className="w-4 h-4" />
          </div>
          <div className="w-full text-center space-y-0.5">
            <span className="text-[11px] font-bold text-slate-500 block">Lượt theo dõi</span>
            <span className="text-lg font-black text-slate-900 block leading-tight">
              {company.stats.followersCount}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block">lượt theo dõi</span>
          </div>
        </div>

        {/* KPI 6 */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-1.5 hover:border-rose-300 transition-all text-center flex flex-col items-center justify-between">
          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-0.5 shadow-2xs">
            <Heart className="w-4 h-4" />
          </div>
          <div className="w-full text-center space-y-0.5">
            <span className="text-[11px] font-bold text-slate-500 block">Đánh giá công ty</span>
            <span className="text-lg font-black text-slate-900 block leading-tight">
              {company.stats.rating}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block">{company.stats.reviewsCount} đánh giá</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. MAIN 2-COLUMN WORKSPACE (LEFT 75% | RIGHT 25%)        */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* ====================================================== */}
        {/* LEFT COLUMN: ABOUT, CULTURE, GALLERY, BENEFITS, JOBS   */}
        {/* ====================================================== */}
        <div className="xl:col-span-8 2xl:col-span-9 space-y-4">
          {/* ---------------- 4.1 GIỚI THIỆU VỀ CHÚNG TÔI --------- */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3.5">
            <div className="pb-1 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 m-0">
                Giới thiệu về chúng tôi
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              {/* Left Description (5 cols) */}
              <div className="md:col-span-5 space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed font-medium m-0">
                  {company.description}
                </p>

                {/* 3 Mini Highlights with Soft Pastel Backgrounds */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                  {/* Sứ mệnh */}
                  <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-100/90 space-y-1">
                    <div className="flex items-center gap-1.5 text-[#0062ff] font-bold">
                      <Target className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-[11px] font-black text-slate-900">Sứ mệnh</span>
                    </div>
                    <span className="text-[10px] text-slate-600 font-medium block leading-snug">
                      {company.mission}
                    </span>
                  </div>

                  {/* Tầm nhìn */}
                  <div className="p-2.5 rounded-xl bg-purple-50/80 border border-purple-100/90 space-y-1">
                    <div className="flex items-center gap-1.5 text-purple-600 font-bold">
                      <Compass className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-[11px] font-black text-slate-900">Tầm nhìn</span>
                    </div>
                    <span className="text-[10px] text-slate-600 font-medium block leading-snug">
                      {company.vision}
                    </span>
                  </div>

                  {/* Giá trị cốt lõi */}
                  <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-100/90 space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-[11px] font-black text-slate-900">Giá trị cốt lõi</span>
                    </div>
                    <span className="text-[10px] text-slate-600 font-medium block leading-snug">
                      {company.coreValueSummary}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Company Video Thumbnail (7 cols) */}
              <div className="md:col-span-7 relative rounded-2xl overflow-hidden aspect-16/9 bg-slate-900 shadow-xs group cursor-pointer">
                <img
                  src={company.videoUrl}
                  alt="Company Video"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => message.info("Xem video giới thiệu doanh nghiệp")}
                    className="w-12 h-12 rounded-full bg-white text-[#0062ff] shadow-lg flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Play className="w-5 h-5 fill-[#0062ff] ml-0.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ---------------- 4.2 VĂN HÓA & GIÁ TRỊ CỐT LÕI ------- */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 m-0">
                Văn hóa & Giá trị cốt lõi
              </h3>
              <Link
                href="/doanh-nghiep/cai-dat-cong-ty"
                className="text-[#0062ff] hover:underline font-bold text-xs flex items-center gap-0.5"
              >
                <span>Xem tất cả</span>
                <span>→</span>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {CULTURE_VALUES.map((val) => (
                <div
                  key={val.id}
                  className="p-3.5 sm:p-4 rounded-xl border border-slate-200/80 bg-white space-y-2 hover:border-blue-300 hover:shadow-2xs transition-all text-center flex flex-col items-center justify-between"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className={`w-7 h-7 rounded-lg ${val.bgColor} flex items-center justify-center font-bold text-xs`}>
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="text-xs font-black text-slate-900 m-0 leading-snug">
                      {val.title}
                    </h4>
                  </div>
                  <p className="text-[10.5px] text-slate-500 font-medium m-0 leading-relaxed text-center mt-1">
                    {val.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ---------------- 4.3 MÔI TRƯỜNG LÀM VIỆC (GALLERY) --- */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 m-0">
                Môi trường làm việc
              </h3>
              <Link
                href="/doanh-nghiep/cai-dat-cong-ty"
                className="text-[#0062ff] hover:underline font-bold text-xs flex items-center gap-0.5"
              >
                <span>Xem tất cả</span>
                <span>→</span>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {GALLERY_IMAGES.slice(0, 3).map((img) => (
                <div
                  key={img.id}
                  onClick={() => setLightboxImage(img.url)}
                  className="group relative rounded-xl overflow-hidden aspect-4/3 bg-slate-100 cursor-pointer shadow-2xs"
                >
                  <img
                    src={img.url}
                    alt={img.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}

              {/* 4th Thumbnail with +12 Overlay */}
              <div
                onClick={() => setLightboxImage(GALLERY_IMAGES[3].url)}
                className="relative rounded-xl overflow-hidden aspect-4/3 bg-slate-900 cursor-pointer shadow-2xs group"
              >
                <img
                  src={GALLERY_IMAGES[3].url}
                  alt="Other images"
                  className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center">
                  <span className="text-lg font-black block leading-none">+12</span>
                  <span className="text-[11px] font-bold mt-1">ảnh khác</span>
                </div>
              </div>
            </div>
          </div>

          {/* ---------------- 4.4 PHÚC LỢI NỔI BẬT ---------------- */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 m-0">
                Phúc lợi nổi bật
              </h3>
              <Link
                href="/doanh-nghiep/cai-dat-cong-ty"
                className="text-[#0062ff] hover:underline font-bold text-xs flex items-center gap-0.5"
              >
                <span>Xem tất cả</span>
                <span>→</span>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {BENEFITS.map((ben) => (
                <div
                  key={ben.id}
                  className="p-3.5 sm:p-4 rounded-xl border border-slate-200/80 bg-white space-y-2 hover:border-blue-300 hover:shadow-2xs transition-all text-center flex flex-col items-center justify-between"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className={`w-7 h-7 rounded-lg ${ben.bgColor} flex items-center justify-center`}>
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="text-xs font-black text-slate-900 m-0 leading-snug">
                      {ben.title}
                    </h4>
                  </div>
                  <p className="text-[10.5px] text-slate-500 font-medium m-0 leading-relaxed text-center mt-1">
                    {ben.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ---------------- 4.5 PHÒNG BAN (40%) & CHI NHÁNH (60%) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
            {/* Left: Phòng ban & đội ngũ (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-1 border-b border-slate-100 mb-2">
                  <h3 className="text-xs sm:text-[13px] font-black text-slate-900 m-0">
                    Phòng ban & đội ngũ
                  </h3>
                  <Link
                    href="/doanh-nghiep/cai-dat-cong-ty"
                    className="text-[#0062ff] hover:underline font-bold text-xs"
                  >
                    Xem tất cả (48)
                  </Link>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {DEPARTMENTS.map((dept) => (
                    <div key={dept.id} className="py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-md ${dept.iconBg} ${dept.iconColor} flex items-center justify-center text-xs font-bold`}>
                          <Building className="w-3 h-3" />
                        </div>
                        <span className="font-bold text-slate-800">{dept.name}</span>
                      </div>
                      <span className="text-slate-400 font-semibold text-[11px]">
                        {dept.memberCount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Chi nhánh & địa điểm (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <h3 className="text-xs sm:text-[13px] font-black text-slate-900 m-0">
                  Chi nhánh & địa điểm
                </h3>
                <Link
                  href="/doanh-nghiep/chi-nhanh"
                  className="text-[#0062ff] hover:underline font-bold text-xs"
                >
                  Xem tất cả
                </Link>
              </div>

              {branches.length === 0 ? (
                <div className="py-6 text-center w-full">
                  <Empty description="Chưa có thông tin chi nhánh" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                  {/* Branch list (6 cols) */}
                  <div className="sm:col-span-6 space-y-2">
                    {branches.map((br) => {
                      const isSelected = selectedBranch?.id === br.id;
                      return (
                        <div
                          key={br.id}
                          onClick={() => setSelectedBranch(br)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer space-y-0.5 ${
                            isSelected
                              ? "border-blue-300 bg-blue-50/60 shadow-2xs"
                              : "border-slate-200/80 bg-white hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-xs">
                              {br.name}
                            </span>
                            <span className="text-slate-400 font-bold text-xs">›</span>
                          </div>
                          <span className="text-[10.5px] text-slate-500 block truncate">
                            {br.address}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Leaflet Map (6 cols) */}
                  <div className="sm:col-span-6 h-52 rounded-xl overflow-hidden border border-slate-200 shadow-2xs">
                    {selectedBranch ? (
                      <CompanyLocationMap
                        companyName={company.name}
                        address={selectedBranch.address}
                        latitude={selectedBranch.lat}
                        longitude={selectedBranch.lng}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                        Chưa có thông tin vị trí
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ---------------- 4.6 VIỆC LÀM ĐANG TUYỂN (4 CARDS) --- */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 m-0">
                Việc làm đang tuyển
              </h3>
              <Link
                href="/doanh-nghiep/tin-tuyen-dung"
                className="text-[#0062ff] hover:underline font-bold text-xs"
              >
                Xem tất cả ›
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {jobs.length > 0 ? (
                jobs.slice(0, 4).map((job) => (
                  <div
                    key={job.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs transition-all space-y-2 flex flex-col justify-between"
                  >
                    <div className="space-y-1">
                      <span className="font-black text-slate-900 text-xs block truncate">
                        {job.title}
                      </span>
                      <span className="text-xs font-black text-[#0062ff] block">
                        {job.salary_min || job.salary_max
                          ? `${job.salary_min?.toLocaleString() || 0} - ${job.salary_max?.toLocaleString() || "Thỏa thuận"} ${job.salary_currency || "VND"}`
                          : "Lương thỏa thuận"}
                      </span>
                      <span className="text-[10.5px] text-slate-500 block">
                        {job.location || "Toàn quốc"} • {job.job_type || "Toàn thời gian"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold text-[10px]">
                        {job.applications_count || 0} ứng viên
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-6 text-center">
                  <Empty description="Chưa có tin tuyển dụng nào đang đăng" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ====================================================== */}
        {/* RIGHT SIDEBAR (25%): COMPLETION, RECENT, PLAN, ACTIONS */}
        {/* ====================================================== */}
        <div className="xl:col-span-4 2xl:col-span-3 space-y-4">
          {/* ---------------- 1. HOÀN THIỆN HỒ SƠ ----------------- */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-900 m-0">
                Hoàn thiện hồ sơ
              </h4>
              <span className="text-xs font-black text-[#0062ff]">
                85% hoàn thiện
              </span>
            </div>

            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-[#0062ff] h-full rounded-full w-[85%]" />
            </div>

            {/* Checklist */}
            <div className="space-y-1.5 text-xs font-medium text-slate-700">
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span className="text-slate-700">Thông tin cơ bản</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span className="text-slate-700">Giới thiệu công ty</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span className="text-slate-700">Văn hóa & Giá trị</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span className="text-slate-700">Phúc lợi</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span className="text-slate-700">Hình ảnh & Video</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span className="text-slate-700">Chi nhánh</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <span className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block shrink-0" />
                <span className="text-slate-400">Tài liệu doanh nghiệp</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span className="text-slate-700">Mạng xã hội & Liên hệ</span>
              </div>
            </div>

            <Link
              href="/doanh-nghiep/cai-dat-cong-ty"
              className="w-full py-2 bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1 transition-colors cursor-pointer block text-center"
            >
              <span>Hoàn thiện ngay</span>
              <span>→</span>
            </Link>
          </div>

          {/* ---------------- 2. HOẠT ĐỘNG GẦN ĐÂY ---------------- */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h4 className="text-xs font-black text-slate-900 m-0">
                Hoạt động gần đây
              </h4>
              <Link
                href="/doanh-nghiep/nhat-ky-hoat-dong"
                className="text-[#0062ff] hover:underline font-bold text-[11px]"
              >
                Xem tất cả
              </Link>
            </div>

            <div className="space-y-2.5 text-xs">
              {activities.length === 0 ? (
                <div className="py-4 text-center text-slate-400 text-xs">
                  Chưa có hoạt động gần đây
                </div>
              ) : (
                activities.slice(0, 5).map((act, index) => (
                  <div key={act.id || index} className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-3 h-3" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-slate-800 block text-xs truncate">
                        {act.action || act.title || "Hoạt động công ty"}
                      </span>
                      {act.sub && (
                        <span className="text-[11px] text-blue-600 font-semibold block">
                          {act.sub}
                        </span>
                      )}
                      <span className="text-[10.5px] text-slate-400 font-medium block">
                        {act.created_at ? new Date(act.created_at).toLocaleString("vi-VN") : (act.time || "Gần đây")}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ---------------- 3. GÓI DỊCH VỤ HIỆN TẠI --------------- */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h4 className="text-xs font-black text-slate-900 m-0">
                Gói dịch vụ hiện tại
              </h4>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-slate-900">👑 Premium</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold text-[10px]">
                Đang sử dụng
              </span>
            </div>

            <span className="text-[10.5px] text-slate-400 font-medium block">
              Hiệu lực đến: 12/12/2026
            </span>

            <div className="space-y-1.5 text-xs font-medium text-slate-700 pt-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 className="w-3 h-3" />
                  <span className="text-slate-700">Tin tuyển dụng</span>
                </span>
                <span className="text-slate-400 font-bold text-[11px]">Không giới hạn</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 className="w-3 h-3" />
                  <span className="text-slate-700">Ứng viên lưu trữ</span>
                </span>
                <span className="text-slate-400 font-bold text-[11px]">Không giới hạn</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 className="w-3 h-3" />
                  <span className="text-slate-700">Thành viên</span>
                </span>
                <span className="text-slate-400 font-bold text-[11px]">50 người dùng</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 className="w-3 h-3" />
                  <span className="text-slate-700">Báo cáo nâng cao</span>
                </span>
                <span className="text-slate-400 font-bold text-[11px]">Có</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 className="w-3 h-3" />
                  <span className="text-slate-700">Hiển thị trang công ty</span>
                </span>
                <span className="text-purple-600 font-bold text-[11px]">Nổi bật</span>
              </div>
            </div>

            <Link
              href="/doanh-nghiep/goi-dich-vu"
              className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xs rounded-xl shadow-xs block text-center transition-all cursor-pointer"
            >
              Nâng cấp gói
            </Link>
          </div>

          {/* ---------------- 4. THAO TÁC NHANH (3x2 GRID) ---------- */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3">
            <h4 className="text-xs font-black text-slate-900 m-0 pb-1 border-b border-slate-100">
              Thao tác nhanh
            </h4>

            <div className="grid grid-cols-3 gap-2">
              <Link
                href="/doanh-nghiep/cai-dat-cong-ty"
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-100 text-center space-y-1 transition-all flex flex-col items-center justify-center cursor-pointer group"
              >
                <Edit3 className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="text-[9.5px] font-bold text-slate-700 block leading-tight">
                  Chỉnh sửa thông tin
                </span>
              </Link>

              <Link
                href="/doanh-nghiep/thanh-vien"
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-100 text-center space-y-1 transition-all flex flex-col items-center justify-center cursor-pointer group"
              >
                <Users className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
                <span className="text-[9.5px] font-bold text-slate-700 block leading-tight">
                  Quản lý thành viên
                </span>
              </Link>

              <Link
                href="/doanh-nghiep/chi-nhanh"
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-100 text-center space-y-1 transition-all flex flex-col items-center justify-center cursor-pointer group"
              >
                <Building className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span className="text-[9.5px] font-bold text-slate-700 block leading-tight">
                  Quản lý chi nhánh
                </span>
              </Link>

              <Link
                href="/doanh-nghiep/cai-dat-cong-ty"
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 hover:border-amber-200 border border-slate-100 text-center space-y-1 transition-all flex flex-col items-center justify-center cursor-pointer group"
              >
                <Award className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
                <span className="text-[9.5px] font-bold text-slate-700 block leading-tight">
                  Quản lý phúc lợi
                </span>
              </Link>

              <Link
                href="/doanh-nghiep/cai-dat-cong-ty"
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-cyan-50 hover:border-cyan-200 border border-slate-100 text-center space-y-1 transition-all flex flex-col items-center justify-center cursor-pointer group"
              >
                <FileText className="w-4 h-4 text-cyan-600 group-hover:scale-110 transition-transform" />
                <span className="text-[9.5px] font-bold text-slate-700 block leading-tight">
                  Tài liệu công ty
                </span>
              </Link>

              <Link
                href="/doanh-nghiep/bao-cao-tuyen-dung"
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-rose-50 hover:border-rose-200 border border-slate-100 text-center space-y-1 transition-all flex flex-col items-center justify-center cursor-pointer group"
              >
                <BarChart3 className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
                <span className="text-[9.5px] font-bold text-slate-700 block leading-tight">
                  Xem báo cáo tuyển dụng
                </span>
              </Link>
            </div>
          </div>

          {/* ---------------- 5. KẾT NỐI VỚI CHÚNG TÔI -------------- */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3.5">
            <h4 className="text-xs font-black text-slate-900 m-0 pb-1.5 border-b border-slate-100">
              Kết nối với chúng tôi
            </h4>

            {/* Social icons */}
            <div className="flex items-center gap-2.5 pt-0.5">
              <a
                href={company.socials.linkedin}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs hover:bg-blue-600 hover:text-white transition-colors shadow-2xs"
                title="LinkedIn"
              >
                in
              </a>
              <a
                href={company.socials.facebook}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-black text-xs hover:bg-blue-700 hover:text-white transition-colors shadow-2xs"
                title="Facebook"
              >
                f
              </a>
              <a
                href={company.socials.youtube}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-black text-xs hover:bg-red-600 hover:text-white transition-colors shadow-2xs"
                title="YouTube"
              >
                ▶
              </a>
              <a
                href={company.socials.tiktok}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-900 flex items-center justify-center font-black text-xs hover:bg-slate-900 hover:text-white transition-colors shadow-2xs"
                title="TikTok"
              >
                d
              </a>
            </div>

            {/* Contact details with comfortable line height and spacing */}
            <div className="space-y-3 text-xs pt-2.5 border-t border-slate-100 text-slate-700">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>Email tuyển dụng</span>
                </span>
                <span className="font-bold text-slate-900 block truncate text-xs pl-5">
                  {company.socials.email}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Hotline tuyển dụng</span>
                </span>
                <span className="font-bold text-slate-900 block text-xs pl-5">
                  {company.socials.hotline}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-purple-600" />
                  <span>Website tuyển dụng</span>
                </span>
                <a
                  href={company.socials.careersSite}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-[#0062ff] hover:underline block truncate text-xs pl-5"
                >
                  {company.socials.careersSite}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. LIGHTBOX MODAL FOR GALLERY                            */}
      {/* ======================================================== */}
      <Modal
        open={!!lightboxImage}
        onCancel={() => setLightboxImage(null)}
        footer={null}
        width={720}
        centered
      >
        {lightboxImage && (
          <div className="p-1">
            <img
              src={lightboxImage}
              alt="Gallery Lightbox"
              className="w-full h-auto rounded-xl object-cover max-h-[70vh]"
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
