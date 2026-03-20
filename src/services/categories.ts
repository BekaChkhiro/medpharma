/**
 * Category Service Layer
 *
 * Provides queries for category hierarchy, including parent-child relationships.
 */

import { db } from '@/lib/db';

export interface CategoryWithChildren {
  id: string;
  slug: string;
  nameKa: string;
  nameEn: string;
  descKa: string | null;
  descEn: string | null;
  image: string | null;
  sortOrder: number;
  isActive: boolean;
  parentId: string | null;
  children?: CategoryWithChildren[];
  _count?: {
    products: number;
  };
}

/**
 * Get all active categories in a flat list
 */
export async function getCategories(): Promise<CategoryWithChildren[]> {
  const categories = await db.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { nameKa: 'asc' }],
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  return categories as CategoryWithChildren[];
}

/**
 * Get categories as a hierarchical tree
 */
export async function getCategoryTree(): Promise<CategoryWithChildren[]> {
  const categories = await getCategories();
  return buildCategoryTree(categories);
}

/**
 * Get a single category by slug or ID
 */
export async function getCategory(
  slugOrId: string
): Promise<CategoryWithChildren | null> {
  const category = await db.category.findFirst({
    where: {
      OR: [{ slug: slugOrId }, { id: slugOrId }],
      isActive: true,
    },
    include: {
      _count: {
        select: { products: true },
      },
      parent: {
        select: {
          id: true,
          slug: true,
          nameKa: true,
          nameEn: true,
        },
      },
      children: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        include: {
          _count: {
            select: { products: true },
          },
        },
      },
    },
  });

  return category as CategoryWithChildren | null;
}

/**
 * Get root categories (no parent)
 */
export async function getRootCategories(): Promise<CategoryWithChildren[]> {
  const categories = await db.category.findMany({
    where: {
      isActive: true,
      parentId: null,
    },
    orderBy: [{ sortOrder: 'asc' }, { nameKa: 'asc' }],
    include: {
      _count: {
        select: { products: true },
      },
      children: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        include: {
          _count: {
            select: { products: true },
          },
          children: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            include: {
              _count: {
                select: { products: true },
              },
            },
          },
        },
      },
    },
  });

  return categories as CategoryWithChildren[];
}

interface BreadcrumbItem {
  id: string;
  slug: string;
  nameKa: string;
  nameEn: string;
}

/**
 * Get category breadcrumb path
 */
export async function getCategoryBreadcrumb(
  slugOrId: string
): Promise<BreadcrumbItem[]> {
  const breadcrumb: BreadcrumbItem[] = [];

  let currentSlugOrId: string | null = slugOrId;

  while (currentSlugOrId) {
    const searchId: string = currentSlugOrId;
    const cat = await db.category.findFirst({
      where: {
        OR: [{ slug: searchId }, { id: searchId }],
        isActive: true,
      },
      select: {
        id: true,
        slug: true,
        nameKa: true,
        nameEn: true,
        parentId: true,
      },
    });

    if (!cat) break;

    breadcrumb.unshift({
      id: cat.id,
      slug: cat.slug,
      nameKa: cat.nameKa,
      nameEn: cat.nameEn,
    });

    currentSlugOrId = cat.parentId;
  }

  return breadcrumb;
}

/**
 * Build hierarchical tree from flat category list
 */
function buildCategoryTree(
  categories: CategoryWithChildren[],
  parentId: string | null = null
): CategoryWithChildren[] {
  return categories
    .filter((cat) => cat.parentId === parentId)
    .map((cat) => ({
      ...cat,
      children: buildCategoryTree(categories, cat.id),
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
