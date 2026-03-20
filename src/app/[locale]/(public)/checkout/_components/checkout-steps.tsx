'use client';

/**
 * Checkout step indicator component
 * Shows progress through checkout steps with clickable navigation
 */

import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import {
  type CheckoutStep,
  STEP_ORDER,
  useCheckoutActions,
  useCompletedSteps,
} from '@/store/checkout-store';

interface CheckoutStepsProps {
  currentStep: CheckoutStep;
}

export function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  const t = useTranslations('checkout.steps');
  const completedSteps = useCompletedSteps();
  const { setStep, canGoToStep } = useCheckoutActions();

  const getStepLabel = (step: CheckoutStep): string => {
    switch (step) {
      case 'info':
        return t('info');
      case 'delivery':
        return t('delivery');
      case 'payment':
        return t('payment');
      case 'review':
        return t('review');
      default:
        return '';
    }
  };

  const getStepNumber = (step: CheckoutStep): number => {
    return STEP_ORDER.indexOf(step) + 1;
  };

  const isStepCompleted = (step: CheckoutStep): boolean => {
    return completedSteps.includes(step);
  };

  const isStepCurrent = (step: CheckoutStep): boolean => {
    return step === currentStep;
  };

  const handleStepClick = (step: CheckoutStep) => {
    if (canGoToStep(step)) {
      setStep(step);
    }
  };

  return (
    <nav aria-label="Checkout progress" className="w-full">
      <ol className="flex items-center justify-between">
        {STEP_ORDER.map((step, index) => {
          const isCompleted = isStepCompleted(step);
          const isCurrent = isStepCurrent(step);
          const isClickable = canGoToStep(step);
          const isLast = index === STEP_ORDER.length - 1;

          return (
            <li key={step} className="relative flex flex-1 items-center">
              {/* Step circle and label */}
              <button
                type="button"
                onClick={() => handleStepClick(step)}
                disabled={!isClickable}
                className={cn(
                  'group flex flex-col items-center',
                  isClickable && 'cursor-pointer',
                  !isClickable && 'cursor-not-allowed'
                )}
              >
                {/* Circle */}
                <span
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors',
                    isCompleted &&
                      'border-primary bg-primary text-primary-foreground',
                    isCurrent &&
                      !isCompleted &&
                      'border-primary bg-primary/10 text-primary',
                    !isCompleted &&
                      !isCurrent &&
                      'border-muted-foreground/30 bg-background text-muted-foreground',
                    isClickable &&
                      !isCurrent &&
                      'group-hover:border-primary/70 group-hover:bg-primary/5'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    getStepNumber(step)
                  )}
                </span>

                {/* Label */}
                <span
                  className={cn(
                    'mt-2 text-xs font-medium sm:text-sm',
                    (isCompleted || isCurrent) && 'text-primary',
                    !isCompleted && !isCurrent && 'text-muted-foreground'
                  )}
                >
                  {getStepLabel(step)}
                </span>
              </button>

              {/* Connector line */}
              {!isLast && (
                <div
                  className={cn(
                    'ml-2 mr-2 h-0.5 flex-1',
                    isCompleted ? 'bg-primary' : 'bg-muted-foreground/30'
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
