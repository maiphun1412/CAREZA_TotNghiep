"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Building2,
  Users,
  Briefcase,
  Star,
  CheckCircle2,
  Heart,
  Flame,
  Award,
  TrendingUp,
  Globe,
  Sparkles,
  Filter,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { message, Spin } from "antd";
import { apiClient } from "@/services/api-client";
import { interactionService } from "@/services/interaction.service";
import { useAuthStore } from "@/store/auth-store";

// ==========================================
// INTERFACES
// ==========================================
interface CompanyItem {
  id: string;
  companyId: number;
  slug: string;
  name: string;
  logo: string;
  buildingImage?: string;
  coverImage?: string;
  industry: string;
  size: string;
  location: string;
  rating?: number | null;
  reviewCount?: string | number | null;
  openJobs: number;
  description: string;
  isVerified: boolean;
  isFeatured: boolean;
  isTopHiring: boolean;
  slogan?: string;
  website?: string;
}

interface PaginationMeta {
  current_page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}

const CATEGORIES = [
  "Tất cả ngành nghề",
  "Công nghệ thông tin",
  "Tài chính - Ngân hàng",
  "Thương mại điện tử",
  "Viễn thông",
  "Logistics",
  "Sản xuất",
  "Giáo dục",
];

const COMPANY_SIZES = [
  "Quy mô công ty",
  "10-50 nhân viên",
  "50-200 nhân viên",
  "200-500 nhân viên",
  "500-1000 nhân viên",
  "1000+ nhân viên",
];

const LOCATIONS = [
  "Tất cả địa điểm",
  "Hà Nội",
  "TP. Hồ Chí Minh",
  "Đà Nẵng",
  "Toàn quốc",
];

const RATINGS = ["Tất cả đánh giá", "4.5+ sao", "4.0+ sao", "3.5+ sao"];

const POPULAR_TAGS = [
  "FPT Software",
  "Viettel",
  "VNG",
  "Ngân hàng",
  "Công nghệ thông tin",
  "Thương mại điện tử",
];

function mapApiCompanyItem(raw: any): CompanyItem {
  const numericId = Number(raw.id || raw.company_id || 0);
  const slugStr = raw.slug ? String(raw.slug) : String(raw.id || "");
  const reviewCountNum = Number(raw.reviewCount ?? 0);
  const ratingVal =
    typeof raw.rating === "number" && reviewCountNum > 0 ? raw.rating : null;
  return {
    id: slugStr || String(numericId),
    companyId: numericId,
    slug: slugStr,
    name: raw.name || "Doanh nghiệp",
    logo: raw.logo || raw.logo_url || "",
    buildingImage: raw.buildingImage || raw.coverImage || raw.banner_url || "",
    coverImage: raw.coverImage || raw.banner_url || raw.buildingImage || "",
    industry: raw.industry || "Đa ngành",
    size: raw.size || raw.company_size || "Đang cập nhật",
    location: raw.location || "Việt Nam",
    rating: ratingVal,
    reviewCount: reviewCountNum,
    openJobs: Number(raw.openJobs ?? raw.active_jobs_count ?? 0),
    description:
      raw.description || "Chưa có mô tả chi tiết cho doanh nghiệp này.",
    isVerified: Boolean(raw.isVerified ?? raw.is_verified),
    isFeatured: Boolean(raw.isFeatured),
    isTopHiring: Boolean(raw.isTopHiring) || Number(raw.openJobs ?? 0) > 0,
    slogan: raw.slogan || "",
    website: raw.website || "",
  };
}

