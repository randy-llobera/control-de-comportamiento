# Current Feature: Incident Filtering and CSV

## Status

In Progress

## Goals

<!-- Add goals here -->

- Add `src/utils/incidents.ts` for the pure incident filter, CSV serializer, and filename formatter over mapped `IncidentListItem` contracts.
- Derive one ordered `filteredIncidents` collection in `IncidentsView` and pass that exact array to both `IncidentList` and the CSV export path.
- Add a pure CSV serializer with Spanish headers, an Excel-compatible UTF-8 BOM, and correct escaping for commas, quotes, CR/LF, accented characters, and empty values.
- Preserve the `incidentes-YYYYMMDD.csv` filename and keep only Blob, object URL, anchor, and URL-revocation mechanics in the Client Component.
- Add deterministic filter, serializer, filename, and visible-list-versus-export coverage.

## Notes

<!-- Add notes here -->

- Dependency: Feature 11 must be complete so the shared filtered collection has a stable owner.
- Keep environment-agnostic incident transformations and their focused tests in `src/utils/incidents.ts` and `src/utils/incidents.test.ts`; keep browser download mechanics in `IncidentsView`.
- Required flow: initial incidents -> `filterIncidents(initialIncidents, activeFilters)` -> `filteredIncidents` -> list and CSV serializer.
- The export handler must use the already-derived `filteredIncidents`; it must not filter again, query, fetch related data, or reinterpret filter state.
- Preserve source ordering and use mapped student, group, category, severity, description, teacher, and date display data already present in each list item.
- Out of scope: server-generated files, Route Handlers, new filters, pagination, sorting changes, spreadsheet libraries, and export-time data fetching.
- Main risks: filtering drift between visible and exported rows, malformed CSV escaping, and related-record lookups during export.
- Prefix CSV content with the UTF-8 BOM so spreadsheet applications detect accented Spanish text correctly instead of guessing a legacy encoding.

## History

<!-- Keep this updated. Earliest to latest -->

- 2026-07-31: Completed ownership-aware incident update/delete, group-scoped student loading, focused incident dialogs/filters/list components, and role-based boundary coverage.
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
