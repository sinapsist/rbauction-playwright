export interface YardAddress {
  city?: string;
  country?: string;
  countryCode?: string;
  addressLine1?: string;
  provinceState?: string;
  provinceStateCode?: string;
  zipPostalCode?: string;
}

export interface Yard {
  name?: string;
  type?: string;
  status?: string;
  address?: YardAddress;
  contactPhone?: string;
  pickupHoursFrom?: string | null;
  pickupHoursTo?: string | null;
  marketplaceAdvertisedName?: string;
}

export interface UpcomingEvent {
  event_advertised_name?: string;
  event_start_date?: string;
  event_start_date_time?: string;
  event_end_date_time?: string;
  date_of_event?: string;
  event_locality?: string;
  event_region?: string;
  event_country?: string;
}

export interface YardCategory {
  categoryLocalized?: string;
  totalAssets?: number;
  categories?: YardCategory[];
}

export interface ItemsInYardGroup {
  sale_event_id?: string;
  categories?: YardCategory[];
}

export interface LocationsPageProps {
  yards?: Yard[];
}

export interface YardPageProps {
  yardDetails?: Yard;
  upcomingEvents?: UpcomingEvent[];
  itemsInYard?: ItemsInYardGroup[];
}

export interface SearchRecord {
  assetDescription?: string;
}

export interface SearchResponse {
  results?: {
    totalAmount?: number;
    returnedAmount?: number;
    records?: SearchRecord[];
  };
}

export interface NextData<T> {
  props?: {
    pageProps?: T;
  };
}

export function flattenCategories(groups: ItemsInYardGroup[] | undefined): YardCategory[] {
  const categories: YardCategory[] = [];

  const walk = (value: unknown): void => {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }

    const record = value as YardCategory;
    if (typeof record.categoryLocalized === 'string') {
      categories.push(record);
    }
    if (record.categories) {
      walk(record.categories);
    }
  };

  walk(groups ?? []);
  return categories;
}

export function countryLabel(yard: Yard): string {
  return yard.address?.country || yard.address?.countryCode || '';
}
