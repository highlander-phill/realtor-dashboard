# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\car-sales-onboarding.test.ts >> car sales onboarding flow
- Location: tests\car-sales-onboarding.test.ts:3:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
Call log:
  - navigating to "http://localhost:3000/carsales/onboarding?key=setup", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('car sales onboarding flow', async ({ page }) => {
  4  |   // Navigate to onboarding with a test key to bypass Turnstile if implemented
> 5  |   await page.goto('http://localhost:3000/carsales/onboarding?key=setup');
     |              ^ Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
  6  | 
  7  |   // Step 0: Company Details
  8  |   await page.fill('input[id="companyName"]', 'RooRoo Car Sales');
  9  |   await page.click('text=Car Sales');
  10 |   await page.click('button:has-text("Continue")');
  11 |   
  12 |   // Step 1: Security
  13 |   await page.fill('input[id="adminEmail"]', 'admin@rooroo.com');
  14 |   await page.fill('input[id="adminPassword"]', 'password123');
  15 |   await page.click('button:has-text("Continue")');
  16 | 
  17 |   // Step 2: Branding (Skip for now, keep default)
  18 |   await page.click('button:has-text("Continue")');
  19 | 
  20 |   // Step 3: Goals
  21 |   await page.fill('input[id="annualGoal"]', '5000000');
  22 |   // Need to handle Turnstile? If testing in local, maybe it's not rendering or can be ignored.
  23 |   // Assuming it's bypassed in test environment or it's not rendered.
  24 |   
  25 |   await page.click('button:has-text("Finish & Launch")');
  26 |   
  27 |   // Verify navigation
  28 |   await page.waitForURL('http://localhost:3000/carsales');
  29 |   
  30 |   // Verify terminology "Dashboard"
  31 |   await expect(page.locator('h1')).toContainText(/RooRoo Car Sales/);
  32 | });
  33 | 
```