"use client";

import React, { useState, useMemo, useEffect, useCallback, Suspense, Fragment } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { employerService } from "@/services/employer.service";
import {
  Dropdown,
  Tooltip,
  Modal,
  App,
  Input,
  Select,
  Avatar,
  Radio,
  Rate,
  DatePicker,
  TimePicker,
  Button,
  Spin,
  Alert,
  Empty,
} from "antd";
import {
  Plus,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  MapPin,
  Mail,
  Phone,
  Video,
  FileText,
  MoreHorizontal,
  SlidersHorizontal,
  FileSpreadsheet,
  Edit3,
  Trash2,
  CheckSquare,
  UserCheck,
  Search,
  MessageSquare,
  AlertTriangle,
  ArrowRight,
  Building,
  UserPlus,
  Sparkles,
  Check,
  X,
} from "lucide-react";

// =====================================================================
// DATA TYPES
// =====================================================================
export type InterviewStatus =
  | "UPCOMING"     // Sắp diễn ra (blue)
  | "IN_PROGRESS"  // Đang diễn ra (orange/coral)
  | "COMPLETED"    // Đã hoàn thành (green)
  | "CANCELLED"    // Đã hủy (rose)
  | "NEEDS_REVIEW"; // Chờ đánh giá (amber)

export type InterviewFormat = "ONLINE" | "OFFLINE" | "PHONE";

export interface InterviewEvent {
  id: string;
  candidateName: string;
  candidateAvatar: string;
  candidateEmail: string;
  candidatePhone?: string;
  jobTitle: string;
  jobCode: string;
  round: string; // Vòng 1, Vòng 2, Vòng 3
  roundTitle: string; // Phỏng vấn chuyên môn / HR
  date: string; // YYYY-MM-DD e.g. "2026-08-20"
  dayOfWeek: number; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  startTime: string; // "09:00"
  endTime: string; // "10:00"
  startHour: number; // 9
  startMinute: number; // 0
  durationHours: number; // 1
  format: InterviewFormat;
  locationOrLink: string; // "Phòng A • Tầng 5" or "meet.google.com/abc-def"
  roomName?: string; // "Phòng A"
  interviewerName: string;
  interviewerRole: string;
  interviewerAvatar?: string;
  status: InterviewStatus;
  notes?: string;
  rating?: number;
  applicationId?: number;
  // Event card styling
  cardBg: string;
  cardBorder: string;
  cardText: string;
}

// Style configs for cards with bold left accent and rich pastel background
const EVENT_COLORS = [
  { bg: "bg-blue-100/90", border: "border-blue-300 border-l-[3.5px] border-l-blue-600", text: "text-blue-900" }, // Blue
  { bg: "bg-emerald-100/90", border: "border-emerald-300 border-l-[3.5px] border-l-emerald-600", text: "text-emerald-900" }, // Green
  { bg: "bg-purple-100/90", border: "border-purple-300 border-l-[3.5px] border-l-purple-600", text: "text-purple-900" }, // Purple
  { bg: "bg-amber-100/90", border: "border-amber-300 border-l-[3.5px] border-l-amber-500", text: "text-amber-900" }, // Amber
  { bg: "bg-rose-100/90", border: "border-rose-300 border-l-[3.5px] border-l-rose-500", text: "text-rose-900" }, // Rose
  { bg: "bg-teal-100/90", border: "border-teal-300 border-l-[3.5px] border-l-teal-600", text: "text-teal-900" }, // Teal
];

// Week days definition for Monday 18/08 to Sunday 24/08 (matching reference)
const WEEK_DAYS = [
  { dayName: "Thứ 2", dateStr: "18/08", fullDate: "2026-08-18", dayIndex: 1, isToday: false },
  { dayName: "Thứ 3", dateStr: "19/08", fullDate: "2026-08-19", dayIndex: 2, isToday: false },
  { dayName: "Thứ 4", dateStr: "20/08", fullDate: "2026-08-20", dayIndex: 3, isToday: true }, // Today Highlight
  { dayName: "Thứ 5", dateStr: "21/08", fullDate: "2026-08-21", dayIndex: 4, isToday: false },
  { dayName: "Thứ 6", dateStr: "22/08", fullDate: "2026-08-22", dayIndex: 5, isToday: false },
  { dayName: "Thứ 7", dateStr: "23/08", fullDate: "2026-08-23", dayIndex: 6, isToday: false },
  { dayName: "Chủ nhật", dateStr: "24/08", fullDate: "2026-08-24", dayIndex: 0, isToday: false },
];

const TIME_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

// Initial Interview Dataset matching reference
const INITIAL_INTERVIEWS: InterviewEvent[] = [];

