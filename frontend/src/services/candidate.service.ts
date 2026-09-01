import { apiClient } from "./api-client";

export interface CandidateDocument {
  documentId: string;
  documentType: "CV" | "COVER_LETTER" | "CERTIFICATE" | "DEGREE" | "PORTFOLIO" | "OTHER";
  documentName: string;
  fileUrl: string;
  versionNumber: number;
  documentGroupId: string | null;
  isDefault: boolean;
  title: string | null;
  createdAt: string;
}

export interface CandidateProfileData {
  headline: string | null;
  summary: string | null;
  dateOfBirth: string | null;
  gender: number | null;
  provinceId: number | null;
  address: string | null;
  currentPosition: string | null;
  currentLevelId: number | null;
  expectedSalaryMin: number | null;
  expectedSalaryMax: number | null;
  yearsOfExperience: number | null;
  openToWork: boolean;
  profileVisibility: number;
}

export interface CandidateEducation {
  educationId: string;
  schoolName: string;
  majorName: string;
  degreeName: string | null;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
}

export interface CandidateExperience {
  experienceId: string;
  companyName: string;
  positionName: string;
  startDate: string;
  endDate: string | null;
  isCurrentJob: boolean;
  description: string | null;
}

export interface CandidateSkill {
  skillId: number;
  skillName: string;
  skillLevel: number;
  yearsOfExperience: number | null;
}

export const candidateService = {
  // 1. Quản lý CV & Tài liệu
  getDocuments: async (params?: { type?: string; includeVersions?: boolean }) => {
    const response = await apiClient.get<{
      message: string;
      data: { documents: CandidateDocument[] };
    }>("/candidate/documents", { params });
    return response.data;
  },

  uploadDocument: async (formData: FormData) => {
    const response = await apiClient.post<{
      message: string;
      data: { document: CandidateDocument };
    }>("/candidate/documents", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  deleteDocument: async (id: string) => {
    const response = await apiClient.delete<{
      message: string;
      data: null;
    }>(`/candidate/documents/${id}`);
    return response.data;
  },

  setDefaultCv: async (id: string) => {
    const response = await apiClient.patch<{
      message: string;
      data: CandidateDocument;
    }>(`/candidate/documents/${id}/default`);
    return response.data;
  },

  // 2. Ứng tuyển
  applyJob: async (payload: {
    jobPostId: string;
    cvId?: string;
    candidateDocumentId?: string;
    coverLetter?: string;
  }) => {
    const response = await apiClient.post<{
      message: string;
      data: any;
    }>("/applications", payload);
    return response.data;
  },

  getMyApplications: async () => {
    const response = await apiClient.get<{
      message: string;
      data: { applications: any[] };
    }>("/applications/me");
    return response.data;
  },

  getApplicationById: async (id: string) => {
    const response = await apiClient.get<{
      message: string;
      data: { application: any };
    }>(`/applications/${id}`);
    return response.data;
  },

  getApplicationHistory: async (id: string) => {
    const response = await apiClient.get<{
      message: string;
      data: { histories: any[] };
    }>(`/applications/${id}/history`);
    return response.data;
  },

  withdrawApplication: async (id: string, reason: string) => {
    const response = await apiClient.post<{
      message: string;
      data: any;
    }>(`/applications/${id}/withdraw`, { reason });
    return response.data;
  },


  // 3. Quản lý Profile cá nhân
  getProfile: async () => {
    const response = await apiClient.get<{
      message: string;
      data: {
        candidate: {
          profile: CandidateProfileData;
          educations: CandidateEducation[];
          experiences: CandidateExperience[];
          skills: CandidateSkill[];
        };
      };
    }>("/candidates/me");
    return response.data;
  },

  updateProfile: async (payload: Partial<CandidateProfileData>) => {
    const response = await apiClient.patch<{
      message: string;
      data: { candidate: any };
    }>("/candidates/me", payload);
    return response.data;
  },

  // 4. Quản lý Học vấn
  addEducation: async (payload: Omit<CandidateEducation, "educationId">) => {
    const response = await apiClient.post<{
      message: string;
      data: { education: CandidateEducation };
    }>("/candidates/educations", payload);
    return response.data;
  },

  updateEducation: async (id: string, payload: Partial<Omit<CandidateEducation, "educationId">>) => {
    const response = await apiClient.patch<{
      message: string;
      data: { education: CandidateEducation };
    }>(`/candidates/educations/${id}`, payload);
    return response.data;
  },

  deleteEducation: async (id: string) => {
    const response = await apiClient.delete<{
      message: string;
      data: null;
    }>(`/candidates/educations/${id}`);
    return response.data;
  },

  // 5. Quản lý Kinh nghiệm
  addExperience: async (payload: Omit<CandidateExperience, "experienceId">) => {
    const response = await apiClient.post<{
      message: string;
      data: { experience: CandidateExperience };
    }>("/candidates/experiences", payload);
    return response.data;
  },

  updateExperience: async (id: string, payload: Partial<Omit<CandidateExperience, "experienceId">>) => {
    const response = await apiClient.patch<{
      message: string;
      data: { experience: CandidateExperience };
    }>(`/candidates/experiences/${id}`, payload);
    return response.data;
  },

  deleteExperience: async (id: string) => {
    const response = await apiClient.delete<{
      message: string;
      data: null;
    }>(`/candidates/experiences/${id}`);
    return response.data;
  },

  // 6. Quản lý Kỹ năng
  addSkill: async (payload: { skillId: number; skillLevel: number; yearsOfExperience?: number }) => {
    const response = await apiClient.post<{
      message: string;
      data: any;
    }>("/candidates/skills", payload);
    return response.data;
  },

  deleteSkill: async (id: number) => {
    const response = await apiClient.delete<{
      message: string;
      data: null;
    }>(`/candidates/skills/${id}`);
    return response.data;
  },

  // 7. Quản lý Việc làm đã lưu (Job Bookmarks)
  getBookmarkedJobs: async (params?: {
    page?: number;
    pageSize?: number;
    availability?: "ALL" | "AVAILABLE" | "UNAVAILABLE";
  }) => {
    const response = await apiClient.get<{
      message: string;
      data: {
        items: {
          id: string;
          savedAt: string;
          job: {
            id: string;
            title: string | null;
            status: number | null;
            salaryMin: number | null;
            salaryMax: number | null;
            negotiableSalary: boolean;
            employmentType: number | null;
            workMode: number | null;
            locationText: string | null;
            expiredAt: string | null;
            isAvailable: boolean;
            isExpired: boolean;
            isClosed: boolean;
            isDeleted: boolean;
          };
          company: {
            id: string | null;
            name: string | null;
            logoUrl: string | null;
            slug: string | null;
          };
        }[];
        pagination: {
          page: number;
          pageSize: number;
          total: number;
          totalPages: number;
        };
      };
    }>("/candidate/bookmarked-jobs", { params });
    return response.data;
  },

  getBookmarkedJobIds: async () => {
    const response = await apiClient.get<{
      message: string;
      data: {
        ids: string[];
      };
    }>("/candidate/bookmarked-jobs/ids");
    return response.data;
  },

  saveJobBookmark: async (jobPostId: string) => {
    const response = await apiClient.post<{
      message: string;
      data: { saved: boolean };
    }>(`/candidate/jobs/${jobPostId}/bookmark`);
    return response.data;
  },

  removeJobBookmark: async (jobPostId: string) => {
    const response = await apiClient.delete<{
      message: string;
      data: { removed: boolean };
    }>(`/candidate/jobs/${jobPostId}/bookmark`);
    return response.data;
  },
};

