import { setMatchUpFormat as drawEngineSetMatchUpFormat } from '../../../drawEngine/governors/matchUpGovernor/matchUpFormat';
import { checkTieFormat } from '../../../matchUpEngine/governors/tieFormatGovernor/tieFormatUtilities';
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
  tieFormat,
  eventIds,
  eventId,
  drawIds,
  stages,
  drawId,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!matchUpFormat && !tieFormat) return { error: MISSING_MATCHUP_FORMAT };
  if (matchUpFormat && !isValid(matchUpFormat))
    return { error: UNRECOGNIZED_MATCHUP_FORMAT };

  if (tieFormat) {
    const result = checkTieFormat(tieFormat);
    if (result.error) return result;
    tieFormat = result.tieFormat;
  }

  let modificationsCount = 0;

  if ((structureId || structureIds) && !drawDefinition) {
    return { error: MISSING_DRAW_DEFINITION };
  }

  if (drawId) {
    const result = drawEngineSetMatchUpFormat({
      tournamentRecord,
      drawDefinition,
      matchUpFormat,
      structureIds,
      structureId,
      tieFormat,
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

      if (matchUpFormat) structure.matchUpFormat = matchUpFormat;
      else structure.tieFormat = tieFormat;
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
      if (matchUpFormat) event.matchUpFormat = matchUpFormat;
      else event.tieFormat = tieFormat;

      modificationsCount += 1;
    }
  }

  if (!modificationsCount) return { error: NO_MODIFICATIONS_APPLIED };

  return { ...SUCCESS, modificationsCount };
}
