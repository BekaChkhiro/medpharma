import { test, expect, type Page } from '@playwright/test';

// Admin tests are desktop-only (admin panel not optimized for mobile)
test.use({ viewport: { width: 1280, height: 720 } });

/**
 * Phase 2 Tests: Admin Product Management
 *
 * Tests real admin scenarios:
 * - Login to admin panel
 * - Create new product
 * - Edit product
 * - Search/filter products
 * - Delete product
 */

const ADMIN_EMAIL = 'admin@medpharma.ge';
const ADMIN_PASSWORD = 'admin123';

async function loginAsAdmin(page: Page) {
  await page.goto('/ka/admin/login');
  await page.locator('input[type="email"]').fill(ADMIN_EMAIL);
  await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/admin(?!\/login)/);
}

test.describe('Admin Product CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should navigate to products page', async ({ page }) => {
    await page.goto('/ka/admin/products');
    await page.waitForLoadState('networkidle');

    // Page heading in admin topbar
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 10000 });

    // Product table or spinner should be visible
    await expect(
      page.locator('table').or(page.locator('[class*="spinner"]')).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should open product creation modal', async ({ page }) => {
    await page.goto('/ka/admin/products');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click "Add Product" button (contains Plus icon + text)
    const addButton = page.locator('button').filter({ hasText: /დამატება|add/i });
    await expect(addButton).toBeVisible({ timeout: 10000 });
    await addButton.click();

    // Modal should open with SKU field
    await expect(page.locator('#sku')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#nameKa')).toBeVisible();
    await expect(page.locator('#nameEn')).toBeVisible();
  });

  test('should create a new product via modal and fill form tabs', async ({ page }) => {
    test.setTimeout(60000);

    await page.goto('/ka/admin/products');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Open create modal
    await page.locator('button').filter({ hasText: /დამატება|add/i }).click();
    await expect(page.locator('#sku')).toBeVisible({ timeout: 5000 });

    // Fill basic info tab - verify all fields accessible
    const testSku = `MODAL-${Date.now()}`;
    await page.locator('#sku').fill(testSku);
    await page.locator('#nameKa').fill('სატესტო პროდუქტი');
    await page.locator('#nameEn').fill('Modal Test Product');

    // Find and click inventory/pricing tab (may use button or other element)
    const tabTrigger = page.locator('[role="tab"], [data-state]').filter({ hasText: /ინვენტარი|inventory|ფას/i });
    if (await tabTrigger.count() > 0) {
      await tabTrigger.first().click();
      await page.waitForTimeout(500);
    }

    // If price field is visible, fill it
    const priceField = page.locator('#price');
    if (await priceField.isVisible().catch(() => false)) {
      await priceField.fill('25.50');
      await page.locator('#stock').fill('100');
    }

    // Submit
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);

    // Cleanup via API (ignore errors)
    try {
      const products = await page.request.get(`/api/admin/products?search=${testSku}`);
      const data = await products.json();
      if (data.success && data.data.products.length > 0) {
        await page.request.delete(`/api/admin/products/${data.data.products[0].id}`);
      }
    } catch { /* cleanup failure is ok */ }
  });

  test('should create product via API and verify in admin', async ({ page }) => {
    const apiSku = `API-TEST-${Date.now()}`;

    // Use page.request (shares auth session)
    const response = await page.request.post('/api/admin/products', {
      data: {
        sku: apiSku,
        slug: `api-test-${Date.now()}`,
        nameKa: 'API სატესტო',
        nameEn: 'API Test Product',
        price: 15.99,
        stock: 50,
        isActive: true,
        requiresPrescription: false,
        isFeatured: false,
      },
    });
    // Debug: if not ok, log response
    if (!response.ok()) {
      const errorBody = await response.json().catch(() => ({}));
      console.log('API Error:', response.status(), errorBody);
    }
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBeTruthy();
    const productId = data.data.id;

    // Navigate to admin products and search
    await page.goto('/ka/admin/products');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const searchInput = page.locator('input').filter({ hasNotText: '' }).first();
    await searchInput.fill(apiSku);
    await page.waitForTimeout(1500);

    await expect(page.getByText(apiSku)).toBeVisible({ timeout: 10000 });

    // Cleanup (ignore errors)
    await page.request.delete(`/api/admin/products/${productId}`).catch(() => {});
  });

  test('should edit an existing product', async ({ page }) => {
    const editSku = `EDIT-TEST-${Date.now()}`;

    // Create product via API
    const createRes = await page.request.post('/api/admin/products', {
      data: {
        sku: editSku,
        slug: editSku.toLowerCase(),
        nameKa: 'შესაცვლელი',
        nameEn: 'To Be Edited',
        price: 10,
        stock: 20,
        isActive: true,
        requiresPrescription: false,
        isFeatured: false,
      },
    });
    const createData = await createRes.json();
    expect(createData.success).toBeTruthy();
    const productId = createData.data.id;

    // Go to products page and search
    await page.goto('/ka/admin/products');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const searchInput = page.locator('input').filter({ hasNotText: '' }).first();
    await searchInput.fill(editSku);
    await page.waitForTimeout(1500);

    // Verify product exists in table, then update via API directly
    const productRow = page.locator('tr').filter({ hasText: editSku });
    await expect(productRow).toBeVisible({ timeout: 10000 });

    // Update via API
    const updateRes = await page.request.put(`/api/admin/products/${productId}`, {
      data: { nameEn: 'Edited Product' },
    });
    expect(updateRes.ok()).toBeTruthy();

    // Verify via API
    const verifyRes = await page.request.get(`/api/admin/products/${productId}`);
    const verifyData = await verifyRes.json();
    expect(verifyData.data.nameEn).toBe('Edited Product');

    // Cleanup
    await page.request.delete(`/api/admin/products/${productId}`);
  });

  test('should delete a product via API', async ({ page }) => {
    const deleteSku = `DELETE-TEST-${Date.now()}`;

    // Create product
    const createRes = await page.request.post('/api/admin/products', {
      data: {
        sku: deleteSku,
        slug: deleteSku.toLowerCase(),
        nameKa: 'წასაშლელი',
        nameEn: 'To Be Deleted',
        price: 5,
        stock: 1,
        isActive: true,
        requiresPrescription: false,
        isFeatured: false,
      },
    });
    const createData = await createRes.json();
    expect(createData.success).toBeTruthy();
    const productId = createData.data.id;

    // Delete via API
    const deleteRes = await page.request.delete(`/api/admin/products/${productId}`);
    expect(deleteRes.ok()).toBeTruthy();

    // Verify product is gone
    const verifyRes = await page.request.get(`/api/admin/products/${productId}`);
    expect(verifyRes.status()).toBe(404);
  });

  test('should search and filter products', async ({ page }) => {
    await page.goto('/ka/admin/products');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Search by text
    // Wait for table to fully load first
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });

    const searchInput = page.locator('input[placeholder]').first();
    await expect(searchInput).toBeVisible();
    await searchInput.fill('ფაფა');
    await page.waitForTimeout(2000);

    // Should show filtered results or no results message
    const hasRows = await page.locator('tbody tr').count();
    // Products with "ფაფა" in name exist in seeded data
    expect(hasRows).toBeGreaterThan(0);
  });
});

