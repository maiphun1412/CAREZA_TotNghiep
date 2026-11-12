"use client";

import { type ReactNode } from "react";
import { usePathname } from "next/navigation";
import PublicHeader from "@/components/layouts/public-header";
import PublicFooter from "@/components/layouts/public-footer";

export default function CandidateLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isBuilder = pathname.startsWith("/ung-vien/cv/builder");
  const isCompactHeader =
    pathname === "/ung-vien/viec-lam-da-luu" ||
    pathname === "/ung-vien/thong-bao" ||
    pathname === "/ung-vien/lich-phong-van" ||
    pathname === "/ung-vien/cv" ||
    pathname === "/ung-vien/ung-tuyen";

  const isSettings = pathname === "/ung-vien/cai-dat";

  if (isBuilder) {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-[#f5f8ff]">
        <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
      </div>
    );
  }

  if (isSettings) {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-[#F7FAFF]">
        <PublicHeader />
        <main className="flex-1 overflow-hidden flex flex-col">{children}</main>
      </div>
    );
  }

  if (isCompactHeader) {
    return (
      <div className="flex flex-col bg-[#f5f8ff] min-h-screen">
        <PublicHeader />
        <main className="pt-3 sm:pt-3.5 pb-8 sm:pb-12">{children}</main>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f8ff]">
      <PublicHeader />
      <main className="flex-1 flex flex-col pt-6 pb-16">{children}</main>
      <PublicFooter />
    </div>
  );
}
