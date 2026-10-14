import { critical, expect, normal, test } from '../../src/helpers/severity';
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

const COUNTRY_SITE_COUNTS = [
  {
    id: 'UI-1.4',
    title: '1.4 Lists sites Under United States (more than 20)',
    country: 'United States',
    minCount: 20,
    required: ['Phoenix', 'Salt Lake City', 'Houston', 'Las Vegas', 'Atlanta'],
  },
  {
    id: 'UI-1.5',
    title: '1.5 lists sites under Canada (more than 10)',
    country: 'Canada',
    minCount: 10,
    required: ['Edmonton', 'Montreal', 'Toronto', 'Regina', 'Saskatoon'],
  },
] as const;

const YARD_MARKERS = [
  { label: 'San Antonio', pattern: /^San Antonio/, marked: true },
  { label: 'Calgary', pattern: /^Calgary/, marked: true },
  { label: 'Phoenix', pattern: /^Phoenix$/, marked: false },
  { label: 'Edmonton', pattern: /^Edmonton$/, marked: false },
] as const;

test.describe('UI-1: Scenario 1 — Locations directory', () => {
  test('UI-1.1: 1.1 Open the page', critical, async ({ page, locationsDirectory }) => {
    await step(page, 'Check the locations heading and intro', async () => {
      console.log(
        'Expected: Page title / heading is the locations / auction-sites directory (heading Locations)',
      );
      await expect(page).toHaveTitle(/auction sites/i);
      await expect(locationsDirectory.heading()).toBeVisible();

      console.log('Expected: Intro text is visible and states that Ritchie Bros.');
      console.log('Expected: offers over 60 permanent auction sites and local yards');
      await expect(locationsDirectory.intro()).toBeVisible();
      await expect(locationsDirectory.intro()).toContainText('Ritchie Bros.');
    });
  });

  test('UI-1.2: 1.2 Read the satelite-site note', normal, async ({ page, locationsDirectory }) => {
    await step(page, 'Read satellite sites are marked with an asterisk', async () => {
      console.log(
        'Expected: Copy explaining that satellite sites are marked with an asterisk  * is visible',
      );
      await expect(locationsDirectory.satelliteNote()).toBeVisible();
      await expect(locationsDirectory.satelliteNote()).toContainText('*');
    });
  });

  test(
    'UI-1.3: 1.3 Lists country groups below the map',
    critical,
    async ({ page, locationsDirectory }) => {
      await step(page, 'List the country groups', async () => {
        await locationsDirectory.scrollToCountryList();

        console.log(
          'Count those headings. The list must include at least: United States, Canada, Australia, United Kingdom, Netherlands, UAE',
        );
        const countries = await locationsDirectory.countryNames();
        const [first, second] = countries;
        expect(countries.length).toBeGreaterThan(0);
        expect(first).toBe('United States');
        expect(second).toBe('Canada');
        expect(countries).toEqual(expect.arrayContaining(REQUIRED_COUNTRIES));
      });
    },
  );

  for (const row of COUNTRY_SITE_COUNTS) {
    test(`${row.id}: ${row.title}`, critical, async ({ page, locationsDirectory }) => {
      await step(page, `List the ${row.country} sites`, async () => {
        const sites = (await locationsDirectory.sitesIn(row.country)).map((label) =>
          label.replace(/\*/g, '').trim(),
        );

        console.log(
          `Expected: The count must be greater than ${row.minCount}. The list must include ${row.required.join(', ')}.`,
        );
        expect(sites.length).toBeGreaterThan(row.minCount);
        expect(sites).toEqual(expect.arrayContaining([...row.required]));
      });
    });
  }

  test(
    'UI-1.6: 1.6 Identify satellite and permanent sites on the full directory',
    critical,
    async ({ page, locationsDirectory }) => {
      await step(page, 'Count satellite and permanent sites', async () => {
        const sites = await locationsDirectory.allSites();
        const satellite = sites.filter((site) => isSatelliteLabel(site.label));
        const permanent = sites.filter((site) => !isSatelliteLabel(site.label));

        console.log('Expected: Satellite count must be greater than 15');
        expect(satellite.length).toBeGreaterThan(15);
        console.log('Expected: Permanent count must be greater than 25');
        expect(permanent.length).toBeGreaterThan(25);
        console.log('Expected: Total count must be greater than 60');
        expect(satellite.length + permanent.length).toBeGreaterThan(60);
      });
    },
  );

  test(
    'UI-1.7: 1.7 Check known satellite yards and leaves known permanent yards unmarked',
    critical,
    async ({ page, locationsDirectory }) => {
      await step(page, 'Check known satellite and permanent yards', async () => {
        const sites = await locationsDirectory.allSites();

        console.log('Expected: San Antonio and Calgary, AB appear with an asterisk');
        console.log('Expected: Phoenix and Edmonton appear without an asterisk');
        for (const marker of YARD_MARKERS) {
          const label = sites.find((site) => marker.pattern.test(site.label))?.label;
          if (marker.marked) {
            expect(label, marker.label).toContain('*');
          } else {
            expect(label, marker.label).toBe(marker.label);
          }
        }
      });
    },
  );

  test(
    'UI-1.9: 1.9 Switches from auction sites to local representatives',
    normal,
    async ({ page, locationsDirectory }) => {
      await step(page, 'Check the Auction sites and Local representatives controls', async () => {
        console.log('Expected: Both tabs are visible');
        await expect(locationsDirectory.auctionSitesTab()).toBeVisible();
        await expect(locationsDirectory.localRepresentativesTab()).toBeVisible();
        await expect(locationsDirectory.auctionSitesTab()).toHaveAttribute('aria-selected', 'true');
      });

      await step(page, 'Switch to Local representatives', async () => {
        await locationsDirectory.showLocalRepresentatives();

        console.log(
          'Expected: Switching to Local representatives changes the content (shows "Search for representatives")',
        );
        await expect(locationsDirectory.localRepresentativesTab()).toHaveAttribute(
          'aria-selected',
          'true',
        );
        await expect(page.getByText('Search for representatives')).toBeVisible();
        await expect(locationsDirectory.auctionSitesTab()).toHaveAttribute(
          'aria-selected',
          'false',
        );
      });
    },
  );
});
