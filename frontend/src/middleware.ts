import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token =
    request.cookies.get("careza_access_token")?.value ||
    request.cookies.get("careza_logged_in")?.value;

  const isProtectedPath =
    (pathname.startsWith("/ung-vien") && !pathname.startsWith("/ung-vien/cv/builder")) ||
    pathname.startsWith("/doanh-nghiep") ||
    pathname.startsWith("/admin");

  const isAuthPath =
    pathname === "/dang-nhap" ||
    pathname === "/dang-ky";

  // Nếu chưa đăng nhập mà truy cập vào route bảo vệ
  if (isProtectedPath && !token) {
    const loginUrl = new URL("/dang-nhap", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

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

