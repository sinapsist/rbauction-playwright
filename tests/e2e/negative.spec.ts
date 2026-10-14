import { expect, minor, normal, test } from '../../src/helpers/severity';
import { step } from '../../src/helpers/step';
import { FOREIGN_YARDS_NOT_IN_CANADA, yardName } from '../data/foreign-yards';

const UNKNOWN_PLACE = 'ZZZ-Not-A-Real-City-999';
const UNKNOWN_REP = 'ZZZ-Not-A-Person-999';
const UNKNOWN_REP_LOCATION = 'ZZZ-Nowhere-Land 99999';
const LAGOS_WITH_NOISE =
  'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz, Ojo, Alasia 102111, Lagos, Nigeria';
const LAGOS_REPRESENTATIVE = 'Aneel Jacob';
const INVALID_EMAIL = 'not-an-email';

type NotFoundCase =
  | {
      kind: 'unknown-slug';
      id: 'UI-N-1.1';
      title: 'Unknown yard slug shows the site not-found page';
      path: '/lp/not-a-real-yard-xyz';
      absentText: string;
    }
  | {
      kind: 'incomplete-slug';
      id: 'UI-N-1.3';
      title: 'Incomplete city slug (without /) does not open that yard';
      path: '/lp/phoenix';
      absentHeading: string;
    };

const NOT_FOUND_PAGES: readonly NotFoundCase[] = [
  {
    kind: 'unknown-slug',
    id: 'UI-N-1.1',
    title: 'Unknown yard slug shows the site not-found page',
    path: '/lp/not-a-real-yard-xyz',
    absentText: '1500 Sparrow Drive',
  },
  {
    kind: 'incomplete-slug',
    id: 'UI-N-1.3',
    title: 'Incomplete city slug (without /) does not open that yard',
    path: '/lp/phoenix',
    absentHeading: 'Phoenix',
  },
];

type UnknownRepresentativeSearch =
  | {
      id: 'UI-N-1.7';
      title: 'Searching local representatives by an unknown name shows no representative';
      mode: 'Name';
      query: string;
      combobox: RegExp;
      absentText: string;
    }
  | {
      id: 'UI-N-1.8';
      title: 'Searching local representatives by an unknown location shows no representative';
      mode: 'Location';
      query: string;
      combobox: RegExp;
    };

const UNKNOWN_REPRESENTATIVE_SEARCHES: readonly UnknownRepresentativeSearch[] = [
  {
    id: 'UI-N-1.7',
    title: 'Searching local representatives by an unknown name shows no representative',
    mode: 'Name',
    query: UNKNOWN_REP,
    combobox: /Search by name/,
    absentText: UNKNOWN_REP,
  },
  {
    id: 'UI-N-1.8',
    title: 'Searching local representatives by an unknown location shows no representative',
    mode: 'Location',
    query: UNKNOWN_REP_LOCATION,
    combobox: /Search by location/,
  },
];

