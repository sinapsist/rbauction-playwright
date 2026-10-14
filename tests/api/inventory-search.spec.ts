import { SearchClient } from '../../src/api/search-client';
import { SearchResponse } from '../../src/models';
import { blocker, critical, expect, test } from '../../src/helpers/severity';
import { openApiSession } from '../../src/helpers/api-session';
import { loaded } from '../../src/helpers/loaded';
import { showJson } from '../../src/helpers/show-json';
import { step } from '../../src/helpers/step';

test.describe('API-3: Edmonton inventory search', () => {
  let status: number | undefined;
  let contentType: string | undefined;
  let body: SearchResponse | undefined;

  test.beforeAll(async ({ browser }) => {
    const { page, context } = await openApiSession(browser);
    const client = new SearchClient(page);
    await client.openSession();
    const response = await client.search('Edmonton');
    status = response.status();
    contentType = response.headers()['content-type'] ?? '';
    body = await SearchClient.readJson(response);
    await context.close();
  });

  test('API-3.1: A3.1 returns HTTP 200 JSON', blocker, async ({ page }) => {
    await step(page, 'Check the search response status', async () => {
      const responseStatus = loaded(status, 'search status');
      const responseType = loaded(contentType, 'search content type');
      await showJson(page, { status: responseStatus, contentType: responseType });

      console.log('Expected: Response is HTTP 200 and JSON.');
      expect(responseStatus).toBe(200);
      expect(responseType).toContain('application/json');
    });
  });

  test('API-3.2: A3.2 reports a positive totalAmount', critical, async ({ page }) => {
    await step(page, 'Check the inventory total', async () => {
      const total = loaded(body, 'search response').results.totalAmount;
      await showJson(page, { totalAmount: total });

      console.log('Expected: It must be greater than 0. Do not page through every lot.');
      expect(total).toBeGreaterThan(0);
    });
  });

  test('API-3.3: A3.3 returns named records on the first page', critical, async ({ page }) => {
    await step(page, 'Check the first page of records', async () => {
      const results = loaded(body, 'search response').results;
      const titles = results.records.slice(0, 5).map((record) => record.assetDescription);
      await showJson(page, { returned: results.records.length, first5: titles });

      console.log('Expected: The first page of  records is non-empty.)');
      expect(results.records.length).toBeGreaterThan(0);

      console.log(
        'Expected: Each record has a display name in assetDescription (there is no title field).',
      );
      for (const record of results.records) {
        expect(record.assetDescription.trim().length).toBeGreaterThan(0);
      }

      console.log(`API inventory total for Edmonton: ${results.totalAmount}`);
      console.log('API first 5 titles:', titles);
    });
  });
});
