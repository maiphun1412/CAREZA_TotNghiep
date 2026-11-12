"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { candidateService, type CandidateDocument } from "@/services/candidate.service";
import { useAuthStore } from "@/store/auth-store";
import {
  Modal,
  Input,
  Button,
  Popconfirm,
  Spin,
  Tag,
  App,
  Switch,
  Select,
  Drawer,
  Dropdown,
} from "antd";
import {
  FilePdfOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
  StarOutlined,
  StarFilled,
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  UploadOutlined,
  LayoutOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  Home,
  User,
  FileText,
  Heart,
  Send,
  Calendar,
  Settings,
  ChevronDown,
  Zap,
  ShieldCheck,
  Star,
  Check,
  ChevronLeft,
  ChevronRight,
  Palette,
  Sliders,
  Lock,
  Briefcase,
  Headphones,
  ArrowRight,
  Sparkles,
  FilePlus,
  UploadCloud,
  CheckCircle2,
  Info,
  Trash2,
  RefreshCw,
  FileUp,
  RotateCcw,
  RotateCw,
  Eye,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Type,
  Paintbrush,
  Layers,
  Plus,
  Award,
  FolderGit2,
  HeartHandshake,
  BookOpen,
  Plane,
  Camera,
  Edit2,
  Phone,
  Mail,
  MapPin,
  Globe,
  GraduationCap,
  BarChart3,
  Search,
  MoreVertical,
  Upload,
  List as ListIcon,
  Grid as GridIcon,
  Copy,
  Lightbulb,
} from "lucide-react";
import FileUploader from "@/components/shared/file-uploader";

const { TextArea } = Input;

// 4 Mẫu CV chính hiển thị chuẩn như HÌNH MẪU 1
const FEATURED_TEMPLATES = [
  {
    id: "hien-dai",
    name: "Hiện đại",
    category: "hien-dai",
    color: "#0062ff",
    badge: "Phổ biến nhất",
    headerBg: "bg-blue-500",
    accentColor: "text-[#0062ff]",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    personName: "Nguyễn Mai Phương",
    jobTitle: "Senior Frontend Developer",
    summary: "3+ năm kinh nghiệm phát triển hệ thống web quy mô lớn với React & Next.js.",
  },
  {
    id: "toi-gian",
    name: "Tối giản",
    category: "toi-gian",
    color: "#10b981",
    badge: "Chuẩn ATS",
    headerBg: "bg-emerald-600",
    accentColor: "text-emerald-600",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    personName: "Nguyễn Mai Phương",
    jobTitle: "UI/UX Designer & Product Specialist",
    summary: "Đam mê thiết kế trải nghiệm trực quan, tối ưu chuyển đổi và thẩm mỹ hiện đại.",
  },
  {
    id: "chuyen-nghiep",
    name: "Chuyên nghiệp",
    category: "chuyen-nghiep",
    color: "#8b5cf6",
    badge: "Quản lý / Lead",
    headerBg: "bg-purple-600",
    accentColor: "text-purple-600",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
    personName: "NGUYỄN MAI PHƯƠNG",
    jobTitle: "Marketing & Brand Strategist",
    summary: "Chuyên gia xây dựng chiến lược truyền thông và quản lý thương hiệu đa kênh.",
  },
  {
    id: "sang-tao",
    name: "Sáng tạo",
    category: "sang-tao",
    color: "#f59e0b",
    badge: "Đột phá",
    headerBg: "bg-amber-500",
    accentColor: "text-amber-600",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    personName: "Nguyễn Mai Phương",
    jobTitle: "Creative Director / Content Lead",
    summary: "Định hình phong cách nội dung độc bản, sáng tạo chiến dịch viral đột phá.",
  },
  {
    id: "hien-dai-pro",
    name: "Công nghệ IT",
    category: "hien-dai",
    color: "#0284c7",
    badge: "Xu hướng",
    headerBg: "bg-sky-600",
    accentColor: "text-sky-600",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    personName: "Trần Anh Tuấn",
    jobTitle: "Fullstack Engineer & Cloud Architect",
    summary: "Kỹ sư phần mềm đam mê tối ưu kiến trúc vi dịch vụ và trải nghiệm người dùng cao cấp.",
  },
  {
    id: "toi-gian-pro",
    name: "Thanh lịch",
    category: "toi-gian",
    color: "#059669",
    badge: "Gọn gàng",
    headerBg: "bg-emerald-700",
    accentColor: "text-emerald-700",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    personName: "Lê Thu Hà",
    jobTitle: "Business Analyst / Product Owner",
    summary: "Cầu nối chuyển giao yêu cầu kinh doanh thành giải pháp công nghệ trực quan, hiệu quả.",
  },
  {
    id: "chuyen-nghiep-pro",
    name: "Lãnh đạo",
    category: "chuyen-nghiep",
    color: "#4f46e5",
    badge: "Cấp cao",
    headerBg: "bg-indigo-600",
    accentColor: "text-indigo-600",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    personName: "Hoàng Minh Trí",
    jobTitle: "Operations Director / Chief of Staff",
    summary: "10+ năm điều hành chiến lược mở rộng quy mô kinh doanh và tối ưu hóa vận hành tổ chức.",
  },
  {
    id: "sang-tao-pro",
    name: "Đồ họa số",
    category: "sang-tao",
    color: "#ea580c",
    badge: "Ấn tượng",
    headerBg: "bg-orange-500",
    accentColor: "text-orange-600",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    personName: "Phạm Thảo Vy",
    jobTitle: "Senior Brand & Visual Designer",
    summary: "Kiến tạo ngôn ngữ thị giác truyền cảm hứng, xây dựng bộ nhận diện đa phương tiện.",
  },
];

// Danh mục phong cách bộ lọc bên trái
const STYLE_FILTERS = [
  { id: "all", label: "Tất cả mẫu", count: "20+ mẫu" },
  { id: "hien-dai", label: "Hiện đại", count: "8 mẫu" },
  { id: "toi-gian", label: "Tối giản", count: "6 mẫu" },
  { id: "sang-tao", label: "Sáng tạo", count: "4 mẫu" },
  { id: "chuyen-nghiep", label: "Chuyên nghiệp", count: "5 mẫu" },
];



