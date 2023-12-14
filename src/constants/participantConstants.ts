export type SignedInStatusUnion = typeof SIGNED_IN | typeof SIGNED_OUT;
export const SIGN_IN_STATUS = 'SIGN_IN_STATUS';
export const SIGNED_OUT = 'SIGNED_OUT';
export const SIGNED_IN = 'SIGNED_IN';

export const TEAM_PARTICIPANT = 'TEAM';
export const INDIVIDUAL = 'INDIVIDUAL';
export const GROUP = 'GROUP';
export const PAIR = 'PAIR';
export const TEAM = 'TEAM';

export const participantTypes = {
  TEAM_PARTICIPANT,
  INDIVIDUAL,
  GROUP,
  TEAM,
  PAIR,
};

export const participantConstants = {
  INDIVIDUAL,
  GROUP,
  PAIR,
  TEAM,

  SIGN_IN_STATUS,
  SIGNED_OUT,
  SIGNED_IN,
};
