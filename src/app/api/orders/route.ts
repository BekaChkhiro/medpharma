/**
 * Order API Routes
 * T3.10: API route for order creation with validation, stock check, order number assignment
 *
 * POST /api/orders - Create a new order (guest checkout - no auth required)
 */

import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { validateCreateOrder, type CreateOrderPayload } from '@/lib/validations/order';
import { sendOrderConfirmationEmail, type Locale } from '@/services/email';
import { createOrder, validateStock } from '@/services/orders';

// Rate limiting: Simple in-memory store (use Redis in production)
const orderAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5; // Max orders per IP per window
const WINDOW_MS = 60 * 1000; // 1 minute window

/**
 * Check rate limit for IP address
 */
function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = orderAttempts.get(ip);

  if (!record || now > record.resetAt) {
    // Reset or create new record
    orderAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (record.count >= MAX_ATTEMPTS) {
    return {
      allowed: false,
      retryAfter: Math.ceil((record.resetAt - now) / 1000),
    };
  }

  // Increment count
  record.count++;
  return { allowed: true };
}

/**
 * Get locale from request headers
 */
function getLocale(request: NextRequest): Locale {
  // Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage?.includes('ka')) {
    return 'ka';
  }
  if (acceptLanguage?.includes('en')) {
    return 'en';
  }

  // Check custom locale header (set by frontend)
  const customLocale = request.headers.get('x-locale');
  if (customLocale === 'en' || customLocale === 'ka') {
    return customLocale;
  }

  // Default to Georgian
  return 'ka';
}

/**
 * Get client IP from request headers
 */
function getClientIp(request: NextRequest): string {
  // Check various headers that might contain the real IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback
  return 'unknown';
}

/**
 * Verify delivery zone exists and is active
 */
async function verifyDeliveryZone(
  zoneId: string,
  subtotal: number
): Promise<{
  valid: boolean;
  fee: number;
  error?: string;
}> {
  const zone = await db.deliveryZone.findUnique({
    where: { id: zoneId },
    select: {
      id: true,
      fee: true,
      minOrder: true,
      freeAbove: true,
      isActive: true,
      nameKa: true,
    },
  });

  if (!zone) {
    return { valid: false, fee: 0, error: 'Delivery zone not found' };
  }

  if (!zone.isActive) {
    return { valid: false, fee: 0, error: 'Delivery zone is not available' };
  }

  // Check minimum order amount
  const minOrder = zone.minOrder ? Number(zone.minOrder) : 0;
  if (minOrder > 0 && subtotal < minOrder) {
    return {
      valid: false,
      fee: 0,
      error: `Minimum order amount for ${zone.nameKa} is ${minOrder} GEL`,
    };
  }

  // Calculate fee (free above threshold)
  const freeAbove = zone.freeAbove ? Number(zone.freeAbove) : null;
  const fee = freeAbove && subtotal >= freeAbove ? 0 : Number(zone.fee);

  return { valid: true, fee };
}

/**
 * POST /api/orders
 * Create a new order
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(clientIp);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many order attempts. Please try again later.',
          retryAfter: rateLimit.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfter),
          },
        }
      );
    }

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

    // Validate request payload
    const validation = validateCreateOrder(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    const payload = validation.data as CreateOrderPayload;

    // Calculate subtotal for delivery zone verification
    const subtotal = payload.items.reduce((sum, item) => {
      const price = item.salePrice ?? item.price;
      return sum + price * item.quantity;
    }, 0);

    // Verify delivery zone and calculate actual fee
    const zoneCheck = await verifyDeliveryZone(payload.delivery.zoneId, subtotal);
    if (!zoneCheck.valid) {
      return NextResponse.json(
        {
          success: false,
          error: zoneCheck.error,
          code: 'INVALID_DELIVERY_ZONE',
        },
        { status: 400 }
      );
    }

    // Pre-check stock availability (will be re-checked in transaction)
    const stockCheck = await validateStock(payload.items);
    if (!stockCheck.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Some items are out of stock',
          code: 'INSUFFICIENT_STOCK',
          stockErrors: stockCheck.errors,
        },
        { status: 400 }
      );
    }

    // Generate idempotency key if not provided
    // Use customer email + timestamp as fallback
    const idempotencyKey =
      payload.idempotencyKey ||
      `${payload.customer.email}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    // Create order
    const result = await createOrder({
      customer: {
        name: payload.customer.name,
        email: payload.customer.email,
        phone: payload.customer.phone,
      },
      delivery: {
        zoneId: payload.delivery.zoneId,
        zoneName: payload.delivery.zoneName,
        address: payload.delivery.address,
        notes: payload.delivery.notes || undefined,
        fee: zoneCheck.fee, // Use calculated fee, not client-provided
      },
      paymentMethod: payload.paymentMethod,
      items: payload.items,
      idempotencyKey,
    });

    if (!result.success) {
      // Handle stock errors specially
      if (result.stockErrors && result.stockErrors.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: result.error,
            code: 'INSUFFICIENT_STOCK',
            stockErrors: result.stockErrors,
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to create order',
        },
        { status: 500 }
      );
    }

    // Send order confirmation email (fire and forget - don't block response)
    if (result.order) {
      const locale = getLocale(request);
      sendOrderConfirmationEmail(result.order, locale)
        .then((emailResult) => {
          if (!emailResult.success) {
            console.error('Failed to send order confirmation email:', emailResult.error);
          }
        })
        .catch((error) => {
          console.error('Error sending order confirmation email:', error);
        });
    }

    // Return created order
    return NextResponse.json(
      {
        success: true,
        data: {
          order: result.order,
          message: 'Order created successfully',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Order creation error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred. Please try again.',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/orders
 * Method not allowed for listing (requires authentication)
 */
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed. Use /api/orders/track to look up an order.',
    },
    { status: 405 }
  );
}
