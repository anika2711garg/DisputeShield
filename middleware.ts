import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sessionSecret, verifySessionId } from "@/lib/auth/session-token";

const PUBLIC = new Set(["/", "/login", "/signup"]);

function pass(request: NextRequest, pathname: string) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-ds-path", pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith("/api/webhooks") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return pass(request, pathname);
  }

  const raw = request.cookies.get("ds_session")?.value;
  let userId: string | null = null;
  if (raw) {
    try {
      userId = await verifySessionId(raw, sessionSecret());
    } catch {
      userId = null;
    }
  }
  const session = Boolean(userId);
  const isPublic = PUBLIC.has(pathname) || pathname.startsWith("/api/auth");

  if (raw && !userId) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    if (!isPublic) url.searchParams.set("next", pathname);
    const response = isPublic ? pass(request, pathname) : NextResponse.redirect(url);
    response.cookies.delete("ds_session");
    return response;
  }

  if (!session && !isPublic && !pathname.startsWith("/api/webhooks")) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  if (session && (pathname === "/login" || pathname === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = request.cookies.get("ds_must_change")?.value === "1" ? "/settings/password" : "/dashboard";
    return NextResponse.redirect(url);
  }
  if (
    session &&
    request.cookies.get("ds_must_change")?.value === "1" &&
    pathname !== "/settings/password" &&
    !pathname.startsWith("/api/auth") &&
    !pathname.startsWith("/_next")
  ) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "password_change_required" }, { status: 403 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/settings/password";
    return NextResponse.redirect(url);
  }
  return pass(request, pathname);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
