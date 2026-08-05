# Test Action

1. Read current-feature.md to understand what was implemented
2. Identify server actions and utility functions added/modified for this feature
3. Check if tests already exist for these functions
4. For functions without tests that have testable logic, write unit tests:
   - Create unit tests using Vitest
   - Focus on server actions and utilities (not components)
   - Test happy path and error cases
   - Do not write tests just to write them. Use your best judgement
5. Run `npm run test:integration` when the feature changes migrations, database constraints or relationships, RLS or grants, Auth, roles, authorization, integration fixtures or cleanup, or access to a new table. Also run it after Supabase/Vitest upgrades and before completing any database, Auth, authorization, or security-sensitive feature. Skip it for UI, styling, copy, or pure utility changes with no database or authorization effect
6. Run `npm test` to verify all tests pass
7. Report test coverage for the new feature code
