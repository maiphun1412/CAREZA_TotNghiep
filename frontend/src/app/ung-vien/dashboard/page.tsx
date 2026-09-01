"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { Progress, Tag } from "antd";
import {
  FilePdfOutlined,
  MoreOutlined,
  HeartOutlined,
  HeartFilled,
} from "@ant-design/icons";

export default function CandidateDashboardPage() {
  const { user } = useAuthStore();
  const [bookmarkedJobs, setBookmarkedJobs] = useState<string[]>([]);

  const toggleBookmark = (jobId: string) => {
    setBookmarkedJobs((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  };

  const candidateName = user?.fullName || "Mai Phương";

  return (
    <div className="w-full max-w-[1460px] mx-auto px-4 sm:px-6 md:px-8 xl:px-[38px] space-y-6">
      {/* ========================================================================= */}
      {/* 1. WELCOME BANNER FULL-WIDTH (Màu sắc đậm đà, sắc nét & nổi bật) */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-[#d6e7ff] via-[#e0efff] to-[#ebf4ff] rounded-[32px] p-6 sm:p-8 border border-[#bfdbfe] flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_8px_24px_-4px_rgba(0,98,255,0.08)] relative overflow-hidden">
        {/* Background Decorative Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-60 h-60 bg-blue-300/30 rounded-full blur-3xl pointer-events-none" />

        {/* Bên trái: Lời chào & Nút */}
        <div className="space-y-3 max-w-xl relative z-10">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 m-0 tracking-tight">
            Xin chào, {candidateName} 👋
          </h2>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed m-0 font-medium">
            Hoàn thiện hồ sơ để Careza gợi ý những cơ hội việc làm phù hợp nhất với kinh nghiệm của bạn.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <Link
              href="/ung-vien/ho-so"
              className="bg-[#0062ff] hover:bg-[#0052cc] text-white font-extrabold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md shadow-blue-600/30 transition-all hover:scale-[1.02] inline-flex items-center gap-1.5"
            >
              <span>Hoàn thiện hồ sơ</span>
              <span>→</span>
            </Link>
            <button
              type="button"
              className="bg-white hover:bg-blue-50/60 text-slate-800 border border-blue-200 font-extrabold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              Xem hướng dẫn
            </button>
          </div>
        </div>

        {/* Bên phải: Widget hoàn thiện hồ sơ + Illustration */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-blue-200/90 shadow-md flex items-center gap-6 w-full md:w-auto min-w-[360px] justify-between relative z-10">
          <div className="space-y-1.5 flex-1">
            <span className="text-xs font-bold text-slate-500 block">Hồ sơ hoàn thiện</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-900">75%</span>
            </div>
            <div className="w-44 my-1">
              <Progress percent={75} showInfo={false} strokeColor="#0062ff" strokeWidth={8} />
            </div>
            <span className="text-xs font-bold text-slate-500 block pt-0.5">Bạn đang tiến rất tốt!</span>
          </div>

          {/* Illustration */}
          <div className="relative shrink-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-blue-100/80 flex items-center justify-center relative overflow-hidden border border-blue-200/60">
              <span className="material-symbols-outlined text-4xl text-[#0062ff]">laptop_mac</span>
            </div>
            <span className="absolute -top-2 -right-2 bg-white text-[10px] font-extrabold text-[#0062ff] border border-blue-200 shadow-2xs px-2.5 py-0.5 rounded-full whitespace-nowrap">
              Cơ hội tốt hơn đang chờ bạn
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. QUICK STATS (4 Card ngang rộng rãi) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: CV của tôi (Viền xanh dương) */}
        <div className="bg-white p-5 sm:p-6 rounded-[24px] border border-blue-200/90 hover:border-blue-300 shadow-xs flex items-center justify-between transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">description</span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 block leading-none">3</span>
              <span className="text-xs sm:text-sm font-bold text-slate-600 mt-1 block">CV của tôi</span>
            </div>
          </div>
          <Link href="/ung-vien/cv?tab=builder" className="text-xs font-bold text-primary hover:underline flex items-center">
            + Tạo CV mới &gt;
          </Link>
        </div>

        {/* Card 2: Đã ứng tuyển (Viền xanh cyan/sky) */}
        <div className="bg-white p-5 sm:p-6 rounded-[24px] border border-sky-200/90 hover:border-sky-300 shadow-xs flex items-center justify-between transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">send</span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 block leading-none">8</span>
              <span className="text-xs sm:text-sm font-bold text-slate-600 mt-1 block">Đã ứng tuyển</span>
            </div>
          </div>
          <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-2.5 py-1 rounded-md">
            +2 tháng này
          </span>
        </div>

        {/* Card 3: Việc đã lưu (Viền hồng rose) */}
        <div className="bg-white p-5 sm:p-6 rounded-[24px] border border-rose-200/90 hover:border-rose-300 shadow-xs flex items-center justify-between transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">favorite</span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 block leading-none">12</span>
              <span className="text-xs sm:text-sm font-bold text-slate-600 mt-1 block">Việc đã lưu</span>
            </div>
          </div>
          <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-2.5 py-1 rounded-md">
            +4 tháng này
          </span>
        </div>

        {/* Card 4: Lịch phỏng vấn (Viền tím indigo) */}
        <div className="bg-white p-5 sm:p-6 rounded-[24px] border border-indigo-200/90 hover:border-indigo-300 shadow-xs flex items-center justify-between transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">calendar_month</span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 block leading-none">2</span>
              <span className="text-xs sm:text-sm font-bold text-slate-600 mt-1 block">Lịch phỏng vấn</span>
            </div>
          </div>
          <Link href="/ung-vien/lich-phong-van" className="text-xs font-bold text-primary hover:underline">
            Xem lịch →
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TIẾN TRÌNH ỨNG TUYỂN (~67%) + HỒ SƠ NGHỀ NGHIỆP (~33%) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Card trái: Tiến trình ứng tuyển (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-7 rounded-[28px] border border-slate-200/70 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base sm:text-lg font-black text-slate-800 m-0">Tiến trình ứng tuyển</h3>
              <Link href="/ung-vien/ung-tuyen" className="text-xs sm:text-sm font-bold text-primary hover:underline">
                Xem tất cả ứng tuyển →
              </Link>
            </div>

            {/* Danh sách 3 ứng tuyển */}
            <div className="space-y-4">
              {/* Item 1 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-[240px]">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-2 flex items-center justify-center shrink-0 shadow-2xs">
                    <img src="https://commons.wikimedia.org/wiki/Special:Redirect/file/FPT_Software_logo.svg" alt="FPT" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-800 m-0 leading-tight">Frontend Developer</h4>
                    <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">FPT Software • Ứng tuyển: 28/08/2025</p>
                  </div>
                </div>

                {/* Status & Pipeline */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <span className="bg-blue-50 text-primary text-xs font-bold px-3 py-1 rounded-full self-start sm:self-center">
                    Đang sàng lọc
                  </span>
                  {/* Pipeline 4 steps */}
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <span className="flex items-center gap-1.5 text-primary font-bold">
                      <span className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-[9px]">✓</span> Đã ứng tuyển
                    </span>
                    <span className="w-6 h-[2px] bg-primary"></span>
                    <span className="flex items-center gap-1.5 text-primary font-bold">
                      <span className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-[9px]">✓</span> Sàng lọc
                    </span>
                    <span className="w-6 h-[2px] bg-slate-200"></span>
                    <span className="text-slate-400 font-normal">Phỏng vấn</span>
                    <span className="w-6 h-[2px] bg-slate-200"></span>
                    <span className="text-slate-400 font-normal">Kết quả</span>
                  </div>
                </div>
              </div>

              {/* Item 2 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-[240px]">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-2 flex items-center justify-center shrink-0 shadow-2xs">
                    <img src="https://commons.wikimedia.org/wiki/Special:Redirect/file/Viettel_logo_2021.svg" alt="Viettel" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-800 m-0 leading-tight">Business Analyst</h4>
                    <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">Viettel • Ứng tuyển: 26/08/2025</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-3 py-1 rounded-full self-start sm:self-center">
                    Đã ứng tuyển
                  </span>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <span className="flex items-center gap-1.5 text-primary font-bold">
                      <span className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-[9px]">✓</span> Đã ứng tuyển
                    </span>
                    <span className="w-6 h-[2px] bg-slate-200"></span>
                    <span className="text-slate-400 font-normal">Sàng lọc</span>
                    <span className="w-6 h-[2px] bg-slate-200"></span>
                    <span className="text-slate-400 font-normal">Phỏng vấn</span>
                    <span className="w-6 h-[2px] bg-slate-200"></span>
                    <span className="text-slate-400 font-normal">Kết quả</span>
                  </div>
                </div>
              </div>

              {/* Item 3 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-[240px]">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-2 flex items-center justify-center shrink-0 shadow-2xs">
                    <img src="https://commons.wikimedia.org/wiki/Special:Redirect/file/Shopee.svg" alt="Shopee" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-800 m-0 leading-tight">Product Marketing Intern</h4>
                    <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">Shopee • Ứng tuyển: 20/08/2025</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <span className="bg-amber-50 text-amber-600 text-xs font-bold px-3 py-1 rounded-full self-start sm:self-center">
                    Đang phỏng vấn
                  </span>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <span className="flex items-center gap-1.5 text-primary font-bold">
                      <span className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-[9px]">✓</span> Đã ứng tuyển
                    </span>
                    <span className="w-6 h-[2px] bg-primary"></span>
                    <span className="flex items-center gap-1.5 text-primary font-bold">
                      <span className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-[9px]">✓</span> Sàng lọc
                    </span>
                    <span className="w-6 h-[2px] bg-amber-500"></span>
                    <span className="flex items-center gap-1.5 text-amber-600 font-bold">
                      <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[9px]">●</span> Phỏng vấn
                    </span>
                    <span className="w-6 h-[2px] bg-slate-200"></span>
                    <span className="text-slate-400 font-normal">Kết quả</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card phải: Hồ sơ nghề nghiệp (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 sm:p-7 rounded-[28px] border border-slate-200/70 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base sm:text-lg font-black text-slate-800 m-0">Hồ sơ nghề nghiệp</h3>
              <Link href="/ung-vien/ho-so" className="text-xs sm:text-sm font-bold text-primary hover:underline">
                Cập nhật hồ sơ →
              </Link>
            </div>

            {/* Progress Circle & Text */}
            <div className="flex items-center gap-5 mb-5">
              <Progress
                type="circle"
                percent={75}
                size={80}
                strokeColor="#0F52BA"
                strokeWidth={9}
                format={(p) => <span className="font-extrabold text-sm text-slate-800">{p}%</span>}
              />
              <div>
                <h4 className="text-sm sm:text-base font-bold text-slate-800 m-0 leading-snug">
                  Hồ sơ của bạn đã khá đầy đủ!
                </h4>
                <p className="text-xs text-slate-500 m-0 mt-1 leading-relaxed">
                  Hoàn thiện thêm để tăng cơ hội được nhà tuyển dụng chú ý.
                </p>
              </div>
            </div>

            {/* Khối pastel hồng/cam nhẹ gợi ý bổ sung */}
            <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-4 space-y-2.5">
              <span className="font-extrabold text-rose-800 block text-xs uppercase tracking-wide">
                Bạn có thể bổ sung thêm:
              </span>
              <ul className="space-y-2 text-slate-700 font-medium m-0 pl-0 list-none text-xs sm:text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-rose-500 font-bold">📌</span> Kỹ năng chuyên môn
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rose-500 font-bold">📌</span> Chứng chỉ
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rose-500 font-bold">📌</span> Dự án cá nhân
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. VIỆC LÀM PHÙ HỢP VỚI BẠN (3 Card Carousel) */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 sm:p-7 rounded-[28px] border border-slate-200/70 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-800 m-0">Việc làm phù hợp với bạn</h3>
            <p className="text-xs sm:text-sm text-slate-500 m-0 mt-0.5 font-medium">Dựa trên hồ sơ và hoạt động của bạn</p>
          </div>
          <Link href="/viec-lam" className="text-xs sm:text-sm font-bold text-primary hover:underline">
            Xem tất cả việc làm →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Job Card 1 */}
          <div className="bg-slate-50/70 hover:bg-white p-5 rounded-2xl border border-slate-200/70 hover:border-blue-200 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 p-1.5 flex items-center justify-center">
                    <img src="https://commons.wikimedia.org/wiki/Special:Redirect/file/FPT_Software_logo.svg" alt="FPT" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-800 m-0 line-clamp-1">Frontend Developer</h4>
                    <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">FPT Software</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleBookmark("job-1")}
                  className="text-slate-400 hover:text-rose-500 cursor-pointer p-1 text-base border-none bg-transparent"
                >
                  {bookmarkedJobs.includes("job-1") ? <HeartFilled className="text-rose-500" /> : <HeartOutlined />}
                </button>
              </div>

              <div className="flex items-center gap-1.5 my-2.5">
                <span className="bg-amber-50 text-amber-700 text-xs font-bold px-2.5 py-0.5 rounded-md">
                  Gợi ý cho bạn
                </span>
              </div>

              <div className="text-xs text-slate-600 space-y-1.5 mb-4 font-medium">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">pin_drop</span>
                  <span>TP. Hồ Chí Minh</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">payments</span>
                  <span className="font-black text-slate-800 text-sm">15 - 25 triệu</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-2">
                <Tag className="bg-white border border-slate-200 text-slate-700 font-semibold rounded-md text-xs px-2.5 py-0.5 m-0">React</Tag>
                <Tag className="bg-white border border-slate-200 text-slate-700 font-semibold rounded-md text-xs px-2.5 py-0.5 m-0">TypeScript</Tag>
                <Tag className="bg-white border border-slate-200 text-slate-700 font-semibold rounded-md text-xs px-2.5 py-0.5 m-0">Next.js</Tag>
              </div>
            </div>

            <span className="text-xs text-slate-400 pt-3 border-t border-slate-200/60 block font-medium">
              Đăng 2 ngày trước
            </span>
          </div>

          {/* Job Card 2 */}
          <div className="bg-slate-50/70 hover:bg-white p-5 rounded-2xl border border-slate-200/70 hover:border-blue-200 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 p-1.5 flex items-center justify-center">
                    <img src="https://commons.wikimedia.org/wiki/Special:Redirect/file/Viettel_logo_2021.svg" alt="Viettel" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-800 m-0 line-clamp-1">Business Analyst</h4>
                    <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">Viettel</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleBookmark("job-2")}
                  className="text-slate-400 hover:text-rose-500 cursor-pointer p-1 text-base border-none bg-transparent"
                >
                  {bookmarkedJobs.includes("job-2") ? <HeartFilled className="text-rose-500" /> : <HeartOutlined />}
                </button>
              </div>

              <div className="flex items-center gap-1.5 my-2.5">
                <span className="bg-amber-50 text-amber-700 text-xs font-bold px-2.5 py-0.5 rounded-md">
                  Gợi ý cho bạn
                </span>
              </div>

              <div className="text-xs text-slate-600 space-y-1.5 mb-4 font-medium">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">pin_drop</span>
                  <span>Hà Nội</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">payments</span>
                  <span className="font-black text-slate-800 text-sm">18 - 30 triệu</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-2">
                <Tag className="bg-white border border-slate-200 text-slate-700 font-semibold rounded-md text-xs px-2.5 py-0.5 m-0">BA</Tag>
                <Tag className="bg-white border border-slate-200 text-slate-700 font-semibold rounded-md text-xs px-2.5 py-0.5 m-0">SQL</Tag>
                <Tag className="bg-white border border-slate-200 text-slate-700 font-semibold rounded-md text-xs px-2.5 py-0.5 m-0">Communication</Tag>
              </div>
            </div>

            <span className="text-xs text-slate-400 pt-3 border-t border-slate-200/60 block font-medium">
              Đăng 1 ngày trước
            </span>
          </div>

          {/* Job Card 3 */}
          <div className="bg-slate-50/70 hover:bg-white p-5 rounded-2xl border border-slate-200/70 hover:border-blue-200 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 p-1.5 flex items-center justify-center font-black text-emerald-600 text-sm">
                    Grab
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-800 m-0 line-clamp-1">Product Manager</h4>
                    <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">Grab Việt Nam</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleBookmark("job-3")}
                  className="text-slate-400 hover:text-rose-500 cursor-pointer p-1 text-base border-none bg-transparent"
                >
                  {bookmarkedJobs.includes("job-3") ? <HeartFilled className="text-rose-500" /> : <HeartOutlined />}
                </button>
              </div>

              <div className="flex items-center gap-1.5 my-2.5">
                <span className="bg-amber-50 text-amber-700 text-xs font-bold px-2.5 py-0.5 rounded-md">
                  Gợi ý cho bạn
                </span>
              </div>

              <div className="text-xs text-slate-600 space-y-1.5 mb-4 font-medium">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">pin_drop</span>
                  <span>TP. Hồ Chí Minh</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">payments</span>
                  <span className="font-black text-slate-800 text-sm">25 - 40 triệu</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-2">
                <Tag className="bg-white border border-slate-200 text-slate-700 font-semibold rounded-md text-xs px-2.5 py-0.5 m-0">Product</Tag>
                <Tag className="bg-white border border-slate-200 text-slate-700 font-semibold rounded-md text-xs px-2.5 py-0.5 m-0">Strategy</Tag>
                <Tag className="bg-white border border-slate-200 text-slate-700 font-semibold rounded-md text-xs px-2.5 py-0.5 m-0">Analytics</Tag>
              </div>
            </div>

            <span className="text-xs text-slate-400 pt-3 border-t border-slate-200/60 block font-medium">
              Đăng 3 ngày trước
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. HÀNG 3 CỘT (CV của tôi | Hoạt động gần đây | Lịch phỏng vấn sắp tới) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột 1: CV của tôi */}
        <div className="bg-white p-6 sm:p-7 rounded-[28px] border border-slate-200/70 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base sm:text-lg font-black text-slate-800 m-0">CV của tôi</h3>
              <Link href="/ung-vien/cv" className="text-xs sm:text-sm font-bold text-primary hover:underline">
                Quản lý CV →
              </Link>
            </div>

            {/* 2 Items CV */}
            <div className="space-y-3.5">
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-12 rounded-lg bg-blue-100 text-primary flex items-center justify-center text-xl">
                    <FilePdfOutlined />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 m-0 line-clamp-1">CV Frontend Developer</h4>
                    <p className="text-xs text-slate-400 m-0 mt-0.5">Cập nhật 2 ngày trước</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-blue-50 text-primary text-[10px] font-bold px-2 py-0.5 rounded">
                    CV chính
                  </span>
                  <button className="text-slate-400 hover:text-slate-600 p-1 border-none bg-transparent cursor-pointer">
                    <MoreOutlined />
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-12 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center text-xl">
                    <FilePdfOutlined />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 m-0 line-clamp-1">CV UI/UX Designer</h4>
                    <p className="text-xs text-slate-400 m-0 mt-0.5">Cập nhật 5 ngày trước</p>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-slate-600 p-1 border-none bg-transparent cursor-pointer">
                  <MoreOutlined />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center gap-3 pt-5 mt-4 border-t border-slate-100">
            <Link
              href="/ung-vien/cv?tab=builder"
              className="flex-1 text-center py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-bold transition-all"
            >
              + Tạo CV mới
            </Link>
            <Link
              href="/ung-vien/cv?tab=upload"
              className="flex-1 text-center py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-bold transition-all"
            >
              Tải CV lên
            </Link>
          </div>
        </div>

        {/* Cột 2: Hoạt động gần đây */}
        <div className="bg-white p-6 sm:p-7 rounded-[28px] border border-slate-200/70 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base sm:text-lg font-black text-slate-800 m-0">Hoạt động gần đây</h3>
              <Link href="/ung-vien/ung-tuyen" className="text-xs sm:text-sm font-bold text-primary hover:underline">
                Xem tất cả →
              </Link>
            </div>

            {/* 4 Timeline items */}
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-50 text-primary flex items-center justify-center text-sm shrink-0 mt-0.5">
                  ✈
                </span>
                <div>
                  <p className="text-slate-800 font-semibold m-0 leading-tight">
                    Đã ứng tuyển vào <strong>Frontend Developer - FPT Software</strong>
                  </p>
                  <span className="text-xs text-slate-400">2 giờ trước</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center text-sm shrink-0 mt-0.5">
                  ♥
                </span>
                <div>
                  <p className="text-slate-800 font-semibold m-0 leading-tight">
                    Đã lưu việc <strong>Business Analyst - Viettel</strong>
                  </p>
                  <span className="text-xs text-slate-400">5 giờ trước</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm shrink-0 mt-0.5">
                  👤
                </span>
                <div>
                  <p className="text-slate-800 font-semibold m-0 leading-tight">
                    Đã cập nhật <strong>hồ sơ nghề nghiệp</strong>
                  </p>
                  <span className="text-xs text-slate-400">1 ngày trước</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm shrink-0 mt-0.5">
                  📄
                </span>
                <div>
                  <p className="text-slate-800 font-semibold m-0 leading-tight">
                    Đã tạo CV mới: <strong>CV UI/UX Designer</strong>
                  </p>
                  <span className="text-xs text-slate-400">2 ngày trước</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cột 3: Lịch phỏng vấn sắp tới */}
        <div className="bg-white p-6 sm:p-7 rounded-[28px] border border-slate-200/70 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base sm:text-lg font-black text-slate-800 m-0">Lịch phỏng vấn sắp tới</h3>
              <Link href="/ung-vien/lich-phong-van" className="text-xs sm:text-sm font-bold text-primary hover:underline">
                Xem lịch →
              </Link>
            </div>

            {/* Card Phỏng vấn */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 p-1.5 flex items-center justify-center">
                  <img src="https://commons.wikimedia.org/wiki/Special:Redirect/file/Viettel_logo_2021.svg" alt="Viettel" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-800 m-0">Business Analyst</h4>
                  <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">Viettel</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <span className="material-symbols-outlined text-base text-slate-400">calendar_month</span>
                  <span>Thứ 6, 05/09/2025 - 10:00</span>
                </div>
                <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-md">
                  Đã xác nhận
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 text-xs sm:text-sm">
                <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-slate-400">videocam</span>
                  <span>Hình thức: Online</span>
                </span>
                <Link
                  href="/ung-vien/lich-phong-van"
                  className="bg-primary hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-4 py-1.5 rounded-xl transition-all"
                >
                  Xem chi tiết
                </Link>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-2 text-center">
            <Link href="/ung-vien/lich-phong-van" className="text-xs sm:text-sm font-bold text-primary hover:underline">
              Xem tất cả lịch phỏng vấn →
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. FOOTER STRIP NHỎ */}
      {/* ========================================================================= */}
      <div className="bg-blue-50/80 border border-blue-100/80 rounded-2xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2 text-slate-700 font-medium">
          <span className="text-amber-500 text-base">💡</span>
          <span>
            <strong>Mỗi hành động hôm nay</strong> sẽ giúp bạn đến gần hơn với công việc mơ ước.
          </span>
        </div>
        <span className="text-primary font-bold">
          Careza luôn đồng hành cùng bạn! ♥
        </span>
      </div>
    </div>
  );
}
