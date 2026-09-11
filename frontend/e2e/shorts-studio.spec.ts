import { test, expect } from '@playwright/test';

test.describe('Shorts Studio Editing & Rendering Flow', () => {
  test('should allow custom subtitle styling and trigger video rendering', async ({ page }) => {
    // Log in first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'alex@vibecut.ai');
    await page.fill('input[type="password"]', 'password');
    await page.click('button:has-text("Sign In with Email")');
    await expect(page).toHaveURL(/\/dashboard/);

    // 1. Visit the Shorts Studio page
    await page.goto('/dashboard/shorts');
    await expect(page.locator('h1').last()).toHaveText('Shorts Studio', { timeout: 15000 });

    // 2. Wait for the seeded clip "The #1 SaaS Growth Mistake" to load in the sidebar and click it
    const clipSelector = page.locator('div:has-text("The #1 SaaS Growth Mistake")').first();
    await expect(clipSelector).toBeVisible({ timeout: 10000 });
    await clipSelector.click();

    // 3. Verify that the 9:16 visual preview editor panel is activated
    await expect(page.locator('h3', { hasText: '9:16 Visual Studio' })).toBeVisible();

    // 4. Change subtitle style to "Podcast Glow"
    const podcastGlowButton = page.locator('button:has-text("Podcast Glow")');
    await expect(podcastGlowButton).toBeVisible();
    await podcastGlowButton.click();

    // Verify that the podcast preview element is displayed in the 9:16 layout
    await expect(page.locator('span', { hasText: 'biggest' }).first()).toBeVisible();

    // 5. Toggle checkboxes for progressive rendering features
    const emojiCheckbox = page.locator('input[type="checkbox"]').nth(0);
    const progressCheckbox = page.locator('input[type="checkbox"]').nth(1);
    
    // Toggle them off/on to verify functionality
    await emojiCheckbox.setChecked(false);
    await progressCheckbox.setChecked(true);

    // 6. Trigger rendering
    const renderButton = page.locator('button:has-text("Render Styled Video")');
    await expect(renderButton).toBeEnabled();
    await renderButton.click();

    // 7. Verify the rendering loading overlay becomes active
    await expect(page.locator('p', { hasText: 'Rendering Captions...' })).toBeVisible();

    // 8. Wait for render completion (the loading overlay should disappear)
    await expect(page.locator('p', { hasText: 'Rendering Captions...' })).not.toBeVisible({ timeout: 15000 });

    // 9. Verify the button becomes active again
    await expect(renderButton).toBeEnabled();
  });

  test('should allow saving, applying, and deleting custom brand presets', async ({ page }) => {
    // Log in first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'alex@vibecut.ai');
    await page.fill('input[type="password"]', 'password');
    await page.click('button:has-text("Sign In with Email")');
    await expect(page).toHaveURL(/\/dashboard/);

    // 1. Visit the Shorts Studio page
    await page.goto('/dashboard/shorts');
    await expect(page.locator('h1').last()).toHaveText('Shorts Studio', { timeout: 15000 });

    // 2. Wait for the seeded clip "The #1 SaaS Growth Mistake" to load in the sidebar and click it
    const clipSelector = page.locator('div:has-text("The #1 SaaS Growth Mistake")').first();
    await expect(clipSelector).toBeVisible({ timeout: 10000 });
    await clipSelector.click();

    // 3. Set subtitle style to "Minimalist", check emojis off, set watermark text
    const minimalistButton = page.locator('button:has-text("Minimalist")');
    await expect(minimalistButton).toBeVisible();
    await minimalistButton.click();

    const emojiCheckbox = page.locator('input[type="checkbox"]').nth(0);
    await emojiCheckbox.setChecked(false);

    // Set custom watermark text
    const watermarkInput = page.getByPlaceholder('e.g. VIBECUT.AI');
    await expect(watermarkInput).toBeVisible();
    await watermarkInput.fill('MYBRAND.IO');

    // Set custom subtitle font & caption position
    const fontDropdown = page.locator('select').filter({ has: page.locator('option[value="Arial"]') });
    const positionDropdown = page.locator('select').filter({ has: page.locator('option[value="bottom"]') });
    await fontDropdown.selectOption('Montserrat');
    await positionDropdown.selectOption('middle');

    // 4. Click "Save Preset" to open the modal
    const savePresetButton = page.locator('button:has-text("Save Preset")');
    await expect(savePresetButton).toBeVisible();
    await savePresetButton.click();

    // 5. Fill the preset name and submit
    const presetNameInput = page.getByPlaceholder('e.g. Neon Podcast, Minimalist Bold');
    await expect(presetNameInput).toBeVisible();
    await presetNameInput.fill('Spec Test Preset');

    const modalSaveButton = page.locator('button:has-text("Save Preset")').last();
    await expect(modalSaveButton).toBeVisible();
    await modalSaveButton.click();

    // 6. Verify that "Spec Test Preset" is now available in the dropdown
    const presetDropdown = page.locator('select').first();
    await expect(presetDropdown).toBeVisible();
    await expect(presetDropdown.locator('option', { hasText: 'Spec Test Preset' })).toBeAttached();

    // 7. Reset state to default Beast Style
    const beastButton = page.locator('button:has-text("Beast Style")');
    await beastButton.click();
    await emojiCheckbox.setChecked(true);
    await watermarkInput.fill('DIFFERENT');
    await fontDropdown.selectOption('Arial');
    await positionDropdown.selectOption('bottom');

    // 8. Select "Spec Test Preset" from the dropdown and verify styling is restored
    await presetDropdown.selectOption({ label: 'Spec Test Preset' });

    // Verify state values got restored
    await expect(page.locator('span', { hasText: 'simple' }).first()).toBeVisible(); // Minimalist text
    await expect(emojiCheckbox).not.toBeChecked();
    await expect(watermarkInput).toHaveValue('MYBRAND.IO');
    await expect(fontDropdown).toHaveValue('Montserrat');
    await expect(positionDropdown).toHaveValue('middle');

    // Verify visual preview container style/class applications
    const minimalistText = page.locator('div:has-text("scaling simple.")').last();
    await expect(minimalistText).toHaveCSS('font-family', /Montserrat/);
    await expect(minimalistText.locator('..')).toHaveClass(/top-1\/2/);

    // 9. Clean up preset by deleting it
    const deletePresetButton = page.locator('button:has-text("Delete")');
    await expect(deletePresetButton).toBeVisible();
    
    // Click delete to open the custom confirmation modal
    await deletePresetButton.click();

    // Click "Delete" button inside the custom modal
    const confirmDeleteBtn = page.locator('div.fixed button:has-text("Delete")');
    await expect(confirmDeleteBtn).toBeVisible();
    await confirmDeleteBtn.click();

    // Verify it is removed from dropdown
    await expect(presetDropdown.locator('option', { hasText: 'Spec Test Preset' })).not.toBeAttached();
  });
});
