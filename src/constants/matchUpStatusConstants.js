export const BYE = 'BYE';
export const RETIRED = 'RETIRED';
export const WALKOVER = 'WALKOVER';
export const DOUBLE_WALKOVER = 'DOUBLE_WALKOVER';
export const SUSPENDED = 'SUSPENDED';
export const ABANDONED = 'ABANDONED';
export const DEFAULTED = 'DEFAULTED';
export const CANCELLED = 'CANCELLED';
export const COMPLETED = 'COMPLETED';
export const INCOMPLETE = 'INCOMPLETE';
export const NOT_PLAYED = 'NOT_PLAYED';
export const IN_PROGRESS = 'IN_PROGRESS';
export const TO_BE_PLAYED = 'TO_BE_PLAYED';
export const DEAD_RUBBER = 'DEAD_RUBBER';

export const directingMatchUpStatuses = [
  BYE,
  COMPLETED,
  RETIRED,
  WALKOVER,
  DOUBLE_WALKOVER,
  DEFAULTED,
];

export const nonDirectingMatchUpStatuses = [
  CANCELLED,
  DEAD_RUBBER,
  TO_BE_PLAYED,
  NOT_PLAYED,
  ABANDONED,
  IN_PROGRESS,
  SUSPENDED,
  undefined,
];

export const activeMatchUpStatuses = [
  COMPLETED,
  RETIRED,
  WALKOVER,
  DOUBLE_WALKOVER,
  IN_PROGRESS,
  ABANDONED,
  DEFAULTED,
];

export const upcomingMatchUpStatuses = [
  TO_BE_PLAYED,
  INCOMPLETE,
  IN_PROGRESS,
  SUSPENDED,
];

export const matchUpStatusConstants = {
  ABANDONED,
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
