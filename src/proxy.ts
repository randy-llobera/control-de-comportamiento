import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase-proxy";

const PUBLIC_PATHS = new Set(["/", "/auth"]);

const redirectWithSession = (
  path: string,
  request: NextRequest,
  response: NextResponse,
) => {
  const redirect = NextResponse.redirect(new URL(path, request.url));
  response.headers.forEach((value, name) => {
    if (name !== "set-cookie" && name !== "x-middleware-next") {
      redirect.headers.set(name, value);
    }
  });
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
};

export const proxy = async (request: NextRequest) => {
  const { isAuthenticated, response } = await updateSession(request);
  const { pathname } = request.nextUrl;

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
