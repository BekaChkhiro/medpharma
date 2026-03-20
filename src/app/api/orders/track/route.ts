/**
 * Order Tracking API Route
 * Allows customers to look up their order by order number and email
 *
 * POST /api/orders/track - Look up order (POST to hide email in URL)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getOrderByNumberAndEmail } from '@/services/orders';

// Validation schema for tracking request
const trackOrderSchema = z.object({
  orderNumber: z
    .string()
    .min(1, 'Order number is required')
    .regex(/^MF-\d{8}$/, 'Invalid order number format'),
  email: z.string().email('Invalid email address'),
});

/**
 * POST /api/orders/track
 * Look up order by order number and email
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    // Validate request
    const validation = trackOrderSchema.safeParse(body);
    if (!validation.success) {
      const errors: Record<string, string[]> = {};
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (!errors[field]) {
          errors[field] = [];
        }
        errors[field].push(issue.message);
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          errors,
        },
        { status: 400 }
      );
    }

    const { orderNumber, email } = validation.data;

    // Look up order
    const order = await getOrderByNumberAndEmail(orderNumber, email);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: 'Order not found. Please check your order number and email.',
        },
        { status: 404 }
      );
    }

    // Return order details (sanitized for customer view)
    return NextResponse.json({
      success: true,
      data: {
        order: {
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          customerName: order.customerName,
          deliveryCity: order.deliveryCity,
          deliveryAddress: order.deliveryAddress,
          subtotal: order.subtotal,
          deliveryFee: order.deliveryFee,
          total: order.total,
          createdAt: order.createdAt,
          shippedAt: order.shippedAt,
          deliveredAt: order.deliveredAt,
          items: order.items.map((item) => ({
            productNameKa: item.productNameKa,
            productNameEn: item.productNameEn,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
            productImage: item.productImage,
          })),
        },
      },
    });
  } catch (error) {
    console.error('Order tracking error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred. Please try again.',
      },
      { status: 500 }
    );
  }
}
