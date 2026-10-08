import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { SellerComponent } from './components/seller.component';

export interface DirectorySite {
  country: string;
  label: string;
}

export type RepresentativeSearchMode = 'Auction site' | 'Name' | 'Location';

const REPRESENTATIVE_SEARCH: Record<Exclude<RepresentativeSearchMode, 'Auction site'>, { placeholder: string; button: string }> = {
  Name: { placeholder: 'Type first or last name', button: 'Search for a local representative by name' },
  Location: { placeholder: 'Address, region, or country', button: 'Search for a location' },
};

/** Locations Page */
export class LocationsPage extends BasePage {
  readonly seller: SellerComponent;

  constructor(page: Page) {
    super(page);
    this.seller = new SellerComponent(page);
  }

  async open(): Promise<void> {
    await this.goto('/lp');
    await this.heading().waitFor();
  }

  /** Returns the locator for the main heading of the page.
   *  @returns The locator for the main heading of the page.
   */
  heading(): Locator {
    return this.page.getByRole('heading', { level: 1, name: 'Locations', exact: true });
  }

  /** Returns the locator for the introductory text of the page.
   *  @returns The locator for the introductory text of the page.
   */
  intro(): Locator {
    return this.page.getByText(/over 60 permanent auction sites and local yards/i);
  }

  /** Returns the locator for the note about satellite sites.
   * @returns The locator for the note about satellite sites.
   */
  satelliteNote(): Locator {
    return this.page.getByText(/satellite sites are represented by an asterisk/i);
  }

  /** Returns the locator for the "Auction sites" tab.
   * @returns The locator for the "Auction sites" tab.
   */
  auctionSitesTab(): Locator {
    return this.page.getByRole('tab', { name: 'Auction sites' });
  }

  /**
   * Returns the locator for the "Local representatives" tab.
   * @returns The locator for the "Local representatives" tab.
   */
  localRepresentativesTab(): Locator {
    return this.page.getByRole('tab', { name: 'Local representatives' });
  }

  /**
   * Returns promise for the list of country names in the directory.
   * @returns Promise resolving to an array of country names.
   */
  async countryNames(): Promise<string[]> {
    const headings = await this.page.locator('h4:has(+ ul)').allTextContents();
    return headings.map((heading) => heading.replace(/\s+/g, ' ').trim()).filter(Boolean);
  }

  /**
   * Scrolls the page to the country list section and waits for the United States heading to be visible.
   */
  async scrollToCountryList(): Promise<void> {
    const unitedStates = this.page.getByRole('heading', { level: 4, name: 'United States', exact: true });
    await unitedStates.scrollIntoViewIfNeeded();
    await expect(unitedStates).toBeVisible();
  }

  /**
   * Returns promise for the list of site labels under the given country heading.
   * @param country
   */
  async sitesIn(country: string): Promise<string[]> {
    const list = this.page
      .getByRole('heading', { level: 4, name: country, exact: true })
      .locator('xpath=following-sibling::ul[1]');
    return (await list.getByRole('link').allTextContents())
      .map((label) => label.replace(/\s+/g, ' ').trim())
      .filter(Boolean);
  }

  /** Returns promise for the list of all sites in the directory, with country and label. */
  async allSites(): Promise<DirectorySite[]> {
    const countries = await this.countryNames();
    const sites: DirectorySite[] = [];
    for (const country of countries) {
      const labels = await this.sitesIn(country);
      for (const label of labels) {
        sites.push({ country, label });
      }
    }
    return sites;
  }

  /**
   * Returns the locator for a link to a site under the given country heading.
   * @param country
   * @param label
   */
  siteLink(country: string, label: string): Locator {
    return this.page
      .getByRole('heading', { level: 4, name: country, exact: true })
      .locator('xpath=following-sibling::ul[1]')
      .getByRole('link', { name: label, exact: true });
  }

  /** Opens the site page for the given country and label by clicking the link.
   * @param country
   * @param label
   */
  async openSite(country: string, label: string): Promise<void> {
    await this.siteLink(country, label).click();
  }

  /** Searches for a location using the search box and clicks the search button.
   * @param query The location to search for.
   */
  async searchForLocation(query: string): Promise<void> {
    const box = this.page.getByRole('textbox', { name: 'address, city or country' });
    await box.fill(query);
    await this.page.getByRole('button', { name: 'Search for a location' }).click();
  }

  /**
   * Opens the Local Representatives tab by clicking on it.
   * This is necessary because the representative cards are not loaded until the tab is opened.
   */
  async showLocalRepresentatives(): Promise<void> {
    await this.localRepresentativesTab().click();
  }

  /** Returns the locator for the "Search by ..." dropdown on the Local representatives tab. */
  representativeSearchType(): Locator {
    return this.page.getByRole('combobox').filter({ hasText: /^Search by/ });
  }

  /**
   * Picks a search mode in the "Search by" dropdown on the Local representatives tab.
   * @param mode Auction site, Name, or Location.
   */
  async selectRepresentativeSearch(mode: RepresentativeSearchMode): Promise<void> {
    await this.representativeSearchType().click();
    await this.page.getByRole('option', { name: mode, exact: true }).click();
    await this.page.getByRole('combobox').filter({ hasText: `Search by ${mode.toLowerCase()}` }).waitFor();
  }

  /**
   * Searches local representatives by name or location: picks the mode, types the query, and clicks search.
   * @param mode Name or Location.
   * @param query The text to type in the search field.
   */
  async searchRepresentatives(mode: 'Name' | 'Location', query: string): Promise<void> {
    const { placeholder, button } = REPRESENTATIVE_SEARCH[mode];
    await this.selectRepresentativeSearch(mode);
    await this.page.getByPlaceholder(placeholder).fill(query);
    await this.page.getByRole('button', { name: button, exact: true }).click();
  }

  /** Returns the locator for the "N local representatives found" summary. */
  representativesFound(): Locator {
    return this.page.getByText(/\d+\s+local representatives? found/i);
  }

  /** Returns the locator for the "No results" message on the Local representatives tab. */
  representativesNoResults(): Locator {
    return this.page.getByText(/^No results\. Search for your location representative/i);
  }
}
