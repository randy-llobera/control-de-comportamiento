# Feature: Groups Feature Boundary

## Status

Planned

## Goal

Move all group reads and writes into a server-only feature module and server-render the group page's initial data.

## Standards References

- `Architecture Contract > 1. Layer model`
- `Architecture Contract > 3. Server Pages`
- `Architecture Contract > 4. UI components`
- `Architecture Contract > 5. Feature modules`
- `Architecture Contract > 6. Server Actions`
- `Architecture Contract > 15. Cache and refresh contract`

## Dependency

Complete Feature 06 first.

## Public Contracts

- `GroupListItem`: `id`, `name`, and creator display name.
- `CreateGroupInput`: `name` only.
- `UpdateGroupInput`: `id` and `name`.
- `createdBy` is derived from the authenticated actor and never accepted from UI input.

## Scope

- Add `types/groups.ts`, server-only `lib/groups.ts`, and `actions/groups.ts`.
- Implement coordinator/admin-authorized list, create, update, and delete operations.
- Validate uniqueness/conflicts and map database results into neutral contracts.
- Convert `grupos/page.tsx` to a Server Component.
- Extract a focused Client Component for create/edit/delete interaction.
- Remove group database behavior from `actions/mutations.ts` and all browser group table queries on this page.
- Invalidate `/grupos`, `/estudiantes`, `/incidentes`, and `/dashboard` after successful group writes.

## Out of Scope

- Student or incident page migrations.
- Changing group schema, permissions, or Spanish URL/labels.
- Generic CRUD factories shared with categories.

## Implementation Steps

1. Define group contracts.
2. Implement authorized feature operations with one client per top-level operation.
3. Add separate create/update/delete Action schemas and safe result mapping.
4. Convert the page to server initial data and pass contracts to the interactive view.
5. Remove old group mutations and browser reloads.
6. Add mapping, authorization, validation, conflict, and Action tests.
7. Verify coordinator/admin CRUD and teacher denial.

## Risks

- Group deletion may fail when students reference the group; return a safe conflict.
- Broad invalidation can hide incorrect dependency mapping.
- Similarity with categories does not justify a premature generic abstraction.

## Tests

- Coordinator/admin can create, rename, and delete an unreferenced group.
- Teacher operations return forbidden.
- Duplicate names and referenced deletion return safe Spanish failures.
- Page initial data renders without browser table reads.

## Done Checklist

- [ ] All group table access is in `lib/groups.ts`.
- [ ] Actions are thin and input is structurally validated.
- [ ] The page is server-rendered with a focused interactive child.
- [ ] Only affected routes are invalidated after successful writes.
- [ ] Tests and all repository/browser checks pass.
