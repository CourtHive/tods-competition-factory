import { findTournamentParticipant } from '../../getters/participants/participantGetter';
import { addNotice, getTopics } from '../../../global/globalState';

import {
  MISSING_PARTICIPANT_ID,
  MISSING_TOURNAMENT_RECORD,
  PARTICIPANT_NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { MODIFY_PARTICIPANTS } from '../../../constants/topicConstants';

export function modifyParticipantOtherName({
  tournamentRecord,
  participantId,
  participantOtherName,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };

  const { participant } = findTournamentParticipant({
    tournamentRecord,
    participantId,
  });
  if (!participant) return { error: PARTICIPANT_NOT_FOUND };

  participant.participantOtherName = participantOtherName;

  const { topics } = getTopics();
  if (topics.includes(MODIFY_PARTICIPANTS)) {
    addNotice({
      topic: MODIFY_PARTICIPANTS,
      payload: { participants: [participant] },
    });
  }

  return SUCCESS;
}
