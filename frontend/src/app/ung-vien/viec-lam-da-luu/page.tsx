"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Button,
  Input,
  Select,
  Pagination,
  Spin,
  Empty,
  Dropdown,
  message,
  Popconfirm,
  Tooltip,
} from "antd";
import {
  HeartFilled,
  HeartOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  UndoOutlined,
  ExportOutlined,
  CheckCircleFilled,
  MoreOutlined,
  ShareAltOutlined,
  CopyOutlined,
  CompassOutlined,
  BarChartOutlined,
  EyeOutlined,
  BellOutlined,
  ThunderboltOutlined,
  AppstoreOutlined,
  ApartmentOutlined,
  SafetyCertificateOutlined,
  SendOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";

import { candidateService } from "@/services/candidate.service";
import { apiClient } from "@/services/api-client";
import { useAuthStore } from "@/store/auth-store";

// Interface việc làm đã lưu
interface BookmarkedJobItem {
  id: string;
  savedAt: string;
  job: {
    id: string;
    title: string | null;
    slug?: string | null;
    description?: string | null;
    experienceMin?: number | null;
    skills?: string[];
    status: number | string | null;
    salaryMin: number | null;
    salaryMax: number | null;
    negotiableSalary: boolean;
    employmentType: number | string | null;
    workMode: number | string | null;
    locationText: string | null;
    expiredAt: string | null;
    isAvailable: boolean;
    isExpired: boolean;
    isClosed: boolean;
    isDeleted: boolean;
  };
  company: {
    id: string | null;
    name: string | null;
    logoUrl: string | null;
    slug: string | null;
    isVerified?: boolean;
  };
}

// Interface việc làm liên quan
interface RelatedJobItem {
  id: string;
  title: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  companyName: string;
  companyLogo?: string | null;
  location?: string | null;
}

export default function SavedJobsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  // State dữ liệu chính
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<BookmarkedJobItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // State việc làm liên quan & thống kê phụ
  const [relatedJobs, setRelatedJobs] = useState<RelatedJobItem[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [recentViewCount, setRecentViewCount] = useState<number>(12);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());

  // Tabs chức năng: "saved" | "compare" | "history" | "suggested"
  const [activeTab, setActiveTab] = useState<"saved" | "compare" | "history" | "suggested">("saved");

  // State bộ lọc (Cột trái)
  const [filterKeyword, setFilterKeyword] = useState<string>("");
  const [filterIndustry, setFilterIndustry] = useState<string>("ALL");
  const [filterLocation, setFilterLocation] = useState<string>("ALL");
  const [filterSalary, setFilterSalary] = useState<string>("ALL");
  const [filterWorkMode, setFilterWorkMode] = useState<string>("ALL");
  const [filterTime, setFilterTime] = useState<string>("ALL");

  // State sắp xếp
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "salary_high" | "expiring_soon">("newest");

  // 1. Tải danh sách công việc đã lưu từ Backend thật
  const fetchSavedJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await candidateService.getBookmarkedJobs({
        page: 1,
        pageSize: 100, // Tải đủ danh sách để lọc mượt mà
      });
      if (res && res.data) {
        const items = res.data.items || [];
        setJobs(items);
        setTotal(items.length);
        setSavedJobIds(new Set(items.map((it: BookmarkedJobItem) => it.job.id)));
      }
    } catch (err: any) {
      console.error("Lỗi khi tải việc làm đã lưu:", err);
      // Nếu chưa đăng nhập, hướng dẫn nhẹ nhàng
      if (!isAuthenticated) {
        message.info("Vui lòng đăng nhập để xem đầy đủ danh sách việc làm đã lưu.");
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // 2. Tải danh sách công việc gợi ý liên quan từ API /jobs/
  const fetchRelatedJobs = useCallback(async () => {
    setLoadingRelated(true);
    try {
      const res = await apiClient.get<{
        success: boolean;
        data: {
          items: any[];
        };
      }>("/jobs/", {
        params: { page: 1, page_size: 4 },
      });
      if (res.data?.data?.items) {
        const mapped: RelatedJobItem[] = res.data.data.items.slice(0, 4).map((j: any) => ({
          id: String(j.id),
          title: j.title || "Vị trí tuyển dụng",
          salaryMin: j.salary_min,
          salaryMax: j.salary_max,
          companyName: j.company?.name || "Doanh nghiệp CAREZA",
          companyLogo: j.company?.logo_url || null,
          location: j.location || "TP. Hồ Chí Minh",
        }));
        setRelatedJobs(mapped);
      }
    } catch (error) {
      console.error("Không thể tải việc làm liên quan:", error);
    } finally {
      setLoadingRelated(false);
    }
  }, []);

  useEffect(() => {
    fetchSavedJobs();
    fetchRelatedJobs();
  }, [fetchSavedJobs, fetchRelatedJobs]);

  // 3. Xử lý Bỏ lưu công việc
  const handleUnsaveJob = async (jobId: string, title?: string | null) => {
    setActionLoadingId(jobId);
    try {
      await candidateService.removeJobBookmark(jobId);
      message.success(`Đã bỏ lưu việc làm "${title || "này"}"`);
      setJobs((prev) => prev.filter((item) => item.job.id !== jobId));
      setSavedJobIds((prev) => {
        const next = new Set(prev);
        next.delete(jobId);
        return next;
      });
      setTotal((prev) => Math.max(0, prev - 1));
    } catch (error: any) {
      message.error("Bỏ lưu thất bại. Vui lòng thử lại!");
    } finally {
      setActionLoadingId(null);
    }
  };

  // 4. Xử lý Lưu / Bỏ lưu việc gợi ý
  const handleToggleBookmarkRelated = async (jobId: string, jobTitle: string) => {
    if (!isAuthenticated) {
      message.info("Vui lòng đăng nhập để lưu việc làm");
      router.push("/dang-nhap");
      return;
    }

    const isCurrentlySaved = savedJobIds.has(jobId);
    try {
      if (isCurrentlySaved) {
        await candidateService.removeJobBookmark(jobId);
        message.success("Đã bỏ lưu việc làm");
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
      } else {
        await candidateService.saveJobBookmark(jobId);
        message.success(`Đã lưu "${jobTitle}" vào danh sách yêu thích`);
        setSavedJobIds((prev) => new Set(prev).add(jobId));
        fetchSavedJobs();
      }
    } catch (error) {
      message.error("Thao tác lưu việc làm thất bại");
    }
  };

  // 5. Reset bộ lọc
  const handleResetFilters = () => {
    setFilterKeyword("");
    setFilterIndustry("ALL");
    setFilterLocation("ALL");
    setFilterSalary("ALL");
    setFilterWorkMode("ALL");
    setFilterTime("ALL");
    setPage(1);
    message.info("Đã đặt lại bộ lọc");
  };

  // 6. Format tiền lương
  const formatSalaryText = (min?: number | null, max?: number | null, negotiable?: boolean) => {
    if (negotiable || (!min && !max)) return "Thương lượng";
    if (min && max) {
      const minMil = Math.round(min / 1000000);
      const maxMil = Math.round(max / 1000000);
      return `${minMil} – ${maxMil} triệu`;
    }
    if (min) return `Từ ${Math.round(min / 1000000)} triệu`;
    if (max) return `Tới ${Math.round(max / 1000000)} triệu`;
    return "Thỏa thuận";
  };

  // 7. Format hình thức làm việc
  const formatWorkModeText = (mode: any) => {
    if (mode === "hybrid" || mode === 2) return "Kết hợp";
    if (mode === "remote" || mode === 3) return "Từ xa";
    if (mode === "onsite" || mode === 1) return "Toàn thời gian";
    if (typeof mode === "string" && mode.trim()) return mode;
    return "Toàn thời gian";
  };

  // 8. Trích xuất danh sách ngành nghề thực tế từ data
  const industriesList = useMemo(() => {
    return [
      { label: "Tất cả ngành nghề", value: "ALL" },
      { label: "Công nghệ thông tin", value: "IT" },
      { label: "Thiết kế / Sáng tạo", value: "DESIGN" },
      { label: "Marketing / Truyền thông", value: "MARKETING" },
      { label: "Kinh doanh / Bán hàng", value: "SALES" },
      { label: "Tài chính / Kế toán", value: "FINANCE" },
    ];
  }, []);

  // 9. Lọc và Sắp xếp danh sách
  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    // Lọc từ khóa
    if (filterKeyword.trim()) {
      const q = filterKeyword.toLowerCase().trim();
      result = result.filter(
        (it) =>
          it.job.title?.toLowerCase().includes(q) ||
          it.company.name?.toLowerCase().includes(q) ||
          it.job.locationText?.toLowerCase().includes(q)
      );
    }

    // Lọc địa điểm
    if (filterLocation !== "ALL") {
      result = result.filter((it) =>
        it.job.locationText?.toLowerCase().includes(filterLocation.toLowerCase())
      );
    }

    // Lọc mức lương
    if (filterSalary !== "ALL") {
      result = result.filter((it) => {
        const max = it.job.salaryMax ? it.job.salaryMax / 1000000 : 0;
        const min = it.job.salaryMin ? it.job.salaryMin / 1000000 : 0;

        if (filterSalary === "UNDER_10") return max > 0 && max <= 10;
        if (filterSalary === "10_20") return (min >= 10 && min <= 20) || (max >= 10 && max <= 20);
        if (filterSalary === "20_30") return (min >= 20 && min <= 30) || (max >= 20 && max <= 30);
        if (filterSalary === "OVER_30") return max >= 30 || min >= 30;
        if (filterSalary === "NEGOTIABLE") return it.job.negotiableSalary;
        return true;
      });
    }

    // Lọc hình thức
    if (filterWorkMode !== "ALL") {
      result = result.filter((it) => {
        const mode = String(it.job.workMode || "").toLowerCase();
        if (filterWorkMode === "remote") return mode.includes("remote") || mode.includes("xa");
        if (filterWorkMode === "hybrid") return mode.includes("hybrid") || mode.includes("kết hợp");
        if (filterWorkMode === "onsite") return mode.includes("onsite") || mode.includes("toàn thời gian");
        return true;
      });
    }

    // Lọc thời gian lưu
    if (filterTime !== "ALL") {
      const now = new Date().getTime();
      result = result.filter((it) => {
        if (!it.savedAt) return true;
        const savedTime = new Date(it.savedAt).getTime();
        const diffDays = (now - savedTime) / (1000 * 3600 * 24);
        if (filterTime === "7_DAYS") return diffDays <= 7;
        if (filterTime === "30_DAYS") return diffDays <= 30;
        return true;
      });
    }

    // Sắp xếp
    result.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.savedAt || 0).getTime() - new Date(a.savedAt || 0).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.savedAt || 0).getTime() - new Date(b.savedAt || 0).getTime();
      }
      if (sortBy === "salary_high") {
        const salaryA = a.job.salaryMax || a.job.salaryMin || 0;
        const salaryB = b.job.salaryMax || b.job.salaryMin || 0;
        return salaryB - salaryA;
      }
      if (sortBy === "expiring_soon") {
        const expA = a.job.expiredAt ? new Date(a.job.expiredAt).getTime() : Infinity;
        const expB = b.job.expiredAt ? new Date(b.job.expiredAt).getTime() : Infinity;
        return expA - expB;
      }
      return 0;
    });

    return result;
  }, [jobs, filterKeyword, filterLocation, filterSalary, filterWorkMode, filterTime, sortBy]);

  // Phân trang
  const paginatedJobs = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredJobs.slice(start, start + pageSize);
  }, [filteredJobs, page, pageSize]);

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 pb-0 pt-0 text-slate-800">
      {/* ======================================================== */}
      {/* 1. BREADCRUMB NGOÀI BANNER                                 */}
      {/* ======================================================== */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-3">
        <Link href="/" className="text-slate-600 hover:text-[#0062ff] transition-colors">
          Trang chủ
        </Link>
        <span className="text-slate-400">/</span>
        <span className="text-slate-900 font-bold">Công việc yêu thích</span>
      </div>

      {/* ======================================================== */}
      {/* 2. BANNER TIÊU ĐỀ NỀN TYM.PNG (CAO 90–105px)              */}
      {/* ======================================================== */}
      <div
        className="relative overflow-hidden rounded-2xl md:rounded-3xl px-5 sm:px-7 text-white shadow-md shadow-blue-500/15 h-[96px] md:h-[98px] flex items-center justify-between mb-3.5"
        style={{
          backgroundImage: "url('/images/tym.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Lớp overlay nhẹ đảm bảo độ tương phản cao, chữ luôn dễ đọc */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#003c96]/80 via-[#0052cc]/50 to-transparent pointer-events-none" />

        {/* Nội dung bên trái banner - nhích lên khoảng 8-10px */}
        <div className="relative z-10 space-y-0.5 max-w-2xl -top-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-[23px] sm:text-[24px] font-bold text-white tracking-tight m-0 leading-tight drop-shadow-sm">
              Công việc yêu thích
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white border border-white/25 shadow-xs">
              {filteredJobs.length} công việc
            </span>
          </div>
          <p className="text-blue-50 text-xs sm:text-[13px] m-0 font-normal leading-relaxed drop-shadow-xs">
            Lưu lại những vị trí quan tâm để theo dõi, so sánh và ứng tuyển nhanh hơn.
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. BỐ CỤC 3 CỘT DESKTOP (20% - 58% - 22%)                */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ====================================================== */}
        {/* CỘT TRÁI (20% ~ lg:col-span-3 xl:col-span-3) - BỘ LỌC   */}
        {/* ====================================================== */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
            {/* Header bộ lọc */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <FilterOutlined className="text-[#0062ff]" />
                <span>Bộ lọc tìm kiếm</span>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-slate-500 hover:text-[#0062ff] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <UndoOutlined className="text-[11px]" />
                <span>Đặt lại</span>
              </button>
            </div>

            {/* Tiêu chí 1: Từ khóa */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Từ khóa</label>
              <Input
                placeholder="Nhập tên công việc, công ty..."
                prefix={<SearchOutlined className="text-slate-400 text-xs" />}
                value={filterKeyword}
                onChange={(e) => {
                  setFilterKeyword(e.target.value);
                  setPage(1);
                }}
                allowClear
                className="rounded-xl text-xs h-9"
              />
            </div>

            {/* Tiêu chí 2: Ngành nghề */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Ngành nghề</label>
              <Select
                value={filterIndustry}
                onChange={(val) => {
                  setFilterIndustry(val);
                  setPage(1);
                }}
                options={industriesList}
                className="w-full text-xs"
                popupClassName="text-xs"
              />
            </div>

            {/* Tiêu chí 3: Địa điểm làm việc */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Địa điểm làm việc</label>
              <Select
                value={filterLocation}
                onChange={(val) => {
                  setFilterLocation(val);
                  setPage(1);
                }}
                className="w-full text-xs"
                options={[
                  { label: "Tất cả địa điểm", value: "ALL" },
                  { label: "TP. Hồ Chí Minh", value: "Hồ Chí Minh" },
                  { label: "Hà Nội", value: "Hà Nội" },
                  { label: "Đà Nẵng", value: "Đà Nẵng" },
                  { label: "Toàn quốc / Từ xa", value: "Toàn quốc" },
                ]}
              />
            </div>

            {/* Tiêu chí 4: Mức lương */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Mức lương</label>
              <Select
                value={filterSalary}
                onChange={(val) => {
                  setFilterSalary(val);
                  setPage(1);
                }}
                className="w-full text-xs"
                options={[
                  { label: "Tất cả mức lương", value: "ALL" },
                  { label: "Dưới 10 triệu", value: "UNDER_10" },
                  { label: "10 – 20 triệu", value: "10_20" },
                  { label: "20 – 30 triệu", value: "20_30" },
                  { label: "Trên 30 triệu", value: "OVER_30" },
                  { label: "Thỏa thuận", value: "NEGOTIABLE" },
                ]}
              />
            </div>

            {/* Tiêu chí 5: Hình thức làm việc */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Hình thức làm việc</label>
              <Select
                value={filterWorkMode}
                onChange={(val) => {
                  setFilterWorkMode(val);
                  setPage(1);
                }}
                className="w-full text-xs"
                options={[
                  { label: "Tất cả hình thức", value: "ALL" },
                  { label: "Toàn thời gian (Onsite)", value: "onsite" },
                  { label: "Linh hoạt (Hybrid)", value: "hybrid" },
                  { label: "Làm từ xa (Remote)", value: "remote" },
                ]}
              />
            </div>

            {/* Tiêu chí 6: Thời gian lưu */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Thời gian lưu</label>
              <Select
                value={filterTime}
                onChange={(val) => {
                  setFilterTime(val);
                  setPage(1);
                }}
                className="w-full text-xs"
                options={[
                  { label: "Tất cả thời gian", value: "ALL" },
                  { label: "7 ngày qua", value: "7_DAYS" },
                  { label: "30 ngày qua", value: "30_DAYS" },
                ]}
              />
            </div>

            {/* Nút hành động */}
            <div className="pt-2 space-y-2">
              <Button
                type="primary"
                icon={<FilterOutlined />}
                onClick={() => setPage(1)}
                className="w-full bg-[#0062ff] hover:bg-[#0052d9] font-bold text-xs h-10 rounded-xl shadow-xs"
              >
                Áp dụng bộ lọc
              </Button>
              <Button
                onClick={handleResetFilters}
                className="w-full text-slate-600 hover:text-slate-900 font-semibold text-xs h-9 rounded-xl border border-slate-200"
              >
                Xóa bộ lọc
              </Button>
            </div>
          </div>
        </div>

        {/* ====================================================== */}
        {/* CỘT GIỮA (58% ~ lg:col-span-6 xl:col-span-6) - DANH SÁCH*/}
        {/* ====================================================== */}
        <div className="lg:col-span-6 space-y-4">
          {/* Thanh Tab Chức năng & Sắp xếp (1 hàng trên desktop, không rớt dòng) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-2 sm:p-2.5 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
            {/* Nhóm Tabs bên trái */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("saved")}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${activeTab === "saved"
                    ? "bg-[#0062ff] text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
              >
                <HeartFilled className={activeTab === "saved" ? "text-white" : "text-rose-500"} />
                <span>Danh sách ({filteredJobs.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("compare");
                  router.push("/cong-cu/so-sanh-viec-lam");
                }}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${activeTab === "compare"
                    ? "bg-[#0062ff] text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
              >
                <ApartmentOutlined />
                <span>So sánh công việc</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("history");
                  message.info("Hiển thị lịch sử các công việc bạn đã xem gần đây.");
                }}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${activeTab === "history"
                    ? "bg-[#0062ff] text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
              >
                <EyeOutlined />
                <span>Lịch sử xem</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("suggested");
                  router.push("/viec-lam");
                }}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${activeTab === "suggested"
                    ? "bg-[#0062ff] text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
              >
                <ThunderboltOutlined className="text-amber-500" />
                <span>Gợi ý</span>
              </button>
            </div>

            {/* Dropdown Sắp xếp bên phải */}
            <div className="flex items-center gap-1.5 shrink-0 pl-1">
              <span className="text-xs text-slate-500 hidden xl:inline whitespace-nowrap">Sắp xếp:</span>
              <Select
                value={sortBy}
                onChange={(val) => setSortBy(val)}
                className="text-xs w-[125px] sm:w-[130px]"
                size="small"
                options={[
                  { label: "Mới lưu nhất", value: "newest" },
                  { label: "Cũ nhất", value: "oldest" },
                  { label: "Lương cao nhất", value: "salary_high" },
                  { label: "Hạn nộp gần nhất", value: "expiring_soon" },
                ]}
              />
            </div>
          </div>

          {/* Danh sách Job Cards */}
          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-2xs space-y-3">
              <Spin size="large" />
              <p className="text-xs text-slate-500 m-0 font-medium">Đang tải danh sách công việc yêu thích...</p>
            </div>
          ) : paginatedJobs.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-2xs space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center text-3xl mx-auto shadow-inner">
                <HeartOutlined />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800 m-0">
                  {jobs.length === 0
                    ? "Bạn chưa có công việc yêu thích nào"
                    : "Không tìm thấy công việc phù hợp với bộ lọc"}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto m-0 leading-relaxed">
                  {jobs.length === 0
                    ? "Hãy bấm biểu tượng trái tim khi xem tin tuyển dụng để lưu lại các cơ hội nghề nghiệp tốt nhất."
                    : "Thử thay đổi từ khóa hoặc thiết lập lại bộ lọc để tìm kiếm thêm cơ hội."}
                </p>
              </div>
              <div className="pt-2">
                {jobs.length === 0 ? (
                  <Link href="/viec-lam">
                    <Button
                      type="primary"
                      icon={<SearchOutlined />}
                      className="bg-[#0062ff] hover:bg-blue-700 font-bold text-xs h-10 px-6 rounded-xl shadow-xs"
                    >
                      Khám phá việc làm ngay
                    </Button>
                  </Link>
                ) : (
                  <Button
                    onClick={handleResetFilters}
                    icon={<UndoOutlined />}
                    className="font-bold text-xs h-10 px-5 rounded-xl border-slate-200"
                  >
                    Xóa tất cả bộ lọc
                  </Button>
                )}
              </div>
            </div>
          ) : (
            /* Render danh sách thẻ công việc */
            <div className="space-y-3.5">
              {paginatedJobs.map((item) => {
                const job = item.job;
                const company = item.company;
                const isActionLoading = actionLoadingId === job.id;
                const isClosed =
                  job.status === "closed" ||
                  job.status === "draft" ||
                  job.status === "expired" ||
                  (job as any).isClosed;

                // Tags kỹ năng mẫu nếu job không có
                const skills =
                  job.skills && job.skills.length > 0
                    ? job.skills.slice(0, 4)
                    : ["Giao tiếp", "Làm việc nhóm", "Giải quyết vấn đề"];

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 hover:shadow-md transition-all p-5 space-y-3.5 group relative"
                  >
                    {/* Phần đầu Card: Logo + Thông tin công việc */}
                    <div className="flex items-start gap-4">
                      {/* Logo công ty */}
                      <Link href={`/cong-ty/${company.slug || company.id || ""}`}>
                        <div className="w-14 h-14 rounded-xl border border-slate-100 p-1.5 bg-white shrink-0 flex items-center justify-center overflow-hidden group-hover:border-blue-200 transition-colors shadow-2xs">
                          {company.logoUrl ? (
                            <img
                              src={company.logoUrl}
                              alt={company.name || "Company"}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as any).style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full rounded-lg bg-blue-50 text-[#0062ff] font-black text-lg flex items-center justify-center uppercase">
                              {(company.name || "C").charAt(0)}
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Tiêu đề & metadata */}
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link href={`/viec-lam/${job.id}`}>
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#0062ff] transition-colors line-clamp-1 m-0">
                              {job.title}
                            </h3>
                          </Link>
                          {isClosed && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200 text-[11px] font-semibold shrink-0">
                              Đã đóng tuyển
                            </span>
                          )}
                        </div>

                        {/* Tên công ty + tick xanh */}
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-600 font-medium">
                          <Link
                            href={`/cong-ty/${company.slug || company.id || ""}`}
                            className="text-slate-600 hover:text-slate-900 font-semibold truncate"
                          >
                            {company.name}
                          </Link>
                          {company.isVerified && (
                            <Tooltip title="Doanh nghiệp đã xác thực trên CAREZA">
                              <CheckCircleFilled className="text-emerald-500 text-xs shrink-0" />
                            </Tooltip>
                          )}
                        </div>

                        {/* Hàng thông tin tóm tắt: Địa điểm, Kinh nghiệm, Lương, Hình thức */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 mt-2 font-medium">
                          {/* Địa điểm */}
                          <div className="flex items-center gap-1 shrink-0">
                            <EnvironmentOutlined className="text-slate-400" />
                            <span>{job.locationText || "TP. Hồ Chí Minh"}</span>
                          </div>

                          {/* Kinh nghiệm */}
                          <div className="flex items-center gap-1 shrink-0">
                            <ClockCircleOutlined className="text-slate-400" />
                            <span>{job.experienceMin ? `${job.experienceMin} năm kinh nghiệm` : "1 – 3 năm"}</span>
                          </div>

                          {/* Mức lương */}
                          <div className="flex items-center gap-1 text-[#0062ff] font-bold shrink-0">
                            <DollarOutlined />
                            <span>{formatSalaryText(job.salaryMin, job.salaryMax, job.negotiableSalary)}</span>
                          </div>

                          {/* Hình thức */}
                          <div className="flex items-center gap-1 shrink-0">
                            <ApartmentOutlined className="text-slate-400" />
                            <span>{formatWorkModeText(job.workMode)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Nút Đã lưu (trái tim đỏ) và Menu ba chấm */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Popconfirm
                          title="Bỏ lưu công việc này?"
                          description="Công việc sẽ được gỡ khỏi danh sách yêu thích của bạn."
                          onConfirm={() => handleUnsaveJob(job.id, job.title)}
                          okText="Đồng ý gỡ"
                          cancelText="Hủy"
                          okButtonProps={{ danger: true, size: "small" }}
                          cancelButtonProps={{ size: "small" }}
                        >
                          <button
                            type="button"
                            disabled={isActionLoading}
                            className="px-2.5 py-1 rounded-lg border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-600 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                          >
                            <HeartFilled className="text-rose-500" />
                            <span className="hidden sm:inline">Đã lưu</span>
                          </button>
                        </Popconfirm>

                        <Dropdown
                          menu={{
                            items: [
                              {
                                key: "copy",
                                icon: <CopyOutlined />,
                                label: "Sao chép liên kết việc làm",
                                onClick: () => {
                                  if (typeof window !== "undefined") {
                                    navigator.clipboard.writeText(`${window.location.origin}/viec-lam/${job.id}`);
                                    message.success("Đã sao chép liên kết!");
                                  }
                                },
                              },
                              {
                                key: "share",
                                icon: <ShareAltOutlined />,
                                label: "Chia sẻ việc làm",
                                onClick: () => {
                                  message.info("Tính năng chia sẻ đang được hoàn thiện.");
                                },
                              },
                            ],
                          }}
                          trigger={["click"]}
                        >
                          <button
                            type="button"
                            className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 flex items-center justify-center transition-all cursor-pointer"
                          >
                            <MoreOutlined className="text-base" />
                          </button>
                        </Dropdown>
                      </div>
                    </div>

                    {/* Mô tả ngắn gọn tối đa 2 dòng */}
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed m-0 pt-0.5">
                      {job.description
                        ? job.description.replace(/<[^>]*>?/gm, "").slice(0, 160) + "..."
                        : "Phát triển và tối ưu giao diện website/ứng dụng, phối hợp với team xây dựng sản phẩm chất lượng cao."}
                    </p>

                    {/* Tags kỹ năng & Nút Thao tác Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-100">
                      {/* Danh sách kỹ năng */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-0.5 rounded-lg bg-slate-100/90 text-slate-700 text-[11.5px] font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* Nút Xem chi tiết & Ứng tuyển */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        <Link href={`/viec-lam/${job.id}`}>
                          <button
                            type="button"
                            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-[#0062ff] hover:text-[#0062ff] text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <ExportOutlined />
                            <span>Xem chi tiết</span>
                          </button>
                        </Link>

                        {isClosed ? (
                          <button
                            type="button"
                            disabled
                            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs flex items-center gap-1.5 cursor-not-allowed border border-slate-200"
                            title="Tin tuyển dụng này hiện đã đóng hoặc tạm dừng nhận hồ sơ"
                          >
                            <span>Đã đóng tuyển</span>
                          </button>
                        ) : (
                          <Link href={`/viec-lam/${job.id}#apply`}>
                            <button
                              type="button"
                              className="px-4 py-2 rounded-xl bg-[#0062ff] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                            >
                              <SendOutlined />
                              <span>Ứng tuyển ngay</span>
                            </button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Phân trang dưới cùng */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-xs text-slate-500 font-medium">
                  Hiển thị {(page - 1) * pageSize + 1} –{" "}
                  {Math.min(page * pageSize, filteredJobs.length)} trong tổng số {filteredJobs.length} công việc
                </span>

                <Pagination
                  current={page}
                  pageSize={pageSize}
                  total={filteredJobs.length}
                  onChange={(p) => {
                    setPage(p);
                    window.scrollTo({ top: 180, behavior: "smooth" });
                  }}
                  showSizeChanger={false}
                  size="small"
                />
              </div>
            </div>
          )}
        </div>

        {/* ====================================================== */}
        {/* CỘT PHẢI (22% ~ lg:col-span-3 xl:col-span-3) - HỖ TRỢ  */}
        {/* ====================================================== */}
        <div className="lg:col-span-3 space-y-4">
          {/* Card 1: Tổng quan */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-3.5">
            <h3 className="text-xs font-bold text-slate-800 m-0 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <BarChartOutlined className="text-[#0062ff]" />
              <span>Tổng quan</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600">
                  <div className="w-5 h-5 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center text-xs">
                    <HeartFilled />
                  </div>
                  <span className="font-medium">Công việc đã lưu</span>
                </div>
                <span className="font-extrabold text-sm text-slate-900">{total}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600">
                  <div className="w-5 h-5 rounded-full bg-blue-50 text-[#0062ff] flex items-center justify-center text-xs">
                    <EyeOutlined />
                  </div>
                  <span className="font-medium">Đã xem gần đây</span>
                </div>
                <span className="font-extrabold text-sm text-slate-900">{recentViewCount}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600">
                  <div className="w-5 h-5 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center text-xs">
                    <BellOutlined />
                  </div>
                  <span className="font-medium">Gợi ý mới hôm nay</span>
                </div>
                <span className="font-extrabold text-sm text-slate-900">{relatedJobs.length || 5}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Việc làm liên quan */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-bold text-slate-800 m-0 uppercase tracking-wider flex items-center gap-1.5">
                <CompassOutlined className="text-[#0062ff]" />
                <span>Việc làm liên quan</span>
              </h3>
            </div>

            {loadingRelated ? (
              <div className="py-4 text-center">
                <Spin size="small" />
              </div>
            ) : relatedJobs.length === 0 ? (
              <p className="text-xs text-slate-400 m-0 text-center py-2">Đang cập nhật việc làm gợi ý...</p>
            ) : (
              <div className="space-y-3">
                {relatedJobs.map((job) => {
                  const isSaved = savedJobIds.has(job.id);
                  return (
                    <div
                      key={job.id}
                      className="p-2.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-slate-50/60 transition-all flex items-start gap-2.5 group"
                    >
                      <div className="w-10 h-10 rounded-lg border border-slate-200 bg-white p-1 shrink-0 flex items-center justify-center overflow-hidden">
                        {job.companyLogo ? (
                          <img
                            src={job.companyLogo}
                            alt={job.companyName}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.target as any).style.display = "none";
                            }}
                          />
                        ) : (
                          <span className="font-bold text-xs text-[#0062ff]">
                            {job.companyName.charAt(0)}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 pr-1">
                        <Link
                          href={`/viec-lam/${job.id}`}
                          className="text-xs font-bold text-slate-900 group-hover:text-[#0062ff] truncate block"
                        >
                          {job.title}
                        </Link>
                        <p className="text-[11px] text-slate-500 truncate m-0 mt-0.5">
                          {job.companyName}
                        </p>
                        <p className="text-[11px] font-bold text-[#0062ff] m-0 mt-0.5">
                          {formatSalaryText(job.salaryMin, job.salaryMax)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleBookmarkRelated(job.id, job.title)}
                        className="text-slate-400 hover:text-rose-500 p-1 transition-colors cursor-pointer shrink-0"
                        title={isSaved ? "Bỏ lưu việc làm" : "Lưu việc làm"}
                      >
                        {isSaved ? (
                          <HeartFilled className="text-rose-500 text-sm" />
                        ) : (
                          <HeartOutlined className="text-sm" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-1 border-t border-slate-100 text-center">
              <Link
                href="/viec-lam"
                className="text-xs font-bold text-[#0062ff] hover:underline inline-flex items-center gap-1"
              >
                <span>Xem thêm gợi ý</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

