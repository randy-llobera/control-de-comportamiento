# Current Feature: Navigation Boundary

## Status

In Progress

## Goals

<!-- Add goals here -->

- Make navigation consume a serializable, neutral current-user contract.
- Derive role-visible navigation items from the trusted server-provided role.
- Keep the component focused on navigation rendering and responsive interaction.
- Preserve current URLs, Spanish labels, role visibility, and sign-out behavior.

## Notes

<!-- Add notes here -->

### Dependency

- Complete Feature 05 first so navigation can reuse the stable user/actor contract.

### Scope

- Replace `UserWithRole` and generated database dependencies with the neutral current-user contract.
- Update the protected layout and Navigation props.
- Move immutable navigation definitions outside render and clearly derive role-visible items.
- Keep responsive sidebar state local to the Client Component.
- Extract shared account or navigation markup only where mobile and desktop variants have the same responsibility.
- Use English component and identifier names.
- Consult current documentation through Context7 for relevant library changes.

### Out of Scope

- Changing route authorization or adding navigation items.
- Moving Auth to Server Actions; Feature 14 covers that work.
- Introducing a navigation store or component library.

### Risks

- Link visibility is UX only; layouts, feature operations, and RLS remain authoritative.
- Over-extraction could make the navigation harder to follow.
- Sign-out remains a temporary browser-client consumer until Feature 14.

### Verification

- Teacher sees only incidents and students.
- Coordinator also sees groups, categories, and dashboard.
- Admin also sees users.
- Mobile sidebar opens, closes, and closes after navigation.
- `npm test`, lint, typecheck, build, and browser role checks pass.

### Done Checklist

- [x] Navigation imports no generated or database row type.
- [x] Navigation items match the role model exactly.
- [x] Responsive state remains local.
- [x] No new state dependency or security assumption was introduced.

## History

<!-- Keep this updated. Earliest to latest -->

- 2026-07-23: Moved user-management reads, role assignment, authorization, and mapping behind the users feature boundary.
- 2026-07-23: Added the Vitest Node test foundation with path aliases, explicit discovery, and shared application-error boundary tests.
- 2026-07-23: Added shared Action and known-error contracts, reusable safe server-boundary messages, and explicit Auth/profile failure handling.
- 2026-07-22: Separated Proxy-scoped Supabase claims verification and session cookie/header refresh handling from route redirect logic.
- 2026-07-22: Enforced role-based Supabase RLS for student and incident writes and verified the permission matrix through user-scoped local clients.
- 2026-07-17: Added targeted Next.js route invalidation after successful Server Actions for incidents, students, groups, categories, and user roles.
- 2026-07-17: Added Zod v4 Server Action validation, normalized mutation payloads, and Spanish field-level errors in forms.
- 2026-07-17: Reused one request-scoped Supabase server client per mutation while preserving cached server-component profile lookups.
- 2026-07-17: Added typed Supabase SSR browser/session clients, `proxy.ts` route gating, and cached server profile lookups. Moved authenticated pages into protected role route groups and migrated existing writes to server-authorized actions.
- 2026-07-16: Typed browser and server Supabase clients with the generated `Database` schema.
