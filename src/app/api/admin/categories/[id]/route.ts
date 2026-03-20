import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/admin/categories/[id] - Get single category
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/categories/[id] - Update category
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const body = await request.json();
    const {
      slug,
      nameKa,
      nameEn,
      descKa,
      descEn,
      parentId,
      image,
      isActive,
      metaTitleKa,
      metaTitleEn,
      metaDescKa,
      metaDescEn,
    } = body;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Validate required fields
    if (!slug || !nameKa || !nameEn) {
      return NextResponse.json(
        { error: 'slug, nameKa, and nameEn are required' },
        { status: 400 }
      );
    }

    // Check if slug is unique (excluding current category)
    if (slug !== existingCategory.slug) {
      const slugExists = await prisma.category.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: 'Category with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Prevent circular reference (category cannot be its own parent or descendant)
    if (parentId === id) {
      return NextResponse.json(
        { error: 'Category cannot be its own parent' },
        { status: 400 }
      );
    }

    if (parentId) {
      // Check if the new parent is a descendant of this category
      const isDescendant = async (categoryId: string, potentialDescendantId: string): Promise<boolean> => {
        const children = await prisma.category.findMany({
          where: { parentId: categoryId },
          select: { id: true },
        });

        if (children.some((child) => child.id === potentialDescendantId)) {
          return true;
        }

        for (const child of children) {
          if (await isDescendant(child.id, potentialDescendantId)) {
            return true;
          }
        }

        return false;
      };

      if (await isDescendant(id, parentId)) {
        return NextResponse.json(
          { error: 'Cannot set a descendant category as parent' },
          { status: 400 }
        );
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        slug,
        nameKa,
        nameEn,
        descKa: descKa || null,
        descEn: descEn || null,
        parentId: parentId || null,
        image: image || null,
        isActive: isActive ?? true,
        metaTitleKa: metaTitleKa || null,
        metaTitleEn: metaTitleEn || null,
        metaDescKa: metaDescKa || null,
        metaDescEn: metaDescEn || null,
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/categories/[id] - Delete category
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Update children to become root categories (orphan them)
    await prisma.category.updateMany({
      where: { parentId: id },
      data: { parentId: null },
    });

    // Delete the category
    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
