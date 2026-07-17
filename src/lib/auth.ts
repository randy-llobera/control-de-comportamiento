import { cache } from "react";
import {
  createClient,
  type ServerSupabaseClient,
} from "@/lib/supabase-server";
import type { UserWithRole } from "@/types/database";

export type AuthResult =
  | { profile: UserWithRole; reason: null }
  | { profile: null; reason: "missing-session" | "missing-profile" };

export const loadCurrentUserWithRole = async (
  supabase: ServerSupabaseClient,
): Promise<AuthResult> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { profile: null, reason: "missing-session" };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("*, roles(name)")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.roles?.name) {
    return { profile: null, reason: "missing-profile" };
  }

  return { profile, reason: null };
};

export const getCurrentUserWithRole = cache(async (): Promise<AuthResult> =>
  loadCurrentUserWithRole(await createClient()),
);
