import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase-proxy";

const PUBLIC_PATHS = new Set(["/", "/auth"]);

const copySessionResponse = (
  response: NextResponse,
  target: NextResponse,
) => {
  response.headers.forEach((value, name) => {
    if (name !== "set-cookie" && name !== "x-middleware-next") {
      target.headers.set(name, value);
    }
  });
  response.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));
  return target;
};

const redirectWithSession = (
  path: string,
  request: NextRequest,
  response: NextResponse,
) => copySessionResponse(response, NextResponse.redirect(new URL(path, request.url)));

const isApiPath = (pathname: string) =>
  pathname === "/api" || pathname.startsWith("/api/");

const unauthorizedApiResponse = (response: NextResponse) =>
  copySessionResponse(
    response,
    NextResponse.json(
      {
        error: "Inicia sesión para continuar.",
      },
      { status: 401 },
    ),
  );

export const proxy = async (request: NextRequest) => {
  const { isAuthenticated, response } = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (!isAuthenticated && isApiPath(pathname)) {
    return unauthorizedApiResponse(response);
  }

  if (!isAuthenticated && !PUBLIC_PATHS.has(pathname)) {
    return redirectWithSession("/auth", request, response);
  }

  if (isAuthenticated && PUBLIC_PATHS.has(pathname)) {
    return redirectWithSession("/incidentes", request, response);
  }

  return response;
};

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
