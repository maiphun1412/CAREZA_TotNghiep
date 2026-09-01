"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Tag, Select, Spin, App, Drawer, Popover, Dropdown } from "antd";
import {
  HeartFilled,
  HeartOutlined,
  CheckCircleFilled,
  ArrowRightOutlined,
  AppstoreOutlined,
  BarsOutlined,
} from "@ant-design/icons";
import {
  Search,
  Package,
  MapPin,
  ShieldCheck,
  BadgeDollarSign,
  CalendarDays,
  IdCard,
  SlidersHorizontal,
  ChevronDown,
  Heart,
  Clock,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  UserCheck,
  FileText,
  FilePlus,
  UploadCloud,
  Send,
  CalendarCheck,
  FileSignature,
  MessagesSquare,
  CircleDollarSign,
  Award,
  BookOpen,
  Star,
  BarChart3,
  Zap,
} from "lucide-react";
import { apiClient } from "@/services/api-client";
import { candidateService } from "@/services/candidate.service";
import { useAuthStore } from "@/store/auth-store";

// ==================== MOCK DATA CHUẨN THEO ẢNH THAM CHIẾU ====================
const MOCK_JOBS = [
  {
    id: "job-1",
    title: "Frontend Developer",
    company: "FPT Software",
    isVerified: true,
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/11/FPT_logo_2010.svg",
    salary: "15 - 25 triệu",
    location: "TP. Hồ Chí Minh",
    experience: "1 - 3 năm",
    type: "Toàn thời gian",
    workMode: "Tại văn phòng",
    category: "Công nghệ thông tin",
    badge: "featured", // 'featured' | 'suggested' | 'hot'
    badgeText: "Nổi bật",
    skills: ["React", "TypeScript", "Next.js"],
    moreSkillsCount: 2,
    postedAt: "Đăng 2 ngày trước",
  },
  {
    id: "job-2",
    title: "Business Analyst",
    company: "Viettel",
    isVerified: true,
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/fe/Viettel_logo_2021.svg",
    salary: "18 - 30 triệu",
    location: "Hà Nội",
    experience: "2 - 4 năm",
    type: "Toàn thời gian",
    workMode: "Tại văn phòng",
    category: "Kinh doanh",
    badge: "suggested",
    badgeText: "Gợi ý cho bạn",
    skills: ["BA", "SQL", "Communication"],
    moreSkillsCount: 2,
    postedAt: "Đăng 3 ngày trước",
  },
  {
    id: "job-3",
    title: "Product Manager",
    company: "Grab Việt Nam",
    isVerified: true,
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Grab_Logo.svg",
    salary: "25 - 40 triệu",
    location: "TP. Hồ Chí Minh",
    experience: "3 - 5 năm",
    type: "Toàn thời gian",
    workMode: "Hybrid",
    category: "Công nghệ thông tin",
    badge: "hot",
    badgeText: "Hot",
    skills: ["Product", "Strategy", "Analytics"],
    moreSkillsCount: 2,
    postedAt: "Đăng 5 ngày trước",
  },
  {
    id: "job-4",
    title: "Marketing Executive",
    company: "Shopee",
    isVerified: true,
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Shopee_logo.svg",
    salary: "12 - 20 triệu",
    location: "TP. Hồ Chí Minh",
    experience: "1 - 3 năm",
    type: "Toàn thời gian",
    workMode: "Tại văn phòng",
    category: "Marketing",
    badge: "suggested",
    badgeText: "Gợi ý cho bạn",
    skills: ["Marketing", "Content", "Campaign"],
    moreSkillsCount: 2,
    postedAt: "Đăng 6 ngày trước",
  },
  {
    id: "job-5",
    title: "Data Analyst",
    company: "Zalo Group",
    isVerified: true,
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg",
    salary: "20 - 35 triệu",
    location: "Hà Nội",
    experience: "2 - 4 năm",
    type: "Toàn thời gian",
    workMode: "Tại văn phòng",
    category: "Công nghệ thông tin",
    badge: "featured",
    badgeText: "Nổi bật",
    skills: ["SQL", "Python", "Data Visualization"],
    moreSkillsCount: 2,
    postedAt: "Đăng 1 ngày trước",
  },
  {
    id: "job-6",
    title: "UI/UX Designer",
    company: "VNG Corporation",
    isVerified: true,
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/VNG_Corp._logo.svg",
    salary: "25 - 40 triệu",
    location: "TP. Hồ Chí Minh",
    experience: "2 - 4 năm",
    type: "Toàn thời gian",
    workMode: "Tại văn phòng",
    category: "Thiết kế",
    badge: "hot",
    badgeText: "Hot",
    skills: ["Figma", "UI Design", "User Research"],
    moreSkillsCount: 2,
    postedAt: "Đăng 4 ngày trước",
  },
  {
    id: "job-7",
    title: "Backend Developer",
    company: "MoMo",
    isVerified: true,
    logo: "https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png",
    salary: "30 - 50 triệu",
    location: "Hà Nội",
    experience: "3 - 5 năm",
    type: "Toàn thời gian",
    workMode: "Hybrid",
    category: "Công nghệ thông tin",
    badge: "suggested",
    badgeText: "Gợi ý cho bạn",
    skills: ["Java", "Spring Boot", "Microservices"],
    moreSkillsCount: 2,
    postedAt: "Đăng 3 ngày trước",
  },
  {
    id: "job-8",
    title: "AI Engineer",
    company: "VinAI",
    isVerified: true,
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/VinAI_Logo.png/640px-VinAI_Logo.png",
    salary: "40 - 70 triệu",
    location: "Hà Nội",
    experience: "3 - 5 năm",
    type: "Toàn thời gian",
    workMode: "Tại văn phòng",
    category: "Công nghệ thông tin",
    badge: "featured",
    badgeText: "Nổi bật",
    skills: ["Python", "Machine Learning", "LLM"],
    moreSkillsCount: 2,
    postedAt: "Đăng 1 ngày trước",
  },
];

// Danh mục bộ lọc tiếng Việt
const CATEGORIES = ["Tất cả ngành", "Công nghệ thông tin", "Kinh doanh", "Marketing", "Tài chính – Ngân hàng", "Nhân sự", "Thiết kế"];
const LOCATIONS = ["Toàn quốc", "TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Bình Dương", "Đồng Nai"];
const EXPERIENCES = ["Tất cả", "Chưa có kinh nghiệm", "Dưới 1 năm", "1 - 3 năm", "2 - 4 năm", "3 - 5 năm", "5+ năm"];
const SALARY_RANGES = ["Tất cả", "Dưới 10 triệu", "10 - 20 triệu", "20 - 35 triệu", "35 - 50 triệu", "Trên 50 triệu", "Thỏa thuận"];
const WORK_MODES = ["Tất cả", "Tại văn phòng", "Hybrid", "Remote"];
const JOB_TYPES = ["Tất cả", "Toàn thời gian", "Bán thời gian", "Thực tập", "Hợp đồng", "Freelance"];

// Popular search tags
const POPULAR_SEARCHES = ["IT", "Marketing", "Kinh doanh", "Nhân sự", "Thiết kế", "Data Analyst", "Content"];

