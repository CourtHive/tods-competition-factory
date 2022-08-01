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
  // stageSequences,
  matchUpFormat,
  structureIds,
  structureId,
  eventTypes,
  // eventIds,
  eventId,
  // drawIds,
  // stages,
  drawId,
  event,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!matchUpFormat) return { error: MISSING_MATCHUP_FORMAT };
  if (!isValid(matchUpFormat)) return { error: UNRECOGNIZED_MATCHUP_FORMAT };

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
    });
    if (result.error) return result;
    modificationsCount += 1;
  }

  if (
    eventId &&
    (!eventTypes ||
      (Array.isArray(eventTypes) && eventTypes.includes(event.eventType)))
  ) {
    event.matchUpFormat = matchUpFormat;
    modificationsCount += 1;
  }

  if (!modificationsCount) return { error: NO_MODIFICATIONS_APPLIED };

  return { ...SUCCESS, modificationsCount };
}
