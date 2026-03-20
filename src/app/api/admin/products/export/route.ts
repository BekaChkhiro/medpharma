import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  generateCSV,
  generateExcel,
  generateExportFilename,
  getExportMimeType,
  type ExportableProduct,
  type ExportFormat,
} from '@/services/export';

// GET /api/admin/products/export - Export products to CSV or Excel
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = (searchParams.get('format') || 'csv') as ExportFormat;
    const includeAll = searchParams.get('includeAll') === 'true';
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const isActive = searchParams.get('isActive');
    const isFeatured = searchParams.get('isFeatured');

    // Validate format
    if (!['csv', 'xlsx'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Use "csv" or "xlsx"' },
        { status: 400 }
      );
    }

    // Build where clause (same as list endpoint)
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

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (isFeatured !== null && isFeatured !== undefined) {
      where.isFeatured = isFeatured === 'true';
    }

    // Fetch all products (no pagination for export)
    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            slug: true,
            nameKa: true,
            nameEn: true,
          },
        },
        images: {
          select: {
            url: true,
            isPrimary: true,
          },
          orderBy: [
            { isPrimary: 'desc' },
            { sortOrder: 'asc' },
          ],
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform products to exportable format (convert Decimal to number)
    const exportableProducts: ExportableProduct[] = products.map((product) => ({
      id: product.id,
      sku: product.sku,
      slug: product.slug,
      nameKa: product.nameKa,
      nameEn: product.nameEn,
      descKa: product.descKa,
      descEn: product.descEn,
      shortDescKa: product.shortDescKa,
      shortDescEn: product.shortDescEn,
      price: Number(product.price),
      salePrice: product.salePrice ? Number(product.salePrice) : null,
      costPrice: product.costPrice ? Number(product.costPrice) : null,
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold,
      brand: product.brand,
      manufacturer: product.manufacturer,
      dosageForm: product.dosageForm,
      dosage: product.dosage,
      activeIngredient: product.activeIngredient,
      requiresPrescription: product.requiresPrescription,
      isFeatured: product.isFeatured,
      isActive: product.isActive,
      weight: product.weight ? Number(product.weight) : null,
      barcode: product.barcode,
      metaTitleKa: product.metaTitleKa,
      metaTitleEn: product.metaTitleEn,
      metaDescKa: product.metaDescKa,
      metaDescEn: product.metaDescEn,
      apexId: product.apexId,
      category: product.category,
      images: product.images,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));

    // Generate export content
    let content: string | ArrayBuffer;
    if (format === 'csv') {
      content = generateCSV(exportableProducts, { includeAllFields: includeAll });
    } else {
      content = generateExcel(exportableProducts, { includeAllFields: includeAll });
    }

    // Create response with appropriate headers
    const filename = generateExportFilename(format);
    const mimeType = getExportMimeType(format);

    const responseHeaders = new Headers({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-cache',
    });

    if (format === 'csv') {
      // Add BOM for UTF-8 CSV to ensure Excel reads it correctly
      const bom = '\uFEFF';
      return new NextResponse(bom + content, { headers: responseHeaders });
    } else {
      return new NextResponse(content, { headers: responseHeaders });
    }
  } catch (error) {
    console.error('Error exporting products:', error);
    return NextResponse.json(
      { error: 'Failed to export products' },
      { status: 500 }
    );
  }
}
