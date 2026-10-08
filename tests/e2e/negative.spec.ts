import { expect, test } from '../../src/fixtures/test';
import { step } from '../../src/helpers/step';
const UNKNOWN_PLACE = 'ZZZ-Not-A-Real-City-999';
const UNKNOWN_REP = 'ZZZ-Not-A-Person-999';
const UNKNOWN_REP_LOCATION = 'ZZZ-Nowhere-Land 99999';
const LAGOS_WITH_NOISE = 'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz, Ojo, Alasia 102111, Lagos, Nigeria';
const LAGOS_REPRESENTATIVE = 'Aneel Jacob';
const INVALID_EMAIL = 'not-an-email';

const US_CITIES = [
    'Atlanta',
    'Baton Rouge*',
    'Charlotte*',
    'Chehalis',
    'Chicago',
    'Columbus',
    'Denver',
    'Fort Worth',
    'Houston',
    'Kansas City',
    'Las Vegas',
    'Lincoln*',
    'Little Rock',
    'Los Angeles',
    'Midland*',
    'Minneapolis',
    'Nashville',
    'North East',
    'North Franklin',
    'Oklahoma City, OK',
    'Orlando',
    'Phoenix',
    'Pittsburgh*',
    'Raleigh*',
    'Sacramento',
    'Salt Lake City',
    'San Antonio*',
    'Spokane*',
    'Tulare',
    'Wasilla*',
    'Williston*',
];
const AUSTRALIAN_CITIES = [
    'Melbourne',
    'Sydney',
    'Adelaide*',
    'Brisbane',
    'Dubbo*',
    'Geelong',
    'Mittagong*',
    'Newcastle*',
    'Perth*',
];
const FINLAND_CITIES = [
    'Tuusula'
];
const FRENCH_CITIES = [
    'Avignon*',
    'Bressols*',
    'Nivolas-Vermelle*',
    'St Aubin Sur Gaillon',
];
const GERMAN_CITIES = [
    'Leipzig*',
    'Meppen',
];
const IRELAND_CITIES = [
    'Mullingar',
];
const ITALY_CITIES = [
    'Caorso',
];
const JAPAN_CITIES = [
    'Japan'
];
const MEXICO_CITIES = [
    'Polotitlan',
];
const NETHERLANDS_CITIES = [
    'Moerdijk',
];
const NEW_ZEALAND_CITIES = [
    'Auckland'
]
const SPAIN_CITIES = [
    'Ocana',
    'Vila Seca Tarragona*'
];
const SWEDISH_CITIES = [
    'Vaggeryd*',
];
const UAE_CITIES = [
    'Dubai',
];
const UK_CITIES = [
    'Maltby',
    'Scotland*',
];

