"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  FileTextOutlined,
  SafetyCertificateOutlined,
  ArrowLeftOutlined,
  InfoCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  SolutionOutlined,
  FormOutlined,
  RobotOutlined,
  WarningOutlined,
  DatabaseOutlined,
  AimOutlined,
  ShareAltOutlined,
  LockOutlined,
  SettingOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons";

export type LegalTabKey = "terms" | "privacy";

interface LegalSection {
  id: string;
  number: string;
  title: string;
  icon: React.ReactNode;
  paragraphs?: string[];
  bullets?: { label?: string; text: string }[];
  note?: string;
}

const TERMS_SECTIONS: LegalSection[] = [
  {
    id: "dieu-khoan-1",
    number: "01",
    title: "Giới thiệu & Phạm vi áp dụng",
    icon: <FileTextOutlined className="text-[#0062ff]" />,
    paragraphs: [
      "Chào mừng bạn đến với CAREZA – nền tảng hỗ trợ kết nối tuyển dụng và quản lý quy trình ứng tuyển trực tuyến. Điều khoản sử dụng này quy định quyền và nghĩa vụ của người dùng khi tạo tài khoản, truy cập và sử dụng các tính năng trên hệ thống CAREZA.",
      "Hệ thống phục vụ hai nhóm người dùng chính trên cổng thông tin là Ứng viên (Người tìm việc) và Nhà tuyển dụng (Doanh nghiệp/Tổ chức tuyển dụng), dưới sự vận hành và kiểm duyệt của bộ phận Quản trị viên CAREZA.",
    ],
    note: "Lưu ý: Văn bản này là bản dự thảo phục vụ quá trình vận hành và rà soát nội bộ của dự án CAREZA, không phải cam kết tư vấn pháp lý chính thức và chưa tự tuyên bố đáp ứng đầy đủ mọi quy định pháp luật chuyên ngành.",
  },
  {
    id: "dieu-khoan-2",
    number: "02",
    title: "Đăng ký & Quản lý tài khoản",
    icon: <UserOutlined className="text-[#0062ff]" />,
    paragraphs: [
      "Để sử dụng các tính năng dành riêng cho Ứng viên hoặc Nhà tuyển dụng, bạn cần đăng ký tài khoản với thông tin xác thực gồm: Họ và tên, địa chỉ Email, Số điện thoại và Mật khẩu (tối thiểu 8 ký tự).",
    ],
    bullets: [
      {
        label: "Phân loại vai trò:",
        text: "Người dùng lựa chọn vai trò Ứng viên hoặc Nhà tuyển dụng ngay khi đăng ký. Đối với tài khoản Nhà tuyển dụng, bạn có thể liên kết với công ty đã có trên hệ thống hoặc khởi tạo thông tin doanh nghiệp mới kèm mã số thuế.",
      },
      {
        label: "Bảo mật thông tin đăng nhập:",
        text: "Bạn có trách nhiệm tự bảo quản mật khẩu và phiên đăng nhập của mình. Khi phát hiện truy cập trái phép hoặc quên mật khẩu, bạn có thể sử dụng chức năng khôi phục mật khẩu qua email đã đăng ký.",
      },
      {
        label: "Tính chính xác của thông tin:",
        text: "Người dùng cam kết sử dụng thông tin liên hệ thật của bản thân hoặc tổ chức mà mình đại diện hợp pháp, không mạo danh cá nhân hay doanh nghiệp khác.",
      },
    ],
  },
  {
    id: "dieu-khoan-3",
    number: "03",
    title: "Trách nhiệm chung của Người dùng",
    icon: <CheckCircleOutlined className="text-[#0062ff]" />,
    paragraphs: [
      "Khi tham gia hệ thống CAREZA, tất cả người dùng cần tuân thủ nguyên tắc minh bạch, tôn trọng lẫn nhau và sử dụng nền tảng đúng mục đích kết nối việc làm.",
    ],
    bullets: [
      {
        text: "Không đăng tải nội dung sai sự thật, vi phạm thuần phong mỹ tục, phân biệt đối xử hoặc chứa mã độc gây ảnh hưởng đến hoạt động của hệ thống.",
      },
      {
        text: "Không sử dụng công cụ tự động (bot, script thu thập dữ liệu trái phép) để khai thác thông tin hồ sơ ứng viên, tin tuyển dụng hoặc can thiệp vào hệ thống bài kiểm tra năng lực.",
      },
      {
        text: "Không sử dụng thông tin liên hệ thu thập được từ CAREZA cho mục đích phát tán thư rác (spam), quảng cáo thương mại ngoài phạm vi tuyển dụng.",
      },
    ],
  },
  {
    id: "dieu-khoan-4",
    number: "04",
    title: "Quy định đăng tin & Tuyển dụng (Nhà tuyển dụng)",
    icon: <SolutionOutlined className="text-[#0062ff]" />,
    paragraphs: [
      "Nhà tuyển dụng được cung cấp công cụ quản lý hồ sơ công ty, đăng tin tuyển dụng, tạo bài kiểm tra năng lực (Assessment Test), theo dõi ứng viên trên bảng Kanban Pipeline và quản lý lịch phỏng vấn/thư mời nhận việc (Offer).",
    ],
    bullets: [
      {
        label: "Xác minh doanh nghiệp:",
        text: "Để tăng độ tin cậy và mở khóa các quyền hạn tuyển dụng, Nhà tuyển dụng cần cung cấp thông tin doanh nghiệp và tài liệu xác minh để Quản trị viên xét duyệt.",
      },
      {
        label: "Nội dung tin tuyển dụng:",
        text: "Thông tin vị trí, mô tả công việc, yêu cầu kỹ năng, mức lương và quyền lợi phải rõ ràng, trung thực với nhu cầu tuyển dụng thực tế của doanh nghiệp.",
      },
      {
        label: "Thanh toán & Gói dịch vụ:",
        text: "Đối với các đơn đăng ký gói dịch vụ trên hệ thống, trạng thái kích hoạt sẽ được cập nhật sau khi Quản trị viên kiểm tra và đối soát thông tin thanh toán.",
      },
    ],
  },
  {
    id: "dieu-khoan-5",
    number: "05",
    title: "Quy định ứng tuyển & Làm bài kiểm tra (Ứng viên)",
    icon: <FormOutlined className="text-[#0062ff]" />,
    paragraphs: [
      "Ứng viên có thể tạo hồ sơ chuyên môn, tải lên file CV, tìm kiếm việc làm, lưu tin quan tâm, nộp đơn ứng tuyển và tham gia bài kiểm tra năng lực trực tuyến.",
    ],
    bullets: [
      {
        label: "Hồ sơ & CV ứng tuyển:",
        text: "Ứng viên chịu trách nhiệm về tính xác thực của học vấn, kinh nghiệm làm việc, kỹ năng và các tài liệu đính kèm trong CV khi gửi đến Nhà tuyển dụng.",
      },
      {
        label: "Bài kiểm tra năng lực trực tuyến:",
        text: "Khi tham gia làm bài test do Nhà tuyển dụng yêu cầu, hệ thống hỗ trợ đếm ngược thời gian và tự động lưu tiến độ (autosave). Ứng viên cần tự thực hiện bài làm một cách trung thực trong thời gian quy định.",
      },
      {
        label: "Phản hồi tuyển dụng:",
        text: "Ứng viên chủ động theo dõi trạng thái hồ sơ, lịch hẹn phỏng vấn và phản hồi thư mời nhận việc (Offer) trên bảng điều khiển cá nhân.",
      },
    ],
  },
  {
    id: "dieu-khoan-6",
    number: "06",
    title: "Quy định sử dụng tính năng AI",
    icon: <RobotOutlined className="text-[#0062ff]" />,
    paragraphs: [
      "CAREZA tích hợp các công cụ trí tuệ nhân tạo (AI) bao gồm: tự động trích xuất thông tin CV (CV Parsing), chấm điểm và phân tích mức độ phù hợp giữa CV với công việc (AI Matching), gợi ý việc làm/ứng viên và trợ lý hỏi đáp cẩm nang nghề nghiệp (RAG).",
    ],
    bullets: [
      {
        label: "Tính chất tham khảo:",
        text: "Điểm số đánh giá độ phù hợp, nhận xét kỹ năng và nội dung tư vấn do AI sinh ra chỉ mang tính chất hỗ trợ tham khảo, giúp tiết kiệm thời gian sàng lọc ban đầu.",
      },
      {
        label: "Trách nhiệm rà soát:",
        text: "Người dùng cần kiểm tra lại thông tin CV sau khi AI trích xuất và không phụ thuộc hoàn toàn vào kết quả tự động. Quyết định ứng tuyển hay tuyển dụng cuối cùng thuộc về sự đánh giá trực tiếp của Ứng viên và Nhà tuyển dụng.",
      },
    ],
  },
  {
    id: "dieu-khoan-7",
    number: "07",
    title: "Xử lý vi phạm & Giới hạn trách nhiệm",
    icon: <WarningOutlined className="text-[#0062ff]" />,
    paragraphs: [
      "CAREZA đóng vai trò là nền tảng công nghệ trung gian hỗ trợ kết nối thông tin giữa Ứng viên và Nhà tuyển dụng.",
    ],
    bullets: [
      {
        label: "Biện pháp xử lý vi phạm:",
        text: "Quản trị viên có quyền từ chối xác minh doanh nghiệp, ẩn tin tuyển dụng không hợp lệ hoặc tạm khóa/ngừng kích hoạt tài khoản nếu phát hiện hành vi vi phạm điều khoản sử dụng.",
      },
      {
        label: "Giới hạn trách nhiệm:",
        text: "CAREZA không phải là một bên trong hợp đồng lao động giữa Ứng viên và Nhà tuyển dụng, do đó không chịu trách nhiệm trực tiếp đối với các thỏa thuận lương thưởng, điều kiện làm việc hoặc tranh chấp phát sinh bên ngoài nền tảng.",
      },
      {
        label: "Tính sẵn sàng của hệ thống:",
        text: "Hệ thống có thể tạm ngưng một số tính năng trong thời gian ngắn để bảo trì, nâng cấp hoặc khi dịch vụ AI bên thứ ba gặp sự cố kết nối ngoài ý muốn.",
      },
    ],
  },
];

