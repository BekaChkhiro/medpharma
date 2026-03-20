/**
 * Product Service Layer
 *
 * Provides queries for catalog, search, filtering, and related products.
 * Uses PostgreSQL full-text search (GIN indexes) for efficient searching.
 *
 * Features:
 * - Full catalog listing with pagination
 * - Full-text search (Georgian + English)
 * - Multi-filter support (category, price, brand, dosage, stock)
 * - Sorting options (price, name, date, popularity)
 * - Related products recommendations
 * - Featured and sale products
 * - Category-based filtering with hierarchy support
 */

import { type Prisma } from '@/generated/prisma';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, type Locale } from '@/lib/constants';
import { db, type Product, Category, type DosageForm } from '@/lib/db';

// =============================================================================
// TYPES
// =============================================================================

export type SortOption =
  | 'price_asc'
  | 'price_desc'
  | 'name_asc'
  | 'name_desc'
  | 'date_desc'
  | 'date_asc'
  | 'popularity';

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'all';

export interface ProductFilters {
  /** Search query (full-text search) */
  search?: string;
  /** Category ID or slug */
  category?: string;
  /** Include child category products */
  includeChildCategories?: boolean;
  /** Minimum price */
  minPrice?: number;
  /** Maximum price */
  maxPrice?: number;
  /** Brand filter (exact match or array) */
  brand?: string | string[];
  /** Manufacturer filter */
  manufacturer?: string | string[];
  /** Dosage form filter */
  dosageForm?: DosageForm | DosageForm[];
  /** Stock status filter */
  stockStatus?: StockStatus;
  /** Only featured products */
  isFeatured?: boolean;
  /** Only products on sale */
  onSale?: boolean;
  /** Only active products */
  isActive?: boolean;
  /** Requires prescription filter */
  requiresPrescription?: boolean;
}

export interface PaginationOptions {
  /** Page number (1-based) */
  page?: number;
  /** Items per page */
  limit?: number;
  /** Cursor for cursor-based pagination */
  cursor?: string;
}

export interface ProductListOptions extends ProductFilters, PaginationOptions {
  /** Sort option */
  sort?: SortOption;
  /** Locale for name sorting */
  locale?: Locale;
}

export interface ProductListResult {
  products: ProductWithImages[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    nextCursor?: string;
  };
  filters: {
    appliedFilters: Partial<ProductFilters>;
    availableBrands: string[];
    availableManufacturers: string[];
    priceRange: { min: number; max: number };
  };
}

export interface ProductWithImages extends Product {
  images: {
    id: string;
    url: string;
    alt: string | null;
    sortOrder: number;
    isPrimary: boolean;
  }[];
  category: {
    id: string;
    slug: string;
    nameKa: string;
    nameEn: string;
  } | null;
}

