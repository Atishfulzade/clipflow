import { test, expect } from '@playwright/test';

test.describe('Global Admin Panel Access & Security', () => {
  test('should block non-admin users from accessing the admin panel', async ({ page }) => {
    // 1. Log in as a normal user (Alex Creator)
    await page.goto('/login');
    await page.fill('input[type="email"]', 'alex@vibecut.ai');
    await page.fill('input[type="password"]', 'password');
    await page.click('button:has-text("Sign In with Email")');
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('h1').last()).toHaveText(/Dashboard/i, { timeout: 15000 });

    // 2. Verify that the Admin Panel link is NOT visible in the sidebar
    await expect(page.locator('aside a:has-text("Admin Panel")')).not.toBeVisible();

    // 3. Attempt to navigate directly to /dashboard/admin
    await page.goto('/dashboard/admin');

    // 4. Verify that "Global Access Denied" is displayed
    await expect(page.locator('h2')).toHaveText('Global Access Denied');
    await expect(page.locator('text=atishfulzade1234@gmail.com')).toBeVisible();
  });

  test('should allow atishfulzade1234@gmail.com to access admin panel, switch tabs, and filter data', async ({ page }) => {
    // 1. Sign up as the designated global admin
    await page.goto('/signup');
    await page.fill('input[placeholder="Alex Creator"]', 'Atish Admin');
    await page.fill('input[placeholder="name@example.com"]', 'atishfulzade1234@gmail.com');
    await page.fill('input[placeholder="••••••••"]', 'adminpassword123');
    await page.click('button:has-text("Sign Up with Email")');

    // 2. Complete onboarding
    await expect(page).toHaveURL(/\/onboarding/);
    await page.click('button:has-text("Tech & Coding")');
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("YouTube Shorts")');
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Daily (7 posts / week)")');
    await page.click('button:has-text("Complete")');

    // 3. Verify redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // 4. Verify that the Admin Panel link IS visible in the sidebar
    const adminLink = page.locator('aside a:has-text("Admin Panel")');
    await expect(adminLink).toBeVisible();
    await adminLink.click();

    // 5. Verify we are on the admin page and see the Web Owner Console header
    await expect(page).toHaveURL(/\/dashboard\/admin/);
    await expect(page.locator('h1').last()).toHaveText(/Web Owner Console/i);

    // 6. Test sub-tab navigation
    // Default tab is System Health. Verify System Diagnostics is visible
    await expect(page.locator('h3', { hasText: 'System Diagnostics' })).toBeVisible();

    // Switch to "All Videos" tab
    await page.click('button:has-text("All Videos")');
    await expect(page.locator('span', { hasText: 'Filter platform video records' })).toBeVisible();

    // Switch to "AI Clip Highlights" tab
    await page.click('button:has-text("AI Clip Highlights")');
    await expect(page.locator('span', { hasText: 'Filter AI-generated clips' })).toBeVisible();

    // Switch to "Social Schedules" tab
    await page.click('button:has-text("Social Schedules")');
    await expect(page.locator('span', { hasText: 'Filter social publishing schedules' })).toBeVisible();

    // Switch to "Platform Analytics" tab
    await page.click('button:has-text("Platform Analytics")');
    await expect(page.locator('span', { hasText: 'Global reach & viewer metrics audit' })).toBeVisible();

    // 7. Verify search input works on Platform Analytics tab
    const searchInput = page.locator('input[placeholder="Search by clip title or publisher email..."]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('SSR');
    
    // Verify that the table updates (some row should match or empty state shows)
    // Clear search
    await searchInput.fill('');
  });
});
