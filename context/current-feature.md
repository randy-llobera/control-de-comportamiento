# Current Feature: Integration Coverage and Final Audit

## Status

In Progress

## Goals

<!-- Add goals here -->

- Add repeatable local-only Supabase integration tests with isolated fixtures and reliable cleanup.
- Verify the approved RLS permission matrix through signed-in teacher-owner, teacher-other, coordinator, and admin clients.
- Fill material unit-test gaps across validation, mapping, known errors, business rules, filtering, CSV, and dashboard aggregation.
- Audit source boundaries, naming, generated types, caching and invalidation, browser-client usage, Route Handlers, and pure utilities against the coding standards.
- Update the feature index and roadmap only after all required checks pass and unresolved gaps are documented.

## Notes

<!-- Add notes here -->

- Spec: `context/features/refactor-16-integration-coverage-audit.md`.
- This is the final refactoring feature and depends on Feature 15 being complete.
- Integration tests must refuse non-local Supabase URLs. Service-role access is limited to fixture setup and cleanup; all RLS assertions must use user-scoped clients.
- Production data, load testing, component tests, coverage-percentage gates, new application behavior, and unrelated architecture changes are out of scope.
- Required verification: local database reset; unit and integration suites; lint; typecheck; build; and role-based browser smoke checks.
- Completion requires repeatable tests, pure and focused `src/utils/` modules, an accurate permission matrix, and no undocumented material standards gaps.

## History

<!-- Keep this updated. Newest to oldest -->

- 2026-08-04: Established CSS-first Tailwind theme tokens, aligned application naming while preserving shadcn primitive filenames, renamed the unused browser client, removed obsolete legacy types, and fixed responsive navigation, logout placement, landing width, and focus styling.
- 2026-08-04: Moved login, signup, and logout to validated Server Actions with request-scoped Supabase clients; added safe Spanish Auth errors, separated shadcn-based Auth forms, global toast feedback, and focused tests plus browser verification.
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
