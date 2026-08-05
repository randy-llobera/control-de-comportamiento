import { z } from 'zod';

import {
  getApplicationErrorMessage,
  isApplicationError,
  type ApplicationErrorCode,
} from '@/lib/application-error';
import { getGroupStudents } from '@/lib/students';

const groupIdSchema = z.uuid();
const APPLICATION_ERROR_STATUSES = {
  unauthenticated: 401,
  forbidden: 403,
  'not-found': 404,
  conflict: 409,
} as const satisfies Record<ApplicationErrorCode, number>;

type GroupStudentsRouteContext = {
  params: Promise<{ groupId: string }>;
};

export const GET = async (
  _request: Request,
  { params }: GroupStudentsRouteContext,
): Promise<Response> => {
  const parsedGroupId = groupIdSchema.safeParse((await params).groupId);

  if (!parsedGroupId.success) {
    return Response.json(
      {
        error: 'Identificador de grupo inválido.',
      },
      { status: 400 },
    );
  }

  try {
    const students = await getGroupStudents(parsedGroupId.data);

    return Response.json(students);
  } catch (error) {
    if (isApplicationError(error)) {
      return Response.json(
        {
          error: getApplicationErrorMessage(error.code),
        },
        { status: APPLICATION_ERROR_STATUSES[error.code] },
      );
    }

    console.error('Failed to handle the group student request:', error);

    return Response.json(
      {
        error: 'No se pudieron cargar los estudiantes. Inténtalo de nuevo.',
      },
      { status: 500 },
    );
  }
};
