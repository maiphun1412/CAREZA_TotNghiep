"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Spin, message } from "antd";
import {
  Search,
  ArrowRight,
  BookOpen,
  Zap,
  TrendingUp,
  Coins,
  Rocket,
  Newspaper,
  Calendar,
  Clock,
  Lightbulb,
  Sparkles,
  ChevronRight,
  Send,
} from "lucide-react";

// 6 Danh mục Cẩm nang chuẩn theo Design Reference
const CATEGORIES = [
  {
    id: "tim-viec",
    name: "Kinh nghiệm tìm việc",
    slug: "tim-viec",
    icon: BookOpen,
    iconColor: "text-[#0062ff]",
    iconBg: "bg-blue-50 border-blue-100",
  },
  {
    id: "ky-nang",
    name: "Kỹ năng nghề nghiệp",
    slug: "ky-nang",
    icon: Zap,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50 border-emerald-100",
  },
  {
    id: "thi-truong",
    name: "Xu hướng thị trường",
    slug: "thi-truong",
    icon: TrendingUp,
    iconColor: "text-purple-600",
    iconBg: "bg-purple-50 border-purple-100",
  },
  {
    id: "luong-phuc-loi",
    name: "Lương & chế độ",
    slug: "luong-phuc-loi",
    icon: Coins,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50 border-amber-100",
  },
  {
    id: "phat-trien-su-nghiep",
    name: "Phát triển sự nghiệp",
    slug: "phat-trien-su-nghiep",
    icon: Rocket,
    iconColor: "text-pink-600",
    iconBg: "bg-pink-50 border-pink-100",
  },
  {
    id: "tin-tuc-careza",
    name: "Tin tức Careza",
    slug: "tin-tuc-careza",
    icon: Newspaper,
    iconColor: "text-teal-600",
    iconBg: "bg-teal-50 border-teal-100",
  },
];

// Danh sách bài viết chuẩn
const ARTICLES = [
  // 1. Featured Lớn
  {
    id: "art-1",
    slug: "huong-dan-viet-cv-an-tuong-chinh-phuc-nha-tuyen-dung",
    categorySlug: "tim-viec",
    categoryName: "KINH NGHIỆM TÌM VIỆC",
    title: "Hướng dẫn viết CV ấn tượng giúp bạn chinh phục nhà tuyển dụng",
    excerpt:
      "Từ bố cục, nội dung đến những lưu ý quan trọng để tạo một bản CV chuyên nghiệp, nổi bật và tăng cơ hội trúng tuyển.",
    date: "12/08/2026",
    readTime: "5 phút đọc",
    author: "Ban Biên Tập Careza",
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80",
    isFeatured: true,
    isHeroMain: true,
  },
  // 2. Featured Phụ 1
  {
    id: "art-2",
    slug: "10-ky-nang-mem-quan-trong-thanh-cong-moi-nganh-nghe",
    categorySlug: "ky-nang",
    categoryName: "KỸ NĂNG NGHỀ NGHIỆP",
    title: "10 kỹ năng mềm quan trọng giúp bạn thành công trong mọi ngành nghề",
    excerpt: "Giao tiếp, tư duy phản biện, giải quyết vấn đề và quản lý cảm xúc tại nơi làm việc.",
    date: "10/08/2026",
    readTime: "6 phút đọc",
    author: "Ngọc Lan",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
    isFeatured: true,
    isSideFeatured: true,
  },
  // 3. Featured Phụ 2
  {
    id: "art-3",
    slug: "top-nganh-nghe-tiem-nang-5-nam-toi-va-co-hoi-viec-lam",
    categorySlug: "thi-truong",
    categoryName: "XU HƯỚNG THỊ TRƯỜNG",
    title: "Top ngành nghề tiềm năng trong 5 năm tới và cơ hội việc làm",
    excerpt: "Dự báo chuyển dịch nhân lực, công nghệ AI và những lĩnh vực tăng trưởng bền vững.",
    date: "08/08/2026",
    readTime: "7 phút đọc",
    author: "Careza Research",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    isFeatured: true,
    isSideFeatured: true,
  },
  // 4. Bài viết mới nhất 1
  {
    id: "art-4",
    slug: "cach-ren-luyen-ky-nang-giao-tiep-hieu-qua-trong-cong-viec",
    categorySlug: "ky-nang",
    categoryName: "KỸ NĂNG NGHỀ NGHIỆP",
    title: "Cách rèn luyện kỹ năng giao tiếp hiệu quả trong công việc",
    excerpt: "Lắng nghe chủ động và truyền đạt thông điệp rõ ràng tới đồng nghiệp và cấp trên.",
    date: "15/08/2026",
    readTime: "4 phút đọc",
    author: "Minh Trang",
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80",
    isLatest: true,
  },
  // 5. Bài viết mới nhất 2
  {
    id: "art-5",
    slug: "lo-trinh-phat-trien-su-nghiep-danh-cho-nguoi-moi-di-lam",
    categorySlug: "phat-trien-su-nghiep",
    categoryName: "PHÁT TRIỂN SỰ NGHIỆP",
    title: "Lộ trình phát triển sự nghiệp dành cho người mới đi làm",
    excerpt: "Các giai đoạn tích lũy kinh nghiệm, định vị năng lực và thăng tiến vững chắc.",
    date: "14/08/2026",
    readTime: "6 phút đọc",
    author: "Hoàng Long",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
    isLatest: true,
  },
  // 6. Bài viết mới nhất 3
  {
    id: "art-6",
    slug: "hieu-dung-ve-luong-thuong-va-cac-phuc-loi-doanh-nghiep",
    categorySlug: "luong-phuc-loi",
    categoryName: "LƯƠNG & CHẾ ĐỘ",
    title: "Hiểu đúng về lương thưởng và các phúc lợi trong doanh nghiệp",
    excerpt: "Phân biệt lương Net - Gross, bảo hiểm và các chính sách đãi ngộ chuẩn mực.",
    date: "13/08/2026",
    readTime: "8 phút đọc",
    author: "Ban Pháp Chế",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80",
    isLatest: true,
  },
  // 7. Bài viết mới nhất 4
  {
    id: "art-7",
    slug: "nhung-cau-hoi-phong-van-thuong-gap-va-cach-tra-loi-hieu-qua",
    categorySlug: "tim-viec",
    categoryName: "KINH NGHIỆM TÌM VIỆC",
    title: "Những câu hỏi phỏng vấn thường gặp và cách trả lời hiệu quả",
    excerpt: "Chuẩn bị câu trả lời thuyết phục cho điểm mạnh, điểm yếu và mục tiêu nghề nghiệp.",
    date: "12/08/2026",
    readTime: "7 phút đọc",
    author: "Thu Hà",
    image: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80",
    isLatest: true,
  },
];

