import { apiClient } from "./api-client";

export const employerService = {
  // 1. Dashboard & Thống kê
  getDashboard: async () => {
    const response = await apiClient.get<{
      success: boolean;
      data: any;
    }>("/companies/me/dashboard/");
    return response.data;
  },

  // 2. Thông tin doanh nghiệp
  getCompanyProfile: async () => {
    const response = await apiClient.get<{
      success: boolean;
      data: { company: any };
    }>("/companies/me/");
    return response.data;
  },

  updateCompanyProfile: async (data: any) => {
    const response = await apiClient.patch<{
      success: boolean;
      message: string;
      data: { company: any };
    }>("/companies/me/", data);
    return response.data;
  },

  // 3. Chi nhánh
  getBranches: async () => {
    const response = await apiClient.get<{
      success: boolean;
      data: { branches: any[] };
    }>("/companies/me/branches/");
    return response.data;
  },

  createBranch: async (data: any) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: { branch: any };
    }>("/companies/me/branches/", data);
    return response.data;
  },

  updateBranch: async (id: string | number, data: any) => {
    const response = await apiClient.patch<{
      success: boolean;
      message: string;
      data: { branch: any };
    }>(`/companies/me/branches/${id}/`, data);
    return response.data;
  },

  deleteBranch: async (id: string | number) => {
    const response = await apiClient.delete<{
      success: boolean;
      message: string;
      data: null;
    }>(`/companies/me/branches/${id}/`);
    return response.data;
  },

  // 4. Quản lý thành viên
  getMembers: async () => {
    const response = await apiClient.get<{
      success: boolean;
      data: { members: any[] };
    }>("/companies/me/members/");
    return response.data;
  },

  inviteMember: async (data: { email: string; role?: string; assigned_branches?: number[] }) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: { member: any };
    }>("/companies/me/members/", data);
    return response.data;
  },

  updateMember: async (id: string | number, data: any) => {
    const response = await apiClient.patch<{
      success: boolean;
      message: string;
      data: { member: any };
    }>(`/companies/me/members/${id}/`, data);
    return response.data;
  },

  deleteMember: async (id: string | number) => {
    const response = await apiClient.delete<{
      success: boolean;
      message: string;
      data: null;
    }>(`/companies/me/members/${id}/`);
    return response.data;
  },

  // 5. Xác minh doanh nghiệp
  getVerification: async () => {
    const response = await apiClient.get<{
      success: boolean;
      data: any;
    }>("/companies/me/verification/");
    return response.data;
  },

  requestVerification: async (data: any) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: any;
    }>("/companies/me/verification/", data);
    return response.data;
  },

  // 6. Quản lý tin tuyển dụng
  getJobs: async (params?: { page?: number; page_size?: number; status?: string; search?: string }) => {
    const response = await apiClient.get<{
      success: boolean;
      data: {
        items: any[];
        pagination: any;
      };
    }>("/companies/me/jobs/", { params });
    return response.data;
  },

  getJobDetail: async (id: string | number) => {
    const response = await apiClient.get<{
      success: boolean;
      data: { job: any };
    }>(`/companies/me/jobs/${id}/`);
    return response.data;
  },

  createJob: async (data: any) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: { job: any };
    }>("/companies/me/jobs/", data);
    return response.data;
  },

  updateJob: async (id: string | number, data: any) => {
    const response = await apiClient.patch<{
      success: boolean;
      message: string;
      data: { job: any };
    }>(`/companies/me/jobs/${id}/`, data);
    return response.data;
  },

  deleteJob: async (id: string | number) => {
    const response = await apiClient.delete<{
      success: boolean;
      message: string;
      data: null;
    }>(`/companies/me/jobs/${id}/`);
    return response.data;
  },

  // 7. Quản lý Hồ sơ ứng tuyển & Pipeline
  createManualApplication: async (data: FormData | Record<string, any>) => {
    const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: any;
    }>("/companies/me/applications/", data, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    return response.data;
  },

  getApplications: async (params?: { jobPostId?: string; jobId?: string; branchId?: string; stage?: string; page_size?: number; search?: string }) => {
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: { applications: any[] };
    }>("/companies/me/applications/", { params });
    return response.data;
  },

  getApplicationById: async (id: string | number) => {
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: { application: any };
    }>(`/companies/me/applications/${id}/`);
    return response.data;
  },

  changeStage: async (id: string | number, stage: any, note?: string) => {
    const response = await apiClient.patch<{
      success: boolean;
      message: string;
      data: { application: any };
    }>(`/companies/me/applications/${id}/stage/`, { stage, note });
    return response.data;
  },

  rejectApplication: async (id: string | number, reason?: string) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: { application: any };
    }>(`/companies/me/applications/${id}/reject/`, { reason });
    return response.data;
  },

  markAsHired: async (id: string | number) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: any;
    }>(`/companies/me/applications/${id}/hire/`);
    return response.data;
  },

  // 8. Lịch phỏng vấn
  getInterviews: async (params?: any) => {
    const response = await apiClient.get<{
      success: boolean;
      data: { interviews: any[] };
    }>("/companies/me/interviews/", { params });
    return response.data;
  },

  createInterview: async (data: any) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: { interview: any };
    }>("/companies/me/interviews/", data);
    return response.data;
  },

  updateInterview: async (id: string | number, data: any) => {
    const response = await apiClient.patch<{
      success: boolean;
      message: string;
      data: { interview: any };
    }>(`/companies/me/interviews/${id}/`, data);
    return response.data;
  },

  cancelInterview: async (id: string | number, reason?: string) => {
    const response = await apiClient.delete<{
      success: boolean;
      message: string;
      data: any;
    }>(`/companies/me/interviews/${id}/`, { data: { reason } });
    return response.data;
  },

  addScorecard: async (data: {
    application_id: number | string;
    technical_score?: number;
    communication_score?: number;
    culture_score?: number;
    notes?: string;
  }) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: any;
    }>("/companies/me/scorecards/", data);
    return response.data;
  },

  // 9. Bài test & Đánh giá
  getTests: async () => {
    const response = await apiClient.get<{
      success: boolean;
      data: { tests: any[] };
    }>("/companies/me/tests/");
    return response.data;
  },

  getTestDetail: async (testId: string | number) => {
    const response = await apiClient.get<{
      success: boolean;
      data: { test: any };
    }>(`/companies/me/tests/${testId}/`);
    return response.data;
  },

  createTest: async (data: any) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: { test: any };
    }>("/companies/me/tests/", data);
    return response.data;
  },

  updateTest: async (testId: string | number, data: any) => {
    const response = await apiClient.put<{
      success: boolean;
      message: string;
      data: { test: any };
    }>(`/companies/me/tests/${testId}/`, data);
    return response.data;
  },

  deleteTest: async (testId: string | number) => {
    const response = await apiClient.delete<{
      success: boolean;
      message: string;
    }>(`/companies/me/tests/${testId}/`);
    return response.data;
  },

  assignTest: async (
    testId: string | number,
    data: {
      application_ids?: number[];
      application_id?: number;
      job_id?: number | null;
      deadline?: string | null;
    }
  ) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: any;
    }>(`/companies/me/tests/${testId}/assign/`, data);
    return response.data;
  },

  getTestAttempts: async (testId: string | number) => {
    const response = await apiClient.get<{
      success: boolean;
      data: { attempts: any[] };
    }>(`/companies/me/tests/${testId}/attempts/`);
    return response.data;
  },

  gradeTestAttempt: async (attemptId: string | number, data: { score: number; feedback?: string }) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: any;
    }>(`/companies/me/test-attempts/${attemptId}/grade/`, data);
    return response.data;
  },

  // 10. Talent Pool
  getTalentPools: async () => {
    const response = await apiClient.get<{
      success: boolean;
      data: { pools: any[] };
    }>("/companies/me/talent-pools/");
    return response.data;
  },

  createTalentPool: async (data: { name: string; description?: string }) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: { pool: any };
    }>("/companies/me/talent-pools/", data);
    return response.data;
  },

  addCandidateToPool: async (poolId: string | number, candidateId: string | number) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: any;
    }>(`/companies/me/talent-pools/${poolId}/candidates/`, { candidate_id: candidateId });
    return response.data;
  },

  removeCandidateFromPool: async (poolId: string | number, candidateId: string | number) => {
    const response = await apiClient.delete<{
      success: boolean;
      message: string;
      data: any;
    }>(`/companies/me/talent-pools/${poolId}/candidates/${candidateId}/`);
    return response.data;
  },

  // 11. Nhật ký hoạt động (Activities)
  getActivities: async () => {
    const response = await apiClient.get<{
      success: boolean;
      data: { activities: any[] };
    }>("/companies/me/activities/");
    return response.data;
  },

  // 12. Offer Tuyển dụng
  getOffers: async (params?: any) => {
    const response = await apiClient.get<{
      success: boolean;
      data: { offers: any[]; total?: number };
    }>("/companies/me/offers/", { params });
    return response.data;
  },

  getOfferDetail: async (id: string | number) => {
    const response = await apiClient.get<{
      success: boolean;
      data: { offer: any };
    }>(`/companies/me/offers/${id}/`);
    return response.data;
  },

  createOffer: async (data: any) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: { offer: any };
    }>("/companies/me/offers/", data);
    return response.data;
  },

  updateOffer: async (id: string | number, data: any) => {
    const response = await apiClient.patch<{
      success: boolean;
      message: string;
      data: { offer: any };
    }>(`/companies/me/offers/${id}/`, data);
    return response.data;
  },

  sendOffer: async (id: string | number) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: any;
    }>(`/companies/me/offers/${id}/send/`);
    return response.data;
  },

  cancelOffer: async (id: string | number, reason?: string) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: any;
    }>(`/companies/me/offers/${id}/cancel/`, { reason });
    return response.data;
  },
};

