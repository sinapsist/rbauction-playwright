import { expect, test } from '../../src/fixtures/test';
import { pageProps, readNextData } from '../../src/api/page-json';
import { countryLabel, LocationsPageProps, Yard } from '../../src/api/types';
import { openApiSession } from '../../src/helpers/api-session';
import { showJson } from '../../src/helpers/show-json';
import { step } from '../../src/helpers/step';

test.describe('API-1: Auction sites list', () => {
  let yards: Yard[] = [];

  test.beforeAll(async ({ browser }) => {
    const { page, context } = await openApiSession(browser);
    await page.goto('/lp', { waitUntil: 'domcontentloaded' });
    const data = await readNextData<LocationsPageProps>(page);
    yards = pageProps(data).yards ?? [];
    await context.close();
  });

  test('API-1.1: A1.1 reads a yards list longer than 60', async ({ page }) => {
    await step(page, 'Check the yards list length', async () => {
      await showJson(page, { count: yards.length });

      console.log("Expected: Payload is JSON and includes a list of yards/locations.");
      expect(Array.isArray(yards)).toBe(true);
    });
  });

  test('API-1.2: A1.2 reads a yards list longer than 60', async ({ page }) => {
    await step(page, 'Check the yards list length', async () => {
      await showJson(page, { count: yards.length });
      console.log("Expected: Count of locations is greater than 60");
      expect(yards.length).toBeGreaterThan(60);
    });
  });

  test('API-1.2: A1.2 gives every yard a name and a country', async ({ page }) => {
    await step(page, 'Check yard names and countries', async () => {
      await showJson(
        page,
        yards.slice(0, 5).map((yard) => ({ name: yard.name, country: countryLabel(yard) })),
      );

      console.log("Expected: Each location has a name and a country (name or code).");
      for (const yard of yards) {
        expect(yard.name, JSON.stringify(yard)).toBeTruthy();
        expect(countryLabel(yard).length).toBeGreaterThan(0);
      }
    });
  });

  test('API-1.3: A1.3 includes Edmonton in Canada and Phoenix in the United States', async ({ page }) => {
    await step(page, 'Find Edmonton and Phoenix', async () => {
      const edmonton = yards.find((yard) => yard.name === 'Edmonton');
      const phoenix = yards.find((yard) => yard.name === 'Phoenix');
      await showJson(page, {
        edmonton: edmonton?.address,
        phoenix: phoenix?.address,
      });

      console.log("Expected: The list includes Edmonton (Canada/ CAN ) and Phoenix (United States/ USA )");
      expect(edmonton?.address?.country).toMatch(/Canada/i);
      expect(edmonton?.address?.countryCode).toBe('CAN');
      expect(phoenix?.address?.country).toMatch(/United States/i);
      expect(phoenix?.address?.countryCode).toBe('USA');
    });
  });

  test('API-1.4: A1.4 marks each yard Satellite or Permanent', async ({ page }) => {
    await step(page, 'Check yard types', async () => {
      await showJson(page, [...new Set(yards.map((yard) => yard.type))]);

      console.log("Expected: Each location has a site type (Satellite or Permanent)")
      for (const yard of yards) {
        expect(['Satellite', 'Permanent']).toContain(yard.type);
      }
      const satellite = yards.filter((yard) => yard.type === 'Satellite');
      const permanent = yards.filter((yard) => yard.type === 'Permanent');
      await showJson(page, { satellite: satellite.length, permanent: permanent.length });

      console.log("Expected: Count of satellite locations is greater than 15");
      expect(satellite.length).toBeGreaterThan(15);
      console.log("Expected: Count of permanent locations is greater than 25.");
      expect(permanent.length).toBeGreaterThan(25);
    });
  });

  test('API-1.6: A1.6 covers more than 8 countries, including the United States and Canada', async ({ page }) => {
    await step(page, 'Count distinct countries', async () => {
      const countries = [...new Set(yards.map((yard) => yard.address?.country).filter(Boolean))];
      await showJson(page, countries);

      console.log("Expected: Count of distinct countries is greater than 8 and includes United States and Canada.");
      expect(countries.length).toBeGreaterThan(8);
      expect(countries).toContain('United States');
      expect(countries).toContain('Canada');
    });
  });
});
