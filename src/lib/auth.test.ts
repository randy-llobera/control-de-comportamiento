import { describe, expect, it, vi } from 'vitest';

import { ApplicationError } from '@/lib/application-error';
import {
  loadCurrentUserWithRole,
  requirePermission,
  type Permission,
} from '@/lib/auth';
import type { ServerSupabaseClient } from '@/lib/supabase-server';
import type { UserRoleName } from '@/types/users';

const USER_ID = '11111111-1111-4111-8111-111111111111';

type AuthTestOptions = {
  user: { id: string } | null;
  profile?: {
    id: string;
    display_name: string;
    school_role: string;
    roles: { name: string };
  } | null;
};

const createSupabase = ({ user, profile = null }: AuthTestOptions) => {
  const maybeSingle = vi.fn().mockResolvedValue({ data: profile, error: null });
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ select }));
  const getUser = vi.fn().mockResolvedValue({
    data: { user },
    error: null,
  });

  return {
    client: { auth: { getUser }, from } as unknown as ServerSupabaseClient,
    from,
  };
};

describe('loadCurrentUserWithRole', () => {
  it('maps the database profile into the neutral current-user contract', async () => {
    const { client } = createSupabase({
      user: { id: USER_ID },
      profile: {
        id: USER_ID,
        display_name: 'Ada Lovelace',
        school_role: 'Tecnología',
        roles: { name: 'admin' },
      },
    });

    await expect(loadCurrentUserWithRole(client)).resolves.toEqual({
      profile: {
        id: USER_ID,
        displayName: 'Ada Lovelace',
        schoolRole: 'Tecnología',
        role: 'admin',
      },
      reason: null,
    });
  });

  it('returns a missing-session result without querying profiles', async () => {
    const { client, from } = createSupabase({ user: null });

    await expect(loadCurrentUserWithRole(client)).resolves.toEqual({
      profile: null,
      reason: 'missing-session',
    });
    expect(from).not.toHaveBeenCalled();
  });

  it('rejects profiles with an unsupported role', async () => {
    const { client } = createSupabase({
      user: { id: USER_ID },
      profile: {
        id: USER_ID,
        display_name: 'Ada Lovelace',
        school_role: 'Tecnología',
        roles: { name: 'principal' },
      },
    });

    await expect(loadCurrentUserWithRole(client)).resolves.toEqual({
      profile: null,
      reason: 'missing-profile',
    });
  });
});

describe('requirePermission', () => {
  const allowedCases = [
    ['users:manage', 'admin'],
    ['groups:manage', 'admin'],
    ['groups:manage', 'coordinator'],
    ['categories:manage', 'admin'],
    ['categories:manage', 'coordinator'],
    ['students:read', 'admin'],
    ['students:read', 'coordinator'],
    ['students:read', 'teacher'],
    ['students:create', 'admin'],
    ['students:create', 'coordinator'],
    ['students:create', 'teacher'],
    ['students:manage', 'admin'],
  ] as const satisfies ReadonlyArray<readonly [Permission, UserRoleName]>;

  it.each(allowedCases)(
    'allows %s for the %s role',
    async (permission, role) => {
      const { client } = createSupabase({
        user: { id: USER_ID },
        profile: {
          id: USER_ID,
          display_name: 'Ada Lovelace',
          school_role: 'Tecnología',
          roles: { name: role },
        },
      });

      await expect(requirePermission(client, permission)).resolves.toMatchObject(
        { id: USER_ID, role },
      );
    },
  );

  const forbiddenCases = [
    ['users:manage', 'coordinator'],
    ['users:manage', 'teacher'],
    ['groups:manage', 'teacher'],
    ['categories:manage', 'teacher'],
    ['students:manage', 'coordinator'],
    ['students:manage', 'teacher'],
  ] as const satisfies ReadonlyArray<readonly [Permission, UserRoleName]>;

  it.each(forbiddenCases)(
    'rejects %s for the %s role',
    async (permission, role) => {
      const { client } = createSupabase({
        user: { id: USER_ID },
        profile: {
          id: USER_ID,
          display_name: 'Ada Lovelace',
          school_role: 'Tecnología',
          roles: { name: role },
        },
      });

      await expect(requirePermission(client, permission)).rejects.toEqual(
        new ApplicationError('forbidden'),
      );
    },
  );

  it('maps a missing session to an unauthenticated error', async () => {
    const { client } = createSupabase({ user: null });

    await expect(
      requirePermission(client, 'categories:manage'),
    ).rejects.toEqual(new ApplicationError('unauthenticated'));
  });

  it('maps a missing profile to a forbidden error', async () => {
    const { client } = createSupabase({
      user: { id: USER_ID },
      profile: null,
    });

    await expect(
      requirePermission(client, 'categories:manage'),
    ).rejects.toEqual(new ApplicationError('forbidden'));
  });
});
