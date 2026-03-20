/**
 * Application constants
 */

// Site info
export const SITE_NAME = 'MedPharma Plus';
export const SITE_NAME_KA = 'მედფარმა პლუსი';
export const SITE_DESCRIPTION = 'Your trusted online pharmacy';
export const SITE_DESCRIPTION_KA = 'თქვენი სანდო ონლაინ აფთიაქი';

// Supported locales
export const LOCALES = ['ka', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'ka';

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Order statuses
export const ORDER_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export type OrderStatus = (typeof ORDER_STATUSES)[keyof typeof ORDER_STATUSES];

// Payment statuses
export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES];

// Payment methods
export const PAYMENT_METHODS = {
  TBC: 'tbc',
  BOG: 'bog',
  CASH: 'cash',
} as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];

// Admin roles
export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
} as const;

export type AdminRole = (typeof ADMIN_ROLES)[keyof typeof ADMIN_ROLES];

// Product dosage forms
export const DOSAGE_FORMS = [
  'tablet',
  'capsule',
  'syrup',
  'injection',
  'cream',
  'ointment',
  'drops',
  'spray',
  'powder',
  'solution',
  'suppository',
  'patch',
  'inhaler',
  'other',
] as const;

export type DosageForm = (typeof DOSAGE_FORMS)[number];

// Image sizes
export const IMAGE_SIZES = {
  THUMBNAIL: { width: 150, height: 150 },
  SMALL: { width: 300, height: 300 },
  MEDIUM: { width: 600, height: 600 },
  LARGE: { width: 1200, height: 1200 },
} as const;

// API routes
export const API_ROUTES = {
  PRODUCTS: '/api/products',
  CATEGORIES: '/api/categories',
  ORDERS: '/api/orders',
  UPLOAD: '/api/upload',
  AUTH: '/api/auth',
  PAYMENT: {
    TBC: '/api/payment/tbc',
    BOG: '/api/payment/bog',
  },
} as const;

// External URLs
export const EXTERNAL_URLS = {
  TBC_PAYMENT: process.env.NEXT_PUBLIC_TBC_PAYMENT_URL || 'https://ecommerce.ufc.ge',
  BOG_PAYMENT: process.env.NEXT_PUBLIC_BOG_PAYMENT_URL || 'https://ipay.ge',
} as const;

// Validation limits
export const VALIDATION = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  PHONE_PATTERN: /^\+?995\d{9}$|^5\d{8}$/,
  EMAIL_MAX_LENGTH: 255,
  ADDRESS_MAX_LENGTH: 500,
  DESCRIPTION_MAX_LENGTH: 5000,
  SKU_MAX_LENGTH: 50,
  MIN_PRICE: 0,
  MAX_PRICE: 1000000,
  MAX_CART_QUANTITY: 99,
} as const;
