'use client';

/**
 * Cart hooks for component integration
 * T3.2: Provides convenient hooks for cart functionality in React components
 */

import { useCallback, useMemo } from 'react';

import { useShallow } from 'zustand/react/shallow';

import {
  useCartStore,
  useCartItems,
  useCartIsOpen,
  useCartItemCount,
  useCartSubtotal,
  useCartActions,
  useHasHydrated,
  type CartItem,
} from '@/store/cart-store';

// Supported locales
type Locale = 'ka' | 'en';

// Product data required for adding to cart
export interface AddToCartProduct {
  id: string;
  nameKa: string;
  nameEn: string;
  price: number;
  salePrice?: number | null;
  imageUrl?: string | null;
  stock: number;
  sku: string;
}

// Cart summary for checkout
export interface CartSummary {
  itemCount: number;
  uniqueItemCount: number;
  subtotal: number;
  isEmpty: boolean;
  items: CartItem[];
}

/**
 * Main cart hook - provides all cart state and actions
 * Use this for components that need full cart functionality
 */
export function useCart() {
  const items = useCartItems();
  const isOpen = useCartIsOpen();
  const itemCount = useCartItemCount();
  const subtotal = useCartSubtotal();
  const actions = useCartActions();
  const isHydrated = useHasHydrated();

  // Memoized cart summary
  const summary: CartSummary = useMemo(
    () => ({
      itemCount,
      uniqueItemCount: items.length,
      subtotal,
      isEmpty: items.length === 0,
      items,
    }),
    [itemCount, items, subtotal]
  );

  return {
    // State
    items,
    isOpen,
    itemCount,
    subtotal,
    summary,
    isEmpty: items.length === 0,
    isHydrated,

    // Actions from store
    ...actions,
  };
}

/**
 * Hook for adding products to cart with validation
 * Returns a function that handles the add-to-cart logic
 */
export function useAddToCart() {
  const { addItem, openCart } = useCartStore(
    useShallow((state) => ({
      addItem: state.addItem,
      openCart: state.openCart,
    }))
  );

  const addToCart = useCallback(
    (
      product: AddToCartProduct,
      options?: {
        openCartAfter?: boolean;
        quantity?: number;
      }
    ): { success: boolean; message: string; currentQuantity: number } => {
      const { openCartAfter = false, quantity = 1 } = options ?? {};

      // Check if product is in stock
      if (product.stock <= 0) {
        return {
          success: false,
          message: 'outOfStock',
          currentQuantity: 0,
        };
      }

      // Check current quantity in cart - access store state directly for up-to-date value
      const existingItem = useCartStore.getState().items.find(
        (i) => i.productId === product.id
      );
      const currentQuantity = existingItem?.quantity ?? 0;
      const newQuantity = currentQuantity + quantity;

      // Check if adding would exceed stock
      if (newQuantity > product.stock) {
        return {
          success: false,
          message: 'exceedsStock',
          currentQuantity,
        };
      }

      // Add item to cart (quantity times to support multiple)
      for (let i = 0; i < quantity; i++) {
        addItem({
          productId: product.id,
          nameKa: product.nameKa,
          nameEn: product.nameEn,
          price: product.price,
          salePrice: product.salePrice,
          imageUrl: product.imageUrl,
          stock: product.stock,
          sku: product.sku,
        });
      }

      // Optionally open cart drawer/modal
      if (openCartAfter) {
        openCart();
      }

      return {
        success: true,
        message: 'addedToCart',
        currentQuantity: newQuantity,
      };
    },
    [addItem, openCart]
  );

  return addToCart;
}

/**
 * Hook for managing a single cart item
 * Useful for cart item rows with quantity controls
 */
export function useCartItem(productId: string) {
  // Find item from items array directly to avoid calling method in selector
  const item = useCartStore((state) =>
    state.items.find((i) => i.productId === productId)
  );
  const { updateQuantity, removeItem } = useCartActions();
  const isHydrated = useHasHydrated();

  // Return safe defaults during hydration
  const quantity = isHydrated ? (item?.quantity ?? 0) : 0;
  const stock = isHydrated ? (item?.stock ?? 0) : 0;
  const canIncrement = isHydrated ? quantity < stock : false;
  const canDecrement = isHydrated ? quantity > 1 : false;

  const increment = useCallback(() => {
    if (canIncrement) {
      updateQuantity(productId, quantity + 1);
    }
  }, [productId, quantity, canIncrement, updateQuantity]);

  const decrement = useCallback(() => {
    if (canDecrement) {
      updateQuantity(productId, quantity - 1);
    }
  }, [productId, quantity, canDecrement, updateQuantity]);

  const remove = useCallback(() => {
    removeItem(productId);
  }, [productId, removeItem]);

  const setQuantity = useCallback(
    (newQuantity: number) => {
      const validQuantity = Math.max(0, Math.min(newQuantity, stock));
      if (validQuantity === 0) {
        removeItem(productId);
      } else {
        updateQuantity(productId, validQuantity);
      }
    },
    [productId, stock, updateQuantity, removeItem]
  );

  // Get effective price (sale price or regular)
  const effectivePrice = isHydrated && item ? (item.salePrice ?? item.price) : 0;
  const itemTotal = effectivePrice * quantity;
  const hasSale = isHydrated && item?.salePrice != null && item.salePrice < item.price;

  return {
    item: isHydrated ? item : undefined,
    quantity,
    stock,
    effectivePrice,
    itemTotal,
    hasSale,
    canIncrement,
    canDecrement,
    increment,
    decrement,
    remove,
    setQuantity,
    isHydrated,
  };
}

