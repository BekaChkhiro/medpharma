'use client';

/**
 * Public Checkout Page
 * Multi-step checkout: Personal Info -> Delivery -> Payment -> Review
 */

import { useEffect } from 'react';

import { useTranslations } from 'next-intl';

import { Container } from '@/components/ui/container';
import { useCart } from '@/hooks/use-cart';
import { useCurrentStep, useCheckoutActions } from '@/store/checkout-store';

import { CheckoutSteps } from './_components/checkout-steps';
import { CheckoutSummary } from './_components/checkout-summary';
import { EmptyCheckout } from './_components/empty-checkout';
import { StepDelivery } from './_components/step-delivery';
import { StepPayment } from './_components/step-payment';
import { StepPersonalInfo } from './_components/step-personal-info';
import { StepReview } from './_components/step-review';

export default function CheckoutPage() {
  const t = useTranslations('checkout');
  const { isEmpty } = useCart();
  const currentStep = useCurrentStep();
  const { resetCheckout } = useCheckoutActions();

  // Reset checkout if cart becomes empty (user removed items)
  useEffect(() => {
    if (isEmpty) {
      resetCheckout();
    }
  }, [isEmpty, resetCheckout]);

  // Show empty state if cart is empty
  if (isEmpty) {
    return (
      <Container size="xl" className="py-8 md:py-12">
        <EmptyCheckout />
      </Container>
    );
  }

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'info':
        return <StepPersonalInfo />;
      case 'delivery':
        return <StepDelivery />;
      case 'payment':
        return <StepPayment />;
      case 'review':
        return <StepReview />;
      default:
        return <StepPersonalInfo />;
    }
  };

  return (
    <Container size="xl" className="py-8 md:py-12">
      {/* Page Title */}
      <h1 className="mb-8 text-2xl font-bold md:text-3xl">{t('title')}</h1>

      {/* Step Indicator */}
      <CheckoutSteps currentStep={currentStep} />

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Step Content - 2/3 width on desktop */}
        <div className="lg:col-span-2">{renderStepContent()}</div>

        {/* Order Summary - 1/3 width on desktop */}
        <div className="lg:col-span-1">
          <CheckoutSummary />
        </div>
      </div>
    </Container>
  );
}
