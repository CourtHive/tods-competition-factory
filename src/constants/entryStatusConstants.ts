import { EntryStatusEnum } from '../types/tournamentFromSchema';

export const ALTERNATE = EntryStatusEnum.Alternate;
export const CONFIRMED = EntryStatusEnum.Confirmed;
export const DIRECT_ACCEPTANCE = EntryStatusEnum.DirectAcceptance;
export const FEED_IN = EntryStatusEnum.FeedIn;
export const JUNIOR_EXEMPT = EntryStatusEnum.JuniorExempt;
export const LUCKY_LOSER = EntryStatusEnum.LuckyLoser;
export const ORGANISER_ACCEPTANCE = EntryStatusEnum.OrganiserAcceptance;
export const QUALIFIER = EntryStatusEnum.Qualifier;
export const REGISTERED = EntryStatusEnum.Registered;
export const SPECIAL_EXEMPT = EntryStatusEnum.SpecialExempt;
export const UNGROUPED = EntryStatusEnum.Ungrouped;
export const UNPAIRED = EntryStatusEnum.Unpaired;
export const WILDCARD = EntryStatusEnum.Wildcard;
export const WITHDRAWN = EntryStatusEnum.Withdrawn;

export const EQUIVALENT_ACCEPTANCE_STATUSES = [
  CONFIRMED,
  DIRECT_ACCEPTANCE,
  JUNIOR_EXEMPT,
  ORGANISER_ACCEPTANCE,
  SPECIAL_EXEMPT,
];
export const DRAW_SPECIFIC_STATUSES = [FEED_IN, LUCKY_LOSER, QUALIFIER];

export const DIRECT_ENTRY_STATUSES = [
  CONFIRMED,
  DIRECT_ACCEPTANCE,
  FEED_IN,
  JUNIOR_EXEMPT,
  ORGANISER_ACCEPTANCE,
  SPECIAL_EXEMPT,
  WILDCARD,
];

export const STRUCTURE_SELECTED_STATUSES = [
  CONFIRMED,
  DIRECT_ACCEPTANCE,
  FEED_IN,
  JUNIOR_EXEMPT,
  LUCKY_LOSER,
  QUALIFIER,
  ORGANISER_ACCEPTANCE,
  SPECIAL_EXEMPT,
  WILDCARD,
];

export const VALID_ENTRY_STATUSES = [
  ALTERNATE,
  CONFIRMED,
  DIRECT_ACCEPTANCE,
  FEED_IN,
  JUNIOR_EXEMPT,
  LUCKY_LOSER,
  ORGANISER_ACCEPTANCE,
  QUALIFIER,
  REGISTERED,
  SPECIAL_EXEMPT,
  UNGROUPED,
  UNPAIRED,
  WILDCARD,
  WITHDRAWN,
];

// will be deprecated
export const STRUCTURE_ENTERED_TYPES = STRUCTURE_SELECTED_STATUSES;
export const VALID_ENTERED_TYPES = VALID_ENTRY_STATUSES;

export const entryStatusConstants = {
  ALTERNATE,
  CONFIRMED,
  DIRECT_ACCEPTANCE,
  DIRECT_ENTRY_STATUSES,
  DRAW_SPECIFIC_STATUSES,
  EQUIVALENT_ACCEPTANCE_STATUSES,
  FEED_IN,
  JUNIOR_EXEMPT,
  LUCKY_LOSER,
  ORGANISER_ACCEPTANCE,
  QUALIFIER,
  SPECIAL_EXEMPT,
  STRUCTURE_ENTERED_TYPES,
  STRUCTURE_SELECTED_STATUSES,
  UNGROUPED,
  UNPAIRED,
  VALID_ENTERED_TYPES,
  VALID_ENTRY_STATUSES,
  WILDCARD,
  WITHDRAWN,
};
