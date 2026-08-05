# Feature: README and Refactoring Documentation Cleanup

## Status

Planned

## Goal

Replace the stale README with an accurate guide to the current application and remove the completed refactoring roadmap documents.

## Standards References

- `context/project-overview.md`
- `context/coding-standards.md > Core conventions`
- `context/coding-standards.md > Architecture Contract`
- `context/ai-interaction.md > Workflow`
- `context/ai-interaction.md > Code Changes`

## Dependency

Feature 16, Integration Coverage and Final Audit, must be complete before this cleanup begins.

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

1. Inventory the current repository structure, scripts, environment template, migrations, workflows, routes, and role rules.
2. Compare every README command, path, permission, architectural statement, and deployment instruction with those sources.
3. Rewrite the README with concise current information and remove obsolete paths or claims.
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

## Tests

- Every documented path and package script exists.
- The role matrix matches `context/project-overview.md`, feature authorization, and RLS behavior.
- The architecture description matches `context/coding-standards.md` and the current source boundaries.
- Local integration instructions use the current scripts and clearly state that hosted Supabase URLs are refused.
- Production instructions describe migration-based setup without claiming production is already configured.
- Repository search finds no remaining references to either deleted planning document.
- No credentials, production values, or untracked environment contents appear in the diff.
- `npm run lint`, `npm run typecheck`, `npm run build`, and `git diff --check` pass.

## Done Checklist

- [ ] README features, permissions, architecture, setup, testing, security, and deployment instructions match the repository.
- [ ] README contains no obsolete files, folders, commands, or production claims.
- [ ] The refactoring roadmap and feature-index documents are deleted.
- [ ] README documents the current local Supabase integration-test workflow without linking to a missing guide.
- [ ] No references to the deleted documents remain.
- [ ] No application or configuration files changed.
- [ ] Lint, typecheck, build, and diff validation pass.
