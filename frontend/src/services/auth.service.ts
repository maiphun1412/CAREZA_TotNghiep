import { apiClient } from "./api-client";
import type { User, CompanyMember } from "@/types/auth";
import { RoleCode } from "@/enums/role.enum";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  confirmPassword?: string;
  fullName: string;
  phoneNumber?: string;
  accountType: "CANDIDATE" | "COMPANY";
  companyName?: string;
  taxCode?: string;
}

export function normalizeUser(rawUser: any): User {
  if (!rawUser) return rawUser;

  // Chuẩn hóa danh sách roles
  let roles: RoleCode[] = [];
  if (Array.isArray(rawUser.roles) && rawUser.roles.length > 0) {
    roles = rawUser.roles.map((r: string) => {
      const upper = String(r).toUpperCase();
      if (upper === "EMPLOYER" || upper === "OWNER") return RoleCode.COMPANY_OWNER;
      return upper as RoleCode;
    });
  } else if (rawUser.account_type) {
    const accType = String(rawUser.account_type).toLowerCase();
    if (accType === "admin") roles = [RoleCode.ADMIN];
    else if (accType === "employer") roles = [RoleCode.COMPANY_OWNER];
    else roles = [RoleCode.CANDIDATE];
  } else {
    roles = [RoleCode.CANDIDATE];
  }

  const fullName = rawUser.full_name || rawUser.fullName || rawUser.name || "";
  const phone = rawUser.phone || rawUser.phoneNumber || null;
  const avatarUrl = rawUser.avatar_url || rawUser.avatarUrl || null;

  return {
    id: String(rawUser.id),
    email: rawUser.email,
    fullName: fullName,
    phoneNumber: phone,
    avatarUrl: avatarUrl,
    accountStatus: rawUser.is_active ? 1 : (rawUser.accountStatus || 0),
    emailVerifiedAt: rawUser.email_verified_at || rawUser.emailVerifiedAt || null,
    lastLoginAt: rawUser.last_login_at || rawUser.lastLoginAt || null,
    createdAt: rawUser.created_at || rawUser.createdAt || null,
    roles: roles,
    // Giữ tương thích ngược với các trường snake_case
    ...rawUser,
    full_name: fullName,
    phone: phone,
    avatar_url: avatarUrl,
  } as User;
}

export function normalizeCompany(rawCompany: any): CompanyMember | null {
  if (!rawCompany) return null;
  return {
    companyId: String(rawCompany.id || rawCompany.companyId || ""),
    companyName: rawCompany.name || rawCompany.companyName || "",
    memberRole: rawCompany.role === "owner" ? 1 : (rawCompany.memberRole || 2),
    branchAccessMode: rawCompany.branchAccessMode || "ALL",
    assignedBranches: rawCompany.assignedBranches || [],
  };
}

export const authService = {
  login: async (payload: LoginPayload) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: {
        user: any;
        tokens: {
          access_token: string;
          refresh_token: string;
          token_type: string;
          expires_in: number;
        };
      };
    }>("/auth/login/", {
      email: payload.email.trim(),
      password: payload.password,
    });

    const resData = response.data?.data;
    if (resData?.tokens) {
      if (typeof window !== "undefined") {
        localStorage.setItem("careza_access_token", resData.tokens.access_token);
        localStorage.setItem("careza_refresh_token", resData.tokens.refresh_token);
        localStorage.setItem("access_token", resData.tokens.access_token);
        localStorage.setItem("refresh_token", resData.tokens.refresh_token);
        document.cookie = `careza_logged_in=true; path=/; max-age=2592000; SameSite=Lax`;
        document.cookie = `careza_access_token=${resData.tokens.access_token}; path=/; max-age=2592000; SameSite=Lax`;
      }
    }

    const user = normalizeUser(resData?.user);
    const company = normalizeCompany(resData?.user?.company);

    return {
      message: response.data?.message || "Đăng nhập thành công",
      data: {
        user,
        company,
        tokens: resData?.tokens,
      },
    };
  },

  register: async (payload: RegisterPayload) => {
    const accType = payload.accountType === "COMPANY" ? "employer" : "candidate";
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: {
        user: any;
        tokens: {
          access_token: string;
          refresh_token: string;
          token_type: string;
          expires_in: number;
        };
      };
    }>("/auth/register/", {
      email: payload.email.trim(),
      password: payload.password,
      full_name: payload.fullName.trim(),
      phone: payload.phoneNumber ? payload.phoneNumber.trim() : "",
      account_type: accType,
      company_name: payload.companyName ? payload.companyName.trim() : undefined,
    });

    const resData = response.data?.data;
    if (resData?.tokens) {
      if (typeof window !== "undefined") {
        localStorage.setItem("careza_access_token", resData.tokens.access_token);
        localStorage.setItem("careza_refresh_token", resData.tokens.refresh_token);
        localStorage.setItem("access_token", resData.tokens.access_token);
        localStorage.setItem("refresh_token", resData.tokens.refresh_token);
        document.cookie = `careza_logged_in=true; path=/; max-age=2592000; SameSite=Lax`;
        document.cookie = `careza_access_token=${resData.tokens.access_token}; path=/; max-age=2592000; SameSite=Lax`;
      }
    }

    const user = normalizeUser(resData?.user);
    const company = normalizeCompany(resData?.user?.company);

    return {
      message: response.data?.message || "Đăng ký tài khoản thành công",
      data: {
        user,
        company,
        tokens: resData?.tokens,
      },
    };
  },

  logout: async () => {
    try {
      const refreshToken =
        typeof window !== "undefined"
          ? localStorage.getItem("careza_refresh_token") || localStorage.getItem("refresh_token")
          : null;

      await apiClient.post("/auth/logout/", {
        refresh_token: refreshToken,
      });
    } catch {
      // Bỏ qua lỗi server khi logout để luôn xóa session phía client
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("careza_access_token");
        localStorage.removeItem("careza_refresh_token");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("careza-auth-storage");
        document.cookie = `careza_logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        document.cookie = `careza_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      }
    }

    return {
      message: "Đăng xuất thành công",
      data: null,
    };
  },

  getMe: async () => {
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: {
        user: any;
      };
    }>("/auth/me/");

    const rawUser = response.data?.data?.user;
    const user = normalizeUser(rawUser);
    const company = normalizeCompany(rawUser?.company);

    return {
      message: response.data?.message || "Success",
      data: {
        user,
        company,
      },
    };
  },

  forgotPassword: async (email: string) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: any;
    }>("/auth/forgot-password/", {
      email: email.trim(),
    });

    return {
      message: response.data?.message || "Yêu cầu đặt lại mật khẩu đã được gửi đến email",
      data: response.data?.data,
    };
  },

  resetPassword: async (token: string, password: string) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: any;
    }>("/auth/reset-password/", {
      token: token.trim(),
      password,
    });

    return {
      message: response.data?.message || "Đặt lại mật khẩu thành công",
      data: response.data?.data,
    };
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: any;
    }>("/auth/change-password/", {
      old_password: oldPassword,
      new_password: newPassword,
    });

    return {
      message: response.data?.message || "Đổi mật khẩu thành công",
      data: response.data?.data,
    };
  },
};

