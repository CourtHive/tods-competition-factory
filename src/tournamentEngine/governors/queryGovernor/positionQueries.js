import { positionActions as drawEnginePositionActions } from '../../../drawEngine/governors/queryGovernor/positionActions/positionActions';

export function positionActions({
  tournamentRecord,
  drawDefinition,
  drawPosition,
  structureId,
  drawId,
}) {
  const tournamentParticipants = tournamentRecord.participants || [];
  return drawEnginePositionActions({
    tournamentParticipants,
    drawDefinition,
    drawPosition,
    structureId,
    drawId,
  });
}
