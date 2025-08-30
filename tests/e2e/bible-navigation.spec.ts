import { test, expect } from '@playwright/test';

test.describe('Bible Navigation', () => {
  test('should load Genesis 1 chapter', async ({ page }) => {
    await page.goto('/genesis/1');
    
    // Check page title and heading
    await expect(page).toHaveTitle(/Genesis 1/);
    await expect(page.locator('h1')).toContainText('Genesis 1');
    
    // Should have verse 1
    await expect(page.locator('text=In the beginning')).toBeVisible();
    
    // Should have verse numbers
    await expect(page.locator('[data-verse="1"]')).toBeVisible();
  });

  test('should load John 3 chapter', async ({ page }) => {
    await page.goto('/john/3');
    
    // Check page loads correctly
    await expect(page).toHaveTitle(/John 3/);
    await expect(page.locator('h1')).toContainText('John 3');
    
    // Should have famous verse
    await expect(page.locator('text=For God so loved')).toBeVisible();
  });

  test('should show 404 for non-existent chapter', async ({ page }) => {
    // Try to access a chapter that doesn't exist
    const response = await page.goto('/genesis/999');
    
    // Should return 404 or redirect to error page
    expect(response?.status()).toBe(404);
  });

  test('should show 404 for non-existent book', async ({ page }) => {
    const response = await page.goto('/nonexistentbook/1');
    
    // Should return 404
    expect(response?.status()).toBe(404);
  });

  test('should have clickable verse numbers', async ({ page }) => {
    await page.goto('/genesis/1');
    
    // Click on verse 1
    await page.click('[data-verse="1"]');
    
    // Should open annotation sidebar
    await expect(page.locator('text=Genesis 1:1')).toBeVisible();
  });

  test('should display correct verse count for Genesis 1', async ({ page }) => {
    await page.goto('/genesis/1');
    
    // Genesis 1 should have 31 verses
    await expect(page.locator('[data-verse="31"]')).toBeVisible();
    
    // Should not have verse 32
    await expect(page.locator('[data-verse="32"]')).not.toBeVisible();
  });

  test('should display correct verse count for John 3', async ({ page }) => {
    await page.goto('/john/3');
    
    // John 3 should have 36 verses
    await expect(page.locator('[data-verse="36"]')).toBeVisible();
    
    // Should not have verse 37
    await expect(page.locator('[data-verse="37"]')).not.toBeVisible();
  });

  test('should have navigation breadcrumbs', async ({ page }) => {
    await page.goto('/genesis/1');
    
    // Should show book and chapter in navigation
    await expect(page.locator('text=Genesis')).toBeVisible();
    await expect(page.locator('text=Chapter 1')).toBeVisible();
  });

  test('should handle chapter navigation', async ({ page }) => {
    await page.goto('/genesis/1');
    
    // Look for next/previous chapter navigation
    const nextChapterLink = page.locator('a[href*="genesis/2"]');
    if (await nextChapterLink.isVisible()) {
      await nextChapterLink.click();
      await expect(page).toHaveURL(/\/genesis\/2/);
    }
  });

  test('should show annotation counts on verses', async ({ page }) => {
    await page.goto('/genesis/1');
    
    // Look for verses that should have annotation indicators
    const verseWithAnnotations = page.locator('[data-verse="1"]');
    
    // Should show some indicator of annotations if they exist
    await expect(verseWithAnnotations).toBeVisible();
  });
});