export interface ProductDetail extends ProductWithImages {
  category: {
    id: string;
    slug: string;
    nameKa: string;
    nameEn: string;
    parent: {
      id: string;
      slug: string;
      nameKa: string;
      nameEn: string;
    } | null;
  } | null;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Serialize a product to convert Decimal to number for Client Components
 */
function serializeProduct<T extends Record<string, unknown>>(product: T): T {
  const serialized: Record<string, unknown> = { ...product };

  // Convert Decimal fields to numbers
  const decimalFields = ['price', 'salePrice', 'costPrice', 'weight'];

  for (const field of decimalFields) {
    if (field in serialized && serialized[field] != null) {
      serialized[field] = Number(serialized[field]);
    }
  }

  return serialized as T;
}

/**
 * Serialize an array of products
 */
function serializeProducts<T extends Record<string, unknown>>(products: T[]): T[] {
  return products.map(serializeProduct);
}

/**
 * Build sort order for Prisma query
 */
function buildSortOrder(
  sort: SortOption = 'date_desc',
  locale: Locale = 'ka'
): Prisma.ProductOrderByWithRelationInput[] {
  const nameField = locale === 'ka' ? 'nameKa' : 'nameEn';

  switch (sort) {
    case 'price_asc':
      return [{ price: 'asc' }, { id: 'asc' }];
    case 'price_desc':
      return [{ price: 'desc' }, { id: 'desc' }];
    case 'name_asc':
      return [{ [nameField]: 'asc' }, { id: 'asc' }];
    case 'name_desc':
      return [{ [nameField]: 'desc' }, { id: 'desc' }];
    case 'date_asc':
      return [{ createdAt: 'asc' }, { id: 'asc' }];
    case 'date_desc':
      return [{ createdAt: 'desc' }, { id: 'desc' }];
    case 'popularity':
      return [{ orderCount: 'desc' }, { viewCount: 'desc' }, { id: 'desc' }];
    default:
      return [{ createdAt: 'desc' }, { id: 'desc' }];
  }
}

/**
 * Build where clause for filtering
 */
async function buildWhereClause(
  filters: ProductFilters
): Promise<Prisma.ProductWhereInput> {
  const where: Prisma.ProductWhereInput = {};
  const AND: Prisma.ProductWhereInput[] = [];

  // Active status (default to true)
  if (filters.isActive !== false) {
    AND.push({ isActive: true });
  }

  // Search - will be handled separately using PostgreSQL full-text search
  // The search filter is processed in getProducts() using raw SQL for better performance

  // Category filter (supports ID or slug)
  if (filters.category) {
    const categoryIds = await getCategoryIdsWithChildren(
      filters.category,
      filters.includeChildCategories ?? true
    );
    if (categoryIds.length > 0) {
      AND.push({ categoryId: { in: categoryIds } });
    }
  }

  // Price range
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const priceCondition: Prisma.ProductWhereInput = {};

    if (filters.minPrice !== undefined) {
      // For sale items, check sale price; otherwise regular price
      AND.push({
        OR: [
          {
            salePrice: { not: null },
            AND: [{ salePrice: { gte: filters.minPrice } }],
          },
          {
            salePrice: null,
            price: { gte: filters.minPrice },
          },
        ],
      });
    }

    if (filters.maxPrice !== undefined) {
      AND.push({
        OR: [
          {
            salePrice: { not: null },
            AND: [{ salePrice: { lte: filters.maxPrice } }],
          },
          {
            salePrice: null,
            price: { lte: filters.maxPrice },
          },
        ],
      });
    }
  }

  // Brand filter
  if (filters.brand) {
    const brands = Array.isArray(filters.brand)
      ? filters.brand
      : [filters.brand];
    AND.push({ brand: { in: brands, mode: 'insensitive' } });
  }

  // Manufacturer filter
  if (filters.manufacturer) {
    const manufacturers = Array.isArray(filters.manufacturer)
      ? filters.manufacturer
      : [filters.manufacturer];
    AND.push({ manufacturer: { in: manufacturers, mode: 'insensitive' } });
  }

  // Dosage form filter
  if (filters.dosageForm) {
    const dosageForms = Array.isArray(filters.dosageForm)
      ? filters.dosageForm
      : [filters.dosageForm];
    AND.push({ dosageForm: { in: dosageForms } });
  }

  // Stock status filter
  if (filters.stockStatus && filters.stockStatus !== 'all') {
    switch (filters.stockStatus) {
      case 'in_stock':
        AND.push({ stock: { gt: 0 } });
        break;
      case 'low_stock':
        AND.push({
          AND: [
            { stock: { gt: 0 } },
            {
              // stock <= lowStockThreshold - need raw comparison
              stock: { lte: 10 }, // Using default threshold
            },
          ],
        });
        break;
      case 'out_of_stock':
        AND.push({ stock: { lte: 0 } });
        break;
    }
  }

  // Featured filter
  if (filters.isFeatured !== undefined) {
    AND.push({ isFeatured: filters.isFeatured });
  }

  // On sale filter
  if (filters.onSale) {
    AND.push({
      salePrice: { not: null },
      // Ensure sale price is less than regular price
    });
  }

  // Prescription filter
  if (filters.requiresPrescription !== undefined) {
    AND.push({ requiresPrescription: filters.requiresPrescription });
  }

  if (AND.length > 0) {
    where.AND = AND;
  }

  return where;
}

/**
 * Get category IDs including child categories
 */
async function getCategoryIdsWithChildren(
  categoryIdOrSlug: string,
  includeChildren: boolean
): Promise<string[]> {
  // Find the category by ID or slug
  const category = await db.category.findFirst({
    where: {
      OR: [{ id: categoryIdOrSlug }, { slug: categoryIdOrSlug }],
      isActive: true,
    },
    select: { id: true },
  });

  if (!category) {
    return [];
  }

  const categoryIds = [category.id];

  if (includeChildren) {
    // Get all child categories recursively
    const childCategories = await getChildCategoryIds(category.id);
    categoryIds.push(...childCategories);
  }

  return categoryIds;
}

