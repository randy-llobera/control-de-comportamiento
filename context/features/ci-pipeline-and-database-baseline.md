# Feature: CI Pipeline and Database Baseline

## Status

Complete

## Historical outcome

Replaced the old CI setup with gated application/local-database checks, hosted migration-before-deployment ordering, and PR-based production releases. Consolidated the schema into one initial migration and added an independent encrypted production backup workflow.

The baseline was installed after explicitly approved resets of disposable hosted data, not as an upgrade over the old migration history. That one-time decision does not authorize future resets. Admin bootstrap remained an operator action because an Auth password must not be committed.

The rollout fixed toolchain drift and missing configuration assumptions. It exercised hosted baseline migration as well as deployment, instead of relying only on no-pending-migration runs. Restore rehearsal was excluded from completion at the user's request and remains owned by [TASK-007](../tasks/pending-tasks.md#task-007---verify-end-to-end-database-backup-and-restore-recovery). The separately observed stale-session defect is [DEF-004](../defects/pending-defects.md#def-004---deleted-user-sessions-cause-a-500-instead-of-returning-to-login).

## Evidence

- [Staging CI](https://github.com/randy-llobera/control-de-comportamiento/actions/runs/34044729601), [production PR checks](https://github.com/randy-llobera/control-de-comportamiento/actions/runs/33979443109), and [production CI](https://github.com/randy-llobera/control-de-comportamiento/actions/runs/33980123931) completed successfully.
- [Manual production backup](https://github.com/randy-llobera/control-de-comportamiento/actions/runs/33982278245) created and uploaded its artifact.
- The original delivery record reports staging smoke checks and user-confirmed production authentication. It does not establish full browser/CRUD acceptance or a full restore.
- Independent clean CI runs exercised local integration tests; two consecutive runs in one local stack were not the revised acceptance criterion.

## Maintained implementation

- [CI workflow](../../.github/workflows/db-ci.yml), [backup workflow](../../.github/workflows/backup-prod.yml), and [Vercel configuration](../../vercel.json).
- [Initial migration](../../supabase/migrations/20260805135713_initial_schema.sql) and [local integration coverage](../../supabase/rls.integration.test.ts).
- [Release operation](../../README.md#releases) and [recovery procedure](../../supabase/README.md) are the maintained guides; Git history retains the original plan and rollout details.
