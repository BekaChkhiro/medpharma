/**
 * Order API Validation Schemas
 * T3.10: Zod validation for order creation API
 */

import { z } from 'zod';

// Georgian phone number regex: +995 followed by 9 digits (mobile numbers start with 5)
const georgianPhoneRegex = /^(\+995|995)?5\d{8}$/;

/**
 * Cart item schema for order creation
 */
const cartItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  nameKa: z.string().min(1, 'Georgian name is required'),
  nameEn: z.string().min(1, 'English name is required'),
  sku: z.string().min(1, 'SKU is required'),
  price: z.number().positive('Price must be positive'),
  salePrice: z.number().positive().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
});

/**
 * Customer info schema
 */
const customerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .transform((val) => val.replace(/\s/g, '')) // Remove spaces
    .refine((val) => georgianPhoneRegex.test(val), {
      message: 'Invalid Georgian phone number',
    }),
});

/**
 * Delivery info schema
 */
const deliverySchema = z.object({
  zoneId: z.string().min(1, 'Delivery zone is required'),
  zoneName: z.string().min(1, 'Zone name is required'),
  address: z
    .string()
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address must be at most 200 characters'),
  notes: z.string().max(500).optional().nullable(),
  fee: z.number().min(0, 'Delivery fee cannot be negative'),
});

/**
 * Payment method enum
 */
const paymentMethodSchema = z.enum(['tbc', 'bog', 'cash'], {
  error: 'Invalid payment method',
});

/**
 * Complete order creation schema
 */
export const createOrderSchema = z.object({
  customer: customerSchema,
  delivery: deliverySchema,
  paymentMethod: paymentMethodSchema,
  items: z
    .array(cartItemSchema)
    .min(1, 'Cart must have at least one item')
    .max(50, 'Cart cannot have more than 50 items'),
  idempotencyKey: z.string().optional(),
});

// Type exports
export type CreateOrderPayload = z.infer<typeof createOrderSchema>;
export type CartItemPayload = z.infer<typeof cartItemSchema>;
export type CustomerPayload = z.infer<typeof customerSchema>;
export type DeliveryPayload = z.infer<typeof deliverySchema>;

/**
 * Validate order creation payload
 */
export function validateCreateOrder(data: unknown): {
  success: boolean;
  data?: CreateOrderPayload;
  errors?: Record<string, string[]>;
} {
  const result = createOrderSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  // Format errors by field path
  const errors: Record<string, string[]> = {};
  result.error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(issue.message);
  });

  return { success: false, errors };
}
