export const SIGN_IN_STATUS = 'SIGN_IN_STATUS';

export enum ParticipantTypeEnum {
  INDIVIDUAL = 'INDIVIDUAL',
  GROUP = 'GROUP',
  PAIR = 'PAIR',
  TEAM = 'TEAM',
}
export const INDIVIDUAL = ParticipantTypeEnum.INDIVIDUAL;
export const GROUP = ParticipantTypeEnum.GROUP;
export const PAIR = ParticipantTypeEnum.PAIR;
export const TEAM = ParticipantTypeEnum.TEAM;

export enum SignedInStatusEnum {
  SIGNED_IN = 'SIGNED_IN',
  SIGNED_OUT = 'SIGNED_OUT',
}

export const SIGNED_IN = SignedInStatusEnum.SIGNED_IN;
export const SIGNED_OUT = SignedInStatusEnum.SIGNED_OUT;

export const participantTypes = {
  INDIVIDUAL,
  TEAM,
  PAIR,
  GROUP,
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
