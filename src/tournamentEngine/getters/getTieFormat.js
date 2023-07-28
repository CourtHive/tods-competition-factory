import { decorateResult } from '../../global/functions/decorateResult';
import { findStructure } from '../../drawEngine/getters/findStructure';
import { findMatchUp } from './matchUpsGetter/findMatchUp';

import { SUCCESS } from '../../constants/resultConstants';
import {
  MISSING_DRAW_ID,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
} from '../../constants/errorConditionConstants';

/**
 *
 * @param {object} tournamentRecord - passed in automatically by tournamentEngine
 * @param {string} drawId - optional - avoid brute force search for matchUp
 * @param {object} drawDefinition - passed in automatically by tournamentEngine when drawId provided
 * @param {string} eventId - optional - if only the default matchUpFormat for an event is required
 * @param {object} event - passed in automatically by tournamentEngine when drawId or eventId provided
 * @param {string} structureId - optional - if only the default matchUpFormat for a structure is required
 * @param {string} matchUpId - id of matchUp for which the scoped matchUpFormat(s) are desired
 *
 */
export function getTieFormat({
  tournamentRecord,
  drawDefinition,
  structureId,
  matchUpId,
  structure,
  eventId,
  drawId,
  event,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!drawId && !event && !structureId && !matchUpId)
    return decorateResult({
      result: { error: MISSING_VALUE },
      stack: 'getTieFormat',
    });

  if (eventId && !event) {
    event = tournamentRecord.events?.find((event) => event.eventId === eventId);
  }

  const matchUpResult = findMatchUp({
    tournamentRecord,
    drawDefinition,
    matchUpId,
    drawId,
    event,
  });

  if (matchUpId && matchUpResult?.error) {
    return matchUpResult;
  } else if (!drawDefinition && matchUpResult?.drawDefinition) {
    drawDefinition = matchUpResult?.drawDefinition;
  }

  structure = structure || matchUpResult?.structure;
  if (!structure && structureId && !matchUpId) {
    if (!drawDefinition) return { error: MISSING_DRAW_ID };
    const structureResult = findStructure({ drawDefinition, structureId });
    if (structureResult.error) return structureResult;
    structure = structureResult.structure;
  }

  const structureDefaultTieFormat = structure?.tieFormat;
  const drawDefaultTieFormat = drawDefinition?.tieFormat;
  const eventDefaultTieFormat = event?.tieFormat;
  const tieFormat =
    matchUpResult?.matchUp?.tieFormat ||
    structureDefaultTieFormat ||
    drawDefaultTieFormat ||
    eventDefaultTieFormat ||
    undefined;

  return {
    ...SUCCESS,
    structureDefaultTieFormat,
    eventDefaultTieFormat,
    drawDefaultTieFormat,
    tieFormat,
  };
}
