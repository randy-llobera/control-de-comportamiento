# Feature: Deleted-User Session Recovery

## Status

Completed

## Scope and acceptance

Browser session that refers to a deleted or otherwise invalid Supabase Auth session is treated as unauthenticated instead of producing a 500 response.

- Detect server-side session invalidation at the existing Proxy/session boundary.
- Clear stale Supabase auth cookies when the invalid session is confirmed and the response is writable.
- Redirect affected page requests to `/auth` through the existing Proxy routing.
- Preserve normal access-token refresh when a valid refresh token is available.
- Treat only known missing, deleted, expired, or revoked-session errors as unauthenticated.
- Continue surfacing unexpected Auth-provider and transport failures as server errors.
- Preserve refreshed cookies, response headers, and existing API behavior; DEF-003 remains a separate API response-contract fix.
- Keep the existing `AuthResult` contract and make protected server code resilient if the session becomes invalid after the Proxy check.

## Evidence and context

Production logs on 2026-09-05 reported Supabase `AuthApiError` code `user_not_found` with the message `User from sub claim in JWT does not exist` on `/incidentes` after an Auth account reset. The Proxy currently accepts the still-valid JWT through `getClaims()`, while `loadCurrentUserWithRole` later calls `getUser()` and rethrows the error. Clearing the browser's stale site cookies restores login.

Supabase's current SSR guidance distinguishes the two checks: `getClaims()` verifies token claims efficiently but cannot detect server-side revocation or deletion, while `getUser()` contacts Auth and is required when current server-side session validity matters. The existing `setAll` callback remains responsible for propagating refresh cookies and headers.

## Implementation guidance

1. Update `src/lib/supabase-proxy.ts` to use the request-scoped Supabase client and `auth.getUser()` for the Proxy's session-validity decision.
2. Add a narrow invalid-session classifier using Supabase's `isAuthSessionMissingError` and `isAuthApiError` helpers plus an explicit allow-list of confirmed invalid-session codes, including `user_not_found` and the relevant missing, expired, or revoked-session codes.
3. On an allow-listed invalid-session error, expire the Supabase auth cookie set, return `isAuthenticated: false`, and retain the existing response/header propagation.
4. Re-throw errors outside that allow-list. Do not convert arbitrary `AuthApiError`, retryable transport, or service failures into login redirects.
5. Update `src/lib/auth.ts` so the same confirmed invalid-session conditions return `reason: 'missing-session'` if the session becomes invalid after the Proxy check.
6. Add focused unit coverage for the Proxy/session boundary and extend `src/lib/auth.test.ts` for the defensive server-side mapping.

Do not add a new service layer, change database schema or RLS, alter role authorization, or fold DEF-003's API redirect/JSON behavior into this feature.

## Files and ownership

- `src/lib/supabase-proxy.ts` — session verification, invalid-session classification, and cookie clearing.
- `src/lib/auth-session.ts` — shared, narrow invalid-session classifier.
- `src/lib/auth.ts` — defensive mapping for a session invalidated after Proxy execution.
- `src/lib/supabase-proxy.test.ts` — new focused Proxy/session tests.
- `src/lib/auth.test.ts` — deleted-user and invalid-session regression coverage.
- `src/proxy.test.ts` — login redirect, redirect-loop, and API redirect regression coverage.
- `context/defects/pending-defects.md` — update DEF-004 with the implemented outcome and evidence when complete.
- `context/current-feature.md` — point at this record while implementation is active; reset it during feature completion according to the project workflow.

## Verification

Run the focused tests first, then the required repository checks:

```text
npm test -- src/lib/supabase-proxy.test.ts src/lib/auth.test.ts
npm run test:integration
npm run lint
npm run typecheck
npm run build
git diff --check
```

Acceptance evidence must cover deleted users, expired access tokens with valid refresh tokens, expired or revoked refresh sessions, stale-cookie propagation, login redirects, unexpected Auth failures, and preservation of existing API behavior. Record exact commands and results here when the feature is completed.

## Outcome

- 2026-10-07: Replaced Proxy `getClaims()` gating with `getUser()` verification so Auth can detect a deleted or revoked server-side session. Known invalid-session errors use Supabase's local sign-out to clear the adapter-managed cookie set and proceed through the existing redirect path; unexpected Auth errors are rethrown. One shared narrow classifier maps a session that fails after Proxy execution to `missing-session` in server code.
- 2026-10-07: Passed `npm test -- src/lib/supabase-proxy.test.ts src/lib/auth.test.ts src/proxy.test.ts` (3 files, 59 tests), `npm run lint`, `npm run typecheck`, `npm run test:integration` (1 file, 6 tests), `npm run build`, and `git diff --check`.
