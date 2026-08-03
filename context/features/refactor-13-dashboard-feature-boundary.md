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
- Add `utils/dashboard.ts` for deterministic aggregation and recent-item ordering over neutral dashboard contracts, with focused tests in `utils/dashboard.test.ts`.
- Add `getDashboardPageData()` with coordinator/admin authorization.
- Query the required incident relationships once, map database results to neutral inputs in `lib/dashboard.ts`, and pass those inputs to the pure dashboard utilities.
- Convert `dashboard/page.tsx` to a Server Component.
- Keep only genuine chart/browser interaction client-side; if the current screen is static, keep it fully server-rendered.
- Add utility tests for aggregation/ordering and feature-module tests for authorization and database-specific result mapping.

## Out of Scope

- New metrics, date filters, chart libraries, client polling, caching, or a public API.
- Moving dashboard logic into a generic analytics layer.
- Route Handlers; there is no current HTTP caller.

## Implementation Steps

1. Record the exact current metrics and recent-item ordering.
2. Define the aggregate contracts and the neutral inputs required by the pure calculations.
3. Implement one authorized page-data read and map query results to those neutral inputs in `lib/dashboard.ts`.
4. Implement deterministic aggregation and recent-item ordering in `utils/dashboard.ts` without Supabase, React, Next.js, browser, environment, or side-effect dependencies.
5. Convert the page to server data and remove browser Supabase/effect/loading state.
6. Preserve all Spanish labels and current visual output.
7. Add utility tests for aggregation, empty data, and ordering plus feature-module authorization/mapping tests.
8. Verify coordinator/admin access and teacher denial.

## Risks

- Date/time grouping can change if server and browser timezone behavior differs; preserve current date semantics explicitly.
- Multiple queries can introduce unnecessary work and inconsistent snapshots.
- Layout checks do not replace feature authorization.
- Passing Supabase query types into `utils/dashboard.ts` would couple an environment-neutral utility to the data-access layer.

## Tests

- Empty data produces zero/empty states without errors.
- Known fixtures produce exact totals and grouped counts.
- Recent incidents preserve the current ordering/limit.
- Teacher is forbidden; coordinator/admin succeed.

## Done Checklist

- [ ] Dashboard data access and authorization are server-owned.
- [ ] Pure aggregation and ordering live in `utils/dashboard.ts` and depend only on neutral contracts.
- [ ] The page contains no browser Supabase read or `useEffect` loading flow.
- [ ] Aggregations are pure, deterministic, and tested.
- [ ] No unnecessary Client Component or Route Handler was added.
- [ ] Tests and all repository/browser role checks pass.
