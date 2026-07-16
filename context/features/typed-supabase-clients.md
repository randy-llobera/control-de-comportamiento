# Feature: Typed Supabase Clients

## Status

Planned

## Goal

Wire the generated `Database` type into the browser and server Supabase clients so database queries receive schema-aware TypeScript checking and autocomplete.

## Why

`src/types/supabase.ts` is regenerated from the local database after a migration reset, but the current Supabase clients are untyped. As a result, `.from()`, `.select()`, and mutation calls do not fully validate table names, columns, relationships, or insert/update payloads at compile time.

## Scope

- Update `src/lib/supabase.ts` to create a browser client typed with `Database`.
- Update `src/lib/supabase-server.ts` to create a server client typed with `Database`.
- Resolve TypeScript errors exposed by the stricter client types without changing database behavior.
- Keep generated types sourced from the local schema through `npm run db:reset:local`.

## Out Of Scope

- Creating repository or DAL abstractions.
- Changing migrations, RLS policies, or runtime query behavior.
- Adding a new ORM.

## Implementation Steps

1. Import `Database` from `src/types/supabase.ts` in both client modules.
2. Pass `Database` to `createClient` and `createServerClient` using the Supabase client generic.
3. Run `npm run typecheck` and correct only query types made invalid by the generated schema.
4. Run `npm run lint` and `npm run build`.

## Risks

- Existing queries may rely on columns, joins, or payload shapes that do not match the generated schema.
- Generated types must remain current after every schema migration.

## Done Checklist

- [ ] Browser Supabase client uses `Database`.
- [ ] Server Supabase client uses `Database`.
- [ ] Invalid table names and mutation payloads fail TypeScript checks.
- [ ] `npm run lint` passes.
- [ ] `npm run typecheck` passes.
- [ ] `npm run build` passes.
