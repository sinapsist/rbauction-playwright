/**
 * Represents a street address with its components.
 */
export class StreetAddress {
  constructor(
    readonly addressLine1: string,
    readonly city: string,
    readonly zipPostalCode: string,
  ) {}
}

export class PickupHours {
  constructor(
    readonly from: string,
    readonly to: string,
  ) {}
}

export class EventPlace {
  constructor(
    readonly locality: string | null,
    readonly region: string | null,
  ) {}
}
