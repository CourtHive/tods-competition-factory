import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { assignDrawPosition } from '../positionGovernor/positionAssignment';

export function directLoser({
  drawDefinition,
  loserTargetLink,
  loserDrawPosition,
  loserMatchUp,
  loserMatchUpDrawPositionIndex,
}) {
  let error;

  const targetMatchUpDrawPositions = loserMatchUp.drawPositions || [];
  const targetMatchUpDrawPosition =
    targetMatchUpDrawPositions[loserMatchUpDrawPositionIndex];

  const sourceStructureId = loserTargetLink.source.structureId;
  const {
    positionAssignments: sourcePositionAssignments,
  } = structureAssignedDrawPositions({
    drawDefinition,
    structureId: sourceStructureId,
  });
  const loserParticipantId = sourcePositionAssignments.reduce(
    (participantId, assignment) => {
      return assignment.drawPosition === loserDrawPosition
        ? assignment.participantId
        : participantId;
    },
    undefined
  );

  const targetStructureId = loserTargetLink.target.structureId;
  const {
    positionAssignments: targetPositionAssignments,
  } = structureAssignedDrawPositions({
    drawDefinition,
    structureId: targetStructureId,
  });

  const unfilledTargetMatchUpDrawPositions = targetPositionAssignments
    .filter(assignment => {
      const inTarget = targetMatchUpDrawPositions.includes(
        assignment.drawPosition
      );
      const unfilled =
        !assignment.participantId && !assignment.bye && !assignment.qualifier;
      return inTarget && unfilled;
    })
    .map(assignment => assignment.drawPosition);
  const targetDrawPositionIsUnfilled = unfilledTargetMatchUpDrawPositions.includes(
    targetMatchUpDrawPosition
  );

  if (
    loserTargetLink.target.roundNumber === 1 &&
    targetDrawPositionIsUnfilled
  ) {
    assignDrawPosition({
      drawDefinition,
      structureId: targetStructureId,
      participantId: loserParticipantId,
      drawPosition: targetMatchUpDrawPosition,
    });
  } else if (unfilledTargetMatchUpDrawPositions.length) {
    const drawPosition = unfilledTargetMatchUpDrawPositions.pop();
    assignDrawPosition({
      drawDefinition,
      structureId: targetStructureId,
      participantId: loserParticipantId,
      drawPosition,
    });
  } else {
    error = 'loser target position unavaiallble';
  }

  return { error };
}
