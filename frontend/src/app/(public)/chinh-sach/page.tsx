"use client";

import { Suspense } from "react";
import { LegalPageView } from "../dieu-khoan/page";

export default function PrivacyPolicyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fbff] flex items-center justify-center text-slate-500 text-sm">
          Đang tải nội dung...
        </div>
      }
    >
      <LegalPageView defaultTab="privacy" />
    </Suspense>
  );
}

