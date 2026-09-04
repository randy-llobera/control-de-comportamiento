# Feature: README and Refactoring Documentation Cleanup

## Status

Planned

## Goal

Replace the stale README with an accurate guide to the current application, development and release workflow, and remove the completed refactoring roadmap documents.

## Standards References

- `context/project-overview.md`
- `context/coding-standards.md > Core conventions`
- `context/coding-standards.md > Architecture Contract`
- `context/ai-interaction.md > Workflow`
- `context/ai-interaction.md > Code Changes`

## Dependency

- Feature 16, Integration Coverage and Final Audit, must be complete before this cleanup begins.
- The CI Pipeline and Official Database Baseline feature must have successful `working`, pull-request, and `main` runs, plus one verified manual production backup, before the README describes the release pipeline as verified.

## Scope

- Audit `README.md` against the actual repository, `package.json`, current migrations, deployment workflows, project overview, and coding standards.
- Rewrite stale feature, architecture, setup, project-structure, testing, security, and deployment sections.
- Document the current role permissions exactly:
  - All authenticated roles can read and create students.
  - Only admins can update and delete students.
  - Teachers can update and delete only incidents they created.
  - Coordinators and admins can update and delete every incident.
  - Coordinators and admins manage groups and categories.
  - Only admins manage user roles.
  - Only coordinators and admins access the dashboard.
- Explain the current application boundaries: Server Pages for initial reads, feature modules for application behavior and table access, Server Actions for UI mutations, Route Handlers for actual HTTP callers, and RLS/constraints for final enforcement.
- Document the real package scripts for local setup, database reset, generated types, unit tests, local-only integration tests, lint, typecheck, build, production migrations, and admin bootstrap.
- Document the local Supabase integration-test commands, local-only URL guard, and applicable security/database use cases directly in the README.
- Add a concise CI/CD section to the README that documents the actual release lifecycle:
  - Feature and fix branches normally remain local and use local Supabase for development and testing.
  - Completed work is merged locally into `working`, and `working` is pushed once.
  - A `working` push runs application checks and an ephemeral local Supabase reset, generated-type check, and integration suite before applying pending migrations to staging and creating a Vercel Preview deployment.
  - A pull request from `working` to protected `main` runs the application and local-database checks without changing either hosted database or deploying an application.
  - Merging the pull request emits the `main` push event; Actions repeats the checks, applies pending migrations to production, and then creates the Vercel Production deployment.
  - When no migrations are pending, the hosted migration step is a no-op and deployment continues after the same checks.
  - Vercel Git deployments are disabled for `working` and `main`; GitHub Actions owns deployment ordering so Vercel cannot deploy before checks and migrations succeed.
- Document environment separation without values: local development uses local Supabase, `working`/Vercel Preview uses staging Supabase, and `main`/Vercel Production uses production Supabase.
- List required GitHub secret names without values: `STAGING_DB_URL`, `PROD_DB_URL`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, and `BACKUP_ENCRYPTION_PASSPHRASE`. Distinguish database connection strings used by Actions from the unsuffixed `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` values used by the application in each Vercel environment.
- Document that production backups are independent of releases, run manually or monthly at 03:00 UTC on day 1, retain artifacts for 90 days, and encrypt the full data dump before upload. Include the approved decrypt/restore command while warning that the passphrase must also be preserved outside GitHub and restoration must never be tested against production.
- Explain that migrations are committed and applied automatically by GitHub Actions during hosted releases; Vercel itself does not apply Supabase migrations. Document `db:migrate:production` only as an exceptional linked-project operator command, not the normal release path.
- Document that failed checks or migrations prevent the CI-controlled Vercel deployment, while database migrations have no automatic rollback and require a forward-fix migration when reversal is necessary.
- Keep the project structure concise and include only current folders and representative files.
- Delete these completed planning artifacts after the README no longer depends on them:
  - `context/docs/coding-standards-refactoring-roadmap.md`
  - `context/docs/coding-standards-refactoring-features.md`
- Search the repository and remove or update any remaining references to the deleted documents.

## Out of Scope

- Application code, behavior, styling, dependencies, configuration, migrations, environment values, or deployment changes.
- Running a production reset, migration, backup, or admin bootstrap.
- Deleting completed specifications under `context/features/`.
- Adding new documentation folders, generators, or tooling.

## Implementation Steps

1. Inventory the current repository structure, scripts, environment template, migrations, workflows, branch rules, Vercel deployment configuration, backup policy, routes, and role rules.
2. Compare every README command, path, permission, architectural statement, and deployment instruction with those sources.
3. Rewrite the README with concise current information, including the verified local-to-production CI/CD lifecycle, and remove obsolete paths or claims.
4. Verify that the README does not rely on the completed roadmap or feature index.
5. Delete the two completed refactoring planning documents.
6. Search the repository for references to the deleted files and correct any remaining links.
7. Review the final diff for accidental code changes, exposed credentials, duplicated sections, stale terminology, and unnecessary detail.
8. Run the required repository checks.

## Risks

- Incorrect permission documentation could mislead future implementation and testing decisions.
- Removing planning documents before transferring useful current information could lose discoverable context, even though Git history preserves them.
- README commands or paths can appear plausible while referring to files that no longer exist.
- Environment examples must list variable names without exposing real values or secrets.
- The README must not claim the new CI/CD path or encrypted backup is verified until the corresponding GitHub Actions runs complete successfully.
- Duplicating workflow implementation details can make documentation brittle; describe operator-visible behavior and point to workflow files for exact job definitions.

## Tests

- Every documented path and package script exists.
- The role matrix matches `context/project-overview.md`, feature authorization, and RLS behavior.
- The architecture description matches `context/coding-standards.md` and the current source boundaries.
- Local integration instructions use the current scripts and clearly state that hosted Supabase URLs are refused.
- Production instructions describe migration-based setup without claiming production is already configured.
- The branch and deployment instructions match `.github/workflows/db-ci.yml`, `.github/workflows/backup-prod.yml`, `vercel.json`, and the active `main` ruleset.
- The README explains both migration and no-migration releases and does not claim that Vercel applies database migrations.
- The README lists only secret names, distinguishes GitHub database URLs from Vercel public runtime variables, and contains no IDs, passwords, tokens, connection strings, or environment-specific values.
- Backup documentation matches the monthly/manual encrypted artifact workflow and includes a safe recovery warning.
- Repository search finds no remaining references to either deleted planning document.
- No credentials, production values, or untracked environment contents appear in the diff.
- `npm run lint`, `npm run typecheck`, `npm run build`, and `git diff --check` pass.

## Done Checklist

- [ ] README features, permissions, architecture, setup, testing, security, and deployment instructions match the repository.
- [ ] README contains no obsolete files, folders, commands, or production claims.
- [ ] The refactoring roadmap and feature-index documents are deleted.
- [ ] README documents the current local Supabase integration-test workflow without linking to a missing guide.
- [ ] README documents the verified local feature -> `working`/staging -> protected PR -> `main`/production workflow, including releases with and without migrations.
- [ ] README accurately describes GitHub-gated Vercel deployments, hosted migration ownership, environment separation, required secret names, and the independent encrypted monthly backup.
- [ ] `context/ai-interaction.md` and `context/project-overview.md` agree with the README release workflow.
- [ ] No references to the deleted documents remain.
- [ ] No application or configuration files changed.
- [ ] Lint, typecheck, build, and diff validation pass.
