'use client';

/**
 * Checkout Step 4: Order Review
 * T3.8: Order review and confirmation
 *
 * Features:
 * - Displays all collected checkout information
 * - Cart items summary with prices
 * - Personal info, delivery address, payment method
 * - Order totals (subtotal, delivery, total)
 * - Place Order button with API integration
 * - Terms of service agreement
 * - Redirects to success/failure page
 */

import { useState, useMemo, useCallback } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ClipboardCheck,
  ArrowLeft,
  ShoppingBag,
  User,
  MapPin,
  CreditCard,
  Package,
  CheckCircle2,
  Pencil,
  AlertCircle,
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatPriceWithLocale } from '@/hooks/use-cart';
import { useCartItems, useCartSubtotal, useCartStore } from '@/store/cart-store';
import {
  usePersonalInfo,
  useDeliveryInfo,
  usePaymentInfo,
  useCheckoutActions,
  type PaymentMethod,
} from '@/store/checkout-store';

// Payment method labels mapping
const PAYMENT_METHOD_KEYS: Record<string, string> = {
  tbc: 'tbc',
  bog: 'bog',
  cash: 'cash',
};

// Stock error from API
interface StockError {
  productId: string;
  productName: string;
  requested: number;
  available: number;
}

// Generate idempotency key
function generateIdempotencyKey(): string {
  return `order_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

export function StepReview() {
  const t = useTranslations('checkout.review');
  const tCheckout = useTranslations('checkout');
  const tPayment = useTranslations('checkout.paymentMethod');
  const tCart = useTranslations('cart');
  const tCommon = useTranslations('common');
  const tErrors = useTranslations('errors');
  const locale = useLocale() as 'ka' | 'en';
  const router = useRouter();

  // Checkout data
  const personalInfo = usePersonalInfo();
  const deliveryInfo = useDeliveryInfo();
  const paymentInfo = usePaymentInfo();
  const { previousStep, setStep, resetCheckout } = useCheckoutActions();

  // Cart data
  const cartItems = useCartItems();
  const cartSubtotal = useCartSubtotal();
  const clearCart = useCartStore((state) => state.clearCart);

  // State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stockErrors, setStockErrors] = useState<StockError[]>([]);

  // Format price helper
  const formatPrice = useCallback(
    (price: number) => formatPriceWithLocale(price, locale),
    [locale]
  );

  // Calculate totals
  const totals = useMemo(() => {
    const deliveryFee = deliveryInfo?.deliveryFee ?? 0;
    const total = cartSubtotal + deliveryFee;

    return {
      subtotal: cartSubtotal,
      deliveryFee,
      total,
      isFreeDelivery: deliveryFee === 0,
    };
  }, [cartSubtotal, deliveryInfo?.deliveryFee]);

  // Get payment method display name
  const paymentMethodName = paymentInfo?.method
    ? tPayment(PAYMENT_METHOD_KEYS[paymentInfo.method])
    : '';

  // Handle edit section navigation
  const handleEditSection = (step: 'info' | 'delivery' | 'payment') => {
    setStep(step);
  };

  // Map frontend payment method to API format
  const mapPaymentMethod = (method: PaymentMethod): string => {
    const methodMap: Record<PaymentMethod, string> = {
      tbc: 'tbc',
      bog: 'bog',
      cash: 'cash',
    };
    return methodMap[method];
  };

  // Handle place order
  const handlePlaceOrder = async () => {
    // Validate we have all required data
    if (!personalInfo || !deliveryInfo || !paymentInfo) {
      setError(tErrors('general'));
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setStockErrors([]);

    try {
      // Prepare order data
      const orderData = {
        customer: {
          name: `${personalInfo.firstName} ${personalInfo.lastName}`,
          email: personalInfo.email,
          phone: personalInfo.phone,
        },
        delivery: {
          zoneId: deliveryInfo.deliveryZoneId,
          zoneName: deliveryInfo.zoneName,
          address: deliveryInfo.address,
          notes: deliveryInfo.notes || undefined,
          fee: deliveryInfo.deliveryFee,
        },
        paymentMethod: mapPaymentMethod(paymentInfo.method),
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.salePrice ?? item.price,
          nameKa: item.nameKa,
          nameEn: item.nameEn,
          sku: item.sku,
          imageUrl: item.imageUrl,
        })),
        idempotencyKey: generateIdempotencyKey(),
      };

      // Make API request
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-locale': locale,
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Order created successfully
        const orderNumber = result.data.order.orderNumber;

        // Clear cart and checkout state
        clearCart();
        resetCheckout();

        // Redirect to success page
        router.push(`/${locale}/checkout/success?order=${orderNumber}`);
      } else {
        // Handle specific error types
        if (result.code === 'INSUFFICIENT_STOCK' && result.stockErrors) {
          setStockErrors(result.stockErrors);
          setError(t('stockError'));
        } else if (result.code === 'INVALID_DELIVERY_ZONE') {
          setError(t('deliveryZoneError'));
        } else if (response.status === 429) {
          setError(t('rateLimitError'));
        } else {
          setError(result.error || tErrors('general'));
        }
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Order submission failed:', err);
      setError(tErrors('networkError'));
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5" />
          {t('title')}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stock Errors */}
        {stockErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="mt-2 space-y-1">
                {stockErrors.map((stockError) => (
                  <li key={stockError.productId} className="text-sm">
                    {stockError.productName}: {t('stockAvailable', { available: stockError.available, requested: stockError.requested })}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Personal Info Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <User className="h-4 w-4 text-muted-foreground" />
              {tCheckout('personalInfo.title')}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleEditSection('info')}
              className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Pencil className="mr-1 h-3 w-3" />
              {tCommon('edit')}
            </Button>
          </div>
          {personalInfo && (
            <div className="rounded-lg border bg-muted/30 p-3 text-sm">
              <p className="font-medium">
                {personalInfo.firstName} {personalInfo.lastName}
              </p>
              <p className="text-muted-foreground">{personalInfo.email}</p>
              <p className="text-muted-foreground">{personalInfo.phone}</p>
            </div>
          )}
        </div>

        <Separator />

        {/* Delivery Info Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              {t('deliveryAddress')}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleEditSection('delivery')}
              className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Pencil className="mr-1 h-3 w-3" />
              {tCommon('edit')}
            </Button>
          </div>
          {deliveryInfo && (
            <div className="rounded-lg border bg-muted/30 p-3 text-sm">
              <p className="font-medium">{deliveryInfo.zoneName}</p>
              <p className="text-muted-foreground">{deliveryInfo.address}</p>
              {deliveryInfo.notes && (
                <p className="mt-1 text-xs italic text-muted-foreground">
                  {deliveryInfo.notes}
                </p>
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* Payment Method Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              {t('paymentMethod')}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleEditSection('payment')}
              className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Pencil className="mr-1 h-3 w-3" />
              {tCommon('edit')}
            </Button>
          </div>
          {paymentInfo && (
            <div className="rounded-lg border bg-muted/30 p-3 text-sm">
              <p className="font-medium">{paymentMethodName}</p>
            </div>
          )}
        </div>

        <Separator />

        {/* Cart Items Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Package className="h-4 w-4 text-muted-foreground" />
            {t('items')} ({cartItems.length})
          </div>
          <div className="space-y-3">
            {cartItems.map((item) => {
              const itemName = locale === 'en' ? item.nameEn : item.nameKa;
              const itemPrice = item.salePrice ?? item.price;
              const itemTotal = itemPrice * item.quantity;

              return (
                <div
                  key={item.productId}
                  className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3"
                >
                  {/* Product Image */}
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={itemName}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{itemName}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {item.quantity} × {formatPrice(itemPrice)}
                      </span>
                      {item.salePrice && item.salePrice < item.price && (
                        <Badge variant="destructive" className="h-4 px-1 text-[10px]">
                          -{Math.round(((item.price - item.salePrice) / item.price) * 100)}%
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-medium">{formatPrice(itemTotal)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Order Totals */}
        <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{tCart('subtotal')}</span>
            <span>{formatPrice(totals.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{tCart('delivery')}</span>
            {totals.isFreeDelivery ? (
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle2 className="h-3 w-3" />
                {tCart('deliveryFree')}
              </span>
            ) : (
              <span>{formatPrice(totals.deliveryFee)}</span>
            )}
          </div>
          <Separator />
          <div className="flex items-center justify-between text-base font-semibold">
            <span>{tCart('total')}</span>
            <span className="text-lg">{formatPrice(totals.total)}</span>
          </div>
        </div>

        {/* Terms Agreement */}
        <p className="text-center text-xs text-muted-foreground">
          {tCheckout('agreement')}{' '}
          <Link href="/terms" className="underline hover:text-foreground">
            {tCheckout('termsLink')}
          </Link>
        </p>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={previousStep}
          disabled={isSubmitting}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          {tCommon('back')}
        </Button>
        <Button
          type="button"
          onClick={handlePlaceOrder}
          isLoading={isSubmitting}
          leftIcon={<ShoppingBag className="h-4 w-4" />}
        >
          {isSubmitting ? tCheckout('processing') : tCheckout('placeOrder')}
        </Button>
      </CardFooter>
    </Card>
  );
}
