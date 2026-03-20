-- ============================================================================
-- GIN Full-Text Search Indexes for MedPharma Plus
-- Enables fast full-text search on products in both Georgian and English
-- ============================================================================

-- Enable pg_trgm extension for trigram-based similarity search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add tsvector column for full-text search (combines Georgian and English text)
ALTER TABLE "products" ADD COLUMN "search_vector" tsvector;

-- Create GIN index on the search vector for fast full-text search
CREATE INDEX "products_search_vector_idx" ON "products" USING GIN ("search_vector");

-- Create function to update search vector
-- Combines nameKa, nameEn, brand, manufacturer, activeIngredient, sku
CREATE OR REPLACE FUNCTION products_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', COALESCE(NEW."nameKa", '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW."nameEn", '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW."sku", '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW."brand", '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW."manufacturer", '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW."activeIngredient", '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW."shortDescKa", '')), 'C') ||
    setweight(to_tsvector('simple', COALESCE(NEW."shortDescEn", '')), 'C') ||
    setweight(to_tsvector('simple', COALESCE(NEW."barcode", '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update search vector on insert/update
CREATE TRIGGER products_search_vector_trigger
  BEFORE INSERT OR UPDATE ON "products"
  FOR EACH ROW
  EXECUTE FUNCTION products_search_vector_update();

-- Update existing products to populate search_vector (if any exist)
UPDATE "products" SET "search_vector" =
  setweight(to_tsvector('simple', COALESCE("nameKa", '')), 'A') ||
  setweight(to_tsvector('simple', COALESCE("nameEn", '')), 'A') ||
  setweight(to_tsvector('simple', COALESCE("sku", '')), 'A') ||
  setweight(to_tsvector('simple', COALESCE("brand", '')), 'B') ||
  setweight(to_tsvector('simple', COALESCE("manufacturer", '')), 'B') ||
  setweight(to_tsvector('simple', COALESCE("activeIngredient", '')), 'B') ||
  setweight(to_tsvector('simple', COALESCE("shortDescKa", '')), 'C') ||
  setweight(to_tsvector('simple', COALESCE("shortDescEn", '')), 'C') ||
  setweight(to_tsvector('simple', COALESCE("barcode", '')), 'D');

-- ============================================================================
-- GIN Indexes for Categories (for category name search)
-- ============================================================================

-- Add search_vector column for categories
ALTER TABLE "categories" ADD COLUMN "search_vector" tsvector;

-- Create GIN index on categories search vector
CREATE INDEX "categories_search_vector_idx" ON "categories" USING GIN ("search_vector");

-- Create function to update category search vector
CREATE OR REPLACE FUNCTION categories_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', COALESCE(NEW."nameKa", '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW."nameEn", '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW."descKa", '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW."descEn", '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for categories
CREATE TRIGGER categories_search_vector_trigger
  BEFORE INSERT OR UPDATE ON "categories"
  FOR EACH ROW
  EXECUTE FUNCTION categories_search_vector_update();

-- Update existing categories
UPDATE "categories" SET "search_vector" =
  setweight(to_tsvector('simple', COALESCE("nameKa", '')), 'A') ||
  setweight(to_tsvector('simple', COALESCE("nameEn", '')), 'A') ||
  setweight(to_tsvector('simple', COALESCE("descKa", '')), 'B') ||
  setweight(to_tsvector('simple', COALESCE("descEn", '')), 'B');

-- ============================================================================
-- GIN Indexes for Pages (for static page search)
-- ============================================================================

-- Add search_vector column for pages
ALTER TABLE "pages" ADD COLUMN "search_vector" tsvector;

-- Create GIN index on pages search vector
CREATE INDEX "pages_search_vector_idx" ON "pages" USING GIN ("search_vector");

-- Create function to update page search vector
CREATE OR REPLACE FUNCTION pages_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', COALESCE(NEW."titleKa", '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW."titleEn", '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW."contentKa", '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW."contentEn", '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for pages
CREATE TRIGGER pages_search_vector_trigger
  BEFORE INSERT OR UPDATE ON "pages"
  FOR EACH ROW
  EXECUTE FUNCTION pages_search_vector_update();

-- Update existing pages
UPDATE "pages" SET "search_vector" =
  setweight(to_tsvector('simple', COALESCE("titleKa", '')), 'A') ||
  setweight(to_tsvector('simple', COALESCE("titleEn", '')), 'A') ||
  setweight(to_tsvector('simple', COALESCE("contentKa", '')), 'B') ||
  setweight(to_tsvector('simple', COALESCE("contentEn", '')), 'B');

-- ============================================================================
-- Composite Indexes for Common Query Patterns
-- ============================================================================

-- Products: Active + Category (for catalog filtering)
CREATE INDEX "products_isActive_categoryId_idx" ON "products" ("isActive", "categoryId");

-- Products: Active + Featured (for homepage featured products)
CREATE INDEX "products_isActive_isFeatured_idx" ON "products" ("isActive", "isFeatured");

-- Products: Active + Sale (for sale products listing)
CREATE INDEX "products_isActive_salePrice_idx" ON "products" ("isActive") WHERE "salePrice" IS NOT NULL;

-- Products: Active + Stock (for in-stock filtering)
CREATE INDEX "products_isActive_stock_idx" ON "products" ("isActive", "stock");

-- Products: Active + Price Range (for price filtering)
CREATE INDEX "products_isActive_price_idx" ON "products" ("isActive", "price");

-- Products: Active + Brand (for brand filtering)
CREATE INDEX "products_isActive_brand_idx" ON "products" ("isActive", "brand") WHERE "brand" IS NOT NULL;

-- Products: Active + Dosage Form (for pharmaceutical filtering)
CREATE INDEX "products_isActive_dosageForm_idx" ON "products" ("isActive", "dosageForm") WHERE "dosageForm" IS NOT NULL;

-- Products: Active + Prescription Required (for OTC vs prescription filtering)
CREATE INDEX "products_isActive_requiresPrescription_idx" ON "products" ("isActive", "requiresPrescription");

-- Products: Active + Created (for new products sorting)
CREATE INDEX "products_isActive_createdAt_idx" ON "products" ("isActive", "createdAt" DESC);

-- Products: Active + Order Count (for popular products sorting)
CREATE INDEX "products_isActive_orderCount_idx" ON "products" ("isActive", "orderCount" DESC);

-- Orders: Status + Date (for admin order management)
CREATE INDEX "orders_status_createdAt_idx" ON "orders" ("status", "createdAt" DESC);

-- Orders: Payment Status + Date (for payment tracking)
CREATE INDEX "orders_paymentStatus_createdAt_idx" ON "orders" ("paymentStatus", "createdAt" DESC);

-- Orders: Customer lookup (email + phone combined)
CREATE INDEX "orders_customer_lookup_idx" ON "orders" ("customerEmail", "customerPhone");

-- Categories: Active + Sort (for menu display)
CREATE INDEX "categories_isActive_sortOrder_idx" ON "categories" ("isActive", "sortOrder");

-- Categories: Active + Parent (for hierarchical queries)
CREATE INDEX "categories_isActive_parentId_idx" ON "categories" ("isActive", "parentId");

-- Banners: Active + Date Range (for currently active banners)
CREATE INDEX "banners_active_period_idx" ON "banners" ("isActive", "startsAt", "endsAt");

-- ============================================================================
-- GIN Index for Order Number Prefix Search
-- ============================================================================

-- Create GIN index for order number pattern search (e.g., searching "MF-2026")
CREATE INDEX "orders_orderNumber_gin_idx" ON "orders" USING GIN ("orderNumber" gin_trgm_ops);

-- Create GIN index for customer name pattern search
CREATE INDEX "orders_customerName_gin_idx" ON "orders" USING GIN ("customerName" gin_trgm_ops);
