"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import PublicHeader from "@/components/layouts/public-header";
import PublicFooter from "@/components/layouts/public-footer";

export default function PublicLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  // Ẩn Header và Footer trên các trang xác thực (đăng nhập, đăng ký, quên mật khẩu, đặt lại mật khẩu)
  const isAuthPage =
    pathname.startsWith("/dang-nhap") ||
    pathname.startsWith("/dang-ky") ||
    pathname.startsWith("/quen-mat-khau") ||
    pathname.startsWith("/dat-lai-mat-khau");

  if (isAuthPage) {
    return <main className="min-h-screen w-full flex flex-col">{children}</main>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1 flex flex-col bg-slate-50">{children}</main>
      <PublicFooter />
    </div>
  );
}

