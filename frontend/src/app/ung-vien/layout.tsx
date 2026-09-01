"use client";

import { type ReactNode } from "react";
import PublicHeader from "@/components/layouts/public-header";
import PublicFooter from "@/components/layouts/public-footer";

export default function CandidateLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#f5f8ff]">
      <PublicHeader />
      <main className="flex-1 flex flex-col pt-6 pb-16">{children}</main>
      <PublicFooter />
    </div>
  );
}
