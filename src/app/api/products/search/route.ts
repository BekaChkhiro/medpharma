import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { serialize } from '@/lib/utils';

/**
 * GET /api/products/search
 *
 * Lightweight search endpoint optimized for autocomplete.
 * Returns minimal product data without filters metadata.
 *
 * Query Parameters:
 * - q: Search query (required, min 2 chars)
 * - limit: Max results (default: 5, max: 10)
 * - locale: 'ka' | 'en' (default: 'ka')
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() || '';
    const limit = Math.min(parseInt(searchParams.get('limit') || '5', 10), 10);
    const locale = searchParams.get('locale') || 'ka';

    if (query.length < 2) {
      return NextResponse.json({
        success: true,
        data: { products: [] },
      });
    }

    // Sanitize query for search
    const sanitizedTerms = query
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .map((term) => term.toLowerCase());

    if (sanitizedTerms.length === 0) {
      return NextResponse.json({
        success: true,
        data: { products: [] },
      });
    }

    // Build tsquery with prefix matching
    const tsqueryString = sanitizedTerms.map((t) => `${t}:*`).join(' & ');

    // Try full-text search first
    let productIds: string[] = [];

    try {
      const searchResults = await db.$queryRaw<Array<{ id: string; rank: number }>>`
        SELECT id, ts_rank(search_vector, to_tsquery('simple', ${tsqueryString})) as rank
        FROM products
        WHERE search_vector @@ to_tsquery('simple', ${tsqueryString})
          AND "isActive" = true
        ORDER BY rank DESC
        LIMIT ${limit}
      `;
      productIds = searchResults.map((r) => r.id);
    } catch {
      // Fallback to ILIKE search
      const likePattern = `%${sanitizedTerms.join('%')}%`;
      const fallbackResults = await db.$queryRaw<Array<{ id: string }>>`
        SELECT id FROM products
        WHERE "isActive" = true
          AND (
            LOWER("nameKa") LIKE ${likePattern}
            OR LOWER("nameEn") LIKE ${likePattern}
            OR LOWER(brand) LIKE ${likePattern}
            OR LOWER(sku) LIKE ${likePattern}
          )
        LIMIT ${limit}
      `;
      productIds = fallbackResults.map((r) => r.id);
    }

    if (productIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: { products: [] },
      });
    }

    // Fetch product details with minimal includes
    const products = await db.product.findMany({
      where: {
        id: { in: productIds },
      },
      select: {
        id: true,
        nameKa: true,
        nameEn: true,
        slug: true,
        price: true,
        salePrice: true,
        stock: true,
        brand: true,
        images: {
          where: { isPrimary: true },
          take: 1,
          select: {
            url: true,
            alt: true,
          },
        },
        category: {
          select: {
            nameKa: true,
            nameEn: true,
          },
        },
      },
    });

    // Sort products by the original search ranking
    const sortedProducts = productIds
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean);

    return NextResponse.json({
      success: true,
      data: {
        products: serialize(sortedProducts),
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Search failed',
      },
      { status: 500 }
    );
  }
}
