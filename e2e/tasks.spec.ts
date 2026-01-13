import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Inject mock user to bypass auth
  await page.addInitScript(() => {
    (window as any).__MOCK_USER__ = {
      id: 'test-user-id',
      email: 'test@example.com',
      aud: 'authenticated',
      role: 'authenticated',
    };
  });
});

test('has title', async ({ page }) => {
  await page.goto('/tasks');
  await expect(page.getByRole('heading', { name: /Tasks/i })).toBeVisible();
});

test('can open new task dialog', async ({ page }) => {
  await page.goto('/tasks');

  // Click "New Task" button
  await page.getByRole('button', { name: /New Task/i }).click();

  // Check if dialog is open
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('heading', { name: /Add New Task/i })).toBeVisible();
  
  // Check form fields
  await expect(page.getByLabel(/Title/i)).toBeVisible();
  
  // Check that we have 3 Select triggers (Project, Status, Priority)
  // Project (Optional/No Project), Status (Backlog), Priority (Medium)
  await expect(page.getByRole('combobox')).toHaveCount(3);
  
  // Check specifically for Status (it defaults to Backlog)
  await expect(page.getByRole('combobox').filter({ hasText: 'Backlog' })).toBeVisible();
});
