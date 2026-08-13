import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const privateRoutes = ["/profile", "/notes"];
const publicRoutes = ["/sign-in", "/sign-up"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPrivateRoute = privateRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!isPrivateRoute && !isPublicRoute) {
    return NextResponse.next();
  }

  const sessionResponse = await fetch(
    `${request.nextUrl.origin}/api/auth/session`,
    {
      headers: {
        Cookie: request.headers.get("cookie") ?? "",
      },
    }
  );

  const session = await sessionResponse.json();
  const isAuthenticated = session.success === true;

  if (isPrivateRoute && !isAuthenticated) {
    return NextResponse.redirect(
      new URL("/sign-in", request.url)
    );
  }

  if (isPublicRoute && isAuthenticated) {
    return NextResponse.redirect(
      new URL("/profile", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/notes/:path*",
    "/sign-in",
    "/sign-up",
  ],
};