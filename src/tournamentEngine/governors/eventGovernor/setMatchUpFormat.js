import { setMatchUpFormat as drawEngineSetMatchUpFormat } from '../../../drawEngine/governors/matchUpGovernor/setMatchUpFormat';
import { getAllStructureMatchUps } from '../../../drawEngine/getters/getMatchUps/getAllStructureMatchUps';
import { isValid } from '../../../matchUpEngine/governors/matchUpFormatGovernor/isValid';
import { getMatchUpId } from '../../../global/functions/extractors';
import {
  modifyDrawNotice,
  modifyMatchUpNotice,
} from '../../../drawEngine/notifications/drawNotifications';

import { TO_BE_PLAYED } from '../../../constants/matchUpStatusConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_VALUES,
  MISSING_DRAW_DEFINITION,
  MISSING_MATCHUP_FORMAT,
  MISSING_TOURNAMENT_RECORD,
  NO_MODIFICATIONS_APPLIED,
  UNRECOGNIZED_MATCHUP_FORMAT,
} from '../../../constants/errorConditionConstants';

export function setMatchUpFormat({
  tournamentRecord,
  drawDefinition,
  scheduledDates,
  stageSequences,
  matchUpFormat,
  structureIds,
  structureId,
  eventTypes,
  matchUpId,
  eventIds,
  eventId,
  drawIds,
  stages,
  drawId,
  force, // strip matchUpFormat from scoped matchUps which have not been scored
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!matchUpFormat) return { error: MISSING_MATCHUP_FORMAT };
  if (matchUpFormat && !isValid(matchUpFormat))
    return { error: UNRECOGNIZED_MATCHUP_FORMAT, matchUpFormat };
  if (scheduledDates && !Array.isArray(scheduledDates))
    return { error: INVALID_VALUES, scheduledDates };

  let modificationsCount = 0;

  if ((structureId || structureIds) && !drawDefinition) {
    return { error: MISSING_DRAW_DEFINITION };
  }

  if (matchUpId || drawId) {
    const result = drawEngineSetMatchUpFormat({
      tournamentRecord,
      drawDefinition,
      matchUpFormat,
      structureIds,
      structureId,
      matchUpId,
      force,
    });
    if (result.error) return result;
    modificationsCount += 1;
  }

  const processStructures = (drawDefinition) => {
    const structureIds = [];
    for (const structure of drawDefinition.structures || []) {
      if (
        (Array.isArray(stages) && !stages.includes(structure.stage)) ||
        (Array.isArray(stageSequences) &&
          !stageSequences.includes(structure.stageSequence))
      )
        continue;

      structure.matchUpFormat = matchUpFormat;
      structureIds.push(structure.structureId);
      modificationsCount += 1;

      const matchUps =
        (force || scheduledDates) &&
        getAllStructureMatchUps({
          matchUpFilters: { matchUpStatuses: [TO_BE_PLAYED] },
          structure,
        });

      const inContextMatchUps =
        scheduledDates &&
        getAllStructureMatchUps({
          matchUpFilters: { matchUpStatuses: [TO_BE_PLAYED] },
          contextFilters: { scheduledDates },
          inContext: true,
          structure,
        });

      if (matchUps?.length) {
        const matchUpIdsToModify = inContextMatchUps
          ? inContextMatchUps.map(getMatchUpId)
          : matchUps.map(getMatchUpId);

        for (const matchUp of matchUps) {
          if (matchUpIdsToModify.includes(matchUp.matchUpId)) {
            matchUp.matchUpFormat = undefined; // force to inherit structure matchUpFormat
            modifyMatchUpNotice({
              tournamentId: tournamentRecord?.tournamentId,
              eventId: event?.eventId,
              drawDefinition,
              matchUp,
            });
          }
        }
      }
    }
    return structureIds;
  };

  eventIds = eventIds || [eventId].filter(Boolean);
  for (const event of tournamentRecord.events || []) {
    if (
      !eventIds.includes(event.eventId) ||
      (Array.isArray(eventTypes) && !eventTypes.includes(event.eventType))
    ) {
      continue;
    }

    if (
      Array.isArray(drawIds) ||
      Array.isArray(stageSequences) ||
      Array.isArray(stages)
    ) {
      for (const drawDefinition of event.drawDefinitions || []) {
        if (Array.isArray(drawIds) && !drawIds.includes(drawDefinition.drawId))
          continue;
        const structureIds = processStructures(drawDefinition);
        modifyDrawNotice({ drawDefinition, structureIds });
      }
    } else {
      event.matchUpFormat = matchUpFormat;
      modificationsCount += 1;
    }
  }

  if (!modificationsCount) return { error: NO_MODIFICATIONS_APPLIED };

  return { ...SUCCESS, modificationsCount };
}
