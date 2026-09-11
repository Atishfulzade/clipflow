import { test, expect } from '@playwright/test';

test.describe('Authentication & Onboarding Wizard Flow', () => {
  test('should allow a new user to sign up and go through the onboarding wizard', async ({ page }) => {
    // 1. Visit the signup page
    await page.goto('/signup');
    await expect(page.locator('h2')).toHaveText('Create your account');

    // 2. Fill in credentials
    await page.fill('input[placeholder="Alex Creator"]', 'Test Creator');
    await page.fill('input[placeholder="name@example.com"]', 'test-creator@clipflow.ai');
    await page.fill('input[placeholder="••••••••"]', 'securepassword123');

    // 3. Submit the registration form
    await page.click('button:has-text("Sign Up with Email")');

    // 4. Verify redirection to onboarding wizard (Step 1 of 3)
    await expect(page).toHaveURL(/\/onboarding/);
    await expect(page.locator('span', { hasText: 'Step 1 of 3' })).toBeVisible();
    await expect(page.locator('h2')).toHaveText(/What is your creator niche\?/);

    // 5. Select niche (Tech & Coding)
    await page.click('button:has-text("Tech & Coding")');
    await page.click('button:has-text("Next")');

    // 6. Select platform (YouTube Shorts) in Step 2 of 3
    await expect(page.locator('span', { hasText: 'Step 2 of 3' })).toBeVisible();
    await expect(page.locator('h2')).toHaveText('Which platforms do you publish on?');
    await page.click('button:has-text("YouTube Shorts")');
    await page.click('button:has-text("Next")');

    // 7. Select frequency (Daily) in Step 3 of 3
    await expect(page.locator('span', { hasText: 'Step 3 of 3' })).toBeVisible();
    await expect(page.locator('h2')).toHaveText('How often do you post?');
    await page.click('button:has-text("Daily (7 posts / week)")');
    await page.click('button:has-text("Complete")');

    // 8. Verify redirection to the dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Check that we see dashboard layouts (e.g. project list or header welcome card)
    await expect(page.locator('h1').last()).toHaveText(/Dashboard/i, { timeout: 15000 });
  });

  test('should toggle user profile dropdown in navbar and redirect to pages', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'alex@vibecut.ai');
    await page.fill('input[type="password"]', 'password');
    await page.click('button:has-text("Sign In with Email")');
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('h1').last()).toHaveText(/Dashboard/i, { timeout: 15000 });

    // Toggle dropdown
    const trigger = page.locator('button:has-text("Alex Creator")');
    await expect(trigger).toBeVisible();
    await trigger.click();

    // Verify user details
    await expect(page.locator('p', { hasText: 'alex@vibecut.ai' })).toBeVisible();

    // Click link
    await page.locator('a:has-text("Account Settings")').click();
    await expect(page).toHaveURL(/\/dashboard\/settings/);
  });

  test('should logout via sidebar logout button', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'alex@vibecut.ai');
    await page.fill('input[type="password"]', 'password');
    await page.click('button:has-text("Sign In with Email")');
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('h1').last()).toHaveText(/Dashboard/i, { timeout: 15000 });

    const logoutBtn = page.locator('aside button:has-text("Log Out")');
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click();

    await expect(page).toHaveURL(/\/login/);
  });

  test('should log in directly with Google and bypass onboarding', async ({ page }) => {
    // Navigate directly to callback with test code to simulate Google redirecting back
    await page.goto('/auth/google-callback?code=mock_test_code');
    
    // Google authentication should redirect directly to dashboard bypassing onboarding
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('h1').last()).toHaveText(/Dashboard/i, { timeout: 15000 });
  });

  test('should hide team invitation form for non-owners and show warning banner', async ({ page }) => {
    // 1. Log in as a seeded Editor (Sarah)
    await page.goto('/login');
    await page.fill('input[type="email"]', 'sarah@vibecut.ai');
    await page.fill('input[type="password"]', 'password');
    await page.click('button:has-text("Sign In with Email")');

    // 2. Verify dashboard and navigate to Team Workspace
    await expect(page).toHaveURL(/\/dashboard/);
    await page.goto('/dashboard/team');

    // 3. Verify invitation form is hidden and warning banner is visible
    await expect(page.locator('form')).not.toBeVisible();
    await expect(page.locator('text=Only the Workspace Owner has permissions to invite new collaborators')).toBeVisible();
  });
});
