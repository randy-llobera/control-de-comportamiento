# Feature: API Proxy JSON Error Contract

## Status

Completed

## Scope and acceptance

Fix DEF-003 so unauthenticated API requests receive the documented JSON error contract instead of a redirect to the HTML login page.

- Return a JSON `401` response for unauthenticated `/api/...` requests.
- Preserve refreshed and cleared Supabase session cookies and response headers produced by the Proxy/session boundary.
- Preserve redirects for unauthenticated page requests and the existing redirect behavior for authenticated users visiting public pages.
- Allow authenticated API requests to continue to their Route Handlers.
- Keep role authorization in the existing feature and Route Handler boundaries; do not move profile or role checks into the Proxy.
- Preserve the existing group-students Route Handler status and JSON mappings.

## Decision

Make the Proxy return the JSON `401` response for unauthenticated API paths rather than excluding API paths from the Proxy. This keeps session refresh and stale-session cleanup centralized while preserving the existing page-routing behavior. The group-students feature boundary remains responsible for authentication and authorization when the request reaches the Route Handler.

The unauthenticated API response uses the existing safe application message:

```json
{"error":"Inicia sesión para continuar."}
```

## Implementation guidance

1. Update `src/proxy.ts` to distinguish API paths from page paths after `updateSession()` returns.
2. For an unauthenticated API request, construct a JSON `401` response and copy the session response's relevant headers and cookies so refresh and cleanup behavior are not lost.
3. Keep the existing redirect helper for unauthenticated non-API paths.
4. Leave `src/app/api/groups/[groupId]/students/route.ts` and `src/lib/students.ts` responsible for their existing validation, permission, and error mapping behavior.
5. Extend `src/proxy.test.ts` with through-Proxy coverage for API `401` JSON responses, absence of a `Location` header, session-cookie/header preservation, authenticated API pass-through, and unchanged page redirects.
6. Retain the direct Route Handler tests in `src/app/api/groups/[groupId]/students/route.test.ts` as coverage of the handler's own contract.

Do not change the product overview, database schema, RLS, roles, dependencies, or API payloads beyond correcting the unauthenticated transport response.

## Files and ownership

- `src/proxy.ts` — API/page response distinction and session response propagation.
- `src/proxy.test.ts` — Proxy-level regression coverage.
- `src/app/api/groups/[groupId]/students/route.test.ts` — existing Route Handler contract coverage; update only if implementation exposes a genuine mismatch.
- `context/defects/pending-defects.md` — resolve DEF-003 with the implementation outcome and evidence when complete.
- `context/current-feature.md` — point at this record while implementation is active; reset it during feature completion according to the project workflow.

## Verification

Run focused tests first, then the required repository checks:

```text
npm test -- src/proxy.test.ts src/app/api/groups/[groupId]/students/route.test.ts
npm run lint
npm run typecheck
npm run build
npm run test:integration
git diff --check
```

Runtime acceptance evidence must confirm that an unauthenticated request to `/api/groups/<groupId>/students` returns JSON `401` without a redirect or HTML response, while an authenticated request still reaches the handler and session-cookie refresh or cleanup remains intact.

## Progress

- 2026-10-07: Implemented the API/page distinction in `src/proxy.ts`, preserving session response headers and cookies on the JSON `401` response. Added Proxy coverage for unauthenticated API responses, absent redirects, session propagation, authenticated API pass-through, and existing page behavior.
- 2026-10-07: Focused tests passed: `npm test -- src/proxy.test.ts 'src/app/api/groups/[groupId]/students/route.test.ts'` (2 files, 10 tests). Required checks passed: `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test:integration` (1 file, 6 tests), and `git diff --check`.

## Outcome

Implemented and completed on 2026-10-07. `src/proxy.ts` now returns the safe JSON `401` contract for unauthenticated `/api/...` requests while preserving session response headers and cookies. Page redirects, authenticated public-page redirects, authenticated API pass-through, and the group-students Route Handler contract remain unchanged. DEF-003 is resolved.

Verification passed:

- `npm test -- src/proxy.test.ts 'src/app/api/groups/[groupId]/students/route.test.ts'`: 2 files, 10 tests.
- `npm run lint`.
- `npm run typecheck`.
- `npm run build`.
- `npm run test:integration`: 1 file, 6 tests.
- `git diff --check`.
- Runtime unauthenticated request to `/api/groups/example/students`: HTTP `401`, JSON content type, safe error body, and no `Location` header or HTML response.
