"use client";

import type { ReactNode } from "react";
import { Suspense } from "react";
import { usePathname } from "next/navigation";
import PublicHeader from "@/components/layouts/public-header";
import PublicFooter from "@/components/layouts/public-footer";

export default function PublicLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  // Ẩn Header và Footer trên các trang xác thực (đăng nhập, đăng ký, quên mật khẩu, đặt lại mật khẩu) và trang điều khoản/chính sách
  const isAuthPage =
    pathname.startsWith("/dang-nhap") ||
    pathname.startsWith("/dang-ky") ||
    pathname.startsWith("/quen-mat-khau") ||
    pathname.startsWith("/dat-lai-mat-khau") ||
    pathname.startsWith("/dieu-khoan") ||
    pathname.startsWith("/chinh-sach");

  if (isAuthPage) {
    return <main className="min-h-screen w-full flex flex-col">{children}</main>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Suspense fallback={<div className="h-16 w-full bg-white border-b border-slate-200" />}>
        <PublicHeader />
      </Suspense>
      <main className="flex-1 flex flex-col bg-slate-50">{children}</main>
      <PublicFooter />
    </div>
  );
}

