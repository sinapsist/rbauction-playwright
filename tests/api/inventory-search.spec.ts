import { expect, test } from '@playwright/test';
import { SearchClient } from '../../src/api/search-client';

test.describe('API 3 — Edmonton inventory search', () => {
  test('POST /api/search returns a positive total and named records', async ({ page }) => {
    const client = new SearchClient(page);
    await client.openSession();

    const response = await client.search('Edmonton');
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