/**
 * Recursively get all child category IDs
 */
async function getChildCategoryIds(parentId: string): Promise<string[]> {
  const children = await db.category.findMany({
    where: {
      parentId,
      isActive: true,
    },
    select: { id: true },
  });

  const childIds = children.map((c) => c.id);
  const grandchildIds: string[] = [];

  for (const childId of childIds) {
    const grandchildren = await getChildCategoryIds(childId);
    grandchildIds.push(...grandchildren);
  }

  return [...childIds, ...grandchildIds];
}

// =============================================================================
// MAIN QUERY FUNCTIONS
// =============================================================================

/**
 * Get products list with filtering, sorting, and pagination
 * Supports both offset-based and cursor-based pagination
 */
export async function getProducts(
  options: ProductListOptions = {}
): Promise<ProductListResult> {
  const {
    page = 1,
    limit = DEFAULT_PAGE_SIZE,
    cursor,
    sort = 'date_desc',
    locale = 'ka',
    search,
    ...filters
  } = options;

  // Validate pagination
  const validPage = Math.max(1, page);
  const validLimit = Math.min(Math.max(1, limit), MAX_PAGE_SIZE);

  // Build base where clause (without search)
  const where = await buildWhereClause(filters);
  const orderBy = buildSortOrder(sort, locale);

  // Handle PostgreSQL full-text search
  let searchMatchingIds: string[] | null = null;
  let searchRanking: Map<string, number> | null = null;

  if (search && search.trim()) {
    const searchResult = await performFullTextSearch(search.trim());
    searchMatchingIds = searchResult.ids;
    searchRanking = searchResult.ranking;

    // If no matches found, return empty result
    if (searchMatchingIds.length === 0) {
      return {
        products: [],
        pagination: {
          page: validPage,
          limit: validLimit,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
        filters: await getFilterMetadata(filters),
      };
    }

    // Add ID constraint to where clause
    if (where.AND) {
      (where.AND as Prisma.ProductWhereInput[]).push({ id: { in: searchMatchingIds } });
    } else {
      where.AND = [{ id: { in: searchMatchingIds } }];
    }
  }

  // Cursor-based pagination
  let skip = 0;
  let cursorCondition: Prisma.ProductWhereUniqueInput | undefined;

  if (cursor) {
    // Use cursor for pagination (skip the cursor item)
    cursorCondition = { id: cursor };
    skip = 1; // Skip the cursor item itself
  } else {
    // Offset-based pagination
    skip = (validPage - 1) * validLimit;
  }

  // Execute queries in parallel
  const [products, total, filterData] = await Promise.all([
    db.product.findMany({
      where,
      orderBy,
      skip,
      take: validLimit,
      cursor: cursorCondition,
      include: {
        images: {
          orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
        },
        category: {
          select: {
            id: true,
            slug: true,
            nameKa: true,
            nameEn: true,
          },
        },
      },
    }),
    db.product.count({ where }),
    getFilterMetadata(filters),
  ]);

  // If searching with ranking, sort by relevance
  let sortedProducts = products;
  if (searchRanking && sort === 'popularity') {
    sortedProducts = [...products].sort((a, b) => {
      const rankA = searchRanking!.get(a.id) || 0;
      const rankB = searchRanking!.get(b.id) || 0;
      return rankB - rankA; // Higher rank first
    });
  }

  const totalPages = Math.ceil(total / validLimit);
  const currentPage = cursor ? Math.ceil(skip / validLimit) + 1 : validPage;

  return {
    products: serializeProducts(sortedProducts) as ProductWithImages[],
    pagination: {
      page: currentPage,
      limit: validLimit,
      total,
      totalPages,
      hasNext: cursor
        ? products.length === validLimit
        : validPage < totalPages,
      hasPrev: cursor ? skip > 0 : validPage > 1,
      nextCursor: products.length > 0 ? products[products.length - 1].id : undefined,
    },
    filters: filterData,
  };
}

/**
 * Perform PostgreSQL full-text search using GIN index
 * Returns matching product IDs with relevance ranking
 */
async function performFullTextSearch(
  query: string
): Promise<{ ids: string[]; ranking: Map<string, number> }> {
  // Sanitize and prepare search query for tsquery
  // Split into terms and join with '&' for AND logic, or '|' for OR logic
  const sanitizedTerms = query
    .replace(/[^\p{L}\p{N}\s]/gu, ' ') // Remove special characters, keep Unicode letters/numbers
    .split(/\s+/)
    .filter(Boolean)
    .map((term) => term.toLowerCase());

  if (sanitizedTerms.length === 0) {
    return { ids: [], ranking: new Map() };
  }

  // Build tsquery with prefix matching for partial words
  // Using :* for prefix matching allows searching "asp" to match "aspirin"
  const tsqueryString = sanitizedTerms.map((t) => `${t}:*`).join(' & ');

  try {
    // Query using the search_vector column with ts_rank for relevance
    const results = await db.$queryRaw<Array<{ id: string; rank: number }>>`
      SELECT id, ts_rank(search_vector, to_tsquery('simple', ${tsqueryString})) as rank
      FROM products
      WHERE search_vector @@ to_tsquery('simple', ${tsqueryString})
        AND "isActive" = true
      ORDER BY rank DESC
      LIMIT 1000
    `;

    const ids = results.map((r) => r.id);
    const ranking = new Map(results.map((r) => [r.id, r.rank]));

    return { ids, ranking };
  } catch (error) {
    // Fallback to simple ILIKE search if full-text fails
    console.error('Full-text search failed, falling back to ILIKE:', error);
    return performFallbackSearch(sanitizedTerms);
  }
}

/**
 * Fallback search using ILIKE when full-text search fails
 */
async function performFallbackSearch(
  terms: string[]
): Promise<{ ids: string[]; ranking: Map<string, number> }> {
  const results = await db.product.findMany({
    where: {
      isActive: true,
      AND: terms.map((term) => ({
        OR: [
          { nameKa: { contains: term, mode: 'insensitive' } },
          { nameEn: { contains: term, mode: 'insensitive' } },
          { brand: { contains: term, mode: 'insensitive' } },
          { manufacturer: { contains: term, mode: 'insensitive' } },
          { sku: { contains: term, mode: 'insensitive' } },
        ],
      })),
    },
    select: { id: true },
    take: 1000,
  });

  const ids = results.map((r) => r.id);
  // No ranking for fallback search
  return { ids, ranking: new Map() };
}

/**
 * Get filter metadata (available brands, price range, etc.)
 */
async function getFilterMetadata(
  currentFilters: ProductFilters
): Promise<ProductListResult['filters']> {
  // Get distinct brands and manufacturers for active products
  const [brandsResult, manufacturersResult, priceRangeResult] =
    await Promise.all([
      db.product.findMany({
        where: { isActive: true, brand: { not: null } },
        select: { brand: true },
        distinct: ['brand'],
        orderBy: { brand: 'asc' },
      }),
      db.product.findMany({
        where: { isActive: true, manufacturer: { not: null } },
        select: { manufacturer: true },
        distinct: ['manufacturer'],
        orderBy: { manufacturer: 'asc' },
      }),
      db.product.aggregate({
        where: { isActive: true },
        _min: { price: true },
        _max: { price: true },
      }),
    ]);

  return {
    appliedFilters: currentFilters,
    availableBrands: brandsResult
      .map((p) => p.brand)
      .filter((b): b is string => b !== null),
    availableManufacturers: manufacturersResult
      .map((p) => p.manufacturer)
      .filter((m): m is string => m !== null),
    priceRange: {
      min: priceRangeResult._min.price
        ? Number(priceRangeResult._min.price)
        : 0,
      max: priceRangeResult._max.price
        ? Number(priceRangeResult._max.price)
        : 0,
    },
  };
}

/**
 * Search products with full-text search
 */
export async function searchProducts(
  query: string,
  options: Omit<ProductListOptions, 'search'> = {}
): Promise<ProductListResult> {
  return getProducts({
    ...options,
    search: query,
    sort: options.sort || 'popularity',
  });
}

/**
 * Get a single product by ID or slug
 */
export async function getProduct(
  idOrSlug: string
): Promise<ProductDetail | null> {
  const product = await db.product.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      isActive: true,
    },
    include: {
      images: {
        orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
      },
      category: {
        select: {
          id: true,
          slug: true,
          nameKa: true,
          nameEn: true,
          parent: {
            select: {
              id: true,
              slug: true,
              nameKa: true,
              nameEn: true,
            },
          },
        },
      },
    },
  });

  return product ? serializeProduct(product) as ProductDetail : null;
}

