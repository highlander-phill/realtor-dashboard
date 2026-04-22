# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-login.spec.ts >> Admin Authentication >> should allow master admin to login
- Location: tests\admin-login.spec.ts:5:7

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
Call log:
  - navigating to "http://localhost:3002/master/login", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Admin Authentication', () => {
  4  | 
  5  |   test('should allow master admin to login', async ({ page }) => {
> 6  |     await page.goto('/master/login');
     |                ^ Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
  7  |     await page.getByRole('button', { name: 'Use Master Password' }).click();
  8  |     await page.getByPlaceholder('your-email@example.com').fill('phillsimpson@gmail.com');
  9  |     await page.getByPlaceholder('••••••••').fill('4WeeStella$');
  10 |     await page.getByRole('button', { name: 'Access System' }).click();
  11 |     
  12 |     await expect(page).toHaveURL('/master');
  13 |     await expect(page.getByText('TEAMGOALS MASTER CONTROL')).toBeVisible();
  14 |   });
  15 | 
  16 | });
  17 | 
```