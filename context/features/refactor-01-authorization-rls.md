# Feature: Authorization and RLS

## Status

Planned

## Goal

Make database authorization match the approved role matrix before application data access is moved into feature modules.

## Standards References

- `Coding Standards > Core conventions > Database and code quality`
- `Architecture Contract > 13. Authentication and authorization`
- `Architecture Contract > 18. Database design and RLS`

## Dependency

None. This is the first refactoring feature.

## Permission Matrix

| Resource | Teacher | Coordinator | Admin |
| --- | --- | --- | --- |
| Roles | Read | Read | Read |
| Users | Read self | Read self | Read/manage all |
| Groups | Read | Read/create/update/delete | Read/create/update/delete |
| Categories | Read | Read/create/update/delete | Read/create/update/delete |
| Students | Read/create | Read/create | Read/create/update/delete |
| Incidents | Read/create; update/delete own | Read/create/update/delete all | Read/create/update/delete all |

`teacher_id` for a new incident always comes from the authenticated actor. This feature does not add incident edit/delete UI.

## Scope

- Add a new migration; do not edit the initial migration.
- Replace broad student policies with explicit authenticated read/create and admin-only update/delete policies.
- Replace broad incident update/delete policies with teacher ownership plus coordinator/admin access.
- Preserve existing group, category, role, and user permissions when they already match the matrix.
- Keep RLS enabled and grants no broader than the policies require.
- Verify direct Supabase API behavior against local Supabase.

## Out of Scope

- Feature modules, Server Actions, pages, or UI changes.
- New roles, ownership columns, stored procedures, or an ORM.
- Regenerating Supabase types for policy-only changes.

## Implementation Steps

1. Audit every existing grant and policy against the matrix.
2. Add a timestamped migration that drops/replaces only conflicting policies.
3. For incident update/delete, allow the row owner or an actor whose role is coordinator/admin.
4. For student update/delete, require the admin role; retain authenticated read/create.
5. Reset local Supabase and verify allowed and denied operations with distinct role sessions.
6. Run the repository verification commands.

## Risks

- A permissive `USING` or `WITH CHECK` expression could preserve unauthorized writes.
- Testing with a service-role client would bypass RLS and produce invalid results.
- Existing authenticated users may lose student edit/delete access by design.

## Tests

- Teacher can update/delete an owned incident but not another teacher's incident.
- Coordinator and admin can update/delete either teacher's incidents.
- Teacher and coordinator can create students but cannot update/delete them.
- Admin can create, update, and delete students.
- Existing group, category, role, and user permissions still match the matrix.

## Done Checklist

- [ ] A new migration contains all policy changes.
- [ ] No applied migration or generated type file was manually edited.
- [ ] Every matrix case was verified through user-scoped local clients.
- [ ] Service-role credentials were used only for local fixture setup, not assertions.
- [ ] `npm run lint`, `npm run typecheck`, and `npm run build` pass.

