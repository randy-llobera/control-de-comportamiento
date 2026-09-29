# Feature: Server Mutation Cache Invalidation

## Status

Complete

## Historical outcome

Added invalidation of routes affected by successful mutations, including derived incident/dashboard displays.

Kept invalidation beside the owning Actions instead of adding client caching, subscriptions, or a broad cache abstraction.

## Evidence and maintained implementation

[Recorded completion](../current-feature.md#history); source links below.

- [src/actions/incidents.ts](../../src/actions/incidents.ts)
- [src/actions/students.ts](../../src/actions/students.ts)
- [src/actions/groups.ts](../../src/actions/groups.ts)
- [src/actions/categories.ts](../../src/actions/categories.ts)
- [src/actions/users.ts](../../src/actions/users.ts)
