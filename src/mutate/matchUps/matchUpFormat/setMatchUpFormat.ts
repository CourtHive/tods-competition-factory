import { includesMatchUpEventType } from '@Helpers/matchUpEventTypes/includesMatchUpEventType';
import { modifyDrawNotice, modifyMatchUpNotice } from '@Mutate/notifications/drawNotifications';
import { getAllStructureMatchUps } from '@Query/matchUps/getAllStructureMatchUps';
import { isValidMatchUpFormat } from '@Validators/isValidMatchUpFormat';
import { setMatchUpMatchUpFormat } from './setMatchUpMatchUpFormat';
import { decorateResult } from '@Functions/global/decorateResult';
import { getMatchUpId } from '@Functions/global/extractors';

// constants and types
import { DrawDefinition, Event, Tournament } from '@Types/tournamentTypes';
import { DOUBLES, SINGLES, TEAM } from '@Constants/eventConstants';
import { TO_BE_PLAYED } from '@Constants/matchUpStatusConstants';
import { SUCCESS } from '@Constants/resultConstants';
import { HydratedMatchUp } from '@Types/hydrated';
import {
  INVALID_EVENT_TYPE,
  INVALID_VALUES,
  MISSING_DRAW_DEFINITION,
  MISSING_MATCHUP_FORMAT,
  MISSING_TOURNAMENT_RECORD,
  NO_MODIFICATIONS_APPLIED,
  UNRECOGNIZED_MATCHUP_FORMAT,
} from '@Constants/errorConditionConstants';

// external use; set matchUpFormat for a events, draws, structures or matchUp

type SetMatchUpStatusArgs = {
  tournamentRecord?: Tournament;
  drawDefinition?: DrawDefinition;
  scheduledDates?: string[];
  stageSequences?: number[];
  structureIds?: string[];
  matchUpFormat: string;
  structureId?: string;
  eventIds?: string[];
  eventType?: string;
  matchUpId?: string;
  drawIds?: string[];
  stages?: string[];
  eventId?: string;
  drawId?: string;
  force?: boolean;
  event?: Event;
};

export function setMatchUpFormat(params: SetMatchUpStatusArgs) {
  const stack = 'setMatchUpFormat';

  const {
    tournamentRecord,
    drawDefinition,
    scheduledDates,
    stageSequences,
    matchUpFormat,
    structureId,
    eventType, // only SINGLES or DOUBLES
    matchUpId,
    eventId,
    stages,
    drawId,
    event,
    force, // strip matchUpFormat from scoped matchUps which have not been scored
  } = params;

  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!matchUpFormat) return { error: MISSING_MATCHUP_FORMAT };
  if (matchUpFormat && !isValidMatchUpFormat({ matchUpFormat }))
    return decorateResult({
      result: { error: UNRECOGNIZED_MATCHUP_FORMAT, matchUpFormat },
      stack,
    });
  if (scheduledDates && !Array.isArray(scheduledDates))
    return decorateResult({
      result: { error: INVALID_VALUES, scheduledDates },
      stack,
    });
  if (eventType && !includesMatchUpEventType([SINGLES, DOUBLES], eventType))
    return decorateResult({ result: { error: INVALID_EVENT_TYPE }, stack });

  let modificationsCount = 0;
  const structureIds: string[] = params.structureIds || (structureId && [structureId].filter(Boolean)) || [];
  const eventIds = params.eventIds || (eventId && [eventId].filter(Boolean)) || [];
  const drawIds = params.drawIds || (drawId && [drawId].filter(Boolean)) || [];

  if ((structureId || structureIds?.length) && !drawDefinition) {
    return decorateResult({
      result: { error: MISSING_DRAW_DEFINITION },
      stack,
    });
  }

  if (drawId && matchUpId && drawDefinition) {
    const result = setMatchUpMatchUpFormat({
      tournamentRecord,
      drawDefinition,
      matchUpFormat,
      structureIds,
      structureId,
      matchUpId,
    });
    if (result.error) return result;
    modificationsCount += 1;
  }

  const processStructures = (drawDefinition) => {
    const modifiedStructureIds: string[] = [];

    for (const structure of drawDefinition.structures || []) {
      if (
        (Array.isArray(stages) && !stages.includes(structure.stage)) ||
        (Array.isArray(stageSequences) && !stageSequences.includes(structure.stageSequence)) ||
        (structureIds?.length && !structureIds.includes(structure.structureId))
      )
        continue;

      if (structureIds?.length && structure.matchUpFormat !== matchUpFormat) {
        structure.matchUpFormat = matchUpFormat;
        modifiedStructureIds.push(structure.structureId);
        modificationsCount += 1;
      }

      const matchUps: HydratedMatchUp[] =
        (force || scheduledDates) &&
        getAllStructureMatchUps({
          matchUpFilters: { matchUpStatuses: [TO_BE_PLAYED] },
          structure,
        }).matchUps;

      const inContextMatchUps =
        scheduledDates &&
        getAllStructureMatchUps({
          matchUpFilters: { matchUpStatuses: [TO_BE_PLAYED] },
          contextFilters: { scheduledDates },
          afterRecoveryTimes: false,
          inContext: true,
          structure,
        }).matchUps;

      if (matchUps?.length) {
        const matchUpIdsToModify = inContextMatchUps ? inContextMatchUps.map(getMatchUpId) : matchUps.map(getMatchUpId);

        for (const matchUp of matchUps) {
          if (matchUpIdsToModify.includes(matchUp.matchUpId)) {
            matchUp.matchUpFormat = scheduledDates?.length ? matchUpFormat : undefined; // force to inherit structure matchUpFormat

            modifyMatchUpNotice({
              tournamentId: tournamentRecord?.tournamentId,
              eventId: event?.eventId,
              context: stack,
              drawDefinition,
              matchUp,
            });
          }
        }
      }
    }

    if (!modifiedStructureIds.length && drawDefinition.matchUpFormat !== matchUpFormat) {
      drawDefinition.matchUpFormat = matchUpFormat;
      modificationsCount += 1;
    }

    return modifiedStructureIds;
  };

  for (const event of tournamentRecord.events || []) {
    if (
      (eventIds?.length && !eventIds.includes(event.eventId)) ||
      (eventType && eventType !== event.eventType) ||
      eventType === TEAM
    ) {
      continue;
    }

    if (Array.isArray(stageSequences) || Array.isArray(stages) || structureIds?.length || drawIds?.length) {
      for (const drawDefinition of event.drawDefinitions || []) {
        if (Array.isArray(drawIds) && !drawIds.includes(drawDefinition.drawId)) continue;
        const modifiedStructureIds = processStructures(drawDefinition);
        modifyDrawNotice({
          structureIds: modifiedStructureIds,
          drawDefinition,
        });
      }
    } else if (event.matchUpFormat !== matchUpFormat) {
      event.matchUpFormat = matchUpFormat;
      modificationsCount += 1;
    }
  }

  if (!modificationsCount) return { ...SUCCESS, info: NO_MODIFICATIONS_APPLIED };

  return { ...SUCCESS, modificationsCount };
}
