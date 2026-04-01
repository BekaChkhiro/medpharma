import { test, expect, type Page } from '@playwright/test';

// Admin tests are desktop-only (admin panel not optimized for mobile)
test.use({ viewport: { width: 1280, height: 720 } });

/**
 * Phase 2 Tests: Admin Category Management
 *
 * Tests:
 * - View categories list
 * - Create/update/delete category via API
 * - Slug uniqueness validation
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

test.describe('Admin Category Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should display categories page', async ({ page }) => {
    await page.goto('/ka/admin/categories');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Should show heading
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('should create a new category via API', async ({ page }) => {
    const testSlug = `test-cat-${Date.now()}`;

    const response = await page.request.post('/api/admin/categories', {
      data: {
        slug: testSlug,
        nameKa: 'სატესტო კატეგორია',
        nameEn: 'Test Category',
        isActive: true,
      },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBeTruthy();
    expect(data.data.slug).toBe(testSlug);

    // Cleanup
    await page.request.delete(`/api/admin/categories/${data.data.id}`);
  });

  test('should update category via API', async ({ page }) => {
    const testSlug = `update-cat-${Date.now()}`;

    // Create
    const createRes = await page.request.post('/api/admin/categories', {
      data: { slug: testSlug, nameKa: 'ძველი', nameEn: 'Old Name', isActive: true },
    });
    const createData = await createRes.json();
    const catId = createData.data.id;

    // Update
    const updateRes = await page.request.put(`/api/admin/categories/${catId}`, {
      data: { slug: testSlug, nameKa: 'ახალი', nameEn: 'New Name' },
    });
    if (!updateRes.ok()) {
      const err = await updateRes.json().catch(() => ({}));
      console.log('Update error:', updateRes.status(), err);
    }
    expect(updateRes.ok()).toBeTruthy();
    const updateData = await updateRes.json();
    expect(updateData.data.nameEn).toBe('New Name');

    // Cleanup
    await page.request.delete(`/api/admin/categories/${catId}`);
  });

  test('should delete empty category via API', async ({ page }) => {
    const testSlug = `delete-cat-${Date.now()}`;

    // Create
    const createRes = await page.request.post('/api/admin/categories', {
      data: { slug: testSlug, nameKa: 'წასაშლელი', nameEn: 'To Delete', isActive: true },
    });
    const createData = await createRes.json();
    const catId = createData.data.id;

    // Delete
    const deleteRes = await page.request.delete(`/api/admin/categories/${catId}`);
    expect(deleteRes.ok()).toBeTruthy();
  });

  test('should reject duplicate category slug', async ({ page }) => {
    const testSlug = `dup-slug-${Date.now()}`;

    // Create first
    const res1 = await page.request.post('/api/admin/categories', {
      data: { slug: testSlug, nameKa: 'პირველი', nameEn: 'First', isActive: true },
    });
    const data1 = await res1.json();
    expect(data1.success).toBeTruthy();

    // Create second with same slug
    const res2 = await page.request.post('/api/admin/categories', {
      data: { slug: testSlug, nameKa: 'მეორე', nameEn: 'Second', isActive: true },
    });
    expect(res2.ok()).toBeFalsy();

    // Cleanup
    await page.request.delete(`/api/admin/categories/${data1.data.id}`);
  });
});