/**
 * Hook to check if a product is in cart
 * Optimized to only subscribe to relevant state
 */
export function useIsInCart(productId: string): boolean {
  // Check directly from items array to avoid calling method in selector
  return useCartStore((state) => state.items.some((i) => i.productId === productId));
}

/**
 * Hook to get quantity of a product in cart
 */
export function useCartQuantity(productId: string): number {
  // Get quantity directly from items array to avoid calling method in selector
  const item = useCartStore((state) =>
    state.items.find((i) => i.productId === productId)
  );
  return item?.quantity ?? 0;
}

/**
 * Hook for locale-aware cart item display
 */
export function useCartItemDisplay(item: CartItem, locale: Locale = 'ka') {
  const name = locale === 'en' ? item.nameEn : item.nameKa;
  const effectivePrice = item.salePrice ?? item.price;
  const hasSale = item.salePrice != null && item.salePrice < item.price;
  const discount = hasSale
    ? Math.round(((item.price - (item.salePrice ?? item.price)) / item.price) * 100)
    : 0;
  const itemTotal = effectivePrice * item.quantity;

  return {
    name,
    effectivePrice,
    hasSale,
    discount,
    itemTotal,
    originalPrice: item.price,
    quantity: item.quantity,
    imageUrl: item.imageUrl,
    sku: item.sku,
    stock: item.stock,
    isLowStock: item.stock <= 5 && item.stock > 0,
    isOutOfStock: item.stock === 0,
    canAddMore: item.quantity < item.stock,
  };
}

/**
 * Hook for cart totals calculation with delivery fee
 */
export function useCartTotals(deliveryFee: number = 0, freeDeliveryThreshold?: number) {
  const subtotal = useCartSubtotal();

  return useMemo(() => {
    const isFreeDelivery =
      freeDeliveryThreshold !== undefined && subtotal >= freeDeliveryThreshold;
    const actualDeliveryFee = isFreeDelivery ? 0 : deliveryFee;
    const total = subtotal + actualDeliveryFee;
    const amountUntilFreeDelivery = freeDeliveryThreshold
      ? Math.max(0, freeDeliveryThreshold - subtotal)
      : 0;

    return {
      subtotal,
      deliveryFee: actualDeliveryFee,
      total,
      isFreeDelivery,
      amountUntilFreeDelivery,
      hasItems: subtotal > 0,
    };
  }, [subtotal, deliveryFee, freeDeliveryThreshold]);
}

/**
 * Hook for cart drawer/modal state
 */
export function useCartDrawer() {
  const isOpen = useCartIsOpen();
  const { openCart, closeCart, toggleCart } = useCartActions();
  const itemCount = useCartItemCount();

  return {
    isOpen,
    open: openCart,
    close: closeCart,
    toggle: toggleCart,
    itemCount,
    hasItems: itemCount > 0,
  };
}

/**
 * Hook for clearing cart with confirmation
 */
export function useClearCart() {
  const { clearCart } = useCartActions();
  const itemCount = useCartItemCount();

  const clear = useCallback(
    (confirmed: boolean = true) => {
      if (confirmed && itemCount > 0) {
        clearCart();
        return true;
      }
      return false;
    },
    [clearCart, itemCount]
  );

  return {
    clear,
    itemCount,
    hasItems: itemCount > 0,
  };
}

/**
 * Format price in GEL (Georgian Lari)
 * Re-exported from store for convenience
 */
export { formatPrice, getEffectivePrice, canAddToCart } from '@/store/cart-store';

/**
 * Format price with locale
 */
export function formatPriceWithLocale(price: number, locale: Locale = 'ka'): string {
  const localeCode = locale === 'en' ? 'en-GE' : 'ka-GE';
  return new Intl.NumberFormat(localeCode, {
    style: 'currency',
    currency: 'GEL',
    minimumFractionDigits: 2,
  }).format(price);
}
