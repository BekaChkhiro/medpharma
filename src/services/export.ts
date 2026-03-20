import Papa from 'papaparse';
import * as XLSX from 'xlsx';

import { IMPORTABLE_FIELDS, type ImportableField } from './import';

/**
 * Product data structure for export
 */
export type ExportableProduct = {
  id: string;
  sku: string;
  slug: string;
  nameKa: string;
  nameEn: string;
  descKa: string | null;
  descEn: string | null;
  shortDescKa: string | null;
  shortDescEn: string | null;
  price: number | string;
  salePrice: number | string | null;
  costPrice: number | string | null;
  stock: number;
  lowStockThreshold: number;
  brand: string | null;
  manufacturer: string | null;
  dosageForm: string | null;
  dosage: string | null;
  activeIngredient: string | null;
  requiresPrescription: boolean;
  isFeatured: boolean;
  isActive: boolean;
  weight: number | string | null;
  barcode: string | null;
  metaTitleKa: string | null;
  metaTitleEn: string | null;
  metaDescKa: string | null;
  metaDescEn: string | null;
  apexId: string | null;
  category?: {
    slug: string;
    nameKa: string;
    nameEn: string;
  } | null;
  images?: {
    url: string;
    isPrimary: boolean;
  }[];
  createdAt: Date | string;
  updatedAt: Date | string;
};

/**
 * Export format options
 */
export type ExportFormat = 'csv' | 'xlsx';

/**
 * Export options
 */
export type ExportOptions = {
  format: ExportFormat;
  includeImages?: boolean;
  includeMetadata?: boolean;
  fields?: ImportableField[];
};

/**
 * Column headers for export (human-readable)
 */
const EXPORT_HEADERS: Record<ImportableField | 'categoryName' | 'primaryImage', string> = {
  sku: 'SKU',
  nameKa: 'Name (Georgian)',
  nameEn: 'Name (English)',
  descKa: 'Description (Georgian)',
  descEn: 'Description (English)',
  shortDescKa: 'Short Description (Georgian)',
  shortDescEn: 'Short Description (English)',
  price: 'Price',
  salePrice: 'Sale Price',
  costPrice: 'Cost Price',
  stock: 'Stock',
  lowStockThreshold: 'Low Stock Threshold',
  brand: 'Brand',
  manufacturer: 'Manufacturer',
  dosageForm: 'Dosage Form',
  dosage: 'Dosage',
  activeIngredient: 'Active Ingredient',
  requiresPrescription: 'Requires Prescription',
  isFeatured: 'Featured',
  isActive: 'Active',
  weight: 'Weight (kg)',
  barcode: 'Barcode',
  categorySlug: 'Category Slug',
  metaTitleKa: 'Meta Title (Georgian)',
  metaTitleEn: 'Meta Title (English)',
  metaDescKa: 'Meta Description (Georgian)',
  metaDescEn: 'Meta Description (English)',
  apexId: 'APEX ID',
  categoryName: 'Category Name',
  primaryImage: 'Primary Image URL',
};

/**
 * Default fields to export
 */
const DEFAULT_EXPORT_FIELDS: (ImportableField | 'categoryName' | 'primaryImage')[] = [
  'sku',
  'nameKa',
  'nameEn',
  'shortDescKa',
  'shortDescEn',
  'price',
  'salePrice',
  'stock',
  'brand',
  'manufacturer',
  'dosageForm',
  'dosage',
  'categorySlug',
  'isActive',
  'isFeatured',
  'requiresPrescription',
];

/**
 * Full fields to export (all available fields)
 */
