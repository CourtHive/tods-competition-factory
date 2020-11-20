export const SIGN_IN_STATUS = 'SIGN_IN_STATUS';

enum ParticipantTypeEnum {
  INDIVIDUAL = 'INDIVIDUAL',
  PAIR = 'PAIR',
  TEAM = 'TEAM',
}
export const INDIVIDUAL = ParticipantTypeEnum.INDIVIDUAL;
export const PAIR = ParticipantTypeEnum.PAIR;
export const TEAM = ParticipantTypeEnum.TEAM;

enum SignedInStatusEnum {
  SIGNED_IN = 'SIGNED_IN',
  SIGNED_OUT = 'SIGNED_OUT',
}

export const SIGNED_IN = SignedInStatusEnum.SIGNED_IN;
export const SIGNED_OUT = SignedInStatusEnum.SIGNED_OUT;

export const participantConstants = {
  INDIVIDUAL,
  PAIR,
  TEAM,

  SIGNED_IN,
  SIGNED_OUT,
  SIGN_IN_STATUS,
};
