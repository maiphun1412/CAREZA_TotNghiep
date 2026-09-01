"use client";

import { useState } from "react";
import { Card, Tabs, Input, Button, Avatar, Typography, Space, Progress, Tag, Alert, message, Spin, Divider } from "antd";
import { RobotOutlined, SendOutlined, UserOutlined, StarOutlined, ThunderboltOutlined } from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const INTRO_CHATS = [
  { id: "ai-1", sender: "ai", text: "Xin chào! Tôi là Trợ lý Hướng nghiệp AI của CAREZA. Tôi có thể giúp bạn tối ưu hóa CV, định hướng nghề nghiệp, hoặc chuẩn bị câu trả lời phỏng vấn. Bạn cần tôi trợ giúp gì hôm nay?", time: "10:00" },
];

const MOCK_QUESTIONS = [
  { id: 1, question: "Hãy giải thích sự khác biệt giữa state và props trong ReactJS?" },
  { id: 2, question: "Làm thế nào để tối ưu hóa hiệu năng render của một ứng dụng React lớn?" },
];

export default function CandidateAiAssistantPage() {
  const [activeTab, setActiveTab] = useState("career");
  
  // Chatbot state
  const [chatMessages, setChatMessages] = useState(INTRO_CHATS);
  const [chatInput, setChatInput] = useState("");
  const [aiResponding, setAiResponding] = useState(false);

  // Interview state
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [answerInput, setAnswerInput] = useState("");
  const [interviewResult, setInterviewResult] = useState<any>(null);
  const [evaluating, setEvaluating] = useState(false);

  // Xử lý gửi tin nhắn Chatbot
  const handleSendChatMessage = () => {
    if (!chatInput.trim()) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: chatInput,
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setAiResponding(true);

    setTimeout(() => {
      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: `Dựa trên câu hỏi của bạn, đây là đề xuất từ AI của CAREZA: Để phát triển kỹ năng nhanh nhất, bạn nên xây dựng các dự án thực tế sử dụng React + TypeScript, đồng thời đóng góp vào các dự án mã nguồn mở hoặc viết blog kỹ thuật để tăng uy tín chuyên môn.`,
        time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev, aiMsg]);
      setAiResponding(false);
    }, 1500);
  };

  // Xử lý Phỏng vấn AI
  const handleStartInterview = () => {
    setInterviewStarted(true);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setAnswerInput("");
    setInterviewResult(null);
  };

  const handleNextQuestion = () => {
    if (!answerInput.trim()) {
      message.error("Vui lòng nhập câu trả lời của bạn!");
      return;
    }

    setAnswers([...answers, answerInput]);
    setAnswerInput("");

    if (currentQuestionIndex < MOCK_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Đánh giá kết quả
      setEvaluating(true);
      setTimeout(() => {
        setInterviewResult({
          score: 8.5,
          positives: "Bạn hiểu rõ khái niệm Virtual DOM và cơ chế Data Binding của React. Diễn đạt mạch lạc.",
          negatives: "Cần làm rõ thêm cách tối ưu sử dụng useMemo và useCallback để tránh re-render không đáng có.",
          advice: "Hãy tập trung đọc thêm về React reconciliation algorithm và practices tối ưu hóa Redux/Context API.",
        });
        setEvaluating(false);
      }, 2000);
    }
  };

  return (
    <div className="space-y-8 flex-1 flex flex-col">
      {/* Header */}
      <div>
        <h3 className="m-0 text-slate-800 font-extrabold text-xl sm:text-2xl flex items-center gap-2">
          <RobotOutlined className="text-blue-600 animate-bounce" /> Trung tâm Trí tuệ Nhân tạo AI
        </h3>
        <span className="text-xs text-slate-500 block mt-1">Sử dụng sức mạnh của AI để bứt phá giới hạn năng lực và sự nghiệp của bạn</span>
      </div>

      <Card className="border-slate-100 shadow-sm flex-1 flex flex-col" styles={{ body: { padding: 16 } }} style={{ borderRadius: 12 }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {/* Tab 1: AI Career Assistant Chatbot */}
          <Tabs.TabPane
            tab={
              <span className="flex items-center gap-1.5 font-semibold text-xs sm:text-sm">
                <RobotOutlined /> Trợ lý Hướng nghiệp AI
              </span>
            }
            key="career"
          >
            <div className="flex flex-col h-[500px] justify-between bg-slate-50/50 rounded-2xl border border-slate-100 p-4">
              {/* Message Box */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 flex flex-col">
                {chatMessages.map((msg) => {
                  const isAi = msg.sender === "ai";
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 max-w-[80%] ${isAi ? "self-start" : "self-end flex-row-reverse"}`}
                    >
                      <Avatar
                        icon={isAi ? <RobotOutlined /> : <UserOutlined />}
                        className={isAi ? "bg-blue-100 text-blue-600" : "bg-slate-800 text-white"}
                      />
                      <div className="space-y-1">
                        <div
                          className={`p-3 rounded-2xl text-xs sm:text-sm ${
                            isAi ? "bg-white text-slate-800 border border-slate-100 rounded-tl-none" : "bg-blue-600 text-white rounded-tr-none"
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className={`text-[9px] text-slate-400 block px-1 ${!isAi && "text-right"}`}>{msg.time}</span>
                      </div>
                    </div>
                  );
                })}
                {aiResponding && (
                  <div className="flex gap-3 self-start max-w-[80%] items-center">
                    <Avatar icon={<RobotOutlined />} className="bg-blue-100 text-blue-600" />
                    <span className="text-xs text-slate-400 italic">Trợ lý AI đang soạn câu trả lời...</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                <Input
                  placeholder="Nhập câu hỏi định hướng sự nghiệp, viết CV..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onPressEnter={handleSendChatMessage}
                  className="h-11 rounded-lg"
                />
                <Button type="primary" onClick={handleSendChatMessage} icon={<SendOutlined />} className="bg-blue-600 hover:bg-blue-700 h-11 w-11 flex items-center justify-center rounded-lg" />
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
                    <Title level={4} className="m-0 text-slate-800 font-bold">Phỏng vấn giả lập thời gian thực với AI</Title>
                    <Paragraph className="text-slate-500 text-xs sm:text-sm">
                      AI sẽ lần lượt đưa ra các câu hỏi chuyên môn liên quan đến CV của bạn và JD. Bạn sẽ gõ câu trả lời, AI tiến hành chấm điểm và cung cấp nhận xét chi tiết.
                    </Paragraph>
                  </div>
                  <Button type="primary" size="large" onClick={handleStartInterview} className="bg-blue-600 hover:bg-blue-700 font-bold rounded-lg h-11">
                    Bắt đầu phỏng vấn thử
                  </Button>
                </div>
              ) : evaluating ? (
                <div className="text-center space-y-4">
                  <Spin size="large" />
                  <span className="block text-sm text-slate-500 font-medium">AI đang chấm điểm và phân tích câu trả lời của bạn...</span>
                </div>
              ) : interviewResult ? (
                <div className="w-full max-w-xl space-y-6">
                  <Alert title="Phỏng vấn giả lập hoàn thành!" type="success" showIcon className="rounded-xl" />
                  
                  <Card title="Kết quả đánh giá từ AI" className="border-slate-100 shadow-sm" style={{ borderRadius: 12 }}>
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <Progress type="circle" percent={interviewResult.score * 10} format={() => `${interviewResult.score}/10`} size={80} strokeColor="#10b981" />
                        <div>
                          <Title level={5} className="m-0 text-slate-800 font-bold">Điểm số năng lực chuyên môn</Title>
                          <Text type="secondary" className="text-xs">Đánh giá dựa trên độ chuẩn xác kiến thức</Text>
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
                    <span>Câu {currentQuestionIndex + 1} / {MOCK_QUESTIONS.length}</span>
                  </div>
                  <Progress percent={((currentQuestionIndex + 1) / MOCK_QUESTIONS.length) * 100} showInfo={false} strokeColor="#3b82f6" />

                  <Card className="border-slate-200/60 bg-white" style={{ borderRadius: 12 }}>
                    <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Câu hỏi của AI:</span>
                    <Title level={5} className="m-0 text-slate-800 font-extrabold leading-snug">
                      {MOCK_QUESTIONS[currentQuestionIndex].question}
                    </Title>
                  </Card>

                  <div className="space-y-2">
                    <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Nhập câu trả lời của bạn:</span>
                    <TextArea
                      rows={5}
                      value={answerInput}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAnswerInput(e.target.value)}
                      placeholder="Gõ lời giải thích chi tiết nhất có thể tại đây..."
                      maxLength={1500}
                      showCount
                    />
                  </div>

                  <div className="text-right">
                    <Button type="primary" onClick={handleNextQuestion} className="bg-blue-600 hover:bg-blue-700 h-10 font-semibold rounded-lg px-6">
                      {currentQuestionIndex < MOCK_QUESTIONS.length - 1 ? "Gửi & Sang câu tiếp theo" : "Hoàn thành & Nhận đánh giá"}
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
