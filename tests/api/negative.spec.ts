import { expect, test } from '../../src/fixtures/test';
import { readNextData } from '../../src/api/page-json';
import { SearchClient } from '../../src/api/search-client';
import { YardPageProps } from '../../src/api/types';
import { openApiSession } from '../../src/helpers/api-session';
import { showJson } from '../../src/helpers/show-json';
import { step } from '../../src/helpers/step';

type HttpResult = { status: number; text: string };

const REAL_CITIES = ['Phoenix', 'Houston', 'Calgary', 'Toronto', 'Dubai', 'Las Vegas'];

test.describe('API-N-1: Negative API checks', () => {
  let malformed: HttpResult = { status: 0, text: '' };
  let putSearch: HttpResult = { status: 0, text: '' };
  let locations: HttpResult = { status: 0, text: '' };
  let yardsEndpoint: HttpResult = { status: 0, text: '' };
  let unknownYardUrl = '';
  let unknownYardName: string | undefined;
  let unknownYardHasPayload = false;

  test.beforeAll(async ({ browser }) => {
    const { page, context } = await openApiSession(browser);
    const client = new SearchClient(page);
    await client.openSession();

    malformed = await client.postRaw('{');

    const putResponse = await client.putSearch();
    putSearch = { status: putResponse.status(), text: await putResponse.text() };

    const locationsResponse = await client.locationsEndpoint();
    locations = { status: locationsResponse.status(), text: await locationsResponse.text() };

    const yardsResponse = await page.request.get('/api/yards', { headers: { accept: 'application/json' } });
    yardsEndpoint = { status: yardsResponse.status(), text: await yardsResponse.text() };

    await page.goto('/lp/not-a-real-yard-xyz', { waitUntil: 'domcontentloaded' });
    unknownYardUrl = page.url();
    unknownYardHasPayload = (await page.locator('#__NEXT_DATA__').count()) > 0;
    if (unknownYardHasPayload) {
      const data = await readNextData<YardPageProps>(page);
      unknownYardName = data.props?.pageProps?.yardDetails?.name;
    }

    await context.close();
  });

  test('API-N-1.1: a malformed JSON search body is rejected', async ({ page }) => {
    await step(page, 'Check the malformed JSON response', async () => {
      await showJson(page, malformed);

      expect(malformed.status).toBe(400);
      expect(malformed.text).toMatch(/Invalid JSON/i);
    });
  });

  test('API-N-1.2: PUT /api/search is rejected', async ({ page }) => {
    await step(page, 'Check the PUT /api/search response', async () => {
      await showJson(page, { status: putSearch.status, text: putSearch.text.slice(0, 300) });

      expect(putSearch.status).toBeGreaterThanOrEqual(400);
      expect(putSearch.text).not.toMatch(/"totalAmount"\s*:\s*[1-9]/);
    });
  });

  test('API-N-1.3: GET /api/locations is not a yards directory', async ({ page }) => {
    await step(page, 'Check GET /api/locations', async () => {
      await showJson(page, { status: locations.status });
      expect(locations.status).toBe(404);
    });
  });

  test('API-N-1.4: an unknown yard slug does not return a real city yard payload', async ({ page }) => {
    await step(page, 'Check the unknown yard payload', async () => {
      await showJson(page, { url: unknownYardUrl, yardName: unknownYardName ?? null });

      expect(unknownYardUrl).toMatch(/\/not-found/);
      if (!unknownYardHasPayload) return;

      expect(REAL_CITIES).not.toContain(unknownYardName);
    });
  });

  test('API-N-1.5: GET /api/yards is not available', async ({ page }) => {
    await step(page, 'Check GET /api/yards', async () => {
      await showJson(page, { status: yardsEndpoint.status });

      expect(yardsEndpoint.status).toBe(404);
    });
  });
});
