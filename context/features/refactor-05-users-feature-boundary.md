# Feature: Users Feature Boundary

## Status

Planned

## Goal

Move user-management reads, role assignment, authorization, and mapping behind a server-only users feature module.

## Standards References

- `Architecture Contract > 1. Layer model`
- `Architecture Contract > 3. Server Pages`
- `Architecture Contract > 5. Feature modules`
- `Architecture Contract > 6. Server Actions`
- `Architecture Contract > 13. Authentication and authorization`
- `Architecture Contract > 14. Types and contracts`

## Dependency

Complete Feature 04 first.

## Public Contracts

- `UserListItem`: `id`, `displayName`, `schoolRole`, and neutral role data.
- `RoleOption`: `id` and the typed role name.
- `UserPageData`: serializable users and role options.
- `UpdateUserRoleInput`: target `userId` and `roleId`; never accepts the acting user or acting role.

## Scope

- Add `src/types/users.ts` and server-only `src/lib/users.ts`.
- Add `getUserPageData()` with admin authorization and mapped serializable output.
- Add `updateUserRole(input)` with admin authorization and role existence validation.
- Add a thin `actions/users.ts` boundary with Zod validation, known-error mapping, and `/usuarios` invalidation.
- Make `usuarios/page.tsx` a Server Component.
- Move interactive role controls into a focused Client Component using feature contracts.
- Remove users/roles browser queries and the role operation from `actions/mutations.ts`.

## Out of Scope

- Creating/deleting Auth accounts, changing role definitions, or changing user RLS.
- Navigation refactoring; that is Feature 06.
- Optimistic role updates or client caching.

## Implementation Steps

1. Define neutral user-management contracts.
2. Implement admin-authorized reads and role updates in `lib/users.ts` with one request-scoped client per operation.
3. Infer joined query results and map them into feature contracts.
4. Create the validated user Action and remove the old mutation export.
5. Convert the page to server initial data and extract only the role interaction UI.
6. Add mapping, authorization, invalid-role, and Action-result tests.
7. Verify admin behavior in the browser and run all checks.

## Risks

- Layout authorization cannot replace feature-operation authorization.
- Role changes must not trust role names or acting-user IDs from the browser.
- Removing the browser reload must still leave the page current after invalidation.

## Tests

- Admin receives mapped users/roles and can change a valid role.
- Teacher/coordinator calls are rejected by the feature operation.
- Unknown user/role IDs map to safe expected failures.
- The page contains no `.from()` or browser Supabase import.

## Done Checklist

- [ ] User-management table access exists only in `lib/users.ts`.
- [ ] The Action contains no Supabase query or authorization rule.
- [ ] The page is a Server Component and the interactive child uses neutral contracts.
- [ ] Role changes invalidate `/usuarios` only.
- [ ] Targeted tests and `npm test`, lint, typecheck, and build pass.

