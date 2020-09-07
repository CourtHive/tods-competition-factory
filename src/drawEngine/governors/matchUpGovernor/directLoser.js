import { structureAssignedDrawPositions } from 'src/drawEngine/getters/positionsGetter';
import { assignDrawPosition } from 'src/drawEngine/governors/positionGovernor/positionAssignment';

export function directLoser({drawDefinition, targetMatchUpSide, loserTargetLink, loserDrawPosition, loserMatchUp}) {
  let error;
  
  const targetMatchUpDrawPositions = loserMatchUp.drawPositions;
  const targetMatchUpDrawPosition = targetMatchUpDrawPositions[targetMatchUpSide];
 
  const sourceStructureId = loserTargetLink.source.structureId;
  const {
    positionAssignments: sourcePositionAssignments
  } = structureAssignedDrawPositions({ drawDefinition, structureId: sourceStructureId });
  const loserParticipantId = sourcePositionAssignments.reduce((participantId, assignment) => {
    return assignment.drawPosition === loserDrawPosition ? assignment.participantId : participantId;
  }, undefined);
  
  const targetStructureId = loserTargetLink.target.structureId;
  const {
    positionAssignments: targetPositionAssignments
  } = structureAssignedDrawPositions({ drawDefinition, structureId: targetStructureId });
  
  const unfilledTargetMatchUpDrawPositions = targetPositionAssignments.filter(assignment => {
    const inTarget = targetMatchUpDrawPositions.includes(assignment.drawPosition);
    const unfilled = !assignment.participantId && !assignment.bye && !assignment.qualifier;
    return inTarget && unfilled;
  }).map(assignment => assignment.drawPosition);
  const targetDrawPositionIsUnfilled = unfilledTargetMatchUpDrawPositions.includes(targetMatchUpDrawPosition);

  if (loserTargetLink.target.roundNumber === 1 && targetDrawPositionIsUnfilled) {
    assignDrawPosition({
      drawDefinition,
      structureId: targetStructureId,
      participantId: loserParticipantId,
      drawPosition: targetMatchUpDrawPosition
    });
  } else if (unfilledTargetMatchUpDrawPositions.length) {
    const drawPosition = unfilledTargetMatchUpDrawPositions.pop();
    assignDrawPosition({
      drawDefinition,
      structureId: targetStructureId,
      participantId: loserParticipantId,
      drawPosition
    });
  } else {
    error = 'loser target position unavaiallble';
  }
  
  return { error };
}
