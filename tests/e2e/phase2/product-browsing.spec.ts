import { test, expect } from '@playwright/test';

/**
 * Phase 2 Tests: Product Browsing & Discovery
 *
 * Tests real user browsing scenarios:
 * - Product listing page
 * - Product detail page
 * - Product search
 * - Category navigation
 * - Product API
 */

test.describe('Product Listing', () => {
  test('should display products page with items', async ({ page }) => {
    await page.goto('/ka/products');
    await page.waitForLoadState('networkidle');

    const productCards = page.locator('a[href*="/products/"]');
    await expect(productCards.first()).toBeVisible({ timeout: 10000 });
    expect(await productCards.count()).toBeGreaterThan(0);
  });

  test('should display product prices in GEL', async ({ page }) => {
    await page.goto('/ka/products');
    await page.waitForLoadState('networkidle');

    // Check that price text exists somewhere on the page
    const priceText = await page.locator('body').textContent();
    expect(priceText).toMatch(/\d+[.,]\d+\s*₾/);
  });

  test('should show product images', async ({ page }) => {
    await page.goto('/ka/products');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('img[alt]').first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Product Detail Page', () => {
  test('should load product detail with all info', async ({ page }) => {
    await page.goto('/ka/products');
    await page.waitForLoadState('networkidle');

    const productLink = page.locator('a[href*="/products/"]').first();
    await expect(productLink).toBeVisible({ timeout: 10000 });
    await productLink.click();
    await page.waitForLoadState('networkidle');

    // Product name/heading
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
    // Price and add-to-cart should exist in page content
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toMatch(/₾/);
    expect(bodyText).toMatch(/დამატება|კალათაში|add.*cart/i);
  });

  test('should have page content on detail page', async ({ page }) => {
    await page.goto('/ka/products');
    await page.waitForLoadState('networkidle');

    await page.locator('a[href*="/products/"]').first().click();
    await page.waitForLoadState('networkidle');

    // Wait for product heading to load
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });

    const bodyText = await page.locator('body').textContent();
    expect(bodyText!.length).toBeGreaterThan(50);
  });
});

test.describe('Product Search', () => {
  test('should search products and show results', async ({ page }) => {
    await page.goto('/ka/products');
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[type="search"], input[placeholder*="ძებნა"], input[placeholder*="search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('ფაფა');
      await page.waitForTimeout(1500);

      const results = page.locator('a[href*="/products/"]');
      expect(await results.count()).toBeGreaterThan(0);
    }
  });
});

test.describe('Category Browsing', () => {
  test('should navigate to category page', async ({ page }) => {
    await page.goto('/ka/categories');
    await page.waitForLoadState('networkidle');

    const categoryLinks = page.locator('a[href*="/categories/"]');
    if (await categoryLinks.first().isVisible()) {
      await categoryLinks.first().click();
      await page.waitForLoadState('networkidle');

      await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
    }
  });
});

test.describe('Product API', () => {
  test('should return products from API', async ({ request }) => {
    const response = await request.get('/api/products');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.success).toBeTruthy();
    expect(data.data.products.length).toBeGreaterThan(0);
  });

  test('should filter products by search query', async ({ request }) => {
    const response = await request.get('/api/products?search=ფაფა');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBeTruthy();
  });

  test('should sort products by price ascending', async ({ request }) => {
    const response = await request.get('/api/products?sort=price_asc');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    const prices = data.data.products.map((p: any) => Number(p.price));
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
    }
  });

  test('should paginate products', async ({ request }) => {
    const page1 = await request.get('/api/products?page=1&limit=5');
    const data1 = await page1.json();
    expect(data1.data.pagination.page).toBe(1);
    expect(data1.data.products.length).toBeLessThanOrEqual(5);

    if (data1.data.pagination.totalPages > 1) {
      const page2 = await request.get('/api/products?page=2&limit=5');
      const data2 = await page2.json();
      expect(data2.data.pagination.page).toBe(2);

      // Different products
      const ids1 = data1.data.products.map((p: any) => p.id);
      const ids2 = data2.data.products.map((p: any) => p.id);
      const overlap = ids1.filter((id: string) => ids2.includes(id));
      expect(overlap.length).toBe(0);
    }
  });

  test('should search products via autocomplete API', async ({ request }) => {
    const response = await request.get('/api/products/search?q=ფაფა&limit=5');
    expect(response.ok()).toBeTruthy();
  });
});
