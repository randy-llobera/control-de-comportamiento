export const USER_ROLE_NAMES = ['admin', 'coordinator', 'teacher'] as const;

export type UserRoleName = (typeof USER_ROLE_NAMES)[number];

export const isValidRole = (name: string): name is UserRoleName =>
  USER_ROLE_NAMES.some((roleName) => roleName === name);

export type CurrentUser = {
  id: string;
  displayName: string;
  schoolRole: string;
  role: UserRoleName;
};

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
