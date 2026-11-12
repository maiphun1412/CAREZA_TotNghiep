"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Tooltip, message, Switch } from "antd";
import { useAuthStore } from "@/store/auth-store";
import { aiService } from "@/services/ai.service";
import {
  Bot,
  Send,
  Paperclip,
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
  FileText,
  Search,
  UserCheck,
  Briefcase,
  Linkedin,
  TrendingUp,
  Brain,
  Calculator,
  ShieldCheck,
  Headphones,
  Check,
  ArrowRight,
  User,
  Zap,
  Target,
  Clock,
  Users,
  Compass,
  Lightbulb,
  Award,
  Crown,
  ChevronDown,
  X,
} from "lucide-react";

// =========================================================================
// TYPES & DATA STRUCTURES
// =========================================================================
interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  attachmentName?: string;
  tags?: string[];
  retrieved_chunks?: Array<{
    chunk_id: number;
    document_id?: number;
    document_title: string;
    content?: string;
    score?: number;
    is_available?: boolean;
  }>;
}

interface ConversationHistoryItem {
  id: string;
  title: string;
  time: string;
  iconType: "doc" | "chat" | "briefcase";
}

const DEFAULT_SUGGESTIONS = [
  "Hãy phân tích CV của tôi và đề xuất cách cải thiện",
  "Luyện phỏng vấn vị trí Business Analyst với các câu hỏi thường gặp",
  "Tôi nên học kỹ năng gì để chuyển sang ngành Product Management?",
  "Gợi ý các công việc remote phù hợp với kinh nghiệm của tôi",
  "Viết giúp tôi thư xin việc cho vị trí Marketing Executive",
  "Lập kế hoạch 6 tháng để nâng cao kỹ năng và tìm việc tốt hơn",
];

const ALTERNATIVE_SUGGESTIONS = [
  "Cách đàm phán mức lương kỳ vọng khi nhận offer mới",
  "Những lỗi phổ biến khiến CV bị loại ngay từ vòng lọc tự động (ATS)",
  "Luyện trả lời câu hỏi: 'Hãy giới thiệu về bản thân bạn'",
  "Top 5 kỹ năng cần thiết cho lập trình viên Fullstack năm 2025",
  "Cách xây dựng hồ sơ LinkedIn chuyên nghiệp thu hút nhà tuyển dụng",
  "Lộ trình từ Junior lên Senior Software Engineer mất bao lâu?",
];

