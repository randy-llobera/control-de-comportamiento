# Coding Standards

## Core conventions

### TypeScript

- Keep strict mode enabled.
- Do not use `any`; use a precise type or `unknown` and narrow it.
- Prefer inference for obvious local values and explicit types for public contracts.
- Use interfaces for object contracts when extension is useful. Use type aliases for unions, mapped types, and inferred types.
- Prefer arrow functions for callbacks and local functions. Use named function declarations when required by framework conventions or when they improve readability.

### React and Next.js

- Use function components only.
- Use Server Components by default.
- Add `"use client"` only for client state, event handlers, browser APIs, or other browser-owned behavior.
- Keep components focused on one responsibility.
- Extract a custom hook when stateful logic is reused or is complex enough to test or understand independently.
- Use Server Actions for UI-initiated mutations.
- Use Route Handlers when an actual HTTP caller needs an endpoint, such as a webhook, OAuth callback, browser deferred read, file response, or external client.
- Call feature read functions directly from Server Components. Do not call the app's own Route Handlers from server code.
- Use dynamic route segments only when the URL contains a runtime value, such as an item ID.
- Treat genuinely long-running work as a background-job concern; a Route Handler may be subject to hosting execution limits.

### Tailwind CSS v4

- Use Tailwind CSS v4's CSS-first configuration.
- Define project theme tokens with `@theme` in the CSS imported by the root layout.
- Use CSS custom properties for shared design tokens.
- Do not add a JavaScript Tailwind configuration unless a dependency or migration requires the supported `@config` compatibility path.

```css
@import 'tailwindcss';

@theme {
  --color-primary: oklch(50% 0.2 250);
}
```

### Naming and styling

- Components, types, and interfaces: PascalCase.
- Component files: match the exported component name.
- Other files: kebab-case.
- Functions and variables: camelCase.
- Constants that are truly immutable configuration values: SCREAMING_SNAKE_CASE.
- Use Tailwind CSS for normal styling and shadcn/ui where it fits the interface. Add shadcn components through its CLI.
- Avoid inline styles when a static Tailwind class or CSS rule is sufficient. Inline styles or CSS variables are acceptable for values calculated at runtime.

### Database and code quality

- Represent every schema change with a committed migration.
- Do not make untracked production schema changes through the dashboard or ad hoc SQL.
- Apply migration files through the project's approved Supabase CLI workflow and regenerate `src/types/supabase.ts` after schema changes.
- Do not keep commented-out code, unused imports, or unused variables.
- Prefer cohesive functions. Split a function when it has multiple responsibilities, not to satisfy an arbitrary line limit.

## Architecture Contract

The core principle is:

```text
UI renders and captures intent.
Next.js boundaries receive requests.
Feature modules own application and database behavior.
Supabase carries the authenticated user's JWT to Postgres.
Postgres constraints and RLS provide final data and authorization enforcement.
```

### 1. Layer model

| Layer                     | Responsibility                                                                                                   | Must not do                                        |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| UI components             | Render data, collect input, manage browser state                                                                 | Query tables directly                              |
| Server Pages              | Load initial data and compose the route                                                                          | Contain Supabase queries                           |
| Server Actions            | Receive UI mutations, validate input, call feature modules, refresh or invalidate affected server data           | Contain database queries or core business rules    |
| Route Handlers            | Expose HTTP endpoints for deferred reads, APIs, webhooks, and integrations. Validate input, call feature modules | Duplicate feature/database logic                   |
| Feature modules           | Authentication, authorization, business rules, database reads/writes, result mapping                             | Contain React/UI behavior                          |
| Supabase client factories | Create correctly scoped browser, server, or Proxy clients                                                        | Contain feature-specific queries                   |
| Supabase/Postgres         | Persist data, enforce constraints and RLS                                                                        | Replace application-level validation and UX errors |

The runtime flow is:

