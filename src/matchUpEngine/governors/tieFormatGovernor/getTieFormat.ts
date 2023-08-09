import { findMatchUp } from '../../../drawEngine/getters/getMatchUps/findMatchUp';
import { findStructure } from '../../../drawEngine/getters/findStructure';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  ErrorType,
  MISSING_DRAW_DEFINITION,
  MISSING_TIE_FORMAT,
} from '../../../constants/errorConditionConstants';

import { MatchUp, Structure } from '../../../types/tournamentFromSchema';

export function getTieFormat({
  drawDefinition,
  structureId,
  matchUpId,
  structure,
  matchUp,
  eventId, // optional - if an eventId is present only return tieFormat for event
  event,
}) {
  let tieFormat;

  structureId = structure?.structureId || structureId;
  matchUpId = matchUp?.matchUpId || matchUpId;

  if ((matchUpId || structureId) && !drawDefinition)
    return { error: MISSING_DRAW_DEFINITION };

  if (eventId && event) {
    tieFormat = getObjectTieFormat(event);
  } else if (matchUpId) {
    // if matchUpId is present, structure and drawDefinition are always required
    if (!matchUp || !structure) {
      const result: {
        matchUp?: MatchUp;
        error?: ErrorType;
        structure?: Structure;
      } = findMatchUp({
        drawDefinition,
        matchUpId,
      });
      if (result.error) return result;

      ({ matchUp, structure } = result);
    }

    tieFormat =
      getItemTieFormat({ item: matchUp, drawDefinition, event }) ||
      getItemTieFormat({ item: structure, drawDefinition, event }) ||
      getObjectTieFormat(drawDefinition) ||
      getObjectTieFormat(event);
  } else if (drawDefinition && structureId) {
    if (!structure) {
      const result = findStructure({ drawDefinition, structureId });
      if (result.error) return result;
      structure = result?.structure;
    }
    tieFormat =
      structure?.tieFormat || drawDefinition.tieFormat || event?.tieFormat;
  } else {
    tieFormat = drawDefinition?.tieFormat || event?.tieFormat;
  }

  if (!tieFormat) return { error: MISSING_TIE_FORMAT };

  return { ...SUCCESS, tieFormat, matchUp, structure };
}

export function getObjectTieFormat(obj) {
  if (!obj) return;
  const { tieFormatId, tieFormats } = obj;
  if (obj.tieFormat) {
    return obj.tieFormat;
  } else if (tieFormatId && Array.isArray(tieFormats)) {
    return tieFormats.find((tf) => tf.tieFormatId === tieFormatId);
  }
}

export function getItemTieFormat({ item, drawDefinition, event }) {
  if (!item) return;
  if (item.tieFormat) return item.tieFormat;
  if (item.tieFormatId) {
    if (drawDefinition.tieFormat) return drawDefinition.tieFormat;
    const tieFormat = drawDefinition.tieFormats?.find(
      (tf) => item.tieFormatId === tf.tieFormatId
    );
    if (tieFormat) return tieFormat;

    if (event.tieFormat) return event.tieFormat;
    return event.tieFormats?.find((tf) => item.tieFormatId === tf.tieFormatId);
  }
}
