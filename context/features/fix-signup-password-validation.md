# Feature: Signup Password Validation

## Status

Complete

## Scope and acceptance

- Require signup passwords to contain at least six characters, matching the current Supabase Email provider setting.
- Show the requirement in Spanish in the empty signup password field and prevent invalid client submissions.
- Preserve the Server Action's shared-schema validation as the authoritative application boundary and retain Supabase enforcement.
- Cover the rule and Server Action rejection path with focused tests and run the required checks.

## Decisions

- The policy is the verified current Supabase setting: six characters minimum, with no required character groups or leaked-password protection.
- The neutral validation module owns both the minimum and the Spanish placeholder text, so client guidance and server validation cannot drift.
- The requirement is shown as the empty password field's placeholder; the user accepted that it does not persist after typing begins.
- Login validation remains unchanged: an existing password need only be present before Supabase verifies it.

## Implementation record

The shared signup schema now rejects non-empty passwords shorter than six characters, while login remains limited to required-field validation. The signup form renders the shared Spanish requirement as its empty password-field placeholder and associates any validation error with that field.

## Verification

- `npm run test` — 20 files, 224 tests passed.
- `npm run test:integration` — 1 file, 6 tests passed.
- `npm run lint`, `npm run typecheck`, and `npm run build` passed.
- Browser verification on the local app confirmed the signup placeholder, accessible five-character validation error, and no application request on invalid submission.
