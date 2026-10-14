import {
  CodeOnlyCountry,
  CountedBranch,
  CountedLeaf,
  DatedEvent,
  EventPlace,
  flattenCategories,
  LocationsPagePayload,
  NamedCountry,
  NameOnlyCountry,
  PermanentDirectoryYard,
  PickupHours,
  SatelliteDirectoryYard,
  SearchRecord,
  SearchResponse,
  SearchResults,
  SingleDayEvent,
  StreetAddress,
  TimedEvent,
  UncountedBranch,
  UncountedLeaf,
  YardDetail,
  YardPagePayload,
} from '../models';
import type { Country, DirectoryYard, SiteType, UpcomingEvent, YardCategory } from '../models';

export class PayloadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PayloadError';
  }
}

/**
 * Type guard for checking if a value is a record (object with string keys).
 * @param value The value to check.
 * @returns True if the value is a record, false otherwise.
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Returns the value if it is a non-empty string, or null otherwise.
 * @param value
 */
function presentText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value : null;
}

/**
 * Returns the value if it is a string, or throws a PayloadError otherwise.
 * @param value The value to check.
 * @param path The path to the value in the payload, for error messages.
 * @returns The value if it is a string.
 * @throws PayloadError if the value is not a string.
 */
function requiredString(value: unknown, path: string): string {
  if (typeof value !== 'string') {
    throw new PayloadError(`${path} must be a string`);
  }
  return value;
}

/** Parses a country from an address object. Requires either a country name or a country code.
 * @param address The address object to parse.
 * @param path The path to the address object in the payload, for error messages.
 * @returns A Country object.
 * @throws PayloadError if neither a country name nor a country code is present.
 */
function parseCountry(address: Record<string, unknown>, path: string): Country {
  const country = presentText(address.country);
  const countryCode = presentText(address.countryCode);
  if (country !== null && countryCode !== null) return new NamedCountry(country, countryCode);
  if (country !== null) return new NameOnlyCountry(country);
  if (countryCode !== null) return new CodeOnlyCountry(countryCode);
  throw new PayloadError(`${path} needs a country or a countryCode`);
}

/**
 * Parses a site type from a value. The value must be either "Permanent" or "Satellite".
 * @param value The value to parse.
 * @param path The path to the value in the payload, for error messages.
 * @returns A SiteType.
 * @throws PayloadError if the value is not a valid site type.
 */
function parseSiteType(value: unknown, path: string): SiteType {
  if (value === 'Permanent' || value === 'Satellite') return value;
  throw new PayloadError(
    `${path} must be Permanent or Satellite, received ${JSON.stringify(value)}`,
  );
}

/**
 * Parses a directory yard from a value. The value must be an object with a name, type, and address.
 * @param value
 * @param index
 * @returns A DirectoryYard.
 * @throws PayloadError if the value is not a valid directory yard.
 */
function parseDirectoryYard(value: unknown, index: number): DirectoryYard {
  const path = `yards[${index}]`;
  if (!isRecord(value)) throw new PayloadError(`${path} must be an object`);

  const name = requiredString(value.name, `${path}.name`);
  const siteType = parseSiteType(value.type, `${path} (${name}).type`);
  if (!isRecord(value.address)) {
    throw new PayloadError(`${path} (${name}).address must be an object`);
  }

  const country = parseCountry(value.address, `${path} (${name}).address`);
  if (siteType === 'Permanent') return new PermanentDirectoryYard(name, country);
  return new SatelliteDirectoryYard(name, country);
}

/**
 * Parses a locations page payload from the given pageProps.
 * The pageProps must be an object with a yards property that is an array of directory yards.
 * @param pageProps
 * @returns A LocationsPagePayload.
 * @throws PayloadError if the pageProps is not a valid locations page payload.
 */
export function parseLocationsPage(pageProps: unknown): LocationsPagePayload {
  if (!isRecord(pageProps) || !Array.isArray(pageProps.yards)) {
    throw new PayloadError('pageProps.yards must be an array');
  }
  return new LocationsPagePayload(pageProps.yards.map(parseDirectoryYard));
}

/**
 * Parses an upcoming event from a value.
 * The value must be an object with an event name, place, and start and end dates.
 * @param value The value to parse.
 * @param index The index of the event in the upcomingEvents array, for error messages.
 * @returns An UpcomingEvent.
 * @throws PayloadError if the value is not a valid upcoming event.
 */
