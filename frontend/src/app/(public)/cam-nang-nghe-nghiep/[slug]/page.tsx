"use client";

import { use } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  ArrowRight,
  Share2,
  Bookmark,
  ChevronRight,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { message } from "antd";
import {
  HANDBOOK_ARTICLES,
  CAREER_TOOLS,
} from "@/features/public/handbook/handbook-data";

export default function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  // Tìm bài viết theo slug
  const article =
    HANDBOOK_ARTICLES.find((a) => a.slug === slug) ||
    HANDBOOK_ARTICLES[0];

  // Các bài viết liên quan
  const relatedArticles = HANDBOOK_ARTICLES.filter(
    (a) => a.slug !== article.slug && (a.categorySlug === article.categorySlug || a.isFeatured)
  ).slice(0, 3);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      message.success("Đã sao chép liên kết bài viết vào clipboard!");
    }
  };

  const handleBookmark = () => {
    message.success("Đã lưu bài viết vào danh sách yêu thích của bạn!");
  };

  return (
    <div className="w-full bg-[#f8fafc] text-[#0F172A] font-sans lg:h-[calc(100vh-72px)] lg:overflow-hidden flex flex-col">
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col min-h-0 pt-3 sm:pt-3.5 pb-4 lg:pb-3">
        {/* 1. BREADCRUMB: Nhỏ gọn, khoảng cách sát vừa vặn */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-2.5 sm:mb-3 leading-none shrink-0">
          <Link href="/" className="text-[#2563EB] hover:underline transition-colors">
            Trang chủ
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <Link href="/cam-nang" className="text-[#2563EB] hover:underline transition-colors">
            Cẩm nang nghề nghiệp
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <Link
            href={`/cam-nang?category=${article.categorySlug}`}
            className="text-[#2563EB] hover:underline transition-colors"
          >
            {article.categoryName}
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-[#0F172A] font-semibold line-clamp-1 max-w-sm sm:max-w-md">
            {article.title}
          </span>
        </nav>

        {/* 2. GRID BỐ CỤC CHÍNH: Cuộn độc lập 2 cột trên Desktop (lg:), cuộn trang bình thường trên Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start flex-1 min-h-0 lg:overflow-hidden">
          {/* CỘT NỘI DUNG CHÍNH (Cuộn riêng biệt trên Desktop) */}
          <div className="lg:col-span-8 lg:h-full lg:overflow-y-auto lg:pr-2.5 custom-column-scroll overscroll-contain">
            <article className="bg-white px-5 sm:px-7 pt-4 sm:pt-5 pb-6 sm:pb-8 rounded-2xl border border-[#CBD5E1] shadow-2xs space-y-5">
              {/* Header bài viết: Gọn gàng, không khoảng trắng thừa phía trên */}
              <div className="space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Link
                    href={`/cam-nang?category=${article.categorySlug}`}
                    className="inline-block bg-[#EFF6FF] text-[#2563EB] hover:bg-[#2563EB] hover:text-white px-3 py-1 rounded-full text-xs font-bold transition-all border border-[#BFDBFE]"
                  >
                    {article.categoryName}
                  </Link>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleShare}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 cursor-pointer transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Chia sẻ</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleBookmark}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 cursor-pointer transition-colors"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Lưu bài</span>
                    </button>
                  </div>
                </div>

                <h1 className="text-xl sm:text-2xl md:text-[26px] font-black text-[#0F172A] leading-tight m-0 tracking-tight">
                  {article.title}
                </h1>

                {/* Thông tin tác giả & ngày đăng */}
                <div className="flex flex-wrap items-center justify-between py-2.5 border-y border-slate-100 text-xs text-slate-500 font-medium gap-3">
                  <div className="flex items-center gap-2.5">
                    {article.authorAvatar ? (
                      <img
                        src={article.authorAvatar}
                        alt={article.author}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-xs">
                        {article.author.substring(0, 1)}
                      </div>
                    )}
                    <div>
                      <h4 className="text-[#0F172A] font-bold text-xs m-0">{article.author}</h4>
                      <span className="text-[11px] text-slate-400">{article.authorRole}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-[#64748B] text-xs">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {article.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {article.readTime}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ảnh đại diện bài viết */}
              <div className="rounded-2xl overflow-hidden aspect-[16/9] w-full bg-slate-100 shadow-2xs border border-slate-200/80">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Tóm tắt mở đầu */}
              <div className="p-4 bg-[#EFF6FF]/70 rounded-2xl border border-blue-100 text-[#0F172A] text-sm leading-relaxed font-medium">
                {article.excerpt}
              </div>

              {/* Nội dung bài viết chi tiết */}
              <div
                className="prose prose-slate max-w-none text-[#0F172A] leading-relaxed text-sm sm:text-[15px] space-y-4"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* Footer bài viết: Tag & Điều hướng */}
              <div className="pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-slate-600">Chủ đề:</span>
                  <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium">
                    #{article.categoryName}
                  </span>
                  <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium">
                    #Career2026
                  </span>
                </div>

                <Link
                  href="/cam-nang"
                  className="text-xs font-bold text-[#2563EB] hover:underline inline-flex items-center gap-1"
                >
                  <span>← Quay lại Cẩm nang</span>
                </Link>
              </div>
            </article>
          </div>

          {/* CỘT SIDEBAR (Cuộn riêng biệt trên Desktop) */}
          <aside className="lg:col-span-4 lg:h-full lg:overflow-y-auto lg:pr-1 custom-column-scroll overscroll-contain space-y-4">
            {/* Card 1: Bài viết liên quan */}
            <div className="bg-white p-4.5 rounded-2xl border border-[#CBD5E1] shadow-2xs space-y-3.5">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#2563EB]" />
                <h3 className="text-sm font-bold text-[#0F172A] m-0">Bài viết cùng chủ đề</h3>
              </div>

              <div className="space-y-3">
                {relatedArticles.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/cam-nang/${rel.slug}`}
                    className="group flex gap-3 items-start p-1.5 -mx-1.5 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-20 h-16 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                      <img
                        src={rel.image}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <h4 className="text-xs font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors line-clamp-2 leading-snug m-0">
                        {rel.title}
                      </h4>
                      <span className="text-[10.5px] text-[#64748B] block">{rel.readTime}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Card 2: Tiện ích CAREZA gợi ý */}
            <div className="bg-gradient-to-br from-[#EFF6FF] via-[#F0F9FF] to-[#DBEAFE] p-4.5 rounded-2xl border border-[#BFDBFE] shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#2563EB]" />
                <h3 className="text-sm font-bold text-[#0F172A] m-0">Công cụ hỗ trợ ứng tuyển</h3>
              </div>

              <p className="text-xs text-[#475569] leading-relaxed m-0">
                Sử dụng các tiện ích miễn phí của CAREZA để tối ưu hóa hồ sơ và chuẩn bị tốt nhất trước nhà tuyển dụng.
              </p>

              <div className="space-y-2 pt-1">
                {CAREER_TOOLS.slice(0, 3).map((tool) => (
                  <Link
                    key={tool.id}
                    href={tool.href}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-blue-50/60 border border-slate-200/80 hover:border-[#2563EB]/40 text-xs font-semibold text-[#0F172A] group transition-all"
                  >
                    <span className="group-hover:text-[#2563EB] transition-colors">{tool.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#2563EB] group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Card 3: Banner Tìm việc */}
            <div className="bg-gradient-to-r from-[#00348a] to-[#0047cc] p-4.5 rounded-2xl text-white shadow-2xs space-y-2.5">
              <h4 className="text-sm font-bold m-0 leading-snug">
                Bạn đang tìm kiếm cơ hội việc làm mới?
              </h4>
              <p className="text-xs text-blue-100 m-0 leading-relaxed font-normal">
                Hàng ngàn việc làm chất lượng cao từ các doanh nghiệp uy tín đang chờ đón bạn.
              </p>
              <Link
                href="/viec-lam"
                className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-white hover:bg-slate-50 text-[#00348a] font-bold text-xs transition-colors shadow-2xs"
              >
                <span>Khám phá việc làm ngay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {/* Style thanh cuộn nhỏ mảnh tinh tế cho 2 cột trên Desktop */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-column-scroll {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }
        .custom-column-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .custom-column-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-column-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 9999px;
        }
        .custom-column-scroll::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `,
        }}
      />
    </div>
  );
}
