import { getTournamentParticipants } from '../../getters/participants/getTournamentParticipants';
import { removeParticipantIdsFromAllTeams } from './groupings/removeIndividualParticipantIds';
import { addNotice } from '../../../global/globalState';

import {
  CANNOT_REMOVE_PARTICIPANTS,
  MISSING_PARTICIPANT_IDS,
  MISSING_TOURNAMENT_RECORD,
  PARTICIPANT_ASSIGNED_DRAW_POSITION,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { DELETE_PARTICIPANTS } from '../../../constants/topicConstants';

export function deleteParticipants({ tournamentRecord, participantIds }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!participantIds?.length) return { error: MISSING_PARTICIPANT_IDS };
  const participantsCount = tournamentRecord.participants?.length || 0;

  if (!participantsCount) return SUCCESS;

  const { tournamentParticipants } = getTournamentParticipants({
    participantFilters: { participantIds },
    withStatistics: true,
    tournamentRecord,
  });

  const participantsInDraws = tournamentParticipants.filter(
    (participant) => participant.draws?.length
  );
  if (participantsInDraws.length)
    return { error: PARTICIPANT_ASSIGNED_DRAW_POSITION };

  // If not active in draws, remove participantIds from all entries

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
