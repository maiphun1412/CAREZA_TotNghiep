"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Avatar,
  Modal,
  Select,
  Input,
  Dropdown,
  Tooltip,
  Tag,
  App,
  Badge,
  Skeleton,
  Button,
  Spin,
  Alert,
  Empty,
} from "antd";
import { interactionService } from "@/services/interaction.service";
import type { MenuProps } from "antd";
import {
  Search,
  Plus,
  Send,
  Paperclip,
  Smile,
  Mail,
  Calendar,
  Star,
  MoreVertical,
  Briefcase,
  ExternalLink,
  CheckCheck,
  Check,
  Phone,
  MapPin,
  Edit3,
  Sparkles,
  FileText,
  User,
  Clock,
  Eye,
  Download,
  Filter,
  X,
  ChevronRight,
  MessageSquare,
  Bookmark,
  Share2,
  Trash2,
  BellOff,
  Archive,
  ArrowLeft,
  ChevronDown,
  Info,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import Link from "next/link";

// =====================================================================
// INTERFACES & TYPES
// =====================================================================

export interface ChatMessage {
  id: string;
  sender: "candidate" | "recruiter" | "system";
  text: string;
  time: string;
  status?: "sent" | "delivered" | "read";
  attachments?: {
    name: string;
    size: string;
    type: "pdf" | "image" | "doc";
    url?: string;
  }[];
}

export interface CandidateConversation {
  id: string;
  candidateName: string;
  avatar: string;
  jobTitle: string;
  department: string;
  location: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  isPriority: boolean;
  email: string;
  phone: string;
  applicationStage: string;
  applicationDate: string;
  internalNote: string;
  noteAuthor: string;
  noteDate: string;
  tags: { label: string; color: string }[];
  documents: {
    name: string;
    type: string;
    size: string;
    date: string;
    url: string;
  }[];
  historyTimeline: {
    title: string;
    date: string;
    desc: string;
  }[];
  messages: ChatMessage[];
}

// =====================================================================
// MOCK DATA (MATCHING REFERENCE EXACTLY)
// =====================================================================

const INITIAL_CONVERSATIONS: CandidateConversation[] = [];

// Message Templates Categories & Items
const MESSAGE_TEMPLATES = [
  {
    id: "tpl-1",
    category: "Mời phỏng vấn",
    title: "Mời phỏng vấn chuyên môn (Trực tiếp)",
    content:
      "Chào bạn, sau khi xem xét hồ sơ ứng tuyển, chúng tôi rất ấn tượng và muốn mời bạn tham gia buổi phỏng vấn trực tiếp vào lúc [Giờ], ngày [Ngày] tại văn phòng công ty. Bạn vui lòng xác nhận có thể tham gia được không nhé!",
  },
  {
    id: "tpl-2",
    category: "Mời phỏng vấn",
    title: "Mời phỏng vấn Online (Google Meet)",
    content:
      "Chào bạn, công ty muốn mời bạn tham gia buổi phỏng vấn trực tuyến qua Google Meet vào lúc [Giờ], ngày [Ngày]. Link Google Meet: [Link]. Vui lòng xác nhận để chúng tôi gửi lời mời lịch chính thức nhé!",
  },
  {
    id: "tpl-3",
    category: "Yêu cầu bổ sung CV",
    title: "Yêu cầu cập nhật Portfolio / Dự án",
    content:
      "Chào bạn, để bộ phận chuyên môn đánh giá kỹ hơn, bạn vui lòng gửi bổ sung thêm link Portfolio hoặc mô tả chi tiết các dự án bạn đã từng thực hiện nhé. Cảm ơn bạn!",
  },
  {
    id: "tpl-4",
    category: "Thông báo kết quả",
    title: "Thông báo vượt qua vòng phỏng vấn",
    content:
      "Chào bạn, chúc mừng bạn đã hoàn thành xuất sắc vòng phỏng vấn vừa rồi. Chúng tôi sẽ tiến hành các bước tiếp theo để gửi thư mời nhận việc (Offer) đến bạn trong vòng 1-2 ngày tới.",
  },
  {
    id: "tpl-5",
    category: "Nhắc lịch phỏng vấn",
    title: "Nhắc hẹn trước giờ phỏng vấn",
    content:
      "Chào bạn, đây là thông báo nhắc bạn có lịch phỏng vấn với công ty vào lúc [Giờ] hôm nay. Bạn vui lòng chuẩn bị và tham gia đúng giờ nhé. Chúc bạn có buổi phỏng vấn thành công!",
  },
  {
    id: "tpl-6",
    category: "Cảm ơn ứng viên",
    title: "Cảm ơn đã quan tâm ứng tuyển",
    content:
      "Cảm ơn bạn đã dành thời gian quan tâm và ứng tuyển tại công ty. Bộ phận tuyển dụng đã nhận được hồ sơ của bạn và sẽ liên hệ lại sớm nhất có thể.",
  },
];

// =====================================================================
// MAIN COMPONENT: RECRUITER CHAT WORKSPACE
// =====================================================================

export default function EmployerChatPage() {
  const { message } = App.useApp();
  const { user } = useAuthStore();
  const recruiterName = user?.fullName || "Mai Phương";

  // State Management
  const [conversations, setConversations] = useState<CandidateConversation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeConvId, setActiveConvId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "priority">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [rightPanelTab, setRightPanelTab] = useState<"info" | "history" | "docs">("info");
  const [inputText, setInputText] = useState<string>("");
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState<boolean>(false);

  // Modals
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState<boolean>(false);
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState<boolean>(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState<boolean>(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);
  const [isTalentPoolModalOpen, setIsTalentPoolModalOpen] = useState<boolean>(false);
  const [isCvModalOpen, setIsCvModalOpen] = useState<boolean>(false);
  const [isAddTagModalOpen, setIsAddTagModalOpen] = useState<boolean>(false);
  const [isEditNoteModalOpen, setIsEditNoteModalOpen] = useState<boolean>(false);

  // Modal Form States
  const [newTagInput, setNewTagInput] = useState<string>("");
  const [noteEditInput, setNoteEditInput] = useState<string>("");
  const [newMsgCandidate, setNewMsgCandidate] = useState<string>("");
  const [newMsgContent, setNewMsgContent] = useState<string>("");
  const [interviewDate, setInterviewDate] = useState<string>("2026-08-23");
  const [interviewTime, setInterviewTime] = useState<string>("09:00");
  const [interviewType, setInterviewType] = useState<string>("Google Meet");
  const [emailSubject, setEmailSubject] = useState<string>("");
  const [emailBody, setEmailBody] = useState<string>("");

  // Refs for scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await interactionService.getConversations();
      if (res && res.length > 0) {
        const mapped: CandidateConversation[] = res.map((conv: any) => {
          return {
            id: String(conv.id),
            candidateName: conv.partner?.name || "Ứng viên",
            avatar:
              conv.partner?.avatar ||
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
            jobTitle: "Ứng viên ứng tuyển",
            department: "Bộ phận tuyển dụng",
            location: "Việt Nam",
            lastMessage: conv.last_message?.content || "Bắt đầu cuộc trò chuyện...",
            lastMessageTime: conv.last_message?.created_at
              ? new Date(conv.last_message.created_at).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Gần đây",
            unreadCount: conv.unread_count || 0,
            isOnline: false,
            isPriority: false,
            email: conv.partner?.email || "",
            phone: "",
            applicationStage: "Đang ứng tuyển",
            applicationDate: conv.created_at
              ? new Date(conv.created_at).toLocaleDateString("vi-VN")
              : "Hôm nay",
            internalNote: "",
            noteAuthor: "",
            noteDate: "",
            tags: [],
            documents: [],
            historyTimeline: [],
            messages: conv.last_message
              ? [
                  {
                    id: String(conv.last_message.id || "last"),
                    sender:
                      conv.last_message.sender_type === "candidate"
                        ? "candidate"
                        : "recruiter",
                    text: conv.last_message.content || "",
                    time: new Date(conv.last_message.created_at).toLocaleTimeString(
                      "vi-VN",
                      { hour: "2-digit", minute: "2-digit" }
                    ),
                    status: "delivered",
                  },
                ]
              : [],
          };
        });
        setConversations(mapped);
        if (mapped.length > 0) {
          setActiveConvId((prev) => prev || mapped[0].id);
        }
      } else {
        setConversations([]);
      }
    } catch {
      setError("Không thể tải danh sách cuộc trò chuyện. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Active conversation object
  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConvId, activeConv?.messages]);

  // Mark as read when selecting conversation
  const handleSelectConversation = (convId: string) => {
    setActiveConvId(convId);
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c))
    );
  };

  // Toggle priority star
  const handleTogglePriority = (convId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, isPriority: !c.isPriority } : c))
    );
    message.success("Đã cập nhật trạng thái ưu tiên");
  };

  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    // Tab filter
    if (activeTab === "unread" && conv.unreadCount === 0) return false;
    if (activeTab === "priority" && !conv.isPriority) return false;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = conv.candidateName.toLowerCase().includes(q);
      const matchJob = conv.jobTitle.toLowerCase().includes(q);
      const matchMsg = conv.lastMessage.toLowerCase().includes(q);
      return matchName || matchJob || matchMsg;
    }

    return true;
  });

  // Calculate dynamic tab counts
  const totalCount = conversations.length;
  const unreadCount = conversations.reduce((acc, c) => acc + (c.unreadCount > 0 ? 1 : 0), 0);
  const priorityCount = conversations.filter((c) => c.isPriority).length;

  // Send message handler
  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "recruiter",
      text: inputText.trim(),
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      status: "read",
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConvId) {
          return {
            ...c,
            lastMessage: newMsg.text,
            lastMessageTime: newMsg.time,
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    setInputText("");
    setIsEmojiPickerOpen(false);
  };

  // Handle Enter key for send
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Insert template into chat input
  const handleApplyTemplate = (content: string) => {
    setInputText(content);
    setIsTemplateModalOpen(false);
    message.success("Đã nạp nội dung mẫu vào khung chat!");
  };

  // Handle Quick Interview Invitation Send
  const handleConfirmSendInterview = () => {
    const inviteText = `Thư mời phỏng vấn: Trân trọng mời ${activeConv.candidateName} tham gia buổi phỏng vấn vị trí ${activeConv.jobTitle} vào lúc ${interviewTime}, ngày ${interviewDate} (Hình thức: ${interviewType}). Vui lòng xác nhận giúp phòng Nhân sự nhé!`;

    const newMsg: ChatMessage = {
      id: `msg-inv-${Date.now()}`,
      sender: "recruiter",
      text: inviteText,
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      status: "read",
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConvId) {
          return {
            ...c,
            lastMessage: "Đã gửi thư mời phỏng vấn",
            lastMessageTime: newMsg.time,
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    setIsInterviewModalOpen(false);
    message.success(`Đã gửi lịch phỏng vấn thành công đến ${activeConv.candidateName}`);
  };

  // Handle Add Tag
  const handleAddTagSubmit = () => {
    if (!newTagInput.trim()) return;
    const colors = ["blue", "green", "purple", "orange", "cyan"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConvId) {
          return {
            ...c,
            tags: [...c.tags, { label: newTagInput.trim(), color: randomColor }],
          };
        }
        return c;
      })
    );
    setNewTagInput("");
    setIsAddTagModalOpen(false);
    message.success("Đã thêm thẻ mới cho ứng viên!");
  };

  // Handle Edit Note
  const handleSaveNote = () => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConvId) {
          return {
            ...c,
            internalNote: noteEditInput,
            noteAuthor: recruiterName,
            noteDate: new Date().toLocaleDateString("vi-VN"),
          };
        }
        return c;
      })
    );
    setIsEditNoteModalOpen(false);
    message.success("Đã cập nhật ghi chú nội bộ!");
  };

  // Action menu on chat header
  const chatHeaderMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      label: "Xem hồ sơ ứng viên",
      icon: <User className="w-3.5 h-3.5" />,
      onClick: () => message.info(`Xem hồ sơ chi tiết của ${activeConv.candidateName}`),
    },
    {
      key: "priority",
      label: activeConv?.isPriority ? "Bỏ đánh dấu ưu tiên" : "Đánh dấu ưu tiên",
      icon: <Star className="w-3.5 h-3.5 text-amber-500" />,
      onClick: () => handleTogglePriority(activeConv.id),
    },
    {
      key: "unread",
      label: "Đánh dấu chưa đọc",
      icon: <MessageSquare className="w-3.5 h-3.5 text-blue-600" />,
      onClick: () => {
        setConversations((prev) =>
          prev.map((c) => (c.id === activeConvId ? { ...c, unreadCount: 1 } : c))
        );
        message.info("Đã đánh dấu là chưa đọc");
      },
    },
    {
      type: "divider",
    },
    {
      key: "mute",
      label: "Tắt thông báo cuộc trò chuyện",
      icon: <BellOff className="w-3.5 h-3.5 text-slate-500" />,
      onClick: () => message.info("Đã tắt thông báo cuộc trò chuyện"),
    },
    {
      key: "archive",
      label: "Lưu trữ cuộc trò chuyện",
      icon: <Archive className="w-3.5 h-3.5 text-slate-500" />,
      onClick: () => message.info("Đã lưu trữ cuộc trò chuyện"),
    },
  ];

  return (
    <div className="space-y-3.5 w-full font-sans">
      {/* ======================================================== */}
      {/* 1. TOP PAGE HEADER                                       */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-transparent">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 m-0 tracking-tight leading-snug">
            Chat với ứng viên
          </h1>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsTemplateModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            <span>Mẫu tin nhắn</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setNewMsgCandidate("");
              setNewMsgContent("");
              setIsNewMessageModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo tin nhắn mới</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. THREE-COLUMN MESSAGING WORKSPACE (EXACT REFERENCE)   */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-200/80 h-[calc(100vh-140px)] min-h-[580px]">
        {/* ====================================================== */}
        {/* LEFT COLUMN: CONVERSATION LIST (~23%)                  */}
        {/* ====================================================== */}
        <div className="w-full lg:w-[280px] xl:w-[320px] 2xl:w-[340px] shrink-0 flex flex-col min-h-0 bg-white">
          {/* Conversation Tabs */}
          <div className="flex items-center gap-4 px-4 pt-3.5 border-b border-slate-100 text-xs font-bold shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`pb-2.5 relative cursor-pointer transition-colors flex items-center gap-1.5 ${
                activeTab === "all"
                  ? "text-[#0062ff] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#0062ff] after:rounded-full"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>Tất cả</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === "all"
                    ? "bg-[#0062ff] text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {totalCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("unread")}
              className={`pb-2.5 relative cursor-pointer transition-colors flex items-center gap-1.5 ${
                activeTab === "unread"
                  ? "text-[#0062ff] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#0062ff] after:rounded-full"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>Chưa đọc</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === "unread"
                    ? "bg-[#0062ff] text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {unreadCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("priority")}
              className={`pb-2.5 relative cursor-pointer transition-colors flex items-center gap-1.5 ${
                activeTab === "priority"
                  ? "text-[#0062ff] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#0062ff] after:rounded-full"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>Ưu tiên</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === "priority"
                    ? "bg-[#0062ff] text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {priorityCount}
              </span>
            </button>
          </div>

          {/* Search Conversation Bar */}
          <div className="p-3 border-b border-slate-100 flex items-center gap-2 shrink-0 bg-slate-50/50">
            <div className="flex-1">
              <Input
                prefix={<Search className="w-3.5 h-3.5 text-slate-400 mr-1" />}
                placeholder="Tìm kiếm cuộc trò chuyện..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-xl text-xs bg-white"
                allowClear
              />
            </div>
            <Tooltip title="Bộ lọc nâng cao">
              <button
                type="button"
                onClick={() => message.info("Lọc theo vị trí / trạng thái ứng tuyển")}
                className="w-8 h-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-[#0062ff] transition-colors cursor-pointer shadow-2xs"
              >
                <Filter className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
          </div>

          {/* Scrollable Conversation List */}
          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100">
            {error && (
              <div className="p-3">
                <Alert
                  type="error"
                  message={error}
                  action={
                    <Button size="small" onClick={fetchConversations}>
                      Tải lại
                    </Button>
                  }
                  showIcon
                />
              </div>
            )}
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
                <Spin />
                <span>Đang tải hội thoại...</span>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
                <span>Không tìm thấy cuộc trò chuyện nào</span>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === activeConvId;
                return (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`p-3 sm:px-3.5 flex items-start gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[#F0F6FF] border-l-4 border-l-[#0062ff] pl-2.5"
                        : "hover:bg-slate-50/80"
                    }`}
                  >
                    {/* Candidate Avatar with online badge */}
                    <div className="relative shrink-0 mt-0.5">
                      <Avatar
                        src={conv.avatar}
                        size={40}
                        className="border border-slate-200 shadow-2xs"
                      />
                      {conv.isOnline && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                      )}
                    </div>

                    {/* Content Preview */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span
                          className={`text-xs truncate block ${
                            isSelected
                              ? "font-bold text-[#0062ff]"
                              : "font-semibold text-slate-900"
                          }`}
                        >
                          {conv.candidateName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium shrink-0">
                          {conv.lastMessageTime}
                        </span>
                      </div>

                      <span className="text-[10.5px] font-medium text-slate-500 block truncate mb-1">
                        {conv.jobTitle}
                      </span>

                      <div className="flex items-center justify-between gap-1">
                        <p className="text-[11px] text-slate-500 truncate m-0 font-normal">
                          {conv.lastMessage}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-[#0062ff] text-white text-[9.5px] font-bold shrink-0">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Bottom: Load more button */}
            <div className="p-3 text-center">
              <button
                type="button"
                onClick={() => message.info("Đã tải toàn bộ cuộc trò chuyện.")}
                className="w-full py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-[11px] shadow-2xs transition-colors cursor-pointer"
              >
                Tải thêm cuộc trò chuyện
              </button>
            </div>
          </div>
        </div>

        {/* ====================================================== */}
        {/* CENTER COLUMN: MAIN CHAT AREA (~53%)                  */}
        {/* ====================================================== */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-[#F9FBFC]">
          {!activeConv ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <MessageSquare className="w-12 h-12 text-slate-300 mb-3 stroke-1" />
              <h3 className="text-base font-bold text-slate-700">Chưa có cuộc trò chuyện nào</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Khi có tin nhắn trao đổi với ứng viên, cuộc trò chuyện sẽ hiển thị tại đây.
              </p>
            </div>
          ) : (
            <>
          {/* Chat Header */}
          <div className="px-4 py-3 bg-white border-b border-slate-200/80 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <Avatar
                  src={activeConv.avatar}
                  size={42}
                  className="border border-slate-200 shadow-2xs"
                />
                {activeConv.isOnline && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                )}
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-slate-900 m-0 truncate leading-tight">
                  {activeConv.candidateName}
                </h2>
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 mt-0.5">
                  <span className="truncate">{activeConv.jobTitle}</span>
                  <span>•</span>
                  {activeConv.isOnline ? (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Đang hoạt động
                    </span>
                  ) : (
                    <span className="text-slate-400">Offline</span>
                  )}
                </div>
              </div>
            </div>

            {/* Header Action Icons */}
            <div className="flex items-center gap-1 shrink-0">
              <Tooltip title={activeConv.isPriority ? "Bỏ ưu tiên" : "Đánh dấu ưu tiên"}>
                <button
                  type="button"
                  onClick={() => handleTogglePriority(activeConv.id)}
                  className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
                    activeConv.isPriority
                      ? "border-amber-200 bg-amber-50 text-amber-500"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-500"
                  }`}
                >
                  <Star
                    className={`w-4 h-4 ${
                      activeConv.isPriority ? "fill-amber-500" : ""
                    }`}
                  />
                </button>
              </Tooltip>

              <Tooltip title="Gửi email cho ứng viên">
                <button
                  type="button"
                  onClick={() => {
                    setEmailSubject(`Trao đổi về vị trí ${activeConv.jobTitle} - Google Vietnam`);
                    setEmailBody(
                      `Chào ${activeConv.candidateName},\n\nPhòng Nhân sự Google Vietnam xin gửi trao đổi về hồ sơ ứng tuyển vị trí ${activeConv.jobTitle} của bạn...\n\nTrân trọng,\nMai Phương`
                    );
                    setIsEmailModalOpen(true);
                  }}
                  className="w-8 h-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-[#0062ff] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                </button>
              </Tooltip>

              <Tooltip title="Tạo lịch phỏng vấn nhanh">
                <button
                  type="button"
                  onClick={() => setIsInterviewModalOpen(true)}
                  className="w-8 h-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-[#0062ff] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                </button>
              </Tooltip>

              <Dropdown menu={{ items: chatHeaderMenuItems }} placement="bottomRight" arrow>
                <button
                  type="button"
                  className="w-8 h-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </Dropdown>
            </div>
          </div>

          {/* Job Context Compact Banner (Right below chat header) */}
          <div className="px-4 py-2 bg-[#F3F6FD] border-b border-slate-200/70 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-[#E0E7FF] text-[#4F46E5] flex items-center justify-center shrink-0">
                <Briefcase className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-800 block truncate leading-tight">
                  {activeConv.jobTitle}
                </span>
                <span className="text-[10.5px] text-slate-500 font-medium block truncate">
                  {activeConv.department} • {activeConv.location.split(",")[0]}
                </span>
              </div>
            </div>

            <Link
              href="/doanh-nghiep/tin-tuyen-dung"
              className="text-[#0062ff] hover:text-[#0052cc] text-xs font-bold flex items-center gap-1 shrink-0 transition-colors"
            >
              <span>Xem chi tiết tin tuyển dụng</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3.5">
            {/* Centered Date Separator */}
            <div className="flex items-center justify-center my-2">
              <span className="px-3 py-1 rounded-full bg-slate-200/70 text-slate-600 text-[10.5px] font-bold shadow-2xs">
                Hôm nay
              </span>
            </div>

            {/* Render Chat Messages */}
            {activeConv.messages.map((msg) => {
              if (msg.sender === "candidate") {
                return (
                  <div key={msg.id} className="flex items-start gap-2.5 max-w-[80%]">
                    <Avatar
                      src={activeConv.avatar}
                      size={32}
                      className="border border-slate-200 shrink-0 mt-1 shadow-2xs"
                    />
                    <div className="space-y-1">
                      <div className="bg-[#F5F6FA] text-slate-800 text-xs leading-relaxed px-3.5 py-2.5 rounded-2xl rounded-tl-sm border border-slate-200/60 shadow-2xs">
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium block pl-1">
                        {msg.time}
                      </span>
                    </div>
                  </div>
                );
              }

              if (msg.sender === "recruiter") {
                return (
                  <div
                    key={msg.id}
                    className="flex flex-col items-end max-w-[80%] ml-auto space-y-1"
                  >
                    <div className="bg-[#EAF2FF] text-slate-900 text-xs leading-relaxed px-3.5 py-2.5 rounded-2xl rounded-tr-sm border border-[#D4E5FF] shadow-2xs">
                      {msg.text}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium pr-1">
                      <span>{msg.time}</span>
                      {msg.status === "read" && (
                        <CheckCheck className="w-3 h-3 text-[#0062ff]" />
                      )}
                      {msg.status === "delivered" && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                );
              }

              return null;
            })}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input & Composer (Sticky at bottom) */}
          <div className="p-3 bg-white border-t border-slate-200/80 space-y-2 shrink-0">
            {/* Input Bar */}
            <div className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100/60 focus-within:bg-white border border-slate-200 rounded-2xl px-3 py-1.5 transition-all">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập tin nhắn..."
                className="flex-1 bg-transparent border-none outline-none text-xs text-slate-800 placeholder-slate-400 py-1"
              />

              {/* Attach File Button */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={() => message.info("Đã chọn đính kèm file.")}
              />
              <Tooltip title="Đính kèm file / CV">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
              </Tooltip>

              {/* Emoji Button */}
              <Tooltip title="Chèn biểu tượng cảm xúc">
                <button
                  type="button"
                  onClick={() => {
                    setInputText((prev) => prev + " 😊");
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
                >
                  <Smile className="w-4 h-4" />
                </button>
              </Tooltip>

              {/* Send Button */}
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className={`p-2 rounded-xl text-white font-bold transition-all cursor-pointer ${
                  inputText.trim()
                    ? "bg-[#0062ff] hover:bg-[#0052cc] shadow-xs active:scale-95"
                    : "bg-slate-300 cursor-not-allowed opacity-60"
                }`}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Actions Bar under Input */}
            <div className="flex items-center gap-2 overflow-x-auto pb-0.5 text-xs">
              <button
                type="button"
                onClick={() => setIsTemplateModalOpen(true)}
                className="px-2.5 py-1 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-[11px] flex items-center gap-1.5 shadow-2xs transition-colors shrink-0 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Mẫu tin nhắn</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setInputText(
                    "Chào bạn, hồ sơ của bạn đã được chuyển sang vòng tiếp theo nhé!"
                  );
                }}
                className="px-2.5 py-1 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-[11px] flex items-center gap-1.5 shadow-2xs transition-colors shrink-0 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Gửi tin nhắn nhanh</span>
              </button>

              <button
                type="button"
                onClick={() => setIsInterviewModalOpen(true)}
                className="px-2.5 py-1 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-[11px] flex items-center gap-1.5 shadow-2xs transition-colors shrink-0 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>Gửi lịch phỏng vấn</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmailSubject(`Trao đổi về vị trí ${activeConv.jobTitle} - Google Vietnam`);
                  setEmailBody(
                    `Chào ${activeConv.candidateName},\n\nPhòng Nhân sự xin gửi email trao đổi về hồ sơ của bạn...\n\nTrân trọng,\nMai Phương`
                  );
                  setIsEmailModalOpen(true);
                }}
                className="px-2.5 py-1 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-[11px] flex items-center gap-1.5 shadow-2xs transition-colors shrink-0 cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>Gửi email</span>
              </button>

              <button
                type="button"
                onClick={() => message.info("Xem thêm tùy chọn")}
                className="p-1 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          </>
          )}
        </div>

        {/* ====================================================== */}
        {/* RIGHT COLUMN: CANDIDATE DETAIL PANEL (~24%)            */}
        {/* ====================================================== */}
        {activeConv && (
        <div className="w-full lg:w-[280px] xl:w-[320px] 2xl:w-[340px] shrink-0 flex flex-col min-h-0 bg-white">
          {/* Right Panel Tabs */}
          <div className="flex items-center justify-around px-2 pt-3.5 border-b border-slate-100 text-xs font-bold shrink-0">
            <button
              type="button"
              onClick={() => setRightPanelTab("info")}
              className={`pb-2.5 relative cursor-pointer transition-colors ${
                rightPanelTab === "info"
                  ? "text-[#0062ff] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#0062ff] after:rounded-full"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Thông tin ứng viên
            </button>

            <button
              type="button"
              onClick={() => setRightPanelTab("history")}
              className={`pb-2.5 relative cursor-pointer transition-colors ${
                rightPanelTab === "history"
                  ? "text-[#0062ff] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#0062ff] after:rounded-full"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Lịch sử
            </button>

            <button
              type="button"
              onClick={() => setRightPanelTab("docs")}
              className={`pb-2.5 relative cursor-pointer transition-colors ${
                rightPanelTab === "docs"
                  ? "text-[#0062ff] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#0062ff] after:rounded-full"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Tài liệu
            </button>
          </div>

          {/* Scrollable Right Panel Content */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
            {/* TAB 1: THÔNG TIN ỨNG VIÊN */}
            {rightPanelTab === "info" && (
              <div className="space-y-4">
                {/* Candidate Avatar & Profile Header */}
                <div className="text-center space-y-2 relative pb-2 border-b border-slate-100">
                  <div className="relative inline-block">
                    <Avatar
                      src={activeConv.avatar}
                      size={64}
                      className="border-2 border-slate-200 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleTogglePriority(activeConv.id)}
                      className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-amber-500 shadow-2xs cursor-pointer"
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          activeConv.isPriority ? "fill-amber-500 text-amber-500" : ""
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 m-0">
                      {activeConv.candidateName}
                    </h3>
                    <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-emerald-600 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Đang hoạt động</span>
                    </div>
                    <span className="text-xs text-slate-500 font-medium block mt-0.5">
                      {activeConv.jobTitle}
                    </span>
                  </div>

                  {/* Contact Info List */}
                  <div className="space-y-1.5 text-left pt-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{activeConv.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{activeConv.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{activeConv.location}</span>
                    </div>
                  </div>
                </div>

                {/* Section: Ứng tuyển */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-900 block">
                    Ứng tuyển
                  </span>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <Briefcase className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-800 block truncate">
                          {activeConv.jobTitle}
                        </span>
                        <span className="text-[10.5px] text-slate-400 font-medium block">
                          {activeConv.department}
                        </span>
                      </div>
                    </div>

                    <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Vòng:</span>
                      <span className="px-2 py-0.5 rounded-lg bg-purple-100 text-purple-700 font-bold text-[10.5px]">
                        {activeConv.applicationStage}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section: Ghi chú nội bộ */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 block">
                      Ghi chú nội bộ
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setNoteEditInput(activeConv.internalNote);
                        setIsEditNoteModalOpen(true);
                      }}
                      className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/70 text-xs text-slate-700 leading-relaxed space-y-2">
                    <p className="m-0 font-normal">{activeConv.internalNote}</p>
                    <div className="text-[10px] text-slate-400 font-medium pt-1 border-t border-amber-200/50">
                      Cập nhật bởi {activeConv.noteAuthor} • {activeConv.noteDate}
                    </div>
                  </div>
                </div>

                {/* Section: Thẻ (Tags) */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-900 block">
                    Thẻ
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {activeConv.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold ${
                          t.color === "green"
                            ? "bg-emerald-100 text-emerald-700"
                            : t.color === "blue"
                            ? "bg-blue-100 text-blue-700"
                            : t.color === "purple"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {t.label}
                      </span>
                    ))}
                    <button
                      type="button"
                      onClick={() => setIsAddTagModalOpen(true)}
                      className="px-2 py-0.8 rounded-lg border border-dashed border-slate-300 text-slate-500 hover:text-slate-800 text-[10.5px] font-semibold cursor-pointer hover:border-slate-400 transition-colors"
                    >
                      + Thêm thẻ
                    </button>
                  </div>
                </div>

                {/* Section: Hành động nhanh (2x2 Grid) */}
                <div className="space-y-2 pt-1">
                  <span className="text-xs font-bold text-slate-900 block">
                    Hành động nhanh
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/doanh-nghiep/ung-vien"
                      className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-2xs transition-colors text-center"
                    >
                      <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Xem hồ sơ</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => setIsCvModalOpen(true)}
                      className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer text-center"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Xem CV</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsTalentPoolModalOpen(true)}
                      className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer text-center"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>Talent Pool</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsInterviewModalOpen(true)}
                      className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer text-center"
                    >
                      <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Tạo lịch PV</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: LỊCH SỬ TUYỂN DỤNG */}
            {rightPanelTab === "history" && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-900 block">
                  Tiến trình ứng tuyển
                </span>
                <div className="relative pl-4 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {activeConv.historyTimeline.map((item, idx) => (
                    <div key={idx} className="relative space-y-0.5">
                      <div className="absolute -left-4 top-1 w-2.5 h-2.5 rounded-full bg-[#0062ff] ring-2 ring-white" />
                      <span className="text-xs font-bold text-slate-800 block">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium block">
                        {item.date}
                      </span>
                      <p className="text-[11px] text-slate-600 font-normal m-0 pt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: TÀI LIỆU */}
            {rightPanelTab === "docs" && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-900 block">
                  Tài liệu đính kèm ({activeConv.documents.length})
                </span>
                {activeConv.documents.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    Chưa có tài liệu nào
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activeConv.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 transition-colors flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-800 block truncate">
                              {doc.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium block">
                              {doc.size} • {doc.date}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => message.info(`Đang tải file ${doc.name}...`)}
                          className="p-1.5 text-slate-400 hover:text-[#0062ff] rounded-lg hover:bg-white transition-colors cursor-pointer shrink-0"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 3. CENTER MODAL: MẪU TIN NHẮN (MESSAGE TEMPLATES)        */}
      {/* ======================================================== */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <FileText className="w-5 h-5 text-[#0062ff]" />
            <span>Thư viện mẫu tin nhắn tuyển dụng</span>
          </div>
        }
        open={isTemplateModalOpen}
        onCancel={() => setIsTemplateModalOpen(false)}
        footer={null}
        width={680}
        centered
        closable={false}
      >
        <div className="space-y-3.5 pt-2">
          <p className="text-xs text-slate-500 font-medium m-0">
            Chọn mẫu tin nhắn soạn sẵn để gửi nhanh đến ứng viên trong hội thoại:
          </p>

          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {MESSAGE_TEMPLATES.map((tpl) => (
              <div
                key={tpl.id}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/20 transition-all space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-[#0062ff] text-[10.5px] font-bold">
                      {tpl.category}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{tpl.title}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate(tpl.content)}
                    className="px-3 py-1 bg-[#0062ff] hover:bg-[#0052cc] text-white rounded-lg font-bold text-xs shadow-2xs transition-all cursor-pointer"
                  >
                    Dùng mẫu này
                  </button>
                </div>
                <p className="text-xs text-slate-600 font-normal leading-relaxed m-0 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {tpl.content}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsTemplateModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* 4. CENTER MODAL: TẠO TIN NHẮN MỚI                        */}
      {/* ======================================================== */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Plus className="w-5 h-5 text-[#0062ff]" />
            <span>Tạo cuộc trò chuyện mới</span>
          </div>
        }
        open={isNewMessageModalOpen}
        onCancel={() => setIsNewMessageModalOpen(false)}
        footer={null}
        width={540}
        centered
        closable={false}
      >
        <div className="space-y-3.5 pt-2">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Chọn ứng viên <span className="text-rose-500">*</span>
            </label>
            <Select
              placeholder="Tìm kiếm ứng viên theo tên hoặc vị trí..."
              value={newMsgCandidate || undefined}
              onChange={(val) => setNewMsgCandidate(val)}
              className="w-full"
              options={conversations.map((c) => ({
                value: c.id,
                label: `${c.candidateName} - ${c.jobTitle}`,
              }))}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Nội dung tin nhắn đầu tiên <span className="text-rose-500">*</span>
            </label>
            <Input.TextArea
              rows={4}
              placeholder="Nhập nội dung mở đầu cuộc trò chuyện..."
              value={newMsgContent}
              onChange={(e) => setNewMsgContent(e.target.value)}
              className="rounded-xl text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsNewMessageModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => {
                if (!newMsgCandidate || !newMsgContent.trim()) {
                  message.warning("Vui lòng chọn ứng viên và nhập nội dung tin nhắn!");
                  return;
                }
                setActiveConvId(newMsgCandidate);
                setInputText(newMsgContent);
                setIsNewMessageModalOpen(false);
                message.success("Đã mở hội thoại với ứng viên!");
              }}
              className="px-4 py-2 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs shadow-sm cursor-pointer"
            >
              Bắt đầu trò chuyện
            </button>
          </div>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* 5. CENTER MODAL: GỬI LỊCH PHỎNG VẤN NHANH                */}
      {/* ======================================================== */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <span>Gửi lịch phỏng vấn cho {activeConv?.candidateName}</span>
          </div>
        }
        open={isInterviewModalOpen}
        onCancel={() => setIsInterviewModalOpen(false)}
        footer={null}
        width={520}
        centered
        closable={false}
      >
        <div className="space-y-3.5 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Ngày phỏng vấn
              </label>
              <Input
                type="date"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Giờ bắt đầu
              </label>
              <Input
                type="time"
                value={interviewTime}
                onChange={(e) => setInterviewTime(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Hình thức phỏng vấn
            </label>
            <Select
              value={interviewType}
              onChange={setInterviewType}
              className="w-full"
              options={[
                { value: "Google Meet", label: "Trực tuyến (Google Meet)" },
                { value: "Trực tiếp", label: "Trực tiếp tại văn phòng (Phòng A - Tầng 5)" },
                { value: "Phone Call", label: "Phỏng vấn qua điện thoại" },
              ]}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsInterviewModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirmSendInterview}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm cursor-pointer"
            >
              Gửi lịch mời
            </button>
          </div>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* 6. CENTER MODAL: GỬI EMAIL CHO ỨNG VIÊN                  */}
      {/* ======================================================== */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Mail className="w-5 h-5 text-blue-600" />
            <span>Gửi Email đến {activeConv?.email}</span>
          </div>
        }
        open={isEmailModalOpen}
        onCancel={() => setIsEmailModalOpen(false)}
        footer={null}
        width={580}
        centered
        closable={false}
      >
        <div className="space-y-3.5 pt-2">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Tiêu đề Email
            </label>
            <Input
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              className="rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Nội dung Email
            </label>
            <Input.TextArea
              rows={6}
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              className="rounded-xl text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEmailModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEmailModalOpen(false);
                message.success(`Đã gửi email thành công đến ${activeConv.email}`);
              }}
              className="px-4 py-2 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs shadow-sm cursor-pointer"
            >
              Gửi Email
            </button>
          </div>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* 7. CENTER MODAL: THÊM VÀO TALENT POOL                    */}
      {/* ======================================================== */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span>Thêm {activeConv?.candidateName} vào Talent Pool</span>
          </div>
        }
        open={isTalentPoolModalOpen}
        onCancel={() => setIsTalentPoolModalOpen(false)}
        footer={null}
        width={480}
        centered
        closable={false}
      >
        <div className="space-y-3.5 pt-2">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Nhóm Talent Pool
            </label>
            <Select
              defaultValue="pool-1"
              className="w-full"
              options={[
                { value: "pool-1", label: "Nhân sự Product / Tech tiềm năng" },
                { value: "pool-2", label: "Talent Pool Senior & Lead" },
                { value: "pool-3", label: "Ứng viên dự phòng Quý 4/2026" },
              ]}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsTalentPoolModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => {
                setIsTalentPoolModalOpen(false);
                message.success(`Đã lưu ${activeConv.candidateName} vào Talent Pool!`);
              }}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm cursor-pointer"
            >
              Xác nhận lưu
            </button>
          </div>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* 8. CENTER MODAL: XEM CV NHANH                            */}
      {/* ======================================================== */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <FileText className="w-5 h-5 text-emerald-600" />
            <span>Hồ sơ ứng viên: {activeConv?.candidateName}</span>
          </div>
        }
        open={isCvModalOpen}
        onCancel={() => setIsCvModalOpen(false)}
        footer={null}
        width={720}
        centered
        closable={false}
      >
        <div className="space-y-4 pt-2">
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-2xs">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 m-0">
                CV_{activeConv?.candidateName.replace(/\s+/g, "")}_{activeConv?.jobTitle.replace(/\s+/g, "")}.pdf
              </h4>
              <span className="text-xs text-slate-500 font-medium">
                Dung lượng: 2.4 MB • Định dạng: PDF tài liệu
              </span>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => message.success("Đang mở bản xem trước CV...")}
                className="px-4 py-2 bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Xem trực tuyến</span>
              </button>
              <button
                type="button"
                onClick={() => message.success("Đang tải file CV về máy...")}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải xuống file</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCvModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* 9. CENTER MODAL: THÊM THẺ (ADD TAG)                     */}
      {/* ======================================================== */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Tag className="w-5 h-5 text-blue-600" />
            <span>Thêm thẻ đánh giá ứng viên</span>
          </div>
        }
        open={isAddTagModalOpen}
        onCancel={() => setIsAddTagModalOpen(false)}
        footer={null}
        width={440}
        centered
        closable={false}
      >
        <div className="space-y-3.5 pt-2">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Tên thẻ mới
            </label>
            <Input
              placeholder="VD: Kỹ năng đàm phán, Tiếng Anh tốt..."
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              className="rounded-xl text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddTagModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleAddTagSubmit}
              className="px-4 py-2 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs shadow-sm cursor-pointer"
            >
              Thêm thẻ
            </button>
          </div>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* 10. CENTER MODAL: CHỈNH SỬA GHI CHÚ NỘI BỘ               */}
      {/* ======================================================== */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Edit3 className="w-5 h-5 text-amber-600" />
            <span>Cập nhật ghi chú nội bộ</span>
          </div>
        }
        open={isEditNoteModalOpen}
        onCancel={() => setIsEditNoteModalOpen(false)}
        footer={null}
        width={500}
        centered
        closable={false}
      >
        <div className="space-y-3.5 pt-2">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Nội dung đánh giá & ghi chú
            </label>
            <Input.TextArea
              rows={4}
              value={noteEditInput}
              onChange={(e) => setNoteEditInput(e.target.value)}
              className="rounded-xl text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditNoteModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSaveNote}
              className="px-4 py-2 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs shadow-sm cursor-pointer"
            >
              Lưu ghi chú
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
