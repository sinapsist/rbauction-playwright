import { Browser, BrowserContext, Page } from '@playwright/test';
import { browserContextOptions } from '../browser-options';

/**
 * Opens a page with the same browser context the suite uses.
 * beforeAll cannot use the page fixture, and a bare browser.newPage() would
 * drop the user agent that Akamai accepts.
 */
export async function openApiSession(browser: Browser): Promise<{ page: Page; context: BrowserContext }> {
  const context = await browser.newContext(browserContextOptions);
  const page = await context.newPage();
  return { page, context };
}
