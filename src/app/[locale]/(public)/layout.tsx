/**
 * Public Layout
 * Wraps all public-facing pages with Header and Footer
 */

export const dynamic = 'force-dynamic';

import { Header, Footer } from '@/components/layout';

type Props = {
  children: React.ReactNode;
};

export default function PublicLayout({ children }: Props) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
