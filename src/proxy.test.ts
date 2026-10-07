import { NextRequest, NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { proxy } from '@/proxy';

const mocks = vi.hoisted(() => ({ updateSession: vi.fn() }));

vi.mock('@/lib/supabase-proxy', () => ({ updateSession: mocks.updateSession }));

const createRequest = (path: string) =>
  new NextRequest(`https://example.test${path}`);

const createSessionResponse = () => {
  const response = NextResponse.next();
  response.headers.set('x-supabase-auth', 'refreshed');
  response.cookies.set('sb-project-auth-token', 'refreshed-session', {
    path: '/',
  });
  return response;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('proxy', () => {
  it('redirects an invalid page session to login while preserving cleared cookies', async () => {
    const response = createSessionResponse();
    response.cookies.set('sb-project-auth-token', '', {
      expires: new Date(0),
      maxAge: 0,
      path: '/',
    });
    mocks.updateSession.mockResolvedValue({
      isAuthenticated: false,
      response,
    });

    const result = await proxy(createRequest('/incidentes'));

    expect(result.headers.get('location')).toBe('https://example.test/auth');
    expect(result.headers.get('x-supabase-auth')).toBe('refreshed');
    expect(result.cookies.get('sb-project-auth-token')?.value).toBe('');
  });

  it('does not create a redirect loop for the login page', async () => {
    const response = createSessionResponse();
    mocks.updateSession.mockResolvedValue({
      isAuthenticated: false,
      response,
    });

    await expect(proxy(createRequest('/auth'))).resolves.toBe(response);
  });

  it('preserves existing API redirect behavior for unauthenticated requests', async () => {
    mocks.updateSession.mockResolvedValue({
      isAuthenticated: false,
      response: createSessionResponse(),
    });

    const result = await proxy(createRequest('/api/groups/example/students'));

    expect(result.headers.get('location')).toBe('https://example.test/auth');
  });
});
