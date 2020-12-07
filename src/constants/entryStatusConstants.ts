export enum EntryStatusEnum {
  ALTERNATE = 'ALTERNATE',
  FEED_IN = 'FEED_IN',
  QUALIFIER = 'QUALIFIER',
  WILDCARD = 'WILDCARD',
  DIRECT_ACCEPTANCE = 'DIRECT_ACCEPTANCE',
  CONFIRMED = 'CONFIRMED',
  LUCKY_LOSER = 'LUCKY_LOSER',
  ORGANISER_ACCEPTANCE = 'ORGANISER_ACCEPTANCE',
  WITHDRAWN = 'WITHDRAWN',
  UNPAIRED = 'UNPAIRED',
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

export const STRUCTURE_ENTERED_TYPES = [
  FEED_IN,
  QUALIFIER,
  WILDCARD,
  DIRECT_ACCEPTANCE,
  CONFIRMED,
  LUCKY_LOSER,
  ORGANISER_ACCEPTANCE,
];

export const VALID_ENTERED_TYPES = [
  ALTERNATE,
  WITHDRAWN,
  FEED_IN,
  UNPAIRED,
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

  STRUCTURE_ENTERED_TYPES,
};
