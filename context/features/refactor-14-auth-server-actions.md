# Feature: Auth Server Actions

## Status

Complete

## Historical outcome

Moved login, signup, and logout behind validated Actions, with focused Auth forms, safe Spanish provider failures, and the shared toaster.

Preserved email-confirmation semantics and redirect outcomes. No OAuth, password reset, MFA, persistent notifications, or browser-client deletion was included.

## Evidence and maintained implementation

[Recorded completion](../current-feature.md#history); source links below.

- [src/actions/auth.ts](../../src/actions/auth.ts)
- [src/lib/auth.ts](../../src/lib/auth.ts)
- [src/components/AuthView.tsx](../../src/components/AuthView.tsx)
- [src/components/ui/toast.tsx](../../src/components/ui/toast.tsx)
- [src/actions/auth.test.ts](../../src/actions/auth.test.ts)
