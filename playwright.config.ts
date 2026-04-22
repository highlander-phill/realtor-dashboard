import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  timeout: 60000,
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: 'https://www.team-goals.com',
    trace: 'on-first-retry',
    env: {
      NEXT_PUBLIC_PLAYWRIGHT_TEST_ENV: 'true',
    },
    onPageError: (exception) => {
      console.error(`Uncaught exception: ${exception}`);
    },
    onConsoleMessage: (msg) => {
      console.log(`[Browser Console] ${msg.type().toUpperCase()}: ${msg.text()}`);
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
