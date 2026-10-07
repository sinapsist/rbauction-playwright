import { expect, test } from '../../src/fixtures/test';
import { SearchClient } from '../../src/api/search-client';
import { step } from '../../src/helpers/step';

test.describe('API 3 — Edmonton inventory search', () => {
  test('POST /api/search returns a positive total and named records', async ({ page, searchClient }) => {
    await step(page, 'POST /api/search for Edmonton', async () => {
    const response = await searchClient.search('Edmonton');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    const body = await SearchClient.readJson(response);
    const total = body.results?.totalAmount ?? 0;
    expect(total).toBeGreaterThan(0);

    const records = body.results?.records ?? [];
    expect(records.length).toBeGreaterThan(0);
    for (const record of records) {
      expect(record.assetDescription?.trim().length).toBeGreaterThan(0);
    }

    const titles = records.slice(0, 5).map((record) => record.assetDescription);
    console.log(`API inventory total for Edmonton: ${total}`);
    console.log('API first 5 titles:', titles);
    });
  });
});