// Top Recruiter / Employer Banners
const FEATURED_EMPLOYER_BANNERS = [
  {
    id: "fpt-software",
    name: "FPT Software",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/11/FPT_logo_2010.svg",
    cover: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80",
    slogan: "Tiên phong chuyển đổi số & AI toàn cầu",
    industry: "Công nghệ thông tin",
    openJobs: 45,
    location: "Hà Nội, TP.HCM, Đà Nẵng",
  },
  {
    id: "viettel",
    name: "Viettel Group",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/fe/Viettel_logo_2021.svg",
    cover: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
    slogan: "Theo cách của bạn – Kiến tạo xã hội số",
    industry: "Viễn thông & Công nghệ",
    openJobs: 62,
    location: "Hà Nội, Toàn quốc",
  },
  {
    id: "grab",
    name: "Grab Việt Nam",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Grab_Logo.svg",
    cover: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80",
    slogan: "Siêu ứng dụng hàng đầu Đông Nam Á",
    industry: "Công nghệ & Vận tải",
    openJobs: 28,
    location: "TP. Hồ Chí Minh",
  },
  {
    id: "shopee",
    name: "Shopee Việt Nam",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Shopee_logo.svg",
    cover: "https://images.unsplash.com/photo-1556742049-0a67e5572273?auto=format&fit=crop&w=600&q=80",
    slogan: "Nền tảng TMĐT số 1 khu vực",
    industry: "Thương mại điện tử",
    openJobs: 54,
    location: "TP. Hồ Chí Minh",
  },
  {
    id: "vng",
    name: "VNG Corporation",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/VNG_Corp._logo.svg",
    cover: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80",
    slogan: "Kỳ lân công nghệ đầu tiên tại Việt Nam",
    industry: "Game & Cloud Service",
    openJobs: 38,
    location: "TP. Hồ Chí Minh",
  },
  {
    id: "momo",
    name: "MoMo (M_Service)",
    logo: "https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png",
    cover: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80",
    slogan: "Hệ sinh thái tài chính số cho người Việt",
    industry: "Fintech",
    openJobs: 31,
    location: "TP. Hồ Chí Minh, Hà Nội",
  },
  {
    id: "vinai",
    name: "VinAI Research",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/VinAI_Logo.png/640px-VinAI_Logo.png",
    cover: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80",
    slogan: "Nghiên cứu & phát triển AI đẳng cấp thế giới",
    industry: "Trí tuệ nhân tạo (AI)",
    openJobs: 19,
    location: "Hà Nội",
  },
];

