import { test as base } from '@playwright/test';
import { SearchClient } from '../api/search-client';
import { InventorySearchPage } from '../pages/inventory-search.page';
import { LocationsPage } from '../pages/locations.page';
import { YardLocation, YardPage } from '../pages/yard.page';
import { step } from '../helpers/step';

type AppFixtures = {
  /** Page object only. The test decides when to open the directory. */
  locationsPage: LocationsPage;
  /** Page object only. Used after a test navigates to a yard itself. */
  yardPage: YardPage;
  /** Page object only. Opening the search is part of scenario 4. */
  inventorySearch: InventorySearchPage;
  /** Directory already open. Shared start state for the locations scenarios. */
  locationsDirectory: LocationsPage;
  /** Yard already open. Defaults to Edmonton; override with `test.use({ yard })`. */
  edmontonYard: YardPage;
  yard: YardLocation;
  /**
   * Search client with a browser session already established.
   * Akamai rejects API calls that did not first load the site in the browser.
   */
  searchClient: SearchClient;
};

export const test = base.extend<AppFixtures>({
  locationsPage: async ({ page }, use) => {
    await use(new LocationsPage(page));
  },

  yardPage: async ({ page }, use) => {
    await use(new YardPage(page));
  },

  inventorySearch: async ({ page }, use) => {
    await use(new InventorySearchPage(page));
  },

  locationsDirectory: async ({ page, locationsPage }, use) => {
    await step(page, 'Open the locations directory', async () => {
      await locationsPage.open();
    });
    await use(locationsPage);
  },

  yard: [{ name: 'Edmonton', slug: 'edmonton-ab' }, { option: true }],

  edmontonYard: async ({ page, yardPage, yard }, use) => {
    await step(page, `Open the ${yard.name} yard`, async () => {
      await yardPage.open(yard);
    });
    await use(yardPage);
  },

  searchClient: async ({ page }, use) => {
    const client = new SearchClient(page);
    await step(page, 'Open a browser session for the search API', async () => {
      await client.openSession();
    });
    await use(client);
  },
});

export { expect } from '@playwright/test';
