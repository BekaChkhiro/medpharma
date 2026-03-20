'use client';

/**
 * Checkout Step 2: Delivery Information
 * T3.6: Delivery address form with zone selection and fee calculation
 *
 * Features:
 * - City dropdown populated from delivery zones API
 * - Address input with validation
 * - Optional courier notes
 * - Dynamic fee calculation based on selected zone
 * - Free delivery indicator when cart subtotal meets threshold
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

import { MapPin, ArrowLeft, ArrowRight, Truck, CheckCircle2 } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { formatPriceWithLocale } from '@/hooks/use-cart';
import { useCartSubtotal } from '@/store/cart-store';
import {
  deliveryInfoSchema,
  type DeliveryInfoFormData,
} from '@/lib/validations/checkout';
import {
  useDeliveryInfo,
  useCheckoutActions,
  type DeliveryInfoData,
} from '@/store/checkout-store';

// Delivery zone type from API
interface DeliveryZone {
  id: string;
  nameKa: string;
  nameEn: string;
  fee: number;
  minOrder: number | null;
  freeAbove: number | null;
}

type FieldErrors = Partial<Record<keyof DeliveryInfoFormData, string>>;

export function StepDelivery() {
  const t = useTranslations('checkout.deliveryInfo');
  const tValidation = useTranslations('validation');
  const tCommon = useTranslations('common');
  const tCart = useTranslations('cart');
  const locale = useLocale() as 'ka' | 'en';

  const savedInfo = useDeliveryInfo();
  const { setDeliveryInfo, previousStep, nextStep } = useCheckoutActions();
  const cartSubtotal = useCartSubtotal();

  // Delivery zones state
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [isLoadingZones, setIsLoadingZones] = useState(true);
  const [zonesError, setZonesError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<DeliveryInfoFormData>({
    cityId: savedInfo?.deliveryZoneId ?? '',
    address: savedInfo?.address ?? '',
    notes: savedInfo?.notes ?? '',
  });

  // Field-level errors
  const [errors, setErrors] = useState<FieldErrors>({});

  // Loading state for submit
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch delivery zones on mount
  useEffect(() => {
    async function fetchZones() {
      try {
        setIsLoadingZones(true);
        setZonesError(null);

        const response = await fetch('/api/delivery-zones');
        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          setZones(result.data);
        } else {
          setZonesError('Failed to load delivery zones');
        }
      } catch (error) {
        console.error('Error fetching delivery zones:', error);
        setZonesError('Failed to load delivery zones');
      } finally {
        setIsLoadingZones(false);
      }
    }

    fetchZones();
  }, []);

  // Get selected zone
  const selectedZone = useMemo(() => {
    return zones.find((zone) => zone.id === formData.cityId) ?? null;
  }, [zones, formData.cityId]);

  // Calculate delivery fee
  const deliveryFeeInfo = useMemo(() => {
    if (!selectedZone) {
      return { fee: 0, isFree: false, amountUntilFree: null };
    }

    const { fee, freeAbove, minOrder } = selectedZone;

    // Check if order meets minimum
    const meetsMinimum = minOrder === null || cartSubtotal >= minOrder;

    // Check if free delivery applies
    const isFreeDelivery = freeAbove !== null && cartSubtotal >= freeAbove;

    // Calculate amount until free delivery
    const amountUntilFree =
      freeAbove !== null && !isFreeDelivery
        ? Math.max(0, freeAbove - cartSubtotal)
        : null;

    return {
      fee: isFreeDelivery ? 0 : fee,
      isFree: isFreeDelivery,
      amountUntilFree,
      meetsMinimum,
      minOrder,
      freeAbove,
    };
  }, [selectedZone, cartSubtotal]);

  // Format price helper
  const formatPrice = useCallback(
    (price: number) => formatPriceWithLocale(price, locale),
    [locale]
  );

  // Handle field change
  const handleChange = useCallback(
    (field: keyof DeliveryInfoFormData) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const value = e.target.value;
        setFormData((prev) => ({ ...prev, [field]: value }));

        // Clear error for this field when user changes value
        if (errors[field]) {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
          });
        }
      },
    [errors]
  );

  // Get localized error message
  const getErrorMessage = (field: keyof DeliveryInfoFormData, errorKey: string): string => {
    if (errorKey === 'validation.required') {
      return tValidation('required', { field: t(field === 'cityId' ? 'city' : field) });
    }
    if (errorKey === 'validation.minLength') {
      return tValidation('minLength', { field: t(field === 'cityId' ? 'city' : field), min: 5 });
    }
    if (errorKey === 'validation.maxLength') {
      const max = field === 'notes' ? 500 : 200;
      return tValidation('maxLength', { field: t(field === 'cityId' ? 'city' : field), max });
    }
    return errorKey;
  };

  // Zone select options
  const zoneOptions = useMemo(() => {
    return zones.map((zone) => ({
      value: zone.id,
      label: locale === 'en' ? zone.nameEn : zone.nameKa,
    }));
  }, [zones, locale]);

  // Validate and submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // Validate with Zod
    const result = deliveryInfoSchema.safeParse(formData);

    if (!result.success) {
      // Extract field-level errors
      const fieldErrors: FieldErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof DeliveryInfoFormData;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });
      setErrors(fieldErrors);
      setIsSubmitting(false);
      return;
    }

    // Check minimum order requirement
    if (selectedZone && deliveryFeeInfo.minOrder != null && !deliveryFeeInfo.meetsMinimum) {
      setErrors({
        cityId: `Minimum order for this zone is ${formatPrice(deliveryFeeInfo.minOrder as number)}`,
      });
      setIsSubmitting(false);
      return;
    }

    // Get zone name for display
    const zoneName = selectedZone
      ? locale === 'en'
        ? selectedZone.nameEn
        : selectedZone.nameKa
      : '';

    // Convert to store format and save
    const deliveryInfoData: DeliveryInfoData = {
      deliveryZoneId: result.data.cityId,
      zoneName,
      address: result.data.address,
      notes: result.data.notes ?? '',
      deliveryFee: deliveryFeeInfo.fee,
      freeAbove: selectedZone?.freeAbove ?? null,
    };

    setDeliveryInfo(deliveryInfoData);

    // Brief delay for UX, then move to next step
    await new Promise((resolve) => setTimeout(resolve, 100));
    setIsSubmitting(false);
    nextStep();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {t('title')}
        </CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Loading state */}
          {isLoadingZones && (
            <div className="flex items-center justify-center py-8">
              <Spinner size="lg" />
            </div>
          )}

          {/* Error state */}
          {zonesError && !isLoadingZones && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
              {zonesError}
            </div>
          )}

          {/* Form fields */}
          {!isLoadingZones && !zonesError && (
            <>
              {/* City/Zone Selection */}
              <FormField
                label={t('city')}
                htmlFor="cityId"
                required
                error={errors.cityId ? getErrorMessage('cityId', errors.cityId) : undefined}
              >
                <Select
                  id="cityId"
                  value={formData.cityId}
                  onChange={handleChange('cityId')}
                  placeholder={t('selectCity')}
                  options={zoneOptions}
                  error={!!errors.cityId}
                />
              </FormField>

              {/* Delivery Fee Info */}
              {selectedZone && (
                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="flex items-start gap-3">
                    <Truck className="mt-0.5 h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 space-y-1">
                      {/* Fee display */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {tCart('delivery')}
                        </span>
                        {deliveryFeeInfo.isFree ? (
                          <span className="flex items-center gap-1 text-sm font-medium text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                            {tCart('deliveryFree')}
                          </span>
                        ) : (
                          <span className="text-sm font-medium">
                            {formatPrice(deliveryFeeInfo.fee)}
                          </span>
                        )}
                      </div>

                      {/* Amount until free delivery */}
                      {deliveryFeeInfo.amountUntilFree !== null &&
                        deliveryFeeInfo.amountUntilFree > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {tCart('freeDeliveryThreshold', {
                              amount: deliveryFeeInfo.amountUntilFree.toFixed(2),
                            })}
                          </p>
                        )}

                      {/* Minimum order warning */}
                      {deliveryFeeInfo.minOrder != null && !deliveryFeeInfo.meetsMinimum && (
                        <p className="text-xs text-amber-600">
                          ⚠️ {tValidation('min', {
                            field: tCart('subtotal'),
                            min: formatPrice(deliveryFeeInfo.minOrder as number),
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Address */}
              <FormField
                label={t('address')}
                htmlFor="address"
                required
                error={errors.address ? getErrorMessage('address', errors.address) : undefined}
              >
                <Input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange('address')}
                  placeholder={t('addressPlaceholder')}
                  error={!!errors.address}
                  autoComplete="street-address"
                  leftIcon={<MapPin className="h-4 w-4" />}
                />
              </FormField>

              {/* Courier Notes */}
              <FormField
                label={t('notes')}
                htmlFor="notes"
                hint={tCommon('optional')}
                error={errors.notes ? getErrorMessage('notes', errors.notes) : undefined}
              >
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={handleChange('notes')}
                  placeholder={t('notesPlaceholder')}
                  error={!!errors.notes}
                  rows={3}
                />
              </FormField>
            </>
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
            disabled={isLoadingZones || !!zonesError || !selectedZone}
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
