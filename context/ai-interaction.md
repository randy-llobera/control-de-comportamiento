# Development Workflow and Documentation

## Working agreement

Use American English, concise explanations, and evidence from the repository. Implement only the agreed scope, reuse established patterns, and preserve unrelated edits. Ask when a product decision or required context is missing. Do not turn a defect into the intended product behavior.

Before implementation, provide a plan when changing multiple files, dependencies, public APIs, authentication/security, database schema, or module boundaries. List files, steps, risks, and a minimal done checklist. User authorization persists; ask before commits or external actions that have not already been authorized. Do not publish credentials, environment values, database dumps, or personal data in documentation or reports.

## Document ownership

This table is the documentation map. Each topic has one authoritative home; other files should link to it instead of copying its tables, procedures, or checklists.

| File                                          | Owns                                                                                                  | Consult when                                                                      |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| [README](../README.md)                        | Developer onboarding, toolchain, runnable commands, environment variable names, and release operation | Installing, running, testing, or deploying the app                                |
| [Project overview](project-overview.md)       | Product purpose, role permissions, workflows, domain relationships, and product requirements          | Designing a feature or deciding intended behavior                                 |
| [Coding standards](coding-standards.md)       | Source boundaries, types, validation, authorization, state, errors, styling, and test selection       | Implementing or reviewing code                                                    |
| [This file](ai-interaction.md)                | Change lifecycle, document ownership, and documentation update rules                                  | Starting, reviewing, or completing any change                                     |
| [Current feature](current-feature.md)         | Active feature name, status, spec link, immediate progress, and concise completion history            | Resuming work or finding a completed feature record                               |
| [Feature records](features/)                  | Per-change scope, decisions, acceptance evidence, and delivery outcome                                | Planning a change or understanding why it was made                                |
| [Pending tasks](tasks/pending-tasks.md)       | Improvements and product proposals that are not active features                                       | Prioritizing new work                                                             |
| [Pending defects](defects/pending-defects.md) | Confirmed deviations from intended behavior, evidence, and corrective action                          | Investigating or prioritizing a bug                                               |
| [Database recovery](../supabase/README.md)    | Backup scope, retention, secrets, download, decryption, restore, and validation                       | Operating backups or recovering a database                                        |
| [AGENTS](../AGENTS.md)                        | Agent entry point and routing to these owners                                                         | Entering the repository without context                                           |
| [Local skills](../.agents/skills/)            | Instructions for explicitly selected task modes                                                       | Loading, starting, reviewing, testing, explaining, completing, or inspecting work |
| [Agent definitions](../.codex/agents/)        | Scope and output of specialized reviewers                                                             | Selecting or maintaining a reviewer                                               |

Executable definitions remain authoritative for implementation details: `package.json` and its lockfile for commands/versions; migrations and generated types for database columns; application contracts for payloads; workflows and `vercel.json` for automation. Docs explain their use and intent without duplicating full definitions.

Product and operating guides describe supported workflows and enduring requirements, not bug lists, run histories, or feature progress. Keep proposed capabilities in pending tasks until their scope is accepted. Record a confirmed implementation gap in pending defects; do not silently remove the requirement. Operational prerequisites and backup exclusions stay in the recovery guide because they affect safe execution.

## What to update for each change

Apply this matrix before editing and again during review. Update a document only when its owned information changes; do not touch unrelated files to show activity.

| Developer scenario                                                                | Update                                                                                                                               |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Start or change the scope of a feature/fix                                        | Its feature spec; point current-feature at it and set the active status                                                              |
| Add/change a user workflow, permission, route, or accepted product rule           | Project overview; feature spec for decisions and acceptance evidence                                                                 |
| Fix a bug without changing the product contract                                   | Existing defect record and active feature record; guides only if their instructions are independently incorrect                      |
| Discover a new bug or defer an improvement                                        | Pending defects or pending tasks, respectively; reuse an existing ID and link rather than repeat the issue                           |
| Add a product idea or future integration                                          | Pending tasks; do not list it as part of the installed stack or available features                                                   |
| Change code boundaries, shared contracts, validation, state, or error conventions | Coding standards if the convention changes; ordinary implementations need no standards edit                                          |
| Change dependencies, scripts, installation, or required environment names         | README; recovery guide only for recovery-specific tools/secrets; never copy values                                                   |
| Change schema, constraints, or RLS                                                | Migration and generated types; project overview only for domain/permission changes; recovery guide only if recovery changes          |
| Change tests or test tooling                                                      | Coding standards for test selection; README for runnable commands; feature record for results                                        |
| Change CI, branch protection, staging, or deployment                              | README release section; this workflow only if developer steps change; results belong in the feature record                           |
| Change backup format, schedule, retention, restore, or cutover                    | Database recovery guide; internal task/feature record for rehearsal evidence                                                         |
| Change a skill or reviewer                                                        | Its skill/action or agent definition; keep references to document owners rather than duplicate their rules                           |
| Rename/delete a file or consolidate documentation                                 | Update callers, links, and this map if ownership changes; transfer unique material before deletion                                   |
| Finish a feature                                                                  | Record outcome and actual verification in its spec, resolve covered task/defect entries, and reset current-feature during completion |

Do not copy acceptance checklists into current-feature. Keep one checklist in the active spec. Completed specs are concise historical records, not instructions to reimplement old designs. Retain decisions that explain the change, link current implementation/guide owners, and distinguish recorded evidence from checks run now. Use Git history for superseded plans and detailed old diffs.

## Change lifecycle

1. Read the document owners relevant to the request and inspect the worktree. Load or create the feature spec and reference it from current-feature.
2. Create a local `feature/<name>` or `fix/<name>` branch from current `working`. Reuse the active feature branch when continuing the same work; do not lose uncommitted changes. Small intentional changes may stay on `working` when authorized.
3. Implement incrementally, following the plan and [coding standards](coding-standards.md). Use local Supabase for development and database tests.
4. Run applicable checks from the [testing contract](coding-standards.md#testing). Review behavior, document ownership, changed links, and the final diff. Record exact commands/results or explicitly state what was not run.
5. After applicable checks pass and commit permission is provided, commit only the intended changes with a conventional message (`feat:`, `fix:`, `chore:`, or `docs:`). Do not add generated-by credits.
6. On completion, merge locally into `working`, delete the local feature/fix branch, and record the completed outcome in its spec. Reset current-feature to `# Current Feature`, status `Not Started`, and empty Goals/Notes while preserving comments. Prepend a concise dated history entry linking the spec. Commit the reset and push `working` once.
7. Follow the [release process](../README.md#releases) for staging validation and the protected production PR. Production release is a separate authorized step; completing a local feature does not authorize merging its production PR.

If a check fails, investigate the cause instead of repeating unchanged commands. If progress requires a missing decision or external permission, state the specific blocker and continue independent authorized work.