```text
Browser UI
  |
  +-> Server Page ----------+
  |                         |
  +-> Server Action --------+-> lib/<feature>.ts -> Supabase API -> Postgres + RLS
  |                         |
  +-> Route Handler --------+
```

The browser Supabase client is an exception used only for browser-owned Supabase capabilities such as Realtime, Presence, Auth listeners, or direct Storage uploads.

---

### 2. Folder structure

Keep framework boundaries and feature logic in their established locations:

```text
src/
  app/
    layout.tsx
    auth/page.tsx
    (protected)/
      layout.tsx
      incidentes/page.tsx
      estudiantes/page.tsx
      (coordinator)/
        layout.tsx
        grupos/page.tsx
        categorias/page.tsx
        dashboard/page.tsx
      (admin)/
        layout.tsx
        usuarios/page.tsx
    api/
      <feature>/route.ts
      <feature>/[id]/route.ts
      webhooks/<provider>/route.ts
  components/
    ComponentName.tsx
  actions/
    <feature>.ts
  lib/
    supabase-server.ts
    supabase-browser.ts
    supabase-proxy.ts
    <feature>.ts
    <pure-utility>.ts
    integrations/<provider>.ts
  types/
    supabase.ts
    <feature>.ts
    actions.ts
  proxy.ts
```

Components remain flat under `src/components`. Breaking down components into feature folders should only be introduced if that directory becomes difficult to navigate.

All code, component filenames, types, and functions use English. User-facing labels, messages, content, and public URL segments remain Spanish.

---

### 3. Server Pages

Every route page is a Server Component by default.

A page is responsible for:

- Receiving `params` and `searchParams`.
- Validating route or search parameters when needed.
- Calling feature-level read functions.
- Composing Server and Client Components.
- Handling `notFound()`, redirects, or route-level failures.

A page must not:

- Call `supabase.from(...)`.
- Create a Supabase client directly.
- Contain business rules.
- Contain mutation logic.
- Move the entire page into one large Client Component.

Example:

```ts
import { IncidentsView } from "@/components/IncidentsView";
import { getIncidentPageData } from "@/lib/incidents";

export default async function IncidentsPage() {
  const data = await getIncidentPageData();

  return <IncidentsView initialData={data} />;
}
```

The page knows that it needs incident page data. It does not know which tables, joins, or Supabase client are involved.

