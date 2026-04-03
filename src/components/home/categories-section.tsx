'use client';

import { useLocale, useTranslations } from 'next-intl';
import { ChevronRight, Grid3X3 } from 'lucide-react';

import { Container } from '@/components/ui';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

interface CategoryItem {
  id: string;
  slug: string;
  nameKa: string;
  nameEn: string;
  image: string | null;
  _count?: {
    products: number;
  };
}

interface CategoriesSectionProps {
  categories: CategoryItem[];
}

const categoryColors = [
  { bg: 'bg-emerald-50', hover: 'hover:bg-emerald-100/70', icon: 'bg-emerald-100 text-emerald-600', border: 'border-emerald-100' },
  { bg: 'bg-sky-50', hover: 'hover:bg-sky-100/70', icon: 'bg-sky-100 text-sky-600', border: 'border-sky-100' },
  { bg: 'bg-amber-50', hover: 'hover:bg-amber-100/70', icon: 'bg-amber-100 text-amber-600', border: 'border-amber-100' },
  { bg: 'bg-violet-50', hover: 'hover:bg-violet-100/70', icon: 'bg-violet-100 text-violet-600', border: 'border-violet-100' },
  { bg: 'bg-rose-50', hover: 'hover:bg-rose-100/70', icon: 'bg-rose-100 text-rose-600', border: 'border-rose-100' },
  { bg: 'bg-teal-50', hover: 'hover:bg-teal-100/70', icon: 'bg-teal-100 text-teal-600', border: 'border-teal-100' },
];

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  const locale = useLocale() as 'ka' | 'en';
  const t = useTranslations();

  if (categories.length === 0) return null;

  return (
    <section className="py-12 lg:py-16">
      <Container>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-full font-semibold text-sm shadow-sm">
              <Grid3X3 className="w-4 h-4" />
              <span>{t('home.categories.title')}</span>
            </div>
          </div>
          <Link
            href="/categories"
            className="group inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-700 rounded-full font-semibold text-sm hover:bg-slate-200 transition-colors"
          >
            {t('home.categories.viewAll')}
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.slice(0, 6).map((category, index) => {
            const color = categoryColors[index % categoryColors.length];
            const productCount = category._count?.products ?? 0;

            return (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className={cn(
                  'group p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg',
                  color.bg,
                  color.hover,
                  color.border
                )}
              >
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform', color.icon)}>
                  <Grid3X3 className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-900 text-sm mb-1 line-clamp-2">
                  {locale === 'ka' ? category.nameKa : category.nameEn}
                </h3>
                {productCount > 0 && (
                  <p className="text-xs text-slate-500">
                    {productCount} {locale === 'ka' ? 'პროდუქტი' : 'products'}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
