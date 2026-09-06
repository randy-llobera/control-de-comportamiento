# Pending Defects

## P2 - Medium

### DEF-001 - CSV exports do not neutralize spreadsheet formulas

- **Confirmed:** 2026-08-06
- **Location:** `src/utils/incidents.ts` (`escapeCsvField`, `serializeIncidentsToCsv`)
- **Evidence:** Every field is quoted and embedded quotes are escaped, which fixes malformed CSV output, but user-controlled values beginning with `=`, `+`, `-`, or `@` remain executable formulas when a spreadsheet opens the export. Existing tests cover CSV syntax and UTF-8 encoding but not formula neutralization.
- **Impact:** An authenticated user can place a formula in exported incident data and target another user who opens the CSV in spreadsheet software.
- **Action:** Choose the spreadsheet-oriented neutralization strategy, apply it before CSV quoting, and add focused tests for formula prefixes without weakening the current escaping behavior. See the [OWASP CSV Injection guidance](https://owasp.org/www-community/attacks/CSV_Injection).

### DEF-002 - Unexpected CRUD failures bypass user-facing feedback

- **Confirmed:** 2026-08-06
- **Location:** `src/actions/application-error-result.ts` and CRUD Server Actions/components
- **Evidence:** Feature modules now check Supabase errors, and known application errors reach inline alerts. However, `mapApplicationErrorToActionResult` rethrows every non-`ApplicationError`, including raw Supabase failures, while the app has no route error boundary. CRUD components only render failures returned as `ActionResult` values.
- **Impact:** Network, provider, or unexpected database failures can reject a Server Action without giving the user the safe Spanish feedback required by the project.
- **Action:** Add a shared, non-sensitive user-facing fallback for unexpected read and mutation failures while retaining detailed server-side logging. Expose mutation failures through the notification policy tracked by `TASK-006`, and add focused coverage for the chosen boundary behavior.

### DEF-003 - Proxy redirects unauthenticated API requests to an HTML page

- **Confirmed:** 2026-08-06
- **Location:** `src/proxy.ts` and `src/app/api/groups/[groupId]/students/route.ts`
- **Evidence:** The Proxy matcher includes `/api/...`, while only `/` and `/auth` are public. An unauthenticated request to the existing group-students API returns `307 Location: /auth`, so the Route Handler cannot return its tested JSON `401` response.
- **Impact:** API consumers receive browser redirect semantics and potentially HTML instead of the documented JSON error contract. The current `useGroupStudents` caller falls back to a generic load failure after the redirected response cannot be parsed as the expected payload.
- **Action:** Either exclude API routes from the Proxy and enforce authentication inside each Route Handler, or make the Proxy return JSON `401`/`403` responses for API paths. Preserve session-cookie refresh behavior and add coverage that exercises the request through the Proxy rather than calling the Route Handler directly.

### DEF-004 - Deleted-user sessions cause a 500 instead of returning to login

- **Confirmed:** 2026-09-05
- **Location:** `src/lib/supabase-proxy.ts` (`updateSession`), `src/lib/auth.ts` (`loadCurrentUserWithRole`), and `src/proxy.ts`
- **Evidence:** Production logs after an Auth account reset reported `AuthApiError`, code `user_not_found`, with "User from sub claim in JWT does not exist" on `/incidentes`. The Proxy accepts valid JWT claims, but the subsequent `getUser()` error is rethrown because it is not `AuthSessionMissingError`. Clearing the stale site cookies allowed authentication again. Existing auth tests do not cover deleted users or expired/revoked refresh sessions.
- **Impact:** A deleted account's still-valid session cookie can leave that browser receiving a 500, including after redirection from the login page. This blocks affected users until their cookies are cleared; it does not demonstrate successful unauthorized access. P2 reflects the user-visible failure and available workaround.
- **Action:** Treat confirmed invalid/deleted-user sessions as unauthenticated, clear stale session cookies where the response is writable, and return to login without a redirect loop. Preserve API JSON error behavior and distinguish expected session failures from service outages. Add regression coverage for deleted users, expired access tokens with valid refresh tokens, expired/revoked refresh sessions, cookie propagation, and login redirects. Normal token expiration has not been confirmed to fail.
