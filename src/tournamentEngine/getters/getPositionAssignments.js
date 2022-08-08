import { getPositionAssignments as positionAssignments } from '../../drawEngine/getters/positionsGetter';
import {
  MISSING_DRAW_DEFINITION,
  MISSING_STRUCTURE_ID,
  MISSING_TOURNAMENT_RECORD,
} from '../../constants/errorConditionConstants';

export function getPositionAssignments({
  tournamentRecord,
  drawDefinition,
  structureId,
  structure,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!structure && !drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!structure && !structureId) return { error: MISSING_STRUCTURE_ID };

  return positionAssignments({ drawDefinition, structureId, structure });
}
