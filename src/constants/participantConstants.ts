import { ParticipantTypeEnum } from '../types/tournamentFromSchema';

export const SIGN_IN_STATUS = 'SIGN_IN_STATUS';

export const INDIVIDUAL = ParticipantTypeEnum.Individual;
export const GROUP = ParticipantTypeEnum.Group;
export const PAIR = ParticipantTypeEnum.Pair;
export const TEAM = ParticipantTypeEnum.Team;
export const TEAM_PARTICIPANT = ParticipantTypeEnum.Team;

export enum SignedInStatusEnum {
  SIGNED_IN = 'SIGNED_IN',
  SIGNED_OUT = 'SIGNED_OUT',
}

export const SIGNED_IN = SignedInStatusEnum.SIGNED_IN;
export const SIGNED_OUT = SignedInStatusEnum.SIGNED_OUT;

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
