import { findMatchUp } from '../../../../drawEngine/getters/getMatchUps/findMatchUp';
import { findStructure } from '../../../../drawEngine/getters/findStructure';
import { getObjectTieFormat } from './getObjectTieFormat';
import { getItemTieFormat } from './getItemTieFormat';

import { SUCCESS } from '../../../../constants/resultConstants';
import {
  ErrorType,
  MISSING_DRAW_DEFINITION,
  MISSING_TIE_FORMAT,
} from '../../../../constants/errorConditionConstants';

import { MatchUp, Structure } from '../../../../types/tournamentFromSchema';

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

      if (!structure) structure = result.structure;
      if (!matchUp) matchUp = result.matchUp;
    }

    tieFormat =
      getItemTieFormat({
        item: matchUp,
        drawDefinition,
        structure,
        event,
      }) ||
      getItemTieFormat({
        item: structure,
        drawDefinition,
        structure,
        event,
      }) ||
      getObjectTieFormat(drawDefinition) ||
      getObjectTieFormat(event);
  } else if (drawDefinition && structureId) {
    if (!structure) {
      const result = findStructure({ drawDefinition, structureId });
      if (result.error) return result;
      structure = result?.structure;
    }
    tieFormat =
      getItemTieFormat({
        item: structure,
        drawDefinition,
        structure,
        event,
      }) ||
      getObjectTieFormat(drawDefinition) ||
      getObjectTieFormat(event);
  } else {
    tieFormat = getObjectTieFormat(drawDefinition) || getObjectTieFormat(event);
  }

  if (!tieFormat) return { error: MISSING_TIE_FORMAT };

  return { ...SUCCESS, tieFormat, matchUp, structure };
}
