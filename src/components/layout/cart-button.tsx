'use client';

import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

interface CartButtonProps {
  itemCount?: number;
  className?: string;
}

export function CartButton({ itemCount = 0, className }: CartButtonProps) {
  const t = useTranslations('nav');

  return (
    <Link
      href="/cart"
      className={cn(
        'relative inline-flex items-center justify-center p-2 rounded-full',
        'text-foreground hover:bg-secondary transition-colors',
        'focus:outline-none focus-ring',
        className
      )}
      aria-label={`${t('cart')} (${itemCount} ${itemCount === 1 ? 'item' : 'items'})`}
    >
      {/* Cart Icon */}
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
        />
      </svg>

      {/* Item Count Badge */}
      {itemCount > 0 && (
        <span
          className={cn(
            'absolute -top-0.5 -right-0.5 flex items-center justify-center',
            'min-w-[18px] h-[18px] px-1',
            'text-xs font-medium text-white bg-slate-900 rounded-full',
            'animate-scaleIn'
          )}
        >
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Link>
  );
}
