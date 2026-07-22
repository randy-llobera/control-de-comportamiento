# Coding Standards Refactoring Roadmap

Date: 2026-07-22

## Goal and scope

Bring the repository into alignment with `context/coding-standards.md` through small, dependency-ordered increments. This is discovery and planning only; no application code was changed.

Implementation is divided into independent, ordered specs in [Coding Standards Refactoring Features](coding-standards-refactoring-features.md). Load and complete one feature at a time through the project feature workflow.

## Baseline

- `npm run lint`, `npm run typecheck`, and `npm run build` pass.
- TypeScript strict mode is enabled and no `any` usage was found.
- Tailwind v4 uses the CSS-first import.
- The schema has a committed migration, generated types, constraints, and RLS on every application table.
- Protected role layouts, Zod validation for mutations, typed Supabase clients, and targeted path invalidation already exist.

Passing checks do not prove architectural compliance. The current tooling does not detect direct browser table access, database queries in Server Actions, or missing feature boundaries.

## Findings

| Area | Evidence | Standards reference |
| --- | --- | --- |
| Server/Client boundary | All six protected feature pages use `"use client"`, `useEffect`, and browser Supabase table queries. | `React and Next.js`; `Architecture Contract > 1, 3, 4, 11` |
| Feature layer | No feature modules such as `lib/incidents.ts` or `lib/students.ts` exist. | `Architecture Contract > 1, 2, 5` |
| Server Actions | `src/actions/mutations.ts` owns validation, client creation, actor loading, authorization, queries, mutations, errors, and invalidation. | `Architecture Contract > 6` |
| Contracts | Components import database rows and manual join types from `src/types/database.ts`; no feature contracts exist. | `Architecture Contract > 14` |
| Component scope | Pages combine loading, forms, filters, CSV/statistics, mutations, and rendering. `incidentes/page.tsx` is 479 lines. | `React and Next.js`; `Architecture Contract > 4` |
| Proxy | `src/proxy.ts` contains both the framework entry point and Proxy-specific Supabase cookie/session code. | `Architecture Contract > 12` |
| Cache/refresh | Client pages repeat browser queries after successful Actions even though the Action invalidates affected paths. | `Architecture Contract > 15` |
| Errors | Browser reads only log failures; Auth can expose raw provider text; `lib/auth.ts` does not distinguish query failure from missing profile. | `Architecture Contract > 17` |
| Authorization/RLS | Any authenticated user can currently update or delete any incident. The approved rule limits teachers to their own incidents while coordinators and admins may update/delete all incidents. | `Architecture Contract > 13, 18` |
| Styling | `globals.css` has no project `@theme` tokens; raw color choices repeat across large components. | `Tailwind CSS v4`; `Naming and styling` |
| Tests | Vitest is not installed and no boundary, business-rule, mapping, authorization, RLS, filtering, or CSV tests exist. | `Architecture Contract > 19` |

## Ordered roadmap

### 1. Security and Supabase infrastructure

Do this first because all later feature operations depend on trusted identity, scoped clients, and final database enforcement.

Standards: `Database and code quality`; `Architecture Contract > 10, 11, 12, 13, 18`.

#### 1.1 Permission matrix and RLS

- Apply the approved incident rule: teachers may update/delete only incidents they created; coordinators and admins may update/delete all incidents.
- Confirm the remaining CRUD permissions for every role before changing their policies.
- Compare the approved matrix with application guards, grants, and RLS policies.
- Add changes in a new migration; do not rewrite an applied migration.
- Regenerate `src/types/supabase.ts` after schema changes.
- Dependency: none.

#### 1.2 Proxy separation

- Move Proxy-specific client and cookie/session handling to `src/lib/supabase-proxy.ts`.
- Keep `src/proxy.ts` as the framework entry point and basic session route gate.
- Do not add profile queries or role authorization to Proxy.
- Dependency: none.

#### 1.3 Server/browser client boundaries

- Keep `supabase-server.ts` request-scoped and typed.
- Rename `src/lib/supabase.ts` to `supabase-browser.ts` as its consumers migrate.
- Restrict the browser client to browser-owned Auth behavior unless Realtime, Presence, or Storage is later required.
- Add `server-only` to server-only auth and feature modules.
- Keep the service-role client limited to the explicit admin bootstrap script.
- Dependency: coordinate the rename with Categories 3-6.

### 2. Shared contracts and boundary behavior

Create stable shared contracts before extracting features.

Standards: `TypeScript`; `Architecture Contract > 6, 9, 14, 17`.

#### 2.1 Action result contract

- Move a generic discriminated `ActionResult<T>` to `src/types/actions.ts`.
- Keep field and safe Spanish UI errors at the Action boundary.
- Do not make feature modules import from a `"use server"` file.
- Dependency: none.

