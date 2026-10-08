import { Page } from '@playwright/test';

/** Renders a JSON value so the Allure step screenshot shows the data under test. */
export async function showJson(page: Page, value: unknown): Promise<void> {
  const json = JSON.stringify(value, null, 2) ?? '';
  const body = json.replace(/[&<>]/g, (character) => {
    if (character === '&') return '&amp;';
    if (character === '<') return '&lt;';
    return '&gt;';
  });
  await page.setContent(
    `<!DOCTYPE html><meta charset="utf-8"><pre style="font:14px/1.4 ui-monospace,monospace;white-space:pre-wrap">${body}</pre>`,
  );
}
