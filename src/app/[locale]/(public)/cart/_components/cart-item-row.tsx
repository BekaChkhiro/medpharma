'use client';

/**
 * Cart Item Row Component
 * Individual cart item with image, name, price, quantity controls, and remove button
 */

import { useState } from 'react';

import Image from 'next/image';

import { AlertTriangle, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QuantitySelector } from '@/components/ui/quantity-selector';
import { useCartItem, useCartItemDisplay, formatPrice } from '@/hooks/use-cart';
import { Link } from '@/i18n/navigation';
import type { CartItem } from '@/store/cart-store';

interface CartItemRowProps {
  item: CartItem;
  locale: 'ka' | 'en';
}

const PLACEHOLDER_IMAGE = '/images/placeholder-product.svg';

export function CartItemRow({ item, locale }: CartItemRowProps) {
  const t = useTranslations('cart');
  const tProduct = useTranslations('product');
  const tCommon = useTranslations('common');
  const [imageError, setImageError] = useState(false);

  const {
    quantity,
    stock,
    remove,
    setQuantity,
    isHydrated,
  } = useCartItem(item.productId);

  const {
    name,
    effectivePrice,
    hasSale,
    discount,
    itemTotal,
    originalPrice,
    isLowStock,
    isOutOfStock,
  } = useCartItemDisplay(item, locale);

  // Placeholder image for products without images or broken images
  const imageUrl = imageError || !item.imageUrl ? PLACEHOLDER_IMAGE : item.imageUrl;

  // Use values from the passed item prop during hydration for consistency
  const displayQuantity = isHydrated ? quantity : item.quantity;
  const displayStock = isHydrated ? stock : item.stock;

  return (
    <div className="flex gap-4 p-4 sm:p-6">
      {/* Product Image */}
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:h-32 sm:w-32">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 96px, 128px"
          onError={() => setImageError(true)}
        />
        {hasSale && (
          <Badge
            variant="destructive"
            className="absolute left-1 top-1 text-xs"
          >
            -{discount}%
          </Badge>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-1 flex-col">
        {/* Name and SKU */}
        <div className="mb-2">
          <Link
            href={`/products/${item.sku}`}
            className="font-medium text-slate-900 hover:text-slate-600 transition-colors line-clamp-2"
          >
            {name}
          </Link>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {tProduct('sku')}: {item.sku}
          </p>
        </div>

        {/* Price */}
        <div className="mb-3 flex items-center gap-2">
          <span className="font-semibold text-slate-900">
            {formatPrice(effectivePrice)}
          </span>
          {hasSale && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>

        {/* Stock warning */}
        {isLowStock && !isOutOfStock && (
          <div className="mb-3 flex items-center gap-1 text-xs text-amber-600">
            <AlertTriangle className="h-3 w-3" />
            <span>{tProduct('stock.lowStock', { count: displayStock })}</span>
          </div>
        )}

        {isOutOfStock && (
          <div className="mb-3 flex items-center gap-1 text-xs text-red-600">
            <AlertTriangle className="h-3 w-3" />
            <span>{tCommon('outOfStock')}</span>
          </div>
        )}

        {/* Bottom row: Quantity + Remove + Item Total */}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Quantity selector */}
            <QuantitySelector
              value={displayQuantity}
              onChange={setQuantity}
              min={1}
              max={displayStock}
              disabled={isOutOfStock}
              size="sm"
            />

            {/* Remove button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={remove}
              className="text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label={t('remove')}
            >
              <Trash2 className="h-4 w-4" />
              <span className="ml-1 hidden sm:inline">{t('remove')}</span>
            </Button>
          </div>

          {/* Item total */}
          <div className="text-right">
            <p className="text-sm text-muted-foreground">{tProduct('quantity')}: {displayQuantity}</p>
            <p className="font-bold text-slate-900">{formatPrice(itemTotal)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
