import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productIds, operationType, priceOperation, priceValue, statusOperation } = body;

    // Validate productIds
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No products selected' },
        { status: 400 }
      );
    }

    // Validate operationType
    if (!['price', 'status'].includes(operationType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid operation type' },
        { status: 400 }
      );
    }

    let updated = 0;
    let failed = 0;

    if (operationType === 'price') {
      // Validate price operation
      if (!['percentage', 'fixed', 'set'].includes(priceOperation)) {
        return NextResponse.json(
          { success: false, error: 'Invalid price operation' },
          { status: 400 }
        );
      }

      if (typeof priceValue !== 'number' || isNaN(priceValue)) {
        return NextResponse.json(
          { success: false, error: 'Invalid price value' },
          { status: 400 }
        );
      }

      // Process each product individually for price changes
      // (since we need to calculate based on current price for percentage/fixed)
      if (priceOperation === 'set') {
        // For "set" operation, we can update all at once
        const newPrice = Math.max(0, priceValue);
        const result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { price: newPrice },
        });
        updated = result.count;
      } else {
        // For percentage and fixed, we need to update individually
        const products = await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, price: true },
        });

        for (const product of products) {
          try {
            const currentPrice = Number(product.price);
            let newPrice: number;

            if (priceOperation === 'percentage') {
              // priceValue is percentage (e.g., 10 for 10% increase, -10 for 10% decrease)
              newPrice = currentPrice * (1 + priceValue / 100);
            } else {
              // fixed: add/subtract fixed amount
              newPrice = currentPrice + priceValue;
            }

            // Ensure price is not negative
            newPrice = Math.max(0, newPrice);

            // Round to 2 decimal places
            newPrice = Math.round(newPrice * 100) / 100;

            await prisma.product.update({
              where: { id: product.id },
              data: { price: newPrice },
            });
            updated++;
          } catch {
            failed++;
          }
        }
      }
    } else if (operationType === 'status') {
      // Validate status operation
      if (!['activate', 'deactivate', 'toggleFeatured'].includes(statusOperation)) {
        return NextResponse.json(
          { success: false, error: 'Invalid status operation' },
          { status: 400 }
        );
      }

      if (statusOperation === 'activate') {
        const result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { isActive: true },
        });
        updated = result.count;
      } else if (statusOperation === 'deactivate') {
        const result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { isActive: false },
        });
        updated = result.count;
      } else if (statusOperation === 'toggleFeatured') {
        // For toggle, we need to update each product individually
        const products = await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, isFeatured: true },
        });

        for (const product of products) {
          try {
            await prisma.product.update({
              where: { id: product.id },
              data: { isFeatured: !product.isFeatured },
            });
            updated++;
          } catch {
            failed++;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        updated,
        failed,
        total: productIds.length,
      },
    });
  } catch (error) {
    console.error('Bulk operation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
}
