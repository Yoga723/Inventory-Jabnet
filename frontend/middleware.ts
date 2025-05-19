<<<<<<< HEAD
// middleware.ts
import { NextResponse, NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value; // Store auth_token in cookies

  const newReqHeaders = new Headers(request.headers);
  newReqHeaders.set("x-current-path", request.nextUrl.pathname);

  if (!token && !pathname.startsWith("/login")) return NextResponse.redirect(new URL(`/login`, request.url));

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
=======
// middleware.ts
import { NextResponse, NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value; // Store auth_token in cookies

  const newReqHeaders = new Headers(request.headers);
  newReqHeaders.set("x-current-path", request.nextUrl.pathname);

  if (!token && !pathname.startsWith("/login")) return NextResponse.redirect(new URL(`/login`, request.url));

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
>>>>>>> 4289c65a (change name placeholder)
