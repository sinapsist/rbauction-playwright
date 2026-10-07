import { Page } from '@playwright/test';
import { dismissCookieBanner } from '../helpers/cookies';

/** Base Page class */
export class BasePage {
  constructor(protected readonly page: Page) {}

  protected async goto(path: string): Promise<void> {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
    await dismissCookieBanner(this.page);
  }
}
