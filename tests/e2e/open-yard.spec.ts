import { expect, test } from '../../src/fixtures/test';
import { step } from '../../src/helpers/step';

test.describe('Scenario 2 — Open a yard from the directory', () => {
  test('opens the unmarked Edmonton yard from the Canada list', async ({ page, locationsDirectory, yardPage }) => {
    await step(page, 'Find Edmonton under Canada', async () => {
      const canada = await locationsDirectory.sitesIn('Canada');
      const edmonton = canada.find((label) => label.replace(/\*/g, '').trim() === 'Edmonton');

      expect(edmonton).toBe('Edmonton');
      expect(edmonton).not.toContain('*');
    });

    await step(page, 'Click Edmonton', async () => {
      await locationsDirectory.openSite('Canada', 'Edmonton');

      await expect(page).toHaveURL(/\/lp\/edmonton-ab/);
      await expect(yardPage.locationHeading('Edmonton')).toBeVisible();
    });
  });
});
