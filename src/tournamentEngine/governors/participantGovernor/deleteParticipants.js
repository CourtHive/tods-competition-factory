import { getTournamentParticipants } from '../../getters/participants/getTournamentParticipants';
import { removeParticipantIdsFromAllTeams } from './groupings/removeIndividualParticipantIds';
import { allTournamentMatchUps } from '../../getters/matchUpsGetter/matchUpsGetter';
import { removeEventEntries } from '../eventGovernor/entries/removeEventEntries';
import { addEventEntries } from '../eventGovernor/entries/addEventEntries';
import { addNotice } from '../../../global/state/globalState';
import { intersection } from '../../../utilities';

import { DELETE_PARTICIPANTS } from '../../../constants/topicConstants';
import { UNGROUPED } from '../../../constants/entryStatusConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { DOUBLES } from '../../../constants/matchUpTypes';
import { TEAM } from '../../../constants/eventConstants';
import {
  CANNOT_REMOVE_PARTICIPANTS,
  MISSING_PARTICIPANT_IDS,
  MISSING_TOURNAMENT_RECORD,
  EXISTING_PARTICIPANT_DRAW_POSITION_ASSIGNMENT,
} from '../../../constants/errorConditionConstants';
import {
  PAIR,
  TEAM as participantTeam,
} from '../../../constants/participantConstants';

export function deleteParticipants({
  addIndividualParticipantsToEvents,
  tournamentRecord,
  participantIds,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!participantIds?.length) return { error: MISSING_PARTICIPANT_IDS };

  const participantsCount = tournamentRecord.participants?.length || 0;
  if (!participantsCount) return { ...SUCCESS };

  const teamDrawIds = (tournamentRecord.events || [])
    ?.filter(({ eventType }) => eventType === TEAM)
    .map((event) => event?.drawDefinitions?.map(({ drawId }) => drawId))
    .flat(Infinity);

  // cannot use getParticipants() because event objects don't have drawIds array
  const { tournamentParticipants } = getTournamentParticipants({
    participantFilters: { participantIds },
    tournamentRecord,
    withDraws: true,
  });

  const getPlacedPairParticipantIds = () => {
    const { matchUps } = allTournamentMatchUps({
      matchUpFilters: { drawIds: teamDrawIds, matchUpTypes: [DOUBLES] },
      tournamentRecord,
    });
    const placedPairParticipantIds = matchUps
      .map(({ sides }) => sides.map(({ participantId }) => participantId))
      .flat()
      .filter(Boolean);
    return intersection(placedPairParticipantIds, participantIds);
  };

  // for team draws it is necessary to check matchUps for pair participantIds "discovered" in collectionAssignments
  const placedPairParticipantIds =
    teamDrawIds?.length && getPlacedPairParticipantIds();

  const participantsInDraws = tournamentParticipants.filter(
    (participant) =>
      participant.draws?.filter(
        (drawInfo) =>
          (!teamDrawIds?.length || !teamDrawIds?.includes(drawInfo.drawId)) &&
          drawInfo.positionAssignments
      ).length
  );

  if (placedPairParticipantIds?.length || participantsInDraws.length) {
    return { error: EXISTING_PARTICIPANT_DRAW_POSITION_ASSIGNMENT };
  }

  const eventParticipantIdsRemoved = {};
  const mappedIndividualParticipantIdsToAdd = {};

  // If not active in draws, remove participantIds from all entries
  for (const event of tournamentRecord.events || []) {
    const result = removeEventEntries({
      tournamentParticipants,
      tournamentRecord,
      participantIds,
      event,
    });
    if (result.error) return result;
    eventParticipantIdsRemoved[event.eventId] = result.participantIdsRemoved;
  }

  tournamentRecord.participants = tournamentRecord.participants.filter(
    (participant) => {
      const participantToRemove =
        participantIds.includes(participant.participantId) ||
        (participant.participantType === PAIR &&
          participant.individualParticipantIds.some((id) =>
            participantIds.includes(id)
          ));

      // remove deleted individualParticipantIds from TEAMs
      if (
        !participantToRemove &&
        participant.participantType === TEAM &&
        participant.individualParticipantIds.some((id) =>
          participantIds.includes(id)
        )
      ) {
        participant.individualParticipantIds =
          participant.individualParticipantIds.filter(
            (id) => !participantIds.includes(id)
          );
      }

      if (
        participantToRemove &&
        addIndividualParticipantsToEvents &&
        [PAIR, participantTeam].includes(participant.participantType)
      ) {
        for (const individualParticipantId of participant.individualParticipantIds ||
          []) {
          if (!participantIds.includes(individualParticipantId)) {
            if (!mappedIndividualParticipantIdsToAdd[participant.participantId])
              mappedIndividualParticipantIdsToAdd[participant.participantId] =
                [];
            mappedIndividualParticipantIdsToAdd[participant.participantId].push(
              individualParticipantId
            );
          }
        }
      }
      return !participantToRemove;
    }
  );

  const participantsRemovedCount =
    participantsCount - tournamentRecord.participants.length;

  removeParticipantIdsFromAllTeams({
    individualParticipantIds: participantIds,
    tournamentRecord,
  });

  if (addIndividualParticipantsToEvents) {
    for (const event of tournamentRecord.events || []) {
      const groupParticipantIds = eventParticipantIdsRemoved[event.eventId];
      const individualParticipantIds = groupParticipantIds
        .map(
          (participantId) =>
            mappedIndividualParticipantIdsToAdd[participantId] || []
        )
        .flat();
      addEventEntries({
        participantIds: individualParticipantIds,
        entryStatus: UNGROUPED,
        tournamentRecord,
        event,
      });
    }
  }

  if (participantsRemovedCount) {
    addNotice({
      payload: { participantIds, tournamentId: tournamentRecord.tournamentId },
      topic: DELETE_PARTICIPANTS,
    });
  }

  return participantsRemovedCount
    ? { ...SUCCESS, participantsRemovedCount }
    : { error: CANNOT_REMOVE_PARTICIPANTS };
}
