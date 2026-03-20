'use client';

/**
 * Empty Cart Component
 * Displays when the cart has no items
 */

import { ShoppingCart } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from '@/i18n/navigation';

export function EmptyCart() {
  const t = useTranslations('cart');

  return (
    <Card className="mx-auto max-w-md">
      <CardContent className="flex flex-col items-center py-12 text-center">
        {/* Empty cart icon */}
        <div className="mb-6 rounded-full bg-slate-100 p-6">
          <ShoppingCart className="h-12 w-12 text-slate-400" />
        </div>

        {/* Message */}
        <h2 className="mb-2 text-xl font-semibold text-slate-900">
          {t('empty')}
        </h2>
        <p className="mb-8 text-slate-600">
          {t('emptyDescription')}
        </p>

        {/* Continue shopping button */}
        <Link href="/products">
          <Button size="lg">
            {t('continueShopping')}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
