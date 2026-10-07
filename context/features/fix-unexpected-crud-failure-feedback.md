# Feature: Unexpected CRUD Failure Feedback

## Status

Completed

## Scope and acceptance

Resolve DEF-002 with a minimal, safe fallback for unexpected CRUD mutation and page-rendering failures.

- Keep specific Spanish `ActionResult` messages for known `ApplicationError` values and existing field-level validation feedback.
- Convert unknown errors handled by the existing CRUD Action result mapper into one non-sensitive Spanish failure result after server-side logging, so existing CRUD dialogs keep open and display feedback.
- Add one App Router `src/app/error.tsx` boundary for unexpected read or rendering failures, with a safe Spanish message and retry action.
- Do not expose provider, database, network, or exception details to users.
- Preserve current authorization, validation, mutation, cache invalidation, and dialog behavior on success.
- Add focused coverage for the generic mutation result and the route fallback behavior.

## Decision

Use the existing CRUD Action result mapper as the narrow mutation fallback rather than adding a new client-side abstraction or changing every CRUD component. Its generic fallback must remain distinct from a known business error and must retain server-side diagnostic logging.

Use `src/app/error.tsx` only for uncaught page read/render failures. It is not a missing-route (`404`) screen and does not replace a future `not-found.tsx` requirement.

The broader success and transient-toast policy remains in TASK-006. This fix relies on the existing inline ActionResult feedback so it can resolve DEF-002 without expanding that task's scope.

## Implementation guidance

1. Update `src/actions/application-error-result.ts` to keep known `ApplicationError` mappings and return the shared generic safe message for unknown CRUD Action failures after logging them.
2. Update focused mapper and CRUD Action tests: known failures remain specific; unknown failures return the generic safe result; raw error messages never reach `ActionResult`.
3. Add `src/app/error.tsx` as a Client Component with a safe Spanish fallback and `reset` retry action. Do not render `error.message`.
4. Clarify `context/coding-standards.md` so its error convention distinguishes generic returned CRUD-mutation failures from uncaught page read/render failures handled by the route error boundary.
5. When complete, update DEF-002 with outcome and verification evidence. Leave TASK-006 open unless its broader notification-policy scope is implemented separately.

## Files and ownership

- `src/actions/application-error-result.ts` — shared safe CRUD Action error-result mapping.
- `src/actions/application-error-result.test.ts` and affected Action tests — regression coverage.
- `src/app/error.tsx` — safe fallback for unexpected page rendering/read failures.
- `context/coding-standards.md` — shared error-boundary convention.
- `context/defects/pending-defects.md` — DEF-002 outcome and evidence on completion.
- `context/current-feature.md` — active feature pointer during implementation; reset when complete under the project workflow.

## Verification

Run focused unit tests first, then the required repository checks:

```text
npm test -- src/actions/application-error-result.test.ts src/actions/incidents.test.ts src/actions/groups.test.ts src/actions/students.test.ts src/actions/categories.test.ts src/actions/users.test.ts
npm run lint
npm run typecheck
npm run build
git diff --check
```

Browser verification must confirm that an unexpected CRUD failure keeps the dialog open and shows only the generic Spanish feedback, while a failed protected-page render shows the safe retry screen. Confirm that known validation and business errors retain their current actionable feedback.

## Progress

- 2026-10-07: Created for a future iteration; no application code, tests, or production behavior changed.
- 2026-10-07: Started implementation on `fix/unexpected-crud-failure-feedback`. The shared CRUD mapper and App Router boundary/test structure are implemented; browser verification and completion evidence remain pending.
- 2026-10-07: Focused unit coverage passed (7 files, 45 tests), along with `npm run lint`, `npm run typecheck`, `npm run build`, and `git diff --check`. Browser verification and completion-stage DEF-002 evidence remain pending.
- 2026-10-07: Browser check confirmed the landing page, login and registration presentation, accessible empty-login field feedback, protected `/dashboard` redirect to `/auth`, and no browser console errors. Authenticated CRUD fallback and uncaught page-error-boundary states were not exercised because the session is unauthenticated and the app has no browser-accessible fault-injection route; completion evidence remains pending.
- 2026-10-07: Re-ran the focused suite including `src/app/error.test.ts`: 7 files and 45 tests passed. `npm run lint`, `npm run typecheck`, `npm run build`, and `git diff --check` also passed. No database integration run was needed because this feature changes no schema, RLS, Auth infrastructure, or integration fixtures.
- 2026-10-07: Authenticated browser check on `/incidentes` confirmed the incident list, filters, create dialog, delete confirmation, dialog cancellation, and no browser console errors. No application data was changed. The safe generic CRUD result and uncaught page-error boundary remain covered by focused tests; they cannot be induced through a supported live UI path without temporary fault injection.

## Outcome

Implemented and completed on 2026-10-07. Unexpected failures from the existing CRUD Server Actions are logged server-side and return one safe Spanish fallback, preserving the open dialog and existing known-error and field-validation feedback. The root App Router error boundary now provides a safe protected-page retry screen without rendering the underlying exception. DEF-002 is resolved; TASK-006 remains open because this change does not add broader success or toast behavior.

Verification passed:

- `npm test -- src/actions/application-error-result.test.ts src/actions/incidents.test.ts src/actions/groups.test.ts src/actions/students.test.ts src/actions/categories.test.ts src/actions/users.test.ts src/app/error.test.ts`: 7 files, 45 tests.
- `npm run lint`.
- `npm run typecheck`.
- `npm run build`.
- `git diff --check`.
- Signed-in browser: a temporary reverted incident-update fault kept the edit dialog open and displayed only `No se pudo completar la operación. Inténtalo de nuevo.`
- Signed-in browser: a temporary reverted `/incidentes` render fault displayed `Algo salió mal`, the safe retry text, and `Intentar de nuevo`; selecting retry returned to the incident page.
