import { cache } from 'react';
import { isAuthSessionMissingError } from '@supabase/supabase-js';
import { ApplicationError } from '@/lib/application-error';
import { createClient, type ServerSupabaseClient } from '@/lib/supabase-server';
import { isValidRole } from '@/types/users';
import type { CurrentUser, UserRoleName } from '@/types/users';

export type Permission =
  | 'users:manage'
  | 'groups:manage'
  | 'categories:manage'
  | 'students:read'
  | 'students:create'
  | 'students:manage'
  | 'incidents:read'
  | 'incidents:create'
  | 'incidents:manage';

const PERMISSION_ROLES: Record<Permission, readonly UserRoleName[]> = {
  'users:manage': ['admin'],
  'groups:manage': ['admin', 'coordinator'],
  'categories:manage': ['admin', 'coordinator'],
  'students:read': ['admin', 'coordinator', 'teacher'],
  'students:create': ['admin', 'coordinator', 'teacher'],
  'students:manage': ['admin'],
  'incidents:read': ['admin', 'coordinator', 'teacher'],
  'incidents:create': ['admin', 'coordinator', 'teacher'],
  'incidents:manage': ['admin', 'coordinator', 'teacher'],
};

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

export const requirePermission = async (
  supabase: ServerSupabaseClient,
  permission: Permission,
): Promise<CurrentUser> => {
  const auth = await loadCurrentUserWithRole(supabase);

  if (!auth.profile) {
    throw new ApplicationError(
      auth.reason === 'missing-session' ? 'unauthenticated' : 'forbidden',
    );
  }

  if (!PERMISSION_ROLES[permission].includes(auth.profile.role)) {
    throw new ApplicationError('forbidden');
  }

  return auth.profile;
};

export const getCurrentUserWithRole = cache(async (): Promise<AuthResult> =>
  loadCurrentUserWithRole(await createClient()),
);
