"use client";

import { useState, useMemo, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
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
import { interactionService } from "@/services/interaction.service";
import { useEffect } from "react";

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
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    interactionService.getNotifications().then((res) => {
      setUnreadCount(res.unread_count || 0);
    }).catch(() => {});
  }, []);


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
          key: "/doanh-nghiep/bai-test",
          label: "Bài kiểm tra năng lực",
          icon: CheckCircle2,
          href: "/doanh-nghiep/bai-test",
          active: pathname.startsWith("/doanh-nghiep/bai-test"),
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
          badgeCount: unreadCount,
        },

      ],
    },
  ];

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-[#FFFFFF] text-[#17233B] select-none overflow-y-auto scrollbar-none justify-between border-r border-[#D6E1F0]">
      <div>
        {/* Company Profile Card */}
        {!collapsed && (
          <div className="mx-3.5 my-3.5 p-3 rounded-xl bg-[#EBF2FF] border border-[#BFDBFE] space-y-2.5 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-lg bg-white border border-[#BFDBFE] flex items-center justify-center shrink-0 shadow-2xs">
                <span className="font-extrabold text-[#155EEF] text-base">
                  {companyName.charAt(0)}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-bold text-[#17233B] truncate block">
                    {companyName}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#155EEF] fill-[#155EEF] text-white shrink-0" />
                </div>
                <div className="mt-0.5">
                  <span className="px-2 py-0.5 rounded-md bg-[#D6E4FF] text-[#1E40AF] text-[10px] font-bold border border-[#BFDBFE] inline-block">
                    Enterprise
                  </span>
                </div>
              </div>
            </div>

            {/* Owner/HR Manager Role Row */}
            <div className="w-full py-1.5 px-3 rounded-lg bg-[#DCE7FC] border border-[#BFDBFE] flex items-center justify-center gap-1.5 text-[11.5px] text-[#1E40AF] font-bold shadow-2xs">
              <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
              <span>{getMenuRoleLabel(memberRole)}</span>
            </div>
          </div>
        )}

        {/* Navigation Sections */}
        <div className="px-3 py-1 space-y-0.5">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-0.5">
              {sIdx > 0 && <div className="h-px bg-[#E2E8F0] my-2.5 mx-1" />}
              {section.section && !collapsed && (
                <div className="px-3 pt-1 pb-1.5 text-[10.5px] font-bold uppercase tracking-wider text-[#475569]">
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
                      <div className="flex items-center justify-between px-3 h-[38px] rounded-lg text-[13px] font-medium text-slate-400 opacity-60 cursor-not-allowed hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon className="w-4 h-4 shrink-0 text-slate-400" />
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
                    className={`flex items-center justify-between px-3 h-[38px] rounded-lg text-[13px] transition-all group ${
                      item.active
                        ? "bg-[#EAF2FF] text-[#155EEF] font-bold border-l-3 border-[#155EEF] shadow-2xs"
                        : "text-[#17233B] font-medium hover:bg-[#F4F7FC] hover:text-[#155EEF]"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${item.active ? "text-[#155EEF]" : "text-[#155EEF]"}`}
                      />
                      {!collapsed && (
                        <span className={`truncate ${item.active ? "text-[#155EEF] font-bold" : "text-[#17233B] font-medium"}`}>
                          {item.label}
                        </span>
                      )}
                    </div>

                    {!collapsed && item.badgeCount && (
                      <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold text-[9px] min-w-[18px] text-center shadow-xs">
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
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F7FC]">
      {/* ======================================================== */}
      {/* TOP FULL-WIDTH HEADER - NỀN XANH CAREZA TƯƠI VỪA PHẢI #1254B8 */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-50 h-14 bg-[#1254B8] text-white flex items-center justify-between px-3 sm:px-5 shadow-xs shrink-0 select-none">
        {/* Left Side: Logo Careza (White) + Collapse Button + Divider + Greeting */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Logo Careza & Sidebar toggle button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-1 rounded-lg text-white hover:bg-white/10 border-none bg-transparent cursor-pointer"
            >
              <MenuOutlined className="text-base" />
            </button>

            <Link href="/doanh-nghiep/dashboard" className="flex items-center">
              <Image
                src="/images/logos/010cd82d-47e5-4e32-86e1-2df16032be39.png"
                alt="CAREZA"
                width={120}
                height={32}
                className="h-7 sm:h-8 w-auto object-contain brightness-0 invert"
                priority
              />
            </Link>

            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
              className="hidden md:flex p-1.5 rounded-lg text-white/90 hover:text-white hover:bg-white/15 items-center justify-center transition-colors cursor-pointer bg-transparent border-none shrink-0"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          <div className="h-4 w-px bg-white/25 hidden sm:block shrink-0" />

          {/* User Welcome Greeting */}
          <div className="hidden sm:block truncate text-xs sm:text-[13px] text-white/90">
            Xin chào, <span className="text-white font-bold">{companyName || userFullName}</span>! ✌️
          </div>
        </div>

        {/* Center: Search Bar (Semi-transparent on blue) */}
        <div className="hidden lg:flex items-center flex-1 max-w-sm mx-4 xl:mx-8">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-white/70 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm ứng viên, tin tuyển dụng, CV..."
              className="w-full pl-8 pr-11 py-1.5 bg-white/15 hover:bg-white/20 focus:bg-white/25 text-white placeholder-white/70 border border-white/20 rounded-lg text-xs font-normal focus:outline-hidden focus:border-white transition-all"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-white/15 border border-white/20 text-[10px] font-medium text-white/90">
              ⌘K
            </span>
          </div>
        </div>

        {/* Right Side: Quick Action Icons & Recruiter Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Gift Icon */}
          <Tooltip title="Ưu đãi doanh nghiệp">
            <button
              type="button"
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors border border-white/15 cursor-pointer"
            >
              <Gift className="w-4 h-4 text-amber-300" />
            </button>
          </Tooltip>

          {/* Notification Bell */}
          <Tooltip title="Thông báo">
            <Link href="/doanh-nghiep/thong-bao" className="relative inline-flex">
              <button
                type="button"
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors border border-white/15 cursor-pointer"
              >
                <Bell className="w-4 h-4" />
              </button>
              <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center leading-none shadow-xs pointer-events-none">
                12
              </span>
            </Link>
          </Tooltip>

          {/* Chat Icon */}
          <Tooltip title="Tin nhắn">
            <div className="relative inline-flex">
              <button
                type="button"
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors border border-white/15 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
              <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#38BDF8] text-white font-bold text-[9px] flex items-center justify-center leading-none shadow-xs pointer-events-none">
                5
              </span>
            </div>
          </Tooltip>

          {/* Help Icon */}
          <Tooltip title="Trợ giúp & Hướng dẫn">
            <button
              type="button"
              className="hidden sm:flex w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white items-center justify-center transition-colors border border-white/15 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </Tooltip>

          <div className="h-5 w-px bg-white/20 mx-1 hidden sm:block" />

          {/* User Profile */}
          <Dropdown menu={{ items: profileMenuItems }} placement="bottomRight" arrow>
            <div className="flex items-center gap-2 cursor-pointer py-1 px-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <div className="w-8 h-8 rounded-full bg-white text-[#1254B8] font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={userFullName}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  companyName ? companyName.charAt(0) : "N"
                )}
              </div>
              <div className="hidden md:block text-left leading-tight">
                <span className="text-xs font-bold text-white block truncate max-w-[140px]">
                  {companyName || userFullName}
                </span>
                <span className="text-[10px] text-white/80 font-normal block">
                  {getMenuRoleLabel(memberRole)}
                </span>
              </div>
            </div>
          </Dropdown>
        </div>
      </header>

      {/* ======================================================== */}
      {/* WORKSPACE: SIDEBAR + MAIN CONTENT */}
      {/* ======================================================== */}
      <div className="flex-1 flex min-h-[calc(100vh-56px)]">
        {/* Desktop Sticky Sidebar */}
        <aside
          className={`hidden md:block shrink-0 sticky top-14 h-[calc(100vh-56px)] z-30 transition-all duration-300 ${
            collapsed ? "w-[72px]" : "w-[255px]"
          }`}
        >
          {renderSidebarContent()}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 bg-[#F4F7FC] px-3 sm:px-5 lg:px-6 py-4 flex flex-col font-sans">
          {children}
        </main>
      </div>

      {/* Mobile Drawer */}
      <Drawer
        placement="left"
        onClose={() => setMobileOpen(false)}
        open={mobileOpen}
        styles={{ wrapper: { width: 255 }, body: { padding: 0 } }}
      >
        <div className="h-full" onClick={() => setMobileOpen(false)}>
          {renderSidebarContent()}
        </div>
      </Drawer>
    </div>
  );
}
