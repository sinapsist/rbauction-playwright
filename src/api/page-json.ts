import { Page } from '@playwright/test';
import { LocationsPagePayload, YardPagePayload } from '../models';
import { isRecord, parseLocationsPage, parseYardPage } from './parse';

/**
 * Reads `__NEXT_DATA__` and returns `props.pageProps` as unknown.
 * Callers parse that value into a page model instead of casting it.
 */
export async function readRawPageProps(page: Page): Promise<unknown> {
  const raw = await page.locator('#__NEXT_DATA__').textContent();
  if (!raw) {
    throw new Error('Page did not include __NEXT_DATA__');
  }

  const parsed: unknown = JSON.parse(raw);
  if (!isRecord(parsed) || !isRecord(parsed.props) || !('pageProps' in parsed.props)) {
    throw new Error('__NEXT_DATA__ did not include props.pageProps');
  }
  return parsed.props.pageProps;
}

/**
 * Reads `props.pageProps` from `__NEXT_DATA__` and parses it into a `LocationsPagePayload`.
 * @param page
 * @returns A promise resolving to the parsed locations page payload.
 */
export async function readLocationsPage(page: Page): Promise<LocationsPagePayload> {
  return parseLocationsPage(await readRawPageProps(page));
}

/**
 * Reads `props.pageProps` from `__NEXT_DATA__` and parses it into a `YardPagePayload`.
 * @param page
 * @returns A promise resolving to the parsed yard page payload.
 */
export async function readYardPage(page: Page): Promise<YardPagePayload> {
  return parseYardPage(await readRawPageProps(page));
}
