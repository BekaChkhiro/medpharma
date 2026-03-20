'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { type ProductWithImages } from '@/services/products';

import { ProductCard } from './product-card';

interface ProductCarouselProps {
  products: ProductWithImages[];
  title?: string;
  className?: string;
}

export function ProductCarousel({ products, title, className }: ProductCarouselProps) {
  const t = useTranslations();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Check scroll position to show/hide arrows
  const checkScrollPosition = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScrollPosition();
    container.addEventListener('scroll', checkScrollPosition);
    window.addEventListener('resize', checkScrollPosition);

    return () => {
      container.removeEventListener('scroll', checkScrollPosition);
      window.removeEventListener('resize', checkScrollPosition);
    };
  }, [checkScrollPosition, products]);

  // Scroll by one card width
  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const cardWidth = container.querySelector('.carousel-item')?.clientWidth || 280;
    const gap = 16;
    const scrollAmount = (cardWidth + gap) * 2; // Scroll 2 items at a time

    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  // Mouse drag handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollContainerRef.current?.offsetLeft || 0));
    setScrollLeft(scrollContainerRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const container = scrollContainerRef.current;
    if (!container) return;

    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 1.5;
    container.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (products.length === 0) return null;

  return (
    <section className={cn('relative', className)}>
      {/* Header with title and navigation */}
      <div className="mb-6 flex items-center justify-between">
        {title && (
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
            {title}
          </h2>
        )}

        {/* Desktop navigation arrows */}
        <div className="hidden gap-2 sm:flex">
          <Button
            variant="outline"
            size="sm"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="h-10 w-10 cursor-pointer rounded-full p-0"
            aria-label={t('common.previous')}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="h-10 w-10 cursor-pointer rounded-full p-0"
            aria-label={t('common.next')}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Carousel container */}
      <div className="group relative -mx-4 px-4 sm:-mx-0 sm:px-0">
        {/* Left fade gradient */}
        <div
          className={cn(
            'pointer-events-none absolute left-0 top-0 z-10 hidden h-full w-16 bg-gradient-to-r from-white to-transparent sm:block',
            !canScrollLeft && 'opacity-0'
          )}
        />

        {/* Right fade gradient */}
        <div
          className={cn(
            'pointer-events-none absolute right-0 top-0 z-10 hidden h-full w-16 bg-gradient-to-l from-white to-transparent sm:block',
            !canScrollRight && 'opacity-0'
          )}
        />

        {/* Mobile floating arrows */}
        <button
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          className={cn(
            'absolute left-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-all sm:hidden',
            canScrollLeft ? 'opacity-100' : 'pointer-events-none opacity-0'
          )}
          aria-label={t('common.previous')}
        >
          <ChevronLeft className="h-5 w-5 text-gray-700" />
        </button>
        <button
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          className={cn(
            'absolute right-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-all sm:hidden',
            canScrollRight ? 'opacity-100' : 'pointer-events-none opacity-0'
          )}
          aria-label={t('common.next')}
        >
          <ChevronRight className="h-5 w-5 text-gray-700" />
        </button>

        {/* Scrollable container */}
        <div
          ref={scrollContainerRef}
          className={cn(
            'flex cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth active:cursor-grabbing',
            isDragging && 'cursor-grabbing select-none'
          )}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="carousel-item w-[160px] flex-shrink-0 snap-start sm:w-[220px] lg:w-[260px]"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator dots (mobile only) */}
      <div className="mt-4 flex justify-center gap-1.5 sm:hidden">
        {Array.from({ length: Math.ceil(products.length / 2) }).map((_, idx) => (
          <div
            key={idx}
            className="h-1.5 w-1.5 rounded-full bg-gray-300"
          />
        ))}
      </div>
    </section>
  );
}
