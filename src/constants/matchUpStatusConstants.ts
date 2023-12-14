export const ABANDONED: any = 'ABANDONED';
export const AWAITING_RESULT: any = 'AWAITING_RESULT';
export const BYE: any = 'BYE';
export const CANCELLED: any = 'CANCELLED';
export const COMPLETED: any = 'COMPLETED';
export const DEAD_RUBBER: any = 'DEAD_RUBBER';
export const DEFAULTED: any = 'DEFAULTED';
export const DOUBLE_DEFAULT: any = 'DOUBLE_DEFAULT';
export const DOUBLE_WALKOVER: any = 'DOUBLE_WALKOVER';
export const IN_PROGRESS: any = 'IN_PROGRESS';
export const INCOMPLETE: any = 'INCOMPLETE';
export const NOT_PLAYED: any = 'NOT_PLAYED';
export const RETIRED: any = 'RETIRED';
export const SUSPENDED: any = 'SUSPENDED';
export const TO_BE_PLAYED: any = 'TO_BE_PLAYED';
export const WALKOVER: any = 'WALKOVER';

export const recoveryTimeRequiredMatchUpStatuses = [
  AWAITING_RESULT,
  COMPLETED,
  DEFAULTED,
  IN_PROGRESS,
  INCOMPLETE,
  RETIRED,
  SUSPENDED,
];

export const particicipantsRequiredMatchUpStatuses = [
  AWAITING_RESULT,
  COMPLETED,
  DEFAULTED,
  DOUBLE_WALKOVER,
  DOUBLE_DEFAULT,
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
  DOUBLE_DEFAULT,
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
  DOUBLE_WALKOVER, // directing because of a produced WALKOVER
  DOUBLE_DEFAULT, // directing because of a produced WALKOVER
  COMPLETED,
  DEFAULTED,
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
  DOUBLE_DEFAULT,
  RETIRED,
  WALKOVER,
];

export const activeMatchUpStatuses = [
  ABANDONED,
  COMPLETED,
  DEFAULTED,
  DOUBLE_WALKOVER,
  DOUBLE_DEFAULT,
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
  DOUBLE_DEFAULT,
  IN_PROGRESS,
  INCOMPLETE,
  NOT_PLAYED,
  RETIRED,
  SUSPENDED,
  TO_BE_PLAYED,
  WALKOVER,
};
