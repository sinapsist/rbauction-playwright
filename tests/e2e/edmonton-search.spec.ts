import { expect, test } from '@playwright/test';
import { InventorySearchPage } from '../../src/pages/inventory-search.page';
import { parseDisplayedTotal } from '../../src/support/parse';

test.describe('Scenario 4 — Edmonton inventory search', () => {
  test('reads the displayed total and the first page of lots', async ({ page }) => {
    const search = new InventorySearchPage(page);
    await search.openEdmonton();

    await expect(page).toHaveURL(/freeText=Edmonton/);
    await expect(search.searchBox()).toHaveValue(/Edmonton/);
    await expect(search.resultsHeading()).toBeVisible();

    const headline = await search.resultsHeading().innerText();
    const range = await search.resultRange().innerText();
    const total = parseDisplayedTotal(`${headline}\n${range}`);
    expect(total).toBeGreaterThan(0);

    const cards = search.lotCards();
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
