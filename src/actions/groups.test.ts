import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createGroupAction,
  deleteGroupAction,
  updateGroupAction,
} from '@/actions/groups';
import { ApplicationError } from '@/lib/application-error';

const mocks = vi.hoisted(() => ({
  createGroup: vi.fn(),
  deleteGroup: vi.fn(),
  revalidatePath: vi.fn(),
  updateGroup: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock('@/lib/groups', () => ({
  createGroup: mocks.createGroup,
  deleteGroup: mocks.deleteGroup,
  updateGroup: mocks.updateGroup,
}));

const GROUP_ID = '22222222-2222-4222-8222-222222222222';
const GROUP_PATHS = ['/grupos', '/estudiantes', '/incidentes', '/dashboard'];

beforeEach(() => {
  vi.clearAllMocks();
});

describe('group Actions', () => {
  it('rejects invalid create input before calling the feature operation', async () => {
    await expect(createGroupAction({ name: ' ' })).resolves.toEqual({
      success: false,
      error: 'Revisa los campos marcados.',
      fieldErrors: { name: ['Este campo es obligatorio.'] },
    });
    expect(mocks.createGroup).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it('maps known feature failures to a safe Spanish result', async () => {
    mocks.updateGroup.mockRejectedValue(new ApplicationError('conflict'));

    await expect(
      updateGroupAction({ id: GROUP_ID, name: '1º A' }),
    ).resolves.toEqual({
      success: false,
      error:
        'No se pudo completar el cambio porque entra en conflicto con otros datos.',
    });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it('rejects an invalid update identifier before calling the feature operation', async () => {
    await expect(
      updateGroupAction({ id: 'invalid', name: '1º A' }),
    ).resolves.toEqual({
      success: false,
      error: 'Revisa los campos marcados.',
      fieldErrors: { id: ['Selecciona una opción válida.'] },
    });
    expect(mocks.updateGroup).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it('rejects an invalid delete identifier before calling the feature operation', async () => {
    await expect(deleteGroupAction({ id: 'invalid' })).resolves.toEqual({
      success: false,
      error: 'Revisa los campos marcados.',
      fieldErrors: { id: ['Selecciona una opción válida.'] },
    });
    expect(mocks.deleteGroup).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it('rethrows unexpected feature failures', async () => {
    const error = new Error('unexpected');
    mocks.deleteGroup.mockRejectedValue(error);

    await expect(deleteGroupAction({ id: GROUP_ID })).rejects.toThrow(error);
  });

  it.each([
    [
      'create',
      createGroupAction,
      { name: ' 1º A ' },
      mocks.createGroup,
      { name: '1º A' },
    ],
    [
      'update',
      updateGroupAction,
      { id: GROUP_ID, name: ' 1º B ' },
      mocks.updateGroup,
      { id: GROUP_ID, name: '1º B' },
    ],
    [
      'delete',
      deleteGroupAction,
      { id: GROUP_ID },
      mocks.deleteGroup,
      GROUP_ID,
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
      expect(mocks.revalidatePath).toHaveBeenCalledTimes(GROUP_PATHS.length);
      expect(mocks.revalidatePath.mock.calls.map(([path]) => path)).toEqual(
        GROUP_PATHS,
      );
    },
  );
});
