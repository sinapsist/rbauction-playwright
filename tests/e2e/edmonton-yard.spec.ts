import { expect, test } from '../../src/fixtures/test';
import { eventTitle, hasDateRange } from '../../src/helpers/parse';
import { step } from '../../src/helpers/step';

const RELATED_CATEGORIES = [
  'Harvesting Equipment',
  'Agricultural Tractors',
  'Sprayers',
  'Excavator Attachments',
];

test.describe('Scenario 3 — Edmonton yard page', () => {
  test('3.1 shows the address, office hours, and a telephone number', async ({ page, edmontonYard }) => {
    await step(page, 'Check the yard details', async () => {
      const details = edmontonYard.detailsSection();

      await expect(details).toBeVisible();
      await expect(details).toContainText('1500 Sparrow Drive');
      await expect(details).toContainText('Nisku');
      await expect(details).toContainText('AB');
      await expect(details).toContainText('T9E 8H6');
      await expect(details).toContainText(/Mon\s*-\s*Fri/i);
      await expect(details).toContainText(/\d{1,2}:\d{2}/);
      await expect(details).toContainText(/Tel\.?\s*\+?\d[\d\s().-]{6,}/);
    });
  });

  test('3.2 lists auction event cards with a date range and a title', async ({ page, edmontonYard }) => {
    await step(page, 'Count the auction event cards', async () => {
      await expect(page.getByRole('heading', { name: 'Auction events', exact: true })).toBeVisible();

      const cards = await edmontonYard.eventCardTexts();
      expect(cards.length).toBeGreaterThanOrEqual(1);

      for (const card of cards) {
        expect(hasDateRange(card)).toBe(true);
        expect(eventTitle(card)).toBeTruthy();
      }
    });
  });

  test('3.3 describes weekday drop-off, inspection, and pick-up', async ({ page, edmontonYard }) => {
    await step(page, 'Read the About this yard section', async () => {
      const about = edmontonYard.aboutSection();

      await expect(about).toBeVisible();
      await expect(about).toContainText(/weekdays/i);
      await expect(about).toContainText(/drop-off/i);
      await expect(about).toContainText(/inspection/i);
      await expect(about).toContainText(/pick-up/i);
    });
  });

  test('3.4 counts every Items in yard category card, including off-screen slides', async ({ page, edmontonYard }) => {
    await step(page, 'Count the Items in yard category cards', async () => {
      const cards = await edmontonYard.categoryCards();

      expect(cards.length).toBeGreaterThan(5);
      for (const card of cards) {
        expect(card.name.length).toBeGreaterThan(0);
        expect(card.quantity).toMatch(/^\d[\d,]*\s+items$/i);
      }

      const names = cards.map((card) => card.name);
      expect(names).toContain('Excavators');
      expect(names.some((name) => RELATED_CATEGORIES.includes(name))).toBe(true);
    });
  });

  test('3.5 shows the Become a seller form and phone number without submitting it', async ({ page, edmontonYard }) => {
    await step(page, 'Check the Become a seller form without submitting it', async () => {
      await edmontonYard.sellerHeading().scrollIntoViewIfNeeded();

      await expect(edmontonYard.sellerHeading()).toBeVisible();
      await expect(edmontonYard.sellerPhone()).toBeVisible();
      await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
      await expect(page).toHaveURL(/\/lp\/edmonton-ab/);
    });
  });

  test('3.6 opens representative cards with a region and a contact method', async ({ page, edmontonYard }) => {
    await step(page, 'Open the Representatives tab', async () => {
      await edmontonYard.openRepresentatives();
      await expect(edmontonYard.representativesTab()).toHaveAttribute('aria-selected', 'true');
    });

    await step(page, 'Check the representative cards', async () => {
      const cards = await edmontonYard.representativeCards();
      expect(cards.length).toBeGreaterThanOrEqual(1);

      for (const card of cards) {
        expect(card.name.length).toBeGreaterThan(0);
        const details = card.text.replace(card.name, '').trim();
        expect(details.length).toBeGreaterThan(3);
        expect(card.text).toMatch(/mobile|phone|email/i);
        expect(card.text).toMatch(/(\+?\d[\d().\-\s]{6,})|([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i);
      }
    });
  });
});
