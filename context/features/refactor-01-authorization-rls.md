# Feature: Authorization and RLS

## Status

Complete

## Historical outcome

Restricted student management and incident writes in Postgres before moving application access behind feature modules.

The later incident UI feature broadened authenticated profile reads to support author display. The final policy state is in the consolidated baseline; the initial user-profile matrix is not the current contract.

## Evidence and maintained implementation

[Recorded completion](../current-feature.md#history); source links below.

- [supabase/migrations/20260805135713_initial_schema.sql](../../supabase/migrations/20260805135713_initial_schema.sql)
- [supabase/rls.integration.test.ts](../../supabase/rls.integration.test.ts)
