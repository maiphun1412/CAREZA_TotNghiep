"use client";

import { useState, useEffect, use, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { apiClient } from "@/services/api-client";
import { candidateService, type CandidateDocument } from "@/services/candidate.service";
import { mockJobs } from "@/mocks/jobs";
import { mockCompanies } from "@/mocks/companies";
import {
  message,
  Spin,
  Modal,
  Input,
  Select,
  Checkbox,
  Progress,
  Tag,
  Avatar,
  Tooltip,
} from "antd";
import {
  Heart,
  Share2,
  Rocket,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Star,
  CheckCircle2,
  GraduationCap,
  Wrench,
  Sparkles,
  Shield,
  BookOpen,
  Coffee,
  Gift,
  Calendar,
  Building2,
  Globe,
  Users,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Check,
  FileText,
  Lock,
  Compass,
  Laptop,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import dynamic from "next/dynamic";
import { RoleCode } from "@/enums/role.enum";

const { TextArea } = Input;

// Dynamic import for Leaflet Map
const CompanyLocationMap = dynamic(
  () => import("@/components/shared/CompanyLocationMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-slate-50 border border-slate-100 rounded-2xl min-h-[170px]">
        <Spin size="small" />
      </div>
    ),
  }
);

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const jobId = resolvedParams.id;
  const { user, isAuthenticated } = useAuthStore();

  // State
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [savingBookmark, setSavingBookmark] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // CV & Application state in Sidebar
  const [cvList, setCvList] = useState<CandidateDocument[]>([]);
  const [selectedCv, setSelectedCv] = useState<CandidateDocument | null>(null);
  const [isCvModalOpen, setIsCvModalOpen] = useState(false);

  const [applyForm, setApplyForm] = useState({
    fullName: user?.fullName || "Nguyễn Thị Phương Mai",
    email: user?.email || "maiphuong@gmail.com",
    phone: user?.phoneNumber || "0901 234 567",
    experienceLevel: "3 - 5 năm",
    expectedSalary: "25 - 35 triệu VND",
    coverLetter: "",
    agreedTerms: true,
  });
  const [isSubmittingApply, setIsSubmittingApply] = useState(false);

  // Fetch Job & Company detail
  useEffect(() => {
    const fetchJobDetail = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(`/jobs/${jobId}`);
        if (response.data?.data?.job) {
          const jobData = response.data.data.job;
          setJob(jobData);
          const foundComp =
            mockCompanies.find((c) => c.id === jobData.companyId) ||
            jobData.company ||
            mockCompanies[0];
          setCompany(foundComp);
        } else {
          // Fallback to mock job
          const fallback = mockJobs.find((j) => j.id === jobId) || mockJobs[0];
          setJob(fallback);
          const foundComp =
            mockCompanies.find((c) => c.id === fallback.companyId) || mockCompanies[0];
          setCompany(foundComp);
        }
      } catch {
        const fallback = mockJobs.find((j) => j.id === jobId) || mockJobs[0];
        setJob(fallback);
        setCompany(mockCompanies[0]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetail();
  }, [jobId]);

  // Load Bookmark state
  useEffect(() => {
    if (isAuthenticated && jobId) {
      candidateService
        .getBookmarkedJobIds()
        .then((res) => {
          if (res?.data?.ids?.includes(jobId)) {
            setIsSaved(true);
          } else {
            setIsSaved(false);
          }
        })
        .catch(() => setIsSaved(false));
    } else {
      setIsSaved(false);
    }
  }, [isAuthenticated, jobId]);

  // Load CV list for user
  useEffect(() => {
    if (isAuthenticated) {
      candidateService
        .getDocuments({ type: "CV" })
        .then((res) => {
          const cvs = res.data.documents;
          setCvList(cvs);
          const def = cvs.find((c) => c.isDefault) || cvs[0];
          if (def) setSelectedCv(def);
        })
        .catch(() => {
          // Fallback initial mock CV display
          setSelectedCv({
            documentId: "cv-default",
            documentName: "Nguyen_Thi_Phuong_Mai_CV.pdf",
            fileUrl: "/assets/sample-cv.pdf",
            documentType: "CV",
            versionNumber: 1,
            documentGroupId: null,
            isDefault: true,
            title: "CV Frontend / Product Manager",
            createdAt: "2026-08-28",
          });
        });
    } else {
      // Default placeholder CV for guest viewing
      setSelectedCv({
        documentId: "cv-default",
        documentName: "Nguyen_Thi_Phuong_Mai_CV.pdf",
        fileUrl: "/assets/sample-cv.pdf",
        documentType: "CV",
        versionNumber: 1,
        documentGroupId: null,
        isDefault: true,
        title: "CV Ứng tuyển chính",
        createdAt: "2026-08-28",
      });
    }

    if (user) {
      setApplyForm((prev) => ({
        ...prev,
        fullName: user.fullName || prev.fullName,
        email: user.email || prev.email,
        phone: user.phoneNumber || prev.phone,
      }));
    }
  }, [isAuthenticated, user]);

  // Handlers
  const handleToggleBookmark = async () => {
    if (!isAuthenticated) {
      message.info("Vui lòng đăng nhập để lưu việc làm.");
      router.push(`/dang-nhap?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setSavingBookmark(true);
    try {
      if (isSaved) {
        await candidateService.removeJobBookmark(jobId);
        setIsSaved(false);
        message.success("Đã bỏ lưu việc làm");
      } else {
        await candidateService.saveJobBookmark(jobId);
        setIsSaved(true);
        message.success("Đã lưu việc làm vào danh sách yêu thích");
      }
    } catch {
      message.error("Thao tác thất bại. Vui lòng thử lại.");
    } finally {
      setSavingBookmark(false);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      message.success("Đã sao chép liên kết việc làm vào bộ nhớ tạm!");
    }
  };

  const scrollToApply = () => {
    const applyElement = document.getElementById("apply-sidebar-card");
    if (applyElement) {
      applyElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToSection = (sectionId: string) => {
    setActiveTab(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      message.info("Vui lòng đăng nhập để gửi hồ sơ ứng tuyển.");
      router.push(`/dang-nhap?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (!applyForm.fullName.trim() || !applyForm.email.trim() || !applyForm.phone.trim()) {
      message.error("Vui lòng điền đầy đủ các trường thông tin bắt buộc!");
      return;
    }

    if (!applyForm.agreedTerms) {
      message.warning("Vui lòng đồng ý với Điều khoản sử dụng của Careza!");
      return;
    }

    setIsSubmittingApply(true);
    try {
      await candidateService.applyJob({
        jobPostId: jobId,
        cvId: selectedCv?.documentId,
        coverLetter: applyForm.coverLetter || undefined,
      });

      message.success("Ứng tuyển thành công! Nhà tuyển dụng sẽ xem xét hồ sơ của bạn.");
      router.push("/ung-vien/ung-tuyen");
    } catch {
      message.error("Không thể gửi hồ sơ ứng tuyển lúc này. Vui lòng thử lại!");
    } finally {
      setIsSubmittingApply(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40 flex-1 bg-[#f5f8ff] min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  // Helper properties
  const companyName = job?.company?.name || job?.companyName || company?.name || "Google Vietnam";
  const companyLogo =
    job?.company?.logoUrl ||
    job?.companyLogo ||
    company?.logoUrl ||
    "https://commons.wikimedia.org/wiki/Special:Redirect/file/Google_2015_logo.svg";
  const jobTitle = job?.title || "Product Manager";
  const rating = company?.rating || 4.8;
  const reviewsCount = company?.reviewsCount || 250;

  // Format Salary
  let salaryDisplay = job?.salary || job?.salaryText;
  if (!salaryDisplay && job?.salaryMin && job?.salaryMax) {
    salaryDisplay = `${(job.salaryMin / 1000000).toFixed(0)} - ${(job.salaryMax / 1000000).toFixed(0)} triệu VNĐ`;
  }
  if (!salaryDisplay) {
    salaryDisplay = "25 – 40 triệu VNĐ";
  }

  const locationDisplay = job?.location || job?.branch?.provinceName || "Hà Nội";
  const experienceDisplay = job?.experience || job?.experienceText || "3 – 5 năm kinh nghiệm";
  const employmentTypeDisplay = job?.employmentTypeText || "Toàn thời gian";
  const deadlineDisplay = job?.deadline || "22/09/2026";
  const locationAddress =
    job?.branch?.address ||
    job?.locationText ||
    company?.address ||
    "Lô E2, Đường D1, Khu Công nghệ cao, Quận 9, TP. Thủ Đức, TP. Hồ Chí Minh";

  // List of related jobs
  const otherCompanyJobs = mockJobs.filter((j) => j.id !== jobId).slice(0, 4);
  const similarJobs = mockJobs.filter((j) => j.id !== jobId).slice(2, 6);

  return (
    <div className="w-full bg-[#F5F8FF] min-h-screen pb-6 font-sans text-slate-800">
      {/* ======================================================== */}
      {/* 1. BREADCRUMB                                            */}
      {/* ======================================================== */}
      <div className="max-w-[1460px] mx-auto px-4 sm:px-6 md:px-8 xl:px-[38px] pt-3 pb-3">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-[#0062ff] transition-colors">
            Trang chủ
          </Link>
          <span>›</span>
          <Link href="/viec-lam" className="hover:text-[#0062ff] transition-colors">
            Việc làm
          </Link>
          <span>›</span>
          <span className="text-slate-800 font-bold truncate max-w-[280px] sm:max-w-md">
            Chi tiết công việc
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. MAIN 2-COLUMN LAYOUT (~68% MAIN | ~32% SIDEBAR)       */}
      {/* ======================================================== */}
      <div className="max-w-[1460px] mx-auto px-4 sm:px-6 md:px-8 xl:px-[38px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* ==================================================== */}
          {/* CỘT TRÁI: MAIN CONTENT (~68% -> lg:col-span-8)       */}
          {/* ==================================================== */}
          <div className="lg:col-span-8 space-y-4.5">
            {/* ---------------- 1. HERO JOB CARD (FULL BACKGROUND jd.png) ---------------- */}
            <div
              className="relative w-full rounded-[22px] overflow-hidden p-6 sm:p-7 text-white shadow-md border border-blue-900/40 flex flex-col justify-between min-h-[220px]"
              style={{
                backgroundImage: "url('/images/jd.png')",
                backgroundSize: "cover",
                backgroundPosition: "center right",
                backgroundRepeat: "no-repeat",
              }}
            >
              {/* Left Dark Gradient Overlay to ensure crisp readability for job info */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#06143d]/95 via-[#06143d]/55 to-transparent pointer-events-none" />

              {/* Decorative Glow */}
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

              {/* Top Row: Logo, Badges & Action Buttons */}
              <div className="relative z-10 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  {/* Company Logo in White Square */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white p-2.5 shadow-md flex items-center justify-center shrink-0 border border-white/20">
                    {companyLogo ? (
                      <img
                        src={companyLogo}
                        alt={companyName}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-xl font-black text-[#0062ff]">
                        {companyName.charAt(0)}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    {/* Urgency Badge */}
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Tuyển dụng gấp
                    </span>
                    <h1 className="text-xl sm:text-2xl lg:text-[26px] font-black text-white m-0 tracking-tight leading-tight">
                      {jobTitle}
                    </h1>
                    <div className="flex items-center gap-1.5 text-xs sm:text-[13px] font-semibold text-blue-100/90">
                      <span>{companyName}</span>
                      <CheckCircle className="w-3.5 h-3.5 text-blue-400 fill-blue-400/20" />
                    </div>
                  </div>
                </div>

                {/* Action Buttons Top-Right */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Bookmark Button */}
                  <Tooltip title={isSaved ? "Bỏ lưu việc làm" : "Lưu việc làm"}>
                    <button
                      type="button"
                      disabled={savingBookmark}
                      onClick={handleToggleBookmark}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer border ${
                        isSaved
                          ? "bg-rose-500 text-white border-rose-400 shadow-md"
                          : "bg-white/10 hover:bg-white/20 text-white border-white/20"
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`}
                      />
                    </button>
                  </Tooltip>

                  {/* Share Button */}
                  <Tooltip title="Chia sẻ việc làm">
                    <button
                      type="button"
                      onClick={handleShare}
                      className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center justify-center transition-all cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </Tooltip>

                  {/* Apply CTA Button in Hero */}
                  <button
                    type="button"
                    onClick={scrollToApply}
                    className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-[#0062ff] hover:bg-blue-50 font-extrabold text-xs shadow-md transition-all cursor-pointer active:scale-95"
                  >
                    <Rocket className="w-3.5 h-3.5" />
                    <span>Ứng tuyển ngay</span>
                  </button>
                </div>
              </div>

              {/* Bottom Row: Inline Metadata Pills */}
              <div className="relative z-10 pt-5 flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs text-white/90 font-medium">
                {/* Rating */}
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 backdrop-blur-xs">
                  <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  <span className="font-bold text-amber-200">{rating}</span>
                  <span className="text-white/70 text-[11px]">({reviewsCount} đánh giá)</span>
                </div>

                {/* Location */}
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 backdrop-blur-xs">
                  <MapPin className="w-3.5 h-3.5 text-sky-300" />
                  <span>{locationDisplay}</span>
                </div>

                {/* Experience */}
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 backdrop-blur-xs">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-300" />
                  <span>{experienceDisplay}</span>
                </div>

                {/* Salary */}
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/15 border border-emerald-400/40 text-emerald-200 font-bold backdrop-blur-xs">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{salaryDisplay}</span>
                </div>

                {/* Employment Type */}
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 backdrop-blur-xs">
                  <Clock className="w-3.5 h-3.5 text-purple-300" />
                  <span>{employmentTypeDisplay}</span>
                </div>
              </div>
            </div>

            {/* ---------------- 2. TAB NAVIGATION BAR ---------------- */}
            <div className="bg-white rounded-2xl p-1.5 border border-[#E2E8F0] shadow-2xs overflow-x-auto scrollbar-none flex items-center gap-1">
              {[
                { id: "overview", label: "Tổng quan" },
                { id: "description", label: "Mô tả công việc" },
                { id: "requirements", label: "Yêu cầu ứng viên" },
                { id: "benefits", label: "Quyền lợi & phúc lợi" },
                { id: "recruitment-process", label: "Quy trình tuyển dụng" },
                { id: "company-about", label: "Công ty" },
                { id: "reviews", label: `Đánh giá (${reviewsCount})` },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => scrollToSection(tab.id)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-[13px] font-bold whitespace-nowrap transition-all cursor-pointer relative ${
                      isActive
                        ? "bg-[#eef5ff] text-[#0062ff] shadow-2xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    {tab.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#0062ff] rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* ---------------- 3. MÔ TẢ CÔNG VIỆC (VIBRANT & COLORFUL) ---------------- */}
            <div
              id="description"
              className="bg-white rounded-2xl p-5 sm:p-6 border border-[#CBD5E1] shadow-xs space-y-5"
            >
              {/* Header Title with Blue Accent */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0062ff] to-[#3b82f6] text-white flex items-center justify-center font-bold shadow-xs">
                    <FileText className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 m-0 leading-tight">
                      Mô tả công việc
                    </h2>
                    <span className="text-[11px] font-bold text-slate-400 block mt-0.5">
                      Chi tiết nhiệm vụ và tiêu chuẩn ứng tuyển
                    </span>
                  </div>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0062ff] text-xs font-bold">
                  {jobTitle} • {companyName}
                </span>
              </div>

              {/* Summary Paragraph with Rich Pastel Gradient */}
              <div className="p-4.5 bg-gradient-to-r from-[#eef6ff] via-[#f0f4ff] to-[#f5f0ff] rounded-2xl border border-[#bfdbfe] text-xs sm:text-[13.5px] text-slate-800 leading-relaxed font-semibold shadow-2xs">
                {job?.description || (
                  <p className="m-0">
                    Thiết kế và tối ưu hóa trải nghiệm người dùng cho các sản phẩm công nghệ hàng đầu,
                    xây dựng giao diện trực quan, đồng bộ và giải quyết bài toán thực tế của hàng triệu người dùng.
                  </p>
                )}
              </div>

              {/* 2 Structured Sub-Panels with Distinct Pastel Colors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
                {/* Trách nhiệm chính (Pastel Blue) */}
                <div className="bg-gradient-to-br from-[#eff6ff] to-[#e1effe] rounded-2xl p-5 border border-[#93c5fd] shadow-xs space-y-3.5 flex flex-col justify-between">
                  <div className="flex items-center gap-2 pb-0.5">
                    <div className="w-6 h-6 rounded-lg bg-[#0062ff] text-white flex items-center justify-center text-xs font-black shadow-2xs">
                      ✓
                    </div>
                    <h3 className="text-sm font-black text-blue-900 m-0">
                      Trách nhiệm chính
                    </h3>
                  </div>

                  <div className="space-y-2.5">
                    {(job?.requirements && Array.isArray(job.requirements) && job.requirements.length > 0
                      ? job.requirements.slice(0, Math.ceil(job.requirements.length / 2))
                      : [
                          "Nghiên cứu thị trường, người dùng và xây dựng lộ trình giải pháp sản phẩm.",
                          "Thiết kế UI/UX, Wireframe, Prototype và hệ thống Design System hoàn chỉnh.",
                          "Làm việc chặt chẽ với đội ngũ kỹ thuật và kinh doanh để triển khai tính năng mới.",
                          "Phân tích dữ liệu người dùng và tối ưu hóa trải nghiệm sản phẩm liên tục.",
                        ]
                    ).map((item: string, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 bg-white/95 rounded-xl border border-blue-200/90 shadow-2xs flex items-start gap-3 text-xs sm:text-[12.5px] text-slate-800 font-semibold leading-relaxed"
                      >
                        <div className="w-4.5 h-4.5 rounded-full bg-blue-100 text-[#0062ff] flex items-center justify-center shrink-0 mt-0.5 font-black text-[11px]">
                          ✓
                        </div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Yêu cầu công việc (Pastel Purple) */}
                <div className="bg-gradient-to-br from-[#faf5ff] to-[#f3e8ff] rounded-2xl p-5 border border-[#d8b4fe] shadow-xs space-y-3.5 flex flex-col justify-between">
                  <div className="flex items-center gap-2 pb-0.5">
                    <div className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-black shadow-2xs">
                      ★
                    </div>
                    <h3 className="text-sm font-black text-purple-900 m-0">
                      Yêu cầu & Năng lực
                    </h3>
                  </div>

                  <div className="space-y-2.5">
                    {(job?.requirements && Array.isArray(job.requirements) && job.requirements.length > 0
                      ? job.requirements.slice(Math.ceil(job.requirements.length / 2))
                      : [
                          "Từ 2 – 4 năm kinh nghiệm thực chiến trong lĩnh vực chuyên môn tương đương.",
                          "Thành thạo các công cụ chuyên sâu (Figma, Auto-layout, Component variants).",
                          "Hiểu biết sâu sắc về User Research, Usability Testing và Information Architecture.",
                          "Tư duy logic tốt, khả năng làm việc nhóm và giải quyết vấn đề hiệu quả.",
                        ]
                    ).map((item: string, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 bg-white/95 rounded-xl border border-purple-200/90 shadow-2xs flex items-start gap-3 text-xs sm:text-[12.5px] text-slate-800 font-semibold leading-relaxed"
                      >
                        <div className="w-4.5 h-4.5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5 font-black text-[11px]">
                          ★
                        </div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Kỹ năng cần có with colorful chips */}
              <div className="pt-3 space-y-2.5 border-t border-slate-100">
                <span className="text-xs font-black text-slate-800 block">
                  Kỹ năng cần có & Công cụ
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {(job?.skills && job.skills.length > 0
                    ? job.skills.map((s: any) =>
                        typeof s === "string" ? s : s.skillName || s.name
                      )
                    : ["Figma", "UI/UX", "Design Systems", "Prototyping", "User Research"]
                  ).map((skill: string, idx: number) => (
                    <span
                      key={idx}
                      className="bg-gradient-to-r from-blue-50 to-indigo-50/80 text-[#0052cc] hover:bg-[#0062ff] hover:text-white font-black text-xs px-4 py-2 rounded-xl border border-[#bfdbfe] shadow-2xs transition-all cursor-default flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0062ff]" />
                      <span>{skill}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ---------------- 5. YÊU CẦU ỨNG VIÊN (4 COLUMN BLOCKS - CENTER ALIGNED) ---------------- */}
            <div
              id="requirements"
              className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] shadow-2xs space-y-4"
            >
              <h2 className="text-base sm:text-lg font-black text-slate-900 m-0 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#0062ff]" />
                <span>Yêu cầu ứng viên</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* Block 1: Học vấn */}
                <div className="bg-[#f0f5ff] rounded-2xl p-4.5 border border-blue-100 flex flex-col items-center text-center justify-between space-y-2">
                  <div className="space-y-1.5 flex flex-col items-center">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#0062ff] flex items-center justify-center mx-auto shadow-2xs">
                      <GraduationCap className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-xs sm:text-[13px] font-black text-blue-900 block">Học vấn</span>
                    <p className="text-[11.5px] text-slate-600 leading-relaxed m-0 font-medium">
                      Tốt nghiệp Đại học trở lên các ngành Công nghệ thông tin, Kinh tế, Quản trị hoặc liên quan.
                    </p>
                  </div>
                </div>

                {/* Block 2: Kinh nghiệm */}
                <div className="bg-[#ecfeff] rounded-2xl p-4.5 border border-cyan-100 flex flex-col items-center text-center justify-between space-y-2">
                  <div className="space-y-1.5 flex flex-col items-center">
                    <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center mx-auto shadow-2xs">
                      <Briefcase className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-xs sm:text-[13px] font-black text-cyan-900 block">Kinh nghiệm</span>
                    <p className="text-[11.5px] text-slate-600 leading-relaxed m-0 font-medium">
                      Từ 3 - 5 năm vị trí Product Manager hoặc các vị trí tương đương.
                    </p>
                  </div>
                </div>

                {/* Block 3: Kỹ năng chuyên môn */}
                <div className="bg-[#faf5ff] rounded-2xl p-4.5 border border-purple-100 flex flex-col items-center text-center justify-between space-y-2">
                  <div className="space-y-1.5 flex flex-col items-center">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto shadow-2xs">
                      <Wrench className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-xs sm:text-[13px] font-black text-purple-900 block">
                      Kỹ năng chuyên môn
                    </span>
                    <p className="text-[11.5px] text-slate-600 leading-relaxed m-0 font-medium">
                      Agile/Scrum, SQL, Data Analytics, A/B Testing, Product Strategy, User Research.
                    </p>
                  </div>
                </div>

                {/* Block 4: Ưu tiên */}
                <div className="bg-[#fff1f2] rounded-2xl p-4.5 border border-rose-100 flex flex-col items-center text-center justify-between space-y-2">
                  <div className="space-y-1.5 flex flex-col items-center">
                    <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-2xs">
                      <Sparkles className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-xs sm:text-[13px] font-black text-rose-900 block">Ưu tiên</span>
                    <p className="text-[11.5px] text-slate-600 leading-relaxed m-0 font-medium">
                      Có kinh nghiệm làm việc trong môi trường quốc tế, sản phẩm công nghệ quy mô lớn.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ---------------- 6. QUYỀN LỢI & PHÚC LỢI (5 PASTEL CARDS - CENTER ALIGNED) ---------------- */}
            <div
              id="benefits"
              className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] shadow-2xs space-y-4"
            >
              <h2 className="text-base sm:text-lg font-black text-slate-900 m-0 flex items-center gap-2">
                <Gift className="w-4 h-4 text-emerald-600" />
                <span>Quyền lợi & phúc lợi</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* 1. Thu nhập */}
                <div className="bg-[#eff6ff] rounded-2xl p-4 border border-blue-100 flex flex-col items-center text-center justify-between space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#0062ff] flex items-center justify-center mx-auto shadow-2xs">
                    <DollarSign className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-[12.5px] font-bold text-slate-900 block">
                      Thu nhập hấp dẫn
                    </span>
                    <p className="text-[11px] text-slate-600 m-0 mt-1 leading-snug">
                      Lương cạnh tranh, thưởng KPI, thưởng hiệu suất.
                    </p>
                  </div>
                </div>

                {/* 2. Bảo hiểm */}
                <div className="bg-[#f0fdf4] rounded-2xl p-4 border border-emerald-100 flex flex-col items-center text-center justify-between space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
                    <Shield className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-[12.5px] font-bold text-slate-900 block">
                      Bảo hiểm
                    </span>
                    <p className="text-[11px] text-slate-600 m-0 mt-1 leading-snug">
                      Bảo hiểm sức khỏe cao cấp cho bạn và gia đình.
                    </p>
                  </div>
                </div>

                {/* 3. Phát triển */}
                <div className="bg-[#ecfeff] rounded-2xl p-4 border border-cyan-100 flex flex-col items-center text-center justify-between space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center mx-auto shadow-2xs">
                    <BookOpen className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-[12.5px] font-bold text-slate-900 block">
                      Phát triển bản thân
                    </span>
                    <p className="text-[11px] text-slate-600 m-0 mt-1 leading-snug">
                      Đào tạo, học tập và phát triển kỹ năng liên tục.
                    </p>
                  </div>
                </div>

                {/* 4. Môi trường */}
                <div className="bg-[#fffbeb] rounded-2xl p-4 border border-amber-100 flex flex-col items-center text-center justify-between space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-2xs">
                    <Coffee className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-[12.5px] font-bold text-slate-900 block">
                      Môi trường làm việc
                    </span>
                    <p className="text-[11px] text-slate-600 m-0 mt-1 leading-snug">
                      Trẻ trung, sáng tạo, linh hoạt, tôn trọng sự khác biệt.
                    </p>
                  </div>
                </div>

                {/* 5. Khác */}
                <div className="bg-[#faf5ff] rounded-2xl p-4 border border-purple-100 flex flex-col items-center text-center justify-between space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto shadow-2xs">
                    <Laptop className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-[12.5px] font-bold text-slate-900 block">
                      Khác
                    </span>
                    <p className="text-[11px] text-slate-600 m-0 mt-1 leading-snug">
                      Team building, laptop MacBook Pro, hỗ trợ làm việc từ xa.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ---------------- 7. QUY TRÌNH TUYỂN DỤNG (HORIZONTAL TIMELINE) ---------------- */}
            <div
              id="recruitment-process"
              className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] shadow-2xs space-y-4"
            >
              <h2 className="text-base sm:text-lg font-black text-slate-900 m-0 flex items-center gap-2">
                <Compass className="w-4 h-4 text-purple-600" />
                <span>Quy trình tuyển dụng</span>
              </h2>

              {/* Horizontal 5 steps connected */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
                {[
                  {
                    step: "1",
                    title: "Ứng tuyển",
                    desc: "Gửi CV qua hệ thống Careza",
                  },
                  {
                    step: "2",
                    title: "Sàng lọc CV",
                    desc: "Đánh giá hồ sơ và kinh nghiệm",
                  },
                  {
                    step: "3",
                    title: "Phỏng vấn",
                    desc: "Phỏng vấn với HR và Manager",
                  },
                  {
                    step: "4",
                    title: "Kiểm tra chuyên môn",
                    desc: "Bài test hoặc case study (nếu có)",
                  },
                  {
                    step: "5",
                    title: "Offer",
                    desc: "Thương lượng và nhận offer",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 flex flex-col items-center text-center space-y-1.5 relative"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#0062ff] text-white font-black text-xs flex items-center justify-center shadow-2xs">
                      {item.step}
                    </div>
                    <span className="text-xs font-bold text-slate-800">{item.title}</span>
                    <span className="text-[11px] text-slate-500 leading-snug">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ---------------- 8. ĐỊA ĐIỂM LÀM VIỆC (WITH MAP) ---------------- */}
            <div
              id="workplace"
              className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] shadow-2xs space-y-4"
            >
              <h2 className="text-base sm:text-lg font-black text-slate-900 m-0 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span>Địa điểm làm việc</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Left: Address text */}
                <div className="md:col-span-5 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs sm:text-[13.5px] font-bold text-slate-900 m-0">
                        {companyName} - {locationDisplay}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed m-0 font-medium">
                        {locationAddress}
                      </p>
                    </div>
                  </div>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      locationAddress
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0062ff] hover:underline pt-1"
                  >
                    <span>Xem trên bản đồ</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Right: Map Interactive */}
                <div className="md:col-span-7 h-[160px] rounded-xl overflow-hidden border border-slate-200">
                  <CompanyLocationMap
                    companyName={companyName}
                    address={locationAddress}
                    latitude={job?.latitude}
                    longitude={job?.longitude}
                  />
                </div>
              </div>
            </div>

            {/* ---------------- 9. VỀ CÔNG TY (ABOUT COMPANY) ---------------- */}
            <div
              id="company-about"
              className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] shadow-2xs space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                {/* Left 38%: Office space photo */}
                <div className="md:col-span-5 h-[170px] rounded-xl overflow-hidden shadow-2xs relative bg-slate-100">
                  <img
                    src={
                      company?.bannerUrl ||
                      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&h=350&q=80"
                    }
                    alt="Company Office Space"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-3">
                    <span className="text-white text-xs font-bold truncate">
                      Văn phòng làm việc {companyName}
                    </span>
                  </div>
                </div>

                {/* Right 62%: Company details */}
                <div className="md:col-span-7 space-y-3">
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 m-0">
                      {companyName}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed m-0 mt-1 font-medium line-clamp-2">
                      {company?.about ||
                        `${companyName} là tổ chức công nghệ hàng đầu với sứ mệnh đổi mới sáng tạo và mang lại giá trị bền vững cho cộng đồng người dùng.`}
                    </p>
                  </div>

                  {/* 4 Metadata Tags */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <div>
                        <span className="text-[10px] text-slate-400 block leading-tight">Thành lập</span>
                        <span className="text-[11.5px] font-bold text-slate-800">
                          {company?.foundedYear || "1999"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <div>
                        <span className="text-[10px] text-slate-400 block leading-tight">Quy mô</span>
                        <span className="text-[11.5px] font-bold text-slate-800">
                          {company?.scale || "5.000+ nhân viên"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <Compass className="w-3.5 h-3.5 text-slate-400" />
                      <div>
                        <span className="text-[10px] text-slate-400 block leading-tight">Lĩnh vực</span>
                        <span className="text-[11.5px] font-bold text-slate-800 truncate block max-w-[110px]">
                          {company?.industry || "Công nghệ thông tin"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      <div>
                        <span className="text-[10px] text-slate-400 block leading-tight">Website</span>
                        <a
                          href={company?.website || "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11.5px] font-bold text-[#0062ff] truncate block max-w-[110px] hover:underline"
                        >
                          {company?.website ? company.website.replace(/^https?:\/\//, "") : "careers.google.com"}
                        </a>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/cong-ty/${company?.id || "comp-1"}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0062ff] hover:underline pt-1"
                  >
                    <span>Xem chi tiết công ty</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* ==================================================== */}
          {/* CỘT PHẢI: RIGHT SIDEBAR (~32% -> lg:col-span-4)      */}
          {/* ==================================================== */}
          <div className="lg:col-span-4 space-y-4.5 lg:sticky lg:top-4">
            {/* ---------------- 1. APPLICATION CARD (PRIMARY CTA) ---------------- */}
            <div
              id="apply-sidebar-card"
              className="bg-white rounded-[22px] overflow-hidden border border-[#E2E8F0] shadow-md space-y-4"
            >
              {/* Gradient Card Header (Blue -> Magenta) */}
              <div
                className="p-5 text-white flex items-center justify-between"
                style={{
                  background:
                    "linear-gradient(135deg, #2563eb 0%, #6366f1 45%, #9333ea 80%, #c026d3 100%)",
                }}
              >
                <div>
                  <h3 className="text-base font-black text-white m-0 tracking-tight">
                    Ứng tuyển công việc này
                  </h3>
                  <p className="text-[11.5px] text-blue-100 m-0 mt-0.5 font-medium">
                    Gửi CV trực tiếp đến bộ phận tuyển dụng
                  </p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white shrink-0">
                  <Rocket className="w-4 h-4" />
                </div>
              </div>

              {/* Application Form */}
              <form onSubmit={handleApplySubmit} className="p-5 pt-0 space-y-3.5">
                {/* CV Selector Box */}
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-700 block">CV của bạn</span>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#0062ff] flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-800 block truncate">
                          {selectedCv?.documentName || "Nguyen_Thi_Phuong_Mai_CV.pdf"}
                        </span>
                        <span className="text-[10.5px] text-slate-400 block">2.3 MB</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCvModalOpen(true)}
                      className="text-xs font-bold text-[#0062ff] hover:underline cursor-pointer shrink-0"
                    >
                      Thay đổi
                    </button>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Họ và tên <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={applyForm.fullName}
                    onChange={(e) => setApplyForm({ ...applyForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-[#0062ff]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={applyForm.email}
                    onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-[#0062ff]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Số điện thoại <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={applyForm.phone}
                    onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-[#0062ff]"
                  />
                </div>

                {/* Dropdowns */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Kinh nghiệm làm việc <span className="text-rose-500">*</span>
                  </label>
                  <Select
                    value={applyForm.experienceLevel}
                    onChange={(val) => setApplyForm({ ...applyForm, experienceLevel: val })}
                    className="w-full"
                    options={[
                      { value: "Dưới 1 năm", label: "Dưới 1 năm kinh nghiệm" },
                      { value: "1 - 3 năm", label: "1 - 3 năm kinh nghiệm" },
                      { value: "3 - 5 năm", label: "3 - 5 năm kinh nghiệm" },
                      { value: "Trên 5 năm", label: "Trên 5 năm kinh nghiệm" },
                    ]}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Mức lương mong muốn <span className="text-rose-500">*</span>
                  </label>
                  <Select
                    value={applyForm.expectedSalary}
                    onChange={(val) => setApplyForm({ ...applyForm, expectedSalary: val })}
                    className="w-full"
                    options={[
                      { value: "Thỏa thuận", label: "Thỏa thuận" },
                      { value: "15 - 25 triệu VND", label: "15 - 25 triệu VND" },
                      { value: "25 - 35 triệu VND", label: "25 - 35 triệu VND" },
                      { value: "35 - 50 triệu VND", label: "35 - 50 triệu VND" },
                      { value: "Trên 50 triệu VND", label: "Trên 50 triệu VND" },
                    ]}
                  />
                </div>

                {/* Cover letter */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Thư giới thiệu (tùy chọn)
                  </label>
                  <textarea
                    rows={2}
                    value={applyForm.coverLetter}
                    onChange={(e) => setApplyForm({ ...applyForm, coverLetter: e.target.value })}
                    placeholder="Giới thiệu thêm về bản thân và lý do bạn phù hợp với vị trí này..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-[#0062ff]"
                  />
                  <div className="text-right text-[10.5px] text-slate-400">
                    {applyForm.coverLetter.length}/500
                  </div>
                </div>

                {/* Checkbox agreement */}
                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="terms-check"
                    checked={applyForm.agreedTerms}
                    onChange={(e) => setApplyForm({ ...applyForm, agreedTerms: e.target.checked })}
                    className="mt-0.5 rounded text-[#0062ff] cursor-pointer"
                  />
                  <label htmlFor="terms-check" className="text-[11px] text-slate-600 leading-tight cursor-pointer">
                    Tôi đồng ý với{" "}
                    <span className="text-[#0062ff] font-bold">Điều khoản sử dụng</span> và{" "}
                    <span className="text-[#0062ff] font-bold">Chính sách bảo mật</span> của Careza.
                  </label>
                </div>

                {/* Submit CTA Button */}
                <button
                  type="submit"
                  disabled={isSubmittingApply}
                  className="w-full py-3 rounded-xl font-black text-xs sm:text-[13px] text-white shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                  style={{
                    background: "linear-gradient(135deg, #0062ff 0%, #7c3aed 50%, #c026d3 100%)",
                  }}
                >
                  <Rocket className="w-4 h-4" />
                  <span>{isSubmittingApply ? "Đang gửi hồ sơ..." : "Gửi hồ sơ ứng tuyển"}</span>
                </button>

                <p className="text-center text-[10.5px] text-slate-400 m-0">
                  Thông tin của bạn được bảo mật tuyệt đối
                </p>
              </form>
            </div>

            {/* ---------------- 2. AI MATCHING ENGINE CARD ---------------- */}
            <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-[13.5px] font-black text-slate-900 m-0 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#0062ff]" />
                  <span>AI Matching Engine</span>
                </h3>
                <Tag color="cyan" className="m-0 rounded-full font-bold text-[10.5px]">
                  Smart AI
                </Tag>
              </div>

              {/* Circular Score + Overview */}
              <div className="flex items-center gap-4 bg-gradient-to-r from-teal-50/50 to-blue-50/50 p-3.5 rounded-xl border border-teal-100/80">
                <div className="relative shrink-0">
                  <Progress
                    type="circle"
                    percent={98}
                    size={64}
                    strokeColor={{
                      "0%": "#06b6d4",
                      "100%": "#10b981",
                    }}
                    strokeWidth={8}
                    format={(p) => (
                      <span className="text-xs font-black text-teal-800">{p}%</span>
                    )}
                  />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block leading-tight">
                    Hồ sơ của bạn rất phù hợp với công việc này!
                  </span>
                  <span className="text-[10.5px] text-slate-500 block mt-1">
                    Dựa trên phân tích từ AI Careza
                  </span>
                </div>
              </div>

              {/* 4 Breakdown Progress Bars */}
              <div className="space-y-2.5 text-xs font-semibold">
                <div>
                  <div className="flex justify-between text-[11.5px] text-slate-700 mb-1">
                    <span className="flex items-center gap-1">
                      <span className="text-[#0062ff]">✓</span> Kỹ năng
                    </span>
                    <span className="font-bold">95%</span>
                  </div>
                  <Progress percent={95} showInfo={false} strokeColor="#0062ff" size="small" />
                </div>

                <div>
                  <div className="flex justify-between text-[11.5px] text-slate-700 mb-1">
                    <span className="flex items-center gap-1">
                      <span className="text-cyan-600">✓</span> Kinh nghiệm
                    </span>
                    <span className="font-bold">90%</span>
                  </div>
                  <Progress percent={90} showInfo={false} strokeColor="#0891b2" size="small" />
                </div>

                <div>
                  <div className="flex justify-between text-[11.5px] text-slate-700 mb-1">
                    <span className="flex items-center gap-1">
                      <span className="text-purple-600">✓</span> Học vấn
                    </span>
                    <span className="font-bold">85%</span>
                  </div>
                  <Progress percent={85} showInfo={false} strokeColor="#9333ea" size="small" />
                </div>

                <div>
                  <div className="flex justify-between text-[11.5px] text-slate-700 mb-1">
                    <span className="flex items-center gap-1">
                      <span className="text-emerald-600">✓</span> Mức lương
                    </span>
                    <span className="font-bold">100%</span>
                  </div>
                  <Progress percent={100} showInfo={false} strokeColor="#059669" size="small" />
                </div>
              </div>

              <Link
                href="/ai-career"
                className="w-full py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#0062ff] font-bold text-xs border border-slate-200 shadow-2xs flex items-center justify-center gap-1 cursor-pointer transition-colors block text-center"
              >
                <span>Xem phân tích chi tiết</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* ---------------- 3. DEADLINE CARD (PASTEL PINK/PURPLE) ---------------- */}
            <div className="bg-[#fff1f2] rounded-2xl p-4.5 border border-[#fbcfe8] shadow-2xs space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-rose-900 block uppercase tracking-wider">
                    Hạn nộp hồ sơ
                  </span>
                  <span className="text-base font-black text-slate-900 block">
                    {deadlineDisplay}
                  </span>
                </div>
              </div>
              <div className="pt-1">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-700 font-bold text-[11px]">
                  Còn 21 ngày nữa
                </span>
              </div>
            </div>

            {/* ---------------- 4. ĐÁNH GIÁ CÔNG TY CARD ---------------- */}
            <div
              id="reviews"
              className="bg-white rounded-2xl p-4.5 border border-[#E2E8F0] shadow-2xs space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>Đánh giá công ty</span>
                </span>
                <span className="text-xs font-black text-slate-900">
                  {rating} ★★★★★
                </span>
              </div>
              <p className="text-[11.5px] text-slate-500 m-0">
                ({reviewsCount} đánh giá từ nhân viên hiện tại & cựu nhân viên)
              </p>
              <Link
                href={`/cong-ty/${company?.id || "comp-1"}#reviews`}
                className="text-xs font-bold text-[#0062ff] hover:underline inline-flex items-center gap-1 pt-1"
              >
                <span>Xem tất cả đánh giá</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* ---------------- 5. TUYỂN DỤNG AN TOÀN (PASTEL MINT) ---------------- */}
            <div className="bg-[#f0fdf4] rounded-2xl p-4.5 border border-[#bbf7d0] shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Tuyển dụng an toàn</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed m-0 font-medium">
                Careza cam kết bảo vệ ứng viên, không thu phí bất kỳ giai đoạn nào của quá trình tuyển dụng.
              </p>
              <Link
                href="/cam-nang/tuyen-dung-an-toan"
                className="text-[11.5px] font-bold text-emerald-700 hover:underline inline-flex items-center gap-1 pt-1"
              >
                <span>Tìm hiểu thêm</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. VIỆC LÀM KHÁC TẠI CÔNG TY                             */}
        {/* ======================================================== */}
        <div className="pt-6 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0062ff] flex items-center justify-center font-bold">
                <Building2 className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 m-0">
                Việc làm khác tại {companyName}
              </h3>
            </div>
            <Link
              href={`/cong-ty/${company?.id || "comp-1"}#jobs`}
              className="text-xs font-bold text-[#0062ff] hover:underline flex items-center gap-1 group"
            >
              <span>Xem tất cả (24)</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {otherCompanyJobs.map((item, idx) => (
              <Link key={idx} href={`/viec-lam/${item.id}`} className="block group h-full">
                <div className="bg-white rounded-2xl p-4.5 border border-[#E2E8F0] shadow-2xs hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between h-full space-y-3.5">
                  {/* Top: Logo & Title */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 p-1.5 flex items-center justify-center shrink-0 shadow-2xs">
                        {item.companyLogo ? (
                          <img
                            src={item.companyLogo}
                            alt={companyName}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-xs font-black text-[#0062ff]">
                            {companyName.charAt(0)}
                          </span>
                        )}
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0062ff] font-bold text-[10.5px] border border-blue-100">
                        {item.employmentTypeText || "Toàn thời gian"}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs sm:text-[13.5px] font-black text-slate-900 group-hover:text-[#0062ff] transition-colors line-clamp-1 m-0">
                        {item.title}
                      </h4>
                      <span className="text-xs text-slate-500 font-medium block mt-0.5 truncate">
                        {companyName}
                      </span>
                    </div>
                  </div>

                  {/* Bottom: Location & Salary Badge */}
                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-slate-500 font-medium text-[11.5px]">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[90px]">{item.location}</span>
                    </span>
                    <span className="font-black text-[#0062ff] bg-blue-50/80 px-2.5 py-1 rounded-lg border border-blue-100 text-[11.5px]">
                      {item.salary}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ======================================================== */}
        {/* 4. VIỆC LÀM TƯƠNG TỰ                                     */}
        {/* ======================================================== */}
        <div className="pt-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 m-0">
                Việc làm tương tự
              </h3>
            </div>
            <Link
              href="/viec-lam"
              className="text-xs font-bold text-[#0062ff] hover:underline flex items-center gap-1 group"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {similarJobs.map((item, idx) => (
              <Link key={idx} href={`/viec-lam/${item.id}`} className="block group h-full">
                <div className="bg-white rounded-2xl p-4.5 border border-[#E2E8F0] shadow-2xs hover:shadow-md hover:border-purple-300 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between h-full space-y-3.5">
                  {/* Top: Logo & Title */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 p-1.5 flex items-center justify-center shrink-0 shadow-2xs">
                        {item.companyLogo ? (
                          <img
                            src={item.companyLogo}
                            alt={item.companyName}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-xs font-black text-purple-600">
                            {item.companyName.charAt(0)}
                          </span>
                        )}
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold text-[10.5px] border border-purple-100">
                        {item.employmentTypeText || "Toàn thời gian"}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs sm:text-[13.5px] font-black text-slate-900 group-hover:text-[#0062ff] transition-colors line-clamp-1 m-0">
                        {item.title}
                      </h4>
                      <span className="text-xs text-slate-500 font-medium block mt-0.5 truncate">
                        {item.companyName}
                      </span>
                    </div>
                  </div>

                  {/* Bottom: Location & Salary Badge */}
                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-slate-500 font-medium text-[11.5px]">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[90px]">{item.location}</span>
                    </span>
                    <span className="font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80 text-[11.5px]">
                      {item.salary}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL CHỌN CV                                            */}
      {/* ======================================================== */}
      <Modal
        title={
          <div className="text-sm font-black text-slate-900">
            Chọn CV để ứng tuyển vị trí này
          </div>
        }
        open={isCvModalOpen}
        onCancel={() => setIsCvModalOpen(false)}
        footer={null}
        width={480}
      >
        <div className="space-y-3 py-2">
          {cvList.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 space-y-2">
              <FileText className="w-8 h-8 text-slate-300 mx-auto" />
              <p>Bạn chưa có CV nào trên hệ thống.</p>
              <Link href="/ung-vien/cv">
                <button
                  type="button"
                  className="px-4 py-2 bg-[#0062ff] text-white font-bold text-xs rounded-xl"
                >
                  Tạo hoặc tải CV ngay
                </button>
              </Link>
            </div>
          ) : (
            cvList.map((cv) => {
              const isSelected = selectedCv?.documentId === cv.documentId;
              return (
                <div
                  key={cv.documentId}
                  onClick={() => {
                    setSelectedCv(cv);
                    setIsCvModalOpen(false);
                    message.success(`Đã chọn CV: ${cv.documentName}`);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between gap-3 transition-all ${
                    isSelected
                      ? "border-[#0062ff] bg-blue-50/50"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText
                      className={`w-5 h-5 ${isSelected ? "text-[#0062ff]" : "text-slate-400"}`}
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-800 block truncate">
                        {cv.documentName}
                      </span>
                      <span className="text-[10.5px] text-slate-400 block">
                        Cập nhật: {cv.createdAt || "Gần đây"}
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-[#0062ff] shrink-0" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </Modal>
    </div>
  );
}
