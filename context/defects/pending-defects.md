# Pending Defects

Internal record of confirmed deviations from the [product contract](../project-overview.md) or [engineering rules](../coding-standards.md). Preserve intended behavior in those guides; keep reproduction evidence and corrective work here until resolved.

## P2 - Medium

### DEF-001 - CSV exports do not neutralize spreadsheet formulas

- **Confirmed:** 2026-08-06
- **Location:** `src/utils/incidents.ts` (`escapeCsvField`, `serializeIncidentsToCsv`)
- **Evidence:** Every field is quoted and embedded quotes are escaped, which fixes malformed CSV output, but user-controlled values beginning with `=`, `+`, `-`, or `@` remain executable formulas when a spreadsheet opens the export. Existing tests cover CSV syntax and UTF-8 encoding but not formula neutralization.
- **Impact:** An authenticated user can place a formula in exported incident data and target another user who opens the CSV in spreadsheet software.
- **Action:** Choose the spreadsheet-oriented neutralization strategy, apply it before CSV quoting, and add focused tests for formula prefixes without weakening the current escaping behavior. See the [OWASP CSV Injection guidance](https://owasp.org/www-community/attacks/CSV_Injection).

### DEF-002 - Unexpected CRUD failures bypass user-facing feedback

- **Confirmed:** 2026-08-06
- **Location:** `src/actions/application-error-result.ts` and CRUD Server Actions/components
- **Evidence:** Feature modules now check Supabase errors, and known application errors reach inline alerts. However, `mapApplicationErrorToActionResult` rethrows every non-`ApplicationError`, including raw Supabase failures, while the app has no route error boundary. CRUD components only render failures returned as `ActionResult` values.
- **Impact:** Network, provider, or unexpected database failures can reject a Server Action without giving the user the safe Spanish feedback required by the project.
- **Action:** Add a shared, non-sensitive user-facing fallback for unexpected read and mutation failures while retaining detailed server-side logging. Expose mutation failures through the notification policy tracked by `TASK-006`, and add focused coverage for the chosen boundary behavior.
