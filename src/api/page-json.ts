import { Page } from '@playwright/test';
import { NextData } from './types';

export async function readNextData<T>(page: Page): Promise<NextData<T>> {
  const raw = await page.locator('#__NEXT_DATA__').textContent();
  if (!raw) {
    throw new Error('Page did not include __NEXT_DATA__');
  }
  return JSON.parse(raw) as NextData<T>;
}

export function pageProps<T>(data: NextData<T>): T {
  const props = data.props?.pageProps;
  if (!props) {
    throw new Error('__NEXT_DATA__ did not include props.pageProps');
  }
  return props;
}
