import { extractAttributes } from '../../utilities';
import { findStructure } from './findStructure';

import {
  MISSING_DRAW_DEFINITION,
  MISSING_POSITION_ASSIGNMENTS,
} from '../../constants/errorConditionConstants';

import { PositionAssignment } from '../../types/tournamentFromSchema';

export function getAllPositionedParticipantIds({ drawDefinition }) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  const stagePositionedParticipantIds = {};

  const allPositionedParticipantIds = (drawDefinition.structures || [])
    .map((structure) => {
      const stage = structure.stage;
      if (!stagePositionedParticipantIds[stage])
        stagePositionedParticipantIds[stage] = [];
      const { positionAssignments } = getPositionAssignments({ structure });
      const particiapntIds = positionAssignments
        .map(extractAttributes('participantId'))
        .filter(Boolean);
      stagePositionedParticipantIds[stage].push(...particiapntIds);
      return particiapntIds;
    })
    .flat();
  return { allPositionedParticipantIds, stagePositionedParticipantIds };
}

type GetPositionAssignmentsArgs = {
  structureId?: string;
  drawDefinition?: any;
  structure?: any;
};

export function getPositionAssignments({
  drawDefinition,
  structureId,
  structure,
}: GetPositionAssignmentsArgs) {
  let error: any,
    positionAssignments: PositionAssignment[] = [];
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
  const assignedPositions = positionAssignments.filter((assignment) => {
    return assignment.participantId || assignment.bye || assignment.qualifier;
  });
  const allPositionsAssigned =
    positionAssignments.length === assignedPositions.length;
  const unassignedPositions = positionAssignments.filter((assignment) => {
    return (
      !assignment.participantId && !assignment.bye && !assignment.qualifier
    );
  });
  const byePositions = positionAssignments.filter((assignment) => {
    return !assignment.participantId && assignment.bye;
  });
  const qualifierPositions = positionAssignments.filter((assignment) => {
    return !assignment.participantId && assignment.qualifier;
  });

  return {
    allPositionsAssigned,
    positionAssignments,
    unassignedPositions,
    assignedPositions,
    qualifierPositions,
    byePositions,
  };
}