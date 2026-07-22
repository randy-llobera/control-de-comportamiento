# Feature: Vitest Foundation

## Status

Planned

## Goal

Introduce the smallest test setup needed to verify server-boundary and pure feature behavior throughout the remaining refactor.

## Standards References

- `Architecture Contract > 19. Testing contract`
- `Coding Standards > Core conventions > Database and code quality`

## Dependency

Complete Feature 03 first so the initial tests target stable shared contracts.

## Scope

- Add the current compatible Vitest version as a planned development dependency.
- Add `test` and `test:watch` scripts.
- Configure a Node test environment, TypeScript path aliases, and `*.test.ts` discovery.
- Co-locate focused tests with server/pure modules unless a concrete need for a separate test tree appears.
- Add initial tests for known application-error and Action-boundary mapping behavior.

## Out of Scope

- Component tests, jsdom, Testing Library, browser automation, snapshots, or coverage thresholds.
- Supabase integration/RLS tests; those belong to Feature 16.
- Tests that only assert TypeScript types at runtime.

## Implementation Steps

1. Use Context7 to confirm current Vitest configuration for TypeScript path aliases and Node environments.
2. Install Vitest and update the lockfile.
3. Add minimal configuration and npm scripts.
4. Add tests for every runtime branch introduced in Feature 03.
5. Confirm `npm test` exits successfully and fails for an intentional local assertion change before reverting that change.
6. Run all repository checks.

## Risks

- A configuration that silently finds no tests gives false confidence.
- Importing Next.js server modules can require isolating pure boundary mapping from framework calls.
- Adding browser tooling would expand scope without current value.

## Tests

- Known application errors map to their safe Spanish Action failures.
- Unknown errors are rethrown or left unmapped as designed.
- `npm test` discovers and executes the new tests in Node.

## Done Checklist

- [ ] Vitest is a development dependency with a lockfile update.
- [ ] `npm test` and `npm run test:watch` are defined.
- [ ] Test discovery cannot pass with zero tests.
- [ ] Initial shared-boundary tests pass.
- [ ] No component/browser test dependency was added.
- [ ] `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build` pass.
