/**
 * Public API route for delivery zones
 * Returns only active delivery zones for checkout
 * No authentication required (guest checkout)
 */

import { NextResponse } from 'next/server';

import { db } from '@/lib/db';

// GET /api/delivery-zones - Get active delivery zones for checkout
export async function GET() {
  try {
    const zones = await db.deliveryZone.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
      select: {
        id: true,
        nameKa: true,
        nameEn: true,
        fee: true,
        minOrder: true,
        freeAbove: true,
      },
    });

    // Convert Decimal to number for JSON serialization
    const serializedZones = zones.map((zone) => ({
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
      {
        success: false,
        error: 'Failed to fetch delivery zones',
      },
      { status: 500 }
    );
  }
}
