import {
  getApplicationErrorMessage,
  isApplicationError,
} from '@/lib/application-error';
import type { ActionResult } from '@/types/actions';

export const CRUD_ACTION_FAILURE_MESSAGE =
  'No se pudo completar la operación. Inténtalo de nuevo.';

export const mapApplicationErrorToActionResult = (
  error: unknown,
): ActionResult => {
  if (!isApplicationError(error)) {
    console.error('Unexpected CRUD Action failure:', error);

    return {
      success: false,
      error: CRUD_ACTION_FAILURE_MESSAGE,
    };
  }

  return {
    success: false,
    error: getApplicationErrorMessage(error.code),
  };
};
