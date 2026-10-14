import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

/** A card field the markup either renders or omits. An empty string is still present. */
export type CardField = { state: 'present'; text: string } | { state: 'absent' };

export interface LotSummary {
  title: string;
  location: CardField;
  closing: CardField;
}

/**
 * The results view always shows a total somewhere.
 * `none` is the missing case the test rejects.
 */
export type DisplayedTotals =
  | { source: 'both'; headline: string; range: string }
  | { source: 'headline'; headline: string }
  | { source: 'range'; range: string }
  | { source: 'none' };

export function totalsText(totals: Exclude<DisplayedTotals, { source: 'none' }>): string {
  switch (totals.source) {
    case 'both':
      return `${totals.headline}\n${totals.range}`;
    case 'headline':
      return totals.headline;
    case 'range':
      return totals.range;
  }
}

function cardField(value: string | null): CardField {
  if (value === null) return { state: 'absent' };
  return { state: 'present', text: value };
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
   * Reads the total text at the top of the list and in the pager.
   * The result says which of those is on the page.
   * @param city The city in the results heading.
   */
  async displayedTotals(city: string): Promise<DisplayedTotals> {
    const read = async (locator: Locator): Promise<string | null> =>
      (await locator.count()) > 0 ? (await locator.innerText()).trim() : null;
    const headline = await read(this.resultsHeading(city));
    const range = await read(this.resultRange());
    if (headline !== null && range !== null) return { source: 'both', headline, range };
    if (headline !== null) return { source: 'headline', headline };
    if (range !== null) return { source: 'range', range };
    return { source: 'none' };
  }

  /** Returns the locator for the result count heading, for example `102k results` or `3.2k results for "Edmonton"`. */
  displayedTotalsHeading(): Locator {
    return this.page.getByTestId('search-count-header');
  }

  /**
   * Reads the title, location, and closing date of every lot on the current page in one pass.
   * Location and closing are `absent` when the card does not show them.
   */
  async lotSummaries(): Promise<LotSummary[]> {
    await this.lotCards().first().waitFor();
    const cards = await this.lotCards().evaluateAll((nodes) =>
      nodes.map((card) => {
        const heading = card.querySelector('h4');
        const location = heading?.parentElement?.nextElementSibling?.querySelector('p');
        const closing = card.querySelector('[data-testid="end-date-section"]');
        return {
          title: heading?.textContent?.trim() ?? '',
          location: location ? (location.textContent ?? '').trim() : null,
          closing: closing
            ? (closing.textContent ?? '').replace(/^\s*Closing:\s*/i, '').trim()
            : null,
        };
      }),
    );
    return cards.map((card) => ({
      title: card.title,
      location: cardField(card.location),
      closing: cardField(card.closing),
    }));
  }
}
