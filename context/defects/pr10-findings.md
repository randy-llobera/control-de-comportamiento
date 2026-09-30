# PR-10 Review Findings

**PR:** [#10 - Update project docs and guidelines](https://github.com/randy-llobera/control-de-comportamiento/pull/10)
**Reviewed:** 2026-09-29
**Status:** Open

Copilot reviewed commit `998c304`; the PR head is now `c187e66`. Its database- and Vercel-secret threads are therefore outdated as PR comments, but describe valid hardening work in the current workflow. This record distinguishes that scope from findings that still affect the PR head.

## P1 - High

### PR10-002 - CI deployment secrets are exposed to unrelated job steps

- **Evidence:** The hosted-migration job sets both database URLs at job scope in [db-ci.yml](../../.github/workflows/db-ci.yml#L102-L144), exposing them during checkout, Node setup, global npm installation, and `npm ci`. The deployment job similarly sets Vercel credentials at job scope before checkout and global CLI installation ([db-ci.yml](../../.github/workflows/db-ci.yml#L146-L198)).
- **Impact:** A compromised action, package-install script, or dependency can read production/staging database and deployment credentials unnecessarily.
- **Recommended fix:** Move the selected database URL to the `Push pending migrations` step’s `env`, and move Vercel credentials to the configuration/deploy steps only. Keep installation, checkout, and setup steps free of those secrets. Implement this as a separate CI hardening change because the workflow is not in the current PR diff.

### PR10-003 - Unresolved merge-conflict markers make project records invalid

- **Evidence:** `git diff --check origin/main...HEAD` exits with code 2 and reports markers in [pending-defects.md](pending-defects.md) and [pending-tasks.md](../tasks/pending-tasks.md). The latter also has a nested conflict in TASK-001.
- **Impact:** The pending-work registers are malformed, and the PR fails a check it declares as passing.
- **Recommended fix:** Resolve each conflict deliberately, preserving one accurate version of the introductory text and the TASK-001 action. Re-run `git diff --check` before merge.

## P2 - Medium

### PR10-004 - Sanitized production loader cannot run as a template

- **Evidence:** [students-load-categories-2026.sql](../../scripts/students-load-categories-2026.sql) contains no student rows, but still requires exactly eight groups and 158 students before it can proceed.
- **Impact:** The script always aborts until a maintainer edits both the private roster and the hard-coded counts. It is neither a runnable production loader nor a self-explanatory reusable template.
- **Recommended fix:** Move the real roster outside Git into an approved restricted process. Make the loader accept that source and its expected counts as private operational inputs, with preflight checks retained. Test it on an approved disposable/staging target before any production use.

## P3 - Low

### PR10-005 - Documentation cleanup record conflicts with its completion state and scope

- **Evidence:** [documentation-cleanup.md](../features/documentation-cleanup.md) says `In Progress` and certifies a documentation-only change with unchanged deployment configuration, while [current-feature.md](../current-feature.md) records the cleanup as completed. The PR also includes a loader and a seed-data change.
- **Impact:** The historical record is internally inconsistent and does not accurately certify what the PR contains.
- **Recommended fix:** Mark the feature record `Complete`. Prefer splitting the loader and seed work from the documentation PR; if they remain, expand its accepted scope, validation, and verification evidence to cover the database-data changes.

### PR10-006 - Seed category label lacks an accent

- **Evidence:** [seed.sql](../../supabase/seed/seed.sql) uses `Dispositivos Electronicos`.
- **Impact:** The Spanish fixture label is misspelled.
- **Recommended fix:** Change it to `Dispositivos Electrónicos` and keep any matching test expectations or documentation aligned.
