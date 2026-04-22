import { test, expect } from '@playwright/test';

test.describe('Tenant Lifecycle', () => {
  const subdomain = `e2e-test-${Date.now()}`;
  const adminEmail = `testadmin-${subdomain}@example.com`;
  const adminPassword = 'password123';
  const agentName = 'Test Agent 007';
  const agentGoal = 7000000;

  test('should allow a new tenant to onboard, manage agents, and be deleted', async ({ page }) => {
    // Step 1: Onboarding
    await page.route('/cdn-cgi/challenge-platform/h/b/pat/.*', route => {
      console.log(`[Network Intercept] Bypassing Cloudflare PAT challenge: ${route.request().url()}`);
      route.fulfill({
        status: 200,
        contentType: 'text/plain',
        body: '',
      });
    });
    
    await page.goto('/');
    await page.getByPlaceholder('your-team-name').fill(subdomain);
    await page.getByRole('button', { name: 'Get Started' }).click();
    
    await expect(page).toHaveURL(new RegExp(`\/${subdomain}\/onboarding`));
    await page.getByPlaceholder('Your Company Name').fill(`${subdomain} Company`);
    await page.getByPlaceholder('your-email@example.com').fill(adminEmail);
    await page.getByPlaceholder('••••••••').fill(adminPassword);
    await page.getByRole('button', { name: 'Create My Dashboard' }).click();

    await expect(page).toHaveURL(new RegExp(`\/${subdomain}\/admin`));

    // Step 2: Add and Verify Agent
    await page.getByRole('button', { name: 'New Agent' }).click();
    await page.locator('input[value="New Agent"]').fill(agentName);
    await page.locator('input[type="number"][value="5000000"]').fill(agentGoal.toString());
    await page.getByRole('button', { name: 'Publish Updates' }).click();

    // The alert dialog confirms the save
    page.on('dialog', dialog => dialog.accept());
    
    // Reload to verify persistence
    await page.reload();
    
    await expect(page.locator(`input[value="${agentName}"]`)).toBeVisible();
    await expect(page.locator(`input[value="${agentGoal}"]`)).toBeVisible();

    // Step 3: Verify Public Dashboard
    await page.goto(`/${subdomain}`);
    await expect(page.getByText(agentName)).toBeVisible();

    // Step 4: Login as Master Admin and Delete Tenant
    await page.goto('/master/login');
    await page.getByRole('button', { name: 'Use Master Password' }).click();
    await page.getByPlaceholder('your-email@example.com').fill('phillsimpson@gmail.com');
    await page.getByPlaceholder('••••••••').fill('4WeeStella$');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    await expect(page).toHaveURL('/master');
    await expect(page.getByText(`${subdomain} Company`)).toBeVisible();

    const tenantRow = page.locator('tr', { hasText: subdomain });
    await tenantRow.getByRole('button', { name: 'Delete' }).click();
    
    await expect(page.getByText(new RegExp(`permanently delete the tenant ${subdomain} Company`))).toBeVisible();
    await page.getByRole('button', { name: 'Confirm Deletion' }).click();

    // Verify tenant is gone from the list
    await expect(page.getByText(`${subdomain} Company`)).not.toBeVisible();

    // Step 5: Verify Tenant is Inaccessible
    await page.goto(`/${subdomain}`);
    await expect(page.getByText(`Welcome to Your Team Dash`)).toBeVisible();
    await expect(page.getByText(subdomain, { exact: true })).toBeVisible();
  });
});
