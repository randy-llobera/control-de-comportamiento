# Feature: Auth Server Actions

## Status

Planned

## Goal

Move login, signup, and logout to validated Server Actions so no current application flow requires the Supabase browser client.

## Standards References

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
- Auth Actions return the shared `ActionResult` for expected failures; successful login/logout redirect rather than return UI data.

## Scope

- Add `actions/auth.ts` with login, signup, and logout Server Actions.
- Use a new request-scoped server Supabase client for each Action.
- Validate FormData/unknown input with boundary-local Zod schemas.
- On login success, revalidate the authenticated layout as needed and redirect to `/incidentes`.
- On signup success, preserve the confirmation-email flow and return a safe Spanish success message.
- On logout success, sign out, revalidate session-dependent layout data, and redirect to `/auth`.
- Replace Auth page and Navigation browser-client calls with the Actions.
- Map known invalid credentials, existing account, weak password, and rate-limit outcomes to safe Spanish messages; use a generic safe fallback.
- Keep the browser Supabase module implemented but unused.

## Out of Scope

- OAuth, password reset, MFA, changing signup metadata, or deleting the browser-client module.
- Route Handlers: these Auth operations are internal UI mutations.
- Displaying raw Supabase Auth error messages.

## Implementation Steps

1. Use Context7 for current Next.js Server Action forms and Supabase SSR Auth/cookie guidance.
2. Add boundary schemas and safe Auth error-code mapping.
3. Implement login/signup/logout with request-scoped server clients.
4. Update the Auth form to use Action state while preserving its login/signup toggle and loading/error UX.
5. Update Navigation sign-out to submit the logout Action.
6. Remove every import/use of the browser Supabase client and confirm the module remains unused.
7. Add schema/error-mapping tests and verify session cookie behavior in the browser.

## Risks

- Redirect handling must not be caught and converted into an Action failure.
- Incorrect cookie propagation can make successful login appear unauthenticated.
- Provider error strings are unstable; map supported error codes and use a safe fallback.
- Signup may not create an active session when email confirmation is enabled.

## Tests

- Valid login establishes a server-visible session and redirects to `/incidentes`.
- Invalid fields/credentials return safe Spanish errors.
- Signup validates all fields and shows the confirmation message without exposing provider details.
- Logout clears the session and redirects to `/auth`.
- No source file imports the browser Supabase module.

## Done Checklist

- [ ] Login, signup, and logout use Server Actions and server clients.
- [ ] Auth inputs are structurally validated on the server.
- [ ] Expected errors are safe and Spanish.
- [ ] Browser client implementation remains but has zero consumers.
- [ ] Session/redirect browser checks, tests, lint, typecheck, and build pass.
