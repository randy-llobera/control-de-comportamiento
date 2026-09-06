# Feature: CI Pipeline and Database Baseline

## Status

Planned

## Goal

Provide a passing, gated release pipeline from local development through staging to production. Recreate the intended schema from one initial migration, apply pending hosted migrations before application deployment, and create encrypted monthly production backups with documented recovery procedures and limitations.

## Standards References

- `context/coding-standards.md > Core conventions > Database and code quality`
- `context/coding-standards.md > Architecture Contract > 18. Database design and RLS`
- `context/coding-standards.md > Architecture Contract > 19. Testing contract`
- `context/project-overview.md > Authentication & Authorization`
- `context/project-overview.md > Data Model`

## Dependency

Feature 16, Integration Coverage and Final Audit, must be complete.

Complete this feature before the README and refactoring-documentation cleanup when possible, so the rewritten README documents the final workflow and official migration layout.

## Historical Starting State

The following conditions describe the start of implementation, not the delivered system.

- `.github/workflows/db-ci.yml` references `.nvmrc`, but that file does not currently exist.
- The database workflow installs the latest Supabase CLI independently of the version in the project dependencies.
- The database workflow resets local Supabase but does not run unit tests, RLS integration tests, typecheck, lint, or build.
- `.github/workflows/backup-prod.yml` requires production secrets and runs manually, monthly, and on pushes to `main`; its current failure must be diagnosed from the GitHub Actions logs before changing its behavior.
- The repository currently has two historical migrations that must be replaced by `20260805135713_initial_schema.sql`.
- Production had disposable data and an older schema/history. The existing project was retained and reset with explicit approval, then recreated from the initial migration. The baseline was not applied as an upgrade over the old schema.

## Scope

### Failure diagnosis

- Inspect the failing GitHub Actions runs and identify the exact failing workflow, job, step, and error before editing workflow files.
- Separate repository defects from missing or incorrect GitHub repository configuration, such as required secrets.
- Record any required external configuration that cannot be fixed safely in the repository.

### CI pipeline

- Fix the Node setup so CI uses one intentional version compatible with `package.json` rather than referencing a missing file.
- Remove avoidable Supabase CLI version drift by using the project-pinned toolchain or an explicitly matching workflow version.
- Keep application checks and local database checks understandable as separate jobs or clearly separated steps.
- Run the applicable application gates in CI:
  - `npm test`
  - `npm run typecheck`
  - `npm run lint`
  - `npm run build`
- On every supported CI trigger, run database checks:
  - Start an ephemeral local Supabase stack.
  - Recreate the database from committed migrations without the optional fixture seed.
  - Regenerate Supabase types and fail if committed generated types are stale.
  - Run `npm run test:integration` against the local stack.
  - Never use a hosted Supabase URL, production key, or production database for CI assertions.
- Preserve useful pull-request and branch triggers while ensuring changes to application tests, integration configuration, workflows, migrations, Auth, or database feature modules run the relevant gates.
- Stop local Supabase services in an always-run cleanup step when the runner requires explicit cleanup.

### Release workflow and deployment ownership

