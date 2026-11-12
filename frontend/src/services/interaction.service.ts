import { apiClient } from "./api-client";


// =========================================================================
// INTERACTION & MESSAGING INTERFACES
// =========================================================================

export interface ConversationPartner {
  id: number;
  type: "company" | "candidate";
  name: string;
  email?: string;
  avatar?: string;
}

export interface ConversationItem {
  id: number;
  firebase_thread_id?: string;
  partner: ConversationPartner;
  last_message_at?: string;
  created_at?: string;
  unreadCount?: number;
  lastMessage?: string;
}

export interface NotificationItemApi {
  id: number;
  type: string;
  title: string;
  content: string;
  data?: any;
  is_read: boolean;
  created_at: string;
}

export interface SavedJobItem {
  id: number;
  job: {
    id: number;
    title: string;
    company: {
      id: number;
      name: string;
      logo_url?: string;
      location?: string;
    };
    salary_min?: number;
    salary_max?: number;
    salary_currency?: string;
    location?: string;
    work_type?: string;
    deadline?: string;
  };
  saved_at: string;
}

export interface CompanyReviewItem {
  id: number;
  company_id: number;
  rating: number;
  title: string;
  pros?: string;
  cons?: string;
  advice?: string;
  is_anonymous: boolean;
  is_verified?: boolean;
  likes_count?: number;
  created_at: string;
}

export interface ReportItem {
  id: number;
  report_type: string;
  target_id: number;
  reason: string;
  description?: string;
  status: string;
  created_at: string;
}

export interface JobAlertItem {
  id: number;
  title: string;
  keyword?: string;
  industry_id?: number;
  location?: string;
  min_salary?: number;
  frequency: "daily" | "weekly" | "instant";
  is_active: boolean;
  last_sent_at?: string;
  created_at: string;
}

// =========================================================================
// INTERACTION SERVICE
// =========================================================================

