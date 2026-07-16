# Current Feature: Typed Supabase Clients

## Status

In Progress

## Goals

- Type the browser and server Supabase clients with the generated `Database` schema.
- Resolve only TypeScript errors exposed by schema-aware Supabase queries.
- Keep generated types sourced from the local schema through `npm run db:reset:local`.
- Verify linting, type checking, and production build succeed.

## Notes

The generated `Database` type in `src/types/supabase.ts` is currently not wired into the Supabase clients, so queries and mutation payloads lack full schema checking and autocomplete.

Scope:

- Update `src/lib/supabase.ts` and `src/lib/supabase-server.ts`.
- Do not change migrations, RLS policies, runtime query behavior, or add repository/DAL abstractions or an ORM.

Risks:

- Existing queries may use columns, joins, or payload shapes that do not match generated schema types.
- Generated types must stay current after schema migrations.

## History

<!-- Keep this updated. Earliest to latest -->
