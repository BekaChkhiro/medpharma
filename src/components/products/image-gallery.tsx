'use client';

import { useState, useRef, useCallback } from 'react';

import Image from 'next/image';

import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

import { cn } from '@/lib/utils';

interface ImageGalleryImage {
  id: string;
  url: string;
  alt: string | null;
  isPrimary: boolean;
}

interface ImageGalleryProps {
  images: ImageGalleryImage[];
  productName: string;
  className?: string;
}

const PLACEHOLDER_IMAGE = '/images/placeholder-product.svg';

export function ImageGallery({ images, productName, className }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const rawImage = images[selectedIndex];
  const currentImage = rawImage && !failedImages.has(rawImage.id) ? rawImage : {
    id: 'placeholder',
    url: PLACEHOLDER_IMAGE,
    alt: productName,
    isPrimary: true,
  };

  const handleImageError = useCallback((imageId: string) => {
    setFailedImages(prev => new Set(prev).add(imageId));
  }, []);

  const handlePrevious = useCallback(() => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;

    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({ x, y });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsZoomed(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsZoomed(false);
    setZoomPosition({ x: 50, y: 50 });
  }, []);

  const handleThumbnailClick = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    },
    [handlePrevious, handleNext]
  );

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main Image Container */}
      <div
        ref={imageContainerRef}
        className="group relative aspect-square w-full overflow-hidden rounded-xl border border-gray-100 bg-gray-50"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="img"
        aria-label={currentImage.alt || productName}
      >
        {/* Main Image */}
        <div
          className={cn(
            'relative h-full w-full transition-transform duration-200',
            isZoomed && 'scale-150'
          )}
          style={{
            transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
          }}
        >
          <Image
            src={currentImage.url}
            alt={currentImage.alt || productName}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain"
            priority
            onError={() => handleImageError(currentImage.id)}
          />
        </div>

        {/* Zoom Indicator */}
        <div
          className={cn(
            'absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs text-white transition-opacity',
            isZoomed ? 'opacity-0' : 'opacity-100'
          )}
        >
          <ZoomIn className="h-3 w-3" />
          <span>Hover to zoom</span>
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrevious();
              }}
              className={cn(
                'absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md transition-all',
                'hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary',
                'opacity-0 group-hover:opacity-100'
              )}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className={cn(
                'absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md transition-all',
                'hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary',
                'opacity-0 group-hover:opacity-100'
              )}
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5 text-gray-700" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
            {selectedIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div
          className="flex gap-2 overflow-x-auto"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => handleThumbnailClick(index)}
              className={cn(
                'relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all sm:h-20 sm:w-20',
                index === selectedIndex
                  ? 'border-primary ring-2 ring-primary/20 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              )}
              aria-label={`View image ${index + 1}`}
              aria-current={index === selectedIndex ? 'true' : undefined}
            >
              <Image
                src={failedImages.has(image.id) ? PLACEHOLDER_IMAGE : image.url}
                alt={image.alt || `${productName} - Image ${index + 1}`}
                fill
                sizes="80px"
                className="object-cover"
                onError={() => handleImageError(image.id)}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
