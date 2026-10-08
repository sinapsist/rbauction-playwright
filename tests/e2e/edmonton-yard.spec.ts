import { expect, test } from '../../src/fixtures/test';
import { eventTitle, hasDateRange } from '../../src/helpers/parse';
import { step } from '../../src/helpers/step';

const RELATED_CATEGORIES = [
  'Harvesting Equipment',
  'Agricultural Tractors',
  'Sprayers',
  'Excavator Attachments',
];

test.describe('UI-3: Scenario 3 — Edmonton yard page', () => {
  test('UI-3.1: 3.1 Open Yard Details', async ({ page, edmontonYard }) => {
    await step(page, 'shows the address, office hours, and a telephone number', async () => {
      const details = edmontonYard.detailsSection();
      console.log("Expected: Address is shown and includes 1500 Sparrow Drive, Nisku, AB, and postal code T9E 8H6." );
      console.log("Expected: Office hours are shown and include Mon - Fri and a time range. A telephone number is shown.");
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

  test('UI-3.2: 3.2 List Action events', async ({ page, edmontonYard }) => {
    await step(page, ' lists auction event cards with a date range and a title', async () => {

      console.log("Expected: The Auction events heading is visible (below Details). Count the event cards.");
      await expect(page.getByRole('heading', { name: 'Auction events', exact: true })).toBeVisible();

      console.log("Count must be at least 1.")
      const cards = await edmontonYard.eventCardTexts();
      expect(cards.length).toBeGreaterThanOrEqual(1);

      console.log("Each card has a date range (for example  Sep 22 - Sep 25 ) " +
          "and a title (for example  Edmonton, AB,\n" + "CAN ).")
      for (const card of cards) {
        expect(hasDateRange(card)).toBe(true);
        expect(eventTitle(card)).toBeTruthy();
      }
    });
  });

  test('UI-3.3: 3.3 Read the About this yard section', async ({ page, edmontonYard }) => {
    await step(page, 'describes weekday drop-off, inspection, and pick-up', async () => {
      const about = edmontonYard.aboutSection();

      console.log("Expected: Section is visible and non-empty.")
      await expect(about).toBeVisible();
      await expect(about).not.toBeEmpty();
      console.log("Expected: Text mentions that the yard is open on weekdays for drop-off, inspection, and pick-up")
      await expect(about).toContainText(/weekdays/i);
      await expect(about).toContainText(/drop-off/i);
      await expect(about).toContainText(/inspection/i);
      await expect(about).toContainText(/pick-up/i);
    });
  });

  test('UI-3.4: 3.4 Read items in the yard carousel', async ({ page, edmontonYard }) => {
    await step(page, 'Counts every Items in yard category card, including off-screen slides', async () => {
      const cards = await edmontonYard.categoryCards();

      console.log("Expected: This is the Items in yard carousel (not the auction-event cards)");
      console.log("Count all category cards in the carousel, " +
          "including slides that are off-screen — do not count only the 3–4 visible tiles. " +
          "Count must be greater than 5.");
      expect(cards.length).toBeGreaterThan(5);

      console.log("Expected: Each card has a name and a quantity like N items.");
      for (const card of cards) {
        expect(card.name.length).toBeGreaterThan(0);
        expect(card.quantity).toMatch(/^\d[\d,]*\s+items$/i);
      }

      const names = cards.map((card) => card.name);
      console.log("Expected: The carousel includes Excavators and at least one of Harvesting Equipment, Agricultural Tractors, Sprayers, or Excavator Attachments.")
      expect(names).toContain('Excavators');
      expect(names.some((name) => RELATED_CATEGORIES.includes(name))).toBe(true);
    });
  });

  test('UI-3.5: 3.5 Check Selling call-to-action', async ({ page, edmontonYard }) => {
    await step(page, 'Check the Become a seller form without submitting it', async () => {
      await edmontonYard.seller.scrollIntoView();

      console.log("Expected: \"Become a seller\" form is visible and has a phone number. Do not submit the form.")
      await expect(edmontonYard.seller.heading()).toBeVisible();
      await expect(edmontonYard.seller.phone()).toBeVisible();
      await expect(edmontonYard.seller.submitButton()).toBeVisible();
      await expect(page).toHaveURL(/\/lp\/edmonton-ab/);
    });
  });

  test('UI-3.6: 3.6 Open the Representatives tab', async ({ page, edmontonYard }) => {
    await step(page, 'opens representative cards with a region and a contact method', async () => {
      await edmontonYard.openRepresentatives();
      await expect(edmontonYard.representativesTab()).toHaveAttribute('aria-selected', 'true');
    });

    await step(page, 'Check the representative cards', async () => {
      const cards = await edmontonYard.representativeCards();

      console.log("Expected: At least one representative card is shown, " +
          "with a territory/region and at least one of: phone, mobile and email.");
      expect(cards.length).toBeGreaterThanOrEqual(1);
      for (const card of cards) {
        expect(card.name.length).toBeGreaterThan(0);
        const details = card.text.replace(card.name, '').trim();
        expect(details.length).toBeGreaterThan(1);
        expect(card.text).toMatch(/mobile|phone|email/i);
        expect(card.text).toMatch(/(\+?\d[\d().\-\s]{6,})|([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i);
      }
    });
  });
});
