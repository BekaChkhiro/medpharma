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
          className="inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 bg-[#df2b1b] text-white hover:bg-[#c42418] shadow-sm hover:shadow-md h-11 px-5 text-sm rounded-xl"
        >
          {t('continueShopping')}
        </Link>
      </CardContent>
    </Card>
  );
}
