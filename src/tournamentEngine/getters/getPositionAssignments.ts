import { getPositionAssignments as positionAssignments } from '../../drawEngine/getters/positionsGetter';

import { MAIN } from '../../constants/drawDefinitionConstants';
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
  stage?: string;
};
export function getPositionAssignments({
  tournamentRecord,
  drawDefinition,
  stage = MAIN,
  structureId,
  structure,
}: GetPositionAssignmentsArgs) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!structure && !drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (
    !structure &&
    !structureId &&
    drawDefinition?.structures?.filter((structure) => structure.stage === stage)
      .length === 1
  ) {
    structure = drawDefinition.structures.find(
      (structure) => structure.stage === stage
    );
  }
  if (!structure && !structureId) return { error: MISSING_STRUCTURE_ID };

  const { error, positionAssignments: assignments } = positionAssignments({
    drawDefinition,
    structureId,
    structure,
  });
  return {
    error,
    positionAssignments: assignments || [],
    structureId: structure?.structureId,
  };
}
