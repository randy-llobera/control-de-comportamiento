# Current Feature: Server Mutation Cache Invalidation

## Status

In Progress

## Goals

- Invalidate every server-rendered route affected by a successful Server Action.
- Keep route invalidation explicit and targeted for incidents, students, groups, categories, and user-role changes.
- Preserve existing mutation return shapes, authorization behavior, and current client-side data refreshes.
- Ensure failed mutations never invalidate routes.

## Notes

- Source spec: `context/features/server-mutation-cache-invalidation.md`.
- Dependencies are complete: server-side authentication and authorization, auth helper client reuse, and Server Action input validation.
- Server-Rendered Protected Page Data depends on this feature.
- Do not convert pages to Server Components, add client caching or optimistic updates, or change authorization, validation, RLS, schema, or URLs.

## History

<!-- Keep this updated. Earliest to latest -->

- 2026-07-17: Added Zod v4 Server Action validation, normalized mutation payloads, and Spanish field-level errors in forms.
- 2026-07-17: Reused one request-scoped Supabase server client per mutation while preserving cached server-component profile lookups.
- 2026-07-17: Added typed Supabase SSR browser/session clients, `proxy.ts` route gating, and cached server profile lookups. Moved authenticated pages into protected role route groups and migrated existing writes to server-authorized actions.
- 2026-07-16: Typed browser and server Supabase clients with the generated `Database` schema.
