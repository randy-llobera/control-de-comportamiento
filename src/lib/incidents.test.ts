import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApplicationError } from '@/lib/application-error';
import {
  createIncident,
  deleteIncident,
  getIncidentPageData,
  updateIncident,
} from '@/lib/incidents';

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

const ACTOR_ID = '11111111-1111-4111-8111-111111111111';
const OTHER_ACTOR_ID = '66666666-6666-4666-8666-666666666666';
const INCIDENT_ID = '22222222-2222-4222-8222-222222222222';
const OTHER_INCIDENT_ID = '77777777-7777-4777-8777-777777777777';
const STUDENT_ID = '33333333-3333-4333-8333-333333333333';
const CATEGORY_ID = '44444444-4444-4444-8444-444444444444';
const GROUP_ID = '55555555-5555-4555-8555-555555555555';

const setActorRole = (role: 'admin' | 'coordinator' | 'teacher') => {
  mocks.requirePermission.mockResolvedValue({
    id: ACTOR_ID,
    displayName: 'Ada Lovelace',
    schoolRole: 'Tecnología',
    role,
  });
};

const referenceValidationResult = (data: { id: string } | null) => ({
  select: vi.fn(() => ({
    eq: vi.fn(() => ({
      maybeSingle: vi.fn().mockResolvedValue({ data, error: null }),
    })),
  })),
});

const ownershipResult = (teacherId: string | null) => ({
  select: vi.fn(() => ({
    eq: vi.fn(() => ({
      maybeSingle: vi.fn().mockResolvedValue({
        data: teacherId ? { teacher_id: teacherId } : null,
        error: null,
      }),
    })),
  })),
});

const updateResult = (data: { id: string } | null = { id: INCIDENT_ID }) => {
  const update = vi.fn(() => ({
    eq: vi.fn(() => ({
      select: vi.fn(() => ({
        maybeSingle: vi.fn().mockResolvedValue({ data, error: null }),
      })),
    })),
  }));

  return { update };
};

const deleteResult = (data: { id: string } | null = { id: INCIDENT_ID }) => {
  const deleteRow = vi.fn(() => ({
    eq: vi.fn(() => ({
      select: vi.fn(() => ({
        maybeSingle: vi.fn().mockResolvedValue({ data, error: null }),
      })),
    })),
  }));

  return { delete: deleteRow };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getIncidentPageData', () => {
  it.each([
    ['teacher', true, false],
    ['coordinator', true, true],
    ['admin', true, true],
  ] as const)(
    'maps page capabilities for %s',
    async (role, canManageOwn, canManageOther) => {
      setActorRole(role);
      const incidentsOrder = vi.fn().mockResolvedValue({
        data: [
          {
            id: INCIDENT_ID,
            student_id: STUDENT_ID,
            category_id: CATEGORY_ID,
            teacher_id: ACTOR_ID,
            severity: 'high',
            description: 'Interrumpió la clase',
            date: '2026-07-27',
            students: {
              name: 'Grace',
              group_id: GROUP_ID,
              groups: { name: '1º A' },
            },
            categories: { name: 'Conducta' },
            users: { display_name: 'Ada Lovelace' },
          },
          {
            id: OTHER_INCIDENT_ID,
            student_id: STUDENT_ID,
            category_id: CATEGORY_ID,
            teacher_id: OTHER_ACTOR_ID,
            severity: 'low',
            description: 'Llegó tarde',
            date: '2026-07-26',
            students: {
              name: 'Grace',
              group_id: GROUP_ID,
              groups: { name: '1º A' },
            },
            categories: { name: 'Conducta' },
            users: { display_name: 'Grace Hopper' },
          },
        ],
        error: null,
      });
      const categoriesOrder = vi.fn().mockResolvedValue({
        data: [{ id: CATEGORY_ID, name: 'Conducta' }],
        error: null,
      });
      const groupsOrder = vi.fn().mockResolvedValue({
        data: [{ id: GROUP_ID, name: '1º A' }],
        error: null,
      });
      const from = vi
        .fn()
        .mockReturnValueOnce({
          select: vi.fn(() => ({ order: incidentsOrder })),
        })
        .mockReturnValueOnce({
          select: vi.fn(() => ({ order: categoriesOrder })),
        })
        .mockReturnValueOnce({
          select: vi.fn(() => ({ order: groupsOrder })),
        });
      mocks.createClient.mockResolvedValue({ from });

      const result = await getIncidentPageData();

      expect(result.incidents).toHaveLength(2);
      expect(result.incidents[0]).toMatchObject({
        id: INCIDENT_ID,
        canManage: canManageOwn,
        student: {
          id: STUDENT_ID,
          name: 'Grace',
          group: { id: GROUP_ID, name: '1º A' },
        },
        category: { id: CATEGORY_ID, name: 'Conducta' },
        teacher: { id: ACTOR_ID, displayName: 'Ada Lovelace' },
      });
      expect(result.incidents[1]).toMatchObject({
        id: OTHER_INCIDENT_ID,
        canManage: canManageOther,
      });
      expect(result.formOptions).toEqual({
        categories: [{ id: CATEGORY_ID, name: 'Conducta' }],
        groups: [{ id: GROUP_ID, name: '1º A' }],
      });
      expect(mocks.requirePermission).toHaveBeenCalledWith(
        expect.objectContaining({ from }),
        'incidents:read',
      );
      expect(from).toHaveBeenCalledTimes(3);
    },
  );

  it('rejects unauthenticated reads before querying incident data', async () => {
    mocks.requirePermission.mockRejectedValue(
      new ApplicationError('unauthenticated'),
    );
    const from = vi.fn();
    mocks.createClient.mockResolvedValue({ from });

    await expect(getIncidentPageData()).rejects.toEqual(
      new ApplicationError('unauthenticated'),
    );
    expect(from).not.toHaveBeenCalled();
  });
});

