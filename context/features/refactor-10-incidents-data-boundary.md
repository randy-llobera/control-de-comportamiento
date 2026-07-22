# Feature: Incidents Data Boundary

## Status

Planned

## Goal

Move incident initial reads and creation behind a server-only feature module while preserving the current incident screen behavior.

## Standards References

- `Architecture Contract > 3. Server Pages`
- `Architecture Contract > 5. Feature modules`
- `Architecture Contract > 6. Server Actions`
- `Architecture Contract > 9. Validation contract`
- `Architecture Contract > 13. Authentication and authorization`
- `Architecture Contract > 14. Types and contracts`

## Dependency

Complete Feature 09 first so all incident dependencies expose stable feature contracts.

## Public Contracts

- `IncidentListItem`: serializable incident fields plus mapped student, group, category, and teacher display data.
- `IncidentFormOptions`: mapped student and category choices; group data needed by filters is included without exposing database rows.
- `IncidentPageData`: ordered incidents and form/filter options.
- `CreateIncidentInput`: `studentId`, `categoryId`, severity, description, and date. It never accepts `teacherId`.

## Scope

- Add `types/incidents.ts`, server-only `lib/incidents.ts`, and `actions/incidents.ts`.
- Add `getIncidentPageData()` for authenticated initial reads.
- Add `createIncident(input)` with server-derived actor identity and business validation for referenced records.
- Infer the joined query shape and map it to neutral serialized contracts.
- Convert `incidentes/page.tsx` to a Server Component.
- Move the existing interactive screen intact into an English-named Client Component receiving initial data.
- Remove incident creation from `actions/mutations.ts` and all browser table reads from the incident screen.

## Out of Scope

- Incident edit/delete UI or operations.
- Splitting the large Client Component; that is Feature 11.
- Rewriting filtering or CSV; that is Feature 12.
- Deferred modal reads or Route Handlers.

## Implementation Steps

1. Define mapped page, list, option, severity, and create-input contracts.
2. Implement the joined page read with one request-scoped client and authenticated actor verification.
3. Implement create authorization/business validation and derive `teacher_id` from the actor.
4. Add the validated thin create Action and precise incident/dashboard invalidation.
5. Convert the page to a server wrapper and move current interaction into `IncidentsView` with initial props.
6. Remove browser queries and the post-create reload.
7. Add query-mapping, business-validation, actor-identity, and Action tests.

## Risks

- Joined rows may be nullable even when schema relationships are required; mapping must fail safely or handle the actual type.
- A Client Component must receive only serializable contracts.
- The mechanical page/view move must not become an unplanned visual refactor.

## Tests

- All authenticated roles receive mapped incident page data.
- Creation ignores any untrusted identity field and writes the current actor as teacher.
- Missing student/category and invalid structural input return safe failures.
- Successful creation invalidates incidents and dashboard data without a browser reload query.

## Done Checklist

- [ ] Incident application-table access exists only in server feature modules.
- [ ] The route page is a Server Component.
- [ ] `IncidentsView` starts from mapped initial props.
- [ ] The create Action contains no Supabase query or authorization rule.
- [ ] Tests and all repository/browser checks pass.

