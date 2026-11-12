export type CVTemplateId =
  | "modern-two-column"
  | "classic-executive"
  | "minimalist-clean"
  | "creative-timeline"
  | "compact-dense"
  | "infographic-bold";

export type SectionType =
  | "info"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certificates"
  | "custom";

export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  avatarUrl: string;
  summary: string;
}

export interface ExperienceItem {
  id: string;
  position: string;
  company: string;
  location?: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
}

export interface EducationItem {
  id: string;
  school: string;
  major: string;
  degree?: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  description?: string;
}

export interface SkillItem {
  id: string;
  name: string;
  level: number; // 1 - 5
  category?: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  role: string;
  startDate: string;
  endDate: string;
  link?: string;
  description: string;
  technologies?: string;
}

export interface CertificateItem {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expireDate?: string;
  url?: string;
}

export interface CustomSectionItem {
  id: string;
  title: string;
  subtitle?: string;
  date?: string;
  description: string;
}

export interface SectionConfig {
  id: string;
  title: string;
  type: SectionType;
  visible: boolean;
  items?: CustomSectionItem[];
}

export interface DecorationConfig {
  dividerStyle: "solid" | "dashed" | "dotted" | "double" | "gradient" | "none";
  headerPattern: "none" | "dots" | "accent-corner" | "top-banner" | "geometric";
  cardBorder: "none" | "subtle" | "accent" | "bordered";
  iconStyle: "minimal" | "filled" | "outlined";
}

export interface ResumeTheme {
  templateId: CVTemplateId;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  fontSize: "small" | "normal" | "large";
  spacing: "compact" | "normal" | "spacious";
  showAvatar: boolean;
  avatarStyle: "circle" | "rounded" | "square";
  showDecorations: boolean;
  decorations: DecorationConfig;
}

export interface ResumeData {
  id?: string;
  title: string;
  personalInfo: PersonalInfo;
  experiences: ExperienceItem[];
  educations: EducationItem[];
  skills: SkillItem[];
  projects: ProjectItem[];
  certificates: CertificateItem[];
  sections: SectionConfig[];
  theme: ResumeTheme;
  updatedAt: string;
}

export interface TemplateMeta {
  id: CVTemplateId;
  name: string;
  category: string;
  description: string;
  thumbnailColor: string;
  layoutDescription: string;
  features: string[];
}
