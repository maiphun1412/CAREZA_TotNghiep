"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Spin } from "antd";

export default function RedirectSavedJobsPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/ung-vien/viec-da-luu");
    } else {
      router.replace("/dang-nhap?callbackUrl=/ung-vien/viec-da-luu");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="flex h-[50vh] w-full items-center justify-center">
      <Spin size="large" />
    </div>
  );
}
