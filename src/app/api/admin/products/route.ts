import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateSlug } from '@/lib/utils';

// GET /api/admin/products - List all products with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const isActive = searchParams.get('isActive');
    const isFeatured = searchParams.get('isFeatured');
    const stockStatus = searchParams.get('stockStatus');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { nameKa: { contains: search, mode: 'insensitive' } },
        { nameEn: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (isActive !== null && isActive !== undefined && isActive !== '') {
      where.isActive = isActive === 'true';
    }

    if (isFeatured !== null && isFeatured !== undefined && isFeatured !== '') {
      where.isFeatured = isFeatured === 'true';
    }

    // Stock status filter
    if (stockStatus && stockStatus !== 'all') {
      if (stockStatus === 'in_stock') {
        where.stock = { gt: 10 }; // More than low stock threshold
      } else if (stockStatus === 'low_stock') {
        where.AND = [
          { stock: { gt: 0 } },
          { stock: { lte: 10 } }
        ];
      } else if (stockStatus === 'out_of_stock') {
        where.stock = { equals: 0 };
      }
    }

    // Get products with pagination
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              nameKa: true,
              nameEn: true,
              slug: true,
            },
          },
          images: {
            where: { isPrimary: true },
            take: 1,
            select: {
              id: true,
              url: true,
              alt: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/admin/products - Create product
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      sku,
      slug,
      nameKa,
      nameEn,
      descKa,
      descEn,
      shortDescKa,
      shortDescEn,
      price,
      salePrice,
      costPrice,
      stock,
      lowStockThreshold,
      brand,
      manufacturer,
      dosageForm,
      dosage,
      activeIngredient,
      requiresPrescription,
      isFeatured,
      isActive,
      weight,
      barcode,
      categoryId,
      metaTitleKa,
      metaTitleEn,
      metaDescKa,
      metaDescEn,
      apexId,
    } = body;

    // Validate required fields
    if (!sku || !nameKa || !nameEn || price === undefined) {
      return NextResponse.json(
        { error: 'sku, nameKa, nameEn, and price are required' },
        { status: 400 }
      );
    }

    // Check if SKU already exists
    const existingProduct = await prisma.product.findUnique({
      where: { sku },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: 'Product with this SKU already exists' },
        { status: 400 }
      );
    }

    // Generate slug from name if not provided
    const productSlug = slug || generateSlug(nameEn);

    // Check if slug already exists
    const existingSlug = await prisma.product.findUnique({
      where: { slug: productSlug },
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: 'Product with this slug already exists' },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        sku,
        slug: productSlug,
        nameKa,
        nameEn,
        descKa: descKa || null,
        descEn: descEn || null,
        shortDescKa: shortDescKa || null,
        shortDescEn: shortDescEn || null,
        price,
        salePrice: salePrice || null,
        costPrice: costPrice || null,
        stock: stock ?? 0,
        lowStockThreshold: lowStockThreshold ?? 10,
        brand: brand || null,
        manufacturer: manufacturer || null,
        dosageForm: dosageForm || null,
        dosage: dosage || null,
        activeIngredient: activeIngredient || null,
        requiresPrescription: requiresPrescription ?? false,
        isFeatured: isFeatured ?? false,
        isActive: isActive ?? true,
        weight: weight || null,
        barcode: barcode || null,
        categoryId: categoryId || null,
        metaTitleKa: metaTitleKa || null,
        metaTitleEn: metaTitleEn || null,
        metaDescKa: metaDescKa || null,
        metaDescEn: metaDescEn || null,
        apexId: apexId || null,
      },
      include: {
        category: {
          select: {
            id: true,
            nameKa: true,
            nameEn: true,
            slug: true,
          },
        },
        images: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
