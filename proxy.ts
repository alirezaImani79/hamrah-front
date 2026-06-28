// Next.js 16 renamed Middleware → Proxy. Same mechanics: runs before a request
// completes. Here it does an *optimistic* auth guard based on the presence of
// the bearer-token cookie. The real check (GET /auth/me) happens client-side.
import { NextResponse, type NextRequest } from "next/server";

import { AUTH_COOKIE } from "@/lib/api";

export function proxy(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const { pathname } = request.nextUrl;

  // Unauthenticated → keep out of the protected areas, remember the destination.
  if (
    (pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding")) &&
    !token
  ) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Already authenticated → no reason to sit on the login page.
  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*", "/login"],
};
