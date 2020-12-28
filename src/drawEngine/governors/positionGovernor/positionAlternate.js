import { SUCCESS } from '../../../constants/resultConstants';
import { assignDrawPosition } from './positionAssignment';
import { clearDrawPosition } from './positionClear';

export function alternateDrawPositionAssignment({
  alternateParticipantId,
  drawDefinition,
  drawPosition,
  structureId,
}) {
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
