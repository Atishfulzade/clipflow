import { test, expect } from '@playwright/test';

test.describe('Content Calendar & Scheduler Flow', () => {
  test('should display scheduled queue logs and allow publishing a scheduled post immediately', async ({ page }) => {
    // Log in first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'alex@vibecut.ai');
    await page.fill('input[type="password"]', 'password');
    await page.click('button:has-text("Sign In with Email")');
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('h1').last()).toHaveText(/Dashboard/i, { timeout: 15000 });

    // 1. Visit the calendar page
    await page.goto('/dashboard/calendar');
    await expect(page.locator('h1').last()).toHaveText('Content Calendar', { timeout: 15000 });

    // 2. Locate the seeded scheduled TikTok post row using its container flex classes
    const postRow = page.locator('div.flex.items-center.justify-between', { hasText: 'SaaS founders beware' }).first();
    await expect(postRow).toBeVisible();

    // 3. Verify that the current status badge shows "SCHEDULED"
    const statusBadge = postRow.locator('span', { hasText: 'SCHEDULED' }).first();
    await expect(statusBadge).toBeVisible();

    // 4. Click the "Publish Now" action button on this post row
    const publishButton = postRow.locator('button:has-text("Publish Now")');
    await expect(publishButton).toBeVisible();
    await publishButton.click();

    // 5. Verify that the status badge updates to "PUBLISHED"
    const publishedBadge = postRow.locator('span', { hasText: 'PUBLISHED' }).first();
    await expect(publishedBadge).toBeVisible({ timeout: 10000 });

    // 6. Verify that "Publish Now" and "Cancel" buttons are removed once published
    await expect(publishButton).not.toBeVisible();
  });
});
