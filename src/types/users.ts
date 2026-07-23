export const USER_ROLE_NAMES = ["admin", "coordinator", "teacher"] as const;

export type UserRoleName = (typeof USER_ROLE_NAMES)[number];

export type RoleOption = {
  id: string;
  name: UserRoleName;
};

export type UserListItem = {
  id: string;
  displayName: string;
  schoolRole: string;
  role: RoleOption;
};

export type UserPageData = {
  users: UserListItem[];
  roles: RoleOption[];
};

export type UpdateUserRoleInput = {
  userId: string;
  roleId: string;
};
