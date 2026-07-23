export type ApplicationErrorCode =
  'unauthenticated' | 'forbidden' | 'not-found' | 'conflict';

const APPLICATION_ERROR_MESSAGES = {
  unauthenticated: 'Inicia sesión para continuar.',
  forbidden: 'No autorizado.',
  'not-found': 'No se encontró el recurso solicitado.',
  conflict:
    'No se pudo completar el cambio porque entra en conflicto con otros datos.',
} as const satisfies Record<ApplicationErrorCode, string>;

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
