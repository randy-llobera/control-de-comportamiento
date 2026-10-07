# Feature: Return to Login After Signup

## Status

Complete

## Scope and acceptance

- After a successful registration, return the existing `/auth` view to its login form so the user can authenticate.
- Keep the email-confirmation notice because registration continues to follow the configured Supabase Auth policy.
- Preserve the existing `/auth` route, Auth Action success contract, validation, input normalization, and safe provider-error behavior.
- Do not add a browser Auth client, alter Supabase configuration, or change roles, routes, database schema, or RLS.

## Decisions

- “Login page” means the login state inside the existing `/auth` route; no dedicated login route is introduced.
- The signup form owns the transition by calling its existing `onShowLogin` callback only after the Action reports success.
- The current test environment is Node-only and has no component-testing stack. Focused Auth Action coverage will preserve the successful signup contract and failure behavior; browser verification will confirm the rendered state transition.

## Implementation record

The signup form now calls its existing `onShowLogin` callback after it shows the successful email-confirmation notice. The existing `/auth` view therefore returns to its login state without changing the route or the successful Auth Action result. Focused Action coverage explicitly preserves the no-redirect, no-revalidation success contract.

## Verification

- `npm test -- src/actions/auth.test.ts` — 1 file, 10 tests passed.
- `npm run test:integration` — 1 file, 6 tests passed.
- `npm run lint`, `npm run typecheck`, and `npm run build` passed.
- `git diff --check` passed.
- Browser verification by the user confirmed that successful signup returns the existing `/auth` view to the login form while retaining the confirmation guidance.
