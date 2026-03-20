'use client';

import { useTranslations } from 'next-intl';
import { ChevronRight, Clock } from 'lucide-react';

import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { type ProductWithImages } from '@/services/products';
import { ProductCard } from '@/components/products/product-card';

interface ProductGridProps {
  products: ProductWithImages[];
  titleKey: string;
  subtitleKey?: string;
  viewAllHref?: string;
  columns?: 2 | 3 | 4;
}

export function ProductGrid({
  products,
  titleKey,
  subtitleKey,
  viewAllHref,
  columns = 4,
}: ProductGridProps) {
  const t = useTranslations();

  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  if (products.length === 0) return null;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 lg:mb-8">
        <div className="flex flex-wrap items-center gap-3">
          {/* Title Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-full font-semibold text-sm shadow-sm">
            <Clock className="w-4 h-4" />
            <span>{t(titleKey)}</span>
          </div>
          {/* Subtitle */}
          {subtitleKey && (
            <p className="text-slate-500 text-sm">{t(subtitleKey)}</p>
          )}
        </div>

        {/* View All Link */}
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="group inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-700 rounded-full font-semibold text-sm hover:bg-slate-200 transition-colors"
          >
            {t('common.viewAll')}
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}
      </div>

      {/* Products Grid */}
      <div className={cn('grid gap-4 lg:gap-6', gridCols[columns])}>
        {products.map((product) => (
          <div key={product.id}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