// =====================================================================
// COMPONENT MAIN
// =====================================================================
function EmployerInterviewContent() {
  const { message } = App.useApp();
  const { user } = useAuthStore();
  const recruiterName = user?.fullName || "Mai Phương";

  // State
  const [interviews, setInterviews] = useState<InterviewEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"day" | "week" | "month" | "agenda">("week");
  const [currentWeekLabel, setCurrentWeekLabel] = useState<string>("18 – 24 Tháng 8, 2026");
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [selectedEvent, setSelectedEvent] = useState<InterviewEvent | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [evaluationCandidate, setEvaluationCandidate] = useState<InterviewEvent | null>(null);
  const [cancelCandidate, setCancelCandidate] = useState<InterviewEvent | null>(null);

  // Form State for Create Interview
  const [formCandidateName, setFormCandidateName] = useState<string>("");
  const [formJobTitle, setFormJobTitle] = useState<string>("Product Manager");
  const [formRound, setFormRound] = useState<string>("Vòng 2 - Phỏng vấn chuyên môn");
  const [formDate, setFormDate] = useState<string>("2026-08-21");
  const [formStartTime, setFormStartTime] = useState<string>("09:00");
  const [formEndTime, setFormEndTime] = useState<string>("10:00");
  const [formFormat, setFormFormat] = useState<InterviewFormat>("OFFLINE");
  const [formLocationOrLink, setFormLocationOrLink] = useState<string>("Phòng A • Tầng 5");
  const [formInterviewer, setFormInterviewer] = useState<string>("Phạm Văn Hùng (Hiring Manager)");
  const [formNotes, setFormNotes] = useState<string>("");
  const [applications, setApplications] = useState<any[]>([]);
  const [formApplicationId, setFormApplicationId] = useState<number | null>(null);

  // Reschedule interview state
  const [rescheduleEvent, setRescheduleEvent] = useState<InterviewEvent | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>("");
  const [rescheduleTime, setRescheduleTime] = useState<string>("09:00");
  const [rescheduleDuration, setRescheduleDuration] = useState<number>(45);
  const [rescheduleNote, setRescheduleNote] = useState<string>("");
  const [isSubmittingReschedule, setIsSubmittingReschedule] = useState<boolean>(false);

  // Cancel interview state
  const [cancelReason, setCancelReason] = useState<string>("Người phỏng vấn bận lịch đột xuất");
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  // Scorecard evaluation state
  const [evalTechScore, setEvalTechScore] = useState<number>(4);
  const [evalCommScore, setEvalCommScore] = useState<number>(4);
  const [evalCultureScore, setEvalCultureScore] = useState<number>(4);
  const [evalNotes, setEvalNotes] = useState<string>("");
  const [isSubmittingEval, setIsSubmittingEval] = useState<boolean>(false);

  const kpiStats = useMemo(() => {
    const total = interviews.length;
    const upcoming = interviews.filter((i) => i.status === "UPCOMING").length;
    const inProgress = interviews.filter((i) => i.status === "IN_PROGRESS").length;
    const completed = interviews.filter((i) => i.status === "COMPLETED").length;
    const needReview = interviews.filter((i) => i.status === "COMPLETED" && !i.rating).length;
    return { total, upcoming, inProgress, completed, needReview };
  }, [interviews]);

  const fetchInterviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [res, appsRes] = await Promise.all([
        employerService.getInterviews(),
        employerService.getApplications({ page_size: 100 }).catch(() => null),
      ]);
      const list = res.data?.interviews || [];
      const appList = (appsRes as any)?.data?.applications || (appsRes as any)?.applications || [];
      setApplications(appList);

      const mapped: InterviewEvent[] = list.map((iv: any, idx: number) => {
        const d = iv.scheduled_at ? new Date(iv.scheduled_at) : new Date();
        const dateStr = d.toISOString().split("T")[0];
        const hours = d.getHours().toString().padStart(2, "0");
        const mins = d.getMinutes().toString().padStart(2, "0");
        const startT = `${hours}:${mins}`;
        const dur = iv.duration_minutes || 60;
        const endD = new Date(d.getTime() + dur * 60000);
        const endH = endD.getHours().toString().padStart(2, "0");
        const endM = endD.getMinutes().toString().padStart(2, "0");
        const endT = `${endH}:${endM}`;
        const color = EVENT_COLORS[idx % EVENT_COLORS.length];

        const rawStat = String(iv.status || "").toLowerCase();
        let stat: InterviewStatus = "UPCOMING";
        if (rawStat === "completed") stat = "COMPLETED";
        else if (rawStat === "cancelled") stat = "CANCELLED";
        else if (rawStat === "in_progress") stat = "IN_PROGRESS";
        else stat = "UPCOMING";

        return {
          id: String(iv.id),
          applicationId: iv.application_id,
          candidateName: iv.candidate_name || "Ứng viên",
          candidateAvatar: iv.candidate_avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          candidateEmail: iv.candidate_email || "",
          candidatePhone: iv.candidate_phone || "",
          jobTitle: iv.job_title || "Vị trí tuyển dụng",
          jobCode: `JOB-${iv.job_id || iv.id}`,
          round: "Vòng phỏng vấn",
          roundTitle: "Phỏng vấn chuyên môn & Văn hóa",
          date: dateStr,
          dayOfWeek: d.getDay(),
          startTime: startT,
          endTime: endT,
          startHour: d.getHours(),
          startMinute: d.getMinutes(),
          durationHours: Math.max(1, Math.round(dur / 60)),
          format: String(iv.mode || "").toLowerCase() === "online" ? "ONLINE" : "OFFLINE",
          locationOrLink: iv.meeting_url || "Văn phòng công ty",
          roomName: iv.meeting_url || "Văn phòng công ty",
          interviewerName: iv.interviewer_name || "Hội đồng tuyển dụng",
          interviewerRole: "Hiring Team",
          status: stat,
          notes: iv.notes,
          rating: iv.rating,
          cardBg: color.bg,
          cardBorder: color.border,
          cardText: color.text,
        };
      });
      setInterviews(mapped);
    } catch {
      setError("Không thể tải lịch phỏng vấn từ máy chủ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  // Conflict state detection
  const hasConflictWarning = useMemo(() => {
    if (!formDate || !formStartTime || !formInterviewer) return false;
    return interviews.some(
      (iv) =>
        iv.date === formDate &&
        iv.startTime === formStartTime &&
        iv.status !== "CANCELLED"
    );
  }, [formDate, formStartTime, formInterviewer, interviews]);

  // Handle Create Interview
  const handleConfirmCreateInterview = async () => {
    if (!formCandidateName.trim() && !formApplicationId) {
      message.error("Vui lòng chọn hoặc nhập tên ứng viên!");
      return;
    }

    try {
      const scheduledDateTime = `${formDate}T${formStartTime}:00`;
      let appId = formApplicationId;
      if (!appId && applications.length > 0) {
        const found = applications.find(
          (a) => (a.candidate?.full_name || a.candidate_name || "").toLowerCase() === formCandidateName.toLowerCase()
        );
        appId = found ? found.id : applications[0].id;
      }

      if (!appId) {
        message.warning("Cần chọn một hồ sơ ứng tuyển hợp lệ để lên lịch phỏng vấn chính thức.");
        return;
      }

      const res = await employerService.createInterview({
        application_id: appId,
        scheduled_at: scheduledDateTime,
        duration_minutes: 45,
        mode: formFormat.toLowerCase(),
        meeting_url: formLocationOrLink,
        notes: formNotes,
      });

      if (res?.data?.interview?.has_conflict) {
        message.warning(res.data.interview.conflict_message || "Lưu ý: Có lịch phỏng vấn khác trùng thời gian!");
      }

      message.success(`Đã tạo lịch phỏng vấn cho "${formCandidateName}" thành công!`);
      setIsCreateModalOpen(false);
      setFormCandidateName("");
      setFormApplicationId(null);
      setFormNotes("");
      fetchInterviews();
    } catch (err: any) {
      const msg = err.response?.data?.errors?.application_id?.[0] || err.response?.data?.errors?.scheduled_at?.[0] || err.response?.data?.message || err.message || "Tạo lịch phỏng vấn thất bại.";
      message.error(msg);
    }
  };

  // Handle Save Scorecard Evaluation
  const handleSaveScorecard = async () => {
    if (!evaluationCandidate) return;
    setIsSubmittingEval(true);
    try {
      const appId = evaluationCandidate.applicationId;
      if (appId) {
        await employerService.addScorecard({
          application_id: appId,
          technical_score: evalTechScore,
          communication_score: evalCommScore,
          culture_score: evalCultureScore,
          notes: evalNotes,
        });
      }
      message.success(`Đã lưu kết quả đánh giá cho "${evaluationCandidate.candidateName}"!`);
      setEvaluationCandidate(null);
      setEvalNotes("");
      fetchInterviews();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Lưu kết quả đánh giá thất bại.";
      message.error(msg);
    } finally {
      setIsSubmittingEval(false);
    }
  };

  // Handle Cancel Interview via API
  const handleConfirmCancelInterview = async () => {
    if (!cancelCandidate) return;
    setIsCancelling(true);
    try {
      await employerService.cancelInterview(cancelCandidate.id, cancelReason);
      message.success("Đã hủy lịch phỏng vấn thành công!");
      setCancelCandidate(null);
      setSelectedEvent(null);
      setCancelReason("Người phỏng vấn bận lịch đột xuất");
      fetchInterviews();
    } catch (err: any) {
      message.error(err.response?.data?.message || "Không thể hủy lịch phỏng vấn lúc này.");
    } finally {
      setIsCancelling(false);
    }
  };

  // Handle Reschedule Interview via API
  const handleConfirmReschedule = async () => {
    if (!rescheduleEvent) return;
    if (!rescheduleDate || !rescheduleTime) {
      message.error("Vui lòng chọn ngày và giờ phỏng vấn mới!");
      return;
    }
    setIsSubmittingReschedule(true);
    try {
      const newScheduledAt = `${rescheduleDate}T${rescheduleTime}:00`;
      await employerService.updateInterview(rescheduleEvent.id, {
        scheduled_at: newScheduledAt,
        duration_minutes: rescheduleDuration,
        notes: rescheduleNote ? `${rescheduleEvent.notes || ""}\n[Đổi lịch]: ${rescheduleNote}`.trim() : rescheduleEvent.notes,
        status: "scheduled",
      });
      message.success("Đã dời / đổi lịch phỏng vấn thành công!");
      setRescheduleEvent(null);
      setSelectedEvent(null);
      fetchInterviews();
    } catch (err: any) {
      message.error(err.response?.data?.message || "Lỗi khi cập nhật đổi lịch.");
    } finally {
      setIsSubmittingReschedule(false);
    }
  };

  // Handle Mark Interview Completed
  const handleMarkCompleted = async (eventItem: InterviewEvent) => {
    try {
      await employerService.updateInterview(eventItem.id, { status: "completed" });
      message.success("Đã đánh dấu hoàn tất cuộc phỏng vấn!");
      setSelectedEvent(null);
      fetchInterviews();
    } catch (err: any) {
      message.error(err.response?.data?.message || "Lỗi cập nhật hoàn tất phỏng vấn.");
    }
  };

  return (
    <div className="space-y-3.5 max-w-[1680px] mx-auto w-full pb-8">
      {/* ======================================================== */}
      {/* 1. PAGE HEADER                                           */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 m-0 tracking-tight leading-snug">
            Lịch phỏng vấn
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => message.info("Đang kết xuất lịch phỏng vấn...")}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Xuất lịch</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFilterModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>Bộ lọc</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo lịch phỏng vấn</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. KPI CARDS (5 HORIZONTAL CARDS)                        */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Card 1: Tổng lịch hôm nay */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs flex items-center gap-3.5 hover:border-blue-300 transition-all">
          <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0 shadow-2xs">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="flex-1 text-center min-w-0 pr-2">
            <span className="text-xs font-semibold text-slate-500 block leading-none">
              Tổng lịch phỏng vấn
            </span>
            <span className="text-xl font-black text-slate-900 block my-1 leading-tight">
              {kpiStats.total}
            </span>
            <span className="text-[10px] font-bold text-slate-400 block leading-none">
              Tất cả thời gian
            </span>
          </div>
        </div>

        {/* Card 2: Sắp diễn ra */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs flex items-center gap-3.5 hover:border-amber-300 transition-all">
          <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0 shadow-2xs">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex-1 text-center min-w-0 pr-2">
            <span className="text-xs font-semibold text-slate-500 block leading-none">
              Sắp diễn ra
            </span>
            <span className="text-xl font-black text-slate-900 block my-1 leading-tight">
              {kpiStats.upcoming}
            </span>
            <span className="text-[10px] font-medium text-slate-400 block leading-none">
              Đang chờ diễn ra
            </span>
          </div>
        </div>

        {/* Card 3: Đang diễn ra */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs flex items-center gap-3.5 hover:border-rose-300 transition-all">
          <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center shrink-0 shadow-2xs">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex-1 text-center min-w-0 pr-2">
            <span className="text-xs font-semibold text-slate-500 block leading-none">
              Đang diễn ra
            </span>
            <span className="text-xl font-black text-slate-900 block my-1 leading-tight">
              {kpiStats.inProgress}
            </span>
            <span className="text-[10px] font-medium text-slate-400 block leading-none">
              Thời điểm hiện tại
            </span>
          </div>
        </div>

        {/* Card 4: Hoàn thành hôm nay */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs flex items-center gap-3.5 hover:border-emerald-300 transition-all">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0 shadow-2xs">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div className="flex-1 text-center min-w-0 pr-2">
            <span className="text-xs font-semibold text-slate-500 block leading-none">
              Đã hoàn thành
            </span>
            <span className="text-xl font-black text-slate-900 block my-1 leading-tight">
              {kpiStats.completed}
            </span>
            <span className="text-[10px] font-bold text-emerald-600 block leading-none">
              Đã phỏng vấn xong
            </span>
          </div>
        </div>

        {/* Card 5: Cần đánh giá */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs flex items-center gap-3.5 hover:border-rose-300 transition-all">
          <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center shrink-0 shadow-2xs">
            <UserCheck className="w-5 h-5" />
          </div>
          <div className="flex-1 text-center min-w-0 pr-2">
            <span className="text-xs font-semibold text-slate-500 block leading-none">
              Cần đánh giá
            </span>
            <span className="text-xl font-black text-slate-900 block my-1 leading-tight">
              {kpiStats.needReview}
            </span>
            <span className="text-[10px] font-medium text-slate-400 block leading-none">
              Ứng viên chờ đánh giá
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. MAIN WORKSPACE: CALENDAR (LEFT) + SIDEBAR (RIGHT)     */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* ====================================================== */}
        {/* LEFT COLUMN: CALENDAR & UPCOMING TABLE (~80% = 9 Cols) */}
        {/* ====================================================== */}
        <div className="xl:col-span-8 2xl:col-span-9 space-y-4">
          {/* Main Calendar Card */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs p-3.5 space-y-3">
            {/* Calendar Toolbar */}
            <div className="flex items-center justify-between gap-3 flex-wrap border-b border-slate-100 pb-3">
              {/* Left: Navigation & Date */}
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => message.info("Chuyển về tuần trước...")}
                    className="p-1.5 hover:bg-white rounded-lg text-slate-600 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => message.info("Chuyển sang tuần sau...")}
                    className="p-1.5 hover:bg-white rounded-lg text-slate-600 transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => message.info("Trở về tuần hiện tại")}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs cursor-pointer"
                >
                  Hôm nay
                </button>

                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900 cursor-pointer hover:text-[#0062ff]">
                  <span>{currentWeekLabel}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Right: View Mode Selector */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
                {[
                  { key: "day", label: "Ngày" },
                  { key: "week", label: "Tuần" },
                  { key: "month", label: "Tháng" },
                  { key: "agenda", label: "Agenda" },
                ].map((mode) => (
                  <button
                    key={mode.key}
                    type="button"
                    onClick={() => setViewMode(mode.key as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      viewMode === mode.key
                        ? "bg-[#0062ff] text-white shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <Alert
                type="error"
                message={error}
                action={
                  <Button size="small" onClick={fetchInterviews}>
                    Tải lại
                  </Button>
                }
                className="my-2 rounded-xl"
                showIcon
              />
            )}

            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <Spin size="large" />
                <span className="text-xs text-slate-500 font-medium">Đang tải lịch phỏng vấn...</span>
              </div>
            ) : interviews.length === 0 ? (
              <div className="py-16">
                <Empty description="Chưa có lịch phỏng vấn nào được lên lịch" />
              </div>
            ) : (
              <>
            {/* ======================================================== */}
            {/* VIEW MODE 1: WEEK CALENDAR GRID                          */}
            {/* ======================================================== */}
            {viewMode === "week" && (
              <div className="overflow-x-auto min-w-[700px]">
                {/* Header Days Row */}
                <div className="grid grid-cols-8 border-b border-slate-200 text-center text-xs pb-2">
                  <div className="py-1 text-[11px] font-bold text-slate-400">
                    Cả ngày
                  </div>

                  {WEEK_DAYS.map((day) => {
                    const dayEvents = interviews.filter((iv) => iv.dayOfWeek === day.dayIndex);
                    return (
                      <div key={day.dateStr} className="py-1 space-y-1">
                        <span className="text-[11px] font-bold text-slate-600 block">
                          {day.dayName}
                        </span>
                        <div className="flex justify-center">
                          <span
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                              day.isToday
                                ? "bg-[#0062ff] text-white shadow-md"
                                : "text-slate-800"
                            }`}
                          >
                            {day.dateStr.split("/")[0]}
                          </span>
                        </div>
                        <span className="text-[10px] font-medium text-slate-400 block">
                          • {dayEvents.length} lịch
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Time Grid Rows */}
                <div className="relative divide-y divide-slate-100 text-xs">
                  {/* Red Current Time Line Indicator on Wednesday 10:45 */}
                  <div
                    className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                    style={{ top: "145px" }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500 -ml-1 shadow-sm" />
                    <div className="flex-1 h-[2px] bg-rose-500 shadow-sm" />
                  </div>

                  {TIME_SLOTS.map((time) => (
                    <div key={time} className="grid grid-cols-8 min-h-[56px] relative group">
                      {/* Time Label */}
                      <div className="py-2 text-[10.5px] font-bold text-slate-400 border-r border-slate-100 pr-2">
                        {time}
                      </div>

                      {/* 7 Days Columns */}
                      {WEEK_DAYS.map((day) => {
                        const hourNum = parseInt(time.split(":")[0]);
                        const slotEvents = interviews.filter(
                          (iv) =>
                            iv.dayOfWeek === day.dayIndex &&
                            Math.floor(iv.startHour) === hourNum
                        );

                        return (
                          <div
                            key={day.dateStr}
                            onClick={() => {
                              setFormDate(day.fullDate);
                              setFormStartTime(time);
                              setIsCreateModalOpen(true);
                            }}
                            className={`border-r border-slate-100 p-1 relative hover:bg-blue-50/20 transition-colors cursor-pointer ${
                              day.isToday ? "bg-blue-50/10" : ""
                            }`}
                          >
                            {slotEvents.map((event) => (
                              <div
                                key={event.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedEvent(event);
                                }}
                                className={`p-2 rounded-xl border ${event.cardBg} ${event.cardBorder} shadow-xs hover:shadow-md transition-all cursor-pointer space-y-0.5 text-left`}
                              >
                                <div className="flex items-center justify-between text-[10.5px]">
                                  <span className={event.cardText}>
                                    {event.startTime} - {event.endTime}
                                  </span>
                                </div>
                                <span className="font-extrabold text-slate-900 text-[12px] block leading-tight truncate">
                                  {event.candidateName}
                                </span>
                                <span className="text-[10.5px] text-slate-700 font-semibold block truncate">
                                  {event.jobTitle}
                                </span>
                                <span className="text-[10px] text-slate-500 font-medium block truncate">
                                  {event.roomName || event.locationOrLink}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* VIEW MODE 2: DAY VIEW (NGÀY)                             */}
            {/* ======================================================== */}
            {viewMode === "day" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-[#0062ff] text-white flex items-center justify-center font-bold text-xs shadow-md">
                      20
                    </span>
                    <div>
                      <strong className="text-slate-900 text-sm block">Thứ Tư, 20 Tháng 8, 2026 (Hôm nay)</strong>
                      <span className="text-xs text-slate-500">3 lịch phỏng vấn đang chờ xử lý</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-white text-[#0062ff] font-bold text-xs rounded-lg border border-blue-200 shadow-2xs">
                    3 Cuộc phỏng vấn
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {TIME_SLOTS.map((time) => {
                    const hourNum = parseInt(time.split(":")[0]);
                    const currentSlotEvents = interviews.filter(
                      (iv) => iv.dayOfWeek === 3 && Math.floor(iv.startHour) === hourNum
                    );

                    return (
                      <div key={time} className="flex gap-4 py-3 min-h-[64px] group hover:bg-slate-50/50 transition-colors px-2 rounded-xl">
                        <div className="w-16 shrink-0 text-right font-bold text-slate-400 text-xs pt-1">
                          {time}
                        </div>

                        <div className="flex-1 space-y-2">
                          {currentSlotEvents.length === 0 ? (
                            <div
                              onClick={() => {
                                setFormDate("2026-08-20");
                                setFormStartTime(time);
                                setIsCreateModalOpen(true);
                              }}
                              className="h-full border border-dashed border-slate-200/80 rounded-xl p-2 text-slate-300 text-xs font-medium hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/20 transition-all cursor-pointer flex items-center"
                            >
                              + Trống (Click để tạo lịch)
                            </div>
                          ) : (
                            currentSlotEvents.map((event) => (
                              <div
                                key={event.id}
                                onClick={() => setSelectedEvent(event)}
                                className={`p-3.5 rounded-2xl border ${event.cardBg} ${event.cardBorder} shadow-2xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-4`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <Avatar src={event.candidateAvatar} size={42} className="border border-white shrink-0 shadow-md" />
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <strong className="text-slate-900 text-sm block truncate">{event.candidateName}</strong>
                                      <span className="px-2 py-0.5 rounded-md bg-white/90 text-blue-800 font-bold text-[10px] border border-blue-200">
                                        {event.startTime} - {event.endTime}
                                      </span>
                                    </div>
                                    <span className="text-xs font-semibold text-slate-700 block">{event.jobTitle} • {event.round}</span>
                                    <span className="text-[11px] text-slate-500 font-medium block">{event.locationOrLink} • Phỏng vấn cùng {event.interviewerName}</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  {event.format === "ONLINE" && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        message.info("Đang mở Google Meet...");
                                      }}
                                      className="px-3 py-1.5 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs flex items-center gap-1 shadow-md"
                                    >
                                      <Video className="w-3.5 h-3.5" />
                                      <span>Vào họp</span>
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedEvent(event);
                                    }}
                                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-2xs"
                                  >
                                    Chi tiết
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* VIEW MODE 3: MONTH VIEW (THÁNG)                          */}
            {/* ======================================================== */}
            {viewMode === "month" && (
              <div className="space-y-2">
                {/* Month Days Header */}
                <div className="grid grid-cols-7 border-b border-slate-200 text-center font-bold text-xs text-slate-600 pb-2">
                  <span>Thứ 2</span>
                  <span>Thứ 3</span>
                  <span>Thứ 4</span>
                  <span>Thứ 5</span>
                  <span>Thứ 6</span>
                  <span className="text-rose-500">Thứ 7</span>
                  <span className="text-rose-500">Chủ nhật</span>
                </div>

                {/* Month Grid 35 Cells */}
                <div className="grid grid-cols-7 gap-1.5 text-xs">
                  {Array.from({ length: 35 }).map((_, idx) => {
                    const dayNumber = idx - 2; // Starting August 1 on Saturday
                    const isAugust = dayNumber >= 1 && dayNumber <= 31;
                    const displayDay = isAugust ? dayNumber : dayNumber < 1 ? 31 + dayNumber : dayNumber - 31;
                    const isToday = isAugust && dayNumber === 20;

                    // Match events on this day
                    const matchingDayEvents = interviews.filter((iv) => {
                      if (!isAugust) return false;
                      const ivDay = parseInt(iv.date.split("-")[2]);
                      return ivDay === dayNumber;
                    });

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (isAugust) {
                            setFormDate(`2026-08-${String(dayNumber).padStart(2, "0")}`);
                            setIsCreateModalOpen(true);
                          }
                        }}
                        className={`min-h-[88px] p-1.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          !isAugust
                            ? "bg-slate-50/40 border-slate-100 text-slate-300 opacity-60"
                            : isToday
                            ? "bg-blue-50/30 border-blue-300 shadow-2xs"
                            : "bg-white border-slate-100 hover:border-blue-200 hover:bg-blue-50/10"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                              isToday
                                ? "bg-[#0062ff] text-white shadow-md"
                                : isAugust
                                ? "text-slate-800"
                                : "text-slate-400"
                            }`}
                          >
                            {displayDay}
                          </span>
                          {matchingDayEvents.length > 0 && (
                            <span className="px-1.5 py-0.2 rounded-md bg-blue-100 text-[#0062ff] font-bold text-[9px]">
                              {matchingDayEvents.length} lịch
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 mt-1">
                          {matchingDayEvents.slice(0, 2).map((event) => (
                            <div
                              key={event.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEvent(event);
                              }}
                              className={`px-1.5 py-0.5 rounded-md text-[9.5px] font-bold truncate border ${event.cardBg} ${event.cardBorder} ${event.cardText}`}
                            >
                              {event.startTime} {event.candidateName.split(" ").slice(-1)[0]}
                            </div>
                          ))}
                          {matchingDayEvents.length > 2 && (
                            <span className="text-[9px] font-bold text-slate-400 block pl-1">
                              +{matchingDayEvents.length - 2} lịch khác
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* VIEW MODE 4: AGENDA VIEW (DANH MỤC LỊCH TRÌNH)           */}
            {/* ======================================================== */}
            {viewMode === "agenda" && (
              <div className="space-y-4">
                {[
                  { title: "Hôm nay — Thứ Tư, 20/08/2026", filterDay: 3, isToday: true },
                  { title: "Ngày mai — Thứ Năm, 21/08/2026", filterDay: 4, isToday: false },
                  { title: "Thứ Sáu, 22/08/2026", filterDay: 5, isToday: false },
                ].map((group) => {
                  const groupEvents = interviews.filter((iv) => iv.dayOfWeek === group.filterDay);

                  return (
                    <div key={group.title} className="space-y-2.5">
                      <div className="flex items-center gap-2 border-b border-slate-200 pb-1.5">
                        <Calendar className={`w-4 h-4 ${group.isToday ? "text-[#0062ff]" : "text-slate-400"}`} />
                        <h4 className={`text-xs font-bold uppercase tracking-wider m-0 ${group.isToday ? "text-[#0062ff]" : "text-slate-700"}`}>
                          {group.title}
                        </h4>
                        <span className="px-2 py-0.2 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px]">
                          {groupEvents.length} lịch
                        </span>
                      </div>

                      <div className="space-y-2">
                        {groupEvents.map((event) => (
                          <div
                            key={event.id}
                            onClick={() => setSelectedEvent(event)}
                            className={`p-3.5 rounded-2xl border ${event.cardBg} ${event.cardBorder} shadow-2xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-4`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <Avatar src={event.candidateAvatar} size={42} className="border border-white shrink-0 shadow-md" />
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <strong className="text-slate-900 text-sm block truncate">{event.candidateName}</strong>
                                  <span className="px-2 py-0.5 rounded-md bg-white/90 text-blue-800 font-bold text-[10.5px] border border-blue-200">
                                    {event.startTime} – {event.endTime}
                                  </span>
                                </div>
                                <span className="text-xs font-semibold text-slate-700 block">{event.jobTitle} • {event.round} ({event.roundTitle})</span>
                                <span className="text-[11px] text-slate-500 font-medium block">
                                  {event.format === "ONLINE" ? "🎥 Google Meet" : `📍 ${event.locationOrLink}`} • Phỏng vấn cùng {event.interviewerName}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {event.format === "ONLINE" && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    message.info("Đang mở Google Meet...");
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs flex items-center gap-1 shadow-md"
                                >
                                  <Video className="w-3.5 h-3.5" />
                                  <span>Vào họp</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEvaluationCandidate(event);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md"
                              >
                                Đánh giá
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
              </>
            )}
          </div>

          {/* ======================================================== */}
          {/* 4. DANH SÁCH PHỎNG VẤN SẮP TỚI (TABLE)                   */}
          {/* ======================================================== */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs p-3.5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 m-0">
              Danh sách phỏng vấn sắp tới
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[760px] text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Thời gian</th>
                    <th className="py-2.5 px-3">Ứng viên</th>
                    <th className="py-2.5 px-3">Vị trí ứng tuyển</th>
                    <th className="py-2.5 px-3">Vòng</th>
                    <th className="py-2.5 px-3">Người phỏng vấn</th>
                    <th className="py-2.5 px-3">Hình thức</th>
                    <th className="py-2.5 px-3">Phòng / Link</th>
                    <th className="py-2.5 px-3">Trạng thái</th>
                    <th className="py-2.5 px-3 text-right">Thao tác</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {interviews.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        Chưa có lịch phỏng vấn nào sắp tới
                      </td>
                    </tr>
                  ) : (
                    interviews.slice(0, 4).map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedEvent(item)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                    >
                      {/* Thời gian */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-bold text-slate-900 block text-xs">
                          {item.startTime} - {item.endTime}
                        </span>
                        <span className="text-[10.5px] text-slate-400 font-medium block mt-0.5">
                          20/08/2026
                        </span>
                      </td>

                      {/* Ứng viên */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            src={item.candidateAvatar}
                            size={34}
                            className="border border-slate-200 shrink-0 shadow-2xs"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 text-xs block truncate hover:text-[#0062ff]">
                              {item.candidateName}
                            </span>
                            <span className="text-[10.5px] text-slate-400 block truncate">
                              {item.candidateEmail}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Vị trí */}
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-800 text-xs block">
                          {item.jobTitle}
                        </span>
                      </td>

                      {/* Vòng */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-bold text-slate-800 text-xs block">
                          {item.round}
                        </span>
                        <span className="text-[10.5px] text-slate-400 block mt-0.5">
                          ({item.roundTitle})
                        </span>
                      </td>

                      {/* Người phỏng vấn */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-bold text-slate-800 text-xs block">
                          {item.interviewerName}
                        </span>
                        <span className="text-[10.5px] text-slate-400 block mt-0.5">
                          {item.interviewerRole}
                        </span>
                      </td>

                      {/* Hình thức */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-medium text-slate-700">
                          {item.format === "ONLINE" ? "Online" : "Trực tiếp"}
                        </span>
                      </td>

                      {/* Phòng / Link */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {item.format === "ONLINE" ? (
                          <span className="text-[#0062ff] font-medium flex items-center gap-1">
                            <Video className="w-3 h-3" />
                            <span>Google Meet</span>
                          </span>
                        ) : (
                          <span className="text-slate-700 font-medium">
                            {item.locationOrLink}
                          </span>
                        )}
                      </td>

                      {/* Trạng thái */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-blue-50 text-[#0062ff] border border-blue-200">
                          Sắp diễn ra
                        </span>
                      </td>

                      {/* Thao tác */}
                      <td
                        className="py-3 px-3 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip title="Nhắn tin">
                            <button
                              type="button"
                              onClick={() => message.info(`Nhắn tin cho ${item.candidateName}`)}
                              className="p-1.5 hover:bg-blue-50 text-slate-400 hover:text-[#0062ff] rounded-lg cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                          </Tooltip>

                          <Tooltip title="Xem lịch">
                            <button
                              type="button"
                              onClick={() => setSelectedEvent(item)}
                              className="p-1.5 hover:bg-blue-50 text-slate-400 hover:text-[#0062ff] rounded-lg cursor-pointer"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                            </button>
                          </Tooltip>

                          <Dropdown
                            menu={{
                              items: [
                                {
                                  key: "edit",
                                  label: "Chỉnh sửa lịch",
                                  onClick: () => {
                                    setFormCandidateName(item.candidateName);
                                    setIsCreateModalOpen(true);
                                  },
                                },
                                {
                                  key: "evaluate",
                                  label: "Đánh giá ứng viên",
                                  onClick: () => setEvaluationCandidate(item),
                                },
                                {
                                  key: "cancel",
                                  danger: true,
                                  label: "Hủy lịch phỏng vấn",
                                  onClick: () => setCancelCandidate(item),
                                },
                              ],
                            }}
                            trigger={["click"]}
                            placement="bottomRight"
                          >
                            <button
                              type="button"
                              className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                            >
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </button>
                          </Dropdown>
                        </div>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>

            <div className="text-center pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => message.info("Xem toàn bộ danh sách lịch phỏng vấn...")}
                className="text-xs font-bold text-[#0062ff] hover:underline cursor-pointer"
              >
                Xem tất cả lịch phỏng vấn
              </button>
            </div>
          </div>
        </div>

        {/* ====================================================== */}
        {/* RIGHT COLUMN: CALENDAR & REMINDER INSIGHTS (~20%)      */}
        {/* ====================================================== */}
        <div className="xl:col-span-4 2xl:col-span-3 space-y-3">
          {/* Card 1: Tổng quan lịch (Donut Chart) */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 m-0">Tổng quan lịch</h3>
              <Select
                defaultValue="30days"
                size="small"
                className="text-[11px]"
                options={[
                  { value: "30days", label: "30 ngày" },
                  { value: "90days", label: "3 tháng" },
                ]}
              />
            </div>

            {/* Donut Chart */}
            <div className="flex items-center justify-center py-2">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Hoàn thành ~42.9% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#0062ff"
                    strokeWidth="11"
                    strokeDasharray="102.4 238.7"
                    strokeDashoffset="0"
                  />
                  {/* Sắp diễn ra ~28.6% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#38BDF8"
                    strokeWidth="11"
                    strokeDasharray="68.2 238.7"
                    strokeDashoffset="-102.4"
                  />
                  {/* Đang diễn ra ~14.3% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#F97316"
                    strokeWidth="11"
                    strokeDasharray="34.1 238.7"
                    strokeDashoffset="-170.6"
                  />
                  {/* Đã hủy ~9.5% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="11"
                    strokeDasharray="22.7 238.7"
                    strokeDashoffset="-204.7"
                  />
                  {/* Chờ đánh giá ~4.7% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="11"
                    strokeDasharray="11.2 238.7"
                    strokeDashoffset="-227.4"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-base font-black text-slate-900 block leading-tight">
                    42
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    Tổng lịch
                  </span>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-[#0062ff]" />
                  <span>Đã hoàn thành</span>
                </span>
                <span className="font-bold text-slate-900">18 <span className="text-[9.5px] font-normal text-slate-400">(42.9%)</span></span>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
                  <span>Sắp diễn ra</span>
                </span>
                <span className="font-bold text-slate-900">12 <span className="text-[9.5px] font-normal text-slate-400">(28.6%)</span></span>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-[#F97316]" />
                  <span>Đang diễn ra</span>
                </span>
                <span className="font-bold text-slate-900">6 <span className="text-[9.5px] font-normal text-slate-400">(14.3%)</span></span>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                  <span>Đã hủy</span>
                </span>
                <span className="font-bold text-slate-900">4 <span className="text-[9.5px] font-normal text-slate-400">(9.5%)</span></span>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                  <span>Chờ đánh giá</span>
                </span>
                <span className="font-bold text-slate-900">2 <span className="text-[9.5px] font-normal text-slate-400">(4.7%)</span></span>
              </div>
            </div>
          </div>

          {/* Card 2: Phỏng vấn sắp tới */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 m-0">Phỏng vấn sắp tới</h3>
              <span className="text-[11px] font-bold text-[#0062ff] cursor-pointer hover:underline">
                Xem tất cả
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {/* Item 1 */}
              <div
                onClick={() => setSelectedEvent(interviews[5])}
                className="p-2.5 rounded-xl border border-slate-100 hover:border-blue-200 bg-slate-50/50 hover:bg-blue-50/30 transition-all cursor-pointer flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                    size={34}
                    className="border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-blue-600 block">09:00 - 10:00</span>
                    <strong className="text-slate-900 text-xs block truncate">Nguyễn Minh Anh</strong>
                    <span className="text-[10px] text-slate-400 block truncate">Phòng A • Tầng 5</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-blue-50 text-[#0062ff] shrink-0 border border-blue-200">
                  Sắp diễn ra
                </span>
              </div>

              {/* Item 2 */}
              <div
                onClick={() => setSelectedEvent(interviews[6])}
                className="p-2.5 rounded-xl border border-slate-100 hover:border-blue-200 bg-slate-50/50 hover:bg-blue-50/30 transition-all cursor-pointer flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
                    size={34}
                    className="border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-blue-600 block">10:30 - 11:30</span>
                    <strong className="text-slate-900 text-xs block truncate">Phạm Thu Hằng</strong>
                    <span className="text-[10px] text-slate-400 block truncate">Google Meet</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-blue-50 text-[#0062ff] shrink-0 border border-blue-200">
                  Sắp diễn ra
                </span>
              </div>

              {/* Item 3 */}
              <div
                onClick={() => setSelectedEvent(interviews[7])}
                className="p-2.5 rounded-xl border border-slate-100 hover:border-blue-200 bg-slate-50/50 hover:bg-blue-50/30 transition-all cursor-pointer flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar
                    src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80"
                    size={34}
                    className="border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-blue-600 block">13:30 - 14:30</span>
                    <strong className="text-slate-900 text-xs block truncate">Đỗ Thành Tùng</strong>
                    <span className="text-[10px] text-slate-400 block truncate">Phòng A • Tầng 5</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-blue-50 text-[#0062ff] shrink-0 border border-blue-200">
                  Sắp diễn ra
                </span>
              </div>

              {/* Item 4 */}
              <div
                onClick={() => setSelectedEvent(interviews[1])}
                className="p-2.5 rounded-xl border border-slate-100 hover:border-blue-200 bg-slate-50/50 hover:bg-blue-50/30 transition-all cursor-pointer flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                    size={34}
                    className="border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-amber-600 block">15:30 - 16:30</span>
                    <strong className="text-slate-900 text-xs block truncate">Trần Hoàng Nam</strong>
                    <span className="text-[10px] text-slate-400 block truncate">Phòng B • Tầng 5</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-amber-50 text-amber-700 shrink-0 border border-amber-200">
                  Chờ
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Nhắc nhở */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs p-3.5 space-y-2.5">
            <h3 className="text-xs font-black text-slate-900 m-0">Nhắc nhở</h3>

            <div className="space-y-2 text-xs">
              <div
                onClick={() => message.info("Lọc 3 lịch phỏng vấn trong hôm nay")}
                className="p-2.5 bg-blue-50/60 hover:bg-blue-100/70 rounded-xl border border-blue-100 flex items-center justify-between text-blue-900 font-bold transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span>🔔</span>
                  <span>3 lịch phỏng vấn trong hôm nay</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-blue-500" />
              </div>

              <div
                onClick={() => message.info("Lọc 5 ứng viên đang chờ đánh giá")}
                className="p-2.5 bg-amber-50/60 hover:bg-amber-100/70 rounded-xl border border-amber-100 flex items-center justify-between text-amber-900 font-bold transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span>🔔</span>
                  <span>5 ứng viên chờ đánh giá</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-amber-500" />
              </div>

              <div
                onClick={() => message.info("Phát hiện 2 lịch trùng phòng họp!")}
                className="p-2.5 bg-rose-50/60 hover:bg-rose-100/70 rounded-xl border border-rose-100 flex items-center justify-between text-rose-900 font-bold transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span>🔔</span>
                  <span>2 lịch phỏng vấn bị trùng thời gian</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-rose-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 5. CENTER MODALS                                                      */}
      {/* ===================================================================== */}

      {/* Modal 1: Chi tiết lịch phỏng vấn */}
      <Modal
        open={!!selectedEvent}
        onCancel={() => setSelectedEvent(null)}
        footer={null}
        width={580}
        centered
        destroyOnHidden
        closable={false}
        title={null}
      >
        {selectedEvent && (
          <div className="space-y-4 p-1 text-xs">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar
                  src={selectedEvent.candidateAvatar}
                  size={48}
                  className="border border-slate-200 shrink-0 shadow-md"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-slate-900 m-0">
                      {selectedEvent.candidateName}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-blue-50 text-[#0062ff] border border-blue-200">
                      Sắp diễn ra
                    </span>
                  </div>
                  <span className="text-xs text-[#0062ff] font-bold block mt-0.5">
                    {selectedEvent.jobTitle}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium block truncate">
                    {selectedEvent.candidateEmail} • {selectedEvent.candidatePhone || "0345 678 901"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <div>
                <span className="text-slate-400 block text-[11px]">Thời gian phỏng vấn:</span>
                <strong className="text-slate-800 text-xs">
                  {selectedEvent.startTime} – {selectedEvent.endTime} • {selectedEvent.date}
                </strong>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Vòng tuyển dụng:</span>
                <strong className="text-slate-800 text-xs">
                  {selectedEvent.round} ({selectedEvent.roundTitle})
                </strong>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Hình thức & Địa điểm:</span>
                <strong className="text-slate-800 text-xs">
                  {selectedEvent.format === "ONLINE" ? "Online (Google Meet)" : selectedEvent.locationOrLink}
                </strong>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Người phỏng vấn:</span>
                <strong className="text-slate-800 text-xs">
                  {selectedEvent.interviewerName} ({selectedEvent.interviewerRole})
                </strong>
              </div>
            </div>

            {selectedEvent.notes && (
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-800 block mb-1">Ghi chú:</span>
                <p className="m-0 italic text-[11.5px]">{selectedEvent.notes}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs"
              >
                Đóng
              </button>

              <div className="flex items-center gap-2 flex-wrap">
                {selectedEvent.applicationId && (
                  <Link
                    href={`/doanh-nghiep/ung-vien/${selectedEvent.applicationId}`}
                    className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0062ff] border border-blue-200 font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Hồ sơ ứng viên</span>
                  </Link>
                )}

                {selectedEvent.status !== "CANCELLED" && (
                  <button
                    type="button"
                    onClick={() => {
                      setRescheduleEvent(selectedEvent);
                      setRescheduleDate(selectedEvent.date);
                      setRescheduleTime(selectedEvent.startTime);
                      setRescheduleDuration(selectedEvent.durationHours * 60 || 45);
                      setRescheduleNote("");
                    }}
                    className="px-3.5 py-2 rounded-xl border border-amber-200 text-amber-700 hover:bg-amber-50 font-bold text-xs cursor-pointer"
                  >
                    Dời lịch
                  </button>
                )}

                {selectedEvent.status !== "COMPLETED" && selectedEvent.status !== "CANCELLED" && (
                  <button
                    type="button"
                    onClick={() => handleMarkCompleted(selectedEvent)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs cursor-pointer"
                  >
                    Đã hoàn thành
                  </button>
                )}

                {selectedEvent.status !== "CANCELLED" && (
                  <button
                    type="button"
                    onClick={() => {
                      setCancelCandidate(selectedEvent);
                    }}
                    className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs cursor-pointer"
                  >
                    Hủy lịch
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setEvaluationCandidate(selectedEvent)}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md cursor-pointer"
                >
                  Đánh giá ứng viên
                </button>

                {selectedEvent.format === "ONLINE" && selectedEvent.locationOrLink && (
                  <button
                    type="button"
                    onClick={() => {
                      const url = selectedEvent.locationOrLink.startsWith("http")
                        ? selectedEvent.locationOrLink
                        : `https://${selectedEvent.locationOrLink}`;
                      window.open(url, "_blank");
                    }}
                    className="px-4 py-2 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Phòng họp</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal 2: Tạo lịch phỏng vấn */}
      <Modal
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        footer={null}
        width={580}
        centered
        destroyOnHidden
        closable={false}
        title={null}
      >
        <div className="space-y-4 p-1 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0062ff] flex items-center justify-center shadow-2xs">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 m-0">Tạo lịch phỏng vấn mới</h3>
                <span className="text-xs text-slate-500 font-medium">
                  Xếp lịch và thông báo tự động cho ứng viên & người phỏng vấn
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Conflict Warning */}
          {hasConflictWarning && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-xs">Cảnh báo trùng lịch phỏng vấn!</strong>
                <span className="text-[11px] block mt-0.5">
                  Người phỏng vấn đã có một lịch hẹn khác trong khung giờ này. Vui lòng kiểm tra lại.
                </span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {applications.length > 0 && (
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Hồ sơ ứng tuyển từ hệ thống (nếu có)
                </label>
                <Select
                  placeholder="-- Chọn ứng viên đã nộp đơn --"
                  className="w-full text-xs"
                  allowClear
                  value={formApplicationId}
                  onChange={(val) => {
                    setFormApplicationId(val);
                    if (val) {
                      const app = applications.find((a) => a.id === val);
                      if (app) {
                        setFormCandidateName(app.candidate?.full_name || app.candidate_name || "");
                        if (app.job?.title) setFormJobTitle(app.job.title);
                      }
                    }
                  }}
                  options={applications.map((app: any) => ({
                    value: app.id,
                    label: `${app.candidate?.full_name || app.candidate_name || "Ứng viên"} - ${app.job?.title || "Vị trí ứng tuyển"}`,
                  }))}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tên ứng viên *</label>
                <Input
                  value={formCandidateName}
                  onChange={(e) => setFormCandidateName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Minh Anh"
                  className="rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Vị trí ứng tuyển *</label>
                <Input
                  value={formJobTitle}
                  onChange={(e) => setFormJobTitle(e.target.value)}
                  placeholder="Ví dụ: Frontend Developer"
                  className="rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Ngày phỏng vấn *</label>
                <Input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Giờ bắt đầu *</label>
                <Select
                  value={formStartTime}
                  onChange={setFormStartTime}
                  className="w-full text-xs"
                  options={TIME_SLOTS.map((t) => ({ value: t, label: t }))}
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Giờ kết thúc *</label>
                <Select
                  value={formEndTime}
                  onChange={setFormEndTime}
                  className="w-full text-xs"
                  options={TIME_SLOTS.map((t) => ({ value: t, label: t }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Hình thức *</label>
                <Select
                  value={formFormat}
                  onChange={(val) => {
                    setFormFormat(val);
                    if (val === "ONLINE") setFormLocationOrLink("https://meet.google.com/xyz-careza");
                    else setFormLocationOrLink("Phòng A • Tầng 5");
                  }}
                  className="w-full text-xs"
                  options={[
                    { value: "OFFLINE", label: "Trực tiếp tại văn phòng" },
                    { value: "ONLINE", label: "Online (Google Meet)" },
                    { value: "PHONE", label: "Phỏng vấn qua điện thoại" },
                  ]}
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {formFormat === "ONLINE" ? "Meeting Link:" : "Địa điểm / Phòng họp:"}
                </label>
                <Input
                  value={formLocationOrLink}
                  onChange={(e) => setFormLocationOrLink(e.target.value)}
                  className="rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Người phỏng vấn (Interviewer) *</label>
              <Select
                value={formInterviewer}
                onChange={setFormInterviewer}
                className="w-full text-xs"
                options={[
                  { value: "Phạm Văn Hùng (Hiring Manager)", label: "Phạm Văn Hùng (Hiring Manager)" },
                  { value: "Lê Minh Quân (Tech Lead)", label: "Lê Minh Quân (Tech Lead)" },
                  { value: "Nguyễn Thu Trang (HR Manager)", label: "Nguyễn Thu Trang (HR Manager)" },
                ]}
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Ghi chú gửi ứng viên</label>
              <Input.TextArea
                rows={2}
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Nhập nội dung cần chuẩn bị trước buổi phỏng vấn..."
                className="rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirmCreateInterview}
              className="px-5 py-2 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs shadow-md cursor-pointer"
            >
              Tạo lịch phỏng vấn
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal 3: Đánh giá ứng viên */}
      <Modal
        open={!!evaluationCandidate}
        onCancel={() => setEvaluationCandidate(null)}
        footer={null}
        width={500}
        centered
        destroyOnHidden
        closable={false}
        title={null}
      >
        {evaluationCandidate && (
          <div className="space-y-4 p-1 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-2xs">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 m-0">Đánh giá sau phỏng vấn</h3>
                  <span className="text-xs text-slate-500 font-medium">
                    {evaluationCandidate.candidateName} • {evaluationCandidate.jobTitle}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEvaluationCandidate(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-semibold text-slate-700">Chuyên môn & Kỹ thuật:</span>
                <Rate value={evalTechScore} onChange={setEvalTechScore} className="text-amber-400 text-sm" />
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-semibold text-slate-700">Giao tiếp & Tư duy logic:</span>
                <Rate value={evalCommScore} onChange={setEvalCommScore} className="text-amber-400 text-sm" />
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-semibold text-slate-700">Phù hợp văn hóa công ty:</span>
                <Rate value={evalCultureScore} onChange={setEvalCultureScore} className="text-amber-400 text-sm" />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nhận xét & Ghi chú nội bộ (không hiển thị cho ứng viên):
                </label>
                <Input.TextArea
                  rows={3}
                  value={evalNotes}
                  onChange={(e) => setEvalNotes(e.target.value)}
                  placeholder="Ghi nhận điểm mạnh, điểm yếu, phản hồi của hội đồng tuyển dụng..."
                  className="rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEvaluationCandidate(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isSubmittingEval}
                onClick={handleSaveScorecard}
                className="px-5 py-2 rounded-xl bg-[#0062ff] text-white font-bold text-xs shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isSubmittingEval ? "Đang lưu..." : "Lưu đánh giá"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal 4: Xác nhận hủy lịch phỏng vấn */}
      <Modal
        open={!!cancelCandidate}
        onCancel={() => setCancelCandidate(null)}
        footer={null}
        width={480}
        centered
        destroyOnHidden
        closable={false}
        title={null}
      >
        {cancelCandidate && (
          <div className="space-y-4 p-1 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-2xs">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 m-0">Hủy lịch phỏng vấn?</h3>
                  <span className="text-xs text-slate-500 font-medium">
                    {cancelCandidate.candidateName} • {cancelCandidate.startTime} – {cancelCandidate.endTime}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCancelCandidate(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-100 text-rose-900 leading-relaxed">
              Bạn có chắc chắn muốn hủy lịch hẹn phỏng vấn này? Hệ thống sẽ gửi thông báo hệ thống đến ứng viên.
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Lý do hủy lịch:</label>
              <Select
                value={cancelReason}
                onChange={setCancelReason}
                className="w-full text-xs"
                options={[
                  { value: "Người phỏng vấn bận lịch đột xuất", label: "Người phỏng vấn bận lịch đột xuất" },
                  { value: "Ứng viên yêu cầu dời lịch hẹn", label: "Ứng viên yêu cầu dời lịch hẹn" },
                  { value: "Vị trí tuyển dụng đã đủ chỉ tiêu", label: "Vị trí tuyển dụng đã đủ chỉ tiêu" },
                  { value: "Thay đổi kế hoạch tuyển dụng", label: "Thay đổi kế hoạch tuyển dụng" },
                ]}
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCancelCandidate(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Quay lại
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleConfirmCancelInterview}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md cursor-pointer disabled:opacity-50"
              >
                {isCancelling ? "Đang hủy..." : "Xác nhận hủy lịch"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal 6: Đổi / Dời lịch phỏng vấn */}
      <Modal
        open={!!rescheduleEvent}
        onCancel={() => setRescheduleEvent(null)}
        footer={null}
        width={480}
        centered
        destroyOnHidden
        closable={false}
        title={null}
      >
        {rescheduleEvent && (
          <div className="space-y-4 p-1 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-2xs">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 m-0">Dời / Đổi lịch phỏng vấn</h3>
                  <span className="text-xs text-slate-500 font-medium">
                    {rescheduleEvent.candidateName} • Lịch cũ: {rescheduleEvent.date} ({rescheduleEvent.startTime})
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setRescheduleEvent(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Ngày phỏng vấn mới *</label>
                <Input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Giờ bắt đầu mới *</label>
                  <Select
                    value={rescheduleTime}
                    onChange={setRescheduleTime}
                    className="w-full text-xs"
                    options={TIME_SLOTS.map((t) => ({ value: t, label: t }))}
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Thời lượng (phút)</label>
                  <Select
                    value={rescheduleDuration}
                    onChange={setRescheduleDuration}
                    className="w-full text-xs"
                    options={[
                      { value: 30, label: "30 phút" },
                      { value: 45, label: "45 phút" },
                      { value: 60, label: "60 phút" },
                      { value: 90, label: "90 phút" },
                    ]}
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Lý do dời lịch / Ghi chú:</label>
                <Input.TextArea
                  rows={2}
                  value={rescheduleNote}
                  onChange={(e) => setRescheduleNote(e.target.value)}
                  placeholder="Lý do thay đổi thời gian phỏng vấn..."
                  className="rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRescheduleEvent(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isSubmittingReschedule}
                onClick={handleConfirmReschedule}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSubmittingReschedule ? "Đang lưu..." : "Xác nhận dời lịch"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal 5: Bộ lọc nâng cao */}
      <Modal
        open={isFilterModalOpen}
        onCancel={() => setIsFilterModalOpen(false)}
        footer={null}
        width={440}
        centered
        destroyOnHidden
        closable={false}
        title={null}
      >
        <div className="space-y-4 p-1 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 m-0">Bộ lọc lịch phỏng vấn</h3>
            <button
              type="button"
              onClick={() => setIsFilterModalOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Vị trí tuyển dụng:</label>
            <Select
              defaultValue="all"
              className="w-full"
              options={[
                { value: "all", label: "Tất cả vị trí" },
                { value: "Product Manager", label: "Product Manager" },
                { value: "UX/UI Designer", label: "UX/UI Designer" },
                { value: "Frontend Developer", label: "Frontend Developer" },
              ]}
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Người phỏng vấn:</label>
            <Select
              defaultValue="all"
              className="w-full"
              options={[
                { value: "all", label: "Tất cả người phỏng vấn" },
                { value: "hung", label: "Phạm Văn Hùng (Hiring Manager)" },
                { value: "quan", label: "Lê Minh Quân (Tech Lead)" },
                { value: "trang", label: "Nguyễn Thu Trang (HR Lead)" },
              ]}
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Hình thức:</label>
            <Select
              defaultValue="all"
              className="w-full"
              options={[
                { value: "all", label: "Tất cả hình thức" },
                { value: "OFFLINE", label: "Trực tiếp tại văn phòng" },
                { value: "ONLINE", label: "Online (Google Meet)" },
              ]}
            />
          </div>

          <div className="pt-3 flex items-center gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsFilterModalOpen(false)}
              className="flex-1 py-2 rounded-xl bg-[#0062ff] text-white font-bold text-xs shadow-md"
            >
              Áp dụng
            </button>
            <button
              type="button"
              onClick={() => setIsFilterModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
            >
              Đặt lại
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function EmployerInterviewPage() {
  return (
    <App>
      <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400 font-bold">Đang tải Lịch phỏng vấn...</div>}>
        <EmployerInterviewContent />
      </Suspense>
    </App>
  );
}
