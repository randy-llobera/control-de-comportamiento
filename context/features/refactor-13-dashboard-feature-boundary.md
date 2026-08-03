# Feature: Dashboard Feature Boundary

## Status

Planned

## Goal

Move dashboard reads, authorization, aggregation, and mapping to the server and make the dashboard page a Server Component.

## Standards References (`/context/coding-standards.md`)

- `Architecture Contract > 2. Folder structure > Pure utilities`
- `Architecture Contract > 3. Server Pages`
- `Architecture Contract > 4. UI components`
- `Architecture Contract > 5. Feature modules`
- `Architecture Contract > 13. Authentication and authorization`
- `Architecture Contract > 14. Types and contracts`

## Dependency

Complete Feature 12 first.

## Public Contracts

- `DashboardSummary`: totals and grouped category/severity/group counts required by the current screen.
- `RecentIncident`: the mapped display fields required by the recent-incidents list.
- `DashboardPageData`: summary plus recent incidents.

## Scope

- Add `types/dashboard.ts` and server-only `lib/dashboard.ts` because dashboard output is an aggregate contract, not an incident-list contract.
- Keep deterministic aggregation and recent-item ordering inside `lib/dashboard.ts`, with focused coverage in `lib/dashboard.test.ts`.
- Add `getDashboardPageData()` with coordinator/admin authorization.
- Query the required incident relationships once, then map, aggregate, and order the results inside `lib/dashboard.ts`.
- Convert `dashboard/page.tsx` to a Server Component.
- Keep only genuine chart/browser interaction client-side; if the current screen is static, keep it fully server-rendered.
- Use the shared `utils/date.ts` formatter so displayed dashboard and incident dates plus CSV date values consistently use `DD-MM-YYYY`; keep form and database values in `YYYY-MM-DD`.
- Add feature-module tests for aggregation, ordering, authorization, and database-specific result mapping.

## Out of Scope

- New metrics, date filters, chart libraries, client polling, caching, or a public API.
- Moving dashboard logic into a generic analytics layer.
- Route Handlers; there is no current HTTP caller.

## Implementation Steps

1. Record the exact current metrics and recent-item ordering.
2. Define the aggregate page-output contracts.
3. Implement one authorized page-data read and map query results in `lib/dashboard.ts`.
4. Implement deterministic aggregation and recent-item ordering inside the dashboard feature module.
5. Convert the page to server data and remove browser Supabase/effect/loading state.
6. Preserve all Spanish labels and current visual output.
7. Add feature-module tests for aggregation, empty data, ordering, authorization, and database result mapping.
8. Verify coordinator/admin access and teacher denial.

## Risks

- Date/time grouping can change if server and browser timezone behavior differs; preserve current date semantics explicitly.
- Multiple queries can introduce unnecessary work and inconsistent snapshots.
- Layout checks do not replace feature authorization.
- Dashboard aggregation is feature-specific and intentionally remains coupled to the server feature module rather than a reusable utility.

## Tests

- Empty data produces zero/empty states without errors.
- Known fixtures produce exact totals and grouped counts.
- Recent incidents preserve the current ordering/limit.
- Teacher is forbidden; coordinator/admin succeed.
- Browser role verification uses a disposable user promoted to coordinator and then demoted to teacher; the teacher must not see dashboard navigation and direct `/dashboard` access must redirect to `/incidentes`.

## Done Checklist

- [ ] Dashboard data access and authorization are server-owned.
- [ ] Aggregation, mapping, and ordering live in `lib/dashboard.ts` and are covered through the feature boundary.
- [ ] The page contains no browser Supabase read or `useEffect` loading flow.
- [ ] Aggregations are pure, deterministic, and tested.
- [ ] No unnecessary Client Component or Route Handler was added.
- [ ] Displayed and exported incident dates consistently use `DD-MM-YYYY` while form/database values remain ISO dates.
- [ ] Tests and all repository/browser role checks pass.
