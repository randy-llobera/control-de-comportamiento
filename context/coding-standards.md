# Coding Standards

These rules define how the application should be built. They are not an inventory of implemented features or a record of test results. Consult the [product contract](project-overview.md) for behavior and the [documentation update matrix](ai-interaction.md#what-to-update-for-each-change) when a change affects a guide.

## Code conventions

- Use strict TypeScript. Prefer inference for local values and explicit public contracts; use `unknown` with narrowing instead of `any`.
- Use interfaces where object extension helps; use type aliases for unions, mapped types, and inferred contracts. Use type-only imports for types.
- Prefer arrow functions for callbacks/local functions; named functions are appropriate for framework conventions or readability.
- Components/types/interfaces use PascalCase; application component filenames match their export. Hooks use camelCase beginning with `use`. Other non-component files use kebab-case. Functions/variables use camelCase; immutable configuration constants use SCREAMING_SNAKE_CASE.
- Preserve generated shadcn filenames under `src/components/ui`. Install primitives through the shadcn CLI. Keep its utility alias in `components.json` pointing at `src/utils/cn.ts`.
- Use English identifiers and Spanish user-facing text. Preserve established public route names.
- Use Tailwind CSS v4 CSS-first tokens in the root stylesheet: `@theme` and shared CSS custom properties. Avoid JavaScript Tailwind configuration unless an integration requires `@config` compatibility. Use inline styles only for values calculated at runtime.
- Keep functions cohesive. Remove unused code, commented-out implementations, and debug output. Favor small interfaces and composition. Extract a shared abstraction after a pattern repeats three or more times; separate components by responsibility when needed for clarity. Do not add layers or dependencies speculatively.

## Application boundaries

| Location | Owns | Keep out |
| --- | --- | --- |
| `src/app` Server Pages | Initial reads through feature functions, composition, redirects, missing/empty states | Table queries and mutation/business logic |
| `src/components` | Rendering, input, dialogs, and browser state | Supabase table queries and database contracts |
| `src/actions` | UI mutation input validation, feature calls, safe results, refresh/invalidation | Table queries and core business rules |
| `src/app/api` Route Handlers | Actual HTTP input, feature calls, status/header/JSON mapping | Duplicated feature logic |
| `src/lib` feature modules | Request-scoped client, authentication, authorization, queries, business rules, result mapping | UI state or transport-specific response contracts |
| Supabase client modules | Server/browser/Proxy client creation and session infrastructure | Feature-specific queries |
| `src/types` | Neutral application contracts and generated database types | Runtime server/client dependencies |
| `src/utils` | Pure deterministic transformations over neutral inputs | React, Next.js, Supabase, browser APIs, environment reads, logging, or side effects |
| Postgres | Persistence, grants, RLS, and integrity constraints | UI validation and user feedback |

Server Pages and Server Actions call `lib/<feature>.ts` directly. Add a Route Handler only for an actual browser, webhook, external, or other HTTP caller; server code must not fetch the app's own API. Server Actions are for mutations, not general-purpose reads. Reserve genuinely long-running work for an appropriate background mechanism.

Keep existing flat feature modules, components, utilities, and colocated tests while they remain navigable. Do not add `services`, `repositories`, generic `helpers`, or `db-context.ts` layers without a concrete need. External integrations, when required, belong behind server-owned feature/integration functions with credentials kept server-side.

Current boundary examples to consult, rather than copy into docs:

- [Incident page](../src/app/(protected)/incidentes/page.tsx), [Actions](../src/actions/incidents.ts), and [feature module](../src/lib/incidents.ts).
- [Group-students HTTP handler](../src/app/api/groups/[groupId]/students/route.ts) and [student feature module](../src/lib/students.ts).
- [ActionResult](../src/types/actions.ts), [application errors](../src/lib/application-error.ts), and [error mapping](../src/actions/application-error-result.ts).

## UI and state

Use function components and Server Components by default. Add `"use client"` only for state, events, browser APIs, or other browser-owned behavior. Keep each component responsible for a distinct interaction or presentation concern.

Views coordinate shared filters and dialog selection; lists render rows and invoke callbacks; form/delete dialogs own their interaction. Mount one active dialog rather than one per row. Keep CSV serialization and filtering in domain utilities; Blob creation, downloads, and object-URL cleanup stay in the browser component.

Use React state first. Consider shared client-state tools only for state spanning distant branches/routes, and client data-cache libraries only for substantial deferred/refetching/optimistic behavior. Do not add them for simple forms, local filters, or modal visibility.

For deferred data, include small common data in the initial payload; use URL state when refresh, Back/Forward, or sharing matters; use a Route Handler for temporary browser-driven reads. Extract hooks for cohesive lifecycle logic. Keep material utilities independently testable beside their implementation.

## Identity and authorization

- Create a typed server Supabase client inside request-bound code. Reuse it within one feature operation and its private helpers; never share an initialized server client across requests/users or compose client-creating public operations unnecessarily.
- Normal app flows use the public key plus the authenticated session. Restrict service-role credentials to explicitly privileged administrative or test-fixture work.
- The browser client is only for genuinely browser-owned Supabase capabilities, such as Auth listeners, Realtime, or direct Storage transfers. It is not the ordinary table data-access layer.
- `src/proxy.ts` delegates verification/cookie refresh to `src/lib/supabase-proxy.ts`. Preserve refreshed request/response cookies and headers. Proxy performs basic session gating; it must not query profiles/roles or own role authorization.
- Protected layouts guard rendering/navigation. They may persist during client navigation, so every operation must still authorize its actor through the feature boundary.
- Derive role, creator identity, and ownership from verified server identity and database data. Never trust submitted `role`, `isAdmin`, `teacherId`, `createdBy`, or UI permission flags.
- `src/lib/auth.ts` owns identity and permission guards; `src/lib/users.ts` owns user-management behavior. Follow the [product permission matrix](project-overview.md#roles-and-permissions).
- RLS and grants remain mandatory even when normal mutations use Actions. A caller can bypass the UI and reach the public Supabase endpoint.

## Validation and types

Validate untrusted request shape with boundary-local Zod schemas. Validate business relationships and permissions in feature modules; enforce final integrity in Postgres. Client validation improves feedback and never replaces server validation.

Keep schemas local unless reuse is real. A schema shared by boundaries or client/server belongs in a neutral module; infer types where useful. Feature modules must not import input types from `"use server"` Action files.

Migrations define the database; `src/types/supabase.ts` is generated and must not be edited manually. Use generated row/insert/update helpers within server modules and `QueryData` for joined query inference. Map rows into serializable application contracts before passing them to components or HTTP callers. Do not use raw database insert types as public mutation inputs when they contain server-controlled fields.

## Errors and feedback

Feature modules detect query failures, map expected business failures to known application errors, and log/rethrow unexpected failures. Never expose raw provider messages to users.

Actions return field errors, safe Spanish application errors, or the success contract defined by the real operation. CRUD Actions use the shared mapper to log unexpected mutation failures and return one non-sensitive Spanish fallback so the existing dialog can remain open with feedback. Other unexpected failures should reach the safe `src/app/error.tsx` framework boundary after server-side logging; that boundary handles uncaught page read/render failures and offers retry feedback without rendering exception details.

Route Handlers map failures to HTTP semantics: 400 invalid input, 401 unauthenticated, 403 forbidden, 404 missing, 409 conflict, and 500 unexpected failure. Session infrastructure must preserve the intended HTTP contract. Pages handle redirects, missing records, empty data, and unexpected errors at the appropriate boundary.

Keep field errors beside their inputs. Use the existing toast for transient operation feedback where appropriate, without duplicating a redirect or persistent form error. Preserve accessible labels, focus, keyboard behavior, and destructive confirmations.

## Cache and refresh

After a successful mutation, invalidate only affected paths/tags when those reads are cached. Refresh the current dynamic view when it needs new server data. Server Action `refresh()` and client `router.refresh()` rerender server data but do not replace server-cache invalidation.

Do not automatically call `router.refresh()` after an Action already supplies the refreshed payload. A direct browser write does not automatically update server-rendered data. Use React `cache()` only for request/render deduplication where appropriate, never as a substitute for safe persistent caching. User-specific data must not be globally cached across users.

## Database changes

Represent schema and required reference-data changes with migrations. Never make untracked hosted schema changes or rewrite an applied migration. Follow [database development and release commands](../README.md#database-development) and regenerate types after schema changes.

Use foreign keys, uniqueness, check constraints, nullability, and appropriate enums where they enforce the model. Use SQL functions/RPCs for real atomic multi-table work, database authorization helpers, or costly aggregation; do not add them merely to avoid a clear feature function.

## Testing

Vitest is installed. Test material behavior rather than snapshots of implementation details: validation, result/error mapping, permission and ownership rules, feature mapping, filters, CSV, dates, and aggregates. Focus unit tests on server boundaries and utilities; do not add component tests unless requested.

Run local integration tests when changing migrations, relationships, RLS/grants, Auth, roles/authorization, table access, integration fixtures/cleanup, or Supabase/Vitest versions. Assertions must use user-scoped clients; the service role is for setup/cleanup only. Keep the local URL guard and reliable fixture cleanup. Do not use hosted databases for integration tests.

For every implementation, run the README's [required checks](../README.md#checks): lint, typecheck, and build, plus relevant unit/integration tests. UI changes also require browser verification for affected roles and viewports. Pure documentation changes need link/content/diff checks and the required repository checks, without database resets or integration runs. Passing TypeScript alone does not prove behavior.

## Documentation references

For library/framework/SDK/API/CLI/cloud-service questions, resolve the library with Context7 and query its current documentation, even for familiar tools. Use an exact supplied library ID directly; prefer version-matched official sources. This lookup is not required for pure code review, business-logic debugging, refactoring, or general programming concepts. Examples in project docs must either match real public contracts or be clearly conceptual; link source instead of maintaining copied implementations.

- [Next.js server/client boundaries](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Next.js backend-for-frontend boundaries](https://nextjs.org/docs/app/guides/backend-for-frontend)
- [Next.js revalidation](https://nextjs.org/docs/app/api-reference/functions/revalidatePath)
- [Supabase server-side clients](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
