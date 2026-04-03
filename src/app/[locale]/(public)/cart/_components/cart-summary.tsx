'use client';

/**
 * Cart Summary Component
 * Displays subtotal, delivery fee, total, and checkout button
 */

import { ShieldCheck, Truck } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/hooks/use-cart';
import { Link } from '@/i18n/navigation';

interface CartSummaryProps {
  subtotal: number;
  deliveryFee: number;
  total: number;
  isFreeDelivery: boolean;
  amountUntilFreeDelivery: number;
  freeDeliveryThreshold: number;
  itemCount: number;
}

export function CartSummary({
  subtotal,
  deliveryFee,
  total,
  isFreeDelivery,
  amountUntilFreeDelivery,
  freeDeliveryThreshold,
  itemCount,
}: CartSummaryProps) {
  const t = useTranslations('cart');

  return (
    <div className="sticky top-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {t('subtotal')}
            <span className="text-sm font-normal text-muted-foreground">
              ({itemCount} {itemCount === 1 ? t('item') : t('items')})
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Subtotal row */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t('subtotal')}</span>
            <span className="font-medium">{formatPrice(subtotal)}</span>
          </div>

          {/* Delivery row */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t('delivery')}</span>
            <span className={isFreeDelivery ? 'font-medium text-emerald-600' : 'font-medium'}>
              {isFreeDelivery ? t('deliveryFree') : formatPrice(deliveryFee)}
            </span>
          </div>

          {/* Free delivery progress */}
          {!isFreeDelivery && amountUntilFreeDelivery > 0 && (
            <div className="rounded-lg bg-amber-50 p-3 text-sm">
              <div className="flex items-center gap-2 text-amber-800">
                <Truck className="h-4 w-4" />
                <span>
                  {t('freeDeliveryThreshold', {
                    amount: amountUntilFreeDelivery.toFixed(2),
                  })}
                </span>
              </div>
              {/* Progress bar */}
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-amber-200">
                <div
                  className="h-full bg-amber-500 transition-all"
                  style={{
                    width: `${Math.min((subtotal / freeDeliveryThreshold) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Free delivery achieved */}
          {isFreeDelivery && (
            <div className="rounded-lg bg-emerald-50 p-3 text-sm">
              <div className="flex items-center gap-2 text-emerald-700">
                <Truck className="h-4 w-4" />
                <span>{t('deliveryFree')}!</span>
              </div>
            </div>
          )}

          <Separator />

          {/* Total row */}
          <div className="flex items-center justify-between text-lg font-bold">
            <span>{t('total')}</span>
            <span>{formatPrice(total)}</span>
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-3">
          {/* Checkout button */}
          <Link href="/checkout" className="w-full">
            <Button size="lg" className="w-full">
              {t('checkout')}
            </Button>
          </Link>

          {/* Continue shopping link */}
          <Link href="/products" className="w-full">
            <Button variant="outline" size="lg" className="w-full">
              {t('continueShopping')}
            </Button>
          </Link>
        </CardFooter>
      </Card>

      {/* Trust badges */}
      <Card className="bg-slate-50">
        <CardContent className="py-4">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <ShieldCheck className="h-5 w-5 text-slate-600" />
            <div>
              <p className="font-medium text-slate-900">Secure Checkout</p>
              <p className="text-xs">Your data is protected</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
