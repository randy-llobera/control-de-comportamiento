# Current Feature: Groups Feature Boundary

## Status

In Progress

## Goals

<!-- Add goals here -->

- Move all group reads and writes into `lib/groups.ts` behind neutral contracts in `types/groups.ts`.
- Add thin, structurally validated create, update, and delete Server Actions in `actions/groups.ts`.
- Authorize group list and mutation operations for coordinators/admins and return forbidden results for teachers.
- Server-render the initial `/grupos` data and isolate create/edit/delete behavior in a focused Client Component.
- Remove legacy group mutations from `actions/mutations.ts` and browser-side group table reads/reloads.
- Invalidate `/grupos`, `/estudiantes`, `/incidentes`, and `/dashboard` after successful writes.
- Cover mapping, authorization, validation, conflicts, Actions, and the coordinator/admin CRUD flow.

## Notes

<!-- Add notes here -->

- Dependency: Feature 06 must be complete.
- Public contracts:
  - `GroupListItem`: `id`, `name`, and creator display name.
  - `CreateGroupInput`: `name`.
  - `UpdateGroupInput`: `id` and `name`.
  - `createdBy` always comes from the authenticated actor, never UI input.
- Preserve the existing group schema, permissions, Spanish URL, and labels.
- Student and incident page migrations and generic CRUD factories are out of scope.
- Duplicate names and deletion of referenced groups must return safe Spanish conflict messages.
- Use one Supabase client per top-level operation and map database rows into neutral contracts.
- Risk: broad route invalidation can obscure incorrect dependency mapping.
- Done when all group table access is isolated, Actions remain thin, initial page data is server-rendered, invalidation is limited to affected routes, and repository/browser checks pass.

## History

<!-- Keep this updated. Earliest to latest -->

- 2026-07-23: Moved navigation to a neutral current-user contract with centralized role validation and preserved role-specific responsive behavior.
- 2026-07-23: Moved user-management reads, role assignment, authorization, and mapping behind the users feature boundary.
- 2026-07-23: Added the Vitest Node test foundation with path aliases, explicit discovery, and shared application-error boundary tests.
- 2026-07-23: Added shared Action and known-error contracts, reusable safe server-boundary messages, and explicit Auth/profile failure handling.
- 2026-07-22: Separated Proxy-scoped Supabase claims verification and session cookie/header refresh handling from route redirect logic.
- 2026-07-22: Enforced role-based Supabase RLS for student and incident writes and verified the permission matrix through user-scoped local clients.
- 2026-07-17: Added targeted Next.js route invalidation after successful Server Actions for incidents, students, groups, categories, and user roles.
- 2026-07-17: Added Zod v4 Server Action validation, normalized mutation payloads, and Spanish field-level errors in forms.
- 2026-07-17: Reused one request-scoped Supabase server client per mutation while preserving cached server-component profile lookups.
- 2026-07-17: Added typed Supabase SSR browser/session clients, `proxy.ts` route gating, and cached server profile lookups. Moved authenticated pages into protected role route groups and migrated existing writes to server-authorized actions.
- 2026-07-16: Typed browser and server Supabase clients with the generated `Database` schema.
