import { findStructure } from '../../getters/findStructure';
import { intersection } from '../../../utilities';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_STRUCTURE,
  INVALID_VALUES,
  MISSING_DRAW_DEFINITION,
  STRUCTURE_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

export function setPositionAssignments({
  positionAssignments,
  drawDefinition,
  structureId,
  structure,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!Array.isArray(positionAssignments)) return { error: INVALID_VALUES };

  if (!structure) {
    const result = findStructure({ drawDefinition, structureId });
    if (result.error) return result;
    structure = result.structure;
  }
  if (!structure) return { error: STRUCTURE_NOT_FOUND };
  if (structure.structures)
    return {
      error: INVALID_STRUCTURE,
      message: 'cannot be Round Robin group container',
    };

  const structureDrawPositions = structure.positionAssignments?.map(
    ({ drawPosition }) => drawPosition
  );
  const submittedDrawPositions = positionAssignments.map(
    ({ drawPosition }) => drawPosition
  );

  if (
    intersection(structureDrawPositions, submittedDrawPositions).length !==
    structureDrawPositions.length
  )
    return { error: INVALID_VALUES, message: 'drawPositions do not match' };

  structure.positionAssignments = positionAssignments;

  return { ...SUCCESS };
}
