import { type NextRequest, NextResponse } from 'next/server';

import { type DosageForm } from '@/generated/prisma';
import { type Locale } from '@/lib/constants';
import { serialize } from '@/lib/utils';
import {
  getProducts,
  type ProductListOptions,
  type SortOption,
  type StockStatus,
} from '@/services/products';

/**
 * GET /api/products
 *
 * Public products API with full-text search, filtering, sorting, and pagination.
 *
 * Query Parameters:
 * - search: Full-text search query (uses PostgreSQL GIN full-text search)
 * - category: Category slug or ID
 * - minPrice: Minimum price filter
 * - maxPrice: Maximum price filter
 * - brands: Comma-separated brand names
 * - manufacturers: Comma-separated manufacturer names
 * - dosageForms: Comma-separated dosage form types
 * - stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' | 'all'
 * - requiresPrescription: 'true' | 'false' for filtering by prescription requirement
 * - sort: Sort option (popularity, price_asc, price_desc, name_asc, name_desc, date_desc)
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - cursor: Cursor for cursor-based pagination (alternative to page)
 * - locale: Locale for name sorting (ka/en)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category') || undefined;
    const minPrice = searchParams.get('minPrice')
      ? parseFloat(searchParams.get('minPrice')!)
      : undefined;
    const maxPrice = searchParams.get('maxPrice')
      ? parseFloat(searchParams.get('maxPrice')!)
      : undefined;
    const brands = searchParams.get('brands')?.split(',').filter(Boolean) || undefined;
    const manufacturers = searchParams.get('manufacturers')?.split(',').filter(Boolean) || undefined;
    const dosageForms = (searchParams.get('dosageForms')?.split(',').filter(Boolean) as DosageForm[]) || undefined;
    const stockStatus = (searchParams.get('stockStatus') as StockStatus) || undefined;
    const requiresPrescriptionParam = searchParams.get('requiresPrescription');
    const requiresPrescription = requiresPrescriptionParam === 'true'
      ? true
      : requiresPrescriptionParam === 'false'
      ? false
      : undefined;
    const sort = (searchParams.get('sort') as SortOption) || 'popularity';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const cursor = searchParams.get('cursor') || undefined;
    const locale = (searchParams.get('locale') as Locale) || 'ka';

    // Build options
    const options: ProductListOptions = {
      search,
      category,
      includeChildCategories: true,
      minPrice,
      maxPrice,
      brand: brands,
      manufacturer: manufacturers,
      dosageForm: dosageForms,
      stockStatus,
      requiresPrescription,
      sort,
      page,
      limit,
      cursor,
      locale,
      isActive: true, // Only show active products
    };

    const result = await getProducts(options);

    // Serialize to convert Decimal objects to plain numbers
    return NextResponse.json({
      success: true,
      data: serialize(result),
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch products',
      },
      { status: 500 }
    );
  }
}
