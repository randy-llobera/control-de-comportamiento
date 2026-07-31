# Current Feature: Incident CRUD and UI Boundary

## Status

In Progress

## Goals

<!-- Add goals here -->

- Add ownership-aware incident update/delete operations and validated Actions.
- Allow teachers to manage only their own incidents while coordinators/admins manage all.
- Keep student and teacher identity immutable during incident updates.
- Load create-form students by selected group through a validated deferred Route Handler.
- Split the incident UI into focused filters, list, form-dialog, and delete-dialog components.
- Preserve existing filter and CSV behavior for Feature 12.
- Add focused boundary tests and browser verification for every relevant role.
## Notes

<!-- Add notes here -->

- Dependency: Feature 10 is complete and Feature 01 already enforces ownership through RLS.
- Extend incident contracts with `canManage` and `UpdateIncidentInput`.
- Add `StudentSummary` and `getGroupStudents()` for deferred group-scoped reads.
- Add `incidents:manage` role eligibility; enforce row ownership privately in `lib/incidents.ts`.
- Add `GET /api/groups/:groupId/students`; the Handler validates transport input and calls the feature module.
- Update the existing authorization migration so authenticated readers can resolve the user profiles displayed as incident authors.
- `IncidentsView` owns one active dialog. `IncidentList` renders rows and callbacks only.
- Create/edit share `IncidentFormDialog`; deletion uses `IncidentDeleteDialog`.
- Edit may change category, severity, description, and date, but not student or teacher.
- Use existing shadcn primitives and ordinary React state/transitions only.
- The RLS policy correction is accepted Feature 11 scope. Production will be reset and recreated from the committed migration history after all planned features, so the existing authorization migration is the intended source.
- Out of scope: filtering/CSV rewrite, soft deletion, unrelated schema changes or migrations, new dependencies, client caches, and form/state libraries.
## History

<!-- Keep this updated. Earliest to latest -->

- 2026-07-27: Moved incident reads and creation behind an authenticated feature boundary with server-rendered mapped data, actor-derived identity, and focused tests.
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
