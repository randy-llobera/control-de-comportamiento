# Current Feature: Authorization and RLS

## Status

In Progress

## Goals

<!-- Add goals here -->

- Make database authorization match the approved teacher, coordinator, and admin permission matrix.
- Replace broad student policies with authenticated read/create and admin-only update/delete policies.
- Restrict incident update/delete access to the owning teacher or a coordinator/admin.
- Preserve existing group, category, role, and user permissions when they already match the matrix.
- Keep RLS enabled and grants no broader than the policies require.
- Verify allowed and denied operations through user-scoped clients against local Supabase.

## Notes

<!-- Add notes here -->

- Spec: `context/features/refactor-01-authorization-rls.md`
- Dependency: None; this is the first refactoring feature.
- Add a new timestamped migration; do not edit the initial migration or generated Supabase types.
- `teacher_id` for new incidents must always come from the authenticated actor.
- Teacher permissions: read roles/groups/categories; read self; read/create students; read/create incidents and update/delete owned incidents.
- Coordinator permissions: read roles/self; manage groups and categories; read/create students; manage all incidents.
- Admin permissions: read roles; manage users, groups, categories, students, and incidents.
- Out of scope: feature modules, Server Actions, pages, UI changes, new roles, ownership columns, stored procedures, and ORMs.
- Test with distinct authenticated role sessions. Service-role credentials may only set up local fixtures and must not be used for assertions.
- Verify existing group, category, role, and user permissions still match the matrix.
- Done when the policy migration and all matrix cases are verified and `npm run lint`, `npm run typecheck`, and `npm run build` pass.

## History

<!-- Keep this updated. Earliest to latest -->

- 2026-07-17: Added targeted Next.js route invalidation after successful Server Actions for incidents, students, groups, categories, and user roles.
- 2026-07-17: Added Zod v4 Server Action validation, normalized mutation payloads, and Spanish field-level errors in forms.
- 2026-07-17: Reused one request-scoped Supabase server client per mutation while preserving cached server-component profile lookups.
- 2026-07-17: Added typed Supabase SSR browser/session clients, `proxy.ts` route gating, and cached server profile lookups. Moved authenticated pages into protected role route groups and migrated existing writes to server-authorized actions.
- 2026-07-16: Typed browser and server Supabase clients with the generated `Database` schema.
