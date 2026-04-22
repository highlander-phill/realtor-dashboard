# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tenant-lifecycle.spec.ts >> Tenant Lifecycle >> should allow a new tenant to onboard, manage agents, and be deleted
- Location: tests\tenant-lifecycle.spec.ts:10:7

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
Call log:
  - navigating to "http://localhost:3002/", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Tenant Lifecycle', () => {
  4  |   const subdomain = `e2e-test-${Date.now()}`;
  5  |   const adminEmail = `testadmin-${subdomain}@example.com`;
  6  |   const adminPassword = 'password123';
  7  |   const agentName = 'Test Agent 007';
  8  |   const agentGoal = 7000000;
  9  | 
  10 |   test('should allow a new tenant to onboard, manage agents, and be deleted', async ({ page }) => {
  11 |     // Step 1: Onboarding
> 12 |     await page.goto('/');
     |                ^ Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
  13 |     await page.getByPlaceholder('your-team-name').fill(subdomain);
  14 |     await page.getByRole('button', { name: 'Get Started' }).click();
  15 |     
  16 |     await expect(page).toHaveURL(new RegExp(`\/${subdomain}\/onboarding`));
  17 |     await page.getByPlaceholder('Your Company Name').fill(`${subdomain} Company`);
  18 |     await page.getByPlaceholder('your-email@example.com').fill(adminEmail);
  19 |     await page.getByPlaceholder('••••••••').fill(adminPassword);
  20 |     await page.getByRole('button', { name: 'Create My Dashboard' }).click();
  21 | 
  22 |     await expect(page).toHaveURL(new RegExp(`\/${subdomain}\/admin`));
  23 | 
  24 |     // Step 2: Add and Verify Agent
  25 |     await page.getByRole('button', { name: 'New Agent' }).click();
  26 |     await page.locator('input[value="New Agent"]').fill(agentName);
  27 |     await page.locator('input[type="number"][value="5000000"]').fill(agentGoal.toString());
  28 |     await page.getByRole('button', { name: 'Publish Updates' }).click();
  29 | 
  30 |     // The alert dialog confirms the save
  31 |     page.on('dialog', dialog => dialog.accept());
  32 |     
  33 |     // Reload to verify persistence
  34 |     await page.reload();
  35 |     
  36 |     await expect(page.locator(`input[value="${agentName}"]`)).toBeVisible();
  37 |     await expect(page.locator(`input[value="${agentGoal}"]`)).toBeVisible();
  38 | 
  39 |     // Step 3: Verify Public Dashboard
  40 |     await page.goto(`/${subdomain}`);
  41 |     await expect(page.getByText(agentName)).toBeVisible();
  42 | 
  43 |     // Step 4: Login as Master Admin and Delete Tenant
  44 |     await page.goto('/master/login');
  45 |     await page.getByRole('button', { name: 'Use Master Password' }).click();
  46 |     await page.getByPlaceholder('your-email@example.com').fill('phillsimpson@gmail.com');
  47 |     await page.getByPlaceholder('••••••••').fill('4WeeStella$');
  48 |     await page.getByRole('button', { name: 'Sign In' }).click();
  49 |     
  50 |     await expect(page).toHaveURL('/master');
  51 |     await expect(page.getByText(`${subdomain} Company`)).toBeVisible();
  52 | 
  53 |     const tenantRow = page.locator('tr', { hasText: subdomain });
  54 |     await tenantRow.getByRole('button', { name: 'Delete' }).click();
  55 |     
  56 |     await expect(page.getByText(new RegExp(`permanently delete the tenant ${subdomain} Company`))).toBeVisible();
  57 |     await page.getByRole('button', { name: 'Confirm Deletion' }).click();
  58 | 
  59 |     // Verify tenant is gone from the list
  60 |     await expect(page.getByText(`${subdomain} Company`)).not.toBeVisible();
  61 | 
  62 |     // Step 5: Verify Tenant is Inaccessible
  63 |     await page.goto(`/${subdomain}`);
  64 |     await expect(page.getByText(`Welcome to Your Team Dash`)).toBeVisible();
  65 |     await expect(page.getByText(subdomain, { exact: true })).toBeVisible();
  66 |   });
  67 | });
  68 | 
```