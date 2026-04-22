import { test, expect } from '@playwright/test';

test.describe('Admin Authentication', () => {

  test('should allow master admin to login', async ({ page }) => {
    await page.route('/cdn-cgi/challenge-platform/h/b/pat/.*', route => {
      console.log(`[Network Intercept] Bypassing Cloudflare PAT challenge: ${route.request().url()}`);
      route.fulfill({
        status: 200,
        contentType: 'text/plain',
        body: '',
      });
    });
    
    await page.goto('/master/login');
    page.on('pageerror', exception => console.log(`Uncaught exception: ${exception}`));
    page.on('console', msg => console.log(`[Browser Console] ${msg.type().toUpperCase()}: ${msg.text()}`));
    
    await page.route('**', route => {
      console.log(`[Network Request] ${route.request().method()} ${route.request().url()} - ${route.request().resourceType()}`);
      route.continue();
    });
    
    await page.getByRole('button', { name: 'Use Master Password' }).click();
    await page.getByPlaceholder('your-email@example.com').fill('phillsimpson@gmail.com');
    await page.getByPlaceholder('••••••••').fill('4WeeStella$');
    await page.getByRole('button', { name: 'Access System' }).click();
    
    await expect(page).toHaveURL('/master');
    await expect(page.getByText('TEAMGOALS MASTER CONTROL')).toBeVisible();
  });

});
