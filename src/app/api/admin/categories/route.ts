import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { type CategoryWithChildren } from '@/types/category';

// Helper function to build category tree
function buildCategoryTree(categories: any[]): CategoryWithChildren[] {
  const categoryMap = new Map<string, CategoryWithChildren>();
  const rootCategories: CategoryWithChildren[] = [];

  // First pass: create all category objects
  categories.forEach((category) => {
    categoryMap.set(category.id, {
      ...category,
      children: [],
    });
  });

  // Second pass: build tree structure
  categories.forEach((category) => {
    const categoryWithChildren = categoryMap.get(category.id)!;
    if (category.parentId) {
      const parent = categoryMap.get(category.parentId);
      if (parent) {
        parent.children.push(categoryWithChildren);
      } else {
        rootCategories.push(categoryWithChildren);
      }
    } else {
      rootCategories.push(categoryWithChildren);
    }
  });

  // Sort categories by sortOrder
  const sortCategories = (cats: CategoryWithChildren[]) => {
    cats.sort((a, b) => a.sortOrder - b.sortOrder);
    cats.forEach((cat) => {
      if (cat.children.length > 0) {
        sortCategories(cat.children);
      }
    });
  };

  sortCategories(rootCategories);

  return rootCategories;
}

// GET /api/admin/categories - List all categories as tree
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    const tree = buildCategoryTree(categories);

    return NextResponse.json({
      success: true,
      data: tree,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST /api/admin/categories - Create category
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Validate required fields
    if (!slug || !nameKa || !nameEn) {
      return NextResponse.json(
        { error: 'slug, nameKa, and nameEn are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this slug already exists' },
        { status: 400 }
      );
    }

    // Get the highest sortOrder for this parent level
    const maxSortOrder = await prisma.category.findFirst({
      where: { parentId: parentId || null },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    const sortOrder = (maxSortOrder?.sortOrder ?? -1) + 1;

    const category = await prisma.category.create({
      data: {
        slug,
        nameKa,
        nameEn,
        descKa: descKa || null,
        descEn: descEn || null,
        parentId: parentId || null,
        image: image || null,
        isActive: isActive ?? true,
        sortOrder,
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
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
