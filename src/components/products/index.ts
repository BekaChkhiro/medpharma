/**
 * Products Components
 *
 * Public-facing product catalog components including
 * product cards, grids, filters, search, and pagination.
 */

export { ProductCard } from './product-card';
export { ProductGrid } from './product-grid';
export { ProductFilters, MobileFilters, type FilterState } from './product-filters';
export { ProductSort } from './product-sort';
export { ProductSearch } from './product-search';
export { ProductPagination } from './product-pagination';
export { ProductsCatalog } from './products-catalog';

// Product Detail
export { ProductDetailContent } from './product-detail';
export { ImageGallery } from './image-gallery';
export { ProductCarousel } from './product-carousel';
export { Breadcrumb, ProductBreadcrumb } from './breadcrumb';
export {
  ProductJsonLd,
  BreadcrumbJsonLd,
  CategoryJsonLd,
  OrganizationJsonLd,
  WebSiteJsonLd,
} from './product-json-ld';
