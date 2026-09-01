import { RoleCode } from "@/enums/role.enum";

export interface MockUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  role: RoleCode;
  phone?: string;
  companyName?: string;
}

export const mockDefaultUser: MockUser = {
  id: "user-candidate-1",
  email: "candidate@careza.vn",
  fullName: "Nguyễn Văn Hùng",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80",
  role: RoleCode.CANDIDATE,
  phone: "0901 234 567",
};

export const mockEmployerUser: MockUser = {
  id: "user-employer-1",
  email: "recruiter@fpt.com",
  fullName: "Trần Thị Mai Phương",
  avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80",
  role: RoleCode.COMPANY_OWNER,
  companyName: "FPT Software",
  phone: "0988 765 432",
};

export const mockAdminUser: MockUser = {
  id: "user-admin-1",
  email: "admin@careza.vn",
  fullName: "Careza Administrator",
  avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80",
  role: RoleCode.ADMIN,
};
