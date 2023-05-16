export const CHECK_IN = 'CHECK_IN';
export const CHECK_OUT = 'CHECK_OUT';

export const SCHEDULE = 'SCHEDULE';
export const ASSIGN_VENUE = 'SCHEDULE.ASSIGNMENT.VENUE';
export const ALLOCATE_COURTS = 'SCHEDULE.ALLOCATION.COURTS';
export const ASSIGN_COURT = 'SCHEDULE.ASSIGNMENT.COURT';
export const COURT_ORDER = 'SCHEDULE.COURT.ORDER';

export const SCHEDULED_DATE = 'SCHEDULE.DATE';
export const COMPLETED_DATE = 'COMPLETED.DATE'; // considering adding this timeItem on completed score entry provided date is between tournament startDate/endDate

export const ASSIGN_OFFICIAL = 'SCHEDULE.ASSIGN.OFFICIAL';
export const SCHEDULED_TIME = 'SCHEDULE.TIME.SCHEDULED';
export const START_TIME = 'SCHEDULE.TIME.START';
export const STOP_TIME = 'SCHEDULE.TIME.STOP';
export const RESUME_TIME = 'SCHEDULE.TIME.RESUME';
export const END_TIME = 'SCHEDULE.TIME.END';

export const TIME_MODIFIERS = 'SCHEDULE.TIME.MODIFIERS';
export const AFTER_REST = 'AFTER_REST';
export const FOLLOWED_BY = 'FOLLOWED_BY';
export const NEXT_AVAILABLE = 'NEXT_AVAILABLE';
export const NOT_BEFORE = 'NOT_BEFORE';

export const ELIGIBILITY = 'ELIGIBILITY';
export const REGISTRATION = 'REGISTRATION';
export const SUSPENSION = 'SUSPENSION';
export const MEDICAL = 'MEDICAL';
export const PENALTY = 'PENALTY';

export const SCALE = 'SCALE';
export const RATING = 'RATING'; // 'SCALE.RATING'
export const RANKING = 'RANKING'; // 'SCALE.RANKING'
export const SEEDING = 'SEEDING'; // 'SCALE.SEEDING'

export const PUBLISH = 'PUBLISH';
export const PUBLIC = 'PUBLIC';
export const STATUS = 'STATUS';

export const MODIFICATION = 'MODIFICATION';
export const RETRIEVAL = 'RETRIEVAL';
export const OTHER = 'other';

export const timeItemConstants = {
  ALLOCATE_COURTS,
  ASSIGN_COURT,
  ASSIGN_OFFICIAL,
  ASSIGN_VENUE,
  CHECK_IN,
  CHECK_OUT,
  ELIGIBILITY,
  END_TIME,
  MEDICAL,
  OTHER,
  PENALTY,
  PUBLIC,
  PUBLISH,
  RANKING,
  RATING,
  REGISTRATION,
  RESUME_TIME,
  RETRIEVAL,
  SCALE,
  SCHEDULED_DATE,
  SCHEDULED_TIME,
  SEEDING,
  START_TIME,
  STATUS,
  STOP_TIME,
  SUSPENSION,
};
