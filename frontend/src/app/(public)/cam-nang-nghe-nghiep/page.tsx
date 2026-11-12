"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Spin, message } from "antd";
import {
  Search,
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Sparkles,
  Lightbulb,
  ChevronRight,
  Eye,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import {
  HANDBOOK_CATEGORIES,
  HANDBOOK_ARTICLES,
  CAREER_TOOLS,
  normalizeCategorySlug,
  type HandbookArticle,
} from "@/features/public/handbook/handbook-data";

function HandbookContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawCategory = searchParams.get("category");
  const normalizedCategory = normalizeCategorySlug(rawCategory);

  const [keyword, setKeyword] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(normalizedCategory);
  const [suggestionTopic, setSuggestionTopic] = useState("");
  const [activeTopicTab, setActiveTopicTab] = useState<"all" | "cv-interview" | "skills-career" | "market-salary">("all");

  useEffect(() => {
    setSelectedCategory(normalizeCategorySlug(searchParams.get("category")));
  }, [searchParams]);

  const handleCategoryChange = (slug: string) => {
    if (selectedCategory === slug) {
      setSelectedCategory("all");
      router.push("/cam-nang");
    } else {
      setSelectedCategory(slug);
      router.push(`/cam-nang?category=${slug}`);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  // Lọc bài viết
  const filteredArticles = HANDBOOK_ARTICLES.filter((art) => {
    if (selectedCategory !== "all" && art.categorySlug !== selectedCategory) {
      return false;
    }
    if (keyword.trim()) {
      const q = keyword.toLowerCase().trim();
      const matchTitle = art.title.toLowerCase().includes(q);
      const matchExcerpt = art.excerpt.toLowerCase().includes(q);
      const matchCat = art.categoryName.toLowerCase().includes(q);
      if (!matchTitle && !matchExcerpt && !matchCat) return false;
    }
    return true;
  });

  const heroMainArticle = HANDBOOK_ARTICLES.find((a) => a.isHeroMain) || HANDBOOK_ARTICLES[0];
  const sideFeaturedArticles = HANDBOOK_ARTICLES.filter((a) => a.isSideFeatured);
  const latestArticles = HANDBOOK_ARTICLES.filter((a) => a.isLatest);

  // Hiển thị danh sách chính
  const displayArticles = selectedCategory === "all" && !keyword ? latestArticles : filteredArticles;

  // Lọc kiến thức theo chủ đề
  const topicArticles =
    activeTopicTab === "all"
      ? HANDBOOK_ARTICLES.slice(0, 6)
      : HANDBOOK_ARTICLES.filter((a) => a.topicGroup === activeTopicTab);

  // Đếm số lượng bài theo từng danh mục
  const getCategoryCount = (slug: string) => {
    return HANDBOOK_ARTICLES.filter((a) => a.categorySlug === slug).length;
  };

  const currentCategoryObj = HANDBOOK_CATEGORIES.find((c) => c.slug === selectedCategory);

  const handleSendSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestionTopic.trim()) {
      message.warning("Vui lòng nhập chủ đề bạn quan tâm.");
      return;
    }
    message.success("Cảm ơn bạn! Ban biên tập CAREZA đã ghi nhận đề xuất chủ đề.");
    setSuggestionTopic("");
  };

  return (
    <div className="w-full bg-[#f8fafc] min-h-screen text-[#0F172A] font-sans pb-16">
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pt-4">
        {/* ======================================================== */}
        {/* 1. HERO BANNER: THIẾT KẾ XANH PHỐI TRẮNG TINH TẾ       */}
        {/* ======================================================== */}
        <section className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-r from-[#00348a] via-[#0047cc] to-[#0A58CA] border border-blue-400/30 shadow-xs p-5 sm:p-7 lg:p-8 text-white min-h-[160px] sm:min-h-[170px] flex flex-col justify-center">
          {/* Ảnh minh họa bên phải với mask mờ mềm mại */}
          <div className="absolute right-0 top-0 bottom-0 h-full w-[45%] md:w-[38%] pointer-events-none select-none overflow-hidden hidden sm:block [mask-image:linear-gradient(to_left,rgba(0,0,0,1)_55%,transparent_100%)]">
            <img
              src="/images/camnang.png"
              alt="Cẩm nang nghề nghiệp"
              className="w-full h-full object-cover object-right opacity-95"
            />
          </div>

          {/* Vòng sáng trang trí nền nhẹ nhàng */}
          <div className="absolute -left-12 -top-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />

          {/* Nội dung bên trái */}
          <div className="relative z-10 max-w-2xl space-y-2.5">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-xs text-blue-100 text-[11px] font-bold px-3 py-1 rounded-full border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-cyan-200 shrink-0" />
              <span>CAREZA Career Handbook</span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight m-0">
                Cẩm nang nghề nghiệp
              </h1>

            </div>

            {/* Thanh tìm kiếm nhỏ gọn (360–420px) */}
            <form onSubmit={handleSearchSubmit} className="relative w-full max-w-[420px] pt-1">
              <div className="relative flex items-center bg-white rounded-xl shadow-xs border border-white/80 overflow-hidden">
                <Search className="w-4 h-4 text-[#2563EB] absolute left-3 pointer-events-none stroke-[2.2]" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Tìm kiếm bài viết, chủ đề, từ khóa..."
                  className="w-full pl-9 pr-8 py-2 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-hidden font-medium bg-transparent"
                />
                {keyword && (
                  <button
                    type="button"
                    onClick={() => setKeyword("")}
                    className="absolute right-2.5 text-slate-400 hover:text-slate-600 text-xs cursor-pointer border-none bg-transparent"
                  >
                    ✕
                  </button>
                )}
              </div>
            </form>

            {/* Từ khóa phổ biến */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-blue-100/90 font-medium pt-0.5">
              <span className="text-white font-bold">Từ khóa nổi bật:</span>
              {["Viết CV chuẩn ATS", "Mẹo phỏng vấn", "Lương Gross - Net", "Kỹ năng mềm", "Chuyển ngành"].map(
                (kw) => (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => setKeyword(kw)}
                    className="bg-white/15 hover:bg-white/25 text-white px-2 py-0.5 rounded-md border border-white/20 transition-colors cursor-pointer text-[10.5px] font-semibold"
                  >
                    {kw}
                  </button>
                )
              )}
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 2. DANH MỤC CẨM NANG (6 KHỐI CHUẨN)                     */}
        {/* ======================================================== */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1 h-4 bg-[#2563EB] rounded-full inline-block" />
              <h2 className="text-sm font-bold text-[#0F172A] m-0 uppercase tracking-wider">
                Danh mục chuyên đề
              </h2>
            </div>
            {selectedCategory !== "all" && (
              <button
                type="button"
                onClick={() => handleCategoryChange("all")}
                className="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer bg-transparent border-none p-0 inline-flex items-center gap-1"
              >
                <span>Xóa bộ lọc</span>
                <span>(Hiển thị tất cả)</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
            {HANDBOOK_CATEGORIES.map((cat) => {
              const IconComp = cat.icon;
              const isSelected = selectedCategory === cat.slug;
              const count = getCategoryCount(cat.slug);

              return (
                <div
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`bg-white rounded-xl p-3 border transition-all duration-200 cursor-pointer flex items-center justify-between gap-2.5 h-[58px] shadow-[0_2px_6px_rgba(15,23,42,0.03)] hover:shadow-xs hover:-translate-y-0.5 ${isSelected
                    ? "border-[#2563EB] ring-2 ring-blue-500/20 bg-[#EFF6FF]"
                    : "border-[#CBD5E1] hover:border-[#2563EB]/50"
                    }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg ${cat.iconBg} ${cat.iconColor} flex items-center justify-center shrink-0 border border-slate-200/60 shadow-2xs`}
                    >
                      <IconComp className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-xs font-bold leading-snug line-clamp-2 transition-colors ${isSelected ? "text-[#1D4ED8]" : "text-[#0F172A]"
                        }`}
                    >
                      {cat.name}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 border ${isSelected
                      ? "bg-[#2563EB] text-white border-[#2563EB]"
                      : "bg-[#F1F5F9] text-[#475569] border-slate-200/80"
                      }`}
                  >
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ======================================================== */}
        {/* 3. LƯỚI NỘI DUNG CHÍNH (MAIN) & SIDEBAR PHẢI             */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* CỘT CHÍNH (8/12 hoặc 9/12) */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            {/* 3.1. BÀI VIẾT NỔI BẬT (CHỈ HIỂN THỊ KHI Ở TRANG CHỦ ALL) */}
            {selectedCategory === "all" && !keyword && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-1 h-4 bg-[#2563EB] rounded-full inline-block" />
                    <h2 className="text-base sm:text-lg font-bold text-[#0F172A] m-0">
                      Bài viết nổi bật
                    </h2>
                    <span className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                      Tuyển chọn
                    </span>
                  </div>
                  <Link
                    href="/cam-nang?category=viet-cv"
                    className="text-xs font-semibold text-[#2563EB] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Xem thêm</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Bố cục: 1 bài lớn (60%) + 2 bài phụ (40%) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Bài lớn bên trái (7 cột) */}
                  <div className="md:col-span-7">
                    <Link
                      href={`/cam-nang/${heroMainArticle.slug}`}
                      className="group bg-white rounded-2xl border border-[#CBD5E1] hover:border-[#2563EB] hover:shadow-md transition-all overflow-hidden flex flex-col justify-between h-full shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
                    >
                      <div className="aspect-[16/9] w-full overflow-hidden relative bg-slate-100 shrink-0">
                        <img
                          src={heroMainArticle.image}
                          alt={heroMainArticle.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="text-[10.5px] font-bold px-2.5 py-1 rounded-lg bg-white/95 text-[#2563EB] shadow-2xs border border-blue-100 backdrop-blur-xs">
                            {heroMainArticle.categoryName}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 space-y-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 text-[11px] text-[#64748B] font-medium">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-[#94A3B8]" />
                              {heroMainArticle.date}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#94A3B8]" />
                              {heroMainArticle.readTime}
                            </span>
                          </div>

                          <h3 className="text-base sm:text-lg font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors leading-snug m-0 line-clamp-2">
                            {heroMainArticle.title}
                          </h3>

                          <p className="text-xs sm:text-[13px] text-[#475569] font-normal line-clamp-2 leading-relaxed m-0">
                            {heroMainArticle.excerpt}
                          </p>
                        </div>

                        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {heroMainArticle.authorAvatar && (
                              <img
                                src={heroMainArticle.authorAvatar}
                                alt={heroMainArticle.author}
                                className="w-6 h-6 rounded-full object-cover border border-slate-200"
                              />
                            )}
                            <span className="text-xs font-semibold text-slate-700">
                              {heroMainArticle.author}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-[#2563EB] group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                            <span>Đọc ngay</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>

                  {/* 2 Bài phụ bên phải (5 cột) */}
                  <div className="md:col-span-5 flex flex-col gap-4">
                    {sideFeaturedArticles.map((art) => (
                      <Link
                        key={art.id}
                        href={`/cam-nang/${art.slug}`}
                        className="group bg-white rounded-2xl border border-[#CBD5E1] hover:border-[#2563EB] hover:shadow-md transition-all p-3.5 flex gap-3.5 items-center flex-1 shadow-[0_2px_8px_rgba(15,23,42,0.03)]"
                      >
                        <div className="w-28 sm:w-32 aspect-[4/3] rounded-xl overflow-hidden shrink-0 bg-slate-100 relative">
                          <img
                            src={art.image}
                            alt={art.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>

                        <div className="min-w-0 space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 text-[10px]">
                            <span className="font-bold text-[#2563EB] px-2 py-0.5 rounded-md bg-[#EFF6FF] border border-[#BFDBFE]">
                              {art.categoryName}
                            </span>
                            <span className="text-[#64748B] font-medium">
                              {art.readTime}
                            </span>
                          </div>

                          <h4 className="text-xs sm:text-[13px] font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors leading-snug line-clamp-2 m-0">
                            {art.title}
                          </h4>

                          <p className="text-[11.5px] text-[#475569] line-clamp-1 m-0">
                            {art.excerpt}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* 3.2. BÀI VIẾT MỚI NHẤT / DANH SÁCH BÀI VIẾT LỌC */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-1 h-4 bg-[#2563EB] rounded-full inline-block" />
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-[#0F172A] m-0">
                      {keyword
                        ? `Kết quả tìm kiếm cho: "${keyword}"`
                        : selectedCategory === "all"
                          ? "Bài viết mới nhất"
                          : `Chuyên mục: ${currentCategoryObj?.name || "Tất cả bài viết"}`}
                    </h2>
                    <p className="text-xs text-[#64748B] font-normal m-0 mt-0.5">
                      Hiển thị {displayArticles.length} bài viết chất lượng
                    </p>
                  </div>
                </div>

                {selectedCategory !== "all" && (
                  <button
                    type="button"
                    onClick={() => handleCategoryChange("all")}
                    className="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer bg-transparent border-none p-0 inline-flex items-center gap-1"
                  >
                    <span>Xem tất cả bài viết</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {displayArticles.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 border border-[#CBD5E1] text-center space-y-3 shadow-2xs">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-[#2563EB] mx-auto flex items-center justify-center">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-[#0F172A] m-0">
                    Không tìm thấy bài viết nào phù hợp
                  </h3>
                  <p className="text-xs text-[#64748B] m-0 max-w-sm mx-auto leading-relaxed">
                    Thử tìm kiếm với từ khóa khác hoặc quay lại danh sách tất cả các chuyên đề để khám phá thêm.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setKeyword("");
                      setSelectedCategory("all");
                      router.push("/cam-nang");
                    }}
                    className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs transition-colors cursor-pointer border-none shadow-xs"
                  >
                    Xem tất cả bài viết
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {displayArticles.map((art) => (
                    <Link
                      key={art.id}
                      href={`/cam-nang/${art.slug}`}
                      className="group bg-white rounded-2xl border border-[#CBD5E1] hover:border-[#2563EB] hover:shadow-md transition-all overflow-hidden flex flex-col justify-between shadow-[0_2px_6px_rgba(15,23,42,0.03)]"
                    >
                      {/* Ảnh 16:9 đồng bộ tỉ lệ */}
                      <div className="w-full aspect-[16/9] overflow-hidden bg-slate-100 relative">
                        <img
                          src={art.image}
                          alt={art.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2.5 left-2.5">
                          <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-md bg-white/95 text-[#2563EB] shadow-2xs border border-blue-100 backdrop-blur-xs">
                            {art.categoryName}
                          </span>
                        </div>
                      </div>

                      {/* Nội dung card */}
                      <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] text-[#64748B] font-medium">
                            <span>{art.date}</span>
                            <span>{art.readTime}</span>
                          </div>

                          <h3 className="text-xs sm:text-[13px] font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors leading-snug line-clamp-2 m-0">
                            {art.title}
                          </h3>

                          <p className="text-[11.5px] text-[#475569] line-clamp-2 leading-relaxed m-0 font-normal">
                            {art.excerpt}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="text-slate-600 font-medium truncate max-w-[120px]">
                            {art.author}
                          </span>
                          <span className="text-[#2563EB] font-bold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                            Đọc tiếp →
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* 3.3. KIẾN THỨC THEO CHỦ ĐỀ (THEMATIC KNOWLEDGE) */}
            <section className="space-y-3.5 pt-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-1 h-4 bg-[#2563EB] rounded-full inline-block" />
                  <h2 className="text-base sm:text-lg font-bold text-[#0F172A] m-0">
                    Kiến thức theo chủ đề chuyên sâu
                  </h2>
                </div>

                {/* Tabs phân nhóm chủ đề */}
                <div className="flex items-center gap-1 bg-[#F1F5F9] border border-slate-200/80 p-1 rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setActiveTopicTab("all")}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer border-none ${activeTopicTab === "all"
                      ? "bg-white text-[#2563EB] font-bold shadow-2xs"
                      : "text-[#64748B] hover:text-[#0F172A] bg-transparent"
                      }`}
                  >
                    Tất cả
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTopicTab("cv-interview")}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer border-none ${activeTopicTab === "cv-interview"
                      ? "bg-white text-[#2563EB] font-bold shadow-2xs"
                      : "text-[#64748B] hover:text-[#0F172A] bg-transparent"
                      }`}
                  >
                    CV & Phỏng vấn
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTopicTab("skills-career")}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer border-none ${activeTopicTab === "skills-career"
                      ? "bg-white text-[#2563EB] font-bold shadow-2xs"
                      : "text-[#64748B] hover:text-[#0F172A] bg-transparent"
                      }`}
                  >
                    Kỹ năng & Lộ trình
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTopicTab("market-salary")}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer border-none ${activeTopicTab === "market-salary"
                      ? "bg-white text-[#2563EB] font-bold shadow-2xs"
                      : "text-[#64748B] hover:text-[#0F172A] bg-transparent"
                      }`}
                  >
                    Thị trường & Lương
                  </button>
                </div>
              </div>

              {/* Lưới card chủ đề */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {topicArticles.slice(0, 3).map((art) => (
                  <Link
                    key={`topic-${art.id}`}
                    href={`/cam-nang/${art.slug}`}
                    className="group bg-white rounded-2xl border border-[#CBD5E1] hover:border-[#2563EB] hover:shadow-md transition-all p-4 flex flex-col justify-between space-y-3 shadow-[0_2px_6px_rgba(15,23,42,0.03)]"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-md border border-[#BFDBFE]">
                          {art.categoryName}
                        </span>
                        <span className="text-[#64748B] font-medium">
                          {art.readTime}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-[13px] font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors leading-snug line-clamp-2 m-0">
                        {art.title}
                      </h4>
                      <p className="text-[11.5px] text-[#475569] font-normal line-clamp-2 leading-relaxed m-0">
                        {art.excerpt}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-[#475569] font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Lời khuyên thực tế</span>
                      </span>
                      <span className="text-[#2563EB] font-bold group-hover:translate-x-0.5 transition-transform">
                        Xem chi tiết →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* CỘT PHẢI (SIDEBAR: 4/12 hoặc 3/12) */}
          <aside className="lg:col-span-4 xl:col-span-3 space-y-4">
            {/* Card 1: Góc nhìn chuyên gia */}
            <div className="bg-[#FFFDF5] rounded-2xl p-4.5 border border-[#FDE68A] shadow-2xs space-y-3">
              <div>
                <h3 className="text-xs font-bold text-[#0F172A] m-0 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Góc nhìn chuyên gia</span>
                </h3>

              </div>

              <div className="bg-white rounded-xl p-3 border border-[#FDE68A] shadow-2xs relative">
                <span className="text-amber-500 font-serif text-lg leading-none block font-black mb-1">
                  ❝
                </span>
                <p className="text-[11.5px] text-slate-700 font-normal leading-relaxed m-0 italic">
                  Sự nghiệp bền vững không đến từ may mắn, mà bắt đầu từ việc không ngừng bồi đắp kỹ năng và thấu hiểu giá trị bản thân mỗi ngày.
                </p>
                <span className="text-amber-500 font-serif text-lg leading-none block font-black text-right -mt-1">
                  ❞
                </span>
              </div>

              <div className="flex items-center gap-2.5 pt-0.5">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
                  alt="Nguyễn Thị Lan Anh"
                  className="w-9 h-9 rounded-full object-cover border-2 border-amber-300 shrink-0 shadow-xs"
                />
                <div className="min-w-0">
                  <span className="text-xs font-bold text-[#0F172A] block truncate">
                    Nguyễn Thị Lan Anh
                  </span>
                  <span className="text-[10.5px] text-[#64748B] font-normal block truncate">
                    HR Director tại CAREZA
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Đề xuất chủ đề */}
            <div className="bg-[#F0FDF4] rounded-2xl p-4.5 border border-[#BBF7D0] shadow-2xs space-y-2.5">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A] m-0">
                    Bạn cần cẩm nang về chủ đề gì?
                  </h4>
                  <p className="text-[11px] text-[#475569] font-normal m-0 mt-0.5 leading-snug">
                    Hãy gửi gợi ý để đội ngũ biên tập CAREZA xây dựng bài viết hữu ích nhất cho bạn.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSendSuggestion} className="space-y-2">
                <input
                  type="text"
                  value={suggestionTopic}
                  onChange={(e) => setSuggestionTopic(e.target.value)}
                  placeholder="Ví dụ: Phỏng vấn bằng tiếng Anh..."
                  className="w-full bg-white border border-[#A7F3D0] rounded-xl px-3 py-1.5 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-2xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border-none"
                >
                  <span>Gửi đề xuất chủ đề</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Card 3: Xu hướng đọc nhiều nhất */}
            <div className="bg-white rounded-2xl p-4.5 border border-[#CBD5E1] shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-rose-600 shrink-0" />
                <h3 className="text-xs font-bold text-[#0F172A] m-0">
                  Được đọc nhiều nhất
                </h3>
              </div>

              <div className="space-y-2.5">
                {HANDBOOK_ARTICLES.slice(0, 3).map((art, idx) => (
                  <Link
                    key={`popular-${art.id}`}
                    href={`/cam-nang/${art.slug}`}
                    className="flex items-start gap-2.5 group hover:bg-slate-50 p-1.5 -mx-1.5 rounded-xl transition-colors"
                  >
                    <span className="w-5 h-5 rounded-md bg-[#EFF6FF] text-[#2563EB] text-xs font-bold flex items-center justify-center shrink-0 border border-[#BFDBFE] mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 space-y-0.5">
                      <h4 className="text-xs font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors line-clamp-2 leading-snug m-0">
                        {art.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-[#64748B]">
                        <span>{art.readTime}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <Eye className="w-2.5 h-2.5" />
                          {art.views?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* ======================================================== */}
        {/* 4. KHU VỰC KHÁM PHÁ THÊM: HỆ SINH THÁI CÔNG CỤ CAREZA   */}
        {/* ======================================================== */}
        <section className="space-y-3.5 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-1 h-4 bg-[#2563EB] rounded-full inline-block" />
              <h2 className="text-base sm:text-lg font-bold text-[#0F172A] m-0">
                Khám phá thêm công cụ sự nghiệp
              </h2>
            </div>
            <Link
              href="/cong-cu"
              className="text-xs font-semibold text-[#2563EB] hover:underline inline-flex items-center gap-1"
            >
              <span>Xem tất cả công cụ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CAREER_TOOLS.map((tool) => {
              const ToolIcon = tool.icon;
              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="group bg-white rounded-2xl border border-[#CBD5E1] hover:border-[#2563EB] hover:shadow-md p-4 flex flex-col justify-between space-y-3 transition-all shadow-[0_2px_6px_rgba(15,23,42,0.03)]"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-9 h-9 rounded-xl ${tool.iconBg} ${tool.iconColor} flex items-center justify-center shrink-0 border border-slate-200/60 shadow-2xs`}
                      >
                        <ToolIcon className="w-5 h-5" />
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tool.badgeColor}`}>
                        {tool.tag}
                      </span>
                    </div>

                    <h3 className="text-xs sm:text-[13px] font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors leading-snug m-0">
                      {tool.title}
                    </h3>

                    <p className="text-[11.5px] text-[#475569] font-normal leading-relaxed m-0 line-clamp-2">
                      {tool.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#2563EB] group-hover:translate-x-0.5 transition-transform">
                    <span>Trải nghiệm ngay</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ======================================================== */}
        {/* 5. SLIM BANNER ĐÁY: CAREER CTA                           */}
        {/* ======================================================== */}
        <section className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-r from-[#EFF6FF] via-[#F0F9FF] to-[#DBEAFE] border border-[#BFDBFE] shadow-2xs p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl z-10 text-center md:text-left">
            <h3 className="text-sm sm:text-base font-bold text-[#0F172A] m-0">
              Cùng CAREZA xây dựng sự nghiệp vững vàng hơn mỗi ngày
            </h3>
            <p className="text-xs text-[#475569] font-normal m-0 leading-relaxed">
              Cập nhật kiến thức mới, trau dồi kỹ năng chuyên sâu và nắm bắt những cơ hội việc làm tốt nhất.
            </p>
          </div>

          <div className="flex items-center gap-3 z-10 shrink-0">
            <Link
              href="/viec-lam"
              className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs transition-all shadow-xs inline-flex items-center gap-1.5"
            >
              <span>Tìm việc làm ngay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/ung-vien/cv/builder"
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#2563EB] font-bold text-xs transition-all border border-[#BFDBFE] shadow-2xs"
            >
              Tạo CV miễn phí
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function HandbookPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
          <Spin size="large" />
        </div>
      }
    >
      <HandbookContent />
    </Suspense>
  );
}
