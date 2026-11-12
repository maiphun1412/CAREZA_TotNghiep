"use client";

import { useState, useEffect, use, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Spin, message, Rate } from "antd";
import {
  MapPin,
  Globe,
  Users,
  Briefcase,
  Building2,
  CheckCircle2,
  Share2,
  Heart,
  ChevronRight,
  ChevronLeft,
  Search,
  DollarSign,
  Clock,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  Coffee,
  Gift,
  Compass,
  Award,
  Phone,
  Mail,
  ExternalLink,
  ArrowUpRight,
  Layers,
  Check,
  Calendar,
  Flame,
  Star,
  AlertCircle,
  RefreshCw,
  MessageSquarePlus,
} from "lucide-react";
import dynamic from "next/dynamic";
import { apiClient } from "@/services/api-client";
import { interactionService } from "@/services/interaction.service";
import { useAuthStore } from "@/store/auth-store";

// Dynamic import for Leaflet Map
const CompanyLocationMap = dynamic(
  () => import("@/components/shared/CompanyLocationMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl min-h-[220px]">
        <Spin size="small" />
      </div>
    ),
  }
);

interface CompanyBranch {
  id: number | string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
}

interface CompanyJobItem {
  id: string | number;
  title: string;
  salary: string;
  location: string;
  type: string;
  workplaceType: string;
  deadline?: string;
}

interface CompanyDetailData {
  id: string | number;
  slug: string;
  name: string;
  industry: string;
  logo?: string | null;
  coverImage?: string | null;
  location: string;
  website?: string | null;
  size: string;
  isVerified: boolean;
  establishedYear?: number | null;
  rating?: number | null;
  reviewCount?: number;
  slogan?: string;
  description?: string;
  benefits?: any[];
  social_links?: Record<string, string>;
  stats?: {
    experience?: string;
    size?: string;
    jobsCount?: number;
    branchesCount?: number;
  };
  branches?: CompanyBranch[];
  jobs?: CompanyJobItem[];
}

interface ReviewItem {
  id: number;
  company_id: number;
  rating: number;
  title: string;
  content: string;
  created_at: string;
}

