import { UpcomingEvent } from './event';
import { YardCategory } from './category';
import { DirectoryYard, YardDetail } from './yard';

export abstract class PagePayload {}

/**
 * Payload for the locations page, which lists all yards in the directory.
 */
export class LocationsPagePayload extends PagePayload {
  constructor(readonly yards: DirectoryYard[]) {
    super();
  }
}

export class YardPagePayload extends PagePayload {
  constructor(
    readonly yard: YardDetail,
    readonly events: UpcomingEvent[],
    readonly categories: YardCategory[],
  ) {
    super();
  }
}
