"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dropdown, Modal, message, Tag, Spin } from "antd";
import { adminService } from "@/services/admin.service";
import {
  Users,
  Building2,
  FileText,
  Send,
  Wallet,
  Activity,
  ArrowUpRight,
  ArrowRight,
  Calendar,
  ChevronDown,
  CheckCircle2,
  Clock,
  HardDrive,
  Cpu,
  Server,
  AlertTriangle,
  UserCheck,
  Building,
  Flag,
  CreditCard,
  MoreHorizontal,
  Eye,
  Check,
  X,
  RefreshCw,
} from "lucide-react";

interface MonthlyGrowth {
  month: string;
  applications: number;
  users: number;
}


export default function AdminDashboardPage() {

  const router = useRouter();
  const [selectedDateRange, setSelectedDateRange] = useState("Thời gian thực");
  const [hoveredMonthIndex, setHoveredMonthIndex] = useState<number | null>(2);
  const [hoveredIndustryIndex, setHoveredIndustryIndex] = useState<number | null>(null);
  const [hoveredDonutSegment, setHoveredDonutSegment] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [overview, setOverview] = useState<any>(null);
  const [pendingCompanies, setPendingCompanies] = useState<any[]>([]);
  const [selectedCompanyDetail, setSelectedCompanyDetail] = useState<any>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await adminService.getDashboardOverview();
      const ov = (res?.data as any)?.overview || res?.data;
      if (ov) {
        setOverview(ov);
        if (ov.pending_verifications) {
          setPendingCompanies(
            ov.pending_verifications.map((p: any) => ({
              id: String(p.id),
              companyId: String(p.company_id || p.id),
              name: p.company_name || "Công ty chưa đặt tên",
              taxCode: p.tax_code || "---",
              documentUrl: p.document_url || null,
              submittedAt: p.submitted_at
                ? new Date(p.submitted_at).toLocaleString("vi-VN")
                : "Chờ duyệt",
              status: "pending",
              logoColor: "bg-blue-600 text-white",
              logoLetter: (p.company_name || "C")[0].toUpperCase(),
            }))
          );
        }
      }
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu Admin Dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApproveCompany = async (companyId: string, name: string) => {
    if (!companyId) return;
    try {
      await adminService.verifyCompany(companyId, "approve");
      setPendingCompanies((prev) => prev.filter((c) => c.companyId !== companyId && c.id !== companyId));
      message.success(`Đã phê duyệt xác minh doanh nghiệp: ${name}`);
      setSelectedCompanyDetail(null);
      fetchDashboardData();
    } catch {
      message.error("Lỗi khi phê duyệt xác minh!");
    }
  };

  const handleRejectCompany = async (companyId: string, name: string) => {
    if (!companyId) return;
    try {
      await adminService.verifyCompany(companyId, "reject", "Hồ sơ cần bổ sung thông tin pháp lý");
      setPendingCompanies((prev) => prev.filter((c) => c.companyId !== companyId && c.id !== companyId));
      message.warning(`Đã từ chối xác minh doanh nghiệp: ${name}`);
      setSelectedCompanyDetail(null);
      fetchDashboardData();
    } catch {
      message.error("Lỗi khi từ chối xác minh!");
    }
  };

  const dateRangeMenuItems = [
    {
      key: "today",
      label: "Hôm nay",
      onClick: () => setSelectedDateRange("Hôm nay - 15/09/2026"),
    },
    {
      key: "7days",
      label: "7 ngày qua",
      onClick: () => setSelectedDateRange("08/09/2026 - 15/09/2026"),
    },
    {
      key: "30days",
      label: "30 ngày qua",
      onClick: () => setSelectedDateRange("16/08/2026 - 15/09/2026"),
    },
    {
      key: "mar2024",
      label: "Tháng 3/2024 (Chuẩn báo cáo)",
      onClick: () => setSelectedDateRange("01/03/2024 - 31/03/2024"),
    },
    {
      key: "thisMonth",
      label: "Tháng này",
      onClick: () => setSelectedDateRange("01/09/2026 - 30/09/2026"),
    },
    {
      key: "thisYear",
      label: "Cả năm 2026",
      onClick: () => setSelectedDateRange("01/01/2026 - 31/12/2026"),
    },
  ];

  // Dữ liệu tăng trưởng thực tế từ PostgreSQL
  const monthlyGrowthData: MonthlyGrowth[] = overview?.monthly_growth && overview.monthly_growth.length > 0
    ? overview.monthly_growth.slice(-6).map((m: any) => ({
        month: m.month,
        applications: m.applications || 0,
        users: m.users || 0,
      }))
    : [
        { month: "T1", applications: 0, users: 0 },
        { month: "T2", applications: 0, users: 0 },
        { month: "T3", applications: 0, users: 0 },
        { month: "T4", applications: 0, users: 0 },
        { month: "T5", applications: 0, users: 0 },
        { month: "T6", applications: 0, users: 0 },
      ];

  const industryJobsData = overview?.industry_jobs && overview.industry_jobs.length > 0
    ? overview.industry_jobs.map((ind: any, i: number) => {
        const colors = ["#2563eb", "#06b6d4", "#8b5cf6", "#10b981", "#f59e0b", "#64748b", "#ec4899", "#6366f1"];
        return {
          name: ind.name,
          count: ind.count,
          color: colors[i % colors.length],
        };
      })
    : [];

  const candCount = overview?.summary?.users_by_type?.candidates ?? 0;
  const empCount = overview?.summary?.users_by_type?.employers ?? 0;
  const admCount = overview?.summary?.users_by_type?.admins ?? 0;
  const totalUsersCount = overview?.summary?.total_users || (candCount + empCount + admCount) || 1;

  const candPct = Math.round((candCount / totalUsersCount) * 100);
  const empPct = Math.round((empCount / totalUsersCount) * 100);
  const admPct = Math.max(0, 100 - candPct - empPct);

  // Tọa độ tính toán cho SVG Line Chart (ViewBox: 800 x 260)
  const maxVal = Math.max(
    ...monthlyGrowthData.map((d) => Math.max(d.applications, d.users)),
    10
  );
  const chartWidth = 740;
  const chartHeight = 180;
  const chartLeft = 45;
  const chartTop = 20;

  const pointsApplications = monthlyGrowthData.map((d, i) => {
    const x = chartLeft + (i / (monthlyGrowthData.length - 1)) * chartWidth;
    const y = chartTop + chartHeight - (d.applications / maxVal) * chartHeight;
    return { x, y, val: d.applications, month: d.month };
  });

  const pointsUsers = monthlyGrowthData.map((d, i) => {
    const x = chartLeft + (i / (monthlyGrowthData.length - 1)) * chartWidth;
    const y = chartTop + chartHeight - (d.users / maxVal) * chartHeight;
    return { x, y, val: d.users, month: d.month };
  });

  const pathApplications = pointsApplications.reduce(
    (acc, curr, idx, arr) => {
      if (idx === 0) return `M ${curr.x} ${curr.y}`;
      const prev = arr[idx - 1];
      const cpX1 = prev.x + (curr.x - prev.x) / 2;
      const cpX2 = prev.x + (curr.x - prev.x) / 2;
      return `${acc} C ${cpX1} ${prev.y}, ${cpX2} ${curr.y}, ${curr.x} ${curr.y}`;
    },
    ""
  );

  const pathUsers = pointsUsers.reduce((acc, curr, idx, arr) => {
    if (idx === 0) return `M ${curr.x} ${curr.y}`;
    const prev = arr[idx - 1];
    const cpX1 = prev.x + (curr.x - prev.x) / 2;
    const cpX2 = prev.x + (curr.x - prev.x) / 2;
    return `${acc} C ${cpX1} ${prev.y}, ${cpX2} ${curr.y}, ${curr.x} ${curr.y}`;
  }, "");

  const activeHoverData =
    hoveredMonthIndex !== null && monthlyGrowthData[hoveredMonthIndex]
      ? monthlyGrowthData[hoveredMonthIndex]
      : monthlyGrowthData[0];
  const activeHoverPoint =
    hoveredMonthIndex !== null && pointsApplications[hoveredMonthIndex]
      ? pointsApplications[hoveredMonthIndex]
      : pointsApplications[0];

  return (
    <div className="space-y-4 sm:space-y-5 select-none pb-8">
      {/* ========================================================= */}
      {/* 1. HEADER TRANG: TIÊU ĐỀ & BỘ CHỌN KHOẢNG THỜI GIAN */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-transparent">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0">
            Tổng quan quản trị
          </h1>
          <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
            Tổng quan hoạt động của hệ thống CAREZA trong thời gian thực
          </p>
        </div>

        {/* Date Range Picker Dropdown */}
        <Dropdown menu={{ items: dateRangeMenuItems }} trigger={["click"]} placement="bottomRight">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/90 text-xs font-semibold text-slate-700 hover:text-[#0062ff] hover:border-blue-300 shadow-2xs transition-all cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{selectedDateRange}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>
        </Dropdown>
      </div>

      {/* ========================================================= */}
      {/* 2. HÀNG KPI ĐẦU TRANG (6 CARD NGANG) */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5">
        {/* Card 1: Tổng người dùng */}
        <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/80 shadow-2xs hover:border-blue-200 transition-all flex flex-col justify-between space-y-1.5 min-h-[96px]">
          <div className="flex items-center justify-start">
            <div className="w-7.5 h-7.5 rounded-lg bg-[#eef4ff] text-[#0062ff] flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="text-center w-full px-1">
            <span className="text-[11px] font-bold text-slate-500 block leading-tight truncate">
              Tổng người dùng
            </span>
            <span className="text-lg sm:text-xl font-black text-slate-900 block mt-0.5 tracking-tight">
              {overview?.summary?.total_users ? Number(overview.summary.total_users).toLocaleString("vi-VN") : "0"}
            </span>
          </div>
          <div className="text-[10px] font-bold text-emerald-600 flex items-center justify-center gap-1 leading-tight text-center">
            <span className="shrink-0">+{overview?.summary?.new_users_this_month ?? 0}</span>
            <span className="text-slate-400 font-normal text-[9px] truncate">tháng này</span>
          </div>
        </div>

        {/* Card 2: Doanh nghiệp */}
        <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/80 shadow-2xs hover:border-purple-200 transition-all flex flex-col justify-between space-y-1.5 min-h-[96px]">
          <div className="flex items-center justify-start">
            <div className="w-7.5 h-7.5 rounded-lg bg-[#f5f0ff] text-[#8b5cf6] flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="text-center w-full px-1">
            <span className="text-[11px] font-bold text-slate-500 block leading-tight truncate">
              Doanh nghiệp
            </span>
            <span className="text-lg sm:text-xl font-black text-slate-900 block mt-0.5 tracking-tight">
              {overview?.summary?.total_companies ? Number(overview.summary.total_companies).toLocaleString("vi-VN") : "0"}
            </span>
          </div>
          <div className="text-[10px] font-bold text-emerald-600 flex items-center justify-center gap-1 leading-tight text-center">
            <span className="shrink-0">{overview?.summary?.verified_companies ?? 0} đã duyệt</span>
            <span className="text-slate-400 font-normal text-[9px] truncate">({overview?.summary?.pending_verification_companies ?? 0} chờ)</span>
          </div>
        </div>

        {/* Card 3: Tin tuyển dụng */}
        <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/80 shadow-2xs hover:border-emerald-200 transition-all flex flex-col justify-between space-y-1.5 min-h-[96px]">
          <div className="flex items-center justify-start">
            <div className="w-7.5 h-7.5 rounded-lg bg-[#ecfdf5] text-[#10b981] flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="text-center w-full px-1">
            <span className="text-[11px] font-bold text-slate-500 block leading-tight truncate">
              Tin tuyển dụng
            </span>
            <span className="text-lg sm:text-xl font-black text-slate-900 block mt-0.5 tracking-tight">
              {overview?.summary?.total_jobs ? Number(overview.summary.total_jobs).toLocaleString("vi-VN") : "0"}
            </span>
          </div>
          <div className="text-[10px] font-bold text-emerald-600 flex items-center justify-center gap-1 leading-tight text-center">
            <span className="shrink-0">{overview?.summary?.total_jobs ?? 0}</span>
            <span className="text-slate-400 font-normal text-[9px] truncate">đang trên hệ thống</span>
          </div>
        </div>

        {/* Card 4: Lượt ứng tuyển */}
        <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/80 shadow-2xs hover:border-orange-200 transition-all flex flex-col justify-between space-y-1.5 min-h-[96px]">
          <div className="flex items-center justify-start">
            <div className="w-7.5 h-7.5 rounded-lg bg-[#fff7ed] text-[#f97316] flex items-center justify-center shrink-0">
              <Send className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="text-center w-full px-1">
            <span className="text-[11px] font-bold text-slate-500 block leading-tight truncate">
              Lượt ứng tuyển
            </span>
            <span className="text-lg sm:text-xl font-black text-slate-900 block mt-0.5 tracking-tight">
              {overview?.summary?.total_applications ? Number(overview.summary.total_applications).toLocaleString("vi-VN") : "0"}
            </span>
          </div>
          <div className="text-[10px] font-bold text-emerald-600 flex items-center justify-center gap-1 leading-tight text-center">
            <span className="shrink-0">+{overview?.summary?.total_applications ?? 0}</span>
            <span className="text-slate-400 font-normal text-[9px] truncate">hồ sơ đã gửi</span>
          </div>
        </div>

        {/* Card 5: Giao dịch tháng này */}
        <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/80 shadow-2xs hover:border-rose-200 transition-all flex flex-col justify-between space-y-1.5 min-h-[96px]">
          <div className="flex items-center justify-start">
            <div className="w-7.5 h-7.5 rounded-lg bg-[#fff1f2] text-[#f43f5e] flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="text-center w-full px-1">
            <span className="text-[11px] font-bold text-slate-500 block leading-tight truncate">
              Tổng doanh thu
            </span>
            <span className="text-base sm:text-lg font-black text-slate-900 block mt-0.5 tracking-tight">
              {(overview?.summary?.total_revenue_vnd ?? overview?.summary?.total_revenue)
                ? Number(overview.summary.total_revenue_vnd ?? overview.summary.total_revenue).toLocaleString("vi-VN") + " ₫"
                : "0 ₫"}
            </span>
          </div>
          <div className="text-[10px] font-bold text-emerald-600 flex items-center justify-center gap-1 leading-tight text-center">
            <span className="shrink-0">Đã thanh toán</span>
            <span className="text-slate-400 font-normal text-[9px] truncate">qua cổng thanh toán</span>
          </div>
        </div>

        {/* Card 6: Hoạt động hệ thống */}
        <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/80 shadow-2xs hover:border-sky-200 transition-all flex flex-col justify-between space-y-1.5 min-h-[96px]">
          <div className="flex items-center justify-start">
            <div className="w-7.5 h-7.5 rounded-lg bg-[#eff6ff] text-[#0284c7] flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="text-center w-full px-1">
            <span className="text-[11px] font-bold text-slate-500 block leading-tight truncate">
              Hệ thống
            </span>
            <span className="text-lg sm:text-xl font-black text-slate-900 block mt-0.5 tracking-tight">
              99,99%
            </span>
          </div>
          <div className="text-[10px] font-bold text-emerald-600 flex items-center justify-center gap-1 leading-tight text-center">
            <span className="shrink-0">Hoạt động</span>
            <span className="text-slate-400 font-normal text-[9px] truncate">trực tuyến 24/7</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. KHU BIỂU ĐỒ CHÍNH (LINE CHART LỚN + BAR CHART NGÀNH) */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4">
        {/* Biểu đồ lớn bên trái: Tăng trưởng người dùng & ứng tuyển (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          {/* Header & Legends */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
            <h2 className="text-sm font-black text-slate-900 m-0">
              Tăng trưởng người dùng & ứng tuyển
            </h2>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0062ff]" />
                <span>Người dùng mới</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                <span>Lượt ứng tuyển</span>
              </span>
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="relative w-full h-[250px] mt-2">
            <svg
              viewBox="0 0 800 240"
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0062ff" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#0062ff" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="gradApps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              {[0, 5000, 10000, 15000, 20000].map((val) => {
                const y = chartTop + chartHeight - (val / maxVal) * chartHeight;
                return (
                  <g key={val}>
                    <line
                      x1={chartLeft}
                      y1={y}
                      x2={chartLeft + chartWidth}
                      y2={y}
                      stroke="#f1f5f9"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                    <text
                      x={chartLeft - 10}
                      y={y + 3.5}
                      textAnchor="end"
                      fontSize="9.5"
                      fill="#94a3b8"
                      fontWeight="500"
                    >
                      {val === 0 ? "0" : val.toLocaleString()}
                    </text>
                  </g>
                );
              })}

              {/* Area Under Lines */}
              <path
                d={`${pathUsers} L ${pointsUsers[pointsUsers.length - 1].x} ${
                  chartTop + chartHeight
                } L ${pointsUsers[0].x} ${chartTop + chartHeight} Z`}
                fill="url(#gradUsers)"
              />
              <path
                d={`${pathApplications} L ${pointsApplications[pointsApplications.length - 1].x} ${
                  chartTop + chartHeight
                } L ${pointsApplications[0].x} ${chartTop + chartHeight} Z`}
                fill="url(#gradApps)"
              />

              {/* Lines */}
              <path
                d={pathApplications}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d={pathUsers}
                fill="none"
                stroke="#0062ff"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Vertical guideline for active hover */}
              {activeHoverPoint && (
                <line
                  x1={activeHoverPoint.x}
                  y1={chartTop}
                  x2={activeHoverPoint.x}
                  y2={chartTop + chartHeight}
                  stroke="#cbd5e1"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
              )}

              {/* Full height interactive vertical columns across each month */}
              {monthlyGrowthData.map((d, idx) => {
                const colW = chartWidth / (monthlyGrowthData.length - 1);
                const x = chartLeft + idx * colW - colW / 2;
                return (
                  <rect
                    key={`hit-${idx}`}
                    x={Math.max(0, x)}
                    y={0}
                    width={colW}
                    height={chartTop + chartHeight + 30}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredMonthIndex(idx)}
                  />
                );
              })}

              {/* Interactive Dots & Month Labels */}
              {monthlyGrowthData.map((d, idx) => {
                const ptApp = pointsApplications[idx];
                const ptUsr = pointsUsers[idx];
                const isHovered = hoveredMonthIndex === idx;

                return (
                  <g
                    key={d.month}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredMonthIndex(idx)}
                  >
                    {/* App dot */}
                    <circle
                      cx={ptApp.x}
                      cy={ptApp.y}
                      r={isHovered ? 5 : 3}
                      fill="#10b981"
                      stroke="#ffffff"
                      strokeWidth={isHovered ? 2.5 : 1.5}
                      className="transition-all"
                    />
                    {/* User dot */}
                    <circle
                      cx={ptUsr.x}
                      cy={ptUsr.y}
                      r={isHovered ? 5 : 3}
                      fill="#0062ff"
                      stroke="#ffffff"
                      strokeWidth={isHovered ? 2.5 : 1.5}
                      className="transition-all"
                    />
                    {/* Month text label */}
                    <text
                      x={ptApp.x}
                      y={chartTop + chartHeight + 18}
                      textAnchor="middle"
                      fontSize="9.5"
                      fill={isHovered ? "#0062ff" : "#64748b"}
                      fontWeight={isHovered ? "700" : "500"}
                    >
                      {d.month}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Floating Tooltip Box (Nhẹ, gọn, không che biểu đồ) */}
            {activeHoverData && activeHoverPoint && (
              <div
                style={{
                  left: `clamp(12%, ${(activeHoverPoint.x / 800) * 100}%, 88%)`,
                  top: "12%",
                }}
                className="absolute -translate-x-1/2 bg-white/95 backdrop-blur-xs rounded-xl p-2.5 border border-slate-200/90 shadow-md text-xs pointer-events-none transition-all duration-150 z-20 min-w-[145px]"
              >
                <div className="font-bold text-slate-800 text-[11px] pb-1 border-b border-slate-100 flex items-center justify-between">
                  <span>{activeHoverData.month}</span>
                  <span className="text-[10px] text-slate-400 font-medium">Thống kê</span>
                </div>
                <div className="space-y-1 pt-1.5 text-[10.5px]">
                  <div className="flex items-center justify-between gap-2 text-slate-700">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#0062ff] shrink-0" />
                      <span>Người dùng:</span>
                    </span>
                    <strong className="font-extrabold text-slate-900">
                      {activeHoverData.users.toLocaleString()}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-slate-700">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#10b981] shrink-0" />
                      <span>Lượt ứng tuyển:</span>
                    </span>
                    <strong className="font-extrabold text-slate-900">
                      {activeHoverData.applications.toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Biểu đồ bên phải: Tin tuyển dụng theo ngành (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-sm font-black text-slate-900 m-0">
              Tin tuyển dụng theo ngành
            </h2>
            <Link
              href="/admin/jobs"
              className="text-xs font-bold text-[#0062ff] hover:underline flex items-center gap-0.5"
            >
              <span>Xem chi tiết</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Bar Chart Container */}
          <div className="h-[250px] flex items-end justify-between gap-1.5 pt-8 pb-2 px-1">
            {industryJobsData.length > 0 ? (
              industryJobsData.map((ind: any, i: number) => {
                const maxInd = Math.max(...industryJobsData.map((x: any) => x.count), 10);
                const heightPercent = Math.max(8, Math.round((ind.count / maxInd) * 100));
                const isHovered = hoveredIndustryIndex === i;

                return (
                  <div
                    key={ind.name}
                    className="flex-1 flex flex-col items-center justify-end h-full relative cursor-pointer"
                    onMouseEnter={() => setHoveredIndustryIndex(i)}
                    onMouseLeave={() => setHoveredIndustryIndex(null)}
                  >
                    {/* Tooltip nhẹ, gọn, hiển thị đúng chỉ số khi hover */}
                    {isHovered && (
                      <div className="absolute -top-11 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-lg px-2 py-1 shadow-md text-center pointer-events-none whitespace-nowrap z-30 transition-all min-w-[70px]">
                        <span className="text-[10px] font-bold text-slate-700 block leading-tight">
                          {ind.name}
                        </span>
                        <span className="text-[11px] font-black text-[#0062ff] block leading-tight">
                          {ind.count.toLocaleString()}{" "}
                          <span className="font-normal text-[9px] text-slate-400">tin</span>
                        </span>
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-b border-r border-slate-200/90 rotate-45" />
                      </div>
                    )}

                    {/* Số liệu trên đầu cột */}
                    <span
                      className={`text-[9.5px] font-bold block mb-1 text-center transition-all ${
                        isHovered ? "text-[#0062ff] scale-105" : "text-slate-600"
                      }`}
                    >
                      {ind.count.toLocaleString()}
                    </span>

                    {/* Thanh Bar bo tròn */}
                    <div className="w-full bg-slate-100 rounded-t-md h-full flex items-end max-w-[32px]">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-md transition-all duration-200 shadow-2xs ${
                          isHovered
                            ? "bg-[#0062ff] brightness-110 ring-2 ring-blue-300"
                            : "bg-gradient-to-t from-[#0062ff] to-[#3b82f6]"
                        }`}
                      />
                    </div>

                    {/* Nhãn ngành dưới cột */}
                    <span
                      className={`text-[9px] font-semibold block mt-2 text-center truncate max-w-[44px] leading-tight transition-colors ${
                        isHovered ? "text-[#0062ff] font-bold" : "text-slate-500"
                      }`}
                    >
                      {ind.name}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                Chưa có dữ liệu tin tuyển dụng theo ngành
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. HÀNG THÔNG TIN THỨ HAI (3 CỘT CÂN ĐỐI) */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
        {/* Cột 1: Phân bổ người dùng (Donut Chart) */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-sm font-black text-slate-900 m-0">Phân bổ người dùng</h2>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              Tổng: {totalUsersCount.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 my-auto py-3">
            {/* SVG Donut Chart */}
            <div className="relative w-36 h-36 shrink-0">
              {hoveredDonutSegment && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-lg px-2 py-1 shadow-md text-center pointer-events-none whitespace-nowrap z-20 transition-all">
                  <span className="text-[10px] font-bold text-slate-600">
                    {hoveredDonutSegment === "candidate" && "Ứng viên: "}
                    {hoveredDonutSegment === "business" && "Doanh nghiệp: "}
                    {hoveredDonutSegment === "admin" && "Quản trị viên: "}
                  </span>
                  <span className="text-[10.5px] font-black text-[#0062ff]">
                    {hoveredDonutSegment === "candidate" && `${candCount.toLocaleString()} (${candPct}%)`}
                    {hoveredDonutSegment === "business" && `${empCount.toLocaleString()} (${empPct}%)`}
                    {hoveredDonutSegment === "admin" && `${admCount.toLocaleString()} (${admPct}%)`}
                  </span>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-b border-r border-slate-200/90 rotate-45" />
                </div>
              )}

              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {/* Ứng viên */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#0062ff"
                  strokeWidth={hoveredDonutSegment === "candidate" ? "14" : "12"}
                  strokeDasharray={`${Math.round((candPct / 100) * 251.2)} 251.2`}
                  strokeDashoffset="0"
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredDonutSegment("candidate")}
                  onMouseLeave={() => setHoveredDonutSegment(null)}
                />
                {/* Doanh nghiệp */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth={hoveredDonutSegment === "business" ? "14" : "12"}
                  strokeDasharray={`${Math.round((empPct / 100) * 251.2)} 251.2`}
                  strokeDashoffset={`-${Math.round((candPct / 100) * 251.2)}`}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredDonutSegment("business")}
                  onMouseLeave={() => setHoveredDonutSegment(null)}
                />
                {/* Quản trị viên */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#8b5cf6"
                  strokeWidth={hoveredDonutSegment === "admin" ? "14" : "12"}
                  strokeDasharray={`${Math.round((admPct / 100) * 251.2)} 251.2`}
                  strokeDashoffset={`-${Math.round(((candPct + empPct) / 100) * 251.2)}`}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredDonutSegment("admin")}
                  onMouseLeave={() => setHoveredDonutSegment(null)}
                />
              </svg>

              {/* Tâm Donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
                {hoveredDonutSegment === "candidate" ? (
                  <>
                    <span className="text-sm sm:text-base font-black text-[#0062ff] leading-none">
                      {candCount.toLocaleString()}
                    </span>
                    <span className="text-[9px] font-bold text-slate-500 mt-0.5">
                      Ứng viên ({candPct}%)
                    </span>
                  </>
                ) : hoveredDonutSegment === "business" ? (
                  <>
                    <span className="text-sm sm:text-base font-black text-[#10b981] leading-none">
                      {empCount.toLocaleString()}
                    </span>
                    <span className="text-[9px] font-bold text-slate-500 mt-0.5">
                      DN ({empPct}%)
                    </span>
                  </>
                ) : hoveredDonutSegment === "admin" ? (
                  <>
                    <span className="text-sm sm:text-base font-black text-[#8b5cf6] leading-none">
                      {admCount.toLocaleString()}
                    </span>
                    <span className="text-[9px] font-bold text-slate-500 mt-0.5">
                      Quản trị ({admPct}%)
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-base font-black text-slate-900 leading-none">
                      {totalUsersCount.toLocaleString()}
                    </span>
                    <span className="text-[9.5px] font-semibold text-slate-400 mt-0.5">
                      người dùng
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Legend & Số lượng */}
            <div className="space-y-1.5 flex-1 text-xs">
              <div
                className={`flex items-center justify-between p-1.5 rounded-lg transition-colors cursor-pointer ${
                  hoveredDonutSegment === "candidate" ? "bg-blue-50/80" : "hover:bg-slate-50"
                }`}
                onMouseEnter={() => setHoveredDonutSegment("candidate")}
                onMouseLeave={() => setHoveredDonutSegment(null)}
              >
                <span className="inline-flex items-center gap-1.5 text-slate-600 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0062ff]" />
                  <span>Ứng viên</span>
                </span>
                <span className="font-extrabold text-slate-900 text-[11px]">
                  {candCount.toLocaleString()} <span className="font-medium text-slate-400">({candPct}%)</span>
                </span>
              </div>

              <div
                className={`flex items-center justify-between p-1.5 rounded-lg transition-colors cursor-pointer ${
                  hoveredDonutSegment === "business" ? "bg-emerald-50/80" : "hover:bg-slate-50"
                }`}
                onMouseEnter={() => setHoveredDonutSegment("business")}
                onMouseLeave={() => setHoveredDonutSegment(null)}
              >
                <span className="inline-flex items-center gap-1.5 text-slate-600 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                  <span>Doanh nghiệp</span>
                </span>
                <span className="font-extrabold text-slate-900 text-[11px]">
                  {empCount.toLocaleString()} <span className="font-medium text-slate-400">({empPct}%)</span>
                </span>
              </div>

              <div
                className={`flex items-center justify-between p-1.5 rounded-lg transition-colors cursor-pointer ${
                  hoveredDonutSegment === "admin" ? "bg-purple-50/80" : "hover:bg-slate-50"
                }`}
                onMouseEnter={() => setHoveredDonutSegment("admin")}
                onMouseLeave={() => setHoveredDonutSegment(null)}
              >
                <span className="inline-flex items-center gap-1.5 text-slate-600 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6]" />
                  <span>Quản trị viên</span>
                </span>
                <span className="font-extrabold text-slate-900 text-[11px]">
                  {admCount.toLocaleString()} <span className="font-medium text-slate-400">({admPct}%)</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cột 2: Tình trạng hệ thống */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-sm font-black text-slate-900 m-0">Tình trạng hệ thống</h2>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Hoạt động ổn định</span>
            </span>
          </div>

          <div className="space-y-2.5 py-1 text-xs">
            {/* Uptime */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-slate-600 font-medium">
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                <span>Thời gian hoạt động (Uptime)</span>
              </span>
              <span className="font-extrabold text-slate-900">99,98%</span>
            </div>

            {/* API Services */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-slate-600 font-medium">
                <Server className="w-3.5 h-3.5 text-blue-500" />
                <span>API Services</span>
              </span>
              <span className="font-bold text-emerald-600 text-[11px] bg-emerald-50 px-2 py-0.5 rounded-md">
                Hoạt động tốt
              </span>
            </div>

            {/* AI Service */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-slate-600 font-medium">
                <Cpu className="w-3.5 h-3.5 text-purple-500" />
                <span>AI Service</span>
              </span>
              <span className="font-bold text-emerald-600 text-[11px] bg-emerald-50 px-2 py-0.5 rounded-md">
                Hoạt động tốt
              </span>
            </div>

            {/* Storage Progress */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-slate-600 font-medium">
                <span className="inline-flex items-center gap-2">
                  <HardDrive className="w-3.5 h-3.5 text-amber-500" />
                  <span>Dung lượng lưu trữ</span>
                </span>
                <span className="font-bold text-slate-800 text-[11px]">
                  68% (342 GB / 500 GB)
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="w-[68%] h-full bg-[#0062ff] rounded-full" />
              </div>
            </div>

            {/* Hàng đợi kiểm duyệt */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <span className="inline-flex items-center gap-2 text-slate-600 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                <span>Hàng đợi kiểm duyệt</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="font-black text-rose-600 text-xs">
                  {overview?.summary?.pending_jobs ?? 0} tin
                </span>
                <Link
                  href="/admin/jobs"
                  className="text-xs font-bold text-[#0062ff] hover:underline"
                >
                  Xem ngay →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Cột 3: Hoạt động gần đây (Timeline) */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-sm font-black text-slate-900 m-0">Hoạt động gần đây</h2>
            <Link
              href="/admin/audit-log"
              className="text-xs font-bold text-[#0062ff] hover:underline flex items-center gap-0.5"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5 py-1 text-xs">
            {overview?.recent_activities && overview.recent_activities.length > 0 ? (
              overview.recent_activities.slice(0, 5).map((act: any) => {
                const timeStr = act.created_at
                  ? new Date(act.created_at).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "--:--";
                return (
                  <div key={act.id} className="flex items-start gap-2.5">
                    <span className="text-[10px] font-bold text-slate-400 shrink-0 w-9 pt-0.5">
                      {timeStr}
                    </span>
                    <div className="w-5 h-5 rounded-full bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0 mt-0.5">
                      <Users className="w-3 h-3" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-slate-900 block truncate leading-tight">
                        {act.action} ({act.entity_type || "system"})
                      </span>
                      <span className="text-[10.5px] text-slate-400 block truncate">
                        {act.actor_name || act.actor_email || "Hệ thống"}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-6 text-center text-slate-400 text-xs">
                Chưa có nhật ký hoạt động gần đây
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. HÀNG QUẢN TRỊ CẦN XỬ LÝ (4 CARD BÊN DƯỚI) */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Doanh nghiệp chờ xác minh */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 gap-2">
            <h2 className="text-sm font-black text-slate-900 m-0 whitespace-nowrap">
              Doanh nghiệp chờ xác minh
            </h2>
            <Link
              href="/admin/companies"
              className="text-xs font-bold text-[#0062ff] hover:underline flex items-center gap-0.5 whitespace-nowrap shrink-0"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 py-1 flex-1">
            {pendingCompanies.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Không có doanh nghiệp chờ xác minh nào
              </div>
            ) : (
              pendingCompanies.map((comp) => (
                <div
                  key={comp.id}
                  className="py-2.5 flex items-center justify-between gap-2 hover:bg-slate-50/50 rounded-lg px-1 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg ${comp.logoColor} font-black text-xs flex items-center justify-center shrink-0 shadow-2xs`}
                    >
                      {comp.logoLetter}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-900 block truncate leading-tight">
                        {comp.name}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        MST: {comp.taxCode}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right hidden sm:block">
                      <span className="text-[10px] text-slate-400 block leading-tight">
                        {comp.submittedAt.split(" ")[0]}
                      </span>
                      <span className="text-[9.5px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded-md">
                        Chờ xác minh
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedCompanyDetail(comp)}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0062ff] font-bold text-[11px] border border-blue-200 transition-all cursor-pointer"
                    >
                      Xem
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Card 2: Báo cáo cần xử lý */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 gap-2">
            <h2 className="text-sm font-black text-slate-900 m-0 whitespace-nowrap">Báo cáo cần xử lý</h2>
            <Link
              href="/admin/reports"
              className="text-xs font-bold text-[#0062ff] hover:underline flex items-center gap-0.5 whitespace-nowrap shrink-0"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2 py-1 text-xs">
            <div className="flex items-center justify-between py-1">
              <span className="inline-flex items-center gap-1.5 text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>Tin tuyển dụng bị báo cáo</span>
              </span>
              <span className="font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full text-[11px] min-w-[24px] text-center">
                {overview?.reports_summary?.by_target_type?.job ?? 0}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="inline-flex items-center gap-1.5 text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Doanh nghiệp bị báo cáo</span>
              </span>
              <span className="font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full text-[11px] min-w-[24px] text-center">
                {overview?.reports_summary?.by_target_type?.company ?? 0}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="inline-flex items-center gap-1.5 text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                <span>Đánh giá công ty bị báo cáo</span>
              </span>
              <span className="font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full text-[11px] min-w-[24px] text-center">
                {overview?.reports_summary?.by_target_type?.review ?? 0}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="inline-flex items-center gap-1.5 text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <span>Tài khoản bị báo cáo</span>
              </span>
              <span className="font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full text-[11px] min-w-[24px] text-center">
                {overview?.reports_summary?.by_target_type?.user ?? 0}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="inline-flex items-center gap-1.5 text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span>Khác</span>
              </span>
              <span className="font-extrabold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full text-[11px] min-w-[24px] text-center">
                {overview?.reports_summary?.by_target_type?.other ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Khiếu nại & Kiểm duyệt */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 gap-2">
            <h2 className="text-sm font-black text-slate-900 m-0 whitespace-nowrap">Khiếu nại &amp; Kiểm duyệt</h2>
            <Link
              href="/admin/khieu-nai"
              className="text-xs font-bold text-[#0062ff] hover:underline flex items-center gap-0.5 whitespace-nowrap shrink-0"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2 py-1 text-xs">
            <div className="flex items-center justify-between py-1">
              <span className="truncate text-slate-700">Chờ xử lý (Pending)</span>
              <span className="font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full text-[11px]">
                {overview?.reports_summary?.pending ?? 0}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="truncate text-slate-700">Đã xử lý (Resolved)</span>
              <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
                {overview?.reports_summary?.resolved ?? 0}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="truncate text-slate-700">Đã bác bỏ (Dismissed)</span>
              <span className="font-extrabold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full text-[11px]">
                {overview?.reports_summary?.dismissed ?? 0}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="truncate text-slate-700">Hồ sơ kiểm duyệt (Moderation)</span>
              <span className="font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full text-[11px]">
                {overview?.reports_summary?.moderation_cases_total ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Doanh thu & thanh toán */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 gap-2">
            <h2 className="text-sm font-black text-slate-900 m-0 whitespace-nowrap">Doanh thu &amp; thanh toán</h2>
            <Link
              href="/admin/giao-dich"
              className="text-xs font-bold text-[#0062ff] hover:underline flex items-center gap-0.5 whitespace-nowrap shrink-0"
            >
              <span>Xem chi tiết</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {(() => {
            const paidRev = overview?.summary?.total_revenue_vnd ?? 0;
            const pendingRev = overview?.summary?.pending_revenue_vnd ?? 0;
            const totalRev = paidRev + pendingRev;
            const paidPct = totalRev > 0 ? Math.round((paidRev / totalRev) * 100) : 100;
            const pendingPct = Math.max(0, 100 - paidPct);
            return (
              <div className="space-y-3 py-1">
                <div>
                  <span className="text-[11px] font-medium text-slate-500 block">
                    Tổng doanh thu đã thanh toán
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                      {paidRev.toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    {overview?.summary?.paid_orders_count ?? 0} đơn thành công
                  </span>
                </div>

                {/* Split bars */}
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <span className="inline-flex items-center gap-1.5 text-slate-600 text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>Đã thanh toán</span>
                      </span>
                      <span className="font-extrabold text-slate-900 block text-xs">
                        {paidRev.toLocaleString("vi-VN")} đ
                      </span>
                      <span className="text-[10px] text-slate-400 block">{paidPct}%</span>
                    </div>

                    <div className="space-y-0.5 text-right">
                      <span className="inline-flex items-center gap-1.5 text-slate-600 text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-[#0062ff]" />
                        <span>Chờ thanh toán</span>
                      </span>
                      <span className="font-extrabold text-slate-900 block text-xs">
                        {pendingRev.toLocaleString("vi-VN")} đ
                      </span>
                      <span className="text-[10px] text-slate-400 block">{pendingPct}%</span>
                    </div>
                  </div>

                  {/* Progress Bar tỷ lệ */}
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden flex">
                    <div style={{ width: `${paidPct}%` }} className="bg-emerald-500 h-full" />
                    <div style={{ width: `${pendingPct}%` }} className="bg-[#0062ff] h-full" />
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL CHI TIẾT DOANH NGHIỆP CHỜ XÁC MINH */}
      {/* ========================================================= */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#0062ff]" />
            <span>Chi tiết hồ sơ xác minh doanh nghiệp</span>
          </div>
        }
        open={Boolean(selectedCompanyDetail)}
        onCancel={() => setSelectedCompanyDetail(null)}
        footer={[
          <button
            key="reject"
            type="button"
            onClick={() =>
              handleRejectCompany(
                selectedCompanyDetail?.companyId || selectedCompanyDetail?.id,
                selectedCompanyDetail?.name
              )
            }
            className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all cursor-pointer mr-2"
          >
            Từ chối / Yêu cầu bổ sung
          </button>,
          <button
            key="approve"
            type="button"
            onClick={() =>
              handleApproveCompany(
                selectedCompanyDetail?.companyId || selectedCompanyDetail?.id,
                selectedCompanyDetail?.name
              )
            }
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm border-none"
          >
            Phê duyệt xác minh
          </button>,
        ]}
      >
        {selectedCompanyDetail && (
          <div className="space-y-3 py-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Tên doanh nghiệp:</span>
                <span className="font-bold text-slate-900">{selectedCompanyDetail.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mã số thuế:</span>
                <span className="font-bold text-slate-800">{selectedCompanyDetail.taxCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Thời gian gửi hồ sơ:</span>
                <span className="font-medium text-slate-700">{selectedCompanyDetail.submittedAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Trạng thái:</span>
                <Tag color="gold" className="font-semibold m-0">Chờ xác minh</Tag>
              </div>
            </div>

            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-slate-600 space-y-1">
              <span className="font-bold text-slate-800 block">Tài liệu đính kèm:</span>
              <p className="text-[11px] m-0">
                • Giấy chứng nhận đăng ký kinh doanh (GPKD_{selectedCompanyDetail.taxCode}.pdf)
              </p>
              <p className="text-[11px] m-0">
                • Căn cước công dân người đại diện pháp luật (CCCD_verified.pdf)
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
