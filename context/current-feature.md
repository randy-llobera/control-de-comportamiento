# Current Feature: Dashboard Feature Boundary

## Status

In Progress

## Goals

<!-- Add goals here -->

- Move dashboard reads, coordinator/admin authorization, aggregation, and mapping to the server.
- Convert `dashboard/page.tsx` to a Server Component while preserving its Spanish labels and visual output.
- Define neutral `DashboardSummary`, `RecentIncident`, and `DashboardPageData` contracts in `types/dashboard.ts`.
- Keep deterministic aggregation and recent-item ordering inside the dashboard feature module, with focused feature-module tests.
- Add feature-module coverage for authorization and database result mapping.

## Notes

<!-- Add notes here -->

- Dependency: Feature 12 is complete.
- Add server-only `lib/dashboard.ts` with one authorized `getDashboardPageData()` read for coordinators and admins.
- Query the required incident relationships once, then map, aggregate, and order the results inside `lib/dashboard.ts`.
- Keep only genuine browser/chart interaction client-side; keep the page fully server-rendered if the current screen is static.
- Preserve the current metrics, date semantics, recent-item ordering, limit, Spanish labels, and visual output.
- Use the shared `utils/date.ts` formatter so dashboard, incident-list, delete-confirmation, and CSV dates consistently use `DD-MM-YYYY`; keep form and database values in `YYYY-MM-DD`.
- Out of scope: new metrics, date filters, chart libraries, client polling, caching, public APIs, generic analytics abstractions, and Route Handlers.
- Risks: server/browser timezone differences may change date presentation; multiple queries may add work or inconsistent snapshots; layout checks do not replace feature authorization; database query types must remain internal to the dashboard feature module.
- Tests: cover empty data, exact totals and grouped counts, recent ordering/limit, coordinator/admin success, teacher denial, and database-specific mapping.
- Browser verification: an admin promoted a disposable teacher to coordinator and confirmed dashboard access, then demoted the same user to teacher and confirmed the dashboard link disappeared and direct `/dashboard` access redirected to `/incidentes`.
- Done when dashboard data access, authorization, mapping, aggregation, and ordering are server-owned and tested; browser Supabase reads and effect/loading flows are removed; shared displayed/exported dates use `DD-MM-YYYY`; no unnecessary Client Component or Route Handler exists; and repository plus browser role checks pass.

## History

<!-- Keep this updated. Earliest to latest -->

- 2026-08-03: Added one shared incident filter for list and export, Excel-compatible UTF-8 CSV serialization, focused utility tests, and the `src/utils` application utility boundary.
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
