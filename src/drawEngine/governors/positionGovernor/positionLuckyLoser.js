import { positionParticipantAction } from './positionParticipantAction';

export function luckyLoserDrawPositionAssignment({
  luckyLoserParticipantId,
  drawDefinition,
  drawPosition,
  structureId,
}) {
  return positionParticipantAction({
    participantId: luckyLoserParticipantId,
    drawDefinition,
    drawPosition,
    structureId,
    positionActionName: 'luckyLoserDrawPositionAssignment',
  });
}
