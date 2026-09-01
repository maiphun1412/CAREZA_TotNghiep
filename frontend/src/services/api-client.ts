import { mockJobs } from "@/mocks/jobs";
import { mockCompanies } from "@/mocks/companies";
import { mockCandidateProfile, mockCandidateCVs, mockApplications } from "@/mocks/candidate";
import { mockEmployerCandidates, mockEmployerProfile } from "@/mocks/employer";
import { mockDefaultUser } from "@/mocks/auth";

// Mock API Client thay thế hoàn toàn Axios network calls
export const apiClient = {
  get: async <T = any>(url: string, config?: any): Promise<{ data: T; status: number }> => {
    // 1. Jobs endpoints
    if (url.includes("/jobs") || url.includes("/job-posts")) {
      const match = url.match(/\/jobs\/([^\/\?]+)/);
      if (match && match[1]) {
        const jobId = match[1];
        const job = mockJobs.find((j) => j.id === jobId) || mockJobs[0];
        return {
          status: 200,
          data: {
            message: "Success",
            data: { job, ...job, company: mockCompanies[0], branch: mockCompanies[0].branches[0] },
          } as unknown as T,
        };
      }

      return {
        status: 200,
        data: {
          message: "Success",
          data: {
            jobs: mockJobs,
            items: mockJobs,
            pagination: { page: 1, pageSize: 10, total: mockJobs.length, totalPages: 1 },
          },
        } as unknown as T,
      };
    }

    // 2. Companies endpoints
    if (url.includes("/companies") || url.includes("/cong-ty")) {
      const match = url.match(/\/companies\/([^\/\?]+)/);
      if (match && match[1]) {
        const compId = match[1];
        const company = mockCompanies.find((c) => c.id === compId) || mockCompanies[0];
        return {
          status: 200,
          data: {
            message: "Success",
            data: { company, ...company, jobs: mockJobs },
          } as unknown as T,
        };
      }

      return {
        status: 200,
        data: {
          message: "Success",
          data: {
            companies: mockCompanies,
            items: mockCompanies,
            pagination: { page: 1, pageSize: 10, total: mockCompanies.length, totalPages: 1 },
          },
        } as unknown as T,
      };
    }

    // 3. Candidate endpoints
    if (url.includes("/candidate") || url.includes("/candidates")) {
      if (url.includes("/documents")) {
        return {
          status: 200,
          data: {
            message: "Success",
            data: { documents: mockCandidateCVs },
          } as unknown as T,
        };
      }

      if (url.includes("/bookmarked-jobs/ids")) {
        return {
          status: 200,
          data: {
            message: "Success",
            data: { ids: mockJobs.filter((j) => j.isBookmarked).map((j) => j.id) },
          } as unknown as T,
        };
      }

      if (url.includes("/bookmarked-jobs")) {
        const savedItems = mockJobs.map((j) => ({
          id: `saved-${j.id}`,
          savedAt: "28/08/2026",
          job: {
            id: j.id,
            title: j.title,
            status: 1,
            salaryMin: j.salaryMin || 15000000,
            salaryMax: j.salaryMax || 30000000,
            negotiableSalary: false,
            employmentType: j.employmentType,
            workMode: j.workMode,
            locationText: j.location,
            expiredAt: "30/10/2026",
            isAvailable: true,
            isExpired: false,
            isClosed: false,
            isDeleted: false,
          },
          company: {
            id: j.companyId,
            name: j.companyName,
            logoUrl: j.companyLogo,
            slug: j.companyId,
          },
        }));

        return {
          status: 200,
          data: {
            message: "Success",
            data: {
              items: savedItems,
              pagination: { page: 1, pageSize: 10, total: savedItems.length, totalPages: 1 },
            },
          } as unknown as T,
        };
      }

      return {
        status: 200,
        data: {
          message: "Success",
          data: {
            candidate: {
              profile: mockCandidateProfile,
              educations: mockCandidateProfile.educations,
              experiences: mockCandidateProfile.experiences,
              skills: mockCandidateProfile.skills,
            },
          },
        } as unknown as T,
      };
    }

    // 4. Applications endpoints
    if (url.includes("/applications")) {
      return {
        status: 200,
        data: {
          message: "Success",
          data: {
            applications: mockApplications,
            histories: [
              { id: "h1", createdAt: "27/08/2026 09:30", note: "Nộp hồ sơ thành công", stage: 1 },
              { id: "h2", createdAt: "28/08/2026 14:15", note: "Nhà tuyển dụng đã mở xem CV", stage: 2 },
            ],
            application: mockApplications[0],
          },
        } as unknown as T,
      };
    }

    // 5. Auth / Default fallback
    return {
      status: 200,
      data: {
        message: "Success",
        data: { user: mockDefaultUser },
      } as unknown as T,
    };
  },

  post: async <T = any>(url: string, data?: any, config?: any): Promise<{ data: T; status: number }> => {
    return {
      status: 200,
      data: {
        message: "Success",
        data: { ...data, success: true, id: `mock-${Date.now()}`, user: mockDefaultUser },
      } as unknown as T,
    };
  },

  patch: async <T = any>(url: string, data?: any, config?: any): Promise<{ data: T; status: number }> => {
    return {
      status: 200,
      data: {
        message: "Updated successfully",
        data: { ...data, success: true },
      } as unknown as T,
    };
  },

  put: async <T = any>(url: string, data?: any, config?: any): Promise<{ data: T; status: number }> => {
    return {
      status: 200,
      data: {
        message: "Updated successfully",
        data: { ...data, success: true },
      } as unknown as T,
    };
  },

  delete: async <T = any>(url: string, config?: any): Promise<{ data: T; status: number }> => {
    return {
      status: 200,
      data: {
        message: "Deleted successfully",
        data: null,
      } as unknown as T,
    };
  },

  interceptors: {
    request: { use: () => {} },
    response: { use: () => {} },
  },
};
