"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { message, Tooltip } from "antd";
import {
  Search,
  SlidersHorizontal,
  Brain,
  Bot,
  Calculator,
  ShieldCheck,
  FileText,
  Briefcase,
  BookOpen,
  ArrowRight,
  Sparkles,
  Users,
  Compass,
  Check,
  Headphones,
  Bell,
  Clock,
  TrendingUp,
  Tag,
  Lightbulb,
  Award,
  Layers,
  ChevronRight,
} from "lucide-react";

// =========================================================================
// TYPES & DATA STRUCTURES
// =========================================================================
interface ToolItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  category: "all" | "jobs" | "growth" | "finance" | "cv" | "other";
  categoryLabel: string;
  isFree: boolean;
  badge?: "popular" | "upcoming";
  badgeText?: string;
  route: string;
  ctaText: string;
  isExternal?: boolean;
  isUpcoming?: boolean;
}

const CATEGORIES = [
  { key: "all", label: "Tất cả", count: 7, icon: Layers },
  { key: "jobs", label: "Hỗ trợ tìm việc", count: 4, icon: Briefcase },
  { key: "growth", label: "Phát triển bản thân", count: 2, icon: TrendingUp },
  { key: "finance", label: "Tài chính cá nhân", count: 2, icon: Calculator },
  { key: "cv", label: "Hồ sơ & tuyển dụng", count: 2, icon: FileText },
  { key: "other", label: "Khác", count: 1, icon: BookOpen },
];

const ALL_TOOLS: ToolItem[] = [
  {
    id: "mbti",
    title: "Trắc nghiệm MBTI",
    description: "Khám phá tính cách, điểm mạnh và định hướng nghề nghiệp.",
    icon: <Brain className="w-6 h-6" />,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    category: "growth",
    categoryLabel: "Phát triển bản thân",
    isFree: true,
    badge: "popular",
    badgeText: "Phổ biến",
    route: "/cong-cu/mbti",
    ctaText: "Sử dụng ngay",
  },
  {
    id: "ai-career",
    title: "Trợ lý AI Career & Phỏng vấn",
    description: "Tư vấn nghề nghiệp, phân tích CV, luyện phỏng vấn với AI.",
    icon: <Bot className="w-6 h-6" />,
    iconBg: "bg-blue-50",
    iconColor: "text-[#0062ff]",
    category: "jobs",
    categoryLabel: "Hỗ trợ tìm việc",
    isFree: true,
    route: "/ai-career",
    ctaText: "Sử dụng ngay",
  },
  {
    id: "gross-net",
    title: "Tính lương Gross - Net",
    description: "Tính nhanh thu nhập thực tế sau thuế và các khoản khấu trừ.",
    icon: <Calculator className="w-6 h-6" />,
    iconBg: "bg-sky-50",
    iconColor: "text-sky-600",
    category: "finance",
    categoryLabel: "Tài chính cá nhân",
    isFree: true,
    route: "/cong-cu/tinh-luong-gross-net",
    ctaText: "Sử dụng ngay",
  },
  {
    id: "bhtn",
    title: "Tính bảo hiểm thất nghiệp",
    description: "Ước tính mức trợ cấp, kiểm tra điều kiện và quyền lợi BHTN.",
    icon: <ShieldCheck className="w-6 h-6" />,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    category: "finance",
    categoryLabel: "Tài chính cá nhân",
    isFree: true,
    route: "/cong-cu/bao-hiem-that-nghiep",
    ctaText: "Sử dụng ngay",
  },
  {
    id: "cv-builder",
    title: "Tạo CV online",
    description: "Tạo CV chuyên nghiệp, chuẩn ATS với nhiều mẫu đẹp mắt.",
    icon: <FileText className="w-6 h-6" />,
    iconBg: "bg-blue-50",
    iconColor: "text-[#0062ff]",
    category: "cv",
    categoryLabel: "Hồ sơ & tuyển dụng",
    isFree: true,
    badge: "upcoming",
    badgeText: "Sắp ra mắt",
    route: "#",
    ctaText: "Đăng ký nhận thông báo",
    isUpcoming: true,
  },
  {
    id: "job-recommend",
    title: "Gợi ý việc làm phù hợp",
    description: "Tìm kiếm việc làm phù hợp với hồ sơ và sở thích của bạn.",
    icon: <Briefcase className="w-6 h-6" />,
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
    category: "jobs",
    categoryLabel: "Hỗ trợ tìm việc",
    isFree: true,
    route: "/viec-lam",
    ctaText: "Sử dụng ngay",
  },
  {
    id: "career-handbook",
    title: "Cẩm nang nghề nghiệp",
    description: "Kiến thức, kỹ năng và xu hướng nghề nghiệp hữu ích.",
    icon: <BookOpen className="w-6 h-6" />,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    category: "other",
    categoryLabel: "Khác",
    isFree: true,
    route: "/cam-nang-nghe-nghiep",
    ctaText: "Xem ngay",
  },
];