/**
 * Get a product by SKU (for admin/import)
 */
export async function getProductBySku(sku: string): Promise<Product | null> {
  return db.product.findUnique({
    where: { sku },
  });
}

/**
 * Increment product view count
 */
export async function incrementViewCount(productId: string): Promise<void> {
  try {
    // Use raw SQL to avoid trigger issues
    await db.$executeRaw`
      UPDATE products
      SET "viewCount" = "viewCount" + 1, "updatedAt" = NOW()
      WHERE id = ${productId}
    `;
  } catch (error) {
    // Silently fail - view count is not critical
    console.error('Failed to increment view count:', error);
  }
}

// =============================================================================
// RELATED PRODUCTS
// =============================================================================

/**
 * Get related products based on category and attributes
 */
export async function getRelatedProducts(
  productId: string,
  options: {
    limit?: number;
    locale?: Locale;
  } = {}
): Promise<ProductWithImages[]> {
  const { limit = 8, locale = 'ka' } = options;

  // Get the source product
  const product = await db.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      categoryId: true,
      brand: true,
      manufacturer: true,
      dosageForm: true,
      activeIngredient: true,
    },
  });

  if (!product) {
    return [];
  }

  // Build related products query with scoring
  // Priority: same category > same brand > same dosage form > same ingredient
  const relatedProducts = await db.product.findMany({
    where: {
      id: { not: productId },
      isActive: true,
      OR: [
        { categoryId: product.categoryId },
        { brand: product.brand },
        { manufacturer: product.manufacturer },
        { dosageForm: product.dosageForm },
        { activeIngredient: product.activeIngredient },
      ],
    },
    include: {
      images: {
        where: { isPrimary: true },
        take: 1,
      },
      category: {
        select: {
          id: true,
          slug: true,
          nameKa: true,
          nameEn: true,
        },
      },
    },
    take: limit * 2, // Get more to filter/sort later
    orderBy: [{ orderCount: 'desc' }, { viewCount: 'desc' }],
  });

  // Score and sort related products
  const scoredProducts = relatedProducts.map((p) => {
    let score = 0;
    if (product.categoryId && p.categoryId === product.categoryId) score += 10;
    if (product.brand && p.brand === product.brand) score += 5;
    if (product.manufacturer && p.manufacturer === product.manufacturer)
      score += 3;
    if (product.dosageForm && p.dosageForm === product.dosageForm) score += 2;
    if (
      product.activeIngredient &&
      p.activeIngredient === product.activeIngredient
    )
      score += 4;
    return { product: p, score };
  });

  // Sort by score and take limit
  scoredProducts.sort((a, b) => b.score - a.score);

  return serializeProducts(scoredProducts.slice(0, limit).map((s) => s.product)) as ProductWithImages[];
}

