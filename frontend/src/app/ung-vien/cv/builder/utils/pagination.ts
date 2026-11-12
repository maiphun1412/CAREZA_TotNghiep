import { ResumeData, ExperienceItem, EducationItem, ProjectItem, SkillItem, CertificateItem } from "../types";

export interface PaginatedPageData {
  pageIndex: number;
  totalPages: number;
  experiences: ExperienceItem[];
  educations: EducationItem[];
  projects: ProjectItem[];
  skills: SkillItem[];
  certificates: CertificateItem[];
  showMainHeader: boolean;
  showSummary: boolean;
  // Cho 2-column sidebar
  sidebarSkills: SkillItem[];
  sidebarCertificates: CertificateItem[];
}

const PAGE_MAX_HEIGHT = 980; // Chiều cao nội dung khả dụng chuẩn của 1 trang A4 (1123px - padding)

export function paginateCvContent(data: ResumeData): PaginatedPageData[] {
  const { personalInfo, experiences, educations, projects, skills, certificates, sections, theme } = data;

  const isVisible = (id: string) => sections.find((s) => s.id === id)?.visible ?? true;

  // Hệ số co giãn theo cỡ chữ & khoảng cách
  const fontMultiplier = theme.fontSize === "small" ? 0.88 : theme.fontSize === "large" ? 1.15 : 1.0;
  const spacingMultiplier = theme.spacing === "compact" ? 0.85 : theme.spacing === "spacious" ? 1.25 : 1.0;
  const multiplier = fontMultiplier * spacingMultiplier;

  // Tính ước lượng chiều cao của 1 mục kinh nghiệm
  const getExperienceHeight = (exp: ExperienceItem) => {
    const textLength = (exp.description || "").length;
    const lines = Math.max(1, Math.ceil(textLength / 65));
    const baseHeight = 52 + lines * 19;
    return baseHeight * multiplier;
  };

  // Tính ước lượng chiều cao 1 mục học vấn
  const getEducationHeight = (edu: EducationItem) => {
    const textLength = (edu.description || "").length;
    const lines = textLength > 0 ? Math.ceil(textLength / 65) : 0;
    const baseHeight = 44 + lines * 18;
    return baseHeight * multiplier;
  };

  // Tính ước lượng chiều cao 1 mục dự án
  const getProjectHeight = (proj: ProjectItem) => {
    const textLength = (proj.description || "").length;
    const lines = Math.max(1, Math.ceil(textLength / 65));
    const baseHeight = 48 + lines * 19;
    return baseHeight * multiplier;
  };

  // Chiều cao phần Header chính ở Trang 1
  let page1HeaderHeight = 120 * multiplier;
  if (theme.templateId === "classic-executive") page1HeaderHeight = 150 * multiplier;
  if (theme.templateId === "infographic-bold") page1HeaderHeight = 180 * multiplier;
  if (theme.templateId === "creative-timeline") page1HeaderHeight = 160 * multiplier;

  // Chiều cao phần Tóm tắt
  let summaryHeight = 0;
  if (isVisible("summary") && personalInfo.summary?.trim()) {
    const sumLines = Math.ceil(personalInfo.summary.length / 75);
    summaryHeight = (36 + sumLines * 18) * multiplier;
  }

  // Danh sách các trang kết quả
  const pages: PaginatedPageData[] = [];

  // Khởi tạo trang 1
  let currentPageIndex = 0;
  let currentHeight = page1HeaderHeight + summaryHeight;

  let currentExps: ExperienceItem[] = [];
  let currentEdus: EducationItem[] = [];
  let currentProjs: ProjectItem[] = [];
  let currentSkills: SkillItem[] = [];
  let currentCerts: CertificateItem[] = [];

  const startNewPage = () => {
    pages.push({
      pageIndex: currentPageIndex,
      totalPages: 1, // Sẽ cập nhật sau
      experiences: currentExps,
      educations: currentEdus,
      projects: currentProjs,
      skills: currentSkills,
      certificates: currentCerts,
      showMainHeader: currentPageIndex === 0,
      showSummary: currentPageIndex === 0,
      sidebarSkills: currentPageIndex === 0 ? skills : [],
      sidebarCertificates: currentPageIndex === 0 ? certificates : [],
    });

    currentPageIndex++;
    currentHeight = 40; // Mini continued header offset
    currentExps = [];
    currentEdus = [];
    currentProjs = [];
    currentSkills = [];
    currentCerts = [];
  };

  // 1. Phân bổ Kinh nghiệm
  if (isVisible("experience") && experiences.length > 0) {
    currentHeight += 36 * multiplier; // Section header
    for (const exp of experiences) {
      const itemHeight = getExperienceHeight(exp);
      if (currentHeight + itemHeight > PAGE_MAX_HEIGHT && currentExps.length > 0) {
        startNewPage();
        currentHeight += 36 * multiplier; // Re-add section title on new page
      }
      currentExps.push(exp);
      currentHeight += itemHeight;
    }
  }

  // 2. Phân bổ Học vấn
  if (isVisible("education") && educations.length > 0) {
    const eduHeaderHeight = 36 * multiplier;
    if (currentHeight + eduHeaderHeight + 60 > PAGE_MAX_HEIGHT) {
      startNewPage();
    }
    currentHeight += eduHeaderHeight;

    for (const edu of educations) {
      const itemHeight = getEducationHeight(edu);
      if (currentHeight + itemHeight > PAGE_MAX_HEIGHT && currentEdus.length > 0) {
        startNewPage();
        currentHeight += eduHeaderHeight;
      }
      currentEdus.push(edu);
      currentHeight += itemHeight;
    }
  }

  // 3. Phân bổ Dự án
  if (isVisible("projects") && projects.length > 0) {
    const projHeaderHeight = 36 * multiplier;
    if (currentHeight + projHeaderHeight + 60 > PAGE_MAX_HEIGHT) {
      startNewPage();
    }
    currentHeight += projHeaderHeight;

    for (const proj of projects) {
      const itemHeight = getProjectHeight(proj);
      if (currentHeight + itemHeight > PAGE_MAX_HEIGHT && currentProjs.length > 0) {
        startNewPage();
        currentHeight += projHeaderHeight;
      }
      currentProjs.push(proj);
      currentHeight += itemHeight;
    }
  }

  // 4. Phân bổ Kỹ năng (nếu là template 1 cột hoặc compact)
  const isOneColumn = theme.templateId === "classic-executive" || theme.templateId === "minimalist-clean";
  if (isOneColumn && isVisible("skills") && skills.length > 0) {
    const skillsHeight = (40 + Math.ceil(skills.length / 3) * 28) * multiplier;
    if (currentHeight + skillsHeight > PAGE_MAX_HEIGHT && (currentExps.length > 0 || currentEdus.length > 0)) {
      startNewPage();
    }
    currentSkills = skills;
    currentHeight += skillsHeight;
  }

  // 5. Phân bổ Chứng chỉ (nếu là template 1 cột)
  if (isOneColumn && isVisible("certificates") && certificates.length > 0) {
    const certsHeight = (36 + certificates.length * 36) * multiplier;
    if (currentHeight + certsHeight > PAGE_MAX_HEIGHT && currentSkills.length > 0) {
      startNewPage();
    }
    currentCerts = certificates;
    currentHeight += certsHeight;
  }

  // Đẩy trang cuối vào danh sách
  pages.push({
    pageIndex: currentPageIndex,
    totalPages: currentPageIndex + 1,
    experiences: currentExps,
    educations: currentEdus,
    projects: currentProjs,
    skills: currentSkills,
    certificates: currentCerts,
    showMainHeader: currentPageIndex === 0,
    showSummary: currentPageIndex === 0,
    sidebarSkills: currentPageIndex === 0 ? skills : [],
    sidebarCertificates: currentPageIndex === 0 ? certificates : [],
  });

  // Cập nhật tổng số trang cho tất cả các trang
  const total = pages.length;
  pages.forEach((p) => {
    p.totalPages = total;
  });

  return pages;
}
