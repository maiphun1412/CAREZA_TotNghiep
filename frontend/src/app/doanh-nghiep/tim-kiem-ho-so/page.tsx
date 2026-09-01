"use client";

import React, { useState, useMemo } from "react";
import {
  Avatar,
  Modal,
  Select,
  Input,
  Checkbox,
  Dropdown,
  Tooltip,
  App,
  Progress,
  Tag,
  Skeleton,
} from "antd";
import type { MenuProps } from "antd";
import {
  Search,
  Filter,
  Bookmark,
  Sparkles,
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  X,
  Eye,
  MessageSquare,
  MoreVertical,
  Download,
  List as ListIcon,
  LayoutGrid,
  TrendingUp,
  History,
  FileText,
  UserCheck,
  CheckCircle2,
  ExternalLink,
  Plus,
  Trash2,
  Mail,
  Phone,
  GraduationCap,
  Award,
  Layers,
  ArrowRight,
  Share2,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import Link from "next/link";

// =====================================================================
// INTERFACES & DATA MODELS
// =====================================================================

export interface CandidateSearchResult {
  id: string;
  name: string;
  avatar: string;
  tag: string;
  tagColor: "green" | "blue" | "purple" | "amber";
  jobTitle: string;
  currentCompany: string;
  experienceYears: number;
  location: string;
  salaryExpectation: string;
  skills: string[];
  source: string;
  updatedTime: string;
  matchScore: number;
  email: string;
  phone: string;
  isSaved?: boolean;
  education?: string;
  bio?: string;
}

export interface SavedFilterItem {
  id: string;
  name: string;
  candidateCount: number;
  criteria: {
    skills?: string[];
    position?: string;
    experience?: string;
    location?: string;
  };
}

export interface SearchSuggestionItem {
  id: string;
  from: string;
  to: string;
  count: number;
}

export interface RecentSearchItem {
  id: string;
  query: string;
  timeAgo: string;
}

// =====================================================================
// INITIAL MOCK DATA (MATCHING REFERENCE EXACTLY)
// =====================================================================

const MOCK_CANDIDATES: CandidateSearchResult[] = [
  {
    id: "cand-1",
    name: "Nguyễn Minh Anh",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
    tag: "Tiềm năng cao",
    tagColor: "green",
    jobTitle: "Frontend Developer",
    currentCompany: "TechSoft",
    experienceYears: 3,
    location: "Hà Nội",
    salaryExpectation: "$1,500 - $2,000",
    skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Redux", "GraphQL", "Webpack", "REST API"],
    source: "LinkedIn",
    updatedTime: "2 ngày trước",
    matchScore: 92,
    email: "minhanh.frontend@email.com",
    phone: "0345 678 901",
    education: "Đại học Bách Khoa Hà Nội - Kỹ sư CNTT",
    bio: "3 năm kinh nghiệm xây dựng các ứng dụng Web SPA quy mô lớn với React và Next.js. Tư duy logic tốt, chủ động trong công việc.",
    isSaved: true,
  },
  {
    id: "cand-2",
    name: "Trần Hoàng Nam",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
    tag: "Phù hợp",
    tagColor: "blue",
    jobTitle: "Frontend Engineer",
    currentCompany: "VinGroup",
    experienceYears: 4,
    location: "TP. Hồ Chí Minh",
    salaryExpectation: "$1,800 - $2,500",
    skills: ["React", "Vue.js", "JavaScript", "Node.js", "HTML/CSS", "TypeScript", "Docker"],
    source: "VietnamWorks",
    updatedTime: "1 tuần trước",
    matchScore: 88,
    email: "namth.fe@outlook.com",
    phone: "0912 345 678",
    education: "Đại học Khoa học Tự nhiên TP.HCM",
    bio: "Chuyên sâu về Frontend Architecture, Micro-frontend và tối ưu trải nghiệm người dùng trên quy mô lớn.",
    isSaved: false,
  },
  {
    id: "cand-3",
    name: "Phạm Thu Hằng",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80",
    tag: "Phù hợp",
    tagColor: "blue",
    jobTitle: "UI/UX Developer",
    currentCompany: "FPT Software",
    experienceYears: 2,
    location: "Đà Nẵng",
    salaryExpectation: "$1,200 - $1,600",
    skills: ["Figma", "React", "UI/UX", "CSS", "JavaScript", "Tailwind CSS"],
    source: "TopCV",
    updatedTime: "3 ngày trước",
    matchScore: 85,
    email: "hangpt.design@gmail.com",
    phone: "0987 654 321",
    education: "Đại học Bách Khoa Đà Nẵng",
    bio: "Kết hợp tư duy thẩm mỹ UI/UX hiện đại với khả năng code Frontend React sắc bén, chuẩn Design System.",
    isSaved: false,
  },
  {
    id: "cand-4",
    name: "Đỗ Thành Tùng",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&h=150&q=80",
    tag: "Cân nhắc",
    tagColor: "purple",
    jobTitle: "Frontend Developer",
    currentCompany: "Tiki",
    experienceYears: 5,
    location: "Hà Nội",
    salaryExpectation: "$2,000 - $3,000",
    skills: ["React", "TypeScript", "Next.js", "Node.js", "GraphQL", "CI/CD", "AWS"],
    source: "Careza",
    updatedTime: "5 ngày trước",
    matchScore: 78,
    email: "tungdt.dev@yahoo.com",
    phone: "0901 234 567",
    education: "Đại học Công Nghệ - ĐHQGHN",
    bio: "Senior Frontend Developer có kinh nghiệm Fullstack và Lead nhóm 6 kỹ sư xây dựng hệ thống E-commerce.",
    isSaved: false,
  },
  {
    id: "cand-5",
    name: "Lê Quang Huy",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
    tag: "Tiềm năng cao",
    tagColor: "green",
    jobTitle: "Senior React Engineer",
    currentCompany: "VNG Corporation",
    experienceYears: 6,
    location: "TP. Hồ Chí Minh",
    salaryExpectation: "$2,200 - $3,200",
    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Redux Toolkit", "Zustand"],
    source: "LinkedIn",
    updatedTime: "1 ngày trước",
    matchScore: 94,
    email: "huy.le@vng.com.vn",
    phone: "0934 567 890",
    education: "Đại học Bách Khoa TP.HCM",
    bio: "Hơn 6 năm kinh nghiệm phát triển các sản phẩm game web và ứng dụng tài chính hiệu năng cao.",
    isSaved: true,
  },
  {
    id: "cand-6",
    name: "Vũ Ngọc Mai",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
    tag: "Phù hợp",
    tagColor: "blue",
    jobTitle: "Frontend Web Developer",
    currentCompany: "One Mount Group",
    experienceYears: 3,
    location: "Hà Nội",
    salaryExpectation: "$1,400 - $1,900",
    skills: ["React", "TypeScript", "Ant Design", "Tailwind CSS", "REST API"],
    source: "TopCV",
    updatedTime: "4 ngày trước",
    matchScore: 86,
    email: "maivn.web@gmail.com",
    phone: "0978 123 456",
    education: "Đại học Hà Nội",
    bio: "Kỹ sư Frontend cẩn thận, nắm vững Ant Design, React Query và quy trình Agile Scrum.",
    isSaved: false,
  },
];

const SEARCH_SUGGESTIONS: SearchSuggestionItem[] = [
  { id: "sug-1", from: "React", to: "Next.js", count: 38 },
  { id: "sug-2", from: "React", to: "TypeScript", count: 52 },
  { id: "sug-3", from: "React", to: "Tailwind CSS", count: 27 },
  { id: "sug-4", from: "Frontend Developer", to: "Senior", count: 41 },
  { id: "sug-5", from: "Hà Nội", to: "Remote", count: 25 },
];

const SAVED_FILTERS: SavedFilterItem[] = [
  {
    id: "sf-1",
    name: "Frontend Senior • Hà Nội",
    candidateCount: 128,
    criteria: { skills: ["React", "TypeScript"], position: "Frontend Developer", location: "Hà Nội" },
  },
  {
    id: "sf-2",
    name: "UI/UX Designer • Remote",
    candidateCount: 96,
    criteria: { skills: ["Figma", "UI/UX"], position: "UX/UI Designer", location: "Remote" },
  },
  {
    id: "sf-3",
    name: "Backend Node.js • 2 - 5 năm",
    candidateCount: 64,
    criteria: { skills: ["Node.js", "Express"], position: "Backend Developer", experience: "2-5" },
  },
];

const RECENT_SEARCHES: RecentSearchItem[] = [
  { id: "rs-1", query: "Frontend Developer • React", timeAgo: "Hôm qua" },
  { id: "rs-2", query: "UI/UX Designer • Figma", timeAgo: "2 ngày trước" },
  { id: "rs-3", query: "Backend • Node.js • 2 - 5 năm", timeAgo: "3 ngày trước" },
  { id: "rs-4", query: "Product Manager • Hà Nội", timeAgo: "5 ngày trước" },
];

// =====================================================================
// MAIN COMPONENT
// =====================================================================

export default function EmployerSearchCandidatePage() {
  const { message } = App.useApp();
  const { user } = useAuthStore();
  const recruiterName = user?.fullName || "Mai Phương";

  // Filter States
  const [keyword, setKeyword] = useState<string>("");
  const [position, setPosition] = useState<string>("Frontend Developer");
  const [skill, setSkill] = useState<string>("React");
  const [experience, setExperience] = useState<string>("2-5");
  const [salary, setSalary] = useState<string>("all");
  const [location, setLocation] = useState<string>("Hà Nội");
  const [workType, setWorkType] = useState<string>("all");
  const [source, setSource] = useState<string>("all");
  const [candidateGroup, setCandidateGroup] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState<boolean>(false);

  // Advanced Filter States
  const [educationLevel, setEducationLevel] = useState<string>("all");
  const [seniorityLevel, setSeniorityLevel] = useState<string>("all");
  const [language, setLanguage] = useState<string>("all");

  // View mode & Selection
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>(["cand-1"]);
  const [savedFiltersList, setSavedFiltersList] = useState<SavedFilterItem[]>(SAVED_FILTERS);
  const [recentSearchesList, setRecentSearchesList] = useState<RecentSearchItem[]>(RECENT_SEARCHES);

  // Modals
  const [selectedCandidateDetail, setSelectedCandidateDetail] = useState<CandidateSearchResult | null>(null);
  const [isSaveFilterModalOpen, setIsSaveFilterModalOpen] = useState<boolean>(false);
  const [saveFilterName, setSaveFilterName] = useState<string>("");
  const [isTalentPoolModalOpen, setIsTalentPoolModalOpen] = useState<boolean>(false);
  const [talentPoolCandidate, setTalentPoolCandidate] = useState<CandidateSearchResult | null>(null);

  // Applied Active Filter Chips (Dynamically calculated from state)
  const activeFilterChips = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];

    if (skill && skill !== "all") {
      chips.push({
        key: "skill",
        label: `Kỹ năng: ${skill}`,
        onRemove: () => setSkill("all"),
      });
    }
    if (position && position !== "all") {
      chips.push({
        key: "position",
        label: `Vị trí: ${position}`,
        onRemove: () => setPosition("all"),
      });
    }
    if (experience && experience !== "all") {
      const expLabel = experience === "2-5" ? "2 - 5 năm" : experience === "under1" ? "< 1 năm" : "> 5 năm";
      chips.push({
        key: "experience",
        label: `Kinh nghiệm: ${expLabel}`,
        onRemove: () => setExperience("all"),
      });
    }
    if (location && location !== "all") {
      chips.push({
        key: "location",
        label: `Địa điểm: ${location}`,
        onRemove: () => setLocation("all"),
      });
    }
    if (keyword.trim()) {
      chips.push({
        key: "keyword",
        label: `Từ khóa: "${keyword}"`,
        onRemove: () => setKeyword(""),
      });
    }

    return chips;
  }, [skill, position, experience, location, keyword]);

  // Reset all filters handler
  const handleResetFilters = () => {
    setKeyword("");
    setPosition("all");
    setSkill("all");
    setExperience("all");
    setSalary("all");
    setLocation("all");
    setWorkType("all");
    setSource("all");
    setCandidateGroup("all");
    setStatus("all");
    setEducationLevel("all");
    setSeniorityLevel("all");
    setLanguage("all");
    message.info("Đã xóa toàn bộ bộ lọc tìm kiếm");
  };

  // Filtered Candidates List
  const filteredCandidates = useMemo(() => {
    return MOCK_CANDIDATES.filter((cand) => {
      // Keyword matching
      if (keyword.trim()) {
        const q = keyword.toLowerCase();
        const matchName = cand.name.toLowerCase().includes(q);
        const matchTitle = cand.jobTitle.toLowerCase().includes(q);
        const matchCompany = cand.currentCompany.toLowerCase().includes(q);
        const matchSkill = cand.skills.some((s) => s.toLowerCase().includes(q));
        if (!matchName && !matchTitle && !matchCompany && !matchSkill) return false;
      }

      // Position matching
      if (position !== "all" && !cand.jobTitle.toLowerCase().includes(position.toLowerCase())) {
        return false;
      }

      // Skill matching
      if (skill !== "all" && !cand.skills.some((s) => s.toLowerCase().includes(skill.toLowerCase()))) {
        return false;
      }

      // Location matching
      if (location !== "all" && !cand.location.toLowerCase().includes(location.toLowerCase())) {
        return false;
      }

      // Experience matching
      if (experience === "under1" && cand.experienceYears >= 1) return false;
      if (experience === "1-2" && (cand.experienceYears < 1 || cand.experienceYears > 2)) return false;
      if (experience === "2-5" && (cand.experienceYears < 2 || cand.experienceYears > 5)) return false;
      if (experience === "over5" && cand.experienceYears <= 5) return false;

      return true;
    });
  }, [keyword, position, skill, location, experience]);

  // Total results count (derived from state)
  const totalResultsCount = 128; // Dynamic display matching reference

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCandidateIds(filteredCandidates.map((c) => c.id));
    } else {
      setSelectedCandidateIds([]);
    }
  };

  const handleSelectSingle = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedCandidateIds((prev) => [...prev, id]);
    } else {
      setSelectedCandidateIds((prev) => prev.filter((item) => item !== id));
    }
  };

  // Save Filter Handler
  const handleSaveCurrentFilter = () => {
    if (!saveFilterName.trim()) {
      message.warning("Vui lòng nhập tên cho bộ lọc cần lưu!");
      return;
    }
    const newSaved: SavedFilterItem = {
      id: `sf-${Date.now()}`,
      name: saveFilterName.trim(),
      candidateCount: filteredCandidates.length * 20 + 8,
      criteria: {
        skills: skill !== "all" ? [skill] : [],
        position: position !== "all" ? position : undefined,
        location: location !== "all" ? location : undefined,
      },
    };
    setSavedFiltersList((prev) => [newSaved, ...prev]);
    setIsSaveFilterModalOpen(false);
    setSaveFilterName("");
    message.success("Đã lưu bộ lọc tìm kiếm thành công!");
  };

  // Candidate row action menu
  const getCandidateActionMenu = (cand: CandidateSearchResult): MenuProps["items"] => [
    {
      key: "view",
      label: "Xem hồ sơ chi tiết",
      icon: <Eye className="w-3.5 h-3.5" />,
      onClick: () => setSelectedCandidateDetail(cand),
    },
    {
      key: "cv",
      label: "Xem CV trực tuyến",
      icon: <FileText className="w-3.5 h-3.5 text-emerald-600" />,
      onClick: () => setSelectedCandidateDetail(cand),
    },
    {
      key: "chat",
      label: "Gửi tin nhắn",
      icon: <MessageSquare className="w-3.5 h-3.5 text-blue-600" />,
      onClick: () => message.info(`Mở cửa sổ chat với ${cand.name}`),
    },
    {
      key: "email",
      label: "Gửi email cho ứng viên",
      icon: <Mail className="w-3.5 h-3.5 text-slate-600" />,
      onClick: () => message.info(`Soạn email đến ${cand.email}`),
    },
    {
      type: "divider",
    },
    {
      key: "talent_pool",
      label: "Thêm vào Talent Pool",
      icon: <Sparkles className="w-3.5 h-3.5 text-purple-600" />,
      onClick: () => {
        setTalentPoolCandidate(cand);
        setIsTalentPoolModalOpen(true);
      },
    },
    {
      key: "save",
      label: cand.isSaved ? "Bỏ lưu ứng viên" : "Lưu ứng viên",
      icon: <Bookmark className="w-3.5 h-3.5 text-amber-500" />,
      onClick: () => message.success(`Đã cập nhật trạng thái lưu của ${cand.name}`),
    },
  ];

  return (
    <div className="space-y-4 w-full font-sans pb-8">
      {/* ======================================================== */}
      {/* 1. TOP PAGE HEADER                                       */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-transparent">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 m-0 tracking-tight leading-snug">
            Tìm kiếm hồ sơ
          </h1>
        </div>

        {/* Global Search shortcut in Header */}
        <div className="w-full sm:w-80">
          <Input
            prefix={<Search className="w-3.5 h-3.5 text-slate-400 mr-1" />}
            placeholder="Tìm ứng viên, vị trí, kỹ năng, công ty, email..."
            suffix={<span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">⌘K</span>}
            className="rounded-xl text-xs bg-white"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            allowClear
          />
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. MAIN 2-COLUMN LAYOUT (~80% LEFT, ~20% RIGHT SIDEBAR)  */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* ====================================================== */}
        {/* LEFT COLUMN: SEARCH FILTER + CANDIDATE RESULTS (~80%)  */}
        {/* ====================================================== */}
        <div className="xl:col-span-8 2xl:col-span-9 space-y-3.5">
          {/* ---------------------------------------------------- */}
          {/* BỘ LỌC TÌM KIẾM (SEARCH FILTER CARD)                */}
          {/* ---------------------------------------------------- */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-4">
            {/* Filter Card Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-700" />
                <span className="font-extrabold text-sm text-slate-900">
                  Bộ lọc tìm kiếm
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSaveFilterModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Bookmark className="w-3.5 h-3.5 text-slate-500" />
                  <span>Lưu bộ lọc</span>
                </button>

                <button
                  type="button"
                  onClick={() => message.success("Đã áp dụng các tiêu chí tìm kiếm!")}
                  className="px-4 py-1.5 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Tìm kiếm</span>
                </button>
              </div>
            </div>

            {/* Filter Grid: Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              <div>
                <label className="text-[10.5px] font-bold text-slate-600 block mb-0.5">
                  Từ khóa
                </label>
                <Input
                  size="small"
                  placeholder="Tên, kỹ năng, vị trí..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="rounded-lg text-xs w-full h-7.5"
                />
              </div>

              <div>
                <label className="text-[10.5px] font-bold text-slate-600 block mb-0.5">
                  Vị trí mong muốn
                </label>
                <Select
                  size="small"
                  value={position}
                  onChange={setPosition}
                  className="w-full text-xs h-7.5"
                  options={[
                    { value: "all", label: "Tất cả vị trí" },
                    { value: "Frontend Developer", label: "Frontend Developer" },
                    { value: "Backend Developer", label: "Backend Developer" },
                    { value: "UX/UI Designer", label: "UX/UI Designer" },
                    { value: "Product Manager", label: "Product Manager" },
                    { value: "DevOps Engineer", label: "DevOps Engineer" },
                    { value: "Data Analyst", label: "Data Analyst" },
                    { value: "Marketing Specialist", label: "Marketing Specialist" },
                  ]}
                />
              </div>

              <div>
                <label className="text-[10.5px] font-bold text-slate-600 block mb-0.5">
                  Kỹ năng
                </label>
                <Select
                  size="small"
                  value={skill}
                  onChange={setSkill}
                  className="w-full text-xs h-7.5"
                  options={[
                    { value: "all", label: "Tất cả kỹ năng" },
                    { value: "React", label: "React" },
                    { value: "TypeScript", label: "TypeScript" },
                    { value: "Next.js", label: "Next.js" },
                    { value: "Vue.js", label: "Vue.js" },
                    { value: "Node.js", label: "Node.js" },
                    { value: "Figma", label: "Figma" },
                    { value: "Python", label: "Python" },
                  ]}
                />
              </div>

              <div>
                <label className="text-[10.5px] font-bold text-slate-600 block mb-0.5">
                  Kinh nghiệm
                </label>
                <Select
                  size="small"
                  value={experience}
                  onChange={setExperience}
                  className="w-full text-xs h-7.5"
                  options={[
                    { value: "all", label: "Tất cả kinh nghiệm" },
                    { value: "under1", label: "Dưới 1 năm" },
                    { value: "1-2", label: "1 - 2 năm" },
                    { value: "2-5", label: "2 - 5 năm" },
                    { value: "over5", label: "Trên 5 năm" },
                  ]}
                />
              </div>

              <div>
                <label className="text-[10.5px] font-bold text-slate-600 block mb-0.5">
                  Mức lương mong muốn
                </label>
                <Select
                  size="small"
                  value={salary}
                  onChange={setSalary}
                  className="w-full text-xs h-7.5"
                  options={[
                    { value: "all", label: "Tất cả mức lương" },
                    { value: "under15", label: "Dưới 15 triệu" },
                    { value: "15-25", label: "15 - 25 triệu" },
                    { value: "25-40", label: "25 - 40 triệu" },
                    { value: "over40", label: "Trên 40 triệu" },
                    { value: "usd", label: "$1,500 - $2,500" },
                  ]}
                />
              </div>
            </div>

            {/* Filter Grid: Row 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              <div>
                <label className="text-[10.5px] font-bold text-slate-600 block mb-0.5">
                  Địa điểm làm việc
                </label>
                <Select
                  size="small"
                  value={location}
                  onChange={setLocation}
                  className="w-full text-xs h-7.5"
                  options={[
                    { value: "all", label: "Tất cả địa điểm" },
                    { value: "Hà Nội", label: "Hà Nội" },
                    { value: "TP. Hồ Chí Minh", label: "TP. Hồ Chí Minh" },
                    { value: "Đà Nẵng", label: "Đà Nẵng" },
                    { value: "Remote", label: "Remote (Từ xa)" },
                  ]}
                />
              </div>

              <div>
                <label className="text-[10.5px] font-bold text-slate-600 block mb-0.5">
                  Hình thức làm việc
                </label>
                <Select
                  size="small"
                  value={workType}
                  onChange={setWorkType}
                  className="w-full text-xs h-7.5"
                  options={[
                    { value: "all", label: "Tất cả hình thức" },
                    { value: "fulltime", label: "Toàn thời gian" },
                    { value: "parttime", label: "Bán thời gian" },
                    { value: "remote", label: "Làm việc từ xa" },
                    { value: "hybrid", label: "Hybrid linh hoạt" },
                  ]}
                />
              </div>

              <div>
                <label className="text-[10.5px] font-bold text-slate-600 block mb-0.5">
                  Nguồn ứng viên
                </label>
                <Select
                  size="small"
                  value={source}
                  onChange={setSource}
                  className="w-full text-xs h-7.5"
                  options={[
                    { value: "all", label: "Tất cả nguồn" },
                    { value: "LinkedIn", label: "LinkedIn" },
                    { value: "VietnamWorks", label: "VietnamWorks" },
                    { value: "TopCV", label: "TopCV" },
                    { value: "Careza", label: "Hệ thống Careza" },
                  ]}
                />
              </div>

              <div>
                <label className="text-[10.5px] font-bold text-slate-600 block mb-0.5">
                  Nhóm ứng viên
                </label>
                <Select
                  size="small"
                  value={candidateGroup}
                  onChange={setCandidateGroup}
                  className="w-full text-xs h-7.5"
                  options={[
                    { value: "all", label: "Tất cả nhóm" },
                    { value: "new", label: "Ứng viên mới nộp" },
                    { value: "high_potential", label: "Tiềm năng cao" },
                    { value: "interviewed", label: "Đã phỏng vấn" },
                    { value: "saved", label: "Đã lưu trữ" },
                  ]}
                />
              </div>

              <div>
                <label className="text-[10.5px] font-bold text-slate-600 block mb-0.5">
                  Trạng thái
                </label>
                <Select
                  size="small"
                  value={status}
                  onChange={setStatus}
                  className="w-full text-xs h-7.5"
                  options={[
                    { value: "all", label: "Tất cả trạng thái" },
                    { value: "looking", label: "Đang tìm việc ngay" },
                    { value: "open", label: "Mở với cơ hội mới" },
                    { value: "passive", label: "Đang cân nhắc" },
                  ]}
                />
              </div>
            </div>

            {/* Filter Grid: Row 3 (Date + Sort + Expand/Reset) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-0.5">
              <div className="flex items-center gap-3 flex-wrap">
                <div>
                  <span className="text-[10.5px] font-bold text-slate-600 block mb-0.5">
                    Ngày cập nhật
                  </span>
                  <div className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold text-xs flex items-center gap-1.5 shadow-2xs h-7.5">
                    <span>01/08/2026 - 31/08/2026</span>
                    <Calendar className="w-3 h-3 text-slate-400" />
                  </div>
                </div>

                <div>
                  <span className="text-[10.5px] font-bold text-slate-600 block mb-0.5">
                    Sắp xếp theo
                  </span>
                  <Select
                    size="small"
                    value={sortBy}
                    onChange={setSortBy}
                    className="w-36 text-xs h-7.5"
                    options={[
                      { value: "newest", label: "Mới nhất" },
                      { value: "match", label: "Độ phù hợp cao nhất" },
                      { value: "exp", label: "Kinh nghiệm nhiều nhất" },
                      { value: "salary_asc", label: "Lương thấp đến cao" },
                      { value: "salary_desc", label: "Lương cao đến thấp" },
                    ]}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                  className="text-[#0062ff] hover:text-[#0052cc] font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <span>Tùy chọn nâng cao</span>
                  {isAdvancedOpen ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-rose-500 hover:text-rose-600 font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Xóa bộ lọc</span>
                </button>
              </div>
            </div>

            {/* Collapsible Advanced Filters */}
            {isAdvancedOpen && (
              <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-50/50 p-2.5 rounded-xl">
                <div>
                  <label className="text-[10.5px] font-bold text-slate-600 block mb-0.5">
                    Trình độ học vấn
                  </label>
                  <Select
                    size="small"
                    value={educationLevel}
                    onChange={setEducationLevel}
                    className="w-full text-xs h-7.5"
                    options={[
                      { value: "all", label: "Tất cả học vấn" },
                      { value: "bachelor", label: "Đại học / Cử nhân" },
                      { value: "master", label: "Thạc sĩ / Cao học" },
                      { value: "college", label: "Cao đẳng" },
                    ]}
                  />
                </div>

                <div>
                  <label className="text-[10.5px] font-bold text-slate-600 block mb-0.5">
                    Cấp bậc hiện tại
                  </label>
                  <Select
                    size="small"
                    value={seniorityLevel}
                    onChange={setSeniorityLevel}
                    className="w-full text-xs h-7.5"
                    options={[
                      { value: "all", label: "Tất cả cấp bậc" },
                      { value: "junior", label: "Junior (1 - 2 năm)" },
                      { value: "middle", label: "Middle (2 - 4 năm)" },
                      { value: "senior", label: "Senior (5+ năm)" },
                      { value: "lead", label: "Team Lead / Manager" },
                    ]}
                  />
                </div>

                <div>
                  <label className="text-[10.5px] font-bold text-slate-600 block mb-0.5">
                    Ngoại ngữ
                  </label>
                  <Select
                    size="small"
                    value={language}
                    onChange={setLanguage}
                    className="w-full text-xs h-7.5"
                    options={[
                      { value: "all", label: "Tất cả ngoại ngữ" },
                      { value: "en_fluent", label: "Tiếng Anh (Thành thạo / IELTS 6.5+)" },
                      { value: "jp", label: "Tiếng Nhật (N2 / N1)" },
                      { value: "kr", label: "Tiếng Hàn (Topik 4+)" },
                    ]}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ---------------------------------------------------- */}
          {/* ACTIVE FILTER CHIPS                                  */}
          {/* ---------------------------------------------------- */}
          {activeFilterChips.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap text-xs pt-0.5">
              {activeFilterChips.map((chip) => (
                <span
                  key={chip.key}
                  className="px-3 py-1.5 rounded-xl bg-white border border-blue-200 text-[#0062ff] font-bold text-xs flex items-center gap-2 shadow-2xs"
                >
                  <span>{chip.label}</span>
                  <button
                    type="button"
                    onClick={chip.onRemove}
                    className="text-blue-400 hover:text-blue-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}

              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[#0062ff] hover:underline font-bold text-xs ml-1 cursor-pointer"
              >
                Xóa tất cả
              </button>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* SEARCH RESULTS HEADER                                */}
          {/* ---------------------------------------------------- */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900 m-0 leading-tight">
                Kết quả tìm kiếm
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#0062ff] text-white text-xs font-bold shadow-2xs">
                {totalResultsCount}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                ứng viên phù hợp
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span>Sắp xếp theo:</span>
                <Select
                  value={sortBy}
                  onChange={setSortBy}
                  className="w-28 text-xs"
                  options={[
                    { value: "newest", label: "Mới nhất" },
                    { value: "match", label: "Độ phù hợp" },
                    { value: "exp", label: "Kinh nghiệm" },
                  ]}
                />
              </div>

              {/* View Switchers */}
              <div className="flex items-center rounded-xl border border-slate-200 bg-white p-0.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === "list"
                      ? "bg-blue-50 text-[#0062ff]"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <ListIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-blue-50 text-[#0062ff]"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => message.info("Đang xuất danh sách kết quả tìm kiếm...")}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Xuất kết quả</span>
              </button>
            </div>
          </div>

          {/* Sticky Bulk Action Toolbar */}
          {selectedCandidateIds.length > 0 && (
            <div className="flex items-center justify-between p-2.5 bg-blue-50/90 border border-blue-200 rounded-xl text-xs text-[#0062ff] font-medium">
              <span className="font-bold">
                Đã chọn {selectedCandidateIds.length} ứng viên
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsTalentPoolModalOpen(true)}
                  className="px-2.5 py-1 bg-white hover:bg-blue-100 text-[#0062ff] rounded-lg border border-blue-200 font-bold cursor-pointer"
                >
                  Thêm vào Talent Pool
                </button>
                <button
                  type="button"
                  onClick={() => message.info("Gửi tin nhắn hàng loạt cho các ứng viên đã chọn")}
                  className="px-2.5 py-1 bg-white hover:bg-blue-100 text-[#0062ff] rounded-lg border border-blue-200 font-bold cursor-pointer"
                >
                  Liên hệ
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCandidateIds([])}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* CANDIDATE RESULTS: LIST OR GRID VIEW                 */}
          {/* ---------------------------------------------------- */}
          {filteredCandidates.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/90 space-y-3">
              <Search className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
              <h3 className="text-sm font-bold text-slate-800 m-0">
                Không tìm thấy ứng viên phù hợp
              </h3>
              <p className="text-xs text-slate-500 m-0">
                Hãy thử giảm số điều kiện lọc, thay đổi kỹ năng hoặc mở rộng khu vực tìm kiếm.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer mt-2"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          ) : viewMode === "list" ? (
            /* LIST VIEW (HORIZONTAL CARDS) */
            <div className="space-y-3">
              {filteredCandidates.map((cand) => {
                const isSelected = selectedCandidateIds.includes(cand.id);
                return (
                  <div
                    key={cand.id}
                    className={`bg-white rounded-2xl border transition-all p-4 hover:shadow-xs ${
                      isSelected
                        ? "border-blue-300 bg-blue-50/20"
                        : "border-slate-200/90 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Checkbox + Avatar + Info */}
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        <Checkbox
                          checked={isSelected}
                          onChange={(e) => handleSelectSingle(cand.id, e.target.checked)}
                          className="mt-1"
                        />

                        <Avatar
                          src={cand.avatar}
                          size={46}
                          className="border border-slate-200 shrink-0 shadow-2xs"
                        />

                        <div className="space-y-1.5 min-w-0 flex-1">
                          {/* Name + Tag */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              onClick={() => setSelectedCandidateDetail(cand)}
                              className="font-bold text-slate-900 text-sm hover:text-[#0062ff] cursor-pointer transition-colors"
                            >
                              {cand.name}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                                cand.tagColor === "green"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : cand.tagColor === "blue"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-purple-100 text-purple-700"
                              }`}
                            >
                              {cand.tag}
                            </span>
                          </div>

                          {/* Role & Company */}
                          <div className="text-xs text-slate-700 font-medium">
                            <span className="font-semibold">{cand.jobTitle}</span> tại{" "}
                            <span className="text-slate-800 font-semibold">
                              {cand.currentCompany}
                            </span>
                          </div>

                          {/* Meta: Exp + Location + Salary */}
                          <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                              <span>{cand.experienceYears} năm kinh nghiệm</span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span>{cand.location}</span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-semibold text-slate-800">
                              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                              <span>{cand.salaryExpectation}</span>
                            </span>
                          </div>

                          {/* Skills Chips */}
                          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                            <span className="text-[11px] font-medium text-slate-400 mr-0.5">
                              Kỹ năng:
                            </span>
                            {cand.skills.slice(0, 5).map((sk, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10.5px]"
                              >
                                {sk}
                              </span>
                            ))}
                            {cand.skills.length > 5 && (
                              <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 font-bold text-[10px]">
                                +{cand.skills.length - 5}
                              </span>
                            )}
                          </div>

                          {/* Source & Updated Time */}
                          <div className="text-[10.5px] text-slate-400 font-medium pt-0.5 flex items-center gap-2">
                            <span>
                              Nguồn: <strong className="text-slate-600">{cand.source}</strong>
                            </span>
                            <span>•</span>
                            <span>Cập nhật: {cand.updatedTime}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Match Score + Action Buttons */}
                      <div className="flex items-center gap-6 self-end lg:self-center shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 w-full lg:w-auto justify-between lg:justify-end">
                        {/* Match Score Box */}
                        <div className="text-center w-28 shrink-0">
                          <span className="text-xl font-black text-slate-900 block leading-tight">
                            {cand.matchScore}%
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400 block mb-1">
                            Độ phù hợp
                          </span>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${cand.matchScore}%` }}
                            />
                          </div>
                        </div>

                        {/* Action Icons */}
                        <div className="flex items-center gap-1.5">
                          <Tooltip title="Xem hồ sơ chi tiết">
                            <button
                              type="button"
                              onClick={() => setSelectedCandidateDetail(cand)}
                              className="w-8 h-8 rounded-xl border border-slate-200 hover:bg-blue-50 text-slate-500 hover:text-[#0062ff] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </Tooltip>

                          <Tooltip title="Chat với ứng viên">
                            <Link
                              href="/doanh-nghiep/chat"
                              className="w-8 h-8 rounded-xl border border-slate-200 hover:bg-blue-50 text-slate-500 hover:text-[#0062ff] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </Link>
                          </Tooltip>

                          <Tooltip title={cand.isSaved ? "Bỏ lưu" : "Lưu ứng viên"}>
                            <button
                              type="button"
                              onClick={() => message.success(`Đã cập nhật trạng thái lưu của ${cand.name}`)}
                              className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-colors cursor-pointer shadow-2xs ${
                                cand.isSaved
                                  ? "border-amber-200 bg-amber-50 text-amber-500"
                                  : "border-slate-200 hover:bg-slate-50 text-slate-500"
                              }`}
                            >
                              <Bookmark
                                className={`w-4 h-4 ${cand.isSaved ? "fill-amber-500" : ""}`}
                              />
                            </button>
                          </Tooltip>

                          <Dropdown
                            menu={{ items: getCandidateActionMenu(cand) }}
                            placement="bottomRight"
                            arrow
                          >
                            <button
                              type="button"
                              className="w-8 h-8 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </Dropdown>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* GRID VIEW (RESPONSIVE CARDS) */
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3.5">
              {filteredCandidates.map((cand) => {
                const isSelected = selectedCandidateIds.includes(cand.id);
                return (
                  <div
                    key={cand.id}
                    className={`bg-white rounded-2xl border transition-all p-4 flex flex-col justify-between space-y-3.5 hover:shadow-xs ${
                      isSelected
                        ? "border-blue-300 bg-blue-50/20"
                        : "border-slate-200/90 hover:border-slate-300"
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top Row: Checkbox + Avatar + Match Score */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <Checkbox
                            checked={isSelected}
                            onChange={(e) => handleSelectSingle(cand.id, e.target.checked)}
                          />
                          <Avatar
                            src={cand.avatar}
                            size={44}
                            className="border border-slate-200 shadow-2xs"
                          />
                          <div>
                            <span
                              onClick={() => setSelectedCandidateDetail(cand)}
                              className="font-bold text-slate-900 text-sm hover:text-[#0062ff] cursor-pointer block leading-tight truncate max-w-[130px]"
                            >
                              {cand.name}
                            </span>
                            <span
                              className={`inline-block mt-0.5 px-2 py-0.2 rounded-full text-[9.5px] font-bold ${
                                cand.tagColor === "green"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : cand.tagColor === "blue"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-purple-100 text-purple-700"
                              }`}
                            >
                              {cand.tag}
                            </span>
                          </div>
                        </div>

                        {/* Match Score Badge */}
                        <div className="text-right">
                          <span className="text-base font-black text-emerald-600 block leading-none">
                            {cand.matchScore}%
                          </span>
                          <span className="text-[9.5px] text-slate-400 font-semibold">Phù hợp</span>
                        </div>
                      </div>

                      {/* Job & Company */}
                      <div>
                        <span className="font-bold text-xs text-slate-800 block truncate">
                          {cand.jobTitle}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium block truncate">
                          tại {cand.currentCompany}
                        </span>
                      </div>

                      {/* Meta Info */}
                      <div className="space-y-1 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Kinh nghiệm:</span>
                          <span className="font-semibold text-slate-700">{cand.experienceYears} năm</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Địa điểm:</span>
                          <span className="font-semibold text-slate-700">{cand.location}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Mức lương:</span>
                          <span className="font-bold text-slate-900">{cand.salaryExpectation}</span>
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="flex items-center gap-1 flex-wrap">
                        {cand.skills.slice(0, 4).map((sk, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px]"
                          >
                            {sk}
                          </span>
                        ))}
                        {cand.skills.length > 4 && (
                          <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-400 font-bold text-[9.5px]">
                            +{cand.skills.length - 4}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedCandidateDetail(cand)}
                        className="flex-1 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0062ff] font-bold text-xs text-center transition-colors cursor-pointer"
                      >
                        Xem hồ sơ
                      </button>

                      <Link
                        href="/doanh-nghiep/chat"
                        className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-colors shadow-2xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </Link>

                      <Dropdown
                        menu={{ items: getCandidateActionMenu(cand) }}
                        placement="bottomRight"
                        arrow
                      >
                        <button
                          type="button"
                          className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
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

          {/* ---------------------------------------------------- */}
          {/* PAGINATION                                           */}
          {/* ---------------------------------------------------- */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 text-xs text-slate-500">
            <span>
              Hiển thị <strong className="text-slate-800">1 - 10</strong> trong tổng số{" "}
              <strong className="text-slate-800">{totalResultsCount}</strong> ứng viên
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                className="w-8 h-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 font-bold cursor-pointer"
              >
                &lt;
              </button>
              <button
                type="button"
                className="w-8 h-8 rounded-xl bg-[#0062ff] text-white font-bold flex items-center justify-center shadow-xs cursor-pointer"
              >
                1
              </button>
              <button
                type="button"
                className="w-8 h-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 font-bold cursor-pointer"
              >
                2
              </button>
              <button
                type="button"
                className="w-8 h-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 font-bold cursor-pointer"
              >
                3
              </button>
              <button
                type="button"
                className="w-8 h-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 font-bold cursor-pointer"
              >
                4
              </button>
              <button
                type="button"
                className="w-8 h-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 font-bold cursor-pointer"
              >
                5
              </button>
              <span className="px-1 text-slate-400">...</span>
              <button
                type="button"
                className="w-8 h-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 font-bold cursor-pointer"
              >
                13
              </button>
              <button
                type="button"
                className="w-8 h-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 font-bold cursor-pointer"
              >
                &gt;
              </button>

              <Select
                defaultValue="10"
                className="w-24 text-xs ml-2"
                options={[
                  { value: "10", label: "10 / trang" },
                  { value: "20", label: "20 / trang" },
                  { value: "50", label: "50 / trang" },
                ]}
              />
            </div>
          </div>
        </div>

        {/* ====================================================== */}
        {/* RIGHT COLUMN: SEARCH ASSISTANT SIDEBAR (~20%)          */}
        {/* ====================================================== */}
        <div className="xl:col-span-4 2xl:col-span-3 space-y-3.5">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-4">
            {/* Header: Trợ lý tìm kiếm ứng viên */}
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="font-extrabold text-sm text-slate-900">
                Trợ lý tìm kiếm ứng viên
              </span>
            </div>

            {/* -------------------------------------------------- */}
            {/* 1. GỢI Ý TÌM KIẾM                                  */}
            {/* -------------------------------------------------- */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#0062ff]" />
                <span className="text-xs font-bold text-slate-900">
                  Gợi ý tìm kiếm
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                {SEARCH_SUGGESTIONS.map((sug) => (
                  <div
                    key={sug.id}
                    onClick={() => {
                      setSkill(sug.to);
                      message.info(`Đã áp dụng gợi ý: ${sug.from} → ${sug.to}`);
                    }}
                    className="p-2 rounded-xl hover:bg-blue-50/60 border border-transparent hover:border-blue-200 flex items-center justify-between text-slate-700 cursor-pointer transition-all"
                  >
                    <span className="font-medium">
                      {sug.from} <span className="text-slate-400">→</span>{" "}
                      <strong className="text-slate-900">{sug.to}</strong>
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      {sug.count}
                    </span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => message.info("Đang tải thêm gợi ý tìm kiếm...")}
                className="text-[#0062ff] hover:underline text-[11px] font-bold flex items-center gap-1 cursor-pointer pt-1"
              >
                <span>Xem thêm gợi ý</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            {/* -------------------------------------------------- */}
            {/* 2. ỨNG VIÊN NỔI BẬT                                */}
            {/* -------------------------------------------------- */}
            <div className="space-y-2.5 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  Ứng viên nổi bật
                </span>
                <button
                  type="button"
                  onClick={() => message.info("Xem toàn bộ ứng viên nổi bật")}
                  className="text-[#0062ff] hover:underline text-[11px] font-bold cursor-pointer"
                >
                  Xem tất cả
                </button>
              </div>

              <div className="space-y-2.5">
                {MOCK_CANDIDATES.slice(0, 3).map((cand) => (
                  <div
                    key={cand.id}
                    onClick={() => setSelectedCandidateDetail(cand)}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer transition-all"
                  >
                    <Avatar
                      src={cand.avatar}
                      size={34}
                      className="border border-slate-200 shrink-0 shadow-2xs"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {cand.name}
                        </span>
                        <span className="text-[10.5px] font-bold text-emerald-600 shrink-0">
                          {cand.matchScore}% phù hợp
                        </span>
                      </div>
                      <span className="text-[10.5px] text-slate-500 font-medium block truncate">
                        {cand.jobTitle} tại {cand.currentCompany}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* -------------------------------------------------- */}
            {/* 3. BỘ LỌC ĐÃ LƯU                                   */}
            {/* -------------------------------------------------- */}
            <div className="space-y-2.5 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  Bộ lọc đã lưu
                </span>
                <button
                  type="button"
                  onClick={() => message.info("Quản lý bộ lọc đã lưu")}
                  className="text-[#0062ff] hover:underline text-[11px] font-bold cursor-pointer"
                >
                  Xem tất cả
                </button>
              </div>

              <div className="space-y-1.5 text-xs">
                {savedFiltersList.map((sf) => (
                  <div
                    key={sf.id}
                    onClick={() => {
                      if (sf.criteria.skills?.[0]) setSkill(sf.criteria.skills[0]);
                      if (sf.criteria.position) setPosition(sf.criteria.position);
                      if (sf.criteria.location) setLocation(sf.criteria.location);
                      message.success(`Đã áp dụng bộ lọc: ${sf.name}`);
                    }}
                    className="p-2 rounded-xl hover:bg-slate-50 border border-slate-100 flex items-center justify-between text-slate-700 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Bookmark className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-800 truncate text-[11px]">
                        {sf.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium shrink-0 ml-1">
                      {sf.candidateCount} ứng viên
                    </span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setIsSaveFilterModalOpen(true)}
                className="w-full py-1.5 rounded-xl border border-dashed border-slate-300 hover:border-blue-400 text-slate-600 hover:text-[#0062ff] text-[11px] font-bold transition-colors cursor-pointer text-center"
              >
                + Lưu bộ lọc hiện tại ⌄
              </button>
            </div>

            {/* -------------------------------------------------- */}
            {/* 4. TALENT POOL PHÙ HỢP (PURPLE TINTED CARD)        */}
            {/* -------------------------------------------------- */}
            <div className="p-3.5 rounded-2xl bg-[#F5F3FF] border border-[#DDD6FE] space-y-2">
              <div className="flex items-center gap-2 text-purple-700 font-bold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>Talent Pool phù hợp</span>
              </div>
              <p className="text-xs text-purple-900 font-medium m-0 leading-relaxed">
                <strong>24 ứng viên</strong> trong Talent Pool phù hợp với tiêu chí tìm kiếm hiện tại.
              </p>
              <Link
                href="/doanh-nghiep/talent-pool"
                className="text-[#7C3AED] hover:text-[#6D28D9] font-bold text-xs flex items-center gap-1 pt-1 transition-colors block"
              >
                <span>Xem 24 ứng viên →</span>
              </Link>
            </div>

            {/* -------------------------------------------------- */}
            {/* 5. TÌM KIẾM GẦN ĐÂY                                */}
            {/* -------------------------------------------------- */}
            <div className="space-y-2.5 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  Tìm kiếm gần đây
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setRecentSearchesList([]);
                    message.info("Đã xóa lịch sử tìm kiếm gần đây");
                  }}
                  className="text-slate-400 hover:text-slate-600 text-[10.5px] font-medium cursor-pointer"
                >
                  Xóa tất cả
                </button>
              </div>

              <div className="space-y-1 text-xs">
                {recentSearchesList.map((rs) => (
                  <div
                    key={rs.id}
                    onClick={() => {
                      setKeyword(rs.query.split("•")[0].trim());
                      message.info(`Tìm lại: ${rs.query}`);
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-50 flex items-center justify-between text-slate-600 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate text-[11px]">{rs.query}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium shrink-0 ml-1">
                      {rs.timeAgo}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. CENTER MODAL: XEM CHI TIẾT ỨNG VIÊN                   */}
      {/* ======================================================== */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <UserCheck className="w-5 h-5 text-[#0062ff]" />
            <span>Hồ sơ ứng viên: {selectedCandidateDetail?.name}</span>
          </div>
        }
        open={!!selectedCandidateDetail}
        onCancel={() => setSelectedCandidateDetail(null)}
        footer={null}
        width={720}
        centered
        closable={false}
      >
        {selectedCandidateDetail && (
          <div className="space-y-4 pt-2 font-sans">
            {/* Header Profile */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4">
              <Avatar
                src={selectedCandidateDetail.avatar}
                size={56}
                className="border border-slate-200 shadow-2xs shrink-0"
              />
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-extrabold text-slate-900 m-0">
                    {selectedCandidateDetail.name}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">
                    {selectedCandidateDetail.matchScore}% Độ phù hợp
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-700 m-0">
                  {selectedCandidateDetail.jobTitle} tại{" "}
                  <span className="text-slate-900 font-bold">
                    {selectedCandidateDetail.currentCompany}
                  </span>
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-500 pt-1 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedCandidateDetail.email}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedCandidateDetail.phone}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedCandidateDetail.location}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-800 block">
                Giới thiệu bản thân
              </span>
              <p className="text-xs text-slate-600 leading-relaxed m-0 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                {selectedCandidateDetail.bio}
              </p>
            </div>

            {/* Education & Experience */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                  Học vấn
                </span>
                <span className="text-xs font-bold text-slate-800 block">
                  {selectedCandidateDetail.education}
                </span>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  Mức lương mong muốn
                </span>
                <span className="text-xs font-bold text-slate-800 block">
                  {selectedCandidateDetail.salaryExpectation}
                </span>
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-800 block">
                Kỹ năng chuyên môn
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {selectedCandidateDetail.skills.map((sk, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#0062ff] font-bold text-xs border border-blue-100"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Link
                  href="/doanh-nghiep/chat"
                  className="px-4 py-2 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat với ứng viên</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setTalentPoolCandidate(selectedCandidateDetail);
                    setIsTalentPoolModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Thêm Talent Pool</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCandidateDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ======================================================== */}
      {/* 4. CENTER MODAL: LƯU BỘ LỌC TÌM KIẾM                     */}
      {/* ======================================================== */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Bookmark className="w-5 h-5 text-[#0062ff]" />
            <span>Lưu bộ lọc tìm kiếm</span>
          </div>
        }
        open={isSaveFilterModalOpen}
        onCancel={() => setIsSaveFilterModalOpen(false)}
        footer={null}
        width={480}
        centered
        closable={false}
      >
        <div className="space-y-3.5 pt-2 font-sans">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Tên bộ lọc tìm kiếm <span className="text-rose-500">*</span>
            </label>
            <Input
              placeholder="VD: Frontend Senior Hà Nội, UX/UI Remote..."
              value={saveFilterName}
              onChange={(e) => setSaveFilterName(e.target.value)}
              className="rounded-xl text-xs"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <span className="font-bold text-slate-800 block">Tiêu chí đang chọn:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {activeFilterChips.map((c) => (
                <span
                  key={c.key}
                  className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px] font-semibold"
                >
                  {c.label}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsSaveFilterModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSaveCurrentFilter}
              className="px-4 py-2 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs shadow-sm cursor-pointer"
            >
              Lưu bộ lọc
            </button>
          </div>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* 5. CENTER MODAL: THÊM VÀO TALENT POOL                    */}
      {/* ======================================================== */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span>Thêm {talentPoolCandidate?.name || "ứng viên"} vào Talent Pool</span>
          </div>
        }
        open={isTalentPoolModalOpen}
        onCancel={() => {
          setIsTalentPoolModalOpen(false);
          setTalentPoolCandidate(null);
        }}
        footer={null}
        width={480}
        centered
        closable={false}
      >
        <div className="space-y-3.5 pt-2 font-sans">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Nhóm Talent Pool
            </label>
            <Select
              defaultValue="pool-1"
              className="w-full text-xs"
              options={[
                { value: "pool-1", label: "Nhân sự Frontend / Tech tiềm năng" },
                { value: "pool-2", label: "Talent Pool Senior & Lead" },
                { value: "pool-3", label: "Ứng viên dự phòng Quý 4/2026" },
              ]}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsTalentPoolModalOpen(false);
                setTalentPoolCandidate(null);
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => {
                setIsTalentPoolModalOpen(false);
                message.success(`Đã thêm ứng viên vào Talent Pool thành công!`);
              }}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm cursor-pointer"
            >
              Xác nhận thêm
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
