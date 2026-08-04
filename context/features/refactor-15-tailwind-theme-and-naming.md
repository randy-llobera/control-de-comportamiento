# Feature: Tailwind Theme and Naming

## Status

Planned

## Goal

Finish code/file naming alignment and establish CSS-first Tailwind theme tokens without changing product behavior or visual intent.

## Standards References (`/context/coding-standards.md`)

- `Coding Standards > Core conventions > Tailwind CSS v4`
- `Coding Standards > Core conventions > Naming and styling`
- `Coding Standards > Core conventions > Database and code quality`
- `Architecture Contract > 2. Folder structure`
- `Architecture Contract > 4. UI components`

## Dependency

Complete Feature 14 first so structural migrations and browser-client consumer removal are finished.

## Scope

- Define the small set of shared background, surface, text, border, primary, success, and danger tokens in root `globals.css` using Tailwind v4 `@theme` and CSS custom properties.
- Map tokens to the current palette so this remains a consistency refactor, not a redesign.
- Replace repeated semantic color utilities where the token clearly represents the existing intent.
- Apply the approved UI follow-up: narrow the signed-out content, keep protected navigation viewport-height with account/logout controls pinned to the bottom, and replace the blue focus ring with a neutral ring.
- Audit all implementation identifiers for English while preserving Spanish URLs and visible text.
- Enforce PascalCase for application-owned component filenames, camelCase hook filenames beginning with `use`, kebab-case for other non-component files, and type-only component contract imports.
- Preserve the generated filenames and import paths of shadcn primitives under `src/components/ui`; do not rename those files to PascalCase.
- Rename the unused browser client module to `supabase-browser.ts` to make its optional scope explicit, while preserving its implementation and zero consumers.
- Remove obsolete `types/database.ts`, `actions/mutations.ts`, comments, imports, or variables only when no consumers remain.

## Out of Scope

- Visual redesign, new components, dark mode, shadcn installation, or a JavaScript Tailwind config.
- Other spacing, layout, typography scale, route, label, or application behavior changes beyond the approved UI follow-up.
- Creating component feature folders.

## Implementation Steps

1. Inventory the remaining names, files, imports, repeated semantic colors, and obsolete modules.
2. Define tokens from the current palette in the root stylesheet.
3. Replace only clear semantic color usages and compare rendered pages before/after.
4. Complete English identifier and filename fixes without changing Spanish routes/content.
5. Rename the unused browser module and verify it still has no imports.
6. Delete only proven-unreferenced legacy type/action modules.
7. Run all tests/checks and browser visual checks at mobile and desktop widths.

## Risks

- Token replacement can alter contrast or state colors if mappings are too broad.
- Filename casing changes can pass locally but fail on case-sensitive systems.
- Removing a legacy module requires repository-wide reference verification.

## Tests

- Every route renders with the same layout, states, and readable contrast.
- Active, hover, disabled, success, and error states retain their meaning.
- At 390px, protected content keeps the full available width below the mobile header, the drawer fills the viewport height, and its account/logout footer remains pinned to the bottom without overlap.
- At desktop widths, the sidebar fills the viewport height and its account/logout footer remains pinned to the bottom.
- The signed-out content has mobile side gutters, and keyboard focus uses a neutral visible ring rather than blue.
- Repository search finds no Spanish implementation identifiers covered by the standard, invalid application-owned filename pattern, or value import used only as a type. Generated shadcn primitive filenames are excluded from the PascalCase audit.
- Browser-client module exists under its explicit name and has no consumers.

## Done Checklist

- [ ] Root CSS defines shared theme tokens through CSS-first Tailwind configuration.
- [ ] No JavaScript Tailwind configuration was added.
- [ ] Code is English while public URLs/content remain Spanish.
- [ ] Application-owned component files use PascalCase while generated shadcn primitives retain their CLI filenames and import paths.
- [ ] Obsolete legacy modules are removed only after zero-reference checks.
- [ ] Tests, lint, typecheck, build, and responsive browser checks pass.
