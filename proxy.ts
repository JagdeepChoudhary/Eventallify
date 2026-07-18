import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/", "/events", "/calendar", "/announcements"];

const AUTH_ROUTES = ["/login", "/register"];

const PROTECTED_ROUTES = ["/dashboard", "/profile", "/my-events"];

const ADMIN_ROUTES = ["/admin"];

function getSession(request: NextRequest) {
  const cookies = ["better-auth.session_token", "Eventallify.session_token"];

  for (const name of cookies) {
    const value = request.cookies.get(name)?.value;

    if (value) return value;
  }

  return null;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasSession = !!getSession(request);

  // Allow public pages
  if (
    PUBLIC_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(route + "/"),
    )
  ) {
    return NextResponse.next();
  }

  // Redirect logged-in users away from auth pages
  if (AUTH_ROUTES.some((route) => pathname.startsWith(route)) && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protect student routes
  if (
    PROTECTED_ROUTES.some((route) => pathname.startsWith(route)) &&
    !hasSession
  ) {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", pathname);

    return NextResponse.redirect(url);
  }

  // Protect admin routes (authentication only)
  if (ADMIN_ROUTES.some((route) => pathname.startsWith(route)) && !hasSession) {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", pathname);

    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/my-events/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
