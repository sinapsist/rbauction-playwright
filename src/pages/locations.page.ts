import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export interface DirectorySite {
  country: string;
  label: string;
}

export class LocationsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.goto('/lp');
    await this.heading().waitFor();
  }

  heading(): Locator {
    return this.page.getByRole('heading', { level: 1, name: 'Locations', exact: true });
  }

  intro(): Locator {
    return this.page.getByText(/over 60 permanent auction sites and local yards/i);
  }

  satelliteNote(): Locator {
    return this.page.getByText(/satellite sites are represented by an asterisk/i);
  }

  auctionSitesTab(): Locator {
    return this.page.getByRole('tab', { name: 'Auction sites' });
  }

  localRepresentativesTab(): Locator {
    return this.page.getByRole('tab', { name: 'Local representatives' });
  }

  async countryNames(): Promise<string[]> {
    return this.page.evaluate(() => {
      return [...document.querySelectorAll('h4')]
        .filter((heading) => heading.nextElementSibling?.tagName === 'UL')
        .map((heading) => (heading.textContent || '').replace(/\s+/g, ' ').trim())
        .filter(Boolean);
    });
  }

  async scrollToCountryList(): Promise<void> {
    const unitedStates = this.page.getByRole('heading', { level: 4, name: 'United States', exact: true });
    await unitedStates.scrollIntoViewIfNeeded();
    await expect(unitedStates).toBeVisible();
  }

  async sitesIn(country: string): Promise<string[]> {
    return this.page.evaluate((countryName) => {
      const heading = [...document.querySelectorAll('h4')].find(
        (element) => (element.textContent || '').trim() === countryName,
      );
      const list = heading?.nextElementSibling;
      if (!list || list.tagName !== 'UL') return [];
      return [...list.querySelectorAll('a')]
        .map((link) => (link.textContent || '').replace(/\s+/g, ' ').trim())
        .filter(Boolean);
    }, country);
  }

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

  siteLink(country: string, label: string): Locator {
    return this.page
      .getByRole('heading', { level: 4, name: country, exact: true })
      .locator('xpath=following-sibling::ul[1]')
      .getByRole('link', { name: label, exact: true });
  }

  async openSite(country: string, label: string): Promise<void> {
    await this.siteLink(country, label).click();
    await this.page.waitForURL(/\/lp\//);
  }

  async searchForLocation(query: string): Promise<void> {
    const box = this.page.getByRole('textbox', { name: 'address, city or country' });
    await box.fill(query);
    await this.page.getByRole('button', { name: 'Search for a location' }).click();
  }

  async showLocalRepresentatives(): Promise<void> {
    await this.localRepresentativesTab().click();
  }
}
