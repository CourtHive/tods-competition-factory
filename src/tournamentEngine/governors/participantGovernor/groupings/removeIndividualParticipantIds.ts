import { scoreHasValue } from '../../../../matchUpEngine/governors/queryGovernor/scoreHasValue';
import { addExtension } from '../../../../global/functions/producers/addExtension';
import { getParticipants } from '../../../getters/participants/getParticipants';
import { addEventEntries } from '../../eventGovernor/entries/addEventEntries';
import { decorateResult } from '../../../../global/functions/decorateResult';
import { findExtension } from '../../queryGovernor/extensionQueries';
import { allDrawMatchUps } from '../../../getters/matchUpsGetter/matchUpsGetter';
import { addNotice } from '../../../../global/state/globalState';
import {
  addDrawNotice,
  modifyMatchUpNotice,
} from '../../../../drawEngine/notifications/drawNotifications';

import { MappedMatchUps } from '../../../../drawEngine/getters/getMatchUps/getMatchUpsMap';
import { MODIFY_PARTICIPANTS } from '../../../../constants/topicConstants';
import { GROUP, TEAM } from '../../../../constants/participantConstants';
import { UNGROUPED } from '../../../../constants/entryStatusConstants';
import { LINEUPS } from '../../../../constants/extensionConstants';
import { HydratedParticipant } from '../../../../types/hydrated';
import { SUCCESS } from '../../../../constants/resultConstants';
import {
  CANNOT_REMOVE_PARTICIPANTS,
  ErrorType,
  INVALID_PARTICIPANT_TYPE,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
  NO_PARTICIPANT_REMOVED,
  PARTICIPANT_NOT_FOUND,
} from '../../../../constants/errorConditionConstants';
import {
  Participant,
  ParticipantRoleEnum,
  ParticipantTypeEnum,
  Tournament,
} from '../../../../types/tournamentFromSchema';

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

  const tournamentParticipants = tournamentRecord.participants || [];

  const groupingParticipant: any = tournamentParticipants.find(
    (participant) => {
      return participant.participantId === groupingParticipantId;
    }
  );
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
        const participantIdsToEnter = removed?.filter(
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
    ({ participantId }) => participantId === groupingParticipant.participantId
  );

  const groupingParticipantEventIds = inContextGroupingParticipant?.events?.map(
    ({ eventId }) => eventId
  );

  const updatedIndividualParticipantIds = (
    groupingParticipant.individualParticipantIds || []
  ).filter((participantId) => {
    const targetParticipant = individualParticipantIds?.includes(participantId);
    const scoredParticipantGroupingMatchUps =
      targetParticipant &&
      participants
        ?.find((participant) => participant.participantId === participantId)
        ?.matchUps.filter(({ eventId }) =>
          groupingParticipantEventIds.includes(eventId)
        )
        .map(({ matchUpId }) => mappedMatchUps?.[matchUpId])
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

type RemoveParticipantIdsFromAllTeamsArgs = {
  participantRole?: ParticipantRoleEnum;
  individualParticipantIds?: string[];
  tournamentRecord: Tournament;
  groupingTypes?: string[];
};
export function removeParticipantIdsFromAllTeams({
  participantRole = ParticipantRoleEnum.Competitor,
  individualParticipantIds = [],
  groupingTypes = [ParticipantTypeEnum.Team, ParticipantTypeEnum.Group],
  tournamentRecord,
}: RemoveParticipantIdsFromAllTeamsArgs) {
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
