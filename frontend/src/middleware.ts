import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(_request: NextRequest) {
  // Cho phép truy cập tự do toàn bộ giao diện trong chế độ Frontend UI Mock
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dang-nhap",
    "/dang-ky",
    "/ung-vien/:path*",
    "/doanh-nghiep/:path*",
    "/admin/:path*",
  ],
};
