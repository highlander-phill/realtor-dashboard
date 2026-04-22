import { test, expect } from '@playwright/test';

test.describe('Admin Authentication', () => {

  test('should allow master admin to login', async ({ page }) => {
    await page.goto('/master/login');
    await page.getByRole('button', { name: 'Use Master Password' }).click();
    await page.getByPlaceholder('your-email@example.com').fill('phillsimpson@gmail.com');
    await page.getByPlaceholder('••••••••').fill('4WeeStella$');
    await page.getByRole('button', { name: 'Access System' }).click();
    
    await expect(page).toHaveURL('/master');
    await expect(page.getByText('TEAMGOALS MASTER CONTROL')).toBeVisible();
  });

});