#### 2.2 Known application errors

- Define only errors needed for authentication, authorization, missing resources, and conflicts.
- Feature modules map expected database failures; Actions map known errors to UI results.
- Log unexpected server failures without returning raw database/provider messages.
- Let Pages handle redirects, empty states, `notFound()`, and framework errors.
- Dependency: 2.1.

#### 2.3 Feature contracts

- Keep `src/types/supabase.ts` generated and unedited.
- Add serializable `src/types/<feature>.ts` contracts as each feature migrates.
- Exclude server-controlled values such as `teacherId`, `createdBy`, and role from browser input types.
- Infer joined query shapes inside feature modules, then map them to feature contracts.
- Remove `src/types/database.ts` only after its final consumer migrates.
- Dependency: incremental with Categories 3-6.

#### 2.4 Thin, feature-specific Actions

- Split `mutations.ts` into `actions/<feature>.ts` only when the matching feature module exists.
- Limit each Action to structural validation, one feature call, known error mapping, and precise invalidation.
- Remove the shared mutation runner after the final operation migrates.
- Dependency: 2.1, 2.2, and the relevant feature module.

### 3. Users, actor resolution, and navigation

This is the first vertical slice because every protected feature depends on the actor and role.

Standards: `Architecture Contract > 4, 5, 13, 14`.

#### 3.1 Auth module

- Keep identity verification, current actor lookup, and authorization guards in `lib/auth.ts`.
- Handle Auth/profile query failures explicitly.
- Preserve careful request/render deduplication with React `cache()`.
- Dependency: Categories 1-2.

#### 3.2 Users feature

- Add user/role contracts and `lib/users.ts` for admin-authorized reads and role assignment.
- Derive the acting admin from the verified session and map results to neutral contracts.
- Dependency: 3.1.

#### 3.3 Users page and Action

- Make `usuarios/page.tsx` a Server Component that calls `lib/users.ts`.
- Extract only the interactive role control/list into an English-named Client Component.
- Move role mutation boundary logic to `actions/users.ts`.
- Remove browser table reloads after mutation.
- Dependency: 3.2 and 2.4.

#### 3.4 Navigation

- Pass a neutral current-user contract instead of a database join type.
- Keep browser Auth sign-out as an allowed browser-client use.
- Extract duplicated mobile/desktop account markup only if it forms a clear independent component.
- Dependency: 3.1 and 2.3.

### 4. Groups and categories

These reference-data features precede students and incidents.

Standards: `Architecture Contract > 1, 3, 4, 5, 6, 15`.

#### 4.1 Groups

- Add group contracts and `lib/groups.ts` with coordinator/admin authorization.
- Move writes to thin `actions/groups.ts` boundaries.
- Make `grupos/page.tsx` a Server Component and isolate interactive form/list behavior.
- Remove browser table access and manual reloads.
- Dependency: Categories 1-3.

#### 4.2 Categories

- Add category contracts and `lib/categories.ts` with coordinator/admin authorization.
- Move writes to `actions/categories.ts`.
- Make `categorias/page.tsx` a Server Component and isolate interactive form/list behavior.
- Remove browser table access and manual reloads.
- Dependency: Categories 1-3. It should follow groups as a separate increment but does not depend on group data.

### 5. Students

Students follow groups because student reads and writes require group data.

Standards: `Architecture Contract > 3, 4, 5, 9, 15, 17`.

#### 5.1 Student feature

- Add student list/input contracts and `lib/students.ts` CRUD operations.
- Validate group existence and business rules in the feature module.
- Map unique and foreign-key conflicts to known application errors.
- Dependency: 4.1.

#### 5.2 Student page and Actions

- Move structural validation and result mapping to `actions/students.ts`.
- Make `estudiantes/page.tsx` load students/group options on the server.
- Extract a focused Client Component for list/form interaction.
- Remove browser queries and post-Action `loadData()` calls.
- Dependency: 5.1 and 2.4.

### 6. Incidents and dashboard

This follows users, groups, categories, and students because incident data joins all four domains.

Standards: `Architecture Contract > 3, 4, 5, 9, 14, 15, 19`.

#### 6.1 Incident feature

- Add list, option, filter, and create-input contracts.
- Add `lib/incidents.ts` with joined reads, actor-derived `teacherId`, authorization, business validation, and mapping.
- Infer joined query results rather than manually recreating them.
- Keep the module cohesive; do not add service/repository layers.
- Dependency: Categories 1-5.

#### 6.2 Incident page and Action

