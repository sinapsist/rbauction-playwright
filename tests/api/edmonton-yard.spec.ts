import { readYardPage } from '../../src/api/page-json';
import {
  eventEnd,
  eventHaystack,
  eventStart,
  UpcomingEvent,
  YardCategory,
  YardDetail,
} from '../../src/models';
import { critical, expect, normal, test } from '../../src/helpers/severity';
import { openApiSession } from '../../src/helpers/api-session';
import { loaded } from '../../src/helpers/loaded';
import { showJson } from '../../src/helpers/show-json';
import { step } from '../../src/helpers/step';

test.describe('API-2: Edmonton yard page JSON', () => {
  let yard: YardDetail | undefined;
  let events: UpcomingEvent[] | undefined;
  let categories: YardCategory[] | undefined;

  test.beforeAll(async ({ browser }) => {
    const { page, context } = await openApiSession(browser);
    await page.goto('/lp/edmonton-ab', { waitUntil: 'domcontentloaded' });
    const payload = await readYardPage(page);
    yard = payload.yard;
    events = payload.events;
    categories = payload.categories;
    await context.close();
  });

  test(
    'API-2.1: A2.1 names the yard Edmonton and gives the Nisku address',
    critical,
    async ({ page }) => {
      await step(page, 'Check the yard name and address', async () => {
        const details = loaded(yard, 'Edmonton yard');
        await showJson(page, { name: details.name, address: details.address });

        console.log(
          'Expected: Yard name is Edmonton. Address includes 1500 Sparrow Drive, Nisku, and T9E 8H6. A phone number and pickup/office hours are present.',
        );
        expect(details.name).toBe('Edmonton');
        expect(details.address.addressLine1).toContain('1500 Sparrow Drive');
        expect(details.address.city).toBe('Nisku');
        expect(details.address.zipPostalCode).toBe('T9E 8H6');
      });
    },
  );

  test('API-2.2: A2.2 includes a phone number and pickup hours', normal, async ({ page }) => {
    await step(page, 'Check the phone number and pickup hours', async () => {
      const details = loaded(yard, 'Edmonton yard');
      await showJson(page, {
        contactPhone: details.contactPhone,
        pickupHoursFrom: details.pickupHours.from,
        pickupHoursTo: details.pickupHours.to,
      });

      console.log(
        'Expected: A phone number is present and includes digits. Pickup hours are present.',
      );
      expect(details.contactPhone).toMatch(/\d/);
      expect(details.pickupHours.from).toBeTruthy();
      expect(details.pickupHours.to).toBeTruthy();
    });
  });

  test(
    'API-2.3: A2.3 lists upcoming events with dates and a name tied to the yard',
    normal,
    async ({ page }) => {
      await step(page, 'Check upcoming events', async () => {
        const list = loaded(events, 'upcoming events');
        await showJson(
          page,
          list.map((event) => ({
            name: event.name,
            kind: event.kind,
            start: eventStart(event),
            end: eventEnd(event),
            locality: event.place.locality,
          })),
        );

        if (list.length === 0) return;

        console.log('Expected: If the yard has upcoming events, count is at least 1.');
        expect(list.length).toBeGreaterThanOrEqual(1);
        console.log(
          'Expected: Each event has a start/end date (or date range) and a name. At least one event refers to Edmonton or Nisku.',
        );
        for (const event of list) {
          expect(event.name).toBeTruthy();
          expect(eventStart(event)).toBeTruthy();
          expect(eventEnd(event)).toBeTruthy();
        }
        expect(list.some((event) => /Edmonton|Nisku/i.test(eventHaystack(event)))).toBe(true);
      });
    },
  );

  test('API-2.4: A2.4 flattens items in yard and includes Excavators', normal, async ({ page }) => {
    await step(page, 'Check items in yard categories', async () => {
      const list = loaded(categories, 'items in yard');
      await showJson(
        page,
        list.map((category) => ({
          name: category.name,
          totalAssets: category.counted ? category.totalAssets : null,
        })),
      );

      console.log('Expected: Count is greater than 5.');
      expect(list.length).toBeGreaterThan(5);
      console.log(
        'Expected: Each category has a name ( categoryLocalized ). Quantities ( totalAssets ), when present, are numbers ≥ 0.',
      );
      for (const category of list) {
        expect(category.name).toBeTruthy();
        if (category.counted) {
          expect(category.totalAssets).toBeGreaterThanOrEqual(0);
        }
      }

      console.log('Expected: The list includes Excavators');
      expect(list.map((category) => category.name)).toContain('Excavators');
    });
  });
});
