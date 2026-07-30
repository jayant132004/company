import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Paths requiring user authentication
  const protectedRoutes = ["/dashboard", "/sortmentor", "/interview", "/challenges"];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // Redirect unauthenticated requests to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from the login page
  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/sortmentor/:path*",
    "/interview/:path*",
    "/challenges/:path*",
    "/login"
  ]
};
