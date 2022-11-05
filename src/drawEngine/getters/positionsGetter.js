import { getParticipantIds } from '../../global/functions/extractors';
import { findStructure } from './findStructure';

import {
  MISSING_DRAW_DEFINITION,
  MISSING_POSITION_ASSIGNMENTS,
} from '../../constants/errorConditionConstants';

export function getAllPositionedParticipantIds({ drawDefinition }) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  const stagePositionedParticipantIds = {};

  const allPositionedParticipantIds = (drawDefinition.structures || [])
    .map((structure) => {
      const stage = structure.stage;
      if (!stagePositionedParticipantIds[stage])
        stagePositionedParticipantIds[stage] = [];
      const { positionAssignments } = getPositionAssignments({ structure });
      const particiapntIds = getParticipantIds(positionAssignments);
      stagePositionedParticipantIds[stage].push(...particiapntIds);
      return particiapntIds;
    })
    .flat();
  return { allPositionedParticipantIds, stagePositionedParticipantIds };
}

export function getPositionAssignments({
  drawDefinition,
  structureId,
  structure,
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
  drawDefinition,
  structureId,
  structure,
}) {
  const { positionAssignments } = getPositionAssignments({
    drawDefinition,
    structureId,
    structure,
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
