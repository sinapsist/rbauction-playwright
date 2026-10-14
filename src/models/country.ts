/**
 * A country is a value object that represents a country by name and/or code.
 * A country is known by name, by code, or by both.
 * The missing side is null, so a country with neither cannot be built.
 */
export abstract class Country {
  abstract readonly country: string | null;
  abstract readonly countryCode: string | null;

  abstract label(): string;

  abstract name(): string | null;
}

export class NamedCountry extends Country {
  readonly country: string;
  readonly countryCode: string;

  constructor(country: string, countryCode: string) {
    super();
    this.country = country;
    this.countryCode = countryCode;
  }

  label(): string {
    return this.country;
  }

  name(): string {
    return this.country;
  }
}

export class NameOnlyCountry extends Country {
  readonly countryCode: null = null;

  constructor(readonly country: string) {
    super();
  }

  label(): string {
    return this.country;
  }

  name(): string {
    return this.country;
  }
}

export class CodeOnlyCountry extends Country {
  readonly country: null = null;

  constructor(readonly countryCode: string) {
    super();
  }

  label(): string {
    return this.countryCode;
  }

  name(): null {
    return null;
  }
}

export function countryLabel(country: Country): string {
  return country.label();
}

export function countryName(country: Country): string | null {
  return country.name();
}
