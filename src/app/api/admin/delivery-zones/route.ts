import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/delivery-zones - List all delivery zones
export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deliveryZones = await prisma.deliveryZone.findMany({
      include: {
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    // Convert Decimal to number for JSON serialization
    const serializedZones = deliveryZones.map((zone) => ({
      ...zone,
      fee: Number(zone.fee),
      minOrder: zone.minOrder ? Number(zone.minOrder) : null,
      freeAbove: zone.freeAbove ? Number(zone.freeAbove) : null,
    }));

    return NextResponse.json({
      success: true,
      data: serializedZones,
    });
  } catch (error) {
    console.error('Error fetching delivery zones:', error);
    return NextResponse.json(
      { error: 'Failed to fetch delivery zones' },
      { status: 500 }
    );
  }
}

// POST /api/admin/delivery-zones - Create delivery zone
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      nameKa,
      nameEn,
      fee,
      minOrder,
      freeAbove,
      isActive,
    } = body;

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

    // Get the highest sortOrder
    const maxSortOrder = await prisma.deliveryZone.findFirst({
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    const sortOrder = (maxSortOrder?.sortOrder ?? -1) + 1;

    const deliveryZone = await prisma.deliveryZone.create({
      data: {
        nameKa,
        nameEn,
        fee: Number(fee),
        minOrder: minOrder ? Number(minOrder) : null,
        freeAbove: freeAbove ? Number(freeAbove) : null,
        isActive: isActive ?? true,
        sortOrder,
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
    console.error('Error creating delivery zone:', error);
    return NextResponse.json(
      { error: 'Failed to create delivery zone' },
      { status: 500 }
    );
  }
}
