import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateSlug } from '@/lib/utils';

// GET /api/admin/products/[id] - Get single product
export async function GET(
  request: NextRequest,
  segmentData: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await segmentData.params;

    const product = await prisma.product.findUnique({
      where: { id },
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
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/products/[id] - Update product
export async function PUT(
  request: NextRequest,
  segmentData: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await segmentData.params;
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

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if SKU is being changed and if it conflicts
    if (sku && sku !== existingProduct.sku) {
      const skuConflict = await prisma.product.findUnique({
        where: { sku },
      });

      if (skuConflict) {
        return NextResponse.json(
          { error: 'Product with this SKU already exists' },
          { status: 400 }
        );
      }
    }

    // Check if slug is being changed and if it conflicts
    if (slug && slug !== existingProduct.slug) {
      const slugConflict = await prisma.product.findUnique({
        where: { slug },
      });

      if (slugConflict) {
        return NextResponse.json(
          { error: 'Product with this slug already exists' },
          { status: 400 }
        );
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(sku && { sku }),
        ...(slug && { slug }),
        ...(nameKa && { nameKa }),
        ...(nameEn && { nameEn }),
        descKa: descKa !== undefined ? descKa : undefined,
        descEn: descEn !== undefined ? descEn : undefined,
        shortDescKa: shortDescKa !== undefined ? shortDescKa : undefined,
        shortDescEn: shortDescEn !== undefined ? shortDescEn : undefined,
        ...(price !== undefined && { price }),
        salePrice: salePrice !== undefined ? salePrice : undefined,
        costPrice: costPrice !== undefined ? costPrice : undefined,
        ...(stock !== undefined && { stock }),
        ...(lowStockThreshold !== undefined && { lowStockThreshold }),
        brand: brand !== undefined ? brand : undefined,
        manufacturer: manufacturer !== undefined ? manufacturer : undefined,
        dosageForm: dosageForm !== undefined ? dosageForm : undefined,
        dosage: dosage !== undefined ? dosage : undefined,
        activeIngredient:
          activeIngredient !== undefined ? activeIngredient : undefined,
        ...(requiresPrescription !== undefined && { requiresPrescription }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(isActive !== undefined && { isActive }),
        weight: weight !== undefined ? weight : undefined,
        barcode: barcode !== undefined ? barcode : undefined,
        categoryId: categoryId !== undefined ? categoryId : undefined,
        metaTitleKa: metaTitleKa !== undefined ? metaTitleKa : undefined,
        metaTitleEn: metaTitleEn !== undefined ? metaTitleEn : undefined,
        metaDescKa: metaDescKa !== undefined ? metaDescKa : undefined,
        metaDescEn: metaDescEn !== undefined ? metaDescEn : undefined,
        apexId: apexId !== undefined ? apexId : undefined,
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
        images: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  segmentData: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await segmentData.params;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        orderItems: {
          select: { id: true },
          take: 1,
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if product has orders
    if (product.orderItems.length > 0) {
      return NextResponse.json(
        {
          error:
            'Cannot delete product with existing orders. Set to inactive instead.',
        },
        { status: 400 }
      );
    }

    // Delete product (cascades to images)
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
