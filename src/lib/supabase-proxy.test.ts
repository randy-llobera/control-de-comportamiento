import { AuthApiError, AuthSessionMissingError } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { updateSession } from '@/lib/supabase-proxy';

const mocks = vi.hoisted(() => ({
  createServerClient: vi.fn(),
  getUser: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: mocks.createServerClient,
}));

const createRequest = () => {
  const request = new NextRequest('https://example.test/incidentes');
  request.cookies.set('sb-project-auth-token', 'stale-session');
  request.cookies.set('sb-project-auth-token.0', 'stale-session-chunk');
  request.cookies.set('application-preference', 'dark');
  return request;
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.createServerClient.mockReturnValue({
    auth: { getUser: mocks.getUser, signOut: mocks.signOut },
  });
  mocks.getUser.mockResolvedValue({
    data: { user: { id: '11111111-1111-4111-8111-111111111111' } },
    error: null,
  });
  mocks.signOut.mockResolvedValue({ error: null });
});

describe('updateSession', () => {
  it('verifies the current user with Auth instead of accepting JWT claims alone', async () => {
    const { isAuthenticated } = await updateSession(createRequest());

    expect(isAuthenticated).toBe(true);
    expect(mocks.getUser).toHaveBeenCalledOnce();
  });

  it('preserves refreshed cookies and response headers for a valid refreshed session', async () => {
    mocks.getUser.mockImplementation(async () => {
      const options = mocks.createServerClient.mock.calls[0][2];
      options.cookies.setAll(
        [
          {
            name: 'sb-project-auth-token',
            value: 'refreshed-session',
            options: { path: '/' },
          },
        ],
        { 'x-supabase-auth': 'refreshed' },
      );
      return {
        data: { user: { id: '11111111-1111-4111-8111-111111111111' } },
        error: null,
      };
    });

    const { isAuthenticated, response } = await updateSession(createRequest());

    expect(isAuthenticated).toBe(true);
    expect(response.headers.get('x-supabase-auth')).toBe('refreshed');
    expect(response.cookies.get('sb-project-auth-token')?.value).toBe(
      'refreshed-session',
    );
  });

  it.each([
    new AuthSessionMissingError(),
    new AuthApiError('The user no longer exists', 404, 'user_not_found'),
    new AuthApiError('The refresh session expired', 401, 'session_expired'),
    new AuthApiError(
      'The refresh token is no longer valid',
      401,
      'refresh_token_not_found',
    ),
    new AuthApiError(
      'The refresh token was revoked',
      401,
      'refresh_token_already_used',
    ),
  ])('treats %s as unauthenticated and clears stale cookies through Supabase', async (error) => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error });
    mocks.signOut.mockImplementation(async () => {
      const options = mocks.createServerClient.mock.calls[0][2];
      options.cookies.setAll(
        [
          {
            name: 'sb-project-auth-token',
            value: '',
            options: { expires: new Date(0), maxAge: 0, path: '/' },
          },
          {
            name: 'sb-project-auth-token.0',
            value: '',
            options: { expires: new Date(0), maxAge: 0, path: '/' },
          },
        ],
        { 'x-supabase-auth': 'signed-out' },
      );
      return { error: null };
    });
    const request = createRequest();

    const { isAuthenticated, response } = await updateSession(request);

    expect(isAuthenticated).toBe(false);
    expect(mocks.signOut).toHaveBeenCalledWith({ scope: 'local' });
    expect(request.cookies.get('sb-project-auth-token')?.value).toBe('');
    expect(request.cookies.get('sb-project-auth-token.0')?.value).toBe('');
    expect(request.cookies.get('application-preference')?.value).toBe('dark');
    expect(response.cookies.get('sb-project-auth-token')?.value).toBe('');
    expect(response.cookies.get('sb-project-auth-token.0')?.value).toBe('');
    expect(response.cookies.get('application-preference')).toBeUndefined();
    expect(response.headers.get('x-supabase-auth')).toBe('signed-out');
  });

  it('surfaces unexpected Auth-provider failures', async () => {
    const error = new AuthApiError('Auth service failed', 500, 'unexpected_failure');
    mocks.getUser.mockResolvedValue({ data: { user: null }, error });

    await expect(updateSession(createRequest())).rejects.toBe(error);
  });

  it('surfaces a failed local cookie cleanup after an invalid session', async () => {
    const invalidSession = new AuthApiError(
      'The user no longer exists',
      404,
      'user_not_found',
    );
    const signOutError = new AuthApiError(
      'Auth service failed during cleanup',
      500,
      'unexpected_failure',
    );
    mocks.getUser.mockResolvedValue({
      data: { user: null },
      error: invalidSession,
    });
    mocks.signOut.mockResolvedValue({ error: signOutError });

    await expect(updateSession(createRequest())).rejects.toBe(signOutError);
  });
});
