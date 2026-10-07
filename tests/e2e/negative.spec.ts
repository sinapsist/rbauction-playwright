import { expect, test } from '@playwright/test';
import { LocationsPage } from '../../src/pages/locations.page';
import { YardPage } from '../../src/pages/yard.page';

const UNKNOWN_PLACE = 'ZZZ-Not-A-Real-City-999';
const UNKNOWN_REP = 'ZZZ-Not-A-Person-999';

test.describe('Negative end-to-end checks', () => {
  test('an unknown yard slug shows the site not-found page', async ({ page }) => {
    await page.goto('/lp/not-a-real-yard-xyz', { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(/\/not-found/);
    await expect(page).toHaveTitle(/404 page not found/i);
    await expect(page.getByRole('heading', { name: /never existed/i })).toBeVisible();
    await expect(page.getByText('1500 Sparrow Drive')).toHaveCount(0);
  });

  test('a location search does not add a yard that is not in the directory', async ({ page }) => {
    const locations = new LocationsPage(page);
    await locations.open();
    await locations.searchForLocation(UNKNOWN_PLACE);

    await expect(page).toHaveURL(/\/lp\/?(\?.*)?$/);
    const labels = (await locations.allSites()).map((site) => site.label);
    expect(labels.some((label) => label.includes(UNKNOWN_PLACE))).toBe(false);
    await expect(page.getByRole('link', { name: UNKNOWN_PLACE })).toHaveCount(0);
  });

  test('searching local representatives for an unknown name shows no matching person', async ({ page }) => {
    const locations = new LocationsPage(page);
    await locations.open();
    await locations.showLocalRepresentatives();

    const search = page.getByRole('textbox').last();
    await search.fill(UNKNOWN_REP);
    await search.press('Enter');

    await expect(page.getByText(/no results/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: UNKNOWN_REP })).toHaveCount(0);
    await expect(page).toHaveURL(/\/lp/);
  });

  test('an empty Become a seller form stays on the yard page and shows required-field errors', async ({ page }) => {
    const yard = new YardPage(page);
    await yard.openEdmonton();
    await yard.sellerHeading().scrollIntoViewIfNeeded();

    const submit = page.getByRole('button', { name: 'Submit' });
    await submit.click();

    await expect(page.getByText('First name* is required')).toBeVisible();
    await expect(page.getByText('Email* is required')).toBeVisible();
    await expect(page).toHaveURL(/\/lp\/edmonton-ab/);
    await expect(page.getByText(/thank you|successfully submitted/i)).toHaveCount(0);
  });
});
