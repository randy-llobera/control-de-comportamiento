# Current Feature: Auth Helper Client Reuse

## Status

In Progress

## Goals

- Use one request-scoped Supabase server client for each Server Action.
- Preserve a cached, zero-argument auth helper for Server Components and nested layouts.
- Keep authentication, authorization, SSR cookie handling, RLS enforcement, and action-result behavior unchanged.

## Notes

- Extract `loadCurrentUserWithRole(supabase)` for callers that already own a typed request-scoped server client.
- Keep `getCurrentUserWithRole()` as a React `cache()` wrapper that creates a request-scoped client and delegates to the lower-level helper.
- Update `runMutation()` to use the same client for the verified identity/profile lookup and mutation callback.
- Retain `auth.getUser()` and the existing `users` plus `roles(name)` lookup; do not introduce global clients or cross-request role caching.
- This depends on Server-Side Authentication and Authorization. Server Action Input Validation and Server Mutation Cache Invalidation depend on it.
- Before implementation, use Context7 to confirm current React server `cache()` and Supabase SSR request-client guidance.

## History

<!-- Keep this updated. Earliest to latest -->

- 2026-07-17: Added typed Supabase SSR browser/session clients, `proxy.ts` route gating, and cached server profile lookups. Moved authenticated pages into protected role route groups and migrated existing writes to server-authorized actions.
- 2026-07-16: Typed browser and server Supabase clients with the generated `Database` schema.
