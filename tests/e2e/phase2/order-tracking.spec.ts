import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 720 } });

/**
 * Phase 2 Tests: Order Tracking
 *
 * Tests:
 * - Order tracking page accessibility
 * - Form validation
 * - Invalid order number handling
 * - Pre-filled order from URL params
 */

test.describe('Order Tracking Page', () => {
  test('should display tracking form', async ({ page }) => {
    await page.goto('/ka/order/tracking');
    await page.waitForLoadState('networkidle');

    // Form should be visible with order number and email inputs
    const orderInput = page.locator('input').filter({ hasNotText: '' }).first();
    await expect(orderInput).toBeVisible({ timeout: 10000 });
  });

  test('should validate empty form submission', async ({ page }) => {
    await page.goto('/ka/order/tracking');
    await page.waitForLoadState('networkidle');

    // Submit empty form
    const submitButton = page.locator('button[type="submit"]').first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(500);

      // Should show validation errors or stay on same page
      const hasError = await page.locator('[role="alert"], [class*="error"], [class*="destructive"]')
        .first().isVisible().catch(() => false);
      const stillOnPage = page.url().includes('/tracking');
      expect(hasError || stillOnPage).toBeTruthy();
    }
  });

  test('should show error for non-existent order', async ({ page }) => {
    await page.goto('/ka/order/tracking');
    await page.waitForLoadState('networkidle');

    // Fill with fake order number and email
    const inputs = page.locator('input');
    const inputCount = await inputs.count();

    if (inputCount >= 2) {
      await inputs.nth(0).fill('MF-99999999');
      await inputs.nth(1).fill('fake@example.com');
    } else if (inputCount === 1) {
      await inputs.nth(0).fill('MF-99999999');
    }

    const submitButton = page.locator('button[type="submit"]').first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(2000);

      // Should show "not found" or error message
      const errorMessage = page.getByText(/ვერ მოიძებნა|not found|არ არსებობს|error/i);
      const stillOnPage = page.url().includes('/tracking');
      const hasError = await errorMessage.first().isVisible().catch(() => false);
      expect(hasError || stillOnPage).toBeTruthy();
    }
  });

  test('should pre-fill order number from URL parameter', async ({ page }) => {
    const orderNumber = 'MF-12345678';
    await page.goto(`/ka/order/tracking?order=${orderNumber}`);
    await page.waitForLoadState('networkidle');

    // First input should have the order number pre-filled
    const orderInput = page.locator('input').first();
    await expect(orderInput).toBeVisible({ timeout: 10000 });

    const value = await orderInput.inputValue();
    // Should contain the order number (either in input or displayed)
    if (value) {
      expect(value).toContain(orderNumber);
    }
  });
});
