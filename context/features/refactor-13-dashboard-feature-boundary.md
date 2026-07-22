# Feature: Dashboard Feature Boundary

## Status

Planned

## Goal

Move dashboard reads, authorization, aggregation, and mapping to the server and make the dashboard page a Server Component.

## Standards References

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
- Add `getDashboardPageData()` with coordinator/admin authorization.
- Query the required incident relationships once and derive deterministic aggregates on the server.
- Convert `dashboard/page.tsx` to a Server Component.
- Keep only genuine chart/browser interaction client-side; if the current screen is static, keep it fully server-rendered.
- Add pure aggregation/mapping tests.

## Out of Scope

- New metrics, date filters, chart libraries, client polling, caching, or a public API.
- Moving dashboard logic into a generic analytics layer.
- Route Handlers; there is no current HTTP caller.

## Implementation Steps

1. Record the exact current metrics and recent-item ordering.
2. Define the aggregate contracts.
3. Implement one authorized page-data read and pure aggregation helpers.
4. Convert the page to server data and remove browser Supabase/effect/loading state.
5. Preserve all Spanish labels and current visual output.
6. Add aggregation, empty-data, ordering, and authorization tests.
7. Verify coordinator/admin access and teacher denial.

## Risks

- Date/time grouping can change if server and browser timezone behavior differs; preserve current date semantics explicitly.
- Multiple queries can introduce unnecessary work and inconsistent snapshots.
- Layout checks do not replace feature authorization.

## Tests

- Empty data produces zero/empty states without errors.
- Known fixtures produce exact totals and grouped counts.
- Recent incidents preserve the current ordering/limit.
- Teacher is forbidden; coordinator/admin succeed.

## Done Checklist

- [ ] Dashboard data access and authorization are server-owned.
- [ ] The page contains no browser Supabase read or `useEffect` loading flow.
- [ ] Aggregations are pure, deterministic, and tested.
- [ ] No unnecessary Client Component or Route Handler was added.
- [ ] Tests and all repository/browser role checks pass.

