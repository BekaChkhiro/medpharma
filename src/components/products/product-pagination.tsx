'use client';

import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui';

interface ProductPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function ProductPagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
}: ProductPaginationProps) {
  const t = useTranslations('products.pagination');

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const delta = 1; // Number of pages to show on each side of current

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (page > delta + 2) {
        pages.push('ellipsis');
      }

      // Pages around current
      const start = Math.max(2, page - delta);
      const end = Math.min(totalPages - 1, page + delta);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (page < totalPages - delta - 1) {
        pages.push('ellipsis');
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
      {/* Results info */}
      <p className="text-sm text-gray-500">
        {t('showing')} <span className="font-medium">{startItem}</span>{' '}
        {t('to')} <span className="font-medium">{endItem}</span>{' '}
        {t('of')} <span className="font-medium">{total}</span> {t('results')}
      </p>

      {/* Pagination controls */}
      <nav className="flex items-center gap-1">
        {/* Previous */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">{t('page')}</span>
        </Button>

        {/* Page numbers */}
        <div className="hidden items-center gap-1 sm:flex">
          {getPageNumbers().map((pageNum, idx) =>
            pageNum === 'ellipsis' ? (
              <span
                key={`ellipsis-${idx}`}
                className="flex h-9 w-9 items-center justify-center"
              >
                <MoreHorizontal className="h-4 w-4 text-gray-400" />
              </span>
            ) : (
              <Button
                key={pageNum}
                variant={page === pageNum ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className="h-9 w-9 p-0"
              >
                {pageNum}
              </Button>
            )
          )}
        </div>

        {/* Mobile page indicator */}
        <span className="px-2 text-sm text-gray-500 sm:hidden">
          {page} / {totalPages}
        </span>

        {/* Next */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="gap-1"
        >
          <span className="hidden sm:inline">{t('page')}</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </nav>
    </div>
  );
}
