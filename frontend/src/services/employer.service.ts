import { apiClient } from "./api-client";

export const employerService = {
  // 1. Quản lý Hồ sơ ứng tuyển của Doanh nghiệp
  getApplications: async (params?: { jobPostId?: string; branchId?: string }) => {
    const response = await apiClient.get<{
      message: string;
      data: { applications: any[] };
    }>("/companies/me/applications", { params });
    return response.data;
  },

  getApplicationById: async (id: string) => {
    const response = await apiClient.get<{
      message: string;
      data: { application: any };
    }>(`/companies/me/applications/${id}`);
    return response.data;
  },

  changeStage: async (id: string, stage: number, note?: string) => {
    const response = await apiClient.patch<{
      message: string;
      data: { application: any };
    }>(`/companies/me/applications/${id}/stage`, { stage, note });
    return response.data;
  },

  rejectApplication: async (id: string, reason?: string) => {
    const response = await apiClient.post<{
      message: string;
      data: { application: any };
    }>(`/companies/me/applications/${id}/reject`, { reason });
    return response.data;
  },

  markAsHired: async (id: string) => {
    const response = await apiClient.post<{
      message: string;
      data: any;
    }>(`/companies/me/applications/${id}/hire`);
    return response.data;
  },
};
