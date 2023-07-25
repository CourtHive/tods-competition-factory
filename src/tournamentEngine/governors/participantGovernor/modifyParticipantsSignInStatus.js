import { addParticipantTimeItem } from '../tournamentGovernor/addTimeItem';
import { addNotice, getTopics } from '../../../global/state/globalState';
import { getParticipantId } from '../../../global/functions/extractors';

import { MODIFY_PARTICIPANTS } from '../../../constants/topicConstants';
import { SUCCESS } from '../../../constants/resultConstants';
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

  const allParticipantIds = participants.map(getParticipantId);
  const invalidParticipantIds = participantIds.filter(
    (participantId) => !allParticipantIds.includes(participantId)
  );
  if (invalidParticipantIds.length)
    return { error: INVALID_VALUES, context: { invalidParticipantIds } };

  const modifiedParticipants = [];
  const createdAt = new Date().toISOString();
  for (const participant of participants) {
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
      if (result.error) return result;
      modifiedParticipants.push(participant);
    }
  }

  const { topics } = getTopics();
  if (modifiedParticipants.length && topics.includes(MODIFY_PARTICIPANTS)) {
    addNotice({
      topic: MODIFY_PARTICIPANTS,
      payload: {
        tournamentId: tournamentRecord.tournamentId,
        participants: modifiedParticipants,
      },
    });
  }

  return { ...SUCCESS };
}
