import { expect, test } from '@playwright/test';
import { LocationsPage } from '../../src/pages/locations.page';
import { isSatelliteLabel } from '../../src/support/parse';

const REQUIRED_COUNTRIES = [
  'United States',
  'Canada',
  'Australia',
  'United Kingdom',
  'Netherlands',
  'UAE',
];

test.describe('Scenario 1 — Locations directory', () => {
  test.beforeEach(async ({ page }) => {
    const locations = new LocationsPage(page);
    await locations.open();
  });

  test('1.1 shows the locations heading and intro', async ({ page }) => {
    const locations = new LocationsPage(page);
    await expect(page).toHaveTitle(/auction sites/i);
    await expect(locations.heading()).toBeVisible();
    await expect(locations.intro()).toBeVisible();
  });

  test('1.2 explains that satellite sites are marked with an asterisk', async ({ page }) => {
    const locations = new LocationsPage(page);
    await expect(locations.satelliteNote()).toBeVisible();
    await expect(locations.satelliteNote()).toContainText('*');
  });

  test('1.3 lists country groups below the map', async ({ page }) => {
    const locations = new LocationsPage(page);
    await locations.scrollToCountryList();

    const countries = await locations.countryNames();
    expect(countries.length).toBeGreaterThan(0);
    expect(countries[0]).toBe('United States');
    expect(countries[1]).toBe('Canada');
    expect(countries).toEqual(expect.arrayContaining(REQUIRED_COUNTRIES));
  });

  test('1.4 lists more than 20 United States sites, including the known yards', async ({ page }) => {
    const locations = new LocationsPage(page);
    const sites = (await locations.sitesIn('United States')).map((label) => label.replace(/\*/g, '').trim());

    expect(sites.length).toBeGreaterThan(20);
    expect(sites).toEqual(
      expect.arrayContaining(['Phoenix', 'Salt Lake City', 'Houston', 'Las Vegas', 'Atlanta']),
    );
  });

  test('1.5 lists more than 10 Canadian sites, including the known yards', async ({ page }) => {
    const locations = new LocationsPage(page);
    const sites = (await locations.sitesIn('Canada')).map((label) => label.replace(/\*/g, '').trim());

    expect(sites.length).toBeGreaterThan(10);
    expect(sites).toEqual(expect.arrayContaining(['Edmonton', 'Montreal', 'Toronto', 'Regina', 'Saskatoon']));
  });

  test('1.6 counts satellite and permanent sites on the full directory', async ({ page }) => {
    const locations = new LocationsPage(page);
    const sites = await locations.allSites();
    const satellite = sites.filter((site) => isSatelliteLabel(site.label));
    const permanent = sites.filter((site) => !isSatelliteLabel(site.label));

    expect(satellite.length).toBeGreaterThan(15);
    expect(permanent.length).toBeGreaterThan(25);
    expect(satellite.length + permanent.length).toBeGreaterThan(60);
  });

  test('1.7 marks known satellite yards and leaves known permanent yards unmarked', async ({ page }) => {
    const locations = new LocationsPage(page);
    const sites = await locations.allSites();
    const labelFor = (pattern: RegExp) => sites.find((site) => pattern.test(site.label))?.label;

    expect(labelFor(/^San Antonio/)).toContain('*');
    expect(labelFor(/^Calgary/)).toContain('*');
    expect(labelFor(/^Phoenix$/)).toBe('Phoenix');
    expect(labelFor(/^Edmonton$/)).toBe('Edmonton');
  });

  test('1.9 switches from auction sites to local representatives', async ({ page }) => {
    const locations = new LocationsPage(page);
    await expect(locations.auctionSitesTab()).toBeVisible();
    await expect(locations.localRepresentativesTab()).toBeVisible();
    await expect(locations.auctionSitesTab()).toHaveAttribute('aria-selected', 'true');

    await locations.showLocalRepresentatives();

    await expect(locations.localRepresentativesTab()).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByText('Search for representatives')).toBeVisible();
    await expect(locations.auctionSitesTab()).toHaveAttribute('aria-selected', 'false');
  });
});
