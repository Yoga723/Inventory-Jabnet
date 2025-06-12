// middleware.ts
import { NextResponse, NextRequest } from "next/server";

const protectedRoutes = ["/item-managements", "/item-managements/(.*)"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value || request.cookies.get("__Secure-auth_token")?.value; // Simpan login credential di cookies
  // const role = request.cookies.get("user_role")?.value;

  const newReqHeaders = new Headers(request.headers);
  newReqHeaders.set("x-current-path", request.nextUrl.pathname);

  if (pathname.startsWith("/api") || pathname.startsWith("/_next")) return NextResponse.next();

  if (!token && !pathname.startsWith("/login")) return NextResponse.redirect(new URL(`/login`, request.url));

  if (pathname.startsWith("/settings")) {
    const role = request.cookies.get("userRole")?.value;
    if (role == "field") return NextResponse.redirect(new URL("/dashboard", request.url));
    if (!role) return NextResponse.redirect(new URL("/login", request.url));
  }

  // authenticated → Kirim header/url pathnamena
  return NextResponse.next({
    request: { headers: newReqHeaders },
  });
}

export const config = {
  matcher: [
    // run on everything except Next internals, images, api, favicon, etc.
    "/((?!api|_next/static|_next/image|images|favicon.ico).*)",
  ],
};
