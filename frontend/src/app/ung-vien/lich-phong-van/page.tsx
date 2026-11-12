"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { message, Modal, Dropdown, Tooltip, Spin } from "antd";
import type { MenuProps } from "antd";
import { useAuthStore } from "@/store/auth-store";
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  SlidersHorizontal,
  Video,
  MapPin,
  MoreVertical,
  ArrowRight,
  Headphones,
  Bell,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Briefcase,
  Building2,
  FileText,
  User,
  Heart,
  Settings,
  LayoutDashboard,
  Check,
  Info,
  CalendarCheck,
} from "lucide-react";

import { candidateService } from "@/services/candidate.service";

// =========================================================================
// TYPES
// =========================================================================
export type InterviewStatus = "UPCOMING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
export type InterviewType = "ONLINE" | "OFFLINE";

export interface InterviewItem {
  id: string;
  jobTitle: string;
  companyName: string;
  companyLogo: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: string;
  timeRange: string;
  type: InterviewType;
  platformOrLocation: string;
  meetingUrl?: string;
  interviewer?: string;
  note?: string;
  status: InterviewStatus;
}

export default function CandidateInterviewsPage() {
  const { user } = useAuthStore();
  const [interviews, setInterviews] = useState<InterviewItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Status Filter Pill: 'all' | 'UPCOMING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  const [statusTab, setStatusTab] = useState<"all" | "UPCOMING" | "CONFIRMED" | "COMPLETED" | "CANCELLED">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const [selectedDay, setSelectedDay] = useState<string>(todayStr);
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState<{ year: number; month: number }>({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  });

  // Modal Chi tiết
  const [selectedInterview, setSelectedInterview] = useState<InterviewItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  // Modal Từ chối / Hủy lịch
  const [cancelModalOpen, setCancelModalOpen] = useState<boolean>(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>("");
  const [submittingCancel, setSubmittingCancel] = useState<boolean>(false);

  // Tải danh sách phỏng vấn thực tế từ backend
  const fetchInterviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await candidateService.getInterviews();
      const rawList = res?.data?.interviews || [];
      const mapped: InterviewItem[] = rawList.map((item: any) => ({
        id: String(item.id),
        jobTitle: item.job_title || "Vị trí tuyển dụng",
        companyName: item.company_name || "Doanh nghiệp",
        companyLogo: item.company_logo || "/images/congty.png",
        date: item.date || (item.scheduled_at ? item.scheduled_at.split("T")[0] : ""),
        dayOfWeek: item.day_of_week || "THỨ 2",
        timeRange: item.time_range || "09:00 - 10:00",
        type: (item.type as InterviewType) || "ONLINE",
        platformOrLocation: item.platform_or_location || (item.meeting_url ? "Trực tuyến" : "Văn phòng công ty"),
        meetingUrl: item.meeting_url || undefined,
        interviewer: item.interviewer || "Hội đồng tuyển dụng",
        note: item.note || undefined,
        status: (item.status as InterviewStatus) || "UPCOMING",
      }));
      setInterviews(mapped);
      if (mapped.length > 0) {
        const upcomingFirst = mapped.find((i) => i.status === "UPCOMING" || i.status === "CONFIRMED") || mapped[0];
        if (upcomingFirst.date) {
          setSelectedDay(upcomingFirst.date);
          const [y, m] = upcomingFirst.date.split("-").map(Number);
          if (y && m) setCurrentCalendarMonth({ year: y, month: m });
        }
      }
    } catch {
      setError("Không thể tải lịch phỏng vấn từ hệ thống. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  // Thống kê 4 số liệu
  const stats = useMemo(() => {
    const total = interviews.length;
    const upcoming = interviews.filter((i) => i.status === "UPCOMING" || i.status === "CONFIRMED").length;
    const completed = interviews.filter((i) => i.status === "COMPLETED").length;
    const cancelled = interviews.filter((i) => i.status === "CANCELLED").length;
    return { total, upcoming, completed, cancelled };
  }, [interviews]);

  // Lọc danh sách lịch phỏng vấn theo tab & search
  const filteredInterviews = useMemo(() => {
    return interviews.filter((item) => {
      const matchStatus = statusTab === "all" || item.status === statusTab;
      const matchSearch =
        item.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.platformOrLocation.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [interviews, statusTab, searchQuery]);

  // Danh sách lịch trong ngày được chọn
  const dayInterviews = useMemo(() => {
    return interviews.filter((item) => item.date === selectedDay);
  }, [interviews, selectedDay]);

  // Lịch phỏng vấn sắp tới (cho mục Nhắc nhở)
  const upcomingReminders = useMemo(() => {
    return interviews.filter((i) => i.status === "UPCOMING" || i.status === "CONFIRMED").slice(0, 2);
  }, [interviews]);

  // Xử lý xác nhận tham gia phỏng vấn
  const handleConfirmInterview = async (id: string) => {
    try {
      await candidateService.confirmInterview(id);
      setInterviews((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: "CONFIRMED" } : item))
      );
      if (selectedInterview && selectedInterview.id === id) {
        setSelectedInterview((prev) => (prev ? { ...prev, status: "CONFIRMED" } : null));
      }
      message.success("Đã xác nhận tham gia buổi phỏng vấn!");
    } catch {
      message.error("Xác nhận tham gia thất bại. Vui lòng thử lại.");
    }
  };

  // Mở modal từ chối / hủy lịch
  const openCancelModal = (id: string) => {
    setCancellingId(id);
    setCancelReason("");
    setCancelModalOpen(true);
  };

  // Thực hiện từ chối / hủy lịch với backend
  const executeCancelInterview = async () => {
    if (!cancellingId) return;
    setSubmittingCancel(true);
    try {
      await candidateService.cancelInterview(cancellingId, cancelReason.trim() || undefined);
      setInterviews((prev) =>
        prev.map((item) => (item.id === cancellingId ? { ...item, status: "CANCELLED" } : item))
      );
      if (selectedInterview && selectedInterview.id === cancellingId) {
        setSelectedInterview((prev) => (prev ? { ...prev, status: "CANCELLED" } : null));
      }
      message.warning("Đã từ chối / hủy lịch phỏng vấn.");
      setCancelModalOpen(false);
      setCancellingId(null);
      setIsDetailModalOpen(false);
    } catch {
      message.error("Hủy lịch phỏng vấn thất bại. Vui lòng thử lại.");
    } finally {
      setSubmittingCancel(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentCalendarMonth((prev) => {
      if (prev.month === 1) return { year: prev.year - 1, month: 12 };
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const handleNextMonth = () => {
    setCurrentCalendarMonth((prev) => {
      if (prev.month === 12) return { year: prev.year + 1, month: 1 };
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  // Tạo lưới ngày linh hoạt theo tháng và năm được chọn
  const daysInMonth = useMemo(() => {
    const { year, month } = currentCalendarMonth;
    const days = [];
    const firstDayIndex = new Date(year, month - 1, 1).getDay(); // 0 is Sunday
    // Thứ 2 là ngày bắt đầu tuần (offset 0..6)
    const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    // Các ngày của tháng trước
    const prevMonthLastDate = new Date(year, month - 1, 0).getDate();
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = prevMonthLastDate - i;
      const dateStr = `${prevYear}-${String(prevMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({ day: d, isCurrentMonth: false, dateStr, hasInterview: false });
    }

    // Các ngày trong tháng hiện tại
    const currentMonthLastDate = new Date(year, month, 0).getDate();
    for (let i = 1; i <= currentMonthLastDate; i++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      const hasInterview = interviews.some((item) => item.date === dateStr);
      days.push({
        day: i,
        isCurrentMonth: true,
        dateStr,
        hasInterview,
      });
    }

    // Các ngày của tháng sau để đủ ô (bội số của 7)
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const dateStr = `${nextYear}-${String(nextMonth).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      days.push({ day: i, isCurrentMonth: false, dateStr, hasInterview: false });
    }

    return days;
  }, [currentCalendarMonth, interviews]);

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 pb-12 pt-0 bg-[#F6F9FF] min-h-screen">
      {/* ======================================================== */}
      {/* 1. BREADCRUMB NỀN TRANG NGOÀI BANNER                      */}
      {/* ======================================================== */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-3">
        <Link href="/" className="hover:text-[#0062ff] transition-colors">
          Trang chủ
        </Link>
        <span className="text-slate-300">/</span>
        <Link href="/ung-vien/ho-so" className="hover:text-[#0062ff] transition-colors">
          Ứng viên
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-800 font-semibold">Lịch phỏng vấn</span>
      </div>

      {/* ======================================================== */}
      {/* 2. HERO BANNER SỬ DỤNG /images/lich.png (GỌN 90-105px)    */}
      {/* ======================================================== */}
      <div
        className="relative w-full rounded-2xl overflow-hidden h-[96px] md:h-[98px] border border-blue-200/80 shadow-2xs px-4 sm:px-6 md:px-7 flex items-center justify-between mb-3.5"
        style={{
          backgroundImage: "url('/images/lich.png')",
          backgroundSize: "cover",
          backgroundPosition: "center right",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Lớp Overlay gradient bên trái để chữ luôn tương phản rõ nét */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d47a1]/90 via-[#0d47a1]/75 to-transparent sm:w-[60%] pointer-events-none" />

        {/* Nội dung bên trái Hero - nhích lên nhẹ nhàng */}
        <div className="relative z-10 max-w-xl text-white -top-1">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-xs text-white flex items-center justify-center shrink-0">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <h1 className="text-[23px] sm:text-[24px] font-bold text-white tracking-tight m-0 leading-tight">
              Lịch phỏng vấn
            </h1>
          </div>
        </div>
      </div>

      {/* Container nội dung bên dưới banner */}
      <div className="space-y-4">
        {/* Thông báo lỗi khi API thất bại */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <XCircle className="w-5 h-5 shrink-0 text-rose-500" />
            <span className="text-xs sm:text-sm font-semibold">{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchInterviews}
            className="px-4 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors cursor-pointer w-fit"
          >
            Tải lại
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center bg-white rounded-2xl border border-slate-100 shadow-2xs space-y-3">
          <Spin size="large" />
          <p className="text-xs sm:text-sm text-slate-500 font-medium m-0">Đang tải lịch phỏng vấn...</p>
        </div>
      ) : (
        /* ======================================================== */
        /* 2. MAIN LAYOUT 2 CỘT (MAIN CONTENT & RIGHT SIDEBAR)      */
        /* ======================================================== */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* ==================== MAIN CONTENT (lg:col-span-8 xl:col-span-9) ==================== */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-4.5">
            {/* Navigation Trạng Thái (Pill/Tabs) */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              {[
                { key: "all", label: "Tất cả" },
                { key: "UPCOMING", label: "Chờ xác nhận" },
                { key: "CONFIRMED", label: "Đã xác nhận" },
                { key: "COMPLETED", label: "Đã hoàn thành" },
                { key: "CANCELLED", label: "Đã hủy" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusTab(tab.key as any)}
                  className={`px-4.5 py-2 rounded-xl text-xs sm:text-[13px] font-semibold whitespace-nowrap transition-all cursor-pointer ${statusTab === tab.key
                    ? "bg-[#0062ff] text-white shadow-xs"
                    : "bg-white text-slate-700 hover:text-[#0062ff] hover:bg-blue-50/50 border border-slate-200"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 4 Card Thống Kê Ngang */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Stat 1 */}
              <div className="bg-white rounded-2xl p-3.5 border border-[#E5ECF6] shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-lg sm:text-xl font-black text-slate-800 block leading-none">
                    {stats.total}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium block mt-1 leading-tight">
                    Tổng số lịch phỏng vấn
                  </span>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="bg-white rounded-2xl p-3.5 border border-[#E5ECF6] shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-lg sm:text-xl font-black text-slate-800 block leading-none">
                    {stats.upcoming}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium block mt-1 leading-tight">
                    Sắp diễn ra
                  </span>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="bg-white rounded-2xl p-3.5 border border-[#E5ECF6] shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-lg sm:text-xl font-black text-slate-800 block leading-none">
                    {stats.completed}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium block mt-1 leading-tight">
                    Đã hoàn thành
                  </span>
                </div>
              </div>

              {/* Stat 4 */}
              <div className="bg-white rounded-2xl p-3.5 border border-[#E5ECF6] shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-lg sm:text-xl font-black text-slate-800 block leading-none">
                    {stats.cancelled}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium block mt-1 leading-tight">
                    Đã hủy
                  </span>
                </div>
              </div>
            </div>

            {/* Khối Calendar Tháng & Lịch Trong Ngày (2 Cột Desktop) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cột Trái: Lịch Phỏng Vấn Của Bạn */}
              <div className="bg-white rounded-2xl p-4.5 border border-[#E5ECF6] shadow-2xs space-y-3 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-[13px] font-bold text-slate-800">
                      ‹ Tháng {currentCalendarMonth.month}, {currentCalendarMonth.year}
                    </span>
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      title="Tháng trước"
                      className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      title="Tháng sau"
                      className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDay(todayStr);
                      setCurrentCalendarMonth({ year: now.getFullYear(), month: now.getMonth() + 1 });
                    }}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:text-[#0062ff] text-[11px] font-semibold cursor-pointer"
                  >
                    Hôm nay
                  </button>
                </div>

                {/* Grid Ngày Thứ */}
                <div className="grid grid-cols-7 gap-1 text-center text-[10.5px] font-bold text-slate-400">
                  <span>T2</span>
                  <span>T3</span>
                  <span>T4</span>
                  <span>T5</span>
                  <span>T6</span>
                  <span>T7</span>
                  <span>CN</span>
                </div>

                {/* Grid 35 Ngày */}
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {daysInMonth.map((d, idx) => {
                    const isSelected = selectedDay === d.dateStr;
                    const isToday = d.dateStr === todayStr;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          if (d.isCurrentMonth) setSelectedDay(d.dateStr);
                        }}
                        className={`h-8 w-8 mx-auto rounded-full flex flex-col items-center justify-center relative font-semibold transition-all cursor-pointer ${isSelected
                          ? "bg-[#0062ff] text-white shadow-xs font-bold"
                          : isToday
                            ? "border border-[#0062ff] text-[#0062ff] font-bold"
                            : d.isCurrentMonth
                              ? "text-slate-700 hover:bg-slate-100"
                              : "text-slate-300 pointer-events-none"
                          }`}
                      >
                        <span className="leading-none">{d.day}</span>
                        {d.hasInterview && !isSelected && (
                          <span className="w-1 h-1 rounded-full bg-[#0062ff] absolute bottom-1" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Legend Chú Thích */}
                <div className="flex items-center justify-center gap-4 text-[10.5px] text-slate-500 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0062ff]" />
                    <span>Có phỏng vấn</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0062ff] text-white flex items-center justify-center text-[6px] font-bold">
                      ✓
                    </span>
                    <span>Hôm nay</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    <span>Đã qua</span>
                  </span>
                </div>
              </div>

              {/* Cột Phải: Lịch Trong Ngày */}
              <div className="bg-white rounded-2xl p-4.5 border border-[#E5ECF6] shadow-2xs space-y-3 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800 m-0 pb-1">
                    Lịch trong ngày {selectedDay ? selectedDay.split("-").reverse().join("/") : "09/04/2025"}
                  </h3>

                  {dayInterviews.length > 0 ? (
                    <div className="space-y-2.5 pt-1">
                      {dayInterviews.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setSelectedInterview(item);
                            setIsDetailModalOpen(true);
                          }}
                          className="p-2.5 rounded-xl border border-slate-100 hover:border-blue-200 bg-slate-50/60 hover:bg-blue-50/40 transition-all cursor-pointer flex items-start gap-3 group"
                        >
                          {/* Time Left Bordered */}
                          <div className="text-center shrink-0 pr-2 border-r border-slate-200 min-w-[58px]">
                            <span className="text-[11px] font-bold text-slate-800 block">
                              {item.timeRange.split(" - ")[0]}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {item.timeRange.split(" - ")[1]}
                            </span>
                          </div>

                          {/* Info Middle */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#0062ff] truncate m-0">
                                {item.companyName}
                              </h4>
                              <span
                                className={`text-[9.5px] font-bold px-2 py-0.2 rounded-full shrink-0 ${item.status === "UPCOMING"
                                  ? "bg-blue-50 text-[#0062ff] border border-blue-200"
                                  : item.status === "COMPLETED"
                                    ? "bg-slate-100 text-slate-600 border border-slate-200"
                                    : "bg-rose-50 text-rose-600 border border-rose-200"
                                  }`}
                              >
                                {item.status === "UPCOMING"
                                  ? "Sắp diễn ra"
                                  : item.status === "COMPLETED"
                                    ? "Đã hoàn thành"
                                    : "Đã hủy"}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 font-medium m-0 truncate">
                              {item.jobTitle}
                            </p>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{item.platformOrLocation}</span>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-slate-400 space-y-1">
                      <CalendarIcon className="w-7 h-7 mx-auto text-slate-300" />
                      <p className="text-xs font-medium m-0">Không có lịch phỏng vấn nào trong ngày này.</p>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 text-right">
                  <button
                    type="button"
                    onClick={() => setStatusTab("all")}
                    className="text-xs font-semibold text-[#0062ff] hover:underline cursor-pointer"
                  >
                    Xem tất cả lịch trong ngày →
                  </button>
                </div>
              </div>
            </div>

            {/* ==================== SECTION: DANH SÁCH LỊCH PHỎNG VẤN ==================== */}
            <div className="bg-white rounded-2xl p-5 border border-[#E5ECF6] shadow-2xs space-y-4">
              {/* Section Header + Search & Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
                <h3 className="text-sm sm:text-base font-bold text-slate-800 m-0">
                  Danh sách lịch phỏng vấn
                </h3>

                <div className="flex items-center gap-2.5">
                  {/* Search Box */}
                  <div className="relative flex items-center flex-1 sm:w-56">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm theo công ty, vị trí..."
                      className="w-full pl-8.5 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#0062ff]"
                    />
                  </div>

                  {/* Status Select */}
                  <select
                    value={statusTab}
                    onChange={(e) => setStatusTab(e.target.value as any)}
                    className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer"
                  >
                    <option value="all">Tất cả</option>
                    <option value="UPCOMING">Chờ xác nhận</option>
                    <option value="CONFIRMED">Đã xác nhận</option>
                    <option value="COMPLETED">Đã hoàn thành</option>
                    <option value="CANCELLED">Đã hủy</option>
                  </select>
                </div>
              </div>

              {/* List Rows */}
              {filteredInterviews.length > 0 ? (
                <div className="space-y-2.5">
                  {filteredInterviews.map((item) => {
                    const dateParts = item.date.split("-");
                    const formattedDate = `${dateParts[2]}/${dateParts[1]}`;
                    return (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-2xl bg-white border border-[#E5ECF6] hover:border-blue-200 hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 group"
                      >
                        {/* Cột 1: Ngày tháng */}
                        <div className="text-center shrink-0 w-16 bg-blue-50/60 p-2 rounded-xl border border-blue-100/80">
                          <span className="text-[9.5px] font-bold text-slate-500 block uppercase">
                            {item.dayOfWeek}
                          </span>
                          <span className="text-sm font-black text-[#0062ff] block">
                            {formattedDate}
                          </span>
                        </div>

                        {/* Cột 2: Logo + Vị trí + Công ty */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.companyLogo}
                              alt={item.companyName}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-[13.5px] font-bold text-slate-800 group-hover:text-[#0062ff] transition-colors m-0 truncate">
                              {item.jobTitle}
                            </h4>
                            <span className="text-xs text-slate-500 font-medium block truncate mt-0.5">
                              {item.companyName}
                            </span>
                          </div>
                        </div>

                        {/* Cột 3: Giờ phỏng vấn */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium shrink-0 min-w-[110px]">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.timeRange}</span>
                        </div>

                        {/* Cột 4: Hình thức / Địa điểm */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium shrink-0 min-w-[140px] max-w-[180px] truncate">
                          {item.type === "ONLINE" ? (
                            <Video className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          ) : (
                            <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          )}
                          <div className="truncate">
                            <span className="block font-semibold text-slate-700 truncate">
                              {item.type === "ONLINE" ? "Online" : "Văn phòng"}
                            </span>
                            <span className="text-[10.5px] text-slate-400 block truncate">
                              {item.platformOrLocation}
                            </span>
                          </div>
                        </div>

                        {/* Cột 5: Status Badge */}
                        <div className="shrink-0 flex items-center gap-2">
                          {item.status === "CONFIRMED" ? (
                            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Đã xác nhận</span>
                            </span>
                          ) : item.status === "UPCOMING" ? (
                            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-blue-50 text-[#0062ff] border border-blue-200">
                              Chờ xác nhận
                            </span>
                          ) : item.status === "COMPLETED" ? (
                            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                              Đã hoàn thành
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                              Đã hủy
                            </span>
                          )}

                          {item.status === "UPCOMING" && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleConfirmInterview(item.id);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                              title="Xác nhận tham gia buổi phỏng vấn"
                            >
                              <Check className="w-3 h-3" />
                              <span>Xác nhận</span>
                            </button>
                          )}
                        </div>

                        {/* Cột 6: More Actions ⋮ */}
                        <div className="shrink-0">
                          <Dropdown
                            menu={{
                              items: [
                                {
                                  key: "view",
                                  label: "Xem chi tiết",
                                  onClick: () => {
                                    setSelectedInterview(item);
                                    setIsDetailModalOpen(true);
                                  },
                                },
                                ...(item.status === "UPCOMING"
                                  ? [
                                    {
                                      key: "confirm",
                                      label: "Xác nhận tham gia",
                                      onClick: () => handleConfirmInterview(item.id),
                                    },
                                  ]
                                  : []),
                                ...(item.meetingUrl && item.status !== "CANCELLED"
                                  ? [
                                    {
                                      key: "meet",
                                      label: "Tham gia cuộc họp",
                                      onClick: () => window.open(item.meetingUrl, "_blank"),
                                    },
                                  ]
                                  : []),
                                ...(item.status === "UPCOMING" || item.status === "CONFIRMED"
                                  ? [
                                    {
                                      key: "cancel",
                                      danger: true,
                                      label: "Từ chối / Hủy lịch",
                                      onClick: () => openCancelModal(item.id),
                                    },
                                  ]
                                  : []),
                              ],
                            }}
                            trigger={["click"]}
                          >
                            <button
                              type="button"
                              className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </Dropdown>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <CalendarIcon className="w-10 h-10 mx-auto text-slate-300" />
                  <h4 className="text-sm font-bold text-slate-700 m-0">
                    Bạn chưa có lịch phỏng vấn nào
                  </h4>

                  <div className="pt-2">
                    <Link href="/viec-lam">
                      <button
                        type="button"
                        className="px-4 py-2 bg-[#0062ff] text-white text-xs font-bold rounded-xl hover:bg-blue-600 transition-colors cursor-pointer"
                      >
                        Khám phá việc làm →
                      </button>
                    </Link>
                  </div>
                </div>
              )}

              {/* Pagination Controls */}
              {filteredInterviews.length > 0 && (
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <span>Hiển thị {filteredInterviews.length}/{interviews.length} lịch</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-7 h-7 rounded-lg bg-[#0062ff] text-white flex items-center justify-center font-bold">
                      1
                    </span>
                    <button
                      type="button"
                      className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 cursor-pointer"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ==================== CỘT PHẢI: SIDEBAR (3/12 cols ~ 24%) ==================== */}
          <div className="lg:col-span-3 space-y-3.5">
            {/* Card 1: 🔔 Nhắc nhở sắp tới (Clean White Card) */}
            <div className="bg-white rounded-2xl p-4 sm:p-4.5 border border-[#E5ECF6] shadow-2xs space-y-3">
              <h3 className="text-sm font-black text-slate-900 m-0 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <span className="text-sm">🔔</span>
                <span>Nhắc nhở sắp tới</span>
              </h3>

              <div className="space-y-2.5">
                {upcomingReminders.length > 0 ? (
                  upcomingReminders.map((item) => (
                    <div key={item.id} className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 p-0.5 shrink-0 flex items-center justify-center shadow-2xs">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.companyLogo} alt={item.companyName} className="max-h-full max-w-full object-contain" />
                        </div>
                        <span className="text-xs font-bold text-slate-800 truncate">{item.companyName}</span>
                      </div>
                      <span className="text-xs font-bold text-[#0062ff] block">
                        {item.date === todayStr ? "Hôm nay" : "Sắp tới"}, {item.timeRange.split(" - ")[0]}
                      </span>
                      <p className="text-[11.5px] text-slate-600 m-0 leading-relaxed font-medium line-clamp-2">
                        {item.note || `Phỏng vấn vị trí ${item.jobTitle}`}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 m-0 py-2 text-center">Không có lịch sắp tới cần nhắc nhở</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setStatusTab("UPCOMING")}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-[#0062ff] font-bold text-xs border border-slate-200 shadow-2xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Xem tất cả nhắc nhở</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 2: Mẹo chuẩn bị phỏng vấn (Clean Card) */}
            <div className="bg-white rounded-2xl p-4 sm:p-4.5 border border-[#E5ECF6] shadow-2xs space-y-2.5">
              <h3 className="text-sm font-black text-slate-900 m-0 pb-2 border-b border-slate-100 flex items-center gap-1.5">
                <span>💡</span>
                <span>Mẹo chuẩn bị phỏng vấn</span>
              </h3>

              <ul className="space-y-2 text-xs text-slate-600 pl-0 list-none m-0 leading-relaxed font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-[#0062ff] font-bold">✓</span>
                  <span>Tìm hiểu kỹ về công ty & văn hóa</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0062ff] font-bold">✓</span>
                  <span>Ôn lại mô tả công việc và kinh nghiệm cốt lõi</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0062ff] font-bold">✓</span>
                  <span>Chuẩn bị câu hỏi để trao đổi với nhà tuyển dụng</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0062ff] font-bold">✓</span>
                  <span>Kiểm tra camera, mic và kết nối mạng trước 15 phút</span>
                </li>
              </ul>
            </div>

            {/* Card 3: Cần hỗ trợ? */}
            <div className="bg-white rounded-2xl p-4 sm:p-4.5 border border-[#E5ECF6] shadow-2xs space-y-3">
              <div>
                <h4 className="text-sm font-black text-slate-900 m-0">Cần hỗ trợ?</h4>
                <p className="text-xs text-slate-500 font-normal m-0 mt-0.5 leading-relaxed">
                  Đội ngũ Careza luôn sẵn sàng đồng hành cùng bạn.
                </p>
              </div>
              <div className="flex items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={() => message.info("Tổng đài hỗ trợ Careza: 1900 6868")}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0062ff] font-bold text-xs border border-blue-200/80 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Liên hệ hỗ trợ</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0">
                  <Headphones className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. MODAL CHI TIẾT LỊCH PHỎNG VẤN                          */}
      {/* ======================================================== */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <CalendarCheck className="w-4.5 h-4.5 text-[#0062ff]" />
            <span>Chi tiết lịch phỏng vấn</span>
          </div>
        }
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
        centered
        className="rounded-2xl overflow-hidden"
      >
        {selectedInterview && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3 p-3.5 bg-blue-50/60 rounded-xl border border-blue-100">
              <div className="w-12 h-12 rounded-xl bg-white p-1 border border-slate-200 flex items-center justify-center shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedInterview.companyLogo}
                  alt={selectedInterview.companyName}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-slate-900 m-0 truncate">
                  {selectedInterview.jobTitle}
                </h4>
                <p className="text-xs font-semibold text-[#0062ff] m-0 mt-0.5">
                  {selectedInterview.companyName}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Thời gian:</span>
                <span className="font-bold text-slate-800">
                  {selectedInterview.timeRange}, {selectedInterview.dayOfWeek} ({selectedInterview.date})
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Hình thức:</span>
                <span className="font-bold text-slate-800">
                  {selectedInterview.type === "ONLINE" ? "Phỏng vấn trực tuyến (Online)" : "Tại văn phòng (Offline)"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Địa điểm / Nền tảng:</span>
                <span className="font-bold text-slate-800 text-right max-w-[260px]">
                  {selectedInterview.platformOrLocation}
                </span>
              </div>
              {selectedInterview.interviewer && (
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Người phỏng vấn:</span>
                  <span className="font-bold text-slate-800">{selectedInterview.interviewer}</span>
                </div>
              )}
              {selectedInterview.note && (
                <div className="py-1.5 border-b border-slate-100 space-y-1">
                  <span className="text-slate-500 block">Ghi chú chuẩn bị:</span>
                  <p className="text-slate-700 font-medium m-0 bg-slate-50 p-2 rounded-lg border border-slate-200/60 leading-relaxed">
                    {selectedInterview.note}
                  </p>
                </div>
              )}
              <div className="flex justify-between py-1.5 items-center">
                <span className="text-slate-500">Trạng thái:</span>
                {selectedInterview.status === "CONFIRMED" ? (
                  <span className="text-[11px] font-bold px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Đã xác nhận tham gia</span>
                  </span>
                ) : selectedInterview.status === "UPCOMING" ? (
                  <span className="text-[11px] font-bold px-3 py-0.5 rounded-full bg-blue-50 text-[#0062ff] border border-blue-200">
                    Chờ xác nhận
                  </span>
                ) : selectedInterview.status === "COMPLETED" ? (
                  <span className="text-[11px] font-bold px-3 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    Đã hoàn thành
                  </span>
                ) : (
                  <span className="text-[11px] font-bold px-3 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                    Đã hủy
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              {selectedInterview.meetingUrl && selectedInterview.status !== "CANCELLED" && (
                <button
                  type="button"
                  onClick={() => window.open(selectedInterview.meetingUrl, "_blank")}
                  className="flex-1 min-w-[150px] py-2.5 rounded-xl bg-[#0062ff] hover:bg-[#0047ba] text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Tham gia phỏng vấn</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}

              {selectedInterview.status === "UPCOMING" && (
                <button
                  type="button"
                  onClick={() => handleConfirmInterview(selectedInterview.id)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Xác nhận tham gia</span>
                </button>
              )}

              {(selectedInterview.status === "UPCOMING" || selectedInterview.status === "CONFIRMED") && (
                <button
                  type="button"
                  onClick={() => openCancelModal(selectedInterview.id)}
                  className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs transition-all cursor-pointer"
                >
                  Từ chối / Hủy lịch
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition-all cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ======================================================== */}
      {/* 4. MODAL TỪ CHỐI / HỦY LỊCH PHỎNG VẤN                    */}
      {/* ======================================================== */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-sm font-bold text-rose-600">
            <XCircle className="w-4.5 h-4.5" />
            <span>Xác nhận từ chối / Hủy lịch phỏng vấn</span>
          </div>
        }
        open={cancelModalOpen}
        onCancel={() => {
          if (!submittingCancel) setCancelModalOpen(false);
        }}
        footer={null}
        centered
        className="rounded-2xl"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-slate-600 font-medium m-0 leading-relaxed">
            Bạn có chắc chắn muốn từ chối hoặc hủy buổi phỏng vấn này không? Thông báo sẽ được chuyển đến người phụ trách tuyển dụng của doanh nghiệp.
          </p>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Lý do hoặc đề xuất đổi lịch (tùy chọn):
            </label>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Ví dụ: Em có lịch thi trùng vào khung giờ này, kính mong quý công ty hỗ trợ chuyển sang 14:00 cùng ngày..."
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#0062ff] resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              disabled={submittingCancel}
              onClick={() => setCancelModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition-all cursor-pointer"
            >
              Quay lại
            </button>
            <button
              type="button"
              disabled={submittingCancel}
              onClick={executeCancelInterview}
              className="px-4.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {submittingCancel ? (
                <span>Đang xử lý...</span>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Xác nhận hủy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
      </div>
    </div>
  );
}
