import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export interface LotSummary {
  title: string;
  /** Null when the card does not show a location. */
  location: string | null;
  /** Null when the card does not show a closing or auction date. */
  closing: string | null;
}

export interface DisplayedTotals {
  /** Top of the list, for example `3.1k results for "Edmonton"`. Null when not shown. */
  headline: string | null;
  /** Bottom of the first page, for example `1-60 of 3194`. Null when not shown. */
  range: string | null;
}

/** Inventory Search Page */
export class InventorySearchPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /** Opens the inventory search page with a search for the given city.
   * An empty city opens the unfiltered search, which has no `results for "..."` heading.
   * @param city The city to search for.
   */
  async openCity(city: string): Promise<void> {
    if (!city) {
      await this.goto('/search');
      await this.displayedTotalsHeading().waitFor();
      return;
    }
    await this.goto(`/search?freeText=${encodeURIComponent(city)}`);
    await this.resultsHeading(city).waitFor();
  }

  /** Returns the locator for the results heading for the given city. */
  resultsHeading(city: string): Locator {
    const escapedCity = city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return this.page.getByText(new RegExp(`results for\\s+"${escapedCity}"`, 'i')).first();
  }

  /** Returns the locator for the search box. */
  searchBox(): Locator {
    return this.page.getByRole('textbox', { name: 'Search' }).first();
  }

  /** Returns the locator for the search button. */
  resultRange(): Locator {
    return this.page.getByText(/\b\d+\s*-\s*\d+\s+of\s+[\d,]+\b/).first();
  }

  /** Returns the locator for the lot cards. */
  lotCards(): Locator {
    return this.page.locator('main li[data-testid^="searchResultItemCard-"]');
  }

  /**
   * Reads the total text shown at the bottom of the list and in the pager.
   * Either one can be missing; the caller parses whichever is shown.
   * @param city The city in the results heading.
   */
  async displayedTotals(city: string): Promise<DisplayedTotals> {
    const read = async (locator: Locator) =>
      (await locator.count()) > 0 ? (await locator.innerText()).trim() : null;
    return {
      headline: await read(this.resultsHeading(city)),
      range: await read(this.resultRange()),
    };
  }

  /** Returns the locator for the result count heading, for example `102k results` or `3.2k results for "Edmonton"`. */
  displayedTotalsHeading(): Locator {
    return this.page.getByTestId('search-count-header');
  }

  /**
   * Reads the title, location, and closing date of every lot on the current page in one pass.
   * Location and closing are null when the card does not show them.
   */
  async lotSummaries(): Promise<LotSummary[]> {
    await this.lotCards().first().waitFor();
    return this.lotCards().evaluateAll((cards) =>
      cards.map((card) => {
        const heading = card.querySelector('h4');
        const location = heading?.parentElement?.nextElementSibling?.querySelector('p');
        const closing = card.querySelector('[data-testid="end-date-section"]');
        return {
          title: heading?.textContent?.trim() ?? '',
          location: location ? (location.textContent ?? '').trim() : null,
          closing: closing ? (closing.textContent ?? '').replace(/^\s*Closing:\s*/i, '').trim() : null,
        };
      }),
    );
  }
}
