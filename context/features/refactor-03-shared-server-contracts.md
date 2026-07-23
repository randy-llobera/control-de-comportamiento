# Feature: Shared Server Contracts

## Status

Planned

## Goal

Establish the shared result and known-error contracts required by later feature modules and thin Server Actions.

## Standards References

Coding standards found in `/context/coding-standards.md`

- `Coding Standards > Core conventions > TypeScript`
- `Architecture Contract > 6. Server Actions`
- `Architecture Contract > 9. Validation contract`
- `Architecture Contract > 14. Types and contracts`
- `Architecture Contract > 17. Error handling`

## Dependency

Complete Feature 02 first.

## Public Contracts

- `src/types/actions.ts` exports generic `ActionResult<T = undefined>` with exclusive success/data and failure/error/fieldErrors branches.
- An application error contract distinguishes `unauthenticated`, `forbidden`, `not-found`, and `conflict` codes.
- Shared mapping exposes safe Spanish known-error messages to Server Actions and Route Handlers. Unexpected errors remain framework errors after server logging where appropriate.

## Scope

- Move `ActionResult` out of `actions/mutations.ts` without changing current consumers' behavior.
- Add the minimal known application-error type and predicate/mapper needed by later feature modules.
- Make `lib/auth.ts` distinguish Auth/profile query failures from a valid missing session/profile.
- Preserve the current cached no-argument actor helper and explicit-client helper.

## Out of Scope

- Splitting feature Actions or adding feature contracts.
- Changing permission rules, mutation behavior, UI messages, or caching.
- Catching every unexpected error in a blanket `try/catch`.

## Implementation Steps

1. Add the neutral generic Action result type.
2. Add code-based known application errors with shared safe Spanish messages for server boundaries.
3. Add an Action result adapter for known application errors.
4. Update existing mutation imports and return types with no behavior change.
5. Handle Supabase Auth/profile query failures explicitly in `lib/auth.ts`.
6. Run repository checks.

## Risks

- A broad error mapper could hide programming or infrastructure failures.
- Importing a `use server` file from the feature layer would reverse the intended dependency.
- Changes to the Action union can break existing form narrowing.

## Tests

- Type checking proves success and failure branches remain mutually exclusive.
- Known error codes map to the intended safe boundary result.
- Unknown errors are not converted into expected failures.
- Missing session/profile remains distinguishable from a failed Auth/profile query.

## Done Checklist

- [ ] `ActionResult<T>` lives in `src/types/actions.ts`.
- [ ] Known errors contain no browser-facing database details.
- [ ] Existing forms still narrow Action results correctly.
- [ ] Auth/profile query failures are not reported as missing profiles.
- [ ] `npm run lint`, `npm run typecheck`, and `npm run build` pass.