const PRIVACY_SECTIONS: LegalSection[] = [
  {
    id: "chinh-sach-1",
    number: "01",
    title: "Dữ liệu hệ thống thu thập",
    icon: <DatabaseOutlined className="text-[#0062ff]" />,
    paragraphs: [
      "CAREZA chỉ thu thập các thông tin cần thiết mà người dùng chủ động cung cấp hoặc phát sinh trực tiếp trong quá trình sử dụng các chức năng trên hệ thống:",
    ],
    bullets: [
      {
        label: "Thông tin tài khoản:",
        text: "Họ và tên, địa chỉ Email, Số điện thoại, vai trò người dùng và mật khẩu (được mã hóa một chiều trên máy chủ).",
      },
      {
        label: "Hồ sơ Ứng viên:",
        text: "Thông tin giới thiệu bản thân, kỹ năng, học vấn, kinh nghiệm làm việc, file CV tải lên, lịch sử nộp đơn ứng tuyển, câu trả lời và điểm số bài kiểm tra năng lực.",
      },
      {
        label: "Hồ sơ Nhà tuyển dụng:",
        text: "Tên công ty, mã số thuế, địa chỉ, quy mô, mô tả doanh nghiệp, thông tin giấy phép xác minh, nội dung tin tuyển dụng và thông tin đơn đăng ký dịch vụ.",
      },
      {
        label: "Dữ liệu tương tác với công cụ AI:",
        text: "Nội dung văn bản trích xuất từ CV để phân tích độ phù hợp công việc và các câu hỏi gửi tới trợ lý tư vấn nghề nghiệp trên nền tảng.",
      },
    ],
  },
  {
    id: "chinh-sach-2",
    number: "02",
    title: "Mục đích sử dụng dữ liệu",
    icon: <AimOutlined className="text-[#0062ff]" />,
    paragraphs: [
      "Dữ liệu thu thập được sử dụng đúng theo nghiệp vụ vận hành của nền tảng CAREZA:",
    ],
    bullets: [
      {
        text: "Xác thực danh tính đăng nhập, phân quyền truy cập theo vai trò (Ứng viên, Nhà tuyển dụng, Quản trị viên) và hỗ trợ khôi phục mật khẩu.",
      },
      {
        text: "Xử lý quy trình ứng tuyển: chuyển hồ sơ CV, kết quả bài kiểm tra năng lực, lịch phỏng vấn và thư mời nhận việc giữa Ứng viên và Nhà tuyển dụng.",
      },
      {
        text: "Phân tích cấu trúc CV, tính toán mức độ tương thích với yêu cầu công việc (AI Matching) và gợi ý các vị trí việc làm hoặc ứng viên phù hợp.",
      },
      {
        text: "Hỗ trợ Quản trị viên kiểm duyệt hồ sơ doanh nghiệp, đối soát đơn thanh toán dịch vụ và gửi thông báo trạng thái trên hệ thống.",
      },
    ],
  },
  {
    id: "chinh-sach-3",
    number: "03",
    title: "Chia sẻ dữ liệu giữa Ứng viên & Nhà tuyển dụng",
    icon: <ShareAltOutlined className="text-[#0062ff]" />,
    paragraphs: [
      "Việc hiển thị và chia sẻ dữ liệu trên CAREZA tuân theo luồng tương tác nghiệp vụ giữa các vai trò:",
    ],
    bullets: [
      {
        label: "Khi Ứng viên nộp đơn ứng tuyển:",
        text: "Nhà tuyển dụng sở hữu tin tuyển dụng đó sẽ xem được thông tin hồ sơ, file CV đính kèm, kết quả bài kiểm tra năng lực (nếu có) và báo cáo phân tích độ phù hợp để đánh giá tuyển dụng.",
      },
      {
        label: "Thông tin Nhà tuyển dụng & Việc làm:",
        text: "Hồ sơ doanh nghiệp đã công bố và các tin tuyển dụng đang mở sẽ được hiển thị công khai để Ứng viên tra cứu, tìm kiếm và ứng tuyển.",
      },
      {
        label: "Kiểm duyệt nội bộ:",
        text: "Quản trị viên hệ thống có quyền xem xét thông tin xác minh doanh nghiệp, dữ liệu đơn hàng thanh toán và các báo cáo cần thiết để vận hành nền tảng.",
      },
      {
        label: "Không bán dữ liệu cá nhân:",
        text: "CAREZA không bán hoặc trao đổi danh sách thông tin liên hệ của người dùng cho các bên thứ ba phục vụ mục đích tiếp thị ngoài hệ thống.",
      },
    ],
  },
  {
    id: "chinh-sach-4",
    number: "04",
    title: "Lưu trữ & Bảo vệ thông tin",
    icon: <LockOutlined className="text-[#0062ff]" />,
    paragraphs: [
      "Hệ thống áp dụng các biện pháp kỹ thuật hiện có trong kiến trúc dự án để bảo vệ dữ liệu người dùng:",
    ],
    bullets: [
      {
        label: "Bảo mật xác thực:",
        text: "Mật khẩu tài khoản được băm (hash) trước khi lưu vào cơ sở dữ liệu PostgreSQL; phiên làm việc được kiểm soát thông qua mã thông báo JWT (JSON Web Token).",
      },
      {
        label: "Kiểm soát phân quyền:",
        text: "Các giao diện và API hệ thống kiểm tra quyền truy cập theo từng vai trò nhằm hạn chế việc người dùng truy cập trái phép vào dữ liệu quản lý của tài khoản khác.",
      },
      {
        label: "Lưu ý trung thực về hạ tầng:",
        text: "CAREZA hiện là hệ thống đang trong giai đoạn vận hành thử nghiệm và hoàn thiện, chưa tuyên bố đạt các chứng chỉ bảo mật quốc tế độc lập. Người dùng không nên tải lên các thông tin nhạy cảm ngoài phạm vi tuyển dụng (như mật khẩu ngân hàng, mã PIN hoặc bí mật tài chính cá nhân).",
      },
    ],
  },
  {
    id: "chinh-sach-5",
    number: "05",
    title: "Quyền và lựa chọn của Người dùng",
    icon: <SettingOutlined className="text-[#0062ff]" />,
    paragraphs: [
      "Trong quá trình sử dụng CAREZA, bạn có thể chủ động kiểm soát thông tin của mình thông qua các chức năng có sẵn trên giao diện:",
    ],
    bullets: [
      {
        label: "Xem và cập nhật thông tin:",
        text: "Bạn có thể chỉnh sửa thông tin cá nhân, cập nhật hồ sơ chuyên môn hoặc thông tin giới thiệu doanh nghiệp bất kỳ lúc nào trong trang quản lý tài khoản.",
      },
      {
        label: "Quản lý CV & Hồ sơ ứng tuyển:",
        text: "Ứng viên có thể tải lên CV mới, chọn CV mặc định hoặc xóa các bản CV không còn nhu cầu sử dụng trong danh sách quản lý CV.",
      },
      {
        label: "Đổi mật khẩu & Yêu cầu hỗ trợ:",
        text: "Người dùng có thể chủ động thay đổi mật khẩu hoặc liên hệ với quản trị viên khi cần hỗ trợ khóa tài khoản hoặc giải đáp thắc mắc về dữ liệu.",
      },
    ],
  },
  {
    id: "chinh-sach-6",
    number: "06",
    title: "Thông tin liên hệ & Hỗ trợ",
    icon: <CustomerServiceOutlined className="text-[#0062ff]" />,
    paragraphs: [
      "Nếu bạn có câu hỏi, góp ý về bản dự thảo Điều khoản sử dụng & Chính sách bảo mật hoặc cần hỗ trợ liên quan đến tài khoản trên CAREZA, vui lòng liên hệ với đội ngũ vận hành qua:",
    ],
    bullets: [
      {
        label: "Email hỗ trợ:",
        text: "contact@careza.vn",
      },
      {
        label: "Điện thoại liên hệ:",
        text: "(028) 7300 1234",
      },
      {
        label: "Kênh trực tuyến:",
        text: "Gửi yêu cầu trực tiếp qua cổng thông tin CAREZA trong giờ hành chính (Thứ Hai – Thứ Sáu).",
      },
    ],
  },
];

