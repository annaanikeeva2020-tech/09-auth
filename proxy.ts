import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

import { checkSession } from "@/lib/api/serverApi";

const privateRoutes = ["/profile", "/notes"];
const publicRoutes = ["/sign-in", "/sign-up"];

const isRouteMatch = (pathname: string, route: string) =>
  pathname === route || pathname.startsWith(`${route}/`);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPrivateRoute = privateRoutes.some((route) =>
    isRouteMatch(pathname, route)
  );

  const isPublicRoute = publicRoutes.some((route) =>
    isRouteMatch(pathname, route)
  );

  if (!isPrivateRoute && !isPublicRoute) {
    return NextResponse.next();
  }

  const cookieStore = await cookies();

  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  let isAuthenticated = false;
  let refreshedCookies: string[] = [];

  // Есть accessToken — сессию дополнительно проверять не нужно
  if (accessToken) {
    isAuthenticated = true;
  }

  // accessToken отсутствует, но есть refreshToken —
  // пытаемся обновить сессию
  else if (refreshToken) {
    const sessionResponse = await checkSession();

    const setCookie = sessionResponse.headers["set-cookie"];

    if (setCookie) {
      refreshedCookies = Array.isArray(setCookie)
        ? setCookie
        : [setCookie];

      const hasAccessToken = refreshedCookies.some((cookie) =>
        cookie.trim().startsWith("accessToken=")
      );

      const hasRefreshToken = refreshedCookies.some((cookie) =>
        cookie.trim().startsWith("refreshToken=")
      );

      // Считаем сессию обновлённой только если
      // сервер действительно прислал новый токен
      if (hasAccessToken || hasRefreshToken) {
        isAuthenticated = true;
      }
    }
  }

  // Если получили новые токены, сначала устанавливаем их
  // в response, а затем redirect на тот же URL.
  if (refreshedCookies.length > 0 && isAuthenticated) {
    const response = NextResponse.redirect(request.url);

    for (const cookie of refreshedCookies) {
      response.headers.append("set-cookie", cookie);
    }

    return response;
  }

  // Private route без авторизации
  if (isPrivateRoute && !isAuthenticated) {
    return NextResponse.redirect(
      new URL("/sign-in", request.url)
    );
  }

  // Public route для уже авторизованного пользователя
  if (isPublicRoute && isAuthenticated) {
    return NextResponse.redirect(
      new URL("/", request.url)
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