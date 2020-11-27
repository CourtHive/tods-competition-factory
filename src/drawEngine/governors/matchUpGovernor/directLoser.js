import { getStructureMatchUps } from '../../getters/getMatchUps';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { assignDrawPosition } from '../positionGovernor/positionAssignment';
import { clearDrawPosition } from '../positionGovernor/positionClear';

/*
  FMLC linkCondition... check whether it is a participant's first 
*/
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

  const targetPositionIsBye = !!targetPositionAssignments.find(
    assignment => assignment.bye === true
  );

  const loserLinkCondition = loserTargetLink.linkCondition;
  if (loserLinkCondition) {
    const {
      completedMatchUps: completedSourceMatchUps,
      structure,
    } = getStructureMatchUps({
      drawDefinition,
      structureId: sourceStructureId,
    });
    console.log({ structure, loserLinkCondition, completedSourceMatchUps });
  }

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
    // if roundNumber !== 1 then it is a feed arm and any unfilled position in target matchUp will do
    const drawPosition = unfilledTargetMatchUpDrawPositions.pop();
    assignDrawPosition({
      drawDefinition,
      structureId: targetStructureId,
      participantId: loserParticipantId,
      drawPosition,
    });
  } else if (targetPositionIsBye) {
    const result = clearDrawPosition({
      drawDefinition,
      structureId: targetStructureId,
      drawPosition: targetMatchUpDrawPosition,
    });

    // drawPosition would not clear if player advanced by BYE had progressed
    if (result.success) {
      assignDrawPosition({
        drawDefinition,
        structureId: targetStructureId,
        participantId: loserParticipantId,
        drawPosition: targetMatchUpDrawPosition,
      });
    }
  } else {
    error = 'loser target position unavaiallble';
  }

  return { error };
}
