import { Page } from '@playwright/test';
import * as allure from 'allure-js-commons';
import { ContentType } from 'allure-js-commons';

/**
 * Runs an Allure step and attaches a screenshot of the page after it finishes.
 * The screenshot is taken inside the step so the report shows it on that step,
 * including when the step fails.
 */
export async function step(page: Page, name: string, action: () => Promise<void>): Promise<void> {
  await allure.step(name, async () => {
    try {
      await action();
    } finally {
      await attachStepScreenshot(page);
    }
  });
}

async function attachStepScreenshot(page: Page): Promise<void> {
  if (page.isClosed()) return;

  try {
    const image = await page.screenshot({ animations: 'disabled', timeout: 10_000 });
    await allure.attachment('Screenshot', image, ContentType.PNG);
  } catch {
    // A missed screenshot should not replace the step's own result.
  }
}
