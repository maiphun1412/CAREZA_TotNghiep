import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User, CompanyMember } from "@/types/auth";

interface AuthState {
  user: User | null;
  companyInfo: CompanyMember | null;
  activeBranchId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User | null) => void;
  setCompanyInfo: (companyInfo: CompanyMember | null) => void;
  setActiveBranchId: (branchId: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      companyInfo: null,
      activeBranchId: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      setCompanyInfo: (companyInfo) => {
        // Tự động gán activeBranchId mặc định nếu có chi nhánh được gán
        let activeBranchId = null;
        if (companyInfo && companyInfo.assignedBranches.length > 0) {
          activeBranchId = companyInfo.assignedBranches[0].branchId;
        }
        set({ companyInfo, activeBranchId });
      },

      setActiveBranchId: (activeBranchId) => set({ activeBranchId }),

      setLoading: (isLoading) => set({ isLoading }),

      logout: () =>
        set({
          user: null,
          companyInfo: null,
          activeBranchId: null,
          isAuthenticated: false,
          isLoading: false,
        }),
    }),
    {
      name: "careza-auth-storage", // Lưu session vào localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        companyInfo: state.companyInfo,
        activeBranchId: state.activeBranchId,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
