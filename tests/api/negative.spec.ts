import { expect, test } from '../../src/fixtures/test';
import { readNextData } from '../../src/api/page-json';
import { YardPageProps } from '../../src/api/types';
import { step } from '../../src/helpers/step';

test.describe('Negative API checks', () => {
  test('rejects a malformed JSON search body', async ({ page, searchClient }) => {
    await step(page, 'POST malformed JSON to /api/search', async () => {
      const response = await searchClient.postRaw('{');

      expect(response.status).toBe(400);
      expect(response.text).toMatch(/Invalid JSON/i);
    });
  });

  test('rejects PUT /api/search', async ({ page, searchClient }) => {
    await step(page, 'PUT /api/search', async () => {
      const response = await searchClient.putSearch();

      expect(response.status()).toBeGreaterThanOrEqual(400);
      const body = await response.text();
      expect(body).not.toMatch(/"totalAmount"\s*:\s*[1-9]/);
    });
  });

  test('does not expose a public /api/locations yards directory', async ({ page, searchClient }) => {
    await step(page, 'GET /api/locations', async () => {
      const response = await searchClient.locationsEndpoint();

      expect(response.status()).toBeGreaterThanOrEqual(400);
    });
  });

  test('an unknown yard slug does not return an Edmonton yard payload', async ({ page }) => {
    await step(page, 'Open an unknown yard slug', async () => {
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
});
