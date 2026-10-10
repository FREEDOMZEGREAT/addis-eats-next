import { NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/session-token";

export async function proxy(request) {
  const token = request.cookies.get("session")?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    const signInUrl = request.nextUrl.clone();
    signInUrl.pathname = "/signin";
    signInUrl.search = "";
    signInUrl.searchParams.set(
      "next",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(signInUrl);
  }

  if (
    ["/kitchen", "/admin"].some((path) =>
      request.nextUrl.pathname.startsWith(path),
    ) &&
    session.role !== "staff"
  ) {
    return NextResponse.redirect(new URL("/orders", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/checkout/:path*",
    "/orders/:path*",
    "/kitchen/:path*",
    "/admin/:path*",
  ],
};
