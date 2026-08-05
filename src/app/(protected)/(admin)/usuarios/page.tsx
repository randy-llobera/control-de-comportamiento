import { UsersList } from '@/components/UsersList';
import { getUserPageData } from '@/lib/users';

export default async function UsersPage() {
  const { users, roles } = await getUserPageData();

  return (
    <div className='min-h-screen bg-app-background'>
      <div className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
        <div className='px-4 py-6 sm:px-0'>
          <h1 className='mb-6 text-3xl font-bold text-app-text'>
            Gestión de Usuarios
          </h1>

          <UsersList users={users} roles={roles} />
        </div>
      </div>
    </div>
  );
}
