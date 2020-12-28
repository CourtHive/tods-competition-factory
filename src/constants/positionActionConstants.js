export const ALTERNATE_PARTICIPANT_METHOD = 'alternateDrawPositionAssignment';
export const WITHDRAW_PARTICIPANT_METHOD = 'withdrawParticipantAtDrawPosition';
export const REMOVE_PARTICIPANT_METHOD = 'removeDrawPositionAssignment';
export const SWAP_PARTICIPANT_METHOD = 'swapDrawPositionAssignments';
export const ASSIGN_PARTICIPANT_METHOD = 'assignDrawPosition';

export const ALTERNATE_PARTICIPANT = 'ALTERNATE';
export const WITHDRAW_PARTICIPANT = 'WITHDRAW';
export const REMOVE_PARTICIPANT = 'REMOVE';
export const ASSIGN_PARTICIPANT = 'ASSIGN';
export const SWAP_PARTICIPANTS = 'SWAP';
export const ADD_NICKNAME = 'NICKNAME';
export const ADD_PENALTY = 'PENALTY';

export const positionActionConstants = {
  ALTERNATE_PARTICIPANT,
  WITHDRAW_PARTICIPANT,
  ASSIGN_PARTICIPANT,
  REMOVE_PARTICIPANT,
  SWAP_PARTICIPANTS,
  ADD_NICKNAME,
  ADD_PENALTY,
};

export default positionActionConstants;
