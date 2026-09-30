# Feature: Users Feature Boundary

## Status

Complete

## Historical outcome

Moved user-management reads and role assignment behind a server feature module and rendered initial data on the server.

The feature validates the selected role and trusted actor. It does not create/delete Auth accounts or implement optimistic role updates.

## Evidence and maintained implementation

[Recorded completion](../current-feature.md#history); source links below.

- [src/lib/users.ts](../../src/lib/users.ts)
- [src/actions/users.ts](../../src/actions/users.ts)
- [src/types/users.ts](../../src/types/users.ts)
- [src/components/UserRoleControls.tsx](../../src/components/UserRoleControls.tsx)
- [src/lib/users.test.ts](../../src/lib/users.test.ts)
