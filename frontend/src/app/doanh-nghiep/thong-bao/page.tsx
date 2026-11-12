"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { interactionService } from "@/services/interaction.service";
import {
  Modal,
  Select,
  Input,
  Tag,
  Dropdown,
  Tooltip,
  App,
  Pagination,
  Switch,
  Drawer,
  Spin,
  Alert,
  Empty,
} from "antd";
import {
  Bell,
  CheckCheck,
  Filter,
  MoreVertical,
  Briefcase,
  Users,
  Calendar,
  FileText,
  CreditCard,
  MessageSquare,
  ShieldCheck,
  Trash2,
  Eye,
  Settings,
  Lightbulb,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Sliders,
  Mail,
  Smartphone,
  Globe,
  Star,
  Clock,
  Check,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

// =====================================================================
// NOTIFICATION TYPES & DATA STRUCTURE
// =====================================================================

export type NotificationCategory =
  | "job"
  | "candidate"
  | "interview"
  | "report"
  | "payment"
  | "message"
  | "system"
  | "other";

export interface NotificationItem {
  id: string;
  category: NotificationCategory;
  title: string;
  subtitle: string;
  time: string;
  dateGroup: string; // e.g., "Hôm nay", "Hôm qua", "25/05/2024"
  dateKey: string;
  isUnread: boolean;
  isImportant?: boolean;
  targetUrl?: string;
  avatars?: string[];
  singleAvatar?: string;
  badgeCount?: number;
  thumbnail?: string;
}

// =====================================================================
// INITIAL NOTIFICATION DATA
// =====================================================================const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

// =====================================================================
// MAIN COMPONENT
// =====================================================================

export default function EmployerNotificationsPage() {
  const { message } = App.useApp();
  const router = useRouter();

  // State
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"all" | "unread" | "important">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Settings Modal / Drawer
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    browser: true,
    push: true,
    frequency: "realtime",
  });

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await interactionService.getNotifications({ page: 1, page_size: 50 });
      const rawList = res?.notifications || [];
      const mapped: NotificationItem[] = rawList.map((n: any) => {
        const dt = n.created_at ? new Date(n.created_at) : new Date();
        const dateStr = dt.toLocaleDateString("vi-VN");
        const isToday = new Date().toLocaleDateString("vi-VN") === dateStr;
        const dateGroup = isToday ? "Hôm nay" : dateStr;

        let cat: NotificationCategory = "system";
        if (n.type?.includes("job")) cat = "job";
        else if (n.type?.includes("candidate") || n.type?.includes("apply") || n.type?.includes("application")) cat = "candidate";
        else if (n.type?.includes("interview")) cat = "interview";
        else if (n.type?.includes("payment") || n.type?.includes("order")) cat = "payment";
        else if (n.type?.includes("message") || n.type?.includes("chat")) cat = "message";

        return {
          id: String(n.id),
          category: cat,
          title: n.title,
          subtitle: n.message || "",
          time: dt.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
          dateGroup,
          dateKey: dt.toISOString().split("T")[0],
          isUnread: !n.is_read,
          isImportant: n.type?.includes("payment") || n.type?.includes("urgent"),
          targetUrl: n.metadata?.url || (cat === "candidate" ? "/doanh-nghiep/ung-vien" : cat === "interview" ? "/doanh-nghiep/lich-phong-van" : "/doanh-nghiep/dashboard"),
        };
      });
      setNotifications(mapped);
    } catch (err: any) {
      console.error("Lỗi nạp thông báo:", err);
      setError(err?.message || "Không thể tải danh sách thông báo từ máy chủ.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Calculate Counts
  const totalCount = notifications.length;
  const unreadCount = notifications.filter((n) => n.isUnread).length;
  const importantCount = notifications.filter((n) => n.isImportant).length;

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await interactionService.markAllNotificationsRead();
    } catch {
      // ignore
    }
    setNotifications(notifications.map((n) => ({ ...n, isUnread: false })));
    message.success("Đã đánh dấu tất cả thông báo là đã đọc!");
  };

  // Toggle single read status
  const handleToggleRead = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await interactionService.markNotificationRead(Number(id));
    } catch {
      // ignore
    }
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isUnread: !n.isUnread } : n))
    );
  };

  // Toggle important status
  const handleToggleImportant = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isImportant: !n.isImportant } : n))
    );
    message.success("Đã cập nhật trạng thái quan trọng");
  };

  // Handle click item navigation
  const handleClickNotification = async (item: NotificationItem) => {
    // Mark as read
    if (item.isUnread) {
      try {
        await interactionService.markNotificationRead(Number(item.id));
      } catch {
        // ignore
      }
      setNotifications(
        notifications.map((n) => (n.id === item.id ? { ...n, isUnread: false } : n))
      );
    }

    if (item.targetUrl) {
      router.push(item.targetUrl);
    }
  };

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      if (activeTab === "unread" && !item.isUnread) return false;
      if (activeTab === "important" && !item.isImportant) return false;
      if (selectedCategory !== "all" && item.category !== selectedCategory) return false;
      return true;
    });
  }, [notifications, activeTab, selectedCategory]);

  // Group by dateGroup
  const groupedNotifications = useMemo(() => {
    const groups: { [key: string]: NotificationItem[] } = {};
    filteredNotifications.forEach((item) => {
      if (!groups[item.dateGroup]) {
        groups[item.dateGroup] = [];
      }
      groups[item.dateGroup].push(item);
    });
    return groups;
  }, [filteredNotifications]);

  // Render Icon according to Category
  const renderCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case "candidate":
        return (
          <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 shadow-2xs">
            <Users className="w-4 h-4" />
          </div>
        );
      case "job":
        return (
          <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 shadow-2xs">
            <Briefcase className="w-4 h-4" />
          </div>
        );
      case "interview":
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
            <Calendar className="w-4 h-4" />
          </div>
        );
      case "report":
        return (
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
            <FileText className="w-4 h-4" />
          </div>
        );
      case "payment":
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
        );
      case "message":
        return (
          <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 shadow-2xs">
            <MessageSquare className="w-4 h-4" />
          </div>
        );
      case "system":
        return (
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
            <Users className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 shadow-2xs">
            <Bell className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="w-full font-sans bg-[#F7F9FC] -m-3 sm:-m-4 lg:-m-5 p-3 sm:p-4 lg:p-5 flex flex-col h-[calc(100vh-80px)] overflow-hidden space-y-3">
      {/* ======================================================== */}
      {/* 1. TOP FIXED HEADER                                      */}
      {/* ======================================================== */}
      <div className="shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-transparent">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 m-0 tracking-tight leading-tight">
              Thông báo
            </h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-black text-[11px] shadow-xs">
                {unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. MAIN 2 INDEPENDENT SCROLLING COLUMNS                  */}
      {/* ======================================================== */}
      <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-12 gap-3.5 items-stretch overflow-hidden">
        {/* ====================================================== */}
        {/* LEFT COLUMN: TABS & NOTIFICATIONS (SCROLLS INDEPENDENT)*/}
        {/* ====================================================== */}
        <main className="xl:col-span-8 2xl:col-span-9 h-full min-h-0 overflow-y-auto overscroll-contain pr-1 space-y-3.5">
          {/* Top Tab Bar + Actions */}
          <div className="flex items-center justify-between border-b border-slate-200 text-xs font-bold text-slate-500 overflow-x-auto pb-1">
            {/* Tabs */}
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`pb-2 transition-colors cursor-pointer shrink-0 relative flex items-center gap-1.5 ${
                  activeTab === "all" ? "text-[#0062ff] font-black" : "hover:text-slate-800"
                }`}
              >
                <span>Tất cả</span>
                <span className="px-1.5 py-0.2 rounded-full bg-blue-50 text-[#0062ff] text-[10px] font-bold">
                  {totalCount}
                </span>
                {activeTab === "all" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0062ff] rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("unread")}
                className={`pb-2 transition-colors cursor-pointer shrink-0 relative flex items-center gap-1.5 ${
                  activeTab === "unread" ? "text-[#0062ff] font-black" : "hover:text-slate-800"
                }`}
              >
                <span>Chưa đọc</span>
                <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                  {unreadCount}
                </span>
                {activeTab === "unread" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0062ff] rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("important")}
                className={`pb-2 transition-colors cursor-pointer shrink-0 relative flex items-center gap-1.5 ${
                  activeTab === "important" ? "text-[#0062ff] font-black" : "hover:text-slate-800"
                }`}
              >
                <span>Quan trọng</span>
                <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                  {importantCount}
                </span>
                {activeTab === "important" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0062ff] rounded-full" />
                )}
              </button>
            </div>

            {/* Right Action buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
                className={`text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                  unreadCount > 0 ? "text-[#0062ff] hover:underline" : "text-slate-300 cursor-not-allowed"
                }`}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Đánh dấu tất cả đã đọc</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (selectedCategory !== "all") {
                    setSelectedCategory("all");
                    message.success("Đã đặt lại bộ lọc");
                  } else {
                    message.info("Chọn phân loại ở cột bên phải để lọc nhanh!");
                  }
                }}
                className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-2xs flex items-center gap-1 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-slate-500" />
                <span>Bộ lọc</span>
              </button>
            </div>
          </div>

          {/* Notification List (Grouped by Date) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden divide-y divide-slate-100">
            {loading ? (
              <div className="p-12 text-center text-slate-400">
                <Spin tip="Đang tải danh sách thông báo..." />
              </div>
            ) : error ? (
              <div className="p-6">
                <Alert
                  type="error"
                  showIcon
                  message="Lỗi tải thông báo"
                  description={error}
                  action={
                    <button
                      type="button"
                      onClick={fetchNotifications}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      Tải lại
                    </button>
                  }
                />
              </div>
            ) : Object.keys(groupedNotifications).length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <Empty description="Không có thông báo nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              </div>
            ) : (
              Object.entries(groupedNotifications).map(([groupName, items]) => (
                <div key={groupName} className="space-y-0">
                  {/* Group Header */}
                  <div className="px-4 py-2 bg-slate-50/70 border-b border-slate-100 text-[11px] font-black text-slate-500">
                    {groupName}
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-slate-100/80">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleClickNotification(item)}
                        className={`p-3.5 sm:px-4 flex items-center justify-between gap-3 transition-colors cursor-pointer group ${
                          item.isUnread ? "bg-blue-50/20 hover:bg-blue-50/40" : "hover:bg-slate-50/70"
                        }`}
                      >
                        {/* Left Icon & Text Content */}
                        <div className="flex items-center gap-3 min-w-0">
                          {renderCategoryIcon(item.category)}

                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-2">
                              {/* Blue Unread Dot */}
                              {item.isUnread && (
                                <span className="w-2 h-2 rounded-full bg-[#0062ff] shrink-0" />
                              )}
                              <h4
                                className={`text-xs m-0 truncate ${
                                  item.isUnread ? "font-black text-slate-900" : "font-semibold text-slate-700"
                                }`}
                              >
                                {item.title}
                              </h4>
                            </div>

                            <p className="text-[11px] text-slate-500 font-medium m-0 truncate pl-4">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>

                        {/* Right Details: Avatars, Badges, Time, Action Menu */}
                        <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                          {/* Stacked Candidate Avatars */}
                          {item.avatars && item.avatars.length > 0 && (
                            <div className="flex items-center -space-x-2">
                              {item.avatars.map((av, idx) => (
                                <img
                                  key={idx}
                                  src={av}
                                  alt="Candidate"
                                  className="w-6 h-6 rounded-full border-2 border-white object-cover shadow-2xs"
                                />
                              ))}
                              <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white text-slate-700 font-bold text-[9px] flex items-center justify-center shadow-2xs">
                                +5
                              </div>
                            </div>
                          )}

                          {/* Single Avatar */}
                          {item.singleAvatar && (
                            <img
                              src={item.singleAvatar}
                              alt="Avatar"
                              className="w-6 h-6 rounded-full object-cover border border-slate-200"
                            />
                          )}

                          {/* Thumbnail */}
                          {item.thumbnail && (
                            <img
                              src={item.thumbnail}
                              alt="Report Thumbnail"
                              className="w-10 h-7 rounded-md object-cover border border-slate-200 shadow-2xs"
                            />
                          )}

                          {/* Important Badge */}
                          {item.isImportant && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-100">
                              Quan trọng
                            </span>
                          )}

                          {/* Message count badge */}
                          {item.badgeCount && (
                            <span className="w-4.5 h-4.5 rounded-full bg-rose-500 text-white font-black text-[10px] flex items-center justify-center shadow-xs">
                              {item.badgeCount}
                            </span>
                          )}

                          {/* Time */}
                          <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap">
                            {item.time}
                          </span>

                          {/* Action Dropdown Menu */}
                          <Dropdown
                            menu={{
                              items: [
                                {
                                  key: "read",
                                  label: item.isUnread ? "Đánh dấu đã đọc" : "Đánh dấu chưa đọc",
                                  icon: <Eye className="w-3.5 h-3.5" />,
                                  onClick: () => handleToggleRead(item.id),
                                },
                                {
                                  key: "important",
                                  label: item.isImportant ? "Bỏ đánh dấu quan trọng" : "Đánh dấu quan trọng",
                                  icon: <Star className="w-3.5 h-3.5" />,
                                  onClick: () => handleToggleImportant(item.id),
                                },
                                {
                                  key: "delete",
                                  label: "Xóa thông báo",
                                  danger: true,
                                  icon: <Trash2 className="w-3.5 h-3.5" />,
                                  onClick: () => {
                                    setNotifications(notifications.filter((n) => n.id !== item.id));
                                    message.success("Đã xóa thông báo");
                                  },
                                },
                              ],
                            }}
                            trigger={["click"]}
                          >
                            <button
                              type="button"
                              className="w-6 h-6 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                          </Dropdown>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}

            {/* Pagination Footer */}
            <div className="p-4 bg-white border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="text-slate-500 font-medium">
                Hiển thị 1 - {filteredNotifications.length} trong {notifications.length * 6} thông báo
              </span>

              <div className="flex items-center gap-2">
                <Pagination
                  current={currentPage}
                  onChange={(page) => setCurrentPage(page)}
                  total={54}
                  pageSize={pageSize}
                  showSizeChanger={false}
                  size="small"
                />

                <Select
                  value={pageSize}
                  onChange={(val) => setPageSize(val)}
                  size="small"
                  className="w-24 text-xs"
                  options={[
                    { value: 10, label: "10 / trang" },
                    { value: 20, label: "20 / trang" },
                  ]}
                />
              </div>
            </div>
          </div>
        </main>

        {/* ====================================================== */}
        {/* RIGHT COLUMN: SIDEBAR WIDGETS (SCROLLS INDEPENDENTLY)  */}
        {/* ====================================================== */}
        <aside className="xl:col-span-4 2xl:col-span-3 h-full min-h-0 overflow-y-auto overscroll-contain pr-0.5 space-y-3.5">
          {/* ---------------- 1. TỔNG QUAN THÔNG BÁO -------------- */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="font-extrabold text-xs text-slate-900">
                Tổng quan thông báo
              </span>
              <span className="text-slate-400 text-[11px] font-medium flex items-center gap-0.5 cursor-pointer">
                <span>7 ngày qua</span>
                <span>▼</span>
              </span>
            </div>

            {/* Donut Chart Visual */}
            <div className="flex items-center justify-center py-2">
              <div className="relative w-28 h-28 rounded-full border-[9px] border-blue-500 border-t-emerald-500 border-r-orange-400 border-b-purple-500 flex items-center justify-center shadow-xs">
                <div className="text-center">
                  <span className="text-base font-black text-slate-900 block leading-tight">54</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Tổng</span>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Tuyển dụng</span>
                </span>
                <span className="font-bold text-slate-900">28 (52%)</span>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Ứng viên</span>
                </span>
                <span className="font-bold text-slate-900">12 (22%)</span>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-orange-400" />
                  <span>Thanh toán</span>
                </span>
                <span className="font-bold text-slate-900">6 (11%)</span>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>Hệ thống</span>
                </span>
                <span className="font-bold text-slate-900">5 (9%)</span>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                  <span>Khác</span>
                </span>
                <span className="font-bold text-slate-900">3 (6%)</span>
              </div>
            </div>
          </div>

          {/* ---------------- 2. CÀI ĐẶT THÔNG BÁO ---------------- */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="font-extrabold text-xs text-slate-900">
                Cài đặt thông báo
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1.5 font-medium">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Email</span>
                </span>
                <span className="text-emerald-600 font-bold text-[11px] flex items-center gap-1 cursor-pointer">
                  <span>● Bật</span>
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1.5 font-medium">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span>Browser</span>
                </span>
                <span className="text-emerald-600 font-bold text-[11px] flex items-center gap-1 cursor-pointer">
                  <span>● Bật</span>
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1.5 font-medium">
                  <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Push notification</span>
                </span>
                <span className="text-emerald-600 font-bold text-[11px] flex items-center gap-1 cursor-pointer">
                  <span>● Bật</span>
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-700 pt-1 border-t border-slate-100">
                <span className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Tần suất nhận</span>
                </span>
                <span className="text-slate-600 font-bold text-[11px] flex items-center gap-0.5 cursor-pointer">
                  <span>Thời gian thực</span>
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="w-full text-center text-[#0062ff] hover:underline font-bold text-xs pt-1 cursor-pointer block"
            >
              Quản lý cài đặt →
            </button>
          </div>

          {/* ---------------- 3. PHÂN LOẠI THÔNG BÁO -------------- */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="font-extrabold text-xs text-slate-900">
                Phân loại thông báo
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div
                onClick={() => setSelectedCategory("job")}
                className={`p-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                  selectedCategory === "job" ? "bg-blue-50 text-[#0062ff] font-bold" : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                  <span>Tuyển dụng</span>
                </div>
                <span className="font-bold text-slate-900">28</span>
              </div>

              <div
                onClick={() => setSelectedCategory("candidate")}
                className={`p-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                  selectedCategory === "candidate" ? "bg-blue-50 text-[#0062ff] font-bold" : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Ứng viên</span>
                </div>
                <span className="font-bold text-slate-900">12</span>
              </div>

              <div
                onClick={() => setSelectedCategory("payment")}
                className={`p-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                  selectedCategory === "payment" ? "bg-blue-50 text-[#0062ff] font-bold" : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5 text-orange-600" />
                  <span>Thanh toán</span>
                </div>
                <span className="font-bold text-slate-900">6</span>
              </div>

              <div
                onClick={() => setSelectedCategory("system")}
                className={`p-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                  selectedCategory === "system" ? "bg-blue-50 text-[#0062ff] font-bold" : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                  <span>Hệ thống</span>
                </div>
                <span className="font-bold text-slate-900">5</span>
              </div>

              <div
                onClick={() => setSelectedCategory("other")}
                className={`p-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                  selectedCategory === "other" ? "bg-blue-50 text-[#0062ff] font-bold" : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Khác</span>
                </div>
                <span className="font-bold text-slate-900">3</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className="w-full text-center text-[#0062ff] hover:underline font-bold text-xs pt-1 cursor-pointer block"
            >
              Xem tất cả →
            </button>
          </div>

          {/* ---------------- 4. MẸO SỬ DỤNG ---------------------- */}
          <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/50 rounded-2xl p-4 sm:p-5 border border-blue-100 shadow-2xs space-y-2.5">
            <div className="flex items-center gap-1.5 text-slate-900 font-extrabold text-xs">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Mẹo sử dụng</span>
            </div>

            <p className="text-[11px] text-slate-600 font-medium leading-relaxed m-0">
              Bật thông báo để không bỏ lỡ ứng viên phù hợp và các hoạt động quan trọng trong quá trình tuyển dụng.
            </p>

            <button
              type="button"
              onClick={() => message.info("Mở cẩm nang sử dụng tính năng thông báo Careza")}
              className="text-[#0062ff] hover:underline font-bold text-xs flex items-center gap-0.5 cursor-pointer"
            >
              <span>Tìm hiểu thêm</span>
              <span>→</span>
            </button>
          </div>
        </aside>
      </div>

      {/* ======================================================== */}
      {/* 3. MODAL: QUẢN LÝ CÀI ĐẶT THÔNG BÁO                     */}
      {/* ======================================================== */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Settings className="w-5 h-5 text-[#0062ff]" />
            <span>Cài đặt nhận thông báo</span>
          </div>
        }
        open={isSettingsOpen}
        onCancel={() => setIsSettingsOpen(false)}
        footer={null}
        width={460}
        centered
      >
        <div className="space-y-4 pt-2 text-xs">
          <div className="space-y-3 divide-y divide-slate-100">
            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="font-bold text-slate-900 block">Thông báo qua Email</span>
                <span className="text-slate-400 text-[11px]">Gửi email khi có ứng viên mới hoặc lời mời phỏng vấn</span>
              </div>
              <Switch
                checked={notificationSettings.email}
                onChange={(c) => setNotificationSettings({ ...notificationSettings, email: c })}
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <span className="font-bold text-slate-900 block">Thông báo Trình duyệt (Browser)</span>
                <span className="text-slate-400 text-[11px]">Hiển thị popup thông báo trên góc màn hình</span>
              </div>
              <Switch
                checked={notificationSettings.browser}
                onChange={(c) => setNotificationSettings({ ...notificationSettings, browser: c })}
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <span className="font-bold text-slate-900 block">Thông báo đẩy di động (Push)</span>
                <span className="text-slate-400 text-[11px]">Nhận thông báo tức thời trên ứng dụng di động</span>
              </div>
              <Switch
                checked={notificationSettings.push}
                onChange={(c) => setNotificationSettings({ ...notificationSettings, push: c })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSettingsOpen(false);
                message.success("Đã lưu cài đặt thông báo thành công!");
              }}
              className="px-4 py-2 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold shadow-sm cursor-pointer"
            >
              Lưu cấu hình
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
