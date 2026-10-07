import { expect, test } from '@playwright/test';
import { LocationsPage } from '../../src/pages/locations.page';
import { YardPage } from '../../src/pages/yard.page';

test.describe('Scenario 2 — Open a yard from the directory', () => {
  test('opens the unmarked Edmonton yard from the Canada list', async ({ page }) => {
    const locations = new LocationsPage(page);
    const yard = new YardPage(page);

    await locations.open();
    const canada = await locations.sitesIn('Canada');
    const edmonton = canada.find((label) => label.replace(/\*/g, '').trim() === 'Edmonton');

    expect(edmonton).toBe('Edmonton');
    expect(edmonton).not.toContain('*');

    await locations.openSite('Canada', 'Edmonton');

    await expect(page).toHaveURL(/\/lp\/edmonton-ab/);
    await expect(yard.locationHeading()).toBeVisible();
  });
});
