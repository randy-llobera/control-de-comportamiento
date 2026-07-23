import { UsersList } from '@/components/UsersList';
import { getUserPageData } from '@/lib/users';

export default async function UsuariosPage() {
  const { users, roles } = await getUserPageData();

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
        <div className='px-4 py-6 sm:px-0'>
          <h1 className='mb-6 text-3xl font-bold text-gray-900'>
            Gestión de Usuarios
          </h1>

          <UsersList users={users} roles={roles} />
        </div>
      </div>
    </div>
  );
}
