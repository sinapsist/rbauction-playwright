import { expect, test } from '@playwright/test';
import { pageProps, readNextData } from '../../src/api/page-json';
import { countryLabel, LocationsPageProps } from '../../src/api/types';

test.describe('API 1 — Auction sites list', () => {
  test('reads yards from the locations page JSON', async ({ page }) => {
    await page.goto('/lp', { waitUntil: 'domcontentloaded' });
    const data = await readNextData<LocationsPageProps>(page);
    const yards = pageProps(data).yards;

    expect(Array.isArray(yards)).toBe(true);
    expect(yards!.length).toBeGreaterThan(60);

    for (const yard of yards!) {
      expect(yard.name, JSON.stringify(yard)).toBeTruthy();
      expect(countryLabel(yard).length).toBeGreaterThan(0);
      expect(['Satellite', 'Permanent']).toContain(yard.type);
    }

    const edmonton = yards!.find((yard) => yard.name === 'Edmonton');
    const phoenix = yards!.find((yard) => yard.name === 'Phoenix');
    expect(edmonton?.address?.country).toMatch(/Canada/i);
    expect(edmonton?.address?.countryCode).toBe('CAN');
    expect(phoenix?.address?.country).toMatch(/United States/i);
    expect(phoenix?.address?.countryCode).toBe('USA');

    const satellite = yards!.filter((yard) => yard.type === 'Satellite');
    const permanent = yards!.filter((yard) => yard.type === 'Permanent');
    expect(satellite.length).toBeGreaterThan(15);
    expect(permanent.length).toBeGreaterThan(25);

    const countries = new Set(yards!.map((yard) => yard.address?.country).filter(Boolean));
    expect(countries.size).toBeGreaterThan(8);
    expect(countries).toContain('United States');
    expect(countries).toContain('Canada');
  });
});
