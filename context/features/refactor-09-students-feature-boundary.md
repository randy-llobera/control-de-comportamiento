# Feature: Students Feature Boundary

## Status

Planned

## Goal

Move student data access behind a feature module while enforcing authenticated creation and admin-only update/delete in the application boundary and UI.

## Standards References ('/context/coding-standards.md')

- `Architecture Contract > 3. Server Pages`
- `Architecture Contract > 5. Feature modules`
- `Architecture Contract > 9. Validation contract`
- `Architecture Contract > 13. Authentication and authorization`
- `Architecture Contract > 15. Cache and refresh contract`
- `Architecture Contract > 17. Error handling`

## Dependency

Complete Feature 08 first. Feature 01 must already enforce the same rule through RLS.

## Public Contracts

- `StudentListItem`: `id`, `name`, and mapped group data.
- `StudentGroupOption`: `id` and `name`.
- `StudentPageData`: students, group options, and `canManageStudents` for admin-only edit/delete controls.
- Separate create and update inputs; neither accepts actor role or authorization flags.

## Scope

- Follow the same pattern as with 'groups' and 'categories' in `context/features/refactor-07-groups-feature-boundary.md` and `/context/features/refactor-08-categories-feature-boundary.md`
- Add `types/students.ts`, `lib/students.ts`, and `actions/students.ts`.
- Allow every authenticated role to list/create students.
- Require admin for update/delete in feature operations and UI controls.
- requirePermission() function is available in `/src/lib/auth.ts`. Make sure you add the required entries to the permission matrix.
- Validate group existence and map unique/foreign-key conflicts.
- Convert `estudiantes/page.tsx` to a Server Component with focused interaction UI. Child components start with Student(s) suffix.
- Use existing shadcn primitives in `/src/components/ui`. Only add new primitives when the existing is insufficient.
- Remove student operations from `actions/mutations.ts` and browser student/group reads from this page.
- Invalidate `/estudiantes`, `/incidentes`, and `/dashboard` after successful student writes.

## Out of Scope

- Group management, incident migration, or student ownership fields.
- Allowing the browser to supply `canManageStudents` as trusted authorization.
- Optimistic updates or client caching.

## Implementation Steps

1. Define mapped student/page/input contracts.
2. Implement authenticated list/create and admin-only update/delete operations.
3. Add separate validated Actions with known-error mapping.
4. Convert the page to server data and pass server-derived capability data to the interactive child.
5. Hide edit/delete controls for teachers/coordinators while keeping create available.
6. Remove old student mutation/reload code and add tests.
7. Verify all three roles in the browser and direct denied calls.

## Risks

- UI capability flags improve UX but cannot replace feature authorization or RLS.
- Student deletion can conflict with referenced incidents.
- Splitting create/update changes the current combined `saveStudent` interface and all consumers must migrate together.

## Tests

- Teacher/coordinator/admin can read and create students.
- Only admin sees and successfully uses edit/delete controls.
- Direct teacher/coordinator update/delete Action calls are forbidden.
- Invalid groups, duplicate students, and referenced deletion return safe errors.

## Done Checklist

- [ ] Student and group-option reads are server-owned.
- [ ] Feature operations enforce the approved permission matrix.
- [ ] Non-admin UI exposes no edit/delete controls.
- [ ] Old student mutation code and browser reloads are removed.
- [ ] Tests and all repository/browser role checks pass.
