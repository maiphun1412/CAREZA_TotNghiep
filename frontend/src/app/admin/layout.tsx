"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { authService } from "@/services/auth.service";
import { Dropdown, Badge, message, Modal, Input } from "antd";
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  ShieldAlert,
  MessageSquareWarning,
  Sparkles,
  ShieldCheck,
  CreditCard,
  FileClock,
  KeyRound,
  Settings,
  Search,
  Bell,
  LogOut,
  User,
  Compass,
  Crown,
  Menu,
  X,
  ChevronDown,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");

  const handleLogout = async () => {
    try {
      await authService.logout();
      logout();
      message.success("Đăng xuất thành công");
      router.push("/dang-nhap");
    } catch {
      logout();
      router.push("/dang-nhap");
    }
  };

  const navMenuItems = [
    {
      key: "/admin/dashboard",
      title: "Tổng quan",
      icon: LayoutDashboard,
      href: "/admin/dashboard",
    },
    {
      key: "/admin/users",
      title: "Quản lý người dùng",
      icon: Users,
      href: "/admin/users",
    },
    {
      key: "/admin/companies",
      title: "Quản lý doanh nghiệp",
      icon: Building2,
      href: "/admin/companies",
    },
    {
      key: "/admin/jobs",
      title: "Tin tuyển dụng",
      icon: FileText,
      href: "/admin/jobs",
    },
    {
      key: "/admin/reports",
      title: "Kiểm duyệt & Báo cáo",
      icon: ShieldAlert,
      href: "/admin/reports",
    },
    {
      key: "/admin/khieu-nai",
      title: "Khiếu nại",
      icon: MessageSquareWarning,
      href: "/admin/khieu-nai",
    },
    {
      key: "/admin/danh-muc",
      title: "Danh mục",
      icon: Sparkles,
      href: "/admin/danh-muc",
    },
    {
      key: "/admin/goi-dich-vu",
      title: "Gói dịch vụ",
      icon: ShieldCheck,
      href: "/admin/goi-dich-vu",
    },
    {
      key: "/admin/giao-dich",
      title: "Giao dịch & Thanh toán",
      icon: CreditCard,
      href: "/admin/giao-dich",
    },
    {
      key: "/admin/ai",
      title: "AI & Dữ liệu",
      icon: Sparkles,
      href: "/admin/danh-muc",
    },
    {
      key: "/admin/knowledge",
      title: "Knowledge Base (RAG)",
      icon: BookOpen,
      href: "/admin/knowledge",
    },
    {
      key: "/admin/audit-log",
      title: "Nhật ký hệ thống",
      icon: FileClock,
      href: "/admin/audit-log",
    },
    {
      key: "/admin/quota",
      title: "Phân quyền",
      icon: KeyRound,
      href: "/admin/quota",
    },
    {
      key: "/admin/cai-dat",
      title: "Cài đặt hệ thống",
      icon: Settings,
      href: "/admin/cai-dat",
    },
  ];

  const profileMenuItems = [
    {
      key: "profile",
      icon: <User className="w-4 h-4 text-slate-500" />,
      label: <span className="text-xs font-semibold">Tài khoản quản trị</span>,
    },
    {
      key: "home",
      icon: <Compass className="w-4 h-4 text-[#0062ff]" />,
      label: <Link href="/" className="text-xs font-semibold">Về trang chủ Careza</Link>,
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      icon: <LogOut className="w-4 h-4 text-rose-500" />,
      label: <span className="text-xs font-semibold text-rose-600">Đăng xuất</span>,
      onClick: handleLogout,
    },
  ];

  const notificationItems = [
    {
      key: "notif-1",
      label: (
        <div className="p-2 max-w-[280px] space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <span>Xác minh doanh nghiệp mới</span>
          </div>
          <p className="text-[11px] text-slate-500 m-0 leading-relaxed">
            Công ty TNHH TechViet vừa gửi hồ sơ xác minh MST 0101234567.
          </p>
          <span className="text-[10px] text-slate-400 block">15 phút trước</span>
        </div>
      ),
    },
    {
      key: "notif-2",
      label: (
        <div className="p-2 max-w-[280px] space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
            <span>Báo cáo tin tuyển dụng</span>
          </div>
          <p className="text-[11px] text-slate-500 m-0 leading-relaxed">
            Nhân viên Marketing - Công ty ABC có 2 báo cáo sai thông tin lương.
          </p>
          <span className="text-[10px] text-slate-400 block">45 phút trước</span>
        </div>
      ),
    },
    {
      key: "notif-3",
      label: (
        <div className="p-2 max-w-[280px] space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>Thanh toán thành công</span>
          </div>
          <p className="text-[11px] text-slate-500 m-0 leading-relaxed">
            Công ty GreenTech hoàn tất mua gói Premium 2.990.000đ.
          </p>
          <span className="text-[10px] text-slate-400 block">1 giờ trước</span>
        </div>
      ),
    },
  ];

  const currentActive =
    navMenuItems.find(
      (item) => pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href))
    )?.key || "/admin/dashboard";

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* ========================================================= */}
      {/* 1. SIDEBAR CỐ ĐỊNH BÊN TRÁI (WIDTH: 240px) */}
      {/* ========================================================= */}
      <aside className="hidden lg:flex w-[240px] flex-col justify-between fixed top-0 bottom-0 left-0 bg-white border-r border-slate-200/80 z-40 select-none shadow-[2px_0_8px_-4px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo Header */}
          <div className="h-[72px] px-5 flex items-center border-b border-slate-100 shrink-0">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0062ff] to-[#0047ba] flex items-center justify-center text-white font-black text-lg shadow-sm shadow-blue-500/20">
                C
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-[#0062ff] leading-none">
                  CAREZA
                </span>
                <span className="text-[10px] text-slate-400 font-semibold tracking-tight mt-0.5">
                  Kết nối tốt hơn mỗi ngày
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Menu */}
          <nav className="p-3 space-y-1 flex-1">
            {navMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentActive === item.key;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-[#eef4ff] text-[#0062ff] font-bold shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? "text-[#0062ff]" : "text-slate-400 group-hover:text-slate-600"
                    }`}
                  />
                  <span className="truncate">{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Admin Version Box */}
        <div className="p-3 border-t border-slate-100 bg-white">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-[#f0f6ff] to-[#f8faff] border border-blue-100/80 text-center space-y-1">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-[#0062ff] flex items-center justify-center mx-auto mb-1">
              <Crown className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-black text-slate-900 block leading-tight">
              Careza Admin
            </span>
            <p className="text-[10px] text-slate-500 font-medium m-0 leading-tight">
              Vận hành minh bạch
            </p>
            <p className="text-[10px] text-slate-400 font-medium m-0 leading-tight">
              Kiến tạo giá trị bền vững.
            </p>
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. MAIN CONTENT AREA (OFFSET: 240px) */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col lg:pl-[240px] min-w-0 min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 md:px-8 flex items-center justify-between shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
          {/* Left: Mobile Toggle & Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium truncate">
              <span className="text-slate-400 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-slate-400" />
                <span>Quản trị hệ thống</span>
              </span>
              <span className="text-slate-300">&gt;</span>
              <span className="text-slate-900 font-bold">
                {navMenuItems.find((i) => i.key === currentActive)?.title || "Tổng quan"}
              </span>
            </div>
          </div>

          {/* Right: Search, Notification & Profile */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Global Search input */}
            <div className="relative hidden md:block w-72 lg:w-80">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Tìm kiếm người dùng, doanh nghiệp, tin tuyển dụng..."
                className="w-full bg-[#f8fafc] border border-slate-200/90 rounded-full pl-8 pr-8 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:bg-white focus:border-[#0062ff] focus:outline-hidden transition-all font-medium"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-white border border-slate-200 text-slate-400 text-[10px] font-semibold px-1.5 py-0.2 rounded shadow-2xs">
                /
              </span>
            </div>

            {/* Notification Dropdown with Badge */}
            <Dropdown
              menu={{ items: notificationItems }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <button
                type="button"
                className="relative w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/90 flex items-center justify-center cursor-pointer transition-colors"
                title="Thông báo quản trị"
              >
                <Bell className="w-4 h-4 text-slate-600" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-black text-[9.5px] flex items-center justify-center shadow-xs">
                  5
                </span>
              </button>
            </Dropdown>

            {/* Profile Menu Dropdown */}
            <Dropdown
              menu={{ items: profileMenuItems }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <div className="flex items-center gap-2.5 pl-2 cursor-pointer select-none">
                <div className="w-9 h-9 rounded-full bg-[#0F52BA] text-white font-black text-sm flex items-center justify-center shadow-xs ring-2 ring-blue-100">
                  A
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-900 leading-tight">
                    {user?.fullName || "Admin"}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    Quản trị viên
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </div>
            </Dropdown>
          </div>
        </header>

        {/* Mobile Slide-out Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex">
            <div className="w-64 bg-white h-full flex flex-col justify-between p-4 shadow-xl">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="font-black text-[#0062ff] text-base">CAREZA Admin</span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <nav className="mt-3 space-y-1">
                  {navMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentActive === item.key;
                    return (
                      <Link
                        key={item.key}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold ${
                          isActive
                            ? "bg-[#eef4ff] text-[#0062ff] font-bold"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border-none bg-transparent cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 md:p-7 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
