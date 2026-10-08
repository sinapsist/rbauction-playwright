import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { SellerComponent } from './components/seller.component';

export interface CategoryCard {
  name: string;
  quantity: string;
}

export interface RepresentativeCard {
  name: string;
  text: string;
}

export interface YardLocation {
  name: string;
  slug: string;
}

/** Yard Page */
export class YardPage extends BasePage {
  readonly seller: SellerComponent;

  constructor(page: Page) {
    super(page);
    this.seller = new SellerComponent(page);
  }

  async open(location: YardLocation): Promise<void> {
    await this.goto(`/lp/${location.slug}`);
    await this.locationHeading(location.name).waitFor();
  }

  /** Returns the locator for the heading of the yard location.
   *  @param name The name of the yard location.
   *  @returns The locator for the heading of the yard location.
   */
  locationHeading(name: string): Locator {
    return this.page.getByRole('heading', { name, exact: true });
  }

  /** Returns the locator for the "Details" section.
   *  @returns The locator for the "Details" section.
   */
  detailsSection(): Locator {
    return this.section('Details');
  }

  /** Returns the locator for the "About this yard" section.
   *  @returns The locator for the "About this yard" section.
   */
  aboutSection(): Locator {
    return this.section('About this yard');
  }

  /** Returns the locator for the Representatives tab.
   *  @returns The locator for the Representatives tab.
   */
  representativesTab(): Locator {
    return this.page.getByRole('tab', { name: 'Representatives' });
  }

  /**
   * Returns every event card in the Auction events section, including slides outside the viewport.
   * Each card has a date range and a title.
   * The date range is expected to be in the format "Month Day - Month Day, Year" or "Month Day, Year".
   * The title is expected to be a non-empty string.
   *  @returns A promise resolving to an array of event card texts.
   */
  async eventCardTexts(): Promise<string[]> {
    return this.page.getByRole('heading', { name: 'Auction events', exact: true }).evaluate((heading) => {
      const container = heading.nextElementSibling;
      if (!container) return [];
      const links = [...container.querySelectorAll('a')].filter((link) =>
        /day event|view items/i.test(link.innerText),
      );
      const cards = links.filter((link) => !links.some((other) => other !== link && link.contains(other)));
      return cards.map((link) => link.innerText.trim());
    });
  }

  /**
   * Returns every category card in the Items in yard section, including slides outside the viewport.
   * Each card has a name and a quantity of items.
   *  @returns A promise resolving to an array of category cards.
   */
  async categoryCards(): Promise<CategoryCard[]> {
    const texts = await this.page
      .getByRole('heading', { name: 'Items in yard', exact: true })
      .locator('xpath=../..')
      .getByRole('link')
      .allInnerTexts();

    return texts.flatMap((raw) => {
      const text = raw.replace(/\s+/g, ' ').trim();
      const match = text.match(/^(.*?)\s+(\d[\d,]*\s+items)$/i);
      return match ? [{ name: match[1].trim(), quantity: match[2] }] : [];
    });
  }

  /**
   * Opens the Representatives tab and waits for the tab panel to be visible.
   * This is necessary because the representative cards are not loaded until the tab is opened.
   *  @returns A promise that resolves when the tab panel is visible.
   */
  async openRepresentatives(): Promise<void> {
    await this.representativesTab().click();
    await this.page.getByRole('tabpanel').waitFor();
  }

  /**
   * Returns every representative card in the Representatives tab, including slides outside the viewport.
   * Each card has a name and the text content of the card.
   *  @returns A promise resolving to an array of representative cards.
   */
  async representativeCards(): Promise<RepresentativeCard[]> {
    const panel = this.page.getByRole('tabpanel');
    const names = (await panel.getByRole('heading', { level: 4 }).allTextContents()).map((name) => name.trim());
    const panelText = await panel.innerText();
    let cursor = 0;

    return names.map((name, index) => {
      const start = panelText.indexOf(name, cursor);
      const nextName = names[index + 1];
      const end = nextName ? panelText.indexOf(nextName, start + name.length) : panelText.length;
      cursor = end;
      return { name, text: panelText.slice(start, end).replace(/\s+/g, ' ').trim() };
    });
  }

  /**
   * Returns the locator for a section with the given heading name.
   * @param name
   * @private
   */
  private section(name: string): Locator {
    return this.page.getByRole('heading', { name, exact: true }).locator('xpath=..');
  }
}