describe('createIncident', () => {
  it.each(['teacher', 'coordinator', 'admin'] as const)(
    'creates an incident as the authenticated %s',
    async (role) => {
      setActorRole(role);
      const insert = vi.fn().mockResolvedValue({ error: null });
      const from = vi
        .fn()
        .mockReturnValueOnce(referenceValidationResult({ id: STUDENT_ID }))
        .mockReturnValueOnce(referenceValidationResult({ id: CATEGORY_ID }))
        .mockReturnValueOnce({ insert });
      mocks.createClient.mockResolvedValue({ from });

      await expect(
        createIncident({
          studentId: STUDENT_ID,
          categoryId: CATEGORY_ID,
          severity: 'medium',
          description: 'Llegó tarde',
          date: '2026-07-27',
        }),
      ).resolves.toBeUndefined();
      expect(insert).toHaveBeenCalledWith({
        student_id: STUDENT_ID,
        category_id: CATEGORY_ID,
        severity: 'medium',
        description: 'Llegó tarde',
        date: '2026-07-27',
        teacher_id: ACTOR_ID,
      });
    },
  );

  it.each([
    ['student', null, { id: CATEGORY_ID }],
    ['category', { id: STUDENT_ID }, null],
  ] as const)(
    'rejects a missing referenced %s before inserting',
    async (_reference, student, category) => {
      setActorRole('teacher');
      const insert = vi.fn();
      const from = vi
        .fn()
        .mockReturnValueOnce(referenceValidationResult(student))
        .mockReturnValueOnce(referenceValidationResult(category))
        .mockReturnValueOnce({ insert });
      mocks.createClient.mockResolvedValue({ from });

      await expect(
        createIncident({
          studentId: STUDENT_ID,
          categoryId: CATEGORY_ID,
          severity: 'low',
          description: 'Llegó tarde',
          date: '2026-07-27',
        }),
      ).rejects.toEqual(new ApplicationError('not-found'));
      expect(insert).not.toHaveBeenCalled();
    },
  );
});

