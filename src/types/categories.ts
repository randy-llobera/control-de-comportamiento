export type CategoryListItem = {
  id: string;
  name: string;
  createdByDisplayName: string;
};

export type CreateCategoryInput = {
  name: string;
};

export type UpdateCategoryInput = {
  id: string;
  name: string;
};
