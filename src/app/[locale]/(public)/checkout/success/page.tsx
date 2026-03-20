'use client';

/**
 * Checkout Success Page
 * T3.12: Displays order confirmation with order number
 *
 * Features:
 * - Displays success message and order number
 * - Shows order summary (items, totals)
 * - Email confirmation indicator
 * - Links to continue shopping and track order
 * - Clears cart and checkout state on mount
 */

import { useEffect, useState, useCallback, useMemo, Suspense } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import {
  CheckCircle2,
  ShoppingBag,
  Search,
  Mail,
  Package,
  MapPin,
  CreditCard,
  Copy,
  Check,
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPriceWithLocale } from '@/hooks/use-cart';
import { useCartStore } from '@/store/cart-store';
import { useCheckoutStore } from '@/store/checkout-store';

// Order item from API response
interface OrderItem {
  id: string;
  productId: string;
  productNameKa: string;
  productNameEn: string;
  productSku: string;
  productImage: string | null;
  quantity: number;
  unitPrice: number;
  total: number;
}

// Order data structure from API
interface OrderData {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryCity: string;
  deliveryAddress: string;
  deliveryNotes: string | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
  items: OrderItem[];
  deliveryZone: {
    id: string;
    nameKa: string;
    nameEn: string;
  } | null;
}

