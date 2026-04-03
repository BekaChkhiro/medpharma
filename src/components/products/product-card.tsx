'use client';

import { useState } from 'react';

import Image from 'next/image';

import { ShoppingCart, Eye } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

import { useAddToCart } from '@/hooks/use-cart';
import { Link } from '@/i18n/navigation';
import { formatPrice } from '@/lib/utils';
import { type ProductWithImages } from '@/services/products';

interface ProductCardProps {
  product: ProductWithImages;
}

// Map short locale to full locale for formatting
const localeMap = {
  ka: 'ka-GE',
  en: 'en-US',
} as const;

const PLACEHOLDER_IMAGE = '/images/placeholder-product.svg';

export function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations();
  const locale = useLocale() as 'ka' | 'en';
  const formatLocale = localeMap[locale];
  const addToCart = useAddToCart();
  const [imageError, setImageError] = useState(false);

  const name = locale === 'ka' ? product.nameKa : product.nameEn;
  const categoryName = product.category
    ? locale === 'ka'
      ? product.category.nameKa
      : product.category.nameEn
    : null;

  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
  const imageUrl = imageError || !primaryImage?.url ? PLACEHOLDER_IMAGE : primaryImage.url;

  const price = Number(product.price);
  const salePrice = product.salePrice ? Number(product.salePrice) : null;
  const hasDiscount = salePrice !== null && salePrice < price;
  const discountPercent = hasDiscount
    ? Math.round(((price - salePrice!) / price) * 100)
    : 0;

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 10;

  return (
    <div className="card-premium group relative flex flex-col overflow-hidden rounded-xl">
      {/* Badges Row */}
      <div className="absolute left-2.5 right-2.5 top-2.5 z-10 flex items-start justify-between">
        {/* Left Badges */}
        <div className="flex flex-col gap-1.5">
          {hasDiscount && (
            <span className="badge-gradient-discount rounded-full px-2.5 py-1 text-xs font-bold text-white">
              -{discountPercent}%
            </span>
          )}
          {product.requiresPrescription && (
            <span className="badge-glass-rx rounded-full px-2.5 py-1 text-xs font-semibold">
              Rx
            </span>
          )}
        </div>

        {/* Right Badges */}
        <div className="flex flex-col gap-1.5">
          {product.isFeatured && (
            <span className="badge-gradient-featured rounded-full px-2.5 py-1 text-xs font-bold text-white">
              ★
            </span>
          )}
          {isOutOfStock && (
            <span className="badge-glass-stock rounded-full px-3 py-1 text-xs font-medium">
              {t('common.outOfStock')}
            </span>
          )}
        </div>
      </div>

      {/* Image */}
      <Link
        href={`/products/${product.slug}`}
        className="image-vignette relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100"
      >
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`object-cover transition-transform duration-500 ease-out group-hover:scale-110 ${
            isOutOfStock ? 'opacity-50 grayscale' : ''
          }`}
          onError={() => setImageError(true)}
        />
        {/* Gradient Overlay */}
        <div className="image-overlay-gradient" />
        {/* Quick View Pill */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="quick-view-pill flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-gray-800">
            <Eye className="h-4 w-4" />
            {t('common.view')}
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Category */}
        {categoryName && (
          <span className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-gray-400">
            {categoryName}
          </span>
        )}

        {/* Name */}
        <Link
          href={`/products/${product.slug}`}
          className="line-clamp-2 min-h-[2.75rem] text-sm font-semibold leading-snug text-gray-900 transition-colors hover:text-slate-600"
        >
          {name}
        </Link>

        {/* Brand */}
        {product.brand && (
          <span className="mt-1 text-xs italic text-gray-400">{product.brand}</span>
        )}

        {/* Price */}
        <div className="mt-auto pt-3">
          {hasDiscount ? (
            <div className="flex items-baseline gap-2">
              <span className="price-gradient text-xl font-bold">
                {formatPrice(salePrice!, { locale: formatLocale })}
              </span>
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(price, { locale: formatLocale })}
              </span>
            </div>
          ) : (
            <span className="text-xl font-bold text-gray-900">
              {formatPrice(price, { locale: formatLocale })}
            </span>
          )}
        </div>

        {/* Stock Status */}
        {isLowStock && !isOutOfStock && (
          <span className="mt-1.5 text-xs font-medium text-amber-500">
            {t('product.stock.lowStock', { count: product.stock })}
          </span>
        )}

        {/* Add to Cart Button */}
        <button
          className="btn-premium mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed"
          disabled={isOutOfStock}
          onClick={(e) => {
            e.preventDefault();
            addToCart(
              {
                id: product.id,
                nameKa: product.nameKa,
                nameEn: product.nameEn,
                price: price,
                salePrice: salePrice,
                imageUrl: imageUrl,
                stock: product.stock,
                sku: product.sku,
              },
              { openCartAfter: true }
            );
          }}
        >
          <ShoppingCart className="cart-icon-animate h-4 w-4" />
          {isOutOfStock ? t('common.outOfStock') : t('product.addToCart')}
        </button>
      </div>
    </div>
  );
}
