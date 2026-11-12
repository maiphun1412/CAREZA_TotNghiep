"use client";

import { useState, useEffect, use, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { apiClient } from "@/services/api-client";
import { candidateService, type CandidateDocument } from "@/services/candidate.service";
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
  Eye,
  Palette,
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

export interface SavedCvItem {
  id: number | string;
  title: string;
  file_url?: string | null;
  is_primary?: boolean;
  status?: string;
  parsed_data?: any;
  created_at?: string;
  updated_at?: string;
  versions_count?: number;
}

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
  const [isApplied, setIsApplied] = useState(false);
  const [savingBookmark, setSavingBookmark] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // CV & Application state in Sidebar
  const [cvList, setCvList] = useState<SavedCvItem[]>([]);
  const [selectedCv, setSelectedCv] = useState<SavedCvItem | null>(null);
  const [isCvModalOpen, setIsCvModalOpen] = useState(false);

  const [applyForm, setApplyForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phoneNumber || "",
    experienceLevel: "1 - 3 năm",
    expectedSalary: "Thỏa thuận",
    coverLetter: "",
    agreedTerms: true,
  });
  const [isSubmittingApply, setIsSubmittingApply] = useState(false);

  // Fetch Job & Company detail from real PostgreSQL API
  useEffect(() => {
    const fetchJobDetail = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(`/jobs/${jobId}/`);

        if (response.data?.data?.job) {
          const jobData = response.data.data.job;
          setJob(jobData);
          setCompany(jobData.company || null);
          if (typeof jobData.is_saved === "boolean") {
            setIsSaved(jobData.is_saved);
          }
          if (typeof jobData.is_applied === "boolean") {
            setIsApplied(jobData.is_applied);
          }
        } else {
          setJob(null);
          setCompany(null);
        }
      } catch {
        setJob(null);
        setCompany(null);
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

  // Load CV list (tối đa 5 CV) cho ứng viên
  useEffect(() => {
    if (isAuthenticated) {
      candidateService
        .getCvs()
        .then((res) => {
          const list: SavedCvItem[] = res.data?.cvs || res.data?.documents || [];
          setCvList(list);
          const def = list.find((c) => c.is_primary) || list[0] || null;
          setSelectedCv(def);
        })
        .catch(() => {
          setCvList([]);
          setSelectedCv(null);
        });
    } else {
      setCvList([]);
      setSelectedCv(null);
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

    if (!selectedCv) {
      message.warning("Vui lòng chọn hoặc tạo CV để ứng tuyển!");
      setIsCvModalOpen(true);
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
        job_id: Number(jobId),
        cv_id: Number(selectedCv.id),
        cover_letter: applyForm.coverLetter?.trim() || undefined,
      });

      setIsApplied(true);
      message.success("Ứng tuyển thành công! Nhà tuyển dụng sẽ xem xét hồ sơ của bạn.");
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.detail ||
        err?.response?.data?.detail ||
        "Không thể gửi hồ sơ ứng tuyển lúc này. Vui lòng thử lại!";
      message.error(errMsg);
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

  // Not Found / Error State when job is null
  if (!job) {
    return (
      <div className="w-full bg-[#F5F8FF] min-h-screen py-24 font-sans text-slate-800">
        <div className="max-w-[700px] mx-auto px-4 text-center">
          <div className="bg-white rounded-3xl p-10 sm:p-14 border border-[#E2E8F0] shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 mx-auto flex items-center justify-center shadow-xs">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 m-0">
              Không tìm thấy tin tuyển dụng
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto m-0 leading-relaxed font-medium">
              Tin tuyển dụng này có thể đã hết hạn, tạm ngừng nhận hồ sơ hoặc đường dẫn không chính xác.
            </p>
            <div className="pt-3 flex items-center justify-center gap-3">
              <Link
                href="/viec-lam"
                className="px-6 py-2.5 rounded-xl bg-[#0062ff] text-white font-bold text-xs sm:text-sm hover:bg-[#0052cc] transition-colors shadow-xs inline-flex items-center gap-2"
              >
                <span>Khám phá việc làm khác</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Helper properties from real PostgreSQL data
  const companyName = job.company?.name || job.companyName || "Doanh nghiệp";
  const companyLogo =
    job.company?.logo_url ||
    job.company?.logoUrl ||
    job.companyLogo ||
    null;
  const jobTitle = job.title || "Tin tuyển dụng";
  const rating = typeof company?.rating === "number" ? company.rating : 0;
  const reviewsCount = company?.reviewsCount ?? company?.reviews_count ?? 0;

  // Format Salary
  let salaryDisplay = job.salary;
  if (!salaryDisplay) {
    if (job.salary_min && job.salary_max) {
      salaryDisplay = `${Math.round(job.salary_min / 1000000)} - ${Math.round(job.salary_max / 1000000)} triệu VND`;
    } else if (job.salary_min) {
      salaryDisplay = `Từ ${Math.round(job.salary_min / 1000000)} triệu VND`;
    } else if (job.salary_max) {
      salaryDisplay = `Đến ${Math.round(job.salary_max / 1000000)} triệu VND`;
    } else {
      salaryDisplay = "Thỏa thuận";
    }
  }

  const locationDisplay = job.location || "Toàn quốc";
  const expMin = job.experience_min ?? job.experience;
  const experienceDisplay =
    typeof expMin === "number"
      ? expMin === 0
        ? "Không yêu cầu kinh nghiệm"
        : `${expMin} năm kinh nghiệm`
      : expMin || "Không yêu cầu";

  let employmentTypeDisplay = job.employment_type || job.employmentTypeText || "Toàn thời gian";
  if (employmentTypeDisplay === "full_time") employmentTypeDisplay = "Toàn thời gian";
  else if (employmentTypeDisplay === "part_time") employmentTypeDisplay = "Bán thời gian";
  else if (employmentTypeDisplay === "internship") employmentTypeDisplay = "Thực tập";
  else if (employmentTypeDisplay === "contract") employmentTypeDisplay = "Hợp đồng";
  else if (employmentTypeDisplay === "freelance") employmentTypeDisplay = "Freelance";

  // Deadline calculation
  let deadlineDisplay = "Đang tuyển dụng";
  let daysLeftText = "Đang mở tuyển";
  let isDeadlineExpired = false;
  if (job.expires_at) {
    const expDate = new Date(job.expires_at);
    deadlineDisplay = expDate.toLocaleDateString("vi-VN");
    const diffDays = Math.ceil((expDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diffDays > 0) {
      daysLeftText = `Còn ${diffDays} ngày nữa`;
    } else {
      daysLeftText = "Đã hết hạn nộp hồ sơ";
      isDeadlineExpired = true;
    }
  }

  const isJobClosed =
    job.status === "closed" ||
    job.status === "draft" ||
    job.status === "expired" ||
    isDeadlineExpired;

  const locationAddress =
    job.location_address ||
    job.branch?.address ||
    company?.address ||
    job.location ||
    "Chi tiết địa điểm làm việc sẽ được thông báo khi phỏng vấn";

  // Related jobs directly from backend DB query
  const otherCompanyJobs: any[] = job.other_company_jobs || [];
  const similarJobs: any[] = job.similar_jobs || [];

  return (
    <div className="w-full bg-[#F5F8FF] min-h-screen pb-6 font-sans text-slate-800">
      {/* ======================================================== */}
      {/* 1. BREADCRUMB                                            */}
      {/* ======================================================== */}
      <div className="max-w-[1460px] mx-auto px-4 sm:px-6 md:px-8 xl:px-[38px] py-2">
        <div className="flex items-center gap-1.5 text-[11px] text-[#475569] font-medium leading-none">
          <Link href="/" className="text-[#2563EB] hover:underline transition-colors">
            Trang chủ
          </Link>
          <span className="text-[#94A3B8]">›</span>
          <Link href="/viec-lam" className="text-[#2563EB] hover:underline transition-colors">
            Việc làm
          </Link>
          <span className="text-[#94A3B8]">›</span>
          <span className="text-[#0F172A] font-semibold truncate max-w-[280px] sm:max-w-md">
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
          <div className="lg:col-span-8 space-y-4">
            {/* Banner cảnh báo khi tin tuyển dụng đã đóng hoặc hết hạn */}
            {isJobClosed && (
              <div className="rounded-xl bg-amber-50/80 border border-amber-200 px-3.5 py-2.5 flex items-center gap-2.5 text-amber-900 shadow-2xs text-xs font-medium">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Lưu ý:</strong> Tin tuyển dụng này hiện <strong>đã đóng hoặc tạm dừng nhận hồ sơ</strong>. Bạn vẫn có thể xem lại chi tiết yêu cầu công việc hoặc tìm kiếm các vị trí tương tự khác trên CAREZA.
                </span>
              </div>
            )}

            {/* ---------------- 1. HERO JOB CARD (THIẾT KẾ SÁNG SỦA, GỌN GÀNG, CHUYÊN NGHIỆP) ---------------- */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-3.5">
              {/* Top Row: Logo, Tiêu đề & Action Buttons */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5 sm:gap-4 min-w-0">
                  {/* Company Logo */}
                  <Link href={`/cong-ty/${company?.id || ""}`}>
                    <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-xl bg-slate-50 p-2 shadow-2xs flex items-center justify-center shrink-0 border border-slate-200/80 hover:border-blue-300 transition-colors">
                      {companyLogo ? (
                        <img
                          src={companyLogo}
                          alt={companyName}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-xl font-bold text-[#0062ff]">
                          {companyName.charAt(0)}
                        </span>
                      )}
                    </div>
                  </Link>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-lg sm:text-xl font-bold text-slate-900 m-0 tracking-tight leading-snug">
                        {jobTitle}
                      </h1>
                      {isJobClosed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-semibold">
                          Đã đóng tuyển dụng
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Đang tuyển dụng
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs sm:text-[13px] font-medium text-slate-600">
                      <Link
                        href={`/cong-ty/${company?.id || ""}`}
                        className="text-slate-700 hover:text-[#0062ff] font-semibold truncate transition-colors"
                      >
                        {companyName}
                      </Link>
                      {company?.is_verified && (
                        <Tooltip title="Doanh nghiệp đã xác thực trên CAREZA">
                          <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                        </Tooltip>
                      )}
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
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${isSaved
                          ? "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100"
                          : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
                        }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isSaved ? "fill-rose-500 text-rose-500" : ""}`} />
                      <span className="hidden sm:inline">{isSaved ? "Đã lưu" : "Lưu tin"}</span>
                    </button>
                  </Tooltip>

                  {/* Share Button */}
                  <Tooltip title="Chia sẻ việc làm">
                    <button
                      type="button"
                      onClick={handleShare}
                      className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                    >
                      <Share2 className="w-3.5 h-3.5 text-slate-500" />
                      <span className="hidden sm:inline">Chia sẻ</span>
                    </button>
                  </Tooltip>
                </div>
              </div>

              {/* Hàng thông tin tóm tắt: Lương, Địa điểm, Kinh nghiệm, Hình thức, Hạn nộp */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-600 font-medium">
                {/* Lương */}
                <div className="flex items-center gap-1.5 text-[#0062ff] font-bold">
                  <DollarSign className="w-4 h-4 text-[#0062ff]" />
                  <span>{salaryDisplay}</span>
                </div>

                {/* Địa điểm */}
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{locationDisplay}</span>
                </div>

                {/* Kinh nghiệm */}
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>{experienceDisplay}</span>
                </div>

                {/* Hình thức */}
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{employmentTypeDisplay}</span>
                </div>

                {/* Hạn nộp */}
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Hạn: {deadlineDisplay}</span>
                </div>
              </div>
            </div>

            {/* ---------------- 2. TAB NAVIGATION BAR (1 HÀNG GỌN GÀNG) ---------------- */}
            <div className="bg-white rounded-xl p-1 border border-slate-200/90 shadow-2xs overflow-x-auto no-scrollbar flex items-center gap-1">
              {[
                { id: "overview", label: "Tổng quan" },
                { id: "description", label: "Mô tả công việc" },
                { id: "requirements", label: "Yêu cầu ứng viên" },
                { id: "benefits", label: "Quyền lợi" },
                { id: "recruitment-process", label: "Quy trình tuyển dụng" },
                { id: "company-about", label: "Công ty" },
                { id: "reviews", label: reviewsCount > 0 ? `Đánh giá (${reviewsCount})` : "Đánh giá" },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => scrollToSection(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${isActive
                        ? "bg-[#0062ff] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* ---------------- 3. MÔ TẢ CÔNG VIỆC ---------------- */}
            <div
              id="description"
              className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4"
            >
              {/* Header Title */}
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 m-0">
                    Mô tả công việc
                  </h2>
                  <span className="text-[11px] text-slate-500 block mt-0.5 font-normal">
                    Chi tiết nhiệm vụ và trách nhiệm cho vị trí này
                  </span>
                </div>
              </div>

              {/* Summary Paragraph */}
              <div className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                {job.description || "Mô tả chi tiết công việc đang được cập nhật."}
              </div>

              {/* Requirements & Responsibilities from Database */}
              {job.requirements && (
                <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/70 space-y-2">
                  <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 m-0 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0062ff]" />
                    Trách nhiệm & yêu cầu công việc
                  </h3>
                  <div className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-normal whitespace-pre-line pl-3">
                    {job.requirements}
                  </div>
                </div>
              )}

              {/* Kỹ năng chuyên môn */}
              <div className="pt-3 space-y-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-800 block">
                  Kỹ năng chuyên môn
                </span>
                <div className="flex flex-wrap gap-2">
                  {job.skills && job.skills.length > 0 ? (
                    job.skills.map((skill: any, idx: number) => {
                      const skillName = typeof skill === "string" ? skill : skill.name || skill.skillName;
                      return (
                        <span
                          key={idx}
                          className="bg-slate-100/90 hover:bg-blue-50 hover:text-[#0062ff] hover:border-blue-200 text-slate-700 font-medium text-xs px-3 py-1 rounded-lg border border-slate-200/80 transition-colors cursor-default"
                        >
                          {skillName}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-xs text-slate-400 italic">
                      Không yêu cầu kỹ năng bắt buộc
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ---------------- 4. TIÊU CHUẨN ỨNG VIÊN ---------------- */}
            <div
              id="requirements"
              className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4"
            >
              <h2 className="text-sm sm:text-base font-bold text-slate-900 m-0 flex items-center gap-2 pb-2 border-b border-slate-100">
                <Users className="w-4 h-4 text-[#0062ff]" />
                <span>Tiêu chuẩn ứng viên</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Block 1: Học vấn */}
                <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/70 flex flex-col items-center text-center justify-center">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#0062ff] flex items-center justify-center mx-auto mb-1.5">
                    <GraduationCap className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 block mb-0.5">Học vấn</span>
                  <p className="text-[11px] text-slate-600 leading-snug m-0">
                    Cao đẳng / Đại học hoặc tương đương
                  </p>
                </div>

                {/* Block 2: Kinh nghiệm */}
                <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/70 flex flex-col items-center text-center justify-center">
                  <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center mx-auto mb-1.5">
                    <Briefcase className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 block mb-0.5">Kinh nghiệm</span>
                  <p className="text-[11px] text-slate-600 leading-snug m-0">
                    {experienceDisplay}
                  </p>
                </div>

                {/* Block 3: Hình thức làm việc */}
                <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/70 flex flex-col items-center text-center justify-center">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto mb-1.5">
                    <Laptop className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 block mb-0.5">Hình thức</span>
                  <p className="text-[11px] text-slate-600 leading-snug m-0">
                    {employmentTypeDisplay}
                  </p>
                </div>

                {/* Block 4: Số lượng tuyển */}
                <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/70 flex flex-col items-center text-center justify-center">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 block mb-0.5">Số lượng</span>
                  <p className="text-[11px] text-slate-600 leading-snug m-0">
                    {job.openings ? `${job.openings} nhân sự` : "Cần tuyển nhiều vị trí"}
                  </p>
                </div>
              </div>
            </div>

            {/* ---------------- 5. QUYỀN LỢI & PHÚC LỢI ---------------- */}
            <div
              id="benefits"
              className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-3.5"
            >
              <h2 className="text-sm sm:text-base font-bold text-slate-900 m-0 flex items-center gap-2 pb-2 border-b border-slate-100">
                <Gift className="w-4 h-4 text-emerald-600" />
                <span>Quyền lợi & phúc lợi</span>
              </h2>

              <div className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                {job.benefits || "Chế độ đãi ngộ, bảo hiểm và các chính sách phúc lợi hấp dẫn theo quy chế doanh nghiệp."}
              </div>
            </div>

            {/* ---------------- 6. QUY TRÌNH TUYỂN DỤNG ---------------- */}
            <div
              id="recruitment-process"
              className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4"
            >
              <h2 className="text-sm sm:text-base font-bold text-slate-900 m-0 flex items-center gap-2 pb-2 border-b border-slate-100">
                <Compass className="w-4 h-4 text-purple-600" />
                <span>Quy trình tuyển dụng</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-1">
                {[
                  { step: "1", title: "Ứng tuyển", desc: "Gửi CV qua hệ thống Careza" },
                  { step: "2", title: "Sàng lọc CV", desc: "Đánh giá hồ sơ & kinh nghiệm" },
                  { step: "3", title: "Phỏng vấn", desc: "Trao đổi cùng HR & Manager" },
                  { step: "4", title: "Chuyên môn", desc: "Đánh giá năng lực công việc" },
                  { step: "5", title: "Nhận Offer", desc: "Thống nhất và nhận offer" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/70 flex flex-col items-center text-center space-y-1.5"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#0062ff] text-white font-bold text-[11px] flex items-center justify-center">
                      {item.step}
                    </div>
                    <span className="text-xs font-bold text-slate-900">{item.title}</span>
                    <span className="text-[11px] text-slate-500 leading-snug">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ---------------- 7. ĐỊA ĐIỂM LÀM VIỆC ---------------- */}
            <div
              id="workplace"
              className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4"
            >
              <h2 className="text-sm sm:text-base font-bold text-slate-900 m-0 flex items-center gap-2 pb-2 border-b border-slate-100">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span>Địa điểm làm việc</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Left: Address text */}
                <div className="md:col-span-5 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 m-0">
                        {companyName} - {locationDisplay}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed m-0">
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
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#0062ff] hover:underline pt-1"
                  >
                    <span>Xem trên Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Right: Map Interactive */}
                <div className="md:col-span-7 h-[150px] rounded-xl overflow-hidden border border-slate-200">
                  <CompanyLocationMap
                    companyName={companyName}
                    address={locationAddress}
                    latitude={job?.latitude}
                    longitude={job?.longitude}
                  />
                </div>
              </div>
            </div>

            {/* ---------------- 8. VỀ CÔNG TY ---------------- */}
            <div
              id="company-about"
              className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4"
            >
              <h2 className="text-sm sm:text-base font-bold text-slate-900 m-0 flex items-center gap-2 pb-2 border-b border-slate-100">
                <Building2 className="w-4 h-4 text-[#0062ff]" />
                <span>Về công ty {companyName}</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                {/* Left: Office photo */}
                <div className="md:col-span-5 h-[160px] rounded-xl overflow-hidden relative bg-slate-100 border border-slate-200/80">
                  <img
                    src={
                      company?.bannerUrl ||
                      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&h=350&q=80"
                    }
                    alt="Company Office Space"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-2.5">
                    <span className="text-white text-xs font-medium truncate">
                      Văn phòng làm việc {companyName}
                    </span>
                  </div>
                </div>

                {/* Right: Company details */}
                <div className="md:col-span-7 space-y-3">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 m-0">
                      {companyName}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed m-0 mt-1 line-clamp-2">
                      {company?.about ||
                        `${companyName} là tổ chức uy tín hàng đầu với cam kết đổi mới sáng tạo và mang lại giá trị bền vững cho nhân viên và đối tác.`}
                    </p>
                  </div>

                  {/* 4 Metadata Tags */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <div>
                        <span className="text-[10px] text-slate-400 block leading-tight">Thành lập</span>
                        <span className="text-[11.5px] font-semibold text-slate-800">
                          {company?.founded_year || company?.foundedYear || "Đang cập nhật"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <div>
                        <span className="text-[10px] text-slate-400 block leading-tight">Quy mô</span>
                        <span className="text-[11.5px] font-semibold text-slate-800">
                          {company?.company_size || company?.scale || "Đang cập nhật"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <Compass className="w-3.5 h-3.5 text-slate-400" />
                      <div>
                        <span className="text-[10px] text-slate-400 block leading-tight">Lĩnh vực</span>
                        <span className="text-[11.5px] font-semibold text-slate-800 truncate block max-w-[110px]">
                          {company?.industry || "Đa ngành"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      <div>
                        <span className="text-[10px] text-slate-400 block leading-tight">Website</span>
                        {company?.website ? (
                          <a
                            href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11.5px] font-semibold text-[#0062ff] truncate block max-w-[110px] hover:underline"
                          >
                            {company.website.replace(/^https?:\/\//, "")}
                          </a>
                        ) : (
                          <span className="text-[11.5px] text-slate-400">Đang cập nhật</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {company?.id ? (
                    <Link
                      href={`/cong-ty/${company.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#0062ff] hover:underline pt-0.5"
                    >
                      <span>Xem trang công ty</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* ==================================================== */}
          {/* CỘT PHẢI: RIGHT SIDEBAR (~32% -> lg:col-span-4)      */}
          {/* ==================================================== */}
          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-4">
            {/* ---------------- 1. APPLICATION CARD (PRIMARY CTA) ---------------- */}
            {isApplied ? (
              <div
                id="apply-sidebar-card"
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 m-0">
                    Đã nộp hồ sơ ứng tuyển
                  </h4>
                  <p className="text-xs text-slate-600 m-0 leading-relaxed font-normal">
                    Hồ sơ của bạn đã được gửi thành công đến bộ phận tuyển dụng của{" "}
                    <span className="font-semibold text-slate-800">{companyName}</span>.
                  </p>
                </div>

                <div className="pt-2 space-y-2">
                  <Link
                    href="/ung-vien/ung-tuyen"
                    className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-[#0062ff] hover:bg-[#0052cc] transition-colors shadow-xs flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Xem việc làm đã ứng tuyển</span>
                  </Link>
                  <p className="text-[11px] text-slate-400 m-0 font-normal">
                    Mỗi ứng viên nộp 1 hồ sơ cho mỗi tin đăng để đảm bảo chất lượng tuyển dụng
                  </p>
                </div>
              </div>
            ) : isJobClosed ? (
              <div
                id="apply-sidebar-card"
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 text-center space-y-3"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 m-0">Tin tuyển dụng đã đóng</h4>
                  <p className="text-xs text-slate-600 m-0 leading-relaxed font-normal">
                    Doanh nghiệp đã đủ chỉ tiêu hoặc hết hạn tiếp nhận hồ sơ. Bạn hãy tham khảo các vị trí tương tự khác.
                  </p>
                </div>
                <div className="pt-1">
                  <Link
                    href="/viec-lam"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0062ff] text-white font-bold text-xs hover:bg-[#0052cc] transition-colors shadow-xs"
                  >
                    <span>Khám phá việc làm khác</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div
                id="apply-sidebar-card"
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden"
              >
                {/* Clean SaaS Card Header */}
                <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 m-0">
                      Ứng tuyển ngay
                    </h3>
                    <p className="text-[11px] text-slate-500 m-0 mt-0.5 font-normal">
                      Gửi CV trực tiếp đến nhà tuyển dụng
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0">
                    <Rocket className="w-4 h-4" />
                  </div>
                </div>

                {/* Application Form */}
                <form onSubmit={handleApplySubmit} className="p-4.5 space-y-3.5">
                  {/* CV Selector Box */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">CV ứng tuyển</span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {cvList.length}/5 CV đã lưu
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${selectedCv?.parsed_data?.templateId || selectedCv?.parsed_data?.cvData
                              ? "bg-purple-100 text-purple-600"
                              : "bg-blue-100 text-[#0062ff]"
                            }`}>
                            {selectedCv?.parsed_data?.templateId || selectedCv?.parsed_data?.cvData ? (
                              <Palette className="w-4 h-4" />
                            ) : (
                              <FileText className="w-4 h-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-800 truncate block">
                                {selectedCv?.title || "Chưa chọn CV"}
                              </span>
                              {selectedCv?.is_primary && (
                                <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-amber-100 text-amber-800 shrink-0">
                                  Mặc định
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {selectedCv ? (
                                <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${selectedCv.parsed_data?.templateId || selectedCv.parsed_data?.cvData
                                    ? "bg-purple-50 text-purple-700 border border-purple-200"
                                    : "bg-blue-50 text-blue-700 border border-blue-200"
                                  }`}>
                                  {selectedCv.parsed_data?.templateId || selectedCv.parsed_data?.cvData
                                    ? "CV Studio"
                                    : "CV Tải lên"}
                                </span>
                              ) : (
                                <span className="text-[11px] text-slate-400">
                                  Vui lòng chọn từ danh sách đã lưu
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsCvModalOpen(true)}
                          className="text-xs font-bold text-[#0062ff] hover:underline cursor-pointer shrink-0 ml-1"
                        >
                          {selectedCv ? "Đổi CV" : "Chọn CV"}
                        </button>
                      </div>

                      {/* Preview Button if selected */}
                      {selectedCv && (
                        <div className="pt-1.5 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 text-[10px]">
                            Cập nhật: {selectedCv.updated_at || selectedCv.created_at ? new Date(selectedCv.updated_at || selectedCv.created_at || "").toLocaleDateString("vi-VN") : "Gần đây"}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (selectedCv.file_url) {
                                window.open(selectedCv.file_url, "_blank");
                              } else {
                                window.open(`/ung-vien/cv/builder?id=${selectedCv.id}`, "_blank");
                              }
                            }}
                            className="inline-flex items-center gap-1 text-[#0062ff] font-semibold hover:underline cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Xem trước CV</span>
                          </button>
                        </div>
                      )}
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
                    className="w-full py-2.5 rounded-xl font-bold text-xs sm:text-[13px] text-white bg-[#0062ff] hover:bg-[#0052cc] transition-colors cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed border-none shadow-xs"
                  >
                    <Rocket className="w-4 h-4 text-white" />
                    <span>{isSubmittingApply ? "Đang gửi hồ sơ..." : "Gửi hồ sơ ứng tuyển"}</span>
                  </button>

                  <p className="text-center text-[10.5px] text-slate-400 m-0">
                    Thông tin của bạn được bảo mật tuyệt đối
                  </p>
                </form>
              </div>
            )}

            {/* ---------------- 2. ĐỐI SOÁT HỒ SƠ ỨNG TUYỂN ---------------- */}
            <div className="bg-white rounded-2xl p-4.5 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 m-0 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#0062ff]" />
                  <span>Đối soát hồ sơ</span>
                </h3>
                <span className="px-2 py-0.5 rounded-full font-semibold text-[10px] bg-blue-50 text-[#0062ff] border border-blue-100">
                  Careza Match
                </span>
              </div>

              {selectedCv ? (
                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">CV: {selectedCv.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed m-0 font-normal">
                    Hồ sơ đã sẵn sàng. Nhà tuyển dụng sẽ đối soát kỹ năng và kinh nghiệm của bạn với tiêu chuẩn tuyển dụng vị trí này.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 space-y-2">
                  <p className="text-[11px] text-slate-600 leading-relaxed m-0 font-normal">
                    Chọn hoặc tạo CV để gửi trực tiếp cho nhà tuyển dụng xem xét mức độ phù hợp với vị trí này.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsCvModalOpen(true)}
                    className="text-xs font-bold text-[#0062ff] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Chọn CV ứng tuyển</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* ---------------- 3. HẠN NỘP HỒ SƠ ---------------- */}
            <div className="bg-white rounded-2xl p-4.5 border border-slate-200/90 shadow-2xs space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                    Hạn nộp hồ sơ
                  </span>
                  <span className="text-sm font-bold text-slate-900 block">
                    {deadlineDisplay}
                  </span>
                </div>
              </div>
              <div className="pt-1">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200/60">
                  {daysLeftText}
                </span>
              </div>
            </div>

            {/* ---------------- 4. ĐÁNH GIÁ CÔNG TY CARD ---------------- */}
            <div
              id="reviews"
              className="bg-white rounded-2xl p-4.5 border border-slate-200/90 shadow-2xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>Đánh giá công ty</span>
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {reviewsCount > 0 && rating > 0 ? `${rating} ★★★★★` : "Chưa có đánh giá"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 m-0 leading-relaxed">
                {reviewsCount > 0
                  ? `(${reviewsCount} đánh giá từ nhân viên hiện tại & cựu nhân viên)`
                  : "Chưa có đánh giá từ nhân viên cho doanh nghiệp này."}
              </p>
              <Link
                href={`/cong-ty/${company?.id || "comp-1"}#reviews`}
                className="text-xs font-semibold text-[#0062ff] hover:underline inline-flex items-center gap-1 pt-1"
              >
                <span>Xem chi tiết đánh giá</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* ---------------- 5. TUYỂN DỤNG AN TOÀN ---------------- */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-1.5">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-[#0062ff]" />
                <span>Tuyển dụng an toàn</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed m-0">
                Careza cam kết bảo vệ ứng viên, không thu bất kỳ khoản phí nào trong suốt quá trình tuyển dụng.
              </p>
              <Link
                href="/cam-nang/tuyen-dung-an-toan"
                className="text-[11px] font-semibold text-[#0062ff] hover:underline inline-flex items-center gap-1 pt-0.5"
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
        {otherCompanyJobs.length > 0 && (
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
              {company?.id && (
                <Link
                  href={`/cong-ty/${company.id}#jobs`}
                  className="text-xs font-bold text-[#0062ff] hover:underline flex items-center gap-1 group"
                >
                  <span>Xem tất cả ({otherCompanyJobs.length})</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {otherCompanyJobs.map((item, idx) => (
                <Link key={idx} href={`/viec-lam/${item.id}`} className="block group h-full">
                  <div className="bg-white rounded-2xl p-4.5 border border-[#E2E8F0] shadow-2xs hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between h-full space-y-3.5">
                    {/* Top: Logo & Title */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 p-1.5 flex items-center justify-center shrink-0 shadow-2xs">
                          {companyLogo ? (
                            <img
                              src={companyLogo}
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
                          {item.type || item.employmentTypeText || "Toàn thời gian"}
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
        )}

        {/* ======================================================== */}
        {/* 4. VIỆC LÀM TƯƠNG TỰ                                     */}
        {/* ======================================================== */}
        {similarJobs.length > 0 && (
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
                          {item.logo ? (
                            <img
                              src={item.logo}
                              alt={item.company || "Công ty"}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <span className="text-xs font-black text-purple-600">
                              {(item.company || "C").charAt(0)}
                            </span>
                          )}
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold text-[10.5px] border border-purple-100">
                          {item.type || item.employmentTypeText || "Toàn thời gian"}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs sm:text-[13.5px] font-black text-slate-900 group-hover:text-[#0062ff] transition-colors line-clamp-1 m-0">
                          {item.title}
                        </h4>
                        <span className="text-xs text-slate-500 font-medium block mt-0.5 truncate">
                          {item.company}
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
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL CHỌN CV (DANH SÁCH TỐI ĐA 5 CV ĐÃ LƯU)             */}
      {/* ======================================================== */}
      <Modal
        title={
          <div className="flex items-center justify-between pr-6">
            <div className="space-y-0.5">
              <span className="text-sm sm:text-base font-black text-slate-900 block">
                Chọn CV để ứng tuyển
              </span>
              <span className="text-xs text-slate-500 font-normal block">
                Danh sách tối đa 5 CV của bạn trên CAREZA
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-[#0062ff] text-xs font-bold border border-blue-200">
              {cvList.length}/5 CV
            </span>
          </div>
        }
        open={isCvModalOpen}
        onCancel={() => setIsCvModalOpen(false)}
        footer={
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <Link
              href="/ung-vien/cv/builder"
              target="_blank"
              className="text-xs font-bold text-[#0062ff] hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tạo CV mới với Studio</span>
            </Link>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCvModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Đóng
              </button>
              <button
                type="button"
                disabled={!selectedCv}
                onClick={() => {
                  if (selectedCv) {
                    setIsCvModalOpen(false);
                    message.success(`Đã chọn CV: ${selectedCv.title}`);
                  }
                }}
                className="px-5 py-2 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
              >
                Xác nhận chọn CV
              </button>
            </div>
          </div>
        }
        width={560}
      >
        <div className="space-y-3 py-3 max-h-[60vh] overflow-y-auto pr-1">
          {cvList.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0062ff] flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-800 text-sm m-0">Chưa có CV nào được lưu</p>
                <p className="text-xs text-slate-500 m-0">
                  Bạn có thể tạo tối đa 5 CV trên CAREZA bằng CV Studio hoặc tải lên file PDF/DOCX.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <Link
                  href="/ung-vien/cv/builder"
                  className="px-4 py-2 bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Tạo CV bằng Studio
                </Link>
                <Link
                  href="/ung-vien/cv"
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50"
                >
                  Tải lên CV có sẵn
                </Link>
              </div>
            </div>
          ) : (
            cvList.map((cv) => {
              const isSelected = selectedCv?.id === cv.id;
              const isStudio = Boolean(
                cv.parsed_data?.templateId || cv.parsed_data?.cvData || cv.parsed_data?.type === "studio"
              );
              const formattedDate = cv.updated_at || cv.created_at
                ? new Date(cv.updated_at || cv.created_at || "").toLocaleDateString("vi-VN")
                : "Gần đây";

              return (
                <div
                  key={cv.id}
                  onClick={() => setSelectedCv(cv)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${isSelected
                      ? "border-[#0062ff] bg-blue-50/60 shadow-xs ring-2 ring-blue-500/20"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
                    }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Icon */}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${isStudio
                            ? "bg-purple-100 text-purple-600 border border-purple-200/60"
                            : "bg-blue-100 text-[#0062ff] border border-blue-200/60"
                          }`}
                      >
                        {isStudio ? (
                          <Palette className="w-5 h-5" />
                        ) : (
                          <FileText className="w-5 h-5" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-bold text-slate-900 truncate block">
                            {cv.title}
                          </span>
                          {cv.is_primary && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
                              Mặc định
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10.5px] font-bold ${isStudio
                                ? "bg-purple-50 text-purple-700 border border-purple-200"
                                : "bg-sky-50 text-sky-700 border border-sky-200"
                              }`}
                          >
                            {isStudio ? "CV Studio" : "CV Tải lên (PDF/DOCX)"}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Cập nhật: {formattedDate}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions: Preview & Radio selection */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (cv.file_url) {
                            window.open(cv.file_url, "_blank");
                          } else if (isStudio) {
                            window.open(`/ung-vien/cv/builder?id=${cv.id}`, "_blank");
                          } else {
                            message.info("Chưa có bản xem trước cho CV này.");
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 text-[11px] font-bold inline-flex items-center gap-1 transition-colors"
                        title="Xem trước CV"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span className="hidden sm:inline">Xem trước</span>
                      </button>

                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${isSelected
                            ? "border-[#0062ff] bg-[#0062ff] text-white"
                            : "border-slate-300 bg-white"
                          }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Modal>
    </div>
  );
}
