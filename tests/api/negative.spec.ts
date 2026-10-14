import { readRawPageProps } from '../../src/api/page-json';
import { SearchClient } from '../../src/api/search-client';
import { readOptionalYardName } from '../../src/api/types';
import { expect, normal, test } from '../../src/helpers/severity';
import { openApiSession } from '../../src/helpers/api-session';
import { loaded } from '../../src/helpers/loaded';
import { showJson } from '../../src/helpers/show-json';
import { step } from '../../src/helpers/step';

type HttpResult = { status: number; text: string };

type UnknownYard = { payload: 'absent' } | { payload: 'present'; yardName: string | null };

interface NegativeRun {
  malformed: HttpResult;
  putSearch: HttpResult;
  locations: HttpResult;
  yardsEndpoint: HttpResult;
  unknownYardUrl: string;
  unknownYard: UnknownYard;
}

const REAL_CITIES = ['Phoenix', 'Houston', 'Calgary', 'Toronto', 'Dubai', 'Las Vegas'];

test.describe('API-N-1: Negative API checks', () => {
  let run: NegativeRun | undefined;

  test.beforeAll(async ({ browser }) => {
    const { page, context } = await openApiSession(browser);
    const client = new SearchClient(page);
    await client.openSession();

    const malformed = await client.postRaw('{');

    const putResponse = await client.putSearch();
    const putSearch = { status: putResponse.status(), text: await putResponse.text() };

    const locationsResponse = await client.locationsEndpoint();
    const locations = { status: locationsResponse.status(), text: await locationsResponse.text() };

    const yardsResponse = await page.request.get('/api/yards', {
      headers: { accept: 'application/json' },
    });
    const yardsEndpoint = { status: yardsResponse.status(), text: await yardsResponse.text() };

    await page.goto('/lp/not-a-real-yard-xyz', { waitUntil: 'domcontentloaded' });
    const unknownYardUrl = page.url();
    const unknownYard: UnknownYard =
      (await page.locator('#__NEXT_DATA__').count()) > 0
        ? { payload: 'present', yardName: readOptionalYardName(await readRawPageProps(page)) }
        : { payload: 'absent' };

    run = { malformed, putSearch, locations, yardsEndpoint, unknownYardUrl, unknownYard };
    await context.close();
  });

  test('API-N-1.1: a malformed JSON search body is rejected', normal, async ({ page }) => {
    await step(page, 'Check the malformed JSON response', async () => {
      const malformed = loaded(run, 'negative API run').malformed;
      await showJson(page, malformed);

      expect(malformed.status).toBe(400);
      expect(malformed.text).toMatch(/Invalid JSON/i);
    });
  });

  test('API-N-1.2: PUT /api/search is rejected', normal, async ({ page }) => {
    await step(page, 'Check the PUT /api/search response', async () => {
      const putSearch = loaded(run, 'negative API run').putSearch;
      await showJson(page, { status: putSearch.status, text: putSearch.text.slice(0, 300) });

      expect(putSearch.status).toBeGreaterThanOrEqual(400);
      expect(putSearch.text).not.toMatch(/"totalAmount"\s*:\s*[1-9]/);
    });
  });

  for (const row of [
    {
      id: 'API-N-1.3',
      title: 'GET /api/locations is not a yards directory',
      stepName: 'Check GET /api/locations',
      read: (value: NegativeRun) => value.locations,
    },
    {
      id: 'API-N-1.5',
      title: 'GET /api/yards is not available',
      stepName: 'Check GET /api/yards',
      read: (value: NegativeRun) => value.yardsEndpoint,
    },
  ]) {
    test(`${row.id}: ${row.title}`, normal, async ({ page }) => {
      await step(page, row.stepName, async () => {
        const result = row.read(loaded(run, 'negative API run'));
        await showJson(page, { status: result.status });
        expect(result.status).toBe(404);
      });
    });
  }

  test(
    'API-N-1.4: an unknown yard slug does not return a real city yard payload',
    normal,
    async ({ page }) => {
      await step(page, 'Check the unknown yard payload', async () => {
        const { unknownYardUrl, unknownYard } = loaded(run, 'negative API run');
        await showJson(page, {
          url: unknownYardUrl,
          yardName: unknownYard.payload === 'present' ? unknownYard.yardName : null,
        });

        expect(unknownYardUrl).toMatch(/\/not-found/);
        if (unknownYard.payload === 'absent') return;

        expect(REAL_CITIES).not.toContain(unknownYard.yardName);
      });
    },
  );
});
