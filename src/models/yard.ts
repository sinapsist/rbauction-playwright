import { PickupHours, StreetAddress } from './address';
import { Country } from './country';

export type SiteType = 'Permanent' | 'Satellite';

/** A yard from the directory list or from a yard page.
 * The directory list has permanent and satellite yards,
 * while the yard page has a detail yard with address, phone, and pickup hours.
 * */
export abstract class Yard {
  abstract readonly kind: 'directory' | 'detail';
  abstract readonly name: string;
}

/** A row in the auction-sites directory. Permanent and satellite yards extend this. */
export abstract class DirectoryYard extends Yard {
  readonly kind = 'directory' as const;
  abstract readonly siteType: SiteType;

  constructor(
    readonly name: string,
    readonly country: Country,
  ) {
    super();
  }
}

/**
 * A permanent yard in the auction-sites directory.
 * Permanent yards have a street address, phone, and pickup hours.
 */
export class PermanentDirectoryYard extends DirectoryYard {
  readonly siteType = 'Permanent' as const;
}

/**
 * A satellite yard in the auction-sites directory.
 * Satellite yards have a street address, phone, and pickup hours.
 */
export class SatelliteDirectoryYard extends DirectoryYard {
  readonly siteType = 'Satellite' as const;
}

/** The Edmonton-style yard page: street address, phone, and pickup hours. */
export class YardDetail extends Yard {
  readonly kind = 'detail' as const;

  constructor(
    readonly name: string,
    readonly address: StreetAddress,
    readonly contactPhone: string,
    readonly pickupHours: PickupHours,
  ) {
    super();
  }
}

export function isSatellite(yard: DirectoryYard): yard is SatelliteDirectoryYard {
  return yard instanceof SatelliteDirectoryYard;
}

export function isPermanent(yard: DirectoryYard): yard is PermanentDirectoryYard {
  return yard instanceof PermanentDirectoryYard;
}