function SuccessContent() {
  const t = useTranslations('order.success');
  const tCart = useTranslations('cart');
  const tCheckout = useTranslations('checkout');
  const locale = useLocale() as 'ka' | 'en';
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get order number from URL params
  const orderNumber = searchParams.get('order');

  // State
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Get store actions
  const clearCart = useCartStore((state) => state.clearCart);
  const resetCheckout = useCheckoutStore((state) => state.resetCheckout);

  // Format price helper
  const formatPrice = useCallback(
    (price: number) => formatPriceWithLocale(price, locale),
    [locale]
  );

  // Clear cart and checkout on success
  useEffect(() => {
    clearCart();
    resetCheckout();
  }, [clearCart, resetCheckout]);

  // Fetch order data if order number is provided
  useEffect(() => {
    async function fetchOrder() {
      if (!orderNumber) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/orders/${orderNumber}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.order) {
            setOrderData(data.data.order);
          }
        }
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrder();
  }, [orderNumber]);

  // Copy order number to clipboard
  const copyOrderNumber = useCallback(async () => {
    if (orderNumber) {
      try {
        await navigator.clipboard.writeText(orderNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  }, [orderNumber]);

  // Get payment method display
  const paymentMethodDisplay = useMemo(() => {
    if (!orderData) return '';
    const methodMap: Record<string, string> = {
      TBC_CARD: tCheckout('paymentMethod.tbc'),
      BOG_IPAY: tCheckout('paymentMethod.bog'),
      CASH_ON_DELIVERY: tCheckout('paymentMethod.cash'),
    };
    return methodMap[orderData.paymentMethod] || orderData.paymentMethod;
  }, [orderData, tCheckout]);

  // Redirect if no order number
  if (!orderNumber) {
    return (
      <Container size="sm" className="py-12 md:py-16">
        <Card className="overflow-hidden">
          <CardContent className="p-6 text-center md:p-8">
            <p className="text-muted-foreground">{t('noOrder')}</p>
            <Link href="/products" className="mt-4 inline-block">
              <Button variant="primary">{t('continueShopping')}</Button>
            </Link>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container size="md" className="py-12 md:py-16">
      <Card className="overflow-hidden">
        {/* Success Header Banner */}
        <div className="bg-green-50 px-6 py-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-green-800 md:text-3xl">
            {t('title')}
          </h1>
          <p className="mt-2 text-green-700">{t('message')}</p>
        </div>

        <CardContent className="p-6 md:p-8">
          {/* Order Number */}
          <div className="mb-6 rounded-lg bg-slate-50 p-4 text-center">
            <p className="text-sm text-muted-foreground">{t('orderNumber')}</p>
            <div className="mt-1 flex items-center justify-center gap-2">
              <p className="text-2xl font-bold text-foreground">{orderNumber}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyOrderNumber}
                className="h-8 w-8 p-0"
                title="Copy order number"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Email Confirmation Notice */}
          <div className="mb-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>{t('emailSent')}</span>
          </div>

          {/* Order Details (if loaded) */}
          {orderData && !isLoading && (
            <>
              <Separator className="my-6" />

              {/* Order Items */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  {tCheckout('review.items')} ({orderData.items.length})
                </div>

                <div className="space-y-3">
                  {orderData.items.map((item) => {
                    const itemName =
                      locale === 'en' ? item.productNameEn : item.productNameKa;

                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3"
                      >
                        {/* Product Image */}
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                          {item.productImage ? (
                            <Image
                              src={item.productImage}
                              alt={itemName}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium">{itemName}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity} × {formatPrice(item.unitPrice)}
                          </p>
                        </div>

                        {/* Item Total */}
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-medium">{formatPrice(item.total)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Separator className="my-6" />

              {/* Delivery Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {tCheckout('review.deliveryAddress')}
                </div>
                <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                  <p className="font-medium">
                    {orderData.deliveryZone
                      ? locale === 'en'
                        ? orderData.deliveryZone.nameEn
                        : orderData.deliveryZone.nameKa
                      : orderData.deliveryCity}
                  </p>
                  <p className="text-muted-foreground">{orderData.deliveryAddress}</p>
                  {orderData.deliveryNotes && (
                    <p className="mt-1 text-xs italic text-muted-foreground">
                      {orderData.deliveryNotes}
                    </p>
                  )}
                </div>
              </div>

              <Separator className="my-6" />

              {/* Payment Method */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  {tCheckout('review.paymentMethod')}
                </div>
                <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                  <p className="font-medium">{paymentMethodDisplay}</p>
                  <Badge
                    variant={
                      orderData.paymentStatus === 'PAID'
                        ? 'default'
                        : orderData.paymentStatus === 'PENDING'
                          ? 'secondary'
                          : 'destructive'
                    }
                    className="mt-2"
                  >
                    {orderData.paymentMethod === 'CASH_ON_DELIVERY'
                      ? t('payOnDelivery')
                      : orderData.paymentStatus === 'PAID'
                        ? t('paid')
                        : t('paymentPending')}
                  </Badge>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Order Totals */}
              <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{tCart('subtotal')}</span>
                  <span>{formatPrice(orderData.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{tCart('delivery')}</span>
                  {orderData.deliveryFee === 0 ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="h-3 w-3" />
                      {tCart('deliveryFree')}
                    </span>
                  ) : (
                    <span>{formatPrice(orderData.deliveryFee)}</span>
                  )}
                </div>
                <Separator className="my-2" />
                <div className="flex items-center justify-between text-base font-semibold">
                  <span>{tCart('total')}</span>
                  <span className="text-lg">{formatPrice(orderData.total)}</span>
                </div>
              </div>
            </>
          )}

          <Separator className="my-6" />

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/products" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                leftIcon={<ShoppingBag className="h-4 w-4" />}
              >
                {t('continueShopping')}
              </Button>
            </Link>

            <Link href={`/order/tracking?order=${orderNumber}`} className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                leftIcon={<Search className="h-4 w-4" />}
              >
                {t('trackOrder')}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Help Text */}
      <p className="mt-6 text-center text-sm text-muted-foreground">{t('helpText')}</p>
    </Container>
  );
}

function SuccessLoading() {
  return (
    <Container size="md" className="py-12 md:py-16">
      <Card className="overflow-hidden">
        <div className="bg-green-50 px-6 py-8 text-center">
          <Skeleton className="mx-auto mb-4 h-16 w-16 rounded-full" />
          <Skeleton className="mx-auto h-8 w-64" />
          <Skeleton className="mx-auto mt-2 h-4 w-48" />
        </div>
        <CardContent className="p-6 md:p-8">
          <Skeleton className="mx-auto mb-6 h-20 w-full max-w-sm" />
          <Skeleton className="mx-auto mb-6 h-4 w-48" />
          <Separator className="my-6" />
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Skeleton className="h-12 w-full sm:w-40" />
            <Skeleton className="h-12 w-full sm:w-40" />
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<SuccessLoading />}>
      <SuccessContent />
    </Suspense>
  );
}
