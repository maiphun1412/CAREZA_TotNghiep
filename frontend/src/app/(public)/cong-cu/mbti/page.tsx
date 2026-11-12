"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Modal, message, Progress } from "antd";
import {
  Brain,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  Shield,
  BookOpen,
  Headphones,
  Calculator,
  ShieldCheck,
  Bot,
  Lightbulb,
  Compass,
  Users,
  Grid,
  ChevronLeft,
  AlertTriangle,
  Award,
  Sparkles,
} from "lucide-react";

import { AssessmentType, ASSESSMENTS_CATALOG } from "./data/assessment-types";
import { AssessmentSelector } from "./components/assessment-selector";
import { MBTI_QUESTIONS, calculateMbtiScore } from "./data/mbti-data";
import { RIASEC_QUESTIONS, calculateRiasecScore } from "./data/riasec-data";
import { BIGFIVE_QUESTIONS, LIKERT_OPTIONS, calculateBigFiveScore } from "./data/bigfive-data";
import { DISC_QUESTIONS, STANDARD_DISC_OPTIONS, calculateDiscScore } from "./data/disc-data";

import { MbtiResultView } from "./components/mbti-result-view";
import { RiasecResultView } from "./components/riasec-result-view";
import { BigFiveResultView } from "./components/bigfive-result-view";
import { DiscResultView } from "./components/disc-result-view";

interface AnswerItem {
  label: string;
  score: number;
  value: any;
  trait?: string;
  weight?: number;
}

