import { positionParticipantAction } from './positionParticipantAction';

export function qualifierDrawPositionAssignment({
  qualifyingParticipantId,
  tournamentRecord,
  drawDefinition,
  drawPosition,
  structureId,
}) {
  return positionParticipantAction({
    positionActionName: 'qualifierDrawPositionAssignment',
    participantId: qualifyingParticipantId,
    isQualifierPoasition: true,
    tournamentRecord,
    drawDefinition,
    drawPosition,
    structureId,
  });
}
