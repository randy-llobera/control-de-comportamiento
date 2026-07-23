# Current Feature: Vitest Foundation

## Status

In Progress

## Goals

- Add a compatible Vitest development dependency and lockfile update.
- Add `test` and `test:watch` npm scripts.
- Configure Node-based `*.test.ts` discovery with TypeScript path aliases.
- Co-locate focused tests with server and pure modules.
- Test known application-error and Action-boundary mapping behavior.
- Verify tests are discovered and repository checks pass.

## Notes

<!-- Add notes here -->

- Dependency: Feature 03 must be complete so tests target stable shared contracts.
- Follow `Architecture Contract > 19. Testing contract` and the database/code-quality conventions in `context/coding-standards.md`.
- Use Context7 to confirm current Vitest configuration before implementation.
- Keep the setup minimal: no component tests, jsdom, Testing Library, browser automation, snapshots, coverage thresholds, or Supabase integration/RLS tests.
- Ensure the test command cannot silently pass when no tests are found.
- Unknown errors must remain rethrown or unmapped according to the existing boundary design.

## History

<!-- Keep this updated. Earliest to latest -->

- 2026-07-23: Added shared Action and known-error contracts, reusable safe server-boundary messages, and explicit Auth/profile failure handling.
- 2026-07-22: Separated Proxy-scoped Supabase claims verification and session cookie/header refresh handling from route redirect logic.
- 2026-07-22: Enforced role-based Supabase RLS for student and incident writes and verified the permission matrix through user-scoped local clients.
- 2026-07-17: Added targeted Next.js route invalidation after successful Server Actions for incidents, students, groups, categories, and user roles.
- 2026-07-17: Added Zod v4 Server Action validation, normalized mutation payloads, and Spanish field-level errors in forms.
- 2026-07-17: Reused one request-scoped Supabase server client per mutation while preserving cached server-component profile lookups.
- 2026-07-17: Added typed Supabase SSR browser/session clients, `proxy.ts` route gating, and cached server profile lookups. Moved authenticated pages into protected role route groups and migrated existing writes to server-authorized actions.
- 2026-07-16: Typed browser and server Supabase clients with the generated `Database` schema.
