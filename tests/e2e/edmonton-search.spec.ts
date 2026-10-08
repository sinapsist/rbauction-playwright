import { expect, test } from '../../src/fixtures/test';
import { parseDisplayedTotal } from '../../src/helpers/parse';
import { step } from '../../src/helpers/step';

test.describe('UI-4: Scenario 4 — Edmonton inventory search', () => {
  test('UI-4.1: 4.1 Opens the Edmonton search', async ({ page, inventorySearch }) => {
    await step(page, 'Open the Edmonton search', async () => {
      console.log("Expected: A search / inventory view opens.");
      await inventorySearch.openCity('Edmonton');

      console.log("Expected: The query or location context is Edmonton.");
      await expect(page).toHaveURL(/freeText=Edmonton/);
      await expect(inventorySearch.searchBox()).toHaveValue(/Edmonton/);
      await expect(inventorySearch.resultsHeading('Edmonton')).toBeVisible();
    });
  });

  test('UI-4.2: 4.2 Results', async ({ page, inventorySearch }) => {
    await step(page, 'Open the Edmonton search', async () => {
      await inventorySearch.openCity('Edmonton');
    });

    await step(page, 'Read the displayed result total', async () => {
      const { headline, range } = await inventorySearch.displayedTotals('Edmonton');
      expect(headline ?? range, 'a result total is shown at the top or bottom of the list').toBeTruthy();

      console.log("Expected: The total is a positive number, for example 2.2k results");
      const total = parseDisplayedTotal([headline, range].filter(Boolean).join('\n'));
      expect(total).toBeGreaterThan(0);

      console.log(`Displayed inventory total: ${total} (${[headline, range].filter(Boolean).join('; ')})`);
    });

    await step(page, 'Check titles, locations, and closing dates on the first page', async () => {
      const lots = await inventorySearch.lotSummaries();
      expect(lots.length).toBeGreaterThan(0);

      console.log("Expected: Each lot visible on the first page has a title");
      console.log("Expected: Where a location or closing/auction date is shown on the card, it is non-empty");
      for (const [index, lot] of lots.entries()) {
        expect(lot.title, `lot ${index + 1} title`).not.toBe('');
        if (lot.location !== null) {
          expect(lot.location, `lot ${index + 1} location`).not.toBe('');
        }
        if (lot.closing !== null) {
          expect(lot.closing, `lot ${index + 1} closing date`).not.toBe('');
        }
      }

      console.log('First 5 titles:', lots.slice(0, 5).map((lot) => lot.title));
    });
  });
});
