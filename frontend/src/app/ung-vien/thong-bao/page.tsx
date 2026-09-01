"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { message, Drawer, Tag, Tooltip, Popconfirm } from "antd";
import {
  Bell,
  CheckCheck,
  Trash2,
  Search,
  SlidersHorizontal,
  ChevronRight,
  Calendar,
  Briefcase,
  Building2,
  FileText,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Clock,
  MapPin,
  Video,
  X,
  ExternalLink,
  Info,
  Lightbulb,
  CheckCircle2,
  Megaphone,
  BookOpen,
} from "lucide-react";

// =========================================================================
// TYPES & DATA STRUCTURES
// =========================================================================
export type NotificationCategory = "all" | "job" | "interview" | "profile" | "company" | "system";

export interface NotificationItem {
  id: string;
  category: "job" | "interview" | "profile" | "company" | "system";
  title: string;
  description: string;
  fullContent?: string;
  time: string;
  groupDate: "today" | "yesterday" | "earlier";
  isRead: boolean;
  meta?: {
    companyName?: string;
    companyLogo?: string;
    jobTitle?: string;
    interviewTime?: string;
    interviewType?: string;
    locationOrLink?: string;
    articleTitle?: string;
    linkUrl?: string;
    linkText?: string;
  };
  tip?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    category: "interview",
    title: "Lịch phỏng vấn sắp diễn ra",
    description: "Bạn có lịch phỏng vấn vị trí Product Manager tại TechViet vào ngày mai lúc 09:00. Hãy chuẩn bị thật tốt!",
    fullContent: "Bạn có lịch phỏng vấn vị trí Product Manager tại TechViet vào ngày mai lúc 09:00. Hãy chuẩn bị thật tốt để tạo ấn tượng với nhà tuyển dụng!",
    time: "10:42",
    groupDate: "today",
    isRead: false,
    meta: {
      companyName: "TechViet",
      companyLogo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
      jobTitle: "Product Manager",
      interviewTime: "09:00 - 10:00, 10/04/2025",
      interviewType: "Online - Google Meet",
      locationOrLink: "https://meet.google.com/abc-techviet-int",
      linkUrl: "/ung-vien/lich-phong-van",
      linkText: "Xem chi tiết lịch phỏng vấn →",
    },
    tip: "Xem lại mô tả công việc, tìm hiểu về công ty và chuẩn bị các câu hỏi để hỏi nhà tuyển dụng nhé!",
  },
  {
    id: "notif-2",
    category: "job",
    title: "Công việc mới phù hợp với bạn",
    description: "Có 5 việc làm mới phù hợp với hồ sơ và kỹ năng của bạn. Khám phá ngay để không bỏ lỡ cơ hội!",
    fullContent: "Hệ thống AI Careza vừa tìm thấy 5 việc làm mới thuộc ngành Công nghệ thông tin khớp hơn 90% với hồ sơ năng lực của bạn.",
    time: "09:15",
    groupDate: "today",
    isRead: false,
    meta: {
      companyName: "FPT Software, VNG, Shopee",
      jobTitle: "Senior React Developer, Frontend Engineer",
      linkUrl: "/viec-lam",
      linkText: "Xem 5 việc làm phù hợp →",
    },
    tip: "Ứng tuyển sớm trong vòng 48h đầu tiên giúp tăng 60% tỷ lệ được nhà tuyển dụng xem hồ sơ.",
  },
  {
    id: "notif-3",
    category: "company",
    title: "Công ty bạn theo dõi vừa đăng tin tuyển dụng",
    description: "TechViet đã đăng 3 vị trí mới: Backend Developer, QA Engineer, IT Support.",
    fullContent: "Công ty TechViet mà bạn đang theo dõi vừa mở đợt tuyển dụng nhân sự quý 2 với 3 vị trí hấp dẫn.",
    time: "08:30",
    groupDate: "today",
    isRead: false,
    meta: {
      companyName: "TechViet",
      jobTitle: "Backend Developer (NodeJS / Go)",
      linkUrl: "/cong-ty?tab=following",
      linkText: "Xem trang tuyển dụng TechViet →",
    },
    tip: "Bạn có thể kích hoạt thông báo tức thì cho từng công ty yêu thích trong phần Cài đặt.",
  },
  {
    id: "notif-4",
    category: "profile",
    title: "Hồ sơ của bạn đã được xem",
    description: "Nhà tuyển dụng tại HieuTech đã xem CV của bạn. Tiếp tục hoàn thiện hồ sơ để tăng cơ hội được liên hệ!",
    fullContent: "Nhà tuyển dụng HieuTech vừa truy cập và đánh giá hồ sơ ứng viên của bạn. Hãy đảm bảo thông tin liên hệ và số điện thoại luôn chính xác.",
    time: "08:12",
    groupDate: "today",
    isRead: false,
    meta: {
      companyName: "HieuTech",
      linkUrl: "/ung-vien/ho-so",
      linkText: "Cập nhật hồ sơ năng lực →",
    },
    tip: "Bổ sung các chứng chỉ ngoại ngữ và dự án nổi bật để tăng điểm ấn tượng trong mắt HR.",
  },
  {
    id: "notif-5",
    category: "system",
    title: "Mời bạn tham gia sự kiện online",
    description: "Webinar “Kỹ năng phỏng vấn và chinh phục nhà tuyển dụng” sẽ diễn ra vào thứ Sáu. Đăng ký ngay!",
    fullContent: "Careza Career Workshop: Webinar chuyên sâu hướng dẫn kỹ năng đàm phán lương và trả lời phỏng vấn theo mô hình STAR.",
    time: "20:18",
    groupDate: "yesterday",
    isRead: true,
    meta: {
      articleTitle: "Webinar Phỏng vấn thực chiến Careza 2025",
      linkUrl: "/cam-nang-nghe-nghiep",
      linkText: "Xem thông tin sự kiện →",
    },
    tip: "Chuẩn bị sẵn câu hỏi thực tế trong công việc để được diễn giả giải đáp trực tiếp trong buổi phát sóng.",
  },
  {
    id: "notif-6",
    category: "interview",
    title: "Hồ sơ ứng tuyển thành công",
    description: "Bạn đã ứng tuyển thành công vị trí Frontend Developer tại SunTech.",
    fullContent: "Đơn ứng tuyển của bạn đã được chuyển thẳng tới phòng Tuyển dụng SunTech. Nhà tuyển dụng sẽ phản hồi trong vòng 3 - 5 ngày làm việc.",
    time: "18:24",
    groupDate: "yesterday",
    isRead: true,
    meta: {
      companyName: "SunTech Vietnam",
      jobTitle: "Frontend Developer",
      linkUrl: "/ung-vien/ung-tuyen",
      linkText: "Xem trạng thái ứng tuyển →",
    },
    tip: "Trong lúc chờ phản hồi, bạn có thể luyện tập các câu hỏi phỏng vấn với Trợ lý AI Career.",
  },
  {
    id: "notif-7",
    category: "system",
    title: "Bài viết mới từ Cẩm nang nghề nghiệp",
    description: "“Top 7 kỹ năng mềm giúp bạn nổi bật trong mắt nhà tuyển dụng” đã được cập nhật. Đọc ngay!",
    fullContent: "Cẩm nang nghề nghiệp Careza vừa xuất bản chuyên đề kỹ năng mềm cho ứng viên ngành công nghệ và tài chính.",
    time: "15:03",
    groupDate: "yesterday",
    isRead: true,
    meta: {
      articleTitle: "Top 7 kỹ năng mềm giúp bạn nổi bật",
      linkUrl: "/cam-nang-nghe-nghiep",
      linkText: "Đọc bài viết ngay →",
    },
  },
  {
    id: "notif-8",
    category: "system",
    title: "Tài khoản của bạn được bảo mật an toàn",
    description: "Chúng tôi không phát hiện hoạt động đăng nhập bất thường trong 7 ngày qua.",
    fullContent: "Báo cáo bảo mật hàng tuần: Tài khoản Careza của bạn đang ở trạng thái an toàn cao, mật khẩu và xác thực 2 bước hoạt động bình thường.",
    time: "12:11",
    groupDate: "yesterday",
    isRead: true,
    meta: {
      linkUrl: "/ung-vien/cai-dat",
      linkText: "Quản lý cài đặt bảo mật →",
    },
  },
];

