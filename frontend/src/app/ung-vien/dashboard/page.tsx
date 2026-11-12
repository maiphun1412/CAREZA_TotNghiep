"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { candidateService } from "@/services/candidate.service";
import { aiService } from "@/services/ai.service";
import { Progress, Tag, Spin, Alert, Tooltip } from "antd";
import {
  FilePdfOutlined,
  MoreOutlined,
  HeartOutlined,
  HeartFilled,
} from "@ant-design/icons";

export default function CandidateDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    router.replace("/ung-vien/ho-so");
  }, [router]);
  const [bookmarkedJobs, setBookmarkedJobs] = useState<string[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [matchingJobs, setMatchingJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recLoading, setRecLoading] = useState(true);
  const [recError, setRecError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    setRecLoading(true);
    setRecError(null);
    try {
      const recRes = await aiService.getJobRecommendations(6);
      const recs = recRes?.data?.recommendations;
      if (Array.isArray(recs)) {
        setMatchingJobs(recs);
      } else {
        setMatchingJobs([]);
      }
    } catch (err: any) {
      const errData = err?.response?.data;
      const errMsg =
        errData?.cv?.[0] ||
        errData?.cv ||
        errData?.detail ||
        errData?.error ||
        errData?.message ||
        err?.message ||
        "Không thể tải danh sách việc làm gợi ý từ hệ thống.";
      setRecError(typeof errMsg === "string" ? errMsg : "Chưa có dữ liệu gợi ý việc làm phù hợp.");
      setMatchingJobs([]);
    } finally {
      setRecLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const dashRes = await candidateService.getDashboard();
        if (dashRes?.data) {
          setDashboardData(dashRes.data);
        }
      } catch (err) {
        console.warn("Lỗi nạp dashboard ứng viên:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
    fetchRecommendations();
  }, [fetchRecommendations]);

  const toggleBookmark = async (jobId: string) => {
    const isSaved = bookmarkedJobs.includes(jobId);
    try {
      if (isSaved) {
        await candidateService.removeJobBookmark(jobId);
        setBookmarkedJobs((prev) => prev.filter((id) => id !== jobId));
      } else {
        await candidateService.saveJobBookmark(jobId);
        setBookmarkedJobs((prev) => [...prev, jobId]);
      }
    } catch {
      // ignore
    }
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
              <span className="text-3xl font-black text-slate-900">{dashboardData?.stats?.profile_completion ?? 0}%</span>
            </div>
            <div className="w-44 my-1">
              <Progress percent={dashboardData?.stats?.profile_completion ?? 0} showInfo={false} strokeColor="#0062ff" strokeWidth={8} />
            </div>
            <span className="text-xs font-bold text-slate-500 block pt-0.5">
              {(dashboardData?.stats?.profile_completion ?? 0) >= 80 ? "Hồ sơ của bạn rất xuất sắc!" : "Hãy bổ sung thông tin để tăng cơ hội trúng tuyển!"}
            </span>
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
              <span className="text-2xl sm:text-3xl font-black text-slate-900 block leading-none">
                {dashboardData?.stats?.cv_count ?? 0}
              </span>
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
              <span className="text-2xl sm:text-3xl font-black text-slate-900 block leading-none">
                {dashboardData?.stats?.applied_count ?? 0}
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-600 mt-1 block">Đã ứng tuyển</span>
            </div>
          </div>
          <Link href="/ung-vien/ung-tuyen" className="text-xs font-bold text-primary hover:underline">
            Xem lịch sử →
          </Link>
        </div>

        {/* Card 3: Việc đã lưu (Viền hồng rose) */}
        <div className="bg-white p-5 sm:p-6 rounded-[24px] border border-rose-200/90 hover:border-rose-300 shadow-xs flex items-center justify-between transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">favorite</span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 block leading-none">
                {dashboardData?.stats?.saved_jobs_count ?? 0}
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-600 mt-1 block">Việc đã lưu</span>
            </div>
          </div>
          <Link href="/ung-vien/viec-da-luu" className="text-xs font-bold text-primary hover:underline">
            Xem danh sách →
          </Link>
        </div>

        {/* Card 4: Lịch phỏng vấn (Viền tím indigo) */}
        <div className="bg-white p-5 sm:p-6 rounded-[24px] border border-indigo-200/90 hover:border-indigo-300 shadow-xs flex items-center justify-between transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">calendar_month</span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 block leading-none">
                {dashboardData?.stats?.interview_count ?? 0}
              </span>
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
              <Link href="/ung-vien/ung-tuyen" className="text-xs font-bold text-primary hover:underline">
                Xem tất cả ({dashboardData?.stats?.applied_count ?? 0}) →
              </Link>
            </div>

            {/* Danh sách ứng tuyển thật từ API */}
            <div className="space-y-4">
              {dashboardData?.recent_applications && dashboardData.recent_applications.length > 0 ? (
                dashboardData.recent_applications.map((app: any) => {
                  const statusMap: Record<string, { label: string; color: string }> = {
                    submitted: { label: "Đã ứng tuyển", color: "bg-blue-50 text-blue-600" },
                    screening: { label: "Đang sàng lọc", color: "bg-purple-50 text-purple-600" },
                    interview: { label: "Phỏng vấn", color: "bg-amber-50 text-amber-600" },
                    hired: { label: "Trúng tuyển", color: "bg-emerald-50 text-emerald-600" },
                    rejected: { label: "Chưa phù hợp", color: "bg-rose-50 text-rose-600" },
                  };
                  const statusInfo = statusMap[app.status] || { label: app.status || "Đã ứng tuyển", color: "bg-slate-100 text-slate-700" };
                  const appliedDate = app.applied_at ? new Date(app.applied_at).toLocaleDateString("vi-VN") : "Gần đây";

                  return (
                    <div key={app.id} className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5 min-w-[240px]">
                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-2 flex items-center justify-center shrink-0 shadow-2xs">
                          {app.company_logo ? (
                            <img src={app.company_logo} alt={app.company_name} className="w-full h-full object-contain" />
                          ) : (
                            <span className="material-symbols-outlined text-2xl text-slate-400">apartment</span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm sm:text-base text-slate-800 m-0 leading-tight">
                            {app.job_title}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
                            {app.company_name} • Ứng tuyển: {appliedDate}
                          </p>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                        <Link href={`/ung-vien/ung-tuyen`} className="text-xs font-bold text-primary hover:underline">
                          Chi tiết →
                        </Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <span className="material-symbols-outlined text-3xl text-slate-400 block mb-1">inbox</span>
                  <p className="text-xs sm:text-sm text-slate-500 m-0 font-medium">Bạn chưa nộp đơn ứng tuyển nào.</p>
                  <Link href="/viec-lam" className="inline-block mt-3 text-xs font-bold text-primary hover:underline">
                    Tìm kiếm việc làm ngay →
                  </Link>
                </div>
              )}
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
                percent={dashboardData?.stats?.profile_completion ?? 0}
                size={80}
                strokeColor="#0F52BA"
                strokeWidth={9}
                format={(p) => <span className="font-extrabold text-sm text-slate-800">{p}%</span>}
              />
              <div>
                <h4 className="text-sm sm:text-base font-bold text-slate-800 m-0 leading-snug">
                  {(dashboardData?.stats?.profile_completion ?? 0) >= 80 ? "Hồ sơ của bạn đã hoàn thiện tốt!" : "Hồ sơ đang được xây dựng"}
                </h4>
                <p className="text-xs text-slate-500 m-0 mt-1 leading-relaxed">
                  Cập nhật đầy đủ kỹ năng và kinh nghiệm để thu hút nhà tuyển dụng.
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
      {/* 4. VIỆC LÀM PHÙ HỢP VỚI BẠN (Xếp hạng đa tiêu chí TOPSIS) */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 sm:p-7 rounded-[28px] border border-slate-200/70 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-800 m-0">Việc làm phù hợp với bạn</h3>
              <span className="bg-blue-50 text-[#0062ff] border border-blue-200 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
                TOPSIS Ranking
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 m-0 mt-0.5 font-medium">
              Xếp hạng đa tiêu chí TOPSIS và độ tương thích CV–JD dựa trên CV của bạn
            </p>
          </div>
          <Link href="/viec-lam" className="text-xs sm:text-sm font-bold text-primary hover:underline">
            Xem tất cả việc làm →
          </Link>
        </div>

        {/* Trạng thái Loading / Error / Empty / Danh sách TOPSIS thật từ API */}
        {recLoading ? (
          <div className="py-12 text-center bg-slate-50/50 rounded-2xl border border-slate-100">
            <Spin size="default" />
            <p className="text-xs sm:text-sm text-slate-500 font-medium m-0 mt-2">
              Đang phân tích CV và xếp hạng việc làm phù hợp bằng thuật toán TOPSIS...
            </p>
          </div>
        ) : recError ? (
          <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200/80 space-y-3">
            <Alert
              type="warning"
              showIcon
              message="Chưa thể tạo gợi ý việc làm TOPSIS"
              description={recError}
            />
            <div className="flex items-center gap-3">
              <Link
                href="/ung-vien/cv"
                className="text-xs font-bold bg-[#0062ff] hover:bg-[#0052cc] text-white px-4 py-2 rounded-xl transition-all"
              >
                Cập nhật / Tải lên CV
              </Link>
              <button
                type="button"
                onClick={fetchRecommendations}
                className="text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-4 py-2 rounded-xl cursor-pointer transition-all"
              >
                Thử lại
              </button>
            </div>
          </div>
        ) : matchingJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {matchingJobs.map((rec: any, idx: number) => {
              const job = rec?.job || rec || {};
              const jobId = job.id ?? rec?.job_id;
              const rankPos = rec?.rank_position ?? idx + 1;
              const topsisScore =
                typeof rec?.topsis_score === "number" ? rec.topsis_score : null;
              const matchPercent =
                typeof rec?.match_percentage === "number"
                  ? rec.match_percentage
                  : typeof rec?.hybrid_score === "number"
                    ? Math.round(rec.hybrid_score * 1000) / 10
                    : null;
              const explanation = rec?.explanation || {};
              const matchedSkills: string[] = Array.isArray(explanation?.matched_skills)
                ? explanation.matched_skills
                : [];

              // Định dạng mức lương thực tế từ API
              let salaryDisplay = job.salary || "Thỏa thuận";
              if (!job.salary) {
                const sMin = Number(job.salary_min || 0);
                const sMax = Number(job.salary_max || 0);
                const cur = (job.currency || "VND").trim().toUpperCase();
                if (sMin > 0 && sMax > 0) {
                  salaryDisplay =
                    cur === "VND" && sMin >= 1_000_000
                      ? `${Math.round(sMin / 1_000_000)} - ${Math.round(sMax / 1_000_000)} triệu`
                      : `${sMin.toLocaleString("vi-VN")} - ${sMax.toLocaleString("vi-VN")} ${cur}`;
                } else if (sMin > 0) {
                  salaryDisplay =
                    cur === "VND" && sMin >= 1_000_000
                      ? `Từ ${Math.round(sMin / 1_000_000)} triệu`
                      : `Từ ${sMin.toLocaleString("vi-VN")} ${cur}`;
                } else if (sMax > 0) {
                  salaryDisplay =
                    cur === "VND" && sMax >= 1_000_000
                      ? `Đến ${Math.round(sMax / 1_000_000)} triệu`
                      : `Đến ${sMax.toLocaleString("vi-VN")} ${cur}`;
                }
              }

              const locationDisplay =
                job.location ||
                (job.work_mode === "remote"
                  ? "Làm việc từ xa (Remote)"
                  : job.work_mode === "hybrid"
                    ? "Linh hoạt (Hybrid)"
                    : "Chưa cập nhật địa điểm");

              return (
                <div
                  key={jobId || idx}
                  className="bg-slate-50/70 hover:bg-white p-5 rounded-2xl border border-slate-200/70 hover:border-blue-200 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 p-1.5 flex items-center justify-center font-bold text-primary overflow-hidden shrink-0">
                          {job.company_logo ? (
                            <img src={job.company_logo} alt={job.company_name || "Doanh nghiệp"} className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-sm">{(job.company_name || "DN").slice(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link href={`/viec-lam/${jobId}`}>
                            <h4 className="font-extrabold text-sm sm:text-base text-slate-800 m-0 line-clamp-1 hover:text-primary transition-colors">
                              {job.title || "Vị trí tuyển dụng"}
                            </h4>
                          </Link>
                          <p className="text-xs text-slate-500 font-medium m-0 mt-0.5 line-clamp-1">
                            {job.company_name || "Doanh nghiệp"}
                          </p>
                        </div>
                      </div>
                      {jobId && (
                        <button
                          onClick={() => toggleBookmark(String(jobId))}
                          className="text-slate-400 hover:text-rose-500 cursor-pointer p-1 text-base border-none bg-transparent shrink-0"
                        >
                          {bookmarkedJobs.includes(String(jobId)) ? <HeartFilled className="text-rose-500" /> : <HeartOutlined />}
                        </button>
                      )}
                    </div>

                    {/* Nhãn xếp hạng TOPSIS & Độ phù hợp CV-JD */}
                    <div className="flex items-center gap-1.5 flex-wrap my-2.5">
                      <span className="bg-blue-600 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-md">
                        Hạng #{rankPos} TOPSIS
                      </span>
                      {topsisScore !== null && (
                        <Tooltip title="Hệ số độ gần tương đối TOPSIS C_i (0 → 1)">
                          <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-bold px-2 py-0.5 rounded-md">
                            TOPSIS: {(topsisScore * 100).toFixed(1)}đ ({topsisScore.toFixed(3)})
                          </span>
                        </Tooltip>
                      )}
                      {matchPercent !== null && (
                        <Tooltip title="Điểm so khớp CV–JD Hybrid (Kỹ năng + TF-IDF + Kinh nghiệm)">
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-2 py-0.5 rounded-md">
                            CV–JD: {matchPercent}%
                          </span>
                        </Tooltip>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 space-y-1.5 mb-3 font-medium">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="material-symbols-outlined text-[16px] text-slate-400">pin_drop</span>
                        <span>{locationDisplay}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-slate-400">payments</span>
                        <span className="font-black text-slate-800 text-sm">{salaryDisplay}</span>
                      </div>
                      {typeof job.experience_min === "number" && (
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-slate-400">work_history</span>
                          <span>
                            {job.experience_min > 0
                              ? `Yêu cầu tối thiểu ${job.experience_min} năm KN`
                              : "Không yêu cầu kinh nghiệm"}
                          </span>
                        </div>
                      )}
                    </div>

                    {matchedSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {matchedSkills.slice(0, 4).map((t: string, sIdx: number) => (
                          <Tag key={sIdx} className="bg-white border border-blue-200 text-blue-700 font-semibold rounded-md text-xs px-2 py-0.5 m-0">
                            ✓ {t}
                          </Tag>
                        ))}
                        {matchedSkills.length > 4 && (
                          <Tag className="bg-white border border-slate-200 text-slate-600 font-semibold rounded-md text-xs px-2 py-0.5 m-0">
                            +{matchedSkills.length - 4}
                          </Tag>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>
                      {job.work_mode ? `Hình thức: ${job.work_mode}` : "Đang tuyển dụng"}
                    </span>
                    <Link href={`/viec-lam/${jobId}`} className="text-primary font-bold hover:underline">
                      Xem chi tiết →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <span className="text-3xl block mb-2">💼</span>
            <p className="text-slate-600 font-medium text-sm m-0">
              Hệ thống chưa tìm thấy việc làm phù hợp để xếp hạng TOPSIS cho hồ sơ hiện tại.
            </p>
            <Link href="/viec-lam" className="text-primary text-xs font-bold mt-2 inline-block hover:underline">
              Khám phá danh sách việc làm đang tuyển dụng →
            </Link>
          </div>
        )}
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

            {dashboardData?.recent_cvs && dashboardData.recent_cvs.length > 0 ? (
              <div className="space-y-3.5">
                {dashboardData.recent_cvs.map((cv: any) => (
                  <div key={cv.id} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3.5 overflow-hidden">
                      <div className={`w-10 h-12 rounded-lg flex items-center justify-center text-xl shrink-0 ${cv.is_primary ? "bg-blue-100 text-primary" : "bg-slate-200 text-slate-600"}`}>
                        <FilePdfOutlined />
                      </div>
                      <div className="truncate">
                        <h4 className="font-bold text-sm text-slate-800 m-0 truncate">{cv.title}</h4>
                        <p className="text-xs text-slate-400 m-0 mt-0.5">
                          {cv.created_at ? new Date(cv.created_at).toLocaleDateString("vi-VN") : "Đã tải lên"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {cv.is_primary && (
                        <span className="bg-blue-50 text-primary text-[10px] font-bold px-2 py-0.5 rounded">
                          CV chính
                        </span>
                      )}
                      <Link href={`/ung-vien/cv`} className="text-slate-400 hover:text-slate-600 p-1">
                        <MoreOutlined />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                <FilePdfOutlined className="text-2xl text-slate-400 mb-2" />
                <p className="text-xs text-slate-500 font-medium m-0">Bạn chưa có bản CV nào trong hệ thống.</p>
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center gap-3 pt-5 mt-4 border-t border-slate-100">
            <Link
              href="/ung-vien/cv"
              className="flex-1 text-center py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-bold transition-all"
            >
              + Quản lý CV
            </Link>
            <Link
              href="/ung-vien/cv"
              className="flex-1 text-center py-2.5 rounded-xl bg-primary text-white hover:bg-blue-700 text-xs sm:text-sm font-bold transition-all"
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

            {dashboardData?.recent_activities && dashboardData.recent_activities.length > 0 ? (
              <div className="space-y-4 text-xs sm:text-sm">
                {dashboardData.recent_activities.map((act: any, idx: number) => {
                  const iconBg = act.type === "applied" ? "bg-blue-50 text-primary" : act.type === "saved" ? "bg-rose-50 text-rose-500" : "bg-indigo-50 text-indigo-600";
                  const iconChar = act.type === "applied" ? "✈" : act.type === "saved" ? "♥" : "📄";
                  return (
                    <div key={idx} className="flex items-start gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5 ${iconBg}`}>
                        {iconChar}
                      </span>
                      <div>
                        <p className="text-slate-800 font-semibold m-0 leading-tight">
                          {act.title}
                        </p>
                        <span className="text-xs text-slate-400">
                          {act.timestamp ? new Date(act.timestamp).toLocaleDateString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "Gần đây"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                <span className="text-2xl block mb-2">⏱</span>
                <p className="text-xs text-slate-500 font-medium m-0">Chưa có hoạt động tuyển dụng nào gần đây.</p>
              </div>
            )}
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

            {dashboardData?.upcoming_interviews && dashboardData.upcoming_interviews.length > 0 ? (
              <div className="space-y-3.5">
                {dashboardData.upcoming_interviews.map((iv: any) => (
                  <div key={iv.id} className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 p-1.5 flex items-center justify-center font-bold text-primary">
                        {iv.company_logo ? (
                          <img src={iv.company_logo} alt={iv.company_name} className="w-full h-full object-contain" />
                        ) : (
                          <span>{iv.company_name?.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm sm:text-base text-slate-800 m-0 line-clamp-1">{iv.job_title}</h4>
                        <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">{iv.company_name}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                        <span className="material-symbols-outlined text-base text-slate-400">calendar_month</span>
                        <span>{iv.scheduled_at ? new Date(iv.scheduled_at).toLocaleString("vi-VN") : "Chưa đặt lịch"}</span>
                      </div>
                      <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-md">
                        {iv.status === "scheduled" ? "Đã lên lịch" : iv.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 text-xs sm:text-sm">
                      <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base text-slate-400">videocam</span>
                        <span>Hình thức: {iv.mode}</span>
                      </span>
                      <Link
                        href="/ung-vien/lich-phong-van"
                        className="bg-primary hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-4 py-1.5 rounded-xl transition-all"
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                <span className="text-2xl block mb-2">📅</span>
                <p className="text-xs text-slate-500 font-medium m-0">Bạn chưa có lịch phỏng vấn nào sắp tới.</p>
                <Link href="/viec-lam" className="text-primary text-xs font-bold mt-2 inline-block hover:underline">
                  Ứng tuyển công việc mới →
                </Link>
              </div>
            )}
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
          Careza
          hành cùng bạn! ♥
        </span>
      </div>
    </div>
  );
}
