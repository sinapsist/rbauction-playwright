import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

/** Inventory Search Page */
export class InventorySearchPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async openEdmonton(): Promise<void> {
    await this.goto('/search?freeText=Edmonton');
    await this.resultsHeading('Edmonton').waitFor();
  }

  resultsHeading(city: string): Locator {
    const escapedCity = city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return this.page.getByText(new RegExp(`results for\\s+"${escapedCity}"`, 'i')).first();
  }

  searchBox(): Locator {
    return this.page.getByRole('textbox', { name: 'Search' }).first();
  }

  resultRange(): Locator {
    return this.page.getByText(/\b\d+\s*-\s*\d+\s+of\s+[\d,]+\b/).first();
  }

  lotCards(): Locator {
    return this.page.locator('main li:has(h4)').filter({ hasNot: this.page.locator('li') });
  }
}