export default function CandidateNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [activeCategory, setActiveCategory] = useState<NotificationCategory>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedNotifId, setSelectedNotifId] = useState<string>("notif-1");
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  // Đếm số lượng theo category
  const categoryCounts = useMemo(() => {
    return {
      all: notifications.length,
      job: notifications.filter((n) => n.category === "job").length,
      interview: notifications.filter((n) => n.category === "interview").length,
      profile: notifications.filter((n) => n.category === "profile").length,
      company: notifications.filter((n) => n.category === "company").length,
      system: notifications.filter((n) => n.category === "system").length,
    };
  }, [notifications]);

  // Lọc thông báo theo category & search query
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      const matchCat = activeCategory === "all" || item.category === activeCategory;
      const matchSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.meta?.companyName && item.meta.companyName.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [notifications, activeCategory, searchQuery]);

  // Group notifications theo ngày
  const groupedNotifications = useMemo(() => {
    const today = filteredNotifications.filter((n) => n.groupDate === "today");
    const yesterday = filteredNotifications.filter((n) => n.groupDate === "yesterday");
    const earlier = filteredNotifications.filter((n) => n.groupDate === "earlier");
    return { today, yesterday, earlier };
  }, [filteredNotifications]);

  // Active notification detail object
  const activeNotification = useMemo(() => {
    return notifications.find((n) => n.id === selectedNotifId) || null;
  }, [notifications, selectedNotifId]);

  // Handlers
  const handleSelectNotif = (notif: NotificationItem) => {
    setSelectedNotifId(notif.id);
    if (!notif.isRead) {
      setNotifications((prev) =>
        prev.map((item) => (item.id === notif.id ? { ...item, isRead: true } : item))
      );
    }
    // Mở drawer trên màn hình nhỏ
    if (window.innerWidth < 1024) {
      setIsMobileDrawerOpen(true);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredNotifications.map((n) => n.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleMarkAsRead = () => {
    if (selectedIds.length === 0) return;
    setNotifications((prev) =>
      prev.map((item) => (selectedIds.includes(item.id) ? { ...item, isRead: true } : item))
    );
    message.success(`Đã đánh dấu đã đọc ${selectedIds.length} thông báo.`);
    setSelectedIds([]);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    setNotifications((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
    message.success(`Đã xóa ${selectedIds.length} thông báo.`);
    setSelectedIds([]);
  };

  // Helper render icon theo category
  const renderCategoryIcon = (category: NotificationItem["category"]) => {
    switch (category) {
      case "interview":
        return (
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/80 shadow-2xs">
            <Calendar className="w-5 h-5" />
          </div>
        );
      case "job":
        return (
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100/80 shadow-2xs">
            <Briefcase className="w-5 h-5" />
          </div>
        );
      case "company":
        return (
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100/80 shadow-2xs">
            <Building2 className="w-5 h-5" />
          </div>
        );
      case "profile":
        return (
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100/80 shadow-2xs">
            <FileText className="w-5 h-5" />
          </div>
        );
      case "system":
      default:
        return (
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/80 shadow-2xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
        );
    }
  };

  // Detail Content Render
  const renderDetailPanelContent = (notif: NotificationItem) => {
    return (
      <div className="space-y-4.5">
        {/* Top Header */}
        <div className="flex items-start gap-3.5 pb-4 border-b border-slate-100">
          {renderCategoryIcon(notif.category)}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug m-0">
              {notif.title}
            </h3>
            <span className="text-xs text-slate-400 font-medium block mt-1">
              {notif.groupDate === "today" ? "Hôm nay" : "Hôm qua"}, {notif.time}
            </span>
          </div>
        </div>

        {/* Body Description */}
        <p className="text-xs sm:text-[13.5px] text-slate-700 leading-relaxed font-normal m-0">
          {notif.fullContent || notif.description}
        </p>

        {/* Category Context Card */}
        {notif.meta && (
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2.5">
            {notif.meta.companyName && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Công ty</span>
                </span>
                <span className="font-bold text-slate-800">{notif.meta.companyName}</span>
              </div>
            )}

            {notif.meta.jobTitle && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>Vị trí</span>
                </span>
                <span className="font-bold text-slate-800">{notif.meta.jobTitle}</span>
              </div>
            )}

            {notif.meta.interviewTime && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Thời gian</span>
                </span>
                <span className="font-bold text-[#0062ff]">{notif.meta.interviewTime}</span>
              </div>
            )}

            {notif.meta.interviewType && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-slate-400" />
                  <span>Hình thức</span>
                </span>
                <span className="font-bold text-slate-800">{notif.meta.interviewType}</span>
              </div>
            )}

            {notif.meta.articleTitle && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  <span>Chuyên đề</span>
                </span>
                <span className="font-bold text-slate-800">{notif.meta.articleTitle}</span>
              </div>
            )}
          </div>
        )}

        {/* Context CTAs */}
        {notif.meta?.linkUrl && (
          <div className="space-y-2 pt-1">
            <Link href={notif.meta.linkUrl} className="block">
              <button
                type="button"
                className="w-full py-2.5 px-4 bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs sm:text-[13px] rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{notif.meta.linkText || "Xem chi tiết →"}</span>
              </button>
            </Link>

            {notif.category === "interview" && (
              <button
                type="button"
                onClick={() => message.success("Đã đồng bộ lịch phỏng vấn vào Google Calendar!")}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-[13px] rounded-xl border border-slate-200 shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Thêm vào lịch cá nhân</span>
              </button>
            )}
          </div>
        )}

        {/* Tip Box Pastel Yellow */}
        {notif.tip && (
          <div className="p-3.5 bg-[#fffdf5] rounded-xl border border-[#fde68a] space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Mẹo nhỏ</span>
            </div>
            <p className="text-[11.5px] sm:text-xs text-amber-900/90 leading-relaxed m-0 font-medium">
              {notif.tip}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-[1460px] mx-auto px-4 sm:px-6 md:px-8 xl:px-[38px] pb-12 pt-2 bg-[#F6F9FF] min-h-screen space-y-5">
      {/* ======================================================== */}
      {/* 1. HERO BANNER SỬ DỤNG /images/thongbao.png              */}
      {/* ======================================================== */}
      <div
        className="relative w-full rounded-[22px] overflow-hidden min-h-[165px] sm:min-h-[185px] border border-blue-200/70 shadow-sm p-5 sm:p-6 lg:p-7 flex flex-col justify-between"
        style={{
          backgroundImage: "url('/images/thongbao.png')",
          backgroundSize: "cover",
          backgroundPosition: "center right",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Lớp Overlay gradient bên trái để chữ luôn tương phản rõ nét */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a359c]/95 via-[#0d47a1]/75 to-transparent sm:w-[60%] pointer-events-none" />

        {/* Nội dung bên trái Hero */}
        <div className="relative z-10 max-w-2xl space-y-2 text-white">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs sm:text-[13px] text-blue-200 font-medium">
            <Link href="/" className="hover:text-white transition-colors">
              Trang chủ
            </Link>
            <span>›</span>
            <Link href="/ung-vien/dashboard" className="hover:text-white transition-colors">
              Hồ sơ của tôi
            </Link>
            <span>›</span>
            <span className="text-white font-semibold">Thông báo</span>
          </div>

          {/* Heading + Badge */}
          <div className="flex flex-wrap items-center gap-3 pt-0.5">
            <h1 className="text-2xl sm:text-3xl lg:text-[30px] font-black text-white tracking-tight m-0 leading-tight">
              Thông báo
            </h1>
            <span className="bg-white/20 backdrop-blur-xs text-white text-xs font-bold px-3.5 py-1 rounded-full border border-white/30">
              Cập nhật đúng lúc, nắm bắt cơ hội tốt hơn
            </span>
          </div>

          <p className="text-[13.5px] sm:text-[14.5px] text-blue-100 font-normal m-0 leading-relaxed max-w-xl">
            Cập nhật mọi hoạt động quan trọng, không bỏ lỡ cơ hội nào trong hành trình sự nghiệp của bạn.
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. TAB FILTER THEO CATEGORY                              */}
      {/* ======================================================== */}
      <div className="flex flex-wrap items-center gap-2 pt-0.5">
        {[
          { key: "all", label: `Tất cả (${categoryCounts.all})` },
          { key: "job", label: `Việc làm (${categoryCounts.job})` },
          { key: "interview", label: `Phỏng vấn (${categoryCounts.interview})` },
          { key: "profile", label: `Hồ sơ (${categoryCounts.profile})` },
          { key: "company", label: `Công ty (${categoryCounts.company})` },
          { key: "system", label: `Hệ thống (${categoryCounts.system})` },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveCategory(tab.key as any)}
            className={`px-4.5 py-2 rounded-xl text-xs sm:text-[13px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === tab.key
                ? "bg-[#0062ff] text-white shadow-xs"
                : "bg-white text-slate-700 hover:text-[#0062ff] hover:bg-blue-50/50 border border-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ======================================================== */}
      {/* 3. TOOLBAR HÀNH ĐỘNG & TÌM KIẾM                           */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-[#E6EDF7] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Bên trái: Chọn tất cả, Đánh dấu đã đọc, Xóa */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={selectedIds.length > 0 && selectedIds.length === filteredNotifications.length}
              onChange={handleSelectAll}
              className="w-4 h-4 rounded text-[#0062ff] focus:ring-0 cursor-pointer accent-[#0062ff]"
            />
            <span>Chọn tất cả</span>
          </label>

          <button
            type="button"
            disabled={selectedIds.length === 0}
            onClick={handleMarkAsRead}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              selectedIds.length > 0
                ? "bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                : "bg-slate-50 text-slate-400 cursor-not-allowed"
            }`}
          >
            Đánh dấu đã đọc
          </button>

          <button
            type="button"
            disabled={selectedIds.length === 0}
            onClick={handleDeleteSelected}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 ${
              selectedIds.length > 0
                ? "bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer"
                : "bg-slate-50 text-slate-400 cursor-not-allowed"
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa</span>
          </button>
        </div>

        {/* Bên phải: Tìm kiếm & Sắp xếp */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex items-center flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm thông báo..."
              className="w-full pl-8.5 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#0062ff]"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold shrink-0">
            <span className="text-slate-400 hidden md:inline">Sắp xếp:</span>
            <span className="text-[#0062ff] font-bold">Mới nhất</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. MAIN LAYOUT: NOTIFICATION FEED (70%) | DETAIL (30%)   */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ==================== CỘT TRÁI: DANH SÁCH THÔNG BÁO (8/12 cols ~ 68-70%) ==================== */}
        <div className="lg:col-span-8 space-y-4">
          {filteredNotifications.length > 0 ? (
            <>
              {/* Group: Hôm nay */}
              {groupedNotifications.today.length > 0 && (
                <div className="space-y-2.5">
                  <div className="text-xs font-black text-slate-500 tracking-wider uppercase pl-1">
                    Hôm nay
                  </div>
                  <div className="space-y-2">
                    {groupedNotifications.today.map((notif) => {
                      const isSelected = selectedNotifId === notif.id;
                      const isChecked = selectedIds.includes(notif.id);
                      return (
                        <div
                          key={notif.id}
                          onClick={() => handleSelectNotif(notif)}
                          className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                            isSelected
                              ? "bg-blue-50/70 border-blue-300 shadow-2xs"
                              : !notif.isRead
                              ? "bg-[#f8faff] hover:bg-blue-50/40 border-blue-100"
                              : "bg-white hover:bg-slate-50/80 border-[#E6EDF7]"
                          }`}
                        >
                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onClick={(e) => handleToggleSelect(notif.id, e)}
                            onChange={() => {}}
                            className="w-4 h-4 rounded text-[#0062ff] focus:ring-0 cursor-pointer accent-[#0062ff] shrink-0"
                          />

                          {/* Category Icon */}
                          {renderCategoryIcon(notif.category)}

                          {/* Nội dung thông báo */}
                          <div className="flex-1 min-w-0">
                            <h4
                              className={`text-xs sm:text-[13.5px] leading-snug m-0 truncate ${
                                !notif.isRead ? "font-bold text-slate-900" : "font-semibold text-slate-700"
                              }`}
                            >
                              {notif.title}
                            </h4>
                            <p className="text-[11.5px] sm:text-xs text-slate-500 m-0 truncate mt-0.5 font-normal">
                              {notif.description}
                            </p>
                          </div>

                          {/* Thời gian + Unread dot + Arrow */}
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs text-slate-400 font-medium">
                              {notif.time}
                            </span>
                            {!notif.isRead && (
                              <span className="w-2 h-2 rounded-full bg-[#0062ff]" />
                            )}
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#0062ff] transition-colors" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Group: Hôm qua */}
              {groupedNotifications.yesterday.length > 0 && (
                <div className="space-y-2.5 pt-2">
                  <div className="text-xs font-black text-slate-500 tracking-wider uppercase pl-1">
                    Hôm qua
                  </div>
                  <div className="space-y-2">
                    {groupedNotifications.yesterday.map((notif) => {
                      const isSelected = selectedNotifId === notif.id;
                      const isChecked = selectedIds.includes(notif.id);
                      return (
                        <div
                          key={notif.id}
                          onClick={() => handleSelectNotif(notif)}
                          className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                            isSelected
                              ? "bg-blue-50/70 border-blue-300 shadow-2xs"
                              : !notif.isRead
                              ? "bg-[#f8faff] hover:bg-blue-50/40 border-blue-100"
                              : "bg-white hover:bg-slate-50/80 border-[#E6EDF7]"
                          }`}
                        >
                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onClick={(e) => handleToggleSelect(notif.id, e)}
                            onChange={() => {}}
                            className="w-4 h-4 rounded text-[#0062ff] focus:ring-0 cursor-pointer accent-[#0062ff] shrink-0"
                          />

                          {/* Category Icon */}
                          {renderCategoryIcon(notif.category)}

                          {/* Nội dung thông báo */}
                          <div className="flex-1 min-w-0">
                            <h4
                              className={`text-xs sm:text-[13.5px] leading-snug m-0 truncate ${
                                !notif.isRead ? "font-bold text-slate-900" : "font-semibold text-slate-700"
                              }`}
                            >
                              {notif.title}
                            </h4>
                            <p className="text-[11.5px] sm:text-xs text-slate-500 m-0 truncate mt-0.5 font-normal">
                              {notif.description}
                            </p>
                          </div>

                          {/* Thời gian + Unread dot + Arrow */}
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs text-slate-400 font-medium">
                              {notif.time}
                            </span>
                            {!notif.isRead && (
                              <span className="w-2 h-2 rounded-full bg-[#0062ff]" />
                            )}
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#0062ff] transition-colors" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Phân trang bên dưới */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200/80 text-xs text-slate-500">
                <span>Hiển thị {filteredNotifications.length}/{notifications.length} thông báo</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-7 h-7 rounded-lg bg-[#0062ff] text-white flex items-center justify-center font-bold">
                    1
                  </span>
                  <span className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer">
                    2
                  </span>
                  <span className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer">
                    3
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-[#E6EDF7] space-y-2">
              <Bell className="w-10 h-10 mx-auto text-slate-300" />
              <h4 className="text-sm font-bold text-slate-800 m-0">Bạn chưa có thông báo nào</h4>
              <p className="text-xs text-slate-500 m-0">
                Các cập nhật về việc làm, hồ sơ và phỏng vấn sẽ xuất hiện tại đây.
              </p>
            </div>
          )}
        </div>

        {/* ==================== CỘT PHẢI: DETAIL PANEL (4/12 cols ~ 30-32%) ==================== */}
        <div className="hidden lg:block lg:col-span-4 sticky top-20 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-[#E6EDF7] shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 m-0">
                Chi tiết thông báo
              </h3>
              {activeNotification && (
                <button
                  type="button"
                  onClick={() => setSelectedNotifId("")}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {activeNotification ? (
              renderDetailPanelContent(activeNotification)
            ) : (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Bell className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-semibold text-slate-600 m-0">
                  Chọn một thông báo để xem chi tiết
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. BOTTOM CTA BANNER SỬ DỤNG /images/thongbao.png        */}
      {/* ======================================================== */}
      <div
        className="relative w-full rounded-[22px] overflow-hidden min-h-[115px] sm:min-h-[130px] p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-blue-400/30 shadow-sm text-white"
        style={{
          backgroundImage: "url('/images/thongbao.png')",
          backgroundSize: "cover",
          backgroundPosition: "center left",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#0047ba]/95 via-[#0052cc]/85 to-[#0062ff]/80 pointer-events-none" />

        <div className="relative z-10 space-y-1 text-center sm:text-left">
          <h3 className="text-base sm:text-lg lg:text-xl font-black text-white m-0 tracking-tight">
            Bật thông báo, nắm bắt cơ hội sớm hơn
          </h3>
          <p className="text-xs sm:text-[13px] text-blue-100 font-medium m-0">
            Đừng bỏ lỡ những thông tin quan trọng trong hành trình phát triển sự nghiệp.
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          <Link href="/ung-vien/cai-dat">
            <button
              type="button"
              className="bg-white hover:bg-blue-50 text-[#0062ff] font-extrabold text-xs sm:text-[13px] px-5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Quản lý cài đặt thông báo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 6. MOBILE DRAWER CHI TIẾT THÔNG BÁO                      */}
      {/* ======================================================== */}
      <Drawer
        title="Chi tiết thông báo"
        placement="bottom"
        onClose={() => setIsMobileDrawerOpen(false)}
        open={isMobileDrawerOpen}
        height="80%"
        className="rounded-t-3xl lg:hidden"
      >
        {activeNotification && renderDetailPanelContent(activeNotification)}
      </Drawer>
    </div>
  );
}
