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

  const handleDownloadCv = () => {
    message.loading({ content: "Đang tạo bản PDF chuẩn in ấn...", key: "downloadCv" });
    setTimeout(() => {
      message.success({ content: "Đã tải xuống CV thành công!", key: "downloadCv" });
      window.print();
    }, 600);
  };

  const tabParam = searchParams.get("tab") || "my-cv";
  const [activeTab, setActiveTab] = useState(tabParam);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
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
      const errorMsg = error.response?.data?.message || "Tải tài liệu lên thất bại.";
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
      <div className="w-full max-w-[1460px] mx-auto px-4 sm:px-6 md:px-8 xl:px-[38px] space-y-5">
        {/* Header Box / Banner Tải CV Lên */}
            <div className="relative w-full rounded-2xl overflow-hidden min-h-[140px] sm:min-h-[160px] bg-gradient-to-r from-[#f0f6ff] via-[#f5f9ff] to-[#eaf2ff] border border-blue-100 shadow-2xs p-5 sm:p-6 flex flex-col justify-between">
              <div>
                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1.5">
                  <Link href="/ung-vien/dashboard" className="text-slate-500 hover:text-[#0062ff]">‹ Ứng viên</Link>
                  <span className="text-slate-400">&gt;</span>
                  <Link href="/ung-vien/cv" className="text-slate-500 hover:text-[#0062ff]">CV của tôi</Link>
                  <span className="text-slate-400">&gt;</span>
                  <span className="text-[#0062ff] font-bold">Tải CV lên</span>
                </div>

                {/* Heading + Badge */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight m-0">
                    Tải CV lên
                  </h1>
                  <span className="bg-[#e0edff] text-[#0062ff] text-xs font-extrabold px-3 py-1 rounded-full border border-blue-200/90 shadow-2xs">
                    Đơn giản · Nhanh chóng
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-[13px] text-slate-600 font-medium m-0 mt-1">
                  Chỉ vài bước để thêm CV của bạn vào Careza và sẵn sàng ứng tuyển
                </p>
              </div>

              {/* Decorative Right Area */}
              <div className="absolute top-4 right-4 sm:right-6 hidden sm:flex items-center gap-3 pointer-events-none select-none">
                {/* Calligraphy text */}
                <div className="text-right -rotate-6">
                  <span className="font-serif italic text-sm lg:text-base font-bold text-[#0062ff] block">
                    Upload CV
                  </span>
                  <span className="font-serif italic text-sm lg:text-base font-bold text-[#0062ff] block -mt-0.5">
                    Open More Opportunities
                  </span>
                </div>

                {/* Illustration Card */}
                <div className="bg-white/95 rounded-2xl p-2.5 sm:p-3 border border-blue-100 shadow-md backdrop-blur-xs flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0062ff]">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 pr-1">
                    <span className="text-[11px] font-black text-[#0062ff] block leading-tight">
                      Cơ hội tốt hơn
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium block">
                      đang chờ bạn
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Row: Left Dropzone (68%) | Right File Panel (32%) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column (68% -> 8 cols) */}
              <div className="lg:col-span-8 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                <h3 className="text-sm sm:text-base font-black text-slate-900 m-0 mb-4">
                  Tải lên CV của bạn
                </h3>

                {/* Dropzone Box */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer min-h-[290px] ${
                    isDragOver
                      ? "border-[#0062ff] bg-[#eff6ff] scale-[1.01]"
                      : "border-blue-200/90 bg-[#fafcff] hover:bg-[#f3f8ff] hover:border-[#0062ff]"
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

                  {/* Cloud Icon */}
                  <div className="w-16 h-16 rounded-full bg-blue-50 text-[#0062ff] flex items-center justify-center mb-3 shadow-2xs">
                    <UploadCloud className="w-8 h-8 stroke-[2.2]" />
                  </div>

                  {/* Text */}
                  <h4 className="text-base font-black text-slate-900 m-0 mb-1">
                    Kéo thả file CV vào đây
                  </h4>
                  <span className="text-xs text-slate-400 font-medium mb-3">hoặc</span>

                  {/* Button */}
                  <button
                    type="button"
                    className="bg-[#0062ff] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-full shadow-md shadow-blue-500/20 transition-all cursor-pointer border-none"
                  >
                    Chọn file từ máy tính
                  </button>

                  {/* Limits */}
                  <p className="text-xs text-slate-500 font-medium m-0 mt-4">
                    Hỗ trợ định dạng: PDF, DOC, DOCX (Tối đa 10MB)
                  </p>
                </div>
              </div>

              {/* Right Column (32% -> 4 cols) */}
              <div className="lg:col-span-4 space-y-4">
                {/* File đã chọn Card */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
                  <h3 className="text-sm sm:text-base font-black text-slate-900 m-0 mb-3.5">
                    File đã chọn
                  </h3>

                  {/* Case 1: Chưa chọn file */}
                  {!selectedFile && (
                    <div className="bg-[#f8faff] rounded-2xl p-6 border border-slate-100 flex flex-col items-center justify-center text-center min-h-[170px]">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-400 flex items-center justify-center mb-2.5">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-700 block mb-1">
                        Chưa có file nào được chọn
                      </span>
                      <p className="text-[11px] text-slate-400 font-medium m-0 leading-relaxed max-w-[200px]">
                        Hãy chọn file CV từ máy tính của bạn để bắt đầu tải lên.
                      </p>
                    </div>
                  )}

                  {/* Case 2: Đã chọn file & chưa upload xong */}
                  {selectedFile && !uploadSuccess && (
                    <div className="bg-[#f8faff] rounded-2xl p-4 border border-blue-100 space-y-3.5">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0062ff] flex items-center justify-center font-black text-xs shrink-0 uppercase">
                          {selectedFile.name.split(".").pop()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-bold text-slate-900 block truncate" title={selectedFile.name}>
                            {selectedFile.name}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                            {formatFileSize(selectedFile.size)}
                          </span>
                          <span className="inline-block mt-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                            Sẵn sàng tải lên
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-[#0062ff] hover:bg-white text-xs font-semibold transition-all cursor-pointer bg-transparent"
                        >
                          Đổi file
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedFile(null)}
                          className="py-1.5 px-3 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-all cursor-pointer bg-transparent"
                        >
                          Xóa
                        </button>
                      </div>

                      {/* Upload button */}
                      <Button
                        type="primary"
                        loading={isUploading}
                        onClick={handleUploadSubmit}
                        className="w-full bg-[#0062ff] hover:bg-blue-700 text-white font-bold h-10 rounded-xl shadow-md shadow-blue-500/20 text-xs sm:text-sm"
                      >
                        {isUploading ? "Đang tải CV lên..." : "Tải CV lên"}
                      </Button>
                    </div>
                  )}

                  {/* Case 3: Upload thành công */}
                  {selectedFile && uploadSuccess && (
                    <div className="bg-emerald-50/80 rounded-2xl p-4 border border-emerald-200 text-center space-y-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-emerald-800 block">
                          ✓ Tải CV thành công
                        </span>
                        <p className="text-[11px] text-emerald-700/80 font-medium m-0 mt-0.5">
                          CV đã được thêm vào danh sách CV của bạn.
                        </p>
                      </div>

                      <div className="pt-1 flex flex-col gap-1.5">
                        <Link
                          href="/ung-vien/cv"
                          onClick={() => setActiveTab("builder")}
                          className="w-full bg-[#0062ff] hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 shadow-xs"
                        >
                          <span>CV của tôi</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            setUploadSuccess(false);
                          }}
                          className="text-xs font-semibold text-slate-500 hover:text-slate-800 py-1 bg-transparent border-none cursor-pointer"
                        >
                          Tải thêm CV khác
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Box Một vài lưu ý */}
                <div className="bg-[#eff6ff] rounded-2xl p-4 border border-blue-100 text-xs">
                  <div className="flex items-center gap-1.5 mb-2 font-bold text-slate-900">
                    <Info className="w-4 h-4 text-[#0062ff]" />
                    <span>Một vài lưu ý</span>
                  </div>
                  <ul className="space-y-1.5 pl-4 m-0 text-[11px] text-slate-600 font-medium list-disc">
                    <li>Sử dụng file CV rõ ràng, đầy đủ thông tin.</li>
                    <li>Dung lượng tối đa 10MB.</li>
                    <li>Hỗ trợ định dạng: PDF, DOC, DOCX.</li>
                    <li>Đảm bảo nội dung không vi phạm quy định cộng đồng của Careza.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Các bước đơn giản (3 Steps Horizontal) */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs">
              <h3 className="text-sm sm:text-base font-black text-slate-900 m-0 mb-4">
                Các bước đơn giản
              </h3>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Step 1 */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="w-7 h-7 rounded-full bg-[#0062ff] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                    1
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 block leading-tight">
                      Chọn file CV
                    </span>
                    <span className="text-[10.5px] text-slate-500 font-medium block">
                      Chọn file từ máy tính của bạn
                    </span>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-slate-300 hidden sm:block shrink-0" />

                {/* Step 2 */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="w-7 h-7 rounded-full bg-[#0062ff] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                    2
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 block leading-tight">
                      Tải lên hệ thống
                    </span>
                    <span className="text-[10.5px] text-slate-500 font-medium block">
                      Hệ thống sẽ xử lý file của bạn
                    </span>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-slate-300 hidden sm:block shrink-0" />

                {/* Step 3 */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="w-7 h-7 rounded-full bg-[#0062ff] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                    3
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 block leading-tight">
                      Lưu vào CV của tôi
                    </span>
                    <span className="text-[10.5px] text-slate-500 font-medium block">
                      CV được lưu an toàn, sẵn sàng ứng tuyển
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Strip Bảo Mật Cuối Trang */}
            <div className="bg-gradient-to-r from-[#edf4ff] via-[#f3f8ff] to-[#eaf2ff] rounded-2xl p-4 sm:p-5 border border-blue-100 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-[#0062ff] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 m-0">
                    Dữ liệu của bạn luôn được bảo mật
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium m-0 mt-0.5">
                    Careza cam kết bảo vệ thông tin cá nhân của bạn với các tiêu chuẩn bảo mật nghiêm ngặt.
                  </p>
                </div>
              </div>

              <div className="hidden sm:block text-right -rotate-3 select-none">
                <span className="font-serif italic text-xs font-bold text-[#0062ff] block">
                  Better CV
                </span>
                <span className="font-serif italic text-xs font-bold text-[#0062ff] block -mt-0.5">
                  Brighter Tomorrow
                </span>
              </div>
            </div>
      </div>
    );
  }

  if (activeTab === "builder") {
    return (
      <div className="w-full max-w-[1580px] mx-auto px-3 sm:px-5 md:px-6 space-y-4">
        {/* Header & Controls Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-transparent">
              <div>
                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
                  <Link href="/ung-vien/dashboard" className="text-slate-500 hover:text-[#0062ff]">‹ Ứng viên</Link>
                  <span className="text-slate-400">&gt;</span>
                  <Link href="/ung-vien/cv" className="text-slate-500 hover:text-[#0062ff]">CV của tôi</Link>
                  <span className="text-slate-400">&gt;</span>
                  <span className="text-[#0062ff] font-bold">Tạo CV online</span>
                </div>

                {/* Heading + Badge */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight m-0">
                    Tạo CV online
                  </h1>
                  <span className="bg-[#e0edff] text-[#0062ff] text-xs font-extrabold px-3 py-1 rounded-full border border-blue-200/90 shadow-2xs">
                    Biến ý tưởng thành cơ hội
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-[13px] text-slate-600 font-medium m-0 mt-0.5">
                  Chỉ cần vài thao tác, bạn sẽ có một bản CV chuyên nghiệp và ấn tượng
                </p>
              </div>

              {/* Action Toolbar on Top Right */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Link
                  href="/ung-vien/cv?tab=templates"
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs"
                >
                  ← Quay lại
                </Link>

                {/* Editable CV Name */}
                <div className="flex items-center gap-1.5 bg-white border border-slate-200/90 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 shadow-2xs">
                  <FileText className="w-3.5 h-3.5 text-[#0062ff]" />
                  {isEditingTitle ? (
                    <input
                      type="text"
                      value={cvTitle}
                      onChange={(e) => setCvTitle(e.target.value)}
                      onBlur={() => setIsEditingTitle(false)}
                      onKeyDown={(e) => e.key === "Enter" && setIsEditingTitle(false)}
                      autoFocus
                      className="border-none outline-hidden bg-slate-50 px-1 py-0.5 rounded text-xs font-bold w-36"
                    />
                  ) : (
                    <span onClick={() => setIsEditingTitle(true)} className="cursor-pointer">
                      {cvTitle}
                    </span>
                  )}
                  <Edit2
                    onClick={() => setIsEditingTitle(!isEditingTitle)}
                    className="w-3 h-3 text-slate-400 hover:text-slate-700 cursor-pointer ml-0.5"
                  />
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Đã lưu 10:42</span>
                </div>

                {/* Undo / Redo */}
                <div className="flex items-center gap-1 bg-white border border-slate-200/90 p-0.5 rounded-xl shadow-2xs">
                  <button
                    type="button"
                    title="Hoàn tác"
                    onClick={() => message.info("Đã hoàn tác thao tác trước")}
                    className="w-7 h-7 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer border-none bg-transparent"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Làm lại"
                    onClick={() => message.info("Đã làm lại thao tác")}
                    className="w-7 h-7 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer border-none bg-transparent"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Preview & Download Buttons */}
                <button
                  type="button"
                  onClick={() => setIsEditorModalOpen(true)}
                  className="flex items-center gap-1.5 bg-[#eff6ff] hover:bg-blue-100 text-[#0062ff] font-bold px-3.5 py-2 rounded-xl text-xs border border-blue-200/80 transition-all cursor-pointer shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Xem trước</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadCv}
                  className="flex items-center gap-1.5 bg-[#0062ff] hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer border-none"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải xuống</span>
                </button>
              </div>
            </div>

            {/* 3-COLUMN WORKSPACE: LEFT TOOLS | CV CANVAS | RIGHT SETTINGS */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
              
              {/* CỘT 1: LEFT TOOLBAR + CONTENT PANEL (3 cols) */}
              <div className="xl:col-span-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex overflow-hidden min-h-[640px]">
                {/* Vertical Slim Icon Bar */}
                <div className="w-[62px] shrink-0 border-r border-slate-100 bg-[#fbfcfe] p-1.5 flex flex-col gap-2 items-center select-none">
                  <button
                    onClick={() => setActiveLeftTool("content")}
                    className={`w-full py-2.5 px-1 rounded-xl flex flex-col items-center gap-1 text-[10px] font-bold transition-all border-none cursor-pointer ${
                      activeLeftTool === "content"
                        ? "bg-[#eef5ff] text-[#0062ff] shadow-2xs"
                        : "bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Nội dung</span>
                  </button>

                  <button
                    onClick={() => setActiveLeftTool("templates")}
                    className={`w-full py-2.5 px-1 rounded-xl flex flex-col items-center gap-1 text-[10px] font-bold transition-all border-none cursor-pointer ${
                      activeLeftTool === "templates"
                        ? "bg-[#eef5ff] text-[#0062ff] shadow-2xs"
                        : "bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    <LayoutOutlined className="text-sm" />
                    <span>Mẫu CV</span>
                  </button>

                  <button
                    onClick={() => setActiveLeftTool("design")}
                    className={`w-full py-2.5 px-1 rounded-xl flex flex-col items-center gap-1 text-[10px] font-bold transition-all border-none cursor-pointer ${
                      activeLeftTool === "design"
                        ? "bg-[#eef5ff] text-[#0062ff] shadow-2xs"
                        : "bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    <Paintbrush className="w-4 h-4" />
                    <span>Thiết kế</span>
                  </button>

                  <button
                    onClick={() => setActiveLeftTool("colors")}
                    className={`w-full py-2.5 px-1 rounded-xl flex flex-col items-center gap-1 text-[10px] font-bold transition-all border-none cursor-pointer ${
                      activeLeftTool === "colors"
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
                      <p className="text-[11px] text-slate-500 font-medium m-0 mt-0.5 mb-3">
                        Thêm và chỉnh sửa các mục trong CV
                      </p>

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
                              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-left border ${
                                isSelected
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
                            className={`p-2 rounded-xl border cursor-pointer text-center transition-all ${
                              selectedTemplate === tpl.id
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
                            className={`w-full p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                              layoutStyle === ly.id
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
                            className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${
                              cvThemeColor === col ? "border-slate-900 scale-110 shadow-xs" : "border-white shadow-2xs"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* CỘT 2: CV CANVAS Ở GIỮA (6 cols) */}
              <div className="xl:col-span-6 bg-[#f4f7fa] rounded-2xl border border-slate-200/80 p-3 sm:p-4 flex flex-col items-center justify-start min-h-[640px] select-none">
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
                  className={`w-full max-w-[540px] bg-white rounded-2xl shadow-md border border-slate-200/90 overflow-hidden flex flex-col sm:flex-row text-[10px] leading-snug`}
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
              <div className="xl:col-span-3 bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-4">
                <h3 className="text-xs font-black text-slate-900 m-0">Tùy chỉnh thiết kế</h3>

                {/* Sub-Tabs */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
                  <button
                    onClick={() => setActiveRightTab("font")}
                    className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${
                      activeRightTab === "font" ? "bg-white text-slate-900 shadow-2xs" : "bg-transparent text-slate-500"
                    }`}
                  >
                    Phông chữ
                  </button>
                  <button
                    onClick={() => setActiveRightTab("color")}
                    className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${
                      activeRightTab === "color" ? "bg-white text-slate-900 shadow-2xs" : "bg-transparent text-slate-500"
                    }`}
                  >
                    Màu sắc
                  </button>
                  <button
                    onClick={() => setActiveRightTab("layout")}
                    className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${
                      activeRightTab === "layout" ? "bg-white text-slate-900 shadow-2xs" : "bg-transparent text-slate-500"
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
                          className={`py-1.5 rounded-xl border text-xs font-bold cursor-pointer ${
                            fontSizeScale === "small" ? "border-[#0062ff] bg-blue-50 text-[#0062ff]" : "border-slate-200 bg-white text-slate-700"
                          }`}
                        >
                          A-
                        </button>
                        <button
                          onClick={() => setFontSizeScale("normal")}
                          className={`py-1.5 rounded-xl border text-xs font-bold cursor-pointer ${
                            fontSizeScale === "normal" ? "border-[#0062ff] bg-blue-50 text-[#0062ff]" : "border-slate-200 bg-white text-slate-700"
                          }`}
                        >
                          A
                        </button>
                        <button
                          onClick={() => setFontSizeScale("large")}
                          className={`py-1.5 rounded-xl border text-xs font-bold cursor-pointer ${
                            fontSizeScale === "large" ? "border-[#0062ff] bg-blue-50 text-[#0062ff]" : "border-slate-200 bg-white text-slate-700"
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
                          className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${
                            cvThemeColor === c ? "border-slate-900 scale-110 shadow-xs" : "border-white shadow-2xs"
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
                          className={`p-2 rounded-xl border flex flex-col items-center gap-1 text-[11px] font-bold transition-all cursor-pointer ${
                            layoutStyle === item.id
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
      <div className="w-full max-w-[1460px] mx-auto px-4 sm:px-6 md:px-8 xl:px-[38px] space-y-3.5">
        {/* Banner MẪU CV (Thiết kế compact, chiều cao gọn gàng) */}
        <div className="relative w-full rounded-2xl overflow-hidden min-h-[145px] sm:min-h-[155px] bg-[#eef5ff] border border-blue-100 shadow-2xs">
          <img
            src="/images/taocv.png"
            alt="Mẫu CV Careza"
            className="absolute inset-0 w-full h-full object-cover object-right pointer-events-none select-none"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#f8fbff] via-[#f8fbff]/90 sm:via-[#f8fbff]/75 to-transparent w-full sm:w-[65%] pointer-events-none" />
          
          <div className="relative z-10 p-3.5 sm:p-4 lg:p-4.5 flex flex-col justify-between h-full min-h-[145px] sm:min-h-[155px] max-w-2xl">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mb-1">
                <span>Ứng viên</span>
                <span className="text-slate-400">&gt;</span>
                <span>CV của tôi</span>
                <span className="text-slate-400">&gt;</span>
                <span className="text-[#0062ff] font-bold">Mẫu CV</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight m-0">
                  Mẫu CV chuyên nghiệp
                </h1>
                <span className="bg-[#e0edff] text-[#0062ff] text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-200/90 shadow-2xs">
                  Đa dạng phong cách · Chuẩn ATS
                </span>
              </div>
              <p className="text-[11.5px] text-slate-600 font-medium m-0 mt-0.5">
                Khám phá các mẫu CV chuyên nghiệp, chuẩn ATS và tối ưu cho mọi ngành nghề
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-amber-100/90 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs"><Zap className="w-3 h-3 fill-amber-500 text-amber-500" /></div>
                <div className="min-w-0"><span className="text-[11px] font-black text-slate-900 block leading-tight">Nhanh chóng</span><span className="text-[9px] text-slate-500 font-medium block">Chỉ vài phút</span></div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-emerald-100/90 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs"><ShieldCheck className="w-3 h-3 stroke-[2.5]" /></div>
                <div className="min-w-0"><span className="text-[11px] font-black text-slate-900 block leading-tight">Chuẩn tuyển dụng</span><span className="text-[9px] text-slate-500 font-medium block">Theo tiêu chuẩn HR</span></div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-amber-100/90 text-amber-500 flex items-center justify-center shrink-0 shadow-2xs"><Star className="w-3 h-3 fill-amber-500 text-amber-500" /></div>
                <div className="min-w-0"><span className="text-[11px] font-black text-slate-900 block leading-tight">Nhiều mẫu đẹp</span><span className="text-[9px] text-slate-500 font-medium block">Phù hợp mọi ngành nghề</span></div>
              </div>
            </div>
          </div>

          <div className="absolute top-3.5 right-[36%] lg:right-[39%] hidden sm:block pointer-events-none -rotate-6 select-none">
            <span className="font-serif italic text-xs lg:text-sm font-bold text-[#0052cc]/85 tracking-wide block">
              Good CV
            </span>
            <span className="font-serif italic text-xs lg:text-sm font-bold text-[#0052cc]/85 tracking-wide block -mt-0.5 pl-1.5">
              Bright Future
            </span>
          </div>
        </div>

        {/* STEPPER QUY TRÌNH TẠO CV */}
        <div className="bg-white rounded-xl p-2.5 sm:p-3 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between gap-2 max-w-4xl mx-auto">
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-6 h-6 rounded-full bg-[#0062ff] text-white font-black text-[11px] flex items-center justify-center shadow-xs">1</div>
              <span className="text-xs font-black text-[#0062ff] whitespace-nowrap">Chọn mẫu</span>
            </div>
            <div className="flex-1 h-[2px] bg-slate-200 mx-2 min-w-[20px]" />
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 font-bold text-[11px] flex items-center justify-center">2</div>
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap hidden sm:inline">Nhập thông tin</span>
            </div>
            <div className="flex-1 h-[2px] bg-slate-200 mx-2 min-w-[20px]" />
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 font-bold text-[11px] flex items-center justify-center">3</div>
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap hidden sm:inline">Tùy chỉnh thiết kế</span>
            </div>
            <div className="flex-1 h-[2px] bg-slate-200 mx-2 min-w-[20px]" />
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 font-bold text-[11px] flex items-center justify-center">4</div>
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap hidden sm:inline">Tải xuống & Ứng tuyển</span>
            </div>
          </div>
        </div>

        {/* GALLERY MẪU CV */}
        <div className="flex flex-col lg:flex-row items-start gap-6">
          <div className="w-full lg:w-[240px] shrink-0 space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 block">
                Phong cách CV
              </h3>
              <div className="space-y-1.5">
                {STYLE_FILTERS.map((filter) => {
                  const isSelected = selectedStyleFilter === filter.id;
                  return (
                    <button
                      key={filter.id}
                      onClick={() => setSelectedStyleFilter(filter.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        isSelected
                          ? "bg-[#eef5ff] text-[#0062ff] border-blue-200 shadow-2xs"
                          : "bg-transparent text-slate-600 border-transparent hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span>{filter.label}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${isSelected ? "bg-[#dbeafe] text-[#0062ff]" : "bg-slate-100 text-slate-500"}`}>
                        {filter.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-5">
              {displayedTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all p-4 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-black text-slate-900">{template.name}</span>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0062ff] border border-blue-100">
                      {template.badge}
                    </span>
                  </div>
                  <div className="w-full aspect-[3/4] bg-slate-50 rounded-xl mb-3 overflow-hidden border border-slate-100 flex items-center justify-center">
                    <img src={template.avatar} alt={template.name} className="w-16 h-16 rounded-full object-cover shadow-md" />
                  </div>
                  <Link
                    href={`/ung-vien/cv?tab=builder&template=${template.id}`}
                    className="w-full py-2.5 rounded-xl bg-[#0062ff] hover:bg-blue-700 text-white font-bold text-xs text-center transition-all shadow-md shadow-blue-500/20"
                  >
                    Dùng mẫu này
                  </Link>
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
  const defaultMockCvs = [
    {
      id: "cv-1",
      title: "CV Frontend Developer (Chính)",
      jobTitle: "Senior Frontend Developer",
      isDefault: true,
      sourceType: "created", // 'created' = Tạo trên Careza | 'uploaded' = Tải lên từ máy tính
      updatedAt: "2026-08-20T10:42:00",
      createdAt: "2026-08-01T09:00:00",
      pageCount: 1,
      fileSize: 524288,
      status: "completed",
      completionPercent: 100,
      viewCount: 20,
      applicationCount: 3,
      tags: ["Chuyên môn", "CV Careza", "React", "Next.js"],
      themeColor: "#0062ff",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    },
    {
      id: "cv-2",
      title: "CV Tiếng Anh - Global Opportunities",
      jobTitle: "Marketing & Communications Lead",
      isDefault: false,
      sourceType: "created",
      updatedAt: "2026-08-18T14:20:00",
      createdAt: "2026-07-25T11:30:00",
      pageCount: 1,
      fileSize: 491520,
      status: "completed",
      completionPercent: 90,
      viewCount: 32,
      applicationCount: 1,
      tags: ["Marketing", "Content", "Social Media", "English"],
      themeColor: "#8b5cf6",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
    },
    {
      id: "cv-3",
      title: "CV Kinh doanh",
      jobTitle: "Business Development Executive",
      isDefault: false,
      sourceType: "uploaded",
      updatedAt: "2026-08-15T09:12:00",
      createdAt: "2026-07-10T16:45:00",
      pageCount: 2,
      fileSize: 778240,
      status: "incompleted",
      completionPercent: 60,
      viewCount: 12,
      applicationCount: 0,
      tags: ["Kinh doanh", "Bán hàng", "Chăm sóc khách hàng"],
      themeColor: "#f59e0b",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    },
    {
      id: "cv-4",
      title: "CV Nguyễn Mai Phương",
      jobTitle: "Senior Project Manager",
      isDefault: false,
      sourceType: "created",
      updatedAt: "2026-08-10T16:30:00",
      createdAt: "2026-06-20T08:15:00",
      pageCount: 1,
      fileSize: 532480,
      status: "completed",
      completionPercent: 100,
      viewCount: 26,
      applicationCount: 2,
      tags: ["Hành chính", "Quản lý dự án", "Tiếng Anh"],
      themeColor: "#0062ff",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    },
  ];

  const mergedCvs = documents.length > 0
    ? documents.map((doc: any, index: number) => {
        const isUploaded = Boolean(
          doc.documentType === "uploaded" ||
          doc.fileUrl?.toLowerCase().endsWith(".pdf") ||
          doc.mimeType?.includes("pdf")
        );
        const validUpdated = doc.updatedAt || doc.createdAt;
        const validCreated = doc.createdAt || doc.updatedAt;
        const hasValidSize = typeof doc.fileSize === "number" && !isNaN(doc.fileSize) && doc.fileSize > 0;

        return {
          id: doc._id || doc.id || `doc-${index}`,
          title: doc.title || doc.documentName || `CV của tôi #${index + 1}`,
          jobTitle: doc.jobTitle || "Ứng viên Careza",
          isDefault: Boolean(doc.isDefault || index === 0),
          sourceType: isUploaded ? "uploaded" : "created",
          updatedAt: validUpdated ? String(validUpdated) : "",
          createdAt: validCreated ? String(validCreated) : "",
          pageCount: typeof doc.pageCount === "number" && doc.pageCount > 0 ? doc.pageCount : 1,
          fileSize: hasValidSize ? doc.fileSize : 524288,
          status: doc.status === "incompleted" ? "incompleted" : "completed",
          completionPercent: typeof doc.completionPercent === "number" ? doc.completionPercent : (doc.status === "incompleted" ? 60 : 100),
          viewCount: typeof doc.viewCount === "number" ? doc.viewCount : 20 + index * 12,
          applicationCount: typeof doc.applicationCount === "number" ? doc.applicationCount : (index % 2 === 0 ? 3 : 1),
          tags: Array.isArray(doc.tags) && doc.tags.length > 0 ? doc.tags : ["Chuyên môn", "CV Careza"],
          themeColor: index % 4 === 0 ? "#0062ff" : index % 4 === 1 ? "#8b5cf6" : index % 4 === 2 ? "#f59e0b" : "#10b981",
          avatar: (user as any)?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
          fileUrl: doc.fileUrl || doc.path || "/sample-cv.pdf",
        };
      })
    : defaultMockCvs;

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
    <div className="w-full max-w-[1460px] mx-auto px-4 sm:px-6 md:px-8 xl:px-[38px] space-y-4 pb-8">
      {/* 1. Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium pt-1">
        <Link href="/" className="text-slate-500 hover:text-[#0062ff] transition-colors">Trang chủ</Link>
        <span className="text-slate-400">&gt;</span>
        <Link href="/ung-vien/ho-so" className="text-slate-500 hover:text-[#0062ff] transition-colors">Ứng viên</Link>
        <span className="text-slate-400">&gt;</span>
        <span className="text-[#0062ff] font-bold">CV của tôi</span>
      </div>

      {/* 2. Hero Box “CV của tôi” */}
      <div className="relative w-full rounded-2xl overflow-hidden min-h-[160px] sm:min-h-[170px] bg-gradient-to-r from-[#f0f6ff] via-[#f7faff] to-[#eaf2ff] border border-blue-100 shadow-2xs p-4 sm:p-5 lg:p-6 flex flex-col justify-between">
        {/* Background Visual Image taocv.png & Calligraphy */}
        <div className="absolute top-0 right-0 h-full w-[45%] md:w-[38%] pointer-events-none select-none overflow-hidden hidden sm:block">
          <div className="relative w-full h-full">
            {/* Handwritten calligraphy */}
            <div className="absolute top-4 left-6 z-10 text-center -rotate-6">
              <span className="font-serif italic text-sm font-bold text-[#0062ff] block tracking-wide">
                Good CV
              </span>
              <span className="font-serif italic text-xs font-bold text-blue-400 block -mt-0.5">
                Brighter Opportunities
              </span>
            </div>
            <img
              src="/images/taocv.png"
              alt="Careza CV illustration"
              className="w-full h-full object-cover object-right opacity-95"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#f0f6ff] via-[#f7faff]/50 to-transparent w-full" />
          </div>
        </div>

        {/* Top Hero Content: Title, Description & Action Button */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-3">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight m-0">
                CV của tôi
              </h1>
              <span className="bg-[#e0edff] text-[#0062ff] text-xs font-extrabold px-3 py-1 rounded-full border border-blue-200/90 shadow-2xs">
                Quản lý dễ dàng, sẵn sàng cơ hội mới
              </span>
            </div>
            <p className="text-xs sm:text-[13px] text-slate-600 font-medium m-0 mt-1">
              Tất cả CV của bạn được lưu tại đây. Chọn CV phù hợp để ứng tuyển nhanh hơn.
            </p>
          </div>

          {/* Button + Tạo CV mới (Dropdown) */}
          <div className="shrink-0">
            <Dropdown
              menu={{
                items: [
                  {
                    key: "builder",
                    icon: <Edit2 className="w-3.5 h-3.5 text-[#0062ff]" />,
                    label: <Link href="/ung-vien/cv?tab=builder" className="font-bold text-xs">Tạo CV online</Link>,
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
                className="flex items-center gap-1.5 bg-[#0062ff] hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer border-none"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Tạo CV mới</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </Dropdown>
          </div>
        </div>

        {/* Bottom Hero Stats: 3 Horizontal Stat Cards */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 max-w-xl">
          {/* Card 1: Tổng số CV */}
          <div className="bg-white/95 backdrop-blur-xs rounded-2xl p-2.5 sm:p-3 border border-blue-100/90 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0 border border-blue-100">
              <FileText className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-black text-slate-900 block leading-tight">
                {mergedCvs.length}
              </span>
              <span className="text-[11px] font-bold text-slate-500 block">
                Tổng số CV
              </span>
            </div>
          </div>

          {/* Card 2: CV hoàn thiện */}
          <div className="bg-white/95 backdrop-blur-xs rounded-2xl p-2.5 sm:p-3 border border-emerald-100/90 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-black text-slate-900 block leading-tight">
                {completedCount}
              </span>
              <span className="text-[11px] font-bold text-slate-500 block">
                CV hoàn thiện
              </span>
            </div>
          </div>

          {/* Card 3: Tổng lượt xem */}
          <div className="bg-white/95 backdrop-blur-xs rounded-2xl p-2.5 sm:p-3 border border-purple-100/90 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
              <Eye className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-black text-slate-900 block leading-tight">
                {totalViewsCount}
              </span>
              <span className="text-[11px] font-bold text-slate-500 block">
                Tổng lượt xem
              </span>
            </div>
          </div>
        </div>
      </div>

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
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-lg border-none cursor-pointer transition-all ${
                    viewMode === "list" ? "bg-white text-[#0062ff] shadow-2xs" : "bg-transparent text-slate-500 hover:text-slate-800"
                  }`}
                  title="Xem dạng danh sách"
                >
                  <ListIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg border-none cursor-pointer transition-all ${
                    viewMode === "grid" ? "bg-white text-[#0062ff] shadow-2xs" : "bg-transparent text-slate-500 hover:text-slate-800"
                  }`}
                  title="Xem dạng lưới"
                >
                  <GridIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Danh Sách CV Rows */}
          <div className="space-y-3">
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
            ) : (
              filteredCvs.map((cv) => {
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
                          href="/ung-vien/cv?tab=builder"
                          className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-blue-50 text-[#0062ff] font-bold text-xs border border-blue-200 shadow-2xs transition-all"
                        >
                          Tiếp tục chỉnh sửa
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
                        onClick={handleDownloadCv}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-2xs transition-all cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-500" />
                        <span>Tải xuống</span>
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
                              key: "rename",
                              icon: <Edit2 className="w-3.5 h-3.5 text-blue-500" />,
                              label: "Đổi tên",
                              onClick: () => message.info("Chức năng đổi tên CV"),
                            },
                            {
                              key: "edit",
                              icon: <EditOutlined className="text-blue-500" />,
                              label: "Chỉnh sửa",
                              onClick: () => router.push("/ung-vien/cv?tab=builder"),
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
              })
            )}
          </div>

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
