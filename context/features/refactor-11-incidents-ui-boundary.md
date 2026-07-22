# Feature: Incidents UI Boundary

## Status

Planned

## Goal

Split the large incident Client Component into focused visible responsibilities without changing behavior or data flow.

## Standards References

- `Coding Standards > Core conventions > React and Next.js`
- `Coding Standards > Core conventions > Naming and styling`
- `Architecture Contract > 4. UI components`
- `Architecture Contract > 14. Types and contracts`

## Dependency

Complete Feature 10 first.

## Scope

- Keep `IncidentsView` as the coordinator for filters, form visibility, and the shared filtered collection.
- Extract `IncidentFilters` for filter controls.
- Extract `CreateIncidentForm` for form state, Action submission, and field/general errors.
- Extract `IncidentList` for the visible ordered rows/cards and empty state.
- Pass neutral feature contracts through typed props.
- Preserve Spanish labels, filters, form behavior, ordering, responsive layout, and accessibility.
- Use ordinary React state and transitions only.

## Out of Scope

- Changing queries, Actions, contracts, filtering semantics, or CSV serialization.
- Zustand, TanStack Query, form libraries, or a component folder hierarchy.
- Visual redesign or shadcn installation.

## Implementation Steps

1. Identify the existing state ownership and prop boundaries before moving JSX.
2. Extract the filter controls without duplicating filter state.
3. Extract the create form with its own form-specific state and errors.
4. Extract the list as a pure rendering component over the supplied visible incidents.
5. Keep `IncidentsView` responsible for deriving and sharing the visible collection.
6. Remove obsolete comments/functions and use English identifiers.
7. Run checks and compare the complete UI flow before/after in the browser.

## Risks

- Duplicating state across children can make filters or form reset behavior inconsistent.
- A broad visual rewrite would obscure regressions in a structural feature.
- The filtered collection must have one owner in preparation for Feature 12.

## Tests

- Every filter still changes the visible list identically.
- Form open, cancel, submit, validation, and reset behavior is unchanged.
- Empty and populated list states render correctly.
- No extracted component queries Supabase or owns server state.

## Done Checklist

- [ ] Each component has one visible responsibility.
- [ ] `IncidentsView` owns the shared filter state and visible collection.
- [ ] No state/cache/form dependency was added.
- [ ] Existing Spanish UX and behavior are preserved.
- [ ] Tests and all repository/browser checks pass.

