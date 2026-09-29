# Feature: Categories Feature Boundary

## Status

Complete

## Historical outcome

Moved category reads/writes and conflict handling into a server feature with a server-rendered page and focused dialogs.

Reused shadcn primitives and the established boundary pattern without combining group/category behavior into a generic repository.

## Evidence and maintained implementation

[Recorded completion](../current-feature.md#history); source links below.

- [src/lib/categories.ts](../../src/lib/categories.ts)
- [src/actions/categories.ts](../../src/actions/categories.ts)
- [src/types/categories.ts](../../src/types/categories.ts)
- [src/components/CategoriesView.tsx](../../src/components/CategoriesView.tsx)
- [src/lib/categories.test.ts](../../src/lib/categories.test.ts)
