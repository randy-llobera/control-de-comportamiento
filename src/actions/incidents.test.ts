import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createIncidentAction,
  deleteIncidentAction,
  updateIncidentAction,
} from '@/actions/incidents';
import { ApplicationError } from '@/lib/application-error';

const mocks = vi.hoisted(() => ({
  createIncident: vi.fn(),
  deleteIncident: vi.fn(),
  revalidatePath: vi.fn(),
  updateIncident: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock('@/lib/incidents', () => ({
  createIncident: mocks.createIncident,
  deleteIncident: mocks.deleteIncident,
  updateIncident: mocks.updateIncident,
}));

const INCIDENT_ID = '22222222-2222-4222-8222-222222222222';
const STUDENT_ID = '33333333-3333-4333-8333-333333333333';
const CATEGORY_ID = '44444444-4444-4444-8444-444444444444';
const INCIDENT_PATHS = ['/incidentes', '/dashboard'];

const createInput = {
  studentId: STUDENT_ID,
  categoryId: CATEGORY_ID,
  severity: 'high' as const,
  description: 'Interrumpió la clase',
  date: '2026-07-27',
};

const updateInput = {
  id: INCIDENT_ID,
  categoryId: CATEGORY_ID,
  severity: 'medium' as const,
  description: 'Llegó tarde',
  date: '2026-07-28',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('incident Actions', () => {
  it('rejects invalid create input before calling the feature operation', async () => {
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

  it('rejects invalid update and delete identifiers', async () => {
    await expect(
      updateIncidentAction({ ...updateInput, id: 'invalid' }),
    ).resolves.toMatchObject({
      success: false,
      fieldErrors: { id: ['Selecciona una opción válida.'] },
    });
    await expect(deleteIncidentAction({ id: 'invalid' })).resolves.toMatchObject(
      {
        success: false,
        fieldErrors: { id: ['Selecciona una opción válida.'] },
      },
    );
    expect(mocks.updateIncident).not.toHaveBeenCalled();
    expect(mocks.deleteIncident).not.toHaveBeenCalled();
  });

  it('returns one field error for a missing date', async () => {
    await expect(
      createIncidentAction({ ...createInput, date: '' }),
    ).resolves.toMatchObject({
      success: false,
      fieldErrors: { date: ['Introduce una fecha válida.'] },
    });
    expect(mocks.createIncident).not.toHaveBeenCalled();
  });

  it('maps forbidden incident management to a safe result', async () => {
    mocks.updateIncident.mockRejectedValue(new ApplicationError('forbidden'));

    await expect(updateIncidentAction(updateInput)).resolves.toEqual({
      success: false,
      error: 'No autorizado.',
    });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it('maps missing incidents to a safe result', async () => {
    mocks.deleteIncident.mockRejectedValue(new ApplicationError('not-found'));

    await expect(
      deleteIncidentAction({ id: INCIDENT_ID }),
    ).resolves.toEqual({
      success: false,
      error: 'No se encontró el recurso solicitado.',
    });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it('strips untrusted identity fields from update input', async () => {
    mocks.updateIncident.mockResolvedValue(undefined);

    await expect(
      updateIncidentAction({
        ...updateInput,
        description: '  Llegó tarde  ',
        studentId: STUDENT_ID,
        teacherId: 'untrusted-teacher',
        role: 'admin',
        canManage: true,
      }),
    ).resolves.toEqual({ success: true, data: undefined });
    expect(mocks.updateIncident).toHaveBeenCalledWith({
      ...updateInput,
      description: 'Llegó tarde',
    });
  });

  it.each([
    ['create', createIncidentAction, createInput, mocks.createIncident, createInput],
    ['update', updateIncidentAction, updateInput, mocks.updateIncident, updateInput],
    [
      'delete',
      deleteIncidentAction,
      { id: INCIDENT_ID },
      mocks.deleteIncident,
      INCIDENT_ID,
    ],
  ] as const)(
    'invalidates affected routes after a successful %s',
    async (
      _operation,
      action,
      input,
      featureOperation,
      expectedFeatureInput,
    ) => {
      featureOperation.mockResolvedValue(undefined);

      await expect(action(input)).resolves.toEqual({
        success: true,
        data: undefined,
      });
      expect(featureOperation).toHaveBeenCalledWith(expectedFeatureInput);
      expect(mocks.revalidatePath.mock.calls.map(([path]) => path)).toEqual(
        INCIDENT_PATHS,
      );
    },
  );

  it('rethrows unexpected feature failures', async () => {
    const error = new Error('unexpected');
    mocks.createIncident.mockRejectedValue(error);

    await expect(createIncidentAction(createInput)).rejects.toThrow(error);
  });
});