const FULL_EXPORT_FIELDS: (ImportableField | 'categoryName' | 'primaryImage')[] = [
  'sku',
  'nameKa',
  'nameEn',
  'shortDescKa',
  'shortDescEn',
  'descKa',
  'descEn',
  'price',
  'salePrice',
  'costPrice',
  'stock',
  'lowStockThreshold',
  'brand',
  'manufacturer',
  'dosageForm',
  'dosage',
  'activeIngredient',
  'requiresPrescription',
  'isFeatured',
  'isActive',
  'weight',
  'barcode',
  'categorySlug',
  'categoryName',
  'metaTitleKa',
  'metaTitleEn',
  'metaDescKa',
  'metaDescEn',
  'apexId',
  'primaryImage',
];

/**
 * Transform a product to a flat export row
 */
function transformProductToRow(
  product: ExportableProduct,
  fields: (ImportableField | 'categoryName' | 'primaryImage')[]
): Record<string, any> {
  const row: Record<string, any> = {};

  for (const field of fields) {
    switch (field) {
      case 'categorySlug':
        row[field] = product.category?.slug || '';
        break;
      case 'categoryName':
        row[field] = product.category?.nameEn || '';
        break;
      case 'primaryImage':
        const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
        row[field] = primaryImage?.url || '';
        break;
      case 'price':
      case 'salePrice':
      case 'costPrice':
      case 'weight':
        // Convert Decimal to number
        const numValue = product[field];
        row[field] = numValue !== null && numValue !== undefined ? Number(numValue) : '';
        break;
      case 'requiresPrescription':
      case 'isFeatured':
      case 'isActive':
        // Convert boolean to string for CSV compatibility
        row[field] = product[field] ? 'TRUE' : 'FALSE';
        break;
      default:
        row[field] = product[field as keyof ExportableProduct] ?? '';
    }
  }

  return row;
}

/**
 * Generate CSV content from products
 */
export function generateCSV(
  products: ExportableProduct[],
  options?: { includeAllFields?: boolean }
): string {
  const fields = options?.includeAllFields ? FULL_EXPORT_FIELDS : DEFAULT_EXPORT_FIELDS;
  const headers = fields.map((field) => EXPORT_HEADERS[field] || field);

  const rows = products.map((product) => {
    const rowData = transformProductToRow(product, fields);
    return fields.map((field) => rowData[field]);
  });

  const csvData = [headers, ...rows];

  return Papa.unparse(csvData, {
    quotes: true,
    quoteChar: '"',
    escapeChar: '"',
    delimiter: ',',
    newline: '\n',
  });
}

/**
 * Generate Excel content from products
 */
export function generateExcel(
  products: ExportableProduct[],
  options?: { includeAllFields?: boolean }
): ArrayBuffer {
  const fields = options?.includeAllFields ? FULL_EXPORT_FIELDS : DEFAULT_EXPORT_FIELDS;
  const headers = fields.map((field) => EXPORT_HEADERS[field] || field);

  const rows = products.map((product) => {
    const rowData = transformProductToRow(product, fields);
    return fields.map((field) => {
      const value = rowData[field];
      // Convert TRUE/FALSE strings back to booleans for Excel
      if (value === 'TRUE') return true;
      if (value === 'FALSE') return false;
      return value;
    });
  });

  const wsData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  const colWidths = fields.map((field) => {
    const headerLength = (EXPORT_HEADERS[field] || field).length;
    // Estimate max content length
    let maxContentLength = headerLength;
    for (const row of rows) {
      const cellIndex = fields.indexOf(field);
      const cellValue = String(row[cellIndex] || '');
      maxContentLength = Math.max(maxContentLength, Math.min(cellValue.length, 50));
    }
    return { wch: Math.max(maxContentLength + 2, 10) };
  });
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Products');

  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
}

/**
 * Generate export filename with timestamp
 */
export function generateExportFilename(format: ExportFormat, prefix: string = 'products'): string {
  const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return `${prefix}_export_${timestamp}.${format}`;
}

/**
 * Get MIME type for export format
 */
export function getExportMimeType(format: ExportFormat): string {
  switch (format) {
    case 'csv':
      return 'text/csv; charset=utf-8';
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    default:
      return 'application/octet-stream';
  }
}
