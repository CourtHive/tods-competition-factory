import { findStructure } from './findStructure';

import {
  MISSING_DRAW_DEFINITION,
  MISSING_POSITION_ASSIGNMENTS,
} from '../../constants/errorConditionConstants';

export function getDrawPositions({ structure }) {
  if (structure && structure.structures) {
    return [].concat(
      ...structure.structures.map((structure) =>
        getDrawPositions({ structure })
      )
    );
  } else if (structure) {
    return structure.positionAssignments || [];
  }
}

export function getAllPositionedParticipantIds({ drawDefinition }) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  return (drawDefinition.structures || [])
    .map((structure) => {
      const { positionAssignments } = getPositionAssignments({ structure });
      return positionAssignments
        .map(({ participantId }) => participantId)
        .filter(Boolean);
    })
    .flat();
}

export function getPositionAssignments({
  structure,
  drawDefinition,
  structureId,
}) {
  let error,
    positionAssignments = [];
  if (!structure) {
    if (!drawDefinition) {
      return { positionAssignments, error: MISSING_DRAW_DEFINITION };
    }
    ({ structure, error } = findStructure({ drawDefinition, structureId }));
    if (error) return { positionAssignments, error };
  }
  if (structure.structures) {
    positionAssignments = [].concat(
      ...structure.structures.map((structure) => {
        return getPositionAssignments({ structure }).positionAssignments;
      })
    );
  } else if (structure.positionAssignments) {
    positionAssignments = structure.positionAssignments;
  } else {
    error = MISSING_POSITION_ASSIGNMENTS;
  }

  return { positionAssignments, error };
}

export function structureAssignedDrawPositions({
  structure,
  drawDefinition,
  structureId,
}) {
  const { positionAssignments } = getPositionAssignments({
    structure,
    drawDefinition,
    structureId,
  });
  const assignedPositions = positionAssignments.filter((drawPosition) => {
    return (
      drawPosition.participantId || drawPosition.bye || drawPosition.qualifier
    );
  });
  const allPositionsAssigned =
    positionAssignments.length === assignedPositions.length;
  const unassignedPositions = positionAssignments.filter((drawPosition) => {
    return (
      !drawPosition.participantId &&
      !drawPosition.bye &&
      !drawPosition.qualifier
    );
  });
  const byePositions = positionAssignments.filter((drawPosition) => {
    return !drawPosition.participantId && drawPosition.bye;
  });
  const qualifierPositions = positionAssignments.filter((drawPosition) => {
    return !drawPosition.participantId && drawPosition.qualifier;
  });
  return {
    byePositions,
    assignedPositions,
    qualifierPositions,
    unassignedPositions,
    positionAssignments,
    allPositionsAssigned,
  };
}
