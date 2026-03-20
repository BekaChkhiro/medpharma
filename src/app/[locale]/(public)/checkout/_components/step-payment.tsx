'use client';

/**
 * Checkout Step 3: Payment Method Selection
 * T3.7: Payment method selection (TBC, BOG/iPay, Cash on delivery)
 *
 * Features:
 * - Radio button selection for payment methods
 * - TBC Card payment
 * - BOG / iPay payment
 * - Cash on Delivery option
 * - Persists selection in checkout store
 */

import { useState } from 'react';

import { CreditCard, ArrowLeft, ArrowRight, Banknote, Building2, Smartphone } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  paymentMethodSchema,
  type PaymentMethodFormData,
} from '@/lib/validations/checkout';
import {
  usePaymentInfo,
  useCheckoutActions,
  type PaymentMethod,
} from '@/store/checkout-store';

// Payment method configuration
interface PaymentMethodOption {
  id: PaymentMethod;
  icon: React.ReactNode;
  description?: string;
}

export function StepPayment() {
  const t = useTranslations('checkout.paymentMethod');
  const tCommon = useTranslations('common');
  const tValidation = useTranslations('validation');

  const savedInfo = usePaymentInfo();
  const { setPaymentInfo, previousStep, nextStep } = useCheckoutActions();

  // Form state - restore from saved info or default to empty
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | ''>(
    savedInfo?.method ?? ''
  );

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Loading state for submit
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Payment method options with icons
  const paymentMethods: PaymentMethodOption[] = [
    {
      id: 'tbc',
      icon: <Building2 className="h-6 w-6" />,
    },
    {
      id: 'bog',
      icon: <Smartphone className="h-6 w-6" />,
    },
    {
      id: 'cash',
      icon: <Banknote className="h-6 w-6" />,
    },
  ];

  // Handle method selection
  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    // Clear error when user makes a selection
    if (error) {
      setError(null);
    }
  };

  // Validate and submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validate with Zod
    const formData: PaymentMethodFormData = { paymentMethod: selectedMethod as PaymentMethod };
    const result = paymentMethodSchema.safeParse(formData);

    if (!result.success) {
      // Show validation error
      setError(tValidation('required', { field: t('title') }));
      setIsSubmitting(false);
      return;
    }

    // Save to checkout store
    setPaymentInfo({ method: result.data.paymentMethod });

    // Brief delay for UX, then move to next step
    await new Promise((resolve) => setTimeout(resolve, 100));
    setIsSubmitting(false);
    nextStep();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          {t('title')}
        </CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Payment method options */}
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <label
                key={method.id}
                className={cn(
                  'flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-all',
                  'hover:border-primary/50 hover:bg-muted/50',
                  selectedMethod === method.id
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border'
                )}
              >
                {/* Radio input (visually hidden but accessible) */}
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={selectedMethod === method.id}
                  onChange={() => handleMethodSelect(method.id)}
                  className="sr-only"
                />

                {/* Custom radio indicator */}
                <div
                  className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                    selectedMethod === method.id
                      ? 'border-primary bg-primary'
                      : 'border-muted-foreground/40'
                  )}
                >
                  {selectedMethod === method.id && (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  )}
                </div>

                {/* Icon */}
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-lg transition-colors',
                    selectedMethod === method.id
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {method.icon}
                </div>

                {/* Label */}
                <div className="flex-1">
                  <Label
                    className={cn(
                      'cursor-pointer text-base font-medium',
                      selectedMethod === method.id && 'text-primary'
                    )}
                  >
                    {t(method.id)}
                  </Label>
                </div>
              </label>
            ))}
          </div>

          {/* Error message */}
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={previousStep}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            {tCommon('back')}
          </Button>
          <Button
            type="submit"
            disabled={!selectedMethod}
            isLoading={isSubmitting}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            {tCommon('next')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