export default function AICareerPage() {
  const { user } = useAuthStore();
  const userName = user?.fullName || user?.email?.split("@")[0] || "Mai Phương";

  // Tab navigation
  const [activeTab, setActiveTab] = useState<
    "chat" | "cv" | "interview" | "career" | "linkedin" | "jobs" | "plan"
  >("chat");

  // Input & state
  const [inputText, setInputText] = useState<string>("");
  const [isDeepMode, setIsDeepMode] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>("GPT-4o");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isAiTyping, setIsAiTyping] = useState<boolean>(false);
  const [suggestionsList, setSuggestionsList] = useState<string[]>(DEFAULT_SUGGESTIONS);

  // Chat message history
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lịch sử cuộc trò chuyện
  const [todayConversations] = useState<ConversationHistoryItem[]>([
    { id: "1", title: "Tư vấn lộ trình trở thành BA ...", time: "10:42", iconType: "doc" },
    { id: "2", title: "Phân tích CV vị trí Product ...", time: "09:15", iconType: "doc" },
    { id: "3", title: "Luyện phỏng vấn vòng 2", time: "08:20", iconType: "chat" },
  ]);

  const [yesterdayConversations] = useState<ConversationHistoryItem[]>([
    { id: "4", title: "Gợi ý việc làm Data Analyst", time: "16:20", iconType: "briefcase" },
    { id: "5", title: "Cách viết thư xin việc", time: "14:10", iconType: "doc" },
    { id: "6", title: "So sánh cơ hội nghề Frontend", time: "11:05", iconType: "chat" },
  ]);

  // Cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiTyping]);

  // Đổi danh sách câu hỏi gợi ý
  const handleShuffleSuggestions = () => {
    setSuggestionsList((prev) =>
      prev === DEFAULT_SUGGESTIONS ? ALTERNATIVE_SUGGESTIONS : DEFAULT_SUGGESTIONS
    );
    message.info("Đã làm mới các gợi ý câu hỏi!");
  };

  // Chọn câu hỏi gợi ý
  const handleSelectSuggestion = (prompt: string) => {
    setInputText(prompt);
  };

  const { isAuthenticated } = useAuthStore();
  const [sessionId, setSessionId] = useState<number | undefined>(undefined);

  // Xử lý gửi tin nhắn AI thật
  const handleSendMessage = async () => {
    if (!inputText.trim() && !attachedFile) return;

    // Kiểm tra đăng nhập bắt buộc đối với chức năng chat có lưu lịch sử
    if (!isAuthenticated) {
      message.warning("Vui lòng đăng nhập tài khoản để trò chuyện cùng Trợ lý AI và lưu lại lịch sử tư vấn.");
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      attachmentName: attachedFile?.name,
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentInput = inputText;
    const fileToUpload = attachedFile;
    setInputText("");
    setAttachedFile(null);
    setIsAiTyping(true);

    try {
      let aiResponseText = "";
      let retrievedChunks: any[] = [];
      if (fileToUpload) {
        const formData = new FormData();
        formData.append("file", fileToUpload);
        formData.append("file_name", fileToUpload.name);
        const res = await aiService.parseCv(formData);
        const parsed = res?.data?.parsed_data || {};
        aiResponseText = `Đã phân tích xong CV "${fileToUpload.name}":\n\n- Họ tên: ${parsed.name || "Đã trích xuất"}\n- Email: ${parsed.email || "Đã trích xuất"}\n- Kỹ năng phát hiện: ${Array.isArray(parsed.skills) && parsed.skills.length > 0 ? parsed.skills.join(", ") : "Chưa phát hiện kỹ năng rõ ràng"}\n- Học vấn: ${Array.isArray(parsed.education) ? parsed.education.map((e: any) => e.school || e).join("; ") : "Thông tin cơ bản"}`;
      } else {
        const res = await aiService.chatRag(currentInput, sessionId);
        aiResponseText = res?.data?.content || res?.data?.answer || "Hệ thống AI đã tiếp nhận câu hỏi và đưa ra tư vấn phù hợp nhất cho bạn.";
        retrievedChunks = res?.data?.retrieved_chunks || [];
        if (res?.data?.session_id) {
          setSessionId(res.data.session_id);
        }
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        retrieved_chunks: retrievedChunks,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Lỗi khi kết nối với máy chủ AI. Vui lòng thử lại!";
      message.error(errMsg);
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        message.error("Kích thước file không được vượt quá 10MB!");
        return;
      }
      setAttachedFile(file);
      message.success(`Đã đính kèm: ${file.name}`);
    }
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 pb-12 pt-2 bg-[#f7faff] min-h-screen space-y-2.5">
      {/* ======================================================== */}
      {/* 1. BREADCRUMB NỀN TRANG NGOÀI BANNER                      */}
      {/* ======================================================== */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium py-1">
        <Link href="/" className="text-[#2563EB] hover:underline">
          Trang chủ
        </Link>
        <span className="text-slate-400">/</span>
        <Link href="/cong-cu" className="text-[#2563EB] hover:underline">
          Công cụ
        </Link>
        <span className="text-slate-400">/</span>
        <span className="text-slate-800 font-semibold">Trợ lý AI Career & Phỏng vấn</span>
      </div>

      {/* ======================================================== */}
      {/* 2. HERO BANNER SỬ DỤNG /images/Ai.png (GỌN 110-120px)    */}
      {/* ======================================================== */}
      <div
        className="relative w-full rounded-2xl overflow-hidden min-h-[110px] md:min-h-[116px] border border-blue-200/80 shadow-2xs p-4 sm:p-5 md:px-7 flex items-center justify-between"
        style={{
          backgroundImage: "url('/images/Ai.png')",
          backgroundSize: "cover",
          backgroundPosition: "center right",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Lớp Overlay gradient bên trái để chữ luôn nổi bật và hiển thị hình minh họa bên phải */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent sm:w-[60%] pointer-events-none" />

        {/* Nội dung bên trái Hero */}
        <div className="relative z-10 max-w-2xl space-y-1.5 py-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2563eb] text-white flex items-center justify-center shadow-xs shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 tracking-tight m-0 leading-tight">
              Trợ lý AI Career & Phỏng vấn
            </h1>
            <span className="bg-blue-100 text-[#2563eb] text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
              AI đồng hành sự nghiệp
            </span>
          </div>
          <p className="text-xs sm:text-[13px] text-slate-600 font-normal m-0 leading-relaxed">
            Khám phá tiềm năng, tối ưu hồ sơ ứng tuyển và tự tin chinh phục phỏng vấn cùng Trợ lý AI Careza.
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. TOOL NAVIGATION TABS (CÁCH BANNER 20px VỚI !mt-5)     */}
      {/* ======================================================== */}
      <div className="flex flex-nowrap overflow-x-auto no-scrollbar items-center gap-2 !mt-5 pt-0.5">
        {[
          { key: "chat", title: "Chat với AI" },
          { key: "cv", title: "Phân tích CV" },
          { key: "interview", title: "Luyện phỏng vấn" },
          { key: "career", title: "Tư vấn nghề nghiệp" },
          { key: "linkedin", title: "Tối ưu hồ sơ LinkedIn" },
          { key: "jobs", title: "Gợi ý việc làm" },
          { key: "plan", title: "Kế hoạch phát triển" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setActiveTab(tab.key as any);
              if (tab.key === "cv") setInputText("Hãy phân tích chi tiết bản CV tôi đính kèm.");
              else if (tab.key === "interview") setInputText("Luyện phỏng vấn thử với tôi vị trí ");
              else if (tab.key === "jobs") setInputText("Gợi ý các việc làm phù hợp nhất với hồ sơ của tôi.");
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-[13px] font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.key
                ? "bg-[#2563eb] text-white shadow-xs"
                : "bg-white text-slate-700 hover:text-[#2563eb] hover:bg-blue-50/60 border border-slate-200"
            }`}
          >
            {tab.title}
          </button>
        ))}
      </div>

      {/* ======================================================== */}
      {/* 3. MAIN WORKSPACE: 3 COLUMNS (22% | 54% | 24%)           */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4.5 items-start">
        {/* ==================== CỘT TRÁI: LỊCH SỬ CHAT & NÂNG CẤP (3/12 cols) ==================== */}
        <div className="lg:col-span-3 space-y-3.5">
          {/* Card: Cuộc trò chuyện */}
          <div className="bg-white rounded-2xl p-4.5 border border-[#E5ECF6] shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 m-0">Cuộc trò chuyện</h3>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Tùy chọn"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Button: Cuộc trò chuyện mới */}
            <button
              type="button"
              onClick={() => {
                setMessages([]);
                setInputText("");
                message.info("Đã tạo phiên trò chuyện mới!");
              }}
              className="w-full py-2.5 px-3 rounded-xl border border-blue-200 text-[#2563eb] hover:bg-blue-50 font-bold text-xs sm:text-[13px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <span>+ Cuộc trò chuyện mới</span>
            </button>

            {/* Danh sách: Hôm nay */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Hôm nay
              </span>
              <div className="space-y-1">
                {todayConversations.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setInputText(item.title);
                      message.success(`Đã mở: ${item.title}`);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-left transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {item.iconType === "doc" && <FileText className="w-4 h-4 text-blue-500 shrink-0" />}
                      {item.iconType === "chat" && <Bot className="w-4 h-4 text-purple-500 shrink-0" />}
                      {item.iconType === "briefcase" && <Briefcase className="w-4 h-4 text-emerald-500 shrink-0" />}
                      <span className="text-[12.5px] sm:text-[13px] font-medium text-slate-700 group-hover:text-[#2563eb] truncate">
                        {item.title}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0 pl-1">{item.time}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Danh sách: Hôm qua */}
            <div className="space-y-1.5 pt-1.5 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Hôm qua
              </span>
              <div className="space-y-1">
                {yesterdayConversations.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setInputText(item.title);
                      message.success(`Đã mở: ${item.title}`);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-left transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {item.iconType === "doc" && <FileText className="w-4 h-4 text-blue-500 shrink-0" />}
                      {item.iconType === "chat" && <Bot className="w-4 h-4 text-purple-500 shrink-0" />}
                      {item.iconType === "briefcase" && <Briefcase className="w-4 h-4 text-emerald-500 shrink-0" />}
                      <span className="text-[12.5px] sm:text-[13px] font-medium text-slate-700 group-hover:text-[#2563eb] truncate">
                        {item.title}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0 pl-1">{item.time}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={() => message.info("Đang hiển thị toàn bộ lịch sử trò chuyện.")}
                className="text-xs sm:text-[12.5px] font-semibold text-[#2563eb] hover:underline cursor-pointer"
              >
                Xem tất cả lịch sử →
              </button>
            </div>
          </div>

          {/* Card: Nâng cấp trải nghiệm AI mạnh mẽ hơn (Navy Blue Gradient Card) */}
          <div className="rounded-2xl p-5 bg-gradient-to-br from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb] text-white shadow-md space-y-3.5 relative overflow-hidden">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
                <Crown className="w-4.5 h-4.5" />
              </div>
              <h4 className="text-sm font-bold text-white m-0 leading-tight">
                Nâng cấp trải nghiệm AI mạnh mẽ hơn
              </h4>
            </div>

            <ul className="space-y-2 text-xs sm:text-[12.5px] text-blue-100 pl-0 list-none m-0 leading-relaxed">
              <li className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Phân tích CV chuyên sâu</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Luyện phỏng vấn như thật</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Gợi ý việc làm cá nhân hóa</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Không giới hạn lượt chat</span>
              </li>
            </ul>

            <button
              type="button"
              onClick={() => message.success("Tính năng nâng cấp gói Careza AI Pro đang được phát hành!")}
              className="w-full py-2.5 px-3 rounded-xl bg-white text-[#1e3a8a] hover:bg-blue-50 font-bold text-xs sm:text-[13px] shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border-none"
            >
              <span>Nâng cấp ngay</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ==================== CỘT GIỮA: AI WORKSPACE (6/12 cols) ==================== */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 sm:p-6 border border-[#E5ECF6] shadow-2xs space-y-4.5">
          {/* Header AI Workspace: Lời chào người dùng */}
          <div className="flex items-center gap-3.5 pb-2 border-b border-slate-100">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 shrink-0 shadow-xs">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-[#2563eb]">
                <Bot className="w-7 h-7" />
              </div>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 m-0">
                Xin chào <span className="text-[#2563eb]">{userName}!</span> 👋
              </h2>
              <p className="text-xs sm:text-[13.5px] text-slate-600 font-normal m-0 mt-0.5">
                Tôi là Trợ lý AI Career của Careza. Hôm nay bạn muốn tôi hỗ trợ gì?
              </p>
            </div>
          </div>

          {/* 6 Quick Action Cards (Cân đối bằng nhau, màu sắc nổi bật rõ nét) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-1 items-stretch">
            {/* Action 1: Phân tích CV (Xanh dương) */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("cv");
                setInputText("Hãy phân tích điểm mạnh và điểm cần cải thiện của CV của tôi.");
              }}
              className="p-3.5 sm:p-4 rounded-xl bg-blue-50/90 hover:bg-blue-100/90 border border-blue-200/90 text-left transition-all duration-150 group cursor-pointer space-y-2 flex flex-col justify-between shadow-2xs hover:shadow-xs hover:-translate-y-0.5"
            >
              <div>
                <div className="w-8.5 h-8.5 rounded-lg bg-blue-100 text-[#2563eb] border border-blue-200 flex items-center justify-center mb-2 shadow-2xs">
                  <FileText className="w-4.5 h-4.5" />
                </div>
                <h4 className="text-xs sm:text-[13.5px] font-bold text-slate-900 group-hover:text-[#2563eb] m-0">
                  Phân tích CV
                </h4>
              </div>
              <p className="text-[11px] sm:text-[11.5px] text-slate-600 font-medium m-0 leading-snug line-clamp-2">
                Nhận đánh giá chi tiết và gợi ý cải thiện
              </p>
            </button>

            {/* Action 2: Luyện phỏng vấn (Hồng/Rose) */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("interview");
                setInputText("Luyện phỏng vấn với tôi theo các câu hỏi vị trí...");
              }}
              className="p-3.5 sm:p-4 rounded-xl bg-rose-50/90 hover:bg-rose-100/90 border border-rose-200/90 text-left transition-all duration-150 group cursor-pointer space-y-2 flex flex-col justify-between shadow-2xs hover:shadow-xs hover:-translate-y-0.5"
            >
              <div>
                <div className="w-8.5 h-8.5 rounded-lg bg-rose-100 text-rose-600 border border-rose-200 flex items-center justify-center mb-2 shadow-2xs">
                  <Search className="w-4.5 h-4.5" />
                </div>
                <h4 className="text-xs sm:text-[13.5px] font-bold text-slate-900 group-hover:text-rose-600 m-0">
                  Luyện phỏng vấn
                </h4>
              </div>
              <p className="text-[11px] sm:text-[11.5px] text-slate-600 font-medium m-0 leading-snug line-clamp-2">
                Thực hành phỏng vấn với AI theo vị trí
              </p>
            </button>

            {/* Action 3: Tư vấn nghề nghiệp (Xanh lá) */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("career");
                setInputText("Tư vấn lộ trình phát triển nghề nghiệp phù hợp với tôi.");
              }}
              className="p-3.5 sm:p-4 rounded-xl bg-emerald-50/90 hover:bg-emerald-100/90 border border-emerald-200/90 text-left transition-all duration-150 group cursor-pointer space-y-2 flex flex-col justify-between shadow-2xs hover:shadow-xs hover:-translate-y-0.5"
            >
              <div>
                <div className="w-8.5 h-8.5 rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center mb-2 shadow-2xs">
                  <UserCheck className="w-4.5 h-4.5" />
                </div>
                <h4 className="text-xs sm:text-[13.5px] font-bold text-slate-900 group-hover:text-emerald-700 m-0">
                  Tư vấn nghề nghiệp
                </h4>
              </div>
              <p className="text-[11px] sm:text-[11.5px] text-slate-600 font-medium m-0 leading-snug line-clamp-2">
                Định hướng dựa trên năng lực & sở thích
              </p>
            </button>

            {/* Action 4: Gợi ý việc làm (Tím) */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("jobs");
                setInputText("Gợi ý các cơ hội việc làm tuyển dụng phù hợp với hồ sơ của tôi.");
              }}
              className="p-3.5 sm:p-4 rounded-xl bg-purple-50/90 hover:bg-purple-100/90 border border-purple-200/90 text-left transition-all duration-150 group cursor-pointer space-y-2 flex flex-col justify-between shadow-2xs hover:shadow-xs hover:-translate-y-0.5"
            >
              <div>
                <div className="w-8.5 h-8.5 rounded-lg bg-purple-100 text-purple-700 border border-purple-200 flex items-center justify-center mb-2 shadow-2xs">
                  <Briefcase className="w-4.5 h-4.5" />
                </div>
                <h4 className="text-xs sm:text-[13.5px] font-bold text-slate-900 group-hover:text-purple-700 m-0">
                  Gợi ý việc làm
                </h4>
              </div>
              <p className="text-[11px] sm:text-[11.5px] text-slate-600 font-medium m-0 leading-snug line-clamp-2">
                Tìm việc phù hợp với hồ sơ của bạn
              </p>
            </button>

            {/* Action 5: Tối ưu LinkedIn (Cyan/Sky) */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("linkedin");
                setInputText("Hướng dẫn cách tối ưu hồ sơ LinkedIn và phần Tóm tắt cá nhân.");
              }}
              className="p-3.5 sm:p-4 rounded-xl bg-sky-50/90 hover:bg-sky-100/90 border border-sky-200/90 text-left transition-all duration-150 group cursor-pointer space-y-2 flex flex-col justify-between shadow-2xs hover:shadow-xs hover:-translate-y-0.5"
            >
              <div>
                <div className="w-8.5 h-8.5 rounded-lg bg-sky-100 text-sky-700 border border-sky-200 flex items-center justify-center mb-2 shadow-2xs">
                  <Linkedin className="w-4.5 h-4.5" />
                </div>
                <h4 className="text-xs sm:text-[13.5px] font-bold text-slate-900 group-hover:text-sky-700 m-0">
                  Tối ưu LinkedIn
                </h4>
              </div>
              <p className="text-[11px] sm:text-[11.5px] text-slate-600 font-medium m-0 leading-snug line-clamp-2">
                Cải thiện hồ sơ chuyên nghiệp hơn
              </p>
            </button>

            {/* Action 6: Kế hoạch phát triển (Vàng/Amber) */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("plan");
                setInputText("Lập kế hoạch 6 tháng để nâng cao kỹ năng và đạt mục tiêu thăng tiến.");
              }}
              className="p-3.5 sm:p-4 rounded-xl bg-amber-50/90 hover:bg-amber-100/90 border border-amber-200/90 text-left transition-all duration-150 group cursor-pointer space-y-2 flex flex-col justify-between shadow-2xs hover:shadow-xs hover:-translate-y-0.5"
            >
              <div>
                <div className="w-8.5 h-8.5 rounded-lg bg-amber-100 text-amber-700 border border-amber-200 flex items-center justify-center mb-2 shadow-2xs">
                  <TrendingUp className="w-4.5 h-4.5" />
                </div>
                <h4 className="text-xs sm:text-[13.5px] font-bold text-slate-900 group-hover:text-amber-700 m-0">
                  Kế hoạch phát triển
                </h4>
              </div>
              <p className="text-[11px] sm:text-[11.5px] text-slate-600 font-medium m-0 leading-snug line-clamp-2">
                Xây dựng lộ trình học tập & kỹ năng
              </p>
            </button>
          </div>

          {/* Gợi ý câu hỏi bạn có thể thử */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 m-0">
                Gợi ý câu hỏi bạn có thể thử
              </h3>
              <button
                type="button"
                onClick={handleShuffleSuggestions}
                className="text-xs sm:text-[12.5px] font-semibold text-[#2563eb] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Đổi gợi ý</span>
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 6 Cards 2 Cột */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {suggestionsList.map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSuggestion(sug)}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 hover:border-blue-200 text-left text-xs sm:text-[13px] font-medium text-slate-700 transition-all group cursor-pointer flex items-start gap-2.5"
                >
                  <span className="text-[#2563eb] font-bold mt-0.5">💬</span>
                  <span className="group-hover:text-[#2563eb] leading-snug line-clamp-2">
                    {sug}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Chat Stream Messages */}
          {messages.length > 0 && (
            <div className="space-y-3.5 pt-2 max-h-[340px] overflow-y-auto pr-1">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.sender === "ai" && (
                    <div className="w-8 h-8 rounded-full bg-[#2563eb] text-white flex items-center justify-center shrink-0 mt-1 shadow-2xs">
                      <Bot className="w-5 h-5" />
                    </div>
                  )}

                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-[85%] ${
                      m.sender === "user"
                        ? "bg-[#2563eb] text-white rounded-br-none shadow-2xs"
                        : "bg-slate-50 text-slate-800 rounded-bl-none border border-slate-200/80 whitespace-pre-line shadow-2xs"
                    }`}
                  >
                    {m.attachmentName && (
                      <div className="mb-2 px-2.5 py-1 bg-white/20 rounded-md text-xs flex items-center gap-1.5 font-semibold">
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>{m.attachmentName}</span>
                      </div>
                    )}
                    <div>{m.text}</div>
                    {m.retrieved_chunks && m.retrieved_chunks.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                          Nguồn tài liệu đã xác thực:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {m.retrieved_chunks.map((chk, cIdx) => (
                            <span
                              key={chk.chunk_id || cIdx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-100/70 text-blue-800 text-[11px] font-medium border border-blue-200"
                              title={chk.content ? `${chk.content.slice(0, 150)}...` : ""}
                            >
                              <FileText className="w-3 h-3 text-[#2563eb]" />
                              <span>{chk.document_title || `Tài liệu #${chk.document_id}`}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <span
                      className={`text-[10px] block text-right mt-1.5 ${
                        m.sender === "user" ? "text-blue-100" : "text-slate-400"
                      }`}
                    >
                      {m.timestamp}
                    </span>
                  </div>

                  {m.sender === "user" && (
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-1 font-bold text-xs">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              ))}

              {isAiTyping && (
                <div className="flex gap-3 items-center text-xs text-slate-500 pl-1">
                  <div className="w-8 h-8 rounded-full bg-[#2563eb] text-white flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
                    <span className="text-xs sm:text-[13px] text-slate-600 font-medium pl-1">
                      AI đang phân tích câu trả lời...
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Chat Input Bar */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-3">
            {/* Banner hướng dẫn đăng nhập cho khách chưa xác thực */}
            {!isAuthenticated && (
              <div className="flex flex-wrap items-center justify-between p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium gap-2">
                <span>Vui lòng đăng nhập để trò chuyện cùng Trợ lý AI và lưu lại lịch sử hội thoại.</span>
                <Link
                  href="/dang-nhap"
                  className="font-bold text-[#2563eb] hover:underline shrink-0"
                >
                  Đăng nhập ngay →
                </Link>
              </div>
            )}

            {/* File attachment chip */}
            {attachedFile && (
              <div className="flex items-center justify-between px-3 py-1.5 bg-blue-100/70 border border-blue-200 rounded-lg text-xs sm:text-[13px] text-blue-900 font-medium">
                <span className="flex items-center gap-2 truncate">
                  <Paperclip className="w-4 h-4 text-[#2563eb]" />
                  <span className="truncate">{attachedFile.name}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setAttachedFile(null)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <textarea
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={
                isAuthenticated
                  ? "Nhập câu hỏi hoặc yêu cầu của bạn..."
                  : "Vui lòng đăng nhập để bắt đầu trò chuyện cùng AI..."
              }
              className="w-full bg-transparent border-0 resize-none text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden"
            />

            {/* Bottom Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1.5 border-t border-slate-200/60">
              <div className="flex items-center gap-3.5">
                {/* File Upload Hidden Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 text-xs sm:text-[12.5px] font-semibold text-slate-700 hover:text-[#2563eb] cursor-pointer"
                >
                  <Paperclip className="w-4 h-4 text-slate-500" />
                  <span>Đính kèm file</span>
                </button>

                {/* Toggle Chế độ chuyên sâu */}
                <div className="flex items-center gap-2">
                  <Switch
                    size="small"
                    checked={isDeepMode}
                    onChange={(checked) => setIsDeepMode(checked)}
                  />
                  <span className="text-xs sm:text-[12.5px] font-medium text-slate-700">
                    Chế độ chuyên sâu
                  </span>
                </div>

                {/* Model Selector Dropdown */}
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer"
                >
                  <option value="GPT-4o">GPT-4o</option>
                  <option value="Claude-3.5">Claude 3.5 Sonnet</option>
                  <option value="Gemini-Pro">Gemini 1.5 Pro</option>
                </select>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-[11px] text-slate-400 font-medium">
                  {inputText.length}/4000
                </span>
                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() && !attachedFile}
                  className="px-4.5 py-2 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-40 text-white hover:text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition-all cursor-pointer border-none"
                >
                  <span className="text-white">Gửi</span>
                  <Send className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>
          </div>

          <div className="text-center">
            <span className="text-[11px] text-slate-400 font-normal">
              AI có thể mắc lỗi. Vui lòng kiểm tra lại thông tin quan trọng.
            </span>
          </div>
        </div>

        {/* ==================== CỘT PHẢI: HỒ SƠ & CÔNG CỤ (3/12 cols) ==================== */}
        <div className="lg:col-span-3 space-y-3.5">
          {/* Card: Hồ sơ của bạn */}
          <div className="bg-white rounded-2xl p-4.5 border border-[#E5ECF6] shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 m-0">Hồ sơ của bạn</h3>
              <Link
                href="/ung-vien/ho-so"
                className="text-xs font-semibold text-[#2563eb] hover:underline"
              >
                Xem hồ sơ →
              </Link>
            </div>

            {/* Profile Avatar & Info */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-blue-100 text-[#2563eb] font-black text-base flex items-center justify-center shrink-0">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-slate-800 m-0 truncate">{userName}</h4>
                <p className="text-xs text-slate-500 m-0 truncate">
                  Ứng viên đang tìm cơ hội mới
                </p>
              </div>
            </div>

            {/* 3 Stats */}
            <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <div>
                <span className="text-sm font-black text-slate-800 block">3</span>
                <span className="text-[10px] sm:text-[10.5px] text-slate-500 block leading-tight">CV đã tải lên</span>
              </div>
              <div>
                <span className="text-sm font-black text-slate-800 block">12</span>
                <span className="text-[10px] sm:text-[10.5px] text-slate-500 block leading-tight">Kỹ năng nổi bật</span>
              </div>
              <div>
                <span className="text-sm font-black text-slate-800 block">5</span>
                <span className="text-[10px] sm:text-[10.5px] text-slate-500 block leading-tight">Ngành quan tâm</span>
              </div>
            </div>

            {/* Alert Box pastel yellow */}
            <div className="bg-[#fffdf5] rounded-xl p-3 border border-[#fde68a] space-y-2">
              <p className="text-xs text-slate-700 m-0 leading-snug">
                💡 Hoàn thiện hồ sơ để nhận tư vấn chính xác và cá nhân hóa hơn.
              </p>
              <Link href="/ung-vien/ho-so" className="block">
                <button
                  type="button"
                  className="w-full py-2 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white hover:text-white font-bold text-xs sm:text-[12.5px] shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors border-none"
                >
                  <span className="text-white">Cập nhật hồ sơ</span>
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </button>
              </Link>
            </div>
          </div>

          {/* Card: 💡 Tại sao nên dùng Trợ lý AI? */}
          <div className="bg-[#fffdf5] rounded-2xl p-4.5 border border-[#fde68a] shadow-2xs space-y-3">
            <h3 className="text-sm font-black text-slate-800 m-0 pb-1 border-b border-amber-200/70 flex items-center gap-1.5">
              <span>💡</span>
              <span>Tại sao nên dùng Trợ lý AI?</span>
            </h3>
            <ul className="space-y-2 text-xs sm:text-[12.5px] text-slate-700 pl-0 list-none m-0 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">✓</span>
                <span>Phản hồi nhanh chóng, chính xác</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">✓</span>
                <span>Thông tin cập nhật theo thị trường</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">✓</span>
                <span>Cá nhân hóa theo mục tiêu của bạn</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">✓</span>
                <span>Hỗ trợ 24/7, hoàn toàn miễn phí</span>
              </li>
            </ul>
          </div>

          {/* Card: Công cụ liên quan */}
          <div className="bg-white rounded-2xl p-4.5 border border-[#E5ECF6] shadow-2xs space-y-3">
            <h3 className="text-sm font-black text-slate-800 m-0 pb-1 border-b border-slate-100">
              Công cụ liên quan
            </h3>
            <div className="space-y-2">
              <Link
                href="/cong-cu/mbti"
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-purple-50/60 border border-transparent hover:border-purple-200 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Brain className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-[13px] font-semibold text-slate-700 group-hover:text-purple-700 truncate">
                    Trắc nghiệm MBTI
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>

              <Link
                href="/cong-cu/tinh-luong-gross-net"
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50/60 border border-transparent hover:border-blue-200 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563eb] flex items-center justify-center shrink-0">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-[13px] font-semibold text-slate-700 group-hover:text-[#2563eb] truncate">
                    Tính lương Gross - Net
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#2563eb] group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>

              <Link
                href="/cong-cu/bao-hiem-that-nghiep"
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50/60 border border-transparent hover:border-emerald-200 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-[13px] font-semibold text-slate-700 group-hover:text-emerald-700 truncate">
                    Tính bảo hiểm thất nghiệp
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            </div>
          </div>

          {/* Card: Cần hỗ trợ? */}
          <div className="bg-[#f0f7ff] rounded-2xl p-4.5 border border-[#dbeafe] shadow-2xs space-y-3 relative overflow-hidden">
            <div>
              <h4 className="text-sm font-black text-slate-800 m-0">Cần hỗ trợ?</h4>
              <p className="text-xs text-slate-600 font-normal m-0 mt-0.5 leading-tight">
                Đội ngũ Careza luôn sẵn sàng đồng hành cùng bạn.
              </p>
            </div>
            <div className="flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => message.info("Tổng đài Careza: 1900 6868")}
                className="px-3.5 py-2 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white hover:text-white font-bold text-xs sm:text-[12.5px] border-none shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span className="text-white">Liên hệ hỗ trợ</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </button>
              <div className="w-11 h-11 rounded-full bg-blue-100 text-[#2563eb] flex items-center justify-center shrink-0">
                <Headphones className="w-5.5 h-5.5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. SECTION: BẠN SẼ ĐẠT ĐƯỢC GÌ VỚI TRỢ LÝ AI CAREER?     */}
      {/* ======================================================== */}
      <div className="space-y-3 pt-2">
        <h3 className="text-base sm:text-lg font-black text-slate-900 m-0">
          Bạn sẽ đạt được gì với Trợ lý AI Career?
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 items-stretch">
          {/* Benefit 1 */}
          <div className="p-4 bg-white rounded-2xl border border-[#E5ECF6] shadow-2xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
              <Compass className="w-5.5 h-5.5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-800 m-0">Hiểu rõ bản thân</h4>
              <p className="text-[11.5px] sm:text-xs text-slate-500 m-0 mt-0.5 leading-tight">
                Khám phá điểm mạnh, mục tiêu và giá trị nghề nghiệp
              </p>
            </div>
          </div>

          {/* Benefit 2 */}
          <div className="p-4 bg-white rounded-2xl border border-[#E5ECF6] shadow-2xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#2563eb] flex items-center justify-center shrink-0">
              <FileText className="w-5.5 h-5.5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-800 m-0">Tối ưu hồ sơ ứng tuyển</h4>
              <p className="text-[11.5px] sm:text-xs text-slate-500 m-0 mt-0.5 leading-tight">
                CV, LinkedIn, thư xin việc chuyên nghiệp hơn
              </p>
            </div>
          </div>

          {/* Benefit 3 */}
          <div className="p-4 bg-white rounded-2xl border border-[#E5ECF6] shadow-2xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Target className="w-5.5 h-5.5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-800 m-0">Luyện phỏng vấn hiệu quả</h4>
              <p className="text-[11.5px] sm:text-xs text-slate-500 m-0 mt-0.5 leading-tight">
                Tự tin chinh phục mọi vòng phỏng vấn
              </p>
            </div>
          </div>

          {/* Benefit 4 */}
          <div className="p-4 bg-white rounded-2xl border border-[#E5ECF6] shadow-2xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Briefcase className="w-5.5 h-5.5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-800 m-0">Tiếp cận nhiều cơ hội hơn</h4>
              <p className="text-[11.5px] sm:text-xs text-slate-500 m-0 mt-0.5 leading-tight">
                Gợi ý việc làm phù hợp, cập nhật xu hướng thị trường
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. CTA BANNER CUỐI TRANG: CAREZA AI CAREER               */}
      {/* ======================================================== */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-50/70 via-white to-blue-50/50 border border-blue-200/90 shadow-2xs p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4 mt-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-base sm:text-lg font-black text-slate-900 m-0">
            Công nghệ AI, giá trị thật cho hành trình sự nghiệp
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 font-medium m-0">
            Careza đồng hành cùng bạn trên từng bước phát triển kỹ năng và định hướng việc làm.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            window.scrollTo({ top: 180, behavior: "smooth" });
            setInputText("Tôi muốn được tư vấn định hướng nghề nghiệp!");
          }}
          className="shrink-0 px-5 py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white hover:text-white font-bold text-xs sm:text-sm shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer border-none"
        >
          <span className="text-white">Bắt đầu trò chuyện ngay</span>
          <ArrowRight className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}
