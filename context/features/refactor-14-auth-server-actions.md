# Feature: Auth Server Actions

## Status

Planned

## Goal

Move login, signup, and logout to validated Server Actions so no current application flow requires the Supabase browser client, with shadcn Toast as the default transient feedback for successful and failed operations.

## Standards References (`/context/coding-standards.md`)

- `Architecture Contract > 6. Server Actions`
- `Architecture Contract > 9. Validation contract`
- `Architecture Contract > 10. Supabase server client`
- `Architecture Contract > 11. Supabase browser client`
- `Architecture Contract > 13. Authentication and authorization`
- `Architecture Contract > 17. Error handling`

## Dependency

Complete Feature 13 first so all application-table browser consumers have already been removed.

## Public Contracts

- Login input: validated email and password.
- Signup input: validated email, password, display name, and school role.
- Auth Actions return the shared `ActionResult`; successful login/logout redirect rather than return UI data.

## Scope

- Add `actions/auth.ts` with login, signup, and logout Server Actions.
- Add the shadcn Toast component and mount its `Toaster` once in the root layout.
- Use a new request-scoped server Supabase client for each Action.
- Validate FormData/unknown input with boundary-local Zod schemas.
- On login success, revalidate the authenticated layout as needed and redirect to `/incidentes`.
- On signup success, preserve the confirmation-email flow and show a safe Spanish success toast.
- On logout success, sign out, revalidate session-dependent layout data, and redirect to `/auth`.
- Replace Auth page and Navigation browser-client calls with the Actions.
- Use toast messages for operation success and error feedback, including authentication failures.
- Keep field-specific validation messages inline so users can identify the inputs that need correction.
- Convert Auth provider failures to a generic safe Spanish message without branching on provider-specific error codes.
- Keep the browser Supabase module implemented but unused.

## Out of Scope

- OAuth, password reset, MFA, changing signup metadata, or deleting the browser-client module.
- Route Handlers: these Auth operations are internal UI mutations.
- Displaying raw Supabase Auth error messages.
- Persistent notifications, unread state, notification storage, or a message inbox.

## Implementation Steps

1. Use Context7 for current Next.js Server Action forms and Supabase SSR Auth/cookie guidance.
2. Add shadcn Toast and mount the global `Toaster` in the root layout.
3. Add boundary schemas and generic safe Auth error handling.
4. Implement login/signup/logout with request-scoped server clients.
5. Update the Auth form to use Action state while preserving its login/signup toggle, loading UX, and inline field validation.
6. Show operation success and error feedback with toast messages without duplicating redirect outcomes.
7. Update Navigation sign-out to submit the logout Action.
8. Remove every import/use of the browser Supabase client and confirm the module remains unused.
9. Add schema/error-mapping tests and verify session cookie and toast behavior in the browser.

## Risks

- Redirect handling must not be caught and converted into an Action failure.
- Incorrect cookie propagation can make successful login appear unauthenticated.
- Provider errors are unstable; do not expose their messages or branch on provider-specific codes.
- Signup may not create an active session when email confirmation is enabled.
- Redirect-based login/logout success feedback must not require persistent notification state or leak messages through unsafe URL parameters.
- Toasts are the default operation feedback, but field-specific validation must remain visible beside the relevant inputs.

## Tests

- Valid login establishes a server-visible session and redirects to `/incidentes`.
- Invalid fields/credentials return safe Spanish errors.
- Signup validates all fields and shows the confirmation message without exposing provider details.
- Logout clears the session and redirects to `/auth`.
- Operation success and error feedback, including Auth failures, uses the global shadcn Toast.
- Field-specific validation remains inline beside the relevant inputs.
- No source file imports the browser Supabase module.

## Done Checklist

- [ ] Login, signup, and logout use Server Actions and server clients.
- [ ] Auth inputs are structurally validated on the server.
- [ ] Expected errors are safe and Spanish.
- [ ] The global shadcn `Toaster` is mounted once and operation success/error feedback uses toast messages.
- [ ] Field-specific validation remains inline beside the relevant inputs.
- [ ] Browser client implementation remains but has zero consumers.
- [ ] Session/redirect browser checks, tests, lint, typecheck, and build pass.
