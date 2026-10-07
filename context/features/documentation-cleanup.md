# Feature: Project Documentation Cleanup

# Feature: Project Documentation Cleanup

## Status

Complete

## Goal

Give every retained document a clear owner and purpose, correct stale guidance, and make day-to-day documentation updates predictable without duplicating implementation details.

## Scope and decisions

- The user expanded the original README cleanup to all project documentation, local skills, and reviewer instructions.
- Keep the ownership map and developer update matrix in [ai-interaction.md](../ai-interaction.md). Other documents link to their topic owners.
- Product and operating guides describe intended behavior and supported procedures. Internal feature/task/defect records retain history, proposals, and incomplete verification.
- Keep recovery commands only in [the recovery guide](../../supabase/README.md), replacing the original requirement to duplicate them in the root README.
- Preserve distinct completed feature records as concise historical decisions/outcomes; use Git history for superseded plans. Retain the completion history.
- Remove the completed refactoring roadmap and feature index after retaining their unique useful context.
- Use existing files and folders. No documentation generator, dependencies, application changes, database operations, or deployment changes.

## Plan

1. Formalize document ownership and daily update scenarios; correct misleading agent entry points.
2. Simplify README, product overview, coding standards, and recovery guidance around their assigned purposes.
3. Reconcile historical feature statuses and preserve unique decisions and evidence without repeated plans or checklists.
4. Align local skills and reviewers, and reconcile related internal tasks without duplicating them.
5. Audit every retained file, links, source references, repeated material, and scope. Run repository checks and report the complete document inventory.
   Give every retained document a clear owner and purpose, correct stale guidance, and make day-to-day documentation updates predictable without duplicating implementation details.

## Scope and decisions

- The user expanded the original README cleanup to all project documentation, local skills, and reviewer instructions.
- Keep the ownership map and developer update matrix in [ai-interaction.md](../ai-interaction.md). Other documents link to their topic owners.
- Product and operating guides describe intended behavior and supported procedures. Internal feature/task/defect records retain history, proposals, and incomplete verification.
- Keep recovery commands only in [the recovery guide](../../supabase/README.md), replacing the original requirement to duplicate them in the root README.
- Preserve distinct completed feature records as concise historical decisions/outcomes; use Git history for superseded plans. Retain the completion history.
- Remove the completed refactoring roadmap and feature index after retaining their unique useful context.
- Use existing files and folders. No documentation generator, dependencies, application changes, database operations, or deployment changes.

## Plan

1. Formalize document ownership and daily update scenarios; correct misleading agent entry points.
2. Simplify README, product overview, coding standards, and recovery guidance around their assigned purposes.
3. Reconcile historical feature statuses and preserve unique decisions and evidence without repeated plans or checklists.
4. Align local skills and reviewers, and reconcile related internal tasks without duplicating them.
5. Audit every retained file, links, source references, repeated material, and scope. Run repository checks and report the complete document inventory.

## Risks

- Simplification can lose decisions or requirements; compare with the original documents and preserve unique information at its owner.
- A verified backup upload is not a verified restore. Keep rehearsal evidence internal and retain actionable recovery prerequisites and exclusions in the runbook.
- Historical completion records establish past delivery, not a new successful run of every historical test.

## Acceptance checklist

- [x] Every retained guide, feature record, skill, and reviewer has a distinct purpose and consultation scenario.
- [x] ai-interaction contains the authoritative ownership and developer update matrix.
- [x] Current guides contain no stale stack claims, copied implementation reports, or backlog lists.
- [x] Product requirements and historical decisions are preserved without presenting proposals as available features.
- [x] Recovery instructions have one owner and retain necessary operational constraints.
- [x] Completed features are clearly historical, with no misleading pending status or obsolete active instructions.
- [x] Skills and reviewers use current project boundaries and document ownership.
- [x] No redundant planning files, broken local links, or obsolete document references remain.
- [x] Changes are limited to documentation and agent/skill instructions; no credentials or environment values are added.
- [x] Lint, typecheck, build, diff validation, and relevant instruction/document checks pass.
- [x] Final response lists the retained files, contents, and when to consult/update them.

## Implementation record

- Assigned one owner per topic and added the developer update matrix; reduced the root agent file to entry-point routing.
- Consolidated product permissions, engineering boundaries, setup/releases, and recovery into their respective guides.
- Preserved 22 completed feature records with outcomes/source links and linked the existing completion history without changing its dates or summaries. Retained product-extension proposals under TASK-008 and timeline reporting under TASK-001.
- Retargeted the auth reviewer to Supabase, resolving TASK-003 within this feature. Preserved all reviewer runtime settings and aligned the existing skill action modes with document ownership.
- Removed the two redundant refactoring planning documents. No new documentation folders or tooling were added.

## Verification

- `npm run lint`, `npm run typecheck`, `npm run build`, and `git diff --check` passed with exit code 0 for the expanded scope.
- A temporary audit checked all 42 retained Markdown files: 207 local links, 38 anchors, package-script names, feature statuses, preserved history dates/summaries, obsolete references, and repeated prose. Manual review checked topic ownership, retained decisions, and alignment with source/workflows.
- The skill-creator validator passed for all four skills. All four reviewer TOML files parse, with model, reasoning effort, sandbox mode, and names unchanged.
- Hash comparison confirms tracked application code, dependencies, migrations, and deployment configuration are unchanged. The only removed files are the two obsolete planning documents; no project files or folders were added.
- Product direction was retained internally, recovery requirements were compared with the prior runbook and backup workflow, and historical source links resolve. Successful rollout/backup evidence remains in the CI feature record; pending recovery remains in its existing task.
- Unit/integration suites and browser flows were not rerun for this documentation-only change. No database operations or deployment were performed. The documentation-cleanup changes were completed on 2026-09-29.
- The final response provides the full retained-file inventory and consultation/update scenarios; the permanent owner/update matrix is in ai-interaction.
