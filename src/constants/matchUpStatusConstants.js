export const ABANDONED = 'ABANDONED';
export const AWAITING_RESULT = 'AWAITING_RESULT';
export const BYE = 'BYE';
export const CANCELLED = 'CANCELLED';
export const COMPLETED = 'COMPLETED';
export const DEAD_RUBBER = 'DEAD_RUBBER';
export const DEFAULTED = 'DEFAULTED';
export const DOUBLE_WALKOVER = 'DOUBLE_WALKOVER';
export const IN_PROGRESS = 'IN_PROGRESS';
export const INCOMPLETE = 'INCOMPLETE';
export const NOT_PLAYED = 'NOT_PLAYED';
export const RETIRED = 'RETIRED';
export const SUSPENDED = 'SUSPENDED';
export const TO_BE_PLAYED = 'TO_BE_PLAYED';
export const WALKOVER = 'WALKOVER';

export const particicipantsRequiredMatchUpStatuses = [
  AWAITING_RESULT,
  COMPLETED,
  DEFAULTED,
  DOUBLE_WALKOVER,
  IN_PROGRESS,
  INCOMPLETE,
  RETIRED,
  SUSPENDED,
  WALKOVER,
];

export const validMatchUpStatuses = [
  ABANDONED,
  AWAITING_RESULT,
  BYE,
  CANCELLED,
  COMPLETED,
  DEAD_RUBBER,
  DEFAULTED,
  DOUBLE_WALKOVER,
  IN_PROGRESS,
  INCOMPLETE,
  NOT_PLAYED,
  RETIRED,
  SUSPENDED,
  TO_BE_PLAYED,
  WALKOVER,
];

export const directingMatchUpStatuses = [
  BYE,
  COMPLETED,
  DEFAULTED,
  DOUBLE_WALKOVER,
  RETIRED,
  WALKOVER,
];

export const nonDirectingMatchUpStatuses = [
  ABANDONED,
  AWAITING_RESULT,
  CANCELLED,
  DEAD_RUBBER,
  IN_PROGRESS,
  INCOMPLETE,
  NOT_PLAYED,
  SUSPENDED,
  TO_BE_PLAYED,
  undefined,
];

export const completedMatchUpStatuses = [
  CANCELLED,
  ABANDONED,
  COMPLETED,
  DEAD_RUBBER,
  DEFAULTED,
  DOUBLE_WALKOVER,
  RETIRED,
  WALKOVER,
];

export const activeMatchUpStatuses = [
  ABANDONED,
  COMPLETED,
  DEFAULTED,
  DOUBLE_WALKOVER,
  IN_PROGRESS,
  RETIRED,
  WALKOVER,
];

export const upcomingMatchUpStatuses = [
  IN_PROGRESS,
  INCOMPLETE,
  SUSPENDED,
  TO_BE_PLAYED,
];

export const matchUpStatusConstants = {
  ABANDONED,
  AWAITING_RESULT,
  BYE,
  CANCELLED,
  COMPLETED,
  DEAD_RUBBER,
  DEFAULTED,
  DOUBLE_WALKOVER,
  IN_PROGRESS,
  INCOMPLETE,
  NOT_PLAYED,
  RETIRED,
  SUSPENDED,
  TO_BE_PLAYED,
  WALKOVER,
};
