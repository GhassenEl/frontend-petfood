// @ts-check
const { defineConfig, devices } = require('@playwright/test');

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001';

module.exports = defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 3 : 0,
  workers: 1,
  reporter: process.env.CI ? [['github'], ['list']] : [['list']],
  timeout: process.env.CI ? 90_000 : 60_000,
  expect: { timeout: process.env.CI ? 20_000 : 15_000 },
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
