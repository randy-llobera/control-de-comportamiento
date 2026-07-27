import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createIncidentAction } from '@/actions/incidents';
import { ApplicationError } from '@/lib/application-error';

const mocks = vi.hoisted(() => ({
  createIncident: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock('@/lib/incidents', () => ({
  createIncident: mocks.createIncident,
}));

const STUDENT_ID = '33333333-3333-4333-8333-333333333333';
const CATEGORY_ID = '44444444-4444-4444-8444-444444444444';
const INCIDENT_PATHS = ['/incidentes', '/dashboard'];

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createIncidentAction', () => {
  it('rejects invalid structural input before calling the feature operation', async () => {
    await expect(
      createIncidentAction({
        studentId: 'invalid',
        categoryId: '',
        severity: 'critical',
        description: ' ',
        date: '2026-02-30',
      }),
    ).resolves.toEqual({
      success: false,
      error: 'Revisa los campos marcados.',
      fieldErrors: {
        studentId: ['Selecciona una opción válida.'],
        categoryId: ['Selecciona una opción válida.'],
        severity: ['Selecciona una gravedad válida.'],
        description: ['Este campo es obligatorio.'],
        date: ['Introduce una fecha válida.'],
      },
    });
    expect(mocks.createIncident).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it('maps missing referenced records to a safe result', async () => {
    mocks.createIncident.mockRejectedValue(new ApplicationError('not-found'));

    await expect(
      createIncidentAction({
        studentId: STUDENT_ID,
        categoryId: CATEGORY_ID,
        severity: 'low',
        description: 'Llegó tarde',
        date: '2026-07-27',
      }),
    ).resolves.toEqual({
      success: false,
      error: 'No se encontró el recurso solicitado.',
    });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it('derives the accepted contract and invalidates affected routes', async () => {
    mocks.createIncident.mockResolvedValue(undefined);

    await expect(
      createIncidentAction({
        studentId: STUDENT_ID,
        categoryId: CATEGORY_ID,
        severity: 'high',
        description: '  Interrumpió la clase  ',
        date: '2026-07-27',
        teacherId: 'untrusted-id',
      }),
    ).resolves.toEqual({
      success: true,
      data: undefined,
    });
    expect(mocks.createIncident).toHaveBeenCalledWith({
      studentId: STUDENT_ID,
      categoryId: CATEGORY_ID,
      severity: 'high',
      description: 'Interrumpió la clase',
      date: '2026-07-27',
    });
    expect(mocks.revalidatePath.mock.calls.map(([path]) => path)).toEqual(
      INCIDENT_PATHS,
    );
  });

  it('rethrows unexpected feature failures', async () => {
    const error = new Error('unexpected');
    mocks.createIncident.mockRejectedValue(error);

    await expect(
      createIncidentAction({
        studentId: STUDENT_ID,
        categoryId: CATEGORY_ID,
        severity: 'medium',
        description: 'Llegó tarde',
        date: '2026-07-27',
      }),
    ).rejects.toThrow(error);
  });
});
