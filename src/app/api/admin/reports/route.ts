import { type NextRequest, NextResponse } from 'next/server';

import { Prisma, OrderStatus } from '@/generated/prisma';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/reports - Get sales reports
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';

    // Build date filter
    const dateFilter: Record<string, unknown> = {};
    if (dateFrom) {
      dateFilter.gte = new Date(dateFrom);
    }
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      dateFilter.lte = endDate;
    }

    const where: Record<string, unknown> = {};
    if (Object.keys(dateFilter).length > 0) {
      where.createdAt = dateFilter;
    }

    // Only count paid/delivered orders for revenue
    const revenueWhere = {
      ...where,
      status: { notIn: [OrderStatus.CANCELLED, OrderStatus.REFUNDED] },
    };

    // Get aggregate data
    const [
      totalOrders,
      revenueData,
      ordersByStatus,
      topProducts,
      revenueByCategory,
    ] = await Promise.all([
      // Total orders
      prisma.order.count({ where }),

      // Revenue (excluding cancelled/refunded)
      prisma.order.aggregate({
        where: revenueWhere,
        _sum: { total: true },
        _avg: { total: true },
      }),

      // Orders by status
      prisma.order.groupBy({
        by: ['status'],
        where,
        _count: { id: true },
        _sum: { total: true },
      }),

      // Top products by order count
      prisma.orderItem.groupBy({
        by: ['productNameEn', 'productNameKa', 'productSku'],
        where: where.createdAt
          ? { order: { createdAt: where.createdAt as Record<string, Date> } }
          : {},
        _sum: { quantity: true, total: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 10,
      }),

      // Revenue by category
      (async () => {
        try {
          const conditions = [Prisma.sql`o.status NOT IN ('CANCELLED', 'REFUNDED')`];
          if (dateFrom) {
            conditions.push(Prisma.sql`o."createdAt" >= ${new Date(dateFrom)}`);
          }
          if (dateTo) {
            const endDate = new Date(dateTo);
            endDate.setHours(23, 59, 59, 999);
            conditions.push(Prisma.sql`o."createdAt" <= ${endDate}`);
          }
          const whereClause = Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`;
          return await prisma.$queryRaw`
            SELECT
              c."nameEn" as "categoryNameEn",
              c."nameKa" as "categoryNameKa",
              COALESCE(SUM(oi.total), 0) as "revenue",
              COALESCE(SUM(oi.quantity), 0) as "quantity"
            FROM order_items oi
            JOIN products p ON oi."productId" = p.id
            JOIN categories c ON p."categoryId" = c.id
            JOIN orders o ON oi."orderId" = o.id
            ${whereClause}
            GROUP BY c.id, c."nameEn", c."nameKa"
            ORDER BY "revenue" DESC
            LIMIT 10
          `;
        } catch {
          return [];
        }
      })(),
    ]);

    const report = {
      totalOrders,
      revenue: revenueData._sum?.total ? Number(revenueData._sum.total) : 0,
      avgOrderValue: revenueData._avg?.total ? Number(revenueData._avg.total) : 0,
      ordersByStatus: ordersByStatus.map((s) => ({
        status: s.status,
        count: s._count.id,
        total: s._sum.total ? Number(s._sum.total) : 0,
      })),
      topProducts: topProducts.map((p) => ({
        nameEn: p.productNameEn,
        nameKa: p.productNameKa,
        sku: p.productSku,
        quantity: p._sum.quantity || 0,
        revenue: p._sum.total ? Number(p._sum.total) : 0,
      })),
      revenueByCategory: Array.isArray(revenueByCategory)
        ? (revenueByCategory as Array<Record<string, unknown>>).map((c) => ({
            categoryNameEn: c.categoryNameEn,
            categoryNameKa: c.categoryNameKa,
            revenue: Number(c.revenue || 0),
            quantity: Number(c.quantity || 0),
          }))
        : [],
    };

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}
