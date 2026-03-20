'use client';

import { ArrowUpDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Select } from '@/components/ui';
import { type SortOption } from '@/services/products';

interface ProductSortProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export function ProductSort({ value, onChange }: ProductSortProps) {
  const t = useTranslations('products.sort');

  const options: { value: SortOption; label: string }[] = [
    { value: 'popularity', label: t('popularity') },
    { value: 'date_desc', label: t('newest') },
    { value: 'price_asc', label: t('priceAsc') },
    { value: 'price_desc', label: t('priceDesc') },
    { value: 'name_asc', label: t('nameAsc') },
    { value: 'name_desc', label: t('nameDesc') },
  ];

  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="h-4 w-4 text-gray-500" />
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        options={options}
        className="min-w-[180px]"
      />
    </div>
  );
}
