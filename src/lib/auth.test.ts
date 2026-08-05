import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ApplicationError,
  AuthApplicationError,
} from '@/lib/application-error';
import {
  loginUser,
  loadCurrentUserWithRole,
  logoutUser,
  requirePermission,
  signupUser,
  type Permission,
} from '@/lib/auth';
import type { ServerSupabaseClient } from '@/lib/supabase-server';
import type { UserRoleName } from '@/types/users';

const USER_ID = '11111111-1111-4111-8111-111111111111';

const operationMocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  signUp: vi.fn(),
}));

vi.mock('@/lib/supabase-server', () => ({
  createClient: operationMocks.createClient,
}));

beforeEach(() => {
  vi.clearAllMocks();
  operationMocks.signInWithPassword.mockResolvedValue({ error: null });
  operationMocks.signOut.mockResolvedValue({ error: null });
  operationMocks.signUp.mockResolvedValue({ error: null });
  operationMocks.createClient.mockResolvedValue({
    auth: {
      signInWithPassword: operationMocks.signInWithPassword,
      signOut: operationMocks.signOut,
      signUp: operationMocks.signUp,
    },
  });
});

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

describe('Auth operations', () => {
  it('logs in with a request-scoped server client', async () => {
    await expect(
      loginUser({ email: 'ada@example.com', password: 'secret' }),
    ).resolves.toBeUndefined();

    expect(operationMocks.createClient).toHaveBeenCalledOnce();
    expect(operationMocks.signInWithPassword).toHaveBeenCalledWith({
      email: 'ada@example.com',
      password: 'secret',
    });
  });

  it('signs up with the existing metadata contract', async () => {
    await expect(
      signupUser({
        displayName: 'Ada Lovelace',
        email: 'ada@example.com',
        password: 'secret',
        schoolRole: 'Tecnología',
      }),
    ).resolves.toBeUndefined();

    expect(operationMocks.createClient).toHaveBeenCalledOnce();
    expect(operationMocks.signUp).toHaveBeenCalledWith({
      email: 'ada@example.com',
      password: 'secret',
      options: {
        data: {
          display_name: 'Ada Lovelace',
          school_role: 'Tecnología',
        },
      },
    });
  });

  it('logs out with a request-scoped server client', async () => {
    await expect(logoutUser()).resolves.toBeUndefined();

    expect(operationMocks.createClient).toHaveBeenCalledOnce();
    expect(operationMocks.signOut).toHaveBeenCalledOnce();
  });

  it('maps returned Auth provider failures to the generic Auth error', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    operationMocks.signInWithPassword.mockResolvedValue({
      error: new Error('Raw provider message'),
    });

    await expect(
      loginUser({ email: 'ada@example.com', password: 'secret' }),
    ).rejects.toEqual(new AuthApplicationError('auth-failed'));
    expect(consoleError).toHaveBeenCalledWith(
      'Supabase Auth operation failed:',
      'Raw provider message',
    );
    consoleError.mockRestore();
  });

  it('maps returned signup provider failures to the generic Auth error', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    operationMocks.signUp.mockResolvedValue({
      error: new Error('Raw signup provider message'),
    });

    await expect(
      signupUser({
        displayName: 'Ada Lovelace',
        email: 'ada@example.com',
        password: 'secret',
        schoolRole: 'Tecnología',
      }),
    ).rejects.toEqual(new AuthApplicationError('auth-failed'));
    expect(consoleError).toHaveBeenCalledWith(
      'Supabase Auth operation failed:',
      'Raw signup provider message',
    );
    consoleError.mockRestore();
  });

  it('maps returned logout provider failures to the generic Auth error', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    operationMocks.signOut.mockResolvedValue({
      error: new Error('Raw logout provider message'),
    });

    await expect(logoutUser()).rejects.toEqual(
      new AuthApplicationError('auth-failed'),
    );
    expect(consoleError).toHaveBeenCalledWith(
      'Supabase Auth operation failed:',
      'Raw logout provider message',
    );
    consoleError.mockRestore();
  });
});

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
    ['dashboard:read', 'admin'],
    ['dashboard:read', 'coordinator'],
    ['students:read', 'admin'],
    ['students:read', 'coordinator'],
    ['students:read', 'teacher'],
    ['students:create', 'admin'],
    ['students:create', 'coordinator'],
    ['students:create', 'teacher'],
    ['students:manage', 'admin'],
    ['incidents:read', 'admin'],
    ['incidents:read', 'coordinator'],
    ['incidents:read', 'teacher'],
    ['incidents:create', 'admin'],
    ['incidents:create', 'coordinator'],
    ['incidents:create', 'teacher'],
    ['incidents:manage', 'admin'],
    ['incidents:manage', 'coordinator'],
    ['incidents:manage', 'teacher'],
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

      await expect(
        requirePermission(client, permission),
      ).resolves.toMatchObject({ id: USER_ID, role });
    },
  );

  const forbiddenCases = [
    ['users:manage', 'coordinator'],
    ['users:manage', 'teacher'],
    ['groups:manage', 'teacher'],
    ['categories:manage', 'teacher'],
    ['dashboard:read', 'teacher'],
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
