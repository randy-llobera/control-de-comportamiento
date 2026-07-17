# Current Feature

## Status

Not Started

## Goals

<!-- Add goals here -->

## Notes

<!-- Add notes here -->

## History

<!-- Keep this updated. Earliest to latest -->

### Typed Supabase Clients

- Typed browser and server Supabase clients with the generated `Database` schema.
- `npm run typecheck` and `npm run build` passed; lint remains blocked by pre-existing errors outside this feature's scope.

### Server-Side Authentication and Authorization

- Added typed Supabase SSR browser/session clients, `proxy.ts` route gating, and cached server profile lookups.
- Moved authenticated pages into protected role route groups and migrated existing writes to server-authorized actions.
- `npm run lint`, `npm run typecheck`, and `npm run build` passed; browser tests covered signed-out, teacher, coordinator, and admin route behavior.
