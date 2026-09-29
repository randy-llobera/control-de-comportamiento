# Feature: Students Feature Boundary

## Status

Complete

## Historical outcome

Centralized student reads/writes, group validation, uniqueness, and referenced-delete checks behind the student feature.

Derived UI management capabilities from the server actor while keeping authorization authoritative in feature operations and RLS. Separate dialogs handle user interaction.

## Evidence and maintained implementation

[Recorded completion](../current-feature.md#history); source links below.

- [src/lib/students.ts](../../src/lib/students.ts)
- [src/actions/students.ts](../../src/actions/students.ts)
- [src/types/students.ts](../../src/types/students.ts)
- [src/components/StudentsView.tsx](../../src/components/StudentsView.tsx)
- [src/lib/students.test.ts](../../src/lib/students.test.ts)
