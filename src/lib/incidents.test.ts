import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApplicationError } from '@/lib/application-error';
import { createIncident, getIncidentPageData } from '@/lib/incidents';

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
const INCIDENT_ID = '22222222-2222-4222-8222-222222222222';
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

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getIncidentPageData', () => {
  it.each(['teacher', 'coordinator', 'admin'] as const)(
    'maps serializable page data for %s',
    async (role) => {
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
        ],
        error: null,
      });
      const studentsOrder = vi.fn().mockResolvedValue({
        data: [
          {
            id: STUDENT_ID,
            name: 'Grace',
            group_id: GROUP_ID,
            groups: { name: '1º A' },
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
          select: vi.fn(() => ({ order: studentsOrder })),
        })
        .mockReturnValueOnce({
          select: vi.fn(() => ({ order: categoriesOrder })),
        })
        .mockReturnValueOnce({
          select: vi.fn(() => ({ order: groupsOrder })),
        });
      mocks.createClient.mockResolvedValue({ from });

      await expect(getIncidentPageData()).resolves.toEqual({
        incidents: [
          {
            id: INCIDENT_ID,
            date: '2026-07-27',
            severity: 'high',
            description: 'Interrumpió la clase',
            student: {
              id: STUDENT_ID,
              name: 'Grace',
              group: { id: GROUP_ID, name: '1º A' },
            },
            category: { id: CATEGORY_ID, name: 'Conducta' },
            teacher: {
              id: ACTOR_ID,
              displayName: 'Ada Lovelace',
            },
          },
        ],
        formOptions: {
          students: [
            {
              id: STUDENT_ID,
              name: 'Grace',
              group: { id: GROUP_ID, name: '1º A' },
            },
          ],
          categories: [{ id: CATEGORY_ID, name: 'Conducta' }],
          groups: [{ id: GROUP_ID, name: '1º A' }],
        },
      });
      expect(mocks.requirePermission).toHaveBeenCalledWith(
        expect.objectContaining({ from }),
        'incidents:read',
      );
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
      expect(mocks.requirePermission).toHaveBeenCalledWith(
        expect.objectContaining({ from }),
        'incidents:create',
      );
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

  it('rejects a missing referenced student before inserting', async () => {
    setActorRole('teacher');
    const insert = vi.fn();
    const from = vi
      .fn()
      .mockReturnValueOnce(referenceValidationResult(null))
      .mockReturnValueOnce(referenceValidationResult({ id: CATEGORY_ID }))
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
    expect(from).toHaveBeenCalledTimes(2);
    expect(insert).not.toHaveBeenCalled();
  });

  it('rejects a missing referenced category before inserting', async () => {
    setActorRole('coordinator');
    const insert = vi.fn();
    const from = vi
      .fn()
      .mockReturnValueOnce(referenceValidationResult({ id: STUDENT_ID }))
      .mockReturnValueOnce(referenceValidationResult(null))
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
    ).rejects.toEqual(new ApplicationError('not-found'));
    expect(from).toHaveBeenCalledTimes(2);
    expect(insert).not.toHaveBeenCalled();
  });

  it('rejects unauthorized creation before querying referenced records', async () => {
    mocks.requirePermission.mockRejectedValue(
      new ApplicationError('forbidden'),
    );
    const from = vi.fn();
    mocks.createClient.mockResolvedValue({ from });

    await expect(
      createIncident({
        studentId: STUDENT_ID,
        categoryId: CATEGORY_ID,
        severity: 'low',
        description: 'Llegó tarde',
        date: '2026-07-27',
      }),
    ).rejects.toEqual(new ApplicationError('forbidden'));
    expect(from).not.toHaveBeenCalled();
  });

  it('rethrows an unexpected insert failure', async () => {
    setActorRole('admin');
    const error = { message: 'unexpected insert failure' };
    const from = vi
      .fn()
      .mockReturnValueOnce(referenceValidationResult({ id: STUDENT_ID }))
      .mockReturnValueOnce(referenceValidationResult({ id: CATEGORY_ID }))
      .mockReturnValueOnce({
        insert: vi.fn().mockResolvedValue({ error }),
      });
    mocks.createClient.mockResolvedValue({ from });

    await expect(
      createIncident({
        studentId: STUDENT_ID,
        categoryId: CATEGORY_ID,
        severity: 'high',
        description: 'Llegó tarde',
        date: '2026-07-27',
      }),
    ).rejects.toBe(error);
  });
});
