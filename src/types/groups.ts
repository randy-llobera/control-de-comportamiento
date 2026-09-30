export type GroupListItem = {
  id: string;
  name: string;
  createdByDisplayName: string;
};

export type CreateGroupInput = z.output<typeof createGroupSchema>;
export type UpdateGroupInput = z.output<typeof updateGroupSchema>;
import type { z } from "zod";

import type { createGroupSchema, updateGroupSchema } from "@/validation/groups";
