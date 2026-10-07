# Ritchie Bros. auction sites — Playwright tests

TypeScript end-to-end and API checks against the public Ritchie Bros. locations site.

These tests use the live production site. They do not create accounts, place bids, or submit the Become a seller form. The seller-form test only clicks Submit on an empty form so the page can show its required-field errors.

Inventory counts, event dates, and featured lots change. The tests check that values are present and well formed, and they count whatever is on the page at run time.

## Prerequisites

- Node.js 18 or newer
- Google Chrome installed locally
- Java 8 or newer, used by the Allure command line to build the HTML report

Akamai blocks Playwright's bundled headless Chromium. The default config launches installed Google Chrome with a normal Chrome user agent. If Chrome is not installed, run the bundled browser in headed mode instead:

```bash
PLAYWRIGHT_CHROMIUM=bundled npm test
```

## Install

```bash
npm install
npx playwright install chromium
```

`npx playwright install chromium` is only required for the bundled-browser fallback. The default run uses Google Chrome.

## Run

```bash
npm test                 # e2e and API
npm run test:e2e         # browser scenarios only
npm run test:api         # page JSON and POST /api/search
npm run test:headed      # same suites with a visible browser
npm run report           # open the Playwright HTML report
npm run allure:serve     # build the Allure report and open it
npm run allure:generate  # write allure-report/ without opening it
npm run allure:open      # open a report already generated
npm run typecheck
```

Useful filters:

```bash
npx playwright test tests/e2e/locations-directory.spec.ts
npx playwright test tests/api --project=api
```

Scenario 4 and API 3 print the inventory total and the first five titles to the console.

## What is covered

| Area | Spec |
| --- | --- |
| Locations directory (`/lp`) | `tests/e2e/locations-directory.spec.ts` |
| Open Edmonton from the directory | `tests/e2e/open-yard.spec.ts` |
| Edmonton yard page | `tests/e2e/edmonton-yard.spec.ts` |
| Edmonton inventory search | `tests/e2e/edmonton-search.spec.ts` |
| Negative UI (unknown yard, unknown search, empty seller form) | `tests/e2e/negative.spec.ts` |
| Yards array from `/lp` page JSON | `tests/api/auction-sites.spec.ts` |
| Edmonton yard, events, and items in yard | `tests/api/edmonton-yard.spec.ts` |
| `POST /api/search` | `tests/api/inventory-search.spec.ts` |
| Negative API (bad JSON, PUT, missing `/api/locations`, unknown yard) | `tests/api/negative.spec.ts` |

Starting URLs:

- https://www.rbauction.com/lp
- https://www.rbauction.com/lp/edmonton-ab
- https://www.rbauction.com/search?freeText=Edmonton

## Architecture

```
playwright.config.ts     two projects: e2e and api
src/fixtures/test.ts     Playwright fixtures
src/pages                page objects for the directory, yard, and search
src/api                  __NEXT_DATA__ reader, payload types, search client
src/support              cookie banner, totals, satellite labels, event text, Allure steps
tests/e2e                UI scenarios
tests/api                JSON and HTTP checks
```

Page objects own navigation and the locators or DOM queries a scenario needs. Specs keep the assignment checks: counts, required names, and shape of each card or record.

Fixtures in `src/fixtures/test.ts` supply those page objects. A fixture navigates only when several tests share that start state:

- `locationsDirectory` and `edmontonYard` open the page, because those scenarios all start there.
- `locationsPage`, `yardPage`, and `inventorySearch` do not navigate. Scenario 2 arrives on the yard by clicking, and scenario 4's open step is part of the check.
- `searchClient` loads the site once so `POST /api/search` can reuse the browser session. Tests that only read page JSON do not request it.

Playwright builds a fixture only when a test asks for it, so the unknown-yard checks do not pay for an extra page load.

## Allure report

`npm test` writes Allure results to `allure-results/`. Generate and open the report with:

```bash
npm run allure:serve
```

Each scenario step is an Allure step. `src/support/step.ts` takes a screenshot after the step body finishes, including when the step fails, and attaches that image to the step. Playwright's automatic click and assertion steps are omitted (`detail: false`) because those steps cannot hold attachments.

There is no public `/api/locations`. Auction-site and yard data are read from the Next.js `__NEXT_DATA__` payload on `/lp` and `/lp/edmonton-ab`. Inventory search is `POST /api/search` with `{ "freeText": "Edmonton", "size": 60 }`. The hit count is `results.totalAmount`. Lot names are `assetDescription`. API calls go through the browser context so they reuse the session that got past Akamai.

The Items in yard check counts every category card in the carousel markup, including slides that are off screen. It does not stop at the three or four tiles in the viewport.

## Notes

- Country lists, satellite markers, and the Edmonton address are stable enough to assert exactly. Event dates, category quantities, and the search total are not.
- A failed run writes a screenshot and, on the retry, a trace under `test-results/`. Open the HTML report with `npm run report`.
