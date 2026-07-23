import type { QueryData } from '@supabase/supabase-js';

import { ApplicationError } from '@/lib/application-error';
import { loadCurrentUserWithRole } from '@/lib/auth';
import { createClient, type ServerSupabaseClient } from '@/lib/supabase-server';
import { USER_ROLE_NAMES } from '@/types/users';
import type {
  RoleOption,
  UpdateUserRoleInput,
  UserListItem,
  UserPageData,
  UserRoleName,
} from '@/types/users';

const isUserRoleName = (name: string): name is UserRoleName =>
  USER_ROLE_NAMES.some((roleName) => roleName === name);

const requireAdmin = async (supabase: ServerSupabaseClient) => {
  const auth = await loadCurrentUserWithRole(supabase);

  if (!auth.profile) {
    throw new ApplicationError(
      auth.reason === 'missing-session' ? 'unauthenticated' : 'forbidden',
    );
  }

  if (auth.profile.roles?.name !== 'admin') {
    throw new ApplicationError('forbidden');
  }
};

const mapRole = (role: { id: string; name: string }): RoleOption => {
  if (!isUserRoleName(role.name)) {
    const error = new Error(`Unexpected user role: ${role.name}`);
    console.error('Failed to map a user role:', error.message);
    throw error;
  }

  return { id: role.id, name: role.name };
};

const handleUnexpectedError = (
  context: string,
  error: { message: string },
): never => {
  console.error(`${context}:`, error.message);
  throw error;
};

export const getUserPageData = async (): Promise<UserPageData> => {
  const supabase = await createClient();
  await requireAdmin(supabase);

  const usersQuery = supabase
    .from('users')
    .select('id, display_name, school_role, roles(id, name)')
    .order('created_at', { ascending: false });
  const rolesQuery = supabase.from('roles').select('id, name').order('name');

  type UserRows = QueryData<typeof usersQuery>;
  type RoleRows = QueryData<typeof rolesQuery>;

  const [usersResult, rolesResult] = await Promise.all([
    usersQuery,
    rolesQuery,
  ]);

  if (usersResult.error) {
    handleUnexpectedError('Failed to load managed users', usersResult.error);
  }
  if (rolesResult.error) {
    handleUnexpectedError('Failed to load role options', rolesResult.error);
  }

  const userRows: UserRows = usersResult.data ?? [];
  const roleRows: RoleRows = rolesResult.data ?? [];
  const users: UserListItem[] = userRows.map((user) => ({
    id: user.id,
    displayName: user.display_name,
    schoolRole: user.school_role,
    role: mapRole(user.roles),
  }));
  const roles: RoleOption[] = roleRows.map(mapRole);

  return { users, roles };
};

export const updateUserRole = async (
  input: UpdateUserRoleInput,
): Promise<void> => {
  const supabase = await createClient();
  await requireAdmin(supabase);

  const { data: role, error: roleError } = await supabase
    .from('roles')
    .select('id')
    .eq('id', input.roleId)
    .maybeSingle();

  if (roleError) {
    handleUnexpectedError('Failed to validate the selected role', roleError);
  }
  if (!role) {
    throw new ApplicationError('not-found');
  }

  const { data: user, error: updateError } = await supabase
    .from('users')
    .update({ role_id: input.roleId })
    .eq('id', input.userId)
    .select('id')
    .maybeSingle();

  if (updateError) {
    handleUnexpectedError('Failed to update the user role', updateError);
  }
  if (!user) {
    throw new ApplicationError('not-found');
  }
};
