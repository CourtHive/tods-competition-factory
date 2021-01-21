import { assignDrawPosition } from './positionAssignment';
import { clearDrawPosition } from './positionClear';

import { SUCCESS } from '../../../constants/resultConstants';
import { getPositionAssignments } from '../../getters/positionsGetter';

export function alternateDrawPositionAssignment({
  alternateParticipantId,
  drawDefinition,
  drawPosition,
  structureId,
}) {
  const { positionAssignments } = getPositionAssignments({
    drawDefinition,
    structureId,
  });
  const positionAssignment = positionAssignments.find(
    (assignment) => assignment.drawPosition === drawPosition
  );
  if (positionAssignment.participantId) {
    let result = assignDrawPosition({
      drawDefinition,
      structureId,
      drawPosition,
      participantId: alternateParticipantId,
    });
    if (!result.success) {
      console.log({ result });
    }
    return Object.assign({}, SUCCESS, {
      removedParticipantId: positionAssignment.participantId,
    });
  } else {
    console.log('deal with bye replacement');
  }
  let result = clearDrawPosition({
    drawDefinition,
    drawPosition,
    structureId,
  });
  if (result.error) return result;
  const removedParticipantId = result.participantId;

  result = assignDrawPosition({
    drawDefinition,
    structureId,
    drawPosition,
    participantId: alternateParticipantId,
  });
  if (!result.success) return result;

  return Object.assign({}, SUCCESS, { removedParticipantId });
}