// Helper lấy màu badge chuẩn cho từng chuyên mục
const getCategoryBadgeStyle = (categorySlug: string) => {
  switch (categorySlug) {
    case "tim-viec":
      return "bg-blue-50 text-[#0062ff] border-blue-200/80";
    case "ky-nang":
      return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
    case "thi-truong":
      return "bg-purple-50 text-purple-700 border-purple-200/80";
    case "luong-phuc-loi":
      return "bg-amber-50 text-amber-700 border-amber-200/80";
    case "phat-trien-su-nghiep":
      return "bg-pink-50 text-pink-700 border-pink-200/80";
    case "tin-tuc-careza":
      return "bg-teal-50 text-teal-700 border-teal-200/80";
    default:
      return "bg-blue-50 text-[#0062ff] border-blue-100";
  }
};

function HandbookContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentCategorySlug = searchParams.get("category") || "all";
  const [keyword, setKeyword] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(currentCategorySlug);

  useEffect(() => {
    setSelectedCategory(searchParams.get("category") || "all");
  }, [searchParams]);

  const handleCategoryChange = (slug: string) => {
    if (selectedCategory === slug) {
      setSelectedCategory("all");
      router.push("/cam-nang-nghe-nghiep");
    } else {
      setSelectedCategory(slug);
      router.push(`/cam-nang-nghe-nghiep?category=${slug}`);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  // Lọc bài viết
  const filteredArticles = ARTICLES.filter((art) => {
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

  const heroMainArticle = ARTICLES.find((a) => a.isHeroMain) || ARTICLES[0];
  const sideFeaturedArticles = ARTICLES.filter((a) => a.isSideFeatured);
  const latestArticles = ARTICLES.filter((a) => a.isLatest);

  // Khi ở trang chủ chưa filter, hiển thị 4 bài viết mới nhất tách biệt
  const displayLatestArticles = (selectedCategory === "all" && !keyword) ? latestArticles : filteredArticles;

  return (
    <div className="w-full max-w-[1460px] mx-auto px-4 sm:px-6 md:px-8 xl:px-[38px] space-y-4 pb-12 pt-2 bg-[#f7faff]">
      {/* ======================================================== */}
      {/* 1. HERO BANNER: MỞ RỘNG FULL ẢNH BANNER                  */}
      {/* ======================================================== */}
      <div className="relative w-full rounded-[20px] overflow-hidden min-h-[140px] sm:min-h-[150px] lg:min-h-[155px] bg-[#0047ba] shadow-xs p-4 sm:p-5 lg:p-6 flex flex-col justify-between text-white">
        {/* Full Banner Image Background */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <img
            src="/images/camnang.png"
            alt="Careza Cẩm nang nghề nghiệp"
            className="w-full h-full object-cover object-right md:object-[right_center]"
          />
          {/* Smooth left gradient overlay to make text crystal clear */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#022879] via-[#0047ba]/85 md:via-[#0047ba]/70 to-transparent w-full sm:w-[75%] md:w-[62%]" />
        </div>

        {/* Content Bên Trái */}
        <div className="relative z-10 max-w-2xl space-y-2">
          {/* Breadcrumb & Pill */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-white/15 backdrop-blur-xs text-blue-100 text-[10.5px] font-extrabold px-2.5 py-0.5 rounded-full border border-white/20">
              Kiến thức hôm nay, cơ hội ngày mai
            </span>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight m-0 leading-tight">
              Cẩm nang nghề nghiệp
            </h1>
            <p className="text-[11.5px] sm:text-xs text-blue-100 font-medium m-0 mt-0.5 max-w-lg leading-relaxed">
              Chia sẻ kiến thức, kỹ năng và xu hướng giúp bạn phát triển sự nghiệp bền vững.
            </p>
          </div>

          {/* Search Bar Nhỏ Gọn (340–400px) */}
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-[380px] pt-0.5">
            <div className="relative flex items-center bg-white rounded-xl shadow-xs border border-white/80 overflow-hidden">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm kiếm bài viết, chủ đề, kỹ năng..."
                className="w-full pl-9 pr-8 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden font-medium bg-transparent"
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
          <div className="flex flex-wrap items-center gap-1.5 text-[10.5px] text-blue-100/90 font-medium pt-0.5">
            <span className="text-white font-bold">Từ khóa phổ biến:</span>
            {["Kỹ năng mềm", "Phỏng vấn", "CV", "Lương thưởng", "Chuyên ngành"].map((kw) => (
              <button
                key={kw}
                type="button"
                onClick={() => setKeyword(kw)}
                className="bg-white/10 hover:bg-white/20 text-white px-2 py-0.5 rounded-md border border-white/15 transition-colors cursor-pointer text-[10.5px]"
              >
                {kw}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {CATEGORIES.map((cat) => {
          const IconComp = cat.icon;
          const isSelected = selectedCategory === cat.slug;

          return (
            <div
              key={cat.id}
              onClick={() => handleCategoryChange(cat.slug)}
              className={`bg-white rounded-xl px-3 py-2 border transition-all duration-200 cursor-pointer flex items-center gap-2.5 h-[50px] sm:h-[54px] shadow-2xs hover:shadow-xs hover:-translate-y-0.5 ${
                isSelected
                  ? "border-[#0062ff] ring-2 ring-blue-500/20 bg-blue-50/40"
                  : "border-[#E6EDF7] hover:border-blue-300"
              }`}
            >
              <div
                className={`w-7.5 h-7.5 rounded-lg ${cat.iconBg} ${cat.iconColor} flex items-center justify-center shrink-0 border shadow-2xs`}
              >
                <IconComp className="w-4 h-4" />
              </div>
              <span
                className={`text-[11.5px] sm:text-xs font-semibold leading-tight line-clamp-2 transition-colors ${
                  isSelected ? "text-[#0062ff]" : "text-slate-700"
                }`}
              >
                {cat.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* 3. MAIN CONTENT (80%) | RIGHT SIDEBAR (20%)             */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1 items-start">
        
        {/* CỘT CHÍNH (80% / 9 cols) */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          
          {/* SECTION: BÀI VIẾT NỔI BẬT */}
          {selectedCategory === "all" && !keyword && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm sm:text-base font-bold text-slate-800 m-0">
                  Bài viết nổi bật
                </h2>
                <Link
                  href="/cam-nang-nghe-nghiep?category=tim-viec"
                  className="text-xs font-semibold text-[#0062ff] hover:underline inline-flex items-center gap-1"
                >
                  <span>Xem tất cả</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Grid Featured: 1 bài lớn (55%) + 2 bài nhỏ xếp dọc (45%) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                
                {/* 1 Bài viết lớn bên trái (7 cols) */}
                <div className="md:col-span-7">
                  <Link
                    href={`/cam-nang-nghe-nghiep/${heroMainArticle.slug}`}
                    className="group bg-white rounded-2xl border border-[#E6EDF7] hover:border-blue-300 hover:shadow-xs transition-all overflow-hidden flex flex-col sm:flex-row h-full"
                  >
                    {/* Image ~50% */}
                    <div className="sm:w-1/2 aspect-[4/3] sm:aspect-auto overflow-hidden relative bg-slate-100 shrink-0">
                      <img
                        src={heroMainArticle.image}
                        alt={heroMainArticle.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Content bên phải */}
                    <div className="sm:w-1/2 p-4 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border uppercase ${getCategoryBadgeStyle(
                              heroMainArticle.categorySlug
                            )}`}
                          >
                            {heroMainArticle.categoryName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {heroMainArticle.date}
                          </span>
                        </div>

                        <h3 className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-[#0062ff] transition-colors leading-snug m-0 line-clamp-2">
                          {heroMainArticle.title}
                        </h3>

                        <p className="text-[11px] text-slate-500 font-normal line-clamp-2 leading-relaxed m-0">
                          {heroMainArticle.excerpt}
                        </p>
                      </div>

                      <div className="pt-2 flex items-center text-[#0062ff] font-bold text-xs group-hover:translate-x-1 transition-transform">
                        <span>Đọc ngay →</span>
                      </div>
                    </div>
                  </Link>
                </div>

                {/* 2 Bài viết nhỏ xếp dọc bên phải (5 cols) */}
                <div className="md:col-span-5 flex flex-col gap-3">
                  {sideFeaturedArticles.map((art) => (
                    <Link
                      key={art.id}
                      href={`/cam-nang-nghe-nghiep/${art.slug}`}
                      className="group bg-white rounded-2xl border border-[#E6EDF7] hover:border-blue-300 hover:shadow-xs transition-all p-3 flex gap-3 items-center flex-1"
                    >
                      {/* Thumbnail nhỏ */}
                      <div className="w-24 h-20 sm:w-28 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100 relative">
                        <img
                          src={art.image}
                          alt={art.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      <div className="min-w-0 space-y-1 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase truncate max-w-[125px] ${getCategoryBadgeStyle(
                              art.categorySlug
                            )}`}
                          >
                            {art.categoryName}
                          </span>
                          <span className="text-[9.5px] text-slate-400 font-medium">
                            {art.date}
                          </span>
                        </div>

                        <h4 className="text-xs font-semibold text-slate-800 group-hover:text-[#0062ff] transition-colors leading-snug line-clamp-2 m-0">
                          {art.title}
                        </h4>
                      </div>
                    </Link>
                  ))}
                </div>

              </div>
            </div>
          )}

          {/* SECTION: BÀI VIẾT MỚI NHẤT (4 Card / hàng) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-bold text-slate-800 m-0">
                {selectedCategory === "all"
                  ? "Bài viết mới nhất"
                  : `Chuyên mục: ${CATEGORIES.find((c) => c.slug === selectedCategory)?.name}`}
              </h2>
              <Link
                href="/cam-nang-nghe-nghiep"
                className="text-xs font-semibold text-[#0062ff] hover:underline inline-flex items-center gap-1"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {displayLatestArticles.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-2">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
                <h3 className="text-sm font-semibold text-slate-700 m-0">Không tìm thấy bài viết nào</h3>
                <p className="text-xs text-slate-400 m-0">Thử tìm kiếm với từ khóa khác hoặc quay lại tất cả bài viết.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
                {displayLatestArticles.map((art) => (
                  <Link
                    key={art.id}
                    href={`/cam-nang-nghe-nghiep/${art.slug}`}
                    className="group bg-white rounded-2xl border border-[#E6EDF7] hover:border-blue-300 hover:shadow-xs transition-all overflow-hidden flex flex-col justify-between"
                  >
                    {/* Image Ratio ~16:8 */}
                    <div className="w-full aspect-[16/8] overflow-hidden bg-slate-100 relative">
                      <img
                        src={art.image}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[9.5px]">
                          <span
                            className={`font-bold px-2 py-0.5 rounded-full border uppercase truncate max-w-[130px] ${getCategoryBadgeStyle(
                              art.categorySlug
                            )}`}
                          >
                            {art.categoryName}
                          </span>
                          <span className="text-slate-400 font-medium">
                            {art.date}
                          </span>
                        </div>

                        <h3 className="text-xs font-semibold text-slate-800 group-hover:text-[#0062ff] transition-colors leading-snug line-clamp-2 m-0">
                          {art.title}
                        </h3>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* ======================================================== */}
        {/* CỘT PHẢI: GÓC NHÌN CHUYÊN GIA + ĐỀ XUẤT CHỦ ĐỀ (20%)     */}
        {/* ======================================================== */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-3.5">
          
          {/* Card 1: Góc nhìn chuyên gia (Ấm áp, sắc nét) */}
          <div className="bg-[#fffdf5] rounded-2xl p-4 border border-[#fde68a] shadow-2xs space-y-3">
            <div>
              <h3 className="text-xs font-bold text-slate-800 m-0 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Góc nhìn chuyên gia</span>
              </h3>
              <p className="text-[10.5px] text-slate-600 font-normal m-0 mt-0.5 leading-tight">
                Những chia sẻ, lời khuyên thực tế từ các chuyên gia nhân sự.
              </p>
            </div>

            {/* Quote Card */}
            <div className="bg-white rounded-xl p-3 border border-amber-200 shadow-2xs relative">
              <span className="text-amber-500 font-serif text-lg leading-none block font-black mb-1">
                ❝
              </span>
              <p className="text-[11px] text-slate-700 font-normal leading-relaxed m-0 italic">
                Một sự nghiệp bền vững bắt đầu từ việc không ngừng học hỏi và chuẩn bị ngay từ hôm nay.
              </p>
              <span className="text-amber-500 font-serif text-lg leading-none block font-black text-right -mt-1">
                ❞
              </span>
            </div>

            {/* Author Profile */}
            <div className="flex items-center gap-2.5 pt-1">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
                alt="Nguyễn Thị Lan Anh"
                className="w-8 h-8 rounded-full object-cover border-2 border-amber-300 shrink-0 shadow-xs"
              />
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-800 block truncate">
                  Nguyễn Thị Lan Anh
                </span>
                <span className="text-[10px] text-slate-500 font-normal block truncate">
                  HR Director tại Careza
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Đề xuất chủ đề (Xanh mint nổi bật) */}
          <div className="bg-[#f0fdf9] rounded-2xl p-4 border border-[#a7f3d0] shadow-2xs space-y-2.5">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 m-0">
                  Bạn có chủ đề muốn tìm hiểu?
                </h4>
                <p className="text-[10.5px] text-slate-600 font-normal m-0 mt-0.5 leading-snug">
                  Đề xuất chủ đề để chúng tôi sản xuất nội dung phù hợp hơn.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => message.success("Cảm ơn bạn! Careza đã ghi nhận đề xuất.")}
              className="w-full py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-300 shadow-2xs flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <span>Gửi đề xuất</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

        </div>

      </div>

      {/* ======================================================== */}
      {/* 4. SLIM BOTTOM BANNER: “Cùng Careza xây dựng sự nghiệp...” */}
      {/* ======================================================== */}
      <div className="relative w-full rounded-2xl overflow-hidden min-h-[90px] sm:min-h-[100px] bg-gradient-to-r from-[#f0f6ff] via-[#dbeafe] to-[#0047ba] border border-blue-200/80 shadow-2xs p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
        {/* Seamless Image Visual on Right with Soft Feathered Mask */}
        <div className="absolute right-0 top-0 h-full w-[50%] md:w-[42%] pointer-events-none select-none overflow-hidden hidden sm:block [mask-image:linear-gradient(to_left,rgba(0,0,0,1)_60%,transparent_100%)]">
          <img
            src="/images/camnang.png"
            alt="Careza Cẩm nang"
            className="w-full h-full object-cover object-right"
          />
        </div>

        {/* Content Bên Trái */}
        <div className="space-y-1 max-w-lg z-10">
          <h3 className="text-sm sm:text-base font-bold text-slate-800 m-0">
            Cùng Careza xây dựng sự nghiệp vững vàng hơn
          </h3>
          <p className="text-xs text-slate-600 font-normal m-0 leading-relaxed">
            Cập nhật kiến thức mới mỗi ngày để không bỏ lỡ những cơ hội tốt nhất.
          </p>
        </div>

        {/* Decorative Calligraphy on Right */}
        <div className="flex items-center gap-4 z-10 shrink-0 pr-3">
          <div className="text-right -rotate-3 pointer-events-none select-none">
            <span className="font-serif italic text-xs sm:text-sm font-bold text-white block leading-tight drop-shadow-xs">
              Better Knowledge
            </span>
            <span className="font-serif italic text-xs sm:text-sm font-bold text-cyan-200 block leading-tight drop-shadow-xs">
              Brighter Career
            </span>
          </div>
        </div>
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
