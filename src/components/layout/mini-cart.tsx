'use client';

/**
 * Mini Cart Component
 * Dropdown cart preview in the header showing cart items, totals, and quick actions
 */

import { useEffect, useRef, useState, useCallback } from 'react';

import Image from 'next/image';

import { ShoppingCart, X, Trash2, Minus, Plus } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import {
  useCartItems,
  useCartItemCount,
  useCartSubtotal,
  useCartActions,
  useCartIsOpen,
  formatPrice,
  type CartItem,
} from '@/store/cart-store';

const PLACEHOLDER_IMAGE = '/images/placeholder-product.svg';

interface MiniCartItemProps {
  item: CartItem;
  locale: 'ka' | 'en';
  onRemove: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
}

function MiniCartItem({ item, locale, onRemove, onUpdateQuantity }: MiniCartItemProps) {
  const [imageError, setImageError] = useState(false);
  const imageUrl = imageError || !item.imageUrl ? PLACEHOLDER_IMAGE : item.imageUrl;
  const name = locale === 'ka' ? item.nameKa : item.nameEn;
  const effectivePrice = item.salePrice ?? item.price;

  return (
    <div className="flex gap-3 py-3 border-b border-slate-100 last:border-0">
      {/* Product Image */}
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
          sizes="64px"
          onError={() => setImageError(true)}
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/products/${item.sku}`}
          className="text-sm font-medium text-slate-900 hover:text-red-700 transition-colors line-clamp-2"
        >
          {name}
        </Link>

        <div className="mt-1 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-900">
            {formatPrice(effectivePrice)}
          </span>

          {/* Quantity controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
              className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              disabled={item.quantity <= 1}
              aria-label="Decrease quantity"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
              className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              disabled={item.quantity >= item.stock}
              aria-label="Increase quantity"
            >
              <Plus className="w-3 h-3" />
            </button>
            <button
              onClick={() => onRemove(item.productId)}
              className="w-6 h-6 flex items-center justify-center rounded-full text-red-500 hover:bg-red-50 transition-colors ml-1 cursor-pointer"
              aria-label="Remove item"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MiniCart() {
  const t = useTranslations();
  const locale = useLocale() as 'ka' | 'en';
  const cartRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const items = useCartItems();
  const itemCount = useCartItemCount();
  const subtotal = useCartSubtotal();
  const isOpen = useCartIsOpen();
  const { removeItem, updateQuantity, closeCart, toggleCart } = useCartActions();

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeCart();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeCart]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        cartRef.current &&
        buttonRef.current &&
        !cartRef.current.contains(e.target as Node) &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        closeCart();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, closeCart]);

  // Close cart when navigating (clicking on links)
  const handleLinkClick = useCallback(() => {
    closeCart();
  }, [closeCart]);

  return (
    <div className="relative">
      {/* Cart Button */}
      <button
        ref={buttonRef}
        data-testid="cart-button"
        onClick={toggleCart}
        className={cn(
          'relative inline-flex items-center justify-center p-2 rounded-full cursor-pointer',
          'text-foreground hover:bg-secondary transition-colors',
          'focus:outline-none focus-ring',
          isOpen && 'bg-secondary'
        )}
        aria-label={`${t('nav.cart')} (${itemCount} ${itemCount === 1 ? t('cart.item') : t('cart.items')})`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Cart Icon */}
        <ShoppingCart className="w-6 h-6" strokeWidth={1.5} />

        {/* Item Count Badge */}
        {itemCount > 0 && (
          <span
            className={cn(
              'absolute -top-0.5 -right-0.5 flex items-center justify-center',
              'min-w-[18px] h-[18px] px-1',
              'text-xs font-medium text-white bg-red-700 rounded-full',
              'animate-scaleIn'
            )}
          >
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </button>

      {/* Mini Cart Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 bg-black/20 z-40 sm:hidden"
            onClick={closeCart}
            aria-hidden="true"
          />

          <div
            ref={cartRef}
            className={cn(
              // Mobile: full screen from right
              'fixed right-0 top-0 h-full w-full max-w-sm z-50',
              // Desktop: dropdown
              'sm:absolute sm:right-0 sm:top-full sm:mt-2 sm:h-auto sm:rounded-xl sm:w-96',
              // Common styles
              'bg-white shadow-xl border border-slate-200',
              // Animation
              'mini-cart-panel'
            )}
            role="dialog"
            aria-modal="true"
            aria-label={t('nav.cart')}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                {t('nav.cart')}
                {itemCount > 0 && (
                  <span className="text-sm font-normal text-slate-500">
                    ({itemCount} {itemCount === 1 ? t('cart.item') : t('cart.items')})
                  </span>
                )}
              </h2>
              <button
                onClick={closeCart}
                className="p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label={t('common.close')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Content */}
            <div className="flex flex-col h-[calc(100%-64px)] sm:h-auto sm:max-h-[60vh]">
              {items.length === 0 ? (
                // Empty Cart
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <ShoppingCart className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-600 mb-4">{t('cart.empty')}</p>
                  <Link
                    href="/products"
                    onClick={handleLinkClick}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white text-sm font-medium rounded-lg transition-all group shadow-sm hover:shadow-md"
                  >
                    <span>{t('cart.continueShopping')}</span>
                    <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                  </Link>
                </div>
              ) : (
                <>
                  {/* Items List */}
                  <div className="flex-1 overflow-y-auto px-4 py-2">
                    {items.map((item) => (
                      <MiniCartItem
                        key={item.productId}
                        item={item}
                        locale={locale}
                        onRemove={removeItem}
                        onUpdateQuantity={updateQuantity}
                      />
                    ))}
                  </div>

                  {/* Footer with Subtotal and Actions */}
                  <div className="border-t border-slate-200 p-4 bg-slate-50 sm:rounded-b-xl">
                    {/* Continue Shopping Link */}
                    <Link
                      href="/products"
                      onClick={handleLinkClick}
                      className="flex items-center justify-center gap-2 text-sm text-slate-600 hover:text-red-700 transition-colors mb-3 group"
                    >
                      <span className="group-hover:underline">{t('cart.continueShopping')}</span>
                      <span className="text-lg group-hover:translate-x-0.5 transition-transform">→</span>
                    </Link>

                    {/* Subtotal */}
                    <div className="flex items-center justify-between mb-4 py-2 border-t border-slate-200">
                      <span className="text-sm text-slate-600">{t('cart.subtotal')}</span>
                      <span className="text-lg font-bold text-slate-900">{formatPrice(subtotal)}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Link href="/cart" onClick={handleLinkClick} className="flex-1">
                        <Button variant="outline" className="w-full">
                          {t('nav.cart')}
                        </Button>
                      </Link>
                      <Link href="/checkout" onClick={handleLinkClick} className="flex-1">
                        <Button variant="default" className="w-full bg-red-700 hover:bg-red-800">
                          {t('cart.checkout')}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
