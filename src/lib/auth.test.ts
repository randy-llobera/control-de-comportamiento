import { describe, expect, it, vi } from 'vitest';

import { loadCurrentUserWithRole } from '@/lib/auth';
import type { ServerSupabaseClient } from '@/lib/supabase-server';

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
