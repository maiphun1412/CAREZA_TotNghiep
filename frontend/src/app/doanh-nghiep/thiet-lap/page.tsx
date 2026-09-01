"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ThietLapRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/doanh-nghiep/cai-dat-cong-ty");
  }, [router]);

  return null;
}
