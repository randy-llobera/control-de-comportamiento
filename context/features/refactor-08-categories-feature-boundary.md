# Feature: Categories Feature Boundary

## Status

Planned

## Goal

Move all category reads and writes into a feature module and server-render the category page's initial data.

## Standards References ('/context/coding-standards.md')

- `Architecture Contract > 1. Layer model`
- `Architecture Contract > 3. Server Pages`
- `Architecture Contract > 4. UI components`
- `Architecture Contract > 5. Feature modules`
- `Architecture Contract > 6. Server Actions`
- `Architecture Contract > 15. Cache and refresh contract`

## Dependency

Complete Feature 07 first.

## Public Contracts

- `CategoryListItem`: `id`, `name`, and creator display name.
- `CreateCategoryInput`: `name` only.
- `UpdateCategoryInput`: `id` and `name`.
- `createdBy` remains server-derived.

## Scope

- Follow the same pattern as with 'groups' in `context/features/refactor-07-groups-feature-boundary.md`.
- Add `types/categories.ts`, `lib/categories.ts`, and `actions/categories.ts`.
- Implement coordinator/admin-authorized list, create, update, and delete operations.
- Convert `categorias/page.tsx` to a Server Component with a focused interactive child. Child components start with Categorie(s) suffix.
- Use existing shadcn primitives in `/src/components/ui`. Only add new primitives when the existing is insufficient.
- Remove category operations from `actions/mutations.ts` and browser category queries from this page.
- Map uniqueness and referenced-delete conflicts to known safe failures.
- Invalidate `/categorias`, `/incidentes`, and `/dashboard` after successful category writes.

## Out of Scope

- Incident page migration or category schema/permission changes.
- A shared generic named-record repository/action abstraction.
- New component or state libraries.

## Implementation Steps

1. Define category contracts and result mapping.
2. Implement authorized feature reads/writes.
3. Add validated thin Actions and precise invalidation.
4. Convert the page and extract interactive form/list behavior.
5. Remove old category mutations and post-Action browser reloads.
6. Add mapping, authorization, validation, conflict, and Action tests.
7. Verify coordinator/admin CRUD and teacher denial.

## Risks

- Deleting a category referenced by incidents must remain a safe conflict.
- Copying group code blindly can preserve the wrong paths/messages/contracts.
- Client state must reconcile with updated server props after Actions.

## Tests

- Coordinator/admin can create, rename, and delete an unreferenced category.
- Teacher operations are forbidden.
- Duplicate names and referenced deletion return safe Spanish failures.
- No category browser table read remains on the category page.

## Done Checklist

- [ ] All category table access is in `lib/categories.ts`.
- [ ] Actions contain no feature authorization or Supabase query.
- [ ] The page is server-rendered with focused interaction UI.
- [ ] Invalidation covers only category consumers.
- [ ] Tests and all repository/browser checks pass.
