'use client';

import { useState, useEffect, useMemo } from 'react';

import { X, ChevronDown, ChevronRight, Search, Check, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

import { Button, Badge } from '@/components/ui';
import { type DosageForm } from '@/generated/prisma';
import { cn, formatPrice } from '@/lib/utils';

// Map short locale to full locale for formatting
const localeMap = {
  ka: 'ka-GE',
  en: 'en-US',
} as const;

interface Category {
  id: string;
  slug: string;
  nameKa: string;
  nameEn: string;
  children?: Category[];
  _count?: { products: number };
}

export interface FilterState {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  brands?: string[];
  manufacturers?: string[];
  dosageForms?: DosageForm[];
  inStockOnly?: boolean;
  requiresPrescription?: boolean;
}

interface ProductFiltersProps {
  categories: Category[];
  availableBrands: string[];
  availableManufacturers: string[];
  priceRange: { min: number; max: number };
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

export function ProductFilters({
  categories,
  availableBrands,
  availableManufacturers,
  priceRange,
  filters,
  onFilterChange,
  onClearFilters,
  activeFilterCount,
}: ProductFiltersProps) {
  const t = useTranslations();
  const locale = useLocale() as 'ka' | 'en';
  const formatLocale = localeMap[locale];

  const [expandedSections, setExpandedSections] = useState<string[]>([
    'price',
    'category',
    'brand',
  ]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [brandSearch, setBrandSearch] = useState('');
  const [manufacturerSearch, setManufacturerSearch] = useState('');

  // Local price state for the range inputs
  const [localMinPrice, setLocalMinPrice] = useState<string>(
    filters.minPrice?.toString() || ''
  );
  const [localMaxPrice, setLocalMaxPrice] = useState<string>(
    filters.maxPrice?.toString() || ''
  );

  // Sync local state with external filter changes
  useEffect(() => {
    const newValue = filters.minPrice?.toString() || '';
    if (newValue !== localMinPrice) {
      setLocalMinPrice(newValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.minPrice]);

  useEffect(() => {
    const newValue = filters.maxPrice?.toString() || '';
    if (newValue !== localMaxPrice) {
      setLocalMaxPrice(newValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.maxPrice]);

  // Filter brands by search
  const filteredBrands = useMemo(() => {
    if (!brandSearch) return availableBrands;
    return availableBrands.filter((brand) =>
      brand.toLowerCase().includes(brandSearch.toLowerCase())
    );
  }, [availableBrands, brandSearch]);

  // Filter manufacturers by search
  const filteredManufacturers = useMemo(() => {
    if (!manufacturerSearch) return availableManufacturers;
    return availableManufacturers.filter((manufacturer) =>
      manufacturer.toLowerCase().includes(manufacturerSearch.toLowerCase())
    );
  }, [availableManufacturers, manufacturerSearch]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((c) => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleCategoryChange = (categorySlug: string) => {
    onFilterChange({
      ...filters,
      category: filters.category === categorySlug ? undefined : categorySlug,
    });
  };

  const handleBrandToggle = (brand: string) => {
    const currentBrands = filters.brands || [];
    const newBrands = currentBrands.includes(brand)
      ? currentBrands.filter((b) => b !== brand)
      : [...currentBrands, brand];
    onFilterChange({
      ...filters,
      brands: newBrands.length > 0 ? newBrands : undefined,
    });
  };

  const handleDosageFormToggle = (form: DosageForm) => {
    const currentForms = filters.dosageForms || [];
    const newForms = currentForms.includes(form)
      ? currentForms.filter((f) => f !== form)
      : [...currentForms, form];
    onFilterChange({
      ...filters,
      dosageForms: newForms.length > 0 ? newForms : undefined,
    });
  };

  const handlePriceApply = () => {
    const min = localMinPrice ? parseFloat(localMinPrice) : undefined;
    const max = localMaxPrice ? parseFloat(localMaxPrice) : undefined;
    onFilterChange({
      ...filters,
      minPrice: min,
      maxPrice: max,
    });
  };

  const handleManufacturerToggle = (manufacturer: string) => {
    const currentManufacturers = filters.manufacturers || [];
    const newManufacturers = currentManufacturers.includes(manufacturer)
      ? currentManufacturers.filter((m) => m !== manufacturer)
      : [...currentManufacturers, manufacturer];
    onFilterChange({
      ...filters,
      manufacturers: newManufacturers.length > 0 ? newManufacturers : undefined,
    });
  };

  const handleStockToggle = (checked: boolean) => {
    onFilterChange({
      ...filters,
      inStockOnly: checked,
    });
  };

  const renderCategoryTree = (cats: Category[], level = 0) => {
    return cats.map((cat) => {
      const name = locale === 'ka' ? cat.nameKa : cat.nameEn;
      const hasChildren = cat.children && cat.children.length > 0;
      const isExpanded = expandedCategories.includes(cat.id);
      const isSelected = filters.category === cat.slug;

      return (
        <div key={cat.id} className={cn(level > 0 && 'ml-3 border-l border-gray-100 pl-3')}>
          <div className="flex items-center gap-1.5 py-1">
            {hasChildren && (
              <button
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className="flex h-5 w-5 items-center justify-center rounded text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <ChevronRight
                  className={cn(
                    'h-3.5 w-3.5 transition-transform duration-200',
                    isExpanded && 'rotate-90'
                  )}
                />
              </button>
            )}
            <button
              type="button"
              onClick={() => handleCategoryChange(cat.slug)}
              className={cn(
                'group flex flex-1 items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-all',
                isSelected
                  ? 'bg-slate-100 font-medium text-slate-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                !hasChildren && 'ml-6'
              )}
            >
              <span className="flex items-center gap-2">
                {isSelected && <Check className="h-3.5 w-3.5" />}
                {name}
              </span>
              {cat._count?.products !== undefined && (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-xs',
                    isSelected
                      ? 'bg-slate-200 text-slate-700'
                      : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                  )}
                >
                  {cat._count.products}
                </span>
              )}
            </button>
          </div>
          {hasChildren && (
            <div
              className={cn(
                'overflow-hidden transition-all duration-200',
                isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              )}
            >
              {renderCategoryTree(cat.children!, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const dosageForms: DosageForm[] = [
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
  ];

  return (
    <div className="relative flex flex-col">
      {/* Scrollable Content */}
      <div className="space-y-1 pb-16">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">
            {t('products.filters.title')}
            {activeFilterCount > 0 && (
              <Badge variant="default" className="ml-2 bg-slate-800">
                {activeFilterCount}
              </Badge>
            )}
          </h3>
        </div>

        {/* Price Range - FIRST */}
        <FilterSection
          title={t('products.filters.priceRange')}
          expanded={expandedSections.includes('price')}
          onToggle={() => toggleSection('price')}
          count={filters.minPrice || filters.maxPrice ? 1 : 0}
        >
          <div className="space-y-4">
            {/* Price Range Info */}
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
              <span className="text-xs text-gray-500">{t('products.filters.minPrice')}</span>
              <span className="text-sm font-medium text-gray-700">
                {formatPrice(priceRange.min, { locale: formatLocale })}
              </span>
              <span className="text-gray-300">—</span>
              <span className="text-sm font-medium text-gray-700">
                {formatPrice(priceRange.max, { locale: formatLocale })}
              </span>
              <span className="text-xs text-gray-500">{t('products.filters.maxPrice')}</span>
            </div>

            {/* Input Fields */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="number"
                  placeholder="0"
                  value={localMinPrice}
                  onChange={(e) => setLocalMinPrice(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePriceApply()}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 pr-8 text-sm transition-colors focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300/30"
                  min={0}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                  ₾
                </span>
              </div>
              <div className="h-px w-3 bg-gray-300" />
              <div className="relative flex-1">
                <input
                  type="number"
                  placeholder="∞"
                  value={localMaxPrice}
                  onChange={(e) => setLocalMaxPrice(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePriceApply()}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 pr-8 text-sm transition-colors focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300/30"
                  min={0}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                  ₾
                </span>
              </div>
            </div>
          </div>
        </FilterSection>

        {/* Categories */}
        <FilterSection
          title={t('products.filters.category')}
          expanded={expandedSections.includes('category')}
          onToggle={() => toggleSection('category')}
          count={filters.category ? 1 : 0}
        >
          <div className="space-y-0.5">{renderCategoryTree(categories)}</div>
        </FilterSection>

        {/* Brands */}
      {availableBrands.length > 0 && (
        <FilterSection
          title={t('products.filters.brand')}
          expanded={expandedSections.includes('brand')}
          onToggle={() => toggleSection('brand')}
          count={filters.brands?.length || 0}
        >
          <div className="space-y-3">
            {/* Search */}
            {availableBrands.length > 5 && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('products.filters.searchBrand')}
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm transition-colors focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-300/30"
                />
              </div>
            )}

            {/* Brand List */}
            <div className="max-h-48 space-y-1 overflow-y-auto pr-1">
              {filteredBrands.slice(0, 20).map((brand) => {
                const isSelected = filters.brands?.includes(brand) || false;
                return (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => handleBrandToggle(brand)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-all',
                      isSelected
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-4 w-4 items-center justify-center rounded border transition-all',
                        isSelected
                          ? 'border-slate-800 bg-slate-800 text-white'
                          : 'border-gray-300 bg-white'
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    <span className="flex-1 truncate">{brand}</span>
                  </button>
                );
              })}
              {filteredBrands.length === 0 && (
                <p className="py-2 text-center text-sm text-gray-400">
                  {t('products.filters.noResults')}
                </p>
              )}
            </div>
          </div>
        </FilterSection>
      )}

      {/* Manufacturers */}
      {availableManufacturers.length > 0 && (
        <FilterSection
          title={t('products.filters.manufacturer')}
          expanded={expandedSections.includes('manufacturer')}
          onToggle={() => toggleSection('manufacturer')}
          count={filters.manufacturers?.length || 0}
        >
          <div className="space-y-3">
            {/* Search */}
            {availableManufacturers.length > 5 && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('products.filters.searchManufacturer')}
                  value={manufacturerSearch}
                  onChange={(e) => setManufacturerSearch(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm transition-colors focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-300/30"
                />
              </div>
            )}

            {/* Manufacturer List */}
            <div className="max-h-48 space-y-1 overflow-y-auto pr-1">
              {filteredManufacturers.slice(0, 20).map((manufacturer) => {
                const isSelected = filters.manufacturers?.includes(manufacturer) || false;
                return (
                  <button
                    key={manufacturer}
                    type="button"
                    onClick={() => handleManufacturerToggle(manufacturer)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-all',
                      isSelected
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-4 w-4 items-center justify-center rounded border transition-all',
                        isSelected
                          ? 'border-slate-800 bg-slate-800 text-white'
                          : 'border-gray-300 bg-white'
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    <span className="flex-1 truncate">{manufacturer}</span>
                  </button>
                );
              })}
              {filteredManufacturers.length === 0 && (
                <p className="py-2 text-center text-sm text-gray-400">
                  {t('products.filters.noResults')}
                </p>
              )}
            </div>
          </div>
        </FilterSection>
        )}

        {/* Dosage Form */}
        <FilterSection
          title={t('products.filters.dosageForm')}
          expanded={expandedSections.includes('dosageForm')}
          onToggle={() => toggleSection('dosageForm')}
          count={filters.dosageForms?.length || 0}
        >
          <div className="flex flex-wrap gap-1.5">
            {dosageForms.map((form) => {
              const isSelected = filters.dosageForms?.includes(form);
              return (
                <button
                  key={form}
                  type="button"
                  onClick={() => handleDosageFormToggle(form)}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                    isSelected
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {t(`dosageForms.${form.toLowerCase()}`)}
                </button>
              );
            })}
          </div>
        </FilterSection>

        {/* Availability */}
        <FilterSection
          title={t('products.filters.availability')}
          expanded={expandedSections.includes('availability')}
          onToggle={() => toggleSection('availability')}
          count={filters.inStockOnly ? 1 : 0}
        >
          <button
            type="button"
            onClick={() => handleStockToggle(!filters.inStockOnly)}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 transition-all',
              filters.inStockOnly
                ? 'border-green-200 bg-green-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            )}
          >
            <div
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-full transition-all',
                filters.inStockOnly
                  ? 'bg-green-500 text-white'
                  : 'border-2 border-gray-300'
              )}
            >
              {filters.inStockOnly && <Check className="h-3 w-3" />}
            </div>
            <div className="flex-1 text-left">
              <p
                className={cn(
                  'text-sm font-medium',
                  filters.inStockOnly ? 'text-green-700' : 'text-gray-700'
                )}
              >
                {t('products.filters.inStockOnly')}
              </p>
              <p className="text-xs text-gray-500">
                {t('products.filters.inStockDescription')}
              </p>
            </div>
          </button>
        </FilterSection>

        {/* Prescription */}
        <FilterSection
          title={t('products.filters.prescription')}
          expanded={expandedSections.includes('prescription')}
          onToggle={() => toggleSection('prescription')}
          count={filters.requiresPrescription !== undefined ? 1 : 0}
        >
          <div className="space-y-2">
            <button
              type="button"
              onClick={() =>
                onFilterChange({
                  ...filters,
                  requiresPrescription:
                    filters.requiresPrescription === false ? undefined : false,
                })
              }
              className={cn(
                'flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 transition-all',
                filters.requiresPrescription === false
                  ? 'border-slate-200 bg-slate-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              )}
            >
              <div
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full transition-all',
                  filters.requiresPrescription === false
                    ? 'bg-slate-700 text-white'
                    : 'border-2 border-gray-300'
                )}
              >
                {filters.requiresPrescription === false && <Check className="h-3 w-3" />}
              </div>
              <span
                className={cn(
                  'text-sm font-medium',
                  filters.requiresPrescription === false ? 'text-slate-800' : 'text-gray-700'
                )}
              >
                {t('products.filters.otcOnly')}
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                onFilterChange({
                  ...filters,
                  requiresPrescription:
                    filters.requiresPrescription === true ? undefined : true,
                })
              }
              className={cn(
                'flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 transition-all',
                filters.requiresPrescription === true
                  ? 'border-orange-200 bg-orange-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              )}
            >
              <div
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full transition-all',
                  filters.requiresPrescription === true
                    ? 'bg-orange-500 text-white'
                    : 'border-2 border-gray-300'
                )}
              >
                {filters.requiresPrescription === true && <Check className="h-3 w-3" />}
              </div>
              <span
                className={cn(
                  'text-sm font-medium',
                  filters.requiresPrescription === true ? 'text-orange-700' : 'text-gray-700'
                )}
              >
                {t('products.filters.prescriptionOnly')}
              </span>
            </button>
          </div>
        </FilterSection>
      </div>

      {/* Sticky Footer */}
      <div className="sticky bottom-0 left-0 right-0 border-t border-gray-100 bg-white p-3">
        <div className="flex gap-2">
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onClearFilters}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50"
            >
              <RotateCcw className="h-4 w-4" />
              {t('products.filters.clearAll')}
            </button>
          )}
          <button
            type="button"
            onClick={handlePriceApply}
            className={cn(
              'btn-premium flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white',
              activeFilterCount > 0 ? 'flex-1' : 'w-full'
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {t('products.filters.filter')}
          </button>
        </div>
      </div>
    </div>
  );
}

interface FilterSectionProps {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  count?: number;
}

function FilterSection({
  title,
  expanded,
  onToggle,
  children,
  count = 0,
}: FilterSectionProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-100 bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-50"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-gray-900">
          {title}
          {count > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-800 px-1.5 text-xs font-medium text-white">
              {count}
            </span>
          )}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-gray-400 transition-transform duration-200',
            expanded && 'rotate-180'
          )}
        />
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          expanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="border-t border-gray-100 px-4 py-3">{children}</div>
      </div>
    </div>
  );
}

// Mobile Filter Drawer
interface MobileFiltersProps extends ProductFiltersProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileFilters({
  isOpen,
  onClose,
  ...filterProps
}: MobileFiltersProps) {
  const t = useTranslations('products.filters');

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={cn(
          'fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 lg:hidden',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
          <h2 className="text-lg font-semibold text-gray-900">{t('title')}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <ProductFilters {...filterProps} />
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-3">
            {filterProps.activeFilterCount > 0 && (
              <Button
                variant="outline"
                onClick={filterProps.onClearFilters}
                className="flex-1"
              >
                {t('clearAll')}
              </Button>
            )}
            <Button onClick={onClose} className="flex-1">
              {t('showResults')}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
