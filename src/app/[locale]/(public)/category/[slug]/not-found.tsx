'use client';

import { Package } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Container } from '@/components/ui';
import { Link } from '@/i18n/navigation';

export default function CategoryNotFound() {
  const t = useTranslations('category');
  const tNav = useTranslations('nav');

  return (
    <main className="py-16">
      <Container>
        <div className="flex flex-col items-center justify-center text-center">
          <div className="rounded-full bg-gray-100 p-6 mb-6">
            <Package className="h-12 w-12 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t('notFound')}
          </h1>
          <p className="text-gray-600 mb-8 max-w-md">
            {t('notFoundMessage')}
          </p>
          <div className="flex gap-4">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 font-medium transition-colors bg-primary text-primary-foreground hover:bg-[var(--primary-hover)] shadow-sm h-10 px-4 py-2 rounded-[var(--radius-md)]"
            >
              {tNav('products')}
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 font-medium transition-colors border border-input bg-transparent hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 rounded-[var(--radius-md)]"
            >
              {tNav('home')}
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