test.describe('UI-N-1: Negative end-to-end checks', () => {
  test('UI-N-1.1: Unknown yard slug shows the site not-found page', async ({ page }) => {
    await step(page, 'Open an unknown yard URL', async () => {
      await page.goto('/lp/not-a-real-yard-xyz', { waitUntil: 'domcontentloaded' });

      await expect(page).toHaveURL(/\/not-found/);
      await expect(page).toHaveTitle(/404 page not found/i);
      await expect(page.getByRole('heading', { name: /never existed/i })).toBeVisible();
      await expect(page.getByText('1500 Sparrow Drive')).toHaveCount(0);
    });
  });

  test('UI-N-1.2: Location search does not add a yard that is not in the directory', async ({ page, locationsDirectory }) => {
    await step(page, 'Search for a place that is not in the directory', async () => {
      await locationsDirectory.searchForLocation(UNKNOWN_PLACE);

      await expect(page).toHaveURL(/\/lp\/?(\?.*)?$/);
      const labels = (await locationsDirectory.allSites()).map((site) => site.label);
      expect(labels.some((label) => label.includes(UNKNOWN_PLACE))).toBe(false);
      await expect(page.getByRole('link', { name: UNKNOWN_PLACE })).toHaveCount(0);
    });
  });

  test('UI-N-1.3: Incomplete city slug (without \/) does not open that yard', async ({ page }) => {
    await step(page, 'Open the incomplete Phoenix slug', async () => {
      await page.goto('/lp/phoenix', { waitUntil: 'domcontentloaded' });

      await expect(page).toHaveURL(/\/not-found/);
      await expect(page).toHaveTitle(/404 page not found/i);
      await expect(page.getByRole('heading', { name: 'Phoenix', exact: true })).toHaveCount(0);
    });
  });

  test('UI-N-1.4: Search with no query does not show results for a specific city', async ({ page, inventorySearch }) => {
    await step(page, 'Open the inventory search without a query', async () => {
      await inventorySearch.openCity('');

      await expect(page).toHaveURL(/\/search\/?$/);
      await expect(inventorySearch.displayedTotalsHeading()).toBeVisible();
      await expect(inventorySearch.displayedTotalsHeading()).toContainText(/results/i);
      await expect(inventorySearch.displayedTotalsHeading()).not.toContainText(/results for/i);
    });
  });

  test('UI-N-1.5: City search does not present another city in the results heading', async ({ page, inventorySearch }) => {
    const query = 'Dubai';
    const absent = 'Las Vegas';

    await step(page, `Open a ${query} inventory search`, async () => {
      await inventorySearch.openCity(query);

      await expect(page).toHaveURL(new RegExp(`freeText=${query}`));
      await expect(inventorySearch.resultsHeading(query)).toBeVisible();
      await expect(inventorySearch.resultsHeading(absent)).toHaveCount(0);
    });
  });

  test('UI-N-1.6: Yards are not listed under the wrong country', async ({ page, locationsDirectory }) => {
    await step(page, 'Compare site lists for several countries', async () => {
      const namesIn = async (country: string) =>
        (await locationsDirectory.sitesIn(country)).map((item) => item.replace(/\*/g, '').trim());

      const canada = await namesIn('Canada');

      for (const city of US_CITIES) {
        expect(canada).not.toContain(city);
      }
      for (const city of AUSTRALIAN_CITIES) {
        expect(canada).not.toContain(city);
      }
      for (const city of FINLAND_CITIES) {
        expect(canada).not.toContain(city);
      }
      for (const city of NETHERLANDS_CITIES) {
        expect(canada).not.toContain(city);
      }
      for (const city of FRENCH_CITIES) {
        expect(canada).not.toContain(city);
      }
      for (const city of GERMAN_CITIES) {
        expect(canada).not.toContain(city);
      }
      for (const city of IRELAND_CITIES) {
        expect(canada).not.toContain(city);
      }
      for (const city of ITALY_CITIES) {
        expect(canada).not.toContain(city);
      }
      for (const city of JAPAN_CITIES) {
        expect(canada).not.toContain(city);
      }
      for (const city of MEXICO_CITIES) {
        expect(canada).not.toContain(city);
      }
      for (const city of NETHERLANDS_CITIES) {
        expect(canada).not.toContain(city);
      }
      for (const city of NEW_ZEALAND_CITIES) {
        expect(canada).not.toContain(city);
      }
      for (const city of SPAIN_CITIES) {
        expect(canada).not.toContain(city);
      }
      for (const city of SWEDISH_CITIES) {
        expect(canada).not.toContain(city);
      }
      for (const city of UAE_CITIES) {
        expect(canada).not.toContain(city);
      }
      for (const city of UK_CITIES) {
        expect(canada).not.toContain(city);
      }
    });
  });

  test('UI-N-1.7: Searching local representatives by an unknown name shows no representative', async ({
    page,
    locationsDirectory,
  }) => {
    await step(page, 'Open Local representatives', async () => {
      await locationsDirectory.showLocalRepresentatives();
      await expect(locationsDirectory.representativeSearchType()).toBeVisible();
    });

    await step(page, `Search by name for "${UNKNOWN_REP}"`, async () => {
      await locationsDirectory.searchRepresentatives('Name', UNKNOWN_REP);

      await expect(locationsDirectory.representativeSearchType()).toHaveText(/Search by name/);
      await expect(locationsDirectory.representativesNoResults()).toBeVisible();
      await expect(locationsDirectory.representativesFound()).toHaveCount(0);
      await expect(page.getByText(UNKNOWN_REP, { exact: true })).toHaveCount(0);
      await expect(page).toHaveURL(/\/lp/);
    });
  });

  test('UI-N-1.8: Searching local representatives by an unknown location shows no representative', async ({
    page,
    locationsDirectory,
  }) => {
    await step(page, 'Open Local representatives', async () => {
      await locationsDirectory.showLocalRepresentatives();
      await expect(locationsDirectory.representativeSearchType()).toBeVisible();
    });

    await step(page, `Search by location for "${UNKNOWN_REP_LOCATION}"`, async () => {
      await locationsDirectory.searchRepresentatives('Location', UNKNOWN_REP_LOCATION);

      await expect(locationsDirectory.representativeSearchType()).toHaveText(/Search by location/);
      await expect(locationsDirectory.representativesNoResults()).toBeVisible();
      await expect(locationsDirectory.representativesFound()).toHaveCount(0);
      await expect(page).toHaveURL(/\/lp/);
    });
  });

  test('UI-N-1.9: A location search with junk text before a Lagos address still finds the Lagos representative', async ({
    page,
    locationsDirectory,
  }) => {
    await step(page, 'Open Local representatives', async () => {
      await locationsDirectory.showLocalRepresentatives();
      await expect(locationsDirectory.representativeSearchType()).toBeVisible();
    });

    await step(page, `Search by location for "${LAGOS_WITH_NOISE}"`, async () => {
      await locationsDirectory.searchRepresentatives('Location', LAGOS_WITH_NOISE);

      await expect(locationsDirectory.representativesFound()).toBeVisible();
      await expect(page.getByText(LAGOS_REPRESENTATIVE, { exact: true })).toBeVisible();
      await expect(locationsDirectory.representativesNoResults()).toHaveCount(0);
    });
  });

  // TODO: This test is for one field in the form, but the form has other fields that could be tested for invalid input.
  test('UI-N-1.10: Become a seller form rejects an invalid email without submitting', async ({ page, edmontonYard }) => {
    await step(page, `Type "${INVALID_EMAIL}" in the Email field`, async () => {
      await edmontonYard.seller.scrollIntoView();
      await edmontonYard.seller.enterEmail(INVALID_EMAIL);

      await expect(edmontonYard.seller.invalidEmailError()).toBeVisible();
      await expect(edmontonYard.seller.emailField()).toHaveAttribute('aria-invalid', 'true');
      await expect(edmontonYard.seller.successMessage()).toHaveCount(0);
      await expect(page).toHaveURL(/\/lp\/edmonton-ab/);
    });
  });
});
