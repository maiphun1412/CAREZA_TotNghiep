"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Modal,
  Select,
  Input,
  Dropdown,
  Tooltip,
  App,
  Progress,
  Radio,
  Checkbox,
  DatePicker,
  Spin,
  Alert,
  Empty,
} from "antd";
import type { MenuProps } from "antd";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Briefcase,
  Users,
  UserCheck,
  Send,
  CheckCircle2,
  Percent,
  Download,
  Bookmark,
  Plus,
  RefreshCw,
  Clock,
  Filter,
  FileText,
  DollarSign,
  ChevronDown,
  Layers,
  ArrowRight,
  Eye,
  Award,
  Sparkles,
  PieChart,
  HelpCircle,
  FileSpreadsheet,
  FileType,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { employerService } from "@/services/employer.service";
import Link from "next/link";

// =====================================================================
// DATA MODELS & TYPES
// =====================================================================

export interface JobReportItem {
  id: string;
  title: string;
  status: "active" | "expired" | "draft";
  department: string;
  views: number;
  newCandidates: number;
  interviewCandidates: number;
  offersSent: number;
  accepted: number;
  acceptanceRate: number;
  costVnd: number;
}

export interface SavedReportConfig {
  id: string;
  name: string;
  updatedAt: string;
}

const SAVED_REPORTS_LIST: SavedReportConfig[] = [
  { id: "sr-1", name: "Báo cáo tuyển dụng quý hiện tại", updatedAt: "Gần đây" },
  { id: "sr-2", name: "Hiệu quả tuyển dụng theo vị trí", updatedAt: "Gần đây" },
];

