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
  avatar_url?: string | null;
  avatarUrl?: string | null;
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
  // 0. Dashboard Thống kê
  getDashboard: async () => {
    const response = await apiClient.get<{
      success: boolean;
      data: {
        stats: {
          cv_count: number;
          applied_count: number;
          saved_jobs_count: number;
          interview_count: number;
          profile_completion: number;
        };
        recent_applications: any[];
      };
    }>("/candidate/dashboard/");
    return response.data;
  },

  // 1. Quản lý CV & Tài liệu
  getDocuments: async (params?: { type?: string; includeVersions?: boolean }) => {
    const response = await apiClient.get<{
      message: string;
      data: { documents: CandidateDocument[] };
    }>("/candidate/documents/", { params });
    return response.data;
  },

  uploadDocument: async (formData: FormData) => {
    const response = await apiClient.post<{
      message: string;
      data: { document: CandidateDocument };
    }>("/candidate/documents/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  deleteDocument: async (id: string | number) => {
    const response = await apiClient.delete<{
      message: string;
      data: null;
    }>(`/candidate/documents/${id}/`);
    return response.data;
  },

  setDefaultCv: async (id: string | number) => {
    const response = await apiClient.post<{
      message: string;
      data: CandidateDocument;
    }>(`/candidate/documents/${id}/default/`);
    return response.data;
  },

  // 1.1 Quản lý CVs (CV Builder & Đánh giá)
  getCvs: async () => {
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: { documents?: any[]; cvs?: any[] };
    }>("/candidates/cvs/");
    return response.data;
  },

  getCvDetail: async (id: string | number) => {
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: { document?: any; cv?: any };
    }>(`/candidates/cvs/${id}/`);
    return response.data;
  },

  createCv: async (payload: {
    title: string;
    file_url?: string | null;
    parsed_data: any;
    status?: string;
    is_primary?: boolean;
  }) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: { document?: any; cv?: any };
    }>("/candidates/cvs/", payload);
    return response.data;
  },

  updateCv: async (
    id: string | number,
    payload: {
      title?: string;
      file_url?: string | null;
      parsed_data?: any;
      status?: string;
      is_primary?: boolean;
    }
  ) => {
    const response = await apiClient.patch<{
      success: boolean;
      message: string;
      data: { document?: any; cv?: any };
    }>(`/candidates/cvs/${id}/`, payload);
    return response.data;
  },

  deleteCv: async (id: string | number) => {
    const response = await apiClient.delete<{
      success: boolean;
      message: string;
      data: null;
    }>(`/candidates/cvs/${id}/`);
    return response.data;
  },

  createCvVersion: async (
    id: string | number,
    payload: { content: any; file_url?: string | null }
  ) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: { version: any };
    }>(`/candidates/documents/${id}/versions/`, payload);
    return response.data;
  },


  // 2. Ứng tuyển
  applyJob: async (payload: {
    job_id?: number | string;
    jobPostId?: number | string;
    cv_id?: number | string;
    cvId?: number | string;
    candidateDocumentId?: number | string;
    cover_letter?: string;
    coverLetter?: string;
  }) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: any;
    }>("/applications/", payload);
    return response.data;
  },

  getMyApplications: async () => {
    const response = await apiClient.get<{
      message: string;
      data: { applications: any[] };
    }>("/applications/me/");
    return response.data;
  },

  getApplicationById: async (id: string) => {
    const response = await apiClient.get<{
      message: string;
      data: { application: any };
    }>(`/applications/${id}/`);
    return response.data;
  },

  getApplicationHistory: async (id: string) => {
    const response = await apiClient.get<{
      message: string;
      data: { histories: any[] };
    }>(`/applications/${id}/history/`);
    return response.data;
  },

  withdrawApplication: async (id: string, reason: string) => {
    const response = await apiClient.post<{
      message: string;
      data: any;
    }>(`/applications/${id}/withdraw/`, { reason });
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
    }>("/candidates/me/");
    return response.data;
  },

  updateProfile: async (payload: Partial<CandidateProfileData>) => {
    const response = await apiClient.patch<{
      message: string;
      data: { candidate: any };
    }>("/candidates/me/", payload);
    return response.data;
  },

  // 4. Quản lý Học vấn
  addEducation: async (payload: Omit<CandidateEducation, "educationId">) => {
    const response = await apiClient.post<{
      message: string;
      data: { education: CandidateEducation };
    }>("/candidates/educations/", payload);
    return response.data;
  },

  updateEducation: async (id: string, payload: Partial<Omit<CandidateEducation, "educationId">>) => {
    const response = await apiClient.patch<{
      message: string;
      data: { education: CandidateEducation };
    }>(`/candidates/educations/${id}/`, payload);
    return response.data;
  },

  deleteEducation: async (id: string) => {
    const response = await apiClient.delete<{
      message: string;
      data: null;
    }>(`/candidates/educations/${id}/`);
    return response.data;
  },

  // 5. Quản lý Kinh nghiệm
  addExperience: async (payload: Omit<CandidateExperience, "experienceId">) => {
    const response = await apiClient.post<{
      message: string;
      data: { experience: CandidateExperience };
    }>("/candidates/experiences/", payload);
    return response.data;
  },

  updateExperience: async (id: string, payload: Partial<Omit<CandidateExperience, "experienceId">>) => {
    const response = await apiClient.patch<{
      message: string;
      data: { experience: CandidateExperience };
    }>(`/candidates/experiences/${id}/`, payload);
    return response.data;
  },

  deleteExperience: async (id: string) => {
    const response = await apiClient.delete<{
      message: string;
      data: null;
    }>(`/candidates/experiences/${id}/`);
    return response.data;
  },

  // 6. Quản lý Kỹ năng
  addSkill: async (payload: { skillId: number; skillLevel: number; yearsOfExperience?: number }) => {
    const response = await apiClient.post<{
      message: string;
      data: any;
    }>("/candidates/skills/", payload);
    return response.data;
  },

  deleteSkill: async (id: number) => {
    const response = await apiClient.delete<{
      message: string;
      data: null;
    }>(`/candidates/skills/${id}/`);
    return response.data;
  },

  // 7. Quản lý Việc làm đã lưu (Job Bookmarks)


  getBookmarkedJobIds: async () => {
    const response = await apiClient.get<{
      message: string;
      data: {
        ids: string[];
      };
    }>("/candidate/bookmarked-jobs/ids/");
    return response.data;
  },


  getBookmarkedJobs: async (params?: { page?: number; pageSize?: number; availability?: string }) => {
    const page = params?.page || 1;
    const page_size = params?.pageSize || 10;
    const response = await apiClient.get<{
      success: boolean;
      data: {
        items: any[];
        total: number;
        pagination?: { total: number; page: number; pageSize: number };
      };
    }>("/candidate/bookmarked-jobs/", {
      params: { page, page_size },
    });

    const rawList = response.data?.data?.items || [];
    const total = response.data?.data?.total || response.data?.data?.pagination?.total || 0;

    const items = rawList.map((item: any) => ({
      id: String(item.id),
      savedAt: item.saved_at,
      job: {
        id: String(item.job?.id || ""),
        title: item.job?.title || "Không có tiêu đề",
        slug: item.job?.slug || null,
        description: item.job?.description || null,
        experienceMin: item.job?.experience_min ?? null,
        skills: Array.isArray(item.job?.skills) ? item.job.skills : [],
        status: item.job?.status ?? 1,
        salaryMin: item.job?.salary_min ?? null,
        salaryMax: item.job?.salary_max ?? null,
        negotiableSalary: !item.job?.salary_min && !item.job?.salary_max,
        employmentType: item.job?.employment_type ?? null,
        workMode: item.job?.work_mode ?? null,
        locationText: item.job?.location || null,
        expiredAt: item.job?.expires_at || null,
        isAvailable: item.job?.is_available ?? true,
        isExpired: item.job?.expires_at ? new Date(item.job.expires_at).getTime() < Date.now() : false,
        isClosed: item.job?.status !== "published",
        isDeleted: false,
      },
      company: {
        id: item.company?.id ? String(item.company.id) : null,
        name: item.company?.name || "Doanh nghiệp",
        logoUrl: item.company?.logo_url || null,
        slug: item.company?.slug || null,
        isVerified: item.company?.is_verified ?? true,
      },
    }));

    return {
      success: true,
      data: {
        items,
        pagination: {
          total,
          page,
          pageSize: page_size,
        },
      },
    };
  },

  saveJobBookmark: async (jobPostId: string | number) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: { saved: boolean };
    }>(`/candidate/jobs/${jobPostId}/bookmark/`);
    return response.data;
  },

  removeJobBookmark: async (jobPostId: string | number) => {
    const response = await apiClient.delete<{
      success: boolean;
      message: string;
      data: { removed: boolean };
    }>(`/candidate/jobs/${jobPostId}/bookmark/`);
    return response.data;
  },


  // 8. Theo dõi doanh nghiệp (Follow Companies)
  followCompany: async (companyId: string | number) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: { following: boolean };
    }>(`/companies/${companyId}/follow/`);
    return response.data;
  },

  unfollowCompany: async (companyId: string | number) => {
    const response = await apiClient.delete<{
      success: boolean;
      message: string;
      data: { following: boolean };
    }>(`/companies/${companyId}/follow/`);
    return response.data;
  },

  getFollowingCompanies: async () => {
    const response = await apiClient.get<{
      success: boolean;
      data: { companies: any[] };
    }>("/companies/following/");
    return response.data;
  },

  // 9. Thông báo ứng viên (Notifications)
  getNotifications: async (params?: { page?: number; isRead?: boolean }) => {
    const response = await apiClient.get<{
      success: boolean;
      data: {
        items: any[];
        pagination: any;
        unread_count: number;
      };
    }>("/notifications/", { params });
    return response.data;
  },

  markNotificationRead: async (id: number | string) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: any;
    }>(`/notifications/${id}/read/`);
    return response.data;
  },

  markAllNotificationsRead: async () => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: any;
    }>("/notifications/read-all/");
    return response.data;
  },

  // 10. Lịch phỏng vấn (Interviews)
  getInterviews: async () => {
    const response = await apiClient.get<{
      success: boolean;
      data: {
        interviews: any[];
      };
    }>("/candidate/interviews/");
    return response.data;
  },

  confirmInterview: async (id: number | string) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: any;
    }>(`/candidate/interviews/${id}/confirm/`);
    return response.data;
  },

  cancelInterview: async (id: number | string, reason?: string) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: any;
    }>(`/candidate/interviews/${id}/cancel/`, { reason });
    return response.data;
  },

  // 9. Lấy danh sách việc làm công khai (dùng cho CV-JD Matching và tìm kiếm)
  getPublicJobs: async (params?: { page?: number; page_size?: number; search?: string }) => {
    const response = await apiClient.get<{
      success: boolean;
      data: {
        items: any[];
        total?: number;
      };
    }>("/jobs/", { params });
    return response.data;
  },

  // 10. Quản lý Thư mời nhận việc (Offers)
  getOffers: async () => {
    const response = await apiClient.get<{
      success: boolean;
      data: { offers: any[] };
    }>("/candidate/offers/");
    return response.data;
  },

  getOfferDetail: async (id: number | string) => {
    const response = await apiClient.get<{
      success: boolean;
      data: { offer: any };
    }>(`/candidate/offers/${id}/`);
    return response.data;
  },

  acceptOffer: async (id: number | string, note?: string) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: any;
    }>(`/candidate/offers/${id}/accept/`, { note });
    return response.data;
  },

  declineOffer: async (id: number | string, reason?: string) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: any;
    }>(`/candidate/offers/${id}/decline/`, { reason });
    return response.data;
  },

  // 11. Bài kiểm tra năng lực (Candidate Assessments & Tests)
  getCandidateTests: async () => {
    const response = await apiClient.get<{
      success: boolean;
      data: { tests: any[] };
    }>("/candidate/tests/");
    return response.data;
  },

  getCandidateTestDetail: async (testId: number | string) => {
    const response = await apiClient.get<{
      success: boolean;
      data: { test: any };
    }>(`/candidate/tests/${testId}/`);
    return response.data;
  },

  startCandidateTest: async (testId: number | string, applicationId?: number | string | null) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: any;
    }>(`/candidate/tests/${testId}/start/`, applicationId ? { application_id: Number(applicationId) } : {});
    return response.data;
  },

  saveCandidateTestAttempt: async (
    attemptId: number | string,
    answers: Array<{ question_id: number | string; answer: string }>
  ) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: any;
    }>(`/candidate/test-attempts/${attemptId}/save/`, { answers });
    return response.data;
  },

  submitCandidateTestAttempt: async (
    attemptId: number | string,
    answers: Array<{ question_id: number | string; answer: string }>,
    autoSubmitted: boolean = false
  ) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: any;
    }>(`/candidate/test-attempts/${attemptId}/submit/`, {
      answers,
      auto_submitted: autoSubmitted,
    });
    return response.data;
  },

  getCandidateTestAttempts: async () => {
    const response = await apiClient.get<{
      success: boolean;
      data: { attempts: any[] };
    }>("/candidate/test-attempts/");
    return response.data;
  },

  getCandidateTestAttemptDetail: async (attemptId: number | string) => {
    const response = await apiClient.get<{
      success: boolean;
      data: { attempt: any };
    }>(`/candidate/test-attempts/${attemptId}/`);
    return response.data;
  },
};



