import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/customers - List customers aggregated from orders
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Aggregate customers from orders
    // Group by email to get unique customers
    const whereClause = search
      ? {
          OR: [
            { customerName: { contains: search, mode: 'insensitive' as const } },
            { customerEmail: { contains: search, mode: 'insensitive' as const } },
            { customerPhone: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    // Get unique customer emails with aggregated data
    const customersRaw = await prisma.order.groupBy({
      by: ['customerEmail'],
      where: whereClause,
      _count: { id: true },
      _sum: { total: true },
      _max: { createdAt: true, customerName: true, customerPhone: true },
      orderBy: { _max: { createdAt: 'desc' } },
      skip,
      take: limit,
    });

    // Get total count
    const totalResult = await prisma.order.groupBy({
      by: ['customerEmail'],
      where: whereClause,
    });
    const total = totalResult.length;

    const customers = customersRaw.map((c) => ({
      email: c.customerEmail,
      name: c._max.customerName || '',
      phone: c._max.customerPhone || '',
      totalOrders: c._count.id,
      totalSpent: c._sum.total ? Number(c._sum.total) : 0,
      lastOrder: c._max.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}
