# Feature: Dashboard Feature Boundary

## Status

Complete

## Historical outcome

Moved dashboard authorization, joined reads, aggregation, mapping, and recent ordering into a server feature and made the page a Server Component.

Kept aggregation local to the feature, with focused tests, rather than adding a generic analytics layer or charts. Shared date formatting preserves ISO form/storage values and formatted displays/exports.

## Evidence and maintained implementation

[Recorded completion](../current-feature.md#history); source links below.

- [src/lib/dashboard.ts](../../src/lib/dashboard.ts)
- [src/lib/dashboard.test.ts](../../src/lib/dashboard.test.ts)
- [src/types/dashboard.ts](../../src/types/dashboard.ts)
- [src/utils/date.ts](../../src/utils/date.ts)
- [src/app/(protected)/(coordinator)/dashboard/page.tsx](../../src/app/%28protected%29/%28coordinator%29/dashboard/page.tsx)
