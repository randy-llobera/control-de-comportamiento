# Pending Tasks

## P1 - High

### TASK-001 - Build database-backed incident reporting for the list, export, and dashboard

- **Confirmed:** 2026-08-06
- **Location:** `src/lib/incidents.ts`, `src/components/IncidentsView.tsx`, `src/lib/dashboard.ts`, and `src/app/(protected)/(coordinator)/dashboard/page.tsx`
- **Evidence:** The incident page and dashboard each issue an unbounded incident query. The list filters in the browser, while the dashboard loads the returned rows into memory and derives all totals, category/group counts, and the ten recent incidents there. Neither query uses `range()` or another pagination strategy, so Supabase Data API row limits can silently truncate both detailed results and dashboard aggregates. The dashboard also has no period, group, category, severity, or teacher filters and offers no drill-down beyond a fixed recent list.
- **Impact:** Payload and rendering costs grow with the incident table. Incidents beyond the API row cap can be absent from the list, CSV export, and dashboard totals, making the dashboard increasingly inaccurate as well as less useful.
- **Action:** Define one server-owned reporting filter contract and use it for the incident list, complete export, and dashboard. Paginate detailed results, compute filtered aggregates at the database boundary, and redesign the dashboard around useful period comparisons, filters, and paginated or linked drill-downs. Preserve the shared filter semantics and displayed/exported teacher and date values.

### TASK-007 - Complete and verify the gated CI release and production backup rollout

- **Confirmed:** 2026-08-06
- **Location:** `.github/workflows/db-ci.yml`, `.github/workflows/backup-prod.yml`, GitHub Actions, and Vercel deployments
- **Evidence:** `origin/working` contains the new hosted migration and ordered Vercel deployment jobs at `ca6934b`, and all six required repository secrets exist. The active `main` ruleset requires `Application checks` and `Local database checks`, blocks deletion and non-fast-forward updates, requires pull requests and linear history, and permits only squash/rebase merges. However, GitHub has no CI run for the new `working` commit. The latest successful run, `31120943522`, tested `bf7bb28` with the older checks-only workflow and contains only the application and local database jobs. `origin/main` still points to `bf7bb28`, so it does not yet contain the hosted migration/deployment jobs. Every retained `Backup Prod DB` run failed, with no successful artifact or decrypt verification.
- **Impact:** The intended staging and production release order has not been exercised from the committed workflow, production does not yet receive that workflow from `main`, and the encrypted backup cannot be treated as recoverable until a successful artifact is decrypted and inspected outside production.
- **Action:** Dispatch or retrigger CI for the current `working` commit and verify application checks, local database checks, staging migration, and Preview deployment. Open the `working` to `main` pull request, verify the required checks, merge using an allowed method, and verify the production migration and deployment jobs. Then manually run `Backup Prod DB`, download the retained artifact, decrypt and validate the full dump in an approved non-production recovery environment, and record the evidence without exposing credentials or plaintext production data.

## P2 - Medium

### TASK-002 - Add anonymous-access regression coverage to the RLS integration suite

- **Confirmed:** 2026-08-06
- **Location:** `supabase/rls.integration.test.ts`
- **Evidence:** The current suite proves the authenticated role and ownership matrix, and direct local catalog checks show no `anon` table privileges. It does not create an unauthenticated client or assert that protected public tables remain inaccessible to `anon`.
- **Action:** Add local-only integration assertions for anonymous reads and writes on sensitive tables, including `students`, `incidents`, `roles`, and `users`, so CI detects any future grant or policy regression.

### TASK-003 - Retarget the auth-auditor agent to Supabase Auth

- **Confirmed:** 2026-08-06
- **Location:** `.codex/agents/auth-auditor.toml`
- **Evidence:** The agent declares NextAuth v5 expertise, excludes protections attributed to NextAuth, and emphasizes application-owned password hashing and reset-token storage. This repository uses Supabase Auth, Supabase SSR clients, Next.js Proxy, Server Actions, Postgres grants, and RLS.
- **Action:** Replace the NextAuth-specific scope with Supabase-owned versus application-owned controls. Cover request-scoped session validation, Proxy and protected layouts, authorization at feature and Server Action boundaries, signup metadata/profile creation, role escalation, RLS and grants, service-role key isolation, browser/server client separation, safe Auth errors, and hosted configuration assumptions. Keep findings evidence-based and require current Supabase documentation.

## P3 - Low

### TASK-004 - Split the combined authentication screen into dedicated routes

- **Confirmed:** 2026-08-06
- **Location:** `src/app/auth/page.tsx`, `src/components/AuthView.tsx`, and Auth redirects in `src/actions/auth.ts` and `src/proxy.ts`
- **Evidence:** Login and signup currently share `/auth` and switch through client state, so neither state has its own addressable page. Logout is already a Server Action and does not require a page to clear the session.
- **Action:** Define the desired public route contract, then give login and signup dedicated, linkable pages while reusing the existing forms and shared presentation. Keep logout as a Server Action unless a separate signed-out confirmation page is explicitly desired. Update Proxy public paths, redirects, metadata, and focused Auth tests together.

### TASK-005 - Add richer client-side validation without weakening server validation

- **Confirmed:** 2026-08-06
- **Location:** Auth and CRUD form components under `src/components`, with authoritative schemas under `src/actions`
- **Evidence:** Forms use native browser constraints such as `required` and `type="email"`, while complete Zod validation runs only in Server Actions. There is no shared client-side schema validation for immediate field feedback.
- **Action:** Define which fields need validation before submission, move reusable environment-neutral Zod schemas outside `"use server"` modules, and import the same schema into the client form and its Server Action. Use `safeParse()` for immediate accessible field feedback and infer input types from the schema where useful. Keep every Server Action validation check authoritative so client validation improves feedback without becoming a security boundary or duplicating divergent rules.

### TASK-006 - Standardize transient operation feedback with the existing shadcn toast

- **Confirmed:** 2026-08-06
- **Location:** `src/components/ui/toast.tsx`, Auth/navigation components, and CRUD form/delete dialog components under `src/components`
- **Evidence:** The root layout already mounts the shadcn/Base UI toaster, and Auth plus logout failures use it. CRUD dialogs instead render returned failures only as inline alerts and close silently after successful mutations, so operation feedback is inconsistent.
- **Action:** Define a small notification policy and apply the existing toast to transient operation success and safe generic failure messages across CRUD flows. Keep field-level validation and actionable form errors inline and associated with their controls. Coordinate the generic failure path with `DEF-002` so unexpected rejected mutations can also produce a non-sensitive toast rather than leaving the user without feedback.
