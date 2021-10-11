import { getTournamentParticipants } from '../../getters/participants/getTournamentParticipants';
import { removeParticipantIdsFromAllTeams } from './groupings/removeIndividualParticipantIds';
import { allTournamentMatchUps } from '../../getters/matchUpsGetter';
import { addNotice } from '../../../global/globalState';
import { intersection } from '../../../utilities';

import { DELETE_PARTICIPANTS } from '../../../constants/topicConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { DOUBLES } from '../../../constants/matchUpTypes';
import {
  CANNOT_REMOVE_PARTICIPANTS,
  MISSING_PARTICIPANT_IDS,
  MISSING_TOURNAMENT_RECORD,
  PARTICIPANT_ASSIGNED_DRAW_POSITION,
} from '../../../constants/errorConditionConstants';

export function deleteParticipants({
  teamDrawIds = [],
  tournamentRecord,
  participantIds,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!participantIds?.length) return { error: MISSING_PARTICIPANT_IDS };

  const participantsCount = tournamentRecord.participants?.length || 0;
  if (!participantsCount) return SUCCESS;

  const { tournamentParticipants } = getTournamentParticipants({
    participantFilters: { participantIds },
    withStatistics: true,
    tournamentRecord,
  });

  const getPlacedParticipantIds = () => {
    const { matchUps } = allTournamentMatchUps({
      tournamentRecord,
      matchUpFilters: { drawIds: teamDrawIds, matchUpTypes: [DOUBLES] },
    });
    const placedParticipantIds = matchUps
      .map(({ sides }) => sides.map(({ participantId }) => participantId))
      .flat()
      .filter(Boolean);
    return intersection(placedParticipantIds, participantIds);
  };

  // for team draws it is necessary to check matchUps for pair participantIds "discovered" in collectionAssignments
  const placedParticipantIds = teamDrawIds.length && getPlacedParticipantIds();

  const participantsInDraws = tournamentParticipants.filter(
    (participant) =>
      participant.draws?.filter(
        ({ drawId }) => !teamDrawIds.length || !teamDrawIds.includes(drawId)
      ).length
  );
  if (placedParticipantIds.length || participantsInDraws.length)
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