This follows Next.js guidance to load initial data in Server Components and pass only interactive portions into Client Components. [Next.js Server Component guidance](https://nextjs.org/docs/app/getting-started/server-and-client-components)

---

### 4. UI components

Client Components are used only when browser behavior is required:

- React state.
- Controlled form state or immediate client validation.
- Interactive modals.
- Controlled dropdowns.
- Local filters.
- Event handlers.
- Browser APIs.
- `router.push()` and `router.refresh()`.
- Realtime subscriptions.
- Direct file uploads.

A component should have one visible responsibility.

For incidents:

```text
IncidentsView
  -> coordinates client-side incident screen state and renders incident rows/cards

IncidentFilters
  -> renders and updates filters

CreateIncidentForm
  -> collects incident form input
```

`IncidentsView` may coordinate its children, but it must not contain:

- Supabase queries.
- CSV formatting.
- All form markup.
- Every mutation implementation.

`IncidentsView` owns shared filter state and derives the filtered collection. `IncidentFilters` renders and updates the controls. Extract the filtering algorithm into a pure utility only if it becomes substantial or reusable.

Reusability does not require a component to appear on several pages. A component is worth extracting when it has a clear, independent responsibility.

#### Client state

Use ordinary React state first:

```text
useState
useReducer
useTransition
```

Use Zustand only when state genuinely needs to be shared across distant component branches or routes. It should not be introduced for modal visibility, form values, or simple filters.

#### Server state

Initial server state comes through Server Component props.

Do not introduce TanStack Query unless the app eventually develops substantial client-side data requirements such as:

- Frequent deferred reads.
- Background refetching.
- Optimistic updates across several screens.
- Client-side pagination with caching.
- Complex request deduplication.

---

### 5. Feature modules: `lib/<feature>.ts`

The feature modules form the application and data-access layer.

Do not add separate `services`, `repositories`, or `helpers` layers while these modules remain cohesive. Split a feature module only when its responsibilities or size create a concrete maintenance problem.

Examples:

```text
lib/incidents.ts
lib/students.ts
lib/groups.ts
lib/categories.ts
lib/users.ts
lib/auth.ts
```

They own:

- Creating a request-scoped server client.
- Authentication checks needed for the operation.
- Role and business authorization.
- Database queries.
- Database mutations.
- Joined-query handling.
- Mapping database results into application contracts.
- Converting low-level database failures into known application errors.

Examples from `lib/incidents.ts`:

```ts
getIncidentPageData();
getIncidentDetails(incidentId);
createIncident(input);
updateIncident(input);
deleteIncident(incidentId);
```

Examples from `lib/students.ts`:

```ts
getStudentList();
getStudentDetails(studentId);
createStudent(input);
updateStudent(input);
deleteStudent(studentId);
```

No page, action, component, or Route Handler should contain `.from("incidents")`, `.from("students")`, or other application-table queries.

#### No `db-context.ts`

A separate `db-context.ts` abstraction is not currently needed.

Each top-level feature operation creates the request-scoped client it needs:

```ts
export async function createIncident(input: CreateIncidentInput) {
  const supabase = await createClient();

  // Reuse this client throughout this operation.
}
```

Within a feature operation, the same client should be passed to private helpers when necessary:

```ts
const actor = await loadCurrentActor(supabase);
const student = await loadStudent(supabase, input.studentId);
```

This avoids creating multiple clients during one operation without exposing the Supabase client to pages or actions. If a public operation composes other feature behavior, use private helpers that accept the existing client rather than calling another client-creating entry point.

---

### 6. Server Actions

Server Actions are the browser-to-server mutation boundary.

They are not the DAL.

A Server Action is responsible for:

1. Receiving untrusted UI input.
2. Parsing it with the Zod schema.
3. Calling the feature function.
4. Mapping failures into UI-friendly results.
5. Refreshing or invalidating affected server data when needed.
6. Returning the result to the component.

Example:

```ts
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createIncident } from '@/lib/incidents';
import type { ActionResult } from '@/types/actions';
import type { IncidentListItem } from '@/types/incidents';

const createIncidentSchema = z.object({
  studentId: z.uuid(),
  categoryId: z.uuid(),
  severity: z.enum(['low', 'medium', 'high']),
  description: z.string().trim().min(1).max(1_000),
  date: z.iso.date(),
});

export async function createIncidentAction(
  input: unknown,
): Promise<ActionResult<IncidentListItem>> {
  const parsed = createIncidentSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: 'Revisa los campos indicados.',
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const incident = await createIncident(parsed.data);

  revalidatePath('/incidentes');

  return { success: true, data: incident };
}
```

The Action is the selected internal adapter for UI mutations because a Client Component cannot call a server-side `lib/incidents.ts` function directly. Use a Route Handler instead when an actual HTTP client needs the mutation endpoint.

The Action is an internal transport adapter, not an extra database abstraction.

#### Action result contract

Use a consistent result shape:

```ts
export type ActionResult<T = undefined> =
  | {
      success: true;
      data: T;
      error?: never;
      fieldErrors?: never;
    }
  | {
      success: false;
      data?: never;
      error: string;
      fieldErrors?: Record<string, string[] | undefined>;
    };
```

User-facing errors are Spanish and safe to display.

Detailed Supabase or internal errors are logged on the server and never returned directly to the browser.

Feature functions return application data and throw known application errors for expected failures. The Action catches only errors it can map into `ActionResult`; feature modules do not return UI-specific `ActionResult` values. The example above shows the validation and success paths only.

---

### 7. Route Handlers

Route Handlers are real HTTP endpoints in the App Router.

They live under `src/app` and use the reserved filename `route.ts`.

Examples:

```text
src/app/api/students/[studentId]/route.ts
  -> GET /api/students/:studentId

src/app/api/incidents/route.ts
  -> GET /api/incidents
  -> POST /api/incidents
```

Use Route Handlers for:

- Deferred Client Component reads.
- Public or internal HTTP APIs.
- Mobile or CLI clients.
- Webhooks.
- OAuth callbacks.
- External integrations that call the app.
- File responses.
- Operations requiring specific status codes or headers.

A Route Handler is responsible for:

1. Reading JSON, route params, search params, or headers.
2. Validating its transport input.
3. Calling a feature function.
4. Mapping results to HTTP status codes and JSON.
5. Never exposing internal Supabase errors.

Example:

```ts
import { z } from 'zod';
import { getStudentDetails } from '@/lib/students';

const paramsSchema = z.object({
  studentId: z.uuid(),
});

export async function GET(
  _request: Request,
  { params }: RouteContext<'/api/students/[studentId]'>,
) {
  const parsed = paramsSchema.safeParse(await params);

  if (!parsed.success) {
    return Response.json({ error: 'Identificador inválido.' }, { status: 400 });
  }

  const student = await getStudentDetails(parsed.data.studentId);

  return Response.json(student);
}
```

A Route Handler does not contain the student query. It delegates to `lib/students.ts`.

The example shows input validation and the success response. The real Handler must also map known authentication, authorization, missing-resource, and conflict errors to the appropriate HTTP status.

#### Do not use Route Handlers from Server Pages

This is unnecessary:

```text
Server Page -> fetch("/api/incidents") -> Route Handler -> lib/incidents.ts
```

It creates an extra HTTP request inside the same application.

Use:

```text
Server Page -> getIncidentPageData()
```

Route Handlers exist when an actual HTTP caller needs an endpoint.

---

### 8. Deferred modal data

Modal data should not automatically be loaded for every record during the initial render.

Choose between three patterns.

#### Small, commonly used data

Include it in the initial server payload when:

- The data is small.
- Most users will open the modal.
- The query does not substantially increase page cost.

#### Navigable modal state

Use a URL search parameter when the modal should support refresh, Back, Forward, bookmarking, or sharing:

```text
/incidentes?student=student-id
```

Flow:

```text
User selects student
  -> router.push() changes search params
  -> Server Page renders again
  -> page validates student ID
  -> getStudentDetails(studentId)
  -> modal receives details
```

#### Temporary modal state

Use a Route Handler when the modal is temporary and the data is rarely needed:

```text
Client modal
  -> fetch("/api/students/:id")
  -> Route Handler
  -> getStudentDetails(id)
  -> JSON
```

Do not use Server Actions for general-purpose reads. Next.js primarily intends them for mutations, and Action calls used as reads are queued.

Do not use the browser Supabase client for these reads if the goal is centralized access through `lib/students.ts`.

---

### 9. Validation contract

Validation exists at three levels.

#### Structural validation

Zod validates the shape of untrusted input:

```text
Is this a UUID?
Is this field required?
Is the date correctly formatted?
Is the description within its length limit?
```

Keep a Zod schema at the request boundary that owns it. Extract it only when the same validation contract needs to be reused.

```ts
const createIncidentSchema = z.object({
  studentId: z.uuid(),
  categoryId: z.uuid(),
  date: z.iso.date(),
  severity: z.enum(['low', 'medium', 'high']),
  description: z.string().trim().min(1).max(1_000),
});
```

Zod provides parsing and inferred input/output types but does not prescribe application layers. [Zod type inference guidance](https://zod.dev/basics)

#### Business validation

Feature modules validate rules that require application or database context:

```text
Does the student exist?
Does the category exist?
Does the student belong to this school/group?
Can this role create or edit incidents?
Is this status transition allowed?
```

These rules belong in `lib/incidents.ts`, not Zod schemas.

#### Database validation

Postgres enforces final data integrity:

- Foreign keys.
- `NOT NULL`.
- Unique constraints.
- Check constraints.
- Database enums.
- RLS policies.

A complete write passes through:

```text
Zod structural validation
  -> application authorization/business validation
  -> database constraints and RLS
```

#### Client validation

Client-side validation is a UX enhancement only to show immediate feedback, but the server must always validate again because browser validation can be bypassed.

---

### 10. Supabase server client

supabase-server.ts is a factory, not a singleton.

```ts
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(/* request cookies */);
}
```

Rules:

- Create the server client inside request-bound server code.
- Never export an initialized module-level server client.
- Never share a server client across users or requests.
- Use the generated `Database` type as its generic.
- Use the public/publishable key; the SSR client reads the current user's Auth cookies and sends the JWT.
- Never use the secret/service-role key in ordinary application flows.

The client is request-scoped because it reads the current request's Auth cookies and represents that user to Supabase and RLS. Never retain it across requests. [Supabase server-client guidance](https://supabase.com/docs/guides/auth/server-side/creating-a-client)

---

### 11. Supabase browser client

The browser client is a browser singleton. It is optional in the target architecture.

It must not become the default application-table DAL.

Use it only when the browser itself needs a persistent or direct Supabase capability:

- Realtime Postgres subscriptions.
- Presence.
- Broadcast.
- `onAuthStateChange`.
- Direct browser-to-Storage upload/download.
- Other explicitly client-owned Supabase behavior.

Do not use it for:

- Initial page reads.
- Standard CRUD mutations.
- Deferred modal reads that should pass through the application data layer.
- Role management.
- Privileged workflows.

---

### 12. Proxy

Proxy is infrastructure, not the user/profile DAL.

Its responsibilities are:

- Read Auth cookies from `NextRequest`.
- Refresh the Supabase session when needed and verify identity with `getClaims()` or `getUser()`.
- Write refreshed cookies to `NextResponse`.
- Apply basic authenticated/unauthenticated route redirects.

The target shape is:

```text
src/proxy.ts
  -> calls updateSession(request)

src/lib/supabase-proxy.ts
  -> creates the Proxy-specific Supabase client
  -> manages request and response cookies
  -> verifies session claims
  -> returns the response
```

Proxy must not:

- Load the user profile.
- Query the `users` or `roles` tables.
- Perform role authorization.
- Become the only protection for secured operations.

Role and profile queries on every matched request would add unnecessary database traffic.

The current Supabase SSR pattern requires Proxy-specific cookie `getAll` and `setAll` handling, which is why it cannot simply use the normal Server Component client factory. [Supabase Proxy cookie guidance](https://github.com/supabase/ssr/blob/main/src/types.ts)

---

### 13. Authentication and authorization

Authentication and authorization are separate.

#### Authentication

Authentication answers:

```text
Who is making this request?
Is their JWT valid?
```

Supabase Auth issues and validates the session.

#### Authorization

Authorization answers:

```text
May this authenticated user perform this operation?
```

The app uses:

- User role/profile data.
- Protected role layouts as navigation and rendering guards.
- Feature-level authorization.
- RLS.

#### Enforcement points

```text
Proxy
  -> basic session gate and cookie refresh

Protected layout
  -> redirect unauthenticated users during that layout render

Coordinator layout
  -> hide coordinator routes from other roles during that layout render

Admin layout
  -> hide admin routes from other roles during that layout render

Server Action
  -> authorize the specific mutation

Route Handler
  -> authorize the specific API request

RLS
  -> final database enforcement
```

Layouts are not authoritative security boundaries. Next.js can preserve layouts during client navigation, so a layout may not rerun for every operation. Feature functions, Server Actions, and Route Handlers must perform the authorization required by their operation even when a parent layout already checked the role.

#### Trusted identity

Never accept these from the browser as trusted values:

```text
userId
teacherId
role
isAdmin
createdBy
canEdit
```

Derive them on the server from the verified session and database profile.

For example, `teacher_id` for a new incident comes from the authenticated actor, not from form input.

#### Auth versus user data modules

Use:

```text
lib/auth.ts
  -> verify current identity
  -> get current actor and role
  -> authorization guards

lib/users.ts
  -> user profile reads
  -> user management
  -> role assignment workflows
```

A user profile page calls `lib/users.ts`. Proxy does not.

---

### 14. Types and contracts

#### Source-of-truth chain

```text
Postgres schema and migrations
  -> actual source of truth

src/types/supabase.ts
  -> generated TypeScript database contract

src/types/<feature>.ts
  -> application/UI contracts
```

#### Generated Supabase types

`src/types/supabase.ts` is generated and never manually edited.

It contains:

```ts
type Student = Tables<'students'>;
type StudentInsert = TablesInsert<'students'>;
type StudentUpdate = TablesUpdate<'students'>;
```

The generated file also exports the `Database` type used to type Supabase clients.

Use these inside server feature modules when communicating with Supabase.

For complex joined queries, use Supabase `QueryData<typeof query>` to infer the actual returned shape rather than manually recreating joins. [Supabase joined-query typing](https://supabase.com/docs/reference/javascript/typescript-support)

#### Feature contracts

Components should not import generated Supabase types directly.

Contracts passed from Server Components to Client Components or returned as JSON must be serializable. Map database dates, decimals, or other non-JSON values into an explicit transport-friendly representation.

Example:

```ts
// types/students.ts
export interface StudentListItem {
  id: string;
  name: string;
  groupName: string;
}

export interface StudentDetails {
  id: string;
  name: string;
  group: {
    id: string;
    name: string;
  };
  incidentCount: number;
}
```

`lib/students.ts` maps generated/query-inferred rows into these contracts.

```text
Supabase row/query result
  -> feature module mapping
  -> StudentListItem
  -> component prop
```

Components use type-only imports:

```ts
import type { StudentListItem } from '@/types/students';
```

These imports disappear during compilation and do not bundle Supabase or server code.

#### Input types

Do not use `TablesInsert<"incidents">` as the form input type. Database insert types may contain fields the browser must not control.

Define public feature input contracts in the neutral feature type module:

```ts
// types/incidents.ts
export interface CreateIncidentInput {
  studentId: string;
  categoryId: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  date: string;
}
```

A boundary-local Zod schema validates unknown input before passing its parsed output to the feature function. TypeScript must verify that the parsed output is assignable to the feature input contract.

If the same runtime validation contract is needed by multiple server boundaries or by the client and server, extract the Zod schema to a neutral shared module and infer the input type from it. Do not import a type from a `"use server"` Action module into `lib`.

The feature module maps the validated input into a Supabase insert:

```text
CreateIncidentInput
  + authenticated teacherId
  + server-controlled values
  -> TablesInsert<"incidents">
```

---

### 15. Cache and refresh contract

Initial authenticated data is rendered on the server.

After a successful mutation, refresh or invalidate only what the operation changed:

```text
Server Action
  -> mutate through feature module
  -> invalidate cached data with revalidatePath(), revalidateTag(), or updateTag()
     when the affected read is cached
  -> otherwise call refresh() when the current dynamic page must be refreshed
  -> return success

Client Component
  -> call router.refresh() only when the Action did not already return a refreshed
     Server Component payload and the current screen still needs one
```

Use precise invalidation:

```ts
revalidatePath('/incidentes');
```

Do not invalidate unrelated routes.

`revalidatePath` invalidates cached data associated with a path. When called from a Server Action for the currently viewed path, Next.js can return an updated Server Component payload immediately. Do not automatically follow it with `router.refresh()`.

`refresh()` from `next/cache` refreshes the client router from inside a Server Action. `router.refresh()` does the equivalent from a Client Component. These refresh dynamic server data but do not replace cache invalidation for cached reads.

Do not assume a direct browser Supabase mutation automatically updates server-rendered data or Next.js caches.

Authenticated, user-specific data must never be globally cached in a way that can return one user's data to another.

React `cache()` may be used carefully to deduplicate repeated server reads within the rendering/request lifecycle, such as the current authenticated actor lookup. It is not a replacement for persistent application caching.

---

### 16. External APIs

When a Server Page, Server Action, or feature module needs an external service:

```text
Server code
  -> lib/integrations/provider.ts
  -> external API
```

Do not call the app's own Route Handler from server code.

Use a Route Handler when:

- The browser needs protected external data.
- An external provider calls the app through a webhook.
- A mobile or external client needs an API.
- Credentials must remain server-side.
- The response needs normalization, filtering, or rate limiting.

```text
Browser
  -> /api/external-data
  -> Route Handler
  -> lib/integrations/provider.ts
  -> external API
```

Secrets never use `NEXT_PUBLIC_` variables and never enter browser bundles.

---

### 17. Error handling

Each layer maps errors at its own boundary.

#### Feature modules

Feature modules:

- Detect Supabase failures.
- Convert expected failures into known application errors.
- Log and rethrow unexpected failures.
- Never expose raw database messages.

#### Server Actions

Actions return:

- Field errors for validation.
- General Spanish errors for expected failures.
- Success data when needed.

Catch errors only where the Action can map a known application failure. Let unexpected failures reach the framework error boundary after appropriate server-side logging; do not wrap every Action in a blanket `try/catch`.

#### Route Handlers

Route Handlers map outcomes to HTTP semantics:

```text
400 invalid input
401 unauthenticated
403 unauthorized
404 missing resource
409 conflict
500 unexpected server failure
```

#### Server Pages

Pages may:

- Redirect unauthenticated users.
- Call `notFound()` for missing resources.
- Let unexpected errors reach `error.tsx`.
- Render expected empty states.

Client Components do not decide whether a database error is safe to expose.

Show field errors next to their fields. Use a toast for non-field feedback only when it is the clearest presentation; it is not the default for every error.

---

### 18. Database design and RLS

All schema changes go through migrations.

The database enforces:

- Foreign keys.
- Unique constraints.
- Check constraints.
- Appropriate enums.
- `NOT NULL`.
- RLS.

RLS is mandatory even when every normal mutation uses a Server Action. The browser has access to the public Supabase endpoint and publishable key, so an authenticated user can attempt direct API requests outside the UI.

Server Actions provide application validation and authorization. RLS provides final database authorization.

Use SQL functions or RPCs when an operation genuinely requires:

- Atomic multi-table behavior.
- Transactional consistency not available through separate API calls.
- Database-side authorization helpers used by RLS.
- Expensive calculations better performed in Postgres.

Do not introduce stored procedures merely to avoid writing a clear feature function in `lib`.

---

### 19. Testing contract

Focus tests on boundaries and business rules.

#### Unit tests

Use Vitest when unit-test tooling is introduced. Add and configure it through a planned dependency change before requiring test commands in implementation work.

Test:

- Zod schemas.
- Pure CSV/filter functions.
- Action result/error mapping.
- Business-rule helpers.
- Feature result mapping.

#### Integration tests

Test:

- Feature functions against Supabase where practical.
- Role authorization.
- RLS policies.
- Foreign-key and constraint behavior.
- Route Handler status responses.

#### Verification

Every implementation should run:

```bash
npm run lint
npm run typecheck
npm run build
```

UI changes should also be verified in the browser.

No feature is considered working solely because TypeScript compiles.
