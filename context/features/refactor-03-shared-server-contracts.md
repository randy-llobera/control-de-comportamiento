# Feature: Shared Server Contracts

## Status

Complete

## Historical outcome

Introduced neutral ActionResult and known application-error contracts, with safe boundary mapping and distinct missing-session/profile outcomes.

Unexpected failures remain exceptions rather than being mislabeled as known business errors. Shared contracts do not belong to a feature Action module.

## Evidence and maintained implementation

[Recorded completion](../current-feature.md#history); source links below.

- [src/types/actions.ts](../../src/types/actions.ts)
- [src/lib/application-error.ts](../../src/lib/application-error.ts)
- [src/actions/application-error-result.ts](../../src/actions/application-error-result.ts)
- [src/lib/auth.ts](../../src/lib/auth.ts)
