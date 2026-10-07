import { Page } from '@playwright/test';

export async function dismissCookieBanner(page: Page): Promise<void> {
  const accept = page.getByRole('button', { name: 'I understand' });
  try {
    await accept.click({ timeout: 4000 });
  } catch {
    // The banner is not shown on every visit.
  }
}
