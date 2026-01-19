import { test, expect } from '@playwright/test';

test.describe('Silent Provisioning', () => {
  test('should automatically create workspace and redirect to dashboard after signup', async ({ page }) => {
    // 1. Generate a random email to ensure a fresh user
    const randomSuffix = Math.random().toString(36).substring(7);
    const email = `ninja.gen.z.test.${randomSuffix}@gmail.com`;
    const password = 'Password123!@#';

    console.log(`Testing signup with: ${email}`);

    // 2. Go to signup page
    await page.goto('/signup');

    // 3. Fill out signup form (using IDs as per implementation)
    await page.fill('#email', email);
    await page.fill('#password', password);
    
    // 4. Submit form
    await page.click('button[type="submit"]');

    // 5. Verify redirection to dashboard (skipping onboarding)
    // We expect to land on / which is the dashboard
    // Increased timeout for redirection and backend processing
    await expect(page).toHaveURL('/', { timeout: 15000 });
    
    // 6. Verify "My Workspace" is present
    // The workspace name 'My Workspace' is hardcoded in the migration
    await expect(page.getByText('My Workspace')).toBeVisible({ timeout: 15000 });
    
    // 7. Verify no onboarding wizard elements are present
    await expect(page.getByText('Welcome to Ninja Gen Z')).not.toBeVisible();
    await expect(page.getByText('Let\'s set up your workspace')).not.toBeVisible();
  });
});