export default function CompaniesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedKeyword, setSubmittedKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả ngành nghề");
  const [selectedSize, setSelectedSize] = useState("Quy mô công ty");
  const [selectedLocation, setSelectedLocation] = useState("Tất cả địa điểm");
  const [selectedRating, setSelectedRating] = useState("Tất cả đánh giá");
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Pagination & Data States
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [topHiringCompanies, setTopHiringCompanies] = useState<CompanyItem[]>(
    []
  );
  const [pagination, setPagination] = useState<PaginationMeta>({
    current_page: 1,
    page_size: 12,
    total_items: 0,
    total_pages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real Followed Companies State
  const [followedCompanyIds, setFollowedCompanyIds] = useState<number[]>([]);
  const [followedCompaniesList, setFollowedCompaniesList] = useState<
    CompanyItem[]
  >([]);
  const [followLoadingId, setFollowLoadingId] = useState<number | null>(null);

  // Fetch companies from real Backend API: GET /api/companies/
  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = {
        page: currentPage,
        page_size: pageSize,
      };

      const kw = submittedKeyword.trim();
      if (kw) {
        params.keyword = kw;
      }
      if (
        selectedCategory &&
        selectedCategory !== "Tất cả ngành nghề" &&
        selectedCategory !== "Tất cả ngành"
      ) {
        params.industry = selectedCategory;
      }
      if (
        selectedLocation &&
        selectedLocation !== "Tất cả địa điểm" &&
        selectedLocation !== "Toàn quốc"
      ) {
        params.location = selectedLocation;
      }
      if (
        selectedSize &&
        selectedSize !== "Quy mô công ty" &&
        selectedSize !== "Tất cả quy mô"
      ) {
        params.size = selectedSize.replace(" nhân viên", "").trim();
      }

      const response = await apiClient.get("/companies/", { params });
      const resData = response.data?.data;

      if (resData && Array.isArray(resData.items)) {
        const mapped = resData.items.map(mapApiCompanyItem);
        setCompanies(mapped);
        if (resData.pagination) {
          setPagination({
            current_page: Number(resData.pagination.current_page || currentPage),
            page_size: Number(resData.pagination.page_size || pageSize),
            total_items: Number(resData.pagination.total_items || mapped.length),
            total_pages: Math.max(
              1,
              Number(resData.pagination.total_pages || 1)
            ),
          });
        } else {
          setPagination({
            current_page: 1,
            page_size: pageSize,
            total_items: mapped.length,
            total_pages: 1,
          });
        }
      } else {
        setCompanies([]);
        setPagination({
          current_page: 1,
          page_size: pageSize,
          total_items: 0,
          total_pages: 1,
        });
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Không thể tải danh sách công ty từ máy chủ. Vui lòng thử lại.";
      setError(msg);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    pageSize,
    submittedKeyword,
    selectedCategory,
    selectedLocation,
    selectedSize,
  ]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // Fetch initial Top Hiring companies from real API (once)
  useEffect(() => {
    let mounted = true;
    apiClient
      .get("/companies/", { params: { page: 1, page_size: 24 } })
      .then((res) => {
        if (!mounted) return;
        const items = res.data?.data?.items;
        if (Array.isArray(items)) {
          const mapped = items
            .map(mapApiCompanyItem)
            .filter((c) => c.openJobs > 0)
            .sort((a, b) => b.openJobs - a.openJobs)
            .slice(0, 4);
          setTopHiringCompanies(mapped);
        }
      })
      .catch(() => {
        if (mounted) setTopHiringCompanies([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Load followed companies when user is authenticated
  const fetchFollowedCompanies = useCallback(async () => {
    if (!isAuthenticated) {
      setFollowedCompanyIds([]);
      setFollowedCompaniesList([]);
      return;
    }
    try {
      const data = await interactionService.getFollowedCompanies(1, 100);
      const list = data?.items || data?.companies || [];
      if (Array.isArray(list)) {
        const ids = list
          .map((item: any) => Number(item.company_id || item.company?.id || item.id))
          .filter((id: number) => !Number.isNaN(id) && id > 0);
        setFollowedCompanyIds(ids);

        const mappedFollowed: CompanyItem[] = list.map((item: any) =>
          mapApiCompanyItem({
            id: item.company_id || item.company?.id || item.id,
            slug: item.company?.slug || item.slug || String(item.company_id || item.id),
            name: item.name || item.company?.name,
            logo: item.logo_url || item.company?.logo_url,
            size: item.company_size || item.company?.company_size,
            openJobs: item.active_jobs_count ?? item.company?.active_jobs_count ?? 0,
            description: item.company?.description || "",
            website: item.company?.website || "",
            isVerified: true,
          })
        );
        setFollowedCompaniesList(mappedFollowed);
      }
    } catch {
      setFollowedCompanyIds([]);
      setFollowedCompaniesList([]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchFollowedCompanies();
  }, [fetchFollowedCompanies]);

  const toggleFollow = async (
    company: CompanyItem,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      message.info("Vui lòng đăng nhập để theo dõi công ty.");
      router.push("/dang-nhap?callbackUrl=/cong-ty");
      return;
    }

    if (!company.companyId) {
      message.warning("Không xác định được mã doanh nghiệp.");
      return;
    }

    const isCurrentlyFollowed = followedCompanyIds.includes(company.companyId);
    setFollowLoadingId(company.companyId);
    try {
      if (isCurrentlyFollowed) {
        await interactionService.unfollowCompany(company.companyId);
        setFollowedCompanyIds((prev) =>
          prev.filter((id) => id !== company.companyId)
        );
        setFollowedCompaniesList((prev) =>
          prev.filter((item) => item.companyId !== company.companyId)
        );
        message.info(`Đã bỏ theo dõi ${company.name}`);
      } else {
        await interactionService.followCompany(company.companyId);
        setFollowedCompanyIds((prev) => [...prev, company.companyId]);
        setFollowedCompaniesList((prev) => {
          if (prev.some((c) => c.companyId === company.companyId)) return prev;
          return [company, ...prev];
        });
        message.success(`Đã theo dõi ${company.name}`);
      }
    } catch (err: any) {
      message.error(
        err?.response?.data?.message ||
        "Không thể cập nhật trạng thái theo dõi. Vui lòng thử lại."
      );
    } finally {
      setFollowLoadingId(null);
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSubmittedKeyword("");
    setSelectedCategory("Tất cả ngành nghề");
    setSelectedSize("Quy mô công ty");
    setSelectedLocation("Tất cả địa điểm");
    setSelectedRating("Tất cả đánh giá");
    setActiveTab("all");
    setSortBy("relevance");
    setCurrentPage(1);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCurrentPage(1);
    setSubmittedKeyword(searchQuery.trim());
  };

  // Client-side refinement for Tabs, Rating, and Sort on current dataset
  const filteredCompanies = useMemo(() => {
    const sourceList =
      activeTab === "following"
        ? followedCompaniesList.map(
          (fc) =>
            companies.find((c) => c.companyId === fc.companyId) || fc
        )
        : companies;

    return sourceList
      .filter((company) => {
        const matchesRating =
          selectedRating === "Tất cả đánh giá" ||
          (selectedRating === "4.5+ sao" && (company.rating ?? 0) >= 4.5) ||
          (selectedRating === "4.0+ sao" && (company.rating ?? 0) >= 4.0) ||
          (selectedRating === "3.5+ sao" && (company.rating ?? 0) >= 3.5);

        const matchesTab =
          activeTab === "all" ||
          (activeTab === "featured" && company.isFeatured) ||
          (activeTab === "verified" && company.isVerified) ||
          (activeTab === "top_hiring" &&
            (company.isTopHiring || company.openJobs > 0)) ||
          (activeTab === "it" &&
            company.industry.toLowerCase().includes("công nghệ")) ||
          (activeTab === "finance" &&
            (company.industry.toLowerCase().includes("tài chính") ||
              company.industry.toLowerCase().includes("ngân hàng"))) ||
          (activeTab === "ecommerce" &&
            company.industry.toLowerCase().includes("thương mại")) ||
          (activeTab === "following" &&
            followedCompanyIds.includes(company.companyId));

        return matchesRating && matchesTab;
      })
      .sort((a, b) => {
        if (sortBy === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
        if (sortBy === "hiring") return b.openJobs - a.openJobs;
        return 0;
      });
  }, [
    companies,
    followedCompaniesList,
    selectedRating,
    activeTab,
    sortBy,
    followedCompanyIds,
  ]);

  const totalOpenJobsCount = useMemo(() => {
    return companies.reduce((sum, item) => sum + (item.openJobs || 0), 0);
  }, [companies]);

  const pageNumbers = useMemo(() => {
    const total = pagination.total_pages || 1;
    const current = pagination.current_page || 1;
    const pages: number[] = [];
    const start = Math.max(1, current - 2);
    const end = Math.min(total, start + 4);
    const adjustedStart = Math.max(1, end - 4);
    for (let i = adjustedStart; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [pagination.current_page, pagination.total_pages]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A] font-sans selection:bg-[#2563EB]/20 selection:text-[#2563EB]">
      {/* ==========================================
          1. HERO SECTION + SEARCH
          ========================================== */}
      <section className="relative pt-6 pb-4 sm:pt-8 sm:pb-5 overflow-hidden bg-gradient-to-b from-[#EFF6FF]/80 via-[#F8FAFC] to-[#F8FAFC] border-b border-[#E2E8F0]">
        {/* Background Decorative Mesh & Glow */}
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,#E2E8F0_1px,transparent_1px),linear-gradient(to_bottom,#E2E8F0_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_70%,transparent_110%)] opacity-45 pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -top-24 right-1/4 w-[480px] h-[480px] bg-blue-400/15 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute top-16 left-1/4 w-[380px] h-[380px] bg-indigo-400/10 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Top Split Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center mb-5 sm:mb-6">
            <div className="lg:col-span-7 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-blue-200/80 shadow-2xs mb-2.5">
                <span className="flex h-2 w-2 rounded-full bg-[#2563EB] animate-pulse" />
                <span className="text-xs font-semibold text-[#1E40AF] tracking-wide uppercase">
                  Hệ sinh thái Doanh nghiệp Hàng đầu
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-[#0F172A] tracking-tight leading-tight mb-2">
                Khám phá các{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#1D4ED8]">
                  công ty hàng đầu
                </span>
              </h1>


            </div>

            {/* Right Quick Stats Cards */}
            <div className="lg:col-span-5 grid grid-cols-3 gap-3 sm:gap-3.5">
              <div className="bg-white/95 backdrop-blur-md p-3 sm:p-3.5 rounded-xl border border-[#E2E8F0] shadow-2xs hover:shadow-xs hover:border-blue-200 transition-all">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center mb-2">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="text-lg sm:text-xl font-bold text-[#0F172A]">
                  {pagination.total_items > 0 ? pagination.total_items : "—"}
                </div>
                <div className="text-[11.5px] font-medium text-[#64748B] mt-0.5">
                  Đối tác doanh nghiệp
                </div>
              </div>

              <div className="bg-white/95 backdrop-blur-md p-3 sm:p-3.5 rounded-xl border border-[#E2E8F0] shadow-2xs hover:shadow-xs hover:border-emerald-200 transition-all">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#10B981] flex items-center justify-center mb-2">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div className="text-lg sm:text-xl font-bold text-[#0F172A]">
                  {totalOpenJobsCount > 0 ? `${totalOpenJobsCount}+` : "—"}
                </div>
                <div className="text-[11.5px] font-medium text-[#64748B] mt-0.5">
                  Việc làm đang mở
                </div>
              </div>

              <div className="bg-white/95 backdrop-blur-md p-3 sm:p-3.5 rounded-xl border border-[#E2E8F0] shadow-2xs hover:shadow-xs hover:border-amber-200 transition-all">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#F59E0B] flex items-center justify-center mb-2">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-lg sm:text-xl font-bold text-[#0F172A]">
                  100%
                </div>
                <div className="text-[11.5px] font-medium text-[#64748B] mt-0.5">
                  Thông tin minh bạch
                </div>
              </div>
            </div>
          </div>

          {/* Main Search & Filter Box */}
          <form
            onSubmit={handleSearchSubmit}
            className="bg-white p-3 sm:p-3.5 rounded-2xl shadow-xs border border-[#E2E8F0]"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Search Input */}
              <div className="md:col-span-5 relative flex items-center">
                <Search className="w-5 h-5 text-[#64748B] absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nhập tên công ty, lĩnh vực hoạt động..."
                  className="w-full pl-11 pr-9 py-3 bg-[#F8FAFC] hover:bg-[#F1F5F9]/70 focus:bg-white rounded-xl border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-3 focus:ring-[#2563EB]/15 outline-none text-sm text-[#0F172A] placeholder:text-[#94A3B8] transition-all font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSubmittedKeyword("");
                      setCurrentPage(1);
                    }}
                    className="absolute right-3 p-1 text-[#94A3B8] hover:text-[#475569] rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Industry Select */}
              <div className="md:col-span-3 relative flex items-center">
                <Briefcase className="w-4 h-4 text-[#64748B] absolute left-3.5 pointer-events-none" />
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  aria-label="Chọn ngành nghề"
                  className="w-full pl-10 pr-8 py-3 bg-[#F8FAFC] hover:bg-[#F1F5F9]/70 focus:bg-white rounded-xl border border-[#E2E8F0] focus:border-[#2563EB] outline-none text-sm text-[#0F172A] font-medium appearance-none cursor-pointer transition-all truncate"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3 pointer-events-none" />
              </div>

              {/* Location Select */}
              <div className="md:col-span-2 relative flex items-center">
                <MapPin className="w-4 h-4 text-[#64748B] absolute left-3.5 pointer-events-none" />
                <select
                  value={selectedLocation}
                  onChange={(e) => {
                    setSelectedLocation(e.target.value);
                    setCurrentPage(1);
                  }}
                  aria-label="Chọn địa điểm"
                  className="w-full pl-9 pr-7 py-3 bg-[#F8FAFC] hover:bg-[#F1F5F9]/70 focus:bg-white rounded-xl border border-[#E2E8F0] focus:border-[#2563EB] outline-none text-sm text-[#0F172A] font-medium appearance-none cursor-pointer transition-all truncate"
                >
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-2.5 pointer-events-none" />
              </div>

              {/* Search CTA Button */}
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full h-full min-h-[46px] bg-[#2563EB] hover:bg-[#1E40AF] active:scale-[0.99] text-white font-semibold rounded-xl shadow-sm hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Tìm kiếm</span>
                </button>
              </div>
            </div>

            {/* Secondary Filter Bar inside Search Card */}
            <div className="mt-3 pt-3 border-t border-[#F1F5F9] flex flex-wrap items-center justify-between gap-3">
              {/* Popular Search Tags */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-semibold text-[#64748B] mr-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                  Phổ biến:
                </span>
                {POPULAR_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setSearchQuery(tag);
                      setSubmittedKeyword(tag);
                      setCurrentPage(1);
                    }}
                    className="text-xs font-medium px-2.5 py-1 rounded-lg bg-[#F8FAFC] hover:bg-[#EFF6FF] text-[#475569] hover:text-[#2563EB] border border-[#E2E8F0] hover:border-blue-200 transition-colors cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Size & Rating Sub-filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative flex items-center">
                  <Users className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 pointer-events-none" />
                  <select
                    value={selectedSize}
                    onChange={(e) => {
                      setSelectedSize(e.target.value);
                      setCurrentPage(1);
                    }}
                    aria-label="Chọn quy mô công ty"
                    className="pl-8 pr-6 py-1.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#475569] outline-none appearance-none cursor-pointer"
                  >
                    {COMPANY_SIZES.map((sz) => (
                      <option key={sz} value={sz}>
                        {sz}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#64748B] absolute right-2 pointer-events-none" />
                </div>

                <div className="relative flex items-center">
                  <Star className="w-3.5 h-3.5 text-[#F59E0B] absolute left-2.5 pointer-events-none" />
                  <select
                    value={selectedRating}
                    onChange={(e) => setSelectedRating(e.target.value)}
                    aria-label="Chọn mức đánh giá"
                    className="pl-8 pr-6 py-1.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#475569] outline-none appearance-none cursor-pointer"
                  >
                    {RATINGS.map((rt) => (
                      <option key={rt} value={rt}>
                        {rt}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#64748B] absolute right-2 pointer-events-none" />
                </div>

                {(searchQuery ||
                  submittedKeyword ||
                  selectedCategory !== "Tất cả ngành nghề" ||
                  selectedLocation !== "Tất cả địa điểm" ||
                  selectedSize !== "Quy mô công ty" ||
                  selectedRating !== "Tất cả đánh giá" ||
                  activeTab !== "all") && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      Xóa lọc
                    </button>
                  )}
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* ==========================================
          2. QUICK FILTER TABS & TOOLBAR
          ========================================== */}
      <section className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-1 sm:pb-2">
        {/* Category Quick Pills - Tinh gọn, ẩn thanh cuộn thô trên Windows */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 border-b border-[#E2E8F0] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {[
            { id: "all", label: "Tất cả công ty", icon: Building2 },
            { id: "featured", label: "Công ty nổi bật", icon: Award },
            { id: "top_hiring", label: "Đang tuyển nhiều", icon: Flame },
            { id: "verified", label: "Đã xác thực", icon: CheckCircle2 },
            { id: "it", label: "Công nghệ thông tin", icon: Zap },
            { id: "finance", label: "Tài chính - Ngân hàng", icon: TrendingUp },
            { id: "ecommerce", label: "Thương mại điện tử", icon: Globe },
            {
              id: "following",
              label: `Đang theo dõi (${followedCompanyIds.length})`,
              icon: Heart,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-[13px] font-semibold whitespace-nowrap transition-all cursor-pointer ${isActive
                    ? "bg-[#2563EB] text-white shadow-2xs shadow-blue-500/20"
                    : "bg-white text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] border border-[#E2E8F0]"
                  }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${isActive
                      ? "text-white"
                      : tab.id === "top_hiring"
                        ? "text-orange-500"
                        : tab.id === "verified"
                          ? "text-emerald-500"
                          : tab.id === "following"
                            ? "text-rose-500"
                            : "text-[#64748B]"
                    }`}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Results Count & Sort Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3.5 sm:pt-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-[#0F172A] m-0">
              Danh sách doanh nghiệp
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {activeTab === "all" && selectedRating === "Tất cả đánh giá"
                ? pagination.total_items
                : filteredCompanies.length}{" "}
              kết quả
            </span>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            {/* Sort Select */}
            <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#64748B] hidden sm:block" />
              <span className="hidden sm:inline font-medium">Sắp xếp:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sắp xếp danh sách công ty"
                  className="pl-2.5 pr-7 py-1.5 bg-white rounded-xl border border-[#E2E8F0] focus:border-[#2563EB] text-xs font-medium text-[#0F172A] outline-none appearance-none cursor-pointer shadow-2xs"
                >
                  <option value="relevance">Phù hợp nhất</option>
                  <option value="hiring">Đang tuyển nhiều nhất</option>
                  <option value="rating">Đánh giá cao nhất</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#64748B] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Grid / List View Switcher */}
            <div className="hidden sm:flex items-center bg-white p-0.5 rounded-xl border border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                title="Chế độ lưới"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === "grid"
                    ? "bg-[#EFF6FF] text-[#2563EB]"
                    : "text-[#64748B] hover:text-[#0F172A]"
                  }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                title="Chế độ danh sách"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === "list"
                    ? "bg-[#EFF6FF] text-[#2563EB]"
                    : "text-[#64748B] hover:text-[#0F172A]"
                  }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          3. COMPANY DIRECTORY GRID / LIST
          ========================================== */}
      <section className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-6 flex-1">
        {loading ? (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-16 text-center shadow-xs my-4 flex flex-col items-center justify-center gap-3">
            <Spin size="large" />
            <p className="text-sm font-medium text-[#64748B] mt-2">
              Đang tải danh sách doanh nghiệp...
            </p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-rose-200 p-12 text-center shadow-xs my-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#0F172A] mb-2">
              Không thể tải danh sách công ty
            </h3>
            <p className="text-sm text-[#64748B] max-w-md mx-auto mb-6">
              {error}
            </p>
            <button
              type="button"
              onClick={fetchCompanies}
              className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1E40AF] text-white text-sm font-semibold rounded-xl shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Thử lại
            </button>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center shadow-xs my-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#0F172A] mb-2">
              {activeTab === "following" && !isAuthenticated
                ? "Bạn chưa đăng nhập"
                : "Không tìm thấy doanh nghiệp phù hợp"}
            </h3>
            <p className="text-sm text-[#64748B] max-w-md mx-auto mb-6">
              {activeTab === "following" && !isAuthenticated
                ? "Vui lòng đăng nhập tài khoản ứng viên để xem và quản lý danh sách các công ty đang theo dõi."
                : "Thử thay đổi từ khóa tìm kiếm hoặc xóa bớt các bộ lọc ngành nghề, địa điểm để xem thêm nhiều công ty khác."}
            </p>
            {activeTab === "following" && !isAuthenticated ? (
              <Link
                href="/dang-nhap?callbackUrl=/cong-ty"
                className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1E40AF] text-white text-sm font-semibold rounded-xl shadow-xs transition-all inline-flex items-center gap-2"
              >
                Đăng nhập ngay
              </Link>
            ) : (
              <button
                type="button"
                onClick={resetFilters}
                className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1E40AF] text-white text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Xóa bộ lọc tìm kiếm
              </button>
            )}
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "flex flex-col gap-4"
            }
          >
            {filteredCompanies.map((company) => {
              const isFollowed = followedCompanyIds.includes(company.companyId);
              const isFollowBusy = followLoadingId === company.companyId;
              const detailHref = `/cong-ty/${company.slug || company.companyId || company.id}`;

              if (viewMode === "list") {
                return (
                  <div
                    key={company.companyId || company.id}
                    className="group bg-white rounded-2xl border border-[#E2E8F0] hover:border-[#2563EB]/60 p-5 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
                  >
                    <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                      <Link
                        href={detailHref}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border border-[#E2E8F0] p-2 flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-105 transition-transform"
                      >
                        {company.logo ? (
                          <img
                            src={company.logo}
                            alt={company.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Building2 className="w-8 h-8 text-[#94A3B8]" />
                        )}
                      </Link>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <Link
                            href={detailHref}
                            className="text-base sm:text-lg font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors truncate"
                          >
                            {company.name}
                          </Link>
                          {company.isVerified && (
                            <span
                              title="Doanh nghiệp đã xác thực"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Đã xác thực
                            </span>
                          )}
                          {company.isTopHiring && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                              <Flame className="w-3 h-3 text-orange-500" />
                              Tuyển gấp
                            </span>
                          )}
                        </div>

                        <p className="text-xs sm:text-sm text-[#475569] line-clamp-1 mb-2.5">
                          {company.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B]">
                          <span className="inline-flex items-center gap-1 font-medium text-[#334155]">
                            <Briefcase className="w-3.5 h-3.5 text-[#2563EB]" />
                            {company.industry}
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#64748B]" />
                            {company.location}
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-[#64748B]" />
                            {company.size}
                          </span>
                          <span>•</span>
                          {company.rating !== null &&
                            company.rating !== undefined &&
                            Number(company.reviewCount) > 0 ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              {company.rating.toFixed(1)} ({company.reviewCount} đánh giá)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[#94A3B8]">
                              <Star className="w-3.5 h-3.5 text-[#CBD5E1]" />
                              Chưa có đánh giá
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#F1F5F9]">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EFF6FF] text-[#2563EB] border border-blue-200">
                        {company.openJobs} việc làm đang mở
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={isFollowBusy}
                          onClick={(e) => toggleFollow(company, e)}
                          aria-label="Theo dõi công ty"
                          className={`p-2 rounded-xl border transition-all cursor-pointer ${isFollowed
                              ? "bg-rose-50 border-rose-200 text-rose-600"
                              : "bg-white border-[#E2E8F0] text-[#64748B] hover:text-rose-600 hover:border-rose-200"
                            }`}
                        >
                          <Heart
                            className={`w-4 h-4 ${isFollowed ? "fill-rose-500 text-rose-500" : ""
                              }`}
                          />
                        </button>
                        <Link
                          href={detailHref}
                          className="px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-[#2563EB] text-white text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
                        >
                          <span>Xem công ty</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              }

              // GRID CARD VIEW
              return (
                <div
                  key={company.companyId || company.id}
                  className="group bg-white rounded-2xl border border-[#E2E8F0] hover:border-[#2563EB]/60 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden h-full"
                >
                  {/* Top Cover Banner */}
                  <div className="relative h-28 w-full overflow-hidden bg-slate-900">
                    {company.buildingImage ? (
                      <img
                        src={company.buildingImage}
                        alt={company.name}
                        className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#3B82F6]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 via-[#0F172A]/25 to-transparent" />

                    {/* Top Left Status Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                      {company.isFeatured && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-400/95 text-slate-950 shadow-xs backdrop-blur-xs">
                          <Award className="w-3 h-3" />
                          Nổi bật
                        </span>
                      )}
                      {company.isTopHiring && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-500/95 text-white shadow-xs backdrop-blur-xs">
                          <Flame className="w-3 h-3" />
                          Đang tuyển mạnh
                        </span>
                      )}
                    </div>

                    {/* Top Right Follow Button */}
                    <button
                      type="button"
                      disabled={isFollowBusy}
                      onClick={(e) => toggleFollow(company, e)}
                      title={isFollowed ? "Bỏ theo dõi" : "Theo dõi công ty"}
                      className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all cursor-pointer ${isFollowed
                          ? "bg-rose-500 text-white shadow-sm"
                          : "bg-white/85 hover:bg-white text-[#475569] hover:text-rose-600"
                        }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${isFollowed ? "fill-current" : ""
                          }`}
                      />
                    </button>

                    {/* Rating Pill on Bottom Right of Cover */}
                    {company.rating !== null &&
                      company.rating !== undefined &&
                      Number(company.reviewCount) > 0 ? (
                      <div className="absolute bottom-2.5 right-3 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold border border-white/15">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{company.rating.toFixed(1)}</span>
                        <span className="text-slate-300 text-[11px]">
                          ({company.reviewCount})
                        </span>
                      </div>
                    ) : (
                      <div className="absolute bottom-2.5 right-3 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900/75 backdrop-blur-md text-slate-200 text-[11px] font-medium border border-white/15">
                        <Star className="w-3 h-3 text-slate-400" />
                        <span>Chưa có đánh giá</span>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-5 pt-0 flex-1 flex flex-col">
                    {/* Overlapping Logo + Open Jobs Pill */}
                    <div className="flex items-end justify-between -mt-8 mb-3.5 relative z-10">
                      <Link
                        href={detailHref}
                        className="w-16 h-16 rounded-2xl bg-white border-2 border-white shadow-md p-2 flex items-center justify-center overflow-hidden ring-1 ring-[#E2E8F0] group-hover:ring-[#2563EB]/40 transition-all"
                      >
                        {company.logo ? (
                          <img
                            src={company.logo}
                            alt={company.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Building2 className="w-7 h-7 text-[#94A3B8]" />
                        )}
                      </Link>

                      <Link
                        href={detailHref}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EFF6FF] text-[#2563EB] border border-blue-200/80 hover:bg-[#2563EB] hover:text-white transition-colors"
                      >
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>{company.openJobs} việc làm</span>
                      </Link>
                    </div>

                    {/* Company Name + Verified Badge */}
                    <div className="mb-1.5">
                      <Link
                        href={detailHref}
                        className="inline-flex items-center gap-1.5 group/title max-w-full"
                      >
                        <h3 className="text-base sm:text-lg font-bold text-[#0F172A] group-hover/title:text-[#2563EB] transition-colors line-clamp-1">
                          {company.name}
                        </h3>
                        {company.isVerified && (
                          <CheckCircle2
                            className="w-4 h-4 text-[#10B981] shrink-0"
                            aria-label="Đã xác thực"
                          />
                        )}
                      </Link>
                      <div className="text-xs font-semibold text-[#2563EB] mt-0.5">
                        {company.industry}
                      </div>
                    </div>

                    {/* Short Description */}
                    <p className="text-xs text-[#475569] line-clamp-2 leading-relaxed my-2 min-h-[36px]">
                      {company.description}
                    </p>

                    {/* Meta Info Pills (Location & Size) */}
                    <div className="grid grid-cols-2 gap-2 py-3 border-y border-[#F1F5F9] text-xs text-[#64748B] my-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                        <span className="truncate font-medium text-[#334155]">
                          {company.location}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <Users className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                        <span className="truncate">{company.size}</span>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="pt-3 mt-auto flex items-center justify-between gap-2">
                      <button
                        type="button"
                        disabled={isFollowBusy}
                        onClick={(e) => toggleFollow(company, e)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${isFollowed
                            ? "bg-rose-50 text-rose-600 border-rose-200"
                            : "bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]"
                          }`}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${isFollowed ? "fill-rose-500 text-rose-500" : ""
                            }`}
                        />
                        <span>{isFollowed ? "Đang theo dõi" : "Theo dõi"}</span>
                      </button>

                      <Link
                        href={detailHref}
                        className="flex-1 py-2 px-4 rounded-xl bg-[#EFF6FF] group-hover:bg-[#2563EB] text-[#2563EB] group-hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>Xem chi tiết</span>
                        <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ==========================================
            4. PAGINATION
            ========================================== */}
        {!loading &&
          !error &&
          activeTab !== "following" &&
          pagination.total_pages > 1 && (
            <div className="mt-10 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-2xs">
              <p className="text-xs sm:text-sm text-[#64748B]">
                Hiển thị trang{" "}
                <span className="font-bold text-[#0F172A]">
                  {pagination.current_page}
                </span>{" "}
                /{" "}
                <span className="font-bold text-[#0F172A]">
                  {pagination.total_pages}
                </span>{" "}
                (Tổng{" "}
                <span className="font-bold text-[#2563EB]">
                  {pagination.total_items}
                </span>{" "}
                doanh nghiệp)
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((p) => Math.max(1, p - 1))
                  }
                  disabled={pagination.current_page <= 1}
                  aria-label="Trang trước"
                  className="w-9 h-9 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] disabled:opacity-40 flex items-center justify-center text-[#475569] transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {pageNumbers.map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${pagination.current_page === page
                        ? "bg-[#2563EB] text-white shadow-xs shadow-blue-500/25"
                        : "bg-white hover:bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]"
                      }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.min(pagination.total_pages, p + 1)
                    )
                  }
                  disabled={pagination.current_page >= pagination.total_pages}
                  aria-label="Trang tiếp"
                  className="w-9 h-9 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] disabled:opacity-40 flex items-center justify-center text-[#475569] transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
      </section>

      {/* ==========================================
          5. TOP HIRING COMPANIES HIGHLIGHT SECTION
          ========================================== */}
      {topHiringCompanies.length > 0 && (
        <section className="bg-white border-t border-[#E2E8F0] py-8 sm:py-10 mt-6">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 uppercase tracking-wider mb-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  <span>Tâm điểm tuyển dụng</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] m-0">
                  Doanh nghiệp đang tuyển dụng tích cực
                </h2>
              </div>
              <Link
                href="/viec-lam"
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#2563EB] hover:text-[#1E40AF] group"
              >
                <span>Xem tất cả cơ hội việc làm</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {topHiringCompanies.map((item) => {
                const detailHref = `/cong-ty/${item.slug || item.companyId || item.id}`;
                return (
                  <Link
                    key={item.companyId || item.id}
                    href={detailHref}
                    className="group p-4 sm:p-4.5 rounded-2xl bg-[#F8FAFC] hover:bg-white border border-[#E2E8F0] hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between min-h-[180px]"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-white border border-[#E2E8F0] p-2 flex items-center justify-center shadow-2xs">
                          {item.logo ? (
                            <img
                              src={item.logo}
                              alt={item.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Building2 className="w-6 h-6 text-[#94A3B8]" />
                          )}
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-200 flex items-center gap-1">
                          <Flame className="w-3 h-3 text-orange-500" />
                          {item.openJobs} vị trí
                        </span>
                      </div>

                      <h3 className="font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors line-clamp-1 mb-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-[#64748B] mb-3">
                        {item.industry}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#E2E8F0]/80 flex items-center justify-between text-xs">
                      <span className="text-[#475569] font-medium truncate max-w-[140px]">
                        {item.location}
                      </span>
                      <span className="font-bold text-[#2563EB] inline-flex items-center gap-1">
                        Ứng tuyển
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
