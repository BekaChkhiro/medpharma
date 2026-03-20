'use client';

/**
 * Checkout Failure Page
 * Displays payment failure message with retry option
 */

import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

import { AlertCircle, ArrowLeft, HeadphonesIcon, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Skeleton } from '@/components/ui/skeleton';

function FailureContent() {
  const t = useTranslations('order.failure');
  const tCommon = useTranslations('common');
  const searchParams = useSearchParams();

  // Optional: Get error details from query params
  const errorCode = searchParams.get('code');
  const orderId = searchParams.get('order');

  return (
    <Container size="sm" className="py-12 md:py-16">
      <Card className="overflow-hidden">
        {/* Error Header Banner */}
        <div className="bg-red-50 px-6 py-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-red-800 md:text-3xl">
            {t('title')}
          </h1>
        </div>

        <CardContent className="p-6 md:p-8">
          {/* Error Message */}
          <p className="mb-6 text-center text-muted-foreground">
            {t('message')}
          </p>

          {/* Error Details (if available) */}
          {errorCode && (
            <div className="mb-6 rounded-lg bg-slate-50 p-4 text-center">
              <p className="text-sm text-muted-foreground">
                {tCommon('error')}: <code className="font-mono text-slate-600">{errorCode}</code>
              </p>
              {orderId && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Order: <code className="font-mono text-slate-600">{orderId}</code>
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/checkout" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                leftIcon={<RefreshCw className="h-4 w-4" />}
              >
                {t('tryAgain')}
              </Button>
            </Link>

            <Link href="/contact" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                leftIcon={<HeadphonesIcon className="h-4 w-4" />}
              >
                {t('contactSupport')}
              </Button>
            </Link>
          </div>

          {/* Back to Shopping Link */}
          <div className="mt-6 text-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              {tCommon('back')}
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Help Text */}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t('helpText')}
      </p>
    </Container>
  );
}

function FailureLoading() {
  return (
    <Container size="sm" className="py-12 md:py-16">
      <Card className="overflow-hidden">
        <div className="bg-red-50 px-6 py-8 text-center">
          <Skeleton className="mx-auto mb-4 h-16 w-16 rounded-full" />
          <Skeleton className="mx-auto h-8 w-48" />
        </div>
        <CardContent className="p-6 md:p-8">
          <Skeleton className="mx-auto mb-6 h-4 w-64" />
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Skeleton className="h-12 w-full sm:w-40" />
            <Skeleton className="h-12 w-full sm:w-40" />
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}

export default function CheckoutFailurePage() {
  return (
    <Suspense fallback={<FailureLoading />}>
      <FailureContent />
    </Suspense>
  );
}
