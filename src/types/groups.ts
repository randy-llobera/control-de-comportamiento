export type GroupListItem = {
  id: string;
  name: string;
  createdByDisplayName: string;
};

export type CreateGroupInput = {
  name: string;
};

export type UpdateGroupInput = {
  id: string;
  name: string;
};
