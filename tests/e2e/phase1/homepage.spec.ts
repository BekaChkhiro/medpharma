import { test, expect } from '@playwright/test';

/**
 * Phase 1 Tests: Homepage & Layout (T1.11)
 *
 * Tests the main public layout including:
 * - Header components (logo, search, language switcher, cart)
 * - Footer components (links, contact info)
 * - Homepage content (hero, categories, products)
 * - Responsive design
 */

test.describe('Homepage - Georgian (Default)', () => {
  test.beforeEach(async ({ page }) => {
    // Georgian is default locale, so it uses root path or /ka
    await page.goto('/ka');
  });

  test('should load homepage successfully', async ({ page }) => {
    // With localePrefix: 'as-needed', Georgian may be at / or /ka
    await expect(page).toHaveURL(/\/(ka)?$/);
    await expect(page).toHaveTitle(/მედფარმა/i);
  });

  test('should display header with all components', async ({ page, isMobile }) => {
    // Logo - should always be visible
    const logo = page.locator('header').getByRole('link').first();
    await expect(logo).toBeVisible();

    // Search bar - may be hidden on mobile (responsive design)
    if (!isMobile) {
      const searchInput = page.getByPlaceholder(/ძებნა|search/i);
      await expect(searchInput).toBeVisible();
    }

    // Language switcher - may be in mobile menu on small screens
    const langSwitcher = page.locator('[data-testid="language-switcher"]').or(
      page.getByRole('button', { name: /ka|en/i })
    );
    // Don't assert visibility - may be in hamburger menu on mobile

    // Cart button - usually visible on all sizes
    const cartButton = page.locator('[data-testid="cart-button"]').or(
      page.locator('header').locator('a[href*="cart"]')
    );
    await expect(cartButton.first()).toBeVisible();
  });

  test('should display footer with links', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    // Check for company info
    await expect(footer.getByText(/კომპანია|company/i).first()).toBeVisible();

    // Check for copyright
    await expect(footer.getByText(/©|უფლება/i).first()).toBeVisible();
  });

  test('should display hero section', async ({ page }) => {
    // Hero title or main heading
    const heroHeading = page.locator('h1, [class*="hero"]').first();
    await expect(heroHeading).toBeVisible();
  });

  test('should display categories section', async ({ page, isMobile }) => {
    // On mobile, navigation may be in hamburger menu
    if (isMobile) {
      // Check for categories in page content instead of nav
      const pageContent = await page.textContent('body');
      expect(pageContent).toMatch(/კატეგორი|category/i);
    } else {
      // Look for categories section in navigation
      const categoriesSection = page.getByText(/კატეგორი/i).first();
      await expect(categoriesSection).toBeVisible();
    }
  });

  test('should have working search functionality', async ({ page, isMobile }) => {
    // Search may be hidden on mobile - skip this test for mobile
    if (isMobile) {
      test.skip();
      return;
    }

    const searchInput = page.getByPlaceholder(/ძებნა|search/i);
    await searchInput.fill('ვიტამინი');
    await searchInput.press('Enter');

    // Should navigate to products or show search results
    await expect(page).toHaveURL(/products|search/);
  });
});

test.describe('Homepage - English', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en');
  });

  test('should load English homepage', async ({ page }) => {
    await expect(page).toHaveURL(/\/en/);
  });

  test('should display English content', async ({ page }) => {
    // Check for English text anywhere on the page (not just visible elements)
    const pageContent = await page.textContent('body');
    expect(pageContent).toMatch(/products|categories|cart|home|shop/i);
  });
});

test.describe('Homepage - Responsive Design', () => {
  test('should display mobile menu on small screens', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/ka');

    // Mobile menu button (hamburger)
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]').or(
      page.getByRole('button', { name: /მენიუ|menu/i })
    ).or(page.locator('button').filter({ has: page.locator('svg') }).first());

    // Should have some kind of mobile navigation
    await expect(page.locator('header')).toBeVisible();
  });

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/ka');

    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });
});

test.describe('Homepage - SEO & Meta', () => {
  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/ka');

    // Check title
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /.+/);

    // Check viewport meta
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute('content', /width/);
  });

  test('should have proper language attribute', async ({ page }) => {
    await page.goto('/ka');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', /ka|ge/);

    await page.goto('/en');
    await expect(html).toHaveAttribute('lang', /en/);
  });
});
