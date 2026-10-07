import { APIResponse, Page } from '@playwright/test';
import { SearchResponse } from './types';

export class SearchClient {
  constructor(private readonly page: Page) {}

  /** Loads the origin first so later API calls reuse the browser session Akamai already accepted. */
  async openSession(): Promise<void> {
    await this.page.goto('/lp', { waitUntil: 'domcontentloaded' });
  }

  search(freeText: string): Promise<APIResponse> {
    return this.page.request.post('/api/search', {
      data: { freeText, size: 60 },
      headers: { accept: 'application/json' },
    });
  }

  /**
   * Sends the body bytes unchanged. Playwright's request API JSON-encodes
   * strings when the content type is JSON, which would turn `{` into `"{"`.
   */
  postRaw(body: string): Promise<{ status: number; text: string }> {
    return this.page.evaluate(async (payload) => {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
        },
        body: payload,
      });
      return { status: response.status, text: await response.text() };
    }, body);
  }

  putSearch(): Promise<APIResponse> {
    return this.page.request.fetch('/api/search', {
      method: 'PUT',
      data: { freeText: 'Edmonton' },
      headers: { accept: 'application/json' },
    });
  }

  locationsEndpoint(): Promise<APIResponse> {
    return this.page.request.get('/api/locations', {
      headers: { accept: 'application/json' },
    });
  }

  static async readJson(response: APIResponse): Promise<SearchResponse> {
    return (await response.json()) as SearchResponse;
  }
}
