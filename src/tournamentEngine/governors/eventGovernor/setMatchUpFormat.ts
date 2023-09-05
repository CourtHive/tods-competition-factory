import { setMatchUpFormat as drawEngineSetMatchUpFormat } from '../../../drawEngine/governors/matchUpGovernor/setMatchUpFormat';
import { getAllStructureMatchUps } from '../../../drawEngine/getters/getMatchUps/getAllStructureMatchUps';
import { isValid } from '../../../matchUpEngine/governors/matchUpFormatGovernor/isValid';
import { decorateResult } from '../../../global/functions/decorateResult';
import { getMatchUpId } from '../../../global/functions/extractors';
import {
  modifyDrawNotice,
  modifyMatchUpNotice,
} from '../../../drawEngine/notifications/drawNotifications';

import { DOUBLES, SINGLES, TEAM } from '../../../constants/eventConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_EVENT_TYPE,
  INVALID_VALUES,
  MISSING_DRAW_DEFINITION,
  MISSING_MATCHUP_FORMAT,
  MISSING_TOURNAMENT_RECORD,
  NO_MODIFICATIONS_APPLIED,
  UNRECOGNIZED_MATCHUP_FORMAT,
} from '../../../constants/errorConditionConstants';
import { MatchUpStatusEnum } from '../../../types/tournamentFromSchema';

export function setMatchUpFormat({
  tournamentRecord,
  drawDefinition,
  scheduledDates,
  stageSequences,
  matchUpFormat,
  structureIds,
  structureId,
  eventType, // only SINGLES or DOUBLES
  matchUpId,
  eventIds,
  eventId,
  drawIds,
  stages,
  drawId,
  event,
  force, // strip matchUpFormat from scoped matchUps which have not been scored
}) {
  const stack = 'setMatchUpFormat';

  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!matchUpFormat) return { error: MISSING_MATCHUP_FORMAT };
  if (matchUpFormat && !isValid(matchUpFormat))
    return decorateResult({
      result: { error: UNRECOGNIZED_MATCHUP_FORMAT, matchUpFormat },
      stack,
    });
  if (scheduledDates && !Array.isArray(scheduledDates))
    return decorateResult({
      result: { error: INVALID_VALUES, scheduledDates },
      stack,
    });
  if (eventType && ![SINGLES, DOUBLES].includes(eventType))
    return decorateResult({ result: { error: INVALID_EVENT_TYPE }, stack });

  let modificationsCount = 0;

  if ((structureId || structureIds) && !drawDefinition) {
    return decorateResult({
      result: { error: MISSING_DRAW_DEFINITION },
      stack,
    });
  }

  if (drawId && matchUpId) {
    const result = drawEngineSetMatchUpFormat({
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
        (Array.isArray(stageSequences) &&
          !stageSequences.includes(structure.stageSequence)) ||
        (structureIds.length && !structureIds.includes(structure.structureId))
      )
        continue;

      if (structureIds.length && structure.matchUpFormat !== matchUpFormat) {
        structure.matchUpFormat = matchUpFormat;
        modifiedStructureIds.push(structure.structureId);
        modificationsCount += 1;
      }

      const matchUps =
        (force || scheduledDates) &&
        getAllStructureMatchUps({
          matchUpFilters: { matchUpStatuses: [MatchUpStatusEnum.ToBePlayed] },
          structure,
        });

      const inContextMatchUps =
        scheduledDates &&
        getAllStructureMatchUps({
          matchUpFilters: { matchUpStatuses: [MatchUpStatusEnum.ToBePlayed] },
          contextFilters: { scheduledDates },
          afterRecoveryTimes: false,
          inContext: true,
          structure,
        });

      if (matchUps?.length) {
        const matchUpIdsToModify = inContextMatchUps
          ? inContextMatchUps.map(getMatchUpId)
          : matchUps.map(getMatchUpId);

        for (const matchUp of matchUps) {
          if (matchUpIdsToModify.includes(matchUp.matchUpId)) {
            matchUp.matchUpFormat = scheduledDates?.length
              ? matchUpFormat
              : undefined; // force to inherit structure matchUpFormat

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

    if (
      !modifiedStructureIds.length &&
      drawDefinition.matchUpFormat !== matchUpFormat
    ) {
      drawDefinition.matchUpFormat = matchUpFormat;
      modificationsCount += 1;
    }

    return modifiedStructureIds;
  };

  structureIds = structureIds || [structureId].filter(Boolean);
  eventIds = eventIds || [eventId].filter(Boolean);
  drawIds = drawIds || [drawId].filter(Boolean);

  for (const event of tournamentRecord.events || []) {
    if (
      (eventIds?.length && !eventIds.includes(event.eventId)) ||
      (eventType && eventType !== event.eventType) ||
      eventType === TEAM
    ) {
      continue;
    }

    if (
      Array.isArray(stageSequences) ||
      Array.isArray(stages) ||
      structureIds.length ||
      drawIds.length
    ) {
      for (const drawDefinition of event.drawDefinitions || []) {
        if (Array.isArray(drawIds) && !drawIds.includes(drawDefinition.drawId))
          continue;
        const modifiedStructureIds = processStructures(drawDefinition);
        modifyDrawNotice({
          structureIds: modifiedStructureIds,
          drawDefinition,
        });
      }
    } else {
      if (event.matchUpFormat !== matchUpFormat) {
        event.matchUpFormat = matchUpFormat;
        modificationsCount += 1;
      }
    }
  }

  if (!modificationsCount)
    return { ...SUCCESS, info: NO_MODIFICATIONS_APPLIED };

  return { ...SUCCESS, modificationsCount };
}
