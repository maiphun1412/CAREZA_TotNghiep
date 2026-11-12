"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { adminService } from "@/services/admin.service";
import {
  Dropdown,
  Modal,
  Form,
  Input,
  Select,
  Checkbox,
  App,
  Drawer,
  Radio,
  DatePicker,
  Tooltip,
} from "antd";
import {
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  SlidersHorizontal,
  Download,
  Plus,
  MoreHorizontal,
  X,
  Edit2,
  Mail,
  Lock,
  Unlock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Phone,
  Calendar,
  MapPin,
  FileText,
  Activity,
  StickyNote,
  Send,
  RefreshCw,
  Eye,
  Globe,
  User,
  ShieldCheck,
  Check,
  Layers,
  Users,
  Briefcase,
  Award,
  Sparkles,
  Info,
} from "lucide-react";

// Dữ liệu mẫu danh sách doanh nghiệp
interface CompanyItem {
  id: string;
  name: string;
  shortName: string;
  taxCode: string;
  industry: string;
  size: string;
  location: string;
  createdAt: string;
  status: "VERIFIED" | "PENDING" | "REJECTED";
  logo: string;
  foundedYear: number;
  website: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  representative: {
    name: string;
    position: string;
    email: string;
    phone: string;
    avatar?: string;
  };
  licenseDoc: {
    name: string;
    updatedAt: string;
    size: string;
    previewUrl: string;
  };
  verification: {
    company: boolean;
    companyDate?: string;
    email: boolean;
    emailDate?: string;
    phone: boolean;
    phoneDate?: string;
    license: boolean;
    licenseDate?: string;
  };
  notes: {
    admin: string;
    date: string;
    content: string;
  };
  images: string[];
  membersCount: number;
  jobsCount: number;
  branches: Array<{ name: string; address: string; phone: string }>;
  rejectReason?: string;
}

const INITIAL_COMPANIES: CompanyItem[] = [
  {
    id: "CPN_000001",
    name: "Công ty TNHH FPT Software",
    shortName: "FPT Software",
    taxCode: "0101243150",
    industry: "Công nghệ thông tin",
    size: "1.000 - 5.000",
    location: "Hà Nội",
    createdAt: "12/03/2024",
    status: "VERIFIED",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/FPT_logo_2010.svg/1200px-FPT_logo_2010.svg.png",
    foundedYear: 1999,
    website: "https://fptsoftware.com",
    email: "hr@fptsoftware.com",
    phone: "024 7300 7300",
    address: "Tòa nhà FPT, Duy Tân, Cầu Giấy, Hà Nội",
    description:
      "FPT Software là công ty thành viên của Tập đoàn FPT, chuyên cung cấp các giải pháp công nghệ toàn cầu, tiên phong chuyển đổi số cho hàng trăm tập đoàn Fortune 500.",
    representative: {
      name: "Nguyễn Văn A",
      position: "Tổng Giám đốc",
      email: "nguyenvana@fptsoftware.com",
      phone: "0901 234 567",
    },
    licenseDoc: {
      name: "Giấy phép kinh doanh.pdf",
      updatedAt: "12/03/2024",
      size: "2.4 MB",
      previewUrl:
        "https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=1200&q=85",
    },
    verification: {
      company: true,
      companyDate: "12/03/2024",
      email: true,
      emailDate: "12/03/2024",
      phone: true,
      phoneDate: "12/03/2024",
      license: true,
      licenseDate: "12/03/2024",
    },
    notes: {
      admin: "Admin",
      date: "12/03/2024 10:24",
      content: "Doanh nghiệp uy tín, hồ sơ đầy đủ. Đã xác minh thành công.",
    },
    images: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&h=500&q=85",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&h=500&q=85",
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&h=500&q=85",
      "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&h=500&q=85",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&h=500&q=85",
    ],
    membersCount: 12,
    jobsCount: 48,
    branches: [
      { name: "Trụ sở Hà Nội", address: "Tòa nhà FPT, Phố Duy Tân, Cầu Giấy, Hà Nội", phone: "024 7300 7300" },
      { name: "F-Ville Hòa Lạc", address: "Khu Công nghệ cao Hòa Lạc, Thạch Thất, Hà Nội", phone: "024 7300 7301" },
      { name: "F-Town TP.HCM", address: "Khu Công nghệ cao, TP. Thủ Đức, TP. Hồ Chí Minh", phone: "028 7300 7300" },
      { name: "FPT Complex Đà Nẵng", address: "Đường Nam Kỳ Khởi Nghĩa, Ngũ Hành Sơn, Đà Nẵng", phone: "0236 730 0730" },
    ],
  },
  {
    id: "CPN_000002",
    name: "Tập đoàn Công nghiệp - Viễn thông Quân đội",
    shortName: "Viettel Group",
    taxCode: "0100109106",
    industry: "Viễn thông",
    size: "> 10.000",
    location: "Hà Nội",
    createdAt: "05/03/2024",
    status: "VERIFIED",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Viettel_logo_2021.svg/1200px-Viettel_logo_2021.svg.png",
    foundedYear: 1989,
    website: "https://viettel.com.vn",
    email: "tuyendung@viettel.com.vn",
    phone: "1800 8098",
    address: "Số 01 Giang Văn Minh, Ba Đình, Hà Nội",
    description: "Tập đoàn công nghệ viễn thông hàng đầu Việt Nam và khu vực, hiện diện tại 11 quốc gia trên toàn cầu.",
    representative: {
      name: "Tào Đức Thắng",
      position: "Chủ tịch kiêm TGĐ",
      email: "thangtd@viettel.com.vn",
      phone: "0988 888 999",
    },
    licenseDoc: {
      name: "Giay_phep_DKKD_Viettel.pdf",
      updatedAt: "05/03/2024",
      size: "3.5 MB",
      previewUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=85",
    },
    verification: {
      company: true,
      companyDate: "05/03/2024",
      email: true,
      emailDate: "05/03/2024",
      phone: true,
      phoneDate: "05/03/2024",
      license: true,
      licenseDate: "05/03/2024",
    },
    notes: {
      admin: "Admin",
      date: "05/03/2024 14:10",
      content: "Doanh nghiệp nhà nước quy mô đặc biệt lớn, hồ sơ xác thực pháp nhân chuẩn hóa.",
    },
    images: [
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&h=500&q=85",
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&h=500&q=85",
    ],
    membersCount: 35,
    jobsCount: 120,
    branches: [
      { name: "Tòa nhà Viettel Hà Nội", address: "Số 1 Trần Hữu Dực, Nam Từ Liêm, Hà Nội", phone: "024 6255 6789" },
    ],
  },
  {
    id: "CPN_000003",
    name: "Ngân hàng TMCP Kỹ Thương Việt Nam",
    shortName: "Techcombank",
    taxCode: "0100230800",
    industry: "Ngân hàng",
    size: "5.000 - 10.000",
    location: "Hà Nội",
    createdAt: "28/02/2024",
    status: "VERIFIED",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Techcombank_logo.png/1200px-Techcombank_logo.png",
    foundedYear: 1993,
    website: "https://techcombank.com",
    email: "hr.techcombank@tcb.com.vn",
    phone: "024 3944 6368",
    address: "Số 6 Quang Trung, Hoàn Kiếm, Hà Nội",
    description: "Ngân hàng dẫn đầu về giải pháp tài chính và ngân hàng số tại Việt Nam.",
    representative: {
      name: "Jens Lottner",
      position: "Tổng Giám đốc",
      email: "lottnerj@tcb.com.vn",
      phone: "0903 112 233",
    },
    licenseDoc: {
      name: "GP_HoatDong_NHNN_TCB.pdf",
      updatedAt: "28/02/2024",
      size: "4.1 MB",
      previewUrl: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=1200&q=85",
    },
    verification: {
      company: true,
      companyDate: "28/02/2024",
      email: true,
      emailDate: "28/02/2024",
      phone: true,
      phoneDate: "28/02/2024",
      license: true,
      licenseDate: "28/02/2024",
    },
    notes: {
      admin: "Admin",
      date: "28/02/2024 16:20",
      content: "Đã nạp gói tuyển dụng Doanh nghiệp Ưu tiên, xác minh hoàn tất.",
    },
    images: [
      "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&h=500&q=85",
    ],
    membersCount: 18,
    jobsCount: 65,
    branches: [
      { name: "Hội sở chính", address: "Số 6 Quang Trung, Hoàn Kiếm, Hà Nội", phone: "024 3944 6368" },
    ],
  },
  {
    id: "CPN_000004",
    name: "Tập đoàn Vingroup - Công ty CP",
    shortName: "VinGroup",
    taxCode: "0101245486",
    industry: "Đa ngành",
    size: "> 10.000",
    location: "Hà Nội",
    createdAt: "20/02/2024",
    status: "VERIFIED",
    logo: "https://upload.wikimedia.org/wikipedia/vi/thumb/9/91/Vingroup_logo.svg/1200px-Vingroup_logo.svg.png",
    foundedYear: 1993,
    website: "https://vingroup.net",
    email: "tuyendung@vingroup.net",
    phone: "024 3974 9999",
    address: "Số 7 Đường Bằng Lăng 1, Vinhomes Riverside, Long Biên, Hà Nội",
    description: "Tập đoàn kinh tế tư nhân đa ngành hàng đầu Việt Nam hoạt động trong lĩnh vực Công nghệ - Công nghiệp, Thương mại Dịch vụ.",
    representative: {
      name: "Nguyễn Việt Quang",
      position: "Phó Chủ tịch kiêm TGĐ",
      email: "quangnv@vingroup.net",
      phone: "0912 345 678",
    },
    licenseDoc: {
      name: "GP_KinhDoanh_Vingroup.pdf",
      updatedAt: "20/02/2024",
      size: "2.8 MB",
      previewUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=85",
    },
    verification: {
      company: true,
      companyDate: "20/02/2024",
      email: true,
      emailDate: "20/02/2024",
      phone: true,
      phoneDate: "20/02/2024",
      license: true,
      licenseDate: "20/02/2024",
    },
    notes: {
      admin: "Admin",
      date: "20/02/2024 09:15",
      content: "Đã phê duyệt giấy tờ kinh doanh hợp lệ.",
    },
    images: [
      "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&h=500&q=85",
    ],
    membersCount: 42,
    jobsCount: 156,
    branches: [
      { name: "Trụ sở Vinhomes Riverside", address: "Khu đô thị sinh thái Vinhomes Riverside, Long Biên, Hà Nội", phone: "024 3974 9999" },
    ],
  },
  {
    id: "CPN_000005",
    name: "Công ty Cổ phần Tiki",
    shortName: "Tiki Corporation",
    taxCode: "0312345678",
    industry: "Thương mại điện tử",
    size: "1.000 - 5.000",
    location: "TP. HCM",
    createdAt: "15/02/2024",
    status: "PENDING",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Tiki_logo.svg/1200px-Tiki_logo.svg.png",
    foundedYear: 2010,
    website: "https://tiki.vn",
    email: "careers@tiki.vn",
    phone: "1900 6035",
    address: "Tòa nhà Viettel Complex, 285 Cách Mạng Tháng Tám, Quận 10, TP.HCM",
    description: "Sàn thương mại điện tử đáng tin cậy với hệ thống logistic TikiNOW giao hàng siêu tốc.",
    representative: {
      name: "Trần Ngọc Thái Sơn",
      position: "Nhà sáng lập",
      email: "sontran@tiki.vn",
      phone: "0908 999 888",
    },
    licenseDoc: {
      name: "Ban_sao_GPKD_Tiki_2024.pdf",
      updatedAt: "15/02/2024",
      size: "2.1 MB",
      previewUrl: "https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=1200&q=85",
    },
    verification: {
      company: false,
      email: true,
      emailDate: "15/02/2024",
      phone: true,
      phoneDate: "15/02/2024",
      license: false,
    },
    notes: {
      admin: "Admin",
      date: "15/02/2024 11:30",
      content: "Đang chờ đối soát bản sao công chứng giấy phép kinh doanh mới cập nhật.",
    },
    images: [
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&h=500&q=85",
    ],
    membersCount: 8,
    jobsCount: 19,
    branches: [
      { name: "Văn phòng TP.HCM", address: "285 Cách Mạng Tháng 8, Phường 12, Quận 10, TP.HCM", phone: "1900 6035" },
    ],
  },
  {
    id: "CPN_000006",
    name: "Công ty Cổ phần Dịch vụ Di động Trực tuyến",
    shortName: "MoMo",
    taxCode: "0313456789",
    industry: "Công nghệ tài chính",
    size: "1.000 - 5.000",
    location: "TP. HCM",
    createdAt: "10/02/2024",
    status: "VERIFIED",
    logo: "https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png",
    foundedYear: 2007,
    website: "https://momo.vn",
    email: "talent@mservice.com.vn",
    phone: "028 5414 7667",
    address: "Lầu 5, Tòa nhà Phú Mỹ Hưng, Hoàng Văn Thái, Tân Phú, Quận 7, TP.HCM",
    description: "Kỳ lân fintech hàng đầu Việt Nam, cung cấp siêu ứng dụng thanh toán và tài chính toàn diện cho hàng chục triệu người dùng.",
    representative: {
      name: "Nguyễn Bá Diệp",
      position: "Đồng sáng lập",
      email: "diepnb@mservice.com.vn",
      phone: "0903 777 666",
    },
    licenseDoc: {
      name: "GP_TrungGianThanhToan_NHNN.pdf",
      updatedAt: "10/02/2024",
      size: "3.2 MB",
      previewUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=85",
    },
    verification: {
      company: true,
      companyDate: "10/02/2024",
      email: true,
      emailDate: "10/02/2024",
      phone: true,
      phoneDate: "10/02/2024",
      license: true,
      licenseDate: "10/02/2024",
    },
    notes: {
      admin: "Admin",
      date: "10/02/2024 15:45",
      content: "Doanh nghiệp Fintech đã xác thực giấy phép trung gian thanh toán.",
    },
    images: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&h=500&q=85",
    ],
    membersCount: 15,
    jobsCount: 32,
    branches: [
      { name: "Trụ sở Quận 7", address: "Tòa nhà MService, Tân Phú, Quận 7, TP.HCM", phone: "028 5414 7667" },
    ],
  },
  {
    id: "CPN_000007",
    name: "Công ty TNHH Shopee Việt Nam",
    shortName: "Shopee Việt Nam",
    taxCode: "0314567890",
    industry: "Thương mại điện tử",
    size: "5.000 - 10.000",
    location: "TP. HCM",
    createdAt: "01/02/2024",
    status: "VERIFIED",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Shopee_logo.svg/1200px-Shopee_logo.svg.png",
    foundedYear: 2015,
    website: "https://careers.shopee.vn",
    email: "recruitment@shopee.vn",
    phone: "1900 1221",
    address: "Tòa nhà Saigon Centre, 67 Lê Lợi, Bến Nghé, Quận 1, TP.HCM",
    description: "Nền tảng thương mại điện tử hàng đầu tại Đông Nam Á và Đài Loan.",
    representative: {
      name: "Trần Tuấn Anh",
      position: "Giám đốc Điều hành",
      email: "tuananhtran@shopee.vn",
      phone: "0909 333 222",
    },
    licenseDoc: {
      name: "Shopee_VN_Business_License.pdf",
      updatedAt: "01/02/2024",
      size: "2.9 MB",
      previewUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=85",
    },
    verification: {
      company: true,
      companyDate: "01/02/2024",
      email: true,
      emailDate: "01/02/2024",
      phone: true,
      phoneDate: "01/02/2024",
      license: true,
      licenseDate: "01/02/2024",
    },
    notes: {
      admin: "Admin",
      date: "01/02/2024 10:00",
      content: "Xác minh tài khoản Shopee Việt Nam thành công.",
    },
    images: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&h=500&q=85",
    ],
    membersCount: 22,
    jobsCount: 78,
    branches: [
      { name: "Văn phòng Saigon Centre", address: "Tầng 17 Saigon Centre 2, Quận 1, TP.HCM", phone: "1900 1221" },
    ],
  },
  {
    id: "CPN_000008",
    name: "Công ty TNHH Microsoft Việt Nam",
    shortName: "Microsoft Việt Nam",
    taxCode: "0109876543",
    industry: "Công nghệ thông tin",
    size: "1.000 - 5.000",
    location: "Hà Nội",
    createdAt: "28/01/2024",
    status: "REJECTED",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/1200px-Microsoft_logo.svg.png",
    foundedYear: 2006,
    website: "https://microsoft.com/vi-vn",
    email: "vncontact@microsoft.com",
    phone: "024 3926 3000",
    address: "Tầng 12, Tòa nhà Capital Tower, 109 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội",
    description: "Chi nhánh của tập đoàn công nghệ Microsoft toàn cầu tại Việt Nam.",
    representative: {
      name: "Nguyễn Quỳnh Trâm",
      position: "Tổng Giám đốc",
      email: "tramnguyen@microsoft.com",
      phone: "0918 222 111",
    },
    licenseDoc: {
      name: "GPKD_Chua_Chung_Thuc.pdf",
      updatedAt: "28/01/2024",
      size: "1.2 MB",
      previewUrl: "https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=1200&q=85",
    },
    verification: {
      company: false,
      email: true,
      emailDate: "28/01/2024",
      phone: false,
      license: false,
    },
    notes: {
      admin: "Admin",
      date: "28/01/2024 16:00",
      content: "Giấy phép kinh doanh tải lên bị mờ, thiếu dấu mộc đỏ giáp lai hợp lệ. Đã gửi yêu cầu tải lại.",
    },
    images: [
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&h=500&q=85",
    ],
    membersCount: 4,
    jobsCount: 0,
    branches: [
      { name: "Văn phòng Hà Nội", address: "109 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội", phone: "024 3926 3000" },
    ],
    rejectReason: "Bản sao scan giấy phép kinh doanh mờ, không nhận diện được mã số thuế và con dấu pháp nhân.",
  },
  {
    id: "CPN_000009",
    name: "Công ty TNHH Samsung Electronics Việt Nam",
    shortName: "Samsung Electronics",
    taxCode: "0315678901",
    industry: "Điện tử",
    size: "> 10.000",
    location: "TP. HCM",
    createdAt: "20/01/2024",
    status: "VERIFIED",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/1200px-Samsung_Logo.svg.png",
    foundedYear: 2008,
    website: "https://samsung.com/vn",
    email: "tuyendung.sehc@samsung.com",
    phone: "028 3715 8888",
    address: "Khu Công Nghệ Cao, Đường D1, Long Thạnh Mỹ, TP. Thủ Đức, TP.HCM",
    description: "Nhà sản xuất thiết bị điện tử, điện thoại thông minh và thiết bị gia dụng hàng đầu thế giới.",
    representative: {
      name: "Choi Joo Ho",
      position: "Tổng Giám đốc",
      email: "jooho.choi@samsung.com",
      phone: "0901 888 777",
    },
    licenseDoc: {
      name: "Samsung_Investment_Certificate.pdf",
      updatedAt: "20/01/2024",
      size: "5.4 MB",
      previewUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=85",
    },
    verification: {
      company: true,
      companyDate: "20/01/2024",
      email: true,
      emailDate: "20/01/2024",
      phone: true,
      phoneDate: "20/01/2024",
      license: true,
      licenseDate: "20/01/2024",
    },
    notes: {
      admin: "Admin",
      date: "20/01/2024 14:30",
      content: "Tập đoàn công nghệ điện tử FDI lớn nhất Việt Nam, hồ sơ xác thực chuẩn mực.",
    },
    images: [
      "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&h=500&q=85",
    ],
    membersCount: 29,
    jobsCount: 88,
    branches: [
      { name: "Tổ hợp SEHC TP.HCM", address: "Khu Công Nghệ Cao, TP. Thủ Đức, TP.HCM", phone: "028 3715 8888" },
      { name: "Samsung Thái Nguyên (SEVT)", address: "KCN Yên Bình, Phổ Yên, Thái Nguyên", phone: "0208 357 8888" },
    ],
  },
  {
    id: "CPN_000010",
    name: "Công ty TNHH Grab Việt Nam",
    shortName: "Grab Việt Nam",
    taxCode: "0316789012",
    industry: "Công nghệ",
    size: "1.000 - 5.000",
    location: "TP. HCM",
    createdAt: "15/01/2024",
    status: "PENDING",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Grab_Logo.svg/1200px-Grab_Logo.svg.png",
    foundedYear: 2014,
    website: "https://grab.com/vn",
    email: "careers.vn@grab.com",
    phone: "028 7108 7108",
    address: "Tòa nhà Mapletree Business Centre, 1060 Nguyễn Văn Linh, Tân Phong, Quận 7, TP.HCM",
    description: "Siêu ứng dụng hàng đầu Đông Nam Á cung cấp dịch vụ gọi xe, giao thức ăn và thanh toán không dùng tiền mặt.",
    representative: {
      name: "Alejandro Osorio",
      position: "Giám đốc Điều hành",
      email: "alejandro@grab.com",
      phone: "0908 123 456",
    },
    licenseDoc: {
      name: "Grab_GPKD_Bo_Sung.pdf",
      updatedAt: "15/01/2024",
      size: "3.1 MB",
      previewUrl: "https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=1200&q=85",
    },
    verification: {
      company: false,
      email: true,
      emailDate: "15/01/2024",
      phone: true,
      phoneDate: "15/01/2024",
      license: false,
    },
    notes: {
      admin: "Admin",
      date: "15/01/2024 16:15",
      content: "Đang chờ nộp bổ sung giấy ủy quyền người đại diện pháp luật mới nhất.",
    },
    images: [
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&h=500&q=85",
    ],
    membersCount: 11,
    jobsCount: 24,
    branches: [
      { name: "Văn phòng Quận 7", address: "1060 Nguyễn Văn Linh, Quận 7, TP.HCM", phone: "028 7108 7108" },
    ],
  },
];

