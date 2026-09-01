import { RoleCode } from "@/enums/role.enum";

export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string | null;
  avatarUrl: string | null;
  accountStatus: number;
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  createdAt?: string | null;
  roles: RoleCode[];
}

export interface CompanyMember {
  companyId: string;
  companyName: string;
  memberRole: number; // CompanyMemberRole
  branchAccessMode: string;
  assignedBranches: {
    branchId: string;
    branchName: string;
    branchCode: string | null;
  }[];
}
