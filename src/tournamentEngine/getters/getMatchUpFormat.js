import {
  MISSING_DRAW_ID,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
} from '../../constants/errorConditionConstants';
import { findStructure } from '../../drawEngine/getters/findStructure';
import { findMatchUp } from './matchUpsGetter';

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
export function getMatchUpFormat({
  tournamentRecord,
  drawId,
  drawDefinition,
  event,
  structureId,
  matchUpId,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!drawId && !event && !structureId && !matchUpId)
    return { error: MISSING_VALUE };

  const matchUpResult = findMatchUp({
    tournamentRecord,
    drawDefinition,
    drawId,
    matchUpId,
  });

  if (matchUpId && matchUpResult?.error) {
    return matchUpResult;
  } else if (!drawDefinition && matchUpResult?.drawDefinition) {
    drawDefinition = matchUpResult?.drawDefinition;
  }

  let structure = matchUpResult?.structure;
  if (!structure && structureId && !matchUpId) {
    if (!drawDefinition) return { error: MISSING_DRAW_ID };
    const structureResult = findStructure({ drawDefinition, structureId });
    if (structureResult.error) return structureResult;
    structure = structureResult.structure;
  }

  const structureDefaultMatchUpFormat = structure?.matchUpFormat;
  const drawDefaultMatchUpFormat = drawDefinition?.matchUpFormat;
  const eventDefaultMatchUpFormat = event?.matchUpFormat;
  const matchUpFormat =
    matchUpResult?.matchUp?.matchUpFormat ||
    structureDefaultMatchUpFormat ||
    drawDefaultMatchUpFormat ||
    eventDefaultMatchUpFormat;

  return {
    matchUpFormat,
    structureDefaultMatchUpFormat,
    drawDefaultMatchUpFormat,
    eventDefaultMatchUpFormat,
  };
}
