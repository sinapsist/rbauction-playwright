import { expect, test } from '../../src/fixtures/test';
import { SearchClient } from '../../src/api/search-client';
import { SearchResponse } from '../../src/api/types';
import { openApiSession } from '../../src/helpers/api-session';
import { showJson } from '../../src/helpers/show-json';
import { step } from '../../src/helpers/step';

test.describe('API-3: Edmonton inventory search', () => {
  let status = 0;
  let contentType = '';
  let body: SearchResponse = {};

  test.beforeAll(async ({ browser }) => {
    const { page, context } = await openApiSession(browser);
    const client = new SearchClient(page);
    await client.openSession();
    const response = await client.search('Edmonton');
    status = response.status();
    contentType = response.headers()['content-type'] ?? '';
    body = await SearchClient.readJson(response);
    // Uncomment the following line to see the full JSON response in the console for debugging:
    // console.log('Full Edmonton search response:', JSON.stringify(body, null, 2));
    await context.close();
  });

  test('API-3.1: A3.1 returns HTTP 200 JSON', async ({ page }) => {
    await step(page, 'Check the search response status', async () => {
      await showJson(page, { status, contentType });

      console.log("Expcted: Response is HTTP 200 and JSON.");
      expect(status).toBe(200);
      expect(contentType).toContain('application/json');
    });
  });

  test('API-3.2: A3.2 reports a positive totalAmount', async ({ page }) => {
    await step(page, 'Check the inventory total', async () => {
      const total = body.results?.totalAmount ?? 0;
      await showJson(page, { totalAmount: total });

      console.log("Expected: It must be greater than 0. Do not page through every lot.");
      expect(total).toBeGreaterThan(0);
    });
  });

  test('API-3.3: A3.3 returns named records on the first page', async ({ page }) => {
    await step(page, 'Check the first page of records', async () => {
      const records = body.results?.records ?? [];
      const titles = records.slice(0, 5).map((record) => record.assetDescription);
      await showJson(page, { returned: records.length, first5: titles });

      console.log("Expected: The first page of  records is non-empty.)");
      expect(records.length).toBeGreaterThan(0);

      console.log("Expected: Each record has a display name in assetDescription (there is no title field).");
      for (const record of records) {
        expect(record.assetDescription?.trim().length).toBeGreaterThan(0);
      }

      console.log(`API inventory total for Edmonton: ${body.results?.totalAmount ?? 0}`);
      console.log('API first 5 titles:', titles);
    });
  });
});
