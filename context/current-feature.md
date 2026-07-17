# Current Feature: Server Action Input Validation

## Status

In Progress

## Goals

- Add Zod v4 as a direct production dependency.
- Validate every Server Action input before authorization or Supabase access.
- Normalize validated user-entered strings and persist only schema output.
- Return user-safe Spanish field-level validation errors for client forms.
- Preserve existing authorization, RLS, and cache-invalidation behavior.
- Verify type checking, linting, and the production build.

## Notes

Spec: `context/features/server-action-validation.md`.

Depends on Server-Side Authentication and Authorization and Auth Helper Client Reuse. Implement before Server Mutation Cache Invalidation. Scope covers schemas and validation for incident, student, group/category, and user-role mutation payloads. Do not coerce IDs or permissions; validation messages must be Spanish and safe for users. Use Context7 to gather the latest documentation and standards to implement Zod in this app.

## History

<!-- Keep this updated. Earliest to latest -->

- 2026-07-17: Reused one request-scoped Supabase server client per mutation while preserving cached server-component profile lookups.
- 2026-07-17: Added typed Supabase SSR browser/session clients, `proxy.ts` route gating, and cached server profile lookups. Moved authenticated pages into protected role route groups and migrated existing writes to server-authorized actions.
- 2026-07-16: Typed browser and server Supabase clients with the generated `Database` schema.
