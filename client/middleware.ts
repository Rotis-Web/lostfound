import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/profile"];

export function middleware(request: NextRequest) {
  const isLoggedIn = request.cookies.get("refreshToken")?.value;

  const { pathname } = request.nextUrl;

  if (protectedRoutes.includes(pathname) && !isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile"],
};
