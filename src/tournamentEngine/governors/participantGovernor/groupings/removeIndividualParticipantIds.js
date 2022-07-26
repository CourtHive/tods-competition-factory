import { addEventEntries } from '../../eventGovernor/entries/addEventEntries';
import { decorateResult } from '../../../../global/functions/decorateResult';
import { addNotice } from '../../../../global/state/globalState';

import { MODIFY_PARTICIPANTS } from '../../../../constants/topicConstants';
import { UNGROUPED } from '../../../../constants/entryStatusConstants';
import { GROUP, TEAM } from '../../../../constants/participantTypes';
import { COMPETITOR } from '../../../../constants/participantRoles';
import { SUCCESS } from '../../../../constants/resultConstants';
import {
  INVALID_PARTICIPANT_TYPE,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
  NO_PARTICIPANT_REMOVED,
  PARTICIPANT_NOT_FOUND,
} from '../../../../constants/errorConditionConstants';

/**
 *
 * @param {object} tournamentRecord - passed in automatically by tournamentEngine
 * @param {string} groupingParticipantId - grouping participant from which participantIds are to be removed
 * @param {string[]} individualParticipantIds - individual participantIds to be removed to grouping participant
 *
 */
export function removeIndividualParticipantIds({
  addIndividualParticipantsToEvents,
  individualParticipantIds,
  groupingParticipantId,
  tournamentRecord,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!groupingParticipantId || !individualParticipantIds)
    return { error: MISSING_VALUE };

  const stack = 'removeIndividualParticipantIds';

  const tournamentParticipants = tournamentRecord.participants || [];

  const groupingParticipant = tournamentParticipants.find((participant) => {
    return participant.participantId === groupingParticipantId;
  });
  if (!groupingParticipant)
    return decorateResult({ result: { error: PARTICIPANT_NOT_FOUND }, stack });

  if (![TEAM, GROUP].includes(groupingParticipant.participantType)) {
    return decorateResult({
      result: {
        participantType: groupingParticipant.participantType,
        error: INVALID_PARTICIPANT_TYPE,
      },
      stack,
    });
  }

  const { removed, error } = removeParticipantIdsFromGroupingParticipant({
    individualParticipantIds,
    groupingParticipant,
  });

  if (addIndividualParticipantsToEvents) {
    for (const event of tournamentRecord.events || []) {
      const enteredIds = (event.entries || [])
        .map(({ participantId }) => participantId)
        .filter(Boolean);

      if (enteredIds.includes(groupingParticipantId)) {
        const participantIdsToEnter = removed.filter(
          (participantId) => !enteredIds.includes(participantId)
        );
        addEventEntries({
          participantIds: participantIdsToEnter,
          entryStatus: UNGROUPED,
          event,
        });
      }
    }
  }

  if (error) return decorateResult({ result: { error }, stack });

  if (removed) {
    addNotice({
      topic: MODIFY_PARTICIPANTS,
      payload: {
        tournamentId: tournamentRecord.tournamentId,
        participants: [groupingParticipant],
      },
    });
  }

  return { ...SUCCESS, removed };
}

// TODO: consider situations where it would be invalid to remove an individualParticipantId
// for instance in a team competition where an individual is part of a matchUp within a tieMatchUp
function removeParticipantIdsFromGroupingParticipant({
  individualParticipantIds = [],
  groupingParticipant,
}) {
  let removed = [];
  let notRemoved = [];
  if (!groupingParticipant) return { removed };
  if (!groupingParticipant.individualParticipantIds)
    groupingParticipant.individualParticipantIds = [];

  groupingParticipant.individualParticipantIds =
    groupingParticipant.individualParticipantIds.filter((participantId) => {
      const removeParticipant =
        individualParticipantIds?.includes(participantId);
      if (removeParticipant) removed.push(participantId);
      return !removeParticipant;
    });
  if (notRemoved.length) return { error: NO_PARTICIPANT_REMOVED, notRemoved };

  return { groupingParticipant, removed };
}

export function removeParticipantIdsFromAllTeams({
  individualParticipantIds = [],
  groupingTypes = [TEAM, GROUP],
  participantRole = COMPETITOR,
  tournamentRecord,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  const tournamentParticipants = tournamentRecord.participants || [];

  let modifications = 0;
  tournamentParticipants
    .filter((participant) => {
      return (
        (participant.participantRole === participantRole ||
          !participant.participantRole) &&
        groupingTypes.includes(participant.participantType)
      );
    })
    .forEach((grouping) => {
      const { removed } = removeParticipantIdsFromGroupingParticipant({
        groupingParticipant: grouping,
        individualParticipantIds,
      });
      if (removed) modifications++;
    });

  return modifications ? SUCCESS : { error: NO_PARTICIPANT_REMOVED };
}