function AssessmentMainContent() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") as AssessmentType | null;

  // Quản lý bài trắc nghiệm đang chọn: null = màn hình danh sách (Hub)
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<AssessmentType | null>(
    initialType && ["mbti", "riasec", "bigfive", "disc"].includes(initialType) ? initialType : null
  );

  // Trạng thái câu hỏi & bài làm
  const [currentStep, setCurrentStep] = useState<number>(2); // 2: Trả lời, 3: Kết quả
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<{ [questionId: number]: AnswerItem }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [testCompleted, setTestCompleted] = useState<boolean>(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState<boolean>(false);
  const [pendingAssessmentId, setPendingAssessmentId] = useState<AssessmentType | null>(null);

  // Cập nhật khi URL param thay đổi
  useEffect(() => {
    const type = searchParams.get("type") as AssessmentType | null;
    if (type && ["mbti", "riasec", "bigfive", "disc"].includes(type)) {
      setSelectedAssessmentId(type);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setTestCompleted(false);
      setCurrentStep(2);
    }
  }, [searchParams]);

  // Bộ câu hỏi ứng với bài test hiện tại
  const currentQuestions = useMemo(() => {
    switch (selectedAssessmentId) {
      case "mbti":
        return MBTI_QUESTIONS;
      case "riasec":
        return RIASEC_QUESTIONS;
      case "bigfive":
        return BIGFIVE_QUESTIONS;
      case "disc":
        return DISC_QUESTIONS;
      default:
        return MBTI_QUESTIONS;
    }
  }, [selectedAssessmentId]);

  const activeAssessmentMeta = useMemo(() => {
    return ASSESSMENTS_CATALOG.find((a) => a.id === selectedAssessmentId) || ASSESSMENTS_CATALOG[0];
  }, [selectedAssessmentId]);

  const currentQuestion = currentQuestions[currentQuestionIndex] || currentQuestions[0];
  const totalQuestions = currentQuestions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);

  // Lựa chọn options phù hợp cho từng loại câu hỏi
  const currentQuestionOptions = useMemo(() => {
    if (!currentQuestion) return [];
    if ("options" in currentQuestion && Array.isArray((currentQuestion as any).options)) {
      return (currentQuestion as any).options;
    }
    if (selectedAssessmentId === "bigfive") {
      return LIKERT_OPTIONS;
    }
    if (selectedAssessmentId === "disc") {
      return STANDARD_DISC_OPTIONS;
    }
    return [];
  }, [currentQuestion, selectedAssessmentId]);

  // Danh sách các câu chưa trả lời
  const unansweredIndices = useMemo(() => {
    const list: number[] = [];
    currentQuestions.forEach((q, idx) => {
      if (!answers[q.id]) {
        list.push(idx);
      }
    });
    return list;
  }, [currentQuestions, answers]);

  // Chọn đáp án (chỉ 1 duy nhất trên mỗi câu hỏi)
  const handleSelectOption = (item: AnswerItem) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: item,
    }));
  };

  // Chuyển câu tiếp theo hoặc hoàn thành
  const handleNextQuestion = () => {
    if (!answers[currentQuestion.id]) {
      message.warning("Vui lòng chọn 1 phương án để tiếp tục!");
      return;
    }

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleCheckAndSubmit();
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // Kiểm tra trước khi nộp bài
  const handleCheckAndSubmit = () => {
    if (unansweredIndices.length > 0) {
      const firstMissingIndex = unansweredIndices[0];
      const missingQuestionsDisplay = unansweredIndices
        .slice(0, 5)
        .map((i) => `Câu ${i + 1}`)
        .join(", ");
      const extraCount = unansweredIndices.length > 5 ? ` và ${unansweredIndices.length - 5} câu khác` : "";

      Modal.confirm({
        title: "Chưa hoàn thành toàn bộ câu hỏi",
        icon: <AlertTriangle className="text-amber-500 w-5 h-5 mr-2 inline" />,
        content: (
          <div className="space-y-2 text-xs text-slate-600 py-1">
            <p>
              Bạn còn <strong className="text-rose-600">{unansweredIndices.length}</strong> câu hỏi chưa trả lời (
              {missingQuestionsDisplay}
              {extraCount}).
            </p>
            <p>Để nhận được phân tích kết quả chính xác và đầy đủ nhất, vui lòng trả lời hết tất cả các câu hỏi.</p>
          </div>
        ),
        okText: "Đi tới câu chưa trả lời",
        cancelText: "Đóng",
        okButtonProps: { className: "bg-[#0062ff]" },
        onOk: () => {
          setCurrentQuestionIndex(firstMissingIndex);
        },
      });
      return;
    }

    // Đã hoàn thành toàn bộ câu hỏi -> Submit
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setTestCompleted(true);
      setCurrentStep(3);
      message.success(`Đã phân tích xong kết quả trắc nghiệm ${activeAssessmentMeta.name}!`);
      window.scrollTo({ top: 150, behavior: "smooth" });
    }, 600);
  };

  // Tính toán kết quả tương ứng
  const mbtiResult = useMemo(() => {
    if (selectedAssessmentId !== "mbti") return null;
    const formatted: { [key: number]: { trait: string; weight: number } } = {};
    Object.entries(answers).forEach(([qId, ans]) => {
      formatted[Number(qId)] = {
        trait: ans.trait || (ans.value as string) || "I",
        weight: ans.weight || ans.score || 1,
      };
    });
    return calculateMbtiScore(formatted);
  }, [selectedAssessmentId, answers]);

  const riasecResult = useMemo(() => {
    if (selectedAssessmentId !== "riasec") return null;
    const formatted: { [key: number]: { label: string; score: number } } = {};
    Object.entries(answers).forEach(([qId, ans]) => {
      formatted[Number(qId)] = {
        label: ans.label,
        score: ans.score,
      };
    });
    return calculateRiasecScore(formatted);
  }, [selectedAssessmentId, answers]);

  const bigfiveResult = useMemo(() => {
    if (selectedAssessmentId !== "bigfive") return null;
    const formatted: { [key: number]: { value: number } } = {};
    Object.entries(answers).forEach(([qId, ans]) => {
      formatted[Number(qId)] = {
        value: Number(ans.value || ans.score || 3),
      };
    });
    return calculateBigFiveScore(formatted);
  }, [selectedAssessmentId, answers]);

  const discResult = useMemo(() => {
    if (selectedAssessmentId !== "disc") return null;
    const formatted: { [key: number]: { label: string; score: number } } = {};
    Object.entries(answers).forEach(([qId, ans]) => {
      formatted[Number(qId)] = {
        label: ans.label,
        score: ans.score,
      };
    });
    return calculateDiscScore(formatted);
  }, [selectedAssessmentId, answers]);

  // Bắt đầu chọn 1 bài trắc nghiệm từ Hub
  const handleStartAssessment = (assessmentId: AssessmentType) => {
    setSelectedAssessmentId(assessmentId);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTestCompleted(false);
    setCurrentStep(2);
    window.scrollTo({ top: 150, behavior: "smooth" });
  };

  // Xác nhận đổi bài trắc nghiệm khác
  const requestSwitchAssessment = (targetId?: AssessmentType | null) => {
    if (answeredCount > 0 && !testCompleted) {
      setPendingAssessmentId(targetId ?? null);
      setIsSwitchModalOpen(true);
    } else {
      setSelectedAssessmentId(targetId ?? null);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setTestCompleted(false);
      setCurrentStep(2);
      window.scrollTo({ top: 150, behavior: "smooth" });
    }
  };

  const confirmSwitchAssessment = () => {
    setSelectedAssessmentId(pendingAssessmentId);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTestCompleted(false);
    setCurrentStep(2);
    setIsSwitchModalOpen(false);
    setPendingAssessmentId(null);
    window.scrollTo({ top: 150, behavior: "smooth" });
  };

  // Làm lại bài test hiện tại
  const handleResetTest = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setTestCompleted(false);
    setCurrentStep(2);
    setIsResetModalOpen(false);
    message.info(`Đã làm mới bài trắc nghiệm ${activeAssessmentMeta.name}. Bắt đầu lại từ câu 1.`);
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 pb-12 pt-2 bg-[#f7faff] min-h-screen">
      {/* ======================================================== */}
      {/* 1. BREADCRUMB PHÍA TRÊN BANNER                             */}
      {/* ======================================================== */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-2.5 sm:mb-3">
        <Link href="/" className="hover:text-[#0062ff] transition-colors">
          Trang chủ
        </Link>
        <span className="text-slate-300">/</span>
        <Link href="/cong-cu" className="hover:text-[#0062ff] transition-colors">
          Công cụ
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-800 font-semibold">Trắc nghiệm định hướng nghề nghiệp</span>
      </div>

      {/* ======================================================== */}
      {/* 2. HERO BANNER CHUNG CHO TRẮC NGHIỆM (CAO 90–100px)        */}
      {/* ======================================================== */}
      <div className="relative w-full rounded-2xl overflow-hidden h-[94px] md:h-[96px] bg-gradient-to-r from-[#E0EDFF] to-[#D5E7FF] border border-[#BBD7FF] shadow-2xs px-5 sm:px-6 flex items-center justify-between gap-3.5 mb-4">
        <div className="space-y-0.5 max-w-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white/90 text-[#0062ff] border border-[#BBD7FF] flex items-center justify-center shrink-0 shadow-2xs">
              <Compass className="w-4 h-4" />
            </div>
            <h1 className="text-[21px] sm:text-[22px] font-bold text-[#0F172A] tracking-tight m-0 leading-tight">
              {selectedAssessmentId ? activeAssessmentMeta.name : "Trắc nghiệm tính cách & Định hướng nghề nghiệp"}
            </h1>
          </div>

        </div>

        {/* Khung thông tin minh họa phẳng, tối giản phong cách Canva */}
        <div className="hidden md:flex items-center gap-2 bg-white/90 backdrop-blur-xs border border-[#BBD7FF] rounded-lg px-3 py-1.5 shadow-2xs shrink-0 self-center">
          <div className="w-6 h-6 rounded-md bg-[#E0EDFF] text-[#0062ff] flex items-center justify-center shrink-0">
            <Brain className="w-3.5 h-3.5" />
          </div>
          <div className="text-left">
            <span className="text-xs font-bold text-[#0F172A] block leading-tight">4 bài trắc nghiệm</span>
            <span className="text-[10.5px] text-slate-500 font-medium block leading-tight mt-0.5">MBTI • RIASEC • Big Five • DISC</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. CHỌN BÀI TEST (NẾU CHƯA CHỌN BÀI HOẶC MUỐN ĐỔI)        */}
      {/* ======================================================== */}
      {!selectedAssessmentId ? (
        <AssessmentSelector
          onSelectAssessment={handleStartAssessment}
        />
      ) : (
        /* GIAO DIỆN LÀM BÀI HOẶC XEM KẾT QUẢ CỦA BÀI ĐÃ CHỌN */
        <div className="space-y-4">
          {/* Thanh điều hướng bài test đang chọn & Nút đổi bài */}
          <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => requestSwitchAssessment(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Tất cả bài trắc nghiệm</span>
              </button>

              <div className="h-4 w-px bg-slate-200 hidden sm:block" />

              <span className="text-xs font-bold text-slate-800 hidden sm:inline">
                Đang làm: <strong className="text-[#0062ff]">{activeAssessmentMeta.name}</strong> ({totalQuestions} câu)
              </span>
            </div>

            {/* Quick switcher buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {ASSESSMENTS_CATALOG.map((item) => {
                const isSelected = item.id === selectedAssessmentId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (item.id !== selectedAssessmentId) {
                        requestSwitchAssessment(item.id);
                      }
                    }}
                    className={
                      isSelected
                        ? "px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap bg-[#0062ff] text-white shadow-2xs"
                        : "px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }
                  >
                    {item.shortName}
                  </button>
                );
              })}
            </div>
          </div>

          {/* MAIN LAYOUT: KHU VỰC LÀM BÀI / KẾT QUẢ + SIDEBAR */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4.5 items-start">
            {/* CỘT TRÁI: CONTAINER BÀI TEST HOẶC KẾT QUẢ (8/12 HOẶC 9/12) */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-4">
              {/* NẾU ĐÃ HOÀN THÀNH VÀ Ở BƯỚC 3 -> HIỂN THỊ KẾT QUẢ TƯƠNG ỨNG */}
              {currentStep === 3 && testCompleted ? (
                <>
                  {selectedAssessmentId === "mbti" && mbtiResult && (
                    <MbtiResultView
                      result={mbtiResult}
                      onRetake={() => setIsResetModalOpen(true)}
                      onSwitchAssessment={() => requestSwitchAssessment(null)}
                    />
                  )}

                  {selectedAssessmentId === "riasec" && riasecResult && (
                    <RiasecResultView
                      result={riasecResult}
                      onRetake={() => setIsResetModalOpen(true)}
                      onSwitchAssessment={() => requestSwitchAssessment(null)}
                    />
                  )}

                  {selectedAssessmentId === "bigfive" && bigfiveResult && (
                    <BigFiveResultView
                      result={bigfiveResult}
                      onRetake={() => setIsResetModalOpen(true)}
                      onSwitchAssessment={() => requestSwitchAssessment(null)}
                    />
                  )}

                  {selectedAssessmentId === "disc" && discResult && (
                    <DiscResultView
                      result={discResult}
                      onRetake={() => setIsResetModalOpen(true)}
                      onSwitchAssessment={() => requestSwitchAssessment(null)}
                    />
                  )}
                </>
              ) : (
                /* NẾU ĐANG Ở BƯỚC 2: GIAO DIỆN LÀM BÀI TRẮC NGHIỆM */
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E5ECF6] shadow-2xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-slate-800 m-0">
                        {activeAssessmentMeta.name} ({totalQuestions} câu hỏi)
                      </h2>
                      <p className="text-xs text-slate-500 font-normal m-0 mt-0.5">
                        Thời gian dự kiến: {activeAssessmentMeta.estimatedMinutes}. Chọn phương án phản ánh tự nhiên nhất con người bạn.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">
                        Đã làm: <strong className="text-[#0062ff]">{answeredCount}/{totalQuestions}</strong> câu
                      </span>
                    </div>
                  </div>

                  {/* Thanh tiến độ câu hỏi */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>
                        Câu {currentQuestionIndex + 1}/{totalQuestions}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-[#0062ff]">{progressPercent}%</span>
                        <span className="text-slate-400 font-normal hidden sm:inline">|</span>
                        <span className="text-slate-500 font-medium flex items-center gap-1">
                          <span>⏱</span> Ước tính: <strong>{activeAssessmentMeta.estimatedMinutes}</strong>
                        </span>
                      </div>
                    </div>
                    <Progress
                      percent={progressPercent}
                      showInfo={false}
                      strokeColor="#0062ff"
                      trailColor="#e2e8f0"
                      className="m-0"
                    />
                  </div>

                  {/* Hộp câu hỏi */}
                  <div className="p-4 sm:p-5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-4">
                    <div className="flex items-start gap-2.5">
                      <span className="px-2.5 py-1 rounded-lg bg-[#0062ff] text-white font-black text-xs shrink-0">
                        Câu {currentQuestionIndex + 1}
                      </span>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-800 m-0 leading-relaxed pt-0.5">
                        {currentQuestion.q}
                      </h3>
                    </div>

                    {/* Danh sách lựa chọn đáp án */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      {currentQuestionOptions.map((opt: any) => {
                        const isSelected = answers[currentQuestion.id]?.label === opt.label;
                        const optScore = typeof opt.score === "number" ? opt.score : typeof opt.value === "number" ? opt.value : typeof opt.weight === "number" ? opt.weight : 1;
                        const optValue = opt.value ?? opt.trait ?? opt.score ?? opt.label;
                        const optTrait = opt.trait;
                        const optWeight = opt.weight;

                        return (
                          <button
                            key={opt.label}
                            type="button"
                            onClick={() =>
                              handleSelectOption({
                                label: opt.label,
                                score: optScore,
                                value: optValue,
                                trait: optTrait,
                                weight: optWeight,
                              })
                            }
                            className={
                              isSelected
                                ? "p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 bg-blue-50/90 border-[#0062ff] ring-1 ring-[#0062ff] shadow-xs"
                                : "p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 bg-white hover:bg-slate-50 border-slate-200"
                            }
                          >
                            <div
                              className={
                                isSelected
                                  ? "w-5 h-5 rounded-full border flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 bg-[#0062ff] border-[#0062ff] text-white"
                                  : "w-5 h-5 rounded-full border flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 border-slate-300 text-slate-600 bg-white"
                              }
                            >
                              {opt.label}
                            </div>
                            <span className="text-xs font-medium text-slate-700 leading-relaxed">
                              {opt.text}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Thanh điều hướng câu trước / câu tiếp theo */}
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      disabled={currentQuestionIndex === 0}
                      onClick={handlePrevQuestion}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Câu trước</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleNextQuestion}
                        className="px-6 py-2.5 rounded-xl bg-[#0062ff] hover:bg-[#0047ba] text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-all cursor-pointer"
                      >
                        <span>
                          {currentQuestionIndex < totalQuestions - 1
                            ? "Câu tiếp theo"
                            : isSubmitting
                              ? "Đang phân tích..."
                              : "Xem kết quả phân tích"}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Chỉ mục câu hỏi nhanh */}
                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span>Bảng điều hướng nhanh câu hỏi:</span>
                      <span className="text-[11px] text-slate-400">
                        Xanh: Đã trả lời • Trắng: Chưa trả lời
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {currentQuestions.map((q, idx) => {
                        const isDone = !!answers[q.id];
                        const isCurrent = idx === currentQuestionIndex;
                        return (
                          <button
                            key={q.id}
                            type="button"
                            onClick={() => setCurrentQuestionIndex(idx)}
                            className={
                              isCurrent
                                ? "w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ring-2 ring-blue-600 bg-blue-600 text-white shadow-xs"
                                : isDone
                                  ? "w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer bg-blue-100 text-blue-700 hover:bg-blue-200"
                                  : "w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }
                          >
                            {idx + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Section: Bảo mật & Nguồn tham khảo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-4 bg-white rounded-2xl border border-[#E5ECF6] shadow-2xs flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-800 m-0">Bảo mật thông tin</h4>
                    <p className="text-[11px] text-slate-500 m-0 leading-relaxed">
                      Câu trả lời của bạn chỉ được xử lý để tính toán kết quả cá nhân, không chia sẻ cho bên thứ ba.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#E5ECF6] shadow-2xs flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-800 m-0">Chuẩn mực khoa học</h4>
                    <p className="text-[11px] text-slate-500 m-0 leading-relaxed">
                      Hệ thống áp dụng các mô hình tâm lý học & hướng nghiệp kinh điển (Myers-Briggs, John Holland, Big Five, William Marston).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CỘT PHẢI: SIDEBAR (4/12 HOẶC 3/12) */}
            <div className="lg:col-span-4 xl:col-span-3 space-y-3.5">
              {/* Card 1: 💡 Bạn có biết? */}
              <div className="bg-[#fffdf5] rounded-2xl p-4 border border-[#fde68a] shadow-2xs space-y-2.5">
                <h3 className="text-xs font-bold text-slate-800 m-0 flex items-center gap-1.5">
                  <span>💡</span>
                  <span>Lời khuyên khi làm trắc nghiệm</span>
                </h3>
                <ul className="space-y-2 text-[11px] text-slate-700 pl-0 list-none m-0 leading-relaxed">
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">✓</span>
                    <span>Hãy trả lời theo phản xạ đầu tiên và đúng nhất với con người thật của bạn.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">✓</span>
                    <span>Không có phương án đúng hay sai, mỗi phong cách đều có thế mạnh riêng.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">✓</span>
                    <span>Kết quả định hướng nghề nghiệp giúp bạn tự tin hơn khi chọn công việc phù hợp.</span>
                  </li>
                </ul>
              </div>

              {/* Card 2: Danh sách 4 bài test */}
              <div className="bg-white rounded-2xl p-4 border border-[#E5ECF6] shadow-2xs space-y-2.5">
                <h3 className="text-xs font-bold text-slate-800 m-0">
                  Bài trắc nghiệm khác
                </h3>
                <div className="space-y-2">
                  {ASSESSMENTS_CATALOG.map((item) => {
                    const isSelected = item.id === selectedAssessmentId;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => requestSwitchAssessment(item.id)}
                        className={
                          isSelected
                            ? "w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer border-blue-400 bg-blue-50/50"
                            : "w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                        }
                      >
                        <div className="min-w-0 pr-2">
                          <div className="text-xs font-bold text-slate-800 truncate">
                            {item.name}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {item.questionCount} câu • {item.estimatedMinutes}
                          </div>
                        </div>
                        <span className="text-xs font-bold text-[#0062ff] shrink-0">
                          {item.id === selectedAssessmentId ? "Đang làm" : "Chọn →"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Card 3: Công cụ liên quan */}
              <div className="bg-white rounded-2xl p-4 border border-[#E5ECF6] shadow-2xs space-y-2.5">
                <h3 className="text-xs font-bold text-slate-800 m-0">
                  Công cụ hỗ trợ nghề nghiệp
                </h3>
                <div className="space-y-1.5">
                  <Link
                    href="/cong-cu"
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-blue-50/60 border border-transparent hover:border-blue-200 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0">
                        <Calculator className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[11.5px] font-semibold text-slate-700 group-hover:text-[#0062ff] truncate">
                        Tính lương Gross - Net
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0062ff] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>

                  <Link
                    href="/ai-career"
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-blue-50/60 border border-transparent hover:border-blue-200 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[11.5px] font-semibold text-slate-700 group-hover:text-[#0062ff] truncate">
                        Trợ lý AI Career & Phỏng vấn
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0062ff] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>

                  <Link
                    href="/ung-vien/cv"
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-blue-50/60 border border-transparent hover:border-blue-200 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <Award className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[11.5px] font-semibold text-slate-700 group-hover:text-purple-600 truncate">
                        Tạo CV Chuyên nghiệp
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                </div>
              </div>

              {/* Card 4: Cần hỗ trợ */}
              <div className="bg-[#f0f7ff] rounded-2xl p-4 border border-[#dbeafe] shadow-2xs space-y-2.5 relative overflow-hidden">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 m-0">Cần hỗ trợ?</h4>
                  <p className="text-[10.5px] text-slate-600 font-normal m-0 mt-0.5 leading-tight">
                    Đội ngũ Careza luôn sẵn sàng tư vấn định hướng công việc.
                  </p>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => message.info("Tổng đài hỗ trợ Careza: 1900 6868")}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-[#0062ff] font-bold text-[11px] border border-blue-200 shadow-2xs flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <span>Liên hệ hỗ trợ</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-[#0062ff] flex items-center justify-center shrink-0">
                    <Headphones className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. MODAL XÁC NHẬN LÀM LẠI BÀI HIỆN TẠI                    */}
      {/* ======================================================== */}
      <Modal
        title="Xác nhận làm lại bài trắc nghiệm"
        open={isResetModalOpen}
        onCancel={() => setIsResetModalOpen(false)}
        onOk={handleResetTest}
        okText="Tiếp tục làm lại"
        cancelText="Hủy bỏ"
        okButtonProps={{ className: "bg-[#0062ff]" }}
      >
        <p className="text-xs text-slate-600 m-0 py-2">
          Kết quả câu trả lời hiện tại của bài trắc nghiệm {activeAssessmentMeta.name} sẽ được làm mới. Bạn có chắc chắn muốn làm lại từ câu đầu tiên?
        </p>
      </Modal>

      {/* ======================================================== */}
      {/* 4. MODAL XÁC NHẬN ĐỔI SANG BÀI TRẮC NGHIỆM KHÁC           */}
      {/* ======================================================== */}
      <Modal
        title="Đổi bài trắc nghiệm"
        open={isSwitchModalOpen}
        onCancel={() => {
          setIsSwitchModalOpen(false);
          setPendingAssessmentId(null);
        }}
        onOk={confirmSwitchAssessment}
        okText="Đồng ý chuyển bài"
        cancelText="Ở lại bài hiện tại"
        okButtonProps={{ className: "bg-[#0062ff]" }}
      >
        <p className="text-xs text-slate-600 m-0 py-2">
          Bạn đang có tiến độ làm bài dở dang ({answeredCount}/{totalQuestions} câu). Nếu chuyển sang bài khác, tiến độ của bài hiện tại sẽ được khởi tạo lại. Bạn có chắc chắn muốn chuyển?
        </p>
      </Modal>
    </div>
  );
}

export default function AssessmentPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Đang tải trắc nghiệm Careza...</div>}>
      <AssessmentMainContent />
    </Suspense>
  );
}
