# Feature: Server Action Input Validation

## Status

Planned

## Goal

Validate every Server Action input on the server with Zod before the action authorizes a user or writes to Supabase.

## Why

The current mutation actions derive identity and role on the server, but they accept structurally typed values from the client without runtime validation. TypeScript types disappear at runtime, so a browser can still invoke an action with empty strings, malformed IDs, unsupported severity values, or invalid dates.

This feature adds Zod as a direct production dependency and establishes one consistent validation boundary for all Server Actions. It complements authorization and RLS; it does not replace either.

## Dependency

Complete Server-Side Authentication and Authorization first. This feature validates the Server Actions in `src/actions/mutations.ts` after that feature has established server-derived identity and role checks.

Server Mutation Cache Invalidation should run after this feature so invalidation applies only to a mutation that has passed validation, authorization, and the database write.

## Scope

- Add the current stable Zod v4 package as a direct production dependency.
- Use Context7 to obtain the latest Zod and Next.js Server Action documentation before implementation.
- Define reusable server-side schemas for all action payloads in `src/actions/mutations.ts` or a focused adjacent validation module.
- Validate unknown action inputs with `safeParse()` before authorization and database access.
- Normalize user-entered strings consistently, including trimming names and descriptions where appropriate.
- Return user-safe, field-level validation errors that client forms can display.
- Use schema-inferred types for validated action data where they reduce duplication.
- Validate these inputs:
  - incident: student ID, category ID, severity, description, and date
  - student: optional student ID, name, and group ID
  - group/category: optional record ID and name
  - user role update: target user ID and role ID

## Out Of Scope

- Changing authentication, role authorization, RLS policies, database schema, or page URLs.
- Adding client-only validation as a security boundary.
- Replacing database constraints or foreign-key checks with Zod.
- Changing the mutation cache-invalidation strategy.
- Adding form libraries or a general validation framework beyond Zod.

## Implementation Steps

1. Use Context7 to verify current Zod v4 `safeParse()`, error formatting, and type-inference guidance, plus Next.js Server Action error-handling behavior.
2. Install Zod as a direct production dependency and update the lockfile.
3. Define schemas with database-compatible constraints, including UUID format, allowed severity values, non-empty trimmed names, required incident descriptions, and valid date strings.
4. Validate each Server Action input with `safeParse()` before calling `getCurrentUserWithRole()` or creating a Supabase client.
5. Return a consistent action result that distinguishes validation errors from authorization and database errors, including field errors when applicable.
6. Pass only validated, normalized schema output to Supabase mutations.
7. Update client form handlers to display validation errors without exposing internal database errors.
8. Add focused validation tests when the project test runner is available; otherwise document the manual invalid-input cases used for verification.
9. Run type checking, linting, and a production build.

## Risks

- Zod validation must match database constraints. If they drift, users may receive conflicting errors from the application and database.
- Do not use coercion that silently changes critical identifiers or permissions. IDs and role IDs must be valid strings, not coerced values.
- Validation error messages must be user-safe and in Spanish; server/database errors should be logged but not exposed verbatim.
- Client-side validation can improve usability later, but Server Actions must remain safe when called directly.

## Done Checklist

- [ ] Zod v4 is a direct dependency in `package.json` and the lockfile.
- [ ] Context7 documentation was consulted for the installed Zod version and Server Action behavior.
- [ ] Every mutation action validates unknown input with `safeParse()` before authorization and database access.
- [ ] Validated data is trimmed and normalized consistently before persistence.
- [ ] Invalid UUIDs, empty names, invalid severity values, invalid dates, and invalid role IDs return user-safe validation failures.
- [ ] Client forms can display field-level validation failures.
- [ ] Authorization and RLS behavior remain unchanged.
- [ ] `npm run typecheck`, `npm run lint`, and `npm run build` pass.
