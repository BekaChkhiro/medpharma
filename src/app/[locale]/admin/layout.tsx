/**
 * Admin Layout
 * Wraps all admin pages with session provider and admin shell
 */

import { SessionProvider } from 'next-auth/react';
import { setRequestLocale } from 'next-intl/server';

import { auth } from '@/lib/auth';

import { AdminLayoutWrapper } from './admin-layout-wrapper';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export const metadata = {
  title: 'Admin Panel',
  description: 'MedPharma Plus Administration Panel',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({ children, params }: Props) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  const session = await auth();

  return (
    <SessionProvider session={session}>
      <AdminLayoutWrapper>{children}</AdminLayoutWrapper>
    </SessionProvider>
  );
}
