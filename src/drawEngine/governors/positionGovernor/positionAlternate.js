import { getPositionAssignments } from '../../getters/positionsGetter';
import { assignDrawPosition } from './positionAssignment';
import { clearDrawPosition } from './positionClear';

import { SUCCESS } from '../../../constants/resultConstants';

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
  const isByeReplacement = positionAssignment.bye && drawPosition;

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
  }
  let result = clearDrawPosition({
    drawDefinition,
    drawPosition,
    structureId,
  });
  if (result.error) return result;
  const removedParticipantId = result.participantId;

  result = assignDrawPosition({
    isByeReplacement,
    drawDefinition,
    structureId,
    drawPosition,
    participantId: alternateParticipantId,
  });
  if (!result.success) return result;

  return Object.assign({}, SUCCESS, { removedParticipantId });
}
