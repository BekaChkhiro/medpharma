'use client';

import { useState, useCallback, useTransition } from 'react';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';

import { SlidersHorizontal, X } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

import { Button, Badge } from '@/components/ui';
import { type ProductListResult, type SortOption } from '@/services/products';

import { ProductFilters, MobileFilters, type FilterState } from './product-filters';
import { ProductGrid } from './product-grid';
import { ProductPagination } from './product-pagination';
import { ProductSort } from './product-sort';


interface Category {
  id: string;
  slug: string;
  nameKa: string;
  nameEn: string;
  children?: Category[];
  _count?: { products: number };
}

interface ProductsCatalogProps {
  initialData: ProductListResult;
  categories: Category[];
  /** Pre-selected category slug (for category pages) */
  initialCategory?: string;
}

export function ProductsCatalog({
  initialData,
  categories,
  initialCategory,
}: ProductsCatalogProps) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Parse initial state from URL
  const getInitialFilters = (): FilterState => ({
    category: initialCategory || searchParams.get('category') || undefined,
    minPrice: searchParams.get('minPrice')
      ? parseFloat(searchParams.get('minPrice')!)
      : undefined,
    maxPrice: searchParams.get('maxPrice')
      ? parseFloat(searchParams.get('maxPrice')!)
      : undefined,
    brands: searchParams.get('brands')?.split(',').filter(Boolean) || undefined,
    manufacturers: searchParams.get('manufacturers')?.split(',').filter(Boolean) || undefined,
    dosageForms: (searchParams.get('dosageForms')?.split(',').filter(Boolean) as FilterState['dosageForms']) || undefined,
    inStockOnly: searchParams.get('inStock') === 'true',
    requiresPrescription: searchParams.get('prescription') === 'true'
      ? true
      : searchParams.get('prescription') === 'false'
      ? false
      : undefined,
  });

  const [data, setData] = useState<ProductListResult>(initialData);
  const [filters, setFilters] = useState<FilterState>(getInitialFilters);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [sort, setSort] = useState<SortOption>(
    (searchParams.get('sort') as SortOption) || 'popularity'
  );
  const [page, setPage] = useState(
    parseInt(searchParams.get('page') || '1', 10)
  );
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Count active filters
  const activeFilterCount =
    (filters.category ? 1 : 0) +
    (filters.minPrice || filters.maxPrice ? 1 : 0) +
    (filters.brands?.length || 0) +
    (filters.manufacturers?.length || 0) +
    (filters.dosageForms?.length || 0) +
    (filters.inStockOnly ? 1 : 0) +
    (filters.requiresPrescription !== undefined ? 1 : 0);

  // Build URL params from state
  const buildUrlParams = useCallback(
    (
      overrides: {
        filters?: FilterState;
        search?: string;
        sort?: SortOption;
        page?: number;
      } = {}
    ) => {
      const params = new URLSearchParams();

      const f = overrides.filters ?? filters;
      const s = overrides.search ?? search;
      const so = overrides.sort ?? sort;
      const p = overrides.page ?? page;

      if (s) params.set('q', s);
      // Don't add category to URL if it's the initialCategory (it's already in the route)
      if (f.category && f.category !== initialCategory) params.set('category', f.category);
      if (f.minPrice) params.set('minPrice', f.minPrice.toString());
      if (f.maxPrice) params.set('maxPrice', f.maxPrice.toString());
      if (f.brands?.length) params.set('brands', f.brands.join(','));
      if (f.manufacturers?.length) params.set('manufacturers', f.manufacturers.join(','));
      if (f.dosageForms?.length) params.set('dosageForms', f.dosageForms.join(','));
      if (f.inStockOnly) params.set('inStock', 'true');
      if (f.requiresPrescription !== undefined) params.set('prescription', f.requiresPrescription.toString());
      if (so !== 'popularity') params.set('sort', so);
      if (p > 1) params.set('page', p.toString());

      return params.toString();
    },
    [filters, search, sort, page, initialCategory]
  );

  // Fetch products with new params
  const fetchProducts = useCallback(
    async (params: URLSearchParams) => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/products?${params.toString()}&locale=${locale}`
        );
        if (!response.ok) throw new Error('Failed to fetch products');
        const result = await response.json();
        setData(result.data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    },
    [locale]
  );

  // Update URL and fetch data
  const updateState = useCallback(
    (
      newState: {
        filters?: FilterState;
        search?: string;
        sort?: SortOption;
        page?: number;
      },
      resetPage = true
    ) => {
      const pageToUse = resetPage ? 1 : newState.page ?? page;

      if (newState.filters !== undefined) setFilters(newState.filters);
      if (newState.search !== undefined) setSearch(newState.search);
      if (newState.sort !== undefined) setSort(newState.sort);
      setPage(pageToUse);

      const urlParams = buildUrlParams({
        ...newState,
        page: pageToUse,
      });

      startTransition(() => {
        router.replace(`${pathname}?${urlParams}`, { scroll: false });
      });

      // Build API params
      const apiParams = new URLSearchParams();
      const f = newState.filters ?? filters;
      const s = newState.search ?? search;
      const so = newState.sort ?? sort;

      if (s) apiParams.set('search', s);
      // Always use initialCategory for API calls if provided, otherwise use filter category
      const categoryForApi = initialCategory || f.category;
      if (categoryForApi) apiParams.set('category', categoryForApi);
      if (f.minPrice) apiParams.set('minPrice', f.minPrice.toString());
      if (f.maxPrice) apiParams.set('maxPrice', f.maxPrice.toString());
      if (f.brands?.length) apiParams.set('brands', f.brands.join(','));
      if (f.manufacturers?.length) apiParams.set('manufacturers', f.manufacturers.join(','));
      if (f.dosageForms?.length) apiParams.set('dosageForms', f.dosageForms.join(','));
      if (f.inStockOnly) apiParams.set('stockStatus', 'in_stock');
      if (f.requiresPrescription !== undefined) apiParams.set('requiresPrescription', f.requiresPrescription.toString());
      apiParams.set('sort', so);
      apiParams.set('page', pageToUse.toString());

      fetchProducts(apiParams);
    },
    [buildUrlParams, fetchProducts, filters, initialCategory, page, pathname, router, search, sort]
  );

  const handleFilterChange = (newFilters: FilterState) => {
    updateState({ filters: newFilters });
  };

  const handleClearFilters = () => {
    updateState({
      filters: {},
    });
  };

  const handleSearchChange = (value: string) => {
    updateState({ search: value });
  };

  const handleSortChange = (value: SortOption) => {
    updateState({ sort: value }, false);
  };

  const handlePageChange = (newPage: number) => {
    updateState({ page: newPage }, false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Active filter chips
  const renderActiveFilters = () => {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];

    if (search) {
      chips.push({
        key: 'search',
        label: `"${search}"`,
        onRemove: () => updateState({ search: '' }),
      });
    }

    if (filters.category) {
      const cat = findCategory(categories, filters.category);
      if (cat) {
        chips.push({
          key: 'category',
          label: locale === 'ka' ? cat.nameKa : cat.nameEn,
          onRemove: () =>
            updateState({ filters: { ...filters, category: undefined } }),
        });
      }
    }

    if (filters.minPrice || filters.maxPrice) {
      chips.push({
        key: 'price',
        label: `${filters.minPrice || 0} - ${filters.maxPrice || '∞'} ₾`,
        onRemove: () =>
          updateState({
            filters: { ...filters, minPrice: undefined, maxPrice: undefined },
          }),
      });
    }

    filters.brands?.forEach((brand) => {
      chips.push({
        key: `brand-${brand}`,
        label: brand,
        onRemove: () =>
          updateState({
            filters: {
              ...filters,
              brands: filters.brands?.filter((b) => b !== brand),
            },
          }),
      });
    });

    filters.manufacturers?.forEach((manufacturer) => {
      chips.push({
        key: `manufacturer-${manufacturer}`,
        label: manufacturer,
        onRemove: () =>
          updateState({
            filters: {
              ...filters,
              manufacturers: filters.manufacturers?.filter((m) => m !== manufacturer),
            },
          }),
      });
    });

    filters.dosageForms?.forEach((form) => {
      chips.push({
        key: `form-${form}`,
        label: t(`dosageForms.${form.toLowerCase()}`),
        onRemove: () =>
          updateState({
            filters: {
              ...filters,
              dosageForms: filters.dosageForms?.filter((f) => f !== form),
            },
          }),
      });
    });

    if (filters.inStockOnly) {
      chips.push({
        key: 'stock',
        label: t('products.filters.inStockOnly'),
        onRemove: () =>
          updateState({ filters: { ...filters, inStockOnly: false } }),
      });
    }

    if (filters.requiresPrescription !== undefined) {
      chips.push({
        key: 'prescription',
        label: filters.requiresPrescription
          ? t('products.filters.prescriptionOnly')
          : t('products.filters.otcOnly'),
        onRemove: () =>
          updateState({ filters: { ...filters, requiresPrescription: undefined } }),
      });
    }

    if (chips.length === 0) return null;

    return (
      <div className="flex flex-wrap items-center gap-2">
        {chips.map((chip) => (
          <Badge
            key={chip.key}
            variant="secondary"
            className="flex items-center gap-1 pl-2 pr-1"
          >
            {chip.label}
            <button
              type="button"
              onClick={chip.onRemove}
              className="ml-1 rounded-full p-0.5 hover:bg-gray-300"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {chips.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-auto p-1 text-xs text-gray-500"
          >
            {t('products.filters.clearAll')}
          </Button>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Filters Drawer */}
      <MobileFilters
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        categories={categories}
        availableBrands={data.filters.availableBrands}
        availableManufacturers={data.filters.availableManufacturers}
        priceRange={data.filters.priceRange}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        activeFilterCount={activeFilterCount}
      />

      <div className="flex gap-6">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-4">
            <ProductFilters
              categories={categories}
              availableBrands={data.filters.availableBrands}
              availableManufacturers={data.filters.availableManufacturers}
              priceRange={data.filters.priceRange}
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              activeFilterCount={activeFilterCount}
            />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Controls */}
          <div className="mb-6 space-y-4">
            {/* Controls Row */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Mobile Filter Button */}
                <Button
                  variant="outline"
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden"
                >
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  {t('products.filters.title')}
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>

                {/* Results Count */}
                <p className="text-sm text-gray-500">
                  {t('products.resultsCount', { count: data.pagination.total })}
                </p>
              </div>

              {/* Sort */}
              <ProductSort value={sort} onChange={handleSortChange} />
            </div>

            {/* Active Filters */}
            {renderActiveFilters()}
          </div>

          {/* Products Grid */}
          <ProductGrid products={data.products} loading={loading || isPending} />

          {/* Pagination */}
          <div className="mt-8">
            <ProductPagination
              page={data.pagination.page}
              totalPages={data.pagination.totalPages}
              total={data.pagination.total}
              limit={data.pagination.limit}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </>
  );
}

// Helper to find category by slug in tree
function findCategory(
  categories: Category[],
  slug: string
): Category | undefined {
  for (const cat of categories) {
    if (cat.slug === slug) return cat;
    if (cat.children) {
      const found = findCategory(cat.children, slug);
      if (found) return found;
    }
  }
  return undefined;
}
