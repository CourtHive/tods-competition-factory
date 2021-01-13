import { findStructure } from '../../getters/findStructure';

import {
  INVALID_VALUES,
  MISSING_DRAW_DEFINITION,
  MISSING_STRUCTURE_ID,
  STRUCTURE_NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { CONTAINER } from '../../../constants/drawDefinitionConstants';

export function swapDrawPositionAssignments({
  drawDefinition,
  drawPositions,
  structureId,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!structureId) return { error: MISSING_STRUCTURE_ID };
  if (drawPositions?.length !== 2) {
    return { error: INVALID_VALUES, drawPositions };
  }

  const { structure } = findStructure({ drawDefinition, structureId });
  if (!structure) return { error: STRUCTURE_NOT_FOUND };

  if (structure.structureType === CONTAINER) {
    const assignments = structure.structures?.reduce(
      (assignments, structure) => {
        const structureAssignments = structure?.positionAssignments.filter(
          (assignment) => drawPositions.includes(assignment.drawPosition)
        );
        if (structureAssignments) assignments.push(...structureAssignments);
        return assignments;
      },
      []
    );

    const participantIds = assignments.map(
      ({ participantId }) => participantId
    );
    assignments.forEach(
      (assignment, index) =>
        (assignment.participantId = participantIds[1 - index])
    );
  } else {
    const assignments = structure?.positionAssignments.filter((assignment) =>
      drawPositions.includes(assignment.drawPosition)
    );
    if (!assignments) {
      return {
        error: INVALID_VALUES,
        structure,
        message: 'Missing positionAssignments',
      };
    }
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
    structure.positionAssignments = structure.positionAssignments.map(
      (assignment) => newAssignments[assignment.drawPosition] || assignment
    );
  }

  return SUCCESS;
}
