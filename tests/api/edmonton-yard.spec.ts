import { expect, test } from '@playwright/test';
import { pageProps, readNextData } from '../../src/api/page-json';
import { flattenCategories, YardPageProps } from '../../src/api/types';

test.describe('API 2 — Edmonton yard page JSON', () => {
  test('reads yard details, events, and items in yard from one payload', async ({ page }) => {
    await page.goto('/lp/edmonton-ab', { waitUntil: 'domcontentloaded' });
    const data = await readNextData<YardPageProps>(page);
    const props = pageProps(data);

    expect(data).toBeTruthy();
    const yard = props.yardDetails;
    expect(yard?.name).toBe('Edmonton');
    expect(yard?.address?.addressLine1).toContain('1500 Sparrow Drive');
    expect(yard?.address?.city).toBe('Nisku');
    expect(yard?.address?.zipPostalCode).toBe('T9E 8H6');
    expect(yard?.contactPhone).toMatch(/\d/);
    expect(yard?.pickupHoursFrom).toBeTruthy();
    expect(yard?.pickupHoursTo).toBeTruthy();

    const events = props.upcomingEvents ?? [];
    if (events.length > 0) {
      expect(events.length).toBeGreaterThanOrEqual(1);
      for (const event of events) {
        expect(event.event_advertised_name).toBeTruthy();
        const hasStart = Boolean(event.event_start_date || event.event_start_date_time || event.date_of_event);
        const hasEnd = Boolean(event.event_end_date_time || event.event_start_date);
        expect(hasStart).toBe(true);
        expect(hasEnd).toBe(true);
      }
      const mentionsYard = events.some((event) =>
        /Edmonton|Nisku/i.test(
          [event.event_advertised_name, event.event_locality, event.event_region].filter(Boolean).join(' '),
        ),
      );
      expect(mentionsYard).toBe(true);
    }

    const categories = flattenCategories(props.itemsInYard);
    expect(categories.length).toBeGreaterThan(5);
    for (const category of categories) {
      expect(category.categoryLocalized).toBeTruthy();
      if (category.totalAssets !== undefined && category.totalAssets !== null) {
        expect(typeof category.totalAssets).toBe('number');
        expect(category.totalAssets).toBeGreaterThanOrEqual(0);
      }
    }
    expect(categories.map((category) => category.categoryLocalized)).toContain('Excavators');
  });
});
