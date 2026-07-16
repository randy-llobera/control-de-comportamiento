# Feature: Server-Side Authentication and Authorization

## Status

Planned

## Goal

Move authentication, route protection, and role authorization from client-side effects to server-side Next.js and Supabase SSR boundaries.

## Why

The current `src/components/Layout.tsx` checks authentication in the browser after rendering. It duplicates auth checks across pages, can redirect using a stale pathname, and is not a security boundary.

Supabase RLS remains the database security boundary. This feature adds server-side route and mutation checks so the UI and server reject unauthorized requests before client-side code runs.

## Scope

- Replace the browser Supabase client with a typed `createBrowserClient` client from `@supabase/ssr` so sessions are stored in SSR-compatible cookies.
- Add `src/proxy.ts` for Supabase session refresh and unauthenticated-route redirects.
- Add a typed server helper that verifies the authenticated Supabase user with `auth.getUser()` and loads their `users` profile with `roles(name)`.
- Create a protected server route group and shared protected layout that redirects missing sessions or profiles to `/auth` and passes the profile to `Navigation`.
- Add server role layouts:
  - coordinator or admin: `/grupos`, `/categorias`, `/dashboard`
  - admin only: `/usuarios`
- Keep `/incidentes` and `/estudiantes` available to every authenticated role.
- Remove `src/components/Layout.tsx` and page-level client auth guards after the server layouts replace them.
- Update mutations to re-fetch the authenticated user and role on the server before performing an operation.
- Preserve and rely on Supabase RLS for final row-level database enforcement.

## Out Of Scope

- Changing database schema or RLS policies.
- Converting all page data fetching or forms to Server Components and Server Actions.
- Replacing Supabase Auth or adding a state-management library.
- Changing navigation labels, page URLs, or role definitions.

## Implementation Steps

1. Complete the typed Supabase clients feature.
2. Update the typed browser client to use `createBrowserClient<Database>`.
3. Retain the typed request-scoped server client using `createServerClient<Database>`.
4. Add `src/proxy.ts` to refresh Supabase cookies and redirect unauthenticated requests from protected routes to `/auth`. Redirect authenticated requests from `/` and `/auth` to `/incidentes`.
5. Add a server auth helper that uses `auth.getUser()`, not `auth.getSession()`, and returns a typed `UserWithRole` or a defined missing-session/profile result.
6. Move authenticated pages into `src/app/(protected)/` without changing their URLs. Add a Server Component layout that loads the profile once and renders `Navigation` with it.
7. Add nested coordinator and admin route groups with server layouts that enforce the required role before rendering their children.
8. Remove `src/components/Layout.tsx`, its auth subscription, and duplicate page-level `checkUser()` redirect logic.
9. Update sign-in and sign-out navigation to use `router.replace()` where a browser history entry should not remain.
10. Move mutation authorization into Server Actions or server route handlers. Each mutation must obtain identity and role from the server session, never from client input.
11. Verify RLS still rejects disallowed direct Supabase client requests.

## Risks

- If the browser client does not use SSR cookies, server layouts and `proxy.ts` cannot see a newly created session.
- A Supabase Auth user without a matching `users` profile needs an explicit failure path. Redirect to `/auth` with a user-safe error; do not render a partially authorized app.
- `proxy.ts` improves early redirects and refreshes cookies, but it is not the only authorization layer. Server layouts, server mutations, and RLS must all enforce access.
- Moving routes into route groups must preserve each current URL. Parentheses in route-group names are not part of the URL.
- Existing client-side mutations will remain callable by users. RLS must reject unauthorized calls until their corresponding server-side mutation path is implemented.

## Done Checklist

- [ ] `src/lib/supabase.ts` uses typed `createBrowserClient`.
- [ ] `src/lib/supabase-server.ts` uses typed, request-scoped `createServerClient`.
- [ ] `src/proxy.ts` refreshes session cookies and gates public/protected routes.
- [ ] Refreshing a protected URL while signed out redirects server-side to `/auth`.
- [ ] Refreshing `/auth` while signed in redirects server-side to `/incidentes`.
- [ ] Protected server layout loads one valid `UserWithRole` profile and passes it to `Navigation`.
- [ ] Teachers cannot load coordinator/admin routes by entering their URLs.
- [ ] Page-level client `checkUser()` guards and `src/components/Layout.tsx` are removed.
- [ ] Every migrated server mutation derives user and role from the server session.
- [ ] RLS denies direct, unauthorized client data access or mutations.
- [ ] `npm run lint`, `npm run typecheck`, and `npm run build` pass.
