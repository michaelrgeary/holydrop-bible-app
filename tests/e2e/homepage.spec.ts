import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load and display main elements', async ({ page }) => {
    await page.goto('/');
    
    // Check if the page loads
    await expect(page).toHaveTitle(/holydrop/);
    
    // Check main heading
    await expect(page.locator('h1')).toContainText('holydrop');
    
    // Check tagline
    await expect(page.locator('text=Where wisdom drops onto scripture')).toBeVisible();
    
    // Check CTA buttons
    await expect(page.locator('text=Start Your Journey')).toBeVisible();
    await expect(page.locator('text=Search Scriptures')).toBeVisible();
  });

  test('should display statistics section', async ({ page }) => {
    await page.goto('/');
    
    // Wait for stats to animate in
    await page.waitForTimeout(2000);
    
    // Check if stats are visible
    await expect(page.locator('text=Drops of Wisdom')).toBeVisible();
    await expect(page.locator('text=Active Seekers')).toBeVisible();
    await expect(page.locator('text=Verses Covered')).toBeVisible();
    await expect(page.locator('text=Daily Readers')).toBeVisible();
  });

  test('should have working navigation to Genesis', async ({ page }) => {
    await page.goto('/');
    
    // Click the "Start Your Journey" button
    await page.click('text=Start Your Journey');
    
    // Should navigate to Genesis 1
    await expect(page).toHaveURL(/\/genesis\/1/);
  });

  test('should have working navigation to search', async ({ page }) => {
    await page.goto('/');
    
    // Click the "Search Scriptures" button  
    await page.click('text=Search Scriptures');
    
    // Should navigate to search page
    await expect(page).toHaveURL(/\/search/);
  });

  test('should display recent activity and popular verses', async ({ page }) => {
    await page.goto('/');
    
    // Wait for content to load
    await page.waitForTimeout(2000);
    
    // Check recent activity section
    await expect(page.locator('text=Recent Activity')).toBeVisible();
    
    // Check popular verses section
    await expect(page.locator('text=Popular Verses')).toBeVisible();
    
    // Should have some activity items
    await expect(page.locator('text=Sarah')).toBeVisible();
    await expect(page.locator('text=added wisdom to')).toBeVisible();
  });

  test('should display featured chapters', async ({ page }) => {
    await page.goto('/');
    
    // Check featured chapters section
    await expect(page.locator('text=Begin Your Study')).toBeVisible();
    await expect(page.locator('text=Genesis 1')).toBeVisible();
    await expect(page.locator('text=John 3')).toBeVisible();
    await expect(page.locator('text=Psalm 23')).toBeVisible();
  });

  test('should have working featured chapter links', async ({ page }) => {
    await page.goto('/');
    
    // Click on Genesis 1 featured chapter
    await page.click('text=Genesis 1');
    
    // Should navigate to Genesis 1
    await expect(page).toHaveURL(/\/genesis\/1/);
  });
});