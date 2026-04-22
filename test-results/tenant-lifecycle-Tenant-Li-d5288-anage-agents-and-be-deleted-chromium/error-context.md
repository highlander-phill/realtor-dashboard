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
Error: locator.fill: Test timeout of 60000ms exceeded.
Call log:
  - waiting for getByPlaceholder('your-team-name')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - navigation [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e5]:
          - generic [ref=e6] [cursor=pointer]: TG
          - generic [ref=e7]: TeamGoals
        - link "Features" [ref=e9] [cursor=pointer]:
          - /url: "#features"
    - generic [ref=e11]:
      - generic [ref=e12]:
        - generic [ref=e13]:
          - img [ref=e14]
          - text: The Professional Standard
        - heading "Elite Sales Leaderboards." [level=1] [ref=e16]:
          - text: Elite Sales
          - text: Leaderboards.
        - paragraph [ref=e17]: Real-time performance tracking for modern sales teams. Visualize your goals, track every deal, and dominate your market with the professional standard in sales dashboards.
      - generic [ref=e18]:
        - generic [ref=e21]:
          - textbox "Enter your team name (no spaces)" [ref=e22]
          - button "GO" [ref=e23]:
            - text: GO
            - img
        - generic [ref=e24]:
          - paragraph [ref=e25]: "Try it now:"
          - button "/demo" [ref=e26]
    - generic [ref=e28]:
      - generic [ref=e29]:
        - heading "Experience the Interface" [level=2] [ref=e30]
        - paragraph [ref=e31]: Toggle between real-world performance views.
      - generic [ref=e35]:
        - generic [ref=e41]:
          - img [ref=e42]
          - text: team-goals.com/demo
        - generic [ref=e45]:
          - generic [ref=e48]: NS
          - generic [ref=e55]:
            - generic [ref=e56]:
              - generic [ref=e57]:
                - generic [ref=e60]: $22,450,000
                - generic [ref=e63]: 45%
              - generic [ref=e65]:
                - generic [ref=e66]: Production Progress
                - generic [ref=e67]: "Goal: $50,000,000"
            - generic [ref=e70]:
              - generic [ref=e71]:
                - paragraph [ref=e72]: Listing to Close
                - paragraph [ref=e73]: "0.85"
              - generic [ref=e74]:
                - paragraph [ref=e75]: Buyer vs Seller
                - paragraph [ref=e76]: "1.20"
              - generic [ref=e77]:
                - paragraph [ref=e78]: Avg Deal Size
                - paragraph [ref=e79]: $850k
          - img [ref=e83]
    - generic [ref=e112]:
      - generic [ref=e113]:
        - heading "Engineered for Success" [level=2] [ref=e114]
        - paragraph [ref=e115]: The tools you need to push your team further, faster.
      - generic [ref=e116]:
        - generic [ref=e117]:
          - img [ref=e119]
          - generic [ref=e122]:
            - heading "Real-Time Tracking" [level=3] [ref=e123]
            - paragraph [ref=e124]: Live updates on volume, closings, and pending deals across your entire roster.
        - generic [ref=e125]:
          - img [ref=e127]
          - generic [ref=e130]:
            - heading "Multi-Industry Themes" [level=3] [ref=e131]
            - paragraph [ref=e132]: Tailored nomenclature for Real Estate, Insurance, and General Sales teams.
        - generic [ref=e133]:
          - img [ref=e135]
          - generic [ref=e138]:
            - heading "TV Mode Optimized" [level=3] [ref=e139]
            - paragraph [ref=e140]: Designed for office displays with auto-refreshing metrics and high-visibility charts.
        - generic [ref=e141]:
          - img [ref=e143]
          - generic [ref=e148]:
            - heading "Agent Profiles" [level=3] [ref=e149]
            - paragraph [ref=e150]: Individual drill-downs with detailed transaction history and goal progress.
        - generic [ref=e151]:
          - img [ref=e153]
          - generic [ref=e155]:
            - heading "Secure Management" [level=3] [ref=e156]
            - paragraph [ref=e157]: Admin consoles protected by modern security for every individual dashboard.
        - generic [ref=e158]:
          - img [ref=e160]
          - generic [ref=e164]:
            - heading "Division Support" [level=3] [ref=e165]
            - paragraph [ref=e166]: Organize your roster into sub-teams with their own production goals.
    - generic [ref=e170]:
      - generic [ref=e171]:
        - heading "Start Winning Today." [level=2] [ref=e172]:
          - text: Start Winning
          - text: Today.
        - paragraph [ref=e173]: Simple, transparent pricing for growing teams.
      - generic [ref=e175]:
        - generic [ref=e176]:
          - paragraph [ref=e177]: $1
          - paragraph [ref=e178]: per month / 10 users
        - generic [ref=e180]:
          - paragraph [ref=e181]:
            - img [ref=e183]
            - text: 30-Day Free Trial
          - paragraph [ref=e185]: Full access. No credit card required to start.
      - generic [ref=e186]:
        - button "Claim Your Handle" [ref=e187]:
          - text: Claim Your Handle
          - img
        - paragraph [ref=e188]: Cancel anytime • Secure setup
    - contentinfo [ref=e189]:
      - generic [ref=e190]:
        - generic [ref=e191]:
          - generic [ref=e192]:
            - generic [ref=e193]: TG
            - generic [ref=e194]: TeamGoals
          - paragraph [ref=e195]: © 2026 TeamGoals • Built for High Performance.
        - generic [ref=e196]:
          - link "Privacy" [ref=e197] [cursor=pointer]:
            - /url: "#"
          - link "Terms" [ref=e198] [cursor=pointer]:
            - /url: "#"
          - link "Contact" [ref=e199] [cursor=pointer]:
            - /url: mailto:hello@team-goals.com
          - link "System Status" [ref=e200] [cursor=pointer]:
            - /url: "#"
  - alert [ref=e201]
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
  12 |     await page.route('/cdn-cgi/challenge-platform/h/b/pat/.*', route => {
  13 |       console.log(`[Network Intercept] Bypassing Cloudflare PAT challenge: ${route.request().url()}`);
  14 |       route.fulfill({
  15 |         status: 200,
  16 |         contentType: 'text/plain',
  17 |         body: '',
  18 |       });
  19 |     });
  20 |     
  21 |     await page.goto('/');
