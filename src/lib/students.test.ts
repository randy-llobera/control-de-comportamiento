import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApplicationError } from '@/lib/application-error';
import {
  createStudent,
  deleteStudent,
  getStudentPageData,
  updateStudent,
} from '@/lib/students';

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  requirePermission: vi.fn(),
}));

vi.mock('@/lib/supabase-server', () => ({
  createClient: mocks.createClient,
}));

vi.mock('@/lib/auth', () => ({
  requirePermission: mocks.requirePermission,
}));

const STUDENT_ID = '22222222-2222-4222-8222-222222222222';
const OTHER_STUDENT_ID = '33333333-3333-4333-8333-333333333333';
const GROUP_ID = '44444444-4444-4444-8444-444444444444';

const setActorRole = (role: 'admin' | 'coordinator' | 'teacher') => {
  mocks.requirePermission.mockResolvedValue({
    id: '11111111-1111-4111-8111-111111111111',
    displayName: 'Ada Lovelace',
    schoolRole: 'Tecnología',
    role,
  });
};

const groupValidationResult = (
  data: { id: string } | null = { id: GROUP_ID },
) => ({
  select: vi.fn(() => ({
    eq: vi.fn(() => ({
      maybeSingle: vi.fn().mockResolvedValue({ data, error: null }),
    })),
  })),
});

const studentAvailabilityResult = (data: { id: string } | null = null) => ({
  select: vi.fn(() => ({
    eq: vi.fn(() => ({
      eq: vi.fn(() => ({
        maybeSingle: vi.fn().mockResolvedValue({ data, error: null }),
        neq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({ data, error: null }),
        })),
      })),
    })),
  })),
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getStudentPageData', () => {
  it.each([
    ['teacher', false],
    ['coordinator', false],
    ['admin', true],
  ] as const)(
    'maps page data and capabilities for %s',
    async (role, canManageStudents) => {
      setActorRole(role);
      const studentsOrder = vi.fn().mockResolvedValue({
        data: [
          {
            id: STUDENT_ID,
            name: 'Ada',
            group_id: GROUP_ID,
            groups: { name: '1º A' },
          },
        ],
        error: null,
      });
      const groupsOrder = vi.fn().mockResolvedValue({
        data: [{ id: GROUP_ID, name: '1º A' }],
        error: null,
      });
      const from = vi
        .fn()
        .mockReturnValueOnce({
          select: vi.fn(() => ({ order: studentsOrder })),
        })
        .mockReturnValueOnce({
          select: vi.fn(() => ({ order: groupsOrder })),
        });
      mocks.createClient.mockResolvedValue({ from });

      await expect(getStudentPageData()).resolves.toEqual({
        students: [
          {
            id: STUDENT_ID,
            name: 'Ada',
            group: { id: GROUP_ID, name: '1º A' },
          },
        ],
        groupOptions: [{ id: GROUP_ID, name: '1º A' }],
        canManageStudents,
      });
      expect(mocks.requirePermission).toHaveBeenCalledWith(
        expect.objectContaining({ from }),
        'students:read',
      );
    },
  );

  it('rejects unauthenticated reads before querying students', async () => {
    mocks.requirePermission.mockRejectedValue(
      new ApplicationError('unauthenticated'),
    );
    const from = vi.fn();
    mocks.createClient.mockResolvedValue({ from });

    await expect(getStudentPageData()).rejects.toEqual(
      new ApplicationError('unauthenticated'),
    );
    expect(from).not.toHaveBeenCalled();
  });
});

describe('createStudent', () => {
  it.each(['teacher', 'coordinator', 'admin'] as const)(
    'allows %s to create a student with an existing group',
    async (role) => {
      setActorRole(role);
      const insert = vi.fn().mockResolvedValue({ error: null });
      const from = vi
        .fn()
        .mockReturnValueOnce(groupValidationResult())
        .mockReturnValueOnce(studentAvailabilityResult())
        .mockReturnValueOnce({ insert });
      mocks.createClient.mockResolvedValue({ from });

      await expect(
        createStudent({ name: 'Ada', groupId: GROUP_ID }),
      ).resolves.toBeUndefined();
      expect(mocks.requirePermission).toHaveBeenCalledWith(
        expect.objectContaining({ from }),
        'students:create',
      );
      expect(insert).toHaveBeenCalledWith({
        name: 'Ada',
        group_id: GROUP_ID,
      });
    },
  );

  it('rejects a missing group before querying or inserting students', async () => {
    setActorRole('teacher');
    const from = vi.fn().mockReturnValueOnce(groupValidationResult(null));
    mocks.createClient.mockResolvedValue({ from });

    await expect(
      createStudent({ name: 'Ada', groupId: GROUP_ID }),
    ).rejects.toEqual(new ApplicationError('not-found'));
    expect(from).toHaveBeenCalledOnce();
    expect(from).toHaveBeenCalledWith('groups');
  });

  it('maps a duplicate student in the same group to a conflict', async () => {
    setActorRole('coordinator');
    const insert = vi.fn();
    const from = vi
      .fn()
      .mockReturnValueOnce(groupValidationResult())
      .mockReturnValueOnce(studentAvailabilityResult({ id: OTHER_STUDENT_ID }))
      .mockReturnValueOnce({ insert });
    mocks.createClient.mockResolvedValue({ from });

    await expect(
      createStudent({ name: 'Ada', groupId: GROUP_ID }),
    ).rejects.toEqual(new ApplicationError('conflict'));
    expect(from).toHaveBeenCalledTimes(2);
    expect(insert).not.toHaveBeenCalled();
  });

  it('rethrows an unexpected insert failure', async () => {
    setActorRole('admin');
    const error = { message: 'unexpected insert failure' };
    const from = vi
      .fn()
      .mockReturnValueOnce(groupValidationResult())
      .mockReturnValueOnce(studentAvailabilityResult())
      .mockReturnValueOnce({
        insert: vi.fn().mockResolvedValue({ error }),
      });
    mocks.createClient.mockResolvedValue({ from });

    await expect(
      createStudent({ name: 'Ada', groupId: GROUP_ID }),
    ).rejects.toBe(error);
  });
});

