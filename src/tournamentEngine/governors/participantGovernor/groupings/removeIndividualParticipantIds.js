import { addNotice } from '../../../../global/globalState';

import {
  INVALID_PARTICIPANT_TYPE,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
  NO_PARTICIPANT_REMOVED,
  PARTICIPANT_NOT_FOUND,
} from '../../../../constants/errorConditionConstants';
import { GROUP, TEAM } from '../../../../constants/participantTypes';
import { COMPETITOR } from '../../../../constants/participantRoles';
import { SUCCESS } from '../../../../constants/resultConstants';
import { MODIFY_PARTICIPANTS } from '../../../../constants/topicConstants';

/**
 *
 * @param {object} tournamentRecord - passed in automatically by tournamentEngine
 * @param {string} groupingParticipantId - grouping participant from which participantIds are to be removed
 * @param {string[]} individualParticipantIds - individual participantIds to be removed to grouping participant
 *
 */
export function removeIndividualParticipantIds({
  tournamentRecord,
  groupingParticipantId,
  individualParticipantIds,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!groupingParticipantId || !individualParticipantIds)
    return { error: MISSING_VALUE };

  const tournamentParticipants = tournamentRecord.participants || [];

  const groupingParticipant = tournamentParticipants.find((participant) => {
    return participant.participantId === groupingParticipantId;
  });
  if (!groupingParticipant) return { error: PARTICIPANT_NOT_FOUND };

  if (![TEAM, GROUP].includes(groupingParticipant.participantType)) {
    return {
      error: INVALID_PARTICIPANT_TYPE,
      participantType: groupingParticipant.participantType,
    };
  }

  const { removed, error } = removeParticipantIdsFromGroupingParticipant({
    groupingParticipant,
    individualParticipantIds,
  });

  if (removed) {
    addNotice({
      topic: MODIFY_PARTICIPANTS,
      payload: { participants: [groupingParticipant] },
    });
  }

  if (error) return { error };

  return Object.assign({}, SUCCESS, { removed });
}

// TODO: consider situations where it would be invalid to remove an individualParticipantId
// for instance in a team competition where an individual is part of a matchUp within a tieMatchUp
function removeParticipantIdsFromGroupingParticipant({
  groupingParticipant,
  individualParticipantIds = [],
}) {
  let removed = 0;
  let notRemoved = [];
  if (!groupingParticipant) return { removed };
  if (!groupingParticipant.individualParticipantIds)
    groupingParticipant.individualParticipantIds = [];

  groupingParticipant.individualParticipantIds = groupingParticipant.individualParticipantIds.filter(
    (participantId) => {
      const removeParticipant = individualParticipantIds?.includes(
        participantId
      );
      if (removeParticipant) removed++;
      return !removeParticipant;
    }
  );
  if (notRemoved.length)
    return { error: 'Participants not removed', notRemoved };

  return { groupingParticipant, removed };
}

export function removeParticipantIdsFromAllTeams({
  groupingType = TEAM,
  tournamentRecord,
  individualParticipantIds = [],
}) {
  const tournamentParticipants = tournamentRecord.participants || [];

  let modifications = 0;
  tournamentParticipants
    .filter((participant) => {
      return (
        (participant.participantRole === COMPETITOR ||
          !participant.participantRole) &&
        participant.participantType === groupingType
      );
    })
    .forEach((team) => {
      const { removed } = removeParticipantIdsFromGroupingParticipant({
        groupingParticipant: team,
        individualParticipantIds,
      });
      if (removed) modifications++;
    });

  return modifications ? SUCCESS : { error: NO_PARTICIPANT_REMOVED };
}
