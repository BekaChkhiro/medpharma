/**
 * Common TypeScript types
 */

import {
  type AdminRole,
  type DosageForm,
  type OrderStatus,
  type PaymentStatus,
} from '@/lib/constants';

// Base entity with timestamps
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Bilingual text fields
export interface BilingualText {
  ka: string;
  en: string;
}

// Category
export interface Category extends BaseEntity {
  nameKa: string;
  nameEn: string;
  slug: string;
  descriptionKa?: string;
  descriptionEn?: string;
  imageUrl?: string;
  parentId?: string;
  sortOrder: number;
  isActive: boolean;
  metaTitleKa?: string;
  metaTitleEn?: string;
  metaDescriptionKa?: string;
  metaDescriptionEn?: string;
}

// Product
export interface Product extends BaseEntity {
  nameKa: string;
  nameEn: string;
  slug: string;
  descriptionKa?: string;
  descriptionEn?: string;
  price: number;
  salePrice?: number;
  stock: number;
  sku: string;
  brand?: string;
  manufacturer?: string;
  dosageForm?: DosageForm;
  requiresPrescription: boolean;
  isFeatured: boolean;
  isActive: boolean;
  apexId?: string;
  categoryId: string;
  metaTitleKa?: string;
  metaTitleEn?: string;
  metaDescriptionKa?: string;
  metaDescriptionEn?: string;
  images?: ProductImage[];
}

// Product Image
export interface ProductImage extends BaseEntity {
  url: string;
  alt?: string;
  sortOrder: number;
  isPrimary: boolean;
  productId: string;
}

// Order
export interface Order extends BaseEntity {
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryCity: string;
  deliveryAddress: string;
  deliveryNotes?: string;
  deliveryFee: number;
  subtotal: number;
  total: number;
  items: OrderItem[];
}

// Order Item
export interface OrderItem {
  id: string;
  productId: string;
  productNameKa: string;
  productNameEn: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// Admin User
export interface AdminUser extends BaseEntity {
  email: string;
  name: string;
  role: AdminRole;
  isActive: boolean;
}

// Delivery Zone
export interface DeliveryZone extends BaseEntity {
  nameKa: string;
  nameEn: string;
  fee: number;
  minOrder: number;
  freeAbove?: number;
  isActive: boolean;
}

// Banner
export interface Banner extends BaseEntity {
  titleKa?: string;
  titleEn?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  link?: string;
  sortOrder: number;
  startsAt?: Date;
  endsAt?: Date;
  isActive: boolean;
}

// Static Page
export interface StaticPage extends BaseEntity {
  titleKa: string;
  titleEn: string;
  slug: string;
  bodyKa: string;
  bodyEn: string;
  isActive: boolean;
}

// Cart Item (for Zustand store)
export interface CartItem {
  productId: string;
  nameKa: string;
  nameEn: string;
  price: number;
  salePrice?: number;
  imageUrl?: string;
  quantity: number;
  stock: number;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

// Search/Filter params
export interface ProductFilters {
  search?: string;
  categoryId?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  dosageForm?: DosageForm;
  inStock?: boolean;
  isFeatured?: boolean;
  requiresPrescription?: boolean;
}
