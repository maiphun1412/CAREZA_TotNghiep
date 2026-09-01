"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Spin } from "antd";

function NewsRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const category = searchParams.get("category");
    if (category) {
      router.replace(`/cam-nang-nghe-nghiep?category=${category}`);
    } else {
      router.replace("/cam-nang-nghe-nghiep");
    }
  }, [router, searchParams]);

  return (
    <div className="flex justify-center items-center py-40 flex-1 bg-[#f8fbff]">
      <Spin size="large" />
    </div>
  );
}

export default function CareerNewsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center py-40 flex-1 bg-[#f8fbff]"><Spin size="large" /></div>}>
      <NewsRedirectContent />
    </Suspense>
  );
}
