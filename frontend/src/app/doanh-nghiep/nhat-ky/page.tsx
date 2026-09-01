"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NhatKyRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/doanh-nghiep/nhat-ky-hoat-dong");
  }, [router]);

  return null;
}
