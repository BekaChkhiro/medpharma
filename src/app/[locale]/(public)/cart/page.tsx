'use client';

/**
 * Public Cart Page
 * T3.3: Cart page with product list, quantity controls, subtotal + delivery fee
 */

import { useTranslations, useLocale } from 'next-intl';

import { Skeleton } from '@/components/ui';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { useCart, useCartTotals } from '@/hooks/use-cart';

import { CartItemsList } from './_components/cart-items-list';
import { CartSummary } from './_components/cart-summary';
import { EmptyCart } from './_components/empty-cart';

// Default delivery settings (would come from API/config in production)
const DEFAULT_DELIVERY_FEE = 5;
const FREE_DELIVERY_THRESHOLD = 50;

function CartSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Cart Items Skeleton - 2/3 width on desktop */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="border-b">
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent className="divide-y p-0">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-4 p-4 sm:p-6">
                <Skeleton className="h-24 w-24 flex-shrink-0 rounded-lg sm:h-32 sm:w-32" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-6 w-20" />
                  <div className="mt-auto flex items-center gap-3">
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Cart Summary Skeleton - 1/3 width on desktop */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-px w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CartPage() {
  const t = useTranslations('cart');
  const locale = useLocale() as 'ka' | 'en';
  const { items, isEmpty, clearCart, isHydrated } = useCart();
  const { subtotal, deliveryFee, total, isFreeDelivery, amountUntilFreeDelivery } = useCartTotals(
    DEFAULT_DELIVERY_FEE,
    FREE_DELIVERY_THRESHOLD
  );

  // Show skeleton while hydrating to prevent hydration mismatch
  if (!isHydrated) {
    return (
      <Container size="lg" className="py-8 md:py-12">
        <h1 className="mb-8 text-2xl font-bold md:text-3xl">
          {t('title')}
        </h1>
        <CartSkeleton />
      </Container>
    );
  }

  if (isEmpty) {
    return (
      <Container size="lg" className="py-8 md:py-12">
        <EmptyCart />
      </Container>
    );
  }

  return (
    <Container size="lg" className="py-8 md:py-12">
      {/* Page Title */}
      <h1 className="mb-8 text-2xl font-bold md:text-3xl">
        {t('title')}
      </h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items - 2/3 width on desktop */}
        <div className="lg:col-span-2">
          <CartItemsList
            items={items}
            locale={locale}
            onClearCart={clearCart}
          />
        </div>

        {/* Cart Summary - 1/3 width on desktop */}
        <div className="lg:col-span-1">
          <CartSummary
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            total={total}
            isFreeDelivery={isFreeDelivery}
            amountUntilFreeDelivery={amountUntilFreeDelivery}
            freeDeliveryThreshold={FREE_DELIVERY_THRESHOLD}
            itemCount={items.length}
          />
        </div>
      </div>
    </Container>
  );
}
