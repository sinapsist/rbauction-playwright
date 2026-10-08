import { expect, test } from '../../src/fixtures/test';
import { pageProps, readNextData } from '../../src/api/page-json';
import { flattenCategories, UpcomingEvent, Yard, YardCategory, YardPageProps } from '../../src/api/types';
import { openApiSession } from '../../src/helpers/api-session';
import { showJson } from '../../src/helpers/show-json';
import { step } from '../../src/helpers/step';

test.describe('API-2: Edmonton yard page JSON', () => {
  let yard: Yard | undefined;
  let events: UpcomingEvent[] = [];
  let categories: YardCategory[] = [];

  test.beforeAll(async ({ browser }) => {
    const { page, context } = await openApiSession(browser);
    await page.goto('/lp/edmonton-ab', { waitUntil: 'domcontentloaded' });
    const props = pageProps(await readNextData<YardPageProps>(page));
    yard = props.yardDetails;
    events = props.upcomingEvents ?? [];
    categories = flattenCategories(props.itemsInYard);
    await context.close();
  });

  test('API-2.1: A2.1 names the yard Edmonton and gives the Nisku address', async ({ page }) => {
    await step(page, 'Check the yard name and address', async () => {
      await showJson(page, { name: yard?.name, address: yard?.address });

      console.log("Expected: Yard name is Edmonton. Address includes 1500 Sparrow Drive, Nisku, and T9E 8H6. " +
          "A phone number and pickup/office hours are present.");
      expect(yard?.name).toBe('Edmonton');
      expect(yard?.address?.addressLine1).toContain('1500 Sparrow Drive');
      expect(yard?.address?.city).toBe('Nisku');
      expect(yard?.address?.zipPostalCode).toBe('T9E 8H6');
    });
  });

  test('API-2.2: A2.2 includes a phone number and pickup hours', async ({ page }) => {
    await step(page, 'Check the phone number and pickup hours', async () => {
      await showJson(page, {
        contactPhone: yard?.contactPhone,
        pickupHoursFrom: yard?.pickupHoursFrom,
        pickupHoursTo: yard?.pickupHoursTo,
      });

      console.log("Expected: A phone number is present and includes digits. Pickup hours are present.");
      expect(yard?.contactPhone).toMatch(/\d/);
      expect(yard?.pickupHoursFrom).toBeTruthy();
      expect(yard?.pickupHoursTo).toBeTruthy();
    });
  });

  test('API-2.3: A2.3 lists upcoming events with dates and a name tied to the yard', async ({ page }) => {
    await step(page, 'Check upcoming events', async () => {
      await showJson(
        page,
        events.map((event) => ({
          name: event.event_advertised_name,
          start: event.event_start_date || event.event_start_date_time || event.date_of_event,
          end: event.event_end_date_time || event.event_start_date,
          locality: event.event_locality,
        })),
      );

      if (events.length === 0) return;

      console.log("Expected: If the yard has upcoming events, count is at least 1.");
      expect(events.length).toBeGreaterThanOrEqual(1);
      console.log("Expected: Each event has a start/end date (or date range) and a name. " +
          "At least one event refers to Edmonton or Nisku.");
      for (const event of events) {
        expect(event.event_advertised_name).toBeTruthy();
        expect(Boolean(event.event_start_date || event.event_start_date_time || event.date_of_event)).toBe(true);
        expect(Boolean(event.event_end_date_time || event.event_start_date)).toBe(true);
      }
      expect(
        events.some((event) =>
          /Edmonton|Nisku/i.test(
            [event.event_advertised_name, event.event_locality, event.event_region].filter(Boolean).join(' '),
          ),
        ),
      ).toBe(true);
    });
  });

  test('API-2.4: A2.4 flattens items in yard and includes Excavators', async ({ page }) => {
    await step(page, 'Check items in yard categories', async () => {
      await showJson(
        page,
        categories.map((category) => ({
          categoryLocalized: category.categoryLocalized,
          totalAssets: category.totalAssets,
        })),
      );

      console.log("Expected: Count is greater than 5.");
      expect(categories.length).toBeGreaterThan(5);
      console.log("Expected: Each category has a name ( categoryLocalized ). Quantities\n" +
          "( totalAssets ), when present, are numbers ≥ 0.")
      for (const category of categories) {
        expect(category.categoryLocalized).toBeTruthy();
        if (category.totalAssets !== undefined && category.totalAssets !== null) {
          expect(typeof category.totalAssets).toBe('number');
          expect(category.totalAssets).toBeGreaterThanOrEqual(0);
        }
      }

      console.log("Expected: The list includes Excavators");
      expect(categories.map((category) => category.categoryLocalized)).toContain('Excavators');
    });
  });
});
