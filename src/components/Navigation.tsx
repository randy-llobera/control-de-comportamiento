'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

import { supabase } from '@/lib/supabase';
import type { CurrentUser, UserRoleName } from '@/types/users';

type NavigationItem = {
  name: string;
  href: string;
  icon: string;
  allowedRoles: readonly UserRoleName[];
};

const NAVIGATION_ITEMS: readonly NavigationItem[] = [
  {
    name: 'Incidentes',
    href: '/incidentes',
    icon: '📋',
    allowedRoles: ['teacher', 'coordinator', 'admin'],
  },
  {
    name: 'Estudiantes',
    href: '/estudiantes',
    icon: '👥',
    allowedRoles: ['teacher', 'coordinator', 'admin'],
  },
  {
    name: 'Grupos',
    href: '/grupos',
    icon: '🏫',
    allowedRoles: ['coordinator', 'admin'],
  },
  {
    name: 'Categorías',
    href: '/categorias',
    icon: '🏷️',
    allowedRoles: ['coordinator', 'admin'],
  },
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: '📊',
    allowedRoles: ['coordinator', 'admin'],
  },
  {
    name: 'Usuarios',
    href: '/usuarios',
    icon: '👤',
    allowedRoles: ['admin'],
  },
];

type NavigationProps = {
  user: CurrentUser;
};

export default function Navigation({ user }: NavigationProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/auth');
  };

  const navigationItems = NAVIGATION_ITEMS.filter((item) =>
    item.allowedRoles.includes(user.role),
  );

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
      >
        <div
          className='fixed inset-0 bg-gray-600 bg-opacity-75'
          onClick={() => setSidebarOpen(false)}
        />
        <div className='relative flex-1 flex flex-col max-w-xs w-full bg-white'>
          <div className='absolute top-0 right-0 -mr-12 pt-2'>
            <button
              type='button'
              className='ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white'
              onClick={() => setSidebarOpen(false)}
            >
              <span className='sr-only'>Cerrar sidebar</span>
              <span className='text-white text-xl'>×</span>
            </button>
          </div>
          <div className='flex-1 h-0 pt-5 pb-4 overflow-y-auto'>
            <div className='shrink-0 flex items-center px-4'>
              <h1 className='text-xl font-bold text-gray-900'>
                Control de Comportamiento
              </h1>
            </div>
            <nav className='mt-5 px-2 space-y-1'>
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    pathname === item.href
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className='mr-3 text-lg'>{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className='shrink-0 flex border-t border-gray-200 p-4'>
            <div className='flex items-center'>
              <div className='shrink-0'>
                <div className='h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center'>
                  <span className='text-sm font-medium text-gray-700'>
                    {user.displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className='ml-3'>
                <p className='text-base font-medium text-gray-700'>
                  {user.displayName}
                </p>
                <p className='text-sm font-medium text-gray-500'>
                  {user.schoolRole}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className='ml-3 text-sm text-gray-500 hover:text-gray-700'
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className='hidden lg:flex lg:shrink-0'>
        <div className='flex flex-col w-64'>
          <div className='flex flex-col h-0 flex-1 border-r border-gray-200 bg-white'>
            <div className='flex-1 flex flex-col pt-5 pb-4 overflow-y-auto'>
              <div className='flex items-center shrink-0 px-4'>
                <h1 className='text-xl font-bold text-gray-900'>
                  Control de Comportamiento
                </h1>
              </div>
              <nav className='mt-5 flex-1 px-2 space-y-1'>
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      pathname === item.href
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                  >
                    <span className='mr-3 text-lg'>{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className='shrink-0 flex border-t border-gray-200 p-4'>
              <div className='flex items-center w-full'>
                <div className='shrink-0'>
                  <div className='h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center'>
                    <span className='text-sm font-medium text-gray-700'>
                      {user.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className='ml-3 flex-1'>
                  <p className='text-sm font-medium text-gray-700'>
                    {user.displayName}
                  </p>
                  <p className='text-xs font-medium text-gray-500'>
                    {user.schoolRole}
                  </p>
                </div>
                <button
                  onClick={handleSignOut}
                  className='ml-2 text-sm text-gray-500 hover:text-gray-700'
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className='lg:hidden'>
        <div className='flex items-center justify-between h-16 bg-white px-4 border-b border-gray-200'>
          <button
            type='button'
            className='text-gray-500 hover:text-gray-600'
            onClick={() => setSidebarOpen(true)}
          >
            <span className='sr-only'>Abrir sidebar</span>
            <span className='text-xl'>☰</span>
          </button>
          <h1 className='text-lg font-semibold text-gray-900'>
            Control de Comportamiento
          </h1>
          <div className='w-6' />
        </div>
      </div>
    </div>
  );
}
