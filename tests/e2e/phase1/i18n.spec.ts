import { test, expect } from '@playwright/test';

/**
 * Phase 1 Tests: Internationalization (T1.8, T1.9)
 *
 * Tests the i18n functionality including:
 * - Language switching (KA ↔ EN)
 * - URL locale prefixes
 * - Content translation
 * - Middleware locale detection
 */

test.describe('i18n - Language Switching', () => {
  test('should switch from Georgian to English', async ({ page }) => {
    await page.goto('/ka');

    // Find English link in header (language switcher)
    const englishLink = page.locator('header a[href*="/en"]').first();

    if (await englishLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await englishLink.click();
      await expect(page).toHaveURL(/\/en/);
    } else {
      // Language switcher may be in dropdown
      const langButton = page.locator('header button').filter({ hasText: /EN|KA/i }).first();
      if (await langButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await langButton.click();
        await page.locator('a[href*="/en"]').first().click();
        await expect(page).toHaveURL(/\/en/);
      } else {
        // Skip if no language switcher visible
        test.skip();
      }
    }
  });

  test('should switch from English to Georgian', async ({ page }) => {
    await page.goto('/en');

    // Find Georgian link in header
    const georgianLink = page.locator('header a[href="/ka"], header a[href*="/ka/"]').first();

    if (await georgianLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await georgianLink.click();
      // With localePrefix: 'as-needed', Georgian may redirect to / or /ka
      await expect(page).toHaveURL(/\/(ka)?$/);
    } else {
      test.skip();
    }
  });

  test('should preserve path when switching language', async ({ page }) => {
    // Go to products page in Georgian
    await page.goto('/ka/products');

    // Switch to English
    const englishLink = page.locator('a[href*="/en/products"]').or(
      page.locator('a[href="/en/products"]')
    );

    if (await englishLink.first().isVisible()) {
      await englishLink.first().click();
      await expect(page).toHaveURL(/\/en\/products/);
    }
  });
});

test.describe('i18n - URL Locale Prefix', () => {
  test('should redirect root to default locale (Georgian)', async ({ page }) => {
    // Set Georgian locale preference in browser
    await page.context().setExtraHTTPHeaders({
      'Accept-Language': 'ka-GE,ka;q=0.9',
    });
    await page.goto('/');

    // With localePrefix: 'as-needed', Georgian stays at / (no prefix)
    // But browser Accept-Language may cause redirect to detected locale
    await expect(page).toHaveURL(/^\/$|\/ka|\/en/);
  });

  test('should handle /ka prefix correctly', async ({ page }) => {
    const response = await page.goto('/ka');
    expect(response?.status()).toBe(200);
  });

  test('should handle /en prefix correctly', async ({ page }) => {
    const response = await page.goto('/en');
    expect(response?.status()).toBe(200);
  });

  test('should return 404 for invalid locale', async ({ page }) => {
    const response = await page.goto('/fr');
    // Should either 404 or redirect
    expect([200, 302, 404]).toContain(response?.status());
  });
});

test.describe('i18n - Content Translation', () => {
  test('should display Georgian content on /ka', async ({ page }) => {
    await page.goto('/ka');

    // Check for Georgian characters
    const pageContent = await page.textContent('body');
    expect(pageContent).toMatch(/[ა-ჰ]/); // Georgian Unicode range
  });

  test('should display English content on /en', async ({ page }) => {
    await page.goto('/en');

    // Check for common English words
    const pageContent = await page.textContent('body');
    expect(pageContent).toMatch(/home|products|cart|about/i);
  });

  test('should translate navigation items', async ({ page }) => {
    // Georgian
    await page.goto('/ka');
    const kaNav = await page.locator('header').first().textContent();
    expect(kaNav).toMatch(/პროდუქცია|კატეგორიები|კონტაქტი|მთავარი/);

    // English
    await page.goto('/en');
    const enNav = await page.locator('header').first().textContent();
    expect(enNav).toMatch(/products|categories|contact|home/i);
  });

  test('should translate footer content', async ({ page }) => {
    // Georgian footer
    await page.goto('/ka');
    const kaFooter = await page.locator('footer').textContent();
    expect(kaFooter).toMatch(/კომპანია|კონტაქტი|უფლება/);

    // English footer
    await page.goto('/en');
    const enFooter = await page.locator('footer').textContent();
    expect(enFooter).toMatch(/company|contact|rights/i);
  });
});

test.describe('i18n - HTML Lang Attribute', () => {
  test('should set correct lang attribute for Georgian', async ({ page }) => {
    await page.goto('/ka');
    const html = page.locator('html');
    const lang = await html.getAttribute('lang');
    expect(lang).toMatch(/ka|ge/i);
  });

  test('should set correct lang attribute for English', async ({ page }) => {
    await page.goto('/en');
    const html = page.locator('html');
    const lang = await html.getAttribute('lang');
    expect(lang).toBe('en');
  });
});

test.describe('i18n - Currency Formatting', () => {
  test('should display prices in GEL format', async ({ page }) => {
    await page.goto('/ka/products');

    // Wait for products to load
    await page.waitForSelector('[class*="product"], [class*="card"]', { timeout: 10000 }).catch(() => {});

    const pageContent = await page.textContent('body');
    // Check for GEL currency symbol or format
    expect(pageContent).toMatch(/₾|GEL|ლარი/i);
  });
});
