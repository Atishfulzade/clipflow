import { test, expect } from '@playwright/test';

test.describe('Billing & Stripe Upgrades Flow', () => {
  test('should display current plan and support upgrading to Agency tier', async ({ page }) => {
    // Log in first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'alex@vibecut.ai');
    await page.fill('input[type="password"]', 'password');
    await page.click('button:has-text("Sign In with Email")');
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('h1').last()).toHaveText(/Dashboard/i, { timeout: 15000 });

    // 1. Visit the billing page
    await page.goto('/dashboard/billing');
    await expect(page.locator('h1').last()).toHaveText('Billing & Subscriptions', { timeout: 15000 });

    // 2. Verify current plan is "Pro Plan" (based on seeded dataset)
    const activePlanHeader = page.locator('h3', { hasText: 'Plan' }).first();
    await expect(activePlanHeader).toHaveText(/Pro Plan/i);

    // 3. Find the Agency Tier compare plan card
    const agencyCard = page.locator('div', { hasText: 'Agency Tier' }).first();
    await expect(agencyCard).toBeVisible();

    // 4. Click the "Upgrade Tier" button on the Agency Card
    // Since Pro is currently active, the Agency card will show "Upgrade Tier"
    const upgradeButton = agencyCard.locator('button:has-text("Upgrade Tier")');
    await expect(upgradeButton).toBeVisible();
    await upgradeButton.click();

    // 5. Verify the URL is redirected and re-renders successfully on the billing dashboard
    // The redirect loops back to /dashboard/billing?session_id=...&plan=AGENCY, and parameters are quickly stripped for clean UX.
    await expect(page).toHaveURL(/\/dashboard\/billing/, { timeout: 10000 });


    // 6. Verify that the plan status has transitioned to "Agency Plan"
    await expect(activePlanHeader).toHaveText(/Agency Plan/i, { timeout: 10000 });

    // 7. Verify the invoice history renewal shows the new Agency cost ($99.00)
    await expect(page.locator('div', { hasText: 'June 22, 2026' }).first()).toBeVisible();
    await expect(page.locator('p', { hasText: '$99.00' }).first()).toBeVisible();
  });
});
