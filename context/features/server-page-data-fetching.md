# Feature: Server-Rendered Protected Page Data

## Status

Planned

## Goal

Render the initial data for every protected route on the server, then use small Client Components only for interaction that requires browser state or APIs.

## Why

Protected layouts now authenticate and authorize requests on the server, but every protected page still starts as a Client Component, fetches its data in `useEffect`, and renders a loading state in the browser.

This feature moves initial reads to the request-scoped Supabase server client. Users receive the populated page from the server, while forms, dialogs, filters, confirmations, CSV downloads, and other browser-only behavior remain client-side.

## Dependency

Complete Server-Side Authentication and Authorization and Server Mutation Cache Invalidation first. This feature depends on authorized Server Actions and their route invalidation behavior so server-rendered reads stay current after mutations.

## Scope

- Convert these protected route pages to Server Components for their initial data reads:
  - `/dashboard`
  - `/usuarios`
  - `/categorias`
  - `/grupos`
  - `/estudiantes`
  - `/incidentes`
- Fetch initial route data through the request-scoped server Supabase client, preserving the authenticated session and RLS enforcement.
- Extract only the interactive parts of each route into Client Components with serializable initial-data props.
- Keep client-side state for dialogs, controlled forms, filters, delete confirmations, CSV generation, and client navigation.
- Refresh server-rendered data after a successful client-triggered mutation when the current view needs it.
- Remove initial protected-page `useEffect` data loading, page-level `loading` state, and direct browser Supabase reads.
- Use Context7 to gather the most up to date documentation.

## Route Boundaries

| Route          | Server responsibility                              | Client responsibility                                     |
| -------------- | -------------------------------------------------- | --------------------------------------------------------- |
| `/dashboard`   | Fetch incidents and calculate statistics.          | None unless a later interactive control is added.         |
| `/usuarios`    | Fetch users and roles.                             | Role selector change handling.                            |
| `/categorias`  | Fetch categories.                                  | Create/edit dialog, form state, delete confirmation.      |
| `/grupos`      | Fetch groups.                                      | Create/edit dialog, form state, delete confirmation.      |
| `/estudiantes` | Fetch students and groups.                         | Create/edit dialog, form state, delete confirmation.      |
| `/incidentes`  | Fetch incidents, students, groups, and categories. | Create form, filters, CSV generation, and local UI state. |

## Out Of Scope

- Changing authentication, route roles, database schema, or RLS policies.
- Adding an ORM, repository layer, global client cache, or state-management library.
- Replacing the existing Server Actions or redesigning mutation permissions.
- Adding cache invalidation to Server Actions; that belongs to the Server Mutation Cache Invalidation feature.
- Adding realtime subscriptions or optimistic updates.
- Converting the auth page or `Navigation` to Server Components.

## Implementation Steps

1. Confirm the authentication feature is complete and server layouts authorize every protected route.
2. Convert `/dashboard` first: fetch its incidents in the Server Component and remove its client directive, effect, and loading state.
3. Convert `/usuarios`: keep the page server-rendered and move only role-selection behavior into a Client Component.
4. Convert categories and groups using the same server-page/client-manager pattern.
5. Convert students, passing the initial students and groups to its interactive manager.
6. Convert incidents last, passing its four initial datasets to a client manager for forms, filters, and CSV export.
7. Remove direct `supabase` imports from protected-page client components. Browser Supabase remains only where it is still required, such as client authentication and sign-out.
8. Run type checking and production build after each route conversion.

## Risks

- Props passed from server pages to Client Components must be serializable; do not pass Supabase clients, functions, or class instances.
- A large initial incidents payload may eventually need server-side pagination or filtering. Preserve current behavior in this feature and measure before adding pagination.
- Client-side filters operate only on the initial dataset. If data volume grows, move filtering to server query parameters in a later feature.
- Avoid duplicating the same query in both the Server Component and its Client Component.

## Done Checklist

- [ ] Every protected route page performs its initial read on the server.
- [ ] `/dashboard` contains no Client Component boundary unless interaction is introduced.
- [ ] Client Components receive only serializable initial data and contain only browser-required behavior.
- [ ] Protected-page initial data loading no longer uses `useEffect` or direct browser Supabase queries.
- [ ] A mutation followed by refresh or navigation displays current data.
- [ ] Existing URLs, route authorization, UI behavior, and RLS enforcement remain unchanged.
- [ ] `npm run typecheck` and `npm run build` pass.