// =============================================================================
// FEATURED & SPECIAL PRODUCTS
// =============================================================================

/**
 * Get featured products
 */
export async function getFeaturedProducts(
  options: {
    limit?: number;
    locale?: Locale;
  } = {}
): Promise<ProductWithImages[]> {
  const { limit = 12, locale = 'ka' } = options;

  const products = await db.product.findMany({
    where: {
      isActive: true,
      isFeatured: true,
      stock: { gt: 0 },
    },
    include: {
      images: {
        orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
        take: 1,
      },
      category: {
        select: {
          id: true,
          slug: true,
          nameKa: true,
          nameEn: true,
        },
      },
    },
    orderBy: [{ orderCount: 'desc' }, { viewCount: 'desc' }],
    take: limit,
  });

  return serializeProducts(products) as ProductWithImages[];
}

/**
 * Get products on sale
 */
export async function getSaleProducts(
  options: {
    limit?: number;
    locale?: Locale;
  } = {}
): Promise<ProductWithImages[]> {
  const { limit = 12, locale = 'ka' } = options;

  const products = await db.product.findMany({
    where: {
      isActive: true,
      salePrice: { not: null },
      stock: { gt: 0 },
    },
    include: {
      images: {
        orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
        take: 1,
      },
      category: {
        select: {
          id: true,
          slug: true,
          nameKa: true,
          nameEn: true,
        },
      },
    },
    orderBy: [{ orderCount: 'desc' }, { createdAt: 'desc' }],
    take: limit,
  });

  return serializeProducts(products) as ProductWithImages[];
}

/**
 * Get new products (recently added)
 */
