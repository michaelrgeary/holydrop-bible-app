import { test, expect } from '@playwright/test';

test.describe('Annotations', () => {
  test('should open annotation sidebar when clicking verse', async ({ page }) => {
    await page.goto('/genesis/1');
    
    // Click on verse 1
    await page.click('[data-verse="1"]');
    
    // Sidebar should open
    await expect(page.locator('.annotation-sidebar')).toBeVisible();
    await expect(page.locator('text=Genesis 1:1')).toBeVisible();
  });

  test('should close annotation sidebar when clicking close button', async ({ page }) => {
    await page.goto('/genesis/1');
    
    // Open sidebar
    await page.click('[data-verse="1"]');
    await expect(page.locator('.annotation-sidebar')).toBeVisible();
    
    // Close sidebar
    await page.click('button[aria-label="Close"]');
    
    // Sidebar should be hidden
    await expect(page.locator('.annotation-sidebar')).not.toBeVisible();
  });

  test('should show existing annotations for verse', async ({ page }) => {
    await page.goto('/genesis/1');
    
    // Click on verse that should have annotations
    await page.click('[data-verse="1"]');
    
    // Should show mock annotations
    await expect(page.locator('text=This is the foundation')).toBeVisible();
    await expect(page.locator('text=Scholar')).toBeVisible();
  });

  test('should require login to create annotation', async ({ page }) => {
    await page.goto('/genesis/1');
    
    // Open sidebar
    await page.click('[data-verse="1"]');
    
    // Try to add annotation without login
    await page.click('button:has-text("Add Annotation")');
    
    // Should show login prompt
    await expect(page.locator('text=Sign in to add annotations')).toBeVisible();
  });

  test('should allow creating annotation when logged in', async ({ page }) => {
    await page.goto('/');
    
    // Login first
    await page.click('text=Sign In');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Go to Genesis and open annotation sidebar
    await page.goto('/genesis/1');
    await page.click('[data-verse="1"]');
    
    // Add annotation
    await page.click('button:has-text("Add Annotation")');
    
    // Should show editor
    await expect(page.locator('.editor')).toBeVisible();
    
    // Type annotation
    await page.fill('.editor', 'This is a test annotation');
    await page.click('button:has-text("Save")');
    
    // Should show in annotation list
    await expect(page.locator('text=This is a test annotation')).toBeVisible();
  });

  test('should allow voting on annotations when logged in', async ({ page }) => {
    await page.goto('/');
    
    // Login first
    await page.click('text=Sign In');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Go to verse with annotations
    await page.goto('/genesis/1');
    await page.click('[data-verse="1"]');
    
    // Click upvote button
    const upvoteButton = page.locator('button').filter({ hasText: '💧' }).first();
    const initialCount = await upvoteButton.locator('span').textContent();
    
    await upvoteButton.click();
    
    // Vote count should change
    await page.waitForTimeout(500); // Wait for animation
    const newCount = await upvoteButton.locator('span').textContent();
    expect(newCount !== initialCount).toBeTruthy();
  });

  test('should show vote tooltip when not logged in', async ({ page }) => {
    await page.goto('/genesis/1');
    
    // Open sidebar
    await page.click('[data-verse="1"]');
    
    // Hover over vote button
    const voteButton = page.locator('button').filter({ hasText: '💧' }).first();
    await voteButton.hover();
    
    // Should show tooltip
    await expect(page.locator('text=Sign in to vote')).toBeVisible();
  });

  test('should display annotation author information', async ({ page }) => {
    await page.goto('/genesis/1');
    
    // Open sidebar
    await page.click('[data-verse="1"]');
    
    // Should show author info
    await expect(page.locator('text=Scholar')).toBeVisible();
    await expect(page.locator('text=🎓')).toBeVisible(); // Scholar icon
  });

  test('should show annotation timestamps', async ({ page }) => {
    await page.goto('/genesis/1');
    
    // Open sidebar
    await page.click('[data-verse="1"]');
    
    // Should show relative timestamps
    await expect(page.locator('text=ago')).toBeVisible();
  });

  test('should handle annotation sidebar on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/genesis/1');
    
    // Click on verse
    await page.click('[data-verse="1"]');
    
    // Sidebar should open and be responsive
    await expect(page.locator('.annotation-sidebar')).toBeVisible();
    
    // Should cover full width on mobile
    const sidebar = page.locator('.annotation-sidebar');
    const boundingBox = await sidebar.boundingBox();
    expect(boundingBox?.width).toBeGreaterThan(300);
  });

  test('should support keyboard navigation in annotation editor', async ({ page }) => {
    await page.goto('/');
    
    // Login first
    await page.click('text=Sign In');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Go to Genesis and open annotation
    await page.goto('/genesis/1');
    await page.click('[data-verse="1"]');
    await page.click('button:has-text("Add Annotation")');
    
    // Test keyboard shortcuts in editor
    await page.keyboard.press('Control+b'); // Bold
    await page.keyboard.type('Bold text');
    await page.keyboard.press('Control+b'); // Turn off bold
    
    // Should have formatted text
    await expect(page.locator('strong:has-text("Bold text")')).toBeVisible();
  });
});