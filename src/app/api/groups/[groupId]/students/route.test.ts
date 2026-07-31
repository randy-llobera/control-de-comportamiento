import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GET } from '@/app/api/groups/[groupId]/students/route';
import { ApplicationError } from '@/lib/application-error';

const mocks = vi.hoisted(() => ({
  getGroupStudents: vi.fn(),
}));

vi.mock('@/lib/students', () => ({
  getGroupStudents: mocks.getGroupStudents,
}));

const GROUP_ID = '44444444-4444-4444-8444-444444444444';
const STUDENT_ID = '22222222-2222-4222-8222-222222222222';

const callGet = (groupId: string) =>
  GET(new Request(`http://localhost/api/groups/${groupId}/students`), {
    params: Promise.resolve({ groupId }),
  });

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET group students', () => {
  it('rejects an invalid group identifier', async () => {
    const response = await callGet('invalid');

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: 'Identificador de grupo inválido.',
    });
    expect(mocks.getGroupStudents).not.toHaveBeenCalled();
  });

  it('returns mapped students for the selected group', async () => {
    mocks.getGroupStudents.mockResolvedValue([
      { id: STUDENT_ID, name: 'Ada' },
    ]);

    const response = await callGet(GROUP_ID);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([
      { id: STUDENT_ID, name: 'Ada' },
    ]);
    expect(mocks.getGroupStudents).toHaveBeenCalledWith(GROUP_ID);
  });

  it.each([
    ['unauthenticated', 401, 'Inicia sesión para continuar.'],
    ['forbidden', 403, 'No autorizado.'],
    ['not-found', 404, 'No se encontró el recurso solicitado.'],
  ] as const)(
    'maps %s application errors to HTTP %s',
    async (code, status, message) => {
      mocks.getGroupStudents.mockRejectedValue(
        new ApplicationError(code),
      );

      const response = await callGet(GROUP_ID);

      expect(response.status).toBe(status);
      await expect(response.json()).resolves.toEqual({
        error: message,
      });
    },
  );

  it('returns a safe response for unexpected failures', async () => {
    mocks.getGroupStudents.mockRejectedValue(new Error('unexpected'));

    const response = await callGet(GROUP_ID);

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: 'No se pudieron cargar los estudiantes. Inténtalo de nuevo.',
    });
  });
});
