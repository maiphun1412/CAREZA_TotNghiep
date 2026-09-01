"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Tag, Select, Spin, App, Drawer, Dropdown } from "antd";
import { AppstoreOutlined, BarsOutlined } from "@ant-design/icons";
import {
  Search,
  Package,
  Users,
  MapPin,
  Star,
  Heart,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ChevronDown,
  SlidersHorizontal,
  Building2,
  Sparkles,
  Laptop,
  TrendingUp,
  Coins,
  Megaphone,
  ShoppingCart,
  Palette,
  Briefcase,
  MessageSquareText,
  Compass,
  Flame,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

// ==================== MOCK DATA DOANH NGHIỆP CHUẨN REFERENCE ====================
const MOCK_COMPANIES = [
  {
    id: "fpt-software",
    name: "FPT Software",
    slogan: "Kiến tạo hạnh phúc bằng công nghệ",
    badge: "Top 1 ngành CNTT",
    badgeColor: "bg-orange-50 text-orange-600 border-orange-100",
    isVerified: true,
    isFeatured: true,
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/11/FPT_logo_2010.svg",
    buildingImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80",
    size: "10.000+ nhân viên",
    sizeKey: "1000+",
    industry: "Công nghệ thông tin",
    location: "Hà Nội, TP. Hồ Chí Minh",
    rating: 4.8,
    reviewCount: "1.2K",
    openJobs: 45,
    isTopHiring: true,
  },
  {
    id: "viettel-group",
    name: "Tập đoàn Viettel",
    slogan: "Sáng tạo vì con người",
    badge: "Doanh nghiệp hàng đầu",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-100",
    isVerified: true,
    isFeatured: true,
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/fe/Viettel_logo_2021.svg",
    buildingImage: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=400&q=80",
    size: "10.000+ nhân viên",
    sizeKey: "1000+",
    industry: "Viễn thông",
    location: "Toàn quốc",
    rating: 4.7,
    reviewCount: "1.1K",
    openJobs: 62,
    isTopHiring: true,
  },
  {
    id: "grab-vietnam",
    name: "Grab Việt Nam",
    slogan: "Đồng hành, phát triển từng ngày",
    badge: "Môi trường năng động",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-100",
    isVerified: true,
    isFeatured: true,
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Grab_Logo.svg",
    buildingImage: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=400&q=80",
    size: "1.000 - 5.000 nhân viên",
    sizeKey: "1000+",
    industry: "Công nghệ / Dịch vụ",
    location: "TP. Hồ Chí Minh",
    rating: 4.6,
    reviewCount: "532",
    openJobs: 28,
    isTopHiring: false,
  },
  {
    id: "shopee-vietnam",
    name: "Shopee Việt Nam",
    slogan: "Cùng nhau tạo nên điều lớn hơn",
    badge: "Được yêu thích",
    badgeColor: "bg-orange-50 text-orange-600 border-orange-100",
    isVerified: true,
    isFeatured: true,
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Shopee_logo.svg",
    buildingImage: "https://images.unsplash.com/photo-1556742049-0a67e5572273?auto=format&fit=crop&w=400&q=80",
    size: "5.000 - 10.000 nhân viên",
    sizeKey: "1000+",
    industry: "Thương mại điện tử",
    location: "TP. Hồ Chí Minh",
    rating: 4.6,
    reviewCount: "980",
    openJobs: 54,
    isTopHiring: true,
  },
  {
    id: "zalo-group",
    name: "Zalo Group",
    slogan: "Kết nối giá trị, lan tỏa niềm vui",
    badge: "Nổi bật",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-100",
    isVerified: true,
    isFeatured: true,
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg",
    buildingImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80",
    size: "1.000 - 5.000 nhân viên",
    sizeKey: "1000+",
    industry: "Công nghệ thông tin",
    location: "Hà Nội",
    rating: 4.5,
    reviewCount: "420",
    openJobs: 21,
    isTopHiring: false,
  },
  {
    id: "vng-corporation",
    name: "VNG Corporation",
    slogan: "Build technologies for a better life",
    badge: "Sáng tạo không giới hạn",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-100",
    isVerified: true,
    isFeatured: true,
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/VNG_Corp._logo.svg",
    buildingImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=400&q=80",
    size: "1.000 - 5.000 nhân viên",
    sizeKey: "1000+",
    industry: "Công nghệ thông tin",
    location: "TP. Hồ Chí Minh",
    rating: 4.5,
    reviewCount: "811",
    openJobs: 38,
    isTopHiring: true,
  },
  {
    id: "momo-mservice",
    name: "MoMo",
    slogan: "Vì một xã hội không tiền mặt",
    badge: "Top 1 Fintech",
    badgeColor: "bg-pink-50 text-pink-700 border-pink-100",
    isVerified: true,
    isFeatured: true,
    logo: "https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png",
    buildingImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=400&q=80",
    size: "1.000 - 5.000 nhân viên",
    sizeKey: "1000+",
    industry: "Tài chính – Công nghệ",
    location: "TP. Hồ Chí Minh",
    rating: 4.6,
    reviewCount: "380",
    openJobs: 31,
    isTopHiring: false,
  },
  {
    id: "vinai-research",
    name: "VinAI",
    slogan: "AI for a better tomorrow",
    badge: "Đổi mới sáng tạo",
    badgeColor: "bg-cyan-50 text-cyan-700 border-cyan-100",
    isVerified: true,
    isFeatured: true,
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/VinAI_Logo.png/640px-VinAI_Logo.png",
    buildingImage: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=400&q=80",
    size: "500 - 1.000 nhân viên",
    sizeKey: "200-1000",
    industry: "Trí tuệ nhân tạo",
    location: "Hà Nội",
    rating: 4.7,
    reviewCount: "300",
    openJobs: 19,
    isTopHiring: false,
  },
];

// Danh mục bộ lọc tiếng Việt
const CATEGORIES = [
  "Tất cả ngành",
  "Công nghệ thông tin",
  "Tài chính – Ngân hàng",
  "Thương mại điện tử",
  "Viễn thông",
  "Marketing",
  "Giáo dục",
  "Y tế",
];

const COMPANY_SIZES = [
  "Tất cả quy mô",
  "Dưới 50 nhân viên",
  "50 - 200 nhân viên",
  "200 - 1.000 nhân viên",
  "1.000 - 5.000 nhân viên",
  "5.000+ nhân viên",
];

const LOCATIONS = ["Toàn quốc", "TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Bình Dương", "Đồng Nai"];
const RATINGS = ["Tất cả", "Từ 4.5 sao trở lên", "Từ 4.0 sao trở lên", "Từ 3.5 sao trở lên"];

// Popular search tags
const POPULAR_SEARCHES = [
  "Công nghệ",
  "Tài chính",
  "Giáo dục",
  "Thương mại điện tử",
  "Y tế",
  "Marketing",
];

// Khám phá theo ngành nghề (Section A)
const INDUSTRY_CATEGORIES = [
  {
    name: "Công nghệ thông tin",
    count: "450+ doanh nghiệp",
    icon: Laptop,
    color: "bg-blue-50 text-blue-600 border-blue-100/80 hover:bg-blue-100/60",
    iconBg: "bg-blue-500 text-white",
  },
  {
    name: "Kinh doanh",
    count: "320+ doanh nghiệp",
    icon: TrendingUp,
    color: "bg-emerald-50 text-emerald-600 border-emerald-100/80 hover:bg-emerald-100/60",
    iconBg: "bg-emerald-500 text-white",
  },
  {
    name: "Tài chính – Ngân hàng",
    count: "210+ doanh nghiệp",
    icon: Coins,
    color: "bg-amber-50 text-amber-700 border-amber-100/80 hover:bg-amber-100/60",
    iconBg: "bg-amber-500 text-white",
  },
  {
    name: "Marketing",
    count: "180+ doanh nghiệp",
    icon: Megaphone,
    color: "bg-purple-50 text-purple-600 border-purple-100/80 hover:bg-purple-100/60",
    iconBg: "bg-purple-500 text-white",
  },
  {
    name: "Thương mại điện tử",
    count: "160+ doanh nghiệp",
    icon: ShoppingCart,
    color: "bg-orange-50 text-orange-600 border-orange-100/80 hover:bg-orange-100/60",
    iconBg: "bg-orange-500 text-white",
  },
  {
    name: "Thiết kế",
    count: "120+ doanh nghiệp",
    icon: Palette,
    color: "bg-pink-50 text-pink-600 border-pink-100/80 hover:bg-pink-100/60",
    iconBg: "bg-pink-500 text-white",
  },
];

// ==================== MAIN COMPONENT ====================
function CompanyExplorerContent() {
  const { message } = App.useApp();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  // Search & Filter state
  const [keyword, setKeyword] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "Tất cả ngành");
  const [size, setSize] = useState(searchParams.get("size") || "Tất cả quy mô");
  const [location, setLocation] = useState(searchParams.get("location") || "Toàn quốc");
  const [rating, setRating] = useState(searchParams.get("rating") || "Tất cả");

  // Navigation tab state: 'all' | 'featured' | 'reviews' | 'verified' | 'following' | 'top_hiring'
  const [activeTab, setActiveTab] = useState<string>("all");
  const [sortBy, setSortBy] = useState("relevance");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [pageSize, setPageSize] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);

  // Sync activeTab with URL searchParams (e.g. ?tab=featured or ?filter=verified)
  const tabParam = searchParams.get("tab") || searchParams.get("filter");
  useEffect(() => {
    if (tabParam) {
      if (tabParam === "featured") setActiveTab("featured");
      else if (tabParam === "reviews" || tabParam === "review") setActiveTab("reviews");
      else if (tabParam === "verified") setActiveTab("verified");
      else if (tabParam === "following" || tabParam === "favorite") setActiveTab("following");
      else if (tabParam === "top_hiring") setActiveTab("top_hiring");
      else setActiveTab("all");
    } else {
      setActiveTab("all");
    }
  }, [tabParam]);

  // Followed companies state
  const [followedIds, setFollowedIds] = useState<string[]>(["fpt-software", "vng-corporation", "grab-vietnam"]);
  const [loading, setLoading] = useState(false);

  // Toggle follow company
  const handleToggleFollow = (e: React.MouseEvent, companyId: string, companyName: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push(`/dang-nhap?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (followedIds.includes(companyId)) {
      setFollowedIds((prev) => prev.filter((id) => id !== companyId));
      message.success(`Đã bỏ theo dõi ${companyName}`);
    } else {
      setFollowedIds((prev) => [...prev, companyId]);
      message.success(`Đang theo dõi ${companyName}`);
    }
  };

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    const params = new URLSearchParams(searchParams.toString());
    if (newTab === "all") {
      params.delete("tab");
      params.delete("filter");
    } else {
      params.set("tab", newTab);
      params.delete("filter");
    }
    const queryStr = params.toString();
    router.replace(queryStr ? `/cong-ty?${queryStr}` : `/cong-ty`, { scroll: false });
  };

  // Handle Search Trigger
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 250);
  };

  // Filtered companies
  const filteredCompanies = useMemo(() => {
    return MOCK_COMPANIES.filter((comp) => {
      // Tab filter
      if (activeTab === "featured" && !comp.isFeatured) return false;
      if ((activeTab === "following" || activeTab === "favorite") && !followedIds.includes(comp.id)) return false;
      if (activeTab === "verified" && !comp.isVerified) return false;
      if (activeTab === "reviews" && (comp.rating < 4.5 || !comp.reviewCount)) return false;
      if (activeTab === "top_hiring" && !comp.isTopHiring) return false;

      // Keyword
      if (keyword.trim()) {
        const q = keyword.toLowerCase().trim();
        const matchName = comp.name.toLowerCase().includes(q);
        const matchInd = comp.industry.toLowerCase().includes(q);
        const matchSlogan = comp.slogan.toLowerCase().includes(q);
        if (!matchName && !matchInd && !matchSlogan) return false;
      }

      // Category
      if (category !== "Tất cả ngành" && !comp.industry.includes(category)) return false;

      // Location
      if (location !== "Toàn quốc" && !comp.location.includes(location)) return false;

      // Rating
      if (rating === "Từ 4.5 sao trở lên" && comp.rating < 4.5) return false;
      if (rating === "Từ 4.0 sao trở lên" && comp.rating < 4.0) return false;

      return true;
    });
  }, [keyword, category, location, rating, activeTab, followedIds]);

  return (
    <div className="w-full bg-[#f8fafc] min-h-screen flex flex-col font-sans pb-16">
      
      {/* ========================================================================= */}
      {/* 1. HERO / BANNER SECTION (Sử dụng /images/conty.png làm visual chính) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden bg-[#0047cc] text-white min-h-[380px] lg:min-h-[440px] flex items-center">
        {/* Background Image conty.png */}
        <div
          className="absolute inset-0 bg-no-repeat bg-cover bg-right lg:bg-center pointer-events-none"
          style={{
            backgroundImage: "url('/images/conty.png')",
          }}
        />

        <div className="max-w-[1460px] mx-auto px-4 sm:px-6 md:px-8 xl:px-12 pt-8 pb-20 lg:pt-12 lg:pb-24 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Cột trái: Tiêu đề & Thông tin khám phá */}
            <div className="lg:col-span-7 space-y-5">
              {/* Badge nhỏ */}
              <div className="inline-block">
                <span className="bg-white/15 backdrop-blur-md text-white text-[11px] font-extrabold uppercase px-3.5 py-1 rounded-full tracking-wider border border-white/20">
                  NHỮNG DOANH NGHIỆP TẠO NÊN GIÁ TRỊ THẬT
                </span>
              </div>

              {/* Tiêu đề lớn */}
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.15] m-0">
                Cùng khám phá
                <br />
                những công ty{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38bdf8] via-[#67e8f9] to-[#ffffff]">
                  tuyệt vời
                </span>
              </h1>

              {/* Mô tả ngắn */}
              <p className="text-slate-100 text-sm sm:text-base font-medium max-w-lg leading-relaxed m-0 drop-shadow-sm">
                Nơi môi trường làm việc lý tưởng gặp gỡ những con người tài năng. Khám phá nơi phù hợp nhất với hành trình sự nghiệp của bạn.
              </p>

              {/* 3 chỉ số nhỏ */}
              <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-2 max-w-md">
                {/* 1. Doanh nghiệp */}
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-cyan-300 shrink-0">
                    <Users className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="text-base sm:text-lg font-black text-white block leading-tight">2.300+</span>
                    <span className="text-[11px] text-blue-100 font-medium block leading-tight">doanh nghiệp uy tín</span>
                  </div>
                </div>

                {/* 2. Công ty hàng đầu */}
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-blue-200 shrink-0">
                    <Building2 className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="text-base sm:text-lg font-black text-white block leading-tight">100+</span>
                    <span className="text-[11px] text-blue-100 font-medium block leading-tight">công ty hàng đầu</span>
                  </div>
                </div>

                {/* 3. Đánh giá */}
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-amber-300 shrink-0">
                    <Star className="w-5 h-5 fill-amber-300 text-amber-300" />
                  </div>
                  <div>
                    <span className="text-base sm:text-lg font-black text-white block leading-tight">4.8/5</span>
                    <span className="text-[11px] text-blue-100 font-medium block leading-tight">đánh giá từ nhân viên</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cột phải: Để trống để lộ Careza Headquarters trong ảnh conty.png */}
            <div className="hidden lg:block lg:col-span-5 h-[260px] relative pointer-events-none">
              <div className="absolute top-2 right-4 text-right">
                <span className="font-serif italic text-white/90 text-sm sm:text-base block drop-shadow-md">
                  Great Companies
                </span>
                <span className="font-serif italic text-cyan-300 text-sm sm:text-base block drop-shadow-md">
                  Greater Impact
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SEARCH & FILTER CONTAINER (Overlap nhẹ dưới đáy banner) */}
      {/* ========================================================================= */}
      <div className="max-w-[1460px] mx-auto px-4 sm:px-6 md:px-8 xl:px-12 w-full -mt-10 sm:-mt-12 relative z-30">
        <div className="bg-white rounded-[28px] p-5 sm:p-6 shadow-[0_16px_40px_rgba(0,18,50,0.08)] border border-slate-100/80 space-y-4">
          
          {/* Main Filter Row */}
          <form onSubmit={handleSearch} className="flex flex-col sm:grid sm:grid-cols-2 md:grid-cols-3 xl:flex xl:flex-row xl:items-center gap-2.5">
            
            {/* 1. Search Box */}
            <div className="w-full xl:flex-[2.2] xl:min-w-[250px] relative flex items-center bg-white rounded-2xl border border-slate-200/90 px-3.5 py-2 hover:border-[#0062ff] focus-within:border-[#0062ff] focus-within:shadow-[0_0_0_2px_rgba(0,98,255,0.1)] transition-all h-[56px]">
              <Search className="text-[#0062ff] w-5 h-5 mr-2 shrink-0 stroke-[2.2]" />
              <input
                type="text"
                placeholder="Tìm kiếm công ty, lĩnh vực..."
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
              <div className="w-full xl:flex-1 xl:min-w-[135px] bg-white border border-slate-200/90 hover:border-[#0062ff] rounded-2xl px-2.5 py-2 flex items-center justify-between gap-1 h-[56px] transition-all cursor-pointer group shadow-xs">
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

            {/* 3. Quy mô công ty */}
            <Dropdown
              menu={{
                items: COMPANY_SIZES.map((s) => ({
                  key: s,
                  label: <span className="font-semibold text-xs py-1 block">{s}</span>,
                  onClick: () => setSize(s),
                })),
                selectedKeys: [size],
              }}
              trigger={["click"]}
            >
              <div className="w-full xl:flex-1 xl:min-w-[135px] bg-white border border-slate-200/90 hover:border-[#0062ff] rounded-2xl px-2.5 py-2 flex items-center justify-between gap-1 h-[56px] transition-all cursor-pointer group shadow-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <Users className="text-[#0062ff] w-5 h-5 shrink-0 stroke-[2.2]" />
                  <div className="min-w-0 text-left">
                    <span className="text-[11px] font-bold text-slate-800 leading-tight block truncate">Quy mô công ty</span>
                    <span className="text-[11px] text-slate-500 font-normal leading-tight block truncate mt-0.5">{size}</span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0062ff] shrink-0 transition-colors stroke-[2]" />
              </div>
            </Dropdown>

            {/* 4. Địa điểm */}
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
              <div className="w-full xl:flex-1 xl:min-w-[125px] bg-white border border-slate-200/90 hover:border-[#0062ff] rounded-2xl px-2.5 py-2 flex items-center justify-between gap-1 h-[56px] transition-all cursor-pointer group shadow-xs">
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

            {/* 5. Đánh giá */}
            <Dropdown
              menu={{
                items: RATINGS.map((r) => ({
                  key: r,
                  label: <span className="font-semibold text-xs py-1 block">{r}</span>,
                  onClick: () => setRating(r),
                })),
                selectedKeys: [rating],
              }}
              trigger={["click"]}
            >
              <div className="w-full xl:flex-1 xl:min-w-[125px] bg-white border border-slate-200/90 hover:border-[#0062ff] rounded-2xl px-2.5 py-2 flex items-center justify-between gap-1 h-[56px] transition-all cursor-pointer group shadow-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <Star className="text-[#0062ff] w-5 h-5 shrink-0 stroke-[2.2]" />
                  <div className="min-w-0 text-left">
                    <span className="text-[11px] font-bold text-slate-800 leading-tight block truncate">Đánh giá</span>
                    <span className="text-[11px] text-slate-500 font-normal leading-tight block truncate mt-0.5">{rating}</span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0062ff] shrink-0 transition-colors stroke-[2]" />
              </div>
            </Dropdown>

            {/* 6. Nút Tìm kiếm */}
            <button
              type="submit"
              className="w-full xl:w-auto bg-[#0062ff] hover:bg-[#0052cc] text-white font-extrabold text-xs sm:text-sm px-7 py-3 rounded-2xl transition-all shadow-md shadow-blue-600/30 flex items-center justify-center h-[56px] shrink-0 cursor-pointer border-none"
            >
              Tìm kiếm
            </button>

          </form>

          {/* Bottom Row: Popular searches */}
          <div className="flex flex-wrap items-center gap-2 pt-3.5 border-t border-slate-100 text-xs">
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

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. NAVIGATION TABS + CONTROLS */}
      {/* ========================================================================= */}
      <div className="max-w-[1460px] mx-auto px-4 sm:px-6 md:px-8 xl:px-12 w-full pt-8 pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-3">
          
          {/* Tabs bên trái */}
          <div className="flex items-center gap-2 sm:gap-5 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => handleTabChange("all")}
              className={`pb-2.5 text-xs sm:text-[13px] font-bold transition-all relative whitespace-nowrap cursor-pointer bg-transparent border-none ${
                activeTab === "all" ? "text-[#0062ff]" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Tất cả công ty
              {activeTab === "all" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0062ff] rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("featured")}
              className={`pb-2.5 text-xs sm:text-[13px] font-bold transition-all relative whitespace-nowrap cursor-pointer bg-transparent border-none ${
                activeTab === "featured" ? "text-[#0062ff]" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Công ty nổi bật
              {activeTab === "featured" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0062ff] rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("reviews")}
              className={`pb-2.5 text-xs sm:text-[13px] font-bold transition-all relative whitespace-nowrap cursor-pointer bg-transparent border-none ${
                activeTab === "reviews" ? "text-[#0062ff]" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Đánh giá cao
              {activeTab === "reviews" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0062ff] rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("verified")}
              className={`pb-2.5 text-xs sm:text-[13px] font-bold transition-all relative whitespace-nowrap cursor-pointer bg-transparent border-none ${
                activeTab === "verified" ? "text-[#0062ff]" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Đã xác thực
              {activeTab === "verified" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0062ff] rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("following")}
              className={`pb-2.5 text-xs sm:text-[13px] font-bold transition-all relative whitespace-nowrap cursor-pointer bg-transparent border-none ${
                activeTab === "following" || activeTab === "favorite" ? "text-[#0062ff]" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Đang theo dõi ({followedIds.length})
              {(activeTab === "following" || activeTab === "favorite") && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0062ff] rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("top_hiring")}
              className={`pb-2.5 text-xs sm:text-[13px] font-bold transition-all relative whitespace-nowrap cursor-pointer bg-transparent border-none ${
                activeTab === "top_hiring" ? "text-[#0062ff]" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Đang tuyển dụng nhiều
              {activeTab === "top_hiring" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0062ff] rounded-full" />
              )}
            </button>
          </div>

          {/* Sắp xếp & Chế độ xem bên phải */}
          <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-bold">Sắp xếp:</span>
              <Select
                value={sortBy}
                onChange={setSortBy}
                style={{ width: 140 }}
                options={[
                  { value: "relevance", label: "Phù hợp nhất" },
                  { value: "rating", label: "Đánh giá cao nhất" },
                  { value: "hiring", label: "Tuyển dụng nhiều nhất" },
                ]}
                className="text-xs font-semibold"
              />
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg flex items-center justify-center transition-all cursor-pointer border-none ${
                  viewMode === "grid" ? "bg-white text-[#0062ff] shadow-xs font-bold" : "text-slate-400 hover:text-slate-600 bg-transparent"
                }`}
                title="Dạng lưới"
              >
                <AppstoreOutlined className="text-base" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg flex items-center justify-center transition-all cursor-pointer border-none ${
                  viewMode === "list" ? "bg-white text-[#0062ff] shadow-xs font-bold" : "text-slate-400 hover:text-slate-600 bg-transparent"
                }`}
                title="Dạng danh sách"
              >
                <BarsOutlined className="text-base" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. COMPANY GRID (4 Card / Hàng trên Desktop) */}
      {/* ========================================================================= */}
      <div className="max-w-[1460px] mx-auto px-4 sm:px-6 md:px-8 xl:px-12 w-full pt-2">
        {loading ? (
          <div className="flex items-center justify-center p-24 bg-white rounded-3xl border border-slate-100 shadow-xs">
            <Spin size="large" />
          </div>
        ) : filteredCompanies.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                : "flex flex-col gap-4"
            }
          >
            {filteredCompanies.map((company, idx) => {
              const isFollowed = followedIds.includes(company.id);

              return (
                <div
                  key={company.id || `comp-${idx}`}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_25px_rgba(0,30,100,0.07)] hover:border-blue-300 transition-all duration-200 flex flex-col justify-between group relative"
                >
                  <div>
                    {/* Top Row: Logo + Badge + Mini Building Photo + Heart */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      {/* Logo + Badge */}
                      <div className="space-y-2">
                        <div className="w-11 h-11 rounded-xl bg-white border border-slate-100 p-1 flex items-center justify-center shrink-0 shadow-2xs">
                          <img
                            src={company.logo}
                            alt={company.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=80&h=80&q=80";
                            }}
                          />
                        </div>
                        {company.badge && (
                          <span
                            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border ${company.badgeColor}`}
                          >
                            {company.badge}
                          </span>
                        )}
                      </div>

                      {/* Mini Building Thumbnail + Heart Button */}
                      <div className="flex items-start gap-2">
                        <div className="w-18 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 shrink-0">
                          <img
                            src={company.buildingImage}
                            alt={company.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleToggleFollow(e, company.id, company.name)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer border-none bg-transparent shrink-0"
                          title={isFollowed ? "Bỏ theo dõi" : "Theo dõi công ty"}
                        >
                          <Heart
                            className={`w-4 h-4 transition-colors ${
                              isFollowed ? "fill-rose-500 text-rose-500" : "text-slate-400 hover:text-slate-600 stroke-[1.8]"
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Company Name & Slogan */}
                    <div className="mt-1">
                      <Link href={`/cong-ty/${company.id}`} className="block group-hover:text-[#0062ff] transition-colors">
                        <h3 className="text-[15px] font-black text-slate-900 line-clamp-1 m-0 group-hover:text-[#0062ff] transition-colors leading-snug flex items-center gap-1.5">
                          <span>{company.name}</span>
                          {company.isVerified && (
                            <CheckCircle2 className="w-3.5 h-3.5 fill-[#0062ff] text-white shrink-0" />
                          )}
                        </h3>
                      </Link>
                      <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5 mb-2.5">
                        {company.slogan}
                      </p>
                    </div>

                    {/* Metadata items: Quy mô, Ngành nghề, Địa điểm */}
                    <div className="space-y-1 text-xs text-slate-600 font-medium py-2 border-t border-slate-100/80">
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-slate-400 stroke-[2] shrink-0" />
                        <span className="truncate">{company.size}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="w-3.5 h-3.5 text-slate-400 stroke-[2] shrink-0" />
                        <span className="truncate">{company.industry}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 stroke-[2] shrink-0" />
                        <span className="truncate">{company.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Rating & CTA */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100/80 text-xs mt-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-extrabold text-slate-800">{company.rating}</span>
                      <span className="text-[11px] text-slate-400">({company.reviewCount} đánh giá)</span>
                    </div>

                    <Link
                      href={`/cong-ty/${company.id}`}
                      className="text-[#0062ff] font-bold text-xs hover:underline flex items-center gap-1"
                    >
                      <span>Xem công ty</span>
                      <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                    </Link>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-xs">
            <span className="material-symbols-outlined text-slate-300 text-6xl mb-3 block">search_off</span>
            <h3 className="text-base font-bold text-slate-700 m-0">Không tìm thấy công ty phù hợp</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Hãy thử điều chỉnh lại từ khóa hoặc xóa bớt tiêu chí trong bộ lọc tìm kiếm.
            </p>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. PAGINATION SECTION */}
      {/* ========================================================================= */}
      <div className="max-w-[1460px] mx-auto px-4 sm:px-6 md:px-8 xl:px-12 w-full pt-10 pb-4">
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
              onClick={() => setCurrentPage(288)}
              className="w-8 h-8 rounded-full bg-transparent text-slate-600 hover:bg-slate-100 font-semibold text-xs transition-colors cursor-pointer border-none"
            >
              288
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
                { value: 12, label: "12 công ty/trang" },
                { value: 24, label: "24 công ty/trang" },
                { value: 48, label: "48 công ty/trang" },
              ]}
              className="text-xs font-semibold"
            />
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. SECTION 1: DOANH NGHIỆP ĐANG TUYỂN DỤNG TÍCH CỰC */}
      {/* ========================================================================= */}
      <div className="max-w-[1460px] mx-auto px-4 sm:px-6 md:px-8 xl:px-12 w-full pt-10 pb-4">
        <div className="mb-6 text-center max-w-2xl mx-auto">
          <span className="inline-block px-3 py-1 bg-blue-50 text-[#0062ff] text-[11px] font-extrabold rounded-full uppercase tracking-wider mb-2 border border-blue-100/70">
            CƠ HỘI NGHỀ NGHIỆP
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight m-0">
            Doanh nghiệp đang tuyển dụng tích cực
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium m-0 mt-1.5">
            Khám phá những công ty đang mở nhiều cơ hội việc làm trên Careza.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {MOCK_COMPANIES.filter((c) => c.openJobs && c.openJobs > 0).slice(0, 4).map((comp, idx) => {
            const THEMES = [
              {
                // FPT: Nền trắng + Loang xanh dương
                border: "border-slate-200/90 hover:border-blue-300",
                badge: "bg-blue-50 text-[#0062ff] border-blue-100",
                dot: "bg-[#0062ff]",
                btn: "bg-slate-50 hover:bg-[#0062ff] hover:text-white text-[#0062ff] border-slate-200/80 hover:border-[#0062ff]",
                glow1: "bg-blue-400/20",
                glow2: "bg-cyan-300/25",
              },
              {
                // Viettel: Nền trắng + Loang hồng đỏ
                border: "border-slate-200/90 hover:border-rose-300",
                badge: "bg-rose-50 text-rose-600 border-rose-100",
                dot: "bg-rose-500",
                btn: "bg-slate-50 hover:bg-rose-600 hover:text-white text-rose-600 border-slate-200/80 hover:border-rose-600",
                glow1: "bg-rose-400/20",
                glow2: "bg-pink-300/25",
              },
              {
                // Grab: Nền trắng + Loang xanh lá
                border: "border-slate-200/90 hover:border-emerald-300",
                badge: "bg-emerald-50 text-emerald-600 border-emerald-100",
                dot: "bg-emerald-500",
                btn: "bg-slate-50 hover:bg-emerald-600 hover:text-white text-emerald-600 border-slate-200/80 hover:border-emerald-600",
                glow1: "bg-emerald-400/20",
                glow2: "bg-teal-300/25",
              },
              {
                // Shopee: Nền trắng + Loang vàng cam
                border: "border-slate-200/90 hover:border-amber-300",
                badge: "bg-amber-50 text-amber-700 border-amber-100",
                dot: "bg-amber-500",
                btn: "bg-slate-50 hover:bg-amber-600 hover:text-white text-amber-700 border-slate-200/80 hover:border-amber-600",
                glow1: "bg-amber-400/20",
                glow2: "bg-orange-300/25",
              },
            ];
            const theme = THEMES[idx % THEMES.length];

            return (
              <div
                key={`hiring-${comp.id}`}
                className={`bg-white rounded-[24px] p-5 border ${theme.border} shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden`}
              >
                {/* Vệt màu loang Gradient trên nền trắng */}
                <div className={`absolute -top-8 -right-8 w-36 h-36 ${theme.glow1} rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500`} />
                <div className={`absolute -bottom-8 -left-8 w-32 h-32 ${theme.glow2} rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500`} />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-white p-1.5 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform border border-slate-100">
                      <img
                        src={comp.logo}
                        alt={comp.name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <span className={`text-[11px] font-extrabold ${theme.badge} px-3 py-1 rounded-full border shadow-2xs flex items-center gap-1.5 backdrop-blur-xs`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${theme.dot} animate-pulse`} />
                      {comp.openJobs} việc làm
                    </span>
                  </div>

                  <Link href={`/cong-ty/${comp.id}`} className="block group-hover:text-[#0062ff] transition-colors">
                    <h4 className="text-base font-black text-slate-900 m-0 truncate flex items-center gap-1">
                      <span>{comp.name}</span>
                      {comp.isVerified && (
                        <CheckCircle2 className="w-3.5 h-3.5 fill-[#0062ff] text-white shrink-0" />
                      )}
                    </h4>
                  </Link>

                  <p className="text-xs text-slate-500 font-medium m-0 truncate mt-1">
                    {comp.industry} · {comp.location.split(",")[0]}
                  </p>
                </div>

                <div className="pt-4 mt-3 relative z-10">
                  <Link
                    href={`/viec-lam?q=${encodeURIComponent(comp.name)}`}
                    className={`${theme.btn} font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-2xs border inline-flex items-center justify-between w-full transition-all hover:scale-[1.02]`}
                  >
                    <span>Xem việc làm</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>



      {/* ========================================================================= */}
      {/* 8. SECTION 3: TÌM HIỂU TRƯỚC KHI ỨNG TUYỂN */}
      {/* ========================================================================= */}
      <div className="max-w-[1460px] mx-auto px-4 sm:px-6 md:px-8 xl:px-12 w-full pt-10 pb-4">
        <div className="mb-7 text-center max-w-2xl mx-auto">
          <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 text-[11px] font-extrabold rounded-full uppercase tracking-wider mb-2 border border-amber-200/80">
            GÓC NHÌN ĐA CHIỀU
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight m-0">
            Tìm hiểu trước khi ứng tuyển
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium m-0 mt-1.5">
            Hiểu rõ môi trường, văn hóa và trải nghiệm làm việc trước khi đưa ra lựa chọn.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Đánh giá công ty */}
          <div className="bg-white rounded-[24px] p-6 border border-slate-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <MessageSquareText className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className="text-[10.5px] font-extrabold text-slate-700 bg-slate-100/80 px-2.5 py-1 rounded-full border border-slate-200/80 shadow-2xs">
                  Minh bạch & Thực tế
                </span>
              </div>

              <h3 className="text-lg font-black text-slate-900 m-0 group-hover:text-[#0062ff] transition-colors">
                Đánh giá công ty
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed m-0">
                Xem chia sẻ và đánh giá thực tế về môi trường làm việc, chế độ đãi ngộ và văn hóa doanh nghiệp từ nhân viên.
              </p>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-100">
              <Link
                href="/cong-ty"
                onClick={() => {
                  setActiveTab("favorite");
                  window.scrollTo({ top: 350, behavior: "smooth" });
                }}
                className="bg-slate-50 hover:bg-[#0062ff] hover:text-white text-[#0062ff] font-extrabold text-xs px-4 py-2.5 rounded-xl border border-slate-200/80 shadow-2xs inline-flex items-center justify-between w-full transition-all group/btn"
              >
                <span>Khám phá đánh giá</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform stroke-[2.5]" />
              </Link>
            </div>
          </div>

          {/* Card 2: Văn hóa & môi trường */}
          <div className="bg-white rounded-[24px] p-6 border border-slate-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0062ff] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <Building2 className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className="text-[10.5px] font-extrabold text-slate-700 bg-slate-100/80 px-2.5 py-1 rounded-full border border-slate-200/80 shadow-2xs">
                  Không gian & Giá trị
                </span>
              </div>

              <h3 className="text-lg font-black text-slate-900 m-0 group-hover:text-[#0062ff] transition-colors">
                Văn hóa & môi trường
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed m-0">
                Tìm hiểu cách các doanh nghiệp hàng đầu xây dựng môi trường làm việc truyền cảm hứng và chiến lược phát triển nhân sự.
              </p>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-100">
              <Link
                href="/cong-ty"
                onClick={() => {
                  setActiveTab("all");
                  window.scrollTo({ top: 350, behavior: "smooth" });
                }}
                className="bg-slate-50 hover:bg-[#0062ff] hover:text-white text-[#0062ff] font-extrabold text-xs px-4 py-2.5 rounded-xl border border-slate-200/80 shadow-2xs inline-flex items-center justify-between w-full transition-all group/btn"
              >
                <span>Khám phá công ty</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform stroke-[2.5]" />
              </Link>
            </div>
          </div>

          {/* Card 3: Việc làm đang tuyển */}
          <div className="bg-white rounded-[24px] p-6 border border-slate-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <Briefcase className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className="text-[10.5px] font-extrabold text-slate-700 bg-slate-100/80 px-2.5 py-1 rounded-full border border-slate-200/80 shadow-2xs">
                  Cơ hội mở rộng
                </span>
              </div>

              <h3 className="text-lg font-black text-slate-900 m-0 group-hover:text-[#0062ff] transition-colors">
                Việc làm đang tuyển
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed m-0">
                Khám phá hàng ngàn vị trí tuyển dụng hấp dẫn với mức thu nhập cạnh tranh tại các thương hiệu hàng đầu.
              </p>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-100">
              <Link
                href="/viec-lam"
                className="bg-slate-50 hover:bg-[#0062ff] hover:text-white text-[#0062ff] font-extrabold text-xs px-4 py-2.5 rounded-xl border border-slate-200/80 shadow-2xs inline-flex items-center justify-between w-full transition-all group/btn"
              >
                <span>Xem việc làm</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform stroke-[2.5]" />
              </Link>
            </div>
          </div>
        </div>
      </div>



      {/* ========================================================================= */}
      {/* 10. SECTION 5: CẨM NANG DOANH NGHIỆP / NGHỀ NGHIỆP */}
      {/* ========================================================================= */}
      <div className="max-w-[1460px] mx-auto px-4 sm:px-6 md:px-8 xl:px-12 w-full pt-10 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
          <div>
            <span className="inline-block px-3 py-1 bg-blue-50 text-[#0062ff] text-[11px] font-extrabold rounded-full uppercase tracking-wider mb-2 border border-blue-100/70">
              CẨM NANG DOANH NGHIỆP
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight m-0">
              Hiểu doanh nghiệp, chọn đúng môi trường
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium m-0 mt-1">
              Trang bị kiến thức và góc nhìn thực tế giúp bạn chọn đúng nơi gắn bó sự nghiệp lâu dài.
            </p>
          </div>

          <Link
            href="/cam-nang"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#0062ff] hover:text-[#0052cc] transition-colors shrink-0 group pb-1"
          >
            <span>Khám phá Cẩm nang nghề nghiệp</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Article 1 */}
          <Link
            href="/cam-nang?category=doanh-nghiep"
            className="bg-white rounded-[24px] p-6 border border-slate-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div>
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-[10.5px] font-extrabold text-[#0062ff] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                  Cẩm nang ứng tuyển
                </span>
                <span className="text-[11px] font-medium text-slate-400">
                  4 phút đọc
                </span>
              </div>

              <h4 className="text-base font-black text-slate-900 m-0 group-hover:text-[#0062ff] transition-colors leading-snug">
                Cách tìm hiểu doanh nghiệp trước khi nộp hồ sơ
              </h4>
              <p className="text-xs text-slate-500 font-medium mt-2.5 line-clamp-3 leading-relaxed m-0">
                Những nguồn thông tin uy tín và bộ tiêu chí cần đánh giá kỹ lưỡng để chọn doanh nghiệp phù hợp nhất với mục tiêu nghề nghiệp.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-[#0062ff] font-extrabold">
              <span>Đọc bài viết</span>
              <div className="w-7 h-7 rounded-full bg-blue-50 group-hover:bg-[#0062ff] group-hover:text-white flex items-center justify-center transition-all">
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>
          </Link>

          {/* Article 2 */}
          <Link
            href="/cam-nang?category=review"
            className="bg-white rounded-[24px] p-6 border border-slate-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-amber-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div>
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-[10.5px] font-extrabold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                  Review công ty
                </span>
                <span className="text-[11px] font-medium text-slate-400">
                  5 phút đọc
                </span>
              </div>

              <h4 className="text-base font-black text-slate-900 m-0 group-hover:text-amber-600 transition-colors leading-snug">
                Những điều cần chú ý khi đọc review công ty
              </h4>
              <p className="text-xs text-slate-500 font-medium mt-2.5 line-clamp-3 leading-relaxed m-0">
                Cách chắt lọc thông tin đánh giá khách quan về văn hóa, đãi ngộ và môi trường làm việc từ cộng đồng nhân viên thực tế.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-amber-700 font-extrabold">
              <span>Đọc bài viết</span>
              <div className="w-7 h-7 rounded-full bg-amber-50 group-hover:bg-amber-500 group-hover:text-white flex items-center justify-center transition-all">
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>
          </Link>

          {/* Article 3 */}
          <Link
            href="/cam-nang?category=van-hoa"
            className="bg-white rounded-[24px] p-6 border border-slate-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-emerald-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div>
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-[10.5px] font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                  Văn hóa doanh nghiệp
                </span>
                <span className="text-[11px] font-medium text-slate-400">
                  6 phút đọc
                </span>
              </div>

              <h4 className="text-base font-black text-slate-900 m-0 group-hover:text-emerald-600 transition-colors leading-snug">
                Cách đánh giá văn hóa doanh nghiệp khi phỏng vấn
              </h4>
              <p className="text-xs text-slate-500 font-medium mt-2.5 line-clamp-3 leading-relaxed m-0">
                Đặt câu hỏi thông minh và tinh tế trong buổi phỏng vấn để thấu hiểu môi trường thực tế trước khi đưa ra quyết định nhận việc.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-700 font-extrabold">
              <span>Đọc bài viết</span>
              <div className="w-7 h-7 rounded-full bg-emerald-50 group-hover:bg-emerald-500 group-hover:text-white flex items-center justify-center transition-all">
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 11. SECTION 6: CTA DÀNH CHO NHÀ TUYỂN DỤNG */}
      {/* ========================================================================= */}
      <div className="max-w-[1460px] mx-auto px-4 sm:px-6 md:px-8 xl:px-12 w-full pt-6 pb-2">
        <div className="bg-gradient-to-r from-[#021338] via-[#092b77] to-[#041a4a] rounded-[28px] p-6 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg border border-blue-900/40 relative overflow-hidden">
          {/* Subtle glow circle */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

          {/* Left Content */}
          <div className="space-y-2 text-center md:text-left z-10 max-w-2xl">
            <span className="bg-white/10 text-cyan-300 text-[10.5px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider border border-white/15 inline-block mb-1">
              DÀNH CHO DOANH NGHIỆP
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight m-0 leading-snug">
              Xây dựng hình ảnh doanh nghiệp trên Careza
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 font-normal m-0 leading-relaxed max-w-xl">
              Giới thiệu thương hiệu tuyển dụng, đăng tin và kết nối với những ứng viên phù hợp một cách nhanh chóng và hiệu quả.
            </p>
          </div>

          {/* Right Action Buttons: Nút Màu Trắng Nổi Bật */}
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 z-10 w-full sm:w-auto">
            <Link
              href="/nha-tuyen-dung/dang-ky"
              className="w-full sm:w-auto bg-white hover:bg-blue-50 text-[#0062ff] font-black text-xs sm:text-sm px-6 py-3 rounded-2xl transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <span>Đăng ký Nhà tuyển dụng</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>

            <Link
              href="/nha-tuyen-dung"
              className="w-full sm:w-auto bg-white/20 hover:bg-white/30 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl transition-all border border-white/50 flex items-center justify-center backdrop-blur-sm"
            >
              Dành cho Nhà tuyển dụng
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}

export default function CompanyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
          <Spin size="large" />
        </div>
      }
    >
      <CompanyExplorerContent />
    </Suspense>
  );
}
