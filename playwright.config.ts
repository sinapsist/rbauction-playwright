import os from 'node:os';
import { defineConfig, devices } from '@playwright/test';
import { browserContextOptions, chromeUserAgent } from './src/browser-options';

/**
 * Akamai rejects Playwright's bundled headless Chromium (its user agent
 * advertises HeadlessChrome). Installed Google Chrome with a regular Chrome
 * user agent is allowed. Set PLAYWRIGHT_CHROMIUM=bundled to fall back to
 * headed Playwright Chromium instead.
 */
const bundledChromium = process.env.PLAYWRIGHT_CHROMIUM === 'bundled';

/**
 * WebStorm adds its own reporter through PW_TEST_REPORTER, and that reporter
 * already prints test stdout. Keeping `list` as well prints every console.log twice.
 */
const ideReporter = Boolean(process.env.PW_TEST_REPORTER);

export default defineConfig({
  timeout: 90_000,
  expect: { timeout: 20_000 },
  fullyParallel: true,
  retries: 1,
  workers: 2,
  reporter: [
    ...(ideReporter ? [] : [['list'] as const]),
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
    ...devices['Desktop Chrome'],
    ...browserContextOptions,
    userAgent: chromeUserAgent,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    navigationTimeout: 45_000,
    ...(bundledChromium ? { headless: false } : { channel: 'chrome' as const }),
  },
  projects: [
    { name: 'e2e', testDir: './tests/e2e' },
    // One worker per file so beforeAll loads each payload once for every check in that file.
    { name: 'api', testDir: './tests/api', fullyParallel: false },
  ],
});