test.describe('UI-N-1: Negative end-to-end checks', () => {
  for (const row of NOT_FOUND_PAGES) {
    test(`${row.id}: ${row.title}`, normal, async ({ page }) => {
      await step(page, `Open ${row.path}`, async () => {
        await page.goto(row.path, { waitUntil: 'domcontentloaded' });

        await expect(page).toHaveURL(/\/not-found/);
        await expect(page).toHaveTitle(/404 page not found/i);
        if (row.kind === 'unknown-slug') {
          await expect(page.getByRole('heading', { name: /never existed/i })).toBeVisible();
          await expect(page.getByText(row.absentText)).toHaveCount(0);
          return;
        }
        await expect(
          page.getByRole('heading', { name: row.absentHeading, exact: true }),
        ).toHaveCount(0);
      });
    });
  }

  test(
    'UI-N-1.2: Location search does not add a yard that is not in the directory',
    normal,
    async ({ page, locationsDirectory }) => {
      await step(page, 'Search for a place that is not in the directory', async () => {
        await locationsDirectory.searchForLocation(UNKNOWN_PLACE);

        await expect(page).toHaveURL(/\/lp\/?(\?.*)?$/);
        const labels = (await locationsDirectory.allSites()).map((site) => site.label);
        expect(labels.some((label) => label.includes(UNKNOWN_PLACE))).toBe(false);
        await expect(page.getByRole('link', { name: UNKNOWN_PLACE })).toHaveCount(0);
      });
    },
  );

  test(
    'UI-N-1.4: Search with no query does not show results for a specific city',
    normal,
    async ({ page, inventorySearch }) => {
      await step(page, 'Open the inventory search without a query', async () => {
        await inventorySearch.openCity('');

        await expect(page).toHaveURL(/\/search\/?$/);
        await expect(inventorySearch.displayedTotalsHeading()).toBeVisible();
        await expect(inventorySearch.displayedTotalsHeading()).toContainText(/results/i);
        await expect(inventorySearch.displayedTotalsHeading()).not.toContainText(/results for/i);
      });
    },
  );

  test(
    'UI-N-1.5: City search does not present another city in the results heading',
    normal,
    async ({ page, inventorySearch }) => {
      const query = 'Dubai';
      const absent = 'Las Vegas';

      await step(page, `Open a ${query} inventory search`, async () => {
        await inventorySearch.openCity(query);

        await expect(page).toHaveURL(new RegExp(`freeText=${query}`));
        await expect(inventorySearch.resultsHeading(query)).toBeVisible();
        await expect(inventorySearch.resultsHeading(absent)).toHaveCount(0);
      });
    },
  );

  test(
    'UI-N-1.6: Yards are not listed under the wrong country',
    normal,
    async ({ page, locationsDirectory }) => {
      await step(page, 'Read the Canada yard list', async () => {
        const canada = (await locationsDirectory.sitesIn('Canada')).map(yardName);

        for (const directory of FOREIGN_YARDS_NOT_IN_CANADA) {
          await step(page, `${directory.country} yards are not listed under Canada`, async () => {
            for (const city of directory.cities) {
              const name = yardName(city);
              expect(canada, `${name} is listed under ${directory.country}`).not.toContain(name);
            }
          });
        }
      });
    },
  );

  for (const row of UNKNOWN_REPRESENTATIVE_SEARCHES) {
    test(`${row.id}: ${row.title}`, normal, async ({ page, locationsDirectory }) => {
      await step(page, 'Open Local representatives', async () => {
        await locationsDirectory.showLocalRepresentatives();
        await expect(locationsDirectory.representativeSearchType()).toBeVisible();
      });

      await step(page, `Search by ${row.mode.toLowerCase()} for "${row.query}"`, async () => {
        if (row.mode === 'Name') {
          await locationsDirectory.searchRepresentatives({ mode: 'Name', query: row.query });
        } else {
          await locationsDirectory.searchRepresentatives({ mode: 'Location', query: row.query });
        }

        await expect(locationsDirectory.representativeSearchType()).toHaveText(row.combobox);
        await expect(locationsDirectory.representativesNoResults()).toBeVisible();
        await expect(locationsDirectory.representativesFound()).toHaveCount(0);
        if (row.mode === 'Name') {
          await expect(page.getByText(row.absentText, { exact: true })).toHaveCount(0);
        }
        await expect(page).toHaveURL(/\/lp/);
      });
    });
  }

  test(
    'UI-N-1.9: A location search with junk text before a Lagos address still finds the Lagos representative',
    minor,
    async ({ page, locationsDirectory }) => {
      await step(page, 'Open Local representatives', async () => {
        await locationsDirectory.showLocalRepresentatives();
        await expect(locationsDirectory.representativeSearchType()).toBeVisible();
      });

      await step(page, `Search by location for "${LAGOS_WITH_NOISE}"`, async () => {
        await locationsDirectory.searchRepresentatives({
          mode: 'Location',
          query: LAGOS_WITH_NOISE,
        });

        await expect(locationsDirectory.representativesFound()).toBeVisible();
        await expect(page.getByText(LAGOS_REPRESENTATIVE, { exact: true })).toBeVisible();
        await expect(locationsDirectory.representativesNoResults()).toHaveCount(0);
      });
    },
  );

  test(
    'UI-N-1.10: Become a seller form rejects an invalid email without submitting',
    normal,
    async ({ page, edmontonYard }) => {
      await step(page, `Type "${INVALID_EMAIL}" in the Email field`, async () => {
        await edmontonYard.seller.scrollIntoView();
        await edmontonYard.seller.enterEmail(INVALID_EMAIL);

        await expect(edmontonYard.seller.invalidEmailError()).toBeVisible();
        await expect(edmontonYard.seller.emailField()).toHaveAttribute('aria-invalid', 'true');
        await expect(edmontonYard.seller.successMessage()).toHaveCount(0);
        await expect(page).toHaveURL(/\/lp\/edmonton-ab/);
      });
    },
  );
});
