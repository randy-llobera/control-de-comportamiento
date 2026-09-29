# Feature: Server-Side Authentication and Authorization

## Status

Complete

## Historical outcome

Moved session and role checks out of client effects into Supabase SSR, Proxy, protected layouts, and server-authorized mutations.

Preserved the public route contract and RLS. Data-page extraction was delivered in the later feature-boundary records.

## Evidence and maintained implementation

[Recorded completion](../current-feature.md#history); source links below.

- [src/proxy.ts](../../src/proxy.ts)
- [src/lib/auth.ts](../../src/lib/auth.ts)
- [src/app/(protected)/layout.tsx](../../src/app/%28protected%29/layout.tsx)
