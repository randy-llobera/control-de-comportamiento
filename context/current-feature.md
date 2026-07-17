# Current Feature: Server-Side Authentication and Authorization

## Status

In Progress

## Goals

- Use typed Supabase SSR browser and request-scoped server clients.
- Refresh Supabase sessions and redirect public/protected routes in `src/proxy.ts`.
- Load the authenticated user and role on the server, then protect routes by role.
- Remove browser-side authentication guards and `src/components/Layout.tsx`.
- Require server-derived identity and role for every migrated mutation while retaining RLS as the final enforcement layer.

## Notes

Source: `context/features/server-auth-authorization.md`.

- Protected routes: all authenticated users can access `/incidentes` and `/estudiantes`; coordinators and admins can access `/grupos`, `/categorias`, and `/dashboard`; only admins can access `/usuarios`.
- Missing sessions or user profiles redirect to `/auth`; authenticated users visiting `/` or `/auth` redirect to `/incidentes`.
- Keep URLs, navigation labels, role definitions, database schema, and RLS policies unchanged.
- Do not migrate all page fetching/forms to Server Components or Server Actions. Migrate mutation authorization incrementally.
- Key risk: SSR-compatible auth cookies are required for `proxy.ts` and server layouts to see new sessions.
- User Context7 to access the most up to date documentation.

## History

<!-- Keep this updated. Earliest to latest -->

### Typed Supabase Clients

- Typed browser and server Supabase clients with the generated `Database` schema.
- `npm run typecheck` and `npm run build` passed; lint remains blocked by pre-existing errors outside this feature's scope.