function CvHubContent() {
  const { message } = App.useApp();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  // States danh sách CV
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<CandidateDocument[]>([]);

  // States cho Upload Tab nghiệp vụ thật
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States cho Upload & AI Review Flow cũ
  const [uploadedFileDoc, setUploadedFileDoc] = useState<any>(null);
  const [isParsingCv, setIsParsingCv] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);

  // States cho CV Builder (Tạo CV Online Workspace)
  const [cvTitle, setCvTitle] = useState(user?.fullName ? `CV của ${user.fullName}` : "CV của Mai Phương");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [activeLeftTool, setActiveLeftTool] = useState<"content" | "templates" | "design" | "colors">("content");
  const [activeRightTab, setActiveRightTab] = useState<"font" | "color" | "layout">("font");
  const [selectedSection, setSelectedSection] = useState<string>("info");
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(80);
  const [selectedFont, setSelectedFont] = useState<string>("Inter");
  const [fontSizeScale, setFontSizeScale] = useState<"small" | "normal" | "large">("normal");
  const [layoutStyle, setLayoutStyle] = useState<"rounded" | "modern" | "minimal">("rounded");
  const [showBgDecoration, setShowBgDecoration] = useState<boolean>(true);
  const [isSaved, setIsSaved] = useState(true);

  // States chọn Template & Stepper
  const [selectedTemplate, setSelectedTemplate] = useState("hien-dai");
  const [selectedStyleFilter, setSelectedStyleFilter] = useState("all");
  const [currentStep, setCurrentStep] = useState(1);
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);

  // States cho CV Builder (Tạo CV Online)
  const [cvThemeColor, setCvThemeColor] = useState("#10b981");
  const [cvForm, setCvForm] = useState({
    fullName: user?.fullName || "Nguyễn Mai Phương",
    jobTitle: "Product Designer",
    email: user?.email || "maiphuong@gmail.com",
    phone: "0123 456 789",
    location: "TP. Hồ Chí Minh",
    website: "linkedin.com/in/maiphuong",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    summary:
      "Là một Product Designer với 2 năm kinh nghiệm trong việc thiết kế sản phẩm số, tôi luôn mong muốn tạo ra những trải nghiệm người dùng đơn giản, hiệu quả và mang lại giá trị thực tế cho cộng đồng.",
    experience: [
      {
        period: "2023 - Hiện tại",
        role: "Product Designer",
        company: "ABC Company",
        bullets: [
          "Thiết kế giao diện web/app, tối ưu trải nghiệm người dùng",
          "Làm việc với team Product, Developer và Marketing",
          "Tham gia xây dựng hệ thống design system",
        ],
      },
      {
        period: "2022 - 2023",
        role: "UI/UX Intern",
        company: "XYZ Company",
        bullets: [
          "Hỗ trợ thiết kế giao diện, banner, hình ảnh marketing",
          "Nghiên cứu hành vi người dùng, tham gia test sản phẩm",
        ],
      },
    ],
    education: [
      {
        period: "2018 - 2022",
        school: "Đại học Công nghệ Thông tin",
        major: "Thiết kế đồ họa số",
        gpa: "3.5/4.0",
      },
    ],
    skills: ["Figma", "UI/UX Design", "Photoshop", "Communication", "Teamwork"],
    languages: [
      { name: "Tiếng Việt", level: 100 },
      { name: "Tiếng Anh", level: 80 },
    ],
    hobbies: ["Đọc sách", "Du lịch", "Chụp ảnh"],
    certifications: [
      { year: "2023", title: "Google UX Design Professional Certificate" },
      { year: "2022", title: "IELTS 7.0" },
    ],
    projects: [
      { name: "Careza Job Portal", role: "Lead UI/UX", desc: "Nền tảng tuyển dụng thông minh kết nối nhân tài với doanh nghiệp" },
    ],
    activities: [
      { name: "Thành viên CLB Thiết kế UIT", role: "Ban tổ chức workshop UI/UX 2023" },
    ],
  });

  const handleDownloadCv = (cv?: any) => {
    if (cv?.fileUrl && (cv.fileUrl.startsWith("http") || cv.fileUrl.startsWith("blob:") || cv.fileUrl.startsWith("data:"))) {
      window.open(cv.fileUrl, "_blank");
      message.success("Đang mở tệp CV...");
      return;
    }
    if (cv?.id && cv?.isBuilderCv) {
      router.push(`/ung-vien/cv/builder?id=${cv.id}`);
      message.info("Đang chuyển đến Studio để xuất bản PDF...");
      return;
    }
    message.loading({ content: "Đang tạo bản in chuẩn...", key: "downloadCv" });
    setTimeout(() => {
      message.success({ content: "Đã sẵn sàng tải xuống!", key: "downloadCv" });
      window.print();
    }, 600);
  };

  const tabParam = searchParams.get("tab") || "my-cv";
  const [activeTab, setActiveTab] = useState(tabParam);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");

  useEffect(() => {
    try {
      const savedMode = localStorage.getItem("careza_cv_view_mode");
      if (savedMode === "list" || savedMode === "grid") {
        setViewMode(savedMode);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSetViewMode = (mode: "list" | "grid") => {
    setViewMode(mode);
    try {
      localStorage.setItem("careza_cv_view_mode", mode);
    } catch {
      // ignore
    }
  };
  const [selectedCvForPreview, setSelectedCvForPreview] = useState<any>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  useEffect(() => {
    setActiveTab(searchParams.get("tab") || "my-cv");
  }, [searchParams]);

  // Fetch Documents
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await candidateService.getDocuments({ type: "CV", includeVersions: true });
      setDocuments(response.data.documents || []);
    } catch (error) {
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDocuments();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleSetDefault = async (id: string) => {
    try {
      await candidateService.setDefaultCv(id);
      message.success("Đã đặt làm CV chính thành công!");
      fetchDocuments();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Thao tác thất bại.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await candidateService.deleteDocument(id);
      message.success("Đã xóa CV thành công!");
      fetchDocuments();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Xóa CV thất bại.");
    }
  };

  // Upload Logic định dạng thật
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleFileSelect = (file: File) => {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (![".pdf", ".doc", ".docx"].includes(ext)) {
      message.error("Chỉ chấp nhận file định dạng PDF, DOC, DOCX!");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      message.error("Dung lượng file không được vượt quá 10MB!");
      return;
    }
    setSelectedFile(file);
    setUploadSuccess(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleUploadSubmit = async () => {
    if (documents.length >= 5) {
      message.error("Bạn đã lưu tối đa 5 CV. Vui lòng xóa một CV không còn sử dụng để lưu CV mới.");
      return;
    }
    if (!selectedFile) {
      message.warning("Vui lòng chọn file CV từ máy tính trước!");
      return;
    }
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("documentType", "CV");
    formData.append("title", selectedFile.name.replace(/\.[^/.]+$/, ""));

    try {
      const response = await candidateService.uploadDocument(formData);
      message.success("Tải CV lên thành công!");
      setUploadSuccess(true);
      fetchDocuments();
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.errors?.limit?.[0] ||
        "Tải tài liệu lên thất bại.";
      message.error(errorMsg);
    } finally {
      setIsUploading(false);
    }
  };

  // Upload CV Success Handler (AI Parser)
  const handleUploadSuccess = (doc?: any) => {
    setUploadedFileDoc(doc || { name: "CV_Ung_Vien.pdf" });
    setIsParsingCv(true);

    setTimeout(() => {
      setIsParsingCv(false);
      setParsedData({
        fullName: user?.fullName || "Nguyễn Mai Phương",
        email: user?.email || "maiphuong@gmail.com",
        phone: "0912 345 678",
        targetTitle: "Senior Frontend Developer",
        experience: "3 năm kinh nghiệm trong phát triển ứng dụng React/Next.js",
        skills: ["React", "TypeScript", "Tailwind CSS", "Next.js"],
        education: "Cử nhân Công nghệ Thông tin - Đại học Bách Khoa",
      });
      fetchDocuments();
      message.success("Đã tải lên tệp CV thành công!");
    }, 800);
  };

  // Lọc CV phiên bản mới nhất
  const getLatestCvs = () => {
    const latestMap: Record<string, CandidateDocument> = {};
    documents.forEach((doc) => {
      const key = doc.documentGroupId || doc.documentId;
      if (!latestMap[key] || doc.versionNumber > latestMap[key].versionNumber) {
        latestMap[key] = doc;
      }
    });
    return Object.values(latestMap);
  };

  const latestCvs = getLatestCvs();

  // Danh sách template hiển thị theo filter
  const displayedTemplates =
    selectedStyleFilter === "all"
      ? FEATURED_TEMPLATES
      : FEATURED_TEMPLATES.filter((t) => t.category === selectedStyleFilter);

  if (activeTab === "upload") {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 space-y-3.5 sm:space-y-4 -mb-10 sm:-mb-12 pb-0">
        {/* Header Box / Banner Tải CV Lên */}
        <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-r from-blue-50/80 via-white to-blue-50/50 border border-blue-200/90 shadow-2xs py-3.5 px-5 sm:px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="space-y-1">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Link href="/ung-vien/ho-so" className="text-slate-500 hover:text-[#0062ff] transition-colors">‹ Ứng viên</Link>
              <span className="text-slate-300">/</span>
              <button
                type="button"
                onClick={() => setActiveTab("my-cv")}
                className="text-slate-500 hover:text-[#0062ff] transition-colors p-0 bg-transparent border-none cursor-pointer text-xs"
              >
                CV của tôi
              </button>
              <span className="text-slate-300">/</span>
              <span className="text-[#0062ff] font-semibold">Tải CV lên</span>
            </div>

            {/* Heading + Badge */}
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0">
                Tải CV lên
              </h1>
              <span className="bg-blue-100/80 text-[#0062ff] text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-blue-200 shadow-2xs">
                CAREZA CV Uploader
              </span>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-[13px] text-slate-600 font-medium m-0 max-w-2xl leading-relaxed">
              Đăng tải bản CV có sẵn (PDF, Word) vào hồ sơ Careza để lưu trữ an toàn, quản lý tập trung và sẵn sàng ứng tuyển bất kỳ lúc nào.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("my-cv")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:text-[#0062ff] hover:border-blue-300 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              <span>Quay lại danh sách CV</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("builder")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-[#0062ff] hover:bg-blue-100 text-xs font-bold shadow-2xs transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tạo CV online</span>
            </button>
          </div>
        </div>

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Cột trái (8 cols / ~67%): Vùng Upload & Quy trình */}
          <div className="lg:col-span-8 space-y-3.5">
            {/* Cảnh báo giới hạn CV nếu đạt >= 5 */}
            {documents.length >= 5 && (
              <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-3 sm:p-3.5 flex items-start sm:items-center justify-between gap-3 text-amber-900 text-xs shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Info className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="font-bold block">Tài khoản đã lưu tối đa 5/5 CV</span>
                    <span className="text-amber-700/90 text-[11px] block mt-0.5">
                      Vui lòng xóa bớt CV không còn sử dụng để tiếp tục tải lên bản mới.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("my-cv")}
                  className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 font-bold hover:bg-amber-100/50 text-xs shrink-0 cursor-pointer transition-colors"
                >
                  Quản lý CV
                </button>
              </div>
            )}

            {/* Khung Upload chính */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-black text-slate-900 m-0">
                    Khu vực tải tài liệu hồ sơ
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium m-0 mt-0.5">
                    Hỗ trợ kéo thả trực tiếp hoặc chọn file từ thiết bị của bạn
                  </p>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0062ff]" />
                  Mã hóa bảo mật
                </span>
              </div>

              {/* Vùng Dropzone tương tác */}
              <div
                onDragOver={(e) => {
                  if (documents.length < 5) handleDragOver(e);
                }}
                onDragLeave={handleDragLeave}
                onDrop={(e) => {
                  if (documents.length >= 5) {
                    e.preventDefault();
                    message.error("Bạn đã lưu tối đa 5 CV. Vui lòng xóa một CV không còn sử dụng để lưu CV mới.");
                    return;
                  }
                  handleDrop(e);
                }}
                onClick={() => {
                  if (documents.length >= 5) {
                    message.error("Bạn đã lưu tối đa 5 CV. Vui lòng xóa một CV không còn sử dụng để lưu CV mới.");
                    return;
                  }
                  fileInputRef.current?.click();
                }}
                className={`border-2 border-dashed rounded-2xl p-5 sm:p-6 flex flex-col items-center justify-center text-center transition-all min-h-[200px] ${documents.length >= 5
                    ? "border-slate-200 bg-slate-50/70 cursor-not-allowed opacity-80"
                    : isDragOver
                      ? "border-[#0062ff] bg-blue-50/80 scale-[1.008] shadow-inner cursor-pointer"
                      : "border-blue-300/80 bg-blue-50/20 hover:bg-blue-50/45 hover:border-[#0062ff] cursor-pointer"
                  }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                {/* Biểu tượng Upload đám mây */}
                <div className="w-12 h-12 rounded-xl bg-blue-100/70 text-[#0062ff] flex items-center justify-center mb-2.5 shadow-2xs group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-6 h-6 stroke-[2.2]" />
                </div>

                {/* Tiêu đề & Hướng dẫn */}
                <h3 className="text-sm sm:text-base font-black text-slate-900 m-0 mb-0.5">
                  Kéo thả file CV vào khu vực này
                </h3>
                <span className="text-[11px] text-slate-400 font-medium mb-2.5">hoặc click để duyệt file</span>

                {/* Nút bấm chọn file */}
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 bg-[#0062ff] hover:bg-blue-700 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer border-none"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Chọn file từ máy tính</span>
                </button>

                {/* Định dạng hỗ trợ */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 text-xs text-slate-500 font-medium">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-white text-slate-700 text-[10.5px] font-semibold border border-slate-200">
                    PDF
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-white text-slate-700 text-[10.5px] font-semibold border border-slate-200">
                    DOC
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-white text-slate-700 text-[10.5px] font-semibold border border-slate-200">
                    DOCX
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[11px]">Dung lượng tối đa: <strong className="text-slate-800">10MB</strong></span>
                </div>
              </div>
            </div>

            {/* Quy trình xử lý hồ sơ (3 bước ngang) */}
            <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-2xs space-y-2.5">
              <h3 className="text-xs sm:text-[13px] font-black text-slate-900 m-0 flex items-center gap-2">
                <span>Quy trình xử lý hồ sơ tự động</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Bước 1 */}
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                  <div className="w-5 h-5 rounded-full bg-[#0062ff] text-white font-black text-[11px] flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 block leading-tight">
                      Chọn file CV
                    </span>
                    <span className="text-[10.5px] text-slate-500 font-medium block mt-0.5">
                      Định dạng PDF hoặc Word
                    </span>
                  </div>
                </div>

                {/* Bước 2 */}
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                  <div className="w-5 h-5 rounded-full bg-[#0062ff] text-white font-black text-[11px] flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 block leading-tight">
                      Tải & mã hóa an toàn
                    </span>
                    <span className="text-[10.5px] text-slate-500 font-medium block mt-0.5">
                      Lưu trữ bảo mật cao
                    </span>
                  </div>
                </div>

                {/* Bước 3 */}
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                  <div className="w-5 h-5 rounded-full bg-[#0062ff] text-white font-black text-[11px] flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 block leading-tight">
                      Sẵn sàng ứng tuyển
                    </span>
                    <span className="text-[10.5px] text-slate-500 font-medium block mt-0.5">
                      Nộp hồ sơ ngay chỉ với 1 click
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cột phải (4 cols / ~33%): Trạng thái file, Hướng dẫn & Gợi ý */}
          <div className="lg:col-span-4 space-y-3.5">
            {/* Card Trạng thái File */}
            <div className="bg-white rounded-2xl p-4 sm:p-4.5 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900 m-0">
                  Trạng thái tải lên
                </h3>
                {selectedFile && (
                  <span className="text-[11px] font-bold text-slate-500">
                    {formatFileSize(selectedFile.size)}
                  </span>
                )}
              </div>

              {/* Trạng thái 1: Chưa chọn file */}
              {!selectedFile && (
                <div className="bg-slate-50/80 rounded-xl p-4 border border-dashed border-slate-200 flex flex-col items-center justify-center text-center min-h-[115px]">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-400 flex items-center justify-center mb-1.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 block mb-0.5">
                    Chưa có file nào được chọn
                  </span>
                  <p className="text-[11px] text-slate-500 font-medium m-0 leading-relaxed max-w-[210px]">
                    Hãy chọn hoặc kéo thả file CV của bạn vào khung bên cạnh để bắt đầu.
                  </p>
                </div>
              )}

              {/* Trạng thái 2: Đã chọn file & chưa upload xong */}
              {selectedFile && !uploadSuccess && (
                <div className="bg-blue-50/40 rounded-xl p-3.5 border border-blue-200/80 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#0062ff] flex items-center justify-center font-black text-xs shrink-0 uppercase shadow-2xs">
                      {selectedFile.name.split(".").pop()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-slate-900 block truncate" title={selectedFile.name}>
                        {selectedFile.name}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                        {formatFileSize(selectedFile.size)}
                      </span>
                      <span className="inline-block mt-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-emerald-200">
                        Sẵn sàng tải lên
                      </span>
                    </div>
                  </div>

                  {/* Nút thao tác đổi / xóa file */}
                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:text-[#0062ff] hover:border-blue-200 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                    >
                      Đổi file khác
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="py-1.5 px-3 rounded-lg border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                    >
                      Xóa
                    </button>
                  </div>

                  {/* Nút xác nhận tải lên */}
                  <Button
                    type="primary"
                    loading={isUploading}
                    onClick={handleUploadSubmit}
                    className="w-full bg-[#0062ff] hover:bg-blue-700 text-white font-bold h-9 rounded-xl shadow-md shadow-blue-500/20 text-xs"
                  >
                    {isUploading ? "Đang tải hồ sơ lên..." : "Xác nhận tải CV lên"}
                  </Button>
                </div>
              )}

              {/* Trạng thái 3: Upload thành công */}
              {selectedFile && uploadSuccess && (
                <div className="bg-emerald-50/90 rounded-xl p-3.5 border border-emerald-200 text-center space-y-2.5">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-900 block">
                      Tải CV lên thành công!
                    </span>
                    <p className="text-[11px] text-emerald-700 font-medium m-0 mt-0.5">
                      CV đã được lưu an toàn vào danh sách hồ sơ của bạn.
                    </p>
                  </div>

                  <div className="pt-0.5 flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={() => setActiveTab("my-cv")}
                      className="w-full bg-[#0062ff] hover:bg-blue-700 text-white font-bold py-1.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer border-none"
                    >
                      <span>Xem danh sách CV</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setUploadSuccess(false);
                      }}
                      className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 py-0.5 bg-transparent border-none cursor-pointer"
                    >
                      Tải thêm CV khác
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Card Hướng dẫn & Lưu ý */}
            <div className="bg-[#f8faff] rounded-2xl p-3.5 sm:p-4 border border-blue-100 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Info className="w-4 h-4 text-[#0062ff]" />
                <span>Lưu ý khi tải CV</span>
              </div>
              <ul className="space-y-1 pl-4 m-0 text-[11px] text-slate-600 font-medium list-disc leading-relaxed">
                <li>Ưu tiên định dạng <strong className="text-slate-800">PDF</strong> để giữ nguyên font chữ và căn chỉnh bố cục.</li>
                <li>Dung lượng file tối đa là <strong className="text-slate-800">10MB</strong>.</li>
                <li>Mỗi tài khoản lưu tối đa <strong className="text-slate-800">5 CV</strong> đồng thời.</li>
                <li>Thông tin hồ sơ chỉ được chia sẻ khi bạn chủ động nộp đơn.</li>
              </ul>
            </div>

            {/* Card Gợi ý Tạo CV Online */}
            <div className="bg-gradient-to-br from-indigo-50/70 to-blue-50/50 rounded-2xl p-3.5 sm:p-4 border border-blue-200/70 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Sparkles className="w-4 h-4 text-[#0062ff]" />
                <span>Chưa có sẵn file CV?</span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium m-0 leading-relaxed">
                Tạo hồ sơ chuyên nghiệp chuẩn ATS ngay trên CAREZA CV Studio với đa dạng mẫu thiết kế và gợi ý nội dung.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("builder")}
                className="inline-flex items-center justify-between w-full px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 border border-blue-200 text-[#0062ff] font-bold text-xs shadow-2xs transition-all cursor-pointer"
              >
                <span>Khám phá CV Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Thanh Bảo Mật Cuối Trang */}
        <div className="bg-slate-50/80 rounded-2xl py-2.5 px-4 sm:px-5 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100/80 text-[#0062ff] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 m-0">
                Cam kết bảo mật thông tin ứng viên
              </h4>
              <p className="text-[11px] text-slate-500 font-medium m-0 mt-0.5">
                Hồ sơ của bạn được mã hóa an toàn theo tiêu chuẩn bảo mật dữ liệu và thuộc quyền sở hữu riêng tư của bạn.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Hệ thống bảo vệ dữ liệu CAREZA</span>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "builder") {
    return (
      <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-5 md:px-6 space-y-3.5">
        {/* Header & Controls Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
              <Link href="/ung-vien/ho-so" className="text-slate-500 hover:text-[#0062ff]">‹ Ứng viên</Link>
              <span className="text-slate-400">&gt;</span>
              <Link href="/ung-vien/cv" className="text-slate-500 hover:text-[#0062ff]">CV của tôi</Link>
              <span className="text-slate-400">&gt;</span>
              <span className="text-[#0062ff] font-bold">Tạo CV online</span>
            </div>

            {/* Heading + Badge */}
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight m-0">
                Tạo CV online
              </h1>
              <span className="bg-[#e0edff] text-[#0062ff] text-xs font-extrabold px-3 py-0.5 rounded-full border border-blue-200/90 shadow-2xs">
                Biến ý tưởng thành cơ hội
              </span>
            </div>
          </div>

          {/* Thanh công cụ duy nhất (44-48px) */}
          <div className="h-11 sm:h-12 bg-white rounded-2xl border border-slate-200/90 shadow-2xs px-2.5 sm:px-3 flex items-center justify-between gap-2.5 shrink-0">
            {/* Bên trái: Quay lại & Tên CV chỉnh sửa */}
            <div className="flex items-center gap-2 min-w-0">
              <Link
                href="/ung-vien/cv"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all shrink-0 no-underline"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Quay lại</span>
              </Link>

              <div className="h-4 w-px bg-slate-200 shrink-0" />

              {/* Editable CV Name */}
              <div className="flex items-center gap-1.5 px-1 py-1 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer group">
                <FileText className="w-3.5 h-3.5 text-[#0062ff] shrink-0" />
                {isEditingTitle ? (
                  <input
                    type="text"
                    value={cvTitle}
                    onChange={(e) => setCvTitle(e.target.value)}
                    onBlur={() => setIsEditingTitle(false)}
                    onKeyDown={(e) => e.key === "Enter" && setIsEditingTitle(false)}
                    autoFocus
                    className="border border-[#0062ff] outline-hidden bg-white px-1.5 py-0.5 rounded text-xs font-bold w-36 sm:w-44"
                  />
                ) : (
                  <span onClick={() => setIsEditingTitle(true)} className="truncate max-w-[130px] sm:max-w-[190px]" title="Nhấn để đổi tên CV">
                    {cvTitle}
                  </span>
                )}
                <Edit2
                  onClick={() => setIsEditingTitle(!isEditingTitle)}
                  className="w-3 h-3 text-slate-400 group-hover:text-slate-600 shrink-0"
                />
              </div>
            </div>

            {/* Ở giữa: Trạng thái đã lưu nhỏ gọn */}
            <div className="hidden md:flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/70 shrink-0">
              <Check className="w-3 h-3 stroke-[2.5]" />
              <span>Đã lưu 10:42</span>
            </div>

            {/* Bên phải: Nhóm công cụ phụ + Xem trước + Tải xuống */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Nhóm công cụ phụ (Hoàn tác / Làm lại / Studio) */}
              <div className="flex items-center gap-0.5 bg-slate-50 border border-slate-200/80 p-0.5 rounded-xl">
                <button
                  type="button"
                  title="Hoàn tác"
                  onClick={() => message.info("Đã hoàn tác thao tác trước")}
                  className="w-7 h-7 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white flex items-center justify-center cursor-pointer border-none bg-transparent transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="Làm lại"
                  onClick={() => message.info("Đã làm lại thao tác")}
                  className="w-7 h-7 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white flex items-center justify-center cursor-pointer border-none bg-transparent transition-all"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>

                <div className="h-3.5 w-px bg-slate-200 mx-0.5" />

                <Link
                  href="/ung-vien/cv/builder"
                  title="Mở Studio Toàn Màn Hình"
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-slate-600 hover:text-[#0062ff] hover:bg-white text-[11px] font-bold transition-all no-underline"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#0062ff]" />
                  <span className="hidden xl:inline">Studio</span>
                </Link>
              </div>

              {/* Nút Xem trước */}
              <button
                type="button"
                onClick={() => setIsEditorModalOpen(true)}
                className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 font-bold px-3 py-1.5 rounded-xl text-xs border border-slate-200 shadow-2xs transition-all cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Xem trước</span>
              </button>

              {/* Nút chính: Tải xuống */}
              <button
                type="button"
                onClick={handleDownloadCv}
                className="inline-flex items-center gap-1.5 bg-[#0062ff] hover:bg-blue-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs shadow-xs shadow-blue-500/20 transition-all cursor-pointer border-none"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải xuống</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3-COLUMN WORKSPACE: LEFT TOOLS | CV CANVAS | RIGHT SETTINGS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">

          {/* CỘT 1: LEFT TOOLBAR + CONTENT PANEL (3 cols) */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex overflow-hidden min-h-[660px]">
            {/* Vertical Slim Icon Bar */}
            <div className="w-[62px] shrink-0 border-r border-slate-100 bg-[#fbfcfe] p-1.5 flex flex-col gap-2 items-center select-none">
              <button
                onClick={() => setActiveLeftTool("content")}
                className={`w-full py-2.5 px-1 rounded-xl flex flex-col items-center gap-1 text-[10px] font-bold transition-all border-none cursor-pointer ${activeLeftTool === "content"
                  ? "bg-[#eef5ff] text-[#0062ff] shadow-2xs"
                  : "bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                  }`}
              >
                <FileText className="w-4 h-4" />
                <span>Nội dung</span>
              </button>

              <button
                onClick={() => setActiveLeftTool("templates")}
                className={`w-full py-2.5 px-1 rounded-xl flex flex-col items-center gap-1 text-[10px] font-bold transition-all border-none cursor-pointer ${activeLeftTool === "templates"
                  ? "bg-[#eef5ff] text-[#0062ff] shadow-2xs"
                  : "bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                  }`}
              >
                <LayoutOutlined className="text-sm" />
                <span>Mẫu CV</span>
              </button>

              <button
                onClick={() => setActiveLeftTool("design")}
                className={`w-full py-2.5 px-1 rounded-xl flex flex-col items-center gap-1 text-[10px] font-bold transition-all border-none cursor-pointer ${activeLeftTool === "design"
                  ? "bg-[#eef5ff] text-[#0062ff] shadow-2xs"
                  : "bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                  }`}
              >
                <Paintbrush className="w-4 h-4" />
                <span>Thiết kế</span>
              </button>

              <button
                onClick={() => setActiveLeftTool("colors")}
                className={`w-full py-2.5 px-1 rounded-xl flex flex-col items-center gap-1 text-[10px] font-bold transition-all border-none cursor-pointer ${activeLeftTool === "colors"
                  ? "bg-[#eef5ff] text-[#0062ff] shadow-2xs"
                  : "bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                  }`}
              >
                <Palette className="w-4 h-4" />
                <span>Màu sắc</span>
              </button>
            </div>

            {/* Subpanel Content */}
            <div className="flex-1 p-3.5 space-y-3 min-w-0">
              {activeLeftTool === "content" && (
                <div>
                  <h3 className="text-xs font-black text-slate-900 m-0">Nội dung CV</h3>


                  <div className="space-y-1.5">
                    {[
                      { id: "info", label: "Thông tin cá nhân", icon: User },
                      { id: "summary", label: "Giới thiệu bản thân", icon: FileText },
                      { id: "experience", label: "Kinh nghiệm làm việc", icon: Briefcase },
                      { id: "education", label: "Học vấn", icon: GraduationCap },
                      { id: "skills", label: "Kỹ năng", icon: BarChart3 },
                      { id: "certifications", label: "Chứng chỉ", icon: Award },
                      { id: "projects", label: "Dự án", icon: FolderGit2 },
                      { id: "activities", label: "Hoạt động", icon: HeartHandshake },
                      { id: "hobbies", label: "Sở thích", icon: Heart },
                    ].map((sec) => {
                      const IconComp = sec.icon;
                      const isSelected = selectedSection === sec.id;
                      return (
                        <button
                          key={sec.id}
                          onClick={() => {
                            setSelectedSection(sec.id);
                            setIsSectionModalOpen(true);
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-left border ${isSelected
                            ? "bg-[#eef5ff] border-blue-200 text-[#0062ff] shadow-2xs"
                            : "bg-[#f8fafc] border-slate-100 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                            }`}
                        >
                          <IconComp className={`w-3.5 h-3.5 ${isSelected ? "text-[#0062ff]" : "text-slate-400"}`} />
                          <span className="flex-1 truncate">{sec.label}</span>
                          <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100" />
                        </button>
                      );
                    })}

                    <button
                      onClick={() => {
                        setSelectedSection("info");
                        setIsSectionModalOpen(true);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#0062ff] bg-white border border-dashed border-blue-200 hover:bg-blue-50/60 transition-all cursor-pointer mt-2"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm mục khác</span>
                    </button>
                  </div>
                </div>
              )}

              {activeLeftTool === "templates" && (
                <div>
                  <h3 className="text-xs font-black text-slate-900 m-0">Mẫu CV</h3>
                  <p className="text-[11px] text-slate-500 font-medium m-0 mt-0.5 mb-3">
                    Chọn mẫu giao diện chuẩn
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {FEATURED_TEMPLATES.map((tpl) => (
                      <div
                        key={tpl.id}
                        onClick={() => {
                          setSelectedTemplate(tpl.id);
                          setCvThemeColor(tpl.color);
                          message.success(`Đã áp dụng mẫu: ${tpl.name}`);
                        }}
                        className={`p-2 rounded-xl border cursor-pointer text-center transition-all ${selectedTemplate === tpl.id
                          ? "border-[#0062ff] bg-blue-50/50 shadow-2xs font-bold text-[#0062ff]"
                          : "border-slate-200 hover:border-slate-300 text-slate-700 font-medium"
                          }`}
                      >
                        <div className="w-full aspect-[3/4] bg-slate-100 rounded-lg mb-1.5 overflow-hidden border border-slate-200/60 flex items-center justify-center text-[9px] text-slate-400">
                          {tpl.name}
                        </div>
                        <span className="text-[11px] block truncate">{tpl.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeLeftTool === "design" && (
                <div>
                  <h3 className="text-xs font-black text-slate-900 m-0">Bố cục CV</h3>
                  <p className="text-[11px] text-slate-500 font-medium m-0 mt-0.5 mb-3">
                    Tùy chỉnh kiểu dáng hiển thị
                  </p>
                  <div className="space-y-2">
                    {[
                      { id: "rounded", label: "Bo góc hiện đại" },
                      { id: "modern", label: "Chuẩn tuyển dụng HR" },
                      { id: "minimal", label: "Tối giản ATS" },
                    ].map((ly) => (
                      <button
                        key={ly.id}
                        onClick={() => setLayoutStyle(ly.id as any)}
                        className={`w-full p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${layoutStyle === ly.id
                          ? "border-[#0062ff] bg-blue-50 text-[#0062ff]"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                      >
                        {ly.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeLeftTool === "colors" && (
                <div>
                  <h3 className="text-xs font-black text-slate-900 m-0">Màu chủ đạo</h3>
                  <p className="text-[11px] text-slate-500 font-medium m-0 mt-0.5 mb-3">
                    Chọn màu sắc đồng bộ CV
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {["#10b981", "#0062ff", "#8b5cf6", "#f59e0b", "#ec4899", "#6366f1"].map((col) => (
                      <button
                        key={col}
                        onClick={() => setCvThemeColor(col)}
                        style={{ backgroundColor: col }}
                        className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${cvThemeColor === col ? "border-slate-900 scale-110 shadow-xs" : "border-white shadow-2xs"
                          }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CỘT 2: CV CANVAS Ở GIỮA (6 cols) */}
          <div className="lg:col-span-6 bg-[#f4f7fa] rounded-2xl border border-slate-200/90 p-3 sm:p-3.5 flex flex-col items-center justify-start min-h-[660px] select-none">
            {/* Canvas Top Controls Toolbar */}
            <div className="w-full flex items-center justify-between mb-3 px-1 text-xs text-slate-500 font-bold">
              <div className="flex items-center gap-1 bg-white border border-slate-200/90 px-2.5 py-1 rounded-lg shadow-2xs">
                <ChevronLeft className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                <span className="text-[11px]">Trang 1/1</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-2 bg-white border border-slate-200/90 px-2.5 py-1 rounded-lg shadow-2xs">
                <button
                  onClick={() => setZoomLevel(Math.max(60, zoomLevel - 10))}
                  className="hover:text-slate-900 cursor-pointer bg-transparent border-none font-bold"
                >
                  -
                </button>
                <span className="text-[11px] font-bold text-slate-700 min-w-[32px] text-center">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel(Math.min(120, zoomLevel + 10))}
                  className="hover:text-slate-900 cursor-pointer bg-transparent border-none font-bold"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => setIsEditorModalOpen(true)}
                className="p-1.5 rounded-lg bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-600 shadow-2xs cursor-pointer"
                title="Toàn màn hình"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* A4 CV SHEET CONTAINER */}
            <div
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: "top center",
                transition: "transform 0.15s ease",
              }}
              className={`w-full max-w-[570px] bg-white rounded-2xl shadow-md border border-slate-200/90 overflow-hidden flex flex-col sm:flex-row text-[10px] leading-snug`}
            >
              {/* Left Column of CV (38% soft pastel background) */}
              <div
                style={{
                  backgroundColor: cvThemeColor === "#10b981" ? "#edf7ed" :
                    cvThemeColor === "#0062ff" ? "#eef5ff" :
                      cvThemeColor === "#8b5cf6" ? "#f5f0ff" :
                        cvThemeColor === "#f59e0b" ? "#fef7ea" : "#fdf2f8",
                }}
                className="w-full sm:w-[38%] p-3.5 flex flex-col justify-between space-y-3.5 border-r border-slate-100"
              >
                {/* Avatar & Name */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-18 h-18 rounded-full overflow-hidden border-2 border-white shadow-xs mb-2">
                    <img
                      src={cvForm.avatar}
                      alt={cvForm.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="bg-slate-900 text-white font-black text-[10.5px] px-2.5 py-1 rounded-md tracking-wide shadow-2xs w-full truncate">
                    {cvForm.fullName.toUpperCase()}
                  </div>
                  <span className="text-[9.5px] font-bold text-slate-600 mt-1 block truncate">
                    {cvForm.jobTitle}
                  </span>
                </div>

                {/* Liên hệ */}
                <div className="space-y-1.5 pt-1">
                  <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-wider m-0 pb-0.5 border-b border-slate-200/80">
                    Liên hệ
                  </h4>
                  <div className="space-y-1 text-[9px] text-slate-600 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                      <span className="truncate">{cvForm.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                      <span className="truncate">{cvForm.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                      <span className="truncate">{cvForm.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Globe className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                      <span className="truncate">{cvForm.website}</span>
                    </div>
                  </div>
                </div>

                {/* Kỹ năng */}
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-wider m-0 pb-0.5 border-b border-slate-200/80">
                    Kỹ năng
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {cvForm.skills.map((sk, idx) => (
                      <span
                        key={idx}
                        className="bg-white/90 text-slate-800 text-[8.5px] font-bold px-1.5 py-0.5 rounded-md border border-slate-200/60 shadow-2xs"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Ngôn ngữ */}
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-wider m-0 pb-0.5 border-b border-slate-200/80">
                    Ngôn ngữ
                  </h4>
                  <div className="space-y-1 text-[9px]">
                    {cvForm.languages.map((lang, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-2">
                        <span className="text-slate-700 font-bold">{lang.name}</span>
                        <div className="w-14 h-1.5 bg-white rounded-full overflow-hidden border border-slate-200">
                          <div
                            style={{ width: `${lang.level}%`, backgroundColor: cvThemeColor }}
                            className="h-full rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sở thích */}
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-wider m-0 pb-0.5 border-b border-slate-200/80">
                    Sở thích
                  </h4>
                  <div className="flex items-center justify-between text-[8.5px] text-slate-600 font-bold">
                    <div className="flex flex-col items-center">
                      <BookOpen className="w-3 h-3 text-slate-500 mb-0.5" />
                      <span>Đọc sách</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Plane className="w-3 h-3 text-slate-500 mb-0.5" />
                      <span>Du lịch</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Camera className="w-3 h-3 text-slate-500 mb-0.5" />
                      <span>Chụp ảnh</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column of CV (62% White) */}
              <div className="w-full sm:w-[62%] p-4 space-y-3.5 relative bg-white">
                {/* Decorative Calligraphy at Top Right */}
                {showBgDecoration && (
                  <div className="absolute top-3 right-3 text-right -rotate-6 pointer-events-none select-none opacity-80">
                    <span className="font-serif italic text-[10px] font-bold text-slate-400 block">
                      Good People
                    </span>
                    <span className="font-serif italic text-[10px] font-bold text-slate-400 block -mt-0.5">
                      Greater Impact
                    </span>
                  </div>
                )}

                {/* Giới thiệu bản thân */}
                <div className="space-y-1">
                  <h4
                    style={{ color: cvThemeColor }}
                    className="text-[10.5px] font-black uppercase tracking-wider m-0 flex items-center gap-1.5"
                  >
                    GIỚI THIỆU BẢN THÂN
                  </h4>
                  <p className="text-[9.5px] text-slate-700 leading-relaxed m-0 whitespace-pre-line font-medium">
                    {cvForm.summary}
                  </p>
                </div>

                {/* Kinh nghiệm làm việc */}
                <div className="space-y-2">
                  <h4
                    style={{ color: cvThemeColor }}
                    className="text-[10.5px] font-black uppercase tracking-wider m-0"
                  >
                    KINH NGHIỆM LÀM VIỆC
                  </h4>
                  <div className="space-y-2 text-[9.5px]">
                    {cvForm.experience.map((exp, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <span style={{ backgroundColor: cvThemeColor }} className="w-1.5 h-1.5 rounded-full shrink-0" />
                          <span>{exp.period}</span>
                        </div>
                        <div className="font-bold text-slate-800 pl-3">
                          {exp.role} <span className="font-normal text-slate-500">| {exp.company}</span>
                        </div>
                        <ul className="pl-6 m-0 list-disc text-slate-600 space-y-0.5">
                          {exp.bullets.map((b, bIdx) => (
                            <li key={bIdx}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Học vấn */}
                <div className="space-y-1">
                  <h4
                    style={{ color: cvThemeColor }}
                    className="text-[10.5px] font-black uppercase tracking-wider m-0"
                  >
                    HỌC VẤN
                  </h4>
                  <div className="space-y-0.5 text-[9.5px]">
                    {cvForm.education.map((edu, idx) => (
                      <div key={idx}>
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <span style={{ backgroundColor: cvThemeColor }} className="w-1.5 h-1.5 rounded-full shrink-0" />
                          <span>{edu.period}</span>
                        </div>
                        <div className="font-bold text-slate-800 pl-3">
                          {edu.school}
                        </div>
                        <p className="pl-3 text-slate-600 m-0">
                          Chuyên ngành: {edu.major} • GPA: {edu.gpa}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chứng chỉ */}
                <div className="space-y-1">
                  <h4
                    style={{ color: cvThemeColor }}
                    className="text-[10.5px] font-black uppercase tracking-wider m-0"
                  >
                    CHỨNG CHỈ
                  </h4>
                  <div className="space-y-0.5 text-[9.5px]">
                    {cvForm.certifications.map((cert, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span style={{ backgroundColor: cvThemeColor }} className="w-1.5 h-1.5 rounded-full shrink-0" />
                        <span className="font-bold text-slate-900">{cert.year}</span>
                        <span className="text-slate-700">{cert.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT 3: TÙY CHỈNH THIẾT KẾ (3 cols) */}
          <div className="lg:col-span-3 bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-2xs space-y-3.5 min-h-[660px]">
            <h3 className="text-xs font-black text-slate-900 m-0">Tùy chỉnh thiết kế</h3>

            {/* Sub-Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setActiveRightTab("font")}
                className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${activeRightTab === "font" ? "bg-white text-slate-900 shadow-2xs" : "bg-transparent text-slate-500"
                  }`}
              >
                Phông chữ
              </button>
              <button
                onClick={() => setActiveRightTab("color")}
                className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${activeRightTab === "color" ? "bg-white text-slate-900 shadow-2xs" : "bg-transparent text-slate-500"
                  }`}
              >
                Màu sắc
              </button>
              <button
                onClick={() => setActiveRightTab("layout")}
                className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${activeRightTab === "layout" ? "bg-white text-slate-900 shadow-2xs" : "bg-transparent text-slate-500"
                  }`}
              >
                Bố cục
              </button>
            </div>

            {/* Tab Font chữ */}
            {activeRightTab === "font" && (
              <div className="space-y-3.5">
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-1.5">Font chữ</span>
                  <Select
                    value={selectedFont}
                    onChange={(val) => setSelectedFont(val)}
                    className="w-full"
                    options={[
                      { value: "Inter", label: "Inter (Mặc định)" },
                      { value: "Roboto", label: "Roboto" },
                      { value: "Outfit", label: "Outfit" },
                    ]}
                  />
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-1.5">Cỡ chữ</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => setFontSizeScale("small")}
                      className={`py-1.5 rounded-xl border text-xs font-bold cursor-pointer ${fontSizeScale === "small" ? "border-[#0062ff] bg-blue-50 text-[#0062ff]" : "border-slate-200 bg-white text-slate-700"
                        }`}
                    >
                      A-
                    </button>
                    <button
                      onClick={() => setFontSizeScale("normal")}
                      className={`py-1.5 rounded-xl border text-xs font-bold cursor-pointer ${fontSizeScale === "normal" ? "border-[#0062ff] bg-blue-50 text-[#0062ff]" : "border-slate-200 bg-white text-slate-700"
                        }`}
                    >
                      A
                    </button>
                    <button
                      onClick={() => setFontSizeScale("large")}
                      className={`py-1.5 rounded-xl border text-xs font-bold cursor-pointer ${fontSizeScale === "large" ? "border-[#0062ff] bg-blue-50 text-[#0062ff]" : "border-slate-200 bg-white text-slate-700"
                        }`}
                    >
                      A+
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Màu sắc */}
            {activeRightTab === "color" && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 block">Màu chủ đạo</span>
                <div className="flex flex-wrap gap-2.5">
                  {["#10b981", "#0062ff", "#8b5cf6", "#f59e0b", "#ec4899", "#6366f1"].map((c) => (
                    <button
                      key={c}
                      onClick={() => setCvThemeColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${cvThemeColor === c ? "border-slate-900 scale-110 shadow-xs" : "border-white shadow-2xs"
                        }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Tab Bố cục */}
            {activeRightTab === "layout" && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 block">Kiểu hiển thị</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "rounded", label: "Bo góc", icon: LayoutOutlined },
                    { id: "modern", label: "Hiện đại", icon: Sliders },
                    { id: "minimal", label: "Tối giản", icon: FileText },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setLayoutStyle(item.id as any)}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 text-[11px] font-bold transition-all cursor-pointer ${layoutStyle === item.id
                        ? "border-[#0062ff] bg-blue-50 text-[#0062ff]"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                    >
                      <item.icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Toggle Hiển thị ảnh nền trang trí */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700">Hiển thị ảnh nền trang trí</span>
              <Switch
                checked={showBgDecoration}
                onChange={(checked) => setShowBgDecoration(checked)}
                size="small"
              />
            </div>

            {/* Card Mẹo nhỏ (Pastel yellow) */}
            <div className="bg-[#fffbeb] border border-[#fef3c7] rounded-2xl p-3 relative overflow-hidden">
              <div className="flex items-center gap-1.5 mb-1 text-amber-900 font-bold text-xs">
                <span>💡</span>
                <span>Mẹo nhỏ</span>
              </div>
              <p className="text-[11px] text-amber-900/90 font-medium m-0 leading-snug">
                Hãy giữ nội dung ngắn gọn, tập trung vào kinh nghiệm và kỹ năng nổi bật để thu hút nhà tuyển dụng.
              </p>
            </div>
          </div>
        </div>

        {/* Modal / Drawer chỉnh sửa từng mục section */}
        <Modal
          title={
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Edit2 className="w-4 h-4 text-[#0062ff]" />
              <span>
                Chỉnh sửa: {
                  selectedSection === "info" ? "Thông tin cá nhân" :
                    selectedSection === "summary" ? "Giới thiệu bản thân" :
                      selectedSection === "experience" ? "Kinh nghiệm làm việc" :
                        selectedSection === "education" ? "Học vấn" :
                          selectedSection === "skills" ? "Kỹ năng" : "Mục CV"
                }
              </span>
            </div>
          }
          open={isSectionModalOpen}
          onOk={() => {
            setIsSectionModalOpen(false);
            message.success("Đã cập nhật nội dung CV!");
          }}
          onCancel={() => setIsSectionModalOpen(false)}
          okText="Hoàn tất & Cập nhật"
          cancelText="Đóng"
          width={600}
          centered
          okButtonProps={{ className: "bg-[#0062ff] text-white font-bold" }}
        >
          <div className="space-y-3.5 py-2">
            {selectedSection === "info" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Họ và tên</label>
                    <Input
                      value={cvForm.fullName}
                      onChange={(e) => setCvForm({ ...cvForm, fullName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Chức danh</label>
                    <Input
                      value={cvForm.jobTitle}
                      onChange={(e) => setCvForm({ ...cvForm, jobTitle: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Email</label>
                    <Input
                      value={cvForm.email}
                      onChange={(e) => setCvForm({ ...cvForm, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Số điện thoại</label>
                    <Input
                      value={cvForm.phone}
                      onChange={(e) => setCvForm({ ...cvForm, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Địa điểm</label>
                    <Input
                      value={cvForm.location}
                      onChange={(e) => setCvForm({ ...cvForm, location: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Website / LinkedIn</label>
                    <Input
                      value={cvForm.website}
                      onChange={(e) => setCvForm({ ...cvForm, website: e.target.value })}
                    />
                  </div>
                </div>
              </>
            )}

            {selectedSection === "summary" && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Giới thiệu bản thân</label>
                <TextArea
                  rows={5}
                  value={cvForm.summary}
                  onChange={(e) => setCvForm({ ...cvForm, summary: e.target.value })}
                />
              </div>
            )}

            {selectedSection === "skills" && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Kỹ năng (cách nhau bằng dấu phẩy)</label>
                <Input
                  value={cvForm.skills.join(", ")}
                  onChange={(e) =>
                    setCvForm({
                      ...cvForm,
                      skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                />
              </div>
            )}

            {selectedSection !== "info" && selectedSection !== "summary" && selectedSection !== "skills" && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Chi tiết nội dung</label>
                <TextArea
                  rows={5}
                  defaultValue={
                    selectedSection === "experience"
                      ? "• 2023 - Hiện tại: Product Designer tại ABC Company\n• 2022 - 2023: UI/UX Intern tại XYZ Company"
                      : selectedSection === "education"
                        ? "• 2018 - 2022: Đại học Công nghệ Thông tin - Chuyên ngành Thiết kế đồ họa số (GPA 3.5/4.0)"
                        : "Chứng chỉ Google UX Design Professional (2023)\nIELTS 7.0 (2022)"
                  }
                />
              </div>
            )}
          </div>
        </Modal>
      </div>
    );
  }

  if (activeTab === "templates") {
    return (
      <div className="w-full max-w-[1580px] mx-auto px-3 sm:px-5 md:px-6 space-y-3">
        {/* 1. Banner MẪU CV (Giảm chiều cao 20-25%, gọn gàng và thanh thoát) */}
        <div className="relative w-full rounded-2xl overflow-hidden min-h-[115px] sm:min-h-[125px] bg-[#eef5ff] border border-blue-100 shadow-2xs">
          <img
            src="/images/taocv.png"
            alt="Mẫu CV Careza"
            className="absolute inset-0 w-full h-full object-cover object-right pointer-events-none select-none"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#f8fbff] via-[#f8fbff]/90 sm:via-[#f8fbff]/75 to-transparent w-full sm:w-[65%] pointer-events-none" />

          <div className="relative z-10 p-3 sm:p-3.5 lg:p-4 flex flex-col justify-between h-full min-h-[115px] sm:min-h-[125px] max-w-2xl">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mb-0.5">
                <Link href="/" className="text-slate-500 hover:text-[#0062ff]">Trang chủ</Link>
                <span className="text-slate-400">&gt;</span>
                <Link href="/ung-vien/cv" className="text-slate-500 hover:text-[#0062ff]">CV của tôi</Link>
                <span className="text-slate-400">&gt;</span>
                <span className="text-[#0062ff] font-bold">Mẫu CV</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight m-0">
                  Mẫu CV chuyên nghiệp
                </h1>
                <span className="bg-[#e0edff] text-[#0062ff] text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-200/90 shadow-2xs">
                  Đa dạng phong cách · Chuẩn ATS
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium m-0 mt-0.5">
                Khám phá các mẫu CV chuyên nghiệp, chuẩn ATS và tối ưu cho mọi ngành nghề
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="flex items-center gap-1.5">
                <div className="w-5.5 h-5.5 rounded-full bg-amber-100/90 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs"><Zap className="w-3 h-3 fill-amber-500 text-amber-500" /></div>
                <div className="min-w-0"><span className="text-[10.5px] font-black text-slate-900 block leading-tight">Nhanh chóng</span><span className="text-[9px] text-slate-500 font-medium block">Chỉ vài phút</span></div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5.5 h-5.5 rounded-full bg-emerald-100/90 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs"><ShieldCheck className="w-3 h-3 stroke-[2.5]" /></div>
                <div className="min-w-0"><span className="text-[10.5px] font-black text-slate-900 block leading-tight">Chuẩn tuyển dụng</span><span className="text-[9px] text-slate-500 font-medium block">Theo chuẩn HR</span></div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5.5 h-5.5 rounded-full bg-amber-100/90 text-amber-500 flex items-center justify-center shrink-0 shadow-2xs"><Star className="w-3 h-3 fill-amber-500 text-amber-500" /></div>
                <div className="min-w-0"><span className="text-[10.5px] font-black text-slate-900 block leading-tight">Nhiều mẫu đẹp</span><span className="text-[9px] text-slate-500 font-medium block">Đa ngành nghề</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. STEPPER QUY TRÌNH TẠO CV (Thu gọn padding) */}
        <div className="bg-white rounded-xl py-2 px-3 sm:px-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between gap-2 max-w-4xl mx-auto">
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-5.5 h-5.5 rounded-full bg-[#0062ff] text-white font-black text-[11px] flex items-center justify-center shadow-xs">1</div>
              <span className="text-xs font-black text-[#0062ff] whitespace-nowrap">Chọn mẫu</span>
            </div>
            <div className="flex-1 h-[2px] bg-slate-200 mx-2 min-w-[20px]" />
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-5.5 h-5.5 rounded-full bg-slate-100 text-slate-500 font-bold text-[11px] flex items-center justify-center">2</div>
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap hidden sm:inline">Nhập thông tin</span>
            </div>
            <div className="flex-1 h-[2px] bg-slate-200 mx-2 min-w-[20px]" />
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-5.5 h-5.5 rounded-full bg-slate-100 text-slate-500 font-bold text-[11px] flex items-center justify-center">3</div>
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap hidden sm:inline">Tùy chỉnh thiết kế</span>
            </div>
            <div className="flex-1 h-[2px] bg-slate-200 mx-2 min-w-[20px]" />
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-5.5 h-5.5 rounded-full bg-slate-100 text-slate-500 font-bold text-[11px] flex items-center justify-center">4</div>
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap hidden sm:inline">Tải xuống & Ứng tuyển</span>
            </div>
          </div>
        </div>

        {/* 3. GALLERY MẪU CV (Sidebar gọn + 4-5 mẫu/hàng) */}
        <div className="flex flex-col lg:flex-row items-start gap-3.5 lg:gap-4">
          {/* Sidebar lọc phong cách CV bên trái */}
          <div className="w-full lg:w-[200px] xl:w-[210px] shrink-0 space-y-3">
            <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/90 shadow-2xs">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2.5 block">
                Phong cách CV
              </h3>
              <div className="space-y-1">
                {STYLE_FILTERS.map((filter) => {
                  const isSelected = selectedStyleFilter === filter.id;
                  return (
                    <button
                      key={filter.id}
                      onClick={() => setSelectedStyleFilter(filter.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${isSelected
                        ? "bg-[#eef5ff] text-[#0062ff] border-blue-200 shadow-2xs"
                        : "bg-transparent text-slate-600 border-transparent hover:bg-slate-50 hover:text-slate-900"
                        }`}
                    >
                      <span>{filter.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? "bg-[#dbeafe] text-[#0062ff]" : "bg-slate-100 text-slate-500"}`}>
                        {filter.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Grid hiển thị 4 mẫu/hàng trên Desktop, 5 mẫu/hàng trên màn hình lớn */}
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-3.5">
              {displayedTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all p-2.5 sm:p-3 flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-[13px] font-black text-slate-900 truncate pr-1">
                      {template.name}
                    </span>
                    <span className="text-[9.5px] font-extrabold px-1.5 py-0.2 rounded-full bg-blue-50 text-[#0062ff] border border-blue-100 shrink-0">
                      {template.badge}
                    </span>
                  </div>

                  {/* Bản preview CV chuẩn tỷ lệ A4 (Không bị trống hoặc lệch ảnh) */}
                  <div className="w-full aspect-[210/297] bg-white rounded-lg mb-2 overflow-hidden border border-slate-200 shadow-2xs relative flex flex-col group/preview">
                    {/* Header màu của template */}
                    <div
                      style={{ backgroundColor: template.color }}
                      className="h-10 px-2 py-1.5 flex items-center gap-1.5 text-white shrink-0"
                    >
                      <img
                        src={template.avatar}
                        alt={template.name}
                        className="w-6 h-6 rounded-full object-cover border border-white/80 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="block text-[8px] font-black leading-tight truncate text-white">
                          {template.personName}
                        </span>
                        <span className="block text-[6.5px] font-medium leading-tight text-white/90 truncate">
                          {template.jobTitle}
                        </span>
                      </div>
                    </div>

                    {/* Nội dung 2 cột mô phỏng chuẩn CV A4 */}
                    <div className="flex-1 p-1.5 flex gap-1 bg-[#fafbfd] overflow-hidden">
                      {/* Cột trái 35% */}
                      <div
                        style={{ backgroundColor: `${template.color}12` }}
                        className="w-[35%] rounded-md p-1 space-y-1.5 shrink-0 border border-slate-100"
                      >
                        <div>
                          <span style={{ color: template.color }} className="font-black text-[6px] uppercase block mb-0.5">
                            Liên hệ
                          </span>
                          <div className="space-y-0.5">
                            <div className="h-0.5 w-full bg-slate-300 rounded-xs" />
                            <div className="h-0.5 w-4/5 bg-slate-300 rounded-xs" />
                          </div>
                        </div>
                        <div>
                          <span style={{ color: template.color }} className="font-black text-[6px] uppercase block mb-0.5">
                            Kỹ năng
                          </span>
                          <div className="space-y-0.5">
                            <div className="h-0.5 w-full bg-slate-300 rounded-xs" />
                            <div className="h-0.5 w-3/4 bg-slate-300 rounded-xs" />
                            <div className="h-0.5 w-5/6 bg-slate-300 rounded-xs" />
                          </div>
                        </div>
                        <div>
                          <span style={{ color: template.color }} className="font-black text-[6px] uppercase block mb-0.5">
                            Học vấn
                          </span>
                          <div className="space-y-0.5">
                            <div className="h-0.5 w-full bg-slate-300 rounded-xs" />
                            <div className="h-0.5 w-2/3 bg-slate-300 rounded-xs" />
                          </div>
                        </div>
                      </div>

                      {/* Cột phải 65% */}
                      <div className="flex-1 space-y-1.5 overflow-hidden pl-0.5">
                        <div>
                          <span style={{ color: template.color }} className="font-black text-[6px] uppercase block mb-0.5">
                            Giới thiệu
                          </span>
                          <div className="space-y-0.5">
                            <div className="h-0.5 w-full bg-slate-200 rounded-xs" />
                            <div className="h-0.5 w-11/12 bg-slate-200 rounded-xs" />
                          </div>
                        </div>
                        <div>
                          <span style={{ color: template.color }} className="font-black text-[6px] uppercase block mb-0.5">
                            Kinh nghiệm
                          </span>
                          <div className="space-y-1">
                            <div className="space-y-0.5">
                              <div className="h-1 w-1/2 rounded-xs" style={{ backgroundColor: `${template.color}80` }} />
                              <div className="h-0.5 w-full bg-slate-200 rounded-xs" />
                              <div className="h-0.5 w-4/5 bg-slate-200 rounded-xs" />
                            </div>
                            <div className="space-y-0.5">
                              <div className="h-1 w-2/5 rounded-xs" style={{ backgroundColor: `${template.color}80` }} />
                              <div className="h-0.5 w-full bg-slate-200 rounded-xs" />
                              <div className="h-0.5 w-3/4 bg-slate-200 rounded-xs" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Preview Badge khi hover */}
                    <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center p-2 backdrop-blur-[0.5px]">
                      <span className="px-2 py-0.5 bg-white text-slate-900 font-bold text-[9px] rounded-md shadow-sm">
                        Xem nhanh
                      </span>
                    </div>
                  </div>

                  {/* Nút hành động */}
                  <div className="pt-1 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTemplate(template.id);
                        setCvThemeColor(template.color);
                        setIsEditorModalOpen(true);
                      }}
                      className="px-2 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 font-bold text-[11px] transition-all cursor-pointer shrink-0"
                      title="Xem trước mẫu"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <Link
                      href={`/ung-vien/cv?tab=builder&template=${template.id}`}
                      className="flex-1 py-1.5 rounded-xl bg-[#0062ff] hover:bg-blue-700 text-white font-bold text-xs text-center transition-all shadow-xs shadow-blue-500/20 no-underline"
                    >
                      Dùng mẫu
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // TAB CHÍNH: CV CỦA TÔI / DANH SÁCH CV
  // ==========================================
  const mergedCvs = documents.map((doc: any, index: number) => {
    const rawFileUrl = doc.file_url || doc.fileUrl || doc.path || "";
    const hasParsedBuilder = Boolean(doc.parsed_data?.builder_data || doc.parsedData?.builder_data);
    const isUploaded = Boolean(
      doc.documentType === "uploaded" ||
      rawFileUrl.toLowerCase().endsWith(".docx") ||
      rawFileUrl.toLowerCase().endsWith(".doc") ||
      (!hasParsedBuilder && rawFileUrl && !rawFileUrl.startsWith("data:"))
    );
    const isBuilderCv = Boolean(hasParsedBuilder || !isUploaded || doc.sourceType === "created");
    const validUpdated = doc.updated_at || doc.updatedAt || doc.created_at || doc.createdAt;
    const validCreated = doc.created_at || doc.createdAt || doc.updated_at || doc.updatedAt;
    const hasValidSize = typeof doc.fileSize === "number" && !isNaN(doc.fileSize) && doc.fileSize > 0;
    const isDefault = Boolean(doc.is_primary ?? doc.isDefault);

    return {
      id: doc.id || doc.documentId || doc._id || `doc-${index}`,
      title: doc.title || doc.documentName || `CV #${index + 1}`,
      jobTitle: doc.jobTitle || (user as any)?.headline || "Ứng viên Careza",
      isDefault: isDefault,
      sourceType: isUploaded ? "uploaded" : "created",
      isBuilderCv: isBuilderCv,
      updatedAt: validUpdated ? String(validUpdated) : "",
      createdAt: validCreated ? String(validCreated) : "",
      pageCount: typeof doc.pageCount === "number" && doc.pageCount > 0 ? doc.pageCount : 1,
      fileSize: hasValidSize ? doc.fileSize : 0,
      status: doc.status === "incompleted" || doc.status === "draft" ? "incompleted" : "completed",
      completionPercent: typeof doc.completionPercent === "number" ? doc.completionPercent : 100,
      viewCount: typeof doc.viewCount === "number" ? doc.viewCount : 0,
      applicationCount: typeof doc.applicationCount === "number" ? doc.applicationCount : 0,
      tags: Array.isArray(doc.tags) && doc.tags.length > 0 ? doc.tags : [isBuilderCv ? "CV Studio" : "CV Careza"],
      themeColor: index % 4 === 0 ? "#0062ff" : index % 4 === 1 ? "#8b5cf6" : index % 4 === 2 ? "#f59e0b" : "#10b981",
      avatar: (user as any)?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      fileUrl: rawFileUrl,
      parsedData: doc.parsed_data || doc.parsedData,
    };
  });

  const completedCount = mergedCvs.filter((c) => c.status === "completed").length;
  const totalViewsCount = mergedCvs.reduce((acc, curr) => acc + (curr.viewCount || 0), 0);

  const filteredCvs = mergedCvs.filter((cv) => {
    const matchQuery =
      searchKeyword === "" ||
      cv.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      cv.tags.some((t: string) => t.toLowerCase().includes(searchKeyword.toLowerCase()));

    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "completed" && cv.status === "completed") ||
      (statusFilter === "incompleted" && cv.status === "incompleted");

    return matchQuery && matchStatus;
  }).sort((a, b) => {
    if (sortBy === "newest") {
      const timeB = a.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      return timeB - timeA;
    }
    const timeB = a.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    return timeA - timeB;
  });

  // Safe formatting functions to eliminate any NaN/NaN/NaN or NaN MB issues
  const safeFormatDate = (dateVal?: any) => {
    if (!dateVal) return "";
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return "";
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
      return "";
    }
  };

  const safeFormatFileSize = (bytes?: any) => {
    if (typeof bytes !== "number" || isNaN(bytes) || bytes <= 0) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full max-w-[1460px] mx-auto px-4 sm:px-6 md:px-8 xl:px-[38px] pb-8">
      {/* 1. Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-2.5 sm:mb-3">
        <Link href="/" className="text-slate-500 hover:text-[#0062ff] transition-colors">Trang chủ</Link>
        <span className="text-slate-400">&gt;</span>
        <Link href="/ung-vien/ho-so" className="text-slate-500 hover:text-[#0062ff] transition-colors">Ứng viên</Link>
        <span className="text-slate-400">&gt;</span>
        <span className="text-[#0062ff] font-bold">CV của tôi</span>
      </div>

      {/* 2. Hero Box “CV của tôi” (Cao 110–125px trên desktop) */}
      <div
        className="relative w-full rounded-2xl overflow-hidden h-auto min-h-[110px] md:h-[118px] border border-blue-100 shadow-2xs px-4 sm:px-6 py-3 sm:py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-cover bg-center bg-no-repeat mb-4"
        style={{ backgroundImage: "url('/images/taocv.png')" }}
      >
        {/* Lớp phủ nhẹ tăng độ tương phản giúp chữ và nội dung sắc nét */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/60 to-white/20 pointer-events-none" />

        {/* Cột trái: Tiêu đề (24px) + Badge & 3 ô thống kê thu gọn */}
        <div className="relative z-10 flex flex-col justify-center gap-2 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0 leading-tight">
              CV của tôi
            </h1>
            <span className="bg-[#e0edff] text-[#0062ff] text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-blue-200/90 shadow-2xs">
              Quản lý dễ dàng, sẵn sàng cơ hội mới
            </span>
          </div>

          {/* 3 ô thống kê thu gọn nằm ngang trong banner */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Card 1: Bộ đếm Đã lưu X/5 CV */}
            <div
              className={`h-[34px] sm:h-[36px] rounded-xl px-2.5 py-1 shadow-2xs flex items-center gap-2 transition-all ${
                mergedCvs.length >= 5
                  ? "bg-amber-50/90 border border-amber-300"
                  : "bg-white/95 backdrop-blur-xs border border-blue-200"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border ${
                  mergedCvs.length >= 5
                    ? "bg-amber-100 text-amber-700 border-amber-200"
                    : "bg-blue-50 text-[#0062ff] border-blue-200"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
              </div>
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-xs font-bold text-slate-900 leading-tight">
                  Đã lưu {mergedCvs.length}/5 CV
                </span>
                {mergedCvs.length >= 5 ? (
                  <span className="text-[10px] font-extrabold bg-amber-100 text-amber-700 px-1 py-0.2 rounded-md">
                    Đầy
                  </span>
                ) : (
                  <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                    <div
                      style={{ width: `${Math.min(100, (mergedCvs.length / 5) * 100)}%` }}
                      className="h-full rounded-full bg-[#0062ff] transition-all"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Card 2: CV hoàn thiện */}
            <div className="h-[34px] sm:h-[36px] bg-white/95 backdrop-blur-xs rounded-xl px-2.5 py-1 border border-emerald-200 shadow-2xs flex items-center gap-2 transition-all">
              <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div className="flex items-center gap-1 text-xs font-bold whitespace-nowrap">
                <span className="text-slate-900 font-black">{completedCount}</span>
                <span className="text-slate-500 font-semibold text-[11px]">CV hoàn thiện</span>
              </div>
            </div>

            {/* Card 3: Tổng lượt xem */}
            <div className="h-[34px] sm:h-[36px] bg-white/95 backdrop-blur-xs rounded-xl px-2.5 py-1 border border-purple-200 shadow-2xs flex items-center gap-2 transition-all">
              <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200">
                <Eye className="w-3.5 h-3.5" />
              </div>
              <div className="flex items-center gap-1 text-xs font-bold whitespace-nowrap">
                <span className="text-slate-900 font-black">{totalViewsCount}</span>
                <span className="text-slate-500 font-semibold text-[11px]">Tổng lượt xem</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải: Button Tạo CV mới (Dropdown) */}
        <div className="relative z-10 shrink-0 self-start md:self-center">
          <Dropdown
            menu={{
              items: [
                {
                  key: "builder",
                  icon: <Edit2 className="w-3.5 h-3.5 text-[#0062ff]" />,
                  label: <Link href="/ung-vien/cv/builder" className="font-bold text-xs">Tạo CV online (Studio)</Link>,
                },
                {
                  key: "upload",
                  icon: <Upload className="w-3.5 h-3.5 text-[#0062ff]" />,
                  label: <Link href="/ung-vien/cv?tab=upload" className="font-bold text-xs">Tải CV lên</Link>,
                },
                {
                  key: "templates",
                  icon: <LayoutOutlined className="text-xs text-[#0062ff]" />,
                  label: <Link href="/ung-vien/cv?tab=templates" className="font-bold text-xs">Khám phá mẫu CV</Link>,
                },
              ],
            }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <button
              type="button"
              className="flex items-center gap-1.5 bg-[#0062ff] hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-[13px] shadow-md shadow-blue-500/20 transition-all cursor-pointer border-none"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Tạo CV mới</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </Dropdown>
        </div>
      </div>

      {/* CẢNH BÁO KHI ĐÃ ĐẠT GIỚI HẠN 5 CV */}
      {mergedCvs.length >= 5 && (
        <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-3 sm:p-3.5 flex items-start sm:items-center justify-between gap-3 text-amber-800 text-xs shadow-2xs mb-4">
          <div className="flex items-center gap-2.5">
            <Info className="w-4.5 h-4.5 text-amber-600 shrink-0" />
            <div className="leading-relaxed">
              <span className="font-bold">Bạn đã lưu tối đa 5/5 CV trên CAREZA.</span> Để lưu hoặc tải lên CV mới, vui lòng xóa một CV không còn sử dụng. Bạn vẫn có thể chỉnh sửa, tạo phiên bản hoặc thiết kế và xuất PDF về máy tính.
            </div>
          </div>
        </div>
      )}

      {/* 3. Main 2-Column Section (Left: CV List & Toolbar | Right: Quick Operations & Tips) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        {/* ======================================================== */}
        {/* CỘT TRÁI (LỚN): Toolbar + Danh Sách CV + Phân Trang (8.5 cols) */}
        {/* ======================================================== */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-3.5">

          {/* Toolbar Search & Filters */}
          <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-2.5">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Tìm kiếm theo tên CV, nội dung, kỹ năng..."
                className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#0062ff] focus:outline-hidden transition-all font-medium"
              />
            </div>

            {/* Filters & View Modes */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
              <Select
                value={statusFilter}
                onChange={(val) => setStatusFilter(val)}
                className="w-36 text-xs"
                options={[
                  { value: "all", label: "Tất cả trạng thái" },
                  { value: "completed", label: "Đã hoàn thiện" },
                  { value: "incompleted", label: "Chưa hoàn thiện" },
                ]}
              />

              <Select
                value={sortBy}
                onChange={(val) => setSortBy(val)}
                className="w-28 text-xs"
                options={[
                  { value: "newest", label: "Mới nhất" },
                  { value: "oldest", label: "Cũ nhất" },
                ]}
              />

              {/* List vs Grid View Toggle */}
              <div className="flex items-center gap-1 bg-[#f1f5f9] p-1 rounded-xl shrink-0">
                <button
                  type="button"
                  onClick={() => handleSetViewMode("list")}
                  className={`p-1.5 rounded-lg border-none cursor-pointer transition-all ${viewMode === "list" ? "bg-white text-[#0062ff] shadow-2xs font-bold" : "bg-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  title="Xem dạng danh sách"
                >
                  <ListIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleSetViewMode("grid")}
                  className={`p-1.5 rounded-lg border-none cursor-pointer transition-all ${viewMode === "grid" ? "bg-white text-[#0062ff] shadow-2xs font-bold" : "bg-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  title="Xem dạng lưới"
                >
                  <GridIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Danh Sách CV Rows / Grid */}
          {filteredCvs.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-2xs text-center flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-blue-50 text-[#0062ff] flex items-center justify-center mb-3">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-black text-slate-900 m-0">
                {searchKeyword ? "Không tìm thấy CV nào phù hợp" : "Bạn chưa có CV nào"}
              </h3>
              <p className="text-xs text-slate-500 font-medium m-0 mt-1 max-w-md">
                {searchKeyword
                  ? "Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc để xem tất cả CV."
                  : "Tạo CV online hoặc tải CV có sẵn để bắt đầu ứng tuyển trên Careza."}
              </p>
              <div className="flex items-center gap-2.5 mt-4">
                <Link
                  href="/ung-vien/cv?tab=builder"
                  className="px-4 py-2 rounded-xl bg-[#0062ff] hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/20"
                >
                  Tạo CV online
                </Link>
                <Link
                  href="/ung-vien/cv?tab=upload"
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 transition-all shadow-2xs"
                >
                  Tải CV lên
                </Link>
              </div>
            </div>
          ) : viewMode === "grid" ? (
            /* GRID VIEW (RESPONSIVE CARDS) */
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
              {filteredCvs.map((cv) => {
                const isCompleted = cv.status === "completed";
                const formattedDate = safeFormatDate(cv.updatedAt);
                const formattedSize = safeFormatFileSize(cv.fileSize);

                return (
                  <div
                    key={cv.id}
                    className="bg-white rounded-2xl p-4 border border-[#E6EDF7] hover:border-blue-300 hover:shadow-xs transition-all flex flex-col justify-between gap-3.5 select-none"
                  >
                    {/* Top Content: Badges + Menu + Preview Canvas + Info */}
                    <div className="space-y-3">
                      {/* Badge bar & Menu dropdown */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                          <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                            <FileText className="w-3 h-3 text-[#0062ff]" />
                            <span>{cv.isBuilderCv ? "CV Studio" : cv.sourceType === "uploaded" ? "Tải lên" : "Tạo online"}</span>
                          </span>
                          {cv.isDefault && (
                            <span className="bg-[#eef5ff] text-[#0062ff] text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-200">
                              Mặc định
                            </span>
                          )}
                        </div>

                        <Dropdown
                          menu={{
                            items: [
                              {
                                key: "default",
                                icon: <Star className="w-3.5 h-3.5 text-amber-500" />,
                                label: "Đặt làm mặc định",
                                onClick: () => handleSetDefault(cv.id),
                              },
                              {
                                key: "edit",
                                icon: <EditOutlined className="text-blue-500" />,
                                label: "Sửa bằng Studio",
                                onClick: () => router.push(`/ung-vien/cv/builder?id=${cv.id}`),
                              },
                              {
                                key: "rename",
                                icon: <Edit2 className="w-3.5 h-3.5 text-slate-500" />,
                                label: "Đổi tên",
                                onClick: () => message.info("Chức năng đổi tên CV"),
                              },
                              {
                                type: "divider",
                              },
                              {
                                key: "delete",
                                icon: <Trash2 className="w-3.5 h-3.5 text-rose-500" />,
                                danger: true,
                                label: "Xóa",
                                onClick: () => handleDelete(cv.id),
                              },
                            ],
                          }}
                          trigger={["click"]}
                          placement="bottomRight"
                        >
                          <button
                            type="button"
                            className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 flex items-center justify-center cursor-pointer shadow-2xs transition-all"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                        </Dropdown>
                      </div>

                      {/* Preview Box */}
                      <div
                        onClick={() => {
                          setSelectedCvForPreview(cv);
                          setIsPreviewModalOpen(true);
                        }}
                        className="w-full h-32 rounded-xl bg-slate-50 border border-slate-200/90 shadow-2xs overflow-hidden cursor-pointer relative group flex flex-col justify-between p-2.5 transition-all hover:border-blue-300"
                      >
                        <div
                          style={{ backgroundColor: cv.themeColor }}
                          className="w-full h-2.5 rounded-sm opacity-90"
                        />
                        <div className="flex items-center gap-2">
                          <img
                            src={cv.avatar}
                            alt="avatar"
                            className="w-6 h-6 rounded-full object-cover border border-white shrink-0 shadow-2xs"
                          />
                          <div className="space-y-1 flex-1">
                            <div className="w-14 h-1.5 bg-slate-300 rounded-full" />
                            <div className="w-20 h-1 bg-slate-200 rounded-full" />
                          </div>
                        </div>
                        <div className="space-y-1 my-0.5">
                          <div className="w-full h-1 bg-slate-200 rounded-full" />
                          <div className="w-4/5 h-1 bg-slate-200 rounded-full" />
                          <div className="w-3/5 h-1 bg-slate-200 rounded-full" />
                        </div>
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-2xs gap-1">
                          <Eye className="w-4 h-4" />
                          <span className="text-xs font-bold">Xem trước</span>
                        </div>
                      </div>

                      {/* Title & Metadata */}
                      <div className="space-y-1">
                        <h3 className="text-sm font-black text-slate-900 m-0 truncate" title={cv.title}>
                          {cv.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium m-0 flex flex-wrap items-center gap-1 leading-snug">
                          {formattedDate && <span>Cập nhật: {formattedDate}</span>}
                          {cv.pageCount > 0 && (
                            <>
                              <span className="text-slate-300">|</span>
                              <span>{cv.pageCount} trang</span>
                            </>
                          )}
                          {formattedSize && (
                            <>
                              <span className="text-slate-300">|</span>
                              <span>{formattedSize}</span>
                            </>
                          )}
                        </p>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {cv.tags.map((tag: string, tIdx: number) => (
                          <span
                            key={tIdx}
                            className="bg-[#f8fafc] text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-200/70"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Completion status & Progress */}
                      <div className="space-y-1.5 pt-1.5 border-t border-slate-100">
                        <div className="flex items-center justify-between text-[11px]">
                          {isCompleted ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>Đã hoàn thiện</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              <span>Chưa hoàn thiện</span>
                            </span>
                          )}
                          <span className="text-[10px] font-extrabold text-slate-700">
                            {cv.completionPercent}%
                          </span>
                        </div>

                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${cv.completionPercent}%` }}
                            className={`h-full rounded-full ${isCompleted ? "bg-emerald-500" : "bg-amber-500"}`}
                          />
                        </div>

                        {/* Views & Applications */}
                        <div className="flex items-center justify-between text-[10.5px] text-slate-400 font-medium pt-0.5">
                          <span className="inline-flex items-center gap-1">
                            <Eye className="w-3 h-3 text-slate-400" />
                            <span>{cv.viewCount} lượt xem</span>
                          </span>
                          <span className="inline-flex items-center gap-1 text-[#0062ff] font-semibold">
                            <Send className="w-3 h-3" />
                            <span>
                              {cv.applicationCount > 0 ? `${cv.applicationCount} đơn` : "0 đơn"}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom: Action buttons */}
                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      {isCompleted ? (
                        <button
                          type="button"
                          onClick={() => {
                            message.success("Đã chọn CV này để ứng tuyển!");
                            router.push("/viec-lam");
                          }}
                          className="w-full py-2 rounded-xl bg-[#0062ff] hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer border-none"
                        >
                          Sử dụng để ứng tuyển
                        </button>
                      ) : (
                        <Link
                          href={cv.isBuilderCv ? `/ung-vien/cv/builder?id=${cv.id}` : "/ung-vien/cv/builder"}
                          className="w-full py-2 rounded-xl bg-white hover:bg-blue-50 text-[#0062ff] font-bold text-xs border border-blue-200 shadow-2xs transition-all flex items-center justify-center no-underline"
                        >
                          {cv.isBuilderCv ? "Sửa bằng Studio" : "Tiếp tục chỉnh sửa"}
                        </Link>
                      )}

                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCvForPreview(cv);
                            setIsPreviewModalOpen(true);
                          }}
                          className="flex items-center justify-center gap-1 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-2xs transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>Xem</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadCv(cv)}
                          className="flex items-center justify-center gap-1 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-2xs transition-all cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-500" />
                          <span>Tải về</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* LIST VIEW (HORIZONTAL ROWS) */
            <div className="space-y-3">
              {filteredCvs.map((cv) => {
                const isCompleted = cv.status === "completed";
                const formattedDate = safeFormatDate(cv.updatedAt);
                const formattedSize = safeFormatFileSize(cv.fileSize);

                return (
                  <div
                    key={cv.id}
                    className="bg-white rounded-2xl p-3.5 sm:p-4 border border-[#E6EDF7] hover:border-blue-300 hover:shadow-xs transition-all flex flex-col xl:flex-row items-center justify-between gap-4 select-none"
                  >
                    {/* Phần 1: Thumbnail & Thông tin CV */}
                    <div className="flex items-start gap-3.5 w-full xl:w-auto flex-1 min-w-0">
                      {/* Thumbnail CV Tăng kích thước 15–25% (~86px width) */}
                      <div
                        onClick={() => {
                          setSelectedCvForPreview(cv);
                          setIsPreviewModalOpen(true);
                        }}
                        className="w-[84px] sm:w-[90px] aspect-[1/1.35] rounded-xl bg-slate-50 border border-slate-200/90 shadow-2xs overflow-hidden shrink-0 cursor-pointer relative group flex flex-col justify-between p-2"
                      >
                        {/* Header Strip trong Thumbnail */}
                        <div
                          style={{ backgroundColor: cv.themeColor }}
                          className="w-full h-2.5 rounded-sm mb-1.5 opacity-90"
                        />
                        <div className="flex items-center gap-1.5">
                          <img
                            src={cv.avatar}
                            alt="avatar"
                            className="w-5 h-5 rounded-full object-cover border border-white shrink-0"
                          />
                          <div className="w-8 h-1 bg-slate-300 rounded-full" />
                        </div>
                        {/* Miniature CV lines */}
                        <div className="space-y-1 my-1">
                          <div className="w-full h-1 bg-slate-200 rounded-full" />
                          <div className="w-4/5 h-1 bg-slate-200 rounded-full" />
                          <div className="w-3/5 h-1 bg-slate-200 rounded-full" />
                        </div>
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-2xs">
                          <Eye className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Chi Tiết Tên, Metadata & Tag */}
                      <div className="min-w-0 space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-black text-slate-900 m-0 truncate">
                            {cv.title}
                          </h3>
                          {cv.isDefault && (
                            <span className="bg-[#eef5ff] text-[#0062ff] text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-200">
                              Mặc định
                            </span>
                          )}
                        </div>

                        {/* Metadata row: Loại CV, Ngày cập nhật, Số trang, Dung lượng */}
                        <p className="text-[11px] text-slate-500 font-medium m-0 flex flex-wrap items-center gap-1.5 leading-snug">
                          <span className="inline-flex items-center gap-1 text-slate-600 font-bold">
                            <FileText className="w-3 h-3 text-[#0062ff]" />
                            {cv.sourceType === "uploaded" ? "Tải lên từ máy tính" : "Tạo trên Careza"}
                          </span>
                          {formattedDate && (
                            <>
                              <span className="text-slate-300">|</span>
                              <span>Cập nhật: {formattedDate}</span>
                            </>
                          )}
                          {cv.pageCount > 0 && (
                            <>
                              <span className="text-slate-300">|</span>
                              <span>{cv.pageCount} trang</span>
                            </>
                          )}
                          {formattedSize && (
                            <>
                              <span className="text-slate-300">|</span>
                              <span>{formattedSize}</span>
                            </>
                          )}
                        </p>

                        {/* Tag / Skill Pills */}
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {cv.tags.map((tag: string, tIdx: number) => (
                            <span
                              key={tIdx}
                              className="bg-[#f8fafc] text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-200/70"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Phần 2: Vùng Giữa (Trạng Thái, Mức độ hoàn thiện, Lượt xem, Đơn ứng tuyển) */}
                    <div className="flex items-center gap-4 shrink-0 w-full xl:w-auto justify-between xl:justify-start border-t xl:border-t-0 pt-2 xl:pt-0 border-slate-100">
                      <div className="space-y-1.5 min-w-[170px]">
                        <div className="flex items-center justify-between gap-2">
                          {isCompleted ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[10.5px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>Đã hoàn thiện</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 text-[10.5px] font-extrabold px-2 py-0.5 rounded-full border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              <span>Chưa hoàn thiện</span>
                            </span>
                          )}

                          {/* Progress Bar Mức độ hoàn thiện */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400 font-bold">Mức độ hoàn thiện</span>
                            <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${cv.completionPercent}%` }}
                                className={`h-full rounded-full ${isCompleted ? "bg-emerald-500" : "bg-amber-500"}`}
                              />
                            </div>
                            <span className="text-[10px] font-extrabold text-slate-700">
                              {cv.completionPercent}%
                            </span>
                          </div>
                        </div>

                        {/* Lượt xem & Số đơn đã ứng tuyển */}
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                          <span className="inline-flex items-center gap-1">
                            <Eye className="w-3 h-3 text-slate-400" />
                            <span>{cv.viewCount} lượt xem</span>
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Send className="w-3 h-3 text-[#0062ff]" />
                            <span>
                              {cv.applicationCount > 0
                                ? `Đã dùng cho ${cv.applicationCount} đơn`
                                : "Chưa dùng để ứng tuyển"}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Phần 3: Cụm Action Bên Phải */}
                    <div className="flex items-center gap-1.5 shrink-0 w-full xl:w-auto justify-end">
                      {isCompleted ? (
                        <button
                          type="button"
                          onClick={() => {
                            message.success("Đã chọn CV này để ứng tuyển!");
                            router.push("/viec-lam");
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-[#0062ff] hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer border-none"
                        >
                          Sử dụng để ứng tuyển
                        </button>
                      ) : (
                        <Link
                          href={cv.isBuilderCv ? `/ung-vien/cv/builder?id=${cv.id}` : "/ung-vien/cv/builder"}
                          className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-blue-50 text-[#0062ff] font-bold text-xs border border-blue-200 shadow-2xs transition-all no-underline"
                        >
                          {cv.isBuilderCv ? "Sửa bằng Studio" : "Tiếp tục chỉnh sửa"}
                        </Link>
                      )}

                      {/* Studio Direct Button for Builder CVs */}
                      {cv.isBuilderCv && (
                        <Link
                          href={`/ung-vien/cv/builder?id=${cv.id}`}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0062ff] font-bold text-xs border border-blue-200 shadow-2xs transition-all no-underline"
                          title="Mở trong Studio CV Builder"
                        >
                          <EditOutlined className="text-xs" />
                          <span className="hidden sm:inline">Studio</span>
                        </Link>
                      )}

                      {/* Preview Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCvForPreview(cv);
                          setIsPreviewModalOpen(true);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-2xs transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>Xem trước</span>
                      </button>

                      {/* Download Button */}
                      <button
                        type="button"
                        onClick={() => handleDownloadCv(cv)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-2xs transition-all cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-500" />
                        <span>Tải về</span>
                      </button>

                      {/* More Menu Dropdown */}
                      <Dropdown
                        menu={{
                          items: [
                            {
                              key: "default",
                              icon: <Star className="w-3.5 h-3.5 text-amber-500" />,
                              label: "Đặt làm mặc định",
                              onClick: () => handleSetDefault(cv.id),
                            },
                            {
                              key: "edit-studio",
                              icon: <EditOutlined className="text-blue-500" />,
                              label: "Sửa bằng Studio",
                              onClick: () => router.push(`/ung-vien/cv/builder?id=${cv.id}`),
                            },
                            {
                              key: "rename",
                              icon: <Edit2 className="w-3.5 h-3.5 text-slate-500" />,
                              label: "Đổi tên",
                              onClick: () => message.info("Chức năng đổi tên CV"),
                            },
                            {
                              type: "divider",
                            },
                            {
                              key: "delete",
                              icon: <Trash2 className="w-3.5 h-3.5 text-rose-500" />,
                              danger: true,
                              label: "Xóa",
                              onClick: () => handleDelete(cv.id),
                            },
                          ],
                        }}
                        trigger={["click"]}
                        placement="bottomRight"
                      >
                        <button
                          type="button"
                          className="w-7 h-7 rounded-xl bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 border border-slate-200 flex items-center justify-center cursor-pointer shadow-2xs transition-all"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </Dropdown>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Dòng Phân Trang & Đếm Số Lượng CV */}
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-2 pt-1">
            <span>Hiển thị {filteredCvs.length} / {mergedCvs.length} CV</span>
            <div className="flex items-center gap-1">
              <button className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 flex items-center justify-center cursor-pointer">
                ‹
              </button>
              <button className="w-7 h-7 rounded-lg border border-[#0062ff] bg-[#0062ff] text-white font-bold flex items-center justify-center">
                1
              </button>
              {mergedCvs.length > 4 && (
                <button className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold flex items-center justify-center cursor-pointer">
                  2
                </button>
              )}
              <button className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 flex items-center justify-center cursor-pointer">
                ›
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CỘT PHẢI (PANEL TIỆN ÍCH): Thao Tác Nhanh + Mẹo Nhỏ + Hỗ Trợ (3.5 cols) */}
        {/* ======================================================== */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-3.5">

          {/* Card 1: Thao tác nhanh với CV (Vibrant Colors & Gradients) */}
          <div className="bg-gradient-to-b from-white via-white to-[#f8faff] rounded-2xl p-4 border border-blue-100/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 m-0 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#0062ff]" />
                <span>Thao tác nhanh</span>
              </h3>
              <span className="text-[10px] font-bold text-[#0062ff] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                Tiện ích CV
              </span>
            </div>

            <div className="space-y-2.5">
              {/* 1. Tạo CV online (Careza Blue Theme) */}
              <Link
                href="/ung-vien/cv?tab=builder"
                className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-[#eff6ff] to-[#f6faff] border border-[#bfdbfe]/80 hover:border-[#0062ff] hover:shadow-xs hover:-translate-y-0.5 transition-all group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0062ff] to-[#0047ba] text-white flex items-center justify-center shrink-0 shadow-xs shadow-blue-500/25 group-hover:scale-105 transition-transform">
                    <FileText className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-[#0052cc] m-0 group-hover:text-[#0040a8] transition-colors">
                      Tạo CV online
                    </h4>
                    <p className="text-[10.5px] text-blue-900/70 font-medium m-0 truncate mt-0.5">
                      Tạo CV chuyên nghiệp với công cụ trực tuyến
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#0062ff] group-hover:translate-x-1 transition-transform shrink-0 ml-1" />
              </Link>

              {/* 2. Tải CV lên (Emerald Green Theme) */}
              <Link
                href="/ung-vien/cv?tab=upload"
                className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-[#f0fdf4] to-[#f6fcf8] border border-[#bbf7d0]/80 hover:border-emerald-500 hover:shadow-xs hover:-translate-y-0.5 transition-all group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs shadow-emerald-500/25 group-hover:scale-105 transition-transform">
                    <Upload className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-emerald-800 m-0 group-hover:text-emerald-900 transition-colors">
                      Tải CV lên
                    </h4>
                    <p className="text-[10.5px] text-emerald-900/70 font-medium m-0 truncate mt-0.5">
                      Tải file CV có sẵn từ máy tính
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-1 transition-transform shrink-0 ml-1" />
              </Link>

              {/* 3. Khám phá mẫu CV (Purple Theme) */}
              <Link
                href="/ung-vien/cv?tab=templates"
                className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-[#faf5ff] to-[#fbf7ff] border border-[#e9d5ff]/80 hover:border-purple-500 hover:shadow-xs hover:-translate-y-0.5 transition-all group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 text-white flex items-center justify-center shrink-0 shadow-xs shadow-purple-500/25 group-hover:scale-105 transition-transform">
                    <LayoutOutlined className="text-sm" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-purple-800 m-0 group-hover:text-purple-900 transition-colors">
                      Khám phá mẫu CV
                    </h4>
                    <p className="text-[10.5px] text-purple-900/70 font-medium m-0 truncate mt-0.5">
                      Nhiều mẫu CV đẹp, phù hợp mọi ngành nghề
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-purple-600 group-hover:translate-x-1 transition-transform shrink-0 ml-1" />
              </Link>
            </div>
          </div>

          {/* Card 2: Mẹo nhỏ */}
          <div className="bg-[#fffbeb] rounded-2xl p-4 border border-[#fef3c7] shadow-2xs space-y-2">
            <div className="flex items-center gap-1.5 text-amber-700 font-black text-xs">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span>Mẹo nhỏ</span>
            </div>
            <ul className="space-y-1 text-[11px] text-amber-900/90 font-medium pl-0 list-none m-0 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Giữ nội dung ngắn gọn, rõ ràng</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Tập trung vào kinh nghiệm và kỹ năng nổi bật</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Cập nhật CV thường xuyên</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Cần hỗ trợ? */}
          <div className="bg-[#f0f7ff] rounded-2xl p-4 border border-[#dbeafe] shadow-2xs flex items-center justify-between gap-3 relative overflow-hidden">
            <div className="space-y-2 z-10">
              <div>
                <h4 className="text-xs font-black text-slate-900 m-0">Cần hỗ trợ?</h4>
                <p className="text-[10.5px] text-slate-600 font-medium m-0 mt-0.5">
                  Đội ngũ Careza luôn sẵn sàng hỗ trợ bạn.
                </p>
              </div>
              <button
                type="button"
                onClick={() => message.info("Tổng đài hỗ trợ Careza: 1900 6868")}
                className="bg-white hover:bg-slate-50 text-[#0062ff] font-extrabold text-[11px] px-3 py-1.5 rounded-xl border border-blue-200 shadow-2xs flex items-center gap-1 transition-all cursor-pointer"
              >
                <span>Liên hệ hỗ trợ</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Headphone Illustration */}
            <div className="w-12 h-12 rounded-full bg-blue-100 text-[#0062ff] flex items-center justify-center shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
          </div>

        </div>
      </div>

      {/* 4. Slim Bottom Banner: “Một CV tốt, nhiều cơ hội hơn” */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-r from-[#edf5ff] via-[#f4f8ff] to-[#e8f1ff] border border-blue-100 shadow-2xs p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
        <div className="space-y-1 max-w-lg z-10">
          <h3 className="text-sm sm:text-base font-black text-slate-900 m-0">
            Một CV tốt, nhiều cơ hội hơn
          </h3>
          <p className="text-xs text-slate-600 font-medium m-0 leading-relaxed">
            Quản lý CV khoa học, cập nhật thường xuyên và sẵn sàng cho những cơ hội phù hợp.
          </p>
        </div>

        {/* Decorative Calligraphy & Illustration on Right */}
        <div className="flex items-center gap-4 z-10 shrink-0">
          <div className="text-right -rotate-3 pointer-events-none select-none">
            <span className="font-serif italic text-xs font-bold text-[#0062ff] block">
              Your Talent
            </span>
            <span className="font-serif italic text-xs font-bold text-[#0062ff] block -mt-0.5">
              Our Connection
            </span>
          </div>
        </div>

        {/* Subtle background decoration */}
        <div className="absolute right-0 top-0 h-full w-48 pointer-events-none opacity-40 select-none overflow-hidden hidden md:block">
          <img
            src="/images/taocv.png"
            alt="Careza CV illustration"
            className="w-full h-full object-cover object-right"
          />
        </div>
      </div>

      {/* Modal Preview CV */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Eye className="w-4 h-4 text-[#0062ff]" />
            <span>Xem trước: {selectedCvForPreview?.title || "Bản xem trước CV"}</span>
          </div>
        }
        open={isPreviewModalOpen}
        onCancel={() => setIsPreviewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsPreviewModalOpen(false)} className="rounded-xl text-xs font-bold">
            Đóng
          </Button>,
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownloadCv}
            className="bg-[#0062ff] rounded-xl text-xs font-bold"
          >
            Tải xuống PDF
          </Button>,
        ]}
        width={680}
        centered
      >
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 my-2">
          <div className="w-full bg-white rounded-xl shadow-md border border-slate-200 p-6 text-xs space-y-4">
            <div
              className="flex items-center justify-between border-b-2 pb-3"
              style={{ borderColor: selectedCvForPreview?.themeColor || "#0062ff" }}
            >
              <div>
                <h2 className="text-lg font-black text-slate-900 m-0">
                  {selectedCvForPreview?.title || "CV Product Designer"}
                </h2>
                <span className="text-xs font-bold text-slate-600 block mt-0.5">
                  {selectedCvForPreview?.jobTitle || "Product Designer"}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {safeFormatDate(selectedCvForPreview?.updatedAt || new Date().toISOString())}
                </span>
              </div>
              <img
                src={selectedCvForPreview?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
                alt="avatar"
                className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-xs"
              />
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-black text-slate-800 m-0 uppercase tracking-wider">
                Kỹ năng & Chuyên môn
              </h4>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedCvForPreview?.tags?.map((tag: string, idx: number) => (
                  <Tag key={idx} color="blue" className="rounded-md text-[11px] font-bold">
                    {tag}
                  </Tag>
                ))}
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <h4 className="text-xs font-black text-slate-800 m-0 uppercase tracking-wider">
                Tóm tắt hồ sơ
              </h4>
              <p className="text-slate-600 text-xs leading-relaxed m-0 font-medium">
                {cvForm.summary}
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function CandidateCvHubPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
          <Spin size="large" />
        </div>
      }
    >
      <CvHubContent />
    </Suspense>
  );
}