function AdminCompaniesContent() {
  const { message, modal } = App.useApp();

  // Map backend company sang kiểu CompanyItem
  const mapBackendCompany = (c: any): CompanyItem => {
    const isVer = c.verification_status === "verified";
    const isPending = c.verification_status === "pending";
    const rep = c.representative || {};
    return {
      id: String(c.id),
      name: c.name,
      shortName: c.name,
      taxCode: c.tax_code || "—",
      industry: c.industry_name || "Đa ngành",
      size: c.company_size || "50 - 100",
      location: c.city || "Toàn quốc",
      createdAt: c.created_at ? new Date(c.created_at).toLocaleDateString("vi-VN") : "—",
      status: isVer ? "VERIFIED" : isPending ? "PENDING" : "REJECTED",
      logo:
        c.logo_url ||
        "https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=400&q=80",
      foundedYear: 2020,
      website: c.website || "—",
      email: c.email || rep.email || "—",
      phone: c.phone || rep.phone || "—",
      address: c.address || "Việt Nam",
      description: c.description || "",
      representative: {
        name: rep.name || "Đại diện pháp luật",
        position: rep.role || "Giám đốc",
        email: c.email || rep.email || "",
        phone: c.phone || rep.phone || "",
      },
      licenseDoc: {
        name: c.document_url ? String(c.document_url).split("/").pop() || "Giay_phep_kinh_doanh.pdf" : "Giay_phep_kinh_doanh.pdf",
        updatedAt: c.created_at ? new Date(c.created_at).toLocaleDateString("vi-VN") : "Gần đây",
        size: "PDF",
        previewUrl:
          c.document_url ||
          "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=85",
      },
      verification: {
        company: isVer,
        companyDate: isVer ? "Đã duyệt" : undefined,
        email: true,
        emailDate: "Đã xác thực",
        phone: true,
        phoneDate: "Đã xác thực",
        license: isVer,
        licenseDate: isVer ? "Đã duyệt" : undefined,
      },
      notes: {
        admin: "Admin",
        date: "Hôm nay",
        content:
          c.verification_notes ||
          (isVer
            ? "Doanh nghiệp đã được xác thực giấy phép."
            : isPending
              ? "Đang chờ admin xét duyệt hồ sơ."
              : "Hồ sơ chưa đạt yêu cầu."),
      },
      images: [],
      membersCount: c.members_count || 1,
      jobsCount: c.jobs_count || 0,
      branches: (c.branches || []).map((b: any) => ({
        name: b.name || "Chi nhánh",
        address: b.address || "",
        phone: c.phone || rep.phone || "—",
      })),
    };
  };

  // Danh sách công ty
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<CompanyItem>(null as unknown as CompanyItem);
  const [companySummary, setCompanySummary] = useState({
    total_companies: 0,
    verified_count: 0,
    pending_count: 0,
    rejected_count: 0,
  });
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(true);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);

  // Tabs danh mục: Tất cả | Đã xác minh | Chờ xác minh | Bị từ chối
  const [activeTab, setActiveTab] = useState<"ALL" | "VERIFIED" | "PENDING" | "REJECTED">("ALL");

  // Bộ lọc cơ bản
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState("ALL");
  const [sizeFilter, setSizeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [locationFilter, setLocationFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");

  // Nạp danh sách doanh nghiệp từ API
  const fetchCompanies = useCallback(async () => {
    setIsLoadingCompanies(true);
    try {
      const statusParam =
        activeTab === "VERIFIED"
          ? "verified"
          : activeTab === "PENDING"
            ? "pending"
            : activeTab === "REJECTED"
              ? "rejected"
              : undefined;
      const res = await adminService.getCompanies({
        search: searchQuery || undefined,
        status: statusParam,
        page_size: 100,
      });
      if (res?.data?.summary) {
        setCompanySummary(res.data.summary);
      }
      if (res?.data?.items) {
        const mapped = res.data.items.map(mapBackendCompany);
        setCompanies(mapped);
        setSelectedCompany((prev) => {
          if (mapped.length === 0) return null as unknown as CompanyItem;
          if (!prev) return mapped[0];
          const found = mapped.find((m: any) => m.id === prev.id);
          return found || mapped[0];
        });
      }
    } catch (err) {
      console.warn("Lỗi nạp danh sách công ty từ backend:", err);
    } finally {
      setIsLoadingCompanies(false);
    }
  }, [activeTab, searchQuery]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // Tab trong panel chi tiết bên phải
  const [panelTab, setPanelTab] = useState<
    "overview" | "branches" | "members" | "jobs" | "services" | "history"
  >("overview");

  // Bộ lọc nâng cao Drawer
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [advFilters, setAdvFilters] = useState({
    industry: "ALL",
    size: "ALL",
    status: "ALL",
    location: "ALL",
    foundedFrom: "",
    foundedTo: "",
    hasJobs: "ALL",
  });
  const [appliedAdvFilters, setAppliedAdvFilters] = useState({ ...advFilters });

  // Selected Checkboxes
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  // Gallery hình ảnh trong panel
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Modal xem giấy phép kinh doanh lớn
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

  // Modal xem ảnh gallery lớn
  const [isPreviewImageOpen, setIsPreviewImageOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState("");

  // Modal Thêm doanh nghiệp mới
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm] = Form.useForm();

  // Modal Xuất dữ liệu
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportScope, setExportScope] = useState<"all" | "filtered" | "selected">("filtered");
  const [exportFormat, setExportFormat] = useState<"xlsx" | "csv">("xlsx");

  // Modal Gửi thông báo
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [notifyTargetCompany, setNotifyTargetCompany] = useState<CompanyItem | null>(null);
  const [notifyForm] = Form.useForm();

  // Modal Từ chối xác minh (phải nhập lý do)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectingCompany, setRejectingCompany] = useState<CompanyItem | null>(null);
  const [rejectForm] = Form.useForm();

  // Modal Chỉnh sửa thông tin doanh nghiệp
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm] = Form.useForm();

  // Đếm số bộ lọc nâng cao đang áp dụng
  const activeAdvFilterCount = useMemo(() => {
    let count = 0;
    if (appliedAdvFilters.industry !== "ALL") count++;
    if (appliedAdvFilters.size !== "ALL") count++;
    if (appliedAdvFilters.status !== "ALL") count++;
    if (appliedAdvFilters.location !== "ALL") count++;
    if (appliedAdvFilters.foundedFrom) count++;
    if (appliedAdvFilters.foundedTo) count++;
    if (appliedAdvFilters.hasJobs !== "ALL") count++;
    return count;
  }, [appliedAdvFilters]);

  // Lọc dữ liệu danh sách
  const filteredCompanies = useMemo(() => {
    let result = [...companies];

    // 1. Lọc theo tab chính
    if (activeTab !== "ALL") {
      result = result.filter((c) => c.status === activeTab);
    }

    // 2. Lọc theo search input (Tên, MST, Email)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.shortName.toLowerCase().includes(q) ||
          c.taxCode.includes(q) ||
          c.email.toLowerCase().includes(q)
      );
    }

    // 3. Lọc theo ngành nghề
    if (industryFilter !== "ALL") {
      result = result.filter((c) => c.industry === industryFilter);
    }

    // 4. Lọc theo quy mô
    if (sizeFilter !== "ALL") {
      result = result.filter((c) => c.size === sizeFilter);
    }

    // 5. Lọc theo trạng thái dropdown
    if (statusFilter !== "ALL") {
      result = result.filter((c) => c.status === statusFilter);
    }

    // 6. Lọc theo khu vực
    if (locationFilter !== "ALL") {
      result = result.filter((c) => c.location === locationFilter);
    }

    // 7. Lọc theo thời gian
    if (dateFilter === "TODAY") {
      const todayStr = new Date().toLocaleDateString("vi-VN");
      result = result.filter((c) => c.createdAt === todayStr || c.createdAt === "Vừa xong");
    } else if (dateFilter === "7DAYS") {
      const nowMs = Date.now();
      result = result.filter((c) => {
        if (c.createdAt === "Vừa xong") return true;
        const parts = c.createdAt.split("/");
        if (parts.length === 3) {
          const dt = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])).getTime();
          return !isNaN(dt) && nowMs - dt <= 7 * 24 * 3600 * 1000;
        }
        return true;
      });
    }

    // 8. Lọc theo bộ lọc nâng cao
    if (appliedAdvFilters.industry !== "ALL") {
      result = result.filter((c) => c.industry === appliedAdvFilters.industry);
    }
    if (appliedAdvFilters.size !== "ALL") {
      result = result.filter((c) => c.size === appliedAdvFilters.size);
    }
    if (appliedAdvFilters.status !== "ALL") {
      result = result.filter((c) => c.status === appliedAdvFilters.status);
    }
    if (appliedAdvFilters.location !== "ALL") {
      result = result.filter((c) => c.location === appliedAdvFilters.location);
    }
    if (appliedAdvFilters.foundedFrom) {
      result = result.filter((c) => c.foundedYear >= parseInt(appliedAdvFilters.foundedFrom));
    }
    if (appliedAdvFilters.foundedTo) {
      result = result.filter((c) => c.foundedYear <= parseInt(appliedAdvFilters.foundedTo));
    }
    if (appliedAdvFilters.hasJobs === "YES") {
      result = result.filter((c) => c.jobsCount > 0);
    } else if (appliedAdvFilters.hasJobs === "NO") {
      result = result.filter((c) => c.jobsCount === 0);
    }

    return result;
  }, [
    companies,
    activeTab,
    searchQuery,
    industryFilter,
    sizeFilter,
    statusFilter,
    locationFilter,
    dateFilter,
    appliedAdvFilters,
  ]);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const paginatedCompanies = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCompanies.slice(start, start + pageSize);
  }, [filteredCompanies, currentPage, pageSize]);

  // Checkbox chọn tất cả
  const isAllSelected =
    paginatedCompanies.length > 0 &&
    paginatedCompanies.every((c) => selectedRowKeys.includes(c.id));

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pageKeys = paginatedCompanies.map((c) => c.id);
      setSelectedRowKeys(Array.from(new Set([...selectedRowKeys, ...pageKeys])));
    } else {
      const pageKeys = new Set(paginatedCompanies.map((c) => c.id));
      setSelectedRowKeys(selectedRowKeys.filter((id) => !pageKeys.has(id)));
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRowKeys([...selectedRowKeys, id]);
    } else {
      setSelectedRowKeys(selectedRowKeys.filter((k) => k !== id));
    }
  };

  // Thao tác Duyệt xác minh (cần Confirm modal)
  const handleApproveCompany = (company: CompanyItem) => {
    modal.confirm({
      title: "Xác nhận duyệt doanh nghiệp?",
      content: `Bạn có chắc chắn muốn phê duyệt xác minh pháp nhân cho "${company.name}" (MST: ${company.taxCode})? Sau khi duyệt, doanh nghiệp sẽ được cấp đầy đủ quyền đăng tin và sử dụng dịch vụ trên hệ thống CAREZA.`,
      okText: "Phê duyệt ngay",
      cancelText: "Hủy bỏ",
      okType: "primary",
      onOk: async () => {
        try {
          await adminService.verifyCompany(company.id, "approve");
          setCompanies((prev) =>
            prev.map((c) =>
              c.id === company.id
                ? {
                  ...c,
                  status: "VERIFIED",
                  verification: {
                    company: true,
                    companyDate: "Vừa xong",
                    email: true,
                    emailDate: c.verification.emailDate || "Vừa xong",
                    phone: true,
                    phoneDate: c.verification.phoneDate || "Vừa xong",
                    license: true,
                    licenseDate: "Vừa xong",
                  },
                }
                : c
            )
          );
          if (selectedCompany?.id === company.id) {
            setSelectedCompany((prev) => ({
              ...prev,
              status: "VERIFIED",
              verification: {
                company: true,
                companyDate: "Vừa xong",
                email: true,
                emailDate: prev.verification.emailDate || "Vừa xong",
                phone: true,
                phoneDate: prev.verification.phoneDate || "Vừa xong",
                license: true,
                licenseDate: "Vừa xong",
              },
            }));
          }
          message.success(`Đã phê duyệt xác minh thành công cho ${company.shortName}!`);
        } catch (err: any) {
          message.error(err?.response?.data?.message || "Phê duyệt doanh nghiệp thất bại.");
        }
      },
    });
  };

  // Mở modal từ chối xác minh (bắt buộc nhập lý do)
  const openRejectModal = (company: CompanyItem) => {
    setRejectingCompany(company);
    rejectForm.resetFields();
    rejectForm.setFieldsValue({
      reason: "",
      feedback: "Hồ sơ giấy phép kinh doanh chưa đạt yêu cầu theo quy định xác thực của CAREZA.",
    });
    setIsRejectModalOpen(true);
  };

  // Xử lý gửi Từ chối
  const handleRejectSubmit = async (values: any) => {
    if (!rejectingCompany) return;
    const reasonText = values.reason.trim();
    try {
      await adminService.verifyCompany(rejectingCompany.id, "reject", reasonText);
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === rejectingCompany.id
            ? {
              ...c,
              status: "REJECTED",
              rejectReason: reasonText,
            }
            : c
        )
      );
      if (selectedCompany?.id === rejectingCompany.id) {
        setSelectedCompany((prev) => ({
          ...prev,
          status: "REJECTED",
          rejectReason: reasonText,
        }));
      }
      setIsRejectModalOpen(false);
      message.warning(`Đã từ chối xác minh hồ sơ của ${rejectingCompany.shortName}.`);
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Từ chối xác minh thất bại.");
    }
  };

  // Mở modal gửi thông báo
  const openNotifyModal = (company: CompanyItem) => {
    setNotifyTargetCompany(company);
    notifyForm.resetFields();
    notifyForm.setFieldsValue({
      title: "Thông báo từ Ban quản trị CAREZA",
      type: "ALL",
      content: "",
    });
    setIsNotifyModalOpen(true);
  };

  const handleSendNotificationSubmit = async (values: any) => {
    try {
      await adminService.broadcastNotification({
        title: values.title,
        content: values.content || "",
        target_role: "employer",
      });
      message.success(
        `Đã gửi thông báo "${values.title}" tới đại diện "${notifyTargetCompany?.shortName}" thành công!`
      );
      setIsNotifyModalOpen(false);
    } catch {
      message.error("Không thể gửi thông báo.");
    }
  };

  // Mở modal chỉnh sửa thông tin doanh nghiệp
  const openEditModal = (company: CompanyItem) => {
    editForm.resetFields();
    editForm.setFieldsValue({
      name: company.name,
      shortName: company.shortName,
      taxCode: company.taxCode,
      industry: company.industry,
      size: company.size,
      foundedYear: company.foundedYear,
      website: company.website,
      email: company.email,
      phone: company.phone,
      address: company.address,
      description: company.description,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (values: any) => {
    setCompanies((prev) =>
      prev.map((c) =>
        c.id === selectedCompany.id
          ? {
            ...c,
            ...values,
          }
          : c
      )
    );
    setSelectedCompany((prev) => ({
      ...prev,
      ...values,
    }));
    setIsEditModalOpen(false);
    message.success("Đã cập nhật thông tin doanh nghiệp thành công!");
  };

  // Thêm doanh nghiệp mới
  const handleAddCompanySubmit = (values: any) => {
    const newComp: CompanyItem = {
      id: `CPN_${Math.floor(100000 + Math.random() * 900000)}`,
      name: values.name.trim(),
      shortName: values.shortName.trim(),
      taxCode: values.taxCode.trim(),
      industry: values.industry,
      size: values.size,
      location: values.location,
      createdAt: "Vừa xong",
      status: "PENDING",
      logo:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=200&h=200&q=80",
      foundedYear: values.foundedYear ? parseInt(values.foundedYear) : 2020,
      website: values.website?.trim() || "https://example.com",
      email: values.email.trim(),
      phone: values.phone.trim(),
      address: values.address.trim(),
      description: values.description?.trim() || "Doanh nghiệp đăng ký trên sàn việc làm CAREZA.",
      representative: {
        name: values.representativeName?.trim() || "Người đại diện",
        position: values.representativePosition?.trim() || "Giám đốc",
        email: values.email.trim(),
        phone: values.phone.trim(),
      },
      licenseDoc: {
        name: "Giay_phep_kinh_doanh_moi.pdf",
        updatedAt: "Vừa xong",
        size: "1.8 MB",
        previewUrl:
          "https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=1200&q=85",
      },
      verification: {
        company: false,
        email: true,
        emailDate: "Vừa xong",
        phone: true,
        phoneDate: "Vừa xong",
        license: false,
      },
      notes: {
        admin: "Admin",
        date: "Vừa xong",
        content: "Doanh nghiệp mới được thêm bởi quản trị viên, chờ thẩm định pháp lý.",
      },
      images: [
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&h=500&q=85",
      ],
      membersCount: 1,
      jobsCount: 0,
      branches: [
        {
          name: "Trụ sở chính",
          address: values.address.trim(),
          phone: values.phone.trim(),
        },
      ],
    };

    setCompanies([newComp, ...companies]);
    setSelectedCompany(newComp);
    setIsAddModalOpen(false);
    addForm.resetFields();
    message.success(`Đã thêm doanh nghiệp "${newComp.shortName}" thành công!`);
  };

  // Xuất file dữ liệu
  const handleExportSubmit = () => {
    let exportList = [...companies];
    if (exportScope === "filtered") {
      exportList = filteredCompanies;
    } else if (exportScope === "selected") {
      exportList = companies.filter((c) => selectedRowKeys.includes(c.id));
      if (exportList.length === 0) {
        message.warning("Vui lòng chọn ít nhất 1 doanh nghiệp để xuất dữ liệu!");
        return;
      }
    }

    const headers = [
      "ID Doanh Nghiệp",
      "Tên Doanh Nghiệp",
      "Tên Viết Tắt",
      "Mã Số Thuế",
      "Ngành Nghề",
      "Quy Mô",
      "Khu Vực",
      "Website",
      "Email Liên Hệ",
      "Số Điện Thoại",
      "Địa Chỉ",
      "Ngày Tạo",
      "Trạng Thái",
    ];

    const rows = exportList.map((c) => [
      `"${c.id}"`,
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.shortName.replace(/"/g, '""')}"`,
      `"${c.taxCode}"`,
      `"${c.industry}"`,
      `"${c.size}"`,
      `"${c.location}"`,
      `"${c.website}"`,
      `"${c.email}"`,
      `"${c.phone}"`,
      `"${c.address.replace(/"/g, '""')}"`,
      `"${c.createdAt}"`,
      `"${c.status === "VERIFIED"
        ? "Đã xác minh"
        : c.status === "PENDING"
          ? "Chờ xác minh"
          : "Bị từ chối"
      }"`,
    ]);

    const csvContent =
      "\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `careza_danh_sach_doanh_nghiep_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsExportModalOpen(false);
    message.success(`Đã xuất thành công ${exportList.length} doanh nghiệp!`);
  };

  // Render badge trạng thái
  const renderStatusBadge = (status: "VERIFIED" | "PENDING" | "REJECTED") => {
    if (status === "VERIFIED") {
      return (
        <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span>Đã xác minh</span>
        </span>
      );
    }
    if (status === "PENDING") {
      return (
        <span className="inline-flex items-center gap-1.5 font-bold text-amber-500 text-xs">
          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
          <span>Chờ xác minh</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 font-bold text-rose-500 text-xs">
        <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
        <span>Bị từ chối</span>
      </span>
    );
  };

  return (
    <div className="space-y-4 select-none pb-12">
      {/* ========================================================= */}
      {/* 1. HEADER ROW: BREADCRUMB & NÚT XUẤT DỮ LIỆU */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-transparent">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link
            href="/admin/companies"
            className="text-slate-500 hover:text-[#0062ff] transition-colors"
          >
            Quản lý doanh nghiệp
          </Link>
          <span>&gt;</span>
          <span className="font-extrabold text-slate-900">Danh sách doanh nghiệp</span>
        </div>

        {/* Nút Xuất dữ liệu Header */}
        <button
          type="button"
          onClick={() => setIsExportModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200/90 text-slate-700 hover:text-[#0062ff] hover:border-blue-300 hover:bg-slate-50 text-xs font-bold shadow-2xs transition-all cursor-pointer bg-white"
        >
          <Download className="w-3.5 h-3.5 text-[#0062ff]" />
          <span>Xuất dữ liệu</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 2. TIÊU ĐỀ TRANG & NÚT THÊM DOANH NGHIỆP */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0">
            Quản lý &amp; xác minh doanh nghiệp
          </h1>
          <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
            Quản lý thông tin, trạng thái xác minh và hoạt động của các doanh nghiệp trên hệ thống
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            addForm.resetFields();
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0062ff] hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer border-none shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm doanh nghiệp</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 3. 4 CARD TỔNG QUAN (DỮ LIỆU THẬT TỪ BACKEND) */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Tổng doanh nghiệp */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3.5 hover:border-blue-200 transition-all">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-slate-500 block leading-tight">
              Tổng doanh nghiệp
            </span>
            <span className="text-2xl sm:text-2xl font-black text-slate-900 block my-0.5 tracking-tight leading-tight">
              {(companySummary.total_companies || companies.length).toLocaleString("vi-VN")}
            </span>
            <div className="flex items-center gap-1 text-[11px] leading-tight text-slate-500 font-medium">
              <span>Toàn hệ thống</span>
            </div>
          </div>
        </div>

        {/* Card 2: Đã xác minh */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3.5 hover:border-emerald-200 transition-all">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-slate-500 block leading-tight">
              Đã xác minh
            </span>
            <span className="text-2xl sm:text-2xl font-black text-slate-900 block my-0.5 tracking-tight leading-tight">
              {companySummary.verified_count.toLocaleString("vi-VN")}
            </span>
            <div className="flex items-center gap-1 text-[11px] leading-tight text-slate-500 font-medium">
              <span className="font-bold text-emerald-600">
                {companySummary.total_companies > 0
                  ? `${Math.round((companySummary.verified_count / companySummary.total_companies) * 100)}%`
                  : "0%"}
              </span>
              <span>tổng số</span>
            </div>
          </div>
        </div>

        {/* Card 3: Chờ xác minh */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3.5 hover:border-amber-200 transition-all">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-slate-500 block leading-tight">
              Chờ xác minh
            </span>
            <span className="text-2xl sm:text-2xl font-black text-slate-900 block my-0.5 tracking-tight leading-tight">
              {companySummary.pending_count.toLocaleString("vi-VN")}
            </span>
            <div className="flex items-center gap-1 text-[11px] leading-tight text-slate-500 font-medium">
              <span className="font-bold text-amber-600">
                {companySummary.total_companies > 0
                  ? `${Math.round((companySummary.pending_count / companySummary.total_companies) * 100)}%`
                  : "0%"}
              </span>
              <span>tổng số</span>
            </div>
          </div>
        </div>

        {/* Card 4: Bị từ chối */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3.5 hover:border-rose-200 transition-all">
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-slate-500 block leading-tight">
              Bị từ chối
            </span>
            <span className="text-2xl sm:text-2xl font-black text-slate-900 block my-0.5 tracking-tight leading-tight">
              {companySummary.rejected_count.toLocaleString("vi-VN")}
            </span>
            <div className="flex items-center gap-1 text-[11px] leading-tight text-slate-500 font-medium">
              <span className="font-bold text-rose-500">
                {companySummary.total_companies > 0
                  ? `${Math.round((companySummary.rejected_count / companySummary.total_companies) * 100)}%`
                  : "0%"}
              </span>
              <span>tổng số</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. KHU VỰC BẢNG & PANEL XEM NHANH CHI TIẾT */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* CỘT BẢNG (7 COLS HOẶC 12 COLS NẾU ĐÓNG PANEL) */}
        <div
          className={`${isDetailPanelOpen ? "xl:col-span-7 2xl:col-span-7" : "xl:col-span-12 2xl:col-span-12"
            } bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col justify-between transition-all`}
        >
          {/* Thanh lọc trên 1 dòng chuẩn: Tìm kiếm, Ngành nghề, Quy mô, Trạng thái, Khu vực, Ngày tạo, Bộ lọc nâng cao */}
          <div className="p-2.5 sm:p-3 bg-[#fafcff] border-b border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar flex-nowrap">
            {/* 1. Ô tìm kiếm */}
            <div className="relative flex-1 min-w-[150px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm tên công ty, MST, email..."
                className="w-full h-9 bg-white border border-slate-200/90 rounded-xl pl-8.5 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-[#0062ff] focus:outline-hidden transition-all font-medium"
              />
            </div>

            {/* 2. Ngành nghề */}
            <div className="w-[125px] sm:w-[130px] shrink-0">
              <Select
                value={industryFilter}
                onChange={setIndustryFilter}
                className="w-full h-9 text-xs"
                options={[
                  { value: "ALL", label: "Ngành nghề" },
                  { value: "Công nghệ thông tin", label: "CNTT" },
                  { value: "Viễn thông", label: "Viễn thông" },
                  { value: "Ngân hàng", label: "Ngân hàng" },
                  { value: "Thương mại điện tử", label: "TMĐT" },
                  { value: "Công nghệ tài chính", label: "Fintech" },
                  { value: "Đa ngành", label: "Đa ngành" },
                  { value: "Điện tử", label: "Điện tử" },
                ]}
              />
            </div>

            {/* 3. Quy mô */}
            <div className="w-[110px] sm:w-[115px] shrink-0">
              <Select
                value={sizeFilter}
                onChange={setSizeFilter}
                className="w-full h-9 text-xs"
                options={[
                  { value: "ALL", label: "Quy mô" },
                  { value: "1.000 - 5.000", label: "1.000 - 5.000" },
                  { value: "5.000 - 10.000", label: "5.000 - 10.000" },
                  { value: "> 10.000", label: "> 10.000" },
                ]}
              />
            </div>

            {/* 4. Trạng thái */}
            <div className="w-[115px] sm:w-[120px] shrink-0">
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                className="w-full h-9 text-xs"
                options={[
                  { value: "ALL", label: "Trạng thái" },
                  { value: "VERIFIED", label: "Đã xác minh" },
                  { value: "PENDING", label: "Chờ xác minh" },
                  { value: "REJECTED", label: "Bị từ chối" },
                ]}
              />
            </div>

            {/* 5. Khu vực */}
            <div className="w-[110px] sm:w-[115px] shrink-0">
              <Select
                value={locationFilter}
                onChange={setLocationFilter}
                className="w-full h-9 text-xs"
                options={[
                  { value: "ALL", label: "Khu vực" },
                  { value: "Hà Nội", label: "Hà Nội" },
                  { value: "TP. HCM", label: "TP. HCM" },
                  { value: "Đà Nẵng", label: "Đà Nẵng" },
                ]}
              />
            </div>

            {/* 6. Ngày tạo */}
            <div className="w-[115px] sm:w-[120px] shrink-0">
              <Select
                value={dateFilter}
                onChange={setDateFilter}
                className="w-full h-9 text-xs"
                options={[
                  { value: "ALL", label: "Ngày tạo" },
                  { value: "TODAY", label: "Hôm nay" },
                  { value: "7DAYS", label: "7 ngày qua" },
                  { value: "30DAYS", label: "30 ngày qua" },
                ]}
              />
            </div>

            {/* 7. Nút Bộ lọc nâng cao */}
            <button
              type="button"
              onClick={() => setIsAdvancedFilterOpen(true)}
              className={`inline-flex items-center gap-1.5 px-3 h-9 rounded-xl border text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${activeAdvFilterCount > 0
                  ? "bg-blue-50 border-[#0062ff] text-[#0062ff]"
                  : "bg-white border-slate-200/90 text-slate-700 hover:text-[#0062ff] hover:bg-slate-50"
                }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Bộ lọc nâng cao</span>
              {activeAdvFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#0062ff] text-white text-[10px] flex items-center justify-center font-bold">
                  {activeAdvFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Tabs: Tất cả / Đã xác minh / Chờ xác minh / Bị từ chối */}
          <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-slate-100 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className={`pb-2 px-2 text-xs font-bold transition-all relative border-none bg-transparent cursor-pointer ${activeTab === "ALL"
                  ? "text-[#0062ff]"
                  : "text-slate-500 hover:text-slate-800"
                }`}
            >
              <span>Tất cả ({companySummary.total_companies.toLocaleString("vi-VN")})</span>
              {activeTab === "ALL" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0062ff] rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("VERIFIED")}
              className={`pb-2 px-2 text-xs font-bold transition-all relative border-none bg-transparent cursor-pointer ${activeTab === "VERIFIED"
                  ? "text-[#0062ff]"
                  : "text-slate-500 hover:text-slate-800"
                }`}
            >
              <span>Đã xác minh ({companySummary.verified_count.toLocaleString("vi-VN")})</span>
              {activeTab === "VERIFIED" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0062ff] rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("PENDING")}
              className={`pb-2 px-2 text-xs font-bold transition-all relative border-none bg-transparent cursor-pointer ${activeTab === "PENDING"
                  ? "text-[#0062ff]"
                  : "text-slate-500 hover:text-slate-800"
                }`}
            >
              <span>Chờ xác minh ({companySummary.pending_count.toLocaleString("vi-VN")})</span>
              {activeTab === "PENDING" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0062ff] rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("REJECTED")}
              className={`pb-2 px-2 text-xs font-bold transition-all relative border-none bg-transparent cursor-pointer ${activeTab === "REJECTED"
                  ? "text-[#0062ff]"
                  : "text-slate-500 hover:text-slate-800"
                }`}
            >
              <span>Bị từ chối ({companySummary.rejected_count.toLocaleString("vi-VN")})</span>
              {activeTab === "REJECTED" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0062ff] rounded-full" />
              )}
            </button>
          </div>

          {/* Bảng danh sách: checkbox, Doanh nghiệp, MST, Ngành nghề, Quy mô, Địa điểm, Ngày tạo, Trạng thái, Thao tác */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/90 bg-[#F8FAFC] text-[11px] font-extrabold text-slate-800">
                  <th className="py-3 px-3.5 w-10 text-center">
                    <Checkbox
                      checked={isAllSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th className="py-3 px-3 font-extrabold text-slate-800">Doanh nghiệp</th>
                  <th className="py-3 px-3 font-extrabold text-slate-800 whitespace-nowrap">MST</th>
                  <th className="py-3 px-3 font-extrabold text-slate-800 whitespace-nowrap">Ngành nghề</th>
                  <th className="py-3 px-3 font-extrabold text-slate-800 whitespace-nowrap">Quy mô</th>
                  <th className="py-3 px-3 font-extrabold text-slate-800 whitespace-nowrap">Địa điểm</th>
                  <th className="py-3 px-3 font-extrabold text-slate-800 whitespace-nowrap">Ngày tạo</th>
                  <th className="py-3 px-3 font-extrabold text-slate-800 whitespace-nowrap">Trạng thái</th>
                  <th className="py-3 px-3.5 text-right font-extrabold text-slate-800 whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedCompanies.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      Không tìm thấy doanh nghiệp nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  paginatedCompanies.map((c) => {
                    const isSelected = selectedRowKeys.includes(c.id);
                    const isCurrentActive = selectedCompany?.id === c.id;

                    return (
                      <tr
                        key={c.id}
                        onClick={() => {
                          setSelectedCompany(c);
                          setIsDetailPanelOpen(true);
                        }}
                        className={`cursor-pointer transition-colors ${isCurrentActive
                            ? "bg-blue-50/60"
                            : isSelected
                              ? "bg-slate-50"
                              : "hover:bg-blue-50/30"
                          }`}
                      >
                        {/* Checkbox */}
                        <td
                          className="py-3 px-3.5 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div onClick={(e) => e.stopPropagation()} className="inline-flex">
                            <Checkbox
                              checked={isSelected}
                              onChange={(e) => handleSelectRow(c.id, e.target.checked)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </td>

                        {/* 1. Doanh nghiệp: Logo + Tên */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg border border-slate-200/90 bg-white flex items-center justify-center p-1 shrink-0 shadow-2xs">
                              <img
                                src={c.logo}
                                alt={c.shortName}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  // Fallback nếu logo lỗi
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                            </div>
                            <span className="font-bold text-slate-900 block truncate leading-tight">
                              {c.shortName}
                            </span>
                          </div>
                        </td>

                        {/* 2. MST */}
                        <td className="py-3 px-3 font-mono font-medium text-slate-600 whitespace-nowrap">
                          {c.taxCode}
                        </td>

                        {/* 3. Ngành nghề */}
                        <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                          {c.industry}
                        </td>

                        {/* 4. Quy mô */}
                        <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                          {c.size}
                        </td>

                        {/* 5. Địa điểm */}
                        <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                          {c.location}
                        </td>

                        {/* 6. Ngày tạo */}
                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                          {c.createdAt}
                        </td>

                        {/* 7. Trạng thái */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {renderStatusBadge(c.status)}
                        </td>

                        {/* 8. Thao tác */}
                        <td
                          className="py-3 px-3.5 text-right whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div onClick={(e) => e.stopPropagation()} className="inline-block">
                            <Dropdown
                              menu={{
                                items: [
                                  {
                                    key: "detail",
                                    icon: <Eye className="w-3.5 h-3.5 text-[#0F52BA]" />,
                                    label: (
                                      <Link
                                        href={`/admin/companies/${c.id}`}
                                        className="no-underline text-inherit"
                                      >
                                        Xem trang chi tiết
                                      </Link>
                                    ),
                                  },
                                  {
                                    key: "edit",
                                    icon: <Edit2 className="w-3.5 h-3.5 text-blue-500" />,
                                    label: "Chỉnh sửa thông tin",
                                    onClick: () => openEditModal(c),
                                  },
                                  {
                                    key: "notify",
                                    icon: <Mail className="w-3.5 h-3.5 text-slate-600" />,
                                    label: "Gửi thông báo",
                                    onClick: () => openNotifyModal(c),
                                  },
                                  {
                                    key: "verify",
                                    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
                                    label: "Duyệt xác minh",
                                    disabled: c.status === "VERIFIED",
                                    onClick: () => handleApproveCompany(c),
                                  },
                                  {
                                    key: "reject",
                                    icon: <AlertCircle className="w-3.5 h-3.5 text-rose-500" />,
                                    label: "Từ chối xác minh",
                                    danger: true,
                                    disabled: c.status === "REJECTED",
                                    onClick: () => openRejectModal(c),
                                  },
                                ],
                              }}
                              trigger={["click"]}
                              placement="bottomRight"
                            >
                              <button
                                type="button"
                                onClick={(e) => e.stopPropagation()}
                                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 border-none bg-transparent cursor-pointer inline-flex items-center justify-center transition-colors"
                                title="Thao tác"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </Dropdown>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang chân bảng */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:p-4 border-t border-slate-100 text-xs text-slate-500 font-medium">
            <span>
              Hiển thị {filteredCompanies.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} -{" "}
              {Math.min(currentPage * pageSize, filteredCompanies.length)} trong 2.341 doanh nghiệp
            </span>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:border-blue-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {[1, 2, 3, 4, 5].map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${currentPage === pageNum
                        ? "bg-[#0062ff] text-white border-[#0062ff]"
                        : "bg-white text-slate-700 border-slate-200 hover:border-blue-300"
                      }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <span className="px-1 text-slate-400">...</span>

                <button
                  type="button"
                  onClick={() => setCurrentPage(235)}
                  className={`w-8 h-7 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${currentPage === 235
                      ? "bg-[#0062ff] text-white border-[#0062ff]"
                      : "bg-white text-slate-700 border-slate-200 hover:border-blue-300"
                    }`}
                >
                  235
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:border-blue-300 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="w-[95px]">
                <Select
                  value={pageSize}
                  onChange={(val) => {
                    setPageSize(val);
                    setCurrentPage(1);
                  }}
                  size="small"
                  className="w-full text-xs"
                  options={[
                    { value: 10, label: "10 / trang" },
                    { value: 20, label: "20 / trang" },
                    { value: 50, label: "50 / trang" },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CỘT PANEL XEM NHANH CHI TIẾT DOANH NGHIỆP BÊN PHẢI (5 COLS) */}
        {/* ========================================================= */}
        {isDetailPanelOpen && selectedCompany && (
          <div className="xl:col-span-5 2xl:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col justify-between">
            {/* Header Panel */}
            <div className="p-4 sm:p-5 border-b border-slate-100 space-y-4">
              <div className="flex items-start justify-between gap-3">
                {/* Logo + Tên + MST + Trạng thái */}
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl border border-slate-200/90 bg-white p-2 flex items-center justify-center shadow-2xs shrink-0">
                    <img
                      src={selectedCompany.logo}
                      alt={selectedCompany.shortName}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-lg font-black text-slate-900 leading-tight truncate m-0">
                      {selectedCompany.shortName}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      {renderStatusBadge(selectedCompany.status)}
                    </div>
                    <span className="text-xs font-mono text-slate-500 block mt-0.5">
                      MST: {selectedCompany.taxCode}
                    </span>
                  </div>
                </div>

                {/* Nút đóng panel X */}
                <button
                  type="button"
                  onClick={() => setIsDetailPanelOpen(false)}
                  className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center border-none bg-transparent cursor-pointer transition-colors shrink-0"
                  title="Đóng panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 3 Nút: Trang chi tiết & Website & Chỉnh sửa */}
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/companies/${selectedCompany.id}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-50 text-[#0F52BA] hover:bg-blue-100 font-bold text-xs shadow-2xs transition-all no-underline"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Trang chi tiết</span>
                </Link>

                <a
                  href={selectedCompany.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:text-[#0F52BA] hover:border-blue-300 font-bold text-xs shadow-2xs transition-all no-underline bg-white"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Website</span>
                </a>

                <button
                  type="button"
                  onClick={() => openEditModal(selectedCompany)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#0F52BA] hover:bg-blue-800 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all border-none cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Chỉnh sửa</span>
                </button>
              </div>
            </div>

            {/* Tabs Panel: Thông tin chung / Chi nhánh / Thành viên (12) / Tin tuyển dụng (48) / Gói dịch vụ / Lịch sử */}
            <div className="px-4 border-b border-slate-100 flex items-center gap-1 overflow-x-auto no-scrollbar">
              {[
                { key: "overview", label: "Thông tin chung" },
                { key: "branches", label: "Chi nhánh" },
                { key: "members", label: `Thành viên (${selectedCompany.membersCount})` },
                { key: "jobs", label: `Tin tuyển dụng (${selectedCompany.jobsCount})` },
                { key: "services", label: "Gói dịch vụ" },
                { key: "history", label: "Lịch sử" },
              ].map((tab) => {
                const isActive = panelTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setPanelTab(tab.key as any)}
                    className={`py-2.5 px-2.5 text-xs font-bold whitespace-nowrap transition-all border-none bg-transparent cursor-pointer relative ${isActive ? "text-[#0062ff]" : "text-slate-500 hover:text-slate-800"
                      }`}
                  >
                    <span>{tab.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0062ff] rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Nội dung Tab trong Panel */}
            <div className="p-4 sm:p-5 space-y-4 max-h-[calc(100vh-320px)] overflow-y-auto no-scrollbar">
              {panelTab === "overview" && (
                <>
                  {/* Khối 1: Thông tin doanh nghiệp & Gallery */}
                  <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider m-0">
                        Thông tin doanh nghiệp
                      </h3>
                      <button
                        type="button"
                        onClick={() => openEditModal(selectedCompany)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0062ff] hover:underline bg-transparent border-none cursor-pointer p-0"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Chỉnh sửa</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                      {/* Cột dữ liệu công ty (7 cols) */}
                      <div className="md:col-span-7 space-y-1.5 text-xs">
                        <div className="flex justify-between gap-2">
                          <span className="text-slate-400">Tên công ty</span>
                          <span className="font-bold text-slate-900 text-right">
                            {selectedCompany.name}
                          </span>
                        </div>

                        <div className="flex justify-between gap-2">
                          <span className="text-slate-400">Tên viết tắt</span>
                          <span className="font-semibold text-slate-800 text-right">
                            {selectedCompany.shortName}
                          </span>
                        </div>

                        <div className="flex justify-between gap-2">
                          <span className="text-slate-400">Mã số thuế</span>
                          <span className="font-mono font-bold text-slate-800 text-right">
                            {selectedCompany.taxCode}
                          </span>
                        </div>

                        <div className="flex justify-between gap-2">
                          <span className="text-slate-400">Ngành nghề</span>
                          <span className="font-medium text-slate-800 text-right">
                            {selectedCompany.industry}
                          </span>
                        </div>

                        <div className="flex justify-between gap-2">
                          <span className="text-slate-400">Quy mô nhân sự</span>
                          <span className="font-medium text-slate-800 text-right">
                            {selectedCompany.size}
                          </span>
                        </div>

                        <div className="flex justify-between gap-2">
                          <span className="text-slate-400">Năm thành lập</span>
                          <span className="font-medium text-slate-800 text-right">
                            {selectedCompany.foundedYear}
                          </span>
                        </div>

                        <div className="flex justify-between items-center gap-2">
                          <span className="text-slate-400">Website</span>
                          <a
                            href={selectedCompany.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#0062ff] hover:underline font-semibold text-right inline-flex items-center gap-1"
                          >
                            <span className="truncate max-w-[130px]">{selectedCompany.website}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>

                        <div className="flex justify-between gap-2">
                          <span className="text-slate-400">Email liên hệ</span>
                          <span className="font-medium text-slate-800 text-right">
                            {selectedCompany.email}
                          </span>
                        </div>

                        <div className="flex justify-between gap-2">
                          <span className="text-slate-400">Số điện thoại</span>
                          <span className="font-medium text-slate-800 text-right">
                            {selectedCompany.phone}
                          </span>
                        </div>

                        <div className="flex justify-between gap-2">
                          <span className="text-slate-400">Địa chỉ trụ sở</span>
                          <span className="font-medium text-slate-800 text-right">
                            {selectedCompany.address}
                          </span>
                        </div>
                      </div>

                      {/* Cột Gallery ảnh (5 cols) */}
                      <div className="md:col-span-5 space-y-2">
                        {/* Ảnh lớn có slider */}
                        <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-4/3 group">
                          <img
                            src={
                              selectedCompany.images[currentImageIndex] ||
                              selectedCompany.images[0]
                            }
                            alt="Ảnh công ty"
                            className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300"
                            onClick={() => {
                              setPreviewImageUrl(
                                selectedCompany.images[currentImageIndex] ||
                                selectedCompany.images[0]
                              );
                              setIsPreviewImageOpen(true);
                            }}
                          />
                          {/* Nút lùi */}
                          <button
                            type="button"
                            onClick={() =>
                              setCurrentImageIndex((prev) =>
                                prev > 0 ? prev - 1 : selectedCompany.images.length - 1
                              )
                            }
                            className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border-none cursor-pointer"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          {/* Nút tiến */}
                          <button
                            type="button"
                            onClick={() =>
                              setCurrentImageIndex((prev) =>
                                prev < selectedCompany.images.length - 1 ? prev + 1 : 0
                              )
                            }
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border-none cursor-pointer"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                          {/* Đếm ảnh */}
                          <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold">
                            {currentImageIndex + 1}/{selectedCompany.images.length}
                          </span>
                        </div>

                        {/* Thumbnail nhỏ */}
                        <div className="grid grid-cols-4 gap-1.5">
                          {selectedCompany.images.slice(0, 4).map((img, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setCurrentImageIndex(idx)}
                              className={`rounded-lg overflow-hidden border aspect-square p-0 cursor-pointer ${currentImageIndex === idx
                                  ? "border-[#0062ff] ring-1 ring-[#0062ff]"
                                  : "border-slate-200 opacity-70 hover:opacity-100"
                                }`}
                            >
                              <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Mô tả */}
                    <div className="pt-2 border-t border-slate-200/80 text-xs">
                      <span className="text-slate-400 block mb-1">Mô tả:</span>
                      <p className="text-slate-700 leading-relaxed m-0 font-normal">
                        {selectedCompany.description}
                      </p>
                    </div>
                  </div>

                  {/* Khối 2: Người đại diện & Giấy phép kinh doanh */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Người đại diện */}
                    <div className="bg-slate-50/70 rounded-2xl p-3.5 border border-slate-100 space-y-2 text-xs">
                      <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider m-0">
                        Người đại diện
                      </h4>
                      <div className="flex items-start gap-2.5 pt-1">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-[#0062ff] flex items-center justify-center shrink-0">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 block leading-tight">
                            {selectedCompany.representative.name}
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            {selectedCompany.representative.position}
                          </span>
                          <div className="text-[10.5px] text-slate-500 space-y-0.5 mt-1">
                            <span className="block truncate">
                              ✉ {selectedCompany.representative.email}
                            </span>
                            <span className="block">
                              ☎ {selectedCompany.representative.phone}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Giấy phép kinh doanh */}
                    <div className="bg-slate-50/70 rounded-2xl p-3.5 border border-slate-100 space-y-2 text-xs">
                      <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider m-0">
                        Giấy phép kinh doanh
                      </h4>
                      <div className="flex items-center gap-2.5 pt-1">
                        <div
                          onClick={() => setIsDocModalOpen(true)}
                          className="w-11 h-13 rounded-lg border border-amber-200 bg-amber-50 flex items-center justify-center shrink-0 cursor-pointer shadow-2xs hover:ring-2 hover:ring-[#0062ff] transition-all"
                          title="Bấm xem giấy phép"
                        >
                          <FileText className="w-5 h-5 text-amber-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-slate-900 block text-xs truncate">
                            {selectedCompany.licenseDoc.name}
                          </span>
                          <span className="text-[10.5px] text-slate-400 block mt-0.5">
                            Cập nhật: {selectedCompany.licenseDoc.updatedAt}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {selectedCompany.licenseDoc.size}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsDocModalOpen(true)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[#0062ff] hover:border-blue-300 font-bold text-[11px] cursor-pointer shadow-2xs"
                        >
                          Xem
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Khối 3: Trạng thái xác minh & Ghi chú nội bộ */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Trạng thái xác minh 4 mục */}
                    <div className="bg-slate-50/70 rounded-2xl p-3.5 border border-slate-100 space-y-2 text-xs">
                      <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider m-0">
                        Trạng thái xác minh
                      </h4>
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 font-medium">Xác minh doanh nghiệp</span>
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-600 text-[11px]">
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span>Đã xác minh</span>
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 font-medium">Xác minh email</span>
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-600 text-[11px]">
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span>Đã xác minh</span>
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 font-medium">Xác minh số điện thoại</span>
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-600 text-[11px]">
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span>Đã xác minh</span>
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 font-medium">Xác minh GPKD</span>
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-600 text-[11px]">
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span>Đã xác minh</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Ghi chú nội bộ */}
                    <div className="bg-slate-50/70 rounded-2xl p-3.5 border border-slate-100 space-y-2 text-xs flex flex-col justify-between">
                      <div>
                        <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider m-0">
                          Ghi chú nội bộ
                        </h4>
                        <p className="text-slate-700 leading-relaxed text-[11.5px] m-0 mt-1">
                          {selectedCompany.notes.content}
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-400 block text-right font-medium">
                        {selectedCompany.notes.admin} · {selectedCompany.notes.date}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* Tab Chi nhánh */}
              {panelTab === "branches" && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider m-0">
                    Danh sách chi nhánh ({selectedCompany.branches.length})
                  </h3>
                  <div className="space-y-2 text-xs">
                    {selectedCompany.branches.map((b, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-xs">{b.name}</span>
                          <span className="text-[10.5px] text-slate-500 font-mono">
                            ☎ {b.phone}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-600 block">
                          📍 {b.address}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab Thành viên */}
              {panelTab === "members" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider m-0">
                      Thành viên tuyển dụng ({selectedCompany.membersCount})
                    </h3>
                    <Link
                      href="/admin/users"
                      className="text-[11px] font-bold text-[#0062ff] hover:underline"
                    >
                      Quản lý trong Người dùng &gt;
                    </Link>
                  </div>
                  <div className="divide-y divide-slate-100 text-xs">
                    {[
                      { name: "Hoàng Minh Tuấn", role: "HR Manager", email: "tuan.hm@fpt.com" },
                      { name: "Lê Thị Hồng Vân", role: "Tech Recruiter", email: "van.lth@fpt.com" },
                      { name: "Đặng Quang Huy", role: "Talent Acquisition", email: "huy.dq@fpt.com" },
                    ].map((m, idx) => (
                      <div key={idx} className="py-2.5 flex items-center justify-between gap-2">
                        <div>
                          <span className="font-bold text-slate-900 block">{m.name}</span>
                          <span className="text-[11px] text-slate-400 block">{m.email}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#0062ff] font-bold text-[10.5px]">
                          {m.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab Tin tuyển dụng */}
              {panelTab === "jobs" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider m-0">
                      Tin tuyển dụng đang đăng ({selectedCompany.jobsCount})
                    </h3>
                    <Link
                      href="/admin/jobs"
                      className="text-[11px] font-bold text-[#0062ff] hover:underline"
                    >
                      Quản lý tin &gt;
                    </Link>
                  </div>
                  <div className="space-y-2 text-xs">
                    {[
                      { title: "Senior React / Next.js Developer", salary: "25 - 40 triệu", date: "10/03/2024" },
                      { title: "AI Research Engineer", salary: "35 - 60 triệu", date: "08/03/2024" },
                      { title: "DevOps / Cloud Architect", salary: "30 - 50 triệu", date: "05/03/2024" },
                    ].map((j, i) => (
                      <div key={i} className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-2">
                        <div>
                          <span className="font-bold text-slate-900 block">{j.title}</span>
                          <span className="text-[10.5px] text-slate-500 block">Lương: {j.salary} · {j.date}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 font-bold text-[10.5px]">
                          Đang tuyển
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab Gói dịch vụ */}
              {panelTab === "services" && (
                <div className="space-y-3 text-xs">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider m-0">
                    Gói dịch vụ đang kích hoạt
                  </h3>
                  <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-900 text-sm">Gói Doanh nghiệp Kim Cương (VIP)</span>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 font-bold text-[10.5px]">
                        Còn 240 ngày
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs m-0">
                      Đăng không giới hạn tin tuyển dụng, mở khóa tìm kiếm 500 CV ứng viên/tháng, gắn huy hiệu xác minh nổi bật.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab Lịch sử */}
              {panelTab === "history" && (
                <div className="space-y-3 text-xs">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider m-0">
                    Lịch sử xét duyệt &amp; thao tác
                  </h3>
                  <div className="divide-y divide-slate-100">
                    <div className="py-2">
                      <span className="text-[10px] text-slate-400 font-mono">12/03/2024 10:24</span>
                      <p className="font-semibold text-slate-800 m-0">Admin phê duyệt xác minh giấy phép kinh doanh</p>
                    </div>
                    <div className="py-2">
                      <span className="text-[10px] text-slate-400 font-mono">12/03/2024 09:15</span>
                      <p className="font-semibold text-slate-800 m-0">Doanh nghiệp hoàn tất nộp hồ sơ pháp nhân</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Action Bar: Gửi thông báo / Duyệt lại hoặc Duyệt / Từ chối / menu ... */}
            <div className="p-3 sm:p-4 border-t border-slate-100 flex items-center justify-between gap-2 bg-[#fafcff]">
              <button
                type="button"
                onClick={() => openNotifyModal(selectedCompany)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:border-blue-300 text-slate-700 text-xs font-bold cursor-pointer bg-white shadow-2xs transition-all"
              >
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>Gửi thông báo</span>
              </button>

              <div className="flex items-center gap-2">
                {/* Nút Duyệt / Duyệt lại */}
                <button
                  type="button"
                  onClick={() => handleApproveCompany(selectedCompany)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-200 text-emerald-600 hover:bg-emerald-50 text-xs font-bold cursor-pointer bg-white shadow-2xs transition-all"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{selectedCompany.status === "VERIFIED" ? "Duyệt lại" : "Duyệt"}</span>
                </button>

                {/* Nút Từ chối */}
                <button
                  type="button"
                  onClick={() => openRejectModal(selectedCompany)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold cursor-pointer bg-white shadow-2xs transition-all"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                  <span>Từ chối</span>
                </button>

                {/* Dropdown ... */}
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: "edit-basic",
                        icon: <Edit2 className="w-3.5 h-3.5 text-blue-500" />,
                        label: "Chỉnh sửa doanh nghiệp",
                        onClick: () => openEditModal(selectedCompany),
                      },
                      {
                        key: "view-doc",
                        icon: <FileText className="w-3.5 h-3.5 text-amber-500" />,
                        label: "Xem tài liệu pháp lý",
                        onClick: () => setIsDocModalOpen(true),
                      },
                      {
                        type: "divider",
                      },
                      {
                        key: "block-company",
                        icon: <Lock className="w-3.5 h-3.5 text-rose-500" />,
                        danger: true,
                        label: "Tạm khóa doanh nghiệp",
                        onClick: () => {
                          modal.confirm({
                            title: "Khóa doanh nghiệp?",
                            content: `Bạn có chắc chắn muốn tạm khóa hoạt động tuyển dụng của "${selectedCompany?.name}"?`,
                            okText: "Khóa doanh nghiệp",
                            okType: "danger",
                            onOk: async () => {
                              try {
                                await adminService.updateCompanyStatus(selectedCompany.id, false);
                                setCompanies((prev) =>
                                  prev.map((c) =>
                                    c.id === selectedCompany.id ? { ...c, status: "REJECTED" } : c
                                  )
                                );
                                setSelectedCompany((prev) => ({ ...prev, status: "REJECTED" }));
                                message.success("Đã khóa doanh nghiệp thành công!");
                                fetchCompanies();
                              } catch {
                                message.error("Không thể khóa doanh nghiệp.");
                              }
                            },
                          });
                        },
                      },
                    ],
                  }}
                  trigger={["click"]}
                  placement="topRight"
                >
                  <button
                    type="button"
                    className="w-8 h-8 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300 flex items-center justify-center cursor-pointer bg-white shadow-2xs transition-colors"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </Dropdown>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: XEM GIẤY PHÉP KINH DOANH PHÓNG TO */}
      {/* ========================================================= */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <FileText className="w-4 h-4 text-amber-600" />
            <span className="font-black text-slate-900 text-sm">
              Giấy phép kinh doanh - {selectedCompany?.shortName}
            </span>
          </div>
        }
        open={isDocModalOpen}
        onCancel={() => setIsDocModalOpen(false)}
        footer={null}
        destroyOnHidden
        width={720}
      >
        <div className="pt-2 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-2 rounded-xl">
            <span>Tên tệp: {selectedCompany?.licenseDoc.name}</span>
            <span>Cập nhật: {selectedCompany?.licenseDoc.updatedAt} · {selectedCompany?.licenseDoc.size}</span>
          </div>
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center max-h-[500px]">
            <img
              src={selectedCompany?.licenseDoc.previewUrl}
              alt="Bản scan GPKD"
              className="w-full h-auto object-contain"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsDocModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer bg-white"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={() => message.success("Đang tải xuống tài liệu giấy phép kinh doanh...")}
              className="px-4 py-2 rounded-xl bg-[#0062ff] text-white text-xs font-bold cursor-pointer border-none"
            >
              Tải xuống bản gốc
            </button>
          </div>
        </div>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 2: XEM GALLERY ẢNH LỚN */}
      {/* ========================================================= */}
      <Modal
        open={isPreviewImageOpen}
        onCancel={() => setIsPreviewImageOpen(false)}
        footer={null}
        destroyOnHidden
        width={800}
      >
        <div className="p-2">
          <img
            src={previewImageUrl}
            alt="Phóng to ảnh"
            className="w-full h-auto rounded-xl object-contain max-h-[75vh]"
          />
        </div>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 3: TỪ CHỐI XÁC MINH (BẮT BUỘC NHẬP LÝ DO) */}
      {/* ========================================================= */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span className="font-black text-slate-900 text-sm">
              Từ chối xác minh doanh nghiệp
            </span>
          </div>
        }
        open={isRejectModalOpen}
        onCancel={() => setIsRejectModalOpen(false)}
        footer={null}
        destroyOnHidden
        width={480}
      >
        <Form
          form={rejectForm}
          layout="vertical"
          onFinish={handleRejectSubmit}
          className="pt-2 text-xs space-y-3"
        >
          <p className="text-xs text-slate-600 m-0">
            Bạn đang thực hiện từ chối xác minh cho doanh nghiệp{" "}
            <strong>"{rejectingCompany?.name}"</strong>. Vui lòng nhập lý do cụ thể để thông báo tới đại diện doanh nghiệp.
          </p>

          <Form.Item
            label={<span className="font-bold text-slate-700">Lý do từ chối</span>}
            name="reason"
            rules={[{ required: true, message: "Vui lòng nhập lý do từ chối xác minh" }]}
            className="mb-1"
          >
            <Input.TextArea
              rows={3}
              placeholder="Ví dụ: Giấy phép kinh doanh đã hết hạn, con dấu mờ, thông tin MST không khớp..."
              className="rounded-xl text-xs"
            />
          </Form.Item>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsRejectModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer bg-white"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer border-none shadow-md shadow-rose-500/20"
            >
              Xác nhận từ chối
            </button>
          </div>
        </Form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 4: GỬI THÔNG BÁO TỚI DOANH NGHIỆP */}
      {/* ========================================================= */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <Mail className="w-4 h-4 text-[#0062ff]" />
            <span className="font-black text-slate-900 text-sm">
              Gửi thông báo tới {notifyTargetCompany?.shortName}
            </span>
          </div>
        }
        open={isNotifyModalOpen}
        onCancel={() => setIsNotifyModalOpen(false)}
        footer={null}
        destroyOnHidden
        width={500}
      >
        <Form
          form={notifyForm}
          layout="vertical"
          onFinish={handleSendNotificationSubmit}
          className="pt-2 text-xs space-y-3"
        >
          <Form.Item
            label={<span className="font-bold text-slate-700">Hình thức gửi</span>}
            name="type"
            className="mb-1"
          >
            <Radio.Group className="text-xs">
              <Radio value="ALL">Cả Email &amp; Hệ thống</Radio>
              <Radio value="EMAIL">Chỉ Email</Radio>
              <Radio value="IN_APP">Chỉ Trong ứng dụng</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label={<span className="font-bold text-slate-700">Tiêu đề thông báo</span>}
            name="title"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
            className="mb-1"
          >
            <Input className="rounded-xl text-xs h-9" />
          </Form.Item>

          <Form.Item
            label={<span className="font-bold text-slate-700">Nội dung thông điệp</span>}
            name="content"
            rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
            className="mb-2"
          >
            <Input.TextArea
              rows={4}
              placeholder="Nhập nội dung thông báo gửi tới ban giám đốc / bộ phận nhân sự..."
              className="rounded-xl text-xs"
            />
          </Form.Item>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsNotifyModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer bg-white"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0062ff] hover:bg-blue-700 text-white text-xs font-bold cursor-pointer border-none shadow-md shadow-blue-500/20"
            >
              Gửi thông báo
            </button>
          </div>
        </Form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 5: THÊM DOANH NGHIỆP MỚI */}
      {/* ========================================================= */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-[#0062ff]" />
            <span className="font-black text-slate-900 text-sm">
              Thêm doanh nghiệp mới vào hệ thống
            </span>
          </div>
        }
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        footer={null}
        destroyOnHidden
        width={620}
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={handleAddCompanySubmit}
          className="pt-2 text-xs space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              label={<span className="font-bold text-slate-700">Tên doanh nghiệp đầy đủ</span>}
              name="name"
              rules={[{ required: true, message: "Vui lòng nhập tên công ty" }]}
              className="mb-1"
            >
              <Input placeholder="Ví dụ: Công ty TNHH Giải Pháp Công Nghệ ABC" className="rounded-xl text-xs h-9" />
            </Form.Item>

            <Form.Item
              label={<span className="font-bold text-slate-700">Tên viết tắt / Hiển thị</span>}
              name="shortName"
              rules={[{ required: true, message: "Vui lòng nhập tên viết tắt" }]}
              className="mb-1"
            >
              <Input placeholder="Ví dụ: Tech ABC" className="rounded-xl text-xs h-9" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Form.Item
              label={<span className="font-bold text-slate-700">Mã số thuế (MST)</span>}
              name="taxCode"
              rules={[{ required: true, message: "Nhập MST" }]}
              className="mb-1"
            >
              <Input placeholder="010xxxxxxx" className="rounded-xl text-xs h-9" />
            </Form.Item>

            <Form.Item
              label={<span className="font-bold text-slate-700">Ngành nghề</span>}
              name="industry"
              initialValue="Công nghệ thông tin"
              rules={[{ required: true }]}
              className="mb-1"
            >
              <Select
                className="text-xs h-9"
                options={[
                  { value: "Công nghệ thông tin", label: "Công nghệ thông tin" },
                  { value: "Viễn thông", label: "Viễn thông" },
                  { value: "Ngân hàng", label: "Ngân hàng" },
                  { value: "Thương mại điện tử", label: "Thương mại điện tử" },
                  { value: "Công nghệ tài chính", label: "Công nghệ tài chính" },
                  { value: "Đa ngành", label: "Đa ngành" },
                ]}
              />
            </Form.Item>

            <Form.Item
              label={<span className="font-bold text-slate-700">Quy mô</span>}
              name="size"
              initialValue="1.000 - 5.000"
              rules={[{ required: true }]}
              className="mb-1"
            >
              <Select
                className="text-xs h-9"
                options={[
                  { value: "100 - 500", label: "100 - 500 nhân sự" },
                  { value: "500 - 1.000", label: "500 - 1.000 nhân sự" },
                  { value: "1.000 - 5.000", label: "1.000 - 5.000 nhân sự" },
                  { value: "> 10.000", label: "> 10.000 nhân sự" },
                ]}
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Form.Item
              label={<span className="font-bold text-slate-700">Email liên hệ</span>}
              name="email"
              rules={[{ required: true, type: "email", message: "Email không hợp lệ" }]}
              className="mb-1"
            >
              <Input placeholder="hr@abc.com" className="rounded-xl text-xs h-9" />
            </Form.Item>

            <Form.Item
              label={<span className="font-bold text-slate-700">Số điện thoại</span>}
              name="phone"
              rules={[{ required: true, message: "Nhập SĐT" }]}
              className="mb-1"
            >
              <Input placeholder="024 1234 5678" className="rounded-xl text-xs h-9" />
            </Form.Item>

            <Form.Item
              label={<span className="font-bold text-slate-700">Khu vực / Tỉnh thành</span>}
              name="location"
              initialValue="Hà Nội"
              rules={[{ required: true }]}
              className="mb-1"
            >
              <Select
                className="text-xs h-9"
                options={[
                  { value: "Hà Nội", label: "Hà Nội" },
                  { value: "TP. HCM", label: "TP. HCM" },
                  { value: "Đà Nẵng", label: "Đà Nẵng" },
                  { value: "Khác", label: "Khác" },
                ]}
              />
            </Form.Item>
          </div>

          <Form.Item
            label={<span className="font-bold text-slate-700">Địa chỉ trụ sở chính</span>}
            name="address"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ trụ sở" }]}
            className="mb-1"
          >
            <Input placeholder="Số nhà, phố, quận/huyện..." className="rounded-xl text-xs h-9" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              label={<span className="font-bold text-slate-700">Người đại diện pháp luật</span>}
              name="representativeName"
              className="mb-1"
            >
              <Input placeholder="Ví dụ: Nguyễn Văn A" className="rounded-xl text-xs h-9" />
            </Form.Item>

            <Form.Item
              label={<span className="font-bold text-slate-700">Website công ty</span>}
              name="website"
              className="mb-1"
            >
              <Input placeholder="https://..." className="rounded-xl text-xs h-9" />
            </Form.Item>
          </div>

          <Form.Item
            label={<span className="font-bold text-slate-700">Mô tả tóm tắt doanh nghiệp</span>}
            name="description"
            className="mb-2"
          >
            <Input.TextArea rows={2} placeholder="Giới thiệu sơ lược ngành nghề, định hướng..." className="rounded-xl text-xs" />
          </Form.Item>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer bg-white"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0062ff] hover:bg-blue-700 text-white text-xs font-bold cursor-pointer border-none shadow-md shadow-blue-500/20"
            >
              Tạo doanh nghiệp
            </button>
          </div>
        </Form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 6: CHỈNH SỬA THÔNG TIN DOANH NGHIỆP */}
      {/* ========================================================= */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <Edit2 className="w-4 h-4 text-[#0062ff]" />
            <span className="font-black text-slate-900 text-sm">
              Chỉnh sửa thông tin doanh nghiệp
            </span>
          </div>
        }
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        destroyOnHidden
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditSubmit}
          className="pt-2 text-xs space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              label={<span className="font-bold text-slate-700">Tên doanh nghiệp</span>}
              name="name"
              rules={[{ required: true, message: "Vui lòng nhập tên công ty" }]}
              className="mb-1"
            >
              <Input className="rounded-xl text-xs h-9" />
            </Form.Item>

            <Form.Item
              label={<span className="font-bold text-slate-700">Tên viết tắt</span>}
              name="shortName"
              rules={[{ required: true, message: "Vui lòng nhập tên viết tắt" }]}
              className="mb-1"
            >
              <Input className="rounded-xl text-xs h-9" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Form.Item
              label={<span className="font-bold text-slate-700">Mã số thuế</span>}
              name="taxCode"
              rules={[{ required: true }]}
              className="mb-1"
            >
              <Input className="rounded-xl text-xs h-9" />
            </Form.Item>

            <Form.Item
              label={<span className="font-bold text-slate-700">Ngành nghề</span>}
              name="industry"
              className="mb-1"
            >
              <Select
                className="text-xs h-9"
                options={[
                  { value: "Công nghệ thông tin", label: "Công nghệ thông tin" },
                  { value: "Viễn thông", label: "Viễn thông" },
                  { value: "Ngân hàng", label: "Ngân hàng" },
                  { value: "Thương mại điện tử", label: "Thương mại điện tử" },
                  { value: "Công nghệ tài chính", label: "Công nghệ tài chính" },
                  { value: "Đa ngành", label: "Đa ngành" },
                ]}
              />
            </Form.Item>

            <Form.Item
              label={<span className="font-bold text-slate-700">Quy mô</span>}
              name="size"
              className="mb-1"
            >
              <Select
                className="text-xs h-9"
                options={[
                  { value: "1.000 - 5.000", label: "1.000 - 5.000" },
                  { value: "5.000 - 10.000", label: "5.000 - 10.000" },
                  { value: "> 10.000", label: "> 10.000" },
                ]}
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              label={<span className="font-bold text-slate-700">Email</span>}
              name="email"
              className="mb-1"
            >
              <Input className="rounded-xl text-xs h-9" />
            </Form.Item>

            <Form.Item
              label={<span className="font-bold text-slate-700">Số điện thoại</span>}
              name="phone"
              className="mb-1"
            >
              <Input className="rounded-xl text-xs h-9" />
            </Form.Item>
          </div>

          <Form.Item
            label={<span className="font-bold text-slate-700">Địa chỉ trụ sở</span>}
            name="address"
            className="mb-1"
          >
            <Input className="rounded-xl text-xs h-9" />
          </Form.Item>

          <Form.Item
            label={<span className="font-bold text-slate-700">Mô tả doanh nghiệp</span>}
            name="description"
            className="mb-2"
          >
            <Input.TextArea rows={3} className="rounded-xl text-xs" />
          </Form.Item>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer bg-white"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0062ff] hover:bg-blue-700 text-white text-xs font-bold cursor-pointer border-none shadow-md shadow-blue-500/20"
            >
              Lưu thay đổi
            </button>
          </div>
        </Form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 7: XUẤT DỮ LIỆU EXCEL / CSV */}
      {/* ========================================================= */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <Download className="w-4 h-4 text-[#0062ff]" />
            <span className="font-black text-slate-900 text-sm">
              Xuất dữ liệu danh sách doanh nghiệp
            </span>
          </div>
        }
        open={isExportModalOpen}
        onCancel={() => setIsExportModalOpen(false)}
        footer={null}
        destroyOnHidden
        width={480}
      >
        <div className="pt-2 space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">
              Phạm vi dữ liệu xuất:
            </label>
            <Radio.Group
              value={exportScope}
              onChange={(e) => setExportScope(e.target.value)}
              className="space-y-1.5 flex flex-col text-xs"
            >
              <Radio value="filtered">
                Theo bộ lọc hiện tại ({filteredCompanies.length} doanh nghiệp)
              </Radio>
              <Radio value="selected">
                Chỉ các doanh nghiệp đang được chọn ({selectedRowKeys.length} mục)
              </Radio>
              <Radio value="all">
                Tất cả doanh nghiệp trong hệ thống ({companies.length} doanh nghiệp)
              </Radio>
            </Radio.Group>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1.5">
              Định dạng tệp:
            </label>
            <Radio.Group
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="flex items-center gap-4 text-xs"
            >
              <Radio value="xlsx">Excel (.xlsx)</Radio>
              <Radio value="csv">CSV (.csv chuẩn UTF-8)</Radio>
            </Radio.Group>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsExportModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer bg-white"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleExportSubmit}
              className="px-5 py-2 rounded-xl bg-[#0062ff] hover:bg-blue-700 text-white text-xs font-bold cursor-pointer border-none shadow-md shadow-blue-500/20"
            >
              Xác nhận xuất file
            </button>
          </div>
        </div>
      </Modal>

      {/* ========================================================= */}
      {/* DRAWER: BỘ LỌC NÂNG CAO */}
      {/* ========================================================= */}
      <Drawer
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#0062ff]" />
              <span className="font-black text-slate-900 text-sm">
                Bộ lọc doanh nghiệp nâng cao
              </span>
            </div>
            {activeAdvFilterCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0062ff] font-bold text-xs">
                Đang áp dụng: {activeAdvFilterCount}
              </span>
            )}
          </div>
        }
        open={isAdvancedFilterOpen}
        onClose={() => setIsAdvancedFilterOpen(false)}
        destroyOnHidden
        width={360}
        footer={
          <div className="flex items-center justify-between gap-2 p-1">
            <button
              type="button"
              onClick={() => {
                const reset = {
                  industry: "ALL",
                  size: "ALL",
                  status: "ALL",
                  location: "ALL",
                  foundedFrom: "",
                  foundedTo: "",
                  hasJobs: "ALL",
                };
                setAdvFilters(reset);
                setAppliedAdvFilters(reset);
                setIsAdvancedFilterOpen(false);
                message.info("Đã đặt lại bộ lọc nâng cao");
              }}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer bg-white"
            >
              Đặt lại
            </button>
            <button
              type="button"
              onClick={() => {
                setAppliedAdvFilters({ ...advFilters });
                setIsAdvancedFilterOpen(false);
                message.success("Đã áp dụng bộ lọc nâng cao");
              }}
              className="px-5 py-2 rounded-xl bg-[#0062ff] hover:bg-blue-700 text-white text-xs font-bold cursor-pointer border-none shadow-md shadow-blue-500/20"
            >
              Áp dụng bộ lọc
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Ngành nghề hoạt động</label>
            <Select
              value={advFilters.industry}
              onChange={(v) => setAdvFilters((prev) => ({ ...prev, industry: v }))}
              className="w-full text-xs"
              options={[
                { value: "ALL", label: "Tất cả ngành nghề" },
                { value: "Công nghệ thông tin", label: "Công nghệ thông tin" },
                { value: "Viễn thông", label: "Viễn thông" },
                { value: "Ngân hàng", label: "Ngân hàng" },
                { value: "Thương mại điện tử", label: "Thương mại điện tử" },
                { value: "Công nghệ tài chính", label: "Công nghệ tài chính" },
                { value: "Đa ngành", label: "Đa ngành" },
                { value: "Điện tử", label: "Điện tử" },
              ]}
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Quy mô nhân sự</label>
            <Select
              value={advFilters.size}
              onChange={(v) => setAdvFilters((prev) => ({ ...prev, size: v }))}
              className="w-full text-xs"
              options={[
                { value: "ALL", label: "Tất cả quy mô" },
                { value: "1.000 - 5.000", label: "1.000 - 5.000 nhân sự" },
                { value: "5.000 - 10.000", label: "5.000 - 10.000 nhân sự" },
                { value: "> 10.000", label: "> 10.000 nhân sự" },
              ]}
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Trạng thái xác minh</label>
            <Select
              value={advFilters.status}
              onChange={(v) => setAdvFilters((prev) => ({ ...prev, status: v }))}
              className="w-full text-xs"
              options={[
                { value: "ALL", label: "Tất cả trạng thái" },
                { value: "VERIFIED", label: "Đã xác minh" },
                { value: "PENDING", label: "Chờ xác minh" },
                { value: "REJECTED", label: "Bị từ chối" },
              ]}
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Khu vực đặt trụ sở</label>
            <Select
              value={advFilters.location}
              onChange={(v) => setAdvFilters((prev) => ({ ...prev, location: v }))}
              className="w-full text-xs"
              options={[
                { value: "ALL", label: "Tất cả khu vực" },
                { value: "Hà Nội", label: "Hà Nội" },
                { value: "TP. HCM", label: "TP. HCM" },
                { value: "Đà Nẵng", label: "Đà Nẵng" },
              ]}
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Năm thành lập</label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Từ năm (vd: 1990)"
                value={advFilters.foundedFrom}
                onChange={(e) => setAdvFilters((prev) => ({ ...prev, foundedFrom: e.target.value }))}
                className="rounded-xl text-xs h-9"
              />
              <Input
                placeholder="Đến năm (vd: 2024)"
                value={advFilters.foundedTo}
                onChange={(e) => setAdvFilters((prev) => ({ ...prev, foundedTo: e.target.value }))}
                className="rounded-xl text-xs h-9"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Hoạt động tuyển dụng</label>
            <Select
              value={advFilters.hasJobs}
              onChange={(v) => setAdvFilters((prev) => ({ ...prev, hasJobs: v }))}
              className="w-full text-xs"
              options={[
                { value: "ALL", label: "Tất cả doanh nghiệp" },
                { value: "YES", label: "Đang có tin tuyển dụng hoạt động" },
                { value: "NO", label: "Chưa có tin tuyển dụng nào" },
              ]}
            />
          </div>
        </div>
      </Drawer>
    </div>
  );
}

export default function AdminCompaniesPage() {
  return (
    <App>
      <AdminCompaniesContent />
    </App>
  );
}
