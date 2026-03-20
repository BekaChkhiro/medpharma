import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateSlug } from '@/lib/utils';
import {
  parseCSV,
  parseExcel,
  transformData,
  validateImportData,
  checkConflicts,
  generateSampleCSV,
  generateSampleExcel,
  type ColumnMapping,
  type ImportRow,
} from '@/services/import';

// POST /api/admin/products/import - Parse and preview import file
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const action = formData.get('action') as string;

    // Handle sample template download
    if (action === 'sample-csv') {
      const csv = generateSampleCSV();
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="product-import-template.csv"',
        },
      });
    }

    if (action === 'sample-xlsx') {
      const xlsx = generateSampleExcel();
      return new NextResponse(xlsx, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="product-import-template.xlsx"',
        },
      });
    }

    // Parse uploaded file
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    const fileName = file.name.toLowerCase();
    let parseResult;

    if (fileName.endsWith('.csv')) {
      const content = await file.text();
      parseResult = parseCSV(content);
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const buffer = await file.arrayBuffer();
      parseResult = parseExcel(buffer);
    } else {
      return NextResponse.json(
        { error: 'Invalid file format. Please upload CSV or Excel file.' },
        { status: 400 }
      );
    }

    if (parseResult.totalRows === 0) {
      return NextResponse.json(
        { error: 'File is empty or has no data rows' },
        { status: 400 }
      );
    }

    // Return preview data (first 10 rows)
    const previewRows = parseResult.rows.slice(0, 10);

    return NextResponse.json({
      success: true,
      data: {
        headers: parseResult.headers,
        suggestedMapping: parseResult.suggestedMapping,
        totalRows: parseResult.totalRows,
        previewRows: previewRows.map((row) => ({
          rowNumber: row.rowNumber,
          data: row.data,
        })),
      },
    });
  } catch (error) {
    console.error('Error parsing import file:', error);
    return NextResponse.json(
      { error: 'Failed to parse file' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/products/import - Validate and execute import
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const mappingJson = formData.get('mapping') as string;
    const mode = formData.get('mode') as string; // 'validate' | 'import'

    if (!file || !mappingJson) {
      return NextResponse.json(
        { error: 'File and column mapping are required' },
        { status: 400 }
      );
    }

    const mapping: ColumnMapping = JSON.parse(mappingJson);
    const fileName = file.name.toLowerCase();

    // Parse file
    let parseResult;
    if (fileName.endsWith('.csv')) {
      const content = await file.text();
      parseResult = parseCSV(content);
    } else {
      const buffer = await file.arrayBuffer();
      parseResult = parseExcel(buffer);
    }

    // Transform data using mapping
    const transformedRows = transformData(parseResult.rows, mapping);

    // Get existing products by SKU for conflict detection
    const skus = transformedRows
      .map((row) => row.data.sku)
      .filter((sku): sku is string => !!sku);

    const existingProducts = await prisma.product.findMany({
      where: { sku: { in: skus } },
      select: { id: true, sku: true },
    });

    const productMap = new Map(
      existingProducts.map((p) => [p.sku, { id: p.id, sku: p.sku }])
    );

    // Check for conflicts
    const rowsWithConflicts = await checkConflicts(transformedRows, productMap);

    // Get all categories for slug lookup
    const categories = await prisma.category.findMany({
      select: { id: true, slug: true, nameEn: true },
    });
    const categoryMap = new Map(categories.map((c) => [c.slug, c.id]));

    // Validate data
    const { validRows, invalidRows, stats } = validateImportData(rowsWithConflicts);

    // If validation mode, return validation results
    if (mode === 'validate') {
      return NextResponse.json({
        success: true,
        data: {
          stats,
          validRows: validRows.slice(0, 50).map((row) => ({
            rowNumber: row.rowNumber,
            sku: row.data.sku,
            nameEn: row.data.nameEn,
            action: row.action,
            warnings: row.warnings,
          })),
          invalidRows: invalidRows.slice(0, 50).map((row) => ({
            rowNumber: row.rowNumber,
            sku: row.data.sku,
            errors: row.errors,
          })),
          createCount: validRows.filter((r) => r.action === 'create').length,
          updateCount: validRows.filter((r) => r.action === 'update').length,
        },
      });
    }

    // Execute import
    if (mode !== 'import') {
      return NextResponse.json(
        { error: 'Invalid mode. Use "validate" or "import"' },
        { status: 400 }
      );
    }

    const results = {
      created: 0,
      updated: 0,
      failed: 0,
      errors: [] as { rowNumber: number; sku?: string; error: string }[],
    };

    // Process valid rows in batches
    const batchSize = 50;
    for (let i = 0; i < validRows.length; i += batchSize) {
      const batch = validRows.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (row) => {
          try {
            const productData = prepareProductData(row, categoryMap);

            if (row.action === 'update' && row.existingProductId) {
              await prisma.product.update({
                where: { id: row.existingProductId },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data: productData as any,
              });
              results.updated++;
            } else {
              // Generate unique slug
              let slug = generateSlug(row.data.nameEn || row.data.sku || '');
              let slugExists = await prisma.product.findUnique({ where: { slug } });
              let counter = 1;
              while (slugExists) {
                slug = `${generateSlug(row.data.nameEn || row.data.sku || '')}-${counter}`;
                slugExists = await prisma.product.findUnique({ where: { slug } });
                counter++;
              }

              await prisma.product.create({
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data: { ...productData, slug } as any,
              });
              results.created++;
            }
          } catch (error: any) {
            results.failed++;
            results.errors.push({
              rowNumber: row.rowNumber,
              sku: row.data.sku,
              error: error.message || 'Unknown error',
            });
          }
        })
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        created: results.created,
        updated: results.updated,
        failed: results.failed,
        errors: results.errors.slice(0, 20), // Limit error list
        total: validRows.length,
      },
    });
  } catch (error) {
    console.error('Error importing products:', error);
    return NextResponse.json(
      { error: 'Failed to import products' },
      { status: 500 }
    );
  }
}

