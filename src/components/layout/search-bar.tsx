'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

import Image from 'next/image';

import { Search, X, Loader2, ArrowRight, Package, Clock, Sparkles } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

import { Link, useRouter } from '@/i18n/navigation';
import { cn, formatPrice } from '@/lib/utils';
import { type ProductWithImages } from '@/services/products';

interface SearchBarProps {
  className?: string;
  variant?: 'default' | 'compact';
  onSearch?: (query: string) => void;
  onResultClick?: () => void;
}

const PLACEHOLDER_IMAGE = '/images/placeholder-product.svg';

export function SearchBar({ className, variant = 'default', onSearch, onResultClick }: SearchBarProps) {
  const t = useTranslations('nav');
  const tProducts = useTranslations('products');
  const router = useRouter();
  const locale = useLocale() as 'ka' | 'en';

  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState<ProductWithImages[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch search results
  const fetchResults = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    try {
      // Use lightweight search endpoint for autocomplete
      const response = await fetch(
        `/api/products/search?q=${encodeURIComponent(searchQuery)}&limit=5&locale=${locale}`
      );
      const data = await response.json();

      if (data.success && data.data?.products) {
        setResults(data.data.products);
        setShowResults(true);
      } else {
        setResults([]);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [locale]);

  // Debounced search
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);

    if (onSearch) {
      onSearch(value);
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchResults(value);
    }, 150);
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setShowResults(false);
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      onResultClick?.();
    }
  };

  // Handle clear
  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
    if (onSearch) {
      onSearch('');
    }
  };

  // Handle clicking a result
  const handleResultClick = () => {
    setShowResults(false);
    setQuery('');
    onResultClick?.();
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        if (selectedIndex >= 0 && results[selectedIndex]) {
          e.preventDefault();
          router.push(`/products/${results[selectedIndex].slug}`);
          handleResultClick();
        }
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut: Ctrl/Cmd + K to focus search
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const getProductName = (product: ProductWithImages) => {
    return locale === 'ka' ? product.nameKa : product.nameEn;
  };

  const getProductImage = (product: ProductWithImages) => {
    const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
    return primaryImage?.url || PLACEHOLDER_IMAGE;
  };

  const getCategoryName = (product: ProductWithImages) => {
    if (!product.category) return null;
    return locale === 'ka' ? product.category.nameKa : product.category.nameEn;
  };

  const getProductPrice = (product: ProductWithImages) => {
    const price = Number(product.price);
    const salePrice = product.salePrice ? Number(product.salePrice) : null;
    return salePrice && salePrice < price ? salePrice : price;
  };

  const getDiscountPercent = (product: ProductWithImages) => {
    const price = Number(product.price);
    const salePrice = product.salePrice ? Number(product.salePrice) : null;
    if (salePrice && salePrice < price) {
      return Math.round(((price - salePrice) / price) * 100);
    }
    return 0;
  };

  const formatLocale = locale === 'ka' ? 'ka-GE' : 'en-US';

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <form onSubmit={handleSubmit}>
        <div
          className={cn(
            'relative flex items-center w-full'
          )}
        >
          {/* Search Icon / Loading Spinner */}
          <div className="absolute left-3.5 flex items-center pointer-events-none z-10">
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-red-600 animate-spin" />
            ) : (
              <Search
                className={cn(
                  'w-5 h-5 transition-colors duration-200',
                  isFocused || showResults ? 'text-red-600' : 'text-slate-400'
                )}
              />
            )}
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={handleInputChange}
            onFocus={() => {
              setIsFocused(true);
              if (results.length > 0 && query.length >= 2) {
                setShowResults(true);
              }
            }}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={t('search')}
            autoComplete="off"
            className={cn(
              'w-full pl-11 pr-11 py-3 text-[15px]',
              'bg-white border-2 border-slate-200',
              'placeholder:text-slate-400 text-slate-800',
              'focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10',
              'transition-all duration-200',
              'rounded-2xl',
              variant === 'compact' && 'py-2.5 text-sm',
              showResults && 'rounded-b-none border-b-slate-100'
            )}
            aria-label={t('search')}
            aria-expanded={showResults}
            aria-haspopup="listbox"
            role="combobox"
          />

          {/* Clear Button */}
          {query ? (
            <button
              type="button"
              onClick={handleClear}
              className={cn(
                'absolute right-3 p-1.5 rounded-full',
                'text-slate-400 hover:text-slate-600',
                'hover:bg-slate-100 active:bg-slate-200',
                'transition-all duration-150'
              )}
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          ) : !isFocused && variant === 'default' ? (
            /* Keyboard Shortcut Hint */
            <div className="absolute right-3 hidden sm:flex items-center gap-1">
              <kbd className="px-1.5 py-1 text-[10px] font-medium bg-slate-100 text-slate-500 rounded-md border border-slate-200/80 shadow-sm">
                ⌘K
              </kbd>
            </div>
          ) : null}
        </div>
      </form>

      {/* Results Dropdown */}
      {showResults && (
        <div
          className={cn(
            'absolute left-0 right-0 top-full z-50',
            'bg-white border-2 border-t-0 border-slate-200',
            'rounded-b-2xl shadow-2xl shadow-slate-200/50',
            'overflow-hidden',
            'animate-in fade-in-0 slide-in-from-top-2 duration-200'
          )}
          role="listbox"
        >
          {results.length > 0 ? (
            <>
              {/* Results Header */}
              <div className="px-4 py-2.5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    {locale === 'ka' ? 'შედეგები' : 'Results'}
                  </span>
                  <span className="text-xs text-slate-400">
                    {results.length} {locale === 'ka' ? 'პროდუქტი' : 'products'}
                  </span>
                </div>
              </div>

              {/* Results List */}
              <ul className="py-2">
                {results.map((product, index) => {
                  const discountPercent = getDiscountPercent(product);
                  const isOutOfStock = product.stock <= 0;
                  const isLowStock = product.stock > 0 && product.stock <= 5;
                  const categoryName = getCategoryName(product);

                  return (
                    <li key={product.id}>
                      <Link
                        href={`/products/${product.slug}`}
                        onClick={handleResultClick}
                        className={cn(
                          'flex items-center gap-4 px-4 py-3 mx-2 rounded-xl',
                          'transition-all duration-150',
                          'hover:bg-slate-50',
                          'group',
                          selectedIndex === index && 'bg-red-50 hover:bg-red-50'
                        )}
                        role="option"
                        aria-selected={selectedIndex === index}
                      >
                        {/* Product Image */}
                        <div className="relative shrink-0">
                          <div
                            className={cn(
                              'relative w-16 h-16 rounded-xl overflow-hidden',
                              'bg-gradient-to-br from-slate-100 to-slate-50',
                              'ring-1 ring-slate-200/50',
                              'group-hover:ring-slate-300 group-hover:shadow-md',
                              'transition-all duration-200',
                              selectedIndex === index && 'ring-red-200'
                            )}
                          >
                            <Image
                              src={getProductImage(product)}
                              alt={getProductName(product)}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </div>

                          {/* Discount Badge */}
                          {discountPercent > 0 && (
                            <div className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-bold rounded-md shadow-sm">
                              -{discountPercent}%
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0 space-y-1">
                          {/* Category */}
                          {categoryName && (
                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                              {categoryName}
                            </p>
                          )}

                          {/* Name */}
                          <p
                            className={cn(
                              'text-sm font-semibold text-slate-800 leading-tight',
                              'group-hover:text-slate-900',
                              'line-clamp-2'
                            )}
                          >
                            {getProductName(product)}
                          </p>

                          {/* Brand & Stock */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {product.brand && (
                              <span className="text-xs text-slate-500">{product.brand}</span>
                            )}
                            {isOutOfStock ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-medium rounded">
                                <Package className="w-3 h-3" />
                                {locale === 'ka' ? 'არ არის მარაგში' : 'Out of stock'}
                              </span>
                            ) : isLowStock ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-medium rounded">
                                <Clock className="w-3 h-3" />
                                {locale === 'ka' ? 'მცირე მარაგი' : 'Low stock'}
                              </span>
                            ) : null}
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right shrink-0">
                          <p
                            className={cn(
                              'text-base font-bold',
                              discountPercent > 0 ? 'text-red-600' : 'text-slate-800'
                            )}
                          >
                            {formatPrice(getProductPrice(product), { locale: formatLocale })}
                          </p>
                          {discountPercent > 0 && (
                            <p className="text-xs text-slate-400 line-through">
                              {formatPrice(Number(product.price), { locale: formatLocale })}
                            </p>
                          )}
                        </div>

                        {/* Arrow indicator */}
                        <ArrowRight
                          className={cn(
                            'w-4 h-4 text-slate-300 shrink-0',
                            'opacity-0 -translate-x-2',
                            'group-hover:opacity-100 group-hover:translate-x-0',
                            'transition-all duration-200',
                            selectedIndex === index && 'opacity-100 translate-x-0 text-red-400'
                          )}
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {/* View All Results Footer */}
              <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-white border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className={cn(
                    'w-full py-2.5 px-4',
                    'bg-gradient-to-r from-red-600 to-red-500',
                    'hover:from-red-500 hover:to-red-600',
                    'text-white text-sm font-semibold',
                    'rounded-xl shadow-lg shadow-red-500/25',
                    'hover:shadow-xl hover:shadow-red-500/30',
                    'active:scale-[0.98]',
                    'transition-all duration-200',
                    'flex items-center justify-center gap-2'
                  )}
                >
                  <Sparkles className="w-4 h-4" />
                  {tProducts('viewAllResults')}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : query.length >= 2 && !isLoading ? (
            /* No Results State */
            <div className="py-12 px-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-base font-semibold text-slate-700 mb-1">
                {locale === 'ka' ? 'ვერაფერი მოიძებნა' : 'No results found'}
              </h3>
              <p className="text-sm text-slate-500 max-w-[250px] mx-auto">
                {locale === 'ka'
                  ? `"${query}" - სცადეთ სხვა საძიებო სიტყვა`
                  : `Try searching for something else instead of "${query}"`}
              </p>
            </div>
          ) : null}

          {/* Keyboard Hints */}
          {results.length > 0 && (
            <div className="px-4 py-2 bg-slate-50/50 border-t border-slate-100 hidden sm:flex items-center justify-center gap-4 text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-white rounded border border-slate-200 font-mono">↑↓</kbd>
                {locale === 'ka' ? 'ნავიგაცია' : 'Navigate'}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-200 font-mono">↵</kbd>
                {locale === 'ka' ? 'არჩევა' : 'Select'}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-white rounded border border-slate-200 font-mono">esc</kbd>
                {locale === 'ka' ? 'დახურვა' : 'Close'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
