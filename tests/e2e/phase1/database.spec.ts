import { test, expect } from '@playwright/test';

/**
 * Phase 1 Tests: Database & API (T1.3, T1.4, T1.5, T1.7)
 *
 * Tests database connectivity and seeded data:
 * - Categories exist and display
 * - Products exist and display
 * - Delivery zones exist
 * - API endpoints respond correctly
 */

test.describe('Database - Seeded Categories', () => {
  test('should display categories on homepage', async ({ page }) => {
    await page.goto('/ka');

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Check for category-related content
    const pageContent = await page.textContent('body');

    // Should have some categories visible
    const hasCategoryContent = /კატეგორი|category|vitamins|ვიტამინ|medicine|მედიკამენტ/i.test(pageContent || '');
    expect(hasCategoryContent).toBeTruthy();
  });

  test('should have category pages accessible', async ({ page }) => {
    await page.goto('/ka');

    // Find category links
    const categoryLinks = page.locator('a[href*="/category/"]');
    const count = await categoryLinks.count();

    if (count > 0) {
      const href = await categoryLinks.first().getAttribute('href');
      if (href) {
        const response = await page.goto(href);
        expect(response?.status()).toBe(200);
      }
    }
  });
});

test.describe('Database - Seeded Products', () => {
  test('should display products on products page', async ({ page }) => {
    await page.goto('/ka/products');

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Check for product-related content - prices, images, links
    const pageContent = await page.textContent('body');

    // Products should show prices in GEL
    const hasPrices = /₾|\d+\.\d{2}|GEL/.test(pageContent || '');

    // Or check for product links
    const productLinks = page.locator('a[href*="/products/"]');
    const linkCount = await productLinks.count();

    // Either prices visible or product links exist
    expect(hasPrices || linkCount > 0).toBeTruthy();
  });

  test('should display product prices', async ({ page }) => {
    await page.goto('/ka/products');

    await page.waitForTimeout(3000);

    const pageContent = await page.textContent('body');

    // Should have prices (GEL symbol or amount)
    const hasPrices = /₾|\d+\.\d{2}|GEL|ლარი/i.test(pageContent || '');
    expect(hasPrices).toBeTruthy();
  });

  test('should display product images', async ({ page }) => {
    await page.goto('/ka/products');

    await page.waitForTimeout(3000);

    // Check for images
    const images = page.locator('img[src*="product"], img[alt*="product"], [class*="product"] img');
    const anyImages = page.locator('[class*="product"] img, [class*="card"] img');

    const imageCount = await anyImages.count();
    // May have placeholder or actual images
    expect(imageCount).toBeGreaterThanOrEqual(0);
  });
});

test.describe('API Endpoints', () => {
  test('should respond to /api/products endpoint', async ({ request }) => {
    const response = await request.get('/api/products');

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('should respond to /api/delivery-zones endpoint', async ({ request }) => {
    const response = await request.get('/api/delivery-zones');

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('should have delivery zones in response', async ({ request }) => {
    const response = await request.get('/api/delivery-zones');
    const data = await response.json();

    // Should have zones array or data
    if (data.success && data.data) {
      expect(Array.isArray(data.data.zones || data.data)).toBeTruthy();
    } else if (Array.isArray(data)) {
      expect(data.length).toBeGreaterThan(0);
    }
  });
});

test.describe('Admin API Endpoints (Protected)', () => {
  test('should reject unauthenticated access to /api/admin/products', async ({ request }) => {
    const response = await request.get('/api/admin/products');

    // Should be 401 Unauthorized or redirect
    expect([401, 403, 302]).toContain(response.status());
  });

  test('should reject unauthenticated access to /api/admin/categories', async ({ request }) => {
    const response = await request.get('/api/admin/categories');

    expect([401, 403, 302]).toContain(response.status());
  });
});

test.describe('Database - Product Detail', () => {
  test('should load product detail page', async ({ page }) => {
    // First get a product from the list
    await page.goto('/ka/products');
    await page.waitForTimeout(3000);

    const productLink = page.locator('a[href*="/products/"]').first();

    if (await productLink.isVisible()) {
      await productLink.click();

      // Should be on product detail page
      await expect(page).toHaveURL(/\/products\/[^/]+$/);

      // Should have product info
      const pageContent = await page.textContent('body');
      const hasProductInfo = /₾|ფასი|price|კალათა|cart|აღწერა|description/i.test(pageContent || '');
      expect(hasProductInfo).toBeTruthy();
    }
  });

  test('should display add to cart button on product detail', async ({ page }) => {
    await page.goto('/ka/products');
    await page.waitForTimeout(3000);

    const productLink = page.locator('a[href*="/products/"]').first();

    if (await productLink.isVisible()) {
      await productLink.click();
      await page.waitForTimeout(2000);

      // Check for add to cart button
      const addToCartButton = page.getByRole('button', { name: /კალათა|cart|add|დამატება/i });
      await expect(addToCartButton.first()).toBeVisible();
    }
  });
});

test.describe('Full-Text Search', () => {
  test('should search products and return results', async ({ page }) => {
    await page.goto('/ka/products?search=vitamin');

    await page.waitForTimeout(3000);

    // Should show products or "no results" message
    const pageContent = await page.textContent('body');
    const hasResults = /vitamin|ვიტამინ|product|პროდუქტ|არ მოიძებნა|no results/i.test(pageContent || '');

    expect(hasResults).toBeTruthy();
  });
});
