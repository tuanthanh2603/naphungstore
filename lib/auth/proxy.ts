import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "./constants";
import { verifySessionToken } from "./session";

function toAdminPath(pathname: string) {
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    return pathname.replace(/^\/dashboard/, "/admin") || "/admin";
  }

  return pathname;
}

export async function handleAuthProxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAdminArea =
    pathname.startsWith("/admin") || pathname.startsWith("/dashboard");
  const isLogin = pathname === "/login";
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;
  const isAdmin = session?.role === "admin";

  if (isAdminArea && !isAdmin) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", toAdminPath(pathname));
    return NextResponse.redirect(loginUrl);
  }

  if (isLogin && isAdmin) {
    const adminUrl = request.nextUrl.clone();
    adminUrl.pathname = "/admin";
    adminUrl.search = "";
    return NextResponse.redirect(adminUrl);
  }

  if (pathname.startsWith("/dashboard")) {
    const adminUrl = request.nextUrl.clone();
    adminUrl.pathname = toAdminPath(pathname);
    return NextResponse.redirect(adminUrl);
  }

  return NextResponse.next({ request });
}
