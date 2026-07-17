import { cache } from "react";
import { createClient } from "@/lib/supabase-server";
import type { UserWithRole } from "@/types/database";

export type AuthResult =
  | { profile: UserWithRole; reason: null }
  | { profile: null; reason: "missing-session" | "missing-profile" };

export const getCurrentUserWithRole = cache(async (): Promise<AuthResult> => {
  const supabase = await createClient();
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
});
