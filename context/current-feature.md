# Current Feature: Tailwind Theme and Naming

## Status

In Progress

## Goals

<!-- Add goals here -->

- Define shared CSS-first Tailwind v4 theme tokens in the root stylesheet using the current palette.
- Replace repeated semantic color utilities only where the token preserves existing visual intent.
- Align implementation identifiers and filenames with project naming standards while preserving Spanish URLs and visible content.
- Preserve generated shadcn primitive filenames and import paths under `src/components/ui`.
- Rename the unused browser client module to `supabase-browser.ts` and verify that it remains unreferenced.
- Remove obsolete legacy modules, comments, imports, and variables only after repository-wide zero-reference checks.
- Preserve product behavior, layout, states, and responsive appearance.

## Notes

<!-- Add notes here -->

- Spec: `context/features/refactor-15-tailwind-theme-and-naming.md`
- Dependency: Complete Feature 14 before starting.
- Standards: Tailwind CSS v4; naming and styling; database and code quality; folder structure; UI components.
- Naming rules: PascalCase application-owned component filenames, `use`-prefixed camelCase hook filenames, kebab-case for other non-component files, and type-only component contract imports.
- Shadcn exception: preserve generated primitive filenames and import paths under `src/components/ui`; do not rename them to PascalCase.
- Out of scope: visual redesign, new components, dark mode, shadcn installation, JavaScript Tailwind config, spacing/layout/type-scale changes, route or label changes, behavior changes, and component feature folders.
- Implementation: inventory names/colors/modules; define theme tokens; replace clear semantic colors; fix English identifiers and filenames; rename the browser module; remove proven-unreferenced legacy modules; run automated and responsive browser checks.
- Approved UI follow-up: keep the signed-out content narrow, make protected navigation fill the viewport, pin account/logout controls to the bottom, and use a neutral focus ring instead of blue.
- Risks: overly broad token mappings can alter contrast or state meaning; casing-only renames can fail on case-sensitive systems; legacy removal requires repository-wide reference verification.
- Verification: confirm unchanged route layouts and states, readable contrast, naming compliance, type-only imports, zero browser-client consumers, and passing tests, lint, typecheck, build, and mobile/desktop browser checks.
- Browser verification: using the local admin account, created `Codex Theme Role Test`, promoted it from Profesor to Coordinador, demoted it back to Profesor, and verified every protected route at 390px and 1280px. Playwright confirmed the responsive shell gives `<main>` the full 390px mobile width below a 64px header, the open drawer measures 320px by 844px with its account/logout footer pinned to the bottom, the desktop sidebar fills a 900px viewport with its footer pinned to the bottom, and no browser errors or horizontal overflow remain. The 390px signed-out view now has 24px side gutters, and focused form controls use the neutral ring token.
- Done checklist remains defined in the source spec.

## History

<!-- Keep this updated. Newest to oldest -->

- 2026-08-04: Moved login, signup, and logout to validated Server Actions with request-scoped Supabase clients; added safe Spanish Auth errors, separated shadcn-based Auth forms, global toast feedback, and focused tests plus browser verification.
- 2026-08-03: Moved dashboard reads, coordinator/admin authorization, mapping, aggregation, and recent ordering behind a server feature boundary; converted the page to a Server Component; unified displayed/exported incident dates as `DD-MM-YYYY`; and added focused tests plus browser role verification.
- 2026-08-03: Added one shared incident filter for list and export, Excel-compatible UTF-8 CSV serialization, focused utility tests, and the `src/utils` application utility boundary.
- 2026-07-31: Completed ownership-aware incident update/delete, group-scoped student loading, focused incident dialogs/filters/list components, and role-based boundary coverage.
- 2026-07-27: Moved incident reads and creation behind an authenticated feature boundary with server-rendered mapped data, actor-derived identity, and focused tests.
- 2026-07-27: Moved student management behind an authenticated feature boundary with server-rendered data, admin-only update/delete, focused dialogs, and targeted tests.
- 2026-07-24: Moved category management behind an authorized feature boundary with server-rendered data, centralized permission checks, shadcn dialogs, and targeted tests.
- 2026-07-24: Moved group management behind an authorized feature boundary with server-rendered data, validated Actions, shadcn dialogs, and targeted tests.
- 2026-07-23: Moved navigation to a neutral current-user contract with centralized role validation and preserved role-specific responsive behavior.
- 2026-07-23: Moved user-management reads, role assignment, authorization, and mapping behind the users feature boundary.
- 2026-07-23: Added the Vitest Node test foundation with path aliases, explicit discovery, and shared application-error boundary tests.
- 2026-07-23: Added shared Action and known-error contracts, reusable safe server-boundary messages, and explicit Auth/profile failure handling.
- 2026-07-22: Separated Proxy-scoped Supabase claims verification and session cookie/header refresh handling from route redirect logic.
- 2026-07-22: Enforced role-based Supabase RLS for student and incident writes and verified the permission matrix through user-scoped local clients.
- 2026-07-17: Added targeted Next.js route invalidation after successful Server Actions for incidents, students, groups, categories, and user roles.
- 2026-07-17: Added Zod v4 Server Action validation, normalized mutation payloads, and Spanish field-level errors in forms.
- 2026-07-17: Reused one request-scoped Supabase server client per mutation while preserving cached server-component profile lookups.
- 2026-07-17: Added typed Supabase SSR browser/session clients, `proxy.ts` route gating, and cached server profile lookups. Moved authenticated pages into protected role route groups and migrated existing writes to server-authorized actions.
- 2026-07-16: Typed browser and server Supabase clients with the generated `Database` schema.
