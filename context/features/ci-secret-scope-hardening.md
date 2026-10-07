# Feature: CI Secret Scope Hardening

## Status

Complete

Completed 2026-10-07.

## Goal

Resolve PR10-002 by limiting hosted database and Vercel deployment credentials to the workflow steps that consume them, without changing release ordering or target selection.

## Scope and decisions

- Remove job-level secret environment blocks from the hosted migration and application deployment jobs.
- Expose `PROD_DB_URL` and `STAGING_DB_URL` only to `Push pending migrations`, preserving its explicit branch selection and missing-target validation.
- Expose the Vercel credentials only to `Check Vercel configuration` and `Build and deploy application`; checkout, setup, package installation, and CLI installation remain secret-free.
- Keep this as a CI-only hardening change. No product, schema, application-boundary, dependency, or README changes are required.
- Retire the temporary PR findings record after transferring this finding and its resolution into this feature record.

## Acceptance checklist

- [x] Hosted migration no longer defines database URLs at job scope.
- [x] Database URLs are available only to the migration step that invokes `supabase db push`.
- [x] Deployment no longer defines Vercel credentials at job scope.
- [x] Vercel credentials are available only to configuration validation and the deploy step.
- [x] Existing branch-based staging/production selection, validation, migration ordering, and deployment ordering are unchanged.
- [x] No unrelated working-tree changes are modified.
- [x] Required repository checks pass, or any unavailable check is recorded explicitly.

## Verification

- `ruby -e 'require "yaml"; YAML.load_file(".github/workflows/db-ci.yml")'` passed; the workflow YAML parsed successfully.
- A secret-scope audit confirms the database URLs appear only on `Push pending migrations`, and the Vercel credentials appear only on `Check Vercel configuration` and `Build and deploy application`.
- `npm run lint` passed.
- `npm run typecheck` passed.
- `npm run build` passed with Next.js production route generation completing successfully.
- `git diff --check` passed.
- Repository search found no stale reference to the removed findings filename; the PR10-002 evidence is retained here.
- No database reset, integration test, browser check, or deployment was required. The intended changes were committed on `working`; unrelated existing worktree changes were preserved.

## Resolution evidence

PR10-002 identified that database URLs were available during checkout, Node setup, global npm installation, and dependency installation, and that Vercel credentials were similarly available before deployment. The workflow now scopes each credential set to the smallest existing steps that need it while preserving the existing commands and safety checks.
