import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isInvalidSessionError } from "@/lib/auth-session";
import type { Database } from "@/types/supabase";

export const updateSession = async (request: NextRequest) => {
  let response = NextResponse.next({ request });
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet, headers) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([name, value]) =>
            response.headers.set(name, value),
          );
        },
      },
    },
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    if (!isInvalidSessionError(error)) {
      throw error;
    }

    const { error: signOutError } = await supabase.auth.signOut({
      scope: "local",
    });

    if (signOutError) {
      throw signOutError;
    }

    return { isAuthenticated: false, response };
  }

  return { isAuthenticated: Boolean(user), response };
};
