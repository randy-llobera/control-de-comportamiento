# Pending Tasks

Internal backlog for improvements and product proposals. Follow the [documentation workflow](../ai-interaction.md); keep active implementation acceptance in its feature spec and remove resolved entries after linking their outcome.

## P1 - High

### TASK-009 - Restrict direct user-profile reads to the current user and admins

- **Confirmed:** 2026-10-07
- **Location:** `supabase/migrations/20260805135713_initial_schema.sql` and `supabase/rls.integration.test.ts`
- **Evidence:** The `users_authenticated_select` RLS policy grants every authenticated caller `SELECT` access with `using (true)`, and the `authenticated` role has table-level `SELECT` on `public.users`. Any signed-in user can therefore retrieve every profile through the public Supabase Data API, including other users’ IDs, display names, school-role descriptions, and role IDs. This conflicts with the product contract: only admins may view user management and assign roles, and permissions must be enforced in the database.
- **Impact:** Teachers and coordinators can bypass the interface and access staff profile data that the application does not authorize them to view.
- **Action:** Replace the broad direct-read policy with one that allows a user to read only their own profile and allows admins to read all profiles. Preserve the incident requirement to display the recording teacher through a minimal, narrowly permissioned read interface. Add local RLS integration assertions that non-admin users cannot directly read another profile or role while incident reads still return the required teacher display name.

### TASK-001 - Build database-backed incident reporting for the list, export, and dashboard

- **Confirmed:** 2026-08-06
- **Location:** `src/lib/incidents.ts`, `src/components/IncidentsView.tsx`, `src/lib/dashboard.ts`, and `src/app/(protected)/(coordinator)/dashboard/page.tsx`
- **Evidence:** The incident page and dashboard each issue an unbounded incident query. The list filters in the browser, while the dashboard loads the returned rows into memory and derives all totals, category/group counts, and the ten recent incidents there. Neither query uses `range()` or another pagination strategy, so Supabase Data API row limits can silently truncate both detailed results and dashboard aggregates. The dashboard also has no period, group, category, severity, or teacher filters and offers no drill-down beyond a fixed recent list.
- **Impact:** Payload and rendering costs grow with the incident table. Incidents beyond the API row cap can be absent from the list, CSV export, and dashboard totals, making the dashboard increasingly inaccurate as well as less useful.
- **Action:** Define one server-owned reporting filter contract and use it for the incident list, complete export, and dashboard. Paginate detailed results, compute filtered aggregates at the database boundary, and redesign the dashboard around useful period comparisons, timeline trends/charts, filters, and paginated or linked drill-downs. Preserve the shared filter semantics and displayed/exported teacher and date values.

## P2 - Medium

### TASK-002 - Add anonymous-access regression coverage to the RLS integration suite

- **Confirmed:** 2026-08-06
- **Location:** `supabase/rls.integration.test.ts`
- **Evidence:** The current suite proves the authenticated role and ownership matrix, and direct local catalog checks show no `anon` table privileges. It does not create an unauthenticated client or assert that protected public tables remain inaccessible to `anon`.
- **Action:** Add local-only integration assertions for anonymous reads and writes on sensitive tables, including `students`, `incidents`, `roles`, and `users`, so CI detects any future grant or policy regression.

## P3 - Low

### TASK-007 - Verify end-to-end database backup and restore recovery

- **Confirmed:** 2026-08-06; updated 2026-09-06
- **Evidence:** [The CI/baseline record](../features/ci-pipeline-and-database-baseline.md#evidence) owns successful rollout and backup-upload evidence. Full decryption and restoration into a usable replacement project remain unverified. Recovery was deferred by the user at P3.
- **Action:** Rehearse the [recovery procedure](../../supabase/README.md) on an approved disposable target and record duration/results. Verify data, identity relationships, permissions, representative app behavior, and cutover. Evaluate target-friendly roles/schema/data exports, explicit grants, independent encrypted retention, Storage bytes, and external configuration recovery. Update the runbook only with the resulting procedure, retain execution evidence here or in its active feature, and clean up the approved resources.

## P3 - Low

### TASK-007 - Verify end-to-end database backup and restore recovery

- **Confirmed:** 2026-08-06; updated 2026-09-06
- **Evidence:** [The CI/baseline record](../features/ci-pipeline-and-database-baseline.md#evidence) owns successful rollout and backup-upload evidence. Full decryption and restoration into a usable replacement project remain unverified. Recovery was deferred by the user at P3.
- **Action:** Rehearse the [recovery procedure](../../supabase/README.md) on an approved disposable target and record duration/results. Verify data, identity relationships, permissions, representative app behavior, and cutover. Evaluate target-friendly roles/schema/data exports, explicit grants, independent encrypted retention, Storage bytes, and external configuration recovery. Update the runbook only with the resulting procedure, retain execution evidence here or in its active feature, and clean up the approved resources.

### TASK-004 - Split the combined authentication screen into dedicated routes

- **Confirmed:** 2026-08-06
- **Location:** `src/app/auth/page.tsx`, `src/components/AuthView.tsx`, and Auth redirects in `src/actions/auth.ts` and `src/proxy.ts`
- **Evidence:** Login and signup currently share `/auth` and switch through client state, so neither state has its own addressable page. Logout is already a Server Action and does not require a page to clear the session.
- **Action:** Define the desired public route contract, then give login and signup dedicated, linkable pages while reusing the existing forms and shared presentation. Keep logout as a Server Action unless a separate signed-out confirmation page is explicitly desired. Update Proxy public paths, redirects, metadata, and focused Auth tests together.

### TASK-006 - Standardize transient operation feedback with the existing shadcn toast

- **Confirmed:** 2026-08-06
- **Location:** `src/components/ui/toast.tsx`, Auth/navigation components, and CRUD form/delete dialog components under `src/components`
- **Evidence:** The root layout already mounts the shadcn/Base UI toaster, and Auth plus logout failures use it. CRUD dialogs instead render returned failures only as inline alerts and close silently after successful mutations, so operation feedback is inconsistent.
- **Action:** Define a small notification policy and apply the existing toast to transient operation success and safe generic failure messages across CRUD flows. Keep field-level validation and actionable form errors inline and associated with their controls. Coordinate the generic failure path with `DEF-002` so unexpected rejected mutations can also produce a non-sensitive toast rather than leaving the user without feedback.

### TASK-008 - Evaluate product extensions before committing implementation scope

- **Source:** Future direction retained from the original project overview during documentation consolidation.
- **Proposals:** Passwordless/Office 365 sign-in, multilingual UI, notifications, incident resolution status, multi-school support, advanced analytics, and a parent portal. Timeline reporting is covered by TASK-001 rather than a separate task.
- **Action:** Confirm priorities, users, permission boundaries, and acceptance criteria before creating individual feature specs. Keep these as proposals, not claims of available functionality; choose integration libraries only after requirements are accepted.

### TASK-008 - Evaluate product extensions before committing implementation scope

- **Source:** Future direction retained from the original project overview during documentation consolidation.
- **Proposals:** Passwordless/Office 365 sign-in, multilingual UI, notifications, incident resolution status, multi-school support, advanced analytics, and a parent portal. Timeline reporting is covered by TASK-001 rather than a separate task.
- **Action:** Confirm priorities, users, permission boundaries, and acceptance criteria before creating individual feature specs. Keep these as proposals, not claims of available functionality; choose integration libraries only after requirements are accepted.
