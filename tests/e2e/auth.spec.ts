import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should show sign in modal when clicking Sign In button', async ({ page }) => {
    await page.goto('/');
    
    // Click Sign In button in header
    await page.click('text=Sign In');
    
    // Modal should appear
    await expect(page.locator('text=Sign In').nth(1)).toBeVisible(); // Modal title
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should close modal when clicking X', async ({ page }) => {
    await page.goto('/');
    
    // Open modal
    await page.click('text=Sign In');
    await expect(page.locator('text=Sign In').nth(1)).toBeVisible();
    
    // Close modal
    await page.click('text=✕');
    
    // Modal should be hidden
    await expect(page.locator('input[type="email"]')).not.toBeVisible();
  });

  test('should login with any email and password', async ({ page }) => {
    await page.goto('/');
    
    // Open modal and login
    await page.click('text=Sign In');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Should be logged in - check if user email appears
    await expect(page.locator('text=test@example.com')).toBeVisible();
    await expect(page.locator('text=Sign Out')).toBeVisible();
  });

  test('should logout when clicking Sign Out', async ({ page }) => {
    await page.goto('/');
    
    // Login first
    await page.click('text=Sign In');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Logout
    await page.click('text=Sign Out');
    
    // Should show sign in buttons again
    await expect(page.locator('text=Sign In')).toBeVisible();
    await expect(page.locator('text=Sign Up')).toBeVisible();
  });

  test('should persist login after page refresh', async ({ page }) => {
    await page.goto('/');
    
    // Login
    await page.click('text=Sign In');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Refresh page
    await page.reload();
    
    // Should still be logged in
    await expect(page.locator('text=test@example.com')).toBeVisible();
    await expect(page.locator('text=Sign Out')).toBeVisible();
  });

  test('should show login prompt when trying to vote without auth', async ({ page }) => {
    await page.goto('/genesis/1');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Click on first verse to open annotation sidebar
    await page.click('[data-verse="1"]');
    
    // Try to vote (should show tooltip)
    const voteButton = page.locator('button').filter({ hasText: '💧' }).first();
    await voteButton.hover();
    
    // Should show login tooltip
    await expect(page.locator('text=Sign in to vote')).toBeVisible();
  });

  test('should allow voting when authenticated', async ({ page }) => {
    await page.goto('/');
    
    // Login first
    await page.click('text=Sign In');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Go to Genesis
    await page.goto('/genesis/1');
    await page.waitForLoadState('networkidle');
    
    // Click on first verse
    await page.click('[data-verse="1"]');
    
    // Vote should work (no tooltip, count should increment)
    const voteButton = page.locator('button').filter({ hasText: '💧' }).first();
    await voteButton.click();
    
    // Should see vote animation/effect
    await expect(voteButton).toHaveClass(/animate-/);
  });
});