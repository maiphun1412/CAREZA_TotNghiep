"use client";

import React, { useState, useEffect } from "react";
import { ResumeData } from "../../types";
import {
  Button,
  Input,
  Select,
  Segmented,
  Progress,
  Tag,
  Alert,
  Spin,
  Divider,
  Card,
  Tooltip,
} from "antd";
import {
  RobotOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ArrowRightOutlined,
  ReloadOutlined,
  FileSearchOutlined,
  WarningOutlined,
  BulbOutlined,
  CheckOutlined,
  CloseOutlined,
  CompassOutlined,
} from "@ant-design/icons";
import { candidateService } from "@/services/candidate.service";

interface AiTabProps {
  data: ResumeData;
  currentCvId: number | null;
  onNavigateSection: (sectionId: string) => void;
  // Đánh giá CV
  aiEvaluation: any;
  isEvaluating: boolean;
  evalError: string | null;
  isEvaluationOutdated: boolean;
  onRunEvaluation: () => void;
  // CV - JD Matching
  aiMatch: any;
  isMatching: boolean;
  matchError: string | null;
  onRunMatch: (params: { jobId?: number | null; jdText?: string }) => void;
}

export function AiTab({
  data,
  currentCvId,
  onNavigateSection,
  aiEvaluation,
  isEvaluating,
  evalError,
  isEvaluationOutdated,
  onRunEvaluation,
  aiMatch,
  isMatching,
  matchError,
  onRunMatch,
}: AiTabProps) {
  // Mode chuyển đổi: "evaluate" (Đánh giá CV) hoặc "matching" (So khớp JD)
  const [mode, setMode] = useState<"evaluate" | "matching">("evaluate");

  // State cho CV-JD Matching
  const [jdSource, setJdSource] = useState<"select" | "custom">("select");
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [customJdText, setCustomJdText] = useState<string>("");
  const [publicJobs, setPublicJobs] = useState<any[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState<boolean>(false);

  // Tải danh sách tin tuyển dụng thật cho dropdown
  useEffect(() => {
    let isMounted = true;
    const loadJobs = async () => {
      try {
        setIsLoadingJobs(true);
        const res = await candidateService.getPublicJobs({ page_size: 15 });
        if (isMounted) {
          const list = res?.data?.items || [];
          setPublicJobs(list);
          if (list.length > 0 && !selectedJobId) {
            setSelectedJobId(list[0].id);
          }
        }
      } catch {
        // Bỏ qua lỗi kết nối nền
      } finally {
        if (isMounted) setIsLoadingJobs(false);
      }
    };
    loadJobs();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleStartMatching = () => {
    if (jdSource === "select" && selectedJobId) {
      onRunMatch({ jobId: selectedJobId });
    } else if (jdSource === "custom" && customJdText.trim()) {
      onRunMatch({ jdText: customJdText.trim() });
    }
  };

  // Tính xếp loại màu sắc cho điểm số
  const getScoreColor = (score: number) => {
    if (score >= 80) return "#10b981"; // Xanh lá
    if (score >= 60) return "#0062ff"; // Xanh dương CAREZA
    if (score >= 40) return "#f59e0b"; // Vàng cam
    return "#ef4444"; // Đỏ
  };

  const getScoreRating = (score: number) => {
    if (score >= 85) return { text: "Xuất sắc", desc: "Hồ sơ rất ấn tượng và chuyên nghiệp" };
    if (score >= 70) return { text: "Khá tốt", desc: "Đạt chuẩn yêu cầu của đa số nhà tuyển dụng" };
    if (score >= 50) return { text: "Trung bình", desc: "Cần bổ sung thêm thông tin trọng yếu" };
    return { text: "Cần hoàn thiện", desc: "Nội dung còn thiếu các mục quan trọng" };
  };

  return (
    <div className="space-y-4 pb-8">
      {/* 1. THANH CHUYỂN ĐỔI CHẾ ĐỘ: ĐÁNH GIÁ CHẤT LƯỢNG / SO KHỚP JD */}
      <div className="bg-slate-100 p-1 rounded-xl">
        <Segmented
          block
          value={mode}
          onChange={(val) => setMode(val as any)}
          options={[
            {
              value: "evaluate",
              label: (
                <span className="flex items-center justify-center gap-1.5 font-bold text-xs py-1">
                  <RobotOutlined className="text-blue-600" />
                  Đánh giá CV
                </span>
              ),
            },
            {
              value: "matching",
              label: (
                <span className="flex items-center justify-center gap-1.5 font-bold text-xs py-1">
                  <FileSearchOutlined className="text-emerald-600" />
                  So khớp với JD
                </span>
              ),
            },
          ]}
        />
      </div>

      {/* ========================================================================= */}
      {/* 2. CHẾ ĐỘ 1: ĐÁNH GIÁ CHẤT LƯỢNG CV                                      */}
      {/* ========================================================================= */}
      {mode === "evaluate" && (
        <div className="space-y-4">
          {/* Cảnh báo kết quả đánh giá cũ khi CV bị thay đổi */}
          {aiEvaluation && isEvaluationOutdated && (
            <Alert
              type="warning"
              showIcon
              message={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-amber-900">
                    CV vừa được chỉnh sửa sau lần đánh giá trước.
                  </span>
                  <Button
                    size="small"
                    type="primary"
                    icon={<ReloadOutlined />}
                    onClick={onRunEvaluation}
                    loading={isEvaluating}
                    className="bg-amber-600 hover:bg-amber-700 text-xs font-bold"
                  >
                    Đánh giá lại
                  </Button>
                </div>
              }
              className="rounded-xl border-amber-200 bg-amber-50/80"
            />
          )}

          {/* Lỗi đánh giá nếu có */}
          {evalError && (
            <Alert
              type="error"
              showIcon
              message="Đánh giá thất bại"
              description={evalError}
              action={
                <Button size="small" danger onClick={onRunEvaluation}>
                  Thử lại
                </Button>
              }
              className="rounded-xl"
            />
          )}

          {/* TRƯỜNG HỢP: CHƯA ĐÁNH GIÁ */}
          {!aiEvaluation && !isEvaluating && (
            <div className="bg-gradient-to-br from-blue-50/70 via-white to-indigo-50/50 p-5 rounded-2xl border border-blue-100 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 text-2xl">
                <ThunderboltOutlined />
              </div>
              <h3 className="font-extrabold text-slate-800 text-sm">
                Trợ lý AI Đánh Giá CV CAREZA
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                Hệ thống AI sẽ phân tích độ hoàn thiện thông tin, mật độ kỹ năng công nghệ, chất lượng mô tả kinh nghiệm và bố cục CV theo tiêu chuẩn tuyển dụng.
              </p>
              <div className="pt-2">
                <Button
                  type="primary"
                  size="large"
                  icon={<ThunderboltOutlined />}
                  onClick={onRunEvaluation}
                  className="w-full bg-[#0062ff] hover:bg-blue-700 font-bold text-sm h-11 rounded-xl shadow-md shadow-blue-500/20"
                >
                  Bắt đầu đánh giá CV
                </Button>
              </div>
              <p className="text-[11px] text-slate-400 italic">
                * Đánh giá trực tiếp nội dung đang chỉnh sửa. Không tạo thêm bản ghi CV rác.
              </p>
            </div>
          )}

          {/* TRƯỜNG HỢP: ĐANG PHÂN TÍCH */}
          {isEvaluating && (
            <div className="bg-white p-8 rounded-2xl border border-blue-100 text-center space-y-3 shadow-sm">
              <Spin size="large" />
              <h4 className="font-bold text-slate-800 text-sm">AI đang đánh giá CV của bạn...</h4>
              <p className="text-xs text-slate-500">
                Đang quét thông tin cá nhân, trích xuất kỹ năng, phân tích kinh nghiệm và kiểm tra bố cục...
              </p>
            </div>
          )}

          {/* TRƯỜNG HỢP: ĐÃ CÓ KẾT QUẢ ĐÁNH GIÁ */}
          {aiEvaluation && !isEvaluating && (
            <div className="space-y-4">
              {/* Thẻ Điểm Tổng Quan */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Điểm chất lượng CV
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span
                      className="text-4xl font-black font-sans tracking-tight"
                      style={{ color: getScoreColor(aiEvaluation.score) }}
                    >
                      {aiEvaluation.score}
                    </span>
                    <span className="text-xs font-bold text-slate-400">/ 100</span>
                  </div>
                  <div className="text-xs font-bold" style={{ color: getScoreColor(aiEvaluation.score) }}>
                    {getScoreRating(aiEvaluation.score).text}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {getScoreRating(aiEvaluation.score).desc}
                  </div>
                </div>

                <div className="shrink-0">
                  <Progress
                    type="circle"
                    percent={aiEvaluation.score}
                    size={76}
                    strokeColor={{
                      "0%": "#0062ff",
                      "100%": getScoreColor(aiEvaluation.score),
                    }}
                    format={(percent) => (
                      <span className="text-xs font-black text-slate-800">{percent}%</span>
                    )}
                  />
                </div>
              </div>

              {/* Phân tích Điểm theo 4 Tiêu Chí */}
              {aiEvaluation.feedback?.score_breakdown && (
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <CompassOutlined className="text-blue-600" />
                    Chi tiết tiêu chí đánh giá
                  </h4>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold text-slate-600">Độ hoàn thiện thông tin</span>
                        <span className="font-bold text-slate-800">
                          {aiEvaluation.feedback.score_breakdown.completeness} / 25
                        </span>
                      </div>
                      <Progress
                        percent={(aiEvaluation.feedback.score_breakdown.completeness / 25) * 100}
                        showInfo={false}
                        strokeColor="#0062ff"
                        size={["100%", 6]}
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold text-slate-600">Chiều sâu kỹ năng</span>
                        <span className="font-bold text-slate-800">
                          {aiEvaluation.feedback.score_breakdown.skills_depth} / 25
                        </span>
                      </div>
                      <Progress
                        percent={(aiEvaluation.feedback.score_breakdown.skills_depth / 25) * 100}
                        showInfo={false}
                        strokeColor="#10b981"
                        size={["100%", 6]}
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold text-slate-600">Kinh nghiệm & Dự án</span>
                        <span className="font-bold text-slate-800">
                          {aiEvaluation.feedback.score_breakdown.experience_impact} / 25
                        </span>
                      </div>
                      <Progress
                        percent={(aiEvaluation.feedback.score_breakdown.experience_impact / 25) * 100}
                        showInfo={false}
                        strokeColor="#8b5cf6"
                        size={["100%", 6]}
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold text-slate-600">Trình bày, độ dài & Chứng chỉ</span>
                        <span className="font-bold text-slate-800">
                          {aiEvaluation.feedback.score_breakdown.format_structure} / 25
                        </span>
                      </div>
                      <Progress
                        percent={(aiEvaluation.feedback.score_breakdown.format_structure / 25) * 100}
                        showInfo={false}
                        strokeColor="#f59e0b"
                        size={["100%", 6]}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Đề xuất cải thiện cụ thể theo từng Section (Cho phép click để chuyển mục) */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <BulbOutlined className="text-amber-500 text-sm" />
                    Đề xuất cải thiện theo từng mục
                  </h4>
                  <span className="text-[11px] font-bold text-slate-400">
                    {aiEvaluation.feedback?.section_suggestions?.length || 0} đề xuất
                  </span>
                </div>

                <div className="space-y-2.5">
                  {aiEvaluation.feedback?.section_suggestions?.map((item: any, idx: number) => {
                    const isError = item.type === "error";
                    const isWarning = item.type === "warning";
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border transition-all ${
                          isError
                            ? "bg-rose-50/60 border-rose-200"
                            : isWarning
                            ? "bg-amber-50/60 border-amber-200"
                            : "bg-blue-50/60 border-blue-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                              isError
                                ? "bg-rose-100 text-rose-700"
                                : isWarning
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {item.section_title}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed mb-2.5">
                          {item.message}
                        </p>
                        <Button
                          type="link"
                          size="small"
                          icon={<ArrowRightOutlined />}
                          onClick={() => onNavigateSection(item.section_id)}
                          className="p-0 h-auto text-xs font-bold text-[#0062ff] hover:text-blue-700 inline-flex items-center gap-1"
                        >
                          {item.action_label || "Chỉnh sửa mục này"}
                        </Button>
                      </div>
                    );
                  })}
                  {(!aiEvaluation.feedback?.section_suggestions ||
                    aiEvaluation.feedback.section_suggestions.length === 0) && (
                    <div className="p-3 text-center text-xs text-slate-500 italic">
                      CV của bạn đã có cấu trúc rất tốt, không có vấn đề lớn cần khắc phục!
                    </div>
                  )}
                </div>
              </div>

              {/* Điểm mạnh & Điểm yếu */}
              <div className="grid grid-cols-1 gap-3">
                {/* Điểm mạnh */}
                <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-200 space-y-2">
                  <h5 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircleOutlined className="text-emerald-600" />
                    Điểm mạnh ghi nhận ({aiEvaluation.feedback?.strengths?.length || 0})
                  </h5>
                  <ul className="space-y-1 text-xs text-emerald-800 pl-4 list-disc marker:text-emerald-500">
                    {aiEvaluation.feedback?.strengths?.map((s: string, idx: number) => (
                      <li key={idx} className="leading-relaxed">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Điểm yếu */}
                <div className="bg-rose-50/50 p-3.5 rounded-2xl border border-rose-200 space-y-2">
                  <h5 className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                    <ExclamationCircleOutlined className="text-rose-600" />
                    Điểm cần tối ưu ({aiEvaluation.feedback?.weaknesses?.length || 0})
                  </h5>
                  <ul className="space-y-1 text-xs text-rose-800 pl-4 list-disc marker:text-rose-500">
                    {aiEvaluation.feedback?.weaknesses?.map((w: string, idx: number) => (
                      <li key={idx} className="leading-relaxed">
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Kỹ năng AI gợi ý bổ sung */}
              {aiEvaluation.feedback?.missing_skills?.length > 0 && (
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2.5">
                  <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <BulbOutlined className="text-blue-600" />
                    Kỹ năng công nghệ đề xuất thêm vào CV
                  </h5>
                  <p className="text-[11px] text-slate-500">
                    Các từ khóa kỹ năng thường xuất hiện cùng nhóm ngành nghề này:
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {aiEvaluation.feedback.missing_skills.map((skill: string, idx: number) => (
                      <Tag key={idx} color="blue" className="rounded-lg text-xs font-semibold py-1 px-2.5">
                        + {skill}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}

              {/* Nút Đánh giá lại */}
              <div className="pt-2">
                <Button
                  block
                  icon={<ReloadOutlined />}
                  onClick={onRunEvaluation}
                  loading={isEvaluating}
                  className="rounded-xl font-bold text-xs h-10 border-slate-300 hover:border-blue-500 text-slate-700"
                >
                  Đánh giá lại CV
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CHẾ ĐỘ 2: SO KHỚP CV VỚI MÔ TẢ CÔNG VIỆC (CV-JD MATCHING)              */}
      {/* ========================================================================= */}
      {mode === "matching" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <FileSearchOutlined className="text-emerald-600" />
              So sánh độ phù hợp với yêu cầu tuyển dụng
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Thuật toán Hybrid (Kỹ năng 40% + TF-IDF Cosine 35% + Kinh nghiệm 25%) sẽ đối chiếu CV của bạn với tin tuyển dụng cụ thể.
            </p>

            {/* Chọn nguồn JD */}
            <div className="space-y-2 pt-1">
              <Segmented
                block
                size="small"
                value={jdSource}
                onChange={(val) => setJdSource(val as any)}
                options={[
                  { value: "select", label: "Chọn tin tuyển dụng CAREZA" },
                  { value: "custom", label: "Dán văn bản JD tự do" },
                ]}
              />

              {jdSource === "select" ? (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 block">
                    Tin tuyển dụng thực tế trên CAREZA:
                  </label>
                  <Select
                    className="w-full"
                    placeholder="Chọn tin tuyển dụng để so khớp..."
                    loading={isLoadingJobs}
                    value={selectedJobId}
                    onChange={(val) => setSelectedJobId(val)}
                    options={publicJobs.map((j) => ({
                      value: j.id,
                      label: `${j.title} (${j.company_name || j.company?.name || "Doanh nghiệp"})`,
                    }))}
                  />
                  {publicJobs.length === 0 && !isLoadingJobs && (
                    <p className="text-[11px] text-amber-600 italic">
                      Hiện chưa có tin tuyển dụng nào được tải. Bạn có thể chuyển sang tab Dán văn bản JD.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 block">
                    Dán mô tả công việc (JD) hoặc yêu cầu kỹ năng:
                  </label>
                  <Input.TextArea
                    rows={4}
                    placeholder="Dán nội dung mô tả công việc, yêu cầu kỹ năng, năm kinh nghiệm từ nhà tuyển dụng vào đây..."
                    value={customJdText}
                    onChange={(e) => setCustomJdText(e.target.value)}
                    className="text-xs rounded-xl"
                  />
                </div>
              )}

              <Button
                type="primary"
                block
                icon={<ThunderboltOutlined />}
                onClick={handleStartMatching}
                loading={isMatching}
                disabled={
                  (jdSource === "select" && !selectedJobId) ||
                  (jdSource === "custom" && !customJdText.trim())
                }
                className="bg-emerald-600 hover:bg-emerald-700 font-bold text-xs h-10 rounded-xl mt-2"
              >
                Bắt đầu so khớp CV - JD
              </Button>
            </div>
          </div>

          {/* Lỗi Matching nếu có */}
          {matchError && (
            <Alert
              type="error"
              showIcon
              message="So khớp thất bại"
              description={matchError}
              className="rounded-xl"
            />
          )}

          {/* Đang so khớp */}
          {isMatching && (
            <div className="bg-white p-8 rounded-2xl border border-emerald-100 text-center space-y-3 shadow-sm">
              <Spin size="large" />
              <h4 className="font-bold text-slate-800 text-sm">AI đang đối chiếu CV với JD...</h4>
              <p className="text-xs text-slate-500">
                Tính toán độ tương đồng TF-IDF, khớp kỹ năng trọng tâm và so sánh năm kinh nghiệm...
              </p>
            </div>
          )}

          {/* Kết quả Matching */}
          {aiMatch && !isMatching && (
            <div className="space-y-4">
              {/* Thẻ Điểm So Khớp Tổng Thể */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Độ phù hợp tổng quan
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span
                      className="text-4xl font-black font-sans tracking-tight"
                      style={{ color: getScoreColor(aiMatch.match_percentage || aiMatch.overall_score) }}
                    >
                      {aiMatch.match_percentage || aiMatch.overall_score}%
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-700">
                    {aiMatch.explanation?.job_title || "Vị trí tuyển dụng"}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {aiMatch.explanation?.summary}
                  </div>
                </div>

                <div className="shrink-0">
                  <Progress
                    type="circle"
                    percent={aiMatch.match_percentage || aiMatch.overall_score}
                    size={76}
                    strokeColor={{
                      "0%": "#10b981",
                      "100%": getScoreColor(aiMatch.match_percentage || aiMatch.overall_score),
                    }}
                    format={(percent) => (
                      <span className="text-xs font-black text-slate-800">{percent}%</span>
                    )}
                  />
                </div>
              </div>

              {/* Chi tiết 3 trụ cột chấm điểm */}
              {aiMatch.explanation?.breakdown && (
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Trọng số đối chiếu tiêu chuẩn
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold text-slate-600">Độ khớp kỹ năng (40%)</span>
                        <span className="font-bold text-emerald-700">
                          {Math.round((aiMatch.explanation.breakdown.skill_score || 0) * 100)}%
                        </span>
                      </div>
                      <Progress
                        percent={Math.round((aiMatch.explanation.breakdown.skill_score || 0) * 100)}
                        showInfo={false}
                        strokeColor="#10b981"
                        size={["100%", 6]}
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold text-slate-600">Từ khóa & Ngữ cảnh TF-IDF (35%)</span>
                        <span className="font-bold text-blue-700">
                          {Math.round((aiMatch.explanation.breakdown.tfidf_cosine || 0) * 100)}%
                        </span>
                      </div>
                      <Progress
                        percent={Math.round((aiMatch.explanation.breakdown.tfidf_cosine || 0) * 100)}
                        showInfo={false}
                        strokeColor="#0062ff"
                        size={["100%", 6]}
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold text-slate-600">Năm kinh nghiệm đáp ứng (25%)</span>
                        <span className="font-bold text-purple-700">
                          {Math.round((aiMatch.explanation.breakdown.experience_score || 0) * 100)}%
                        </span>
                      </div>
                      <Progress
                        percent={Math.round((aiMatch.explanation.breakdown.experience_score || 0) * 100)}
                        showInfo={false}
                        strokeColor="#8b5cf6"
                        size={["100%", 6]}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Bảng Kỹ Năng: Khớp & Chưa thể hiện */}
              <div className="space-y-3">
                {/* Kỹ năng khớp */}
                <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircleOutlined className="text-emerald-600" />
                      Kỹ năng phù hợp ({aiMatch.matching_skills?.length || 0})
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600">Khớp với JD</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {aiMatch.matching_skills?.map((s: string, idx: number) => (
                      <Tag key={idx} color="success" className="text-xs font-semibold py-0.5 px-2">
                        ✓ {s}
                      </Tag>
                    ))}
                    {(!aiMatch.matching_skills || aiMatch.matching_skills.length === 0) && (
                      <span className="text-xs text-slate-400 italic">Chưa có kỹ năng nào khớp.</span>
                    )}
                  </div>
                </div>

                {/* Kỹ năng chưa thể hiện trong CV */}
                <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <WarningOutlined className="text-amber-600" />
                      Kỹ năng JD yêu cầu nhưng chưa có trong CV ({aiMatch.missing_skills?.length || 0})
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Lưu ý: Nếu bạn <strong>đã từng sử dụng</strong> các công cụ này trong thực tế, hãy chủ động bổ sung vào CV để tăng tỷ lệ được chọn. Hệ thống không tự tiện thêm kỹ năng không có thật.
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {aiMatch.missing_skills?.map((s: string, idx: number) => (
                      <Tag key={idx} color="warning" className="text-xs font-semibold py-0.5 px-2">
                        ! {s}
                      </Tag>
                    ))}
                    {(!aiMatch.missing_skills || aiMatch.missing_skills.length === 0) && (
                      <span className="text-xs text-emerald-600 font-semibold">
                        Tuyệt vời! Bạn đáp ứng đầy đủ tất cả kỹ năng yêu cầu trong JD.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Đề xuất tối ưu theo JD */}
              {aiMatch.explanation?.suggestions?.length > 0 && (
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2.5">
                  <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <BulbOutlined className="text-amber-500" />
                    Gợi ý tối ưu CV theo tin tuyển dụng này
                  </h5>
                  <div className="space-y-2">
                    {aiMatch.explanation.suggestions.map((sug: string, idx: number) => (
                      <div
                        key={idx}
                        className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed flex items-start gap-2"
                      >
                        <span className="text-blue-600 font-bold">•</span>
                        <span>{sug}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
