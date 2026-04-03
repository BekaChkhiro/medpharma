'use client';

/**
 * Empty checkout state component
 * Shown when cart is empty during checkout
 */

import Link from 'next/link';

import { ShoppingBag } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Card, CardContent } from '@/components/ui/card';

export function EmptyCheckout() {
  const t = useTranslations('cart');

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="mb-4 rounded-full bg-muted p-4">
          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="mb-2 text-xl font-semibold">{t('empty')}</h2>
        <p className="mb-6 text-center text-muted-foreground">
          {t('emptyDescription')}
        </p>
        <Link
          href="/products"
          className="inline-flex h-10 items-center justify-center rounded-md bg-[#df2b1b] px-4 py-2 font-medium text-white shadow-sm transition-colors hover:bg-[#c42418] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {t('continueShopping')}
        </Link>
      </CardContent>
    </Card>
  );
}
