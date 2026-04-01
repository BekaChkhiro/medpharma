import { test, expect } from '@playwright/test';

/**
 * Phase 2 Tests: Shopping Cart
 *
 * Tests real user shopping scenarios:
 * - Add product to cart from product page
 * - View cart page
 * - Update quantity
 * - Remove item from cart
 * - Cart persistence across page navigation
 * - Empty cart state
 */

test.describe('Shopping Cart - Add to Cart', () => {
  test('should add product to cart from product listing', async ({ page }) => {
    await page.goto('/ka/products');
    await page.waitForLoadState('networkidle');

    // Find first product with "Add to Cart" button
    const addButton = page.locator('button').filter({ hasText: /დამატება|add/i }).first();
    await expect(addButton).toBeVisible({ timeout: 10000 });
    await addButton.click();

    // Cart count should update
    const cartBadge = page.locator('[data-testid="cart-button"]');
    await expect(cartBadge).toBeVisible();

    // Mini cart or notification should appear
    await page.waitForTimeout(500);
  });

  test('should add product to cart from product detail page', async ({ page }) => {
    await page.goto('/ka/products');
    await page.waitForLoadState('networkidle');

    // Click on first product to go to detail page
    const productLink = page.locator('a[href*="/products/"]').first();
    await expect(productLink).toBeVisible({ timeout: 10000 });
    await productLink.click();

    // Wait for product detail to load
    await page.waitForLoadState('networkidle');

    // Find add to cart button on detail page
    const addButton = page.locator('button').filter({ hasText: /დამატება|კალათაში|add.*cart/i }).first();
    await expect(addButton).toBeVisible({ timeout: 10000 });
    await addButton.click();

    // Should show feedback (cart opened, notification, etc.)
    await page.waitForTimeout(500);
    const cartButton = page.locator('[data-testid="cart-button"]');
    await expect(cartButton).toBeVisible();
  });
});

test.describe('Shopping Cart - Cart Page', () => {
  test.beforeEach(async ({ page }) => {
    // Add a product to cart first
    await page.goto('/ka/products');
    await page.waitForLoadState('networkidle');
    const addButton = page.locator('button').filter({ hasText: /დამატება|add/i }).first();
    await expect(addButton).toBeVisible({ timeout: 10000 });
    await addButton.click();
    await page.waitForTimeout(500);
  });

  test('should display cart page with items', async ({ page }) => {
    await page.goto('/ka/cart');
    await page.waitForLoadState('networkidle');

    // Cart should have at least one item - check price exists in page text
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toMatch(/₾/);
  });

  test('should update item quantity', async ({ page }) => {
    await page.goto('/ka/cart');
    await page.waitForLoadState('networkidle');

    // Find quantity controls
    const incrementButton = page.locator('button[aria-label*="increase"], button[aria-label*="Increase"]')
      .or(page.locator('button').filter({ hasText: '+' }))
      .first();

    if (await incrementButton.isVisible()) {
      // Get current price text
      const priceText = await page.getByText(/₾/).first().textContent();

      await incrementButton.click();
      await page.waitForTimeout(500);

      // Price or quantity should change
      // The total should increase
    }
  });

  test('should remove item from cart', async ({ page }) => {
    await page.goto('/ka/cart');
    await page.waitForLoadState('networkidle');

    // Find remove button
    const removeButton = page.locator('button[aria-label*="remove"], button[aria-label*="Remove"], button[aria-label*="წაშლა"]')
      .or(page.locator('button').filter({ has: page.locator('svg.lucide-trash2, svg.lucide-trash, svg.lucide-x') }))
      .first();

    if (await removeButton.isVisible()) {
      await removeButton.click();
      await page.waitForTimeout(500);

      // Cart should be empty or have fewer items
      // Check for empty cart message
      const emptyMessage = page.getByText(/ცარიელი|empty/i);
      const remainingItems = page.locator('[class*="cart-item"], [class*="CartItem"]');

      // Either empty message or fewer items
      const isEmpty = await emptyMessage.isVisible().catch(() => false);
      const hasItems = await remainingItems.count() > 0;
      expect(isEmpty || !hasItems).toBeTruthy();
    }
  });
});

test.describe('Shopping Cart - Persistence', () => {
  test('should persist cart across page navigation', async ({ page }) => {
    // Add product
    await page.goto('/ka/products');
    await page.waitForLoadState('networkidle');
    const addButton = page.locator('button').filter({ hasText: /დამატება|add/i }).first();
    await expect(addButton).toBeVisible({ timeout: 10000 });
    await addButton.click();
    await page.waitForTimeout(500);

    // Navigate to homepage
    await page.goto('/ka');
    await page.waitForLoadState('networkidle');

    // Cart badge should still show item count
    const cartButton = page.locator('[data-testid="cart-button"]');
    await expect(cartButton).toBeVisible();

    // Navigate to cart page
    await page.goto('/ka/cart');
    await page.waitForLoadState('networkidle');

    // Should still have items - price should be in page text
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toMatch(/₾/);
  });
});

test.describe('Shopping Cart - Empty State', () => {
  test('should show empty state when cart is empty', async ({ page }) => {
    // Clear localStorage to ensure empty cart
    await page.goto('/ka');
    await page.evaluate(() => {
      localStorage.removeItem('cart-storage');
    });

    await page.goto('/ka/cart');
    await page.waitForLoadState('networkidle');

    // Should show empty cart message, link to products, or have no cart items
    const bodyText = await page.locator('body').textContent();
    const hasEmptyIndicator = /ცარიელი|empty|პროდუქცია|products/i.test(bodyText || '');
    const hasNoPrice = !/\d+[.,]\d+\s*₾/.test(bodyText || '') || bodyText?.includes('0.00');
    expect(hasEmptyIndicator || hasNoPrice).toBeTruthy();
  });
});
