import { Page } from '@playwright/test';
import * as allure from 'allure-js-commons';
import { ContentType } from 'allure-js-commons';

/** Wraps a Playwright action in an Allure step, automatically attaching a screenshot after the action completes.
 * @param page The Playwright page object.
 * @param name The name of the Allure step.
 * @param action The async function to execute as the step.
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

/** Attaches a screenshot to the current Allure step.
 * @param page The Playwright page object.
 */
async function attachStepScreenshot(page: Page): Promise<void> {
  if (page.isClosed()) return;

  try {
    const image = await page.screenshot({ animations: 'disabled', timeout: 10_000 });
    await allure.attachment('Screenshot', image, ContentType.PNG);
  } catch {
    // A missed screenshot should not replace the step's own result.
  }
}
