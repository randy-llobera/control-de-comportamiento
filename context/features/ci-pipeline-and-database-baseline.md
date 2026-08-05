# Feature: CI Pipeline and Official Database Baseline

## Status

Planned

## Goal

Restore a passing, useful CI pipeline for application and database changes, troubleshoot the current GitHub Actions failures, and replace the two historical migrations with one official starting migration for newly created local and production databases.

## Standards References

- `context/coding-standards.md > Core conventions > Database and code quality`
- `context/coding-standards.md > Architecture Contract > 18. Database design and RLS`
- `context/coding-standards.md > Architecture Contract > 19. Testing contract`
- `context/project-overview.md > Authentication & Authorization`
- `context/project-overview.md > Data Model`

## Dependency

Feature 16, Integration Coverage and Final Audit, must be complete.

Complete this feature before the README and refactoring-documentation cleanup when possible, so the rewritten README documents the final workflow and official migration layout.

## Confirmed Starting State

- `.github/workflows/db-ci.yml` references `.nvmrc`, but that file does not currently exist.
- The database workflow installs the latest Supabase CLI independently of the version in the project dependencies.
- The database workflow resets local Supabase but does not run unit tests, RLS integration tests, typecheck, lint, or build.
- `.github/workflows/backup-prod.yml` requires production secrets and runs manually, monthly, and on pushes to `main`; its current failure must be diagnosed from the GitHub Actions logs before changing its behavior.
- The repository currently has two historical migrations that must be replaced by `20260805135713_initial_schema.sql`.
- Production contains no data that must be preserved and will be recreated from the official migration baseline. The squashed migration is not an upgrade path for a database that already recorded either old migration.

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
- For database, Auth, RLS, migration, or integration-test changes:
  - Start an ephemeral local Supabase stack.
  - Recreate the database from committed migrations without the optional fixture seed.
  - Regenerate Supabase types and fail if committed generated types are stale.
  - Run `npm run test:integration` against the local stack.
  - Never use a hosted Supabase URL, production key, or production database for CI assertions.
- Preserve useful pull-request and branch triggers while ensuring changes to application tests, integration configuration, workflows, migrations, Auth, or database feature modules run the relevant gates.
- Stop local Supabase services in an always-run cleanup step when the runner requires explicit cleanup.

### Backup workflow

- Diagnose the current backup workflow failure before changing triggers or secret handling.
- Preserve failure visibility for real backup failures; do not silently convert a failed backup into a successful skipped job.
- If required production secrets are absent or invalid, report the exact repository configuration needed and ask for direction before changing the intended backup schedule or `main`-push behavior.
- Keep database URLs, certificates, dumps, and credentials out of logs and committed files.

### Official migration baseline

- Replace the two existing migrations with one clearly named official initial migration.
- Build the migration from the final intended schema, functions, triggers, grants, constraints, reference roles, and RLS policies.
- Define the final student, user-profile, and incident policies directly; do not create the superseded permissive policies and then drop them inside the baseline.
- Preserve the current database behavior exactly. Do not add tables, columns, policies, roles, constraints, functions, or grants unrelated to combining the migrations.
- Delete both superseded migration files after the combined migration is complete.
- Recreate local Supabase from the single migration and regenerate `src/types/supabase.ts`.
- Verify that generated database contracts and all RLS/constraint behavior remain unchanged.
- Search for and update any repository references to the deleted migration filenames.

## Out of Scope

- Applying the squashed migration over a production or local database that retains the old Supabase migration history.
- Preserving production data; the approved rollout recreates an empty production project.
- Deploying, resetting, linking, backing up, or bootstrapping production during implementation without explicit approval.
- Adding application features, changing role permissions, redesigning RLS, or modifying the data model.
- Adding a custom application deployment workflow when Vercel already owns frontend deployment.
- Rewriting the README or deleting completed refactoring documents; those belong to the separate documentation-cleanup feature.
- Adding third-party CI services, coverage-percentage gates, component-test tooling, or unrelated dependencies.

## Implementation Steps

1. Read the current GitHub Actions logs and reproduce repository-owned failures locally where practical.
2. Document the confirmed failure causes and any required GitHub secret or repository-setting changes.
3. Align Node, npm, and Supabase CLI versions across `package.json`, the lockfile, local commands, and GitHub Actions with the smallest necessary change.
4. Update the CI workflow to run the application gates and the local Supabase reset/integration gates under the appropriate triggers.
5. Correct the backup workflow only where the diagnosed failure or intended trigger behavior requires a repository change; request user direction for missing production configuration or a behavioral trigger decision.
6. Create one official initial migration containing the final state produced by the two existing migrations, then remove the superseded files.
7. Reset local Supabase from the new baseline and regenerate the committed database types.
8. Run the unit and integration suites twice when fixture, cleanup, migration, or workflow integration behavior changed.
9. Run lint, typecheck, build, and diff validation.
10. Push the feature branch and verify the relevant GitHub Actions jobs succeed before completion. Do not mark an unexecuted external workflow as passing.

## Risks

- A squashed baseline is destructive and incompatible with a database that already applied the old migration versions. It is safe only because local and production databases will be recreated.
- Reordering SQL while combining migrations can subtly change RLS, grants, trigger behavior, defaults, or foreign-key enforcement.
- Using a hosted Supabase project in CI could mutate real data or bypass the local-only safety model.
- Installing unpinned tools can make CI pass or fail differently over time.
- Backup failures can be hidden accidentally by overly broad conditions or skipped jobs.
- Production secrets or database dumps must never appear in workflow logs or repository changes.

## Tests

- The original failing GitHub Actions error is identified and resolved or explicitly documented as blocked by required external configuration.
- A clean GitHub-hosted runner can install dependencies using the repository's supported Node and npm versions.
- The official migration recreates a fresh local database successfully with no optional seed dependency.
- `src/types/supabase.ts` is regenerated from the official migration and contains no unintended contract change.
- `npm test` passes.
- `npm run test:integration` passes twice consecutively against local Supabase with no leaked fixtures.
- RLS coverage still verifies incident ownership, cross-role incident/profile reads, student permissions, group/category/role permissions, and foreign-key constraints.
- `npm run typecheck`, `npm run lint`, `npm run build`, and `git diff --check` pass.
- Repository search finds exactly one official migration and no references to the two deleted filenames.
- CI obtains local Supabase credentials without hardcoding production or hosted secrets.
- Relevant pull-request or manual GitHub Actions runs complete successfully.
- The backup workflow either completes successfully with configured secrets or reports a clear actionable configuration failure without exposing secret values.

## Done Checklist

- [ ] Current GitHub Actions failures have confirmed causes rather than assumed fixes.
- [ ] Node, npm, and Supabase CLI versions are intentional and consistent in CI.
- [ ] CI runs the required application and local database verification gates.
- [ ] CI integration tests cannot target hosted Supabase.
- [ ] Backup behavior and required repository secrets are explicit and verified.
- [ ] One official migration replaces the two historical migrations without changing database behavior.
- [ ] A fresh local reset, generated types, unit tests, and two consecutive integration runs pass.
- [ ] Lint, typecheck, build, and diff validation pass.
- [ ] Relevant GitHub Actions jobs pass before feature completion.
- [ ] No production operation, credential, or unrelated application change is included.
