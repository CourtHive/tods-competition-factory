import {
  INVALID_VALUES,
  MISSING_PARTICIPANTS,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';
import {
  SIGNED_IN,
  SIGNED_OUT,
  SIGN_IN_STATUS,
} from '../../../constants/participantConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { addParticipantTimeItem } from '../tournamentGovernor/addTimeItem';

export function modifyParticipantsSignInStatus({
  tournamentRecord,
  participantIds,
  signInState,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!Array.isArray(participantIds)) return { error: MISSING_VALUE };

  const validSignInState = [SIGNED_IN, SIGNED_OUT].includes(signInState);
  if (!validSignInState) return { error: INVALID_VALUES, signInState };

  const participants = tournamentRecord.participants || [];
  if (!participants.length) return { error: MISSING_PARTICIPANTS };

  const errors = [];
  const createdAt = new Date().toISOString();
  participants.forEach((participant) => {
    const { participantId } = participant;
    if (participantIds.includes(participantId)) {
      const timeItem = {
        itemType: SIGN_IN_STATUS,
        itemValue: signInState,
        createdAt,
      };
      const result = addParticipantTimeItem({
        tournamentRecord,
        duplicateValues: false,
        participantId,
        timeItem,
      });
      if (result.error) errors.push(result.error);
    }
  });

  return errors.length ? { error: errors } : SUCCESS;
}
