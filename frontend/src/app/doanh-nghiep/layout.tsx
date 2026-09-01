"use client";

import { useState, useMemo, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { authService } from "@/services/auth.service";
import {
  Layout,
  Avatar,
  Dropdown,
  Space,
  Select,
  message,
  Drawer,
  Badge,
  Input,
  Tooltip,
} from "antd";
import {
  CompassOutlined,
  LogoutOutlined,
  MenuOutlined,
  UserOutlined,
  SettingOutlined,
  BellOutlined,
} from "@ant-design/icons";
import {
  LayoutDashboard,
  FileText,
  Users,
  GitPullRequest,
  Sparkles,
  Calendar,
  Send,
  MessageSquare,
  Search,
  BarChart3,
  Building,
  ShieldCheck,
  CreditCard,
  Settings,
  History,
  Bell,
  Gift,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Crown,
  CheckCircle2,
  ArrowRight,
  Briefcase,
  Star,
  Bot,
} from "lucide-react";
import { CompanyMemberRole } from "@/enums/role.enum";

const { Header, Sider, Content } = Layout;

interface NavItem {
  key: string;
  label: string;
  icon: any;
  href: string;
  active?: boolean;
  disabled?: boolean;
  badge?: string;
  badgeType?: "purple" | "rose";
  badgeCount?: number;
}

interface NavSection {
  section: string | null;
  items: NavItem[];
}

export default function EmployerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, companyInfo, activeBranchId, setActiveBranchId, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const branchesList =
    companyInfo?.assignedBranches && companyInfo.assignedBranches.length > 0
      ? [{ branchId: "all", branchName: "Tất cả chi nhánh" }, ...companyInfo.assignedBranches]
      : [
          { branchId: "all", branchName: "Tất cả chi nhánh" },
          { branchId: "br-1", branchName: "Chi nhánh Hồ Chí Minh" },
          { branchId: "br-2", branchName: "Chi nhánh Hà Nội" },
        ];

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

  const handleBranchChange = (value: string) => {
    setActiveBranchId(value === "all" ? null : value);
    const selected = branchesList.find((b) => b.branchId === value);
    if (selected) {
      message.success(`Đã chuyển sang: ${selected.branchName}`);
    }
  };

  const memberRole = companyInfo?.memberRole || CompanyMemberRole.OWNER;

  const getMenuRoleLabel = (role: CompanyMemberRole) => {
    if (role === CompanyMemberRole.OWNER) return "Owner";
    if (role === CompanyMemberRole.HR_MANAGER) return "HR Manager";
    if (role === CompanyMemberRole.RECRUITER) return "Recruiter";
    return "Interviewer";
  };

  // Company Name and Plan from auth state or sensible fallback
  const companyName = companyInfo?.companyName || "Google Vietnam";
  const userFullName = user?.fullName || "Mai Phương";
  const userAvatar = user?.avatarUrl;

  const profileMenuItems = [
    {
      key: "company-settings",
      icon: <SettingOutlined />,
      label: <Link href="/doanh-nghiep/thiet-lap">Cài đặt công ty</Link>,
    },
    {
      key: "public-home",
      icon: <CompassOutlined />,
      label: <Link href="/">Về Trang chủ ứng viên</Link>,
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      danger: true,
      onClick: handleLogout,
    },
  ];

  // Nav item list matching reference
  const navSections: NavSection[] = [
    {
      section: null,
      items: [
        {
          key: "/doanh-nghiep/dashboard",
          label: "Tổng quan",
          icon: LayoutDashboard,
          href: "/doanh-nghiep/dashboard",
          active: pathname === "/doanh-nghiep/dashboard" || pathname === "/doanh-nghiep",
        },
        {
          key: "/doanh-nghiep/tin-tuyen-dung",
          label: "Quản lý tin tuyển dụng",
          icon: FileText,
          href: "/doanh-nghiep/tin-tuyen-dung",
          active: pathname.startsWith("/doanh-nghiep/tin-tuyen-dung"),
        },
        {
          key: "/doanh-nghiep/ung-vien",
          label: "Ứng viên",
          icon: Users,
          href: "/doanh-nghiep/ung-vien",
          active: pathname === "/doanh-nghiep/ung-vien",
        },
        {
          key: "/doanh-nghiep/pipeline",
          label: "Pipeline tuyển dụng",
          icon: GitPullRequest,
          href: "/doanh-nghiep/pipeline",
          active: pathname === "/doanh-nghiep/pipeline",
        },
        {
          key: "/doanh-nghiep/talent-pool",
          label: "Talent Pool",
          icon: Sparkles,
          href: "/doanh-nghiep/talent-pool",
          active: pathname === "/doanh-nghiep/talent-pool",
        },
        {
          key: "/doanh-nghiep/lich-phong-van",
          label: "Lịch phỏng vấn",
          icon: Calendar,
          href: "/doanh-nghiep/lich-phong-van",
          active: pathname === "/doanh-nghiep/lich-phong-van",
        },
        {
          key: "/doanh-nghiep/offer-onboarding",
          label: "Offer & Onboarding",
          icon: Send,
          href: "/doanh-nghiep/offer-onboarding",
          active: pathname === "/doanh-nghiep/offer-onboarding" || pathname === "/doanh-nghiep/offer",
        },
        {
          key: "/doanh-nghiep/chat",
          label: "Chat với ứng viên",
          icon: MessageSquare,
          href: "/doanh-nghiep/chat",
          active: pathname === "/doanh-nghiep/chat" || pathname === "/doanh-nghiep/tin-nhan",
        },
        {
          key: "/doanh-nghiep/tim-kiem-ho-so",
          label: "Tìm kiếm hồ sơ",
          icon: Search,
          href: "/doanh-nghiep/tim-kiem-ho-so",
          active: pathname === "/doanh-nghiep/tim-kiem-ho-so" || pathname === "/doanh-nghiep/ho-so",
        },
        {
          key: "/doanh-nghiep/bao-cao-tuyen-dung",
          label: "Báo cáo tuyển dụng",
          icon: BarChart3,
          href: "/doanh-nghiep/bao-cao-tuyen-dung",
          active: pathname === "/doanh-nghiep/bao-cao-tuyen-dung" || pathname === "/doanh-nghiep/bao-cao",
        },
      ],
    },
    {
      section: "QUẢN LÝ CÔNG TY",
      items: [
        {
          key: "/doanh-nghiep/trang-cong-ty",
          label: "Trang công ty",
          icon: Building,
          href: "/doanh-nghiep/trang-cong-ty",
          active: pathname === "/doanh-nghiep/trang-cong-ty",
        },
        {
          key: "/doanh-nghiep/thanh-vien",
          label: "Thành viên & Phân quyền",
          icon: ShieldCheck,
          href: "/doanh-nghiep/thanh-vien",
          active: pathname.startsWith("/doanh-nghiep/thanh-vien"),
        },
        {
          key: "/doanh-nghiep/goi-dich-vu",
          label: "Gói dịch vụ & Thanh toán",
          icon: CreditCard,
          href: "/doanh-nghiep/goi-dich-vu",
          active: pathname.startsWith("/doanh-nghiep/goi-dich-vu"),
        },
        {
          key: "/doanh-nghiep/cai-dat-cong-ty",
          label: "Cài đặt công ty",
          icon: Settings,
          href: "/doanh-nghiep/cai-dat-cong-ty",
          active: pathname.startsWith("/doanh-nghiep/cai-dat-cong-ty") || pathname.startsWith("/doanh-nghiep/thiet-lap"),
        },
        {
          key: "/doanh-nghiep/nhat-ky",
          label: "Nhật ký hoạt động",
          icon: History,
          href: "/doanh-nghiep/nhat-ky-hoat-dong",
          active: pathname.startsWith("/doanh-nghiep/nhat-ky"),
        },
        {
          key: "/doanh-nghiep/thong-bao",
          label: "Thông báo",
          icon: Bell,
          href: "/doanh-nghiep/thong-bao",
          active: pathname.startsWith("/doanh-nghiep/thong-bao"),
          badgeCount: 12,
        },
      ],
    },
  ];

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-[#081a4a] text-white select-none overflow-y-auto scrollbar-none justify-between">
      <div>
        {/* Top: Logo Careza Nhà tuyển dụng + Collapse Button */}
        <div className="p-3.5 flex items-center justify-between">
          <Link href="/doanh-nghiep/dashboard" className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0062ff] to-[#3b82f6] flex items-center justify-center text-white shadow-md shrink-0">
              <Star className="w-5 h-5 fill-white text-white" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <span className="text-base font-black tracking-tight text-white block leading-none truncate">
                  Careza
                </span>
                <span className="text-[10px] font-bold text-blue-200 block mt-0.5 tracking-wider truncate">
                  Nhà tuyển dụng
                </span>
              </div>
            )}
          </Link>

          {/* Collapse Button next to Careza */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer border-none bg-transparent shrink-0"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 text-white" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-white" />
            )}
          </button>
        </div>

        {/* Company Profile Card */}
        {!collapsed && (
          <div className="p-3 mx-3 mb-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs space-y-2.5 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-xs border border-white/30">
                <div className="w-full h-full rounded-lg bg-blue-50 flex items-center justify-center font-black text-[#0062ff] text-sm">
                  {companyName.charAt(0)}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-black text-white truncate block">
                    {companyName}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 fill-blue-400/20" />
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="px-2 py-0.5 rounded-md bg-purple-900/60 text-purple-200 text-[10px] font-bold border border-purple-500/30">
                    Enterprise
                  </span>
                </div>
              </div>
            </div>

            {/* Owner Role Card */}
            <div className="py-1.5 px-3 rounded-xl bg-[#0c1f54] border border-blue-800/40 flex items-center justify-center gap-1.5 text-xs text-amber-300 font-bold">
              <Crown className="w-3.5 h-3.5 fill-amber-300/20 text-amber-300" />
              <span>{getMenuRoleLabel(memberRole)}</span>
            </div>
          </div>
        )}

        {/* Navigation Sections */}
        <div className="px-2 py-1 space-y-2">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-0.5">
              {section.section && !collapsed && (
                <div className="px-3 pt-3 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {section.section}
                </div>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                if (item.disabled) {
                  return (
                    <Tooltip
                      key={item.key}
                      title={`${item.label} (Đang phát triển)`}
                      placement="right"
                    >
                      <div className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-white/75 cursor-not-allowed hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className="w-4 h-4 shrink-0 text-white/75" />
                          {!collapsed && <span className="truncate">{item.label}</span>}
                        </div>
                      </div>
                    </Tooltip>
                  );
                }

                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all group ${
                      item.active
                        ? "bg-[#0062ff] text-white shadow-md font-extrabold"
                        : "text-white hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          item.active
                            ? "text-white"
                            : "text-white group-hover:text-white group-hover:scale-110"
                        }`}
                      />
                      {!collapsed && <span className="truncate text-white">{item.label}</span>}
                    </div>

                    {!collapsed && item.badgeCount && (
                      <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-black text-[9.5px] min-w-[18px] text-center shadow-xs">
                        {item.badgeCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section: Upsell Card */}
      {!collapsed && (
        <div className="p-3">
          <div className="p-4 rounded-2xl bg-gradient-to-b from-[#2e1065] to-[#1e1b4b] border border-purple-500/30 text-white space-y-2 shadow-lg">
            <span className="text-xs font-black block leading-tight text-white">
              Bạn cần đăng tuyển thêm?
            </span>
            <p className="text-[10.5px] text-purple-200/80 leading-snug m-0">
              Nâng cấp gói để đăng nhiều tin hơn và tiếp cận nhiều ứng viên chất lượng hơn.
            </p>
            <Link href="/doanh-nghiep/goi-dich-vu" className="block pt-1">
              <button
                type="button"
                className="w-full py-2 px-3 rounded-xl text-xs font-black text-white bg-gradient-to-r from-[#7c3aed] to-[#9333ea] hover:opacity-95 shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer border-none"
              >
                <span>Nâng cấp ngay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#F5F8FF]">
      {/* Desktop Sticky Sidebar */}
      <aside
        className={`hidden md:block shrink-0 sticky top-0 h-screen z-30 transition-all duration-300 ${
          collapsed ? "w-[70px]" : "w-[230px]"
        }`}
      >
        {renderSidebarContent()}
      </aside>

      {/* Main Layout Column (Header + Content) */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Recruiter Top Header */}
        <header className="sticky top-0 z-20 h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-xs shrink-0">
          {/* Left: Hamburger & Greetings */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 border-none bg-transparent cursor-pointer"
            >
              <MenuOutlined className="text-lg" />
            </button>

            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-600 leading-tight">
                Xin chào, <span className="text-slate-900 font-extrabold">{userFullName}</span>! 👋
              </div>
            </div>
          </div>

          {/* Center: Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm ứng viên, tin tuyển dụng, CV..."
                className="w-full pl-9 pr-12 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#0062ff] transition-all"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-slate-200/80 text-[10px] font-bold text-slate-600">
                ⌘ K
              </span>
            </div>
          </div>

          {/* Right: Actions & User Info */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Gift icon */}
            <Tooltip title="Ưu đãi doanh nghiệp">
              <button
                type="button"
                className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-[#0062ff] flex items-center justify-center transition-colors border border-slate-200/80 cursor-pointer"
              >
                <Gift className="w-4 h-4 text-amber-500" />
              </button>
            </Tooltip>

            {/* Notification Bell */}
            <Tooltip title="Thông báo">
              <Link href="/doanh-nghiep/thong-bao" className="relative inline-flex">
                <button
                  type="button"
                  className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-[#0062ff] flex items-center justify-center transition-colors border border-slate-200/80 cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                </button>
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white font-black text-[9px] flex items-center justify-center leading-none shadow-xs pointer-events-none">
                  12
                </span>
              </Link>
            </Tooltip>

            {/* Chat button */}
            <Tooltip title="Tin nhắn">
              <div className="relative inline-flex">
                <button
                  type="button"
                  className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-[#0062ff] flex items-center justify-center transition-colors border border-slate-200/80 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white font-black text-[9px] flex items-center justify-center leading-none shadow-xs pointer-events-none">
                  5
                </span>
              </div>
            </Tooltip>

            {/* Help button */}
            <Tooltip title="Trợ giúp & Hướng dẫn">
              <button
                type="button"
                className="hidden sm:flex w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-[#0062ff] items-center justify-center transition-colors border border-slate-200/80 cursor-pointer"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </Tooltip>

            <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

            {/* User Profile */}
            <Dropdown menu={{ items: profileMenuItems }} placement="bottomRight" arrow>
              <div className="flex items-center gap-2.5 cursor-pointer p-1 sm:px-2 py-1 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt={userFullName}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    userFullName.charAt(0)
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <span className="text-xs font-black text-slate-900 block leading-tight">
                    {userFullName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold block">
                    {getMenuRoleLabel(memberRole)}
                  </span>
                </div>
              </div>
            </Dropdown>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="px-3 sm:px-4 lg:px-5 py-4 bg-[#F5F8FF] flex-1 flex flex-col font-sans">
          {children}
        </main>
      </div>

      {/* Mobile Drawer */}
      <Drawer
        placement="left"
        onClose={() => setMobileOpen(false)}
        open={mobileOpen}
        styles={{ wrapper: { width: 240 }, body: { padding: 0 } }}
      >
        <div className="h-full" onClick={() => setMobileOpen(false)}>
          {renderSidebarContent()}
        </div>
      </Drawer>
    </div>
  );
}
