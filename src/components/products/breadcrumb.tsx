'use client';

import { ChevronRight, Home } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  const t = useTranslations('nav');

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center text-sm', className)}
    >
      <ol className="flex flex-wrap items-center gap-1">
        {/* Home */}
        <li>
          <Link
            href="/"
            className="flex items-center text-gray-500 transition-colors hover:text-primary"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">{t('home')}</span>
          </Link>
        </li>

        {/* Separator */}
        <li aria-hidden="true">
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </li>

        {/* Breadcrumb Items */}
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-gray-500 transition-colors hover:text-primary"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    'line-clamp-1',
                    isLast ? 'font-medium text-gray-900' : 'text-gray-500'
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <ChevronRight
                  className="h-4 w-4 text-gray-400"
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

interface ProductBreadcrumbProps {
  category?: {
    slug: string;
    nameKa: string;
    nameEn: string;
    parent?: {
      slug: string;
      nameKa: string;
      nameEn: string;
    } | null;
  } | null;
  productName: string;
  className?: string;
}

export function ProductBreadcrumb({
  category,
  productName,
  className,
}: ProductBreadcrumbProps) {
  const locale = useLocale() as 'ka' | 'en';
  const t = useTranslations('nav');

  const items: BreadcrumbItem[] = [
    {
      label: t('products'),
      href: '/products',
    },
  ];

  if (category) {
    // Add parent category if exists
    if (category.parent) {
      items.push({
        label: locale === 'ka' ? category.parent.nameKa : category.parent.nameEn,
        href: `/category/${category.parent.slug}`,
      });
    }

    // Add current category
    items.push({
      label: locale === 'ka' ? category.nameKa : category.nameEn,
      href: `/category/${category.slug}`,
    });
  }

  // Add product name (no link, current page)
  items.push({
    label: productName,
  });

  return <Breadcrumb items={items} className={className} />;
}
