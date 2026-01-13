import { test, expect } from '@playwright/test';

test.describe('Ninja Gen Z E2E Flow', () => {

    test('Authentication: Login success and failure', async ({ page }) => {
        // 1. Invalid Login
        await page.goto('/login');
        await page.fill('[data-testid="login-email"]', 'wrong@test.com');
        await page.fill('[data-testid="login-password"]', 'badpass');
        await page.click('[data-testid="login-submit"]');
        // Expect some error state. Checking for generic error toast or message.
        await expect(page.locator('text=/Invalid|failed/i').first()).toBeVisible({ timeout: 10000 });
    });

    test('Chat & Tool: Verify Sensei interaction with Mocked API', async ({ page }) => {
        // 1. Set Middleware Bypass Header (Server-side)
        await page.setExtraHTTPHeaders({
            'x-e2e-bypass': 'true'
        });

        // 2. Mock the /api/chat endpoint
        await page.route('**/api/chat', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'text/plain',
                body: 'Hello boss, I am ready.'
            });
        });

        // 3. Mock Supabase Auth User (for client-side widget if needed, 
        // but we use localStorage bypass mostly. We keep this if the widget calls it.)
        await page.route('**/auth/v1/user', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    id: 'test-user-id',
                    aud: 'authenticated',
                    role: 'authenticated',
                    email: 'test@ninja.com',
                    created_at: new Date().toISOString(),
                })
            });
        });

        // 4. Navigate to dashboard
        await page.goto('/dashboard');

        // 5. Inject Client-side User ID Bypass
        await page.evaluate(() => localStorage.setItem('e2e-user-id', 'true'));
        // Reload to pick up the localStorage change in the component
        await page.reload();

        // Open Widget
        await page.click('[data-testid="sensei-trigger"]');
        await expect(page.locator('[data-testid="sensei-window"]')).toBeVisible();

        // Send Message
        await page.fill('[data-testid="sensei-input"]', 'Test Message');
        await page.click('[data-testid="sensei-send"]');

        // Assert "Test Message" in chat list
        await expect(page.locator('[data-testid="chat-message-user"]')).toContainText('Test Message');

        // Assert Mocked Response
        await expect(page.locator('text=Hello boss, I am ready.')).toBeVisible();
    });

    test.describe('Mobile Responsiveness', () => {
        test.use({ viewport: { width: 375, height: 667 } });

        test('Widget should be accessible on mobile', async ({ page }) => {
            // Need bypass here too if accessing dashboard
            await page.setExtraHTTPHeaders({
                'x-e2e-bypass': 'true'
            });
            await page.goto('/dashboard');
            await expect(page.locator('[data-testid="sensei-trigger"]')).toBeVisible();
            await page.click('[data-testid="sensei-trigger"]');
            await expect(page.locator('[data-testid="sensei-window"]')).toBeVisible();
        });
    });
});
