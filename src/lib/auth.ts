import { cache } from 'react';
import { isAuthSessionMissingError } from '@supabase/supabase-js';
import { createClient, type ServerSupabaseClient } from '@/lib/supabase-server';
import { isValidRole } from '@/types/users';
import type { CurrentUser } from '@/types/users';

export type AuthResult =
  | { profile: CurrentUser; reason: null }
  | { profile: null; reason: 'missing-session' | 'missing-profile' };

export const loadCurrentUserWithRole = async (
  supabase: ServerSupabaseClient,
): Promise<AuthResult> => {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!isAuthSessionMissingError(authError) && authError) {
    console.error('Failed to load the authenticated user:', authError.message);
    throw authError;
  }

  if (!user) {
    return { profile: null, reason: 'missing-session' };
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*, roles(name)')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error(
      'Failed to load the authenticated user profile:',
      profileError.message,
    );
    throw profileError;
  }

  if (!profile?.roles?.name || !isValidRole(profile.roles.name)) {
    return { profile: null, reason: 'missing-profile' };
  }

  return {
    profile: {
      id: profile.id,
      displayName: profile.display_name,
      schoolRole: profile.school_role,
      role: profile.roles.name,
    },
    reason: null,
  };
};

export const getCurrentUserWithRole = cache(async (): Promise<AuthResult> =>
  loadCurrentUserWithRole(await createClient()),
);
