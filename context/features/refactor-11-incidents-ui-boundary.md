# Feature: Incident CRUD and UI Boundary

## Status

Complete

## Historical outcome

Completed ownership-aware edit/delete and separated filters, list, form, and delete confirmation. Group selection loads students through an authenticated HTTP boundary with stale-request handling.

Student and creator attribution remain immutable during edits; correcting a wrong student requires delete/recreate. Authenticated profile reads were broadened to display incident authors across roles.

## Evidence and maintained implementation

[Recorded completion](../current-feature.md#history); source links below.

- [src/components/IncidentsView.tsx](../../src/components/IncidentsView.tsx)
- [src/components/IncidentFormDialog.tsx](../../src/components/IncidentFormDialog.tsx)
- [src/hooks/useGroupStudents.ts](../../src/hooks/useGroupStudents.ts)
- [src/app/api/groups/[groupId]/students/route.ts](../../src/app/api/groups/[groupId]/students/route.ts)
- [src/lib/incidents.test.ts](../../src/lib/incidents.test.ts)
