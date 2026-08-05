import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createStudentAction,
  deleteStudentAction,
  updateStudentAction,
} from '@/actions/students';
import { ApplicationError } from '@/lib/application-error';

const mocks = vi.hoisted(() => ({
  createStudent: vi.fn(),
  deleteStudent: vi.fn(),
  revalidatePath: vi.fn(),
  updateStudent: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock('@/lib/students', () => ({
  createStudent: mocks.createStudent,
  deleteStudent: mocks.deleteStudent,
  updateStudent: mocks.updateStudent,
}));

const STUDENT_ID = '22222222-2222-4222-8222-222222222222';
const GROUP_ID = '33333333-3333-4333-8333-333333333333';
const STUDENT_PATHS = ['/estudiantes', '/incidentes', '/dashboard'];

beforeEach(() => {
  vi.clearAllMocks();
});

describe('student Actions', () => {
  it('rejects invalid create input before calling the feature operation', async () => {
    await expect(
      createStudentAction({ name: ' ', groupId: 'invalid' }),
    ).resolves.toEqual({
      success: false,
      error: 'Revisa los campos marcados.',
      fieldErrors: {
        name: ['Este campo es obligatorio.'],
        groupId: ['Selecciona una opción válida.'],
      },
    });
    expect(mocks.createStudent).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it('maps direct forbidden update calls to a safe result', async () => {
    mocks.updateStudent.mockRejectedValue(new ApplicationError('forbidden'));

    await expect(
      updateStudentAction({
        id: STUDENT_ID,
        name: 'Ada',
        groupId: GROUP_ID,
      }),
    ).resolves.toEqual({
      success: false,
      error: 'No autorizado.',
    });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it('maps referenced deletion to a safe conflict result', async () => {
    mocks.deleteStudent.mockRejectedValue(new ApplicationError('conflict'));

    await expect(deleteStudentAction({ id: STUDENT_ID })).resolves.toEqual({
      success: false,
      error:
        'No se pudo completar el cambio porque entra en conflicto con otros datos.',
    });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it('rejects invalid update and delete identifiers', async () => {
    await expect(
      updateStudentAction({
        id: 'invalid',
        name: 'Ada',
        groupId: GROUP_ID,
      }),
    ).resolves.toMatchObject({
      success: false,
      fieldErrors: { id: ['Selecciona una opción válida.'] },
    });
    await expect(deleteStudentAction({ id: 'invalid' })).resolves.toMatchObject(
      {
        success: false,
        fieldErrors: { id: ['Selecciona una opción válida.'] },
      },
    );
    expect(mocks.updateStudent).not.toHaveBeenCalled();
    expect(mocks.deleteStudent).not.toHaveBeenCalled();
  });

  it('rethrows unexpected feature failures', async () => {
    const error = new Error('unexpected');
    mocks.createStudent.mockRejectedValue(error);

    await expect(
      createStudentAction({ name: 'Ada', groupId: GROUP_ID }),
    ).rejects.toThrow(error);
  });

  it.each([
    [
      'create',
      createStudentAction,
      { name: ' Ada ', groupId: GROUP_ID },
      mocks.createStudent,
      { name: 'Ada', groupId: GROUP_ID },
    ],
    [
      'update',
      updateStudentAction,
      { id: STUDENT_ID, name: ' Grace ', groupId: GROUP_ID },
      mocks.updateStudent,
      { id: STUDENT_ID, name: 'Grace', groupId: GROUP_ID },
    ],
    [
      'delete',
      deleteStudentAction,
      { id: STUDENT_ID },
      mocks.deleteStudent,
      STUDENT_ID,
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
      expect(mocks.revalidatePath).toHaveBeenCalledTimes(STUDENT_PATHS.length);
      expect(mocks.revalidatePath.mock.calls.map(([path]) => path)).toEqual(
        STUDENT_PATHS,
      );
    },
  );
});
