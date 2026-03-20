/**
 * Admin Login Layout
 * Renders login page without the admin shell (sidebar/topbar)
 */

import { setRequestLocale } from 'next-intl/server';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminLoginLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Login page renders without admin shell
  return <>{children}</>;
}
