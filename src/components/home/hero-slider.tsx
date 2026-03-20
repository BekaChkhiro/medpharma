'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';

interface Slide {
  id: number;
  image: string;
  alt: string;
}

const slides: Slide[] = [
  {
    id: 1,
    image: '/images/slides/slide-1.jpg',
    alt: 'MedPharma Plus - Pharmacy',
  },
  {
    id: 2,
    image: '/images/slides/slide-2.jpg',
    alt: 'Diabetic Nutrition Products',
  },
  {
    id: 3,
    image: '/images/slides/slide-3.jpg',
    alt: 'Medical Devices',
  },
  {
    id: 4,
    image: '/images/slides/slide-4.jpg',
    alt: 'Aesthetics & Beauty',
  },
];

// Placeholder gradient backgrounds when images don't exist
const placeholderGradients = [
  'from-red-500 via-red-600 to-red-700',
  'from-emerald-500 via-emerald-600 to-teal-700',
  'from-blue-500 via-blue-600 to-indigo-700',
  'from-fuchsia-500 via-pink-600 to-rose-700',
];

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  const handleArrowClick = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      prevSlide();
    } else {
      nextSlide();
    }
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  return (
    <section className="relative w-full h-[350px] sm:h-[450px] lg:h-[550px] xl:h-[600px] overflow-hidden bg-slate-100">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={cn(
            'absolute inset-0 transition-all duration-700 ease-in-out',
            index === currentSlide
              ? 'opacity-100 z-10 scale-100'
              : 'opacity-0 z-0 scale-105'
          )}
        >
          {/* Placeholder gradient background */}
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-br',
              placeholderGradients[index % placeholderGradients.length]
            )}
          />

          {/* Image */}
          <Image
            src={slide.image}
            alt={slide.alt}
            fill
            priority={index === 0}
            className="object-cover"
            sizes="100vw"
          />

          {/* Subtle overlay for better arrow visibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/10" />
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={() => handleArrowClick('prev')}
        className="absolute left-3 sm:left-5 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-white hover:bg-white rounded-full flex items-center justify-center text-slate-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
      </button>

      <button
        onClick={() => handleArrowClick('next')}
        className="absolute right-3 sm:right-5 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-white hover:bg-white rounded-full flex items-center justify-center text-slate-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
      </button>

      {/* Dots Navigation */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 sm:gap-2.5 px-4 py-2 bg-black/20 backdrop-blur-sm rounded-full">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              'rounded-full transition-all duration-300',
              index === currentSlide
                ? 'w-7 sm:w-8 h-2.5 sm:h-3 bg-white shadow-md'
                : 'w-2.5 sm:w-3 h-2.5 sm:h-3 bg-white/60 hover:bg-white/80'
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div className="absolute top-4 right-4 z-20 px-3 py-1.5 bg-black/30 backdrop-blur-sm rounded-full">
        <span className="text-white text-sm font-medium">
          {currentSlide + 1} / {slides.length}
        </span>
      </div>
    </section>
  );
}