- Move mutation validation/result mapping to `actions/incidents.ts`.
- Make `incidentes/page.tsx` a Server Component that calls `lib/incidents.ts` directly.
- Add an `IncidentsView` Client Component for shared filter/modal state.
- Extract `IncidentFilters` and `CreateIncidentForm` as independent visible responsibilities.
- Remove browser table queries and the post-Action reload.
- Dependency: 6.1.

#### 6.3 Filtering and CSV

- Replace duplicated display/export filtering with one pure function.
- Add a pure CSV serializer that correctly escapes quotes and preserves Spanish headers, UTF-8 output, and `incidentes-YYYYMMDD.csv` naming.
- Keep only browser download mechanics in the Client Component.
- Dependency: the contracts from 6.1.

#### 6.4 Dashboard

- Reuse the incident boundary or add one cohesive dashboard read if its result contract is materially different.
- Keep calculations server-side or in pure utilities unless browser interaction requires otherwise.
- Make `dashboard/page.tsx` a Server Component and retain only genuine interaction client-side.
- Dependency: 6.1; perform after the incident page.

### 7. Naming, component, and styling cleanup

Do this after data-flow extraction to avoid conflicts and rename-only churn.

Standards: `React and Next.js`; `Tailwind CSS v4`; `Naming and styling`; `Database and code quality`; `Architecture Contract > 2, 4`.

#### 7.1 English code names and file conventions

- Keep Spanish public routes and user-facing content.
- Rename Spanish implementation identifiers such as `IncidentesPage`, `EstudiantesPage`, and `UsuariosPage` as their files are touched.
- Use PascalCase component files, kebab-case non-component files, and type-only imports for component contracts.
- Dependency: Categories 3-6.

#### 7.2 Focused components and state

- Review extracted views/forms for one visible responsibility.
- Keep components flat under `src/components` unless navigation becomes demonstrably difficult.
- Extract hooks only for reused or independently complex stateful logic.
- Do not introduce Zustand or TanStack Query for current local state/server reads.
- Dependency: Server/Client boundaries from Categories 3-6.

#### 7.3 Tailwind theme tokens

- Define the small set of shared project tokens with `@theme`/CSS variables in `globals.css`.
- Apply tokens during component cleanup without adding a JavaScript Tailwind config.
- Use shadcn/ui only for an actual interface need, not solely for conformity.
- Dependency: 7.2.

### 8. Tests and repeatable verification

Add tests after contracts stabilize. Targeted security verification still accompanies every earlier security change.

Standards: `Database and code quality`; `Architecture Contract > 9, 18, 19`.

#### 8.1 Vitest setup

- Treat Vitest as its own planned dependency change.
- Add only the configuration/scripts needed for server and pure unit tests.
- Do not add component tests unless requested.
- Dependency: stable contracts/utilities from Categories 2-6.

#### 8.2 Unit coverage

- Test Zod schemas, Action error mapping, authorization/business helpers, feature result mapping, incident filtering, and CSV serialization.
- Dependency: 8.1.

#### 8.3 Integration coverage

- Test the RLS role/ownership matrix, database constraints, and feature functions against local Supabase where practical.
- Test Route Handler status responses only if Route Handlers are later introduced.
- Dependency: 1.1 and 8.1.

#### 8.4 Increment verification

Run after each increment:

```bash
npm run lint
npm run typecheck
npm run build
```

Also run targeted tests and browser verification for changed UI flows. Success means all commands exit with code 0 and affected roles complete the flow without unauthorized access or stale data.

## Implementation order

The detailed, authoritative sequence is the 16-feature [Coding Standards Refactoring Features](coding-standards-refactoring-features.md) index. The list below remains the higher-level category order.

1. Complete the permission matrix and update RLS through a migration, including the approved incident ownership rule.
2. Extract Proxy infrastructure and tighten actor/error handling.
3. Add shared Action and application-error contracts.
4. Migrate users and role assignment end to end.
5. Migrate groups, then categories, as separate increments.
6. Migrate students end to end.
7. Migrate incidents, then filtering/CSV.
8. Migrate dashboard reads/calculations.
9. Finish naming, component, browser-client, and theme cleanup.
10. Add Vitest and focused unit/integration coverage.

Each increment needs its own implementation plan and must pass the verification commands before the next begins.

## Deliberately excluded

- Do not add Route Handlers unless an actual HTTP caller or deferred read requires them.
- No current external API, background job, or dynamic route requires refactoring.
- Do not introduce services, repositories, `db-context.ts`, Zustand, or TanStack Query.
- Do not manually edit `src/types/supabase.ts`.

## Confirmed authorization decision

Teachers may update/delete only incidents they created. Coordinators and admins may update/delete all incidents. This rule must be enforced in feature-level authorization and RLS during Subcategory 1.1.
