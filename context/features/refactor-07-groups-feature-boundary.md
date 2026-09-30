# Feature: Groups Feature Boundary

## Status

Complete

## Historical outcome

Moved group reads/writes, trusted creator assignment, uniqueness/referenced-delete checks, and mapping into the group feature.

Rendered initial data on the server and isolated create/edit/delete dialogs. Avoided a generic CRUD factory even where categories have similar behavior.

## Evidence and maintained implementation

[Recorded completion](../current-feature.md#history); source links below.

- [src/lib/groups.ts](../../src/lib/groups.ts)
- [src/actions/groups.ts](../../src/actions/groups.ts)
- [src/types/groups.ts](../../src/types/groups.ts)
- [src/components/GroupsView.tsx](../../src/components/GroupsView.tsx)
- [src/lib/groups.test.ts](../../src/lib/groups.test.ts)
