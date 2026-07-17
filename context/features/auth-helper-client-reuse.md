# Feature: Auth Helper Client Reuse

## Status

Planned

## Goal

Use one request-scoped Supabase server client for each Server Action while preserving a cached, no-argument auth helper for Server Components and nested layouts.

## Why

`getCurrentUserWithRole()` currently creates its own server client. `runMutation()` then creates a second server client for the database write. Both clients safely represent the same request and user session, but the second instance is unnecessary.

Server layouts have a different need: nested layouts can independently request the current profile, so they benefit from React `cache()` memoizing a no-argument helper during a single server render.

This feature separates those concerns into two layers:

```text
loadCurrentUserWithRole(supabase)
  -> uses a caller-provided server client
  -> used by Server Actions to reuse one client

getCurrentUserWithRole()
  -> cached Server Component convenience wrapper
  -> creates a request-scoped client, then delegates to the lower-level helper
```

## Dependency

Complete Server-Side Authentication and Authorization first. This feature refines its server auth helper and mutation flow without changing their security rules.

Server Action Input Validation and Server Mutation Cache Invalidation depend on this feature because they both modify `src/actions/mutations.ts`.

## Scope

- Define a readable typed alias for the request-scoped Supabase server client if it improves the helper signatures.
- Extract a non-cached `loadCurrentUserWithRole(supabase)` helper that receives a typed server client.
- Preserve `getCurrentUserWithRole()` as a zero-argument React `cache()` wrapper for server layouts and pages.
- Update `runMutation()` to create one server client, pass it to `loadCurrentUserWithRole()`, and pass the same instance to the mutation callback.
- Preserve `auth.getUser()` for verified identity and the existing `users` plus `roles(name)` profile lookup.
- Preserve the current `AuthResult` and `ActionResult` behavior, authorization rules, SSR cookie handling, and RLS enforcement.
- Use Context7 to confirm current React server `cache()` and Supabase SSR request-client guidance before implementation.

## Out Of Scope

- Creating a global server Supabase client or sharing a client between HTTP requests.
- Adding JWT role claims, database views, RPC functions, stored procedures, or a new ORM.
- Changing route protection, role definitions, RLS policies, mutation validation, or cache invalidation behavior.
- Caching user profiles across requests or making role data globally available.

## Implementation Steps

1. Use Context7 to verify React `cache()` request/render behavior and Supabase SSR guidance that server clients must remain request-scoped.
2. Add or export a readable `ServerSupabaseClient` type based on `createClient()` if needed by both helper and action code.
3. Move the identity/profile lookup logic into `loadCurrentUserWithRole(supabase)`.
4. Keep `getCurrentUserWithRole()` as `cache(async () => loadCurrentUserWithRole(await createClient()))` for layouts and Server Components.
5. In `runMutation()`, create the server client once, call `loadCurrentUserWithRole(supabase)`, authorize the profile, and call `operation(supabase, userId)` with the same instance.
6. Confirm the Server Action still derives identity from request cookies and never accepts a client or user ID from the browser.
7. Run type checking, linting, and a production build.

## Risks

- React `cache()` only deduplicates identical calls during one server render; it must not be described or used as a cross-request authorization cache.
- The explicit-client helper must remain server-only and must not be imported by Client Components.
- Reusing a client within one request is safe; reusing one globally across requests is not.
- The refactor must retain `auth.getUser()` rather than switching authorization decisions to unverified `getSession()` data.

## Done Checklist

- [ ] Server Actions create exactly one request-scoped Supabase client per action invocation.
- [ ] The profile lookup and mutation use that same client instance.
- [ ] Server layouts/pages can still call zero-argument `getCurrentUserWithRole()`.
- [ ] Nested server layout calls reuse the cached profile result during one render.
- [ ] No global client, global role cache, or browser-to-server client passing is introduced.
- [ ] Authentication, role authorization, RLS behavior, and action results are unchanged.
- [ ] `npm run typecheck`, `npm run lint`, and `npm run build` pass.
