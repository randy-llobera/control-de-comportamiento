# Current Feature: Auth Server Actions

## Status

In Progress

## Goals

<!-- Add goals here -->

- Move login, signup, and logout to validated Server Actions using a new request-scoped Supabase server client per action.
- Validate auth inputs at the server boundary and return safe Spanish messages for expected failures.
- Preserve login redirects, signup email confirmation, logout redirects, and the existing auth loading/error UX.
- Add a global shadcn Toast foundation as the default feedback for successful and failed operations across the app.
- Replace Auth page and Navigation browser-client calls while keeping the browser Supabase module implemented but unused.
- Verify session and redirect behavior, focused tests, lint, typecheck, and build.

## Notes

<!-- Add notes here -->

- Dependency: Feature 13 must be complete before implementation.
- Public contracts: login accepts email/password; signup accepts email/password/display name/school role; Auth Actions return the shared `ActionResult`.
- Successful login redirects to `/incidentes`; successful logout redirects to `/auth`; signup shows a safe confirmation-email toast.
- Use boundary-local Zod schemas and convert Auth provider failures to a generic safe message without exposing raw provider details.
- Redirects must remain outside error handling that converts expected failures into Action results.
- Mount the shadcn `Toaster` once in the root layout; use it for operation success and error feedback without duplicating redirect outcomes.
- Authentication/action failures use error toasts; field-specific validation remains inline beside the relevant inputs.
- Browser verification covered invalid login feedback, signup validation and confirmation feedback, login/logout, unauthenticated redirects, all three role menus and route guards, and admin promotion/demotion. Disposable test accounts were removed afterward.
- Toasts are transient UI feedback only. Persistent notifications, unread state, storage, and a message inbox are out of scope.
- Out of scope: OAuth, password reset, MFA, signup metadata changes, Route Handlers, and deleting the browser-client module.
- Standards: Architecture Contract sections 6, 9, 10, 11, 13, and 17.
- Source spec: `context/features/refactor-14-auth-server-actions.md`.

## History

<!-- Keep this updated. Earliest to latest -->

- 2026-08-03: Moved dashboard reads, coordinator/admin authorization, mapping, aggregation, and recent ordering behind a server feature boundary; converted the page to a Server Component; unified displayed/exported incident dates as `DD-MM-YYYY`; and added focused tests plus browser role verification.
- 2026-08-03: Added one shared incident filter for list and export, Excel-compatible UTF-8 CSV serialization, focused utility tests, and the `src/utils` application utility boundary.
- 2026-07-31: Completed ownership-aware incident update/delete, group-scoped student loading, focused incident dialogs/filters/list components, and role-based boundary coverage.
- 2026-07-27: Moved incident reads and creation behind an authenticated feature boundary with server-rendered mapped data, actor-derived identity, and focused tests.
- 2026-07-27: Moved student management behind an authenticated feature boundary with server-rendered data, admin-only update/delete, focused dialogs, and targeted tests.
- 2026-07-24: Moved category management behind an authorized feature boundary with server-rendered data, centralized permission checks, shadcn dialogs, and targeted tests.
- 2026-07-24: Moved group management behind an authorized feature boundary with server-rendered data, validated Actions, shadcn dialogs, and targeted tests.
- 2026-07-23: Moved navigation to a neutral current-user contract with centralized role validation and preserved role-specific responsive behavior.
- 2026-07-23: Moved user-management reads, role assignment, authorization, and mapping behind the users feature boundary.
- 2026-07-23: Added the Vitest Node test foundation with path aliases, explicit discovery, and shared application-error boundary tests.
- 2026-07-23: Added shared Action and known-error contracts, reusable safe server-boundary messages, and explicit Auth/profile failure handling.
- 2026-07-22: Separated Proxy-scoped Supabase claims verification and session cookie/header refresh handling from route redirect logic.
- 2026-07-22: Enforced role-based Supabase RLS for student and incident writes and verified the permission matrix through user-scoped local clients.
- 2026-07-17: Added targeted Next.js route invalidation after successful Server Actions for incidents, students, groups, categories, and user roles.
- 2026-07-17: Added Zod v4 Server Action validation, normalized mutation payloads, and Spanish field-level errors in forms.
- 2026-07-17: Reused one request-scoped Supabase server client per mutation while preserving cached server-component profile lookups.
- 2026-07-17: Added typed Supabase SSR browser/session clients, `proxy.ts` route gating, and cached server profile lookups. Moved authenticated pages into protected role route groups and migrated existing writes to server-authorized actions.
- 2026-07-16: Typed browser and server Supabase clients with the generated `Database` schema.