export default function EmployerRecruitmentReportPage() {
  const { message } = App.useApp();
  const { user } = useAuthStore();
  const recruiterName = user?.fullName || "Mai Phương";

  // Data Loading States
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [jobReports, setJobReports] = useState<JobReportItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>("Đang tải...");

  // Tab Navigation State
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Sidebar Filter States
  const [filterTimeRange, setFilterTimeRange] = useState<string>("custom");
  const [filterPosition, setFilterPosition] = useState<string>("all");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");
  const [filterWorkType, setFilterWorkType] = useState<string>("all");
  const [filterLocation, setFilterLocation] = useState<string>("all");
  const [filterRecruiter, setFilterRecruiter] = useState<string>("all");

  // Comparison period
  const [comparePeriod, setComparePeriod] = useState<string>("prev_month");

  // Modals
  const [isSaveReportModalOpen, setIsSaveReportModalOpen] = useState<boolean>(false);
  const [reportNameInput, setReportNameInput] = useState<string>("");
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel" | "csv">("excel");
  const [isNewReportModalOpen, setIsNewReportModalOpen] = useState<boolean>(false);
  const [selectedJobDetail, setSelectedJobDetail] = useState<JobReportItem | null>(null);

  // Line Chart Hover State
  const [hoveredTrendIdx, setHoveredTrendIdx] = useState<number | null>(3);

  // Fetch report data from Backend API
  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [dashRes, jobsRes] = await Promise.all([
        employerService.getDashboard().catch((e) => {
          console.error("Lỗi lấy dashboard:", e);
          return null;
        }),
        employerService.getJobs({ page_size: 50 }).catch((e) => {
          console.error("Lỗi lấy danh sách tin tuyển dụng:", e);
          return null;
        }),
      ]);

      const dash = (dashRes as any)?.data?.dashboard || (dashRes as any)?.data || (dashRes as any) || null;
      setDashboardData(dash);

      const items = (jobsRes as any)?.data?.items || (jobsRes as any)?.data?.jobs || (jobsRes as any)?.items || [];
      if (Array.isArray(items)) {
        const mappedJobs: JobReportItem[] = items.map((j: any) => {
          const appCount = Number(j.applications_count || 0);
          const ivCount = Math.round(appCount * 0.3);
          const ofCount = Math.round(appCount * 0.1);
          const acCount = Math.round(appCount * 0.05);
          const acRate = ofCount > 0 ? Number(((acCount / ofCount) * 100).toFixed(1)) : 0;
          return {
            id: String(j.id),
            title: j.title || "Vị trí tuyển dụng",
            status: j.status === "published" ? "active" : (j.status || "draft"),
            department: j.department || j.category_name || "Phát triển",
            views: Number(j.views_count || j.views || (appCount > 0 ? appCount * 6 : 0)),
            newCandidates: appCount,
            interviewCandidates: ivCount,
            offersSent: ofCount,
            accepted: acCount,
            acceptanceRate: acRate,
            costVnd: 0,
          };
        });
        setJobReports(mappedJobs);
      }

      const now = new Date();
      setLastUpdated(
        `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}, ${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1).toString().padStart(2, "0")}/${now.getFullYear()}`
      );
    } catch (err: any) {
      console.error("Lỗi nạp báo cáo:", err);
      setError(err?.message || "Không thể tải báo cáo từ máy chủ.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Derived metrics from PostgreSQL Backend
  const totalJobs = dashboardData?.total_jobs ?? jobReports.length;
  const totalCandidates = dashboardData?.total_applications ?? jobReports.reduce((s, j) => s + j.newCandidates, 0);
  const interviewCandidates = dashboardData?.applications_by_status?.interview ?? dashboardData?.upcoming_interviews_count ?? jobReports.reduce((s, j) => s + j.interviewCandidates, 0);
  const offersSent = dashboardData?.applications_by_status?.offered ?? jobReports.reduce((s, j) => s + j.offersSent, 0);
  const accepted = dashboardData?.applications_by_status?.hired ?? jobReports.reduce((s, j) => s + j.accepted, 0);
  const acceptanceRate = offersSent > 0 ? ((accepted / offersSent) * 100).toFixed(1) : (totalCandidates > 0 ? "25.0" : "0.0");

  // Funnel stages definition from real data
  const funnelStages = useMemo(() => {
    const total = totalCandidates || 1;
    const screening = dashboardData?.applications_by_status?.screening ?? Math.round(total * 0.6);
    const interview = interviewCandidates;
    const offer = offersSent;
    const accept = accepted;

    return [
      { name: "Ứng viên mới", count: totalCandidates, percent: 100, color: "#0062ff" },
      { name: "Sàng lọc hồ sơ", count: screening, percent: totalCandidates > 0 ? Number(((screening / total) * 100).toFixed(1)) : 0, color: "#06b6d4" },
      { name: "Phỏng vấn", count: interview, percent: totalCandidates > 0 ? Number(((interview / total) * 100).toFixed(1)) : 0, color: "#a855f7" },
      { name: "Gửi offer", count: offer, percent: totalCandidates > 0 ? Number(((offer / total) * 100).toFixed(1)) : 0, color: "#f97316" },
      { name: "Chấp nhận", count: accept, percent: totalCandidates > 0 ? Number(((accept / total) * 100).toFixed(1)) : 0, color: "#10b981" },
    ];
  }, [totalCandidates, dashboardData, interviewCandidates, offersSent, accepted]);

  // Sources definition
  const candidateSources = useMemo(() => {
    const total = totalCandidates || 1;
    return [
      { name: "Cổng tuyển dụng CAREZA", count: Math.round(total * 0.45), percent: totalCandidates > 0 ? 45.0 : 0, color: "#0062ff" },
      { name: "Website công ty", count: Math.round(total * 0.25), percent: totalCandidates > 0 ? 25.0 : 0, color: "#0284c7" },
      { name: "LinkedIn", count: Math.round(total * 0.15), percent: totalCandidates > 0 ? 15.0 : 0, color: "#10b981" },
      { name: "Referral (Giới thiệu)", count: Math.round(total * 0.1), percent: totalCandidates > 0 ? 10.0 : 0, color: "#f59e0b" },
      { name: "Khác", count: Math.max(0, total - Math.round(total * 0.95)), percent: totalCandidates > 0 ? 5.0 : 0, color: "#94a3b8" },
    ];
  }, [totalCandidates]);

  // Position breakdown
  const positionBreakdown = useMemo(() => {
    if (jobReports.length === 0) return [];
    const maxVal = Math.max(...jobReports.map((j) => j.newCandidates), 1);
    return jobReports.slice(0, 7).map((j) => ({
      title: j.title,
      count: j.newCandidates,
      percent: totalCandidates > 0 ? Number(((j.newCandidates / totalCandidates) * 100).toFixed(1)) : 0,
      barWidth: Math.max(5, Math.round((j.newCandidates / maxVal) * 100)),
    }));
  }, [jobReports, totalCandidates]);

  // Trend series data
  const dailyTrendPoints = useMemo(() => {
    if (dashboardData?.chart_data && Array.isArray(dashboardData.chart_data) && dashboardData.chart_data.length > 0) {
      return dashboardData.chart_data.map((pt: any, idx: number) => ({
        date: pt.date || `T${idx + 1}`,
        newCand: pt.newCandidates || 0,
        interview: Math.round((pt.newCandidates || 0) * 0.3),
        offer: Math.round((pt.newCandidates || 0) * 0.1),
        accept: Math.round((pt.newCandidates || 0) * 0.05),
        x: 45 + idx * 100,
      }));
    }
    return [
      { date: "01/08", newCand: 0, interview: 0, offer: 0, accept: 0, x: 45 },
      { date: "06/08", newCand: 0, interview: 0, offer: 0, accept: 0, x: 145 },
      { date: "11/08", newCand: 0, interview: 0, offer: 0, accept: 0, x: 245 },
      { date: "16/08", newCand: 0, interview: 0, offer: 0, accept: 0, x: 345 },
      { date: "21/08", newCand: 0, interview: 0, offer: 0, accept: 0, x: 445 },
      { date: "26/08", newCand: 0, interview: 0, offer: 0, accept: 0, x: 545 },
      { date: "31/08", newCand: 0, interview: 0, offer: 0, accept: 0, x: 645 },
    ];
  }, [dashboardData]);

  // Helper for trend line chart Y coordinate (value 0 -> 100 mapped to SVG Y 180 -> 20)
  const getTrendY = (val: number) => 180 - (Math.min(100, val) / 100) * 155;

  // Render Tab Navigation
  const REPORT_TABS = [
    { key: "overview", label: "Tổng quan báo cáo" },
    { key: "job_performance", label: "Hiệu quả tin tuyển dụng" },
    { key: "sources", label: "Nguồn ứng viên" },
    { key: "pipeline_time", label: "Pipeline & Thời gian" },
    { key: "cost", label: "Chi phí tuyển dụng" },
    { key: "quality", label: "Chất lượng tuyển dụng" },
    { key: "custom", label: "Báo cáo tùy chỉnh" },
  ];

  return (
    <div className="space-y-4 w-full font-sans pb-10">
      {/* ======================================================== */}
      {/* 1. PAGE HEADER                                           */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-transparent">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 m-0 tracking-tight leading-snug">
            Báo cáo tuyển dụng
          </h1>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsSaveReportModalOpen(true)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Bookmark className="w-3.5 h-3.5 text-slate-500" />
            <span>Lưu báo cáo</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Xuất báo cáo</span>
          </button>

          <button
            type="button"
            onClick={() => setIsNewReportModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Báo cáo mới</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. REPORT NAVIGATION TABS                                */}
      {/* ======================================================== */}
      <div className="border-b border-slate-200 flex items-center gap-6 overflow-x-auto no-scrollbar pt-1">
        {REPORT_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`pb-2.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer relative ${
              activeTab === tab.key
                ? "text-[#0062ff]"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>{tab.label}</span>
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0062ff] rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* ======================================================== */}
      {/* 3. DATE RANGE & COMPARISON BAR                           */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Khoảng thời gian:</span>
            <div className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold text-xs flex items-center gap-2 shadow-2xs">
              <span>Tháng hiện tại (30 ngày gần nhất)</span>
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">So sánh với:</span>
            <Select
              value={comparePeriod}
              onChange={setComparePeriod}
              className="w-48 text-xs font-bold"
              options={[
                { value: "prev_month", label: "Kỳ trước đó" },
                { value: "prev_year", label: "Cùng kỳ năm trước" },
                { value: "none", label: "Không so sánh" },
              ]}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400 text-[11px] font-medium">
          <span>Cập nhật lần cuối: {lastUpdated}</span>
          <button
            type="button"
            onClick={() => {
              fetchReportData();
              message.success("Đang làm mới dữ liệu báo cáo từ máy chủ...");
            }}
            className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors cursor-pointer"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* Alert Error State */}
      {error && (
        <Alert
          type="error"
          message="Lỗi tải dữ liệu báo cáo"
          description={error}
          showIcon
          action={
            <button
              onClick={fetchReportData}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold"
            >
              Tải lại
            </button>
          }
          className="rounded-2xl"
        />
      )}

      {/* ======================================================== */}
      {/* 4. MAIN WORKSPACE: 2 COLUMNS (LEFT 78% | RIGHT 22%)      */}
      {/* ======================================================== */}
      {loading && !dashboardData && jobReports.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200">
          <Spin size="large" />
          <span className="text-slate-500 text-xs font-medium">Đang tổng hợp số liệu báo cáo tuyển dụng...</span>
        </div>
      ) : (
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4.5 items-start">
        {/* ====================================================== */}
        {/* LEFT COLUMN: CHARTS, FUNNEL & TABLES (col-span-9)      */}
        {/* ====================================================== */}
        <div className="xl:col-span-8 2xl:col-span-9 space-y-4">
          {/* ==================================================== */}
          {/* TAB 1: TỔNG QUAN BÁO CÁO                             */}
          {/* ==================================================== */}
          {activeTab === "overview" && (
            <>
              {/* ---------------- 4.1 6 KPI REPORT CARDS -------------- */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {/* KPI 1 */}
                <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-2 hover:border-blue-300 transition-all text-center flex flex-col items-center justify-between">
                  <div className="flex items-center justify-center gap-1.5 w-full">
                    <span className="text-[11px] font-bold text-slate-500 truncate">
                      Tin tuyển dụng đã đăng
                    </span>
                    <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0">
                      <Briefcase className="w-3 h-3" />
                    </div>
                  </div>
                  <div className="w-full text-center">
                    <span className="text-xl font-black text-slate-900 block leading-none">
                      {totalJobs}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center justify-center gap-0.5 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>{dashboardData?.active_jobs ?? totalJobs} đang mở</span>
                    </span>
                  </div>
                </div>

                {/* KPI 2 */}
                <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-2 hover:border-emerald-300 transition-all text-center flex flex-col items-center justify-between">
                  <div className="flex items-center justify-center gap-1.5 w-full">
                    <span className="text-[11px] font-bold text-slate-500 truncate">
                      Ứng viên mới
                    </span>
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Users className="w-3 h-3" />
                    </div>
                  </div>
                  <div className="w-full text-center">
                    <span className="text-xl font-black text-slate-900 block leading-none">
                      {totalCandidates}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center justify-center gap-0.5 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>Dữ liệu thực tế</span>
                    </span>
                  </div>
                </div>

                {/* KPI 3 */}
                <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-2 hover:border-purple-300 transition-all text-center flex flex-col items-center justify-between">
                  <div className="flex items-center justify-center gap-1.5 w-full">
                    <span className="text-[11px] font-bold text-slate-500 truncate">
                      Ứng viên vào vòng PV
                    </span>
                    <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <UserCheck className="w-3 h-3" />
                    </div>
                  </div>
                  <div className="w-full text-center">
                    <span className="text-xl font-black text-slate-900 block leading-none">
                      {interviewCandidates}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center justify-center gap-0.5 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>{dashboardData?.upcoming_interviews_count ?? 0} sắp diễn ra</span>
                    </span>
                  </div>
                </div>

                {/* KPI 4 */}
                <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-2 hover:border-orange-300 transition-all text-center flex flex-col items-center justify-between">
                  <div className="flex items-center justify-center gap-1.5 w-full">
                    <span className="text-[11px] font-bold text-slate-500 truncate">
                      Offers gửi đi
                    </span>
                    <div className="w-6 h-6 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                      <Send className="w-3 h-3" />
                    </div>
                  </div>
                  <div className="w-full text-center">
                    <span className="text-xl font-black text-slate-900 block leading-none">
                      {offersSent}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 flex items-center justify-center gap-0.5 mt-1">
                      <span>Theo hồ sơ</span>
                    </span>
                  </div>
                </div>

                {/* KPI 5 */}
                <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-2 hover:border-green-300 transition-all text-center flex flex-col items-center justify-between">
                  <div className="flex items-center justify-center gap-1.5 w-full">
                    <span className="text-[11px] font-bold text-slate-500 truncate">
                      Ứng viên chấp nhận
                    </span>
                    <div className="w-6 h-6 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3 h-3" />
                    </div>
                  </div>
                  <div className="w-full text-center">
                    <span className="text-xl font-black text-slate-900 block leading-none">
                      {accepted}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center justify-center gap-0.5 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>Đã tuyển thành công</span>
                    </span>
                  </div>
                </div>

                {/* KPI 6 */}
                <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-2 hover:border-pink-300 transition-all text-center flex flex-col items-center justify-between">
                  <div className="flex items-center justify-center gap-1.5 w-full">
                    <span className="text-[11px] font-bold text-slate-500 truncate">
                      Tỷ lệ chấp nhận offer
                    </span>
                    <div className="w-6 h-6 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
                      <Percent className="w-3 h-3" />
                    </div>
                  </div>
                  <div className="w-full text-center">
                    <span className="text-xl font-black text-slate-900 block leading-none">
                      {acceptanceRate}%
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center justify-center gap-0.5 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>Hiệu suất offer</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* ---------------- 4.2 3-COLUMN ANALYTICS ROW ---------- */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {/* 1. FUNNEL */}
                <div className="bg-white rounded-2xl py-5 px-4 min-h-[295px] border border-slate-200/90 shadow-2xs space-y-3 flex flex-col justify-between">
                  <div className="pb-1 border-b border-slate-100">
                    <h3 className="text-xs font-black text-slate-900 m-0">
                      Ứng viên theo giai đoạn tuyển dụng
                    </h3>
                  </div>

                  <div className="flex items-center gap-4 pt-1">
                    <div className="w-28 h-36 shrink-0">
                      <svg viewBox="0 0 100 130" className="w-full h-full">
                        <polygon points="5,0 95,0 85,24 15,24" fill="#0062ff" />
                        <polygon points="17,26 83,26 73,50 27,50" fill="#06b6d4" />
                        <polygon points="29,52 71,52 61,76 39,76" fill="#a855f7" />
                        <polygon points="41,78 59,78 53,102 47,102" fill="#f97316" />
                        <polygon points="47,104 53,104 52,126 48,126" fill="#10b981" />
                      </svg>
                    </div>

                    <div className="space-y-1.5 text-[11px] flex-1 min-w-0">
                      {funnelStages.map((st, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 min-w-0 truncate">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: st.color }}
                            />
                            <span className="text-slate-600 font-medium truncate">
                              {st.name}
                            </span>
                          </div>
                          <span className="font-bold text-slate-900 shrink-0">
                            {st.count} <span className="text-slate-400 font-normal">({st.percent}%)</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-2 bg-slate-50 rounded-xl text-center border border-slate-100">
                    <span className="text-[10.5px] text-slate-500 font-medium block">
                      Tỷ lệ tuyển dụng thành công
                    </span>
                    <span className="text-sm font-black text-[#0062ff]">
                      {totalCandidates > 0 ? ((accepted / totalCandidates) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>

                {/* 2. DONUT */}
                <div className="bg-white rounded-2xl py-5 px-4 min-h-[295px] border border-slate-200/90 shadow-2xs space-y-3 flex flex-col justify-between">
                  <div className="pb-1 border-b border-slate-100">
                    <h3 className="text-xs font-black text-slate-900 m-0">
                      Ứng viên theo nguồn
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                      <svg viewBox="0 0 42 42" className="w-full h-full transform -rotate-90">
                        <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#0062ff" strokeWidth="6" strokeDasharray="45 55" strokeDashoffset="0" />
                        <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#0284c7" strokeWidth="6" strokeDasharray="25 75" strokeDashoffset="-45" />
                        <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#10b981" strokeWidth="6" strokeDasharray="15 85" strokeDashoffset="-70" />
                        <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f59e0b" strokeWidth="6" strokeDasharray="10 90" strokeDashoffset="-85" />
                        <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#94a3b8" strokeWidth="6" strokeDasharray="5 95" strokeDashoffset="-95" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                        <span className="text-sm font-black text-slate-900 leading-none">
                          {totalCandidates}
                        </span>
                        <span className="text-[8px] font-semibold text-slate-400 mt-0.5">
                          Tổng ứng viên
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 text-[10.5px] flex-1 min-w-0">
                      {candidateSources.map((src, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 min-w-0 truncate">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: src.color }}
                            />
                            <span className="text-slate-600 font-medium truncate">
                              {src.name}
                            </span>
                          </div>
                          <span className="font-bold text-slate-900 shrink-0 text-[10px]">
                            {src.count} <span className="text-slate-400 font-normal">({src.percent}%)</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="h-9" />
                </div>

                {/* 3. HORIZONTAL BARS */}
                <div className="bg-white rounded-2xl py-5 px-4 min-h-[295px] border border-slate-200/90 shadow-2xs space-y-3 flex flex-col justify-between">
                  <div className="pb-1 border-b border-slate-100">
                    <h3 className="text-xs font-black text-slate-900 m-0">
                      Ứng viên theo vị trí tuyển dụng
                    </h3>
                  </div>

                  <div className="space-y-2 pt-1">
                    {positionBreakdown.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs">Chưa có dữ liệu vị trí</div>
                    ) : (
                      positionBreakdown.map((pos, idx) => (
                        <div key={idx} className="space-y-0.5 text-xs">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-700 font-medium truncate max-w-[140px]">
                              {pos.title}
                            </span>
                            <span className="text-[10px] font-bold text-slate-800 shrink-0">
                              {pos.count} <span className="text-slate-400 font-normal">({pos.percent}%)</span>
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#0062ff] rounded-full"
                              style={{ width: `${pos.barWidth}%` }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex justify-between text-[9.5px] text-slate-400 font-medium pt-1 border-t border-slate-100">
                    <span>0</span>
                    <span>20</span>
                    <span>40</span>
                    <span>60</span>
                    <span>80</span>
                    <span>100</span>
                  </div>
                </div>
              </div>

              {/* ---------------- 4.3 LINE CHART & AVERAGE TIME ------- */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
                {/* LINE CHART */}
                <div className="lg:col-span-8 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-1 border-b border-slate-100">
                    <h3 className="text-xs sm:text-[13px] font-black text-slate-900 m-0">
                      Xu hướng ứng viên theo ngày
                    </h3>

                    <div className="flex items-center gap-3 text-[10.5px] font-bold text-slate-600 flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#0062ff]" />
                        <span>Ứng viên mới</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                        <span>Vào phỏng vấn</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                        <span>Offers gửi đi</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#a855f7]" />
                        <span>Chấp nhận</span>
                      </span>
                    </div>
                  </div>

                  <div className="relative w-full h-48 pt-1">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 690 200">
                      <line x1="30" y1="25" x2="680" y2="25" stroke="#f1f5f9" strokeDasharray="3 3" />
                      <line x1="30" y1="64" x2="680" y2="64" stroke="#f1f5f9" strokeDasharray="3 3" />
                      <line x1="30" y1="102" x2="680" y2="102" stroke="#f1f5f9" strokeDasharray="3 3" />
                      <line x1="30" y1="141" x2="680" y2="141" stroke="#f1f5f9" strokeDasharray="3 3" />
                      <line x1="30" y1="180" x2="680" y2="180" stroke="#cbd5e1" strokeWidth="1.2" />

                      <text x="5" y="29" fill="#94a3b8" fontSize="10" fontWeight="bold">100</text>
                      <text x="10" y="68" fill="#94a3b8" fontSize="10" fontWeight="bold">80</text>
                      <text x="10" y="106" fill="#94a3b8" fontSize="10" fontWeight="bold">60</text>
                      <text x="10" y="145" fill="#94a3b8" fontSize="10" fontWeight="bold">40</text>
                      <text x="10" y="184" fill="#94a3b8" fontSize="10" fontWeight="bold">0</text>

                      <path d="M 45 110 Q 95 87 145 87 T 245 99 T 345 71 T 445 90 T 545 79 T 645 105" fill="none" stroke="#0062ff" strokeWidth="2.2" />
                      <path d="M 45 161 Q 95 152 145 152 T 245 156 T 345 145 T 445 150 T 545 149 T 645 155" fill="none" stroke="#10b981" strokeWidth="2.2" />
                      <path d="M 45 174 Q 95 170 145 170 T 245 172 T 345 167 T 445 170 T 545 169 T 645 172" fill="none" stroke="#f59e0b" strokeWidth="2.2" />
                      <path d="M 45 177 Q 95 177 145 177 T 245 178 T 345 175 T 445 177 T 545 175 T 645 177" fill="none" stroke="#a855f7" strokeWidth="2.2" />

                      {dailyTrendPoints.map((pt: any, idx: number) => (
                        <g key={idx} className="cursor-pointer" onMouseEnter={() => setHoveredTrendIdx(idx)}>
                          <circle cx={pt.x} cy={getTrendY(pt.newCand)} r="4" fill="#0062ff" stroke="#fff" strokeWidth="2" />
                          <circle cx={pt.x} cy={getTrendY(pt.interview)} r="3" fill="#10b981" stroke="#fff" strokeWidth="1.5" />
                          <circle cx={pt.x} cy={getTrendY(pt.offer)} r="3" fill="#f59e0b" stroke="#fff" strokeWidth="1.5" />
                          <circle cx={pt.x} cy={getTrendY(pt.accept)} r="3" fill="#a855f7" stroke="#fff" strokeWidth="1.5" />
                        </g>
                      ))}

                      {dailyTrendPoints.map((pt: any, idx: number) => (
                        <text key={idx} x={pt.x - 12} y="196" fill={hoveredTrendIdx === idx ? "#0062ff" : "#94a3b8"} fontSize="9.5" fontWeight="bold">
                          {pt.date}
                        </text>
                      ))}
                    </svg>

                    {hoveredTrendIdx !== null && dailyTrendPoints[hoveredTrendIdx] && (
                      <div
                        className="absolute bg-white/95 backdrop-blur-xs border border-slate-200 shadow-md p-2.5 rounded-xl text-[11px] pointer-events-none z-10 space-y-1"
                        style={{
                          left: `${(dailyTrendPoints[hoveredTrendIdx].x / 690) * 88}%`,
                          top: "10px",
                        }}
                      >
                        <span className="font-black text-slate-900 block border-b border-slate-100 pb-0.5">
                          {dailyTrendPoints[hoveredTrendIdx].date}
                        </span>
                        <div className="space-y-0.5 text-[10px]">
                          <div className="text-[#0062ff] font-semibold">
                            Ứng viên mới: {dailyTrendPoints[hoveredTrendIdx].newCand}
                          </div>
                          <div className="text-[#10b981] font-semibold">
                            Phỏng vấn: {dailyTrendPoints[hoveredTrendIdx].interview}
                          </div>
                          <div className="text-[#f59e0b] font-semibold">
                            Offers: {dailyTrendPoints[hoveredTrendIdx].offer}
                          </div>
                          <div className="text-[#a855f7] font-semibold">
                            Chấp nhận: {dailyTrendPoints[hoveredTrendIdx].accept}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* AVERAGE TIME */}
                <div className="lg:col-span-4 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3.5 flex flex-col justify-between">
                  <div className="pb-1 border-b border-slate-100">
                    <h3 className="text-xs sm:text-[13px] font-black text-slate-900 m-0">
                      Thời gian tuyển dụng trung bình{" "}
                      <span className="text-[11px] font-normal text-slate-400">(theo ngày)</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
                      <span className="text-[10.5px] font-bold text-slate-500 block">Sàng lọc hồ sơ</span>
                      <span className="text-base font-black text-slate-900 block leading-tight">2.3 ngày</span>
                      <span className="text-[9.5px] font-bold text-emerald-600 flex items-center gap-0.5">
                        <TrendingDown className="w-2.5 h-2.5" />
                        <span>0.4 ngày</span>
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
                      <span className="text-[10.5px] font-bold text-slate-500 block">Phỏng vấn</span>
                      <span className="text-base font-black text-slate-900 block leading-tight">7.8 ngày</span>
                      <span className="text-[9.5px] font-bold text-rose-500 flex items-center gap-0.5">
                        <TrendingUp className="w-2.5 h-2.5" />
                        <span>1.2 ngày</span>
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
                      <span className="text-[10.5px] font-bold text-slate-500 block">Offer</span>
                      <span className="text-base font-black text-slate-900 block leading-tight">3.1 ngày</span>
                      <span className="text-[9.5px] font-bold text-emerald-600 flex items-center gap-0.5">
                        <TrendingDown className="w-2.5 h-2.5" />
                        <span>0.6 ngày</span>
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
                      <span className="text-[10.5px] font-bold text-slate-500 block">Tuyển dụng xong</span>
                      <span className="text-base font-black text-slate-900 block leading-tight">13.2 ngày</span>
                      <span className="text-[9.5px] font-bold text-emerald-600 flex items-center gap-0.5">
                        <TrendingDown className="w-2.5 h-2.5" />
                        <span>0.6 ngày</span>
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">
                      Thời gian tuyển dụng tối ưu
                    </span>
                    <span className="font-bold text-emerald-600 flex items-center gap-0.5">
                      <TrendingDown className="w-3 h-3" />
                      <span>Đạt chuẩn hiệu suất</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* ---------------- 4.4 BOTTOM DATA TABLE: HIỆU QUẢ TIN ------- */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <h3 className="text-xs sm:text-[13.5px] font-black text-slate-900 m-0">
                    Hiệu quả tin tuyển dụng
                  </h3>
                </div>

                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="py-2.5 pr-3">Tin tuyển dụng</th>
                        <th className="py-2.5 px-3">Vị trí</th>
                        <th className="py-2.5 px-3 text-right">Lượt xem</th>
                        <th className="py-2.5 px-3 text-right">Ứng viên mới</th>
                        <th className="py-2.5 px-3 text-right">Vào phỏng vấn</th>
                        <th className="py-2.5 px-3 text-right">Offers gửi đi</th>
                        <th className="py-2.5 px-3 text-right">Chấp nhận</th>
                        <th className="py-2.5 px-3 text-right">Tỷ lệ chấp nhận</th>
                        <th className="py-2.5 px-3 text-right">Chi phí (VNĐ)</th>
                        <th className="py-2.5 pl-3 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {jobReports.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="py-8 text-center">
                            <Empty description="Chưa có tin tuyển dụng nào được ghi nhận" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                          </td>
                        </tr>
                      ) : (
                        jobReports.map((job) => (
                          <tr key={job.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 pr-3 font-semibold text-slate-900">
                              <div className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full shrink-0 ${job.status === "active" ? "bg-emerald-500" : "bg-slate-400"}`} />
                                <span className="truncate max-w-[190px]">{job.title}</span>
                              </div>
                              <span className={`text-[10px] block pl-3.5 ${job.status === "active" ? "text-emerald-600" : "text-slate-400"}`}>
                                {job.status === "active" ? "Đang hoạt động" : "Bản nháp / Đã đóng"}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-500 text-[11px]">{job.department}</td>
                            <td className="py-3 px-3 text-right text-slate-700 font-semibold">{job.views.toLocaleString()}</td>
                            <td className="py-3 px-3 text-right text-slate-700 font-semibold">{job.newCandidates}</td>
                            <td className="py-3 px-3 text-right text-slate-700 font-semibold">{job.interviewCandidates}</td>
                            <td className="py-3 px-3 text-right text-slate-700 font-semibold">{job.offersSent}</td>
                            <td className="py-3 px-3 text-right text-slate-700 font-semibold">{job.accepted}</td>
                            <td className="py-3 px-3 text-right text-slate-800 font-bold">{job.acceptanceRate.toFixed(1)}%</td>
                            <td className="py-3 px-3 text-right font-bold text-slate-900">{job.costVnd.toLocaleString()}</td>
                            <td className="py-3 pl-3 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedJobDetail(job)}
                                className="text-[#0062ff] hover:underline font-bold text-[11px] cursor-pointer"
                              >
                                Xem chi tiết
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs border-t border-slate-100">
                  <Link href="/doanh-nghiep/tin-tuyen-dung" className="text-[#0062ff] hover:underline font-bold text-xs">
                    Xem tất cả tin tuyển dụng →
                  </Link>

                  <div className="flex items-center gap-1.5">
                    <button type="button" className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 font-bold text-xs cursor-pointer">&lt;</button>
                    <button type="button" className="w-7 h-7 rounded-lg bg-[#0062ff] text-white font-bold text-xs flex items-center justify-center shadow-xs cursor-pointer">1</button>
                    <button type="button" className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 font-bold text-xs cursor-pointer">2</button>
                    <button type="button" className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 font-bold text-xs cursor-pointer">3</button>
                    <span className="px-1 text-slate-400">...</span>
                    <button type="button" className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 font-bold text-xs cursor-pointer">8</button>
                    <button type="button" className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 font-bold text-xs cursor-pointer">&gt;</button>
                    <Select defaultValue="10" className="w-24 text-xs ml-2" options={[{ value: "10", label: "10 / trang" }, { value: "20", label: "20 / trang" }]} />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ==================================================== */}
          {/* TAB 2: HIỆU QUẢ TIN TUYỂN DỤNG                       */}
          {/* ==================================================== */}
          {activeTab === "job_performance" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1 text-center">
                  <span className="text-[11px] font-bold text-slate-500">Tổng lượt xem tin</span>
                  <span className="text-2xl font-black text-slate-900 block">4,200</span>
                  <span className="text-[10.5px] text-emerald-600 font-bold">↑ 24% so với kỳ trước</span>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1 text-center">
                  <span className="text-[11px] font-bold text-slate-500">Ứng tuyển TB / Tin</span>
                  <span className="text-2xl font-black text-[#0062ff] block">56</span>
                  <span className="text-[10.5px] text-emerald-600 font-bold">↑ 14% so với kỳ trước</span>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1 text-center">
                  <span className="text-[11px] font-bold text-slate-500">Tỷ lệ nộp đơn (Apply Rate)</span>
                  <span className="text-2xl font-black text-purple-600 block">8.48%</span>
                  <span className="text-[10.5px] text-emerald-600 font-bold">↑ 1.2% so với kỳ trước</span>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1 text-center">
                  <span className="text-[11px] font-bold text-slate-500">Thời gian tuyển TB (Time-to-fill)</span>
                  <span className="text-2xl font-black text-slate-900 block">13.2 ngày</span>
                  <span className="text-[10.5px] text-emerald-600 font-bold">↓ 1.8 ngày (nhanh hơn)</span>
                </div>
              </div>

              {/* Jobs Table in Performance Tab */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-900 m-0">
                    Bảng so sánh hiệu quả các vị trí đang tuyển
                  </h3>
                  <button
                    type="button"
                    onClick={() => message.info("Đang lọc tin tuyển dụng hiệu quả nhất...")}
                    className="text-xs font-bold text-[#0062ff] hover:underline"
                  >
                    Sắp xếp theo chuyển đổi cao nhất
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {jobReports.length === 0 ? (
                    <div className="py-8 text-center">
                      <Empty description="Chưa có dữ liệu hiệu quả tin tuyển dụng" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    </div>
                  ) : (
                    jobReports.map((job) => (
                      <div key={job.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{job.title}</span>
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0062ff] font-bold text-[10px]">
                              {job.department}
                            </span>
                          </div>
                          <div className="text-slate-500 flex items-center gap-3 text-[11px]">
                            <span>Lượt xem: <strong>{job.views.toLocaleString()}</strong></span>
                            <span>•</span>
                            <span>Ứng viên: <strong className="text-blue-600">{job.newCandidates}</strong></span>
                            <span>•</span>
                            <span>Tuyển được: <strong className="text-emerald-600">{job.accepted}</strong></span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-xs font-black text-emerald-600 block">
                              {job.acceptanceRate}% Tỷ lệ chấp nhận
                            </span>
                            <span className="text-[10.5px] text-slate-400">
                              Chi phí: {job.costVnd.toLocaleString()} đ
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedJobDetail(job)}
                            className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0062ff] font-bold text-xs cursor-pointer transition-colors"
                          >
                            Chi tiết
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 3: NGUỒN ỨNG VIÊN                                */}
          {/* ==================================================== */}
          {activeTab === "sources" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-xs font-bold text-slate-500">Nguồn nhiều ứng viên nhất</span>
                  <span className="text-lg font-black text-[#0062ff] block">Website công ty (34.3%)</span>
                  <span className="text-[11px] text-slate-400 font-medium">122 hồ sơ nộp trực tiếp</span>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-xs font-bold text-slate-500">Nguồn chất lượng cao nhất</span>
                  <span className="text-lg font-black text-emerald-600 block">LinkedIn (27.0%)</span>
                  <span className="text-[11px] text-slate-400 font-medium">Tỷ lệ qua phỏng vấn 42.5%</span>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-xs font-bold text-slate-500">Nguồn chuyển đổi cao nhất</span>
                  <span className="text-lg font-black text-purple-600 block">Referral - Giới thiệu</span>
                  <span className="text-[11px] text-slate-400 font-medium">Tỷ lệ nhận việc 18.2%</span>
                </div>
              </div>

              {/* Source Analytics Table */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
                <h3 className="text-sm font-black text-slate-900 m-0 pb-2 border-b border-slate-100">
                  Thống kê hiệu quả chuyển đổi từng nguồn ứng viên
                </h3>

                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10.5px] font-bold text-slate-400 uppercase">
                      <th className="py-2.5">Nguồn ứng viên</th>
                      <th className="py-2.5 text-right">Tổng ứng viên</th>
                      <th className="py-2.5 text-right">Phù hợp</th>
                      <th className="py-2.5 text-right">Phỏng vấn</th>
                      <th className="py-2.5 text-right">Offer</th>
                      <th className="py-2.5 text-right">Đã tuyển</th>
                      <th className="py-2.5 text-right">Tỷ lệ chuyển đổi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {candidateSources.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center">
                          <Empty description="Chưa có dữ liệu nguồn ứng viên" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        </td>
                      </tr>
                    ) : (
                      candidateSources.map((src: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-3 font-bold text-slate-900 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: src.color }} />
                            <span>{src.name}</span>
                          </td>
                          <td className="py-3 text-right font-semibold">{src.count}</td>
                          <td className="py-3 text-right">{Math.round(src.count * 0.6)}</td>
                          <td className="py-3 text-right">{Math.round(src.count * 0.25)}</td>
                          <td className="py-3 text-right">{Math.round(src.count * 0.08)}</td>
                          <td className="py-3 text-right font-bold text-emerald-600">{Math.max(1, Math.round(src.count * 0.03))}</td>
                          <td className="py-3 text-right font-bold text-[#0062ff]">{src.percent}%</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 4: PIPELINE & THỜI GIAN                          */}
          {/* ==================================================== */}
          {activeTab === "pipeline_time" && (
            <div className="space-y-4">
              {/* Bottleneck Warning Banner */}
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-3 text-xs">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 font-bold">
                  ⚠️
                </div>
                <div>
                  <h4 className="font-bold text-amber-900 m-0 text-sm">
                    Phát hiện điểm nghẽn tuyển dụng: Giai đoạn Phỏng vấn
                  </h4>
                  <p className="text-amber-800 font-medium m-0 mt-0.5 leading-relaxed">
                    Ứng viên dành trung bình <strong>7.8 ngày</strong> ở vòng phỏng vấn (tăng 1.2 ngày so với kỳ trước). Đề xuất nhắc nhở người phỏng vấn gửi đánh giá sớm trong vòng 24h.
                  </p>
                </div>
              </div>

              {/* Stage by Stage Conversion */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3.5">
                <h3 className="text-sm font-black text-slate-900 m-0 pb-2 border-b border-slate-100">
                  Tỷ lệ chuyển đổi giữa các bước (Step-by-Step Conversion)
                </h3>

                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-xl space-y-1.5">
                    <div className="flex justify-between font-bold text-xs text-slate-800">
                      <span>1. Ứng viên mới → Sàng lọc hồ sơ (Screening)</span>
                      <span className="text-[#0062ff]">60.1% (214 / 356)</span>
                    </div>
                    <Progress percent={60.1} strokeColor="#0062ff" showInfo={false} size="small" />
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl space-y-1.5">
                    <div className="flex justify-between font-bold text-xs text-slate-800">
                      <span>2. Sàng lọc hồ sơ → Phỏng vấn chuyên môn (Interview)</span>
                      <span className="text-purple-600">41.6% (89 / 214)</span>
                    </div>
                    <Progress percent={41.6} strokeColor="#a855f7" showInfo={false} size="small" />
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl space-y-1.5">
                    <div className="flex justify-between font-bold text-xs text-slate-800">
                      <span>3. Phỏng vấn → Gửi thư mời nhận việc (Offer Sent)</span>
                      <span className="text-orange-500">31.5% (28 / 89)</span>
                    </div>
                    <Progress percent={31.5} strokeColor="#f97316" showInfo={false} size="small" />
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl space-y-1.5">
                    <div className="flex justify-between font-bold text-xs text-slate-800">
                      <span>4. Gửi thư mời → Ứng viên chấp nhận (Accepted)</span>
                      <span className="text-emerald-600">39.3% (11 / 28)</span>
                    </div>
                    <Progress percent={39.3} strokeColor="#10b981" showInfo={false} size="small" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 5: CHI PHÍ TUYỂN DỤNG                            */}
          {/* ==================================================== */}
          {activeTab === "cost" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1 text-center">
                  <span className="text-[11px] font-bold text-slate-500">Tổng chi phí tuyển dụng</span>
                  <span className="text-xl font-black text-slate-900 block">14,500,000 đ</span>
                  <span className="text-[10px] text-emerald-600 font-bold">Trong ngân sách</span>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1 text-center">
                  <span className="text-[11px] font-bold text-slate-500">Chi phí / Ứng viên</span>
                  <span className="text-xl font-black text-blue-600 block">40,730 đ</span>
                  <span className="text-[10px] text-emerald-600 font-bold">↓ 12% so với Q2</span>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1 text-center">
                  <span className="text-[11px] font-bold text-slate-500">Chi phí / Tuyển thành công (Cost per Hire)</span>
                  <span className="text-xl font-black text-emerald-600 block">1,318,180 đ</span>
                  <span className="text-[10px] text-emerald-600 font-bold">Rất hiệu quả</span>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1 text-center">
                  <span className="text-[11px] font-bold text-slate-500">Ngân sách còn lại</span>
                  <span className="text-xl font-black text-purple-600 block">65,500,000 đ</span>
                  <span className="text-[10px] text-slate-400">Hiệu lực đến cuối năm</span>
                </div>
              </div>

              {/* Cost Breakdown Table */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
                <h3 className="text-sm font-black text-slate-900 m-0 pb-2 border-b border-slate-100">
                  Chi phí tuyển dụng theo từng vị trí
                </h3>

                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10.5px] font-bold text-slate-400 uppercase">
                      <th className="py-2.5">Vị trí công việc</th>
                      <th className="py-2.5 text-right">Tổng chi phí</th>
                      <th className="py-2.5 text-right">Số ứng tuyển</th>
                      <th className="py-2.5 text-right">Số người đã tuyển</th>
                      <th className="py-2.5 text-right">Chi phí / Tuyển dụng (Cost/Hire)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {jobReports.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center">
                          <Empty description="Chưa có dữ liệu chi phí tuyển dụng" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        </td>
                      </tr>
                    ) : (
                      jobReports.map((job) => (
                        <tr key={job.id} className="hover:bg-slate-50">
                          <td className="py-3 font-bold text-slate-900">{job.title}</td>
                          <td className="py-3 text-right font-semibold">{job.costVnd.toLocaleString()} đ</td>
                          <td className="py-3 text-right">{job.newCandidates}</td>
                          <td className="py-3 text-right font-bold text-emerald-600">{job.accepted}</td>
                          <td className="py-3 text-right font-black text-[#0062ff]">
                            {Math.round(job.costVnd / (job.accepted || 1)).toLocaleString()} đ
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 6: CHẤT LƯỢNG TUYỂN DỤNG                         */}
          {/* ==================================================== */}
          {activeTab === "quality" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1 text-center">
                  <span className="text-[11px] font-bold text-slate-500">Tỷ lệ đỗ phỏng vấn (Pass Rate)</span>
                  <span className="text-2xl font-black text-emerald-600 block">38.5%</span>
                  <span className="text-[10px] text-emerald-600 font-bold">Chất lượng ứng viên tốt</span>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1 text-center">
                  <span className="text-[11px] font-bold text-slate-500">Tỷ lệ nhận việc (Offer Accepted)</span>
                  <span className="text-2xl font-black text-[#0062ff] block">39.3%</span>
                  <span className="text-[10px] text-emerald-600 font-bold">↑ 8.5% so với kỳ trước</span>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1 text-center">
                  <span className="text-[11px] font-bold text-slate-500">Tỷ lệ gắn bó sau 90 ngày</span>
                  <span className="text-2xl font-black text-purple-600 block">95.8%</span>
                  <span className="text-[10px] text-emerald-600 font-bold">Rất cao</span>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1 text-center">
                  <span className="text-[11px] font-bold text-slate-500">Đánh giá ứng viên (NPS)</span>
                  <span className="text-2xl font-black text-amber-500 block">4.8 / 5.0</span>
                  <span className="text-[10px] text-slate-400">Từ 140 khảo sát</span>
                </div>
              </div>

              {/* Quality Distribution */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
                <h3 className="text-sm font-black text-slate-900 m-0 pb-2 border-b border-slate-100">
                  Phân loại mức độ phù hợp của hồ sơ ứng tuyển
                </h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between font-bold text-slate-700 mb-1">
                      <span>Ứng viên tiềm năng cao (Match Score &gt;= 85%)</span>
                      <span className="text-emerald-600">42% (150 ứng viên)</span>
                    </div>
                    <Progress percent={42} strokeColor="#10b981" showInfo={false} size="small" />
                  </div>
                  <div>
                    <div className="flex justify-between font-bold text-slate-700 mb-1">
                      <span>Ứng viên phù hợp tiêu chuẩn (Match Score 70 - 84%)</span>
                      <span className="text-blue-600">46% (164 ứng viên)</span>
                    </div>
                    <Progress percent={46} strokeColor="#0062ff" showInfo={false} size="small" />
                  </div>
                  <div>
                    <div className="flex justify-between font-bold text-slate-700 mb-1">
                      <span>Ứng viên cần cân nhắc (Match Score &lt; 70%)</span>
                      <span className="text-slate-500">12% (42 ứng viên)</span>
                    </div>
                    <Progress percent={12} strokeColor="#94a3b8" showInfo={false} size="small" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 7: BÁO CÁO TÙY CHỈNH                             */}
          {/* ==================================================== */}
          {activeTab === "custom" && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
              <div className="pb-2 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900 m-0">
                  Bộ tạo báo cáo tùy chỉnh (Custom Analytics Builder)
                </h3>
                <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
                  Lựa chọn các chỉ số và cách nhóm dữ liệu để tạo báo cáo theo nhu cầu doanh nghiệp.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-800 block">Chỉ số hiển thị:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <Checkbox defaultChecked>Ứng viên mới</Checkbox>
                    <Checkbox defaultChecked>Vào phỏng vấn</Checkbox>
                    <Checkbox defaultChecked>Gửi Offers</Checkbox>
                    <Checkbox defaultChecked>Chấp nhận việc</Checkbox>
                    <Checkbox defaultChecked>Lượt xem tin</Checkbox>
                    <Checkbox defaultChecked>Chi phí tuyển</Checkbox>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-800 block">Nhóm dữ liệu theo (Group by):</span>
                  <Select
                    defaultValue="position"
                    className="w-full text-xs"
                    options={[
                      { value: "position", label: "Theo vị trí tuyển dụng" },
                      { value: "department", label: "Theo phòng ban" },
                      { value: "source", label: "Theo nguồn ứng viên" },
                      { value: "date", label: "Theo ngày / tuần / tháng" },
                    ]}
                  />
                  <button
                    type="button"
                    onClick={() => message.success("Đã tạo báo cáo tùy chỉnh thành công!")}
                    className="w-full py-2 bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer mt-2"
                  >
                    Tạo bảng dữ liệu tùy chỉnh
                  </button>
                </div>
              </div>

              {/* Custom Preview Table */}
              <div className="pt-2">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10.5px] font-bold text-slate-400 uppercase">
                      <th className="py-2">Nhóm</th>
                      <th className="py-2 text-right">Lượt xem</th>
                      <th className="py-2 text-right">Ứng viên</th>
                      <th className="py-2 text-right">Phỏng vấn</th>
                      <th className="py-2 text-right">Tuyển được</th>
                      <th className="py-2 text-right">Tổng chi phí</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    <tr className="hover:bg-slate-50">
                      <td className="py-2.5 font-bold text-slate-900">IT - Phát triển</td>
                      <td className="py-2.5 text-right">2,288</td>
                      <td className="py-2.5 text-right">168</td>
                      <td className="py-2.5 text-right">42</td>
                      <td className="py-2.5 text-right font-bold text-emerald-600">5</td>
                      <td className="py-2.5 text-right font-bold">4,400,000 đ</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-2.5 font-bold text-slate-900">Sản phẩm &amp; Thiết kế</td>
                      <td className="py-2.5 text-right">1,500</td>
                      <td className="py-2.5 text-right">84</td>
                      <td className="py-2.5 text-right">22</td>
                      <td className="py-2.5 text-right font-bold text-emerald-600">3</td>
                      <td className="py-2.5 text-right font-bold">3,800,000 đ</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ====================================================== */}
        {/* RIGHT COLUMN: REPORT CONTROL PANEL (col-span-3)       */}
        {/* ====================================================== */}
        <div className="xl:col-span-4 2xl:col-span-3 space-y-4 sticky top-4 max-h-[calc(100vh-80px)] overflow-y-auto pr-0.5">
          {/* ---------------- 1. BỘ LỌC BÁO CÁO ------------------- */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
              <span className="font-extrabold text-xs text-slate-900">
                Bộ lọc báo cáo
              </span>
              <button
                type="button"
                onClick={() => {
                  setFilterPosition("all");
                  setFilterDepartment("all");
                  setFilterSource("all");
                  setFilterWorkType("all");
                  setFilterLocation("all");
                  setFilterRecruiter("all");
                  message.info("Đã đặt lại bộ lọc báo cáo");
                }}
                className="text-[#0062ff] hover:underline text-[11px] font-bold cursor-pointer"
              >
                Đặt lại
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="text-[10.5px] font-bold text-slate-600 block mb-1">
                  Thời gian
                </label>
                <Select
                  value={filterTimeRange}
                  onChange={setFilterTimeRange}
                  className="w-full text-xs"
                  options={[
                    { value: "custom", label: "Tùy chỉnh" },
                    { value: "this_month", label: "Tháng này" },
                    { value: "last_month", label: "Tháng trước" },
                    { value: "q3", label: "Quý 3/2026" },
                    { value: "this_year", label: "Năm 2026" },
                  ]}
                />
              </div>

              <div>
                <div className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-700 font-semibold text-xs flex items-center justify-between shadow-2xs">
                  <span>01/08/2026 - 31/08/2026</span>
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="text-[10.5px] font-bold text-slate-600 block mb-1">
                  Vị trí tuyển dụng
                </label>
                <Select
                  value={filterPosition}
                  onChange={setFilterPosition}
                  className="w-full text-xs"
                  options={[
                    { value: "all", label: "Tất cả vị trí" },
                    { value: "frontend", label: "Frontend Developer" },
                    { value: "backend", label: "Backend Developer" },
                    { value: "uiux", label: "UI/UX Designer" },
                    { value: "pm", label: "Product Manager" },
                  ]}
                />
              </div>

              <div>
                <label className="text-[10.5px] font-bold text-slate-600 block mb-1">
                  Phòng ban
                </label>
                <Select
                  value={filterDepartment}
                  onChange={setFilterDepartment}
                  className="w-full text-xs"
                  options={[
                    { value: "all", label: "Tất cả phòng ban" },
                    { value: "it", label: "IT - Phát triển" },
                    { value: "design", label: "Thiết kế" },
                    { value: "product", label: "Sản phẩm" },
                    { value: "hr", label: "Nhân sự" },
                  ]}
                />
              </div>

              <div>
                <label className="text-[10.5px] font-bold text-slate-600 block mb-1">
                  Nguồn ứng viên
                </label>
                <Select
                  value={filterSource}
                  onChange={setFilterSource}
                  className="w-full text-xs"
                  options={[
                    { value: "all", label: "Tất cả nguồn" },
                    { value: "website", label: "Website công ty" },
                    { value: "linkedin", label: "LinkedIn" },
                    { value: "topcv", label: "TopCV" },
                    { value: "vietnamworks", label: "VietnamWorks" },
                    { value: "referral", label: "Referral (Giới thiệu)" },
                  ]}
                />
              </div>

              <div>
                <label className="text-[10.5px] font-bold text-slate-600 block mb-1">
                  Hình thức làm việc
                </label>
                <Select
                  value={filterWorkType}
                  onChange={setFilterWorkType}
                  className="w-full text-xs"
                  options={[
                    { value: "all", label: "Tất cả" },
                    { value: "fulltime", label: "Toàn thời gian" },
                    { value: "parttime", label: "Bán thời gian" },
                    { value: "remote", label: "Làm việc từ xa" },
                  ]}
                />
              </div>

              <div>
                <label className="text-[10.5px] font-bold text-slate-600 block mb-1">
                  Địa điểm
                </label>
                <Select
                  value={filterLocation}
                  onChange={setFilterLocation}
                  className="w-full text-xs"
                  options={[
                    { value: "all", label: "Tất cả địa điểm" },
                    { value: "hanoi", label: "Hà Nội" },
                    { value: "hcm", label: "TP. Hồ Chí Minh" },
                    { value: "danang", label: "Đà Nẵng" },
                  ]}
                />
              </div>

              <div>
                <label className="text-[10.5px] font-bold text-slate-600 block mb-1">
                  Người đăng tin
                </label>
                <Select
                  value={filterRecruiter}
                  onChange={setFilterRecruiter}
                  className="w-full text-xs"
                  options={[
                    { value: "all", label: "Tất cả" },
                    { value: "mai_phuong", label: "Mai Phương (Owner)" },
                    { value: "duc_anh", label: "Đức Anh (HR)" },
                  ]}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => message.success("Đã áp dụng bộ lọc báo cáo thành công!")}
              className="w-full py-2 bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              Áp dụng bộ lọc
            </button>
          </div>

          {/* ---------------- 2. BÁO CÁO ĐÃ LƯU ------------------- */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
              <span className="font-extrabold text-xs text-slate-900">
                Báo cáo đã lưu
              </span>
              <button
                type="button"
                onClick={() => message.info("Xem toàn bộ báo cáo đã lưu")}
                className="text-[#0062ff] hover:underline text-[11px] font-bold cursor-pointer"
              >
                Xem tất cả
              </button>
            </div>

            <div className="space-y-1.5">
              {SAVED_REPORTS_LIST.map((sr) => (
                <div
                  key={sr.id}
                  onClick={() => message.success(`Đã tải cấu hình: ${sr.name}`)}
                  className="p-2 rounded-xl hover:bg-slate-50 border border-slate-100 flex items-center justify-between text-xs cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0">
                      <BarChart3 className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-slate-800 truncate block text-[11px]">
                        {sr.name}
                      </span>
                      <span className="text-[9.5px] text-slate-400 block">
                        Cập nhật {sr.updatedAt}
                      </span>
                    </div>
                  </div>
                  <span className="text-slate-400 font-bold text-xs px-1">...</span>
                </div>
              ))}
            </div>
          </div>

          {/* ---------------- 3. TẢI BÁO CÁO NHANH (3x2 GRID) ------ */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
            <div className="pb-1.5 border-b border-slate-100">
              <span className="font-extrabold text-xs text-slate-900">
                Tải báo cáo nhanh
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* Item 1 */}
              <div
                onClick={() => message.info("Đang tải Tổng quan báo cáo PDF...")}
                className="p-2.5 bg-blue-50/70 hover:bg-blue-100 rounded-xl text-center space-y-1 transition-all cursor-pointer flex flex-col items-center justify-center border border-blue-100"
              >
                <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-2xs">
                  <Plus className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9.5px] font-bold text-blue-900 block leading-tight">
                  Tổng quan<br />PDF
                </span>
              </div>

              {/* Item 2 */}
              <div
                onClick={() => message.info("Đang xuất Hiệu quả tin Excel...")}
                className="p-2.5 bg-emerald-50/70 hover:bg-emerald-100 rounded-xl text-center space-y-1 transition-all cursor-pointer flex flex-col items-center justify-center border border-emerald-100"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9.5px] font-bold text-emerald-900 block leading-tight">
                  Hiệu quả tin<br />Excel
                </span>
              </div>

              {/* Item 3 */}
              <div
                onClick={() => message.info("Đang xuất Nguồn ứng viên Excel...")}
                className="p-2.5 bg-green-50/70 hover:bg-green-100 rounded-xl text-center space-y-1 transition-all cursor-pointer flex flex-col items-center justify-center border border-green-100"
              >
                <div className="w-6 h-6 rounded-lg bg-green-600 text-white flex items-center justify-center shadow-2xs">
                  <PieChart className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9.5px] font-bold text-green-900 block leading-tight">
                  Nguồn ứng viên<br />Excel
                </span>
              </div>

              {/* Item 4 */}
              <div
                onClick={() => message.info("Đang xuất Pipeline PDF...")}
                className="p-2.5 bg-purple-50/70 hover:bg-purple-100 rounded-xl text-center space-y-1 transition-all cursor-pointer flex flex-col items-center justify-center border border-purple-100"
              >
                <div className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-2xs">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9.5px] font-bold text-purple-900 block leading-tight">
                  Pipeline<br />PDF
                </span>
              </div>

              {/* Item 5 */}
              <div
                onClick={() => message.info("Đang xuất Chi phí tuyển dụng Excel...")}
                className="p-2.5 bg-cyan-50/70 hover:bg-cyan-100 rounded-xl text-center space-y-1 transition-all cursor-pointer flex flex-col items-center justify-center border border-cyan-100"
              >
                <div className="w-6 h-6 rounded-lg bg-cyan-600 text-white flex items-center justify-center shadow-2xs">
                  <DollarSign className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9.5px] font-bold text-cyan-900 block leading-tight">
                  Chi phí tuyển dụng<br />Excel
                </span>
              </div>

              {/* Item 6 */}
              <div
                onClick={() => message.info("Đang xuất Chất lượng PDF...")}
                className="p-2.5 bg-orange-50/70 hover:bg-orange-100 rounded-xl text-center space-y-1 transition-all cursor-pointer flex flex-col items-center justify-center border border-orange-100"
              >
                <div className="w-6 h-6 rounded-lg bg-orange-600 text-white flex items-center justify-center shadow-2xs">
                  <Award className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9.5px] font-bold text-orange-900 block leading-tight">
                  Chất lượng<br />PDF
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* ======================================================== */}
      {/* 5. MODAL: LƯU BÁO CÁO                                    */}
      {/* ======================================================== */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Bookmark className="w-5 h-5 text-[#0062ff]" />
            <span>Lưu cấu hình báo cáo tuyển dụng</span>
          </div>
        }
        open={isSaveReportModalOpen}
        onCancel={() => setIsSaveReportModalOpen(false)}
        footer={null}
        width={480}
        centered
      >
        <div className="space-y-3.5 pt-2 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Tên báo cáo <span className="text-rose-500">*</span>
            </label>
            <Input
              placeholder="VD: Báo cáo hiệu quả Tech Q3/2026..."
              value={reportNameInput}
              onChange={(e) => setReportNameInput(e.target.value)}
              className="rounded-xl text-xs"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-slate-600">
            <span className="font-bold text-slate-800 block">Thông tin bộ lọc kèm theo:</span>
            <p className="m-0 text-[11px]">• Khoảng thời gian: 01/08/2026 - 31/08/2026</p>
            <p className="m-0 text-[11px]">• Vị trí: {filterPosition}</p>
            <p className="m-0 text-[11px]">• Phòng ban: {filterDepartment}</p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsSaveReportModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => {
                if (!reportNameInput.trim()) {
                  message.warning("Vui lòng nhập tên báo cáo!");
                  return;
                }
                setIsSaveReportModalOpen(false);
                setReportNameInput("");
                message.success("Đã lưu cấu hình báo cáo thành công!");
              }}
              className="px-4 py-2 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold shadow-sm cursor-pointer"
            >
              Lưu báo cáo
            </button>
          </div>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* 6. MODAL: XUẤT BÁO CÁO                                   */}
      {/* ======================================================== */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Download className="w-5 h-5 text-[#0062ff]" />
            <span>Xuất báo cáo tuyển dụng</span>
          </div>
        }
        open={isExportModalOpen}
        onCancel={() => setIsExportModalOpen(false)}
        footer={null}
        width={480}
        centered
      >
        <div className="space-y-4 pt-2 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-2">
              Định dạng tệp xuất:
            </label>
            <Radio.Group
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="w-full grid grid-cols-3 gap-2"
            >
              <Radio.Button value="excel" className="text-center font-bold text-xs py-1">
                Excel (.xlsx)
              </Radio.Button>
              <Radio.Button value="pdf" className="text-center font-bold text-xs py-1">
                PDF Document
              </Radio.Button>
              <Radio.Button value="csv" className="text-center font-bold text-xs py-1">
                CSV Data
              </Radio.Button>
            </Radio.Group>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Phạm vi dữ liệu:
            </label>
            <Select
              defaultValue="all"
              className="w-full text-xs"
              options={[
                { value: "all", label: "Toàn bộ báo cáo tuyển dụng (KPI, Funnel, Nguồn, Bảng dữ liệu)" },
                { value: "jobs_only", label: "Chỉ bảng hiệu quả tin tuyển dụng" },
                { value: "sources_only", label: "Chỉ thống kê nguồn và chuyển đổi" },
              ]}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsExportModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => {
                setIsExportModalOpen(false);
                message.success(`Đang tải xuống tệp báo cáo dạng ${exportFormat.toUpperCase()}...`);
              }}
              className="px-4 py-2 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold shadow-sm cursor-pointer"
            >
              Tải xuống
            </button>
          </div>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* 7. MODAL: XEM CHI TIẾT HIỆU QUẢ TIN TUYỂN DỤNG          */}
      {/* ======================================================== */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <BarChart3 className="w-5 h-5 text-[#0062ff]" />
            <span>Phân tích chi tiết: {selectedJobDetail?.title}</span>
          </div>
        }
        open={!!selectedJobDetail}
        onCancel={() => setSelectedJobDetail(null)}
        footer={null}
        width={680}
        centered
      >
        {selectedJobDetail && (
          <div className="space-y-4 pt-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block text-sm">
                  {selectedJobDetail.title}
                </span>
                <span className="text-slate-500 font-medium">
                  Phòng ban: {selectedJobDetail.department}
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">
                Đang hoạt động
              </span>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center">
              <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100">
                <span className="text-[10px] text-slate-500 font-bold block">Lượt xem</span>
                <span className="text-sm font-black text-blue-600 block mt-0.5">
                  {selectedJobDetail.views}
                </span>
              </div>
              <div className="p-2.5 bg-cyan-50/50 rounded-xl border border-cyan-100">
                <span className="text-[10px] text-slate-500 font-bold block">Ứng viên mới</span>
                <span className="text-sm font-black text-cyan-700 block mt-0.5">
                  {selectedJobDetail.newCandidates}
                </span>
              </div>
              <div className="p-2.5 bg-purple-50/50 rounded-xl border border-purple-100">
                <span className="text-[10px] text-slate-500 font-bold block">Phỏng vấn</span>
                <span className="text-sm font-black text-purple-600 block mt-0.5">
                  {selectedJobDetail.interviewCandidates}
                </span>
              </div>
              <div className="p-2.5 bg-orange-50/50 rounded-xl border border-orange-100">
                <span className="text-[10px] text-slate-500 font-bold block">Offers</span>
                <span className="text-sm font-black text-orange-600 block mt-0.5">
                  {selectedJobDetail.offersSent}
                </span>
              </div>
              <div className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <span className="text-[10px] text-slate-500 font-bold block">Chấp nhận</span>
                <span className="text-sm font-black text-emerald-600 block mt-0.5">
                  {selectedJobDetail.accepted}
                </span>
              </div>
            </div>

            {/* Conversion & Cost */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 font-bold block">Tỷ lệ chấp nhận Offer:</span>
                <span className="text-base font-black text-emerald-600 block">
                  {selectedJobDetail.acceptanceRate}%
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 font-bold block">Tổng chi phí quảng bá:</span>
                <span className="text-base font-black text-slate-900 block">
                  {selectedJobDetail.costVnd.toLocaleString()} VNĐ
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedJobDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ======================================================== */}
      {/* 8. MODAL: TẠO BÁO CÁO MỚI                                */}
      {/* ======================================================== */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Plus className="w-5 h-5 text-[#0062ff]" />
            <span>Tạo báo cáo tuyển dụng mới</span>
          </div>
        }
        open={isNewReportModalOpen}
        onCancel={() => setIsNewReportModalOpen(false)}
        footer={null}
        width={480}
        centered
      >
        <div className="space-y-3.5 pt-2 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Loại báo cáo
            </label>
            <Select
              defaultValue="general"
              className="w-full text-xs"
              options={[
                { value: "general", label: "Báo cáo tổng quan hiệu quả tuyển dụng" },
                { value: "funnel", label: "Báo cáo phân tích Pipeline & Funnel" },
                { value: "cost", label: "Báo cáo chi phí trên mỗi ứng viên (Cost per Hire)" },
                { value: "recruiter", label: "Báo cáo năng suất nhân viên tuyển dụng" },
              ]}
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Kỳ báo cáo
            </label>
            <Select
              defaultValue="month"
              className="w-full text-xs"
              options={[
                { value: "month", label: "Tháng hiện tại (Tháng 8/2026)" },
                { value: "quarter", label: "Quý 3/2026" },
                { value: "year", label: "Cả năm 2026" },
              ]}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsNewReportModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => {
                setIsNewReportModalOpen(false);
                message.success("Đã khởi tạo không gian báo cáo mới!");
              }}
              className="px-4 py-2 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold shadow-sm cursor-pointer"
            >
              Khởi tạo
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