export default function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const companyId = resolvedParams.id;
  const { isAuthenticated } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<
    "not_found" | "error" | null
  >(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [company, setCompany] = useState<CompanyDetailData | null>(null);

  const [activeTab, setActiveTab] = useState("about");
  const [jobSearch, setJobSearch] = useState("");
  const [jobDept, setJobDept] = useState("all");
  const [jobsPage, setJobsPage] = useState(1);
  const jobsPageSize = 6;

  // Follow state connected to real Backend API
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Related companies state connected to real Backend API
  const [relatedCompanies, setRelatedCompanies] = useState<any[]>([]);

  // Reviews state connected to real Backend API
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [reviewsAvgRating, setReviewsAvgRating] = useState<number | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewContent, setReviewContent] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchCompanyDetail = useCallback(async () => {
    setLoading(true);
    setErrorStatus(null);
    setErrorMessage("");
    try {
      const response = await apiClient.get(
        `/companies/${encodeURIComponent(companyId)}/`
      );
      if (response.data?.success && response.data?.data) {
        setCompany(response.data.data);
      } else {
        setCompany(null);
        setErrorStatus("not_found");
      }
    } catch (err: any) {
      setCompany(null);
      if (err?.response?.status === 404) {
        setErrorStatus("not_found");
      } else {
        setErrorStatus("error");
        setErrorMessage(
          err?.response?.data?.message ||
          "Không thể kết nối đến máy chủ để tải thông tin doanh nghiệp."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchCompanyDetail();
  }, [fetchCompanyDetail]);

  // Check follow status when authenticated and company is loaded
  useEffect(() => {
    const numericId = Number(company?.id);
    if (!isAuthenticated || !numericId || Number.isNaN(numericId)) {
      setIsFollowing(false);
      return;
    }
    let mounted = true;
    interactionService
      .checkCompanyFollowed(numericId)
      .then((res) => {
        if (mounted) {
          setIsFollowing(Boolean(res?.is_following));
        }
      })
      .catch(() => {
        if (mounted) setIsFollowing(false);
      });
    return () => {
      mounted = false;
    };
  }, [isAuthenticated, company?.id]);

  // Fetch company reviews from real Backend API: GET /api/interaction/company-reviews/
  const fetchCompanyReviews = useCallback(async (numericCompanyId: number) => {
    if (!numericCompanyId || Number.isNaN(numericCompanyId)) return;
    setReviewsLoading(true);
    try {
      const data = await interactionService.getCompanyReviews(
        numericCompanyId,
        1,
        10
      );
      if (data && Array.isArray(data.items)) {
        setReviews(data.items);
        setReviewsTotal(
          Number(data.review_count ?? data.pagination?.total ?? data.items.length)
        );
        setReviewsAvgRating(
          typeof data.average_rating === "number" ? data.average_rating : null
        );
      } else {
        setReviews([]);
        setReviewsTotal(0);
        setReviewsAvgRating(null);
      }
    } catch {
      setReviews([]);
      setReviewsTotal(0);
      setReviewsAvgRating(null);
    } finally {
      setReviewsLoading(false);
    }
  }, []);

  useEffect(() => {
    const numericId = Number(company?.id);
    if (numericId && !Number.isNaN(numericId)) {
      fetchCompanyReviews(numericId);
    }
  }, [company?.id, fetchCompanyReviews]);

  // Fetch related companies from real Backend API: GET /api/companies/
  useEffect(() => {
    if (!company?.id) return;
    let mounted = true;
    const params: Record<string, any> = { page: 1, page_size: 6 };
    if (company.industry && company.industry !== "Đa ngành") {
      params.industry = company.industry;
    }
    apiClient
      .get("/companies/", { params })
      .then((res) => {
        if (!mounted) return;
        const items = res.data?.data?.items;
        if (Array.isArray(items)) {
          const filtered = items
            .filter((item: any) => String(item.id) !== String(company.id))
            .slice(0, 3);
          setRelatedCompanies(filtered);
        }
      })
      .catch(() => {
        if (mounted) setRelatedCompanies([]);
      });
    return () => {
      mounted = false;
    };
  }, [company?.id, company?.industry]);

  const scrollToSection = (sectionId: string) => {
    setActiveTab(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -100;
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      message.success("Đã sao chép liên kết trang công ty!");
    }
  };

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      message.info("Vui lòng đăng nhập để theo dõi doanh nghiệp.");
      router.push(
        `/dang-nhap?callbackUrl=${encodeURIComponent(window.location.pathname)}`
      );
      return;
    }

    const numericId = Number(company?.id);
    if (!numericId || Number.isNaN(numericId)) {
      message.warning("Không xác định được mã doanh nghiệp.");
      return;
    }

    setFollowLoading(true);
    try {
      if (isFollowing) {
        await interactionService.unfollowCompany(numericId);
        setIsFollowing(false);
        message.info(`Đã bỏ theo dõi ${company?.name || "doanh nghiệp"}`);
      } else {
        await interactionService.followCompany(numericId);
        setIsFollowing(true);
        message.success(`Đã theo dõi ${company?.name || "doanh nghiệp"}`);
      }
    } catch (err: any) {
      message.error(
        err?.response?.data?.message ||
        "Không thể cập nhật trạng thái theo dõi. Vui lòng thử lại."
      );
    } finally {
      setFollowLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      message.info("Vui lòng đăng nhập để gửi đánh giá công ty.");
      router.push(
        `/dang-nhap?callbackUrl=${encodeURIComponent(window.location.pathname)}`
      );
      return;
    }

    const numericId = Number(company?.id);
    if (!numericId || Number.isNaN(numericId)) return;

    if (!reviewContent.trim()) {
      message.warning("Vui lòng nhập nội dung đánh giá.");
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await apiClient.post("/interaction/company-reviews/", {
        company_id: numericId,
        rating: reviewRating,
        title: reviewTitle.trim(),
        content: reviewContent.trim(),
      });
      const msg =
        res.data?.data?.message ||
        "Gửi đánh giá thành công. Đánh giá của bạn đang chờ kiểm duyệt.";
      message.success(msg);
      setReviewTitle("");
      setReviewContent("");
      setReviewRating(5);
      setShowReviewForm(false);
      fetchCompanyReviews(numericId);
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.errors?.content?.[0] ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Không thể gửi đánh giá lúc này. Vui lòng thử lại.";
      message.error(errMsg);
    } finally {
      setSubmittingReview(false);
    }
  };

  const jobs: CompanyJobItem[] = useMemo(
    () => (Array.isArray(company?.jobs) ? company.jobs : []),
    [company?.jobs]
  );

  const branches: CompanyBranch[] = useMemo(
    () => (Array.isArray(company?.branches) ? company.branches : []),
    [company?.branches]
  );

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const kw = jobSearch.trim().toLowerCase();
      const matchesKw =
        !kw ||
        job.title.toLowerCase().includes(kw) ||
        (job.location || "").toLowerCase().includes(kw);

      const matchesType =
        jobDept === "all" ||
        (jobDept === "fulltime" &&
          (job.type || "").toLowerCase().includes("full")) ||
        (jobDept === "remote" &&
          ((job.workplaceType || "").toLowerCase().includes("remote") ||
            (job.workplaceType || "").toLowerCase().includes("hybrid")));

      return matchesKw && matchesType;
    });
  }, [jobs, jobSearch, jobDept]);

  const totalJobPages = Math.max(
    1,
    Math.ceil(filteredJobs.length / jobsPageSize)
  );
  const paginatedJobs = useMemo(() => {
    const start = (jobsPage - 1) * jobsPageSize;
    return filteredJobs.slice(start, start + jobsPageSize);
  }, [filteredJobs, jobsPage, jobsPageSize]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-24">
          <Spin size="large" />
          <p className="text-[#475569] font-medium text-sm">
            Đang tải thông tin doanh nghiệp...
          </p>
        </div>
      </div>
    );
  }

  if (!company || errorStatus) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC] px-4 py-16">
        <div className="max-w-lg w-full mx-auto bg-white rounded-2xl border border-[#E2E8F0] p-8 sm:p-10 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto mb-4">
            {errorStatus === "not_found" ? (
              <Building2 className="w-8 h-8" />
            ) : (
              <AlertCircle className="w-8 h-8 text-rose-600" />
            )}
          </div>
          <h1 className="text-xl font-extrabold text-[#0F172A] mb-2">
            {errorStatus === "not_found"
              ? "Không tìm thấy doanh nghiệp"
              : "Không thể tải thông tin doanh nghiệp"}
          </h1>
          <p className="text-sm text-[#64748B] leading-relaxed mb-6">
            {errorStatus === "not_found"
              ? "Doanh nghiệp bạn đang tìm kiếm không tồn tại hoặc đã ngừng hiển thị trên hệ thống CAREZA."
              : errorMessage ||
              "Đã xảy ra lỗi khi tải dữ liệu công ty. Vui lòng thử lại sau."}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {errorStatus === "error" && (
              <button
                type="button"
                onClick={fetchCompanyDetail}
                className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1E40AF] text-white text-sm font-semibold transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Thử lại
              </button>
            )}
            <Link
              href="/cong-ty"
              className="px-5 py-2.5 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#0F172A] border border-[#E2E8F0] text-sm font-semibold transition-all inline-flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Quay lại danh sách công ty
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const cleanContactValue = (val?: string | null) => {
    if (!val) return "";
    const trimmed = val.trim();
    if (
      trimmed === "(Đang cập nhật)" ||
      trimmed === "Đang cập nhật" ||
      trimmed === "Chưa cập nhật"
    ) {
      return "";
    }
    return trimmed;
  };

  const primaryAddress =
    company.location ||
    (branches[0]?.address &&
      branches[0].address !== "Chưa cập nhật địa chỉ"
      ? branches[0].address
      : "") ||
    "Việt Nam";
  const primaryPhone = cleanContactValue(branches[0]?.phone);
  const primaryEmail = cleanContactValue(branches[0]?.email);
  const openJobsCount = company.stats?.jobsCount ?? jobs.length;
  const branchesCount = company.stats?.branchesCount ?? branches.length;
  const companyBenefits = Array.isArray(company.benefits)
    ? company.benefits
    : [];
  const effectiveReviewCount = Number(company.reviewCount ?? reviewsTotal ?? 0);
  const effectiveRating =
    effectiveReviewCount > 0
      ? typeof reviewsAvgRating === "number"
        ? reviewsAvgRating
        : typeof company.rating === "number"
          ? company.rating
          : null
      : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans text-[#0F172A] selection:bg-[#2563EB]/15 selection:text-[#2563EB]">
      <main className="flex-1 pb-20">
        {/* ============================================================
            1. BREADCRUMB BAR (COMPACT & VERTICALLY CENTERED)
            ============================================================ */}
        <div className="bg-white border-b border-[#E2E8F0]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-1.5">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1.5 text-[11px] text-[#475569] overflow-x-auto whitespace-nowrap leading-none"
            >
              <Link
                href="/"
                className="text-[#2563EB] hover:underline transition-colors font-medium py-0.5"
              >
                Trang chủ
              </Link>
              <ChevronRight className="w-3 h-3 text-[#94A3B8] shrink-0" />
              <Link
                href="/cong-ty"
                className="text-[#2563EB] hover:underline transition-colors font-medium py-0.5"
              >
                Công ty
              </Link>
              <ChevronRight className="w-3 h-3 text-[#94A3B8] shrink-0" />
              <span className="text-[#0F172A] font-semibold truncate max-w-[260px] sm:max-w-md py-0.5">
                {company.name}
              </span>
            </nav>
          </div>
        </div>

        {/* ============================================================
            2. HERO COMPANY BANNER & OVERLAPPING PROFILE HEADER
            ============================================================ */}
        <section className="relative">
          {/* Cover Banner */}
          <div className="w-full h-[200px] sm:h-[260px] lg:h-[300px] relative overflow-hidden bg-[#0F172A]">
            {company.coverImage ? (
              <img
                src={company.coverImage}
                alt={`${company.name} cover`}
                className="w-full h-full object-cover object-center opacity-85 scale-[1.01]"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-[#0F172A] via-[#1E3A8A] to-[#2563EB]" />
            )}
            {/* Subtle dark/blue gradient overlay for contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/85 via-[#0F172A]/35 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1E40AF]/25 to-transparent" />
          </div>

          {/* Overlapping Header Card */}
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative -mt-12 sm:-mt-14 bg-white rounded-2xl border border-[#CBD5E1] shadow-[0_4px_20px_rgba(15,23,42,0.04)] px-5 sm:px-6 pt-4 sm:pt-4.5 pb-2.5 sm:pb-3">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5">
                {/* Left: Logo + Identity */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 min-w-0">
                  {/* Company Logo Box */}
                  <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl bg-white border border-[#CBD5E1] shadow-sm flex items-center justify-center p-2 shrink-0 -mt-8 sm:mt-0 relative z-10 overflow-hidden">
                    {company.logo ? (
                      <img
                        src={company.logo}
                        alt={company.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-[#2563EB]">
                        <Building2 className="w-8 h-8 mb-0.5" />
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0F172A] line-clamp-1">
                          {company.name.slice(0, 10)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Company Name, Badges, Slogan & Quick Meta */}
                  <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight leading-[1.35] sm:leading-[1.4] m-0">
                      {company.name}
                    </h1>

                    {/* Badges immediately under name (separated by 8-10px) */}
                    <div className="flex flex-wrap items-center gap-2.5 mt-2 sm:mt-2.5">
                      {company.isVerified && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11.5px] font-semibold bg-[#10B981]/10 text-[#059669] border border-[#10B981]/25">
                          <CheckCircle2 className="w-3.5 h-3.5 fill-[#059669] text-white" />
                          Đã xác minh
                        </span>
                      )}

                      {openJobsCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11.5px] font-semibold bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20">
                          <Sparkles className="w-3 h-3" />
                          Đang tuyển ({openJobsCount})
                        </span>
                      )}

                      {effectiveRating !== null && effectiveReviewCount > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11.5px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {effectiveRating.toFixed(1)} ({effectiveReviewCount} đánh giá)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11.5px] font-medium bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]">
                          <Star className="w-3.5 h-3.5 text-[#94A3B8]" />
                          Chưa có đánh giá
                        </span>
                      )}
                    </div>

                    {company.slogan && (
                      <p className="text-xs sm:text-sm text-[#475569] font-medium max-w-2xl m-0 line-clamp-1 mt-2">
                        {company.slogan}
                      </p>
                    )}

                    {/* Meta Info: 12px below badges */}
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3 text-xs text-[#475569]">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Layers className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                        <span>{company.industry || "Đa ngành"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <Users className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                        <span>
                          {company.size ||
                            company.stats?.size ||
                            "50 - 150 nhân sự"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                        <span>{primaryAddress}</span>
                      </div>
                      {company.website && (
                        <a
                          href={
                            company.website.startsWith("http")
                              ? company.website
                              : `https://${company.website}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 font-semibold text-[#2563EB] hover:text-[#1E40AF] transition-colors"
                        >
                          <Globe className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            {company.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                          </span>
                          <ExternalLink className="w-3 h-3 text-[#2563EB]" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions aligned */}
                <div className="flex items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#E2E8F0] shrink-0 self-start sm:self-auto">
                  <button
                    type="button"
                    disabled={followLoading}
                    onClick={handleFollowToggle}
                    className={`inline-flex items-center justify-center gap-2 px-3.5 h-9 rounded-xl font-bold text-xs sm:text-[13px] transition-all cursor-pointer shadow-xs ${isFollowing
                        ? "bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/30 hover:bg-[#DBEAFE]"
                        : "bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
                      }`}
                  >
                    {isFollowing ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Đang theo dõi</span>
                      </>
                    ) : (
                      <>
                        <Heart className="w-3.5 h-3.5" />
                        <span>Theo dõi công ty</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollToSection("jobs")}
                    className="inline-flex items-center justify-center gap-2 px-3.5 h-9 rounded-xl font-bold text-xs sm:text-[13px] bg-white text-[#0F172A] border border-[#CBD5E1] hover:border-[#2563EB] hover:text-[#2563EB] transition-all cursor-pointer"
                  >
                    <Briefcase className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Việc làm ({openJobsCount})</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    title="Chia sẻ công ty"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white text-[#475569] border border-[#CBD5E1] hover:border-[#2563EB] hover:text-[#2563EB] hover:bg-[#EFF6FF]/50 transition-all cursor-pointer shrink-0"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Navigation Tabs inside Header Bottom */}
              <div className="mt-3.5 pt-2.5 border-t border-[#E2E8F0] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  { id: "about", label: "Về chúng tôi" },
                  {
                    id: "jobs",
                    label: "Vị trí tuyển dụng",
                    badge: openJobsCount,
                  },
                  { id: "benefits", label: "Phúc lợi & Đãi ngộ" },
                  {
                    id: "reviews",
                    label: "Đánh giá công ty",
                    badge: reviewsTotal,
                  },
                  { id: "office", label: "Văn phòng & Liên hệ" },
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => scrollToSection(tab.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-[13px] font-semibold whitespace-nowrap transition-all cursor-pointer relative ${isActive
                          ? "bg-[#EFF6FF] text-[#2563EB] font-bold border-b-2 border-[#2563EB] rounded-b-none"
                          : "text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
                        }`}
                    >
                      <span>{tab.label}</span>
                      {tab.badge !== undefined && (
                        <span
                          className={`px-1.5 py-0.2 text-[11px] rounded-full font-bold ${isActive
                              ? "bg-[#2563EB] text-white"
                              : "bg-[#F1F5F9] text-[#475569]"
                            }`}
                        >
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            3. KEY COMPANY METRICS ROW (4 STAT CARDS)
            ============================================================ */}
        <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 mt-3.5 sm:mt-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Card 1: Kinh nghiệm hoạt động */}
            <div className="bg-white rounded-2xl px-4 py-3.5 border border-[#CBD5E1] shadow-2xs flex items-center gap-3.5 hover:border-[#2563EB]/40 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0 border border-[#2563EB]/20">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col items-center justify-center text-center">
                <p className="text-[12px] font-medium text-[#64748B] leading-tight m-0">
                  Kinh nghiệm hoạt động
                </p>
                <p className="text-[18px] sm:text-[20px] font-bold text-[#0F172A] mt-1 leading-none truncate m-0">
                  {company.establishedYear
                    ? `${new Date().getFullYear() - company.establishedYear} năm`
                    : company.stats?.experience || "Nhiều năm"}
                </p>
              </div>
            </div>

            {/* Card 2: Quy mô nhân sự */}
            <div className="bg-white rounded-2xl px-4 py-3.5 border border-[#CBD5E1] shadow-2xs flex items-center gap-3.5 hover:border-[#2563EB]/40 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-[#10B981]/10 text-[#059669] flex items-center justify-center shrink-0 border border-[#10B981]/20">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col items-center justify-center text-center">
                <p className="text-[12px] font-medium text-[#64748B] leading-tight m-0">
                  Quy mô nhân sự
                </p>
                <p className="text-[18px] sm:text-[20px] font-bold text-[#0F172A] mt-1 leading-none truncate m-0">
                  {company.size || company.stats?.size || "50–150 nhân sự"}
                </p>
              </div>
            </div>

            {/* Card 3: Việc làm đang mở */}
            <div className="bg-white rounded-2xl px-4 py-3.5 border border-[#CBD5E1] shadow-2xs flex items-center gap-3.5 hover:border-[#2563EB]/40 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-[#F59E0B]/10 text-[#D97706] flex items-center justify-center shrink-0 border border-[#F59E0B]/20">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col items-center justify-center text-center">
                <p className="text-[12px] font-medium text-[#64748B] leading-tight m-0">
                  Việc làm đang mở
                </p>
                <p className="text-[18px] sm:text-[20px] font-bold text-[#0F172A] mt-1 leading-none truncate m-0">
                  {openJobsCount} vị trí
                </p>
              </div>
            </div>

            {/* Card 4: Chi nhánh văn phòng */}
            <div className="bg-white rounded-2xl px-4 py-3.5 border border-[#CBD5E1] shadow-2xs flex items-center gap-3.5 hover:border-[#2563EB]/40 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0 border border-purple-500/20">
                <Globe className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col items-center justify-center text-center">
                <p className="text-[12px] font-medium text-[#64748B] leading-tight m-0">
                  Chi nhánh văn phòng
                </p>
                <p className="text-[18px] sm:text-[20px] font-bold text-[#0F172A] mt-1 leading-none truncate m-0">
                  {branchesCount > 0 ? `${branchesCount} cơ sở` : "1 cơ sở"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            4. MAIN 2-COLUMN CONTENT GRID
            ============================================================ */}
        <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 mt-3.5 sm:mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
            {/* LEFT COLUMN (8 COLS) */}
            <div className="lg:col-span-8 space-y-4 sm:space-y-4.5">
              {/* 4.1. ABOUT US */}
              <div
                id="about"
                className="bg-white rounded-2xl border border-[#CBD5E1] p-4.5 sm:p-5 scroll-mt-24 shadow-2xs"
              >
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#F1F5F9]">
                  <div className="w-1.5 h-4.5 rounded-full bg-[#2563EB]" />
                  <h2 className="text-[18px] font-bold text-[#0F172A] m-0">
                    Giới thiệu công ty
                  </h2>
                </div>

                <div className="space-y-2.5 text-[#334155] text-[13.5px] sm:text-[14px] leading-relaxed whitespace-pre-line">
                  {company.description ? (
                    <p className="m-0">{company.description}</p>
                  ) : (
                    <p className="italic text-[#64748B] m-0">
                      Chưa có thông tin giới thiệu chi tiết từ doanh nghiệp.
                    </p>
                  )}
                </div>

                {/* Core Values Sub-grid */}
                <div className="mt-4 pt-3.5 border-t border-[#E2E8F0] grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] flex flex-col justify-center">
                    <div className="flex items-center gap-2 font-semibold text-[#0F172A] text-[13.5px] mb-1">
                      <Award className="w-4 h-4 text-[#2563EB]" />
                      <span>Lĩnh vực hoạt động</span>
                    </div>
                    <p className="text-[12.5px] text-[#475569] leading-relaxed m-0 font-normal">
                      {company.industry || "Công nghệ thông tin"}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] flex flex-col justify-center">
                    <div className="flex items-center gap-2 font-semibold text-[#0F172A] text-[13.5px] mb-1">
                      <Sparkles className="w-4 h-4 text-[#D97706]" />
                      <span>Trạng thái xác thực</span>
                    </div>
                    <p className="text-[12.5px] text-[#475569] leading-relaxed m-0 font-normal">
                      {company.isVerified
                        ? "Doanh nghiệp đã được xác thực pháp lý trên CAREZA."
                        : "Đang trong quá trình cập nhật hồ sơ xác thực."}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] flex flex-col justify-center">
                    <div className="flex items-center gap-2 font-semibold text-[#0F172A] text-[13.5px] mb-1">
                      <ShieldCheck className="w-4 h-4 text-[#059669]" />
                      <span>Quy mô tổ chức</span>
                    </div>
                    <p className="text-[12.5px] text-[#475569] leading-relaxed m-0 font-normal">
                      {company.size || company.stats?.size || "50–150 nhân sự"}
                    </p>
                  </div>
                </div>
              </div>

              {/* 4.2. OPEN JOB POSITIONS */}
              <div
                id="jobs"
                className="bg-white rounded-2xl border border-[#CBD5E1] p-4.5 sm:p-5 scroll-mt-24 shadow-2xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 pb-2 border-b border-[#F1F5F9]">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-4.5 rounded-full bg-[#2563EB]" />
                    <h2 className="text-[18px] font-bold text-[#0F172A] m-0">
                      Vị trí đang tuyển dụng
                    </h2>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[#EFF6FF] text-[#2563EB] text-xs font-bold self-start sm:self-auto border border-[#2563EB]/20">
                    <Flame className="w-3.5 h-3.5 fill-[#2563EB]" />
                    {filteredJobs.length} việc làm đang mở
                  </span>
                </div>

                {/* Search & Filter Bar */}
                {jobs.length > 0 && (
                  <div className="flex flex-col sm:flex-row gap-2.5 mb-4 p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={jobSearch}
                        onChange={(e) => {
                          setJobSearch(e.target.value);
                          setJobsPage(1);
                        }}
                        placeholder="Tìm theo chức danh, địa điểm làm việc..."
                        className="w-full pl-9 pr-3 py-2 bg-white border border-[#CBD5E1] rounded-lg text-xs sm:text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] transition-colors"
                      />
                    </div>
                    <select
                      aria-label="Lọc theo hình thức"
                      value={jobDept}
                      onChange={(e) => {
                        setJobDept(e.target.value);
                        setJobsPage(1);
                      }}
                      className="px-3 py-2 bg-white border border-[#CBD5E1] rounded-lg text-xs sm:text-sm font-medium text-[#0F172A] focus:outline-none focus:border-[#2563EB] cursor-pointer"
                    >
                      <option value="all">Tất cả hình thức</option>
                      <option value="fulltime">Toàn thời gian</option>
                      <option value="remote">Remote / Hybrid</option>
                    </select>
                  </div>
                )}

                {/* Job Cards List */}
                {paginatedJobs.length === 0 ? (
                  <div className="py-7 px-4 text-center bg-[#F8FAFC] rounded-xl border border-dashed border-[#CBD5E1]">
                    <Briefcase className="w-7 h-7 text-[#94A3B8] mx-auto mb-2" />
                    <p className="text-[14px] font-semibold text-[#0F172A] m-0">
                      {jobs.length === 0
                        ? "Hiện chưa có tin tuyển dụng nào đang mở."
                        : "Không tìm thấy vị trí phù hợp với bộ lọc."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {paginatedJobs.map((job) => (
                      <div
                        key={job.id}
                        className="group relative bg-white hover:bg-[#F8FAFC] rounded-xl p-4 sm:p-4.5 border border-[#CBD5E1] hover:border-[#2563EB] transition-all duration-200 shadow-2xs hover:shadow-sm"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Link
                                href={`/viec-lam/${job.id}`}
                                className="text-[15px] sm:text-[16px] font-semibold text-[#0F172A] group-hover:text-[#2563EB] transition-colors line-clamp-1 m-0"
                              >
                                {job.title}
                              </Link>
                            </div>

                            {/* Job Meta Info */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[#64748B]">
                              <span className="inline-flex items-center gap-1 font-bold text-[#059669]">
                                <DollarSign className="w-3.5 h-3.5" />
                                {job.salary || "Thỏa thuận"}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-[#64748B]" />
                                {job.location || primaryAddress}
                              </span>
                              {job.type && (
                                <span className="inline-flex items-center gap-1">
                                  <Briefcase className="w-3.5 h-3.5 text-[#64748B]" />
                                  {job.type === "full_time"
                                    ? "Toàn thời gian"
                                    : job.type === "part_time"
                                      ? "Bán thời gian"
                                      : job.type === "internship"
                                        ? "Thực tập"
                                        : job.type === "contract"
                                          ? "Hợp đồng"
                                          : job.type}
                                </span>
                              )}
                              {job.deadline && (
                                <span className="inline-flex items-center gap-1 text-[#64748B]">
                                  <Clock className="w-3.5 h-3.5 text-[#64748B]" />
                                  Hạn: {job.deadline}
                                </span>
                              )}
                            </div>

                            {/* Workplace Tag */}
                            {job.workplaceType && (
                              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                <span className="px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[#64748B] text-[11px] font-medium border border-slate-200">
                                  {job.workplaceType === "hybrid"
                                    ? "Linh hoạt (Hybrid)"
                                    : job.workplaceType === "remote"
                                      ? "Làm từ xa (Remote)"
                                      : job.workplaceType === "onsite" ||
                                        job.workplaceType === "office"
                                        ? "Tại văn phòng"
                                        : job.workplaceType}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Right CTA */}
                          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E2E8F0] shrink-0">
                            <Link
                              href={`/viec-lam/${job.id}`}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#EFF6FF] text-[#2563EB] hover:bg-[#2563EB] hover:text-white text-xs font-bold transition-all border border-[#2563EB]/20"
                            >
                              <span>Ứng tuyển</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Dynamic Pagination for Jobs */}
                {totalJobPages > 1 && (
                  <div className="mt-6 pt-5 border-t border-[#E2E8F0] flex items-center justify-between text-sm">
                    <span className="text-[#475569] text-xs sm:text-sm">
                      Trang{" "}
                      <strong className="text-[#0F172A]">{jobsPage}</strong> /{" "}
                      <strong className="text-[#0F172A]">
                        {totalJobPages}
                      </strong>{" "}
                      ({filteredJobs.length} vị trí)
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={jobsPage <= 1}
                        onClick={() => setJobsPage((p) => Math.max(1, p - 1))}
                        className="w-9 h-9 rounded-lg border border-[#E2E8F0] flex items-center justify-center text-[#475569] hover:border-[#2563EB] hover:text-[#2563EB] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      {Array.from(
                        { length: totalJobPages },
                        (_, idx) => idx + 1
                      ).map((pageNum) => (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setJobsPage(pageNum)}
                          className={`w-9 h-9 rounded-lg text-xs font-bold transition-colors cursor-pointer ${jobsPage === pageNum
                              ? "bg-[#2563EB] text-white"
                              : "border border-[#E2E8F0] text-[#475569] hover:border-[#2563EB] hover:text-[#2563EB]"
                            }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                      <button
                        type="button"
                        disabled={jobsPage >= totalJobPages}
                        onClick={() =>
                          setJobsPage((p) => Math.min(totalJobPages, p + 1))
                        }
                        className="w-9 h-9 rounded-lg border border-[#E2E8F0] flex items-center justify-center text-[#475569] hover:border-[#2563EB] hover:text-[#2563EB] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 4.3. EMPLOYEE BENEFITS & PERKS */}
              <div
                id="benefits"
                className="bg-white rounded-2xl border border-[#CBD5E1] p-4.5 sm:p-5 scroll-mt-24 shadow-2xs"
              >
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#F1F5F9]">
                  <div className="w-1.5 h-4.5 rounded-full bg-[#10B981]" />
                  <h2 className="text-[18px] font-bold text-[#0F172A] m-0">
                    Phúc lợi & Đãi ngộ
                  </h2>
                </div>

                {companyBenefits.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {companyBenefits.map((item: any, idx: number) => {
                      const title =
                        typeof item === "string"
                          ? item
                          : item?.title || item?.name || `Phúc lợi #${idx + 1}`;
                      const desc =
                        typeof item === "object" && item?.description
                          ? item.description
                          : "";
                      const icons = [
                        Gift,
                        ShieldCheck,
                        GraduationCap,
                        Coffee,
                        Compass,
                        Sparkles,
                      ];
                      const IconComponent = icons[idx % icons.length];
                      return (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] hover:border-[#2563EB]/40 transition-all flex items-start gap-2.5"
                        >
                          <div className="w-8.5 h-8.5 rounded-lg flex items-center justify-center shrink-0 bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20">
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-[13.5px] sm:text-[14.5px] font-semibold text-[#0F172A] mb-0.5">
                              {title}
                            </h3>
                            {desc && (
                              <p className="text-[12.5px] text-[#475569] leading-relaxed m-0">
                                {desc}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-5 px-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-center text-[13.5px] text-[#64748B]">
                    Doanh nghiệp chưa cập nhật thông tin phúc lợi.
                  </div>
                )}
              </div>

              {/* 4.4. COMPANY REVIEWS (CONNECTED TO REAL BACKEND API) */}
              <div
                id="reviews"
                className="bg-white rounded-2xl border border-[#CBD5E1] p-4.5 sm:p-5 scroll-mt-24 shadow-2xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 pb-2 border-b border-[#F1F5F9]">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-4.5 rounded-full bg-[#F59E0B]" />
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-[18px] font-bold text-[#0F172A] m-0">
                        Đánh giá từ cộng đồng ({effectiveReviewCount})
                      </h2>
                      {effectiveRating !== null && effectiveReviewCount > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {effectiveRating.toFixed(1)} / 5.0
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]">
                          Chưa có đánh giá
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!isAuthenticated) {
                        message.info(
                          "Vui lòng đăng nhập để gửi đánh giá doanh nghiệp."
                        );
                        router.push(
                          `/dang-nhap?callbackUrl=${encodeURIComponent(
                            window.location.pathname
                          )}`
                        );
                        return;
                      }
                      setShowReviewForm((prev) => !prev);
                    }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#EFF6FF] hover:bg-[#2563EB] text-[#2563EB] hover:text-white text-xs sm:text-[13px] font-semibold transition-all cursor-pointer self-start sm:self-auto border border-[#2563EB]/20"
                  >
                    <MessageSquarePlus className="w-4 h-4" />
                    <span>
                      {showReviewForm ? "Đóng biểu mẫu" : "Viết đánh giá"}
                    </span>
                  </button>
                </div>

                {showReviewForm && (
                  <form
                    onSubmit={handleSubmitReview}
                    className="mb-4 p-4 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] space-y-3.5"
                  >
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                        Mức độ hài lòng
                      </label>
                      <Rate
                        value={reviewRating}
                        onChange={(val) => setReviewRating(val || 5)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                        Tiêu đề đánh giá (không bắt buộc)
                      </label>
                      <input
                        type="text"
                        value={reviewTitle}
                        onChange={(e) => setReviewTitle(e.target.value)}
                        placeholder="Ví dụ: Môi trường làm việc chuyên nghiệp, đồng nghiệp thân thiện"
                        maxLength={180}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-[#CBD5E1] focus:border-[#2563EB] outline-none text-xs sm:text-sm text-[#0F172A]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                        Nội dung đánh giá *
                      </label>
                      <textarea
                        rows={3}
                        value={reviewContent}
                        onChange={(e) => setReviewContent(e.target.value)}
                        placeholder="Chia sẻ trải nghiệm thực tế của bạn về văn hóa, chế độ đãi ngộ hoặc quy trình tuyển dụng..."
                        required
                        className="w-full px-3 py-2 bg-white rounded-xl border border-[#CBD5E1] focus:border-[#2563EB] outline-none text-xs sm:text-sm text-[#0F172A]"
                      />
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowReviewForm(false)}
                        className="px-3.5 py-1.5 rounded-xl border border-[#CBD5E1] bg-white text-xs font-semibold text-[#475569] hover:bg-[#F1F5F9] cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="px-4 py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1E40AF] disabled:opacity-50 text-white text-xs font-semibold transition-all cursor-pointer"
                      >
                        {submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                      </button>
                    </div>
                  </form>
                )}

                {reviewsLoading ? (
                  <div className="py-5 text-center">
                    <Spin size="small" />
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="py-5 px-4 rounded-xl bg-[#F8FAFC] border border-dashed border-[#CBD5E1] text-center">
                    <p className="text-[13.5px] font-medium text-[#64748B] m-0">
                      Chưa có đánh giá. Hãy chia sẻ trải nghiệm của bạn.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1]"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-0.5 text-amber-400">
                              {Array.from({ length: 5 }, (_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${
                                    i < rev.rating
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-slate-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-[13.5px] font-semibold text-[#0F172A]">
                              {rev.title || "Đánh giá doanh nghiệp"}
                            </span>
                          </div>
                          {rev.created_at && (
                            <span className="text-[11px] text-[#64748B]">
                              {new Date(rev.created_at).toLocaleDateString(
                                "vi-VN"
                              )}
                            </span>
                          )}
                        </div>
                        <p className="text-[13.5px] text-[#334155] leading-relaxed whitespace-pre-line m-0">
                          {rev.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 4.5. OFFICE LOCATIONS & MAP */}
              <div
                id="office"
                className="bg-white rounded-2xl border border-[#CBD5E1] p-4.5 sm:p-5 scroll-mt-24 shadow-2xs"
              >
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#F1F5F9]">
                  <div className="w-1.5 h-4.5 rounded-full bg-[#2563EB]" />
                  <h2 className="text-[18px] font-bold text-[#0F172A] m-0">
                    Địa điểm văn phòng
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
                  {/* Branch List */}
                  <div className="md:col-span-6 space-y-2.5">
                    {branches.length > 0 ? (
                      branches.map((branch, idx) => (
                        <div
                          key={branch.id || idx}
                          className={`p-3 rounded-xl border transition-all ${
                            idx === 0
                              ? "bg-[#EFF6FF]/70 border-[#2563EB]/40"
                              : "bg-[#F8FAFC] border-[#CBD5E1]"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Building2
                              className={`w-4 h-4 ${
                                idx === 0 ? "text-[#2563EB]" : "text-[#475569]"
                              }`}
                            />
                            <h3 className="text-[13.5px] font-semibold text-[#0F172A]">
                              {branch.name}
                            </h3>
                            {idx === 0 && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#2563EB] text-white">
                                Chính
                              </span>
                            )}
                          </div>
                          <p className="text-[12.5px] text-[#475569] leading-relaxed pl-6 m-0">
                            {branch.address &&
                            branch.address !== "Chưa cập nhật địa chỉ"
                              ? branch.address
                              : primaryAddress}
                          </p>
                          {(cleanContactValue(branch.phone) ||
                            cleanContactValue(branch.email)) && (
                            <div className="pl-6 mt-1.5 space-y-0.5 text-xs text-[#64748B]">
                              {cleanContactValue(branch.phone) && (
                                <p className="m-0">ĐT: {cleanContactValue(branch.phone)}</p>
                              )}
                              {cleanContactValue(branch.email) && (
                                <p className="m-0">Email: {cleanContactValue(branch.email)}</p>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-3 rounded-xl bg-[#EFF6FF]/70 border border-[#2563EB]/40">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="w-4 h-4 text-[#2563EB]" />
                          <h3 className="text-[13.5px] font-semibold text-[#0F172A]">
                            Địa chỉ doanh nghiệp
                          </h3>
                        </div>
                        <p className="text-[12.5px] text-[#475569] leading-relaxed pl-6 m-0">
                          {primaryAddress}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Interactive Map */}
                  <div className="md:col-span-6 min-h-[200px] rounded-xl overflow-hidden border border-[#CBD5E1]">
                    <CompanyLocationMap
                      address={primaryAddress}
                      companyName={company.name}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ============================================================
                RIGHT SIDEBAR (4 COLS) — STICKY SUMMARY & CONTACT
                ============================================================ */}
            <aside className="lg:col-span-4 space-y-4 sm:space-y-4.5 lg:sticky lg:top-24">
              {/* Card 1: Company Overview Facts */}
              <div className="bg-white rounded-2xl border border-[#CBD5E1] shadow-2xs overflow-hidden">
                <div className="bg-[#EFF6FF] px-4.5 py-3 border-b border-[#DBEAFE] flex items-center gap-2">
                  <div className="w-6.5 h-6.5 rounded-lg bg-white flex items-center justify-center text-[#2563EB] shadow-xs">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-[15.5px] font-semibold text-[#0F172A] m-0">
                    Thông tin chung
                  </h3>
                </div>

                <div className="p-4.5">
                  <div className="space-y-3 text-[13px] sm:text-[13.5px]">
                    <div className="flex items-start justify-between gap-3 pb-2 border-b border-[#F1F5F9]">
                      <span className="text-[#64748B]">Lĩnh vực:</span>
                      <span className="font-medium text-[#0F172A] text-right">
                        {company.industry || "Đa ngành"}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-3 pb-2 border-b border-[#F1F5F9]">
                      <span className="text-[#64748B]">Quy mô công ty:</span>
                      <span className="font-medium text-[#0F172A] text-right">
                        {company.size || "Đang cập nhật"}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-3 pb-2 border-b border-[#F1F5F9]">
                      <span className="text-[#64748B]">Địa điểm:</span>
                      <span className="font-medium text-[#0F172A] text-right">
                        {primaryAddress}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-3 pb-2 border-b border-[#F1F5F9]">
                      <span className="text-[#64748B]">Việc làm đang mở:</span>
                      <span className="font-bold text-[#2563EB] text-right">
                        {openJobsCount} vị trí
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-[#64748B]">Trạng thái:</span>
                      {company.isVerified ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-[#10B981] text-right">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Đã xác thực
                        </span>
                      ) : (
                        <span className="font-medium text-[#64748B] text-right">
                          Chưa xác thực
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Contact Info Block */}
                  <div className="mt-4 pt-3.5 border-t border-[#E2E8F0] space-y-2">
                    <p className="text-[11.5px] font-semibold uppercase tracking-wider text-[#64748B] m-0">
                      Kênh liên hệ chính thức
                    </p>

                    {company.website && (
                      <a
                        href={
                          company.website.startsWith("http")
                            ? company.website
                            : `https://${company.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 p-2 rounded-xl bg-[#F8FAFC] hover:bg-[#EFF6FF] text-[12.5px] font-medium text-[#0F172A] hover:text-[#2563EB] border border-[#CBD5E1] transition-colors"
                      >
                        <Globe className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                        <span className="truncate">{company.website}</span>
                        <ExternalLink className="w-3 h-3 ml-auto shrink-0 opacity-60" />
                      </a>
                    )}

                    {primaryPhone && (
                      <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#F8FAFC] text-[12.5px] font-medium text-[#0F172A] border border-[#CBD5E1]">
                        <Phone className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                        <span>{primaryPhone}</span>
                      </div>
                    )}

                    {primaryEmail && (
                      <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#F8FAFC] text-[12.5px] font-medium text-[#0F172A] border border-[#CBD5E1]">
                        <Mail className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
                        <span className="truncate">{primaryEmail}</span>
                      </div>
                    )}

                    {!company.website && !primaryPhone && !primaryEmail && (
                      <p className="text-[11.5px] text-[#64748B] italic m-0">
                        Thông tin liên hệ trực tiếp được đính kèm trong từng tin
                        tuyển dụng.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 2: Job Alert Subscription CTA (Clean Corporate SaaS flat style) */}
              <div className="bg-[#1E40AF] rounded-2xl p-4.5 text-white shadow-md relative overflow-hidden border border-[#1D4ED8]">
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <h3 className="text-[15.5px] font-semibold leading-snug m-0">
                    Nhận thông báo tuyển dụng
                  </h3>
                  <p className="text-[12.5px] text-blue-100 leading-relaxed m-0">
                    Cập nhật việc làm mới từ doanh nghiệp này.
                  </p>
                  <button
                    type="button"
                    disabled={followLoading}
                    onClick={handleFollowToggle}
                    className="w-full mt-2 py-1.5 px-3.5 rounded-xl bg-white text-[#1E40AF] hover:bg-blue-50 font-bold text-xs transition-colors shadow-xs cursor-pointer"
                  >
                    {isFollowing
                      ? "✓ Đang nhận thông báo"
                      : "Đăng ký theo dõi ngay"}
                  </button>
                </div>
              </div>

              {/* Card 3: Related Companies from Real Backend API */}
              {relatedCompanies.length > 0 && (
                <div className="bg-white rounded-2xl border border-[#CBD5E1] p-4.5 shadow-2xs">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#F1F5F9]">
                    <h3 className="text-[15px] font-semibold text-[#0F172A] m-0">
                      Công ty cùng ngành
                    </h3>
                    <Link
                      href="/cong-ty"
                      className="text-[12px] font-semibold text-[#2563EB] hover:underline"
                    >
                      Xem tất cả
                    </Link>
                  </div>

                  <div className="space-y-2">
                    {relatedCompanies.map((item) => {
                      const href = `/cong-ty/${item.slug || item.id}`;
                      return (
                        <Link
                          key={item.id}
                          href={href}
                          className="flex items-center justify-between p-2 rounded-xl bg-[#F8FAFC] hover:bg-[#EFF6FF]/70 border border-[#CBD5E1] hover:border-[#2563EB]/40 transition-all group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-white border border-[#CBD5E1] flex items-center justify-center font-extrabold text-xs text-[#2563EB] shrink-0 overflow-hidden p-0.5">
                              {item.logo ? (
                                <img
                                  src={item.logo}
                                  alt={item.name}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <span>
                                  {(item.name || "DN").slice(0, 2).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[12.5px] font-semibold text-[#0F172A] group-hover:text-[#2563EB] truncate m-0">
                                {item.name}
                              </p>
                              <p className="text-[11.5px] text-[#64748B] truncate m-0">
                                {item.industry || "Doanh nghiệp"}
                              </p>
                            </div>
                          </div>
                          <span className="px-1.5 py-0.5 rounded bg-white border border-[#CBD5E1] text-[10.5px] font-semibold text-[#2563EB] shrink-0 ml-2">
                            {item.openJobs ?? 0} việc
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}
