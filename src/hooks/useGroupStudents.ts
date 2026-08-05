import { useEffect, useState } from "react";

import type { StudentSummary } from "@/types/students";

const STUDENT_LOAD_ERROR =
  "No se pudieron cargar los estudiantes. Inténtalo de nuevo.";

type StudentLoadState =
  | {
      status: "idle";
      groupId: "";
      students: [];
    }
  | {
      status: "loading";
      groupId: string;
      students: [];
    }
  | {
      status: "success";
      groupId: string;
      students: StudentSummary[];
    }
  | {
      status: "error";
      groupId: string;
      students: [];
      error: string;
    };

const initialState: StudentLoadState = {
  status: "idle",
  groupId: "",
  students: [],
};

export function useGroupStudents(groupId: string) {
  const [state, setState] = useState<StudentLoadState>(initialState);

  useEffect(() => {
    if (!groupId) {
      return;
    }

    let ignore = false;
    const controller = new AbortController();

    async function loadStudents() {
      setState({ status: "loading", groupId, students: [] });

      try {
        const response = await fetch(
          `/api/groups/${encodeURIComponent(groupId)}/students`,
          {
            cache: "no-store",
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          const { error } = (await response.json()) as { error: string };

          if (!ignore) {
            setState({
              status: "error",
              groupId,
              students: [],
              error,
            });
          }

          return;
        }

        const students = (await response.json()) as StudentSummary[];

        if (!ignore) {
          setState({ status: "success", groupId, students });
        }
      } catch {
        if (!ignore && !controller.signal.aborted) {
          setState({
            status: "error",
            groupId,
            students: [],
            error: STUDENT_LOAD_ERROR,
          });
        }
      }
    }

    void loadStudents();

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [groupId]);

  const isCurrentGroup = state.groupId === groupId;

  return {
    students: isCurrentGroup ? state.students : [],
    isLoading:
      Boolean(groupId) && (!isCurrentGroup || state.status === "loading"),
    error: isCurrentGroup && state.status === "error" ? state.error : undefined,
  };
}
