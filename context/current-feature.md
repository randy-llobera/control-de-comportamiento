# Current Feature: Categories Feature Boundary

## Status

In Progress

## Goals

<!-- Add goals here -->

- Move all category reads and writes into a dedicated feature module.
- Implement coordinator/admin-authorized category list, create, update, and delete operations while denying teachers.
- Server-render the category page's initial data and keep client interaction in focused components.
- Return safe Spanish failures for duplicate names and referenced-category deletion conflicts.
- Invalidate only `/categorias`, `/incidentes`, and `/dashboard` after successful category writes.
- Add coverage for mapping, authorization, validation, conflicts, Actions, and category CRUD behavior.

## Notes

<!-- Add notes here -->

- Depends on Feature 07, which is recorded as complete in History.
- Follow the groups feature-boundary pattern without introducing a generic named-record abstraction.
- Add `types/categories.ts`, `lib/categories.ts`, and `actions/categories.ts`; remove category operations from `actions/mutations.ts`.
- Public contracts: `CategoryListItem` exposes `id`, `name`, and creator display name; `CreateCategoryInput` contains `name`; `UpdateCategoryInput` contains `id` and `name`; `createdBy` remains server-derived.
- Convert `categorias/page.tsx` to a Server Component and remove browser category table reads and post-Action reloads.
- Category child component names must start with `Category` or `Categories`.
- Reuse existing shadcn primitives. Do not add schema or permission changes, incident-page migration, or new component/state libraries.
- Source spec: `context/features/refactor-08-categories-feature-boundary.md`.

## History

<!-- Keep this updated. Earliest to latest -->

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
