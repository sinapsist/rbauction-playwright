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

test.describe('Scenario 1 — Locations directory', () => {
  test('1.1 shows the locations heading and intro', async ({ page, locationsDirectory }) => {
    await step(page, 'Check the locations heading and intro', async () => {
      await expect(page).toHaveTitle(/auction sites/i);
      await expect(locationsDirectory.heading()).toBeVisible();
      await expect(locationsDirectory.intro()).toBeVisible();
    });
  });

  test('1.2 explains that satellite sites are marked with an asterisk', async ({ page, locationsDirectory }) => {
    await step(page, 'Read the satellite-site note', async () => {
      await expect(locationsDirectory.satelliteNote()).toBeVisible();
      await expect(locationsDirectory.satelliteNote()).toContainText('*');
    });
  });

  test('1.3 lists country groups below the map', async ({ page, locationsDirectory }) => {
    await step(page, 'List the country groups', async () => {
      await locationsDirectory.scrollToCountryList();

      const countries = await locationsDirectory.countryNames();
      expect(countries.length).toBeGreaterThan(0);
      expect(countries[0]).toBe('United States');
      expect(countries[1]).toBe('Canada');
      expect(countries).toEqual(expect.arrayContaining(REQUIRED_COUNTRIES));
    });
  });

  test('1.4 lists sites Under United States (more than 20)', async ({ page, locationsDirectory }) => {
    await step(page, 'List the United States sites', async () => {
      const sites = (await locationsDirectory.sitesIn('United States')).map((label) => label.replace(/\*/g, '').trim());

      expect(sites.length).toBeGreaterThan(20);
      expect(sites).toEqual(
        expect.arrayContaining(['Phoenix', 'Salt Lake City', 'Houston', 'Las Vegas', 'Atlanta']),
      );
    });
  });

  test('1.5 lists sites under Canada (more than 10)', async ({ page, locationsDirectory }) => {
    await step(page, 'List the Canada sites', async () => {
      const sites = (await locationsDirectory.sitesIn('Canada')).map((label) => label.replace(/\*/g, '').trim());

      expect(sites.length).toBeGreaterThan(10);
      expect(sites).toEqual(expect.arrayContaining(['Edmonton', 'Montreal', 'Toronto', 'Regina', 'Saskatoon']));
    });
  });

  test('1.6 counts satellite and permanent sites on the full directory', async ({ page, locationsDirectory }) => {
    await step(page, 'Count satellite and permanent sites', async () => {
      const sites = await locationsDirectory.allSites();
      const satellite = sites.filter((site) => isSatelliteLabel(site.label));
      const permanent = sites.filter((site) => !isSatelliteLabel(site.label));

      expect(satellite.length).toBeGreaterThan(15);
      expect(permanent.length).toBeGreaterThan(25);
      expect(satellite.length + permanent.length).toBeGreaterThan(60);
    });
  });

  test('1.7 marks known satellite yards and leaves known permanent yards unmarked', async ({
    page,
    locationsDirectory,
  }) => {
    await step(page, 'Check known satellite and permanent yards', async () => {
      const sites = await locationsDirectory.allSites();
      const labelFor = (pattern: RegExp) => sites.find((site) => pattern.test(site.label))?.label;

      expect(labelFor(/^San Antonio/)).toContain('*');
      expect(labelFor(/^Calgary/)).toContain('*');
      expect(labelFor(/^Phoenix$/)).toBe('Phoenix');
      expect(labelFor(/^Edmonton$/)).toBe('Edmonton');
    });
  });

  test('1.9 switches from auction sites to local representatives', async ({ page, locationsDirectory }) => {
    await step(page, 'Check the Auction sites and Local representatives controls', async () => {
      await expect(locationsDirectory.auctionSitesTab()).toBeVisible();
      await expect(locationsDirectory.localRepresentativesTab()).toBeVisible();
      await expect(locationsDirectory.auctionSitesTab()).toHaveAttribute('aria-selected', 'true');
    });

    await step(page, 'Switch to Local representatives', async () => {
      await locationsDirectory.showLocalRepresentatives();

      await expect(locationsDirectory.localRepresentativesTab()).toHaveAttribute('aria-selected', 'true');
      await expect(page.getByText('Search for representatives')).toBeVisible();
      await expect(locationsDirectory.auctionSitesTab()).toHaveAttribute('aria-selected', 'false');
    });
  });
});
