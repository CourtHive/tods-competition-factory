import { addDrawNotice, modifyMatchUpNotice } from '@Mutate/notifications/drawNotifications';
import { checkScoreHasValue } from '@Query/matchUp/checkScoreHasValue';
import { getParticipants } from '@Query/participants/getParticipants';
import { allDrawMatchUps } from '@Query/matchUps/getAllDrawMatchUps';
import { addEventEntries } from '@Mutate/entries/addEventEntries';
import { decorateResult } from '@Functions/global/decorateResult';
import { addExtension } from '@Mutate/extensions/addExtension';
import { addNotice } from '@Global/state/globalState';
import { findExtension } from '@Acquire/findExtension';

// constants and types
import { Participant, ParticipantRoleUnion, Tournament } from '../../types/tournamentTypes';
import { GROUP, TEAM, TEAM_PARTICIPANT } from '@Constants/participantConstants';
import { MODIFY_PARTICIPANTS } from '@Constants/topicConstants';
import { UNGROUPED } from '@Constants/entryStatusConstants';
import { COMPETITOR } from '@Constants/participantRoles';
import { LINEUPS } from '@Constants/extensionConstants';
import { HydratedParticipant } from '../../types/hydrated';
import { MappedMatchUps } from '../../types/factoryTypes';
import { SUCCESS } from '@Constants/resultConstants';
import {
  CANNOT_REMOVE_PARTICIPANTS,
  ErrorType,
  INVALID_PARTICIPANT_TYPE,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
  NO_PARTICIPANT_REMOVED,
  PARTICIPANT_NOT_FOUND,
} from '@Constants/errorConditionConstants';

type RemoveIndividualParticipantIdsArgs = {
  addIndividualParticipantsToEvents?: boolean;
  individualParticipantIds: string[];
  groupingParticipantId: string;
  tournamentRecord: Tournament;
  suppressErrors?: boolean;
};
export function removeIndividualParticipantIds({
  addIndividualParticipantsToEvents,
  individualParticipantIds,
  groupingParticipantId,
  tournamentRecord,
  suppressErrors,
}: RemoveIndividualParticipantIdsArgs) {
  const stack = 'removeIndividualParticipantIds';
  if (!tournamentRecord)
    return decorateResult({
      result: { error: MISSING_TOURNAMENT_RECORD },
      stack,
    });
  if (!groupingParticipantId || !individualParticipantIds)
    return decorateResult({ result: { error: MISSING_VALUE }, stack });

  const tournamentParticipants = tournamentRecord.participants ?? [];

  const groupingParticipant: any = tournamentParticipants.find((participant) => {
    return participant.participantId === groupingParticipantId;
  });
  if (!groupingParticipant) return decorateResult({ result: { error: PARTICIPANT_NOT_FOUND }, stack });

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
    for (const event of tournamentRecord.events ?? []) {
      const enteredIds = (event.entries ?? []).map(({ participantId }) => participantId).filter(Boolean);

      if (enteredIds.includes(groupingParticipantId)) {
        const participantIdsToEnter = removed?.filter((participantId) => !enteredIds.includes(participantId));
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

type RemoveFromGroupingParticipantArgs = {
  participants?: HydratedParticipant[];
  individualParticipantIds?: string[];
  groupingParticipant: Participant;
  mappedMatchUps?: MappedMatchUps;
  tournamentRecord: Tournament;
  suppressErrors?: boolean;
};
function removeParticipantIdsFromGroupingParticipant({
  individualParticipantIds = [],
  groupingParticipant,
  tournamentRecord,
  suppressErrors,
  mappedMatchUps,
  participants,
}: RemoveFromGroupingParticipantArgs): {
  groupingParticipantId?: string;
  cannotRemove?: string[];
  notRemoved?: string[];
  removed?: string[];
  error?: ErrorType;
} {
  const removed: string[] = [];
  if (!groupingParticipant) return { removed };
  const notRemoved: string[] = [];
  const cannotRemove: string[] = [];

  if (!participants) {
    ({ participants, mappedMatchUps } = getParticipants({
      withMatchUps: true,
      tournamentRecord,
      withEvents: true,
    }));
  }

  const inContextGroupingParticipant: any = participants?.find(
    ({ participantId }) => participantId === groupingParticipant.participantId,
  );

  const groupingParticipantEventIds = inContextGroupingParticipant?.events?.map(({ eventId }) => eventId);

  const updatedIndividualParticipantIds = (groupingParticipant.individualParticipantIds ?? []).filter(
    (participantId) => {
      const targetParticipant = individualParticipantIds?.includes(participantId);
      const scoredParticipantGroupingMatchUps =
        targetParticipant &&
        participants
          ?.find((participant) => participant.participantId === participantId)
          ?.matchUps.filter(({ eventId }) => groupingParticipantEventIds.includes(eventId))
          .map(({ matchUpId }) => mappedMatchUps?.[matchUpId])
          .filter(({ winningSide, score }) => winningSide || checkScoreHasValue({ score }));

      const removeParticipant = targetParticipant && !scoredParticipantGroupingMatchUps?.length;

      if (targetParticipant && !removeParticipant) {
        cannotRemove.push(participantId);
      }

      if (removeParticipant) {
        removed.push(participantId);

        for (const event of tournamentRecord.events ?? []) {
          for (const drawDefinition of event.drawDefinitions ?? []) {
            const { extension } = findExtension({
              element: drawDefinition,
              name: LINEUPS,
            });
            const lineUp = extension?.value[groupingParticipant.participantId];
            if (extension && lineUp) {
              extension.value[groupingParticipant.participantId] = lineUp.filter(
                (assignment) => assignment.participantId !== participantId,
              );
              addExtension({ element: drawDefinition, extension });
              addDrawNotice({ drawDefinition });
            }

            const matchUps = allDrawMatchUps({ drawDefinition, inContext: false }).matchUps ?? [];

            for (const matchUp of matchUps) {
              const sides = matchUp.sides ?? [];
              for (const side of sides) {
                const lineUp = side.lineUp ?? [];
                const containsParticipant = lineUp.find((assignment) => assignment.participantId === participantId);
                if (containsParticipant) {
                  side.lineUp = lineUp.filter((assignment) => assignment.participantId !== participantId);
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
    },
  );

  groupingParticipant.individualParticipantIds = updatedIndividualParticipantIds;

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

type RemoveParticipantIdsFromAllTeamsArgs = {
  participantRole?: ParticipantRoleUnion;
  individualParticipantIds?: string[];
  tournamentRecord: Tournament;
  groupingTypes?: string[];
};
export function removeParticipantIdsFromAllTeams({
  participantRole = COMPETITOR,
  individualParticipantIds = [],
  groupingTypes = [TEAM_PARTICIPANT, GROUP],
  tournamentRecord,
}: RemoveParticipantIdsFromAllTeamsArgs) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  const tournamentParticipants = tournamentRecord.participants ?? [];

  const { participants, mappedMatchUps } = getParticipants({
    withMatchUps: true,
    tournamentRecord,
    withEvents: true,
  });

  let modifications = 0;
  tournamentParticipants
    .filter((participant) => {
      return (
        (participant.participantRole === participantRole || !participant.participantRole) &&
        participant.participantType &&
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
