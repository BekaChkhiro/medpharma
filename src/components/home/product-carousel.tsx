'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, Tag, Sparkles } from 'lucide-react';

import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { type ProductWithImages } from '@/services/products';
import { ProductCard } from '@/components/products/product-card';

interface ProductCarouselProps {
  products: ProductWithImages[];
  titleKey: string;
  subtitleKey?: string;
  viewAllHref?: string;
  variant?: 'default' | 'sale' | 'featured';
}

export function ProductCarousel({
  products,
  titleKey,
  subtitleKey,
  viewAllHref,
  variant = 'default',
}: ProductCarouselProps) {
  const t = useTranslations();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        ref.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [products]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const cardWidth = 280;
    const gap = 24;
    const scrollAmount = (cardWidth + gap) * 2;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const variantConfig = {
    default: {
      badge: 'bg-slate-800 text-white',
      icon: <Sparkles className="w-4 h-4" />,
      accentColor: 'text-slate-700',
    },
    sale: {
      badge: 'bg-emerald-600 text-white',
      icon: <Tag className="w-4 h-4" />,
      accentColor: 'text-emerald-600',
    },
    featured: {
      badge: 'bg-amber-500 text-white',
      icon: <Sparkles className="w-4 h-4" />,
      accentColor: 'text-amber-600',
    },
  };

  const config = variantConfig[variant];

  if (products.length === 0) return null;

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 lg:mb-8">
        <div className="flex flex-wrap items-center gap-3">
          {/* Title Badge */}
          <div className={cn('inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm shadow-sm', config.badge)}>
            {config.icon}
            <span>{t(titleKey)}</span>
          </div>
          {/* Subtitle */}
          {subtitleKey && (
            <p className="text-slate-500 text-sm">{t(subtitleKey)}</p>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={cn(
                'w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200',
                canScrollLeft
                  ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm hover:shadow'
                  : 'bg-slate-100 border border-slate-100 text-slate-300 cursor-not-allowed'
              )}
              aria-label="Previous products"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={cn(
                'w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200',
                canScrollRight
                  ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm hover:shadow'
                  : 'bg-slate-100 border border-slate-100 text-slate-300 cursor-not-allowed'
              )}
              aria-label="Next products"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* View All Link */}
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className={cn(
                'group inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-sm transition-colors',
                'bg-slate-100 text-slate-700 hover:bg-slate-200'
              )}
            >
              {t('common.viewAll')}
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Gradient fade left */}
        <div
          className={cn(
            'absolute left-0 top-0 bottom-4 w-12 lg:w-16 z-10 pointer-events-none transition-opacity duration-300',
            'bg-gradient-to-r from-white via-white/80 to-transparent',
            canScrollLeft ? 'opacity-100' : 'opacity-0'
          )}
        />

        {/* Gradient fade right */}
        <div
          className={cn(
            'absolute right-0 top-0 bottom-4 w-12 lg:w-16 z-10 pointer-events-none transition-opacity duration-300',
            'bg-gradient-to-l from-white via-white/80 to-transparent',
            canScrollRight ? 'opacity-100' : 'opacity-0'
          )}
        />

        {/* Products Scroll Container */}
        <div
          ref={scrollRef}
          className="flex gap-4 lg:gap-6 overflow-x-auto pb-4 scroll-smooth"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-[240px] sm:w-[260px] lg:w-[280px]"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile scroll indicator */}
      <div className="flex justify-center mt-4 sm:hidden">
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <ChevronLeft className="w-3 h-3" />
          <span>გადაასრიალეთ</span>
          <ChevronRight className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
}
