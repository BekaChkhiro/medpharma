import Papa from 'papaparse';
import * as XLSX from 'xlsx';

// Product fields that can be imported
export const IMPORTABLE_FIELDS = [
  'sku',
  'nameKa',
  'nameEn',
  'descKa',
  'descEn',
  'shortDescKa',
  'shortDescEn',
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
  'metaTitleKa',
  'metaTitleEn',
  'metaDescKa',
  'metaDescEn',
  'apexId',
] as const;

export type ImportableField = (typeof IMPORTABLE_FIELDS)[number];

// Required fields for import
export const REQUIRED_FIELDS: ImportableField[] = ['sku', 'nameKa', 'nameEn', 'price'];

// Field type definitions for validation
export const FIELD_TYPES: Record<ImportableField, 'string' | 'number' | 'boolean'> = {
  sku: 'string',
  nameKa: 'string',
  nameEn: 'string',
  descKa: 'string',
  descEn: 'string',
  shortDescKa: 'string',
  shortDescEn: 'string',
  price: 'number',
  salePrice: 'number',
  costPrice: 'number',
  stock: 'number',
  lowStockThreshold: 'number',
  brand: 'string',
  manufacturer: 'string',
  dosageForm: 'string',
  dosage: 'string',
  activeIngredient: 'string',
  requiresPrescription: 'boolean',
  isFeatured: 'boolean',
  isActive: 'boolean',
  weight: 'number',
  barcode: 'string',
  categorySlug: 'string',
  metaTitleKa: 'string',
  metaTitleEn: 'string',
  metaDescKa: 'string',
  metaDescEn: 'string',
  apexId: 'string',
};

// Valid dosage forms
export const VALID_DOSAGE_FORMS = [
  'TABLET',
  'CAPSULE',
  'SYRUP',
  'INJECTION',
  'CREAM',
  'OINTMENT',
  'GEL',
  'DROPS',
  'SPRAY',
  'POWDER',
  'SUPPOSITORY',
  'PATCH',
  'SOLUTION',
  'SUSPENSION',
  'OTHER',
];

export type ColumnMapping = {
  [csvColumn: string]: ImportableField | null;
};

export type ParsedRow = {
  rowNumber: number;
  data: Record<string, any>;
  errors: string[];
  warnings: string[];
};

export type ParseResult = {
  headers: string[];
  rows: ParsedRow[];
  totalRows: number;
  suggestedMapping: ColumnMapping;
};

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
};

export type ImportRow = {
  rowNumber: number;
  data: Partial<Record<ImportableField, any>>;
  errors: string[];
  warnings: string[];
  action: 'create' | 'update' | 'skip';
  existingProductId?: string;
};

/**
 * Parse a CSV file and return structured data
 */
export function parseCSV(content: string): ParseResult {
  const result = Papa.parse(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  const headers = result.meta.fields || [];
  const suggestedMapping = suggestColumnMapping(headers);

  const rows: ParsedRow[] = result.data.map((row: any, index: number) => ({
    rowNumber: index + 2, // +2 for header row and 1-based indexing
    data: row,
    errors: [],
    warnings: [],
  }));

  return {
    headers,
    rows,
    totalRows: rows.length,
    suggestedMapping,
  };
}

/**
 * Parse an Excel file and return structured data
 */
export function parseExcel(buffer: ArrayBuffer): ParseResult {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];

  if (jsonData.length === 0) {
    return {
      headers: [],
      rows: [],
      totalRows: 0,
      suggestedMapping: {},
    };
  }

  const headers = (jsonData[0] || []).map((h: any) => String(h || '').trim());
  const suggestedMapping = suggestColumnMapping(headers);

  const rows: ParsedRow[] = jsonData.slice(1).map((row, index) => {
    const data: Record<string, any> = {};
    headers.forEach((header, colIndex) => {
      data[header] = row[colIndex] !== undefined ? row[colIndex] : '';
    });
    return {
      rowNumber: index + 2,
      data,
      errors: [],
      warnings: [],
    };
  });

  return {
    headers,
    rows,
    totalRows: rows.length,
    suggestedMapping,
  };
}

/**
 * Suggest column mapping based on header names
 */
