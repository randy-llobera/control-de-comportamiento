# Feature: Incident Filtering and CSV

## Status

Planned

## Goal

Use one filtered incident collection for both the visible list and CSV download, and serialize that collection correctly.

## Standards References

- `Architecture Contract > 4. UI components`
- `Architecture Contract > 14. Types and contracts`
- `Architecture Contract > 19. Testing contract`
- `Coding Standards > Core conventions > Database and code quality`

## Dependency

Complete Feature 11 first so the shared filtered collection has a stable owner.

## Required Data Flow

```text
initial incidents
  -> filterIncidents(initial incidents, active filters)
  -> filteredIncidents
     -> IncidentList
     -> CSV serializer
```

The export handler must receive/use the already derived `filteredIncidents` value. It must not call the filter function again or independently interpret filter state.

## Scope

- Add a pure incident filter function over mapped `IncidentListItem` contracts.
- Derive `filteredIncidents` once in `IncidentsView`, preserving source ordering.
- Pass that exact array to the list and CSV download path.
- Add a pure CSV serializer with Spanish headers and RFC-style escaping for commas, quotes, CR/LF, and empty values.
- Preserve UTF-8 output and `incidentes-YYYYMMDD.csv` naming.
- Keep only Blob/object URL/anchor download mechanics in the Client Component and revoke the created object URL.
- Use mapped student, group, category, severity, description, teacher, and date display data already present in each list item.

## Out of Scope

- Server-generated files, Route Handlers, new filters, pagination, sorting changes, or spreadsheet libraries.
- Fetching extra data during export.
- Re-filtering or re-querying when the export button is clicked.

## Implementation Steps

1. Define typed incident filter criteria and extract the existing filter semantics into one pure function.
2. Derive `filteredIncidents` once from initial incidents and active filters.
3. Render `IncidentList` from that value.
4. Serialize that same value when download is requested.
5. Escape embedded quotes by doubling them and quote fields consistently.
6. Add deterministic filename/serializer/filter tests.
7. Compare visible rows and CSV rows for every filter combination.

## Risks

- A second filter call can drift from the visible list and violates this feature's main invariant.
- Incorrect escaping can corrupt descriptions containing quotes, commas, or newlines.
- Looking up related records during export can reintroduce N+1 work or mismatched data.

## Tests

- No filters exports every visible incident in the same order.
- Category, severity, group, and date filters export exactly the visible rows.
- Combined filters and an empty result export the same collection shown on screen.
- Quotes, commas, CR/LF, accented characters, and empty values serialize correctly.
- Filename uses the required date format.

## Done Checklist

- [ ] One `filteredIncidents` value feeds both list and export.
- [ ] Export performs no filtering, querying, or related-record lookup.
- [ ] CSV escaping and UTF-8 output meet the stated rules.
- [ ] Object URLs are cleaned up after download.
- [ ] Unit tests and all repository/browser checks pass.

