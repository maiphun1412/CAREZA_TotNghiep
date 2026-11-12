import { apiClient } from "./api-client";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
}

export interface AdminAuditLogItem {
  id: number;
  actor_id: number | null;
  actor_email: string;
  actor_name: string;
  actor_role?: string;
  action: string;
  entity_type: string;
  entity_id: number | string | null;
  changes: any;
  created_at: string;
}

// ==========================================
// 1. Dashboard Overview
// ==========================================
export interface AdminDashboardSummary {
  total_users: number;
  new_users_this_month: number;
  users_by_type: {
    candidates: number;
    employers: number;
    admins: number;
  };
  total_companies: number;
  verified_companies: number;
  pending_verification_companies: number;
  rejected_companies?: number;
  total_jobs: number;
  active_jobs: number;
  pending_jobs: number;
  closed_jobs?: number;
  total_applications: number;
  applications_this_month: number;
  total_revenue_vnd: number;
  pending_revenue_vnd?: number;
  paid_orders_count?: number;
  pending_orders_count?: number;
  total_ai_tasks?: number;
}

export interface AdminDashboardOverviewResponse {
  summary: AdminDashboardSummary;
  monthly_growth: {
    month: string;
    users: number;
    applications: number;
  }[];
  industry_jobs: {
    id: number;
    name: string;
    count: number;
  }[];
  pending_verifications: {
    id: number;
    company_id: number;
    company_name: string;
    tax_code: string;
    document_url: string | null;
    submitted_at: string;
  }[];
  pending_reports: {
    id: number;
    target_type: string;
    target_id: number;
    target_name?: string;
    reason: string;
    details?: string;
    created_at: string;
  }[];
  reports_summary?: {
    total: number;
    pending: number;
    resolved: number;
    dismissed: number;
    by_target_type: {
      job: number;
      company: number;
      review: number;
      user: number;
      other: number;
    };
    moderation_cases_total: number;
  };
  recent_activities?: {
    id: number;
    actor_id: number | null;
    actor_email: string;
    actor_name: string;
    action: string;
    entity_type: string;
    entity_id: number | null;
    changes: any;
    created_at: string;
  }[];
}

