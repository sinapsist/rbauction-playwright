import { readLocationsPage } from '../../src/api/page-json';
import {
  countryLabel,
  countryName,
  DirectoryYard,
  isPermanent,
  isSatellite,
} from '../../src/models';
import { blocker, critical, expect, normal, test } from '../../src/helpers/severity';
import { openApiSession } from '../../src/helpers/api-session';
import { loaded } from '../../src/helpers/loaded';
import { showJson } from '../../src/helpers/show-json';
import { step } from '../../src/helpers/step';

const EXPECTED_YARDS = [
  { name: 'Edmonton', country: /Canada/i, countryCode: 'CAN' },
  { name: 'Phoenix', country: /United States/i, countryCode: 'USA' },
] as const;

test.describe('API-1: Auction sites list', () => {
  let yards: DirectoryYard[] | undefined;

  test.beforeAll(async ({ browser }) => {
    const { page, context } = await openApiSession(browser);
    await page.goto('/lp', { waitUntil: 'domcontentloaded' });
    yards = (await readLocationsPage(page)).yards;
    await context.close();
  });

  test('API-1.1: A1.1 reads a yards list longer than 60', blocker, async ({ page }) => {
    await step(page, 'Check the yards list length', async () => {
      const list = loaded(yards, 'yards list');
      await showJson(page, { count: list.length });

      console.log('Expected: Payload is JSON and includes a list of yards/locations.');
      expect(Array.isArray(list)).toBe(true);
    });
  });

  test('API-1.2: A1.2 reads a yards list longer than 60', critical, async ({ page }) => {
    await step(page, 'Check the yards list length', async () => {
      const list = loaded(yards, 'yards list');
      await showJson(page, { count: list.length });
      console.log('Expected: Count of locations is greater than 60');
      expect(list.length).toBeGreaterThan(60);
    });
  });

  test('API-1.2: A1.2 gives every yard a name and a country', critical, async ({ page }) => {
    await step(page, 'Check yard names and countries', async () => {
      const list = loaded(yards, 'yards list');
      await showJson(
        page,
        list.slice(0, 5).map((yard) => ({ name: yard.name, country: countryLabel(yard.country) })),
      );

      console.log('Expected: Each location has a name and a country (name or code).');
      for (const yard of list) {
        expect(yard.name, JSON.stringify(yard)).toBeTruthy();
        expect(countryLabel(yard.country).length).toBeGreaterThan(0);
      }
    });
  });

  test(
    'API-1.3: A1.3 includes Edmonton in Canada and Phoenix in the United States',
    critical,
    async ({ page }) => {
      await step(page, 'Find Edmonton and Phoenix', async () => {
        const list = loaded(yards, 'yards list');
        const found = EXPECTED_YARDS.map((expected) => ({
          expected,
          yard: list.find((yard) => yard.name === expected.name),
        }));
        await showJson(
          page,
          Object.fromEntries(
            found.map(({ expected, yard }) => [expected.name, yard?.country ?? null]),
          ),
        );

        console.log(
          'Expected: The list includes Edmonton (Canada/ CAN ) and Phoenix (United States/ USA )',
        );
        for (const { expected, yard } of found) {
          expect(yard, expected.name).toBeDefined();
          if (!yard) continue;
          expect(yard.country.country ?? '', expected.name).toMatch(expected.country);
          expect(yard.country.countryCode).toBe(expected.countryCode);
        }
      });
    },
  );

  test('API-1.4: A1.4 marks each yard Satellite or Permanent', critical, async ({ page }) => {
    await step(page, 'Check yard types', async () => {
      const list = loaded(yards, 'yards list');
      await showJson(page, [...new Set(list.map((yard) => yard.siteType))]);

      console.log('Expected: Each location has a site type (Satellite or Permanent)');
      for (const yard of list) {
        expect(['Satellite', 'Permanent']).toContain(yard.siteType);
      }
      const satellite = list.filter(isSatellite);
      const permanent = list.filter(isPermanent);
      await showJson(page, { satellite: satellite.length, permanent: permanent.length });

      console.log('Expected: Count of satellite locations is greater than 15');
      expect(satellite.length).toBeGreaterThan(15);
      console.log('Expected: Count of permanent locations is greater than 25.');
      expect(permanent.length).toBeGreaterThan(25);
    });
  });

  test(
    'API-1.6: A1.6 covers more than 8 countries, including the United States and Canada',
    normal,
    async ({ page }) => {
      await step(page, 'Count distinct countries', async () => {
        const list = loaded(yards, 'yards list');
        const countries = [
          ...new Set(
            list.flatMap((yard) => {
              const name = countryName(yard.country);
              return name === null ? [] : [name];
            }),
          ),
        ];
        await showJson(page, countries);

        console.log(
          'Expected: Count of distinct countries is greater than 8 and includes United States and Canada.',
        );
        expect(countries.length).toBeGreaterThan(8);
        expect(countries).toContain('United States');
        expect(countries).toContain('Canada');
      });
    },
  );
});
