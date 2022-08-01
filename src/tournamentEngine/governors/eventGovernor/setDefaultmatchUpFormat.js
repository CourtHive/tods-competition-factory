import { setMatchUpFormat as drawEngineSetMatchUpFormat } from '../../../drawEngine/governors/matchUpGovernor/matchUpFormat';
import { isValid } from '../../../matchUpEngine/governors/matchUpFormatGovernor/isValid';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_DRAW_DEFINITION,
  MISSING_MATCHUP_FORMAT,
  MISSING_TOURNAMENT_RECORD,
  NO_MODIFICATIONS_APPLIED,
  UNRECOGNIZED_MATCHUP_FORMAT,
} from '../../../constants/errorConditionConstants';

export function setMatchUpFormat({
  tournamentRecord,
  drawDefinition,
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
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!matchUpFormat) return { error: MISSING_MATCHUP_FORMAT };
  if (matchUpFormat && !isValid(matchUpFormat))
    return { error: UNRECOGNIZED_MATCHUP_FORMAT };

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
    });
    if (result.error) return result;
    modificationsCount += 1;
  }

  const processStructures = (drawDefinition) => {
    for (const structure of drawDefinition.structures || []) {
      if (
        (Array.isArray(stages) && !stages.includes(structure.stage)) ||
        (Array.isArray(stageSequences) &&
          !stageSequences.includes(structure.stageSequence))
      )
        continue;

      structure.matchUpFormat = matchUpFormat;
    }
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
        processStructures(drawDefinition);
      }
    } else {
      event.matchUpFormat = matchUpFormat;

      modificationsCount += 1;
    }
  }

  if (!modificationsCount) return { error: NO_MODIFICATIONS_APPLIED };

  return { ...SUCCESS, modificationsCount };
}
