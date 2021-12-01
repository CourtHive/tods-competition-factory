import { positionParticipantAction } from './positionParticipantAction';

export function alternateDrawPositionAssignment({
  alternateParticipantId,
  drawDefinition,
  drawPosition,
  structureId,
}) {
  return positionParticipantAction({
    positionActionName: 'alternateDrawPositionAssignment',
    participantIdAttributeName: 'alternateParticipantid',
    participantId: alternateParticipantId,
    drawDefinition,
    drawPosition,
    structureId,
  });
}
