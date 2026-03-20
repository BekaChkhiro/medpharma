'use client';

/**
 * Order Tracking Page
 * T3.14: Allows customers to look up their order by order number + email
 *
 * Features:
 * - Search form with order number and email validation
 * - Status timeline (pending → confirmed → processing → shipped → delivered)
 * - Order details display (items, totals, delivery info)
 * - Pre-fill order number from URL params (from success page redirect)
 * - Responsive design with bilingual support
 */

import { useEffect, useState, useCallback, useMemo, Suspense } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import {
  Search,
  Package,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle2,
  Truck,
  PackageCheck,
  XCircle,
  AlertCircle,
  ChevronRight,
  Mail,
  Hash,
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPriceWithLocale } from '@/hooks/use-cart';

// Validation schema
const trackingSchema = z.object({
  orderNumber: z
    .string()
    .min(1, 'Order number is required')
    .regex(/^MF-\d{8}$/, 'Invalid order number format (MF-XXXXXXXX)'),
  email: z.string().email('Invalid email address'),
});

type TrackingFormData = z.infer<typeof trackingSchema>;

// Order item from API response
interface OrderItem {
  productNameKa: string;
  productNameEn: string;
  quantity: number;
  unitPrice: number;
  total: number;
  productImage: string | null;
}

// Order data structure from tracking API
interface TrackedOrder {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  customerName: string;
  deliveryCity: string;
  deliveryAddress: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
  shippedAt: string | null;
  deliveredAt: string | null;
  items: OrderItem[];
}

// Status configuration for timeline
const STATUS_ORDER = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] as const;

