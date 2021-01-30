import { removeDrawPositionAssignment } from '../../../tournamentEngine/governors/eventGovernor/drawDefinitions/removeDrawPositionAssignment';
import { assignDrawPositionBye } from './byePositioning/assignDrawPositionBye';
import { getMatchUpsMap } from '../../getters/getMatchUps/getMatchUpsMap';
import { findStructure } from '../../getters/findStructure';
import { assignDrawPosition } from './positionAssignment';

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

  const mappedMatchUps = getMatchUpsMap({ drawDefinition });

  const { structure } = findStructure({ drawDefinition, structureId });
  if (!structure) return { error: STRUCTURE_NOT_FOUND };

  if (structure.structureType === CONTAINER) {
    // { structureType: CONTAINER } indicates that the swap is within a ROUND ROBIN structure
    return roundRobinSwap({ structure, drawPositions, mappedMatchUps });
  } else {
    // if not a CONTAINER then swap occurs within elimination structure
    return eliminationSwap({
      drawDefinition,
      structure,
      drawPositions,
      mappedMatchUps,
    });
  }
}

function eliminationSwap({
  drawDefinition,
  structure,
  drawPositions,
  mappedMatchUps,
}) {
  // if not a CONTAINER then swap occurs within elimination structure
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

  // if both positions are BYE no need to do anything
  if (assignments.filter(({ bye }) => bye).length === 2) return;

  const isByeSwap = assignments.some(({ bye }) => bye);

  if (isByeSwap) {
    return eliminationByeSwap({
      drawDefinition,
      structure,
      assignments,
      mappedMatchUps,
    });
  } else {
    return eliminationParticpantSwap({
      structure,
      assignments,
      mappedMatchUps,
    });
  }
}

function eliminationByeSwap({
  drawDefinition,
  structure,
  assignments,
  mappedMatchUps,
}) {
  // remove the assignment that has a participantId
  const originalByeAssignment = assignments.find(({ bye }) => bye);
  const originalParticipantIdAssignment = assignments.find(
    ({ participantId }) => participantId
  );
  const originalByeDrawPosition = originalByeAssignment.drawPosition;
  const {
    participantId,
    drawPosition: originalParticipantIdDrawPosition,
  } = originalParticipantIdAssignment;
  const { structureId } = structure;

  // remove both drawPosition assignments
  let result = removeDrawPositionAssignment({
    drawDefinition,
    mappedMatchUps,
    structureId,
    drawPosition: originalByeDrawPosition,
  });
  if (result.error) return result;

  result = removeDrawPositionAssignment({
    drawDefinition,
    mappedMatchUps,
    structureId,
    drawPosition: originalParticipantIdDrawPosition,
  });
  if (result.error) return result;

  // replace the original byeAssignment with participantId
  result = assignDrawPosition({
    drawDefinition,
    structureId,
    drawPosition: originalByeDrawPosition,
    participantId,
  });
  if (result.error) return result;

  result = assignDrawPositionBye({
    drawDefinition,
    mappedMatchUps,
    structureId,
    drawPosition: originalParticipantIdDrawPosition,
  });

  return result.error ? result : SUCCESS;
}

function eliminationParticpantSwap({ structure, assignments }) {
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

  return SUCCESS;
}

function roundRobinSwap({ structure, drawPositions }) {
  const assignments = structure.structures?.reduce((assignments, structure) => {
    const structureAssignments = structure?.positionAssignments.filter(
      (assignment) => drawPositions.includes(assignment.drawPosition)
    );
    if (structureAssignments) assignments.push(...structureAssignments);
    return assignments;
  }, []);

  const participantIds = assignments.map(({ participantId }) => participantId);
  assignments.forEach(
    (assignment, index) =>
      (assignment.participantId = participantIds[1 - index])
  );

  return SUCCESS;
}
