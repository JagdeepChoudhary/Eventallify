import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/", "/events", "/calendar", "/announcements"];

const AUTH_ROUTES = ["/login", "/register"];

const PROTECTED_ROUTES = ["/dashboard", "/profile", "/my-events"];

const ADMIN_ROUTES = ["/admin"];

function getSession(request: NextRequest) {
  // better-auth prepends "__Secure-" to the cookie name whenever the cookie
  // is set with secure:true (i.e. in production/HTTPS) — that's a browser
  // convention, not something you opt into. Matching only the literal
  // "eventhub.session_token" name misses that prefixed variant entirely,
  // so this checks by suffix instead of a fixed list of exact names.
  for (const cookie of request.cookies.getAll()) {
    if (cookie.name.endsWith("session_token")) {
      return cookie.value;
    }
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