function TrackingContent() {
  const t = useTranslations('order.tracking');
  const tCheckout = useTranslations('checkout');
  const tCart = useTranslations('cart');
  const tCommon = useTranslations('common');
  const locale = useLocale() as 'ka' | 'en';
  const searchParams = useSearchParams();

  // Get order number from URL params (from success page redirect)
  const initialOrderNumber = searchParams.get('order') || '';

  // State
  const [orderData, setOrderData] = useState<TrackedOrder | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<TrackingFormData>({
    resolver: zodResolver(trackingSchema),
    defaultValues: {
      orderNumber: initialOrderNumber,
      email: '',
    },
  });

  // Set initial order number from URL
  useEffect(() => {
    if (initialOrderNumber) {
      setValue('orderNumber', initialOrderNumber);
    }
  }, [initialOrderNumber, setValue]);

  // Format price helper
  const formatPrice = useCallback(
    (price: number) => formatPriceWithLocale(price, locale),
    [locale]
  );

  // Format date helper
  const formatDate = useCallback(
    (dateString: string) => {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat(locale === 'ka' ? 'ka-GE' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    },
    [locale]
  );

  // Track order handler
  const onSubmit = async (data: TrackingFormData) => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await fetch('/api/orders/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderNumber: data.orderNumber,
          email: data.email,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || t('notFound'));
        setOrderData(null);
        return;
      }

      setOrderData(result.data.order);
    } catch (err) {
      console.error('Tracking error:', err);
      setError(tCommon('error'));
      setOrderData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Get status icon
  const getStatusIcon = useCallback((status: string, isActive: boolean, isPast: boolean) => {
    const iconClass = `h-5 w-5 ${isPast ? 'text-green-600' : isActive ? 'text-primary' : 'text-muted-foreground'}`;

    switch (status) {
      case 'PENDING':
        return <Clock className={iconClass} />;
      case 'CONFIRMED':
        return <CheckCircle2 className={iconClass} />;
      case 'PROCESSING':
        return <Package className={iconClass} />;
      case 'SHIPPED':
        return <Truck className={iconClass} />;
      case 'DELIVERED':
        return <PackageCheck className={iconClass} />;
      case 'CANCELLED':
        return <XCircle className={iconClass} />;
      default:
        return <Clock className={iconClass} />;
    }
  }, []);

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

  // Check if order is cancelled
  const isCancelled = orderData?.status === 'CANCELLED';

  // Get current status index
  const currentStatusIndex = orderData
    ? STATUS_ORDER.indexOf(orderData.status as typeof STATUS_ORDER[number])
    : -1;

  return (
    <Container size="md" className="py-12 md:py-16">
      {/* Page Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Search className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold md:text-3xl">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('enterOrder')}</p>
      </div>

      {/* Search Form */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Order Number */}
              <div className="space-y-2">
                <Label htmlFor="orderNumber" className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  {t('orderNumber')}
                </Label>
                <Input
                  id="orderNumber"
                  placeholder="MF-20260001"
                  {...register('orderNumber')}
                  error={!!errors.orderNumber}
                />
                {errors.orderNumber && (
                  <p className="text-sm text-red-500">{errors.orderNumber.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {t('email')}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  {...register('email')}
                  error={!!errors.email}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
              leftIcon={<Search className="h-4 w-4" />}
            >
              {t('track')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && hasSearched && (
        <Card className="mb-8 border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-3 p-6">
            <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Order Results */}
      {orderData && (
        <Card>
          <CardHeader className="border-b bg-muted/30">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {orderData.orderNumber}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    isCancelled
                      ? 'destructive'
                      : orderData.status === 'DELIVERED'
                        ? 'default'
                        : 'secondary'
                  }
                >
                  {t(`status.${orderData.status.toLowerCase()}`)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {formatDate(orderData.createdAt)}
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {/* Status Timeline */}
            {!isCancelled && (
              <div className="mb-8">
                <h3 className="mb-4 text-sm font-medium text-muted-foreground">
                  {locale === 'ka' ? 'შეკვეთის სტატუსი' : 'Order Status'}
                </h3>

                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-[22px] top-0 h-full w-0.5 bg-muted" />

                  {/* Timeline Items */}
                  <div className="space-y-4">
                    {STATUS_ORDER.map((status, index) => {
                      const isActive = index === currentStatusIndex;
                      const isPast = index < currentStatusIndex;
                      const statusKey = status.toLowerCase() as 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered';

                      return (
                        <div key={status} className="relative flex items-start gap-4">
                          {/* Status Icon */}
                          <div
                            className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 ${
                              isPast
                                ? 'border-green-600 bg-green-50'
                                : isActive
                                  ? 'border-primary bg-primary/10'
                                  : 'border-muted bg-background'
                            }`}
                          >
                            {getStatusIcon(status, isActive, isPast)}
                          </div>

                          {/* Status Text */}
                          <div className="flex-1 pt-2">
                            <p
                              className={`font-medium ${
                                isPast
                                  ? 'text-green-700'
                                  : isActive
                                    ? 'text-foreground'
                                    : 'text-muted-foreground'
                              }`}
                            >
                              {t(`status.${statusKey}`)}
                            </p>
                            {/* Show timestamp for shipped/delivered */}
                            {status === 'SHIPPED' && orderData.shippedAt && (
                              <p className="text-xs text-muted-foreground">
                                {formatDate(orderData.shippedAt)}
                              </p>
                            )}
                            {status === 'DELIVERED' && orderData.deliveredAt && (
                              <p className="text-xs text-muted-foreground">
                                {formatDate(orderData.deliveredAt)}
                              </p>
                            )}
                          </div>

                          {/* Check mark for completed */}
                          {isPast && (
                            <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Cancelled Status */}
            {isCancelled && (
              <div className="mb-8 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                <div className="flex items-center gap-3">
                  <XCircle className="h-6 w-6 text-destructive" />
                  <div>
                    <p className="font-medium text-destructive">
                      {t('status.cancelled')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {locale === 'ka'
                        ? 'ეს შეკვეთა გაუქმებულია'
                        : 'This order has been cancelled'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Separator className="my-6" />

            {/* Order Items */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-medium">
                <Package className="h-4 w-4 text-muted-foreground" />
                {tCheckout('review.items')} ({orderData.items.length})
              </h3>

              <div className="space-y-3">
                {orderData.items.map((item, index) => {
                  const itemName =
                    locale === 'en' ? item.productNameEn : item.productNameKa;

                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3"
                    >
                      {/* Product Image */}
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                        {item.productImage ? (
                          <Image
                            src={item.productImage}
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
                        <p className="truncate font-medium">{itemName}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} × {formatPrice(item.unitPrice)}
                        </p>
                      </div>

                      {/* Item Total */}
                      <div className="shrink-0 text-right">
                        <p className="font-medium">{formatPrice(item.total)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator className="my-6" />

            {/* Delivery & Payment Info */}
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Delivery Info */}
              <div className="space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {tCheckout('review.deliveryAddress')}
                </h3>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="font-medium">{orderData.customerName}</p>
                  <p className="text-sm text-muted-foreground">{orderData.deliveryCity}</p>
                  <p className="text-sm text-muted-foreground">{orderData.deliveryAddress}</p>
                </div>
              </div>

              {/* Payment Info */}
              <div className="space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-medium">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  {tCheckout('review.paymentMethod')}
                </h3>
                <div className="rounded-lg border bg-muted/30 p-3">
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
                    {orderData.paymentStatus === 'PAID'
                      ? locale === 'ka' ? 'გადახდილია' : 'Paid'
                      : orderData.paymentMethod === 'CASH_ON_DELIVERY'
                        ? locale === 'ka' ? 'გადახდა მიწოდებისას' : 'Pay on delivery'
                        : locale === 'ka' ? 'მოლოდინში' : 'Pending'}
                  </Badge>
                </div>
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
          </CardContent>
        </Card>
      )}

      {/* Continue Shopping Link */}
      <div className="mt-8 text-center">
        <Link href="/products">
          <Button variant="outline" rightIcon={<ChevronRight className="h-4 w-4" />}>
            {locale === 'ka' ? 'შოპინგის გაგრძელება' : 'Continue Shopping'}
          </Button>
        </Link>
      </div>
    </Container>
  );
}

function TrackingLoading() {
  return (
    <Container size="md" className="py-12 md:py-16">
      {/* Header */}
      <div className="mb-8 text-center">
        <Skeleton className="mx-auto mb-4 h-16 w-16 rounded-full" />
        <Skeleton className="mx-auto h-8 w-64" />
        <Skeleton className="mx-auto mt-2 h-4 w-48" />
      </div>

      {/* Form */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
          <Skeleton className="mt-4 h-12" />
        </CardContent>
      </Card>
    </Container>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={<TrackingLoading />}>
      <TrackingContent />
    </Suspense>
  );
}
