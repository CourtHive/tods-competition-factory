import { positionParticipantAction } from './positionParticipantAction';

export function qualifierDrawPositionAssignment({
  qualifierParticipantId,
  tournamentRecord,
  drawDefinition,
  drawPosition,
  structureId,
}) {
  return positionParticipantAction({
    positionActionName: 'qualifierDrawPositionAssignment',
    participantId: qualifierParticipantId,
    isQualifierPoasition: true,
    tournamentRecord,
    drawDefinition,
    drawPosition,
    structureId,
  });
}
