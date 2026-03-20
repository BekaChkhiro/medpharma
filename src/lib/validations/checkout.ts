/**
 * Checkout Form Validation Schemas
 * T3.5: Zod validation for checkout forms
 */

import { z } from 'zod';

// Georgian phone number regex: +995 followed by 9 digits (mobile numbers start with 5)
const georgianPhoneRegex = /^(\+995|995)?5\d{8}$/;

/**
 * Personal Info Schema (Step 1)
 * Validates: firstName, lastName, email, phone
 */
export const personalInfoSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: 'validation.minLength' })
    .max(50, { message: 'validation.maxLength' }),
  lastName: z
    .string()
    .min(2, { message: 'validation.minLength' })
    .max(50, { message: 'validation.maxLength' }),
  email: z
    .string()
    .email({ message: 'validation.email' }),
  phone: z
    .string()
    .transform((val) => val.replace(/\s/g, '')) // Remove spaces
    .refine((val) => georgianPhoneRegex.test(val), {
      message: 'validation.phone',
    }),
});

/**
 * Delivery Info Schema (Step 2)
 * Validates: city (delivery zone ID), address, notes (optional)
 */
export const deliveryInfoSchema = z.object({
  cityId: z
    .string()
    .min(1, { message: 'validation.required' }),
  address: z
    .string()
    .min(5, { message: 'validation.minLength' })
    .max(200, { message: 'validation.maxLength' }),
  notes: z
    .string()
    .max(500, { message: 'validation.maxLength' })
    .optional()
    .or(z.literal('')),
});

/**
 * Payment Method Schema (Step 3)
 * Validates: paymentMethod selection
 */
export const paymentMethodSchema = z.object({
  paymentMethod: z.enum(['tbc', 'bog', 'cash'], {
    message: 'validation.required',
  }),
});

/**
 * Complete Checkout Schema
 * Combines all steps for final validation before order submission
 */
export const checkoutSchema = z.object({
  personalInfo: personalInfoSchema,
  deliveryInfo: deliveryInfoSchema,
  paymentMethod: z.enum(['tbc', 'bog', 'cash']),
});

// Type exports
export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;
export type DeliveryInfoFormData = z.infer<typeof deliveryInfoSchema>;
export type PaymentMethodFormData = z.infer<typeof paymentMethodSchema>;
export type CheckoutFormData = z.infer<typeof checkoutSchema>;

/**
 * Validation helper that returns field-level errors
 * Compatible with the translation system
 */
export function validatePersonalInfo(data: unknown): {
  success: boolean;
  data?: PersonalInfoFormData;
  errors?: Record<string, string>;
} {
  const result = personalInfoSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  result.error.issues.forEach((issue) => {
    const field = issue.path[0] as string;
    errors[field] = issue.message;
  });

  return { success: false, errors };
}

export function validateDeliveryInfo(data: unknown): {
  success: boolean;
  data?: DeliveryInfoFormData;
  errors?: Record<string, string>;
} {
  const result = deliveryInfoSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  result.error.issues.forEach((issue) => {
    const field = issue.path[0] as string;
    errors[field] = issue.message;
  });

  return { success: false, errors };
}

export function validatePaymentMethod(data: unknown): {
  success: boolean;
  data?: PaymentMethodFormData;
  errors?: Record<string, string>;
} {
  const result = paymentMethodSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  result.error.issues.forEach((issue) => {
    const field = issue.path[0] as string;
    errors[field] = issue.message;
  });

  return { success: false, errors };
}
