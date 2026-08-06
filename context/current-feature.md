# Current Feature: CI Pipeline and Official Database Baseline

## Status

In Progress

## Goals

<!-- Add goals here -->

- Diagnose the exact GitHub Actions failures and separate repository defects from required external configuration.
- Align the Node, npm, and Supabase CLI toolchain and run the required application and local database gates in CI.
- Keep CI database assertions isolated to an ephemeral local Supabase stack and detect stale generated types.
- Deploy pending migrations to staging after successful `working` checks and to production after successful `main` checks.
- Preserve visible backup failures while keeping production data encrypted in retained artifacts and documenting required repository configuration.
- Replace the two historical migrations with one official initial migration without changing database behavior.
- Verify the fresh migration, generated types, unit and integration tests, lint, typecheck, build, and relevant GitHub Actions jobs.

## Notes

<!-- Add notes here -->

- Depends on the completed Integration Coverage and Final Audit feature.
- Production contains no data to preserve and will be recreated from the official baseline; the squashed migration is not an upgrade path for databases that retain either old migration in their history.
- Confirmed DB CI failure: run `31002665033`, job `db-ci`, step `Setup Node` failed because the referenced `.nvmrc` file does not exist.
- Confirmed backup failure boundary: the latest retained run `22536343402` failed at the explicit empty-`PROD_DB_URL` guard. `PROD_DB_URL` is now configured for the active production project.
- The public repository must never retain a plaintext production data dump. The backup workflow keeps the schema-only dump readable, encrypts the full dump with AES-256-CBC and PBKDF2 before upload, retains artifacts for 90 days, and fails visibly when `PROD_DB_URL` or a 20-or-more-character `BACKUP_ENCRYPTION_PASSPHRASE` repository secret is missing.
- Restore an encrypted full dump only in an approved recovery environment with `openssl enc -d -aes-256-cbc -pbkdf2 -iter 600000 -pass env:BACKUP_ENCRYPTION_PASSPHRASE -in <dump>.sql.gz.enc | gzip -dc | psql "$TARGET_DB_URL"`. Never target production while testing restoration.
- Vercel Production uses the active `control-de-comportamiento` Supabase project. Vercel Preview deployments from `working` will use a separate `control-de-comportamiento-staging` project in `eu-west-3`; only its public URL and anon key belong in branch-specific Preview variables.
- The staging project has applied `20260805135713_initial_schema.sql`, and the local workspace is not linked to any hosted project.
- Hosted migration jobs use explicit `STAGING_DB_URL` and `PROD_DB_URL` GitHub secrets after application and local database checks pass. `STAGING_DB_URL` must reference the current staging project; Vercel environment variables remain separate and use the unsuffixed names expected by the application.
- Automatic Vercel Git deployments are disabled for `working` and `main`. After a successful `working` push, Actions migrates staging and deploys a Vercel Preview. After a successful `main` push, Actions migrates production and deploys Vercel Production.
- The encrypted production backup runs independently on a monthly schedule or by manual dispatch; application deployments do not create backups.
- GitHub must provide `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` repository secrets for ordered Vercel deployments. Pull requests into `main` run application and local database checks without changing either hosted database or creating a release deployment.
- Production releases are triggered by the `push` event GitHub emits after a protected PR is merged into `main`; the workflow does not require or authorize direct pushes to `main`.
- Preserve the existing schema, functions, triggers, grants, constraints, reference roles, and final RLS behavior exactly. Do not introduce unrelated database or permission changes.
- Do not run production deploy, reset, link, backup, or bootstrap operations without explicit approval.
- Keep hosted Supabase credentials, database URLs, certificates, and dumps out of CI assertions, logs, and committed files.
- The superseded migrations will be replaced by `20260805135713_initial_schema.sql`.
- Relevant standards: `context/coding-standards.md` sections 18 and 19, plus the database/code-quality conventions and the authentication, authorization, and data-model sections in `context/project-overview.md`.

## History

<!-- Keep this updated. Newest to oldest -->

- 2026-08-05: Added repeatable local-only Supabase integration coverage for the role and ownership matrix, cross-role incident/profile reads, database constraints, and reliable fixture cleanup; completed the final standards audit and documented when the feature workflow must run the integration suite.
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
