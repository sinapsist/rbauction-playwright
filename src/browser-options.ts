import { devices } from '@playwright/test';

/** Akamai blocks a user agent that advertises HeadlessChrome. */
export const chromeUserAgent =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36';

const desktop = devices['Desktop Chrome'];

/** Context options shared by the test runner and API beforeAll pages.
 * This allows re-using API call results for all tests and avoids multiple calls to the same API endpoint.
 * */
export const browserContextOptions = {
  baseURL: 'https://www.rbauction.com',
  userAgent: chromeUserAgent,
  locale: 'en-US',
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: desktop.deviceScaleFactor,
  isMobile: desktop.isMobile,
  hasTouch: desktop.hasTouch,
};
