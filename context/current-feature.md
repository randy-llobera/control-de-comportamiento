# Current Feature

Proxy Session Boundary

## Status

In Progress

## Goals

- Separate Supabase Proxy session infrastructure from the Next.js Proxy entry point without changing route behavior.
- Preserve refreshed cookies and required response headers across normal responses and redirects.
- Keep Proxy free of profile, role, and application-table queries.
- Keep the existing public paths, protected-route behavior, and static-asset matcher unchanged.

## Notes

- Spec: `context/features/refactor-02-proxy-session-boundary.md`
- Dependency: Feature 01 is complete.
- Files: `src/lib/supabase-proxy.ts`, `src/proxy.ts`, and this workflow file.
- Approach: Use Context7 to get the most up to date docs and adhere to Next.js and Supabase best practices and standards. Extract the typed client, cookie synchronization, and identity verification into `updateSession(request)`; leave redirect decisions and matcher configuration in `src/proxy.ts`; copy refreshed cookies and auth response headers to redirects.
- Risks: refreshed sessions can break if redirect cookies or cache-control headers are dropped; the installed `@supabase/ssr` API may differ from current documentation; matcher changes could alter route behavior.
- Done: client construction is absent from `src/proxy.ts`; the helper owns Proxy session behavior; route behavior and matcher remain unchanged; lint, typecheck, build, and route smoke tests pass.

## History

<!-- Keep this updated. Earliest to latest -->

- 2026-07-22: Enforced role-based Supabase RLS for student and incident writes and verified the permission matrix through user-scoped local clients.
- 2026-07-17: Added targeted Next.js route invalidation after successful Server Actions for incidents, students, groups, categories, and user roles.
- 2026-07-17: Added Zod v4 Server Action validation, normalized mutation payloads, and Spanish field-level errors in forms.
- 2026-07-17: Reused one request-scoped Supabase server client per mutation while preserving cached server-component profile lookups.
- 2026-07-17: Added typed Supabase SSR browser/session clients, `proxy.ts` route gating, and cached server profile lookups. Moved authenticated pages into protected role route groups and migrated existing writes to server-authorized actions.
- 2026-07-16: Typed browser and server Supabase clients with the generated `Database` schema.
