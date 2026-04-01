import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/admin/delivery-zones/[id] - Get single delivery zone
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const deliveryZone = await prisma.deliveryZone.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!deliveryZone) {
      return NextResponse.json(
        { error: 'Delivery zone not found' },
        { status: 404 }
      );
    }

    // Convert Decimal to number for JSON serialization
    const serializedZone = {
      ...deliveryZone,
      fee: Number(deliveryZone.fee),
      minOrder: deliveryZone.minOrder ? Number(deliveryZone.minOrder) : null,
      freeAbove: deliveryZone.freeAbove ? Number(deliveryZone.freeAbove) : null,
    };

    return NextResponse.json({
      success: true,
      data: serializedZone,
    });
  } catch (error) {
    console.error('Error fetching delivery zone:', error);
    return NextResponse.json(
      { error: 'Failed to fetch delivery zone' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/delivery-zones/[id] - Update delivery zone
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const {
      nameKa,
      nameEn,
      fee,
      minOrder,
      freeAbove,
      isActive,
      sortOrder,
    } = body;

    // Check if delivery zone exists
    const existing = await prisma.deliveryZone.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Delivery zone not found' },
        { status: 404 }
      );
    }

    // Validate required fields
    if (!nameKa || !nameEn || fee === undefined || fee === null) {
      return NextResponse.json(
        { error: 'nameKa, nameEn, and fee are required' },
        { status: 400 }
      );
    }

    // Validate fee is a positive number
    if (isNaN(Number(fee)) || Number(fee) < 0) {
      return NextResponse.json(
        { error: 'Fee must be a non-negative number' },
        { status: 400 }
      );
    }

    const deliveryZone = await prisma.deliveryZone.update({
      where: { id },
      data: {
        nameKa,
        nameEn,
        fee: Number(fee),
        minOrder: minOrder ? Number(minOrder) : null,
        freeAbove: freeAbove ? Number(freeAbove) : null,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? existing.sortOrder,
      },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    // Convert Decimal to number for JSON serialization
    const serializedZone = {
      ...deliveryZone,
      fee: Number(deliveryZone.fee),
      minOrder: deliveryZone.minOrder ? Number(deliveryZone.minOrder) : null,
      freeAbove: deliveryZone.freeAbove ? Number(deliveryZone.freeAbove) : null,
    };

    return NextResponse.json({
      success: true,
      data: serializedZone,
    });
  } catch (error) {
    console.error('Error updating delivery zone:', error);
    return NextResponse.json(
      { error: 'Failed to update delivery zone' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/delivery-zones/[id] - Delete delivery zone
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    // Check if delivery zone exists
    const existing = await prisma.deliveryZone.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Delivery zone not found' },
        { status: 404 }
      );
    }

    // Check if zone has orders
    if (existing._count.orders > 0) {
      return NextResponse.json(
        { error: 'Cannot delete delivery zone with existing orders. Deactivate it instead.' },
        { status: 400 }
      );
    }

    await prisma.deliveryZone.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Delivery zone deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting delivery zone:', error);
    return NextResponse.json(
      { error: 'Failed to delete delivery zone' },
      { status: 500 }
    );
  }
}
