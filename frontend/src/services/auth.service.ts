import { mockDefaultUser, mockEmployerUser, mockAdminUser } from "@/mocks/auth";
import type { User } from "@/types/auth";

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

export const authService = {
  login: async (payload: LoginPayload) => {
    let user: any = mockDefaultUser;
    const emailLower = payload.email.toLowerCase();

    if (emailLower.includes("admin")) {
      user = mockAdminUser;
    } else if (emailLower.includes("fpt") || emailLower.includes("recruiter") || emailLower.includes("company")) {
      user = mockEmployerUser;
    }

    return {
      message: "Đăng nhập thành công",
      data: { user: user as User },
    };
  },

  register: async (payload: RegisterPayload) => {
    const isEmployer = payload.accountType === "COMPANY";
    const user: any = isEmployer
      ? { ...mockEmployerUser, email: payload.email, fullName: payload.fullName, companyName: payload.companyName }
      : { ...mockDefaultUser, email: payload.email, fullName: payload.fullName };

    return {
      message: "Đăng ký tài khoản thành công",
      data: { user: user as User },
    };
  },

  logout: async () => {
    return {
      message: "Đăng xuất thành công",
      data: null,
    };
  },

  getMe: async () => {
    return {
      message: "Success",
      data: { user: mockDefaultUser as unknown as User },
    };
  },

  verifyEmail: async (_token: string) => {
    return {
      message: "Xác thực email thành công",
      data: null,
    };
  },

  forgotPassword: async (_email: string) => {
    return {
      message: "Yêu cầu đặt lại mật khẩu đã được gửi đến email",
      data: null,
    };
  },

  resetPassword: async (_token: string, _password: string) => {
    return {
      message: "Đặt lại mật khẩu thành công",
      data: null,
    };
  },
};
