import { positionParticipantAction } from './positionParticipantAction';

export function luckyLoserDrawPositionAssignment({
  luckyLoserParticipantId,
  tournamentRecord,
  drawDefinition,
  drawPosition,
  structureId,
}) {
  return positionParticipantAction({
    positionActionName: 'luckyLoserDrawPositionAssignment',
    participantId: luckyLoserParticipantId,
    tournamentRecord,
    drawDefinition,
    drawPosition,
    structureId,
  });
}
