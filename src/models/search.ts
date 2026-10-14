/**
 * Represents a single record in the search results, containing the asset description.
 */
export class SearchRecord {
  constructor(readonly assetDescription: string) {}
}

/**
 * Represents the results of a search query, including the total number of records and the list of matching records.
 */
export class SearchResults {
  constructor(
    readonly totalAmount: number,
    readonly records: SearchRecord[],
  ) {}
}

/**
 *  Represents the response from a search query, encapsulating the search results.
 */
export class SearchResponse {
  constructor(readonly results: SearchResults) {}
}
