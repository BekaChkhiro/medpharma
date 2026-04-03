import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: Promise<{ email: string }>;
};

// GET /api/admin/customers/[email]/orders - Get orders for a customer
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email } = await context.params;
    const decodedEmail = decodeURIComponent(email);

    const orders = await prisma.order.findMany({
      where: { customerEmail: decodedEmail },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const serializedOrders = orders.map((order) => ({
      ...order,
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.deliveryFee),
      total: Number(order.total),
      items: order.items.map((item) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        total: Number(item.total),
      })),
    }));

    return NextResponse.json({
      success: true,
      data: serializedOrders,
    });
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer orders' },
      { status: 500 }
    );
  }
}