function parseEvent(value: unknown, index: number): UpcomingEvent {
  const path = `upcomingEvents[${index}]`;
  if (!isRecord(value)) throw new PayloadError(`${path} must be an object`);

  const name = requiredString(value.event_advertised_name, `${path}.event_advertised_name`);
  const place = new EventPlace(presentText(value.event_locality), presentText(value.event_region));
  const startDate = presentText(value.event_start_date);
  const startDateTime = presentText(value.event_start_date_time);
  const dateOfEvent = presentText(value.date_of_event);
  const end = presentText(value.event_end_date_time) ?? startDate;

  if (end === null || (startDate === null && startDateTime === null && dateOfEvent === null)) {
    throw new PayloadError(`${path} (${name}) needs a start and an end`);
  }
  if (startDateTime !== null) return new TimedEvent(name, place, end, startDateTime);
  if (startDate !== null) return new DatedEvent(name, place, end, startDate);
  if (dateOfEvent !== null) return new SingleDayEvent(name, place, end, dateOfEvent);
  throw new PayloadError(`${path} (${name}) needs a start and an end`);
}

/**
 * Parses a category forest from a value. The value must be an array of category objects,
 * each of which may have a name, total assets, and nested categories.
 * @param value The value to parse.
 * @returns An array of YardCategory objects.
 * @throws PayloadError if the value is not a valid category forest.
 */
function parseCategoryForest(value: unknown): YardCategory[] {
  if (value == null) return [];
  if (Array.isArray(value)) return value.flatMap(parseCategoryForest);
  if (!isRecord(value)) return [];

  const nested = Array.isArray(value.categories) ? parseCategoryForest(value.categories) : [];
  const name = typeof value.categoryLocalized === 'string' ? value.categoryLocalized : null;
  if (name === null) return nested;

  const totalAssets = typeof value.totalAssets === 'number' ? value.totalAssets : null;
  if (nested.length > 0) {
    return [
      totalAssets === null
        ? new UncountedBranch(name, nested)
        : new CountedBranch(name, totalAssets, nested),
    ];
  }
  return [totalAssets === null ? new UncountedLeaf(name) : new CountedLeaf(name, totalAssets)];
}

/**
 * Parses yard details from a value.
 * The value must be an object with a name, address, contact phone, and pickup hours.
 * @param value The value to parse.
 * @returns A new YardDetail object.
 * @throws PayloadError if the value is not a valid yard detail.
 */
function parseYardDetail(value: unknown): YardDetail {
  if (!isRecord(value)) throw new PayloadError('yardDetails must be an object');
  if (!isRecord(value.address)) throw new PayloadError('yardDetails.address must be an object');

  return new YardDetail(
    requiredString(value.name, 'yardDetails.name'),
    new StreetAddress(
      requiredString(value.address.addressLine1, 'yardDetails.address.addressLine1'),
      requiredString(value.address.city, 'yardDetails.address.city'),
      requiredString(value.address.zipPostalCode, 'yardDetails.address.zipPostalCode'),
    ),
    requiredString(value.contactPhone, 'yardDetails.contactPhone'),
    new PickupHours(
      requiredString(value.pickupHoursFrom, 'yardDetails.pickupHoursFrom'),
      requiredString(value.pickupHoursTo, 'yardDetails.pickupHoursTo'),
    ),
  );
}

/**
 * Parses a yard page from a value.
 * @param pageProps The value to parse.
 * @returns A new YardPagePayload object.
 * @throws PayloadError if the value is not a valid yard page.
 */
export function parseYardPage(pageProps: unknown): YardPagePayload {
  if (!isRecord(pageProps)) throw new PayloadError('pageProps must be an object');

  const events = Array.isArray(pageProps.upcomingEvents)
    ? pageProps.upcomingEvents.map(parseEvent)
    : [];

  return new YardPagePayload(
    parseYardDetail(pageProps.yardDetails),
    events,
    flattenCategories(parseCategoryForest(pageProps.itemsInYard)),
  );
}

export function parseSearchResponse(value: unknown): SearchResponse {
  if (!isRecord(value) || !isRecord(value.results)) {
    throw new PayloadError('search response did not include results');
  }

  const { results } = value;
  if (typeof results.totalAmount !== 'number') {
    throw new PayloadError('results.totalAmount must be a number');
  }
  if (!Array.isArray(results.records)) {
    throw new PayloadError('results.records must be an array');
  }

  return new SearchResponse(
    new SearchResults(
      results.totalAmount,
      results.records.map((record, index) => {
        if (!isRecord(record)) {
          throw new PayloadError(`results.records[${index}] must be an object`);
        }
        return new SearchRecord(
          requiredString(record.assetDescription, `results.records[${index}].assetDescription`),
        );
      }),
    ),
  );
}

/** Yard name on a page that may be a not-found payload rather than a yard. */
export function readOptionalYardName(pageProps: unknown): string | null {
  if (!isRecord(pageProps) || !isRecord(pageProps.yardDetails)) return null;
  return typeof pageProps.yardDetails.name === 'string' ? pageProps.yardDetails.name : null;
}
