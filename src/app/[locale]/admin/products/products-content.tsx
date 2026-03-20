'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

import { useRouter } from 'next/navigation';

import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Upload,
  Download,
  CheckSquare,
  Square,
  MinusSquare,
  Settings2,
  X,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { formatPrice } from '@/lib/utils';

import { BulkOperationsModal } from './bulk-operations-modal';
import { ProductDeleteModal } from './product-delete-modal';
import { ProductFormModal } from './product-form-modal';
import { ProductImportModal } from './product-import-modal';

type Category = {
  id: string;
  nameKa: string;
  nameEn: string;
  slug: string;
  parentId: string | null;
  _count?: { products: number };
};

type Product = {
  id: string;
  sku: string;
  slug: string;
  nameKa: string;
  nameEn: string;
  price: number;
  salePrice: number | null;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  requiresPrescription: boolean;
  category?: {
    id: string;
    nameKa: string;
    nameEn: string;
  } | null;
  images?: {
    id: string;
    url: string;
    alt: string | null;
    sortOrder: number;
    isPrimary: boolean;
  }[];
};

export function ProductsContent() {
  const t = useTranslations('admin.products');
  const tFilters = useTranslations('admin.products.filterPanel');
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [stockStatus, setStockStatus] = useState('');
  const [isActive, setIsActive] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (categoryId) count++;
    if (stockStatus) count++;
    if (isActive !== '') count++;
    return count;
  }, [categoryId, stockStatus, isActive]);

  // Fetch categories for filter dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/categories');
        const data = await response.json();
        if (data.success) {
          setCategories(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        sortBy,
        sortOrder,
        ...(search && { search }),
        ...(categoryId && { categoryId }),
        ...(stockStatus && { stockStatus }),
        ...(isActive !== '' && { isActive }),
      });

      const response = await fetch(`/api/admin/products?${params}`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.data.products);
        setTotalPages(data.data.pagination.totalPages);
        setTotalProducts(data.data.pagination.total);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryId, stockStatus, isActive, sortBy, sortOrder]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, categoryId, stockStatus, isActive, sortBy, sortOrder]);

  // Clear all filters
  const clearFilters = () => {
    setCategoryId('');
    setStockStatus('');
    setIsActive('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setSearch('');
  };

  // Clear selection when page changes
  useEffect(() => {
    setSelectedIds(new Set());
  }, [page]);

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteOpen(true);
  };

  const handleFormClose = (refresh?: boolean) => {
    setIsFormOpen(false);
    setSelectedProduct(null);
    if (refresh) {
      fetchProducts();
    }
  };

  const handleDeleteClose = (refresh?: boolean) => {
    setIsDeleteOpen(false);
    setSelectedProduct(null);
    if (refresh) {
      fetchProducts();
    }
  };

  const handleImportClose = (refresh?: boolean) => {
    setIsImportOpen(false);
    if (refresh) {
      fetchProducts();
    }
  };

  const handleBulkClose = (refresh?: boolean) => {
    setIsBulkOpen(false);
    if (refresh) {
      setSelectedIds(new Set());
      fetchProducts();
    }
  };

  const handleExport = async (format: 'csv' | 'xlsx', includeAll: boolean = false) => {
    try {
      setIsExporting(true);
      setShowExportMenu(false);

      const params = new URLSearchParams({
        format,
        ...(search && { search }),
        ...(includeAll && { includeAll: 'true' }),
      });

      const response = await fetch(`/api/admin/products/export?${params}`);

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get filename from Content-Disposition header or generate one
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `products_export.${format}`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) {
          filename = match[1];
        }
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map((p) => p.id)));
    }
  };

  const toggleSelectProduct = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  // Get selected products for preview in bulk modal
  const selectedProducts = useMemo(() => {
    return products
      .filter((p) => selectedIds.has(p.id))
      .map((p) => ({
        id: p.id,
        nameEn: p.nameEn,
        price: Number(p.price),
      }));
  }, [products, selectedIds]);

  // Check selection state
  const isAllSelected = products.length > 0 && selectedIds.size === products.length;
  const isPartialSelected = selectedIds.size > 0 && selectedIds.size < products.length;
  const hasSelection = selectedIds.size > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="mt-1 text-sm text-gray-600">{t('subtitle')}</p>
        </div>
        <div className="flex gap-2">
          {/* Export Button with Dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isExporting}
            >
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? t('export.exporting') : t('export.title')}
            </Button>
            {showExportMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowExportMenu(false)}
                />
                <div className="absolute right-0 z-20 mt-2 w-56 rounded-md border bg-white shadow-lg">
                  <div className="p-2">
                    <p className="px-2 py-1.5 text-xs font-semibold text-gray-500">
                      {t('export.format')}
                    </p>
                    <button
                      className="flex w-full items-center rounded-md px-2 py-2 text-sm hover:bg-gray-100"
                      onClick={() => handleExport('csv')}
                    >
                      <span className="mr-2">📄</span>
                      {t('export.csvBasic')}
                    </button>
                    <button
                      className="flex w-full items-center rounded-md px-2 py-2 text-sm hover:bg-gray-100"
                      onClick={() => handleExport('csv', true)}
                    >
                      <span className="mr-2">📄</span>
                      {t('export.csvFull')}
                    </button>
                    <button
                      className="flex w-full items-center rounded-md px-2 py-2 text-sm hover:bg-gray-100"
                      onClick={() => handleExport('xlsx')}
                    >
                      <span className="mr-2">📊</span>
                      {t('export.excelBasic')}
                    </button>
                    <button
                      className="flex w-full items-center rounded-md px-2 py-2 text-sm hover:bg-gray-100"
                      onClick={() => handleExport('xlsx', true)}
                    >
                      <span className="mr-2">📊</span>
                      {t('export.excelFull')}
                    </button>
                  </div>
                  <div className="border-t p-2">
                    <p className="px-2 text-xs text-gray-400">
                      {t('export.hint')}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
          <Button variant="outline" onClick={() => setIsImportOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            {t('importProducts')}
          </Button>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t('addProduct')}
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Search Bar and Filter Toggle */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant={showFilters ? 'default' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              {t('filters')}
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilterCount}
                </Badge>
              )}
              {showFilters ? (
                <ChevronUp className="ml-2 h-4 w-4" />
              ) : (
                <ChevronDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {/* Category Filter */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    {tFilters('category')}
                  </label>
                  <Select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    <option value="">{tFilters('allCategories')}</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nameEn}
                      </option>
                    ))}
                  </Select>
                </div>

                {/* Stock Status Filter */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    {tFilters('stockStatus')}
                  </label>
                  <Select
                    value={stockStatus}
                    onChange={(e) => setStockStatus(e.target.value)}
                  >
                    <option value="">{tFilters('allStock')}</option>
                    <option value="in_stock">{tFilters('inStock')}</option>
                    <option value="low_stock">{tFilters('lowStock')}</option>
                    <option value="out_of_stock">{tFilters('outOfStock')}</option>
                  </Select>
                </div>

                {/* Active Status Filter */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    {tFilters('status')}
                  </label>
                  <Select
                    value={isActive}
                    onChange={(e) => setIsActive(e.target.value)}
                  >
                    <option value="">{tFilters('allStatus')}</option>
                    <option value="true">{tFilters('active')}</option>
                    <option value="false">{tFilters('inactive')}</option>
                  </Select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    {tFilters('sortBy')}
                  </label>
                  <Select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [newSortBy, newSortOrder] = e.target.value.split('-');
                      setSortBy(newSortBy);
                      setSortOrder(newSortOrder);
                    }}
                  >
                    <option value="createdAt-desc">{tFilters('newest')}</option>
                    <option value="createdAt-asc">{tFilters('oldest')}</option>
                    <option value="nameEn-asc">{tFilters('nameAZ')}</option>
                    <option value="nameEn-desc">{tFilters('nameZA')}</option>
                    <option value="price-asc">{tFilters('priceLowHigh')}</option>
                    <option value="price-desc">{tFilters('priceHighLow')}</option>
                    <option value="stock-asc">{tFilters('stockLowHigh')}</option>
                    <option value="stock-desc">{tFilters('stockHighLow')}</option>
                  </Select>
                </div>

                {/* Clear Filters Button */}
                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    onClick={clearFilters}
                    disabled={activeFilterCount === 0 && !search}
                    className="w-full"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    {tFilters('clearAll')}
                  </Button>
                </div>
              </div>

              {/* Results count */}
              <div className="mt-4 text-sm text-gray-500">
                {tFilters('showing', { count: totalProducts })}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Bulk Actions Bar */}
      {hasSelection && (
        <Card className="border-primary bg-primary/5 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={clearSelection}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <X className="h-4 w-4" />
              </button>
              <span className="font-medium text-gray-900">
                {t('bulk.selected', { count: selectedIds.size })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsBulkOpen(true)}
              >
                <Settings2 className="mr-2 h-4 w-4" />
                {t('bulk.operations')}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Products Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="w-12 px-4 py-3">
                    <button
                      onClick={toggleSelectAll}
                      className="flex items-center justify-center text-gray-400 hover:text-gray-600"
                      title={isAllSelected ? 'Deselect all' : 'Select all'}
                    >
                      {isAllSelected ? (
                        <CheckSquare className="h-5 w-5 text-primary" />
                      ) : isPartialSelected ? (
                        <MinusSquare className="h-5 w-5 text-primary" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    {t('table.image')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    {t('table.product')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    {t('table.sku')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    {t('table.category')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    {t('table.price')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    {t('table.stock')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    {t('table.status')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    {t('table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <p className="text-gray-500">{t('noProducts')}</p>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const isSelected = selectedIds.has(product.id);
                    return (
                      <tr
                        key={product.id}
                        className={`hover:bg-gray-50 ${
                          isSelected ? 'bg-primary/5' : ''
                        }`}
                      >
                        <td className="w-12 px-4 py-4">
                          <button
                            onClick={() => toggleSelectProduct(product.id)}
                            className="flex items-center justify-center text-gray-400 hover:text-gray-600"
                          >
                            {isSelected ? (
                              <CheckSquare className="h-5 w-5 text-primary" />
                            ) : (
                              <Square className="h-5 w-5" />
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0].url}
                              alt={product.nameEn}
                              className="h-12 w-12 rounded object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-200 text-gray-400">
                              <span className="text-xs">No img</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">
                              {product.nameEn}
                            </span>
                            <span className="text-sm text-gray-500">
                              {product.nameKa}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">
                            {product.sku}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {product.category ? (
                            <span className="text-sm text-gray-600">
                              {product.category.nameEn}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            {product.salePrice ? (
                              <>
                                <span className="text-sm font-medium text-green-600">
                                  {formatPrice(Number(product.salePrice))}
                                </span>
                                <span className="text-xs text-gray-400 line-through">
                                  {formatPrice(Number(product.price))}
                                </span>
                              </>
                            ) : (
                              <span className="text-sm font-medium text-gray-900">
                                {formatPrice(Number(product.price))}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-medium ${
                                product.stock === 0
                                  ? 'text-red-600'
                                  : product.stock <= 10
                                    ? 'text-amber-600'
                                    : 'text-gray-900'
                              }`}
                            >
                              {product.stock}
                            </span>
                            {product.stock === 0 && (
                              <Badge variant="error" className="text-xs">
                                {tFilters('outOfStock')}
                              </Badge>
                            )}
                            {product.stock > 0 && product.stock <= 10 && (
                              <Badge variant="warning" className="text-xs">
                                {tFilters('lowStock')}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {product.isActive ? (
                              <Badge variant="success">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                            {product.isFeatured && (
                              <Badge variant="primary">Featured</Badge>
                            )}
                            {product.requiresPrescription && (
                              <Badge variant="warning">Rx</Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(product)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 0 && (
            <div className="flex items-center justify-between border-t px-6 py-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                >
                  «
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  {tFilters('previous')}
                </Button>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {tFilters('pageOf', { page, totalPages })}
                </span>
                <span className="text-sm text-gray-400">|</span>
                <span className="text-sm text-gray-600">
                  {tFilters('showingRange', {
                    from: (page - 1) * 20 + 1,
                    to: Math.min(page * 20, totalProducts),
                    total: totalProducts,
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  {tFilters('next')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                >
                  »
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Modals */}
      <ProductFormModal
        isOpen={isFormOpen}
        onClose={handleFormClose}
        product={selectedProduct}
      />
      <ProductDeleteModal
        isOpen={isDeleteOpen}
        onClose={handleDeleteClose}
        product={selectedProduct}
      />
      <ProductImportModal
        isOpen={isImportOpen}
        onClose={handleImportClose}
      />
      <BulkOperationsModal
        isOpen={isBulkOpen}
        onClose={handleBulkClose}
        selectedIds={Array.from(selectedIds)}
        selectedProducts={selectedProducts}
      />
    </div>
  );
}
