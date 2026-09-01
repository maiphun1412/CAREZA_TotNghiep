export enum RoleCode {
  CANDIDATE = "CANDIDATE",
  COMPANY_OWNER = "COMPANY_OWNER",
  RECRUITER = "RECRUITER",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
}

export enum RegisterAccountType {
  CANDIDATE = "CANDIDATE",
  COMPANY = "COMPANY",
}

export const ROLE_LABEL: Record<RoleCode, string> = {
  [RoleCode.CANDIDATE]: "Ứng viên",
  [RoleCode.COMPANY_OWNER]: "Chủ doanh nghiệp",
  [RoleCode.RECRUITER]: "Nhân viên tuyển dụng",
  [RoleCode.ADMIN]: "Quản trị viên",
  [RoleCode.SUPER_ADMIN]: "Quản trị viên cấp cao",
};

export enum CompanyMemberRole {
  OWNER = 1,
  HR_MANAGER = 2,
  RECRUITER = 3,
  INTERVIEWER = 4,
}

export enum CompanyMemberStatus {
  ACTIVE = 1,
  SUSPENDED = 2,
  INACTIVE = 3,
}

export const COMPANY_MEMBER_ROLE_LABEL: Record<CompanyMemberRole, string> = {
  [CompanyMemberRole.OWNER]: "Chủ doanh nghiệp",
  [CompanyMemberRole.HR_MANAGER]: "Quản lý nhân sự",
  [CompanyMemberRole.RECRUITER]: "Nhân viên tuyển dụng",
  [CompanyMemberRole.INTERVIEWER]: "Người phỏng vấn",
};
