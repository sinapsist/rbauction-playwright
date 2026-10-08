import { expect, test } from '../../src/fixtures/test';
import { isSatelliteLabel } from '../../src/helpers/parse';
import { step } from '../../src/helpers/step';

const REQUIRED_COUNTRIES = [
  'United States',
  'Canada',
  'Australia',
  'United Kingdom',
  'Netherlands',
  'UAE',
];

test.describe('UI-1: Scenario 1 — Locations directory', () => {
  test('UI-1.1: 1.1 Open the page', async ({ page, locationsDirectory }) => {
    await step(page, 'Check the locations heading and intro', async () => {
      console.log("Expected: Page title / heading is the locations / auction-sites directory (heading Locations)")
      await expect(page).toHaveTitle(/auction sites/i);
      await expect(locationsDirectory.heading()).toBeVisible();

      console.log("Expected: Intro text is visible and states that Ritchie Bros.");
      console.log("Expected: offers over 60 permanent auction sites and local yards"); // Done internally
      await expect(locationsDirectory.intro()).toBeVisible();
      await expect(locationsDirectory.intro()).toContainText("Ritchie Bros.");
    });
  });

  test('UI-1.2: 1.2 Read the satelite-site note', async ({ page, locationsDirectory }) => {
    await step(page, 'Read satellite sites are marked with an asterisk', async () => {
      console.log("Expected: Copy explaining that satellite sites are marked with an asterisk  * is visible");
      await expect(locationsDirectory.satelliteNote()).toBeVisible();
      await expect(locationsDirectory.satelliteNote()).toContainText('*');
    });
  });

  test('UI-1.3: 1.3 Lists country groups below the map', async ({ page, locationsDirectory }) => {
    await step(page, 'List the country groups', async () => {
      await locationsDirectory.scrollToCountryList();

      console.log("Count those headings. The list must include at least: " +
          "United States, Canada, Australia, United Kingdom, Netherlands, UAE");
      const countries = await locationsDirectory.countryNames();
      expect(countries.length).toBeGreaterThan(0);
      expect(countries[0]).toBe('United States');
      expect(countries[1]).toBe('Canada');
      expect(countries).toEqual(expect.arrayContaining(REQUIRED_COUNTRIES));
    });
  });
  test('UI-1.4: 1.4 Lists sites Under United States (more than 20)', async ({ page, locationsDirectory }) => {
    await step(page, 'List the United States sites', async () => {
      const sites = (await locationsDirectory.sitesIn('United States')).map((label) => label.replace(/\*/g, '').trim());

      console.log("Expected: The count must be greater than 20. " +
          "The list must include Phoenix, Salt Lake City, Houston, Las Vegas, and Atlanta.");
      expect(sites.length).toBeGreaterThan(20);
      expect(sites).toEqual(
        expect.arrayContaining(['Phoenix', 'Salt Lake City', 'Houston', 'Las Vegas', 'Atlanta']),
      );
    });
  });

  test('UI-1.5: 1.5 lists sites under Canada (more than 10)', async ({ page, locationsDirectory }) => {
    await step(page, 'List the Canada sites', async () => {
      const sites = (await locationsDirectory.sitesIn('Canada')).map((label) => label.replace(/\*/g, '').trim());

      console.log("Expected: The count must be greater than 10. " +
          "The list must include Edmonton, Montreal, Toronto, Regina, and Saskatoon.")
      expect(sites.length).toBeGreaterThan(10);
      expect(sites).toEqual(expect.arrayContaining(['Edmonton', 'Montreal', 'Toronto', 'Regina', 'Saskatoon']));
    });
  });

  test('UI-1.6: 1.6 Identify satellite and permanent sites on the full directory', async ({ page, locationsDirectory }) => {
    await step(page, 'Count satellite and permanent sites', async () => {
      const sites = await locationsDirectory.allSites();
      const satellite = sites.filter((site) => isSatelliteLabel(site.label));
      const permanent = sites.filter((site) => !isSatelliteLabel(site.label));

      console.log("Expected: Satellite count must be greater than 15");
      expect(satellite.length).toBeGreaterThan(15);
      console.log("Expected: Permanent count must be greater than 25");
      expect(permanent.length).toBeGreaterThan(25);
      console.log("Expected: Total count must be greater than 60");
      expect(satellite.length + permanent.length).toBeGreaterThan(60);
    });
  });

  test('UI-1.7: 1.7 Check known satellite yards and leaves known permanent yards unmarked', async ({
    page,
    locationsDirectory,
  }) => {
    await step(page, 'Check known satellite and permanent yards', async () => {
      const sites = await locationsDirectory.allSites();
      const labelFor = (pattern: RegExp) => sites.find((site) => pattern.test(site.label))?.label;

      console.log("Expected: San Antonio and Calgary, AB appear with an asterisk");
      expect(labelFor(/^San Antonio/)).toContain('*');
      expect(labelFor(/^Calgary/)).toContain('*');

      console.log("Expected: Phoenix and Edmonton appear without an asterisk");
      expect(labelFor(/^Phoenix$/)).toBe('Phoenix');
      expect(labelFor(/^Edmonton$/)).toBe('Edmonton');
    });
  });

  test('UI-1.9: 1.9 Switches from auction sites to local representatives', async ({ page, locationsDirectory }) => {
    await step(page, 'Check the Auction sites and Local representatives controls', async () => {
      console.log("Expected: Both tabs are visible");
      await expect(locationsDirectory.auctionSitesTab()).toBeVisible();
      await expect(locationsDirectory.localRepresentativesTab()).toBeVisible();
      await expect(locationsDirectory.auctionSitesTab()).toHaveAttribute('aria-selected', 'true');
    });

    await step(page, 'Switch to Local representatives', async () => {
      await locationsDirectory.showLocalRepresentatives();

      console.log("Expected: Switching to Local representatives changes the content (shows \"Search for representatives\")");
      await expect(locationsDirectory.localRepresentativesTab()).toHaveAttribute('aria-selected', 'true');
      await expect(page.getByText('Search for representatives')).toBeVisible();
      await expect(locationsDirectory.auctionSitesTab()).toHaveAttribute('aria-selected', 'false');
    });
  });
});
