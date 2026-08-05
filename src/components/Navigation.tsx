'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';

import { logoutAction } from '@/actions/auth';
import { toast } from '@/components/ui/toast';
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

type LogoutButtonProps = {
  className: string;
};

function LogoutButton({ className }: LogoutButtonProps) {
  const [state, formAction, isPending] = useActionState(logoutAction, null);

  useEffect(() => {
    if (state && !state.success) {
      toast.add({ title: state.error, type: 'error' });
    }
  }, [state]);

  return (
    <form action={formAction} className='shrink-0'>
      <button type='submit' disabled={isPending} className={className}>
        {isPending ? 'Cerrando...' : 'Cerrar Sesión'}
      </button>
    </form>
  );
}

export default function Navigation({ user }: NavigationProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const navigationItems = NAVIGATION_ITEMS.filter((item) =>
    item.allowedRoles.includes(user.role),
  );

  return (
    <div className='shrink-0 bg-app-background lg:h-screen'>
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'flex' : 'hidden'}`}
      >
        <div
          className='fixed inset-0 bg-app-overlay/75'
          onClick={() => setSidebarOpen(false)}
        />
        <div className='relative flex-1 flex flex-col max-w-xs w-full bg-surface'>
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
              <h1 className='text-xl font-bold text-app-text'>
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
                      ? 'bg-app-accent text-app-text'
                      : 'text-app-text-subtle hover:bg-app-background hover:text-app-text'
                  } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className='mr-3 text-lg'>{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className='shrink-0 border-t border-app-border p-4'>
            <div className='flex min-w-0 items-center gap-3'>
              <div className='shrink-0'>
                <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-300'>
                  <span className='text-sm font-medium text-app-text-secondary'>
                    {user.displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className='min-w-0 flex-1'>
                <p className='truncate text-sm font-medium text-app-text-secondary'>
                  {user.displayName}
                </p>
                <p className='truncate text-xs font-medium text-app-text-muted'>
                  {user.schoolRole}
                </p>
              </div>
              <LogoutButton className='shrink-0 whitespace-nowrap rounded-md px-2 py-1.5 text-sm font-medium text-app-text-muted hover:bg-app-accent hover:text-app-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50' />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className='hidden lg:flex lg:h-full lg:w-64 lg:shrink-0'>
        <div className='flex h-full w-full flex-col border-r border-app-border bg-surface'>
          <div className='flex min-h-0 flex-1 flex-col overflow-y-auto pt-5 pb-4'>
            <div className='flex items-center shrink-0 px-4'>
              <h1 className='text-xl font-bold text-app-text'>
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
                      ? 'bg-app-accent text-app-text'
                      : 'text-app-text-subtle hover:bg-app-background hover:text-app-text'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                >
                  <span className='mr-3 text-lg'>{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className='shrink-0 border-t border-app-border p-4'>
            <div className='flex min-w-0 items-center gap-3'>
              <div className='shrink-0'>
                <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-300'>
                  <span className='text-sm font-medium text-app-text-secondary'>
                    {user.displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className='min-w-0 flex-1'>
                <p className='truncate text-sm font-medium text-app-text-secondary'>
                  {user.displayName}
                </p>
                <p className='truncate text-xs font-medium text-app-text-muted'>
                  {user.schoolRole}
                </p>
              </div>
              <LogoutButton className='shrink-0 whitespace-nowrap rounded-md px-2 py-1.5 text-xs font-medium text-app-text-muted hover:bg-app-accent hover:text-app-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50' />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className='lg:hidden'>
        <div className='flex items-center justify-between h-16 bg-surface px-4 border-b border-app-border'>
          <button
            type='button'
            className='text-app-text-muted hover:text-app-text-subtle'
            onClick={() => setSidebarOpen(true)}
          >
            <span className='sr-only'>Abrir sidebar</span>
            <span className='text-xl'>☰</span>
          </button>
          <h1 className='text-lg font-semibold text-app-text'>
            Control de Comportamiento
          </h1>
          <div className='w-6' />
        </div>
      </div>
    </div>
  );
}
