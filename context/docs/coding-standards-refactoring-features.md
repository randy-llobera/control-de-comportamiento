# Coding Standards Refactoring Features

## Purpose

This index breaks `coding-standards-refactoring-roadmap.md` into small, dependency-ordered features. Complete one feature before loading the next. Do not combine features during implementation unless this index is deliberately revised first.

`context/current-feature.md` remains the working file for the one active feature. Load a spec with:

```text
/feature load <spec-name-without-.md>
```

## Required checks

Every feature must pass:

```bash
npm run lint
npm run typecheck
npm run build
```

Starting with Feature 04, run `npm test` for affected unit tests. UI features also require browser verification for the relevant roles. Database security features require local Supabase verification.

## Ordered features

| Order | Feature                                                                                       | Depends on | Status   |
| ----- | --------------------------------------------------------------------------------------------- | ---------- | -------- |
| 01    | [Authorization and RLS](../features/refactor-01-authorization-rls.md)                         | None       | Complete |
| 02    | [Proxy session boundary](../features/refactor-02-proxy-session-boundary.md)                   | 01         | Complete |
| 03    | [Shared server contracts](../features/refactor-03-shared-server-contracts.md)                 | 02         | Complete |
| 04    | [Vitest foundation](../features/refactor-04-vitest-foundation.md)                             | 03         | Complete |
| 05    | [Users feature boundary](../features/refactor-05-users-feature-boundary.md)                   | 04         | Complete |
| 06    | [Navigation boundary](../features/refactor-06-navigation-boundary.md)                         | 05         | Complete |
| 07    | [Groups feature boundary](../features/refactor-07-groups-feature-boundary.md)                 | 06         | Complete |
| 08    | [Categories feature boundary](../features/refactor-08-categories-feature-boundary.md)         | 07         | Complete |
| 09    | [Students feature boundary](../features/refactor-09-students-feature-boundary.md)             | 08         | Complete |
| 10    | [Incidents data boundary](../features/refactor-10-incidents-data-boundary.md)                 | 09         | Complete |
| 11    | [Incident CRUD and UI boundary](../features/refactor-11-incidents-ui-boundary.md)             | 10         | Complete |
| 12    | [Incident filtering and CSV](../features/refactor-12-incident-filtering-csv.md)               | 11         | Complete |
| 13    | [Dashboard feature boundary](../features/refactor-13-dashboard-feature-boundary.md)           | 12         | Complete |
| 14    | [Auth Server Actions](../features/refactor-14-auth-server-actions.md)                         | 13         | Complete |
| 15    | [Tailwind theme and naming](../features/refactor-15-tailwind-theme-and-naming.md)             | 14         | Complete |
| 16    | [Integration coverage and final audit](../features/refactor-16-integration-coverage-audit.md) | 15         | Complete |

## Boundary rules for every feature

- Server Pages call feature read functions directly.
- Server Actions handle UI mutations and delegate application behavior to feature modules.
- Route Handlers are added only for actual HTTP callers. Server code never fetches the app's own handlers.
- Feature modules own application-table access, authentication, authorization, business rules, mapping, and known application failures.
- `src/utils/` contains deterministic, environment-agnostic logic over neutral contracts. It must not depend on Supabase, React, Next.js, browser APIs, environment variables, or external side effects; material utilities keep focused tests beside their domain modules.
- The browser Supabase client is not used by current application flows after Feature 14. Its unused implementation remains available for a future browser-owned requirement.
- Public routes and visible content remain Spanish. Code identifiers remain English.
- Do not introduce services, repositories, `db-context.ts`, Zustand, TanStack Query, component-test tooling, or a JavaScript Tailwind configuration.

## Completion workflow

1. Load only the next planned feature into `context/current-feature.md`.
2. Create its branch through the feature workflow.
3. Implement only that spec's scope.
4. Run its targeted tests and required checks.
5. Review against its standards references and done checklist.
6. Complete and merge it before loading the next feature.
