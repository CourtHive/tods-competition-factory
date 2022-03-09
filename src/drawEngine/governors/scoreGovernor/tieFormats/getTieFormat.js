import { findMatchUp } from '../../../getters/getMatchUps/findMatchUp';
import { findStructure } from '../../../getters/findStructure';

import { MISSING_DRAW_DEFINITION } from '../../../../constants/errorConditionConstants';

export function getTieFormat({
  drawDefinition,
  structureId,
  matchUpId,
  eventId,
  event,
}) {
  if ((matchUpId || structureId) && !drawDefinition)
    return { error: MISSING_DRAW_DEFINITION };

  let error, matchUp, structure, tieFormat;

  if (eventId && event?.tieFormat) {
    tieFormat = event.tieFormat;
  } else if (matchUpId) {
    ({ error, matchUp, structure } = findMatchUp({
      drawDefinition,
      matchUpId,
    }));
    if (error) return { error };

    tieFormat =
      matchUp.tieFormat || structure?.tieFormat || drawDefinition?.tieFormat;
  } else if (drawDefinition && structureId) {
    structure = findStructure({ drawDefinition, structureId })?.structure;
    tieFormat = structure?.tieFormat || drawDefinition.tieFormat;
  } else {
    tieFormat = drawDefinition?.tieFormat;
  }

  return { tieFormat, matchUp, structure };
}
