import { EventPlace } from './address';

/** An upcoming auction. Subclasses differ by which start field the payload used.
 * event is either a TimedEvent, DatedEvent, or SingleDayEvent,
 * depending on the presence of startDateTime, startDate, or date in the payload.
 * */
export abstract class UpcomingEvent {
  abstract readonly kind: 'timed' | 'dated' | 'single-day';

  constructor(
    readonly name: string,
    readonly place: EventPlace,
    readonly end: string,
  ) {}

  abstract start(): string;

  haystack(): string {
    return [this.name, this.place.locality, this.place.region]
      .filter((part): part is string => part !== null && part !== '')
      .join(' ');
  }
}

export class TimedEvent extends UpcomingEvent {
  readonly kind = 'timed' as const;

  constructor(
    name: string,
    place: EventPlace,
    end: string,
    readonly startDateTime: string,
  ) {
    super(name, place, end);
  }

  start(): string {
    return this.startDateTime;
  }
}

export class DatedEvent extends UpcomingEvent {
  readonly kind = 'dated' as const;

  constructor(
    name: string,
    place: EventPlace,
    end: string,
    readonly startDate: string,
  ) {
    super(name, place, end);
  }

  start(): string {
    return this.startDate;
  }
}

export class SingleDayEvent extends UpcomingEvent {
  readonly kind = 'single-day' as const;

  constructor(
    name: string,
    place: EventPlace,
    end: string,
    readonly date: string,
  ) {
    super(name, place, end);
  }

  start(): string {
    return this.date;
  }
}

export function eventStart(event: UpcomingEvent): string {
  return event.start();
}

export function eventEnd(event: UpcomingEvent): string {
  return event.end;
}

export function eventHaystack(event: UpcomingEvent): string {
  return event.haystack();
}