/**
 * Prepare product data for database insert/update
 */
function prepareProductData(
  row: ImportRow,
  categoryMap: Map<string, string>
): Record<string, unknown> {
  const data = row.data;
  const productData: Record<string, unknown> = {
    sku: data.sku,
    nameKa: data.nameKa,
    nameEn: data.nameEn,
    price: data.price,
  };

  // Optional fields
  if (data.descKa !== undefined) productData.descKa = data.descKa || null;
  if (data.descEn !== undefined) productData.descEn = data.descEn || null;
  if (data.shortDescKa !== undefined) productData.shortDescKa = data.shortDescKa || null;
  if (data.shortDescEn !== undefined) productData.shortDescEn = data.shortDescEn || null;
  if (data.salePrice !== undefined) productData.salePrice = data.salePrice || null;
  if (data.costPrice !== undefined) productData.costPrice = data.costPrice || null;
  if (data.stock !== undefined) productData.stock = data.stock ?? 0;
  if (data.lowStockThreshold !== undefined) productData.lowStockThreshold = data.lowStockThreshold ?? 10;
  if (data.brand !== undefined) productData.brand = data.brand || null;
  if (data.manufacturer !== undefined) productData.manufacturer = data.manufacturer || null;
  if (data.dosageForm !== undefined) productData.dosageForm = data.dosageForm || null;
  if (data.dosage !== undefined) productData.dosage = data.dosage || null;
  if (data.activeIngredient !== undefined) productData.activeIngredient = data.activeIngredient || null;
  if (data.requiresPrescription !== undefined) productData.requiresPrescription = data.requiresPrescription ?? false;
  if (data.isFeatured !== undefined) productData.isFeatured = data.isFeatured ?? false;
  if (data.isActive !== undefined) productData.isActive = data.isActive ?? true;
  if (data.weight !== undefined) productData.weight = data.weight || null;
  if (data.barcode !== undefined) productData.barcode = data.barcode || null;
  if (data.metaTitleKa !== undefined) productData.metaTitleKa = data.metaTitleKa || null;
  if (data.metaTitleEn !== undefined) productData.metaTitleEn = data.metaTitleEn || null;
  if (data.metaDescKa !== undefined) productData.metaDescKa = data.metaDescKa || null;
  if (data.metaDescEn !== undefined) productData.metaDescEn = data.metaDescEn || null;
  if (data.apexId !== undefined) productData.apexId = data.apexId || null;

  // Handle category by slug
  if (data.categorySlug) {
    const categoryId = categoryMap.get(data.categorySlug);
    if (categoryId) {
      productData.categoryId = categoryId;
    }
  }

  return productData;
}
