import { test, expect } from '@playwright/test';
import { PrismaClient } from '../../backend/node_modules/@prisma/client';

const prisma = new PrismaClient();

test.describe('Forgot Password & Account Recovery Flow', () => {
  test('should allow a user to request a password reset link and set a new password', async ({ page }) => {
    // 1. Sign up a new test user to isolate this test from other parallel tests
    await page.goto('/signup');
    await page.fill('input[placeholder="Alex Creator"]', 'Reset Test User');
    await page.fill('input[placeholder="name@example.com"]', 'reset-test-user@vibecut.ai');
    await page.fill('input[placeholder="••••••••"]', 'oldsecurepassword123');
    await page.click('button:has-text("Sign Up with Email")');

    // Redirected to onboarding, let's log out by clearing the token to start recovery unauthenticated
    await expect(page).toHaveURL(/\/onboarding/);
    await page.evaluate(() => localStorage.removeItem('vibecut_token'));
    await page.goto('/login');
    await page.click('a:has-text("Forgot?")');

    // 2. Verify redirect to /forgot-password
    await expect(page).toHaveURL(/\/forgot-password/);
    await expect(page.locator('h2')).toHaveText('Recover account');

    // 3. Request reset link for our new test user
    await page.fill('input[placeholder="name@example.com"]', 'reset-test-user@vibecut.ai');
    await page.click('button:has-text("Send Reset Link")');

    // 4. Verify success screen
    await expect(page.locator('h2')).toHaveText('Reset link sent');

    // 5. Query the database directly to fetch the generated token for our test user
    const user = await prisma.user.findUnique({
      where: { email: 'reset-test-user@vibecut.ai' },
      select: { resetToken: true }
    });

    expect(user?.resetToken).not.toBeNull();
    const token = user?.resetToken;

    // 6. Navigate to the reset password page with the token
    await page.goto(`/reset-password?token=${token}`);
    await expect(page.locator('h2')).toHaveText('Set new password');

    // 7. Input new password
    await page.fill('input[placeholder="••••••••"] >> nth=0', 'newsecurepassword123');
    await page.fill('input[placeholder="••••••••"] >> nth=1', 'newsecurepassword123');
    await page.click('button:has-text("Reset Password")');

    // 8. Verify success state and redirect back to login
    await expect(page.locator('h2')).toHaveText('Password updated');
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

    // 9. Try logging in with the updated password
    await page.fill('input[placeholder="name@example.com"]', 'reset-test-user@vibecut.ai');
    await page.fill('input[placeholder="••••••••"]', 'newsecurepassword123');
    await page.click('button:has-text("Sign In with Email")');

    // 10. Verify successful dashboard redirect
    await expect(page).toHaveURL(/\/onboarding/); // Since it's a new user, they go to onboarding first
  });
});
