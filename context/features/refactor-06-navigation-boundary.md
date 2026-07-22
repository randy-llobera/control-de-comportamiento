# Feature: Navigation Boundary

## Status

Planned

## Goal

Make navigation consume a neutral current-user contract and reduce the component to navigation rendering and responsive interaction.

## Standards References

- `Coding Standards > Core conventions > React and Next.js`
- `Coding Standards > Core conventions > Naming and styling`
- `Architecture Contract > 4. UI components`
- `Architecture Contract > 13. Authentication and authorization`
- `Architecture Contract > 14. Types and contracts`

## Dependency

Complete Feature 05 first so navigation can reuse the stable user/actor contract.

## Scope

- Replace `UserWithRole`/generated database dependencies with a serializable current-user contract.
- Derive permitted navigation items from the trusted server-provided role.
- Keep responsive sidebar state in the Client Component.
- Extract shared account/navigation markup only where mobile and desktop variants have the same responsibility.
- Preserve current URLs, Spanish labels, role visibility, and sign-out behavior until Feature 14 replaces it with a Server Action.
- Use English component and identifier names.

## Out of Scope

- Changing route authorization or adding navigation items.
- Moving Auth to Server Actions; that is Feature 14.
- Introducing a navigation store or component library.

## Implementation Steps

1. Define/reuse the neutral current-user role contract from the server auth/users layer.
2. Update the protected layout and Navigation props.
3. Move immutable navigation definitions outside render and derive role-visible items clearly.
4. Extract only genuine repeated account/link presentation.
5. Preserve mobile open/close behavior and keyboard-accessible controls.
6. Verify navigation for teacher, coordinator, and admin roles.

## Risks

- Hiding a link is UX only; layouts, feature operations, and RLS remain authoritative.
- Over-extraction could make a small navigation harder to follow.
- Sign-out remains a temporary browser-client consumer until Feature 14.

## Tests

- Teacher sees only incidents and students.
- Coordinator also sees groups, categories, and dashboard.
- Admin also sees users.
- Mobile sidebar opens, closes, and closes after navigation.

## Done Checklist

- [ ] Navigation imports no generated/database row type.
- [ ] Navigation items match the role model exactly.
- [ ] Responsive state remains local.
- [ ] No new state dependency or security assumption was introduced.
- [ ] `npm test`, lint, typecheck, build, and browser role checks pass.

