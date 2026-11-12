"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { ResumeData, ResumeTheme, SectionConfig, CVTemplateId, ExperienceItem, EducationItem, SkillItem, ProjectItem, CertificateItem } from "../types";
import { EMPTY_RESUME_DATA, DEFAULT_THEME, CV_TEMPLATES } from "../constants";
import { useAuthStore } from "@/store/auth-store";
import { candidateService } from "@/services/candidate.service";
import { aiService } from "@/services/ai.service";
import { downloadCvPdf, exportCvPdfBlob } from "../utils/pdf-generator";
import { message } from "antd";

const MAX_HISTORY = 30;

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export function useCvBuilder() {
  const searchParams = useSearchParams();
  const cvIdParam = searchParams.get("id");
  const user = useAuthStore((state) => state.user);

  // Core Resume State
  const [resumeData, setResumeData] = useState<ResumeData>(EMPTY_RESUME_DATA);
  const [currentCvId, setCurrentCvId] = useState<number | null>(cvIdParam ? parseInt(cvIdParam) : null);
  const [cvVersions, setCvVersions] = useState<any[]>([]);

  // Undo / Redo History Stacks
  const [history, setHistory] = useState<ResumeData[]>([EMPTY_RESUME_DATA]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Save state
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSavedTime, setLastSavedTime] = useState<string>("Chưa lưu");
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [totalCvCount, setTotalCvCount] = useState<number>(0);

  // UI state
  const [activeTab, setActiveTab] = useState<"content" | "templates" | "design" | "sections" | "ai">("content");
  const [selectedSectionId, setSelectedSectionId] = useState<string>("info");
  const [activeCollapseKeys, setActiveCollapseKeys] = useState<string[]>(["info", "experience"]);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isAutoFilled, setIsAutoFilled] = useState<boolean>(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(false);
  const [isLoadingCv, setIsLoadingCv] = useState<boolean>(false);

  // AI Evaluation & Matching State (Giai đoạn 3)
  const [aiEvaluation, setAiEvaluation] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evalError, setEvalError] = useState<string | null>(null);
  const [isEvaluationOutdated, setIsEvaluationOutdated] = useState<boolean>(false);
  const evaluatedResumeSnapshotRef = useRef<string>("");

  const [aiMatch, setAiMatch] = useState<any>(null);
  const [isMatching, setIsMatching] = useState<boolean>(false);
  const [matchError, setMatchError] = useState<string | null>(null);

  // Tải tổng số lượng CV hiện có của ứng viên để kiểm soát giới hạn tối đa 5 CV
  const fetchCvCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await candidateService.getCvs();
      const list = res?.data?.cvs || res?.data?.documents || [];
      setTotalCvCount(list.length);
    } catch {
      // Bỏ qua lỗi kết nối nền
    }
  }, [user]);

  useEffect(() => {
    fetchCvCount();
  }, [fetchCvCount]);

  // Tạo khóa lưu nháp cục bộ phân tách theo tài khoản và ID bản CV
  const getDraftStorageKey = useCallback(
    (targetId?: string | number | null) => {
      const effectiveId = targetId || currentCvId || cvIdParam || "new";
      const uid = user?.id || "guest";
      return `careza_cv_draft_${uid}_${effectiveId}`;
    },
    [user?.id, currentCvId, cvIdParam]
  );

  // Tự động lưu nháp cục bộ vào localStorage khi resumeData thay đổi
  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = getDraftStorageKey();
    try {
      localStorage.setItem(key, JSON.stringify(resumeData));
    } catch {
      // Bỏ qua nếu localStorage bị đầy hoặc bị chặn
    }
  }, [resumeData, getDraftStorageKey]);

  // Ref để tránh record history trong quá trình undo/redo
  const isTimeTravelingRef = useRef(false);

  // Cập nhật trạng thái và lưu snapshot vào history
  const updateResumeData = useCallback((updater: (prev: ResumeData) => ResumeData) => {
    setResumeData((prev) => {
      const next = updater(prev);
      next.updatedAt = new Date().toISOString();

      if (!isTimeTravelingRef.current) {
        setHistory((prevHistory) => {
          const newHistory = prevHistory.slice(0, historyIndex + 1);
          if (newHistory.length >= MAX_HISTORY) {
            newHistory.shift();
          }
          return [...newHistory, next];
        });
        setHistoryIndex((prevIndex) => Math.min(prevIndex + 1, MAX_HISTORY - 1));
      }

      // Đánh dấu kết quả AI cũ nếu đã có snapshot đánh giá
      if (evaluatedResumeSnapshotRef.current) {
        setIsEvaluationOutdated(true);
      }

      return next;
    });
  }, [historyIndex]);

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      isTimeTravelingRef.current = true;
      const prevSnapshot = history[historyIndex - 1];
      setResumeData(prevSnapshot);
      setHistoryIndex(historyIndex - 1);
      setTimeout(() => {
        isTimeTravelingRef.current = false;
      }, 50);
      message.info("Đã hoàn tác");
    }
  }, [history, historyIndex]);

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isTimeTravelingRef.current = true;
      const nextSnapshot = history[historyIndex + 1];
      setResumeData(nextSnapshot);
      setHistoryIndex(historyIndex + 1);
      setTimeout(() => {
        isTimeTravelingRef.current = false;
      }, 50);
      message.info("Đã làm lại");
    }
  }, [history, historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // ==========================================
  // 1. TẢI CV TỪ BACKEND NẾU CÓ cvId
  // ==========================================
  const loadCvFromBackend = useCallback(async (id: number) => {
    try {
      setIsLoadingCv(true);
      const res = await candidateService.getCvDetail(id);
      const cv = res?.data?.cv || res?.data?.document;
      if (!cv) return;

      setCurrentCvId(cv.id);
      setCvVersions(cv.versions || []);

      const parsedData = cv.parsed_data || {};
      const builderData = parsedData.builder_data;

      if (builderData?.resumeData) {
        // Khôi phục 100% bản vẽ từ Semantic JSON của Builder
        setResumeData(builderData.resumeData);
        setHistory([builderData.resumeData]);
        setHistoryIndex(0);
      } else {
        // Tương thích ngược với CV phân tích từ CV Parsing
        const candidateInfo = parsedData.candidate_info || {};
        const importedData: ResumeData = {
          ...EMPTY_RESUME_DATA,
          title: cv.title || "CV của tôi",
          personalInfo: {
            fullName: candidateInfo.name || user?.fullName || "",
            jobTitle: candidateInfo.title || "",
            email: candidateInfo.email || user?.email || "",
            phone: candidateInfo.phone || user?.phoneNumber || "",
            address: candidateInfo.address || "",
            website: candidateInfo.website || "",
            avatarUrl: user?.avatarUrl || "",
            summary: candidateInfo.summary || "",
          },
          experiences: (parsedData.experiences || []).map((exp: any, i: number) => ({
            id: `exp_${i}_${Date.now()}`,
            position: exp.role || exp.position || "",
            company: exp.company || "",
            startDate: exp.start_date || "",
            endDate: exp.end_date || "",
            isCurrent: !exp.end_date,
            description: exp.description || "",
          })),
          educations: (parsedData.educations || []).map((edu: any, i: number) => ({
            id: `edu_${i}_${Date.now()}`,
            school: edu.institution || edu.school || "",
            major: edu.major || "",
            degree: edu.degree || "",
            startDate: String(edu.start_year || ""),
            endDate: String(edu.end_year || ""),
            description: edu.description || "",
          })),
          skills: (parsedData.skills || []).map((sk: any, i: number) => ({
            id: `skill_${i}_${Date.now()}`,
            name: typeof sk === "string" ? sk : sk.name || "",
            level: typeof sk === "object" ? sk.level || 4 : 4,
          })),
          updatedAt: cv.created_at || new Date().toISOString(),
        };

        setResumeData(importedData);
        setHistory([importedData]);
        setHistoryIndex(0);
      }

      setSaveStatus("saved");
      setLastSavedTime(
        new Date(cv.created_at || Date.now()).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
      message.success(`Đã mở bản CV: ${cv.title}`);
    } catch {
      message.error("Không thể tải bản CV được yêu cầu.");
    } finally {
      setIsLoadingCv(false);
    }
  }, [user]);

  // Load CV khi có param ?id=
  useEffect(() => {
    if (cvIdParam) {
      const id = parseInt(cvIdParam);
      if (!isNaN(id)) {
        loadCvFromBackend(id);
      }
    }
  }, [cvIdParam, loadCvFromBackend]);

  // ==========================================
  // 2. LƯU CV VÀO BACKEND (HỖ TRỢ TẠO MỚI, CẬP NHẬT, LƯU NHÁP, PHIÊN BẢN)
  // ==========================================
  const saveCv = useCallback(async (options?: { isDraft?: boolean; createNewVersion?: boolean }) => {
    const isDraft = options?.isDraft ?? false;
    const createNewVersion = options?.createNewVersion ?? false;

    if (!user) {
      message.warning("Vui lòng đăng nhập tài khoản ứng viên để lưu CV vào hệ thống.");
      return null;
    }

    try {
      setSaveStatus("saving");

      // Chuẩn hóa dữ liệu theo cấu trúc chuẩn CAREZA cho AI Parsing, Evaluation và Matching
      const parsedDataForBackend = {
        candidate_info: {
          name: resumeData.personalInfo.fullName,
          title: resumeData.personalInfo.jobTitle,
          email: resumeData.personalInfo.email,
          phone: resumeData.personalInfo.phone,
          address: resumeData.personalInfo.address,
          website: resumeData.personalInfo.website,
          summary: resumeData.personalInfo.summary,
        },
        skills: resumeData.skills.map((s) => s.name),
        educations: resumeData.educations.map((e) => ({
          institution: e.school,
          major: e.major,
          degree: e.degree || "",
          start_year: parseInt(e.startDate) || null,
          end_year: parseInt(e.endDate) || null,
          description: e.description || "",
        })),
        experiences: resumeData.experiences.map((exp) => ({
          company: exp.company,
          role: exp.position,
          start_date: exp.startDate,
          end_date: exp.endDate,
          description: exp.description,
        })),
        projects: resumeData.projects.map((p) => ({
          name: p.name,
          role: p.role,
          description: p.description,
        })),
        certificates: resumeData.certificates.map((c) => ({
          name: c.name,
          issuer: c.issuer,
          issue_date: c.issueDate,
        })),
        // Metadata lưu trọn vẹn Semantic JSON cho CV Builder để mở lại chỉnh sửa chuẩn xác 100%
        builder_data: {
          resumeData: resumeData,
          templateId: resumeData.theme.templateId,
          theme: resumeData.theme,
          sections: resumeData.sections,
        },
      };

      const payload = {
        title: resumeData.title.trim() || `CV - ${resumeData.personalInfo.fullName || "Mới"}`,
        parsed_data: parsedDataForBackend,
        status: isDraft ? "draft" : "active",
      };

      let savedCvResult: any = null;

      if (currentCvId) {
        // Cập nhật CV đã có (không làm tăng tổng số CV)
        if (createNewVersion) {
          // Tạo phiên bản mới (v2, v3...)
          await candidateService.createCvVersion(currentCvId, {
            content: parsedDataForBackend,
            file_url: null,
          });
        }

        const res = await candidateService.updateCv(currentCvId, payload);
        savedCvResult = res?.data?.cv || res?.data?.document;
      } else {
        // Kiểm tra giới hạn 5 CV trước khi tạo mới bản ghi
        if (totalCvCount >= 5) {
          setSaveStatus("error");
          message.error("Bạn đã lưu tối đa 5 CV. Vui lòng xóa một CV không còn sử dụng để lưu CV mới.");
          return null;
        }

        // Tạo mới CV lần đầu
        const res = await candidateService.createCv(payload);
        savedCvResult = res?.data?.cv || res?.data?.document;
        if (savedCvResult?.id) {
          setCurrentCvId(savedCvResult.id);
          setTotalCvCount((prev) => prev + 1);
          // Cập nhật URL trình duyệt có ?id= để người dùng F5 không bị mất liên kết
          if (typeof window !== "undefined") {
            const url = new URL(window.location.href);
            url.searchParams.set("id", String(savedCvResult.id));
            window.history.replaceState({}, "", url.toString());
          }
        }
      }

      setSaveStatus("saved");
      const formattedTime = new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setLastSavedTime(formattedTime);

      // Xóa bản nháp cục bộ vì đã lưu thành công lên máy chủ
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem(getDraftStorageKey(savedCvResult?.id));
          localStorage.removeItem(getDraftStorageKey("new"));
        } catch {
          // ignore
        }
      }

      if (createNewVersion) {
        message.success("Đã lưu thành phiên bản mới thành công!");
      } else {
        message.success(isDraft ? "Đã lưu bản nháp CV." : "Đã lưu CV thành công vào hệ thống CAREZA!");
      }

      return savedCvResult;
    } catch (err: any) {
      setSaveStatus("error");
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.limit?.[0] ||
        "Có lỗi xảy ra khi lưu CV lên hệ thống. Vui lòng thử lại.";
      message.error(errorMsg);
      // Giữ nguyên toàn bộ resumeData hiện tại để người dùng không bị mất nội dung
      return null;
    }
  }, [user, resumeData, currentCvId, totalCvCount]);

  // ==========================================
  // 3. NHÂN BẢN CV (DUPLICATE)
  // ==========================================
  const duplicateCv = useCallback(async () => {
    if (!user) {
      message.warning("Vui lòng đăng nhập để nhân bản CV.");
      return;
    }

    if (totalCvCount >= 5) {
      message.error("Bạn đã lưu tối đa 5 CV. Vui lòng xóa một CV không còn sử dụng để lưu CV mới.");
      return;
    }

    try {
      const clonedTitle = `Bản sao của ${resumeData.title}`;
      updateResumeData((prev) => ({
        ...prev,
        title: clonedTitle,
      }));

      // Reset ID để lưu thành bản ghi mới độc lập
      setCurrentCvId(null);
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.delete("id");
        window.history.replaceState({}, "", url.toString());
      }

      message.info("Đã tạo bản sao CV. Nhấn 'Lưu CV' để lưu vào danh sách.");
    } catch {
      message.error("Không thể nhân bản CV.");
    }
  }, [user, resumeData.title, totalCvCount, updateResumeData]);

  // ==========================================
  // 4. XUẤT FILE PDF CÓ TEXT LAYER THẬT
  // ==========================================
  const exportPdf = useCallback(async () => {
    try {
      setIsExportingPdf(true);
      message.loading({ content: "Đang kết xuất PDF text layer tiếng Việt...", key: "pdf_export" });
      await downloadCvPdf(resumeData);
      message.success({ content: "Đã xuất và tải xuống file PDF thành công!", key: "pdf_export" });
    } catch {
      message.error({ content: "Không thể xuất file PDF. Vui lòng thử lại.", key: "pdf_export" });
    } finally {
      setIsExportingPdf(false);
    }
  }, [resumeData]);

  // ==========================================
  // 5. TỰ ĐỘNG ĐIỀN TỪ HỒ SƠ CAREZA (AUTOFILL)
  // ==========================================
  const autofillFromProfile = useCallback(async (silent = false) => {
    try {
      setIsLoadingProfile(true);
      const res = await candidateService.getProfile();
      const candidate = res?.data?.candidate;

      if (!candidate && !user) {
        if (!silent) message.warning("Không tìm thấy thông tin hồ sơ của bạn để tự động điền.");
        return;
      }

      const profile = candidate?.profile;
      const educations = candidate?.educations || [];
      const experiences = candidate?.experiences || [];
      const skills = candidate?.skills || [];

      updateResumeData((prev) => {
        const personalInfo = {
          fullName: user?.fullName || profile?.headline || prev.personalInfo.fullName,
          jobTitle: profile?.currentPosition || profile?.headline || prev.personalInfo.jobTitle,
          email: user?.email || prev.personalInfo.email,
          phone: user?.phoneNumber || prev.personalInfo.phone,
          address: profile?.address || prev.personalInfo.address,
          website: prev.personalInfo.website,
          avatarUrl: user?.avatarUrl || prev.personalInfo.avatarUrl,
          summary: profile?.summary || prev.personalInfo.summary,
        };

        const mappedExperiences: ExperienceItem[] = experiences.length > 0
          ? experiences.map((exp) => ({
              id: exp.experienceId || String(Math.random()),
              company: exp.companyName || "",
              position: exp.positionName || "",
              startDate: exp.startDate ? exp.startDate.slice(0, 7) : "",
              endDate: exp.endDate ? exp.endDate.slice(0, 7) : "",
              isCurrent: !!exp.isCurrentJob,
              description: exp.description || "",
            }))
          : prev.experiences;

        const mappedEducations: EducationItem[] = educations.length > 0
          ? educations.map((edu) => ({
              id: edu.educationId || String(Math.random()),
              school: edu.schoolName || "",
              major: edu.majorName || "",
              degree: edu.degreeName || "",
              startDate: edu.startDate ? edu.startDate.slice(0, 7) : "",
              endDate: edu.endDate ? edu.endDate.slice(0, 7) : "",
              description: edu.description || "",
            }))
          : prev.educations;

        const mappedSkills: SkillItem[] = skills.length > 0
          ? skills.map((sk) => ({
              id: String(sk.skillId || Math.random()),
              name: sk.skillName || "",
              level: sk.skillLevel || 3,
            }))
          : prev.skills;

        return {
          ...prev,
          title: user?.fullName ? `CV - ${user.fullName}` : prev.title,
          personalInfo,
          experiences: mappedExperiences,
          educations: mappedEducations,
          skills: mappedSkills,
        };
      });

      setIsAutoFilled(true);
      if (!silent) message.success("Đã đồng bộ thông tin từ hồ sơ CAREZA vào CV!");
    } catch {
      if (!silent) message.info("Chưa có hồ sơ CAREZA để tự động điền.");
    } finally {
      setIsLoadingProfile(false);
    }
  }, [user, updateResumeData]);

  // Khôi phục bản nháp cục bộ hoặc nạp thông tin hồ sơ khi mở builder chưa có cvIdParam
  useEffect(() => {
    if (typeof window === "undefined" || cvIdParam) return;

    const draftKey = getDraftStorageKey("new");
    try {
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        // Kiểm tra tính hợp lệ của bản nháp
        if (parsed && parsed.personalInfo && (parsed.personalInfo.fullName || parsed.experiences?.length > 0)) {
          setResumeData(parsed);
          setHistory([parsed]);
          setHistoryIndex(0);
          setIsAutoFilled(true);
          setLastSavedTime("Bản nháp cục bộ");
          message.info("Đã khôi phục bản nháp thiết kế gần nhất của bạn.");
          return;
        }
      }
    } catch {
      // ignore JSON parse error
    }

    // Nếu không có bản nháp, nạp dữ liệu hồ sơ CAREZA lần đầu
    if (user && !isAutoFilled) {
      autofillFromProfile(true);
    }
  }, [user, isAutoFilled, cvIdParam, getDraftStorageKey, autofillFromProfile]);

  // Cập nhật từng trường thông tin cá nhân
  const updatePersonalInfo = useCallback((field: keyof ResumeData["personalInfo"], value: string) => {
    updateResumeData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value,
      },
    }));
  }, [updateResumeData]);

  // Đổi template mà giữ nguyên toàn bộ nội dung
  const changeTemplate = useCallback((templateId: CVTemplateId) => {
    const meta = CV_TEMPLATES.find((t) => t.id === templateId);
    updateResumeData((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        templateId,
        primaryColor: meta?.thumbnailColor || prev.theme.primaryColor,
      },
    }));
    message.success(`Đã chuyển sang mẫu: ${meta?.name || templateId}`);
  }, [updateResumeData]);

  // Cập nhật Theme
  const updateTheme = useCallback((updater: Partial<ResumeTheme>) => {
    updateResumeData((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        ...updater,
      },
    }));
  }, [updateResumeData]);

  // Reset Theme về mặc định của mẫu CV hiện tại
  const resetTheme = useCallback(() => {
    const currentTpl = resumeData.theme.templateId;
    const meta = CV_TEMPLATES.find((t) => t.id === currentTpl);
    updateResumeData((prev) => ({
      ...prev,
      theme: {
        ...DEFAULT_THEME,
        templateId: currentTpl,
        primaryColor: meta?.thumbnailColor || DEFAULT_THEME.primaryColor,
      },
    }));
    message.success("Đã khôi phục thiết kế mặc định");
  }, [resumeData.theme.templateId, updateResumeData]);

  // Quản lý Section: Ẩn/Hiện
  const toggleSectionVisibility = useCallback((sectionId: string) => {
    updateResumeData((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId ? { ...s, visible: !s.visible } : s
      ),
    }));
  }, [updateResumeData]);

  // Di chuyển thứ tự Section (Move Up / Down)
  const moveSection = useCallback((sectionId: string, direction: "up" | "down") => {
    updateResumeData((prev) => {
      const idx = prev.sections.findIndex((s) => s.id === sectionId);
      if (idx < 0) return prev;
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.sections.length) return prev;

      const newSections = [...prev.sections];
      const temp = newSections[idx];
      newSections[idx] = newSections[targetIdx];
      newSections[targetIdx] = temp;

      return {
        ...prev,
        sections: newSections,
      };
    });
  }, [updateResumeData]);

  // Thêm section tùy chỉnh
  const addCustomSection = useCallback((title: string) => {
    const newId = `custom_${Date.now()}`;
    const newSection: SectionConfig = {
      id: newId,
      title: title.trim() || "Mục tùy chỉnh",
      type: "custom",
      visible: true,
      items: [
        {
          id: `item_${Date.now()}`,
          title: "Tiêu đề thành tích / hoạt động",
          subtitle: "Đơn vị / Tổ chức",
          date: "2024",
          description: "Mô tả chi tiết nội dung hoặc kết quả đạt được...",
        },
      ],
    };
    updateResumeData((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
    message.success(`Đã thêm mục "${title}"`);
  }, [updateResumeData]);

  // Xóa section tùy chỉnh
  const removeSection = useCallback((sectionId: string) => {
    updateResumeData((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== sectionId),
    }));
    message.info("Đã xóa mục");
  }, [updateResumeData]);

  // Thao tác với Experience items
  const addExperience = useCallback(() => {
    const newItem: ExperienceItem = {
      id: `exp_${Date.now()}`,
      position: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      description: "",
    };
    updateResumeData((prev) => ({
      ...prev,
      experiences: [newItem, ...prev.experiences],
    }));
  }, [updateResumeData]);

  const updateExperience = useCallback((id: string, updates: Partial<ExperienceItem>) => {
    updateResumeData((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp) => (exp.id === id ? { ...exp, ...updates } : exp)),
    }));
  }, [updateResumeData]);

  const removeExperience = useCallback((id: string) => {
    updateResumeData((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((exp) => exp.id !== id),
    }));
  }, [updateResumeData]);

  // Thao tác với Education items
  const addEducation = useCallback(() => {
    const newItem: EducationItem = {
      id: `edu_${Date.now()}`,
      school: "",
      major: "",
      degree: "",
      startDate: "",
      endDate: "",
      gpa: "",
      description: "",
    };
    updateResumeData((prev) => ({
      ...prev,
      educations: [newItem, ...prev.educations],
    }));
  }, [updateResumeData]);

  const updateEducation = useCallback((id: string, updates: Partial<EducationItem>) => {
    updateResumeData((prev) => ({
      ...prev,
      educations: prev.educations.map((edu) => (edu.id === id ? { ...edu, ...updates } : edu)),
    }));
  }, [updateResumeData]);

  const removeEducation = useCallback((id: string) => {
    updateResumeData((prev) => ({
      ...prev,
      educations: prev.educations.filter((edu) => edu.id !== id),
    }));
  }, [updateResumeData]);

  // Thao tác với Skills
  const addSkill = useCallback((name = "", level = 3) => {
    const newItem: SkillItem = {
      id: `skill_${Date.now()}`,
      name,
      level,
    };
    updateResumeData((prev) => ({
      ...prev,
      skills: [...prev.skills, newItem],
    }));
  }, [updateResumeData]);

  const updateSkill = useCallback((id: string, updates: Partial<SkillItem>) => {
    updateResumeData((prev) => ({
      ...prev,
      skills: prev.skills.map((sk) => (sk.id === id ? { ...sk, ...updates } : sk)),
    }));
  }, [updateResumeData]);

  const removeSkill = useCallback((id: string) => {
    updateResumeData((prev) => ({
      ...prev,
      skills: prev.skills.filter((sk) => sk.id !== id),
    }));
  }, [updateResumeData]);

  // Thao tác với Projects
  const addProject = useCallback(() => {
    const newItem: ProjectItem = {
      id: `proj_${Date.now()}`,
      name: "",
      role: "",
      startDate: "",
      endDate: "",
      link: "",
      description: "",
      technologies: "",
    };
    updateResumeData((prev) => ({
      ...prev,
      projects: [newItem, ...prev.projects],
    }));
  }, [updateResumeData]);

  const updateProject = useCallback((id: string, updates: Partial<ProjectItem>) => {
    updateResumeData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  }, [updateResumeData]);

  const removeProject = useCallback((id: string) => {
    updateResumeData((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
    }));
  }, [updateResumeData]);

  // Thao tác với Certificates
  const addCertificate = useCallback(() => {
    const newItem: CertificateItem = {
      id: `cert_${Date.now()}`,
      name: "",
      issuer: "",
      issueDate: "",
      expireDate: "",
      url: "",
    };
    updateResumeData((prev) => ({
      ...prev,
      certificates: [newItem, ...prev.certificates],
    }));
  }, [updateResumeData]);

  const updateCertificate = useCallback((id: string, updates: Partial<CertificateItem>) => {
    updateResumeData((prev) => ({
      ...prev,
      certificates: prev.certificates.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  }, [updateResumeData]);

  const removeCertificate = useCallback((id: string) => {
    updateResumeData((prev) => ({
      ...prev,
      certificates: prev.certificates.filter((c) => c.id !== id),
    }));
  }, [updateResumeData]);

  // ==========================================
  // GIAI ĐOẠN 3: AI ĐÁNH GIÁ & SO KHỚP CV-JD
  // ==========================================

  // 1. Thực thi Đánh giá CV (chất lượng tổng quan, rubric 4 tiêu chí, đề xuất section)
  const runAiEvaluation = useCallback(async () => {
    setIsEvaluating(true);
    setEvalError(null);
    try {
      const res = await aiService.evaluateCv({
        cv_id: currentCvId,
        cv_data: resumeData,
      });
      if (res?.data) {
        setAiEvaluation(res.data);
        setIsEvaluationOutdated(false);
        evaluatedResumeSnapshotRef.current = JSON.stringify(resumeData);
        message.success("Đánh giá CV hoàn tất!");
      } else {
        setEvalError("Không nhận được kết quả đánh giá từ hệ thống.");
      }
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err.message ||
        "Đánh giá thất bại. Vui lòng thử lại.";
      setEvalError(errMsg);
      message.error(errMsg);
    } finally {
      setIsEvaluating(false);
    }
  }, [currentCvId, resumeData]);

  // 2. Thực thi So khớp CV với JD (Matching)
  const runCvJdMatch = useCallback(
    async (params: { jobId?: number | null; jdText?: string }) => {
      setIsMatching(true);
      setMatchError(null);
      try {
        const res = await aiService.matchCvJd({
          cv_id: currentCvId,
          cv_data: resumeData,
          job_id: params.jobId,
          jd_text: params.jdText,
        });
        if (res?.data) {
          setAiMatch(res.data);
          message.success("So khớp CV với tin tuyển dụng hoàn tất!");
        } else {
          setMatchError("Không nhận được kết quả so khớp.");
        }
      } catch (err: any) {
        const errMsg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err.message ||
          "So khớp thất bại. Vui lòng thử lại.";
        setMatchError(errMsg);
        message.error(errMsg);
      } finally {
        setIsMatching(false);
      }
    },
    [currentCvId, resumeData]
  );

  // 3. Điều hướng tới Section tương ứng khi người dùng click vào gợi ý AI
  const jumpToSection = useCallback((sectionId: string) => {
    const keyMap: Record<string, string> = {
      personal: "info",
      summary: "info",
      experience: "experience",
      education: "education",
      skills: "skills",
      projects: "projects",
      certificates: "certificates",
    };
    const targetKey = keyMap[sectionId] || sectionId;
    setActiveCollapseKeys((prev) => Array.from(new Set([...prev, targetKey])));
    setActiveTab("content");
  }, []);

  return {
    resumeData,
    updateResumeData,
    updatePersonalInfo,
    changeTemplate,
    updateTheme,
    resetTheme,
    // Storage & Backend
    currentCvId,
    saveStatus,
    isSaving: saveStatus === "saving",
    saveCv,
    duplicateCv,
    cvVersions,
    loadCvFromBackend,
    lastSavedTime,
    isLoadingCv,
    totalCvCount,
    isMaxCvReached: totalCvCount >= 5 && !currentCvId,
    // PDF Export
    exportPdf,
    isExportingPdf,
    // History
    undo,
    redo,
    canUndo,
    canRedo,
    // Sections
    toggleSectionVisibility,
    moveSection,
    addCustomSection,
    removeSection,
    // Items
    addExperience,
    updateExperience,
    removeExperience,
    addEducation,
    updateEducation,
    removeEducation,
    addSkill,
    updateSkill,
    removeSkill,
    addProject,
    updateProject,
    removeProject,
    addCertificate,
    updateCertificate,
    removeCertificate,
    // Profile sync
    autofillFromProfile,
    isLoadingProfile,
    // UI
    activeTab,
    setActiveTab,
    selectedSectionId,
    setSelectedSectionId,
    activeCollapseKeys,
    setActiveCollapseKeys,
    zoomLevel,
    setZoomLevel,
    // Giai đoạn 3: AI
    aiEvaluation,
    isEvaluating,
    evalError,
    isEvaluationOutdated,
    runAiEvaluation,
    aiMatch,
    isMatching,
    matchError,
    runCvJdMatch,
    jumpToSection,
  };
}
