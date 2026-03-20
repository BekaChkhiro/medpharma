/**
 * Custom hooks barrel export
 */

// Auth hooks
export { useAuth, useRequireAuth } from './use-auth';

// Cart hooks
export {
  useCart,
  useAddToCart,
  useCartItem,
  useIsInCart,
  useCartQuantity,
  useCartItemDisplay,
  useCartTotals,
  useCartDrawer,
  useClearCart,
  formatPrice,
  formatPriceWithLocale,
  getEffectivePrice,
  canAddToCart,
  type AddToCartProduct,
  type CartSummary,
} from './use-cart';
