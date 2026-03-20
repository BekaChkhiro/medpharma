import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { type CategoryReorderItem } from '@/types/category';

// PUT /api/admin/categories/reorder - Bulk reorder categories
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { items } = body as { items: CategoryReorderItem[] };

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: 'items must be an array' },
        { status: 400 }
      );
    }

    // Update all categories in a transaction
    await prisma.$transaction(
      items.map((item) =>
        prisma.category.update({
          where: { id: item.id },
          data: {
            parentId: item.parentId,
            sortOrder: item.sortOrder,
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: 'Categories reordered successfully',
    });
  } catch (error) {
    console.error('Error reordering categories:', error);
    return NextResponse.json(
      { error: 'Failed to reorder categories' },
      { status: 500 }
    );
  }
}
