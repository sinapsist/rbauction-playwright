# Ritchie Bros. Auction sites — Playwright tests

Playwright tests in TypeScript for the public Ritchie Bros. locations site. The suite covers the auction-sites directory, opening a yard from that directory, the Edmonton yard page, and the Edmonton inventory search, plus the JSON and HTTP checks behind those pages.

The tests run against the live site at `https://www.rbauction.com`. Inventory counts, event dates, and featured lots change, so the assertions check shape and runtime counts rather than a fixed snapshot. The suite stays on public pages. It never creates an account, places a bid, or submits the Become a seller form. The empty-form check clicks Submit only so the page can show its required-field errors.

## Unclarified Questions/Requirements

| Test No| Description |
| --- | --- |
| UI-N-1.9 | There is a probable issue with data because the representative name in the search field includes some junk data |
| UI-N-1.9 | Japan does not have cities; the local representatives are listed under the country |


GET /api/locations

## Prerequisites

- Node.js 18 or newer
- Google Chrome installed locally
- Java 8 or newer, used by the Allure command line to build the HTML report

Akamai blocks Playwright's bundled headless Chromium because that browser advertises `HeadlessChrome`. The default config launches the installed Google Chrome with a normal Chrome user agent. If Chrome is not installed, run the bundled browser in headed mode instead:

```bash
PLAYWRIGHT_CHROMIUM=bundled npm test
```

## Install

```bash
npm install
npx playwright install chromium
```

`npx playwright install chromium` is only required for the bundled-browser fallback. The default run uses Google Chrome.

## Run the tests

```bash
npm test                 # end-to-end and API
npm run test:e2e         # browser scenarios only
npm run test:api         # page JSON and POST /api/search
npm run test:headed      # same suites with a visible browser
npm run typecheck        # TypeScript check, no browser
```

Run one file or one project:

```bash
npx playwright test tests/e2e/locations-directory.spec.ts
npx playwright test tests/api --project=api
npx playwright test -g "A1.3"
```

Scenario 4 and API 3 print the inventory total and the first five titles to the console.

A test has 90 seconds to finish. Expects wait up to 20 seconds, and navigation waits up to 45 seconds. Failed tests retry once. The end-to-end project runs tests in parallel. The API project runs each file on one worker so `beforeAll` can load a payload once and share it with the checks in that file.

## Reports

`npm test` writes two reports:

- Playwright HTML report in `playwright-report/`
- Allure raw results in `allure-results/`

### Playwright HTML report

```bash
npm run report
```

A failed run also stores a screenshot, and the retry stores a trace, under `test-results/`.

### Allure report

Allure results accumulate. `npm run allure:generate` rebuilds the HTML report from whatever is already in `allure-results/`, and it does not delete those results. To wipe the previous results and report, rerun the tests, and write a new report:

```bash
npm run allure:fresh
```

That command runs `scripts/generate-allure-report.sh`, which deletes `allure-results/` and `allure-report/`, runs `npm test`, then generates the report.

Other Allure commands:

```bash
npm run allure:generate  # write allure-report/ from the current results
npm run allure:open      # open a report that was already generated
npm run allure:serve     # build a temporary report from allure-results/ and open it
```

Or generate the report without the npm script:

```bash
bash scripts/generate-allure-report.sh
npx allure generate allure-results --clean -o allure-report
npx allure open allure-report
```

Each scenario step is an Allure step. `src/helpers/step.ts` takes a screenshot after the step body finishes, including when the step fails, and attaches that image to the step. Playwright's automatic click and assertion steps are omitted (`detail: false`) because those steps cannot hold attachments. API checks render the payload under test into the page before the screenshot so the report shows the data, not a blank browser.

## What is covered

| Area | Spec |
| --- | --- |
| UI-1 Locations directory (`/lp`) | `tests/e2e/locations-directory.spec.ts` |
| UI-2 Open Edmonton from the directory | `tests/e2e/open-yard.spec.ts` |
| UI-3 Edmonton yard page, including the seller form component | `tests/e2e/edmonton-yard.spec.ts` |
| UI-4 Edmonton inventory search | `tests/e2e/edmonton-search.spec.ts` |
| UI-6 Negative UI (unknown yard, wrong city slug, empty and cross-city search, wrong country list, representative search by unknown name or location, Lagos address with junk text) | `tests/e2e/negative.spec.ts` |
| API-1 Yards array from the `/lp` page JSON | `tests/api/auction-sites.spec.ts` |
| API-2 Edmonton yard, events, and items in yard | `tests/api/edmonton-yard.spec.ts` |
| API-3 `POST /api/search` | `tests/api/inventory-search.spec.ts` |
| API-4 Negative API (bad JSON, rejected method, missing endpoints, unknown yard) | `tests/api/negative.spec.ts` |

Starting URLs:

- https://www.rbauction.com/lp
- https://www.rbauction.com/lp/edmonton-ab
- https://www.rbauction.com/search?freeText=Edmonton

There is no public `/api/locations`. Auction-site and yard data are read from the Next.js `__NEXT_DATA__` payload on `/lp` and `/lp/edmonton-ab`. Inventory search is `POST /api/search` with `{ "freeText": "Edmonton", "size": 60 }`. The hit count is `results.totalAmount`. Lot names are `assetDescription`. API calls go through a browser context so they reuse the session that got past Akamai.

The Items in yard check counts every category card in the carousel markup, including slides that are off screen.

## Project structure

```
playwright.config.ts          Chrome channel, reporters, e2e and api projects
tsconfig.json
package.json
scripts/generate-allure-report.sh
src/browser-options.ts        shared user agent and context options
src/fixtures/test.ts          page objects and shared start state
src/pages/                    directory, yard, and search page objects
src/pages/components/         shared widgets; seller.component.ts is the Become a seller form
src/api/                      __NEXT_DATA__ reader, payload types, search client
src/helpers/                  cookies, parsing, Allure steps, API session, JSON screenshots
tests/e2e/                    UI scenarios
tests/api/                    JSON and HTTP checks
```

Page objects own navigation and the locators or DOM queries a scenario needs. Specs keep the assignment checks: counts, required names, and the shape of each card or record.

`LocationsPage` and `YardPage` both expose a `seller` property, an instance of `SellerComponent` in `src/pages/components/seller.component.ts`. That component owns the Become a seller heading, phone number, Submit button, and the required-field messages. UI-3.5 and UI-6.4 call `edmontonYard.seller` for those checks. The empty-form test clicks Submit and stops there; it does not send the form.

Fixtures in `src/fixtures/test.ts` supply those page objects. A fixture navigates only when several tests share that start state:

- `locationsDirectory` and `edmontonYard` open the page, because those scenarios all start there.
- `locationsPage`, `yardPage`, and `inventorySearch` do not navigate. Scenario 2 arrives on the yard by clicking, and scenario 4 opens the search inside the test.
- API specs load each payload once in `beforeAll`, then split the checks into A1.1, A1.2, and so on.

Playwright builds a fixture only when a test asks for it, so a check that only needs `page` does not open an extra screen.

## Notes

Country lists, satellite markers, and the Edmonton address are stable enough to assert exactly. Event dates, category quantities, and the search total are not.
