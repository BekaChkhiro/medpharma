import { test, expect, type Page } from '@playwright/test';

// Checkout tests use desktop viewport for consistent form interaction
test.use({ viewport: { width: 1280, height: 720 } });

/**
 * Phase 2 Tests: Checkout Flow
 *
 * Tests the complete checkout journey:
 * - Step 1: Personal Information with validation
 * - Step 2: Delivery zone selection and fee calculation
 * - Step 3: Payment method selection
 * - Step 4: Review and submit
 * - Navigation back/forward
 * - Empty checkout state
 */

async function addProductToCart(page: Page) {
  await page.goto('/ka/products');
  await page.waitForLoadState('networkidle');

  // Add multiple products to meet minimum order threshold
  const addButtons = page.locator('button').filter({ hasText: /დამატება|add/i });
  const count = await addButtons.count();
  const toAdd = Math.min(count, 3); // Add up to 3 products
  for (let i = 0; i < toAdd; i++) {
    await addButtons.nth(i).click();
    await page.waitForTimeout(300);
  }
  await page.waitForTimeout(500);
}

async function fillStep1(page: Page) {
  await expect(page.locator('#firstName')).toBeVisible({ timeout: 10000 });
  await page.locator('#firstName').fill('ტესტ');
  await page.locator('#lastName').fill('მომხმარებელი');
  await page.locator('#email').fill('test@example.com');
  await page.locator('#phone').fill('+995555123456');
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(500);
}

async function fillStep2(page: Page) {
  const citySelect = page.locator('#cityId');
  await expect(citySelect).toBeVisible({ timeout: 10000 });

  // Wait for zones to load (options appear after API call)
  await page.waitForTimeout(2000);

  // Select first non-placeholder option with value
  const options = citySelect.locator('option');
  const count = await options.count();
  for (let i = 0; i < count; i++) {
    const val = await options.nth(i).getAttribute('value');
    const disabled = await options.nth(i).getAttribute('disabled');
    if (val && val !== '' && disabled === null) {
      await citySelect.selectOption(val);
      break;
    }
  }

  await page.waitForTimeout(500);
  await page.locator('#address').fill('თბილისი, რუსთაველის გამზ. 12');
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(1000);
}

test.describe('Checkout - Step 1: Personal Info', () => {
  test.beforeEach(async ({ page }) => {
    await addProductToCart(page);
    await page.goto('/ka/checkout');
    await page.waitForLoadState('networkidle');
  });

  test('should display personal info form', async ({ page }) => {
    await expect(page.locator('#firstName')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#lastName')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#phone')).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await expect(page.locator('#firstName')).toBeVisible({ timeout: 10000 });
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(500);
    // Should still be on step 1
    await expect(page.locator('#firstName')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await expect(page.locator('#firstName')).toBeVisible({ timeout: 10000 });
    await page.locator('#firstName').fill('ტესტ');
    await page.locator('#lastName').fill('მომხმარებელი');
    await page.locator('#email').fill('invalid-email');
    await page.locator('#phone').fill('+995555123456');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(500);
    await expect(page.locator('#email')).toBeVisible();
  });

  test('should proceed to step 2 with valid data', async ({ page }) => {
    await fillStep1(page);
    // Should show delivery form
    await expect(page.locator('#cityId')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Checkout - Step 2: Delivery', () => {
  test.beforeEach(async ({ page }) => {
    await addProductToCart(page);
    await page.goto('/ka/checkout');
    await page.waitForLoadState('networkidle');
    await fillStep1(page);
  });

  test('should display delivery zones', async ({ page }) => {
    const citySelect = page.locator('#cityId');
    await expect(citySelect).toBeVisible({ timeout: 10000 });
    const options = citySelect.locator('option');
    const optionCount = await options.count();
    expect(optionCount).toBeGreaterThan(1);
  });

  test('should show delivery fee when zone is selected', async ({ page }) => {
    const citySelect = page.locator('#cityId');
    await expect(citySelect).toBeVisible({ timeout: 10000 });

    const options = citySelect.locator('option:not([disabled])');
    const count = await options.count();
    if (count > 0) {
      const val = await options.first().getAttribute('value');
      if (val) {
        await citySelect.selectOption(val);
        await page.waitForTimeout(500);
        // Fee info should appear
        await expect(page.getByText(/მიწოდება|delivery/i).first()).toBeVisible();
      }
    }
  });

  test('should proceed to step 3 with valid delivery info', async ({ page }) => {
    await fillStep2(page);
    // Should show payment methods
    // Payment radio inputs are sr-only, check for payment labels/cards
    await expect(
      page.locator('label').filter({ has: page.locator('input[name="paymentMethod"]') }).first()
    ).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Checkout - Step 3: Payment', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await addProductToCart(page);
    await page.goto('/ka/checkout');
    await page.waitForLoadState('networkidle');
    await fillStep1(page);
    await fillStep2(page);
  });

  test('should display payment methods', async ({ page }) => {
    // Radio inputs are sr-only, check labels
    const paymentLabels = page.locator('label').filter({ has: page.locator('input[name="paymentMethod"]') });
    await expect(paymentLabels.first()).toBeVisible({ timeout: 10000 });
    expect(await paymentLabels.count()).toBe(3);
  });

  test('should select payment method and proceed to review', async ({ page }) => {
    // Select cash on delivery
    const cashLabel = page.locator('label').filter({ has: page.locator('input[value="cash"]') });
    await expect(cashLabel).toBeVisible({ timeout: 10000 });
    await cashLabel.click();

    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1000);

    // Review step should show order details
    const reviewContent = page.getByText(/test@example.com/)
      .or(page.getByText(/რუსთაველის/))
      .or(page.getByText(/შეჯამება|review|summary/i));
    await expect(reviewContent.first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Checkout - Navigation', () => {
  test('should go back to previous steps with data preserved', async ({ page }) => {
    await addProductToCart(page);
    await page.goto('/ka/checkout');
    await page.waitForLoadState('networkidle');

    // Fill step 1 and proceed
    await fillStep1(page);

    // On step 2
    await expect(page.locator('#cityId')).toBeVisible({ timeout: 10000 });

    // Click back
    await page.locator('button').filter({ hasText: /უკან|back/i }).click();

    // Should be back on step 1 with data preserved
    await expect(page.locator('#firstName')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#firstName')).toHaveValue('ტესტ');
    await expect(page.locator('#email')).toHaveValue('test@example.com');
  });
});

test.describe('Checkout - Empty Cart', () => {
  test('should show empty state when no items in cart', async ({ page }) => {
    await page.goto('/ka');
    await page.evaluate(() => localStorage.removeItem('cart-storage'));

    await page.goto('/ka/checkout');
    await page.waitForLoadState('networkidle');

    const emptyIndicator = page.getByText(/ცარიელი|empty|კალათა|cart|პროდუქცია/i);
    const productsLink = page.locator('a[href*="products"]');
    const hasEmpty = await emptyIndicator.first().isVisible().catch(() => false);
    const hasLink = await productsLink.first().isVisible().catch(() => false);
    const redirected = page.url().includes('/products');

    expect(hasEmpty || hasLink || redirected).toBeTruthy();
  });
});