export function suggestColumnMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};

  // Common variations for field names
  const fieldVariations: Record<ImportableField, string[]> = {
    sku: ['sku', 'product_sku', 'productsku', 'code', 'product_code', 'item_code', 'article'],
    nameKa: ['nameka', 'name_ka', 'georgian_name', 'name_georgian', 'სახელი'],
    nameEn: ['nameen', 'name_en', 'english_name', 'name_english', 'name', 'product_name', 'title'],
    descKa: ['descka', 'desc_ka', 'description_ka', 'georgian_description', 'აღწერა'],
    descEn: ['descen', 'desc_en', 'description_en', 'english_description', 'description'],
    shortDescKa: ['shortdescka', 'short_desc_ka', 'short_description_ka'],
    shortDescEn: ['shortdescen', 'short_desc_en', 'short_description_en', 'short_description'],
    price: ['price', 'regular_price', 'base_price', 'ფასი'],
    salePrice: ['saleprice', 'sale_price', 'discount_price', 'special_price'],
    costPrice: ['costprice', 'cost_price', 'cost', 'purchase_price'],
    stock: ['stock', 'quantity', 'qty', 'inventory', 'რაოდენობა'],
    lowStockThreshold: ['lowstockthreshold', 'low_stock_threshold', 'reorder_level'],
    brand: ['brand', 'brand_name', 'ბრენდი'],
    manufacturer: ['manufacturer', 'vendor', 'supplier', 'მწარმოებელი'],
    dosageForm: ['dosageform', 'dosage_form', 'form', 'type'],
    dosage: ['dosage', 'strength', 'dose'],
    activeIngredient: ['activeingredient', 'active_ingredient', 'ingredient', 'composition'],
    requiresPrescription: ['requiresprescription', 'requires_prescription', 'prescription', 'rx'],
    isFeatured: ['isfeatured', 'is_featured', 'featured'],
    isActive: ['isactive', 'is_active', 'active', 'status', 'enabled'],
    weight: ['weight', 'product_weight', 'წონა'],
    barcode: ['barcode', 'ean', 'upc', 'gtin'],
    categorySlug: ['categoryslug', 'category_slug', 'category', 'category_name', 'კატეგორია'],
    metaTitleKa: ['metatitleka', 'meta_title_ka', 'seo_title_ka'],
    metaTitleEn: ['metatitleen', 'meta_title_en', 'seo_title_en', 'meta_title', 'seo_title'],
    metaDescKa: ['metadescka', 'meta_desc_ka', 'meta_description_ka', 'seo_description_ka'],
    metaDescEn: ['metadescen', 'meta_desc_en', 'meta_description_en', 'seo_description_en', 'meta_description'],
    apexId: ['apexid', 'apex_id', 'erp_id', 'external_id'],
  };

  headers.forEach((header) => {
    const normalizedHeader = header.toLowerCase().replace(/[\s\-_]/g, '');

    for (const [field, variations] of Object.entries(fieldVariations)) {
      const normalizedVariations = variations.map((v) => v.toLowerCase().replace(/[\s\-_]/g, ''));
      if (normalizedVariations.includes(normalizedHeader)) {
        mapping[header] = field as ImportableField;
        break;
      }
    }

    // If not matched, set to null
    if (!(header in mapping)) {
      mapping[header] = null;
    }
  });

  return mapping;
}

/**
 * Transform parsed data using column mapping
 */
export function transformData(
  rows: ParsedRow[],
  mapping: ColumnMapping
): ImportRow[] {
  return rows.map((row) => {
    const transformedData: Partial<Record<ImportableField, any>> = {};
    const errors: string[] = [];
    const warnings: string[] = [];

    // Apply mapping
    for (const [csvColumn, field] of Object.entries(mapping)) {
      if (field && row.data[csvColumn] !== undefined) {
        const rawValue = row.data[csvColumn];
        const { value, error } = convertValue(rawValue, field);

        if (error) {
          errors.push(`${field}: ${error}`);
        } else if (value !== null && value !== undefined && value !== '') {
          transformedData[field] = value;
        }
      }
    }

    // Check required fields
    for (const requiredField of REQUIRED_FIELDS) {
      if (!transformedData[requiredField]) {
        errors.push(`Missing required field: ${requiredField}`);
      }
    }

    // Validate dosage form if provided
    if (transformedData.dosageForm) {
      const upperDosageForm = String(transformedData.dosageForm).toUpperCase();
      if (VALID_DOSAGE_FORMS.includes(upperDosageForm)) {
        transformedData.dosageForm = upperDosageForm;
      } else {
        warnings.push(`Invalid dosage form "${transformedData.dosageForm}", will be ignored`);
        delete transformedData.dosageForm;
      }
    }

    return {
      rowNumber: row.rowNumber,
      data: transformedData,
      errors,
      warnings,
      action: 'create', // Will be determined during conflict check
    };
  });
}

