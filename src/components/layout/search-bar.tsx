'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

import Image from 'next/image';

import { Search, X, Loader2, Package, Clock } from 'lucide-react';
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
      const response = await fetch(
        `/api/products/search?q=${encodeURIComponent(searchQuery)}&limit=6&locale=${locale}`
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
        <div className="relative flex items-center w-full">
          {/* Search Icon / Loading */}
          <div className="absolute left-3.5 flex items-center pointer-events-none z-10">
            {isLoading ? (
              <Loader2 className="w-[18px] h-[18px] text-slate-400 animate-spin" />
            ) : (
              <Search
                className={cn(
                  'w-[18px] h-[18px] transition-colors duration-200',
                  isFocused ? 'text-slate-600' : 'text-slate-400'
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
              'w-full pl-10 pr-10 py-2.5 text-sm',
              'bg-white/80 border border-slate-200/80',
              'placeholder:text-slate-400 text-slate-800',
              'focus:outline-none focus:bg-white focus:border-slate-300 focus:shadow-sm',
              'transition-all duration-200',
              'rounded-full',
              variant === 'compact' && 'py-2 text-sm',
              showResults && 'rounded-b-none border-b-transparent shadow-sm'
            )}
            aria-label={t('search')}
            aria-expanded={showResults}
            aria-haspopup="listbox"
            role="combobox"
          />

          {/* Clear / Shortcut */}
          {query ? (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          ) : !isFocused && variant === 'default' ? (
            <div className="absolute right-3 hidden sm:flex items-center">
              <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-slate-400 bg-slate-100/80 rounded border border-slate-200/60">
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
            'bg-[#FDFBF7] border border-t-0 border-slate-200/80',
            'rounded-b-2xl shadow-lg shadow-black/8',
            'overflow-hidden'
          )}
          role="listbox"
        >
          {results.length > 0 ? (
            <>
              {/* Results List */}
              <ul className="py-1.5 max-h-[400px] overflow-y-auto">
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
                          'flex items-center gap-3 px-3 py-2.5 mx-1.5 rounded-lg',
                          'transition-colors duration-100',
                          'hover:bg-slate-50',
                          'group',
                          selectedIndex === index && 'bg-slate-50'
                        )}
                        role="option"
                        aria-selected={selectedIndex === index}
                      >
                        {/* Product Image */}
                        <div className="relative shrink-0">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100">
                            <Image
                              src={getProductImage(product)}
                              alt={getProductName(product)}
                              fill
                              className={cn(
                                'object-cover',
                                isOutOfStock && 'opacity-40 grayscale'
                              )}
                              sizes="48px"
                            />
                          </div>
                          {discountPercent > 0 && (
                            <div className="absolute -top-1 -right-1 px-1 py-px bg-[#df2b1b] text-white text-[9px] font-bold rounded">
                              -{discountPercent}%
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          {categoryName && (
                            <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">
                              {categoryName}
                            </p>
                          )}
                          <p className="text-sm font-medium text-slate-800 leading-snug line-clamp-1 group-hover:text-slate-900">
                            {getProductName(product)}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {product.brand && (
                              <span className="text-xs text-slate-400">{product.brand}</span>
                            )}
                            {isOutOfStock && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-400">
                                <Package className="w-3 h-3" />
                                {locale === 'ka' ? 'არ არის' : 'Out of stock'}
                              </span>
                            )}
                            {isLowStock && !isOutOfStock && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-500">
                                <Clock className="w-3 h-3" />
                                {locale === 'ka' ? 'მცირე' : 'Low stock'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right shrink-0">
                          <p className={cn(
                            'text-sm font-semibold',
                            discountPercent > 0 ? 'text-[#df2b1b]' : 'text-slate-800'
                          )}>
                            {formatPrice(getProductPrice(product), { locale: formatLocale })}
                          </p>
                          {discountPercent > 0 && (
                            <p className="text-[11px] text-slate-400 line-through">
                              {formatPrice(Number(product.price), { locale: formatLocale })}
                            </p>
                          )}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {/* View All */}
              <div className="border-t border-slate-100 px-3 py-2.5">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  {tProducts('viewAllResults')} &quot;{query}&quot;
                </button>
              </div>
            </>
          ) : query.length >= 2 && !isLoading ? (
            /* No Results */
            <div className="py-10 px-6 text-center">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-600 mb-1">
                {locale === 'ka' ? 'ვერაფერი მოიძებნა' : 'No results found'}
              </p>
              <p className="text-xs text-slate-400">
                {locale === 'ka'
                  ? 'სცადეთ სხვა საძიებო სიტყვა'
                  : 'Try a different search term'}
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
