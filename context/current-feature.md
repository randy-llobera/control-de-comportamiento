# Current Feature

## Status

Not Started

## Goals

<!-- Add goals here -->

## Notes

<!-- Add notes here -->

## History

<!-- Keep this updated. Newest to oldest -->

- 2026-09-30: Added shared environment-neutral Zod validation for client forms and authoritative Server Actions, with immediate accessible feedback for auth and CRUD create/edit forms. [Record](features/client-side-validation.md).
- 2026-09-29: Consolidated project documentation around clear ownership; simplified the product, engineering, operational, recovery, feature, task, defect, skill, and reviewer records; added the documentation update matrix; and verified repository documentation checks. [Record](features/documentation-cleanup.md).
- 2026-08-06: Established gated application and local-database checks, automatic staging and production migrations, ordered Vercel deployments, encrypted monthly production backups, and one verified initial schema baseline. [Record](features/ci-pipeline-and-database-baseline.md).
- 2026-08-05: Added repeatable local-only Supabase integration coverage for the role and ownership matrix, cross-role incident/profile reads, database constraints, and reliable fixture cleanup; completed the final standards audit and documented when the feature workflow must run the integration suite. [Record](features/refactor-16-integration-coverage-audit.md).
- 2026-08-04: Established CSS-first Tailwind theme tokens, aligned application naming while preserving shadcn primitive filenames, renamed the unused browser client, removed obsolete legacy types, and fixed responsive navigation, logout placement, landing width, and focus styling. [Record](features/refactor-15-tailwind-theme-and-naming.md).
- 2026-08-04: Moved login, signup, and logout to validated Server Actions with request-scoped Supabase clients; added safe Spanish Auth errors, separated shadcn-based Auth forms, global toast feedback, and focused tests plus browser verification. [Record](features/refactor-14-auth-server-actions.md).
- 2026-08-03: Moved dashboard reads, coordinator/admin authorization, mapping, aggregation, and recent ordering behind a server feature boundary; converted the page to a Server Component; unified displayed/exported incident dates as `DD-MM-YYYY`; and added focused tests plus browser role verification. [Record](features/refactor-13-dashboard-feature-boundary.md).
- 2026-08-03: Added one shared incident filter for list and export, Excel-compatible UTF-8 CSV serialization, focused utility tests, and the `src/utils` application utility boundary. [Record](features/refactor-12-incident-filtering-csv.md).
- 2026-07-31: Completed ownership-aware incident update/delete, group-scoped student loading, focused incident dialogs/filters/list components, and role-based boundary coverage. [Record](features/refactor-11-incidents-ui-boundary.md).
- 2026-07-27: Moved incident reads and creation behind an authenticated feature boundary with server-rendered mapped data, actor-derived identity, and focused tests. [Record](features/refactor-10-incidents-data-boundary.md).
- 2026-07-27: Moved student management behind an authenticated feature boundary with server-rendered data, admin-only update/delete, focused dialogs, and targeted tests. [Record](features/refactor-09-students-feature-boundary.md).
- 2026-07-24: Moved category management behind an authorized feature boundary with server-rendered data, centralized permission checks, shadcn dialogs, and targeted tests. [Record](features/refactor-08-categories-feature-boundary.md).
- 2026-07-24: Moved group management behind an authorized feature boundary with server-rendered data, validated Actions, shadcn dialogs, and targeted tests. [Record](features/refactor-07-groups-feature-boundary.md).
- 2026-07-23: Moved navigation to a neutral current-user contract with centralized role validation and preserved role-specific responsive behavior. [Record](features/refactor-06-navigation-boundary.md).
- 2026-07-23: Moved user-management reads, role assignment, authorization, and mapping behind the users feature boundary. [Record](features/refactor-05-users-feature-boundary.md).
- 2026-07-23: Added the Vitest Node test foundation with path aliases, explicit discovery, and shared application-error boundary tests. [Record](features/refactor-04-vitest-foundation.md).
- 2026-07-23: Added shared Action and known-error contracts, reusable safe server-boundary messages, and explicit Auth/profile failure handling. [Record](features/refactor-03-shared-server-contracts.md).
- 2026-07-22: Separated Proxy-scoped Supabase claims verification and session cookie/header refresh handling from route redirect logic. [Record](features/refactor-02-proxy-session-boundary.md).
- 2026-07-22: Enforced role-based Supabase RLS for student and incident writes and verified the permission matrix through user-scoped local clients. [Record](features/refactor-01-authorization-rls.md).
- 2026-07-17: Added targeted Next.js route invalidation after successful Server Actions for incidents, students, groups, categories, and user roles. [Record](features/server-mutation-cache-invalidation.md).
- 2026-07-17: Added Zod v4 Server Action validation, normalized mutation payloads, and Spanish field-level errors in forms. [Record](features/server-action-validation.md).
- 2026-07-17: Reused one request-scoped Supabase server client per mutation while preserving cached server-component profile lookups. [Record](features/auth-helper-client-reuse.md).
- 2026-07-17: Added typed Supabase SSR browser/session clients, `proxy.ts` route gating, and cached server profile lookups. Moved authenticated pages into protected role route groups and migrated existing writes to server-authorized actions. [Record](features/server-auth-authorization.md).
- 2026-07-16: Typed browser and server Supabase clients with the generated `Database` schema. [Record](features/typed-supabase-clients.md).
