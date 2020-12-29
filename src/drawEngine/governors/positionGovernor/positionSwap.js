import { findStructure } from '../../getters/findStructure';

import {
  INVALID_VALUES,
  MISSING_DRAW_DEFINITION,
  MISSING_STRUCTURE_ID,
  STRUCTURE_NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function swapDrawPositionAssignments({
  drawDefinition,
  drawPositions,
  structureId,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!structureId) return { error: MISSING_STRUCTURE_ID };
  if (!drawPositions?.length === 2)
    return { error: INVALID_VALUES, drawPositions };

  const { structure } = findStructure({ drawDefinition, structureId });
  if (!structure) return { error: STRUCTURE_NOT_FOUND };

  const { positionAssignments } = structure || {};

  // TASK: move verification/validity checks into xxxEngine.setState
  if (!positionAssignments)
    return {
      error: INVALID_VALUES,
      structure,
      message: 'Missing positionAssignments',
    };

  const assignments = positionAssignments.filter((assignment) =>
    drawPositions.includes(assignment.drawPosition)
  );

  // preserves order of drawPositions in original positionAssignments array
  // while insuring that all attributes are faithfully copied over and only drawPosition is swapped
  const newAssignments = Object.assign(
    {},
    ...assignments.map((assignment, index) => {
      const { drawPosition } = assignment;
      const newAssignment = Object.assign({}, assignments[1 - index], {
        drawPosition,
      });
      return { [drawPosition]: newAssignment };
    })
  );

  structure.positionAssignments = positionAssignments.map(
    (assignment) => newAssignments[assignment.drawPosition] || assignment
  );

  return SUCCESS;
}
