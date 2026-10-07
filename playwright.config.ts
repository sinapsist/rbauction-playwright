import os from 'node:os';
import { defineConfig, devices } from '@playwright/test';

/**
 * Akamai rejects Playwright's bundled headless Chromium (its user agent
 * advertises HeadlessChrome). Installed Google Chrome with a regular Chrome
 * user agent is allowed. Set PLAYWRIGHT_CHROMIUM=bundled to fall back to
 * headed Playwright Chromium instead.
 */
const bundledChromium = process.env.PLAYWRIGHT_CHROMIUM === 'bundled';

const chromeUserAgent =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36';

export default defineConfig({
  timeout: 90_000,
  expect: { timeout: 20_000 },
  fullyParallel: true,
  retries: 1,
  workers: 2,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    [
      'allure-playwright',
      {
        resultsDir: 'allure-results',
        // Playwright's automatic action steps cannot carry attachments.
        // Report steps are the explicit scenario steps, and each one attaches its own screenshot.
        detail: false,
        suiteTitle: false,
        environmentInfo: {
          os_platform: os.platform(),
          os_release: os.release(),
          node_version: process.version,
          base_url: 'https://www.rbauction.com',
        },
      },
    ],
  ],
  use: {
    baseURL: 'https://www.rbauction.com',
    ...devices['Desktop Chrome'],
    userAgent: chromeUserAgent,
    locale: 'en-US',
    viewport: { width: 1440, height: 900 },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    navigationTimeout: 45_000,
    ...(bundledChromium ? { headless: false } : { channel: 'chrome' as const }),
  },
  projects: [
    { name: 'e2e', testDir: './tests/e2e' },
    { name: 'api', testDir: './tests/api' },
  ],
});
