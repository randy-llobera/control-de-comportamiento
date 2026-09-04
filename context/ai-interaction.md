# AI Interaction Guidelines

## Communication

- Be concise and direct
- Explain non-obvious decisions briefly
- Ask before large refactors or architectural changes
- Don't add features not in the project spec
- Never delete files without clarification

## Workflow

This is the common workflow that we will use for every single feature/fix:

1. **Document** - Document the feature in @context/current-feature.md.
2. **Branch** - Create a local `feature/<feature>` or `fix/<fix>` branch from current `working`.
3. **Implement** - Implement the documented feature or fix.
4. **Test Locally** - Use local Supabase for development and database testing. Verify UI changes in the browser, run targeted unit and integration tests where applicable, and run `npm run build`. Do not add component tests unless asked.
5. **Iterate** - Review and refine the implementation until local checks pass.
6. **Commit** - Commit only after the applicable checks pass and permission is provided.
7. **Complete Locally** - Merge the feature or fix into `working`, delete the local branch, add the completion summary to @context/current-feature.md history, and reset the active feature sections.
8. **Release to Staging** - Push `working` once. GitHub Actions runs application and local-database checks, applies pending migrations to staging, and deploys the Vercel Preview only after those steps succeed.
9. **Validate Staging** - Test the Preview deployment and staging data behavior before proposing production.
10. **Open Production PR** - Open a pull request from `working` to protected `main`. The PR runs application and local-database checks but does not migrate a hosted database or deploy the application.
11. **Release to Production** - Squash-merge or rebase-merge the approved PR, as allowed by the active linear-history rule. The resulting `main` push reruns checks, applies pending production migrations, and deploys Vercel Production in that order.
12. **Review** - Review AI-generated code and the resulting hosted behavior periodically and on demand.

Do NOT commit without permission and until the build passes. If build fails, fix the issues first.

Vercel does not apply Supabase migrations. GitHub Actions owns hosted migrations and Vercel deployments for `working` and `main`. A release without pending migrations follows the same sequence; the migration command completes without applying changes. Failed checks or migrations prevent the CI-controlled deployment.

## Branching

Create a local branch for every feature or fix. Name it `feature/<feature>` or `fix/<fix>`. Feature and fix branches normally remain local and are deleted after they are merged into `working`.

Push `working` to release to staging. Small, intentional changes may be committed directly to `working`, but they use the same staging pipeline. Never push directly to `main`; production changes always enter through a protected pull request from `working`.

## Commits

- Ask before committing (don't auto-commit)
- Use conventional commit messages (feat:, fix:, chore:, etc.)
- Keep commits focused (one feature/fix per commit)
- Never put "Generated With Codex" in the commit messages

## When Stuck

- If something isn't working after 2-3 attempts, stop and explain the issue
- Don't keep trying random fixes
- Ask for clarification if requirements are unclear

## Code Changes

- Make minimal changes to accomplish the task
- Don't refactor unrelated code unless asked
- Don't add "nice to have" features
- Preserve existing patterns in the codebase
- Keep unit tests focused on server actions and utilities unless I explicitly ask for component coverage

## Code Review

Review AI-generated code periodically, especially for:

- Security (auth checks, input validation)
- Performance (unnecessary re-renders, N+1 queries)
- Logic errors (edge cases)
- Patterns (matches existing codebase?)
