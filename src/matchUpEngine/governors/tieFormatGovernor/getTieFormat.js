import { findMatchUp } from '../../../drawEngine/getters/getMatchUps/findMatchUp';
import { findStructure } from '../../../drawEngine/getters/findStructure';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_DRAW_DEFINITION,
  MISSING_TIE_FORMAT,
} from '../../../constants/errorConditionConstants';

export function getTieFormat({
  drawDefinition,
  structureId,
  matchUpId,
  eventId,
  event,
}) {
  if ((matchUpId || structureId) && !drawDefinition)
    return { error: MISSING_DRAW_DEFINITION };

  let matchUp, structure, tieFormat;

  if (eventId && event?.tieFormat) {
    tieFormat = event.tieFormat;
  } else if (matchUpId) {
    const result = findMatchUp({
      drawDefinition,
      matchUpId,
    });
    if (result.error) return result;

    ({ matchUp, structure } = result);

    tieFormat =
      matchUp.tieFormat ||
      structure?.tieFormat ||
      drawDefinition?.tieFormat ||
      event?.tieFormat;
  } else if (drawDefinition && structureId) {
    const result = findStructure({ drawDefinition, structureId });
    if (result.error) return result;

    structure = result?.structure;
    tieFormat =
      structure?.tieFormat || drawDefinition.tieFormat || event?.tieFormat;
  } else {
    tieFormat = drawDefinition?.tieFormat || event?.tieFormat;
  }

  if (!tieFormat) return { error: MISSING_TIE_FORMAT };

  return { ...SUCCESS, tieFormat, matchUp, structure };
}
