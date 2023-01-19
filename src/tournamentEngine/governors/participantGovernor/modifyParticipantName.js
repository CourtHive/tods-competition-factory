import { findTournamentParticipant } from '../../getters/participants/participantGetter';
import { addNotice, getTopics } from '../../../global/state/globalState';

import { MODIFY_PARTICIPANTS } from '../../../constants/topicConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_PARTICIPANT_ID,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
  PARTICIPANT_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

export function modifyParticipantName({
  tournamentRecord,
  participantName,
  participantId,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };

  if (!participantName)
    return { error: MISSING_VALUE, info: 'Missing participantName' };

  const { participant } = findTournamentParticipant({
    tournamentRecord,
    participantId,
  });
  if (!participant) return { error: PARTICIPANT_NOT_FOUND };

  participant.participantName = participantName;

  const { topics } = getTopics();
  if (topics.includes(MODIFY_PARTICIPANTS)) {
    addNotice({
      topic: MODIFY_PARTICIPANTS,
      payload: {
        tournamentId: tournamentRecord.tournamentId,
        participants: [participant],
      },
    });
  }

  return { ...SUCCESS };
}
