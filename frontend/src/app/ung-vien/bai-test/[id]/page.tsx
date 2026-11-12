"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  Button,
  Tag,
  Space,
  Alert,
  Spin,
  Modal,
  Radio,
  Input,
  Typography,
  Divider,
  Progress,
  Empty,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlayCircleOutlined,
  SaveOutlined,
  SendOutlined,
  WarningOutlined,
  FileDoneOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { candidateService } from "@/services/candidate.service";

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

function formatTimer(totalSeconds: number | null): string {
  if (totalSeconds === null || totalSeconds === undefined || totalSeconds < 0) return "00:00";
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function formatDurationText(seconds?: number | null): string {
  if (seconds === null || seconds === undefined) return "—";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins === 0) return `${secs} giây`;
  return `${mins} phút ${secs} giây`;
}

export default function CandidateTestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params?.id ? String(params.id) : "";

  const [testDetail, setTestDetail] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Trạng thái làm bài
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [attemptStatus, setAttemptStatus] = useState<string>("not_started");
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [answersMap, setAnswersMap] = useState<Record<string, string>>({});

  // Trạng thái lưu & nộp bài
  const [starting, setStarting] = useState<boolean>(false);
  const [savingStatus, setSavingStatus] = useState<"idle" | "saving" | "saved" | "offline">("idle");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [isConfirmSubmitOpen, setIsConfirmSubmitOpen] = useState<boolean>(false);

  const autoSubmitTriggeredRef = useRef<boolean>(false);
  const answersMapRef = useRef<Record<string, string>>({});
  answersMapRef.current = answersMap;

  const getLocalBackupKey = useCallback((attId: number | string) => `careza_test_attempt_${attId}`, []);

  const buildAnswersArray = useCallback((mapObj: Record<string, string>) => {
    return Object.entries(mapObj).map(([qid, ans]) => ({
      question_id: qid,
      answer: ans,
    }));
  }, []);

  const loadTestDetail = useCallback(async () => {
    if (!testId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await candidateService.getCandidateTestDetail(testId);
      const data = res.data?.test;
      if (!data) {
        setError("Không tìm thấy dữ liệu bài kiểm tra.");
        return;
      }

      setTestDetail(data);
      setAttemptId(data.attempt_id || null);
      setAttemptStatus(data.attempt_status || "not_started");

      if (typeof data.remaining_seconds === "number") {
        setRemainingSeconds(data.remaining_seconds);
      } else {
        setRemainingSeconds((data.duration_minutes || 30) * 60);
      }

      // Khôi phục đáp án đã lưu từ Backend + dự phòng localStorage (nếu có)
      const restoredMap: Record<string, string> = {};
      if (Array.isArray(data.saved_answers)) {
        data.saved_answers.forEach((item: any) => {
          if (item && item.question_id !== undefined) {
            restoredMap[String(item.question_id)] = String(item.answer || "");
          }
        });
      }

      if (data.attempt_id && data.attempt_status === "in_progress") {
        try {
          const localRaw = localStorage.getItem(getLocalBackupKey(data.attempt_id));
          if (localRaw) {
            const localParsed = JSON.parse(localRaw);
            if (localParsed && typeof localParsed === "object") {
              Object.entries(localParsed).forEach(([k, v]) => {
                if (typeof v === "string" && v.trim() !== "") {
                  restoredMap[k] = v;
                }
              });
            }
          }
        } catch {
          // Bỏ qua lỗi đọc localStorage
        }
      }

      setAnswersMap(restoredMap);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          "Không thể tải thông tin bài kiểm tra năng lực."
      );
    } finally {
      setLoading(false);
    }
  }, [testId, getLocalBackupKey]);

  useEffect(() => {
    loadTestDetail();
  }, [loadTestDetail]);

  // Hàm lưu nháp đáp án lên Backend
  const syncAnswersToBackend = useCallback(
    async (attId: number, currentMap: Record<string, string>) => {
      try {
        setSavingStatus("saving");
        try {
          localStorage.setItem(getLocalBackupKey(attId), JSON.stringify(currentMap));
        } catch {
          // ignore
        }
        const payload = buildAnswersArray(currentMap);
        const res = await candidateService.saveCandidateTestAttempt(attId, payload);
        if (res.data?.status === "auto_submitted") {
          message.warning("Đã hết thời gian làm bài! Hệ thống đã tự động thu bài và chấm điểm.");
          await loadTestDetail();
          return;
        }
        if (typeof res.data?.remaining_seconds === "number") {
          setRemainingSeconds(res.data.remaining_seconds);
        }
        setSavingStatus("saved");
      } catch {
        setSavingStatus("offline");
      }
    },
    [buildAnswersArray, getLocalBackupKey, loadTestDetail]
  );

  // Tự động nộp bài khi hết giờ
  const handleAutoSubmitOnTimeout = useCallback(async () => {
    if (!attemptId || autoSubmitTriggeredRef.current) return;
    autoSubmitTriggeredRef.current = true;
    try {
      setSubmitting(true);
      const payload = buildAnswersArray(answersMapRef.current);
      await candidateService.submitCandidateTestAttempt(attemptId, payload, true);
      try {
        localStorage.removeItem(getLocalBackupKey(attemptId));
      } catch {
        // ignore
      }
      message.warning("Đã hết thời gian làm bài! Hệ thống đã tự động nộp bài của bạn.");
      await loadTestDetail();
    } catch {
      await loadTestDetail();
    } finally {
      setSubmitting(false);
    }
  }, [attemptId, buildAnswersArray, getLocalBackupKey, loadTestDetail]);

  // Đồng hồ đếm ngược khi đang làm bài
  useEffect(() => {
    if (attemptStatus !== "in_progress") return;
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmitOnTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [attemptStatus, handleAutoSubmitOnTimeout]);

  const handleStartTest = async () => {
    if (!testDetail) return;
    try {
      setStarting(true);
      const res = await candidateService.startCandidateTest(testDetail.id, testDetail.application_id);
      const data = res.data;
      setAttemptId(data.attempt_id);
      setAttemptStatus("in_progress");
      autoSubmitTriggeredRef.current = false;
      if (typeof data.remaining_seconds === "number") {
        setRemainingSeconds(data.remaining_seconds);
      } else {
        setRemainingSeconds((data.duration_minutes || testDetail.duration_minutes || 30) * 60);
      }
      message.success("Đã bắt đầu tính giờ làm bài kiểm tra!");
      await loadTestDetail();
    } catch (err: any) {
      const errData = err?.response?.data;
      const errMsg =
        errData?.attempt?.[0] ||
        errData?.attempt ||
        errData?.deadline?.[0] ||
        errData?.test?.[0] ||
        errData?.detail ||
        errData?.message ||
        "Không thể bắt đầu bài kiểm tra.";
      message.error(String(errMsg));
      await loadTestDetail();
    } finally {
      setStarting(false);
    }
  };

  const handleSelectAnswer = (questionId: number | string, value: string) => {
    if (attemptStatus !== "in_progress" || !attemptId) return;
    const qKey = String(questionId);
    const updatedMap = { ...answersMap, [qKey]: value };
    setAnswersMap(updatedMap);
    syncAnswersToBackend(attemptId, updatedMap);
  };

  const handleConfirmSubmit = async () => {
    if (!attemptId) return;
    try {
      setSubmitting(true);
      const payload = buildAnswersArray(answersMap);
      await candidateService.submitCandidateTestAttempt(attemptId, payload, false);
      try {
        localStorage.removeItem(getLocalBackupKey(attemptId));
      } catch {
        // ignore
      }
      setIsConfirmSubmitOpen(false);
      message.success("Nộp bài kiểm tra thành công!");
      await loadTestDetail();
    } catch (err: any) {
      const errData = err?.response?.data;
      const errMsg =
        errData?.attempt?.[0] ||
        errData?.attempt ||
        errData?.detail ||
        errData?.message ||
        "Nộp bài thất bại.";
      message.error(String(errMsg));
      setIsConfirmSubmitOpen(false);
      await loadTestDetail();
    } finally {
      setSubmitting(false);
    }
  };

  const questions: any[] = useMemo(() => testDetail?.questions || [], [testDetail]);
  const answeredCount = useMemo(() => {
    return questions.filter((q) => {
      const val = answersMap[String(q.id)];
      return val !== undefined && String(val).trim() !== "";
    }).length;
  }, [questions, answersMap]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto w-full px-4 py-20 flex justify-center items-center">
        <Spin size="large" tip="Đang tải bài kiểm tra năng lực..." />
      </div>
    );
  }

  if (error || !testDetail) {
    return (
      <div className="max-w-4xl mx-auto w-full px-4 py-10 space-y-4">
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.push("/ung-vien/bai-test")}>
          Quay lại danh sách bài kiểm tra
        </Button>
        <Alert
          type="error"
          showIcon
          message="Không thể truy cập bài kiểm tra"
          description={error || "Bài kiểm tra không tồn tại hoặc bạn không có quyền truy cập."}
          action={
            <Button size="small" danger icon={<ReloadOutlined />} onClick={loadTestDetail}>
              Thử lại
            </Button>
          }
        />
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIdx] || null;

  return (
    <div className="max-w-5xl mx-auto w-full px-4 space-y-6 flex-1">
      {/* Header điều hướng */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/ung-vien/bai-test")}
          className="w-fit rounded-lg"
        >
          Danh sách bài kiểm tra
        </Button>

        {attemptStatus === "in_progress" && (
          <div className="flex items-center gap-3 flex-wrap">
            {savingStatus === "saving" && <Tag color="processing">Đang lưu đáp án...</Tag>}
            {savingStatus === "saved" && (
              <Tag color="success" icon={<CheckCircleOutlined />}>
                Đã lưu tự động
              </Tag>
            )}
            {savingStatus === "offline" && (
              <Tag color="warning" icon={<WarningOutlined />}>
                Mất kết nối — Đã lưu dự phòng trên trình duyệt
              </Tag>
            )}
            <div
              className={`px-4 py-1.5 rounded-lg font-extrabold text-sm flex items-center gap-2 border ${
                (remainingSeconds ?? 999) <= 300
                  ? "bg-rose-50 text-rose-600 border-rose-200 animate-pulse"
                  : "bg-blue-50 text-blue-700 border-blue-200"
              }`}
            >
              <ClockCircleOutlined />
              <span>Thời gian còn lại: {formatTimer(remainingSeconds)}</span>
            </div>
          </div>
        )}
      </div>

      {/* TRẠNG THÁI 1: CHƯA BẮT ĐẦU (Màn hình hướng dẫn trước khi làm bài) */}
      {attemptStatus === "not_started" && (
        <Card className="border-slate-200 shadow-sm rounded-2xl">
          <div className="space-y-5">
            <div>
              <Tag color="blue" className="mb-2 font-semibold">
                {testDetail.company_name || "Doanh nghiệp"} • {testDetail.job_title || "Vị trí ứng tuyển"}
              </Tag>
              <Title level={3} className="!m-0 text-slate-900 font-extrabold">
                {testDetail.title}
              </Title>
              {testDetail.description && (
                <Paragraph className="text-slate-600 text-sm mt-2 !mb-0">
                  {testDetail.description}
                </Paragraph>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="text-xs text-slate-500 block">Thời gian làm bài</span>
                <strong className="text-base text-slate-900">{testDetail.duration_minutes || 30} phút</strong>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Số lượng câu hỏi</span>
                <strong className="text-base text-slate-900">{testDetail.total_questions || 0} câu hỏi</strong>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Điểm đạt yêu cầu</span>
                <strong className="text-base text-blue-600">{testDetail.passing_score ?? 70} / 100 điểm</strong>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Hạn hoàn thành</span>
                <strong className="text-base text-slate-900">
                  {testDetail.deadline
                    ? new Date(testDetail.deadline).toLocaleDateString("vi-VN")
                    : "Không giới hạn"}
                </strong>
              </div>
            </div>

            <Alert
              type="info"
              showIcon
              message="Hướng dẫn & Quy chế làm bài kiểm tra"
              description={
                <ul className="list-disc pl-5 mt-1 space-y-1 text-xs sm:text-sm text-slate-700">
                  <li>
                    Thời gian làm bài (<strong>{testDetail.duration_minutes || 30} phút</strong>) sẽ bắt đầu đếm
                    ngược ngay khi bạn nhấn nút <strong>Bắt đầu làm bài</strong>.
                  </li>
                  <li>
                    Câu trả lời của bạn được tự động lưu nháp mỗi khi chọn đáp án hoặc chuyển câu hỏi. Nếu tải lại
                    trang hoặc gián đoạn mạng, bạn vẫn có thể tiếp tục với thời gian còn lại.
                  </li>
                  <li>
                    Khi hết thời gian làm bài, hệ thống sẽ <strong>tự động thu bài</strong> và chấm điểm dựa trên các
                    câu trả lời đã lưu.
                  </li>
                  <li>Mỗi bài kiểm tra chỉ được phép nộp một lần duy nhất.</li>
                </ul>
              }
            />

            <div className="flex justify-end pt-2">
              <Button
                type="primary"
                size="large"
                icon={<PlayCircleOutlined />}
                loading={starting}
                disabled={questions.length === 0}
                onClick={handleStartTest}
                className="bg-blue-600 hover:bg-blue-700 font-bold rounded-xl px-8"
              >
                Bắt đầu làm bài ngay
              </Button>
            </div>
            {questions.length === 0 && (
              <Alert
                type="warning"
                showIcon
                message="Bài kiểm tra này đang được nhà tuyển dụng cập nhật câu hỏi. Vui lòng quay lại sau."
              />
            )}
          </div>
        </Card>
      )}

      {/* TRẠNG THÁI 2: ĐANG LÀM BÀI */}
      {attemptStatus === "in_progress" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cột trái: Nội dung câu hỏi hiện tại */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-slate-200 shadow-sm rounded-2xl">
              {currentQuestion ? (
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <Space>
                      <Tag color="blue" className="font-bold">
                        Câu {currentQuestionIdx + 1} / {questions.length}
                      </Tag>
                      <Tag>
                        {currentQuestion.type === "essay" ? "Câu hỏi tự luận" : "Trắc nghiệm 1 đáp án"}
                      </Tag>
                    </Space>
                    <Text className="text-xs font-semibold text-slate-500">
                      Điểm câu hỏi: {currentQuestion.points || 10} điểm
                    </Text>
                  </div>

                  <div className="text-base font-bold text-slate-900 whitespace-pre-wrap">
                    {currentQuestion.question}
                  </div>

                  {currentQuestion.type === "multiple_choice" ? (
                    <Radio.Group
                      value={answersMap[String(currentQuestion.id)] || ""}
                      onChange={(e) => handleSelectAnswer(currentQuestion.id, e.target.value)}
                      className="w-full space-y-3"
                    >
                      {(currentQuestion.options || []).map((opt: string, oIdx: number) => {
                        const isSelected = answersMap[String(currentQuestion.id)] === opt;
                        return (
                          <div
                            key={oIdx}
                            onClick={() => handleSelectAnswer(currentQuestion.id, opt)}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                              isSelected
                                ? "border-blue-600 bg-blue-50/70 shadow-2xs"
                                : "border-slate-200 hover:border-blue-300 bg-white"
                            }`}
                          >
                            <Radio value={opt} />
                            <span className="text-sm text-slate-800 font-medium">{opt}</span>
                          </div>
                        );
                      })}
                    </Radio.Group>
                  ) : (
                    <TextArea
                      rows={6}
                      placeholder="Nhập câu trả lời tự luận của bạn tại đây..."
                      value={answersMap[String(currentQuestion.id)] || ""}
                      onChange={(e) => handleSelectAnswer(currentQuestion.id, e.target.value)}
                    />
                  )}

                  <Divider className="!my-4" />

                  <div className="flex items-center justify-between gap-2">
                    <Button
                      disabled={currentQuestionIdx === 0}
                      onClick={() => setCurrentQuestionIdx((i) => Math.max(0, i - 1))}
                    >
                      Câu trước
                    </Button>

                    <Space>
                      {attemptId && (
                        <Button
                          icon={<SaveOutlined />}
                          onClick={() => syncAnswersToBackend(attemptId, answersMap)}
                        >
                          Lưu nháp
                        </Button>
                      )}
                      {currentQuestionIdx < questions.length - 1 ? (
                        <Button
                          type="primary"
                          onClick={() => setCurrentQuestionIdx((i) => Math.min(questions.length - 1, i + 1))}
                          className="bg-blue-600"
                        >
                          Câu tiếp theo
                        </Button>
                      ) : (
                        <Button
                          type="primary"
                          icon={<SendOutlined />}
                          onClick={() => setIsConfirmSubmitOpen(true)}
                          className="bg-emerald-600 hover:bg-emerald-700 border-none font-semibold"
                        >
                          Hoàn tất & Nộp bài
                        </Button>
                      )}
                    </Space>
                  </div>
                </div>
              ) : (
                <Empty description="Không có câu hỏi nào trong bài kiểm tra này." />
              )}
            </Card>
          </div>

          {/* Cột phải: Bảng điều hướng câu hỏi & Nút nộp bài */}
          <div className="space-y-4">
            <Card className="border-slate-200 shadow-sm rounded-2xl">
              <div className="space-y-4">
                <div>
                  <Text strong className="text-sm text-slate-800 block">
                    Tiến độ hoàn thành
                  </Text>
                  <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                    <span>
                      Đã trả lời: <strong>{answeredCount}</strong> / {questions.length} câu
                    </span>
                    <span>
                      {questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0}%
                    </span>
                  </div>
                  <Progress
                    percent={questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0}
                    showInfo={false}
                    strokeColor="#2563eb"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Text strong className="text-xs text-slate-600 block mb-2">
                    Danh sách câu hỏi:
                  </Text>
                  <div className="grid grid-cols-5 gap-2">
                    {questions.map((q, idx) => {
                      const isAnswered =
                        answersMap[String(q.id)] !== undefined &&
                        String(answersMap[String(q.id)]).trim() !== "";
                      const isCurrent = idx === currentQuestionIdx;
                      return (
                        <Button
                          key={q.id ?? idx}
                          size="small"
                          onClick={() => setCurrentQuestionIdx(idx)}
                          className={`font-bold text-xs h-9 rounded-lg ${
                            isCurrent
                              ? "border-2 border-blue-600 text-blue-600 bg-blue-50"
                              : isAnswered
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : ""
                          }`}
                        >
                          {idx + 1}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <Divider className="!my-2" />

                <Button
                  type="primary"
                  block
                  size="large"
                  icon={<SendOutlined />}
                  onClick={() => setIsConfirmSubmitOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 font-bold rounded-xl"
                >
                  Nộp bài kiểm tra
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TRẠNG THÁI 3: ĐÃ HOÀN THÀNH / XEM KẾT QUẢ */}
      {(attemptStatus === "completed" || attemptStatus === "pending_manual_grading") && (
        <Card className="border-slate-200 shadow-sm rounded-2xl">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <Tag color="blue" className="mb-1 font-semibold">
                  {testDetail.company_name || "Doanh nghiệp"} • {testDetail.job_title || "Vị trí ứng tuyển"}
                </Tag>
                <Title level={3} className="!m-0 text-slate-900 font-extrabold">
                  Kết quả: {testDetail.title}
                </Title>
                <Text className="text-xs text-slate-500">
                  Nộp lúc:{" "}
                  {testDetail.completed_at
                    ? new Date(testDetail.completed_at).toLocaleString("vi-VN")
                    : "—"}{" "}
                  • Thời gian hoàn thành: {formatDurationText(testDetail.duration_seconds)}
                </Text>
              </div>

              <div>
                {attemptStatus === "pending_manual_grading" ? (
                  <Tag color="processing" className="text-sm px-3 py-1 font-bold rounded-lg">
                    CHỜ DOANH NGHIỆP CHẤM TỰ LUẬN
                  </Tag>
                ) : testDetail.is_passed ? (
                  <Tag
                    color="success"
                    icon={<CheckCircleOutlined />}
                    className="text-sm px-4 py-1.5 font-extrabold rounded-lg"
                  >
                    ĐẠT YÊU CẦU (PASSED)
                  </Tag>
                ) : (
                  <Tag
                    color="error"
                    icon={<CloseCircleOutlined />}
                    className="text-sm px-4 py-1.5 font-extrabold rounded-lg"
                  >
                    CHƯA ĐẠT (FAILED)
                  </Tag>
                )}
              </div>
            </div>

            {testDetail.auto_submitted && (
              <Alert
                type="warning"
                showIcon
                message="Bài kiểm tra này được hệ thống tự động thu bài khi hết thời gian làm bài."
              />
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="text-xs text-slate-500 block">Điểm số đạt được</span>
                <strong className="text-xl text-blue-600">{testDetail.score ?? 0} / 100</strong>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Điểm đạt tối thiểu</span>
                <strong className="text-xl text-slate-800">{testDetail.passing_score ?? 70} / 100</strong>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Điểm thành phần</span>
                <strong className="text-xl text-slate-800">
                  {testDetail.earned_points ?? 0} / {testDetail.total_points ?? 0} điểm
                </strong>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Thời gian làm bài</span>
                <strong className="text-xl text-slate-800">
                  {formatDurationText(testDetail.duration_seconds)}
                </strong>
              </div>
            </div>

            {testDetail.feedback && (
              <Alert
                type="info"
                showIcon
                icon={<FileDoneOutlined />}
                message="Nhận xét từ Doanh nghiệp tuyển dụng"
                description={testDetail.feedback}
              />
            )}

            {Array.isArray(testDetail.evaluated_answers) && testDetail.evaluated_answers.length > 0 && (
              <div className="space-y-3">
                <Text strong className="text-sm text-slate-800 block">
                  Chi tiết bài làm đã nộp:
                </Text>
                {testDetail.evaluated_answers.map((ans: any, idx: number) => (
                  <Card key={idx} size="small" className="border-slate-100 rounded-xl">
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-xs sm:text-sm space-y-1">
                        <div className="font-bold text-slate-800">
                          Câu {idx + 1}: {ans.question || `Câu hỏi #${ans.question_id}`}
                        </div>
                        <div className="text-slate-600">
                          Câu trả lời của bạn:{" "}
                          <strong className="text-slate-900">
                            {ans.user_answer || <i className="text-slate-400">(Không trả lời)</i>}
                          </strong>
                        </div>
                      </div>
                      <div>
                        {ans.type === "multiple_choice" ? (
                          ans.is_correct ? (
                            <Tag color="success">
                              Đúng (+{ans.earned_points ?? ans.score ?? 0}/{ans.points ?? 10}đ)
                            </Tag>
                          ) : (
                            <Tag color="error">Sai (0/{ans.points ?? 10}đ)</Tag>
                          )
                        ) : (
                          <Tag color="processing">Tự luận</Tag>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* TRẠNG THÁI 4: HẾT HẠN HOẶC ĐÃ ĐÓNG */}
      {attemptStatus === "expired" && (
        <Alert
          type="warning"
          showIcon
          message="Bài kiểm tra đã hết hạn hoặc ngừng nhận bài"
          description="Rất tiếc, bài kiểm tra năng lực này đã quá hạn hoàn thành hoặc đã được nhà tuyển dụng đóng lại."
        />
      )}

      {/* Modal xác nhận nộp bài */}
      <Modal
        title="Xác nhận nộp bài kiểm tra"
        open={isConfirmSubmitOpen}
        onCancel={() => setIsConfirmSubmitOpen(false)}
        onOk={handleConfirmSubmit}
        okText="Xác nhận nộp bài"
        cancelText="Quay lại kiểm tra"
        confirmLoading={submitting}
        okButtonProps={{ className: "bg-blue-600" }}
      >
        <div className="space-y-3 py-2 text-sm text-slate-700">
          <p>
            Bạn đã trả lời <strong>{answeredCount}</strong> trên tổng số{" "}
            <strong>{questions.length}</strong> câu hỏi.
          </p>
          {answeredCount < questions.length && (
            <Alert
              type="warning"
              showIcon
              message={`Còn ${questions.length - answeredCount} câu hỏi chưa được trả lời!`}
            />
          )}
          <p className="text-xs text-slate-500">
            Lưu ý: Sau khi xác nhận nộp bài, bạn sẽ không thể chỉnh sửa đáp án hoặc làm lại bài kiểm tra này.
          </p>
        </div>
      </Modal>
    </div>
  );
}

