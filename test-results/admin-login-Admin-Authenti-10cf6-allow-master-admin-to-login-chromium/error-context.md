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
Error: locator.fill: Test timeout of 60000ms exceeded.
Call log:
  - waiting for getByPlaceholder('your-email@example.com')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - img [ref=e7]
      - generic [ref=e9]:
        - generic [ref=e10]: Master Control
        - generic [ref=e11]: Restricted Platform Access
    - generic [ref=e12]:
      - button "Super Admin Google Login" [ref=e13]:
        - img
        - text: Super Admin Google Login
      - generic [ref=e18]: Internal Recovery
      - generic [ref=e19]:
        - generic [ref=e20]:
          - generic [ref=e21]: Global System Password
          - generic [ref=e22]:
            - img [ref=e23]
            - textbox "••••••••••••" [ref=e27]
        - button "Access System" [ref=e31]:
          - text: Access System
          - img
        - button "Cancel" [ref=e32]
    - paragraph [ref=e34]: TeamGoals Engine v2.3.1
  - alert [ref=e35]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Admin Authentication', () => {
  4  | 
  5  |   test('should allow master admin to login', async ({ page }) => {
  6  |     await page.route('/cdn-cgi/challenge-platform/h/b/pat/.*', route => {
  7  |       console.log(`[Network Intercept] Bypassing Cloudflare PAT challenge: ${route.request().url()}`);
  8  |       route.fulfill({
  9  |         status: 200,
  10 |         contentType: 'text/plain',
  11 |         body: '',
  12 |       });
  13 |     });
  14 |     
  15 |     await page.goto('/master/login');
  16 |     page.on('pageerror', exception => console.log(`Uncaught exception: ${exception}`));
  17 |     page.on('console', msg => console.log(`[Browser Console] ${msg.type().toUpperCase()}: ${msg.text()}`));
  18 |     
  19 |     await page.route('**', route => {
  20 |       console.log(`[Network Request] ${route.request().method()} ${route.request().url()} - ${route.request().resourceType()}`);
  21 |       route.continue();
  22 |     });
  23 |     
  24 |     await page.getByRole('button', { name: 'Use Master Password' }).click();
> 25 |     await page.getByPlaceholder('your-email@example.com').fill('phillsimpson@gmail.com');
     |                                                           ^ Error: locator.fill: Test timeout of 60000ms exceeded.
  26 |     await page.getByPlaceholder('••••••••').fill('4WeeStella$');
  27 |     await page.getByRole('button', { name: 'Access System' }).click();
  28 |     
  29 |     await expect(page).toHaveURL('/master');
  30 |     await expect(page.getByText('TEAMGOALS MASTER CONTROL')).toBeVisible();
  31 |   });
  32 | 
  33 | });
  34 | 
```