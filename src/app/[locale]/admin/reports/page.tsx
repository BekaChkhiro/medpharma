import { redirect } from 'next/navigation';

import { setRequestLocale, getTranslations } from 'next-intl/server';

import { auth } from '@/lib/auth';

import { ReportsContent } from './reports-content';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.reports' });

  return {
    title: t('title'),
  };
}

export default async function AdminReportsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) {
    redirect(`/${locale}/admin/login`);
  }

  return <ReportsContent />;
}
