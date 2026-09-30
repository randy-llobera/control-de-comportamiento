# Feature: Incident Filtering and CSV

## Status

Complete

## Historical outcome

Extracted pure filtering and CSV serialization and passed the same derived incident collection to both the list and export.

Kept quoting, encoding, and filename construction in utilities, and browser download/object-URL cleanup in the view. Export did not add another query or filtering pass.

## Evidence and maintained implementation

[Recorded completion](../current-feature.md#history); source links below.

- [src/utils/incidents.ts](../../src/utils/incidents.ts)
- [src/utils/incidents.test.ts](../../src/utils/incidents.test.ts)
- [src/components/IncidentsView.tsx](../../src/components/IncidentsView.tsx)
