import { test, expect } from '@playwright/test';
import { PrismaClient } from '../../backend/node_modules/@prisma/client';

const prisma = new PrismaClient();

test.describe('Team Collaboration & Email Invitations Flow', () => {
  test('should allow owner to invite collaborator, and collaborator to claim invite and access projects', async ({ page }) => {
    // 1. Log in as the Owner (Alex Creator)
    await page.goto('/login');
    await page.fill('input[type="email"]', 'alex@vibecut.ai');
    await page.fill('input[type="password"]', 'password');
    await page.click('button:has-text("Sign In with Email")');
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('h1').last()).toHaveText(/Dashboard/i, { timeout: 15000 });

    // 2. Go to the Team Workspace page
    await page.goto('/dashboard/team');
    await expect(page.locator('h1').last()).toHaveText('Team Workspace', { timeout: 15000 });

    // 3. Invite a new collaborator
    await page.fill('input[placeholder="Sarah Editor"]', 'Collab Test');
    await page.fill('input[placeholder="editor@company.com"]', 'collab-test@vibecut.ai');
    
    // Select role (EDITOR is default)
    await page.selectOption('select >> nth=0', 'EDITOR');
    
    // Select Project (YouTube Growth Channel)
    await page.selectOption('select >> nth=1', { label: 'YouTube Growth Channel' });

    // Submit the form
    await page.click('button:has-text("Send Collaboration Invite")');

    // 4. Verify that the invitation appears under the Pending list
    const pendingCard = page.locator('div.p-3', { hasText: 'Collab Test' }).first();
    await expect(pendingCard).toBeVisible({ timeout: 10000 });
    await expect(pendingCard.locator('text=Project: YouTube Growth Channel')).toBeVisible();

    // Log out to claim as an unauthenticated guest
    await page.evaluate(() => localStorage.removeItem('vibecut_token'));

    // 5. Query the database to retrieve the unique secure invitation token
    const invite = await prisma.invitation.findFirst({
      where: { email: 'collab-test@vibecut.ai', status: 'PENDING' }
    });
    expect(invite).not.toBeNull();
    const token = invite?.token;

    // 6. Navigate to the Claim Invite page with the token
    await page.goto(`/claim-invite?token=${token}`);
    
    // Verify the welcome screen details
    await expect(page.locator('h3')).toHaveText('Join the Collaboration Workspace');
    await expect(page.locator('text=Alex Creator')).toBeVisible();
    await expect(page.locator('text=Project: YouTube Growth Channel')).toBeVisible();

    // 7. Complete the registration form
    await page.fill('input[placeholder="Sarah Editor"]', 'Collab Test User');
    await page.fill('input[placeholder="••••••••"] >> nth=0', 'collabpassword123');
    await page.fill('input[placeholder="••••••••"] >> nth=1', 'collabpassword123');
    await page.click('button:has-text("Claim Seat & Join Team")');

    // 8. Verify direct login and redirect to the dashboard (bypassing onboarding)
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('h1').last()).toHaveText(/Dashboard/i, { timeout: 15000 });

    // 9. Go to Projects page and verify access to the shared project
    await page.goto('/dashboard/projects');
    await expect(page.locator('h1').last()).toHaveText('Projects', { timeout: 15000 });
    await expect(page.locator('div', { hasText: 'YouTube Growth Channel' }).first()).toBeVisible();
  });
});
