import { getPositionAssignments as positionAssignments } from '../../drawEngine/getters/positionsGetter';
import {
  MISSING_DRAW_DEFINITION,
  MISSING_STRUCTURE_ID,
  MISSING_TOURNAMENT_RECORD,
} from '../../constants/errorConditionConstants';
import {
  DrawDefinition,
  Structure,
  Tournament,
} from '../../types/tournamentFromSchema';

type GetPositionAssignmentsArgs = {
  tournamentRecord: Tournament;
  drawDefinition: DrawDefinition;
  structure?: Structure;
  structureId?: string;
};
export function getPositionAssignments({
  tournamentRecord,
  drawDefinition,
  structureId,
  structure,
}: GetPositionAssignmentsArgs) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!structure && !drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!structure && !structureId) return { error: MISSING_STRUCTURE_ID };

  return positionAssignments({ drawDefinition, structureId, structure });
}
