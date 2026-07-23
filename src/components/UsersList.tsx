import { UserRoleControls } from "@/components/UserRoleControls";
import type { RoleOption, UserListItem } from "@/types/users";

type UsersListProps = {
  users: UserListItem[];
  roles: RoleOption[];
};

export function UsersList({ users, roles }: UsersListProps) {
  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {users.map((user) => (
          <li key={user.id} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300">
                      <span className="text-sm font-medium text-gray-700">
                        {user.displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {user.displayName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {user.schoolRole}
                    </div>
                  </div>
                </div>
              </div>
              <UserRoleControls
                key={user.role.id}
                userId={user.id}
                currentRole={user.role}
                roles={roles}
              />
            </div>
          </li>
        ))}
      </ul>
      {users.length === 0 && (
        <div className="py-8 text-center text-gray-500">
          No hay usuarios registrados
        </div>
      )}
    </div>
  );
}
