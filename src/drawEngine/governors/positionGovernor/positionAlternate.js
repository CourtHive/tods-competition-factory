import { positionParticipantAction } from './positionParticipantAction';

export function alternateDrawPositionAssignment({
  alternateParticipantId,
  drawDefinition,
  drawPosition,
  structureId,
}) {
  return positionParticipantAction({
    participantId: alternateParticipantId,
    drawDefinition,
    drawPosition,
    structureId,
    positionActionName: 'alternateDrawPositionAssignment',
  });
}