- Develop feature branches locally against local Supabase; feature branches normally remain unpushed. Merge into `working` and push it to release to staging. Small direct changes to `working` use the same pipeline.
- Run application and local-database checks on pushes to `working`/`main` and PRs targeting `main`. Manual CI dispatch runs checks only, not migrations or deployment.
- After both check jobs pass on a push, run `supabase db push --db-url` against staging for `working` or production for `main`. A release without pending migrations follows the same sequence without applying SQL.
- Deploy only after the migration job succeeds. GitHub Actions, not Vercel, applies hosted migrations.
- Use `vercel pull`, `vercel build`, and `vercel deploy --prebuilt`, with production flags for `main` and Preview configuration scoped to `working` for staging.
- Disable Vercel automatic Git deployments for both release branches so they cannot bypass the checks/migration sequence. Rebuild through the original push-triggered GitHub run when build-time environment values change.
- Protect `main`: production releases enter through checked PRs, never direct pushes. A merged PR produces the push event that runs the production pipeline. PR checks themselves do not migrate or deploy.
- Use Node 24.x, npm 12.0.0, the lockfile-resolved project Supabase CLI, and Vercel CLI 58.7.1 in CI.
- Configure `STAGING_DB_URL`, `PROD_DB_URL`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` in GitHub. Configure Vercel's unsuffixed `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` separately for Preview and Production. The HTTPS API URL is not a PostgreSQL connection string.

### Backup workflow

- Diagnose the current backup workflow failure before changing triggers or secret handling.
- Preserve failure visibility for real backup failures; do not silently convert a failed backup into a successful skipped job.
- Run monthly on day 1 at 03:00 UTC and on manual dispatch, not on deployment or pushes. Require `PROD_DB_URL` and an encryption passphrase of at least 20 characters in `BACKUP_ENCRYPTION_PASSPHRASE`.
- Generate a compressed schema-only dump and a compressed full logical SQL dump using PostgreSQL 17.6. Encrypt the full dump with AES-256-CBC, PBKDF2, and 600000 iterations. The schema-only file remains unencrypted.
- Upload both files as `prod-db-backup` in GitHub Actions with 90-day retention. Verify successful creation and artifact upload from `main`.
- Document artifact discovery/download, decryption, restore preparation, validation, and cutover commands in `supabase/README.md`.
- Explicitly document omitted ownership/grants, managed-schema compatibility, Storage-file exclusions, and manual project configuration. Do not present the current artifact as a verified one-command project restore.
- Defer the full restore rehearsal and required recovery-format improvements to TASK-007, P3 - Low, at the user's request.
- Keep database URLs, certificates, dumps, and credentials out of logs and committed files.

### Initial migration baseline

- Replace historical migrations with `20260805135713_initial_schema.sql`.
- Build the migration from the final intended schema, functions, triggers, grants, constraints, reference roles, and RLS policies.
- Define the final student, user-profile, and incident policies directly; do not create the superseded permissive policies and then drop them inside the baseline.
- Preserve the intended application database contract. The older production policies were not the source of truth; the approved reset replaces them with the final baseline policies. Do not introduce unrelated model or permission changes.
- Delete both superseded migration files after the combined migration is complete.
- Recreate local Supabase from the single migration and regenerate `src/types/supabase.ts`.
- Verify that generated database contracts and all RLS/constraint behavior remain unchanged.
- Search for and update any repository references to the deleted migration filenames.
- Exercise actual pending baseline application through both hosted pipelines after approved resets, not only no-pending-migrations runs.
- Bootstrap the initial admin manually after an empty reset. Migrations create roles and the new-user profile trigger, not an admin Auth account. The bootstrap script does not repair existing Auth accounts with missing profiles.
- Future database changes must be new migrations. Never automatically reset hosted databases or repair migration history during routine deployment.

## Out of Scope

- Applying the squashed migration over a production or local database that retains the old Supabase migration history.
- Preserving disposable production data during the explicitly approved initial reset; the existing project is retained.
- Deploying, resetting, linking, backing up, or bootstrapping production during implementation without explicit approval.
- Adding application features, changing role permissions, redesigning RLS, or modifying the data model.
- A generalized project-cloning system, automatic Storage-file backups, additional backup destinations, or full recovery rehearsal in this delivery; evaluate recovery follow-ups under TASK-007.
- Fixing stale/deleted-user sessions in this feature; track the confirmed error as DEF-004, P2.
- Rewriting the root README or deleting completed refactoring documents; those belong to documentation-cleanup. The focused Supabase backup/restore README is in scope.
- Adding third-party CI services, coverage-percentage gates, component-test tooling, or unrelated dependencies.

## Implementation Steps

1. Read the current GitHub Actions logs and reproduce repository-owned failures locally where practical.
2. Document the confirmed failure causes and any required GitHub secret or repository-setting changes.
3. Align Node, npm, and Supabase CLI versions across `package.json`, the lockfile, local commands, and GitHub Actions with the smallest necessary change.
4. Update the CI workflow to run the application gates and the local Supabase reset/integration gates under the appropriate triggers.
5. Configure gated hosted migration/prebuilt deployment jobs, Vercel environment mapping, and PR-only main protection. Implement the agreed monthly/manual encrypted backup workflow.
6. Create one official initial migration containing the final state produced by the two existing migrations, then remove the superseded files.
7. Reset local Supabase from the new baseline and regenerate the committed database types.
8. Verify unit/integration behavior in independent clean CI runs for staging and production. This replaces the original two-consecutive-runs-in-one-local-stack criterion; same-stack repeatability is not claimed from the available evidence.
9. Run lint, typecheck, build, and diff validation.
10. Merge the local feature into `working`, push, and verify staging checks, actual migration, deployment, and smoke checks. Release through a checked PR to `main`, then verify production migration/deployment and login. Perform resets/bootstrap only with explicit approval.
11. Verify a production backup artifact from `main`, document recovery limits, and record TASK-007 and DEF-004 without duplicate backlog entries.
12. Update the specification with approved decisions and evidence, then commit/merge remaining documentation through the normal release workflow.

## Risks

- A squashed baseline is destructive and incompatible with a database that already applied the old migration versions. It is safe only because local and production databases will be recreated.
- Reordering SQL while combining migrations can subtly change RLS, grants, trigger behavior, defaults, or foreign-key enforcement.
- Using a hosted Supabase project in CI could mutate real data or bypass the local-only safety model.
- Installing unpinned tools can make CI pass or fail differently over time.
- Backup failures can be hidden accidentally by overly broad conditions or skipped jobs.
- Production secrets or database dumps must never appear in workflow logs or repository changes.
- Migrations are applied before deployment; a failed build/deployment does not roll them back. Future migrations should remain compatible with the running application.
- Monthly backups permit approximately a month's data loss, and artifact expiration removes recovery points. Successful backup creation does not establish recoverability.
- Recreating a project still requires new connection settings, API keys, and manual service configuration. SQL backups do not restore uploaded Storage bytes.

## Tests

- The original failing GitHub Actions error is identified and resolved or explicitly documented as blocked by required external configuration.
- A clean GitHub-hosted runner can install dependencies using the repository's supported Node and npm versions.
- The official migration recreates a fresh local database successfully with no optional seed dependency.
- `src/types/supabase.ts` is regenerated from the official migration and contains no unintended contract change.
- `npm test` passes.
- `npm run test:integration` passes against ephemeral local Supabase in independent clean staging and production CI runs; cleanup succeeds. Two consecutive executions in one local stack were not verified and are not part of the revised acceptance criterion.
- RLS coverage still verifies incident ownership, cross-role incident/profile reads, student permissions, group/category/role permissions, and foreign-key constraints.
- `npm run typecheck`, `npm run lint`, `npm run build`, and `git diff --check` pass.
- Repository search finds exactly one official migration and no references to the two deleted filenames.
- CI obtains local Supabase credentials without hardcoding production or hosted secrets.
- Required PR checks and push-triggered staging/production releases complete successfully. Hosted migration jobs apply the pending baseline after approved resets.
- Staging authenticated page/data checks pass and production authentication is confirmed. These are smoke checks, not full browser/CRUD or multi-role acceptance coverage.
- The backup workflow completes successfully from `main` and uploads its artifact. Decryption and full restoration remain deferred, not implicitly passed.

## Done Checklist

- [ ] CI/hosted failures were investigated from logs and actionable configuration issues resolved.
- [ ] CI uses an intentional toolchain and runs application/local-database gates.
- [ ] Integration assertions reject hosted Supabase URLs.
- [ ] The initial migration recreates the intended schema and passes generated-type and RLS/constraint checks.
- [ ] Application checks, local resets, and integration checks pass in clean staging and production CI runs.
- [ ] PR-only production releases and gated hosted migrations/Vercel deployments were exercised successfully.
- [ ] Staging smoke checks and production authentication completed.
- [ ] Monthly/manual backup creation and artifact upload succeeded from `main`.
- [ ] Backup/restore documentation states the current limits without claiming a tested restore.
- [ ] Full recovery is deferred to TASK-007, P3; stale-session handling is tracked as DEF-004, P2.
- [ ] Hosted resets/bootstrap were explicitly approved; they are not routine automated deployment behavior.
- [ ] Commit and merge the remaining documentation changes. This is repository handoff, not an outstanding CI/CD implementation goal.
