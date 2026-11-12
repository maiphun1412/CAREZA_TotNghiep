"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
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
  Spin,
  Alert,
  Empty,
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
import { employerService } from "@/services/employer.service";
import { aiService } from "@/services/ai.service";
import Link from "next/link";

export interface SearchSuggestionItem {
  id: string;
  from: string;
  to: string;
  count: number;
}

export interface SavedFilterItem {
  id: string;
  name: string;
  candidateCount: number;
  criteria: any;
}

export interface RecentSearchItem {
  id: string;
  query: string;
  timeAgo: string;
}

export interface CandidateSearchResult {
  id: string;
  candidateId?: string | number | null;
  cvId?: string | number | null;
  name: string;
  avatar: string;
  title?: string;
  jobTitle: string;
  currentCompany: string;
  rankPosition?: number | null;
  topsisScore?: number | null;
  matchScore: number | null;
  skillScore?: number | null;
  tfidfScore?: number | null;
  experienceScore?: number | null;
  matchedSkills?: string[];
  missingSkills?: string[];
  explanationSummary?: string;
  location: string;
  experienceYears: number | null;
  education: string;
  salaryExpectation: string;
  appliedDate?: string;
  skills: string[];
  bio: string;
  badges?: string[];
  cvUrl?: string;
  phone?: string;
  email?: string;
  tag?: string;
  tagColor?: string;
  source?: string;
  updatedTime?: string;
  isSaved?: boolean;
}

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
  const [position, setPosition] = useState<string>("all");
  const [skill, setSkill] = useState<string>("all");
  const [experience, setExperience] = useState<string>("all");
  const [salary, setSalary] = useState<string>("all");
  const [location, setLocation] = useState<string>("all");
  const [workType, setWorkType] = useState<string>("all");
  const [source, setSource] = useState<string>("all");
  const [candidateGroup, setCandidateGroup] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("topsis");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState<boolean>(false);

  // Advanced Filter States
  const [educationLevel, setEducationLevel] = useState<string>("all");
  const [seniorityLevel, setSeniorityLevel] = useState<string>("all");
  const [language, setLanguage] = useState<string>("all");

  // View mode & Selection
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [savedFiltersList, setSavedFiltersList] = useState<SavedFilterItem[]>(SAVED_FILTERS);
  const [recentSearchesList, setRecentSearchesList] = useState<RecentSearchItem[]>(RECENT_SEARCHES);

  // API Data States (Tin tuyển dụng thật của doanh nghiệp + Ứng viên TOPSIS)
  const [companyJobs, setCompanyJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | string>("");
  const [candidates, setCandidates] = useState<CandidateSearchResult[]>([]);
  const [pools, setPools] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPoolId, setSelectedPoolId] = useState<string | number>("");

  const formatCandidateSalary = (minSal?: number | null, maxSal?: number | null): string => {
    const sMin = Number(minSal || 0);
    const sMax = Number(maxSal || 0);
    if (sMin > 0 && sMax > 0) {
      return sMin >= 1_000_000
        ? `${Math.round(sMin / 1_000_000)} - ${Math.round(sMax / 1_000_000)} triệu`
        : `${sMin.toLocaleString("vi-VN")} - ${sMax.toLocaleString("vi-VN")} VNĐ`;
    }
    if (sMin > 0) {
      return sMin >= 1_000_000
        ? `Từ ${Math.round(sMin / 1_000_000)} triệu`
        : `Từ ${sMin.toLocaleString("vi-VN")} VNĐ`;
    }
    if (sMax > 0) {
      return sMax >= 1_000_000
        ? `Đến ${Math.round(sMax / 1_000_000)} triệu`
        : `Đến ${sMax.toLocaleString("vi-VN")} VNĐ`;
    }
    return "Chưa cập nhật";
  };

  const fetchRecommendationsForJob = useCallback(async (jobId: number | string) => {
    if (!jobId) {
      setCandidates([]);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const recRes = await aiService.getCandidateRecommendations(jobId, 30);
      const rawList =
        recRes?.data?.recommendations ||
        recRes?.data?.candidates ||
        [];

      if (Array.isArray(rawList)) {
        const mapped: CandidateSearchResult[] = rawList.map((item: any, idx: number) => {
          const cand = item.candidate || {};
          const expl = item.explanation || {};
          const breakdown = expl.breakdown || {};
          const rankPos = typeof item.rank_position === "number" ? item.rank_position : idx + 1;
          const topsisVal = typeof item.topsis_score === "number" ? item.topsis_score : null;
          const matchPct =
            typeof item.match_percentage === "number"
              ? item.match_percentage
              : typeof item.hybrid_score === "number"
              ? Math.round(item.hybrid_score * 1000) / 10
              : null;

          const expVal =
            typeof cand.experience_years === "number"
              ? cand.experience_years
              : typeof expl.candidate_experience_years === "number"
              ? expl.candidate_experience_years
              : null;

          const appStatus = cand.application_status;
          const tagLabel =
            appStatus === "hired"
              ? "Đã tuyển"
              : appStatus === "interview"
              ? "Vòng phỏng vấn"
              : appStatus
              ? "Đã ứng tuyển"
              : `Hạng #${rankPos} TOPSIS`;
          const tagClr =
            appStatus === "hired"
              ? "green"
              : appStatus === "interview"
              ? "blue"
              : "purple";

          const rawDate = cand.applied_at || cand.cv_created_at;
          const formattedDate = rawDate
            ? new Date(rawDate).toLocaleDateString("vi-VN")
            : "Chưa cập nhật";

          const skillsArr: string[] = Array.isArray(cand.skills)
            ? cand.skills
            : Array.isArray(expl.matched_skills)
            ? expl.matched_skills
            : [];

          return {
            id: String(cand.cv_id || cand.id || idx + 1),
            candidateId: cand.id ?? cand.user_id ?? cand.cv_id ?? null,
            cvId: cand.cv_id ?? null,
            name: cand.candidate_name || cand.full_name || "Ứng viên",
            avatar: cand.avatar_url || "",
            tag: tagLabel,
            tagColor: tagClr,
            title: cand.headline || cand.cv_title || "Chưa cập nhật chức danh",
            jobTitle: cand.headline || cand.cv_title || "Chưa cập nhật chức danh",
            currentCompany: cand.current_company || "Chưa cập nhật đơn vị",
            rankPosition: rankPos,
            topsisScore: topsisVal,
            matchScore: matchPct,
            skillScore:
              typeof item.skill_score === "number"
                ? item.skill_score
                : typeof breakdown.skill_score === "number"
                ? breakdown.skill_score
                : null,
            tfidfScore:
              typeof item.tfidf_cosine === "number"
                ? item.tfidf_cosine
                : typeof breakdown.tfidf_cosine === "number"
                ? breakdown.tfidf_cosine
                : null,
            experienceScore:
              typeof item.experience_score === "number"
                ? item.experience_score
                : typeof breakdown.experience_score === "number"
                ? breakdown.experience_score
                : null,
            matchedSkills: Array.isArray(expl.matched_skills) ? expl.matched_skills : [],
            missingSkills: Array.isArray(expl.missing_skills) ? expl.missing_skills : [],
            explanationSummary: expl.summary || "",
            experienceYears: expVal,
            location: cand.location || "Chưa cập nhật",
            salaryExpectation: formatCandidateSalary(cand.desired_salary_min, cand.desired_salary_max),
            skills: skillsArr,
            source: cand.application_id ? "Đã nộp đơn ứng tuyển" : "Cơ sở dữ liệu CV (TOPSIS)",
            updatedTime: formattedDate,
            appliedDate: formattedDate,
            email: cand.email || "Chưa cập nhật",
            phone: cand.phone || "Chưa cập nhật",
            education: cand.education || "Chưa cập nhật học vấn",
            bio: cand.bio || expl.summary || "Chưa có giới thiệu chi tiết.",
            cvUrl: cand.cv_file_url || undefined,
            badges: [],
            isSaved: false,
          };
        });
        setCandidates(mapped);
      } else {
        setCandidates([]);
      }
    } catch (err: any) {
      const errData = err?.response?.data;
      const errMsg =
        errData?.error ||
        errData?.detail ||
        errData?.message ||
        err?.message ||
        "Không thể tải danh sách xếp hạng ứng viên TOPSIS.";
      setError(typeof errMsg === "string" ? errMsg : "Không thể tải danh sách xếp hạng ứng viên.");
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [jobsRes, poolsRes] = await Promise.all([
        employerService.getJobs({ page_size: 50 }).catch((e) => {
          console.error("Lỗi lấy danh sách tin tuyển dụng:", e);
          return null;
        }),
        employerService.getTalentPools().catch((e) => {
          console.error("Lỗi lấy talent pools:", e);
          return null;
        }),
      ]);

      const poolList =
        (poolsRes as any)?.data?.talent_pools ||
        (poolsRes as any)?.data?.pools ||
        (poolsRes as any)?.talent_pools ||
        (poolsRes as any)?.pools ||
        [];
      setPools(poolList);
      if (poolList.length > 0) {
        setSelectedPoolId(poolList[0].id);
      }

      const jobItems =
        (jobsRes as any)?.data?.items ||
        (jobsRes as any)?.items ||
        [];
      setCompanyJobs(jobItems);

      if (jobItems.length > 0) {
        const firstJobId = jobItems[0].id;
        setSelectedJobId(firstJobId);
        await fetchRecommendationsForJob(firstJobId);
      } else {
        setCandidates([]);
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Lỗi nạp dữ liệu ban đầu:", err);
      setError(err?.message || "Không thể tải danh sách tin tuyển dụng của doanh nghiệp.");
      setLoading(false);
    }
  }, [fetchRecommendationsForJob]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleJobChange = (newJobId: number | string) => {
    setSelectedJobId(newJobId);
    setSelectedCandidateIds([]);
    fetchRecommendationsForJob(newJobId);
  };

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
    const res = candidates.filter((cand) => {
      // Keyword matching
      if (keyword.trim()) {
        const q = keyword.toLowerCase();
        const matchName = cand.name.toLowerCase().includes(q);
        const matchTitle = cand.jobTitle.toLowerCase().includes(q);
        const matchCompany = (cand.currentCompany || "").toLowerCase().includes(q);
        const matchSkill = (cand.skills || []).some((s: string) => s.toLowerCase().includes(q));
        if (!matchName && !matchTitle && !matchCompany && !matchSkill) return false;
      }

      // Position matching
      if (position !== "all" && !(cand.jobTitle || "").toLowerCase().includes(position.toLowerCase())) {
        return false;
      }

      // Skill matching
      if (skill !== "all" && !(cand.skills || []).some((s: string) => s.toLowerCase().includes(skill.toLowerCase()))) {
        return false;
      }

      // Location matching
      if (location !== "all" && !(cand.location || "").toLowerCase().includes(location.toLowerCase())) {
        return false;
      }

      // Experience matching
      const expY = cand.experienceYears ?? 0;
      if (experience === "under1" && expY >= 1) return false;
      if (experience === "1-2" && (expY < 1 || expY > 2)) return false;
      if (experience === "2-5" && (expY < 2 || expY > 5)) return false;
      if (experience === "over5" && expY <= 5) return false;

      return true;
    });

    if (sortBy === "topsis") {
      res.sort((a, b) => (b.topsisScore ?? 0) - (a.topsisScore ?? 0));
    } else if (sortBy === "match") {
      res.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
    } else if (sortBy === "exp") {
      res.sort((a, b) => (b.experienceYears ?? 0) - (a.experienceYears ?? 0));
    } else if (sortBy === "newest") {
      res.sort((a, b) => Number(b.id) - Number(a.id));
    }

    return res;
  }, [candidates, keyword, position, skill, location, experience, sortBy]);

  // Total results count (derived from state)
  const totalResultsCount = filteredCandidates.length;

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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-700" />
                <span className="font-extrabold text-sm text-slate-900">
                  Xếp hạng TOPSIS & Bộ lọc tìm kiếm ứng viên
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
                  onClick={() => {
                    if (selectedJobId) {
                      fetchRecommendationsForJob(selectedJobId);
                    } else {
                      fetchInitialData();
                    }
                  }}
                  className="px-4 py-1.5 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Chạy xếp hạng TOPSIS</span>
                </button>
              </div>
            </div>

            {/* Выбор tin tuyển dụng thật của doanh nghiệp để xếp hạng TOPSIS */}
            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#0062ff]" />
                  <span className="text-xs font-extrabold text-slate-900">
                    Tin tuyển dụng áp dụng xếp hạng TOPSIS
                  </span>
                  <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Đa tiêu chí: Kỹ năng (45%) • TF-IDF (30%) • Kinh nghiệm (25%)
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 m-0">
                  Chọn tin tuyển dụng của doanh nghiệp để hệ thống đối sánh CV–JD và xếp hạng ứng viên theo thuật toán TOPSIS.
                </p>
              </div>

              <div className="w-full md:w-80 shrink-0">
                <Select
                  value={selectedJobId || undefined}
                  onChange={handleJobChange}
                  placeholder={
                    companyJobs.length > 0
                      ? "Chọn tin tuyển dụng..."
                      : "Doanh nghiệp chưa có tin tuyển dụng"
                  }
                  disabled={companyJobs.length === 0}
                  className="w-full text-xs"
                  options={companyJobs.map((j: any) => ({
                    value: j.id,
                    label: `${j.title} (#${j.id} - ${j.status === "published" ? "Đang đăng" : j.status})`,
                  }))}
                />
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
                    className="w-40 text-xs h-7.5"
                    options={[
                      { value: "topsis", label: "Thứ hạng TOPSIS" },
                      { value: "match", label: "Độ khớp CV–JD" },
                      { value: "exp", label: "Kinh nghiệm nhiều nhất" },
                      { value: "newest", label: "Mới nhất" },
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
                  className="w-36 text-xs"
                  options={[
                    { value: "topsis", label: "Hạng TOPSIS" },
                    { value: "match", label: "Độ khớp CV–JD" },
                    { value: "exp", label: "Kinh nghiệm" },
                    { value: "newest", label: "Mới nhất" },
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
          {loading ? (
            <div className="p-16 text-center bg-white rounded-2xl border border-slate-200/90 space-y-3">
              <Spin size="large" />
              <p className="text-xs text-slate-500 font-medium">
                Đang đối sánh CV–JD và xếp hạng ứng viên bằng thuật toán TOPSIS...
              </p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90">
              <Alert
                type="error"
                showIcon
                message="Lỗi tải dữ liệu xếp hạng ứng viên"
                description={error}
                action={
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedJobId) {
                        fetchRecommendationsForJob(selectedJobId);
                      } else {
                        fetchInitialData();
                      }
                    }}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Thử lại
                  </button>
                }
              />
            </div>
          ) : companyJobs.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/90 space-y-3">
              <Briefcase className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
              <h3 className="text-sm font-bold text-slate-800 m-0">
                Doanh nghiệp chưa có tin tuyển dụng nào
              </h3>
              <p className="text-xs text-slate-500 m-0">
                Vui lòng tạo tin tuyển dụng trước để hệ thống phân tích yêu cầu JD và xếp hạng ứng viên bằng thuật toán TOPSIS.
              </p>
              <Link
                href="/doanh-nghiep/tin-tuyen-dung/them-moi"
                className="inline-block px-4 py-2 bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs rounded-xl shadow-sm mt-2"
              >
                + Đăng tin tuyển dụng mới
              </Link>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/90 space-y-3">
              <Search className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
              <h3 className="text-sm font-bold text-slate-800 m-0">
                Không tìm thấy ứng viên phù hợp
              </h3>
              <p className="text-xs text-slate-500 m-0">
                Chưa có hồ sơ ứng viên khớp với điều kiện lọc hiện tại hoặc hệ thống chưa có CV trong phạm vi truy cập.
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
                          src={cand.avatar || undefined}
                          size={46}
                          className="border border-slate-200 shrink-0 shadow-2xs bg-blue-50 text-[#0062ff] font-bold"
                        >
                          {cand.name?.slice(0, 2).toUpperCase()}
                        </Avatar>

                        <div className="space-y-1.5 min-w-0 flex-1">
                          {/* Name + Rank + Tag */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {cand.rankPosition != null && (
                              <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10.5px] font-extrabold">
                                Hạng #{cand.rankPosition}
                              </span>
                            )}
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
                            <span className="font-semibold">{cand.jobTitle}</span>
                            {cand.currentCompany && cand.currentCompany !== "Chưa cập nhật đơn vị" && (
                              <>
                                {" "}tại{" "}
                                <span className="text-slate-800 font-semibold">
                                  {cand.currentCompany}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Meta: Exp + Location + Salary */}
                          <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                              <span>
                                {cand.experienceYears != null
                                  ? `${cand.experienceYears} năm kinh nghiệm`
                                  : "Chưa cập nhật KN"}
                              </span>
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
                            {cand.skills.length > 0 ? (
                              <>
                                {cand.skills.slice(0, 5).map((sk: string, idx: number) => (
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
                              </>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">
                                Chưa trích xuất kỹ năng
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

                      {/* Right: TOPSIS Score vs CV-JD Match Score (Distinct) + Action Buttons */}
                      <div className="flex items-center gap-5 self-end lg:self-center shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 w-full lg:w-auto justify-between lg:justify-end">
                        {/* Dual Score Box: TOPSIS C_i & CV-JD Matching */}
                        <div className="flex items-center gap-3 shrink-0">
                          <Tooltip title="Hệ số độ gần tương đối TOPSIS C_i (0 → 1) tính trên ma trận chuẩn hóa đa tiêu chí">
                            <div className="text-center px-3 py-1.5 rounded-xl bg-indigo-50/70 border border-indigo-200/80 min-w-[96px]">
                              <span className="text-base font-black text-indigo-700 block leading-tight">
                                {cand.topsisScore != null ? cand.topsisScore.toFixed(3) : "—"}
                              </span>
                              <span className="text-[10px] font-bold text-indigo-600 block">
                                Điểm TOPSIS
                              </span>
                            </div>
                          </Tooltip>

                          <Tooltip title="Tỷ lệ tương thích CV–JD Hybrid (Kỹ năng 40% + TF-IDF 35% + Kinh nghiệm 25%)">
                            <div className="text-center px-3 py-1.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 min-w-[96px]">
                              <span className="text-base font-black text-emerald-700 block leading-tight">
                                {cand.matchScore != null ? `${cand.matchScore}%` : "—"}
                              </span>
                              <span className="text-[10px] font-bold text-emerald-600 block">
                                Khớp CV–JD
                              </span>
                            </div>
                          </Tooltip>
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
                      {/* Top Row: Checkbox + Avatar + Scores */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <Checkbox
                            checked={isSelected}
                            onChange={(e) => handleSelectSingle(cand.id, e.target.checked)}
                          />
                          <Avatar
                            src={cand.avatar || undefined}
                            size={44}
                            className="border border-slate-200 shadow-2xs bg-blue-50 text-[#0062ff] font-bold"
                          >
                            {cand.name?.slice(0, 2).toUpperCase()}
                          </Avatar>
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

                        {/* Dual Score Badge */}
                        <div className="text-right space-y-0.5">
                          <div className="text-xs font-black text-indigo-700 leading-none">
                            TOPSIS: {cand.topsisScore != null ? cand.topsisScore.toFixed(3) : "—"}
                          </div>
                          <div className="text-[11px] font-bold text-emerald-600 leading-none">
                            CV–JD: {cand.matchScore != null ? `${cand.matchScore}%` : "—"}
                          </div>
                        </div>
                      </div>

                      {/* Job & Company */}
                      <div>
                        <span className="font-bold text-xs text-slate-800 block truncate">
                          {cand.jobTitle}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium block truncate">
                          {cand.currentCompany}
                        </span>
                      </div>

                      {/* Meta Info */}
                      <div className="space-y-1 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Kinh nghiệm:</span>
                          <span className="font-semibold text-slate-700">
                            {cand.experienceYears != null ? `${cand.experienceYears} năm` : "Chưa cập nhật"}
                          </span>
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
                        {cand.skills.slice(0, 4).map((sk: string, idx: number) => (
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
            {/* 2. ỨNG VIÊN NỔI BẬT (TOP TOPSIS)                   */}
            {/* -------------------------------------------------- */}
            <div className="space-y-2.5 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  Top xếp hạng TOPSIS
                </span>
                <button
                  type="button"
                  onClick={() => setSortBy("topsis")}
                  className="text-[#0062ff] hover:underline text-[11px] font-bold cursor-pointer"
                >
                  Sắp xếp TOPSIS
                </button>
              </div>

              <div className="space-y-2.5">
                {candidates.length === 0 ? (
                  <div className="py-4 text-center text-xs text-slate-400">Chưa có ứng viên gợi ý</div>
                ) : (
                  candidates.slice(0, 3).map((cand) => (
                    <div
                      key={cand.id}
                      onClick={() => setSelectedCandidateDetail(cand)}
                      className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer transition-all"
                    >
                      <Avatar
                        src={cand.avatar || undefined}
                        size={34}
                        className="border border-slate-200 shrink-0 shadow-2xs bg-blue-50 text-[#0062ff] font-bold"
                      >
                        {cand.name?.slice(0, 2).toUpperCase()}
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {cand.rankPosition ? `#${cand.rankPosition} ` : ""}{cand.name}
                          </span>
                          <span className="text-[10.5px] font-bold text-indigo-600 shrink-0">
                            {cand.topsisScore != null
                              ? `TOPSIS ${cand.topsisScore.toFixed(3)}`
                              : cand.matchScore != null
                              ? `${cand.matchScore}% CV–JD`
                              : "—"}
                          </span>
                        </div>
                        <span className="text-[10.5px] text-slate-500 font-medium block truncate">
                          {cand.jobTitle} • CV–JD: {cand.matchScore != null ? `${cand.matchScore}%` : "—"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
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
                src={selectedCandidateDetail.avatar || undefined}
                size={56}
                className="border border-slate-200 shadow-2xs shrink-0 bg-blue-50 text-[#0062ff] font-bold"
              >
                {selectedCandidateDetail.name?.slice(0, 2).toUpperCase()}
              </Avatar>
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    {selectedCandidateDetail.rankPosition != null && (
                      <span className="px-2.5 py-0.5 rounded-md bg-blue-600 text-white font-extrabold text-xs">
                        Hạng #{selectedCandidateDetail.rankPosition} TOPSIS
                      </span>
                    )}
                    <h3 className="text-base font-extrabold text-slate-900 m-0">
                      {selectedCandidateDetail.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs">
                      TOPSIS: {selectedCandidateDetail.topsisScore != null ? selectedCandidateDetail.topsisScore.toFixed(4) : "—"}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">
                      Khớp CV–JD: {selectedCandidateDetail.matchScore != null ? `${selectedCandidateDetail.matchScore}%` : "—"}
                    </span>
                  </div>
                </div>
                <p className="text-xs font-semibold text-slate-700 m-0">
                  {selectedCandidateDetail.jobTitle}
                  {selectedCandidateDetail.currentCompany &&
                    selectedCandidateDetail.currentCompany !== "Chưa cập nhật đơn vị" && (
                      <>
                        {" "}tại{" "}
                        <span className="text-slate-900 font-bold">
                          {selectedCandidateDetail.currentCompany}
                        </span>
                      </>
                    )}
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

            {/* Phân tích điểm TOPSIS vs Điểm thành phần CV-JD Matching */}
            <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900">
                  Chi tiết điểm xếp hạng TOPSIS & So khớp CV–JD
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  Kinh nghiệm thực tế:{" "}
                  <strong className="text-slate-800">
                    {selectedCandidateDetail.experienceYears != null
                      ? `${selectedCandidateDetail.experienceYears} năm`
                      : "Chưa cập nhật"}
                  </strong>
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-lg bg-white border border-indigo-200">
                  <span className="text-[10.5px] font-bold text-indigo-600 block">Hệ số TOPSIS C_i</span>
                  <span className="text-sm font-black text-indigo-800">
                    {selectedCandidateDetail.topsisScore != null
                      ? selectedCandidateDetail.topsisScore.toFixed(4)
                      : "—"}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-emerald-200">
                  <span className="text-[10.5px] font-bold text-emerald-600 block">Tổng điểm CV–JD</span>
                  <span className="text-sm font-black text-emerald-800">
                    {selectedCandidateDetail.matchScore != null
                      ? `${selectedCandidateDetail.matchScore}%`
                      : "—"}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10.5px] font-bold text-slate-500 block">Độ phủ kỹ năng</span>
                  <span className="text-sm font-bold text-slate-800">
                    {selectedCandidateDetail.skillScore != null
                      ? `${Math.round(selectedCandidateDetail.skillScore * 100)}%`
                      : "—"}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10.5px] font-bold text-slate-500 block">TF-IDF Cosine</span>
                  <span className="text-sm font-bold text-slate-800">
                    {selectedCandidateDetail.tfidfScore != null
                      ? selectedCandidateDetail.tfidfScore.toFixed(4)
                      : "—"}
                  </span>
                </div>
              </div>
              {selectedCandidateDetail.missingSkills && selectedCandidateDetail.missingSkills.length > 0 && (
                <div className="text-[11px] text-slate-600 pt-1">
                  <span className="font-bold text-amber-700">Kỹ năng JD chưa nêu trong CV: </span>
                  <span>{selectedCandidateDetail.missingSkills.join(", ")}</span>
                </div>
              )}
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
                {(selectedCandidateDetail.skills || []).map((sk: string, idx: number) => (
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
              value={selectedPoolId}
              onChange={setSelectedPoolId}
              className="w-full text-xs"
              placeholder="Chọn nhóm Talent Pool"
              options={pools.map((p) => ({
                value: p.id,
                label: p.name,
              }))}
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
              onClick={async () => {
                if (!talentPoolCandidate || !selectedPoolId) {
                  message.warning("Vui lòng chọn nhóm Talent Pool!");
                  return;
                }
                const targetCandId = Number(talentPoolCandidate.candidateId || talentPoolCandidate.id);
                if (!targetCandId) {
                  message.warning("Ứng viên này chưa liên kết hồ sơ định danh để thêm vào Talent Pool.");
                  return;
                }
                try {
                  await employerService.addCandidateToPool(selectedPoolId, targetCandId);
                  message.success(`Đã thêm ứng viên vào Talent Pool thành công!`);
                  setIsTalentPoolModalOpen(false);
                  setTalentPoolCandidate(null);
                } catch (err: any) {
                  message.error(err?.response?.data?.message || err?.message || "Không thể thêm ứng viên vào Talent Pool.");
                }
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
