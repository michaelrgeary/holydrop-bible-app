import { test, expect } from '@playwright/test';

test.describe('Mobile Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport for all tests
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test('should display homepage correctly on mobile', async ({ page }) => {
    await page.goto('/');
    
    // Check responsive layout
    await expect(page.locator('h1')).toBeVisible();
    
    // Header should be responsive
    const header = page.locator('header');
    const headerBox = await header.boundingBox();
    expect(headerBox?.width).toBeLessThanOrEqual(375);
    
    // CTA buttons should stack on mobile
    const ctaButtons = page.locator('text=Start Your Journey');
    await expect(ctaButtons).toBeVisible();
  });

  test('should have working mobile navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check if header is responsive
    await expect(page.locator('header')).toBeVisible();
    
    // Sign in button should be accessible
    await page.click('text=Sign In');
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('should display Bible chapters correctly on mobile', async ({ page }) => {
    await page.goto('/genesis/1');
    
    // Chapter title should be visible
    await expect(page.locator('h1')).toBeVisible();
    
    // Verses should be readable
    await expect(page.locator('text=In the beginning')).toBeVisible();
    
    // Verse numbers should be clickable
    await page.click('[data-verse="1"]');
    
    // Annotation sidebar should be mobile-friendly
    const sidebar = page.locator('.annotation-sidebar');
    if (await sidebar.isVisible()) {
      const sidebarBox = await sidebar.boundingBox();
      expect(sidebarBox?.width).toBeLessThanOrEqual(375);
    }
  });

  test('should handle touch gestures for voting', async ({ page }) => {
    await page.goto('/');
    
    // Login first
    await page.click('text=Sign In');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Go to verse
    await page.goto('/genesis/1');
    await page.click('[data-verse="1"]');
    
    // Tap vote button (simulating touch)
    const voteButton = page.locator('button').filter({ hasText: '💧' }).first();
    await voteButton.tap();
    
    // Should register the vote
    await expect(voteButton).toHaveClass(/animate-/);
  });

  test('should have readable text on mobile', async ({ page }) => {
    await page.goto('/genesis/1');
    
    // Check font sizes are appropriate
    const verseText = page.locator('.verse-text').first();
    await expect(verseText).toBeVisible();
    
    // Text should not be too small
    const textElement = await verseText.elementHandle();
    const fontSize = await textElement?.evaluate(el => 
      window.getComputedStyle(el).fontSize
    );
    
    // Font should be at least 14px
    const fontSizeNum = parseInt(fontSize?.replace('px', '') || '0');
    expect(fontSizeNum).toBeGreaterThanOrEqual(14);
  });

  test('should handle modal dialogs on mobile', async ({ page }) => {
    await page.goto('/');
    
    // Open auth modal
    await page.click('text=Sign In');
    
    // Modal should be mobile-friendly
    const modal = page.locator('[role="dialog"]');
    const modalBox = await modal.boundingBox();
    
    if (modalBox) {
      // Modal should not overflow screen
      expect(modalBox.width).toBeLessThanOrEqual(375);
      expect(modalBox.x).toBeGreaterThanOrEqual(0);
    }
    
    // Form inputs should be large enough for touch
    const emailInput = page.locator('input[type="email"]');
    const inputBox = await emailInput.boundingBox();
    expect(inputBox?.height).toBeGreaterThanOrEqual(44); // iOS touch target size
  });

  test('should support mobile search interface', async ({ page }) => {
    await page.goto('/search');
    
    // Search input should be full width
    const searchInput = page.locator('input[type="search"]');
    const inputBox = await searchInput.boundingBox();
    expect(inputBox?.width).toBeGreaterThan(300);
    
    // Search results should be touch-friendly
    await page.fill('input[type="search"]', 'beginning');
    await page.waitForTimeout(400);
    
    const resultLinks = page.locator('.search-result');
    if (await resultLinks.count() > 0) {
      const firstResult = resultLinks.first();
      const resultBox = await firstResult.boundingBox();
      expect(resultBox?.height).toBeGreaterThanOrEqual(44); // Touch target
    }
  });

  test('should handle orientation change', async ({ page }) => {
    await page.goto('/');
    
    // Start in portrait
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h1')).toBeVisible();
    
    // Switch to landscape
    await page.setViewportSize({ width: 667, height: 375 });
    await expect(page.locator('h1')).toBeVisible();
    
    // Layout should adapt
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });

  test('should scroll smoothly on mobile', async ({ page }) => {
    await page.goto('/genesis/1');
    
    // Scroll down to verse 31
    await page.locator('[data-verse="31"]').scrollIntoViewIfNeeded();
    
    // Verse should be visible
    await expect(page.locator('[data-verse="31"]')).toBeVisible();
    
    // Scroll back to top
    await page.locator('[data-verse="1"]').scrollIntoViewIfNeeded();
    await expect(page.locator('[data-verse="1"]')).toBeVisible();
  });

  test('should handle mobile keyboard', async ({ page }) => {
    await page.goto('/search');
    
    // Focus search input (should open mobile keyboard)
    await page.focus('input[type="search"]');
    
    // Type on mobile keyboard
    await page.type('input[type="search"]', 'love');
    
    // Should handle input correctly
    await expect(page.locator('input[type="search"]')).toHaveValue('love');
    
    // Submit with mobile keyboard
    await page.press('input[type="search"]', 'Enter');
  });

  test('should support swipe gestures if implemented', async ({ page }) => {
    await page.goto('/genesis/1');
    
    // Open annotation sidebar
    await page.click('[data-verse="1"]');
    
    const sidebar = page.locator('.annotation-sidebar');
    if (await sidebar.isVisible()) {
      // Try to swipe close (if implemented)
      await sidebar.hover();
      
      // Simulate swipe gesture
      await page.mouse.move(350, 300);
      await page.mouse.down();
      await page.mouse.move(100, 300);
      await page.mouse.up();
      
      // Sidebar might close with swipe
      // This test is conditional based on implementation
    }
  });

  test('should have appropriate mobile spacing and padding', async ({ page }) => {
    await page.goto('/');
    
    // Check that elements have proper mobile spacing
    const mainContent = page.locator('main');
    const contentBox = await mainContent.boundingBox();
    
    // Content should have appropriate margins
    if (contentBox) {
      expect(contentBox.x).toBeGreaterThan(8); // Some margin from edge
    }
    
    // Buttons should have touch-friendly sizes
    const ctaButton = page.locator('text=Start Your Journey');
    const buttonBox = await ctaButton.boundingBox();
    expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
  });

  test('should load mobile-optimized images', async ({ page }) => {
    await page.goto('/');
    
    // Check that images (if any) are mobile-appropriate
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const imgBox = await img.boundingBox();
      
      if (imgBox) {
        // Image should not overflow mobile screen
        expect(imgBox.width).toBeLessThanOrEqual(375);
      }
    }
  });
});