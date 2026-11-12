"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { employerService } from "@/services/employer.service";
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
  ChevronDown,
  FileText,
  BarChart3,
  UserCheck,
  AlertCircle,
  Mail,
  DollarSign,
  Clock,
  Sparkles,
} from "lucide-react";

export default function EmployerDashboardPage() {
  const { companyInfo } = useAuthStore();
  const [chartRange, setChartRange] = useState<"7d" | "30d" | "90d">("30d");
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await employerService.getDashboard();
        if (res?.data?.dashboard) {
          setDashboardData(res.data.dashboard);
        }
      } catch (err) {
        console.error("Lỗi khi tải dashboard doanh nghiệp:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const companyName = dashboardData?.company_name || companyInfo?.companyName || "Doanh nghiệp tuyển dụng";

  const [hoveredDateIdx, setHoveredDateIdx] = useState<number>(3);

  const chartDataList = dashboardData?.chart_data && dashboardData.chart_data.length > 0
    ? dashboardData.chart_data
    : [
      { date: "01/08", newCandidates: 280, matchCandidates: 75, views: 580, x: 60 },
      { date: "06/08", newCandidates: 390, matchCandidates: 110, views: 820, x: 195 },
      { date: "11/08", newCandidates: 490, matchCandidates: 130, views: 980, x: 330 },
      { date: "16/08", newCandidates: 620, matchCandidates: 158, views: 1240, x: 465 },
      { date: "21/08", newCandidates: 530, matchCandidates: 135, views: 1040, x: 600 },
      { date: "26/08", newCandidates: 480, matchCandidates: 120, views: 920, x: 735 },
      { date: "31/08", newCandidates: 590, matchCandidates: 148, views: 1180, x: 870 },
    ];

  const maxVal = Math.max(
    ...chartDataList.map((d: any) => Math.max(d.views || 0, d.newCandidates || 0, d.matchCandidates || 0)),
    10
  );

  const getY = (val: number) => 190 - (val / (maxVal * 1.2)) * 165;

  const generateLinePath = (key: 'views' | 'newCandidates' | 'matchCandidates') => {
    return chartDataList.map((d: any, idx: number) => `${idx === 0 ? 'M' : 'L'} ${d.x} ${getY(d[key] || 0)}`).join(" ");
  };

  const generateAreaPath = (key: 'views' | 'newCandidates' | 'matchCandidates') => {
    const linePart = chartDataList.map((d: any, idx: number) => `${idx === 0 ? 'M' : 'L'} ${d.x} ${getY(d[key] || 0)}`).join(" ");
    const lastX = chartDataList[chartDataList.length - 1]?.x || 870;
    const firstX = chartDataList[0]?.x || 60;
    return `${linePart} L ${lastX} 190 L ${firstX} 190 Z`;
  };

  const currentHovered = chartDataList[hoveredDateIdx] || chartDataList[0];

  const pipelineStages = [
    { key: "applied", label: "Mới ứng tuyển", badgeBg: "bg-blue-600 text-white", headerText: "text-blue-700", cardBg: "bg-blue-50/50 border-blue-200", linkText: "text-blue-600" },
    { key: "screening", label: "Sàng lọc CV", badgeBg: "bg-sky-600 text-white", headerText: "text-sky-700", cardBg: "bg-sky-50/50 border-sky-200", linkText: "text-sky-600" },
    { key: "interview", label: "Phỏng vấn", badgeBg: "bg-amber-600 text-white", headerText: "text-amber-700", cardBg: "bg-amber-50/50 border-amber-200", linkText: "text-amber-600" },
    { key: "offer", label: "Offer", badgeBg: "bg-purple-600 text-white", headerText: "text-purple-700", cardBg: "bg-purple-50/50 border-purple-200", linkText: "text-purple-600" },
    { key: "hired", label: "Nhận việc", badgeBg: "bg-emerald-600 text-white", headerText: "text-emerald-700", cardBg: "bg-emerald-50/50 border-emerald-200", linkText: "text-emerald-600" },
  ];

  return (
    <div className="space-y-4 max-w-[1680px] mx-auto w-full pb-10">
      {/* ======================================================== */}
      {/* MAIN 2-COLUMN LAYOUT: MAIN DASHBOARD (~74%) | WIDGETS (~26%) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* ====================================================== */}
        {/* CỘT TRÁI: MAIN CONTENT (xl:col-span-8 2xl:col-span-9) */}
        {/* ====================================================== */}
        <div className="xl:col-span-8 2xl:col-span-9 space-y-4">
          {/* ---------------- 1. HERO BANNER (WITH nhatuyendung.png) ---------------- */}
          <div
            className="relative w-full rounded-xl overflow-hidden px-6 py-5 text-white shadow-xs border border-[#1E429F]/30 flex items-center min-h-[135px] md:h-[145px]"
            style={{
              backgroundImage: "url('/images/nhatuyendung.png')",
              backgroundSize: "cover",
              backgroundPosition: "center right",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#1E429F]/95 via-[#0D256B]/80 to-transparent pointer-events-none" />

            <div className="relative z-10 max-w-xl flex flex-col justify-center">
              <h2 className="text-[20px] sm:text-[22px] font-semibold text-white m-0 tracking-tight leading-tight mb-4">
                Tuyển dụng thông minh – Kết nối nhân tài
              </h2>

              <div className="flex flex-wrap items-center gap-2.5">
                <Link href="/doanh-nghiep/tin-tuyen-dung/them-moi">
                  <button
                    type="button"
                    className="h-[36px] px-4 rounded-lg bg-white hover:bg-blue-50 text-[#155EEF] font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Đăng tin tuyển dụng</span>
                  </button>
                </Link>

                <Link href="/doanh-nghiep/ung-vien">
                  <button
                    type="button"
                    className="h-[36px] px-4 rounded-lg bg-white/15 hover:bg-white/25 text-white font-medium text-xs border border-white/30 backdrop-blur-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Tìm kiếm ứng viên</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* ---------------- 2. 5 KPI STATS CARDS ---------------- */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* KPI 1 */}
            <div className="bg-white rounded-xl p-3 sm:p-3.5 border border-[#D6E1F0] shadow-2xs flex items-center gap-3 min-h-[96px] hover:border-[#155EEF]/60 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#155EEF] flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1 flex flex-col justify-center">
                <span className="text-[12px] font-semibold text-[#334155] leading-tight block">
                  Tin đang tuyển
                </span>
                <span className="text-[23px] sm:text-[24px] font-bold text-[#0F172A] leading-none my-1">
                  {dashboardData?.active_jobs ?? 0}
                </span>
                <span className="text-[11px] text-[#1E293B] font-medium leading-tight block mt-0.5">
                  Tổng {dashboardData?.total_jobs ?? 0} tin đăng
                </span>
              </div>
            </div>

            {/* KPI 2 */}
            <div className="bg-white rounded-xl p-3 sm:p-3.5 border border-[#D6E1F0] shadow-2xs flex items-center gap-3 min-h-[96px] hover:border-[#155EEF]/60 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#155EEF] flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1 flex flex-col justify-center">
                <span className="text-[12px] font-semibold text-[#334155] leading-tight block">
                  Tổng ứng viên
                </span>
                <span className="text-[23px] sm:text-[24px] font-bold text-[#0F172A] leading-none my-1">
                  {dashboardData?.total_applications ?? 0}
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold leading-tight flex items-center gap-0.5 mt-0.5">
                  <TrendingUp className="w-3 h-3 shrink-0" />
                  <span>{dashboardData?.applications_by_status?.submitted ?? 0} hồ sơ mới</span>
                </span>
              </div>
            </div>

            {/* KPI 3 */}
            <div className="bg-white rounded-xl p-3 sm:p-3.5 border border-[#D6E1F0] shadow-2xs flex items-center gap-3 min-h-[96px] hover:border-[#155EEF]/60 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#155EEF] flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1 flex flex-col justify-center">
                <span className="text-[12px] font-semibold text-[#334155] leading-tight block">
                  Đang phỏng vấn
                </span>
                <span className="text-[23px] sm:text-[24px] font-bold text-[#0F172A] leading-none my-1">
                  {dashboardData?.applications_by_status?.interview ?? dashboardData?.upcoming_interviews_count ?? 0}
                </span>
                <span className="text-[11px] text-[#1E293B] font-medium leading-tight block mt-0.5">
                  {dashboardData?.upcoming_interviews_count ?? 0} lịch sắp tới
                </span>
              </div>
            </div>

            {/* KPI 4 */}
            <div className="bg-white rounded-xl p-3 sm:p-3.5 border border-[#D6E1F0] shadow-2xs flex items-center gap-3 min-h-[96px] hover:border-[#155EEF]/60 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#155EEF] flex items-center justify-center shrink-0">
                <Star className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1 flex flex-col justify-center">
                <span className="text-[12px] font-semibold text-[#334155] leading-tight block">
                  Talent Pool
                </span>
                <span className="text-[23px] sm:text-[24px] font-bold text-[#0F172A] leading-none my-1">
                  {dashboardData?.talent_pool_count ?? 0}
                </span>
                <span className="text-[11px] text-[#1E293B] font-medium leading-tight block mt-0.5">
                  Ứng viên tiềm năng
                </span>
              </div>
            </div>

            {/* KPI 5 */}
            <div className="bg-white rounded-xl p-3 sm:p-3.5 border border-[#D6E1F0] shadow-2xs flex items-center gap-3 min-h-[96px] hover:border-[#155EEF]/60 transition-all col-span-2 sm:col-span-1">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#155EEF] flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1 flex flex-col justify-center">
                <span className="text-[12px] font-semibold text-[#334155] leading-tight block">
                  Đã nhận việc
                </span>
                <span className="text-[23px] sm:text-[24px] font-bold text-[#0F172A] leading-none my-1">
                  {dashboardData?.applications_by_status?.hired ?? 0}
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold leading-tight block mt-0.5">
                  Trúng tuyển chính thức
                </span>
              </div>
            </div>
          </div>

          {/* ---------------- 3. BIỂU ĐỒ TUYỂN DỤNG (HÀNG 1 - FULL WIDTH) ---------------- */}
          <div className="w-full bg-white rounded-xl p-5 border border-[#D6E1F0] shadow-2xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-[14.5px] font-semibold text-[#17233B] m-0">
                  Biểu đồ tuyển dụng
                </h3>
              </div>

              {/* Chart Legend */}
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#155EEF]" />
                  <span className="text-[12px] text-[#52627A] font-medium">Ứng viên mới</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" />
                  <span className="text-[12px] text-[#52627A] font-medium">Ứng viên phù hợp</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                  <span className="text-[12px] text-[#52627A] font-medium">Lượt xem tin</span>
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-1 bg-[#F5F7FB] p-0.5 rounded-lg border border-[#D6E1F0]">
                <button
                  type="button"
                  onClick={() => setChartRange("7d")}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${chartRange === "7d"
                    ? "bg-white text-[#155EEF] shadow-xs"
                    : "text-[#52627A] hover:text-[#17233B]"
                    }`}
                >
                  7 ngày
                </button>
                <button
                  type="button"
                  onClick={() => setChartRange("30d")}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${chartRange === "30d"
                    ? "bg-white text-[#155EEF] shadow-xs"
                    : "text-[#52627A] hover:text-[#17233B]"
                    }`}
                >
                  30 ngày
                </button>
                <button
                  type="button"
                  onClick={() => setChartRange("90d")}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${chartRange === "90d"
                    ? "bg-white text-[#155EEF] shadow-xs"
                    : "text-[#52627A] hover:text-[#17233B]"
                    }`}
                >
                  90 ngày
                </button>
              </div>
            </div>

            {/* Interactive SVG Spline Area Chart */}
            <div className="relative w-full h-[220px] select-none">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 920 220" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="lineChartPurple" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="lineChartBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#155EEF" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#155EEF" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="lineChartEmerald" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                <line x1="50" y1="25" x2="890" y2="25" stroke="#E2E8F0" strokeDasharray="4 4" strokeWidth="1" />
                <line x1="50" y1="66" x2="890" y2="66" stroke="#E2E8F0" strokeDasharray="4 4" strokeWidth="1" />
                <line x1="50" y1="107" x2="890" y2="107" stroke="#E2E8F0" strokeDasharray="4 4" strokeWidth="1" />
                <line x1="50" y1="148" x2="890" y2="148" stroke="#E2E8F0" strokeDasharray="4 4" strokeWidth="1" />
                <line x1="50" y1="190" x2="890" y2="190" stroke="#CBD5E1" strokeWidth="1" />

                {/* Y-Axis Value Labels */}
                <text x="40" y="28" textAnchor="end" className="text-[10px] fill-[#52627A] font-medium">{Math.round(maxVal)}</text>
                <text x="40" y="69" textAnchor="end" className="text-[10px] fill-[#52627A] font-medium">{Math.round(maxVal * 0.75)}</text>
                <text x="40" y="110" textAnchor="end" className="text-[10px] fill-[#52627A] font-medium">{Math.round(maxVal * 0.5)}</text>
                <text x="40" y="151" textAnchor="end" className="text-[10px] fill-[#52627A] font-medium">{Math.round(maxVal * 0.25)}</text>
                <text x="40" y="193" textAnchor="end" className="text-[10px] fill-[#52627A] font-medium">0</text>

                {/* Area & Line 1: Views */}
                <path d={generateAreaPath('views')} fill="url(#lineChartEmerald)" />
                <path d={generateLinePath('views')} fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />

                {/* Area & Line 2: New Candidates */}
                <path d={generateAreaPath('newCandidates')} fill="url(#lineChartBlue)" />
                <path d={generateLinePath('newCandidates')} fill="none" stroke="#155EEF" strokeWidth="2.5" strokeLinecap="round" />

                {/* Area & Line 3: Match Candidates */}
                <path d={generateAreaPath('matchCandidates')} fill="url(#lineChartPurple)" />
                <path d={generateLinePath('matchCandidates')} fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeDasharray="5 4" />

                {/* Vertical Guideline */}
                {currentHovered && (
                  <line
                    x1={currentHovered.x}
                    y1="25"
                    x2={currentHovered.x}
                    y2="190"
                    stroke="#155EEF"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    className="transition-all duration-150"
                  />
                )}

                {/* Dots for Active Date */}
                {currentHovered && (
                  <>
                    <circle cx={currentHovered.x} cy={getY(currentHovered.views || 0)} r="4" fill="#10B981" stroke="#ffffff" strokeWidth="2" />
                    <circle cx={currentHovered.x} cy={getY(currentHovered.newCandidates || 0)} r="4" fill="#155EEF" stroke="#ffffff" strokeWidth="2" />
                    <circle cx={currentHovered.x} cy={getY(currentHovered.matchCandidates || 0)} r="3.5" fill="#7C3AED" stroke="#ffffff" strokeWidth="2" />
                  </>
                )}

                {/* Hover Trigger Hotspots */}
                {chartDataList.map((d: any, idx: number) => (
                  <rect
                    key={idx}
                    x={d.x - 45}
                    y="20"
                    width="90"
                    height="180"
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredDateIdx(idx)}
                  />
                ))}
              </svg>

              {/* Dynamic Floating Tooltip Card */}
              {currentHovered && (
                <div
                  className="absolute pointer-events-none transition-all duration-150 z-20 top-2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-lg border border-[#D6E1F0] min-w-[155px] text-xs"
                  style={{
                    left: `${(currentHovered.x / 920) * 100}%`,
                  }}
                >
                  <div className="font-bold text-[#17233B] pb-1 mb-1 border-b border-slate-100 flex items-center justify-between text-[11px]">
                    <span>Ngày {currentHovered.date}</span>
                    <span className="text-[10px] text-[#155EEF] font-semibold">Chi tiết</span>
                  </div>
                  <div className="space-y-1 font-medium text-[11px]">
                    <div className="flex items-center justify-between gap-2 text-emerald-700">
                      <span>Lượt xem:</span>
                      <strong className="font-bold">{currentHovered.views || 0}</strong>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-[#155EEF]">
                      <span>Ứng viên mới:</span>
                      <strong className="font-bold">{currentHovered.newCandidates || 0}</strong>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-purple-700">
                      <span>Phù hợp:</span>
                      <strong className="font-bold">{currentHovered.matchCandidates || 0}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* X Axis Dates */}
              <div className="flex justify-between items-center px-8 pt-1 text-[11px] font-medium text-[#52627A]">
                {chartDataList.map((d: any, idx: number) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setHoveredDateIdx(idx)}
                    className={`cursor-pointer transition-colors ${hoveredDateIdx === idx ? "text-[#155EEF] font-bold" : "hover:text-[#17233B]"}`}
                  >
                    {d.date}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ---------------- 4. PIPELINE TUYỂN DỤNG (HÀNG 2 - FULL WIDTH) ---------------- */}
          <div className="w-full bg-white rounded-xl p-5 border border-[#D6E1F0] shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between pb-1 border-b border-[#D6E1F0]">
              <div>
                <h3 className="text-[14.5px] font-semibold text-[#17233B] m-0">
                  Pipeline tuyển dụng
                </h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#52627A] font-medium bg-[#F5F7FB] px-2.5 py-1 rounded-lg border border-[#D6E1F0] cursor-pointer hover:text-[#17233B]">
                <span>Tất cả vị trí</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* 5 Kanban Columns across full width */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {pipelineStages.map((col) => {
                const stageData = dashboardData?.pipeline_stages?.[col.key] || {
                  total: col.key === "applied" ? 1 : 0,
                  candidates: col.key === "applied" ? [
                    { name: "Nguyễn Thanh Tùng", role: "Frontend Developer", date: "18/10/2026" }
                  ] : [],
                };

                return (
                  <div
                    key={col.key}
                    className={`rounded-xl p-3 border ${col.cardBg} flex flex-col justify-between min-h-[175px] transition-all`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className={`text-[12.5px] font-bold ${col.headerText}`}>
                          {col.label}
                        </span>
                        <span className={`px-2 py-0.2 rounded-full text-[11px] font-bold ${col.badgeBg}`}>
                          {stageData.total}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {stageData.candidates && stageData.candidates.length > 0 ? (
                          stageData.candidates.map((cand: any, cIdx: number) => (
                            <div
                              key={cIdx}
                              className="bg-white rounded-lg p-2.5 border border-[#D6E1F0] shadow-2xs space-y-1 hover:border-[#155EEF]/60 transition-colors"
                            >
                              <div className="text-[12px] font-bold text-[#17233B] leading-tight truncate">
                                {cand.name}
                              </div>
                              <div className="text-[11px] text-[#52627A] truncate font-medium">
                                {cand.role}
                              </div>
                              <div className="text-[10px] text-[#52627A]/80 font-normal">
                                {cand.date}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-3 px-2 text-center text-[12px] font-semibold text-[#475569] bg-white rounded-lg border border-dashed border-black/15 shadow-2xs">
                            Chưa có ứng viên
                          </div>
                        )}
                      </div>
                    </div>

                    <Link
                      href="/doanh-nghiep/ung-vien"
                      className={`text-[12px] font-bold ${col.linkText} hover:underline text-center block pt-1.5 transition-colors mt-auto`}
                    >
                      {stageData.total > 0 ? `Xem tất cả ${stageData.total} hồ sơ →` : "Quản lý ứng viên →"}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ---------------- 5. TIN TUYỂN DỤNG GẦN ĐÂY & LỊCH PHỎNG VẤN SẮP TỚI ---------------- */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* Tin tuyển dụng gần đây */}
            <div className="bg-white rounded-xl p-5 border border-[#D6E1F0] shadow-2xs space-y-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#D6E1F0]">
                  <h3 className="text-[14.5px] font-semibold text-[#17233B] m-0">
                    Tin tuyển dụng gần đây
                  </h3>
                  <Link
                    href="/doanh-nghiep/tin-tuyen-dung"
                    className="text-xs font-medium text-[#155EEF] hover:underline flex items-center gap-1"
                  >
                    <span>Xem tất cả ({dashboardData?.total_jobs ?? 0})</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="divide-y divide-[#D6E1F0]">
                  {dashboardData?.recent_jobs && dashboardData.recent_jobs.length > 0 ? (
                    dashboardData.recent_jobs.map((job: any) => (
                      <div key={job.id} className="py-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#155EEF] border border-blue-100 flex items-center justify-center shrink-0">
                            <Briefcase className="w-5 h-5 text-[#155EEF]" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Link href={`/doanh-nghiep/tin-tuyen-dung/${job.id}`}>
                                <span className="text-[12.5px] font-semibold text-[#17233B] hover:text-[#155EEF] transition-colors truncate">
                                  {job.title}
                                </span>
                              </Link>
                              <span className={`px-2 py-0.2 rounded-full font-medium text-[10px] border ${job.status === "published"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-100 text-[#52627A] border-slate-200"
                                }`}>
                                {job.status === "published" ? "Đang hoạt động" : job.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-[#52627A] font-normal mt-1 flex-wrap">
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>{job.salary}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                <span>{job.employment_type}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs font-semibold text-[#17233B]">{job.applications_count}</div>
                          <div className="text-[10.5px] text-[#52627A]">Ứng viên đã nộp</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-7">
                      <Briefcase className="w-8 h-8 text-[#52627A]/40 mx-auto mb-2" />
                      <p className="text-xs text-[#52627A] font-normal m-0">Doanh nghiệp chưa đăng tin tuyển dụng nào.</p>
                      <Link href="/doanh-nghiep/tin-tuyen-dung/them-moi" className="text-[#155EEF] text-xs font-medium mt-2 inline-block hover:underline">
                        + Đăng tin tuyển dụng ngay
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              <Link
                href="/doanh-nghiep/tin-tuyen-dung"
                className="text-xs font-medium text-[#155EEF] text-center block pt-2 hover:underline border-t border-[#D6E1F0]"
              >
                Xem tất cả {dashboardData?.total_jobs ?? 0} tin tuyển dụng →
              </Link>
            </div>

            {/* Lịch phỏng vấn sắp tới */}
            <div className="bg-white rounded-xl p-5 border border-[#D6E1F0] shadow-2xs space-y-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#D6E1F0]">
                  <h3 className="text-[14.5px] font-semibold text-[#17233B] m-0">
                    Lịch phỏng vấn sắp tới
                  </h3>
                  <Link
                    href="/doanh-nghiep/ung-vien"
                    className="text-xs font-medium text-[#155EEF] hover:underline flex items-center gap-1"
                  >
                    <span>Xem lịch đầy đủ</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="divide-y divide-[#D6E1F0]">
                  {dashboardData?.upcoming_interviews && dashboardData.upcoming_interviews.length > 0 ? (
                    dashboardData.upcoming_interviews.map((iv: any) => {
                      const dt = iv.scheduled_at ? new Date(iv.scheduled_at) : null;
                      const dayStr = dt ? dt.getDate() : "--";
                      const monthStr = dt ? `THG ${dt.getMonth() + 1}` : "--";
                      const timeStr = dt ? dt.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "";
                      return (
                        <div key={iv.id} className="py-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-11 h-11 rounded-lg bg-blue-50 border border-blue-100 text-[#155EEF] flex flex-col items-center justify-center shrink-0">
                              <span className="text-xs font-bold leading-none">{dayStr}</span>
                              <span className="text-[9px] font-semibold uppercase mt-0.5">{monthStr}</span>
                            </div>
                            <div className="min-w-0">
                              <div className="text-[11px] font-normal text-[#52627A]">
                                {timeStr}
                              </div>
                              <div className="text-[12.5px] font-semibold text-[#17233B] truncate">
                                {iv.candidate_name}
                              </div>
                              <div className="text-[11.5px] text-[#52627A] font-normal truncate">
                                {iv.job_title} • {iv.mode}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Link
                              href="/doanh-nghiep/ung-vien"
                              className="px-2.5 py-1 rounded-lg bg-[#F5F7FB] hover:bg-blue-50 text-[#155EEF] font-medium text-xs transition-colors cursor-pointer border border-[#D6E1F0]"
                            >
                              Chi tiết
                            </Link>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-7">
                      <Calendar className="w-8 h-8 text-[#52627A]/40 mx-auto mb-2" />
                      <p className="text-xs text-[#52627A] font-normal m-0">Không có lịch phỏng vấn nào sắp tới.</p>
                      <Link href="/doanh-nghiep/ung-vien" className="text-[#155EEF] text-xs font-medium mt-2 inline-block hover:underline">
                        Xem hồ sơ ứng viên →
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              <Link
                href="/doanh-nghiep/ung-vien"
                className="text-xs font-medium text-[#155EEF] text-center block pt-2 hover:underline border-t border-[#D6E1F0]"
              >
                Xem tất cả lịch phỏng vấn →
              </Link>
            </div>
          </div>

          {/* ---------------- 6. HIỆU SUẤT TUYỂN DỤNG & MẸO TUYỂN DỤNG ---------------- */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            {/* Hiệu suất tuyển dụng */}
            <div className="xl:col-span-8 bg-white rounded-xl p-5 border border-[#D6E1F0] shadow-2xs space-y-3">
              <h3 className="text-[14.5px] font-semibold text-[#17233B] m-0">
                Hiệu suất tuyển dụng
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-0.5">
                {/* Metric 1 */}
                <div className="p-3 bg-[#F5F7FB] rounded-xl border border-[#D6E1F0] space-y-1">
                  <span className="text-[12px] font-medium text-[#52627A] block truncate">
                    Tỷ lệ phản hồi PV
                  </span>
                  <span className="text-[22px] font-bold text-[#17233B] block leading-tight">
                    {dashboardData?.performance?.response_rate ?? 0}%
                  </span>
                  <span className="text-[11px] text-[#475569] font-normal block truncate">
                    Đã xử lý hồ sơ
                  </span>
                </div>

                {/* Metric 2 */}
                <div className="p-3 bg-[#F5F7FB] rounded-xl border border-[#D6E1F0] space-y-1">
                  <span className="text-[12px] font-medium text-[#52627A] block truncate">
                    Tổng đơn ứng tuyển
                  </span>
                  <span className="text-[22px] font-bold text-[#17233B] block leading-tight">
                    {dashboardData?.total_applications ?? 0}
                  </span>
                  <span className="text-[11px] text-emerald-600 font-normal block truncate">
                    Toàn bộ các vị trí
                  </span>
                </div>

                {/* Metric 3 */}
                <div className="p-3 bg-[#F5F7FB] rounded-xl border border-[#D6E1F0] space-y-1">
                  <span className="text-[12px] font-medium text-[#52627A] block truncate">
                    Tin đang đăng
                  </span>
                  <span className="text-[22px] font-bold text-[#17233B] block leading-tight">
                    {dashboardData?.active_jobs ?? 0}
                  </span>
                  <span className="text-[11px] text-[#155EEF] font-normal block truncate">
                    Đang công khai
                  </span>
                </div>

                {/* Metric 4 */}
                <div className="p-3 bg-[#F5F7FB] rounded-xl border border-[#D6E1F0] space-y-1">
                  <span className="text-[12px] font-medium text-[#52627A] block truncate">
                    Tỷ lệ tuyển dụng
                  </span>
                  <span className="text-[22px] font-bold text-[#17233B] block leading-tight">
                    {dashboardData?.performance?.hire_rate ?? 0}%
                  </span>
                  <span className="text-[11px] text-emerald-600 font-normal block truncate">
                    Ứng viên nhận việc
                  </span>
                </div>
              </div>
            </div>

            {/* Mẹo tuyển dụng */}
            <div className="xl:col-span-4 bg-[#FFFDF5] rounded-xl p-5 border border-[#FDE68A] shadow-2xs space-y-2.5 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <span>💡 Mẹo tuyển dụng</span>
                </div>
                <p className="text-[11.5px] text-[#52627A] font-medium leading-relaxed m-0">
                  Tin tuyển dụng có mô tả chi tiết và phúc lợi rõ ràng thu hút ứng viên chất lượng hơn gấp <strong>2.5 lần</strong>!
                </p>
              </div>
              <Link
                href="/doanh-nghiep/tin-tuyen-dung"
                className="text-xs font-semibold text-[#155EEF] hover:underline flex items-center gap-1 pt-1"
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
        <div className="xl:col-span-4 2xl:col-span-3 space-y-4 sticky top-20 max-h-[calc(100vh-90px)] overflow-y-auto pr-1">
          {/* ---------------- 1. THÔNG BÁO MỚI ---------------- */}
          <div className="bg-white rounded-xl p-5 border border-[#D6E1F0] shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#D6E1F0]">
              <h3 className="text-[14px] font-semibold text-[#17233B] m-0">
                Thông báo mới
              </h3>
              <Link href="/doanh-nghiep/thong-bao" className="text-xs text-[#155EEF] font-medium hover:underline">
                Xem tất cả
              </Link>
            </div>

            <div className="space-y-3">
              {/* Notification 1 */}
              <div className="flex items-start gap-2.5 text-xs">
                <div className="w-6 h-6 rounded-full bg-blue-50 text-[#155EEF] flex items-center justify-center shrink-0 mt-0.5">
                  <Users className="w-3 h-3" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11.5px] text-[#17233B] font-medium m-0 leading-tight">
                    Ứng viên <strong>Nguyễn Minh Anh</strong> đã ứng tuyển vị trí Product Manager
                  </p>
                  <span className="text-[10px] text-[#52627A] mt-0.5 block">2 giờ trước</span>
                </div>
              </div>

              {/* Notification 2 */}
              <div className="flex items-start gap-2.5 text-xs">
                <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Calendar className="w-3 h-3" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11.5px] text-[#17233B] font-medium m-0 leading-tight">
                    Lịch phỏng vấn với <strong>Trần Quốc Bảo</strong> vào <span className="text-emerald-700 font-semibold">14:00 hôm nay</span>
                  </p>
                  <span className="text-[10px] text-[#52627A] mt-0.5 block">3 giờ trước</span>
                </div>
              </div>

              {/* Notification 3 */}
              <div className="flex items-start gap-2.5 text-xs">
                <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertCircle className="w-3 h-3" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11.5px] text-[#17233B] font-medium m-0 leading-tight">
                    Tin tuyển dụng <strong>"Frontend Developer"</strong> sắp hết hạn (2 ngày nữa)
                  </p>
                  <span className="text-[10px] text-[#52627A] mt-0.5 block">5 giờ trước</span>
                </div>
              </div>

              {/* Notification 4 */}
              <div className="flex items-start gap-2.5 text-xs">
                <div className="w-6 h-6 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-3 h-3" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11.5px] text-[#17233B] font-medium m-0 leading-tight">
                    Ứng viên <strong>Phạm Thu Hằng</strong> đã phản hồi thư mời phỏng vấn
                  </p>
                  <span className="text-[10px] text-[#52627A] mt-0.5 block">1 ngày trước</span>
                </div>
              </div>
            </div>
          </div>

          {/* ---------------- 2. GÓI DỊCH VỤ HIỆN TẠI ---------------- */}
          <div className="bg-white rounded-xl p-5 border border-[#D6E1F0] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-semibold text-[#17233B] m-0">
                Gói dịch vụ hiện tại
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#155EEF] font-semibold text-[10.5px] border border-blue-200">
                Enterprise
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-[#52627A]">
              <span>Hiệu lực đến: <strong className="text-[#17233B] font-semibold">12/12/2026</strong></span>
              <span className="text-blue-600 font-semibold">còn 105 ngày</span>
            </div>

            <Link href="/doanh-nghiep/bang-gia" className="block">
              <button
                type="button"
                className="w-full h-[34px] px-3 rounded-lg bg-[#155EEF] hover:bg-[#1047B8] text-white font-medium text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
              >
                <span>Gia hạn gói</span>
              </button>
            </Link>

            {/* 3 Progress Bars */}
            <div className="space-y-2 pt-1 border-t border-[#D6E1F0]">
              <div>
                <div className="flex justify-between text-[11px] mb-0.5 font-medium">
                  <span className="text-[#52627A]">Tin tuyển dụng</span>
                  <span className="font-semibold text-[#17233B]">23 / 50</span>
                </div>
                <Progress percent={46} strokeColor="#155EEF" showInfo={false} size="small" />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-0.5 font-medium">
                  <span className="text-[#52627A]">Lượt xem CV</span>
                  <span className="font-semibold text-emerald-700">1,248 / 5,000</span>
                </div>
                <Progress percent={25} strokeColor="#10B981" showInfo={false} size="small" />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-0.5 font-medium">
                  <span className="text-[#52627A]">Email liên hệ</span>
                  <span className="font-semibold text-purple-700">312 / 2,000</span>
                </div>
                <Progress percent={16} strokeColor="#7C3AED" showInfo={false} size="small" />
              </div>
            </div>
          </div>

          {/* ---------------- 3. THAO TÁC NHANH (2x3 GRID) ---------------- */}
          <div className="bg-white rounded-xl p-4 border border-[#D6E1F0] shadow-2xs space-y-2.5">
            <h3 className="text-[13px] font-semibold text-[#17233B] m-0">
              Thao tác nhanh
            </h3>

            <div className="grid grid-cols-3 gap-2">
              {/* Action 1 */}
              <Link href="/doanh-nghiep/tin-tuyen-dung/them-moi" className="block group">
                <div className="p-3 bg-[#F5F7FB] hover:bg-blue-50/70 rounded-xl border border-[#D6E1F0] text-center space-y-1.5 transition-all h-full flex flex-col items-center justify-center">
                  <div className="w-7 h-7 rounded-lg bg-[#155EEF] text-white flex items-center justify-center shadow-2xs">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-medium text-[#17233B] block leading-tight">
                    Đăng tin
                  </span>
                </div>
              </Link>

              {/* Action 2 */}
              <Link href="/doanh-nghiep/ung-vien" className="block group">
                <div className="p-3 bg-[#F5F7FB] hover:bg-emerald-50/70 rounded-xl border border-[#D6E1F0] text-center space-y-1.5 transition-all h-full flex flex-col items-center justify-center">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                    <Search className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-medium text-[#17233B] block leading-tight">
                    Ứng viên
                  </span>
                </div>
              </Link>

              {/* Action 3 */}
              <Link href="/doanh-nghiep/tin-tuyen-dung/them-moi" className="block group">
                <div className="p-3 bg-[#F5F7FB] hover:bg-purple-50/70 rounded-xl border border-[#D6E1F0] text-center space-y-1.5 transition-all h-full flex flex-col items-center justify-center">
                  <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-2xs">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-medium text-[#17233B] block leading-tight">
                    Tạo JD mẫu
                  </span>
                </div>
              </Link>

              {/* Action 4 */}
              <Link href="/doanh-nghiep/ung-vien" className="block group">
                <div className="p-3 bg-[#F5F7FB] hover:bg-indigo-50/70 rounded-xl border border-[#D6E1F0] text-center space-y-1.5 transition-all h-full flex flex-col items-center justify-center">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-2xs">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-medium text-[#17233B] block leading-tight">
                    Talent Pool
                  </span>
                </div>
              </Link>

              {/* Action 5 */}
              <Link href="/doanh-nghiep/ung-vien" className="block group">
                <div className="p-3 bg-[#F5F7FB] hover:bg-rose-50/70 rounded-xl border border-[#D6E1F0] text-center space-y-1.5 transition-all h-full flex flex-col items-center justify-center">
                  <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-2xs">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-medium text-[#17233B] block leading-tight">
                    Lịch PV
                  </span>
                </div>
              </Link>

              {/* Action 6 */}
              <Link href="/doanh-nghiep/dashboard" className="block group">
                <div className="p-3 bg-[#F5F7FB] hover:bg-cyan-50/70 rounded-xl border border-[#D6E1F0] text-center space-y-1.5 transition-all h-full flex flex-col items-center justify-center">
                  <div className="w-7 h-7 rounded-lg bg-cyan-600 text-white flex items-center justify-center shadow-2xs">
                    <BarChart3 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-medium text-[#17233B] block leading-tight">
                    Báo cáo
                  </span>
                </div>
              </Link>
            </div>
          </div>

          {/* ---------------- 4. AI HỖ TRỢ TUYỂN DỤNG ---------------- */}
          <div className="bg-white rounded-xl p-4 border border-[#D6E1F0] border-l-[3px] border-l-[#155EEF] shadow-2xs space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#155EEF] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-[13px] font-semibold text-[#17233B] m-0">
                  AI hỗ trợ tuyển dụng
                </h3>
                <p className="text-[11.5px] text-[#475569] font-normal m-0 leading-tight">
                  Gợi ý ứng viên và phân tích CV thông minh
                </p>
              </div>
            </div>

            <Link href="/ai-career" className="block pt-0.5">
              <button
                type="button"
                className="w-full h-[34px] px-3 rounded-lg bg-[#1254B8] hover:bg-[#0E4496] text-white font-medium text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
              >
                <span>Khám phá AI →</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
