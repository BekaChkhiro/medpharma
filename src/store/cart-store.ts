/**
 * Cart store using Zustand with localStorage persistence
 * T3.1: Full implementation with add, remove, update quantity, clear, cart count
 */

import { useCallback, useMemo, useSyncExternalStore } from 'react';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

// Cart item type
export interface CartItem {
  productId: string;
  nameKa: string;
  nameEn: string;
  price: number;
  salePrice?: number | null;
  imageUrl?: string | null;
  quantity: number;
  stock: number;
  sku: string;
}

// Cart state interface
interface CartState {
  items: CartItem[];
  isOpen: boolean;
  _hasHydrated: boolean;
}

// Cart actions interface
interface CartActions {
  // Item management
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  // Cart drawer/modal state
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Getters (computed values)
  getItemCount: () => number;
  getSubtotal: () => number;
  getItemByProductId: (productId: string) => CartItem | undefined;
  isInCart: (productId: string) => boolean;
}

// Combined store type
export type CartStore = CartState & CartActions;

// Initial state
const initialState: CartState = {
  items: [],
  isOpen: false,
  _hasHydrated: false,
};

// Store reference holder - gets set after store creation to avoid TDZ issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let storeApi: any = null;

// Create the cart store with persist middleware
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // State
      ...initialState,

      // Add item to cart
      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find(
            (i) => i.productId === item.productId
          );

          if (existingItem) {
            // Update quantity if item already exists
            const newQuantity = existingItem.quantity + 1;
            // Don't exceed stock
            if (newQuantity > item.stock) {
              return state;
            }

            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: newQuantity }
                  : i
              ),
            };
          }

          // Add new item with quantity 1
          return {
            items: [...state.items, { ...item, quantity: 1 }],
          };
        });
      },

      // Remove item from cart
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },

      // Update item quantity
      updateQuantity: (productId, quantity) => {
        set((state) => {
          // If quantity is 0 or less, remove the item
          if (quantity <= 0) {
            return {
              items: state.items.filter((item) => item.productId !== productId),
            };
          }

          return {
            items: state.items.map((item) => {
              if (item.productId === productId) {
                // Don't exceed stock
                const newQuantity = Math.min(quantity, item.stock);
                return { ...item, quantity: newQuantity };
              }
              return item;
            }),
          };
        });
      },

      // Clear all items from cart
      clearCart: () => {
        set({ items: [] });
      },

      // Cart drawer/modal controls
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      // Get total item count (sum of all quantities)
      getItemCount: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      // Get cart subtotal (before delivery fees)
      getSubtotal: () => {
        const { items } = get();
        return items.reduce((total, item) => {
          const price = item.salePrice ?? item.price;
          return total + price * item.quantity;
        }, 0);
      },

      // Get a specific item by product ID
      getItemByProductId: (productId) => {
        const { items } = get();
        return items.find((item) => item.productId === productId);
      },

      // Check if a product is in the cart
      isInCart: (productId) => {
        const { items } = get();
        return items.some((item) => item.productId === productId);
      },
    }),
    {
      name: 'medpharma-cart', // localStorage key
      storage: createJSONStorage(() => {
        // Return a no-op storage during SSR to prevent errors
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      // Only persist items, not the isOpen state or hydration flag
      partialize: (state) => ({ items: state.items }),
      // Set hydrated flag when rehydration completes
      onRehydrateStorage: () => {
        return (rehydratedState, error) => {
          if (error) {
            console.error('Failed to rehydrate cart store:', error);
          }
          // Defer setting hydrated state to avoid TDZ (temporal dead zone) issues
          // By the time queueMicrotask runs, storeApi will be set
          queueMicrotask(() => {
            if (storeApi) {
              storeApi.setState({ _hasHydrated: true });
            }
          });
        };
      },
    }
  )
);

// Set the store reference after initialization to avoid TDZ issues in onRehydrateStorage
storeApi = useCartStore;

// Hook to check if the store has been hydrated from localStorage
// Uses useSyncExternalStore for proper caching and avoiding infinite loops
export const useHasHydrated = () => {
  const subscribe = useCallback(
    (onStoreChange: () => void) => useCartStore.subscribe(onStoreChange),
    []
  );

  const getSnapshot = useCallback(
    () => useCartStore.getState()._hasHydrated,
    []
  );

  // Server snapshot always returns false to prevent hydration mismatch
  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};

// Stable empty array reference for SSR
const EMPTY_CART_ITEMS: CartItem[] = [];

// Selector hooks for optimized re-renders (hydration-safe)
export const useCartItems = () => {
  const hasHydrated = useHasHydrated();
  const items = useCartStore((state) => state.items);
  // Return stable empty array during SSR/hydration to avoid mismatch
  return hasHydrated ? items : EMPTY_CART_ITEMS;
};

export const useCartIsOpen = () => useCartStore((state) => state.isOpen);

export const useCartItemCount = () => {
  const hasHydrated = useHasHydrated();
  const items = useCartStore((state) => state.items);
  // Memoize the count calculation
  const count = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items]
  );
  // Return 0 during SSR/hydration to avoid mismatch
  return hasHydrated ? count : 0;
};

export const useCartSubtotal = () => {
  const hasHydrated = useHasHydrated();
  const items = useCartStore((state) => state.items);
  // Memoize the subtotal calculation
  const subtotal = useMemo(
    () =>
      items.reduce((total, item) => {
        const price = item.salePrice ?? item.price;
        return total + price * item.quantity;
      }, 0),
    [items]
  );
  // Return 0 during SSR/hydration to avoid mismatch
  return hasHydrated ? subtotal : 0;
};

// Actions hooks (using useShallow to prevent unnecessary re-renders)
export const useCartActions = () =>
  useCartStore(
    useShallow((state) => ({
      addItem: state.addItem,
      removeItem: state.removeItem,
      updateQuantity: state.updateQuantity,
      clearCart: state.clearCart,
      openCart: state.openCart,
      closeCart: state.closeCart,
      toggleCart: state.toggleCart,
    }))
  );

// Utility function to check if item can be added (stock check)
export const canAddToCart = (item: CartItem, quantityToAdd: number = 1): boolean => {
  return item.quantity + quantityToAdd <= item.stock;
};

// Get effective price (sale price or regular price)
export const getEffectivePrice = (item: CartItem): number => {
  return item.salePrice ?? item.price;
};

// Format price in GEL (Georgian Lari)
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ka-GE', {
    style: 'currency',
    currency: 'GEL',
    minimumFractionDigits: 2,
  }).format(price);
};
