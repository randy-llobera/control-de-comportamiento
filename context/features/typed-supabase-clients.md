# Feature: Typed Supabase Clients

## Status

Complete

## Historical outcome

Typed both Supabase clients with the generated Database contract so queries and writes receive schema-aware checking without changing runtime behavior.

Kept generated types sourced from migrations rather than introducing an ORM or manual database types.

## Evidence and maintained implementation

[Recorded completion](../current-feature.md#history); source links below.

- [src/lib/supabase-browser.ts](../../src/lib/supabase-browser.ts)
- [src/lib/supabase-server.ts](../../src/lib/supabase-server.ts)
- [src/types/supabase.ts](../../src/types/supabase.ts)
