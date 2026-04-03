'use client';

import { Package } from 'lucide-react';
import { useTranslations } from 'next-intl';


import { Skeleton } from '@/components/ui';
import { type ProductWithImages } from '@/services/products';

import { ProductCard } from './product-card';

interface ProductGridProps {
  products: ProductWithImages[];
  loading?: boolean;
}

export function ProductGrid({ products, loading = false }: ProductGridProps) {
  const t = useTranslations('products');

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 rounded-full bg-gray-100 p-4">
          <Package className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          {t('noResults')}
        </h3>
        <p className="text-gray-500">{t('tryDifferent')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-[#FDFBF7]">
      <Skeleton className="aspect-square w-full" />
      <div className="p-3">
        <Skeleton className="mb-2 h-3 w-1/3" />
        <Skeleton className="mb-1 h-4 w-full" />
        <Skeleton className="mb-3 h-4 w-2/3" />
        <Skeleton className="mb-2 h-6 w-1/2" />
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  );
}