/**
 * Convert a raw value to the expected type
 */
function convertValue(
  rawValue: any,
  field: ImportableField
): { value: any; error?: string } {
  const expectedType = FIELD_TYPES[field];

  if (rawValue === null || rawValue === undefined || rawValue === '') {
    return { value: null };
  }

  const stringValue = String(rawValue).trim();

  switch (expectedType) {
    case 'number': {
      // Remove currency symbols, spaces, and Georgian characters
      const cleanValue = stringValue.replace(/[₾$€£\s,]/g, '').replace(',', '.');
      const numValue = parseFloat(cleanValue);
      if (isNaN(numValue)) {
        return { value: null, error: `"${rawValue}" is not a valid number` };
      }
      return { value: numValue };
    }

    case 'boolean': {
      const lowerValue = stringValue.toLowerCase();
      if (['true', '1', 'yes', 'კი', 'დიახ'].includes(lowerValue)) {
        return { value: true };
      }
      if (['false', '0', 'no', 'არა'].includes(lowerValue)) {
        return { value: false };
      }
      return { value: null, error: `"${rawValue}" is not a valid boolean` };
    }

    case 'string':
    default:
      return { value: stringValue };
  }
}

/**
 * Validate all import rows
 */
export function validateImportData(rows: ImportRow[]): {
  validRows: ImportRow[];
  invalidRows: ImportRow[];
  stats: {
    total: number;
    valid: number;
    invalid: number;
    warnings: number;
  };
} {
  const validRows: ImportRow[] = [];
  const invalidRows: ImportRow[] = [];
  let warningsCount = 0;

  for (const row of rows) {
    if (row.errors.length > 0) {
      invalidRows.push(row);
    } else {
      validRows.push(row);
    }
    if (row.warnings.length > 0) {
      warningsCount++;
    }
  }

  return {
    validRows,
    invalidRows,
    stats: {
      total: rows.length,
      valid: validRows.length,
      invalid: invalidRows.length,
      warnings: warningsCount,
    },
  };
}

/**
 * Check for SKU conflicts and determine create/update action
 */
export async function checkConflicts(
  rows: ImportRow[],
  existingProducts: Map<string, { id: string; sku: string }>
): Promise<ImportRow[]> {
  return rows.map((row) => {
    const sku = row.data.sku;
    if (sku && existingProducts.has(sku)) {
      return {
        ...row,
        action: 'update' as const,
        existingProductId: existingProducts.get(sku)!.id,
      };
    }
    return {
      ...row,
      action: 'create' as const,
    };
  });
}

/**
 * Generate sample CSV template
 */
export function generateSampleCSV(): string {
  const headers = [
    'sku',
    'nameKa',
    'nameEn',
    'price',
    'stock',
    'brand',
    'manufacturer',
    'categorySlug',
    'isActive',
  ];

  const sampleRow = [
    'PROD-001',
    'პროდუქტის სახელი',
    'Product Name',
    '19.99',
    '100',
    'Brand Name',
    'Manufacturer Name',
    'category-slug',
    'true',
  ];

  return [headers.join(','), sampleRow.join(',')].join('\n');
}

/**
 * Generate sample Excel template
 */
export function generateSampleExcel(): ArrayBuffer {
  const headers = [
    'sku',
    'nameKa',
    'nameEn',
    'price',
    'stock',
    'brand',
    'manufacturer',
    'categorySlug',
    'isActive',
  ];

  const sampleRow = [
    'PROD-001',
    'პროდუქტის სახელი',
    'Product Name',
    19.99,
    100,
    'Brand Name',
    'Manufacturer Name',
    'category-slug',
    'TRUE',
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Products');

  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
}
