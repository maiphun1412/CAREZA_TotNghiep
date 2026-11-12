"use client";

import { useState } from "react";
import { Card, Tabs, Input, Button, Avatar, Typography, Space, Progress, Tag, Alert, message, Spin, Divider } from "antd";
import { RobotOutlined, SendOutlined, UserOutlined, StarOutlined, ThunderboltOutlined, FileTextOutlined } from "@ant-design/icons";
import { aiService } from "@/services/ai.service";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const INTRO_CHATS = [
  {
    id: "ai-intro",
    sender: "ai",
    text: "Xin chào! Tôi là Trợ lý Hướng nghiệp AI của CAREZA. Tôi có thể hỗ trợ giải đáp các quy định tuyển dụng, cách viết CV, quy trình phỏng vấn hoặc tra cứu thông tin chính thức trong cơ sở tri thức CAREZA. Bạn muốn tìm hiểu nội dung gì?",
    time: "10:00",
    citations: [] as any[],
  },
];

export default function CandidateAiAssistantPage() {
  const [activeTab, setActiveTab] = useState("career");

  // Chatbot RAG state
  const [chatMessages, setChatMessages] = useState(INTRO_CHATS);
  const [chatInput, setChatInput] = useState("");
  const [sessionId, setSessionId] = useState<number | undefined>(undefined);
  const [aiResponding, setAiResponding] = useState(false);

  // Mock Interview state
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [startingInterview, setStartingInterview] = useState(false);
  const [interviewId, setInterviewId] = useState<number | null>(null);
  const [interviewQuestions, setInterviewQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answerInput, setAnswerInput] = useState("");
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [interviewResult, setInterviewResult] = useState<any>(null);

  // Xử lý gửi tin nhắn Chatbot RAG
  const handleSendChatMessage = async () => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: trimmed,
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      citations: [],
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setAiResponding(true);

    try {
      const res = await aiService.chatRag(trimmed, sessionId);
      const data = res?.data;
      if (data?.session_id) {
        setSessionId(data.session_id);
      }

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: data?.content || "Hệ thống AI đã tiếp nhận câu hỏi của bạn.",
        time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        citations: data?.retrieved_chunks || [],
      };
      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.question?.[0] ||
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Không thể kết nối đến Trợ lý AI. Vui lòng thử lại sau.";
      message.error(errMsg);
    } finally {
      setAiResponding(false);
    }
  };

  // Khởi tạo phiên Phỏng vấn AI thực tế
  const handleStartInterview = async () => {
    setStartingInterview(true);
    try {
      const res = await aiService.createMockInterview({
        target_role: "Lập trình viên Fullstack",
        level: "middle",
        years_of_experience: 3,
      });

      const data = res?.data;
      const createdInterview = data?.interview || data;
      const qList = createdInterview?.questions || [];

      if (!qList || qList.length === 0) {
        message.warning("Hiện tại chưa có bộ câu hỏi phù hợp. Vui lòng thử lại.");
        return;
      }

      setInterviewId(createdInterview.interview_id || createdInterview.id);
      setInterviewQuestions(qList);
      setCurrentQuestionIndex(0);
      setAnswerInput("");
      setInterviewResult(null);
      setInterviewStarted(true);
      message.success("Đã khởi tạo phiên phỏng vấn AI thành công!");
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Không thể khởi tạo phiên phỏng vấn AI. Vui lòng kiểm tra quyền đăng nhập.";
      message.error(errMsg);
    } finally {
      setStartingInterview(false);
    }
  };

  // Nộp câu trả lời và chuyển câu hoặc hoàn thành
  const handleNextQuestion = async () => {
    const trimmed = answerInput.trim();
    if (!trimmed) {
      message.error("Vui lòng nhập câu trả lời của bạn!");
      return;
    }

    if (!interviewId || interviewQuestions.length === 0) return;
    const currentQ = interviewQuestions[currentQuestionIndex];

    setSubmittingAnswer(true);
    try {
      await aiService.submitAnswer(interviewId, {
        question_id: currentQ.id || currentQuestionIndex + 1,
        answer_text: trimmed,
        duration_seconds: 45,
      });

      setAnswerInput("");

      if (currentQuestionIndex < interviewQuestions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        message.success("Đã ghi nhận câu trả lời. Hãy trả lời câu tiếp theo!");
      } else {
        // Đã hoàn thành câu cuối -> yêu cầu tổng kết báo cáo
        setEvaluating(true);
        const completeRes = await aiService.completeMockInterview(interviewId);
        const reportData = completeRes?.data?.report || completeRes?.data;

        setInterviewResult({
          score: reportData?.overall_score || reportData?.content_score || 8.0,
          positives:
            Array.isArray(reportData?.strengths) && reportData.strengths.length > 0
              ? reportData.strengths.join(". ")
              : "Thể hiện được nền tảng kiến thức và khả năng tiếp cận vấn đề.",
          negatives:
            Array.isArray(reportData?.improvements) && reportData.improvements.length > 0
              ? reportData.improvements.join(". ")
              : "Cần bổ sung thêm ví dụ thực tế và giải pháp kỹ thuật chi tiết hơn.",
          advice:
            reportData?.feedback ||
            reportData?.advice ||
            "Tiếp tục củng cố kiến thức chuyên môn và rèn luyện kỹ năng trình bày có cấu trúc theo phương pháp STAR.",
        });
        setEvaluating(false);
      }
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.answer?.[0] ||
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Không thể gửi câu trả lời. Vui lòng thử lại.";
      message.error(errMsg);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  return (
    <div className="space-y-8 flex-1 flex flex-col">
      {/* Header */}
      <div>
        <h3 className="m-0 text-slate-800 font-extrabold text-xl sm:text-2xl flex items-center gap-2">
          <RobotOutlined className="text-blue-600 animate-bounce" /> Trung tâm Trí tuệ Nhân tạo AI
        </h3>
        <span className="text-xs text-slate-500 block mt-1">
          Hỏi đáp tri thức nghề nghiệp chuẩn xác và luyện tập phỏng vấn thử với công nghệ AI của CAREZA
        </span>
      </div>

      <Card className="border-slate-100 shadow-sm flex-1 flex flex-col" styles={{ body: { padding: 16 } }} style={{ borderRadius: 12 }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {/* Tab 1: AI Career Assistant Chatbot (RAG) */}
          <Tabs.TabPane
            tab={
              <span className="flex items-center gap-1.5 font-semibold text-xs sm:text-sm">
                <RobotOutlined /> Trợ lý Hướng nghiệp AI
              </span>
            }
            key="career"
          >
            <div className="flex flex-col h-[520px] justify-between bg-slate-50/50 rounded-2xl border border-slate-100 p-4">
              {/* Message Box */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 flex flex-col">
                {chatMessages.map((msg) => {
                  const isAi = msg.sender === "ai";
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 max-w-[85%] ${isAi ? "self-start" : "self-end flex-row-reverse"}`}
                    >
                      <Avatar
                        icon={isAi ? <RobotOutlined /> : <UserOutlined />}
                        className={isAi ? "bg-blue-100 text-blue-600" : "bg-slate-800 text-white"}
                      />
                      <div className="space-y-1.5">
                        <div
                          className={`p-3.5 rounded-2xl text-xs sm:text-sm whitespace-pre-line leading-relaxed ${
                            isAi ? "bg-white text-slate-800 border border-slate-200/80 rounded-tl-none shadow-xs" : "bg-blue-600 text-white rounded-tr-none shadow-xs"
                          }`}
                        >
                          <div>{msg.text}</div>
                          {isAi && msg.citations && msg.citations.length > 0 && (
                            <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                Nguồn tài liệu xác thực:
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {msg.citations.map((c: any, idx: number) => (
                                  <span
                                    key={c.chunk_id || idx}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] font-medium border border-blue-100"
                                  >
                                    <FileTextOutlined className="text-blue-500" />
                                    <span>{c.document_title || `Tài liệu #${c.document_id}`}</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <span className={`text-[9px] text-slate-400 block px-1 ${!isAi && "text-right"}`}>{msg.time}</span>
                      </div>
                    </div>
                  );
                })}
                {aiResponding && (
                  <div className="flex gap-3 self-start max-w-[80%] items-center">
                    <Avatar icon={<RobotOutlined />} className="bg-blue-100 text-blue-600" />
                    <span className="text-xs text-slate-400 italic">Trợ lý AI đang tra cứu tri thức và soạn câu trả lời...</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                <Input
                  placeholder="Hỏi về viết CV, chuẩn bị phỏng vấn, quy định CAREZA..."
                  value={chatInput}
                  disabled={aiResponding}
                  onChange={(e) => setChatInput(e.target.value)}
                  onPressEnter={handleSendChatMessage}
                  className="h-11 rounded-lg"
                />
                <Button
                  type="primary"
                  loading={aiResponding}
                  onClick={handleSendChatMessage}
                  icon={<SendOutlined />}
                  className="bg-blue-600 hover:bg-blue-700 h-11 w-11 flex items-center justify-center rounded-lg"
                />
              </div>
            </div>
          </Tabs.TabPane>

          {/* Tab 2: AI Mock Interview */}
          <Tabs.TabPane
            tab={
              <span className="flex items-center gap-1.5 font-semibold text-xs sm:text-sm">
                <ThunderboltOutlined /> Phỏng vấn giả lập AI
              </span>
            }
            key="interview"
          >
            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 min-h-[400px] flex flex-col justify-center items-center">
              {!interviewStarted ? (
                <div className="text-center max-w-md space-y-6">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto text-2xl border border-blue-100 animate-pulse">
                    <RobotOutlined />
                  </div>
                  <div className="space-y-2">
                    <Title level={4} className="m-0 text-slate-800 font-bold">
                      Phỏng vấn giả lập chuyên sâu với AI
                    </Title>
                    <Paragraph className="text-slate-500 text-xs sm:text-sm">
                      AI sẽ tự động phân tích hồ sơ và đưa ra các câu hỏi tình huống chuyên môn. Bạn nhập câu trả lời, AI chấm điểm theo rubric chuẩn và phản hồi chi tiết.
                    </Paragraph>
                  </div>
                  <Button
                    type="primary"
                    size="large"
                    loading={startingInterview}
                    onClick={handleStartInterview}
                    className="bg-blue-600 hover:bg-blue-700 font-bold rounded-lg h-11"
                  >
                    Bắt đầu phỏng vấn thử
                  </Button>
                </div>
              ) : evaluating ? (
                <div className="text-center space-y-4">
                  <Spin size="large" />
                  <span className="block text-sm text-slate-500 font-medium">AI đang chấm điểm và tổng hợp báo cáo đánh giá của bạn...</span>
                </div>
              ) : interviewResult ? (
                <div className="w-full max-w-xl space-y-6">
                  <Alert title="Phiên phỏng vấn AI đã hoàn thành xuất sắc!" type="success" showIcon className="rounded-xl" />

                  <Card title="Báo cáo kết quả đánh giá từ AI" className="border-slate-100 shadow-sm" style={{ borderRadius: 12 }}>
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <Progress
                          type="circle"
                          percent={Math.min(100, Math.round(interviewResult.score * 10))}
                          format={() => `${Number(interviewResult.score).toFixed(1)}/10`}
                          size={80}
                          strokeColor="#10b981"
                        />
                        <div>
                          <Title level={5} className="m-0 text-slate-800 font-bold">Điểm số năng lực chuyên môn</Title>
                          <Text type="secondary" className="text-xs">Chấm điểm theo rubric tiêu chuẩn kết hợp bộ quy tắc mâu thuẫn kỹ thuật</Text>
                        </div>
                      </div>

                      <Divider className="my-2" />

                      <div className="space-y-3">
                        <div>
                          <Tag color="green" icon={<StarOutlined />} className="rounded-md uppercase font-bold text-[9px]">Điểm mạnh</Tag>
                          <Paragraph className="text-xs text-slate-600 mt-1">{interviewResult.positives}</Paragraph>
                        </div>

                        <div>
                          <Tag color="orange" className="rounded-md uppercase font-bold text-[9px]">Điểm cần cải thiện</Tag>
                          <Paragraph className="text-xs text-slate-600 mt-1">{interviewResult.negatives}</Paragraph>
                        </div>

                        <div>
                          <Tag color="blue" className="rounded-md uppercase font-bold text-[9px]">Lời khuyên phát triển</Tag>
                          <Paragraph className="text-xs text-slate-600 mt-1">{interviewResult.advice}</Paragraph>
                        </div>
                      </div>

                      <Button block type="default" onClick={handleStartInterview} className="h-10 font-semibold rounded-lg">
                        Luyện tập lại lượt mới
                      </Button>
                    </div>
                  </Card>
                </div>
              ) : (
                <div className="w-full max-w-xl space-y-6">
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>Tiến trình phỏng vấn:</span>
                    <span>
                      Câu {currentQuestionIndex + 1} / {interviewQuestions.length}
                    </span>
                  </div>
                  <Progress
                    percent={Math.round(((currentQuestionIndex + 1) / interviewQuestions.length) * 100)}
                    showInfo={false}
                    strokeColor="#3b82f6"
                  />

                  <Card className="border-slate-200/60 bg-white" style={{ borderRadius: 12 }}>
                    <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Câu hỏi từ AI ({interviewQuestions[currentQuestionIndex]?.category || "Chuyên môn"}):
                    </span>
                    <Title level={5} className="m-0 text-slate-800 font-extrabold leading-snug">
                      {interviewQuestions[currentQuestionIndex]?.question || interviewQuestions[currentQuestionIndex]?.question_text}
                    </Title>
                  </Card>

                  <div className="space-y-2">
                    <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Nhập câu trả lời của bạn:
                    </span>
                    <TextArea
                      rows={5}
                      value={answerInput}
                      disabled={submittingAnswer}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAnswerInput(e.target.value)}
                      placeholder="Gõ câu trả lời chi tiết và giải pháp cụ thể..."
                      maxLength={1500}
                      showCount
                    />
                  </div>

                  <div className="text-right">
                    <Button
                      type="primary"
                      loading={submittingAnswer}
                      onClick={handleNextQuestion}
                      className="bg-blue-600 hover:bg-blue-700 h-10 font-semibold rounded-lg px-6"
                    >
                      {currentQuestionIndex < interviewQuestions.length - 1 ? "Gửi & Sang câu tiếp theo" : "Hoàn thành & Nhận đánh giá"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </div>
  );
}
