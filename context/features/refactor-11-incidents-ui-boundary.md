# Feature: Incident CRUD and UI Boundary

## Status

Planned

## Goal

Complete incident CRUD behind the feature boundary and split the incident Client Component into focused, accessible UI responsibilities.

## Standards References (`/context/coding-standards.md`)

- `Coding Standards > Core conventions > React and Next.js`
- `Coding Standards > Core conventions > Naming and styling`
- `Architecture Contract > 4. UI components`
- `Architecture Contract > 5. Feature modules`
- `Architecture Contract > 6. Server Actions`
- `Architecture Contract > 7. Route Handlers`
- `Architecture Contract > 8. Deferred modal data`
- `Architecture Contract > 9. Validation contract`
- `Architecture Contract > 13. Authentication and authorization`
- `Architecture Contract > 14. Types and contracts`
- `Architecture Contract > 15. Cache and refresh contract`
- `Architecture Contract > 17. Error handling`

## Dependency

Complete Feature 10 first. Feature 01 must already enforce incident ownership through RLS.

## Public Contracts

- Extend `IncidentListItem` with server-derived `canManage`.
- Add `UpdateIncidentInput` without `studentId`, `teacherId`, role, or capability fields.
- Add `StudentSummary` with `id` and `name` for deferred group-scoped selection.
- Add `GET /api/groups/:groupId/students` for the create dialog's deferred student read.

## Permission Rules

- Every authenticated role can read and create incidents.
- Teachers can update/delete only incidents they created.
- Coordinators and admins can update/delete every incident.
- Update may change category, severity, description, and date.
- Student and original teacher attribution are immutable. A wrong-student incident must be deleted and recreated.
- UI capability flags improve UX but never replace feature authorization or RLS.

## Component Hierarchy

```text
IncidentsPage (Server Component)
└── IncidentsView (Client coordinator)
    ├── Header actions
    ├── IncidentFilters
    ├── IncidentList
    ├── IncidentFormDialog (one shared create/edit dialog)
    └── IncidentDeleteDialog (one confirmation dialog)
```

`IncidentList` renders rows and invokes callbacks. `IncidentsView` owns one active-dialog state and mounts at most one dialog.

## Scope

- Add incident update/delete feature operations and thin validated Actions.
- Add `incidents:manage` role eligibility and enforce row ownership inside the incident feature module.
- Derive `canManage` for each incident from the authenticated actor.
- Revalidate `/incidentes` and `/dashboard` only after successful writes.
- Remove all student options from the initial incident page payload.
- Add authenticated group-student retrieval and expose it through a validated Route Handler.
- Update the existing authorization migration so authenticated incident readers can also read the user profiles required to display incident authors.
- In create mode, require group selection before fetching and selecting a student.
- Ignore or abort stale student responses when the selected group changes.
- Keep the student read-only in edit mode.
- Keep `IncidentsView` as the coordinator for filters, dialogs, and the visible collection.
- Extract `IncidentFilters`, `IncidentList`, `IncidentFormDialog`, and `IncidentDeleteDialog`.
- Preserve Spanish labels, ordering, responsive behavior, and existing filter/CSV semantics.
- Use existing shadcn primitives and ordinary React state/transitions.

## Out of Scope

- Changing student or teacher attribution during incident update.
- Rewriting filter semantics or CSV serialization; that remains Feature 12.
- Soft deletion, unrelated schema changes or migrations, RPC functions, URL-backed dialogs, client caching libraries, form libraries, Zustand, or TanStack Query.
- New shadcn primitives or a component folder hierarchy.

## Implementation Steps

1. Update contracts and add the role-level incident management permission.
2. Add shared incident ownership authorization plus update/delete feature operations.
3. Add validated update/delete Actions and precise route invalidation.
4. Add the authenticated group-student feature read and Route Handler.
5. Derive per-row UI capabilities in the incident page data.
6. Extract filters and list rendering without changing filter semantics.
7. Add the shared create/edit Dialog and separate delete AlertDialog.
8. Add loading, empty, error, and stale-request handling for group-scoped students.
9. Add focused boundary tests and verify all roles in the browser.

## Risks

- Role eligibility does not replace row-level ownership authorization.
- Update/delete must never write `student_id` or `teacher_id`.
- A late student request must not replace options for a newer group selection.
- The UI split must not pull Feature 12's CSV/filter rewrite into this increment.
- The Route Handler must call a feature function and never query Supabase directly.
- The approved user-profile read-policy correction intentionally updates the existing authorization migration because production will be reset and recreated from the committed migration history after all planned features are complete.

## Tests

- Teacher manages an owned incident and is forbidden from another teacher's incident.
- Coordinator/admin manage every incident.
- Page mapping produces the correct `canManage` value.
- Update never writes student or teacher identity.
- Missing incident/category and invalid inputs return safe failures.
- Successful create/update/delete invalidates only incidents and dashboard.
- The group-student endpoint rejects invalid, missing, and unauthenticated requests.
- Group selection returns only that group's students and handles loading, empty, error, and stale responses.
- Dialog flows, filters, ordering, empty states, and responsive accessibility work for every relevant role.

## Done Checklist

- [ ] Feature code and RLS enforce the approved ownership matrix.
- [ ] Student and teacher identity remain immutable during update.
- [ ] The initial incident payload does not contain all student options.
- [ ] The deferred Route Handler contains no database query.
- [ ] `IncidentsView` owns one active dialog and no row mounts its own dialog.
- [ ] Each extracted component has one visible responsibility.
- [ ] Existing filtering and CSV behavior remain unchanged.
- [ ] No dependency, state library, form library, or unrelated schema migration was added.
- [ ] The authorization migration allows authenticated incident readers to resolve incident author profiles.
- [ ] Tests and all repository/browser role checks pass.