// ==================== MAIN COMPONENT ====================
function JobSearchForm() {
  const { message } = App.useApp();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Search & Filter state
  const [keyword, setKeyword] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "Tất cả ngành");
  const [location, setLocation] = useState(searchParams.get("location") || "Toàn quốc");
  const [experience, setExperience] = useState(searchParams.get("experience") || "Tất cả");
  const [salary, setSalary] = useState(searchParams.get("salary") || "Tất cả");
  const [workMode, setWorkMode] = useState(searchParams.get("workMode") || "Tất cả");
  const [jobType, setJobType] = useState(searchParams.get("jobType") || "Tất cả");

  // Advanced Drawer state
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [advancedLevel, setAdvancedLevel] = useState("Tất cả");
  const [advancedCompanySize, setAdvancedCompanySize] = useState("Tất cả");
  const [advancedPostedDate, setAdvancedPostedDate] = useState("Tất cả");

  // View mode: 'grid' | 'list'
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("relevance");
  const [pageSize, setPageSize] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);

  // API & Data state
  const [jobs, setJobs] = useState<any[]>(MOCK_JOBS);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(6120);

  // Bookmark state
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [bookmarkedJobIds, setBookmarkedJobIds] = useState<string[]>([]);
  const [bookmarkingId, setBookmarkingId] = useState<string | null>(null);

  // Fetch bookmarks
  useEffect(() => {
    if (isAuthenticated) {
      candidateService
        .getBookmarkedJobIds()
        .then((res) => {
          if (res?.data?.ids) {
            setBookmarkedJobIds(res.data.ids);
          }
        })
        .catch(() => {});
    } else {
      setBookmarkedJobIds([]);
    }
  }, [isAuthenticated]);

  // Handle Save / Bookmark
  const handleBookmarkJob = async (e: React.MouseEvent, jobId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push(`/dang-nhap?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setBookmarkingId(jobId);
    const isCurrentlySaved = bookmarkedJobIds.includes(jobId);

    try {
      if (isCurrentlySaved) {
        await candidateService.removeJobBookmark(jobId);
        setBookmarkedJobIds((prev) => prev.filter((id) => id !== jobId));
        message.success("Đã bỏ lưu việc làm");
      } else {
        await candidateService.saveJobBookmark(jobId);
        setBookmarkedJobIds((prev) => [...prev, jobId]);
        message.success("Đã lưu việc làm vào danh sách yêu thích");
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Thao tác thất bại. Vui lòng thử lại.";
      message.error(errorMsg);
    } finally {
      setBookmarkingId(null);
    }
  };

  // Handle Search Trigger
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 300);
  };

  // Filter jobs locally or through API
  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      if (keyword.trim()) {
        const matchTitle = j.title.toLowerCase().includes(keyword.toLowerCase());
        const matchComp = j.company.toLowerCase().includes(keyword.toLowerCase());
        const matchSkill = j.skills.some((s: string) => s.toLowerCase().includes(keyword.toLowerCase()));
        if (!matchTitle && !matchComp && !matchSkill) return false;
      }
      if (category !== "Tất cả ngành" && j.category !== category) return false;
      if (location !== "Toàn quốc" && j.location !== location) return false;
      if (workMode !== "Tất cả" && j.workMode !== workMode) return false;
      if (jobType !== "Tất cả" && j.type !== jobType) return false;
      return true;
    });
  }, [jobs, keyword, category, location, workMode, jobType]);

  // Helper render Badge color
  const renderBadge = (badge: string, text: string) => {
    if (badge === "hot") {
      return (
        <span className="bg-[#fff1f2] text-[#e11d48] border border-rose-100/80 text-[11px] font-bold px-2.5 py-0.5 rounded-full leading-none">
          {text}
        </span>
      );
    }
    if (badge === "suggested") {
      return (
        <span className="bg-[#fff7ed] text-[#ea580c] border border-orange-100/80 text-[11px] font-bold px-2.5 py-0.5 rounded-full leading-none">
          {text}
        </span>
      );
    }
    return (
      <span className="bg-[#fff7ed] text-[#ea580c] border border-orange-100/80 text-[11px] font-bold px-2.5 py-0.5 rounded-full leading-none">
        {text}
      </span>
    );
  };

  return (
    <div className="w-full bg-[#f8fafc] min-h-screen flex flex-col font-sans pb-16">
      
      {/* 1. HERO / BANNER SECTION */}
      <div className="relative overflow-hidden bg-[#0047cc] text-white min-h-[360px] lg:min-h-[420px] flex items-center">
        {/* Background Image vieclam.png */}
        <div
          className="absolute inset-0 bg-no-repeat bg-cover bg-right lg:bg-center pointer-events-none"
          style={{
            backgroundImage: "url('/images/vieclam.png')",
          }}
        />

        <div className="max-w-[1460px] mx-auto px-4 sm:px-6 md:px-8 xl:px-12 pt-8 pb-20 lg:pt-12 lg:pb-24 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Cột trái: Tiêu đề & Chỉ số */}
            <div className="lg:col-span-7 space-y-6">
              {/* Badge nhỏ */}
              <div className="inline-block">
                <span className="bg-white/15 backdrop-blur-md text-white text-[11px] font-extrabold uppercase px-3.5 py-1 rounded-full tracking-wider border border-white/20">
                  HƠN CẢ MỘT CÔNG VIỆC
                </span>
              </div>

              {/* Tiêu đề lớn */}
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.15] m-0">
                Tìm việc tốt,
                <br />
                chạm đến{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38bdf8] via-[#67e8f9] to-[#ffffff]">
                  tương lai
                </span>
              </h1>

              {/* Mô tả */}
              <p className="text-slate-100 text-sm sm:text-base font-medium max-w-lg leading-relaxed m-0 drop-shadow-sm">
                Hàng ngàn cơ hội việc làm từ các doanh nghiệp hàng đầu đang chờ bạn.
              </p>

              {/* 3 chỉ số nhỏ */}
              <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-2 max-w-md">
                {/* 1. 58K+ Việc làm */}
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-cyan-300 shrink-0">
                    <span className="material-symbols-outlined text-[20px]">work</span>
                  </div>
                  <div>
                    <span className="text-base sm:text-lg font-black text-white block leading-tight">58K+</span>
                    <span className="text-[11px] text-blue-100 font-medium block leading-tight">việc làm đang tuyển</span>
                  </div>
                </div>

                {/* 2. 2.3K+ Doanh nghiệp */}
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-blue-200 shrink-0">
                    <span className="material-symbols-outlined text-[20px]">domain</span>
                  </div>
                  <div>
                    <span className="text-base sm:text-lg font-black text-white block leading-tight">2.3K+</span>
                    <span className="text-[11px] text-blue-100 font-medium block leading-tight">doanh nghiệp uy tín</span>
                  </div>
                </div>

                {/* 3. 98% Hài lòng */}
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-emerald-300 shrink-0">
                    <span className="material-symbols-outlined text-[20px]">group</span>
                  </div>
                  <div>
                    <span className="text-base sm:text-lg font-black text-white block leading-tight">98%</span>
                    <span className="text-[11px] text-blue-100 font-medium block leading-tight">ứng viên hài lòng</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cột phải: Để trống để lộ 3D graphic của ảnh nền */}
            <div className="hidden lg:block lg:col-span-5 h-[260px]" />

          </div>
        </div>
      </div>

      {/* 2. SEARCH & FILTER CONTAINER (Khung trắng nổi bám sát 100% ảnh tham chiếu) */}
      <div className="max-w-[1460px] mx-auto px-4 sm:px-6 md:px-8 xl:px-12 w-full -mt-10 sm:-mt-12 relative z-30">
        <div className="bg-white rounded-[28px] p-5 sm:p-6 shadow-[0_16px_40px_rgba(0,18,50,0.08)] border border-slate-100/80 space-y-4">
          
          {/* Main Filter Row (8 widgets with expanded search bar) */}
          <form onSubmit={handleSearch} className="flex flex-col sm:grid sm:grid-cols-2 md:grid-cols-4 xl:flex xl:flex-row xl:items-center gap-2.5">
            
            {/* 1. Keyword search input (rộng rãi, không bị mất chữ) */}
            <div className="w-full xl:flex-[2.2] xl:min-w-[250px] relative flex items-center bg-white rounded-2xl border border-slate-200/90 px-3.5 py-2 hover:border-[#0062ff] focus-within:border-[#0062ff] focus-within:shadow-[0_0_0_2px_rgba(0,98,255,0.1)] transition-all h-[56px]">
              <Search className="text-[#0062ff] w-5 h-5 mr-2 shrink-0 stroke-[2.2]" />
              <input
                type="text"
                placeholder="Tìm công việc, kỹ năng, công ty..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-xs font-semibold text-slate-800 placeholder:text-slate-400"
              />
            </div>

            {/* 2. Ngành nghề */}
            <Dropdown
              menu={{
                items: CATEGORIES.map((c) => ({
                  key: c,
                  label: <span className="font-semibold text-xs py-1 block">{c}</span>,
                  onClick: () => setCategory(c),
                })),
                selectedKeys: [category],
              }}
              trigger={["click"]}
            >
              <div className="w-full xl:flex-1 xl:min-w-[125px] bg-white border border-slate-200/90 hover:border-[#0062ff] rounded-2xl px-2.5 py-2 flex items-center justify-between gap-1 h-[56px] transition-all cursor-pointer group shadow-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <Package className="text-[#0062ff] w-5 h-5 shrink-0 stroke-[2.2]" />
                  <div className="min-w-0 text-left">
                    <span className="text-[11px] font-bold text-slate-800 leading-tight block truncate">Ngành nghề</span>
                    <span className="text-[11px] text-slate-500 font-normal leading-tight block truncate mt-0.5">{category}</span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0062ff] shrink-0 transition-colors stroke-[2]" />
              </div>
            </Dropdown>

            {/* 3. Địa điểm */}
            <Dropdown
              menu={{
                items: LOCATIONS.map((l) => ({
                  key: l,
                  label: <span className="font-semibold text-xs py-1 block">{l}</span>,
                  onClick: () => setLocation(l),
                })),
                selectedKeys: [location],
              }}
              trigger={["click"]}
            >
              <div className="w-full xl:flex-1 xl:min-w-[120px] bg-white border border-slate-200/90 hover:border-[#0062ff] rounded-2xl px-2.5 py-2 flex items-center justify-between gap-1 h-[56px] transition-all cursor-pointer group shadow-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className="text-[#0062ff] w-5 h-5 shrink-0 stroke-[2.2]" />
                  <div className="min-w-0 text-left">
                    <span className="text-[11px] font-bold text-slate-800 leading-tight block truncate">Địa điểm</span>
                    <span className="text-[11px] text-slate-500 font-normal leading-tight block truncate mt-0.5">{location}</span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0062ff] shrink-0 transition-colors stroke-[2]" />
              </div>
            </Dropdown>

            {/* 4. Kinh nghiệm */}
            <Dropdown
              menu={{
                items: EXPERIENCES.map((e) => ({
                  key: e,
                  label: <span className="font-semibold text-xs py-1 block">{e}</span>,
                  onClick: () => setExperience(e),
                })),
                selectedKeys: [experience],
              }}
              trigger={["click"]}
            >
              <div className="w-full xl:flex-1 xl:min-w-[120px] bg-white border border-slate-200/90 hover:border-[#0062ff] rounded-2xl px-2.5 py-2 flex items-center justify-between gap-1 h-[56px] transition-all cursor-pointer group shadow-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <ShieldCheck className="text-[#0062ff] w-5 h-5 shrink-0 stroke-[2.2]" />
                  <div className="min-w-0 text-left">
                    <span className="text-[11px] font-bold text-slate-800 leading-tight block truncate">Kinh nghiệm</span>
                    <span className="text-[11px] text-slate-500 font-normal leading-tight block truncate mt-0.5">{experience}</span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0062ff] shrink-0 transition-colors stroke-[2]" />
              </div>
            </Dropdown>

            {/* 5. Mức lương */}
            <Dropdown
              menu={{
                items: SALARY_RANGES.map((s) => ({
                  key: s,
                  label: <span className="font-semibold text-xs py-1 block">{s}</span>,
                  onClick: () => setSalary(s),
                })),
                selectedKeys: [salary],
              }}
              trigger={["click"]}
            >
              <div className="w-full xl:flex-1 xl:min-w-[120px] bg-white border border-slate-200/90 hover:border-[#0062ff] rounded-2xl px-2.5 py-2 flex items-center justify-between gap-1 h-[56px] transition-all cursor-pointer group shadow-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <BadgeDollarSign className="text-[#0062ff] w-5 h-5 shrink-0 stroke-[2.2]" />
                  <div className="min-w-0 text-left">
                    <span className="text-[11px] font-bold text-slate-800 leading-tight block truncate">Mức lương</span>
                    <span className="text-[11px] text-slate-500 font-normal leading-tight block truncate mt-0.5">{salary}</span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0062ff] shrink-0 transition-colors stroke-[2]" />
              </div>
            </Dropdown>

            {/* 6. Hình thức làm việc */}
            <Dropdown
              menu={{
                items: WORK_MODES.map((w) => ({
                  key: w,
                  label: <span className="font-semibold text-xs py-1 block">{w}</span>,
                  onClick: () => setWorkMode(w),
                })),
                selectedKeys: [workMode],
              }}
              trigger={["click"]}
            >
              <div className="w-full xl:flex-1 xl:min-w-[130px] bg-white border border-slate-200/90 hover:border-[#0062ff] rounded-2xl px-2.5 py-2 flex items-center justify-between gap-1 h-[56px] transition-all cursor-pointer group shadow-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <CalendarDays className="text-[#0062ff] w-5 h-5 shrink-0 stroke-[2.2]" />
                  <div className="min-w-0 text-left">
                    <span className="text-[11px] font-bold text-slate-800 leading-tight block truncate">Hình thức làm việc</span>
                    <span className="text-[11px] text-slate-500 font-normal leading-tight block truncate mt-0.5">{workMode}</span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0062ff] shrink-0 transition-colors stroke-[2]" />
              </div>
            </Dropdown>

            {/* 7. Loại công việc */}
            <Dropdown
              menu={{
                items: JOB_TYPES.map((t) => ({
                  key: t,
                  label: <span className="font-semibold text-xs py-1 block">{t}</span>,
                  onClick: () => setJobType(t),
                })),
                selectedKeys: [jobType],
              }}
              trigger={["click"]}
            >
              <div className="w-full xl:flex-1 xl:min-w-[125px] bg-white border border-slate-200/90 hover:border-[#0062ff] rounded-2xl px-2.5 py-2 flex items-center justify-between gap-1 h-[56px] transition-all cursor-pointer group shadow-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <IdCard className="text-[#0062ff] w-5 h-5 shrink-0 stroke-[2.2]" />
                  <div className="min-w-0 text-left">
                    <span className="text-[11px] font-bold text-slate-800 leading-tight block truncate">Loại công việc</span>
                    <span className="text-[11px] text-slate-500 font-normal leading-tight block truncate mt-0.5">{jobType}</span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0062ff] shrink-0 transition-colors stroke-[2]" />
              </div>
            </Dropdown>

            {/* 8. Nút Tìm kiếm */}
            <button
              type="submit"
              className="w-full xl:w-auto bg-[#0062ff] hover:bg-[#0052cc] text-white font-extrabold text-xs sm:text-sm px-7 py-3 rounded-2xl transition-all shadow-md shadow-blue-600/30 flex items-center justify-center h-[56px] shrink-0 cursor-pointer border-none"
            >
              Tìm kiếm
            </button>

          </form>

          {/* Bottom Row: Popular searches & Advanced filter toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3.5 border-t border-slate-100 text-xs">
            {/* Popular Search tags */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-800 font-bold mr-1">Tìm kiếm phổ biến:</span>
              {POPULAR_SEARCHES.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setKeyword(tag);
                    handleSearch();
                  }}
                  className="bg-[#eff6ff] hover:bg-blue-100 text-[#2563eb] font-semibold px-3.5 py-1 rounded-full text-xs transition-colors cursor-pointer border-none"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Advanced filter toggle button */}
            <button
              type="button"
              onClick={() => setIsAdvancedFilterOpen(true)}
              className="inline-flex items-center gap-1.5 font-bold text-slate-700 hover:text-[#0062ff] transition-colors cursor-pointer bg-transparent border-none p-0 shrink-0 self-end sm:self-auto"
            >
              <SlidersHorizontal className="text-[#0062ff] w-4 h-4 shrink-0 stroke-[2.2]" />
              <span>Bộ lọc nâng cao</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 stroke-[2]" />
            </button>
          </div>

        </div>
      </div>

      {/* 3. RESULTS HEADER & CONTROLS */}
      <div className="max-w-[1460px] mx-auto px-4 sm:px-6 md:px-8 xl:px-12 w-full pt-8 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Total Count */}
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-800 m-0">
              Tìm thấy <span className="text-primary font-black">{totalCount.toLocaleString()}</span> việc làm phù hợp
            </h2>
          </div>

          {/* Sort & Grid/List Switcher */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-bold">Sắp xếp:</span>
              <Select
                value={sortBy}
                onChange={setSortBy}
                style={{ width: 140 }}
                options={[
                  { value: "relevance", label: "Phù hợp nhất" },
                  { value: "newest", label: "Mới nhất" },
                  { value: "salary", label: "Lương cao nhất" },
                ]}
                className="custom-sort-select text-xs font-bold"
              />
            </div>

            {/* View switcher buttons */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg flex items-center justify-center transition-all cursor-pointer border-none ${
                  viewMode === "grid" ? "bg-white text-primary shadow-xs font-bold" : "text-slate-400 hover:text-slate-600 bg-transparent"
                }`}
                title="Dạng lưới"
              >
                <AppstoreOutlined className="text-base" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg flex items-center justify-center transition-all cursor-pointer border-none ${
                  viewMode === "list" ? "bg-white text-primary shadow-xs font-bold" : "text-slate-400 hover:text-slate-600 bg-transparent"
                }`}
                title="Dạng danh sách"
              >
                <BarsOutlined className="text-base" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 4. JOB CARDS GRID (4 COLUMNS ON DESKTOP 1440px+) */}
      <div className="max-w-[1460px] mx-auto px-4 sm:px-6 md:px-8 xl:px-12 w-full pt-2">
        {loading ? (
          <div className="flex items-center justify-center p-24 bg-white rounded-3xl border border-slate-100 shadow-xs">
            <Spin size="large" />
          </div>
        ) : filteredJobs.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                : "flex flex-col gap-4"
            }
          >
            {filteredJobs.map((job, idx) => {
              const isSaved = bookmarkedJobIds.includes(job.id);
              return (
                <div
                  key={job.id || `job-${idx}`}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_25px_rgba(0,30,100,0.07)] hover:border-blue-300 transition-all duration-200 flex flex-col justify-between group relative"
                >
                  {/* Card Top: Logo + Badge + Save Button */}
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      {/* Logo + Badge */}
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 p-1 flex items-center justify-center shrink-0 shadow-2xs">
                          <img
                            src={job.logo}
                            alt={job.company}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=80&h=80&q=80";
                            }}
                          />
                        </div>
                        {job.badgeText && renderBadge(job.badge, job.badgeText)}
                      </div>

                      {/* Save Heart Button */}
                      <button
                        type="button"
                        onClick={(e) => handleBookmarkJob(e, job.id)}
                        disabled={bookmarkingId === job.id}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer border-none bg-transparent"
                        title={isSaved ? "Bỏ lưu" : "Lưu việc làm"}
                      >
                        <Heart
                          className={`w-[18px] h-[18px] transition-colors ${
                            isSaved ? "fill-rose-500 text-rose-500" : "text-slate-400 hover:text-slate-600 stroke-[1.8]"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Job Title & Company */}
                    <div className="mt-3">
                      <Link href={`/viec-lam/${job.id}`} className="block group-hover:text-[#0062ff] transition-colors">
                        <h3 className="text-[15px] font-black text-slate-900 line-clamp-1 m-0 group-hover:text-[#0062ff] transition-colors leading-snug">
                          {job.title}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mt-1 mb-2.5">
                        <span className="truncate">{job.company}</span>
                        {job.isVerified && (
                          <CheckCircle2 className="w-3.5 h-3.5 fill-[#0062ff] text-white shrink-0" />
                        )}
                      </div>
                    </div>

                    {/* Metadata items: Line 1 (Location, Exp) */}
                    <div className="flex items-center gap-3.5 text-xs text-slate-500 font-medium mb-1.5">
                      <span className="flex items-center gap-1 shrink-0">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 stroke-[2] shrink-0" />
                        <span className="truncate">{job.location}</span>
                      </span>
                      <span className="flex items-center gap-1 shrink-0">
                        <CalendarDays className="w-3.5 h-3.5 text-slate-400 stroke-[2] shrink-0" />
                        <span>{job.experience}</span>
                      </span>
                    </div>

                    {/* Metadata items: Line 2 (Salary) */}
                    <div className="flex items-center gap-1 text-xs font-black text-slate-900 mb-3">
                      <BadgeDollarSign className="w-3.5 h-3.5 text-slate-400 stroke-[2] shrink-0" />
                      <span>{job.salary}</span>
                    </div>

                    {/* Skill Tags */}
                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mb-4">
                        {job.skills.map((s: string, sIdx: number) => (
                          <span
                            key={`sk-${job.id}-${s}-${sIdx}`}
                            className="bg-[#f0f5ff] text-[#1d4ed8] text-[11px] font-semibold px-2.5 py-0.5 rounded-md hover:bg-blue-100 transition-colors"
                          >
                            {s}
                          </span>
                        ))}
                        {job.moreSkillsCount > 0 && (
                          <span className="text-[11px] font-bold text-[#2563eb] bg-[#eff6ff] px-2 py-0.5 rounded-md">
                            +{job.moreSkillsCount}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom: Posted time & Apply button */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100/80 text-xs mt-auto">
                    <span className="text-[11px] text-slate-400 font-normal flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 stroke-[2] shrink-0" />
                      {job.postedAt}
                    </span>

                    <Link href={`/viec-lam/${job.id}`}>
                      <button
                        type="button"
                        className="bg-[#0062ff] hover:bg-[#0052cc] text-white text-xs font-bold px-4 py-1.5 rounded-full transition-all shadow-xs flex items-center gap-1.5 cursor-pointer border-none"
                      >
                        <span>Ứng tuyển</span>
                        <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </Link>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-xs">
            <span className="material-symbols-outlined text-slate-300 text-6xl mb-3 block">search_off</span>
            <h3 className="text-base font-bold text-slate-700 m-0">Không tìm thấy việc làm phù hợp</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Hãy thử điều chỉnh lại từ khóa hoặc xóa bớt tiêu chí trong bộ lọc tìm kiếm.
            </p>
          </div>
        )}
      </div>

      {/* 5. PAGINATION SECTION */}
      <div className="max-w-[1460px] mx-auto px-4 sm:px-6 md:px-8 xl:px-12 w-full pt-10 pb-6">
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4">
          
          {/* Pagination buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors cursor-pointer disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2]" />
            </button>

            {[1, 2, 3, 4, 5].map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 rounded-full font-bold text-xs transition-all cursor-pointer border-none ${
                  currentPage === pageNum
                    ? "bg-[#0062ff] text-white shadow-sm"
                    : "bg-transparent text-slate-600 hover:bg-slate-100 font-semibold"
                }`}
              >
                {pageNum}
              </button>
            ))}

            <span className="text-slate-400 px-1 text-xs font-bold">...</span>

            <button
              type="button"
              onClick={() => setCurrentPage(1021)}
              className="w-8 h-8 rounded-full bg-transparent text-slate-600 hover:bg-slate-100 font-semibold text-xs transition-colors cursor-pointer border-none"
            >
              1021
            </button>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => p + 1)}
              className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 stroke-[2]" />
            </button>
          </div>

          {/* Page size dropdown */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Hiển thị</span>
            <Select
              value={pageSize}
              onChange={setPageSize}
              style={{ width: 145 }}
              options={[
                { value: 12, label: "12 việc làm/trang" },
                { value: 24, label: "24 việc làm/trang" },
                { value: 48, label: "48 việc làm/trang" },
              ]}
              className="custom-page-select text-xs font-semibold"
            />
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: HÀNH TRANG SỰ NGHIỆP - TĂNG CƠ HỘI ĐƯỢC TUYỂN DỤNG */}
      {/* ========================================================================= */}
      <div className="max-w-[1460px] mx-auto px-4 sm:px-6 md:px-8 xl:px-12 w-full pt-8 pb-4">
        {/* Banner phía trên */}
        <div className="relative w-full rounded-3xl overflow-hidden bg-[#f8fbff] border border-blue-100/80 shadow-xs min-h-[180px] sm:min-h-[200px] md:min-h-[220px] flex items-center">
          {/* Background Image: congty2.png covers the full banner container */}
          <img
            src="/images/congty2.png"
            alt="Hành trang sự nghiệp Careza"
            className="absolute inset-0 w-full h-full object-cover object-right pointer-events-none"
          />

          {/* Left Text content */}
          <div className="relative z-10 p-6 sm:p-8 md:p-10 max-w-xl lg:max-w-2xl pb-10 sm:pb-12">
            <span className="inline-block px-3 py-1 bg-white/95 text-[#0062ff] text-[11px] font-extrabold rounded-full uppercase tracking-wider mb-2.5 border border-blue-100 shadow-2xs backdrop-blur-xs w-fit">
              HÀNH TRANG SỰ NGHIỆP
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[32px] font-black text-slate-900 tracking-tight m-0 leading-tight whitespace-nowrap">
              Tăng cơ hội được tuyển dụng
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium m-0 mt-2 max-w-md leading-relaxed">
              Chuẩn bị hồ sơ và CV tốt hơn trước khi ứng tuyển.
            </p>
          </div>
        </div>

        {/* 3 Career Preparation Cards: Giảm chiều cao gọn gàng, đè nhẹ lên mép dưới của banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 relative z-20 -mt-4 sm:-mt-5 px-2 sm:px-3">
          {/* Card 1: Hồ sơ nghề nghiệp (Soft Mint Green) */}
          <div className="bg-[#effcf7] rounded-[20px] p-4 sm:py-4 sm:px-5 border border-[#a7f3d0] shadow-[0_8px_20px_-4px_rgba(16,185,129,0.08),0_6px_8px_-4px_rgba(0,0,0,0.04)] relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all duration-300">
            {/* Background Shape Accent */}
            <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-200/25 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-2xs">
                  <UserCheck className="w-4.5 h-4.5 stroke-[2.5]" />
                </div>
              </div>

              <h3 className="text-[15px] font-black text-slate-900 m-0 leading-tight">
                Hồ sơ nghề nghiệp
              </h3>
              <p className="text-[11.5px] text-slate-600 font-medium mt-0.5 leading-snug m-0 max-w-[210px]">
                Hoàn thiện thông tin để nhà tuyển dụng hiểu rõ hơn về bạn.
              </p>

              {/* Progress bar */}
              <div className="mt-2.5 flex items-center gap-2.5">
                <div className="flex-1 h-1.5 bg-white rounded-full overflow-hidden border border-emerald-200/80 p-0.5 shadow-2xs">
                  <div className="h-full bg-emerald-500 rounded-full w-[70%]" />
                </div>
                <span className="text-[11px] font-black text-slate-800 shrink-0">70%</span>
              </div>
            </div>

            <div className="pt-3 relative z-10 flex items-center justify-between">
              <Link
                href="/ung-vien/ho-so"
                className="bg-white hover:bg-emerald-50/80 text-[#0062ff] font-extrabold text-[11.5px] px-3.5 py-1.5 rounded-xl shadow-2xs border border-emerald-200/90 inline-flex items-center gap-1 transition-all hover:scale-[1.02]"
              >
                <span>Cập nhật hồ sơ</span>
                <ArrowRight className="w-3 h-3 stroke-[2.5]" />
              </Link>
            </div>

            {/* Bottom Right Illustration (SVG Profile Card) */}
            <div className="absolute -bottom-1 -right-1 w-22 h-18 pointer-events-none group-hover:scale-105 transition-transform duration-300">
              <svg viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
                <rect x="18" y="12" width="70" height="62" rx="10" fill="white" stroke="#6ee7b7" strokeWidth="1.5" />
                <circle cx="36" cy="30" r="9" fill="#10b981" />
                <path d="M26 48C26 43 30 41 36 41C42 41 46 43 46 48" fill="#10b981" opacity="0.6" />
                <rect x="52" y="24" width="28" height="4" rx="2" fill="#cbd5e1" />
                <rect x="52" y="32" width="20" height="4" rx="2" fill="#e2e8f0" />
                <rect x="26" y="56" width="54" height="4" rx="2" fill="#a7f3d0" />
                <circle cx="76" cy="18" r="8" fill="#10b981" stroke="white" strokeWidth="1.5" />
                <path d="M73 18L75 20L79 16" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* Card 2: CV của tôi (Soft Lavender / Purple) */}
          <div className="bg-[#f5f3ff] rounded-[20px] p-4 sm:py-4 sm:px-5 border border-[#c4b5fd] shadow-[0_8px_20px_-4px_rgba(139,92,246,0.08),0_6px_8px_-4px_rgba(0,0,0,0.04)] relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all duration-300">
            {/* Background Shape Accent */}
            <div className="absolute top-0 right-0 w-28 h-28 bg-purple-200/25 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-2xs font-black text-[11px]">
                  <span>CV</span>
                </div>
              </div>

              <h3 className="text-[15px] font-black text-slate-900 m-0 leading-tight">
                CV của tôi
              </h3>
              <p className="text-[11.5px] text-slate-600 font-medium mt-0.5 leading-snug m-0 max-w-[210px]">
                Quản lý các CV đang sử dụng cho từng vị trí ứng tuyển.
              </p>

              {/* Badge CV */}
              <div className="mt-2.5">
                <span className="bg-white text-purple-700 text-[10.5px] font-bold px-2.5 py-0.5 rounded-md border border-purple-200/90 shadow-2xs inline-block">
                  3 CV đã lưu
                </span>
              </div>
            </div>

            <div className="pt-3 relative z-10 flex items-center justify-between">
              <Link
                href="/ung-vien/quan-ly-cv"
                className="bg-white hover:bg-purple-50/80 text-[#0062ff] font-extrabold text-[11.5px] px-3.5 py-1.5 rounded-xl shadow-2xs border border-purple-200/90 inline-flex items-center gap-1 transition-all hover:scale-[1.02]"
              >
                <span>Quản lý CV</span>
                <ArrowRight className="w-3 h-3 stroke-[2.5]" />
              </Link>
            </div>

            {/* Bottom Right Illustration (SVG CV Stack) */}
            <div className="absolute -bottom-1 -right-1 w-22 h-18 pointer-events-none group-hover:scale-105 transition-transform duration-300">
              <svg viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
                <rect x="25" y="16" width="55" height="60" rx="8" fill="#ddd6fe" transform="rotate(5 25 16)" />
                <rect x="20" y="12" width="56" height="62" rx="8" fill="white" stroke="#a78bfa" strokeWidth="1.5" />
                <rect x="28" y="22" width="16" height="16" rx="4" fill="#a855f7" opacity="0.8" />
                <rect x="48" y="24" width="20" height="4" rx="2" fill="#94a3b8" />
                <rect x="48" y="32" width="14" height="4" rx="2" fill="#cbd5e1" />
                <rect x="28" y="46" width="40" height="4" rx="2" fill="#e9d5ff" />
                <rect x="28" y="54" width="30" height="4" rx="2" fill="#e9d5ff" />
              </svg>
            </div>
          </div>

          {/* Card 3: Tạo CV online (Soft Cream / Orange) */}
          <div className="bg-[#fffbeb] rounded-[20px] p-4 sm:py-4 sm:px-5 border border-[#fcd34d] shadow-[0_8px_20px_-4px_rgba(245,158,11,0.08),0_6px_8px_-4px_rgba(0,0,0,0.04)] relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all duration-300">
            {/* Background Shape Accent */}
            <div className="absolute top-0 right-0 w-28 h-28 bg-amber-200/25 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-2xs">
                  <FilePlus className="w-4.5 h-4.5 stroke-[2.5]" />
                </div>
              </div>

              <h3 className="text-[15px] font-black text-slate-900 m-0 leading-tight">
                Tạo CV online
              </h3>
              <p className="text-[11.5px] text-slate-600 font-medium mt-0.5 leading-snug m-0 max-w-[210px]">
                Tạo CV chuyên nghiệp ngay trên Careza với nhiều mẫu đẹp.
              </p>
            </div>

            <div className="pt-3 relative z-10 flex items-center gap-2">
              <Link
                href="/cv-builder"
                className="bg-[#0062ff] hover:bg-[#0052cc] text-white font-extrabold text-[11.5px] px-3.5 py-1.5 rounded-xl shadow-sm inline-flex items-center gap-1 transition-all hover:scale-[1.02]"
              >
                <span>Tạo CV</span>
                <ArrowRight className="w-3 h-3 stroke-[2.5]" />
              </Link>

              <Link
                href="/ung-vien/quan-ly-cv?action=upload"
                className="bg-white hover:bg-amber-50/50 text-slate-700 font-bold text-[11.5px] px-3 py-1.5 rounded-xl border border-amber-200/90 shadow-2xs inline-flex items-center transition-all hover:scale-[1.02]"
              >
                Tải CV lên
              </Link>
            </div>

            {/* Bottom Right Illustration (SVG Document + Star) */}
            <div className="absolute -bottom-1 -right-1 w-22 h-18 pointer-events-none group-hover:scale-105 transition-transform duration-300">
              <svg viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
                <rect x="22" y="12" width="56" height="62" rx="8" fill="white" stroke="#fbbf24" strokeWidth="1.5" />
                <rect x="30" y="22" width="22" height="4" rx="2" fill="#f59e0b" />
                <rect x="30" y="30" width="40" height="3" rx="1.5" fill="#e2e8f0" />
                <rect x="30" y="37" width="40" height="3" rx="1.5" fill="#e2e8f0" />
                <rect x="30" y="44" width="30" height="3" rx="1.5" fill="#e2e8f0" />
                <circle cx="68" cy="56" r="10" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.5" />
                <path d="M68 50L70 54H74L71 57L72 61L68 58L64 61L65 57L62 54H66L68 50Z" fill="#f59e0b" />
              </svg>
            </div>
          </div>
        </div>
      </div>



      {/* ========================================================================= */}
      {/* SECTION 3: NÂNG CAO KỸ NĂNG - CHUẨN BỊ TỐT HƠN TRƯỚC KHI ỨNG TUYỂN */}
      {/* ========================================================================= */}
      <div className="max-w-[1460px] mx-auto px-4 sm:px-6 md:px-8 xl:px-12 w-full pt-8 pb-4">
        {/* 1 Hàng ngang: Badge bên trái - Tiêu đề ở giữa - Link bên phải */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          {/* Căn trái: Badge */}
          <div className="w-full md:w-1/4 flex justify-start">
            <span className="inline-block px-3 py-1 bg-blue-50 text-[#0062ff] text-[11px] font-extrabold rounded-full uppercase tracking-wider border border-blue-100/70">
              NÂNG CAO KỸ NĂNG
            </span>
          </div>

          {/* Căn giữa: Tiêu đề & Mô tả */}
          <div className="w-full md:w-2/4 text-center">
            <h2 className="text-xl sm:text-2xl lg:text-[28px] font-black text-slate-900 tracking-tight m-0 whitespace-nowrap">
              Chuẩn bị tốt hơn trước khi ứng tuyển
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium m-0 mt-1">
              Trang bị kiến thức và kỹ năng để tự tin hơn trên hành trình sự nghiệp.
            </p>
          </div>

          {/* Căn phải: Link Khám phá Cẩm nang */}
          <div className="w-full md:w-1/4 flex justify-end">
            <Link
              href="/cam-nang"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#0062ff] hover:text-[#0052cc] transition-colors group whitespace-nowrap"
            >
              <span>Khám phá Cẩm nang nghề nghiệp</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Viết CV hiệu quả */}
          <Link
            href="/cam-nang?category=viet-cv"
            className="bg-[#eff6ff] hover:bg-[#e0f2fe] rounded-[20px] p-5 border border-[#dbeafe] shadow-2xs transition-all flex flex-col justify-between group relative overflow-hidden h-36"
          >
            <div>
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <FileText className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-black text-slate-900 m-0 group-hover:text-[#0062ff] transition-colors">
                  Viết CV hiệu quả
                </h4>
              </div>
              <p className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed m-0">
                Kinh nghiệm tạo CV rõ ràng và thu hút sự chú ý.
              </p>
            </div>

            <div className="flex justify-end">
              <div className="w-7 h-7 rounded-full bg-blue-100 text-[#0062ff] flex items-center justify-center group-hover:bg-[#0062ff] group-hover:text-white transition-colors">
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>
          </Link>

          {/* Card 2: Chuẩn bị phỏng vấn */}
          <Link
            href="/cam-nang?category=phong-van"
            className="bg-[#fff0f3] hover:bg-[#ffe4e6] rounded-[20px] p-5 border border-[#ffe4e6] shadow-2xs transition-all flex flex-col justify-between group relative overflow-hidden h-36"
          >
            <div>
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <MessagesSquare className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-black text-slate-900 m-0 group-hover:text-[#0062ff] transition-colors">
                  Chuẩn bị phỏng vấn
                </h4>
              </div>
              <p className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed m-0">
                Các kinh nghiệm giúp bạn tự tin hơn khi gặp nhà tuyển dụng.
              </p>
            </div>

            <div className="flex justify-end">
              <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-colors">
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>
          </Link>

          {/* Card 3: Lương & chế độ */}
          <Link
            href="/cam-nang?category=luong-thuong"
            className="bg-[#fffbeb] hover:bg-[#fef3c7] rounded-[20px] p-5 border border-[#fef3c7] shadow-2xs transition-all flex flex-col justify-between group relative overflow-hidden h-36"
          >
            <div>
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <CircleDollarSign className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-black text-slate-900 m-0 group-hover:text-[#0062ff] transition-colors">
                  Lương & chế độ
                </h4>
              </div>
              <p className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed m-0">
                Trang bị kiến thức trước khi trao đổi về thu nhập và phúc lợi.
              </p>
            </div>

            <div className="flex justify-end">
              <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>
          </Link>

          {/* Card 4: Kỹ năng nghề nghiệp */}
          <Link
            href="/cam-nang?category=ky-nang"
            className="bg-[#effcf4] hover:bg-[#dcfce7] rounded-[20px] p-5 border border-[#dcfce7] shadow-2xs transition-all flex flex-col justify-between group relative overflow-hidden h-36"
          >
            <div>
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-black text-slate-900 m-0 group-hover:text-[#0062ff] transition-colors">
                  Kỹ năng nghề nghiệp
                </h4>
              </div>
              <p className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed m-0">
                Phát triển những kỹ năng cần thiết cho công việc.
              </p>
            </div>

            <div className="flex justify-end">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 4: CTA CUỐI TRANG (Sẵn sàng cho cơ hội tiếp theo?) */}
      {/* ========================================================================= */}
      <div className="max-w-[1460px] mx-auto px-4 sm:px-6 md:px-8 xl:px-12 w-full pt-8 pb-4">
        <div className="bg-gradient-to-r from-[#002277] via-[#0047cc] to-[#002b88] rounded-[26px] p-6 sm:p-10 text-white flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xl border border-blue-800/50 relative overflow-hidden">
          {/* Subtle glow circle */}
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none" />

          {/* Left Content & Buttons */}
          <div className="space-y-3 text-center lg:text-left z-10 max-w-md">
            <span className="bg-white/15 text-cyan-200 text-[10.5px] font-extrabold uppercase px-3.5 py-1 rounded-full tracking-wider border border-white/20 inline-block">
              CÙNG CAREZA TIẾN XA HƠN
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight m-0 leading-snug">
              Sẵn sàng cho cơ hội tiếp theo?
            </h2>
            <p className="text-xs sm:text-sm text-slate-100 font-normal m-0 leading-relaxed">
              Hoàn thiện hồ sơ và CV để ứng tuyển nhanh hơn khi tìm thấy công việc phù hợp.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Link
                href="/ung-vien/ho-so"
                className="w-full sm:w-auto bg-white hover:bg-blue-50 text-[#0062ff] font-black text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <span>Hoàn thiện hồ sơ</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>

              <Link
                href="/ung-vien/quan-ly-cv"
                className="w-full sm:w-auto bg-white/20 hover:bg-white/30 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all border border-white/40 flex items-center justify-center backdrop-blur-sm"
              >
                Quản lý CV
              </Link>
            </div>
          </div>

          {/* Center Graphic & Script */}
          <div className="hidden xl:flex items-center gap-4 z-10 px-2">
            <div className="text-right leading-tight select-none">
              <span className="block font-serif italic text-base text-cyan-200/90 font-bold">Your Career</span>
              <span className="block font-serif italic text-base text-cyan-300 font-extrabold">Our Support</span>
            </div>

            {/* Paper Plane Flying SVG */}
            <div className="w-8 h-8 text-amber-300 transform -rotate-12">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </div>

            {/* 3D Profile Document Card with Checkmark */}
            <div className="w-24 h-28 relative transform rotate-6">
              <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xl">
                <rect width="100" height="120" rx="14" fill="white" />
                <rect x="12" y="14" width="28" height="28" rx="8" fill="#0062ff" />
                <circle cx="26" cy="24" r="6" fill="white" />
                <path d="M18 38C18 33 21 31 26 31C31 31 34 33 34 38" fill="white" opacity="0.8" />
                <rect x="46" y="18" width="42" height="6" rx="3" fill="#cbd5e1" />
                <rect x="46" y="28" width="28" height="5" rx="2.5" fill="#e2e8f0" />
                <rect x="12" y="52" width="76" height="5" rx="2.5" fill="#e2e8f0" />
                <rect x="12" y="63" width="76" height="5" rx="2.5" fill="#e2e8f0" />
                <rect x="12" y="74" width="55" height="5" rx="2.5" fill="#e2e8f0" />
                <circle cx="20" cy="98" r="12" fill="#22c55e" stroke="white" strokeWidth="2.5" />
                <path d="M15 98L18.5 101.5L25 95" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="74" y="86" width="18" height="22" rx="4" fill="#fbbf24" opacity="0.9" />
              </svg>
            </div>
          </div>

          {/* Right Benefits List */}
          <div className="space-y-3 z-10 shrink-0 w-full lg:w-auto bg-white/10 p-5 sm:p-6 rounded-2xl border border-white/15 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-cyan-200" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-white tracking-wide">Hồ sơ chuyên nghiệp</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-cyan-200" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-white tracking-wide">Ứng tuyển nhanh chóng</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                <Star className="w-4 h-4 text-cyan-200 fill-cyan-200" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-white tracking-wide">Nhiều cơ hội tốt hơn</span>
            </div>
          </div>
        </div>
      </div>

      {/* 7. ADVANCED FILTER DRAWER */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="text-[#0062ff] w-4 h-4 stroke-[2.2]" />
            <span className="font-bold text-slate-800 text-sm">Bộ lọc nâng cao</span>
          </div>
        }
        placement="right"
        onClose={() => setIsAdvancedFilterOpen(false)}
        open={isAdvancedFilterOpen}
        size={320}
      >
        <div className="flex flex-col justify-between h-full space-y-6">
          <div className="space-y-5">
            {/* Cấp bậc */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">Cấp bậc</label>
              <Select
                value={advancedLevel}
                onChange={setAdvancedLevel}
                className="w-full"
                options={["Tất cả", "Thực tập sinh", "Nhân viên", "Trưởng nhóm / Leader", "Trưởng phòng / Manager", "Giám đốc / Director"].map(
                  (val) => ({ value: val, label: val })
                )}
              />
            </div>

            {/* Quy mô công ty */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">Quy mô doanh nghiệp</label>
              <Select
                value={advancedCompanySize}
                onChange={setAdvancedCompanySize}
                className="w-full"
                options={["Tất cả", "Dưới 50 nhân viên", "50 - 200 nhân viên", "200 - 500 nhân viên", "500+ nhân viên"].map(
                  (val) => ({ value: val, label: val })
                )}
              />
            </div>

            {/* Ngày đăng */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">Thời gian đăng tin</label>
              <Select
                value={advancedPostedDate}
                onChange={setAdvancedPostedDate}
                className="w-full"
                options={["Tất cả", "24 giờ qua", "3 ngày qua", "7 ngày qua", "1 tháng qua"].map(
                  (val) => ({ value: val, label: val })
                )}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setAdvancedLevel("Tất cả");
                setAdvancedCompanySize("Tất cả");
                setAdvancedPostedDate("Tất cả");
              }}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
            >
              Đặt lại
            </button>
            <button
              type="button"
              onClick={() => setIsAdvancedFilterOpen(false)}
              className="flex-1 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-blue-700 cursor-pointer shadow-md shadow-primary/20"
            >
              Áp dụng
            </button>
          </div>
        </div>
      </Drawer>

      {/* Global Filter Style Overrides for Clean Modern UI */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-filter-dropdown .ant-select-selector {
          border-radius: 16px !important;
          border-color: #e2e8f0 !important;
          background-color: #f8fafc !important;
          height: 46px !important;
          display: flex !important;
          align-items: center !important;
          font-size: 12px !important;
          font-weight: 700 !important;
          color: #334155 !important;
          transition: all 0.2s ease !important;
          box-shadow: none !important;
        }
        .custom-filter-dropdown .ant-select-selector:hover {
          border-color: #0062ff !important;
          background-color: #ffffff !important;
        }
        .custom-filter-dropdown.ant-select-focused .ant-select-selector {
          border-color: #0062ff !important;
          background-color: #ffffff !important;
          box-shadow: 0 0 0 2px rgba(0, 98, 255, 0.08) !important;
        }
      `,
        }}
      />
    </div>
  );
}

export default function JobSearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
          <Spin size="large" />
        </div>
      }
    >
      <JobSearchForm />
    </Suspense>
  );
}
