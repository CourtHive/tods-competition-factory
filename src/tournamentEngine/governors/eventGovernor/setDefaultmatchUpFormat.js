import { setMatchUpFormat } from '../../../drawEngine/governors/matchUpGovernor/matchUpFormat';
import { matchUpFormatCode } from 'tods-matchup-format-code';

import {
  MISSING_DRAW_DEFINITION,
  MISSING_EVENT,
  MISSING_MATCHUP_FORMAT,
  MISSING_STRUCTURE_ID,
  MISSING_TOURNAMENT_RECORD,
  NOT_IMPLEMENTED,
  UNRECOGNIZED_MATCHUP_FORMAT,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function setEventDefaultMatchUpFormat({
  tournamentRecord,
  event,
  matchUpFormat,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!matchUpFormat) return { error: MISSING_MATCHUP_FORMAT };
  if (!event) return { error: MISSING_EVENT };

  if (!matchUpFormatCode.isValidMatchUpFormat(matchUpFormat))
    return { error: UNRECOGNIZED_MATCHUP_FORMAT };

  event.matchUpFormat = matchUpFormat;

  return SUCCESS;
}

export function setDrawDefaultMatchUpFormat({
  tournamentRecord,
  drawDefinition,
  matchUpFormat,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!matchUpFormat) return { error: MISSING_MATCHUP_FORMAT };

  return setMatchUpFormat({ drawDefinition, matchUpFormat });
}

/**
 *
 * @param {object} tournamentRecord - passed automatically by tournamentEngine
 * @param {string} drawId - id of the draw within which structure is found
 * @param {object} drawDefinition - passed automatically by tournamentEngine when drawId is provided
 * @param {string} matchUpFormat - TODS matchUpFormatCode defining scoring format
 * @param {string} structureId - id of the structure for which the matchUpFormat is being set
 *
 */
export function setStructureDefaultMatchUpFormat({
  tournamentRecord,
  drawDefinition,
  matchUpFormat,
  structureId,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!matchUpFormat) return { error: MISSING_MATCHUP_FORMAT };
  if (!structureId) return { error: MISSING_STRUCTURE_ID };

  return setMatchUpFormat({
    drawDefinition,
    matchUpFormat,
    structureId,
  });
}

export function setCollectionDefaultMatchUpFormat({
  tournamentRecord,
  drawDefinition,
  matchUpFormat,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!matchUpFormat) return { error: MISSING_MATCHUP_FORMAT };

  if (!matchUpFormatCode.isValidMatchUpFormat(matchUpFormat))
    return { error: UNRECOGNIZED_MATCHUP_FORMAT };

  return { error: NOT_IMPLEMENTED };
}
