import { resolveTieFormat } from '../../matchUpEngine/governors/tieFormatGovernor/getTieFormat/resolveTieFormat';
import { decorateResult } from '../../global/functions/decorateResult';
import { findStructure } from '../../drawEngine/getters/findStructure';
import { findMatchUp } from './matchUpsGetter/findMatchUp';

import { SUCCESS } from '../../constants/resultConstants';
import {
  MISSING_DRAW_ID,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
} from '../../constants/errorConditionConstants';

// method exclusively for external use
export function getTieFormat({
  tournamentRecord, // passed in automatically by tournamentEngine
  drawDefinition, // passed in automatically by tournamentEngine when drawId provided
  structureId, // optional - if only the default matchUpFormat for a structure is required
  matchUpId, // id of matchUp for which the scoped matchUpFormat(s) are desired
  structure, // optional optimization - when structure already known
  eventId, // optional - if only the default matchUpFormat for an event is required
  drawId, // avoid brute force search for matchUp
  event, // passed in automatically by tournamentEngine when drawId or eventId provided
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

  const structureDefaultTieFormat =
    (structure?.tieFormat || structure?.tieFormatId) &&
    resolveTieFormat({ structure, drawDefinition, event })?.tieFormat;
  const drawDefaultTieFormat =
    (drawDefinition?.tieFormat || drawDefinition?.tieFormatId) &&
    resolveTieFormat({
      drawDefinition,
      event,
    })?.tieFormat;
  const eventDefaultTieFormat = resolveTieFormat({ event })?.tieFormat;

  const tieFormat = resolveTieFormat({
    matchUp: matchUpResult?.matchUp,
    drawDefinition,
    structure,
    event,
  })?.tieFormat;

  return {
    ...SUCCESS,
    structureDefaultTieFormat,
    eventDefaultTieFormat,
    drawDefaultTieFormat,
    tieFormat,
  };
}
