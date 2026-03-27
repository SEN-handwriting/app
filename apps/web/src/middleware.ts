import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/sign-in", "/sign-up"];
// Better-Auth session cookie name (may have domain prefix on localhost)
const SESSION_COOKIES = ["better-auth.session_token", "__Secure-better-auth.session_token"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasSession = SESSION_COOKIES.some(name => request.cookies.has(name));
  const isPublic = PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(r + "/"));

  // Redirect logged-in users away from auth pages
  if (isPublic && hasSession) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Redirect unauthenticated users to sign-in
  if (!isPublic && !hasSession) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|api|favicon.ico|fonts|.*\\..*).*)",
  ],
};
