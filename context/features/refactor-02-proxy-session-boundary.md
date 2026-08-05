# Feature: Proxy Session Boundary

## Status

Planned

## Goal

Separate Supabase Proxy session infrastructure from the Next.js Proxy entry point without changing route behavior.

## Standards References

- `Architecture Contract > 10. Supabase server client`
- `Architecture Contract > 12. Proxy`
- `Architecture Contract > 13. Authentication and authorization`

## Dependency

Complete Feature 01 first.

## Scope

- Add `src/lib/supabase-proxy.ts` for the Proxy-scoped Supabase client, request/response cookie synchronization, session verification, and refreshed response.
- Keep `src/proxy.ts` limited to calling the session helper and applying public/protected redirects.
- Preserve `/`, `/auth`, protected routes, static-asset matching, and refreshed cookies across redirects.
- Keep Proxy free of profile, role, and application-table queries.
- Use the generated `Database` type and public/publishable key.

## Out of Scope

- Changing protected layouts, authorization rules, page URLs, or Auth UI.
- Reusing the normal Server Component client inside Proxy.
- Introducing a global Supabase client.

## Implementation Steps

1. Use Context7 for the installed Next.js and `@supabase/ssr` Proxy cookie APIs.
2. Move client creation and `getAll`/`setAll` handling into `updateSession(request)`.
3. Verify identity with the supported `getClaims()` or `getUser()` method.
4. Return the verified identity/session result and refreshed response to `src/proxy.ts`.
5. Preserve refreshed cookies when `src/proxy.ts` returns a redirect.
6. Run signed-in and signed-out route smoke tests and repository checks.

## Risks

- Returning a new response without copied cookies can desynchronize or terminate sessions.
- Proxy must not become the authoritative role-security layer.
- Cookie response headers required by the installed SSR package must be preserved.

## Tests

- Signed-out access to a protected URL redirects to `/auth`.
- Signed-in access to `/` or `/auth` redirects to `/incidentes`.
- Signed-in access to a protected URL succeeds.
- Session refresh cookies survive normal responses and redirects.

## Done Checklist

- [ ] `src/proxy.ts` contains no Supabase client construction.
- [ ] `src/lib/supabase-proxy.ts` owns Proxy cookie/session behavior.
- [ ] Proxy contains no profile, role, or feature query.
- [ ] Existing routes and matcher behavior are unchanged.
- [ ] `npm run lint`, `npm run typecheck`, and `npm run build` pass.

