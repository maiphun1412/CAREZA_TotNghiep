"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { employerService } from "@/services/employer.service";
import {
  Spin,
  Tag,
  Avatar,
  Select,
  Input,
  Button,
  message,
  Timeline,
  Progress,
  Modal,
  Card,
  Tooltip,
} from "antd";
import {
  ArrowLeft,
  Mail,
  Phone,
  Briefcase,
  FileText,
  Calendar,
  Sparkles,
  CheckCircle,
  XCircle,
  Clock,
  User,
  ExternalLink,
  Download,
  AlertCircle,
  Eye,
  ShieldCheck,
  Send,
  MessageSquare,
  Video,
  MapPin,
  CalendarPlus,
  Star,
  Award,
  FileCheck,
} from "lucide-react";

const { TextArea } = Input;

export default function EmployerCandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const applicationId = resolvedParams.id;

  const [loading, setLoading] = useState(true);
  const [appData, setAppData] = useState<any>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedNewStatus, setSelectedNewStatus] = useState<string>("");
  const [statusNote, setStatusNote] = useState<string>("");

  // State Modal Lên lịch phỏng vấn
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [submittingSchedule, setSubmittingSchedule] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    scheduled_at: "",
    duration_minutes: 45,
    mode: "online",
    meeting_url: "",
    notes: "",
  });

  // State Modal Đánh giá Scorecard
  const [isScorecardModalOpen, setIsScorecardModalOpen] = useState(false);
  const [submittingScorecard, setSubmittingScorecard] = useState(false);
  const [scorecardForm, setScorecardForm] = useState({
    technical_score: 8,
    communication_score: 8,
    culture_score: 8,
    notes: "",
  });

  // State Modal Tạo Offer
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [offerForm, setOfferForm] = useState({
    salary: "",
    start_date: "",
    deadline: "",
    contract_type: "Toàn thời gian chính thức",
    work_location: "",
    notes: "",
    terms: "- Thử việc 85% lương trong 2 tháng\n- Đóng BHXH/BHYT đầy đủ theo luật\n- Thưởng hiệu quả quý & năm",
  });

  const fetchApplicationDetail = async () => {
    setLoading(true);
    try {
      const res = await employerService.getApplicationById(applicationId);
      if (res?.data?.application) {
        setAppData(res.data.application);
        setSelectedNewStatus(res.data.application.status || "submitted");
      } else {
        setAppData(null);
      }
    } catch {
      setAppData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationDetail();
  }, [applicationId]);

  const handleUpdateStatus = async () => {
    if (!selectedNewStatus) return;
    setUpdatingStatus(true);
    try {
      await employerService.changeStage(applicationId, selectedNewStatus, statusNote.trim() || undefined);
      message.success("Đã cập nhật trạng thái hồ sơ tuyển dụng!");
      setStatusNote("");
      await fetchApplicationDetail();
    } catch {
      message.error("Không thể cập nhật trạng thái lúc này. Vui lòng thử lại!");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCreateInterview = async () => {
    if (!scheduleForm.scheduled_at) {
      message.warning("Vui lòng chọn ngày và giờ phỏng vấn.");
      return;
    }
    setSubmittingSchedule(true);
    try {
      const res = await employerService.createInterview({
        application_id: Number(applicationId),
        scheduled_at: scheduleForm.scheduled_at,
        duration_minutes: Number(scheduleForm.duration_minutes),
        mode: scheduleForm.mode,
        meeting_url: scheduleForm.meeting_url.trim() || undefined,
        notes: scheduleForm.notes.trim() || undefined,
      });

      if ((res as any)?.has_conflict) {
        message.warning((res as any)?.conflict_message || "Đã tạo lịch nhưng phát hiện trùng giờ phỏng vấn!");
      } else {
        message.success("Đã lên lịch phỏng vấn và gửi thông báo tới ứng viên!");
      }

      setIsScheduleModalOpen(false);
      setScheduleForm({
        scheduled_at: "",
        duration_minutes: 45,
        mode: "online",
        meeting_url: "",
        notes: "",
      });
      await fetchApplicationDetail();
    } catch (err: any) {
      const errDetail = err?.response?.data?.error || "Không thể tạo lịch phỏng vấn. Vui lòng kiểm tra lại.";
      message.error(errDetail);
    } finally {
      setSubmittingSchedule(false);
    }
  };

  const handleAddScorecard = async () => {
    setSubmittingScorecard(true);
    try {
      await employerService.addScorecard({
        application_id: Number(applicationId),
        technical_score: Number(scorecardForm.technical_score),
        communication_score: Number(scorecardForm.communication_score),
        culture_score: Number(scorecardForm.culture_score),
        notes: scorecardForm.notes.trim() || undefined,
      });
      message.success("Ghi nhận đánh giá ứng viên thành công!");
      setIsScorecardModalOpen(false);
      setScorecardForm({
        technical_score: 8,
        communication_score: 8,
        culture_score: 8,
        notes: "",
      });
      await fetchApplicationDetail();
    } catch {
      message.error("Không thể lưu đánh giá lúc này. Vui lòng thử lại!");
    } finally {
      setSubmittingScorecard(false);
    }
  };

  const handleSaveOffer = async (status: "draft" | "sent") => {
    const cleanSalary = Number(String(offerForm.salary).replace(/\D/g, ""));
    if (!cleanSalary || cleanSalary <= 0) {
      message.warning("Vui lòng nhập mức lương hợp lệ.");
      return;
    }
    if (!offerForm.start_date) {
      message.warning("Vui lòng chọn ngày bắt đầu làm việc.");
      return;
    }

    setSubmittingOffer(true);
    try {
      await employerService.createOffer({
        application_id: Number(applicationId),
        salary: cleanSalary,
        start_date: offerForm.start_date,
        deadline: offerForm.deadline || undefined,
        contract_type: offerForm.contract_type,
        work_location: offerForm.work_location.trim() || undefined,
        position: appData?.job?.title || undefined,
        notes: offerForm.notes.trim() || undefined,
        terms: offerForm.terms.trim() || undefined,
        status: status,
      });

      if (status === "draft") {
        message.info("Đã lưu bản nháp Offer thành công!");
      } else {
        message.success("Đã gửi thư mời nhận việc (Offer) thành công đến ứng viên!");
      }
      setIsOfferModalOpen(false);
      await fetchApplicationDetail();
    } catch (err: any) {
      message.error(err?.response?.data?.error || "Không thể tạo thư mời nhận việc.");
    } finally {
      setSubmittingOffer(false);
    }
  };

  const handleSendDraftOffer = async (offerId: number | string) => {
    try {
      await employerService.sendOffer(offerId);
      message.success("Đã gửi thư mời nhận việc chính thức đến ứng viên!");
      await fetchApplicationDetail();
    } catch (err: any) {
      message.error(err?.response?.data?.error || "Không thể gửi thư mời.");
    }
  };

  const handleCancelOffer = async (offerId: number | string) => {
    try {
      await employerService.cancelOffer(offerId, "Doanh nghiệp chủ động thu hồi");
      message.warning("Đã thu hồi thư mời nhận việc.");
      await fetchApplicationDetail();
    } catch (err: any) {
      message.error(err?.response?.data?.error || "Không thể thu hồi thư mời.");
    }
  };

  const getStatusBadge = (status: string) => {
    const s = String(status || "").toLowerCase();
    switch (s) {
      case "submitted":
      case "new":
        return <Tag color="blue" className="rounded-md font-bold px-2 py-0.5">Mới nộp</Tag>;
      case "screening":
      case "reviewing":
        return <Tag color="purple" className="rounded-md font-bold px-2 py-0.5">Đang sàng lọc</Tag>;
      case "shortlisted":
      case "test":
      case "matched":
        return <Tag color="cyan" className="rounded-md font-bold px-2 py-0.5">Phù hợp / Test</Tag>;
      case "interview":
        return <Tag color="orange" className="rounded-md font-bold px-2 py-0.5">Phỏng vấn</Tag>;
      case "offered":
      case "offer":
        return <Tag color="gold" className="rounded-md font-bold px-2 py-0.5">Đã gửi Offer</Tag>;
      case "hired":
      case "accepted":
        return <Tag color="green" className="rounded-md font-bold px-2 py-0.5">Đã tuyển dụng</Tag>;
      case "rejected":
        return <Tag color="red" className="rounded-md font-bold px-2 py-0.5">Từ chối</Tag>;
      case "withdrawn":
        return <Tag color="default" className="rounded-md font-bold px-2 py-0.5">Ứng viên rút đơn</Tag>;
      default:
        return <Tag color="blue" className="rounded-md font-bold px-2 py-0.5">{status}</Tag>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40 min-h-[60vh]">
        <Spin size="large" />
      </div>
    );
  }

  if (!appData) {
    return (
      <div className="max-w-2xl mx-auto py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Không tìm thấy hồ sơ ứng tuyển</h2>
        <p className="text-xs text-slate-500">
          Đơn ứng tuyển này không tồn tại hoặc bạn không có quyền truy cập trong doanh nghiệp.
        </p>
        <Link
          href="/doanh-nghiep/ung-vien"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0062ff] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#0052cc] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách ứng viên</span>
        </Link>
      </div>
    );
  }

  const { candidate, job, cv, cover_letter, match_info, match_score, histories } = appData;
  const cvSnapshot = cv?.snapshot;
  const cvContent = cvSnapshot?.content || cv?.parsed_data || {};
  const isStudio = Boolean(cvContent?.templateId || cvContent?.cvData || cvContent?.type === "studio");
  const cvDataInfo = cvContent?.cvData || cvContent;

  return (
    <div className="max-w-[1520px] mx-auto space-y-5 pb-10">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href="/doanh-nghiep/ung-vien"
            className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
            title="Quay lại danh sách"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 m-0">
                {candidate?.full_name || "Ứng viên"}
              </h1>
              {getStatusBadge(appData.status)}
            </div>
            <p className="text-xs text-slate-500 m-0 mt-0.5">
              Ứng tuyển vị trí:{" "}
              <span className="font-bold text-[#0062ff]">{job?.title}</span> • Nộp lúc{" "}
              {appData.applied_at ? new Date(appData.applied_at).toLocaleString("vi-VN") : "Gần đây"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {cv?.file_url && (
            <a
              href={cv.file_url}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải CV đã nộp</span>
            </a>
          )}
          <Link
            href={`/doanh-nghiep/chat?candidateId=${candidate?.id}`}
            className="px-3.5 py-2 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-xs"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Nhắn tin</span>
          </Link>
        </div>
      </div>

      {/* 2. Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Candidate Info & CV Content (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Card: Thông tin ứng viên */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 m-0 flex items-center gap-2">
                <User className="w-4 h-4 text-[#0062ff]" />
                <span>Thông tin cá nhân ứng viên</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 block font-medium">Họ và tên</span>
                <span className="font-bold text-slate-800 text-sm block">
                  {candidate?.full_name || "Chưa cập nhật"}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 block font-medium">Chức danh / Headline</span>
                <span className="font-bold text-slate-800 block">
                  {candidate?.headline || "Ứng viên chuyên nghiệp"}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 block font-medium">Email liên hệ</span>
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{candidate?.email || "Chưa cập nhật"}</span>
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 block font-medium">Số điện thoại</span>
                <span className="font-bold text-slate-800 flex items-center gap-1.5 font-mono">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{candidate?.phone || "Chưa cập nhật"}</span>
                </span>
              </div>
            </div>

            {candidate?.bio && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-400 block text-xs font-medium mb-1">Giới thiệu bản thân</span>
                <p className="text-xs text-slate-700 font-medium m-0 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {candidate.bio}
                </p>
              </div>
            )}
          </div>

          {/* Card: Thư giới thiệu (Cover Letter) nếu có */}
          {cover_letter && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
              <h3 className="text-sm font-black text-slate-900 m-0 flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-600" />
                <span>Thư giới thiệu từ ứng viên (Cover Letter)</span>
              </h3>
              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                {cover_letter}
              </div>
            </div>
          )}

          {/* Card: Bản snapshot CV đã nộp */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-slate-900 m-0 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span>Hồ sơ CV đã nộp (Snapshot nguyên bản)</span>
                </h3>
                <span className="text-[11px] text-slate-400 block">
                  Bản ghi snapshot tại thời điểm nộp đơn • Được bảo vệ nguyên vẹn ngay cả khi ứng viên sửa hoặc xóa CV nguồn
                </span>
              </div>

              {cv?.file_url && (
                <button
                  type="button"
                  onClick={() => window.open(cv.file_url, "_blank")}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 text-[#0062ff] text-xs font-bold hover:bg-blue-100 transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Mở file CV</span>
                </button>
              )}
            </div>

            {/* Thông tin snapshot header */}
            <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">{cv?.title || "CV Ứng viên"}</span>
                {cvSnapshot?.version_number && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700">
                    Phiên bản v{cvSnapshot.version_number}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                  {isStudio ? "CV Studio" : "CV Tải lên (PDF/DOCX)"}
                </span>
              </div>

              <span className="text-slate-400 text-[11px]">
                Thời điểm lưu vết: {appData.applied_at ? new Date(appData.applied_at).toLocaleDateString("vi-VN") : "Gần đây"}
              </span>
            </div>

            {/* Nội dung chi tiết nếu là CV Studio hoặc có parsed_data */}
            {isStudio && cvDataInfo?.sections ? (
              <div className="space-y-4 pt-2">
                {/* Giới thiệu */}
                {cvDataInfo?.personal?.summary && (
                  <div className="space-y-1">
                    <span className="font-bold text-slate-800 text-xs block">Tóm tắt mục tiêu & giới thiệu:</span>
                    <p className="text-xs text-slate-600 m-0 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {cvDataInfo.personal.summary}
                    </p>
                  </div>
                )}

                {/* Kinh nghiệm làm việc */}
                {Array.isArray(cvDataInfo?.experience) && cvDataInfo.experience.length > 0 && (
                  <div className="space-y-2">
                    <span className="font-bold text-slate-800 text-xs block">Kinh nghiệm làm việc:</span>
                    <div className="space-y-2">
                      {cvDataInfo.experience.map((exp: any, idx: number) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                          <div className="flex justify-between items-center font-bold text-slate-800">
                            <span>{exp.position} - {exp.company}</span>
                            <span className="text-slate-400 font-normal">{exp.period || exp.duration}</span>
                          </div>
                          {exp.description && <p className="text-slate-600 m-0 leading-relaxed">{exp.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Học vấn */}
                {Array.isArray(cvDataInfo?.education) && cvDataInfo.education.length > 0 && (
                  <div className="space-y-2">
                    <span className="font-bold text-slate-800 text-xs block">Học vấn:</span>
                    <div className="space-y-2">
                      {cvDataInfo.education.map((edu: any, idx: number) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                          <div className="flex justify-between items-center font-bold text-slate-800">
                            <span>{edu.school || edu.institution}</span>
                            <span className="text-slate-400 font-normal">{edu.period || edu.year}</span>
                          </div>
                          <p className="text-slate-600 m-0">{edu.major} {edu.degree ? `(${edu.degree})` : ""}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Kỹ năng */}
                {Array.isArray(cvDataInfo?.skills) && cvDataInfo.skills.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-800 text-xs block">Kỹ năng:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {cvDataInfo.skills.map((skill: any, idx: number) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#0062ff] font-bold text-xs border border-blue-100">
                          {typeof skill === "string" ? skill : skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : cv?.file_url ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
                <FileText className="w-10 h-10 text-blue-500 mx-auto" />
                <div>
                  <h4 className="font-bold text-slate-800 text-sm m-0">Tệp hồ sơ đính kèm</h4>
                  <p className="text-xs text-slate-400 m-0 mt-0.5">
                    Hồ sơ được ứng viên tải lên định dạng PDF/DOCX
                  </p>
                </div>
                <div className="flex justify-center gap-2 pt-2">
                  <a
                    href={cv.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-[#0062ff] hover:bg-[#0052cc] text-white rounded-xl text-xs font-bold shadow-xs inline-flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Xem toàn bộ CV trong tab mới</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">
                Nội dung CV đã được ghi nhận vào hệ thống hồ sơ tuyển dụng.
              </div>
            )}
          </div>

          {/* Card: Lịch phỏng vấn ứng viên */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#0062ff]" />
                <h3 className="text-sm font-black text-slate-900 m-0">
                  Lịch phỏng vấn ứng viên
                </h3>
                {Array.isArray(appData.interviews) && appData.interviews.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#0062ff] border border-blue-100">
                    {appData.interviews.length}
                  </span>
                )}
              </div>

              {!["rejected", "withdrawn"].includes(String(appData.status).toLowerCase()) && (
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                  <span>Lên lịch phỏng vấn</span>
                </button>
              )}
            </div>

            {Array.isArray(appData.interviews) && appData.interviews.length > 0 ? (
              <div className="space-y-3">
                {appData.interviews.map((iv: any) => {
                  const ivStatus = String(iv.status || "").toLowerCase();
                  const isConfirmed = ivStatus === "confirmed";
                  const isCompleted = ivStatus === "completed";
                  const isCancelled = ivStatus === "cancelled";

                  return (
                    <div
                      key={iv.id}
                      className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all space-y-2.5"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-800">
                            {iv.scheduled_at
                              ? new Date(iv.scheduled_at).toLocaleString("vi-VN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                })
                              : "Chưa xác định"}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            ({iv.duration_minutes || 45} phút)
                          </span>
                        </div>

                        <div>
                          {isConfirmed ? (
                            <Tag color="green" className="m-0 rounded-md font-bold text-[10px]">
                              Ứng viên đã xác nhận
                            </Tag>
                          ) : isCompleted ? (
                            <Tag color="default" className="m-0 rounded-md font-bold text-[10px]">
                              Đã hoàn thành
                            </Tag>
                          ) : isCancelled ? (
                            <Tag color="red" className="m-0 rounded-md font-bold text-[10px]">
                              Đã hủy
                            </Tag>
                          ) : (
                            <Tag color="blue" className="m-0 rounded-md font-bold text-[10px]">
                              Chờ xác nhận
                            </Tag>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          {iv.mode === "online" ? (
                            <Video className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          ) : (
                            <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          )}
                          <span className="font-semibold">
                            {iv.mode === "online" ? "Trực tuyến (Online)" : "Trực tiếp (Offline)"}
                          </span>
                        </div>

                        {iv.interviewer_name && (
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>Người phỏng vấn: <strong className="text-slate-800">{iv.interviewer_name}</strong></span>
                          </div>
                        )}
                      </div>

                      {iv.meeting_url && (
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-slate-500 text-[11px]">Địa điểm / Link họp:</span>
                          <a
                            href={iv.meeting_url.startsWith("http") ? iv.meeting_url : `https://${iv.meeting_url}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#0062ff] text-xs font-bold hover:underline inline-flex items-center gap-1 truncate max-w-[320px]"
                          >
                            <ExternalLink className="w-3 h-3 shrink-0" />
                            <span className="truncate">{iv.meeting_url}</span>
                          </a>
                        </div>
                      )}

                      {iv.notes && (
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 text-xs text-slate-600 leading-relaxed">
                          <strong className="text-slate-700 block mb-0.5">Ghi chú:</strong>
                          <span>{iv.notes}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400 space-y-1">
                <Clock className="w-6 h-6 mx-auto text-slate-300" />
                <p className="text-xs font-medium m-0">Chưa có lịch phỏng vấn nào cho hồ sơ này.</p>
              </div>
            )}
          </div>

          {/* Card: Đánh giá sau phỏng vấn (Scorecards) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-black text-slate-900 m-0">
                    Đánh giá sau phỏng vấn (Scorecards)
                  </h3>
                  <Tag color="purple" className="m-0 rounded-full font-bold text-[10px]">
                    Nội bộ
                  </Tag>
                </div>
                <span className="text-[11px] text-slate-400 block">
                  Phiếu nhận xét & chấm điểm bảo mật • Ứng viên không nhìn thấy nội dung này
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsScorecardModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Star className="w-3.5 h-3.5" />
                <span>Ghi nhận đánh giá</span>
              </button>
            </div>

            {Array.isArray(appData.scorecards) && appData.scorecards.length > 0 ? (
              <div className="space-y-3">
                {appData.scorecards.map((sc: any) => {
                  const tech = Number(sc.technical_score) || 0;
                  const comm = Number(sc.communication_score) || 0;
                  const culture = Number(sc.culture_score) || 0;
                  const avg = ((tech + comm + culture) / 3).toFixed(1);

                  return (
                    <div
                      key={sc.id}
                      className="p-4 rounded-xl border border-amber-100 bg-amber-50/20 hover:bg-white hover:shadow-xs transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs font-bold text-slate-800">
                            Người đánh giá: {sc.reviewer_name || "Hội đồng tuyển dụng"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400">
                            {sc.created_at ? new Date(sc.created_at).toLocaleString("vi-VN") : ""}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-800">
                            Điểm TB: {avg}/10
                          </span>
                        </div>
                      </div>

                      {/* Điểm các tiêu chí */}
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-white p-2 rounded-lg border border-slate-200/60 space-y-0.5">
                          <span className="text-[10.5px] text-slate-500 font-medium block">Chuyên môn</span>
                          <span className="text-sm font-black text-[#0062ff] block">{tech}/10</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-200/60 space-y-0.5">
                          <span className="text-[10.5px] text-slate-500 font-medium block">Giao tiếp</span>
                          <span className="text-sm font-black text-teal-600 block">{comm}/10</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-200/60 space-y-0.5">
                          <span className="text-[10.5px] text-slate-500 font-medium block">Văn hóa & Thái độ</span>
                          <span className="text-sm font-black text-purple-600 block">{culture}/10</span>
                        </div>
                      </div>

                      {/* Ghi chú nội bộ */}
                      {sc.notes && (
                        <div className="bg-white p-3 rounded-xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
                          <strong className="text-slate-800 block mb-1">Nhận xét nội bộ:</strong>
                          <p className="m-0 whitespace-pre-wrap">{sc.notes}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400 space-y-1">
                <FileCheck className="w-6 h-6 mx-auto text-slate-300" />
                <p className="text-xs font-medium m-0">Chưa có phiếu đánh giá phỏng vấn nào.</p>
              </div>
            )}

            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-[11px] text-blue-800 leading-relaxed font-medium">
              💡 <strong>Quy tắc CAREZA:</strong> Kết quả đánh giá chỉ mang tính chất tham khảo cho nội bộ doanh nghiệp. Hệ thống không tự động chuyển trạng thái ứng viên sang &quot;Trúng tuyển&quot; chỉ vì điểm đánh giá cao.
            </div>
          </div>

          {/* Card 4: Thư mời nhận việc (Offer) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 m-0">Thư mời nhận việc (Offer)</h3>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Quản lý đề xuất và điều khoản hợp đồng dành cho ứng viên
                  </span>
                </div>
              </div>

              {!appData?.offer && (
                <button
                  type="button"
                  onClick={() => {
                    if (appData?.expected_salary) {
                      setOfferForm((prev) => ({
                        ...prev,
                        salary: Number(appData.expected_salary).toLocaleString("vi-VN"),
                      }));
                    }
                    setIsOfferModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Soạn Offer</span>
                </button>
              )}
            </div>

            {appData?.offer ? (
              <div className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200/60">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">Trạng thái:</span>
                    {appData.offer.status === "draft" && <Tag color="purple" className="font-bold">Bản nháp</Tag>}
                    {appData.offer.status === "sent" && <Tag color="orange" className="font-bold">Đang chờ phản hồi</Tag>}
                    {appData.offer.status === "accepted" && <Tag color="green" className="font-bold">Ứng viên đã chấp nhận</Tag>}
                    {appData.offer.status === "rejected" && <Tag color="red" className="font-bold">Ứng viên đã từ chối</Tag>}
                    {appData.offer.status === "expired" && <Tag color="default" className="font-bold">Đã hết hạn</Tag>}
                    {appData.offer.status === "cancelled" && <Tag color="default" className="font-bold">Đã thu hồi</Tag>}
                  </div>

                  <div className="flex items-center gap-2">
                    {appData.offer.status === "draft" && (
                      <button
                        type="button"
                        onClick={() => handleSendDraftOffer(appData.offer.id)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-2xs"
                      >
                        Gửi Offer ngay
                      </button>
                    )}
                    {appData.offer.status === "sent" && (
                      <button
                        type="button"
                        onClick={() => handleCancelOffer(appData.offer.id)}
                        className="px-2.5 py-1 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs cursor-pointer"
                      >
                        Thu hồi Offer
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Mức lương:</span>
                    <strong className="text-emerald-700 font-black">
                      {appData.offer.salary ? `${Number(appData.offer.salary).toLocaleString("vi-VN")} VNĐ` : "Thỏa thuận"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Ngày bắt đầu:</span>
                    <strong className="text-slate-800">
                      {appData.offer.start_date ? new Date(appData.offer.start_date).toLocaleDateString("vi-VN") : "Chưa đặt"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Hạn phản hồi:</span>
                    <strong className="text-amber-700">
                      {appData.offer.deadline ? new Date(appData.offer.deadline).toLocaleDateString("vi-VN") : "Chưa đặt"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Loại hợp đồng:</span>
                    <strong className="text-slate-800">{appData.offer.contract_type || "Chính thức"}</strong>
                  </div>
                </div>

                {appData.offer.work_location && (
                  <div className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200/60">
                    <strong className="text-slate-700">Địa điểm làm việc:</strong> {appData.offer.work_location}
                  </div>
                )}

                {appData.offer.terms && (
                  <div className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200/60">
                    <strong className="text-slate-700 block mb-1">Chế độ đãi ngộ & Điều khoản:</strong>
                    <p className="m-0 whitespace-pre-line text-slate-600 leading-relaxed">{appData.offer.terms}</p>
                  </div>
                )}

                {appData.offer.notes && (
                  <div className="text-xs text-slate-600 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                    <strong className="text-blue-900 block mb-1">Lời nhắn gửi ứng viên:</strong>
                    <p className="m-0 italic text-slate-700">{appData.offer.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400 space-y-1">
                <ShieldCheck className="w-6 h-6 mx-auto text-slate-300" />
                <p className="text-xs font-medium m-0">Hồ sơ này chưa có thư mời nhận việc (Offer).</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sàng lọc & Cập nhật trạng thái (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Card 1: AI Matching Score */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 m-0 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#0062ff]" />
                <span>AI Matching Sàng lọc</span>
              </h3>
              <Tag color="cyan" className="m-0 rounded-full font-bold text-[10px]">
                Hỗ trợ ra quyết định
              </Tag>
            </div>

            <div className="flex items-center gap-4 bg-gradient-to-r from-teal-50 to-blue-50 p-4 rounded-xl border border-teal-100">
              <div className="relative shrink-0">
                <Progress
                  type="circle"
                  percent={typeof match_score === "number" ? match_score : 85}
                  size={60}
                  strokeColor={{
                    "0%": "#06b6d4",
                    "100%": "#10b981",
                  }}
                  strokeWidth={8}
                  format={(p) => <span className="text-xs font-black text-teal-800">{p}%</span>}
                />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 block">
                  Độ tương thích hồ sơ
                </span>
                <span className="text-[11px] text-slate-500 block leading-tight">
                  So khớp tự động giữa CV snapshot và yêu cầu tin tuyển dụng
                </span>
              </div>
            </div>

            {match_info && typeof match_info === "object" && (
              <div className="space-y-2 text-xs">
                {typeof match_info.skill_score === "number" && (
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-0.5">
                      <span>Kỹ năng chuyên môn</span>
                      <span className="font-bold">{match_info.skill_score}%</span>
                    </div>
                    <Progress percent={match_info.skill_score} showInfo={false} size="small" strokeColor="#0062ff" />
                  </div>
                )}

                {typeof match_info.experience_score === "number" && (
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-0.5">
                      <span>Kinh nghiệm liên quan</span>
                      <span className="font-bold">{match_info.experience_score}%</span>
                    </div>
                    <Progress percent={match_info.experience_score} showInfo={false} size="small" strokeColor="#0d9488" />
                  </div>
                )}
              </div>
            )}

            <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200/80 text-[10.5px] text-amber-800 font-medium leading-relaxed">
              ⚠️ Điểm AI chỉ mang tính chất tham khảo, không tự động loại trừ ứng viên. Quyết định do nhà tuyển dụng thực hiện.
            </div>
          </div>

          {/* Card 2: Quy trình tuyển dụng & Cập nhật trạng thái */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 m-0">
              Cập nhật trạng thái tuyển dụng
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Trạng thái xử lý:
                </label>
                <Select
                  value={selectedNewStatus}
                  onChange={setSelectedNewStatus}
                  className="w-full text-xs"
                  options={[
                    { value: "submitted", label: "Mới nộp (Chờ xử lý)" },
                    { value: "screening", label: "Sàng lọc hồ sơ" },
                    { value: "shortlisted", label: "Phù hợp / Bài test" },
                    { value: "interview", label: "Mời phỏng vấn" },
                    { value: "offered", label: "Gửi thư mời nhận việc (Offer)" },
                    { value: "hired", label: "Trúng tuyển (Hired)" },
                    { value: "rejected", label: "Từ chối hồ sơ" },
                  ]}
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Ghi chú nội bộ:
                </label>
                <TextArea
                  rows={3}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Lý do chuyển trạng thái hoặc ghi chú phỏng vấn..."
                  className="text-xs rounded-xl"
                />
              </div>

              <button
                type="button"
                disabled={updatingStatus}
                onClick={handleUpdateStatus}
                className="w-full py-2.5 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{updatingStatus ? "Đang cập nhật..." : "Lưu thay đổi trạng thái"}</span>
              </button>
            </div>
          </div>

          {/* Card 3: Timeline Lịch sử xử lý */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
            <h3 className="text-sm font-black text-slate-900 m-0 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Lịch sử xử lý hồ sơ</span>
            </h3>

            {Array.isArray(histories) && histories.length > 0 ? (
              <Timeline
                className="pt-2 text-xs"
                items={histories.map((h: any) => ({
                  color: h.to_status === "rejected" ? "red" : h.to_status === "hired" ? "green" : "blue",
                  children: (
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <span>Chuyển sang:</span>
                        {getStatusBadge(h.to_status)}
                      </div>
                      {h.note && <p className="text-slate-500 m-0 leading-tight">{h.note}</p>}
                      <span className="text-[10px] text-slate-400 block">
                        {h.created_at ? new Date(h.created_at).toLocaleString("vi-VN") : ""}
                      </span>
                    </div>
                  ),
                }))}
              />
            ) : (
              <p className="text-xs text-slate-400 m-0">Chưa có lịch sử cập nhật.</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal Lên Lịch Phỏng Vấn */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <CalendarPlus className="w-4.5 h-4.5 text-[#0062ff]" />
            <span>Lên lịch phỏng vấn ứng viên</span>
          </div>
        }
        open={isScheduleModalOpen}
        onCancel={() => {
          if (!submittingSchedule) setIsScheduleModalOpen(false);
        }}
        footer={null}
        centered
        className="rounded-2xl"
      >
        <div className="space-y-4 pt-2 text-xs">
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 block">Ứng viên:</span>
              <strong className="text-slate-800 font-bold text-sm">{candidate?.full_name}</strong>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-500 block">Vị trí:</span>
              <strong className="text-[#0062ff] font-bold">{job?.title}</strong>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">
              Thời gian bắt đầu phỏng vấn <span className="text-rose-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={scheduleForm.scheduled_at}
              onChange={(e) => setScheduleForm({ ...scheduleForm, scheduled_at: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-[#0062ff]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Thời lượng (phút)</label>
              <select
                value={scheduleForm.duration_minutes}
                onChange={(e) => setScheduleForm({ ...scheduleForm, duration_minutes: Number(e.target.value) })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-[#0062ff] cursor-pointer"
              >
                <option value={30}>30 phút</option>
                <option value={45}>45 phút</option>
                <option value={60}>60 phút (1 giờ)</option>
                <option value={90}>90 phút (1.5 giờ)</option>
                <option value={120}>120 phút (2 giờ)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Hình thức</label>
              <select
                value={scheduleForm.mode}
                onChange={(e) => setScheduleForm({ ...scheduleForm, mode: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-[#0062ff] cursor-pointer"
              >
                <option value="online">Trực tuyến (Online)</option>
                <option value="offline">Tại văn phòng (Offline)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">
              {scheduleForm.mode === "online" ? "Đường dẫn phòng họp (Google Meet / Zoom...)" : "Địa điểm phỏng vấn"}
            </label>
            <input
              type="text"
              placeholder={scheduleForm.mode === "online" ? "https://meet.google.com/..." : "Tầng 5, Tòa nhà ABC, 123 Đường XYZ..."}
              value={scheduleForm.meeting_url}
              onChange={(e) => setScheduleForm({ ...scheduleForm, meeting_url: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-[#0062ff]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">Ghi chú dặn dò ứng viên (tùy chọn)</label>
            <textarea
              rows={3}
              placeholder="Ví dụ: Vui lòng chuẩn bị bản trình chiếu portfolio hoặc máy tính cá nhân..."
              value={scheduleForm.notes}
              onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-[#0062ff] resize-none"
            />
          </div>

          <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100 text-[11px] text-blue-700 leading-relaxed font-medium">
            ℹ️ Khi tạo lịch, hệ thống sẽ tự động cập nhật trạng thái hồ sơ sang <strong>Phỏng vấn</strong> và gửi thông báo trực tiếp đến ứng viên.
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              disabled={submittingSchedule}
              onClick={() => setIsScheduleModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition-all cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={submittingSchedule}
              onClick={handleCreateInterview}
              className="px-4.5 py-2 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {submittingSchedule ? "Đang xử lý..." : "Lưu lịch & Gửi thông báo"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Ghi Nhận Đánh Giá Scorecard */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Award className="w-4.5 h-4.5 text-amber-500" />
            <span>Ghi nhận đánh giá ứng viên (Scorecard)</span>
          </div>
        }
        open={isScorecardModalOpen}
        onCancel={() => {
          if (!submittingScorecard) setIsScorecardModalOpen(false);
        }}
        footer={null}
        centered
        className="rounded-2xl"
      >
        <div className="space-y-4 pt-2 text-xs">
          <p className="text-slate-500 m-0">
            Chấm điểm và nhận xét về ứng viên <strong>{candidate?.full_name}</strong> sau buổi phỏng vấn.
          </p>

          <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700">Điểm chuyên môn / Kỹ thuật (1 - 10):</label>
              <select
                value={scorecardForm.technical_score}
                onChange={(e) => setScorecardForm({ ...scorecardForm, technical_score: Number(e.target.value) })}
                className="p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-[#0062ff] focus:outline-hidden cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <option key={num} value={num}>{num} / 10</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700">Điểm giao tiếp & phản xạ (1 - 10):</label>
              <select
                value={scorecardForm.communication_score}
                onChange={(e) => setScorecardForm({ ...scorecardForm, communication_score: Number(e.target.value) })}
                className="p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-teal-600 focus:outline-hidden cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <option key={num} value={num}>{num} / 10</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700">Điểm phù hợp văn hóa & thái độ (1 - 10):</label>
              <select
                value={scorecardForm.culture_score}
                onChange={(e) => setScorecardForm({ ...scorecardForm, culture_score: Number(e.target.value) })}
                className="p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-purple-600 focus:outline-hidden cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <option key={num} value={num}>{num} / 10</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">
              Ghi chú & Nhận xét nội bộ <span className="text-slate-400 font-normal">(Bảo mật)</span>:
            </label>
            <textarea
              rows={4}
              placeholder="Nhận xét chi tiết về điểm mạnh, điểm cần cải thiện, mức độ phù hợp với team..."
              value={scorecardForm.notes}
              onChange={(e) => setScorecardForm({ ...scorecardForm, notes: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-[#0062ff] resize-none"
            />
          </div>

          <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-800 leading-relaxed font-medium">
            🔒 Phiếu đánh giá này được lưu vết nội bộ cho doanh nghiệp. Hệ thống không tự động chuyển ứng viên sang Trúng tuyển.
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              disabled={submittingScorecard}
              onClick={() => setIsScorecardModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition-all cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={submittingScorecard}
              onClick={handleAddScorecard}
              className="px-4.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {submittingScorecard ? "Đang lưu..." : "Lưu phiếu đánh giá"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal 3: Soạn và gửi Thư mời nhận việc (Offer) */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span className="font-extrabold text-slate-800 text-sm">
              Soạn thư mời nhận việc (Offer) – {candidate?.full_name}
            </span>
          </div>
        }
        open={isOfferModalOpen}
        onCancel={() => {
          if (!submittingOffer) setIsOfferModalOpen(false);
        }}
        footer={null}
        centered
        className="rounded-2xl"
        width={560}
      >
        <div className="space-y-3.5 pt-2 text-xs">
          <p className="text-slate-500 m-0">
            Gửi đề xuất mức lương, thời hạn và chế độ đãi ngộ chính thức đến ứng viên.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Mức lương (VNĐ) *</label>
              <Input
                value={offerForm.salary}
                onChange={(e) => setOfferForm({ ...offerForm, salary: e.target.value })}
                placeholder="25,000,000"
                className="rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Ngày bắt đầu *</label>
              <Input
                type="date"
                value={offerForm.start_date}
                onChange={(e) => setOfferForm({ ...offerForm, start_date: e.target.value })}
                className="rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Hạn phản hồi</label>
              <Input
                type="date"
                value={offerForm.deadline}
                onChange={(e) => setOfferForm({ ...offerForm, deadline: e.target.value })}
                className="rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Loại hợp đồng</label>
              <Select
                value={offerForm.contract_type}
                onChange={(val) => setOfferForm({ ...offerForm, contract_type: val })}
                className="w-full text-xs"
                options={[
                  { value: "Toàn thời gian chính thức", label: "Toàn thời gian chính thức" },
                  { value: "Thử việc (2 tháng)", label: "Thử việc (2 tháng)" },
                  { value: "Hợp đồng xác định thời hạn", label: "Hợp đồng xác định thời hạn" },
                  { value: "Bán thời gian / Part-time", label: "Bán thời gian / Part-time" },
                ]}
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Địa điểm làm việc</label>
              <Input
                value={offerForm.work_location}
                onChange={(e) => setOfferForm({ ...offerForm, work_location: e.target.value })}
                placeholder="Văn phòng làm việc..."
                className="rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Chế độ đãi ngộ & Điều khoản</label>
            <TextArea
              rows={2}
              value={offerForm.terms}
              onChange={(e) => setOfferForm({ ...offerForm, terms: e.target.value })}
              placeholder="Thử việc 85% lương, bảo hiểm PVI..."
              className="rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Lời nhắn gửi ứng viên</label>
            <TextArea
              rows={2}
              value={offerForm.notes}
              onChange={(e) => setOfferForm({ ...offerForm, notes: e.target.value })}
              placeholder="Lời nhắn khích lệ từ nhà tuyển dụng..."
              className="rounded-xl text-xs"
            />
          </div>

          <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-100 text-[11px] text-blue-800 leading-relaxed font-medium">
            💡 Sau khi gửi Offer, hồ sơ ứng viên sẽ tự động được đồng bộ sang giai đoạn <strong>OFFER</strong> trong Pipeline tuyển dụng.
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              disabled={submittingOffer}
              onClick={() => setIsOfferModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={submittingOffer}
              onClick={() => handleSaveOffer("draft")}
              className="px-4 py-2 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-[#0062ff] font-bold text-xs cursor-pointer disabled:opacity-50"
            >
              {submittingOffer ? "Đang lưu..." : "Lưu nháp"}
            </button>
            <button
              type="button"
              disabled={submittingOffer}
              onClick={() => handleSaveOffer("sent")}
              className="px-4.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50"
            >
              {submittingOffer ? "Đang gửi..." : "Gửi Offer ngay"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
