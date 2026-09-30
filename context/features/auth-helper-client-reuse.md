# Feature: Auth Helper Client Reuse

## Status

Complete

## Historical outcome

Separated the explicit-client identity loader from the cached no-argument helper used by Server Components and layouts.

Reused one request-scoped client inside each operation. Later feature modules inherited this responsibility; no user identity or client is cached globally.

## Evidence and maintained implementation

[Recorded completion](../current-feature.md#history); source links below.

- [src/lib/auth.ts](../../src/lib/auth.ts)
- [src/lib/supabase-server.ts](../../src/lib/supabase-server.ts)
