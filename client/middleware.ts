import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/profile", "/create-post"];
const publicRoutes = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const isLoggedIn = request.cookies.get("refreshToken")?.value;

  const { pathname } = request.nextUrl;

  if (protectedRoutes.includes(pathname) && !isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (publicRoutes.includes(pathname) && isLoggedIn) {
    const homeUrl = new URL("/", request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile", "/login", "/register", "/create-post"],
};
///, "/login", "/register"