export const interactionService = {
  // 1. Hội thoại & Nhắn tin (Conversations)
  async getConversations(keyword?: string): Promise<ConversationItem[]> {
    const params = keyword ? { keyword } : {};
    const res = await apiClient.get<{ success: boolean; data: { conversations: ConversationItem[] } }>(
      "/interaction/conversations/",
      { params }
    );
    return res.data?.data?.conversations || [];
  },

  async createConversation(partnerId: number, partnerType: "company" | "candidate" = "company"): Promise<any> {
    const res = await apiClient.post<{ success: boolean; data: any }>(
      "/interaction/conversations/",
      {
        partner_id: partnerId,
        partner_type: partnerType,
      }
    );
    return res.data?.data;
  },

  async getConversationDetail(id: number): Promise<any> {
    const res = await apiClient.get<{ success: boolean; data: any }>(
      `/interaction/conversations/${id}/`
    );
    return res.data?.data;
  },

  async touchConversation(id: number): Promise<any> {
    const res = await apiClient.post<{ success: boolean; data: any }>(
      `/interaction/conversations/${id}/touch/`
    );
    return res.data?.data;
  },

  // 2. Thông báo (Notifications)
  async getNotifications(params?: {
    type?: string;
    is_read?: boolean;
    page?: number;
    page_size?: number;
  }): Promise<{ notifications: NotificationItemApi[]; total: number; unread_count: number }> {
    const res = await apiClient.get<{
      success: boolean;
      data: { notifications: NotificationItemApi[]; total: number; unread_count: number };
    }>("/interaction/notifications/", { params });
    return (
      res.data?.data || {
        notifications: [],
        total: 0,
        unread_count: 0,
      }
    );
  },

  async markNotificationRead(id: number, isRead: boolean = true): Promise<any> {
    const res = await apiClient.patch<{ success: boolean; data: any }>(
      `/interaction/notifications/${id}/read/`,
      { is_read: isRead }
    );
    return res.data?.data;
  },

  async markAllNotificationsRead(): Promise<any> {
    const res = await apiClient.post<{ success: boolean; message: string }>(
      "/interaction/notifications/read-all/"
    );
    return res.data;
  },

  async deleteNotification(id: number): Promise<any> {
    const res = await apiClient.delete<{ success: boolean; message: string }>(
      `/interaction/notifications/${id}/`
    );
    return res.data;
  },

  // 3. Việc làm đã lưu (Saved Jobs)
  async getSavedJobs(page: number = 1, pageSize: number = 10): Promise<{ saved_jobs: SavedJobItem[]; total: number }> {
    const res = await apiClient.get<{ success: boolean; data: { saved_jobs: SavedJobItem[]; total: number } }>(
      "/interaction/saved-jobs/",
      { params: { page, page_size: pageSize } }
    );
    return res.data?.data || { saved_jobs: [], total: 0 };
  },

  async getSavedJobIds(): Promise<number[]> {
    const res = await apiClient.get<{ success: boolean; data: { saved_job_ids: number[] } }>(
      "/interaction/saved-jobs/ids/"
    );
    return res.data?.data?.saved_job_ids || [];
  },

  async saveJob(jobId: number): Promise<any> {
    const res = await apiClient.post<{ success: boolean; data: any }>(
      "/interaction/saved-jobs/",
      { job_id: jobId }
    );
    return res.data?.data;
  },

  async unsaveJob(jobId: number): Promise<any> {
    const res = await apiClient.delete<{ success: boolean; data: any }>(
      `/interaction/saved-jobs/${jobId}/`
    );
    return res.data?.data;
  },

  async checkJobSaved(jobId: number): Promise<{ is_saved: boolean }> {
    const res = await apiClient.get<{ success: boolean; data: { is_saved: boolean } }>(
      `/interaction/saved-jobs/${jobId}/check/`
    );
    return res.data?.data || { is_saved: false };
  },

  // 4. Theo dõi Doanh nghiệp (Company Follows)
  async getFollowedCompanies(page: number = 1, pageSize: number = 10): Promise<any> {
    const res = await apiClient.get<{ success: boolean; data: any }>(
      "/interaction/company-follows/",
      { params: { page, page_size: pageSize } }
    );
    return res.data?.data;
  },

  async followCompany(companyId: number): Promise<any> {
    const res = await apiClient.post<{ success: boolean; data: any }>(
      `/interaction/company-follows/${companyId}/`
    );
    return res.data?.data;
  },

  async unfollowCompany(companyId: number): Promise<any> {
    const res = await apiClient.delete<{ success: boolean; data: any }>(
      `/interaction/company-follows/${companyId}/`
    );
    return res.data?.data;
  },

  async checkCompanyFollowed(companyId: number): Promise<{ is_following: boolean }> {
    const res = await apiClient.get<{ success: boolean; data: { is_following: boolean } }>(
      `/interaction/company-follows/${companyId}/check/`
    );
    return res.data?.data || { is_following: false };
  },

  // 5. Đánh giá Doanh nghiệp (Reviews)
  async getCompanyReviews(companyId: number, page: number = 1, pageSize: number = 10): Promise<any> {
    const res = await apiClient.get<{ success: boolean; data: any }>(
      "/interaction/company-reviews/",
      { params: { company_id: companyId, page, page_size: pageSize } }
    );
    return res.data?.data;
  },

  async getMyReviews(page: number = 1, pageSize: number = 10): Promise<any> {
    const res = await apiClient.get<{ success: boolean; data: any }>(
      "/interaction/company-reviews/my-reviews/",
      { params: { page, page_size: pageSize } }
    );
    return res.data?.data;
  },

  async submitReview(data: {
    company: number;
    rating: number;
    title: string;
    pros?: string;
    cons?: string;
    advice?: string;
    is_anonymous?: boolean;
  }): Promise<any> {
    const res = await apiClient.post<{ success: boolean; data: any }>(
      "/interaction/company-reviews/",
      data
    );
    return res.data?.data;
  },

  async updateReview(id: number, data: Partial<any>): Promise<any> {
    const res = await apiClient.put<{ success: boolean; data: any }>(
      `/interaction/company-reviews/${id}/`,
      data
    );
    return res.data?.data;
  },

  async deleteReview(id: number): Promise<any> {
    const res = await apiClient.delete<{ success: boolean; message: string }>(
      `/interaction/company-reviews/${id}/`
    );
    return res.data;
  },

  // 6. Báo cáo Vi phạm (Reports)
  async getMyReports(page: number = 1, pageSize: number = 10): Promise<any> {
    const res = await apiClient.get<{ success: boolean; data: any }>(
      "/interaction/reports/",
      { params: { page, page_size: pageSize } }
    );
    return res.data?.data;
  },

  async submitReport(data: {
    report_type: "job" | "company" | "user" | "review";
    target_id: number;
    reason: string;
    description?: string;
  }): Promise<any> {
    const res = await apiClient.post<{ success: boolean; data: any }>(
      "/interaction/reports/",
      data
    );
    return res.data?.data;
  },

  // 7. Lịch sử Tìm kiếm (Search History)
  async getSearchHistory(limit: number = 10): Promise<any[]> {
    const res = await apiClient.get<{ success: boolean; data: { history: any[] } }>(
      "/interaction/search-history/",
      { params: { limit } }
    );
    return res.data?.data?.history || [];
  },

  async addSearchHistory(keyword: string, filters?: any): Promise<any> {
    const res = await apiClient.post<{ success: boolean; data: any }>(
      "/interaction/search-history/",
      { keyword, filters }
    );
    return res.data?.data;
  },

  async clearSearchHistory(): Promise<any> {
    const res = await apiClient.delete<{ success: boolean; message: string }>(
      "/interaction/search-history/clear/"
    );
    return res.data;
  },

  // 8. So sánh Việc làm (Job Comparisons)
  async getJobComparisons(): Promise<any[]> {
    const res = await apiClient.get<{ success: boolean; data: { comparisons: any[] } }>(
      "/interaction/job-comparisons/"
    );
    return res.data?.data?.comparisons || [];
  },

  async addJobComparison(jobId: number): Promise<any> {
    const res = await apiClient.post<{ success: boolean; data: any }>(
      `/interaction/job-comparisons/${jobId}/`
    );
    return res.data?.data;
  },

  async removeJobComparison(jobId: number): Promise<any> {
    const res = await apiClient.delete<{ success: boolean; message: string }>(
      `/interaction/job-comparisons/${jobId}/`
    );
    return res.data;
  },

  async clearJobComparisons(): Promise<any> {
    const res = await apiClient.delete<{ success: boolean; message: string }>(
      "/interaction/job-comparisons/clear/"
    );
    return res.data;
  },

  // 9. Job Alerts
  async getJobAlerts(): Promise<JobAlertItem[]> {
    const res = await apiClient.get<{ success: boolean; data: { job_alerts: JobAlertItem[] } }>(
      "/interaction/job-alerts/"
    );
    return res.data?.data?.job_alerts || [];
  },

  async createJobAlert(data: {
    title: string;
    keyword?: string;
    industry_id?: number;
    location?: string;
    min_salary?: number;
    frequency?: "daily" | "weekly" | "instant";
  }): Promise<JobAlertItem> {
    const res = await apiClient.post<{ success: boolean; data: JobAlertItem }>(
      "/interaction/job-alerts/",
      data
    );
    return res.data?.data;
  },

  async deleteJobAlert(id: number): Promise<any> {
    const res = await apiClient.delete<{ success: boolean; message: string }>(
      `/interaction/job-alerts/${id}/`
    );
    return res.data;
  },

  async triggerJobAlert(id: number): Promise<any> {
    const res = await apiClient.post<{ success: boolean; data: any }>(
      `/interaction/job-alerts/${id}/trigger/`
    );
    return res.data?.data;
  },
};
