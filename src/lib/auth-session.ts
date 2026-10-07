import {
  isAuthApiError,
  isAuthSessionMissingError,
} from '@supabase/supabase-js';

const INVALID_SESSION_CODES = new Set([
  'refresh_token_already_used',
  'refresh_token_not_found',
  'session_expired',
  'user_not_found',
]);

export const isInvalidSessionError = (error: unknown): boolean =>
  isAuthSessionMissingError(error) ||
  (isAuthApiError(error) &&
    typeof error.code === 'string' &&
    INVALID_SESSION_CODES.has(error.code));
