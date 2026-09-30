# Feature: Client-Side Form Validation

## Status

Complete

## Scope and acceptance

- Move reusable, environment-neutral Zod schemas from Server Actions into neutral validation modules.
- Preserve authoritative Server Action `safeParse()` validation and current safe error contracts.
- Provide immediate, accessible validation feedback when users submit auth, group, category, student, and incident create/edit forms.
- Cover shared schemas and the client validation behavior with focused tests; run required repository checks.

## Decisions

- Validate only fields users author before submission. Delete identifiers and user-role select values remain authoritatively validated by their Actions, but do not need a parallel client feedback flow.
- Reuse the Server Action schema verbatim so normalizing rules and Spanish field messages cannot drift.
- Keep runtime schemas in `src/validation`; derive the existing public mutation-input types in `src/types` from those schemas with type-only imports. This keeps one source of truth without turning the types directory into a runtime-validation owner.

## Implementation record

Extracted auth, group, category, student, incident, and role-selection schemas into `src/validation`. The matching Server Actions continue to parse untrusted inputs before calling feature operations.

Auth forms now parse `FormData` before dispatching their Actions. Group, category, student, and incident create/edit dialogs parse their controlled values before starting a transition. Each path renders the existing accessible field-error treatment with the schema's Spanish messages.

Auth forms hand valid submissions to their `action={formAction}` prop, so React owns the `useActionState` transition. Their submit handlers prevent only invalid client-side submissions; valid submissions reach the Server Action and its redirect. Manual browser verification confirmed immediate field feedback and a valid login redirect.

Verification on 2026-09-30: `npm run test` (20 files, 222 tests), `npm run lint`, `npm run typecheck`, `npm run build`, Prettier on changed files, and `git diff --check` passed. Local Supabase integration tests were not applicable because the change does not affect schema, RLS/grants, role authorization, Auth session infrastructure, or integration fixtures.
