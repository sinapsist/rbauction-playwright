import { expect, test } from '../../src/fixtures/test';
import { parseDisplayedTotal } from '../../src/helpers/parse';
import { step } from '../../src/helpers/step';

test.describe('Scenario 4 — Edmonton inventory search', () => {
  test('reads the displayed total and the first page of lots', async ({ page, inventorySearch }) => {
    await step(page, 'Open the Edmonton search', async () => {
      await inventorySearch.openEdmonton();

      await expect(page).toHaveURL(/freeText=Edmonton/);
      await expect(inventorySearch.searchBox()).toHaveValue(/Edmonton/);
      await expect(inventorySearch.resultsHeading('Edmonton')).toBeVisible();
    });

    await step(page, 'Read the displayed total and the first page of lots', async () => {
      const headline = await inventorySearch.resultsHeading('Edmonton').innerText();
      const range = await inventorySearch.resultRange().innerText();
      const total = parseDisplayedTotal(`${headline}\n${range}`);
      expect(total).toBeGreaterThan(0);

      const cards = inventorySearch.lotCards();
      const count = await cards.count();
      expect(count).toBeGreaterThan(0);

      const titles: string[] = [];
      for (let index = 0; index < count; index += 1) {
        const card = cards.nth(index);
        const title = (await card.locator('h4').innerText()).trim();
        expect(title.length).toBeGreaterThan(0);
        titles.push(title);

        const text = await card.innerText();
        if (/Closing:/i.test(text)) {
          expect(text).toMatch(/Closing:\s*\S+/i);
        }
        const location = text
          .split('\n')
          .map((line) => line.trim())
          .find((line) => line !== title && /,\s*[A-Za-z]/.test(line) && !/Closing:/i.test(line));
        if (location) {
          expect(location.length).toBeGreaterThan(0);
        }
      }

      console.log(`Displayed inventory total: ${total} (${headline.trim()}; ${range.trim()})`);
      console.log('First 5 titles:', titles.slice(0, 5));
    });
  });
});
