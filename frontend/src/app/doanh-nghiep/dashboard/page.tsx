"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { Progress } from "antd";
import {
  Briefcase,
  Users,
  Eye,
  Star,
  Calendar,
  Plus,
  Search,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  Bot,
  FileText,
  BarChart3,
  UserCheck,
  AlertCircle,
  Mail,
  MapPin,
  DollarSign,
  Clock,
  Sparkles,
} from "lucide-react";

export default function EmployerDashboardPage() {
  const { companyInfo } = useAuthStore();
  const [chartRange, setChartRange] = useState<"7d" | "30d" | "90d">("30d");

  const companyName = companyInfo?.companyName || "Google Vietnam";

  const [hoveredDateIdx, setHoveredDateIdx] = useState<number>(3); // Default 16/08

  const chartDataList = [
    { date: "01/08", newCandidates: 280, matchCandidates: 75, views: 580, x: 60 },
    { date: "06/08", newCandidates: 390, matchCandidates: 110, views: 820, x: 195 },
    { date: "11/08", newCandidates: 490, matchCandidates: 130, views: 980, x: 330 },
    { date: "16/08", newCandidates: 620, matchCandidates: 158, views: 1240, x: 465 },
    { date: "21/08", newCandidates: 530, matchCandidates: 135, views: 1040, x: 600 },
    { date: "26/08", newCandidates: 480, matchCandidates: 120, views: 920, x: 735 },
    { date: "31/08", newCandidates: 590, matchCandidates: 148, views: 1180, x: 870 },
  ];

  // Helper to map values (0 -> 1400) to SVG Y (190 -> 25)
  const getY = (val: number) => 190 - (val / 1400) * 165;

  const currentHovered = chartDataList[hoveredDateIdx] || chartDataList[3];

  return (
    <div className="space-y-5 max-w-[1680px] mx-auto w-full pb-10">
      {/* ======================================================== */}
      {/* MAIN 2-COLUMN LAYOUT: MAIN DASHBOARD (~74%) | WIDGETS (~26%) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* ====================================================== */}
        {/* CỘT TRÁI: MAIN CONTENT (xl:col-span-8 2xl:col-span-9) */}
        {/* ====================================================== */}
        <div className="xl:col-span-8 2xl:col-span-9 space-y-5">
          {/* ---------------- 1. HERO BANNER (WITH nhatuyendung.png) ---------------- */}
          <div
            className="relative w-full rounded-[22px] overflow-hidden p-6 sm:p-7 text-white shadow-md border border-blue-900/40 flex flex-col justify-center min-h-[175px]"
            style={{
              backgroundImage: "url('/images/nhatuyendung.png')",
              backgroundSize: "cover",
              backgroundPosition: "center right",
              backgroundRepeat: "no-repeat",
            }}
          >
            {/* Dark Blue Overlay on left for maximum readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#071642]/95 via-[#0d2875]/75 to-transparent pointer-events-none" />

            <div className="relative z-10 max-w-xl space-y-2.5">
              <h2 className="text-xl sm:text-2xl font-black text-white m-0 tracking-tight leading-snug">
                Tuyển dụng thông minh – Kết nối nhân tài
              </h2>
              <p className="text-xs sm:text-[13px] text-blue-100/90 font-medium leading-relaxed m-0">
                Careza đồng hành cùng doanh nghiệp xây dựng đội ngũ chất lượng và phát triển bền vững.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1.5">
                <Link href="/doanh-nghiep/tin-tuyen-dung/them-moi">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl bg-white hover:bg-blue-50 text-[#0062ff] font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Đăng tin tuyển dụng</span>
                  </button>
                </Link>

                <Link href="/doanh-nghiep/ung-vien">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/30 backdrop-blur-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Tìm kiếm ứng viên</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* ---------------- 2. 5 KPI STATS CARDS ---------------- */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
            {/* KPI 1 */}
            <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-2xs flex flex-col justify-between space-y-2 hover:border-blue-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 truncate">
                  Tin đang tuyển
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black text-slate-900 block leading-tight">
                  23
                </span>
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5 mt-0.5">
                  <TrendingUp className="w-3 h-3" />
                  <span>15% so với tháng trước</span>
                </span>
              </div>
            </div>

            {/* KPI 2 */}
            <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-2xs flex flex-col justify-between space-y-2 hover:border-emerald-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 truncate">
                  Ứng viên mới
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black text-slate-900 block leading-tight">
                  1,248
                </span>
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5 mt-0.5">
                  <TrendingUp className="w-3 h-3" />
                  <span>18% so với tháng trước</span>
                </span>
              </div>
            </div>

            {/* KPI 3 */}
            <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-2xs flex flex-col justify-between space-y-2 hover:border-purple-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 truncate">
                  Lượt xem tin
                </span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Eye className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black text-slate-900 block leading-tight">
                  24,680
                </span>
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5 mt-0.5">
                  <TrendingUp className="w-3 h-3" />
                  <span>25% so với tháng trước</span>
                </span>
              </div>
            </div>

            {/* KPI 4 */}
            <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-2xs flex flex-col justify-between space-y-2 hover:border-amber-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 truncate">
                  Ứng viên phù hợp
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Star className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black text-slate-900 block leading-tight">
                  312
                </span>
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5 mt-0.5">
                  <TrendingUp className="w-3 h-3" />
                  <span>16% so với tháng trước</span>
                </span>
              </div>
            </div>

            {/* KPI 5 */}
            <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-2xs flex flex-col justify-between space-y-2 hover:border-rose-300 transition-all col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 truncate">
                  Lịch phỏng vấn
                </span>
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black text-slate-900 block leading-tight">
                  45
                </span>
                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-0.5 mt-0.5">
                  <span>Sắp tới tuần này</span>
                </span>
              </div>
            </div>
          </div>

          {/* ---------------- 3. BIỂU ĐỒ TUYỂN DỤNG (HÀNG 1 - FULL WIDTH) ---------------- */}
          <div className="w-full bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-2xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-black text-slate-900 m-0">
                  Biểu đồ tuyển dụng
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">
                  Xu hướng tương tác và thu hút ứng viên theo thời gian thực
                </span>
              </div>

              <div className="flex items-center p-0.5 bg-slate-100 rounded-xl text-[11px] font-bold">
                {(["7d", "30d", "90d"] as const).map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setChartRange(range)}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      chartRange === range
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {range === "7d" ? "7 ngày" : range === "30d" ? "30 ngày" : "90 ngày"}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart Legend */}
            <div className="flex items-center gap-5 text-xs font-bold text-slate-600 flex-wrap pt-1">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#0062ff] shadow-xs" />
                <span>Ứng viên mới</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs" />
                <span>Ứng viên phù hợp</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-600 shadow-xs" />
                <span>Lượt xem</span>
              </span>
            </div>

            {/* Interactive SVG Spline Area Chart */}
            <div className="relative w-full h-64 pt-2">
              <svg
                className="w-full h-full overflow-visible"
                viewBox="0 0 920 220"
                preserveAspectRatio="none"
              >
                <defs>
                  {/* Purple Area Gradient */}
                  <linearGradient id="purpleAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9333ea" stopOpacity="0.28" />
                    <stop offset="60%" stopColor="#9333ea" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#9333ea" stopOpacity="0" />
                  </linearGradient>

                  {/* Blue Area Gradient */}
                  <linearGradient id="blueAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0062ff" stopOpacity="0.25" />
                    <stop offset="60%" stopColor="#0062ff" stopOpacity="0.06" />
                    <stop offset="100%" stopColor="#0062ff" stopOpacity="0" />
                  </linearGradient>

                  {/* Emerald Area Gradient */}
                  <linearGradient id="greenAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
                    <stop offset="60%" stopColor="#10b981" stopOpacity="0.05" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                <line x1="45" y1="25" x2="900" y2="25" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1.2" />
                <line x1="45" y1="66" x2="900" y2="66" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1.2" />
                <line x1="45" y1="107" x2="900" y2="107" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1.2" />
                <line x1="45" y1="148" x2="900" y2="148" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1.2" />
                <line x1="45" y1="190" x2="900" y2="190" stroke="#cbd5e1" strokeWidth="1.5" />

                {/* Y-Axis Value Labels */}
                <text x="36" y="29" fontSize="10.5" fill="#94a3b8" textAnchor="end" fontWeight="bold">1.250</text>
                <text x="36" y="70" fontSize="10.5" fill="#94a3b8" textAnchor="end" fontWeight="bold">1.000</text>
                <text x="36" y="111" fontSize="10.5" fill="#94a3b8" textAnchor="end" fontWeight="bold">750</text>
                <text x="36" y="152" fontSize="10.5" fill="#94a3b8" textAnchor="end" fontWeight="bold">500</text>
                <text x="36" y="194" fontSize="10.5" fill="#94a3b8" textAnchor="end" fontWeight="bold">250</text>

                {/* Area 1: Lượt xem (Purple Area) */}
                <path
                  d="M 60 120 C 130 90, 160 85, 195 90 C 260 95, 290 70, 330 75 C 390 80, 420 40, 465 44 C 530 48, 560 70, 600 68 C 670 65, 700 80, 735 82 C 800 84, 830 50, 870 51 L 870 190 L 60 190 Z"
                  fill="url(#purpleAreaGrad)"
                />
                {/* Line 1: Lượt xem (Purple Line) */}
                <path
                  d="M 60 120 C 130 90, 160 85, 195 90 C 260 95, 290 70, 330 75 C 390 80, 420 40, 465 44 C 530 48, 560 70, 600 68 C 670 65, 700 80, 735 82 C 800 84, 830 50, 870 51"
                  fill="none"
                  stroke="#9333ea"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />

                {/* Area 2: Ứng viên mới (Blue Area) */}
                <path
                  d="M 60 157 C 130 145, 160 140, 195 144 C 260 148, 290 125, 330 132 C 390 140, 420 115, 465 117 C 530 120, 560 125, 600 128 C 670 132, 700 135, 735 133 C 800 130, 830 120, 870 121 L 870 190 L 60 190 Z"
                  fill="url(#blueAreaGrad)"
                />
                {/* Line 2: Ứng viên mới (Blue Line) */}
                <path
                  d="M 60 157 C 130 145, 160 140, 195 144 C 260 148, 290 125, 330 132 C 390 140, 420 115, 465 117 C 530 120, 560 125, 600 128 C 670 132, 700 135, 735 133 C 800 130, 830 120, 870 121"
                  fill="none"
                  stroke="#0062ff"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />

                {/* Area 3: Ứng viên phù hợp (Emerald Area) */}
                <path
                  d="M 60 181 C 130 176, 160 174, 195 177 C 260 180, 290 172, 330 175 C 390 178, 420 170, 465 171 C 530 173, 560 174, 600 174 C 670 175, 700 176, 735 176 C 800 175, 830 172, 870 173 L 870 190 L 60 190 Z"
                  fill="url(#greenAreaGrad)"
                />
                {/* Line 3: Ứng viên phù hợp (Emerald Line) */}
                <path
                  d="M 60 181 C 130 176, 160 174, 195 177 C 260 180, 290 172, 330 175 C 390 178, 420 170, 465 171 C 530 173, 560 174, 600 174 C 670 175, 700 176, 735 176 C 800 175, 830 172, 870 173"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />

                {/* Vertical Guideline at current active point */}
                <line
                  x1={currentHovered.x}
                  y1="25"
                  x2={currentHovered.x}
                  y2="190"
                  stroke="#64748b"
                  strokeDasharray="4 4"
                  strokeWidth="1.5"
                  className="transition-all duration-200"
                />

                {/* Glowing Indicator Dots for Active Date */}
                {/* Purple Dot */}
                <circle
                  cx={currentHovered.x}
                  cy={getY(currentHovered.views)}
                  r="7"
                  fill="#9333ea"
                  fillOpacity="0.25"
                />
                <circle
                  cx={currentHovered.x}
                  cy={getY(currentHovered.views)}
                  r="4.5"
                  fill="#9333ea"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                />

                {/* Blue Dot */}
                <circle
                  cx={currentHovered.x}
                  cy={getY(currentHovered.newCandidates)}
                  r="7"
                  fill="#0062ff"
                  fillOpacity="0.25"
                />
                <circle
                  cx={currentHovered.x}
                  cy={getY(currentHovered.newCandidates)}
                  r="4.5"
                  fill="#0062ff"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                />

                {/* Emerald Dot */}
                <circle
                  cx={currentHovered.x}
                  cy={getY(currentHovered.matchCandidates)}
                  r="7"
                  fill="#10b981"
                  fillOpacity="0.25"
                />
                <circle
                  cx={currentHovered.x}
                  cy={getY(currentHovered.matchCandidates)}
                  r="4.5"
                  fill="#10b981"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                />

                {/* Hover Trigger Hotspots */}
                {chartDataList.map((item, idx) => (
                  <rect
                    key={idx}
                    x={item.x - 50}
                    y="10"
                    width="100"
                    height="190"
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredDateIdx(idx)}
                    onClick={() => setHoveredDateIdx(idx)}
                  />
                ))}
              </svg>

              {/* Dynamic Floating Tooltip Card */}
              <div
                className="absolute top-2 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200/90 shadow-xl text-xs space-y-1.5 z-20 pointer-events-none transition-all duration-200 ease-out"
                style={{
                  left: `${(currentHovered.x / 920) * 100}%`,
                  transform:
                    currentHovered.x > 700
                      ? "translateX(-95%)"
                      : currentHovered.x < 200
                      ? "translateX(0%)"
                      : "translateX(-50%)",
                }}
              >
                <div className="font-extrabold text-slate-800 pb-1 border-b border-slate-100 flex items-center justify-between gap-4">
                  <span>{currentHovered.date}/2026</span>
                  <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-600 text-[10px] font-bold">
                    Chi tiết
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 text-[#0062ff]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#0062ff]" />
                    <span>Ứng viên mới:</span>
                  </span>
                  <strong className="font-black text-sm">{currentHovered.newCandidates}</strong>
                </div>
                <div className="flex items-center justify-between gap-4 text-emerald-600">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Ứng viên phù hợp:</span>
                  </span>
                  <strong className="font-black text-sm">{currentHovered.matchCandidates}</strong>
                </div>
                <div className="flex items-center justify-between gap-4 text-purple-600">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-600" />
                    <span>Lượt xem:</span>
                  </span>
                  <strong className="font-black text-sm">{currentHovered.views.toLocaleString()}</strong>
                </div>
              </div>

              {/* X Axis Dates with active highlight */}
              <div className="flex justify-between text-[11px] text-slate-500 font-bold px-5 pt-1">
                {chartDataList.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setHoveredDateIdx(idx)}
                    onMouseEnter={() => setHoveredDateIdx(idx)}
                    className={`cursor-pointer transition-all ${
                      hoveredDateIdx === idx
                        ? "text-[#0062ff] font-black scale-110"
                        : "text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    {item.date}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ---------------- 4. PIPELINE TUYỂN DỤNG (HÀNG 2 - FULL WIDTH) ---------------- */}
          <div className="w-full bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-[13.5px] font-black text-slate-900 m-0">
                Pipeline tuyển dụng
              </h3>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer">
                <span>Tất cả vị trí</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>

            {/* 5 Kanban Columns across full width */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {/* 1. Mới ứng tuyển */}
              <div className="bg-[#eff6ff] rounded-2xl p-3 border border-blue-200/80 space-y-2.5 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-blue-200/60">
                    <span className="text-xs font-black text-blue-900 truncate">
                      Mới ứng tuyển
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white font-black text-[10px]">
                      128
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-2xs space-y-0.5">
                      <span className="text-xs font-bold text-slate-900 block truncate">
                        Nguyễn Minh Anh
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate font-medium">Product Manager</span>
                      <span className="text-[9px] text-slate-400 block">2 giờ trước</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-2xs space-y-0.5">
                      <span className="text-xs font-bold text-slate-900 block truncate">
                        Trần Quốc Bảo
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate font-medium">UX/UI Designer</span>
                      <span className="text-[9px] text-slate-400 block">6 giờ trước</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-2xs space-y-0.5">
                      <span className="text-xs font-bold text-slate-900 block truncate">
                        Phạm Thu Hằng
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate font-medium">Data Analyst</span>
                      <span className="text-[9px] text-slate-400 block">6 giờ trước</span>
                    </div>
                  </div>
                </div>
                <Link href="/doanh-nghiep/ung-vien" className="text-[11px] font-bold text-[#0062ff] text-center block pt-1 hover:underline">
                  +125 ứng viên
                </Link>
              </div>

              {/* 2. Sàng lọc CV */}
              <div className="bg-[#ecfeff] rounded-2xl p-3 border border-cyan-200/80 space-y-2.5 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-cyan-200/60">
                    <span className="text-xs font-black text-cyan-900 truncate">
                      Sàng lọc CV
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-600 text-white font-black text-[10px]">
                      86
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-2xs space-y-0.5">
                      <span className="text-xs font-bold text-slate-900 block truncate">
                        Lê Hoàng Nam
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate font-medium">Frontend Developer</span>
                      <span className="text-[9px] text-slate-400 block">Hôm qua</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-2xs space-y-0.5">
                      <span className="text-xs font-bold text-slate-900 block truncate">
                        Vũ Nhật Linh
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate font-medium">HR Generalist</span>
                      <span className="text-[9px] text-slate-400 block">2 ngày trước</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-2xs space-y-0.5">
                      <span className="text-xs font-bold text-slate-900 block truncate">
                        Đỗ Minh Khoa
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate font-medium">Product Manager</span>
                      <span className="text-[9px] text-slate-400 block">2 ngày trước</span>
                    </div>
                  </div>
                </div>
                <Link href="/doanh-nghiep/ung-vien" className="text-[11px] font-bold text-cyan-700 text-center block pt-1 hover:underline">
                  +83 ứng viên
                </Link>
              </div>

              {/* 3. Phỏng vấn */}
              <div className="bg-[#fffbeb] rounded-2xl p-3 border border-amber-200/80 space-y-2.5 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-amber-200/60">
                    <span className="text-xs font-black text-amber-900 truncate">
                      Phỏng vấn
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-600 text-white font-black text-[10px]">
                      32
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-2xs space-y-0.5">
                      <span className="text-xs font-bold text-slate-900 block truncate">
                        Nguyễn Thu Trang
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate font-medium">Senior UX/UI</span>
                      <span className="text-[9px] text-slate-400 block">Hôm qua</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-2xs space-y-0.5">
                      <span className="text-xs font-bold text-slate-900 block truncate">
                        Phan Hải Đăng
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate font-medium">Data Scientist</span>
                      <span className="text-[9px] text-slate-400 block">2 ngày trước</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-2xs space-y-0.5">
                      <span className="text-xs font-bold text-slate-900 block truncate">
                        Bùi Thanh Tâm
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate font-medium">DevOps Engineer</span>
                      <span className="text-[9px] text-slate-400 block">2 ngày trước</span>
                    </div>
                  </div>
                </div>
                <Link href="/doanh-nghiep/ung-vien" className="text-[11px] font-bold text-amber-700 text-center block pt-1 hover:underline">
                  +29 ứng viên
                </Link>
              </div>

              {/* 4. Offer */}
              <div className="bg-[#faf5ff] rounded-2xl p-3 border border-purple-200/80 space-y-2.5 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-purple-200/60">
                    <span className="text-xs font-black text-purple-900 truncate">
                      Offer
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white font-black text-[10px]">
                      12
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-2xs space-y-0.5">
                      <span className="text-xs font-bold text-slate-900 block truncate">
                        Nguyễn Văn Nam
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate font-medium">Product Manager</span>
                      <span className="text-[9px] text-slate-400 block">Hôm qua</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-2xs space-y-0.5">
                      <span className="text-xs font-bold text-slate-900 block truncate">
                        Lê Anh Tuấn
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate font-medium">Frontend Developer</span>
                      <span className="text-[9px] text-slate-400 block">3 ngày trước</span>
                    </div>
                  </div>
                </div>
                <Link href="/doanh-nghiep/ung-vien" className="text-[11px] font-bold text-purple-700 text-center block pt-1 hover:underline">
                  +10 ứng viên
                </Link>
              </div>

              {/* 5. Nhận việc */}
              <div className="bg-[#f0fdf4] rounded-2xl p-3 border border-emerald-200/80 space-y-2.5 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-emerald-200/60">
                    <span className="text-xs font-black text-emerald-900 truncate">
                      Nhận việc
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[10px]">
                      8
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-2xs space-y-0.5">
                      <span className="text-xs font-bold text-slate-900 block truncate">
                        Trần Minh Đức
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate font-medium">Data Analyst</span>
                      <span className="text-[9px] text-slate-400 block">1 tuần trước</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-2xs space-y-0.5">
                      <span className="text-xs font-bold text-slate-900 block truncate">
                        Hoàng Yến Nhi
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate font-medium">UX/UI Designer</span>
                      <span className="text-[9px] text-slate-400 block">2 ngày trước</span>
                    </div>
                  </div>
                </div>
                <Link href="/doanh-nghiep/ung-vien" className="text-[11px] font-bold text-emerald-700 text-center block pt-1 hover:underline">
                  +6 ứng viên
                </Link>
              </div>
            </div>
          </div>

          {/* ---------------- 4. TIN TUYỂN DỤNG GẦN ĐÂY & LỊCH PHỎNG VẤN SẮP TỚI ---------------- */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4.5">
            {/* Tin tuyển dụng gần đây */}
            <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-2xs space-y-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <h3 className="text-xs sm:text-[13.5px] font-black text-slate-900 m-0">
                    Tin tuyển dụng gần đây
                  </h3>
                  <Link
                    href="/doanh-nghiep/tin-tuyen-dung"
                    className="text-xs font-bold text-[#0062ff] hover:underline flex items-center gap-1"
                  >
                    <span>Xem tất cả (23)</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="divide-y divide-slate-100">
                  {/* Job 1 */}
                  <div className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 p-2 flex items-center justify-center shrink-0 shadow-xs">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-slate-900 truncate">
                            Product Manager
                          </span>
                          <span className="px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                            Đang hoạt động
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium mt-1 flex-wrap">
                          <span className="flex items-center gap-1 text-slate-600">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span>Hà Nội</span>
                          </span>
                          <span className="flex items-center gap-1 text-slate-600">
                            <Briefcase className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>3 - 5 năm</span>
                          </span>
                          <span className="flex items-center gap-1 text-slate-600">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>25 - 40 triệu VND</span>
                          </span>
                          <span className="flex items-center gap-1 text-slate-600">
                            <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span>Toàn thời gian</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-slate-900">28</div>
                      <div className="text-[10px] text-slate-400">Ứng viên mới • 620 xem</div>
                    </div>
                  </div>

                  {/* Job 2 */}
                  <div className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 p-2 flex items-center justify-center shrink-0 shadow-xs">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-slate-900 truncate">
                            Senior UX/UI Designer
                          </span>
                          <span className="px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                            Đang hoạt động
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium mt-1 flex-wrap">
                          <span className="flex items-center gap-1 text-slate-600">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span>TP. Hồ Chí Minh</span>
                          </span>
                          <span className="flex items-center gap-1 text-slate-600">
                            <Briefcase className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>2 - 4 năm</span>
                          </span>
                          <span className="flex items-center gap-1 text-slate-600">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>18 - 30 triệu VND</span>
                          </span>
                          <span className="flex items-center gap-1 text-slate-600">
                            <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span>Toàn thời gian</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-slate-900">16</div>
                      <div className="text-[10px] text-slate-400">Ứng viên mới • 458 xem</div>
                    </div>
                  </div>

                  {/* Job 3 */}
                  <div className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 p-2 flex items-center justify-center shrink-0 shadow-xs">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-slate-900 truncate">
                            Frontend Developer
                          </span>
                          <span className="px-2 py-0.2 rounded-full bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-200">
                            Sắp hết hạn (2 ngày)
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium mt-1 flex-wrap">
                          <span className="flex items-center gap-1 text-slate-600">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span>Đà Nẵng</span>
                          </span>
                          <span className="flex items-center gap-1 text-slate-600">
                            <Briefcase className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>2 - 4 năm</span>
                          </span>
                          <span className="flex items-center gap-1 text-slate-600">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>18 - 28 triệu VND</span>
                          </span>
                          <span className="flex items-center gap-1 text-slate-600">
                            <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span>Toàn thời gian</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-slate-900">24</div>
                      <div className="text-[10px] text-slate-400">Ứng viên mới • 398 xem</div>
                    </div>
                  </div>

                  {/* Job 4 */}
                  <div className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 p-2 flex items-center justify-center shrink-0 shadow-xs">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-slate-900 truncate">
                            Data Analyst
                          </span>
                          <span className="px-2 py-0.2 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px] border border-slate-200">
                            Hết hạn
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium mt-1 flex-wrap">
                          <span className="flex items-center gap-1 text-slate-600">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span>Hà Nội</span>
                          </span>
                          <span className="flex items-center gap-1 text-slate-600">
                            <Briefcase className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>1 - 3 năm</span>
                          </span>
                          <span className="flex items-center gap-1 text-slate-600">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>12 - 20 triệu VND</span>
                          </span>
                          <span className="flex items-center gap-1 text-slate-600">
                            <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span>Toàn thời gian</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-slate-900">12</div>
                      <div className="text-[10px] text-slate-400">Ứng viên mới • 210 xem</div>
                    </div>
                  </div>
                </div>
              </div>

              <Link
                href="/doanh-nghiep/tin-tuyen-dung"
                className="text-xs font-bold text-[#0062ff] text-center block pt-2 hover:underline border-t border-slate-100"
              >
                Xem tất cả 23 tin tuyển dụng →
              </Link>
            </div>

            {/* Lịch phỏng vấn sắp tới */}
            <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-2xs space-y-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <h3 className="text-xs sm:text-[13.5px] font-black text-slate-900 m-0">
                    Lịch phỏng vấn sắp tới
                  </h3>
                  <Link
                    href="/doanh-nghiep/ung-vien"
                    className="text-xs font-bold text-[#0062ff] hover:underline flex items-center gap-1"
                  >
                    <span>Xem lịch đầy đủ</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="divide-y divide-slate-100">
                  {/* Interview 1 */}
                  <div className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-[#0062ff] flex flex-col items-center justify-center shrink-0">
                        <span className="text-sm font-black leading-none">22</span>
                        <span className="text-[9px] font-bold uppercase mt-0.5">THG 8</span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10.5px] font-bold text-slate-400">
                          10:00 - 11:00
                        </div>
                        <div className="text-xs font-black text-slate-900 truncate">
                          Nguyễn Minh Anh
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium truncate">
                          Product Manager • Vòng 1: Phỏng vấn HR
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="text-right hidden sm:block">
                        <span className="text-xs font-bold text-slate-800 block">Mai Phương</span>
                        <span className="text-[10px] text-slate-400 block">HR</span>
                      </div>
                      <button
                        type="button"
                        className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0062ff] font-bold text-xs transition-colors cursor-pointer"
                      >
                        Chi tiết
                      </button>
                    </div>
                  </div>

                  {/* Interview 2 */}
                  <div className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-[#0062ff] flex flex-col items-center justify-center shrink-0">
                        <span className="text-sm font-black leading-none">22</span>
                        <span className="text-[9px] font-bold uppercase mt-0.5">THG 8</span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10.5px] font-bold text-slate-400">
                          14:00 - 15:00
                        </div>
                        <div className="text-xs font-black text-slate-900 truncate">
                          Trần Quốc Bảo
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium truncate">
                          Senior UX/UI Designer • Vòng 2: Phỏng vấn chuyên môn
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="text-right hidden sm:block">
                        <span className="text-xs font-bold text-slate-800 block">Huyền Trân</span>
                        <span className="text-[10px] text-slate-400 block">Lead Designer</span>
                      </div>
                      <button
                        type="button"
                        className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0062ff] font-bold text-xs transition-colors cursor-pointer"
                      >
                        Chi tiết
                      </button>
                    </div>
                  </div>

                  {/* Interview 3 */}
                  <div className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex flex-col items-center justify-center shrink-0">
                        <span className="text-sm font-black leading-none">23</span>
                        <span className="text-[9px] font-bold uppercase mt-0.5">THG 8</span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10.5px] font-bold text-slate-400">
                          09:30 - 10:30
                        </div>
                        <div className="text-xs font-black text-slate-900 truncate">
                          Lê Hoàng Nam
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium truncate">
                          Frontend Developer • Vòng 1: Phỏng vấn HR
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="text-right hidden sm:block">
                        <span className="text-xs font-bold text-slate-800 block">Đức Anh</span>
                        <span className="text-[10px] text-slate-400 block">HR</span>
                      </div>
                      <button
                        type="button"
                        className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0062ff] font-bold text-xs transition-colors cursor-pointer"
                      >
                        Chi tiết
                      </button>
                    </div>
                  </div>

                  {/* Interview 4 */}
                  <div className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex flex-col items-center justify-center shrink-0">
                        <span className="text-sm font-black leading-none">23</span>
                        <span className="text-[9px] font-bold uppercase mt-0.5">THG 8</span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10.5px] font-bold text-slate-400">
                          15:00 - 16:00
                        </div>
                        <div className="text-xs font-black text-slate-900 truncate">
                          Phạm Thu Hằng
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium truncate">
                          Data Analyst • Vòng 2: Test chuyên môn
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="text-right hidden sm:block">
                        <span className="text-xs font-bold text-slate-800 block">Minh Khoa</span>
                        <span className="text-[10px] text-slate-400 block">Data Lead</span>
                      </div>
                      <button
                        type="button"
                        className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0062ff] font-bold text-xs transition-colors cursor-pointer"
                      >
                        Chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <Link
                href="/doanh-nghiep/ung-vien"
                className="text-xs font-bold text-[#0062ff] text-center block pt-2 hover:underline border-t border-slate-100"
              >
                Xem tất cả lịch phỏng vấn →
              </Link>
            </div>
          </div>

          {/* ---------------- 5. HIỆU SUẤT TUYỂN DỤNG & MẸO TUYỂN DỤNG ---------------- */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4.5">
            {/* Hiệu suất tuyển dụng */}
            <div className="xl:col-span-8 bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-2xs space-y-3">
              <h3 className="text-xs sm:text-[13.5px] font-black text-slate-900 m-0">
                Hiệu suất tuyển dụng
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {/* Metric 1 */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[10.5px] font-bold text-slate-500 block leading-tight">
                    Tỷ lệ phản hồi ứng viên
                  </span>
                  <span className="text-lg font-black text-slate-900 block">85%</span>
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" />
                    <span>12% so với tháng trước</span>
                  </span>
                </div>

                {/* Metric 2 */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[10.5px] font-bold text-slate-500 block leading-tight">
                    Thời gian tuyển trung bình
                  </span>
                  <span className="text-lg font-black text-slate-900 block">18 ngày</span>
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                    <TrendingDown className="w-3 h-3" />
                    <span>3 ngày so với tháng trước</span>
                  </span>
                </div>

                {/* Metric 3 */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[10.5px] font-bold text-slate-500 block leading-tight">
                    Tỷ lệ ứng viên phù hợp
                  </span>
                  <span className="text-lg font-black text-slate-900 block">26%</span>
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" />
                    <span>8% so với tháng trước</span>
                  </span>
                </div>

                {/* Metric 4 */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[10.5px] font-bold text-slate-500 block leading-tight">
                    Tỷ lệ nhận offer
                  </span>
                  <span className="text-lg font-black text-slate-900 block">68%</span>
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" />
                    <span>5% so với tháng trước</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Mẹo tuyển dụng */}
            <div className="xl:col-span-4 bg-gradient-to-br from-[#fffbeb] to-[#fef3c7] rounded-2xl p-5 border border-amber-200/80 shadow-2xs space-y-2.5 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-amber-900 font-black text-xs">
                  <span>💡 Mẹo tuyển dụng</span>
                </div>
                <p className="text-[11.5px] text-amber-950/80 font-medium leading-relaxed m-0">
                  Tin tuyển dụng có mô tả chi tiết và phúc lợi rõ ràng thường thu hút nhiều ứng viên chất lượng hơn gấp <strong>2.5 lần</strong>!
                </p>
              </div>
              <Link
                href="/doanh-nghiep/tin-tuyen-dung"
                className="text-xs font-black text-amber-800 hover:text-amber-950 flex items-center gap-1 hover:underline"
              >
                <span>Tối ưu tin tuyển dụng ngay</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* ====================================================== */}
        {/* CỘT PHẢI: RIGHT WIDGETS STACK (xl:col-span-4 2xl:col-span-3) */}
        {/* ====================================================== */}
        <div className="xl:col-span-4 2xl:col-span-3 space-y-5 sticky top-4 max-h-[calc(100vh-80px)] overflow-y-auto pr-1">
          {/* ---------------- 1. THÔNG BÁO MỚI ---------------- */}
          <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h3 className="text-xs sm:text-[13.5px] font-black text-slate-900 m-0">
                Thông báo mới
              </h3>
              <Link
                href="/doanh-nghiep/thong-bao"
                className="text-[11px] font-bold text-[#0062ff] hover:underline"
              >
                Xem tất cả
              </Link>
            </div>

            <div className="space-y-3">
              {/* Notification 1 */}
              <div className="flex items-start gap-2.5 text-xs">
                <div className="w-7 h-7 rounded-xl bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0 mt-0.5">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-slate-700 font-medium m-0 leading-snug">
                    Ứng viên <strong className="text-slate-900">Nguyễn Minh Anh</strong> đã ứng tuyển vị trí <span className="text-[#0062ff]">Product Manager</span>
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-0.5">2 giờ trước</span>
                </div>
              </div>

              {/* Notification 2 */}
              <div className="flex items-start gap-2.5 text-xs">
                <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-slate-700 font-medium m-0 leading-snug">
                    Lịch phỏng vấn với <strong className="text-slate-900">Trần Quốc Bảo</strong> vào <span className="text-emerald-700 font-bold">14:00 hôm nay</span>
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-0.5">3 giờ trước</span>
                </div>
              </div>

              {/* Notification 3 */}
              <div className="flex items-start gap-2.5 text-xs">
                <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-slate-700 font-medium m-0 leading-snug">
                    Tin tuyển dụng <strong className="text-slate-900">&quot;Frontend Developer&quot;</strong> sắp hết hạn (2 ngày nữa)
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-0.5">5 giờ trước</span>
                </div>
              </div>

              {/* Notification 4 */}
              <div className="flex items-start gap-2.5 text-xs">
                <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-slate-700 font-medium m-0 leading-snug">
                    Ứng viên <strong className="text-slate-900">Phạm Thu Hằng</strong> đã phản hồi thư mời phỏng vấn
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-0.5">1 ngày trước</span>
                </div>
              </div>
            </div>
          </div>

          {/* ---------------- 2. GÓI DỊCH VỤ HIỆN TẠI ---------------- */}
          <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h3 className="text-xs sm:text-[13.5px] font-black text-slate-900 m-0">
                Gói dịch vụ hiện tại
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-black text-[10.5px]">
                Enterprise
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 font-medium">
                  Hiệu lực đến: <strong className="text-slate-700">12/12/2026</strong>
                </span>
                <span className="text-[10.5px] font-bold text-blue-600">còn 105 ngày</span>
              </div>
              <Link href="/doanh-nghiep/goi-dich-vu" className="block pt-1">
                <button
                  type="button"
                  className="w-full py-1.5 px-3 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Gia hạn gói
                </button>
              </Link>
            </div>

            {/* 3 Progress Bars */}
            <div className="space-y-2.5 pt-1 text-xs">
              <div>
                <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
                  <span>Tin tuyển dụng</span>
                  <span className="text-[#0062ff]">23 / 50</span>
                </div>
                <Progress percent={46} showInfo={false} strokeColor="#0062ff" size="small" />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
                  <span>Lượt xem CV</span>
                  <span className="text-emerald-600">1,248 / 5,000</span>
                </div>
                <Progress percent={25} showInfo={false} strokeColor="#10b981" size="small" />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
                  <span>Email liên hệ</span>
                  <span className="text-purple-600">312 / 2,000</span>
                </div>
                <Progress percent={15.6} showInfo={false} strokeColor="#9333ea" size="small" />
              </div>
            </div>
          </div>

          {/* ---------------- 3. THAO TÁC NHANH (2x3 GRID) ---------------- */}
          <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-2xs space-y-3">
            <h3 className="text-xs sm:text-[13.5px] font-black text-slate-900 m-0">
              Thao tác nhanh
            </h3>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {/* Action 1 */}
              <Link href="/doanh-nghiep/tin-tuyen-dung/them-moi" className="block group">
                <div className="p-3 bg-blue-50/70 hover:bg-blue-100 rounded-xl border border-blue-100 text-center space-y-1.5 transition-all h-full flex flex-col items-center justify-center">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-2xs">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="text-[10.5px] font-bold text-blue-900 block leading-tight">
                    Đăng tin
                  </span>
                </div>
              </Link>

              {/* Action 2 */}
              <Link href="/doanh-nghiep/ung-vien" className="block group">
                <div className="p-3 bg-emerald-50/70 hover:bg-emerald-100 rounded-xl border border-emerald-100 text-center space-y-1.5 transition-all h-full flex flex-col items-center justify-center">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                    <Search className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10.5px] font-bold text-emerald-900 block leading-tight">
                    Tìm ứng viên
                  </span>
                </div>
              </Link>

              {/* Action 3 */}
              <Link href="/doanh-nghiep/tin-tuyen-dung/them-moi" className="block group">
                <div className="p-3 bg-purple-50/70 hover:bg-purple-100 rounded-xl border border-purple-100 text-center space-y-1.5 transition-all h-full flex flex-col items-center justify-center">
                  <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-2xs">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10.5px] font-bold text-purple-900 block leading-tight">
                    Tạo JD mẫu
                  </span>
                </div>
              </Link>

              {/* Action 4 */}
              <Link href="/doanh-nghiep/ung-vien" className="block group">
                <div className="p-3 bg-indigo-50/70 hover:bg-indigo-100 rounded-xl border border-indigo-100 text-center space-y-1.5 transition-all h-full flex flex-col items-center justify-center">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-2xs">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10.5px] font-bold text-indigo-900 block leading-tight">
                    Talent Pool
                  </span>
                </div>
              </Link>

              {/* Action 5 */}
              <Link href="/doanh-nghiep/ung-vien" className="block group">
                <div className="p-3 bg-rose-50/70 hover:bg-rose-100 rounded-xl border border-rose-100 text-center space-y-1.5 transition-all h-full flex flex-col items-center justify-center">
                  <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-2xs">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10.5px] font-bold text-rose-900 block leading-tight">
                    Lịch PV
                  </span>
                </div>
              </Link>

              {/* Action 6 */}
              <Link href="/doanh-nghiep/dashboard" className="block group">
                <div className="p-3 bg-cyan-50/70 hover:bg-cyan-100 rounded-xl border border-cyan-100 text-center space-y-1.5 transition-all h-full flex flex-col items-center justify-center">
                  <div className="w-7 h-7 rounded-lg bg-cyan-600 text-white flex items-center justify-center shadow-2xs">
                    <BarChart3 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10.5px] font-bold text-cyan-900 block leading-tight">
                    Báo cáo
                  </span>
                </div>
              </Link>
            </div>
          </div>

          {/* ---------------- 4. AI HỖ TRỢ TUYỂN DỤNG ---------------- */}
          <div className="bg-gradient-to-br from-[#1e1b4b] via-[#2e1065] to-[#4c0519] rounded-2xl p-5 border border-purple-500/40 text-white space-y-3.5 shadow-md relative overflow-hidden">
            <div className="absolute -right-3 -bottom-3 w-28 h-28 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-500/30 border border-purple-400/40 flex items-center justify-center text-purple-200">
                  <Bot className="w-4 h-4" />
                </div>
                <h3 className="text-xs sm:text-[13.5px] font-black text-white m-0">
                  AI hỗ trợ tuyển dụng
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-black text-[9.5px]">
                MỚI
              </span>
            </div>

            <div className="relative z-10 space-y-1.5 text-xs text-purple-100 font-medium">
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="text-purple-300">✓</span>
                <span>Gợi ý ứng viên phù hợp</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="text-purple-300">✓</span>
                <span>Phân tích CV bằng AI</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="text-purple-300">✓</span>
                <span>Tối ưu tin tuyển dụng</span>
              </div>
            </div>

            <Link href="/ai-career" className="block pt-1 relative z-10">
              <button
                type="button"
                className="w-full py-2 px-3 rounded-xl bg-white hover:bg-purple-50 text-purple-900 font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Trải nghiệm ngay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
