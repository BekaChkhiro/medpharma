'use client';

/**
 * Checkout order summary component
 * Shows cart items and totals on the side
 */

import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart, useCartTotals, formatPriceWithLocale } from '@/hooks/use-cart';
import { useDeliveryInfo } from '@/store/checkout-store';

export function CheckoutSummary() {
  const t = useTranslations('checkout');
  const tCart = useTranslations('cart');
  const locale = useLocale() as 'ka' | 'en';
  const { items } = useCart();
  const deliveryInfo = useDeliveryInfo();

  // Get delivery fee from checkout state or default
  const deliveryFee = deliveryInfo?.deliveryFee ?? 0;
  const freeAbove = deliveryInfo?.freeAbove ?? undefined;

  const { subtotal, deliveryFee: actualDeliveryFee, total, isFreeDelivery } = useCartTotals(
    deliveryFee,
    freeAbove ?? undefined
  );

  const formatPrice = (price: number) => formatPriceWithLocale(price, locale);

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="text-lg">{t('review.orderSummary')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cart Items */}
        <div className="max-h-[300px] space-y-3 overflow-y-auto">
          {items.map((item) => {
            const name = locale === 'en' ? item.nameEn : item.nameKa;
            const price = item.salePrice ?? item.price;

            return (
              <div key={item.productId} className="flex gap-3">
                {/* Product Image */}
                {item.imageUrl ? (
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                    <Image
                      src={item.imageUrl}
                      alt={name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                ) : (
                  <div className="h-12 w-12 flex-shrink-0 rounded-md bg-muted" />
                )}

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.quantity} x {formatPrice(price)}
                  </p>
                </div>

                {/* Item Total */}
                <p className="text-sm font-medium">
                  {formatPrice(price * item.quantity)}
                </p>
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Totals */}
        <div className="space-y-2">
          {/* Subtotal */}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('summary.subtotal')}</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          {/* Delivery */}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('summary.delivery')}</span>
            <span>
              {deliveryInfo ? (
                isFreeDelivery ? (
                  <span className="text-green-600">{tCart('deliveryFree')}</span>
                ) : (
                  formatPrice(actualDeliveryFee)
                )
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </span>
          </div>

          <Separator />

          {/* Total */}
          <div className="flex justify-between text-base font-bold">
            <span>{t('summary.total')}</span>
            <span>{formatPrice(deliveryInfo ? total : subtotal)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