describe('incident management', () => {
  it('allows a teacher to update an owned incident without changing identity', async () => {
    setActorRole('teacher');
    const updateQuery = updateResult();
    const from = vi
      .fn()
      .mockReturnValueOnce(ownershipResult(ACTOR_ID))
      .mockReturnValueOnce(referenceValidationResult({ id: CATEGORY_ID }))
      .mockReturnValueOnce(updateQuery);
    mocks.createClient.mockResolvedValue({ from });

    await expect(
      updateIncident({
        id: INCIDENT_ID,
        categoryId: CATEGORY_ID,
        severity: 'high',
        description: 'Actualizado',
        date: '2026-07-28',
      }),
    ).resolves.toBeUndefined();
    expect(updateQuery.update).toHaveBeenCalledWith({
      category_id: CATEGORY_ID,
      severity: 'high',
      description: 'Actualizado',
      date: '2026-07-28',
    });
  });

  it('allows a teacher to delete an owned incident', async () => {
    setActorRole('teacher');
    const deleteQuery = deleteResult();
    const from = vi
      .fn()
      .mockReturnValueOnce(ownershipResult(ACTOR_ID))
      .mockReturnValueOnce(deleteQuery);
    mocks.createClient.mockResolvedValue({ from });

    await expect(deleteIncident(INCIDENT_ID)).resolves.toBeUndefined();
    expect(deleteQuery.delete).toHaveBeenCalledOnce();
  });

  it.each([
    [
      'update',
      () =>
        updateIncident({
          id: INCIDENT_ID,
          categoryId: CATEGORY_ID,
          severity: 'medium',
          description: 'No permitido',
          date: '2026-07-28',
        }),
    ],
    ['delete', () => deleteIncident(INCIDENT_ID)],
  ])(
    'forbids a teacher from attempting to %s another teacher incident',
    async (_operation, run) => {
      setActorRole('teacher');
      const from = vi.fn().mockReturnValueOnce(ownershipResult(OTHER_ACTOR_ID));
      mocks.createClient.mockResolvedValue({ from });

      await expect(run()).rejects.toEqual(new ApplicationError('forbidden'));
      expect(from).toHaveBeenCalledOnce();
    },
  );

  it.each(['coordinator', 'admin'] as const)(
    'allows %s to update another teacher incident',
    async (role) => {
      setActorRole(role);
      const updateQuery = updateResult();
      const from = vi
        .fn()
        .mockReturnValueOnce(ownershipResult(OTHER_ACTOR_ID))
        .mockReturnValueOnce(referenceValidationResult({ id: CATEGORY_ID }))
        .mockReturnValueOnce(updateQuery);
      mocks.createClient.mockResolvedValue({ from });

      await expect(
        updateIncident({
          id: INCIDENT_ID,
          categoryId: CATEGORY_ID,
          severity: 'medium',
          description: 'Actualizado',
          date: '2026-07-28',
        }),
      ).resolves.toBeUndefined();
    },
  );

  it.each(['coordinator', 'admin'] as const)(
    'allows %s to delete another teacher incident',
    async (role) => {
      setActorRole(role);
      const deleteQuery = deleteResult();
      const from = vi
        .fn()
        .mockReturnValueOnce(ownershipResult(OTHER_ACTOR_ID))
        .mockReturnValueOnce(deleteQuery);
      mocks.createClient.mockResolvedValue({ from });

      await expect(deleteIncident(INCIDENT_ID)).resolves.toBeUndefined();
    },
  );

  it('returns not-found when the incident does not exist', async () => {
    setActorRole('admin');
    const from = vi.fn().mockReturnValueOnce(ownershipResult(null));
    mocks.createClient.mockResolvedValue({ from });

    await expect(deleteIncident(INCIDENT_ID)).rejects.toEqual(
      new ApplicationError('not-found'),
    );
  });

  it('returns not-found when an update category does not exist', async () => {
    setActorRole('admin');
    const from = vi
      .fn()
      .mockReturnValueOnce(ownershipResult(OTHER_ACTOR_ID))
      .mockReturnValueOnce(referenceValidationResult(null));
    mocks.createClient.mockResolvedValue({ from });

    await expect(
      updateIncident({
        id: INCIDENT_ID,
        categoryId: CATEGORY_ID,
        severity: 'low',
        description: 'Actualizado',
        date: '2026-07-28',
      }),
    ).rejects.toEqual(new ApplicationError('not-found'));
    expect(from).toHaveBeenCalledTimes(2);
  });
});