// ==========================================
// 2. Quản lý Người dùng
// ==========================================
export interface AdminUserItem {
  id: number;
  email: string;
  full_name: string | null;
  phone: string | null;
  account_type: string;
  roles: string[];
  avatar_url: string | null;
  is_active: boolean;
  company_id?: number | null;
  company_name?: string | null;
  member_role?: string | null;
  headline?: string;
  location?: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminUserListResponse {
  items: AdminUserItem[];
  summary?: {
    total_users: number;
    candidates_count: number;
    employers_count: number;
    admins_count: number;
    active_count: number;
    locked_count: number;
  };
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

// ==========================================
// 3. Quản lý Doanh nghiệp
// ==========================================
export interface AdminCompanyItem {
  id: number;
  name: string;
  slug: string;
  logo_url: string | null;
  website: string | null;
  description?: string;
  company_size: string | null;
  industry_id?: number | null;
  industry_name?: string;
  location_id?: number | null;
  city?: string;
  address?: string;
  tax_code?: string;
  legal_name?: string;
  document_url?: string | null;
  verification_notes?: string;
  verification_status: string;
  representative?: {
    user_id: number;
    name: string;
    email: string;
    phone: string;
    role: string;
  } | null;
  email?: string;
  phone?: string;
  branches?: {
    id: number;
    name: string;
    address: string;
  }[];
  jobs_count: number;
  active_jobs_count?: number;
  members_count: number;
  created_at: string;
}

export interface AdminCompanyListResponse {
  items: AdminCompanyItem[];
  summary?: {
    total_companies: number;
    verified_count: number;
    pending_count: number;
    rejected_count: number;
  };
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

// ==========================================
// 4. Quản lý Việc làm
// ==========================================
export interface AdminJobItem {
  id: number;
  title: string;
  slug?: string;
  company: {
    id: number | null;
    name: string;
    logo_url?: string | null;
  };
  industry_name?: string;
  location_name?: string;
  work_mode?: string;
  employment_type?: string;
  salary_min: number | null;
  salary_max: number | null;
  status: string;
  applications_count?: number;
  reports_count?: number;
  published_at: string | null;
  created_at: string;
}

export interface AdminJobListResponse {
  items: AdminJobItem[];
  summary?: {
    total_jobs: number;
    published_count: number;
    draft_count: number;
    closed_count: number;
  };
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

// ==========================================
// Service Methods
// ==========================================
export const adminService = {
  // 1. Dashboard
  async getDashboardOverview(): Promise<ApiResponse<{ overview: AdminDashboardOverviewResponse }>> {
    const res = await apiClient.get<ApiResponse<{ overview: AdminDashboardOverviewResponse }>>(
      "/admin/dashboard/"
    );
    return res.data;
  },

  async getDashboard(): Promise<ApiResponse<{ overview: AdminDashboardOverviewResponse }>> {
    return this.getDashboardOverview();
  },

  // 2. Users
  async getUsers(params?: {
    page?: number;
    page_size?: number;
    role?: string;
    account_type?: string;
    search?: string;
    q?: string;
    status?: string;
  }): Promise<ApiResponse<AdminUserListResponse>> {
    const res = await apiClient.get<ApiResponse<AdminUserListResponse>>("/admin/users/", {
      params,
    });
    return res.data;
  },

  async getUserDetail(id: number | string): Promise<ApiResponse<{ user: any }>> {
    const res = await apiClient.get<ApiResponse<{ user: any }>>(`/admin/users/${id}/`);
    return res.data;
  },

  async updateUserStatus(
    id: number | string,
    is_active: boolean,
    reason?: string
  ): Promise<ApiResponse<any>> {
    const res = await apiClient.patch<ApiResponse<any>>(`/admin/users/${id}/status/`, {
      is_active,
      reason: reason || "",
    });
    return res.data;
  },

  async updateUserRoles(id: number | string, roles: string[]): Promise<ApiResponse<any>> {
    const res = await apiClient.patch<ApiResponse<any>>(`/admin/users/${id}/roles/`, { roles });
    return res.data;
  },

  async resetUserPassword(id: number | string, password: string): Promise<ApiResponse<any>> {
    const res = await apiClient.post<ApiResponse<any>>(`/admin/users/${id}/reset-password/`, {
      password,
    });
    return res.data;
  },

  // 3. Companies
  async getCompanies(params?: {
    page?: number;
    page_size?: number;
    status?: string;
    verification_status?: string;
    search?: string;
    q?: string;
  }): Promise<ApiResponse<AdminCompanyListResponse>> {
    const res = await apiClient.get<ApiResponse<AdminCompanyListResponse>>("/admin/companies/", {
      params,
    });
    return res.data;
  },

  async getCompanyDetail(id: number | string): Promise<ApiResponse<{ company: any }>> {
    const res = await apiClient.get<ApiResponse<{ company: any }>>(`/admin/companies/${id}/`);
    return res.data;
  },

  async verifyCompany(
    id: number | string,
    action: "approve" | "reject",
    notes?: string
  ): Promise<ApiResponse<any>> {
    const res = await apiClient.post<ApiResponse<any>>(`/admin/companies/${id}/verify/`, {
      action,
      notes: notes || "",
    });
    return res.data;
  },

  async updateCompanyStatus(id: number | string, is_active: boolean): Promise<ApiResponse<any>> {
    const res = await apiClient.patch<ApiResponse<any>>(`/admin/companies/${id}/status/`, {
      is_active,
    });
    return res.data;
  },

  // 4. Jobs
  async getJobs(params?: {
    page?: number;
    page_size?: number;
    status?: string;
    search?: string;
    q?: string;
    company_id?: number | string;
  }): Promise<ApiResponse<AdminJobListResponse>> {
    const res = await apiClient.get<ApiResponse<AdminJobListResponse>>("/admin/jobs/", {
      params,
    });
    return res.data;
  },

  async getJobDetail(id: number | string): Promise<ApiResponse<{ job: any }>> {
    const res = await apiClient.get<ApiResponse<{ job: any }>>(`/admin/jobs/${id}/`);
    return res.data;
  },

  async moderateJob(
    id: number | string,
    action: "approve" | "reject" | "hide",
    reason?: string
  ): Promise<ApiResponse<any>> {
    const res = await apiClient.post<ApiResponse<any>>(`/admin/jobs/${id}/moderate/`, {
      action,
      reason: reason || "",
    });
    return res.data;
  },

  // 5. Categories
  async getIndustries(): Promise<ApiResponse<{ industries: any[] }>> {
    const res = await apiClient.get<ApiResponse<{ industries: any[] }>>(
      "/admin/categories/industries/"
    );
    return res.data;
  },

  async createIndustry(data: { name: string }): Promise<ApiResponse<any>> {
    const res = await apiClient.post<ApiResponse<any>>("/admin/categories/industries/", data);
    return res.data;
  },

  async deleteIndustry(id: number | string): Promise<ApiResponse<any>> {
    const res = await apiClient.delete<ApiResponse<any>>(`/admin/categories/industries/${id}/`);
    return res.data;
  },

  async getSkills(): Promise<ApiResponse<{ skills: any[] }>> {
    const res = await apiClient.get<ApiResponse<{ skills: any[] }>>("/admin/categories/skills/");
    return res.data;
  },

  async createSkill(data: { name: string; category?: string }): Promise<ApiResponse<any>> {
    const res = await apiClient.post<ApiResponse<any>>("/admin/categories/skills/", data);
    return res.data;
  },

  async deleteSkill(id: number | string): Promise<ApiResponse<any>> {
    const res = await apiClient.delete<ApiResponse<any>>(`/admin/categories/skills/${id}/`);
    return res.data;
  },

  async getLocations(): Promise<ApiResponse<{ locations: any[] }>> {
    const res = await apiClient.get<ApiResponse<{ locations: any[] }>>(
      "/admin/categories/locations/"
    );
    return res.data;
  },

  // 6. Billing & Plans
  async getBillingPlans(): Promise<ApiResponse<{ plans: any[] }>> {
    const res = await apiClient.get<ApiResponse<{ plans: any[] }>>("/admin/billing/plans/");
    return res.data;
  },

  async createBillingPlan(data: any): Promise<ApiResponse<any>> {
    const res = await apiClient.post<ApiResponse<any>>("/admin/billing/plans/", data);
    return res.data;
  },

  async updateBillingPlan(id: number | string, data: any): Promise<ApiResponse<any>> {
    const res = await apiClient.patch<ApiResponse<any>>(`/admin/billing/plans/${id}/`, data);
    return res.data;
  },

  async getBillingOrders(params?: {
    page?: number;
    page_size?: number;
    status?: string;
    search?: string;
    q?: string;
  }): Promise<ApiResponse<any>> {
    const res = await apiClient.get<ApiResponse<any>>("/admin/billing/orders/", { params });
    return res.data;
  },

  async confirmBillingOrder(
    id: number | string,
    data: {
      provider_reference: string;
      amount_vnd: number;
      currency?: string;
      paid_at: string;
      note: string;
      evidence?: string;
    }
  ): Promise<ApiResponse<any>> {
    const res = await apiClient.post<ApiResponse<any>>(`/admin/billing/orders/${id}/confirm/`, data);
    return res.data;
  },

  async getBillingSubscriptions(params?: {
    page?: number;
    page_size?: number;
    status?: string;
  }): Promise<ApiResponse<any>> {
    const res = await apiClient.get<ApiResponse<any>>("/admin/billing/subscriptions/", {
      params,
    });
    return res.data;
  },

  async getBillingCoupons(): Promise<ApiResponse<{ coupons: any[] }>> {
    const res = await apiClient.get<ApiResponse<{ coupons: any[] }>>("/admin/billing/coupons/");
    return res.data;
  },

  async createBillingCoupon(data: any): Promise<ApiResponse<any>> {
    const res = await apiClient.post<ApiResponse<any>>("/admin/billing/coupons/", data);
    return res.data;
  },

  // 7. Reports & Reviews
  async getReports(params?: {
    page?: number;
    page_size?: number;
    status?: string;
    target_type?: string;
    search?: string;
    q?: string;
  }): Promise<ApiResponse<any>> {
    const res = await apiClient.get<ApiResponse<any>>("/admin/reports/", { params });
    return res.data;
  },

  async resolveReport(
    id: number | string,
    data: { action: "resolve" | "dismiss"; note?: string }
  ): Promise<ApiResponse<any>> {
    const res = await apiClient.post<ApiResponse<any>>(`/admin/reports/${id}/resolve/`, data);
    return res.data;
  },

  async getReviews(params?: {
    page?: number;
    page_size?: number;
    status?: string;
    search?: string;
  }): Promise<ApiResponse<any>> {
    const res = await apiClient.get<ApiResponse<any>>("/admin/reviews/", { params });
    return res.data;
  },

  async moderateReview(
    id: number | string,
    action: "approve" | "hide"
  ): Promise<ApiResponse<any>> {
    const res = await apiClient.post<ApiResponse<any>>(`/admin/reviews/${id}/moderate/`, {
      action,
    });
    return res.data;
  },

  async getModerationCases(params?: {
    page?: number;
    page_size?: number;
    target_type?: string;
  }): Promise<ApiResponse<any>> {
    const res = await apiClient.get<ApiResponse<any>>("/admin/moderation-cases/", { params });
    return res.data;
  },

  // 8. System & Audit
  async getRolesAndPermissions(): Promise<ApiResponse<any>> {
    const res = await apiClient.get<ApiResponse<any>>("/admin/system/roles-permissions/");
    return res.data;
  },

  async getSystemSettings(): Promise<ApiResponse<{ settings: any[] }>> {
    const res = await apiClient.get<ApiResponse<{ settings: any[] }>>("/admin/system/settings/");
    return res.data;
  },

  async updateSystemSettings(data: {
    key?: string;
    value?: any;
    description?: string;
    settings?: Record<string, any>;
  }): Promise<ApiResponse<any>> {
    const res = await apiClient.patch<ApiResponse<any>>("/admin/system/settings/", data);
    return res.data;
  },

  async getAuditLogs(params?: {
    page?: number;
    page_size?: number;
    action?: string;
    entity_type?: string;
    actor_id?: number | string;
    search?: string;
    q?: string;
  }): Promise<ApiResponse<any>> {
    const res = await apiClient.get<ApiResponse<any>>("/admin/system/audit-logs/", { params });
    return res.data;
  },

  async getAiUsageStats(): Promise<ApiResponse<any>> {
    const res = await apiClient.get<ApiResponse<any>>("/admin/system/ai-usage/");
    return res.data;
  },

  // 9. Broadcast Notification
  async broadcastNotification(data: {
    title: string;
    content: string;
    target_role?: "all" | "candidate" | "employer";
    user_id?: number | string | null;
  }): Promise<ApiResponse<any>> {
    const res = await apiClient.post<ApiResponse<any>>("/admin/notifications/broadcast/", data);
    return res.data;
  },

  // 10. Knowledge Base (RAG Documents)
  async getKnowledgeDocuments(params?: {
    page?: number;
    page_size?: number;
    search?: string;
    status?: string;
    doc_type?: string;
  }): Promise<ApiResponse<any>> {
    const res = await apiClient.get<ApiResponse<any>>("/ai/knowledge/documents/", { params });
    return res.data;
  },

  async getKnowledgeDocumentDetail(id: number | string): Promise<ApiResponse<any>> {
    const res = await apiClient.get<ApiResponse<any>>(`/ai/knowledge/documents/${id}/`);
    return res.data;
  },

  async createKnowledgeDocument(data: {
    title: string;
    content: string;
    doc_type?: string;
    source_url?: string;
    status?: string;
    chunk_size?: number;
    chunk_overlap?: number;
  }): Promise<ApiResponse<any>> {
    const res = await apiClient.post<ApiResponse<any>>("/ai/knowledge/documents/", data);
    return res.data;
  },

  async updateKnowledgeDocument(
    id: number | string,
    data: {
      title?: string;
      content?: string;
      doc_type?: string;
      source_url?: string;
      chunk_size?: number;
      chunk_overlap?: number;
    }
  ): Promise<ApiResponse<any>> {
    const res = await apiClient.patch<ApiResponse<any>>(`/ai/knowledge/documents/${id}/`, data);
    return res.data;
  },

  async publishKnowledgeDocument(id: number | string): Promise<ApiResponse<any>> {
    const res = await apiClient.post<ApiResponse<any>>(`/ai/knowledge/documents/${id}/publish/`);
    return res.data;
  },

  async unpublishKnowledgeDocument(id: number | string): Promise<ApiResponse<any>> {
    const res = await apiClient.post<ApiResponse<any>>(`/ai/knowledge/documents/${id}/unpublish/`);
    return res.data;
  },

  async deleteKnowledgeDocument(id: number | string): Promise<ApiResponse<any>> {
    const res = await apiClient.delete<ApiResponse<any>>(`/ai/knowledge/documents/${id}/`);
    return res.data;
  },
};
