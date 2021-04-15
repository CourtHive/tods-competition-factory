import { removeParticipantIdsFromAllTeams } from './groupings/removeIndividualParticipantIds';
import { addNotice } from '../../../global/globalState';

import {
  MISSING_PARTICIPANT_IDS,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { DELETE_PARTICIPANTS } from '../../../constants/topicConstants';

// TODO: don't remove participants who are active in draws
// If not active in draws, remove participantIds from all entries

export function deleteParticipants({ tournamentRecord, participantIds }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!participantIds?.length) return { error: MISSING_PARTICIPANT_IDS };
  if (!tournamentRecord.participants) tournamentRecord.participants = [];
  const participantsCount = tournamentRecord.participants?.length;
  if (!participantsCount) return { error: 'Tournament has no participants' };

  tournamentRecord.participants = tournamentRecord.participants.filter(
    (participant) => !participantIds.includes(participant.participantId)
  );
  const participantsRemovedCount =
    participantsCount - tournamentRecord.participants.length;

  removeParticipantIdsFromAllTeams({
    tournamentRecord,
    individualParticipantIds: participantIds,
  });

  if (participantsRemovedCount) {
    addNotice({
      topic: DELETE_PARTICIPANTS,
      payload: { participantIds },
    });
  }

  return participantsRemovedCount
    ? SUCCESS
    : { error: 'Not all participants deleted' };
}
