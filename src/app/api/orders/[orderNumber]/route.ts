/**
 * Order Detail API Route
 * Fetches order details by order number
 *
 * GET /api/orders/[orderNumber] - Get order by order number
 *
 * Note: This endpoint is intentionally accessible without authentication
 * as it's used immediately after order creation for the success page.
 * For security, sensitive customer data like full phone number is masked.
 */

import { NextRequest, NextResponse } from 'next/server';

import { getOrderByNumber } from '@/services/orders';

interface RouteParams {
  params: Promise<{ orderNumber: string }>;
}

/**
 * GET /api/orders/[orderNumber]
 * Fetch order details by order number
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { orderNumber } = await params;

    // Validate order number format (MF-YYYYNNNN)
    if (!orderNumber || !/^MF-\d{8}$/.test(orderNumber)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid order number format',
        },
        { status: 400 }
      );
    }

    // Fetch order
    const order = await getOrderByNumber(orderNumber);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: 'Order not found',
        },
        { status: 404 }
      );
    }

    // Mask phone number for privacy (show last 4 digits)
    const maskedPhone = order.customerPhone
      ? `***${order.customerPhone.slice(-4)}`
      : null;

    // Return order details
    return NextResponse.json({
      success: true,
      data: {
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          customerPhone: maskedPhone,
          deliveryCity: order.deliveryCity,
          deliveryAddress: order.deliveryAddress,
          deliveryNotes: order.deliveryNotes,
          subtotal: order.subtotal,
          deliveryFee: order.deliveryFee,
          total: order.total,
          createdAt: order.createdAt,
          items: order.items.map((item) => ({
            id: item.id,
            productId: item.productId,
            productNameKa: item.productNameKa,
            productNameEn: item.productNameEn,
            productSku: item.productSku,
            productImage: item.productImage,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          })),
          deliveryZone: order.deliveryZone,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching order:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
