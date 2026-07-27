# Current Feature: Students Feature Boundary

## Status

In Progress

## Goals

<!-- Add goals here -->

- Move student and group-option reads behind a server-owned feature boundary.
- Allow every authenticated role to list and create students.
- Restrict student update/delete operations and UI controls to admins.
- Validate student inputs and group existence, and return safe errors for known conflicts.
- Remove legacy student mutations and browser-side student/group reads.
- Invalidate `/estudiantes`, `/incidentes`, and `/dashboard` after successful writes.
- Add tests and verify the role permission matrix in the browser and through direct Action calls.

## Notes

<!-- Add notes here -->

- Dependency: Complete Feature 08 first. Feature 01 must already enforce the same permissions through RLS.
- Follow the established groups and categories feature-boundary patterns.
- Add `types/students.ts`, `lib/students.ts`, and `actions/students.ts`.
- Public contracts: `StudentListItem`, `StudentGroupOption`, `StudentPageData`, and separate create/update inputs that do not accept actor roles or authorization flags.
- Add the required student permissions to the matrix used by `requirePermission()` in `src/lib/auth.ts`.
- Convert `estudiantes/page.tsx` to a Server Component with focused interactive child components named with a Student/Students prefix.
- Use existing shadcn primitives unless they are insufficient.
- Remove student operations from `actions/mutations.ts`.
- Test authenticated read/create access, admin-only update/delete, direct forbidden calls, invalid groups, duplicate students, and referenced deletion.
- Out of scope: group management, incident migration, student ownership fields, trusted browser authorization flags, optimistic updates, and client caching.
- Risks: UI capability flags cannot replace feature authorization or RLS; referenced incidents can block deletion; all `saveStudent` consumers must migrate with the split create/update contract.
- Standards: server pages, feature modules, validation, authentication and authorization, cache and refresh, and error handling.

## History

<!-- Keep this updated. Earliest to latest -->

- 2026-07-24: Moved category management behind an authorized feature boundary with server-rendered data, centralized permission checks, shadcn dialogs, and targeted tests.
- 2026-07-24: Moved group management behind an authorized feature boundary with server-rendered data, validated Actions, shadcn dialogs, and targeted tests.
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
