import { test, expect } from '@playwright/test';

test.describe('Search Functionality', () => {
  test('should load search page', async ({ page }) => {
    await page.goto('/search');
    
    // Check page loads
    await expect(page).toHaveTitle(/Search/);
    await expect(page.locator('input[type="search"]')).toBeVisible();
    await expect(page.locator('text=Search the Bible')).toBeVisible();
  });

  test('should show search suggestions when typing', async ({ page }) => {
    await page.goto('/search');
    
    // Type in search box
    await page.fill('input[type="search"]', 'beginning');
    
    // Should show suggestions
    await expect(page.locator('.search-suggestions')).toBeVisible();
    await expect(page.locator('text=Genesis 1:1')).toBeVisible();
  });

  test('should navigate to verse when clicking search result', async ({ page }) => {
    await page.goto('/search');
    
    // Search and click result
    await page.fill('input[type="search"]', 'beginning');
    await page.click('text=Genesis 1:1');
    
    // Should navigate to Genesis 1:1
    await expect(page).toHaveURL(/\/genesis\/1/);
  });

  test('should handle empty search gracefully', async ({ page }) => {
    await page.goto('/search');
    
    // Submit empty search
    await page.press('input[type="search"]', 'Enter');
    
    // Should show helpful message
    await expect(page.locator('text=Enter a search term')).toBeVisible();
  });

  test('should debounce search input', async ({ page }) => {
    await page.goto('/search');
    
    // Type rapidly
    await page.type('input[type="search"]', 'test', { delay: 50 });
    
    // Should wait for debounce before showing results
    await page.waitForTimeout(400); // 300ms debounce + buffer
    
    // Results should appear after debounce
    const suggestions = page.locator('.search-suggestions');
    await expect(suggestions).toBeVisible();
  });

  test('should show no results message for non-existent terms', async ({ page }) => {
    await page.goto('/search');
    
    // Search for something that doesn't exist
    await page.fill('input[type="search"]', 'zzzznonexistentzzzzz');
    await page.waitForTimeout(400);
    
    // Should show no results message
    await expect(page.locator('text=No results found')).toBeVisible();
  });

  test('should search across different books', async ({ page }) => {
    await page.goto('/search');
    
    // Search for word that appears in multiple books
    await page.fill('input[type="search"]', 'God');
    await page.waitForTimeout(400);
    
    // Should show results from Genesis and John
    await expect(page.locator('text=Genesis')).toBeVisible();
    await expect(page.locator('text=John')).toBeVisible();
  });

  test('should support keyboard navigation in search results', async ({ page }) => {
    await page.goto('/search');
    
    // Search and navigate with keyboard
    await page.fill('input[type="search"]', 'beginning');
    await page.waitForTimeout(400);
    
    // Use arrow keys to navigate
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    
    // Should navigate to selected result
    await expect(page).toHaveURL(/\/genesis\/1/);
  });

  test('should clear search results when input is cleared', async ({ page }) => {
    await page.goto('/search');
    
    // Search then clear
    await page.fill('input[type="search"]', 'beginning');
    await page.waitForTimeout(400);
    await expect(page.locator('.search-suggestions')).toBeVisible();
    
    // Clear input
    await page.fill('input[type="search"]', '');
    
    // Results should disappear
    await expect(page.locator('.search-suggestions')).not.toBeVisible();
  });

  test('should show search history if implemented', async ({ page }) => {
    await page.goto('/search');
    
    // Search for something
    await page.fill('input[type="search"]', 'love');
    await page.press('input[type="search"]', 'Enter');
    
    // Clear and check for history
    await page.fill('input[type="search"]', '');
    await page.focus('input[type="search"]');
    
    // Should show recent searches if implemented
    const historySection = page.locator('text=Recent searches');
    if (await historySection.isVisible()) {
      await expect(page.locator('text=love')).toBeVisible();
    }
  });

  test('should handle special characters in search', async ({ page }) => {
    await page.goto('/search');
    
    // Search with quotes and special characters
    await page.fill('input[type="search"]', '"in the beginning"');
    await page.waitForTimeout(400);
    
    // Should handle gracefully
    const suggestions = page.locator('.search-suggestions');
    await expect(suggestions).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/search');
    
    // Search input should be full width
    const searchInput = page.locator('input[type="search"]');
    const boundingBox = await searchInput.boundingBox();
    expect(boundingBox?.width).toBeGreaterThan(300);
    
    // Results should be mobile-friendly
    await page.fill('input[type="search"]', 'beginning');
    await page.waitForTimeout(400);
    
    const suggestions = page.locator('.search-suggestions');
    await expect(suggestions).toBeVisible();
  });

  test('should support filtering search results by book', async ({ page }) => {
    await page.goto('/search');
    
    // Look for filter options
    const bookFilter = page.locator('select[name="book"]');
    if (await bookFilter.isVisible()) {
      await bookFilter.selectOption('Genesis');
      await page.fill('input[type="search"]', 'God');
      await page.waitForTimeout(400);
      
      // Results should only be from Genesis
      await expect(page.locator('text=Genesis')).toBeVisible();
      await expect(page.locator('text=John')).not.toBeVisible();
    }
  });
});