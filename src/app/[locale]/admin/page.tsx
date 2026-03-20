/**
 * Admin Dashboard Page
 * Main entry point for authenticated admin users
 */

import { redirect } from 'next/navigation';

import { setRequestLocale, getTranslations } from 'next-intl/server';

import { auth } from '@/lib/auth';

import { AdminDashboardContent } from './dashboard-content';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin' });

  return {
    title: t('dashboard.title'),
  };
}

export default async function AdminDashboardPage({ params }: Props) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  const session = await auth();

  // Double-check authentication (middleware should handle this)
  if (!session?.user) {
    redirect(`/${locale}/admin/login`);
  }

  return <AdminDashboardContent user={session.user} />;
}
