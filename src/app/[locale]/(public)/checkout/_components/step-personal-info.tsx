'use client';

/**
 * Checkout Step 1: Personal Information
 * T3.5: Personal info form with Zod validation
 *
 * Collects: firstName, lastName, email, phone
 * Validates using Zod schema before proceeding to next step
 */

import { useState, useCallback } from 'react';

import { User, Mail, Phone, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import {
  personalInfoSchema,
  type PersonalInfoFormData,
} from '@/lib/validations/checkout';
import {
  usePersonalInfo,
  useCheckoutActions,
  type PersonalInfoData,
} from '@/store/checkout-store';

type FieldErrors = Partial<Record<keyof PersonalInfoFormData, string>>;

export function StepPersonalInfo() {
  const t = useTranslations('checkout.personalInfo');
  const tValidation = useTranslations('validation');
  const tCommon = useTranslations('common');

  const savedInfo = usePersonalInfo();
  const { setPersonalInfo, nextStep } = useCheckoutActions();

  // Form state - initialize from saved data if available
  const [formData, setFormData] = useState<PersonalInfoFormData>({
    firstName: savedInfo?.firstName ?? '',
    lastName: savedInfo?.lastName ?? '',
    email: savedInfo?.email ?? '',
    phone: savedInfo?.phone ?? '',
  });

  // Field-level errors
  const [errors, setErrors] = useState<FieldErrors>({});

  // Loading state for submit
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle field change
  const handleChange = useCallback(
    (field: keyof PersonalInfoFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear error for this field when user starts typing
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

  // Format phone number as user types
  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;

      // Remove any non-digit characters except + at the start
      value = value.replace(/[^\d+]/g, '');

      // If starting without +, assume Georgian number
      if (value && !value.startsWith('+') && !value.startsWith('995')) {
        // Allow user to type just the number without prefix
      }

      setFormData((prev) => ({ ...prev, phone: value }));

      // Clear error when typing
      if (errors.phone) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.phone;
          return newErrors;
        });
      }
    },
    [errors]
  );

  // Get localized error message
  const getErrorMessage = (field: keyof PersonalInfoFormData, errorKey: string): string => {
    // Handle different validation error types
    if (errorKey === 'validation.required') {
      return tValidation('required', { field: t(field) });
    }
    if (errorKey === 'validation.email') {
      return tValidation('email');
    }
    if (errorKey === 'validation.phone') {
      return tValidation('phone');
    }
    if (errorKey === 'validation.minLength') {
      return tValidation('minLength', { field: t(field), min: 2 });
    }
    if (errorKey === 'validation.maxLength') {
      return tValidation('maxLength', { field: t(field), max: 50 });
    }
    return errorKey;
  };

  // Validate and submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // Validate with Zod
    const result = personalInfoSchema.safeParse(formData);

    if (!result.success) {
      // Extract field-level errors
      const fieldErrors: FieldErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof PersonalInfoFormData;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });
      setErrors(fieldErrors);
      setIsSubmitting(false);
      return;
    }

    // Convert to store format and save
    const personalInfoData: PersonalInfoData = {
      firstName: result.data.firstName,
      lastName: result.data.lastName,
      email: result.data.email,
      phone: result.data.phone,
    };

    setPersonalInfo(personalInfoData);

    // Brief delay for UX, then move to next step
    await new Promise((resolve) => setTimeout(resolve, 100));
    setIsSubmitting(false);
    nextStep();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {t('title')}
        </CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Name fields - side by side on larger screens */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* First Name */}
            <FormField
              label={t('firstName')}
              htmlFor="firstName"
              required
              error={errors.firstName ? getErrorMessage('firstName', errors.firstName) : undefined}
            >
              <Input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange('firstName')}
                placeholder={t('firstName')}
                error={!!errors.firstName}
                autoComplete="given-name"
                autoFocus
              />
            </FormField>

            {/* Last Name */}
            <FormField
              label={t('lastName')}
              htmlFor="lastName"
              required
              error={errors.lastName ? getErrorMessage('lastName', errors.lastName) : undefined}
            >
              <Input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange('lastName')}
                placeholder={t('lastName')}
                error={!!errors.lastName}
                autoComplete="family-name"
              />
            </FormField>
          </div>

          {/* Email */}
          <FormField
            label={t('email')}
            htmlFor="email"
            required
            error={errors.email ? getErrorMessage('email', errors.email) : undefined}
          >
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              placeholder="example@email.com"
              error={!!errors.email}
              autoComplete="email"
              leftIcon={<Mail className="h-4 w-4" />}
            />
          </FormField>

          {/* Phone */}
          <FormField
            label={t('phone')}
            htmlFor="phone"
            required
            error={errors.phone ? getErrorMessage('phone', errors.phone) : undefined}
            hint={t('phonePlaceholder')}
          >
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={handlePhoneChange}
              placeholder={t('phonePlaceholder')}
              error={!!errors.phone}
              autoComplete="tel"
              leftIcon={<Phone className="h-4 w-4" />}
            />
          </FormField>
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button
            type="submit"
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
