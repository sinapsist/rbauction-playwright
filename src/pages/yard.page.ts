import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export interface CategoryCard {
  name: string;
  quantity: string;
}

export interface RepresentativeCard {
  name: string;
  text: string;
}

export class YardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async openEdmonton(): Promise<void> {
    await this.goto('/lp/edmonton-ab');
    await this.locationHeading().waitFor();
  }

  locationHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Edmonton', exact: true });
  }

  detailsSection(): Locator {
    return this.section('Details');
  }

  aboutSection(): Locator {
    return this.section('About this yard');
  }

  sellerHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Become a seller', exact: true });
  }

  sellerPhone(): Locator {
    return this.page.getByText(/\+1[\s.-]*866[\s.-]*901[\s.-]*2104/);
  }

  representativesTab(): Locator {
    return this.page.getByRole('tab', { name: 'Representatives' });
  }

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
   * Counts every category card rendered for the Items in yard carousel,
   * including slides that are outside the current viewport.
   */
  async categoryCards(): Promise<CategoryCard[]> {
    return this.page.getByRole('heading', { name: 'Items in yard', exact: true }).evaluate((heading) => {
      let node: HTMLElement | null = heading.parentElement;
      let container: HTMLElement | null = null;
      while (node) {
        const links = [...node.querySelectorAll('a')].filter((link) => /\d[\d,]*\s+items\b/i.test(link.innerText));
        if (links.length > 0) {
          container = node;
          break;
        }
        node = node.parentElement;
      }
      if (!container) return [];

      const links = [...container.querySelectorAll('a')].filter(
        (link) => /\d[\d,]*\s+items\b/i.test(link.innerText) && link.innerText.length < 160,
      );
      const cards = links.filter((link) => !links.some((other) => other !== link && link.contains(other)));
      return cards.map((link) => {
        const text = link.innerText.replace(/\s+/g, ' ').trim();
        const match = text.match(/^(.*?)\s+(\d[\d,]*\s+items)$/i);
        return {
          name: (match?.[1] || text).trim(),
          quantity: (match?.[2] || '').trim(),
        };
      });
    });
  }

  async openRepresentatives(): Promise<void> {
    await this.representativesTab().click();
    await this.page.getByRole('tabpanel').waitFor();
  }

  async representativeCards(): Promise<RepresentativeCard[]> {
    return this.page.getByRole('tabpanel').evaluate((panel) => {
      const headings = [...panel.querySelectorAll('h4')];
      return headings.map((heading, index) => {
        const range = document.createRange();
        range.setStartBefore(heading);
        const next = headings[index + 1];
        if (next) range.setEndBefore(next);
        else range.setEndAfter(panel);
        return {
          name: (heading.textContent || '').replace(/\s+/g, ' ').trim(),
          text: range.toString().replace(/\s+/g, ' ').trim(),
        };
      });
    });
  }

  private section(name: string): Locator {
    return this.page.getByRole('heading', { name, exact: true }).locator('xpath=..');
  }
}
