# Current Feature: Shared Server Contracts

## Status

In Progress

## Goals

<!-- Add goals here -->

- Move the generic `ActionResult<T>` contract into `src/types/actions.ts` while preserving existing form behavior and narrowing.
- Add known application errors for unauthenticated, forbidden, not-found, and conflict outcomes.
- Share safe Spanish known-error messages across Server Actions and Route Handlers while rethrowing unexpected errors.
- Distinguish Supabase Auth/profile query failures from valid missing-session and missing-profile states.
- Pass lint, typecheck, and production build checks.

## Notes

<!-- Add notes here -->

- Spec: `context/features/refactor-03-shared-server-contracts.md`.
- Depends on completed Feature 02: Proxy Session Boundary.
- Preserve the cached no-argument actor helper and explicit-client helper.
- Do not change permission rules, mutation behavior, UI messages, or caching.
- Do not blanket-catch unexpected errors.

## History

<!-- Keep this updated. Earliest to latest -->

- 2026-07-22: Separated Proxy-scoped Supabase claims verification and session cookie/header refresh handling from route redirect logic.
- 2026-07-22: Enforced role-based Supabase RLS for student and incident writes and verified the permission matrix through user-scoped local clients.
- 2026-07-17: Added targeted Next.js route invalidation after successful Server Actions for incidents, students, groups, categories, and user roles.
- 2026-07-17: Added Zod v4 Server Action validation, normalized mutation payloads, and Spanish field-level errors in forms.
- 2026-07-17: Reused one request-scoped Supabase server client per mutation while preserving cached server-component profile lookups.
- 2026-07-17: Added typed Supabase SSR browser/session clients, `proxy.ts` route gating, and cached server profile lookups. Moved authenticated pages into protected role route groups and migrated existing writes to server-authorized actions.
- 2026-07-16: Typed browser and server Supabase clients with the generated `Database` schema.