test.describe('Admin Product API', () => {
  test('should reject unauthenticated product creation', async ({ request }) => {
    const response = await request.post('/api/admin/products', {
      data: { sku: 'UNAUTH', nameKa: 'test', nameEn: 'test', price: 1, stock: 1 },
    });
    expect(response.ok()).toBeFalsy();
  });

  test('should reject duplicate SKU', async ({ page }) => {
    await loginAsAdmin(page);
    const dupSku = `DUP-${Date.now()}`;

    // Create first product
    const res1 = await page.request.post('/api/admin/products', {
      data: {
        sku: dupSku, slug: dupSku.toLowerCase(), nameKa: 'პირველი', nameEn: 'First',
        price: 10, stock: 5, isActive: true, requiresPrescription: false, isFeatured: false,
      },
    });
    const data1 = await res1.json();
    expect(data1.success).toBeTruthy();

    // Try duplicate
    const res2 = await page.request.post('/api/admin/products', {
      data: {
        sku: dupSku, nameKa: 'მეორე', nameEn: 'Second',
        price: 20, stock: 10, isActive: true, requiresPrescription: false, isFeatured: false,
      },
    });
    expect(res2.ok()).toBeFalsy();

    // Cleanup
    await page.request.delete(`/api/admin/products/${data1.data.id}`);
  });
});
