import {
  getApplicationErrorMessage,
  isApplicationError,
} from '@/lib/application-error';
import type { ActionResult } from '@/types/actions';

export const mapApplicationErrorToActionResult = (
  error: unknown,
): ActionResult => {
  if (!isApplicationError(error)) {
    throw error;
  }

  return {
    success: false,
    error: getApplicationErrorMessage(error.code),
  };
};