export function LegalPageView({ defaultTab = "terms" }: { defaultTab?: LegalTabKey }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const contentScrollRef = useRef<HTMLDivElement | null>(null);

  const getInitialTab = (): LegalTabKey => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "privacy" || tabParam === "chinh-sach") return "privacy";
    if (tabParam === "terms" || tabParam === "dieu-khoan") return "terms";
    if (pathname.startsWith("/chinh-sach")) return "privacy";
    return defaultTab;
  };

  const [activeTab, setActiveTab] = useState<LegalTabKey>(getInitialTab);
  const [activeSectionId, setActiveSectionId] = useState<string>(
    getInitialTab() === "terms" ? TERMS_SECTIONS[0].id : PRIVACY_SECTIONS[0].id
  );

  useEffect(() => {
    const tab = getInitialTab();
    setActiveTab(tab);
    setActiveSectionId(tab === "terms" ? TERMS_SECTIONS[0].id : PRIVACY_SECTIONS[0].id);
    if (contentScrollRef.current) {
      contentScrollRef.current.scrollTo({ top: 0 });
    }
  }, [searchParams, pathname]);

  const currentSections = activeTab === "terms" ? TERMS_SECTIONS : PRIVACY_SECTIONS;

  const handleTabChange = (tab: LegalTabKey) => {
    setActiveTab(tab);
    const firstId = tab === "terms" ? TERMS_SECTIONS[0].id : PRIVACY_SECTIONS[0].id;
    setActiveSectionId(firstId);
    if (contentScrollRef.current) {
      contentScrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    const targetUrl = tab === "terms" ? "/dieu-khoan?tab=terms" : "/dieu-khoan?tab=privacy";
    router.replace(targetUrl, { scroll: false });
  };

  const handleScrollToSection = (id: string) => {
    setActiveSectionId(id);
    const el = document.getElementById(id);
    if (!el) return;

    const container = contentScrollRef.current;
    if (container && window.innerWidth >= 1024) {
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const offsetTop = elRect.top - containerRect.top + container.scrollTop - 20;
      container.scrollTo({ top: Math.max(0, offsetTop), behavior: "smooth" });
    } else {
      const yOffset = -140;
      const y = el.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
    }
  };

  const handleContentScroll = () => {
    const container = contentScrollRef.current;
    if (!container || window.innerWidth < 1024) return;
    const containerTop = container.getBoundingClientRect().top;
    let currentId = currentSections[0]?.id;

    for (const sec of currentSections) {
      const el = document.getElementById(sec.id);
      if (el) {
        const topDiff = el.getBoundingClientRect().top - containerTop;
        if (topDiff <= 80) {
          currentId = sec.id;
        }
      }
    }
    if (currentId && currentId !== activeSectionId) {
      setActiveSectionId(currentId);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-[#f4f8ff] text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col">
      {/* =========================================================================
          1. HEADER CỐ ĐỊNH: NỀN TRẮNG, LOGO CAREZA CHUẨN & NÚT QUAY LẠI ĐĂNG KÝ
         ========================================================================= */}
      <header className="sticky top-0 lg:static z-30 shrink-0 bg-white border-b border-blue-100/90 shadow-[0_1px_8px_rgba(0,98,255,0.04)]">
        <div className="w-[94%] max-w-[1680px] mx-auto h-15 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center">
            <img
              src="/images/logos/010cd82d-47e5-4e32-86e1-2df16032be39.png"
              alt="Careza Logo"
              className="h-11 sm:h-12 w-auto object-contain"
            />
          </Link>

          <Link
            href="/dang-ky"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[13px] font-semibold text-[#0062ff] bg-[#eff6ff] hover:bg-blue-100/80 border border-blue-200/70 transition-colors"
          >
            <ArrowLeftOutlined className="text-[11px]" />
            <span>Quay lại đăng ký</span>
          </Link>
        </div>
      </header>

      {/* =========================================================================
          2. KHU VỰC TIÊU ĐỀ & TAB THU GỌN (CỐ ĐỊNH TRÊN DESKTOP, KHÔNG HỌA TIẾT THỪA)
         ========================================================================= */}
      <section className="shrink-0 pt-3 pb-2.5">
        <div className="w-[94%] max-w-[1680px] mx-auto">
          <div className="rounded-[15px] bg-white border border-blue-100/90 shadow-[0_2px_10px_rgba(15,23,42,0.03)] px-5 py-3.5 sm:px-6 sm:py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5">
            <div>
              <h1 className="text-xl sm:text-[22px] font-extrabold text-slate-900 tracking-tight leading-snug">
                Điều khoản & Chính sách
              </h1>
              <p className="mt-0.5 text-[13px] sm:text-[13.5px] text-slate-500 leading-relaxed">
                Quy định sử dụng tài khoản, các tính năng tuyển dụng – ứng tuyển và nguyên tắc bảo vệ dữ liệu người dùng trên nền tảng CAREZA.
              </p>
            </div>

            {/* Hai tab Điều khoản / Chính sách */}
            <div className="inline-flex p-1 rounded-xl bg-[#f1f6ff] border border-blue-100 w-full sm:w-auto shrink-0 gap-1">
              <button
                type="button"
                onClick={() => handleTabChange("terms")}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all cursor-pointer ${
                  activeTab === "terms"
                    ? "bg-[#0062ff] text-white shadow-xs"
                    : "text-slate-600 hover:text-[#0062ff] hover:bg-white/70"
                }`}
              >
                <FileTextOutlined className="text-[13px]" />
                <span>Điều khoản sử dụng</span>
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("privacy")}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all cursor-pointer ${
                  activeTab === "privacy"
                    ? "bg-[#0062ff] text-white shadow-xs"
                    : "text-slate-600 hover:text-[#0062ff] hover:bg-white/70"
                }`}
              >
                <SafetyCertificateOutlined className="text-[13px]" />
                <span>Chính sách bảo mật</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. BỐ CỤC 2 CỘT (25% MỤC LỤC TRÁI - 75% NỘI DUNG PHẢI, CUỘN ĐỘC LẬP DESKTOP)
         ========================================================================= */}
      <main className="flex-1 min-h-0 w-[94%] max-w-[1680px] mx-auto pb-4 pt-1 flex flex-col">
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* CỘT TRÁI (25% = 3/12 cột): MỤC LỤC CUỘN ĐỘC LẬP */}
          <aside className="lg:col-span-3 flex flex-col min-h-0 bg-white rounded-[15px] border border-blue-100/90 shadow-[0_2px_12px_rgba(15,23,42,0.03)] overflow-hidden">
            <div className="shrink-0 px-4 py-3 border-b border-blue-100/80 bg-[#f8fbff] flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-wider text-[#0062ff]">
                <FileTextOutlined />
                <span>Mục lục {activeTab === "terms" ? "Điều khoản" : "Bảo mật"}</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-400 bg-white px-2 py-0.5 rounded-md border border-blue-100/70">
                {currentSections.length} mục
              </span>
            </div>

            <nav className="flex-1 overflow-y-auto p-2.5 space-y-1">
              {currentSections.map((sec) => {
                const isActive = activeSectionId === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => handleScrollToSection(sec.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-[13px] leading-snug transition-all flex items-start gap-2.5 cursor-pointer border-l-[3px] ${
                      isActive
                        ? "bg-[#eff6ff] text-[#0062ff] font-bold border-[#0062ff]"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium border-transparent"
                    }`}
                  >
                    <span
                      className={`text-[11px] font-bold px-1.5 py-0.5 rounded mt-0.5 shrink-0 ${
                        isActive
                          ? "bg-blue-100 text-[#0062ff]"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {sec.number}
                    </span>
                    <span className="text-[13px] mt-0.5 shrink-0 opacity-85">
                      {sec.icon}
                    </span>
                    <span className="flex-1 mt-0.5">{sec.title}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* CỘT PHẢI (75% = 9/12 cột): NỘI DUNG CHI TIẾT CUỘN ĐỘC LẬP */}
          <div
            ref={contentScrollRef}
            onScroll={handleContentScroll}
            className="lg:col-span-9 min-h-0 bg-white rounded-[15px] border border-blue-100/90 shadow-[0_2px_12px_rgba(15,23,42,0.03)] lg:overflow-y-auto px-5 py-5 sm:px-8 sm:py-6"
          >
            {/* Thanh thông tin nhỏ gọn: Bản dự thảo rà soát nội bộ */}
            <div className="mb-5 px-3.5 py-2.5 rounded-xl bg-[#f4f8ff] border border-blue-100 flex items-center gap-2.5">
              <InfoCircleOutlined className="text-[#0062ff] text-sm shrink-0" />
              <p className="text-[12.5px] text-slate-600 leading-normal m-0">
                <span className="font-semibold text-slate-800">Bản dự thảo rà soát nội bộ: </span>
                Nội dung dưới đây được biên soạn dựa trên các chức năng thực tế đang triển khai trên hệ thống CAREZA nhằm phục vụ mục đích kiểm thử và hoàn thiện sản phẩm, không thay thế văn bản pháp lý chính thức.
              </p>
            </div>

            {/* Danh sách các mục nội dung */}
            <div className="divide-y divide-slate-200/75">
              {currentSections.map((section, idx) => (
                <section
                  key={section.id}
                  id={section.id}
                  onMouseEnter={() => setActiveSectionId(section.id)}
                  className={idx === 0 ? "pb-6" : "py-6 last:pb-2"}
                >
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-[#eff6ff] border border-blue-200/70 text-[11px] font-bold text-[#0062ff] tracking-wide">
                      MỤC {section.number}
                    </span>
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-[#eff6ff] text-[13px]">
                      {section.icon}
                    </span>
                    <h2 className="text-[16.5px] sm:text-[17.5px] font-bold text-slate-900 leading-snug m-0">
                      {section.title}
                    </h2>
                  </div>

                  {section.paragraphs && (
                    <div className="space-y-2.5 text-[14px] sm:text-[14.5px] text-slate-600 leading-[1.7]">
                      {section.paragraphs.map((p, pIdx) => (
                        <p key={pIdx} className="m-0">{p}</p>
                      ))}
                    </div>
                  )}

                  {section.bullets && (
                    <ul className="mt-3 space-y-2 text-[14px] sm:text-[14.5px] text-slate-600 leading-[1.7] list-none pl-0 mb-0">
                      {section.bullets.map((item, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0062ff] mt-2.5 shrink-0" />
                          <div>
                            {item.label && (
                              <span className="font-semibold text-slate-800 mr-1.5">
                                {item.label}
                              </span>
                            )}
                            <span>{item.text}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  {section.note && (
                    <div className="mt-3.5 px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200/75 text-[12.5px] text-slate-500 leading-relaxed">
                      {section.note}
                    </div>
                  )}
                </section>
              ))}
            </div>

            {/* Chân trang vùng đọc: Chuyển tab nhanh & Quay lại đăng ký */}
            <div className="mt-6 pt-5 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-[13px] text-slate-500">
                {activeTab === "terms" ? (
                  <>
                    Xem thêm:{" "}
                    <button
                      type="button"
                      onClick={() => handleTabChange("privacy")}
                      className="text-[#0062ff] font-semibold hover:underline cursor-pointer ml-1"
                    >
                      Chính sách bảo mật →
                    </button>
                  </>
                ) : (
                  <>
                    Xem thêm:{" "}
                    <button
                      type="button"
                      onClick={() => handleTabChange("terms")}
                      className="text-[#0062ff] font-semibold hover:underline cursor-pointer ml-1"
                    >
                      Điều khoản sử dụng →
                    </button>
                  </>
                )}
              </div>

              <Link
                href="/dang-ky"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-[#0062ff] hover:bg-[#0052d9] text-white text-[13px] font-semibold shadow-xs transition-all"
              >
                <ArrowLeftOutlined className="text-[11px]" />
                <span>Quay lại trang đăng ký</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function TermsAndPrivacyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fbff] flex items-center justify-center text-slate-500 text-sm">
          Đang tải nội dung...
        </div>
      }
    >
      <LegalPageView defaultTab="terms" />
    </Suspense>
  );
}

