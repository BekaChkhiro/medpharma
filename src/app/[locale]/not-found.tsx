/**
 * Not Found Page (locale level)
 * Renders inside the locale layout with Header & Footer
 */

import { Home, ShoppingBag } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Header, Footer } from '@/components/layout';
import { Container, Button } from '@/components/ui';
import { Link } from '@/i18n/navigation';

export default function NotFound() {
  const t = useTranslations('errors');

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center bg-gradient-to-b from-[#FDFBF7] to-[#F5F0E8]">
        <Container size="sm" className="py-20 text-center">
          {/* 404 Number */}
          <div className="relative mb-8">
            <span className="text-[10rem] sm:text-[12rem] font-black leading-none text-[#2563eb]/15 select-none block">
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-full bg-red-50 p-5">
                <ShoppingBag className="h-12 w-12 text-red-400" />
              </div>
            </div>
          </div>

          {/* Text */}
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            {t('notFound')}
          </h1>
          <p className="text-slate-500 mb-10 max-w-md mx-auto leading-relaxed">
            {t('notFoundDescription')}
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/">
              <Button size="lg" className="min-w-[200px]">
                <Home className="mr-2 h-4 w-4" />
                {t('backToHome')}
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="outline" size="lg" className="min-w-[200px]">
                <ShoppingBag className="mr-2 h-4 w-4" />
                {t('browseProducts')}
              </Button>
            </Link>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
