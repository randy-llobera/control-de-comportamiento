# Current Feature: Users Feature Boundary

## Status

In Progress

## Goals

<!-- Add goals here -->

- Move user-management reads, role assignment, authorization, and mapping behind a users feature module.
- Define neutral `UserListItem`, `RoleOption`, `UserPageData`, and `UpdateUserRoleInput` contracts.
- Add admin-authorized, mapped user reads and validated role updates.
- Convert `/usuarios` to a Server Component with focused client-side role controls.
- Remove users/roles browser queries and the role operation from `actions/mutations.ts`.

## Notes

<!-- Add notes here -->

- Dependency: Complete Feature 04 first.
- Add `src/types/users.ts`, `src/lib/users.ts`, and a thin `actions/users.ts` boundary.
- Validate Action input with Zod, map known errors, and invalidate `/usuarios` only.
- Keep user-management table access in `lib/users.ts` and use one request-scoped Supabase client per operation.
- Test mapping, authorization, invalid user/role failures, Action results, and the absence of browser Supabase queries on the page.
- Out of scope: Auth account creation/deletion, role definition changes, user RLS changes, navigation refactoring, optimistic updates, and client caching.
- Key risks: operation-level authorization must remain explicit; browser input must not supply acting-user identity or trusted role names; invalidation must keep the page current.

## History

<!-- Keep this updated. Earliest to latest -->

- 2026-07-23: Added the Vitest Node test foundation with path aliases, explicit discovery, and shared application-error boundary tests.
- 2026-07-23: Added shared Action and known-error contracts, reusable safe server-boundary messages, and explicit Auth/profile failure handling.
- 2026-07-22: Separated Proxy-scoped Supabase claims verification and session cookie/header refresh handling from route redirect logic.
- 2026-07-22: Enforced role-based Supabase RLS for student and incident writes and verified the permission matrix through user-scoped local clients.
- 2026-07-17: Added targeted Next.js route invalidation after successful Server Actions for incidents, students, groups, categories, and user roles.
- 2026-07-17: Added Zod v4 Server Action validation, normalized mutation payloads, and Spanish field-level errors in forms.
- 2026-07-17: Reused one request-scoped Supabase server client per mutation while preserving cached server-component profile lookups.
- 2026-07-17: Added typed Supabase SSR browser/session clients, `proxy.ts` route gating, and cached server profile lookups. Moved authenticated pages into protected role route groups and migrated existing writes to server-authorized actions.
- 2026-07-16: Typed browser and server Supabase clients with the generated `Database` schema.
