/**
 * Admin Delivery Zones Page
 * Server component for delivery zone management
 */

import { redirect } from 'next/navigation';

import { setRequestLocale, getTranslations } from 'next-intl/server';

import { auth } from '@/lib/auth';

import { DeliveryZonesContent } from './delivery-zones-content';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.deliveryZones' });

  return {
    title: t('title'),
  };
}

export default async function AdminDeliveryZonesPage({ params }: Props) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  const session = await auth();

  // Double-check authentication (middleware should handle this)
  if (!session?.user) {
    redirect(`/${locale}/admin/login`);
  }

  return <DeliveryZonesContent />;
}