> 22 |     await page.getByPlaceholder('your-team-name').fill(subdomain);
     |                                                   ^ Error: locator.fill: Test timeout of 60000ms exceeded.
  23 |     await page.getByRole('button', { name: 'Get Started' }).click();
  24 |     
  25 |     await expect(page).toHaveURL(new RegExp(`\/${subdomain}\/onboarding`));
  26 |     await page.getByPlaceholder('Your Company Name').fill(`${subdomain} Company`);
  27 |     await page.getByPlaceholder('your-email@example.com').fill(adminEmail);
  28 |     await page.getByPlaceholder('••••••••').fill(adminPassword);
  29 |     await page.getByRole('button', { name: 'Create My Dashboard' }).click();
  30 | 
  31 |     await expect(page).toHaveURL(new RegExp(`\/${subdomain}\/admin`));
  32 | 
  33 |     // Step 2: Add and Verify Agent
  34 |     await page.getByRole('button', { name: 'New Agent' }).click();
  35 |     await page.locator('input[value="New Agent"]').fill(agentName);
  36 |     await page.locator('input[type="number"][value="5000000"]').fill(agentGoal.toString());
  37 |     await page.getByRole('button', { name: 'Publish Updates' }).click();
  38 | 
  39 |     // The alert dialog confirms the save
  40 |     page.on('dialog', dialog => dialog.accept());
  41 |     
  42 |     // Reload to verify persistence
  43 |     await page.reload();
  44 |     
  45 |     await expect(page.locator(`input[value="${agentName}"]`)).toBeVisible();
  46 |     await expect(page.locator(`input[value="${agentGoal}"]`)).toBeVisible();
  47 | 
  48 |     // Step 3: Verify Public Dashboard
  49 |     await page.goto(`/${subdomain}`);
  50 |     await expect(page.getByText(agentName)).toBeVisible();
  51 | 
  52 |     // Step 4: Login as Master Admin and Delete Tenant
  53 |     await page.goto('/master/login');
  54 |     await page.getByRole('button', { name: 'Use Master Password' }).click();
  55 |     await page.getByPlaceholder('your-email@example.com').fill('phillsimpson@gmail.com');
  56 |     await page.getByPlaceholder('••••••••').fill('4WeeStella$');
  57 |     await page.getByRole('button', { name: 'Sign In' }).click();
  58 |     
  59 |     await expect(page).toHaveURL('/master');
  60 |     await expect(page.getByText(`${subdomain} Company`)).toBeVisible();
  61 | 
  62 |     const tenantRow = page.locator('tr', { hasText: subdomain });
  63 |     await tenantRow.getByRole('button', { name: 'Delete' }).click();
  64 |     
  65 |     await expect(page.getByText(new RegExp(`permanently delete the tenant ${subdomain} Company`))).toBeVisible();
  66 |     await page.getByRole('button', { name: 'Confirm Deletion' }).click();
  67 | 
  68 |     // Verify tenant is gone from the list
  69 |     await expect(page.getByText(`${subdomain} Company`)).not.toBeVisible();
  70 | 
  71 |     // Step 5: Verify Tenant is Inaccessible
  72 |     await page.goto(`/${subdomain}`);
  73 |     await expect(page.getByText(`Welcome to Your Team Dash`)).toBeVisible();
  74 |     await expect(page.getByText(subdomain, { exact: true })).toBeVisible();
  75 |   });
  76 | });
  77 | 
```