import { setMatchUpFormat } from '../../../drawEngine/governors/matchUpGovernor/matchUpFormat';

import {
  MISSING_DRAW_DEFINITION,
  MISSING_EVENT,
  MISSING_MATCHUP_FORMAT,
  MISSING_STRUCTURE_ID,
  MISSING_TOURNAMENT_RECORD,
  NOT_IMPLEMENTED,
} from '../../../constants/errorConditionConstants';

export function setEventDefaultMatchUpFormat({
  tournamentRecord,
  event,
  matchUpFormat,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!matchUpFormat) return { error: MISSING_MATCHUP_FORMAT };
  if (!event) return { error: MISSING_EVENT };
  return { error: NOT_IMPLEMENTED };
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
  return { error: NOT_IMPLEMENTED };
}