export default function AllToolsDirectoryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"popular" | "newest" | "az">("popular");

  // Lọc & tìm kiếm công cụ
  const filteredTools = useMemo(() => {
    return ALL_TOOLS.filter((tool) => {
      // Category match
      const matchCategory =
        selectedCategory === "all" ||
        tool.category === selectedCategory ||
        (selectedCategory === "jobs" && (tool.id === "ai-career" || tool.id === "job-recommend" || tool.id === "mbti" || tool.id === "cv-builder")) ||
        (selectedCategory === "cv" && (tool.id === "cv-builder" || tool.id === "ai-career"));

      // Search match
      const matchSearch =
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCategory && matchSearch;
    }).sort((a, b) => {
      if (sortBy === "az") return a.title.localeCompare(b.title, "vi");
      if (sortBy === "newest") return b.id.localeCompare(a.id);
      return 0; // Default popularity order
    });
  }, [selectedCategory, searchQuery, sortBy]);

  return (
    <div className="w-full max-w-[1460px] mx-auto px-4 sm:px-6 md:px-8 xl:px-[38px] pb-12 pt-2 bg-[#F6F9FF] min-h-screen space-y-4.5">
      {/* ======================================================== */}
      {/* 1. HERO / BANNER SỬ DỤNG /images/congcu.png              */}
      {/* ======================================================== */}
      <div
        className="relative w-full rounded-[22px] overflow-hidden min-h-[175px] sm:min-h-[195px] border border-blue-200/70 shadow-sm p-5 sm:p-6 lg:p-7 flex flex-col justify-between"
        style={{
          backgroundImage: "url('/images/congcu.png')",
          backgroundSize: "cover",
          backgroundPosition: "center right",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Lớp phủ gradient nhẹ bên trái để tương phản chữ hoàn hảo */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d47a1]/90 via-[#0d47a1]/70 to-transparent sm:w-[60%] pointer-events-none" />

        {/* Nội dung bên trái Hero */}
        <div className="relative z-10 max-w-2xl space-y-2 text-white">
          {/* Heading + Badge */}
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl lg:text-[30px] font-black text-white tracking-tight m-0 leading-tight">
              Tất cả công cụ tiện ích
            </h1>
            <span className="bg-white/20 backdrop-blur-xs text-white text-xs font-bold px-3.5 py-1 rounded-full border border-white/30">
              Nhỏ hơn thời gian - Lớn hơn cơ hội
            </span>
          </div>

          <p className="text-[13px] sm:text-sm text-blue-100 font-normal m-0 leading-relaxed max-w-xl">
            Bộ công cụ toàn diện giúp bạn phát triển sự nghiệp, tối ưu hồ sơ và nắm bắt cơ hội.
          </p>
        </div>

        {/* 3 Mini Stats Badges */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 max-w-xl">
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 shadow-2xs text-white">
            <div className="w-7 h-7 rounded-lg bg-blue-500/30 flex items-center justify-center text-white shrink-0">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div className="min-w-0">
              <span className="text-xs sm:text-[13px] font-bold text-white block truncate">7+</span>
              <span className="text-[10.5px] text-blue-200 block truncate">Công cụ hữu ích</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 shadow-2xs text-white">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/30 flex items-center justify-center text-white shrink-0">
              <Clock className="w-4 h-4 text-emerald-300" />
            </div>
            <div className="min-w-0">
              <span className="text-xs sm:text-[13px] font-bold text-white block truncate">100%</span>
              <span className="text-[10.5px] text-blue-200 block truncate">Miễn phí sử dụng</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 shadow-2xs text-white">
            <div className="w-7 h-7 rounded-lg bg-purple-500/30 flex items-center justify-center text-white shrink-0">
              <TrendingUp className="w-4 h-4 text-purple-200" />
            </div>
            <div className="min-w-0">
              <span className="text-xs sm:text-[13px] font-bold text-white block truncate">Cập nhật thường xuyên</span>
              <span className="text-[10.5px] text-blue-200 block truncate">Theo xu hướng thị trường</span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. MAIN LAYOUT: CATEGORY (16%) | GRID (62%) | SIDEBAR(22%)*/}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4.5 items-start">
        {/* ==================== CỘT TRÁI: DANH MỤC CÔNG CỤ (2/12 cols ~ 16%) ==================== */}
        <div className="lg:col-span-2 space-y-3.5">
          {/* Card: Danh mục công cụ */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5ECF6] shadow-2xs space-y-2.5">
            <h3 className="text-sm font-bold text-slate-800 m-0 pb-1">
              Danh mục công cụ
            </h3>

            <div className="space-y-1">
              {CATEGORIES.map((cat) => {
                const IconComponent = cat.icon;
                const isActive = selectedCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${isActive
                        ? "bg-[#eef5ff] text-[#0062ff] font-bold shadow-2xs"
                        : "text-slate-700 hover:bg-slate-50 font-medium hover:text-[#0062ff]"
                      }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${isActive ? "bg-blue-100 text-[#0062ff]" : "bg-slate-100 text-slate-500"
                          }`}
                      >
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs sm:text-[12.5px] truncate">{cat.label}</span>
                    </div>

                    <span
                      className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${isActive
                          ? "bg-[#0062ff] text-white"
                          : "bg-slate-100 text-slate-500"
                        }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card: Bạn chưa biết nên dùng công cụ nào? (Pastel Blue) */}
          <div className="bg-[#f0f7ff] rounded-2xl p-4 border border-[#dbeafe] shadow-2xs space-y-3 relative overflow-hidden">
            <h4 className="text-xs sm:text-[13px] font-bold text-slate-800 m-0 leading-tight">
              Bạn chưa biết nên dùng công cụ nào?
            </h4>
            <p className="text-[11.5px] text-slate-600 font-normal m-0 leading-relaxed">
              Hãy để Careza gợi ý công cụ phù hợp nhất với mục tiêu hiện tại của bạn.
            </p>

            <div className="flex items-center justify-between gap-2 pt-0.5">
              <Link href="/ai-career" className="block w-full">
                <button
                  type="button"
                  className="w-full py-2 px-3 rounded-xl bg-[#0062ff] hover:bg-[#0047ba] text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Nhận gợi ý ngay</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center shrink-0 shadow-2xs">
                <Lightbulb className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* ==================== CỘT GIỮA: TOOL GRID (7/12 cols ~ 62%) ==================== */}
        <div className="lg:col-span-7 space-y-4">
          {/* Header Grid: Tiêu đề + Search + Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E5ECF6] shadow-2xs">
            <h2 className="text-sm sm:text-base font-bold text-slate-800 m-0">
              Tất cả công cụ <span className="text-[#0062ff]">({filteredTools.length})</span>
            </h2>

            <div className="flex items-center gap-2.5">
              {/* Search input */}
              <div className="relative flex items-center flex-1 sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm công cụ..."
                  className="w-full pl-8.5 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#0062ff]"
                />
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer"
              >
                <option value="popular">Sắp xếp: Phổ biến nhất</option>
                <option value="newest">Sắp xếp: Mới nhất</option>
                <option value="az">Sắp xếp: Tên A-Z</option>
              </select>
            </div>
          </div>

          {/* Grid 3 Cột Desktop */}
          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredTools.map((tool) => {
                return (
                  <div
                    key={tool.id}
                    className="bg-white rounded-2xl p-4.5 border border-[#E5ECF6] shadow-2xs hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between group space-y-3.5 relative overflow-hidden"
                  >
                    {/* Top: Icon & Badges */}
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className={`w-11 h-11 rounded-2xl ${tool.iconBg} ${tool.iconColor} flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}
                      >
                        {tool.icon}
                      </div>

                      {tool.badge && (
                        <span
                          className={`text-[10.5px] font-bold px-2.5 py-0.5 rounded-full ${tool.badge === "popular"
                              ? "bg-rose-100 text-rose-600 border border-rose-200"
                              : "bg-sky-100 text-sky-700 border border-sky-200"
                            }`}
                        >
                          {tool.badgeText}
                        </span>
                      )}
                    </div>

                    {/* Middle: Title & Description */}
                    <div className="space-y-1.5 flex-1">
                      <h3 className="text-sm font-bold text-slate-800 group-hover:text-[#0062ff] transition-colors m-0 leading-tight">
                        {tool.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-normal m-0 leading-relaxed line-clamp-2">
                        {tool.description}
                      </p>
                    </div>

                    {/* Category Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="text-[10.5px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                        {tool.categoryLabel}
                      </span>
                      {tool.isFree && (
                        <span className="text-[10.5px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md">
                          Miễn phí
                        </span>
                      )}
                    </div>

                    {/* Bottom CTA */}
                    <div className="pt-2 border-t border-slate-100">
                      {tool.isUpcoming ? (
                        <button
                          type="button"
                          onClick={() => message.info("Careza sẽ thông báo ngay khi tính năng Tạo CV Online ra mắt!")}
                          className="w-full py-2 px-3 rounded-xl border border-blue-200 text-[#0062ff] hover:bg-blue-50 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Bell className="w-3.5 h-3.5 text-[#0062ff]" />
                          <span>{tool.ctaText}</span>
                        </button>
                      ) : (
                        <Link href={tool.route} className="block w-full">
                          <button
                            type="button"
                            className="w-full py-2 px-3 rounded-xl border border-blue-200 text-[#0062ff] group-hover:bg-[#0062ff] group-hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          >
                            <span>{tool.ctaText}</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-2">
              <Search className="w-8 h-8 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700 m-0">
                Không tìm thấy công cụ phù hợp
              </h4>
              <p className="text-xs text-slate-500 m-0">
                Vui lòng thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác.
              </p>
            </div>
          )}
        </div>

        {/* ==================== CỘT PHẢI: SIDEBAR (3/12 cols ~ 22%) ==================== */}
        <div className="lg:col-span-3 space-y-3.5">
          {/* Card 1: 🏆 Công cụ được yêu thích nhất (Pastel Yellow) */}
          <div className="bg-[#fffdf5] rounded-2xl p-4.5 border border-[#fde68a] shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-800 m-0 flex items-center gap-1.5">
              <span>🏆</span>
              <span>Công cụ được yêu thích nhất</span>
            </h3>

            <div className="space-y-2">
              {[
                { rank: 1, title: "Trợ lý AI Career & Phỏng vấn", route: "/ai-career" },
                { rank: 2, title: "Trắc nghiệm MBTI", route: "/cong-cu/mbti" },
                { rank: 3, title: "Tính lương Gross - Net", route: "/cong-cu/tinh-luong-gross-net" },
              ].map((item) => (
                <Link
                  key={item.rank}
                  href={item.route}
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-amber-100/40 text-slate-800 hover:text-[#0062ff] transition-all group"
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${item.rank === 1
                        ? "bg-amber-400 text-amber-950"
                        : item.rank === 2
                          ? "bg-amber-300 text-amber-900"
                          : "bg-amber-200 text-amber-800"
                      }`}
                  >
                    {item.rank}
                  </span>
                  <span className="text-xs sm:text-[12.5px] font-semibold truncate flex-1">
                    {item.title}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ))}
            </div>
          </div>

          {/* Card 2: Lợi ích dành cho bạn (Pastel Mint) */}
          <div className="bg-[#f0fdf4] rounded-2xl p-4.5 border border-[#bbf7d0] shadow-2xs space-y-2.5">
            <h3 className="text-sm font-bold text-slate-800 m-0">
              Lợi ích dành cho bạn
            </h3>

            <ul className="space-y-2 text-xs text-slate-700 pl-0 list-none m-0 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Miễn phí 100%</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Dễ sử dụng, kết quả nhanh chóng</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Cập nhật theo quy định và xu hướng</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Đồng hành cùng bạn trên mọi chặng đường sự nghiệp</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Cần hỗ trợ? (Pastel Blue) */}
          <div className="bg-[#f0f7ff] rounded-2xl p-4.5 border border-[#dbeafe] shadow-2xs space-y-3 relative overflow-hidden">
            <div>
              <h4 className="text-sm font-bold text-slate-800 m-0">Cần hỗ trợ?</h4>
              <p className="text-xs text-slate-600 font-normal m-0 mt-0.5 leading-tight">
                Đội ngũ Careza luôn sẵn sàng đồng hành cùng bạn.
              </p>
            </div>
            <div className="flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => message.info("Tổng đài hỗ trợ Careza: 1900 6868")}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#0062ff] font-bold text-xs border border-blue-200 shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Liên hệ hỗ trợ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <div className="w-11 h-11 rounded-full bg-blue-100 text-[#0062ff] flex items-center justify-center shrink-0">
                <Headphones className="w-5.5 h-5.5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. SECTION: 3 BƯỚC ĐƠN GIẢN ĐỂ SỬ DỤNG CÔNG CỤ           */}
      {/* ======================================================== */}
      <div className="space-y-3.5 pt-2">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 m-0">
          3 bước đơn giản để sử dụng công cụ
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Step 01 */}
          <div className="p-4 bg-white rounded-2xl border border-[#E5ECF6] shadow-2xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0062ff] font-black text-base flex items-center justify-center shrink-0">
                01
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 m-0">Chọn công cụ phù hợp</h4>
                <p className="text-xs text-slate-500 m-0 mt-0.5 leading-tight">
                  Khám phá công cụ theo nhu cầu của bạn.
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 hidden md:block" />
          </div>

          {/* Step 02 */}
          <div className="p-4 bg-white rounded-2xl border border-[#E5ECF6] shadow-2xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0062ff] font-black text-base flex items-center justify-center shrink-0">
                02
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 m-0">Sử dụng công cụ</h4>
                <p className="text-xs text-slate-500 m-0 mt-0.5 leading-tight">
                  Nhập thông tin và nhận kết quả chỉ trong vài phút.
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 hidden md:block" />
          </div>

          {/* Step 03 */}
          <div className="p-4 bg-white rounded-2xl border border-[#E5ECF6] shadow-2xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0062ff] font-black text-base flex items-center justify-center shrink-0">
              03
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 m-0">Ứng dụng kết quả</h4>
              <p className="text-xs text-slate-500 m-0 mt-0.5 leading-tight">
                Tận dụng kết quả để phát triển sự nghiệp tốt hơn.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. BOTTOM CTA BANNER: NHIỀU CÔNG CỤ HỮU ÍCH               */}
      {/* ======================================================== */}
      <div className="relative w-full rounded-2xl overflow-hidden min-h-[115px] sm:min-h-[130px] bg-gradient-to-r from-[#0a359c] via-[#0047ba] to-[#0062ff] text-white shadow-md p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
        <div className="space-y-1 max-w-xl z-10">
          <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white m-0 leading-tight">
            Nhiều công cụ hữu ích, nhiều cơ hội hơn cho bạn
          </h3>
          <p className="text-xs sm:text-[13.5px] text-blue-100 font-normal m-0 leading-relaxed">
            Careza đồng hành cùng bạn trên hành trình chinh phục sự nghiệp.
          </p>
        </div>

        <div className="flex items-center gap-6 z-10 shrink-0 pr-2">
          <div className="text-right -rotate-3 pointer-events-none select-none hidden sm:block">
            <span className="font-serif italic text-xs sm:text-sm font-bold text-blue-200 block leading-tight">
              Good Tools
            </span>
            <span className="font-serif italic text-xs sm:text-sm font-bold text-blue-100 block leading-tight">
              Greater Opportunities
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              setSelectedCategory("all");
            }}
            className="px-5.5 py-2.5 rounded-xl bg-white hover:bg-blue-50 text-[#0047ba] font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>Khám phá công cụ ngay</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
