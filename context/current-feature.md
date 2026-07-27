# Current Feature: Incidents Data Boundary

## Status

In Progress

## Goals

<!-- Add goals here -->

- Move authenticated incident page reads behind a server-only feature module that returns neutral, serializable contracts.
- Move incident creation behind a validated thin Server Action with permission checks, business validation, and server-derived teacher identity.
- Convert `incidentes/page.tsx` to a Server Component and preserve the existing interactive screen in an English-named `IncidentsView` Client Component.
- Remove incident creation from `actions/mutations.ts`, browser-side incident table reads, and the post-create reload query.
- Add focused tests for query mapping, authorization, validation, actor identity, and route invalidation.

## Notes

<!-- Add notes here -->

- Depends on Feature 09 and follows the established groups, categories, and students feature-boundary pattern.
- Add `types/incidents.ts`, `lib/incidents.ts`, and `actions/incidents.ts`, including `getIncidentPageData()` and `createIncident(input)`.
- Define `IncidentListItem`, `IncidentFormOptions`, `IncidentPageData`, `CreateIncidentInput`, and related severity/option contracts without exposing database rows.
- Add the required incident permissions to the matrix used by `requirePermission()`.
- Preserve the current UI behavior and use existing shadcn primitives.
- Out of scope: incident edit/delete, splitting the large Client Component, filtering or CSV rewrites, deferred modal reads, and Route Handlers.
- Key risks: nullable joined rows, Server-to-Client serialization, and accidental visual refactoring during the page/view move.

## History

<!-- Keep this updated. Earliest to latest -->

- 2026-07-27: Moved student management behind an authenticated feature boundary with server-rendered data, admin-only update/delete, focused dialogs, and targeted tests.
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
