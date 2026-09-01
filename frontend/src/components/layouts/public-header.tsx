"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { authService } from "@/services/auth.service";
import { candidateService } from "@/services/candidate.service";
import {
  Button,
  Avatar,
  Dropdown,
  Drawer,
  App,
  Tag,
  Badge,
  Tooltip,
  Empty,
  Spin,
  Popconfirm,
  Collapse,
} from "antd";
import type { MenuProps } from "antd";
import {
  MenuOutlined,
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  CompassOutlined,
  HeartFilled,
  HeartOutlined,
  DeleteOutlined,
  ArrowRightOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  DownOutlined,
  SearchOutlined,
  FireOutlined,
  ClockCircleOutlined,
  AppstoreOutlined,
  RiseOutlined,
  BankOutlined,
  StarOutlined,
  CommentOutlined,
  SmileOutlined,
  FileTextOutlined,
  LayoutOutlined,
  FolderOpenOutlined,
  IdcardOutlined,
  BookOutlined,
  LineChartOutlined,
  ThunderboltOutlined,
  RocketOutlined,
  ReadOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  UploadOutlined,
  CalculatorOutlined,
  SafetyCertificateOutlined,
  RobotOutlined,
  ExperimentOutlined,
  ToolOutlined,
  HomeOutlined,
  SendOutlined,
  CalendarOutlined,
  BellOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { RoleCode } from "@/enums/role.enum";

function PublicHeaderMain() {
  const { message } = App.useApp();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Active key for Company Dropdown menu
  const companyTab = searchParams?.get("tab") || searchParams?.get("filter");
  const selectedCompanyKeys = useMemo(() => {
    if (pathname !== "/cong-ty") return [];
    if (companyTab === "featured") return ["company-featured"];
    if (companyTab === "reviews" || companyTab === "review") return ["company-reviews"];
    if (companyTab === "verified") return ["company-verified"];
    if (companyTab === "following" || companyTab === "favorite") return ["company-following"];
    return ["company-explore"];
  }, [pathname, companyTab]);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [favoriteJobs, setFavoriteJobs] = useState<any[]>([]);
  const [favoriteCount, setFavoriteCount] = useState<number>(0);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadFavoriteJobs = async () => {
    if (!isAuthenticated) return;
    setLoadingFavorites(true);
    try {
      const res = await candidateService.getBookmarkedJobs({ page: 1, pageSize: 15 });
      if (res?.data?.items) {
        setFavoriteJobs(res.data.items);
        setFavoriteCount(res.data.pagination?.total || res.data.items.length);
      }
    } catch (error) {
      console.error("Lỗi tải danh sách yêu thích:", error);
    } finally {
      setLoadingFavorites(false);
    }
  };

  const loadFavoriteIdsOnly = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await candidateService.getBookmarkedJobIds();
      if (res?.data?.ids) {
        setFavoriteCount(res.data.ids.length);
      }
    } catch (error) {
      // Bỏ qua lỗi ngầm
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadFavoriteIdsOnly();
    } else {
      setFavoriteCount(0);
      setFavoriteJobs([]);
    }
  }, [isAuthenticated, pathname]);

  const handleRemoveFavorite = async (jobId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setDeletingId(jobId);
    try {
      await candidateService.removeJobBookmark(jobId);
      message.success("Đã bỏ lưu việc làm");
      setFavoriteJobs((prev) => prev.filter((item) => item.job.id !== jobId));
      setFavoriteCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      message.error("Không thể bỏ lưu việc làm");
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      logout();
      document.cookie = "careza_logged_in=; path=/; max-age=0";
      message.success("Đăng xuất thành công");
      router.push("/");
    } catch (error) {
      logout();
      document.cookie = "careza_logged_in=; path=/; max-age=0";
      router.push("/");
    }
  };

  const getDashboardLink = () => {
    if (!user) return "/";
    if (user.roles.includes(RoleCode.ADMIN) || user.roles.includes(RoleCode.SUPER_ADMIN)) {
      return "/admin/dashboard";
    }
    if (user.roles.includes(RoleCode.COMPANY_OWNER) || user.roles.includes(RoleCode.RECRUITER)) {
      return "/doanh-nghiep/dashboard";
    }
    return "/ung-vien/dashboard";
  };

  const formatSalary = (job: any) => {
    if (job.negotiableSalary) return "Thương lượng";
    if (job.salaryMin && job.salaryMax) {
      return `${Math.round(job.salaryMin / 1000000)} - ${Math.round(job.salaryMax / 1000000)} triệu`;
    }
    if (job.salaryMin) {
      return `Từ ${Math.round(job.salaryMin / 1000000)} triệu`;
    }
    if (job.salaryMax) {
      return `Đến ${Math.round(job.salaryMax / 1000000)} triệu`;
    }
    return "Thương lượng";
  };

  // Menu Dropdown 1: Việc làm
  const jobsMenuItems: MenuProps["items"] = [
    {
      key: "job-search",
      icon: <SearchOutlined className="text-primary text-base" />,
      label: (
        <Link href="/viec-lam" className="font-medium text-slate-700 hover:text-primary py-0.5 block">
          Tìm việc làm
        </Link>
      ),
    },
    {
      key: "job-matched",
      icon: <StarOutlined className="text-amber-500 text-base" />,
      label: (
        <Link href="/viec-lam?type=matched" className="font-medium text-slate-700 hover:text-primary py-0.5 block">
          Việc làm phù hợp với bạn
        </Link>
      ),
    },
    {
      key: "job-latest",
      icon: <ClockCircleOutlined className="text-blue-500 text-base" />,
      label: (
        <Link href="/viec-lam?sort=newest" className="font-medium text-slate-700 hover:text-primary py-0.5 block">
          Việc làm mới nhất
        </Link>
      ),
    },
    {
      key: "job-featured",
      icon: <FireOutlined className="text-orange-500 text-base" />,
      label: (
        <Link href="/viec-lam?type=featured" className="font-medium text-slate-700 hover:text-primary py-0.5 block">
          Việc làm nổi bật
        </Link>
      ),
    },
    {
      type: "divider" as const,
    },
    {
      key: "job-by-industry",
      icon: <AppstoreOutlined className="text-indigo-500 text-base" />,
      label: <span className="font-medium text-slate-700">Theo ngành nghề</span>,
      children: [
        {
          key: "ind-it",
          label: <Link href="/viec-lam?industry=cong-nghe-thong-tin">Công nghệ thông tin</Link>,
        },
        {
          key: "ind-business",
          label: <Link href="/viec-lam?industry=kinh-doanh">Kinh doanh</Link>,
        },
        {
          key: "ind-marketing",
          label: <Link href="/viec-lam?industry=marketing">Marketing</Link>,
        },
        {
          key: "ind-finance",
          label: <Link href="/viec-lam?industry=tai-chinh-ngan-hang">Tài chính – Ngân hàng</Link>,
        },
        {
          key: "ind-hr",
          label: <Link href="/viec-lam?industry=nhan-su">Nhân sự</Link>,
        },
        {
          key: "ind-design",
          label: <Link href="/viec-lam?industry=thiet-ke">Thiết kế</Link>,
        },
        {
          type: "divider" as const,
        },
        {
          key: "ind-all",
          label: (
            <Link href="/viec-lam" className="text-primary font-bold text-xs">
              Xem tất cả ngành nghề →
            </Link>
          ),
        },
      ],
    },
    {
      key: "job-by-location",
      icon: <EnvironmentOutlined className="text-emerald-500 text-base" />,
      label: <span className="font-medium text-slate-700">Theo địa điểm</span>,
      children: [
        {
          key: "loc-hcm",
          label: <Link href="/viec-lam?location=ho-chi-minh">TP. Hồ Chí Minh</Link>,
        },
        {
          key: "loc-hn",
          label: <Link href="/viec-lam?location=ha-noi">Hà Nội</Link>,
        },
        {
          key: "loc-dn",
          label: <Link href="/viec-lam?location=da-nang">Đà Nẵng</Link>,
        },
        {
          key: "loc-bd",
          label: <Link href="/viec-lam?location=binh-duong">Bình Dương</Link>,
        },
        {
          key: "loc-dnai",
          label: <Link href="/viec-lam?location=dong-nai">Đồng Nai</Link>,
        },
        {
          type: "divider" as const,
        },
        {
          key: "loc-all",
          label: (
            <Link href="/viec-lam" className="text-primary font-bold text-xs">
              Xem tất cả địa điểm →
            </Link>
          ),
        },
      ],
    },
    {
      key: "job-by-work-mode",
      icon: <RiseOutlined className="text-cyan-500 text-base" />,
      label: <span className="font-medium text-slate-700">Theo hình thức làm việc</span>,
      children: [
        {
          key: "wm-office",
          label: <Link href="/viec-lam?workMode=office">Tại văn phòng</Link>,
        },
        {
          key: "wm-hybrid",
          label: <Link href="/viec-lam?workMode=hybrid">Hybrid</Link>,
        },
        {
          key: "wm-remote",
          label: <Link href="/viec-lam?workMode=remote">Remote</Link>,
        },
        {
          type: "divider" as const,
        },
        {
          key: "et-fulltime",
          label: <Link href="/viec-lam?employmentType=fulltime">Toàn thời gian</Link>,
        },
        {
          key: "et-parttime",
          label: <Link href="/viec-lam?employmentType=parttime">Bán thời gian</Link>,
        },
      ],
    },
  ];

  // Menu Dropdown 2: Công ty
  const companyMenuItems: MenuProps["items"] = [
    {
      key: "company-explore",
      icon: <BankOutlined className="text-primary text-base" />,
      label: (
        <Link href="/cong-ty" className="font-medium text-slate-700 hover:text-primary py-1 block">
          Khám phá công ty
        </Link>
      ),
    },
    {
      key: "company-featured",
      icon: <FireOutlined className="text-orange-500 text-base" />,
      label: (
        <Link href="/cong-ty?tab=featured" className="font-medium text-slate-700 hover:text-primary py-1 block">
          Công ty nổi bật
        </Link>
      ),
    },
    {
      key: "company-reviews",
      icon: <CommentOutlined className="text-sky-500 text-base" />,
      label: (
        <Link href="/cong-ty?tab=reviews" className="font-medium text-slate-700 hover:text-primary py-1 block">
          Đánh giá công ty
        </Link>
      ),
    },
    {
      key: "company-verified",
      icon: <CheckCircleOutlined className="text-emerald-500 text-base" />,
      label: (
        <Link href="/cong-ty?tab=verified" className="font-medium text-slate-700 hover:text-primary py-1 block">
          Công ty đã xác thực
        </Link>
      ),
    },
    {
      key: "company-following",
      icon: <HeartOutlined className="text-rose-500 text-base" />,
      label: (
        <Link href="/cong-ty?tab=following" className="font-medium text-slate-700 hover:text-primary py-1 block">
          Công ty đang theo dõi
        </Link>
      ),
    },
  ];

  // Menu Dropdown 3: CV & Hồ sơ
  const cvMenuItems: MenuProps["items"] = [
    {
      key: "cv-manage",
      icon: <FolderOpenOutlined className="text-amber-500 text-base" />,
      label: (
        <Link href="/ung-vien/cv" className="font-medium text-slate-700 hover:text-primary py-1 block">
          CV của tôi
        </Link>
      ),
    },
    {
      key: "cv-create",
      icon: <FileTextOutlined className="text-primary text-base" />,
      label: (
        <Link href="/ung-vien/cv?tab=builder" className="font-medium text-slate-700 hover:text-primary py-1 block">
          Tạo CV online
        </Link>
      ),
    },
    {
      key: "cv-upload",
      icon: <UploadOutlined className="text-emerald-500 text-base" />,
      label: (
        <Link href="/ung-vien/cv?tab=upload" className="font-medium text-slate-700 hover:text-primary py-1 block">
          Tải CV lên
        </Link>
      ),
    },
    {
      key: "cv-templates",
      icon: <LayoutOutlined className="text-teal-500 text-base" />,
      label: (
        <Link href="/ung-vien/cv?tab=templates" className="font-medium text-slate-700 hover:text-primary py-1 block">
          Mẫu CV
        </Link>
      ),
    },
    {
      key: "cv-profile",
      icon: <IdcardOutlined className="text-indigo-500 text-base" />,
      label: (
        <Link href="/ung-vien/ho-so" className="font-medium text-slate-700 hover:text-primary py-1 block">
          Hồ sơ nghề nghiệp
        </Link>
      ),
    },
  ];

  // Menu Dropdown 4: Cẩm nang nghề nghiệp
  const handbookMenuItems: MenuProps["items"] = [
    {
      key: "hb-experience",
      icon: <BookOutlined className="text-primary text-base" />,
      label: (
        <Link href="/cam-nang-nghe-nghiep?category=tim-viec" className="font-medium text-slate-700 hover:text-primary py-1 block">
          Kinh nghiệm tìm việc
        </Link>
      ),
    },
    {
      key: "hb-skills",
      icon: <ThunderboltOutlined className="text-amber-500 text-base" />,
      label: (
        <Link href="/cam-nang-nghe-nghiep?category=ky-nang" className="font-medium text-slate-700 hover:text-primary py-1 block">
          Kỹ năng nghề nghiệp
        </Link>
      ),
    },
    {
      key: "hb-trends",
      icon: <LineChartOutlined className="text-cyan-500 text-base" />,
      label: (
        <Link href="/cam-nang-nghe-nghiep?category=thi-truong" className="font-medium text-slate-700 hover:text-primary py-1 block">
          Xu hướng thị trường
        </Link>
      ),
    },
    {
      key: "hb-salary",
      icon: <DollarOutlined className="text-emerald-500 text-base" />,
      label: (
        <Link href="/cam-nang-nghe-nghiep?category=luong-phuc-loi" className="font-medium text-slate-700 hover:text-primary py-1 block">
          Lương & chế độ
        </Link>
      ),
    },
    {
      key: "hb-development",
      icon: <RocketOutlined className="text-rose-500 text-base" />,
      label: (
        <Link href="/cam-nang-nghe-nghiep?category=phat-trien-su-nghiep" className="font-medium text-slate-700 hover:text-primary py-1 block">
          Phát triển sự nghiệp
        </Link>
      ),
    },
    {
      key: "hb-news",
      icon: <ReadOutlined className="text-blue-500 text-base" />,
      label: (
        <Link href="/cam-nang-nghe-nghiep?category=tin-tuc-careza" className="font-medium text-slate-700 hover:text-primary py-1 block">
          Tin tức Careza
        </Link>
      ),
    },
  ];

  // Menu Dropdown 5: Công cụ
  const toolsMenuItems: MenuProps["items"] = [
    {
      key: "tool-gross-net",
      icon: <CalculatorOutlined className="text-primary text-base" />,
      label: (
        <Link href="/cong-cu/tinh-luong-gross-net" className="font-medium text-slate-700 hover:text-primary py-1 block">
          Tính lương Gross - Net
        </Link>
      ),
    },
    {
      key: "tool-unemployment",
      icon: <SafetyCertificateOutlined className="text-emerald-500 text-base" />,
      label: (
        <Link href="/cong-cu/bao-hiem-that-nghiep" className="font-medium text-slate-700 hover:text-primary py-1 block">
          Tính bảo hiểm thất nghiệp
        </Link>
      ),
    },
    {
      key: "tool-mbti",
      icon: <ExperimentOutlined className="text-purple-500 text-base" />,
      label: (
        <Link href="/cong-cu/mbti" className="font-medium text-slate-700 hover:text-primary py-1 block">
          Trắc nghiệm MBTI / Tính cách
        </Link>
      ),
    },
    {
      key: "tool-ai-career",
      icon: <RobotOutlined className="text-blue-500 text-base" />,
      label: (
        <Link href="/ai-career" className="font-medium text-slate-700 hover:text-primary py-1 block">
          Trợ lý AI Career & Phỏng vấn
        </Link>
      ),
    },
    {
      type: "divider" as const,
    },
    {
      key: "tool-all",
      icon: <ToolOutlined className="text-slate-500 text-base" />,
      label: (
        <Link href="/cong-cu" className="font-bold text-primary py-1 block">
          Tất cả công cụ tiện ích →
        </Link>
      ),
    },
  ];

  const isCandidate = !user || user.roles.includes(RoleCode.CANDIDATE);

  const userMenuItems: MenuProps["items"] = isCandidate
    ? [
        {
          key: "dashboard",
          icon: <HomeOutlined className="text-primary text-base" />,
          label: (
            <Link href="/ung-vien/dashboard" className={`font-medium py-1 block ${pathname === "/ung-vien/dashboard" ? "text-primary font-bold" : "text-slate-700 hover:text-primary"}`}>
              Tổng quan
            </Link>
          ),
        },
        {
          key: "profile",
          icon: <IdcardOutlined className="text-indigo-500 text-base" />,
          label: (
            <Link href="/ung-vien/ho-so" className={`font-medium py-1 block ${pathname === "/ung-vien/ho-so" ? "text-primary font-bold" : "text-slate-700 hover:text-primary"}`}>
              Hồ sơ nghề nghiệp
            </Link>
          ),
        },
        {
          key: "cv",
          icon: <FileTextOutlined className="text-blue-500 text-base" />,
          label: (
            <Link href="/ung-vien/cv" className={`font-medium py-1 block ${pathname.startsWith("/ung-vien/cv") ? "text-primary font-bold" : "text-slate-700 hover:text-primary"}`}>
              CV của tôi
            </Link>
          ),
        },
        {
          key: "applied-jobs",
          icon: <SendOutlined className="text-emerald-500 text-base" />,
          label: (
            <Link href="/ung-vien/ung-tuyen" className={`font-medium py-1 block ${pathname === "/ung-vien/ung-tuyen" ? "text-primary font-bold" : "text-slate-700 hover:text-primary"}`}>
              Việc đã ứng tuyển
            </Link>
          ),
        },
        {
          key: "saved-jobs",
          icon: <HeartOutlined className="text-rose-500 text-base" />,
          label: (
            <Link href="/ung-vien/viec-da-luu" className={`font-medium py-1 block ${pathname === "/ung-vien/viec-da-luu" ? "text-primary font-bold" : "text-slate-700 hover:text-primary"}`}>
              Việc đã lưu {favoriteCount > 0 ? `(${favoriteCount})` : ""}
            </Link>
          ),
        },
        {
          key: "interviews",
          icon: <CalendarOutlined className="text-amber-500 text-base" />,
          label: (
            <Link href="/ung-vien/lich-phong-van" className={`font-medium py-1 block ${pathname === "/ung-vien/lich-phong-van" ? "text-primary font-bold" : "text-slate-700 hover:text-primary"}`}>
              Lịch phỏng vấn
            </Link>
          ),
        },
        {
          key: "notifications",
          icon: <BellOutlined className="text-purple-500 text-base" />,
          label: (
            <Link href="/ung-vien/thong-bao" className={`font-medium py-1 block ${pathname === "/ung-vien/thong-bao" ? "text-primary font-bold" : "text-slate-700 hover:text-primary"}`}>
              Thông báo
            </Link>
          ),
        },
        {
          key: "settings",
          icon: <SettingOutlined className="text-slate-500 text-base" />,
          label: (
            <Link href="/ung-vien/cai-dat" className={`font-medium py-1 block ${pathname === "/ung-vien/cai-dat" ? "text-primary font-bold" : "text-slate-700 hover:text-primary"}`}>
              Cài đặt
            </Link>
          ),
        },
        {
          type: "divider" as const,
        },
        {
          key: "logout",
          icon: <LogoutOutlined className="text-rose-500 text-base" />,
          label: <span className="font-semibold text-rose-500 py-1 block">Đăng xuất</span>,
          danger: true,
          onClick: handleLogout,
        },
      ]
    : [
        {
          key: "dashboard",
          icon: <DashboardOutlined />,
          label: <Link href={getDashboardLink()}>Tổng quan</Link>,
        },
        {
          key: "profile",
          icon: <UserOutlined />,
          label: <Link href="/doanh-nghiep/ho-so">Thông tin doanh nghiệp</Link>,
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

  return (
    <header className="sticky top-0 left-0 w-full z-50 glass-header h-20 flex items-center border-b border-slate-100 bg-white/95 backdrop-blur-md transition-all shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
      <div className="w-full flex justify-between items-center px-4 sm:px-6 md:px-8 xl:px-12">
        {/* LOGO & MENU TRÁI */}
        <div className="flex items-center gap-6 lg:gap-8 xl:gap-10">
          {/* Logo Careza */}
          <Link className="text-2xl font-extrabold tracking-tighter text-primary flex items-center gap-2.5 shrink-0" href="/">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary via-blue-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-primary/25">
              <span className="material-symbols-outlined text-2xl font-bold">star</span>
            </div>
            <div className="flex flex-col">
              <span className="leading-none text-2xl font-black text-slate-900 tracking-tight">Careza</span>
              <span className="text-[10px] text-slate-500 font-medium tracking-normal mt-0.5">
                Kết nối nhân tài - Kiến tạo tương lai
              </span>
            </div>
          </Link>

          {/* Nav Items Chính (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
            {/* 1. Việc làm */}
            <Dropdown menu={{ items: jobsMenuItems }} placement="bottomLeft" arrow>
              <Link
                href="/viec-lam"
                className={`px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  pathname.startsWith("/viec-lam")
                    ? "text-primary bg-primary/5 font-bold"
                    : "text-slate-600 hover:text-primary hover:bg-slate-50"
                }`}
              >
                <span>Việc làm</span>
                <DownOutlined className="text-[10px] text-slate-400" />
              </Link>
            </Dropdown>

            {/* 2. Công ty */}
            <Dropdown menu={{ items: companyMenuItems, selectedKeys: selectedCompanyKeys }} placement="bottomLeft" arrow>
              <Link
                href="/cong-ty"
                className={`px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  pathname.startsWith("/cong-ty")
                    ? "text-primary bg-primary/5 font-bold"
                    : "text-slate-600 hover:text-primary hover:bg-slate-50"
                }`}
              >
                <span>Công ty</span>
                <DownOutlined className="text-[10px] text-slate-400" />
              </Link>
            </Dropdown>

            {/* 3. CV & Hồ sơ */}
            <Dropdown menu={{ items: cvMenuItems }} placement="bottomLeft" arrow>
              <Link
                href="/ung-vien/cv"
                className={`px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  pathname.startsWith("/ung-vien/cv") || pathname.startsWith("/ung-vien/ho-so")
                    ? "text-primary bg-primary/5 font-bold"
                    : "text-slate-600 hover:text-primary hover:bg-slate-50"
                }`}
              >
                <span>CV & Hồ sơ</span>
                <DownOutlined className="text-[10px] text-slate-400" />
              </Link>
            </Dropdown>

            {/* 4. Cẩm nang nghề nghiệp */}
            <Dropdown menu={{ items: handbookMenuItems }} placement="bottomLeft" arrow>
              <Link
                href="/cam-nang-nghe-nghiep"
                className={`px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  pathname.startsWith("/cam-nang-nghe-nghiep")
                    ? "text-primary bg-primary/5 font-bold"
                    : "text-slate-600 hover:text-primary hover:bg-slate-50"
                }`}
              >
                <span>Cẩm nang nghề nghiệp</span>
                <DownOutlined className="text-[10px] text-slate-400" />
              </Link>
            </Dropdown>

            {/* 5. Công cụ */}
            <Dropdown menu={{ items: toolsMenuItems }} placement="bottomLeft" arrow>
              <Link
                href="/cong-cu"
                className={`px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  pathname.startsWith("/cong-cu")
                    ? "text-primary bg-primary/5 font-bold"
                    : "text-slate-600 hover:text-primary hover:bg-slate-50"
                }`}
              >
                <span>Công cụ</span>
                <DownOutlined className="text-[10px] text-slate-400" />
              </Link>
            </Dropdown>
          </nav>
        </div>

        {/* MENU PHẢI (User, Saved Jobs, CTA) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 1. Nút Việc làm đã lưu */}
          <Tooltip title="Danh sách việc làm đã lưu">
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  message.info("Vui lòng đăng nhập để xem danh sách việc làm đã lưu");
                  router.push("/dang-nhap");
                  return;
                }
                setIsFavoritesOpen(true);
                loadFavoriteJobs();
              }}
              className="relative p-2 rounded-full text-slate-600 hover:text-rose-600 hover:bg-rose-50/60 transition-all flex items-center justify-center cursor-pointer group"
              aria-label="Việc đã lưu"
            >
              <Badge count={favoriteCount} size="small" offset={[2, -2]} overflowCount={99} color="#ef4444">
                {favoriteCount > 0 ? (
                  <HeartFilled className="text-xl text-rose-500 group-hover:scale-110 transition-transform" />
                ) : (
                  <HeartOutlined className="text-xl text-slate-600 group-hover:text-rose-500 group-hover:scale-110 transition-transform" />
                )}
              </Badge>
            </button>
          </Tooltip>

          {/* 2 & 3. Đăng nhập / Đăng ký hoặc User Profile */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Dropdown
                placement="bottomRight"
                arrow
                popupRender={() =>
                  isCandidate ? (
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-2.5 w-[360px] sm:w-[390px]">
                      {/* Grid 2 Cột Chức năng Ứng viên */}
                      <div className="grid grid-cols-2 gap-1">
                        {/* 1. Tổng quan */}
                        <Link
                          href="/ung-vien/dashboard"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-900 hover:text-primary hover:bg-slate-100/80 transition-all group"
                        >
                          <HomeOutlined className="text-primary text-base group-hover:scale-110 transition-transform" />
                          <span>Tổng quan</span>
                        </Link>

                        {/* 5. Việc đã lưu */}
                        <Link
                          href="/ung-vien/viec-da-luu"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-900 hover:text-primary hover:bg-slate-100/80 transition-all group"
                        >
                          <HeartOutlined className="text-rose-500 text-base group-hover:scale-110 transition-transform" />
                          <span>Việc đã lưu {favoriteCount > 0 ? `(${favoriteCount})` : ""}</span>
                        </Link>

                        {/* 2. Hồ sơ nghề nghiệp */}
                        <Link
                          href="/ung-vien/ho-so"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-900 hover:text-primary hover:bg-slate-100/80 transition-all group"
                        >
                          <IdcardOutlined className="text-indigo-500 text-base group-hover:scale-110 transition-transform" />
                          <span>Hồ sơ nghề nghiệp</span>
                        </Link>

                        {/* 6. Lịch phỏng vấn */}
                        <Link
                          href="/ung-vien/lich-phong-van"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-900 hover:text-primary hover:bg-slate-100/80 transition-all group"
                        >
                          <CalendarOutlined className="text-amber-500 text-base group-hover:scale-110 transition-transform" />
                          <span>Lịch phỏng vấn</span>
                        </Link>

                        {/* 3. CV của tôi */}
                        <Link
                          href="/ung-vien/cv"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-900 hover:text-primary hover:bg-slate-100/80 transition-all group"
                        >
                          <FileTextOutlined className="text-blue-500 text-base group-hover:scale-110 transition-transform" />
                          <span>CV của tôi</span>
                        </Link>

                        {/* 7. Thông báo */}
                        <Link
                          href="/ung-vien/thong-bao"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-900 hover:text-primary hover:bg-slate-100/80 transition-all group"
                        >
                          <BellOutlined className="text-purple-500 text-base group-hover:scale-110 transition-transform" />
                          <span>Thông báo</span>
                        </Link>

                        {/* 4. Việc đã ứng tuyển */}
                        <Link
                          href="/ung-vien/ung-tuyen"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-900 hover:text-primary hover:bg-slate-100/80 transition-all group"
                        >
                          <SendOutlined className="text-emerald-500 text-base group-hover:scale-110 transition-transform" />
                          <span>Việc đã ứng tuyển</span>
                        </Link>

                        {/* 8. Cài đặt */}
                        <Link
                          href="/ung-vien/cai-dat"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-900 hover:text-primary hover:bg-slate-100/80 transition-all group"
                        >
                          <SettingOutlined className="text-slate-500 text-base group-hover:scale-110 transition-transform" />
                          <span>Cài đặt</span>
                        </Link>
                      </div>

                      {/* Divider */}
                      <div className="h-px bg-slate-100 my-1.5" />

                      {/* Đăng xuất */}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-all cursor-pointer border-none bg-transparent"
                      >
                        <LogoutOutlined className="text-red-600 text-base" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-2 w-[220px]">
                      <Link
                        href={getDashboardLink()}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-primary hover:bg-slate-50"
                      >
                        <DashboardOutlined className="text-primary text-base" />
                        <span>Tổng quan</span>
                      </Link>
                      <Link
                        href="/doanh-nghiep/ho-so"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-primary hover:bg-slate-50"
                      >
                        <UserOutlined className="text-indigo-500 text-base" />
                        <span>Thông tin doanh nghiệp</span>
                      </Link>
                      <div className="h-px bg-slate-100 my-1.5" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50/80 transition-all cursor-pointer border-none bg-transparent"
                      >
                        <LogoutOutlined className="text-rose-500 text-base" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  )
                }
              >
                <div className="flex items-center gap-2 cursor-pointer p-1 pr-2.5 rounded-full hover:bg-slate-100/70 border border-slate-200/60 transition-colors">
                  <Avatar src={user?.avatarUrl} icon={<UserOutlined />} className="bg-primary/10 text-primary border border-primary/20" />
                  <span className="hidden sm:inline-block text-xs font-bold text-slate-700 max-w-[120px] truncate">
                    {user?.fullName || "Mai Phương"}
                  </span>
                  <DownOutlined className="text-[10px] text-slate-400" />
                </div>
              </Dropdown>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              {/* Nút Đăng nhập (text/outline) */}
              <Link href="/dang-nhap">
                <Button
                  type="text"
                  className="font-semibold text-slate-700 hover:text-primary hover:bg-slate-50 px-3.5 h-9 rounded-lg transition-all"
                >
                  Đăng nhập
                </Button>
              </Link>

              {/* Nút Đăng ký (Primary Careza) */}
              <Link href="/dang-ky">
                <Button
                  type="primary"
                  className="bg-primary hover:bg-primary/90 text-white font-semibold px-4 h-9 rounded-lg shadow-sm shadow-primary/25 border-none transition-all"
                >
                  Đăng ký
                </Button>
              </Link>
            </div>
          )}

          {/* Vạch ngăn cách tinh tế */}
          <div className="hidden sm:block w-px h-5 bg-slate-200 mx-1" />

          {/* 4. Dành cho Nhà tuyển dụng → (CTA Riêng biệt, dễ nhận biết) */}
          <Link href="/nha-tuyen-dung" className="hidden md:inline-flex">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary transition-all text-xs font-bold shadow-xs hover:border-primary/50 group">
              <span>Dành cho Nhà tuyển dụng</span>
              <ArrowRightOutlined className="text-[10px] group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* Mobile Menu Toggle Button */}
          <Button
            type="text"
            icon={<MenuOutlined className="text-lg" />}
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden text-slate-700 hover:text-primary flex items-center justify-center p-2 rounded-lg"
          />
        </div>
      </div>

      {/* DRAWER DANH SÁCH CÔNG VIỆC YÊU THÍCH */}
      <Drawer
        title={
          <div className="flex items-center justify-between pr-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                <HeartFilled className="text-base" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 m-0">Công việc đã lưu</h3>
                <p className="text-xs text-slate-400 font-normal m-0">{favoriteCount} vị trí đã được lưu</p>
              </div>
            </div>
            {favoriteCount > 0 && (
              <Tag color="magenta" className="rounded-full font-bold">
                {favoriteCount} tin
              </Tag>
            )}
          </div>
        }
        placement="right"
        onClose={() => setIsFavoritesOpen(false)}
        open={isFavoritesOpen}
        size={420}
        footer={
          favoriteJobs.length > 0 ? (
            <div className="py-2">
              <Link
                href="/ung-vien/viec-da-luu"
                onClick={() => setIsFavoritesOpen(false)}
                className="w-full py-2.5 px-4 bg-primary text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20"
              >
                <span>Xem tất cả danh sách việc đã lưu</span>
                <ArrowRightOutlined />
              </Link>
            </div>
          ) : null
        }
      >
        {loadingFavorites ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Spin size="large" />
            <p className="text-xs text-slate-400">Đang tải danh sách việc làm đã lưu...</p>
          </div>
        ) : favoriteJobs.length > 0 ? (
          <div className="flex flex-col gap-3.5">
            {favoriteJobs.map((item) => {
              const { job, company } = item;
              return (
                <div
                  key={item.id}
                  className="group relative p-3.5 rounded-2xl border border-slate-100 bg-white hover:border-blue-200 hover:shadow-md transition-all flex gap-3 items-start"
                >
                  {/* Logo công ty */}
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 p-1 flex items-center justify-center shrink-0">
                    <img
                      src={company?.logoUrl || "https://placehold.co/100x100?text=Logo"}
                      alt={company?.name || "Company Logo"}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=80&h=80&q=80";
                      }}
                    />
                  </div>

                  {/* Thông tin Job */}
                  <div className="flex-1 min-w-0 pr-6">
                    <Link
                      href={`/viec-lam/${job.id}`}
                      onClick={() => setIsFavoritesOpen(false)}
                      className="text-sm font-bold text-slate-800 hover:text-primary transition-colors line-clamp-1 block"
                    >
                      {job.title}
                    </Link>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{company?.name}</p>

                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500 font-medium">
                      <span className="text-blue-600 font-bold flex items-center gap-1">
                        <DollarOutlined /> {formatSalary(job)}
                      </span>
                      {job.locationText && (
                        <span className="flex items-center gap-0.5 truncate max-w-[120px]">
                          <EnvironmentOutlined /> {job.locationText}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Nút Bỏ lưu */}
                  <div className="absolute top-3 right-3">
                    <Popconfirm
                      title="Bỏ lưu công việc này?"
                      okText="Bỏ lưu"
                      cancelText="Hủy"
                      okButtonProps={{ danger: true, size: "small" }}
                      cancelButtonProps={{ size: "small" }}
                      onConfirm={() => handleRemoveFavorite(job.id)}
                    >
                      <button
                        title="Bỏ lưu"
                        disabled={deletingId === job.id}
                        className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <DeleteOutlined className="text-xs" />
                      </button>
                    </Popconfirm>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <p className="text-sm font-bold text-slate-700">Chưa có công việc nào được lưu</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-[220px] mx-auto">
                    Khám phá các cơ hội nghề nghiệp và bấm lưu để xem lại sau nhé!
                  </p>
                </div>
              }
            >
              <Link href="/viec-lam" onClick={() => setIsFavoritesOpen(false)}>
                <Button type="primary" className="mt-2 bg-primary font-semibold">
                  Khám phá việc làm ngay
                </Button>
              </Link>
            </Empty>
          </div>
        )}
      </Drawer>

      {/* DRAWER MOBILE NAVIGATION */}
      <Drawer
        title={
          <div className="flex items-center justify-between w-full pr-2">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 text-primary font-extrabold text-lg tracking-tight"
            >
              <span className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[16px]">auto_awesome</span>
              </span>
              <span>Careza</span>
            </Link>
          </div>
        }
        placement="left"
        onClose={() => setIsMobileMenuOpen(false)}
        open={isMobileMenuOpen}
        size={320}
      >
        <div className="flex flex-col gap-6 h-full justify-between pb-4">
          {/* CTA Dành cho Nhà tuyển dụng nổi bật trên Mobile */}
          <div>
            <Link
              href="/nha-tuyen-dung"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-primary/10 border border-primary/25 text-primary font-bold text-xs hover:bg-primary/15 transition-colors mb-4"
            >
              <div className="flex items-center gap-2">
                <TeamOutlined className="text-base" />
                <span>Dành cho Nhà tuyển dụng</span>
              </div>
              <ArrowRightOutlined className="text-xs" />
            </Link>

            {/* Menu dạng Collapse Accordion */}
            <Collapse
              ghost
              defaultActiveKey={["1"]}
              expandIconPlacement="end"
              className="mobile-header-collapse"
              items={[
                {
                  key: "1",
                  label: <span className="font-bold text-slate-800 text-sm">Việc làm</span>,
                  children: (
                    <div className="flex flex-col gap-1 pl-2">
                      <Link
                        href="/viec-lam"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="py-1.5 text-xs text-slate-600 hover:text-primary flex items-center gap-2"
                      >
                        <SearchOutlined className="text-primary" /> Tìm việc làm
                      </Link>
                      <Link
                        href="/viec-lam?type=matched"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="py-1.5 text-xs text-slate-600 hover:text-primary flex items-center gap-2"
                      >
                        <StarOutlined className="text-amber-500" /> Việc làm phù hợp với bạn
                      </Link>
                      <Link
                        href="/viec-lam?sort=newest"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="py-1.5 text-xs text-slate-600 hover:text-primary flex items-center gap-2"
                      >
                        <ClockCircleOutlined className="text-blue-500" /> Việc làm mới nhất
                      </Link>
                      <Link
                        href="/viec-lam?type=featured"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="py-1.5 text-xs text-slate-600 hover:text-primary flex items-center gap-2"
                      >
                        <FireOutlined className="text-orange-500" /> Việc làm nổi bật
                      </Link>

                      <div className="h-px bg-slate-100 my-1" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block py-1">
                        Theo ngành nghề
                      </span>
                      <div className="grid grid-cols-2 gap-1 pl-1">
                        <Link
                          href="/viec-lam?industry=cong-nghe-thong-tin"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="py-1 text-[11px] text-slate-600 hover:text-primary truncate"
                        >
                          • CNTT
                        </Link>
                        <Link
                          href="/viec-lam?industry=kinh-doanh"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="py-1 text-[11px] text-slate-600 hover:text-primary truncate"
                        >
                          • Kinh doanh
                        </Link>
                        <Link
                          href="/viec-lam?industry=marketing"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="py-1 text-[11px] text-slate-600 hover:text-primary truncate"
                        >
                          • Marketing
                        </Link>
                        <Link
                          href="/viec-lam?industry=tai-chinh-ngan-hang"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="py-1 text-[11px] text-slate-600 hover:text-primary truncate"
                        >
                          • Tài chính
                        </Link>
                        <Link
                          href="/viec-lam?industry=nhan-su"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="py-1 text-[11px] text-slate-600 hover:text-primary truncate"
                        >
                          • Nhân sự
                        </Link>
                        <Link
                          href="/viec-lam?industry=thiet-ke"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="py-1 text-[11px] text-slate-600 hover:text-primary truncate"
                        >
                          • Thiết kế
                        </Link>
                      </div>

                      <div className="h-px bg-slate-100 my-1" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block py-1">
                        Theo địa điểm
                      </span>
                      <div className="grid grid-cols-2 gap-1 pl-1">
                        <Link
                          href="/viec-lam?location=ho-chi-minh"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="py-1 text-[11px] text-slate-600 hover:text-primary truncate"
                        >
                          • TP. HCM
                        </Link>
                        <Link
                          href="/viec-lam?location=ha-noi"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="py-1 text-[11px] text-slate-600 hover:text-primary truncate"
                        >
                          • Hà Nội
                        </Link>
                        <Link
                          href="/viec-lam?location=da-nang"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="py-1 text-[11px] text-slate-600 hover:text-primary truncate"
                        >
                          • Đà Nẵng
                        </Link>
                        <Link
                          href="/viec-lam?location=binh-duong"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="py-1 text-[11px] text-slate-600 hover:text-primary truncate"
                        >
                          • Bình Dương
                        </Link>
                      </div>

                      <div className="h-px bg-slate-100 my-1" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block py-1">
                        Hình thức làm việc
                      </span>
                      <div className="grid grid-cols-2 gap-1 pl-1">
                        <Link
                          href="/viec-lam?workMode=office"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="py-1 text-[11px] text-slate-600 hover:text-primary truncate"
                        >
                          • Tại văn phòng
                        </Link>
                        <Link
                          href="/viec-lam?workMode=hybrid"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="py-1 text-[11px] text-slate-600 hover:text-primary truncate"
                        >
                          • Hybrid
                        </Link>
                        <Link
                          href="/viec-lam?workMode=remote"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="py-1 text-[11px] text-slate-600 hover:text-primary truncate"
                        >
                          • Remote
                        </Link>
                        <Link
                          href="/viec-lam?employmentType=fulltime"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="py-1 text-[11px] text-slate-600 hover:text-primary truncate"
                        >
                          • Toàn thời gian
                        </Link>
                      </div>
                    </div>
                  ),
                },
                {
                  key: "2",
                  label: <span className="font-bold text-slate-800 text-sm">Công ty</span>,
                  children: (
                    <div className="flex flex-col gap-1 pl-2">
                      <Link
                        href="/cong-ty"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="py-1.5 text-xs text-slate-600 hover:text-primary flex items-center gap-2"
                      >
                        <BankOutlined className="text-primary" /> Khám phá công ty
                      </Link>
                      <Link
                        href="/cong-ty?tab=featured"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="py-1.5 text-xs text-slate-600 hover:text-primary flex items-center gap-2"
                      >
                        <FireOutlined className="text-orange-500" /> Công ty nổi bật
                      </Link>
                      <Link
                        href="/cong-ty?tab=reviews"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="py-1.5 text-xs text-slate-600 hover:text-primary flex items-center gap-2"
                      >
                        <CommentOutlined className="text-sky-500" /> Đánh giá công ty
                      </Link>
                      <Link
                        href="/cong-ty?tab=verified"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="py-1.5 text-xs text-slate-600 hover:text-primary flex items-center gap-2"
                      >
                        <CheckCircleOutlined className="text-emerald-500" /> Công ty đã xác thực
                      </Link>
                      <Link
                        href="/cong-ty?tab=following"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="py-1.5 text-xs text-slate-600 hover:text-primary flex items-center gap-2"
                      >
                        <HeartOutlined className="text-rose-500" /> Công ty đang theo dõi
                      </Link>
                    </div>
                  ),
                },
                {
                  key: "3",
                  label: <span className="font-bold text-slate-800 text-sm">CV & Hồ sơ</span>,
                  children: (
                    <div className="flex flex-col gap-1 pl-2">
                      <Link
                        href="/ung-vien/cv?tab=builder"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="py-1.5 text-xs text-slate-600 hover:text-primary flex items-center gap-2"
                      >
                        <FileTextOutlined className="text-primary" /> Tạo CV online
                      </Link>
                      <Link
                        href="/ung-vien/cv?tab=upload"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="py-1.5 text-xs text-slate-600 hover:text-primary flex items-center gap-2"
                      >
                        <UploadOutlined className="text-emerald-500" /> Tải CV lên
                      </Link>
                      <Link
                        href="/ung-vien/cv?tab=templates"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="py-1.5 text-xs text-slate-600 hover:text-primary flex items-center gap-2"
                      >
                        <LayoutOutlined className="text-teal-500" /> Mẫu CV
                      </Link>
                      <Link
                        href="/ung-vien/cv"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="py-1.5 text-xs text-slate-600 hover:text-primary flex items-center gap-2"
                      >
                        <FolderOpenOutlined className="text-amber-500" /> CV của tôi
                      </Link>
                      <Link
                        href="/ung-vien/ho-so"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="py-1.5 text-xs text-slate-600 hover:text-primary flex items-center gap-2"
                      >
                        <IdcardOutlined className="text-indigo-500" /> Hồ sơ nghề nghiệp
                      </Link>
                    </div>
                  ),
                },
                {
                  key: "4",
                  label: <span className="font-bold text-slate-800 text-sm">Cẩm nang nghề nghiệp</span>,
                  children: (
                    <div className="flex flex-col gap-1 pl-2">
                      <Link
                        href="/cam-nang-nghe-nghiep?category=tim-viec"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="py-1.5 text-xs text-slate-600 hover:text-primary flex items-center gap-2"
                      >
                        <BookOutlined className="text-primary" /> Kinh nghiệm tìm việc
                      </Link>
                      <Link
                        href="/cam-nang-nghe-nghiep?category=ky-nang"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="py-1.5 text-xs text-slate-600 hover:text-primary flex items-center gap-2"
                      >
                        <ThunderboltOutlined className="text-amber-500" /> Kỹ năng nghề nghiệp
                      </Link>
                      <Link
                        href="/cam-nang-nghe-nghiep?category=thi-truong"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="py-1.5 text-xs text-slate-600 hover:text-primary flex items-center gap-2"
                      >
                        <LineChartOutlined className="text-cyan-500" /> Xu hướng thị trường
                      </Link>
                      <Link
                        href="/cam-nang-nghe-nghiep?category=luong-phuc-loi"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="py-1.5 text-xs text-slate-600 hover:text-primary flex items-center gap-2"
                      >
                        <DollarOutlined className="text-emerald-500" /> Lương & chế độ
                      </Link>
                      <Link
                        href="/cam-nang-nghe-nghiep?category=phat-trien-su-nghiep"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="py-1.5 text-xs text-slate-600 hover:text-primary flex items-center gap-2"
                      >
                        <RocketOutlined className="text-rose-500" /> Phát triển sự nghiệp
                      </Link>
                      <Link
                        href="/cam-nang-nghe-nghiep?category=tin-tuc-careza"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="py-1.5 text-xs text-slate-600 hover:text-primary flex items-center gap-2"
                      >
                        <ReadOutlined className="text-blue-500" /> Tin tức Careza
                      </Link>
                    </div>
                  ),
                },
                {
                  key: "5",
                  label: <span className="font-bold text-slate-800 text-sm">Công cụ</span>,
                  children: (
                    <div className="flex flex-col gap-1 pl-2">
                      <Link
                        href="/cong-cu/tinh-luong-gross-net"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="py-1.5 text-xs text-slate-600 hover:text-primary flex items-center gap-2"
                      >
                        <CalculatorOutlined className="text-primary" /> Tính lương Gross - Net
                      </Link>
                      <Link
                        href="/cong-cu/bao-hiem-that-nghiep"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="py-1.5 text-xs text-slate-600 hover:text-primary flex items-center gap-2"
                      >
                        <SafetyCertificateOutlined className="text-emerald-500" /> Tính bảo hiểm thất nghiệp
                      </Link>
                      <Link
                        href="/cong-cu/mbti"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="py-1.5 text-xs text-slate-600 hover:text-primary flex items-center gap-2"
                      >
                        <ExperimentOutlined className="text-purple-500" /> Trắc nghiệm MBTI / Tính cách
                      </Link>
                      <Link
                        href="/ai-career"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="py-1.5 text-xs text-slate-600 hover:text-primary flex items-center gap-2"
                      >
                        <RobotOutlined className="text-blue-500" /> Trợ lý AI Career & Phỏng vấn
                      </Link>
                      <Link
                        href="/cong-cu"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="py-1.5 text-xs font-bold text-primary flex items-center gap-2 pt-1 border-t border-slate-100"
                      >
                        <ToolOutlined /> Tất cả công cụ tiện ích
                      </Link>
                    </div>
                  ),
                },
              ]}
            />
          </div>

          {/* Action Mobile ở dưới cùng */}
          <div className="flex flex-col gap-2.5 pt-4 border-t border-slate-100">
            {isAuthenticated ? (
              <>
                <Link href={getDashboardLink()} onClick={() => setIsMobileMenuOpen(false)}>
                  <Button type="primary" block className="bg-primary border-none h-10 font-bold">
                    Vào trang quản lý
                  </Button>
                </Link>
                <Link href="/ung-vien/viec-da-luu" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button block className="h-10 font-semibold flex items-center justify-center gap-2 text-rose-600 border-rose-200 hover:bg-rose-50">
                    <HeartFilled /> Việc làm đã lưu ({favoriteCount})
                  </Button>
                </Link>
                <Button danger block onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}>
                  Đăng xuất
                </Button>
              </>
            ) : (
              <>
                <Link href="/dang-nhap" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button block className="h-10 font-semibold text-slate-700">Đăng nhập</Button>
                </Link>
                <Link href="/dang-ky" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button type="primary" block className="bg-primary border-none h-10 font-bold">Đăng ký</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </Drawer>
    </header>
  );
}

export default function PublicHeader() {
  return (
    <Suspense fallback={null}>
      <PublicHeaderMain />
    </Suspense>
  );
}
