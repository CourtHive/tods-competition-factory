import { scoreHasValue } from '../../../../matchUpEngine/governors/queryGovernor/scoreHasValue';
import { addExtension } from '../../../../global/functions/producers/addExtension';
import { getParticipants } from '../../../getters/participants/getParticipants';
import { addEventEntries } from '../../eventGovernor/entries/addEventEntries';
import { decorateResult } from '../../../../global/functions/decorateResult';
import { findExtension } from '../../queryGovernor/extensionQueries';
import { allDrawMatchUps } from '../../../getters/matchUpsGetter';
import { addNotice } from '../../../../global/state/globalState';
import {
  addDrawNotice,
  modifyMatchUpNotice,
} from '../../../../drawEngine/notifications/drawNotifications';

import { MODIFY_PARTICIPANTS } from '../../../../constants/topicConstants';
import { GROUP, TEAM } from '../../../../constants/participantConstants';
import { UNGROUPED } from '../../../../constants/entryStatusConstants';
import { COMPETITOR } from '../../../../constants/participantRoles';
import { LINEUPS } from '../../../../constants/extensionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import {
  CANNOT_REMOVE_PARTICIPANTS,
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
 * @param {boolean} suppressErrors - do not throw an error if an individualParticipant cannot be removed
 *
 */
export function removeIndividualParticipantIds({
  addIndividualParticipantsToEvents,
  individualParticipantIds,
  groupingParticipantId,
  tournamentRecord,
  suppressErrors,
}) {
  const stack = 'removeIndividualParticipantIds';
  if (!tournamentRecord)
    return decorateResult({
      result: { error: MISSING_TOURNAMENT_RECORD },
      stack,
    });
  if (!groupingParticipantId || !individualParticipantIds)
    return decorateResult({ result: { error: MISSING_VALUE }, stack });

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

  const result = removeParticipantIdsFromGroupingParticipant({
    individualParticipantIds,
    groupingParticipant,
    tournamentRecord,
    suppressErrors,
  });
  const { removed, error } = result;

  if (error) return decorateResult({ result, stack });

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
          tournamentRecord,
          event,
        });
      }
    }
  }

  if (removed) {
    addNotice({
      topic: MODIFY_PARTICIPANTS,
      payload: {
        tournamentId: tournamentRecord.tournamentId,
        participants: [groupingParticipant],
      },
    });
  }

  return { ...SUCCESS, ...result };
}

function removeParticipantIdsFromGroupingParticipant({
  individualParticipantIds = [],
  groupingParticipant,
  tournamentRecord,
  suppressErrors,
  mappedMatchUps,
  participants,
}) {
  let removed = [];
  if (!groupingParticipant) return { removed };
  let notRemoved = [];
  let cannotRemove = [];

  if (!participants) {
    ({ participants, mappedMatchUps } = getParticipants({
      withMatchUps: true,
      tournamentRecord,
      withEvents: true,
    }));
  }

  const inContextGroupingParticipant = participants.find(
    ({ participantId }) => participantId === groupingParticipant.participantId
  );

  const groupingParticipantEventIds = inContextGroupingParticipant.events.map(
    ({ eventId }) => eventId
  );

  const updatedIndividualParticipantIds = (
    groupingParticipant.individualParticipantIds || []
  ).filter((participantId) => {
    const targetParticipant = individualParticipantIds?.includes(participantId);
    const scoredParticipantGroupingMatchUps =
      targetParticipant &&
      participants
        .find((participant) => participant.participantId === participantId)
        ?.matchUps.filter(({ eventId }) =>
          groupingParticipantEventIds.includes(eventId)
        )
        .map(({ matchUpId }) => mappedMatchUps[matchUpId])
        .filter(
          ({ winningSide, score }) => winningSide || scoreHasValue({ score })
        );

    const removeParticipant =
      targetParticipant && !scoredParticipantGroupingMatchUps?.length;

    if (targetParticipant && !removeParticipant) {
      cannotRemove.push(participantId);
    }

    if (removeParticipant) {
      removed.push(participantId);

      for (const event of tournamentRecord.events || []) {
        for (const drawDefinition of event.drawDefinitions || []) {
          const { extension } = findExtension({
            element: drawDefinition,
            name: LINEUPS,
          });
          let lineUp = extension?.value[groupingParticipant.participantId];
          if (lineUp) {
            lineUp = lineUp.filter(
              (assignment) => assignment.participantId !== participantId
            );
            addExtension({ element: drawDefinition, extension });
            addDrawNotice({ drawDefinition });
          }

          const matchUps =
            allDrawMatchUps({ drawDefinition, inContext: false }).matchUps ||
            [];

          for (const matchUp of matchUps) {
            const sides = matchUp.sides || [];
            for (const side of sides) {
              const lineUp = side.lineUp || [];
              const containsParticipant = lineUp.find(
                (assignment) => assignment.participantId === participantId
              );
              if (containsParticipant) {
                side.lineUp = side.lineUp.filter(
                  (assignment) => assignment.participantId !== participantId
                );
                modifyMatchUpNotice({
                  tournamentId: tournamentRecord?.tournamentId,
                  drawDefinition,
                  matchUp,
                });
              }
            }
          }
        }
      }
    } else {
      notRemoved.push(participantId);
    }
    return !removeParticipant;
  });

  groupingParticipant.individualParticipantIds =
    updatedIndividualParticipantIds;

  const result = {
    groupingParticipantId: groupingParticipant.participantId,
    cannotRemove,
    notRemoved,
    removed,
  };

  return (
    (cannotRemove.length &&
      !suppressErrors && {
        ...result,
        cannotRemove,
        error: CANNOT_REMOVE_PARTICIPANTS,
      }) ||
    result
  );
}

export function removeParticipantIdsFromAllTeams({
  individualParticipantIds = [],
  groupingTypes = [TEAM, GROUP],
  participantRole = COMPETITOR,
  tournamentRecord,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  const tournamentParticipants = tournamentRecord.participants || [];

  const { participants, mappedMatchUps } = getParticipants({
    withMatchUps: true,
    tournamentRecord,
    withEvents: true,
  });

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
        tournamentRecord,
        mappedMatchUps,
        participants,
      });
      if (removed) modifications++;
    });

  return modifications ? SUCCESS : { error: NO_PARTICIPANT_REMOVED };
}
