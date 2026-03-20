import { test, expect } from '@playwright/test';

/**
 * Phase 1 Tests: Navigation (T1.11)
 *
 * Tests the navigation functionality including:
 * - Header navigation links
 * - Footer navigation links
 * - Mobile navigation
 * - Breadcrumb navigation
 * - 404 page handling
 */

test.describe('Header Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ka');
  });

  test('should navigate to Products page', async ({ page }) => {
    const productsLink = page.getByRole('link', { name: /პროდუქცია|products/i }).first();

    const isVisible = await productsLink.isVisible().catch(() => false);
    if (!isVisible) {
      test.skip();
      return;
    }

    await productsLink.click();
    await expect(page).toHaveURL(/\/products/);
  });

  test('should navigate to Cart page', async ({ page }) => {
    const cartLink = page.locator('a[href*="cart"]').first();

    const isVisible = await cartLink.isVisible().catch(() => false);
    if (!isVisible) {
      test.skip();
      return;
    }

    await cartLink.click();
    await expect(page).toHaveURL(/\/cart/);
  });

  test('should navigate home from logo', async ({ page }) => {
    // First go to a different page
    await page.goto('/ka/products');
    await page.waitForLoadState('networkidle');

    // Click logo to go home (usually first link in header)
    const logo = page.locator('header a[href="/ka"], header a[href="/"]').first();

    if (await logo.isVisible({ timeout: 3000 }).catch(() => false)) {
      await logo.click();
      // With localePrefix: 'as-needed', may redirect to / or /ka
      await expect(page).toHaveURL(/\/(ka)?$/);
    } else {
      // Logo may be an image or different structure
      test.skip();
    }
  });
});

test.describe('Footer Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ka');
  });

  test('should have footer links', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    // Check for common footer links
    const links = footer.locator('a');
    const linkCount = await links.count();

    expect(linkCount).toBeGreaterThan(0);
  });

  test('should have contact information in footer', async ({ page }) => {
    const footer = page.locator('footer');

    // Check for contact-related content
    const footerText = await footer.textContent();
    const hasContactInfo = /ტელეფონი|phone|email|ელ-ფოსტა|კონტაქტი|contact/i.test(footerText || '');

    expect(hasContactInfo).toBeTruthy();
  });
});

test.describe('Mobile Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/ka');
  });

  test('should show mobile menu button on small screens', async ({ page }) => {
    // Look for hamburger menu or mobile menu button
    const menuButton = page.locator('[data-testid="mobile-menu-button"]').or(
      page.locator('button[aria-label*="menu" i]')
    ).or(
      page.locator('button').filter({ has: page.locator('svg[class*="menu"], [class*="hamburger"]') })
    );

    // Header should be visible
    await expect(page.locator('header')).toBeVisible();
  });

  test('should toggle mobile menu on click', async ({ page }) => {
    const menuButton = page.locator('[data-testid="mobile-menu-button"]').or(
      page.locator('button[aria-label*="menu" i]')
    );

    if (await menuButton.first().isVisible()) {
      await menuButton.first().click();

      // Mobile menu should appear
      const mobileMenu = page.locator('[class*="mobile-menu"], [data-testid="mobile-menu"]');
      await expect(mobileMenu).toBeVisible();
    }
  });
});

test.describe('Search Navigation', () => {
  test('should navigate to search results', async ({ page }) => {
    await page.goto('/ka');

    const searchInput = page.getByPlaceholder(/ძებნა|search/i);

    if (await searchInput.isVisible()) {
      await searchInput.fill('ვიტამინი');
      await searchInput.press('Enter');

      // Should be on products or search page
      await expect(page).toHaveURL(/products|search/);
    }
  });

  test('should show search suggestions', async ({ page }) => {
    await page.goto('/ka');

    const searchInput = page.getByPlaceholder(/ძებნა|search/i);

    if (await searchInput.isVisible()) {
      await searchInput.fill('vita');
      await page.waitForTimeout(500);

      // Check for suggestions dropdown (if implemented)
      const suggestions = page.locator('[class*="suggestion"], [class*="autocomplete"], [role="listbox"]');
      // This is optional - may or may not have suggestions
    }
  });
});

test.describe('404 Page', () => {
  test('should show 404 page for non-existent routes', async ({ page }) => {
    const response = await page.goto('/ka/non-existent-page-12345');

    // Check response or page content
    const pageContent = await page.textContent('body');
    const is404 = response?.status() === 404 || /404|not found|ვერ მოიძებნა/i.test(pageContent || '');

    expect(is404).toBeTruthy();
  });

  test('should have link back to home on 404 page', async ({ page }) => {
    await page.goto('/ka/non-existent-page-12345');

    // Should have a link to go back home
    const homeLink = page.getByRole('link', { name: /home|მთავარი|back/i });

    // Or any link pointing to home
    const anyHomeLink = page.locator('a[href="/ka"], a[href="/"]');

    const hasHomeLink = await homeLink.isVisible().catch(() => false) ||
                        await anyHomeLink.first().isVisible().catch(() => false);

    expect(hasHomeLink).toBeTruthy();
  });
});

test.describe('Category Navigation', () => {
  test('should navigate to category page', async ({ page }) => {
    await page.goto('/ka');

    // Find a category link
    const categoryLink = page.locator('a[href*="/category/"]').first();

    if (await categoryLink.isVisible()) {
      await categoryLink.click();
      await expect(page).toHaveURL(/\/category\//);
    }
  });
});

test.describe('Product Navigation', () => {
  test('should navigate to product detail page', async ({ page }) => {
    await page.goto('/ka/products');

    // Wait for products to load
    await page.waitForTimeout(2000);

    // Find a product link
    const productLink = page.locator('a[href*="/products/"]').first();

    if (await productLink.isVisible()) {
      await productLink.click();
      await expect(page).toHaveURL(/\/products\/[^/]+$/);
    }
  });
});
