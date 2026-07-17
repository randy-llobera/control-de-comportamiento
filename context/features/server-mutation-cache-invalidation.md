# Feature: Server Mutation Cache Invalidation

## Status

Planned

## Goal

Ensure every successful Server Action invalidates the server-rendered routes whose data it changes, so subsequent renders and navigation never use stale route data.

## Why

Current mutations return success to the browser, and pages refetch their own data client-side. As protected pages move their initial reads to Server Components, that pattern is no longer sufficient: cached route output must be invalidated after a write.

This feature centralizes route invalidation alongside the mutation that changes the data. It prepares the existing Server Actions for server-rendered protected pages without introducing client caching, optimistic updates, or realtime subscriptions.

## Dependency

Complete Server-Side Authentication and Authorization, Auth Helper Client Reuse, and Server Action Input Validation first. This feature modifies the finalized, validated Server Actions in `src/actions/mutations.ts`.

Server-Rendered Protected Page Data depends on this feature.

## Scope

- Use `revalidatePath()` after each successful mutation in `src/actions/mutations.ts`.
- Define the affected route paths for each mutation in one clear mapping or helper near the actions.
- Invalidate every page that displays the changed entity or derived data.
- Preserve current action return shapes and authorization behavior.
- Confirm client components refresh their visible data after a successful mutation when the current route must update immediately.
- Use Context7 to gather the most up-to-date Next.js documentation for Server Actions, `revalidatePath()`, and client refresh behavior when implementation begins.

## Invalidation Map

| Mutation | Routes to invalidate |
| --- | --- |
| Create incident | `/incidentes`, `/dashboard` |
| Save or delete student | `/estudiantes`, `/incidentes`, `/dashboard` |
| Save or delete group | `/grupos`, `/estudiantes`, `/incidentes`, `/dashboard` |
| Save or delete category | `/categorias`, `/incidentes`, `/dashboard` |
| Update user role | `/usuarios` and the affected user's protected navigation/route access on their next request |

## Out Of Scope

- Converting route pages to Server Components or extracting client interaction components.
- Adding React Query, SWR, Zustand, realtime subscriptions, or optimistic updates.
- Changing mutation authorization, input validation, RLS policies, schema, or page URLs.
- Adding a broad caching abstraction beyond the small route-invalidation mapping needed here.

## Implementation Steps

1. Use Context7 to verify the current Next.js behavior of `revalidatePath()` in Server Actions and when `router.refresh()` is required in a Client Component.
2. Define route-path constants or a small mapping for the invalidation map in `src/actions/mutations.ts` or a focused adjacent utility.
3. Update `runMutation` or each mutation action so `revalidatePath()` runs only after a successful database write.
4. Confirm each action invalidates all direct and derived-data pages listed in the map.
5. Where a current Client Component must show updated data immediately, refresh it after action success without duplicating the mutation.
6. Add focused tests for the route mapping/helper if extracted; do not add component test tooling.
7. Run type checking, linting, and a production build.

## Risks

- Missing a dependent route creates stale data that can be difficult to notice until navigation or a refresh.
- Calling `revalidatePath()` when a mutation fails can unnecessarily invalidate data and hide failure behavior; it must run only after success.
- Over-invalidating every route is correct but inefficient. Keep invalidation targeted to the routes that display the changed data.
- Role changes must not rely only on cache invalidation: route authorization and RLS remain the permission boundaries.

## Done Checklist

- [ ] Every successful mutation has an explicit, targeted invalidation path list.
- [ ] Failed mutations do not invalidate routes.
- [ ] Creating an incident refreshes incident and dashboard data on the next server render.
- [ ] Student, group, and category changes refresh every affected list and derived dashboard data.
- [ ] Updating a user role refreshes user-management data and does not weaken server role checks.
- [ ] No client caching dependency or optimistic update behavior is introduced.
- [ ] `npm run typecheck`, `npm run lint`, and `npm run build` pass.
