import { removeParticipantIdsFromAllTeams } from './groupings/removeIndividualParticipantIds';
import { addNotice } from '../../../global/globalState';

import {
  CANNOT_REMOVE_PARTICIPANTS,
  MISSING_PARTICIPANT_IDS,
  MISSING_TOURNAMENT_RECORD,
  NO_PARTICIPANTS,
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
  if (!participantsCount) return { error: NO_PARTICIPANTS };

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
    : { error: CANNOT_REMOVE_PARTICIPANTS };
}