export async function getNewProducts(
  options: {
    limit?: number;
    daysAgo?: number;
  } = {}
): Promise<ProductWithImages[]> {
  const { limit = 12, daysAgo = 30 } = options;

  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - daysAgo);

  const products = await db.product.findMany({
    where: {
      isActive: true,
      stock: { gt: 0 },
      createdAt: { gte: dateThreshold },
    },
    include: {
      images: {
        orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
        take: 1,
      },
      category: {
        select: {
          id: true,
          slug: true,
          nameKa: true,
          nameEn: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return serializeProducts(products) as ProductWithImages[];
}

/**
 * Get popular/best-selling products
 */
export async function getPopularProducts(
  options: {
    limit?: number;
    locale?: Locale;
  } = {}
): Promise<ProductWithImages[]> {
  const { limit = 12, locale = 'ka' } = options;

  const products = await db.product.findMany({
    where: {
      isActive: true,
      stock: { gt: 0 },
    },
    include: {
      images: {
        orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
        take: 1,
      },
      category: {
        select: {
          id: true,
          slug: true,
          nameKa: true,
          nameEn: true,
        },
      },
    },
    orderBy: [{ orderCount: 'desc' }, { viewCount: 'desc' }],
    take: limit,
  });

  return serializeProducts(products) as ProductWithImages[];
}

// =============================================================================
// CATEGORY PRODUCTS
// =============================================================================

/**
 * Get products by category
 */
export async function getProductsByCategory(
  categoryIdOrSlug: string,
  options: Omit<ProductListOptions, 'category'> = {}
): Promise<ProductListResult> {
  return getProducts({
    ...options,
    category: categoryIdOrSlug,
    includeChildCategories: options.includeChildCategories ?? true,
  });
}

// =============================================================================
// STOCK HELPERS
// =============================================================================

/**
 * Check product stock availability
 */
export async function checkStock(
  productId: string,
  quantity: number
): Promise<{
  available: boolean;
  currentStock: number;
  requestedQuantity: number;
}> {
  const product = await db.product.findUnique({
    where: { id: productId },
    select: { stock: true, isActive: true },
  });

  if (!product || !product.isActive) {
    return {
      available: false,
      currentStock: 0,
      requestedQuantity: quantity,
    };
  }

  return {
    available: product.stock >= quantity,
    currentStock: product.stock,
    requestedQuantity: quantity,
  };
}

/**
 * Get low stock products (for admin alerts)
 */
export async function getLowStockProducts(
  options: { limit?: number } = {}
): Promise<Product[]> {
  const { limit = 50 } = options;

  // Products where stock <= lowStockThreshold
  const products = await db.product.findMany({
    where: {
      isActive: true,
      stock: { gt: 0, lte: 10 }, // Default threshold
    },
    orderBy: { stock: 'asc' },
    take: limit,
  });

  return products;
}

/**
 * Get out of stock products (for admin)
 */
export async function getOutOfStockProducts(
  options: { limit?: number } = {}
): Promise<Product[]> {
  const { limit = 50 } = options;

  const products = await db.product.findMany({
    where: {
      isActive: true,
      stock: { lte: 0 },
    },
    orderBy: { updatedAt: 'desc' },
    take: limit,
  });

  return products;
}

// =============================================================================
// ADMIN HELPERS
// =============================================================================

/**
 * Get products for admin listing (includes inactive)
 */
export async function getProductsAdmin(
  options: ProductListOptions & { includeInactive?: boolean } = {}
): Promise<ProductListResult> {
  const { includeInactive = true, ...rest } = options;

  return getProducts({
    ...rest,
    isActive: includeInactive ? undefined : true,
  });
}

/**
 * Get product count by status
 */
export async function getProductStats(): Promise<{
  total: number;
  active: number;
  inactive: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  featured: number;
  onSale: number;
}> {
  const [
    total,
    active,
    inactive,
    inStock,
    lowStock,
    outOfStock,
    featured,
    onSale,
  ] = await Promise.all([
    db.product.count(),
    db.product.count({ where: { isActive: true } }),
    db.product.count({ where: { isActive: false } }),
    db.product.count({ where: { isActive: true, stock: { gt: 10 } } }),
    db.product.count({
      where: { isActive: true, stock: { gt: 0, lte: 10 } },
    }),
    db.product.count({ where: { isActive: true, stock: { lte: 0 } } }),
    db.product.count({ where: { isActive: true, isFeatured: true } }),
    db.product.count({ where: { isActive: true, salePrice: { not: null } } }),
  ]);

  return {
    total,
    active,
    inactive,
    inStock,
    lowStock,
    outOfStock,
    featured,
    onSale,
  };
}
