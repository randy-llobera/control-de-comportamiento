export type ApplicationErrorCode =
  'unauthenticated' | 'forbidden' | 'not-found' | 'conflict';

export type AuthErrorCode = 'auth-failed';

const APPLICATION_ERROR_MESSAGES = {
  unauthenticated: 'Inicia sesión para continuar.',
  forbidden: 'No autorizado.',
  'not-found': 'No se encontró el recurso solicitado.',
  conflict:
    'No se pudo completar el cambio porque entra en conflicto con otros datos.',
} as const satisfies Record<ApplicationErrorCode, string>;

const AUTH_ERROR_MESSAGES = {
  'auth-failed': 'No se pudo completar la autenticación. Inténtalo de nuevo.',
} as const satisfies Record<AuthErrorCode, string>;

export class ApplicationError extends Error {
  constructor(readonly code: ApplicationErrorCode) {
    super(code);
    this.name = 'ApplicationError';
  }
}

export const isApplicationError = (error: unknown): error is ApplicationError =>
  error instanceof ApplicationError;

export const getApplicationErrorMessage = (
  code: ApplicationErrorCode,
): string => APPLICATION_ERROR_MESSAGES[code];

export class AuthApplicationError extends Error {
  constructor(readonly code: AuthErrorCode) {
    super(code);
    this.name = 'AuthApplicationError';
  }
}

export const isAuthApplicationError = (
  error: unknown,
): error is AuthApplicationError => error instanceof AuthApplicationError;

export const getAuthErrorMessage = (code: AuthErrorCode): string =>
  AUTH_ERROR_MESSAGES[code];
