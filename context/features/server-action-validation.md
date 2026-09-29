# Feature: Server Action Input Validation

## Status

Complete

## Historical outcome

Added Zod validation of untrusted mutation inputs, normalized user text, and safe field-level failures before authorization/database access.

Kept structural validation separate from permissions and database integrity. Later feature Actions own their schemas; no general form framework was introduced.

## Evidence and maintained implementation

[Recorded completion](../current-feature.md#history); source links below.

- [src/actions/incidents.ts](../../src/actions/incidents.ts)
- [src/actions/students.ts](../../src/actions/students.ts)
- [src/actions/groups.ts](../../src/actions/groups.ts)
- [src/actions/categories.ts](../../src/actions/categories.ts)
- [src/actions/users.ts](../../src/actions/users.ts)
