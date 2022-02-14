import { positionParticipantAction } from './positionParticipantAction';

export function alternateDrawPositionAssignment({
  alternateParticipantId,
  tournamentRecord,
  drawDefinition,
  drawPosition,
  structureId,
}) {
  return positionParticipantAction({
    positionActionName: 'alternateDrawPositionAssignment',
    participantIdAttributeName: 'alternateParticipantid',
    participantId: alternateParticipantId,
    tournamentRecord,
    drawDefinition,
    drawPosition,
    structureId,
  });
}
