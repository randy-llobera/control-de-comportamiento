import { describe, expect, it } from 'vitest';

import { isValidRole, USER_ROLE_NAMES } from '@/types/users';

describe('isValidRole', () => {
  it.each(USER_ROLE_NAMES)('accepts the supported %s role', (role) => {
    expect(isValidRole(role)).toBe(true);
  });

  it.each(['principal', '', 'ADMIN'])('rejects the unsupported %j role', (role) => {
    expect(isValidRole(role)).toBe(false);
  });
});
