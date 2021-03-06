export enum EntryStatusEnum {
  CONFIRMED = 'CONFIRMED',
  DIRECT_ACCEPTANCE = 'DIRECT_ACCEPTANCE',
  ORGANISER_ACCEPTANCE = 'ORGANISER_ACCEPTANCE',

  ALTERNATE = 'ALTERNATE',
  WITHDRAWN = 'WITHDRAWN',

  // applies only to { participantType: INDIVIDUAL } entries in { eventType: DOUBLES }
  UNPAIRED = 'UNPAIRED',
  UNGROUPED = 'UNGROUPED',

  // These entryStatus enums apply only to draw.entries
  LUCKY_LOSER = 'LUCKY_LOSER',
  FEED_IN = 'FEED_IN',
  QUALIFIER = 'QUALIFIER',
  WILDCARD = 'WILDCARD',
}

export const ALTERNATE = EntryStatusEnum.ALTERNATE;
export const FEED_IN = EntryStatusEnum.FEED_IN;
export const QUALIFIER = EntryStatusEnum.QUALIFIER;
export const WILDCARD = EntryStatusEnum.WILDCARD;
export const DIRECT_ACCEPTANCE = EntryStatusEnum.DIRECT_ACCEPTANCE;
export const CONFIRMED = EntryStatusEnum.CONFIRMED;
export const LUCKY_LOSER = EntryStatusEnum.LUCKY_LOSER;
export const ORGANISER_ACCEPTANCE = EntryStatusEnum.ORGANISER_ACCEPTANCE;
export const WITHDRAWN = EntryStatusEnum.WITHDRAWN;
export const UNPAIRED = EntryStatusEnum.UNPAIRED;
export const UNGROUPED = EntryStatusEnum.UNGROUPED;

export const STRUCTURE_ENTERED_TYPES = [
  FEED_IN,
  QUALIFIER,
  WILDCARD,
  DIRECT_ACCEPTANCE,
  CONFIRMED,
  ORGANISER_ACCEPTANCE,
];

export const VALID_ENTERED_TYPES = [
  ALTERNATE,
  WITHDRAWN,
  FEED_IN,
  UNPAIRED,
  UNGROUPED,
  QUALIFIER,
  WILDCARD,
  DIRECT_ACCEPTANCE,
  CONFIRMED,
  LUCKY_LOSER,
  ORGANISER_ACCEPTANCE,
];

export const entryStatusConstants = {
  FEED_IN,
  WILDCARD,
  UNPAIRED,
  ALTERNATE,
  CONFIRMED,
  QUALIFIER,
  WITHDRAWN,
  LUCKY_LOSER,
  DIRECT_ACCEPTANCE,
  ORGANISER_ACCEPTANCE,

  VALID_ENTERED_TYPES,
  STRUCTURE_ENTERED_TYPES,
};
