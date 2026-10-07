import { expect, test } from '@playwright/test';
import { readNextData } from '../../src/api/page-json';
import { SearchClient } from '../../src/api/search-client';
import { YardPageProps } from '../../src/api/types';

test.describe('Negative API checks', () => {
  test.beforeEach(async ({ page }) => {
    const client = new SearchClient(page);
    await client.openSession();
  });

  test('rejects a malformed JSON search body', async ({ page }) => {
    const client = new SearchClient(page);
    const response = await client.postRaw('{');

    expect(response.status).toBe(400);
    expect(response.text).toMatch(/Invalid JSON/i);
  });

  test('rejects PUT /api/search', async ({ page }) => {
    const client = new SearchClient(page);
    const response = await client.putSearch();

    expect(response.status()).toBeGreaterThanOrEqual(400);
    const body = await response.text();
    expect(body).not.toMatch(/"totalAmount"\s*:\s*[1-9]/);
  });

  test('does not expose a public /api/locations yards directory', async ({ page }) => {
    const client = new SearchClient(page);
    const response = await client.locationsEndpoint();

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('an unknown yard slug does not return an Edmonton yard payload', async ({ page }) => {
    await page.goto('/lp/not-a-real-yard-xyz', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/not-found/);

    const nextData = page.locator('#__NEXT_DATA__');
    if ((await nextData.count()) === 0) {
      return;
    }

    const data = await readNextData<YardPageProps>(page);
    expect(data.props?.pageProps?.yardDetails?.name).not.toBe('Edmonton');
    expect(data.props?.pageProps?.yardDetails?.address?.addressLine1 ?? '').not.toContain('1500 Sparrow Drive');
  });
});
