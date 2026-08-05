# Feature: Integration Coverage and Final Audit

## Status

Complete

## Goal

Verify RLS and feature boundaries through repeatable local integration tests, close material test gaps, and confirm repository-wide compliance with the coding standards.

## Standards References

- `Coding Standards > Core conventions`
- `Architecture Contract > 1. Layer model`
- `Architecture Contract > 2. Folder structure > Pure utilities`
- `Architecture Contract > 13. Authentication and authorization`
- `Architecture Contract > 18. Database design and RLS`
- `Architecture Contract > 19. Testing contract`

## Dependency

Complete Feature 15 first. This is the final refactoring feature.

## Scope

- Add a dedicated local Supabase integration-test command/config separate from normal unit tests.
- Refuse to run integration fixtures/assertions unless the Supabase URL is localhost or `127.0.0.1`.
- Use a service-role client only to create/clean isolated Auth and database fixtures.
- Sign in distinct teacher-owner, teacher-other, coordinator, and admin clients for all permission assertions.
- Test RLS through user-scoped Supabase clients, never service-role assertions.
- Fill material missing unit tests for validation, mapping, known errors, business rules, filtering, CSV, and dashboard aggregation.
- Audit all source boundaries, naming, generated types, caching/invalidation, browser-client usage, and Route Handler usage against the standards.
- Audit `src/utils/` for environment-neutral dependencies, deterministic behavior, domain-focused organization, colocated tests, and absence of external side effects.
- Update the feature index and roadmap status only after every check passes.

## Out of Scope

- Production data, production Supabase, load testing, component tests, coverage-percentage gates, or new application behavior.
- Architecture changes not required by an identified standards violation.
- Treating layout visibility as an authorization assertion.

## Implementation Steps

1. Add `test:integration` using Vitest with explicit local-only environment guards.
2. Create isolated role fixtures and related group/category/student/incident rows.
3. Assert the complete approved permission matrix through user sessions.
4. Clean fixtures reliably after success or failure.
5. Run and fill the targeted unit-test matrix without adding low-value snapshot tests.
6. Search for forbidden `.from()` calls outside feature modules/infrastructure, browser-client consumers, raw database types in components, internal Route Handler fetches, and runtime-specific imports or side effects under `src/utils/`.
7. Run local DB reset, unit/integration tests, lint, typecheck, build, and role-based browser smoke checks.
8. Record final compliance and any intentionally deferred standard section in the roadmap/index.

## Risks

- A misconfigured test could target production; local URL refusal is mandatory.
- Fixture cleanup must not hide failed assertions or leave data that affects later runs.
- Service-role assertions would bypass RLS and invalidate the security test.
- A final audit must report unresolved gaps rather than marking them complete.

## Tests

- Teacher updates/deletes own incidents and cannot update/delete another teacher's incidents.
- Coordinator/admin update/delete all incidents.
- Teacher-owned incidents and related teacher profiles are readable by the other teacher, coordinator, and admin.
- All authenticated roles read/create students; only admin updates/deletes them.
- Teacher cannot manage groups/categories/roles.
- Coordinator manages groups/categories but not roles.
- Admin retains full approved access.
- Authorized admin deletions cannot bypass group/student/category foreign-key constraints.
- Direct application-table access exists only in server feature modules, approved Supabase infrastructure, migrations/seeds, and explicit administrative scripts.
- No current Auth/navigation/data flow imports the browser Supabase client.
- `src/utils/` imports no Supabase, React, Next.js, browser, or environment-specific APIs; utility tests remain beside their domain modules.

## Done Checklist

- [x] Integration tests refuse non-local Supabase URLs.
- [x] Every RLS assertion uses a user-scoped client.
- [x] Unit and integration suites are repeatable after a local DB reset.
- [x] Every `src/utils/` module satisfies the pure-utility boundary and has focused tests where it contains material logic.
- [x] No material test or standards gap remains undocumented.
- [x] Feature index and roadmap accurately reflect completion.
- [x] `npm test`, `npm run test:integration`, lint, typecheck, and build pass.
