import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { checkSession } from "@/lib/api/serverApi";

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

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  let isAuthenticated = false;
  let sessionResponse = null;

  if (accessToken) {
    isAuthenticated = true;
  }
  else if (refreshToken) {
    sessionResponse = await checkSession();
    isAuthenticated = !!sessionResponse.data;
  }
  if (isPrivateRoute && !isAuthenticated) {
    return NextResponse.redirect(
      new URL("/sign-in", request.url)
    );
  }
  if (isPublicRoute && isAuthenticated) {
    return NextResponse.redirect(
      new URL("/", request.url)
    );
  }

  const response = NextResponse.next();
  const setCookie = sessionResponse?.headers["set-cookie"];

  if (setCookie) {
    const cookies = Array.isArray(setCookie)
      ? setCookie
      : [setCookie];

    for (const cookie of cookies) {
      response.headers.append("set-cookie", cookie);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/notes/:path*",
    "/sign-in",
    "/sign-up",
  ],
};