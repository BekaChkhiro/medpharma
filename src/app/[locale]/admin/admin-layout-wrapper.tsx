'use client';

import { usePathname } from 'next/navigation';

import { AdminLayout } from '@/components/admin';

interface AdminLayoutWrapperProps {
  children: React.ReactNode;
}

export function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
  const pathname = usePathname();

  // Don't show admin shell on login page
  const isLoginPage = pathname.includes('/admin/login');

  if (isLoginPage) {
    return <>{children}</>;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