describe('admin student management', () => {
  it.each([
    [
      'coordinator',
      'update',
      () => updateStudent({ id: STUDENT_ID, name: 'Ada', groupId: GROUP_ID }),
    ],
    ['coordinator', 'delete', () => deleteStudent(STUDENT_ID)],
    [
      'teacher',
      'update',
      () => updateStudent({ id: STUDENT_ID, name: 'Ada', groupId: GROUP_ID }),
    ],
    ['teacher', 'delete', () => deleteStudent(STUDENT_ID)],
  ])(
    'rejects a direct %s %s call before querying tables',
    async (_role, _operation, run) => {
      mocks.requirePermission.mockRejectedValue(
        new ApplicationError('forbidden'),
      );
      const from = vi.fn();
      mocks.createClient.mockResolvedValue({ from });

      await expect(run()).rejects.toEqual(new ApplicationError('forbidden'));
      expect(from).not.toHaveBeenCalled();
    },
  );

  it('updates an available student with an existing group', async () => {
    setActorRole('admin');
    const updateMaybeSingle = vi.fn().mockResolvedValue({
      data: { id: STUDENT_ID },
      error: null,
    });
    const update = vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({ maybeSingle: updateMaybeSingle })),
      })),
    }));
    const from = vi
      .fn()
      .mockReturnValueOnce(groupValidationResult())
      .mockReturnValueOnce(studentAvailabilityResult())
      .mockReturnValueOnce({ update });
    mocks.createClient.mockResolvedValue({ from });

    await expect(
      updateStudent({ id: STUDENT_ID, name: 'Grace', groupId: GROUP_ID }),
    ).resolves.toBeUndefined();
    expect(update).toHaveBeenCalledWith({
      name: 'Grace',
      group_id: GROUP_ID,
    });
  });

  it('maps referenced student deletion to a conflict', async () => {
    setActorRole('admin');
    const deleteStudentRow = vi.fn();
    const from = vi
      .fn()
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            limit: vi.fn().mockResolvedValue({
              data: [{ id: '55555555-5555-4555-8555-555555555555' }],
              error: null,
            }),
          })),
        })),
      })
      .mockReturnValueOnce({ delete: deleteStudentRow });
    mocks.createClient.mockResolvedValue({ from });

    await expect(deleteStudent(STUDENT_ID)).rejects.toEqual(
      new ApplicationError('conflict'),
    );
    expect(from).toHaveBeenCalledOnce();
    expect(from).toHaveBeenCalledWith('incidents');
    expect(deleteStudentRow).not.toHaveBeenCalled();
  });

  it('returns not-found when the student to delete does not exist', async () => {
    setActorRole('admin');
    const from = vi
      .fn()
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            limit: vi.fn().mockResolvedValue({ data: [], error: null }),
          })),
        })),
      })
      .mockReturnValueOnce({
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              maybeSingle: vi.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            })),
          })),
        })),
      });
    mocks.createClient.mockResolvedValue({ from });

    await expect(deleteStudent(STUDENT_ID)).rejects.toEqual(
      new ApplicationError('not-found'),
    );
  });

  it('deletes an unreferenced existing student', async () => {
    setActorRole('admin');
    const deleteStudentRow = vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: STUDENT_ID },
            error: null,
          }),
        })),
      })),
    }));
    const from = vi
      .fn()
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            limit: vi.fn().mockResolvedValue({ data: [], error: null }),
          })),
        })),
      })
      .mockReturnValueOnce({ delete: deleteStudentRow });
    mocks.createClient.mockResolvedValue({ from });

    await expect(deleteStudent(STUDENT_ID)).resolves.toBeUndefined();
    expect(from.mock.calls.map(([table]) => table)).toEqual([
      'incidents',
      'students',
    ]);
    expect(deleteStudentRow).toHaveBeenCalledOnce();
  });
});
