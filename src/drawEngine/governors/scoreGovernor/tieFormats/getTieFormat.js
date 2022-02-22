import { findMatchUp } from '../../../getters/getMatchUps/findMatchUp';
import { findStructure } from '../../../getters/findStructure';

export function getTieFormat({
  drawDefinition,
  structureId,
  matchUpId,
  eventId,
  event,
}) {
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
      matchUp.tieFormat || structure?.tieFormat || drawDefinition.tieFormat;
  } else if (structureId) {
    structure = findStructure({ drawDefinition, structureId })?.structure;
    tieFormat = structure?.tieFormat || drawDefinition.tieFormat;
  } else {
    tieFormat = drawDefinition.tieFormat;
  }

  return { tieFormat, matchUp, structure };
}
