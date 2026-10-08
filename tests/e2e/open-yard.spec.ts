import { expect, test } from '../../src/fixtures/test';
import { step } from '../../src/helpers/step';

test.describe('UI-2: Scenario 2 — Open a yard from the directory', () => {
  test('UI-2.1: 2.1 Find Edmonton under Canada', async ({ page, locationsDirectory }) => {
    await step(page, 'Finds the unmarked Edmonton yard under Canada', async () => {
      const canada = await locationsDirectory.sitesIn('Canada');

      console.log("Expected: Edmonton is listed under Canada, and is not marked with an asterisk *");
      const edmonton = canada.find((item) => item.trim() === 'Edmonton');
      expect(edmonton).toBeDefined();
      expect(edmonton).not.toContain('*');
    });
  });

  test('UI-2.2: 2.2 Click Edmonton', async ({ page, locationsDirectory, yardPage }) => {
    await step(page, 'Opens the Edmonton yard from the Canada list', async () => {
      await locationsDirectory.openSite('Canada', 'Edmonton');

      console.log("Expected: URL contains /lp/edmonton- ab (or the equivalent slug the site uses)");
      await expect(page).toHaveURL(/\/lp\/edmonton-ab/);
      console.log("Page heading/location name is Edmonton.");
      await expect(yardPage.locationHeading('Edmonton')).toBeVisible();
    });
  });
});
